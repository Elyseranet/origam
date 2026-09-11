<template>
	<div
			class="origam-chart-pareto"
			:class="rootClasses"
			:style="[rootStyles, dimensionStyles, marginStyles, paddingStyles, backgroundColorStyles, elevationStyles, roundedStyles, headerTypographyStyles]"
			role="figure"
			:aria-label="ariaLabel"
			data-cy="origam-chart-pareto"
	>
		<div
				v-if="hasTitleBlock"
				class="origam-chart-pareto__header"
				data-cy="origam-chart-pareto-header"
		>
			<slot name="title">
				<div
						v-if="title"
						class="origam-chart-pareto__title"
				>
					{{ title }}
				</div>
				<div
						v-if="subtitle"
						class="origam-chart-pareto__subtitle"
				>
					{{ subtitle }}
				</div>
			</slot>
		</div>

		<div
				class="origam-chart-pareto__body"
				:class="bodyClasses"
				data-cy="origam-chart-pareto-body"
		>
			<svg
					ref="svgRef"
					class="origam-chart-pareto__svg origam-chart__svg"
					:class="svgClasses"
					:viewBox="`0 0 ${ SVG_WIDTH } ${ SVG_HEIGHT }`"
					role="img"
					:aria-label="svgAriaLabel"
					preserveAspectRatio="xMidYMid meet"
					data-cy="origam-chart-pareto-svg"
					@mousemove="onSvgMouseMove"
					@mouseleave="onSvgMouseLeave"
			>
				<title>{{ svgTitle }}</title>
				<desc>{{ svgDesc }}</desc>

				<g
						v-if="showGrid"
						class="origam-chart-pareto__grid"
						data-cy="origam-chart-pareto-grid"
				>
					<line
							v-for="tick in yTicks"
							:key="`grid-${ tick.value }`"
							class="origam-chart-pareto__grid-line"
							:x1="PLOT.left"
							:y1="scaleY(tick.value)"
							:x2="PLOT.left + plotWidth"
							:y2="scaleY(tick.value)"
							data-cy="origam-chart-pareto-grid-line"
					/>
				</g>

				<g
						v-if="showAxis"
						class="origam-chart-pareto__axis origam-chart-pareto__axis--y-left"
						data-cy="origam-chart-pareto-axis-y-left"
				>
					<line
							class="origam-chart-pareto__axis-line"
							:x1="PLOT.left"
							:y1="PLOT.top"
							:x2="PLOT.left"
							:y2="PLOT.top + plotHeight"
					/>
					<g
							v-for="tick in yTicks"
							:key="`ytick-${ tick.value }`"
							class="origam-chart-pareto__tick origam-chart-pareto__tick--y"
					>
						<line
								:x1="PLOT.left - TICK_SIZE"
								:y1="scaleY(tick.value)"
								:x2="PLOT.left"
								:y2="scaleY(tick.value)"
								class="origam-chart-pareto__tick-mark"
						/>
						<text
								:x="PLOT.left - TICK_SIZE - 4"
								:y="scaleY(tick.value)"
								class="origam-chart-pareto__tick-label origam-chart-pareto__tick-label--y"
								text-anchor="end"
								dominant-baseline="middle"
						>
							{{ tick.label }}
						</text>
					</g>
				</g>

				<g
						v-if="showAxis && showLine"
						class="origam-chart-pareto__axis origam-chart-pareto__axis--y-right"
						data-cy="origam-chart-pareto-axis-y-right"
				>
					<line
							class="origam-chart-pareto__axis-line"
							:x1="PLOT.left + plotWidth"
							:y1="PLOT.top"
							:x2="PLOT.left + plotWidth"
							:y2="PLOT.top + plotHeight"
					/>
					<g
							v-for="tick in cumulativeTicks"
							:key="`ctick-${ tick.value }`"
							class="origam-chart-pareto__tick origam-chart-pareto__tick--cumulative"
					>
						<line
								:x1="PLOT.left + plotWidth"
								:y1="scaleYCumulative(tick.value)"
								:x2="PLOT.left + plotWidth + TICK_SIZE"
								:y2="scaleYCumulative(tick.value)"
								class="origam-chart-pareto__tick-mark"
						/>
						<text
								:x="PLOT.left + plotWidth + TICK_SIZE + 4"
								:y="scaleYCumulative(tick.value)"
								class="origam-chart-pareto__tick-label origam-chart-pareto__tick-label--cumulative"
								text-anchor="start"
								dominant-baseline="middle"
						>
							{{ tick.label }}
						</text>
					</g>
				</g>

				<g
						v-if="showAxis"
						class="origam-chart-pareto__axis origam-chart-pareto__axis--x"
						data-cy="origam-chart-pareto-axis-x"
				>
					<line
							class="origam-chart-pareto__axis-line"
							:x1="PLOT.left"
							:y1="PLOT.top + plotHeight"
							:x2="PLOT.left + plotWidth"
							:y2="PLOT.top + plotHeight"
					/>
					<g
							v-for="bar in bars"
							:key="`xtick-${ bar.index }`"
							class="origam-chart-pareto__tick origam-chart-pareto__tick--x"
					>
						<line
								:x1="bar.cx"
								:y1="PLOT.top + plotHeight"
								:x2="bar.cx"
								:y2="PLOT.top + plotHeight + TICK_SIZE"
								class="origam-chart-pareto__tick-mark"
						/>
						<text
								:x="bar.cx"
								:y="PLOT.top + plotHeight + TICK_SIZE + 4"
								class="origam-chart-pareto__tick-label origam-chart-pareto__tick-label--x"
								text-anchor="middle"
								dominant-baseline="hanging"
						>
							{{ formatCategory(bar.category) }}
						</text>
					</g>
				</g>

				<g
						class="origam-chart__series"
						data-cy="origam-chart-pareto-series"
				>
					<rect
							v-for="bar in bars"
							:key="`bar-${ bar.index }`"
							class="origam-chart-pareto__bar"
							:class="{ 'origam-chart-pareto__bar--active': hoveredIndex === bar.index }"
							:x="bar.x"
							:y="bar.y"
							:width="bar.w"
							:height="bar.h"
							rx="2"
							ry="2"
							:style="{ fill: bar.color }"
							tabindex="0"
							role="button"
							:aria-label="barAriaLabel(bar)"
							:data-cy="`origam-chart-pareto-bar-${ bar.index }`"
							@click="onBarActivate(bar, $event)"
							@keydown.enter.prevent="onBarActivate(bar, $event)"
							@keydown.space.prevent="onBarActivate(bar, $event)"
							@mouseenter="onBarEnter(bar)"
							@mouseleave="onBarLeave"
					/>

					<template v-if="showLabel">
						<text
								v-for="bar in bars"
								:key="`label-${ bar.index }`"
								class="origam-chart-pareto__bar-label"
								:x="bar.cx"
								:y="bar.y - 4"
								text-anchor="middle"
								dominant-baseline="auto"
								:data-cy="`origam-chart-pareto-label-${ bar.index }`"
						>
							{{ bar.formattedValue }}
						</text>
					</template>
				</g>

				<g
						v-if="showLine && bars.length > 0"
						class="origam-chart-pareto__line-group"
						data-cy="origam-chart-pareto-line-group"
				>
					<path
							class="origam-chart-pareto__line"
							:d="cumulativeLinePath"
							:style="{ stroke: resolvedLineColor, fill: 'none' }"
							data-cy="origam-chart-pareto-line"
					/>

					<circle
							v-for="bar in bars"
							:key="`dot-${ bar.index }`"
							class="origam-chart-pareto__line-dot"
							:cx="bar.cx"
							:cy="bar.dotY"
							r="4"
							:style="{ fill: resolvedLineColor }"
							:data-cy="`origam-chart-pareto-dot-${ bar.index }`"
					/>
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
					class="origam-chart-pareto__empty origam-chart__empty"
					data-cy="origam-chart-pareto-empty"
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
		IChartSeries
	} from '../../interfaces'

	import type {
		IChartParetoBar,
		IChartParetoDatum,
		IChartParetoEmits,
		IChartParetoProps
	} from '../../interfaces/Chart/chart-pareto.interface'

	import { intentBgExpr, isIntent } from '../../utils/Commons/color.util'

	import type { TIntent } from '../../types'

	/*********************************************************
	 * Global
	 *
	 * @description
	 * Pareto chart family. Combines vertical columns sorted
	 * descending by value with a cumulative percentage line
	 * overlaid on a secondary right Y-axis.
	 *
	 * Classic uses: quality control, root-cause analysis,
	 * the 80/20 rule (Pareto principle).
	 *
	 * `withDefaults` literals only, per CLAUDE.md.
	 ********************************************************/
	defineOptions({
		name: 'OrigamChartPareto'
	})

	const props = withDefaults(defineProps<IChartParetoProps>(), {
		categories: () => [],
		height: 360,
		title: undefined,
		subtitle: undefined,
		barColor: 'primary',
		lineColor: 'danger',
		barGap: 4,
		showLine: true,
		showLabel: false,
		showLegend: true,
		legendPosition: 'bottom',
		showTooltip: true,
		showAxis: true,
		showGrid: true,
		animated: true,
		animationDuration: 600,
		colorScheme: () => [],
		aspectRatio: undefined,
		xAxisFormat: undefined,
		yAxisFormat: undefined,
		cumulativeFormat: undefined
	})

	const emit = defineEmits<IChartParetoEmits>()

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
	 * Right padding is wider to accommodate the right Y-axis.
	 ********************************************************/
	const SVG_WIDTH = 640
	const SVG_HEIGHT = 400
	const TICK_SIZE = 4

	const PLOT = {
		top: 24,
		right: 60,
		bottom: 48,
		left: 52
	}

	const plotWidth = SVG_WIDTH - PLOT.left - PLOT.right
	const plotHeight = SVG_HEIGHT - PLOT.top - PLOT.bottom

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

	const resolvedBarColor = computed<string>(() => resolveColor(props.barColor))
	const resolvedLineColor = computed<string>(() => resolveColor(props.lineColor))

	/*********************************************************
	 * Data normalisation — accepts IChartParetoDatum objects
	 * or legacy {x, y} point shapes from IChartSeries.data.
	 ********************************************************/
	const sortedData = computed<Array<IChartParetoDatum>>(() => {
		const series = props.series?.[0]
		if (!series?.data?.length) return []

		const items = (series.data as Array<unknown>).map((item, i): IChartParetoDatum => {
			if (typeof item === 'number') {
				const cat = props.categories?.[i] ?? String(i)
				return { category: cat, value: item }
			}
			if (typeof item === 'object' && item !== null) {
				const obj = item as Record<string, unknown>
				if ('category' in obj && typeof obj['value'] === 'number') {
					return item as IChartParetoDatum
				}
				const x = obj['x']
				const y = obj['y']
				return {
					category: x != null ? String(x) : (props.categories?.[i] ?? String(i)),
					value: typeof y === 'number' ? y : 0
				}
			}
			return { category: props.categories?.[i] ?? String(i), value: 0 }
		})

		return [...items].sort((a, b) => b.value - a.value)
	})

	const total = computed<number>(() =>
		sortedData.value.reduce((acc, d) => acc + (Number.isFinite(d.value) && d.value >= 0 ? d.value : 0), 0) || 1e-9
	)

	/*********************************************************
	 * Y scale — left axis (values)
	 ********************************************************/
	const yMax = computed<number>(() => {
		if (!sortedData.value.length) return 1
		return Math.max(...sortedData.value.map((d) => d.value).filter(Number.isFinite), 1)
	})

	const scaleY = (value: number): number => {
		const fraction = value / yMax.value
		return PLOT.top + plotHeight * (1 - fraction)
	}

	/*********************************************************
	 * Y scale — right axis (cumulative %)
	 ********************************************************/
	const scaleYCumulative = (fraction: number): number => {
		return PLOT.top + plotHeight * (1 - fraction)
	}

	/*********************************************************
	 * Y-axis ticks — left (values)
	 ********************************************************/
	const Y_TICK_COUNT = 5

	const yTicks = computed(() => {
		const max = yMax.value
		const step = max / (Y_TICK_COUNT - 1)
		return Array.from({ length: Y_TICK_COUNT }, (_, i) => {
			const value = i * step
			const label = props.yAxisFormat ? props.yAxisFormat(value) : String(Math.round(value * 100) / 100)
			return { value, label }
		})
	})

	/*********************************************************
	 * Cumulative axis ticks — right (0–100%)
	 ********************************************************/
	const CUMULATIVE_TICK_COUNT = 5

	const cumulativeTicks = computed(() => {
		return Array.from({ length: CUMULATIVE_TICK_COUNT }, (_, i) => {
			const fraction = i / (CUMULATIVE_TICK_COUNT - 1)
			const label = props.cumulativeFormat
				? props.cumulativeFormat(fraction)
				: `${ Math.round(fraction * 100) }%`
			return { value: fraction, label }
		})
	})

	/*********************************************************
	 * Geometry — Pareto bars
	 ********************************************************/
	const bars = computed<Array<IChartParetoBar>>(() => {
		const items = sortedData.value
		if (!items.length) return []

		const count = items.length
		const totalBarSpace = plotWidth - props.barGap * Math.max(0, count - 1)
		const barWidth = Math.max(1, totalBarSpace / count)
		const baseline = scaleY(0)

		let cumulativeSum = 0
		let cursorX = PLOT.left

		return items.map((datum, i): IChartParetoBar => {
			const safeValue = Number.isFinite(datum.value) && datum.value >= 0 ? datum.value : 0
			cumulativeSum += safeValue
			const cumulative = cumulativeSum / total.value
			const share = safeValue / total.value

			const barTop = scaleY(safeValue)
			const barHeight = Math.abs(baseline - barTop)

			const x = cursorX
			const cx = cursorX + barWidth / 2
			const dotY = scaleYCumulative(cumulative)

			cursorX += barWidth + props.barGap

			return {
				index: i,
				category: datum.category,
				value: safeValue,
				formattedValue: props.yAxisFormat ? props.yAxisFormat(safeValue) : String(safeValue),
				share,
				cumulative,
				color: resolvedBarColor.value,
				x,
				y: barTop,
				w: barWidth,
				h: Math.max(barHeight, 1),
				cx,
				dotY
			}
		})
	})

	/*********************************************************
	 * Cumulative line path
	 ********************************************************/
	const cumulativeLinePath = computed<string>(() => {
		if (!bars.value.length) return ''
		return bars.value
			.map((bar, i) => `${ i === 0 ? 'M' : 'L' } ${ bar.cx },${ bar.dotY }`)
			.join(' ')
	})

	/*********************************************************
	 * formatCategory helper
	 ********************************************************/
	const formatCategory = (cat: string): string => {
		if (props.xAxisFormat) return String(props.xAxisFormat(cat))
		return cat
	}

	/*********************************************************
	 * Legend items — two entries: bars + cumulative line
	 ********************************************************/
	const legendItems = computed<Array<IChartLegendItem>>(() => {
		const series = props.series?.[0]
		if (!series) return []

		const items: Array<IChartLegendItem> = [
			{
				series: {
					...series,
					name: series.name || 'Values',
					visible: true
				} as IChartSeries,
				index: 0,
				color: resolvedBarColor.value,
				visible: true
			}
		]

		if (props.showLine) {
			items.push({
				series: {
					name: 'Cumulative %',
					data: [],
					visible: true
				} as IChartSeries,
				index: 1,
				color: resolvedLineColor.value,
				visible: true
			})
		}

		return items
	})

	/*********************************************************
	 * Empty state
	 ********************************************************/
	const showEmpty = computed(() => {
		if (!props.series?.length) return true
		const first = props.series[0]
		if (!first?.data?.length) return true
		return bars.value.length === 0
	})

	/*********************************************************
	 * Hover / tooltip
	 ********************************************************/
	const svgRef = ref<SVGSVGElement | null>(null)
	const mousePos = ref<{ x: number, y: number }>({ x: 0, y: 0 })
	const hoveredIndex = ref<number | null>(null)

	const hoveredBar = computed<IChartParetoBar | null>(() => {
		if (hoveredIndex.value === null) return null
		return bars.value.find((b) => b.index === hoveredIndex.value) ?? null
	})

	const hoveredPoint = computed<IChartPoint | null>(() => {
		const bar = hoveredBar.value
		if (!bar || !props.series?.[0]) return null
		return {
			seriesIndex: 0,
			seriesName: props.series[0].name,
			dataIndex: bar.index,
			x: bar.category,
			y: bar.value,
			color: bar.color
		}
	})

	const hoveredSeries = computed<IChartSeries | null>(() => {
		if (!hoveredBar.value || !props.series?.[0]) return null
		return props.series[0]
	})

	const hoveredCategory = computed<string | number>(() =>
		hoveredBar.value?.category ?? ''
	)

	const tooltipBindings = (bindings: Record<string, unknown>) => {
		const bar = hoveredBar.value
		if (!bar) return bindings
		return {
			...bindings,
			category: bar.category,
			value: bar.value,
			formattedValue: bar.formattedValue,
			share: bar.share,
			cumulative: bar.cumulative,
			color: bar.color
		}
	}

	/*********************************************************
	 * Root classes / styles
	 ********************************************************/
	const rootClasses = computed(() => [
		{
			[`origam-chart-pareto--legend-${ props.legendPosition }`]: true,
			'origam-chart-pareto--no-animation': !props.animated
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
		'origam-chart-pareto__body--with-side-legend': props.showLegend
			&& (props.legendPosition === 'left' || props.legendPosition === 'right')
	}))

	const svgClasses = computed(() => ({
		'origam-chart__svg--animated': props.animated
	}))

	const hasTitleBlock = computed(() => Boolean(props.title || props.subtitle))

	/*********************************************************
	 * ARIA
	 ********************************************************/
	const ariaLabel = computed(() => props.title ?? 'Pareto chart')
	const svgAriaLabel = computed(() => props.title ?? 'Pareto chart')
	const svgTitle = computed(() => props.title ?? 'Pareto chart')
	const svgDesc = computed(() => {
		const n = bars.value.length
		return `Pareto chart with ${ n } ${ n === 1 ? 'category' : 'categories' }, sorted descending by value.`
	})

	const barAriaLabel = (bar: IChartParetoBar): string =>
		`${ bar.category }: ${ bar.formattedValue } (${ Math.round(bar.share * 100) }%, cumulative ${ Math.round(bar.cumulative * 100) }%)`

	/*********************************************************
	 * Interaction
	 ********************************************************/
	const onBarEnter = (bar: IChartParetoBar) => {
		hoveredIndex.value = bar.index
	}

	const onBarLeave = () => {
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
		onBarLeave()
	}

	const onBarActivate = (bar: IChartParetoBar, event: MouseEvent | KeyboardEvent) => {
		hoveredIndex.value = bar.index
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
	.origam-chart-pareto {
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
			stroke: var(--origam-chart-pareto__grid---stroke, var(--origam-color-border-subtle, #e5e7eb));
			stroke-width: 1;
			stroke-dasharray: 4 4;
		}

		&__axis-line {
			stroke: var(--origam-chart-pareto__axis---stroke, var(--origam-color-border-default, #d1d5db));
			stroke-width: 1;
		}

		&__tick-mark {
			stroke: var(--origam-chart-pareto__tick---stroke, var(--origam-color-border-default, #d1d5db));
			stroke-width: 1;
		}

		&__tick-label {
			font-size: var(--origam-chart-pareto__tick-label---font-size, 0.6875rem);
			fill: var(--origam-chart-pareto__tick-label---fill, var(--origam-color-text-secondary, #6b7280));
			user-select: none;
		}

		&__bar {
			cursor: pointer;
			transition: opacity 150ms ease, filter 150ms ease;
			stroke: var(--origam-chart-pareto__bar---stroke-color, var(--origam-color-surface-default, #ffffff));
			stroke-width: var(--origam-chart-pareto__bar---stroke-width, 1);

			&:hover,
			&:focus-visible,
			&--active {
				outline: none;
				filter: brightness(1.1);
			}
		}

		&__bar-label {
			pointer-events: none;
			font-size: var(--origam-chart-pareto__bar-label---font-size, 0.6875rem);
			font-weight: var(--origam-chart-pareto__bar-label---font-weight, 600);
			fill: var(--origam-chart-pareto__bar-label---fill, var(--origam-color-text-primary, currentColor));
			user-select: none;
		}

		&__line {
			stroke-width: var(--origam-chart-pareto__line---stroke-width, 2);
			stroke-linecap: round;
			stroke-linejoin: round;
			pointer-events: none;
		}

		&__line-dot {
			pointer-events: none;
			stroke: var(--origam-chart-pareto__line-dot---stroke, var(--origam-color-surface-default, #ffffff));
			stroke-width: 2;
		}

		.origam-chart__svg--animated &__bar {
			animation: origam-chart-pareto-grow var(--origam-chart---animation-duration, 600ms) ease-out both;
		}

		.origam-chart__svg--animated &__line {
			animation: origam-chart-pareto-line-draw var(--origam-chart---animation-duration, 600ms) ease-out both;
		}

		.origam-chart__svg--animated &__line-dot {
			animation: origam-chart-pareto-dot-appear var(--origam-chart---animation-duration, 600ms) ease-out both;
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

		&--no-animation &__line {
			animation: none;
		}

		&--no-animation &__line-dot {
			animation: none;
		}
	}

	@keyframes origam-chart-pareto-grow {
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

	@keyframes origam-chart-pareto-line-draw {
		from {
			stroke-dashoffset: 2000;
			stroke-dasharray: 2000;
			opacity: 0;
		}
		to {
			stroke-dashoffset: 0;
			stroke-dasharray: 2000;
			opacity: 1;
		}
	}

	@keyframes origam-chart-pareto-dot-appear {
		from {
			opacity: 0;
			r: 0;
		}
		to {
			opacity: 1;
		}
	}

	@media (prefers-reduced-motion: reduce) {
		.origam-chart-pareto .origam-chart__svg--animated .origam-chart-pareto__bar,
		.origam-chart-pareto .origam-chart__svg--animated .origam-chart-pareto__line,
		.origam-chart-pareto .origam-chart__svg--animated .origam-chart-pareto__line-dot {
			animation: none;
		}
	}
</style>
