<template>
	<component
			:is="component"
			v-bind="transitionProps"
	>
		<slot name="default"/>
	</component>
</template>

<script
		lang="ts"
		setup
>
	import { computed, mergeProps, Transition, useAttrs } from 'vue'
	import OrigamFade from './OrigamFade.vue'
	import { useProps } from '../../composables/Commons/props.composable'
	import { useTransition } from '../../composables/Transition/transition.composable'
	import type { ITransitionComponentProps } from '../../interfaces/Commons/transition-component.interface'
	import type { ITransitionSlots } from '../../interfaces/Transition/transition.interface'
	import type { TTransitionProps } from '../../types/Transition/transition.type'

	import { omit } from '../../utils/Commons/commons.util'

	/*********************************************************
	 * Global
	 *
	 * @description
	 * Props with defaults and filterProps utility.
	 ********************************************************/
	const props = withDefaults(defineProps<ITransitionComponentProps>(), {
		transition: () => ({component: OrigamFade}) as unknown as TTransitionProps
	})

	const {filterProps} = useProps<ITransitionComponentProps>(props)

	defineSlots<ITransitionSlots>()

	const attrs = useAttrs()

	/*********************************************************
	 * Composables
	 ********************************************************/

	const {isDisabled} = useTransition(props)

	/*********************************************************
	 * Transition resolution
	 *
	 * @description
	 * Resolves the dynamic component (named Vue Transition or
	 * a custom component) and merges props + attrs into the
	 * final transitionProps object.
	 ********************************************************/
	const component = computed(() => {
		return typeof props.transition === 'object' && props.transition.component ? props.transition.component : Transition
	})
	const customProps = computed(() => {
		return typeof props.transition === 'object' ? omit(props.transition, ['component']) : {}
	})
	const transitionProps = computed(() => {
		return mergeProps(
				typeof props.transition === 'string' ? {name: isDisabled.value ? '' : props.transition} : {...customProps.value},
				{...attrs},
				{disabled: isDisabled.value})
	})

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
