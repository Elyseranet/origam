<template>
	<Story
			group="components"
			title="Chart/OrigamChartTreemap"
	>

		<Variant
				title="Design"
				:init-state="() => useStoryInitState<Partial<IChartTreemapProps>>({
					title: 'Tech Portfolio',
					subtitle: '% allocation',
					bgColor: undefined,
					rounded: undefined,
					elevation: undefined,
					colorScheme: [],
					aspectRatio: undefined,
					animated: true,
					animationDuration: 600,
					showLabel: true,
					algorithm: 'squarified',
					legendPosition: 'bottom',
					showLegend: true,
					showTooltip: true,
					height: 400
				})"
		>
			<template #default="{ state }">
				<origam-chart-treemap
						:series="FIXTURE_TECH"
						:title="state.title"
						:subtitle="state.subtitle"
						:bg-color="state.bgColor"
						:rounded="state.rounded"
						:elevation="state.elevation"
						:color-scheme="state.colorScheme && state.colorScheme.length ? state.colorScheme : undefined"
						:aspect-ratio="state.aspectRatio || undefined"
						:animated="state.animated"
						:animation-duration="state.animationDuration"
						:show-label="state.showLabel"
						:algorithm="state.algorithm"
						:legend-position="state.legendPosition"
						:show-legend="state.showLegend"
						:show-tooltip="state.showTooltip"
						:height="state.height"
				/>
			</template>
			<template #controls="{ state }">
				<StoryGroup title="Color">
					<HstSelect v-model="state.bgColor"   title="Bg Color"  :options="COLOR_OPTIONS"/>
				</StoryGroup>
				<StoryGroup title="Shape">
					<HstSelect v-model="state.rounded"   title="Rounded"   :options="ROUNDED_OPTIONS"/>
					<HstSelect v-model="state.elevation" title="Elevation" :options="ELEVATION_OPTIONS"/>
				</StoryGroup>
				<StoryGroup title="Palette">
					<HstText   v-model="state.aspectRatio"      title="Aspect Ratio"/>
				</StoryGroup>
				<StoryGroup title="Layout Algorithm">
					<HstSelect v-model="state.algorithm"        title="Algorithm"        :options="ALGORITHM_OPTIONS"/>
					<HstSelect v-model="state.legendPosition"   title="Legend Position"  :options="LEGEND_POSITION_OPTIONS"/>
				</StoryGroup>
				<StoryGroup title="Display">
					<HstCheckbox v-model="state.showLabel"   title="Show Label"/>
					<HstCheckbox v-model="state.showLegend"  title="Show Legend"/>
					<HstCheckbox v-model="state.showTooltip" title="Show Tooltip"/>
				</StoryGroup>
				<StoryGroup title="Animation">
					<HstCheckbox v-model="state.animated"          title="Animated"/>
					<HstNumber   v-model="state.animationDuration" title="Duration (ms)" :min="100" :max="2000" :step="100"/>
				</StoryGroup>
				<StoryGroup title="Dimension">
					<HstNumber v-model="state.height" title="Height (px)" :min="100" :max="800" :step="20"/>
				</StoryGroup>
				<StoryGroup title="Title">
					<HstText v-model="state.title"    title="Title"/>
					<HstText v-model="state.subtitle" title="Subtitle"/>
				</StoryGroup>
			</template>
		</Variant>

		<Variant
				title="Functional"
				:init-state="() => useStoryInitState<Partial<IChartTreemapProps>>({
					algorithm: 'squarified',
					height: 400,
					animated: true,
					showLegend: true,
					showTooltip: true,
					showLabel: true,
					legendPosition: 'bottom'
				})"
		>
			<template #default="{ state }">
				<div
						class="story-shell"
						data-cy="treemap-functional"
				>
					<origam-chart-treemap
							:series="FIXTURE_TECH"
							:algorithm="state.algorithm"
							:height="state.height"
							:animated="state.animated"
							:show-legend="state.showLegend"
							:show-tooltip="state.showTooltip"
							:show-label="state.showLabel"
							:legend-position="state.legendPosition"
							title="Tech Portfolio"
							subtitle="% allocation"
							data-cy="treemap-functional-chart"
					/>
				</div>
			</template>
			<template #controls="{ state }">
				<StoryGroup title="Data">
					<HstSelect v-model="state.algorithm"      title="Algorithm"       :options="ALGORITHM_OPTIONS"/>
					<HstSelect v-model="state.legendPosition" title="Legend Position" :options="LEGEND_POSITION_OPTIONS"/>
				</StoryGroup>
				<StoryGroup title="Display">
					<HstCheckbox v-model="state.showLabel"   title="Show Label"/>
					<HstCheckbox v-model="state.showLegend"  title="Show Legend"/>
					<HstCheckbox v-model="state.showTooltip" title="Show Tooltip"/>
				</StoryGroup>
				<StoryGroup title="Animation">
					<HstCheckbox v-model="state.animated" title="Animated"/>
				</StoryGroup>
				<StoryGroup title="Layout">
					<HstNumber v-model="state.height" title="Height (px)" :min="100" :max="800" :step="20"/>
				</StoryGroup>
			</template>
		</Variant>

		<Variant title="Events - point-click">
			<div
					class="story-shell"
					data-cy="treemap-emit-point-click"
			>
				<origam-chart-treemap
						:series="FIXTURE_BUDGET"
						:height="360"
						title="Click a tile"
						data-cy="treemap-emit-point-click-chart"
						@point-click="logEvent('point-click', $event)"
				/>
			</div>
		</Variant>

		<Variant title="Events - legend-click">
			<div
					class="story-shell"
					data-cy="treemap-emit-legend-click"
			>
				<origam-chart-treemap
						:series="FIXTURE_BUDGET"
						:height="360"
						title="Click a legend entry"
						data-cy="treemap-emit-legend-click-chart"
						@legend-click="logEvent('legend-click', $event)"
				/>
			</div>
		</Variant>

		<Variant title="Events - series-toggle">
			<div
					class="story-shell"
					data-cy="treemap-emit-series-toggle"
			>
				<origam-chart-treemap
						:series="FIXTURE_BUDGET"
						:height="360"
						title="Toggle a legend entry"
						data-cy="treemap-emit-series-toggle-chart"
						@series-toggle="logEvent('series-toggle', $event)"
				/>
			</div>
		</Variant>

		<Variant title="Slots - Tooltip">
			<div
					class="story-shell"
					data-cy="treemap-slot-tooltip"
			>
				<origam-chart-treemap
						:series="FIXTURE_TECH"
						:height="400"
						title="Custom tooltip"
						data-cy="treemap-slot-tooltip-chart"
				>
					<template #tooltip="{ point, category }">
						<div class="custom-tooltip">
							<strong>{{ category }}</strong>
							<span>{{ typeof point?.y === 'number' ? point.y.toLocaleString() : (point?.y ?? '') }}%</span>
						</div>
					</template>
				</origam-chart-treemap>
			</div>
		</Variant>

		<Variant title="Slots - Legend-item">
			<div
					class="story-shell"
					data-cy="treemap-slot-legend-item"
			>
				<origam-chart-treemap
						:series="FIXTURE_BUDGET"
						:height="380"
						title="Custom legend"
						data-cy="treemap-slot-legend-item-chart"
				>
					<template #legend-item="{ series, visible }">
						<span
								class="custom-legend-item"
								:style="{ opacity: visible ? 1 : 0.4 }"
						>
							{{ series.name }}
						</span>
					</template>
				</origam-chart-treemap>
			</div>
		</Variant>

		<Variant title="Slots - Tile-label">
			<div
					class="story-shell"
					data-cy="treemap-slot-tile-label"
			>
				<origam-chart-treemap
						:series="FIXTURE_TECH"
						:height="400"
						title="Custom tile label"
						data-cy="treemap-slot-tile-label-chart"
				>
					<template #tile-label="{ name, formatted }">
						<tspan>{{ name }} ({{ formatted }}%)</tspan>
					</template>
				</origam-chart-treemap>
			</div>
		</Variant>

		<Variant title="Slots - Title">
			<div
					class="story-shell"
					data-cy="treemap-slot-title"
			>
				<origam-chart-treemap
						:series="FIXTURE_TECH"
						:height="400"
						data-cy="treemap-slot-title-chart"
				>
					<template #title>
						<strong class="custom-title">Custom title via slot</strong>
					</template>
				</origam-chart-treemap>
			</div>
		</Variant>

		<Variant title="Slots - Empty">
			<div
					class="story-shell"
					data-cy="treemap-slot-empty"
			>
				<origam-chart-treemap
						:series="[]"
						:height="320"
						title="Empty state"
						data-cy="treemap-slot-empty-chart"
				>
					<template #empty>
						<div class="custom-empty">
							No portfolio data available. Add assets to see the breakdown.
						</div>
					</template>
				</origam-chart-treemap>
			</div>
		</Variant>

		<Variant title="Responsive width">
			<div
					v-for="w in [480, 960]"
					:key="w"
					:style="{ width: `${ w }px`, maxWidth: '100%', marginBottom: '1rem' }"
					:data-cy="`origam-chart-treemap-responsive-${ w }`"
			>
				<origam-chart-treemap
						:series="FIXTURE_BUDGET"
						:title="`${ w }px container`"
				/>
			</div>
		</Variant>

		<Variant
				title="Default"
				:init-state="() => useStoryInitState<IChartTreemapProps>({
					series: [],
					algorithm: 'squarified',
					height: 400,
					animated: true,
					showLegend: true,
					showTooltip: true,
					showLabel: true,
					legendPosition: 'bottom',
					title: 'Tech Portfolio',
					subtitle: '% allocation'
				})"
		>
			<template #default="{ state }">
				<origam-chart-treemap
						v-bind="state"
						:series="FIXTURE_TECH"
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
					<HstSelect   v-model="state.bgColor"          title="Bg Color"        :options="COLOR_OPTIONS"/>
					<HstSelect   v-model="state.rounded"          title="Rounded"         :options="ROUNDED_OPTIONS"/>
					<HstSelect   v-model="state.elevation"        title="Elevation"       :options="ELEVATION_OPTIONS"/>
					<HstSelect   v-model="state.algorithm"        title="Algorithm"       :options="ALGORITHM_OPTIONS"/>
					<HstSelect   v-model="state.legendPosition"   title="Legend Position" :options="LEGEND_POSITION_OPTIONS"/>
					<HstNumber   v-model="state.height"           title="Height (px)"     :min="100" :max="800" :step="20"/>
					<HstText     v-model="state.aspectRatio"      title="Aspect Ratio"/>
				</StoryGroup>
				<StoryGroup title="Functional">
					<HstCheckbox v-model="state.showLabel"        title="Show Label"/>
					<HstCheckbox v-model="state.showLegend"       title="Show Legend"/>
					<HstCheckbox v-model="state.showTooltip"      title="Show Tooltip"/>
					<HstCheckbox v-model="state.animated"         title="Animated"/>
					<HstNumber   v-model="state.animationDuration" title="Duration (ms)"  :min="100" :max="2000" :step="100"/>
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

	import { OrigamChartTreemap } from '@origam/components'

	import type { IChartPoint, IChartSeries, IChartTreemapProps } from '@origam/interfaces'

	import StoryGroup from '@stories/components/_shared/StoryGroup.vue'
	import { useStoryInitState } from '@stories/composables'
	import {
		COLOR_OPTIONS,
		ELEVATION_OPTIONS,
		ROUNDED_OPTIONS
	} from '@stories/const'

	const ALGORITHM_OPTIONS = [
		{ value: 'squarified', label: 'squarified' },
		{ value: 'slice-dice', label: 'slice-dice' }
	]

	const LEGEND_POSITION_OPTIONS = [
		{ value: 'top', label: 'top' },
		{ value: 'bottom', label: 'bottom' },
		{ value: 'left', label: 'left' },
		{ value: 'right', label: 'right' }
	]

	const FIXTURE_TECH: Array<IChartSeries> = [
		{
			name: 'Tech Portfolio',
			data: [
				{ name: 'AAPL', value: 25 },
				{ name: 'MSFT', value: 18 },
				{ name: 'GOOG', value: 14 },
				{ name: 'AMZN', value: 11 },
				{ name: 'NVDA', value: 9 },
				{ name: 'META', value: 7 },
				{ name: 'TSLA', value: 5 },
				{ name: 'ORCL', value: 4 },
				{ name: 'IBM', value: 4 },
				{ name: 'ADBE', value: 3 }
			] as Array<any>
		}
	]

	const FIXTURE_BUDGET: Array<IChartSeries> = [
		{
			name: 'Budget',
			data: [
				{ name: 'Engineering', value: 42 },
				{ name: 'Marketing', value: 22 },
				{ name: 'Sales', value: 18 },
				{ name: 'Support', value: 11 },
				{ name: 'Ops', value: 7 }
			] as Array<any>
		}
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

	.custom-legend-item {
		font-size: 0.8125rem;
		padding: 2px 4px;
		cursor: pointer;
	}

	.custom-title {
		font-size: 1.125rem;
		color: var(--origam-color-text-primary);
	}

	.custom-empty {
		color: var(--origam-color-text-secondary, #6b7280);
		font-style: italic;
		text-align: center;
		max-width: 280px;
	}
</style>

<docs
		lang="md"
		src="@docs/components/Chart/OrigamChartTreemap.md"
/>
