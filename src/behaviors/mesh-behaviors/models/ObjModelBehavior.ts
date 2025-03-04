import 'element-behaviors'
import {reactive, stringAttribute} from '../../attribute.js'
import {disposeObjectTree, setRandomColorPhongMaterial, isRenderItem} from '../../../utils/three.js'
import {OBJLoader} from '../../../lib/three/examples/jsm/loaders/OBJLoader.js'
import {MTLLoader} from '../../../lib/three/examples/jsm/loaders/MTLLoader.js'
import {Events} from '../../../core/Events.js'
import {RenderableBehavior} from '../../RenderableBehavior.js'

import type {Object3D} from 'three/src/core/Object3D.js'
import type {MaterialBehavior} from '../materials/MaterialBehavior.js'
import type {Group} from 'three/src/objects/Group.js'
import type {ElementBehaviors} from 'element-behaviors'

// TODO move this somewhere better, perhaps element-behaviors
declare global {
	interface Element extends ElementBehaviors {}
}

export type ObjModelBehaviorAttributes = 'obj' | 'mtl'

@reactive
export class ObjModelBehavior extends RenderableBehavior {
	@stringAttribute('') obj = ''
	@stringAttribute('') mtl = ''

	model?: Group
	objLoader?: OBJLoader
	mtlLoader?: MTLLoader

	// This is incremented any time we need a pending load() to cancel (f.e. on
	// src change, or unloadGL cycle), so that the loader will ignore the
	// result when a version change has happened.
	#version = 0

	override loadGL() {
		this.objLoader = new OBJLoader() // TODO types for loaders
		this.mtlLoader = new MTLLoader(this.objLoader.manager)
		// Allow cross-origin images to be loaded.
		this.mtlLoader.crossOrigin = ''

		this.objLoader.manager.onLoad = () => {
			this.element.needsUpdate()
		}

		let firstRun = true

		this.createEffect(() => {
			this.mtl
			this.obj

			if (!firstRun) this.#cleanupModel()

			this.#version++
			// TODO We can update only the material or model specifically
			// instead of reloading the whole object.
			this.#loadModel()
		})

		firstRun = false
	}

	override unloadGL() {
		this.#cleanupModel()

		// Increment this in case the loader is still loading, so it will ignore the result.
		this.#version++
	}

	#materialIsFromMaterialBehavior = false

	#cleanupModel() {
		if (this.model) {
			disposeObjectTree(this.model, {
				destroyMaterial: !this.#materialIsFromMaterialBehavior,
			})
		}

		this.#materialIsFromMaterialBehavior = false

		this.model = undefined
	}

	#loadModel() {
		const {obj, mtl, mtlLoader, objLoader} = this
		const version = this.#version

		if (!obj) return

		if (mtl) {
			mtlLoader!.setResourcePath(mtl.substr(0, mtl.lastIndexOf('/') + 1))

			console.log('load mtl')
			mtlLoader!.load(mtl, materials => {
				if (version !== this.#version) return

				console.log('loaded mtl:', materials)

				materials.preload()

				objLoader!.setMaterials(materials)
				this.#loadObj(version, true)
			})
		} else {
			this.#loadObj(version, false)
		}
	}

	#loadObj(version: number, hasMtl: boolean) {
		this.objLoader!.load(
			this.obj,
			model => version == this.#version && this.#setModel(model, hasMtl),
			progress => version === this.#version && this.element.emit(Events.PROGRESS, progress),
			error => version === this.#version && this.#onError(error),
		)
	}

	#onError(error: ErrorEvent) {
		const message = `Failed to load ${this.element.tagName.toLowerCase()} with obj value "${this.obj}" and mtl value "${
			this.mtl
		}". See the following error.`
		console.warn(message)
		const err = error instanceof ErrorEvent && error.error ? error.error : error
		console.error(err)
		this.element.emit(Events.MODEL_ERROR, err)
	}

	#setModel(model: Group, hasMtl: boolean) {
		// If the OBJ model does not have an MTL, then use the material behavior if any.
		if (!hasMtl) {
			// TODO Simplify this by getting based on type.
			let materialBehavior = this.element.behaviors.get('basic-material') as MaterialBehavior
			if (!materialBehavior) materialBehavior = this.element.behaviors.get('phong-material') as MaterialBehavior
			if (!materialBehavior) materialBehavior = this.element.behaviors.get('standard-material') as MaterialBehavior
			if (!materialBehavior) materialBehavior = this.element.behaviors.get('lambert-material') as MaterialBehavior

			if (materialBehavior) {
				this.#materialIsFromMaterialBehavior = true

				// TODO this part only works on Mesh elements at the
				// moment. We will update the geometry and material
				// behaviors to work in tandem with or without a mesh
				// behavior, and other behaviors can use the geometry or
				// material features.
				model.traverse((child: Object3D) => {
					console.log('isRenderItem?', isRenderItem(child))
					if (isRenderItem(child)) {
						child.material = materialBehavior.meshComponent || thro(new Error('Expected a material'))
					}
				})
			} else {
				console.log('Set random material')
				// if no material, make a default one with random color
				setRandomColorPhongMaterial(model)
			}
		}

		this.model = model
		this.element.three.add(model)
		this.element.emit(Events.MODEL_LOAD, {format: 'obj', model})
		this.element.needsUpdate()
	}
}

if (globalThis.window?.document && !elementBehaviors.has('obj-model'))
	elementBehaviors.define('obj-model', ObjModelBehavior)

const thro = (err: any) => {
	throw err
}
