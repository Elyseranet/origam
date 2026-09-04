<template>
	<origam-input
			v-if="compact"
			:id="id"
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
						:aria-label="t(decrementAriaLabel)"
						@click="handleCompactDecrement"
				/>
				<input
						:id="id"
						v-model="compactInputText"
						type="text"
						inputmode="numeric"
						role="spinbutton"
						class="origam-number-field__compact-input"
						:aria-label="label"
						:aria-valuenow="model ?? undefined"
						:aria-valuemin="min"
						:aria-valuemax="max"
						:aria-valuetext="compactInputText || undefined"
						:aria-required="required ? 'true' : undefined"
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
						:aria-label="t(incrementAriaLabel)"
						@click="handleCompactIncrement"
				/>
			</div>
		</template>
	</origam-input>
	<origam-text-field
			v-else
			:id="id"
			ref="origamTextFieldRef"
			v-model:model-value="inputText"
			:class="numberFieldClasses"
			:style="numberFieldStyles"
			:validation-value="model"
			inputmode="decimal"
			:aria-valuenow="model ?? undefined"
			:aria-valuemin="min"
			:aria-valuemax="max"
			:aria-valuetext="inputText || undefined"
			v-bind="textFieldProps"
			@beforeinput="handleBeforeInput"
			@blur="handleBlur"
			@click="handleClick"
			@focus="handleFocus"
			@keydown="handleKeydown"
			@mousedown="handleMousedown"
			@click:clear="handleClear"
			@click:prepend="handleClickPrepend"
			@click:append="handleClickAppend"
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
	import { computed, getCurrentInstance, nextTick, onMounted, ref, shallowRef, StyleValue, useSlots, watch, watchEffect } from "vue"
	import OrigamBtn from '../Btn/OrigamBtn.vue'
	import OrigamDivider from '../Divider/OrigamDivider.vue'
	import OrigamInput from '../Input/OrigamInput.vue'
	import OrigamTextField from '../TextField/OrigamTextField.vue'

	import { useAdjacent } from '../../composables/Commons/adjacent.composable'
	import { useAdjacentInner } from '../../composables/Commons/adjacentInner.composable'
	import { useFocus } from '../../composables/Commons/focus.composable'
	import { useHold } from '../../composables/NumberField/hold.composable'
	import { useLocale } from '../../composables/Commons/locale.composable'
	import { useProps } from '../../composables/Commons/props.composable'
	import { useVModel } from '../../composables/Commons/vModel.composable'
	import { useStyle } from '../../composables/Commons/style.composable'

	import { UNSEEDED } from '../../consts/Commons/vmodel.const'

	import { DIRECTION } from '../../enums/Commons/direction.enum'
	import { MDI_ICONS } from '../../enums/Commons/mdi.enum'
	import { TEXT_FIELD_TYPE } from '../../enums/TextField/text-field.enum'

	import type { INumberFieldProps, INumberFieldSlots } from '../../interfaces/NumberField/number-field.interface'

	import type { INumberFieldEmits } from '../../interfaces/NumberField/number-field.interface'

	import type { TOrigamInput } from '../../types/Input/input.type'
	import type { TOrigamTextField } from '../../types/TextField/text-field.type'

	import { clamp } from '../../utils/Commons/commons.util'
	import { forwardRefs } from '../../utils/Commons/forwardRefs.util'

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
		type: TEXT_FIELD_TYPE.NUMBER,
		decrementAriaLabel: 'origam.number_field.aria_label.decrement',
		incrementAriaLabel: 'origam.number_field.aria_label.increment'
	})

	const emits = defineEmits<INumberFieldEmits>()

	defineSlots<INumberFieldSlots>()

	const {filterProps} = useProps<INumberFieldProps>(props)

	const {t} = useLocale()

	const vm = getCurrentInstance()

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

	/*********************************************************
	 * click:prepend / click:append relay
	 *
	 * @description
	 * `click:prepend` / `click:append` are declared (inherited via
	 * `IInputEmits extends IAdjacentEmits`) but were never wired (#459):
	 * `<origam-text-field>` DOES emit both — via ITS OWN `useAdjacent()`
	 * call, on its outer prepend/append slot wrapper — but NumberField
	 * never listened for them, so the events reached NumberField's
	 * instance and stopped there. `useAdjacent(props)` here re-uses the
	 * SAME composable to emit on NumberField's OWN instance once the
	 * child's event is relayed to it (see the `@click:prepend` /
	 * `@click:append` listeners on `<origam-text-field>` below) —
	 * mirroring the *Inner relay above exactly.
	 ********************************************************/
	const {
		onClickPrepend: handleClickPrepend,
		onClickAppend: handleClickAppend
	} = useAdjacent(props)

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

	/*********************************************************
	 *  `_inputText` IS LAZY-SEEDED, NOT WRITTEN BY AN IMMEDIATE WATCH
	 *
	 *  @description
	 *  `{immediate: true}` used to run the sync callback below synchronously
	 *  the instant the watch was created, reading `props.modelValue` at that
	 *  exact moment and writing the result into a plain `shallowRef` — so
	 *  nothing re-derived it later on its own. Creating that watch at the
	 *  top level of `setup()` ran the immediate callback before Vue's
	 *  `beforeCreate` hook runs, which is where the ADR-005 theme resolver
	 *  patches `instance.props`; the callback therefore saw whatever Vue
	 *  resolved BEFORE the theme was visible, and a watch created in
	 *  `setup()` only picks up a LATER change through the reactive proxy's
	 *  own per-key dep — which requires a subsequent parent write
	 *  (`props[key] = value`) to fire. A theme naming `modelValue` with no
	 *  accompanying parent re-render never produces one, so the ref stayed
	 *  seeded at the pre-theme value forever.
	 *  `_inputTextRaw` starts UNSEEDED (mirrors `useVModel`'s own fix): as
	 *  long as nothing has explicitly written to it, `_inputText`'s getter
	 *  falls back to deriving the display text from `props.modelValue` LIVE,
	 *  on every read — including the template's first read during render,
	 *  which is already past `beforeCreate`. The moment any code path writes
	 *  through `_inputText.value = …` (user input, clamping, stepping, …)
	 *  the raw ref takes over and the getter returns that instead.
	 ********************************************************/
	const _inputTextRaw = shallowRef<string | null | typeof UNSEEDED>(UNSEEDED)

	const seedInputText = (): string | null => {
		const val = props.modelValue
		if (val == null) return null
		if (!isNaN(val)) return correctPrecision(val)
		return null
	}

	const _inputText = computed<string | null>({
		get: () => _inputTextRaw.value === UNSEEDED ? seedInputText() : _inputTextRaw.value,
		set: (val) => { _inputTextRaw.value = val }
	})

	// Sync from external model changes (parent v-model updates) — no
	// `immediate`, the lazy seed above already covers the initial value.
	watch(() => props.modelValue, (val) => {
		if (isFocused.value && !controlsDisabled.value) return

		if (val == null) {
			_inputText.value = null
		} else if (!isNaN(val)) {
			_inputText.value = correctPrecision(val)
		}
	})
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

	/*********************************************************
	 * Spinbutton role (non-compact input)
	 *
	 * @description
	 * The compact-mode `<input>` sets `role="spinbutton"` directly in the
	 * template (#459) — it is NumberField's own native element. The
	 * non-compact `<input>` is rendered two components deep
	 * (`<origam-text-field>` → `<origam-field>` → the real `<input>`), and
	 * `role` is ALSO a DECLARED prop on `ITextFieldProps` — TextField binds
	 * it to its own `<origam-field>` wrapper (`:role="role"`, matching the
	 * `role="combobox"` pattern OrigamSelect uses), not to the input. That
	 * makes a plain `role="spinbutton"` attribute on `<origam-text-field>`
	 * land on the WRONG element — the field chrome div, not the value-
	 * bearing input `aria-valuenow`/`aria-valuemin`/`aria-valuemax` are
	 * bound to just above (those are NOT declared TextField props, so they
	 * correctly fall through to the real `<input>` via `filterInputAttrs`).
	 * Reaching the real input for `role` specifically needs the same
	 * DOM-querySelector escape hatch already established in
	 * `OrigamSelect.vue`'s `handleMousedownControl` for the same class of
	 * problem. `flush: 'post'` re-runs after the compact/non-compact
	 * branch swaps in the DOM, so toggling `compact` at runtime keeps it
	 * correct instead of only applying once at mount.
	 ********************************************************/
	watchEffect(() => {
		if (props.compact) return

		const root = vm?.proxy?.$el as HTMLElement | undefined
		const input = root?.querySelector?.('input') as HTMLInputElement | null

		input?.setAttribute('role', 'spinbutton')
	}, {flush: 'post'})

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
	const {holdStart, holdStop} = useHold({toggleUpDown}, () => props.holdRepeat, () => props.holdDelay)

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
				'origam-number-field--hide-controls': props.hideControls
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
	const {id, css, load, isLoaded, unload} = useStyle(numberFieldStyles, () => props.id)


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
				cursor: var(--origam-number-field__control---cursor, pointer);
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
