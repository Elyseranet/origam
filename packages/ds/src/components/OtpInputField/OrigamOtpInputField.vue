<template>
	<div
			:class="otpInputFieldClasses"
			:style="otpInputFieldStyles"
			v-bind="{ ...rootAttrs }"
	>
		<div
				ref="contentRef"
				:style="dimensionStyles"
				class="origam-otp-input-field__content"
		>
			<template
					v-for="(_, i) in fields"
					:key="i"
			>
				<template v-if="divider && i !== 0">
					<span class="origam-otp-input-field__divider">
						{{ divider }}
					</span>
				</template>

				<origam-field
						ref="origamFieldRef"
						:focused="(isFocused && focusAll) || focusIndex === i"
						v-bind="{...fieldProps(i)}"
				>
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
						<input
								ref="inputRef"
								:aria-label="t('origam.input.otp', i + 1)"
								:autofocus="i === 0 && autofocus"
								:disabled="disabled"
								:inputmode="type === 'number' ? 'numeric' : 'text'"
								:maxlength="i === 0 ? length : '1'"
								:min="type === 'number' ? 0 : undefined"
								:placeholder="placeholder"
								:type="type === 'number' ? 'text' : type"
								:value="model[i]"
								autocomplete="one-time-code"
								class="origam-otp-input-field__field"
								:style="typographyStyles"
								@blur="handleBlur"
								@focus="handleFocus($event, i)"
								@input="handleInput"
								@keydown="handleKeydown"
								@paste="handlePaste(i, $event)"
						/>
					</template>

					<template
							v-if="slots.suffix"
							#suffix
					>
						<slot name="suffix"/>
					</template>

					<template
							v-if="slots.appendInner"
							#appendInner
					>
						<slot name="appendInner"/>
					</template>

					<template
							v-if="slots.clear"
							#clear
					>
						<slot name="clear"/>
					</template>
				</origam-field>
			</template>

			<input
					:value="model.join('')"
					class="origam-otp-input-field__input"
					type="hidden"
					v-bind="{ ...inputAttrs }"
			/>

			<origam-overlay
					:model-value="!!loading"
					contained
					content-class="origam-otp-input-field__loader"
					persistent
			>
				<template #loader>
					<slot name="loader">
						<origam-progress
								:color="typeof loading === 'string' ? loading : undefined"
								:size="24"
								:type="PROGRESS_TYPE.CIRCULAR"
								indeterminate
								width="2"
						/>
					</slot>
				</template>
			</origam-overlay>

			<slot name="default"/>
		</div>

		<div
				v-if="hasDetails"
				class="origam-otp-input-field__details"
		>
			<origam-messages
					:id="messagesId"
					:active="hasMessages"
					:messages="validationMessages"
			/>
		</div>
	</div>
</template>

<script
		lang="ts"
		setup
