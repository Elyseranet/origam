<template>
	<div
			class="origam-chart-heatmap"
			:class="rootClasses"
			:style="[rootStyles, dimensionStyles, marginStyles, paddingStyles, backgroundColorStyles, elevationStyles, roundedStyles, headerTypographyStyles]"
			role="figure"
			:aria-label="ariaLabel"
			data-cy="origam-chart-heatmap"
	>
		<header
				v-if="hasTitleBlock"
				class="origam-chart-heatmap__header"
				data-cy="origam-chart-heatmap-header"
		>
			<slot name="title">
				<div
						v-if="title"
						class="origam-chart-heatmap__title"
				>
					{{ title }}
				</div>
				<div
						v-if="subtitle"
						class="origam-chart-heatmap__subtitle"
				>
					{{ subtitle }}
				</div>
			</slot>
		</header>

		<div
				class="origam-chart-heatmap__body"
				:class="bodyClasses"
				data-cy="origam-chart-heatmap-body"
		>
			<svg
					v-if="!showEmpty"
					ref="svgRef"
					class="origam-chart-heatmap__svg origam-chart__svg"
					:class="svgClasses"
					:viewBox="`0 0 ${ svgWidth } ${ svgHeight }`"
					role="img"
					:aria-label="svgAriaLabel"
					preserveAspectRatio="xMidYMid meet"
					data-cy="origam-chart-heatmap-svg"
					@mousemove="onSvgMouseMove"
					@mouseleave="onSvgMouseLeave"
			>
				<title>{{ svgTitle }}</title>
				<desc>{{ svgDesc }}</desc>

				<defs>
					<linearGradient
							id="origam-heatmap-legend-gradient"
							x1="0"
							y1="0"
							x2="1"
							y2="0"
					>
						<stop
								offset="0%"
								:style="{ stopColor: resolveColor(colorRange[0]) }"
						/>
						<stop
								offset="100%"
								:style="{ stopColor: resolveColor(colorRange[1]) }"
						/>
					</linearGradient>
				</defs>

				<g
						class="origam-chart__series origam-chart__heatmap-series"
						data-cy="origam-chart-heatmap-series"
				>
					<g
							v-for="cell in visibleCells"
							:key="`cell-${ cell.index }`"
							class="origam-chart__heatmap-cell-group"
							:data-cy="`origam-chart-heatmap-cell-group-${ cell.index }`"
					>
						<rect
								class="origam-chart__heatmap-cell"
								:class="{ 'origam-chart__heatmap-cell--active': hoveredIndex === cell.index }"
								:x="cell.rx"
								:y="cell.ry"
								:width="cell.rw"
								:height="cell.rh"
								rx="2"
								ry="2"
								:style="{ fill: cell.color }"
								:data-cy="`origam-chart-heatmap-cell-${ cell.index }`"
								tabindex="0"
								role="button"
								:aria-label="cellAriaLabel(cell)"
								@click="onCellActivate(cell, $event)"
								@keydown.enter.prevent="onCellActivate(cell, $event)"
								@keydown.space.prevent="onCellActivate(cell, $event)"
								@mouseenter="onCellEnter(cell)"
								@mouseleave="onCellLeave"
						/>
						<text
								v-if="showLabel && cell.labelFits"
								class="origam-chart__heatmap-label"
								:x="cell.labelX"
								:y="cell.labelY"
								text-anchor="middle"
								dominant-baseline="middle"
								:data-cy="`origam-chart-heatmap-label-${ cell.index }`"
						>
							{{ formatValue(cell.value) }}
						</text>
					</g>
				</g>

				<g
						v-if="showAxis"
						class="origam-chart__heatmap-x-axis"
						data-cy="origam-chart-heatmap-x-axis"
				>
					<text
							v-for="(cat, i) in xAxisLabels"
							:key="`x-${ i }`"
							class="origam-chart__heatmap-axis-label origam-chart__heatmap-axis-label--x"
							:x="xLabelPositions[i]"
							:y="xAxisY"
							text-anchor="middle"
							dominant-baseline="hanging"
							:data-cy="`origam-chart-heatmap-x-label-${ i }`"
					>
						{{ cat }}
					</text>
				</g>

				<g
						v-if="showAxis"
						class="origam-chart__heatmap-y-axis"
						data-cy="origam-chart-heatmap-y-axis"
				>
					<text
							v-for="(cat, i) in yAxisLabels"
							:key="`y-${ i }`"
							class="origam-chart__heatmap-axis-label origam-chart__heatmap-axis-label--y"
							:x="yAxisX"
							:y="yLabelPositions[i]"
							text-anchor="end"
							dominant-baseline="middle"
							:data-cy="`origam-chart-heatmap-y-label-${ i }`"
					>
						{{ cat }}
					</text>
				</g>

				<g
						v-if="showGradientLegend && isLegendInline"
						class="origam-chart__heatmap-gradient-legend"
						data-cy="origam-chart-heatmap-gradient-legend"
				>
					<rect
							:x="gradientRect.x"
							:y="gradientRect.y"
							:width="gradientRect.w"
							:height="gradientRect.h"
							rx="2"
							ry="2"
							fill="url(#origam-heatmap-legend-gradient)"
					/>
					<text
							class="origam-chart__heatmap-legend-label"
							:x="gradientRect.x"
							:y="gradientRect.y + gradientRect.h + 4"
							text-anchor="start"
							dominant-baseline="hanging"
					>
						{{ formatValue(valueRange.min) }}
					</text>
					<text
							class="origam-chart__heatmap-legend-label"
							:x="gradientRect.x + gradientRect.w"
							:y="gradientRect.y + gradientRect.h + 4"
							text-anchor="end"
							dominant-baseline="hanging"
					>
						{{ formatValue(valueRange.max) }}
					</text>
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
					class="origam-chart-heatmap__empty origam-chart__empty"
					data-cy="origam-chart-heatmap-empty"
			>
				<slot name="empty">
					<span>No data to display</span>
				</slot>
			</div>
		</div>
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

	import OrigamChartTooltip from './OrigamChartTooltip.vue'

	import type {
		IChartHeatmapCell,
		IChartHeatmapDatum,
		IChartHeatmapEmits,
		IChartHeatmapProps,
		IChartPoint,
		IChartSeries
	} from '../../interfaces'

	import {
		useChartHeaderTypography,
		useBackgroundColor,
		useDimension,
		useElevation,
		useMargin,
		usePadding,
		useRounded
	} from '../../composables'

	import { intentBgExpr, isIntent } from '../../utils/Commons/color.util'

	import type { TIntent } from '../../types'

	/*********************************************************
	 * Global
	 *
	 * @description
	 * Rectangular heatmap chart. Renders a grid of `<rect>` cells
	 * coloured by value via CSS color-mix interpolation between
	 * two endpoints (colorRange).
	 *
	 * Common use cases:
	 *   - GitHub-style contribution activity (weekday × hour)
	 *   - Correlation matrices (symmetric or asymmetric)
	 *   - Weekday × hour engagement heatmaps
	 *
	 * Consumes `series[0]` only. Each datum: { x, y, value }.
	 * `xCategories` / `yCategories` control axis ordering; when
	 * omitted, unique values are sorted ascending.
	 *
	 * `withDefaults` literals only, per CLAUDE.md.
	 ********************************************************/
	defineOptions({
		name: 'OrigamChartHeatmap'
	})

	const props = withDefaults(defineProps<IChartHeatmapProps>(), {
		height: 400,
		title: undefined,
		subtitle: undefined,
		xCategories: () => [],
		yCategories: () => [],
		colorRange: () => ['info', 'danger'],
		cellGap: 2,
		showLabel: true,
		showAxis: true,
		showGradientLegend: true,
		showLegend: true,
		legendPosition: 'bottom',
		showTooltip: true,
		animated: true,
		animationDuration: 600,
		colorScheme: () => [],
		aspectRatio: undefined,
		xAxisFormat: undefined,
		yAxisFormat: undefined,
		categories: () => []
	})

	const emit = defineEmits<IChartHeatmapEmits>()

	const { dimensionStyles } = useDimension(props)
	const { backgroundColorClasses, backgroundColorStyles } = useBackgroundColor(props, 'bgColor')
	const { elevationClasses, elevationStyles } = useElevation(props)
	const { marginClasses, marginStyles } = useMargin(props)
	const { paddingClasses, paddingStyles } = usePadding(props)
	const { roundedClasses, roundedStyles } = useRounded(props)
	const { headerTypographyStyles } = useChartHeaderTypography(props)

	/*********************************************************
	 * SVG coordinate constants
	 ********************************************************/
	const AXIS_LEFT = 48
	const AXIS_BOTTOM = 28
	const LEGEND_H = 14
	const LEGEND_MARGIN = 24
	const LABEL_MIN_CELL = 18
	const SVG_PLOT_W = 560
	const SVG_PLOT_H = 340

	/*********************************************************
	 * Colour helpers
	 ********************************************************/
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

	const heatmapColorFor = (value: number, minVal: number, maxVal: number): string => {
		const range = maxVal - minVal
		const pct = range === 0 ? 0 : Math.round(((value - minVal) / range) * 100)
		const start = resolveColor(props.colorRange[0])
		const end = resolveColor(props.colorRange[1])
		return `color-mix(in srgb, ${ end } ${ pct }%, ${ start })`
	}

	/*********************************************************
	 * Data derivation
	 ********************************************************/
	const rawData = computed<Array<IChartHeatmapDatum>>(() => {
		const series = props.series?.[0]
		if (!series?.data?.length) return []
		return series.data as Array<IChartHeatmapDatum>
	})

	const xCats = computed<Array<string>>(() => {
		if (props.xCategories?.length) return props.xCategories
		const vals = [...new Set(rawData.value.map((d) => String(d.x)))]
		return vals.sort((a, b) => {
			const na = Number(a)
			const nb = Number(b)
			if (!isNaN(na) && !isNaN(nb)) return na - nb
			return a.localeCompare(b)
		})
	})

	const yCats = computed<Array<string>>(() => {
		if (props.yCategories?.length) return props.yCategories
		const vals = [...new Set(rawData.value.map((d) => String(d.y)))]
		return vals.sort((a, b) => {
			const na = Number(a)
			const nb = Number(b)
			if (!isNaN(na) && !isNaN(nb)) return na - nb
			return a.localeCompare(b)
		})
	})

	const valueRange = computed<{ min: number, max: number }>(() => {
		const vals = rawData.value.map((d) => d.value).filter((v) => Number.isFinite(v))
		if (!vals.length) return { min: 0, max: 1 }
		return { min: Math.min(...vals), max: Math.max(...vals) }
	})

	const formatValue = (v: number): string => {
		if (props.yAxisFormat) return props.yAxisFormat(v)
		return String(v)
	}

	const formatXLabel = (v: string | number): string => {
		if (props.xAxisFormat) return props.xAxisFormat(v)
		return String(v)
	}

	/*********************************************************
	 * SVG geometry
	 ********************************************************/
	const isLegendInline = computed(() => props.legendPosition === 'bottom' || props.legendPosition === 'top')

	const legendExtraH = computed(() =>
		props.showGradientLegend && isLegendInline.value ? LEGEND_H + LEGEND_MARGIN : 0
	)

	const svgWidth = computed(() => AXIS_LEFT + SVG_PLOT_W)
	const svgHeight = computed(() => SVG_PLOT_H + AXIS_BOTTOM + legendExtraH.value)

	const plotX0 = AXIS_LEFT
	const plotY0 = 4

	const plotW = computed(() => SVG_PLOT_W)
	const plotH = computed(() => SVG_PLOT_H)

	const nx = computed(() => xCats.value.length)
	const ny = computed(() => yCats.value.length)

	const cellW = computed(() => {
		if (!nx.value) return 0
		return (plotW.value - props.cellGap * (nx.value - 1)) / nx.value
	})

	const cellH = computed(() => {
		if (!ny.value) return 0
		return (plotH.value - props.cellGap * (ny.value - 1)) / ny.value
	})

	/*********************************************************
	 * Cell descriptors
	 ********************************************************/
	const cells = computed<Array<IChartHeatmapCell>>(() => {
		if (!rawData.value.length) return []
		const { min, max } = valueRange.value

		return rawData.value.map((d, i) => {
			const xIdx = xCats.value.indexOf(String(d.x))
			const yIdx = yCats.value.indexOf(String(d.y))

			if (xIdx === -1 || yIdx === -1) return null

			const rx = plotX0 + xIdx * (cellW.value + props.cellGap)
			const ry = plotY0 + yIdx * (cellH.value + props.cellGap)
			const rw = cellW.value
			const rh = cellH.value

			return {
				index: i,
				xCat: String(d.x),
				yCat: String(d.y),
				value: d.value,
				color: heatmapColorFor(d.value, min, max),
				rx,
				ry,
				rw,
				rh,
				labelX: rx + rw / 2,
				labelY: ry + rh / 2,
				labelFits: rw >= LABEL_MIN_CELL && rh >= LABEL_MIN_CELL,
				visible: true
			} as IChartHeatmapCell
		}).filter((c): c is IChartHeatmapCell => c !== null)
	})

	const visibleCells = computed(() => cells.value.filter((c) => c.visible))

	/*********************************************************
	 * Axis labels — skip every other label if N > 20
	 ********************************************************/
	const xAxisY = computed(() => plotY0 + plotH.value + 4)
	const yAxisX = computed(() => plotX0 - 6)

	const xAxisLabels = computed(() => {
		const cats = xCats.value
		if (cats.length <= 20) return cats.map(formatXLabel)
		return cats.map((c, i) => i % 2 === 0 ? formatXLabel(c) : '')
	})

	const formatYLabel = (cat: string): string => {
		const num = Number(cat)
		if (!isNaN(num) && props.yAxisFormat) return props.yAxisFormat(num)
		return cat
	}

	const yAxisLabels = computed(() => {
		const cats = yCats.value
		if (cats.length <= 20) return cats.map(formatYLabel)
		return cats.map((c, i) => i % 2 === 0 ? formatYLabel(c) : '')
	})

	const xLabelPositions = computed(() =>
		xCats.value.map((_, i) => plotX0 + i * (cellW.value + props.cellGap) + cellW.value / 2)
	)

	const yLabelPositions = computed(() =>
		yCats.value.map((_, i) => plotY0 + i * (cellH.value + props.cellGap) + cellH.value / 2)
	)

	/*********************************************************
	 * Gradient legend rect (inline, bottom of SVG)
	 ********************************************************/
	const gradientRect = computed(() => {
		const legendY = props.legendPosition === 'top'
			? 0
			: plotY0 + plotH.value + AXIS_BOTTOM
		return {
			x: plotX0,
			y: legendY,
			w: plotW.value,
			h: LEGEND_H
		}
	})

	/*********************************************************
	 * Hover / tooltip
	 ********************************************************/
	const svgRef = ref<SVGSVGElement | null>(null)
	const mousePos = ref<{ x: number, y: number }>({ x: 0, y: 0 })
	const hoveredIndex = ref<number | null>(null)

	const hoveredCell = computed<IChartHeatmapCell | null>(() => {
		if (hoveredIndex.value === null) return null
		return visibleCells.value.find((c) => c.index === hoveredIndex.value) ?? null
	})

	const hoveredPoint = computed<IChartPoint | null>(() => {
		const c = hoveredCell.value
		if (!c || !props.series?.[0]) return null
		return {
			seriesIndex: 0,
			seriesName: props.series[0].name,
			dataIndex: c.index,
			x: c.xCat,
			y: c.value,
			color: c.color
		}
	})

	const hoveredSeries = computed<IChartSeries | null>(() => {
		if (!hoveredCell.value || !props.series?.[0]) return null
		return props.series[0]
	})

	const hoveredCategory = computed<string | number>(() => {
		const c = hoveredCell.value
		if (!c) return ''
		return `${ c.xCat } × ${ c.yCat }`
	})

	const showEmpty = computed(() => {
		if (!props.series?.length) return true
		const first = props.series[0]
		if (!first?.data?.length) return true
		return visibleCells.value.length === 0
	})

	/*********************************************************
	 * Root classes / styles
	 ********************************************************/
	const rootClasses = computed(() => [
		{
			[`origam-chart-heatmap--legend-${ props.legendPosition }`]: true,
			'origam-chart-heatmap--no-animation': !props.animated
		},
		backgroundColorClasses.value,
		elevationClasses.value,
		marginClasses.value,
		paddingClasses.value,
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
		'origam-chart-heatmap__body--with-side-legend': props.showLegend
			&& (props.legendPosition === 'left' || props.legendPosition === 'right')
	}))

	const svgClasses = computed(() => ({
		'origam-chart__svg--animated': props.animated
	}))

	const hasTitleBlock = computed(() => Boolean(props.title || props.subtitle))

	/*********************************************************
	 * ARIA
	 ********************************************************/
	const ariaLabel = computed(() => props.title ?? 'heatmap chart')
	const svgAriaLabel = computed(() => props.title ?? 'heatmap chart')
	const svgTitle = computed(() => props.title ?? 'heatmap chart')
	const svgDesc = computed(() => {
		const nx2 = xCats.value.length
		const ny2 = yCats.value.length
		return `Heatmap chart with ${ nx2 } columns and ${ ny2 } rows.`
	})

	const cellAriaLabel = (cell: IChartHeatmapCell): string =>
		`${ cell.xCat } × ${ cell.yCat }: ${ formatValue(cell.value) }`

	/*********************************************************
	 * Interaction
	 ********************************************************/
	const onCellEnter = (cell: IChartHeatmapCell) => {
		hoveredIndex.value = cell.index
	}

	const onCellLeave = () => {
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
		onCellLeave()
	}

	const onCellActivate = (cell: IChartHeatmapCell, event: MouseEvent | KeyboardEvent) => {
		hoveredIndex.value = cell.index
		if (hoveredPoint.value) {
			emit('point-click', hoveredPoint.value, event)
		}
	}
