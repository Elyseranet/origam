<template>
	<Story
			group="components"
			title="Chart/OrigamChartSunburst"
	>

		<Variant
				title="Design"
				:init-state="() => useStoryInitState<Partial<IChartSunburstProps>>({
					title: 'Budget Breakdown',
					subtitle: 'Q1 2026',
					innerRadius: 0.15,
					ringPadding: 1,
					legendPosition: 'bottom',
					showLegend: true,
					showLabel: true,
					bgColor: undefined,
					rounded: undefined,
					elevation: undefined,
					animated: true,
					animationDuration: 600,
					aspectRatio: undefined
				})"
		>
			<template #default="{ state }">
				<origam-chart-sunburst
						:series="FIXTURE_BUDGET_SERIES"
						:title="state.title"
						:subtitle="state.subtitle"
						:inner-radius="state.innerRadius"
						:ring-padding="state.ringPadding"
						:legend-position="state.legendPosition"
						:show-legend="state.showLegend"
						:show-label="state.showLabel"
						:bg-color="state.bgColor || undefined"
						:rounded="state.rounded || undefined"
						:elevation="state.elevation || undefined"
						:animated="state.animated"
						:animation-duration="state.animationDuration"
						:aspect-ratio="state.aspectRatio || undefined"
						:height="380"
				/>
			</template>
			<template #controls="{ state }">
				<StoryGroup title="Content">
					<HstText v-model="state.title"    title="Title"/>
					<HstText v-model="state.subtitle" title="Subtitle"/>
				</StoryGroup>
				<StoryGroup title="Color">
					<HstSelect v-model="state.bgColor" title="Bg Color" :options="COLOR_OPTIONS"/>
				</StoryGroup>
				<StoryGroup title="Shape">
					<HstSelect v-model="state.rounded"   title="Rounded"   :options="ROUNDED_OPTIONS"/>
					<HstSelect v-model="state.elevation" title="Elevation" :options="ELEVATION_OPTIONS"/>
				</StoryGroup>
				<StoryGroup title="Chart Layout">
					<HstSelect v-model="state.legendPosition" title="Legend Position" :options="LEGEND_POSITION_OPTIONS"/>
					<HstCheckbox v-model="state.showLegend" title="Show Legend"/>
					<HstCheckbox v-model="state.showLabel"  title="Show Label"/>
					<HstText     v-model="state.aspectRatio" title="Aspect Ratio (e.g. 16/9)"/>
				</StoryGroup>
				<StoryGroup title="Geometry">
					<HstNumber v-model="state.innerRadius"  title="Inner Radius" :min="0" :max="0.6" :step="0.05"/>
					<HstNumber v-model="state.ringPadding"  title="Ring Padding" :min="0" :max="8"   :step="1"/>
				</StoryGroup>
				<StoryGroup title="Animation">
					<HstCheckbox v-model="state.animated"          title="Animated"/>
					<HstNumber   v-model="state.animationDuration" title="Animation Duration (ms)" :min="100" :max="2000" :step="100"/>
				</StoryGroup>
			</template>
		</Variant>

		<Variant
				title="Functional"
				:init-state="() => useStoryInitState<Partial<IChartSunburstProps>>({
					showTooltip: true,
					showLegend: true,
					showLabel: true,
					animated: true,
					height: 380,
					width: undefined,
					minHeight: undefined,
					maxHeight: undefined
				})"
		>
			<template #default="{ state }">
				<origam-chart-sunburst
						:series="FIXTURE_BUDGET_SERIES"
						:show-tooltip="state.showTooltip"
						:show-legend="state.showLegend"
						:show-label="state.showLabel"
						:animated="state.animated"
						:height="state.height"
						:width="state.width || undefined"
						:min-height="state.minHeight || undefined"
						:max-height="state.maxHeight || undefined"
						title="Budget Breakdown"
				/>
			</template>
			<template #controls="{ state }">
				<StoryGroup title="Visibility">
					<HstCheckbox v-model="state.showTooltip" title="Show Tooltip"/>
					<HstCheckbox v-model="state.showLegend"  title="Show Legend"/>
					<HstCheckbox v-model="state.showLabel"   title="Show Label"/>
					<HstCheckbox v-model="state.animated"    title="Animated"/>
				</StoryGroup>
				<StoryGroup title="Dimension">
					<HstNumber v-model="state.height"    title="Height"/>
					<HstText   v-model="state.width"     title="Width"/>
					<HstText   v-model="state.minHeight" title="Min Height"/>
					<HstText   v-model="state.maxHeight" title="Max Height"/>
				</StoryGroup>
			</template>
		</Variant>

		<Variant title="Events - point-click">
			<div class="story-shell">
				<origam-chart-sunburst
						:series="FIXTURE_BUDGET_SERIES"
						:height="360"
						title="Click a node"
						@point-click="logEvent('point-click', $event)"
				/>
			</div>
		</Variant>

		<Variant title="Events - legend-click">
			<div class="story-shell">
				<origam-chart-sunburst
						:series="FIXTURE_BUDGET_SERIES"
						:height="360"
						title="Click a legend entry"
						@legend-click="logEvent('legend-click', $event)"
				/>
			</div>
		</Variant>

		<Variant title="Events - series-toggle">
			<div class="story-shell">
				<origam-chart-sunburst
						:series="FIXTURE_BUDGET_SERIES"
						:height="360"
						title="Toggle series via legend"
						@series-toggle="logEvent('series-toggle', $event)"
				/>
			</div>
		</Variant>

		<Variant title="Slots - Tooltip">
			<div class="story-shell">
				<origam-chart-sunburst
						:series="FIXTURE_BUDGET_SERIES"
						:height="380"
						title="Custom tooltip"
				>
					<template #tooltip="{ node, path, point }">
						<div class="custom-tooltip">
							<strong>{{ path || node?.name }}</strong>
							<span>{{ typeof point?.y === 'number' ? point.y.toLocaleString() : (point?.y ?? '') }}</span>
						</div>
					</template>
				</origam-chart-sunburst>
			</div>
		</Variant>

		<Variant title="Slots - Empty">
			<div class="story-shell">
				<origam-chart-sunburst
						:series="[]"
						:height="320"
						title="Empty state"
				>
					<template #empty>
						<div class="custom-empty">
							No hierarchy data available for this period.
						</div>
					</template>
				</origam-chart-sunburst>
			</div>
		</Variant>

		<Variant title="Slots - Legend Item">
			<div class="story-shell">
				<origam-chart-sunburst
						:series="FIXTURE_BUDGET_SERIES"
						:height="380"
						title="Custom legend item"
				>
					<template #legend-item="{ series, index, visible }">
						<span :style="{ opacity: visible ? 1 : 0.4, fontStyle: 'italic' }">
							{{ index + 1 }}. {{ series.name }}
						</span>
					</template>
				</origam-chart-sunburst>
			</div>
		</Variant>

		<Variant title="Slots - Title">
			<div class="story-shell">
				<origam-chart-sunburst
						:series="FIXTURE_BUDGET_SERIES"
						:height="380"
				>
					<template #title>
						<div class="custom-title">
							<strong>Custom Title</strong>
							<em>with a rich subtitle</em>
						</div>
					</template>
				</origam-chart-sunburst>
			</div>
		</Variant>

		<Variant title="Responsive width">
			<div
					v-for="w in [480, 960]"
					:key="w"
					:style="{ width: `${ w }px`, maxWidth: '100%', marginBottom: '1rem' }"
					:data-cy="`origam-chart-sunburst-responsive-${ w }`"
			>
				<origam-chart-sunburst
						:series="FIXTURE_BUDGET_SERIES"
						:title="`${ w }px container`"
				/>
			</div>
		</Variant>

		<Variant
				title="Default"
				:init-state="() => useStoryInitState<Partial<IChartSunburstProps>>({
					title: 'Budget Breakdown',
					subtitle: 'Q1 2026',
					innerRadius: 0.15,
					ringPadding: 1,
					legendPosition: 'bottom',
					showLegend: true,
					showLabel: true,
					showTooltip: true,
					animated: true,
					animationDuration: 600,
					height: 400
				})"
		>
			<template #default="{ state }">
				<origam-chart-sunburst
						v-bind="state"
						:series="FIXTURE_BUDGET_SERIES"
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
					<HstSelect   v-model="state.bgColor"         title="Bg Color"         :options="COLOR_OPTIONS"/>
					<HstSelect   v-model="state.rounded"         title="Rounded"          :options="ROUNDED_OPTIONS"/>
					<HstSelect   v-model="state.elevation"       title="Elevation"        :options="ELEVATION_OPTIONS"/>
					<HstSelect   v-model="state.legendPosition"  title="Legend Position"  :options="LEGEND_POSITION_OPTIONS"/>
					<HstNumber   v-model="state.innerRadius"     title="Inner Radius"     :min="0" :max="0.6" :step="0.05"/>
					<HstNumber   v-model="state.ringPadding"     title="Ring Padding"     :min="0" :max="8"   :step="1"/>
					<HstNumber   v-model="state.animationDuration" title="Animation (ms)" :min="100" :max="2000" :step="100"/>
					<HstNumber   v-model="state.height"          title="Height"/>
				</StoryGroup>
				<StoryGroup title="Functional">
					<HstCheckbox v-model="state.showTooltip" title="Show Tooltip"/>
					<HstCheckbox v-model="state.showLegend"  title="Show Legend"/>
					<HstCheckbox v-model="state.showLabel"   title="Show Label"/>
					<HstCheckbox v-model="state.animated"    title="Animated"/>
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

	import { OrigamChartSunburst } from '@origam/components'
	import type { IChartSeries, IChartSunburstDatum, IChartSunburstProps } from '@origam/interfaces'

	import StoryGroup from '@stories/components/_shared/StoryGroup.vue'
	import { useStoryInitState } from '@stories/composables'
	import {
		COLOR_OPTIONS,
		ELEVATION_OPTIONS,
		ROUNDED_OPTIONS
	} from '@stories/const'

	const LEGEND_POSITION_OPTIONS = [
		{ value: 'top',    label: 'Top' },
		{ value: 'bottom', label: 'Bottom' },
		{ value: 'left',   label: 'Left' },
		{ value: 'right',  label: 'Right' }
	]

	const BUDGET_DATA: Array<IChartSunburstDatum> = [
		{
			name: 'Engineering',
			value: 50,
			children: [
				{
					name: 'Frontend',
					value: 20,
					children: [
						{ name: 'Vue',     value: 8 },
						{ name: 'React',   value: 7 },
						{ name: 'Tooling', value: 5 }
					]
				},
				{
					name: 'Backend',
					value: 20,
					children: [
						{ name: 'Node',   value: 10 },
						{ name: 'Python', value: 6 },
						{ name: 'Go',     value: 4 }
					]
				},
				{ name: 'DevOps', value: 10 }
			]
		},
		{
			name: 'Marketing',
			value: 30,
			children: [
				{ name: 'Digital', value: 20 },
				{ name: 'Print',   value: 10 }
			]
		},
		{ name: 'Sales', value: 20 }
	]

	const FIXTURE_BUDGET_SERIES: Array<IChartSeries> = [
		{ name: 'Budget', data: BUDGET_DATA as any }
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

	.custom-title {
		display: flex;
		flex-direction: column;
		gap: 4px;
	}
</style>

<docs
		lang="md"
		src="@docs/components/Chart/OrigamChartSunburst.md"
/>
