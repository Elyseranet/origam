<template>
	<div
			class="origam-chart-honeycomb"
			:class="rootClasses"
			:style="[rootStyles, dimensionStyles, marginStyles, paddingStyles, backgroundColorStyles, elevationStyles, roundedStyles, headerTypographyStyles]"
			role="figure"
			:aria-label="ariaLabel"
			data-cy="origam-chart-honeycomb"
	>
		<header
				v-if="hasTitleBlock"
				class="origam-chart-honeycomb__header"
				data-cy="origam-chart-honeycomb-header"
		>
			<slot name="title">
				<div
						v-if="title"
						class="origam-chart-honeycomb__title"
				>
					{{ title }}
				</div>
				<div
						v-if="subtitle"
						class="origam-chart-honeycomb__subtitle"
				>
					{{ subtitle }}
				</div>
			</slot>
		</header>

		<div
				class="origam-chart-honeycomb__body"
				:class="bodyClasses"
				data-cy="origam-chart-honeycomb-body"
		>
			<svg
					v-if="!showEmpty"
					ref="svgRef"
					class="origam-chart-honeycomb__svg origam-chart__svg"
					:class="svgClasses"
					:viewBox="`0 0 ${ svgWidth } ${ svgHeight }`"
					role="img"
					:aria-label="svgAriaLabel"
					preserveAspectRatio="xMidYMid meet"
					data-cy="origam-chart-honeycomb-svg"
					@mousemove="onSvgMouseMove"
					@mouseleave="onSvgMouseLeave"
			>
				<title>{{ svgTitle }}</title>
				<desc>{{ svgDesc }}</desc>

				<g
						class="origam-chart__series origam-chart__honeycomb-series"
						data-cy="origam-chart-honeycomb-series"
				>
					<g
							v-for="tile in visibleTiles"
							:key="`tile-${ tile.index }`"
							class="origam-chart__honeycomb-tile-group"
							:data-cy="`origam-chart-honeycomb-tile-group-${ tile.index }`"
					>
						<polygon
								class="origam-chart__honeycomb-tile"
								:class="{ 'origam-chart__honeycomb-tile--active': hoveredIndex === tile.index }"
								:points="tile.points"
								:style="{ fill: tile.color }"
								:data-cy="`origam-chart-honeycomb-tile-${ tile.index }`"
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
								v-if="showLabel && tile.label"
								class="origam-chart__honeycomb-label"
								:x="tile.cx"
								:y="tile.cy"
								text-anchor="middle"
								dominant-baseline="middle"
								:data-cy="`origam-chart-honeycomb-label-${ tile.index }`"
						>
							{{ tile.label }}
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
					class="origam-chart-honeycomb__empty origam-chart__empty"
					data-cy="origam-chart-honeycomb-empty"
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
		IChartHoneycombEmits,
		IChartHoneycombProps,
		IChartHoneycombTile,
		IChartLegendItem,
		IChartPoint,
		IChartSeries
	} from '../../interfaces'

	import { intentBgExpr, isIntent } from '../../utils/Commons/color.util'

	import type { TIntent } from '../../types'

	/*********************************************************
	 * Global
	 *
	 * @description
	 * Honeycomb hex-tile chart family. Renders a grid of hexagonal
	 * `<polygon>` tiles positioned by (x=col, y=row) indices.
	 *
	 * Two orientation modes:
	 *   - `pointy-top` — vertex at the top, odd rows offset right
	 *   - `flat-top`   — flat edge at top, odd cols offset down
	 *
	 * Two colour modes:
	 *   - `categorical` — intent / palette cycle by tile index
	 *   - `heatmap`     — CSS color-mix gradient between two endpoints
	 *
	 * `withDefaults` literals only, per CLAUDE.md.
	 ********************************************************/
	defineOptions({
		name: 'OrigamChartHoneycomb'
	})

	const props = withDefaults(defineProps<IChartHoneycombProps>(), {
		height: 400,
		title: undefined,
		subtitle: undefined,
		orientation: 'pointy-top',
		colorMode: 'categorical',
		heatmapColorRange: () => ['info', 'danger'],
		tileSize: 30,
		tileGap: 2,
		showLabel: true,
		showLegend: true,
		legendPosition: 'bottom',
		showTooltip: true,
		animated: true,
		animationDuration: 600,
		colorScheme: () => [],
		aspectRatio: undefined,
		xAxisFormat: undefined,
		yAxisFormat: undefined
	})

	const emit = defineEmits<IChartHoneycombEmits>()

	const { dimensionStyles } = useDimension(props)
	const { backgroundColorClasses, backgroundColorStyles } = useBackgroundColor(props, 'bgColor')
	const { elevationClasses, elevationStyles } = useElevation(props)
	const { marginStyles } = useMargin(props)
	const { paddingStyles } = usePadding(props)
	const { roundedClasses, roundedStyles } = useRounded(props)
	const { headerTypographyStyles } = useChartHeaderTypography(props)

	/*********************************************************
	 * Default colour palette — mirrors useChart's DEFAULT_PALETTE
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

	/*********************************************************
	 * Heatmap colour — CSS color-mix interpolation between
	 * the two `heatmapColorRange` endpoints.
	 ********************************************************/
	const heatmapColorFor = (value: number, minVal: number, maxVal: number): string => {
		const range = maxVal - minVal
		const pct = range === 0 ? 0 : Math.round(((value - minVal) / range) * 100)
		const start = resolveColor(props.heatmapColorRange[0])
		const end = resolveColor(props.heatmapColorRange[1])
		return `color-mix(in srgb, ${ end } ${ pct }%, ${ start })`
	}

	/*********************************************************
	 * Geometry helpers
	 ********************************************************/
	const SQRT3 = Math.sqrt(3)

	const hexPointsPointyTop = (cx: number, cy: number, size: number): string => {
		const pts = [
			[cx, cy - size],
			[cx + size * SQRT3 / 2, cy - size / 2],
			[cx + size * SQRT3 / 2, cy + size / 2],
			[cx, cy + size],
			[cx - size * SQRT3 / 2, cy + size / 2],
			[cx - size * SQRT3 / 2, cy - size / 2]
		]
		return pts.map(([x, y]) => `${ x.toFixed(3) },${ y.toFixed(3) }`).join(' ')
	}

	const hexPointsFlatTop = (cx: number, cy: number, size: number): string => {
		const pts = [
			[cx - size, cy],
			[cx - size / 2, cy - size * SQRT3 / 2],
			[cx + size / 2, cy - size * SQRT3 / 2],
			[cx + size, cy],
			[cx + size / 2, cy + size * SQRT3 / 2],
			[cx - size / 2, cy + size * SQRT3 / 2]
		]
		return pts.map(([x, y]) => `${ x.toFixed(3) },${ y.toFixed(3) }`).join(' ')
	}

	const tileCentre = (col: number, row: number, size: number, gap: number): { cx: number, cy: number } => {
		if (props.orientation === 'flat-top') {
			const colSpacing = size * 1.5 + gap
			const rowSpacing = size * SQRT3 + gap
			const cx = size + col * colSpacing
			const cy = size * SQRT3 / 2 + row * rowSpacing + (col % 2 === 1 ? size * SQRT3 / 2 : 0)
			return { cx, cy }
		}
		const colSpacing = size * SQRT3 + gap
		const rowSpacing = size * 1.5 + gap
		const cx = size * SQRT3 / 2 + col * colSpacing + (row % 2 === 1 ? size * SQRT3 / 2 : 0)
		const cy = size + row * rowSpacing
		return { cx, cy }
	}

	/*********************************************************
	 * Tile descriptors
	 ********************************************************/
	const rawData = computed(() => {
		const series = props.series?.[0]
		if (!series?.data?.length) return []
		return series.data as Array<{ x: number, y: number, value?: number, name?: string, color?: TIntent | string }>
	})

	const valueRange = computed<{ min: number, max: number }>(() => {
		const vals = rawData.value
			.map((d) => d.value)
			.filter((v): v is number => v !== undefined && Number.isFinite(v))
		if (vals.length === 0) return { min: 0, max: 1 }
		return { min: Math.min(...vals), max: Math.max(...vals) }
	})

	const hiddenNames = ref<Set<string>>(new Set())

	const colorFor = (dataIndex: number, dataItem: { x: number, y: number, value?: number, name?: string, color?: TIntent | string }): string => {
		if (dataItem.color) return resolveColor(dataItem.color)
		const series = props.series?.[0]
		if (series?.color) return resolveColor(series.color)
		if (props.colorMode === 'heatmap' && dataItem.value !== undefined) {
			return heatmapColorFor(dataItem.value, valueRange.value.min, valueRange.value.max)
		}
		const scheme = props.colorScheme?.length ? props.colorScheme : DEFAULT_PALETTE
		return resolveColor(scheme[dataIndex % scheme.length])
	}

	const labelFor = (d: { x: number, y: number, value?: number, name?: string }): string => {
		if (d.name) return d.name
		if (d.value !== undefined) {
			if (props.yAxisFormat) return props.yAxisFormat(d.value)
			return String(d.value)
		}
		return ''
	}

	const tiles = computed<Array<IChartHoneycombTile>>(() => {
		if (!rawData.value.length) return []
		const size = props.tileSize
		const gap = props.tileGap
		return rawData.value.map((d, i) => {
			const { cx, cy } = tileCentre(d.x, d.y, size, gap)
			const points = props.orientation === 'flat-top'
				? hexPointsFlatTop(cx, cy, size)
				: hexPointsPointyTop(cx, cy, size)
			const name = d.name ?? ''
			const isHidden = hiddenNames.value.has(name || String(i))
			return {
				index: i,
				gridX: d.x,
				gridY: d.y,
				points,
				color: colorFor(i, d),
				label: labelFor(d),
				name,
				value: d.value,
				cx,
				cy,
				visible: !isHidden
			}
		})
	})

	const visibleTiles = computed(() => tiles.value.filter((t) => t.visible))

	/*********************************************************
	 * SVG viewBox dimensions — derived from tile positions
	 ********************************************************/
	const SVG_PADDING = 20

	const svgWidth = computed(() => {
		if (!tiles.value.length) return 600
		const size = props.tileSize
		const maxCx = Math.max(...tiles.value.map((t) => t.cx))
		const halfW = props.orientation === 'flat-top' ? size : size * SQRT3 / 2
		return Math.ceil(maxCx + halfW + SVG_PADDING)
	})

	const svgHeight = computed(() => {
		if (!tiles.value.length) return 400
		const size = props.tileSize
		const maxCy = Math.max(...tiles.value.map((t) => t.cy))
		const halfH = props.orientation === 'flat-top' ? size * SQRT3 / 2 : size
		return Math.ceil(maxCy + halfH + SVG_PADDING)
	})

	/*********************************************************
	 * Legend items
	 ********************************************************/
	const legendItems = computed<Array<IChartLegendItem>>(() => {
		const series = props.series?.[0]
		if (!series) return []
		if (props.colorMode === 'heatmap') {
			const { min, max } = valueRange.value
			return [
				{
					series: { ...series, name: String(min), data: [], visible: true } as IChartSeries,
					index: 0,
					color: resolveColor(props.heatmapColorRange[0]),
					visible: true
				},
				{
					series: { ...series, name: String(max), data: [], visible: true } as IChartSeries,
					index: 1,
					color: resolveColor(props.heatmapColorRange[1]),
					visible: true
				}
			]
		}
		return tiles.value.map((tile) => ({
			series: {
				...series,
				name: tile.name || tile.label || `Tile ${ tile.index + 1 }`,
				data: tile.value !== undefined ? [tile.value] : [],
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

	const hoveredTile = computed<IChartHoneycombTile | null>(() => {
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
			x: t.gridX,
			y: t.gridY,
			color: t.color
		}
	})

	const hoveredSeries = computed<IChartSeries | null>(() => {
		if (!hoveredTile.value || !props.series?.[0]) return null
		return props.series[0]
	})

	const hoveredCategory = computed<string | number>(() =>
		hoveredTile.value?.name || hoveredTile.value?.label || ''
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
			[`origam-chart-honeycomb--${ props.orientation }`]: true,
			[`origam-chart-honeycomb--${ props.colorMode }`]: true,
			[`origam-chart-honeycomb--legend-${ props.legendPosition }`]: true,
			'origam-chart-honeycomb--no-animation': !props.animated
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
		'origam-chart-honeycomb__body--with-side-legend': props.showLegend
			&& (props.legendPosition === 'left' || props.legendPosition === 'right')
	}))

	const svgClasses = computed(() => ({
		'origam-chart__svg--animated': props.animated
	}))

	const hasTitleBlock = computed(() => Boolean(props.title || props.subtitle))

	/*********************************************************
	 * ARIA
	 ********************************************************/
	const ariaLabel = computed(() => props.title ?? 'honeycomb chart')
	const svgAriaLabel = computed(() => props.title ?? 'honeycomb chart')
	const svgTitle = computed(() => props.title ?? 'honeycomb chart')
	const svgDesc = computed(() => {
		const n = visibleTiles.value.length
		return `Honeycomb chart with ${ n } ${ n === 1 ? 'tile' : 'tiles' }.`
	})

	const tileAriaLabel = (tile: IChartHoneycombTile): string => {
		const name = tile.name || tile.label || `Tile ${ tile.index + 1 }`
		const val = tile.value !== undefined ? `: ${ tile.value }` : ''
		return `${ name }${ val }`
	}

	/*********************************************************
	 * Interaction
	 ********************************************************/
	const onTileEnter = (tile: IChartHoneycombTile) => {
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

	const onTileActivate = (tile: IChartHoneycombTile, event: MouseEvent | KeyboardEvent) => {
		hoveredIndex.value = tile.index
		if (hoveredPoint.value) {
			emit('point-click', hoveredPoint.value, event)
		}
	}

	const onLegendClick = (series: IChartSeries, index: number): void => {
		emit('legend-click', series, index)
	}

	const onSeriesToggle = (series: IChartSeries, nextVisible: boolean): void => {
		const key = series.name
		if (nextVisible) hiddenNames.value.delete(key)
		else hiddenNames.value.add(key)
		emit('series-toggle', series, nextVisible)
	}
</script>

<style
		lang="scss"
		scoped
>
	.origam-chart-honeycomb {
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

		.origam-chart__honeycomb-tile {
			stroke: var(--origam-chart__honeycomb---stroke-color, var(--origam-color-surface-default, #ffffff));
			stroke-width: var(--origam-chart__honeycomb---stroke-width, 2);
			cursor: pointer;
			transition: opacity 150ms ease, filter 150ms ease;

			&:hover,
			&:focus-visible,
			&--active {
				outline: none;
				filter: brightness(1.08);
			}
		}

		.origam-chart__honeycomb-label {
			pointer-events: none;
			font-size: var(--origam-chart__honeycomb-label---font-size, 0.625rem);
			font-weight: var(--origam-chart__honeycomb-label---font-weight, 600);
			fill: var(--origam-chart__honeycomb-label---color, #ffffff);
			user-select: none;
		}

		.origam-chart__svg--animated .origam-chart__honeycomb-tile {
			animation: origam-chart-honeycomb-fade var(--origam-chart---animation-duration, 600ms) ease-out both;
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

		&--no-animation .origam-chart__honeycomb-tile {
			animation: none;
		}
	}

	@keyframes origam-chart-honeycomb-fade {
		from {
			opacity: 0;
		}
		to {
			opacity: 1;
		}
	}

	@media (prefers-reduced-motion: reduce) {
		.origam-chart-honeycomb .origam-chart__svg--animated .origam-chart__honeycomb-tile {
			animation: none;
		}
	}
</style>
