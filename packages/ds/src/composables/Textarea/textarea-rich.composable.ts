import { onBeforeUnmount, onMounted, reactive, ref } from 'vue'

import { TEXTAREA_TOOLBAR_COMMAND } from '../../enums'

import type {
    ITextareaRichActiveState,
    IUseTextareaRichOptions
} from '../../interfaces'

import type { TTextareaToolbarCommand } from '../../types'

import { sanitizeHtml } from '../../utils'

/**
 * Owns the runtime contract of the rich-text textarea:
 *
 *  - mounts a `contenteditable` host (caller binds the returned ref);
 *  - applies formatting commands via `document.execCommand` (the simplest
 *    contenteditable API still supported by all evergreen browsers — we
 *    deliberately avoid Selection / Range hand-rolling to keep the
 *    surface tiny without an external library);
 *  - tracks the active formatting state at the caret via
 *    `document.queryCommandState` for the toolbar UI;
 *  - sanitises every emit so the consumer's `v-model` can never carry
 *    a `<script>` or a `javascript:` href;
 *  - registers Cmd/Ctrl keyboard shortcuts (B / I / U / K / E and the
 *    list shortcuts) on the host.
 *
 * `execCommand` is "deprecated" by spec but stays the only first-party
 * way to do this without a 100 KB library; we accept the tradeoff and
 * document the limitations (no IME-safe undo stack, no granular
 * collaborative cursor) downstream.
 */
