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
		name: 'origam-transition--fade'
	})

	const {filterProps} = useProps<ITransitionProps>(props)

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
	.origam-transition--fade {
		&-enter-active {
			transition-duration: 0.3s;
			transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
		}

		&-leave-active {
			transition-duration: 0.3s;
			transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
		}

		&-move {
			transition-duration: 0.5s;
			transition-property: transform;
			transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
		}

		&-enter-from, &-leave-to {
			opacity: 0;
		}

		&-enter-active,
		&-leave-active {
			transition-property: opacity;
		}
	}
</style>
