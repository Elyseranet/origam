<template>
	<origam-input
			ref="origamInputRef"
			v-model="model"
			:class="textFieldClasses"
			:focused="isFocused"
			:style="textFieldStyles"
			v-bind="{...rootAttrs, ...inputProps, rules: enrichedRules}"
			@click:prepend="handleClickPrepend"
			@click:append="handleClickAppend"
	>
		<template
				v-if="slots.prepend"
				#prepend
		>
			<slot name="prepend"/>
		</template>

		<template #default="{id, isDisabled, isDirty, isValid, isReadonly}">
			<slot
					name="field"
					v-bind="{id, isDisabled, isDirty, isValid, isReadonly}"
			>
				<origam-field
						:id="id"
						ref="origamFieldRef"
						:active="isActive || isDirty"
						:dirty="isDirty || dirty"
						:disabled="isDisabled"
						:error="isValid === false"
						:focused="isFocused"
						:role="role"
						v-bind="{...fieldProps}"
						@click="handleControlClick"
						@mousedown="handleControlMousedown"
						@click:clear="handleClear"
						@click:prepend-inner="handleClickPrependInner"
						@click:append-inner="handleClickAppendInner"
				>
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

					<template #default="{class: fieldSlotClass, ref, ...fieldSlotProps}">
						<div
								:class="fieldSlotClass"
								data-no-activator=""
						>
							<slot
									name="default"
									v-bind="{ref, ...fieldSlotProps}"
							/>
							<input
									ref="inputRef"
									v-intersect="intersect"
									:autofocus="autofocus"
									:disabled="isDisabled"
									:name="name"
									:placeholder="placeholder"
									:readonly="isReadonly"
									:required="required || undefined"
									:aria-required="required ? 'true' : undefined"
									:size="1"
									:type="resolvedInputType"
									:value="displayValue"
									:aria-invalid="ariaInvalid"
									v-bind="{ ...fieldSlotProps, ...inputAttrs }"
									@blur="handleBlur"
									@focus="handleFocus"
									@input="handleInput"
									@paste="handlePaste"
							>
						</div>
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
			</slot>
		</template>

		<template
				v-if="slots.append"
				#append
		>
			<slot name="append"/>
		</template>

		<template
				v-if="hasDetails"
				#details="detailsSlotProps"
		>
			<slot
					name="details"
					v-bind="detailsSlotProps"
			>
				<origam-counter
						:active="persistentCounter || isFocused"
						:disabled="disabled"
						:max="max"
						:value="counterValue"
				>
					<template
							v-if="slots.counter"
							#default="{counter, value, max}"
					>
						<slot
								name="counter"
								v-bind="{counter, value, max}"
						/>
					</template>
				</origam-counter>
			</slot>
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
	</origam-input>
</template><script
		lang="ts"
		setup
