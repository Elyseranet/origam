<template>
	<Story
			group="components"
			title="SliderField/OrigamSliderFieldTrack"
	>

		<Variant
				title="Design"
				:init-state="() => useStoryInitState<Partial<ISliderFieldTrackProps>>({ start: 25, stop: 75, size: 4 })"
		>
			<template #default="{ state }">
				<div style="padding: 24px;">
					<origam-slider-field-track
							:start="state.start"
							:stop="state.stop"
							:color="state.color"
							:bg-color="state.bgColor"
							:size="state.size"
							:rounded="state.rounded"
					/>
				</div>
			</template>
			<template #controls="{ state }">
				<StoryGroup title="Color">
					<HstSelect v-model="state.color"   title="Color"    :options="COLOR_OPTIONS"/>
					<HstSelect v-model="state.bgColor" title="Bg Color" :options="COLOR_OPTIONS"/>
				</StoryGroup>
				<StoryGroup title="Sizing">
					<HstNumber v-model="state.size" title="Size (px)" :min="1" :max="24" :step="1"/>
				</StoryGroup>
				<StoryGroup title="Shape">
					<HstSelect v-model="state.rounded" title="Rounded" :options="ROUNDED_OPTIONS"/>
				</StoryGroup>
				<StoryGroup title="Track">
					<HstNumber v-model="state.start" title="Start (%)" :min="0" :max="100" :step="1"/>
					<HstNumber v-model="state.stop"  title="Stop (%)"  :min="0" :max="100" :step="1"/>
				</StoryGroup>
			</template>
		</Variant>

		<Variant
				title="Functional"
				:init-state="() => useStoryInitState<Partial<ISliderFieldTrackProps>>({
					start: 25,
					stop: 75,
					disabled: false,
					error: false,
					isVertical: false,
					indexFromEnd: false,
					showTicks: false,
					tickSize: 2,
					min: 0,
					max: 100,
				})"
		>
			<template #default="{ state }">
				<div style="padding: 24px; height: 200px; display: flex; align-items: center;">
					<origam-slider-field-track
							:start="state.start"
							:stop="state.stop"
							:disabled="state.disabled"
							:error="state.error"
							:is-vertical="state.isVertical"
							:index-from-end="state.indexFromEnd"
							:show-ticks="state.showTicks"
							:tick-size="state.tickSize"
							:min="state.min"
							:max="state.max"
							:ticks="state.isVertical ? verticalTicks : horizontalTicks"
					/>
				</div>
			</template>
			<template #controls="{ state }">
				<StoryGroup title="States">
					<HstCheckbox v-model="state.disabled" title="Disabled"/>
					<HstCheckbox v-model="state.error"    title="Error"/>
				</StoryGroup>
				<StoryGroup title="Orientation">
					<HstCheckbox v-model="state.isVertical"   title="Vertical"/>
					<HstCheckbox v-model="state.indexFromEnd" title="Index From End"/>
				</StoryGroup>
				<StoryGroup title="Ticks">
					<HstSelect   v-model="state.showTicks" title="Show Ticks" :options="SHOW_TICKS_OPTIONS"/>
					<HstNumber   v-model="state.tickSize"  title="Tick Size"  :min="1" :max="12" :step="1"/>
				</StoryGroup>
				<StoryGroup title="Bounds">
					<HstNumber v-model="state.min"   title="Min"          :min="0"   :max="100" :step="1"/>
					<HstNumber v-model="state.max"   title="Max"          :min="0"   :max="100" :step="1"/>
					<HstNumber v-model="state.start" title="Start (%)"    :min="0"   :max="100" :step="1"/>
					<HstNumber v-model="state.stop"  title="Stop (%)"     :min="0"   :max="100" :step="1"/>
				</StoryGroup>
			</template>
		</Variant>

		<Variant title="Slots - item">
			<div style="padding: 24px;">
				<origam-slider-field-track
						:start="0"
						:stop="60"
						:show-ticks="true"
						:ticks="horizontalTicks"
						data-cy="slider-track-slot-item"
				>
					<template #item="{ tick }">
						<span
								style="position: absolute; width: 2px; height: 12px; background: currentColor; top: 50%; transform: translate(-50%, -50%);"
								:style="{ left: tick.position + '%' }"
						/>
					</template>
				</origam-slider-field-track>
			</div>
		</Variant>

		<Variant
				title="Default"
				:init-state="() => useStoryInitState<ISliderFieldTrackProps>({
					start: 25,
					stop: 75,
					size: 4,
					disabled: false,
					error: false,
					isVertical: false,
					indexFromEnd: false,
					showTicks: false,
					tickSize: 2,
					min: 0,
					max: 100,
				})"
		>
			<template #default="{ state }">
				<div style="padding: 24px;">
					<origam-slider-field-track
							v-bind="state"
							:ticks="state.showTicks ? horizontalTicks : undefined"
					/>
				</div>
			</template>
			<template #controls="{ state }">
				<StoryGroup title="Track">
					<HstNumber v-model="state.start" title="Start (%)" :min="0" :max="100" :step="1"/>
					<HstNumber v-model="state.stop"  title="Stop (%)"  :min="0" :max="100" :step="1"/>
				</StoryGroup>
				<StoryGroup title="Design">
					<HstSelect v-model="state.color"   title="Color"    :options="COLOR_OPTIONS"/>
					<HstSelect v-model="state.bgColor" title="Bg Color" :options="COLOR_OPTIONS"/>
					<HstNumber v-model="state.size"    title="Size (px)" :min="1" :max="24" :step="1"/>
					<HstSelect v-model="state.rounded" title="Rounded"  :options="ROUNDED_OPTIONS"/>
				</StoryGroup>
				<StoryGroup title="Functional">
					<HstCheckbox v-model="state.disabled"     title="Disabled"/>
					<HstCheckbox v-model="state.error"        title="Error"/>
					<HstCheckbox v-model="state.isVertical"   title="Vertical"/>
					<HstCheckbox v-model="state.indexFromEnd" title="Index From End"/>
					<HstSelect   v-model="state.showTicks"    title="Show Ticks" :options="SHOW_TICKS_OPTIONS"/>
					<HstNumber   v-model="state.tickSize"     title="Tick Size"  :min="1" :max="12" :step="1"/>
				</StoryGroup>
			</template>
		</Variant>
	</Story>
</template>

<script
		lang="ts"
		setup
>
	import { OrigamSliderFieldTrack } from '@origam/components'
	import type { ISliderFieldTrackProps } from '@origam/interfaces'
	import type { TAlways, TTick } from '@origam/types'

	import StoryGroup from '@stories/components/_shared/StoryGroup.vue'
	import { useStoryInitState } from '@stories/composables'
	import {
		COLOR_OPTIONS,
		ROUNDED_OPTIONS
	} from '@stories/const'

	const SHOW_TICKS_OPTIONS: Array<{ label: string; value: TAlways }> = [
		{ label: 'false (hidden)', value: false },
		{ label: 'true (visible on hover)', value: true },
		{ label: 'always', value: 'always' }
	]

	const horizontalTicks: Array<TTick> = [
		{ value: 0,   position: 0 },
		{ value: 25,  position: 25 },
		{ value: 50,  position: 50 },
		{ value: 75,  position: 75 },
		{ value: 100, position: 100 }
	]

	const verticalTicks: Array<TTick> = [
		{ value: 0,   position: 100 },
		{ value: 25,  position: 75 },
		{ value: 50,  position: 50 },
		{ value: 75,  position: 25 },
		{ value: 100, position: 0 }
	]
</script>

<docs lang="md" src="@docs/components/SliderField/OrigamSliderFieldTrack.md"/>
