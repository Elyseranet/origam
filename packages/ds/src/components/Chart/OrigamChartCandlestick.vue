<template>
	<div
			class="origam-chart-candlestick"
			:class="rootClasses"
			:style="[rootStyles, dimensionStyles, marginStyles, paddingStyles, backgroundColorStyles, elevationStyles, roundedStyles, headerTypographyStyles]"
			role="figure"
			:aria-label="ariaLabel"
			data-cy="origam-chart-candlestick"
	>
		<div
				v-if="hasTitleBlock"
				class="origam-chart-candlestick__header"
				data-cy="origam-chart-candlestick-header"
		>
			<slot name="title">
				<div
						v-if="title"
						class="origam-chart-candlestick__title"
				>
					{{ title }}
				</div>
				<div
						v-if="subtitle"
						class="origam-chart-candlestick__subtitle"
				>
					{{ subtitle }}
				</div>
			</slot>
		</div>

		<div
				class="origam-chart-candlestick__body"
				:class="bodyClasses"
				data-cy="origam-chart-candlestick-body"
		>
			<svg
					ref="svgRef"
					class="origam-chart-candlestick__svg origam-chart__svg"
					:class="svgClasses"
					:viewBox="`0 0 ${ SVG_WIDTH } ${ SVG_HEIGHT }`"
					role="img"
					:aria-label="svgAriaLabel"
					preserveAspectRatio="xMidYMid meet"
					data-cy="origam-chart-candlestick-svg"
					@mousemove="onSvgMouseMove"
					@mouseleave="onSvgMouseLeave"
			>
				<title>{{ svgTitle }}</title>
				<desc>{{ svgDesc }}</desc>

				<g
						v-if="showGrid"
						class="origam-chart-candlestick__grid"
						data-cy="origam-chart-candlestick-grid"
				>
					<line
							v-for="tick in yTicks"
							:key="`grid-y-${ tick.value }`"
							class="origam-chart-candlestick__grid-line"
							:x1="PADDING.left"
							:y1="tick.position"
							:x2="SVG_WIDTH - PADDING.right"
							:y2="tick.position"
							data-cy="origam-chart-candlestick-grid-line"
					/>
				</g>

				<g
						v-if="showAxis"
						class="origam-chart-candlestick__axis"
						data-cy="origam-chart-candlestick-axis"
				>
					<text
							v-for="tick in yTicks"
							:key="`y-label-${ tick.value }`"
							class="origam-chart-candlestick__axis-label origam-chart-candlestick__axis-label--y"
							:x="PADDING.left - 6"
							:y="tick.position"
							text-anchor="end"
							dominant-baseline="middle"
					>{{ tick.label }}</text>

					<text
							v-for="(candle, i) in candles"
							:key="`x-label-${ i }`"
							class="origam-chart-candlestick__axis-label origam-chart-candlestick__axis-label--x"
							:x="candle.cx"
							:y="SVG_HEIGHT - PADDING.bottom + 14"
							text-anchor="middle"
							dominant-baseline="auto"
					>{{ formatXLabel(candle.datum.date, i) }}</text>
				</g>

				<g
						class="origam-chart__series"
						data-cy="origam-chart-candlestick-series"
				>
					<g
							v-for="candle in candles"
							:key="`candle-${ candle.index }`"
							class="origam-chart-candlestick__candle"
							:class="{
								'origam-chart-candlestick__candle--bullish': candle.isBullish,
								'origam-chart-candlestick__candle--bearish': !candle.isBullish,
								'origam-chart-candlestick__candle--active': hoveredIndex === candle.index
							}"
							tabindex="0"
							role="button"
							:aria-label="candleAriaLabel(candle)"
							:data-cy="`origam-chart-candlestick-candle-${ candle.index }`"
							@click="onCandleActivate(candle, $event)"
							@keydown.enter.prevent="onCandleActivate(candle, $event)"
							@keydown.space.prevent="onCandleActivate(candle, $event)"
							@mouseenter="onCandleEnter(candle)"
							@mouseleave="onCandleLeave"
					>
						<line
								class="origam-chart-candlestick__wick"
								:x1="candle.cx"
								:y1="candle.wickTop"
								:x2="candle.cx"
								:y2="candle.wickBottom"
								:stroke-width="wickWidth"
								:style="{ stroke: candle.color }"
								:data-cy="`origam-chart-candlestick-wick-${ candle.index }`"
						/>
						<rect
								class="origam-chart-candlestick__body-rect"
								:x="candle.bodyX"
								:y="candle.bodyY"
								:width="candle.bodyWidth"
								:height="Math.max(candle.bodyHeight, 1)"
								:style="{ fill: candle.color }"
								:data-cy="`origam-chart-candlestick-body-${ candle.index }`"
						/>
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
							v-bind="enrichedTooltipBindings(bindings)"
					/>
				</template>
			</origam-chart-tooltip>

			<div
					v-if="showEmpty"
					class="origam-chart-candlestick__empty origam-chart__empty"
					data-cy="origam-chart-candlestick-empty"
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
		IChartCandlestickCandle,
		IChartCandlestickEmits,
		IChartCandlestickDatum,
		IChartCandlestickProps,
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
	 * Financial OHLC candlestick chart. Renders one candle per datum:
	 * a rectangular body between open and close, plus a thin wick
	 * from low to high.
	 *
	 * - Bullish (close ≥ open): body filled with `bullishColor`
	 * - Bearish (close < open): body filled with `bearishColor`
	 *
	 * Y scale: auto from min(low)/max(high) + 5% padding, or
	 * overridden via `yMin`/`yMax` props.
	 *
	 * `withDefaults` literals only, per CLAUDE.md.
	 ********************************************************/
	defineOptions({
		name: 'OrigamChartCandlestick'
	})

	const props = withDefaults(defineProps<IChartCandlestickProps>(), {
		height: 400,
		title: undefined,
		subtitle: undefined,
		bullishColor: 'success',
		bearishColor: 'danger',
		candleWidth: 0.6,
		wickWidth: 1,
		showLegend: false,
		legendPosition: 'bottom',
		showTooltip: true,
		showGrid: true,
		showAxis: true,
		animated: true,
		animationDuration: 600,
		aspectRatio: undefined,
		colorScheme: () => [],
		xAxisFormat: undefined,
		yAxisFormat: undefined,
		yMin: undefined,
		yMax: undefined
	})

	const emit = defineEmits<IChartCandlestickEmits>()

	const { dimensionStyles } = useDimension(props)
	const { backgroundColorClasses, backgroundColorStyles } = useBackgroundColor(props, 'bgColor')
	const { elevationClasses, elevationStyles } = useElevation(props)
	const { marginClasses, marginStyles } = useMargin(props)
	const { paddingClasses, paddingStyles } = usePadding(props)
	const { roundedClasses, roundedStyles } = useRounded(props)
	const { headerTypographyStyles } = useChartHeaderTypography(props)

	/*********************************************************
	 * Static SVG box — fixed coordinate space, CSS scales it.
	 ********************************************************/
	const SVG_WIDTH = 600
	const SVG_HEIGHT = 400
	const PADDING = { top: 20, right: 20, bottom: 36, left: 56 }
	const Y_TICK_COUNT = 5
	const Y_PAD_FRACTION = 0.05
	const MAX_X_LABELS = 10

	/*********************************************************
	 * Color resolution
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

	const bullishColorResolved = computed(() => resolveColor(props.bullishColor))
	const bearishColorResolved = computed(() => resolveColor(props.bearishColor))

	/*********************************************************
	 * Data access helpers
	 ********************************************************/
	const rawData = computed<Array<IChartCandlestickDatum>>(() => {
		const series = props.series?.[0]
		if (!series?.data?.length) return []
		return series.data as unknown as Array<IChartCandlestickDatum>
	})

	const validData = computed(() =>
		rawData.value.filter(
			(d) =>
				d &&
				typeof d.open === 'number' &&
				typeof d.high === 'number' &&
				typeof d.low === 'number' &&
				typeof d.close === 'number' &&
				Number.isFinite(d.open) &&
				Number.isFinite(d.high) &&
				Number.isFinite(d.low) &&
				Number.isFinite(d.close)
		)
	)

	/*********************************************************
	 * Y scale
	 ********************************************************/
	const yDomain = computed(() => {
		if (!validData.value.length) return { min: 0, max: 1 }

		const allLows = validData.value.map((d) => d.low)
		const allHighs = validData.value.map((d) => d.high)
		const rawMin = Math.min(...allLows)
		const rawMax = Math.max(...allHighs)
		const range = rawMax - rawMin || 1
		const pad = range * Y_PAD_FRACTION

		return {
			min: props.yMin !== undefined ? props.yMin : rawMin - pad,
			max: props.yMax !== undefined ? props.yMax : rawMax + pad
		}
	})

	const plotTop = PADDING.top
	const plotBottom = SVG_HEIGHT - PADDING.bottom
	const plotHeight = plotBottom - plotTop

	const yToSvg = (value: number): number => {
		const { min, max } = yDomain.value
		const range = max - min || 1
		return plotBottom - ((value - min) / range) * plotHeight
	}

	/*********************************************************
	 * Y ticks
	 ********************************************************/
	const yTicks = computed(() => {
		const { min, max } = yDomain.value
		const range = max - min || 1
		const step = range / (Y_TICK_COUNT - 1)
		return Array.from({ length: Y_TICK_COUNT }, (_, i) => {
			const value = min + i * step
			return {
				value,
				position: yToSvg(value),
				label: props.yAxisFormat ? props.yAxisFormat(value) : value.toFixed(0)
			}
		})
	})

	/*********************************************************
	 * Candle geometry
	 ********************************************************/
	const candles = computed<Array<IChartCandlestickCandle>>(() => {
		const data = validData.value
		const count = data.length
		if (!count) return []

		const plotLeft = PADDING.left
		const plotRight = SVG_WIDTH - PADDING.right
		const plotWidth = plotRight - plotLeft
		const slotW = plotWidth / count
		const candleHalfW = (slotW * props.candleWidth) / 2

		return data.map((datum, index) => {
			const cx = plotLeft + (index + 0.5) * slotW
			const isBullish = datum.close >= datum.open

			const yOpen = yToSvg(datum.open)
			const yClose = yToSvg(datum.close)
			const yHigh = yToSvg(datum.high)
			const yLow = yToSvg(datum.low)

			const bodyY = Math.min(yOpen, yClose)
			const bodyHeight = Math.abs(yClose - yOpen)

			const change = datum.close - datum.open
			const changePct = datum.open !== 0 ? (change / datum.open) * 100 : 0

			return {
				index,
				datum,
				cx,
				bodyX: cx - candleHalfW,
				bodyY,
				bodyWidth: candleHalfW * 2,
				bodyHeight,
				wickTop: yHigh,
				wickBottom: yLow,
				color: isBullish ? bullishColorResolved.value : bearishColorResolved.value,
				isBullish,
				change,
				changePct
			}
		})
	})

	/*********************************************************
	 * X-axis label formatting (show up to MAX_X_LABELS)
	 ********************************************************/
	const formatXLabel = (date: string, index: number): string => {
		const count = candles.value.length
		if (count > MAX_X_LABELS) {
			const step = Math.ceil(count / MAX_X_LABELS)
			if (index % step !== 0 && index !== count - 1) return ''
		}
		if (props.xAxisFormat) return props.xAxisFormat(date)
		return date
	}

	/*********************************************************
	 * Legend — one entry per series (not per candle)
	 ********************************************************/
	const legendItems = computed<Array<IChartLegendItem>>(() => {
		if (!props.series?.length) return []
		return props.series.map((s, i) => ({
			series: s,
			index: i,
			color: bullishColorResolved.value,
			visible: s.visible !== false
		}))
	})

	/*********************************************************
	 * Hover / tooltip
	 ********************************************************/
	const svgRef = ref<SVGSVGElement | null>(null)
	const mousePos = ref<{ x: number, y: number }>({ x: 0, y: 0 })
	const hoveredIndex = ref<number | null>(null)

	const hoveredCandle = computed<IChartCandlestickCandle | null>(() => {
		if (hoveredIndex.value === null) return null
		return candles.value.find((c) => c.index === hoveredIndex.value) ?? null
	})

	const hoveredPoint = computed<IChartPoint | null>(() => {
		const c = hoveredCandle.value
		if (!c || !props.series?.[0]) return null
		return {
			seriesIndex: 0,
			seriesName: props.series[0].name,
			dataIndex: c.index,
			x: c.datum.date,
			y: c.datum.close,
			color: c.color
		}
	})

	const hoveredSeries = computed<IChartSeries | null>(() => {
		if (!hoveredCandle.value || !props.series?.[0]) return null
		return props.series[0]
	})

	const hoveredCategory = computed<string | number>(() =>
		hoveredCandle.value?.datum.date ?? ''
	)

	const enrichedTooltipBindings = (bindings: Record<string, unknown>) => {
		const c = hoveredCandle.value
		return {
			...bindings,
			datum: c?.datum ?? null,
			change: c?.change ?? 0,
			changePct: c?.changePct ?? 0,
			isBullish: c?.isBullish ?? true
		}
	}

	const showEmpty = computed(() => {
		if (!props.series?.length) return true
		const first = props.series[0]
		if (!first?.data?.length) return true
		return validData.value.length === 0
	})

	/*********************************************************
	 * Root classes / styles
	 ********************************************************/
	const rootClasses = computed(() => [
		{
			[`origam-chart-candlestick--legend-${ props.legendPosition }`]: true,
			'origam-chart-candlestick--no-animation': !props.animated
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
		'origam-chart-candlestick__body--with-side-legend': props.showLegend
			&& (props.legendPosition === 'left' || props.legendPosition === 'right')
	}))

	const svgClasses = computed(() => ({
		'origam-chart__svg--animated': props.animated
	}))

	const hasTitleBlock = computed(() => Boolean(props.title || props.subtitle))

	/*********************************************************
	 * ARIA
	 ********************************************************/
	const ariaLabel = computed(() => props.title ?? 'candlestick chart')
	const svgAriaLabel = computed(() => props.title ?? 'candlestick chart')
	const svgTitle = computed(() => props.title ?? 'candlestick chart')
	const svgDesc = computed(() => {
		const n = candles.value.length
		return `Candlestick chart with ${ n } ${ n === 1 ? 'candle' : 'candles' }.`
	})

	const candleAriaLabel = (candle: IChartCandlestickCandle): string => {
		const d = candle.datum
		const direction = candle.isBullish ? 'bullish' : 'bearish'
		return `${ d.date }: ${ direction }, open ${ d.open }, high ${ d.high }, low ${ d.low }, close ${ d.close }`
	}

	/*********************************************************
	 * Interaction
	 ********************************************************/
	const onCandleEnter = (candle: IChartCandlestickCandle) => {
		hoveredIndex.value = candle.index
	}

	const onCandleLeave = () => {
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
		onCandleLeave()
	}

	const onCandleActivate = (candle: IChartCandlestickCandle, event: MouseEvent | KeyboardEvent) => {
		hoveredIndex.value = candle.index
		if (hoveredPoint.value) {
			emit('point-click', hoveredPoint.value, event)
		}
	}

	const onLegendClick = (series: IChartSeries, index: number): void => {
		emit('legend-click', series, index)
	}

	const onSeriesToggle = (series: IChartSeries, nextVisible: boolean): void => {
		emit('series-toggle', series, nextVisible)
	}
