import { computed, inject, reactive, shallowRef, toRefs, watchEffect } from 'vue'
import { IN_BROWSER } from '../../consts/Commons/commons.const'
import { ORIGAM_DISPLAY_KEY } from '../../consts/Commons/display.const'

import type { IDisplayInstance, IDisplayOptions, IDisplayProps } from '../../interfaces/Commons/display.interface'
import type { TSSROptions } from '../../types/Commons/display.type'

import { getClientHeight, getClientWidth, getPlatform, parseDisplayOptions } from '../../utils/Commons/display.util'
import { getCurrentInstanceName } from '../../utils/Commons/getCurrentInstance.util'

/*********************************************************
 * useDisplay
 *
 * @description
 * Cote composant : lit l'instance de display globale (injectee sous
 * `ORIGAM_DISPLAY_KEY`, creee par `createDisplay()`) et y superpose un
 * `mobile`/`displayClasses` propre au composant quand `props.mobileBreakpoint`
 * derode le seuil global — sinon retombe sur `display.mobile` partage.
 *
 * @description
 * Leve si aucune instance n'est injectee : signe que l'app n'a pas ete
 * initialisee via `createOrigam()`, meme logique de garde que `useDate()`.
 * `displayClasses` ne produit une entree que si `name` est fourni (par
 * defaut le nom kebab-case du composant courant).
 ********************************************************/
export function useDisplay (
    props: IDisplayProps = {},
    name = getCurrentInstanceName()
) {
    const display = inject(ORIGAM_DISPLAY_KEY)

    if (!display) throw new Error('Could not find Origam display injection')

    const mobile = computed(() => {
        if (!props.mobileBreakpoint) return display.mobile.value

        const breakpointValue = typeof props.mobileBreakpoint === 'number'
            ? props.mobileBreakpoint
            : display.thresholds.value[props.mobileBreakpoint]

        return display.width.value < breakpointValue
    })

    const displayClasses = computed(() => {
        if (!name) return {}

        return {[`${name}--mobile`]: mobile.value}
    })

    return {...display, displayClasses, mobile}
}

/*********************************************************
 * createDisplay
 *
 * @description
 * Fabrique installee par `createOrigam()` : suit `window.innerWidth/Height`
 * (via un listener `resize` passif) et derive dans un `reactive` unique
 * l'ensemble des breakpoints (`xs`..`xxl`, `smAndUp`, `mdAndDown`…), la
 * plateforme (`getPlatform`) et le flag `mobile` selon
 * `options.mobileBreakpoint`. Une seule instance est creee au niveau app ;
 * `useDisplay()` la lit plutot que d'en recreer une par composant.
 *
 * @description
 * Cote SSR, `height`/`width` sont seedes depuis `ssr` (dimensions
 * supposees du client) plutot que `window`, et le listener `resize` n'est
 * jamais attache (`IN_BROWSER` garde) — l'instance retournee porte
 * `ssr: true` pour que l'appelant sache que ces valeurs sont une
 * approximation tant que l'hydratation n'a pas tourne.
 ********************************************************/
export function createDisplay (options?: IDisplayOptions, ssr?: TSSROptions): IDisplayInstance {
    const {thresholds, mobileBreakpoint} = parseDisplayOptions(options)

    const height = shallowRef(getClientHeight(ssr))
    const platform = shallowRef(getPlatform(ssr))
    const state = reactive({} as IDisplayInstance)
    const width = shallowRef(getClientWidth(ssr))

    function updateSize () {
        height.value = getClientHeight()
        width.value = getClientWidth()
    }

    function update () {
        updateSize()
        platform.value = getPlatform()
    }


    watchEffect(() => {
        const xs = width.value < thresholds.sm
        const sm = width.value < thresholds.md && !xs
        const md = width.value < thresholds.lg && !(sm || xs)
        const lg = width.value < thresholds.xl && !(md || sm || xs)
        const xl = width.value < thresholds.xxl && !(lg || md || sm || xs)
        const xxl = width.value >= thresholds.xxl
        const name =
            xs ? 'xs'
                : sm ? 'sm'
                    : md ? 'md'
                        : lg ? 'lg'
                            : xl ? 'xl'
                                : 'xxl'
        const breakpointValue = typeof mobileBreakpoint === 'number' ? mobileBreakpoint : thresholds[mobileBreakpoint]
        const mobile = width.value < breakpointValue

        state.xs = xs
        state.sm = sm
        state.md = md
        state.lg = lg
        state.xl = xl
        state.xxl = xxl
        state.smAndUp = !xs
        state.mdAndUp = !(xs || sm)
        state.lgAndUp = !(xs || sm || md)
        state.xlAndUp = !(xs || sm || md || lg)
        state.smAndDown = !(md || lg || xl || xxl)
        state.mdAndDown = !(lg || xl || xxl)
        state.lgAndDown = !(xl || xxl)
        state.xlAndDown = !xxl
        state.name = name
        state.height = height.value
        state.width = width.value
        state.mobile = mobile
        state.mobileBreakpoint = mobileBreakpoint
        state.platform = platform.value
        state.thresholds = thresholds
    })

    if (IN_BROWSER) {
        window.addEventListener('resize', updateSize, {passive: true})
    }

    return {...toRefs(state), update, ssr: !!ssr}
}
