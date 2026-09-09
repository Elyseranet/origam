<template>
	<component
			:is="tag"
			v-bind="rootProps"
			@enter="handleEnter"
			@leave="handleLeave"
			@before-enter="handleBeforeEnter"
			@after-enter="handleAfterEnter"
			@enter-cancelled="handleEnterCancelled"
			@after-leave="handleAfterLeave"
			@leave-cancelled="handleLeaveCancelled"
	>
		<slot name="default"/>
	</component>
</template>

<script
		lang="ts"
		setup
>
	import { camelize, computed, Transition, TransitionGroup, type Component } from 'vue'
	import { useProps } from '../../composables/Commons/props.composable'
	import { TRANSITION_MODE } from '../../enums/Transition/transition.enum'

	import type { IHTMLExpandElement } from '../../interfaces/Transition/expand.interface'
	import type { ITransitionEmits, ITransitionNoOriginProps, ITransitionSlots } from '../../interfaces/Transition/transition.interface'

	/*********************************************************
	 * Global
	 *
	 * @description
	 * Props with defaults and filterProps utility.
	 ********************************************************/
	const props = withDefaults(defineProps<ITransitionNoOriginProps>(), {
		name: 'origam-transition--expand-y',
		mode: TRANSITION_MODE.IN_OUT
	})

	const {filterProps} = useProps<ITransitionNoOriginProps>(props)

	defineEmits<ITransitionEmits>()

	defineSlots<ITransitionSlots>()

	/*********************************************************
	 * group
	 *
	 * @description
	 * `group` (from `ITransitionProps`) switches the root element
	 * between Vue's `Transition` (single child) and `TransitionGroup`
	 * (keyed list, FLIP-reflow on reorder/remove). This is what makes
	 * the already-shipped `.origam-transition--expand-y-move` SCSS rule
	 * reachable — `TransitionGroup` applies that class to siblings
	 * during a reflow automatically, no extra JS needed on our side.
	 * `mode` is only meaningful for the single-child `Transition` (Vue
	 * doesn't support it on `TransitionGroup`), so it's omitted rather
	 * than forwarded when `group` is true.
	 ********************************************************/
	const tag = computed<Component>(() => props.group ? TransitionGroup : Transition)

	/*********************************************************
	 * rootProps
	 *
	 * @description
	 * `mode` is dropped from the bound object entirely (not just set to
	 * `undefined`) when `group` is true — `:mode="undefined"` still
	 * triggers Vue's "Extraneous non-props attributes" dev warning on
	 * `TransitionGroup` because the key is present in the vnode's props,
	 * regardless of its value.
	 ********************************************************/
	const rootProps = computed(() => {
		const bind: { css: boolean; name: string; mode?: string } = {
			css: !props.disabled,
			name: props.name!
		}

		if (!props.group) {
			bind.mode = props.mode
		}

		return bind
	})

	/*********************************************************
	 * Expand-Y transition hooks
	 *
	 * @description
	 * JS-driven height expand/collapse — stashes the element's
	 * initial height style, forces a reflow, and animates to/
	 * from 0 using the element's offset height.
	 ********************************************************/
	const expandedParentClass = ''
	const sizeProperty = 'height' as const
	const offsetProperty = camelize(`offset-${sizeProperty}`) as 'offsetHeight'

	const resetStyles = (el: IHTMLExpandElement) => {
		const size = el._initialStyle![sizeProperty]

		el.style.overflow = el._initialStyle!.overflow

		if (size != null) el.style[sizeProperty] = size

		delete el._initialStyle
	}
	const onAfterLeave = (el: IHTMLExpandElement) => {
		if (expandedParentClass && el._parent) {
			el._parent.classList.remove(expandedParentClass)
		}

		/*********************************************************
		 * onAfterLeave — leaveAbsolute cleanup
		 *
		 * @description
		 * `leaveAbsolute` pulled the element out of flow to let siblings
		 * reflow immediately — restore whatever position/size it had
		 * before `handleLeave` touched it (mirrors `useCssTransition`'s
		 * `handleAfterLeave`, same `_transitionInitialStyles` field,
		 * already declared globally in `globals.d.ts`).
		 ********************************************************/
		if (el._transitionInitialStyles) {
			const {position, top, left, width, height} = el._transitionInitialStyles

			delete el._transitionInitialStyles

			el.style.position = position || ''
			el.style.top = top || ''
			el.style.left = left || ''
			el.style.width = width || ''
			el.style.height = height || ''
		}

		if (props.hideOnLeave) {
			el.style.removeProperty('display')
		}

		resetStyles(el)
	}

	/*********************************************************
	 * Event handlers
	 ********************************************************/

	const handleBeforeEnter = (el: Element) => {
		const element = el as IHTMLExpandElement

		element._parent = element.parentNode as (Node & ParentNode & HTMLElement) | null
		element._initialStyle = {
			transition: element.style.transition,
			overflow: element.style.overflow,
			[sizeProperty]: element.style[sizeProperty]
		}
	}
	const handleEnter = (el: Element) => {
		const element = el as IHTMLExpandElement
		const initialStyle = element._initialStyle!

		element.style.setProperty('transition', 'none', 'important')
		// Hide overflow to account for collapsed margins in the calculated height
		element.style.overflow = 'hidden'
		const offset = `${element[offsetProperty]}px`

		element.style[sizeProperty] = '0'

		void element.offsetHeight // force reflow

		element.style.transition = initialStyle.transition

		if (expandedParentClass && element._parent) {
			element._parent.classList.add(expandedParentClass)
		}

		requestAnimationFrame(() => {
			element.style[sizeProperty] = offset
		})
	}
	const handleAfterEnter = (el: Element) => {
		const element = el as IHTMLExpandElement

		resetStyles(element)
	}
	const handleEnterCancelled = (el: Element) => {
		const element = el as IHTMLExpandElement

		resetStyles(element)
	}
	const handleLeave = (el: Element) => {
		const element = el as IHTMLExpandElement

		element._initialStyle = {
			transition: '',
			overflow: element.style.overflow,
			[sizeProperty]: element.style[sizeProperty]
		}

		/*********************************************************
		 * handleLeave — leaveAbsolute
		 *
		 * @description
		 * Pull the element out of flow at its current box (mirrors
		 * `useCssTransition`'s `handleLeave`) so siblings reflow
		 * immediately instead of waiting for the height to reach 0.
		 ********************************************************/
		if (props.leaveAbsolute) {
			const {offsetTop, offsetLeft, offsetWidth, offsetHeight} = element

			element._transitionInitialStyles = {
				position: element.style.position,
				top: element.style.top,
				left: element.style.left,
				width: element.style.width,
				height: element.style.height
			}
			element.style.position = 'absolute'
			element.style.top = `${offsetTop}px`
			element.style.left = `${offsetLeft}px`
			element.style.width = `${offsetWidth}px`
			element.style.height = `${offsetHeight}px`
		}

		element.style.overflow = 'hidden'
		element.style[sizeProperty] = `${element[offsetProperty]}px`
		void element.offsetHeight // force reflow

		/*********************************************************
		 * handleLeave — hideOnLeave
		 *
		 * @description
		 * Same semantics as `useCssTransition`'s: skip the visible
		 * collapse entirely and hide instantly. Vue's built-in
		 * `whenTransitionEnds()` still resolves the leave via its
		 * CSS-duration timeout fallback even though nothing visually
		 * transitions, so `done()`/unmount still happens on schedule.
		 ********************************************************/
		if (props.hideOnLeave) {
			element.style.setProperty('display', 'none', 'important')
		} else {
			requestAnimationFrame(() => (element.style[sizeProperty] = '0'))
		}
	}
	const handleAfterLeave = (el: Element) => {
		const element = el as IHTMLExpandElement

		onAfterLeave(element)
	}
	const handleLeaveCancelled = (el: Element) => {
		const element = el as IHTMLExpandElement

		onAfterLeave(element)
	}

	/*********************************************************
	 * Expose
	 *
	 * @description
	 * Public API surface exposed to parent refs.
	 ********************************************************/
	defineExpose({
		filterProps
	})

