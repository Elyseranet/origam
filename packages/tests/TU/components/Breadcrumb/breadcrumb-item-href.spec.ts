import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import { createMemoryHistory, createRouter } from 'vue-router'
import { OrigamBreadcrumbItem } from '@origam/components'
import { createOrigam } from '@origam/origam'

/*********************************************************
 * OrigamBreadcrumbItem — l'attribut `href` rendu est une CHAINE (#1032)
 *
 * @description
 * `useLink` rend `href` sous forme de ref. Le template ecrivait
 * `:href="link.href"` : `link` est un objet simple (pas une ref de premier
 * niveau), donc la ref n'etait PAS deballee et le navigateur recevait
 * `href="[object Object]"` — mesure navigateur sur `/components/bracket-match`,
 * maillon parent du fil d'Ariane. `OrigamListItem` ecrit `link.href.value`.
 * Le test porte sur l'attribut RENDU : c'est lui que le visiteur suit.
 ********************************************************/

const mountItem = async (props: Record<string, unknown>) => {
    const router = createRouter({
        history: createMemoryHistory(),
        routes: [
            { path: '/', component: { template: '<div/>' } },
            { path: '/components/bracket', component: { template: '<div/>' } }
        ]
    })
    await router.push('/')
    await router.isReady()

    return mount(OrigamBreadcrumbItem, {
        props: { title: 'Item', ...props } as never,
        global: { plugins: [createOrigam(), router] }
    })
}

describe('OrigamBreadcrumbItem — href rendu', () => {
    it('`to` rend le chemin resolu, jamais « [object Object] »', async () => {
        const wrapper = await mountItem({ to: '/components/bracket' })

        expect(wrapper.find('a').attributes('href')).toBe('/components/bracket')
    })

    it('`href` seul rend la chaine passee', async () => {
        const wrapper = await mountItem({ href: '/components/bracket' })

        expect(wrapper.find('a').attributes('href')).toBe('/components/bracket')
    })
})
