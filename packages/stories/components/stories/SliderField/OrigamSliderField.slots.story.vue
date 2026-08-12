<template>
	<Story
			group="components"
			title="SliderField/OrigamSliderField"
	>

		<Variant
				title="Design"
				:init-state="() => useStoryInitState<Partial<ISliderFieldProps>>({ label: 'Volume', color: 'primary', min: 0, max: 100 })"
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
						:min="state.min"
						:max="state.max"
				/>
			</template>
			<template #controls="{ state }">
				<StoryGroup title="Color">
					<HstSelect v-model="state.color"       title="Color"    :options="COLOR_OPTIONS"/>
					<HstSelect v-model="state.bgColor"     title="Bg Color" :options="COLOR_OPTIONS"/>
				</StoryGroup>
				<StoryGroup title="Sizing">
					<HstSelect v-model="state.density" title="Density" :options="DENSITY_OPTIONS"/>
				</StoryGroup>
				<StoryGroup title="Shape">
					<HstSelect v-model="state.rounded"   title="Rounded"   :options="ROUNDED_OPTIONS"/>
					<HstSelect v-model="state.elevation" title="Elevation" :options="ELEVATION_OPTIONS"/>
				</StoryGroup>
				<StoryGroup title="Border">
					<HstSelect v-model="state.border"      title="Border"       :options="BORDER_OPTIONS"/>
					<HstText   v-model="state.borderColor" title="Border Color"/>
					<HstSelect v-model="state.borderStyle" title="Border Style" :options="BORDER_STYLE_OPTIONS"/>
				</StoryGroup>
				<StoryGroup title="Range">
					<HstNumber v-model="state.min" title="Min" :min="-100" :max="0"   :step="1"/>
					<HstNumber v-model="state.max" title="Max" :min="1"    :max="200" :step="1"/>
				</StoryGroup>
			</template>
		</Variant>

		<Variant
				title="Functional"
				:init-state="() => useStoryInitState<Partial<ISliderFieldProps>>({
					label: 'Volume',
					min: 0,
					max: 100,
					step: 1,
					mode: 'field',
					disabled: false,
					readonly: false,
					error: false,
					range: false,
					reverse: false,
					inset: false,
					showThumbOnHoverOnly: false,
					showHoverTooltip: false,
				})"
		>
			<template #default="{ state }">
				<origam-slider-field
						v-model="functionalModel"
						:label="state.label"
						:min="state.min"
						:max="state.max"
						:step="state.step"
						:mode="state.mode"
						:disabled="state.disabled"
						:readonly="state.readonly"
						:error="state.error"
						:range="state.range"
						:reverse="state.reverse"
						:inset="state.inset"
						:show-thumb-on-hover-only="state.showThumbOnHoverOnly"
						:show-hover-tooltip="state.showHoverTooltip"
						:direction="state.direction"
						:show-ticks="state.showTicks"
				/>
				<div>value = {{ functionalModel }}</div>
			</template>
			<template #controls="{ state }">
				<StoryGroup title="States">
					<HstCheckbox v-model="state.disabled" title="Disabled"/>
					<HstCheckbox v-model="state.readonly" title="Readonly"/>
					<HstCheckbox v-model="state.error"    title="Error"/>
				</StoryGroup>
				<StoryGroup title="Layout">
					<HstSelect   v-model="state.mode"   title="Mode"   :options="SLIDER_FIELD_MODE_OPTIONS"/>
					<HstSelect   v-model="state.direction" title="Direction" :options="DIRECTION_OPTIONS"/>
					<HstCheckbox v-model="state.range"     title="Range"/>
					<HstCheckbox v-model="state.reverse"   title="Reverse"/>
					<HstCheckbox v-model="state.inset"     title="Inset"/>
				</StoryGroup>
				<StoryGroup title="Data">
					<HstNumber v-model="state.min"  title="Min"  :min="-100" :max="0"   :step="1"/>
					<HstNumber v-model="state.max"  title="Max"  :min="1"    :max="200" :step="1"/>
					<HstNumber v-model="state.step" title="Step" :min="0"    :max="50"  :step="1"/>
					<HstSelect v-model="state.showTicks" title="Show Ticks" :options="SHOW_TICKS_OPTIONS"/>
				</StoryGroup>
				<StoryGroup title="Behaviour">
					<HstCheckbox v-model="state.showThumbOnHoverOnly" title="Show Thumb On Hover Only"/>
					<HstCheckbox v-model="state.showHoverTooltip"     title="Show Hover Tooltip"/>
				</StoryGroup>
			</template>
		</Variant>

		<Variant title="Events - update:modelValue">
			<origam-slider-field
					v-model="emitModelValue"
					:min="0"
					:max="100"
					label="Move me"
					@update:model-value="logEvent('update:modelValue', $event)"
			/>
			<div>value = {{ emitModelValue }}</div>
		</Variant>

		<Variant title="Events - start">
			<origam-slider-field
					v-model="emitStart"
					:min="0"
					:max="100"
					label="Drag to start"
					@start="logEvent('start', $event)"
			/>
		</Variant>

		<Variant title="Events - end">
			<origam-slider-field
					v-model="emitEnd"
					:min="0"
					:max="100"
					label="Drag to end"
					@end="logEvent('end', $event)"
			/>
		</Variant>

		<Variant title="Events - update:focused">
			<origam-slider-field
					v-model="emitFocused"
					:min="0"
					:max="100"
					label="Focus me"
					@update:focused="logEvent('update:focused', $event)"
			/>
		</Variant>

		<Variant title="Slots - Prepend">
			<origam-slider-field v-model="slotModel" :min="0" :max="100" label="Volume">
				<template #prepend>
					<origam-icon :icon="MDI_ICONS.HEART"/>
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

		<Variant title="Slots - Default">
			<origam-slider-field v-model="slotModel" :min="0" :max="100" label="Volume">
				<span>Custom slot content</span>
			</origam-slider-field>
		</Variant>

		<Variant title="Slots - Append">
			<origam-slider-field v-model="slotModel" :min="0" :max="100" label="Volume">
				<template #append>
					<origam-icon :icon="MDI_ICONS.HEART"/>
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
			<origam-slider-field v-model="slotModel" :min="0" :max="100" label="Volume" :error-messages="['Error one', 'Error two']">
				<template #messages>
					<span>Custom messages area</span>
				</template>
			</origam-slider-field>
		</Variant>

		<Variant title="Slots - Message">
			<origam-slider-field v-model="slotModel" :min="0" :max="100" label="Volume" :error-messages="['Error message']">
				<template #message="{ message }">
					<span>{{ message }}</span>
				</template>
			</origam-slider-field>
		</Variant>

		<Variant
				title="Default"
				:init-state="() => useStoryInitState<Partial<ISliderFieldProps>>({
					label: 'Volume',
					color: 'primary',
					min: 0,
					max: 100,
					step: 1,
					mode: 'field',
					density: undefined,
					range: false,
					reverse: false,
					disabled: false,
					readonly: false,
					error: false,
					inset: false,
					showThumbOnHoverOnly: false,
					showHoverTooltip: false,
				})"
		>
			<template #default="{ state }">
				<origam-slider-field
						v-model="playgroundModel"
						v-bind="state"
						@update:model-value="logEvent('update:modelValue', $event)"
						@start="logEvent('start', $event)"
						@end="logEvent('end', $event)"
				/>
				<div>value = {{ playgroundModel }}</div>
			</template>
			<template #controls="{ state }">
				<StoryGroup title="Content">
					<HstText v-model="state.label" title="Label"/>
				</StoryGroup>
				<StoryGroup title="Design">
					<HstSelect v-model="state.color"     title="Color"     :options="COLOR_OPTIONS"/>
					<HstSelect v-model="state.bgColor"   title="Bg Color"  :options="COLOR_OPTIONS"/>
					<HstSelect v-model="state.density"   title="Density"   :options="DENSITY_OPTIONS"/>
					<HstSelect v-model="state.rounded"   title="Rounded"   :options="ROUNDED_OPTIONS"/>
					<HstSelect v-model="state.elevation" title="Elevation" :options="ELEVATION_OPTIONS"/>
					<HstSelect v-model="state.border"    title="Border"    :options="BORDER_OPTIONS"/>
				</StoryGroup>
				<StoryGroup title="Functional">
					<HstSelect   v-model="state.mode"   title="Mode"   :options="SLIDER_FIELD_MODE_OPTIONS"/>
					<HstSelect   v-model="state.direction" title="Direction" :options="DIRECTION_OPTIONS"/>
					<HstNumber   v-model="state.min"       title="Min"       :min="-100" :max="0"   :step="1"/>
					<HstNumber   v-model="state.max"       title="Max"       :min="1"    :max="200" :step="1"/>
					<HstNumber   v-model="state.step"      title="Step"      :min="0"    :max="50"  :step="1"/>
					<HstCheckbox v-model="state.range"     title="Range"/>
					<HstCheckbox v-model="state.reverse"   title="Reverse"/>
					<HstCheckbox v-model="state.inset"     title="Inset"/>
					<HstCheckbox v-model="state.disabled"  title="Disabled"/>
					<HstCheckbox v-model="state.readonly"  title="Readonly"/>
					<HstCheckbox v-model="state.error"     title="Error"/>
					<HstCheckbox v-model="state.showThumbOnHoverOnly" title="Show Thumb On Hover Only"/>
					<HstCheckbox v-model="state.showHoverTooltip"     title="Show Hover Tooltip"/>
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
	import type { ISliderFieldProps } from '@origam/interfaces'
	import type { IOptions } from '@origam/interfaces'
	import type { TSliderFieldMode, TAlways } from '@origam/types'

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

	const designModel     = ref(50)
	const functionalModel = ref(50)
	const playgroundModel = ref(50)
	const slotModel       = ref(50)
	const emitModelValue  = ref(50)
	const emitStart       = ref(50)
	const emitEnd         = ref(50)
	const emitFocused     = ref(50)

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
		{ label: '(none)',  value: undefined },
		{ label: 'always', value: 'always'  },
		{ label: 'true',   value: true      },
	]
</script>

<docs lang="md" src="@docs/components/SliderField/OrigamSliderField.md"/>