</script>

<style lang="scss">
	@use '../../assets/scss/helpers' as ds;

	.origam-transition--expand-y-enter-active {
		transition-duration: var(--origam-transition--expand-y-enter-active---transition-duration);
		transition-timing-function: var(--origam-transition--expand-y-enter-active---transition-timing-function);
		transition-property: var(--origam-transition--expand-y-enter-active---transition-property);
	}

	.origam-transition--expand-y-leave-active {
		transition-duration: var(--origam-transition--expand-y-enter-leave---transition-duration);
		transition-timing-function: var(--origam-transition--expand-y-enter-leave---transition-timing-function);
		transition-property: var(--origam-transition--expand-y-enter-leave---transition-property);
	}

	.origam-transition--expand-y-move {
		transition-duration: var(--origam-transition--expand-y-move---transition-duration);
		transition-property: var(--origam-transition--expand-y-move---transition-property);
		transition-timing-function: var(--origam-transition--expand-y-move---transition-timing-function);
	}

	@include ds.ds-reduced-motion {
		.origam-transition--expand-y-enter-active,
		.origam-transition--expand-y-leave-active,
		.origam-transition--expand-y-move {
			transition-duration: 0.01ms !important;
		}
	}
</style>

<style>
	:root {
		--origam-transition--expand-y-enter-active---transition-duration: .5s;
		--origam-transition--expand-y-enter-active---transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
		--origam-transition--expand-y-enter-active---transition-property: height;

		--origam-transition--expand-y-enter-leave---transition-duration: .5s;
		--origam-transition--expand-y-enter-leave---transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
		--origam-transition--expand-y-enter-leave---transition-property: height;

		--origam-transition--expand-y-move---transition-duration: .5s;
		--origam-transition--expand-y-move---transition-property: transform;
		--origam-transition--expand-y-move---transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
	}
</style>
