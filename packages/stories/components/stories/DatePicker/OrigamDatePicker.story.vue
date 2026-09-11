<template>
	<Story
			group="components"
			title="DatePicker/OrigamDatePicker"
	>

		<Variant
				title="Design"
				:init-state="() => useStoryInitState<Partial<IDatePickerProps>>({ bgColor: 'primary', viewMode: DATE_MODE.MONTH })"
		>
			<template #default="{ state }">
				<origam-date-picker
						:color="state.color"
						:padding="state.padding"
						:margin="state.margin"
						:bg-color="state.bgColor"
						:border="state.border"
						:border-color="state.borderColor"
						:border-style="state.borderStyle"
						:rounded="state.rounded"
						:elevation="state.elevation"
						:landscape="state.landscape"
						:hide-header="state.hideHeader"
						:show-week="state.showWeek"
						:hide-weekdays="state.hideWeekdays"
						:show-adjacent-months="state.showAdjacentMonths"
						:first-day-of-week="state.firstDayOfWeek"
						:density="state.density"
						:title="state.title || undefined"
						:weeks-in-month="state.weeksInMonth"
						:view-mode="state.viewMode"
				/>
			</template>
			<template #controls="{ state }">
				<StoryGroup title="Color">
					<HstSelect v-model="state.color"   title="Color"    :options="COLOR_OPTIONS"/>
					<HstSelect v-model="state.bgColor" title="Bg Color" :options="COLOR_OPTIONS"/>
				</StoryGroup>
				<StoryGroup title="Border">
					<HstSelect v-model="state.border"      title="Border"       :options="BORDER_OPTIONS"/>
					<HstText   v-model="state.borderColor" title="Border Color"/>
					<HstSelect v-model="state.borderStyle" title="Border Style" :options="BORDER_STYLE_OPTIONS"/>
				</StoryGroup>
				<StoryGroup title="Shape">
					<HstSelect v-model="state.rounded"   title="Rounded"   :options="ROUNDED_OPTIONS"/>
					<HstSelect v-model="state.elevation" title="Elevation" :options="ELEVATION_OPTIONS"/>
				</StoryGroup>
				<StoryGroup title="Sizing">
					<HstSelect v-model="state.density" title="Density" :options="DENSITY_OPTIONS"/>
				</StoryGroup>
				<StoryGroup title="Layout">
					<HstCheckbox v-model="state.landscape"   title="Landscape"/>
					<HstCheckbox v-model="state.hideHeader"  title="Hide Header"/>
				</StoryGroup>
				<StoryGroup title="Calendar">
					<HstCheckbox v-model="state.showWeek"           title="Show Week"/>
					<HstCheckbox v-model="state.hideWeekdays"       title="Hide Weekdays"/>
					<HstCheckbox v-model="state.showAdjacentMonths" title="Show Adjacent Months"/>
					<HstNumber   v-model="state.firstDayOfWeek"     title="First Day Of Week" :min="0" :max="6" :step="1"/>
					<HstSelect   v-model="state.weeksInMonth"       title="Weeks In Month" :options="WEEKS_IN_MONTH_OPTIONS"/>
				</StoryGroup>
				<StoryGroup title="Header">
					<HstText v-model="state.title"  title="Title"/>
				</StoryGroup>
				<StoryGroup title="Spacing">
					<HstText v-model="state.padding" title="Padding"/>
					<HstText v-model="state.margin"  title="Margin"/>
				</StoryGroup>
			</template>
		</Variant>

		<Variant
				title="Functional"
				:init-state="() => useStoryInitState<Partial<IDatePickerProps>>({ viewMode: DATE_MODE.MONTH })"
		>
			<template #default="{ state }">
				<origam-date-picker
						v-model="date"
						:multiple="state.multiple"
						:range="state.range"
						:min="state.min || undefined"
						:max="state.max || undefined"
						:disabled="state.disabled"
						:disabled-month="state.disabledMonth"
						:disabled-year="state.disabledYear"
						:disabled-next="state.disabledNext"
						:disabled-prev="state.disabledPrev"
						:view-mode="state.viewMode"
				/>
			</template>
			<template #controls="{ state }">
				<StoryGroup title="States">
					<HstCheckbox v-model="state.disabled"      title="Disabled"/>
					<HstCheckbox v-model="state.disabledMonth" title="Disabled Month Btn"/>
					<HstCheckbox v-model="state.disabledYear"  title="Disabled Year Btn"/>
					<HstCheckbox v-model="state.disabledNext"  title="Disabled Next Btn"/>
					<HstCheckbox v-model="state.disabledPrev"  title="Disabled Prev Btn"/>
				</StoryGroup>
				<StoryGroup title="Selection">
					<HstCheckbox v-model="state.multiple" title="Multiple"/>
					<HstCheckbox v-model="state.range"    title="Range"/>
				</StoryGroup>
				<StoryGroup title="Constraints">
					<HstText v-model="state.min" title="Min (ISO 8601)"/>
					<HstText v-model="state.max" title="Max (ISO 8601)"/>
				</StoryGroup>
				<StoryGroup title="View">
					<HstSelect v-model="state.viewMode" title="View Mode" :options="VIEW_MODE_OPTIONS"/>
				</StoryGroup>
			</template>
		</Variant>

		<Variant title="Prop — modelValue (single date)">
			<origam-date-picker v-model="singleDate" data-cy="date-picker-single"/>
		</Variant>

		<Variant title="Prop — range">
			<origam-date-picker v-model="rangeValue" range data-cy="date-picker-range"/>
		</Variant>

		<Variant title="Prop — multiple">
			<origam-date-picker v-model="multipleValue" multiple data-cy="date-picker-multiple"/>
		</Variant>

		<Variant title="Prop — min & max (date constraints)">
			<origam-date-picker v-model="constrainedDate" :min="minDate" :max="maxDate" data-cy="date-picker-constraints"/>
		</Variant>

		<Variant title="Prop — showWeek">
			<origam-date-picker v-model="showWeekDate" :show-week="true" data-cy="date-picker-show-week"/>
		</Variant>

		<Variant title="Slot — actions">
			<origam-date-picker v-model="slotActionsDate" data-cy="date-picker-slot-actions">
				<template #actions>
					<origam-btn color="primary" text="OK" size="small"/>
					<origam-btn text="Cancel" size="small"/>
				</template>
			</origam-date-picker>
		</Variant>

		<Variant title="Emit — update:modelValue">
			<origam-date-picker
					v-model="emitDate"
					data-cy="date-picker-emit-model-value"
					@update:model-value="logEvent('update:modelValue', $event)"
			/>
		</Variant>

		<Variant title="Events - update:modelValue">
			<origam-date-picker
					v-model="date"
					@update:model-value="logEvent('update:modelValue', $event)"
			/>
		</Variant>

		<Variant title="Events - update:month">
			<origam-date-picker
					v-model="date"
					@update:month="logEvent('update:month', $event)"
			/>
		</Variant>

		<Variant title="Events - update:year">
			<origam-date-picker
					v-model="date"
					@update:year="logEvent('update:year', $event)"
			/>
		</Variant>

		<Variant title="Events - update:viewMode">
			<origam-date-picker
					v-model="date"
					@update:view-mode="logEvent('update:viewMode', $event)"
			/>
		</Variant>

		<Variant title="Slots - Default">
			<origam-date-picker v-model="date">
				<strong>Custom slot content</strong>
			</origam-date-picker>
		</Variant>

		<Variant title="Slots - Title">
			<origam-date-picker v-model="date">
				<template #title>
					<strong>Pick a date</strong>
				</template>
			</origam-date-picker>
		</Variant>

		<Variant title="Slots - Header">
			<origam-date-picker v-model="date">
				<template #header>
					<span>Custom header</span>
				</template>
			</origam-date-picker>
		</Variant>

		<Variant title="Slots - Actions">
			<origam-date-picker v-model="date">
				<template #actions>
					<origam-btn color="primary" text="OK" size="small"/>
					<origam-btn text="Cancel" size="small"/>
				</template>
			</origam-date-picker>
		</Variant>

		<Variant
				title="Default"
				:init-state="() => useStoryInitState<Partial<IDatePickerProps>>({ bgColor: 'primary', viewMode: DATE_MODE.MONTH })"
		>
			<template #default="{ state }">
				<origam-date-picker
						v-model="date"
						v-bind="state"
						data-cy="date-picker-playground"
						@update:model-value="logEvent('update:modelValue', $event)"
				/>
			</template>
			<template #controls="{ state }">
				<StoryGroup title="Design">
					<HstSelect v-model="state.color"     title="Color"     :options="COLOR_OPTIONS"/>
					<HstSelect v-model="state.bgColor"   title="Bg Color"  :options="COLOR_OPTIONS"/>
					<HstSelect v-model="state.rounded"   title="Rounded"   :options="ROUNDED_OPTIONS"/>
					<HstSelect v-model="state.elevation" title="Elevation" :options="ELEVATION_OPTIONS"/>
					<HstSelect v-model="state.density"   title="Density"   :options="DENSITY_OPTIONS"/>
				</StoryGroup>
				<StoryGroup title="Functional">
					<HstCheckbox v-model="state.multiple"    title="Multiple"/>
					<HstCheckbox v-model="state.range"       title="Range"/>
					<HstCheckbox v-model="state.showWeek"    title="Show Week"/>
					<HstCheckbox v-model="state.landscape"   title="Landscape"/>
					<HstCheckbox v-model="state.hideHeader"  title="Hide Header"/>
					<HstCheckbox v-model="state.disabled"    title="Disabled"/>
					<HstText     v-model="state.min"         title="Min (ISO 8601)"/>
					<HstText     v-model="state.max"         title="Max (ISO 8601)"/>
					<HstSelect   v-model="state.viewMode"    title="View Mode" :options="VIEW_MODE_OPTIONS"/>
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

	import { OrigamBtn, OrigamDatePicker } from '@origam/components'
	import { DATE_MODE, CALENDAR_STRATEGY } from '@origam/enums'
	import type { IDatePickerProps } from '@origam/interfaces'

	import StoryGroup from '@stories/components/_shared/StoryGroup.vue'
	import { useStoryInitState } from '@stories/composables'
	import {
		BORDER_OPTIONS,
		BORDER_STYLE_OPTIONS,
		COLOR_OPTIONS,
		DENSITY_OPTIONS,
		ELEVATION_OPTIONS,
		ROUNDED_OPTIONS
	} from '@stories/const'

	const today           = new Date().toISOString().slice(0, 10)
	const date            = ref<string>(today)
	const singleDate      = ref<string>(today)
	const rangeValue      = ref<string[]>([])
	const multipleValue   = ref<string[]>([])
	const constrainedDate = ref<string>(today)
	const showWeekDate    = ref<string>(today)
	const slotActionsDate = ref<string>(today)
	const emitDate        = ref<string>(today)

	const minDate = new Date(new Date().setDate(new Date().getDate() - 30)).toISOString().slice(0, 10)
	const maxDate = new Date(new Date().setDate(new Date().getDate() + 30)).toISOString().slice(0, 10)

	const VIEW_MODE_OPTIONS = [
		{ label: 'Month', value: DATE_MODE.MONTH },
		{ label: 'Months', value: DATE_MODE.MONTHS },
		{ label: 'Years', value: DATE_MODE.YEARS }
	]

	const WEEKS_IN_MONTH_OPTIONS = [
		{ label: 'Static', value: CALENDAR_STRATEGY.STATIC },
		{ label: 'Dynamic', value: CALENDAR_STRATEGY.DYNAMIC }
	]
</script>

<docs lang="md" src="@docs/components/DatePicker/OrigamDatePicker.md"/>
