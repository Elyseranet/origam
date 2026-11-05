<template>
	<Story
			group="components"
			title="Chart/OrigamChartPolarBar"
	>

		<Variant
				title="Design"
				:init-state="() => useStoryInitState<Partial<IChartPolarBarProps>>({ height: 400 })"
		>
			<template #default="{ state }">
				<origam-chart-polar-bar
						:series="FIXTURE_WEEKLY"
						:categories="FIXTURE_WEEKLY_CATEGORIES"
						:bg-color="state.bgColor"
						:rounded="state.rounded"
						:elevation="state.elevation"
						:width="state.width"
						:height="state.height"
						:color-scheme="state.colorScheme ? [state.colorScheme] : undefined"
						:aspect-ratio="state.aspectRatio"
						title="Hours of activity"
						subtitle="By day of week"
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
				<StoryGroup title="Dimension">
					<HstText   v-model="state.width"       title="Width"/>
					<HstNumber v-model="state.height"      title="Height (px)" :min="100" :max="800" :step="20"/>
					<HstText   v-model="state.aspectRatio" title="Aspect Ratio (e.g. 16/9)"/>
				</StoryGroup>
				<StoryGroup title="Color Scheme">
					<HstText v-model="state.colorScheme" title="colorScheme (single intent or CSS color)"/>
				</StoryGroup>
			</template>
		</Variant>

		<Variant
				title="Functional"
				:init-state="() => useStoryInitState<Partial<IChartPolarBarProps>>({
					height: 400,
					innerRadius: 0.1,
					startAngle: 0,
					gap: 0.02,
					animated: true,
					animationDuration: 600,
					showLabel: true,
					showValue: false,
					showLegend: true,
					showTooltip: true,
					legendPosition: 'bottom'
				})"
		>
			<template #default="{ state }">
				<origam-chart-polar-bar
						:series="FIXTURE_WEEKLY"
						:categories="FIXTURE_WEEKLY_CATEGORIES"
						:height="state.height"
						:inner-radius="state.innerRadius"
						:start-angle="state.startAngle"
						:gap="state.gap"
						:animated="state.animated"
						:animation-duration="state.animationDuration"
						:show-label="state.showLabel"
						:show-value="state.showValue"
						:show-legend="state.showLegend"
						:show-tooltip="state.showTooltip"
						:legend-position="state.legendPosition"
						title="Hours of activity"
						subtitle="By day of week"
				/>
			</template>
			<template #controls="{ state }">
				<StoryGroup title="Geometry">
					<HstNumber v-model="state.innerRadius"  title="Inner Radius"     :min="0"    :max="0.8"  :step="0.05"/>
					<HstNumber v-model="state.startAngle"   title="Start Angle (rad)" :min="-3.14" :max="3.14" :step="0.1"/>
					<HstNumber v-model="state.gap"          title="Gap (rad)"         :min="0"    :max="0.15" :step="0.01"/>
				</StoryGroup>
				<StoryGroup title="Labels">
					<HstCheckbox v-model="state.showLabel" title="Show Category Label"/>
					<HstCheckbox v-model="state.showValue" title="Show Value Label"/>
				</StoryGroup>
				<StoryGroup title="Legend">
					<HstCheckbox v-model="state.showLegend"      title="Show Legend"/>
					<HstSelect   v-model="state.legendPosition"  title="Legend Position" :options="LEGEND_POSITION_OPTIONS"/>
				</StoryGroup>
				<StoryGroup title="Tooltip">
					<HstCheckbox v-model="state.showTooltip" title="Show Tooltip"/>
				</StoryGroup>
				<StoryGroup title="Animation">
					<HstCheckbox v-model="state.animated"          title="Animated"/>
					<HstNumber   v-model="state.animationDuration" title="Duration (ms)" :min="100" :max="2000" :step="100"/>
				</StoryGroup>
			</template>
		</Variant>

		<Variant title="Events - point-click">
			<div class="story-shell">
				<origam-chart-polar-bar
						:series="FIXTURE_WEEKLY"
						:categories="FIXTURE_WEEKLY_CATEGORIES"
						:height="360"
						title="Click a wedge"
						@point-click="logEvent('point-click', $event)"
				/>
			</div>
		</Variant>

		<Variant title="Events - legend-click">
			<div class="story-shell">
				<origam-chart-polar-bar
						:series="FIXTURE_WEEKLY"
						:categories="FIXTURE_WEEKLY_CATEGORIES"
						:height="360"
						title="Click a legend entry"
						@legend-click="logEvent('legend-click', $event)"
				/>
			</div>
		</Variant>

		<Variant title="Events - series-toggle">
			<div class="story-shell">
				<origam-chart-polar-bar
						:series="FIXTURE_WEEKLY"
						:categories="FIXTURE_WEEKLY_CATEGORIES"
						:height="360"
						title="Toggle visibility via legend"
						@series-toggle="logEvent('series-toggle', $event)"
				/>
			</div>
		</Variant>

		<Variant title="Slots - Title">
			<origam-chart-polar-bar
					:series="FIXTURE_WEEKLY"
					:categories="FIXTURE_WEEKLY_CATEGORIES"
					:height="380"
			>
				<template #title>
					<strong>Custom title block</strong>
					<em style="font-size: 0.8rem; display: block;">via #title slot</em>
				</template>
			</origam-chart-polar-bar>
		</Variant>

		<Variant title="Slots - Tooltip">
			<origam-chart-polar-bar
					:series="FIXTURE_WEEKLY"
					:categories="FIXTURE_WEEKLY_CATEGORIES"
					:height="380"
					title="Custom tooltip — hover a wedge"
			>
				<template #tooltip="{ point, category, percentage }">
					<div class="custom-tooltip">
						<strong>{{ category }}</strong>
						<span>{{ typeof point?.y === 'number' ? point.y : (point?.y ?? '') }} hrs</span>
						<span class="custom-tooltip__pct">{{ percentage }} of week</span>
					</div>
				</template>
			</origam-chart-polar-bar>
		</Variant>

		<Variant title="Slots - Legend-Item">
			<origam-chart-polar-bar
					:series="FIXTURE_WEEKLY"
					:categories="FIXTURE_WEEKLY_CATEGORIES"
					:height="380"
					title="Custom legend items"
			>
				<template #legend-item="{ series, index, visible }">
					<span :style="{ opacity: visible ? 1 : 0.4, fontStyle: 'italic' }">
						{{ index + 1 }}. {{ series.name }}
					</span>
				</template>
			</origam-chart-polar-bar>
		</Variant>

		<Variant title="Slots - Empty">
			<origam-chart-polar-bar
					:series="[]"
					:categories="[]"
					:height="320"
					title="Empty state"
			>
				<template #empty>
					<div class="custom-empty">
						No activity data available for this period.
					</div>
				</template>
			</origam-chart-polar-bar>
		</Variant>

		<Variant title="Responsive width">
			<div
					v-for="w in [480, 960]"
					:key="w"
					:style="{ width: `${ w }px`, maxWidth: '100%', marginBottom: '1rem' }"
					:data-cy="`origam-chart-polar-bar-responsive-${ w }`"
			>
				<origam-chart-polar-bar
						:series="FIXTURE_WEEKLY" :categories="FIXTURE_WEEKLY_CATEGORIES"
						:title="`${ w }px container`"
				/>
			</div>
		</Variant>

		<Variant
				title="Default"
				:init-state="() => useStoryInitState<IChartPolarBarProps>({
					series: FIXTURE_WEEKLY,
					categories: FIXTURE_WEEKLY_CATEGORIES,
					height: 400,
					innerRadius: 0.1,
					startAngle: 0,
					gap: 0.02,
					animated: true,
					animationDuration: 600,
					showLabel: true,
					showValue: false,
					showLegend: true,
					showTooltip: true,
					legendPosition: 'bottom',
					title: 'Hours of activity',
					subtitle: 'By day of week'
				})"
		>
			<template #default="{ state }">
				<origam-chart-polar-bar
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
					<HstSelect   v-model="state.bgColor"   title="Bg Color"  :options="COLOR_OPTIONS"/>
					<HstSelect   v-model="state.rounded"   title="Rounded"   :options="ROUNDED_OPTIONS"/>
					<HstSelect   v-model="state.elevation" title="Elevation" :options="ELEVATION_OPTIONS"/>
					<HstNumber   v-model="state.height"    title="Height (px)" :min="100" :max="800" :step="20"/>
				</StoryGroup>
				<StoryGroup title="Functional">
					<HstNumber   v-model="state.innerRadius"       title="Inner Radius"      :min="0"     :max="0.8"   :step="0.05"/>
					<HstNumber   v-model="state.startAngle"        title="Start Angle (rad)" :min="-3.14" :max="3.14"  :step="0.1"/>
					<HstNumber   v-model="state.gap"               title="Gap (rad)"         :min="0"     :max="0.15"  :step="0.01"/>
					<HstCheckbox v-model="state.showLabel"         title="Show Label"/>
					<HstCheckbox v-model="state.showValue"         title="Show Value"/>
					<HstCheckbox v-model="state.showLegend"        title="Show Legend"/>
					<HstSelect   v-model="state.legendPosition"    title="Legend Position"   :options="LEGEND_POSITION_OPTIONS"/>
					<HstCheckbox v-model="state.showTooltip"       title="Show Tooltip"/>
					<HstCheckbox v-model="state.animated"          title="Animated"/>
					<HstNumber   v-model="state.animationDuration" title="Animation Duration (ms)" :min="100" :max="2000" :step="100"/>
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

	import { OrigamChartPolarBar } from '@origam/components'
	import type { IChartPolarBarProps, IChartSeries } from '@origam/interfaces'

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

	const FIXTURE_WEEKLY_CATEGORIES = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

	const FIXTURE_WEEKLY: Array<IChartSeries> = [
		{ name: 'Activity (hrs)', data: [8, 9, 7, 8, 10, 4, 3] }
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

	.custom-tooltip__pct {
		font-size: 0.75rem;
		opacity: 0.8;
	}

	.custom-empty {
		color: var(--origam-color-text-secondary, #6b7280);
		font-style: italic;
	}
</style>

<docs
		lang="md"
		src="@docs/components/Chart/OrigamChartPolarBar.md"
/>
