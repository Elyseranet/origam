<template>
	<component
			:is="tag"
			:class="iconClasses"
			:style="iconStyles"
	>
		{{ icon }}
	</component>
</template>

<script
		lang="ts"
		setup
>
	import { computed, StyleValue } from 'vue'
	import { useProps , useStyle} from "../../composables"
	import { SIZES_ARRAY } from '../../consts'

	import type { IIconComponentProps } from '../../interfaces'
	import type { TSize } from '../../types'

	import { convertToUnit } from '../../utils'

	/*********************************************************
	 * Global
	 *
	 * @description
	 * Props and composable setup.
	 ********************************************************/
	const props = withDefaults(defineProps<IIconComponentProps>(), {tag: 'div'})

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
			'origam-icon--ligature',
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

<style
		lang="scss"
		scoped
>
	.origam-icon--ligature {
		font-family: 'Material Icons', 'Material Symbols Outlined', sans-serif;
		font-weight: normal;
		font-style: normal;
		text-transform: none;
		letter-spacing: normal;
		word-wrap: normal;
		white-space: nowrap;
		direction: ltr;
		-webkit-font-feature-settings: 'liga';
		-webkit-font-smoothing: antialiased;
	}
</style>
