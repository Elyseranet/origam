<template>
	<Story
			group="components"
			title="SliderField/OrigamSliderField"
	>

		<Variant
				title="Design"
				:init-state="() => useStoryInitState<Partial<ISliderFieldProps>>({
					label: 'Slider',
					color: 'primary',
					density: undefined,
					rounded: undefined,
					elevation: undefined,
					border: undefined,
					mode: 'field',
					direction: 'horizontal',
					min: 0,
					max: 100,
					step: 1,
					showTicks: undefined,
					tickSize: undefined,
					inset: false,
					buffered: undefined,
					showThumbOnHoverOnly: false,
					showHoverTooltip: false,
				})"
		>
			<template #default="{ state }">
				<origam-slider-field
						v-model="designModel"
						:label="state.label"
						:color="state.color"
						:bg-color="state.bgColor"
						:density="state.density"
						:rounded="state.rounded"
						:elevation="state.elevation"
						:border="state.border"
						:border-color="state.borderColor"
						:border-style="state.borderStyle"
						:mode="state.mode"
						:direction="state.direction"
						:min="state.min"
						:max="state.max"
						:step="state.step"
						:show-ticks="state.showTicks"
						:tick-size="state.tickSize"
						:inset="state.inset"
						:buffered="state.buffered"
						:show-thumb-on-hover-only="state.showThumbOnHoverOnly"
						:show-hover-tooltip="state.showHoverTooltip"
				/>
			</template>
			<template #controls="{ state }">
				<StoryGroup title="Mode">
					<HstSelect v-model="state.mode" title="Mode" :options="SLIDER_FIELD_MODE_OPTIONS"/>
				</StoryGroup>
				<StoryGroup title="Color">
					<HstSelect v-model="state.color"   title="Color"   :options="COLOR_OPTIONS"/>
					<HstSelect v-model="state.bgColor" title="Bg Color" :options="COLOR_OPTIONS"/>
				</StoryGroup>
				<StoryGroup title="Sizing">
					<HstSelect v-model="state.density" title="Density" :options="DENSITY_OPTIONS"/>
				</StoryGroup>
				<StoryGroup title="Shape">
					<HstSelect v-model="state.rounded"   title="Rounded"   :options="ROUNDED_OPTIONS"/>
					<HstSelect v-model="state.elevation" title="Elevation" :options="ELEVATION_OPTIONS"/>
					<HstCheckbox v-model="state.inset"   title="Inset"/>
				</StoryGroup>
				<StoryGroup title="Border">
					<HstSelect v-model="state.border"      title="Border"       :options="BORDER_OPTIONS"/>
					<HstText   v-model="state.borderColor" title="Border Color"/>
					<HstSelect v-model="state.borderStyle" title="Border Style" :options="BORDER_STYLE_OPTIONS"/>
				</StoryGroup>
				<StoryGroup title="Layout">
					<HstSelect v-model="state.direction" title="Direction" :options="DIRECTION_OPTIONS"/>
				</StoryGroup>
				<StoryGroup title="Range & Steps">
					<HstNumber v-model="state.min"  title="Min"  :min="-100" :max="0"/>
					<HstNumber v-model="state.max"  title="Max"  :min="1"    :max="200"/>
					<HstNumber v-model="state.step" title="Step" :min="1"    :max="50"/>
				</StoryGroup>
				<StoryGroup title="Ticks">
					<HstSelect v-model="state.showTicks" title="Show Ticks" :options="SHOW_TICKS_OPTIONS"/>
					<HstNumber v-model="state.tickSize"  title="Tick Size"  :min="1" :max="20"/>
				</StoryGroup>
				<StoryGroup title="Buffered">
					<HstNumber   v-model="state.buffered"           title="Buffered"              :min="0" :max="100"/>
					<HstCheckbox v-model="state.showThumbOnHoverOnly" title="Show Thumb On Hover Only"/>
					<HstCheckbox v-model="state.showHoverTooltip"    title="Show Hover Tooltip"/>
				</StoryGroup>
			</template>
		</Variant>

		<Variant
				title="Functional"
				:init-state="() => useStoryInitState<Partial<ISliderFieldProps>>({
					label: 'Slider',
					disabled: false,
					readonly: false,
					error: false,
					required: false,
					range: false,
					reverse: false,
					min: 0,
					max: 100,
				})"
		>
			<template #default="{ state }">
				<origam-slider-field
						v-model="functionalModel"
						:label="state.label"
						:disabled="state.disabled"
						:readonly="state.readonly"
						:error="state.error"
						:required="state.required"
						:range="state.range"
						:reverse="state.reverse"
						:min="state.min"
						:max="state.max"
				/>
				<div>value = {{ functionalModel }}</div>
			</template>
			<template #controls="{ state }">
				<StoryGroup title="States">
					<HstCheckbox v-model="state.disabled" title="Disabled"/>
					<HstCheckbox v-model="state.readonly" title="Readonly"/>
					<HstCheckbox v-model="state.error"    title="Error"/>
					<HstCheckbox v-model="state.required" title="Required"/>
				</StoryGroup>
				<StoryGroup title="Data">
					<HstText   v-model="state.label"   title="Label"/>
					<HstNumber v-model="state.min"     title="Min"  :min="-100" :max="0"/>
					<HstNumber v-model="state.max"     title="Max"  :min="1"    :max="200"/>
				</StoryGroup>
				<StoryGroup title="Layout">
					<HstCheckbox v-model="state.range"   title="Range"/>
					<HstCheckbox v-model="state.reverse" title="Reverse"/>
				</StoryGroup>
			</template>
		</Variant>

		<Variant title="Events - end">
			<origam-slider-field
					v-model="emitEndModel"
					:min="0"
					:max="100"
					label="Drag to end"
					data-cy="slider-emit-end"
					@end="logEvent('end', $event)"
			/>
		</Variant>

		<Variant title="Events - start">
			<origam-slider-field
					v-model="emitStartModel"
					:min="0"
					:max="100"
					label="Drag to start"
					data-cy="slider-emit-start"
					@start="logEvent('start', $event)"
			/>
		</Variant>

		<Variant title="Events - update:focused">
			<origam-slider-field
					v-model="emitFocusedModel"
					:min="0"
					:max="100"
					label="Focus me"
					data-cy="slider-emit-focused"
					@update:focused="logEvent('update:focused', $event)"
			/>
		</Variant>

		<Variant title="Events - update:modelValue">
			<origam-slider-field
					v-model="emitUpdateModel"
					:min="0"
					:max="100"
					label="Move me"
					data-cy="slider-emit-update"
					@update:model-value="logEvent('update:modelValue', $event)"
			/>
			<div data-cy="slider-emit-status">value = {{ emitUpdateModel }}</div>
		</Variant>

		<Variant title="Slots - Default">
			<origam-slider-field v-model="slotModel" :min="0" :max="100" label="Volume">
				<span>Custom slot content</span>
			</origam-slider-field>
		</Variant>

		<Variant title="Slots - Prepend">
			<origam-slider-field v-model="slotModel" :min="0" :max="100" label="Volume">
				<template #prepend>
					<origam-icon :icon="prependIcon"/>
				</template>
			</origam-slider-field>
		</Variant>

		<Variant title="Slots - Append">
			<origam-slider-field v-model="slotModel" :min="0" :max="100" label="Volume">
				<template #append>
					<origam-icon :icon="appendIcon"/>
				</template>
			</origam-slider-field>
		</Variant>

		<Variant title="Slots - Label">
			<origam-slider-field v-model="slotModel" :min="0" :max="100" label="Volume">
				<template #label>
					<strong>Custom label</strong>
				</template>
			</origam-slider-field>
		</Variant>

		<Variant title="Slots - Details">
			<origam-slider-field v-model="slotModel" :min="0" :max="100" label="Volume">
				<template #details>
					<span>Custom details area</span>
				</template>
			</origam-slider-field>
		</Variant>

		<Variant title="Slots - Messages">
			<origam-slider-field
					v-model="slotModel"
					:min="0"
					:max="100"
					label="Volume"
					:error-messages="['Error one', 'Error two']"
			>
				<template #messages>
					<span>Custom messages area</span>
				</template>
			</origam-slider-field>
		</Variant>

		<Variant title="Slots - Message">
			<origam-slider-field
					v-model="slotModel"
					:min="0"
					:max="100"
					label="Volume"
					:error-messages="['Error message']"
			>
				<template #message="{ message }">
					<span>{{ message }}</span>
				</template>
			</origam-slider-field>
		</Variant>

		<Variant
				title="Default"
				:init-state="() => useStoryInitState<ISliderFieldProps>({
					label: 'Slider',
					color: 'primary',
					min: 0,
					max: 100,
					step: 1,
					range: false,
					reverse: false,
					disabled: false,
					readonly: false,
					error: false,
					mode: 'field',
					showThumbOnHoverOnly: false,
					showHoverTooltip: false,
				})"
		>
			<template #default="{ state }">
				<origam-slider-field
						v-model="playgroundModel"
						v-bind="state"
						@start="logEvent('start', $event)"
						@end="logEvent('end', $event)"
						@update:focused="logEvent('update:focused', $event)"
				/>
				<div>value = {{ playgroundModel }}</div>
			</template>
			<template #controls="{ state }">
				<StoryGroup title="Content">
					<HstText v-model="state.label" title="Label"/>
				</StoryGroup>
				<StoryGroup title="Design">
					<HstSelect   v-model="state.mode"   title="Mode"   :options="SLIDER_FIELD_MODE_OPTIONS"/>
					<HstSelect   v-model="state.color"     title="Color"     :options="COLOR_OPTIONS"/>
					<HstSelect   v-model="state.bgColor"   title="Bg Color"  :options="COLOR_OPTIONS"/>
					<HstSelect   v-model="state.density"   title="Density"   :options="DENSITY_OPTIONS"/>
					<HstSelect   v-model="state.rounded"   title="Rounded"   :options="ROUNDED_OPTIONS"/>
					<HstSelect   v-model="state.elevation" title="Elevation" :options="ELEVATION_OPTIONS"/>
					<HstSelect   v-model="state.direction" title="Direction" :options="DIRECTION_OPTIONS"/>
					<HstNumber   v-model="state.min"       title="Min"       :min="-100" :max="0"/>
					<HstNumber   v-model="state.max"       title="Max"       :min="1"    :max="200"/>
					<HstNumber   v-model="state.step"      title="Step"      :min="1"    :max="50"/>
				</StoryGroup>
				<StoryGroup title="Functional">
					<HstCheckbox v-model="state.range"               title="Range"/>
					<HstCheckbox v-model="state.reverse"             title="Reverse"/>
					<HstCheckbox v-model="state.disabled"            title="Disabled"/>
					<HstCheckbox v-model="state.readonly"            title="Readonly"/>
					<HstCheckbox v-model="state.error"               title="Error"/>
					<HstCheckbox v-model="state.showThumbOnHoverOnly" title="Show Thumb On Hover Only"/>
					<HstCheckbox v-model="state.showHoverTooltip"    title="Show Hover Tooltip"/>
				</StoryGroup>
			</template>
		</Variant>
	</Story>
