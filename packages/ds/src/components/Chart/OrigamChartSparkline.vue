<template>
	<figure
			class="origam-chart-sparkline"
			:class="rootClasses"
			:style="[rootStyles, marginStyles, paddingStyles, backgroundColorStyles, elevationStyles, roundedStyles]"
			:aria-label="ariaLabel"
			data-cy="origam-chart-sparkline"
	>
		<svg
				ref="svgRef"
				class="origam-chart-sparkline__svg"
				:viewBox="`0 0 ${ SVG_WIDTH } ${ SVG_HEIGHT }`"
				role="img"
				:aria-label="svgAriaLabel"
				preserveAspectRatio="none"
				data-cy="origam-chart-sparkline-svg"
				@mousemove="onSvgMouseMove"
				@mouseleave="onSvgMouseLeave"
		>
			<title>{{ svgTitle }}</title>
			<desc>{{ svgDesc }}</desc>

			<g
					v-if="type === 'column'"
					class="origam-chart-sparkline__bars"
					data-cy="origam-chart-sparkline-bars"
			>
				<rect
						v-for="bar in columnBars"
						:key="`bar-${ bar.index }`"
						class="origam-chart-sparkline__bar"
						:x="bar.x"
						:y="bar.y"
						:width="bar.width"
						:height="bar.height"
						:style="{ fill: resolvedColor }"
						:data-cy="`origam-chart-sparkline-bar-${ bar.index }`"
				/>
			</g>

			<g
					v-else-if="type === 'bar'"
					class="origam-chart-sparkline__bars origam-chart-sparkline__bars--horizontal"
					data-cy="origam-chart-sparkline-hbars"
			>
				<rect
						v-for="bar in horizontalBars"
						:key="`hbar-${ bar.index }`"
						class="origam-chart-sparkline__bar origam-chart-sparkline__bar--horizontal"
						:x="bar.x"
						:y="bar.y"
						:width="bar.width"
						:height="bar.height"
						:style="{ fill: resolvedColor }"
						:data-cy="`origam-chart-sparkline-hbar-${ bar.index }`"
				/>
			</g>

			<g
					v-else
					class="origam-chart-sparkline__lines"
					data-cy="origam-chart-sparkline-lines"
			>
				<path
						v-if="type === 'area' && areaPath"
						class="origam-chart-sparkline__area"
						:d="areaPath"
						:style="{ fill: resolvedColor, fillOpacity: '0.2', stroke: 'none' }"
						data-cy="origam-chart-sparkline-area"
				/>

				<path
						v-if="linePath"
						class="origam-chart-sparkline__line"
						:d="linePath"
						:style="{ fill: 'none', stroke: resolvedColor, strokeWidth: lineWidth, strokeLinecap: 'round', strokeLinejoin: 'round' }"
						data-cy="origam-chart-sparkline-line"
				/>

				<circle
						v-for="pt in markerPoints"
						:key="`marker-${ pt.index }`"
						class="origam-chart-sparkline__marker"
						:cx="pt.cx"
						:cy="pt.cy"
						:r="markerSize"
						:style="{ fill: resolvedColor }"
						:data-cy="`origam-chart-sparkline-marker-${ pt.index }`"
				/>
			</g>

			<circle
					v-for="m in specialMarkers"
					:key="`special-${ m.role }-${ m.dataIndex }`"
					class="origam-chart-sparkline__special-marker"
					:class="`origam-chart-sparkline__special-marker--${ m.role }`"
					:cx="m.cx"
					:cy="m.cy"
					:r="m.r"
					:style="{ fill: m.fill }"
					:data-cy="`origam-chart-sparkline-special-${ m.role }`"
			/>
		</svg>

		<div
				v-if="showTooltip && hoveredIndex !== null && tooltipPoint"
				class="origam-chart-sparkline__tooltip origam-chart__tooltip"
				role="tooltip"
				:style="tooltipStyle"
				data-cy="origam-chart-sparkline-tooltip"
		>
			<slot
					name="tooltip"
					:point="tooltipPoint"
					:series="activeSeries"
					:index="hoveredIndex"
			>
				<span class="origam-chart-sparkline__tooltip-value">{{ tooltipPoint.y }}</span>
			</slot>
		</div>

		<div
				v-if="showEmpty"
				class="origam-chart-sparkline__empty origam-chart__empty"
				data-cy="origam-chart-sparkline-empty"
		>
			<slot name="empty">
				<span>—</span>
			</slot>
		</div>
	</figure>
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

	import {
		useBackgroundColor,
		useElevation,
		useMargin,
		usePadding,
		useRounded
	} from '../../composables'

	import type {
		IChartPoint,
		IChartSparklineEmits,
		IChartSparklineKind,
		IChartSparklineProps
	} from '../../interfaces'

	import { intentBgExpr, isIntent } from '../../utils/Commons/color.util'

	import type { TIntent } from '../../types'

	/*********************************************************
	 * Global
	 *
	 * @description
	 * Sparkline — tiny inline chart for table cells, KPI cards,
	 * and dashboards. No axes, no legend, no grid.
	 *
	 * Supports `line`, `area`, `column`, and `bar` rendering.
	 * A single `color` prop drives the entire paint; no palette
	 * cycling. Marker circles can be shown for all points
	 * (`showMarkers`) or exclusively for the min / max / last
	 * special points.
	 *
	 * `withDefaults` literals only, per CLAUDE.md.
	 ********************************************************/
	defineOptions({
		name: 'OrigamChartSparkline'
	})

	const props = withDefaults(defineProps<IChartSparklineProps>(), {
		type: 'line',
		color: 'primary',
		lineWidth: 1.5,
		showMarkers: false,
		showMin: false,
		showMax: false,
		showLast: true,
		markerSize: 2.5,
		width: 120,
		height: 30,
		showTooltip: false,
		animated: false,
		animationDuration: 600,
		title: undefined,
		subtitle: undefined,
		aspectRatio: undefined
	})

	defineEmits<IChartSparklineEmits>()

	const { backgroundColorClasses, backgroundColorStyles } = useBackgroundColor(props, 'bgColor')
	const { elevationClasses, elevationStyles } = useElevation(props)
	const { marginStyles } = useMargin(props)
	const { paddingStyles } = usePadding(props)
	const { roundedClasses, roundedStyles } = useRounded(props)

	/*********************************************************
	 * Fixed SVG coordinate space — viewBox is always 120x30.
	 * CSS scales the element; `preserveAspectRatio="none"` lets
	 * it stretch to whatever width/height the parent applies.
	 ********************************************************/
	const SVG_WIDTH = 120
	const SVG_HEIGHT = 30
	const PADDING_X = 2
	const PADDING_Y = 2

	/*********************************************************
	 * Data extraction — first series, numeric values only.
	 ********************************************************/
	const activeSeries = computed(() => props.series?.[0] ?? null)

	const values = computed<Array<number>>(() => {
		const s = activeSeries.value
		if (!s?.data?.length) return []
		return (s.data as Array<number | { y: number }>).map((d) =>
			typeof d === 'number' ? d : d.y
		).filter((v) => Number.isFinite(v))
	})

	const showEmpty = computed(() => values.value.length === 0)

	/*********************************************************
	 * Colour resolution — intent token or raw CSS.
	 ********************************************************/
	const resolveColor = (raw: TIntent | string): string => {
		if (isIntent(raw)) return intentBgExpr(raw as TIntent, 'default')
		if (/^(#|rgb|hsl|var|currentColor|transparent)/i.test(raw)) return raw
		return 'currentColor'
	}

	const resolvedColor = computed(() => resolveColor(props.color))

	const MIN_COLOR = 'var(--origam-color__feedback--danger---bg, #ef4444)'
	const MAX_COLOR = 'var(--origam-color__feedback--success---bg, #22c55e)'

	/*********************************************************
	 * Scale helpers — map data values to SVG coordinates.
	 ********************************************************/
	const plotX0 = PADDING_X
	const plotX1 = SVG_WIDTH - PADDING_X
	const plotY0 = PADDING_Y
	const plotY1 = SVG_HEIGHT - PADDING_Y

	const dataMin = computed(() => {
		if (!values.value.length) return 0
		return Math.min(...values.value)
	})

	const dataMax = computed(() => {
		if (!values.value.length) return 1
		return Math.max(...values.value)
	})

	const scaleX = computed(() => {
		const n = values.value.length
		if (n < 2) return (_i: number) => (plotX0 + plotX1) / 2
		return (i: number) => plotX0 + (i / (n - 1)) * (plotX1 - plotX0)
	})

	const scaleY = computed(() => {
		const min = dataMin.value
		const max = dataMax.value
		const range = max - min || 1
		return (v: number) => plotY1 - ((v - min) / range) * (plotY1 - plotY0)
	})

	/*********************************************************
	 * Point coordinates — array of {cx, cy, index}.
	 ********************************************************/
	const points = computed(() =>
		values.value.map((v, i) => ({
			cx: scaleX.value(i),
			cy: scaleY.value(v),
			index: i,
			value: v
		}))
	)

	/*********************************************************
	 * Line / area paths — built from the point list.
	 ********************************************************/
	const linePath = computed<string | null>(() => {
		const pts = points.value
		if (pts.length < 2) return null
		const d = pts.map((p, i) => `${ i === 0 ? 'M' : 'L' } ${ p.cx } ${ p.cy }`).join(' ')
		return d
	})

	const areaPath = computed<string | null>(() => {
		const pts = points.value
		if (pts.length < 2) return null
		const line = pts.map((p, i) => `${ i === 0 ? 'M' : 'L' } ${ p.cx } ${ p.cy }`).join(' ')
		const close = `L ${ pts[pts.length - 1].cx } ${ plotY1 } L ${ pts[0].cx } ${ plotY1 } Z`
		return `${ line } ${ close }`
	})

	/*********************************************************
	 * Regular markers — shown when showMarkers is true.
	 ********************************************************/
	const markerPoints = computed(() => {
		if (!props.showMarkers) return []
		return points.value
	})

	/*********************************************************
	 * Column bars — vertical rectangles for `type === 'column'`.
	 ********************************************************/
	const columnBars = computed(() => {
		const pts = points.value
		if (!pts.length) return []
		const n = pts.length
		const totalW = plotX1 - plotX0
		const barW = Math.max(1, (totalW / n) * 0.7)
		const gap = totalW / n
		const min = dataMin.value
		const max = dataMax.value
		const range = max - min || 1

		return pts.map((p, i) => {
			const barH = Math.max(1, ((p.value - min) / range) * (plotY1 - plotY0))
			const x = plotX0 + i * gap + (gap - barW) / 2
			const y = plotY1 - barH
			return { index: i, x, y, width: barW, height: barH }
		})
	})

	/*********************************************************
	 * Horizontal bars — for `type === 'bar'`.
	 ********************************************************/
	const horizontalBars = computed(() => {
		const n = values.value.length
		if (!n) return []
		const totalH = plotY1 - plotY0
		const barH = Math.max(1, (totalH / n) * 0.7)
		const gap = totalH / n
		const min = dataMin.value
		const max = dataMax.value
		const range = max - min || 1

		return values.value.map((v, i) => {
			const barW = Math.max(1, ((v - min) / range) * (plotX1 - plotX0))
			const y = plotY0 + i * gap + (gap - barH) / 2
			return { index: i, x: plotX0, y, width: barW, height: barH }
		})
	})

	/*********************************************************
	 * Special markers — min, max, last.
	 ********************************************************/
	const minIndex = computed(() => {
		const vs = values.value
		if (!vs.length) return -1
		let idx = 0
		for (let i = 1; i < vs.length; i++) {
			if (vs[i] < vs[idx]) idx = i
		}
		return idx
	})

	const maxIndex = computed(() => {
		const vs = values.value
		if (!vs.length) return -1
		let idx = 0
		for (let i = 1; i < vs.length; i++) {
			if (vs[i] > vs[idx]) idx = i
		}
		return idx
	})

	const specialMarkers = computed<Array<IChartSparklineKind>>(() => {
		const pts = points.value
		if (!pts.length) return []
		const result: Array<IChartSparklineKind> = []
		const r = props.markerSize

		if (props.showMin && minIndex.value >= 0) {
			const p = pts[minIndex.value]
			result.push({ cx: p.cx, cy: p.cy, r, fill: MIN_COLOR, role: 'min', dataIndex: minIndex.value })
		}

		if (props.showMax && maxIndex.value >= 0) {
			const p = pts[maxIndex.value]
			result.push({ cx: p.cx, cy: p.cy, r, fill: MAX_COLOR, role: 'max', dataIndex: maxIndex.value })
		}

		if (props.showLast && pts.length > 0) {
			const last = pts[pts.length - 1]
			const lastIdx = pts.length - 1
			const alreadyMarked = result.some((m) => m.dataIndex === lastIdx)
			if (!alreadyMarked) {
				result.push({ cx: last.cx, cy: last.cy, r, fill: resolvedColor.value, role: 'last', dataIndex: lastIdx })
			}
		}

		return result
	})

	/*********************************************************
	 * Tooltip hover state.
	 ********************************************************/
	const svgRef = ref<SVGSVGElement | null>(null)
	const mousePos = ref<{ x: number, y: number }>({ x: 0, y: 0 })
	const hoveredIndex = ref<number | null>(null)

	const tooltipPoint = computed<IChartPoint | null>(() => {
		if (hoveredIndex.value === null || !activeSeries.value) return null
		const v = values.value[hoveredIndex.value]
		if (v === undefined) return null
		return {
			seriesIndex: 0,
			seriesName: activeSeries.value.name,
			dataIndex: hoveredIndex.value,
			x: hoveredIndex.value,
			y: v,
			color: resolvedColor.value
		}
	})

	const tooltipStyle = computed<StyleValue>(() => ({
		left: `${ mousePos.value.x + 8 }px`,
		top: `${ mousePos.value.y - 28 }px`
	}))

	const onSvgMouseMove = (event: MouseEvent) => {
		if (!props.showTooltip) return
		const target = svgRef.value
		if (!target) return
		const rect = target.getBoundingClientRect()
		const relX = event.clientX - rect.left
		mousePos.value = { x: relX, y: event.clientY - rect.top }

		const n = values.value.length
		if (!n) return

		const ratio = relX / rect.width
		const idx = Math.min(n - 1, Math.max(0, Math.round(ratio * (n - 1))))
		hoveredIndex.value = idx
	}

	const onSvgMouseLeave = () => {
		hoveredIndex.value = null
	}

	/*********************************************************
	 * Root classes / styles.
	 ********************************************************/
	const rootClasses = computed(() => [
		{
			[`origam-chart-sparkline--${ props.type }`]: true,
			'origam-chart-sparkline--empty': showEmpty.value
		},
		backgroundColorClasses.value,
		elevationClasses.value,
		roundedClasses.value
	])

	const rootStyles = computed<StyleValue>(() => {
		const w = typeof props.width === 'number' ? `${ props.width }px` : props.width
		const h = typeof props.height === 'number' ? `${ props.height }px` : props.height
		return {
			width: w,
			height: h,
			display: 'inline-block'
		}
	})

	/*********************************************************
	 * ARIA.
	 ********************************************************/
	const ariaLabel = computed(() => props.title ?? 'sparkline chart')
	const svgAriaLabel = computed(() => props.title ?? `${ props.type } sparkline`)
	const svgTitle = computed(() => props.title ?? `${ props.type } sparkline`)
	const svgDesc = computed(() => {
		const n = values.value.length
		return `Sparkline with ${ n } data ${ n === 1 ? 'point' : 'points' }.`
	})
</script>

<style
		lang="scss"
		scoped
>
	.origam-chart-sparkline {
		position: relative;
		display: inline-block;
		box-sizing: border-box;
		vertical-align: middle;
		margin: 0;
		padding: 0;

		&__svg {
			display: block;
			width: 100%;
			height: 100%;
			overflow: visible;
		}

		&__bar {
			rx: var(--origam-chart-sparkline__bar---border-radius, 1);
		}

		&__special-marker {
			pointer-events: none;

			&--min {
				stroke: var(--origam-chart-sparkline__marker-min---stroke, transparent);
				stroke-width: 0;
			}

			&--max {
				stroke: var(--origam-chart-sparkline__marker-max---stroke, transparent);
				stroke-width: 0;
			}

			&--last {
				stroke: var(--origam-chart-sparkline__marker-last---stroke, white);
				stroke-width: var(--origam-chart-sparkline__marker-last---stroke-width, 1);
			}
		}

		&__tooltip {
			position: absolute;
			pointer-events: none;
			background-color: var(--origam-chart__tooltip---background-color, var(--origam-color-surface-overlay, #1f2937));
			color: var(--origam-chart__tooltip---color, #ffffff);
			padding: var(--origam-chart-sparkline__tooltip---padding, 2px 6px);
			border-radius: var(--origam-chart-sparkline__tooltip---border-radius, 4px);
			font-size: var(--origam-chart-sparkline__tooltip---font-size, 0.6875rem);
			white-space: nowrap;
			z-index: 10;
		}

		&__tooltip-value {
			font-weight: 600;
		}

		&__empty {
			position: absolute;
			inset: 0;
			display: flex;
			align-items: center;
			justify-content: center;
			color: var(--origam-chart__empty---color, var(--origam-color-text-secondary, #6b7280));
			font-size: var(--origam-chart-sparkline__empty---font-size, 0.75rem);
		}
	}
</style>
