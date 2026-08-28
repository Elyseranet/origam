/*********************************************************
 * #504 — useLink.to : la lecture eager EST reelle, le correctif naif
 * NE MARCHE PAS. Mesure, pas hypothese.
 *
 * @description
 * `useLink` a `const link = props.to ? RouterLink.useLink(props) :
 * undefined` a profondeur 0 de son corps — une lecture eager de `props.to`
 * au sens du detecteur ADR-005 (`setup-reads.mjs`). Deux branches ont
 * tranche differemment sur la suite a donner ; celle-ci REND LA MESURE, pas
 * un choix arbitraire.
 *
 * @description
 * LE CORRECTIF TENTE : appeler `RouterLink.useLink(props)`
 * INCONDITIONNELLEMENT, en s'appuyant sur le fait que le `route` interne de
 * vue-router est un `computed(() => { const to = unref(props.to); ...
 * })` — donc lazy. Sur le papier ca devrait fonctionner : le premier ACCES
 * a `route.value` arrive au rendu, apres que le resolveur ADR-005 ait
 * installe son accesseur sur `instance.props`.
 *
 * @description
 * CE QUE LA MESURE MONTRE : `RouterLink.useLink()` lit lui-meme
 * `route.value` de facon SYNCHRONE et INCONDITIONNELLE pendant son propre
 * appel, pour alimenter les devtools (`isBrowser && (dev || prod
 * devtools)` — vrai sous jsdom/Vitest ET dans un vrai navigateur en dev).
 * Ce premier acces a lieu PENDANT le `setup()` de l'appelant, donc AVANT
 * que `beforeCreate` installe l'accesseur du resolveur ADR-005 — le
 * `computed` interne de vue-router souscrit alors au canal (a) (le proxy
 * `shallowReactive` brut), avec `to` encore `undefined`. Or l'installation
 * de l'accesseur ADR-005 se fait par `Object.defineProperty`, une
 * operation que les handlers `@vue/reactivity` ne declenchent PAS comme un
 * `trigger()` — rien n'invalide donc ce premier calcul mis en cache.
 * Consequence mesuree ci-dessous : la valeur reste figee sur ce que
 * `router.resolve(undefined)` a produit (la racine `/`), jamais sur la
 * cible du theme.
 *
 * @description
 * ⛔ SECOND EFFET MESURE, INDEPENDANT DU PREMIER : cette meme lecture
 * interne de vue-router emet DEUX `console.warn` ("Invalid value for prop
 * \"to\"...", "router.resolve() was passed an invalid location...") des
 * qu'elle s'execute avec `to` non defini — c'est-a-dire a CHAQUE montage
 * d'un composant qui n'agit PAS comme un lien (la tres grande majorite des
 * usages de Btn/Card/Chip/ListItem/BreadcrumbItem). Le code gate actuel
 * n'appelle jamais `RouterLink.useLink()` dans ce cas et n'emet donc rien.
 *
 * @description
 * DECISION : le correctif est rejete, le code garde son gate initial
 * (`props.to ? RouterLink.useLink(props) : undefined`), et
 * `useLink.to` reste baseline dans `composable-setup-reads.json` — pas
 * par negligence, mais parce que la seule alternative testee est a la
 * fois PIRE (bruit console permanent) et NE RESOUT PAS le cas qu'elle visait
 * (le theme n'active jamais le routage). Ce fichier PIN les deux mesures
 * pour qu'une reprise future de cette idee se heurte a un test rouge
 * plutot qu'a une intuition.
 ********************************************************/

import { createMemoryHistory, createRouter } from 'vue-router'
import { defineComponent, h } from 'vue'
import { mount } from '@vue/test-utils'
import { describe, expect, it, vi } from 'vitest'

import { createOrigam } from '@origam/origam'
import type { IOrigamTheme } from '@origam/interfaces'
import { useLink } from '@origam/composables/Commons/link.composable'

function makeRouter () {
    return createRouter({
        history: createMemoryHistory(),
        routes: [
            {path: '/', component: {template: '<div/>'}},
            {path: '/about', component: {template: '<div/>'}}
        ]
    })
}

describe('#504 — useLink.to : limite connue et acceptee (pas un oubli)', () => {
    it('un theme fournissant `to` (jamais passe par le consommateur) ne fait PAS de href/route/navigate — connu, baseline', async () => {
        const router = makeRouter()
        await router.push('/')
        await router.isReady()

        let api!: ReturnType<typeof useLink>
        const Host = defineComponent({
            name: 'LinkThemeRaceHost',
            props: {
                to: {type: String, default: undefined},
                href: {type: String, default: undefined},
                tag: {type: String, default: undefined},
                exact: {type: Boolean, default: false}
            },
            setup (props, ctx) {
                api = useLink(props as any, ctx.attrs)
                return () => h('div')
            }
        })

        const theme: IOrigamTheme = {
            name: 'brandx',
            components: {'link-theme-race-host': {to: '/about'}},
            vars: {}
        }
        const origam = createOrigam({themes: [theme]})
        origam._defaultsRef.value = origam._activeDefaultsFor('brandx', undefined)

        mount(Host, {global: {plugins: [router, origam]}})
        await router.isReady()

        expect(api.isLink.value).toBe(true)
        expect(api.href.value).toBeUndefined()
        expect(api.route).toBeUndefined()
        expect(api.navigate).toBeUndefined()
    })

    it('un montage sans `to` (le cas majoritaire : Btn/Card/Chip non-lien) ne genere AUCUN console.warn — regression guard', async () => {
        const router = makeRouter()
        await router.push('/')
        await router.isReady()

        const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {
        })

        const Host = defineComponent({
            name: 'LinkPlainMountHost',
            props: {
                to: {type: String, default: undefined},
                href: {type: String, default: undefined},
                tag: {type: String, default: undefined},
                exact: {type: Boolean, default: false}
            },
            setup (props, ctx) {
                useLink(props as any, ctx.attrs)
                return () => h('div')
            }
        })

        mount(Host, {global: {plugins: [router]}})

        expect(warnSpy).not.toHaveBeenCalled()
        warnSpy.mockRestore()
    })
})
