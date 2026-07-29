import type { ComputedRef, Ref } from "vue"

export interface ILocaleMessages {
    [key: string]: ILocaleMessages | string
}

export interface ILocaleInstance {
    name: string
    messages: ComputedRef<ILocaleMessages>
    current: Ref<string>
    fallback: Ref<string>
    t: (key: string, ...params: unknown[]) => string
    n: (value: number) => string
    provide: (props: ILocaleProps) => ILocaleInstance
}

export interface ILocaleOptions {
    locale?: string
    fallbackLocale: string
    messages: Record<string, unknown>
}

/**
 * Formes STRUCTURELLES de vue-i18n, declarees localement.
 *
 * `vue-i18n` est un peer OPTIONNEL : le DS ne doit pas en dependre, meme au
 * niveau des types. Un `import type` reste inoffensif a l'execution mais fait
 * echouer le type-check d'un projet qui ne l'installe pas (des lors que
 * `skipLibCheck` est a false) — c'est la meme classe de bug que l'import
 * runtime, un cran plus loin.
 *
 * On decrit donc uniquement ce que le DS consomme reellement. Une vraie
 * instance vue-i18n satisfait ces formes structurellement, sans que le DS ait
 * a connaitre le paquet.
 */
export interface IVueI18nGlobalLike {
    locale: any
    fallbackLocale: any
    messages: any
    t: (key: string, ...args: any[]) => string
    n: (value: number, ...args: any[]) => string
}

export interface IVueI18nLike {
    global: IVueI18nGlobalLike
}

export type TUseI18nLike = (options: Record<string, unknown>) => {
    locale: { value: string }
    t: (key: string, ...args: any[]) => string
    n: (value: number, ...args: any[]) => string
}

export interface ILocaleI18n {
    i18n: IVueI18nLike
    useI18n: TUseI18nLike
}

export interface ILocaleProps {
    messages?: ILocaleMessages
    locale?: string
    fallback?: string
    adapter?: ILocaleInstance
}

export interface IRtlOptions {
    rtl?: Record<string, boolean>
}

export interface IRtlInstance {
    isRtl: Ref<boolean>
    rtl: Ref<Record<string, boolean>>
}

export interface IRtlProps {
    rtl?: boolean
}
