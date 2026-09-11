<template>
	<Story
			group="components"
			title="DatePickerField/OrigamDatePickerField"
	>

		<Variant
				title="Design"
				:init-state="() => useStoryInitState<Partial<IDatePickerFieldProps>>({
					label: 'Appointment',
					variant: VARIANT_INPUT.OUTLINED,
					color: 'primary',
					size: 'default',
					density: DENSITY.DEFAULT,
					rounded: true,
					elevation: undefined,
					flat: false,
					border: true,
					appendInnerIcon: MDI_ICONS.CALENDAR_OUTLINE,
					width: '',
					height: ''
				})"
		>
			<template #default="{ state }">
				<origam-date-picker-field
						v-model="designDate"
						:label="state.label"
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
						:width="state.width || undefined"
						:height="state.height || undefined"
						style="max-width: 320px"
				/>
			</template>
			<template #controls="{ state }">
				<StoryGroup title="Content">
					<HstText v-model="state.label" title="Label"/>
				</StoryGroup>
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
				</StoryGroup>
				<StoryGroup title="Dimension">
					<HstText v-model="state.width"  title="Width"/>
					<HstText v-model="state.height" title="Height"/>
				</StoryGroup>
			</template>
		</Variant>

		<Variant
				title="State"
				:init-state="() => useStoryInitState<IHoverProps & IBgColorProps & { active?: boolean | object }>({ bgColor: 'primary' })"
		>
			<template #default="{ state }">
				<origam-date-picker-field
						v-model="stateDate"
						label="State"
						:bg-color="state.bgColor"
						:hover="resolveHoverState(state.hover)"
						:active="resolveActiveState(state.active)"
						style="max-width: 320px"
				/>
			</template>
			<template #controls="{ state }">
				<StoryGroup title="Surface">
					<HstSelect v-model="state.bgColor" title="Bg Color" :options="COLOR_OPTIONS"/>
				</StoryGroup>
				<StoryGroup title="Interaction">
					<HstSelect v-model="state.hover"  title="Hover"  :options="HOVER_OPTIONS"/>
					<HstSelect v-model="state.active" title="Active" :options="ACTIVE_OPTIONS"/>
				</StoryGroup>
			</template>
		</Variant>

		<Variant
				title="Functional"
				:init-state="() => useStoryInitState<Partial<IDatePickerFieldProps>>({
					label: 'Date',
					disabled: false,
					readonly: false,
					range: false,
					multiple: false,
					closeOnSelect: true,
					closableChips: false,
					openOnClear: false,
					clearable: false,
					persistentClear: false,
					reverse: false,
					singleLine: false,
					hint: '',
					hideDetails: false,
					placeholder: '',
					persistentPlaceholder: false,
					counter: false
				})"
		>
			<template #default="{ state }">
				<origam-date-picker-field
						v-model="functionalDate"
						:label="state.label"
						:disabled="state.disabled"
						:readonly="state.readonly"
						:range="state.range"
						:multiple="state.multiple"
						:close-on-select="state.closeOnSelect"
						:closable-chips="state.closableChips"
						:open-on-clear="state.openOnClear"
						:clearable="state.clearable"
						:persistent-clear="state.persistentClear"
						:reverse="state.reverse"
						:single-line="state.singleLine"
						:hint="state.hint || undefined"
						:hide-details="state.hideDetails"
						:placeholder="state.placeholder || undefined"
						:persistent-placeholder="state.persistentPlaceholder"
						:counter="state.counter"
						style="max-width: 320px"
				/>
			</template>
			<template #controls="{ state }">
				<StoryGroup title="Content">
					<HstText v-model="state.label"       title="Label"/>
					<HstText v-model="state.hint"        title="Hint"/>
					<HstText v-model="state.placeholder" title="Placeholder"/>
				</StoryGroup>
				<StoryGroup title="States">
					<HstCheckbox v-model="state.disabled" title="Disabled"/>
					<HstCheckbox v-model="state.readonly" title="Readonly"/>
					<HstCheckbox v-model="state.reverse"  title="Reverse"/>
				</StoryGroup>
				<StoryGroup title="Selection">
					<HstCheckbox v-model="state.range"         title="Range"/>
					<HstCheckbox v-model="state.multiple"      title="Multiple"/>
					<HstCheckbox v-model="state.closeOnSelect" title="Close On Select"/>
					<HstCheckbox v-model="state.closableChips" title="Closable Chips"/>
					<HstCheckbox v-model="state.openOnClear"   title="Open On Clear"/>
				</StoryGroup>
				<StoryGroup title="Display">
					<HstCheckbox v-model="state.clearable"            title="Clearable"/>
					<HstCheckbox v-model="state.persistentClear"      title="Persistent Clear"/>
					<HstCheckbox v-model="state.singleLine"           title="Single Line"/>
					<HstCheckbox v-model="state.hideDetails"          title="Hide Details"/>
					<HstCheckbox v-model="state.persistentPlaceholder" title="Persistent Placeholder"/>
					<HstCheckbox v-model="state.counter"              title="Counter"/>
				</StoryGroup>
				<StoryGroup title="Validation">
					<origam-date-picker-field
							v-model="rulesDate"
							label="Required (blur)"
							:rules="requiredRule"
							validate-on="blur"
							style="max-width: 320px"
					/>
				</StoryGroup>
			</template>
		</Variant>

		<Variant title="Events - update:modelValue">
			<origam-date-picker-field
					v-model="emitDate"
					label="Date"
					style="max-width: 320px"
					@update:model-value="logEvent('update:modelValue', $event)"
			/>
		</Variant>

		<Variant title="Events - update:menu">
			<origam-date-picker-field
					v-model="emitDate"
					label="Date"
					style="max-width: 320px"
					@update:menu="logEvent('update:menu', $event)"
			/>
		</Variant>

		<Variant title="Events - click:clear">
			<origam-date-picker-field
					v-model="emitDate"
					label="Date"
					clearable
					style="max-width: 320px"
					@click:clear="logEvent('click:clear', $event)"
			/>
		</Variant>

		<Variant title="Events - click:append">
			<origam-date-picker-field
					v-model="emitDate"
					label="Date"
					:append-icon="MDI_ICONS.HEART"
					style="max-width: 320px"
					@click:append="logEvent('click:append', $event)"
			/>
		</Variant>

		<Variant title="Events - click:prepend">
			<origam-date-picker-field
					v-model="emitDate"
					label="Date"
					:prepend-icon="MDI_ICONS.HEART"
					style="max-width: 320px"
					@click:prepend="logEvent('click:prepend', $event)"
			/>
		</Variant>

		<Variant title="Events - click:appendInner">
			<origam-date-picker-field
					v-model="emitDate"
					label="Date"
					:append-inner-icon="MDI_ICONS.MAGNIFY"
					style="max-width: 320px"
					@click:append-inner="logEvent('click:appendInner', $event)"
			/>
		</Variant>

		<Variant title="Events - click:prependInner">
			<origam-date-picker-field
					v-model="emitDate"
					label="Date"
					:prepend-inner-icon="MDI_ICONS.MAGNIFY"
					style="max-width: 320px"
					@click:prepend-inner="logEvent('click:prependInner', $event)"
			/>
		</Variant>

		<Variant title="Slots - Prepend">
			<origam-date-picker-field label="Date" style="max-width: 320px">
				<template #prepend>
					<origam-icon :icon="MDI_ICONS.HEART"/>
				</template>
			</origam-date-picker-field>
		</Variant>

		<Variant title="Slots - Append">
			<origam-date-picker-field label="Date" style="max-width: 320px">
				<template #append>
					<origam-icon :icon="MDI_ICONS.HEART"/>
				</template>
			</origam-date-picker-field>
		</Variant>

		<Variant title="Slots - PrependInner">
			<origam-date-picker-field label="Date" style="max-width: 320px">
				<template #prependInner>
					<origam-icon :icon="MDI_ICONS.HEART"/>
				</template>
			</origam-date-picker-field>
		</Variant>

		<Variant title="Slots - AppendInner">
			<origam-date-picker-field label="Date" style="max-width: 320px">
				<template #appendInner>
					<origam-icon :icon="MDI_ICONS.STAR"/>
				</template>
			</origam-date-picker-field>
		</Variant>

		<Variant title="Slots - Clear">
			<origam-date-picker-field label="Date" clearable style="max-width: 320px">
				<template #clear>
					<origam-icon :icon="MDI_ICONS.CLOSE"/>
				</template>
			</origam-date-picker-field>
		</Variant>

		<Variant title="Slots - FloatingLabel">
			<origam-date-picker-field label="Date" style="max-width: 320px">
				<template #floatingLabel>
					<span>Custom floating label</span>
				</template>
			</origam-date-picker-field>
		</Variant>

		<Variant title="Slots - Label">
			<origam-date-picker-field label="Date" style="max-width: 320px">
				<template #label>
					<span>Custom label</span>
				</template>
			</origam-date-picker-field>
		</Variant>

		<Variant title="Slots - Prefix">
			<origam-date-picker-field label="Date" style="max-width: 320px">
				<template #prefix>
					<span>From:</span>
				</template>
			</origam-date-picker-field>
		</Variant>

		<Variant title="Slots - Suffix">
			<origam-date-picker-field label="Date" style="max-width: 320px">
				<template #suffix>
					<span>UTC</span>
				</template>
			</origam-date-picker-field>
		</Variant>

		<Variant title="Slots - Loader">
			<origam-date-picker-field label="Date" loading style="max-width: 320px">
				<template #loader>
					<span>Loading...</span>
				</template>
			</origam-date-picker-field>
		</Variant>

		<Variant title="Slots - Chip">
			<origam-date-picker-field v-model="slotDates" label="Date" multiple style="max-width: 320px">
				<template #chip>
					<origam-chip text="Custom chip"/>
				</template>
			</origam-date-picker-field>
		</Variant>

		<Variant title="Slots - Selection">
			<origam-date-picker-field v-model="slotDate" label="Date" style="max-width: 320px">
				<template #selection>
					<origam-chip text="Selected"/>
				</template>
			</origam-date-picker-field>
		</Variant>

		<Variant title="Slots - RangeSelection">
			<origam-date-picker-field v-model="slotDates" label="Date range" range style="max-width: 320px">
				<template #rangeSelection>
					<span>Custom range display</span>
				</template>
			</origam-date-picker-field>
		</Variant>

		<Variant title="Prop — range">
			<origam-date-picker-field v-model="rangeDate" label="Date range" range style="max-width: 320px"/>
		</Variant>

		<Variant title="Prop — multiple">
			<origam-date-picker-field v-model="multipleDates" label="Multiple dates" multiple style="max-width: 320px"/>
		</Variant>

		<Variant title="Prop — closeOnSelect">
			<origam-date-picker-field v-model="closeOnSelectDate" label="Close on select" :close-on-select="true" style="max-width: 320px"/>
		</Variant>

		<Variant title="Prop — disabled & readonly">
			<div style="display: flex; flex-direction: column; gap: 16px; padding: 16px;">
				<origam-date-picker-field v-model="stateDate" label="Disabled" disabled style="max-width: 320px"/>
				<origam-date-picker-field v-model="stateDate" label="Readonly" readonly style="max-width: 320px"/>
			</div>
		</Variant>

		<Variant title="Emit — update:modelValue">
			<origam-date-picker-field
					v-model="emitDate"
					label="Date"
					style="max-width: 320px"
					@update:model-value="logEvent('update:modelValue', $event)"
			/>
		</Variant>

		<Variant title="Prop — rules">
			<div style="display: flex; flex-direction: column; gap: 24px; padding: 16px;">
				<origam-date-picker-field
						v-model="rulesDate"
						label="Required date"
						:rules="requiredRule"
						validate-on="blur"
						style="max-width: 320px"
						data-cy="datepickerfield-rules-single"
				/>
				<origam-date-picker-field
						v-model="rulesRangeDate"
						label="Required range"
						range
						:rules="requiredRangeRule"
						validate-on="blur"
						style="max-width: 320px"
						data-cy="datepickerfield-rules-range"
				/>
			</div>
		</Variant>

		<Variant
				title="Default"
				:init-state="() => useStoryInitState<Partial<IDatePickerFieldProps>>({
					label: 'Appointment',
					variant: VARIANT_INPUT.OUTLINED,
					color: 'primary',
					density: DENSITY.DEFAULT,
					rounded: true,
					border: true,
					disabled: false,
					readonly: false,
					range: false,
					multiple: false,
					closeOnSelect: true,
					clearable: false
				})"
		>
			<template #default="{ state }">
				<origam-date-picker-field
						v-model="playgroundDate"
						v-bind="state"
						style="max-width: 320px"
						@update:model-value="logEvent('update:modelValue', $event)"
				/>
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
					<HstCheckbox v-model="state.disabled"      title="Disabled"/>
					<HstCheckbox v-model="state.readonly"      title="Readonly"/>
					<HstCheckbox v-model="state.range"         title="Range"/>
					<HstCheckbox v-model="state.multiple"      title="Multiple"/>
					<HstCheckbox v-model="state.closeOnSelect" title="Close On Select"/>
					<HstCheckbox v-model="state.clearable"     title="Clearable"/>
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

	import { OrigamChip, OrigamDatePickerField, OrigamIcon } from '@origam/components'
	import { DENSITY, MDI_ICONS, VARIANT_INPUT } from '@origam/enums'
	import type {
		IBgColorProps,
		IDatePickerFieldProps,
		IHoverProps
	} from '@origam/interfaces'

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
		SIZE_OPTIONS,
		VARIANT_INPUT_OPTIONS
	} from '@stories/const'

	const designDate = ref(null)
	const stateDate = ref(null)
	const functionalDate = ref(null)
	const emitDate = ref(null)
	const slotDate = ref(null)
	const slotDates = ref([])
	const playgroundDate = ref(null)
	const rangeDate         = ref(null)
	const multipleDates     = ref([])
	const closeOnSelectDate = ref(null)
	const rulesDate         = ref(null)
	const rulesRangeDate    = ref(null)

	const requiredRule = [(v: unknown) => {
		if (Array.isArray(v)) return v.length > 0 || 'Date required'
		return !!v || 'Date required'
	}]

	const requiredRangeRule = [(v: unknown) => {
		if (Array.isArray(v)) return v.length >= 2 || 'Select start and end date'
		return !!v || 'Date required'
	}]
</script>

<docs lang="md" src="@docs/components/DatePickerField/OrigamDatePickerField.md"/>
