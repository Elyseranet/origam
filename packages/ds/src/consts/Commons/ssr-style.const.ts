import type { InjectionKey } from 'vue'

import type { ISsrStyleCollector } from '../../interfaces/Commons/style.interface'

/*********************************************************
 * ORIGAM_SSR_STYLES_KEY / SSR_STYLE_TAG_PREFIX (#1092)
 *
 * @description
 * Provide/inject key for the per-app collector the server render fills with
 * every `useStyle()` rule. Global symbol, like the other origam keys, so two
 * bundles of the library interoperate. `createOrigam()` provides it ONLY when
 * there is no `document`: on the client `inject()` returns `null` and
 * `useStyle` takes the DOM path.
 *
 * @description
 * Prefix of the `id` of the `<style>` tag a `useStyle()` instance owns,
 * followed by the instance's `useId()` value, so the tag the server renders
 * and the tag the client looks up at mount carry the SAME id.
 ********************************************************/
export const ORIGAM_SSR_STYLES_KEY: InjectionKey<ISsrStyleCollector> = Symbol.for('origam:ssr-styles')

export const SSR_STYLE_TAG_PREFIX = 'origam-style-'