</script>

<style
		lang="scss"
		scoped
>
	.origam-chart-candlestick {
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
			stroke: var(--origam-chart__grid---stroke-color, var(--origam-color-border-subtle, #e5e7eb));
			stroke-width: var(--origam-chart__grid---stroke-width, 1);
			fill: none;
		}

		&__axis-label {
			font-size: var(--origam-chart__axis-label---font-size, 0.6875rem);
			fill: var(--origam-chart__axis-label---fill, var(--origam-color-text-secondary, #6b7280));
			user-select: none;
			pointer-events: none;
		}

		&__candle {
			cursor: pointer;
			outline: none;

			&:focus-visible {
				outline: 2px solid var(--origam-color-action--primary---bg, #3b82f6);
				outline-offset: 2px;
			}

			&--active,
			&:hover {
				opacity: 0.85;
			}
		}

		&__wick {
			fill: none;
		}

		&__body-rect {
			stroke: none;
		}

		.origam-chart__svg--animated &__candle {
			animation: origam-chart-candlestick-fade var(--origam-chart---animation-duration, 600ms) ease-out both;
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

		&--no-animation .origam-chart__svg--animated &__candle {
			animation: none;
		}
	}

	@keyframes origam-chart-candlestick-fade {
		from {
			opacity: 0;
		}
		to {
			opacity: 1;
		}
	}

	@media (prefers-reduced-motion: reduce) {
		.origam-chart-candlestick .origam-chart__svg--animated .origam-chart-candlestick__candle {
			animation: none;
		}
	}
</style>
