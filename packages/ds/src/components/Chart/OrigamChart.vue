<template>
	<origam-chart-cartesian
			v-if="isCartesianType"
			v-bind="cartesianProps"
			:data-cy="dataCyAttr"
			@point-click="onPointClick"
			@legend-click="onLegendClick"
			@series-toggle="onSeriesToggle"
	>
		<template
				v-for="(_, name) in $slots"
				#[name]="slotBindings"
		>
			<slot
					:name="name"
					v-bind="slotBindings ?? {}"
			/>
		</template>
	</origam-chart-cartesian>

	<origam-chart-polar
			v-else-if="isPolarType"
			v-bind="polarProps"
			:data-cy="dataCyAttr"
			@point-click="onPointClick"
			@legend-click="onLegendClick"
			@series-toggle="onSeriesToggle"
	>
		<template
				v-for="(_, name) in $slots"
				#[name]="slotBindings"
		>
			<slot
					:name="name"
					v-bind="slotBindings ?? {}"
			/>
		</template>
	</origam-chart-polar>

	<origam-chart-radar
			v-else-if="isRadarType"
			v-bind="radarProps"
			:data-cy="dataCyAttr"
			@point-click="onPointClick"
			@legend-click="onLegendClick"
			@series-toggle="onSeriesToggle"
	>
		<template
				v-for="(_, name) in $slots"
				#[name]="slotBindings"
		>
			<slot
					:name="name"
					v-bind="slotBindings ?? {}"
			/>
		</template>
	</origam-chart-radar>

	<origam-chart-gauge
			v-else-if="isGaugeType"
			v-bind="gaugeProps"
			:data-cy="dataCyAttr"
			@point-click="onPointClick"
			@legend-click="onLegendClick"
			@series-toggle="onSeriesToggle"
	>
		<template
				v-for="(_, name) in $slots"
				#[name]="slotBindings"
		>
			<slot
					:name="name"
					v-bind="slotBindings ?? {}"
			/>
		</template>
	</origam-chart-gauge>

	<origam-chart-pyramid
			v-else-if="isPyramidType"
			v-bind="pyramidProps"
			:data-cy="dataCyAttr"
			@point-click="onPointClick"
			@legend-click="onLegendClick"
			@series-toggle="onSeriesToggle"
	>
		<template
				v-for="(_, name) in $slots"
				#[name]="slotBindings"
		>
			<slot
					:name="name"
					v-bind="slotBindings ?? {}"
			/>
		</template>
	</origam-chart-pyramid>

	<origam-chart-honeycomb
			v-else-if="isHoneycombType"
			v-bind="honeycombProps"
			:data-cy="dataCyAttr"
			@point-click="onPointClick"
			@legend-click="onLegendClick"
			@series-toggle="onSeriesToggle"
	>
		<template
				v-for="(_, name) in $slots"
				#[name]="slotBindings"
		>
			<slot
					:name="name"
					v-bind="slotBindings ?? {}"
			/>
		</template>
	</origam-chart-honeycomb>

	<origam-chart-treemap
			v-else-if="isTreemapType"
			v-bind="treemapProps"
			:data-cy="dataCyAttr"
			@point-click="onPointClick"
			@legend-click="onLegendClick"
			@series-toggle="onSeriesToggle"
	>
		<template
				v-for="(_, name) in $slots"
				#[name]="slotBindings"
		>
			<slot
					:name="name"
					v-bind="slotBindings ?? {}"
			/>
		</template>
	</origam-chart-treemap>

	<origam-chart-sankey
			v-else-if="isSankeyType"
			v-bind="sankeyProps"
			:data-cy="dataCyAttr"
			@point-click="onPointClick"
			@legend-click="onLegendClick"
			@series-toggle="onSeriesToggle"
	>
		<template
				v-for="(_, name) in $slots"
				#[name]="slotBindings"
		>
			<slot
					:name="name"
					v-bind="slotBindings ?? {}"
			/>
		</template>
	</origam-chart-sankey>

	<origam-chart-word-cloud
			v-else-if="isWordCloudType"
			v-bind="wordCloudProps"
			:data-cy="dataCyAttr"
			@point-click="onPointClick"
			@legend-click="onLegendClick"
			@series-toggle="onSeriesToggle"
	>
		<template
				v-for="(_, name) in $slots"
				#[name]="slotBindings"
		>
			<slot
					:name="name"
					v-bind="slotBindings ?? {}"
			/>
		</template>
	</origam-chart-word-cloud>

	<origam-chart-heatmap
			v-else-if="isHeatmapType"
			v-bind="heatmapProps"
			:data-cy="dataCyAttr"
			@point-click="onPointClick"
			@legend-click="onLegendClick"
			@series-toggle="onSeriesToggle"
	>
		<template
				v-for="(_, name) in $slots"
				#[name]="slotBindings"
		>
			<slot
					:name="name"
					v-bind="slotBindings ?? {}"
			/>
		</template>
	</origam-chart-heatmap>

	<origam-chart-sunburst
			v-else-if="isSunburstType"
			v-bind="sunburstProps"
			:data-cy="dataCyAttr"
			@point-click="onPointClick"
			@legend-click="onLegendClick"
			@series-toggle="onSeriesToggle"
	>
		<template
				v-for="(_, name) in $slots"
				#[name]="slotBindings"
		>
			<slot
					:name="name"
					v-bind="slotBindings ?? {}"
			/>
		</template>
	</origam-chart-sunburst>

	<origam-chart-box-plot
			v-else-if="isBoxPlotType"
			v-bind="boxPlotProps"
			:data-cy="dataCyAttr"
			@point-click="onPointClick"
			@legend-click="onLegendClick"
			@series-toggle="onSeriesToggle"
	>
		<template
				v-for="(_, name) in $slots"
				#[name]="slotBindings"
		>
			<slot
					:name="name"
					v-bind="slotBindings ?? {}"
			/>
		</template>
	</origam-chart-box-plot>

	<origam-chart-pictorial
			v-else-if="isPictorialType"
			v-bind="pictorialProps"
			:data-cy="dataCyAttr"
			@point-click="onPointClick"
			@legend-click="onLegendClick"
			@series-toggle="onSeriesToggle"
	>
		<template
				v-for="(_, name) in $slots"
				#[name]="slotBindings"
		>
			<slot
					:name="name"
					v-bind="slotBindings ?? {}"
			/>
		</template>
	</origam-chart-pictorial>

	<origam-chart-candlestick
			v-else-if="isCandlestickType"
			v-bind="candlestickProps"
			:data-cy="dataCyAttr"
			@point-click="onPointClick"
			@legend-click="onLegendClick"
			@series-toggle="onSeriesToggle"
	>
		<template
				v-for="(_, name) in $slots"
				#[name]="slotBindings"
		>
			<slot
					:name="name"
					v-bind="slotBindings ?? {}"
			/>
		</template>
	</origam-chart-candlestick>

	<origam-chart-streamgraph
			v-else-if="isStreamgraphType"
			v-bind="streamgraphProps"
			:data-cy="dataCyAttr"
			@point-click="onPointClick"
			@legend-click="onLegendClick"
			@series-toggle="onSeriesToggle"
	>
		<template
				v-for="(_, name) in $slots"
				#[name]="slotBindings"
		>
			<slot
					:name="name"
					v-bind="slotBindings ?? {}"
			/>
		</template>
	</origam-chart-streamgraph>

	<origam-chart-variwide
			v-else-if="isVariwideType"
			v-bind="variwideProps"
			:data-cy="dataCyAttr"
			@point-click="onPointClick"
			@legend-click="onLegendClick"
			@series-toggle="onSeriesToggle"
	>
		<template
				v-for="(_, name) in $slots"
				#[name]="slotBindings"
		>
			<slot
					:name="name"
					v-bind="slotBindings ?? {}"
			/>
		</template>
	</origam-chart-variwide>

	<origam-chart-polar-bar
			v-else-if="isPolarBarType"
			v-bind="polarBarProps"
			:data-cy="dataCyAttr"
			@point-click="onPointClick"
			@legend-click="onLegendClick"
			@series-toggle="onSeriesToggle"
	>
		<template
				v-for="(_, name) in $slots"
				#[name]="slotBindings"
		>
			<slot
					:name="name"
					v-bind="slotBindings ?? {}"
			/>
		</template>
	</origam-chart-polar-bar>

	<origam-chart-bullet
			v-else-if="isBulletType"
			v-bind="bulletProps"
			:data-cy="dataCyAttr"
			@point-click="onPointClick"
			@legend-click="onLegendClick"
			@series-toggle="onSeriesToggle"
	>
		<template
				v-for="(_, name) in $slots"
				#[name]="slotBindings"
		>
			<slot
					:name="name"
					v-bind="slotBindings ?? {}"
			/>
		</template>
	</origam-chart-bullet>

	<origam-chart-pareto
			v-else-if="isParetoType"
			v-bind="paretoProps"
			:data-cy="dataCyAttr"
			@point-click="onPointClick"
			@legend-click="onLegendClick"
			@series-toggle="onSeriesToggle"
	>
		<template
				v-for="(_, name) in $slots"
				#[name]="slotBindings"
		>
			<slot
					:name="name"
					v-bind="slotBindings ?? {}"
			/>
		</template>
	</origam-chart-pareto>

	<origam-chart-map
			v-else-if="isMapType"
			v-bind="mapProps"
			:data-cy="dataCyAttr"
			@point-click="onPointClick"
			@legend-click="onLegendClick"
			@series-toggle="onSeriesToggle"
	>
		<template
				v-for="(_, name) in $slots"
				#[name]="slotBindings"
		>
			<slot
					:name="name"
					v-bind="slotBindings ?? {}"
			/>
		</template>
	</origam-chart-map>

	<origam-chart-sparkline
			v-else-if="isSparklineType"
			v-bind="sparklineProps"
			:data-cy="dataCyAttr"
			@point-click="onPointClick"
			@legend-click="onLegendClick"
			@series-toggle="onSeriesToggle"
	>
		<template
				v-for="(_, name) in $slots"
				#[name]="slotBindings"
		>
			<slot
					:name="name"
					v-bind="slotBindings ?? {}"
			/>
		</template>
	</origam-chart-sparkline>
