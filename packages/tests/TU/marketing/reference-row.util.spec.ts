// #1169 — `propCopyAttr` quitte `pages/components/[slug].vue` pour
// `utils/reference-row.util.ts`, afin d'être passé à `<row-list :copy-value>`
// au lieu de redéclarer le slot `title` (qui effaçait type, défaut et
// `required`). Ces cas épinglent la charge copiée, inchangée par le déplacement.
import { describe, expect, it } from 'vitest'

import { propCopyAttr } from '~/utils/reference-row.util'

describe('propCopyAttr', () => {
    it('booléen (type structuré) → attribut nu en kebab-case', () => {
        expect(propCopyAttr({ label: 'block', type: { label: 'boolean', slug: '', kind: 'primitive' }, descriptionFallback: '' }))
            .toBe('block')
    })

    it('union qui commence par `boolean ` → attribut nu', () => {
        expect(propCopyAttr({ label: 'icon', type: { label: 'boolean | TIcon', slug: 'icon', kind: 'type' }, descriptionFallback: '' }))
            .toBe('icon')
    })

    it('autre type → binding vide, nom camelCase converti en kebab-case', () => {
        expect(propCopyAttr({ label: 'bgColor', type: { label: 'TIntent', slug: 'intent', kind: 'type' }, descriptionFallback: '' }))
            .toBe(':bg-color=""')
    })

    it('type en chaîne simple, ou absent', () => {
        expect(propCopyAttr({ label: 'disabled', type: 'boolean', descriptionFallback: '' })).toBe('disabled')
        expect(propCopyAttr({ label: 'value', descriptionFallback: '' })).toBe(':value=""')
    })

    it('`booleanish` n\'est pas un booléen (le préfixe exige un espace)', () => {
        expect(propCopyAttr({ label: 'x', type: 'booleanish', descriptionFallback: '' })).toBe(':x=""')
    })
})
