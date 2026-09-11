// Unit tests for `useInlineEdit` — covers the four-state machine:
// IDLE → EDITING → VALIDATING → (ERROR | IDLE), the sync + async
// validator paths, the stale-Promise cancellation, the `trim` option,
// and the slot-binding contract used by the SFC.

import { describe, expect, it, vi } from 'vitest'

import { nextTick, ref } from 'vue'

import { useInlineEdit } from '@origam/composables/InlineEdit/inline-edit.composable'

describe('useInlineEdit', () => {
    it('starts in IDLE: isEditing=false, draft empty, error null', () => {
        const model = ref('hello')
        const { isEditing, draft, error, isPending } = useInlineEdit(model)
        expect(isEditing.value).toBe(false)
        expect(draft.value).toBe('')
        expect(error.value).toBeNull()
        expect(isPending.value).toBe(false)
    })

    it('edit() snapshots the model value into draft and flips isEditing=true', () => {
        const model = ref('hello')
        const { isEditing, draft, edit } = useInlineEdit(model)
        edit()
        expect(isEditing.value).toBe(true)
        expect(draft.value).toBe('hello')
    })

    it('edit() is idempotent — second call does not reset a user-typed draft', () => {
        const model = ref('hello')
        const { isEditing, draft, edit, setValue } = useInlineEdit(model)
        edit()
        setValue('world')
        edit()
        expect(isEditing.value).toBe(true)
        expect(draft.value).toBe('world')
    })

    it('coerces a numeric v-model into the draft string', () => {
        const model = ref<string | number>(42)
        const { draft, edit } = useInlineEdit(model)
        edit()
        expect(draft.value).toBe('42')
    })

    it('confirm() without a validator commits the trimmed draft and returns to IDLE', async () => {
        const model = ref('hello')
        const onConfirm = vi.fn()
        const { isEditing, draft, edit, confirm, setValue } = useInlineEdit(model, { onConfirm })
        edit()
        setValue('  next  ')
        await confirm()
        expect(onConfirm).toHaveBeenCalledWith('next')
        expect(isEditing.value).toBe(false)
        expect(draft.value).toBe('')
    })

    it('confirm() preserves whitespace when trim=false', async () => {
        const model = ref('hello')
        const onConfirm = vi.fn()
        const { edit, confirm, setValue } = useInlineEdit(model, { trim: false, onConfirm })
        edit()
        setValue('  next  ')
        await confirm()
        expect(onConfirm).toHaveBeenCalledWith('  next  ')
    })

    it('cancel() discards the draft and fires onCancel', () => {
        const model = ref('hello')
        const onCancel = vi.fn()
        const onConfirm = vi.fn()
        const { isEditing, draft, edit, cancel, setValue } = useInlineEdit(model, { onCancel, onConfirm })
        edit()
        setValue('world')
        cancel()
        expect(isEditing.value).toBe(false)
        expect(draft.value).toBe('')
        expect(onCancel).toHaveBeenCalledTimes(1)
        expect(onConfirm).not.toHaveBeenCalled()
    })

    it('sync validator rejecting with a string surfaces in error and blocks the commit', async () => {
        const model = ref('hello')
        const onConfirm = vi.fn()
        const onError = vi.fn()
        const { error, edit, confirm, setValue, isEditing } = useInlineEdit(model, {
            validate: (v) => v.length >= 3 || 'Min 3 chars',
            onConfirm,
            onError
        })
        edit()
        setValue('ab')
        const ok = await confirm()
        expect(ok).toBe(false)
        expect(error.value).toBe('Min 3 chars')
        expect(isEditing.value).toBe(true)
        expect(onConfirm).not.toHaveBeenCalled()
        expect(onError).toHaveBeenCalledWith('Min 3 chars')
    })

    it('setValue() clears a previous error to give the user a chance to fix', async () => {
        const model = ref('hello')
        const { error, edit, confirm, setValue } = useInlineEdit(model, {
            validate: (v) => v.length >= 3 || 'Min 3 chars'
        })
        edit()
        setValue('ab')
        await confirm()
        expect(error.value).toBe('Min 3 chars')
        setValue('abc')
        expect(error.value).toBeNull()
    })

    it('async validator: isPending toggles true → false; commit waits for the Promise', async () => {
        const model = ref('hello')
        let resolve!: (verdict: true | string) => void
        const promise = new Promise<true | string>((r) => { resolve = r })
        const onConfirm = vi.fn()
        const { isPending, isEditing, edit, confirm, setValue } = useInlineEdit(model, {
            validate: () => promise,
            onConfirm
        })
        edit()
        setValue('hi')
        const pending = confirm()
        await nextTick()
        expect(isPending.value).toBe(true)
        expect(isEditing.value).toBe(true)
        resolve(true)
        const ok = await pending
        expect(ok).toBe(true)
        expect(isPending.value).toBe(false)
        expect(isEditing.value).toBe(false)
        expect(onConfirm).toHaveBeenCalledWith('hi')
    })

    it('async validator rejecting via string keeps the editor open and exposes the message', async () => {
        const model = ref('hello')
        const onError = vi.fn()
        const { error, isEditing, edit, confirm, setValue } = useInlineEdit(model, {
            validate: async () => 'Name is taken',
            onError
        })
        edit()
        setValue('taken')
        const ok = await confirm()
        expect(ok).toBe(false)
        expect(error.value).toBe('Name is taken')
        expect(isEditing.value).toBe(true)
        expect(onError).toHaveBeenCalledWith('Name is taken')
    })

    it('cancel() while a validator Promise is in flight aborts the commit', async () => {
        const model = ref('hello')
        let resolve!: (verdict: true | string) => void
        const promise = new Promise<true | string>((r) => { resolve = r })
        const onConfirm = vi.fn()
        const { isPending, isEditing, edit, confirm, cancel, setValue } = useInlineEdit(model, {
            validate: () => promise,
            onConfirm
        })
        edit()
        setValue('hi')
        const pending = confirm()
        await nextTick()
        expect(isPending.value).toBe(true)
        cancel()
        expect(isEditing.value).toBe(false)
        // Resolve AFTER the cancel — the verdict must be ignored.
        resolve(true)
        await pending
        expect(onConfirm).not.toHaveBeenCalled()
    })

    it('a thrown async validator is caught and surfaces as an error message', async () => {
        const model = ref('hello')
        const { error, isEditing, edit, confirm, setValue } = useInlineEdit(model, {
            validate: async () => { throw new Error('Network blew up') }
        })
        edit()
        setValue('x')
        const ok = await confirm()
        expect(ok).toBe(false)
        expect(error.value).toBe('Network blew up')
        expect(isEditing.value).toBe(true)
    })

    it('confirm() while not editing is a no-op', async () => {
        const model = ref('hello')
        const onConfirm = vi.fn()
        const { confirm } = useInlineEdit(model, { onConfirm })
        const ok = await confirm()
        expect(ok).toBe(false)
        expect(onConfirm).not.toHaveBeenCalled()
    })

    // ── rules ──────────────────────────────────────────────────────────────

    it('rules: a failing rule blocks commit and surfaces the first error message', async () => {
        const model = ref('hello')
        const onConfirm = vi.fn()
        const onError = vi.fn()
        const { error, isEditing, edit, confirm, setValue } = useInlineEdit(model, {
            rules: [
                (v) => v.length >= 5 || 'Min 5 chars',
                (v) => /^[a-z]+$/.test(v) || 'Lowercase only'
            ],
            onConfirm,
            onError
        })
        edit()
        setValue('abc')
        const ok = await confirm()
        expect(ok).toBe(false)
        expect(error.value).toBe('Min 5 chars')
        expect(isEditing.value).toBe(true)
        expect(onConfirm).not.toHaveBeenCalled()
        expect(onError).toHaveBeenCalledWith('Min 5 chars')
    })

    it('rules: all passing → validate is evaluated afterwards', async () => {
        const model = ref('hello')
        const onConfirm = vi.fn()
        const validate = vi.fn().mockResolvedValue('No digits allowed')
        const { error, isEditing, edit, confirm, setValue } = useInlineEdit(model, {
            rules: [(v) => v.length >= 3 || 'Min 3 chars'],
            validate,
            onConfirm
        })
        edit()
        // 'abcde' — rule passes (5 chars), but validate mock returns an error.
        setValue('abcde')
        const ok = await confirm()
        expect(ok).toBe(false)
        expect(validate).toHaveBeenCalledWith('abcde')
        expect(error.value).toBe('No digits allowed')
        expect(isEditing.value).toBe(true)
        expect(onConfirm).not.toHaveBeenCalled()
    })

    it('rules: rule fails → validate is NOT called (rules take precedence)', async () => {
        const model = ref('hello')
        const validate = vi.fn().mockResolvedValue(true)
        const { edit, confirm, setValue } = useInlineEdit(model, {
            rules: [(v) => v.length >= 10 || 'Min 10 chars'],
            validate
        })
        edit()
        setValue('short')
        await confirm()
        expect(validate).not.toHaveBeenCalled()
    })

    it('rules: async rule (Promise) is awaited; failure blocks commit', async () => {
        const model = ref('hello')
        const onConfirm = vi.fn()
        let resolveRule!: (verdict: true | string) => void
        const asyncRule = vi.fn((_v: string) =>
            new Promise<true | string>((r) => { resolveRule = r })
        )
        const { error, isEditing, isPending, edit, confirm, setValue } = useInlineEdit(model, {
            rules: [asyncRule],
            onConfirm
        })
        edit()
        setValue('value')
        const pending = confirm()
        await nextTick()
        expect(isPending.value).toBe(true)
        resolveRule('Async rule error')
        const ok = await pending
        expect(ok).toBe(false)
        expect(error.value).toBe('Async rule error')
        expect(isEditing.value).toBe(true)
        expect(onConfirm).not.toHaveBeenCalled()
    })

    it('rules: no rules + no validate → commit fires immediately without entering isPending', async () => {
        const model = ref('hello')
        const onConfirm = vi.fn()
        const { isPending, isEditing, edit, confirm, setValue } = useInlineEdit(model, { onConfirm })
        edit()
        setValue('quick commit')
        const ok = await confirm()
        expect(ok).toBe(true)
        // isPending must never have been true — we can only assert it is false now.
        expect(isPending.value).toBe(false)
        expect(isEditing.value).toBe(false)
        expect(onConfirm).toHaveBeenCalledWith('quick commit')
    })
})
