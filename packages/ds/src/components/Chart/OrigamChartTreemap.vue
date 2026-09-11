<template>
	<div
			class="origam-chart-treemap"
			:class="rootClasses"
			:style="[rootStyles, dimensionStyles, marginStyles, paddingStyles, backgroundColorStyles, elevationStyles, roundedStyles, headerTypographyStyles]"
			role="figure"
			:aria-label="ariaLabel"
			data-cy="origam-chart-treemap"
	>
		<header
				v-if="hasTitleBlock"
				class="origam-chart-treemap__header"
				data-cy="origam-chart-treemap-header"
		>
			<slot name="title">
				<div
						v-if="title"
						class="origam-chart-treemap__title"
				>
					{{ title }}
				</div>
				<div
						v-if="subtitle"
						class="origam-chart-treemap__subtitle"
				>
					{{ subtitle }}
				</div>
			</slot>
		</header>

		<div
				class="origam-chart-treemap__body"
				:class="bodyClasses"
				data-cy="origam-chart-treemap-body"
		>
			<svg
					ref="svgRef"
					class="origam-chart-treemap__svg origam-chart__svg"
					:class="svgClasses"
					:viewBox="`0 0 ${ SVG_WIDTH } ${ SVG_HEIGHT }`"
					role="img"
					:aria-label="svgAriaLabel"
					preserveAspectRatio="xMidYMid meet"
					data-cy="origam-chart-treemap-svg"
					@mousemove="onSvgMouseMove"
					@mouseleave="onSvgMouseLeave"
			>
				<title>{{ svgTitle }}</title>
				<desc>{{ svgDesc }}</desc>

				<g
						class="origam-chart__series"
						data-cy="origam-chart-treemap-series"
				>
					<g
							v-for="tile in visibleTiles"
							:key="tile.key"
							class="origam-chart__treemap-tile-group"
							:data-cy="`origam-chart-treemap-tile-group-${ tile.index }`"
					>
						<rect
								class="origam-chart__treemap-tile"
								:class="{ 'origam-chart__treemap-tile--active': hoveredIndex === tile.index }"
								:x="tile.x"
								:y="tile.y"
								:width="tile.width"
								:height="tile.height"
								rx="2"
								ry="2"
								:style="{ fill: tile.color }"
								:data-cy="`origam-chart-treemap-tile-${ tile.index }`"
								tabindex="0"
								role="button"
								:aria-label="tileAriaLabel(tile)"
								@click="onTileActivate(tile, $event)"
								@keydown.enter.prevent="onTileActivate(tile, $event)"
								@keydown.space.prevent="onTileActivate(tile, $event)"
								@mouseenter="onTileEnter(tile)"
								@mouseleave="onTileLeave"
						/>

						<text
								v-if="showLabel && tile.labelFits"
								class="origam-chart__treemap-label"
								:x="tile.x + tile.width / 2"
								:y="tile.y + tile.height / 2 - 6"
								text-anchor="middle"
								dominant-baseline="middle"
								:data-cy="`origam-chart-treemap-label-name-${ tile.index }`"
						>
							{{ tile.name }}
						</text>

						<text
								v-if="showLabel && tile.labelFits"
								class="origam-chart__treemap-label origam-chart__treemap-label--value"
								:x="tile.x + tile.width / 2"
								:y="tile.y + tile.height / 2 + 10"
								text-anchor="middle"
								dominant-baseline="middle"
								:data-cy="`origam-chart-treemap-label-value-${ tile.index }`"
						>
							{{ tile.formatted }}
						</text>
					</g>
				</g>
			</svg>

			<origam-chart-tooltip
					v-if="showTooltip"
					:point="hoveredPoint"
					:series="hoveredSeries"
					:category="hoveredCategory"
					:x="mousePos.x"
					:y="mousePos.y"
					:y-axis-format="yAxisFormat"
			>
				<template
						v-if="$slots.tooltip"
						#default="bindings"
				>
					<slot
							name="tooltip"
							v-bind="bindings"
					/>
				</template>
			</origam-chart-tooltip>

			<div
					v-if="showEmpty"
					class="origam-chart-treemap__empty origam-chart__empty"
					data-cy="origam-chart-treemap-empty"
			>
				<slot name="empty">
					<span>No data to display</span>
				</slot>
			</div>
		</div>

		<origam-chart-legend
				v-if="showLegend"
				:items="legendItems"
				:position="legendPosition"
				@legend-click="onLegendClick"
				@series-toggle="onSeriesToggle"
		>
			<template
					v-if="$slots['legend-item']"
					#legend-item="bindings"
			>
				<slot
						name="legend-item"
						v-bind="bindings"
				/>
			</template>
		</origam-chart-legend>
	</div>
