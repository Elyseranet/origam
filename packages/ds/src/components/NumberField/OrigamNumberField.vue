<template>
	<origam-input
			v-if="compact"
			ref="origamCompactInputRef"
			v-model="model"
			:validation-value="model"
			:focused="isFocused"
			:rules="rules"
			:error="error"
			:error-messages="errorMessages"
			:hide-details="hideDetails"
			:validate-on="validateOn"
			:max-errors="maxErrors"
			:name="name"
			:disabled="disabled"
			:readonly="readonly"
			:class="compactInputWrapperClasses"
			:style="numberFieldStyles"
	>
		<template #default>
			<div
					:class="compactClasses"
					role="group"
					:aria-label="label"
			>
				<origam-btn
						:icon="MDI_ICONS.MINUS"
						:disabled="!canDecrease"
						size="small"
						data-cy="numberfield-compact-decrement"
						aria-label="Decrement"
						@click="handleCompactDecrement"
				/>
				<input
						v-model="compactInputText"
						type="text"
						inputmode="numeric"
						class="origam-number-field__compact-input"
						:aria-label="label"
						data-cy="numberfield-compact-input"
						@blur="handleBlur"
						@focus="handleFocus"
						@beforeinput="handleBeforeInput"
						@keydown="handleKeydown"
				/>
				<origam-btn
						:icon="MDI_ICONS.PLUS"
						:disabled="!canIncrease"
						size="small"
						data-cy="numberfield-compact-increment"
						aria-label="Increment"
						@click="handleCompactIncrement"
				/>
			</div>
		</template>
	</origam-input>
	<origam-text-field
			v-else
			ref="origamTextFieldRef"
			v-model:model-value="inputText"
			:class="numberFieldClasses"
			:style="numberFieldStyles"
			:validation-value="model"
			inputmode="decimal"
			v-bind="textFieldProps"
			@beforeinput="handleBeforeInput"
			@blur="handleBlur"
			@click="handleClick"
			@focus="handleFocus"
			@keydown="handleKeydown"
			@mousedown="handleMousedown"
			@click:clear="handleClear"
			@click:prepend-inner="handleClickPrependInner"
			@click:append-inner="handleClickAppendInner"
	>
		<template
				v-if="slots.prepend"
				#prepend
		>
			<slot name="prepend"/>
		</template>

		<template
				v-if="slots.field"
				#field="{id, isDisabled, isDirty, isValid, isReadonly}"
		>
			<slot
					name="field"
					v-bind="{id, isDisabled, isDirty, isValid, isReadonly}"
			/>
		</template>

		<template
				v-if="slots.loader"
				#loader
		>
			<slot name="loader"/>
		</template>

		<template #prependInner>
			<div
					v-if="!hideControls"
					class="origam-number-field__control"
			>
				<template v-if="split">
					<slot
							name="increment"
							v-bind="{canIncrease, onControlClick: () => handleIncrementClick, onUpControlMousedown: () => handleUpControlMousedown, onControlMouseup: () => handleControlMouseup}"
					>
						<origam-btn
								key="increment-btn"
								:disabled="!canIncrease"
								:icon="incrementIcon"
								aria-hidden="true"
								flat
								height="100%"
								tabindex="-1"
								@click="handleIncrementClick"
								@pointerdown="handleUpControlMousedown"
								@pointerup="handleControlMouseup"
						/>
					</slot>

					<origam-divider :direction="DIRECTION.VERTICAL"/>
				</template>
			</div>

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

		<template
				v-if="slots.default"
				#default="slotProps"
		>
			<slot
					name="default"
					v-bind="slotProps"
			/>
		</template>

		<template
				v-if="slots.suffix"
				#suffix
		>
			<slot name="suffix"/>
		</template>

		<template
				v-if="hasAppendInner"
				#appendInner
		>
			<div
					v-if="!hideControls"
					class="origam-number-field__control"
			>
				<template v-if="!split">
					<origam-divider :direction="DIRECTION.VERTICAL"/>

					<slot
							name="increment"
							v-bind="{canIncrease, onControlClick: () => handleIncrementClick, onUpControlMousedown: () => handleUpControlMousedown, onControlMouseup: () => handleControlMouseup}"
					>
						<origam-btn
								key="increment-btn"
								:disabled="!canIncrease"
								:icon="incrementIcon"
								aria-hidden="true"
								flat
								height="auto"
								tabindex="-1"
								@click="handleIncrementClick"
								@pointerdown="handleUpControlMousedown"
								@pointerup="handleControlMouseup"
						/>
					</slot>
				</template>

				<origam-divider :direction="DIRECTION.VERTICAL"/>

				<slot
						name="decrement"
						v-bind="{canDecrease, onControlClick: () => handleDecrementClick, onDownControlMousedown: () => handleDownControlMousedown, onControlMouseup: () => handleControlMouseup}"
				>
					<origam-btn
							key="decrement-btn"
							:disabled="!canDecrease"
							:icon="decrementIcon"
							aria-hidden="true"
							flat
							height="auto"
							tabindex="-1"
							@click="handleDecrementClick"
							@pointerdown="handleDownControlMousedown"
							@pointerup="handleControlMouseup"
					/>
				</slot>
			</div>

			<slot name="appendInner"/>
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

		<template
				v-if="slots.details"
				#details="detailsSlotProps"
		>
			<slot
					name="details"
					v-bind="detailsSlotProps"
			/>
		</template>

		<template
				v-if="slots.messages"
				#messages="{hasMessages, messages}"
		>
			<slot
					name="messages"
					v-bind="{hasMessages, messages}"
			/>
		</template>

		<template
				v-if="slots.message"
				#message="{message}"
		>
			<slot
					name="message"
					v-bind="{message}"
			/>
		</template>
	</origam-text-field>
