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
	import { OrigamFade } from '../../components'
	import { useProps, useTransition } from '../../composables'
	import type { ITransitionComponentProps } from '../../interfaces'
	import type { TTransitionProps } from '../../types'

	import { omit } from '../../utils'

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