>

	import { computed, nextTick, ref, StyleValue, useAttrs, useSlots, watch } from "vue"
	import { OrigamField, OrigamOverlay, OrigamProgress } from "../../components"
	import { OrigamMessages } from "../../components/Messages"

	import { useDimension, useFocus, useLocale, useProps, useTypography, useValidation, useVModel, useStyle } from "../../composables"

	import { OTP_INPUT_FIELD_TYPE, PROGRESS_TYPE } from "../../enums"

	import type { IOtpInputFieldProps, IOtpInputFieldSlots } from "../../interfaces"

	import type { IOtpInputFieldEmits } from '../../interfaces/OtpInputField/otp-input-field.interface'

	import type { TOrigamField } from "../../types"

	import { filterInputAttrs, focusChild, forwardRefs, getUid, wrapInArray } from "../../utils"

	/*********************************************************
	 * Global
	 *
	 * @description
	 * Props, emits, slots and filterProps for the OtpInputField component.
	 ********************************************************/
	const props = withDefaults(defineProps<IOtpInputFieldProps>(), {
		type: OTP_INPUT_FIELD_TYPE.NUMBER,
		length: 6
	})

	const emits = defineEmits<IOtpInputFieldEmits>()

	defineSlots<IOtpInputFieldSlots>()

	const { filterProps } = useProps<IOtpInputFieldProps>(props)

	const { t } = useLocale()
	const attrs = useAttrs()
	const slots = useSlots()

	/*********************************************************
	 * Identity
	 ********************************************************/

	const uid = getUid()
	const id = computed(() => props.id || `otp-input-field-${uid}`)
	const messagesId = computed(() => `${id.value}-messages`)

	/*********************************************************
	 * Composables
	 ********************************************************/

	const { dimensionStyles } = useDimension(props)

	/*********************************************************
	 * Effect
	 ********************************************************/

	const { isFocused, onFocus: focus, onBlur: blur } = useFocus(props)

	/*********************************************************
	 * Value & model
	 *
	 * @description
	 * model is a char-array split from the string v-model value.
	 * length / fields drive the rendered cell count.
	 ********************************************************/

	const model = useVModel(
		props,
		'modelValue',
		'',
		(val) => val == null ? [] : String(val).split(''),
		(val) => val.join('')
	)

	const length = computed(() => {
		return Number(props.length)
	})
	const fields = computed(() => {
		return Array(length.value).fill(0)
	})

	const otpStringValue = computed(() => model.value.join(''))

	/*********************************************************
	 * Validation
	 *
	 * @description
	 * useValidation evaluates `props.rules` against the joined OTP
	 * string (otpStringValue). A Proxy wraps props so that both
	 * `modelValue` and `validationValue` accesses transparently
	 * return the reactive OTP string — without duplicating the
	 * useVModel wiring that already lives above.
	 * `validationMessages` mirrors the `messages` computed from
	 * OrigamInput: errorMessages take precedence, then hint, then
	 * props.messages.
	 ********************************************************/
	const {
		errorMessages,
		isPristine,
		isValid,
		isValidating,
		reset: resetValidation,
		validate,
		validationClasses
	} = useValidation(
		new Proxy(props, {
			get(target, key) {
				if (key === 'modelValue' || key === 'validationValue') {
					return otpStringValue.value
				}
				return (target as any)[key]
			}
		}),
		'origam-otp-input-field',
		id
	)

	const validationMessages = computed(() => {
		if (props.errorMessages?.length || (!isPristine.value && errorMessages.value.length)) {
			return errorMessages.value
		} else if (props.hint && (props.persistentHint || isFocused.value)) {
			return wrapInArray(props.hint)
		}
		return wrapInArray(props.messages ?? [])
	})

	const hasMessages = computed(() => validationMessages.value.length > 0)
	const hasDetails = computed(() => {
		if (props.hideDetails === true) return false
		if (props.hideDetails === 'auto') return hasMessages.value
		return true
	})

	/*********************************************************
	 * DOM refs
	 *
	 * @description
	 * focusIndex tracks which cell currently has focus (-1 = none).
	 * contentRef is the scrollable wrapper used by focusChild.
	 * inputRef holds native <input> references, one per cell.
	 * origamFieldRef holds OrigamField component references.
	 * current is the currently focused native input.
	 ********************************************************/
	const focusIndex = ref(-1)

	const contentRef = ref<HTMLElement>()
	const inputRef = ref<Array<HTMLInputElement>>([])
	const origamFieldRef = ref<Array<TOrigamField>>([])

	const current = computed(() => {
		return inputRef.value[focusIndex.value]
	})

	const [rootAttrs, inputAttrs] = filterInputAttrs(attrs)

	const fieldProps = (index: number) => {
		return origamFieldRef.value?.[index]?.filterProps(props, ['class', 'style', 'id', 'label'])
	}

	/*********************************************************
	 * Event handlers
	 *
	 * @description
	 * handleInput, handleKeydown, handlePaste manage OTP cell navigation.
	 * handleFocus / handleBlur track focusIndex and isFocused state.
	 * reset is exposed for external programmatic clearing.
	 * isInvalidValue guards non-numeric characters in number mode.
	 ********************************************************/
	const handleInput = () => {
		if (!current.value) return

		// The maxlength attribute doesn't work for the number type input, so the text type is used.
		// The following logic simulates the behavior of a number input.
		if (isInvalidValue(current.value.value)) {
			current.value.value = ''
			return
		}

		const array = model.value.slice()
		const value = current.value.value

		array[focusIndex.value] = value

		let target: any = null

		if (focusIndex.value > model.value.length) {
			target = model.value.length + 1
		} else if (focusIndex.value + 1 !== length.value) {
			target = 'next'
		}

		model.value = array

		if (target) focusChild(contentRef.value!, target)
	}

	const handleKeydown = (e: KeyboardEvent) => {
		const array = model.value.slice()
		const index = focusIndex.value
		let target: 'next' | 'prev' | 'first' | 'last' | number | null = null

		if (![
			'ArrowLeft',
			'ArrowRight',
			'Backspace',
			'Delete'
		].includes(e.key)) return

		e.preventDefault()

		if (e.key === 'ArrowLeft') {
			target = 'prev'
		} else if (e.key === 'ArrowRight') {
			target = 'next'
		} else if (['Backspace', 'Delete'].includes(e.key)) {
			array[focusIndex.value] = ''

			model.value = array

			if (focusIndex.value > 0 && e.key === 'Backspace') {
				target = 'prev'
			} else {
				requestAnimationFrame(() => {
					inputRef.value[index]?.select()
				})
			}
		}

		requestAnimationFrame(() => {
			if (target != null) {
				focusChild(contentRef.value!, target)
			}
		})
	}

	const handlePaste = (index: number, e: ClipboardEvent) => {
		e.preventDefault()
		e.stopPropagation()

		const clipboardText = e?.clipboardData?.getData('Text').slice(0, length.value) ?? ''

		if (isInvalidValue(clipboardText)) return

		model.value = clipboardText.split('')

		inputRef.value?.[index].blur()
	}

	const reset = () => {
		model.value = []
	}

	const handleFocus = (_e: FocusEvent, index: number) => {
		if (!isFocused.value) focus()

		focusIndex.value = index
	}

	const handleBlur = () => {
		blur()

		focusIndex.value = -1
	}

	const isInvalidValue = (value: string) => {
		return props.type === OTP_INPUT_FIELD_TYPE.NUMBER && /[^0-9]/g.test(value)
	}

	watch(model, (val) => {
		if (val.length === length.value) {
			emits('finish', val.join(''))
			validate()
		}
	}, { deep: true })

	watch(focusIndex, (val) => {
		if (val < 0) return

		nextTick(() => {
			inputRef.value[val]?.select()
		})
	})

	/*********************************************************
	 * Class & Style
	 *
	 * @description
	 * otpInputFieldStyles and otpInputFieldClasses compose the BEM root.
	 ********************************************************/
	const { typographyStyles } = useTypography(props, 'otp-input-field__cell')

	const otpInputFieldStyles = computed(() => {
		return [
			props.style
		] as StyleValue
	})
	const otpInputFieldClasses = computed(() => {
		return [
			'origam-otp-input-field',
			{
				'origam-otp-input-field--divided': !!props.divider
			},
			validationClasses.value,
			props.class
		]
	})
	const { id: styleId, css, load, isLoaded, unload } = useStyle(otpInputFieldStyles)


	/*********************************************************
	 * Expose
	 *
	 * @description
	 * Exposes blur, focus, reset, resetValidation, validate, isValid,
	 * isValidating, errorMessages, isFocused and filterProps to
	 * parent ref consumers.
	 ********************************************************/
	defineExpose(forwardRefs({
		blur: () => {
			inputRef.value?.forEach(input => input.blur())
		},
		focus: () => {
			inputRef.value?.[0]?.focus()
		},
		reset,
		resetValidation,
		validate,
		isValid,
		isValidating,
		errorMessages,
		isFocused,
		filterProps,
		css,
		id,
		styleId,
		load,
		unload,
		isLoaded
	}))

