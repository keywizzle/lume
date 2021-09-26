import {Constructor} from 'lowclass'
import type {PossibleCustomElement, PossibleCustomElementConstructor} from './PossibleCustomElement.js'

export function WithComposed<T extends Constructor<HTMLElement>>(Base: T) {
	return class WithComposed extends Constructor<PossibleCustomElement, PossibleCustomElementConstructor>(Base) {
		constructor(...args: any[]) {
			super(...args)
		}

		connectedCallback() {}

		disconnectedCallback() {}

		// TODO This will provide the following optional callbacks for custom elements.

		parentComposedCallback?(_child: Element): void
		childComposedCallback?(_child: Element): void
		childUncomposedCallback?(_child: Element): void
	}
}
