<template>
	<transition
			:css="!disabled"
			:name="name"
			@enter="handleEnter"
			@leave="handleLeave"
			@before-enter="handleBeforeEnter"
			@after-enter="handleAfterEnter"
			@enter-cancelled="handleEnterCancelled"
			@after-leave="handleAfterLeave"
			@leave-cancelled="handleLeaveCancelled"
	>
		<slot name="default"/>
	</transition>
</template>

<script
		lang="ts"
		setup
>
	import { camelize } from 'vue'
	import { useProps } from "../../composables"
	import { TRANSITION_MODE } from '../../enums'

	import type { IHTMLExpandElement, ITransitionProps } from '../../interfaces'

	/*********************************************************
	 * Global
	 *
	 * @description
	 * Props with defaults and filterProps utility.
	 ********************************************************/
	const props = withDefaults(defineProps<ITransitionProps>(), {
		name: 'origam-transition--expand-x',
		mode: TRANSITION_MODE.IN_OUT
	})

	const {filterProps} = useProps<ITransitionProps>(props)

	/*********************************************************
	 * Expand-X transition hooks
	 *
	 * @description
	 * JS-driven width expand/collapse — stashes the element's
	 * initial width style, forces a reflow, and animates to/
	 * from 0 using the element's offset width.
	 ********************************************************/
	const expandedParentClass = ''
	const sizeProperty = 'width' as const
	const offsetProperty = camelize(`offset-${sizeProperty}`) as 'offsetWidth'

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

		element.style.overflow = 'hidden'
		element.style[sizeProperty] = `${element[offsetProperty]}px`
		void element.offsetHeight // force reflow

		requestAnimationFrame(() => (element.style[sizeProperty] = '0'))
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
	.origam-transition--expand-x-enter-active {
		transition-duration: var(--origam-transition--expand-x-enter-active---transition-duration);
		transition-timing-function: var(--origam-transition--expand-x-enter-active---transition-timing-function);
		transition-property: var(--origam-transition--expand-x-enter-active---transition-property);
	}

	.origam-transition--expand-x-leave-active {
		transition-duration: var(--origam-transition--expand-x-enter-leave---transition-duration);
		transition-timing-function: var(--origam-transition--expand-x-enter-leave---transition-timing-function);
		transition-property: var(--origam-transition--expand-x-enter-leave---transition-property);
	}

	.origam-transition--expand-x-move {
		transition-duration: var(--origam-transition--expand-x-move---transition-duration);
		transition-property: var(--origam-transition--expand-x-move---transition-property);
		transition-timing-function: var(--origam-transition--expand-x-move---transition-timing-function);
	}
</style>

<style>
	:root {
		--origam-transition--expand-x-enter-active---transition-duration: .5s;
		--origam-transition--expand-x-enter-active---transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
		--origam-transition--expand-x-enter-active---transition-property: width;

		--origam-transition--expand-x-enter-leave---transition-duration: .5s;
		--origam-transition--expand-x-enter-leave---transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
		--origam-transition--expand-x-enter-leave---transition-property: width;

		--origam-transition--expand-x-move---transition-duration: .5s;
		--origam-transition--expand-x-move---transition-property: transform;
		--origam-transition--expand-x-move---transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
	}
</style>
