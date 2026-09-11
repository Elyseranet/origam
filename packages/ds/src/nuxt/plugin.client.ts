import { watch } from 'vue'

import { useTheme } from '../composables'

import type { IOrigamNuxtRuntimeConfig } from '../interfaces'

import { createOrigam } from '../origam'

import type { TMode, TTheme } from '../types/Theme/theme.type'

import { defineNuxtPlugin, useCookie, useRuntimeConfig } from '#app'
import type { NuxtApp } from '#app'

export default defineNuxtPlugin({
    name: 'origam:client',
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

        const themeFromDom = (typeof document !== 'undefined' && document.documentElement.dataset.theme) || null

        // The brand axis keeps its intent (`auto` removes the attribute, the DS
        // default sheet's `:root` takes over). The mode axis is different: the
        // composable holds the user *intent* (which may be `auto`), but the
        // `data-mode` attribute MUST always stay concrete because the token
        // matrix has no mode-less fallback. So we drive `mode` from the stored
        // intent (cookie / configured default) and write the *resolved* value
        // to the DOM via the `resolvedMode` watcher below.
        const initialTheme = (themeFromDom ?? themeCookie.value ?? config.defaultTheme) as TTheme
        const initialMode = (modeCookie.value ?? config.defaultMode) as TMode

        // Install the configured theme OBJECTS (ADR-004 — no preset-name
        // resolution; the objects travel in the runtime config). createOrigam
        // injects each one's name×mode scoped `<style>` block and provides the
        // installed-themes list for `useInstalledThemes()`.
        // `ssr: true` is REQUIRED for hydration safety. Without it, the client
        // seeds `useDisplay().mobile` from the real `window.innerWidth` during
        // the FIRST (hydration) render, while the server seeded it from width 0
        // (SSR has no window) → `mobile` differs → components keyed on it
        // (OrigamSlideGroup/OrigamChipGroup emit `--mobile`, breakpoint-aware
        // layouts, …) produce a hydration mismatch. With `ssr: true`, the client
        // ALSO starts at width 0 (matching the server markup) and `createOrigam`
        // defers `display.update()` to `app:suspense:resolve` (post-hydration),
        // flipping to real viewport metrics only once the DOM is stable.
        const themes = config.themes ?? []
        const origam = createOrigam({ themes, ssr: true })
        nuxtApp.vueApp.use(origam)

        // `useTheme()` owns the DOM contract: its internal watchers apply
        // `data-theme` (raw brand) and a CONCRETE `data-mode` (resolved) on
        // every change, immediately — including upgrading a stored/system
        // `auto` to the real `prefers-color-scheme` here on the client,
        // replacing the server's safe-default `data-mode`. The plugin only
        // seeds the intent and persists it to the cookies.
        const themeApi = useTheme()
        themeApi.setTheme(initialTheme)
        themeApi.setMode(initialMode)

        // Per-component DEFAULT PROPS follow the ACTIVE brand×mode. On every
        // theme/mode change we REASSIGN `defaultsRef.value` to a NEW object
        // (recomputed from the install list) so the `useDefaults` computeds in
        // components re-run. `immediate: true` syncs the client to the live
        // intent right after install (the server seeded the SSR paint). `auto`
        // brand maps to '' (the DS `:root` default — no brand component map).
        watch(
            [themeApi.theme, themeApi.resolvedMode],
            ([brand, mode]) => {
                origam._defaultsRef.value = origam._activeDefaultsFor(
                    brand === 'auto' ? '' : brand,
                    mode
                )
            },
            { immediate: true }
        )

        watch(themeApi.theme, (next) => {
            themeCookie.value = next as string
        }, { flush: 'post' })

        watch(themeApi.mode, (next) => {
            modeCookie.value = next as string
        }, { flush: 'post' })

        return {
            provide: {
                origam: {
                    theme: initialTheme,
                    mode: initialMode
                }
            }
        }
    }
})
