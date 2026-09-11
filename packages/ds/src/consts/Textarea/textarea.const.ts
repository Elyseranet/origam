import { TEXTAREA_TOOLBAR_COMMAND } from '../../enums'

import type { TTextareaToolbarCommand } from '../../types'

/**
 * Default set of toolbar buttons surfaced when the consumer enables
 * `mode="rich"` without overriding `toolbar`. Order is meaningful — it
 * drives the visual layout left-to-right.
 */
export const DEFAULT_TOOLBAR: ReadonlyArray<TTextareaToolbarCommand> = [
    TEXTAREA_TOOLBAR_COMMAND.BOLD,
    TEXTAREA_TOOLBAR_COMMAND.ITALIC,
    TEXTAREA_TOOLBAR_COMMAND.UNDERLINE,
    TEXTAREA_TOOLBAR_COMMAND.LINK,
    TEXTAREA_TOOLBAR_COMMAND.LIST_BULLET,
    TEXTAREA_TOOLBAR_COMMAND.LIST_ORDERED,
    TEXTAREA_TOOLBAR_COMMAND.HEADING,
    TEXTAREA_TOOLBAR_COMMAND.CODE_INLINE,
    TEXTAREA_TOOLBAR_COMMAND.CLEAR_FORMAT
]

/**
 * Tags retained by the HTML sanitiser. Anything outside this allowlist
 * is `unwrap`-ped (children preserved, parent dropped). Scripts and
 * embeddable containers are explicitly *blocked* in
 * `BLOCKED_TAGS` so their text content is also dropped.
 */
export const ALLOWED_TAGS: ReadonlyArray<string> = [
    'p',
    'br',
    'strong',
    'b',
    'em',
    'i',
    'u',
    'a',
    'ul',
    'ol',
    'li',
    'h1',
    'h2',
    'h3',
    'code'
]

/**
 * Tags whose subtree is removed wholesale (instead of unwrapped) — the
 * inner text would otherwise leak through. Mirrors the OWASP HTML
 * Sanitizer "blocked content" list.
 */
export const BLOCKED_TAGS: ReadonlyArray<string> = [
    'script',
    'style',
    'iframe',
    'object',
    'embed',
    'form',
    'svg',
    'math',
    'link',
    'meta',
    'base'
]

/**
 * Attribute-level allowlist. Each tag declares the attributes it can
 * keep — anything else is stripped. Values still go through URL-scheme
 * and class-name validation downstream.
 */
export const ALLOWED_ATTRIBUTES: Readonly<Record<string, ReadonlyArray<string>>> = {
    a: ['href', 'class'],
    p: ['class'],
    ul: ['class'],
    ol: ['class'],
    li: ['class'],
    h1: ['class'],
    h2: ['class'],
    h3: ['class'],
    code: ['class'],
    strong: ['class'],
    em: ['class'],
    u: ['class'],
    b: ['class'],
    i: ['class']
}

/**
 * URL schemes allowed on `<a href>`. Tested against the start of the
 * trimmed, lower-cased value. Anything else (notably `javascript:`,
 * `data:`, `vbscript:`) is stripped.
 */
export const ALLOWED_URL_SCHEMES: ReadonlyArray<string> = [
    'http:',
    'https:',
    'mailto:',
    'tel:'
]

/**
 * Whitelist prefix for any `class` attribute that survives sanitisation.
 * Lets a future feature emit semantic class names (e.g. `origam-rich--callout`)
 * without re-opening the door to arbitrary class spraying.
 */
export const ALLOWED_CLASS_PREFIX = 'origam-rich--'
