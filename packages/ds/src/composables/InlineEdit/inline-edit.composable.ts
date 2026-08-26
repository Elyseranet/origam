import {
    computed,
    type ComputedRef,
    type MaybeRefOrGetter,
    nextTick,
    ref,
    type Ref,
    toValue,
    unref
} from 'vue'

import type { IUseInlineEditOptions, TInlineEditRule, TInlineEditValidator } from '../../interfaces/InlineEdit/inline-edit.interface'

/**
 * Coerce any v-model value into a string for the input draft. Numbers
 * are stringified via `String()` (preserves the locale-free decimal
 * representation), `null` and `undefined` become the empty string.
 */
const toDraft = (value: unknown): string => {
    if (value === null || value === undefined) return ''
    return String(value)
}

/**
 * Headless edit-in-place state machine.
 *
 * The composable owns the four states — IDLE / EDITING / VALIDATING /
 * ERROR — and the four transitions: `edit`, `confirm`, `cancel`,
 * `setValue`. It is **input-agnostic** (no DOM references) and only
 * reads the v-model value through the passed-in `Ref`. Components
 * plug their `<input>` value/oninput on the returned `draft` ref and
 * forward keyboard events to `confirm` / `cancel`.
 *
 * @example
 * ```ts
 * const model = ref('hello')
 * const {
 *     isEditing, draft, error, isPending,
 *     edit, confirm, cancel, setValue
 * } = useInlineEdit(model, {
 *     validate: (v) => v.length >= 3 || 'Min 3 chars',
 *     onConfirm: (v) => (model.value = v),
 * })
 * ```
 */
