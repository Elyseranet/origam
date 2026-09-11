import { ComponentPublicInstance, computed, inject } from "vue"
import { useRtl } from "../../composables"
import { ORIGAM_GO_TO_KEY } from "../../consts"

import type { IGoToInstance, IGoToOptions, ILocaleInstance, IRtlInstance } from "../../interfaces"

import { genDefaults, mergeDeep, scrollTo } from "../../utils"

/*********************************************************
 * createGoTo
 ********************************************************/
export function createGoTo (
    options: IGoToOptions | undefined,
    locale: ILocaleInstance & IRtlInstance
): IGoToInstance {
    return {
        rtl: locale.isRtl,
        options: mergeDeep(genDefaults(), options as unknown as Record<string, unknown>) as unknown as IGoToOptions
    }
}

/*********************************************************
 * useGoTo
 ********************************************************/
export function useGoTo (_options: Partial<IGoToOptions> = {}) {
    const goToInstance = inject(ORIGAM_GO_TO_KEY)

    const {isRtl} = useRtl()

    if (!goToInstance) throw new Error('[Origam] Could not find injected goto instance')

    const goTo = {
        ...goToInstance,
        rtl: computed(() => goToInstance.rtl.value || isRtl.value)
    }

    async function go (
        target: ComponentPublicInstance | HTMLElement | string | number,
        options?: Partial<IGoToOptions>
    ) {
        return scrollTo(target, mergeDeep(_options, options), false, goTo)
    }

    go.horizontal = async (
        target: ComponentPublicInstance | HTMLElement | string | number,
        options?: Partial<IGoToOptions>
    ) => {
        return scrollTo(target, mergeDeep(_options, options), true, goTo)
    }

    return go
}
