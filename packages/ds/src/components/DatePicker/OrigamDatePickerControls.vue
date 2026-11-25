<template>
	<div
			:id="id"
			:class="datePickerControlsClasses"
			:style="datePickerControlsStyles"
	>

		<origam-btn-group>
			<template #default>
				<origam-btn
						:append-icon="modeIcon"
						:aria-expanded="isMonthsOpen"
						:aria-label="monthLabel"
						:class="monthClasses"
						:disabled="disableMonth"
						:text="text"
						rounded="0"
						@click="handleClickMonth"
				/>

				<origam-btn
						:append-icon="modeIcon"
						:aria-expanded="isYearsOpen"
						:aria-label="yearLabel"
						:class="yearClasses"
						:disabled="disableYear"
						:text="yearText"
						rounded="0"
						@click="handleClickYear"
				/>
			</template>
		</origam-btn-group>

		<origam-spacer key="mode-spacer"/>

		<div
				key="month-buttons"
				class="origam-date-picker-controls__month"
		>
			<origam-btn-group>
				<template #default>
					<origam-btn
							:aria-label="t('origam.date_picker_controls.prev')"
							:disabled="disablePrev"
							:icon="prevIcon"
							:rounded="0"
							@click="handleClickPrev"
					/>

					<origam-btn
							:aria-label="t('origam.date_picker_controls.next')"
							:disabled="disableNext"
							:icon="nextIcon"
							:rounded="0"
							@click="handleClickNext"
					/>
				</template>
			</origam-btn-group>
		</div>
	</div>
</template>

<script
		lang="ts"
		setup
>
	import OrigamBtn from '../Btn/OrigamBtn.vue'
	import OrigamBtnGroup from '../Btn/OrigamBtnGroup.vue'
	import OrigamSpacer from '../Grids/OrigamSpacer.vue'

	import { useUnsupportedProp } from '../../composables/Commons/unsupportedProp.composable'
	import { useLocale } from '../../composables/Commons/locale.composable'
	import { useProps } from '../../composables/Commons/props.composable'
	import { useStyle } from '../../composables/Commons/style.composable'

	import { DATE_MODE } from '../../enums/DatePicker/date-picker.enum'

	import type { IDatePickerControlsProps, IDatePickerControlsEmits, IDatePickerControlsSlots } from '../../interfaces/DatePicker/date-picker-controls.interface'


	import { computed, StyleValue } from "vue"

	/*********************************************************
	 * Global
	 *
	 * @description
	 * Props, emits and composables.
	 ********************************************************/

	const props = withDefaults(defineProps<IDatePickerControlsProps>(), {
		nextIcon: 'mdi:mdi-chevron-right',
		prevIcon: 'mdi:mdi-chevron-left',
		modeIcon: 'mdi:mdi-menu-down-outline',
		viewMode: DATE_MODE.MONTH
	})

	/*********************************************************
	 * Props declarees sans effet (#550, critere C1)
	 *
	 * @description
	 * ⛔ Exposees dans la story, parfois documentees, et pourtant lues
	 * nulle part. Elles ne sont ni retirees — ca casserait la story et le
	 * type d'un consommateur pour une prop qui ne faisait deja rien — ni
	 * cablees a un comportement invente. Elles avertissent une fois, en
	 * dev, avec la raison exacte. Meme traitement que la famille Chart.
	 * (`viewMode` n'en fait plus partie : il pilote `aria-expanded` et le
	 * pivot du chevron des deux boutons mois / annee.)
	 ********************************************************/
	useUnsupportedProp(
		'OrigamDatePickerControls',
		'active',
		'the controls row reflects the picker view state of its parent; it has no active state of its own.',
		() => props.active === true
	)

	const emits = defineEmits<IDatePickerControlsEmits>()

	defineSlots<IDatePickerControlsSlots>()

	const {filterProps} = useProps<IDatePickerControlsProps>(props)

	const {t} = useLocale()

	/*********************************************************
	 * Disabled state
	 *
	 * @description
	 * Per-control disabled flag derived from global and per-control props.
	 ********************************************************/

	const disableMonth = computed(() => {
		return props.disabled || props.disabledMonth
	})
	const disableYear = computed(() => {
		return props.disabled || props.disabledYear
	})
	const disablePrev = computed(() => {
		return props.disabled || props.disabledPrev
	})
	const disableNext = computed(() => {
		return props.disabled || props.disabledNext
	})

	/*********************************************************
	 * Open state & labels
	 *
	 * @description
	 * `viewMode` (passed by the picker) tells which grid is open: the
	 * matching button reflects it through `aria-expanded` and a modifier
	 * class that flips its chevron in CSS.
	 ********************************************************/

	const isMonthsOpen = computed(() => props.viewMode === DATE_MODE.MONTHS)
	const isYearsOpen = computed(() => props.viewMode === DATE_MODE.YEARS)

	const monthClasses = computed(() => [
		'origam-date-picker-controls__month-btn',
		{'origam-date-picker-controls__month-btn--open': isMonthsOpen.value}
	])
	const yearClasses = computed(() => [
		'origam-date-picker-controls__year-btn',
		{'origam-date-picker-controls__year-btn--open': isYearsOpen.value}
	])

	const monthLabel = computed(() => t('origam.date_picker_controls.choose_month', props.text ?? ''))
	const yearLabel = computed(() => t('origam.date_picker_controls.choose_year', props.yearText ?? ''))

	/*********************************************************
	 * Event handlers
	 *
	 * @description
	 * Click handlers for navigation and view-mode controls.
	 ********************************************************/

	const handleClickPrev = () => {
		emits('click:prev')
	}
	const handleClickNext = () => {
		emits('click:next')
	}
	const handleClickYear = () => {
		emits('click:year')
	}
	const handleClickMonth = () => {
		emits('click:month')
	}

	/*********************************************************
	 * Class & Style
	 *
	 * @description
	 * Root element classes and inline styles.
	 ********************************************************/

	const datePickerControlsStyles = computed(() => {
		return [
			props.style
		] as StyleValue
	})
	const datePickerControlsClasses = computed(() => {
		return [
			'origam-date-picker-controls',
			props.class
		]
	})
	const {id, css, load, isLoaded, unload} = useStyle(datePickerControlsStyles, () => props.id)


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
	.origam-date-picker-controls {
		$this: &;

		display: flex;
		align-items: center;
		justify-content: space-between;
		font-size: .875rem;
		padding-top: 4px;
		padding-bottom: 4px;
		padding-inline-start: 6px;
		padding-inline-end: 12px;


		&__month-btn,
		&__year-btn {
			text-transform: none;
			font-weight: 400;
			line-height: initial;
			letter-spacing: initial;

			:deep(.origam-btn__append) {
				transition: transform 0.2s ease;
			}

			&--open :deep(.origam-btn__append) {
				transform: rotate(180deg);
			}

			@media (prefers-reduced-motion: reduce) {
				:deep(.origam-btn__append) {
					transition: none;
				}
			}
		}

		&__date {
			margin-inline-end: 4px;
		}

		&__month {
			display: flex;
		}
	}
</style>
