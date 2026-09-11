<template>
	<div
			:class="datePickerMonthsClasses"
			:style="datePickerMonthsStyles"
	>
		<div class="origam-date-picker-months__content">
			<template v-for="(month, monthIndex) in months">
				<slot
						name="month"
						v-bind="{month, index: monthIndex, props: btnProps(month, monthIndex)}"
				>
					<origam-btn v-bind="btnProps(month, monthIndex)"/>
				</slot>
			</template>
		</div>
	</div>
</template>

<script
		lang="ts"
		setup
>
	import { OrigamBtn } from "../../components"

	import { useDate, useProps, useVModel , useStyle} from "../../composables"

	import type { IDatePickerMonthsProps} from "../../interfaces"

	import type { IDatePickerMonthsEmits } from '../../interfaces/DatePicker/date-picker-months.interface'

	import { convertToUnit, createRange, int } from "../../utils"

	import { computed, StyleValue, watchEffect } from "vue"

	/*********************************************************
	 * Global
	 *
	 * @description
	 * Props, composables and model binding.
	 ********************************************************/

	const props = withDefaults(defineProps<IDatePickerMonthsProps>(), {})

	const emits = defineEmits<IDatePickerMonthsEmits>()

	const {filterProps} = useProps<IDatePickerMonthsProps>(props)

	const adapter = useDate()

	/*********************************************************
	 * Value
	 ********************************************************/

	const model = useVModel(props, 'month', adapter.getMonth(adapter.date()), (v) => {
		return int(v || 0)
	})

	/*********************************************************
	 * Months list
	 *
	 * @description
	 * Computed month entries with disabled state and selection.
	 ********************************************************/

	const months = computed(() => {
		let date = adapter.startOfYear(adapter.date())

		if (props.year) {
			date = adapter.setYear(date, int(props.year))
		}

		return createRange(12).map(i => {
			const text = adapter.format(date, 'monthShort')
			const isDisabled =
					!!(
							(props.min && adapter.isAfter(adapter.startOfMonth(adapter.date(props.min)), date)) ||
							(props.max && adapter.isAfter(date, adapter.startOfMonth(adapter.date(props.max))))
					)
			date = adapter.getNextMonth(date)

			return {
				isDisabled,
				text,
				value: i
			}
		})
	})

	watchEffect(() => {
		model.value = model.value ?? adapter.getMonth(adapter.date())
	})

	/*********************************************************
	 * Item
	 *
	 * @description
	 * Button props factory and click handler for month selection.
	 ********************************************************/

	const btnProps = (month: { isDisabled: boolean, text: string, value: number }, i: number) => {
		return {
			active: model.value === i,
			color: model.value === i ? props.color : undefined,
			disabled: month.isDisabled,
			rounded: true,
			text: month.text,
			key: "month",
			onClick: () => handleClick(i)
		}
	}

	/*********************************************************
	 * Event handlers
	 ********************************************************/

	const handleClick = (i: number) => {
		if (model.value === i) {
			emits('update:month', model.value)
			return
		}

		model.value = i
	}

	/*********************************************************
	 * Class & Style
	 *
	 * @description
	 * Root element classes and inline styles.
	 ********************************************************/

	const datePickerMonthsStyles = computed(() => {
		return [
			{
				height: convertToUnit(props.height)
			},
			props.style
		] as StyleValue
	})
	const datePickerMonthsClasses = computed(() => {
		return [
			'origam-date-picker-months',
			props.class
		]
	})
	const {id, css, load, isLoaded, unload} = useStyle(datePickerMonthsStyles)


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
	.origam-date-picker-months {
		height: 288px;

		&__content {
			align-items: center;
			display: grid;
			flex: 1 1;
			height: inherit;
			justify-content: space-around;
			grid-template-columns: repeat(2, 1fr);
			grid-gap: 0px 24px;
			padding-inline: 36px;

			:deep(.origam-btn) {
				text-transform: none;
				padding-inline: 8px;
			}
		}
	}
</style>
