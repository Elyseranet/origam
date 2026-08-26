<template>
	<origam-transition
			:disabled="!isBooted"
			:transition="transition"
	>
		<div
				v-show="isShown"
				:id="id"
				v-touch
				:class="windowItemClasses"
				:style="windowItemStyles"
		>
			<slot
					v-if="hasContent"
					name="default"
			/>
		</div>
	</origam-transition>
</template>

<script
		lang="ts"
		setup
>
	import { computed, inject, nextTick, shallowRef, StyleValue } from 'vue'
	import OrigamTransition from '../Transition/OrigamTransition.vue'

	import { useGroupItem } from '../../composables/Commons/groupItem.composable'
	import { useLazy } from '../../composables/Commons/lazy.composable'
	import { useProps } from '../../composables/Commons/props.composable'
	import { useSsrBoot } from '../../composables/Commons/ssrBoot.composable'
	import { useStyle } from '../../composables/Commons/style.composable'

	import { ORIGAM_WINDOW_GROUP_KEY, ORIGAM_WINDOW_KEY } from '../../consts/Window/window.const'

	import vTouch from '../../directives/Touch/touch.directive'

	import type { IWindowItemProps } from '../../interfaces/Window/window-item.interface'

	import type { IWindowItemEmits, IWindowItemSlots } from '../../interfaces/Window/window-item.interface'

	import { convertToUnit } from '../../utils/Commons/commons.util'

	/*********************************************************
	 * Global
	 *
	 * @description
	 * Props with defaults, emits, filterProps utility, and
	 * injection of the parent window context and group item
	 * registration.
	 ********************************************************/
	const props = withDefaults(defineProps<IWindowItemProps>(), {
		transition: undefined,
		reverseTransition: undefined
	})

	defineEmits<IWindowItemEmits>()

	defineSlots<IWindowItemSlots>()

	const {filterProps} = useProps<IWindowItemProps>(props)

	const window = inject(ORIGAM_WINDOW_KEY)
	const groupItem = useGroupItem(props, ORIGAM_WINDOW_GROUP_KEY)

	/*********************************************************
	 * Composables
	 ********************************************************/

	const {isBooted} = useSsrBoot()

	if (!window || !groupItem) throw new Error('[Origam] window-item must be used inside window')

	/*********************************************************
	 * Transition state
	 *
	 * @description
	 * Computes the transition descriptor passed to
	 * OrigamTransition, coordinating height animation with
	 * the parent window via transitionCount and
	 * transitionHeight. isShown and hasContent gate rendering
	 * via v-show and useLazy respectively.
	 ********************************************************/
	const isTransitioning = shallowRef(false)
	const hasTransition = computed(() => {
		return isBooted.value && (window.isReversed.value ? props.reverseTransition !== false : props.transition !== false)
	})

	/*********************************************************
	 * Event handlers
	 ********************************************************/

	const handleAfterTransition = () => {
		if (!isTransitioning.value || !window) {
			return
		}

		isTransitioning.value = false
		if (window.transitionCount.value > 0) {
			window.transitionCount.value -= 1

			if (window.transitionCount.value === 0) {
				window.transitionHeight.value = undefined
			}
		}
	}

	const handleBeforeTransition = () => {
		if (isTransitioning.value || !window) {
			return
		}

		isTransitioning.value = true

		if (window.transitionCount.value === 0) {
			window.transitionHeight.value = convertToUnit(window.rootRef.value?.clientHeight)
		}

		window.transitionCount.value += 1
	}

	const handleTransitionCancelled = () => {
		handleAfterTransition()
	}

	const handleEnterTransition = (el: Element) => {
		if (!isTransitioning.value) {
			return
		}

		nextTick(() => {
			if (!hasTransition.value || !isTransitioning.value || !window) {
				return
			}

			window.transitionHeight.value = convertToUnit(el.clientHeight)
		})
	}

	const transition = computed(() => {
		const name = window.isReversed.value
				? props.reverseTransition
				: props.transition

		const trans: false | { name: string | undefined, [key: string]: any } = !hasTransition.value ? false : {
			name: typeof name !== 'string' ? window.transition.value : name
		}

		if (hasTransition.value) {
			if (!isBooted.value && typeof trans !== 'boolean') {
				trans!.onBeforeEnter = handleBeforeTransition
				trans!.onAfterEnter = handleAfterTransition
				trans!.onEnterCancelled = handleTransitionCancelled
				trans!.onBeforeLeave = handleBeforeTransition
				trans!.onAfterLeave = handleAfterTransition
				trans!.onLeaveCancelled = handleTransitionCancelled
				trans!.onEnter = handleEnterTransition
			}
		}

		return trans
	})

	const isShown = computed(() => {
		return groupItem.isSelected.value
	})

	const {hasContent} = useLazy(props, groupItem.isSelected)

	/*********************************************************
	 * Class & Style
	 *
	 * @description
	 * Root element classes and styles for the window item
	 * wrapper, including the active selected class from the
	 * group item registry.
	 ********************************************************/
	const windowItemStyles = computed(() => {
		return [
			props.style
		] as StyleValue
	})
	const windowItemClasses = computed(() => {
		return [
			'origam-window-item',
			groupItem.selectedClass.value,
			props.class
		]
	})
	const {id, css, load, isLoaded, unload} = useStyle(windowItemStyles, () => props.id)


	/*********************************************************
	 * Expose
	 *
	 * @description
	 * Public API surface exposed to parent refs.
	 ********************************************************/
	defineExpose({
		filterProps,
		css,
		id,
		load,
		unload,
		isLoaded
	})
