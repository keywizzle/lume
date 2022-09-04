import {element} from '@lume/element'
import {html} from '@lume/variable/dist/html.js'
import {Node, NodeAttributes} from '../core/Node.js'
import {autoDefineElements} from '../LumeConfig.js'
import {Motor} from '../core/Motor.js'
import {Tween, Group, Easing} from '@tweenjs/tween.js'

import type {ElementAttributes} from '@lume/element'

type SlideoutAttributes = NodeAttributes

@element('lume-slideout', autoDefineElements)
export class Slideout extends Node {
	override hasShadow = true

	// refs
	menu?: Node
	invisibleGrip?: Node
	menuHint?: Node
	content?: Node
	fadeEffect?: Node

	menuIsClosing = false
	menuIsOpening = false
	menuPosition = 0

	override template = () => {
		return html`
			<lume-node id="layoutRoot" size-mode="proportional, proportional, literal" size="1, 1, 0">
				<lume-node
					id="menu"
					ref=${(el: Node) => (this.menu = el)}
					size-mode="literal, proportional, literal"
					size="230, 1, 0"
					position="-230, 0, 5"
				>
					<lume-node
						id="invisibleGrip"
						ref=${(el: Node) => (this.invisibleGrip = el)}
						size-mode="literal, proportional, literal"
						size="50, 1, 0"
						position="225, 0, 0"
					></lume-node>

					<lume-node
						id="menuHint"
						ref=${(el: Node) => (this.menuHint = el)}
						size="10, 20, 0"
						align-point="1, 0.5, 0"
						mount-point="0, 0.5, 0"
					>
						<div class="triangle"></div>
					</lume-node>

					<slot name="slideout"></slot>

					<menu id="menu">
						<li class="menuitem" style="color: cyan">Joe Pea</li>
					</menu>
				</lume-node>

				<lume-node
					id="content"
					ref=${(el: Node) => (this.content = el)}
					size-mode="proportional, proportional, literal"
					size="1, 1, 0"
					position="0, 0, -200"
				>
					<slot name="content"></slot>
				</lume-node>

				<lume-node
					id="fadeEffect"
					ref=${(el: Node) => (this.fadeEffect = el)}
					size-mode="proportional, proportional, literal"
					size="1, 1, 0"
					position="0, 0, -0.9"
					position-note="slightly above the content"
					opacity="0.0"
				></lume-node>
			</lume-node>
		`
	}

	static override css =
		Node.css +
		/*css*/ `
			:host,
			#layoutRoot,
			#menu,
			#content {
				pointer-events: none;
			}

			/* TODO update to Cascade Layers to avoid !important hack */
			#menu > * {
				pointer-events: auto !important;
			}

			/* TODO update to Cascade Layers to avoid !important hack */
			#content > * {
				pointer-events: auto !important;
			}

			.triangle {
				position: absolute;
				top: -2px;
				width: 0;
				height: 0;
				border-top: 12px solid transparent;
				border-bottom: 12px solid transparent;
				border-left: 12px solid #1DD326; /*green*/
			}

			#content {
				/*
				This should not be needed, but it is a
				workaround for this Chrome bug:
				https://bugs.chromium.org/p/chromium/issues/detail?id=1114514.
				Note, we should not place any child nodes on
				this node, because overflow: hidden will
				break the 3D space (flattens transforms).
				*/
				overflow: hidden;
			}

			#fadeEffect {
				background: #333;
				pointer-events: none;
			}
		`

	// TODO currently this element only works with CSS enabled, for the user events.

	override _loadCSS() {
		if (!super._loadCSS()) return false

		// const menu = this.menu
		// const content = this.content
		// const scene = this.scene

		// await Promise.all([menu.mountPromise, content.mountPromise, scene.mountPromise])

		// push menu specific
		this.initMouseEvents()
		this.initTouchEvents()

		// this.startHintAnimation()

		return true
	}

	hintTween: StatusTween<any> | null = null

	initMouseEvents() {
		const menu = this.menu
		const menuHint = this.menuHint

		let hintStopped = false

		menu!.addEventListener('mouseenter', _event => {
			if (!hintStopped) {
				hintStopped = true
				this.hintTween?.stop()
				menuHint!.position.x = 4
			}

			this.openMenu()
		})
		menu!.addEventListener('mouseleave', _event => {
			this.closeMenu()
		})
	}

