<template>
	<Story
			group="components"
			title="NumberField/OrigamNumberField"
	>

		<Variant
				title="Design"
				:init-state="() => useStoryInitState<Partial<INumberFieldProps>>({
					label: 'Quantity',
					color: 'primary',
					bgColor: undefined,
					variant: undefined,
					size: undefined,
					density: undefined,
					rounded: undefined,
					elevation: undefined,
					flat: false,
					border: undefined,
					borderColor: undefined,
					borderStyle: undefined,
					prependIcon: undefined,
					appendIcon: undefined,
					prependInnerIcon: undefined,
					appendInnerIcon: undefined,
					clearable: false,
					clearIcon: undefined,
					prefix: undefined,
					suffix: undefined,
					width: undefined,
					height: undefined,
				})"
		>
			<template #default="{ state }">
				<origam-number-field
						v-model="designModel"
						:variant="state.variant"
						:color="state.color"
						:bg-color="state.bgColor"
						:size="state.size"
						:density="state.density"
						:rounded="state.rounded"
						:elevation="state.elevation"
						:flat="state.flat"
						:border="state.border"
						:border-color="state.borderColor"
						:border-style="state.borderStyle"
						:prepend-icon="state.prependIcon || undefined"
						:append-icon="state.appendIcon || undefined"
						:prepend-inner-icon="state.prependInnerIcon || undefined"
						:append-inner-icon="state.appendInnerIcon || undefined"
						:clearable="state.clearable"
						:clear-icon="state.clearIcon || undefined"
						:prefix="state.prefix || undefined"
						:suffix="state.suffix || undefined"
						:width="state.width || undefined"
						:height="state.height || undefined"
						:label="state.label"
				/>
			</template>
			<template #controls="{ state }">
				<StoryGroup title="Variant">
					<HstSelect v-model="state.variant" title="Variant" :options="VARIANT_INPUT_OPTIONS"/>
				</StoryGroup>
				<StoryGroup title="Color">
					<HstSelect v-model="state.color"   title="Color"    :options="COLOR_OPTIONS"/>
					<HstSelect v-model="state.bgColor" title="Bg Color" :options="COLOR_OPTIONS"/>
				</StoryGroup>
				<StoryGroup title="Sizing">
					<HstSelect v-model="state.size"    title="Size"    :options="SIZE_OPTIONS"/>
					<HstSelect v-model="state.density" title="Density" :options="DENSITY_OPTIONS"/>
				</StoryGroup>
				<StoryGroup title="Shape">
					<HstSelect   v-model="state.rounded"   title="Rounded"   :options="ROUNDED_OPTIONS"/>
					<HstSelect   v-model="state.elevation" title="Elevation" :options="ELEVATION_OPTIONS"/>
					<HstCheckbox v-model="state.flat"      title="Flat"/>
				</StoryGroup>
				<StoryGroup title="Border">
					<HstSelect v-model="state.border"      title="Border"       :options="BORDER_OPTIONS"/>
					<HstText   v-model="state.borderColor" title="Border Color"/>
					<HstSelect v-model="state.borderStyle" title="Border Style" :options="BORDER_STYLE_OPTIONS"/>
				</StoryGroup>
				<StoryGroup title="Icons">
					<HstSelect v-model="state.prependIcon"      title="Prepend Icon"       :options="ICON_OPTIONS"/>
					<HstSelect v-model="state.appendIcon"       title="Append Icon"        :options="ICON_OPTIONS"/>
					<HstSelect v-model="state.prependInnerIcon" title="Prepend Inner Icon" :options="ICON_OPTIONS"/>
					<HstSelect v-model="state.appendInnerIcon"  title="Append Inner Icon"  :options="ICON_OPTIONS"/>
					<HstCheckbox v-model="state.clearable"      title="Clearable"/>
					<HstSelect v-model="state.clearIcon"        title="Clear Icon"         :options="ICON_OPTIONS"/>
				</StoryGroup>
				<StoryGroup title="Affix">
					<HstText v-model="state.prefix" title="Prefix"/>
					<HstText v-model="state.suffix" title="Suffix"/>
				</StoryGroup>
				<StoryGroup title="Dimension">
					<HstText v-model="state.width"  title="Width"/>
					<HstText v-model="state.height" title="Height"/>
				</StoryGroup>
			</template>
		</Variant>

		<Variant
				title="Functional"
				:init-state="() => useStoryInitState<Partial<INumberFieldProps>>({
					disabled: false,
					readonly: false,
					error: false,
					loading: false,
					min: 0,
					max: 100,
					step: 1,
					precision: 0,
					split: false,
					hideControls: false,
					compact: false,
					autofocus: false,
					placeholder: undefined,
					hideInput: false,
					hideDetails: false,
					holdDelay: undefined,
					holdRepeat: undefined,
					incrementIcon: undefined,
					decrementIcon: undefined,
				})"
		>
			<template #default="{ state }">
				<origam-number-field
						v-model="functionalModel"
						:disabled="state.disabled"
						:readonly="state.readonly"
						:error="state.error"
						:loading="state.loading"
						:min="state.min"
						:max="state.max"
						:step="state.step"
						:precision="state.precision"
						:split="state.split"
						:hide-controls="state.hideControls"
						:compact="state.compact"
						:autofocus="state.autofocus"
						:placeholder="state.placeholder || undefined"
						:hide-input="state.hideInput"
						:hide-details="state.hideDetails"
						:hold-delay="state.holdDelay"
						:hold-repeat="state.holdRepeat"
						:increment-icon="state.incrementIcon || undefined"
						:decrement-icon="state.decrementIcon || undefined"
						label="Quantity"
				/>
				<div>value = {{ functionalModel }}</div>
			</template>
			<template #controls="{ state }">
				<StoryGroup title="States">
					<HstCheckbox v-model="state.disabled" title="Disabled"/>
					<HstCheckbox v-model="state.readonly" title="Readonly"/>
					<HstCheckbox v-model="state.error"    title="Error"/>
					<HstCheckbox v-model="state.loading"  title="Loading"/>
				</StoryGroup>
				<StoryGroup title="Range">
					<HstNumber v-model="state.min"       title="Min"       :min="-1000" :max="0"    :step="1"/>
					<HstNumber v-model="state.max"       title="Max"       :min="1"     :max="1000" :step="1"/>
					<HstNumber v-model="state.step"      title="Step"      :min="0.01"  :max="100"  :step="0.01"/>
					<HstNumber v-model="state.precision" title="Precision" :min="0"     :max="4"    :step="1"/>
				</StoryGroup>
				<StoryGroup title="Layout">
					<HstCheckbox v-model="state.split"        title="Split"/>
					<HstCheckbox v-model="state.hideControls" title="Hide Controls"/>
					<HstCheckbox v-model="state.compact"      title="Compact"/>
					<HstCheckbox v-model="state.hideInput"    title="Hide Input"/>
					<HstCheckbox v-model="state.hideDetails"  title="Hide Details"/>
				</StoryGroup>
				<StoryGroup title="Input">
					<HstCheckbox v-model="state.autofocus"     title="Autofocus"/>
					<HstText     v-model="state.placeholder"   title="Placeholder"/>
				</StoryGroup>
				<StoryGroup title="Hold">
					<HstNumber v-model="state.holdDelay"  title="Hold Delay (ms)"   :min="0" :max="2000" :step="50"/>
					<HstNumber v-model="state.holdRepeat" title="Hold Repeat (ms)"  :min="0" :max="500"  :step="10"/>
				</StoryGroup>
				<StoryGroup title="Icons">
					<HstSelect v-model="state.incrementIcon" title="Increment Icon" :options="ICON_OPTIONS"/>
					<HstSelect v-model="state.decrementIcon" title="Decrement Icon" :options="ICON_OPTIONS"/>
				</StoryGroup>
			</template>
		</Variant>

		<Variant title="Events - update:modelValue">
			<origam-number-field
					v-model="emitModel"
					label="Update value"
					@update:model-value="logEvent('update:modelValue', $event)"
			/>
			<div>value = {{ emitModel }}</div>
		</Variant>

		<Variant title="Events - increment">
			<origam-number-field
					v-model="emitIncModel"
					label="Increment / Decrement"
					@increment="logEvent('increment', $event)"
					@decrement="logEvent('decrement', $event)"
			/>
			<div>value = {{ emitIncModel }}</div>
		</Variant>

		<Variant title="Events - click:control">
			<origam-number-field
					v-model="emitCtrlModel"
					label="Click control"
					@click:control="logEvent('click:control', $event)"
			/>
		</Variant>

		<Variant title="Events - mousedown:control">
			<origam-number-field
					v-model="emitCtrlModel"
					label="Mousedown control"
					@mousedown:control="logEvent('mousedown:control', $event)"
			/>
		</Variant>

		<Variant title="Events - click:clear">
			<origam-number-field
					v-model="emitCtrlModel"
					label="Clearable"
					clearable
					@click:clear="logEvent('click:clear', $event)"
			/>
		</Variant>

		<Variant title="Events - click:prepend">
			<origam-number-field
					v-model="emitCtrlModel"
					label="Prepend click"
					:prepend-icon="heartIcon"
					@click:prepend="logEvent('click:prepend', $event)"
			/>
		</Variant>

		<Variant title="Events - click:append">
			<origam-number-field
					v-model="emitCtrlModel"
					label="Append click"
					:append-icon="heartIcon"
					@click:append="logEvent('click:append', $event)"
			/>
		</Variant>

		<Variant title="Slots - Default">
			<origam-number-field v-model="slotModel" label="Quantity">
				<span>Custom slot content</span>
			</origam-number-field>
		</Variant>

		<Variant title="Slots - Prepend">
			<origam-number-field v-model="slotModel" label="Quantity">
				<template #prepend>
					<origam-icon :icon="heartIcon"/>
				</template>
			</origam-number-field>
		</Variant>

		<Variant title="Slots - Append">
			<origam-number-field v-model="slotModel" label="Quantity">
				<template #append>
					<origam-icon :icon="heartIcon"/>
				</template>
			</origam-number-field>
		</Variant>

		<Variant title="Slots - PrependInner">
			<origam-number-field v-model="slotModel" label="Quantity">
				<template #prependInner>
					<origam-icon :icon="heartIcon"/>
				</template>
			</origam-number-field>
		</Variant>

		<Variant title="Slots - AppendInner">
			<origam-number-field v-model="slotModel" label="Quantity">
				<template #appendInner>
					<origam-icon :icon="heartIcon"/>
				</template>
			</origam-number-field>
		</Variant>

		<Variant title="Slots - Clear">
			<origam-number-field v-model="slotModel" label="Quantity" clearable>
				<template #clear>
					<origam-icon :icon="closeIcon"/>
				</template>
			</origam-number-field>
		</Variant>

		<Variant title="Slots - Increment">
			<origam-number-field v-model="slotModel" label="Quantity">
				<template #increment>
					<origam-icon :icon="plusIcon"/>
				</template>
			</origam-number-field>
		</Variant>

		<Variant title="Slots - Decrement">
			<origam-number-field v-model="slotModel" label="Quantity">
				<template #decrement>
					<origam-icon :icon="minusIcon"/>
				</template>
			</origam-number-field>
		</Variant>

		<Variant title="Slots - Field">
			<origam-number-field v-model="slotModel" label="Quantity">
				<template #field>
					<span>Custom field content</span>
				</template>
			</origam-number-field>
		</Variant>

		<Variant title="Slots - Label">
			<origam-number-field v-model="slotModel" label="Quantity">
				<template #label>
					<span>Custom label</span>
				</template>
			</origam-number-field>
		</Variant>

		<Variant title="Slots - FloatingLabel">
			<origam-number-field v-model="slotModel" label="Quantity">
				<template #floatingLabel>
					<span>Floating label</span>
				</template>
			</origam-number-field>
		</Variant>

		<Variant title="Slots - Prefix">
			<origam-number-field v-model="slotModel" label="Price">
				<template #prefix>
					<span>€</span>
				</template>
			</origam-number-field>
		</Variant>

		<Variant title="Slots - Suffix">
			<origam-number-field v-model="slotModel" label="Weight">
				<template #suffix>
					<span>kg</span>
				</template>
			</origam-number-field>
		</Variant>

		<Variant title="Slots - Loader">
			<origam-number-field v-model="slotModel" label="Quantity" loading>
				<template #loader>
					<span>Loading...</span>
				</template>
			</origam-number-field>
		</Variant>

		<Variant title="Slots - Details">
			<origam-number-field v-model="slotModel" label="Quantity">
				<template #details>
					<span>Custom details area</span>
				</template>
			</origam-number-field>
		</Variant>

		<Variant title="Slots - Messages">
			<origam-number-field v-model="slotModel" label="Quantity" :error-messages="['Error one', 'Error two']">
				<template #messages>
					<span>Custom messages area</span>
				</template>
			</origam-number-field>
		</Variant>

		<Variant title="Slots - Message">
			<origam-number-field v-model="slotModel" label="Quantity" :error-messages="['Error message']">
				<template #message="{ message }">
					<span>{{ message }}</span>
				</template>
			</origam-number-field>
		</Variant>

		<Variant
				title="Default"
				:init-state="() => useStoryInitState<Partial<INumberFieldProps>>({
					label: 'Quantity',
					color: 'primary',
					variant: undefined,
					density: undefined,
					min: 0,
					max: 100,
					step: 1,
					precision: 0,
					split: false,
					hideControls: false,
					compact: false,
					disabled: false,
					readonly: false,
					error: false,
				})"
		>
			<template #default="{ state }">
				<origam-number-field
						v-model="playgroundModel"
						v-bind="state"
						@update:model-value="logEvent('update:modelValue', $event)"
				/>
				<div>value = {{ playgroundModel }}</div>
			</template>
			<template #controls="{ state }">
				<StoryGroup title="Content">
					<HstText v-model="state.label" title="Label"/>
				</StoryGroup>
				<StoryGroup title="Design">
					<HstSelect v-model="state.variant"   title="Variant"   :options="VARIANT_INPUT_OPTIONS"/>
					<HstSelect v-model="state.color"     title="Color"     :options="COLOR_OPTIONS"/>
					<HstSelect v-model="state.bgColor"   title="Bg Color"  :options="COLOR_OPTIONS"/>
					<HstSelect v-model="state.size"      title="Size"      :options="SIZE_OPTIONS"/>
					<HstSelect v-model="state.density"   title="Density"   :options="DENSITY_OPTIONS"/>
					<HstSelect v-model="state.rounded"   title="Rounded"   :options="ROUNDED_OPTIONS"/>
					<HstSelect v-model="state.elevation" title="Elevation" :options="ELEVATION_OPTIONS"/>
				</StoryGroup>
				<StoryGroup title="Functional">
					<HstNumber   v-model="state.min"          title="Min"           :min="-1000" :max="0"    :step="1"/>
					<HstNumber   v-model="state.max"          title="Max"           :min="1"     :max="1000" :step="1"/>
					<HstNumber   v-model="state.step"         title="Step"          :min="0.01"  :max="100"  :step="0.01"/>
					<HstNumber   v-model="state.precision"    title="Precision"     :min="0"     :max="4"    :step="1"/>
					<HstCheckbox v-model="state.split"        title="Split"/>
					<HstCheckbox v-model="state.hideControls" title="Hide Controls"/>
					<HstCheckbox v-model="state.compact"      title="Compact"/>
					<HstCheckbox v-model="state.disabled"     title="Disabled"/>
					<HstCheckbox v-model="state.readonly"     title="Readonly"/>
					<HstCheckbox v-model="state.error"        title="Error"/>
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

	import { OrigamIcon, OrigamNumberField } from '@origam/components'
	import { MDI_ICONS } from '@origam/enums'
	import type { INumberFieldProps } from '@origam/interfaces'

	import StoryGroup from '@stories/components/_shared/StoryGroup.vue'
	import { useStoryInitState } from '@stories/composables'
	import {
		BORDER_OPTIONS,
		BORDER_STYLE_OPTIONS,
		COLOR_OPTIONS,
		DENSITY_OPTIONS,
		ELEVATION_OPTIONS,
		ICON_OPTIONS,
		ROUNDED_OPTIONS,
		SIZE_OPTIONS,
		VARIANT_INPUT_OPTIONS
	} from '@stories/const'

	const heartIcon = MDI_ICONS.HEART
	const closeIcon = MDI_ICONS.CLOSE_CIRCLE
	const plusIcon  = MDI_ICONS.PLUS
	const minusIcon = MDI_ICONS.MINUS

	const designModel     = ref<number | null>(42)
	const functionalModel = ref<number | null>(0)
	const slotModel       = ref<number | null>(0)
	const emitModel       = ref<number | null>(0)
	const emitIncModel    = ref<number | null>(0)
	const emitCtrlModel   = ref<number | null>(0)
	const playgroundModel = ref<number | null>(0)
</script>

<docs
		lang="md"
		src="@docs/components/NumberField/OrigamNumberField.md"
/>
