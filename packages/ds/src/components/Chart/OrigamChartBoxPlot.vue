<template>
	<div
			class="origam-chart-box-plot"
			:class="rootClasses"
			:style="[rootStyles, dimensionStyles, marginStyles, paddingStyles, backgroundColorStyles, elevationStyles, roundedStyles, headerTypographyStyles]"
			role="figure"
			:aria-label="ariaLabel"
			data-cy="origam-chart-box-plot"
	>
		<div
				v-if="hasTitleBlock"
				class="origam-chart-box-plot__header"
				data-cy="origam-chart-box-plot-header"
		>
			<slot name="title">
				<div
						v-if="title"
						class="origam-chart-box-plot__title"
				>
					{{ title }}
				</div>
				<div
						v-if="subtitle"
						class="origam-chart-box-plot__subtitle"
				>
					{{ subtitle }}
				</div>
			</slot>
		</div>

		<div
				class="origam-chart-box-plot__body"
				:class="bodyClasses"
				data-cy="origam-chart-box-plot-body"
		>
			<svg
					ref="svgRef"
					class="origam-chart-box-plot__svg origam-chart__svg"
					:class="svgClasses"
					:viewBox="`0 0 ${ SVG_WIDTH } ${ SVG_HEIGHT }`"
					role="img"
					:aria-label="svgAriaLabel"
					preserveAspectRatio="xMidYMid meet"
					data-cy="origam-chart-box-plot-svg"
					@mousemove="onSvgMouseMove"
					@mouseleave="onSvgMouseLeave"
			>
				<title>{{ svgTitle }}</title>
				<desc>{{ svgDesc }}</desc>

				<g
						v-if="showGrid"
						class="origam-chart__grid"
						data-cy="origam-chart-box-plot-grid"
				>
					<line
							v-for="tick in yTicks"
							:key="`grid-${ tick.value }`"
							class="origam-chart__grid-line"
							:x1="PLOT.left"
							:y1="tick.svgY"
							:x2="PLOT.right"
							:y2="tick.svgY"
					/>
				</g>

				<g
						v-if="showAxis"
						class="origam-chart__axis"
						data-cy="origam-chart-box-plot-axis"
				>
					<line
							class="origam-chart__axis-line origam-chart__axis-line--y"
							:x1="PLOT.left"
							:y1="PLOT.top"
							:x2="PLOT.left"
							:y2="PLOT.bottom"
					/>
					<line
							class="origam-chart__axis-line origam-chart__axis-line--x"
							:x1="PLOT.left"
							:y1="PLOT.bottom"
							:x2="PLOT.right"
							:y2="PLOT.bottom"
					/>

					<text
							v-for="tick in yTicks"
							:key="`ytick-${ tick.value }`"
							class="origam-chart__axis-label origam-chart__axis-label--y"
							:x="PLOT.left - 6"
							:y="tick.svgY"
							text-anchor="end"
							dominant-baseline="middle"
					>
						{{ tick.label }}
					</text>

					<text
							v-for="box in visibleBoxes"
							:key="`xtick-${ box.index }`"
							class="origam-chart__axis-label origam-chart__axis-label--x"
							:x="box.cx"
							:y="PLOT.bottom + 16"
							text-anchor="middle"
							dominant-baseline="auto"
					>
						{{ xLabelFor(box.category) }}
					</text>
				</g>

				<g
						class="origam-chart__series"
						data-cy="origam-chart-box-plot-series"
				>
					<g
							v-for="box in visibleBoxes"
							:key="`box-${ box.index }`"
							class="origam-chart__box"
							:class="{ 'origam-chart__box--active': hoveredIndex === box.index }"
							:data-cy="`origam-chart-box-group-${ box.index }`"
							tabindex="0"
							role="button"
							:aria-label="boxAriaLabel(box)"
							@click="onBoxActivate(box, $event)"
							@keydown.enter.prevent="onBoxActivate(box, $event)"
							@keydown.space.prevent="onBoxActivate(box, $event)"
							@mouseenter="onBoxEnter(box)"
							@mouseleave="onBoxLeave"
					>
						<line
								class="origam-chart__box-whisker origam-chart__box-whisker--upper"
								:x1="box.cx"
								:y1="box.svgQ3"
								:x2="box.cx"
								:y2="box.svgMax"
								:style="{ stroke: box.color }"
								:data-cy="`origam-chart-box-whisker-upper-${ box.index }`"
						/>
						<line
								class="origam-chart__box-cap origam-chart__box-cap--upper"
								:x1="box.cx - box.halfCapW"
								:y1="box.svgMax"
								:x2="box.cx + box.halfCapW"
								:y2="box.svgMax"
								:style="{ stroke: box.color }"
								:data-cy="`origam-chart-box-cap-upper-${ box.index }`"
						/>
						<line
								class="origam-chart__box-whisker origam-chart__box-whisker--lower"
								:x1="box.cx"
								:y1="box.svgQ1"
								:x2="box.cx"
								:y2="box.svgMin"
								:style="{ stroke: box.color }"
								:data-cy="`origam-chart-box-whisker-lower-${ box.index }`"
						/>
						<line
								class="origam-chart__box-cap origam-chart__box-cap--lower"
								:x1="box.cx - box.halfCapW"
								:y1="box.svgMin"
								:x2="box.cx + box.halfCapW"
								:y2="box.svgMin"
								:style="{ stroke: box.color }"
								:data-cy="`origam-chart-box-cap-lower-${ box.index }`"
						/>
						<rect
								class="origam-chart__box-rect"
								:x="box.cx - box.halfBoxW"
								:y="box.svgQ3"
								:width="box.halfBoxW * 2"
								:height="box.boxHeight"
								:style="{ fill: box.color, stroke: box.color }"
								:data-cy="`origam-chart-box-rect-${ box.index }`"
						/>
						<line
								class="origam-chart__box-median"
								:x1="box.cx - box.halfBoxW"
								:y1="box.svgMedian"
								:x2="box.cx + box.halfBoxW"
								:y2="box.svgMedian"
								:data-cy="`origam-chart-box-median-${ box.index }`"
						/>

						<template v-if="showOutliers">
							<circle
									v-for="(outlier, oi) in box.outliers"
									:key="`outlier-${ box.index }-${ oi }`"
									class="origam-chart__box-outlier"
									:cx="box.cx"
									:cy="outlier.svgY"
									r="3"
									:style="{ fill: box.color, stroke: box.color }"
									:data-cy="`origam-chart-box-outlier-${ box.index }-${ oi }`"
							/>
						</template>
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
						v-if="$slots.tooltip && hoveredBox"
						#default="bindings"
				>
					<slot
							name="tooltip"
							v-bind="{ ...bindings, box: hoveredBox }"
					/>
				</template>
			</origam-chart-tooltip>

			<div
					v-if="showEmpty"
					class="origam-chart-box-plot__empty origam-chart__empty"
					data-cy="origam-chart-box-plot-empty"
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
		IChartBoxPlotBox,
		IChartBoxPlotDatum,
		IChartBoxPlotEmits,
		IChartBoxPlotProps
	} from '../../interfaces/Chart/chart-box-plot.interface'

	import type {
		IChartLegendItem,
		IChartPoint,
		IChartSeries
	} from '../../interfaces'

	import { intentBgExpr, isIntent } from '../../utils/Commons/color.util'
	import { computeQuartiles, isRawDatum } from '../../utils/Chart/box-plot.util'

	import type { TIntent } from '../../types'

	/*********************************************************
	 * Global
	 *
	 * @description
	 * Box-and-whisker chart. Renders one box per category showing
	 * the five-number statistical summary (min / Q1 / median / Q3 / max)
	 * and optional outlier dots.
	 *
	 * Accepts two data shapes:
	 * - Pre-aggregated `IChartBoxPlotDatum` (all five values explicit).
	 * - Raw samples `IChartBoxPlotRawDatum` (quartiles computed via
	 *   Tukey's linear-interpolation method; outliers at 1.5·IQR fences).
	 *
	 * `withDefaults` inline literals only, per CLAUDE.md.
	 ********************************************************/
	defineOptions({
		name: 'OrigamChartBoxPlot'
	})

	const props = withDefaults(defineProps<IChartBoxPlotProps>(), {
		categories: () => [],
		height: 400,
		title: undefined,
		subtitle: undefined,
		showLegend: false,
		legendPosition: 'bottom',
		showTooltip: true,
		animated: true,
		animationDuration: 600,
		colorScheme: () => [],
		aspectRatio: undefined,
		boxWidth: 0.6,
		whiskerCapWidth: 0.4,
		showOutliers: true,
		showAxis: true,
		showGrid: true,
		yMin: undefined,
		yMax: undefined,
		xAxisFormat: undefined,
		yAxisFormat: undefined
	})

	const emit = defineEmits<IChartBoxPlotEmits>()

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
	const PADDING = { top: 20, right: 20, bottom: 40, left: 52 }

	const PLOT = {
		get left () { return PADDING.left },
		get right () { return SVG_WIDTH - PADDING.right },
		get top () { return PADDING.top },
		get bottom () { return SVG_HEIGHT - PADDING.bottom }
	}

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

	const colorFor = (dataIndex: number, datumColor?: TIntent | string): string => {
		if (datumColor) return resolveColor(datumColor)
		const scheme = props.colorScheme?.length ? props.colorScheme : DEFAULT_PALETTE
		return resolveColor(scheme[dataIndex % scheme.length])
	}

	/*********************************************************
	 * Data normalisation — coerce raw samples → aggregated datum
	 ********************************************************/
	const normalizedData = computed<Array<IChartBoxPlotDatum>>(() => {
		const series = props.series?.[0]
		if (!series?.data?.length) return []

		return (series.data as Array<unknown>).map((entry) => {
			if (isRawDatum(entry)) {
				const stats = computeQuartiles(entry.samples)
				return {
					category: entry.category,
					min: stats.min,
					q1: stats.q1,
					median: stats.median,
					q3: stats.q3,
					max: stats.max,
					outliers: stats.outliers,
					color: entry.color
				} satisfies IChartBoxPlotDatum
			}
			return entry as IChartBoxPlotDatum
		})
	})

	/*********************************************************
	 * Category ordering
	 ********************************************************/
	const orderedCategories = computed<Array<string>>(() => {
		if (props.categories?.length) return props.categories
		const seen = new Set<string>()
		for (const d of normalizedData.value) {
			seen.add(d.category)
		}
		return Array.from(seen)
	})

	/*********************************************************
	 * Y scale — linear mapping from data-space to SVG-space
	 ********************************************************/
	const yRange = computed<{ min: number, max: number }>(() => {
		const data = normalizedData.value
		if (!data.length) return { min: 0, max: 100 }

		let lo = Infinity
		let hi = -Infinity

		for (const d of data) {
			lo = Math.min(lo, d.min)
			hi = Math.max(hi, d.max)
			for (const o of d.outliers ?? []) {
				lo = Math.min(lo, o)
				hi = Math.max(hi, o)
			}
		}

		if (!Number.isFinite(lo)) lo = 0
		if (!Number.isFinite(hi)) hi = 100

		const pad = Math.max((hi - lo) * 0.1, 1)
		return {
			min: props.yMin ?? lo - pad,
			max: props.yMax ?? hi + pad
		}
	})

	const toSvgY = (value: number): number => {
		const { min, max } = yRange.value
		const range = max - min || 1
		return PLOT.bottom - ((value - min) / range) * (PLOT.bottom - PLOT.top)
	}

	/*********************************************************
	 * Y-axis ticks — ~5 evenly-spaced ticks
	 ********************************************************/
	const yTicks = computed(() => {
		const { min, max } = yRange.value
		const range = max - min
		const rawStep = range / 4
		const magnitude = Math.pow(10, Math.floor(Math.log10(rawStep)))
		const step = Math.ceil(rawStep / magnitude) * magnitude || 1
		const first = Math.ceil(min / step) * step

		const ticks: Array<{ value: number, svgY: number, label: string }> = []
		for (let v = first; v <= max + step * 0.01; v += step) {
			ticks.push({
				value: v,
				svgY: toSvgY(v),
				label: props.yAxisFormat ? props.yAxisFormat(v) : String(Math.round(v * 100) / 100)
			})
		}
		return ticks
	})

	/*********************************************************
	 * Legend — hidden-category set
	 ********************************************************/
	const hiddenCategories = ref<Set<string>>(new Set())

	/*********************************************************
	 * Geometry — one box per visible category
	 ********************************************************/
	const allBoxes = computed<Array<IChartBoxPlotBox>>(() => {
		const cats = orderedCategories.value
		if (!cats.length) return []

		const data = normalizedData.value
		const plotW = PLOT.right - PLOT.left
		const slotW = plotW / cats.length

		return cats.map((cat, i) => {
			const datum = data.find((d) => d.category === cat)
			if (!datum) {
				return null
			}

			const cx = PLOT.left + slotW * i + slotW / 2
			const halfBoxW = (slotW * props.boxWidth) / 2
			const halfCapW = (slotW * props.whiskerCapWidth) / 2

			const outliers = (datum.outliers ?? []).map((v) => ({
				svgY: toSvgY(v),
				value: v
			}))

			return {
				index: i,
				category: cat,
				stats: {
					min: toSvgY(datum.min),
					q1: toSvgY(datum.q1),
					median: toSvgY(datum.median),
					q3: toSvgY(datum.q3),
					max: toSvgY(datum.max)
				},
				rawStats: {
					min: datum.min,
					q1: datum.q1,
					median: datum.median,
					q3: datum.q3,
					max: datum.max
				},
				iqr: datum.q3 - datum.q1,
				svgQ3: toSvgY(datum.q3),
				svgQ1: toSvgY(datum.q1),
				svgMedian: toSvgY(datum.median),
				svgMax: toSvgY(datum.max),
				svgMin: toSvgY(datum.min),
				boxHeight: Math.abs(toSvgY(datum.q1) - toSvgY(datum.q3)),
				cx,
				halfBoxW,
				halfCapW,
				color: colorFor(i, datum.color),
				outliers,
				visible: !hiddenCategories.value.has(cat)
			} satisfies IChartBoxPlotBox
		}).filter((b): b is IChartBoxPlotBox => b !== null)
	})

	const visibleBoxes = computed(() => allBoxes.value.filter((b) => b.visible))

	/*********************************************************
	 * Legend items — one per category
	 ********************************************************/
	const legendItems = computed<Array<IChartLegendItem>>(() => {
		const series = props.series?.[0]
		if (!series) return []
		return allBoxes.value.map((box) => ({
			series: {
				...series,
				name: box.category,
				data: [box.rawStats.median],
				visible: box.visible
			} as IChartSeries,
			index: box.index,
			color: box.color,
			visible: box.visible
		}))
	})

	/*********************************************************
	 * X-axis label formatter
	 ********************************************************/
	const xLabelFor = (category: string): string => {
		if (props.xAxisFormat) return props.xAxisFormat(category)
		return category
	}

	/*********************************************************
	 * Hover / tooltip
	 ********************************************************/
	const svgRef = ref<SVGSVGElement | null>(null)
	const mousePos = ref<{ x: number, y: number }>({ x: 0, y: 0 })
	const hoveredIndex = ref<number | null>(null)

	const hoveredBox = computed<IChartBoxPlotBox | null>(() => {
		if (hoveredIndex.value === null) return null
		return visibleBoxes.value.find((b) => b.index === hoveredIndex.value) ?? null
	})

	const hoveredPoint = computed<IChartPoint | null>(() => {
		const b = hoveredBox.value
		if (!b || !props.series?.[0]) return null
		return {
			seriesIndex: 0,
			seriesName: props.series[0].name,
			dataIndex: b.index,
			x: b.category,
			y: b.rawStats.median,
			color: b.color
		}
	})

	const hoveredSeries = computed<IChartSeries | null>(() => {
		if (!hoveredBox.value || !props.series?.[0]) return null
		return props.series[0]
	})

	const hoveredCategory = computed<string | number>(() =>
		hoveredBox.value?.category ?? ''
	)

	const showEmpty = computed(() => {
		if (!props.series?.length) return true
		const first = props.series[0]
		if (!first?.data?.length) return true
		return visibleBoxes.value.length === 0
	})

	/*********************************************************
	 * Root classes / styles
	 ********************************************************/
	const rootClasses = computed(() => [
		{
			[`origam-chart-box-plot--legend-${ props.legendPosition }`]: true,
			'origam-chart-box-plot--no-animation': !props.animated,
			'origam-chart-box-plot--no-axis': !props.showAxis
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
		'origam-chart-box-plot__body--with-side-legend': props.showLegend
			&& (props.legendPosition === 'left' || props.legendPosition === 'right')
	}))

	const svgClasses = computed(() => ({
		'origam-chart__svg--animated': props.animated
	}))

	const hasTitleBlock = computed(() => Boolean(props.title || props.subtitle))

	/*********************************************************
	 * ARIA
	 ********************************************************/
	const ariaLabel = computed(() => props.title ?? 'box plot chart')
	const svgAriaLabel = computed(() => props.title ?? 'box plot chart')
	const svgTitle = computed(() => props.title ?? 'box plot chart')
	const svgDesc = computed(() => {
		const n = visibleBoxes.value.length
		return `Box plot with ${ n } ${ n === 1 ? 'category' : 'categories' }.`
	})

	const boxAriaLabel = (box: IChartBoxPlotBox): string => {
		const { min, q1, median, q3, max } = box.rawStats
		return `${ box.category }: min=${ min } Q1=${ q1 } median=${ median } Q3=${ q3 } max=${ max }`
	}

	/*********************************************************
	 * Interaction
	 ********************************************************/
	const onBoxEnter = (box: IChartBoxPlotBox) => {
		hoveredIndex.value = box.index
	}

	const onBoxLeave = () => {
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
		onBoxLeave()
	}

	const onBoxActivate = (box: IChartBoxPlotBox, event: MouseEvent | KeyboardEvent) => {
		hoveredIndex.value = box.index
		if (hoveredPoint.value) {
			emit('point-click', hoveredPoint.value, event)
		}
	}

	const onLegendClick = (series: IChartSeries, index: number): void => {
		emit('legend-click', series, index)
	}

	const onSeriesToggle = (series: IChartSeries, nextVisible: boolean): void => {
		if (nextVisible) hiddenCategories.value.delete(series.name)
		else hiddenCategories.value.add(series.name)
		emit('series-toggle', series, nextVisible)
	}
