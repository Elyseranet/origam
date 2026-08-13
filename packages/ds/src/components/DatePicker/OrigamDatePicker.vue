<template>
	<origam-picker
			ref="origamPickerRef"
			:class="datePickerClasses"
			:style="datePickerStyles"
			:title="t(title)"
			v-bind="{...pickerProps}"
	>
		<template
				v-if="slots.title"
				#title
		>
			<slot name="title"/>
		</template>

		<template
				v-if="slots.header"
				#header
		>
			<slot
					name="header"
					v-bind="headerProps"
			>
				<origam-date-picker-header
						key="header"
						ref="origamDatePickerHeaderRef"
						v-bind="{ ...datePickerHeaderProps, ...headerProps }"
						@click="!viewModeIsMonth ? handleClickDate : undefined"
				/>
			</slot>
		</template>

		<slot name="default">
			<origam-date-picker-controls
					ref="origamDatePickerControlsRef"
					:text="text"
					v-bind="{...datePickerControlsProps, ...disabledControlers}"
					@click:next="handleClickNext"
					@click:prev="handleClickPrev"
					@click:month="handleClickMonth"
					@click:year="handleClickYear"
			/>

			<origam-fade>
				<template v-if="viewModeIsMonths">
					<origam-date-picker-months
							key="date-picker-months"
							ref="origamDatePickerMonthsRef"
							v-model:month="month"
							:max="maxDate"
							:min="minDate"
							:year="year"
							v-bind="{ ...datePickerMonthsProps }"
							@update:month="handleUpdateMonth"
					/>
				</template>

				<template v-else-if="viewModeIsYears">
					<origam-date-picker-years
							key="date-picker-years"
							ref="origamDatePickerYearsRef"
							v-model:year="year"
							:max="maxDate"
							:min="minDate"
							v-bind="{ ...datePickerYearsProps }"
							@update:year="handleUpdateMonth"
					/>
				</template>

				<template v-else>
					<origam-date-picker-month
							key="date-picker-month"
							ref="origamDatePickerMonthRef"
							v-model:date="model"
							v-model:month="month"
							v-model:year="year"
							:max="maxDate"
							:min="minDate"
							v-bind="{ ...datePickerMonthProps }"
							@update:month="handleUpdateMonth"
							@update:year="handleUpdateYear"
					/>
				</template>
			</origam-fade>
		</slot>

		<template
				v-if="slots.actions"
				#actions
		>
			<slot name="actions"/>
		</template>
	</origam-picker>
</template>

<script
		lang="ts"
		setup
