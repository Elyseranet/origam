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
	import { useCssTransition, useProps } from '../../composables'

	import type { ITransitionProps } from '../../interfaces'

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
	.origam-transition--translate-picker {
		&-enter-active {
			transition-duration: 0.3s !important;
			transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1) !important;
		}

		&-leave-active {
			transition-duration: 0.3s !important;
			transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1) !important;
		}

		&-move {
			transition-duration: 0.3s !important;
			transition-property: transform !important;
			transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1) !important;
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
	}
</style>
