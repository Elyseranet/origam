/*********************************************************
 * #418 — quatre props declarees et jamais consommees sur <OrigamFileField>
 *
 * @description
 * 1. `chipProps` — masquee par un `computed` HOMONYME dans le meme
 *    `<script setup>`. Le compilateur SFC resout `chipProps` dans le
 *    template vers le binding `setup-ref`, donc le template lit le
 *    computed et jamais `props.chipProps`. Le patron correct existe a
 *    cote : `OrigamSelect.vue` fait `...props.chipProps`.
 * 2. `persistentPlaceholder` — declaree dans l'interface, absente du
 *    `.vue`, et NON TRANSMISSIBLE : ni `IInputProps` ni `IFieldProps` ne
 *    la declarent, donc `filterProps` (qui filtre sur les cles de
 *    l'interface enfant) ne peut pas la faire descendre. Les trois
 *    freres — TextField, TextareaField, PasswordField — la consomment
 *    tous de la meme facon : elle force l'etat actif du champ.
 * 3/4. `downloadable` / `downloadIcon` — bindees sur deux sous-composants
 *    qui ne les declarent pas. Aucun bouton de telechargement n'existe et
 *    l'emit `click:download` du contrat public ne peut jamais partir.
 *
 * @description
 * Defaut connexe mesure au meme endroit : la liste du mode NON-dropzone
 * omet `:progress`, `:color`, `:downloadable`, `:download-icon` et
 * `@click:download` que la branche dropzone, elle, passe bien. En
 * `display="list"` sans dropzone, `progress` et `color` n'ont donc aucun
 * effet.
 ********************************************************/

import { describe, expect, it, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { nextTick } from 'vue'

import OrigamFileField from '@origam/components/FileField/OrigamFileField.vue'
import OrigamChip from '@origam/components/Chip/OrigamChip.vue'
import OrigamField from '@origam/components/Field/OrigamField.vue'
import OrigamFileFieldListItem from '@origam/components/FileField/OrigamFileFieldListItem.vue'
import { createOrigam } from '@origam/origam'

global.ResizeObserver = vi.fn(class { observe = vi.fn(); unobserve = vi.fn(); disconnect = vi.fn() }) as never
global.IntersectionObserver = vi.fn(class { observe = vi.fn(); unobserve = vi.fn(); disconnect = vi.fn() }) as never

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

const mockFile = (name = 'rapport.pdf'): File => {
    const blob = new Blob(['x'], { type: 'application/pdf' })

    return new File([blob], name, { type: 'application/pdf' })
}

const mountFileField = async (props: Record<string, unknown>) => {
    const wrapper = mount(OrigamFileField, {
        props: props as never,
        global: { plugins: [createOrigam()] },
        attachTo: document.body
    })

    await nextTick()
    await nextTick()

    return wrapper
}

describe('#418 — chipProps', () => {
    it('transmet chipProps au <origam-chip> rendu (display="chips")', async () => {
        const wrapper = await mountFileField({
            multiple: true,
            display: 'chips',
            modelValue: [mockFile()],
            chipProps: { pill: true, label: true }
        })

        const chip = wrapper.findComponent(OrigamChip)

        expect(chip.exists()).toBe(true)
        expect(chip.props('pill')).toBe(true)
        expect(chip.props('label')).toBe(true)

        wrapper.unmount()
    })

    it('chipProps ne detruit pas les valeurs internes non surchargees', async () => {
        const wrapper = await mountFileField({
            multiple: true,
            display: 'chips',
            modelValue: [mockFile()],
            chipProps: { pill: true }
        })

        const chip = wrapper.findComponent(OrigamChip)

        expect(chip.props('closable')).toBe(true)
        expect(chip.props('size')).toBe('small')

        wrapper.unmount()
    })
})

describe('#418 — persistentPlaceholder', () => {
    it('force l etat actif du champ, hors focus et sans fichier', async () => {
        const withProp = await mountFileField({ persistentPlaceholder: true, label: 'Piece jointe' })
        const without = await mountFileField({ label: 'Piece jointe' })

        expect(without.findComponent(OrigamField).props('active')).toBe(false)
        expect(withProp.findComponent(OrigamField).props('active')).toBe(true)

        withProp.unmount()
        without.unmount()
    })
})

describe('#418 — downloadable / downloadIcon / click:download', () => {
    it('rend un bouton de telechargement dans l item de liste quand downloadable', async () => {
        const wrapper = await mountFileField({
            multiple: true,
            modelValue: [mockFile()],
            downloadable: true
        })

        const btn = wrapper.find('[data-cy="file-field-item-download"]')

        expect(btn.exists()).toBe(true)

        wrapper.unmount()
    })

    it('n en rend aucun quand downloadable est faux', async () => {
        const wrapper = await mountFileField({
            multiple: true,
            modelValue: [mockFile()]
        })

        expect(wrapper.find('[data-cy="file-field-item-download"]').exists()).toBe(false)

        wrapper.unmount()
    })

    it('remonte click:download avec { file, index } depuis le FileField', async () => {
        const file = mockFile('facture.pdf')
        const wrapper = await mountFileField({
            multiple: true,
            modelValue: [mockFile('a.pdf'), file],
            downloadable: true
        })

        const buttons = wrapper.findAll('[data-cy="file-field-item-download"]')

        expect(buttons.length).toBe(2)

        await buttons[1].trigger('click')

        const emitted = wrapper.emitted('click:download')

        expect(emitted).toBeTruthy()
        expect(emitted![0][0]).toEqual({ file, index: 1 })

        wrapper.unmount()
    })
})

describe('#418 — la liste du mode non-dropzone perd progress / color', () => {
    it('transmet progress et color a l item de liste, comme la branche dropzone', async () => {
        const wrapper = await mountFileField({
            multiple: true,
            modelValue: [mockFile()],
            progress: [42],
            color: 'primary'
        })

        const item = wrapper.findComponent(OrigamFileFieldListItem)

        expect(item.exists()).toBe(true)
        expect(item.props('progress')).toBe(42)
        expect(item.props('color')).toBe('primary')

        wrapper.unmount()
    })
})
