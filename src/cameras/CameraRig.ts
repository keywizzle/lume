// TODO the interaction in here can be separated into a DragFling class, then
// this class can apply DragFling to X and Y rotations. We can use DragFling for
// implementing a scrollable area.

import {createEffect, onCleanup, untrack} from 'solid-js'
import html from 'solid-js/html'
import {element, numberAttribute, autorun, booleanAttribute, StopFunction, reactive} from '@lume/element'
import {autoDefineElements} from '../LumeConfig.js'
import {Element3D, Element3DAttributes} from '../core/Element3D.js'
import {FlingRotation, ScrollFling, PinchFling} from '../interaction/index.js'

import type {PerspectiveCamera} from './PerspectiveCamera.js'

export type CameraRigAttributes =
	| Element3DAttributes
	| 'initialPolarAngle'
	| 'minPolarAngle'
	| 'maxPolarAngle'
	| 'initialDistance'
	| 'minDistance'
	| 'maxDistance'
	| 'active'
	| 'dollySpeed'
	| 'interactive'
	| 'dynamicDolly'
	| 'rotationSpeed'
	| 'dynamicRotation'

// TODO allow overriding the camera props, and make the default camera overridable via <slot>

/**
 * @class CameraRig
 *
 * Element: `<lume-camera-rig>`
 *
 * The [`<lume-camera-rig>`](./CameraRig) element is much like a real-life
 * camera rig that contains a camera on it: it has controls to allow the user to
 * rotate and dolly the camera around in physical space more easily, in a
 * particular and specific. In the following example, try draging to rotate,
 * scrolling to zoom:
 *
 * <div id="cameraRigExample"></div>
 *
 * ## Slots
 *
 * - default (no name): Allows children of the camera rig to render as children
 * of the camera rig, like with elements that don't have a ShadowDOM.
 * - `camera-child`: Allows children of the camera rig to render relative to the
 * camera rig's underlying camera.
 */
@element('lume-camera-rig', autoDefineElements)
export class CameraRig extends Element3D {
	/**
	 * @property {true} hasShadow
	 *
	 * *override* *readonly*
	 *
	 * This is `true` because this element has a `ShadowRoot` with the mentioned
	 * [`slots`](#slots).
	 */
	override readonly hasShadow: true = true

	/**
	 * @property {number} initialPolarAngle
	 *
	 * *attribute*
	 *
	 * Default: `0`
	 *
	 * The initial vertical rotation of the camera. When the user drags up or
	 * down, the camera will move up and down as it rotates around the center.
	 * The camera is always looking at the center.
	 */
	@numberAttribute(0) initialPolarAngle = 0

	/**
	 * @property {number} minPolarAngle
	 *
	 * *attribute*
	 *
	 * Default: `-90`
	 *
	 * The lowest angle that the camera will rotate vertically.
	 */
	@numberAttribute(-90) minPolarAngle = -90

	/**
	 * @property {number} maxPolarAngle
	 *
	 * *attribute*
	 *
	 * Default: `90`
	 *
	 * The highest angle that the camera will rotate vertically.
	 *
	 * <div id="verticalRotationExample"></div>
	 *
	 * <script>
	 *   new Vue({
	 *     el: '#cameraRigExample',
	 *     template: '<live-code :template="code" mode="html>iframe" :debounce="200" />',
	 *     data: { code: cameraRigExample },
	 *   })
	 *   new Vue({
	 *     el: '#verticalRotationExample',
	 *     template: '<live-code :template="code" mode="html>iframe" :debounce="200" />',
	 *     data: { code: cameraRigVerticalRotationExample },
	 *   })
	 * </script>
	 */
	@numberAttribute(90) maxPolarAngle = 90

	/**
	 * @property {number} minHorizontalAngle
	 *
	 * *attribute*
	 *
	 * Default: `-Infinity`
	 *
	 * The smallest angle that the camera will be allowed to rotate to
	 * horizontally. The default of `-Infinity` means the camera will rotate
	 * laterally around the focus point indefinitely.
	 */
	@numberAttribute(-Infinity) minHorizontalAngle = -Infinity

