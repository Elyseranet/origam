import { computed, inject, provide, ref } from 'vue'
import * as origamMessages from '../../assets/locales'
import { ORIGAM_LOCALE_KEY } from '../../consts/Commons/locale.const'
import type { ILocaleInstance, ILocaleMessages, ILocaleOptions, ILocaleProps, IRtlOptions, IRtlProps } from '../../interfaces/Commons/locale.interface'
import { mergeDeep } from '../../utils/Commons/commons.util'
import { createBuiltinAdapter } from '../../utils/Commons/locale.util'
import { createRtl, provideRtl } from './rtl.composable'

/*********************************************************
 * createLocale
 *
 * @description
 * Plugin-side factory used by `createOrigam()` to seed the root
 * locale instance (i18n adapter + RTL state) from the host app's
 * options. Delegates the RTL half to `createRtl` (own file) rather
 * than duplicating it.
 ********************************************************/
export function createLocale (options?: ILocaleOptions & IRtlOptions) {
    const merged = mergeDeep({
        locale: 'en',
        fallbackLocale: 'en',
        messages: JSON.parse(JSON.stringify(origamMessages)) // Fix problems with json file imported
    }, options as unknown as Record<string, unknown>) as Record<string, unknown>

    // `vue-i18n` est un peer OPTIONNEL : le chemin par defaut ne doit jamais
    // l'importer. Un consommateur qui veut vue-i18n passe son propre
    // adaptateur, construit avec `createVueI18nAdapter({i18n, useI18n})` —
    // c'est lui qui possede la dependance, pas le DS.
    const locale = (options as ILocaleOptions & { adapter?: ILocaleInstance })?.adapter
        ?? createBuiltinAdapter({
            current: ref(merged.locale as string),
            fallback: ref(merged.fallbackLocale as string),
            messages: computed(() => merged.messages as ILocaleMessages)
        })

    const rtl = createRtl(locale, options)

    return {...locale, ...rtl}
}

/*********************************************************
 * useLocale
 *
 * @description
 * Reads the injected locale instance (i18n adapter + RTL state).
 * Independent from `useRtl` at the call level (both inject
 * `ORIGAM_LOCALE_KEY` separately) — kept in its own file since it is
 * conceptually the locale-resolution half of the system, not RTL.
 ********************************************************/
export function useLocale () {
    const locale = inject(ORIGAM_LOCALE_KEY)

    if (!locale) throw new Error('[Origam] Could not find injected locale instance')

    return locale
}

/*********************************************************
 * provideLocale
 *
 * @description
 * Provider-side hook: derives a subtree's locale + RTL state from
 * props, overriding the parent injection. Delegates the RTL half to
 * `provideRtl` (own file) rather than duplicating it.
 ********************************************************/
export function provideLocale (props: ILocaleProps & IRtlProps) {
    const locale = inject(ORIGAM_LOCALE_KEY)

    if (!locale) throw new Error('[Origam] Could not find injected locale instance')

    const i18n = locale.provide(props)
    const rtl = provideRtl(i18n, locale.rtl, props)

    const data = {...i18n, ...rtl}

    provide(ORIGAM_LOCALE_KEY, data)

    return data
}
