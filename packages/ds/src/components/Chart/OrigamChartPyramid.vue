<template>
	<div
			class="origam-chart-pyramid"
			:class="rootClasses"
			:style="[rootStyles, dimensionStyles, marginStyles, paddingStyles, backgroundColorStyles, elevationStyles, roundedStyles, headerTypographyStyles]"
			role="figure"
			:aria-label="ariaLabel"
			data-cy="origam-chart-pyramid"
	>
		<div
				v-if="hasTitleBlock"
				class="origam-chart-pyramid__header"
				data-cy="origam-chart-pyramid-header"
		>
			<slot name="title">
				<div
						v-if="title"
						class="origam-chart-pyramid__title"
				>
					{{ title }}
				</div>
				<div
						v-if="subtitle"
						class="origam-chart-pyramid__subtitle"
				>
					{{ subtitle }}
				</div>
			</slot>
		</div>

		<div
				class="origam-chart-pyramid__body"
				:class="bodyClasses"
				data-cy="origam-chart-pyramid-body"
		>
			<svg
					ref="svgRef"
					class="origam-chart-pyramid__svg origam-chart__svg"
					:class="svgClasses"
					:viewBox="`0 0 ${ SVG_WIDTH } ${ SVG_HEIGHT }`"
					role="img"
					:aria-label="svgAriaLabel"
					preserveAspectRatio="xMidYMid meet"
					data-cy="origam-chart-pyramid-svg"
					@mousemove="onSvgMouseMove"
					@mouseleave="onSvgMouseLeave"
			>
				<title>{{ svgTitle }}</title>
				<desc>{{ svgDesc }}</desc>

				<g
						class="origam-chart__series"
						data-cy="origam-chart-pyramid-series"
				>
					<path
							v-for="slice in visibleSlices"
							:key="`slice-${ slice.index }`"
							class="origam-chart__pyramid-slice"
							:class="{ 'origam-chart__pyramid-slice--active': hoveredIndex === slice.index }"
							:d="slice.d"
							:fill="slice.color"
							:data-cy="`origam-chart-pyramid-slice-${ slice.index }`"
							tabindex="0"
							role="button"
							:aria-label="sliceAriaLabel(slice)"
							@click="onSliceActivate(slice, $event)"
							@keydown.enter.prevent="onSliceActivate(slice, $event)"
							@keydown.space.prevent="onSliceActivate(slice, $event)"
							@mouseenter="onSliceEnter(slice)"
							@mouseleave="onSliceLeave"
					/>

					<line
							v-for="slice in outsideLabelSlices"
							:key="`leader-${ slice.index }`"
							class="origam-chart__pyramid-leader"
							:x1="slice.leaderX"
							:y1="slice.labelY"
							:x2="slice.labelX - 2"
							:y2="slice.labelY"
							:stroke="slice.color"
							:data-cy="`origam-chart-pyramid-leader-${ slice.index }`"
					/>

					<text
							v-for="slice in visibleSlices"
							:key="`label-${ slice.index }`"
							class="origam-chart__pyramid-label"
							:class="{
								'origam-chart__pyramid-label--inside': effectiveLabelPlacement(slice) === 'inside',
								'origam-chart__pyramid-label--outside': effectiveLabelPlacement(slice) === 'outside'
							}"
							:x="slice.labelX"
							:y="slice.labelY"
							:text-anchor="effectiveLabelPlacement(slice) === 'inside' ? 'middle' : 'start'"
							dominant-baseline="middle"
							:data-cy="`origam-chart-pyramid-label-${ slice.index }`"
					>
						{{ slice.category }}: {{ slice.formatted }}
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
					class="origam-chart-pyramid__empty origam-chart__empty"
					data-cy="origam-chart-pyramid-empty"
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
		IChartPyramidEmits,
		IChartPyramidProps,
		IChartPyramidSlice,
		IChartSeries
	} from '../../interfaces'

	import { intentBgExpr, isIntent } from '../../utils/Commons/color.util'

	import type { TIntent } from '../../types'

	/*********************************************************
	 * Global
	 *
	 * @description
	 * Pyramid / Funnel chart family. Renders a single series of
	 * N data points as N horizontal trapezoids stacked vertically.
	 *
	 * - `type='funnel'`  — widest at top, narrowing toward bottom.
	 *   Classic conversion funnel: 1000 visitors → 600 leads → …
	 * - `type='pyramid'` — narrow at top, widening toward bottom.
	 *   Same data shape; direction is flipped.
	 *
	 * Legend entries are one per data point (= one per slice), keyed
	 * by category label. Clicking a legend entry hides that slice
	 * and collapses its height from the layout.
	 *
	 * `withDefaults` literals only, per CLAUDE.md.
	 ********************************************************/
	defineOptions({
		name: 'OrigamChartPyramid'
	})

	const props = withDefaults(defineProps<IChartPyramidProps>(), {
		type: 'funnel',
		categories: () => [],
		height: 360,
		title: undefined,
		subtitle: undefined,
		showLegend: true,
		legendPosition: 'bottom',
		showTooltip: true,
		animated: true,
		animationDuration: 600,
		colorScheme: () => [],
		aspectRatio: undefined,
		sliceGap: 0,
		labelPlacement: 'auto',
		xAxisFormat: undefined,
		yAxisFormat: undefined
	})

	const emit = defineEmits<IChartPyramidEmits>()

	const { dimensionStyles } = useDimension(props)
	const { backgroundColorClasses, backgroundColorStyles } = useBackgroundColor(props, 'bgColor')
	const { elevationClasses, elevationStyles } = useElevation(props)
	const { marginStyles } = useMargin(props)
	const { paddingStyles } = usePadding(props)
	const { roundedClasses, roundedStyles } = useRounded(props)
	const { headerTypographyStyles } = useChartHeaderTypography(props)

	/*********************************************************
	 * Static SVG box — the component always paints into
	 * a fixed 600 × 400 coordinate space; CSS scales it.
	 ********************************************************/
	const SVG_WIDTH = 600
	const SVG_HEIGHT = 400
	const PADDING = { top: 20, right: 120, bottom: 20, left: 20 }
	const LABEL_FITS_INSIDE_MIN_HEIGHT = 18
	const LABEL_FITS_INSIDE_MIN_WIDTH = 90
	const LABEL_OUTSIDE_X_OFFSET = 10

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

	const colorFor = (dataIndex: number): string => {
		const series = props.series?.[0]
		if (series?.color) return resolveColor(series.color)
		const scheme = props.colorScheme?.length ? props.colorScheme : DEFAULT_PALETTE
		return resolveColor(scheme[dataIndex % scheme.length])
	}

	/*********************************************************
	 * Legend — hidden-label set keyed by category string
	 ********************************************************/
	const hiddenLabels = ref<Set<string>>(new Set())

	const categoryLabel = (index: number): string => {
		const cat = props.categories[index]
		if (cat != null) return String(cat)
		const series = props.series?.[0]
		if (!series) return `Slice ${ index + 1 }`
		const entry = series.data[index]
		if (typeof entry === 'object' && entry !== null) return String(entry.x)
		return `Slice ${ index + 1 }`
	}

	const formatValue = (v: number): string => {
		if (props.yAxisFormat) return props.yAxisFormat(v)
		if (props.xAxisFormat) return String(props.xAxisFormat(v))
		return String(v)
	}

	/*********************************************************
	 * Geometry — canonical pyramid / funnel
	 *
	 * Canonical pyramid (Highcharts-style): the WHOLE chart is a
	 * single triangular silhouette divided into horizontal bands.
	 *   - The silhouette is fixed (top width vs bottom width).
	 *   - Each band's HEIGHT is proportional to its value (NOT
	 *     its width — width is a function of vertical position
	 *     on the linear taper).
	 *   - Adjacent bands share their common edge → no kinks, no
	 *     gaps, the outline reads as a single triangle.
	 *
	 * `funnel`  — silhouette = inverted triangle. Top = full width,
	 *             bottom = narrow band. Largest value sits at top,
	 *             smallest at bottom.
	 * `pyramid` — silhouette = upright triangle. Top = narrow band,
	 *             bottom = full width. Smallest at top, largest at
	 *             bottom (data reversed internally so the consumer
	 *             can pass descending values).
	 *
	 * Each band is a trapezoid. Width at any Y is linearly
	 * interpolated between silhouette top-width and bottom-width:
	 *   w(α) = topW + (botW - topW) · α   with   α = (y - y0) / H
	 ********************************************************/
	const slices = computed<Array<IChartPyramidSlice>>(() => {
		const series = props.series?.[0]
		if (!series || !series.data?.length) return []

		const raw = series.data as Array<number | { x: number | string, y: number }>
		const values: Array<number> = raw.map((e) => (typeof e === 'number' ? e : e.y))
		const count = values.length

		if (count === 0) return []

		const total = values.reduce((s, v) => s + (Number.isFinite(v) && v >= 0 ? v : 0), 0) || 1e-9

		const x0 = PADDING.left
		const x1 = SVG_WIDTH - PADDING.right
		const y0 = PADDING.top
		const y1 = SVG_HEIGHT - PADDING.bottom
		const cx = (x0 + x1) / 2
		const plotW = x1 - x0
		const totalH = y1 - y0

		const isFunnel = props.type !== 'pyramid'

		/*
		 * Silhouette endpoints — fraction of plotW. TIP_FRACTION=0
		 * gives a true point at the narrow end (canonical funnel /
		 * pyramid). Labels on the narrow-end band auto-relocate
		 * outside via labelFitsInside when the band gets too short.
		 *
		 * Funnel:  top = full width →  bottom = 0 (point)
		 * Pyramid: top = 0 (point)  →  bottom = full width
		 */
		const TIP_FRACTION = 0
		const topSilhouette = isFunnel ? plotW : plotW * TIP_FRACTION
		const botSilhouette = isFunnel ? plotW * TIP_FRACTION : plotW

		const widthAt = (alpha: number): number =>
			topSilhouette + (botSilhouette - topSilhouette) * Math.max(0, Math.min(1, alpha))

		/*
		 * Data-index mapping. Funnel renders in array order. Pyramid
		 * reverses so the consumer-supplied descending list becomes
		 * smallest-at-top, largest-at-bottom — the canonical pyramid.
		 */
		const dataIndexForSlot = (slot: number): number => isFunnel ? slot : (count - 1 - slot)

		/*
		 * Visible band heights are proportional to their values
		 * relative to the total — that is the defining property of
		 * the canonical pyramid (height ∝ value, width = linear
		 * interpolation along Y). Optional sliceGap is subtracted
		 * from the available vertical space; default = 0 so the
		 * silhouette stays unbroken.
		 */
		const gap = props.sliceGap ?? 0
		const usableH = Math.max(totalH - gap * Math.max(0, count - 1), 1)

		const result: Array<IChartPyramidSlice> = []

		let cursorY = y0
		for (let slot = 0; slot < count; slot++) {
			const dataIdx = dataIndexForSlot(slot)
			const cat = categoryLabel(dataIdx)
			const isHidden = hiddenLabels.value.has(cat)
			const v = Number.isFinite(values[dataIdx]) && values[dataIdx] >= 0 ? values[dataIdx] : 0

			const bandH = (v / total) * usableH
			const slotTop = cursorY
			const slotBot = slotTop + bandH

			const alphaTop = (slotTop - y0) / totalH
			const alphaBot = (slotBot - y0) / totalH

			const topW = widthAt(alphaTop)
			const botW = widthAt(alphaBot)

			const tl = cx - topW / 2
			const tr = cx + topW / 2
			const br = cx + botW / 2
			const bl = cx - botW / 2

			const d = `M ${ tl },${ slotTop } L ${ tr },${ slotTop } L ${ br },${ slotBot } L ${ bl },${ slotBot } Z`

			const labelY = (slotTop + slotBot) / 2
			/*
			 * Inside-fit requires BOTH enough vertical room AND enough
			 * width at the band's midpoint to host the label text.
			 * For the narrow tip of a pyramid / funnel the band is
			 * tall but ~0px wide → label must go outside.
			 */
			const alphaMid = (labelY - y0) / totalH
			const midW = widthAt(alphaMid)
			const labelFitsInside = bandH >= LABEL_FITS_INSIDE_MIN_HEIGHT
				&& midW >= LABEL_FITS_INSIDE_MIN_WIDTH

			const labelAnchor: 'middle' | 'start' = labelFitsInside ? 'middle' : 'start'
			const leaderX = cx + midW / 2
			const labelX = labelFitsInside ? cx : leaderX + LABEL_OUTSIDE_X_OFFSET

			cursorY = slotBot + gap

			result.push({
				labelAnchor,
				leaderX,
				index: dataIdx,
				d,
				color: colorFor(dataIdx),
				category: cat,
				value: v,
				formatted: formatValue(v),
				visible: !isHidden,
				labelX,
				labelY,
				labelFitsInside
			})
		}

		return result
	})

	const visibleSlices = computed(() => slices.value.filter((s) => s.visible))

	const outsideLabelSlices = computed(() =>
		visibleSlices.value.filter((s) => effectiveLabelPlacement(s) === 'outside')
	)

	/*********************************************************
	 * Legend items — one per data point (slice), keyed by
	 * category label. Mirrors the polar single-ring pattern.
	 ********************************************************/
	const legendItems = computed<Array<IChartLegendItem>>(() => {
		const series = props.series?.[0]
		if (!series) return []
		return slices.value.map((slice) => ({
			series: {
				...series,
				name: slice.category,
				data: [slice.value],
				visible: slice.visible
			} as IChartSeries,
			index: slice.index,
			color: slice.color,
			visible: slice.visible
		}))
	})

	/*********************************************************
	 * Effective label placement
	 ********************************************************/
	const effectiveLabelPlacement = (slice: IChartPyramidSlice): 'inside' | 'outside' => {
		if (props.labelPlacement === 'inside') return 'inside'
		if (props.labelPlacement === 'outside') return 'outside'
		return slice.labelFitsInside ? 'inside' : 'outside'
	}

	/*********************************************************
	 * Hover / tooltip
	 ********************************************************/
	const svgRef = ref<SVGSVGElement | null>(null)
	const mousePos = ref<{ x: number, y: number }>({ x: 0, y: 0 })
	const hoveredIndex = ref<number | null>(null)

	const hoveredSlice = computed<IChartPyramidSlice | null>(() => {
		if (hoveredIndex.value === null) return null
		return visibleSlices.value.find((s) => s.index === hoveredIndex.value) ?? null
	})

	const hoveredPoint = computed<IChartPoint | null>(() => {
		const s = hoveredSlice.value
		if (!s || !props.series?.[0]) return null
		return {
			seriesIndex: 0,
			seriesName: props.series[0].name,
			dataIndex: s.index,
			x: s.category,
			y: s.value,
			color: s.color
		}
	})

	const hoveredSeries = computed<IChartSeries | null>(() => {
		if (!hoveredSlice.value || !props.series?.[0]) return null
		return props.series[0]
	})

	const hoveredCategory = computed<string | number>(() =>
		hoveredSlice.value?.category ?? ''
	)

	const showEmpty = computed(() => {
		if (!props.series?.length) return true
		const first = props.series[0]
		if (!first?.data?.length) return true
		return visibleSlices.value.length === 0
	})

	/*********************************************************
	 * Root classes / styles
	 ********************************************************/
	const rootClasses = computed(() => [
		{
			[`origam-chart-pyramid--${ props.type }`]: true,
			[`origam-chart-pyramid--legend-${ props.legendPosition }`]: true,
			'origam-chart-pyramid--no-animation': !props.animated
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
		'origam-chart-pyramid__body--with-side-legend': props.showLegend
			&& (props.legendPosition === 'left' || props.legendPosition === 'right')
	}))

	const svgClasses = computed(() => ({
		'origam-chart__svg--animated': props.animated
	}))

	const hasTitleBlock = computed(() => Boolean(props.title || props.subtitle))

	/*********************************************************
	 * ARIA
	 ********************************************************/
	const ariaLabel = computed(() => props.title ?? `${ props.type } chart`)
	const svgAriaLabel = computed(() => props.title ?? `${ props.type } chart`)
	const svgTitle = computed(() => props.title ?? `${ props.type } chart`)
	const svgDesc = computed(() => {
		const n = visibleSlices.value.length
		return `${ props.type } chart with ${ n } ${ n === 1 ? 'slice' : 'slices' }.`
	})

	const sliceAriaLabel = (slice: IChartPyramidSlice): string =>
		`${ slice.category }: ${ slice.formatted }`

	/*********************************************************
	 * Interaction
	 ********************************************************/
	const onSliceEnter = (slice: IChartPyramidSlice) => {
		hoveredIndex.value = slice.index
	}

	const onSliceLeave = () => {
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
		onSliceLeave()
	}

	const onSliceActivate = (slice: IChartPyramidSlice, event: MouseEvent | KeyboardEvent) => {
		hoveredIndex.value = slice.index
		if (hoveredPoint.value) {
			emit('point-click', hoveredPoint.value, event)
		}
	}

	const onLegendClick = (series: IChartSeries, index: number): void => {
		emit('legend-click', series, index)
	}

	const onSeriesToggle = (series: IChartSeries, nextVisible: boolean): void => {
		if (nextVisible) hiddenLabels.value.delete(series.name)
		else hiddenLabels.value.add(series.name)
		emit('series-toggle', series, nextVisible)
	}
