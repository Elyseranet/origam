<template>
	<Story
			group="components"
			title="Chart/OrigamChartBoxPlot"
	>

		<Variant
				title="Design"
				:init-state="() => useStoryInitState<Partial<IChartBoxPlotProps>>({
					bgColor: undefined,
					rounded: undefined,
					elevation: undefined,
					width: undefined,
					height: 400,
					aspectRatio: undefined,
					colorScheme: undefined,
					boxWidth: 0.6,
					whiskerCapWidth: 0.4
				})"
		>
			<template #default="{ state }">
				<origam-chart-box-plot
						:series="FIXTURE_API_SERIES"
						:bg-color="state.bgColor"
						:rounded="state.rounded"
						:elevation="state.elevation"
						:width="state.width"
						:height="state.height"
						:aspect-ratio="state.aspectRatio"
						:color-scheme="state.colorScheme"
						:box-width="state.boxWidth"
						:whisker-cap-width="state.whiskerCapWidth"
						title="API Response Time"
						subtitle="Distribution per endpoint (ms)"
				/>
			</template>
			<template #controls="{ state }">
				<StoryGroup title="Color">
					<HstSelect v-model="state.bgColor" title="Bg Color" :options="INTENT_OPTIONS"/>
				</StoryGroup>
				<StoryGroup title="Shape">
					<HstSelect v-model="state.rounded"   title="Rounded"   :options="ROUNDED_OPTIONS"/>
					<HstSelect v-model="state.elevation" title="Elevation" :options="ELEVATION_OPTIONS"/>
				</StoryGroup>
				<StoryGroup title="Box Geometry">
					<HstNumber v-model="state.boxWidth"        title="Box Width [0..1]"         :min="0.1" :max="1" :step="0.05"/>
					<HstNumber v-model="state.whiskerCapWidth" title="Whisker Cap Width [0..1]" :min="0.1" :max="1" :step="0.05"/>
				</StoryGroup>
				<StoryGroup title="Dimension">
					<HstText   v-model="state.width"       title="Width"/>
					<HstNumber v-model="state.height"      title="Height (px)" :min="200" :max="800" :step="20"/>
					<HstText   v-model="state.aspectRatio" title="Aspect Ratio (e.g. 16/9)"/>
				</StoryGroup>
			</template>
		</Variant>

		<Variant
				title="Functional"
				:init-state="() => useStoryInitState<Partial<IChartBoxPlotProps>>({
					title: 'API Response Time',
					subtitle: 'Distribution per endpoint (ms)',
					showLegend: false,
					legendPosition: 'bottom',
					showTooltip: true,
					animated: true,
					animationDuration: 600,
					showOutliers: true,
					showAxis: true,
					showGrid: true,
					yMin: undefined,
					yMax: undefined
				})"
		>
			<template #default="{ state }">
				<origam-chart-box-plot
						:series="FIXTURE_API_SERIES"
						:height="380"
						:title="state.title"
						:subtitle="state.subtitle"
						:show-legend="state.showLegend"
						:legend-position="state.legendPosition"
						:show-tooltip="state.showTooltip"
						:animated="state.animated"
						:animation-duration="state.animationDuration"
						:show-outliers="state.showOutliers"
						:show-axis="state.showAxis"
						:show-grid="state.showGrid"
						:y-min="state.yMin"
						:y-max="state.yMax"
				/>
			</template>
			<template #controls="{ state }">
				<StoryGroup title="Labels">
					<HstText v-model="state.title"    title="Title"/>
					<HstText v-model="state.subtitle" title="Subtitle"/>
				</StoryGroup>
				<StoryGroup title="Legend">
					<HstCheckbox v-model="state.showLegend"     title="Show Legend"/>
					<HstSelect   v-model="state.legendPosition" title="Legend Position" :options="LEGEND_POSITION_OPTIONS"/>
				</StoryGroup>
				<StoryGroup title="Display">
					<HstCheckbox v-model="state.showTooltip"  title="Show Tooltip"/>
					<HstCheckbox v-model="state.showOutliers" title="Show Outliers"/>
					<HstCheckbox v-model="state.showAxis"     title="Show Axis"/>
					<HstCheckbox v-model="state.showGrid"     title="Show Grid"/>
				</StoryGroup>
				<StoryGroup title="Animation">
					<HstCheckbox v-model="state.animated"          title="Animated"/>
					<HstNumber   v-model="state.animationDuration" title="Animation Duration (ms)" :min="0" :max="2000" :step="100"/>
				</StoryGroup>
				<StoryGroup title="Y Axis Range">
					<HstNumber v-model="state.yMin" title="Y Min (override)"/>
					<HstNumber v-model="state.yMax" title="Y Max (override)"/>
				</StoryGroup>
			</template>
		</Variant>

		<Variant title="Events - point-click">
			<origam-chart-box-plot
					:series="FIXTURE_API_SERIES"
					:height="360"
					title="Click a box or outlier"
					@point-click="logEvent('point-click', $event)"
			/>
		</Variant>

		<Variant title="Events - legend-click">
			<origam-chart-box-plot
					:series="FIXTURE_API_SERIES"
					:height="360"
					:show-legend="true"
					title="Click a legend entry"
					@legend-click="logEvent('legend-click', $event)"
			/>
		</Variant>

		<Variant title="Events - series-toggle">
			<origam-chart-box-plot
					:series="FIXTURE_API_SERIES"
					:height="360"
					:show-legend="true"
					title="Toggle series via legend"
					@series-toggle="logEvent('series-toggle', $event)"
			/>
		</Variant>

		<Variant title="Slots - Tooltip">
			<origam-chart-box-plot
					:series="FIXTURE_API_SERIES"
					:height="380"
					title="Custom tooltip"
			>
				<template #tooltip="{ box }">
					<div class="custom-tooltip">
						<strong>{{ box.category }}</strong>
						<dl class="custom-tooltip__stats">
							<dt>Median</dt>
							<dd>{{ box.rawStats.median }} ms</dd>
							<dt>IQR</dt>
							<dd>{{ Math.round(box.iqr) }} ms</dd>
							<dt>Min / Max</dt>
							<dd>{{ box.rawStats.min }} / {{ box.rawStats.max }} ms</dd>
							<dt>Outliers</dt>
							<dd>{{ box.outliers.length }}</dd>
						</dl>
					</div>
				</template>
			</origam-chart-box-plot>
		</Variant>

		<Variant title="Slots - Legend-item">
			<origam-chart-box-plot
					:series="FIXTURE_API_SERIES"
					:height="360"
					:show-legend="true"
					title="Custom legend item"
			>
				<template #legend-item="{ series, index, visible }">
					<span :style="{ opacity: visible ? 1 : 0.4, fontWeight: 600 }">
						{{ index + 1 }}. {{ series.name }}
					</span>
				</template>
			</origam-chart-box-plot>
		</Variant>

		<Variant title="Slots - Title">
			<origam-chart-box-plot
					:series="FIXTURE_API_SERIES"
					:height="360"
			>
				<template #title>
					<h2 style="margin: 0; font-size: 1rem;">
						Custom title block
					</h2>
					<p style="margin: 0; font-size: 0.75rem; opacity: 0.6;">
						Custom subtitle via slot
					</p>
				</template>
			</origam-chart-box-plot>
		</Variant>

		<Variant title="Slots - Empty">
			<origam-chart-box-plot
					:series="[]"
					:height="320"
					title="Empty state"
			>
				<template #empty>
					<div class="custom-empty">
						No distribution data available for this period.
					</div>
				</template>
			</origam-chart-box-plot>
		</Variant>

		<Variant title="Responsive width">
			<div
					v-for="w in [480, 960]"
					:key="w"
					:style="{ width: `${ w }px`, maxWidth: '100%', marginBottom: '1rem' }"
					:data-cy="`origam-chart-box-plot-responsive-${ w }`"
			>
				<origam-chart-box-plot
						:series="FIXTURE_API_SERIES"
						:title="`${ w }px container`"
				/>
			</div>
		</Variant>

		<Variant
				title="Default"
				:init-state="() => useStoryInitState<IChartBoxPlotProps>({
					series: FIXTURE_API_SERIES,
					title: 'API Response Time',
					subtitle: 'Distribution per endpoint (ms)',
					height: 400,
					showLegend: false,
					legendPosition: 'bottom',
					showTooltip: true,
					animated: true,
					showOutliers: true,
					showAxis: true,
					showGrid: true,
					boxWidth: 0.6,
					whiskerCapWidth: 0.4
				})"
		>
			<template #default="{ state }">
				<origam-chart-box-plot
						v-bind="state"
						@point-click="logEvent('point-click', $event)"
						@legend-click="logEvent('legend-click', $event)"
						@series-toggle="logEvent('series-toggle', $event)"
				/>
			</template>
			<template #controls="{ state }">
				<StoryGroup title="Content">
					<HstText v-model="state.title"    title="Title"/>
					<HstText v-model="state.subtitle" title="Subtitle"/>
				</StoryGroup>
				<StoryGroup title="Design">
					<HstSelect v-model="state.bgColor"   title="Bg Color"   :options="INTENT_OPTIONS"/>
					<HstSelect v-model="state.rounded"   title="Rounded"    :options="ROUNDED_OPTIONS"/>
					<HstSelect v-model="state.elevation" title="Elevation"  :options="ELEVATION_OPTIONS"/>
					<HstNumber v-model="state.height"    title="Height (px)" :min="200" :max="800" :step="20"/>
					<HstNumber v-model="state.boxWidth"        title="Box Width [0..1]"         :min="0.1" :max="1" :step="0.05"/>
					<HstNumber v-model="state.whiskerCapWidth" title="Whisker Cap Width [0..1]" :min="0.1" :max="1" :step="0.05"/>
				</StoryGroup>
				<StoryGroup title="Functional">
					<HstCheckbox v-model="state.showLegend"    title="Show Legend"/>
					<HstSelect   v-model="state.legendPosition" title="Legend Position" :options="LEGEND_POSITION_OPTIONS"/>
					<HstCheckbox v-model="state.showTooltip"  title="Show Tooltip"/>
					<HstCheckbox v-model="state.animated"     title="Animated"/>
					<HstCheckbox v-model="state.showOutliers" title="Show Outliers"/>
					<HstCheckbox v-model="state.showAxis"     title="Show Axis"/>
					<HstCheckbox v-model="state.showGrid"     title="Show Grid"/>
				</StoryGroup>
			</template>
		</Variant>
	</Story>
