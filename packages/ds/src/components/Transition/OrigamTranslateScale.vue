<template>
	<transition
			:name="name"
			v-bind="{...events, css: !hasTarget}"
	>
		<slot name="default"/>
	</transition>
</template>

<script
		lang="ts"
		setup
>
	import { computed } from 'vue'
	import { useProps } from "../../composables"
	import { EASING, TRANSITION_MODE } from '../../enums'

	import type { ITranslateScaleProps } from '../../interfaces'

	import { animate, getChildren, getDimensions } from '../../utils'

	/*********************************************************
	 * Global
	 *
	 * @description
	 * Props with defaults and filterProps utility.
	 ********************************************************/
	const props = withDefaults(defineProps<ITranslateScaleProps>(), {
		name: 'origam-transition--transform-scale',
		mode: TRANSITION_MODE.IN_OUT
	})

	const {filterProps} = useProps<ITranslateScaleProps>(props)

	/*********************************************************
	 * TranslateScale transition hooks
	 *
	 * @description
	 * JS-driven WAAPI animation — when a `target` element is
	 * provided, the entering/leaving element scales and
	 * translates to/from the target's bounding rect. Without
	 * a target, the CSS fallback class runs a simpler scale.
	 ********************************************************/
	const hasTarget = computed(() => {
		return !!props.target
	})

	/*********************************************************
	 * Event handlers
	 ********************************************************/

	const handleBeforeEnter = (el: Element) => {
		(el as HTMLElement).style.pointerEvents = 'none'
		;(el as HTMLElement).style.visibility = 'hidden'
	}
	const handleEnter = async (el: Element, done: () => void) => {
		await new Promise(resolve => requestAnimationFrame(resolve))
		await new Promise(resolve => requestAnimationFrame(resolve))
		;(el as HTMLElement).style.visibility = ''

		const {x, y, sx, sy, speed} = getDimensions(props.target!, el as HTMLElement)

		const animation = animate(el, [
			{transform: `translate(${x}px, ${y}px) scale(${sx}, ${sy})`, opacity: 0},
			{}
		], {
			duration: 225 * speed,
			easing: EASING.DECELERATE
		})
		getChildren(el)?.forEach((el) => {
			animate(el, [
				{opacity: 0},
				{opacity: 0, offset: 0.33},
				{}
			], {
				duration: 225 * 2 * speed,
				easing: EASING.STANDARD
			})
		})
		animation.finished.then(() => done())
	}
	const handleAfterEnter = (el: Element) => {
		(el as HTMLElement).style.removeProperty('pointer-events')
	}
	const handleBeforeLeave = (el: Element) => {
		(el as HTMLElement).style.pointerEvents = 'none'
	}
	const handleLeave = async (el: Element, done: () => void) => {
		await new Promise(resolve => requestAnimationFrame(resolve))

		const {x, y, sx, sy, speed} = getDimensions(props.target!, el as HTMLElement)

		const animation = animate(el, [
			{},
			{transform: `translate(${x}px, ${y}px) scale(${sx}, ${sy})`, opacity: 0}
		], {
			duration: 125 * speed,
			easing: EASING.ACCELERATE
		})
		animation.finished.then(() => done())
		getChildren(el)?.forEach(el => {
			animate(el, [
				{},
				{opacity: 0, offset: 0.2},
				{opacity: 0}
			], {
				duration: 125 * 2 * speed,
				easing: EASING.STANDARD
			})
		})
	}
	const handleAfterLeave = (el: Element) => {
		(el as HTMLElement).style.removeProperty('pointer-events')
	}

	const events = computed(() => {
		if (hasTarget.value) {
			return {
				onBeforeEnter: handleBeforeEnter,
				onEnter: handleEnter,
				onAfterEnter: handleAfterEnter,
				onBeforeLeave: handleBeforeLeave,
				onLeave: handleLeave,
				onAfterLeave: handleAfterLeave
			}
		}

		return {}
	})

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
	.origam-transition--transform-scale {
		&-enter-active {
			transition-duration: 225ms;
			transition-timing-function: cubic-bezier(0.0, 0, 0.2, 1);
		}

		&-leave-active {
			transition-duration: 125ms;
			transition-timing-function: cubic-bezier(0.4, 0, 1, 1);
		}

		&-enter-active,
		&-leave-active {
			transition-property: transform, opacity;
			pointer-events: none;
		}

		&-enter-from, &-leave-to {
			transform: scale(0.9);
			opacity: 0;
		}

		&-enter-to, &-leave-from {
			opacity: 1;
		}
	}
</style>
