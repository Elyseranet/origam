<template>
	<Story
			group="components"
			title="Chart/OrigamChartStreamgraph"
	>

		<Variant
				title="Design"
				:init-state="() => useStoryInitState<Partial<IChartStreamgraphProps>>({
					offsetMode: 'wiggle',
					smoothing: 'curve',
					colorScheme: [],
					legendPosition: 'bottom',
					showAxis: true,
					showGrid: false,
					animated: true,
					animationDuration: 600,
					aspectRatio: undefined,
					height: 400
				})"
		>
			<template #default="{ state }">
				<div class="story-shell">
					<origam-chart-streamgraph
							:series="FIXTURE_MUSIC"
							:categories="FIXTURE_MUSIC_CATEGORIES"
							:offset-mode="state.offsetMode"
							:smoothing="state.smoothing"
							:color-scheme="state.colorScheme && state.colorScheme.length ? state.colorScheme : undefined"
							:legend-position="state.legendPosition"
							:show-axis="state.showAxis"
							:show-grid="state.showGrid"
							:animated="state.animated"
							:animation-duration="state.animationDuration"
							:aspect-ratio="state.aspectRatio || undefined"
							:height="state.height"
							title="Music Genre Listens"
							subtitle="12 months, 5 genres"
					/>
				</div>
			</template>
			<template #controls="{ state }">
				<StoryGroup title="Layout">
					<HstSelect v-model="state.offsetMode"    title="Offset Mode"        :options="OFFSET_MODE_OPTIONS"/>
					<HstSelect v-model="state.smoothing"     title="Smoothing"          :options="SMOOTHING_OPTIONS"/>
					<HstSelect v-model="state.legendPosition" title="Legend Position"   :options="LEGEND_POSITION_OPTIONS"/>
					<HstText   v-model="state.aspectRatio"   title="Aspect Ratio"/>
				</StoryGroup>
				<StoryGroup title="Visibility">
					<HstCheckbox v-model="state.showAxis"  title="Show Axis"/>
					<HstCheckbox v-model="state.showGrid"  title="Show Grid"/>
				</StoryGroup>
				<StoryGroup title="Animation">
					<HstCheckbox v-model="state.animated"          title="Animated"/>
					<HstNumber   v-model="state.animationDuration" title="Animation Duration (ms)" :min="0" :max="2000" :step="50"/>
				</StoryGroup>
				<StoryGroup title="Dimension">
					<HstNumber v-model="state.height" title="Height (px)" :min="100" :max="800" :step="10"/>
				</StoryGroup>
			</template>
		</Variant>

		<Variant
				title="Functional"
				:init-state="() => useStoryInitState<Partial<IChartStreamgraphProps>>({
					showLegend: true,
					showTooltip: true,
					title: 'Music Genre Listens',
					subtitle: '12 months, 5 genres'
				})"
		>
			<template #default="{ state }">
				<div class="story-shell">
					<origam-chart-streamgraph
							:series="FIXTURE_MUSIC"
							:categories="FIXTURE_MUSIC_CATEGORIES"
							:show-legend="state.showLegend"
							:show-tooltip="state.showTooltip"
							:title="state.title"
							:subtitle="state.subtitle"
							:height="360"
					/>
				</div>
			</template>
			<template #controls="{ state }">
				<StoryGroup title="Display">
					<HstCheckbox v-model="state.showLegend"  title="Show Legend"/>
					<HstCheckbox v-model="state.showTooltip" title="Show Tooltip"/>
				</StoryGroup>
				<StoryGroup title="Content">
					<HstText v-model="state.title"    title="Title"/>
					<HstText v-model="state.subtitle" title="Subtitle"/>
				</StoryGroup>
			</template>
		</Variant>

		<Variant title="Events - point-click">
			<div class="story-shell">
				<origam-chart-streamgraph
						:series="FIXTURE_TECH"
						:categories="FIXTURE_TECH_CATEGORIES"
						:height="340"
						title="Click a ribbon"
						@point-click="logEvent('point-click', $event)"
				/>
			</div>
		</Variant>

		<Variant title="Events - legend-click">
			<div class="story-shell">
				<origam-chart-streamgraph
						:series="FIXTURE_MUSIC"
						:categories="FIXTURE_MUSIC_CATEGORIES"
						:height="340"
						title="Click a legend entry"
						@legend-click="logEvent('legend-click', $event)"
				/>
			</div>
		</Variant>

		<Variant title="Events - series-toggle">
			<div class="story-shell">
				<origam-chart-streamgraph
						:series="FIXTURE_MUSIC"
						:categories="FIXTURE_MUSIC_CATEGORIES"
						:height="340"
						title="Toggle a series via the legend"
						@series-toggle="logEvent('series-toggle', $event)"
				/>
			</div>
		</Variant>

		<Variant title="Slots - Tooltip">
			<div class="story-shell">
				<origam-chart-streamgraph
						:series="FIXTURE_MUSIC"
						:categories="FIXTURE_MUSIC_CATEGORIES"
						:height="380"
						title="Custom multi-series tooltip"
				>
					<template #tooltip="{ category, allPoints }">
						<div class="custom-tooltip">
							<strong class="custom-tooltip__category">{{ category }}</strong>
							<ul class="custom-tooltip__list">
								<li
										v-for="p in allPoints"
										:key="p.series.name"
										class="custom-tooltip__row"
								>
									<span
											class="custom-tooltip__swatch"
											:style="{ background: p.color }"
									/>
									<span class="custom-tooltip__name">{{ p.series.name }}</span>
									<span class="custom-tooltip__value">{{ p.value.toLocaleString() }}</span>
								</li>
							</ul>
						</div>
					</template>
				</origam-chart-streamgraph>
			</div>
		</Variant>

		<Variant title="Slots - Legend-Item">
			<div class="story-shell">
				<origam-chart-streamgraph
						:series="FIXTURE_MUSIC"
						:categories="FIXTURE_MUSIC_CATEGORIES"
						:height="360"
						title="Custom legend items"
				>
					<template #legend-item="{ series, visible }">
						<span :style="{ opacity: visible ? 1 : 0.4, fontStyle: 'italic' }">
							{{ series.name }}
						</span>
					</template>
				</origam-chart-streamgraph>
			</div>
		</Variant>

		<Variant title="Slots - Title">
			<div class="story-shell">
				<origam-chart-streamgraph
						:series="FIXTURE_MUSIC"
						:categories="FIXTURE_MUSIC_CATEGORIES"
						:height="360"
				>
					<template #title>
						<strong>Custom Title Block</strong>
					</template>
				</origam-chart-streamgraph>
			</div>
		</Variant>

		<Variant title="Slots - Empty">
			<div class="story-shell">
				<origam-chart-streamgraph
						:series="[]"
						:categories="[]"
						:height="320"
						title="Empty state"
				>
					<template #empty>
						<div class="custom-empty">
							No streaming data available for this period.
						</div>
					</template>
				</origam-chart-streamgraph>
			</div>
		</Variant>

		<Variant title="Responsive width">
			<div
					v-for="w in [480, 960]"
					:key="w"
					:style="{ width: `${ w }px`, maxWidth: '100%', marginBottom: '1rem' }"
					:data-cy="`origam-chart-streamgraph-responsive-${ w }`"
			>
				<origam-chart-streamgraph
						:series="FIXTURE_TECH" :categories="FIXTURE_TECH_CATEGORIES"
						:title="`${ w }px container`"
				/>
			</div>
		</Variant>

		<Variant
				title="Default"
				:init-state="() => useStoryInitState<Partial<IChartStreamgraphProps>>({
					offsetMode: 'wiggle',
					smoothing: 'curve',
					height: 400,
					animated: true,
					showLegend: true,
					showTooltip: true,
					showAxis: true,
					showGrid: false,
					legendPosition: 'bottom',
					title: 'Music Genre Listens',
					subtitle: '12 months, 5 genres'
				})"
		>
			<template #default="{ state }">
				<div class="story-shell">
					<origam-chart-streamgraph
							:series="FIXTURE_MUSIC"
							:categories="FIXTURE_MUSIC_CATEGORIES"
							:offset-mode="state.offsetMode"
							:smoothing="state.smoothing"
							:height="state.height"
							:animated="state.animated"
							:show-legend="state.showLegend"
							:show-tooltip="state.showTooltip"
							:show-axis="state.showAxis"
							:show-grid="state.showGrid"
							:legend-position="state.legendPosition"
							:title="state.title"
							:subtitle="state.subtitle"
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
					<HstSelect v-model="state.offsetMode"     title="Offset Mode"      :options="OFFSET_MODE_OPTIONS"/>
					<HstSelect v-model="state.smoothing"      title="Smoothing"        :options="SMOOTHING_OPTIONS"/>
					<HstSelect v-model="state.legendPosition" title="Legend Position"  :options="LEGEND_POSITION_OPTIONS"/>
					<HstNumber v-model="state.height"         title="Height (px)"      :min="100" :max="800" :step="10"/>
				</StoryGroup>
				<StoryGroup title="Functional">
					<HstCheckbox v-model="state.showLegend"  title="Show Legend"/>
					<HstCheckbox v-model="state.showTooltip" title="Show Tooltip"/>
					<HstCheckbox v-model="state.showAxis"    title="Show Axis"/>
					<HstCheckbox v-model="state.showGrid"    title="Show Grid"/>
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

	import { OrigamChartStreamgraph } from '@origam/components'
	import type { IChartSeries, IChartStreamgraphProps } from '@origam/interfaces'
	import type { IOptions } from '@origam/interfaces'
	import type { TChartStreamgraphOffset, TChartLegendPosition } from '@origam/types'

	import StoryGroup from '@stories/components/_shared/StoryGroup.vue'
	import { useStoryInitState } from '@stories/composables'

	const OFFSET_MODE_OPTIONS: Array<IOptions<TChartStreamgraphOffset>> = [
		{ label: 'wiggle (canonical)', value: 'wiggle' },
		{ label: 'silhouette (centered)', value: 'silhouette' },
		{ label: 'expand (100% normalised)', value: 'expand' },
		{ label: 'zero (stacked area)', value: 'zero' }
	]

	const SMOOTHING_OPTIONS: Array<IOptions<'curve' | 'none'>> = [
		{ label: 'curve (Catmull-Rom)', value: 'curve' },
		{ label: 'none (linear)', value: 'none' }
	]

	const LEGEND_POSITION_OPTIONS: Array<IOptions<TChartLegendPosition>> = [
		{ label: 'bottom', value: 'bottom' },
		{ label: 'top', value: 'top' },
		{ label: 'left', value: 'left' },
		{ label: 'right', value: 'right' }
	]

	const FIXTURE_MUSIC_CATEGORIES = [
		'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
		'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
	]

	const FIXTURE_MUSIC: Array<IChartSeries> = [
		{
			name: 'Pop',
			data: [420, 480, 510, 460, 440, 490, 530, 560, 520, 480, 460, 500],
			color: 'primary'
		},
		{
			name: 'Rock',
			data: [320, 300, 280, 310, 350, 370, 360, 340, 380, 400, 420, 390],
			color: 'danger'
		},
		{
			name: 'Hip-Hop',
			data: [260, 310, 380, 420, 400, 380, 350, 330, 310, 340, 360, 390],
			color: 'warning'
		},
		{
			name: 'Electronic',
			data: [180, 200, 220, 190, 210, 260, 300, 340, 310, 280, 250, 230],
			color: 'info'
		},
		{
			name: 'Jazz',
			data: [90, 80, 75, 85, 95, 100, 88, 92, 110, 120, 130, 115],
			color: 'success'
		}
	]

	const FIXTURE_TECH_CATEGORIES = ['Q1 24', 'Q2 24', 'Q3 24', 'Q4 24', 'Q1 25', 'Q2 25', 'Q3 25', 'Q4 25']

	const FIXTURE_TECH: Array<IChartSeries> = [
		{
			name: 'Vue',
			data: [280, 310, 340, 370, 400, 420, 440, 460],
			color: 'success'
		},
		{
			name: 'React',
			data: [620, 600, 580, 560, 540, 520, 500, 490],
			color: 'info'
		},
		{
			name: 'Svelte',
			data: [60, 80, 110, 140, 170, 200, 230, 260],
			color: 'warning'
		},
		{
			name: 'Angular',
			data: [380, 360, 340, 310, 280, 260, 240, 220],
			color: 'danger'
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
		gap: 6px;
		padding: 4px;
		min-width: 160px;
	}

	.custom-tooltip__category {
		font-size: 0.8125rem;
		border-bottom: 1px solid rgba(255, 255, 255, 0.2);
		padding-bottom: 4px;
	}

	.custom-tooltip__list {
		list-style: none;
		margin: 0;
		padding: 0;
		display: flex;
		flex-direction: column;
		gap: 4px;
	}

	.custom-tooltip__row {
		display: flex;
		align-items: center;
		gap: 6px;
		font-size: 0.75rem;
	}

	.custom-tooltip__swatch {
		display: inline-block;
		width: 8px;
		height: 8px;
		border-radius: 2px;
		flex-shrink: 0;
	}

	.custom-tooltip__name {
		flex: 1;
	}

	.custom-tooltip__value {
		font-weight: 600;
	}

	.custom-empty {
		color: var(--origam-color-text-secondary, #6b7280);
		font-style: italic;
	}
</style>

<docs
		lang="md"
		src="@docs/components/Chart/OrigamChartStreamgraph.md"
/>