	/**
	 * @property {number} maxHorizontalAngle
	 *
	 * *attribute*
	 *
	 * Default: `Infinity`
	 *
	 * The largest angle that the camera will be allowed to rotate to
	 * horizontally. The default of `Infinity` means the camera will rotate
	 * laterally around the focus point indefinitely.
	 */
	@numberAttribute(Infinity) maxHorizontalAngle = Infinity

	/**
	 * @property {number} initialDistance
	 *
	 * *attribute*
	 *
	 * Default: `1000`
	 *
	 * The initial distance that the camera will be away from the center point.
	 * When the performing a scroll gesture, the camera will zoom by moving
	 * towards or away from the center point (i.e. dollying).
	 */
	@numberAttribute(1000) initialDistance = 1000

	/**
	 * @property {number} minDistance
	 *
	 * *attribute*
	 *
	 * Default: `200`
	 *
	 * The smallest distance the camera can get to the center point when zooming
	 * by scrolling.
	 */
	@numberAttribute(200) minDistance = 200

	/**
	 * @property {number} maxDistance
	 *
	 * *attribute*
	 *
	 * Default: `2000`
	 *
	 * The largest distance the camera can get from the center point when
	 * zooming by scrolling.
	 */
	@numberAttribute(2000) maxDistance = 2000

	/**
	 * @property {boolean} active
	 *
	 * *attribute*
	 *
	 * Default: `true`
	 *
	 * When `true`, the underlying camera is set to [`active`](./PerspectiveCamera#active).
	 */
	@booleanAttribute(true) active = true

	/**
	 * @property {number} dollySpeed
	 *
	 * *attribute*
	 *
	 * Default: `1`
	 */
	@numberAttribute(1) dollySpeed = 1

	/**
	 * @property {boolean} interactive
	 *
	 * *attribute*
	 *
	 * When `false`, user interaction (ability to zoom or rotate the camera) is
	 * disabled, but the camera rig can still be manipulated programmatically.
	 */
	@booleanAttribute(true) interactive = true

	/**
	 * @property {number} rotationSpeed
	 *
	 * *attribute*
	 *
	 * Default: `0.2`
	 *
	 * How much the camera rotates when the user clicks and drags, in degrees
	 * per pixel.
	 */
	@numberAttribute(0.2) rotationSpeed = 0.2

	/**
	 * @property {boolean} dynamicDolly
	 *
	 * *attribute*
	 *
	 * When `true`, dolly speed is limited based on how close the camera's
	 * position is to `minDistance`. Zooming in effectively lowers the
	 * dolly speed, while zooming out effectively raises it.
	 */
	@booleanAttribute(false) dynamicDolly = false

	/**
	 * @property {boolean} dynamicRotation
	 *
	 * *attribute*
	 *
	 * When `true`, rotation sensitivity is limited based on how close the camera's
	 * position is to `minDistance`. Zooming in effectively lowers the
	 * sensitivity, while zooming out effectively raises it.
	 */
	@booleanAttribute(false) dynamicRotation = false

	@reactive cam?: PerspectiveCamera

	@reactive rotationYTarget?: Element3D

	override template = () => html`
		<lume-element3d
			id="cameraY"
			size="1 1 1"
			ref=${(el: Element3D) => (this.rotationYTarget = el)}
			size-mode="proportional proportional proportional"
		>
			<lume-element3d
				id="cameraX"
				size="1 1 1"
				rotation=${() => untrack(() => [this.initialPolarAngle, 0, 0])}
				size-mode="proportional proportional proportional"
			>
				<slot
					name="camera"
					TODO="determine semantics for overriding the internal camera (this slot is not documented yet)"
				>
					<lume-perspective-camera
						ref=${(cam: PerspectiveCamera) => (this.cam = cam)}
						active=${() => this.active}
						position=${[0, 0, this.initialDistance]}
						align-point="0.5 0.5 0.5"
						far="10000"
					>
						<slot name="camera-child"></slot>
					</lume-perspective-camera>
				</slot>
			</lume-element3d>
		</lume-element3d>

		<slot></slot>
	`

	@reactive flingRotation: FlingRotation | null = null
	@reactive scrollFling: ScrollFling | null = null
	@reactive pinchFling: PinchFling | null = null

