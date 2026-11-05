<template>
	<Story
			group="components"
			title="Chart/OrigamChartPolar"
	>

		<Variant
				title="Design"
				:init-state="() => useStoryInitState<Partial<IChartPolarProps>>({
					type: 'pie',
					series: FIXTURE_REVENUE_PIE,
					categories: FIXTURE_COUNTRIES,
					height: 360,
					title: 'Revenue by region',
					subtitle: '2026 fiscal year',
					legendPosition: 'bottom',
					showLegend: true,
					colorScheme: undefined
				})"
		>
			<template #default="{ state }">
				<origam-chart-polar
						:type="state.type"
						:series="FIXTURE_REVENUE_PIE"
						:categories="FIXTURE_COUNTRIES"
						:height="state.height"
						:title="state.title"
						:subtitle="state.subtitle"
						:legend-position="state.legendPosition"
						:show-legend="state.showLegend"
						:rounded="state.rounded"
						:elevation="state.elevation"
						:bg-color="state.bgColor"
						:color-scheme="state.colorScheme || undefined"
						:aspect-ratio="state.aspectRatio"
				/>
			</template>
			<template #controls="{ state }">
				<StoryGroup title="Type">
					<HstSelect v-model="state.type" title="Type" :options="POLAR_KIND_OPTIONS"/>
				</StoryGroup>
				<StoryGroup title="Color">
					<HstSelect v-model="state.bgColor" title="Bg Color" :options="COLOR_OPTIONS"/>
				</StoryGroup>
				<StoryGroup title="Shape">
					<HstSelect v-model="state.rounded"   title="Rounded"   :options="ROUNDED_OPTIONS"/>
					<HstSelect v-model="state.elevation" title="Elevation" :options="ELEVATION_OPTIONS"/>
				</StoryGroup>
				<StoryGroup title="Legend">
					<HstCheckbox v-model="state.showLegend"     title="Show Legend"/>
					<HstSelect   v-model="state.legendPosition" title="Legend Position" :options="LEGEND_POSITION_OPTIONS"/>
				</StoryGroup>
				<StoryGroup title="Dimension">
					<HstText   v-model="state.height"      title="Height"/>
					<HstText   v-model="state.aspectRatio" title="Aspect Ratio"/>
				</StoryGroup>
				<StoryGroup title="Labels">
					<HstText v-model="state.title"    title="Title"/>
					<HstText v-model="state.subtitle" title="Subtitle"/>
				</StoryGroup>
			</template>
		</Variant>

		<Variant
				title="Functional"
				:init-state="() => useStoryInitState<Partial<IChartPolarProps>>({
					type: 'donut',
					series: FIXTURE_REVENUE_PIE,
					categories: FIXTURE_COUNTRIES,
					height: 360,
					donutHoleSize: 0.6,
					showTooltip: true,
					showLegend: true,
					animated: true,
					animationDuration: 600
				})"
		>
			<template #default="{ state }">
				<origam-chart-polar
						:type="state.type"
						:series="FIXTURE_REVENUE_PIE"
						:categories="FIXTURE_COUNTRIES"
						:height="state.height"
						:donut-hole-size="state.donutHoleSize"
						:show-tooltip="state.showTooltip"
						:show-legend="state.showLegend"
						:animated="state.animated"
						:animation-duration="state.animationDuration"
						title="Functional preview"
				/>
			</template>
			<template #controls="{ state }">
				<StoryGroup title="Donut">
					<HstNumber v-model="state.donutHoleSize" title="Donut Hole Size (0–1)" :min="0" :max="1" :step="0.05"/>
				</StoryGroup>
				<StoryGroup title="Visibility">
					<HstCheckbox v-model="state.showTooltip" title="Show Tooltip"/>
					<HstCheckbox v-model="state.showLegend"  title="Show Legend"/>
				</StoryGroup>
				<StoryGroup title="Animation">
					<HstCheckbox v-model="state.animated"          title="Animated"/>
					<HstNumber   v-model="state.animationDuration" title="Duration (ms)" :min="0" :max="2000" :step="100"/>
				</StoryGroup>
			</template>
		</Variant>

		<Variant title="Events - point-click">
			<origam-chart-polar
					type="pie"
					:series="FIXTURE_REVENUE_PIE"
					:categories="FIXTURE_COUNTRIES"
					:height="320"
					title="Click a slice"
					@point-click="logEvent('point-click', $event)"
			/>
		</Variant>

		<Variant title="Events - legend-click">
			<origam-chart-polar
					type="pie"
					:series="FIXTURE_REVENUE_PIE"
					:categories="FIXTURE_COUNTRIES"
					:height="320"
					title="Click a legend entry"
					@legend-click="logEvent('legend-click', $event)"
			/>
		</Variant>

		<Variant title="Events - series-toggle">
			<origam-chart-polar
					type="pie"
					:series="FIXTURE_REVENUE_PIE"
					:categories="FIXTURE_COUNTRIES"
					:height="320"
					title="Toggle a legend entry"
					@series-toggle="logEvent('series-toggle', $event)"
			/>
		</Variant>

		<Variant title="Events - drill">
			<origam-chart-polar
					type="pie"
					:series="FIXTURE_REVENUE_PIE"
					:categories="FIXTURE_COUNTRIES"
					:height="320"
					title="Drill into a slice"
					@drill="logEvent('drill', $event)"
			/>
		</Variant>

		<Variant title="Events - drill-up">
			<origam-chart-polar
					type="pie"
					:series="FIXTURE_REVENUE_PIE"
					:categories="FIXTURE_COUNTRIES"
					:height="320"
					title="Drill up"
					@drill-up="logEvent('drill-up', $event)"
			/>
		</Variant>

		<Variant title="Slots - Tooltip">
			<origam-chart-polar
					type="donut"
					:series="FIXTURE_REVENUE_PIE"
					:categories="FIXTURE_COUNTRIES"
					:height="320"
					title="Custom tooltip slot"
			>
				<template #tooltip="{ point, category }">
					<div class="custom-tooltip">
						<strong>{{ category }}</strong>
						<span class="custom-tooltip__value">${{ point.y }}M</span>
					</div>
				</template>
			</origam-chart-polar>
		</Variant>

		<Variant title="Slots - Legend-Item">
			<origam-chart-polar
					type="pie"
					:series="FIXTURE_REVENUE_PIE"
					:categories="FIXTURE_COUNTRIES"
					:height="320"
					title="Custom legend-item slot"
			>
				<template #legend-item="{ series, visible, index }">
					<div class="custom-legend-item">
						<span
								class="custom-legend-item__dot"
								:style="{ backgroundColor: visible ? '#3b82f6' : '#9ca3af' }"
						/>
						<span class="custom-legend-item__name">{{ FIXTURE_COUNTRIES[index] }}</span>
						<small class="custom-legend-item__state">{{ visible ? 'on' : 'off' }}</small>
					</div>
				</template>
			</origam-chart-polar>
		</Variant>

		<Variant title="Slots - Title">
			<origam-chart-polar
					type="donut"
					:series="FIXTURE_REVENUE_PIE"
					:categories="FIXTURE_COUNTRIES"
					:height="320"
			>
				<template #title>
					<div class="custom-title">
						<span class="custom-title__main">Revenue breakdown</span>
						<span class="custom-title__badge">Q4</span>
					</div>
				</template>
			</origam-chart-polar>
		</Variant>

		<Variant title="Slots - Empty">
			<origam-chart-polar
					type="pie"
					:series="[]"
					:height="240"
					title="Empty state"
			>
				<template #empty>
					<div class="custom-empty">
						<strong>No slices</strong>
						<small>Add data to see the chart.</small>
					</div>
				</template>
			</origam-chart-polar>
		</Variant>

		<Variant title="Responsive width">
			<div
					v-for="w in [480, 960]"
					:key="w"
					:style="{ width: `${ w }px`, maxWidth: '100%', marginBottom: '1rem' }"
					:data-cy="`origam-chart-polar-responsive-${ w }`"
			>
				<origam-chart-polar
						type="pie" :series="FIXTURE_REVENUE_PIE" :categories="FIXTURE_COUNTRIES"
						:title="`${ w }px container`"
				/>
			</div>
		</Variant>

		<Variant
				title="Default"
				:init-state="() => useStoryInitState<Partial<IChartPolarProps>>({
					type: 'pie',
					series: FIXTURE_REVENUE_PIE,
					categories: FIXTURE_COUNTRIES,
					height: 360,
					donutHoleSize: 0.6,
					title: 'Revenue by region',
					subtitle: '2026 fiscal year',
					legendPosition: 'bottom',
					showLegend: true,
					showTooltip: true,
					animated: true
				})"
		>
			<template #default="{ state }">
				<origam-chart-polar
						v-bind="state"
						:series="FIXTURE_REVENUE_PIE"
						:categories="FIXTURE_COUNTRIES"
						@point-click="logEvent('point-click', $event)"
						@legend-click="logEvent('legend-click', $event)"
						@series-toggle="logEvent('series-toggle', $event)"
				/>
			</template>
			<template #controls="{ state }">
				<StoryGroup title="Content">
					<HstSelect v-model="state.type"           title="Type"            :options="POLAR_KIND_OPTIONS"/>
					<HstText   v-model="state.title"          title="Title"/>
					<HstText   v-model="state.subtitle"       title="Subtitle"/>
				</StoryGroup>
				<StoryGroup title="Design">
					<HstSelect v-model="state.legendPosition" title="Legend Position" :options="LEGEND_POSITION_OPTIONS"/>
					<HstSelect v-model="state.rounded"        title="Rounded"         :options="ROUNDED_OPTIONS"/>
					<HstSelect v-model="state.elevation"      title="Elevation"       :options="ELEVATION_OPTIONS"/>
					<HstSelect v-model="state.bgColor"        title="Bg Color"        :options="COLOR_OPTIONS"/>
				</StoryGroup>
				<StoryGroup title="Functional">
					<HstNumber   v-model="state.donutHoleSize"    title="Donut Hole Size (0–1)" :min="0" :max="1" :step="0.05"/>
					<HstNumber   v-model="state.height"           title="Height (px)"           :min="100" :max="800" :step="20"/>
					<HstCheckbox v-model="state.showLegend"       title="Show Legend"/>
					<HstCheckbox v-model="state.showTooltip"      title="Show Tooltip"/>
					<HstCheckbox v-model="state.animated"         title="Animated"/>
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

	import { OrigamChartPolar } from '@origam/components'
	import type { IChartPolarProps, IChartSeries } from '@origam/interfaces'

	import StoryGroup from '@stories/components/_shared/StoryGroup.vue'
	import { useStoryInitState } from '@stories/composables'
	import {
		COLOR_OPTIONS,
		ELEVATION_OPTIONS,
		ROUNDED_OPTIONS
	} from '@stories/const'

	const POLAR_KIND_OPTIONS = [
		{ value: 'pie', label: 'pie' },
		{ value: 'donut', label: 'donut' }
	]

	const LEGEND_POSITION_OPTIONS = [
		{ value: 'top', label: 'top' },
		{ value: 'bottom', label: 'bottom' },
		{ value: 'left', label: 'left' },
		{ value: 'right', label: 'right' }
	]

	const FIXTURE_COUNTRIES = ['US', 'France', 'Germany', 'Japan', 'Brazil']

	const FIXTURE_REVENUE_PIE: Array<IChartSeries> = [
		{ name: 'Revenue', data: [120, 80, 60, 45, 25] }
	]
</script>

<style scoped>
	.custom-tooltip {
		display: flex;
		flex-direction: column;
		gap: 4px;
		padding: 8px 12px;
		background-color: #111827;
		color: #ffffff;
		border-radius: 8px;
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
		background-color: #3b82f6;
		color: #ffffff;
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
		src="@docs/components/Chart/OrigamChartPolar.md"
/>