</template>

<script
		lang="ts"
		setup
>
	import { computed, nextTick, onMounted, ref, shallowRef, StyleValue, useSlots, watch } from "vue"
	import { OrigamBtn, OrigamDivider, OrigamInput, OrigamTextField } from "../../components"

	import { useAdjacentInner, useFocus, useHold, useProps, useVModel , useStyle} from "../../composables"

	import { DIRECTION, MDI_ICONS, TEXT_FIELD_TYPE } from "../../enums"

	import type { INumberFieldProps, INumberFieldSlots} from "../../interfaces"

	import type { INumberFieldEmits } from '../../interfaces/NumberField/number-field.interface'

	import type { TOrigamInput, TOrigamTextField } from "../../types"

	import { clamp, forwardRefs } from "../../utils"

	/*********************************************************
	 * Global
	 *
	 * @description
	 * Props, emits, slots and filterProps for the NumberField component.
	 ********************************************************/
	const props = withDefaults(defineProps<INumberFieldProps>(), {
		modelValue: null,
		min: Number.MIN_SAFE_INTEGER,
		max: Number.MAX_SAFE_INTEGER,
		step: 1,
		precision: 0,
		incrementIcon: MDI_ICONS.PLUS,
		decrementIcon: MDI_ICONS.MINUS,
		holdDelay: 500,
		holdRepeat: 50,
		border: true,
		rounded: true,
		centerAffix: true,
		split: false,
		compact: false,
		type: TEXT_FIELD_TYPE.NUMBER
	})

	const emits = defineEmits<INumberFieldEmits>()

	defineSlots<INumberFieldSlots>()

	const {filterProps} = useProps<INumberFieldProps>(props)

	const slots = useSlots()

	const origamTextFieldRef = ref<TOrigamTextField>()
	const origamCompactInputRef = ref<TOrigamInput>()

	/*********************************************************
	 * Disabled / readonly guard
	 *
	 * @description
	 * Pre-fix this called `useForm(omit(props, ['modelValue']))`. That
	 * was wrong on two counts:
	 *   1. `useForm` is the FORM-CREATOR composable — meant for
	 *      `<OrigamForm>`, not for an individual field. Calling it
	 *      inside NumberField mounted a nested `provide(ORIGAM_FORM_KEY)`
	 *      scope, breaking the parent form's child registration.
	 *   2. `useForm` internally calls `useVModel(props, 'modelValue')`
	 *      and writes BOOLEAN values into it (`true` when all children
	 *      pass validation, `false` when any fail). Because `useVModel`
	 *      grabs the current instance via `getCurrentInstance()`, the
	 *      emit landed on the NumberField itself — silently overwriting
	 *      `update:modelValue` with `true` / `false`. Consumer's
	 *      `v-model="numberRef"` then received a boolean instead of a
	 *      number.
	 * `controlsDisabled` only needs `props.disabled` / `props.readonly`
	 * — the field's parent form is consulted via `useValidation`
	 * downstream (in `OrigamInput`).
	 ********************************************************/
	const controlsDisabled = computed(() => !!(props.disabled || props.readonly))

	/*********************************************************
	 * Value & model
	 *
	 * @description
	 * model is the clamped numeric v-model.
	 * inputText is a writable computed that mediates between the raw
	 * string the user types and the clamped numeric model.
	 * _inputText is the internal mutable string buffer.
	 ********************************************************/

	/*********************************************************
	 * Value
	 ********************************************************/

	const model = useVModel(props, 'modelValue', null,
			val => val ?? null,
			val => val == null
					? val ?? null
					: clamp(Number(val), props.min, props.max))

	/*********************************************************
	 * Effect
	 ********************************************************/

	const {isFocused, onFocus, onBlur} = useFocus(props)

	/*********************************************************
	 * Composables
	 ********************************************************/

	const {
		onClickPrependInner: handleClickPrependInner,
		onClickAppendInner: handleClickAppendInner
	} = useAdjacentInner(props)

	const correctPrecision = (val: number | string, precision = props.precision) => {
		// `val` arrives as a number from the model in the happy path,
		// but a parent could legitimately pass a numeric string
		// (`v-model="someStringRef"`, JSON-deserialised payload, etc.).
		// Without coercion, `.toFixed` crashes — strings have no
		// `toFixed` method, but `isNaN("42")` returns `false` so the
		// upstream watch guard lets the string through.
		// We only coerce when needed and keep the original number path
		// untouched to avoid any subtle change in formatting semantics.
		const num = typeof val === 'number' ? val : Number(val)
		if (Number.isNaN(num)) return String(val)
		const fixed = precision == null
				? String(num)
				: num.toFixed(precision)
		return isFocused.value
				? Number(fixed).toString() // trim zeros
				: fixed
	}

	const _inputText = shallowRef<string | null>(null)

	// Sync from external model changes (parent v-model updates)
	watch(() => props.modelValue, (val) => {
		if (isFocused.value && !controlsDisabled.value) return

		if (val == null) {
			_inputText.value = null
		} else if (!isNaN(val)) {
			_inputText.value = correctPrecision(val)
		}
	}, { immediate: true })
	const inputText = computed<string | null>({
		get: () => _inputText.value,
		set (val) {
			if (val === null || val === '') {
				model.value = null
				_inputText.value = null
			} else if (!isNaN(Number(val)) && Number(val) <= props.max && Number(val) >= props.min) {
				model.value = Number(val)
				_inputText.value = val
			}
		}
	})

	/*********************************************************
	 * Increment / decrement guards
	 *
	 * @description
	 * canIncrease / canDecrease gate the step buttons.
	 * toggleUpDown performs the actual increment or decrement.
	 * inferPrecision derives the required decimal precision from the
	 * current value and step.
	 ********************************************************/
	const canIncrease = computed(() => {
		if (controlsDisabled.value) return false
		return (model.value ?? 0) as number + props.step <= props.max
	})
	const canDecrease = computed(() => {
		if (controlsDisabled.value) return false
		return (model.value ?? 0) as number - props.step >= props.min
	})

	watch(() => props.precision, () => formatInputValue())

	onMounted(() => {
		clampModel()
	})

	const inferPrecision = (value: number | null) => {
		if (value == null) return 0

		const str = value.toString()
		const idx = str.indexOf('.')

		return ~idx ? str.length - idx : 0
	}

	const toggleUpDown = (increment = true) => {
		if (controlsDisabled.value) return

		if (model.value == null) {
			inputText.value = correctPrecision(clamp(0, props.min, props.max))
			return
		}

		let inferredPrecision = Math.max(inferPrecision(model.value), inferPrecision(props.step))

		if (props.precision != null) inferredPrecision = Math.max(inferredPrecision, props.precision)

		if (increment) {
			if (canIncrease.value) {
				inputText.value = correctPrecision(model.value + props.step, inferredPrecision)
				emits('increment', model.value)
			}
		} else {
			if (canDecrease.value) {
				inputText.value = correctPrecision(model.value - props.step, inferredPrecision)
				emits('decrement', model.value)
			}
		}
	}

	/*********************************************************
	 * Hold (long-press repeat)
	 *
	 * @description
	 * useHold fires toggleUpDown repeatedly while the user holds
	 * a step button, respecting holdDelay and holdRepeat props.
	 ********************************************************/
	const {holdStart, holdStop} = useHold({toggleUpDown}, props.holdRepeat, props.holdDelay)

	/*********************************************************
	 * Event handlers
	 *
	 * @description
	 * Input, keydown, pointer and mouse handlers for the field
	 * and step buttons.
	 ********************************************************/
	const handleBeforeInput = (e: InputEvent) => {
		if (!e.data) return

		const existingTxt = (e.target as HTMLInputElement)?.value
		const selectionStart = (e.target as HTMLInputElement)?.selectionStart
		const selectionEnd = (e.target as HTMLInputElement)?.selectionEnd
		const potentialNewInputVal =
				existingTxt
						? existingTxt.slice(0, selectionStart as number | undefined) + e.data + existingTxt.slice(selectionEnd as number | undefined)
						: e.data

		if (!/^-?(\d+(\.\d*)?|(\.\d+)|\d*|\.)$/.test(potentialNewInputVal)) {
			e.preventDefault()
		}

		if (props.precision == null) return

		// Ignore decimal digits above precision limit
		if (potentialNewInputVal.split('.')[1]?.length > props.precision) {
			e.preventDefault()
		}
		// Ignore decimal separator when precision = 0
		if (props.precision === 0 && potentialNewInputVal.includes('.')) {
			e.preventDefault()
		}
	}
	const handleKeydown = async (e: KeyboardEvent) => {
		if (
				['Enter', 'ArrowLeft', 'ArrowRight', 'Backspace', 'Delete', 'Tab'].includes(e.key) ||
				e.ctrlKey
		) return

		if (['ArrowDown', 'ArrowUp'].includes(e.key)) {
			e.preventDefault()
			clampModel()
			// _model is controlled, so need to wait until props['modelValue'] is updated
			await nextTick()
			if (e.key === 'ArrowDown') {
				toggleUpDown(false)
			} else {
				toggleUpDown()
			}
		}
	}
	const handleIncrementClick = (e: MouseEvent) => {
		e.stopPropagation()
	}
	const handleDecrementClick = (e: MouseEvent) => {
		e.stopPropagation()
	}
	const handleControlMouseup = (e: PointerEvent) => {
		const el = e.currentTarget as HTMLElement

		el?.releasePointerCapture(e.pointerId)

		e.preventDefault()
		e.stopPropagation()

		holdStop()
	}
	const handleUpControlMousedown = (e: PointerEvent) => {
		const el = e.currentTarget as HTMLElement

		el?.setPointerCapture(e.pointerId)

		e.preventDefault()
		e.stopPropagation()

		holdStart('up')
	}
	const handleDownControlMousedown = (e: PointerEvent) => {
		const el = e.currentTarget as HTMLElement

		el?.setPointerCapture(e.pointerId)

		e.preventDefault()
		e.stopPropagation()

		holdStart('down')
	}
	const handleMousedown = (e: MouseEvent) => {
		emits('mousedown:control', e)
	}
	const handleClick = (e: MouseEvent) => {
		emits('click:control', e)
	}
	const handleClear = (e: MouseEvent) => {
		emits('click:clear', e)
	}

	const clampModel = () => {
		if (controlsDisabled.value) return

		const actualText = _inputText.value ?? origamTextFieldRef.value?.value ?? null

		if (actualText && !isNaN(Number(actualText))) {
			const clamped = clamp(Number(actualText), props.min, props.max)
			model.value = clamped
			_inputText.value = correctPrecision(clamped)
		} else {
			model.value = null
			_inputText.value = null
		}
	}
	const formatInputValue = () => {
		if (controlsDisabled.value) return

		if (_inputText.value === null) {
			_inputText.value = null
			return
		}

		const numVal = Number(_inputText.value)

		if (isNaN(numVal)) {
			_inputText.value = null
			return
		}

		_inputText.value = props.precision == null
				? String(numVal)
				: numVal.toFixed(props.precision)
	}
	const trimDecimalZeros = () => {
		if (controlsDisabled.value) return

		if (_inputText.value === null) return

		const numVal = Number(_inputText.value)

		if (isNaN(numVal)) {
			_inputText.value = null
			return
		}

		_inputText.value = numVal.toString()
	}

	const handleFocus = () => {
		onFocus()
		trimDecimalZeros()
	}
	const handleBlur = () => {
		onBlur()
		clampModel()
	}

	/*********************************************************
	 * Forwarded props & slot guards
	 *
	 * @description
	 * textFieldProps filters and forwards relevant props to the inner
	 * OrigamTextField instance.
	 * hasAppendInner guards the appendInner slot template.
	 ********************************************************/

	/*********************************************************
	 * Forwarded props
	 ********************************************************/

	const textFieldProps = computed(() => {
		return origamTextFieldRef.value?.filterProps(props, ['modelValue', 'class', 'style', 'validationValue'])
	})

	const hasAppendInner = computed(() => {
		return slots.appendInner || !props.hideControls
	})

	/*********************************************************
	 * Class & Style
	 *
	 * @description
	 * numberFieldClasses / numberFieldStyles compose the BEM root.
	 * compactClasses applies the compact mode modifier.
	 ********************************************************/
	const numberFieldClasses = computed(() => {
		return [
			'origam-number-field',
			{
				'origam-number-field--hide-input': props.hideInput,
				'origam-number-field--inset': props.inset,
				'origam-number-field--split': props.split,
				'origam-number-field--hide-controls': props.hideControls,
				'origam-number-field--reverse': props.reverse
			},
			props.class
		]
	})
	const numberFieldStyles = computed(() => {
		return [
			props.style
		] as StyleValue
	})

	const compactClasses = computed(() => {
		return [
			'origam-number-field',
			'origam-number-field--compact'
		]
	})

	const compactInputWrapperClasses = computed(() => {
		return [
			'origam-number-field__compact-wrapper',
			props.class
		]
	})

	const compactInputText = computed<string>({
		get: () => model.value != null ? String(model.value) : '',
		set (val: string) {
			if (val === '') {
				model.value = null
			} else if (!isNaN(Number(val))) {
				const clamped = clamp(Number(val), props.min, props.max)
				model.value = clamped
			}
		}
	})

	const handleCompactIncrement = () => {
		toggleUpDown(true)
	}

	const handleCompactDecrement = () => {
		toggleUpDown(false)
	}
	const {id, css, load, isLoaded, unload} = useStyle(numberFieldStyles)


	/*********************************************************
	 * Expose
	 *
	 * @description
	 * Forwards TextField ref members plus filterProps.
	 ********************************************************/
	defineExpose(forwardRefs({filterProps,
		css,
		id,
		load,
		unload,
		isLoaded
	}, origamTextFieldRef, origamCompactInputRef))

