import { computed, inject, ref } from 'vue'
import { LOCALE_RTL_DEFAULT, ORIGAM_LOCALE_KEY } from '../../consts'
import type { ILocaleInstance, IRtlInstance, IRtlOptions, IRtlProps } from '../../interfaces'
import { getCurrentInstanceName } from '../../utils'

/*********************************************************
 * createRtl
 *
 * @description
 * Builds a fresh RTL state (locale → boolean map + derived `isRtl`)
 * for a given locale instance. Called by `createLocale`
 * (locale.composable.ts) when the consumer doesn't supply their own
 * adapter — kept in this file since `useRtl` / `provideRtl` are its
 * direct siblings on the same RTL contract.
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
 *
 * @description
 * Reads the injected locale's RTL state and derives a `--is-rtl` /
 * `--is-ltr` class name for the calling component.
 * Independent from `useLocale` at the call level (both inject
 * `ORIGAM_LOCALE_KEY` separately) — kept in its own file since it is
 * conceptually the RTL half of the locale system, not the locale
 * resolution itself.
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
 *
 * @description
 * Derives a subtree's RTL state from a prop override (`props.rtl`)
 * falling back to the parent locale's RTL map. Called by
 * `provideLocale` (locale.composable.ts) — kept in this file since
 * `useRtl` / `createRtl` are its direct siblings on the same RTL
 * contract.
 ********************************************************/
export function provideRtl (locale: ILocaleInstance, rtl: IRtlInstance['rtl'], props: IRtlProps): IRtlInstance {
    const isRtl = computed(() => props.rtl ?? rtl.value[locale.current.value] ?? false)

    return {
        isRtl,
        rtl
    }
}
