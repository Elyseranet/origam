import type { ExtractPropTypes, StyleValue } from 'vue'
import type * as Components from "../../components"
import type * as Directives from "../../directives"
import type { IDateOptions } from './date.interface'
import type { IDisplayOptions } from './display.interface'
import type { IGoToOptions } from './goTo.interface'
import type {
    ILocaleOptions,
    IRtlOptions
} from './locale.interface'
import type { IOrigamTheme } from './theme.interface'

import { TIconOptions } from '../../types/Icon/icon.type'
import { TOrigamPluginOptionsImport } from '../../types/Commons/commons.type'
import { TSSROptions } from '../../types/Commons/display.type'

/**
 * Runtime text-contrast guard config (consumed by the `v-contrast` directive).
 * `enabled` toggles the whole feature; `threshold` is the minimum acceptable
 * WCAG contrast ratio (default 4.5:1 — AA for normal text).
 */
export interface IContrastOptions {
    enabled?: boolean
    threshold?: number
}

export interface IOrigamOptions {
    aliases?: any
    blueprint?: IBlueprint
    components?: any
    directives?: any
    icons?: TIconOptions
    display?: IDisplayOptions
    ssr?: TSSROptions
    goTo?: IGoToOptions
    date?: IDateOptions
    locale?: ILocaleOptions & IRtlOptions
    /**
     * Runtime text-contrast guard. `true` (default) enables the WCAG check
     * that auto-corrects illegible text colours and warns; `false` disables
     * it. Pass an object to tune the threshold.
     */
    contrast?: boolean | IContrastOptions
    /**
     * Optional runtime theme. When supplied, `createOrigam` resolves it to a
     * block of `--origam-*` CSS variables and injects it into `<head>` at
     * install time (browser only — SSR-safe no-op on the server). Accepts a
     * pre-resolved var map and/or a DTCG-shaped token tree; see `IOrigamTheme`.
     */
    theme?: IOrigamTheme

    /**
     * Optional list of runtime themes installed together (the consumer install
     * path — see ADR-003). Each object is injected as its own name×mode scoped
     * `--origam-*` block via the same machinery as `theme`. The distinct brand
     * names are exposed through `useInstalledThemes()` so a switcher can derive
     * its list from the install rather than a hard-coded const.
     *
     * `theme` (singular) and `themes` (plural) may both be supplied; all are
     * injected. SSR-safe (injection is a no-op without `document`).
     */
    themes?: IOrigamTheme[]
}

export interface IOrigamPluginOptions {
    autoImport?: TOrigamPluginOptionsImport
}

export interface IOrigamPluginOptionsObject {
    ignore?: (keyof typeof Components | keyof typeof Directives)[]
}

export interface IBlueprint extends Omit<IOrigamOptions, 'blueprint'> {
}

export interface ICommonsComponentProps {
    id?: string,
    class?: string | Array<string> | object,
    style?: string | Array<string> | object | StyleValue
}

/** Default v-model emit shape shared by every input-style component. */
export interface ICommonsComponentEmits {
    (e: 'update:modelValue', event: any): void
}

/** Generic `click` emit — bubbles the native MouseEvent. */
export interface IClickEmits {
    (e: 'click', event: MouseEvent): void
}

/** `click:close` emit — surface for dismissable surfaces (Alert, Snackbar, …). */
export interface IClickCloseEmits {
    (e: 'click:close', event: MouseEvent): void
}

/** `click:label` emit — fires when the user clicks the associated <label>
 *  rather than the input chrome itself. Used by selection controls. */
export interface IClickLabelEmits {
    (e: 'click:label', event: MouseEvent): void
}

/** `update:indeterminate` emit — companion to `update:modelValue` for
 *  three-state controls (Switch, Checkbox, …). */
export interface IIndeterminateEmits {
    (e: 'update:indeterminate', value: boolean): void
}

/** Default slot signature shared by container components. */
export interface ICommonsComponentSlots {
    default?: () => any
}

export interface ITagProps {
    tag?: string
}

export interface ISample {
    t: number
    d: number
}

export interface IIntersectionObserverInit {
    root?: Element | Document | null;
    rootMargin?: string;
    threshold?: number | Array<number>;
}

export interface IFilterPropsOptions<PropsOptions extends {
    [key: string]: any
}, Props = ExtractPropTypes<PropsOptions>> {
    props: PropsOptions

    filterProps<
        T extends Partial<Props>,
        U extends Extract<keyof T, string>
    > (properties: T, excludes?: string[]): Partial<Pick<T, U>>
}

export interface IConfigurableDocument {
    document?: Document
}

/**
 * The extra surface Nuxt puts on a Vue `App` instance.
 *
 * Nuxt attaches `$nuxt` to the app at runtime, but the type augmentation
 * that declares it ships with Nuxt's own types. The library must not depend
 * on them: it is framework-agnostic and type-checks standalone, so
 * `app.$nuxt` resolves to `Property '$nuxt' does not exist on type
 * 'App<any>'` in CI even though the property really is there under Nuxt.
 *
 * Intersecting `App` with this interface keeps the runtime guard honest —
 * `$nuxt` stays optional, so the `else` branch remains reachable and
 * type-checked — without pulling `@nuxt/schema` into the type graph.
 */
export interface INuxtAwareApp {
    $nuxt?: {
        hook: (name: string, callback: () => void) => void
    }
}
