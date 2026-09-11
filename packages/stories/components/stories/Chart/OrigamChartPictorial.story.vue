<template>
	<Story
			group="components"
			title="Chart/OrigamChartPictorial"
	>

		<Variant
				title="Design"
				:init-state="() => useStoryInitState<Partial<IChartPictorialProps>>({
					series: FIXTURE_SATISFACTION,
					categories: FIXTURE_SATISFACTION_CATEGORIES,
					height: '360',
					mode: CHART_PICTORIAL_MODE.STACK,
					direction: CHART_PICTORIAL_DIRECTION.VERTICAL,
					iconsPerUnit: 5,
					icon: undefined,
					iconColor: undefined,
					emptyIconColor: undefined,
					colorScheme: undefined,
					legendPosition: 'bottom',
					title: 'Customer satisfaction',
					subtitle: '',
					showLegend: true,
					showTooltip: true,
					showLabel: true,
					showAxis: true,
					animated: true
				})"
		>
			<template #default="{ state }">
				<origam-chart-pictorial
						:series="state.series ?? FIXTURE_SATISFACTION"
						:categories="state.categories ?? FIXTURE_SATISFACTION_CATEGORIES"
						:height="state.height"
						:mode="state.mode"
						:direction="state.direction"
						:icons-per-unit="state.iconsPerUnit"
						:icon="state.icon || undefined"
						:icon-color="state.iconColor || undefined"
						:empty-icon-color="state.emptyIconColor || undefined"
						:color-scheme="state.colorScheme || undefined"
						:legend-position="state.legendPosition"
						:title="state.title"
						:subtitle="state.subtitle || undefined"
						:show-legend="state.showLegend"
						:show-tooltip="state.showTooltip"
						:show-label="state.showLabel"
						:show-axis="state.showAxis"
						:animated="state.animated"
				/>
			</template>
			<template #controls="{ state }">
				<StoryGroup title="Mode">
					<HstSelect v-model="state.mode"      title="Mode"      :options="MODE_OPTIONS"/>
					<HstSelect v-model="state.direction" title="Direction" :options="DIRECTION_OPTIONS"/>
				</StoryGroup>
				<StoryGroup title="Icon">
					<HstSelect v-model="state.icon"           title="Icon"             :options="PICTORIAL_ICON_OPTIONS"/>
					<HstSelect v-model="state.iconColor"      title="Icon Color"       :options="INTENT_OPTIONS"/>
					<HstText   v-model="state.emptyIconColor" title="Empty Icon Color"/>
				</StoryGroup>
				<StoryGroup title="Data">
					<HstNumber v-model="state.iconsPerUnit" title="Icons Per Unit" :min="1" :max="100" :step="1"/>
				</StoryGroup>
				<StoryGroup title="Legend">
					<HstSelect   v-model="state.legendPosition" title="Legend Position" :options="LEGEND_POSITION_OPTIONS"/>
					<HstCheckbox v-model="state.showLegend"     title="Show Legend"/>
				</StoryGroup>
				<StoryGroup title="Labels & Axis">
					<HstCheckbox v-model="state.showLabel" title="Show Label"/>
					<HstCheckbox v-model="state.showAxis"  title="Show Axis"/>
				</StoryGroup>
				<StoryGroup title="Dimension">
					<HstText v-model="state.height" title="Height"/>
				</StoryGroup>
				<StoryGroup title="Animation">
					<HstCheckbox v-model="state.animated" title="Animated"/>
				</StoryGroup>
				<StoryGroup title="Title">
					<HstText v-model="state.title"    title="Title"/>
					<HstText v-model="state.subtitle" title="Subtitle"/>
				</StoryGroup>
				<StoryGroup title="Tooltip">
					<HstCheckbox v-model="state.showTooltip" title="Show Tooltip"/>
				</StoryGroup>
			</template>
		</Variant>

		<Variant
				title="Functional"
				:init-state="() => useStoryInitState<Partial<IChartPictorialProps>>({
					series: FIXTURE_SATISFACTION,
					categories: FIXTURE_SATISFACTION_CATEGORIES,
					height: '360',
					iconsPerUnit: 5,
					showLegend: true,
					showTooltip: true,
					showLabel: true,
					showAxis: true,
					animated: true
				})"
		>
			<template #default="{ state }">
				<origam-chart-pictorial
						:series="state.series ?? FIXTURE_SATISFACTION"
						:categories="state.categories ?? FIXTURE_SATISFACTION_CATEGORIES"
						:height="state.height"
						:icons-per-unit="state.iconsPerUnit"
						:show-legend="state.showLegend"
						:show-tooltip="state.showTooltip"
						:show-label="state.showLabel"
						:show-axis="state.showAxis"
						:animated="state.animated"
						title="Functional controls"
				/>
			</template>
			<template #controls="{ state }">
				<StoryGroup title="Display">
					<HstCheckbox v-model="state.showLegend"  title="Show Legend"/>
					<HstCheckbox v-model="state.showTooltip" title="Show Tooltip"/>
					<HstCheckbox v-model="state.showLabel"   title="Show Label"/>
					<HstCheckbox v-model="state.showAxis"    title="Show Axis"/>
				</StoryGroup>
				<StoryGroup title="Animation">
					<HstCheckbox v-model="state.animated" title="Animated"/>
				</StoryGroup>
				<StoryGroup title="Data">
					<HstNumber v-model="state.iconsPerUnit" title="Icons Per Unit" :min="1" :max="100" :step="1"/>
				</StoryGroup>
				<StoryGroup title="Dimension">
					<HstText v-model="state.height" title="Height"/>
				</StoryGroup>
			</template>
		</Variant>

		<Variant title="Events - point-click">
			<div
					class="story-shell"
					data-cy="pictorial-emit-point-click"
			>
				<origam-chart-pictorial
						:series="FIXTURE_SATISFACTION"
						:categories="FIXTURE_SATISFACTION_CATEGORIES"
						:icons-per-unit="5"
						:height="360"
						title="Click a column"
						data-cy="pictorial-emit-point-click-chart"
						@point-click="logEvent('point-click', $event)"
				/>
			</div>
		</Variant>

		<Variant title="Events - legend-click">
			<div
					class="story-shell"
					data-cy="pictorial-emit-legend-click"
			>
				<origam-chart-pictorial
						:series="FIXTURE_RATINGS"
						:categories="FIXTURE_RATINGS_CATEGORIES"
						:icons-per-unit="10"
						:height="360"
						title="Click a legend entry"
						data-cy="pictorial-emit-legend-click-chart"
						@legend-click="logEvent('legend-click', $event)"
				/>
			</div>
		</Variant>

		<Variant title="Events - series-toggle">
			<div
					class="story-shell"
					data-cy="pictorial-emit-series-toggle"
			>
				<origam-chart-pictorial
						:series="FIXTURE_RATINGS"
						:categories="FIXTURE_RATINGS_CATEGORIES"
						:icons-per-unit="10"
						:height="360"
						title="Toggle a series"
						data-cy="pictorial-emit-series-toggle-chart"
						@series-toggle="logEvent('series-toggle', $event)"
				/>
			</div>
		</Variant>

		<Variant title="Slots - Tooltip">
			<div
					class="story-shell"
					data-cy="pictorial-slot-tooltip"
			>
				<origam-chart-pictorial
						:series="FIXTURE_SATISFACTION"
						:categories="FIXTURE_SATISFACTION_CATEGORIES"
						:icons-per-unit="5"
						:height="360"
						title="Custom tooltip"
						data-cy="pictorial-slot-tooltip-chart"
				>
					<template #tooltip="{ point, category }">
						<div class="custom-tooltip">
							<strong>{{ category }}</strong>
							<span>{{ point?.y }}%</span>
						</div>
					</template>
				</origam-chart-pictorial>
			</div>
		</Variant>

		<Variant title="Slots - Empty">
			<div
					class="story-shell"
					data-cy="pictorial-slot-empty"
			>
				<origam-chart-pictorial
						:series="[]"
						:categories="[]"
						:height="320"
						title="Empty state"
						data-cy="pictorial-slot-empty-chart"
				>
					<template #empty>
						<div class="custom-empty">
							No satisfaction data available for this period.
						</div>
					</template>
				</origam-chart-pictorial>
			</div>
		</Variant>

		<Variant title="Slots - Legend-Item">
			<div
					class="story-shell"
					data-cy="pictorial-slot-legend-item"
			>
				<origam-chart-pictorial
						:series="FIXTURE_RATINGS"
						:categories="FIXTURE_RATINGS_CATEGORIES"
						:icons-per-unit="10"
						:height="360"
						title="Custom legend item"
						data-cy="pictorial-slot-legend-item-chart"
				>
					<template #legend-item="{ series, index, visible }">
						<span :style="{ opacity: visible ? 1 : 0.4, fontWeight: 'bold' }">
							{{ index + 1 }}. {{ series.name }}
						</span>
					</template>
				</origam-chart-pictorial>
			</div>
		</Variant>

		<Variant title="Slots - Title">
			<div
					class="story-shell"
					data-cy="pictorial-slot-title"
			>
				<origam-chart-pictorial
						:series="FIXTURE_BEER"
						:categories="FIXTURE_BEER_CATEGORIES"
						:height="360"
						mode="fill"
						:icon="PICTORIAL_ICON_BEER_MUG"
						data-cy="pictorial-slot-title-chart"
				>
					<template #title>
						<div class="custom-title">
							<strong>Beer consumption</strong>
							<em>per capita (litres)</em>
						</div>
					</template>
				</origam-chart-pictorial>
			</div>
		</Variant>

		<Variant
				title="Default"
				:init-state="() => useStoryInitState<Partial<IChartPictorialProps>>({
					height: '400',
					animated: true,
					showLegend: true,
					showTooltip: true,
					showLabel: true,
					showAxis: true,
					legendPosition: 'bottom',
					direction: CHART_PICTORIAL_DIRECTION.VERTICAL,
					iconsPerUnit: 10,
					mode: CHART_PICTORIAL_MODE.FILL,
					title: 'Beer consumption per capita (litres)',
					subtitle: 'Top 8 countries'
				})"
		>
			<template #default="{ state }">
				<div
						class="story-shell"
						data-cy="pictorial-playground"
				>
					<origam-chart-pictorial
							:series="FIXTURE_BEER"
							:categories="FIXTURE_BEER_CATEGORIES"
							:height="state.height"
							:animated="state.animated"
							:show-legend="state.showLegend"
							:show-tooltip="state.showTooltip"
							:show-label="state.showLabel"
							:show-axis="state.showAxis"
							:legend-position="state.legendPosition"
							:direction="state.direction"
							:icons-per-unit="state.iconsPerUnit"
							:mode="state.mode"
							:icon="PICTORIAL_ICON_BEER_MUG"
							:title="state.title"
							:subtitle="state.subtitle || undefined"
							data-cy="pictorial-playground-chart"
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
					<HstSelect v-model="state.mode"           title="Mode"            :options="MODE_OPTIONS"/>
					<HstSelect v-model="state.direction"      title="Direction"       :options="DIRECTION_OPTIONS"/>
					<HstSelect v-model="state.legendPosition" title="Legend Position" :options="LEGEND_POSITION_OPTIONS"/>
					<HstText   v-model="state.height"         title="Height"/>
					<HstNumber v-model="state.iconsPerUnit"   title="Icons Per Unit"  :min="1" :max="100" :step="1"/>
				</StoryGroup>
				<StoryGroup title="Functional">
					<HstCheckbox v-model="state.animated"    title="Animated"/>
					<HstCheckbox v-model="state.showLegend"  title="Show Legend"/>
					<HstCheckbox v-model="state.showTooltip" title="Show Tooltip"/>
					<HstCheckbox v-model="state.showLabel"   title="Show Label"/>
					<HstCheckbox v-model="state.showAxis"    title="Show Axis"/>
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

	import { OrigamChartPictorial } from '@origam/components'
	import {
		PICTORIAL_ICON_BEER_MUG,
		PICTORIAL_ICON_DOLLAR,
		PICTORIAL_ICON_HEART,
		PICTORIAL_ICON_HOUSE,
		PICTORIAL_ICON_PERSON,
		PICTORIAL_ICON_STAR
	} from '@origam/consts'
	import { CHART_PICTORIAL_DIRECTION, CHART_PICTORIAL_MODE } from '@origam/enums'
	import type { IChartPictorialProps, IChartSeries } from '@origam/interfaces'

	import StoryGroup from '@stories/components/_shared/StoryGroup.vue'
	import { useStoryInitState } from '@stories/composables'
	import { INTENT_OPTIONS } from '@stories/const'

	const MODE_OPTIONS = [
		{ value: CHART_PICTORIAL_MODE.STACK, label: 'stack' },
		{ value: CHART_PICTORIAL_MODE.FILL,  label: 'fill' }
	]

	const DIRECTION_OPTIONS = [
		{ value: CHART_PICTORIAL_DIRECTION.VERTICAL,   label: 'vertical' },
		{ value: CHART_PICTORIAL_DIRECTION.HORIZONTAL, label: 'horizontal' }
	]

	const LEGEND_POSITION_OPTIONS = [
		{ value: 'top',    label: 'top' },
		{ value: 'bottom', label: 'bottom' },
		{ value: 'left',   label: 'left' },
		{ value: 'right',  label: 'right' }
	]

	const PICTORIAL_ICON_OPTIONS = [
		{ value: undefined,               label: '(default — person)' },
		{ value: PICTORIAL_ICON_PERSON,   label: 'person' },
		{ value: PICTORIAL_ICON_BEER_MUG, label: 'beer mug' },
		{ value: PICTORIAL_ICON_HEART,    label: 'heart' },
		{ value: PICTORIAL_ICON_STAR,     label: 'star' },
		{ value: PICTORIAL_ICON_DOLLAR,   label: 'dollar' },
		{ value: PICTORIAL_ICON_HOUSE,    label: 'house' }
	]

	const FIXTURE_BEER_CATEGORIES = [
		'Czech Republic',
		'Austria',
		'Germany',
		'Poland',
		'Ireland',
		'Romania',
		'Spain',
		'Belgium'
	]

	const FIXTURE_BEER: Array<IChartSeries> = [
		{ name: 'Litres per capita', data: [188, 107, 99, 98, 91, 88, 79, 71] }
	]

	const FIXTURE_SATISFACTION_CATEGORIES = ['Promoters', 'Passives', 'Detractors']

	const FIXTURE_SATISFACTION: Array<IChartSeries> = [
		{ name: 'Satisfaction', data: [65, 25, 10] }
	]

	const FIXTURE_RATINGS_CATEGORIES = ['★', '★★', '★★★', '★★★★', '★★★★★']

	const FIXTURE_RATINGS: Array<IChartSeries> = [
		{ name: 'Ratings', data: [4, 12, 28, 55, 78] }
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
		src="@docs/components/Chart/OrigamChartPictorial.md"
/>
