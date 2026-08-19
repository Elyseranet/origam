<template>
	<component
			:is="tag"
			:id="id"
			:class="iconClasses"
			:style="iconStyles"
	>
		<svg
				aria-hidden="true"
				class="origam-icon__svg"
				focusable="false"
				viewBox="0 0 24 24"
				xmlns="http://www.w3.org/2000/svg"
		>
			<template v-if="!isArray(icon)">
				<path :d="(icon as string)"></path>
			</template>
			<template v-else>
				<template
						v-for="(path, index) in icon"
						:key="index"
				>
					<template v-if="isArray(path)">
						<path
								:d="path[0]"
								:fill-opacity="path[1]"
						></path>
					</template>
					<template v-else>
						<path :d="path"></path>
					</template>
				</template>
			</template>
		</svg>
	</component>
</template>

<script
		lang="ts"
		setup
>
	import { computed, StyleValue, toRef } from 'vue'
	import { useBorder } from '../../composables/Commons/border.composable'
	import { useBothColor } from '../../composables/Commons/bothColor.composable'
	import { useDimension } from '../../composables/Commons/dimension.composable'
	import { useMargin } from '../../composables/Commons/margin.composable'
	import { usePadding } from '../../composables/Commons/padding.composable'
	import { useProps } from '../../composables/Commons/props.composable'
	import { useRounded } from '../../composables/Commons/rounded.composable'
	import { useStyle } from '../../composables/Commons/style.composable'
	import { SIZES_ARRAY } from '../../consts/Commons/size.const'

	import type { IIconComponentProps } from '../../interfaces/Icon/icon.interface'
	import type { TSize } from '../../types/Commons/size.type'

	import { convertToUnit } from '../../utils/Commons/commons.util'

	/*********************************************************
	 * Global
	 *
	 * @description
	 * Props, composable setup, and array-path guard for multi-path SVGs.
	 ********************************************************/
	const props = withDefaults(defineProps<IIconComponentProps>(), {tag: 'div'})

	const {filterProps} = useProps<IIconComponentProps>(props)

	const isArray = (data: any) => {
		return Array.isArray(data)
	}

	/*********************************************************
	 * Composables
	 *
	 * @description
	 * `IIconComponentProps` carries the full color / spacing / border /
	 * dimension / rounded surface. `OrigamIcon` resolves it and passes the
	 * result down as `class` / `style`, so these axes work when the glyph
	 * leaf is reached through the parent. The leaf is also exported on the
	 * public barrel, and used directly it dropped every one of them. The
	 * parent forwards only `icon` / `size` / `tag` / `class` / `style`, so
	 * consuming the props here cannot double-apply.
	 *
	 * `dimensionStyles` is pushed AFTER the `size`-derived width/height so an
	 * explicit `width` / `height` beats the size shorthand.
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
				'width': numericSize,
				'height': numericSize
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
			'origam-icon--svg',
			namedSize,
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

<style
		lang="scss"
		scoped
>
	.origam-icon--svg {
		display: inline-flex;
		align-items: center;
		justify-content: center;

		.origam-icon__svg {
			width: 1em;
			height: 1em;
			fill: currentColor;
		}
	}
</style>
