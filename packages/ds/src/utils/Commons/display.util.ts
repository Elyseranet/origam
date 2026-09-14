import { IN_BROWSER, SUPPORTS_TOUCH } from '../../consts/Commons/commons.const'
import { DEFAULT_DISPLAY_OPTIONS } from '../../consts/Commons/display.const'

import type { IDisplayOptions, IDisplayPlatform, IInternalDisplayOptions } from '../../interfaces/Commons/display.interface'

import type { TSSROptions } from '../../types/Commons/display.type'

import { mergeDeep } from './commons.util'

/**
 * Parse display options.
 *
 * @param options …
 * @returns …
 */
export function parseDisplayOptions (options: IDisplayOptions = DEFAULT_DISPLAY_OPTIONS): IInternalDisplayOptions {
    return mergeDeep(
        DEFAULT_DISPLAY_OPTIONS as Record<string, unknown>,
        options as Record<string, unknown>
    ) as unknown as IInternalDisplayOptions
}

/**
 * Get client width.
 *
 * @param ssr …
 */
export function getClientWidth (ssr?: TSSROptions) {
    return IN_BROWSER && !ssr
        ? window.innerWidth
        : (typeof ssr === 'object' && ssr.clientWidth) || 0
}

/**
 * Get client height.
 *
 * @param ssr …
 */
export function getClientHeight (ssr?: TSSROptions) {
    return IN_BROWSER && !ssr
        ? window.innerHeight
        : (typeof ssr === 'object' && ssr.clientHeight) || 0
}

/**
 * Get platform.
 *
 * @param ssr …
 * @returns …
 */
export function getPlatform (ssr?: TSSROptions): IDisplayPlatform {
    const userAgent = IN_BROWSER && !ssr
        ? window.navigator.userAgent
        : 'ssr'

    const match = (regexp: RegExp) => {
        return Boolean(userAgent.match(regexp))
    }

    const android = match(/android/i)
    const ios = match(/iphone|ipad|ipod/i)
    const cordova = match(/cordova/i)
    const electron = match(/electron/i)
    const chrome = match(/chrome/i)
    const edge = match(/edge/i)
    const firefox = match(/firefox/i)
    const opera = match(/opera/i)
    const win = match(/win/i)
    const mac = match(/mac/i)
    const linux = match(/linux/i)

    return {
        android,
        ios,
        cordova,
        electron,
        chrome,
        edge,
        firefox,
        opera,
        win,
        mac,
        linux,
        touch: SUPPORTS_TOUCH,
        ssr: userAgent === 'ssr'
    }
}
