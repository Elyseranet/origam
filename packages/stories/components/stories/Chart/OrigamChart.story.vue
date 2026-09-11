<template>
	<Story
			group="components"
			title="Chart/OrigamChart"
	>

		<Variant
				title="Design"
				:init-state="() => useStoryInitState<Partial<IChartProps>>({
					type: 'line',
					series: FIXTURE_SALES_SERIES,
					categories: FIXTURE_MONTHS,
					width: undefined,
					height: 320,
					title: 'Monthly sales',
					subtitle: '2025 vs 2026',
					colorScheme: undefined,
					bgColor: undefined,
					rounded: undefined,
					elevation: undefined
				})"
		>
			<template #default="{ state }">
				<origam-chart
						:type="state.type"
						:padding="state.padding"
						:margin="state.margin"
						:series="FIXTURE_SALES_SERIES"
						:categories="FIXTURE_MONTHS"
						:width="state.width"
						:height="state.height"
						:title="state.title"
						:subtitle="state.subtitle"
						:font-size="state.fontSize || undefined"
						:font-weight="state.fontWeight || undefined"
						:color-scheme="state.colorScheme || undefined"
						:bg-color="state.bgColor || undefined"
						:rounded="state.rounded || undefined"
						:elevation="state.elevation || undefined"
						:aspect-ratio="state.aspectRatio || undefined"
				/>
			</template>
			<template #controls="{ state }">
				<StoryGroup title="Type">
					<HstSelect v-model="state.type" title="Type" :options="TYPE_OPTIONS"/>
				</StoryGroup>
				<StoryGroup title="Color">
					<HstSelect v-model="state.bgColor"     title="Bg Color"     :options="COLOR_OPTIONS"/>
					<HstSelect v-model="state.colorScheme" title="Color Scheme" :options="COLOR_SCHEME_OPTIONS"/>
				</StoryGroup>
				<StoryGroup title="Shape">
					<HstSelect v-model="state.rounded"   title="Rounded"   :options="ROUNDED_OPTIONS"/>
					<HstSelect v-model="state.elevation" title="Elevation" :options="ELEVATION_OPTIONS"/>
				</StoryGroup>
				<StoryGroup title="Dimension">
					<HstText   v-model="state.width"      title="Width"/>
					<HstNumber v-model="state.height"     title="Height (px)" :min="100" :max="800" :step="20"/>
					<HstText   v-model="state.aspectRatio" title="Aspect Ratio (e.g. 16/9)"/>
				</StoryGroup>
				<StoryGroup title="Labels">
					<HstText v-model="state.title"    title="Title"/>
					<HstText v-model="state.subtitle" title="Subtitle"/>
				</StoryGroup>
				<StoryGroup title="Typography">
					<HstSelect v-model="state.fontSize"   title="Font Size"   :options="FONT_SIZE_OPTIONS"/>
					<HstSelect v-model="state.fontWeight" title="Font Weight" :options="FONT_WEIGHT_OPTIONS"/>
				</StoryGroup>
				<StoryGroup title="Spacing">
					<HstText v-model="state.padding" title="Padding"/>
					<HstText v-model="state.margin"  title="Margin"/>
				</StoryGroup>
			</template>
		</Variant>

		<Variant
				title="Functional"
				:init-state="() => useStoryInitState<Partial<IChartProps>>({
					type: 'column',
					stacked: false,
					stacking: 'normal',
					smoothing: 'none',
					legendPosition: 'bottom',
					showLegend: true,
					showTooltip: true,
					showGrid: true,
					showAxis: true,
					animated: true,
					animationDuration: 600,
					donutHoleSize: 0.6,
					yMin: undefined,
					yMax: undefined,
					gaugeMin: 0,
					gaugeMax: 100,
					gaugeUnit: '%'
				})"
		>
			<template #default="{ state }">
				<origam-chart
						:type="state.type"
						:series="state.type === 'gauge' ? FIXTURE_GAUGE : FIXTURE_SALES_SERIES"
						:categories="FIXTURE_MONTHS"
						:height="300"
						:stacked="state.stacked"
						:stacking="state.stacking"
						:smoothing="state.smoothing"
						:legend-position="state.legendPosition"
						:show-legend="state.showLegend"
						:show-tooltip="state.showTooltip"
						:show-grid="state.showGrid"
						:show-axis="state.showAxis"
						:animated="state.animated"
						:animation-duration="state.animationDuration"
						:donut-hole-size="state.type === 'donut' ? state.donutHoleSize : undefined"
						:y-min="state.yMin"
						:y-max="state.yMax"
						:gauge-min="state.type === 'gauge' ? state.gaugeMin : undefined"
						:gauge-max="state.type === 'gauge' ? state.gaugeMax : undefined"
						:gauge-unit="state.type === 'gauge' ? state.gaugeUnit : undefined"
				/>
			</template>
			<template #controls="{ state }">
				<StoryGroup title="Type">
					<HstSelect v-model="state.type" title="Type" :options="TYPE_OPTIONS"/>
				</StoryGroup>
				<StoryGroup title="Display">
					<HstCheckbox v-model="state.showLegend"  title="Show Legend"/>
					<HstCheckbox v-model="state.showTooltip" title="Show Tooltip"/>
					<HstCheckbox v-model="state.showGrid"    title="Show Grid"/>
					<HstCheckbox v-model="state.showAxis"    title="Show Axis"/>
					<HstSelect   v-model="state.legendPosition" title="Legend Position" :options="LEGEND_POSITION_OPTIONS"/>
				</StoryGroup>
				<StoryGroup title="Stacking">
					<HstCheckbox v-model="state.stacked"  title="Stacked"/>
					<HstSelect   v-model="state.stacking" title="Stacking Mode" :options="STACKING_OPTIONS"/>
				</StoryGroup>
				<StoryGroup title="Smoothing">
					<HstSelect v-model="state.smoothing" title="Smoothing" :options="SMOOTHING_OPTIONS"/>
				</StoryGroup>
				<StoryGroup title="Animation">
					<HstCheckbox v-model="state.animated"          title="Animated"/>
					<HstNumber   v-model="state.animationDuration" title="Duration (ms)" :min="0" :max="2000" :step="100"/>
				</StoryGroup>
				<StoryGroup title="Y Axis">
					<HstNumber v-model="state.yMin" title="Y Min (override)"/>
					<HstNumber v-model="state.yMax" title="Y Max (override)"/>
				</StoryGroup>
				<StoryGroup title="Donut">
					<HstNumber v-model="state.donutHoleSize" title="Hole Size (0–1)" :min="0" :max="0.99" :step="0.05"/>
				</StoryGroup>
				<StoryGroup title="Gauge">
					<HstNumber v-model="state.gaugeMin" title="Gauge Min" :min="-9999" :max="9999"/>
					<HstNumber v-model="state.gaugeMax" title="Gauge Max" :min="-9999" :max="9999"/>
					<HstText   v-model="state.gaugeUnit" title="Gauge Unit (e.g. %)"/>
				</StoryGroup>
			</template>
		</Variant>

		<Variant title="Events - point-click">
			<origam-chart
					type="column"
					:series="FIXTURE_SALES_SERIES"
					:categories="FIXTURE_MONTHS"
					:height="300"
					@point-click="logEvent('point-click', $event)"
			/>
		</Variant>

		<Variant title="Events - legend-click">
			<origam-chart
					type="line"
					:series="FIXTURE_SALES_SERIES"
					:categories="FIXTURE_MONTHS"
					:height="300"
					@legend-click="logEvent('legend-click', $event)"
			/>
		</Variant>

		<Variant title="Events - series-toggle">
			<origam-chart
					type="line"
					:series="FIXTURE_SALES_SERIES"
					:categories="FIXTURE_MONTHS"
					:height="300"
					@series-toggle="logEvent('series-toggle', $event)"
			/>
		</Variant>

		<Variant title="Slots - Tooltip">
			<origam-chart
					type="line"
					:series="FIXTURE_SALES_SERIES"
					:categories="FIXTURE_MONTHS"
					:height="320"
			>
				<template #tooltip="{ point, series, category }">
					<div class="custom-tooltip">
						<strong>{{ series.name }}</strong>
						<span class="custom-tooltip__category">{{ category }}</span>
						<span class="custom-tooltip__value">${{ point.y }}k</span>
					</div>
				</template>
			</origam-chart>
		</Variant>

		<Variant title="Slots - Legend-item">
			<origam-chart
					type="line"
					:series="FIXTURE_SALES_SERIES"
					:categories="FIXTURE_MONTHS"
					:height="320"
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
			</origam-chart>
		</Variant>

		<Variant title="Slots - Title">
			<origam-chart
					type="area"
					:series="FIXTURE_SALES_SERIES"
					:categories="FIXTURE_MONTHS"
					:height="320"
			>
				<template #title>
					<div class="custom-title">
						<span class="custom-title__main">Sales pipeline</span>
						<span class="custom-title__badge">live</span>
					</div>
					<div class="custom-title__sub">
						Updated 2 minutes ago
					</div>
				</template>
			</origam-chart>
		</Variant>

		<Variant title="Slots - Empty">
			<origam-chart
					type="line"
					:series="[]"
					:height="240"
			>
				<template #empty>
					<div class="custom-empty">
						<strong>No data yet</strong>
						<small>Connect a data source to start charting.</small>
					</div>
				</template>
			</origam-chart>
		</Variant>

		<Variant
				title="Default"
				:init-state="() => useStoryInitState<Partial<IChartProps>>({
					type: 'line',
					title: 'Monthly sales',
					subtitle: '2025 vs 2026',
					height: 360,
					stacked: false,
					stacking: 'normal',
					smoothing: 'none',
					legendPosition: 'bottom',
					showLegend: true,
					showTooltip: true,
					showGrid: true,
					showAxis: true,
					animated: true,
					bgColor: undefined,
					rounded: undefined,
					elevation: undefined
				})"
		>
			<template #default="{ state }">
				<origam-chart
						v-bind="state"
						:series="FIXTURE_SALES_SERIES"
						:categories="FIXTURE_MONTHS"
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
					<HstSelect v-model="state.type"           title="Type"            :options="TYPE_OPTIONS"/>
					<HstSelect v-model="state.bgColor"        title="Bg Color"        :options="COLOR_OPTIONS"/>
					<HstSelect v-model="state.rounded"        title="Rounded"         :options="ROUNDED_OPTIONS"/>
					<HstSelect v-model="state.elevation"      title="Elevation"       :options="ELEVATION_OPTIONS"/>
					<HstSelect v-model="state.legendPosition" title="Legend Position" :options="LEGEND_POSITION_OPTIONS"/>
					<HstNumber v-model="state.height"         title="Height (px)"     :min="100" :max="800" :step="20"/>
				</StoryGroup>
				<StoryGroup title="Functional">
					<HstCheckbox v-model="state.showLegend"  title="Show Legend"/>
					<HstCheckbox v-model="state.showTooltip" title="Show Tooltip"/>
					<HstCheckbox v-model="state.showGrid"    title="Show Grid"/>
					<HstCheckbox v-model="state.showAxis"    title="Show Axis"/>
					<HstCheckbox v-model="state.stacked"     title="Stacked"/>
					<HstCheckbox v-model="state.animated"    title="Animated"/>
					<HstSelect   v-model="state.smoothing"   title="Smoothing"        :options="SMOOTHING_OPTIONS"/>
					<HstSelect   v-model="state.stacking"    title="Stacking Mode"    :options="STACKING_OPTIONS"/>
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

	import { OrigamChart } from '@origam/components'
	import type { IChartProps, IChartSeries } from '@origam/interfaces'

	import StoryGroup from '@stories/components/_shared/StoryGroup.vue'
	import { useStoryInitState } from '@stories/composables'
	import {
		COLOR_OPTIONS,
		ELEVATION_OPTIONS,
		FONT_SIZE_OPTIONS,
		FONT_WEIGHT_OPTIONS,
		ROUNDED_OPTIONS
	} from '@stories/const'

	const TYPE_OPTIONS = [
		{ value: 'line', label: 'line' },
		{ value: 'spline', label: 'spline' },
		{ value: 'stepped-line', label: 'stepped-line' },
		{ value: 'area', label: 'area' },
		{ value: 'bar', label: 'bar' },
		{ value: 'column', label: 'column' },
		{ value: 'pie', label: 'pie' },
		{ value: 'donut', label: 'donut' },
		{ value: 'scatter', label: 'scatter' },
		{ value: 'radar', label: 'radar' },
		{ value: 'gauge', label: 'gauge' },
		{ value: 'funnel', label: 'funnel' },
		{ value: 'pyramid', label: 'pyramid' },
		{ value: 'honeycomb', label: 'honeycomb' },
		{ value: 'treemap', label: 'treemap' },
		{ value: 'sankey', label: 'sankey' },
		{ value: 'word-cloud', label: 'word-cloud' },
		{ value: 'heatmap', label: 'heatmap' },
		{ value: 'sunburst', label: 'sunburst' },
		{ value: 'box-plot', label: 'box-plot' },
		{ value: 'pictorial', label: 'pictorial' },
		{ value: 'candlestick', label: 'candlestick' },
		{ value: 'streamgraph', label: 'streamgraph' },
		{ value: 'variwide', label: 'variwide' },
		{ value: 'polar-bar', label: 'polar-bar' },
		{ value: 'bullet', label: 'bullet' },
		{ value: 'pareto', label: 'pareto' },
		{ value: 'map', label: 'map' },
		{ value: 'sparkline', label: 'sparkline' }
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

	const COLOR_SCHEME_OPTIONS = [
		{ value: undefined, label: '— default (DS intents) —' },
		{ value: ['primary', 'secondary', 'ghost'], label: 'action intents' },
		{ value: ['success', 'warning', 'danger', 'info'], label: 'feedback intents' },
		{ value: ['#8b5cf6', '#ec4899', '#f97316', '#22c55e', '#0ea5e9'], label: 'custom hex' }
	]

	const FIXTURE_MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

	const FIXTURE_SALES_SERIES: Array<IChartSeries> = [
		{ name: 'Sales 2025', data: [12, 18, 22, 19, 25, 32, 28, 33, 30, 36, 39, 42], color: 'primary' },
		{ name: 'Sales 2026', data: [16, 22, 25, 23, 30, 38, 35, 41, 39, 45, 48, 52], color: 'success' }
	]

	const FIXTURE_GAUGE: Array<IChartSeries> = [
		{ name: 'Completion', data: [62], color: 'primary' }
	]
</script>

<style scoped>
	.custom-tooltip {
		display: flex;
		flex-direction: column;
		gap: 4px;
		padding: 8px 12px;
		background-color: var(--origam-color-neutral-900, #111827);
		color: var(--origam-color-neutral-0, #ffffff);
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
		background-color: var(--origam-color-feedback-success-bg, #22c55e);
		color: var(--origam-color-neutral-0, #ffffff);
	}

	.custom-title__sub {
		font-size: 0.75rem;
		color: var(--origam-color-text-secondary, #6b7280);
	}

	.custom-empty {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 6px;
		padding: 24px;
	}

	.custom-empty small {
		color: var(--origam-color-text-secondary, #6b7280);
	}
</style>

<docs
		lang="md"
		src="@docs/components/Chart/OrigamChart.md"
/>
