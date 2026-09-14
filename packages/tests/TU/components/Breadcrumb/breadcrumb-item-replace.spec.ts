import { describe, expect, it, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { createMemoryHistory, createRouter } from 'vue-router'
import { OrigamBreadcrumbItem } from '@origam/components'
import { createOrigam } from '@origam/origam'

/*********************************************************
 * OrigamBreadcrumbItem — `replace` EST vivant (critere C7, grief invalide)
 *
 * @description
 * Le classeur d'inspection listait `replace` comme prop morte : « jamais
 * lue, ni par useLink ni par OrigamBreadcrumbItem.vue — le controle de la
 * story n'a aucun effet observable ». La mesure ci-dessous dit l'inverse.
 *
 * @description
 * `useLink` fait `RouterLink.useLink(props as UseLinkOptions)` en passant
 * l'OBJET PROPS ENTIER (link.composable.ts:81). vue-router lit alors
 * `unref(props.replace)` dans son propre `navigate()`
 * (vue-router 4.6.4, vue-router.mjs:932 :
 * `router[unref(props.replace) ? 'replace' : 'push'](unref(props.to))`).
 * Le composant cable `@click="link.navigate"` sur sa racine. La chaine est
 * donc complete — elle est juste invisible a un `grep replace` sur le DS,
 * ce qui explique le faux positif.
 *
 * @description
 * Elle ne vaut evidemment QUE sur le chemin `to` (router-link) : avec
 * `href` seul, il n'y a pas de navigation programmee du tout, donc rien a
 * remplacer. C'est la meme condition que pour `exact`.
 ********************************************************/

const buildRouter = () => createRouter({
    history: createMemoryHistory(),
    routes: [
        { path: '/', component: { template: '<div/>' } },
        { path: '/target', component: { template: '<div/>' } }
    ]
})

const mountItem = async (props: Record<string, unknown>) => {
    const router = buildRouter()
    await router.push('/')
    await router.isReady()

    const wrapper = mount(OrigamBreadcrumbItem, {
        props: { title: 'Item', ...props } as never,
        global: { plugins: [createOrigam(), router] }
    })

    return { wrapper, router }
}

describe('OrigamBreadcrumbItem — prop `replace`', () => {
    it('replace=true routes the click through router.replace, not router.push', async () => {
        const { wrapper, router } = await mountItem({ to: '/target', replace: true })

        const replaceSpy = vi.spyOn(router, 'replace')
        const pushSpy = vi.spyOn(router, 'push')

        await wrapper.find('a').trigger('click')

        expect(replaceSpy).toHaveBeenCalledTimes(1)
        expect(pushSpy).not.toHaveBeenCalled()

        wrapper.unmount()
    })

    it('without replace, the same click goes through router.push', async () => {
        const { wrapper, router } = await mountItem({ to: '/target' })

        const replaceSpy = vi.spyOn(router, 'replace')
        const pushSpy = vi.spyOn(router, 'push')

        await wrapper.find('a').trigger('click')

        expect(pushSpy).toHaveBeenCalledTimes(1)
        expect(replaceSpy).not.toHaveBeenCalled()

        wrapper.unmount()
    })
})
