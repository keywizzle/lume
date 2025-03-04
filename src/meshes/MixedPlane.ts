import {element} from '@lume/element'
import {Mesh, MeshAttributes} from './Mesh.js'
import {autoDefineElements} from '../LumeConfig.js'

// TODO We need attributes from behaviors too.
export type MixedPlaneAttributes = MeshAttributes

/**
 * @class MixedPlane -
 *
 * Element: `<lume-mixed-plane>`
 *
 * This element is useful for rendering regular DOM content (`<div>`, `<img>`,
 * etc) mixed with WebGL content. Any regular DOM content placed as children of
 * this element will be visible in the 3D scene and can be occluded by 3D
 * elements as well as occlude other 3D elements.
 *
 * For best results, set the background of the DOM content to a solid color,
 * take up 100% width and height of the lume-mixed-plane element, and don't use
 * border radius (for now), otherwise transparent parts of the regular DOM
 * content will not receal 3D content that would be expected to be behind them.
 *
 * See [`MixedPlaneGeometryBehavior`](../behaviors/mesh-behaviors/geometries/MixedPlaneGeometryBehavior) and [`MixedPlaneMaterialBehavior`](../behaviors/mesh-behaviors/materials/MixedPlaneMaterialBehavior) for
 * available properties.
 *
 * <div id="mixedPlaneExample"></div>
 *
 * <script type="application/javascript">
 *   new Vue({ el: '#mixedPlaneExample', data: { code: buttonsWithShadowExample }, template: '<live-code :template="code" mode="html>iframe" :debounce="200" />' })
 * </script>
 *
 * @extends Mesh
 */
@element('lume-mixed-plane', autoDefineElements)
export class MixedPlane extends Mesh {
	static override defaultBehaviors = {
		'mixedplane-geometry': (initialBehaviors: any) => {
			return !initialBehaviors.some((b: any) => b.endsWith('-geometry'))
		},
		'mixedplane-material': (initialBehaviors: any) => {
			return !initialBehaviors.some((b: any) => b.endsWith('-material'))
		},
	}

	/**
	 * @property {true} isMixedPlane - An always-`true` property signaling that
	 * this element is a `MixedPlane`. Useful for duck typing, especially in
	 * plain JavaScript as opposed to TypeScript.
	 */
	get isMixedPlane() {
		return true
	}
}

declare module '@lume/element' {
	namespace JSX {
		interface IntrinsicElements {
			'lume-mixed-plane': JSX.IntrinsicElements['lume-mesh']
		}
	}
}

declare global {
	interface HTMLElementTagNameMap {
		'lume-mixed-plane': MixedPlane
	}
}