</script>

<style
		lang="scss"
		scoped
>
	.origam-chart-pyramid {
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

		.origam-chart__pyramid-slice {
			stroke: var(--origam-chart__pyramid---stroke-color, var(--origam-color-surface-default, #ffffff));
			stroke-width: var(--origam-chart__pyramid---stroke-width, 2);
			cursor: pointer;
			transition: opacity 150ms ease, filter 150ms ease;

			&:hover,
			&:focus-visible,
			&--active {
				outline: none;
				filter: brightness(1.08);
			}
		}

		.origam-chart__pyramid-label {
			pointer-events: none;
			font-size: var(--origam-chart__pyramid-label---font-size, 0.75rem);
			font-weight: var(--origam-chart__pyramid-label---font-weight, 500);
			user-select: none;

			&--inside {
				fill: var(--origam-chart__pyramid-label--inside---color, #ffffff);
			}

			&--outside {
				fill: var(--origam-chart__pyramid-label--outside---color, var(--origam-color-text-primary, currentColor));
			}
		}

		.origam-chart__svg--animated .origam-chart__pyramid-slice {
			animation: origam-chart-pyramid-fade var(--origam-chart---animation-duration, 600ms) ease-out both;
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

		&--no-animation .origam-chart__pyramid-slice {
			animation: none;
		}
	}

	@keyframes origam-chart-pyramid-fade {
		from {
			opacity: 0;
		}
		to {
			opacity: 1;
		}
	}

	@media (prefers-reduced-motion: reduce) {
		.origam-chart-pyramid .origam-chart__svg--animated .origam-chart__pyramid-slice {
			animation: none;
		}
	}
</style>
