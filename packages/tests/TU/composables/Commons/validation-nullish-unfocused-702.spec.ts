/*
 * #702 — `useValidation`, mode `input` : un modele de validation qui devient
 * NULLISH alors que le champ n'a PAS le focus ne redeclenchait aucune regle.
 *
 * Le `watch(validationModel)` du mode `input` avait trois branches dont une
 * VIDE :
 *
 *   | modele      | focus | consequence                                  |
 *   |-------------|-------|----------------------------------------------|
 *   | non nullish | —     | `validate()` immediat                        |
 *   | nullish     | oui   | validation differee au blur — DELIBERE        |
 *   | nullish     | non   | aucune branche — etat de validation PERIME    |
 *
 * Le report au blur (2e ligne) est sain : on ne crie pas « requis » pendant
 * que l'utilisateur efface son champ. Il n'a en revanche aucun sens sans
 * focus — personne ne saisit. C'est le cas d'un effacement PROGRAMMATIQUE
 * (parent qui remet le `v-model` a `null`, effacement externe, chargement de
 * donnees).
 *
 * ⛔ CHAQUE `it` MARQUE « CONTROLE POSITIF » PASSE DEJA AVANT LE CORRECTIF.
 * C'est leur raison d'etre : sans eux, « aucune regle ne se declenche » et
 * « la sonde ne mesure rien » seraient indiscernables. Ne pas les supprimer.
 *
 * A/B mesure contre le commit parent (1eb1c9887) :
 *   - avant correctif : 3 echecs (les 3 `it` marques « DEFAUT #702 »),
 *     les 5 controles positifs verts ;
 *   - apres correctif : 8/8 verts.
 */

import { defineComponent, h, nextTick, reactive } from 'vue'
import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'

import type { IValidationProps } from '@origam/interfaces'

import { ORIGAM_FORM_KEY } from '@origam/consts/Form/form.const'
import { useValidation } from '@origam/composables/Commons/validation.composable'

/*
 * Chaque regle enregistre les valeurs qu'elle a REELLEMENT vues. C'est la
 * sonde primaire : `seen` distingue « la regle n'a pas ete evaluee » de
 * « la regle a ete evaluee et a rendu le meme verdict ». Les `errorMessages`
 * seuls ne le permettent pas.
 */
function makeRequiredRule () {
    const seen: Array<unknown> = []
    const rule = (value: unknown) => {
        seen.push(value)

        return (value != null && value !== '') || 'required'
    }

    return { seen, rule }
}

/* Regle inverse : ECHOUE sur une valeur courte, PASSE sur nullish. Elle rend
 * visible le sens oppose du meme defaut — un message d'erreur qui RESTE
 * affiche alors que la regle repasserait. */
function makeMinLengthRule () {
    const seen: Array<unknown> = []
    const rule = (value: unknown) => {
        seen.push(value)

        return (value == null || String(value).length >= 3) || 'too short'
    }

    return { seen, rule }
}

function mountWith (initial: IValidationProps) {
    const props = reactive<IValidationProps>({ ...initial })
    const updates: Array<{ id: unknown, isValid: unknown, messages: Array<string> }> = []
    let api!: ReturnType<typeof useValidation>

    const Host = defineComponent({
        name: 'OrigamValidation702Host',
        setup () {
            api = useValidation(props, 'origam-validation-702')

            return () => h('div')
        }
    })

    /* Le faux provider de formulaire sert a mesurer le point 2 du ticket :
     * l'agregation `<origam-form>` n'avait jamais ete exercee sur ce chemin. */
    mount(Host, {
        global: {
            provide: {
                [ORIGAM_FORM_KEY as unknown as symbol]: {
                    register: () => {},
                    unregister: () => {},
                    update: (id: unknown, isValid: unknown, messages: Array<string>) => {
                        updates.push({ id, isValid, messages: [...messages] })
                    },
                    isDisabled: { value: false },
                    isReadonly: { value: false },
                    validateOn: { value: undefined }
                }
            }
        }
    })

    return { props, updates, api: () => api }
}

async function settle () {
    await nextTick()
    await nextTick()
    await nextTick()
}

