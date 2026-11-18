<template>
	<Story
			group="components"
			title="Chart/OrigamChartVariwide"
	>

		<Variant
				title="Design"
				:init-state="() => useStoryInitState<Partial<IChartVariwideProps>>({
					title: 'GDP × Population (2023)',
					subtitle: 'Width = population (M) · Height = GDP (T$)',
					bgColor: undefined,
					rounded: undefined,
					elevation: undefined,
					height: 360,
					width: undefined,
					legendPosition: 'bottom',
					showLegend: false,
					showLabel: true,
					showAxis: true,
					showGrid: true,
					barGap: 2,
					colorScheme: undefined,
					aspectRatio: undefined
				})"
		>
			<template #default="{ state }">
				<origam-chart-variwide
						:series="FIXTURE_GDP_POP"
						:title="state.title"
						:subtitle="state.subtitle"
						:bg-color="state.bgColor"
						:rounded="state.rounded"
						:elevation="state.elevation"
						:height="state.height"
						:width="state.width"
						:legend-position="state.legendPosition"
						:show-legend="state.showLegend"
						:show-label="state.showLabel"
						:show-axis="state.showAxis"
						:show-grid="state.showGrid"
						:bar-gap="state.barGap"
						:aspect-ratio="state.aspectRatio || undefined"
				/>
			</template>
			<template #controls="{ state }">
				<StoryGroup title="Title">
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
				<StoryGroup title="Dimension">
					<HstNumber v-model="state.height" title="Height (px)" :min="100" :max="800" :step="10"/>
					<HstText   v-model="state.width"  title="Width"/>
					<HstText   v-model="state.aspectRatio" title="Aspect Ratio (e.g. 16/9)"/>
				</StoryGroup>
				<StoryGroup title="Legend">
					<HstCheckbox v-model="state.showLegend"      title="Show Legend"/>
					<HstSelect   v-model="state.legendPosition"  title="Legend Position" :options="LEGEND_POSITION_OPTIONS"/>
				</StoryGroup>
				<StoryGroup title="Chart Display">
					<HstCheckbox v-model="state.showLabel" title="Show Label"/>
					<HstCheckbox v-model="state.showAxis"  title="Show Axis"/>
					<HstCheckbox v-model="state.showGrid"  title="Show Grid"/>
					<HstNumber   v-model="state.barGap"    title="Bar Gap (px)" :min="0" :max="20" :step="1"/>
				</StoryGroup>
			</template>
		</Variant>

		<Variant
				title="Functional"
				:init-state="() => useStoryInitState<Partial<IChartVariwideProps>>({
					showTooltip: true,
					animated: true,
					animationDuration: 600,
					yMin: undefined,
					yMax: undefined
				})"
		>
			<template #default="{ state }">
				<origam-chart-variwide
						:series="FIXTURE_GDP_POP"
						:height="320"
						title="Functional controls"
						:show-tooltip="state.showTooltip"
						:animated="state.animated"
						:animation-duration="state.animationDuration"
						:y-min="state.yMin"
						:y-max="state.yMax"
				/>
			</template>
			<template #controls="{ state }">
				<StoryGroup title="Tooltip">
					<HstCheckbox v-model="state.showTooltip" title="Show Tooltip"/>
				</StoryGroup>
				<StoryGroup title="Animation">
					<HstCheckbox v-model="state.animated"          title="Animated"/>
					<HstNumber   v-model="state.animationDuration" title="Animation Duration (ms)" :min="100" :max="2000" :step="100"/>
				</StoryGroup>
				<StoryGroup title="Y Scale">
					<HstNumber v-model="state.yMin" title="Y Min override"/>
					<HstNumber v-model="state.yMax" title="Y Max override"/>
				</StoryGroup>
			</template>
		</Variant>

		<Variant title="Events - point-click">
			<origam-chart-variwide
					:series="FIXTURE_GDP_POP"
					:height="320"
					title="Click a column"
					@point-click="logEvent('point-click', $event)"
			/>
		</Variant>

		<Variant title="Events - legend-click">
			<origam-chart-variwide
					:series="FIXTURE_GDP_POP"
					:height="320"
					:show-legend="true"
					title="Click a legend item"
					@legend-click="logEvent('legend-click', $event)"
			/>
		</Variant>

		<Variant title="Events - series-toggle">
			<origam-chart-variwide
					:series="FIXTURE_GDP_POP"
					:height="320"
					:show-legend="true"
					title="Toggle series visibility via legend"
					@series-toggle="logEvent('series-toggle', $event)"
			/>
		</Variant>

		<Variant title="Slots - tooltip">
			<origam-chart-variwide
					:series="FIXTURE_GDP_POP"
					:height="360"
					title="Custom tooltip — hover a column"
			>
				<template #tooltip="{ category, value, widthValue, formattedValue, formattedWidth, color }">
					<div class="custom-tooltip">
						<div
								class="custom-tooltip__swatch"
								:style="{ background: color }"
						></div>
						<div class="custom-tooltip__content">
							<strong class="custom-tooltip__title">{{ category }}</strong>
							<dl class="custom-tooltip__data">
								<dt>GDP</dt>
								<dd>{{ formattedValue }} T$</dd>
								<dt>Population</dt>
								<dd>{{ widthValue }} M</dd>
							</dl>
						</div>
					</div>
				</template>
			</origam-chart-variwide>
		</Variant>

		<Variant title="Slots - empty">
			<origam-chart-variwide
					:series="[]"
					:height="300"
					title="Empty state"
			>
				<template #empty>
					<div class="custom-empty">
						No data available for the selected period.
					</div>
				</template>
			</origam-chart-variwide>
		</Variant>

		<Variant title="Slots - legend-item">
			<origam-chart-variwide
					:series="FIXTURE_GDP_POP"
					:height="320"
					:show-legend="true"
					title="Custom legend item"
			>
				<template #legend-item="{ series, index, visible }">
					<span :style="{ opacity: visible ? 1 : 0.4, fontStyle: 'italic' }">
						{{ index + 1 }}. {{ series.name }}
					</span>
				</template>
			</origam-chart-variwide>
		</Variant>

		<Variant title="Slots - title">
			<origam-chart-variwide
					:series="FIXTURE_GDP_POP"
					:height="320"
			>
				<template #title>
					<div class="custom-title">
						<strong>Custom Title Block</strong>
						<em>with custom subtitle markup</em>
					</div>
				</template>
			</origam-chart-variwide>
		</Variant>

		<Variant title="Responsive width">
			<div
					v-for="w in [480, 960]"
					:key="w"
					:style="{ width: `${ w }px`, maxWidth: '100%', marginBottom: '1rem' }"
					:data-cy="`origam-chart-variwide-responsive-${ w }`"
			>
				<origam-chart-variwide
						:series="FIXTURE_GDP_POP"
						:title="`${ w }px container`"
				/>
			</div>
		</Variant>

		<Variant
				title="Default"
				:init-state="() => useStoryInitState<IChartVariwideProps>({
					series: FIXTURE_GDP_POP,
					title: 'GDP × Population (2023)',
					subtitle: 'Width = population (M) · Height = GDP (T$)',
					height: 400,
					showLegend: false,
					legendPosition: 'bottom',
					showTooltip: true,
					animated: true,
					animationDuration: 600,
					showLabel: true,
					showAxis: true,
					showGrid: true,
					barGap: 2
				})"
		>
			<template #default="{ state }">
				<origam-chart-variwide
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
					<HstSelect   v-model="state.bgColor"        title="Bg Color"        :options="COLOR_OPTIONS"/>
					<HstSelect   v-model="state.rounded"        title="Rounded"         :options="ROUNDED_OPTIONS"/>
					<HstSelect   v-model="state.elevation"      title="Elevation"       :options="ELEVATION_OPTIONS"/>
					<HstNumber   v-model="state.height"         title="Height (px)"     :min="100" :max="800" :step="10"/>
					<HstNumber   v-model="state.barGap"         title="Bar Gap (px)"    :min="0"   :max="20"  :step="1"/>
					<HstCheckbox v-model="state.showLegend"     title="Show Legend"/>
					<HstSelect   v-model="state.legendPosition" title="Legend Position" :options="LEGEND_POSITION_OPTIONS"/>
				</StoryGroup>
				<StoryGroup title="Functional">
					<HstCheckbox v-model="state.showLabel"   title="Show Label"/>
					<HstCheckbox v-model="state.showAxis"    title="Show Axis"/>
					<HstCheckbox v-model="state.showGrid"    title="Show Grid"/>
					<HstCheckbox v-model="state.showTooltip" title="Show Tooltip"/>
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

	import { OrigamChartVariwide } from '@origam/components'
	import type {
		IChartSeries,
		IChartVariwideDatum,
		IChartVariwideProps
	} from '@origam/interfaces'

	import StoryGroup from '@stories/components/_shared/StoryGroup.vue'
	import { useStoryInitState } from '@stories/composables'
	import {
		COLOR_OPTIONS,
		ELEVATION_OPTIONS,
		ROUNDED_OPTIONS
	} from '@stories/const'

	const LEGEND_POSITION_OPTIONS = [
		{ value: 'top', label: 'Top' },
		{ value: 'bottom', label: 'Bottom' },
		{ value: 'left', label: 'Left' },
		{ value: 'right', label: 'Right' }
	]

	const GDP_POP_DATA: Array<IChartVariwideDatum> = [
		{ category: 'US', value: 23, width: 331 },
		{ category: 'China', value: 18, width: 1411 },
		{ category: 'Germany', value: 4.2, width: 83 },
		{ category: 'Japan', value: 4.9, width: 125 },
		{ category: 'India', value: 3.5, width: 1393 },
		{ category: 'UK', value: 3.1, width: 67 }
	]

	const FIXTURE_GDP_POP: Array<IChartSeries> = [
		{ name: 'GDP × Population', data: GDP_POP_DATA as unknown as Array<number> }
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
		display: flex;
		flex-direction: column;
		gap: 4px;
	}
</style>

<docs
		lang="md"
		src="@docs/components/Chart/OrigamChartVariwide.md"
/>
