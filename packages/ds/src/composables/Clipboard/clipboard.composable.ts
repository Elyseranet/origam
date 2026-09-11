import {
    getCurrentScope,
    onScopeDispose,
    ref,
    type Ref
} from 'vue'

import { CLIPBOARD_DEFAULT_FEEDBACK_DURATION_MS as DEFAULT_FEEDBACK_DURATION_MS } from '../../consts/Clipboard/clipboard.const'

import type { IUseClipboardOptions } from '../../interfaces'

// `DEFAULT_FEEDBACK_DURATION_MS` lives in
// `src/consts/Clipboard/clipboard.const.ts` (exported as
// `CLIPBOARD_DEFAULT_FEEDBACK_DURATION_MS`).

/**
 * Writes `text` to the system clipboard using the modern
 * `navigator.clipboard.writeText` API when available, and falls back
 * to a hidden-textarea + `document.execCommand('copy')` path for
 * pre-permissions Safari, embedded WebViews and any non-HTTPS context
 * where the modern API is blocked.
 *
 * Returns `true` on success, `false` on failure. Never throws — callers
 * branch on the boolean.
 */
async function writeToClipboard (text: string): Promise<boolean> {
    if (typeof navigator === 'undefined' || typeof document === 'undefined') {
        return false
    }

    if (navigator.clipboard?.writeText) {
        try {
            await navigator.clipboard.writeText(text)
            return true
        } catch {
            // Fall through to the execCommand path — Safari sometimes
            // rejects the modern API even on secure contexts when the
            // call is not user-gesture-bound.
        }
    }

    try {
        const textarea = document.createElement('textarea')
        textarea.value = text
        textarea.setAttribute('readonly', '')
        textarea.style.position = 'fixed'
        textarea.style.opacity = '0'
        textarea.style.pointerEvents = 'none'
        document.body.appendChild(textarea)
        textarea.select()
        const ok = document.execCommand('copy')
        document.body.removeChild(textarea)
        return ok
    } catch {
        return false
    }
}

/**
 * Headless clipboard composable. Wraps the modern Clipboard API + a
 * legacy execCommand fallback and exposes a self-resetting `copied`
 * flag so consumers don't have to wire the timeout themselves.
 *
 * @example
 * ```ts
 * const { copy, copied, error, isSupported } = useClipboard({ feedbackDuration: 2000 })
 *
 * await copy('hello world')
 * // copied.value === true for 2000ms, then auto-resets to false
 * ```
 */
export function useClipboard (options: IUseClipboardOptions = {}) {
    const feedbackDuration = options.feedbackDuration ?? DEFAULT_FEEDBACK_DURATION_MS

    const copied: Ref<boolean> = ref(false)
    const error: Ref<Error | null> = ref(null)
    const isSupported: Ref<boolean> = ref(
        typeof navigator !== 'undefined' && Boolean(navigator.clipboard?.writeText)
    )

    let resetTimer: ReturnType<typeof setTimeout> | null = null

    const clearTimer = () => {
        if (resetTimer !== null) {
            clearTimeout(resetTimer)
            resetTimer = null
        }
    }

    const copy = async (text: string): Promise<boolean> => {
        clearTimer()
        error.value = null

        try {
            const ok = await writeToClipboard(text)
            if (!ok) {
                error.value = new Error('Clipboard write failed: the platform did not accept the request.')
                copied.value = false
                return false
            }
            copied.value = true
            resetTimer = setTimeout(() => {
                copied.value = false
                resetTimer = null
            }, feedbackDuration)
            return true
        } catch (err) {
            error.value = err instanceof Error ? err : new Error(String(err))
            copied.value = false
            return false
        }
    }

    if (getCurrentScope()) {
        onScopeDispose(clearTimer)
    }

    return {
        copy,
        copied,
        error,
        isSupported
    }
}
