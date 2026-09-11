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

	import type { ITransitionEmits, ITransitionNoOriginProps, ITransitionSlots } from '../../interfaces/Transition/transition.interface'

	/*********************************************************
	 * Global
	 *
	 * @description
	 * Props with defaults and filterProps utility.
	 ********************************************************/
	const props = withDefaults(defineProps<ITransitionNoOriginProps>(), {
		name: 'origam-transition--fade'
	})

	const {filterProps} = useProps<ITransitionNoOriginProps>(props)

	defineEmits<ITransitionEmits>()

	defineSlots<ITransitionSlots>()

	/*********************************************************
	 * Transition
	 *
	 * @description
	 * CSS-driven fade transition delegated to useCssTransition.
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

	.origam-transition--fade {
		&-enter-active {
			transition-duration: var(--origam-transition--fade-enter-active---transition-duration);
			transition-timing-function: var(--origam-transition--fade-enter-active---transition-timing-function);
		}

		&-leave-active {
			transition-duration: var(--origam-transition--fade-leave-active---transition-duration);
			transition-timing-function: var(--origam-transition--fade-leave-active---transition-timing-function);
		}

		&-move {
			transition-duration: var(--origam-transition--fade-move---transition-duration);
			transition-property: transform;
			transition-timing-function: var(--origam-transition--fade-move---transition-timing-function);
		}

		&-enter-from, &-leave-to {
			opacity: 0;
		}

		&-enter-active,
		&-leave-active {
			transition-property: opacity;
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
