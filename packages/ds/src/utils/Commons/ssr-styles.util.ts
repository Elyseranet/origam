import type { App } from 'vue'

import type { ISsrStyleCollector, ISsrStyleEntry } from '../../interfaces/Commons/style.interface'

/*********************************************************
 * ssr-styles
 *
 * @description
 * `useStyle()` writes its `#id { … }` rule into `<head>` from `onMounted`,
 * which never runs on the server: the rule did not exist in the served HTML,
 * so a component that paints only through it (Btn, Avatar, Stepper…) was
 * unstyled until hydration (#1092). On the server `useStyle()` now registers
 * the rule in a collector instead, and this module is how the host gets it
 * out of the render.
 *
 * @description
 * The collector is keyed by the Vue APP, not by a module global: a persistent
 * server process renders many requests, and a shared registry would hand one
 * request's rules to another. `createOrigam()` installs one per `app.use()`.
 *
 * @description
 * `escapeStyleText`: a `<style>` element ends at the first `</style`, whatever
 * the CSS says, so a style value that contains it (a colour prop forwarded
 * from user input) would close the tag and inject markup. `<\/style` is the
 * same CSS (`\/` is an escaped `/`) and is not an end tag.
 *
 * @description
 * `getSsrStyles(app)` returns the rules of a finished server render, one entry
 * per component instance (empty when the app was never installed on the
 * server), for hosts that assemble their own head: Nuxt feeds it to `useHead`.
 *
 * @description
 * `renderSsrStyles(app)` returns the same rules as ready-to-insert `<style>`
 * tags, for plain Vue SSR (no Nuxt):
 * `const html = await renderToString(app)`, then put
 * `renderSsrStyles(app)` inside `<head>`. Each tag keeps its `id`, which is
 * what lets the client reuse it at mount instead of stacking a second one.
 ********************************************************/
const collectors = new WeakMap<App, ISsrStyleCollector>()

function escapeStyleText (css: string): string {
    return css.replace(/<\/(style)/gi, '<\\/$1')
}

export function createSsrStyleCollector (): ISsrStyleCollector {
    const getters = new Map<string, () => string>()

    return {
        add (id, css) {
            getters.set(id, css)
        },
        entries () {
            return [...getters].map(([id, css]) => ({ id, css: escapeStyleText(css()) }))
        }
    }
}

export function registerSsrStyleCollector (app: App): ISsrStyleCollector {
    const collector = createSsrStyleCollector()

    collectors.set(app, collector)

    return collector
}

export function getSsrStyles (app: App): ISsrStyleEntry[] {
    return collectors.get(app)?.entries() ?? []
}

export function renderSsrStyles (app: App): string {
    return getSsrStyles(app)
        .map(({ id, css }) => `<style id="${id}">${css}</style>`)
        .join('')
}
