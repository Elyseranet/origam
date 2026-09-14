import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import OrigamDialogConfirmation from '@origam/components/Dialog/OrigamDialogConfirmation.vue'
import { createOrigam } from '@origam/origam'

// ---------------------------------------------------------------------------
// ⛔ C8 — deux libellés en dur ET non surchargeables (classeur, ticket #412).
//
// `text="Cancel"` et `text="Validate"` étaient écrits dans le template, et
// `IDialogConfirmationProps` n'exposait que `cancellable`. Un consommateur non
// anglophone ne pouvait ni traduire ni renommer, sinon en remplaçant le pied
// de dialogue ENTIER. Sur un dialogue de confirmation — celui qui demande à
// l'utilisateur de valider une action — c'est le pire endroit possible.
//
// ⚠️ ANGLE MORT DU HARNAIS, relevé au classeur : le détecteur C8 ne scanne que
// `aria-label`, `title`, `placeholder` et `alt`. Une chaîne passée en PROP
// d'affichage lui échappe entièrement. C'est pour ça que ce défaut a survécu :
// aucun outil ne pouvait le voir. Ces tests le voient.
// ---------------------------------------------------------------------------

const mountDialog = (props: Record<string, unknown> = {}) => mount(OrigamDialogConfirmation, {
    props: { modelValue: true, title: 'Sûr ?', ...props } as never,
    attachTo: document.body,
    global: { plugins: [createOrigam()] }
})

describe('OrigamDialogConfirmation — libellés traduits (C8)', () => {
    it('rend les libellés par défaut via la couche i18n du DS', () => {
        const wrapper = mountDialog()
        const text = document.body.textContent ?? ''

        expect(text).toContain('Cancel')
        expect(text).toContain('Validate')

        wrapper.unmount()
    })

    it('une clé fournie par le consommateur remplace le libellé', () => {
        const wrapper = mountDialog({
            cancelTextKey: 'origam.clipboard.copied',
            validateTextKey: 'origam.dialog.close_aria_label'
        })
        const text = document.body.textContent ?? ''

        expect(text).toContain('Copied!')
        expect(text).toContain('Close dialog')
        expect(text).not.toContain('Validate')

        wrapper.unmount()
    })

    it('les props transportent une CLÉ, pas la chaîne finale', () => {
        const wrapper = mountDialog()

        expect(wrapper.props('cancelTextKey')).toBe('origam.dialog.confirmation.cancel')
        expect(wrapper.props('validateTextKey')).toBe('origam.dialog.confirmation.validate')

        wrapper.unmount()
    })
})
