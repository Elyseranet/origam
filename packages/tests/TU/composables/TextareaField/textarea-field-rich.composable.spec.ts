// Tests for `useTextareaRich`
// (packages/ds/src/composables/TextareaField/textarea-field-rich.composable.ts).
//
// C5 audit (#classeur composables): flagged `defaut` — zero TU coverage.
// `OrigamTextareaField.spec.ts` mounts the component in rich mode but only
// asserts the host element exists / typography vars — it never exercises
// `format`, `onKeydown`, `onPaste` or the sanitisation pipeline. This spec
// fills that gap.
//
// ⚠️ jsdom trap (measured directly, not assumed): `document.execCommand`
// and `document.queryCommandState` do NOT exist under jsdom — both are
// `undefined`, and calling either throws `TypeError: … is not a function`.
// `syncActiveState` already wraps its `queryCommandState` calls in a
// try/catch (a pre-existing Safari workaround, see the composable's own
// comment) so it degrades silently. `format()`'s `execCommand` calls have
// NO such guard, so every test that exercises `format()` stubs both via
// `vi.fn()` assigned directly on `document` (mirrors the project's
// documented `IntersectionObserver` pattern: replace the missing API with
// a double that exposes what it was called with, not a full re-implementation
// of contenteditable formatting — that behaviour is a browser feature this
// composable deliberately does not reimplement).
//
// The tag/heading detection path (`isInsideTag` / `currentHeadingLevel`,
// exercised through `syncActiveState`) is DIFFERENT: it only walks
// `document.getSelection()` / real DOM nodes, no `execCommand` involved —
// jsdom's Selection/Range API supports this natively, so those specs build
// a real selection and assert on real behaviour, not a stub.
//
// The composable needs `onMounted` / `onBeforeUnmount`, so every test
// mounts a real host component via `@vue/test-utils` rather than calling
// `useTextareaRich` at module scope.

import { defineComponent, h, nextTick } from 'vue'
import { mount } from '@vue/test-utils'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { useTextareaRich } from '@origam/composables/TextareaField/textarea-field-rich.composable'
import { TEXTAREA_TOOLBAR_COMMAND } from '@origam/enums'

// ---------------------------------------------------------------------------
// document.execCommand / queryCommandState stub (see header)
// ---------------------------------------------------------------------------

let execCommandSpy: ReturnType<typeof vi.fn>
let queryCommandStateSpy: ReturnType<typeof vi.fn>

beforeEach(() => {
    execCommandSpy = vi.fn().mockReturnValue(true)
    queryCommandStateSpy = vi.fn().mockReturnValue(false)
    ;(document as unknown as { execCommand: unknown }).execCommand = execCommandSpy
    ;(document as unknown as { queryCommandState: unknown }).queryCommandState = queryCommandStateSpy
})

afterEach(() => {
    delete (document as unknown as { execCommand?: unknown }).execCommand
    delete (document as unknown as { queryCommandState?: unknown }).queryCommandState
    document.getSelection()?.removeAllRanges()
})

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function mountRich (opts: { value?: string; disabled?: boolean } = {}) {
    const state = { value: opts.value ?? '', disabled: opts.disabled ?? false }
    const updates: string[] = []
    const formats: Array<{ command: string; value?: string }> = []
    let api!: ReturnType<typeof useTextareaRich>

    const Host = defineComponent({
        name: 'TextareaRichHost',
        setup () {
            api = useTextareaRich({
                disabled: () => state.disabled,
                value: () => state.value,
                onUpdate: (raw) => { updates.push(raw) },
                onFormat: (command, value) => { formats.push({ command, value }) }
            })
            return () => h('div', { contenteditable: 'true', ref: api.hostRef })
        }
    })

    const wrapper = mount(Host, { attachTo: document.body })

    return { wrapper, api: () => api, updates, formats, state }
}

/** Places a real DOM selection spanning `[start, end)` of `node`'s text. */
function selectTextRange (node: Node, start: number, end: number) {
    const range = document.createRange()
    range.setStart(node, start)
    range.setEnd(node, end)
    const sel = document.getSelection()!
    sel.removeAllRanges()
    sel.addRange(range)
}

// ---------------------------------------------------------------------------
// Mount lifecycle
// ---------------------------------------------------------------------------