</template>

<script
		lang="ts"
		setup
>
	import { computed, ref } from 'vue'

	import OrigamChartCartesian from './OrigamChartCartesian.vue'
	import OrigamChartGauge from './OrigamChartGauge.vue'
	import OrigamChartHoneycomb from './OrigamChartHoneycomb.vue'
	import OrigamChartPolar from './OrigamChartPolar.vue'
	import OrigamChartPyramid from './OrigamChartPyramid.vue'
	import OrigamChartRadar from './OrigamChartRadar.vue'
	import OrigamChartBoxPlot from './OrigamChartBoxPlot.vue'
	import OrigamChartCandlestick from './OrigamChartCandlestick.vue'
	import OrigamChartHeatmap from './OrigamChartHeatmap.vue'
	import OrigamChartPictorial from './OrigamChartPictorial.vue'
	import OrigamChartSankey from './OrigamChartSankey.vue'
	import OrigamChartStreamgraph from './OrigamChartStreamgraph.vue'
	import OrigamChartBullet from './OrigamChartBullet.vue'
	import OrigamChartMap from './OrigamChartMap.vue'
	import OrigamChartPareto from './OrigamChartPareto.vue'
	import OrigamChartSparkline from './OrigamChartSparkline.vue'
	import OrigamChartPolarBar from './OrigamChartPolarBar.vue'
	import OrigamChartVariwide from './OrigamChartVariwide.vue'
	import OrigamChartSunburst from './OrigamChartSunburst.vue'
	import OrigamChartTreemap from './OrigamChartTreemap.vue'
	import OrigamChartWordCloud from './OrigamChartWordCloud.vue'

	import {
		CHART_CARTESIAN_KIND,
		CHART_POLAR_KIND,
		CHART_PYRAMID_KIND,
		CHART_TYPE
	} from '../../enums'

	import type {
		IChartPoint,
		IChartProps,
		IChartSeries
	} from '../../interfaces'

	import type {
		IChartEmits
	} from '../../interfaces/Chart/chart.interface'

	import type {
		TChartCartesianKind,
		TChartPolarKind,
		TChartPyramidKind
	} from '../../types'

	/*********************************************************
	 * Global
	 *
	 * @description
	 * Shell + dispatcher. Owns the public `<OrigamChart>` API
	 * (`type`, `series`, `categories`, …) and routes to one of
	 * four family components based on `props.type`:
	 *
	 * - cartesian (line/area/bar/column/scatter/spline/stepped-line)
	 *   -> `<OrigamChartCartesian>`
	 * - polar (pie/donut) -> `<OrigamChartPolar>` (no axes, no grid)
	 * - radar -> `<OrigamChartRadar>` (rings + spokes + polygons)
	 * - gauge -> `<OrigamChartGauge>` (solid radial indicator)
	 *
	 * Family components are exported too, so consumers can skip
	 * the dispatcher and use a tightly-typed surface directly.
	 * The shell exists to:
	 *   1. preserve the legacy `<OrigamChart type="…">` API,
	 *   2. let consumers swap types at runtime without remounting,
	 *   3. centralise the "which family handles which type" mapping.
	 *
	 * `withDefaults` literals only, per CLAUDE.md.
	 ********************************************************/
	defineOptions({
		name: 'OrigamChart'
	})

	const props = withDefaults(defineProps<IChartProps>(), {
		type: 'line',
		categories: () => [],
		height: 300,
		title: undefined,
		subtitle: undefined,
		showLegend: true,
		legendPosition: 'bottom',
		showTooltip: true,
		showGrid: true,
		showAxis: true,
		animated: true,
		animationDuration: 600,
		stacked: false,
		donutHoleSize: 0.6,
		colorScheme: () => [],
		xAxisFormat: undefined,
		yAxisFormat: undefined,
		aspectRatio: undefined,
		smoothing: 'none',
		yMin: undefined,
		yMax: undefined,
		gaugeMin: 0,
		gaugeMax: 100,
		gaugeUnit: ''
	})

	const emit = defineEmits<IChartEmits>()

	/*********************************************************
	 * Type routing — each `CHART_TYPE` value maps to exactly
	 * one family component. The arrays are derived from the
	 * enums so adding a new chart type only requires one edit
	 * to the enum.
	 ********************************************************/
	const CARTESIAN_TYPES: Array<string> = Object.values(CHART_CARTESIAN_KIND)
	const POLAR_TYPES: Array<string> = Object.values(CHART_POLAR_KIND)
	const PYRAMID_TYPES: Array<string> = Object.values(CHART_PYRAMID_KIND)

	const isCartesianType = computed(() => CARTESIAN_TYPES.includes(props.type))
	const isPolarType = computed(() => POLAR_TYPES.includes(props.type))
	const isRadarType = computed(() => props.type === CHART_TYPE.RADAR)
	const isGaugeType = computed(() => props.type === CHART_TYPE.GAUGE)
	const isPyramidType = computed(() => PYRAMID_TYPES.includes(props.type))
	const isHoneycombType = computed(() => props.type === CHART_TYPE.HONEYCOMB)
	const isTreemapType = computed(() => props.type === CHART_TYPE.TREEMAP)
	const isSankeyType = computed(() => props.type === CHART_TYPE.SANKEY)
	const isWordCloudType = computed(() => props.type === CHART_TYPE.WORD_CLOUD)
	const isHeatmapType = computed(() => props.type === CHART_TYPE.HEATMAP)
	const isSunburstType = computed(() => props.type === CHART_TYPE.SUNBURST)
	const isBoxPlotType = computed(() => props.type === CHART_TYPE.BOX_PLOT)
	const isPictorialType = computed(() => props.type === CHART_TYPE.PICTORIAL)
	const isCandlestickType = computed(() => props.type === CHART_TYPE.CANDLESTICK)
	const isStreamgraphType = computed(() => props.type === CHART_TYPE.STREAMGRAPH)
	const isVariwideType = computed(() => props.type === CHART_TYPE.VARIWIDE)
	const isPolarBarType = computed(() => props.type === CHART_TYPE.POLAR_BAR)
	const isBulletType = computed(() => props.type === CHART_TYPE.BULLET)
	const isParetoType = computed(() => props.type === CHART_TYPE.PARETO)
	const isMapType = computed(() => props.type === CHART_TYPE.MAP)
	const isSparklineType = computed(() => props.type === CHART_TYPE.SPARKLINE)

	const dataCyAttr = computed(() => `origam-chart origam-chart--${ props.type }`)

	/*********************************************************
	 * Forwarded props — each family has a slightly narrower
	 * prop surface than the shell. We compose only the props
	 * that family understands, so Vue's prop validator stays
	 * happy and irrelevant props (e.g. `smoothing` on a gauge)
	 * are silently dropped.
	 ********************************************************/
	const cartesianProps = computed(() => ({
		type: props.type as TChartCartesianKind,
		series: seriesWithVisibility.value,
		categories: props.categories,
		height: props.height,
		title: props.title,
		subtitle: props.subtitle,
		showLegend: props.showLegend,
		legendPosition: props.legendPosition,
		showTooltip: props.showTooltip,
		showGrid: props.showGrid,
		showAxis: props.showAxis,
		animated: props.animated,
		animationDuration: props.animationDuration,
		stacked: props.stacked,
		stacking: props.stacking,
		colorScheme: props.colorScheme,
		xAxisFormat: props.xAxisFormat,
		yAxisFormat: props.yAxisFormat,
		aspectRatio: props.aspectRatio,
		smoothing: props.smoothing,
		yMin: props.yMin,
		yMax: props.yMax,
		plotBands: props.plotBands,
		plotLines: props.plotLines,
		annotations: props.annotations,
		secondaryYAxis: props.secondaryYAxis,
		drilldown: props.drilldown
	}))

	const polarProps = computed(() => ({
		type: props.type as TChartPolarKind,
		series: seriesWithVisibility.value,
		categories: props.categories,
		height: props.height,
		title: props.title,
		subtitle: props.subtitle,
		showLegend: props.showLegend,
		legendPosition: props.legendPosition,
		showTooltip: props.showTooltip,
		animated: props.animated,
		animationDuration: props.animationDuration,
		donutHoleSize: props.donutHoleSize,
		colorScheme: props.colorScheme,
		xAxisFormat: props.xAxisFormat,
		yAxisFormat: props.yAxisFormat,
		aspectRatio: props.aspectRatio,
		drilldown: props.drilldown
	}))

	const radarProps = computed(() => ({
		series: seriesWithVisibility.value,
		categories: props.categories,
		height: props.height,
		title: props.title,
		subtitle: props.subtitle,
		showLegend: props.showLegend,
		legendPosition: props.legendPosition,
		animated: props.animated,
		animationDuration: props.animationDuration,
		colorScheme: props.colorScheme,
		aspectRatio: props.aspectRatio
	}))

	const gaugeProps = computed(() => ({
		series: seriesWithVisibility.value,
		categories: props.categories,
		height: props.height,
		title: props.title,
		subtitle: props.subtitle,
		showLegend: false,
		legendPosition: props.legendPosition,
		showTooltip: false,
		animated: props.animated,
		animationDuration: props.animationDuration,
		colorScheme: props.colorScheme,
		aspectRatio: props.aspectRatio,
		gaugeMin: props.gaugeMin,
		gaugeMax: props.gaugeMax,
		gaugeUnit: props.gaugeUnit
	}))

	const pyramidProps = computed(() => ({
		type: props.type as TChartPyramidKind,
		series: seriesWithVisibility.value,
		categories: props.categories,
		height: props.height,
		title: props.title,
		subtitle: props.subtitle,
		showLegend: props.showLegend,
		legendPosition: props.legendPosition,
		showTooltip: props.showTooltip,
		animated: props.animated,
		animationDuration: props.animationDuration,
		colorScheme: props.colorScheme,
		aspectRatio: props.aspectRatio,
		xAxisFormat: props.xAxisFormat,
		yAxisFormat: props.yAxisFormat
	}))

	const honeycombProps = computed(() => ({
		series: seriesWithVisibility.value,
		height: props.height,
		title: props.title,
		subtitle: props.subtitle,
		showLegend: props.showLegend,
		legendPosition: props.legendPosition,
		showTooltip: props.showTooltip,
		animated: props.animated,
		animationDuration: props.animationDuration,
		colorScheme: props.colorScheme,
		aspectRatio: props.aspectRatio,
		xAxisFormat: props.xAxisFormat,
		yAxisFormat: props.yAxisFormat
	}))

	const treemapProps = computed(() => ({
		series: seriesWithVisibility.value,
		height: props.height,
		title: props.title,
		subtitle: props.subtitle,
		showLegend: props.showLegend,
		legendPosition: props.legendPosition,
		showTooltip: props.showTooltip,
		animated: props.animated,
		animationDuration: props.animationDuration,
		colorScheme: props.colorScheme,
		aspectRatio: props.aspectRatio,
		yAxisFormat: props.yAxisFormat
	}))

	const sankeyProps = computed(() => ({
		series: seriesWithVisibility.value,
		height: props.height,
		title: props.title,
		subtitle: props.subtitle,
		showLegend: props.showLegend,
		legendPosition: props.legendPosition,
		showTooltip: props.showTooltip,
		animated: props.animated,
		animationDuration: props.animationDuration,
		colorScheme: props.colorScheme,
		aspectRatio: props.aspectRatio,
		xAxisFormat: props.xAxisFormat,
		yAxisFormat: props.yAxisFormat
	}))

	const wordCloudProps = computed(() => ({
		series: seriesWithVisibility.value,
		height: props.height,
		title: props.title,
		subtitle: props.subtitle,
		showLegend: props.showLegend,
		legendPosition: props.legendPosition,
		showTooltip: props.showTooltip,
		animated: props.animated,
		animationDuration: props.animationDuration,
		colorScheme: props.colorScheme,
		aspectRatio: props.aspectRatio,
		yAxisFormat: props.yAxisFormat
	}))

	const heatmapProps = computed(() => ({
		series: seriesWithVisibility.value,
		height: props.height,
		title: props.title,
		subtitle: props.subtitle,
		showLegend: props.showLegend,
		legendPosition: props.legendPosition,
		showTooltip: props.showTooltip,
		showAxis: props.showAxis,
		animated: props.animated,
		animationDuration: props.animationDuration,
		colorScheme: props.colorScheme,
		aspectRatio: props.aspectRatio,
		xAxisFormat: props.xAxisFormat,
		yAxisFormat: props.yAxisFormat
	}))

	const sunburstProps = computed(() => ({
		series: seriesWithVisibility.value,
		height: props.height,
		title: props.title,
		subtitle: props.subtitle,
		showLegend: props.showLegend,
		legendPosition: props.legendPosition,
		showTooltip: props.showTooltip,
		animated: props.animated,
		animationDuration: props.animationDuration,
		colorScheme: props.colorScheme,
		aspectRatio: props.aspectRatio,
		yAxisFormat: props.yAxisFormat
	}))

	const boxPlotProps = computed(() => ({
		series: seriesWithVisibility.value,
		categories: props.categories,
		height: props.height,
		title: props.title,
		subtitle: props.subtitle,
		showLegend: props.showLegend,
		legendPosition: props.legendPosition,
		showTooltip: props.showTooltip,
		showAxis: props.showAxis,
		showGrid: props.showGrid,
		animated: props.animated,
		animationDuration: props.animationDuration,
		colorScheme: props.colorScheme,
		aspectRatio: props.aspectRatio,
		xAxisFormat: props.xAxisFormat,
		yAxisFormat: props.yAxisFormat,
		yMin: props.yMin,
		yMax: props.yMax
	}))

	const pictorialProps = computed(() => ({
		series: seriesWithVisibility.value,
		categories: props.categories,
		height: props.height,
		title: props.title,
		subtitle: props.subtitle,
		showLegend: props.showLegend,
		legendPosition: props.legendPosition,
		showTooltip: props.showTooltip,
		showAxis: props.showAxis,
		animated: props.animated,
		animationDuration: props.animationDuration,
		colorScheme: props.colorScheme,
		aspectRatio: props.aspectRatio,
		xAxisFormat: props.xAxisFormat,
		yAxisFormat: props.yAxisFormat
	}))

	const candlestickProps = computed(() => ({
		series: seriesWithVisibility.value,
		height: props.height,
		title: props.title,
		subtitle: props.subtitle,
		showLegend: props.showLegend,
		legendPosition: props.legendPosition,
		showTooltip: props.showTooltip,
		showAxis: props.showAxis,
		showGrid: props.showGrid,
		animated: props.animated,
		animationDuration: props.animationDuration,
		aspectRatio: props.aspectRatio,
		xAxisFormat: props.xAxisFormat,
		yAxisFormat: props.yAxisFormat,
		yMin: props.yMin,
		yMax: props.yMax
	}))

	const streamgraphProps = computed(() => ({
		series: seriesWithVisibility.value,
		categories: props.categories,
		height: props.height,
		title: props.title,
		subtitle: props.subtitle,
		showLegend: props.showLegend,
		legendPosition: props.legendPosition,
		showTooltip: props.showTooltip,
		showAxis: props.showAxis,
		showGrid: props.showGrid,
		animated: props.animated,
		animationDuration: props.animationDuration,
		colorScheme: props.colorScheme,
		aspectRatio: props.aspectRatio,
		xAxisFormat: props.xAxisFormat,
		yAxisFormat: props.yAxisFormat
	}))

	const variwideProps = computed(() => ({
		series: seriesWithVisibility.value,
		height: props.height,
		title: props.title,
		subtitle: props.subtitle,
		showLegend: props.showLegend,
		legendPosition: props.legendPosition,
		showTooltip: props.showTooltip,
		showAxis: props.showAxis,
		showGrid: props.showGrid,
		animated: props.animated,
		animationDuration: props.animationDuration,
		colorScheme: props.colorScheme,
		aspectRatio: props.aspectRatio,
		xAxisFormat: props.xAxisFormat,
		yAxisFormat: props.yAxisFormat,
		yMin: props.yMin,
		yMax: props.yMax
	}))

	const polarBarProps = computed(() => ({
		series: seriesWithVisibility.value,
		categories: props.categories,
		height: props.height,
		title: props.title,
		subtitle: props.subtitle,
		showLegend: props.showLegend,
		legendPosition: props.legendPosition,
		showTooltip: props.showTooltip,
		animated: props.animated,
		animationDuration: props.animationDuration,
		colorScheme: props.colorScheme,
		aspectRatio: props.aspectRatio,
		xAxisFormat: props.xAxisFormat,
		yAxisFormat: props.yAxisFormat
	}))

	const bulletProps = computed(() => ({
		series: seriesWithVisibility.value,
		categories: props.categories,
		height: props.height,
		title: props.title,
		subtitle: props.subtitle,
		showLegend: props.showLegend,
		legendPosition: props.legendPosition,
		showTooltip: props.showTooltip,
		showAxis: props.showAxis,
		animated: props.animated,
		animationDuration: props.animationDuration,
		aspectRatio: props.aspectRatio,
		xAxisFormat: props.xAxisFormat,
		yAxisFormat: props.yAxisFormat
	}))

	const paretoProps = computed(() => ({
		series: seriesWithVisibility.value,
		height: props.height,
		title: props.title,
		subtitle: props.subtitle,
		showLegend: props.showLegend,
		legendPosition: props.legendPosition,
		showTooltip: props.showTooltip,
		showAxis: props.showAxis,
		showGrid: props.showGrid,
		animated: props.animated,
		animationDuration: props.animationDuration,
		aspectRatio: props.aspectRatio,
		xAxisFormat: props.xAxisFormat,
		yAxisFormat: props.yAxisFormat
	}))

	const mapProps = computed(() => ({
		series: seriesWithVisibility.value,
		height: props.height,
		title: props.title,
		subtitle: props.subtitle,
		showLegend: props.showLegend,
		legendPosition: props.legendPosition,
		showTooltip: props.showTooltip,
		animated: props.animated,
		animationDuration: props.animationDuration,
		aspectRatio: props.aspectRatio,
		yAxisFormat: props.yAxisFormat
	}))

	const sparklineProps = computed(() => ({
		series: seriesWithVisibility.value,
		height: props.height,
		width: props.width,
		animated: props.animated,
		animationDuration: props.animationDuration,
		aspectRatio: props.aspectRatio
	}))

	/*********************************************************
	 * Emit forwarding — shell just relays.
	 ********************************************************/
	const onPointClick = (point: IChartPoint, originalEvent: MouseEvent | KeyboardEvent): void => {
		emit('point-click', point, originalEvent)
	}

	const onLegendClick = (series: IChartSeries, index: number): void => {
		emit('legend-click', series, index)
	}

	/*
	 * Legend toggle policy:
	 *
	 *   - The legend must show ALL series at all times (struck-through
	 *     when hidden) so the user can re-enable a previously hidden
	 *     series — filtering them out of the legend would trap the
	 *     consumer in a dead-end.
	 *
	 *   - The chart paths, however, must STOP rendering the hidden
	 *     series. `useChart` already gates path generation on
	 *     `series[i].visible !== false`; we just need to surface the
	 *     hidden state on each series via a cloned array.
	 *
	 * `hiddenSeries: Set<string>` is the source of truth. We rebuild
	 * `seriesWithVisibility` on every toggle — each series gets a
	 * fresh shallow clone with `visible` set so neither the consumer
	 * fixture nor the chart engine has to deal with deep mutation
	 * (which Vue 3 silently drops on plain module-level consts).
	 */
	const hiddenSeries = ref<Set<string>>(new Set())

	/*
	 * For pie / donut, the consumer typically supplies the SAME data
	 * shape as a line / bar chart: an array of series with N data
	 * points keyed against `categories`. Naively passing that to the
	 * polar engine gives a single series with N slices but a legend
	 * full of SERIES names (e.g. "Sales 2025") — which is useless
	 * because the slices represent CATEGORIES (Jan / Feb / Mar / …).
	 *
	 * We synthesise a series-per-category here so:
	 *   - the legend exposes one item per slice (categorical label),
	 *   - clicking a legend item toggles THAT slice's visibility,
	 *   - the polar engine receives a multi-series input it can
	 *     iterate as a flat slice list.
	 *
	 * When the consumer already passes the "pie shape" (single series,
	 * data = slice values), we leave it untouched — the polar engine
	 * detects this via the "single series with >1 data points" branch.
	 *
	 * Visibility is keyed by the synthesised series name (= category
	 * label), so the `hiddenSeries` Set works uniformly across families.
	 */
	const seriesWithVisibility = computed<Array<IChartSeries>>(() =>
		props.series.map((s) => ({
			...s,
			visible: !hiddenSeries.value.has(s.name)
		}))
	)

	const onSeriesToggle = (series: IChartSeries, visible: boolean): void => {
		if (visible) hiddenSeries.value.delete(series.name)
		else hiddenSeries.value.add(series.name)
		emit('series-toggle', series, visible)
	}
</script>
