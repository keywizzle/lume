import {Element as LumeElement} from '@lume/element'
import {ChildTracker} from './ChildTracker.js'
import {DefaultBehaviors} from '../behaviors/DefaultBehaviors.js'
import {
	CompositionTracker,
	// CompositionType
} from './CompositionTracker.js'

import type {Node as _Node} from './Node.js'

export class DeclarativeBase extends CompositionTracker(DefaultBehaviors(ChildTracker(LumeElement))) {
	/** @deprecated use `.defineElement()` instead */
	static define(name?: string) {
		this.defineElement(name)
	}

	awaitChildrenDefined = true

	// from Scene
	isScene = false

	// from Node
	isNode = false

	override connectedCallback() {
		super.connectedCallback()
		this.#runChildConnectedCallbacks()
		// queueMicrotask(() => this.#runChildConnectedCallbacks())
	}

	override disconnectedCallback() {
		super.disconnectedCallback()
		this.#runChildDisconnectedCallbacks()
		// queueMicrotask(() => this.#runChildDisconnectedCallbacks())
	}

	// override childComposedCallback(child: Element, connectionType: CompositionType) {
	// 	super.childComposedCallback?.(child, connectionType)

	// 	console.log('CHILD COMPOSED', child.id)

	// 	if (connectionType === 'actual' && child instanceof DeclarativeBase) {
	// 		console.log('node connected, make it run child connected callbacks', child.id)
	// 		child.#runChildConnectedCallbacks()
	// 	}
	// }

	// override childUncomposedCallback(child: Element, connectionType: CompositionType) {
	// 	super.childUncomposedCallback?.(child, connectionType)

	// 	console.log('CHILD UNCOMPOSED', child.id)

	// 	if (connectionType === 'actual' && child instanceof DeclarativeBase) {
	// 		console.log('node disconnected, make it run child disconnected callbacks', child.id)
	// 		child.#runChildDisconnectedCallbacks()
	// 	}
	// }

	#awaitedChildren = new Set<Element>()

	#runChildConnectedCallbacks() {
		console.log('RUN CHILD CONNECTED CALLBACKS', this.id)

