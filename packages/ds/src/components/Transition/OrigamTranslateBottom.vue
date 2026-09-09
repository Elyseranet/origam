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
		name: 'origam-transition--translate-bottom'
	})

	const {filterProps} = useProps<ITransitionProps>(props)

	defineEmits<ITransitionEmits>()

	defineSlots<ITransitionSlots>()

	/*********************************************************
	 * Transition
	 *
	 * @description
	 * CSS-driven bottom-translate transition delegated to
	 * useCssTransition.
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

	.origam-transition--translate-bottom {
		&-enter-active {
			transition-duration: var(--origam-transition--translate-bottom-enter-active---transition-duration);
			transition-timing-function: var(--origam-transition--translate-bottom-enter-active---transition-timing-function);
		}

		&-leave-active {
			transition-duration: var(--origam-transition--translate-bottom-leave-active---transition-duration);
			transition-timing-function: var(--origam-transition--translate-bottom-leave-active---transition-timing-function);
		}

		&-enter-active,
		&-leave-active {
			transition-property: transform, opacity;
			pointer-events: none;
		}

		&-enter-from, &-leave-to {
			transform: translateY(calc(50vh + 50%));
		}

		@include ds.ds-reduced-motion {
			&-enter-active,
			&-leave-active {
				transition-duration: 0.01ms !important;
			}
		}
	}
</style>
