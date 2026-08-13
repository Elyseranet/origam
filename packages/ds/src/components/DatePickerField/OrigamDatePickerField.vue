<template>
	<origam-text-field
			ref="origamTextFieldRef"
			v-model:focused="isFocused"
			:aria-label="t(label)"
			:class="datePickerFieldClasses"
			:counter-value="counterValue"
			:dirty="isDirty"
			:placeholder="placeholder"
			:style="datePickerFieldStyles"
			:title="t(label)"
			:validation-value="validationValue"
			v-bind="{ ...textFieldProps }"
			@blur="handleBlur"
			@change="handleChange"
			@click:clear="handleClear"
			@mousedown:control="handleMousedownControl"
	>
		<template
				v-if="slots.prepend"
				#prepend
		>
			<slot name="prepend"/>
		</template>

		<template
				v-if="slots.loader"
				#loader
		>
			<slot name="loader"/>
		</template>

		<template
				v-if="slots.prependInner"
				#prependInner
		>
			<slot name="prependInner"/>
		</template>

		<template
				v-if="slots.floatingLabel"
				#floatingLabel
		>
			<slot name="floatingLabel"/>
		</template>

		<template
				v-if="slots.label"
				#label
		>
			<slot name="label"/>
		</template>

		<template
				v-if="slots.prefix"
				#prefix
		>
			<slot name="prefix"/>
		</template>

		<template #default>
			<origam-menu
					ref="origamMenuRef"
					v-model="menu"
					:close-on-content-click="false"
					:disabled="menuDisabled"
					:location="BLOCK.BOTTOM"
					:open-on-click="false"
					activator="parent"
					content-class="origam-date-picker-field__content"
					v-bind="{ ...menuProps }"
					@after-leave="handleAfterLeave"
			>

				<template #default>
					<origam-date-picker
							ref="origamDatePickerRef"
							:model-value="(model as (string | Date)[])"
							v-bind="(datePickerProps as Record<string, unknown>)"
							@update:model-value="(handleSelectDate as (v: any) => void)"
					/>
				</template>
			</origam-menu>

			<template v-if="selectedValues">
				<template v-if="isRange">
					<span class="origam-date-picker-field__selection-text">
            <slot name="rangeSelection">
              {{ t('origam.date_picker_range_field.text', selectedValues[0], selectedValues[1]) }}
            </slot>
          </span>
				</template>
				<template v-else>
					<template
							v-for="(item, index) in selectedValues"
							:key="index"
					>
						<div
								:class="datePickerFieldSelectionChipsClasses"
								:style="[textColorStyles]"
						>
							<template v-if="isMultiple">
								<slot
										name="chip"
										v-bind="{ item, index, props: chipSlotProps(item) }"
								>
									<origam-chip
											key="chip"
											ref="origamChipsRef"
											v-bind="chipSlotProps(item)"
									>
										<template #default>
											<slot name="selection">
												{{ item }}
											</slot>
										</template>
									</origam-chip>
								</slot>
							</template>
							<template v-else>
			          <span class="origam-date-picker-field__selection-text">
			            <slot name="selection">
			              {{ item }}
			            </slot>
			          </span>
							</template>
						</div>
					</template>
				</template>
			</template>
		</template>

		<template
				v-if="slots.suffix"
				#suffix
		>
			<slot name="suffix"/>
		</template>

		<template #appendInner>
			<slot name="appendInner">
				<origam-avatar
						v-if="appendInnerAvatar"
						key="append-avatar"
						:density="density"
						:image="appendInnerAvatar"
				/>
				<origam-icon
						v-if="appendInnerIcon"
						key="append-icon"
						:density="density"
						:icon="appendInnerIcon"
				/>
			</slot>
		</template>

		<template
				v-if="slots.clear"
				#clear
		>
			<slot name="clear"/>
		</template>

		<template
				v-if="slots.append"
				#append
		>
			<slot name="append"/>
		</template>
	</origam-text-field>
