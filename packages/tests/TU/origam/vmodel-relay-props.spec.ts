/*
 * PREUVE DE CONSOMMATION — les props `modelValue` lues via un composable RELAIS.
 *
 * POURQUOI CE FICHIER EXISTE
 * --------------------------
 * Le garde `unconsumed-props` décide qu'une prop est consommée en suivant les
 * composables auxquels le composant confie son objet `props`. Il crédite
 * correctement un `useVModel(props, 'modelValue')` écrit DANS le `.vue` — 40
 * paires vérifiées, zéro faux positif. Il ne voit pas le cas INDIRECT :
 *
 *     OrigamInput.vue              ->  useValidation(props)
 *     validation.composable.ts:27  ->  useVModel(props, 'modelValue')
 *
 * La prop est lue par une CLÉ EN CHAÎNE passée à un troisième composable, deux
 * niveaux plus bas. Aucune occurrence de `props.modelValue` n'existe nulle part
 * dans la chaîne — il n'y a donc rien à trouver pour une analyse par jeton.
 *
 * CE QUE ÇA A FAILLI COÛTER
 * -------------------------
 * `OrigamInput.modelValue` figurait dans la baseline et était proposé au
 * RETRAIT (tâche #63, candidat n°1). Le retirer aurait supprimé le v-model du
 * chrome de champ bas niveau dont dépendent TextField, PasswordField, Select,
 * NumberField, FileField, RatingField, SliderField, ColorPickerField,
 * DatePickerField, OtpInputField et TextareaField. Le type-check serait resté
 * vert : la prop disparaît de l'interface, plus personne ne la passe, rien ne
 * casse à la compilation. La saisie aurait simplement cessé de remonter.
 *
 * C'est le mode de défaillance que ce chantier traque : un vérificateur vert
 * qui a tort. L'absence de preuve de consommation n'est pas une preuve
 * d'absence — un candidat au retrait se réfute au runtime avant qu'on y
 * touche, jamais sur la foi d'un compte.
 *
 * CE QUI EST ÉPINGLÉ ICI
 * ----------------------
 * Les 4 paires identifiées par le croisement baseline × composables relais.
 * Chacune est prouvée par MUTATION — deux valeurs distinctes doivent produire
 * deux observations distinctes. Une assertion qui passerait avec n'importe
 * quelle valeur ne prouverait rien, et relire la prop via `wrapper.props()`
 * n'en est pas une : ça teste Vue, pas le composant.
 *
 * ⚠️ Si un test d'ici ÉCHOUE, la prop a cessé d'être consommée — c'est une
 * régression produite, pas un test à ajuster.
 */

import { describe, expect, it } from 'vitest'
import { h, nextTick } from 'vue'
import { mount } from '@vue/test-utils'
import { createOrigam } from '@origam/origam'
import OrigamInput from '@origam/components/Input/OrigamInput.vue'
import OrigamForm from '@origam/components/Form/OrigamForm.vue'
import OrigamProgressLinear from '@origam/components/Progress/OrigamProgressLinear.vue'
import OrigamProgressCircular from '@origam/components/Progress/OrigamProgressCircular.vue'

const origam = createOrigam()

const surfaceFor = (component: unknown, props: Record<string, unknown>) => {
    const wrapper = mount(component as never, {
        props: props as never,
        global: { plugins: [origam] }
    })
    const html = wrapper.html()
    wrapper.unmount()

    return html
}

