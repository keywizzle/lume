import 'element-behaviors'
import {createEffect, createMemo, onCleanup, untrack} from 'solid-js'
import {reactive, attribute, booleanAttribute, stringAttribute} from '../../attribute.js'
import {Scene} from 'three/src/scenes/Scene.js'
import {DRACOLoader} from '../../../lib/three/examples/jsm/loaders/DRACOLoader.js'
import {GLTFLoader, GLTF} from '../../../lib/three/examples/jsm/loaders/GLTFLoader.js'
import {Box3} from 'three/src/math/Box3.js'
import {Vector3} from 'three/src/math/Vector3.js'
import {disposeObjectTree} from '../../../utils/three.js'
import {Events} from '../../../core/Events.js'
import {RenderableBehavior} from '../../RenderableBehavior.js'

/**
 * The recommended CDN for retrieving Draco decoder files.
 * More info: https://github.com/google/draco#wasm-and-javascript-decoders
 */
const defaultDracoDecoder = 'https://www.gstatic.com/draco/v1/decoders/'

/** One DRACOLoader per draco decoder URL. */
let dracoLoaders = new Map<string, {count: number; dracoLoader: DRACOLoader}>()

export type GltfModelBehaviorAttributes = 'src' | 'dracoDecoder' | 'centerGeometry'

@reactive
export class GltfModelBehavior extends RenderableBehavior {
	/** @property {string | null} src - Path to a `.gltf` or `.glb` file. */
	@attribute src: string | null = ''

	/**
	 * @attribute
	 * @property {string | null} dracoDecoder - Path to the draco decoder that
	 * will unpack decode compressed assets of the GLTF file. This does not need
	 * to be supplied unless you explicitly know you need it.
	 */
	@stringAttribute(defaultDracoDecoder) dracoDecoder = defaultDracoDecoder

	/**
	 * @attribute
	 * @property {boolean} centerGeometry - When `true`, all geometry of the
	 * loaded model will be centered at the local origin.
	 */
	@booleanAttribute(false) centerGeometry = false

	gltfLoader?: GLTFLoader
	model: GLTF | null = null

	// This is incremented any time we need a pending load() to cancel (f.e. on
	// src change, or unloadGL cycle), so that the loader will ignore the
	// result when a version change has happened.
	#version = 0

	override loadGL() {
		this.gltfLoader = new GLTFLoader()

		// Using a top level effect here as a createRoot (avoids console
		// warnings with memos).
		this.createEffect(() => {
			const decoderPath = createMemo(() => this.dracoDecoder)

			createEffect(() => {
				if (!decoderPath()) return

				const dracoLoader = getDracoLoader(decoderPath())
				this.gltfLoader!.dracoLoader = dracoLoader

				onCleanup(() => {
					disposeDracoLoader(decoderPath())
					this.gltfLoader!.dracoLoader = null
				})
			})

			// Use memos to avoid effect re-runs triggered by same-value
			// changes, or else models may be loaded multiple times (expensive).
			const gltfPath = createMemo(() => this.src)
			const center = createMemo(() => this.centerGeometry)

			createEffect(() => {
				gltfPath()
				decoderPath()
				center()

				this.#version++
				untrack(() => this.#loadModel())

				onCleanup(() => this.#cleanupModel())
			})
		})
	}

	override unloadGL() {
		this.gltfLoader = undefined

		// Increment this in case the loader is still loading, so it will ignore the result.
		this.#version++
	}

	#cleanupModel() {
		if (this.model) disposeObjectTree(this.model.scene)
		this.model = null
	}

	#loadModel() {
		const {src} = this
		const version = this.#version

		if (!src) return

		// In the following gltfLoader.load() callbacks, if #version doesn't
		// match, it means this.src or this.dracoDecoder changed while
		// a previous model was loading, in which case we ignore that
		// result and wait for the next model to load.

		this.gltfLoader!.load(
			src,
			model => version == this.#version && this.#setModel(model),
			progress => version == this.#version && this.element.emit(Events.PROGRESS, progress),
			error => version == this.#version && this.#onError(error),
		)
	}

	#onError(error: ErrorEvent | Error) {
		const message = `Failed to load ${this.element.tagName.toLowerCase()} with src "${this.src}" and dracoDecoder "${
			this.dracoDecoder
		}". See the following error.`
		console.warn(message)
		const err = error instanceof ErrorEvent && error.error ? error.error : error
		console.error(err)
		this.element.emit(Events.MODEL_ERROR, err)
	}

	#setModel(model: GLTF) {
		this.model = model
		model.scene = model.scene || new Scene().add(...model.scenes)

		if (this.centerGeometry) {
			const box = new Box3()
			box.setFromObject(model.scene)
			const center = new Vector3()
			box.getCenter(center)
			model.scene.position.copy(center.negate())
		}

		this.element.three.add(model.scene)
		this.element.emit(Events.MODEL_LOAD, {format: 'gltf', model})
		this.element.needsUpdate()
	}
}

if (globalThis.window?.document && !elementBehaviors.has('gltf-model'))
	elementBehaviors.define('gltf-model', GltfModelBehavior)

function getDracoLoader(url: string) {
	let dracoLoader: DRACOLoader

	if (!dracoLoaders.has(url)) {
		dracoLoader = new DRACOLoader()
		dracoLoader.setDecoderPath(url)
		dracoLoaders.set(url, {count: 1, dracoLoader})
	} else {
		const ref = dracoLoaders.get(url)!
		ref.count++
		dracoLoader = ref.dracoLoader
	}

	return dracoLoader
}

function disposeDracoLoader(url: string) {
	if (!dracoLoaders.has(url)) return

	const ref = dracoLoaders.get(url)!
	ref.count--
	if (!ref.count) {
		ref.dracoLoader.dispose()
		dracoLoaders.delete(url)
	}
}