</script>

<style
		lang="scss"
		scoped
>
	.origam-number-field {
		$this: &;

		:deep(input[type=number]) {
			-moz-appearance: textfield;

			&::-webkit-outer-spin-button,
			&::-webkit-inner-spin-button {
				-webkit-appearance: none;
			}
		}

		:deep(.origam-field) {
			.origam-field__prepend-inner {
				&:has(.origam-number-field__control) {
					> .origam-icon {
						margin-inline-end: 12px;
					}
				}
			}

			.origam-field__append-inner {
				&:has(.origam-number-field__control) {
					> .origam-icon {
						margin-inline-end: 12px;
					}
				}
			}
		}

		:deep(.origam-field--appended) {
			--origam-field---padding-end: 0;
		}

		&__control {
			display: flex;
			height: 100%;

			.origam-btn {
				background-color: var(--origam-number-field__control---background-color, transparent);
				border-radius: var(--origam-number-field__control---border-radius, 0);
			}
		}

		&--inset {
			.origam-divider {
				height: 55%;
				width: 55%;
				align-self: center
			}
		}

		&--split {
			:deep(.origam-field__input) {
				text-align: center;
			}

			:deep(.origam-field--prepended) {
				--origam-field---padding-start: 0;
			}
		}

		&--hide-input {
			:deep(.origam-field) {
				flex: none;
			}

			:deep(.origam-field__input) {
				width: 0;
				padding-inline: 0;
			}
		}

		&--compact {
			display: inline-flex;
			align-items: center;
			gap: var(--origam-number-field--compact---gap, 8px);

			.origam-number-field__compact-input {
				width: var(--origam-number-field--compact__input---width, 3em);
				text-align: center;
				font-variant-numeric: tabular-nums;
				border: 0;
				background: transparent;
				padding: 0;
				color: inherit;
				font-size: inherit;
				font-family: inherit;
				outline: none;
			}
		}
	}

	.origam-number-field__compact-wrapper {
		display: inline-grid;
		width: fit-content;

		:deep(.origam-input__control) {
			display: inline-flex;
		}
	}
</style>
