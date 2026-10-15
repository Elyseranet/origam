import { createOrigam } from '../origam'

import { isModePinned, themeToCss, themeToUnpinnedCss } from '../utils/Commons/apply-theme.util'
import { getSsrStyles } from '../utils/Commons/ssr-styles.util'

import type { IOrigamNuxtRuntimeConfig } from '../interfaces/Commons/nuxt-module.interface'

import { ORIGAM_MODE_ATTR, ORIGAM_MODE_DARK, ORIGAM_MODE_LIGHT, ORIGAM_THEME_ATTR, ORIGAM_THEME_AUTO } from '../consts/Commons/theme.const'

import type { TMode, TTheme } from '../types/Commons/theme.type'

import { defineNuxtPlugin, useCookie, useHead, useRuntimeConfig } from '#app'
import type { NuxtApp } from '#app'

/**
 * Resolve the brand theme SSR-side. The brand axis is driven exclusively by
 * the cookie and the configured default — never by the color-scheme hint
 * (that hint feeds the `mode` axis).
 */
function resolveServerTheme (cookieValue: string | null | undefined, config: IOrigamNuxtRuntimeConfig): TTheme {
    if (cookieValue && cookieValue !== ORIGAM_THEME_AUTO) {
        return cookieValue
    }

    if (config.defaultTheme && config.defaultTheme !== ORIGAM_THEME_AUTO) {
        return config.defaultTheme
    }

    return ORIGAM_THEME_AUTO
}

/**
 * Resolve the color mode SSR-side when it is PINNED (cookie, or a configured
 * `defaultMode` of `light` / `dark`). Callers check `isModePinned` first.
 *
 * When nothing is pinned the server does NOT guess: it omits `data-mode` and
 * emits both modes, the dark one under `@media (prefers-color-scheme: dark)`
 * (#1103). The `Sec-CH-Prefers-Color-Scheme` client hint is deliberately NOT
 * read any more: no `Accept-CH` is ever emitted, so browsers never send it.
 */
function resolveServerMode (cookieValue: string | null | undefined, config: IOrigamNuxtRuntimeConfig): Exclude<TMode, 'auto'> {
    if (cookieValue === ORIGAM_MODE_LIGHT || cookieValue === ORIGAM_MODE_DARK) {
        return cookieValue
    }

    return config.defaultMode === ORIGAM_MODE_DARK ? ORIGAM_MODE_DARK : ORIGAM_MODE_LIGHT
}

