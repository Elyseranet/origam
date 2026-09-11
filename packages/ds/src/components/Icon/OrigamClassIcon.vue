<template>
	<component
			:is="tag"
			:class="iconClasses"
			:style="iconStyles"
	/>
</template>

<script
		lang="ts"
		setup
>
	import { useProps , useStyle} from "../../composables"
	import { SIZES_ARRAY } from '../../consts'
	import type { IIconComponentProps } from '../../interfaces'
	import type { TSize } from '../../types'

	import { convertToUnit } from '../../utils'

	import { computed, StyleValue } from 'vue'

	/*********************************************************
	 * Global
	 *
	 * @description
	 * Props and composable setup.
	 ********************************************************/
	const props = withDefaults(defineProps<IIconComponentProps>(), {tag: 'i'})

	const {filterProps} = useProps<IIconComponentProps>(props)

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
				'line-height': numericSize
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
			namedSize,
			props.icon,
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
