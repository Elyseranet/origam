<template>
	<div
			class="origam-chart-variwide"
			:class="rootClasses"
			:style="[rootStyles, dimensionStyles, marginStyles, paddingStyles, backgroundColorStyles, elevationStyles, roundedStyles, headerTypographyStyles]"
			role="figure"
			:aria-label="ariaLabel"
			data-cy="origam-chart-variwide"
	>
		<div
				v-if="hasTitleBlock"
				class="origam-chart-variwide__header"
				data-cy="origam-chart-variwide-header"
		>
			<slot name="title">
				<div
						v-if="title"
						class="origam-chart-variwide__title"
				>
					{{ title }}
				</div>
				<div
						v-if="subtitle"
						class="origam-chart-variwide__subtitle"
				>
					{{ subtitle }}
				</div>
			</slot>
		</div>

		<div
				class="origam-chart-variwide__body"
				:class="bodyClasses"
				data-cy="origam-chart-variwide-body"
		>
			<svg
					ref="svgRef"
					class="origam-chart-variwide__svg origam-chart__svg"
					:class="svgClasses"
					:viewBox="`0 0 ${ SVG_WIDTH } ${ SVG_HEIGHT }`"
					role="img"
					:aria-label="svgAriaLabel"
					preserveAspectRatio="xMidYMid meet"
					data-cy="origam-chart-variwide-svg"
					@mousemove="onSvgMouseMove"
					@mouseleave="onSvgMouseLeave"
			>
				<title>{{ svgTitle }}</title>
				<desc>{{ svgDesc }}</desc>

				<g
						v-if="showGrid"
						class="origam-chart-variwide__grid"
						data-cy="origam-chart-variwide-grid"
				>
					<line
							v-for="tick in yTicks"
							:key="`grid-${ tick.value }`"
							class="origam-chart-variwide__grid-line"
							:x1="PLOT.left"
							:y1="scaleY(tick.value)"
							:x2="PLOT.left + plotWidth"
							:y2="scaleY(tick.value)"
							data-cy="origam-chart-variwide-grid-line"
					/>
				</g>

				<g
						v-if="showAxis"
						class="origam-chart-variwide__axis origam-chart-variwide__axis--y"
						data-cy="origam-chart-variwide-axis-y"
				>
					<line
							class="origam-chart-variwide__axis-line"
							:x1="PLOT.left"
							:y1="PLOT.top"
							:x2="PLOT.left"
							:y2="PLOT.top + plotHeight"
					/>
					<g
							v-for="tick in yTicks"
							:key="`ytick-${ tick.value }`"
							class="origam-chart-variwide__tick origam-chart-variwide__tick--y"
					>
						<line
								:x1="PLOT.left - TICK_SIZE"
								:y1="scaleY(tick.value)"
								:x2="PLOT.left"
								:y2="scaleY(tick.value)"
								class="origam-chart-variwide__tick-mark"
						/>
						<text
								:x="PLOT.left - TICK_SIZE - 4"
								:y="scaleY(tick.value)"
								class="origam-chart-variwide__tick-label origam-chart-variwide__tick-label--y"
								text-anchor="end"
								dominant-baseline="middle"
						>
							{{ tick.label }}
						</text>
					</g>
				</g>

				<g
						v-if="showAxis"
						class="origam-chart-variwide__axis origam-chart-variwide__axis--x"
						data-cy="origam-chart-variwide-axis-x"
				>
					<line
							class="origam-chart-variwide__axis-line"
							:x1="PLOT.left"
							:y1="PLOT.top + plotHeight"
							:x2="PLOT.left + plotWidth"
							:y2="PLOT.top + plotHeight"
					/>
					<g
							v-for="col in columns"
							:key="`xtick-${ col.index }`"
							class="origam-chart-variwide__tick origam-chart-variwide__tick--x"
					>
						<line
								:x1="col.cx"
								:y1="PLOT.top + plotHeight"
								:x2="col.cx"
								:y2="PLOT.top + plotHeight + TICK_SIZE"
								class="origam-chart-variwide__tick-mark"
						/>
						<text
								:x="col.cx"
								:y="PLOT.top + plotHeight + TICK_SIZE + 4"
								class="origam-chart-variwide__tick-label origam-chart-variwide__tick-label--x"
								text-anchor="middle"
								dominant-baseline="hanging"
						>
							{{ formatCategory(col.category) }}
						</text>
					</g>
				</g>

				<g
						class="origam-chart__series"
						data-cy="origam-chart-variwide-series"
				>
					<rect
							v-for="col in columns"
							:key="`col-${ col.index }`"
							class="origam-chart-variwide__bar"
							:class="{ 'origam-chart-variwide__bar--active': hoveredIndex === col.index }"
							:x="col.x"
							:y="col.y"
							:width="col.w"
							:height="col.h"
							rx="2"
							ry="2"
							:style="{ fill: col.color }"
							tabindex="0"
							role="button"
							:aria-label="columnAriaLabel(col)"
							:data-cy="`origam-chart-variwide-bar-${ col.index }`"
							@click="onColumnActivate(col, $event)"
							@keydown.enter.prevent="onColumnActivate(col, $event)"
							@keydown.space.prevent="onColumnActivate(col, $event)"
							@mouseenter="onColumnEnter(col)"
							@mouseleave="onColumnLeave"
					/>

					<template v-if="showLabel">
						<text
								v-for="col in columns"
								:key="`label-${ col.index }`"
								class="origam-chart-variwide__bar-label"
								:x="col.cx"
								:y="col.y - 4"
								text-anchor="middle"
								dominant-baseline="auto"
								:data-cy="`origam-chart-variwide-label-${ col.index }`"
						>
							{{ col.formattedValue }}
						</text>
					</template>
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
							v-bind="tooltipBindings(bindings)"
					/>
				</template>
			</origam-chart-tooltip>

			<div
					v-if="showEmpty"
					class="origam-chart-variwide__empty origam-chart__empty"
					data-cy="origam-chart-variwide-empty"
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
		IChartVariwideColumn,
		IChartVariwideDatum,
		IChartVariwideEmits,
		IChartVariwideProps
	} from '../../interfaces'

	import { intentBgExpr, isIntent } from '../../utils/Commons/color.util'

	import type { TIntent } from '../../types'

	/*********************************************************
	 * Global
	 *
	 * @description
	 * Variwide chart family. Renders a single series of N data
	 * points as N vertical bars where:
	 *   - HEIGHT encodes the primary `value` (Y scale)
	 *   - WIDTH  encodes the secondary `width` (proportional
	 *             share of the total plot width)
	 *
	 * Classic use-cases: GDP × population, revenue × market
	 * share, response time × request count.
	 *
	 * `withDefaults` literals only, per CLAUDE.md.
	 ********************************************************/
	defineOptions({
		name: 'OrigamChartVariwide'
	})

	const props = withDefaults(defineProps<IChartVariwideProps>(), {
		categories: () => [],
		height: 360,
		title: undefined,
		subtitle: undefined,
		showLegend: false,
		legendPosition: 'bottom',
		showTooltip: true,
		animated: true,
		animationDuration: 600,
		colorScheme: () => [],
		aspectRatio: undefined,
		barGap: 2,
		showLabel: true,
		showAxis: true,
		showGrid: true,
		xAxisFormat: undefined,
		yAxisFormat: undefined,
		yMin: undefined,
		yMax: undefined
	})

	const emit = defineEmits<IChartVariwideEmits>()

	const { dimensionStyles } = useDimension(props)
	const { backgroundColorClasses, backgroundColorStyles } = useBackgroundColor(props, 'bgColor')
	const { elevationClasses, elevationStyles } = useElevation(props)
	const { marginStyles } = useMargin(props)
	const { paddingStyles } = usePadding(props)
	const { roundedClasses, roundedStyles } = useRounded(props)
	const { headerTypographyStyles } = useChartHeaderTypography(props)

	/*********************************************************
	 * Static SVG box — fixed 600 × 400 coordinate space;
	 * CSS scales it to the container.
	 ********************************************************/
	const SVG_WIDTH = 600
	const SVG_HEIGHT = 400
	const TICK_SIZE = 4

	const PLOT = {
		top: 24,
		right: 16,
		bottom: 40,
		left: 48
	}

	const plotWidth = SVG_WIDTH - PLOT.left - PLOT.right
	const plotHeight = SVG_HEIGHT - PLOT.top - PLOT.bottom

	/*********************************************************
	 * Default colour palette
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

	const colorFor = (datum: IChartVariwideDatum, dataIndex: number): string => {
		if (datum.color) return resolveColor(datum.color)
		const scheme = props.colorScheme?.length ? props.colorScheme : DEFAULT_PALETTE
		return resolveColor(scheme[dataIndex % scheme.length])
	}

	/*********************************************************
	 * Data normalisation
	 *
	 * `series[0].data` can be:
	 *   - `Array<IChartVariwideDatum>` — the canonical shape
	 *   - `Array<number>` — compatible but widths default to 1
	 *   - `Array<{x, y}>` — legacy point shape, y → value,
	 *     x → category, width defaults to 1
	 ********************************************************/
	const datums = computed<Array<IChartVariwideDatum>>(() => {
		const series = props.series?.[0]
		if (!series?.data?.length) return []

		return (series.data as Array<unknown>).map((item, i): IChartVariwideDatum => {
			if (typeof item === 'number') {
				const cat = props.categories?.[i] ?? String(i)
				return { category: cat, value: item, width: 1 }
			}
			if (typeof item === 'object' && item !== null) {
				const obj = item as Record<string, unknown>
				if ('category' in obj) {
					return item as IChartVariwideDatum
				}
				const x = obj['x']
				const y = obj['y']
				return {
					category: x != null ? String(x) : (props.categories?.[i] ?? String(i)),
					value: typeof y === 'number' ? y : 0,
					width: 1
				}
			}
			return { category: props.categories?.[i] ?? String(i), value: 0, width: 1 }
		})
	})

	/*********************************************************
	 * Y scale
	 ********************************************************/
	const yDomain = computed<{ min: number, max: number }>(() => {
		if (!datums.value.length) return { min: 0, max: 1 }
		const values = datums.value.map((d) => d.value).filter(Number.isFinite)
		const rawMin = Math.min(...values, 0)
		const rawMax = Math.max(...values, 0)
		return {
			min: props.yMin !== undefined ? props.yMin : rawMin,
			max: props.yMax !== undefined ? props.yMax : rawMax
		}
	})

	const scaleY = (value: number): number => {
		const { min, max } = yDomain.value
		const range = max - min || 1
		const fraction = (value - min) / range
		return PLOT.top + plotHeight * (1 - fraction)
	}

	/*********************************************************
	 * Y-axis ticks
	 ********************************************************/
	const Y_TICK_COUNT = 5

	const yTicks = computed(() => {
		const { min, max } = yDomain.value
		const range = max - min || 1
		const step = range / (Y_TICK_COUNT - 1)
		return Array.from({ length: Y_TICK_COUNT }, (_, i) => {
			const value = min + i * step
			const label = props.yAxisFormat ? props.yAxisFormat(value) : String(Math.round(value * 100) / 100)
			return { value, label }
		})
	})

	/*********************************************************
	 * Geometry — variwide columns
	 ********************************************************/
	const columns = computed<Array<IChartVariwideColumn>>(() => {
		const items = datums.value
		if (!items.length) return []

		const totalW = items.reduce((acc, d) => acc + (Number.isFinite(d.width) && d.width > 0 ? d.width : 1), 0)
		const usableW = plotWidth - props.barGap * Math.max(0, items.length - 1)

		const baseline = scaleY(0)

		let cursorX = PLOT.left

		return items.map((datum, i): IChartVariwideColumn => {
			const w = Math.max(0, (datum.width / totalW) * usableW)
			const barTop = scaleY(datum.value)
			const barHeight = Math.abs(baseline - barTop)

			const col: IChartVariwideColumn = {
				index: i,
				category: datum.category,
				value: datum.value,
				widthValue: datum.width,
				formattedValue: props.yAxisFormat ? props.yAxisFormat(datum.value) : String(datum.value),
				formattedWidth: String(datum.width),
				color: colorFor(datum, i),
				x: cursorX,
				y: Math.min(barTop, baseline),
				w,
				h: Math.max(barHeight, 1),
				cx: cursorX + w / 2
			}

			cursorX += w + props.barGap

			return col
		})
	})

	/*********************************************************
	 * formatCategory helper
	 ********************************************************/
	const formatCategory = (cat: string): string => {
		if (props.xAxisFormat) return String(props.xAxisFormat(cat))
		return cat
	}

	/*********************************************************
	 * Legend items — one per column
	 ********************************************************/
	const legendItems = computed<Array<IChartLegendItem>>(() => {
		const series = props.series?.[0]
		if (!series) return []
		return columns.value.map((col) => ({
			series: {
				...series,
				name: col.category,
				data: [col.value],
				visible: true
			} as IChartSeries,
			index: col.index,
			color: col.color,
			visible: true
		}))
	})

	/*********************************************************
	 * Empty state
	 ********************************************************/
	const showEmpty = computed(() => {
		if (!props.series?.length) return true
		const first = props.series[0]
		if (!first?.data?.length) return true
		return columns.value.length === 0
	})

	/*********************************************************
	 * Hover / tooltip
	 ********************************************************/
	const svgRef = ref<SVGSVGElement | null>(null)
	const mousePos = ref<{ x: number, y: number }>({ x: 0, y: 0 })
	const hoveredIndex = ref<number | null>(null)

	const hoveredColumn = computed<IChartVariwideColumn | null>(() => {
		if (hoveredIndex.value === null) return null
		return columns.value.find((c) => c.index === hoveredIndex.value) ?? null
	})

	const hoveredPoint = computed<IChartPoint | null>(() => {
		const col = hoveredColumn.value
		if (!col || !props.series?.[0]) return null
		return {
			seriesIndex: 0,
			seriesName: props.series[0].name,
			dataIndex: col.index,
			x: col.category,
			y: col.value,
			color: col.color
		}
	})

	const hoveredSeries = computed<IChartSeries | null>(() => {
		if (!hoveredColumn.value || !props.series?.[0]) return null
		return props.series[0]
	})

	const hoveredCategory = computed<string | number>(() =>
		hoveredColumn.value?.category ?? ''
	)

	const tooltipBindings = (bindings: Record<string, unknown>) => {
		const col = hoveredColumn.value
		if (!col) return bindings
		return {
			...bindings,
			category: col.category,
			value: col.value,
			widthValue: col.widthValue,
			formattedValue: col.formattedValue,
			formattedWidth: col.formattedWidth,
			color: col.color
		}
	}

	/*********************************************************
	 * Root classes / styles
	 ********************************************************/
	const rootClasses = computed(() => [
		{
			[`origam-chart-variwide--legend-${ props.legendPosition }`]: true,
			'origam-chart-variwide--no-animation': !props.animated
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
		'origam-chart-variwide__body--with-side-legend': props.showLegend
			&& (props.legendPosition === 'left' || props.legendPosition === 'right')
	}))

	const svgClasses = computed(() => ({
		'origam-chart__svg--animated': props.animated
	}))

	const hasTitleBlock = computed(() => Boolean(props.title || props.subtitle))

	/*********************************************************
	 * ARIA
	 ********************************************************/
	const ariaLabel = computed(() => props.title ?? 'variwide chart')
	const svgAriaLabel = computed(() => props.title ?? 'variwide chart')
	const svgTitle = computed(() => props.title ?? 'variwide chart')
	const svgDesc = computed(() => {
		const n = columns.value.length
		return `Variwide chart with ${ n } ${ n === 1 ? 'column' : 'columns' }.`
	})

	const columnAriaLabel = (col: IChartVariwideColumn): string =>
		`${ col.category }: value ${ col.formattedValue }, width ${ col.formattedWidth }`

	/*********************************************************
	 * Interaction
	 ********************************************************/
	const onColumnEnter = (col: IChartVariwideColumn) => {
		hoveredIndex.value = col.index
	}

	const onColumnLeave = () => {
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
		onColumnLeave()
	}

	const onColumnActivate = (col: IChartVariwideColumn, event: MouseEvent | KeyboardEvent) => {
		hoveredIndex.value = col.index
		if (hoveredPoint.value) {
			emit('point-click', hoveredPoint.value, event)
		}
	}

	const onLegendClick = (series: IChartSeries, index: number): void => {
		emit('legend-click', series, index)
	}

	const onSeriesToggle = (series: IChartSeries, visible: boolean): void => {
		emit('series-toggle', series, visible)
	}
