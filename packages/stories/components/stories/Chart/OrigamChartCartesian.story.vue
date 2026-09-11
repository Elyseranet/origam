<template>
	<Story
			group="components"
			title="Chart/OrigamChartCartesian"
	>

		<Variant
				title="Design"
				:init-state="() => useStoryInitState<Partial<IChartCartesianProps>>({
					type: 'line',
					bgColor: undefined,
					rounded: undefined,
					elevation: undefined,
					aspectRatio: undefined,
					legendPosition: 'bottom',
					animationDuration: 600,
					series: FIXTURE_SALES_SERIES,
					categories: FIXTURE_MONTHS,
					height: '360',
					title: 'Monthly sales',
					subtitle: '2025 vs 2026'
				})"
		>
			<template #default="{ state }">
				<div class="story-shell">
					<origam-chart-cartesian
							:type="state.type"
							:bg-color="state.bgColor"
							:rounded="state.rounded"
							:elevation="state.elevation"
							:aspect-ratio="state.aspectRatio"
							:legend-position="state.legendPosition"
							:animation-duration="state.animationDuration"
							:series="FIXTURE_SALES_SERIES"
							:categories="FIXTURE_MONTHS"
							:height="state.height"
							:title="state.title"
							:subtitle="state.subtitle"
					/>
				</div>
			</template>
			<template #controls="{ state }">
				<StoryGroup title="Type">
					<HstSelect v-model="state.type" title="Type" :options="TYPE_OPTIONS"/>
				</StoryGroup>
				<StoryGroup title="Color">
					<HstSelect v-model="state.bgColor" title="Bg Color" :options="COLOR_OPTIONS"/>
				</StoryGroup>
				<StoryGroup title="Shape">
					<HstSelect v-model="state.rounded"   title="Rounded"   :options="ROUNDED_OPTIONS"/>
					<HstSelect v-model="state.elevation" title="Elevation" :options="ELEVATION_OPTIONS"/>
				</StoryGroup>
				<StoryGroup title="Dimension">
					<HstText v-model="state.height"      title="Height"/>
					<HstText v-model="state.aspectRatio" title="Aspect Ratio"/>
				</StoryGroup>
				<StoryGroup title="Legend">
					<HstSelect v-model="state.legendPosition" title="Legend Position" :options="LEGEND_POSITION_OPTIONS"/>
				</StoryGroup>
				<StoryGroup title="Animation">
					<HstNumber v-model="state.animationDuration" title="Duration (ms)" :min="0" :max="3000" :step="100"/>
				</StoryGroup>
				<StoryGroup title="Content">
					<HstText v-model="state.title"    title="Title"/>
					<HstText v-model="state.subtitle" title="Subtitle"/>
				</StoryGroup>
			</template>
		</Variant>

		<Variant
				title="Functional"
				:init-state="() => useStoryInitState<Partial<IChartCartesianProps>>({
					type: 'line',
					stacked: false,
					stacking: 'normal',
					smoothing: 'none',
					animated: true,
					showGrid: true,
					showAxis: true,
					showLegend: true,
					showTooltip: true,
					zoomable: false,
					yMin: undefined,
					yMax: undefined,
					series: FIXTURE_SALES_SERIES,
					categories: FIXTURE_MONTHS,
					height: '360'
				})"
		>
			<template #default="{ state }">
				<div class="story-shell">
					<origam-chart-cartesian
							:type="state.type"
							:series="FIXTURE_SALES_SERIES"
							:categories="FIXTURE_MONTHS"
							:height="state.height"
							:stacked="state.stacked"
							:stacking="state.stacking"
							:smoothing="state.smoothing"
							:animated="state.animated"
							:show-grid="state.showGrid"
							:show-axis="state.showAxis"
							:show-legend="state.showLegend"
							:show-tooltip="state.showTooltip"
							:zoomable="state.zoomable"
							:y-min="state.yMin"
							:y-max="state.yMax"
					/>
				</div>
			</template>
			<template #controls="{ state }">
				<StoryGroup title="Type">
					<HstSelect v-model="state.type" title="Type" :options="TYPE_OPTIONS"/>
				</StoryGroup>
				<StoryGroup title="Stacking">
					<HstCheckbox v-model="state.stacked"  title="Stacked"/>
					<HstSelect   v-model="state.stacking" title="Stacking Mode" :options="STACKING_OPTIONS"/>
				</StoryGroup>
				<StoryGroup title="Line">
					<HstSelect v-model="state.smoothing" title="Smoothing" :options="SMOOTHING_OPTIONS"/>
				</StoryGroup>
				<StoryGroup title="Display">
					<HstCheckbox v-model="state.animated"    title="Animated"/>
					<HstCheckbox v-model="state.showGrid"    title="Show Grid"/>
					<HstCheckbox v-model="state.showAxis"    title="Show Axis"/>
					<HstCheckbox v-model="state.showLegend"  title="Show Legend"/>
					<HstCheckbox v-model="state.showTooltip" title="Show Tooltip"/>
					<HstCheckbox v-model="state.zoomable"    title="Zoomable"/>
				</StoryGroup>
				<StoryGroup title="Y Axis Range">
					<HstNumber v-model="state.yMin" title="Y Min"/>
					<HstNumber v-model="state.yMax" title="Y Max"/>
				</StoryGroup>
				<StoryGroup title="Dimension">
					<HstText v-model="state.height" title="Height"/>
				</StoryGroup>
			</template>
		</Variant>

		<Variant title="Events - point-click">
			<div class="story-shell">
				<origam-chart-cartesian
						type="column"
						:series="FIXTURE_SALES_SERIES"
						:categories="FIXTURE_MONTHS"
						:height="320"
						title="Click a data point"
						data-cy="cartesian-emit-point-click"
						@point-click="logEvent('point-click', $event)"
				/>
			</div>
		</Variant>

		<Variant title="Events - legend-click">
			<div class="story-shell">
				<origam-chart-cartesian
						type="line"
						:series="FIXTURE_SALES_SERIES"
						:categories="FIXTURE_MONTHS"
						:height="320"
						title="Click a legend entry"
						data-cy="cartesian-emit-legend-click"
						@legend-click="logEvent('legend-click', $event)"
				/>
			</div>
		</Variant>

		<Variant title="Events - series-toggle">
			<div class="story-shell">
				<origam-chart-cartesian
						type="line"
						:series="FIXTURE_SALES_SERIES"
						:categories="FIXTURE_MONTHS"
						:height="320"
						title="Click legend to toggle series"
						data-cy="cartesian-emit-series-toggle"
						@series-toggle="logEvent('series-toggle', $event)"
				/>
			</div>
		</Variant>

		<Variant title="Events - drill / drill-up">
			<div class="story-shell">
				<p class="hint">Click a browser bar to drill into its version breakdown.</p>
				<origam-chart-cartesian
						type="column"
						:series="FIXTURE_BROWSER_SERIES"
						:categories="FIXTURE_BROWSER_CATEGORIES"
						:height="360"
						:drilldown="FIXTURE_BROWSER_DRILLDOWN"
						title="Browser market share"
						subtitle="Click a browser to drill in"
						data-cy="cartesian-emit-drill"
						@drill="logEvent('drill', $event)"
						@drill-up="logEvent('drill-up', $event)"
				/>
			</div>
		</Variant>

		<Variant title="Events - zoom / reset-zoom">
			<div class="story-shell">
				<p class="hint">Drag inside the plot to zoom. Click "Reset zoom" to restore the full range.</p>
				<origam-chart-cartesian
						type="line"
						:series="FIXTURE_DAILY_PRICES"
						:categories="FIXTURE_DAILY_DATES"
						:height="380"
						:zoomable="true"
						title="Daily prices — drag to zoom"
						data-cy="cartesian-emit-zoom"
						@zoom="logEvent('zoom', $event)"
						@reset-zoom="logEvent('reset-zoom', $event)"
				/>
			</div>
		</Variant>

		<Variant title="Slots - Tooltip">
			<div class="story-shell">
				<p class="hint">Hover a data point to see the custom tooltip slot.</p>
				<origam-chart-cartesian
						type="line"
						:series="FIXTURE_SALES_SERIES"
						:categories="FIXTURE_MONTHS"
						:height="320"
						data-cy="cartesian-slot-tooltip"
				>
					<template #tooltip="{ point, series, category }">
						<div class="custom-tooltip">
							<strong>{{ series.name }}</strong>
							<span class="custom-tooltip__category">{{ category }}</span>
							<span class="custom-tooltip__value">${{ point.y }}k</span>
						</div>
					</template>
				</origam-chart-cartesian>
			</div>
		</Variant>

		<Variant title="Slots - Legend-item">
			<div class="story-shell">
				<origam-chart-cartesian
						type="line"
						:series="FIXTURE_SALES_SERIES"
						:categories="FIXTURE_MONTHS"
						:height="320"
						data-cy="cartesian-slot-legend-item"
				>
					<template #legend-item="{ series, visible }">
						<div class="custom-legend-item">
							<span
									class="custom-legend-item__dot"
									:style="{ backgroundColor: visible ? (series.color === 'primary' ? '#3b82f6' : '#10b981') : '#9ca3af' }"
							/>
							<span class="custom-legend-item__name">{{ series.name }}</span>
							<small class="custom-legend-item__state">{{ visible ? 'shown' : 'hidden' }}</small>
						</div>
					</template>
				</origam-chart-cartesian>
			</div>
		</Variant>

		<Variant title="Slots - Title">
			<div class="story-shell">
				<origam-chart-cartesian
						type="area"
						:series="FIXTURE_SALES_SERIES"
						:categories="FIXTURE_MONTHS"
						:height="320"
						data-cy="cartesian-slot-title"
				>
					<template #title>
						<div class="custom-title">
							<span class="custom-title__main">Sales pipeline</span>
							<span class="custom-title__badge">live</span>
						</div>
						<div class="custom-title__sub">Updated 2 minutes ago</div>
					</template>
				</origam-chart-cartesian>
			</div>
		</Variant>

		<Variant title="Slots - Empty">
			<div class="story-shell">
				<origam-chart-cartesian
						type="line"
						:series="[]"
						:height="240"
						data-cy="cartesian-slot-empty"
				>
					<template #empty>
						<div class="custom-empty">
							<strong>No data yet</strong>
							<small>Connect a data source to start charting.</small>
						</div>
					</template>
				</origam-chart-cartesian>
			</div>
		</Variant>

		<Variant
				title="Default"
				:init-state="() => useStoryInitState<Partial<IChartCartesianProps>>({
					type: 'line',
					bgColor: undefined,
					rounded: undefined,
					elevation: undefined,
					legendPosition: 'bottom',
					animated: true,
					animationDuration: 600,
					showGrid: true,
					showAxis: true,
					showLegend: true,
					showTooltip: true,
					stacked: false,
					stacking: 'normal',
					smoothing: 'none',
					zoomable: false,
					height: '360',
					title: 'Monthly sales',
					subtitle: '2025 vs 2026'
				})"
		>
			<template #default="{ state }">
				<div class="story-shell">
					<origam-chart-cartesian
							v-bind="state"
							:series="FIXTURE_SALES_SERIES"
							:categories="FIXTURE_MONTHS"
							@point-click="logEvent('point-click', $event)"
							@legend-click="logEvent('legend-click', $event)"
							@series-toggle="logEvent('series-toggle', $event)"
					/>
				</div>
			</template>
			<template #controls="{ state }">
				<StoryGroup title="Content">
					<HstText v-model="state.title"    title="Title"/>
					<HstText v-model="state.subtitle" title="Subtitle"/>
				</StoryGroup>
				<StoryGroup title="Design">
					<HstSelect v-model="state.type"           title="Type"           :options="TYPE_OPTIONS"/>
					<HstSelect v-model="state.bgColor"        title="Bg Color"       :options="COLOR_OPTIONS"/>
					<HstSelect v-model="state.rounded"        title="Rounded"        :options="ROUNDED_OPTIONS"/>
					<HstSelect v-model="state.elevation"      title="Elevation"      :options="ELEVATION_OPTIONS"/>
					<HstSelect v-model="state.legendPosition" title="Legend Position" :options="LEGEND_POSITION_OPTIONS"/>
					<HstText   v-model="state.height"         title="Height"/>
				</StoryGroup>
				<StoryGroup title="Functional">
					<HstCheckbox v-model="state.animated"    title="Animated"/>
					<HstCheckbox v-model="state.showGrid"    title="Show Grid"/>
					<HstCheckbox v-model="state.showAxis"    title="Show Axis"/>
					<HstCheckbox v-model="state.showLegend"  title="Show Legend"/>
					<HstCheckbox v-model="state.showTooltip" title="Show Tooltip"/>
					<HstCheckbox v-model="state.stacked"     title="Stacked"/>
					<HstSelect   v-model="state.stacking"    title="Stacking Mode"   :options="STACKING_OPTIONS"/>
					<HstSelect   v-model="state.smoothing"   title="Smoothing"       :options="SMOOTHING_OPTIONS"/>
					<HstCheckbox v-model="state.zoomable"    title="Zoomable"/>
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

	import { OrigamChartCartesian } from '@origam/components'
	import type {
		IChartCartesianProps,
		IChartDrilldownLink,
		IChartDrilldownProps,
		IChartPoint,
		IChartSeries,
		IChartSeriesPoint
	} from '@origam/interfaces'

	import StoryGroup from '@stories/components/_shared/StoryGroup.vue'
	import { useStoryInitState } from '@stories/composables'
	import {
		COLOR_OPTIONS,
		ELEVATION_OPTIONS,
		ROUNDED_OPTIONS
	} from '@stories/const'

	const TYPE_OPTIONS = [
		{ value: 'line', label: 'line' },
		{ value: 'spline', label: 'spline' },
		{ value: 'stepped-line', label: 'stepped-line' },
		{ value: 'area', label: 'area' },
		{ value: 'bar', label: 'bar' },
		{ value: 'column', label: 'column' },
		{ value: 'scatter', label: 'scatter' }
	]

	const LEGEND_POSITION_OPTIONS = [
		{ value: 'top', label: 'top' },
		{ value: 'bottom', label: 'bottom' },
		{ value: 'left', label: 'left' },
		{ value: 'right', label: 'right' }
	]

	const SMOOTHING_OPTIONS = [
		{ value: 'none', label: 'none' },
		{ value: 'curve', label: 'curve' },
		{ value: 'monotone', label: 'monotone' }
	]

	const STACKING_OPTIONS = [
		{ value: 'normal', label: 'normal' },
		{ value: 'percent', label: 'percent' }
	]

	const FIXTURE_MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

	const FIXTURE_SALES_SERIES: Array<IChartSeries> = [
		{ name: 'Sales 2025', data: [12, 18, 22, 19, 25, 32, 28, 33, 30, 36, 39, 42], color: 'primary' },
		{ name: 'Sales 2026', data: [16, 22, 25, 23, 30, 38, 35, 41, 39, 45, 48, 52], color: 'success' }
	]

	const FIXTURE_BROWSER_CATEGORIES = ['Chrome', 'Safari', 'Firefox', 'Edge', 'Other']

	const FIXTURE_BROWSER_SERIES: Array<IChartSeries> = [
		{
			name: 'Market share',
			color: 'primary',
			data: [
				{ x: 'Chrome', y: 61, drilldown: { id: 'chrome', name: 'Chrome' } } as IChartSeriesPoint,
				{ x: 'Safari', y: 19, drilldown: { id: 'safari', name: 'Safari' } } as IChartSeriesPoint,
				{ x: 'Firefox', y: 9, drilldown: { id: 'firefox', name: 'Firefox' } } as IChartSeriesPoint,
				{ x: 'Edge', y: 5, drilldown: { id: 'edge', name: 'Edge' } } as IChartSeriesPoint,
				{ x: 'Other', y: 6, drilldown: { id: 'other', name: 'Other' } } as IChartSeriesPoint
			] as Array<IChartSeriesPoint>
		}
	]

	const FIXTURE_BROWSER_DRILLDOWN: IChartDrilldownProps = {
		backLabel: '← Back',
		datasets: [
			{
				id: 'chrome',
				name: 'Chrome versions',
				categories: ['v124', 'v123', 'v122', 'v121', 'Older'],
				series: [{ name: 'Chrome', color: 'primary', data: [32, 26, 15, 11, 16] as Array<number> }]
			},
			{
				id: 'safari',
				name: 'Safari versions',
				categories: ['v17', 'v16', 'v15', 'Older'],
				series: [{ name: 'Safari', color: 'success', data: [55, 28, 12, 5] as Array<number> }]
			},
			{
				id: 'firefox',
				name: 'Firefox versions',
				categories: ['v125', 'v124', 'v123', 'Older'],
				series: [{ name: 'Firefox', color: 'warning', data: [48, 32, 14, 6] as Array<number> }]
			},
			{
				id: 'edge',
				name: 'Edge versions',
				categories: ['v124', 'v123', 'v122', 'Older'],
				series: [{ name: 'Edge', color: 'info', data: [60, 25, 10, 5] as Array<number> }]
			},
			{
				id: 'other',
				name: 'Other browsers',
				categories: ['Opera', 'Samsung', 'UC Browser', 'Misc'],
				series: [{ name: 'Other', color: 'neutral', data: [30, 35, 20, 15] as Array<number> }]
			}
		]
	}

	const FIXTURE_DAILY_LENGTH = 1825
	const buildDailyPrices = (): Array<number> => {
		let v = 100
		let s = 1234
		return Array.from({ length: FIXTURE_DAILY_LENGTH }, () => {
			s = (s * 9301 + 49297) % 233280
			const r = s / 233280
			v += (r - 0.5) * 2.5
			return Math.max(20, Math.round(v * 10) / 10)
		})
	}
	const buildDailyDates = (): Array<string> => {
		const start = new Date('2021-01-01').getTime()
		return Array.from({ length: FIXTURE_DAILY_LENGTH }, (_, i) => {
			const d = new Date(start + i * 86400000)
			return d.toISOString().slice(0, 10)
		})
	}
	const FIXTURE_DAILY_PRICES: Array<IChartSeries> = [
		{ name: 'Stock A', data: buildDailyPrices(), color: 'primary' }
	]
	const FIXTURE_DAILY_DATES = buildDailyDates()
