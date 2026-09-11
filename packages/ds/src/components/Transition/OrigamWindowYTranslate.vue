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
	import { useProps, useWindowTransition } from '../../composables'

	import type { ITransitionProps } from '../../interfaces'

	/*********************************************************
	 * Global
	 *
	 * @description
	 * Props with defaults and filterProps utility.
	 ********************************************************/
	const props = withDefaults(defineProps<ITransitionProps>(), {
		name: 'origam-transition--window-y-translate'
	})

	const {filterProps} = useProps<ITransitionProps>(props)

	/*********************************************************
	 * Transition
	 *
	 * @description
	 * Window vertical forward-slide transition delegated to
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
	.origam-transition--window-y-translate {
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
			transform: translateY(100%);
		}

		&-leave-to {
			transform: translateY(-100%);
		}
	}
</style>
