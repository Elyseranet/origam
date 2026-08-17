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
	import {
		useBorder,
		useBothColor,
		useDimension,
		useMargin,
		usePadding,
		useProps,
		useRounded,
		useStyle
	} from "../../composables"
	import { SIZES_ARRAY } from '../../consts'
	import type { IIconComponentProps } from '../../interfaces'
	import type { TSize } from '../../types'

	import { convertToUnit } from '../../utils'

	import { computed, StyleValue, toRef } from 'vue'

	/*********************************************************
	 * Global
	 *
	 * @description
	 * Props and composable setup.
	 ********************************************************/
	const props = withDefaults(defineProps<IIconComponentProps>(), {tag: 'i'})

	const {filterProps} = useProps<IIconComponentProps>(props)

	/*********************************************************
	 * Composables
	 *
	 * @description
	 * `IIconComponentProps` extends IColorProps / IBgColorProps /
	 * IPaddingProps / IMarginProps / IBorderProps / IDimensionProps /
	 * IRoundedProps. `OrigamIcon` resolves those axes and hands the result
	 * down as `class` / `style`, so the glyph leaves render them correctly
	 * WHEN reached through the parent — but the leaves are exported on the
	 * public barrel too, and a consumer writing `<origam-class-icon
	 * padding="8px">` directly got nothing at all. Consuming the same
	 * composables here closes that path; the parent never forwards these
	 * props (it forwards `icon` / `size` / `tag` / `class` / `style`), so
	 * there is no double application.
	 ********************************************************/
	const {colorClasses, colorStyles} = useBothColor(toRef(props, 'bgColor'), toRef(props, 'color'))
	const {borderClasses, borderStyles} = useBorder(props)
	const {paddingClasses, paddingStyles} = usePadding(props)
	const {marginClasses, marginStyles} = useMargin(props)
	const {roundedClasses, roundedStyles} = useRounded(props)
	const {dimensionStyles} = useDimension(props)

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
			colorStyles.value,
			borderStyles.value,
			roundedStyles.value,
			dimensionStyles.value,
			marginStyles.value,
			paddingStyles.value,
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
			colorClasses.value,
			borderClasses.value,
			roundedClasses.value,
			paddingClasses.value,
			marginClasses.value,
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
