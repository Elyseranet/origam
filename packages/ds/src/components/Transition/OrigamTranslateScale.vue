<template>
	<transition
			:name="name"
			v-bind="{...events, css: !hasTarget && !disabled}"
	>
		<slot name="default"/>
	</transition>
</template>

<script
		lang="ts"
		setup
>
	import { computed } from 'vue'
	import { useProps } from '../../composables/Commons/props.composable'
	import { EASING, TRANSITION_MODE } from '../../enums/Transition/transition.enum'

	import type { ITranslateScaleProps } from '../../interfaces/Transition/translate-scale.interface'
	import type { ITransitionEmits, ITransitionSlots } from '../../interfaces/Transition/transition.interface'

	import { animate } from '../../utils/Commons/animation.util'
	import { getChildren, getDimensions } from '../../utils/Transition/transition.util'

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

	defineEmits<ITransitionEmits>()

	defineSlots<ITransitionSlots>()

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

	/*********************************************************
	 * applyOrigin
	 *
	 * @description
	 * `origin` (from `ITransitionProps`, inherited by `ITranslateScaleProps`)
	 * sets `transform-origin` on the transitioned element BEFORE the scale
	 * runs — the only sibling in the 8-component `origin` audit (#538/#548)
	 * where the prop has something to anchor on, since this is the only
	 * transition whose keyframes/CSS class include an actual `scale(...)`.
	 * Applied on BOTH paths:
	 *   - CSS-only (`!hasTarget`): the inline style wins the cascade over
	 *     the `.origam-transition--transform-scale-enter-from` SCSS rule's
	 *     `transform: scale(0.9)`, so the browser anchors that scale on the
	 *     custom origin instead of its `50% 50%` default.
	 *   - WAAPI (`hasTarget`): set before `getDimensions()` is called so its
	 *     `getComputedStyle(el).transformOrigin` read (transition.util.ts)
	 *     picks up the custom value — that function's `x`/`y` math already
	 *     generically accounts for whatever `transform-origin` is current,
	 *     it was simply never given anything but the browser default.
	 ********************************************************/
	const applyOrigin = (el: Element) => {
		if (props.origin) {
			(el as HTMLElement).style.transformOrigin = props.origin
		}
	}

	const handleBeforeEnter = (el: Element) => {
		applyOrigin(el)
		;(el as HTMLElement).style.pointerEvents = 'none'
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
		applyOrigin(el)
		;(el as HTMLElement).style.pointerEvents = 'none'
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

	/*********************************************************
	 * events
	 *
	 * @description
	 * `disabled` (from `ITransitionProps`) short-circuits both paths: no
	 * hooks bound at all (this computed returns `{}`) AND `css` is forced
	 * `false` in the template — same combination Vue's `<transition>`
	 * uses to skip the transition outright and settle instantly, mirroring
	 * `<OrigamExpandX>`'s `:css="!disabled"`.
	 *
	 * When NOT disabled, exactly one of the two remaining branches binds:
	 *   - `hasTarget` -> the full WAAPI hook set (unchanged).
	 *   - `!hasTarget` -> only `applyOrigin`, so the CSS-only path still
	 *     gets `transform-origin` set on the element before its native
	 *     `<transition>` CSS classes kick in the `scale(0.9)`. Nothing is
	 *     bound at all if `origin` isn't set, identical to pre-#548
	 *     behaviour (this branch used to unconditionally return `{}`).
	 ********************************************************/
	const events = computed(() => {
		if (props.disabled) {
			return {}
		}

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

		if (props.origin) {
			return {
				onBeforeEnter: applyOrigin,
				onBeforeLeave: applyOrigin
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
	@use '../../assets/scss/helpers' as ds;

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

		@include ds.ds-reduced-motion {
			&-enter-active,
			&-leave-active {
				transition-duration: 0.01ms !important;
			}
		}
	}
</style>