</script>

<style
		lang="scss"
		scoped
>
	.origam-chart-heatmap {
		$this: &;

		display: grid;
		gap: var(--origam-chart---gap, 12px);
		padding: var(--origam-chart---padding, 12px);
		background-color: var(--origam-chart---background-color, transparent);
		color: var(--origam-chart---color, inherit);
		width: 100%;
		box-sizing: border-box;
		grid-template-rows: auto 1fr;
		grid-template-columns: 1fr;
		grid-template-areas:
			"header"
			"body";

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

		.origam-chart__heatmap-cell {
			stroke: var(--origam-chart__heatmap---stroke-color, var(--origam-color-surface-default, #ffffff));
			stroke-width: var(--origam-chart__heatmap---stroke-width, 0.5);
			cursor: pointer;
			transition: opacity 150ms ease, filter 150ms ease;

			&:hover,
			&:focus-visible,
			&--active {
				outline: none;
				filter: brightness(1.1);
				stroke-width: 1.5;
			}
		}

		.origam-chart__heatmap-label {
			pointer-events: none;
			font-size: var(--origam-chart__heatmap-label---font-size, 0.5625rem);
			font-weight: var(--origam-chart__heatmap-label---font-weight, 600);
			fill: var(--origam-chart__heatmap-label---color, #ffffff);
			user-select: none;
		}

		.origam-chart__heatmap-axis-label {
			pointer-events: none;
			font-size: var(--origam-chart__heatmap-axis-label---font-size, 0.625rem);
			fill: var(--origam-chart__heatmap-axis-label---color, var(--origam-color-text-secondary, #6b7280));
			user-select: none;
		}

		.origam-chart__heatmap-legend-label {
			pointer-events: none;
			font-size: var(--origam-chart__heatmap-legend-label---font-size, 0.625rem);
			fill: var(--origam-chart__heatmap-legend-label---color, var(--origam-color-text-secondary, #6b7280));
			user-select: none;
		}

		.origam-chart__svg--animated .origam-chart__heatmap-cell {
			animation: origam-chart-heatmap-fade var(--origam-chart---animation-duration, 600ms) ease-out both;
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

		&--no-animation .origam-chart__heatmap-cell {
			animation: none;
		}
	}

	@keyframes origam-chart-heatmap-fade {
		from {
			opacity: 0;
		}
		to {
			opacity: 1;
		}
	}

	@media (prefers-reduced-motion: reduce) {
		.origam-chart-heatmap .origam-chart__svg--animated .origam-chart__heatmap-cell {
			animation: none;
		}
	}
</style>
