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
				:init-state="() => useStoryInitState<Partial<IDatePickerMonthProps> & { weekdaysPreset: string; weekdaysOnly: boolean; displayValue: string; transitionName: string; reverseTransitionName: string; transitionMode: string }>({
					month: currentMonth,
					year: currentYear,
					date: [today],
					weekdaysPreset: 'all',
					weekdaysOnly: false,
					displayValue: '',
					transitionName: '',
					reverseTransitionName: '',
					transitionMode: TRANSITION_MODE.OUT_IN
				})"
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
						:allowed-dates="state.weekdaysOnly ? isWeekday : undefined"
						:display-value="state.displayValue || undefined"
						:weekdays="WEEKDAYS_SETS[state.weekdaysPreset]"
						:transition="state.transitionName ? { name: state.transitionName, mode: state.transitionMode as TTransitionMode } : undefined"
						:reverse-transition="state.reverseTransitionName ? { name: state.reverseTransitionName, mode: state.transitionMode as TTransitionMode } : undefined"
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
					<HstText     v-model="state.min" title="Min (ISO date, e.g. 2026-06-10)"/>
					<HstText     v-model="state.max" title="Max (ISO date, e.g. 2026-06-20)"/>
					<HstCheckbox v-model="state.weekdaysOnly" title="Allowed Dates — weekdays only"/>
				</StoryGroup>
				<StoryGroup title="Display">
					<HstText   v-model="state.displayValue" title="Display Value (ISO date)"/>
					<HstSelect v-model="state.weekdaysPreset" title="Weekdays" :options="WEEKDAYS_OPTIONS"/>
				</StoryGroup>
				<StoryGroup title="Transitions">
					<HstText   v-model="state.transitionName"        title="Transition Name"/>
					<HstText   v-model="state.reverseTransitionName" title="Reverse Transition Name"/>
					<HstSelect v-model="state.transitionMode"        title="Transition Mode" :options="TRANSITION_MODE_OPTIONS"/>
				</StoryGroup>
			</template>
		</Variant>

		<Variant title="Events - update:date">
			<origam-date-picker-month
					:month="currentMonth"
					:year="currentYear"
					multiple
					data-cy="dp-month-emit-update-date"
					@update:date="logEvent('update:date', $event)"
			/>
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
	import { logEvent } from 'histoire/client'

	import { OrigamDatePickerMonth } from '@origam/components'
	import { CALENDAR_STRATEGY, TRANSITION_MODE } from '@origam/enums'
	import type { IDatePickerMonthProps } from '@origam/interfaces'
	import type { TTransitionMode } from '@origam/types'

	import StoryGroup from '@stories/components/_shared/StoryGroup.vue'
	import { useStoryInitState } from '@stories/composables'
	import { COLOR_OPTIONS } from '@stories/const'

	const now          = new Date()
	const currentMonth = now.getMonth()
	const currentYear  = now.getFullYear()
	const today        = now.toISOString().slice(0, 10)

	const isWeekday = (date: unknown) => {
		const day = new Date(date as string).getDay()

		return day !== 0 && day !== 6
	}

	const WEEKS_IN_MONTH_OPTIONS = [
		{ label: 'Dynamic', value: CALENDAR_STRATEGY.DYNAMIC },
		{ label: 'Static',  value: CALENDAR_STRATEGY.STATIC }
	]

	const WEEKDAYS_SETS: Record<string, Array<number>> = {
		all:      [0, 1, 2, 3, 4, 5, 6],
		workweek: [1, 2, 3, 4, 5],
		weekend:  [0, 6]
	}

	const WEEKDAYS_OPTIONS = [
		{ label: 'All seven',       value: 'all' },
		{ label: 'Monday → Friday', value: 'workweek' },
		{ label: 'Weekend only',    value: 'weekend' }
	]

	const TRANSITION_MODE_OPTIONS = [
		{ label: 'out-in',  value: TRANSITION_MODE.OUT_IN },
		{ label: 'in-out',  value: TRANSITION_MODE.IN_OUT },
		{ label: 'default', value: TRANSITION_MODE.DEFAULT }
	]
</script>

<docs lang="md" src="@docs/components/DatePicker/OrigamDatePickerMonth.md"/>
