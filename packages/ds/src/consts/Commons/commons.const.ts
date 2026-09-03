import { PropType } from 'vue'
import type { TEventProp } from '../../types/Commons/commons.type'

export const IN_BROWSER = typeof window !== 'undefined' && typeof document !== 'undefined'

export const DEFAULT_DOCUMENT = /* #__PURE__ */ IN_BROWSER ? window.document : undefined

export const EVENT_PROP = <T extends Array<any> = Array<any>> () => [Function as PropType<(e: Event, ...args: T) => void>, Array] as PropType<TEventProp<T>>

export const HISTORY = 20
export const HORIZON = 100

export const SUPPORTS_INTERSECTION = IN_BROWSER && 'IntersectionObserver' in window

export const ON_REGEX = /^on[^a-z]/

export const SUPPORTS_TOUCH = IN_BROWSER && ('ontouchstart' in window || window.navigator.maxTouchPoints > 0)

export const SUPPORTS_EYE_DROPPER = IN_BROWSER && 'EyeDropper' in window

/*********************************************************
 * REDUCED_MOTION_QUERY
 *
 * @description
 * The media query every composable that gates motion behind the
 * OS-level accessibility setting must pass to `window.matchMedia`.
 * Kept here rather than re-typed per composable — a typo in the query
 * string does not throw, it just returns `matches: false` forever, so
 * the failure mode is motion that silently ignores the user's setting.
 ********************************************************/
export const REDUCED_MOTION_QUERY = '(prefers-reduced-motion: reduce)'

/*********************************************************
 * REDUCED_MOTION_ANIMATION_DURATION
 *
 * @description
 * The WAAPI (`el.animate()`) twin of the `0.01ms` duration every
 * `@include ds.ds-reduced-motion { transition-duration: 0.01ms !important }`
 * block in the DS's SCSS uses (see `assets/scss/_helpers.scss`). Kept as a
 * near-zero duration rather than `0` on purpose: `Animation.finished` must
 * keep resolving so `done()` callbacks in Vue `<transition>` hooks still
 * fire — skipping `el.animate()` outright (as a naive "respect reduced
 * motion" fix would) leaves any code awaiting `.finished` hanging forever.
 ********************************************************/
export const REDUCED_MOTION_ANIMATION_DURATION = 0.01

/*********************************************************
 * NAME_ATTR_TAGS
 *
 * @description
 * The elements the HTML Living Standard allows a `name` content
 * attribute on. Any other element — `<label>`, `<div>`, `<span>`, … —
 * only accepts global attributes, so a bound `name` lands in the DOM,
 * is ignored by the browser, and fails W3C validation on every page
 * that renders it (issue #458).
 * @description
 * Components whose `tag` is consumer-controlled must gate the binding
 * on this set rather than emitting `name` unconditionally.
 ********************************************************/
export const NAME_ATTR_TAGS: ReadonlySet<string> = new Set([
    'button',
    'fieldset',
    'form',
    'input',
    'output',
    'select',
    'textarea'
])
