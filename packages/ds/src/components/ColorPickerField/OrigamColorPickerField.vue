<template>
	<origam-text-field
			ref="origamTextFieldRef"
			v-model:focused="isFocused"
			:aria-label="t(label)"
			:class="colorPickerFieldClasses"
			:counter-value="counterValue"
			:dirty="isDirty"
			:placeholder="placeholder"
			:style="colorPickerFieldStyles"
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
	import { OrigamColorPicker, OrigamMenu, OrigamSheet, OrigamTextField, OrigamTranslateScale } from "../../components"

	import { useDefaults, useLocale, useProps, useVModel , useStyle} from "../../composables"

	import { COLOR_NULL, ORIGAM_FORM_KEY } from "../../consts"

	import { BLOCK, DENSITY, DIRECTION, TEXT_FIELD_TYPE } from "../../enums"

	import type { IColorPickerFieldProps } from "../../interfaces"

	import type { TColor, TOrigamColorPicker, TOrigamMenu, TOrigamTextField, TTransitionProps } from "../../types"

	import { forwardRefs, HSVtoCSS, matchesSelector } from "../../utils"

	import { computed, inject, nextTick, ref, shallowRef, StyleValue, useSlots, watch } from "vue"

	/*********************************************************
	 * Global
	 *
	 * @description
	 * Props, emits, composables and top-level refs.
	 ********************************************************/

	const _props = withDefaults(defineProps<IColorPickerFieldProps>(), {
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

	// `useDefaults` resolves each prop against theme.components['origam-color-picker-field']
	// (OrigamBtn pattern). Pre-fix, the legacy `rounded: true` / `border: true`
	// booleans always won, same forwarding-parity gap already fixed on Select.
	const props = useDefaults(_props)

	const {filterProps} = useProps<IColorPickerFieldProps>(props)

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

	const selectedValue = computed(() => {
		return model.value
	})

	const validationValue = computed(() => {
		return model.value
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
	const menuProps = computed(() => {
		return {
			...props.menuProps,
			activatorProps: {
				...(props.menuProps?.activatorProps || {}),
				'aria-haspopup': 'colorpickerbox' // Set aria-haspopup to 'listbox'
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
	const label = computed(() => {
		return menu.value ? props.closeText : props.openText
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
	const {id, css, load, isLoaded, unload} = useStyle(colorPickerFieldStyles)


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
			--origam-field---padding-start: 0;
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
