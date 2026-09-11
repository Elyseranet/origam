<template>
	<Story
			group="components"
			title="DatePicker/OrigamDatePickerMonth"
	>

		<Variant
				title="Design"
				:init-state="() => useStoryInitState<Partial<IDatePickerMonthProps>>({ color: 'primary', month: currentMonth, year: currentYear })"
		>
			<template #default="{ state }">
				<origam-date-picker-month
						:color="state.color"
						:month="state.month ?? currentMonth"
						:year="state.year ?? currentYear"
						:show-week="state.showWeek"
						:hide-weekdays="state.hideWeekdays"
						:show-adjacent-months="state.showAdjacentMonths"
						:weeks-in-month="state.weeksInMonth"
						:first-day-of-week="state.firstDayOfWeek"
				/>
			</template>
			<template #controls="{ state }">
				<StoryGroup title="Color">
					<HstSelect v-model="state.color" title="Color" :options="COLOR_OPTIONS"/>
				</StoryGroup>
				<StoryGroup title="Calendar">
					<HstNumber v-model="state.month" title="Month (0–11)" :min="0" :max="11" :step="1"/>
					<HstNumber v-model="state.year"  title="Year"          :min="2000" :max="2100" :step="1"/>
					<HstNumber v-model="state.firstDayOfWeek" title="First Day of Week (0=Sun, 1=Mon)" :min="0" :max="6" :step="1"/>
				</StoryGroup>
				<StoryGroup title="Rows">
					<HstSelect   v-model="state.weeksInMonth"    title="Weeks In Month" :options="WEEKS_IN_MONTH_OPTIONS"/>
					<HstCheckbox v-model="state.showWeek"        title="Show Week Numbers"/>
					<HstCheckbox v-model="state.hideWeekdays"    title="Hide Weekdays"/>
					<HstCheckbox v-model="state.showAdjacentMonths" title="Show Adjacent Months"/>
				</StoryGroup>
			</template>
		</Variant>

		<Variant
				title="Functional"
				:init-state="() => useStoryInitState<Partial<IDatePickerMonthProps>>({ month: currentMonth, year: currentYear, date: [today] })"
		>
			<template #default="{ state }">
				<origam-date-picker-month
						:month="state.month ?? currentMonth"
						:year="state.year ?? currentYear"
						:date="state.date"
						:multiple="state.multiple"
						:range="state.range"
						:disabled="state.disabled"
						:min="state.min || undefined"
						:max="state.max || undefined"
				/>
			</template>
			<template #controls="{ state }">
				<StoryGroup title="Selection">
					<HstCheckbox v-model="state.multiple" title="Multiple"/>
					<HstCheckbox v-model="state.range"    title="Range"/>
				</StoryGroup>
				<StoryGroup title="States">
					<HstCheckbox v-model="state.disabled" title="Disabled"/>
				</StoryGroup>
				<StoryGroup title="Bounds">
					<HstText v-model="state.min" title="Min (ISO date, e.g. 2026-06-10)"/>
					<HstText v-model="state.max" title="Max (ISO date, e.g. 2026-06-20)"/>
				</StoryGroup>
			</template>
		</Variant>

		<Variant title="Slots - Days">
			<origam-date-picker-month
					:month="currentMonth"
					:year="currentYear"
					color="primary"
			>
				<template #days="{ item }">
					<button
							type="button"
							style="width: 100%; text-align: center; font-size: .7rem; border: none; background: none; cursor: pointer;"
					>{{ item.localized }}</button>
				</template>
			</origam-date-picker-month>
		</Variant>

		<Variant
				title="Default"
				:init-state="() => useStoryInitState<IDatePickerMonthProps>({ color: 'primary', month: currentMonth, year: currentYear, weekdays: [0, 1, 2, 3, 4, 5, 6] })"
		>
			<template #default="{ state }">
				<origam-date-picker-month
						v-bind="state"
						:month="state.month ?? currentMonth"
						:year="state.year ?? currentYear"
				/>
			</template>
			<template #controls="{ state }">
				<StoryGroup title="Design">
					<HstSelect v-model="state.color" title="Color" :options="COLOR_OPTIONS"/>
				</StoryGroup>
				<StoryGroup title="Calendar">
					<HstNumber v-model="state.month"          title="Month (0–11)"                     :min="0"    :max="11"   :step="1"/>
					<HstNumber v-model="state.year"           title="Year"                             :min="2000" :max="2100" :step="1"/>
					<HstNumber v-model="state.firstDayOfWeek" title="First Day of Week (0=Sun, 1=Mon)" :min="0"    :max="6"    :step="1"/>
					<HstSelect v-model="state.weeksInMonth"   title="Weeks In Month"                   :options="WEEKS_IN_MONTH_OPTIONS"/>
				</StoryGroup>
				<StoryGroup title="Functional">
					<HstCheckbox v-model="state.hideWeekdays"      title="Hide Weekdays"/>
					<HstCheckbox v-model="state.showWeek"          title="Show Week Numbers"/>
					<HstCheckbox v-model="state.showAdjacentMonths" title="Show Adjacent Months"/>
					<HstCheckbox v-model="state.multiple"          title="Multiple"/>
					<HstCheckbox v-model="state.range"             title="Range"/>
					<HstCheckbox v-model="state.disabled"          title="Disabled"/>
				</StoryGroup>
			</template>
		</Variant>
	</Story>
</template>

<script
		lang="ts"
		setup
>
	import { OrigamDatePickerMonth } from '@origam/components'
	import { CALENDAR_STRATEGY } from '@origam/enums'
	import type { IDatePickerMonthProps } from '@origam/interfaces'

	import StoryGroup from '@stories/components/_shared/StoryGroup.vue'
	import { useStoryInitState } from '@stories/composables'
	import { COLOR_OPTIONS } from '@stories/const'

	const now          = new Date()
	const currentMonth = now.getMonth()
	const currentYear  = now.getFullYear()
	const today        = now.toISOString().slice(0, 10)

	const WEEKS_IN_MONTH_OPTIONS = [
		{ label: 'Dynamic', value: CALENDAR_STRATEGY.DYNAMIC },
		{ label: 'Static',  value: CALENDAR_STRATEGY.STATIC }
	]
</script>

<docs lang="md" src="@docs/components/DatePicker/OrigamDatePickerMonth.md"/>
