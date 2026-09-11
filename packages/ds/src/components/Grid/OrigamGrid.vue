<template>
	<component
			:is="tag"
			:class="gridClasses"
			:style="gridStyles"
	>
		<slot/>
	</component>
</template>

<script
		lang="ts"
		setup
>
	import { computed, StyleValue, toRef } from 'vue'

	import {
		useBorder,
		useBothColor,
		useDimension,
		useElevation,
		useMargin,
		usePadding,
		useProps,
		useRounded
	} from '../../composables'

	import { GRID_GAP_SIZE_VAR } from '../../consts'

	import type { IGridProps, TGridTracks } from '../../interfaces'

	import type { TGridGapSize } from '../../types'

	/*********************************************************
	 * Global
	 *
	 * @description
	 * Props + defaults for `<OrigamGrid>`. The component is a
	 * declarative wrapper around CSS Grid — it does NOT measure
	 * tracks, ResizeObserver children, or fall back to flex on
	 * older browsers. CSS Grid has been stable in every evergreen
	 * browser since 2017 (Safari 10.1, Edge 16, Firefox 52,
	 * Chrome 57) so we lean on the platform.
	 ********************************************************/
	const props = withDefaults(defineProps<IGridProps>(), {
		tag: 'div',
		columns: 'auto',
		rows: 'auto',
		gap: 'md',
		autoFlow: 'row',
		alignItems: 'stretch',
		justifyItems: 'stretch',
		inline: false,
		columnGap: undefined,
		rowGap: undefined,
		alignContent: undefined,
		justifyContent: undefined,
		areas: undefined,
		autoColumns: undefined,
		autoRows: undefined
	})

	const {filterProps} = useProps<IGridProps>(props)

	/*********************************************************
	 * Track serialisation
	 *
	 * @description
	 * `columns` / `rows` accept three shapes (number, string,
	 * string[]). We collapse them all to a single CSS string
	 * here so the template stays trivial.
	 *
	 * `number` → `repeat(N, 1fr)` — the 90 % case ("12 columns
	 * of equal width").
	 ********************************************************/
	const serialiseTracks = (value: TGridTracks | undefined): string | undefined => {
		if (value == null) return undefined
		if (typeof value === 'number') {
			if (!Number.isFinite(value) || value < 1) return undefined

			return `repeat(${Math.floor(value)}, 1fr)`
		}
		if (Array.isArray(value)) return value.join(' ')

		return String(value)
	}

	const columnsCss = computed<string | undefined>(() => serialiseTracks(props.columns))
	const rowsCss = computed<string | undefined>(() => serialiseTracks(props.rows))

	/*********************************************************
	 * Areas serialisation
	 *
	 * @description
	 * `areas` accepts either a string (passed verbatim) or an
	 * array of strings (each entry = one row, we wrap each entry
	 * in double quotes to match CSS syntax).
	 ********************************************************/
	const areasCss = computed<string | undefined>(() => {
		const v = props.areas
		if (v == null) return undefined
		if (Array.isArray(v)) {
			if (v.length === 0) return undefined

			return v.map(line => `"${line}"`).join(' ')
		}

		return String(v)
	})

	/*********************************************************
	 * Gap serialisation
	 *
	 * @description
	 * The gap props accept tokens ('xs' | 'sm' | …), CSS strings,
	 * or plain numbers (interpreted as pixels). We resolve to a
	 * single CSS string here — tokens become `var(--origam-grid---gap-{token})`
	 * references, numbers get a `px` suffix, strings pass through.
	 *
	 * Whether a string is a "token" or "raw CSS" is decided by
	 * presence in `GRID_GAP_SIZE_VAR` — this avoids surprising
	 * a consumer who legitimately wants `gap="xs"` to map to the
	 * token and not to a literal 2-character CSS length.
	 ********************************************************/
	const serialiseGap = (value: TGridGapSize | string | number | undefined): string | undefined => {
		if (value == null) return undefined
		if (typeof value === 'number') {
			if (!Number.isFinite(value)) return undefined

			return `${value}px`
		}
		if (typeof value === 'string') {
			if (value in GRID_GAP_SIZE_VAR) return GRID_GAP_SIZE_VAR[value as TGridGapSize]

			return value
		}

		return undefined
	}

	const gapCss = computed<string | undefined>(() => serialiseGap(props.gap))
	const columnGapCss = computed<string | undefined>(() => serialiseGap(props.columnGap))
	const rowGapCss = computed<string | undefined>(() => serialiseGap(props.rowGap))

	/*********************************************************
	 * Composables
	 ********************************************************/
	const {colorClasses, colorStyles} = useBothColor(toRef(props, 'bgColor'), toRef(props, 'color'))
	const {borderClasses, borderStyles} = useBorder(props)
	const {roundedClasses, roundedStyles} = useRounded(props)
	const {elevationClasses} = useElevation(props)
	const {dimensionStyles} = useDimension(props)
	const {paddingClasses, paddingStyles} = usePadding(props)
	const {marginClasses, marginStyles} = useMargin(props)

	/*********************************************************
	 * Class & Style
	 *
	 * @description
	 * Everything not driven by a class lives on the inline style
	 * via custom properties — the SCSS reads them with default
	 * fallbacks so an "empty" `<OrigamGrid>` still produces a
	 * sensible 1-column grid.
	 ********************************************************/
	const gridStyles = computed<StyleValue>(() => {
		const style: Record<string, string> = {}

		if (columnsCss.value) style['--origam-grid---template-columns'] = columnsCss.value
		if (rowsCss.value) style['--origam-grid---template-rows'] = rowsCss.value
		if (areasCss.value) style['--origam-grid---template-areas'] = areasCss.value
		if (gapCss.value) style['--origam-grid---gap'] = gapCss.value
		if (columnGapCss.value) style['--origam-grid---column-gap'] = columnGapCss.value
		if (rowGapCss.value) style['--origam-grid---row-gap'] = rowGapCss.value
		if (props.autoFlow) style['--origam-grid---auto-flow'] = props.autoFlow
		if (props.autoColumns) style['--origam-grid---auto-columns'] = props.autoColumns
		if (props.autoRows) style['--origam-grid---auto-rows'] = props.autoRows
		if (props.alignItems) style['--origam-grid---align-items'] = props.alignItems
		if (props.justifyItems) style['--origam-grid---justify-items'] = props.justifyItems
		if (props.alignContent) style['--origam-grid---align-content'] = props.alignContent
		if (props.justifyContent) style['--origam-grid---justify-content'] = props.justifyContent

		return [
			style,
			colorStyles.value,
			borderStyles.value,
			roundedStyles.value,
			dimensionStyles.value,
			paddingStyles.value,
			marginStyles.value,
			props.style
		] as StyleValue
	})

	const gridClasses = computed(() => {
		return [
			'origam-grid',
			{
				'origam-grid--inline': props.inline
			},
			colorClasses.value,
			borderClasses.value,
			roundedClasses.value,
			elevationClasses.value,
			paddingClasses.value,
			marginClasses.value,
			props.class
		]
	})

	/*********************************************************
	 * Expose
	 ********************************************************/
	defineExpose({
		filterProps,
		columnsCss,
		rowsCss,
		areasCss,
		gapCss,
		columnGapCss,
		rowGapCss
	})
</script>

<style
		lang="scss"
		scoped
>
	.origam-grid {
		display: grid;
		grid-template-columns: var(--origam-grid---template-columns, none);
		grid-template-rows: var(--origam-grid---template-rows, none);
		grid-template-areas: var(--origam-grid---template-areas, none);
		grid-auto-flow: var(--origam-grid---auto-flow, row);
		grid-auto-columns: var(--origam-grid---auto-columns, auto);
		grid-auto-rows: var(--origam-grid---auto-rows, auto);
		gap: var(--origam-grid---gap, var(--origam-grid---gap-md));
		column-gap: var(--origam-grid---column-gap, var(--origam-grid---gap));
		row-gap: var(--origam-grid---row-gap, var(--origam-grid---gap));
		align-items: var(--origam-grid---align-items, stretch);
		justify-items: var(--origam-grid---justify-items, stretch);
		align-content: var(--origam-grid---align-content, normal);
		justify-content: var(--origam-grid---justify-content, normal);

		&--inline {
			display: inline-grid;
		}
	}
</style>
