<template>
	<component
			:is="tag"
			:class="iconClasses"
			:style="iconStyles"
	>
		<slot name="default">
			<component
					:is="iconComponent"
					v-if="hasIcon"
			/>
		</slot>
	</component>
</template>

<script
		lang="ts"
		setup
>
	import { useProps , useStyle} from "../../composables"
	import { SIZES_ARRAY } from '../../consts'

	import type { IIconComponentProps } from '../../interfaces'
	import type { Component } from 'vue'
	import { computed, StyleValue } from 'vue'

	import type { TSize } from '../../types'
	import { convertToUnit } from '../../utils'

	/*********************************************************
	 * Global
	 *
	 * @description
	 * Props, composable setup, and icon component resolution.
	 ********************************************************/
	const props = withDefaults(defineProps<IIconComponentProps>(), {tag: 'div'})

	const {filterProps} = useProps<IIconComponentProps>(props)

	const hasIcon = computed(() => {
		return !!props.icon
	})
	const iconComponent = computed(() => {
		return props.icon as Component
	})

	/*********************************************************
	 * Class & Style
	 *
	 * @description
	 * Composable-driven class and style composition.
	 ********************************************************/
	const iconStyles = computed(() => {
		const numericSize = typeof props.size === 'number'
				? convertToUnit(props.size)
				: undefined

		return [
			{
				'font-size': numericSize,
				'width': numericSize,
				'height': numericSize
			},
			props.style
		] as StyleValue
	})

	const iconClasses = computed(() => {
		const namedSize = typeof props.size === 'string' && SIZES_ARRAY.includes(props.size as TSize)
				? `origam-icon--size-${props.size}`
				: undefined

		return [
			'origam-icon',
			'origam-icon--component',
			namedSize,
			props.class
		]
	})
	const {id, css, load, isLoaded, unload} = useStyle(iconStyles)


	/*********************************************************
	 * Expose
	 *
	 * @description
	 * Forwards filterProps to parent components.
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
