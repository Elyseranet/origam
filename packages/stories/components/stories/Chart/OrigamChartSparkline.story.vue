<template>
	<Story
			group="components"
			title="Chart/OrigamChartSparkline"
	>

		<Variant
				title="Design"
				:init-state="() => useStoryInitState<Partial<IChartSparklineProps>>({
					type: 'line',
					color: 'primary',
					lineWidth: 1.5,
					showMarkers: false,
					showMin: false,
					showMax: false,
					showLast: true,
					markerSize: 2.5,
					width: 120,
					height: 30
				})"
		>
			<template #default="{ state }">
				<figure class="story-shell">
					<origam-chart-sparkline
							:type="state.type"
							:series="FIXTURE_SALES"
							:color="state.color"
							:line-width="state.lineWidth"
							:show-markers="state.showMarkers"
							:show-min="state.showMin"
							:show-max="state.showMax"
							:show-last="state.showLast"
							:marker-size="state.markerSize"
							:width="state.width"
							:height="state.height"
							:bg-color="state.bgColor"
							:rounded="state.rounded"
							:elevation="state.elevation"
					/>
				</figure>
			</template>
			<template #controls="{ state }">
				<StoryGroup title="Chart Kind">
					<HstSelect v-model="state.type" title="Type" :options="SPARKLINE_KIND_OPTIONS"/>
				</StoryGroup>
				<StoryGroup title="Color">
					<HstSelect v-model="state.color"   title="Color"    :options="COLOR_OPTIONS"/>
					<HstSelect v-model="state.bgColor" title="Bg Color" :options="COLOR_OPTIONS"/>
				</StoryGroup>
				<StoryGroup title="Line">
					<HstNumber v-model="state.lineWidth"  title="Line Width"   :min="0.5" :max="6"   :step="0.5"/>
					<HstNumber v-model="state.markerSize" title="Marker Size"  :min="1"   :max="10"  :step="0.5"/>
				</StoryGroup>
				<StoryGroup title="Markers">
					<HstCheckbox v-model="state.showMarkers" title="Show All Markers"/>
					<HstCheckbox v-model="state.showMin"     title="Show Min"/>
					<HstCheckbox v-model="state.showMax"     title="Show Max"/>
					<HstCheckbox v-model="state.showLast"    title="Show Last"/>
				</StoryGroup>
				<StoryGroup title="Shape">
					<HstSelect v-model="state.rounded"   title="Rounded"   :options="ROUNDED_OPTIONS"/>
					<HstSelect v-model="state.elevation" title="Elevation" :options="ELEVATION_OPTIONS"/>
				</StoryGroup>
				<StoryGroup title="Dimension">
					<HstText v-model="state.width"  title="Width"/>
					<HstText v-model="state.height" title="Height"/>
				</StoryGroup>
			</template>
		</Variant>

		<Variant
				title="Functional"
				:init-state="() => useStoryInitState<Partial<IChartSparklineProps>>({
					type: 'line',
					color: 'primary',
					showTooltip: false,
					animated: false,
					animationDuration: 600,
					width: 120,
					height: 30
				})"
		>
			<template #default="{ state }">
				<figure class="story-shell">
					<origam-chart-sparkline
							:type="state.type"
							:series="FIXTURE_SALES"
							:color="state.color"
							:show-tooltip="state.showTooltip"
							:animated="state.animated"
							:animation-duration="state.animationDuration"
							:title="state.title"
							:subtitle="state.subtitle"
							:aspect-ratio="state.aspectRatio"
							:width="state.width"
							:height="state.height"
					/>
				</figure>
			</template>
			<template #controls="{ state }">
				<StoryGroup title="Tooltip">
					<HstCheckbox v-model="state.showTooltip" title="Show Tooltip"/>
				</StoryGroup>
				<StoryGroup title="Animation">
					<HstCheckbox v-model="state.animated"           title="Animated"/>
					<HstNumber   v-model="state.animationDuration"  title="Duration (ms)" :min="100" :max="2000" :step="100"/>
				</StoryGroup>
				<StoryGroup title="Metadata">
					<HstText v-model="state.title"       title="Title"/>
					<HstText v-model="state.subtitle"    title="Subtitle"/>
					<HstText v-model="state.aspectRatio" title="Aspect Ratio (e.g. 16/9)"/>
				</StoryGroup>
				<StoryGroup title="Dimension">
					<HstText v-model="state.width"  title="Width"/>
					<HstText v-model="state.height" title="Height"/>
				</StoryGroup>
			</template>
		</Variant>

		<Variant title="Events - point-click">
			<figure class="story-shell">
				<p class="story-hint">Click a data point on the sparkline to fire the event.</p>
				<origam-chart-sparkline
						type="line"
						:series="FIXTURE_VOLATILE"
						color="primary"
						:show-markers="true"
						:show-tooltip="true"
						:width="200"
						:height="48"
						@point-click="logEvent('point-click', $event)"
				/>
			</figure>
		</Variant>

		<Variant title="Slots - Tooltip">
			<figure class="story-shell">
				<p class="story-hint">Hover over the sparkline to see the custom tooltip.</p>
				<origam-chart-sparkline
						type="line"
						:series="FIXTURE_VOLATILE"
						color="primary"
						:show-tooltip="true"
						:show-markers="true"
						:width="200"
						:height="48"
				>
					<template #tooltip="{ point, index }">
						<div class="custom-tooltip">
							<strong>#{{ index + 1 }}</strong>
							<span>{{ typeof point?.y === 'number' ? point.y.toLocaleString() : '' }}</span>
						</div>
					</template>
				</origam-chart-sparkline>
			</figure>
		</Variant>

		<Variant title="Slots - Empty">
			<figure class="story-shell">
				<origam-chart-sparkline
						type="line"
						:series="[]"
						color="primary"
						:width="120"
						:height="30"
				>
					<template #empty>
						<span class="custom-empty">N/A</span>
					</template>
				</origam-chart-sparkline>
			</figure>
		</Variant>

		<Variant
				title="Default"
				:init-state="() => useStoryInitState<IChartSparklineProps>({
					type: 'line',
					series: FIXTURE_SALES,
					color: 'primary',
					lineWidth: 1.5,
					showMarkers: false,
					showMin: false,
					showMax: false,
					showLast: true,
					markerSize: 2.5,
					showTooltip: false,
					animated: false,
					animationDuration: 600,
					width: 120,
					height: 30
				})"
		>
			<template #default="{ state }">
				<figure class="story-shell">
					<origam-chart-sparkline
							v-bind="state"
							@point-click="logEvent('point-click', $event)"
					/>
				</figure>
			</template>
			<template #controls="{ state }">
				<StoryGroup title="Design">
					<HstSelect v-model="state.type"      title="Type"      :options="SPARKLINE_KIND_OPTIONS"/>
					<HstSelect v-model="state.color"     title="Color"     :options="COLOR_OPTIONS"/>
					<HstSelect v-model="state.bgColor"   title="Bg Color"  :options="COLOR_OPTIONS"/>
					<HstSelect v-model="state.rounded"   title="Rounded"   :options="ROUNDED_OPTIONS"/>
					<HstSelect v-model="state.elevation" title="Elevation" :options="ELEVATION_OPTIONS"/>
					<HstNumber v-model="state.lineWidth"  title="Line Width"  :min="0.5" :max="6"  :step="0.5"/>
					<HstNumber v-model="state.markerSize" title="Marker Size" :min="1"   :max="10" :step="0.5"/>
				</StoryGroup>
				<StoryGroup title="Markers">
					<HstCheckbox v-model="state.showMarkers" title="Show All Markers"/>
					<HstCheckbox v-model="state.showMin"     title="Show Min"/>
					<HstCheckbox v-model="state.showMax"     title="Show Max"/>
					<HstCheckbox v-model="state.showLast"    title="Show Last"/>
				</StoryGroup>
				<StoryGroup title="Functional">
					<HstCheckbox v-model="state.showTooltip"        title="Show Tooltip"/>
					<HstCheckbox v-model="state.animated"           title="Animated"/>
					<HstNumber   v-model="state.animationDuration"  title="Duration (ms)" :min="100" :max="2000" :step="100"/>
				</StoryGroup>
				<StoryGroup title="Dimension">
					<HstText v-model="state.width"  title="Width"/>
					<HstText v-model="state.height" title="Height"/>
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

	import { OrigamChartSparkline } from '@origam/components'
	import { CHART_SPARKLINE_KIND } from '@origam/enums'
	import type {
		IChartSeries,
		IChartSparklineProps
	} from '@origam/interfaces'

	import StoryGroup from '@stories/components/_shared/StoryGroup.vue'
	import { useStoryInitState } from '@stories/composables'
	import {
		COLOR_OPTIONS,
		ELEVATION_OPTIONS,
		ROUNDED_OPTIONS
	} from '@stories/const'

	const SPARKLINE_KIND_OPTIONS = Object.values(CHART_SPARKLINE_KIND).map((v) => ({ value: v, label: v }))

	const FIXTURE_SALES: Array<IChartSeries> = [
		{ name: 'Monthly sales', data: [18, 22, 19, 25, 32, 28, 33, 30, 36, 39, 42, 45] }
	]

	const buildVolatile = (): Array<number> => {
		const result: Array<number> = []
		let price = 50000
		for (let i = 0; i < 24; i++) {
			price += (Math.random() - 0.48) * 2000
			result.push(Math.round(Math.max(40000, price)))
		}
		return result
	}

	const FIXTURE_VOLATILE: Array<IChartSeries> = [
		{ name: 'BTC/USD 24h', data: buildVolatile() }
	]
</script>

<style scoped>
	.story-shell {
		display: flex;
		flex-direction: column;
		gap: 12px;
		padding: 16px;
		margin: 0;
	}

	.story-hint {
		font-size: 0.8125rem;
		color: var(--origam-color-text-secondary, #6b7280);
		margin: 0;
	}

	.custom-tooltip {
		display: flex;
		flex-direction: column;
		gap: 2px;
		padding: 2px;
		font-size: 0.75rem;
	}

	.custom-empty {
		font-size: 0.75rem;
		color: var(--origam-color-text-secondary, #6b7280);
	}
</style>

<docs
		lang="md"
		src="@docs/components/Chart/OrigamChartSparkline.md"
/>
