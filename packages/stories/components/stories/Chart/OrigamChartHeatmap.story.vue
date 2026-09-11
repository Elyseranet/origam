<template>
	<Story
			group="components"
			title="Chart/OrigamChartHeatmap"
	>

		<Variant
				title="Design"
				:init-state="() => useStoryInitState<Partial<IChartHeatmapProps>>({
					title: 'GitHub-style activity grid',
					subtitle: 'Commits per weekday × hour',
					colorRange: ['info', 'danger'],
					cellGap: 2,
					showLabel: true,
					showAxis: true,
					showGradientLegend: true,
					showLegend: true,
					legendPosition: 'bottom',
					height: 440
				})"
		>
			<template #default="{ state }">
				<origam-chart-heatmap
						:series="FIXTURE_ACTIVITY"
						:x-categories="HOURS"
						:y-categories="DAYS"
						:bg-color="state.bgColor"
						:rounded="state.rounded"
						:elevation="state.elevation"
						:width="state.width"
						:height="state.height"
						:aspect-ratio="state.aspectRatio"
						:color-range="state.colorRange"
						:cell-gap="state.cellGap"
						:show-label="state.showLabel"
						:show-axis="state.showAxis"
						:show-gradient-legend="state.showGradientLegend"
						:show-legend="state.showLegend"
						:legend-position="state.legendPosition"
						:title="state.title"
						:subtitle="state.subtitle"
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
				<StoryGroup title="Dimension">
					<HstText   v-model="state.width"       title="Width"/>
					<HstNumber v-model="state.height"      title="Height (px)"/>
					<HstText   v-model="state.aspectRatio" title="Aspect Ratio"/>
				</StoryGroup>
				<StoryGroup title="Color Range">
					<HstSelect v-model="state.colorRange[0]" title="Range Start" :options="INTENT_OPTIONS"/>
					<HstSelect v-model="state.colorRange[1]" title="Range End"   :options="INTENT_OPTIONS"/>
				</StoryGroup>
				<StoryGroup title="Cells">
					<HstNumber   v-model="state.cellGap"  title="Cell Gap"/>
					<HstCheckbox v-model="state.showLabel" title="Show Label"/>
					<HstCheckbox v-model="state.showAxis"  title="Show Axis"/>
				</StoryGroup>
				<StoryGroup title="Legend">
					<HstCheckbox v-model="state.showLegend"         title="Show Legend"/>
					<HstCheckbox v-model="state.showGradientLegend" title="Show Gradient Legend"/>
					<HstSelect   v-model="state.legendPosition"     title="Legend Position" :options="LEGEND_POSITION_OPTIONS"/>
				</StoryGroup>
				<StoryGroup title="Labels">
					<HstText v-model="state.title"    title="Title"/>
					<HstText v-model="state.subtitle" title="Subtitle"/>
				</StoryGroup>
			</template>
		</Variant>

		<Variant
				title="Functional"
				:init-state="() => useStoryInitState<Partial<IChartHeatmapProps>>({
					animated: true,
					animationDuration: 600,
					showTooltip: true,
					height: 440
				})"
		>
			<template #default="{ state }">
				<origam-chart-heatmap
						:series="FIXTURE_ACTIVITY"
						:x-categories="HOURS"
						:y-categories="DAYS"
						:animated="state.animated"
						:animation-duration="state.animationDuration"
						:show-tooltip="state.showTooltip"
						:height="state.height"
						title="Functional controls"
				/>
			</template>
			<template #controls="{ state }">
				<StoryGroup title="Animation">
					<HstCheckbox v-model="state.animated"         title="Animated"/>
					<HstNumber   v-model="state.animationDuration" title="Duration (ms)" :min="0" :max="3000" :step="100"/>
				</StoryGroup>
				<StoryGroup title="Tooltip">
					<HstCheckbox v-model="state.showTooltip" title="Show Tooltip"/>
				</StoryGroup>
			</template>
		</Variant>

		<Variant title="Events - point-click">
			<div
					class="story-shell"
					data-cy="heatmap-emit-point-click"
			>
				<origam-chart-heatmap
						:series="FIXTURE_ACTIVITY"
						:x-categories="HOURS"
						:y-categories="DAYS"
						:height="400"
						title="Click a cell"
						data-cy="heatmap-emit-point-click-chart"
						@point-click="logEvent('point-click', $event)"
				/>
			</div>
		</Variant>

		<Variant title="Events - legend-click">
			<div
					class="story-shell"
					data-cy="heatmap-emit-legend-click"
			>
				<origam-chart-heatmap
						:series="FIXTURE_ACTIVITY"
						:x-categories="HOURS"
						:y-categories="DAYS"
						:height="400"
						:show-legend="true"
						title="Click a legend entry"
						data-cy="heatmap-emit-legend-click-chart"
						@legend-click="logEvent('legend-click', $event)"
				/>
			</div>
		</Variant>

		<Variant title="Events - series-toggle">
			<div
					class="story-shell"
					data-cy="heatmap-emit-series-toggle"
			>
				<origam-chart-heatmap
						:series="FIXTURE_ACTIVITY"
						:x-categories="HOURS"
						:y-categories="DAYS"
						:height="400"
						:show-legend="true"
						title="Toggle series visibility"
						data-cy="heatmap-emit-series-toggle-chart"
						@series-toggle="logEvent('series-toggle', $event)"
				/>
			</div>
		</Variant>

		<Variant title="Slots - tooltip">
			<div
					class="story-shell"
					data-cy="heatmap-slot-tooltip"
			>
				<origam-chart-heatmap
						:series="FIXTURE_ACTIVITY"
						:x-categories="HOURS"
						:y-categories="DAYS"
						:height="400"
						title="Custom tooltip"
						data-cy="heatmap-slot-tooltip-chart"
				>
					<template #tooltip="{ point }">
						<div class="custom-tooltip">
							<strong>{{ point?.x }} h</strong>
							<span>{{ point?.y }} commits</span>
						</div>
					</template>
				</origam-chart-heatmap>
			</div>
		</Variant>

		<Variant title="Slots - legend-item">
			<div
					class="story-shell"
					data-cy="heatmap-slot-legend-item"
			>
				<origam-chart-heatmap
						:series="FIXTURE_ACTIVITY"
						:x-categories="HOURS"
						:y-categories="DAYS"
						:height="400"
						:show-legend="true"
						title="Custom legend item"
						data-cy="heatmap-slot-legend-item-chart"
				>
					<template #legend-item="{ series, index, visible }">
						<span :style="{ opacity: visible ? 1 : 0.4 }">
							[{{ index }}] {{ series.name }}
						</span>
					</template>
				</origam-chart-heatmap>
			</div>
		</Variant>

		<Variant title="Slots - title">
			<div
					class="story-shell"
					data-cy="heatmap-slot-title"
			>
				<origam-chart-heatmap
						:series="FIXTURE_ACTIVITY"
						:x-categories="HOURS"
						:y-categories="DAYS"
						:height="400"
						data-cy="heatmap-slot-title-chart"
				>
					<template #title>
						<h2>Custom <em>title</em> slot</h2>
					</template>
				</origam-chart-heatmap>
			</div>
		</Variant>

		<Variant title="Slots - empty">
			<div
					class="story-shell"
					data-cy="heatmap-slot-empty"
			>
				<origam-chart-heatmap
						:series="[]"
						:height="320"
						title="Empty state"
						data-cy="heatmap-slot-empty-chart"
				>
					<template #empty>
						<div class="custom-empty">
							No activity data available for this period.
						</div>
					</template>
				</origam-chart-heatmap>
			</div>
		</Variant>

		<Variant
				title="Default"
				:init-state="() => useStoryInitState<IChartHeatmapProps>({
					series: FIXTURE_ACTIVITY,
					xCategories: HOURS,
					yCategories: DAYS,
					title: 'GitHub-style activity grid',
					subtitle: 'Commits per weekday × hour',
					colorRange: ['info', 'danger'],
					cellGap: 2,
					showLabel: true,
					showAxis: true,
					showGradientLegend: true,
					showLegend: true,
					legendPosition: 'bottom',
					animated: true,
					showTooltip: true,
					height: 440
				})"
		>
			<template #default="{ state }">
				<origam-chart-heatmap
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
					<HstSelect   v-model="state.bgColor"          title="Bg Color"        :options="INTENT_OPTIONS"/>
					<HstSelect   v-model="state.rounded"          title="Rounded"         :options="ROUNDED_OPTIONS"/>
					<HstSelect   v-model="state.elevation"        title="Elevation"       :options="ELEVATION_OPTIONS"/>
					<HstNumber   v-model="state.height"           title="Height (px)"/>
					<HstText     v-model="state.aspectRatio"      title="Aspect Ratio"/>
					<HstNumber   v-model="state.cellGap"          title="Cell Gap"/>
					<HstSelect   v-model="state.legendPosition"   title="Legend Position" :options="LEGEND_POSITION_OPTIONS"/>
					<HstCheckbox v-model="state.showLabel"         title="Show Label"/>
					<HstCheckbox v-model="state.showAxis"          title="Show Axis"/>
					<HstCheckbox v-model="state.showGradientLegend" title="Show Gradient Legend"/>
					<HstCheckbox v-model="state.showLegend"        title="Show Legend"/>
				</StoryGroup>
				<StoryGroup title="Functional">
					<HstCheckbox v-model="state.animated"    title="Animated"/>
					<HstCheckbox v-model="state.showTooltip" title="Show Tooltip"/>
					<HstNumber   v-model="state.animationDuration" title="Duration (ms)" :min="0" :max="3000" :step="100"/>
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

	import { OrigamChartHeatmap } from '@origam/components'
	import type { IChartHeatmapProps, IChartSeries } from '@origam/interfaces'

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

	const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
	const HOURS = Array.from({ length: 24 }, (_, i) => String(i).padStart(2, '0') + 'h')

	const seedRandom = (seed: number): (() => number) => {
		let s = seed
		return () => {
			s = (s * 16807 + 0) % 2147483647
			return (s - 1) / 2147483646
		}
	}

	const buildActivityData = (): Array<{ x: number | string, y: number | string, value: number }> => {
		const rand = seedRandom(42)
		const data: Array<{ x: number | string, y: number | string, value: number }> = []
		for (const day of DAYS) {
			for (const hour of HOURS) {
				const base = rand() * 5
				const spike = rand() > 0.93 ? rand() * 45 : 0
				data.push({ x: hour, y: day, value: Math.round(base + spike) })
			}
		}
		return data
	}

	const FIXTURE_ACTIVITY: Array<IChartSeries> = [
		{ name: 'Commits', data: buildActivityData() }
	]

</script>

<style scoped>
	.story-shell {
		display: flex;
		flex-direction: column;
		gap: 12px;
		padding: 16px;
	}

	.custom-tooltip {
		display: flex;
		flex-direction: column;
		gap: 2px;
		padding: 4px;
	}

	.custom-empty {
		color: var(--origam-color-text-secondary, #6b7280);
		font-style: italic;
	}
</style>

<docs
		lang="md"
		src="@docs/components/Chart/OrigamChartHeatmap.md"
/>