describe('modelValue lue via un composable relais (angle mort du garde)', () => {
    /*
     * useProgress(props) -> useVModel(props, 'modelValue'). La valeur pilote la
     * progression peinte. On compare la surface ENTIÈRE plutôt qu'un attribut
     * choisi d'avance : choisir l'attribut présuppose le mécanisme, la surface
     * ne présuppose rien et reste vraie si l'implémentation change de canal.
     */
    it('OrigamProgressLinear.modelValue atteint le rendu', () => {
        expect(surfaceFor(OrigamProgressLinear, { modelValue: 10 }))
            .not.toBe(surfaceFor(OrigamProgressLinear, { modelValue: 90 }))
    })

    it('OrigamProgressCircular.modelValue atteint le rendu', () => {
        expect(surfaceFor(OrigamProgressCircular, { modelValue: 10 }))
            .not.toBe(surfaceFor(OrigamProgressCircular, { modelValue: 90 }))
    })

    /*
     * OrigamInput ne PEINT pas la valeur — c'est le chrome, pas le champ. Mais
     * `useValidation` en dérive `isDirty` (validation.composable.ts:37, une
     * valeur vide ou nulle = non salie), qui alimente `validationClasses`,
     * liée par le template (OrigamInput.vue:285). La classe `--dirty` est donc
     * une observation de la valeur, pas une relecture de la prop.
     */
    it('OrigamInput.modelValue atteint la surface via la classe --dirty', () => {
        const vide = surfaceFor(OrigamInput, { modelValue: '' })
        const rempli = surfaceFor(OrigamInput, { modelValue: 'saisie' })

        expect(vide).not.toContain('origam-input--dirty')
        expect(rempli).toContain('origam-input--dirty')
    })

    /*
     * Sur OrigamForm, `modelValue` est un canal SORTANT : `useForm` y ÉCRIT la
     * validité (form.composable.ts:77) via le writable computed que produit
     * `useVModel`. La consommation se prouve donc par l'émission, pas par le
     * rendu — si la prop n'était pas branchée, aucun `update:modelValue` ne
     * partirait jamais.
     *
     * ⚠️ Le formulaire doit contenir un CHAMP. L'écriture vit dans
     * `watch(items, …)` : sans champ enregistré, `items` ne change jamais, le
     * watch ne part pas et le test échoue en accusant à tort le composant.
     * C'est ce qu'a fait la première version de ce test.
     */
    it('OrigamForm.modelValue est le canal sortant de la validité', async () => {
        const wrapper = mount(OrigamForm as never, {
            props: { modelValue: null } as never,
            slots: { default: () => h(OrigamInput, { modelValue: 'x' }) },
            global: { plugins: [origam] }
        })

        await nextTick()
        await nextTick()

        const emissions = wrapper.emitted('update:modelValue')

        expect(emissions).toBeTruthy()
        // La validité calculée, pas un simple écho de la valeur entrante.
        expect(emissions?.at(-1)?.[0]).not.toBeNull()

        wrapper.unmount()
    })

    /*
     * BUG TROUVÉ EN ÉCRIVANT LE TEST PRÉCÉDENT. `IFormEmits` ne déclarait que
     * `submit` et `reset` : l'émission ci-dessus partait sans être déclarée.
     * Vue avertissait à chaque montage, et le handler `onUpdate:modelValue`
     * restait dans `$attrs` — donc posé par `inheritAttrs` sur l'élément
     * `<form>` racine, où il n'a rien à faire.
     *
     * Ce test échoue si la déclaration disparaît à nouveau. Il assert sur
     * l'ABSENCE d'avertissement plutôt que sur la présence de l'interface :
     * une assertion sur le type serait vraie sans que le runtime le soit.
     */
    it('OrigamForm déclare son update:modelValue — aucun avertissement Vue', async () => {
        const warnings: Array<string> = []
        const original = console.warn

        console.warn = (...args: Array<unknown>) => { warnings.push(String(args[0])) }

        const recu: Array<unknown> = []
        const wrapper = mount(OrigamForm as never, {
            props: {
                modelValue: null,
                'onUpdate:modelValue': (v: unknown) => recu.push(v)
            } as never,
            slots: { default: () => h(OrigamInput, { modelValue: 'x' }) },
            global: { plugins: [origam] }
        })

        await nextTick()
        await nextTick()
        console.warn = original

        expect(warnings.filter((w) => w.includes('update:modelValue'))).toEqual([])
        // Et le canal fonctionne vraiment côté consommateur.
        expect(recu.length).toBeGreaterThan(0)

        wrapper.unmount()
    })
})
