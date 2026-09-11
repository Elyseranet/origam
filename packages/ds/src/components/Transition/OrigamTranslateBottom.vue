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
		name: 'origam-transition--translate-bottom'
	})

	const {filterProps} = useProps<ITransitionProps>(props)

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
	.origam-transition--translate-bottom {
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
			transform: translateY(calc(50vh + 50%));
		}
	}
</style>