describe('useTextareaRich — mount lifecycle', () => {
    it('seeds the host innerHTML from options.value(), sanitised', () => {
        const { api } = mountRich({ value: '<p>Hello</p>' })
        expect(api().hostRef.value?.innerHTML).toBe('<p>Hello</p>')
    })

    it('strips disallowed content from the seed value (defense in depth)', () => {
        const { api } = mountRich({ value: '<p>Hi <script>alert(1)</script></p>' })
        expect(api().hostRef.value?.innerHTML).not.toContain('script')
        expect(api().hostRef.value?.innerHTML).toContain('Hi')
    })

    it('registers a document-level selectionchange listener on mount', () => {
        const addSpy = vi.spyOn(document, 'addEventListener')
        mountRich()
        expect(addSpy).toHaveBeenCalledWith('selectionchange', expect.any(Function))
        addSpy.mockRestore()
    })

    it('removes the selectionchange listener on unmount (no leak)', () => {
        const removeSpy = vi.spyOn(document, 'removeEventListener')
        const { wrapper } = mountRich()
        wrapper.unmount()
        expect(removeSpy).toHaveBeenCalledWith('selectionchange', expect.any(Function))
        removeSpy.mockRestore()
    })
})

// ---------------------------------------------------------------------------
// format() — command dispatch (execCommand call args)
// ---------------------------------------------------------------------------

describe('useTextareaRich — format() command dispatch', () => {
    it('BOLD → execCommand("bold")', () => {
        const { api } = mountRich()
        api().format(TEXTAREA_TOOLBAR_COMMAND.BOLD)
        expect(execCommandSpy).toHaveBeenCalledWith('bold')
    })

    it('ITALIC → execCommand("italic")', () => {
        const { api } = mountRich()
        api().format(TEXTAREA_TOOLBAR_COMMAND.ITALIC)
        expect(execCommandSpy).toHaveBeenCalledWith('italic')
    })

    it('UNDERLINE → execCommand("underline")', () => {
        const { api } = mountRich()
        api().format(TEXTAREA_TOOLBAR_COMMAND.UNDERLINE)
        expect(execCommandSpy).toHaveBeenCalledWith('underline')
    })

    it('LIST_BULLET → execCommand("insertUnorderedList")', () => {
        const { api } = mountRich()
        api().format(TEXTAREA_TOOLBAR_COMMAND.LIST_BULLET)
        expect(execCommandSpy).toHaveBeenCalledWith('insertUnorderedList')
    })

    it('LIST_ORDERED → execCommand("insertOrderedList")', () => {
        const { api } = mountRich()
        api().format(TEXTAREA_TOOLBAR_COMMAND.LIST_ORDERED)
        expect(execCommandSpy).toHaveBeenCalledWith('insertOrderedList')
    })

    it('LINK with a non-blank value → execCommand("createLink", false, url)', () => {
        const { api } = mountRich()
        api().format(TEXTAREA_TOOLBAR_COMMAND.LINK, 'https://example.com')
        expect(execCommandSpy).toHaveBeenCalledWith('createLink', false, 'https://example.com')
    })

    it('LINK with a blank/whitespace value is a full no-op (no execCommand, no onFormat, no onUpdate)', () => {
        const { api, formats, updates } = mountRich()
        api().format(TEXTAREA_TOOLBAR_COMMAND.LINK, '   ')
        expect(execCommandSpy).not.toHaveBeenCalled()
        expect(formats).toEqual([])
        expect(updates).toEqual([])
    })

    it('HEADING_1 (no current heading) → execCommand("formatBlock", false, "H1")', () => {
        const { api } = mountRich()
        api().format(TEXTAREA_TOOLBAR_COMMAND.HEADING_1)
        expect(execCommandSpy).toHaveBeenCalledWith('formatBlock', false, 'H1')
    })

    it('HEADING_2 → execCommand("formatBlock", false, "H2")', () => {
        const { api } = mountRich()
        api().format(TEXTAREA_TOOLBAR_COMMAND.HEADING_2)
        expect(execCommandSpy).toHaveBeenCalledWith('formatBlock', false, 'H2')
    })

    it('HEADING_3 → execCommand("formatBlock", false, "H3")', () => {
        const { api } = mountRich()
        api().format(TEXTAREA_TOOLBAR_COMMAND.HEADING_3)
        expect(execCommandSpy).toHaveBeenCalledWith('formatBlock', false, 'H3')
    })

    it('CLEAR_FORMAT → removeFormat THEN formatBlock("P"), in that order', () => {
        const { api } = mountRich()
        api().format(TEXTAREA_TOOLBAR_COMMAND.CLEAR_FORMAT)
        expect(execCommandSpy.mock.calls).toEqual([
            ['removeFormat'],
            ['formatBlock', false, 'P']
        ])
    })

    it('CODE_INLINE with a collapsed caret (no text selected) inserts a zero-width placeholder', () => {
        // `format()` calls `hostRef.value.focus()` before dispatching — under
        // jsdom (verified via a standalone probe against the exact
        // @vue/test-utils + `attachTo: document.body` mount shape used here)
        // that FIRST focus() itself creates a real, collapsed Selection
        // inside the host (rangeCount=1, `toString()` === ''). So "nothing
        // selected" is NOT the same as "no Selection at all" in this
        // environment — it is a collapsed one, which is exactly the case
        // `toggleInlineCode` documents as the zero-width-space fallback.
        const { api, formats } = mountRich()
        api().format(TEXTAREA_TOOLBAR_COMMAND.CODE_INLINE)
        expect(execCommandSpy).toHaveBeenCalledWith('insertHTML', false, '<code>&#8203;</code>')
        expect(formats).toEqual([{ command: TEXTAREA_TOOLBAR_COMMAND.CODE_INLINE, value: undefined }])
    })

    it('CODE_INLINE with a real text selection wraps it via insertHTML', () => {
        // The host must already be the `document.activeElement` BEFORE the
        // selection is set: `format()`'s own `hostRef.value.focus()` call
        // collapses any selection made on an element that was not yet
        // focused (same jsdom quirk as above), but is a no-op — selection
        // preserved — when the element is already active. Confirmed via the
        // same standalone probe.
        const { api } = mountRich({ value: '<p>hello</p>' })
        const host = api().hostRef.value!
        host.focus()
        const p = host.querySelector('p')!
        selectTextRange(p.firstChild!, 0, 5)

        api().format(TEXTAREA_TOOLBAR_COMMAND.CODE_INLINE)

        expect(execCommandSpy).toHaveBeenCalledWith('insertHTML', false, '<code>hello</code>')
    })

    it('every successful command notifies onFormat(command, value) and onUpdate(sanitised html)', () => {
        const { api, formats, updates } = mountRich({ value: '<p>x</p>' })
        api().format(TEXTAREA_TOOLBAR_COMMAND.BOLD)
        expect(formats).toEqual([{ command: TEXTAREA_TOOLBAR_COMMAND.BOLD, value: undefined }])
        expect(updates).toEqual(['<p>x</p>'])
    })
})