		for (let el = this.firstElementChild; el; el = el.nextElementSibling) {
			console.log('   CHILD CONNECTED CALLBACK for CHILD', el.id)
			this.#runChildConnect(el)
		}
	}

	#runChildConnect(child: Element) {
		const elementIsUpgraded = child.matches(':defined')

		if (elementIsUpgraded || !this.awaitChildrenDefined) {
			this.childConnectedCallback?.(child)
		} else {
			if (!this.#awaitedChildren.has(child)) {
				this.#awaitedChildren.add(child)

				customElements.whenDefined(child.tagName.toLowerCase()).then(() => {
					this.#awaitedChildren.delete(child)
					if (!this.isConnected) return
					this.childConnectedCallback?.(child)
				})
			}
		}
	}

	#runChildDisconnectedCallbacks() {
		console.log('RUN CHILD DISCONNECTED CALLBACKS', this.id)

		for (let el = this.firstElementChild; el; el = el.nextElementSibling) {
			console.log('   CHILD DISCONNECTED CALLBACK for CHILD', el.id)
			this.#runChildDisconnect(el)
		}
	}

	#runChildDisconnect(child: Element) {
		if (this.#awaitedChildren.has(child)) return

		this.childDisconnectedCallback?.(child)
	}

	override childConnectedCallback(child: Element) {
		console.log('CHILD CONNECTED', child.id)

		// This code handles two cases: the element has a ShadowRoot
		// ("composed children" are children of the ShadowRoot), or it has a
		// <slot> child ("composed children" are nodes that may be
		// distributed to the <slot>).
		if (isNode(child)) {
			if (child.tagName.includes('SPHERE')) console.log('composition: child connected', this, child)

			// We skip Scene here because we know it already has a
			// ShadowRoot that serves a different purpose than for Nodes. A
			// Scene child's three objects will always be connected to the
			// scene's three object regardless of its ShadowRoot.
			if (!this.isScene && this.__shadowRoot) {
				child.__isPossiblyDistributedToShadowRoot = true

				// We don't call childComposedCallback here because that
				// will be called indirectly due to a slotchange event on a
				// <slot> element if the added child will be distributed to
				// a slot.
			} else {
				// If there's no shadow root, call the childComposedCallback
				// with connection type "actual". This is effectively a
				// regular parent-child composition (no distribution, no
				// children of a ShadowRoot).

				this.__triggerChildComposedCallback(child, 'actual')
			}
		} else if (child instanceof HTMLSlotElement) {
			// COMPOSED TREE TRACKING: Detecting slots here is part of composed
			// tree tracking (detecting when a child is distributed to an element).

			child.addEventListener('slotchange', this.__onChildSlotChange)

			// XXX Do we need __handleDistributedChildren for initial slotted
			// nodes? The answer seems to be "yes, sometimes". When slots are
			// appended, their slotchange events will fire. However, this
			// `childConnectedCallback` is fired later from when a child is
			// actually connected, in a MutationObserver task. Because of this,
			// an appended slot's slotchange event *may* have already fired,
			// and we will not have had the chance to add a slotchange event
			// handler yet, therefore we need to fire
			// __handleDistributedChildren here to handle that missed
			// opportunity.
			//
			// Also we need to defer() here because otherwise, this
			// childConnectedCallback will fire once for when a child is
			// connected into the light DOM and run the logic in the `if
			// (isNode(child))` branch *after* childConnectedCallback is fired
			// and executes this __handleDistributedChildren call for a shadow
			// DOM slot, and in that case the distribution will not be detected
			// (why is that?).  By deferring, this __handleDistributedChildren
			// call correctly happens *after* the above `if (isNode(child))`
			// branch and then things will work as expected. This is all due to
			// using MutationObserver, which fires event in a later task than
			// when child connections actually happen.
			//
			// TODO ^, Can we make WithChildren call this callback right when
			// children are added, synchronously?  If so then we could rely on
			// a slot's slotchange event upon it being connected without having
			// to call __handleDistributedChildren here (which means also not
			// having to use defer for anything).
			queueMicrotask(() => this.__handleDistributedChildren(child))
		}
	}

	override childDisconnectedCallback(child: Element) {
		console.log('CHILD DISCONNECTED', child.id)

		if (isNode(child)) {
			if (child.tagName.includes('SPHERE')) console.log('composition: child disconnected', this, child)
			if (!this.isScene && this.__shadowRoot) {
				child.__isPossiblyDistributedToShadowRoot = false
			} else {
				// If there's no shadow root, call the
				// childUncomposedCallback with connection type "actual".
				// This is effectively similar to childDisconnectedCallback.
				this.__triggerChildUncomposedCallback(child, 'actual')
			}
		} else if (child instanceof HTMLSlotElement) {
			// COMPOSED TREE TRACKING:
			child.removeEventListener('slotchange', this.__onChildSlotChange, {capture: true})

			this.__handleDistributedChildren(child)
			this.__previousSlotAssignedNodes.delete(child)
		}
	}

	// TODO: make setAttribute accept non-string values.
	override setAttribute(attr: string, value: any) {
		super.setAttribute(attr, value)
	}

	override get _composedChildren(): DeclarativeBase[] {
		if (!this.isScene && this.__shadowRoot) {
			// TODO move this composed stuff to a separate class that has
			// no limitation on which types of nodes it observes, then use
			// it here and apply the restriction.
			// @xts-expect-error TODO temporary remove
			return [...this._distributedShadowRootChildren, ...this._shadowRootChildren]
		} else {
			// @xts-expect-error TODO temporary remove
			return [
				...(this.__distributedChildren || []), // TODO perhaps use slot.assignedElements instead?
				// We only care about DeclarativeBase nodes.
				...Array.from(this.children).filter((n): n is DeclarativeBase => n instanceof DeclarativeBase),
			]
		}
	}
}

// We're using isNode instead of instanceof Node to avoid a runtime reference Node here,
// thus prevent a circular dependency between this module and Node
// TODO consolidate with one in ImperativeBase
function isNode(n: any): n is _Node {
	return n.isNode
}
