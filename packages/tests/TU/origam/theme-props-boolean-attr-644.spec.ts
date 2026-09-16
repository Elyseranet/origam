/*********************************************************
 * #644 — un ATTRIBUT BOOLEEN NU ne resolvait pas a `true` sur toute prop
 *        qu'un thème ENREGISTRE nomme
 *
 * SYMPTOME RAPPORTE. `packages/marketing/src/components/HomeFeatures.vue`
 * pose `flat` en dur sur son `<origam-card>`. Rendu mesure en navigateur sur
 * la page marketing reelle :
 *
 *   class = "origam-card origam-card--density-default origam--rounded-none
 *            home-features__card"
 *
 * `origam-card--flat` absent, donc `box-shadow` peint au lieu de `none`.
 *
 * ⛔ CE N'ETAIT PAS UN DEFAUT DU MARKETING, NI DU PROP `flat`, NI DE
 * L'INFERENCE DE TYPE DU COMPILATEUR SFC.
 *
 * La piste du ticket — « le compilateur SFC n'infere pas `type: Boolean`
 * pour `flat`, donc l'attribut nu compile en `flat: ""` » — est ELIMINEE par
 * la mesure : le descripteur emis porte bien `flat: { type: Boolean }`, dans
 * les sources ET dans le `dist/` que le site marketing consomme.
 *
 * MECANISME REEL, dans le DS. Le resolveur ADR-005
 * (`theme-props-resolver.composable.ts`) installe un getter sur
 * `instance.props[key]` pour toute cle qu'UN THEME ENREGISTRE nomme — actif
 * ou non, l'union etant calculee sur toute la liste installee. Ce getter
 * rendait l'INSTANTANE BRUT de `instance.vnode.props[key]`. Or un attribut
 * booleen nu compile en `flat: ''` : c'est VUE qui transforme cette chaine
 * vide en `true`, pendant sa propre normalisation des props. En rendant la
 * valeur d'avant normalisation, le resolveur DEFAISAIT le casting de Vue —
 * et la valeur correcte etait deja la, dans `fallbackValue`, qui porte
 * precisement ce que Vue a resolu.
 *
 * Ce qui rendait le defaut si difficile a lire de l'exterieur :
 *
 *   - il ne frappe QUE les props qu'un thème nomme. Sur la meme carte,
 *     `hover` nu (booleen, non nomme) peignait correctement.
 *   - il ne frappe QUE la forme d'attribut nu. `:flat="true"` marchait.
 *   - il est INDEPENDANT du thème ACTIF. Six des huit thèmes marketing
 *     nomment `flat` sur `origam-card` ; il suffit qu'ils soient
 *     ENREGISTRES. C'est pourquoi retirer `flat: true` du thème de base
 *     `origam` sous #641 n'a rien change, ce que l'A/B du ticket avait
 *     correctement observe sans pouvoir l'expliquer.
 *   - les props CHAINE voisines n'etaient pas touchees : `rounded="none"`
 *     a la meme valeur brute et resolue. D'ou une liste de classes ou tout
 *     etait juste SAUF le booleen.
 *
 * PORTEE. Le defaut n'a rien de specifique a Card ni a `flat` : il touche
 * TOUT prop booleen ecrit en attribut nu, sur TOUT composant dont un thème
 * enregistre nomme la cle. Une seule des manifestations avait un ticket.
 *
 * ⛔ CE QUE CE SPEC MESURE, ET SES CONTROLES. Sans eux, « la classe est
 * absente » et « ma sonde ne declenche rien » sont indiscernables — et la
 * premiere version de cette sonde est TOMBEE dans ce piege : elle passait
 * un objet `theme` de forme vuetify (`{defaultTheme, themes:{}}`) que
 * `createOrigam` ignore en silence, donc aucune cle n'entrait dans l'union,
 * donc le defaut ne se reproduisait pas. Les quatre cas ci-dessous ne
 * different que par UNE variable chacun, et trois d'entre eux DOIVENT
 * rester verts meme sur le code d'avant correctif.
 ********************************************************/

