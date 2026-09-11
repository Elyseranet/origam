<template>
	<Story
			group="components"
			title="Chart/OrigamChartPareto"
	>

		<Variant
				title="Design"
				:init-state="() => useStoryInitState<Partial<IChartParetoProps>>({
					height: 400,
					bgColor: undefined,
					rounded: undefined,
					elevation: undefined,
					barColor: 'primary',
					lineColor: 'danger',
					barGap: 4,
					showAxis: true,
					showGrid: true,
					showLabel: false,
					showLine: true,
					legendPosition: 'bottom',
					showLegend: true,
				})"
		>
			<template #default="{ state }">
				<origam-chart-pareto
						:series="FIXTURE_DEFECTS"
						:height="state.height"
						:bg-color="state.bgColor"
						:rounded="state.rounded"
						:elevation="state.elevation"
						:bar-color="state.barColor"
						:line-color="state.lineColor"
						:bar-gap="state.barGap"
						:show-axis="state.showAxis"
						:show-grid="state.showGrid"
						:show-label="state.showLabel"
						:show-line="state.showLine"
						:legend-position="state.legendPosition"
						:show-legend="state.showLegend"
						title="Defect Causes — Pareto Analysis"
						subtitle="Sorted by frequency (descending)"
				/>
			</template>
			<template #controls="{ state }">
				<StoryGroup title="Color">
					<HstText   v-model="state.barColor"  title="Bar Color"/>
					<HstText   v-model="state.lineColor" title="Line Color"/>
					<HstSelect v-model="state.bgColor"   title="Bg Color" :options="COLOR_OPTIONS"/>
				</StoryGroup>
				<StoryGroup title="Shape">
					<HstSelect v-model="state.rounded"   title="Rounded"   :options="ROUNDED_OPTIONS"/>
					<HstSelect v-model="state.elevation" title="Elevation" :options="ELEVATION_OPTIONS"/>
				</StoryGroup>
				<StoryGroup title="Dimension">
					<HstNumber v-model="state.height"  title="Height (px)" :min="100" :max="800" :step="20"/>
					<HstNumber v-model="state.barGap"  title="Bar Gap (px)" :min="0" :max="20" :step="1"/>
				</StoryGroup>
				<StoryGroup title="Chart Display">
					<HstCheckbox v-model="state.showAxis"   title="Show Axis"/>
					<HstCheckbox v-model="state.showGrid"   title="Show Grid"/>
					<HstCheckbox v-model="state.showLine"   title="Show Line"/>
					<HstCheckbox v-model="state.showLabel"  title="Show Label"/>
				</StoryGroup>
				<StoryGroup title="Legend">
					<HstCheckbox v-model="state.showLegend"     title="Show Legend"/>
					<HstSelect   v-model="state.legendPosition" title="Legend Position" :options="LEGEND_POSITION_OPTIONS"/>
				</StoryGroup>
			</template>
		</Variant>

		<Variant
				title="Functional"
				:init-state="() => useStoryInitState<Partial<IChartParetoProps>>({
					animated: true,
					showTooltip: true,
					animationDuration: 600,
				})"
		>
			<template #default="{ state }">
				<origam-chart-pareto
						:series="FIXTURE_DEFECTS"
						:height="360"
						:animated="state.animated"
						:animation-duration="state.animationDuration"
						:show-tooltip="state.showTooltip"
						title="Functional props"
				/>
			</template>
			<template #controls="{ state }">
				<StoryGroup title="Animation">
					<HstCheckbox v-model="state.animated"          title="Animated"/>
					<HstNumber   v-model="state.animationDuration" title="Duration (ms)" :min="100" :max="3000" :step="100"/>
				</StoryGroup>
				<StoryGroup title="Interaction">
					<HstCheckbox v-model="state.showTooltip" title="Show Tooltip"/>
				</StoryGroup>
			</template>
		</Variant>

		<Variant title="Events - point-click">
			<origam-chart-pareto
					:series="FIXTURE_DEFECTS"
					:height="320"
					title="Click a column"
					@point-click="logEvent('point-click', $event)"
			/>
		</Variant>

		<Variant title="Events - legend-click">
			<origam-chart-pareto
					:series="FIXTURE_DEFECTS"
					:height="320"
					title="Click a legend entry"
					@legend-click="logEvent('legend-click', $event)"
			/>
		</Variant>

		<Variant title="Events - series-toggle">
			<origam-chart-pareto
					:series="FIXTURE_DEFECTS"
					:height="320"
					title="Toggle series visibility via legend"
					@series-toggle="logEvent('series-toggle', $event)"
			/>
		</Variant>

		<Variant title="Slots - Tooltip">
			<origam-chart-pareto
					:series="FIXTURE_DEFECTS"
					:height="380"
					title="Custom tooltip — hover a column"
			>
				<template #tooltip="{ category, value, share, cumulative, color }">
					<div class="custom-tooltip">
						<div
								class="custom-tooltip__swatch"
								:style="{ background: color }"
						></div>
						<div class="custom-tooltip__content">
							<strong class="custom-tooltip__title">{{ category }}</strong>
							<dl class="custom-tooltip__data">
								<dt>Count</dt>
								<dd>{{ value }}</dd>
								<dt>Share</dt>
								<dd>{{ Math.round(share * 100) }}%</dd>
								<dt>Cumulative</dt>
								<dd>{{ Math.round(cumulative * 100) }}%</dd>
							</dl>
						</div>
					</div>
				</template>
			</origam-chart-pareto>
		</Variant>

		<Variant title="Slots - Empty">
			<origam-chart-pareto
					:series="[]"
					:height="300"
					title="Empty state"
			>
				<template #empty>
					<div class="custom-empty">
						No defect data available for the selected period.
					</div>
				</template>
			</origam-chart-pareto>
		</Variant>

		<Variant title="Slots - Title">
			<origam-chart-pareto
					:series="FIXTURE_DEFECTS"
					:height="340"
			>
				<template #title>
					<div class="custom-title">
						<strong>Custom Title Block</strong>
						<em> — injected via slot</em>
					</div>
				</template>
			</origam-chart-pareto>
		</Variant>

		<Variant title="Slots - Legend Item">
			<origam-chart-pareto
					:series="FIXTURE_DEFECTS"
					:height="340"
					title="Custom legend items"
			>
				<template #legend-item="{ series, index, visible }">
					<span :style="{ opacity: visible ? 1 : 0.4, fontStyle: 'italic', fontSize: '0.8125rem' }">
						{{ index + 1 }}. {{ series.name }}
					</span>
				</template>
			</origam-chart-pareto>
		</Variant>

		<Variant
				title="Default"
				:init-state="() => useStoryInitState<Partial<IChartParetoProps>>({
					height: 400,
					animated: true,
					showLegend: true,
					showTooltip: true,
					showAxis: true,
					showGrid: true,
					showLine: true,
					showLabel: false,
					legendPosition: 'bottom',
					barGap: 4,
					barColor: 'primary',
					lineColor: 'danger',
				})"
		>
			<template #default="{ state }">
				<origam-chart-pareto
						v-bind="state"
						:series="FIXTURE_DEFECTS"
						title="Defect Causes — Pareto Analysis"
						subtitle="Sorted by frequency (descending)"
						@point-click="logEvent('point-click', $event)"
						@legend-click="logEvent('legend-click', $event)"
						@series-toggle="logEvent('series-toggle', $event)"
				/>
			</template>
			<template #controls="{ state }">
				<StoryGroup title="Content">
					<HstText   v-model="state.barColor"  title="Bar Color"/>
					<HstText   v-model="state.lineColor" title="Line Color"/>
				</StoryGroup>
				<StoryGroup title="Design">
					<HstSelect v-model="state.bgColor"        title="Bg Color"        :options="COLOR_OPTIONS"/>
					<HstSelect v-model="state.rounded"        title="Rounded"         :options="ROUNDED_OPTIONS"/>
					<HstSelect v-model="state.elevation"      title="Elevation"       :options="ELEVATION_OPTIONS"/>
					<HstSelect v-model="state.legendPosition" title="Legend Position" :options="LEGEND_POSITION_OPTIONS"/>
					<HstNumber v-model="state.height"         title="Height (px)"     :min="100" :max="800" :step="20"/>
					<HstNumber v-model="state.barGap"         title="Bar Gap (px)"    :min="0"   :max="20"  :step="1"/>
				</StoryGroup>
				<StoryGroup title="Functional">
					<HstCheckbox v-model="state.animated"     title="Animated"/>
					<HstCheckbox v-model="state.showTooltip"  title="Show Tooltip"/>
					<HstCheckbox v-model="state.showLegend"   title="Show Legend"/>
					<HstCheckbox v-model="state.showAxis"     title="Show Axis"/>
					<HstCheckbox v-model="state.showGrid"     title="Show Grid"/>
					<HstCheckbox v-model="state.showLine"     title="Show Line"/>
					<HstCheckbox v-model="state.showLabel"    title="Show Label"/>
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

	import { OrigamChartPareto } from '@origam/components'
	import type {
		IChartParetoProps,
		IChartSeries
	} from '@origam/interfaces'
	import type { IChartParetoDatum } from '@origam/interfaces/Chart/chart-pareto.interface'
	import type { TChartLegendPosition } from '@origam/types'

	import StoryGroup from '@stories/components/_shared/StoryGroup.vue'
	import { useStoryInitState } from '@stories/composables'
	import {
		COLOR_OPTIONS,
		ELEVATION_OPTIONS,
		ROUNDED_OPTIONS
	} from '@stories/const'
	import type { IOptions } from '@origam/interfaces'

	const LEGEND_POSITION_OPTIONS: Array<IOptions<TChartLegendPosition>> = [
		{ label: 'Top', value: 'top' },
		{ label: 'Bottom', value: 'bottom' },
		{ label: 'Left', value: 'left' },
		{ label: 'Right', value: 'right' }
	]

	const DEFECT_DATA: Array<IChartParetoDatum> = [
		{ category: 'Bad welding', value: 89 },
		{ category: 'Wrong size', value: 66 },
		{ category: 'Loose fastener', value: 52 },
		{ category: 'Surface scratch', value: 41 },
		{ category: 'Bent frame', value: 28 },
		{ category: 'Misalignment', value: 19 },
		{ category: 'Paint chip', value: 14 },
		{ category: 'Cracking', value: 9 },
		{ category: 'Discoloration', value: 6 },
		{ category: 'Other', value: 4 }
	]

	const FIXTURE_DEFECTS: Array<IChartSeries> = [
		{ name: 'Defect causes', data: DEFECT_DATA as unknown as Array<number> }
	]
</script>

<style scoped>
	.custom-tooltip {
		display: flex;
		gap: 10px;
		padding: 4px;
		align-items: flex-start;
	}

	.custom-tooltip__swatch {
		width: 12px;
		height: 12px;
		border-radius: 3px;
		flex-shrink: 0;
		margin-top: 2px;
	}

	.custom-tooltip__content {
		display: flex;
		flex-direction: column;
		gap: 4px;
	}

	.custom-tooltip__title {
		font-size: 0.875rem;
	}

	.custom-tooltip__data {
		margin: 0;
		display: grid;
		grid-template-columns: auto 1fr;
		gap: 2px 8px;
		font-size: 0.8125rem;
	}

	.custom-tooltip__data dt {
		color: var(--origam-color-text-secondary, #9ca3af);
	}

	.custom-tooltip__data dd {
		margin: 0;
		font-weight: 600;
	}

	.custom-empty {
		color: var(--origam-color-text-secondary, #6b7280);
		font-style: italic;
	}

	.custom-title {
		font-size: 1rem;
	}
</style>

<docs
		lang="md"
		src="@docs/components/Chart/OrigamChartPareto.md"
/>
