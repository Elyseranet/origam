import type { IOrigamOptions } from '../../interfaces/Commons/commons.interface'
import type { IOrigamNuxtRuntimeConfig } from '../../interfaces/Commons/nuxt-module.interface'

/*********************************************************
 * nuxtIconsOptions
 *
 * @description
 * The `createOrigam()` options derived from the module's `icons` setting (#1228). Shared by both Nuxt plugins so SSR and hydration use the SAME aliases.
 * @description
 * Returns `{}` when no icons are configured, so `createIcons()` keeps its defaults.
 ********************************************************/
export function nuxtIconsOptions (config: Pick<IOrigamNuxtRuntimeConfig, 'icons'>): Pick<IOrigamOptions, 'icons'> {
    return config.icons ? { icons: config.icons } : {}
}