</script>

<style scoped>
	.story-shell {
		display: flex;
		flex-direction: column;
		gap: 12px;
		padding: 16px;
	}

	.hint {
		margin: 0;
		font-size: 0.875rem;
		color: var(--origam-color-text-secondary, #6b7280);
	}

	.custom-tooltip {
		display: flex;
		flex-direction: column;
		gap: 4px;
		padding: 8px 12px;
		background-color: #111827;
		color: #ffffff;
		border-radius: 8px;
	}

	.custom-tooltip__category {
		font-size: 0.6875rem;
		opacity: 0.7;
	}

	.custom-tooltip__value {
		font-size: 1.125rem;
		font-weight: 700;
	}

	.custom-legend-item {
		display: inline-flex;
		align-items: center;
		gap: 6px;
		padding: 4px 8px;
		border-radius: 999px;
		background-color: rgba(0, 0, 0, 0.05);
		font-size: 0.8125rem;
	}

	.custom-legend-item__dot {
		display: inline-block;
		width: 10px;
		height: 10px;
		border-radius: 999px;
	}

	.custom-legend-item__state {
		opacity: 0.6;
	}

	.custom-title {
		display: flex;
		align-items: center;
		gap: 8px;
		font-size: 1.125rem;
		font-weight: 700;
	}

	.custom-title__badge {
		font-size: 0.6875rem;
		padding: 2px 6px;
		border-radius: 4px;
		background-color: #22c55e;
		color: #ffffff;
	}

	.custom-title__sub {
		font-size: 0.75rem;
		color: #6b7280;
	}

	.custom-empty {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 6px;
		padding: 24px;
	}

	.custom-empty small {
		color: #6b7280;
	}
</style>

<docs
		lang="md"
		src="@docs/components/Chart/OrigamChartCartesian.md"
/>
