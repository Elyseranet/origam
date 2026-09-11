<template>
	<div
			class="origam-chart-polar-bar"
			:class="rootClasses"
			:style="[rootStyles, dimensionStyles, marginStyles, paddingStyles, backgroundColorStyles, elevationStyles, roundedStyles, headerTypographyStyles]"
			role="figure"
			:aria-label="ariaLabel"
			data-cy="origam-chart-polar-bar"
	>
		<div
				v-if="hasTitleBlock"
				class="origam-chart-polar-bar__header"
				data-cy="origam-chart-polar-bar-header"
		>
			<slot name="title">
				<div
						v-if="title"
						class="origam-chart-polar-bar__title"
				>
					{{ title }}
				</div>
				<div
						v-if="subtitle"
						class="origam-chart-polar-bar__subtitle"
				>
					{{ subtitle }}
				</div>
			</slot>
		</div>

		<div
				class="origam-chart-polar-bar__body"
				:class="bodyClasses"
				data-cy="origam-chart-polar-bar-body"
		>
			<svg
					ref="svgRef"
					class="origam-chart-polar-bar__svg origam-chart__svg"
					:class="svgClasses"
					:viewBox="`0 0 ${ SVG_SIZE } ${ SVG_SIZE }`"
					role="img"
					:aria-label="svgAriaLabel"
					preserveAspectRatio="xMidYMid meet"
					data-cy="origam-chart-polar-bar-svg"
					@mousemove="onSvgMouseMove"
					@mouseleave="onSvgMouseLeave"
			>
				<title>{{ svgTitle }}</title>
				<desc>{{ svgDesc }}</desc>

				<g
						class="origam-chart__series"
						:transform="`translate(${ CENTER }, ${ CENTER })`"
						data-cy="origam-chart-polar-bar-series"
				>
					<path
							v-for="wedge in visibleWedges"
							:key="`wedge-${ wedge.index }`"
							class="origam-chart__polar-bar-wedge"
							:class="{ 'origam-chart__polar-bar-wedge--active': hoveredIndex === wedge.index }"
							:d="wedge.d"
							:style="{ fill: wedge.color }"
							:data-cy="`origam-chart-polar-bar-wedge-${ wedge.index }`"
							tabindex="0"
							role="button"
							:aria-label="wedgeAriaLabel(wedge)"
							@click="onWedgeActivate(wedge, $event)"
							@keydown.enter.prevent="onWedgeActivate(wedge, $event)"
							@keydown.space.prevent="onWedgeActivate(wedge, $event)"
							@mouseenter="onWedgeEnter(wedge)"
							@mouseleave="onWedgeLeave"
					/>

					<text
							v-for="wedge in visibleWedges"
							v-show="showLabel"
							:key="`cat-label-${ wedge.index }`"
							class="origam-chart__polar-bar-category-label"
							:x="wedge.labelX"
							:y="wedge.labelY"
							:text-anchor="wedge.labelAnchor"
							dominant-baseline="middle"
							:data-cy="`origam-chart-polar-bar-cat-label-${ wedge.index }`"
					>
						{{ wedge.category }}
					</text>

					<text
							v-for="wedge in visibleWedges"
							v-show="showValue && wedge.showValueLabel"
							:key="`val-label-${ wedge.index }`"
							class="origam-chart__polar-bar-value-label"
							:x="wedge.valueLabelX"
							:y="wedge.valueLabelY"
							text-anchor="middle"
							dominant-baseline="middle"
							:data-cy="`origam-chart-polar-bar-val-label-${ wedge.index }`"
					>
						{{ wedge.formatted }}
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
							:percentage="hoveredWedge?.percentage ?? '0%'"
					/>
				</template>
			</origam-chart-tooltip>

			<div
					v-if="showEmpty"
					class="origam-chart-polar-bar__empty origam-chart__empty"
					data-cy="origam-chart-polar-bar-empty"
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
		IChartPolarBarEmits,
		IChartPolarBarProps,
		IChartPolarBarWedge
	} from '../../interfaces/Chart/chart-polar-bar.interface'

	import { intentBgExpr, isIntent } from '../../utils/Commons/color.util'

	import type { TIntent } from '../../types'

	/*********************************************************
	 * Global
	 *
	 * @description
	 * Polar bar (nightingale-rose) chart. Renders a single series of
	 * N data points as N wedge-shaped arcs arranged radially.
	 *
	 * Each wedge occupies an equal angular slot; its outer radius is
	 * proportional to `value / maxValue`. The inner radius is fixed
	 * (controlled by `innerRadius` — a fraction of totalR).
	 *
	 * Arc path: outer-START → outer-END (CW arc) → inner-END → inner-START
	 * (CCW arc) → Z. This is the canonical sunburst arc shape reused here.
	 *
	 * `withDefaults` literals only, per CLAUDE.md.
	 ********************************************************/
	defineOptions({
		name: 'OrigamChartPolarBar'
	})

	const props = withDefaults(defineProps<IChartPolarBarProps>(), {
		categories: () => [],
		height: 400,
		title: undefined,
		subtitle: undefined,
		innerRadius: 0.1,
		startAngle: 0,
		gap: 0.02,
		maxValue: undefined,
		showLabel: true,
		showValue: false,
		showTooltip: true,
		showLegend: true,
		legendPosition: 'bottom',
		animated: true,
		animationDuration: 600,
		colorScheme: () => [],
		aspectRatio: undefined,
		xAxisFormat: undefined,
		yAxisFormat: undefined
	})

	const emit = defineEmits<IChartPolarBarEmits>()

	const { dimensionStyles } = useDimension(props)
	const { backgroundColorClasses, backgroundColorStyles } = useBackgroundColor(props, 'bgColor')
	const { elevationClasses, elevationStyles } = useElevation(props)
	const { marginClasses, marginStyles } = useMargin(props)
	const { paddingClasses, paddingStyles } = usePadding(props)
	const { roundedClasses, roundedStyles } = useRounded(props)
	const { headerTypographyStyles } = useChartHeaderTypography(props)

	/*********************************************************
	 * Static SVG box — square coordinate space; CSS scales it.
	 * Polar charts benefit from a square canvas; the `g` element
	 * is translated to the centre so all geometry uses origin-centred
	 * polar coordinates.
	 ********************************************************/
	const SVG_SIZE = 400
	const CENTER = SVG_SIZE / 2

	/** Radial clearance between outermost wedge and the SVG edge for labels. */
	const LABEL_RADIAL_OFFSET = 14
	/** Minimum angular span (radians) for an in-wedge value label to be shown. */
	const VALUE_LABEL_MIN_ANGLE = 0.25

	/*********************************************************
	 * Default colour palette — mirrors the DS intent cycle
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
	 * Arc path generator — canonical sunburst shape, reused verbatim.
	 *
	 * Donut wedge: start at outer-START, sweep CW to outer-END (sweep=1),
	 * radial line to inner-END, then sweep CCW back to inner-START
	 * (sweep=0) → Z.
	 ********************************************************/
	const arcPath = (
		innerR: number,
		outerR: number,
		startAngle: number,
		endAngle: number
	): string => {
		const sweep = endAngle - startAngle
		if (sweep <= 0) return ''

		const cos0 = Math.cos(startAngle)
		const sin0 = Math.sin(startAngle)
		const cos1 = Math.cos(endAngle)
		const sin1 = Math.sin(endAngle)

		const largeArc = sweep > Math.PI ? 1 : 0

		const ox0 = outerR * cos0
		const oy0 = outerR * sin0
		const ox1 = outerR * cos1
		const oy1 = outerR * sin1

		const ix0 = innerR * cos0
		const iy0 = innerR * sin0
		const ix1 = innerR * cos1
		const iy1 = innerR * sin1

		if (innerR < 1e-3) {
			return [
				`M 0,0`,
				`L ${ ox0 },${ oy0 }`,
				`A ${ outerR },${ outerR } 0 ${ largeArc },1 ${ ox1 },${ oy1 }`,
				'Z'
			].join(' ')
		}

		return [
			`M ${ ox0 },${ oy0 }`,
			`A ${ outerR },${ outerR } 0 ${ largeArc },1 ${ ox1 },${ oy1 }`,
			`L ${ ix1 },${ iy1 }`,
			`A ${ innerR },${ innerR } 0 ${ largeArc },0 ${ ix0 },${ iy0 }`,
			'Z'
		].join(' ')
	}

	/*********************************************************
	 * Legend — hidden-label set keyed by category string
	 ********************************************************/
	const hiddenLabels = ref<Set<string>>(new Set())

	/*********************************************************
	 * Geometry engine — one wedge per data point
	 ********************************************************/
	const wedges = computed<Array<IChartPolarBarWedge>>(() => {
		const series = props.series?.[0]
		if (!series || !series.data?.length) return []

		const raw = series.data as Array<number | { x: number | string, y: number }>
		const values: Array<number> = raw.map((e) => (typeof e === 'number' ? e : e.y))
		const count = values.length
		if (count === 0) return []

		const total = values.reduce((s, v) => s + (Number.isFinite(v) && v >= 0 ? v : 0), 0) || 1e-9
		const effectiveMax = props.maxValue != null && props.maxValue > 0
			? props.maxValue
			: Math.max(...values.filter((v) => Number.isFinite(v) && v >= 0), 1e-9)

		const totalR = CENTER - LABEL_RADIAL_OFFSET - 20
		const innerR = totalR * Math.max(0, Math.min(0.99, props.innerRadius))

		const totalAngularSpace = 2 * Math.PI - count * props.gap
		const slotAngle = Math.max(0, totalAngularSpace / count)

		const formatValue = (v: number): string => {
			if (props.yAxisFormat) return props.yAxisFormat(v)
			return String(v)
		}

		const categoryOf = (i: number): string => {
			if (props.categories[i] != null) return String(props.categories[i])
			const entry = raw[i]
			if (typeof entry === 'object' && entry !== null) return String(entry.x)
			return `Item ${ i + 1 }`
		}

		return values.map((v, i): IChartPolarBarWedge => {
			const cat = categoryOf(i)
			const isHidden = hiddenLabels.value.has(cat)
			const safeVal = Number.isFinite(v) && v >= 0 ? v : 0

			const wedgeStart = props.startAngle + i * (slotAngle + props.gap)
			const wedgeEnd = wedgeStart + slotAngle
			const midAngle = (wedgeStart + wedgeEnd) / 2

			const outerR = innerR + (safeVal / effectiveMax) * (totalR - innerR)
			const d = arcPath(innerR, outerR, wedgeStart, wedgeEnd)

			const labelR = outerR + LABEL_RADIAL_OFFSET
			const labelX = labelR * Math.cos(midAngle)
			const labelY = labelR * Math.sin(midAngle)

			const cosM = Math.cos(midAngle)
			const labelAnchor: 'start' | 'middle' | 'end' =
				cosM > 0.1 ? 'start' : cosM < -0.1 ? 'end' : 'middle'

			const pct = total > 0 ? (safeVal / total) * 100 : 0
			const percentage = `${ pct.toFixed(1) }%`

			const showValueLabel = slotAngle >= VALUE_LABEL_MIN_ANGLE && outerR - innerR > 12
			const midR = (innerR + outerR) / 2
			const valueLabelX = midR * Math.cos(midAngle)
			const valueLabelY = midR * Math.sin(midAngle)

			return {
				index: i,
				d,
				color: colorFor(i),
				category: cat,
				value: safeVal,
				formatted: formatValue(safeVal),
				visible: !isHidden,
				outerR,
				innerR,
				startAngle: wedgeStart,
				endAngle: wedgeEnd,
				midAngle,
				labelX,
				labelY,
				labelAnchor,
				percentage,
				showValueLabel,
				valueLabelX,
				valueLabelY
			}
		})
	})

	const visibleWedges = computed(() => wedges.value.filter((w) => w.visible))

	/*********************************************************
	 * Legend items
	 ********************************************************/
	const legendItems = computed<Array<IChartLegendItem>>(() => {
		const series = props.series?.[0]
		if (!series) return []
		return wedges.value.map((w) => ({
			series: {
				...series,
				name: w.category,
				data: [w.value],
				visible: w.visible
			} as IChartSeries,
			index: w.index,
			color: w.color,
			visible: w.visible
		}))
	})

	/*********************************************************
	 * Hover / tooltip
	 ********************************************************/
	const svgRef = ref<SVGSVGElement | null>(null)
	const mousePos = ref<{ x: number, y: number }>({ x: 0, y: 0 })
	const hoveredIndex = ref<number | null>(null)

	const hoveredWedge = computed<IChartPolarBarWedge | null>(() => {
		if (hoveredIndex.value === null) return null
		return visibleWedges.value.find((w) => w.index === hoveredIndex.value) ?? null
	})

	const hoveredPoint = computed<IChartPoint | null>(() => {
		const w = hoveredWedge.value
		if (!w || !props.series?.[0]) return null
		return {
			seriesIndex: 0,
			seriesName: props.series[0].name,
			dataIndex: w.index,
			x: w.category,
			y: w.value,
			color: w.color
		}
	})

	const hoveredSeries = computed<IChartSeries | null>(() => {
		if (!hoveredWedge.value || !props.series?.[0]) return null
		return props.series[0]
	})

	const hoveredCategory = computed<string | number>(() =>
		hoveredWedge.value?.category ?? ''
	)

	const showEmpty = computed(() => {
		if (!props.series?.length) return true
		const first = props.series[0]
		if (!first?.data?.length) return true
		return visibleWedges.value.length === 0
	})

	/*********************************************************
	 * Root classes / styles
	 ********************************************************/
	const rootClasses = computed(() => [
		{
			[`origam-chart-polar-bar--legend-${ props.legendPosition }`]: true,
			'origam-chart-polar-bar--no-animation': !props.animated
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
		'origam-chart-polar-bar__body--with-side-legend': props.showLegend
			&& (props.legendPosition === 'left' || props.legendPosition === 'right')
	}))

	const svgClasses = computed(() => ({
		'origam-chart__svg--animated': props.animated
	}))

	const hasTitleBlock = computed(() => Boolean(props.title || props.subtitle))

	/*********************************************************
	 * ARIA
	 ********************************************************/
	const ariaLabel = computed(() => props.title ?? 'Polar bar chart')
	const svgAriaLabel = computed(() => props.title ?? 'Polar bar chart')
	const svgTitle = computed(() => props.title ?? 'Polar bar chart')
	const svgDesc = computed(() => {
		const n = visibleWedges.value.length
		return `Polar bar chart with ${ n } ${ n === 1 ? 'wedge' : 'wedges' }.`
	})

	const wedgeAriaLabel = (wedge: IChartPolarBarWedge): string =>
		`${ wedge.category }: ${ wedge.formatted } (${ wedge.percentage })`

	/*********************************************************
	 * Interaction
	 ********************************************************/
	const onWedgeEnter = (wedge: IChartPolarBarWedge) => {
		hoveredIndex.value = wedge.index
	}

	const onWedgeLeave = () => {
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
		onWedgeLeave()
	}

	const onWedgeActivate = (wedge: IChartPolarBarWedge, event: MouseEvent | KeyboardEvent) => {
		hoveredIndex.value = wedge.index
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
	.origam-chart-polar-bar {
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

		.origam-chart__polar-bar-wedge {
			stroke: var(--origam-chart__polar-bar---stroke-color, var(--origam-color-surface-default, #ffffff));
			stroke-width: var(--origam-chart__polar-bar---stroke-width, 1.5);
			cursor: pointer;
			transition: opacity 150ms ease, filter 150ms ease;

			&:hover,
			&:focus-visible,
			&--active {
				outline: none;
				filter: brightness(1.1);
			}
		}

		.origam-chart__polar-bar-category-label {
			pointer-events: none;
			font-size: var(--origam-chart__polar-bar-label---font-size, 0.6875rem);
			font-weight: var(--origam-chart__polar-bar-label---font-weight, 500);
			fill: var(--origam-chart__polar-bar-label---color, var(--origam-color-text-primary, currentColor));
			user-select: none;
		}

		.origam-chart__polar-bar-value-label {
			pointer-events: none;
			font-size: var(--origam-chart__polar-bar-value-label---font-size, 0.625rem);
			font-weight: var(--origam-chart__polar-bar-value-label---font-weight, 600);
			fill: var(--origam-chart__polar-bar-value-label---color, #ffffff);
			user-select: none;
		}

		.origam-chart__svg--animated .origam-chart__polar-bar-wedge {
			animation: origam-chart-polar-bar-fade var(--origam-chart---animation-duration, 600ms) ease-out both;
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

		&--no-animation .origam-chart__polar-bar-wedge {
			animation: none;
		}
	}

	@keyframes origam-chart-polar-bar-fade {
		from {
			opacity: 0;
		}
		to {
			opacity: 1;
		}
	}

	@media (prefers-reduced-motion: reduce) {
		.origam-chart-polar-bar .origam-chart__svg--animated .origam-chart__polar-bar-wedge {
			animation: none;
		}
	}
</style>
