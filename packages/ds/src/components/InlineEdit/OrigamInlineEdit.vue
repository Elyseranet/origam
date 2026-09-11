<template>
	<component
			:is="tag"
			class="origam-inline-edit"
			:class="rootClasses"
			:style="rootStyles"
			:aria-busy="isPending ? 'true' : 'false'"
			data-cy="origam-inline-edit"
	>
		<template v-if="!isEditing">
			<slot
					name="display"
					:value="displayValue"
					:edit="handleEnterEdit"
					:is-empty="isEmpty"
					:placeholder="resolvedPlaceholder"
					:disabled="disabled"
			>
				<button
						type="button"
						class="origam-inline-edit__display"
						:class="{
							'origam-inline-edit__display--empty': isEmpty,
							'origam-inline-edit__display--disabled': disabled
						}"
						:disabled="disabled"
						:aria-label="displayAriaLabel"
						data-cy="origam-inline-edit-display"
						@click="handleEnterEdit"
				>
					{{ isEmpty ? resolvedPlaceholder : displayValue }}
				</button>
			</slot>

			<div
					v-if="showActions"
					class="origam-inline-edit__actions"
					data-cy="origam-inline-edit-actions-display"
			>
				<origam-btn
						:icon="MDI_ICONS.PENCIL_OUTLINE"
						class="origam-inline-edit__action-btn origam-inline-edit__action-btn--edit"
						:disabled="disabled"
						:aria-label="editActionLabel"
						:data-cy="`origam-inline-edit-action-${INLINE_EDIT_ACTION.EDIT}`"
						size="x-small"
						variant="text"
						@click="handleEnterEdit"
				/>
			</div>
		</template>

		<template v-else>
			<slot
					name="edit"
					:value="draft"
					:set-value="setValue"
					:confirm="handleConfirm"
					:cancel="handleCancel"
					:error="error"
					:is-pending="isPending"
			>
				<origam-textarea-field
						v-if="multiline"
						ref="inputRef"
						:model-value="draft"
						:placeholder="resolvedPlaceholder"
						:disabled="disabled || isPending"
						:aria-invalid="error !== null"
						:aria-describedby="error !== null ? errorId : undefined"
						class="origam-inline-edit__field"
						data-cy="origam-inline-edit-input"
            hide-details
						@update:model-value="handleInput"
						@keydown="handleKeyDown"
						@blur="handleBlur"
				>
					<template
							v-if="showActions"
							#appendInner
					>
						<slot
								name="actions"
								:confirm="handleConfirm"
								:cancel="handleCancel"
								:is-pending="isPending"
						>
							<origam-btn
									:icon="MDI_ICONS.CHECK"
									class="origam-inline-edit__action-btn origam-inline-edit__action-btn--confirm"
									:disabled="disabled || isPending"
									:aria-label="confirmActionLabel"
									:data-cy="`origam-inline-edit-action-${INLINE_EDIT_ACTION.CONFIRM}`"
									size="x-small"
									variant="text"
									color="success"
									@mousedown.prevent
									@click="handleConfirm"
							/>
							<origam-btn
									:icon="MDI_ICONS.CLOSE"
									class="origam-inline-edit__action-btn origam-inline-edit__action-btn--cancel"
									:disabled="disabled"
									:aria-label="cancelActionLabel"
									:data-cy="`origam-inline-edit-action-${INLINE_EDIT_ACTION.CANCEL}`"
									size="x-small"
									variant="text"
									color="danger"
									@mousedown.prevent
									@click="handleCancel"
							/>
						</slot>
					</template>
				</origam-textarea-field>

				<origam-text-field
						v-else
						ref="inputRef"
						:model-value="draft"
						:type="inputType"
						:placeholder="resolvedPlaceholder"
						:disabled="disabled || isPending"
						:aria-invalid="error !== null"
						:aria-describedby="error !== null ? errorId : undefined"
						class="origam-inline-edit__field"
						data-cy="origam-inline-edit-input"
						hide-details
						@update:model-value="handleInput"
						@keydown="handleKeyDown"
						@blur="handleBlur"
				>
					<template
							v-if="showActions"
							#appendInner
					>
						<slot
								name="actions"
								:confirm="handleConfirm"
								:cancel="handleCancel"
								:is-pending="isPending"
						>
							<origam-btn
									:icon="MDI_ICONS.CHECK"
									class="origam-inline-edit__action-btn origam-inline-edit__action-btn--confirm"
									:disabled="disabled || isPending"
									:aria-label="confirmActionLabel"
									:data-cy="`origam-inline-edit-action-${INLINE_EDIT_ACTION.CONFIRM}`"
									size="x-small"
									variant="text"
									color="success"
									@mousedown.prevent
									@click="handleConfirm"
							/>
							<origam-btn
									:icon="MDI_ICONS.CLOSE"
									class="origam-inline-edit__action-btn origam-inline-edit__action-btn--cancel"
									:disabled="disabled"
									:aria-label="cancelActionLabel"
									:data-cy="`origam-inline-edit-action-${INLINE_EDIT_ACTION.CANCEL}`"
									size="x-small"
									variant="text"
									color="danger"
									@mousedown.prevent
									@click="handleCancel"
							/>
						</slot>
					</template>
				</origam-text-field>

				<span
						v-if="error !== null"
						:id="errorId"
						class="origam-inline-edit__error"
						role="alert"
						data-cy="origam-inline-edit-error"
				>{{ error }}</span>
			</slot>

			<slot
					v-if="!showActions"
					name="actions"
					:confirm="handleConfirm"
					:cancel="handleCancel"
					:is-pending="isPending"
			/>
		</template>
	</component>
