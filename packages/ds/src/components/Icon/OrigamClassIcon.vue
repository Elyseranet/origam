<template>
	<component
			:is="tag"
			:id="id"
			:class="iconClasses"
			:style="iconStyles"
	/>
</template>

<script
		lang="ts"
		setup
>
	import { useBorder } from '../../composables/Commons/border.composable'
	import { useBothColor } from '../../composables/Commons/bothColor.composable'
	import { useDimension } from '../../composables/Commons/dimension.composable'
	import { useMargin } from '../../composables/Commons/margin.composable'
	import { usePadding } from '../../composables/Commons/padding.composable'
	import { useProps } from '../../composables/Commons/props.composable'
	import { useRounded } from '../../composables/Commons/rounded.composable'
	import { useStyle } from '../../composables/Commons/style.composable'
	import { SIZES_ARRAY } from '../../consts/Commons/size.const'
	import type { IClassIconSlots, IIconComponentEmits, IIconComponentProps } from '../../interfaces/Icon/icon.interface'
	import type { TSize } from '../../types/Commons/size.type'

	import { convertToUnit } from '../../utils/Commons/commons.util'

	import { computed, StyleValue, toRef } from 'vue'

	/*********************************************************
	 * Global
	 *
	 * @description
	 * Props and composable setup.
	 ********************************************************/
	const props = withDefaults(defineProps<IIconComponentProps>(), {tag: 'i'})

	const {filterProps} = useProps<IIconComponentProps>(props)

	defineEmits<IIconComponentEmits>()

	defineSlots<IClassIconSlots>()

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
	const {id, css, load, isLoaded, unload} = useStyle(iconStyles, () => props.id)


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
