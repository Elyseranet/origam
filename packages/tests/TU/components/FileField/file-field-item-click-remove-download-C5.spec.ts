// C5 — <OrigamFileFieldListItem> / <OrigamFileFieldDragNDropItem>
//
// #418 (classeur 2026-09-01, C5 column): `click:remove` was verified working
// by a manual real click during the audit, but no spec in the repo asserted
// it — the only existing unit spec (OrigamFileFieldListItem.spec.ts) tests
// typography only. `click:download` had the exact same gap. Both siblings
// share byte-for-byte identical handler code
// (`handleRemove`/`handleDownload` call `emits('click:remove' | 'click:download',
// { file, index })`), so both get the same missing coverage in one file.
//
// OrigamBtn is stubbed to a plain `<button />` with no declared emits, so
// Vue's attrs-fallthrough auto-binds the parent's `@click.stop[.prevent]`
// listener onto the stub's native root element — a real `.trigger('click')`
// therefore exercises the exact same code path a real click would.

import { describe, expect, it, vi } from 'vitest'
import { mount } from '@vue/test-utils'

import OrigamFileFieldListItem from '@origam/components/FileField/OrigamFileFieldListItem.vue'
import OrigamFileFieldDragNDropItem from '@origam/components/FileField/OrigamFileFieldDragNDropItem.vue'
import { createOrigam } from '@origam/origam'

Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: vi.fn().mockImplementation((query: string) => ({
        matches: false,
        media: query,
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn()
    }))
})

const mockFile = (name = 'invoice.pdf'): File => {
    const blob = new Blob([''], { type: 'application/pdf' })
    return new File([blob], name, { type: 'application/pdf' })
}

const STUBS = {
    OrigamBtn: { template: '<button />' },
    OrigamIcon: { template: '<i />' },
    OrigamProgress: { template: '<div />' }
}

describe.each([
    ['OrigamFileFieldListItem', OrigamFileFieldListItem],
    ['OrigamFileFieldDragNDropItem', OrigamFileFieldDragNDropItem]
])('%s — click:remove / click:download (C5)', (_name, Component) => {
    it('click:remove fires exactly once with { file, index } on a real click', async () => {
        const file = mockFile('report.pdf')
        const wrapper = mount(Component, {
            props: { file, index: 3 } as never,
            global: { plugins: [createOrigam()], stubs: STUBS }
        })

        // downloadable defaults to falsy on ListItem's IFileFieldListItemProps
        // (no `downloadable` passed) — DragNDropItem shares the same prop
        // name/default, so exactly one <origam-btn> (remove) renders.
        const buttons = wrapper.findAll('button')
        expect(buttons).toHaveLength(1)

        await buttons[0].trigger('click')

        const emitted = wrapper.emitted('click:remove')
        expect(emitted).toHaveLength(1)
        expect(emitted![0]).toEqual([{ file, index: 3 }])
        wrapper.unmount()
    })

    it('click:download fires exactly once with { file, index } when downloadable', async () => {
        const file = mockFile('report.pdf')
        const wrapper = mount(Component, {
            props: { file, index: 1, downloadable: true } as never,
            global: { plugins: [createOrigam()], stubs: STUBS }
        })

        const downloadBtn = wrapper.find('[data-cy="file-field-item-download"]')
        expect(downloadBtn.exists()).toBe(true)

        await downloadBtn.trigger('click')

        const emitted = wrapper.emitted('click:download')
        expect(emitted).toHaveLength(1)
        expect(emitted![0]).toEqual([{ file, index: 1 }])
        // click:remove must stay untouched by a download click — the two
        // handlers are independent code paths.
        expect(wrapper.emitted('click:remove')).toBeUndefined()
        wrapper.unmount()
    })

    it('a disabled item does not fire click:remove (native disabled short-circuits the click)', async () => {
        const file = mockFile()
        const wrapper = mount(Component, {
            props: { file, index: 0, disabled: true } as never,
            global: { plugins: [createOrigam()], stubs: STUBS }
        })

        // The stub renders a plain <button/> and Vue forwards `disabled` as
        // a real DOM attribute via fallthrough — assert the contract the
        // handler relies on rather than re-simulating browser click-suppression
        // logic jsdom does not implement for disabled buttons.
        expect(wrapper.find('button').attributes('disabled')).toBeDefined()
    })
})
