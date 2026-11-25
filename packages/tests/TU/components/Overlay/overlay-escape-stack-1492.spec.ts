// #1492 — regression de 2.44.0 (#1357) : dans un dialog, un seul Echap sur un
// select ouvert fermait le menu ET le dialog.
//
// Cause : le `keydown` du select (sur l'input) ferme son menu AVANT que les
// ecouteurs `window` des overlays ne tournent ; le scope du menu est arrete au
// microtask qui suit ce handler natif, le menu quitte GLOBAL_STACK, et le
// ecouteur window du dialog lit `globalTop` -> true. jsdom n'execute pas de
// microtask entre deux ecouteurs d'un `dispatchEvent` : le test rejoue donc
// l'effet du microtask a la main (depilage synchrone) dans un handler de `body`.

import { afterEach, describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import { nextTick } from 'vue'

import OrigamOverlay from '@origam/components/Overlay/OrigamOverlay.vue'
import { GLOBAL_STACK } from '@origam/consts/Commons/stack.const'
import { createOrigam } from '@origam/origam'

const mounted: Array<{ unmount: () => void }> = []

function mountOverlay (props: Record<string, unknown> = {}) {
    const wrapper = mount(OrigamOverlay, {
        props: { modelValue: true, ...props } as never,
        attachTo: document.body,
        global: {
            plugins: [createOrigam({})],
            stubs: { transition: false, 'transition-group': false }
        },
        slots: { default: () => 'content' }
    })
    mounted.push(wrapper)

    return wrapper
}

afterEach(() => {
    mounted.splice(0).forEach(w => w.unmount())
})

describe('Overlay Escape — sommet de pile fige au debut de l\'evenement (#1492)', () => {
    it('un overlay depile par un handler intermediaire du MEME evenement ne fait pas fermer celui du dessous', async () => {
        const outer = mountOverlay()
        await nextTick()
        // persistent : garde son scope vivant (sinon son depilage reel s'ajouterait au depilage simule)
        mountOverlay({ persistent: true })
        await nextTick()
        expect(GLOBAL_STACK.length).toBe(2)

        const onBody = () => {
            GLOBAL_STACK.splice(GLOBAL_STACK.length - 1, 1)
        }
        document.body.addEventListener('keydown', onBody, { once: true })

        document.body.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }))
        await nextTick()

        expect(outer.emitted('update:modelValue')).toBeUndefined()
    })
})
