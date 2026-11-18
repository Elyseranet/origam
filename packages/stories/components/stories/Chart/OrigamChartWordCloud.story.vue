<template>
	<Story
			group="components"
			title="Chart/OrigamChartWordCloud"
	>

		<Variant
				title="Design"
				:init-state="() => useStoryInitState<Partial<IChartWordCloudProps>>({
					height: 400,
					minFontSize: 12,
					maxFontSize: 64,
					fontWeight: 600,
					fontFamily: 'inherit',
					rotation: 'none'
				})"
		>
			<template #default="{ state }">
				<origam-chart-word-cloud
						:series="FIXTURE_TECH"
						:bg-color="state.bgColor"
						:rounded="state.rounded"
						:elevation="state.elevation"
						:width="state.width"
						:height="state.height"
						:min-font-size="state.minFontSize"
						:max-font-size="state.maxFontSize"
						:font-family="state.fontFamily"
						:font-weight="state.fontWeight"
						:rotation="state.rotation"
						:color-scheme="state.colorScheme || undefined"
						:aspect-ratio="state.aspectRatio || undefined"
						title="Tech Buzzwords"
						subtitle="2026 — weighted by mention frequency"
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
				<StoryGroup title="Typography">
					<HstNumber v-model="state.minFontSize" title="Min Font Size (px)" :min="4"  :max="32"  :step="1"/>
					<HstNumber v-model="state.maxFontSize" title="Max Font Size (px)" :min="16" :max="120" :step="2"/>
					<HstNumber v-model="state.fontWeight"  title="Font Weight"        :min="100" :max="900" :step="100"/>
					<HstText   v-model="state.fontFamily"  title="Font Family"/>
				</StoryGroup>
				<StoryGroup title="Layout">
					<HstSelect v-model="state.rotation"   title="Rotation"     :options="ROTATION_OPTIONS"/>
					<HstText   v-model="state.aspectRatio" title="Aspect Ratio (ex: 16/9)"/>
				</StoryGroup>
				<StoryGroup title="Dimension">
					<HstText v-model="state.width"  title="Width"/>
					<HstText v-model="state.height" title="Height"/>
				</StoryGroup>
			</template>
		</Variant>

		<Variant
				title="Functional"
				:init-state="() => useStoryInitState<Partial<IChartWordCloudProps>>({
					showLegend: false,
					legendPosition: 'bottom',
					showTooltip: true,
					animated: true,
					animationDuration: 600,
					title: 'Tech Buzzwords',
					subtitle: '2026 — weighted by mention frequency'
				})"
		>
			<template #default="{ state }">
				<origam-chart-word-cloud
						:series="FIXTURE_TECH"
						:show-legend="state.showLegend"
						:legend-position="state.legendPosition"
						:show-tooltip="state.showTooltip"
						:animated="state.animated"
						:animation-duration="state.animationDuration"
						:title="state.title"
						:subtitle="state.subtitle"
						:height="400"
				/>
			</template>
			<template #controls="{ state }">
				<StoryGroup title="Display">
					<HstCheckbox v-model="state.showTooltip" title="Show Tooltip"/>
					<HstCheckbox v-model="state.showLegend"  title="Show Legend"/>
					<HstSelect   v-model="state.legendPosition" title="Legend Position" :options="LEGEND_POSITION_OPTIONS"/>
				</StoryGroup>
				<StoryGroup title="Animation">
					<HstCheckbox v-model="state.animated"          title="Animated"/>
					<HstNumber   v-model="state.animationDuration" title="Animation Duration (ms)" :min="100" :max="2000" :step="100"/>
				</StoryGroup>
				<StoryGroup title="Labels">
					<HstText v-model="state.title"    title="Title"/>
					<HstText v-model="state.subtitle" title="Subtitle"/>
				</StoryGroup>
			</template>
		</Variant>

		<Variant title="Events - point-click">
			<div class="story-shell" data-cy="word-cloud-emit-point-click">
				<origam-chart-word-cloud
						:series="FIXTURE_TECH"
						:height="400"
						title="Click or press Enter / Space on a word"
						data-cy="word-cloud-emit-point-click-chart"
						@point-click="logEvent('point-click', $event)"
				/>
			</div>
		</Variant>

		<Variant title="Events - legend-click">
			<div class="story-shell" data-cy="word-cloud-emit-legend-click">
				<origam-chart-word-cloud
						:series="FIXTURE_TECH"
						:height="400"
						:show-legend="true"
						title="Click a legend entry"
						data-cy="word-cloud-emit-legend-click-chart"
						@legend-click="logEvent('legend-click', $event)"
				/>
			</div>
		</Variant>

		<Variant title="Events - series-toggle">
			<div class="story-shell" data-cy="word-cloud-emit-series-toggle">
				<origam-chart-word-cloud
						:series="FIXTURE_TECH"
						:height="400"
						:show-legend="true"
						title="Toggle a series via the legend"
						data-cy="word-cloud-emit-series-toggle-chart"
						@series-toggle="logEvent('series-toggle', $event)"
				/>
			</div>
		</Variant>

		<Variant title="Slots - Tooltip">
			<div class="story-shell" data-cy="word-cloud-slot-tooltip">
				<origam-chart-word-cloud
						:series="FIXTURE_TECH"
						:height="400"
						title="Custom tooltip"
						data-cy="word-cloud-slot-tooltip-chart"
				>
					<template #tooltip="{ point, category }">
						<div class="custom-tooltip">
							<strong>{{ category }}</strong>
							<span>{{ typeof point?.y === 'number' ? point.y.toLocaleString() : (point?.y ?? '') }} mentions</span>
						</div>
					</template>
				</origam-chart-word-cloud>
			</div>
		</Variant>

		<Variant title="Slots - Legend-item">
			<div class="story-shell" data-cy="word-cloud-slot-legend-item">
				<origam-chart-word-cloud
						:series="FIXTURE_TECH"
						:height="400"
						:show-legend="true"
						title="Custom legend items"
						data-cy="word-cloud-slot-legend-item-chart"
				>
					<template #legend-item="{ series, index, visible }">
						<span :style="{ opacity: visible ? 1 : 0.4, fontWeight: 'bold' }">
							#{{ index + 1 }} {{ series.name }}
						</span>
					</template>
				</origam-chart-word-cloud>
			</div>
		</Variant>

		<Variant title="Slots - Title">
			<div class="story-shell" data-cy="word-cloud-slot-title">
				<origam-chart-word-cloud
						:series="FIXTURE_TECH"
						:height="400"
						data-cy="word-cloud-slot-title-chart"
				>
					<template #title>
						<div class="custom-title">
							<strong>Custom Title Block</strong>
							<em>with custom subtitle markup</em>
						</div>
					</template>
				</origam-chart-word-cloud>
			</div>
		</Variant>

		<Variant title="Slots - Empty">
			<div class="story-shell" data-cy="word-cloud-slot-empty">
				<origam-chart-word-cloud
						:series="[]"
						:height="320"
						title="Empty state"
						data-cy="word-cloud-slot-empty-chart"
				>
					<template #empty>
						<div class="custom-empty">
							No word frequency data available for this period.
						</div>
					</template>
				</origam-chart-word-cloud>
			</div>
		</Variant>

		<Variant title="Responsive width">
			<div
					v-for="w in [480, 960]"
					:key="w"
					:style="{ width: `${ w }px`, maxWidth: '100%', marginBottom: '1rem' }"
					:data-cy="`origam-chart-word-cloud-responsive-${ w }`"
			>
				<origam-chart-word-cloud
						:series="FIXTURE_TECH"
						:title="`${ w }px container`"
				/>
			</div>
		</Variant>

		<Variant
				title="Default"
				:init-state="() => useStoryInitState<Partial<IChartWordCloudProps>>({
					height: 400,
					animated: true,
					showLegend: false,
					showTooltip: true,
					legendPosition: 'bottom',
					rotation: 'none',
					minFontSize: 12,
					maxFontSize: 64,
					fontWeight: 600,
					fontFamily: 'inherit',
					title: 'Tech Buzzwords',
					subtitle: '2026 — weighted by mention frequency'
				})"
		>
			<template #default="{ state }">
				<origam-chart-word-cloud
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
					<HstSelect v-model="state.rotation"   title="Rotation"     :options="ROTATION_OPTIONS"/>
					<HstSelect v-model="state.bgColor"    title="Bg Color"     :options="COLOR_OPTIONS"/>
					<HstSelect v-model="state.rounded"    title="Rounded"      :options="ROUNDED_OPTIONS"/>
					<HstSelect v-model="state.elevation"  title="Elevation"    :options="ELEVATION_OPTIONS"/>
					<HstNumber v-model="state.minFontSize" title="Min Font Size (px)" :min="4"   :max="32"  :step="1"/>
					<HstNumber v-model="state.maxFontSize" title="Max Font Size (px)" :min="16"  :max="120" :step="2"/>
					<HstNumber v-model="state.fontWeight"  title="Font Weight"        :min="100" :max="900" :step="100"/>
					<HstText   v-model="state.width"       title="Width"/>
					<HstText   v-model="state.height"      title="Height"/>
				</StoryGroup>
				<StoryGroup title="Functional">
					<HstCheckbox v-model="state.showTooltip"   title="Show Tooltip"/>
					<HstCheckbox v-model="state.showLegend"    title="Show Legend"/>
					<HstSelect   v-model="state.legendPosition" title="Legend Position" :options="LEGEND_POSITION_OPTIONS"/>
					<HstCheckbox v-model="state.animated"       title="Animated"/>
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

	import { OrigamChartWordCloud } from '@origam/components'
	import { CHART_WORD_CLOUD_ROTATION } from '@origam/enums'
	import type { IChartSeries, IChartWordCloudProps } from '@origam/interfaces'

	import StoryGroup from '@stories/components/_shared/StoryGroup.vue'
	import { useStoryInitState } from '@stories/composables'
	import {
		COLOR_OPTIONS,
		ELEVATION_OPTIONS,
		ROUNDED_OPTIONS
	} from '@stories/const'

	const ROTATION_OPTIONS = [
		{ label: 'none', value: CHART_WORD_CLOUD_ROTATION.NONE },
		{ label: 'random', value: CHART_WORD_CLOUD_ROTATION.RANDOM },
		{ label: 'orthogonal', value: CHART_WORD_CLOUD_ROTATION.ORTHOGONAL }
	]

	const LEGEND_POSITION_OPTIONS = [
		{ label: 'top', value: 'top' },
		{ label: 'bottom', value: 'bottom' },
		{ label: 'left', value: 'left' },
		{ label: 'right', value: 'right' }
	]

	type WordDatum = { text: string; value: number; color?: string }

	const TECH_DATA: Array<WordDatum> = [
		{ text: 'AI', value: 100 },
		{ text: 'ML', value: 90 },
		{ text: 'Cloud', value: 80 },
		{ text: 'Data', value: 75 },
		{ text: 'Kubernetes', value: 70 },
		{ text: 'Vue', value: 65 },
		{ text: 'React', value: 60 },
		{ text: 'TypeScript', value: 60 },
		{ text: 'Python', value: 55 },
		{ text: 'Rust', value: 50 },
		{ text: 'Go', value: 45 },
		{ text: 'GraphQL', value: 40 },
		{ text: 'REST', value: 35 },
		{ text: 'Docker', value: 35 },
		{ text: 'Serverless', value: 30 },
		{ text: 'Edge', value: 25 },
		{ text: 'WebAssembly', value: 20 },
		{ text: 'Tailwind', value: 18 },
		{ text: 'Vite', value: 15 },
		{ text: 'Bun', value: 12 }
	]

	const FIXTURE_TECH: Array<IChartSeries> = [
		{ name: 'Tech Buzzwords', data: TECH_DATA as any }
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
		gap: 2px;
	}
</style>

<docs
		lang="md"
		src="@docs/components/Chart/OrigamChartWordCloud.md"
/>
