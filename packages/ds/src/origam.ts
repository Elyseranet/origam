import * as origamComponents from './components'

import { createDate, createDefaults, createDisplay, createGoTo, createIcons, createLocale } from './composables'

import {
    IN_BROWSER,
    ORIGAM_DATE_ADAPTER_KEY,
    ORIGAM_DATE_OPTIONS_KEY,
    ORIGAM_DEFAULTS_KEY,
    ORIGAM_DISPLAY_KEY,
    ORIGAM_GO_TO_KEY,
    ORIGAM_ICONS_KEY,
    ORIGAM_LOCALE_KEY,
    ORIGAM_THEME_DEFAULTS_KEY,
    ORIGAM_THEMES_KEY
} from './consts'

import * as origamDirectives from './directives'
import { setContrastConfig } from './directives/Contrast/contrast.directive'

import type { IDefault, INuxtAwareApp, IOrigamOptions, IOrigamTheme } from './interfaces'
import type { TIconOptions, TModeResolved } from './types'
import { applyThemes, getUid, installedThemesFromList, mergeDeep } from './utils'

import { origamTheme } from './themes/origam.theme'

import '@mdi/font/css/materialdesignicons.css'

import { App, ComponentPublicInstance, defineComponent, effectScope, InjectionKey, nextTick, reactive } from 'vue'

export function createOrigam (origam: IOrigamOptions = {}) {
    const {blueprint, ...rest} = origam
    const options: IOrigamOptions = mergeDeep(blueprint, rest)
    const {
        aliases = {},
        components = origamComponents,
        directives = origamDirectives
    } = options

    // Collect singular `theme` + plural `themes` into one install list. The
    // installed-brand summary is computed eagerly (pure, SSR-safe) so it can be
    // provided to the app context on both server and client.
    //
    // ADR-004 + the two-axis model: the DS ships ONE default identity, `origam`,
    // ROOT-scoped (no `name`: light at `:root`, dark at `[data-mode="dark"]`). It
    // is ALWAYS injected first as the zero-config baseline, so every component has
    // a complete token surface even when no brand is selected. Consumer brands
    // (named, e.g. marketing's `sobre` / `glass` / …) are layered ON TOP and
    // override via `[data-theme="<brand>"]`. A bare `app.use(createOrigam())`
    // therefore paints with the neutral origam identity; the 7 brand themes live
    // in the marketing package.
    const suppliedThemes = [
        ...(options.theme ? [options.theme] : []),
        ...(options.themes ?? [])
    ]
    const allThemes: IOrigamTheme[] = [...origamTheme, ...suppliedThemes]
    const installedThemes = installedThemesFromList(allThemes)

    // Seed the per-component DEFAULT PROPS provider. The active brand×mode
    // themes' `component` maps are collapsed into one `IDefault` and provided
    // under `ORIGAM_DEFAULTS_KEY`, so `useDefaults(props)` in components resolves
    // a missing prop against the theme before falling back to `withDefaults`.
    // The Nuxt plugins reassign `defaultsRef.value` (a NEW object) whenever the
    // brand / mode changes — never mutate in place, or the `useDefaults`
    // computeds won't re-evaluate.
    const defaultsRef = createDefaults({})
    defaultsRef.value = activeDefaultsFor(allThemes, allThemes[0]?.name ?? '', undefined)

    const scope = effectScope()
    return scope.run(() => {
        const icons = createIcons(options.icons)
        const display = createDisplay(options.display, options.ssr)
        const locale = createLocale(options.locale)
        const date = createDate(options.date, locale)
        const goTo = createGoTo(options.goTo, locale)

        setContrastConfig(options.contrast)

        const install = (app: App) => {
            // Runtime theme injection. SSR-safe: `applyThemes` is a no-op when
            // `document` is unavailable, so the server render is untouched and
            // the variables land on the first client install instead. Each
            // theme gets its own name×mode scoped `<style>` block.
            if (allThemes.length) {
                applyThemes(allThemes)
            }

            for (const key in directives) {
                app.directive(key, directives[key as keyof typeof directives])
            }

            for (const key in components) {
                app.component(key, components[key as keyof typeof components])
            }

            for (const key in aliases) {
                app.component(key, defineComponent({
                    ...aliases[key],
                    name: key,
                    aliasName: aliases[key].name
                }))
            }


            const appScope = effectScope()
            app.onUnmount(() => appScope.stop())

            app.provide(ORIGAM_ICONS_KEY, icons as Required<TIconOptions>)
            app.provide(ORIGAM_DISPLAY_KEY, display)
            app.provide(ORIGAM_LOCALE_KEY, locale)
            app.provide(ORIGAM_DATE_OPTIONS_KEY, date.options)
            app.provide(ORIGAM_DATE_ADAPTER_KEY, date.instance)
            app.provide(ORIGAM_GO_TO_KEY, goTo)
            app.provide(ORIGAM_THEMES_KEY, installedThemes)
            app.provide(ORIGAM_DEFAULTS_KEY, defaultsRef)
            // Resolver over the full install list so `<OrigamThemeProvider>` can
            // re-apply a named brand's default props to its sub-tree, mirroring
            // the document-root defaults collapse. Static (install-time) — no
            // reassignment on theme switch needed.
            app.provide(ORIGAM_THEME_DEFAULTS_KEY, (brand: string, mode?: TModeResolved) =>
                activeDefaultsFor(allThemes, brand, mode))

            if (IN_BROWSER && options.ssr) {
                const nuxt = (app as App & INuxtAwareApp).$nuxt

                if (nuxt) {
                    nuxt.hook('app:suspense:resolve', () => {
                        display.update()
                    })
                } else {
                    const {mount} = app
                    app.mount = (...args) => {
                        const vm = mount(...args)
                        nextTick(() => display.update())
                        app.mount = mount
                        return vm
                    }
                }
            }

            getUid.reset()

            if (typeof __VUE_OPTIONS_API__ !== 'boolean' || __VUE_OPTIONS_API__) {
                app.mixin({
                    computed: {
                        $origam () {
                            return reactive({
                                display: inject.call(this as unknown as ComponentPublicInstance, ORIGAM_DISPLAY_KEY),
                                icons: inject.call(this as unknown as ComponentPublicInstance, ORIGAM_ICONS_KEY),
                                locale: inject.call(this as unknown as ComponentPublicInstance, ORIGAM_LOCALE_KEY),
                                date: inject.call(this as unknown as ComponentPublicInstance, ORIGAM_DATE_ADAPTER_KEY)
                            })
                        }
                    }
                })
            }
        }

        function unmount () {
            scope.stop()
        }

        return {
            install,
            unmount,
            display,
            icons,
            locale,
            date,
            goTo,
            themes: installedThemes,
            // Reactive per-component DEFAULT PROPS map (provided under
            // ORIGAM_DEFAULTS_KEY). The Nuxt plugins reassign `.value` (a NEW
            // object) whenever the active brand / mode changes so `useDefaults`
            // computeds re-run. NEVER mutate it in place.
            _defaultsRef: defaultsRef,
            // Re-export the collapse helper so the plugins can recompute the
            // active defaults from the same install list on a theme switch.
            _activeDefaultsFor: (brand: string, mode?: TModeResolved): IDefault =>
                activeDefaultsFor(allThemes, brand, mode)
        }
    })!
}

