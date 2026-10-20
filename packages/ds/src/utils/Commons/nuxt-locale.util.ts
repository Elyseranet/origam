import type { IOrigamOptions } from '../../interfaces/Commons/commons.interface'
import type { IOrigamNuxtRuntimeConfig } from '../../interfaces/Commons/nuxt-module.interface'

/*********************************************************
 * nuxtLocaleOptions
 *
 * @description
 * The `createOrigam()` options derived from the module's `locale` setting (#1181).
 * Shared by `plugin.client.ts` and `plugin.server.ts` so both feed `createOrigam`
 * the SAME locale — a difference would render different built-in strings on the
 * server and during hydration.
 * @description
 * Returns `{}` when no locale is configured, so `createLocale()` keeps its own
 * defaults (`en`, fallback `en`, built-in `en` / `fr` messages).
 ********************************************************/
export function nuxtLocaleOptions (config: Pick<IOrigamNuxtRuntimeConfig, 'locale'>): Pick<IOrigamOptions, 'locale'> {
    return config.locale ? { locale: config.locale } : {}
}