</template>

<script
		lang="ts"
		setup
>
	import {
		computed,
		nextTick,
		ref,
		type ComponentPublicInstance,
		type StyleValue,
		useId,
		watch
	} from 'vue'

	import { OrigamBtn, OrigamTextField, OrigamTextareaField } from '../../components'

	import { useInlineEdit, useTypography } from '../../composables'

	import { INLINE_EDIT_ACTION, MDI_ICONS } from '../../enums'

	import type {
		IInlineEditProps} from '../../interfaces'

	import type { IInlineEditEmits } from '../../interfaces/InlineEdit/inline-edit.interface'

	/*********************************************************
	 * Global
	 *
	 * @description
	 * Props + defaults for `<OrigamInlineEdit>`. Defaults are inlined
	 * here (not pulled from a const) because the Vue SFC compiler
	 * analyses `withDefaults` statically and only resolves literals —
	 * cf. CLAUDE.md "withDefaults — inline literals only" rule.
	 ********************************************************/
	const props = withDefaults(defineProps<IInlineEditProps>(), {
		tag: 'span',
		placeholder: 'Click to edit',
		rules: undefined,
		validate: undefined,
		autoFocus: true,
		selectOnFocus: true,
		confirmOnBlur: true,
		confirmOnEnter: true,
		cancelOnEscape: true,
		disabled: false,
		multiline: false,
		trim: true,
		inputType: 'text',
		loadingOnConfirm: false,
		showActions: false
	})

	const emit = defineEmits<IInlineEditEmits>()

	/*********************************************************
	 * Model — reactive accessor so the composable always reads the
	 * up-to-date value (props are not Refs themselves).
	 ********************************************************/
	const modelRef = computed<string | number>(() => props.modelValue)

	/*********************************************************
	 * Composable — owns the IDLE → EDITING → VALIDATING state machine.
	 * The SFC layer adds DOM glue: focus, keyboard, blur, ARIA wiring.
	 ********************************************************/
	const {
		isEditing,
		draft,
		error,
		isPending,
		edit,
		confirm,
		cancel,
		setValue
	} = useInlineEdit(modelRef, {
		rules: props.rules,
		validate: props.validate,
		trim: props.trim,
		onConfirm: (value: string) => {
			// Preserve the original v-model shape (string vs number)
			// when round-tripping through the input. Failed coercion
			// (NaN) falls back to the raw string.
			const normalised: string | number =
				typeof props.modelValue === 'number'
					? Number(value)
					: value
			const out = typeof normalised === 'number' && Number.isNaN(normalised) ? value : normalised
			emit('confirm', out)
			emit('update:modelValue', out)
		},
		onCancel: () => emit('cancel'),
		onError: (message: string) => emit('validate-error', message)
	})

	/*********************************************************
	 * Refs / IDs
	 * inputRef points to OrigamTextField or OrigamTextareaField.
	 * Both expose .focus() and .select() via forwardRefs() proxying
	 * through their internal HTMLInputElement / HTMLTextAreaElement.
	 ********************************************************/
	const inputRef = ref<ComponentPublicInstance & { focus?: () => void; select?: () => void } | null>(null)
	const errorId = `origam-inline-edit-error-${useId()}`

	/*********************************************************
	 * Derived display state
	 ********************************************************/
	const displayValue = computed<string>(() => {
		const v = props.modelValue
		if (v === null || v === undefined) return ''
		return String(v)
	})

	const isEmpty = computed<boolean>(() => displayValue.value.trim().length === 0)

	const resolvedPlaceholder = computed<string>(() => props.placeholder ?? 'Click to edit')

	const displayAriaLabel = computed<string>(() => {
		const label = isEmpty.value ? resolvedPlaceholder.value : displayValue.value
		return `Edit ${label}`
	})

	const editActionLabel = computed<string>(() => `Edit ${displayValue.value || resolvedPlaceholder.value}`)
	const confirmActionLabel = 'Confirm'
	const cancelActionLabel = 'Cancel'

	/*********************************************************
	 * Edit / confirm / cancel handlers — own the SFC-level emits.
	 ********************************************************/
	const handleEnterEdit = (): void => {
		if (props.disabled) return
		edit()
		emit('edit')
	}

	const handleConfirm = (): void => {
		void confirm()
	}

	const handleCancel = (): void => {
		cancel()
	}

	/*********************************************************
	 * Input / keyboard glue
	 * handleInput now receives the new string value directly from
	 * OrigamTextField / OrigamTextareaField's @update:model-value emit.
	 ********************************************************/
	const handleInput = (value: string | null): void => {
		setValue(value ?? '')
	}

	const handleKeyDown = (event: KeyboardEvent): void => {
		if (event.key === 'Enter' && props.confirmOnEnter && !props.multiline) {
			event.preventDefault()
			handleConfirm()
			return
		}
		if (event.key === 'Enter' && props.confirmOnEnter && props.multiline && (event.metaKey || event.ctrlKey)) {
			event.preventDefault()
			handleConfirm()
			return
		}
		if (event.key === 'Escape' && props.cancelOnEscape) {
			event.preventDefault()
			handleCancel()
		}
	}

	/**
	 * Blur is intentionally async-aware: while a validator Promise is
	 * pending we let it land; we never re-fire confirm on blur in that
	 * window or we would double-commit.
	 */
	const handleBlur = (): void => {
		if (!props.confirmOnBlur) return
		if (isPending.value) return
		handleConfirm()
	}

	/*********************************************************
	 * Focus management — auto-focus on transition into edit mode and
	 * (optionally) select the text so the user can type a replacement
	 * immediately.
	 *
	 * inputRef now points to OrigamTextField / OrigamTextareaField.
	 * Both proxy .focus() and .select() via forwardRefs() through
	 * their internal HTMLInputElement / HTMLTextAreaElement.
	 ********************************************************/
	watch(isEditing, async (next: boolean): Promise<void> => {
		if (!next) return
		if (!props.autoFocus) return
		await nextTick()
		const el = inputRef.value
		if (!el) return
		if (typeof el.focus === 'function') el.focus()
		if (props.selectOnFocus && typeof el.select === 'function') {
			el.select()
		}
	})

	/*********************************************************
	 * Class & Style
	 ********************************************************/
	const rootClasses = computed(() => [
		{
			'origam-inline-edit--editing': isEditing.value,
			'origam-inline-edit--disabled': props.disabled,
			'origam-inline-edit--pending': isPending.value,
			'origam-inline-edit--loading-on-confirm': props.loadingOnConfirm && isPending.value,
			'origam-inline-edit--multiline': props.multiline,
			'origam-inline-edit--has-error': error.value !== null,
			'origam-inline-edit--show-actions': props.showActions
		},
		props.class
	])

	// __error reads --origam-inline-edit__error---font-{size,weight}.
	// __action-btn reads --origam-inline-edit__action-btn---font-size.
	// Both var sets are declared on the root so they cascade to their
	// respective descendants via normal CSS custom-property inheritance.
	const {typographyStyles: errorTypoStyles} = useTypography(props, 'inline-edit__error')
	const {typographyStyles: actionBtnTypoStyles} = useTypography(props, 'inline-edit__action-btn')

	const rootStyles = computed<StyleValue>(() => [props.style, errorTypoStyles.value, actionBtnTypoStyles.value] as StyleValue)

	/*********************************************************
	 * Expose
	 ********************************************************/
	defineExpose({
		edit: handleEnterEdit,
		confirm: handleConfirm,
		cancel: handleCancel,
		isEditing,
		draft,
		error,
		isPending
	})