export default defineNuxtPlugin({
    name: 'origam:server',
    enforce: 'pre',
    setup (nuxtApp: NuxtApp) {
        const runtimeConfig = useRuntimeConfig().public as { origam: IOrigamNuxtRuntimeConfig }
        const config = runtimeConfig.origam

        const themeCookie = useCookie<string | null>(config.cookieName, {
            maxAge: config.cookieMaxAge,
            sameSite: 'lax',
            path: '/'
        })
        const modeCookie = useCookie<string | null>(config.modeCookieName, {
            maxAge: config.cookieMaxAge,
            sameSite: 'lax',
            path: '/'
        })

        const resolvedTheme = resolveServerTheme(themeCookie.value, config)
        const modePinned = isModePinned(modeCookie.value, config.defaultMode)
        // Unpinned: the concrete value below only seeds the component props
        // (always LIGHT, so the client's hydration render matches); it is never
        // written to the DOM.
        const resolvedMode = resolveServerMode(modeCookie.value, config)

        // `data-mode` is written (concrete) only when the mode is PINNED; otherwise
        // the `@media` blocks below carry it (#1103). `data-theme` is omitted
        // when the brand resolves to `'auto'`, deferring to the DS default
        // sheet's `:root` rules.
        const htmlAttrs: Record<string, string> = {}
        if (modePinned) {
            htmlAttrs[ORIGAM_MODE_ATTR] = resolvedMode
        }
        if (resolvedTheme !== ORIGAM_THEME_AUTO) {
            htmlAttrs[ORIGAM_THEME_ATTR] = resolvedTheme
        }

        // Install the configured theme OBJECTS (ADR-004 — no preset-name
        // resolution; the objects travel in the runtime config).
        const themes = config.themes ?? []

        // SSR no-flash: `applyTheme` (runtime DOM injection) is a no-op on the
        // server, so we emit the ACTIVE theme×mode block as a real `<style>` in
        // the SSR HTML via `useHead`. Only the active block is inlined (not all
        // installed themes) — enough to paint the first frame correctly with
        // zero flash and zero payload bloat; the client plugin injects every
        // installed theme at mount so runtime switching works. The active block
        // is matched on the resolved brand (or `'auto'`/`:root`) AND mode.
        const activeThemes = themes.filter((theme) => {
            const brandMatches = resolvedTheme === ORIGAM_THEME_AUTO
                ? (theme.name === undefined || theme.name === '')
                : theme.name === resolvedTheme
            // Unpinned: keep every mode — they are split by `@media` below.
            const modeMatches = !modePinned || theme.mode === undefined || theme.mode === 'auto' || theme.mode === resolvedMode
            return brandMatches && modeMatches
        })
        // Pinned: exactly the active block. Unpinned (#1103): mode-agnostic blocks
        // as-is, then the light blocks (`not dark`), then the dark ones (`dark`)
        // so dark wins over light when the system prefers it.
        const ssrThemeCss = modePinned
            ? activeThemes.map(themeToCss).join('\n')
            : [
                ...activeThemes.filter(t => t.mode !== 'light' && t.mode !== 'dark').map(themeToCss),
                ...activeThemes.filter(t => t.mode === 'light').map(themeToUnpinnedCss),
                ...activeThemes.filter(t => t.mode === 'dark').map(themeToUnpinnedCss)
            ].join('\n')

        useHead({
            htmlAttrs,
            style: ssrThemeCss
                ? [{ id: 'origam-theme-ssr', key: 'origam-theme-ssr', innerHTML: ssrThemeCss }]
                : []
        })

        // `ssr: true` keeps the server display state seeded from width 0 (no
        // window) so the SSR markup matches the client's first (hydration)
        // render — see the matching note in `plugin.client.ts`. On the server
        // `IN_BROWSER` is already false so widths are 0 regardless, but passing
        // the flag keeps both plugins symmetric and future-proofs any
        // server-side display branching.
        const origam = createOrigam({ themes, ssr: true })

        // Seed the per-component DEFAULT PROPS for the ACTIVE brand×mode BEFORE
        // the render so SSR markup already reflects the theme defaults — no flash
        // of withDefaults values at hydration (mirrors the inlined SSR theme CSS).
        // `auto` brand maps to '' (the DS `:root` default — no brand component map).
        // Unpinned mode: seeded LIGHT; the client hydrates with the same and
        // switches to the system mode right after hydration (#1103).
        origam._defaultsRef.value = origam._activeDefaultsFor(
            resolvedTheme === ORIGAM_THEME_AUTO ? '' : resolvedTheme,
            resolvedMode
        )

        nuxtApp.vueApp.use(origam)

        /*********************************************************
         * useStyle() rules in the head (#1092)
         *
         * @description
         * The rules of every component, registered during the render (see
         * `ssr-styles.util.ts`). `app:rendered` fires after `renderToString`
         * and BEFORE the head is serialised, so the rules collected by the
         * whole render are pushed into it here. Same `id` as the tag the client
         * looks up at mount, so it is reused, not doubled.
         ********************************************************/
        nuxtApp.hook('app:rendered', ({ ssrContext }) => {
            const styles = getSsrStyles(nuxtApp.vueApp)

            if (styles.length && ssrContext) {
                ssrContext.head.push({
                    style: styles.map(({ id, css }) => ({ id, key: id, innerHTML: css }))
                })
            }
        })

        return {
            provide: {
                origam: {
                    theme: resolvedTheme,
                    mode: modePinned ? resolvedMode : 'auto'
                }
            }
        }
    }
})