/**
 * Collapse the per-component DEFAULT PROPS (`theme.components`) of the themes
 * matching the ACTIVE brand×mode into a single `IDefault`. A theme matches when
 * its `name` equals `brand` AND its `mode` is compatible with the active `mode`:
 *   - the theme is mode-agnostic (`mode` unset or `'auto'`), OR
 *   - the active `mode` is unset (match every mode of the brand — used for the
 *     mode-less install-time seed before the plugins resolve a concrete mode), OR
 *   - the theme's `mode` equals the active `mode`.
 * Matching themes are deep-merged in install order (later wins) via the shared
 * `mergeDeep` util — no hand-rolled merge.
 *
 * Pure (no DOM / Vue access) so it runs identically on the server and client.
 */
export function activeDefaultsFor (
    themes: IOrigamTheme[],
    brand: string,
    mode?: TModeResolved
): IDefault {
    let merged: IDefault = {}
    for (const theme of themes) {
        if (!theme.components) continue
        // A name-less theme is the ROOT baseline (`origam`) — its component
        // defaults ALWAYS apply; the active brand is layered on top.
        const brandMatches = !theme.name || theme.name === brand
        const themeModeAgnostic = theme.mode === undefined || theme.mode === 'auto'
        const modeMatches = themeModeAgnostic || mode === undefined || theme.mode === mode
        if (brandMatches && modeMatches) {
            merged = mergeDeep(merged, theme.components) as IDefault
        }
    }
    return merged
}

// Vue's inject() can only be used in setup
function inject (this: ComponentPublicInstance, key: InjectionKey<any> | string) {
    const vm = this.$

    // `provides` is a runtime property of ComponentInternalInstance that Vue's
    // public types don't expose — cast to read it (appContext.provides is public).
    const parentProvides = (vm.parent as { provides?: Record<string | symbol, unknown> } | null)?.provides

    const provides = parentProvides ?? vm.vnode.appContext?.provides

    if (provides && (key as any) in provides) {
        return provides[(key as string)]
    }
}
