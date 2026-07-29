import { ComputedRef, Ref, watch } from "vue"

import { useVModel } from "../../composables"

import type { ILocaleI18n, ILocaleInstance, ILocaleMessages, ILocaleProps, TUseI18nLike } from "../../interfaces"

// vue-i18n's translate-args parser is strict — it throws
// `SyntaxError: Invalid arguments` when:
//   • the key is not a string, OR
//   • a value in the list is `undefined`/null, OR
//   • the list itself is the wrong shape for the resolved overload.
// The simplest path that works across all overloads:
//   • drop the second arg entirely when there are no extra params
//   • coerce nullish values inside the list to empty string
// so a half-bound template renders as `Rating 3 of ` instead of
// taking down the whole tree.
function callI18nT (
    fn: (key: string, list?: unknown[]) => string,
    key: string,
    params: unknown[]
): string {
    if (typeof key !== 'string' || !key) return key as unknown as string
    if (!params.length) return fn(key)
    const list = params.map(p => p == null ? '' : p)
    return fn(key, list)
}

/**
 * Create vue i 18 n adapter.
 *
 * @param options …
 * @returns …
 */
export function createVueI18nAdapter ({i18n, useI18n}: ILocaleI18n): ILocaleInstance {
    const current = i18n.global.locale
    const fallback = i18n.global.fallbackLocale as Ref<string>
    const messages = i18n.global.messages as ComputedRef<ILocaleMessages>

    return {
        name: 'vue-i18n',
        current,
        fallback,
        messages,
        t: (key: string, ...params: unknown[]) => callI18nT(i18n.global.t.bind(i18n.global) as any, key, params),
        n: i18n.global.n,
        provide: createProvideFunction({current, fallback, messages, useI18n})
    }
}

/**
 * Create provide function.
 *
 * @param data …
 */
export function createProvideFunction (data: {
    current: Ref<string>
    fallback: Ref<string>
    messages: ComputedRef<ILocaleMessages>
    useI18n: TUseI18nLike
}) {
    return (props: ILocaleProps): ILocaleInstance => {
        const current = useProvided(props, 'locale', data.current)
        const fallback = useProvided(props, 'fallback', data.fallback)
        const messages = useProvided(props, 'messages', data.messages) as ComputedRef<ILocaleMessages>

        const i18n = data.useI18n({
            locale: current.value,
            fallbackLocale: fallback.value,
            messages: messages.value as unknown as Record<string, any>,
            useScope: 'local',
            legacy: false,
            inheritLocale: false
        })

        watch(current, v => {
            i18n.locale.value = v
        })

        return {
            name: 'vue-i18n',
            current,
            fallback,
            messages,
            t: (key: string, ...params: unknown[]) => callI18nT(i18n.t.bind(i18n) as any, key, params),
            n: i18n.n,
            provide: createProvideFunction({current, fallback, messages, useI18n: data.useI18n})
        }
    }
}

/**
 * Use provided.
 *
 * @param props    …
 * @param prop     …
 * @param provided …
 * @returns …
 */
export function useProvided<T> (props: any, prop: string, provided: Ref<T>): Ref<T> {
    const internal = useVModel(props, prop)

    internal.value = props[prop] ?? provided.value

    watch(provided, v => {
        if (props[prop] == null) {
            internal.value = v
        }
    })

    return internal
}

/*********************************************************
 * createBuiltinAdapter — adaptateur i18n natif, SANS vue-i18n
 *
 * `vue-i18n` est declare peer OPTIONNEL. Il ne doit donc jamais etre
 * importe statiquement par le chemin par defaut : un projet qui ne
 * l'installe pas ne peut meme pas appeler `createOrigam()`.
 *
 * Cet adaptateur couvre ce dont le DS a besoin pour ses propres chaines :
 * resolution d'une cle pointee, repli sur la locale de secours puis sur la
 * cle, interpolation positionnelle (`{0}`) et nommee (`{value}`) — les deux
 * seules formes presentes dans assets/locales. Il n'ambitionne PAS de
 * remplacer vue-i18n : pas de pluriels, pas de messages lies, pas de
 * formatage de dates. Un consommateur qui en a besoin passe son propre
 * adaptateur via `createVueI18nAdapter`.
 ********************************************************/
function resolveKey (messages: Record<string, unknown>, key: string): string | undefined {
    const value = key.split('.').reduce<unknown>(
        (acc, segment) => (acc && typeof acc === 'object' ? (acc as Record<string, unknown>)[segment] : undefined),
        messages
    )

    return typeof value === 'string' ? value : undefined
}

function interpolate (template: string, params: unknown[]): string {
    const named = params.length === 1 && params[0] !== null && typeof params[0] === 'object' && !Array.isArray(params[0])
        ? params[0] as Record<string, unknown>
        : undefined

    return template.replace(/\{([^{}]+)\}/g, (_match, token: string) => {
        const raw = named
            ? named[token]
            : (/^\d+$/.test(token) ? params[Number(token)] : undefined)

        return raw == null ? '' : String(raw)
    })
}

export function createBuiltinAdapter (data: {
    current: Ref<string>
    fallback: Ref<string>
    messages: ComputedRef<ILocaleMessages>
}): ILocaleInstance {
    const translate = (key: string, ...params: unknown[]): string => {
        if (typeof key !== 'string' || !key) return key as unknown as string

        const all = data.messages.value as unknown as Record<string, Record<string, unknown>>
        const template = resolveKey(all?.[data.current.value] ?? {}, key)
            ?? resolveKey(all?.[data.fallback.value] ?? {}, key)

        // Cle absente : on rend la cle, jamais une chaine vide — c'est ce qui
        // rend un trou de traduction visible plutot que silencieux.
        if (template === undefined) return key

        return params.length ? interpolate(template, params) : template
    }

    return {
        name: 'origam-builtin',
        current: data.current,
        fallback: data.fallback,
        messages: data.messages,
        t: translate,
        n: (value: number) => new Intl.NumberFormat(data.current.value).format(value),
        provide: (props: ILocaleProps): ILocaleInstance => {
            const current = useProvided(props, 'locale', data.current)
            const fallback = useProvided(props, 'fallback', data.fallback)
            const messages = useProvided(props, 'messages', data.messages) as ComputedRef<ILocaleMessages>

            return createBuiltinAdapter({current, fallback, messages})
        }
    }
}
