/**
 * This Source Code is licensed under the MIT license. If a copy of the
 * MIT-license was not distributed with this file, You can obtain one at:
 * http://opensource.org/licenses/mit-license.html.
 *
 * @author: Hein Rutjes (IjzerenHein) and Joe Pea (trusktr)
 * @license MIT
 * @copyright Gloey Apps, 2015
 * @copyright Joe Pea, 2018
 *
 * Forked and converted to LUME from
 * https://github.com/IjzerenHein/famous-autolayout. Thanks @IjzerenHein for the
 * initial work!
 */

// TODO:
// - Make an <lume-visual-format> element that can contain visual format code to
// re-use in multiple layouts. Or perhaps wait until CSS support and make it a CSS prop.
// - Allow visual-format to be fetched by path (like img src attribute).

import {createMemo, createSignal, For, Show} from 'solid-js'
import AutoLayout from '@lume/autolayout/es/AutoLayout.js'
import {attribute, autorun, element} from '@lume/element'
import {html} from '@lume/element/dist/html.js'
import {Node, NodeAttributes} from '../core/Node.js'
import {Motor, RenderTask} from '../core/Motor.js'
import {autoDefineElements} from '../LumeConfig.js'

export {AutoLayout}

type LayoutOptions = Partial<{
	spacing: number | number[]

	// TODO remove
	[k: string]: unknown
}>

export type AutolayoutAttributes = NodeAttributes | 'visualFormat'

/**
 * A Node that lays children out based on an Apple AutoLayout VFL layout
 * description.
 */
@element('lume-autolayout', autoDefineElements)
export class Autolayout extends Node {
	static DEFAULT_PARSE_OPTIONS = {
		extended: true,
		strict: false,
	}

	override hasShadow = true

	#newRoot: Node | null = null

	// Override the root so that `template`'s `For` iteration will not be messed
	// up by injected style sheets displacing position of elements, which the
	// algo depends on.
	override get root() {
		if (this.#newRoot) return this.#newRoot
		const root = super.root
		const node = html`
			<lume-node size="1 1" size-mode="proportional proportional" class="layoutRoot"></lume-node>
		` as Node
		root.appendChild(node)
		this.#newRoot = node
		return node
	}

	@attribute visualFormat: string | null = ''

	/* (WIP, not documented)
	 *
	 * Sets the options such as viewport, spacing, etc...
	 *
	 * @param {Object} options Layout-options to set.
	 * @return {Autolayout} this
	 */
	// TODO replace options with reactive props/attributes
	set layoutOptions(options: LayoutOptions) {
		this.#layoutOptions[1](options || {})
	}
	get layoutOptions(): LayoutOptions {
		return this.#layoutOptions[0]()
	}

	#autoLayoutView?: any | undefined

	// TODO use classy-solid decorators
	readonly #subviewNames = createSignal<string[]>([], {equals: false})
	readonly #subviews = createSignal<{[name: string]: any}>({}, {equals: false})

	// TODO split options into individual attributes
	readonly #layoutOptions = createSignal<LayoutOptions>({}, {equals: false})

	#metaInfo?: any

	// prettier-ignore
	// (Solid html template bug when prettier formats the template, https://github.com/ryansolid/dom-expressions/issues/156)
	override template = () => {
		const [subviews] = this.#subviews
		const [subviewNames] = this.#subviewNames

		return html`
			<${For} each=${() => subviewNames()}>
				${(name: string) => {
					const subview = createMemo(() => subviews()[name], null, {equals: false})

					return html`
						<${Show} when=${() => subview() && subview().type !== 'stack'}>
							<lume-node
								id=${name}
								class="layoutItem"
								size=${() => [subview().width, subview().height]}
								position=${() => [subview().left, subview().top, subview().zIndex * 5]}
							>
								<slot name=${name}></slot>
							</lume-node>
						</>
					`
				}}
			</>
			<slot></slot>
		`
	}

	static override css =
		Node.css +
		/*css*/ `
			:host,
			.layoutRoot,
			.layoutItem {
				pointer-events: none;
			}

			/* TODO update to Cascade Layers to avoid !important hack */
			.layoutItem > * {
				pointer-events: auto !important;
			}
		`

	override connectedCallback() {
		super.connectedCallback()

		// TODO make this cleaner with deferred-batched effect API and remove this.#queue,
		// something like createAnimationFrameEffect or createRenderTaskEffect.

		this._stopFns.push(
			autorun(() => {
				this.visualFormat
				this.#queue(this.#newLayout)
			}),

			autorun(() => {
				this.calculatedSize
				this.layoutOptions
				this.#queue(this.#updateLayout)
			}),
		)
	}

	#queue(fn: RenderTask) {
		Motor.once(fn, false)
	}

	// TODO parse options as prop/attribute
	#newLayout = (/*parseOptions?: object*/) => {
		// this work should be deferred-batched too.
		const visualFormat = this.visualFormat
		const constraints = AutoLayout.VisualFormat.parse(
			visualFormat,
			/*parseOptions ||*/ Autolayout.DEFAULT_PARSE_OPTIONS,
		)
		this.#metaInfo = AutoLayout.VisualFormat.parseMetaInfo(visualFormat)
		this.#autoLayoutView = new AutoLayout.View({constraints})

		// triggers the template
		this.#subviewNames[1](Object.keys(this.#autoLayoutView.subViews))
	}

	#updateLayout = () => {
		if (!this.#autoLayoutView) return

		const size = this.calculatedSize // dependency

		// dependency
		if (this.layoutOptions.spacing || this.#metaInfo.spacing)
			this.#autoLayoutView.setSpacing(this.layoutOptions.spacing || this.#metaInfo.spacing)

		this.#autoLayoutView.setSize(size.x, size.y)

		// triggers the template
		this.#subviews[1](this.#autoLayoutView.subViews)
	}
}

import type {ElementAttributes} from '@lume/element'

declare module '@lume/element' {
	namespace JSX {
		interface IntrinsicElements {
			'lume-autolayout': ElementAttributes<Autolayout, AutolayoutAttributes>
		}
	}
}

declare global {
	interface HTMLElementTagNameMap {
		'lume-autolayout': Autolayout
	}
}