>
	import {
		OrigamDatePickerControls,
		OrigamDatePickerHeader,
		OrigamDatePickerMonth,
		OrigamDatePickerMonths,
		OrigamDatePickerYears,
		OrigamFade,
		OrigamPicker,
		OrigamReverseTranslatePicker,
		OrigamTranslatePicker
	} from "../../components"

	import { useDate, useLocale, useProps, useVModel , useStyle} from "../../composables"

	import { CALENDAR_STRATEGY, DATE_MODE } from "../../enums"

	import type { IDatePickerControlsProps, IDatePickerProps} from "../../interfaces"

	import type { IDatePickerEmits, IDatePickerSlots } from '../../interfaces/DatePicker/date-picker.interface'

	import type {
		TOrigamDatePickerControls,
		TOrigamDatePickerHeader,
		TOrigamDatePickerMonth,
		TOrigamDatePickerMonths,
		TOrigamDatePickerYears,
		TOrigamPicker
	} from "../../types"

	import { wrapInArray } from "../../utils"

	import { computed, ref, shallowRef, StyleValue, useSlots, watch } from "vue"

	/*********************************************************
	 * Global
	 *
	 * @description
	 * Props, emits, composables and top-level refs.
	 ********************************************************/

	const props = withDefaults(defineProps<IDatePickerProps>(), {
		weeksInMonth: CALENDAR_STRATEGY.STATIC,
		title: 'origam.date_picker.title',
		header: 'origam.date_picker.header'
	})

	const emits = defineEmits<IDatePickerEmits>()

	defineSlots<IDatePickerSlots>()

	const slots = useSlots()
	const {filterProps} = useProps<IDatePickerProps>(props)

	const {t} = useLocale()

	const adapter = useDate()

	/*********************************************************
	 * Value
	 *
	 * @description
	 * Model binding, view-mode state and date internals.
	 ********************************************************/

	const model = useVModel(
			props,
			'modelValue',
			undefined,
			(v) => wrapInArray(v),
			(v) => props.multiple || props.range ? v : v[0]
	)

	const viewMode = useVModel(props, 'viewMode')

	const viewModeIsMonth = computed(() => {
		return viewMode.value === DATE_MODE.MONTH
	})
	const viewModeIsMonths = computed(() => {
		return viewMode.value === DATE_MODE.MONTHS
	})
	const viewModeIsYears = computed(() => {
		return viewMode.value === DATE_MODE.YEARS
	})

	const internal = computed(() => {
		const value = adapter.date(model.value?.[0])

		return value && adapter.isValid(value) ? value : adapter.date()
	})

	const month = ref(Number(props.month ?? adapter.getMonth(adapter.startOfMonth(internal.value))))
	const year = ref(Number(props.year ?? adapter.getYear(adapter.startOfYear(adapter.setMonth(internal.value, month.value)))))

	const isReversing = shallowRef(false)

	const header = computed(() => {
		if ((props.multiple || props.range) && model.value?.length > 1) {
			return t('origam.date_picker.items_selected', model.value?.length)
		}

		return (model.value?.[0] && adapter.isValid(model.value?.[0]))
				? adapter.format(adapter.date(model.value?.[0]), 'normalDateWithWeekday')
				: t(props.header)
	})

	const text = computed(() => {
		let date = adapter.date()

		date = adapter.setDate(date, 1)
		date = adapter.setMonth(date, month.value)
		date = adapter.setYear(date, year.value)

		return adapter.format(date, 'monthAndYear')
	})

	const headerTransition = computed(() => {
		return {
			component: isReversing.value ? OrigamReverseTranslatePicker : OrigamTranslatePicker
		}
	})

	const minDate = computed(() => {
		const date = adapter.date(props.min)

		return props.min && adapter.isValid(date) ? date : null
	})
	const maxDate = computed(() => {
		const date = adapter.date(props.max)

		return props.max && adapter.isValid(date) ? date : null
	})

	/*********************************************************
	 * Disabled controls
	 *
	 * @description
	 * Computes which navigation controls should be disabled based on min/max constraints.
	 ********************************************************/

	const disabledControlers = computed(() => {
		if (props.disabled) return {disabled: props.disabled}

		const targets = {
			disabledMonth: props.disabledMonth,
			disabledYear: props.disabledYear,
			disabledNext: props.disabledNext,
			disabledPrev: props.disabledPrev
		}

		if (viewModeIsMonth.value) {
			targets.disabledNext = true
			targets.disabledPrev = true
		} else {
			let _date = adapter.date()

			_date = adapter.setYear(_date, year.value)
			_date = adapter.setMonth(_date, month.value)

			if (minDate.value) {
				const date = adapter.addDays(adapter.startOfMonth(_date), -1)

				if (adapter.isAfter(minDate.value, date)) {
					targets.disabledPrev = true
				}
			}

			if (maxDate.value) {
				const date = adapter.addDays(adapter.endOfMonth(_date), 1)

				if (adapter.isAfter(date, maxDate.value)) {
					targets.disabledNext = true
				}
			}
		}

		return targets
	})

	/*********************************************************
	 * Event handlers
	 *
	 * @description
	 * Navigation and view-mode click handlers.
	 ********************************************************/

	const handleClickNext = () => {
		if (month.value < 11) {
			month.value++
		} else {
			year.value++
			month.value = 0
			handleUpdateYear(year.value)
		}
		handleUpdateMonth(month.value)
	}
	const handleClickPrev = () => {
		if (month.value > 0) {
			month.value--
		} else {
			year.value--
			month.value = 11
			handleUpdateYear(year.value)
		}
		handleUpdateMonth(month.value)
	}
	const handleClickDate = () => {
		viewMode.value = DATE_MODE.MONTH
	}
	const handleClickMonth = () => {
		viewMode.value = viewModeIsMonths.value ? DATE_MODE.MONTH : DATE_MODE.MONTHS
	}
	const handleClickYear = () => {
		viewMode.value = viewModeIsYears.value ? DATE_MODE.MONTH : DATE_MODE.YEARS
	}
	const handleUpdateMonth = (value: number) => {
		if (viewModeIsMonths.value) handleClickMonth()

		emits('update:month', value)
	}
	const handleUpdateYear = (value: number) => {
		if (viewModeIsYears.value) handleClickYear()

		emits('update:year', value)
	}

	watch(model, (val, oldVal) => {
		const arrBefore = wrapInArray(oldVal)
		const arrAfter = wrapInArray(val)

		if (!arrAfter.length) return

		const before = adapter.date(arrBefore[arrBefore.length - 1])
		const after = adapter.date(arrAfter[arrAfter.length - 1])
		const newMonth = adapter.getMonth(after)
		const newYear = adapter.getYear(after)

		if (newMonth !== month.value) {
			month.value = newMonth
			handleUpdateMonth(month.value)
		}

		if (newYear !== year.value) {
			year.value = newYear
			handleUpdateYear(year.value)
		}

		isReversing.value = adapter.isBefore(before, after)
	})

	/*********************************************************
	 * Props forwarding
	 *
	 * @description
	 * Filtered props passed down to child picker sub-components.
	 ********************************************************/

	const origamPickerRef = ref<TOrigamPicker>()
	const origamDatePickerControlsRef = ref<TOrigamDatePickerControls>()
	const origamDatePickerHeaderRef = ref<TOrigamDatePickerHeader>()
	const origamDatePickerMonthRef = ref<TOrigamDatePickerMonth>()
	const origamDatePickerMonthsRef = ref<TOrigamDatePickerMonths>()
	const origamDatePickerYearsRef = ref<TOrigamDatePickerYears>()

	/*********************************************************
	 * Forwarded props
	 ********************************************************/

	const pickerProps = computed(() => {
		return origamPickerRef.value?.filterProps(props, ['class', 'style', 'title', 'id'])
	})
	const datePickerControlsProps = computed(() => {
		// Cast: `props` is IDatePickerProps ⊃ IDatePickerControlsProps.
		// filterProps is typed against the child's T=IDatePickerControlsProps and
		// its <U extends Partial<ExtractPropTypes<T>>> constraint rejects the wider
		// type. The cast is safe — every key of IDatePickerControlsProps is present
		// in IDatePickerProps.
		return origamDatePickerControlsRef.value?.filterProps(
			props as unknown as IDatePickerControlsProps,
			['class', 'style', 'id', 'text', 'disabled']
		)
	})
	const datePickerHeaderProps = computed(() => {
		return origamDatePickerHeaderRef.value?.filterProps(props, ['class', 'style', 'header', 'id'])
	})
	const datePickerMonthProps = computed(() => {
		return origamDatePickerMonthRef.value?.filterProps(props, ['class', 'style', 'id', 'date', 'min', 'max', 'year', 'month'])
	})
	const datePickerMonthsProps = computed(() => {
		return origamDatePickerMonthsRef.value?.filterProps(props, ['class', 'style', 'id', 'month', 'min', 'max', 'year'])
	})
	const datePickerYearsProps = computed(() => {
		return origamDatePickerYearsRef.value?.filterProps(props, ['class', 'style', 'id', 'year', 'min', 'max'])
	})

	const headerProps = computed(() => {
		return {
			header: header.value,
			transition: headerTransition.value
		}
	})

	/*********************************************************
	 * Class & Style
	 *
	 * @description
	 * Root element classes and inline styles.
	 ********************************************************/

	const datePickerStyles = computed(() => {
		return [
			props.style
		] as StyleValue
	})
	const datePickerClasses = computed(() => {
		return [
			'origam-date-picker',
			`origam-date-picker--${viewMode.value}`,
			{
				'origam-date-picker--show-week': props.showWeek
			},
			props.class
		]
	})
	const {id, css, load, isLoaded, unload} = useStyle(datePickerStyles)


	/*********************************************************
	 * Expose
	 *
	 * @description
	 * Public API surface exposed to parent components.
	 ********************************************************/

	defineExpose({
		filterProps,
		css,
		id,
		load,
		unload,
		isLoaded
	})
</script>

<style
		lang="scss"
		scoped
>
	.origam-date-picker {
		$this: &;

		overflow: hidden;
		width: 328px;

		&--show-week {
			width: 368px;
		}

		&--year {
			:deep(.origam-date-picker-controls) {
				.origam-date-picker-controls__mode-btn {
					transform: rotate(180deg);
				}
			}
		}

		&__title {
			display: inline-block
		}
	}
</style>