</script>

<style
		lang="scss"
		scoped
>
	.origam-inline-edit {
		position: relative;
		display: inline-flex;
		flex-direction: row;
		align-items: flex-start;
		gap: var(--origam-inline-edit---actions-gap, var(--origam-inline-edit__actions---gap, 4px));
		max-width: 100%;
		transition: opacity var(--origam-inline-edit---transition-duration, 160ms) ease;
	}

	.origam-inline-edit--disabled {
		opacity: 0.65;
		pointer-events: none;
	}

	.origam-inline-edit--loading-on-confirm {
		opacity: 0.75;
		pointer-events: none;
	}

	.origam-inline-edit__display {
		all: unset;
		box-sizing: border-box;
		display: inline-flex;
		align-items: center;
		min-height: var(--origam-inline-edit__display---min-height, 24px);
		padding: var(--origam-inline-edit__display---padding-block, 2px)
		         var(--origam-inline-edit__display---padding-inline, 6px);
		border-radius: var(--origam-inline-edit__display---border-radius, 4px);
		font: inherit;
		color: var(--origam-color__text---primary);
		cursor: text;
		transition: background-color var(--origam-inline-edit---transition-duration, 160ms) ease,
		            color var(--origam-inline-edit---transition-duration, 160ms) ease;
	}

	.origam-inline-edit__display:hover:not(:disabled) {
		background-color: var(--origam-inline-edit__display---hover-bg-color);
	}

	.origam-inline-edit__display:focus-visible {
		outline: 2px solid var(--origam-color__action--primary---bg);
		outline-offset: 2px;
	}

	.origam-inline-edit__display--empty {
		color: var(--origam-inline-edit__display---color-empty);
		font-style: italic;
	}

	.origam-inline-edit__display--disabled {
		cursor: not-allowed;
	}

	.origam-inline-edit__field {
		flex: 1;
		min-width: var(--origam-inline-edit__field---min-width, 180px);
	}

	.origam-inline-edit__error {
		position: absolute;
		top: calc(100% + 4px);
		left: 0;
		right: 0;
		z-index: 2;
		padding: var(--origam-inline-edit__error---padding-block, 4px)
		         var(--origam-inline-edit__error---padding-inline, 8px);
		border-radius: var(--origam-inline-edit__error---border-radius, 4px);
		background-color: var(
			--origam-inline-edit__error---background-color,
			color-mix(in srgb, var(--origam-color__feedback--danger---bg-subtle, #ffe5e7) 75%, transparent)
		);
		color: var(--origam-inline-edit__error---color, var(--origam-color__feedback--danger---fgSubtle, #b91c1c));
		font-size: var(--origam-inline-edit__error---font-size, 0.75rem);
		font-weight: var(--origam-inline-edit__error---font-weight, 500);
		line-height: 1.3;
		pointer-events: none;
	}

	.origam-inline-edit__actions {
		display: inline-flex;
		flex-shrink: 0;
		align-items: center;
		gap: var(--origam-inline-edit__actions---gap, 2px);
	}

	.origam-inline-edit__action-btn {
		all: unset;
		box-sizing: border-box;
		display: inline-flex;
		align-items: center;
		justify-content: center;
		width: var(--origam-inline-edit__action-btn---size, 28px);
		height: var(--origam-inline-edit__action-btn---size, 28px);
		border-radius: var(--origam-inline-edit__action-btn---border-radius, 4px);
		cursor: pointer;
		font-size: var(--origam-inline-edit__action-btn---font-size, 0.875rem);
		font-weight: 600;
		transition: background-color var(--origam-inline-edit---transition-duration, 160ms) ease,
		            color var(--origam-inline-edit---transition-duration, 160ms) ease,
		            opacity var(--origam-inline-edit---transition-duration, 160ms) ease;
	}

	.origam-inline-edit__action-btn:focus-visible {
		outline: 2px solid var(--origam-color__action--primary---bg);
		outline-offset: 2px;
	}

	.origam-inline-edit__action-btn:disabled {
		opacity: 0.4;
		cursor: not-allowed;
		pointer-events: none;
	}

	.origam-inline-edit__action-btn--edit {
		color: var(--origam-color__text---secondary, #555);
	}

	.origam-inline-edit__action-btn--edit:hover:not(:disabled) {
		background-color: var(--origam-color__surface---raised, #f5f5f5);
		color: var(--origam-color__text---primary);
	}

	.origam-inline-edit__action-btn--confirm {
		background-color: var(--origam-color__feedback--success---bgSubtle, #e6f6ec);
		color: var(--origam-color__feedback--success---fgSubtle, #16a34a);
	}

	.origam-inline-edit__action-btn--confirm:hover:not(:disabled) {
		background-color: var(--origam-color__feedback--success---bg, #16a34a);
		color: var(--origam-color__feedback--success---fg, #fff);
	}

	.origam-inline-edit__action-btn--cancel {
		background-color: var(--origam-color__feedback--danger---bgSubtle, #fee);
		color: var(--origam-color__feedback--danger---fgSubtle, #b00);
	}

	.origam-inline-edit__action-btn--cancel:hover:not(:disabled) {
		background-color: var(--origam-color__feedback--danger---bg, #dc2626);
		color: var(--origam-color__feedback--danger---fg, #fff);
	}

	.origam-inline-edit__action-icon {
		line-height: 1;
	}
</style>
