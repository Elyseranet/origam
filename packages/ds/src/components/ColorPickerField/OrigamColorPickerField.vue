<template>
	<origam-text-field
			:id="id"
			ref="origamTextFieldRef"
			v-model:focused="isFocused"
			:aria-label="t(accessibleLabel)"
			:class="colorPickerFieldClasses"
			:counter-value="counterValue"
			:dirty="isDirty"
			:placeholder="placeholder"
			:style="colorPickerFieldStyles"
			:title="t(accessibleLabel)"
			:validation-value="effectiveValidationValue"

			v-bind="{ ...textFieldProps }"
			@blur="handleBlur"
			@change="handleChange"
			@click:clear="handleClear"
			@input="handleInput"
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
				#prependInner
		>
			<origam-sheet
					:bg-color="selectedValue ?? HSVtoCSS(COLOR_NULL)"
					height="100%"
					min-width="24px"
			/>

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
					content-class="origam-color-picker-field__content"
					v-bind="{ ...menuProps }"
					@after-leave="handleAfterLeave"
			>

				<template #default>
					<origam-color-picker
							ref="origamColorPickerRef"
							:model-value="model"
							v-bind="{...colorPickerProps}"
							@update:model-value="handleSelectColor"
					/>
				</template>
			</origam-menu>

			<template v-if="selectedValue">
					<span class="origam-color-picker-field__selection-text">
            <slot name="colorSelection">
              {{ selectedValue }}
            </slot>
          </span>
			</template>
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
	import OrigamColorPicker from '../ColorPicker/OrigamColorPicker.vue'
	import OrigamMenu from '../Menu/OrigamMenu.vue'
	import OrigamSheet from '../Sheet/OrigamSheet.vue'
	import OrigamTextField from '../TextField/OrigamTextField.vue'
	import OrigamTranslateScale from '../Transition/OrigamTranslateScale.vue'

	import { useLocale } from '../../composables/Commons/locale.composable'
	import { useProps } from '../../composables/Commons/props.composable'
	import { useTeleportTypography } from '../../composables/Commons/teleport-typography.composable'
	import { useVModel } from '../../composables/Commons/vModel.composable'
	import { useStyle } from '../../composables/Commons/style.composable'

	import { COLOR_NULL } from '../../consts/ColorPicker/color-picker.const'
	import { ORIGAM_FORM_KEY } from '../../consts/Form/form.const'

	import { BLOCK } from '../../enums/Commons/anchor.enum'
	import { DENSITY } from '../../enums/Commons/density.enum'
	import { DIRECTION } from '../../enums/Commons/direction.enum'
	import { TEXT_FIELD_TYPE } from '../../enums/TextField/text-field.enum'

	import type { IColorPickerFieldEmits, IColorPickerFieldProps, IColorPickerFieldSlots } from '../../interfaces/ColorPickerField/color-picker-field.interface'

	import type { TColor } from '../../types/Commons/color.type'
	import type { TOrigamColorPicker } from '../../types/ColorPicker/color-picker.type'
	import type { TOrigamMenu } from '../../types/Menu/menu.type'
	import type { TOrigamTextField } from '../../types/TextField/text-field.type'
	import type { TTransitionProps } from '../../types/Transition/transition.type'

	import { forwardRefs } from '../../utils/Commons/forwardRefs.util'
	import { HSVtoCSS, isCompleteCssColor } from '../../utils/Commons/color.util'
	import { has, matchesSelector } from '../../utils/Commons/commons.util'

	import { computed, inject, nextTick, ref, shallowRef, StyleValue, useSlots, watch } from "vue"

	/*********************************************************
	 * Global
	 *
	 * @description
	 * Props, emits, composables and top-level refs.
	 ********************************************************/

	const props = withDefaults(defineProps<IColorPickerFieldProps>(), {
		type: TEXT_FIELD_TYPE.TEXT,
		centerAffix: true,
		direction: DIRECTION.HORIZONTAL,
		density: DENSITY.DEFAULT,
		border: true,
		rounded: true,
		modelValue: null,
		transition: () => ({component: OrigamTranslateScale}) as unknown as TTransitionProps,
		closeText: 'origam.close',
		openText: 'origam.open',
		closeOnSelect: false
	})

	const {filterProps} = useProps<IColorPickerFieldProps>(props)

	defineEmits<IColorPickerFieldEmits>()

	defineSlots<IColorPickerFieldSlots>()

	const {t} = useLocale()

	const origamTextFieldRef = ref<TOrigamTextField>()
	const origamMenuRef = ref<TOrigamMenu>()
	const origamColorPickerRef = ref<TOrigamColorPicker>()

	const slots = useSlots()

	/*********************************************************
	 * Value
	 *
	 * @description
	 * Model, selected value, and color-picker interactions.
	 ********************************************************/

	const model = useVModel(
			props,
			'modelValue',
			COLOR_NULL
	)

	const handleSelectColor = (color: TColor) => {
		model.value = color

		nextTick(() => {
			if (props.closeOnSelect) {
				menu.value = false
			}
		})
	}

	/*********************************************************
	 * selectedValue (#859)
	 *
	 * @description
	 * Normalises `COLOR_NULL` (`{h:0,s:0,v:0,a:1}`) to `null` — measured
	 * defect, confirmed in Chromium: `handleClear` writes `COLOR_NULL` to
	 * `model`, a TRUTHY object, while every consumer of `selectedValue`
	 * (the template's `v-if="selectedValue"` gating the selection-text
	 * span, `hasSelectedValue`, the `:bg-color` swatch fallback) treats it
	 * as "no value" via a truthiness/`!== null` check. Pre-fix, clicking
	 * the clear button left the span rendering the sentinel's own
	 * `JSON.stringify` (`{ "h": 0, "s": 0, "v": 0, "a": 1 }`) instead of
	 * hiding it. `COLOR_NULL` itself stays untouched (it is a published
	 * export — changing its shape would be an API break) and `model`
	 * still holds it internally (`isDirty` still compares against it);
	 * only the PUBLIC read this component exposes downstream is
	 * normalised, at this single pass-through point.
	 *
	 * @description
	 * ⛔ `model.value === COLOR_NULL` (reference equality) does NOT
	 * catch this — measured, first attempt failed silently. `model` is
	 * built on a plain `ref()` inside `useVModel`, and Vue 3 deep-wraps
	 * any OBJECT assigned to a `ref` in a reactive `Proxy` — reading
	 * `model.value` back returns that Proxy, never the original
	 * `COLOR_NULL` literal, so `=== COLOR_NULL` is always `false` even
	 * right after `model.value = COLOR_NULL`. A STRUCTURAL check
	 * (`has(…, ['h','s','v','a'])`, the same helper `parseColor` already
	 * uses for its own HSVA-shape test) survives the Proxy wrap because
	 * it reads through it instead of comparing identities.
	 ********************************************************/
	const selectedValue = computed(() => {
		const v = model.value

		return v !== null && typeof v === 'object' && has(v, ['h', 's', 'v', 'a']) ? null : v
	})

	/*********************************************************
	 * commitTypedColor (#859)
	 *
	 * @description
	 * Reads the RAW text the user types into the underlying
	 * `<origam-text-field>` and commits it to `model` — the piece that
	 * was entirely missing pre-fix. Wired via `@input` / `@change`
	 * (below), NOT a `v-model` on the inner text field.
	 *
	 * @description
	 * ⛔ `v-model:model-value` was tried first and REVERTED — measured
	 * regression, not a style choice. Making the inner
	 * `<origam-text-field>`'s `modelValue` CONTROLLED (both the prop AND
	 * `onUpdate:modelValue` present) changes `useVModel`'s
	 * controlled/uncontrolled detection for that field, which shifted the
	 * render cascade that `useValidation`'s `watch(validationModel, …)`
	 * (`validation.composable.ts:154`) relies on to observe the
	 * `undefined -> value` transition once `validationValue` first
	 * arrives through the two ref-gated `textFieldProps` /
	 * `OrigamTextField`'s own `inputProps` hops. With the extra
	 * reactivity hop, the watch's baseline read already saw the settled
	 * value and never fired again — `rules` stopped being evaluated at
	 * all (TU regression: `OrigamColorPickerField.spec.ts` "#693 …repli
	 * reste le modele", `seen` went from `['#ff0000']` to `[]`).
	 * `@input`/`@change` are plain NATIVE DOM event fallthrough (same
	 * mechanism `@change` already used pre-fix, confirmed reaching the
	 * real `<input>` — see the ticket's own addEventListener probe) and
	 * touch none of TextField's internal v-model machinery.
	 *
	 * @description
	 * A value is committed the instant it becomes a syntactically
	 * COMPLETE CSS color (`isCompleteCssColor` — hex, functional
	 * notation, named color, `var()`), never before. Typing `#ff00aa`
	 * therefore commits progressively (`#ff0` alone is already a valid
	 * 3-digit shorthand and commits; `#ff` does not, and is silently
	 * REJECTED — not written to the model). Committing a syntactically
	 * incomplete value would be a worse defect than the one this fixes.
	 * An empty field clears to `null` — see the dedicated banner on the
	 * empty-string branch below for why that's `null` and NOT
	 * `COLOR_NULL` despite `handleClear` using the latter.
	 *
	 * @description
	 * The underlying `<input>` is never visible (CSS positions it behind
	 * the swatch/hex `colorSelection` span, see the `<style>` block below)
	 * and is left UNCONTROLLED — its own native typed text is exactly
	 * what the browser already shows, nothing here overwrites it. Only
	 * the swatch/span (driven by `model`/`selectedValue`) is the real
	 * visible readout.
	 ********************************************************/
	const commitTypedColor = (raw: string) => {
		if (raw === '') {
			/*********************************************************
			 * `null`, NOT `COLOR_NULL` (#859)
			 *
			 * @description
			 * Deliberate deviation from `handleClear`'s convention. The
			 * template's selection-text span is gated on
			 * `v-if="selectedValue"` (a TRUTHY check, not `!== null`), and
			 * `COLOR_NULL` (`{h:0,s:0,v:0,a:1}`) is a truthy object —
			 * writing it here renders the span with a stringified object
			 * instead of hiding it (caught by this ticket's own e2e spec:
			 * clearing the typed input left 1
			 * `.origam-color-picker-field__selection-text` in the DOM
			 * where 0 was expected). `null` is what the field's OWN
			 * initial/untouched state already uses and correctly hides
			 * the span.
			 ********************************************************/
			model.value = null
			return
		}

		if (isCompleteCssColor(raw)) {
			model.value = raw
		}
	}

	/*********************************************************
	 * effectiveValidationValue (#693)
	 *
	 * @description
	 * This was previously named `validationValue`, a bare `const` that
	 * SHADOWED the `validationValue` PROP (`IColorPickerFieldProps` ->
	 * `ITextFieldProps` -> `IInputProps` ->
	 * `IValidationProps.validationValue`, `validation.interface.ts:47`)
	 * inside this `<script setup>` block. The template's
	 * `:validation-value="validationValue"` therefore always resolved to
	 * this model-derived local, never to the consumer's prop — and since
	 * `validationValue` is also stripped from the `filterProps` passthrough
	 * below, there was no second path either: a
	 * `<origam-color-picker-field :validation-value="somethingElse" />`
	 * silently validated against the model. Same defect family as #622 /
	 * #665 / #666.
	 *
	 * @description
	 * The fallback ladder mirrors `useValidation` exactly
	 * (`validation.composable.ts:52`): `undefined` means "not supplied" and
	 * falls back to the model, ANY other value — `null` included — wins.
	 ********************************************************/
	const effectiveValidationValue = computed(() => {
		return props.validationValue === undefined ? model.value : props.validationValue
	})

	const hasSelectedValue = computed(() => {
		return selectedValue.value !== null
	})

	/*********************************************************
	 * Menu
	 *
	 * @description
	 * Menu open/close state management and disabled guard.
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

	const isFocused = shallowRef(false)
	const form = inject(ORIGAM_FORM_KEY, null)

	const menuDisabled = computed(() => {
		return props.readonly || form?.isReadonly.value
	})

	// Typography bridge across the teleport — see `useTeleportTypography` for
	// the full rationale. The popup's channel labels (`origam-color-picker-edit__label`)
	// and, when a title is set, its `origam-picker-title` header size themselves
	// with `rem`-based tokens, so they need the field's REAL font-size republished
	// as those specific tokens, not just inherited.
	const { typographyStyles: menuTypographyStyles } = useTeleportTypography(origamTextFieldRef, menu, (fontSize) => ({
		'--origam-picker-title---font-size': fontSize,
		'--origam-color-picker-edit__label---font-size': fontSize
	}))

	const menuProps = computed(() => {
		const consumerContentProps = (props.menuProps?.contentProps ?? {}) as Record<string, any>

		return {
			...props.menuProps,
			activatorProps: {
				/*********************************************************
				 * role + aria-haspopup — #818
				 *
				 * @description
				 * `'colorpickerbox'` was never a valid `aria-haspopup` token
				 * (spec allows `false|true|menu|listbox|tree|grid|dialog`) —
				 * axe-core's `aria-valid-attr-value` flagged it, measured
				 * against a real browser. The popup is a free-form panel
				 * (a color canvas + swatches), not a list of options, so
				 * `'dialog'` is the correct token — same family as the
				 * WAI-ARIA "Date Picker Dialog" pattern `OrigamDatePickerField`
				 * uses right below.
				 *
				 * @description
				 * `role: 'combobox'` is ALSO required here: `activator="parent"`
				 * (below) lands these ARIA attrs on the `.origam-field` wrapper
				 * `<div>`, which carries no role by default — `aria-allowed-attr`
				 * rejects `aria-expanded` on an element whose role doesn't
				 * support it. Same fix, same rationale as
				 * `OrigamSelect.comboboxAriaAttrs` (`role` MUST sit on the same
				 * element as `aria-haspopup`/`aria-expanded`).
				 ********************************************************/
				role: 'combobox',
				...(props.menuProps?.activatorProps || {}),
				'aria-haspopup': 'dialog'
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
	 *
	 * @description
	 * Clear, mouse, blur, change and after-leave interactions.
	 ********************************************************/

	const handleClear = () => {
		model.value = COLOR_NULL

		if (props.openOnClear) {
			menu.value = true
		}
	}
	const handleMousedownControl = () => {
		if (menuDisabled.value) return

		menu.value = !menu.value
	}
	const handleBlur = (e: FocusEvent) => {
		if (!origamColorPickerRef.value?.$el.contains(e.relatedTarget as HTMLElement)) {
			menu.value = false
		}

		if (hasSelectedValue.value) {
			isFocused.value = true
		}
	}
	const handleInput = (e: Event) => {
		commitTypedColor((e.target as HTMLInputElement)?.value ?? '')
	}
	const handleChange = (e: Event) => {
		if (matchesSelector(origamTextFieldRef.value, ':autofill') || matchesSelector(origamTextFieldRef.value, ':-webkit-autofill')) {
			commitTypedColor((e.target as HTMLInputElement)?.value ?? '')
		}
	}
	const handleAfterLeave = () => {
		if (isFocused.value) {
			origamTextFieldRef.value?.focus()
		}
	}

	/*********************************************************
	 * Props forwarding
	 *
	 * @description
	 * Filtered props passed down to inner components.
	 ********************************************************/

	/*********************************************************
	 * Forwarded props
	 ********************************************************/

	const textFieldProps = computed(() => {
		return origamTextFieldRef.value?.filterProps(props, ['class', 'id', 'style', 'dirty', 'modelValue', 'placeholder', 'validationValue', 'focused'])
	})

	const colorPickerProps = computed(() => {
		// Strip the FIELD-specific visual props (`border`, `rounded`,
		// `density`, `direction`, …) before forwarding to the inner
		// `<origam-color-picker>`. Pre-fix the field's defaults
		// (`rounded: true`, `border: true` — meant for the trigger
		// outline) cascaded through `filterProps` to the picker, which
		// in turn propagated to its `<origam-sheet>`. Sheet's
		// `--rounded` modifier resolves to `2xl` (24px), 3× larger
		// than the popup menu's 8px outer radius — leaving a visible
		// white gap at every corner of the popup, reported by the
		// user as "le border ne devrait pas exister et surtout s'il
		// existe devrait prendre vraiment les bord de la popup".
		return origamColorPickerRef.value?.filterProps(props, [
			'class', 'id', 'style', 'modelValue',
			'rounded', 'border', 'borderColor', 'borderStyle',
			'density', 'direction',
		])
	})

	const isDirty = computed(() => {
		return model.value === COLOR_NULL
	})
	const placeholder = computed(() => {
		return isDirty.value || (!isFocused.value && props.label && !props.persistentPlaceholder) ? undefined : props.placeholder
	})
	/*********************************************************
	 * toggleLabel / accessibleLabel (#665)
	 *
	 * @description
	 * This was previously named `label`, a bare `const` that SHADOWED the
	 * `label` PROP (`IColorPickerFieldProps` -> `ITextFieldProps` ->
	 * `IFieldProps.label`, `field.interface.ts:43`) inside this
	 * `<script setup>` block. The template's `:aria-label="t(label)"` /
	 * `:title="t(label)"` therefore always resolved to this toggle
	 * wording, never to the field's own label — every
	 * `<origam-color-picker-field>` announced "Open"/"Close" to assistive
	 * tech regardless of its `label` prop. Renamed so the identifier can
	 * no longer mask `props.label`. Same defect and same correction as
	 * `OrigamSelect` (#622 / PR #656).
	 *
	 * @description
	 * `<origam-field>` already renders a real `<label for>` (OrigamField ->
	 * OrigamLabel, `for: id.value` / `text: props.label`) linked to this
	 * very `<input>` via its `id`, so `props.label` is ALREADY the input's
	 * accessible name whenever it is set. `accessibleLabel` keeps
	 * `aria-label` / `title` consistent with that native label instead of
	 * re-introducing a second, independently-maintained source of truth
	 * for the same text — it falls back to `toggleLabel` only for a
	 * labelless field, the one case where `<origam-field>` renders no
	 * `<label for>` at all and the toggle wording is the only accessible
	 * name available.
	 ********************************************************/
	const toggleLabel = computed(() => {
		return menu.value ? props.closeText : props.openText
	})
	const accessibleLabel = computed(() => {
		return props.label || toggleLabel.value
	})

	watch(selectedValue, () => {
		isFocused.value = hasSelectedValue.value
	}, {
		immediate: true,
		deep: true
	})

	/*********************************************************
	 * Class & Style
	 *
	 * @description
	 * Root element classes and inline styles.
	 ********************************************************/

	const colorPickerFieldStyles = computed(() => {
		return [
			props.style
		] as StyleValue
	})
	const colorPickerFieldClasses = computed(() => {
		return [
			'origam-color-picker-field',
			{
				'origam-color-picker-field--active-menu': menu.value
			},
			props.class
		]
	})
	const {id, css, load, isLoaded, unload} = useStyle(colorPickerFieldStyles, () => props.id)


	/*********************************************************
	 * Expose
	 *
	 * @description
	 * Public API surface exposed to parent components.
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
	.origam-color-picker-field {
		:deep(.origam-field) {
			// #800 — l'unite est obligatoire : sans elle, `0` est un `<number>`
			// et tout `max()` / `calc()` qui lit ce token JETTE sa declaration.
			// Sans effet de rendu ici (mesure Chromium, avant/apres identiques) :
			// ce champ est TOUJOURS prepended — le `#prependInner` du swatch est
			// inconditionnel — donc son `padding-inline` vient de la regle
			// `.origam-field--prepended`, qui n'utilise pas de `max()`.
			--origam-field---padding-start: 0px;
		}

		:deep(.origam-field__prepend-inner) {
			align-self: stretch;
			align-items: stretch;
			padding-top: 0;
			padding-bottom: 0;
			padding-inline-start: 0;
			overflow: hidden;
			border-start-start-radius: var(--origam-field---border-radius, 8px);
			border-end-start-radius: var(--origam-field---border-radius, 8px);

			// The swatch must sit FLUSH against the field's inline-start edge.
			// `OrigamField` applies `--origam-field---padding-start` to the whole
			// grid (prepend-inner included), so any consumer that raises it pushes
			// the swatch inward and opens a gap between the colour and the left
			// border. The Theme Builder does exactly this — it forces
			// `--origam-field---padding-start: 14px` on prepended control fields to
			// widen the outline's start leg so the left corner rounds — which left
			// a ~14px gap in front of the swatch. Cancel the padding for the
			// prepend cell only (negative margin = -padding-start) so the swatch
			// bleeds back to the edge while the outline keeps its rounded corner.
			// No-op when padding-start resolves to 0 (the component's own default),
			// so there is zero regression for plain consumers.
			margin-inline-start: calc(-1 * var(--origam-field---padding-start, 0px));

			> .origam-sheet {
				width: var(--origam-color-picker-field__swatch---width, 24px);
				height: 100%;
				min-width: var(--origam-color-picker-field__swatch---width, 24px);
				border-radius: 0;
				flex-shrink: 0;
			}
		}

		:deep(.origam-color-picker-field__selection-text) {
			font-family: var(--origam-font__family---mono);
			font-size: 0.875em;
			letter-spacing: 0.03em;
			overflow: hidden;
			text-overflow: ellipsis;
			white-space: nowrap;
			min-width: 0;
		}

		// `.origam-field__input` is `display: flex; flex-wrap: wrap` by
		// default (`OrigamField`'s base rule, meant for multi-chip inputs).
		// This field renders BOTH the hex `colorSelection` span AND the
		// underlying native `<input>` in that same row — in a narrow
		// container (e.g. a dense side panel) the two don't fit on one
		// line and wrap onto two, DOUBLING the field's height versus a
		// plain text-field of the same density (confirmed: 55px vs 26px
		// at compact density, identical width). The native input's own
		// text is not meant to be visible here (the formatted
		// `colorSelection` span is the real display value) — forcing
		// `nowrap` lets the invisible native input shrink instead of
		// pushing a wrap, with zero visual loss.
		// Same single-line fix as OrigamSelect: the underlying native
		// `<input>` is taken OUT of flow (`position: absolute`, `flex: 0 0`)
		// so it can't sit beside the formatted hex `colorSelection` span and
		// push the field onto a second line. The span is the real display
		// value; the input only carries focus / the editable value. `nowrap`
		// alone was insufficient — the in-flow input still forced a wrap in a
		// narrow container.
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
