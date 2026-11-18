<template>
	<Story
			group="components"
			title="Chart/OrigamChartPyramid"
	>

		<Variant
				title="Design"
				:init-state="() => useStoryInitState<Partial<IChartPyramidProps>>({
					type: 'funnel',
					bgColor: undefined,
					rounded: undefined,
					elevation: undefined,
					colorScheme: undefined,
					aspectRatio: undefined,
					legendPosition: 'bottom',
					width: undefined,
					height: 360
				})"
		>
			<template #default="{ state }">
				<origam-chart-pyramid
						:type="state.type"
						:series="FIXTURE_FUNNEL"
						:categories="FIXTURE_FUNNEL_CATEGORIES"
						:bg-color="state.bgColor"
						:rounded="state.rounded"
						:elevation="state.elevation"
						:color-scheme="state.colorScheme || undefined"
						:aspect-ratio="state.aspectRatio"
						:legend-position="state.legendPosition"
						:width="state.width"
						:height="state.height"
						title="Conversion pyramid"
						subtitle="Q1 2026"
				/>
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
				<StoryGroup title="Legend">
					<HstSelect v-model="state.legendPosition" title="Legend Position" :options="LEGEND_POSITION_OPTIONS"/>
				</StoryGroup>
				<StoryGroup title="Dimension">
					<HstText   v-model="state.width"       title="Width"/>
					<HstNumber v-model="state.height"      title="Height (px)"/>
					<HstText   v-model="state.aspectRatio" title="Aspect Ratio"/>
				</StoryGroup>
			</template>
		</Variant>

		<Variant
				title="Functional"
				:init-state="() => useStoryInitState<Partial<IChartPyramidProps>>({
					type: 'funnel',
					title: 'Conversion pyramid',
					subtitle: 'Q1 2026',
					showLegend: true,
					showTooltip: true,
					animated: true,
					animationDuration: 600,
					labelPlacement: 'auto',
					sliceGap: 0,
					height: 360
				})"
		>
			<template #default="{ state }">
				<origam-chart-pyramid
						:type="state.type"
						:series="FIXTURE_FUNNEL"
						:categories="FIXTURE_FUNNEL_CATEGORIES"
						:title="state.title"
						:subtitle="state.subtitle"
						:show-legend="state.showLegend"
						:show-tooltip="state.showTooltip"
						:animated="state.animated"
						:animation-duration="state.animationDuration"
						:label-placement="state.labelPlacement"
						:slice-gap="state.sliceGap"
						:height="state.height"
				/>
			</template>
			<template #controls="{ state }">
				<StoryGroup title="Type">
					<HstSelect v-model="state.type" title="Type" :options="TYPE_OPTIONS"/>
				</StoryGroup>
				<StoryGroup title="Labels">
					<HstSelect v-model="state.labelPlacement" title="Label Placement" :options="LABEL_PLACEMENT_OPTIONS"/>
					<HstNumber v-model="state.sliceGap" title="Slice Gap (px)" :min="0" :max="20" :step="1"/>
				</StoryGroup>
				<StoryGroup title="Legend & Tooltip">
					<HstCheckbox v-model="state.showLegend"  title="Show Legend"/>
					<HstCheckbox v-model="state.showTooltip" title="Show Tooltip"/>
				</StoryGroup>
				<StoryGroup title="Animation">
					<HstCheckbox v-model="state.animated"          title="Animated"/>
					<HstNumber   v-model="state.animationDuration" title="Duration (ms)" :min="100" :max="2000" :step="100"/>
				</StoryGroup>
				<StoryGroup title="Metadata">
					<HstText   v-model="state.title"    title="Title"/>
					<HstText   v-model="state.subtitle" title="Subtitle"/>
					<HstNumber v-model="state.height"   title="Height (px)"/>
				</StoryGroup>
			</template>
		</Variant>

		<Variant title="Events - point-click">
			<div class="story-shell">
				<origam-chart-pyramid
						type="funnel"
						:series="FIXTURE_FUNNEL"
						:categories="FIXTURE_FUNNEL_CATEGORIES"
						:height="360"
						title="Click a slice"
						@point-click="logEvent('point-click', $event)"
				/>
			</div>
		</Variant>

		<Variant title="Events - legend-click">
			<div class="story-shell">
				<origam-chart-pyramid
						type="funnel"
						:series="FIXTURE_FUNNEL"
						:categories="FIXTURE_FUNNEL_CATEGORIES"
						:height="360"
						title="Click a legend entry"
						@legend-click="logEvent('legend-click', $event)"
				/>
			</div>
		</Variant>

		<Variant title="Events - series-toggle">
			<div class="story-shell">
				<origam-chart-pyramid
						type="funnel"
						:series="FIXTURE_FUNNEL"
						:categories="FIXTURE_FUNNEL_CATEGORIES"
						:height="360"
						title="Toggle a series via legend"
						@series-toggle="logEvent('series-toggle', $event)"
				/>
			</div>
		</Variant>

		<Variant title="Slots - Tooltip">
			<div class="story-shell">
				<origam-chart-pyramid
						type="funnel"
						:series="FIXTURE_FUNNEL"
						:categories="FIXTURE_FUNNEL_CATEGORIES"
						:height="360"
						title="Custom tooltip"
				>
					<template #tooltip="{ point, category }">
						<div class="custom-tooltip">
							<strong>{{ category }}</strong>
							<span>{{ typeof point?.y === 'number' ? point.y.toLocaleString() : (point?.y ?? '') }} users</span>
						</div>
					</template>
				</origam-chart-pyramid>
			</div>
		</Variant>

		<Variant title="Slots - Legend-item">
			<div class="story-shell">
				<origam-chart-pyramid
						type="funnel"
						:series="FIXTURE_FUNNEL"
						:categories="FIXTURE_FUNNEL_CATEGORIES"
						:height="360"
						title="Custom legend"
				>
					<template #legend-item="{ series, visible }">
						<span
								class="custom-legend-item"
								:style="{ opacity: visible ? 1 : 0.4 }"
						>
							{{ series.name }}
						</span>
					</template>
				</origam-chart-pyramid>
			</div>
		</Variant>

		<Variant title="Slots - Title">
			<div class="story-shell">
				<origam-chart-pyramid
						type="funnel"
						:series="FIXTURE_FUNNEL"
						:categories="FIXTURE_FUNNEL_CATEGORIES"
						:height="380"
				>
					<template #title>
						<div class="custom-title">
							<strong>Marketing pipeline</strong>
							<em>Week 21 — 2026</em>
						</div>
					</template>
				</origam-chart-pyramid>
			</div>
		</Variant>

		<Variant title="Slots - Empty">
			<div class="story-shell">
				<origam-chart-pyramid
						type="funnel"
						:series="[]"
						:categories="[]"
						:height="320"
						title="Empty state"
				>
					<template #empty>
						<div class="custom-empty">
							No pipeline data yet for this period.
						</div>
					</template>
				</origam-chart-pyramid>
			</div>
		</Variant>

		<Variant title="Slots - Slice-label">
			<div class="story-shell">
				<origam-chart-pyramid
						type="funnel"
						:series="FIXTURE_FUNNEL"
						:categories="FIXTURE_FUNNEL_CATEGORIES"
						:height="360"
						title="Custom slice label"
				>
					<template #slice-label="{ category, value, formatted, color, index, visible }">
						<tspan
								v-if="visible"
								:fill="color"
						>{{ index + 1 }}. {{ category }} ({{ formatted }})</tspan>
					</template>
				</origam-chart-pyramid>
			</div>
		</Variant>

		<Variant title="Responsive width">
			<div
					v-for="w in [480, 960]"
					:key="w"
					:style="{ width: `${ w }px`, maxWidth: '100%', marginBottom: '1rem' }"
					:data-cy="`origam-chart-pyramid-responsive-${ w }`"
			>
				<origam-chart-pyramid
						type="funnel" :series="FIXTURE_FUNNEL" :categories="FIXTURE_FUNNEL_CATEGORIES"
						:title="`${ w }px container`"
				/>
			</div>
		</Variant>

		<Variant
				title="Default"
				:init-state="() => useStoryInitState<IChartPyramidProps>({
					type: 'funnel',
					series: FIXTURE_FUNNEL,
					categories: FIXTURE_FUNNEL_CATEGORIES,
					title: 'Conversion pyramid',
					subtitle: 'Q1 2026',
					showLegend: true,
					legendPosition: 'bottom',
					showTooltip: true,
					animated: true,
					animationDuration: 600,
					labelPlacement: 'auto',
					sliceGap: 0,
					height: 360
				})"
		>
			<template #default="{ state }">
				<origam-chart-pyramid
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
					<HstSelect v-model="state.type"           title="Type"           :options="TYPE_OPTIONS"/>
					<HstSelect v-model="state.bgColor"        title="Bg Color"       :options="COLOR_OPTIONS"/>
					<HstSelect v-model="state.rounded"        title="Rounded"        :options="ROUNDED_OPTIONS"/>
					<HstSelect v-model="state.elevation"      title="Elevation"      :options="ELEVATION_OPTIONS"/>
					<HstSelect v-model="state.legendPosition" title="Legend Position" :options="LEGEND_POSITION_OPTIONS"/>
					<HstNumber v-model="state.height"         title="Height (px)"/>
				</StoryGroup>
				<StoryGroup title="Functional">
					<HstSelect   v-model="state.labelPlacement"    title="Label Placement"  :options="LABEL_PLACEMENT_OPTIONS"/>
					<HstNumber   v-model="state.sliceGap"          title="Slice Gap (px)"   :min="0" :max="20" :step="1"/>
					<HstCheckbox v-model="state.showLegend"        title="Show Legend"/>
					<HstCheckbox v-model="state.showTooltip"       title="Show Tooltip"/>
					<HstCheckbox v-model="state.animated"          title="Animated"/>
					<HstNumber   v-model="state.animationDuration" title="Duration (ms)"    :min="100" :max="2000" :step="100"/>
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

	import { OrigamChartPyramid } from '@origam/components'
	import { CHART_PYRAMID_KIND } from '@origam/enums'
	import type {
		IChartPyramidProps,
		IChartSeries
	} from '@origam/interfaces'

	import StoryGroup from '@stories/components/_shared/StoryGroup.vue'
	import { useStoryInitState } from '@stories/composables'
	import {
		COLOR_OPTIONS,
		ELEVATION_OPTIONS,
		ROUNDED_OPTIONS
	} from '@stories/const'

	const TYPE_OPTIONS = [
		{ value: CHART_PYRAMID_KIND.FUNNEL,  label: 'funnel' },
		{ value: CHART_PYRAMID_KIND.PYRAMID, label: 'pyramid' }
	]

	const LEGEND_POSITION_OPTIONS = [
		{ value: 'top',    label: 'top' },
		{ value: 'bottom', label: 'bottom' },
		{ value: 'left',   label: 'left' },
		{ value: 'right',  label: 'right' }
	]

	const LABEL_PLACEMENT_OPTIONS = [
		{ value: 'auto',    label: 'auto (default)' },
		{ value: 'inside',  label: 'inside' },
		{ value: 'outside', label: 'outside' }
	]

	const FIXTURE_FUNNEL_CATEGORIES = ['Visitors', 'Leads', 'Prospects', 'Demos', 'Customers']

	const FIXTURE_FUNNEL: Array<IChartSeries> = [
		{ name: 'Pipeline', data: [1000, 600, 200, 80, 50] }
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
		display: flex;
		flex-direction: column;
		gap: 2px;
	}

	.custom-empty {
		color: var(--origam-color-text-secondary, #6b7280);
		font-style: italic;
	}
</style>

<docs
		lang="md"
		src="@docs/components/Chart/OrigamChartPyramid.md"
/>
