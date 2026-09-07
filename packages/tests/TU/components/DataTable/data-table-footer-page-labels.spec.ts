// #550 (critere C7) — les quatre libelles de navigation du pied de table.
//
// `IDataTableFooterProps` declare `firstPageLabel` / `prevPageLabel` /
// `nextPageLabel` / `lastPageLabel`, defaultees sur de vraies cles i18n,
// et la story expose un champ texte pour chacune.
//
// MESURE AVANT CORRECTIF (meme montage, `develop` @ 925784a5) :
//   first-page-label="Aller au debut"
//     → aria-label du bouton « first » = "origam.pagination.aria_label.first"
//       (le defaut d'<OrigamPagination>), la valeur passee n'apparait NULLE
//       PART dans le DOM rendu.
//
// Cause : `paginationProps` appelle le `filterProps` EXPOSE PAR
// `<OrigamPagination>`, dont le schema nomme ces props
// `firstAriaLabel` / `previousAriaLabel` / `nextAriaLabel` /
// `lastAriaLabel`. `pick()` ne retenait donc jamais les quatre cles du
// pied de table — elles n'atterrissaient meme pas en attribut HTML.

import { describe, expect, it, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { nextTick } from 'vue'

import OrigamDataTable from '@origam/components/DataTable/OrigamDataTable.vue'
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

const HEADERS = [{title: 'Name', key: 'name'}]
const ITEMS = Array.from({length: 30}, (_, i) => ({name: `User ${i + 1}`}))

async function mountTable (props: Record<string, unknown> = {}) {
    const wrapper = mount(OrigamDataTable as never, {
        props: {headers: HEADERS, items: ITEMS, ...props} as never,
        global: {plugins: [createOrigam()]}
    })

    await nextTick()
    await nextTick()

    return wrapper
}

describe('OrigamDataTableFooter — les libelles de page atteignent <OrigamPagination> (#550, C7)', () => {
    it('chaque libelle passe devient l aria-label du bouton correspondant', async () => {
        const wrapper = await mountTable({
            firstPageLabel: 'Aller au debut',
            prevPageLabel: 'Reculer',
            nextPageLabel: 'Avancer',
            lastPageLabel: 'Aller a la fin'
        })

        const labels = wrapper.findAll('.origam-data-table-footer__pagination [aria-label]')
            .map((el) => el.attributes('aria-label'))

        expect(labels).toContain('Aller au debut')
        expect(labels).toContain('Reculer')
        expect(labels).toContain('Avancer')
        expect(labels).toContain('Aller a la fin')
    })

    it('sans libelle passe, le defaut est la cle i18n TRADUITE, pas la cle brute', async () => {
        const wrapper = await mountTable()

        const labels = wrapper.findAll('.origam-data-table-footer__pagination [aria-label]')
            .map((el) => el.attributes('aria-label'))

        expect(labels).toContain('First page')
        expect(labels).toContain('Previous page')
        expect(labels).toContain('Next page')
        expect(labels).toContain('Last page')

        // ⛔ HORS PERIMETRE — `<OrigamPagination>` rend SES PROPRES defauts
        // d'aria-label (`ariaLabel`, `pageAriaLabel`, …) tels quels, cle
        // i18n comprise : `origam.pagination.aria_label.root` finit
        // litteralement dans le DOM. Ce n'est pas ce que ce spec mesure —
        // les quatre libelles ci-dessus sont traduits par le PIED DE TABLE
        // avant d'etre passes. Le defaut de Pagination est signale, pas
        // corrige ici.
        expect(labels.filter((l) => l?.startsWith('origam.')).length).toBeGreaterThan(0)
    })
})
