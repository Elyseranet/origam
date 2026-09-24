<template>
	<div
			:id="styleId"
			:aria-label="label || undefined"
			:class="otpInputFieldClasses"
			:style="otpInputFieldStyles"
			:role="role"
			v-bind="{ ...rootAttrs }"
	>
		<div
				ref="contentRef"
				:style="dimensionStyles"
				class="origam-otp-input-field__content"
				@click="handleControlClick"
				@mousedown="handleControlMousedown"
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
						@click:clear="handleClear"
						@click:append-inner="handleClickAppendInner"
						@click:prepend-inner="handleClickPrependInner"
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
				<template #default>
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

	import { computed, nextTick, onBeforeUnmount, ref, StyleValue, useAttrs, useSlots, watch } from "vue"
	import OrigamField from '../Field/OrigamField.vue'
	import OrigamOverlay from '../Overlay/OrigamOverlay.vue'
	import OrigamProgress from '../Progress/OrigamProgress.vue'
	import { OrigamMessages } from "../../components/Messages"

	import { useDimension } from '../../composables/Commons/dimension.composable'
	import { useFocus } from '../../composables/Commons/focus.composable'
	import { useLocale } from '../../composables/Commons/locale.composable'
	import { useProps } from '../../composables/Commons/props.composable'
	import { useTypography } from '../../composables/Commons/typography.composable'
	import { useValidation } from '../../composables/Commons/validation.composable'
	import { useVModel } from '../../composables/Commons/vModel.composable'
	import { useStyle } from '../../composables/Commons/style.composable'

	import { OTP_INPUT_FIELD_TYPE } from '../../enums/OtpInputField/otp-input-field.enum'
	import { PROGRESS_TYPE } from '../../enums/Progress/progress.enum'

	import type { IOtpInputFieldProps, IOtpInputFieldSlots } from '../../interfaces/OtpInputField/otp-input-field.interface'

	import type { IOtpInputFieldEmits } from '../../interfaces/OtpInputField/otp-input-field.interface'

	import type { TOrigamField } from '../../types/Field/field.type'

	import { filterInputAttrs } from '../../utils/Input/input.util'
	import { focusChild, wrapInArray } from '../../utils/Commons/commons.util'
	import { forwardRefs } from '../../utils/Commons/forwardRefs.util'
	import { getUid } from '../../utils/Commons/getCurrentInstance.util'

	/*********************************************************
	 * Global
	 *
	 * @description
	 * Props, emits, slots and filterProps for the OtpInputField component.
	 ********************************************************/
	const props = withDefaults(defineProps<IOtpInputFieldProps>(), {
		type: OTP_INPUT_FIELD_TYPE.NUMBER,
		length: 6,
		role: 'group'
	})

	const emits = defineEmits<IOtpInputFieldEmits>()

	defineSlots<IOtpInputFieldSlots>()

	/*********************************************************
	 * Frames bornees a la duree de vie du composant (#753)
	 *
	 * @description
	 * Les deux rAF de gestion du focus etaient nus. Leur corps
	 * dereference `contentRef.value!` et `inputRef.value[index]` avec un
	 * `!` — or apres le demontage `contentRef.value` vaut `null`, et
	 * `focusChild(null, target)` n'a aucune raison de survivre a ca. La
	 * frame est armee depuis un `keydown`, donc typiquement une touche
	 * pressee au moment ou le champ disparait (validation d'OTP qui ferme
	 * la modale) tombe pile dans la fenetre.
	 ********************************************************/
	let disposed = false
	const frames = new Set<number>()

	const scheduleFrame = (cb: () => void) => {
		if (disposed) return

		const id = requestAnimationFrame(() => {
			frames.delete(id)

			if (disposed) return

			cb()
		})

		frames.add(id)
	}

	onBeforeUnmount(() => {
		disposed = true

		for (const id of frames) cancelAnimationFrame(id)
		frames.clear()
	})

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
	 *
	 * `validationValue` is overridden DELIBERATELY, not by accident
	 * of the `||` condition: an OTP field only ever has one thing
	 * worth validating — the joined code the user actually typed.
	 * Validating a cell array, or some unrelated consumer-supplied
	 * value, has no functional meaning here. The prop stays on the
	 * declared surface (it is inherited from `IInputProps`, and
	 * removing it would be a public API break), but whatever a
	 * consumer passes is IGNORED: the rules always receive
	 * `otpStringValue`. This exception is documented in
	 * `packages/docs/components/OtpInputField/OrigamOtpInputField.md`
	 * and pinned by the `validationValue` tests in
	 * `packages/tests/TU/components/OtpInputField/OrigamOtpInputField.spec.ts`.
	 * See issue #697.
	 *
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
				scheduleFrame(() => {
					inputRef.value[index]?.select()
				})
			}
		}

		scheduleFrame(() => {
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

	/*********************************************************
	 * Control / clear handlers
	 *
	 * @description
	 * Mirrors the sibling Field-wrapping components (TextField,
	 * NumberField, PasswordField, Select, FileField, DatePickerField,
	 * TextareaField, ColorPickerField): `click:control`/`mousedown:control`
	 * relay a click/mousedown on the control area, `click:clear` relays
	 * `<origam-field>`'s own `click:clear` and — same as TextField's
	 * `handleClear` — actually performs the clear via the existing
	 * `reset()` rather than only notifying.
	 ********************************************************/
	const handleControlClick = (e: MouseEvent) => {
		emits('click:control', e)
	}

	const handleControlMousedown = (e: MouseEvent) => {
		emits('mousedown:control', e)
	}

	const handleClear = (e: MouseEvent) => {
		e.stopPropagation()

		reset()

		emits('click:clear', e)
	}

	/*********************************************************
	 * click:appendInner / click:prependInner relay
	 *
	 * @description
	 * `<origam-field>` (one per OTP cell) already emits both via its own
	 * `useAdjacentInner` when a consumer sets `appendInnerIcon` /
	 * `prependInnerIcon`, but nothing here listened for them — declared,
	 * never fired (issue: guard `unemitted-declarations`,
	 * `OtpInputField:click:appendInner,click:prependInner`). Mirrors
	 * `handleClear` above: relay on THIS component's own instance whichever
	 * cell the click came from.
	 ********************************************************/
	const handleClickAppendInner = (e: MouseEvent) => {
		emits('click:appendInner', e)
	}
	const handleClickPrependInner = (e: MouseEvent) => {
		emits('click:prependInner', e)
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
	/*********************************************************
	 * styleId — l'id de la RACINE, celui du consommateur quand il en passe un
	 *
	 * @description
	 * #790 — la racine ne portait AUCUN `:id`, et `useStyle` etait appele
	 * sans son second argument. Deux defauts en un, mesures :
	 *   1. l'`id` du consommateur n'atteignait aucun noeud — un
	 *      `getElementById` ou un `aria-describedby` externe ne trouvait
	 *      rien, sans le moindre avertissement ;
	 *   2. la regle `#origam-otp-input-field-<uid> { … }` injectee dans
	 *      <head> ne matchait aucun noeud — un style MORT et silencieux.
	 *
	 * @description
	 * Les deux contraintes de #790 se satisfont d'un seul geste, et c'est
	 * la raison pour laquelle l'arbitrage redoute par le ticket n'existe
	 * pas : `useStyle` retourne l'id qu'il CIBLE. Lier ce meme id sur la
	 * racine garantit par construction que la regle generee continue de
	 * s'appliquer, que l'id vienne du consommateur ou du repli genere.
	 *
	 * @description
	 * ⛔ Pas de doublon ici, contrairement a `OrigamInput` / `OrigamField`
	 * (#421/#422) : `props.id` n'est porte par aucun autre noeud de cet
	 * arbre — les six `<origam-field>` l'excluent via `filterProps`, et
	 * seul `messagesId` en DERIVE (`<id>-messages`). Mesure a l'appui dans
	 * la sonde de rayon de souffle. La racine est bien le noeud a designer :
	 * elle porte deja `role` et `aria-label`, c'est l'element de groupe.
	 *
	 * @description
	 * Le getter garde la lecture PARESSEUSE (ADR-005) : le resolveur de
	 * theme ecrit dans `beforeCreate`, donc APRES `setup()`.
	 ********************************************************/
	const { id: styleId, css, load, isLoaded, unload } = useStyle(otpInputFieldStyles, () => props.id)


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
			// ⛔ #800 — une cellule OTP n'a ni etiquette ni texte aligne au bord :
			// son chiffre est CENTRE. Le plancher de degagement des coins d'
			// `OrigamField` n'y protege de rien et decentre le chiffre de 2px
			// (mesure Chromium : `padding-inline` 4px / 0px). On le neutralise
			// explicitement. Jusqu'a #800 le meme rendu etait obtenu par un `0`
			// SANS UNITE qui rendait la declaration invalide — le bon rendu
			// reposait donc sur une erreur de parse, et serait tombe au premier
			// refactor du `max()`.
			--origam-field---corner-clearance: 0px;
			--origam-field---padding-start: 0px;
			--origam-field---padding-end: 0px;
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
			height: var(--origam-otp-input-field__cell---height, 100%);
			outline: var(--origam-otp-input-field__cell---outline, none);
			text-align: var(--origam-otp-input-field__cell---text-align, center);
			width: var(--origam-otp-input-field__cell---width, 100%);
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
					color: var(--origam-otp-input-field---error-color, var(--origam-color__feedback--danger---fgSubtle));
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
