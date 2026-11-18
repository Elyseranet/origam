<template>
	<Story
			group="components"
			title="Chart/OrigamChartBullet"
	>

		<Variant
				title="Design"
				:init-state="() => useStoryInitState<IDesignState>({
					barColor: 'primary',
					targetColor: 'danger',
					rangeColor0: 'danger',
					rangeColor1: 'warning',
					rangeColor2: 'success',
					orientation: 'horizontal',
					barThickness: 0.45
				})"
		>
			<template #default="{ state }">
				<div class="story-shell">
					<origam-chart-bullet
							:series="FIXTURE_SALES"
							:categories="FIXTURE_SALES_CATEGORIES"
							:bar-color="state.barColor"
							:target-color="state.targetColor"
							:range-colors="[state.rangeColor0, state.rangeColor1, state.rangeColor2]"
							:orientation="state.orientation"
							:bar-thickness="state.barThickness"
							:bg-color="state.bgColor"
							:elevation="state.elevation"
							:rounded="state.rounded"
							:height="260"
							title="Sales Targets Q1 2026"
							subtitle="Actual vs target with qualitative ranges"
					/>
				</div>
			</template>
			<template #controls="{ state }">
				<StoryGroup title="Color">
					<HstSelect v-model="state.barColor"    title="Bar Color"    :options="INTENT_OPTIONS"/>
					<HstSelect v-model="state.targetColor" title="Target Color" :options="INTENT_OPTIONS"/>
					<HstSelect v-model="state.bgColor"     title="Bg Color"     :options="COLOR_OPTIONS"/>
				</StoryGroup>
				<StoryGroup title="Range Colors">
					<HstText v-model="state.rangeColor0" title="Range 1 (poor)"/>
					<HstText v-model="state.rangeColor1" title="Range 2 (acceptable)"/>
					<HstText v-model="state.rangeColor2" title="Range 3 (good)"/>
				</StoryGroup>
				<StoryGroup title="Shape">
					<HstSelect v-model="state.rounded"   title="Rounded"   :options="ROUNDED_OPTIONS"/>
					<HstSelect v-model="state.elevation" title="Elevation" :options="ELEVATION_OPTIONS"/>
				</StoryGroup>
				<StoryGroup title="Layout">
					<HstSelect v-model="state.orientation"  title="Orientation"    :options="ORIENTATION_OPTIONS"/>
					<HstNumber v-model="state.barThickness" title="Bar Thickness"  :min="0.1" :max="0.9" :step="0.05"/>
				</StoryGroup>
			</template>
		</Variant>

		<Variant
				title="Functional"
				:init-state="() => useStoryInitState<Partial<IChartBulletProps>>({
					title: 'Sales Targets Q1 2026',
					subtitle: 'Actual vs target with qualitative ranges',
					height: 280,
					showLegend: false,
					legendPosition: 'bottom',
					showTooltip: true,
					showAxis: true,
					animated: true,
					animationDuration: 600,
					aspectRatio: undefined
				})"
		>
			<template #default="{ state }">
				<div class="story-shell">
					<origam-chart-bullet
							:series="FIXTURE_SALES"
							:categories="FIXTURE_SALES_CATEGORIES"
							:title="state.title"
							:subtitle="state.subtitle"
							:height="state.height"
							:show-legend="state.showLegend"
							:legend-position="state.legendPosition"
							:show-tooltip="state.showTooltip"
							:show-axis="state.showAxis"
							:animated="state.animated"
							:animation-duration="state.animationDuration"
							:aspect-ratio="state.aspectRatio || undefined"
					/>
				</div>
			</template>
			<template #controls="{ state }">
				<StoryGroup title="Labels">
					<HstText v-model="state.title"    title="Title"/>
					<HstText v-model="state.subtitle" title="Subtitle"/>
				</StoryGroup>
				<StoryGroup title="Dimension">
					<HstNumber v-model="state.height" title="Height (px)" :min="100" :max="600" :step="20"/>
					<HstText   v-model="state.aspectRatio" title="Aspect Ratio (e.g. 16/9)"/>
				</StoryGroup>
				<StoryGroup title="Legend">
					<HstCheckbox v-model="state.showLegend"                title="Show Legend"/>
					<HstSelect   v-model="state.legendPosition" title="Legend Position" :options="LEGEND_POSITION_OPTIONS"/>
				</StoryGroup>
				<StoryGroup title="Display">
					<HstCheckbox v-model="state.showTooltip" title="Show Tooltip"/>
					<HstCheckbox v-model="state.showAxis"    title="Show Axis"/>
				</StoryGroup>
				<StoryGroup title="Animation">
					<HstCheckbox v-model="state.animated"          title="Animated"/>
					<HstNumber   v-model="state.animationDuration" title="Duration (ms)" :min="100" :max="2000" :step="100"/>
				</StoryGroup>
			</template>
		</Variant>

		<Variant title="Events - point-click">
			<div class="story-shell">
				<origam-chart-bullet
						:series="FIXTURE_SALES"
						:categories="FIXTURE_SALES_CATEGORIES"
						:height="260"
						title="Click or press Enter / Space on a bar"
						@point-click="logEvent('point-click', $event)"
				/>
			</div>
		</Variant>

		<Variant title="Events - legend-click">
			<div class="story-shell">
				<origam-chart-bullet
						:series="FIXTURE_SALES"
						:categories="FIXTURE_SALES_CATEGORIES"
						:height="260"
						:show-legend="true"
						title="Click a legend item"
						@legend-click="logEvent('legend-click', $event)"
				/>
			</div>
		</Variant>

		<Variant title="Events - series-toggle">
			<div class="story-shell">
				<origam-chart-bullet
						:series="FIXTURE_SALES"
						:categories="FIXTURE_SALES_CATEGORIES"
						:height="260"
						:show-legend="true"
						title="Toggle series visibility via legend"
						@series-toggle="logEvent('series-toggle', $event)"
				/>
			</div>
		</Variant>

		<Variant title="Slots - tooltip">
			<div class="story-shell">
				<origam-chart-bullet
						:series="FIXTURE_SALES"
						:categories="FIXTURE_SALES_CATEGORIES"
						:height="260"
						title="Custom tooltip with delta %"
				>
					<template #tooltip="{ category, bullet, delta }">
						<div class="custom-tooltip">
							<strong class="custom-tooltip__title">{{ category }}</strong>
							<div class="custom-tooltip__row">
								<span>Value</span>
								<span class="custom-tooltip__value">{{ bullet?.datum?.value }}</span>
							</div>
							<div class="custom-tooltip__row">
								<span>Target</span>
								<span class="custom-tooltip__value">{{ bullet?.datum?.target }}</span>
							</div>
							<div class="custom-tooltip__row custom-tooltip__row--delta">
								<span>Achievement</span>
								<span
										class="custom-tooltip__value"
										:class="{ 'custom-tooltip__value--ok': delta >= 100, 'custom-tooltip__value--warn': delta < 100 }"
								>{{ delta }}%</span>
							</div>
						</div>
					</template>
				</origam-chart-bullet>
			</div>
		</Variant>

		<Variant title="Slots - legend-item">
			<div class="story-shell">
				<origam-chart-bullet
						:series="FIXTURE_SALES"
						:categories="FIXTURE_SALES_CATEGORIES"
						:height="260"
						:show-legend="true"
						title="Custom legend item"
				>
					<template #legend-item="{ series: s, index, visible }">
						<span :style="{ opacity: visible ? 1 : 0.4, fontStyle: 'italic' }">
							{{ index + 1 }}. {{ s.name }}
						</span>
					</template>
				</origam-chart-bullet>
			</div>
		</Variant>

		<Variant title="Slots - title">
			<div class="story-shell">
				<origam-chart-bullet
						:series="FIXTURE_SALES"
						:categories="FIXTURE_SALES_CATEGORIES"
						:height="260"
				>
					<template #title>
						<strong style="font-size: 1.125rem;">Custom Title Block</strong>
						<em style="font-size: 0.875rem; display: block;">via #title slot</em>
					</template>
				</origam-chart-bullet>
			</div>
		</Variant>

		<Variant title="Slots - empty">
			<div class="story-shell">
				<origam-chart-bullet
						:series="[]"
						:categories="[]"
						:height="260"
						title="Empty state"
				>
					<template #empty>
						<div class="custom-empty">
							No KPI data available for this period.
						</div>
					</template>
				</origam-chart-bullet>
			</div>
		</Variant>

		<Variant title="Responsive width">
			<div
					v-for="w in [480, 960]"
					:key="w"
					:style="{ width: `${ w }px`, maxWidth: '100%', marginBottom: '1rem' }"
					:data-cy="`origam-chart-bullet-responsive-${ w }`"
			>
				<origam-chart-bullet
						:series="FIXTURE_SALES" :categories="FIXTURE_SALES_CATEGORIES"
						:title="`${ w }px container`"
				/>
			</div>
		</Variant>

		<Variant
				title="Default"
				:init-state="() => useStoryInitState<Partial<IChartBulletProps>>({
					title: 'Sales Targets Q1 2026',
					subtitle: 'Actual vs target with qualitative ranges',
					orientation: 'horizontal',
					height: 280,
					barColor: 'primary',
					targetColor: 'danger',
					rangeColors: ['danger', 'warning', 'success'],
					barThickness: 0.45,
					showLegend: false,
					legendPosition: 'bottom',
					showTooltip: true,
					showAxis: true,
					animated: true,
					animationDuration: 600
				})"
		>
			<template #default="{ state }">
				<div class="story-shell">
					<origam-chart-bullet
							v-bind="state"
							:series="FIXTURE_SALES"
							:categories="FIXTURE_SALES_CATEGORIES"
							:range-colors="state.rangeColors"
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
					<HstSelect v-model="state.orientation"  title="Orientation"   :options="ORIENTATION_OPTIONS"/>
					<HstSelect v-model="state.barColor"     title="Bar Color"     :options="INTENT_OPTIONS"/>
					<HstSelect v-model="state.targetColor"  title="Target Color"  :options="INTENT_OPTIONS"/>
					<HstSelect v-model="state.bgColor"      title="Bg Color"      :options="COLOR_OPTIONS"/>
					<HstSelect v-model="state.rounded"      title="Rounded"       :options="ROUNDED_OPTIONS"/>
					<HstSelect v-model="state.elevation"    title="Elevation"     :options="ELEVATION_OPTIONS"/>
					<HstNumber v-model="state.barThickness" title="Bar Thickness" :min="0.1" :max="0.9" :step="0.05"/>
				</StoryGroup>
				<StoryGroup title="Functional">
					<HstNumber   v-model="state.height"            title="Height (px)"      :min="100" :max="600" :step="20"/>
					<HstCheckbox v-model="state.showLegend"        title="Show Legend"/>
					<HstSelect   v-model="state.legendPosition"    title="Legend Position"  :options="LEGEND_POSITION_OPTIONS"/>
					<HstCheckbox v-model="state.showTooltip"       title="Show Tooltip"/>
					<HstCheckbox v-model="state.showAxis"          title="Show Axis"/>
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

	import { OrigamChartBullet } from '@origam/components'

	import type {
		IChartBulletDatum,
		IChartBulletProps,
		IChartSeries
	} from '@origam/interfaces'

	import StoryGroup from '@stories/components/_shared/StoryGroup.vue'
	import { useStoryInitState } from '@stories/composables'
	import {
		COLOR_OPTIONS,
		ELEVATION_OPTIONS,
		INTENT_OPTIONS,
		ROUNDED_OPTIONS
	} from '@stories/const'

	interface IDesignState {
		barColor?: string
		targetColor?: string
		rangeColor0: string
		rangeColor1: string
		rangeColor2: string
		orientation?: string
		barThickness?: number
		bgColor?: string
		elevation?: string
		rounded?: string
	}

	const ORIENTATION_OPTIONS = [
		{ value: 'horizontal', label: 'Horizontal' },
		{ value: 'vertical', label: 'Vertical' }
	]

	const LEGEND_POSITION_OPTIONS = [
		{ value: 'top', label: 'Top' },
		{ value: 'bottom', label: 'Bottom' },
		{ value: 'left', label: 'Left' },
		{ value: 'right', label: 'Right' }
	]

	const FIXTURE_SALES_CATEGORIES = ['Revenue', 'Profit Margin', 'Customer Satisfaction']

	const FIXTURE_SALES: Array<IChartSeries> = [
		{
			name: 'Revenue',
			data: [{ value: 420, target: 500, ranges: [{ to: 200 }, { to: 350 }, { to: 600 }] } as unknown as IChartBulletDatum]
		},
		{
			name: 'Profit Margin',
			data: [{ value: 28, target: 35, ranges: [{ to: 15 }, { to: 25 }, { to: 40 }] } as unknown as IChartBulletDatum]
		},
		{
			name: 'Customer Satisfaction',
			data: [{ value: 4.3, target: 4.5, ranges: [{ to: 3 }, { to: 4 }, { to: 5 }] } as unknown as IChartBulletDatum]
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
		gap: 4px;
		padding: 4px;
		min-width: 160px;
	}

	.custom-tooltip__title {
		font-size: 0.875rem;
		margin-bottom: 2px;
	}

	.custom-tooltip__row {
		display: flex;
		justify-content: space-between;
		font-size: 0.8125rem;
	}

	.custom-tooltip__row--delta {
		margin-top: 2px;
		padding-top: 4px;
		border-top: 1px solid rgba(255, 255, 255, 0.2);
	}

	.custom-tooltip__value {
		font-weight: 600;
	}

	.custom-tooltip__value--ok {
		color: #4ade80;
	}

	.custom-tooltip__value--warn {
		color: #facc15;
	}

	.custom-empty {
		color: var(--origam-color-text-secondary, #6b7280);
		font-style: italic;
	}
</style>

<docs
		lang="md"
		src="@docs/components/Chart/OrigamChartBullet.md"
/>