>
	import { computed, nextTick, ref, toRef, StyleValue, useAttrs, useSlots, watch } from 'vue'
	import { OrigamCounter, OrigamField, OrigamInput } from '../../components'

	import {
	useAdjacent,
	useAdjacentInner,
	useDefaults,
	useFocus,
	useLocale,
	useMask,
	useProps,
	useStyle,
	useVModel
} from '../../composables'

	import { ACTIVE_TEXT_FIELD_TYPE, INPUT_TEXT_FIELD_TYPE } from '../../consts'

	import { vIntersect } from '../../directives'

	import { DENSITY, DIRECTION, MDI_ICONS, TEXT_FIELD_TYPE } from '../../enums'

	import type { ITextFieldProps, ITextFieldSlots} from '../../interfaces'

	import type { ITextFieldEmits } from '../../interfaces/TextField/text-field.interface'

	import type { TOrigamField, TOrigamInput } from "../../types"

	import { applyMask, filterInputAttrs, forwardRefs, resolveMaskConfig } from '../../utils'

	/*********************************************************
	 * Global
	 *
	 * @description
	 * Props, emits, slots and composables.
	 ********************************************************/

	const _props = withDefaults(defineProps<ITextFieldProps>(), {
		type: TEXT_FIELD_TYPE.TEXT,
		centerAffix: true,
		direction: DIRECTION.HORIZONTAL,
		density: DENSITY.DEFAULT,
		clearIcon: MDI_ICONS.CLOSE_CIRCLE_OUTLINE,
		rounded: true
	})
	const props = useDefaults(_props)

	const emits = defineEmits<ITextFieldEmits>()

	defineSlots<ITextFieldSlots>()
	const slots = useSlots()

	const attrs = useAttrs()

	const {t} = useLocale()

	/*********************************************************
	 * Value
	 ********************************************************/

	const model = useVModel(props, 'modelValue')
	const {isFocused, onFocus, onBlur: handleBlur} = useFocus(props)

	/*********************************************************
	 * Composables
	 ********************************************************/

	const {
		onClickPrependInner: handleClickPrependInner,
		onClickAppendInner: handleClickAppendInner
	} = useAdjacentInner(props)

	/*********************************************************
	 * Icon
	 ********************************************************/

	const {
		onClickPrepend: handleClickPrepend,
		onClickAppend: handleClickAppend
	} = useAdjacent(props, toRef(props, 'prependIcon'), toRef(props, 'appendIcon'))

	/*********************************************************
	 * Counter
	 *
	 * @description
	 * Counter value and max calculation for character counting.
	 ********************************************************/

	const counterValue = computed(() => {
		if (typeof props.counterValue === 'function') {
			return props.counterValue(model.value)
		}

		if (props.counterValue) {
			return props.counterValue
		}

		return (model.value ?? '').toString().length
	})
	const max = computed(() => {
		if (attrs.maxlength) return attrs.maxlength as unknown as undefined

		if (!props.counter || (typeof props.counter !== 'number' && typeof props.counter !== 'string')) {
			return undefined
		}

		return props.counter
	})

	/*********************************************************
	 * Intersection
	 *
	 * @description
	 * Autofocus via IntersectionObserver on first paint.
	 ********************************************************/

	const intersect = computed(() => {
		return [{
			handler: handleIntersect
		}, null, ['once']]
	})
	const handleIntersect = (isIntersecting: boolean, entries: IntersectionObserverEntry[]) => {
		if (!props.autofocus || !isIntersecting) return

		(entries[0].target as HTMLInputElement)?.focus?.()
	}

	/*********************************************************
	 * Refs & active state
	 *
	 * @description
	 * Template refs for input, field and outer input container.
	 ********************************************************/

	const origamInputRef = ref<TOrigamInput>()
	const origamFieldRef = ref<TOrigamField>()
	const inputRef = ref<HTMLInputElement>()

	const isActive = computed(() => {
		return ACTIVE_TEXT_FIELD_TYPE.includes(props.type) || props.persistentPlaceholder || isFocused.value || props.active
	})

	/*********************************************************
	 * Event handlers
	 *
	 * @description
	 * Focus, control click/mousedown, clear and input handlers.
	 ********************************************************/

	const handleFocus = () => {
		nextTick(() => {
			const input: HTMLInputElement | undefined = inputRef.value

			if (input && input !== document.activeElement) {
				input.focus()
			}
		})

		if (!isFocused.value) onFocus()
	}
	const handleControlMousedown = (e: MouseEvent) => {
		emits('mousedown:control', e)

		if (e.target === inputRef.value) return

		handleFocus()
		e.preventDefault()
	}
	const handleControlClick = (e: MouseEvent) => {
		handleFocus()

		emits('click:control', e)
	}
	const handleClear = (e: MouseEvent) => {
		e.stopPropagation()

		handleFocus()

		nextTick(() => {
			model.value = null

			emits('click:clear', e)
		})
	}
	/*********************************************************
	 * Mask
	 *
	 * @description
	 * Optional autoformat + validation layer driven by the
	 * `mask` prop. When active:
	 *   - `model` (v-model) stores the UNMASKED value.
	 *   - the DOM input displays the MASKED value.
	 *   - `@valid` / `@complete` reflect the live state.
	 ********************************************************/

	const maskConfig = computed(() => resolveMaskConfig(props.mask ?? null))
	const hasMask = computed(() => maskConfig.value !== null)

	// Pipe the v-model through the mask engine. The composable
	// reformats whenever `model` mutates externally.
	const {
		masked: maskedValue,
		unmasked: unmaskedValue,
		isValid: maskIsValid,
		complete: maskComplete
	} = useMask(model, toRef(props, 'mask'))

	const displayValue = computed(() => {
		return hasMask.value ? maskedValue.value : (model.value ?? '')
	})

	const ariaInvalid = computed<boolean | undefined>(() => {
		if (!hasMask.value) return undefined
		// Only flag invalidity once the user has touched the
		// field — pristine state stays neutral.
		if (!isFocused.value && !model.value) return undefined
		return !maskIsValid.value
	})

	const resolvedInputType = computed(() => {
		if (!hasMask.value) return props.type
		const pattern = maskConfig.value?.pattern ?? ''
		// Heuristic: phone-shaped patterns benefit from
		// `tel` for mobile keyboard hints, the rest stay
		// `text` to keep punctuation reachable.
		if (typeof props.mask === 'string' && props.mask.startsWith('phone')) {
			return 'tel'
		}
		// Pure-digit patterns get `tel` too — same UX win
		// (numeric keypad on mobile).
		if (pattern && /^[#\s+()\-./]+$/.test(pattern)) {
			return 'tel'
		}
		return props.type
	})

	// External @valid / @complete emissions.
	watch(maskIsValid, (v) => {
		if (hasMask.value) emits('valid', v)
	}, {immediate: false})

	watch(maskComplete, (c) => {
		if (hasMask.value) emits('complete', {complete: c, unmasked: unmaskedValue.value})
	}, {immediate: false})

	const handleInput = (e: Event) => {
		const el = e.target as HTMLInputElement

		if (hasMask.value) {
			// Run the raw DOM string through the engine; the
			// composable picks up the new `model` and updates
			// `masked` / `isValid` reactively.
			const cfg = maskConfig.value
			const tokens = cfg?.pattern ?? ''
			const r = applyMask(el.value, tokens)
			model.value = r.unmasked
			nextTick(() => {
				// Keep DOM in sync with the formatted value
				// (some chars may have been silently dropped).
				if (el.value !== r.masked) el.value = r.masked
				const pos = r.masked.length
				try { el.setSelectionRange(pos, pos) } catch (err) { void err }
			})
			return
		}

		model.value = el.value

		if (typeof props.modelModifiers === 'string' && INPUT_TEXT_FIELD_TYPE.includes(props.type)) {
			const caretPosition = [el.selectionStart, el.selectionEnd]

			nextTick(() => {
				el.selectionStart = caretPosition[0]
				el.selectionEnd = caretPosition[1]
			})
		}
	}

	const handlePaste = (e: ClipboardEvent) => {
		if (!hasMask.value) return
		const text = e.clipboardData?.getData('text') ?? ''
		if (!text) return
		e.preventDefault()
		const cfg = maskConfig.value
		if (!cfg) return
		// Append clipboard text to current unmasked, then
		// re-run the engine for "append on paste" UX.
		const merged = (unmaskedValue.value ?? '') + text
		const r = applyMask(merged, cfg.pattern)
		model.value = r.unmasked
	}

	/*********************************************************
	 * Props forwarding
	 *
	 * @description
	 * Filtered attrs and props passed down to inner components.
	 ********************************************************/

	const hasCounter = computed(() => {
		return slots.counter || (props.counter !== false && props.counter != null)
	})
	const hasDetails = computed(() => {
		return hasCounter.value || slots.details
	})

	const enrichedRules = computed(() => {
		const base = Array.isArray(props.rules) ? [...props.rules] : []

		if (props.counter && typeof props.counter === 'number') {
			const limit = props.counter
			base.push((v: string) => !v || v.length <= limit || t('origam.validation.max_length', [limit]))
		}

		if (hasMask.value) {
			// Mask-driven rule: relies on the live `maskIsValid`
			// computed so OrigamField/OrigamInput surface the
			// `error` state without the consumer having to wire
			// `:error` manually.
			base.push(() => {
				if (!model.value) return true
				return maskIsValid.value || t('origam.validation.invalid_format', 'Invalid format')
			})
		}

		return base
	})

	const [rootAttrs, inputAttrs] = filterInputAttrs(attrs)

	/*********************************************************
	 * Forwarded props
	 ********************************************************/

	const inputProps = computed(() => {
		return origamInputRef.value?.filterProps(props, ['modelValue', 'class', 'style', 'id', 'focused'])
	})
	const fieldProps = computed(() => {
		return origamFieldRef.value?.filterProps(props, ['class', 'id', 'active', 'dirty', 'disabled', 'focused', 'error', 'style'])
	})

	/*********************************************************
	 * Class & Style
	 *
	 * @description
	 * Root element classes and inline styles.
	 ********************************************************/

	const textFieldStyles = computed(() => {
		return [
			props.style
		] as StyleValue
	})
	const textFieldClasses = computed(() => {
		return [
			'origam-text-field',
			props.class
		]
	})

	const {filterProps} = useProps<ITextFieldProps>(props)
	const {id, css, load, isLoaded, unload} = useStyle(textFieldStyles)


	/*********************************************************
	 * Expose
	 ********************************************************/

	defineExpose(forwardRefs({filterProps,
		css,
		id,
		load,
		unload,
		isLoaded
	}, origamInputRef, origamFieldRef, inputRef))
</script>

<style
		lang="scss"
		scoped
>
	.origam-text-field {
		$this: &;

		input {
			color: inherit;
			opacity: 0;
			flex: 1;
			transition: 0.15s opacity cubic-bezier(0.4, 0, 0.2, 1);
			min-width: 0;

			&:focus,
			&:active {
				outline: none;
			}

			&:invalid {
				box-shadow: none;
			}
		}

		&__details {
			padding-inline: var(--origam-text-field__details---padding-inline, 16px);
		}

		:deep(.origam-field) {
			&.origam-field--no-label,
			&.origam-field--active {
				input {
					opacity: 1;
				}
			}

			input {
				border: none;
				background: transparent;
			}
		}
	}
</style>

