/**
 * messaging.ts — type-safe postMessage protocol between the Figma plugin
 * main thread (code.ts) and the UI iframe (ui.tsx).
 *
 * Direction:  UI → main thread  : UIToCodeMessage
 * Direction:  main thread → UI  : CodeToUIMessage
 */

// ---------------------------------------------------------------------------
// Message shapes
// ---------------------------------------------------------------------------

/** Messages sent from the UI iframe to the main thread. */
export type UIToCodeMessage =
  | { type: 'detect-variables' }
  | { type: 'generate-components'; components: string[] }
  | { type: 'export'; format: 'tokens-studio' | 'scss-origam' | 'w3c' }
  | { type: 'close' }

/** Messages sent from the main thread to the UI iframe. */
export type CodeToUIMessage =
  | { type: 'variables-detected'; found: boolean; missingNamespaces?: string[] }
  | { type: 'generate-progress'; current: number; total: number; component?: string }
  | { type: 'generate-done'; createdSetCount: number }
  | { type: 'export-ready'; filename: string; mimeType: string; base64: string }
  | { type: 'error'; message: string }
  | { type: 'notify'; message: string; level?: 'info' | 'warn' | 'error' }

// ---------------------------------------------------------------------------
// Helpers for the UI iframe (ui.tsx)
// ---------------------------------------------------------------------------

/**
 * Send a message from the UI iframe to the plugin main thread.
 * Wraps the message under the `pluginMessage` key expected by Figma.
 */
export function postToCode(msg: UIToCodeMessage): void {
  parent.postMessage({ pluginMessage: msg }, '*')
}

/**
 * Wire a handler for messages arriving from the main thread.
 * Defensively unwraps `event.data.pluginMessage`; ignores frames that
 * don't carry a recognised payload.
 *
 * Returns a cleanup function that removes the event listener.
 */
export function onMessageFromCode(
  handler: (msg: CodeToUIMessage) => void,
): () => void {
  const listener = (event: MessageEvent): void => {
    // Figma wraps plugin messages under pluginMessage.
    // Be defensive: non-plugin messages (devtools, React HMR, …) arrive too.
    const raw: unknown = event.data?.pluginMessage
    if (raw === null || raw === undefined) return
    handler(raw as CodeToUIMessage)
  }

  window.addEventListener('message', listener)
  return () => window.removeEventListener('message', listener)
}

// ---------------------------------------------------------------------------
// Helpers for the main thread (code.ts)
// ---------------------------------------------------------------------------

/**
 * Send a message from the main thread to the UI iframe.
 */
export function postToUI(msg: CodeToUIMessage): void {
  figma.ui.postMessage(msg)
}

/**
 * Wire a handler for messages arriving from the UI iframe.
 * The handler may return a Promise; unhandled rejections are caught and
 * forwarded as `error` messages back to the UI.
 */
export function onMessageFromUI(
  handler: (msg: UIToCodeMessage) => void | Promise<void>,
): void {
  figma.ui.onmessage = (raw: unknown): void => {
    if (raw === null || raw === undefined) return
    const msg = raw as UIToCodeMessage
    try {
      const result = handler(msg)
      if (result instanceof Promise) {
        result.catch((err: unknown) => {
          const message =
            err instanceof Error ? err.message : String(err)
          postToUI({ type: 'error', message })
        })
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err)
      postToUI({ type: 'error', message })
    }
  }
}
