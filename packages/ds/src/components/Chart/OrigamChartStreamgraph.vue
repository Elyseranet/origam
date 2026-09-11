<template>
	<div
			class="origam-chart-streamgraph"
			:class="rootClasses"
			:style="[rootStyles, dimensionStyles, marginStyles, paddingStyles, backgroundColorStyles, elevationStyles, roundedStyles, headerTypographyStyles]"
			role="figure"
			:aria-label="ariaLabel"
			data-cy="origam-chart-streamgraph"
	>
		<div
				v-if="hasTitleBlock"
				class="origam-chart-streamgraph__header"
				data-cy="origam-chart-streamgraph-header"
		>
			<slot name="title">
				<div
						v-if="title"
						class="origam-chart-streamgraph__title"
				>
					{{ title }}
				</div>
				<div
						v-if="subtitle"
						class="origam-chart-streamgraph__subtitle"
				>
					{{ subtitle }}
				</div>
			</slot>
		</div>

		<div
				class="origam-chart-streamgraph__body"
				:class="bodyClasses"
				data-cy="origam-chart-streamgraph-body"
		>
			<svg
					ref="svgRef"
					class="origam-chart-streamgraph__svg origam-chart__svg"
					:class="svgClasses"
					:viewBox="`0 0 ${ SVG_WIDTH } ${ SVG_HEIGHT }`"
					role="img"
					:aria-label="svgAriaLabel"
					preserveAspectRatio="xMidYMid meet"
					data-cy="origam-chart-streamgraph-svg"
					@mousemove="onSvgMouseMove"
					@mouseleave="onSvgMouseLeave"
			>
				<title>{{ svgTitle }}</title>
				<desc>{{ svgDesc }}</desc>

				<g
						v-if="showGrid && ticks.y.length"
						class="origam-chart-streamgraph__grid"
						data-cy="origam-chart-streamgraph-grid"
				>
					<line
							v-for="tick in ticks.y"
							:key="`grid-y-${ tick.value }`"
							class="origam-chart-streamgraph__grid-line"
							:x1="plot.left"
							:y1="tick.svgY"
							:x2="plot.right"
							:y2="tick.svgY"
					/>
				</g>

				<g
						v-if="showAxis"
						class="origam-chart-streamgraph__axis"
						data-cy="origam-chart-streamgraph-axis"
				>
					<line
							class="origam-chart-streamgraph__axis-x"
							:x1="plot.left"
							:y1="plot.bottom"
							:x2="plot.right"
							:y2="plot.bottom"
					/>
					<text
							v-for="(label, i) in xLabels"
							:key="`x-${ i }`"
							class="origam-chart-streamgraph__axis-label origam-chart-streamgraph__axis-label--x"
							:x="xPositions[i]"
							:y="plot.bottom + AXIS_LABEL_OFFSET"
							text-anchor="middle"
							dominant-baseline="hanging"
					>
						{{ label }}
					</text>
				</g>

				<g
						class="origam-chart__series"
						data-cy="origam-chart-streamgraph-series"
				>
					<path
							v-for="ribbon in visibleRibbons"
							:key="`ribbon-${ ribbon.seriesIndex }`"
							class="origam-chart-streamgraph__ribbon"
							:class="{
								'origam-chart-streamgraph__ribbon--active': hoveredSeriesIndex === ribbon.seriesIndex
							}"
							:d="ribbon.d"
							:style="{ fill: ribbon.color }"
							:data-cy="`origam-chart-streamgraph-ribbon-${ ribbon.seriesIndex }`"
							tabindex="0"
							role="button"
							:aria-label="ribbonAriaLabel(ribbon)"
							@click="onRibbonActivate(ribbon, $event)"
							@keydown.enter.prevent="onRibbonActivate(ribbon, $event)"
							@keydown.space.prevent="onRibbonActivate(ribbon, $event)"
							@mouseenter="onRibbonEnter(ribbon)"
							@mouseleave="onRibbonLeave"
					/>
				</g>

				<line
						v-if="hoveredXIndex !== null"
						class="origam-chart-streamgraph__crosshair"
						:x1="xPositions[hoveredXIndex]"
						:y1="plot.top"
						:x2="xPositions[hoveredXIndex]"
						:y2="plot.bottom"
						data-cy="origam-chart-streamgraph-crosshair"
				/>
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
							v-bind="{ ...bindings, allPoints: hoveredAllPoints }"
					/>
				</template>
			</origam-chart-tooltip>

			<div
					v-if="showEmpty"
					class="origam-chart-streamgraph__empty origam-chart__empty"
					data-cy="origam-chart-streamgraph-empty"
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
		IChartStreamgraphEmits,
		IChartStreamgraphProps,
		IChartStreamgraphRibbon
	} from '../../interfaces'

	import { intentBgExpr, isIntent } from '../../utils/Commons/color.util'

	import type { TIntent } from '../../types'

	/*********************************************************
	 * Global
	 *
	 * @description
	 * Streamgraph chart family. Renders multiple series as
	 * continuous, river-like ribbons flowing over a shared time
	 * axis. The baseline is computed per `offsetMode`:
	 *
	 * - `wiggle`     — Byron-Wattenberg algorithm (canonical
	 *                  streamgraph): minimises total baseline
	 *                  slope change. Most organic look.
	 * - `silhouette` — centered at half the total stack height.
	 * - `expand`     — normalised so every column fills 100%.
	 * - `zero`       — traditional stacked area (baseline = 0).
	 *
	 * `withDefaults` literals only, per CLAUDE.md.
	 ********************************************************/
	defineOptions({
		name: 'OrigamChartStreamgraph'
	})

	const props = withDefaults(defineProps<IChartStreamgraphProps>(), {
		categories: () => [],
		height: 400,
		title: undefined,
		subtitle: undefined,
		offsetMode: 'wiggle',
		smoothing: 'curve',
		colorScheme: () => [],
		showLegend: true,
		legendPosition: 'bottom',
		showTooltip: true,
		showAxis: true,
		showGrid: false,
		animated: true,
		animationDuration: 600,
		aspectRatio: undefined,
		xAxisFormat: undefined,
		yAxisFormat: undefined
	})

	const emit = defineEmits<IChartStreamgraphEmits>()

	const { dimensionStyles } = useDimension(props)
	const { backgroundColorClasses, backgroundColorStyles } = useBackgroundColor(props, 'bgColor')
	const { elevationClasses, elevationStyles } = useElevation(props)
	const { marginClasses, marginStyles } = useMargin(props)
	const { paddingClasses, paddingStyles } = usePadding(props)
	const { roundedClasses, roundedStyles } = useRounded(props)
	const { headerTypographyStyles } = useChartHeaderTypography(props)

	/*********************************************************
	 * SVG coordinate space — fixed logical box; CSS scales it
	 ********************************************************/
	const SVG_WIDTH = 700
	const SVG_HEIGHT = 420
	const PADDING = { top: 24, right: 24, bottom: 40, left: 40 }
	const AXIS_LABEL_OFFSET = 6

	const plot = computed(() => ({
		left: PADDING.left,
		right: SVG_WIDTH - PADDING.right,
		top: PADDING.top,
		bottom: SVG_HEIGHT - PADDING.bottom,
		width: SVG_WIDTH - PADDING.left - PADDING.right,
		height: SVG_HEIGHT - PADDING.top - PADDING.bottom
	}))

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

	const colorFor = (seriesIndex: number): string => {
		const s = props.series?.[seriesIndex]
		if (s?.color) return resolveColor(s.color)
		const scheme = props.colorScheme?.length ? props.colorScheme : DEFAULT_PALETTE
		return resolveColor(scheme[seriesIndex % scheme.length])
	}

	/*********************************************************
	 * Hidden series set (legend toggle)
	 ********************************************************/
	const hiddenNames = ref<Set<string>>(new Set())

	/*********************************************************
	 * X positions — evenly spaced across the plot width
	 ********************************************************/
	const columnCount = computed(() => {
		if (!props.series?.length) return 0
		return Math.max(...props.series.map((s) => s.data.length))
	})

	const xPositions = computed<Array<number>>(() => {
		const n = columnCount.value
		if (n === 0) return []
		if (n === 1) return [plot.value.left + plot.value.width / 2]
		return Array.from({ length: n }, (_, i) =>
			plot.value.left + (i / (n - 1)) * plot.value.width
		)
	})

	const xLabels = computed<Array<string>>(() => {
		const n = columnCount.value
		return Array.from({ length: n }, (_, i) => {
			const raw = props.categories[i] ?? String(i)
			return props.xAxisFormat ? props.xAxisFormat(raw) : raw
		})
	})

	/*********************************************************
	 * Stack offset algorithms
	 ********************************************************/
	const numericValues = computed<Array<Array<number>>>(() => {
		return (props.series ?? []).map((s) =>
			Array.from({ length: columnCount.value }, (_, i) => {
				const raw = s.data[i]
				if (raw == null) return 0
				const v = typeof raw === 'number' ? raw : raw.y
				return Number.isFinite(v) && v >= 0 ? v : 0
			})
		)
	})

	const computeOffsets = computed<Array<number>>(() => {
		const layers = numericValues.value
		const n = columnCount.value
		const L = layers.length
		if (n === 0 || L === 0) return []

		const totals = Array.from({ length: n }, (_, i) =>
			layers.reduce((s, layer) => s + layer[i], 0)
		)

		if (props.offsetMode === 'zero') {
			return Array(n).fill(0)
		}

		if (props.offsetMode === 'expand') {
			return Array(n).fill(0)
		}

		if (props.offsetMode === 'silhouette') {
			return totals.map((t) => -t / 2)
		}

		// wiggle — Byron-Wattenberg algorithm
		// Minimises the weighted sum of slope changes at the baseline
		const offsets = Array(n).fill(0)
		offsets[0] = -totals[0] / 2

		for (let i = 1; i < n; i++) {
			let g = 0
			const nTotal = totals[i] + totals[i - 1]

			for (let j = 0; j < L; j++) {
				let cumBefore = 0
				for (let k = 0; k < j; k++) {
					cumBefore += (layers[k][i] + layers[k][i - 1]) / 2
				}
				g += (layers[j][i] - layers[j][i - 1]) * cumBefore
			}

			if (Math.abs(nTotal) > 1e-9) {
				offsets[i] = offsets[i - 1] - g / nTotal
			} else {
				offsets[i] = offsets[i - 1]
			}
		}

		return offsets
	})

	/*********************************************************
	 * Y scale — map data values to SVG coordinates
	 ********************************************************/
	const dataExtents = computed(() => {
		const layers = numericValues.value
		const n = columnCount.value
		const L = layers.length
		if (n === 0 || L === 0) return { yMin: 0, yMax: 1 }

		const offsets = computeOffsets.value
		const isExpand = props.offsetMode === 'expand'

		let yMin = Infinity
		let yMax = -Infinity

		for (let i = 0; i < n; i++) {
			const total = layers.reduce((s, layer) => s + layer[i], 0)
			let cumulative = 0
			for (let j = 0; j < L; j++) {
				const v = isExpand
					? (total > 0 ? layers[j][i] / total : 0)
					: layers[j][i]

				const bot = offsets[i] + cumulative
				const top = bot + (isExpand ? v * plot.value.height : v)
				cumulative += isExpand ? v * plot.value.height : v

				yMin = Math.min(yMin, bot)
				yMax = Math.max(yMax, top)
			}
		}

		const margin = (yMax - yMin) * 0.04
		return {
			yMin: yMin - margin,
			yMax: yMax + margin
		}
	})

	const toSvgY = (dataY: number): number => {
		const { yMin, yMax } = dataExtents.value
		const range = yMax - yMin || 1
		const alpha = (dataY - yMin) / range
		return plot.value.bottom - alpha * plot.value.height
	}

	/*********************************************************
	 * Y-axis ticks for grid / axis
	 ********************************************************/
	const ticks = computed(() => {
		const { yMin, yMax } = dataExtents.value
		const step = (yMax - yMin) / 4
		const y = Array.from({ length: 5 }, (_, i) => {
			const value = yMin + i * step
			return { value, svgY: toSvgY(value) }
		})
		return { y }
	})

	/*********************************************************
	 * Catmull-Rom smoothing
	 *
	 * Converts an array of (x, y) points to a smooth SVG path
	 * using Catmull-Rom spline interpolation (alpha = 0.5).
	 * Returns just the path segment commands (no M/Z).
	 ********************************************************/
	const catmullRomSegment = (pts: Array<{ x: number; y: number }>): string => {
		if (pts.length < 2) return ''
		if (pts.length === 2) {
			return `L ${ pts[1].x } ${ pts[1].y }`
		}

		const parts: Array<string> = []
		for (let i = 0; i < pts.length - 1; i++) {
			const p0 = pts[Math.max(0, i - 1)]
			const p1 = pts[i]
			const p2 = pts[i + 1]
			const p3 = pts[Math.min(pts.length - 1, i + 2)]

			const cp1x = p1.x + (p2.x - p0.x) / 6
			const cp1y = p1.y + (p2.y - p0.y) / 6
			const cp2x = p2.x - (p3.x - p1.x) / 6
			const cp2y = p2.y - (p3.y - p1.y) / 6

			parts.push(`C ${ cp1x } ${ cp1y } ${ cp2x } ${ cp2y } ${ p2.x } ${ p2.y }`)
		}
		return parts.join(' ')
	}

	const buildPath = (
		topPts: Array<{ x: number; y: number }>,
		botPts: Array<{ x: number; y: number }>
	): string => {
		if (topPts.length === 0) return ''

		const useCurve = props.smoothing === 'curve'

		let d = `M ${ topPts[0].x } ${ topPts[0].y } `

		if (useCurve) {
			d += catmullRomSegment(topPts)
		} else {
			d += topPts.slice(1).map((p) => `L ${ p.x } ${ p.y }`).join(' ')
		}

		const revBot = [...botPts].reverse()
		d += ` L ${ revBot[0].x } ${ revBot[0].y } `

		if (useCurve) {
			d += catmullRomSegment(revBot)
		} else {
			d += revBot.slice(1).map((p) => `L ${ p.x } ${ p.y }`).join(' ')
		}

		d += ' Z'
		return d
	}

	/*********************************************************
	 * Ribbon geometry computation
	 ********************************************************/
	const ribbons = computed<Array<IChartStreamgraphRibbon>>(() => {
		const layers = numericValues.value
		const n = columnCount.value
		const L = layers.length
		if (n === 0 || L === 0) return []

		const offsets = computeOffsets.value
		const isExpand = props.offsetMode === 'expand'

		const result: Array<IChartStreamgraphRibbon> = []

		for (let j = 0; j < L; j++) {
			const s = props.series[j]
			const topPts: Array<{ x: number; y: number }> = []
			const botPts: Array<{ x: number; y: number }> = []

			for (let i = 0; i < n; i++) {
				const total = layers.reduce((sum, layer) => sum + layer[i], 0)

				let cumulative = 0
				for (let k = 0; k < j; k++) {
					if (isExpand) {
						cumulative += total > 0 ? (layers[k][i] / total) * plot.value.height : 0
					} else {
						cumulative += layers[k][i]
					}
				}

				const rawV = layers[j][i]
				const v = isExpand
					? (total > 0 ? (rawV / total) * plot.value.height : 0)
					: rawV

				const botData = offsets[i] + cumulative
				const topData = botData + v

				topPts.push({ x: xPositions.value[i], y: toSvgY(topData) })
				botPts.push({ x: xPositions.value[i], y: toSvgY(botData) })
			}

			result.push({
				seriesIndex: j,
				name: s.name,
				color: colorFor(j),
				d: buildPath(topPts, botPts),
				visible: s.visible !== false && !hiddenNames.value.has(s.name),
				values: layers[j].slice(0, n)
			})
		}

		return result
	})

	const visibleRibbons = computed(() => ribbons.value.filter((r) => r.visible))

	/*********************************************************
	 * Legend items
	 ********************************************************/
	const legendItems = computed<Array<IChartLegendItem>>(() =>
		ribbons.value.map((r) => ({
			series: {
				...(props.series[r.seriesIndex] ?? { name: r.name, data: [] }),
				visible: r.visible
			} as IChartSeries,
			index: r.seriesIndex,
			color: r.color,
			visible: r.visible
		}))
	)

	/*********************************************************
	 * Empty state
	 ********************************************************/
	const showEmpty = computed(() => {
		if (!props.series?.length) return true
		return visibleRibbons.value.length === 0
	})

	/*********************************************************
	 * Root classes / styles
	 ********************************************************/
	const rootClasses = computed(() => [
		{
			[`origam-chart-streamgraph--offset-${ props.offsetMode }`]: true,
			[`origam-chart-streamgraph--legend-${ props.legendPosition }`]: true,
			'origam-chart-streamgraph--no-animation': !props.animated
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
		'origam-chart-streamgraph__body--with-side-legend': props.showLegend
			&& (props.legendPosition === 'left' || props.legendPosition === 'right')
	}))

	const svgClasses = computed(() => ({
		'origam-chart__svg--animated': props.animated
	}))

	const hasTitleBlock = computed(() => Boolean(props.title || props.subtitle))

	/*********************************************************
	 * ARIA
	 ********************************************************/
	const ariaLabel = computed(() => props.title ?? 'streamgraph chart')
	const svgAriaLabel = computed(() => props.title ?? 'streamgraph chart')
	const svgTitle = computed(() => props.title ?? 'streamgraph chart')
	const svgDesc = computed(() => {
		const n = visibleRibbons.value.length
		return `Streamgraph with ${ n } series and ${ columnCount.value } time points.`
	})

	const ribbonAriaLabel = (ribbon: IChartStreamgraphRibbon): string =>
		`${ ribbon.name }: ${ ribbon.values.map((v) => formatValue(v)).join(', ') }`

	/*********************************************************
	 * Hover / tooltip
	 ********************************************************/
	const svgRef = ref<SVGSVGElement | null>(null)
	const mousePos = ref<{ x: number; y: number }>({ x: 0, y: 0 })
	const hoveredSeriesIndex = ref<number | null>(null)
	const hoveredXIndex = ref<number | null>(null)

	const formatValue = (v: number): string => {
		if (props.yAxisFormat) return props.yAxisFormat(v)
		return String(v)
	}

	const hoveredRibbon = computed<IChartStreamgraphRibbon | null>(() => {
		if (hoveredSeriesIndex.value === null) return null
		return visibleRibbons.value.find((r) => r.seriesIndex === hoveredSeriesIndex.value) ?? null
	})

	const hoveredPoint = computed<IChartPoint | null>(() => {
		const r = hoveredRibbon.value
		const xi = hoveredXIndex.value
		if (!r || xi === null) return null
		return {
			seriesIndex: r.seriesIndex,
			seriesName: r.name,
			dataIndex: xi,
			x: props.categories[xi] ?? xi,
			y: r.values[xi] ?? 0,
			color: r.color
		}
	})

	const hoveredSeries = computed<IChartSeries | null>(() => {
		if (!hoveredRibbon.value) return null
		return props.series[hoveredRibbon.value.seriesIndex] ?? null
	})

	const hoveredCategory = computed<string | number>(() =>
		hoveredXIndex.value !== null
			? (props.categories[hoveredXIndex.value] ?? hoveredXIndex.value)
			: ''
	)

	const hoveredAllPoints = computed(() => {
		const xi = hoveredXIndex.value
		if (xi === null) return []
		return visibleRibbons.value.map((r) => ({
			series: props.series[r.seriesIndex],
			value: r.values[xi] ?? 0,
			color: r.color
		}))
	})

	/*********************************************************
	 * SVG-space X position → nearest data-index helper
	 ********************************************************/
	const nearestXIndex = (svgX: number): number => {
		const positions = xPositions.value
		if (!positions.length) return 0
		let best = 0
		let bestDist = Math.abs(svgX - positions[0])
		for (let i = 1; i < positions.length; i++) {
			const d = Math.abs(svgX - positions[i])
			if (d < bestDist) {
				bestDist = d
				best = i
			}
		}
		return best
	}

	/*********************************************************
	 * Event handlers
	 ********************************************************/
	const onRibbonEnter = (ribbon: IChartStreamgraphRibbon) => {
		hoveredSeriesIndex.value = ribbon.seriesIndex
	}

	const onRibbonLeave = () => {
		hoveredSeriesIndex.value = null
		hoveredXIndex.value = null
	}

	const onSvgMouseMove = (event: MouseEvent) => {
		const target = svgRef.value
		if (!target) return
		const rect = target.getBoundingClientRect()
		const clientX = event.clientX - rect.left
		const clientY = event.clientY - rect.top
		mousePos.value = { x: clientX, y: clientY }

		const svgScaleX = SVG_WIDTH / rect.width
		hoveredXIndex.value = nearestXIndex(clientX * svgScaleX)
	}

	const onSvgMouseLeave = () => {
		onRibbonLeave()
	}

	const onRibbonActivate = (ribbon: IChartStreamgraphRibbon, event: MouseEvent | KeyboardEvent) => {
		hoveredSeriesIndex.value = ribbon.seriesIndex
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
	.origam-chart-streamgraph {
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
			stroke: var(--origam-chart-streamgraph__grid---stroke, var(--origam-color-border-subtle, #e5e7eb));
			stroke-width: 1;
			stroke-dasharray: 4 4;
		}

		&__axis-x {
			stroke: var(--origam-chart-streamgraph__axis---stroke, var(--origam-color-border-default, #d1d5db));
			stroke-width: 1;
		}

		&__axis-label {
			font-size: var(--origam-chart-streamgraph__axis-label---font-size, 0.6875rem);
			fill: var(--origam-chart-streamgraph__axis-label---fill, var(--origam-color-text-secondary, #6b7280));
			user-select: none;
		}

		&__ribbon {
			cursor: pointer;
			opacity: var(--origam-chart-streamgraph__ribbon---opacity, 0.82);
			transition: opacity 150ms ease, filter 150ms ease;

			&:hover,
			&:focus-visible,
			&--active {
				outline: none;
				opacity: 1;
				filter: brightness(1.06);
			}
		}

		&__crosshair {
			stroke: var(--origam-chart-streamgraph__crosshair---stroke, var(--origam-color-text-secondary, #6b7280));
			stroke-width: 1;
			stroke-dasharray: 3 3;
			pointer-events: none;
		}

		.origam-chart__svg--animated &__ribbon {
			animation: origam-chart-streamgraph-fade var(--origam-chart---animation-duration, 600ms) ease-out both;
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

		&--no-animation &__ribbon {
			animation: none;
		}
	}

	@keyframes origam-chart-streamgraph-fade {
		from {
			opacity: 0;
		}
		to {
			opacity: 0.82;
		}
	}

	@media (prefers-reduced-motion: reduce) {
		.origam-chart-streamgraph .origam-chart__svg--animated .origam-chart-streamgraph__ribbon {
			animation: none;
		}
	}
</style>
