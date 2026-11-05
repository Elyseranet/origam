<template>
	<Story
			group="components"
			title="Chart/OrigamChartSankey"
	>

		<Variant
				title="Design"
				:init-state="() => useStoryInitState<Partial<IChartSankeyProps>>({
					title: 'Web funnel flow',
					subtitle: 'May 2026',
					height: 400,
					colorScheme: [],
					bgColor: undefined,
					elevation: undefined,
					rounded: undefined,
					aspectRatio: undefined
				})"
		>
			<template #default="{ state }">
				<origam-chart-sankey
						:series="FIXTURE_WEB_FUNNEL"
						:title="state.title"
						:subtitle="state.subtitle"
						:height="state.height"
						:color-scheme="state.colorScheme"
						:bg-color="state.bgColor || undefined"
						:elevation="state.elevation || undefined"
						:rounded="state.rounded || undefined"
						:aspect-ratio="state.aspectRatio || undefined"
				/>
			</template>
			<template #controls="{ state }">
				<StoryGroup title="Content">
					<HstText v-model="state.title"    title="Title"/>
					<HstText v-model="state.subtitle" title="Subtitle"/>
				</StoryGroup>
				<StoryGroup title="Color">
					<HstSelect v-model="state.bgColor"    title="Bg Color"    :options="COLOR_OPTIONS"/>
					<HstSelect v-model="state.elevation"  title="Elevation"   :options="ELEVATION_OPTIONS"/>
				</StoryGroup>
				<StoryGroup title="Shape">
					<HstSelect v-model="state.rounded" title="Rounded" :options="ROUNDED_OPTIONS"/>
				</StoryGroup>
				<StoryGroup title="Dimension">
					<HstNumber v-model="state.height"      title="Height (px)" :min="100" :max="800" :step="20"/>
					<HstText   v-model="state.aspectRatio" title="Aspect Ratio (e.g. 16/9)"/>
				</StoryGroup>
			</template>
		</Variant>

		<Variant
				title="Functional"
				:init-state="() => useStoryInitState<Partial<IChartSankeyProps>>({
					nodeWidth: 16,
					nodePadding: 8,
					linkOpacity: 0.4,
					showLabel: true,
					animated: true,
					animationDuration: 600,
					showLegend: false,
					legendPosition: 'bottom',
					showTooltip: true
				})"
		>
			<template #default="{ state }">
				<origam-chart-sankey
						:series="FIXTURE_WEB_FUNNEL"
						title="Web funnel flow"
						subtitle="May 2026"
						:node-width="state.nodeWidth"
						:node-padding="state.nodePadding"
						:link-opacity="state.linkOpacity"
						:show-label="state.showLabel"
						:animated="state.animated"
						:animation-duration="state.animationDuration"
						:show-legend="state.showLegend"
						:legend-position="state.legendPosition"
						:show-tooltip="state.showTooltip"
				/>
			</template>
			<template #controls="{ state }">
				<StoryGroup title="Layout">
					<HstNumber v-model="state.nodeWidth"   title="Node Width"   :min="4"  :max="48" :step="2"/>
					<HstNumber v-model="state.nodePadding" title="Node Padding" :min="0"  :max="32" :step="2"/>
					<HstNumber v-model="state.linkOpacity" title="Link Opacity" :min="0"  :max="1"  :step="0.05"/>
					<HstCheckbox v-model="state.showLabel" title="Show Label"/>
				</StoryGroup>
				<StoryGroup title="Animation">
					<HstCheckbox v-model="state.animated"         title="Animated"/>
					<HstNumber   v-model="state.animationDuration" title="Duration (ms)" :min="100" :max="2000" :step="100"/>
				</StoryGroup>
				<StoryGroup title="Legend">
					<HstCheckbox v-model="state.showLegend"    title="Show Legend"/>
					<HstSelect   v-model="state.legendPosition" title="Legend Position" :options="LEGEND_POSITION_OPTIONS"/>
				</StoryGroup>
				<StoryGroup title="Tooltip">
					<HstCheckbox v-model="state.showTooltip" title="Show Tooltip"/>
				</StoryGroup>
			</template>
		</Variant>

		<Variant title="Events - point-click">
			<origam-chart-sankey
					:series="FIXTURE_WEB_FUNNEL"
					:height="360"
					title="Click a node or link"
					@point-click="logEvent('point-click', $event)"
			/>
		</Variant>

		<Variant title="Events - legend-click">
			<origam-chart-sankey
					:series="FIXTURE_WEB_FUNNEL"
					:height="360"
					:show-legend="true"
					title="Click a legend entry"
					@legend-click="logEvent('legend-click', $event)"
			/>
		</Variant>

		<Variant title="Events - series-toggle">
			<origam-chart-sankey
					:series="FIXTURE_WEB_FUNNEL"
					:height="360"
					:show-legend="true"
					title="Toggle a series via legend"
					@series-toggle="logEvent('series-toggle', $event)"
			/>
		</Variant>

		<Variant title="Slots - title">
			<origam-chart-sankey
					:series="FIXTURE_WEB_FUNNEL"
					:height="360"
			>
				<template #title>
					<strong>Custom title slot</strong>
					<em style="font-size: 0.8125rem; color: var(--origam-color-text-secondary);">custom subtitle via slot</em>
				</template>
			</origam-chart-sankey>
		</Variant>

		<Variant title="Slots - tooltip">
			<origam-chart-sankey
					:series="FIXTURE_WEB_FUNNEL"
					:height="380"
					title="Custom tooltip"
			>
				<template #tooltip="{ point, category }">
					<div style="display: flex; flex-direction: column; gap: 2px; padding: 4px;">
						<strong>{{ category }}</strong>
						<span>{{ typeof point?.y === 'number' ? point.y.toLocaleString() : (point?.y ?? '') }} users</span>
					</div>
				</template>
			</origam-chart-sankey>
		</Variant>

		<Variant title="Slots - node-label">
			<origam-chart-sankey
					:series="FIXTURE_ENERGY"
					:height="380"
					title="Custom node label"
			>
				<template #node-label="{ name, formatted, color }">
					<tspan :fill="color" font-weight="700">{{ name }}</tspan>
					<tspan dx="4" font-size="0.625rem">({{ formatted }})</tspan>
				</template>
			</origam-chart-sankey>
		</Variant>

		<Variant title="Slots - legend-item">
			<origam-chart-sankey
					:series="FIXTURE_WEB_FUNNEL"
					:height="380"
					:show-legend="true"
					title="Custom legend item"
			>
				<template #legend-item="{ series: s, index, visible }">
					<span :style="{ opacity: visible ? 1 : 0.4, fontWeight: '600' }">
						{{ index + 1 }}. {{ s.name }}
					</span>
				</template>
			</origam-chart-sankey>
		</Variant>

		<Variant title="Slots - empty">
			<origam-chart-sankey
					:series="[]"
					:height="320"
					title="Empty state"
			>
				<template #empty>
					<span style="font-style: italic; color: var(--origam-color-text-secondary);">
						No flow data available for this period.
					</span>
				</template>
			</origam-chart-sankey>
		</Variant>

		<Variant title="Responsive width">
			<div
					v-for="w in [480, 960]"
					:key="w"
					:style="{ width: `${ w }px`, maxWidth: '100%', marginBottom: '1rem' }"
					:data-cy="`origam-chart-sankey-responsive-${ w }`"
			>
				<origam-chart-sankey
						:series="FIXTURE_WEB_FUNNEL"
						:title="`${ w }px container`"
				/>
			</div>
		</Variant>

		<Variant
				title="Default"
				:init-state="() => useStoryInitState<IChartSankeyProps>({
					series: [],
					title: 'Web funnel flow',
					subtitle: 'May 2026',
					height: 400,
					nodeWidth: 16,
					nodePadding: 8,
					linkOpacity: 0.4,
					showLabel: true,
					animated: true,
					animationDuration: 600,
					showLegend: false,
					legendPosition: 'bottom',
					showTooltip: true,
					colorScheme: []
				})"
		>
			<template #default="{ state }">
				<origam-chart-sankey
						v-bind="state"
						:series="FIXTURE_WEB_FUNNEL"
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
					<HstSelect v-model="state.bgColor"   title="Bg Color"  :options="COLOR_OPTIONS"/>
					<HstSelect v-model="state.elevation" title="Elevation" :options="ELEVATION_OPTIONS"/>
					<HstSelect v-model="state.rounded"   title="Rounded"   :options="ROUNDED_OPTIONS"/>
				</StoryGroup>
				<StoryGroup title="Functional">
					<HstNumber   v-model="state.nodeWidth"        title="Node Width"     :min="4"   :max="48"   :step="2"/>
					<HstNumber   v-model="state.nodePadding"      title="Node Padding"   :min="0"   :max="32"   :step="2"/>
					<HstNumber   v-model="state.linkOpacity"      title="Link Opacity"   :min="0"   :max="1"    :step="0.05"/>
					<HstNumber   v-model="state.height"           title="Height (px)"    :min="100" :max="800"  :step="20"/>
					<HstNumber   v-model="state.animationDuration" title="Animation (ms)" :min="100" :max="2000" :step="100"/>
					<HstSelect   v-model="state.legendPosition"   title="Legend Position" :options="LEGEND_POSITION_OPTIONS"/>
					<HstCheckbox v-model="state.showLabel"   title="Show Label"/>
					<HstCheckbox v-model="state.animated"    title="Animated"/>
					<HstCheckbox v-model="state.showLegend"  title="Show Legend"/>
					<HstCheckbox v-model="state.showTooltip" title="Show Tooltip"/>
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

	import { OrigamChartSankey } from '@origam/components'
	import type { IChartSankeyProps, IChartSeries } from '@origam/interfaces'

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

	const FIXTURE_ENERGY: Array<IChartSeries> = [
		{
			name: 'Energy budget',
			data: [
				{ from: 'Solar',   to: 'Grid',        value: 30 },
				{ from: 'Wind',    to: 'Grid',        value: 25 },
				{ from: 'Nuclear', to: 'Grid',        value: 20 },
				{ from: 'Grid',    to: 'Residential', value: 35 },
				{ from: 'Grid',    to: 'Industrial',  value: 25 },
				{ from: 'Grid',    to: 'Commercial',  value: 15 }
			] as any
		}
	]

	const FIXTURE_WEB_FUNNEL: Array<IChartSeries> = [
		{
			name: 'Web funnel',
			data: [
				{ from: 'Home',      to: 'Catalogue', value: 100 },
				{ from: 'Catalogue', to: 'Cart',      value: 40 },
				{ from: 'Catalogue', to: 'Exit',      value: 60 },
				{ from: 'Cart',      to: 'Checkout',  value: 25 },
				{ from: 'Cart',      to: 'Exit',      value: 15 },
				{ from: 'Checkout',  to: 'Success',   value: 20 },
				{ from: 'Checkout',  to: 'Failure',   value: 5 }
			] as any
		}
	]
</script>

<docs
		lang="md"
		src="@docs/components/Chart/OrigamChartSankey.md"
/>