</script>

<style lang="scss">
	.origam-window-item {
		flex: 1 1 auto;
		min-height: 0;
		min-width: 0;
		width: 100%;

		&--x-transition-enter-active,
		&--x-transition-leave-active,
		&--x-reverse-transition-enter-active,
		&--x-reverse-transition-leave-active,
		&--y-transition-enter-active,
		&--y-transition-leave-active,
		&--y-reverse-transition-enter-active,
		&--y-reverse-transition-leave-active {
			transition:
				var(--origam-window-item---x-transition-duration, 0.3s)
				var(--origam-window-item---x-transition-easing, cubic-bezier(0.25, 0.8, 0.5, 1));
		}

		&--x-transition-leave-from,
		&--x-transition-leave-to,
		&--x-reverse-transition-leave-from,
		&--x-reverse-transition-leave-to,
		&--y-transition-leave-from,
		&--y-transition-leave-to,
		&--y-reverse-transition-leave-from,
		&--y-reverse-transition-leave-to {
			position: absolute !important;
			top: 0;
			width: 100%;
			height: 100%;
		}

		&--x-transition-enter-from {
			transform: translateX(100%);
		}

		&--x-transition-leave-to {
			transform: translateX(-100%);
		}

		&--x-reverse-transition-enter-from {
			transform: translateX(-100%);
		}

		&--x-reverse-transition-leave-to {
			transform: translateX(100%);
		}

		&--y-transition-enter-from {
			transform: translateY(100%);
		}

		&--y-transition-leave-to {
			transform: translateY(-100%);
		}

		&--y-reverse-transition-enter-from {
			transform: translateY(-100%);
		}

		&--y-reverse-transition-leave-to {
			transform: translateY(100%);
		}
	}

	/*********************************************************
	 * origam-fade-transition / origam-scale-rotate-transition
	 *
	 * @description
	 * ⛔ issue #475 — `transition="origam-fade-transition"` /
	 * `"origam-scale-rotate-transition"` were documented (story + doc) as
	 * valid `<OrigamWindowItem>` transition names with NO backing CSS at
	 * all — a silent hard cut, no animation, no error. These are BARE
	 * (non-BEM) top-level selectors, not nested under `.origam-window-item`,
	 * because a raw string passed to `transition`/`reverseTransition` is
	 * used AS-IS as Vue's native `<Transition name="…">` — it does NOT go
	 * through the `origam-window-item--{axis}{direction}-transition`
	 * default the parent `<OrigamWindow>` computes (see `transition`
	 * computed above: `name` is used verbatim when it's already a string).
	 *
	 * @description
	 * Deliberately NOT reusing `<OrigamFade>`/`<OrigamScaleRotate>`'s own
	 * `.origam-transition--fade-*` / `.origam-transition--scale-rotate-*`
	 * classes even though those already exist and work — they don't set
	 * `position: absolute` on the leaving item, which THIS component
	 * needs (see the `--x-transition-leave-from/-leave-to` block above):
	 * without it, the leaving and entering items both sit in the flex
	 * column's normal flow and visibly stack instead of crossfading in
	 * place. `--item-fade-transition-duration/-easing` was already a
	 * registered, emitted token before this fix (a vestige of a feature
	 * started and never finished) — reused here; `--item-scale-rotate-transition-…`
	 * added as its sibling in `tokens/component/window.json`.
	 ********************************************************/
	.origam-fade-transition-enter-active,
	.origam-fade-transition-leave-active {
		transition:
			var(--origam-window---item-fade-transition-duration, 0.2s)
			var(--origam-window---item-fade-transition-easing, cubic-bezier(0, 0, 0.2, 1));
	}

	.origam-fade-transition-leave-from,
	.origam-fade-transition-leave-to {
		position: absolute !important;
		top: 0;
		width: 100%;
		height: 100%;
	}

	.origam-fade-transition-enter-from,
	.origam-fade-transition-leave-to {
		opacity: 0;
	}

	.origam-scale-rotate-transition-enter-active,
	.origam-scale-rotate-transition-leave-active {
		transition:
			var(--origam-window---item-scale-rotate-transition-duration, 0.3s)
			var(--origam-window---item-scale-rotate-transition-easing, cubic-bezier(0.4, 0, 0.2, 1));
	}

	.origam-scale-rotate-transition-leave-from,
	.origam-scale-rotate-transition-leave-to {
		position: absolute !important;
		top: 0;
		width: 100%;
		height: 100%;
	}

	.origam-scale-rotate-transition-enter-from {
		opacity: 0;
		transform: scale(0.9) rotate(-4deg);
	}

	.origam-scale-rotate-transition-leave-to {
		opacity: 0;
		transform: scale(0.9) rotate(4deg);
	}
</style>