</template>

<script
		lang="ts"
		setup
>
	import { logEvent } from 'histoire/client'

	import OrigamChartBoxPlot from '@origam/components/Chart/OrigamChartBoxPlot.vue'

	import type { IChartBoxPlotDatum, IChartBoxPlotProps } from '@origam/interfaces/Chart/chart-box-plot.interface'
	import type { IChartSeries } from '@origam/interfaces'

	import StoryGroup from '@stories/components/_shared/StoryGroup.vue'
	import { useStoryInitState } from '@stories/composables'
	import {
		ELEVATION_OPTIONS,
		INTENT_OPTIONS,
		ROUNDED_OPTIONS
	} from '@stories/const'

	const LEGEND_POSITION_OPTIONS = [
		{ value: 'top', label: 'top' },
		{ value: 'bottom', label: 'bottom' },
		{ value: 'left', label: 'left' },
		{ value: 'right', label: 'right' }
	]

	const API_DATA: Array<IChartBoxPlotDatum> = [
		{ category: '/users', min: 12, q1: 18, median: 24, q3: 32, max: 58, outliers: [120, 180] },
		{ category: '/products', min: 20, q1: 28, median: 38, q3: 52, max: 90, outliers: [150] },
		{ category: '/orders', min: 45, q1: 58, median: 70, q3: 88, max: 132, outliers: [] },
		{ category: '/payments', min: 80, q1: 95, median: 115, q3: 140, max: 200, outliers: [320, 450] },
		{ category: '/auth', min: 8, q1: 12, median: 16, q3: 22, max: 40, outliers: [] }
	]

	const FIXTURE_API_SERIES: Array<IChartSeries> = [
		{ name: 'API response time (ms)', data: API_DATA as unknown as Array<number> }
	]
</script>

<style scoped>
	.custom-tooltip {
		display: flex;
		flex-direction: column;
		gap: 6px;
		padding: 4px;
		min-width: 160px;
	}

	.custom-tooltip__stats {
		display: grid;
		grid-template-columns: auto 1fr;
		gap: 2px 8px;
		margin: 0;
		font-size: 0.75rem;
	}

	.custom-tooltip__stats dt {
		opacity: 0.7;
	}

	.custom-tooltip__stats dd {
		margin: 0;
		font-weight: 600;
		text-align: right;
	}

	.custom-empty {
		color: var(--origam-color-text-secondary, #6b7280);
		font-style: italic;
	}
</style>

<docs
		lang="md"
		src="@docs/components/Chart/OrigamChartBoxPlot.md"
/>