</template>

<script
		lang="ts"
		setup
>
	import {
		computed,
		ref,
		type StyleValue
	} from 'vue'

	import OrigamChartLegend from './OrigamChartLegend.vue'
	import OrigamChartTooltip from './OrigamChartTooltip.vue'

	import {
		useChartHeaderTypography,
		useBackgroundColor,
		useDimension,
		useElevation,
		useMargin,
		usePadding,
		useRounded
	} from '../../composables'

	import type {
		IChartLegendItem,
		IChartPoint,
		IChartSeries,
		IChartTreemapEmits,
		IChartTreemapProps,
		IChartTreemapTile
	} from '../../interfaces'

	import { intentBgExpr, isIntent } from '../../utils/Commons/color.util'

	import type { TIntent } from '../../types'

	/*********************************************************
	 * Global
	 *
	 * @description
	 * Treemap chart family. Renders a single series of N data
	 * items as nested rectangles (tiles) sized proportionally
	 * to their value. Supports two layout algorithms:
	 *
	 * - `squarified` — Bruls/Huijse/van Wijk algorithm that
	 *   minimises the worst-case aspect ratio of each row.
	 *   Produces compact, nearly-square tiles.
	 *
	 * - `slice-dice` — Alternates horizontal and vertical splits.
	 *   Tiles tend to be long/thin but preserve sort order.
	 *
	 * v1 renders a **flat single-level** treemap. Children inside
	 * each datum are reserved for a future drilldown mode.
	 *
	 * `withDefaults` literals only, per CLAUDE.md.
	 ********************************************************/
	defineOptions({
		name: 'OrigamChartTreemap'
	})

	const props = withDefaults(defineProps<IChartTreemapProps>(), {
		height: 400,
		title: undefined,
		subtitle: undefined,
		showLegend: true,
		legendPosition: 'bottom',
		showTooltip: true,
		animated: true,
		animationDuration: 600,
		colorScheme: () => [],
		aspectRatio: undefined,
		algorithm: 'squarified',
		showLabel: true,
		yAxisFormat: undefined,
		categories: () => []
	})

	const emit = defineEmits<IChartTreemapEmits>()

	const { dimensionStyles } = useDimension(props)
	const { backgroundColorClasses, backgroundColorStyles } = useBackgroundColor(props, 'bgColor')
	const { elevationClasses, elevationStyles } = useElevation(props)
	const { marginStyles } = useMargin(props)
	const { paddingStyles } = usePadding(props)
	const { roundedClasses, roundedStyles } = useRounded(props)
	const { headerTypographyStyles } = useChartHeaderTypography(props)

	/*********************************************************
	 * Static SVG box — fixed 600 × 400 coordinate space.
	 * CSS scales the SVG to fill its container.
	 ********************************************************/
	const SVG_WIDTH = 600
	const SVG_HEIGHT = 400
	const PADDING = { top: 8, right: 8, bottom: 8, left: 8 }
	const LABEL_MIN_WIDTH = 60
	const LABEL_MIN_HEIGHT = 24

	/*********************************************************
	 * Default colour palette — cycles through DS intents
	 ********************************************************/
	const DEFAULT_PALETTE: Array<TIntent> = [
		'primary',
		'success',
		'warning',
		'danger',
		'info',
		'secondary',
		'ghost',
		'neutral'
	]

	const resolveColor = (raw: TIntent | string | undefined): string => {
		if (!raw) return 'currentColor'
		if (/^(#|rgb|hsl|var|currentColor|transparent|linear-gradient|radial-gradient|conic-gradient)/i.test(raw)) {
			return raw
		}
		if (isIntent(raw)) {
			return intentBgExpr(raw as TIntent, 'default')
		}
		return 'currentColor'
	}

	const colorFor = (datum: { color?: TIntent | string }, dataIndex: number): string => {
		if (datum.color) return resolveColor(datum.color)
		const series = props.series?.[0]
		if (series?.color) return resolveColor(series.color)
		const scheme = props.colorScheme?.length ? props.colorScheme : DEFAULT_PALETTE
		return resolveColor(scheme[dataIndex % scheme.length])
	}

	const formatValue = (v: number): string => {
		if (props.yAxisFormat) return props.yAxisFormat(v)
		return String(v)
	}

	/*********************************************************
	 * Legend — hidden-tile set keyed by tile name
	 ********************************************************/
	const hiddenNames = ref<Set<string>>(new Set())

	/*********************************************************
	 * Geometry helpers
	 *
	 * Both algorithms work on a sorted (descending) list of
	 * normalised areas that sum to the total plot area, then
	 * map those areas back to {x, y, width, height} rects.
	 ********************************************************/

	interface Rect {
		x: number
		y: number
		w: number
		h: number
	}

	/**
	 * Squarified treemap algorithm (Bruls, Huijse & van Wijk, 1999).
	 *
	 * Items in `values` must be pre-sorted descending and already scaled
	 * to fill `bounds` (i.e. sum(values) === bounds.w * bounds.h).
	 *
	 * Returns one {x, y, w, h} rect per input value, preserving order.
	 */
	const squarify = (values: Array<number>, bounds: Rect): Array<Rect> => {
		if (values.length === 0) return []
		if (values.length === 1) {
			return [{ x: bounds.x, y: bounds.y, w: bounds.w, h: bounds.h }]
		}

		const totalArea = bounds.w * bounds.h
		const total = values.reduce((a, b) => a + b, 0)
		const scale = totalArea / (total || 1)
		const scaled = values.map((v) => v * scale)

		const rects: Array<Rect> = []
		layoutRow(scaled, bounds, rects)
		return rects
	}

	const layoutRow = (values: Array<number>, bounds: Rect, rects: Array<Rect>): void => {
		if (values.length === 0) return

		const { x, y, w, h } = bounds
		const isWide = w >= h
		const shortSide = isWide ? h : w

		let rowItems: Array<number> = []
		let remaining = values.slice()

		while (remaining.length > 0) {
			const candidate = remaining[0]
			const trial = [...rowItems, candidate]
			if (rowItems.length === 0 || worstRatio(trial, shortSide) <= worstRatio(rowItems, shortSide)) {
				rowItems = trial
				remaining = remaining.slice(1)
			} else {
				break
			}
		}

		const rowSum = rowItems.reduce((a, b) => a + b, 0)
		const rowThick = rowSum / shortSide

		let cursor = isWide ? y : x
		for (const item of rowItems) {
			const len = item / rowThick
			if (isWide) {
				rects.push({ x, y: cursor, w: rowThick, h: len })
				cursor += len
			} else {
				rects.push({ x: cursor, y, w: len, h: rowThick })
				cursor += len
			}
		}

		if (remaining.length > 0) {
			const nextBounds: Rect = isWide
				? { x: x + rowThick, y, w: w - rowThick, h }
				: { x, y: y + rowThick, w, h: h - rowThick }
			layoutRow(remaining, nextBounds, rects)
		}
	}

	const worstRatio = (items: Array<number>, shortSide: number): number => {
		const sum = items.reduce((a, b) => a + b, 0)
		const rowThick = sum / shortSide
		let worst = 0
		for (const item of items) {
			const len = item / rowThick
			const ratio = rowThick > len ? rowThick / len : len / rowThick
			if (ratio > worst) worst = ratio
		}
		return worst
	}

	/**
	 * Slice-dice algorithm. Alternates between horizontal and vertical
	 * splitting at each call. `depth` starts at 0 (horizontal slice).
	 */
	const sliceDice = (values: Array<number>, bounds: Rect, depth: number): Array<Rect> => {
		if (values.length === 0) return []
		if (values.length === 1) {
			return [{ x: bounds.x, y: bounds.y, w: bounds.w, h: bounds.h }]
		}

		const total = values.reduce((a, b) => a + b, 0)
		const { x, y, w, h } = bounds
		const rects: Array<Rect> = []
		const horizontal = depth % 2 === 0

		let cursor = horizontal ? x : y
		const along = horizontal ? w : h
		const across = horizontal ? h : w

		for (const v of values) {
			const frac = v / (total || 1)
			const len = frac * along
			const r: Rect = horizontal
				? { x: cursor, y, w: len, h: across }
				: { x, y: cursor, w: across, h: len }
			rects.push(r)
			cursor += len
		}

		return rects
	}

	/*********************************************************
	 * Tiles computed from algorithm + series data
	 ********************************************************/
	const tiles = computed<Array<IChartTreemapTile>>(() => {
		const series = props.series?.[0]
		if (!series || !series.data?.length) return []

		const raw = series.data as Array<{ name: string, value: number, color?: TIntent | string } | number>
		const items = raw.map((e, i) => {
			if (typeof e === 'number') {
				return { name: String(i + 1), value: e, color: undefined }
			}
			return { name: e.name ?? String(i + 1), value: e.value ?? 0, color: (e as { color?: TIntent | string }).color }
		})

		const total = items.reduce((s, item) => s + Math.max(0, item.value), 0)
		if (total <= 0) return []

		const plotX = PADDING.left
		const plotY = PADDING.top
		const plotW = SVG_WIDTH - PADDING.left - PADDING.right
		const plotH = SVG_HEIGHT - PADDING.top - PADDING.bottom
		const plotArea = plotW * plotH

		const sortedItems = items.map((item, originalIndex) => ({ ...item, originalIndex }))
			.sort((a, b) => b.value - a.value)

		const scaledValues = sortedItems.map((item) => (Math.max(0, item.value) / total) * plotArea)

		const rects = props.algorithm === 'slice-dice'
			? sliceDice(scaledValues, { x: plotX, y: plotY, w: plotW, h: plotH }, 0)
			: squarify(scaledValues, { x: plotX, y: plotY, w: plotW, h: plotH })

		return rects.map((rect, sortedIndex): IChartTreemapTile => {
			const item = sortedItems[sortedIndex]
			const isHidden = hiddenNames.value.has(item.name)
			const w = Math.max(0, rect.w)
			const h = Math.max(0, rect.h)
			return {
				index: item.originalIndex,
				key: item.name,
				name: item.name,
				value: item.value,
				formatted: formatValue(item.value),
				color: colorFor(item, item.originalIndex),
				x: rect.x,
				y: rect.y,
				width: w,
				height: h,
				visible: !isHidden,
				labelFits: w >= LABEL_MIN_WIDTH && h >= LABEL_MIN_HEIGHT
			}
		})
	})

	const visibleTiles = computed(() => tiles.value.filter((t) => t.visible))

	/*********************************************************
	 * Legend items — one per tile (data item)
	 ********************************************************/
	const legendItems = computed<Array<IChartLegendItem>>(() => {
		const series = props.series?.[0]
		if (!series) return []
		return tiles.value.map((tile) => ({
			series: {
				...series,
				name: tile.name,
				data: [tile.value],
				visible: tile.visible
			} as IChartSeries,
			index: tile.index,
			color: tile.color,
			visible: tile.visible
		}))
	})

	/*********************************************************
	 * Hover / tooltip
	 ********************************************************/
	const svgRef = ref<SVGSVGElement | null>(null)
	const mousePos = ref<{ x: number, y: number }>({ x: 0, y: 0 })
	const hoveredIndex = ref<number | null>(null)

	const hoveredTile = computed<IChartTreemapTile | null>(() => {
		if (hoveredIndex.value === null) return null
		return visibleTiles.value.find((t) => t.index === hoveredIndex.value) ?? null
	})

	const hoveredPoint = computed<IChartPoint | null>(() => {
		const t = hoveredTile.value
		if (!t || !props.series?.[0]) return null
		return {
			seriesIndex: 0,
			seriesName: props.series[0].name,
			dataIndex: t.index,
			x: t.name,
			y: t.value,
			color: t.color
		}
	})

	const hoveredSeries = computed<IChartSeries | null>(() => {
		if (!hoveredTile.value || !props.series?.[0]) return null
		return props.series[0]
	})

	const hoveredCategory = computed<string | number>(() =>
		hoveredTile.value?.name ?? ''
	)

	const showEmpty = computed(() => {
		if (!props.series?.length) return true
		const first = props.series[0]
		if (!first?.data?.length) return true
		return visibleTiles.value.length === 0
	})

	/*********************************************************
	 * Root classes / styles
	 ********************************************************/
	const rootClasses = computed(() => [
		{
			[`origam-chart-treemap--legend-${ props.legendPosition }`]: true,
			[`origam-chart-treemap--algorithm-${ props.algorithm }`]: true,
			'origam-chart-treemap--no-animation': !props.animated
		},
		backgroundColorClasses.value,
		elevationClasses.value,
		roundedClasses.value
	])

	const rootStyles = computed<StyleValue>(() => {
		const out: Record<string, string> = {}
		if (props.aspectRatio) {
			out.aspectRatio = props.aspectRatio
		}
		out['--origam-chart---animation-duration'] = `${ props.animationDuration }ms`
		return out
	})

	const bodyClasses = computed(() => ({
		'origam-chart-treemap__body--with-side-legend': props.showLegend
			&& (props.legendPosition === 'left' || props.legendPosition === 'right')
	}))

	const svgClasses = computed(() => ({
		'origam-chart__svg--animated': props.animated
	}))

	const hasTitleBlock = computed(() => Boolean(props.title || props.subtitle))

	/*********************************************************
	 * ARIA
	 ********************************************************/
	const ariaLabel = computed(() => props.title ?? 'treemap chart')
	const svgAriaLabel = computed(() => props.title ?? 'treemap chart')
	const svgTitle = computed(() => props.title ?? 'treemap chart')
	const svgDesc = computed(() => {
		const n = visibleTiles.value.length
		return `Treemap chart with ${ n } ${ n === 1 ? 'tile' : 'tiles' }.`
	})

	const tileAriaLabel = (tile: IChartTreemapTile): string =>
		`${ tile.name }: ${ tile.formatted }`

	/*********************************************************
	 * Interaction
	 ********************************************************/
	const onTileEnter = (tile: IChartTreemapTile) => {
		hoveredIndex.value = tile.index
	}

	const onTileLeave = () => {
		hoveredIndex.value = null
	}

	const onSvgMouseMove = (event: MouseEvent) => {
		const target = svgRef.value
		if (!target) return
		const rect = target.getBoundingClientRect()
		mousePos.value = {
			x: event.clientX - rect.left,
			y: event.clientY - rect.top
		}
	}

	const onSvgMouseLeave = () => {
		onTileLeave()
	}

	const onTileActivate = (tile: IChartTreemapTile, event: MouseEvent | KeyboardEvent) => {
		hoveredIndex.value = tile.index
		if (hoveredPoint.value) {
			emit('point-click', hoveredPoint.value, event)
		}
	}

	const onLegendClick = (series: IChartSeries, index: number): void => {
		emit('legend-click', series, index)
	}

	const onSeriesToggle = (series: IChartSeries, nextVisible: boolean): void => {
		if (nextVisible) hiddenNames.value.delete(series.name)
		else hiddenNames.value.add(series.name)
		emit('series-toggle', series, nextVisible)
	}
</script>

<style
		lang="scss"
		scoped
>
	.origam-chart-treemap {
		$this: &;

		display: grid;
		gap: var(--origam-chart---gap, 12px);
		padding: var(--origam-chart---padding, 12px);
		background-color: var(--origam-chart---background-color, transparent);
		color: var(--origam-chart---color, inherit);
		width: 100%;
		box-sizing: border-box;
		grid-template-rows: auto 1fr auto;
		grid-template-columns: 1fr;
		grid-template-areas:
			"header"
			"body"
			"legend";

		&--legend-top {
			grid-template-areas:
				"header"
				"legend"
				"body";
			grid-template-rows: auto auto 1fr;
		}

		&--legend-bottom {
			grid-template-areas:
				"header"
				"body"
				"legend";
			grid-template-rows: auto 1fr auto;
		}

		&--legend-left {
			grid-template-columns: auto minmax(0, 1fr);
			grid-template-rows: auto minmax(0, 1fr);
			grid-template-areas:
				"header header"
				"legend body";
		}

		&--legend-right {
			grid-template-columns: minmax(0, 1fr) auto;
			grid-template-rows: auto minmax(0, 1fr);
			grid-template-areas:
				"header header"
				"body legend";
		}

		&__header {
			grid-area: header;
			display: flex;
			flex-direction: column;
			gap: 4px;
		}

		&__title {
			font-size: var(--origam-chart__title---font-size, 1.125rem);
			font-weight: var(--origam-chart__title---font-weight, 600);
			color: var(--origam-chart__title---color, inherit);
		}

		&__subtitle {
			font-size: var(--origam-chart__subtitle---font-size, 0.875rem);
			color: var(--origam-chart__subtitle---color, var(--origam-color-text-secondary, #6b7280));
		}

		&__body {
			grid-area: body;
			position: relative;
			display: flex;
			min-height: 0;
			min-width: 0;

			&--with-side-legend {
				min-width: var(--origam-chart__body---min-width, 200px);
			}
		}

		&__svg {
			flex: 1 1 auto;
			width: 100%;
			height: 100%;
			min-width: 0;
			min-height: 0;
			overflow: visible;
			display: block;
		}

		.origam-chart__treemap-tile {
			stroke: var(--origam-chart__treemap---stroke-color, var(--origam-color-surface-default, #ffffff));
			stroke-width: var(--origam-chart__treemap---stroke-width, 2);
			cursor: pointer;
			transition: opacity 150ms ease, filter 150ms ease;

			&:hover,
			&:focus-visible,
			&--active {
				outline: none;
				filter: brightness(1.1);
			}
		}

		.origam-chart__treemap-label {
			pointer-events: none;
			font-size: var(--origam-chart__treemap-label---font-size, 0.6875rem);
			font-weight: var(--origam-chart__treemap-label---font-weight, 600);
			fill: var(--origam-chart__treemap-label---color, #ffffff);
			user-select: none;

			&--value {
				font-size: var(--origam-chart__treemap-label--value---font-size, 0.625rem);
				font-weight: var(--origam-chart__treemap-label--value---font-weight, 400);
				fill: var(--origam-chart__treemap-label--value---color, rgba(255, 255, 255, 0.85));
			}
		}

		.origam-chart__svg--animated .origam-chart__treemap-tile {
			animation: origam-chart-treemap-fade var(--origam-chart---animation-duration, 600ms) ease-out both;
		}

		:deep(.origam-chart__tooltip) {
			position: absolute;
			pointer-events: none;
			background-color: var(--origam-chart__tooltip---background-color, var(--origam-color-surface-overlay, #1f2937));
			color: var(--origam-chart__tooltip---color, #ffffff);
			padding: var(--origam-chart__tooltip---padding, 8px 12px);
			border-radius: var(--origam-chart__tooltip---border-radius, 6px);
			font-size: 0.8125rem;
			box-shadow: var(--origam-chart__tooltip---shadow, 0 4px 16px rgba(0, 0, 0, 0.15));
			z-index: 10;
		}

		:deep(.origam-chart__tooltip-title) {
			font-weight: 600;
			margin-bottom: 4px;
		}

		:deep(.origam-chart__tooltip-row) {
			display: flex;
			align-items: center;
			gap: 8px;
		}

		:deep(.origam-chart__tooltip-swatch) {
			display: inline-block;
			width: 10px;
			height: 10px;
			border-radius: 2px;
		}

		:deep(.origam-chart__tooltip-value) {
			font-weight: 600;
			margin-left: auto;
		}

		&__empty {
			position: absolute;
			inset: 0;
			display: flex;
			align-items: center;
			justify-content: center;
			color: var(--origam-chart__empty---color, var(--origam-color-text-secondary, #6b7280));
		}

		:deep(.origam-chart__legend) {
			grid-area: legend;
			list-style: none;
			margin: 0;
			padding: 0;
			display: flex;
			flex-wrap: wrap;
			gap: var(--origam-chart__legend---gap, 12px);
			align-content: center;
		}

		:deep(.origam-chart__legend--top),
		:deep(.origam-chart__legend--bottom) {
			flex-direction: row;
			justify-content: center;
		}

		:deep(.origam-chart__legend--left),
		:deep(.origam-chart__legend--right) {
			flex-direction: column;
			justify-content: center;
			flex-wrap: nowrap;
			align-self: stretch;
		}

		:deep(.origam-chart__legend--left) {
			padding-right: var(--origam-chart__legend---side-gap, 8px);
		}

		:deep(.origam-chart__legend--right) {
			padding-left: var(--origam-chart__legend---side-gap, 8px);
		}

		:deep(.origam-chart__legend-item) {
			display: flex;
			align-items: center;
			gap: 6px;
			cursor: pointer;
			font-size: 0.8125rem;
			user-select: none;
		}

		:deep(.origam-chart__legend-item--hidden) {
			opacity: 0.4;
			text-decoration: line-through;
		}

		:deep(.origam-chart__legend-swatch) {
			display: inline-block;
			width: 12px;
			height: 12px;
			border-radius: var(--origam-chart__legend-swatch---border-radius, 3px);
		}

		&--no-animation .origam-chart__treemap-tile {
			animation: none;
		}
	}

	@keyframes origam-chart-treemap-fade {
		from {
			opacity: 0;
		}
		to {
			opacity: 1;
		}
	}

	@media (prefers-reduced-motion: reduce) {
		.origam-chart-treemap .origam-chart__svg--animated .origam-chart__treemap-tile {
			animation: none;
		}
	}
</style>
