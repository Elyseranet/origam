<template>
	<div
			class="origam-chart-polar"
			:class="rootClasses"
			:style="[rootStyles, dimensionStyles, marginStyles, paddingStyles, backgroundColorStyles, elevationStyles, roundedStyles, headerTypographyStyles]"
			role="figure"
			:aria-label="ariaLabel"
			data-cy="origam-chart-polar"
	>
		<div
				v-if="hasTitleBlock"
				class="origam-chart-polar__header"
				data-cy="origam-chart-polar-header"
		>
			<slot name="title">
				<div
						v-if="title"
						class="origam-chart-polar__title"
				>
					{{ title }}
				</div>
				<div
						v-if="subtitle"
						class="origam-chart-polar__subtitle"
				>
					{{ subtitle }}
				</div>
			</slot>
		</div>

		<nav
				v-if="hasDrilldown && isDrilled"
				class="origam-chart-polar__breadcrumb"
				aria-label="Drilldown navigation"
				data-cy="origam-chart-polar-breadcrumb"
		>
			<origam-btn
					class="origam-chart-polar__breadcrumb-back"
					variant="outlined"
					:text="drilldownBackLabel"
					:aria-label="drilldownBackLabel"
					:style="{ '--origam-btn---min-height': '0', '--origam-btn---min-width': '0' }"
					data-cy="origam-chart-polar-breadcrumb-back"
					@click="onDrillUp"
			/>
			<ol class="origam-chart-polar__breadcrumb-trail">
				<li
						v-for="item in breadcrumbItems"
						:key="item.depth"
						class="origam-chart-polar__breadcrumb-item"
						:class="{ 'origam-chart-polar__breadcrumb-item--active': item.depth === drillStack.length - 1 }"
				>
					<button
							v-if="item.depth < drillStack.length - 1"
							class="origam-chart-polar__breadcrumb-link"
							type="button"
							@click="onBreadcrumbClick(item.depth)"
					>{{ item.name }}</button>
					<span
							v-else
							class="origam-chart-polar__breadcrumb-current"
							aria-current="page"
					>{{ item.name }}</span>
				</li>
			</ol>
		</nav>

		<div
				class="origam-chart-polar__body"
				:class="bodyClasses"
				data-cy="origam-chart-polar-body"
		>
			<svg
					ref="svgRef"
					class="origam-chart-polar__svg origam-chart__svg"
					:class="svgClasses"
					:viewBox="viewBox"
					role="img"
					:aria-label="svgAriaLabel"
					preserveAspectRatio="xMidYMid meet"
					data-cy="origam-chart-polar-svg"
					@mousemove="onSvgMouseMove"
					@mouseleave="onSvgMouseLeave"
			>
				<title>{{ svgTitle }}</title>
				<desc>{{ svgDesc }}</desc>

				<g
						class="origam-chart__series"
						data-cy="origam-chart-polar-series"
				>
					<path
							v-for="(path, i) in paths"
							:key="`slice-${ i }`"
							class="origam-chart__slice"
							:d="path.d"
							:fill="path.color"
							:data-cy="`origam-chart-slice-${ path.dataIndex }`"
							tabindex="0"
							role="button"
							:aria-label="sliceAriaLabel(path)"
							@click="onPointActivate(path, $event)"
							@keydown.enter.prevent="onPointActivate(path, $event)"
							@keydown.space.prevent="onPointActivate(path, $event)"
							@mouseenter="onPointEnter(path)"
							@mouseleave="onPointLeaveEvent"
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
					:x-axis-format="xAxisFormat"
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
					class="origam-chart-polar__empty origam-chart__empty"
					data-cy="origam-chart-polar-empty"
			>
				<slot name="empty">
					<span>No data to display</span>
				</slot>
			</div>
		</div>

		<origam-chart-legend
				v-if="showLegend"
				:items="legend"
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

	import {
		useChartHeaderTypography,
		useBackgroundColor,
		useChart,
		useDimension,
		useElevation,
		useMargin,
		usePadding,
		useRounded
	} from '../../composables'

	import { OrigamBtn } from '../Btn'

	import OrigamChartLegend from './OrigamChartLegend.vue'
	import OrigamChartTooltip from './OrigamChartTooltip.vue'

	import type {
		IChartDrilldownFrame,
		IChartDrilldownLink,
		IChartPath,
		IChartPoint,
		IChartPolarEmits,
		IChartPolarProps,
		IChartSeries,
		IChartSeriesPoint
	} from '../../interfaces'

	/*********************************************************
	 * Global
	 *
	 * @description
	 * Polar chart family — renders `pie` and `donut`. Deliberately
	 * has NO axes, NO grid, NO tick labels: the cartesian chrome
	 * doesn't apply to angular geometry, and painting it behind a
	 * pie chart was the user's primary complaint about the
	 * legacy `<OrigamChart>` shell.
	 ********************************************************/
	defineOptions({
		name: 'OrigamChartPolar'
	})

	/*********************************************************
	 * Props / Emits
	 ********************************************************/
	const props = withDefaults(defineProps<IChartPolarProps>(), {
		type: 'pie',
		categories: () => [],
		height: 300,
		title: undefined,
		subtitle: undefined,
		showLegend: true,
		legendPosition: 'bottom',
		showTooltip: true,
		animated: true,
		animationDuration: 600,
		donutHoleSize: 0.6,
		colorScheme: () => [],
		xAxisFormat: undefined,
		yAxisFormat: undefined,
		aspectRatio: undefined,
		drilldown: undefined
	})

	const emit = defineEmits<IChartPolarEmits>()

	/*********************************************************
	 * Drilldown state — mirrors the cartesian implementation.
	 * Pie / donut slices can carry a drilldown link on their
	 * object-form data entry; clicking such a slice replaces the
	 * chart with the matching sub-dataset and shows a breadcrumb.
	 ********************************************************/
	const drillStack = ref<Array<IChartDrilldownFrame>>([])

	const activeSeries = computed<Array<IChartSeries>>(() => {
		if (!drillStack.value.length) return props.series
		return drillStack.value[drillStack.value.length - 1].series
	})

	const activeCategories = computed<Array<string>>(() => {
		if (!drillStack.value.length) return props.categories
		return drillStack.value[drillStack.value.length - 1].categories
	})

	const hasDrilldown = computed(() => Boolean(props.drilldown?.datasets?.length))

	const isDrilled = computed(() => drillStack.value.length > 0)

	const breadcrumbItems = computed<Array<{ name: string, depth: number }>>(() => {
		const root = { name: props.title ?? 'Root', depth: -1 }
		return [root, ...drillStack.value.map((frame, i) => ({ name: frame.name, depth: i }))]
	})

	const drilldownBackLabel = computed(() => props.drilldown?.backLabel ?? '← Back')

	const resolveDrilldownLink = (link: IChartDrilldownLink): IChartDrilldownFrame | null => {
		if (!props.drilldown) return null
		const dataset = props.drilldown.datasets.find((d) => d.id === link.id)
		if (!dataset) return null
		return {
			name: dataset.name,
			series: dataset.series,
			categories: dataset.categories ?? []
		}
	}

	const isDrilldownCycle = (id: string): boolean =>
		drillStack.value.some((frame) => frame.name === id)

	const onDrillIn = (link: IChartDrilldownLink, point: IChartPoint): void => {
		if (isDrilldownCycle(link.id)) return
		const frame = resolveDrilldownLink(link)
		if (!frame) return
		drillStack.value = [...drillStack.value, frame]
		hoveredPath.value = null
		emit('drill', link, point)
	}

	const onDrillUp = (): void => {
		if (!drillStack.value.length) return
		drillStack.value = drillStack.value.slice(0, -1)
		hoveredPath.value = null
		emit('drill-up')
	}

	const onBreadcrumbClick = (depth: number): void => {
		if (depth === -1) {
			drillStack.value = []
		} else {
			drillStack.value = drillStack.value.slice(0, depth + 1)
		}
		hoveredPath.value = null
	}

	const { dimensionStyles } = useDimension(props)
	const { backgroundColorClasses, backgroundColorStyles } = useBackgroundColor(props, 'bgColor')
	const { elevationClasses, elevationStyles } = useElevation(props)
	const { marginClasses, marginStyles } = useMargin(props)
	const { paddingClasses, paddingStyles } = usePadding(props)
	const { roundedClasses, roundedStyles } = useRounded(props)
	const { headerTypographyStyles } = useChartHeaderTypography(props)

	/*********************************************************
	 * Static — polar charts need less padding than cartesian
	 * because there are no axis labels to host outside the plot.
	 ********************************************************/
	const SVG_WIDTH = 600
	const SVG_HEIGHT = 360
	const PADDING_POLAR = { top: 12, right: 12, bottom: 12, left: 12 }

	const svgRef = ref<SVGSVGElement | null>(null)
	const mousePos = ref<{ x: number, y: number }>({ x: 0, y: 0 })

	/*********************************************************
	 * Engine
	 ********************************************************/
	/*
	 * Local hidden-labels set drives the per-slice (single ring) /
	 * per-ring (multi-ring) visibility toggle. Keyed by display name
	 * (category for single-ring, series name for multi-ring). The
	 * shell uses the same pattern but with its own ref — this family
	 * stays usable standalone.
	 */
	const hiddenLabels = ref<Set<string>>(new Set())

	const seriesWithVisibility = computed<Array<IChartSeries>>(() =>
		activeSeries.value.map((s) => ({
			...s,
			visible: !hiddenLabels.value.has(s.name)
		}))
	)

	const chart = useChart({
		type: () => props.type,
		series: () => seriesWithVisibility.value,
		categories: () => activeCategories.value,
		stacked: () => false,
		donutHoleSize: () => props.donutHoleSize,
		colorScheme: () => props.colorScheme,
		smoothing: () => 'none',
		yMin: () => undefined,
		yMax: () => undefined,
		width: () => SVG_WIDTH,
		height: () => SVG_HEIGHT,
		padding: () => PADDING_POLAR,
		hiddenLabels: () => hiddenLabels.value
	})

	const { viewBox, paths, legend, slotCount } = chart

	/*********************************************************
	 * Hover / tooltip
	 ********************************************************/
	const hoveredPath = ref<IChartPath | null>(null)
	const hoveredPoint = computed<IChartPoint | null>(() => {
		const p = hoveredPath.value
		if (!p) return null
		const series = p.series
		const dataIdx = p.dataIndex ?? 0
		const entry = series.data[dataIdx]
		const x = typeof entry === 'number' ? (activeCategories.value[dataIdx] ?? dataIdx) : entry.x
		const y = typeof entry === 'number' ? entry : entry.y
		return {
			seriesIndex: p.seriesIndex,
			seriesName: series.name,
			dataIndex: dataIdx,
			x,
			y,
			color: p.color
		}
	})
	const hoveredSeries = computed<IChartSeries | null>(() =>
		hoveredPath.value?.series ?? null
	)
	const hoveredCategory = computed<string | number>(() => {
		if (!hoveredPoint.value) return ''
		return activeCategories.value[hoveredPoint.value.dataIndex] ?? hoveredPoint.value.x
	})

	const showEmpty = computed(() => {
		if (!activeSeries.value?.length) return true
		return activeSeries.value.every((s) => !s.data?.length || s.visible === false)
	})

	/*********************************************************
	 * Root classes / styles
	 ********************************************************/
	const rootClasses = computed(() => [
		{
			[`origam-chart-polar--${ props.type }`]: true,
			[`origam-chart-polar--legend-${ props.legendPosition }`]: true,
			'origam-chart-polar--no-animation': !props.animated
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
		'origam-chart-polar__body--with-side-legend': props.showLegend
			&& (props.legendPosition === 'left' || props.legendPosition === 'right')
	}))

	const svgClasses = computed(() => ({
		'origam-chart__svg--animated': props.animated
	}))

	const hasTitleBlock = computed(() => Boolean(props.title || props.subtitle))

	const formatY = (value: number): string => {
		if (props.yAxisFormat) return props.yAxisFormat(value)
		return String(value)
	}

	/*********************************************************
	 * Interaction
	 ********************************************************/
	const onPointEnter = (path: IChartPath) => {
		hoveredPath.value = path
		if (hoveredPoint.value) chart.onPointHover(hoveredPoint.value)
	}

	const onPointLeaveEvent = () => {
		hoveredPath.value = null
		chart.onPointHover(null)
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
		onPointLeaveEvent()
	}

	const onPointActivate = (path: IChartPath, event: MouseEvent | KeyboardEvent) => {
		if (!hoveredPoint.value || hoveredPath.value !== path) {
			hoveredPath.value = path
		}
		if (!hoveredPoint.value) return

		const currentPoint = hoveredPoint.value

		if (hasDrilldown.value) {
			const dataIdx = path.dataIndex ?? 0
			const entry = path.series.data[dataIdx]
			const drillLink = (typeof entry !== 'number')
				? (entry as IChartSeriesPoint).drilldown
				: undefined
			if (drillLink) {
				onDrillIn(drillLink, currentPoint)
				return
			}
		}

		emit('point-click', currentPoint, event)
	}

	const onLegendClick = (series: IChartSeries, index: number): void => {
		emit('legend-click', series, index)
	}

	const onSeriesToggle = (series: IChartSeries, nextVisible: boolean): void => {
		if (nextVisible) hiddenLabels.value.delete(series.name)
		else hiddenLabels.value.add(series.name)
		emit('series-toggle', series, nextVisible)
	}

	/*********************************************************
	 * ARIA
	 ********************************************************/
	const ariaLabel = computed(() => props.title ?? 'Chart')
	const svgAriaLabel = computed(() => props.title ?? `${ props.type } chart`)
	const svgTitle = computed(() => props.title ?? `${ props.type } chart`)
	const svgDesc = computed(() => {
		const seriesCount = activeSeries.value.length
		if (!seriesCount) return 'No data'
		const points = slotCount.value
		return `${ props.type } chart with ${ seriesCount } series and ${ points } ${ points === 1 ? 'point' : 'points' }.`
	})

	const sliceAriaLabel = (path: IChartPath) => {
		const idx = path.dataIndex ?? 0
		const entry = path.series.data[idx] ?? path.series.data[0]
		const y = entry == null
			? NaN
			: typeof entry === 'number'
				? entry
				: entry.y
		const cat = activeCategories.value[idx] ?? path.series.name ?? idx
		return `${ cat }: ${ formatY(y) }`
	}