export function useInlineEdit (
    modelValue: Ref<string | number> | ComputedRef<string | number>,
    options: MaybeRefOrGetter<IUseInlineEditOptions> = {}
) {
    /*********************************************************
     * options must be re-read on every call, not snapshotted (#490)
     *
     * @description
     * `options` accepts `MaybeRefOrGetter` — a plain object still works
     * unchanged (existing consumers, this file's own test suite) — but
     * the SFC now passes a GETTER (`() => ({ rules: props.rules, … })`).
     * `resolveOptions()` re-runs `toValue()` at every call site below,
     * so `confirm()` always validates against the CURRENT `rules` /
     * `validate`, not the object captured when `useInlineEdit()` was
     * called once in `setup()`.
     * @description
     * Wrapping the WHOLE options bag in a getter — rather than wrapping
     * each of `rules` / `validate` / `trim` individually in its own
     * `MaybeRefOrGetter` — sidesteps a real footgun: `validate` is
     * ITSELF a function (`(value: string) => …`). `toValue()` treats
     * ANY function as a getter and calls it with zero arguments, so a
     * per-field `toValue(options.validate)` would invoke the consumer's
     * validator with `value === undefined` instead of returning it.
     ********************************************************/
    const resolveOptions = (): IUseInlineEditOptions => toValue(options)

    const trim = computed(() => resolveOptions().trim ?? true)

    const isEditing: Ref<boolean> = ref(false)
    const draft: Ref<string> = ref('')
    const error: Ref<string | null> = ref(null)
    const isPending: Ref<boolean> = ref(false)

    /**
     * Token used to discard stale async validations. Each `confirm()`
     * bumps the counter; when a Promise resolves, it compares its
     * captured snapshot against the current token and aborts if the
     * user has since cancelled (or fired another confirm).
     */
    let validationToken = 0

    /**
     * Resolved (post-trim) string used by the validator and by the
     * emitted value. Always re-derived from `draft.value` — exposing it
     * as a computed costs nothing and keeps the contract testable.
     */
    const normalisedDraft = computed<string>(() => trim.value ? draft.value.trim() : draft.value)

    /** True when the live draft would resolve to an empty string. */
    const isDraftEmpty = computed<boolean>(() => normalisedDraft.value.length === 0)

    /**
     * Enter edit mode. Snapshots the current v-model into the draft
     * ref so the user can mutate it freely without touching the parent
     * state until they Confirm.
     */
    const edit = (): void => {
        if (isEditing.value) return
        draft.value = toDraft(unref(modelValue))
        error.value = null
        isPending.value = false
        isEditing.value = true
    }

    /** Programmatic setter — used by the slot binding and the textarea oninput. */
    const setValue = (next: string): void => {
        draft.value = next
        if (error.value !== null) {
            // Clear stale error as soon as the user types — re-validate
            // on the next confirm.
            error.value = null
        }
    }

    /**
     * Discard the draft and return to display mode. Cancels any
     * in-flight async validator by bumping the token.
     */
    const cancel = (): void => {
        validationToken += 1
        isPending.value = false
        error.value = null
        isEditing.value = false
        draft.value = ''
        resolveOptions().onCancel?.()
    }

    /**
     * Run the validator (if any). Resolves to the error message
     * (`string`) when the value is rejected, or `null` when the value
     * is accepted (or there is no validator).
     */
    const runValidator = async (
        value: string,
        validator?: TInlineEditValidator
    ): Promise<string | null> => {
        if (!validator) return null
        const verdict = await validator(value)
        if (verdict === true) return null
        return typeof verdict === 'string' ? verdict : 'Invalid value'
    }

    /**
     * Run the `rules` array sequentially. Returns the first error
     * message found, or `null` when all rules pass (or no rules
     * are provided). Mirrors the evaluation logic of `useValidation`
     * but without the form-provider lifecycle coupling.
     */
    const runRules = async (
        value: string,
        rules?: Array<TInlineEditRule>
    ): Promise<string | null> => {
        if (!rules || rules.length === 0) return null
        for (const rule of rules) {
            const result = await rule(value)
            if (result === true) continue
            if (typeof result === 'string') return result
        }
        return null
    }

    /**
     * Validate the draft and, on success, commit it through `onConfirm`
     * (which is wired to `emit('update:modelValue', value)` by the SFC).
     *
     * Evaluation order when both `rules` and `validate` are provided:
     * 1. `rules` are evaluated first (sequential, stops at first failure).
     * 2. `validate` is only evaluated if all rules pass.
     * This ensures the declarative contract (`rules`) takes precedence
     * and the imperative callback (`validate`) is the last gate.
     */
    const confirm = async (): Promise<boolean> => {
        if (!isEditing.value) return false

        const token = ++validationToken
        const next = normalisedDraft.value
        error.value = null

        /*********************************************************
         * Re-read NOW
         *
         * @description
         * Not the object captured when useInlineEdit() was called —
         * this is what makes a `rules`/`validate` swap after mount
         * take effect on the very next confirm() (#490).
         ********************************************************/
        const currentOptions = resolveOptions()
        const hasRules = currentOptions.rules && currentOptions.rules.length > 0
        const hasValidate = !!currentOptions.validate

        if (hasRules || hasValidate) {
            isPending.value = true
            let verdict: string | null = null
            try {
                verdict = await runRules(next, currentOptions.rules)
                if (verdict === null) {
                    verdict = await runValidator(next, currentOptions.validate)
                }
            } catch (err) {
                verdict = err instanceof Error ? err.message : String(err)
            }
            // Stale Promise — user cancelled in the meantime.
            if (token !== validationToken) return false
            isPending.value = false
            if (verdict !== null) {
                error.value = verdict
                currentOptions.onError?.(verdict)
                return false
            }
        }

        isEditing.value = false
        currentOptions.onConfirm?.(next)
        draft.value = ''
        // Yield once so consumers can observe the post-commit state.
        await nextTick()
        return true
    }

    return {
        isEditing,
        draft,
        error,
        isPending,
        normalisedDraft,
        isDraftEmpty,
        edit,
        confirm,
        cancel,
        setValue
    }
}