// ---------------------------------------------------------------------------
// format() — disabled guard
// ---------------------------------------------------------------------------

describe('useTextareaRich — format() disabled guard', () => {
    it('disabled=true → format() is a complete no-op', () => {
        const { api, formats, updates } = mountRich({ disabled: true })
        api().format(TEXTAREA_TOOLBAR_COMMAND.BOLD)
        expect(execCommandSpy).not.toHaveBeenCalled()
        expect(formats).toEqual([])
        expect(updates).toEqual([])
    })
})

// ---------------------------------------------------------------------------
// syncActiveState — real DOM/Selection tag & heading detection (no execCommand)
// ---------------------------------------------------------------------------

describe('useTextareaRich — active state from real selection (tag/heading walk)', () => {
    it('active.code becomes true when the caret sits inside a real <code> element', async () => {
        const { api } = mountRich({ value: '<p>before <code>inline</code> after</p>' })
        const codeText = api().hostRef.value!.querySelector('code')!.firstChild!
        selectTextRange(codeText, 1, 3)

        document.dispatchEvent(new Event('selectionchange'))
        await nextTick()

        expect(api().active.code).toBe(true)
    })

    it('active.code stays false when the selection is outside any <code> element', async () => {
        const { api } = mountRich({ value: '<p>before <code>inline</code> after</p>' })
        const p = api().hostRef.value!.querySelector('p')!
        const afterText = p.lastChild!
        selectTextRange(afterText, 0, 3)

        document.dispatchEvent(new Event('selectionchange'))
        await nextTick()

        expect(api().active.code).toBe(false)
    })

    it('active.link becomes true when the caret sits inside a real <a> element', async () => {
        const { api } = mountRich({ value: '<p><a href="https://x.test">link</a></p>' })
        const linkText = api().hostRef.value!.querySelector('a')!.firstChild!
        selectTextRange(linkText, 0, 2)

        document.dispatchEvent(new Event('selectionchange'))
        await nextTick()

        expect(api().active.link).toBe(true)
    })

    it('active.heading reflects the real ancestor heading level (h2 → 2)', async () => {
        const { api } = mountRich({ value: '<h2>Title</h2>' })
        const headingText = api().hostRef.value!.querySelector('h2')!.firstChild!
        selectTextRange(headingText, 0, 2)

        document.dispatchEvent(new Event('selectionchange'))
        await nextTick()

        expect(api().active.heading).toBe(2)
    })

    it('a selectionchange OUTSIDE the host is ignored (no state churn)', async () => {
        const { api } = mountRich({ value: '<p>hello</p>' })
        const outside = document.createElement('div')
        outside.textContent = 'outside'
        document.body.appendChild(outside)
        selectTextRange(outside.firstChild!, 0, 3)

        document.dispatchEvent(new Event('selectionchange'))
        await nextTick()

        expect(api().active.heading).toBe(0)
        expect(api().active.code).toBe(false)
    })
})