</template>

<script
		lang="ts"
		setup
>
	import { ref } from 'vue'

	import { logEvent } from 'histoire/client'

	import { OrigamIcon, OrigamSliderField } from '@origam/components'
	import { DIRECTION, MDI_ICONS, SLIDER_FIELD_MODE } from '@origam/enums'
	import type { IOptions, ISliderFieldProps } from '@origam/interfaces'
	import type { TAlways, TSliderFieldMode } from '@origam/types'

	import StoryGroup from '@stories/components/_shared/StoryGroup.vue'
	import { useStoryInitState } from '@stories/composables'
	import {
		BORDER_OPTIONS,
		BORDER_STYLE_OPTIONS,
		COLOR_OPTIONS,
		DENSITY_OPTIONS,
		ELEVATION_OPTIONS,
		ROUNDED_OPTIONS,
	} from '@stories/const'

	const prependIcon = MDI_ICONS.HEART
	const appendIcon  = MDI_ICONS.ARROW_RIGHT

	const designModel     = ref(50)
	const functionalModel = ref(50)
	const emitEndModel    = ref(50)
	const emitStartModel  = ref(50)
	const emitFocusedModel = ref(50)
	const emitUpdateModel  = ref(50)
	const slotModel       = ref(50)
	const playgroundModel = ref(50)

	const SLIDER_FIELD_MODE_OPTIONS: Array<IOptions<TSliderFieldMode>> = [
		{ label: 'field (default)', value: SLIDER_FIELD_MODE.FIELD },
		{ label: 'timer',           value: SLIDER_FIELD_MODE.TIMER },
		{ label: 'audio',           value: SLIDER_FIELD_MODE.AUDIO },
	]

	const DIRECTION_OPTIONS: Array<IOptions<string>> = [
		{ label: 'horizontal', value: DIRECTION.HORIZONTAL },
		{ label: 'vertical',   value: DIRECTION.VERTICAL   },
	]

	const SHOW_TICKS_OPTIONS: Array<IOptions<TAlways | undefined>> = [
		{ label: '(none)',  value: undefined  },
		{ label: 'always',  value: 'always'   },
	]
</script>

<docs
		lang="md"
		src="@docs/components/SliderField/OrigamSliderField.md"
/>
