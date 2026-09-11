<template>
	<div
			class="origam-chart-radar"
			:class="rootClasses"
			:style="[rootStyles, dimensionStyles, marginStyles, paddingStyles, backgroundColorStyles, elevationStyles, roundedStyles, headerTypographyStyles]"
			role="figure"
			:aria-label="ariaLabel"
			data-cy="origam-chart-radar"
	>
		<div
				v-if="hasTitleBlock"
				class="origam-chart-radar__header"
				data-cy="origam-chart-radar-header"
		>
			<slot name="title">
				<div
						v-if="title"
						class="origam-chart-radar__title"
				>
					{{ title }}
				</div>
				<div
						v-if="subtitle"
						class="origam-chart-radar__subtitle"
				>
					{{ subtitle }}
				</div>
			</slot>
		</div>

		<div
				class="origam-chart-radar__body"
				:class="bodyClasses"
				data-cy="origam-chart-radar-body"
		>
			<svg
					ref="svgRef"
					class="origam-chart-radar__svg origam-chart__svg"
					:class="svgClasses"
					:viewBox="viewBox"
					role="img"
					:aria-label="svgAriaLabel"
					preserveAspectRatio="xMidYMid meet"
					data-cy="origam-chart-radar-svg"
			>
				<title>{{ svgTitle }}</title>
				<desc>{{ svgDesc }}</desc>

				<g class="origam-chart__radar-axes">
					<polygon
							v-for="ring in RADAR_RINGS"
							:key="`r-${ ring }`"
							class="origam-chart__radar-ring"
							:points="ringPointsFor(ring)"
					/>
					<line
							v-for="(_, i) in spokes"
							:key="`s-${ i }`"
							class="origam-chart__radar-spoke"
							:x1="plot.cx"
							:y1="plot.cy"
							:x2="spokeEnd(i).x"
							:y2="spokeEnd(i).y"
					/>
					<text
							v-for="(label, i) in spokes"
							:key="`sl-${ i }`"
							class="origam-chart__radar-label"
							:x="labelPos(i).x"
							:y="labelPos(i).y"
							text-anchor="middle"
							dominant-baseline="middle"
					>
						{{ label }}
					</text>
				</g>

				<g
						class="origam-chart__series"
						data-cy="origam-chart-radar-series"
				>
					<template
							v-for="(path, i) in paths"
							:key="`p-${ i }`"
					>
						<polygon
								v-if="path.kind === 'polygon'"
								class="origam-chart__polygon"
								:points="polygonPoints(path.d!)"
								:stroke="path.color"
								:fill="path.color"
								fill-opacity="0.18"
						/>
						<circle
								v-else-if="path.kind === 'circle'"
								class="origam-chart__point"
								:cx="path.circle!.cx"
								:cy="path.circle!.cy"
								:r="path.circle!.r"
								:fill="path.color"
								:aria-label="pointAriaLabel(path)"
								:data-cy="`origam-chart-point-${ path.seriesIndex }-${ path.dataIndex }`"
						/>
					</template>
				</g>
			</svg>

			<div
					v-if="showEmpty"
					class="origam-chart-radar__empty origam-chart__empty"
					data-cy="origam-chart-radar-empty"
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

	import OrigamChartLegend from './OrigamChartLegend.vue'

	import type {
		IChartBaseEmits,
		IChartPath,
		IChartRadarProps,
		IChartSeries
	} from '../../interfaces'

	/*********************************************************
	 * Global
	 *
	 * @description
	 * Radar (spider) chart family — concentric polygon rings,
	 * spokes from the centre to each axis label, and one filled
	 * polygon per series.
	 *
	 * Cartesian X/Y axes don't apply here — the chart paints into
	 * angular coordinates. The legend stays standard.
	 ********************************************************/
	defineOptions({
		name: 'OrigamChartRadar'
	})

	const props = withDefaults(defineProps<IChartRadarProps>(), {
		categories: () => [],
		height: 300,
		title: undefined,
		subtitle: undefined,
		showLegend: true,
		legendPosition: 'bottom',
		animated: true,
		animationDuration: 600,
		colorScheme: () => [],
		aspectRatio: undefined
	})

	const emit = defineEmits<IChartBaseEmits>()

	const { dimensionStyles } = useDimension(props)
	const { backgroundColorClasses, backgroundColorStyles } = useBackgroundColor(props, 'bgColor')
	const { elevationClasses, elevationStyles } = useElevation(props)
	const { marginClasses, marginStyles } = useMargin(props)
	const { paddingClasses, paddingStyles } = usePadding(props)
	const { roundedClasses, roundedStyles } = useRounded(props)
	const { headerTypographyStyles } = useChartHeaderTypography(props)

	const SVG_WIDTH = 600
	const SVG_HEIGHT = 360
	const PADDING_RADAR = { top: 20, right: 20, bottom: 20, left: 20 }
	const RADAR_RINGS = [0.25, 0.5, 0.75, 1]

	const svgRef = ref<SVGSVGElement | null>(null)

	const chart = useChart({
		type: () => 'radar',
		series: () => props.series,
		categories: () => props.categories,
		stacked: () => false,
		donutHoleSize: () => 0,
		colorScheme: () => props.colorScheme,
		smoothing: () => 'none',
		yMin: () => undefined,
		yMax: () => undefined,
		width: () => SVG_WIDTH,
		height: () => SVG_HEIGHT,
		padding: () => PADDING_RADAR
	})

	const { viewBox, paths, legend, plot, slotCount } = chart

	/*********************************************************
	 * Spoke geometry
	 ********************************************************/
	const spokes = computed(() =>
		props.categories.length
			? props.categories
			: props.series[0]?.data.map((_, i) => String(i)) ?? []
	)

	const outerRadius = computed(() =>
		Math.max(
			10,
			Math.min(plot.value.x1 - plot.value.x0, plot.value.y1 - plot.value.y0) / 2 - 8
		)
	)

	const spokeEnd = (i: number) => {
		const r = outerRadius.value
		const angle = (i / Math.max(1, spokes.value.length)) * Math.PI * 2 - Math.PI / 2
		return {
			x: plot.value.cx + r * Math.cos(angle),
			y: plot.value.cy + r * Math.sin(angle)
		}
	}

	const labelPos = (i: number) => {
		const r = outerRadius.value + 14
		const angle = (i / Math.max(1, spokes.value.length)) * Math.PI * 2 - Math.PI / 2
		return {
			x: plot.value.cx + r * Math.cos(angle),
			y: plot.value.cy + r * Math.sin(angle)
		}
	}

	const ringPointsFor = (ratio: number): string => {
		const r = outerRadius.value * ratio
		const slots = Math.max(1, spokes.value.length)
		const pts: Array<string> = []
		for (let i = 0; i < slots; i++) {
			const angle = (i / slots) * Math.PI * 2 - Math.PI / 2
			const x = plot.value.cx + r * Math.cos(angle)
			const y = plot.value.cy + r * Math.sin(angle)
			pts.push(`${ x },${ y }`)
		}
		return pts.join(' ')
	}

	const polygonPoints = (d: string): string =>
		d.replace(/[MLZ]/g, ' ').split(/\s+/).filter(Boolean).join(' ')

	/*********************************************************
	 * Empty / classes / styles / ARIA
	 ********************************************************/
	const showEmpty = computed(() => {
		if (!props.series?.length) return true
		return props.series.every((s) => !s.data?.length || s.visible === false)
	})

	const rootClasses = computed(() => [
		{
			[`origam-chart-radar--legend-${ props.legendPosition }`]: true,
			'origam-chart-radar--no-animation': !props.animated
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
		'origam-chart-radar__body--with-side-legend': props.showLegend
			&& (props.legendPosition === 'left' || props.legendPosition === 'right')
	}))

	const svgClasses = computed(() => ({
		'origam-chart__svg--animated': props.animated
	}))

	const hasTitleBlock = computed(() => Boolean(props.title || props.subtitle))

	const ariaLabel = computed(() => props.title ?? 'Radar chart')
	const svgAriaLabel = computed(() => props.title ?? 'radar chart')
	const svgTitle = computed(() => props.title ?? 'radar chart')
	const svgDesc = computed(() => {
		const seriesCount = props.series.length
		if (!seriesCount) return 'No data'
		const points = slotCount.value
		return `radar chart with ${ seriesCount } series and ${ points } axes.`
	})

	const pointAriaLabel = (path: IChartPath) => {
		const entry = path.series.data[path.dataIndex ?? 0]
		const y = typeof entry === 'number' ? entry : entry.y
		const cat = props.categories[path.dataIndex ?? 0] ?? path.dataIndex
		return `${ path.series.name }, ${ cat }: ${ y }`
	}

	const onLegendClick = (series: IChartSeries, index: number): void => {
		emit('legend-click', series, index)
	}

	const onSeriesToggle = (series: IChartSeries, nextVisible: boolean): void => {
		series.visible = nextVisible
		emit('series-toggle', series, nextVisible)
	}
