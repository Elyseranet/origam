/********************************************************
 *  PRE-EXISTING EAGER READS — RUNTIME CONFIRMATION
 *
 *  @description
 *  Issue #363 claimed that removing `useDefaults` would break 24 components
 *  whose props are read at `setup()` level, and that the removal therefore had
 *  to come second.
 *  Static analysis says otherwise: not one of those 24 ever called
 *  `useDefaults`, so the removal cannot reach them.
 *  Their props were already unreachable by a theme before the campaign started
 *  and are equally unreachable after it, which makes them a separate defect
 *  rather than a precondition.
 *  This spec confirms that at runtime on a sample, so the claim rests on a
 *  render rather than on an AST walk.
 *  It asserts the CURRENT broken behaviour deliberately: each case is a bug
 *  worth its own ticket, and pinning it here means the day someone fixes the
 *  eager read, this spec fails and points at the ticket to close.
 ********************************************************/

import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'

import { createOrigam } from '@origam/origam'
import type { IOrigamTheme } from '@origam/interfaces'

import OrigamWindow from '@origam/components/Window/OrigamWindow.vue'
import OrigamDataList from '@origam/components/DataList/OrigamDataList.vue'

function mountThemed (Comp: any, name: string, props: Record<string, unknown>) {
    const theme: IOrigamTheme = { name: 'probe', components: { [name]: props }, vars: {} }
    const origam = createOrigam({ themes: [theme] })
    origam._defaultsRef.value = origam._activeDefaultsFor('probe', undefined)
    return mount(Comp, { global: { plugins: [origam] } })
}

describe('props read at setup() level never see the theme — pre-existing, unrelated to the useDefaults removal', () => {
    /*********************************************************
     * OrigamWindow — CAS RETOURNÉ, le defaut est corrige (#473)
     *
     * @description
     * Ce cas assertait la perte du prevIcon/nextIcon themes. Il a echoue le
     * jour de la correction, exactement comme l'en-tete de ce fichier
     * l'annonce — c'est sa fonction, pas un accident.
     * @description
     * La cause etait bien une lecture eager : `prevProps`/`nextProps`
     * etaient des litteraux d'objet construits une fois au niveau racine de
     * `setup()`, capturant `props.prevIcon`/`props.nextIcon` avant que le
     * resolveur de theme ADR-005 ne patche `instance.props` dans
     * `beforeCreate`. Corrige en enveloppant les deux dans `computed()`.
     * @description
     * L'assertion est desormais inversee : le theme DOIT atteindre le rendu.
     * Le controle « la prop explicite change le balisage » est conserve —
     * sans lui, « theme == explicite » se lirait pareil si la prop n'avait
     * aucun effet visible.
     ********************************************************/
    it('OrigamWindow applique bien un prevIcon / nextIcon themes', () => {
        const props = {
            showArrows: true,
            prevIcon: 'mdi-chevron-double-left',
            nextIcon: 'mdi-chevron-double-right'
        }
        const plain = mount(OrigamWindow, { global: { plugins: [createOrigam({})] } }).html()
        const explicit = mount(OrigamWindow, { props, global: { plugins: [createOrigam({})] } }).html()
        const themed = mountThemed(OrigamWindow, 'origam-window', props).html()

        expect(explicit, 'controle : passer la prop explicitement doit changer le balisage').not.toBe(plain)
        expect(themed, 'la valeur du theme doit atteindre le rendu, comme la prop explicite').toBe(explicit)
    })

    /*********************************************************
     * OrigamDataList — CAS RETOURNÉ, le defaut est corrige
     *
     * @description
     * Ce cas assertait la perte du bgColor/color themes. Il a echoue le jour
     * de la correction, exactement comme l'en-tete de ce fichier l'annonce —
     * c'est sa fonction, pas un accident.
     * @description
     * La cause n'etait PAS une lecture eager mais `toRef(props.bgColor)` :
     * passer la VALEUR a `toRef` produit un ref fige, capture une fois pour
     * toutes a l'execution de `setup()`. Corrige en `toRef(props, 'bgColor')`
     * sur `OrigamDataList` et `OrigamInput`.
     * @description
     * L'assertion est desormais inversee : le theme DOIT atteindre le rendu.
     * Le controle « la prop explicite change le balisage » est conserve —
     * sans lui, « theme == explicite » se lirait pareil si la prop n'avait
     * aucun effet visible.
     ********************************************************/
    it('OrigamDataList applique bien un bgColor / color themes', () => {
        const props = { bgColor: 'primary', color: 'success' }
        const plain = mount(OrigamDataList, { global: { plugins: [createOrigam({})] } }).html()
        const explicit = mount(OrigamDataList, { props, global: { plugins: [createOrigam({})] } }).html()
        const themed = mountThemed(OrigamDataList, 'origam-data-list', props).html()

        expect(explicit, 'controle : passer la prop explicitement doit changer le balisage').not.toBe(plain)
        expect(themed, 'la valeur du theme doit atteindre le rendu, comme la prop explicite').toBe(explicit)
    })
})
