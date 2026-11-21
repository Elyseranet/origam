import { warn } from 'vue'

/**
 * Console warn.
 *
 * @param message …
 */
export function consoleWarn (message: string): void {
    warn(`Origam: ${message}`)
}

/**
 * Console error.
 *
 * @param message …
 */
export function consoleError (message: string): void {
    warn(`Origam error: ${message}`)
}

/*********************************************************
 * warnAsyncRejection (#1398)
 *
 * @description
 * Handler for fire-and-forget promises: routes the rejection to a dev-only
 * warning (Vue's `warn` is a no-op in production) instead of an unhandled
 * rejection. `NotAllowedError` (autoplay blocked) and `AbortError` (play
 * interrupted by pause / source change) are EXPECTED outcomes of
 * `HTMLMediaElement.play()` and stay silent.
 ********************************************************/
export function warnAsyncRejection (context: string, err: unknown): void {
    const name = err instanceof Error ? err.name : ''

    if (name === 'NotAllowedError' || name === 'AbortError') return

    consoleWarn(`${context}: unhandled async error — ${err instanceof Error ? err.message : String(err)}`)
}
