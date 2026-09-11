<template>
	<Story
			group="components"
			title="ColorPickerField/OrigamColorPickerField"
	>

		<Variant
				title="Design"
				:init-state="() => useStoryInitState<Partial<IColorPickerFieldProps>>({
					label: 'Brand colour',
					color: undefined,
					bgColor: undefined,
					variant: undefined,
					density: undefined,
					rounded: undefined,
					elevation: undefined,
					border: undefined,
					borderColor: undefined,
					borderStyle: undefined,
					prependIcon: undefined,
					appendIcon: undefined,
					clearable: false,
					width: undefined,
					height: undefined,
				})"
		>
			<template #default="{ state }">
				<origam-color-picker-field
						v-model="designColor"
						:label="state.label"
						:padding="state.padding"
						:margin="state.margin"
						:color="state.color"
						:bg-color="state.bgColor"
						:variant="state.variant"
						:density="state.density"
						:rounded="state.rounded"
						:elevation="state.elevation"
						:border="state.border"
						:border-color="state.borderColor"
						:border-style="state.borderStyle"
						:prepend-icon="state.prependIcon || undefined"
						:append-icon="state.appendIcon || undefined"
						:clearable="state.clearable"
						:width="state.width"
						:height="state.height"
						style="max-width: 320px"
				/>
			</template>
			<template #controls="{ state }">
				<StoryGroup title="Color">
					<HstSelect v-model="state.color"   title="Color"    :options="COLOR_OPTIONS"/>
					<HstSelect v-model="state.bgColor" title="Bg Color" :options="COLOR_OPTIONS"/>
				</StoryGroup>
				<StoryGroup title="Variant">
					<HstSelect v-model="state.variant" title="Variant" :options="VARIANT_INPUT_OPTIONS"/>
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
				<StoryGroup title="Icons">
					<HstSelect   v-model="state.prependIcon" title="Prepend Icon" :options="ICON_OPTIONS"/>
					<HstSelect   v-model="state.appendIcon"  title="Append Icon"  :options="ICON_OPTIONS"/>
					<HstCheckbox v-model="state.clearable"   title="Clearable"/>
				</StoryGroup>
				<StoryGroup title="Label">
					<HstText v-model="state.label" title="Label"/>
				</StoryGroup>
				<StoryGroup title="Dimension">
					<HstText v-model="state.width"  title="Width"/>
					<HstText v-model="state.height" title="Height"/>
				</StoryGroup>
				<StoryGroup title="Spacing">
					<HstText v-model="state.padding" title="Padding"/>
					<HstText v-model="state.margin"  title="Margin"/>
				</StoryGroup>
			</template>
		</Variant>

		<Variant
				title="State"
				:init-state="() => useStoryInitState<IHoverProps & IColorProps & { active?: boolean | object }>({ color: 'primary' })"
		>
			<template #default="{ state }">
				<origam-color-picker-field
						v-model="stateColor"
						label="State field"
						:color="state.color"
						:hover="resolveHoverState(state.hover)"
						:active="resolveActiveState(state.active)"
						style="max-width: 320px"
				/>
			</template>
			<template #controls="{ state }">
				<StoryGroup title="Surface">
					<HstSelect v-model="state.color" title="Color" :options="COLOR_OPTIONS"/>
				</StoryGroup>
				<StoryGroup title="Interaction">
					<HstSelect v-model="state.hover"  title="Hover"  :options="HOVER_OPTIONS"/>
					<HstSelect v-model="state.active" title="Active" :options="ACTIVE_OPTIONS"/>
				</StoryGroup>
			</template>
		</Variant>

		<Variant
				title="Functional"
				:init-state="() => useStoryInitState<Partial<IColorPickerFieldProps> & { validateOn?: TValidateOn }>({
					disabled: false,
					readonly: false,
					closeOnSelect: false,
					openOnClear: false,
					loading: false,
					validateOn: 'blur',
				})"
		>
			<template #default="{ state }">
				<origam-color-picker-field
						v-model="functionalColor"
						label="Colour"
						:disabled="state.disabled"
						:readonly="state.readonly"
						:close-on-select="state.closeOnSelect"
						:open-on-clear="state.openOnClear"
						:loading="state.loading"
						:rules="state.disabled ? [] : colorRequiredRule"
						:validate-on="state.validateOn"
						style="max-width: 320px"
				/>
			</template>
			<template #controls="{ state }">
				<StoryGroup title="States">
					<HstCheckbox v-model="state.disabled" title="Disabled"/>
					<HstCheckbox v-model="state.readonly" title="Readonly"/>
					<HstCheckbox v-model="state.loading"  title="Loading"/>
				</StoryGroup>
				<StoryGroup title="Picker Behaviour">
					<HstCheckbox v-model="state.closeOnSelect" title="Close on Select"/>
					<HstCheckbox v-model="state.openOnClear"   title="Open on Clear"/>
				</StoryGroup>
				<StoryGroup title="Validation">
					<HstSelect v-model="state.validateOn" title="Validate On" :options="VALIDATE_ON_OPTIONS"/>
				</StoryGroup>
			</template>
		</Variant>

		<Variant title="Prop — closeOnSelect">
			<origam-color-picker-field
					v-model="functionalColor"
					label="Colour (closeOnSelect)"
					close-on-select
					style="max-width: 320px"
			/>
		</Variant>

		<Variant title="Prop — disabled & readonly">
			<div style="display: flex; flex-direction: column; gap: 16px; padding: 16px; max-width: 320px;">
				<origam-color-picker-field v-model="functionalColor" label="Disabled" disabled/>
				<origam-color-picker-field v-model="functionalColor" label="Readonly" readonly/>
			</div>
		</Variant>

		<Variant title="Prop — rules">
			<origam-color-picker-field
					v-model="rulesColor"
					label="Required colour"
					:rules="colorRequiredRule"
					validate-on="blur"
					style="max-width: 320px"
					data-cy="colorpickerfield-rules"
			/>
		</Variant>

		<Variant title="Events - update:modelValue">
			<origam-color-picker-field
					v-model="emitColor"
					label="Colour"
					style="max-width: 320px"
					@update:model-value="logEvent('update:modelValue', $event)"
			/>
		</Variant>

		<Variant title="Events - update:menu">
			<origam-color-picker-field
					v-model="emitColor"
					label="Colour"
					style="max-width: 320px"
					@update:menu="logEvent('update:menu', $event)"
			/>
		</Variant>

		<Variant title="Slots - Prepend">
			<origam-color-picker-field v-model="slotColor" label="Colour" style="max-width: 320px">
				<template #prepend>
					<origam-icon :icon="MDI_ICONS.HEART"/>
				</template>
			</origam-color-picker-field>
		</Variant>

		<Variant title="Slots - Append">
			<origam-color-picker-field v-model="slotColor" label="Colour" style="max-width: 320px">
				<template #append>
					<origam-icon :icon="MDI_ICONS.ARROW_RIGHT"/>
				</template>
			</origam-color-picker-field>
		</Variant>

		<Variant title="Slots - PrependInner">
			<origam-color-picker-field v-model="slotColor" label="Colour" style="max-width: 320px">
				<template #prependInner>
					<origam-icon :icon="MDI_ICONS.PALETTE"/>
				</template>
			</origam-color-picker-field>
		</Variant>

		<Variant title="Slots - AppendInner">
			<origam-color-picker-field v-model="slotColor" label="Colour" style="max-width: 320px">
				<template #appendInner>
					<origam-icon :icon="MDI_ICONS.MAGNIFY"/>
				</template>
			</origam-color-picker-field>
		</Variant>

		<Variant title="Slots - Clear">
			<origam-color-picker-field v-model="slotColor" label="Colour" clearable style="max-width: 320px">
				<template #clear>
					<origam-icon :icon="MDI_ICONS.CLOSE_CIRCLE"/>
				</template>
			</origam-color-picker-field>
		</Variant>

		<Variant title="Slots - ColorSelection">
			<origam-color-picker-field v-model="slotColor" label="Colour" style="max-width: 320px">
				<template #colorSelection>
					<span>Custom colour selection</span>
				</template>
			</origam-color-picker-field>
		</Variant>

		<Variant title="Slots - FloatingLabel">
			<origam-color-picker-field v-model="slotColor" label="Colour" style="max-width: 320px">
				<template #floatingLabel>
					<span>Pick a colour</span>
				</template>
			</origam-color-picker-field>
		</Variant>

		<Variant title="Slots - Label">
			<origam-color-picker-field v-model="slotColor" style="max-width: 320px">
				<template #label>
					<strong>Brand colour</strong>
				</template>
			</origam-color-picker-field>
		</Variant>

		<Variant title="Slots - Loader">
			<origam-color-picker-field v-model="slotColor" label="Colour" loading style="max-width: 320px">
				<template #loader>
					<span>Loading...</span>
				</template>
			</origam-color-picker-field>
		</Variant>

		<Variant title="Slots - Prefix">
			<origam-color-picker-field v-model="slotColor" label="Colour" style="max-width: 320px">
				<template #prefix>
					<span>#</span>
				</template>
			</origam-color-picker-field>
		</Variant>

		<Variant title="Slots - Suffix">
			<origam-color-picker-field v-model="slotColor" label="Colour" style="max-width: 320px">
				<template #suffix>
					<span>px</span>
				</template>
			</origam-color-picker-field>
		</Variant>

		<Variant
				title="Default"
				:init-state="() => useStoryInitState<Partial<IColorPickerFieldProps>>({
					label: 'Brand colour',
					color: undefined,
					bgColor: undefined,
					variant: undefined,
					density: undefined,
					rounded: undefined,
					elevation: undefined,
					closeOnSelect: false,
					disabled: false,
					readonly: false,
					clearable: false,
					loading: false,
				})"
		>
			<template #default="{ state }">
				<origam-color-picker-field
						v-model="playgroundColor"
						v-bind="state"
						style="max-width: 320px"
						@update:model-value="logEvent('update:modelValue', $event)"
						@update:menu="logEvent('update:menu', $event)"
				/>
			</template>
			<template #controls="{ state }">
				<StoryGroup title="Content">
					<HstText v-model="state.label" title="Label"/>
				</StoryGroup>
				<StoryGroup title="Design">
					<HstSelect   v-model="state.color"     title="Color"     :options="COLOR_OPTIONS"/>
					<HstSelect   v-model="state.bgColor"   title="Bg Color"  :options="COLOR_OPTIONS"/>
					<HstSelect   v-model="state.variant"   title="Variant"   :options="VARIANT_INPUT_OPTIONS"/>
					<HstSelect   v-model="state.density"   title="Density"   :options="DENSITY_OPTIONS"/>
					<HstSelect   v-model="state.rounded"   title="Rounded"   :options="ROUNDED_OPTIONS"/>
					<HstSelect   v-model="state.elevation" title="Elevation" :options="ELEVATION_OPTIONS"/>
					<HstCheckbox v-model="state.clearable" title="Clearable"/>
				</StoryGroup>
				<StoryGroup title="Functional">
					<HstCheckbox v-model="state.closeOnSelect" title="Close on Select"/>
					<HstCheckbox v-model="state.disabled"      title="Disabled"/>
					<HstCheckbox v-model="state.readonly"      title="Readonly"/>
					<HstCheckbox v-model="state.loading"       title="Loading"/>
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
	import { ref } from 'vue'

	import { OrigamColorPickerField, OrigamIcon } from '@origam/components'
	import { MDI_ICONS } from '@origam/enums'
	import type { IColorPickerFieldProps, IColorProps, IHoverProps } from '@origam/interfaces'
	import type { TValidateOn } from '@origam/types'

	import StoryGroup from '@stories/components/_shared/StoryGroup.vue'
	import { useStoryInitState } from '@stories/composables'
	import {
		ACTIVE_OPTIONS,
		resolveActiveState,
		BORDER_OPTIONS,
		BORDER_STYLE_OPTIONS,
		COLOR_OPTIONS,
		DENSITY_OPTIONS,
		ELEVATION_OPTIONS,
		HOVER_OPTIONS,
		resolveHoverState,
		ICON_OPTIONS,
		ROUNDED_OPTIONS,
		VARIANT_INPUT_OPTIONS
	} from '@stories/const'
	import type { IOptions } from '@origam/interfaces'

	const designColor     = ref(null)
	const stateColor      = ref(null)
	const functionalColor = ref(null)
	const rulesColor      = ref(null)
	const emitColor       = ref(null)
	const slotColor       = ref(null)
	const playgroundColor = ref(null)

	const colorRequiredRule = [(v: unknown) => !!v || 'Color required']

	const VALIDATE_ON_OPTIONS: Array<IOptions<TValidateOn>> = [
		{ label: 'input',  value: 'input' },
		{ label: 'blur',   value: 'blur' },
		{ label: 'submit', value: 'submit' },
		{ label: 'lazy',   value: 'lazy' },
	]
</script>

<docs lang="md" src="@docs/components/ColorPickerField/OrigamColorPickerField.md"/>
