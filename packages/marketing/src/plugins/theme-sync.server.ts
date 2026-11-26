/**
 * Marketing SSR plugin — theme singleton sync.
 *
 * The DS plugin.server only sets <html data-theme> via useHead; it does NOT
 * call useTheme().setTheme(), so the composable singleton stays at its lazy
 * default ('auto') during the SSR render. Components that bind on
 * `useTheme().theme` therefore render with theme='auto', producing wrong
 * aria-pressed / data-active attributes in the SSR HTML — which triggers a
 * Vue hydration mismatch on the client side.
 *
 * This plugin runs AFTER origam:server (enforce: 'post' is not needed since
 * Nuxt guarantees plugin order by filename / declaration order, and the DS
 * plugin is injected via addPlugin at module level which runs before app-level
 * plugins). We call useTheme().setTheme() with the same resolved value the DS
 * plugin already computed, so the singleton reflects the correct brand before
 * any component is rendered.
 *
 * #1515 — the brand is always `config.defaultTheme`: the site has no brand
 * switcher any more, and the DS reads its brand cookie under a name nobody
 * writes (`origam.cookieName` in nuxt.config.ts).
 */
import { useTheme } from 'origam/composables'
import { defineNuxtPlugin, useCookie, useRuntimeConfig } from '#app'
import type { IOrigamNuxtRuntimeConfig } from 'origam/interfaces'
import type { TTheme, TMode } from 'origam/types'
import { ORIGAM_THEME_AUTO } from '~/consts/theme.const'

export default defineNuxtPlugin({
    name: 'marketing:theme-sync-server',
    enforce: 'post',
    setup () {
        const runtimeConfig = useRuntimeConfig().public as { origam: IOrigamNuxtRuntimeConfig }
        const config = runtimeConfig.origam

        const modeCookie = useCookie<string | null>(config.modeCookieName)

        const resolvedTheme: TTheme = (config.defaultTheme as TTheme) ?? ORIGAM_THEME_AUTO

        const resolvedMode: TMode = (modeCookie.value === 'light' || modeCookie.value === 'dark')
            ? (modeCookie.value as TMode)
            : (config.defaultMode as TMode) ?? 'light'

        const { setTheme, setMode } = useTheme()
        setTheme(resolvedTheme)
        setMode(resolvedMode)
    }
})
