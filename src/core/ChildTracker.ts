import {Constructor} from 'lowclass'
import {observeChildren} from './utils/observeChildren.js'
import type {PossibleCustomElement, PossibleCustomElementConstructor} from './PossibleCustomElement.js'

export function ChildTracker<T extends Constructor<HTMLElement>>(Base: T) {
	return class ChildTracker extends Constructor<PossibleCustomElement, PossibleCustomElementConstructor & T>(Base) {
		constructor(...args: any[]) {
			super(...args)
			this.#createObserver()
		}

		override connectedCallback() {
			super.connectedCallback?.()
			// 	this.#runChildConnectedCallbacks()
			this.#createObserver()
		}

		override disconnectedCallback() {
			super.disconnectedCallback?.()
			// 	this.#runChildDisconnectedCallbacks()
			this.#destroyObserver()
		}

		childConnectedCallback?(_child: Element): void
		childDisconnectedCallback?(_child: Element): void

		#unobserveChildren: (() => void) | null = null

		#createObserver() {
			console.log('Create Child Observer', this.id)

			if (this.#unobserveChildren) return

			// observeChildren returns a MutationObserver observing childList
			this.#unobserveChildren = observeChildren({
				target: this,
				onConnect: (child: Element) => {
					if (!this.isConnected) return
					this.childConnectedCallback && this.childConnectedCallback(child)
				},
				onDisconnect: (child: Element) => {
					if (!this.isConnected) return
					this.childDisconnectedCallback && this.childDisconnectedCallback(child)
				},
				skipTextNodes: true,
			})
		}

		#destroyObserver() {
			console.log('Destroy Child Observer', this.id)

			if (!this.#unobserveChildren) return
			this.#unobserveChildren()
			this.#unobserveChildren = null
		}
	}
}
