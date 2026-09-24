<template>
	<Story
			group="components"
			title="Chart/OrigamChartMap"
	>

		<Variant
				title="Design"
				:init-state="() => useStoryInitState<Partial<IChartMapProps>>({
					mode: 'choropleth',
					colorRange: ['info', 'danger'],
					defaultCountryFill: 'rgba(0,0,0,0.08)',
					borderColor: 'neutral',
					lineColor: 'primary',
					nodeRadius: 4,
					routeCurvature: 0.3,
					title: 'World Map',
					subtitle: 'Origam Design System',
					height: '400px'
				})"
		>
			<template #default="{ state }">
				<div class="story-shell">
					<origam-chart-map
							:mode="state.mode"
							:series="state.mode === 'choropleth' ? FIXTURE_GDP : FIXTURE_ROUTES"
							:color-range="state.colorRange"
							:default-country-fill="state.defaultCountryFill"
							:border-color="state.borderColor"
							:line-color="state.lineColor"
							:node-radius="state.nodeRadius"
							:route-curvature="state.routeCurvature"
							:title="state.title"
							:subtitle="state.subtitle"
							:height="state.height"
							:bg-color="state.bgColor"
							:elevation="state.elevation"
							:rounded="state.rounded"
					/>
				</div>
			</template>
			<template #controls="{ state }">
				<StoryGroup title="Mode">
					<HstSelect v-model="state.mode" title="Mode" :options="MODE_OPTIONS"/>
				</StoryGroup>
				<StoryGroup title="Color">
					<HstSelect v-model="state.bgColor"    title="Bg Color"              :options="COLOR_OPTIONS"/>
					<HstText   v-model="state.borderColor" title="Border Color (stroke)"/>
					<HstText   v-model="state.lineColor"   title="Line Color (routes)"/>
				</StoryGroup>
				<StoryGroup title="Color Range (choropleth)">
					<HstText v-model="state.colorRange[0]" title="Range Start"/>
					<HstText v-model="state.colorRange[1]" title="Range End"/>
					<HstText v-model="state.defaultCountryFill" title="No-Data Fill"/>
				</StoryGroup>
				<StoryGroup title="Shape">
					<HstSelect v-model="state.elevation" title="Elevation" :options="ELEVATION_OPTIONS"/>
					<HstSelect v-model="state.rounded"   title="Rounded"   :options="ROUNDED_OPTIONS"/>
				</StoryGroup>
				<StoryGroup title="Routes">
					<HstNumber v-model="state.routeCurvature" title="Route Curvature [0..1]" :min="0" :max="1" :step="0.05"/>
					<HstNumber v-model="state.nodeRadius"     title="Node Radius (px)"       :min="1" :max="16" :step="1"/>
				</StoryGroup>
				<StoryGroup title="Title">
					<HstText v-model="state.title"    title="Title"/>
					<HstText v-model="state.subtitle" title="Subtitle"/>
				</StoryGroup>
				<StoryGroup title="Dimension">
					<HstText v-model="state.height" title="Height"/>
					<HstText v-model="state.width"  title="Width"/>
				</StoryGroup>
			</template>
		</Variant>

		<Variant
				title="Functional"
				:init-state="() => useStoryInitState<Partial<IChartMapProps>>({
					mode: 'choropleth',
					showLegend: true,
					legendPosition: 'bottom',
					showTooltip: true,
					animated: true,
					animationDuration: 600,
					aspectRatio: undefined
				})"
		>
			<template #default="{ state }">
				<div class="story-shell">
					<origam-chart-map
							:mode="state.mode"
							:series="state.mode === 'choropleth' ? FIXTURE_GDP : FIXTURE_ROUTES"
							:show-legend="state.showLegend"
							:legend-position="state.legendPosition"
							:show-tooltip="state.showTooltip"
							:animated="state.animated"
							:animation-duration="state.animationDuration"
							:aspect-ratio="state.aspectRatio || undefined"
							:height="state.aspectRatio ? undefined : 380"
							title="Functional Controls"
					/>
				</div>
			</template>
			<template #controls="{ state }">
				<StoryGroup title="Mode">
					<HstSelect v-model="state.mode" title="Mode" :options="MODE_OPTIONS"/>
				</StoryGroup>
				<StoryGroup title="Legend">
					<HstCheckbox v-model="state.showLegend"   title="Show Legend"/>
					<HstSelect   v-model="state.legendPosition" title="Legend Position" :options="LEGEND_POSITION_OPTIONS"/>
				</StoryGroup>
				<StoryGroup title="Tooltip">
					<HstCheckbox v-model="state.showTooltip" title="Show Tooltip"/>
				</StoryGroup>
				<StoryGroup title="Animation">
					<HstCheckbox v-model="state.animated"         title="Animated"/>
					<HstNumber   v-model="state.animationDuration" title="Animation Duration (ms)" :min="100" :max="2000" :step="100"/>
				</StoryGroup>
				<StoryGroup title="Layout">
					<HstText v-model="state.aspectRatio" title="Aspect Ratio (e.g. 16/9)"/>
				</StoryGroup>
			</template>
		</Variant>

		<Variant title="Events - point-click">
			<div
					class="story-shell"
					data-cy="map-emit"
			>
				<origam-chart-map
						mode="choropleth"
						:series="FIXTURE_GDP"
						:height="360"
						title="Click a coloured country"
						data-cy="map-emit-chart"
						@point-click="logEvent('point-click', $event)"
				/>
			</div>
		</Variant>

		<Variant title="Slots - Title">
			<div class="story-shell">
				<origam-chart-map
						mode="choropleth"
						:series="FIXTURE_GDP"
						:height="340"
						data-cy="map-slot-title"
				>
					<template #title>
						<div class="custom-title">
							<strong>Custom Title Slot</strong>
							<span>via #title</span>
						</div>
					</template>
				</origam-chart-map>
			</div>
		</Variant>

		<Variant title="Slots - Tooltip">
			<div
					class="story-shell"
					data-cy="map-slot-tooltip"
			>
				<origam-chart-map
						mode="choropleth"
						:series="FIXTURE_GDP"
						:height="380"
						title="Custom tooltip — hover a coloured country"
						data-cy="map-slot-tooltip-chart"
				>
					<template #tooltip="{ point, category }">
						<div class="custom-tooltip">
							<strong>{{ category }}</strong>
							<span>{{ typeof point?.y === 'number' ? point.y.toFixed(2) + 'T USD' : '' }}</span>
						</div>
					</template>
				</origam-chart-map>
			</div>
		</Variant>

		<Variant title="Slots - Empty">
			<div
					class="story-shell"
					data-cy="map-slot-empty"
			>
				<origam-chart-map
						mode="choropleth"
						:series="[]"
						:height="320"
						title="Empty state"
						data-cy="map-slot-empty-chart"
				>
					<template #empty>
						<div class="custom-empty">
							No country data available for this period.
						</div>
					</template>
				</origam-chart-map>
			</div>
		</Variant>

		<Variant
				title="Default"
				:init-state="() => useStoryInitState<Partial<IChartMapProps>>({
					mode: 'choropleth',
					title: 'World Map',
					subtitle: 'Origam Design System',
					showLegend: true,
					legendPosition: 'bottom',
					showTooltip: true,
					animated: true,
					animationDuration: 600,
					colorRange: ['info', 'danger'],
					defaultCountryFill: 'rgba(0,0,0,0.08)',
					borderColor: 'neutral',
					lineColor: 'primary',
					nodeRadius: 4,
					routeCurvature: 0.3,
					height: '400px'
				})"
		>
			<template #default="{ state }">
				<div
						class="story-shell"
						data-cy="map-playground"
				>
					<origam-chart-map
							:mode="state.mode"
							:series="state.mode === 'choropleth' ? FIXTURE_GDP : FIXTURE_ROUTES"
							:title="state.title"
							:subtitle="state.subtitle"
							:show-legend="state.showLegend"
							:legend-position="state.legendPosition"
							:show-tooltip="state.showTooltip"
							:animated="state.animated"
							:animation-duration="state.animationDuration"
							:color-range="state.colorRange"
							:default-country-fill="state.defaultCountryFill"
							:border-color="state.borderColor"
							:line-color="state.lineColor"
							:node-radius="state.nodeRadius"
							:route-curvature="state.routeCurvature"
							:bg-color="state.bgColor"
							:elevation="state.elevation"
							:rounded="state.rounded"
							:height="state.height"
							:width="state.width"
							data-cy="map-playground-chart"
							@point-click="logEvent('point-click', $event)"
					/>
				</div>
			</template>
			<template #controls="{ state }">
				<StoryGroup title="Content">
					<HstText v-model="state.title"    title="Title"/>
					<HstText v-model="state.subtitle" title="Subtitle"/>
					<HstSelect v-model="state.mode" title="Mode" :options="MODE_OPTIONS"/>
				</StoryGroup>
				<StoryGroup title="Design">
					<HstSelect v-model="state.bgColor"   title="Bg Color"    :options="COLOR_OPTIONS"/>
					<HstSelect v-model="state.elevation" title="Elevation"   :options="ELEVATION_OPTIONS"/>
					<HstSelect v-model="state.rounded"   title="Rounded"     :options="ROUNDED_OPTIONS"/>
					<HstText   v-model="state.borderColor" title="Border Color"/>
					<HstText   v-model="state.lineColor"   title="Line Color"/>
					<HstText   v-model="state.colorRange[0]" title="Color Range Start"/>
					<HstText   v-model="state.colorRange[1]" title="Color Range End"/>
					<HstNumber v-model="state.routeCurvature" title="Route Curvature" :min="0" :max="1" :step="0.05"/>
					<HstNumber v-model="state.nodeRadius"     title="Node Radius"     :min="1" :max="16" :step="1"/>
				</StoryGroup>
				<StoryGroup title="Functional">
					<HstCheckbox v-model="state.showLegend"      title="Show Legend"/>
					<HstSelect   v-model="state.legendPosition"  title="Legend Position" :options="LEGEND_POSITION_OPTIONS"/>
					<HstCheckbox v-model="state.showTooltip"     title="Show Tooltip"/>
					<HstCheckbox v-model="state.animated"        title="Animated"/>
					<HstNumber   v-model="state.animationDuration" title="Animation Duration (ms)" :min="100" :max="2000" :step="100"/>
					<HstText     v-model="state.height"          title="Height"/>
					<HstText     v-model="state.width"           title="Width"/>
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

	import OrigamChartMap from '@origam/components/Chart/OrigamChartMap.vue'

	import type {
		IChartMapChoroplethDatum,
		IChartMapProps,
		IChartMapRouteDatum
	} from '@origam/interfaces/Chart/chart-map.interface'
	import type { IChartSeries } from '@origam/interfaces'

	import StoryGroup from '@stories/components/_shared/StoryGroup.vue'
	import { useStoryInitState } from '@stories/composables'
	import {
		COLOR_OPTIONS,
		ELEVATION_OPTIONS,
		ROUNDED_OPTIONS
	} from '@stories/const'

	const MODE_OPTIONS = [
		{ value: 'choropleth', label: 'choropleth' },
		{ value: 'flight-routes', label: 'flight-routes' }
	]

	const LEGEND_POSITION_OPTIONS = [
		{ value: 'top', label: 'top' },
		{ value: 'bottom', label: 'bottom' },
		{ value: 'left', label: 'left' },
		{ value: 'right', label: 'right' }
	]

	const GDP_DATA: Array<IChartMapChoroplethDatum> = [
		{ code: 'US', value: 27.4, name: 'United States' },
		{ code: 'CN', value: 17.7, name: 'China' },
		{ code: 'DE', value: 4.4, name: 'Germany' },
		{ code: 'JP', value: 4.2, name: 'Japan' },
		{ code: 'IN', value: 3.7, name: 'India' },
		{ code: 'GB', value: 3.1, name: 'United Kingdom' },
		{ code: 'FR', value: 2.9, name: 'France' },
		{ code: 'IT', value: 2.1, name: 'Italy' },
		{ code: 'CA', value: 2.1, name: 'Canada' },
		{ code: 'BR', value: 2.1, name: 'Brazil' },
		{ code: 'RU', value: 1.9, name: 'Russia' },
		{ code: 'KR', value: 1.7, name: 'South Korea' },
		{ code: 'AU', value: 1.7, name: 'Australia' },
		{ code: 'ES', value: 1.6, name: 'Spain' },
		{ code: 'MX', value: 1.4, name: 'Mexico' },
		{ code: 'ID', value: 1.4, name: 'Indonesia' },
		{ code: 'TR', value: 1.1, name: 'Turkey' },
		{ code: 'NL', value: 1.1, name: 'Netherlands' },
		{ code: 'AR', value: 0.6, name: 'Argentina' },
		{ code: 'ZA', value: 0.4, name: 'South Africa' }
	]

	const FIXTURE_GDP: Array<IChartSeries> = [
		{ name: 'GDP (trillions USD)', data: GDP_DATA as any }
	]

	const ROUTES_DATA: Array<IChartMapRouteDatum> = [
		{ from: 'GB', to: 'US', value: 850 },
		{ from: 'GB', to: 'FR', value: 400 },
		{ from: 'GB', to: 'DE', value: 350 },
		{ from: 'GB', to: 'JP', value: 280 },
		{ from: 'GB', to: 'IN', value: 260 },
		{ from: 'GB', to: 'AU', value: 220 },
		{ from: 'GB', to: 'ZA', value: 180 },
		{ from: 'GB', to: 'BR', value: 160 }
	]

	const FIXTURE_ROUTES: Array<IChartSeries> = [
		{ name: 'Routes from GB', data: ROUTES_DATA as any }
	]
</script>

<style scoped>
	.story-shell {
		display: flex;
		flex-direction: column;
		gap: 12px;
		padding: 16px;
	}

	.custom-title {
		display: flex;
		flex-direction: column;
		gap: 2px;
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
</style>

<docs
		lang="md"
		src="@docs/components/Chart/OrigamChartMap.md"
/>