	initTouchEvents() {
		const menu = this.menu
		const menuHint = this.menuHint

		let hintStopped = false

		// TODO
		// let direction = 1 // opening

		let lastX = 0
		let delta = 0
		let dragX = 0

		menu!.addEventListener('touchstart', event => {
			const touches = event.touches

			if (touches.length === 1) {
				if (!hintStopped) {
					hintStopped = true
					this.hintTween?.stop()
					menuHint!.position.x = 4
				}

				if (this.menuTween) this.menuTween.stop()

				lastX = touches[0].screenX
				dragX = this.menuPosition
			}
		})
		menu!.addEventListener('touchmove', event => {
			const touches = event.touches

			if (touches.length === 1) {
				const touch = touches[0]

				delta = touch.screenX - lastX
				dragX += delta / 230

				this.updateMenuPosition(dragX)

				lastX = touch.screenX
			}
		})
		menu!.addEventListener('touchend', event => {
			const touches = event.changedTouches

			if (touches.length === 1) {
				if (delta > 0) {
					this.openMenu()
				} else if (delta < 0) {
					this.closeMenu()
				} else {
					if (this.menuPosition >= 0.5) this.openMenu()
					else this.closeMenu()
				}
			}
		})
	}

	startHintAnimation() {
		// const menuHint = this.menuHint

		this.hintTween = new StatusTween(this.menuHint!.position)
			.to({x: 5}, 1000)
			.yoyo(true)
			.repeat(Infinity)
			.easing(Easing.Quintic.Out)
			.start()

		Motor.addRenderTask(time => {
			if (this.hintTween?.stopped) return false
			this.hintTween?.update(time)
			return
		})
	}

	openMenu() {
		if (this.menuIsOpening) return

		this.menuIsOpening = true

		const promise = this.animateTo(1.0)

		promise.then(() => {
			this.menuIsOpening = false
		})

		return promise
	}

	closeMenu() {
		if (this.menuIsClosing) return

		this.menuIsClosing = true

		const promise = this.animateTo(0.0)

		promise.then(() => {
			this.menuIsClosing = false
		})

		return promise
	}

	menuTween: any

	animateTo(value: number) {
		let resolve!: () => void
		const promise = new Promise<void>(r => (resolve = r))

		if (this.menuTween) this.menuTween.stop()

		this.menuTween = new StatusTween(this).to({menuPosition: value}, 1000).easing(Easing.Exponential.Out).start()

		const tween = this.menuTween

		const task = Motor.addRenderTask(time => {
			if (tween.stopped) {
				Motor.removeRenderTask(task)
				setTimeout(resolve, 0) // setTimeout so that we don't resolve during rAF. Use postMessage instead?
				return
			}

			tween.update(time)

			this.updateMenuPosition(this.menuPosition)

			if (tween.completed) {
				Motor.removeRenderTask(task)
				setTimeout(resolve, 0) // setTimeout so that we don't resolve during rAF. Use postMessage instead?
			}
		})

		return promise
	}

	updateMenuPosition(value: number) {
		// limit value to between 0 and 1
		value = value > 1 ? 1 : value < 0 ? 0 : value

		this.menuPosition = value

		const menu = this.menu!
		//const grip = this.refs.invisibleGrip
		const content = this.content!
		const fade = this.fadeEffect!

		menu.position.x = value * 230 - 230
		content.position.z = value * -70 - 1
		fade.position.z = value * -70 - 0.9
		fade.opacity = value * 0.6
		//grip.position.x = value * -50 + 230
	}
}

class StatusTween<T> extends Tween<T> {
	started = false
	stopped = false
	completed = false

	constructor(obj: T, group: Group | false = false) {
		super(obj, group)

		this.onStart(() => (this.started = true))
		this.onStop(() => (this.stopped = true))
		this.onComplete(() => (this.completed = true))
	}
}

declare module '@lume/element' {
	namespace JSX {
		interface IntrinsicElements {
			'lume-slideout': ElementAttributes<Slideout, SlideoutAttributes>
		}
	}
}

declare global {
	interface HTMLElementTagNameMap {
		'lume-slideout': Slideout
	}
}

// console.log('CSS', Slideout.css)
