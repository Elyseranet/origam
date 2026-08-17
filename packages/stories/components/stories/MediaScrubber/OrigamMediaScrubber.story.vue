<template>
	<Story
			group="components"
			title="MediaScrubber/OrigamMediaScrubber"
	>

		<Variant
				title="Design"
				:init-state="() => useStoryInitState<Partial<IMediaScrubberProps>>({
					modelValue: 30,
					min: 0,
					max: 100,
					color: 'primary',
					rounded: undefined,
					showThumbOnHoverOnly: false,
					showHoverTooltip: true
				})"
		>
			<template #default="{ state }">
				<div class="story-scrubber-shell">
					<div class="story-scrubber-shell__horizontal">
						<origam-media-scrubber
								v-model="state.modelValue"
								:min="state.min"
								:max="state.max"
								:color="state.color"
								:rounded="state.rounded"
								:show-thumb-on-hover-only="state.showThumbOnHoverOnly"
								:show-hover-tooltip="state.showHoverTooltip"
								:format-hover-tooltip="formatPercent"
								aria-label="Timeline (horizontal)"
								data-cy="media-scrubber-design-horizontal"
						/>
					</div>
					<div class="story-scrubber-shell__vertical">
						<origam-media-scrubber
								v-model="state.modelValue"
								:min="state.min"
								:max="state.max"
								orientation="vertical"
								:color="state.color"
								:rounded="state.rounded"
								:show-thumb-on-hover-only="state.showThumbOnHoverOnly"
								aria-label="Level (vertical)"
								data-cy="media-scrubber-design-vertical"
						/>
					</div>
				</div>
			</template>
			<template #controls="{ state }">
				<StoryGroup title="Color">
					<HstSelect v-model="state.color" title="Color" :options="COLOR_OPTIONS"/>
				</StoryGroup>
				<StoryGroup title="Shape">
					<HstSelect v-model="state.rounded" title="Rounded" :options="ROUNDED_OPTIONS"/>
				</StoryGroup>
				<StoryGroup title="Thumb & Tooltip">
					<HstCheckbox v-model="state.showThumbOnHoverOnly" title="Show Thumb On Hover Only"/>
					<HstCheckbox v-model="state.showHoverTooltip"     title="Show Hover Tooltip"/>
				</StoryGroup>
				<StoryGroup title="Range">
					<HstNumber v-model="state.modelValue" title="Model Value" :step="1"/>
					<HstNumber v-model="state.min"        title="Min"         :step="1"/>
					<HstNumber v-model="state.max"        title="Max"         :step="1"/>
				</StoryGroup>
			</template>
		</Variant>

		<Variant
				title="Functional"
				:init-state="() => useStoryInitState<Partial<IMediaScrubberProps>>({
					modelValue: 50,
					min: 0,
					max: 200,
					step: 1,
					buffered: 140,
					disabled: false
				})"
		>
			<template #default="{ state }">
				<div class="story-scrubber-shell">
					<div class="story-scrubber-shell__horizontal">
						<origam-media-scrubber
								v-model="state.modelValue"
								:min="state.min"
								:max="state.max"
								:step="state.step"
								:buffered="state.buffered"
								:disabled="state.disabled"
								color="primary"
								aria-label="Playback position"
								data-cy="media-scrubber-functional-host"
						/>
					</div>
				</div>
			</template>
			<template #controls="{ state }">
				<StoryGroup title="Range">
					<HstNumber v-model="state.min"  title="Min"  :step="1"/>
					<HstNumber v-model="state.max"  title="Max"  :step="1"/>
					<HstNumber v-model="state.step" title="Step" :min="0" :step="1"/>
				</StoryGroup>
				<StoryGroup title="Value">
					<HstNumber v-model="state.modelValue" title="Model Value" :step="1"/>
					<HstNumber v-model="state.buffered"   title="Buffered"    :step="1"/>
				</StoryGroup>
				<StoryGroup title="States">
					<HstCheckbox v-model="state.disabled" title="Disabled"/>
				</StoryGroup>
			</template>
		</Variant>

		<Variant title="Events - update:modelValue">
			<div class="story-scrubber-shell">
				<div class="story-scrubber-shell__horizontal">
					<origam-media-scrubber
							:model-value="50"
							:min="0"
							:max="100"
							color="primary"
							aria-label="Emits update:modelValue"
							data-cy="media-scrubber-events-update"
							@update:model-value="logEvent('update:modelValue', $event)"
					/>
				</div>
			</div>
		</Variant>

		<Variant title="Events - change">
			<div class="story-scrubber-shell">
				<div class="story-scrubber-shell__horizontal">
					<origam-media-scrubber
							:model-value="50"
							:min="0"
							:max="100"
							color="primary"
							aria-label="Emits change"
							data-cy="media-scrubber-events-change"
							@change="logEvent('change', $event)"
					/>
				</div>
			</div>
		</Variant>

		<Variant title="Events - dragstart">
			<div class="story-scrubber-shell">
				<div class="story-scrubber-shell__horizontal">
					<origam-media-scrubber
							:model-value="50"
							:min="0"
							:max="100"
							color="primary"
							aria-label="Emits dragstart"
							data-cy="media-scrubber-events-dragstart"
							@dragstart="logEvent('dragstart')"
					/>
				</div>
			</div>
		</Variant>

		<Variant title="Events - dragend">
			<div class="story-scrubber-shell">
				<div class="story-scrubber-shell__horizontal">
					<origam-media-scrubber
							:model-value="50"
							:min="0"
							:max="100"
							color="primary"
							aria-label="Emits dragend"
							data-cy="media-scrubber-events-dragend"
							@dragend="logEvent('dragend')"
					/>
				</div>
			</div>
		</Variant>

		<Variant title="Events - hover">
			<div class="story-scrubber-shell">
				<div class="story-scrubber-shell__horizontal">
					<origam-media-scrubber
							:model-value="50"
							:min="0"
							:max="100"
							color="primary"
							aria-label="Emits hover"
							data-cy="media-scrubber-events-hover"
							@hover="logEvent('hover', $event)"
					/>
				</div>
			</div>
		</Variant>

		<Variant title="Slots - Tooltip">
			<div class="story-scrubber-shell">
				<div class="story-scrubber-shell__horizontal">
					<origam-media-scrubber
							:model-value="50"
							:min="0"
							:max="100"
							color="primary"
							show-hover-tooltip
							aria-label="Custom tooltip slot"
							data-cy="media-scrubber-slot-tooltip"
					>
						<template #tooltip="{ value }">
							<strong class="story-scrubber-tooltip">{{ formatTimecode(value) }}</strong>
						</template>
					</origam-media-scrubber>
				</div>
			</div>
		</Variant>

		<Variant
				title="Default"
				:init-state="() => useStoryInitState<IMediaScrubberProps>({
					modelValue: 30,
					min: 0,
					max: 100,
					step: 0,
					orientation: 'horizontal',
					color: 'primary',
					rounded: undefined,
					buffered: undefined,
					disabled: false,
					showThumbOnHoverOnly: false,
					showHoverTooltip: false,
					ariaLabel: 'Playground scrubber',
					ariaValueText: undefined,
					dataCy: 'media-scrubber-default-host'
				})"
		>
			<template #default="{ state }">
				<div class="story-scrubber-shell">
					<div :class="shellClassFor(state.orientation)">
						<origam-media-scrubber
								v-bind="state"
								@update:model-value="syncModelValue(state, $event)"
								@change="logEvent('change', $event)"
						/>
					</div>
				</div>
			</template>
			<template #controls="{ state }">
				<StoryGroup title="Content">
					<HstNumber v-model="state.modelValue" title="Model Value" :step="1"/>
					<HstNumber v-model="state.min"        title="Min"         :step="1"/>
					<HstNumber v-model="state.max"        title="Max"         :step="1"/>
					<HstNumber v-model="state.buffered"   title="Buffered"    :step="1"/>
				</StoryGroup>
				<StoryGroup title="Design">
					<HstSelect   v-model="state.orientation"          title="Orientation" :options="DIRECTION_OPTIONS"/>
					<HstSelect   v-model="state.color"                title="Color"       :options="COLOR_OPTIONS"/>
					<HstSelect   v-model="state.rounded"              title="Rounded"     :options="ROUNDED_OPTIONS"/>
					<HstCheckbox v-model="state.showThumbOnHoverOnly" title="Show Thumb On Hover Only"/>
					<HstCheckbox v-model="state.showHoverTooltip"     title="Show Hover Tooltip"/>
				</StoryGroup>
				<StoryGroup title="Functional">
					<HstNumber   v-model="state.step"          title="Step" :min="0" :step="1"/>
					<HstCheckbox v-model="state.disabled"      title="Disabled"/>
					<HstText     v-model="state.ariaLabel"     title="Aria Label"/>
					<HstText     v-model="state.ariaValueText" title="Aria Value Text"/>
					<HstText     v-model="state.dataCy"        title="Data Cy"/>
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

	import { OrigamMediaScrubber } from '@origam/components'
	import type { IMediaScrubberProps } from '@origam/interfaces'
	import type { TMediaScrubberOrientation } from '@origam/types'

	import StoryGroup from '@stories/components/_shared/StoryGroup.vue'
	import { useStoryInitState } from '@stories/composables'
	import {
		COLOR_OPTIONS,
		DIRECTION_OPTIONS,
		ROUNDED_OPTIONS
	} from '@stories/const'

	/**
	 * Default hover-tooltip formatter driving the Design Variant. Declared as
	 * a function rather than a const so the story keeps zero data declarations,
	 * per the repo's `.vue` conventions.
	 */
	function formatPercent (value: number): string {
		return `${Math.round(value)}%`
	}

	/**
	 * Slot-side formatter — deliberately unlike `formatPercent`, so the
	 * `Slots - Tooltip` Variant renders something the default never would
	 * (a `m:ss` timecode instead of a percentage).
	 */
	function formatTimecode (value: number): string {
		const totalSeconds = Math.round(value)
		const minutes = Math.floor(totalSeconds / 60)
		const seconds = totalSeconds % 60

		return `${minutes}:${String(seconds).padStart(2, '0')}`
	}

	/**
	 * The component sizes itself off its parent (`width: 100%` horizontal,
	 * `height: 100%` vertical), so an unbounded wrapper collapses the vertical
	 * axis to zero and makes it unmeasurable. Resolved in script rather than
	 * with a ternary in the template — no logic in templates.
	 */
	function shellClassFor (orientation: TMediaScrubberOrientation): string {
		return orientation === 'vertical'
			? 'story-scrubber-shell__vertical'
			: 'story-scrubber-shell__horizontal'
	}

	/**
	 * Playground write-back. The playground spreads `v-bind="state"`, so the
	 * value channel has to be closed by hand: without this the scrubber would
	 * emit `update:modelValue` into the void and never move, which is exactly
	 * the "control that looks live but is inert" failure this story is meant
	 * to avoid.
	 */
	function syncModelValue (state: IMediaScrubberProps, value: number): void {
		state.modelValue = value
	}
</script>

<style scoped>
	.story-scrubber-shell {
		display: flex;
		align-items: flex-start;
		gap: 32px;
		padding: 24px;
	}

	.story-scrubber-shell__horizontal {
		width: 320px;
	}

	.story-scrubber-shell__vertical {
		height: 160px;
	}

	.story-scrubber-tooltip {
		font-variant-numeric: tabular-nums;
	}
</style>

<docs
		lang="md"
		src="@docs/components/MediaScrubber/OrigamMediaScrubber.md"
/>
