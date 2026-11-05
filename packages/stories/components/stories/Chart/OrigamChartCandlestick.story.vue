<template>
	<Story
			group="components"
			title="Chart/OrigamChartCandlestick"
	>

		<Variant
				title="Design"
				:init-state="() => useStoryInitState<Partial<IChartCandlestickProps>>({
					height: 400,
					bullishColor: 'success',
					bearishColor: 'danger',
					candleWidth: 0.6,
					wickWidth: 1,
					showLegend: false,
					legendPosition: 'bottom',
					showGrid: true,
					showAxis: true,
					showTooltip: true,
					title: 'AAPL — 14 trading days',
					subtitle: 'Prices in USD'
				})"
		>
			<template #default="{ state }">
				<origam-chart-candlestick
						:series="FIXTURE_AAPL"
						:height="state.height"
						:bullish-color="state.bullishColor"
						:bearish-color="state.bearishColor"
						:candle-width="state.candleWidth"
						:wick-width="state.wickWidth"
						:show-legend="state.showLegend"
						:legend-position="state.legendPosition"
						:show-grid="state.showGrid"
						:show-axis="state.showAxis"
						:show-tooltip="state.showTooltip"
						:rounded="state.rounded"
						:elevation="state.elevation"
						:bg-color="state.bgColor"
						:title="state.title"
						:subtitle="state.subtitle"
						:aspect-ratio="state.aspectRatio"
				/>
			</template>
			<template #controls="{ state }">
				<StoryGroup title="Color">
					<HstSelect v-model="state.bullishColor" title="Bullish Color" :options="INTENT_OPTIONS"/>
					<HstSelect v-model="state.bearishColor" title="Bearish Color" :options="INTENT_OPTIONS"/>
					<HstSelect v-model="state.bgColor"      title="Bg Color"      :options="COLOR_OPTIONS"/>
				</StoryGroup>
				<StoryGroup title="Candle Shape">
					<HstNumber v-model="state.candleWidth" title="Candle Width [0..1]" :min="0.1" :max="1" :step="0.05"/>
					<HstNumber v-model="state.wickWidth"   title="Wick Width (px)"     :min="0.5" :max="4" :step="0.5"/>
				</StoryGroup>
				<StoryGroup title="Shape">
					<HstSelect v-model="state.rounded"   title="Rounded"   :options="ROUNDED_OPTIONS"/>
					<HstSelect v-model="state.elevation" title="Elevation" :options="ELEVATION_OPTIONS"/>
				</StoryGroup>
				<StoryGroup title="Legend">
					<HstCheckbox v-model="state.showLegend"     title="Show Legend"/>
					<HstSelect   v-model="state.legendPosition" title="Legend Position" :options="LEGEND_POSITION_OPTIONS"/>
				</StoryGroup>
				<StoryGroup title="Display">
					<HstCheckbox v-model="state.showGrid"    title="Show Grid"/>
					<HstCheckbox v-model="state.showAxis"    title="Show Axis"/>
					<HstCheckbox v-model="state.showTooltip" title="Show Tooltip"/>
				</StoryGroup>
				<StoryGroup title="Dimension">
					<HstNumber v-model="state.height"      title="Height (px)" :min="100" :max="800" :step="50"/>
					<HstText   v-model="state.aspectRatio" title="Aspect Ratio (e.g. 16/9)"/>
				</StoryGroup>
				<StoryGroup title="Content">
					<HstText v-model="state.title"    title="Title"/>
					<HstText v-model="state.subtitle" title="Subtitle"/>
				</StoryGroup>
			</template>
		</Variant>

		<Variant
				title="Functional"
				:init-state="() => useStoryInitState<Partial<IChartCandlestickProps>>({
					animated: true,
					animationDuration: 600,
					showTooltip: true
				})"
		>
			<template #default="{ state }">
				<origam-chart-candlestick
						:series="FIXTURE_AAPL"
						:height="360"
						:animated="state.animated"
						:animation-duration="state.animationDuration"
						:show-tooltip="state.showTooltip"
						:y-min="state.yMin || undefined"
						:y-max="state.yMax || undefined"
						title="AAPL — functional controls"
				/>
			</template>
			<template #controls="{ state }">
				<StoryGroup title="Animation">
					<HstCheckbox v-model="state.animated"         title="Animated"/>
					<HstNumber   v-model="state.animationDuration" title="Duration (ms)" :min="0" :max="2000" :step="100"/>
				</StoryGroup>
				<StoryGroup title="Tooltip">
					<HstCheckbox v-model="state.showTooltip" title="Show Tooltip"/>
				</StoryGroup>
				<StoryGroup title="Y Axis Override">
					<HstNumber v-model="state.yMin" title="Y Min (0 = auto)" :min="0" :step="10"/>
					<HstNumber v-model="state.yMax" title="Y Max (0 = auto)" :min="0" :step="10"/>
				</StoryGroup>
			</template>
		</Variant>

		<Variant title="Events - point-click">
			<div
					class="story-shell"
					data-cy="candlestick-emit-point-click"
			>
				<origam-chart-candlestick
						:series="FIXTURE_AAPL"
						:height="360"
						title="Click a candle"
						data-cy="candlestick-emit-point-click-chart"
						@point-click="logEvent('point-click', $event)"
				/>
			</div>
		</Variant>

		<Variant title="Events - legend-click">
			<div
					class="story-shell"
					data-cy="candlestick-emit-legend-click"
			>
				<origam-chart-candlestick
						:series="FIXTURE_AAPL"
						:height="360"
						:show-legend="true"
						title="Click a legend entry"
						data-cy="candlestick-emit-legend-click-chart"
						@legend-click="logEvent('legend-click', $event)"
				/>
			</div>
		</Variant>

		<Variant title="Events - series-toggle">
			<div
					class="story-shell"
					data-cy="candlestick-emit-series-toggle"
			>
				<origam-chart-candlestick
						:series="FIXTURE_AAPL"
						:height="360"
						:show-legend="true"
						title="Toggle a series via legend"
						data-cy="candlestick-emit-series-toggle-chart"
						@series-toggle="logEvent('series-toggle', $event)"
				/>
			</div>
		</Variant>

		<Variant title="Slots - Tooltip">
			<div
					class="story-shell"
					data-cy="candlestick-slot-tooltip"
			>
				<origam-chart-candlestick
						:series="FIXTURE_BTC"
						:height="360"
						title="BTC/USD — custom tooltip"
						data-cy="candlestick-slot-tooltip-chart"
				>
					<template #tooltip="{ datum, change, changePct, isBullish }">
						<div
								class="custom-tooltip"
								:style="{ borderLeftColor: isBullish ? '#22c55e' : '#ef4444' }"
						>
							<strong>{{ datum?.date }}</strong>
							<span>O: ${{ datum?.open?.toLocaleString() }}</span>
							<span>H: ${{ datum?.high?.toLocaleString() }}</span>
							<span>L: ${{ datum?.low?.toLocaleString() }}</span>
							<span>C: ${{ datum?.close?.toLocaleString() }}</span>
							<span :style="{ color: isBullish ? '#22c55e' : '#ef4444' }">
								{{ isBullish ? '+' : '' }}{{ change?.toFixed(0) }} ({{ changePct?.toFixed(2) }}%)
							</span>
						</div>
					</template>
				</origam-chart-candlestick>
			</div>
		</Variant>

		<Variant title="Slots - Empty">
			<div
					class="story-shell"
					data-cy="candlestick-slot-empty"
			>
				<origam-chart-candlestick
						:series="[]"
						:height="320"
						title="Empty state"
						data-cy="candlestick-slot-empty-chart"
				>
					<template #empty>
						<div class="custom-empty">
							<strong>No market data</strong>
							<span>Connect a data source to view the candlestick chart.</span>
						</div>
					</template>
				</origam-chart-candlestick>
			</div>
		</Variant>

		<Variant title="Slots - Legend-Item">
			<div
					class="story-shell"
					data-cy="candlestick-slot-legend-item"
			>
				<origam-chart-candlestick
						:series="FIXTURE_AAPL"
						:height="360"
						:show-legend="true"
						title="AAPL — custom legend item"
						data-cy="candlestick-slot-legend-item-chart"
				>
					<template #legend-item="{ series, index, visible }">
						<span
								class="custom-legend-item"
								:style="{ opacity: visible ? 1 : 0.4 }"
						>
							[{{ index }}] {{ series.name }}
						</span>
					</template>
				</origam-chart-candlestick>
			</div>
		</Variant>

		<Variant title="Slots - Title">
			<div
					class="story-shell"
					data-cy="candlestick-slot-title"
			>
				<origam-chart-candlestick
						:series="FIXTURE_AAPL"
						:height="360"
						data-cy="candlestick-slot-title-chart"
				>
					<template #title>
						<div class="custom-title">
							<strong>Custom Chart Title</strong>
							<em>with a fully custom header block</em>
						</div>
					</template>
				</origam-chart-candlestick>
			</div>
		</Variant>

		<Variant title="Responsive width">
			<div
					v-for="w in [480, 960]"
					:key="w"
					:style="{ width: `${ w }px`, maxWidth: '100%', marginBottom: '1rem' }"
					:data-cy="`origam-chart-candlestick-responsive-${ w }`"
			>
				<origam-chart-candlestick
						:series="FIXTURE_AAPL"
						:title="`${ w }px container`"
				/>
			</div>
		</Variant>

		<Variant
				title="Default"
				:init-state="() => useStoryInitState<IChartCandlestickProps>({
					series: FIXTURE_AAPL,
					height: 400,
					bullishColor: 'success',
					bearishColor: 'danger',
					candleWidth: 0.6,
					wickWidth: 1,
					showLegend: false,
					legendPosition: 'bottom',
					showGrid: true,
					showAxis: true,
					showTooltip: true,
					animated: true,
					title: 'AAPL — 14 trading days',
					subtitle: 'Prices in USD'
				})"
		>
			<template #default="{ state }">
				<origam-chart-candlestick
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
					<HstSelect   v-model="state.bullishColor"  title="Bullish Color"      :options="INTENT_OPTIONS"/>
					<HstSelect   v-model="state.bearishColor"  title="Bearish Color"      :options="INTENT_OPTIONS"/>
					<HstSelect   v-model="state.bgColor"       title="Bg Color"           :options="COLOR_OPTIONS"/>
					<HstNumber   v-model="state.candleWidth"   title="Candle Width [0..1]" :min="0.1" :max="1"   :step="0.05"/>
					<HstNumber   v-model="state.wickWidth"     title="Wick Width (px)"     :min="0.5" :max="4"   :step="0.5"/>
					<HstSelect   v-model="state.rounded"       title="Rounded"            :options="ROUNDED_OPTIONS"/>
					<HstSelect   v-model="state.elevation"     title="Elevation"          :options="ELEVATION_OPTIONS"/>
					<HstNumber   v-model="state.height"        title="Height (px)"         :min="100" :max="800" :step="50"/>
					<HstCheckbox v-model="state.showLegend"    title="Show Legend"/>
					<HstSelect   v-model="state.legendPosition" title="Legend Position"   :options="LEGEND_POSITION_OPTIONS"/>
					<HstCheckbox v-model="state.showGrid"      title="Show Grid"/>
					<HstCheckbox v-model="state.showAxis"      title="Show Axis"/>
				</StoryGroup>
				<StoryGroup title="Functional">
					<HstCheckbox v-model="state.showTooltip"  title="Show Tooltip"/>
					<HstCheckbox v-model="state.animated"     title="Animated"/>
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

	import { OrigamChartCandlestick } from '@origam/components'
	import type {
		IChartCandlestickProps,
		IChartPoint,
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

	import type { TChartLegendPosition } from '@origam/types'
	import type { IOptions } from '@origam/interfaces'

	const LEGEND_POSITION_OPTIONS: Array<IOptions<TChartLegendPosition>> = [
		{ value: 'top',    label: 'Top' },
		{ value: 'bottom', label: 'Bottom' },
		{ value: 'left',   label: 'Left' },
		{ value: 'right',  label: 'Right' }
	]

	const FIXTURE_AAPL: Array<IChartSeries> = [
		{
			name: 'AAPL',
			data: [
				{ date: 'May 1',  open: 150.20, high: 153.80, low: 149.50, close: 152.90 },
				{ date: 'May 2',  open: 152.90, high: 155.40, low: 151.20, close: 151.60 },
				{ date: 'May 5',  open: 151.60, high: 154.20, low: 150.80, close: 153.70 },
				{ date: 'May 6',  open: 153.70, high: 157.30, low: 153.10, close: 156.80 },
				{ date: 'May 7',  open: 156.80, high: 158.90, low: 154.60, close: 155.20 },
				{ date: 'May 8',  open: 155.20, high: 157.00, low: 153.40, close: 154.10 },
				{ date: 'May 9',  open: 154.10, high: 156.50, low: 152.70, close: 155.90 },
				{ date: 'May 12', open: 155.90, high: 159.80, low: 155.30, close: 158.40 },
				{ date: 'May 13', open: 158.40, high: 161.20, low: 157.90, close: 160.10 },
				{ date: 'May 14', open: 160.10, high: 162.50, low: 158.60, close: 159.30 },
				{ date: 'May 15', open: 159.30, high: 162.00, low: 158.00, close: 161.70 },
				{ date: 'May 16', open: 161.70, high: 164.30, low: 160.40, close: 163.50 },
				{ date: 'May 19', open: 163.50, high: 166.20, low: 162.10, close: 162.80 },
				{ date: 'May 20', open: 162.80, high: 165.40, low: 161.90, close: 164.90 }
			] as any
		}
	]

	const FIXTURE_BTC: Array<IChartSeries> = [
		{
			name: 'BTC/USD',
			data: [
				{ date: 'Apr 1',  open: 45000, high: 46800, low: 44200, close: 46200 },
				{ date: 'Apr 2',  open: 46200, high: 48100, low: 45500, close: 47500 },
				{ date: 'Apr 3',  open: 47500, high: 49300, low: 46100, close: 45800 },
				{ date: 'Apr 4',  open: 45800, high: 47600, low: 44800, close: 46900 },
				{ date: 'Apr 5',  open: 46900, high: 50200, low: 46400, close: 49800 },
				{ date: 'Apr 6',  open: 49800, high: 51500, low: 48200, close: 48600 },
				{ date: 'Apr 7',  open: 48600, high: 50800, low: 47300, close: 50100 },
				{ date: 'Apr 8',  open: 50100, high: 52600, low: 49500, close: 51800 },
				{ date: 'Apr 9',  open: 51800, high: 53200, low: 49800, close: 50200 },
				{ date: 'Apr 10', open: 50200, high: 52000, low: 48600, close: 51500 },
				{ date: 'Apr 11', open: 51500, high: 54800, low: 50900, close: 54200 },
				{ date: 'Apr 12', open: 54200, high: 56100, low: 52800, close: 53400 },
				{ date: 'Apr 13', open: 53400, high: 55600, low: 52100, close: 54900 },
				{ date: 'Apr 14', open: 54900, high: 57200, low: 54100, close: 56800 },
				{ date: 'Apr 15', open: 56800, high: 58400, low: 55200, close: 55600 },
				{ date: 'Apr 16', open: 55600, high: 57900, low: 54300, close: 57100 },
				{ date: 'Apr 17', open: 57100, high: 59800, low: 56400, close: 59200 },
				{ date: 'Apr 18', open: 59200, high: 61500, low: 57800, close: 58400 },
				{ date: 'Apr 19', open: 58400, high: 60200, low: 56800, close: 59700 },
				{ date: 'Apr 20', open: 59700, high: 62300, low: 58900, close: 61800 },
				{ date: 'Apr 21', open: 61800, high: 63500, low: 60200, close: 60600 },
				{ date: 'Apr 22', open: 60600, high: 62800, low: 59400, close: 62100 },
				{ date: 'Apr 23', open: 62100, high: 64200, low: 61300, close: 63500 },
				{ date: 'Apr 24', open: 63500, high: 65800, low: 62400, close: 64900 },
				{ date: 'Apr 25', open: 64900, high: 67200, low: 63800, close: 63200 },
				{ date: 'Apr 26', open: 63200, high: 65500, low: 62000, close: 64600 },
				{ date: 'Apr 27', open: 64600, high: 66900, low: 63700, close: 66200 },
				{ date: 'Apr 28', open: 66200, high: 68500, low: 65100, close: 65400 },
				{ date: 'Apr 29', open: 65400, high: 67800, low: 64300, close: 67000 },
				{ date: 'Apr 30', open: 67000, high: 69400, low: 66200, close: 52000 }
			] as any
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
		gap: 2px;
		padding: 4px 8px;
		border-left: 3px solid transparent;
		font-size: 0.8125rem;
	}

	.custom-empty {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 6px;
		color: var(--origam-color-text-secondary);
	}

	.custom-empty strong {
		font-size: 1rem;
		color: var(--origam-color-text-primary);
	}

	.custom-legend-item {
		font-size: 0.8125rem;
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
		src="@docs/components/Chart/OrigamChartCandlestick.md"
/>