export function useTextareaRich(options: IUseTextareaRichOptions) {
    const hostRef = ref<HTMLElement>()
    const active = reactive<ITextareaRichActiveState>({
        bold: false,
        italic: false,
        underline: false,
        code: false,
        link: false,
        listBullet: false,
        listOrdered: false,
        heading: 0
    })

    let selectionListener: (() => void) | null = null

    /*****************************************************
     * Mount lifecycle
     ****************************************************/

    onMounted(() => {
        if (!hostRef.value) return
        hostRef.value.innerHTML = sanitizeHtml(options.value())

        selectionListener = () => {
            // Only update when the selection actually lives inside our host.
            const sel = document.getSelection()
            if (!sel || sel.rangeCount === 0) return
            const node = sel.anchorNode as Node | null
            if (!node || !hostRef.value?.contains(node)) return
            syncActiveState()
        }
        document.addEventListener('selectionchange', selectionListener)
    })

    onBeforeUnmount(() => {
        if (selectionListener) {
            document.removeEventListener('selectionchange', selectionListener)
            selectionListener = null
        }
    })

    /*****************************************************
     * State sync
     ****************************************************/

    function syncActiveState(): void {
        if (typeof document === 'undefined') return

        try {
            active.bold = document.queryCommandState('bold')
            active.italic = document.queryCommandState('italic')
            active.underline = document.queryCommandState('underline')
            active.listBullet = document.queryCommandState('insertUnorderedList')
            active.listOrdered = document.queryCommandState('insertOrderedList')
        } catch {
            // Safari sporadically throws on queryCommandState when the
            // selection is outside any editable container — silently fall
            // back to "not active".
        }

        active.code = isInsideTag('code')
        active.link = isInsideTag('a')

        const headingLevel = currentHeadingLevel()
        active.heading = headingLevel
    }

    function isInsideTag(tag: string): boolean {
        if (typeof document === 'undefined' || !hostRef.value) return false
        const sel = document.getSelection()
        if (!sel || sel.rangeCount === 0) return false
        let node: Node | null = sel.anchorNode
        while (node && node !== hostRef.value) {
            if (node.nodeType === 1 && (node as Element).tagName.toLowerCase() === tag) return true
            node = node.parentNode
        }
        return false
    }

    function currentHeadingLevel(): 0 | 1 | 2 | 3 {
        if (typeof document === 'undefined' || !hostRef.value) return 0
        const sel = document.getSelection()
        if (!sel || sel.rangeCount === 0) return 0
        let node: Node | null = sel.anchorNode
        while (node && node !== hostRef.value) {
            if (node.nodeType === 1) {
                const t = (node as Element).tagName.toLowerCase()
                if (t === 'h1') return 1
                if (t === 'h2') return 2
                if (t === 'h3') return 3
            }
            node = node.parentNode
        }
        return 0
    }

    /*****************************************************
     * Commands
     ****************************************************/

    function format(command: TTextareaToolbarCommand, value?: string): void {
        if (options.disabled()) return
        if (typeof document === 'undefined') return

        hostRef.value?.focus()

        switch (command) {
            case TEXTAREA_TOOLBAR_COMMAND.BOLD:
                document.execCommand('bold')
                break
            case TEXTAREA_TOOLBAR_COMMAND.ITALIC:
                document.execCommand('italic')
                break
            case TEXTAREA_TOOLBAR_COMMAND.UNDERLINE:
                document.execCommand('underline')
                break
            case TEXTAREA_TOOLBAR_COMMAND.LINK: {
                const url = (value ?? '').trim()
                if (url === '') return
                document.execCommand('createLink', false, url)
                break
            }
            case TEXTAREA_TOOLBAR_COMMAND.LIST_BULLET:
                document.execCommand('insertUnorderedList')
                break
            case TEXTAREA_TOOLBAR_COMMAND.LIST_ORDERED:
                document.execCommand('insertOrderedList')
                break
            case TEXTAREA_TOOLBAR_COMMAND.HEADING:
            case TEXTAREA_TOOLBAR_COMMAND.HEADING_1:
                applyHeadingCycle(['H1', 'H2', 'H3'])
                break
            case TEXTAREA_TOOLBAR_COMMAND.HEADING_2:
                document.execCommand('formatBlock', false, 'H2')
                break
            case TEXTAREA_TOOLBAR_COMMAND.HEADING_3:
                document.execCommand('formatBlock', false, 'H3')
                break
            case TEXTAREA_TOOLBAR_COMMAND.CODE_INLINE:
                toggleInlineCode()
                break
            case TEXTAREA_TOOLBAR_COMMAND.CLEAR_FORMAT:
                document.execCommand('removeFormat')
                document.execCommand('formatBlock', false, 'P')
                break
        }

        options.onFormat(command, value)
        emitSanitised()
        syncActiveState()
    }

    function applyHeadingCycle(levels: string[]): void {
        const current = currentHeadingLevel()
        if (current === 0) {
            document.execCommand('formatBlock', false, levels[0])
        } else if (current < levels.length) {
            document.execCommand('formatBlock', false, levels[current])
        } else {
            document.execCommand('formatBlock', false, 'P')
        }
    }

    function toggleInlineCode(): void {
        if (active.code) {
            // execCommand has no "remove inline code" — fall back to
            // removeFormat which strips inline wrappers around the
            // selection.
            document.execCommand('removeFormat')
            return
        }
        // `insertHTML` keeps the user's actual selected text wrapped in
        // a <code> tag and is supported across evergreen browsers.
        const sel = document.getSelection()
        if (!sel || sel.rangeCount === 0) return
        const text = sel.toString()
        if (text === '') {
            document.execCommand('insertHTML', false, '<code>&#8203;</code>')
            return
        }
        const escaped = text
                .replace(/&/g, '&amp;')
                .replace(/</g, '&lt;')
                .replace(/>/g, '&gt;')
        document.execCommand('insertHTML', false, `<code>${escaped}</code>`)
    }

    /*****************************************************
     * Emit
     ****************************************************/

    function emitSanitised(): void {
        if (!hostRef.value) return
        const raw = hostRef.value.innerHTML
        const cleaned = sanitizeHtml(raw)
        options.onUpdate(cleaned)
    }

    /*****************************************************
     * Event handlers (caller binds them on the host)
     ****************************************************/

    function onInput(): void {
        emitSanitised()
    }

    function onKeydown(event: KeyboardEvent): void {
        if (options.disabled()) return
        const metaOrCtrl = event.metaKey || event.ctrlKey
        if (!metaOrCtrl) return
        const key = event.key.toLowerCase()

        if (event.shiftKey) {
            if (key === '7') {
                event.preventDefault()
                format(TEXTAREA_TOOLBAR_COMMAND.LIST_ORDERED)
                return
            }
            if (key === '8') {
                event.preventDefault()
                format(TEXTAREA_TOOLBAR_COMMAND.LIST_BULLET)
                return
            }
        }

        switch (key) {
            case 'b':
                event.preventDefault()
                format(TEXTAREA_TOOLBAR_COMMAND.BOLD)
                return
            case 'i':
                event.preventDefault()
                format(TEXTAREA_TOOLBAR_COMMAND.ITALIC)
                return
            case 'u':
                event.preventDefault()
                format(TEXTAREA_TOOLBAR_COMMAND.UNDERLINE)
                return
            case 'e':
                event.preventDefault()
                format(TEXTAREA_TOOLBAR_COMMAND.CODE_INLINE)
                return
            case 'k':
                // The host component owns the link popover UI — surface
                // the keydown via the format emit with no value so it
                // can open the prompt.
                event.preventDefault()
                options.onFormat(TEXTAREA_TOOLBAR_COMMAND.LINK)
                return
        }
    }

    function onPaste(event: ClipboardEvent): void {
        if (options.disabled()) return
        event.preventDefault()
        const dt = event.clipboardData
        if (!dt) return
        const html = dt.getData('text/html')
        const text = dt.getData('text/plain')
        const payload = html ? sanitizeHtml(html) : escapeText(text)
        document.execCommand('insertHTML', false, payload)
        emitSanitised()
    }

    function escapeText(s: string): string {
        return String(s)
                .replace(/&/g, '&amp;')
                .replace(/</g, '&lt;')
                .replace(/>/g, '&gt;')
                .replace(/\n/g, '<br>')
    }

    /*****************************************************
     * Imperative API for the host
     ****************************************************/

    function setValue(html: string): void {
        if (!hostRef.value) return
        const clean = sanitizeHtml(html)
        if (hostRef.value.innerHTML !== clean) {
            hostRef.value.innerHTML = clean
        }
    }

    function isFormatActive(command: TTextareaToolbarCommand): boolean {
        switch (command) {
            case TEXTAREA_TOOLBAR_COMMAND.BOLD: return active.bold
            case TEXTAREA_TOOLBAR_COMMAND.ITALIC: return active.italic
            case TEXTAREA_TOOLBAR_COMMAND.UNDERLINE: return active.underline
            case TEXTAREA_TOOLBAR_COMMAND.CODE_INLINE: return active.code
            case TEXTAREA_TOOLBAR_COMMAND.LINK: return active.link
            case TEXTAREA_TOOLBAR_COMMAND.LIST_BULLET: return active.listBullet
            case TEXTAREA_TOOLBAR_COMMAND.LIST_ORDERED: return active.listOrdered
            case TEXTAREA_TOOLBAR_COMMAND.HEADING:
            case TEXTAREA_TOOLBAR_COMMAND.HEADING_1: return active.heading === 1
            case TEXTAREA_TOOLBAR_COMMAND.HEADING_2: return active.heading === 2
            case TEXTAREA_TOOLBAR_COMMAND.HEADING_3: return active.heading === 3
            default: return false
        }
    }

    return {
        hostRef,
        active,
        format,
        isFormatActive,
        setValue,
        onInput,
        onKeydown,
        onPaste
    }
}
