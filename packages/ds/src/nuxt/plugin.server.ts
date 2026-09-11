import { createOrigam } from '../origam'

import { themeToCss } from '../utils/Theme/apply-theme.util'

import type { IOrigamNuxtRuntimeConfig } from '../interfaces'

import {
    ORIGAM_MODE_ATTR,
    ORIGAM_MODE_DARK,
    ORIGAM_MODE_LIGHT,
    ORIGAM_THEME_ATTR,
    ORIGAM_THEME_AUTO
} from '../consts'

import type { TMode, TTheme } from '../types/Theme/theme.type'

import { defineNuxtPlugin, useCookie, useHead, useRequestHeaders, useRuntimeConfig } from '#app'
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
 * Resolve the color mode SSR-side to a CONCRETE value (`'light'` | `'dark'`).
 *
 * The token matrix (`themes-all.css` and the per-brand sheets) only emits
 * compound `[data-theme="X"][data-mode="Y"]` rules — there is NO bare
 * `[data-theme="X"]` fallback and no `@media (prefers-color-scheme)` block at
 * that tier. So `data-mode` MUST always be a concrete value, otherwise no
 * token rule matches and the page renders unthemed (white). We therefore
 * never return `'auto'` here: when the user expressed no preference we pick a
 * safe default (`'light'`) for the SSR paint; the client plugin upgrades it
 * to the real `prefers-color-scheme` at mount.
 *
 * Priority:
 * 1. explicit cookie (user choice),
 * 2. configured default (when not `'auto'`),
 * 3. `Sec-CH-Prefers-Color-Scheme` client hint,
 * 4. `'light'` (safe SSR default — client upgrades to the system preference).
 */
function resolveServerMode (cookieValue: string | null | undefined, config: IOrigamNuxtRuntimeConfig, headers: Record<string, string | undefined>): Exclude<TMode, 'auto'> {
    if (cookieValue === ORIGAM_MODE_LIGHT || cookieValue === ORIGAM_MODE_DARK) {
        return cookieValue
    }

    if (config.defaultMode === ORIGAM_MODE_LIGHT || config.defaultMode === ORIGAM_MODE_DARK) {
        return config.defaultMode
    }

    const hint = headers['sec-ch-prefers-color-scheme']
    if (hint === ORIGAM_MODE_DARK && config.modes.includes(ORIGAM_MODE_DARK)) {
        return ORIGAM_MODE_DARK
    }
    if (hint === ORIGAM_MODE_LIGHT && config.modes.includes(ORIGAM_MODE_LIGHT)) {
        return ORIGAM_MODE_LIGHT
    }

    return ORIGAM_MODE_LIGHT
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

        const headers = useRequestHeaders(['sec-ch-prefers-color-scheme'])
        const resolvedTheme = resolveServerTheme(themeCookie.value, config)
        const resolvedMode = resolveServerMode(modeCookie.value, config, headers)

        // `data-mode` is ALWAYS written (concrete) — the token matrix has no
        // mode-less fallback (see `resolveServerMode`). `data-theme` is omitted
        // when the brand resolves to `'auto'`, deferring to the DS default
        // sheet's `:root` rules.
        const htmlAttrs: Record<string, string> = {
            [ORIGAM_MODE_ATTR]: resolvedMode
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
            const modeMatches = theme.mode === undefined || theme.mode === resolvedMode
            return brandMatches && modeMatches
        })
        const ssrThemeCss = activeThemes.map(themeToCss).join('\n')

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
        origam._defaultsRef.value = origam._activeDefaultsFor(
            resolvedTheme === ORIGAM_THEME_AUTO ? '' : resolvedTheme,
            resolvedMode
        )

        nuxtApp.vueApp.use(origam)

        return {
            provide: {
                origam: {
                    theme: resolvedTheme,
                    mode: resolvedMode
                }
            }
        }
    }
})