</script>

<style
		lang="scss"
		scoped
>
	.origam-otp-input-field {
		$this: &;

		align-items: center;
		display: flex;
		flex-direction: column;
		justify-content: center;
		padding: var(--origam-otp-input-field---padding-block, .5rem) 0;
		position: relative;
		border-radius: var(--origam-otp-input-field---border-radius, 4px);

		.origam-field {
			height: 100%;
			--origam-field---padding-start: 0;
			--origam-field---padding-end: 0;
		}

		&__divider {
			margin: 0 var(--origam-otp-input-field__divider---margin-inline, 8px);
		}

		&__content {
			align-items: center;
			display: flex;
			gap: var(--origam-otp-input-field---gap, .5rem);
			height: var(--origam-otp-input-field__content---height, 64px);
			padding: var(--origam-otp-input-field__content---padding, .5rem);
			justify-content: center;
			max-width: var(--origam-otp-input-field__content---max-width, 320px);
			position: relative;
			border-radius: inherit;
		}

		&__field {
			color: var(--origam-otp-input-field__cell---color, inherit);
			font-size: var(--origam-otp-input-field__cell---font-size, 1.25rem);
			height: 100%;
			outline: var(--origam-otp-input-field__cell---outline, none);
			text-align: var(--origam-otp-input-field__cell---text-align, center);
			width: 100%;
			border: var(--origam-otp-input-field__cell---border, none);
			background: var(--origam-otp-input-field__cell---background, transparent);

			&[type=number]::-webkit-outer-spin-button,
			&[type=number]::-webkit-inner-spin-button {
				-webkit-appearance: none;
				margin: 0;
			}

			&[type=number] {
				-moz-appearance: textfield;
			}
		}

		&__loader {
			align-items: center;
			display: flex;
			height: 100%;
			justify-content: center;
			width: 100%;

			.origam-progress {
				position: absolute;
			}
		}

		&__details {
			align-items: flex-end;
			display: flex;
			font-size: 0.75rem;
			font-weight: 400;
			letter-spacing: 0.0333333333em;
			line-height: 1;
			min-height: 22px;
			padding-top: 6px;
			overflow: hidden;
			justify-content: space-between;
			width: 100%;
			padding-inline: var(--origam-otp-input-field__details---padding-inline, 4px);
		}

		&--error {
			#{$this}__details {
				> .origam-messages {
					color: var(--origam-otp-input-field---error-color, var(--origam-color__feedback--danger---fg-subtle));
					opacity: 1;
				}
			}
		}

		&--divided {
			#{$this}__content {
				max-width: var(--origam-otp-input-field__content---max-width-divided, 360px);
			}
		}
	}

</style>
