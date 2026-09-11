import { computed, inject, provide, ref } from "vue"
import * as origamMessages from "../../assets/locales"

import { LOCALE_RTL_DEFAULT, ORIGAM_LOCALE_KEY } from "../../consts"

import type {
    ILocaleInstance,
    ILocaleOptions,
    ILocaleProps,
    IRtlInstance,
    IRtlOptions,
    IRtlProps,
    ILocaleMessages
} from "../../interfaces"

import { createBuiltinAdapter, getCurrentInstanceName, mergeDeep } from "../../utils"

/*********************************************************
 * createLocale
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
 ********************************************************/
export function useLocale () {
    const locale = inject(ORIGAM_LOCALE_KEY)

    if (!locale) throw new Error('[Origam] Could not find injected locale instance')

    return locale
}

/*********************************************************
 * provideLocale
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

/*********************************************************
 * createRtl
 ********************************************************/
export function createRtl (i18n: ILocaleInstance, options?: IRtlOptions): IRtlInstance {
    const rtl = ref<Record<string, boolean>>(options?.rtl ?? LOCALE_RTL_DEFAULT)
    const isRtl = computed(() => rtl.value[i18n.current.value] ?? false)

    return {
        isRtl,
        rtl
    }
}

/*********************************************************
 * useRtl
 ********************************************************/
export function useRtl (name = getCurrentInstanceName()) {
    const locale = inject(ORIGAM_LOCALE_KEY)

    if (!locale) throw new Error('[Origam] Could not find injected rtl instance')

    const rtlClasses = computed(() => {
        return `${name}--is-${locale.isRtl.value ? 'rtl' : 'ltr'}`
    })

    return {isRtl: locale.isRtl, rtlClasses}
}

/*********************************************************
 * provideRtl
 ********************************************************/
export function provideRtl (locale: ILocaleInstance, rtl: IRtlInstance['rtl'], props: IRtlProps): IRtlInstance {
    const isRtl = computed(() => props.rtl ?? rtl.value[locale.current.value] ?? false)

    return {
        isRtl,
        rtl
    }
}