// ---------------------------------------------------------------------------
// isFormatActive — command → active-state field mapping
// ---------------------------------------------------------------------------

describe('useTextareaRich — isFormatActive mapping', () => {
    it('maps each command to its own active-state field', () => {
        const { api } = mountRich()
        api().active.bold = true
        expect(api().isFormatActive(TEXTAREA_TOOLBAR_COMMAND.BOLD)).toBe(true)
        expect(api().isFormatActive(TEXTAREA_TOOLBAR_COMMAND.ITALIC)).toBe(false)

        api().active.heading = 2
        expect(api().isFormatActive(TEXTAREA_TOOLBAR_COMMAND.HEADING_2)).toBe(true)
        expect(api().isFormatActive(TEXTAREA_TOOLBAR_COMMAND.HEADING_1)).toBe(false)
        expect(api().isFormatActive(TEXTAREA_TOOLBAR_COMMAND.HEADING)).toBe(false)
    })

    it('an unmapped command (e.g. CLEAR_FORMAT) always reports inactive', () => {
        const { api } = mountRich()
        expect(api().isFormatActive(TEXTAREA_TOOLBAR_COMMAND.CLEAR_FORMAT)).toBe(false)
    })
})

// ---------------------------------------------------------------------------
// onKeydown — shortcuts
// ---------------------------------------------------------------------------

function makeKeydown (opts: { key: string; metaKey?: boolean; ctrlKey?: boolean; shiftKey?: boolean }) {
    return {
        key: opts.key,
        metaKey: opts.metaKey ?? false,
        ctrlKey: opts.ctrlKey ?? false,
        shiftKey: opts.shiftKey ?? false,
        preventDefault: vi.fn()
    } as unknown as KeyboardEvent
}

describe('useTextareaRich — onKeydown shortcuts', () => {
    it('Cmd+B → preventDefault + BOLD dispatched', () => {
        const { api } = mountRich()
        const evt = makeKeydown({ key: 'b', metaKey: true })
        api().onKeydown(evt)
        expect((evt.preventDefault as ReturnType<typeof vi.fn>)).toHaveBeenCalled()
        expect(execCommandSpy).toHaveBeenCalledWith('bold')
    })

    it('Ctrl+I → ITALIC dispatched (ctrlKey path, not just metaKey)', () => {
        const { api } = mountRich()
        api().onKeydown(makeKeydown({ key: 'i', ctrlKey: true }))
        expect(execCommandSpy).toHaveBeenCalledWith('italic')
    })

    it('Cmd+U → UNDERLINE dispatched', () => {
        const { api } = mountRich()
        api().onKeydown(makeKeydown({ key: 'u', metaKey: true }))
        expect(execCommandSpy).toHaveBeenCalledWith('underline')
    })

    it('Cmd+Shift+7 → LIST_ORDERED dispatched', () => {
        const { api } = mountRich()
        api().onKeydown(makeKeydown({ key: '7', metaKey: true, shiftKey: true }))
        expect(execCommandSpy).toHaveBeenCalledWith('insertOrderedList')
    })

    it('Cmd+Shift+8 → LIST_BULLET dispatched', () => {
        const { api } = mountRich()
        api().onKeydown(makeKeydown({ key: '8', metaKey: true, shiftKey: true }))
        expect(execCommandSpy).toHaveBeenCalledWith('insertUnorderedList')
    })

    it('Cmd+K notifies onFormat(LINK) directly WITHOUT going through format()/execCommand', () => {
        const { api, formats } = mountRich()
        api().onKeydown(makeKeydown({ key: 'k', metaKey: true }))
        expect(execCommandSpy).not.toHaveBeenCalled()
        expect(formats).toEqual([{ command: TEXTAREA_TOOLBAR_COMMAND.LINK, value: undefined }])
    })

    it('a plain keydown with no meta/ctrl is ignored entirely', () => {
        const { api } = mountRich()
        const evt = makeKeydown({ key: 'b' })
        api().onKeydown(evt)
        expect((evt.preventDefault as ReturnType<typeof vi.fn>)).not.toHaveBeenCalled()
        expect(execCommandSpy).not.toHaveBeenCalled()
    })

    it('an unmapped meta shortcut does nothing (falls through every case)', () => {
        const { api } = mountRich()
        api().onKeydown(makeKeydown({ key: 'x', metaKey: true }))
        expect(execCommandSpy).not.toHaveBeenCalled()
    })

    it('disabled=true short-circuits before even checking metaKey/ctrlKey', () => {
        const { api } = mountRich({ disabled: true })
        const evt = makeKeydown({ key: 'b', metaKey: true })
        api().onKeydown(evt)
        expect((evt.preventDefault as ReturnType<typeof vi.fn>)).not.toHaveBeenCalled()
        expect(execCommandSpy).not.toHaveBeenCalled()
    })
})

