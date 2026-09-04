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
	import { useProps } from '../../composables/Commons/props.composable'
	import { useWindowTransition } from '../../composables/Transition/windowTransition.composable'

	import type { ITransitionEmits, ITransitionNoOriginProps, ITransitionSlots } from '../../interfaces/Transition/transition.interface'

	/*********************************************************
	 * Global
	 *
	 * @description
	 * Props with defaults and filterProps utility.
	 ********************************************************/
	const props = withDefaults(defineProps<ITransitionNoOriginProps>(), {
		name: 'origam-transition--window-x-translate'
	})

	const {filterProps} = useProps<ITransitionNoOriginProps>(props)

	defineEmits<ITransitionEmits>()

	defineSlots<ITransitionSlots>()

	/*********************************************************
	 * Transition
	 *
	 * @description
	 * Window horizontal forward-slide transition delegated to
	 * useWindowTransition.
	 ********************************************************/

	/*********************************************************
	 * Composables
	 ********************************************************/

	const {name, tag, transitionProps} = useWindowTransition(props)

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

	.origam-transition--window-x-translate {
		&-enter-active,
		&-leave-active {
			transition: 0.3s cubic-bezier(0.25, 0.8, 0.5, 1);
		}

		&-leave-from,
		&-leave-to {
			position: absolute !important;
			top: 0;
			width: 100%;
		}

		&-enter-from {
			transform: translateX(100%);
		}

		&-leave-to {
			transform: translateX(-100%);
		}

		@include ds.ds-reduced-motion {
			&-enter-active,
			&-leave-active {
				transition-duration: 0.01ms !important;
			}
		}

	}
</style>
