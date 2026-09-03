import type { MaybeRefOrGetter } from 'vue'

export type TEventHandler = (event: Event) => any

/*********************************************************
 * TEventListenerTarget
 *
 * @description
 * The `target` accepted by `useEventListener` — a plain `EventTarget`
 * (window, an `HTMLElement`, …), a `Ref` wrapping one (template ref), or a
 * getter resolving to one. Mirrors the `MaybeRefOrGetter` contract already
 * used across the DS for a value that may arrive late (element not yet
 * mounted) or swap over time (ref reassigned).
 ********************************************************/
export type TEventListenerTarget = MaybeRefOrGetter<EventTarget | null | undefined>
