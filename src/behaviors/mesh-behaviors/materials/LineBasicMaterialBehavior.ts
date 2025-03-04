import {reactive, stringAttribute} from '../../attribute.js'
import 'element-behaviors'
import {LineBasicMaterial} from 'three/src/materials/LineBasicMaterial.js'
import {MaterialBehavior, MaterialBehaviorAttributes} from './MaterialBehavior.js'

export type LineBasicMaterialBehaviorAttributes = MaterialBehaviorAttributes | 'texture'

/**
@class LineBasicMaterialBehavior -

Behavior: `line-material`

This is the default material behavior for
[`<lume-line>`](../../../meshes/Line.md) elements. It renders a series of
points as a simple colored line, optionally with a texture for coloring. It is
backed by Three.js `LineBasicMaterial` underneath. This is typically paired with
[`LineGeometryBehavior`](../geometries/LineGeometryBehavior.md).

<div id="exampleContainer"></div>
<script>
  new Vue({
    el: '#exampleContainer',
    template: '<live-code class="full" :template="code" :autorun="true" mode="html>iframe" />',
    data: { code: lineExample },
  })
</script>

@extends MaterialBehavior
*/
@reactive
export class LineBasicMaterialBehavior extends MaterialBehavior {
	/**
	 * @property {string} texture - A texture to set color along the line.
	 * Useful when supplying UVs to the geometry being used along with this
	 * material. Most likely you'll supply UVs by copying data from a modeling
	 * program like Blender, probably not something you'd program manually.
	 */
	@stringAttribute('') texture = ''

	override _createComponent() {
		return new LineBasicMaterial()
	}

	override loadGL() {
		super.loadGL()

		this._handleTexture(
			() => this.texture,
			(mat, tex) => (mat.map = tex),
			mat => !!mat.map,
		)
	}
}

if (globalThis.window?.document && !elementBehaviors.has('line-material'))
	elementBehaviors.define('line-material', LineBasicMaterialBehavior)
