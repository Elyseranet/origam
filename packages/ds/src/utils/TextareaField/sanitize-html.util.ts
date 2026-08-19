import {
    ALLOWED_ATTRIBUTES,
    ALLOWED_CLASS_PREFIX,
    ALLOWED_TAGS,
    ALLOWED_URL_SCHEMES,
    BLOCKED_TAGS
} from '../../consts'

/**
 * In-house HTML sanitiser used by `OrigamTextareaField` in `mode="rich"`.
 *
 * It walks a `DOMParser`-built DOM, then for each element:
 *  - drops the subtree if the tag is in `BLOCKED_TAGS`;
 *  - keeps the tag (filtering attributes) when it's in `ALLOWED_TAGS`;
 *  - otherwise unwraps it (children promoted to the parent).
 *
 * On `<a>` the href is validated against `ALLOWED_URL_SCHEMES`. Any
 * attribute starting with `on` is dropped before per-tag filtering —
 * defense in depth against event-handler smuggling.
 *
 * SSR safe: returns the raw input untouched when `DOMParser` is missing
 * (the rich mode never runs server-side because the contenteditable
 * surface is gated behind `onMounted`).
 */
export function sanitizeHtml(input: string): string {
    if (input == null || input === '') return ''
    if (typeof input !== 'string') return ''
    if (typeof DOMParser === 'undefined') return input

    const parser = new DOMParser()
    const doc = parser.parseFromString(`<div id="__origam_root__">${input}</div>`, 'text/html')
    const root = doc.getElementById('__origam_root__')
    if (!root) return ''

    walk(root)

    return root.innerHTML
}

function walk(node: Element): void {
    // We mutate children while iterating — snapshot first.
    const children = Array.from(node.children) as Element[]

    for (const child of children) {
        const tag = child.tagName.toLowerCase()

        if (BLOCKED_TAGS.includes(tag)) {
            child.remove()
            continue
        }

        if (!ALLOWED_TAGS.includes(tag)) {
            // Recurse FIRST so any blocked descendants (e.g. <script>
            // nested in a disallowed <span>) are removed before the
            // wrapper itself is unwrapped — otherwise the promoted
            // children carry the malicious payload up to the parent.
            walk(child)
            unwrap(child)
            continue
        }

        sanitizeAttributes(child, tag)
        walk(child)
    }
}

function unwrap(el: Element): void {
    const parent = el.parentNode
    if (!parent) {
        el.remove()
        return
    }
    while (el.firstChild) parent.insertBefore(el.firstChild, el)
    parent.removeChild(el)
}

function sanitizeAttributes(el: Element, tag: string): void {
    const allowed = ALLOWED_ATTRIBUTES[tag] ?? []
    // `attributes` is a live NamedNodeMap; snapshot first.
    const attrs = Array.from(el.attributes)

    for (const attr of attrs) {
        const name = attr.name.toLowerCase()

        if (name.startsWith('on')) {
            el.removeAttribute(attr.name)
            continue
        }

        if (!allowed.includes(name)) {
            el.removeAttribute(attr.name)
            continue
        }

        if (name === 'href') {
            if (!isSafeUrl(attr.value)) {
                el.removeAttribute(attr.name)
                continue
            }
            // Harden external links — applied after the URL check so the
            // browser's URL parser already produced the trimmed value.
            ;(el as HTMLAnchorElement).setAttribute('rel', 'noopener noreferrer nofollow')
            ;(el as HTMLAnchorElement).setAttribute('target', '_blank')
        }

        if (name === 'class') {
            const cleaned = filterClassList(attr.value)
            if (cleaned === '') el.removeAttribute(attr.name)
            else el.setAttribute(attr.name, cleaned)
        }
    }
}

function isSafeUrl(raw: string): boolean {
    const value = String(raw).trim()
    if (value === '') return false
    // Same-origin / relative paths are allowed without scheme — they
    // cannot trigger a `javascript:` payload.
    if (value.startsWith('/') || value.startsWith('#') || value.startsWith('?')) return true
    const lower = value.toLowerCase()
    return ALLOWED_URL_SCHEMES.some((scheme) => lower.startsWith(scheme))
}

function filterClassList(value: string): string {
    return String(value)
            .split(/\s+/)
            .filter((cls) => cls.startsWith(ALLOWED_CLASS_PREFIX))
            .join(' ')
}
