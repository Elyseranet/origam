<template>
	<Story
			group="components"
			title="Chart/OrigamChartRadar"
	>

		<Variant
				title="Design"
				:init-state="() => useStoryInitState<Partial<IChartRadarProps>>({
					series: FIXTURE_RADAR,
					categories: FIXTURE_RADAR_AXES,
					height: 360,
					title: 'Player comparison',
					subtitle: '6 skill dimensions',
					showLegend: true,
					legendPosition: 'bottom'
				})"
		>
			<template #default="{ state }">
				<origam-chart-radar
						:series="state.series ?? FIXTURE_RADAR"
						:categories="state.categories ?? FIXTURE_RADAR_AXES"
						:title="state.title"
						:subtitle="state.subtitle"
						:height="state.height"
						:bg-color="state.bgColor"
						:rounded="state.rounded"
						:elevation="state.elevation"
						:show-legend="state.showLegend"
						:legend-position="state.legendPosition"
				/>
			</template>
			<template #controls="{ state }">
				<StoryGroup title="Color">
					<HstSelect v-model="state.bgColor" title="Bg Color" :options="COLOR_OPTIONS"/>
				</StoryGroup>
				<StoryGroup title="Shape">
					<HstSelect v-model="state.rounded"   title="Rounded"   :options="ROUNDED_OPTIONS"/>
					<HstSelect v-model="state.elevation" title="Elevation" :options="ELEVATION_OPTIONS"/>
				</StoryGroup>
				<StoryGroup title="Legend">
					<HstCheckbox v-model="state.showLegend"    title="Show Legend"/>
					<HstSelect   v-model="state.legendPosition" title="Legend Position" :options="LEGEND_POSITION_OPTIONS"/>
				</StoryGroup>
				<StoryGroup title="Header">
					<HstText v-model="state.title"    title="Title"/>
					<HstText v-model="state.subtitle" title="Subtitle"/>
				</StoryGroup>
				<StoryGroup title="Dimension">
					<HstNumber v-model="state.height" title="Height (px)" :min="100" :max="800" :step="20"/>
					<HstText   v-model="state.width"  title="Width"/>
				</StoryGroup>
				<StoryGroup title="Spacing">
					<HstText v-model="state.margin"  title="Margin"/>
					<HstText v-model="state.padding" title="Padding"/>
				</StoryGroup>
			</template>
		</Variant>

		<Variant
				title="Functional"
				:init-state="() => useStoryInitState<Partial<IChartRadarProps>>({
					series: FIXTURE_RADAR,
					categories: FIXTURE_RADAR_AXES,
					height: 360,
					animated: true,
					animationDuration: 600,
					showTooltip: true,
					showLegend: true,
					legendPosition: 'bottom'
				})"
		>
			<template #default="{ state }">
				<origam-chart-radar
						:series="state.series ?? FIXTURE_RADAR"
						:categories="state.categories ?? FIXTURE_RADAR_AXES"
						:height="state.height"
						:animated="state.animated"
						:animation-duration="state.animationDuration"
						:show-tooltip="state.showTooltip"
						:show-legend="state.showLegend"
						:legend-position="state.legendPosition"
						:aspect-ratio="state.aspectRatio"
				/>
			</template>
			<template #controls="{ state }">
				<StoryGroup title="Data">
					<HstSelect v-model="state.series" title="Series count" :options="SERIES_COUNT_OPTIONS"/>
					<HstSelect v-model="state.categories" title="Categories (spokes)" :options="CATEGORIES_OPTIONS"/>
				</StoryGroup>
				<StoryGroup title="Animation">
					<HstCheckbox v-model="state.animated"        title="Animated"/>
					<HstNumber   v-model="state.animationDuration" title="Duration (ms)" :min="0" :max="2000" :step="100"/>
				</StoryGroup>
				<StoryGroup title="Display">
					<HstCheckbox v-model="state.showTooltip"      title="Show Tooltip"/>
					<HstCheckbox v-model="state.showLegend"       title="Show Legend"/>
					<HstSelect   v-model="state.legendPosition"   title="Legend Position" :options="LEGEND_POSITION_OPTIONS"/>
					<HstText     v-model="state.aspectRatio"      title="Aspect Ratio (e.g. 16/9)"/>
				</StoryGroup>
			</template>
		</Variant>

		<Variant title="Events - point-click">
			<div class="story-shell">
				<p class="hint">Click a data point (circle) on the radar to trigger <code>point-click</code>.</p>
				<origam-chart-radar
						:series="FIXTURE_RADAR"
						:categories="FIXTURE_RADAR_AXES"
						:height="320"
						@point-click="logEvent('point-click', $event)"
				/>
			</div>
		</Variant>

		<Variant title="Events - legend-click">
			<div class="story-shell">
				<p class="hint">Click a legend entry to trigger <code>legend-click</code>.</p>
				<origam-chart-radar
						:series="FIXTURE_RADAR"
						:categories="FIXTURE_RADAR_AXES"
						:height="320"
						@legend-click="logEvent('legend-click', $event)"
				/>
			</div>
		</Variant>

		<Variant title="Events - series-toggle">
			<div class="story-shell">
				<p class="hint">Click a legend entry — the resulting visibility flip emits <code>series-toggle</code>.</p>
				<origam-chart-radar
						:series="FIXTURE_RADAR"
						:categories="FIXTURE_RADAR_AXES"
						:height="320"
						@series-toggle="logEvent('series-toggle', $event)"
				/>
			</div>
		</Variant>

		<Variant title="Slots - Tooltip">
			<div
					class="story-shell"
					data-cy="radar-slot-tooltip"
			>
				<p class="hint">The radar chart does not currently surface a hover tooltip — interaction is limited to the legend. This slot is reserved for future use.</p>
				<origam-chart-radar
						:series="FIXTURE_RADAR"
						:categories="FIXTURE_RADAR_AXES"
						:height="320"
						data-cy="radar-slot-tooltip-chart"
				/>
			</div>
		</Variant>

		<Variant title="Slots - Legend-item">
			<div
					class="story-shell"
					data-cy="radar-slot-legend"
			>
				<origam-chart-radar
						:series="FIXTURE_RADAR"
						:categories="FIXTURE_RADAR_AXES"
						:height="320"
						data-cy="radar-slot-legend-chart"
				>
					<template #legend-item="{ series, visible }">
						<div class="custom-legend-item">
							<span
									class="custom-legend-item__dot"
									:style="{ backgroundColor: visible ? (series.color === 'primary' ? '#3b82f6' : '#10b981') : '#9ca3af' }"
							/>
							<span class="custom-legend-item__name">{{ series.name }}</span>
							<small class="custom-legend-item__state">{{ visible ? 'visible' : 'hidden' }}</small>
						</div>
					</template>
				</origam-chart-radar>
			</div>
		</Variant>

		<Variant title="Slots - Title">
			<div
					class="story-shell"
					data-cy="radar-slot-title"
			>
				<origam-chart-radar
						:series="FIXTURE_RADAR"
						:categories="FIXTURE_RADAR_AXES"
						:height="320"
						data-cy="radar-slot-title-chart"
				>
					<template #title>
						<div class="custom-title">
							<span class="custom-title__main">Skill radar</span>
							<span class="custom-title__badge">live</span>
						</div>
					</template>
				</origam-chart-radar>
			</div>
		</Variant>

		<Variant title="Slots - Empty">
			<div
					class="story-shell"
					data-cy="radar-slot-empty"
			>
				<origam-chart-radar
						:series="[]"
						:categories="FIXTURE_RADAR_AXES"
						:height="240"
						data-cy="radar-slot-empty-chart"
				>
					<template #empty>
						<div class="custom-empty">
							<strong>No players</strong>
							<small>Add at least one series to display the radar.</small>
						</div>
					</template>
				</origam-chart-radar>
			</div>
		</Variant>

		<Variant
				title="Default"
				:init-state="() => useStoryInitState<IChartRadarProps>({
					series: FIXTURE_RADAR,
					categories: FIXTURE_RADAR_AXES,
					height: 360,
					title: 'Player comparison',
					subtitle: '6 skill dimensions',
					showLegend: true,
					legendPosition: 'bottom',
					animated: true,
					animationDuration: 600,
					showTooltip: true
				})"
		>
			<template #default="{ state }">
				<origam-chart-radar
						v-bind="state"
						:series="state.series ?? FIXTURE_RADAR"
						:categories="state.categories ?? FIXTURE_RADAR_AXES"
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
					<HstSelect   v-model="state.bgColor"        title="Bg Color"        :options="COLOR_OPTIONS"/>
					<HstSelect   v-model="state.rounded"        title="Rounded"         :options="ROUNDED_OPTIONS"/>
					<HstSelect   v-model="state.elevation"      title="Elevation"       :options="ELEVATION_OPTIONS"/>
					<HstNumber   v-model="state.height"         title="Height (px)"     :min="100" :max="800" :step="20"/>
					<HstSelect   v-model="state.legendPosition" title="Legend Position" :options="LEGEND_POSITION_OPTIONS"/>
				</StoryGroup>
				<StoryGroup title="Functional">
					<HstCheckbox v-model="state.showLegend"        title="Show Legend"/>
					<HstCheckbox v-model="state.showTooltip"       title="Show Tooltip"/>
					<HstCheckbox v-model="state.animated"          title="Animated"/>
					<HstNumber   v-model="state.animationDuration" title="Duration (ms)" :min="0" :max="2000" :step="100"/>
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

	import { OrigamChartRadar } from '@origam/components'
	import type { IChartRadarProps, IChartSeries } from '@origam/interfaces'

	import StoryGroup from '@stories/components/_shared/StoryGroup.vue'
	import { useStoryInitState } from '@stories/composables'
	import {
		COLOR_OPTIONS,
		ELEVATION_OPTIONS,
		ROUNDED_OPTIONS
	} from '@stories/const'

	const LEGEND_POSITION_OPTIONS = [
		{ value: 'top',    label: 'top' },
		{ value: 'bottom', label: 'bottom' },
		{ value: 'left',   label: 'left' },
		{ value: 'right',  label: 'right' }
	]

	const FIXTURE_RADAR_AXES = ['Speed', 'Power', 'Agility', 'Stamina', 'Skill', 'Defence']
	const FIXTURE_AXES_5     = ['Speed', 'Power', 'Agility', 'Stamina', 'Skill']
	const FIXTURE_AXES_8     = ['Speed', 'Power', 'Agility', 'Stamina', 'Skill', 'Defence', 'Vision', 'Technique']

	const FIXTURE_RADAR: Array<IChartSeries> = [
		{ name: 'Player A', data: [80, 65, 75, 90, 70, 60], color: 'primary' },
		{ name: 'Player B', data: [55, 85, 60, 70, 90, 80], color: 'success' }
	]

	const FIXTURE_RADAR_4: Array<IChartSeries> = [
		{ name: 'Player A', data: [80, 65, 75, 90, 70, 60], color: 'primary' },
		{ name: 'Player B', data: [55, 85, 60, 70, 90, 80], color: 'success' },
		{ name: 'Player C', data: [70, 70, 80, 60, 75, 85], color: 'warning' },
		{ name: 'Player D', data: [90, 55, 65, 80, 60, 70], color: 'danger' }
	]

	const FIXTURE_RADAR_5_SPOKES: Array<IChartSeries> = [
		{ name: 'Player A', data: [80, 65, 75, 90, 70], color: 'primary' },
		{ name: 'Player B', data: [55, 85, 60, 70, 90], color: 'success' }
	]

	const FIXTURE_RADAR_8_SPOKES: Array<IChartSeries> = [
		{ name: 'Player A', data: [80, 65, 75, 90, 70, 60, 85, 72], color: 'primary' },
		{ name: 'Player B', data: [55, 85, 60, 70, 90, 80, 65, 78], color: 'success' }
	]

	const SERIES_COUNT_OPTIONS = [
		{ label: '1 player',  value: FIXTURE_RADAR.slice(0, 1) },
		{ label: '2 players', value: FIXTURE_RADAR },
		{ label: '4 players', value: FIXTURE_RADAR_4 }
	]

	const CATEGORIES_OPTIONS = [
		{ label: '5 spokes', value: FIXTURE_AXES_5 },
		{ label: '6 spokes', value: FIXTURE_RADAR_AXES },
		{ label: '8 spokes', value: FIXTURE_AXES_8 }
	]
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
		background-color: var(--origam-color-success-default, #22c55e);
		color: var(--origam-color-on-success, #ffffff);
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
		src="@docs/components/Chart/OrigamChartRadar.md"
/>