import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import { defineComponent } from 'vue'

import OrigamCard from '@origam/components/Card/OrigamCard.vue'
import { createOrigam } from '@origam/origam'

// Un thème ENREGISTRE qui NOMME `flat` sur `origam-card` — la forme exacte
// de geek / ecom / editorial / cartoon / apple / material cote marketing.
const THEME_NAMING_FLAT = [ {
    name: 'marque',
    label: 'Marque',
    components: { 'origam-card': { rounded: 'lg', border: true, flat: false } }
} ]

// Le meme, a une cle pres : `flat` n'y figure plus. C'est la SEULE variable
// qui separe ce thème du precedent.
const THEME_WITHOUT_FLAT = [ {
    name: 'marque',
    label: 'Marque',
    components: { 'origam-card': { rounded: 'lg', border: true } }
} ]

const host = (template: string) => defineComponent({ components: { OrigamCard }, template })

const classesOf = (template: string, themes?: unknown[]) => {
    const wrapper = mount(host(template), {
        global: { plugins: [ createOrigam(themes ? { themes } as never : {}) ] }
    })
    return wrapper.find('article').classes()
}

describe('resolveur ADR-005 — un attribut booleen nu doit resoudre a `true` (#644)', () => {
    it('LE DEFAUT : `flat` nu, sur un thème qui NOMME `flat`', () => {
        // Rouge avant correctif : le getter rendait `''`, falsy.
        expect(classesOf(`<origam-card tag="article" flat />`, THEME_NAMING_FLAT))
            .toContain('origam-card--flat')
    })

    it('CONTROLE POSITIF : `:flat="true"` lie, meme thème', () => {
        // La liaison explicite n'a jamais ete cassee. Si CE cas tombe, c'est
        // le harnais qui est en cause, pas le resolveur.
        expect(classesOf(`<origam-card tag="article" :flat="true" />`, THEME_NAMING_FLAT))
            .toContain('origam-card--flat')
    })

    it('CONTROLE NEGATIF : `flat` nu, thème NE NOMMANT PAS `flat`', () => {
        // Une seule cle de difference avec le cas du defaut. Vert avant ET
        // apres correctif : c'est ce qui prouve que le declencheur est bien
        // l'interception par le resolveur, et rien d'autre dans le montage.
        expect(classesOf(`<origam-card tag="article" flat />`, THEME_WITHOUT_FLAT))
            .toContain('origam-card--flat')
    })

    it('CONTROLE NEGATIF : `hover` nu — booleen NON nomme, meme thème', () => {
        // Meme composant, meme thème, meme forme d'attribut nu, prop non
        // intercepte. Vert avant ET apres : le defaut n'etait pas « les
        // attributs nus », c'etait « les attributs nus DES props thémees ».
        expect(classesOf(`<origam-card tag="article" hover />`, THEME_NAMING_FLAT))
            .toContain('origam-card--hover')
    })

    it('la combinaison exacte de HomeFeatures.vue rend la classe attendue', () => {
        // Reproduction litterale du site d'appel du ticket. Avant correctif,
        // la liste rendue etait IDENTIQUE a celle mesuree en navigateur sur
        // la page marketing — au `--flat` pres, qui manquait des deux cotes.
        const classes = classesOf(
            `<origam-card tag="article" flat rounded="none" :elevation="undefined" :border="false" class="home-features__card" />`,
            THEME_NAMING_FLAT
        )

        expect(classes).toContain('origam-card--flat')
        // Les voisines restent exactement ce que le navigateur montrait :
        // le correctif AJOUTE la classe manquante, il ne redessine rien.
        expect(classes).toContain('origam-card--density-default')
        expect(classes).toContain('origam--rounded-none')
        expect(classes).toContain('home-features__card')
    })
})