</script>

<style
		lang="scss"
		scoped
>
	.origam-chart-radar {
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

		.origam-chart__radar-ring,
		.origam-chart__radar-spoke {
			fill: none;
			stroke: var(--origam-chart__grid---color, var(--origam-color-border-subtle, #e5e7eb));
			stroke-width: 1;
		}

		.origam-chart__radar-label {
			fill: var(--origam-chart__axis-label---color, var(--origam-color-text-secondary, #6b7280));
			font-size: var(--origam-chart__axis-label---font-size, 0.75rem);
		}

		.origam-chart__polygon {
			stroke-width: var(--origam-chart__polygon---stroke-width, 1.5);
		}

		.origam-chart__point {
			cursor: pointer;
		}

		.origam-chart__svg--animated .origam-chart__polygon,
		.origam-chart__svg--animated .origam-chart__point {
			animation: origam-chart-radar-fade var(--origam-chart---animation-duration, 600ms) ease-out both;
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

		&--no-animation .origam-chart__polygon,
		&--no-animation .origam-chart__point {
			animation: none;
		}
	}

	@keyframes origam-chart-radar-fade {
		from { opacity: 0; }
		to { opacity: 1; }
	}

	@media (prefers-reduced-motion: reduce) {
		.origam-chart-radar .origam-chart__svg--animated .origam-chart__polygon,
		.origam-chart-radar .origam-chart__svg--animated .origam-chart__point {
			animation: none;
		}
	}
</style>
