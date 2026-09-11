// `loadingText` (Panel + Content) and `eager` / `loadingText` (Panels) —
// verdict: cablees.
//
// Three dead props, one family, two different reasons:
//
// * `OrigamExpansionPanel.loadingText` / `OrigamExpansionPanelContent.
//   loadingText` — both components DO render a loading indicator, they just
//   never told it what to announce, so every value produced the renderer's
//   own default `'origam.loading'`. Fixed by binding `:label="loadingText"`
//   on `<origam-progress>` / `<origam-skeleton>`, which already resolve
//   `label` as a locale key into their `aria-label`. (Panel was not in the
//   guard's baseline — it forwards its whole props object, so the static
//   pass skips it — but the doc listed it as a "Known gap" and the fix is
//   the same line.)
//
// * `OrigamExpansionPanels.eager` / `.loadingText` — the PLURAL is a
//   container: it owns no content to keep mounted and paints no loading
//   indicator (its own `loading` prop only emits the `--loading` class
//   hook). Both props are only meaningful one level down, so they join the
//   `<origam-defaults-provider>` cascade the component already runs for
//   `density` / `color` / `bgColor` / `rounded` / `border`.
//
// ⛔ `eager` MUST go through `wasPropPassed`, not `omitUndefined` alone:
// Vue resolves an unset boolean prop to a concrete `false`, which would then
// win the `mergeDeep` and force `eager: false` onto every panel even when
// the consumer never wrote it (#263). The last test pins that.
//
// ⛔ Reads are awaited. `<OrigamProgress>` reaches its concrete linear /
// circular child through a TEMPLATE REF (`filterProps`), `undefined` on
// render 1 — see the long note in `props.composable.ts`. Asserting
// synchronously reads the child's own default and reports a working binding
// as broken.
//
// ⛔ What `eager` changes in the DOM, measured rather than assumed: the
// content COMPONENT is always mounted (`.origam-expansion-panel-content`
// exists in all three cases). What moves is whether `useLazy` has rendered
// the body inside it while the panel is still collapsed:
//
//     neither      body rendered = false
//     panel eager  body rendered = true
//     group eager  body rendered = true
//
// so the assertions below look for the body text, never for the wrapper.

import { describe, expect, it } from 'vitest'
import { h, nextTick } from 'vue'
import { mount } from '@vue/test-utils'

import OrigamExpansionPanel from '@origam/components/ExpansionPanel/OrigamExpansionPanel.vue'
import OrigamExpansionPanels from '@origam/components/ExpansionPanel/OrigamExpansionPanels.vue'
import { createOrigam } from '@origam/origam'

const BODY = 'PANEL_BODY_MARKER'

function mountPanels (panelsProps: Record<string, unknown>, panelProps: Record<string, unknown> = {}) {
    return mount(OrigamExpansionPanels, {
        props: panelsProps as never,
        slots: {
            default: () => h(OrigamExpansionPanel as never, { title: 'Panel', content: BODY, ...panelProps })
        },
        global: { plugins: [createOrigam()] }
    })
}

async function flush () {
    await nextTick()
    await nextTick()
}

/**
 * `aria-label`s of the loading indicators under `root`.
 *
 * ⛔ The root MUST be scoped. With `loading: true` the family paints TWO
 * indicators — one in `.origam-expansion-panel__loader` (owned by
 * `OrigamExpansionPanel`) and one in `.origam-expansion-panel-content`
 * (owned by `OrigamExpansionPanelContent`). An unscoped query passes on
 * either one, so removing the Panel's `:label` binding left the whole file
 * green: measured, and the reason this helper takes a selector.
 */
async function loaderLabels (
    wrapper: ReturnType<typeof mountPanels>,
    root: string
): Promise<Array<string | undefined>> {
    await flush()

    return wrapper
        .findAll(`${root} [role="progressbar"][aria-label], ${root} [role="status"][aria-label]`)
        .map((el) => el.attributes('aria-label'))
}

const PANEL_LOADER = '.origam-expansion-panel__loader'
const CONTENT = '.origam-expansion-panel-content'

describe('OrigamExpansionPanel — loadingText reaches the loading indicator', () => {
    it('translates a custom loadingText key on the panel-level progress', async () => {
        const wrapper = mountPanels({}, { loading: true, loadingText: 'origam.data_iterator.loading_text' })

        expect(await loaderLabels(wrapper, PANEL_LOADER)).toEqual(['Loading items...'])
    })

    it('two distinct loadingText values produce two distinct announcements', async () => {
        const a = mountPanels({}, { loading: true, loadingText: 'origam.loading' })
        const b = mountPanels({}, { loading: true, loadingText: 'origam.data_iterator.loading_text' })

        expect(await loaderLabels(a, PANEL_LOADER)).not.toEqual(await loaderLabels(b, PANEL_LOADER))
    })

    it('falls back to the shared origam.loading key when omitted', async () => {
        const wrapper = mountPanels({}, { loading: true })

        expect(await loaderLabels(wrapper, PANEL_LOADER)).toEqual(['Loading...'])
    })
})

describe('OrigamExpansionPanelContent — loadingText reaches the skeleton lines', () => {
    it('labels all three skeleton lines with the custom key', async () => {
        const wrapper = mountPanels({}, {
            loading: { type: 'skeleton' },
            loadingText: 'origam.data_iterator.loading_text',
            eager: true
        })

        const labels = await loaderLabels(wrapper, CONTENT)

        expect(labels.filter((l) => l === 'Loading items...')).toHaveLength(3)
    })

    it('falls back to origam.loading on the skeleton lines when omitted', async () => {
        const wrapper = mountPanels({}, { loading: { type: 'skeleton' }, eager: true })

        const labels = await loaderLabels(wrapper, CONTENT)

        expect(labels.filter((l) => l === 'Loading...')).toHaveLength(3)
    })
})

describe('OrigamExpansionPanels — loadingText cascades to the panels', () => {
    it('cascades loadingText to a panel that sets none of its own', async () => {
        const wrapper = mountPanels(
            { loadingText: 'origam.data_iterator.loading_text' },
            { loading: true }
        )

        expect(await loaderLabels(wrapper, PANEL_LOADER)).toEqual(['Loading items...'])
        expect(await loaderLabels(wrapper, CONTENT)).toEqual(['Loading items...'])
    })

    it("a panel's own loadingText still wins over the group's", async () => {
        const wrapper = mountPanels(
            { loadingText: 'origam.data_iterator.loading_text' },
            { loading: true, loadingText: 'origam.loading' }
        )

        const labels = await loaderLabels(wrapper, PANEL_LOADER)

        expect(labels).toEqual(['Loading...'])
    })
})

describe('OrigamExpansionPanels — eager cascades to the panels', () => {
    it('group eager renders the collapsed panel body', async () => {
        const wrapper = mountPanels({ eager: true })
        await flush()

        expect(wrapper.html()).toContain(BODY)
    })

    it('no eager anywhere leaves the collapsed panel body unrendered', async () => {
        const wrapper = mountPanels({})
        await flush()

        expect(wrapper.html()).not.toContain(BODY)
    })

    it('an UNSET eager on the group does not force eager=false onto the panel', async () => {
        // Vue resolves an unset boolean prop to a concrete `false`. Were the
        // cascade built on `omitUndefined` alone it would ship that `false`
        // as a default and beat the panel's own `eager` — #263.
        const wrapper = mountPanels({}, { eager: true })
        await flush()

        expect(wrapper.html()).toContain(BODY)
    })
})
