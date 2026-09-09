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
		name: 'origam-transition--slide-x'
	})

	const {filterProps} = useProps<ITransitionProps>(props)

	defineEmits<ITransitionEmits>()

	defineSlots<ITransitionSlots>()

	/*********************************************************
	 * Transition
	 *
	 * @description
	 * CSS-driven horizontal slide transition delegated to
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

	.origam-transition--slide-x {
		&-enter-active {
			transition-duration: var(--origam-transition--slide-x-enter-active---transition-duration);
			transition-timing-function: var(--origam-transition--slide-x-enter-active---transition-timing-function);
		}

		&-leave-active {
			transition-duration: var(--origam-transition--slide-x-leave-active---transition-duration);
			transition-timing-function: var(--origam-transition--slide-x-leave-active---transition-timing-function);
		}

		&-move {
			transition-duration: var(--origam-transition--slide-x-move---transition-duration);
			transition-property: transform;
			transition-timing-function: var(--origam-transition--slide-x-move---transition-timing-function);
		}

		&-enter-from, &-leave-to {
			opacity: 0;
			transform: translateX(-15px);
		}

		&-enter-active,
		&-leave-active {
			transition-property: transform, opacity !important;
		}

		@include ds.ds-reduced-motion {
			&-enter-active,
			&-leave-active,
			&-move {
				transition-duration: 0.01ms !important;
			}
		}
	}
</style>