</script>

<style
		lang="scss"
		scoped
>
	.origam-chart-box-plot {
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

		.origam-chart__grid-line {
			stroke: var(--origam-chart__grid---stroke-color, var(--origam-color-border-subtle, #e5e7eb));
			stroke-width: 1;
			stroke-dasharray: 4 4;
		}

		.origam-chart__axis-line {
			stroke: var(--origam-chart__axis---stroke-color, var(--origam-color-border-default, #d1d5db));
			stroke-width: 1;
		}

		.origam-chart__axis-label {
			font-size: var(--origam-chart__axis-label---font-size, 0.6875rem);
			fill: var(--origam-chart__axis-label---fill, var(--origam-color-text-secondary, #6b7280));
		}

		.origam-chart__box-rect {
			fill-opacity: var(--origam-chart__box---fill-opacity, 0.25);
			stroke-width: var(--origam-chart__box---stroke-width, 1.5);
			cursor: pointer;
			transition: fill-opacity 150ms ease, filter 150ms ease;
		}

		.origam-chart__box-whisker {
			stroke-width: var(--origam-chart__box-whisker---stroke-width, 1.5);
		}

		.origam-chart__box-cap {
			stroke-width: var(--origam-chart__box-cap---stroke-width, 2);
		}

		.origam-chart__box-median {
			stroke: var(--origam-chart__box-median---stroke-color, var(--origam-color-surface-default, #ffffff));
			stroke-width: var(--origam-chart__box-median---stroke-width, 2);
		}

		.origam-chart__box-outlier {
			fill-opacity: var(--origam-chart__box-outlier---fill-opacity, 0.7);
			stroke-width: 1;
			cursor: pointer;
		}

		.origam-chart__box {
			cursor: pointer;
			outline: none;

			&:hover,
			&:focus-visible,
			&--active {
				.origam-chart__box-rect {
					fill-opacity: 0.45;
					filter: brightness(1.08);
				}
			}

			&:focus-visible {
				.origam-chart__box-rect {
					outline: 2px solid var(--origam-color-action-primary-border, currentColor);
					outline-offset: 2px;
				}
			}
		}

		.origam-chart__svg--animated .origam-chart__box-rect {
			animation: origam-chart-box-plot-fade var(--origam-chart---animation-duration, 600ms) ease-out both;
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

		&--no-animation .origam-chart__box-rect {
			animation: none;
		}
	}

	@keyframes origam-chart-box-plot-fade {
		from {
			opacity: 0;
		}
		to {
			opacity: 1;
		}
	}

	@media (prefers-reduced-motion: reduce) {
		.origam-chart-box-plot .origam-chart__svg--animated .origam-chart__box-rect {
			animation: none;
		}
	}
</style>
