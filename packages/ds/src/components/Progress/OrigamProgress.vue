<template>
	<component
			:is="progressComponent"
			ref="origamProgressRef"
			:aria-busy="indeterminate ? true : undefined"
			:aria-hidden="!active"
			:aria-label="progressAriaLabel"
			:aria-valuemax="max"
			:aria-valuenow="indeterminate ? undefined : normalizedValue"
			:class="progressClasses"
			:style="progressStyles"
			aria-valuemin="0"
			role="progressbar"
			v-bind="progressProps"
	>
		<template
				v-if="hasContent"
				#default
		>
			<slot name="default"/>
		</template>
	</component>
</template>

<script
		lang="ts"
		setup
>
	import { computed, ref, StyleValue } from 'vue'
	import { OrigamProgressCircular, OrigamProgressLinear } from '../../components'

	import {
	useProgress,
	useProps,
	useSize,
	useStyle
} from '../../composables'

	import { PROGRESS_TYPE, SIZES } from '../../enums'

	import type { IProgressProps } from '../../interfaces'

	import type { TOrigamProgressCircular, TOrigamProgressLinear } from "../../types"

	/*********************************************************
	 * Global
	 *
	 * @description
	 * Props and filterProps for the Progress wrapper component.
	 ********************************************************/
	const props = withDefaults(defineProps<IProgressProps>(), {
		tag: 'div',
		modelValue: 0,
		max: 100,
		thickness: 4,
		size: SIZES.DEFAULT
	})

	const {filterProps} = useProps<IProgressProps>(props)

	/*********************************************************
	 * DOM refs
	 *
	 * @description
	 * Ref to the rendered circular or linear sub-component
	 * so we can forward filterProps.
	 ********************************************************/
	const origamProgressRef = ref<TOrigamProgressCircular | TOrigamProgressLinear>()

	/*********************************************************
	 * Decorators & progress state
	 *
	 * @description
	 * Size utilities and normalized value / hasContent flags.
	 ********************************************************/

	/*********************************************************
	 * Composables
	 ********************************************************/

	const {sizeClasses, sizeStyles} = useSize(props)
	const {normalizedValue, hasContent} = useProgress(props)

	const progressAriaLabel = computed(() => props.label ?? 'Loading')

	/*********************************************************
	 * Component selection
	 *
	 * @description
	 * Switch between circular and linear sub-component based
	 * on the `type` prop.
	 ********************************************************/
	const isCircular = computed(() => {
		return props.type === PROGRESS_TYPE.CIRCULAR
	})
	const progressComponent = computed(() => {
		return isCircular.value ? OrigamProgressCircular : OrigamProgressLinear
	})

	/*********************************************************
	 * Forwarded props
	 ********************************************************/

	const progressProps = computed(() => {
		return (origamProgressRef.value as any)?.filterProps(props)
	})

	/*********************************************************
	 * Class & Style
	 *
	 * @description
	 * progressStyles and progressClasses compose the BEM block.
	 ********************************************************/
	const progressStyles = computed(() => {
		return [
			sizeStyles.value,
			props.style
		] as StyleValue
	})
	const progressClasses = computed(() => {
		return [
			sizeClasses.value,
			props.class
		]
	})
	const {id, css, load, isLoaded, unload} = useStyle(progressStyles)


	/*********************************************************
	 * Expose
	 *
	 * @description
	 * Exposes filterProps to parent ref consumers.
	 ********************************************************/
	defineExpose({
		filterProps,
		css,
		id,
		load,
		unload,
		isLoaded
	})
</script>
