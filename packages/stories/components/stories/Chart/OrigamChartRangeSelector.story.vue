<template>
	<Story
			group="components"
			title="Chart/OrigamChartRangeSelector"
	>

		<Variant
				title="Design"
				:init-state="() => useStoryInitState<IChartRangeSelectorProps>({ buttons: BUTTONS_STANDARD, activeIndex: 2, dataLength: 365 })"
		>
			<template #default="{ state }">
				<div class="story-shell">
					<origam-chart-range-selector
							:buttons="state.buttons"
							:active-index="state.activeIndex"
							:data-length="state.dataLength"
					/>
				</div>
			</template>
			<template #controls="{ state }">
				<StoryGroup title="Data">
					<HstSelect
							v-model="state.buttons"
							title="Buttons"
							:options="BUTTONS_OPTIONS"
					/>
					<HstNumber
							v-model="state.dataLength"
							title="Data length"
					/>
				</StoryGroup>
			</template>
		</Variant>

		<Variant
				title="Functional"
				:init-state="() => useStoryInitState<IChartRangeSelectorProps>({ buttons: BUTTONS_STANDARD, activeIndex: -1, dataLength: 365 })"
		>
			<template #default="{ state }">
				<div class="story-shell">
					<origam-chart-range-selector
							:buttons="state.buttons"
							:active-index="state.activeIndex"
							:data-length="state.dataLength"
							@select="(index, start, end) => { state.activeIndex = index; logEvent('select', { index, start, end }) }"
					/>
					<p class="story-readout">
						active index: <strong>{{ state.activeIndex }}</strong>
					</p>
				</div>
			</template>
			<template #controls="{ state }">
				<StoryGroup title="States">
					<HstNumber
							v-model="state.activeIndex"
							title="Active index"
					/>
				</StoryGroup>
			</template>
		</Variant>

		<Variant title="Events - select">
			<origam-chart-range-selector
					:buttons="BUTTONS_STANDARD"
					:active-index="0"
					:data-length="365"
					@select="(index, start, end) => logEvent('select', { index, start, end })"
			/>
		</Variant>

		<Variant
				title="Default"
				:init-state="() => useStoryInitState<IChartRangeSelectorProps>({ buttons: BUTTONS_STANDARD, activeIndex: 2, dataLength: 365 })"
		>
			<template #default="{ state }">
				<div class="story-shell">
					<origam-chart-range-selector
							v-bind="state"
							@select="(index, start, end) => { state.activeIndex = index; logEvent('select', { index, start, end }) }"
					/>
				</div>
			</template>
			<template #controls="{ state }">
				<StoryGroup title="Content">
					<HstSelect
							v-model="state.buttons"
							title="Buttons"
							:options="BUTTONS_OPTIONS"
					/>
				</StoryGroup>
				<StoryGroup title="Functional">
					<HstNumber
							v-model="state.activeIndex"
							title="Active index"
					/>
					<HstNumber
							v-model="state.dataLength"
							title="Data length"
					/>
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

	import { OrigamChartRangeSelector } from '@origam/components'
	import type { IChartRangeSelectorButton, IChartRangeSelectorProps } from '@origam/interfaces'

	import StoryGroup from '@stories/components/_shared/StoryGroup.vue'
	import { useStoryInitState } from '@stories/composables'

	const BUTTONS_STANDARD: Array<IChartRangeSelectorButton> = [
		{ label: '1w', count: 7 },
		{ label: '1m', count: 30 },
		{ label: '3m', count: 90 },
		{ label: '6m', count: 180 },
		{ label: '1y', count: 365 },
		{ label: 'all', fraction: 1 }
	]

	const BUTTONS_MINIMAL: Array<IChartRangeSelectorButton> = [
		{ label: '1m', count: 30 },
		{ label: 'all', fraction: 1 }
	]

	const BUTTONS_OPTIONS = [
		{ label: 'standard (1w/1m/3m/6m/1y/all)', value: BUTTONS_STANDARD },
		{ label: 'minimal (1m/all)', value: BUTTONS_MINIMAL }
	]
</script>

<style scoped>
	.story-shell {
		display: flex;
		flex-direction: column;
		gap: 12px;
		padding: 16px;
	}

	.story-readout {
		margin: 0;
		font-size: 0.8125rem;
	}
</style>

<docs
		lang="md"
		src="@docs/components/Chart/OrigamChartRangeSelector.md"
/>