</script>

<style
		lang="scss"
		scoped
>
	.origam-chart-variwide {
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

		&__grid-line {
			stroke: var(--origam-chart-variwide__grid---stroke, var(--origam-color-border-subtle, #e5e7eb));
			stroke-width: 1;
			stroke-dasharray: 4 4;
		}

		&__axis-line {
			stroke: var(--origam-chart-variwide__axis---stroke, var(--origam-color-border-default, #d1d5db));
			stroke-width: 1;
		}

		&__tick-mark {
			stroke: var(--origam-chart-variwide__tick---stroke, var(--origam-color-border-default, #d1d5db));
			stroke-width: 1;
		}

		&__tick-label {
			font-size: var(--origam-chart-variwide__tick-label---font-size, 0.6875rem);
			fill: var(--origam-chart-variwide__tick-label---fill, var(--origam-color-text-secondary, #6b7280));
			user-select: none;
		}

		&__bar {
			cursor: pointer;
			transition: opacity 150ms ease, filter 150ms ease;
			stroke: var(--origam-chart-variwide__bar---stroke-color, var(--origam-color-surface-default, #ffffff));
			stroke-width: var(--origam-chart-variwide__bar---stroke-width, 1);

			&:hover,
			&:focus-visible,
			&--active {
				outline: none;
				filter: brightness(1.1);
			}
		}

		&__bar-label {
			pointer-events: none;
			font-size: var(--origam-chart-variwide__bar-label---font-size, 0.6875rem);
			font-weight: var(--origam-chart-variwide__bar-label---font-weight, 600);
			fill: var(--origam-chart-variwide__bar-label---fill, var(--origam-color-text-primary, currentColor));
			user-select: none;
		}

		.origam-chart__svg--animated &__bar {
			animation: origam-chart-variwide-grow var(--origam-chart---animation-duration, 600ms) ease-out both;
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

		&--no-animation &__bar {
			animation: none;
		}
	}

	@keyframes origam-chart-variwide-grow {
		from {
			transform: scaleY(0);
			transform-origin: bottom center;
			opacity: 0;
		}
		to {
			transform: scaleY(1);
			transform-origin: bottom center;
			opacity: 1;
		}
	}

	@media (prefers-reduced-motion: reduce) {
		.origam-chart-variwide .origam-chart__svg--animated .origam-chart-variwide__bar {
			animation: none;
		}
	}
</style>
