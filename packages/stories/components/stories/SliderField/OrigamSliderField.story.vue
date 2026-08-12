<template>
	<Story
			group="components"
			title="SliderField/OrigamSliderField"
	>

		<Variant
				title="Design"
				:init-state="() => useStoryInitState<Partial<ISliderFieldProps>>({
					mode: 'field',
					color: 'primary',
					density: undefined,
					rounded: undefined,
					elevation: undefined,
					direction: 'horizontal',
					inset: false,
					showThumbOnHoverOnly: false,
					showHoverTooltip: false,
				})"
		>
			<template #default="{ state }">
				<origam-slider-field
						v-model="designModel"
						:mode="state.mode"
						:padding="state.padding"
						:margin="state.margin"
						:color="state.color"
						:bg-color="state.bgColor"
						:density="state.density"
						:rounded="state.rounded"
						:elevation="state.elevation"
						:border="state.border"
						:border-color="state.borderColor"
						:border-style="state.borderStyle"
						:direction="state.direction"
						:inset="state.inset"
						:show-thumb-on-hover-only="state.showThumbOnHoverOnly"
						:show-hover-tooltip="state.showHoverTooltip"
						:min="0"
						:max="100"
						label="Slider"
				/>
			</template>
			<template #controls="{ state }">
				<StoryGroup title="Mode">
					<HstSelect v-model="state.mode"   title="Mode"   :options="SLIDER_FIELD_MODE_OPTIONS"/>
				</StoryGroup>
				<StoryGroup title="Color">
					<HstSelect v-model="state.color"     title="Color"     :options="COLOR_OPTIONS"/>
					<HstSelect v-model="state.bgColor"   title="Bg Color"  :options="COLOR_OPTIONS"/>
				</StoryGroup>
				<StoryGroup title="Sizing">
					<HstSelect v-model="state.density"   title="Density"   :options="DENSITY_OPTIONS"/>
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
				<StoryGroup title="Direction">
					<HstSelect v-model="state.direction" title="Direction" :options="DIRECTION_OPTIONS"/>
				</StoryGroup>
				<StoryGroup title="Thumb">
					<HstCheckbox v-model="state.inset"                title="Inset"/>
					<HstCheckbox v-model="state.showThumbOnHoverOnly" title="Show Thumb On Hover Only"/>
					<HstCheckbox v-model="state.showHoverTooltip"     title="Show Hover Tooltip"/>
				</StoryGroup>
				<StoryGroup title="Spacing">
					<HstText v-model="state.padding" title="Padding"/>
					<HstText v-model="state.margin"  title="Margin"/>
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
					focused: false,
					range: false,
					reverse: false,
					min: 0,
					max: 100,
					step: 1,
					showTicks: undefined,
					tickSize: undefined,
					buffered: undefined,
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
						:focused="state.focused"
						:range="state.range"
						:reverse="state.reverse"
						:min="state.min"
						:max="state.max"
						:step="state.step"
						:show-ticks="state.showTicks || undefined"
						:tick-size="state.tickSize || undefined"
						:buffered="state.buffered || undefined"
						color="primary"
				/>
				<p>value = {{ functionalModel }}</p>
			</template>
			<template #controls="{ state }">
				<StoryGroup title="Label">
					<HstText v-model="state.label" title="Label"/>
				</StoryGroup>
				<StoryGroup title="States">
					<HstCheckbox v-model="state.disabled" title="Disabled"/>
					<HstCheckbox v-model="state.readonly" title="Readonly"/>
					<HstCheckbox v-model="state.error"    title="Error"/>
					<HstCheckbox v-model="state.required" title="Required"/>
					<HstCheckbox v-model="state.focused"  title="Focused"/>
				</StoryGroup>
				<StoryGroup title="Range & Direction">
					<HstCheckbox v-model="state.range"   title="Range"/>
					<HstCheckbox v-model="state.reverse" title="Reverse"/>
				</StoryGroup>
				<StoryGroup title="Values">
					<HstNumber v-model="state.min"  title="Min"  :min="-100" :max="0"   :step="1"/>
					<HstNumber v-model="state.max"  title="Max"  :min="1"    :max="200" :step="1"/>
					<HstNumber v-model="state.step" title="Step" :min="0"    :max="50"  :step="1"/>
				</StoryGroup>
				<StoryGroup title="Ticks">
					<HstSelect v-model="state.showTicks" title="Show Ticks" :options="SHOW_TICKS_OPTIONS"/>
					<HstSelect v-model="state.tickSize"  title="Tick Size"  :options="SIZE_OPTIONS"/>
				</StoryGroup>
				<StoryGroup title="Buffered">
					<HstNumber v-model="state.buffered" title="Buffered" :min="0" :max="100" :step="1"/>
				</StoryGroup>
			</template>
		</Variant>

		<Variant title="Events - update:modelValue">
			<origam-slider-field
					v-model="emitModelValue"
					color="primary"
					label="Move the slider"
					:min="0"
					:max="100"
					@update:model-value="logEvent('update:modelValue', $event)"
			/>
			<p>value = {{ emitModelValue }}</p>
		</Variant>

		<Variant title="Events - start">
			<origam-slider-field
					v-model="emitStartModel"
					color="primary"
					label="Drag to fire start"
					:min="0"
					:max="100"
					@start="logEvent('start', $event)"
			/>
		</Variant>

		<Variant title="Events - end">
			<origam-slider-field
					v-model="emitEndModel"
					color="primary"
					label="Release to fire end"
					:min="0"
					:max="100"
					@end="logEvent('end', $event)"
			/>
		</Variant>

		<Variant title="Events - update:focused">
			<origam-slider-field
					v-model="emitFocusedModel"
					color="primary"
					label="Focus / blur to fire"
					:min="0"
					:max="100"
					@update:focused="logEvent('update:focused', $event)"
			/>
		</Variant>

		<Variant title="Slots - Default">
			<origam-slider-field
					v-model="slotDefaultModel"
					color="primary"
					:min="0"
					:max="100"
					label="Custom default"
			>
				<template #default="{ id, isDisabled }">
					<p style="font-size: 0.75rem; opacity: 0.6;">Custom default slot — id: {{ id }} / disabled: {{ isDisabled }}</p>
				</template>
			</origam-slider-field>
		</Variant>

		<Variant title="Slots - Label">
			<origam-slider-field
					v-model="slotLabelModel"
					color="primary"
					:min="0"
					:max="100"
			>
				<template #label>
					<strong>Custom label</strong>
				</template>
			</origam-slider-field>
		</Variant>

		<Variant title="Slots - Prepend">
			<origam-slider-field
					v-model="slotPrependModel"
					color="primary"
					:min="0"
					:max="100"
					label="With prepend"
			>
				<template #prepend>
					<origam-icon :icon="volumeIcon"/>
				</template>
			</origam-slider-field>
		</Variant>

		<Variant title="Slots - Append">
			<origam-slider-field
					v-model="slotAppendModel"
					color="primary"
					:min="0"
					:max="100"
					label="With append"
			>
				<template #append>
					<origam-icon :icon="volumeIcon"/>
				</template>
			</origam-slider-field>
		</Variant>

		<Variant title="Slots - Item">
			<origam-slider-field
					v-model="slotItemModel"
					color="primary"
					:min="0"
					:max="100"
					:step="25"
					show-ticks="always"
					label="Custom tick item"
			>
				<template #item="{ tick }">
					<span style="font-size: 0.6rem; color: var(--origam-color-primary);">{{ tick.value }}</span>
				</template>
			</origam-slider-field>
		</Variant>

		<Variant
				title="Default"
				:init-state="() => useStoryInitState<ISliderFieldProps>({
					label: 'Slider',
					color: 'primary',
					mode: 'field',
					min: 0,
					max: 100,
					step: 1,
					range: false,
					reverse: false,
					disabled: false,
					readonly: false,
					error: false,
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
				<p>value = {{ playgroundModel }}</p>
			</template>
			<template #controls="{ state }">
				<StoryGroup title="Content">
					<HstText v-model="state.label" title="Label"/>
				</StoryGroup>
				<StoryGroup title="Design">
					<HstSelect v-model="state.mode"   title="Mode"   :options="SLIDER_FIELD_MODE_OPTIONS"/>
					<HstSelect v-model="state.color"     title="Color"     :options="COLOR_OPTIONS"/>
					<HstSelect v-model="state.bgColor"   title="Bg Color"  :options="COLOR_OPTIONS"/>
					<HstSelect v-model="state.density"   title="Density"   :options="DENSITY_OPTIONS"/>
					<HstSelect v-model="state.rounded"   title="Rounded"   :options="ROUNDED_OPTIONS"/>
					<HstSelect v-model="state.elevation" title="Elevation" :options="ELEVATION_OPTIONS"/>
					<HstSelect v-model="state.direction" title="Direction" :options="DIRECTION_OPTIONS"/>
				</StoryGroup>
				<StoryGroup title="Functional">
					<HstNumber   v-model="state.min"                  title="Min"                   :min="-100" :max="0"   :step="1"/>
					<HstNumber   v-model="state.max"                  title="Max"                   :min="1"    :max="200" :step="1"/>
					<HstNumber   v-model="state.step"                 title="Step"                  :min="0"    :max="50"  :step="1"/>
					<HstCheckbox v-model="state.range"                title="Range"/>
					<HstCheckbox v-model="state.reverse"              title="Reverse"/>
					<HstCheckbox v-model="state.disabled"             title="Disabled"/>
					<HstCheckbox v-model="state.readonly"             title="Readonly"/>
					<HstCheckbox v-model="state.error"                title="Error"/>
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
		SIZE_OPTIONS
	} from '@stories/const'

	const designModel       = ref(50)
	const functionalModel   = ref(40)
	const emitModelValue    = ref(50)
	const emitStartModel    = ref(50)
	const emitEndModel      = ref(50)
	const emitFocusedModel  = ref(50)
	const slotDefaultModel  = ref(50)
	const slotLabelModel    = ref(50)
	const slotPrependModel  = ref(50)
	const slotAppendModel   = ref(50)
	const slotItemModel     = ref(50)
	const playgroundModel   = ref(50)

	const volumeIcon = MDI_ICONS.VOLUME_HIGH

	const SLIDER_FIELD_MODE_OPTIONS: Array<IOptions<TSliderFieldMode>> = [
		{ label: 'Field (default)', value: SLIDER_FIELD_MODE.FIELD },
		{ label: 'Timer',           value: SLIDER_FIELD_MODE.TIMER },
		{ label: 'Audio',           value: SLIDER_FIELD_MODE.AUDIO },
	]

	const DIRECTION_OPTIONS: Array<IOptions<string>> = [
		{ label: 'Horizontal', value: DIRECTION.HORIZONTAL },
		{ label: 'Vertical',   value: DIRECTION.VERTICAL   },
	]

	const SHOW_TICKS_OPTIONS: Array<IOptions<TAlways | undefined>> = [
		{ label: '(none)',  value: undefined  },
		{ label: 'Always',  value: 'always'   },
		{ label: 'true',    value: true        },
	]
</script>

<docs lang="md" src="@docs/components/SliderField/OrigamSliderField.md"/>