// ---------------------------------------------------------------------------
// onPaste
// ---------------------------------------------------------------------------

function makePasteEvent (data: Partial<Record<'text/html' | 'text/plain', string>> | null) {
    return {
        preventDefault: vi.fn(),
        clipboardData: data
            ? { getData: (type: string) => data[type as 'text/html' | 'text/plain'] ?? '' }
            : null
    } as unknown as ClipboardEvent
}

describe('useTextareaRich — onPaste', () => {
    it('HTML clipboard payload is sanitised then inserted via insertHTML', () => {
        const { api } = mountRich()
        const evt = makePasteEvent({ 'text/html': '<p>pasted <script>bad()</script></p>' })
        api().onPaste(evt)

        expect((evt.preventDefault as ReturnType<typeof vi.fn>)).toHaveBeenCalled()
        const [command, ui, html] = execCommandSpy.mock.calls[0]
        expect(command).toBe('insertHTML')
        expect(ui).toBe(false)
        expect(html).not.toContain('script')
        expect(html).toContain('pasted')
    })

    it('plain-text-only payload is escaped and newlines become <br>', () => {
        const { api } = mountRich()
        const evt = makePasteEvent({ 'text/plain': 'a < b\nsecond line' })
        api().onPaste(evt)

        expect(execCommandSpy).toHaveBeenCalledWith(
            'insertHTML', false, 'a &lt; b<br>second line'
        )
    })

    it('disabled=true → no-op, preventDefault never called (guard runs before it)', () => {
        const { api } = mountRich({ disabled: true })
        const evt = makePasteEvent({ 'text/plain': 'x' })
        api().onPaste(evt)

        expect((evt.preventDefault as ReturnType<typeof vi.fn>)).not.toHaveBeenCalled()
        expect(execCommandSpy).not.toHaveBeenCalled()
    })

    it('missing clipboardData → preventDefault still runs, but nothing is inserted', () => {
        const { api } = mountRich()
        const evt = makePasteEvent(null)
        api().onPaste(evt)

        expect((evt.preventDefault as ReturnType<typeof vi.fn>)).toHaveBeenCalled()
        expect(execCommandSpy).not.toHaveBeenCalled()
    })

    it('notifies onUpdate after a successful paste', () => {
        const { api, updates } = mountRich({ value: '<p>seed</p>' })
        api().onPaste(makePasteEvent({ 'text/plain': 'x' }))
        expect(updates).toHaveLength(1)
    })
})

// ---------------------------------------------------------------------------
// onInput
// ---------------------------------------------------------------------------

describe('useTextareaRich — onInput', () => {
    it('sanitises the CURRENT host innerHTML and forwards it to onUpdate', () => {
        const { api, updates } = mountRich({ value: '<p>seed</p>' })
        api().hostRef.value!.innerHTML = '<p>typed <script>bad()</script>text</p>'

        api().onInput()

        expect(updates).toHaveLength(1)
        expect(updates[0]).not.toContain('script')
        expect(updates[0]).toContain('typed')
    })
})

// ---------------------------------------------------------------------------
// setValue — imperative API, skips a no-op write
// ---------------------------------------------------------------------------

describe('useTextareaRich — setValue', () => {
    it('sanitises and applies a genuinely different value', () => {
        const { api } = mountRich({ value: '<p>old</p>' })
        api().setValue('<p>new</p>')
        expect(api().hostRef.value?.innerHTML).toBe('<p>new</p>')
    })

    it('does NOT touch innerHTML when the sanitised value is unchanged (avoids a caret-killing reset)', () => {
        const { api } = mountRich({ value: '<p>same</p>' })
        const setSpy = vi.spyOn(api().hostRef.value!, 'innerHTML', 'set')

        api().setValue('<p>same</p>')

        expect(setSpy).not.toHaveBeenCalled()
        setSpy.mockRestore()
    })
})