	autorunStoppers?: StopFunction[]

	#startedInteraction = false

	startInteraction() {
		if (this.#startedInteraction) return
		this.#startedInteraction = true

		this.autorunStoppers = []

		this.autorunStoppers.push(
			autorun(() => {
				if (!(this.scene && this.rotationYTarget)) return

				const flingRotation = (this.flingRotation = new FlingRotation({
					interactionInitiator: this.scene,
					rotationYTarget: this.rotationYTarget,
					factor: this.rotationSpeed,
					minFlingRotationX: this.minPolarAngle,
					maxFlingRotationX: this.maxPolarAngle,
					minFlingRotationY: this.minHorizontalAngle,
					maxFlingRotationY: this.maxHorizontalAngle,
				}).start())

				createEffect(() => {
					if (this.interactive && !this.pinchFling?.interacting) flingRotation.start()
					else flingRotation.stop()
				})

				createEffect(() => {
					const cam = this.cam
					if (!cam || !this.dynamicRotation) return

					const sens =
						(this.rotationSpeed * 5 * 180 * (cam.position.z - this.minDistance)) /
						(this.scene!.perspective * 2 * this.minDistance)

					// Don't let the sensitivity reach 0 (ie `cam.position.z` reaches `minDistance`)
					flingRotation.factor = sens < 0.0001 ? 0.0001 : sens
				})

				onCleanup(() => flingRotation?.stop())
			}),
			autorun(() => {
				if (!this.scene) return

				const scrollFling = (this.scrollFling = new ScrollFling({
					target: this.scene,
					y: this.initialDistance,
					minY: this.minDistance,
					maxY: this.maxDistance,
					scrollFactor: this.dollySpeed,
				}).start())

				const pinchFling = (this.pinchFling = new PinchFling({
					target: this.scene,
					x: this.initialDistance,
					minX: this.minDistance,
					maxX: this.maxDistance,
					factor: this.dollySpeed,
				}).start())

				createEffect(() => {
					const cam = this.cam
					if (!cam) return

					untrack(() => cam.position).z = scrollFling.y

					if (!this.dynamicDolly) return

					scrollFling.scrollFactor =
						this.dollySpeed * ((scrollFling!.y - this.minDistance + 0.001) / (this.maxDistance - this.minDistance))
				})

				createEffect(() => {
					const cam = this.cam
					if (!cam) return

					untrack(() => cam.position).z = pinchFling.x

					if (!this.dynamicDolly) return

					pinchFling.factor =
						this.dollySpeed * ((pinchFling.x - this.minDistance + 0.001) / (this.maxDistance - this.minDistance))
				})

				createEffect(() => {
					if (this.interactive) {
						scrollFling.start()
						pinchFling.start()
					} else {
						scrollFling.stop()
						pinchFling.stop()
					}
				})

				onCleanup(() => {
					scrollFling.stop()
					pinchFling.stop()
				})
			}),
		)
	}

	stopInteraction() {
		if (!this.#startedInteraction) return
		this.#startedInteraction = false

		if (this.autorunStoppers) for (const stop of this.autorunStoppers) stop()
	}

	override _loadGL(): boolean {
		if (!super._loadGL()) return false
		this.startInteraction()
		return true
	}

	override _loadCSS(): boolean {
		if (!super._loadCSS()) return false
		this.startInteraction()
		return true
	}

	override _unloadGL(): boolean {
		if (!super._unloadGL()) return false
		if (!this.glLoaded && !this.cssLoaded) this.stopInteraction()
		return true
	}

	override _unloadCSS(): boolean {
		if (!super._unloadCSS()) return false
		if (!this.glLoaded && !this.cssLoaded) this.stopInteraction()
		return true
	}

	override disconnectedCallback() {
		super.disconnectedCallback()
		this.stopInteraction()
	}
}

import type {ElementAttributes} from '@lume/element'

declare module '@lume/element' {
	namespace JSX {
		interface IntrinsicElements {
			'lume-camera-rig': ElementAttributes<CameraRig, CameraRigAttributes>
		}
	}
}

declare global {
	interface HTMLElementTagNameMap {
		'lume-camera-rig': CameraRig
	}
}