</script>

<style
		lang="scss"
		scoped
>
	.origam-chart-polar {
		$this: &;

		display: grid;
		gap: var(--origam-chart---gap, 12px);
		padding: var(--origam-chart---padding, 12px);
		background-color: var(--origam-chart---background-color, transparent);
		color: var(--origam-chart---color, inherit);
		width: 100%;
		box-sizing: border-box;
		grid-template-rows: auto auto 1fr auto;
		grid-template-columns: 1fr;
		grid-template-areas:
			"header"
			"breadcrumb"
			"body"
			"legend";

		&--legend-top {
			grid-template-areas:
				"header"
				"breadcrumb"
				"legend"
				"body";
			grid-template-rows: auto auto auto 1fr;
		}

		&--legend-bottom {
			grid-template-areas:
				"header"
				"breadcrumb"
				"body"
				"legend";
			grid-template-rows: auto auto 1fr auto;
		}

		&--legend-left {
			grid-template-columns: auto minmax(0, 1fr);
			grid-template-rows: auto auto minmax(0, 1fr);
			grid-template-areas:
				"header header"
				"breadcrumb breadcrumb"
				"legend body";
		}

		&--legend-right {
			grid-template-columns: minmax(0, 1fr) auto;
			grid-template-rows: auto auto minmax(0, 1fr);
			grid-template-areas:
				"header header"
				"breadcrumb breadcrumb"
				"body legend";
		}

		&__header {
			grid-area: header;
			display: flex;
			flex-direction: column;
			gap: 4px;
		}

		&__breadcrumb {
			grid-area: breadcrumb;
			display: flex;
			align-items: center;
			gap: var(--origam-chart__breadcrumb---gap, 8px);
			font-size: var(--origam-chart__breadcrumb---font-size, 0.8125rem);
			color: var(--origam-chart__breadcrumb---color, var(--origam-color-text-secondary, #6b7280));
		}

		&__breadcrumb-back {
			display: inline-flex;
			align-items: center;
			gap: 4px;
			padding: 4px 10px;
			border: 1px solid var(--origam-chart__breadcrumb-back---border-color, var(--origam-color-border-default, #d1d5db));
			border-radius: var(--origam-chart__breadcrumb-back---border-radius, 4px);
			background-color: var(--origam-chart__breadcrumb-back---background-color, transparent);
			color: var(--origam-chart__breadcrumb-back---color, inherit);
			font-size: inherit;
			cursor: pointer;
			white-space: nowrap;
			transition: background-color 120ms ease, border-color 120ms ease;

			&:hover,
			&:focus-visible {
				background-color: var(--origam-chart__breadcrumb-back---hover-background-color, rgba(0, 0, 0, 0.05));
				outline: none;
			}
		}

		&__breadcrumb-trail {
			display: flex;
			align-items: center;
			gap: 4px;
			list-style: none;
			margin: 0;
			padding: 0;
			flex-wrap: wrap;
		}

		&__breadcrumb-item {
			display: flex;
			align-items: center;
			gap: 4px;

			&:not(:last-child)::after {
				content: "/";
				opacity: 0.5;
			}
		}

		&__breadcrumb-link {
			background: none;
			border: none;
			padding: 0;
			color: var(--origam-chart__breadcrumb-link---color, var(--origam-color-action-primary-text, #3b82f6));
			font-size: inherit;
			cursor: pointer;
			text-decoration: underline;
			text-underline-offset: 2px;

			&:hover,
			&:focus-visible {
				opacity: 0.8;
				outline: none;
			}
		}

		&__breadcrumb-current {
			font-weight: var(--origam-chart__breadcrumb-current---font-weight, 600);
			color: var(--origam-chart__breadcrumb-current---color, inherit);
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

		.origam-chart__slice {
			stroke: var(--origam-chart__pie---stroke-color, var(--origam-color-surface-default, #ffffff));
			stroke-width: var(--origam-chart__pie---stroke-width, 2);
			cursor: pointer;
			transition: transform 150ms ease;

			&:hover,
			&:focus-visible {
				outline: none;
				transform: scale(1.03);
				transform-origin: center;
			}
		}

		.origam-chart__svg--animated .origam-chart__slice {
			transform-origin: center;
			animation: origam-chart-polar-fade var(--origam-chart---animation-duration, 600ms) ease-out both;
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

		&--no-animation .origam-chart__slice {
			animation: none;
		}
	}

	@keyframes origam-chart-polar-fade {
		from { opacity: 0; transform: scale(0.8); }
		to { opacity: 1; transform: scale(1); }
	}

	@media (prefers-reduced-motion: reduce) {
		.origam-chart-polar .origam-chart__svg--animated .origam-chart__slice {
			animation: none;
		}
	}
</style>
