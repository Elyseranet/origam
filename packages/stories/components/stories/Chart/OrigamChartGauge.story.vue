<template>
	<Story
			group="components"
			title="Chart/OrigamChartGauge"
	>

		<Variant
				title="Design"
				:init-state="() => useStoryInitState<Partial<IChartGaugeProps>>({
					series: [{ name: 'Value', data: [62], color: 'primary' }],
					gaugeMin: 0,
					gaugeMax: 100,
					gaugeUnit: '%',
					gaugeThickness: 18,
					gaugeShowEndpoints: true,
					gaugeShowValue: true,
					title: 'Completion',
					height: 300
				})"
		>
			<template #default="{ state }">
				<origam-chart-gauge
						:series="state.series"
						:gauge-min="state.gaugeMin"
						:gauge-max="state.gaugeMax"
						:gauge-unit="state.gaugeUnit"
						:gauge-thickness="state.gaugeThickness"
						:gauge-show-endpoints="state.gaugeShowEndpoints"
						:gauge-show-value="state.gaugeShowValue"
						:title="state.title"
						:subtitle="state.subtitle"
						:bg-color="state.bgColor"
						:rounded="state.rounded"
						:elevation="state.elevation"
						:height="state.height"
						:width="state.width"
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
				<StoryGroup title="Gauge Options">
					<HstNumber v-model="state.gaugeMin"       title="Gauge Min"/>
					<HstNumber v-model="state.gaugeMax"       title="Gauge Max"/>
					<HstText   v-model="state.gaugeUnit"      title="Gauge Unit"/>
					<HstNumber v-model="state.gaugeThickness" title="Gauge Thickness" :min="4" :max="60" :step="2"/>
					<HstCheckbox v-model="state.gaugeShowEndpoints" title="Show Endpoints"/>
					<HstCheckbox v-model="state.gaugeShowValue"     title="Show Value"/>
				</StoryGroup>
				<StoryGroup title="Labels">
					<HstText v-model="state.title"    title="Title"/>
					<HstText v-model="state.subtitle" title="Subtitle"/>
				</StoryGroup>
				<StoryGroup title="Dimension">
					<HstText   v-model="state.width"  title="Width"/>
					<HstNumber v-model="state.height" title="Height (px)" :min="100" :max="600" :step="20"/>
				</StoryGroup>
			</template>
		</Variant>

		<Variant
				title="Functional"
				:init-state="() => useStoryInitState<Partial<IChartGaugeProps>>({
					series: [{ name: 'Value', data: [62], color: 'primary' }],
					gaugeMin: 0,
					gaugeMax: 100,
					gaugeUnit: '%',
					animated: true,
					animationDuration: 600,
					showLegend: false,
					showTooltip: false,
					height: 300
				})"
		>
			<template #default="{ state }">
				<origam-chart-gauge
						:series="state.series"
						:gauge-min="state.gaugeMin"
						:gauge-max="state.gaugeMax"
						:gauge-unit="state.gaugeUnit"
						:animated="state.animated"
						:animation-duration="state.animationDuration"
						:show-legend="state.showLegend"
						:show-tooltip="state.showTooltip"
						:height="state.height"
				/>
			</template>
			<template #controls="{ state }">
				<StoryGroup title="Animation">
					<HstCheckbox v-model="state.animated"         title="Animated"/>
					<HstNumber   v-model="state.animationDuration" title="Duration (ms)" :min="0" :max="3000" :step="100"/>
				</StoryGroup>
				<StoryGroup title="Visibility">
					<HstCheckbox v-model="state.showLegend"  title="Show Legend"/>
					<HstCheckbox v-model="state.showTooltip" title="Show Tooltip"/>
				</StoryGroup>
			</template>
		</Variant>

		<Variant title="Events - point-click">
			<origam-chart-gauge
					:series="[{ name: 'CPU', data: [72], color: 'primary' }]"
					:gauge-min="0"
					:gauge-max="100"
					gauge-unit="%"
					title="Point click"
					:height="280"
					@point-click="logEvent('point-click', $event)"
			/>
		</Variant>

		<Variant title="Events - legend-click">
			<origam-chart-gauge
					:series="[{ name: 'Load', data: [55], color: 'success' }]"
					:gauge-min="0"
					:gauge-max="100"
					gauge-unit="%"
					title="Legend click"
					:show-legend="true"
					:height="280"
					@legend-click="logEvent('legend-click', $event)"
			/>
		</Variant>

		<Variant title="Events - series-toggle">
			<origam-chart-gauge
					:series="[{ name: 'Load', data: [55], color: 'success' }]"
					:gauge-min="0"
					:gauge-max="100"
					gauge-unit="%"
					title="Series toggle"
					:show-legend="true"
					:height="280"
					@series-toggle="logEvent('series-toggle', $event)"
			/>
		</Variant>

		<Variant title="Slots - title">
			<origam-chart-gauge
					:series="[{ name: 'Score', data: [84], color: 'success' }]"
					:gauge-min="0"
					:gauge-max="100"
					gauge-unit="%"
					:height="280"
			>
				<template #title>
					<strong>Custom title slot</strong>
				</template>
			</origam-chart-gauge>
		</Variant>

		<Variant title="Slots - gauge-value">
			<origam-chart-gauge
					:series="[{ name: 'Perf', data: [67], color: 'warning' }]"
					:gauge-min="0"
					:gauge-max="100"
					gauge-unit="%"
					:height="280"
			>
				<template #gauge-value="{ formatted, unit }">
					<tspan font-size="20" font-weight="700">{{ formatted }}{{ unit }}</tspan>
				</template>
			</origam-chart-gauge>
		</Variant>

		<Variant title="Slots - gauge-min">
			<origam-chart-gauge
					:series="[{ name: 'Level', data: [45], color: 'info' }]"
					:gauge-min="0"
					:gauge-max="100"
					gauge-unit=""
					:height="280"
			>
				<template #gauge-min="{ value }">
					<tspan font-size="11" fill="currentColor">Min: {{ value }}</tspan>
				</template>
			</origam-chart-gauge>
		</Variant>

		<Variant title="Slots - gauge-max">
			<origam-chart-gauge
					:series="[{ name: 'Level', data: [45], color: 'info' }]"
					:gauge-min="0"
					:gauge-max="100"
					gauge-unit=""
					:height="280"
			>
				<template #gauge-max="{ value }">
					<tspan font-size="11" fill="currentColor">Max: {{ value }}</tspan>
				</template>
			</origam-chart-gauge>
		</Variant>

		<Variant title="Slots - tooltip">
			<origam-chart-gauge
					:series="[{ name: 'CPU', data: [62], color: 'primary' }]"
					:gauge-min="0"
					:gauge-max="100"
					gauge-unit="%"
					:show-tooltip="true"
					:height="280"
			>
				<template #tooltip="{ point, series }">
					<span><strong>{{ series.name }}</strong>: {{ point.y }}</span>
				</template>
			</origam-chart-gauge>
		</Variant>

		<Variant title="Slots - empty">
			<origam-chart-gauge
					:series="[]"
					:gauge-min="0"
					:gauge-max="100"
					gauge-unit="%"
					:height="280"
			>
				<template #empty>
					<span>No gauge data available</span>
				</template>
			</origam-chart-gauge>
		</Variant>

		<Variant
				title="Default"
				:init-state="() => useStoryInitState<IChartGaugeProps>({
					series: [{ name: 'Value', data: [62], color: 'primary' }],
					gaugeMin: 0,
					gaugeMax: 100,
					gaugeUnit: '%',
					gaugeThickness: 18,
					gaugeShowEndpoints: true,
					gaugeShowValue: true,
					animated: true,
					animationDuration: 600,
					showLegend: false,
					showTooltip: false,
					title: 'Completion',
					height: 300
				})"
		>
			<template #default="{ state }">
				<origam-chart-gauge
						v-bind="state"
						@point-click="logEvent('point-click', $event)"
						@legend-click="logEvent('legend-click', $event)"
						@series-toggle="logEvent('series-toggle', $event)"
				/>
			</template>
			<template #controls="{ state }">
				<StoryGroup title="Labels">
					<HstText v-model="state.title"    title="Title"/>
					<HstText v-model="state.subtitle" title="Subtitle"/>
				</StoryGroup>
				<StoryGroup title="Design">
					<HstSelect   v-model="state.bgColor"   title="Bg Color"  :options="COLOR_OPTIONS"/>
					<HstSelect   v-model="state.rounded"   title="Rounded"   :options="ROUNDED_OPTIONS"/>
					<HstSelect   v-model="state.elevation" title="Elevation" :options="ELEVATION_OPTIONS"/>
					<HstText     v-model="state.width"     title="Width"/>
					<HstNumber   v-model="state.height"    title="Height (px)" :min="100" :max="600" :step="20"/>
				</StoryGroup>
				<StoryGroup title="Functional">
					<HstNumber   v-model="state.gaugeMin"           title="Gauge Min"/>
					<HstNumber   v-model="state.gaugeMax"           title="Gauge Max"/>
					<HstText     v-model="state.gaugeUnit"          title="Gauge Unit"/>
					<HstNumber   v-model="state.gaugeThickness"     title="Gauge Thickness" :min="4" :max="60" :step="2"/>
					<HstCheckbox v-model="state.gaugeShowEndpoints" title="Show Endpoints"/>
					<HstCheckbox v-model="state.gaugeShowValue"     title="Show Value"/>
					<HstCheckbox v-model="state.animated"           title="Animated"/>
					<HstCheckbox v-model="state.showLegend"         title="Show Legend"/>
					<HstCheckbox v-model="state.showTooltip"        title="Show Tooltip"/>
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

	import { OrigamChartGauge } from '@origam/components'
	import type { IChartGaugeProps } from '@origam/interfaces'

	import StoryGroup from '@stories/components/_shared/StoryGroup.vue'
	import { useStoryInitState } from '@stories/composables'
	import {
		COLOR_OPTIONS,
		ELEVATION_OPTIONS,
		ROUNDED_OPTIONS
	} from '@stories/const'
</script>

<docs
		lang="md"
		src="@docs/components/Chart/OrigamChartGauge.md"
/>