</template>

<script
		lang="ts"
		setup
>
	import {
		OrigamAvatar,
		OrigamChip,
		OrigamDatePicker,
		OrigamIcon,
		OrigamMenu,
		OrigamTextField,
		OrigamTranslateScale
	} from "../../components"

	import { useDate, useDefaults, useLocale, useProps, useTeleportTypography, useTextColor, useVModel , useStyle} from "../../composables"

	import { ORIGAM_FORM_KEY } from "../../consts"

	import { BLOCK, DENSITY, DIRECTION, KEYBOARD_VALUES, MDI_ICONS, TEXT_FIELD_TYPE } from "../../enums"

	import type { IDatePickerFieldProps, IDatePickerProps } from "../../interfaces"

	import type { TOrigamDatePicker, TOrigamMenu, TOrigamTextField, TTransitionProps } from "../../types"

	import { forwardRefs, isEmpty, matchesSelector, wrapInArray } from "../../utils"

	import { computed, inject, nextTick, ref, shallowRef, StyleValue, toRef, useSlots, watch } from "vue"

	/*********************************************************
	 * Global
	 ********************************************************/
	const _props = withDefaults(defineProps<IDatePickerFieldProps>(), {
		type: TEXT_FIELD_TYPE.TEXT,
		centerAffix: true,
		direction: DIRECTION.HORIZONTAL,
		density: DENSITY.DEFAULT,
		border: true,
		rounded: true,
		modelValue: null,
		appendInnerIcon: MDI_ICONS.CALENDAR_OUTLINE,
		transition: () => ({component: OrigamTranslateScale}) as unknown as TTransitionProps,
		closeText: 'origam.close',
		openText: 'origam.open',
		range: false,
		closeOnSelect: true
	})

	// `useDefaults` resolves each prop against theme.components['origam-date-picker-field']
	// (OrigamBtn pattern). Pre-fix, the legacy `rounded: true` / `border: true`
	// booleans always won, same forwarding-parity gap already fixed on Select.
	const props = useDefaults(_props)

	const {filterProps} = useProps<IDatePickerFieldProps>(props)

	const {t} = useLocale()

	const origamTextFieldRef = ref<TOrigamTextField>()
	const origamMenuRef = ref<TOrigamMenu>()
	const origamDatePickerRef = ref<TOrigamDatePicker>()

	const slots = useSlots()

	/*********************************************************
	 * Value & adapter
	 ********************************************************/
	const model = useVModel(
			props,
			'modelValue',
			[],
			(v) => wrapInArray(v),
			(v) => props.range || props.multiple ? v : v[0]
	)

	const adapter = useDate()

	const handleSelectDate = (dates: string | Array<string>) => {
		model.value = wrapInArray(dates)

		nextTick(() => {
			if (closeOnSelect.value) {
				menu.value = false
			}
		})
	}
	const handleRemoveDate = (date: string) => {
		const index = model.value.findIndex((selection) => selection === date)

		const value = [...model.value]

		value.splice(index, 1)
		model.value = value
	}

	/*********************************************************
	 * Color
	 ********************************************************/
	// Phase 3 (Vague B) — class-first companion alongside inline styles.
	// `textColorClasses` carries the global `.origam--color-{intent}` for
	// tokenised values; `textColorStyles` keeps the legacy fallback path.
	const {textColorClasses, textColorStyles} = useTextColor(toRef(props, 'color'))

	/*********************************************************
	 * Menu state & selection
	 ********************************************************/
	const menuState = useVModel(props, 'menu')
	const menu = computed<boolean>({
		get: () => menuState.value,
		set: (v) => {
			if (menuState.value && !v && origamMenuRef.value?.openChildren) {
				return
			}

			menuState.value = v
		}
	})

	const selectedValues = computed(() => {
		let selectedDates = [...model.value]

		if (isRange.value) {
			selectedDates = [model.value[0], model.value[model.value.length - 1]]
		}

		return selectedDates.map((selection) => {
			return adapter.format(adapter.date(selection), 'keyboardDate')
		})
	})

	const hasSelectedValues = computed(() => {
		return !isEmpty(selectedValues.value)
	})

	const isMultiple = computed(() => {
		return props.multiple && model.value.length > 1
	})
	const isRange = computed(() => {
		return props.range && model.value.length > 1
	})

	const isFocused = shallowRef(false)
	const form = inject(ORIGAM_FORM_KEY, null)

	const menuDisabled = computed(() => {
		return props.readonly || form?.isReadonly.value
	})

	// Typography bridge across the teleport — see `useTeleportTypography` for
	// the full rationale. The calendar's weekday header, week-number column
	// and day numbers, plus the popup title when one is set, size themselves
	// with `rem`-based tokens, so they need the field's REAL font-size
	// republished as those specific tokens, not just inherited.
	const { typographyStyles: menuTypographyStyles } = useTeleportTypography(origamTextFieldRef, menu, (fontSize) => ({
		'--origam-picker-title---font-size': fontSize,
		'--origam-date-picker-month__weekday---font-size': fontSize,
		'--origam-date-picker-month__weeks---font-size': fontSize,
		'--origam-date-picker-month__day---font-size': fontSize
	}))

	const menuProps = computed(() => {
		const consumerContentProps = (props.menuProps?.contentProps ?? {}) as Record<string, any>

		return {
			...props.menuProps,
			activatorProps: {
				...(props.menuProps?.activatorProps || {}),
				'aria-haspopup': 'datepickerbox' // Set aria-haspopup to 'listbox'
			},
			contentProps: {
				...consumerContentProps,
				// The consumer's own style is listed last so it still wins —
				// the bridge is a default, not a lock.
				style: [menuTypographyStyles.value, consumerContentProps.style]
			}
		}
	})

	/*********************************************************
	 * Event handlers
	 ********************************************************/
	const handleClear = () => {
		model.value = []

		if (props.openOnClear) {
			menu.value = true
		}
	}
	const handleMousedownControl = () => {
		if (menuDisabled.value) return

		menu.value = !menu.value
	}
	const handleBlur = (e: FocusEvent) => {
		if (!origamDatePickerRef.value?.$el.contains(e.relatedTarget as HTMLElement)) {
			menu.value = false
		}

		if (hasSelectedValues.value) {
			isFocused.value = true
		}
	}
	const handleChange = () => {
		if (matchesSelector(origamTextFieldRef.value, ':autofill') || matchesSelector(origamTextFieldRef.value, ':-webkit-autofill')) {
			// (e.target as HTMLInputElement).value
			// TODO -  Select date
		}
	}
	const handleAfterLeave = () => {
		if (isFocused.value) {
			origamTextFieldRef.value?.focus()
		}
	}

	/*********************************************************
	 * Chips
	 ********************************************************/
	const chipSlotProps = (item: string): Record<string, unknown> => {
		return {
			closable: props.closableChips,
			bgColor: 'rgba(168, 168, 168, 1)',
			color: 'rgb(255, 255, 255)',
			border: true,
			rounded: true,
			'onClick:close': (e: Event) => handleChipClose(e, item),
			onKeydown: (e: KeyboardEvent) => handleChipKeydown(e, item),
			onMousedown: (e: MouseEvent) => handleChipMousedown(e),
			modelValue: true,
			size: 'small',
			...props.chipProps
		}
	}

	const handleChipClose = (e: Event, item: string) => {
		e.stopPropagation()
		e.preventDefault()

		handleRemoveDate(item)
	}
	const handleChipKeydown = (e: KeyboardEvent, item: string) => {
		if (e.key !== KEYBOARD_VALUES.ENTER && e.key !== KEYBOARD_VALUES.EMPTY) return

		e.preventDefault()
		e.stopPropagation()

		handleChipClose(e, item)
	}
	const handleChipMousedown = (e: MouseEvent) => {
		e.preventDefault()
		e.stopPropagation()
	}

	/*********************************************************
	 * Forwarded props
	 ********************************************************/
	const textFieldProps = computed(() => {
		return origamTextFieldRef.value?.filterProps(props, ['class', 'id', 'style', 'dirty', 'modelValue', 'placeholder', 'validationValue', 'focused'])
	})

	const datePickerProps = computed(() => {
		// Same exclusion list as `OrigamColorPickerField` —
		// the field's `rounded: true` / `border: true` defaults are
		// meant for the trigger outline, NOT the popup. Forwarding
		// them down made the inner `<origam-date-picker>` apply the
		// Sheet's `--rounded` modifier (24px), which doesn't match
		// the popup menu's 8px corner — visible gap at the corners.
		// Cast: props is IDatePickerFieldProps (superset). filterProps on the child
		// ref expects T=IDatePickerProps. The cast is safe — all IDatePickerProps
		// keys are present in IDatePickerFieldProps.
		return origamDatePickerRef.value?.filterProps(
			props as unknown as IDatePickerProps,
			['class', 'id', 'style', 'modelValue',
			'rounded', 'border', 'borderColor', 'borderStyle',
			'density', 'direction']
		)
	})

	/*********************************************************
	 * Validation
	 ********************************************************/
	const validationValue = computed(() => model.value)

	/*********************************************************
	 * Derived state
	 ********************************************************/
	const isDirty = computed(() => {
		return model.value.length > 0
	})
	const placeholder = computed(() => {
		return isDirty.value || (!isFocused.value && props.label && !props.persistentPlaceholder) ? undefined : props.placeholder
	})
	const label = computed(() => {
		return menu.value ? props.closeText : props.openText
	})
	const closeOnSelect = computed(() => {
		return props.closeOnSelect && !(props.multiple || props.range)
	})

	watch(selectedValues, () => {
		isFocused.value = hasSelectedValues.value
	}, {
		immediate: true,
		deep: true
	})

	/*********************************************************
	 * Class & Style
	 ********************************************************/
	const datePickerFieldStyles = computed(() => {
		return [
			props.style
		] as StyleValue
	})
	const datePickerFieldSelectionChipsClasses = computed(() => {
		return [
			'origam-date-picker-field__selection-chips',
			textColorClasses.value
		]
	})
	const datePickerFieldClasses = computed(() => {
		return [
			'origam-date-picker-field',
			`origam-date-picker-field--${props.range ? 'range' : 'single'}`,
			{
				'origam-date-picker-field--active-menu': menu.value
			},
			props.class
		]
	})
	const {id, css, load, isLoaded, unload} = useStyle(datePickerFieldStyles)


	/*********************************************************
	 * Expose
	 ********************************************************/
	defineExpose(forwardRefs({
		filterProps,
		isFocused,
		menu,
		css,
		id,
		load,
		unload,
		isLoaded
	}, origamTextFieldRef))
</script>

<style
		lang="scss"
		scoped
>
	.origam-date-picker-field {
		:deep(.origam-date-picker-field__selection-text) {
			overflow: hidden;
			text-overflow: ellipsis;
			white-space: nowrap;
			min-width: 0;
		}

		// Same single-line fix as OrigamSelect / OrigamColorPickerField: the
		// underlying native `<input>` is taken OUT of flow so it can't sit
		// beside the formatted `selectionText`/`rangeSelection` span and push
		// the field onto a second line. The span is the real display value;
		// the input only carries focus / the editable value. `nowrap` alone
		// is insufficient — the in-flow input still forces a wrap in a
		// narrow container (confirmed: 61px vs 36px at 150px width on the
		// range variant).
		:deep(.origam-field__input) {
			flex-wrap: nowrap;

			> input {
				position: absolute;
				flex: 0 0;
				min-width: 0;
			}
		}
	}
</style>