describe('#702 — useValidation, modele nullish SANS focus (mode input)', () => {
    it('CONTROLE POSITIF — un modele NON nullish reevalue les regles', async () => {
        const { seen, rule } = makeRequiredRule()
        const { props, api } = mountWith({ modelValue: null, rules: [rule], focused: false })

        await settle()
        expect(api().errorMessages.value).toEqual(['required'])

        seen.length = 0
        props.modelValue = 'abc'
        await settle()

        expect(seen).toEqual(['abc'])
        expect(api().errorMessages.value).toEqual([])
        expect(api().isValid.value).toBe(true)
    })

    it('CONTROLE POSITIF — un modele nullish AVEC focus ne valide PAS pendant la saisie', async () => {
        const { seen, rule } = makeRequiredRule()
        const { props, api } = mountWith({ modelValue: 'abc', rules: [rule], focused: true })

        await settle()
        seen.length = 0

        props.modelValue = null
        await settle()

        // Report delibere : on ne crie pas « requis » pendant la frappe.
        expect(seen).toEqual([])
        expect(api().errorMessages.value).toEqual([])
    })

    it('CONTROLE POSITIF — le report au blur reste intact apres le correctif', async () => {
        const { seen, rule } = makeRequiredRule()
        const { props, api } = mountWith({ modelValue: 'abc', rules: [rule], focused: true })

        await settle()
        seen.length = 0

        props.modelValue = null
        await settle()
        expect(seen).toEqual([])

        props.focused = false
        await settle()

        expect(seen.length).toBeGreaterThan(0)
        expect(api().errorMessages.value).toEqual(['required'])
        expect(api().isValid.value).toBe(false)
    })

    it('DEFAUT #702 — un effacement programmatique SANS focus redeclenche `required`', async () => {
        const { seen, rule } = makeRequiredRule()
        const { props, api } = mountWith({ modelValue: 'abc', rules: [rule], focused: false })

        await settle()
        expect(api().errorMessages.value).toEqual([])
        expect(api().isValid.value).toBe(true)

        seen.length = 0
        props.modelValue = null
        await settle()

        expect(seen).toEqual([null])
        expect(api().errorMessages.value).toEqual(['required'])
        expect(api().isValid.value).toBe(false)
    })

    it('DEFAUT #702 — un message d\'erreur PERIME est efface par l\'effacement sans focus', async () => {
        const { seen, rule } = makeMinLengthRule()
        const { props, api } = mountWith({ modelValue: 'abcd', rules: [rule], focused: false })

        await settle()
        props.modelValue = 'ab'
        await settle()

        expect(api().errorMessages.value).toEqual(['too short'])
        expect(api().isValid.value).toBe(false)

        seen.length = 0
        props.modelValue = null
        await settle()

        expect(seen).toEqual([null])
        expect(api().errorMessages.value).toEqual([])
        expect(api().isValid.value).toBe(true)
    })

    it('DEFAUT #702 — le `<origam-form>` parent est notifie de l\'etat devenu invalide', async () => {
        const { rule } = makeRequiredRule()
        const { props, updates } = mountWith({ modelValue: 'abc', rules: [rule], focused: false })

        await settle()
        updates.length = 0

        props.modelValue = null
        await settle()

        expect(updates).toHaveLength(1)
        expect(updates[0].isValid).toBe(false)
        expect(updates[0].messages).toEqual(['required'])
    })

    it('CONTROLE POSITIF — `reset()` laisse le champ pristine (pas de regression du correctif)', async () => {
        const { rule } = makeRequiredRule()
        const { api } = mountWith({ modelValue: 'abc', rules: [rule], focused: false })

        await settle()
        await api().reset()
        await settle()

        expect(api().isPristine.value).toBe(true)
        expect(api().errorMessages.value).toEqual(['required'])
        expect(api().isValid.value).toBeUndefined()
    })

    it('CONTROLE POSITIF — `validateOn="blur"` n\'est PAS touche par le correctif', async () => {
        const { seen, rule } = makeRequiredRule()
        const { props, api } = mountWith({ modelValue: 'abc', rules: [rule], focused: false, validateOn: 'blur' })

        await settle()
        seen.length = 0

        props.modelValue = null
        await settle()

        // Le mode `blur` seul n'installe aucun watch sur le modele : inchange.
        expect(seen).toEqual([])
        expect(api().errorMessages.value).toEqual([])
    })
})
