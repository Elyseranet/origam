/**
 * Lightweight HTML → Markdown converter used by `OrigamTextareaField`
 * when `output="markdown"`. The input is expected to be pre-sanitised
 * HTML (see `sanitizeHtml`).
 *
 * The conversion is intentionally conservative — only the tags emitted
 * by the rich-toolbar are translated:
 *   <strong>/<b>          → **text**
 *   <em>/<i>              → *text*
 *   <u>                   → <u>text</u>   (no canonical Markdown for underline)
 *   <a href="X">Y</a>     → [Y](X)
 *   <ul><li>…</li></ul>   → - …
 *   <ol><li>…</li></ol>   → 1. …
 *   <h1>/<h2>/<h3>        → # / ## / ###
 *   <code>                → `text`
 *   <p>                   → paragraph (double newline)
 *   <br>                  → single newline
 *
 * Anything else is unwrapped (text content kept).
 */
export function htmlToMarkdown(input: string): string {
    if (input == null || input === '') return ''
    if (typeof input !== 'string') return ''
    if (typeof DOMParser === 'undefined') return input

    const parser = new DOMParser()
    const doc = parser.parseFromString(`<div id="__origam_md_root__">${input}</div>`, 'text/html')
    const root = doc.getElementById('__origam_md_root__')
    if (!root) return ''

    return collapseBlankLines(walk(root).trim())
}

function walk(node: Node): string {
    if (node.nodeType === 3 /* TEXT */) return (node as Text).data
    if (node.nodeType !== 1 /* ELEMENT */) return ''

    const el = node as Element
    const tag = el.tagName.toLowerCase()
    const inner = Array.from(el.childNodes).map(walk).join('')

    switch (tag) {
        case 'strong':
        case 'b':
            return inner ? `**${inner}**` : ''

        case 'em':
        case 'i':
            return inner ? `*${inner}*` : ''

        case 'u':
            return inner ? `<u>${inner}</u>` : ''

        case 'code':
            return inner ? `\`${inner}\`` : ''

        case 'a': {
            const href = el.getAttribute('href') ?? ''
            if (!inner) return ''
            if (!href) return inner
            return `[${inner}](${href})`
        }

        case 'br':
            return '\n'

        case 'p':
            return inner ? `\n\n${inner}\n\n` : ''

        case 'h1':
            return inner ? `\n\n# ${inner}\n\n` : ''

        case 'h2':
            return inner ? `\n\n## ${inner}\n\n` : ''

        case 'h3':
            return inner ? `\n\n### ${inner}\n\n` : ''

        case 'ul':
            return '\n' + listItems(el, '- ') + '\n'

        case 'ol':
            return '\n' + listItems(el, (idx) => `${idx + 1}. `) + '\n'

        case 'li':
            return inner

        default:
            return inner
    }
}

function listItems(parent: Element, prefix: string | ((idx: number) => string)): string {
    return Array.from(parent.children)
            .filter((c) => c.tagName.toLowerCase() === 'li')
            .map((li, idx) => {
                const head = typeof prefix === 'string' ? prefix : prefix(idx)
                return head + Array.from(li.childNodes).map(walk).join('')
            })
            .join('\n')
}

function collapseBlankLines(s: string): string {
    return s.replace(/\n{3,}/g, '\n\n')
}
