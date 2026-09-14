<template>
	<component
			:is="tag"
			:name="name"
			v-bind="transitionProps"
	>
		<slot name="default"/>
	</component>
</template>

<script
		lang="ts"
		setup
>
	import { useCssTransition } from '../../composables/Transition/cssTransition.composable'
	import { useProps } from '../../composables/Commons/props.composable'

	import type { ITransitionEmits, ITransitionProps, ITransitionSlots } from '../../interfaces/Transition/transition.interface'

	/*********************************************************
	 * Global
	 *
	 * @description
	 * Props with defaults and filterProps utility.
	 ********************************************************/
	const props = withDefaults(defineProps<ITransitionProps>(), {
		name: 'origam-transition--translate-picker'
	})

	const {filterProps} = useProps<ITransitionProps>(props)

	defineEmits<ITransitionEmits>()

	defineSlots<ITransitionSlots>()

	/*********************************************************
	 * Transition
	 *
	 * @description
	 * CSS-driven picker-translate (forward direction) delegated
	 * to useCssTransition.
	 ********************************************************/

	/*********************************************************
	 * Composables
	 ********************************************************/

	const {name, tag, transitionProps} = useCssTransition(props)

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

	.origam-transition--translate-picker {
		&-enter-active {
			transition-duration: var(--origam-transition--translate-picker-enter-active---transition-duration) !important;
			transition-timing-function: var(--origam-transition--translate-picker-enter-active---transition-timing-function) !important;
		}

		&-leave-active {
			transition-duration: var(--origam-transition--translate-picker-leave-active---transition-duration) !important;
			transition-timing-function: var(--origam-transition--translate-picker-leave-active---transition-timing-function) !important;
		}

		&-move {
			transition-duration: var(--origam-transition--translate-picker-move---transition-duration) !important;
			transition-property: transform !important;
			transition-timing-function: var(--origam-transition--translate-picker-move---transition-timing-function) !important;
		}

		&-enter-from,
		&-leave-to {
			opacity: 0;
		}

		&-leave-from,
		&-leave-active,
		&-leave-to {
			position: absolute !important;
		}

		&-enter-active,
		&-leave-active {
			transition-property: transform, opacity !important;
		}

		&-enter-from {
			transform: translate(100%, 0);
		}

		&-leave-to {
			transform: translate(-100%, 0);
		}

		// Placed AFTER the `!important` base rules above: equal specificity,
		// equal importance — the later declaration in source order wins
		// when the media query matches.
		@include ds.ds-reduced-motion {
			&-enter-active,
			&-leave-active,
			&-move {
				transition-duration: 0.01ms !important;
			}
		}
	}
</style>
