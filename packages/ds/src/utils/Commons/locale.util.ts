import { ComputedRef, Ref, watch } from "vue"

import { useVModel } from '../../composables/Commons/vModel.composable'

import type { ILocaleI18n, ILocaleInstance, ILocaleMessages, ILocaleProps, TUseI18nLike } from '../../interfaces/Commons/locale.interface'

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

/*********************************************************
 * useProvided
 *
 * @description
 * Resout une valeur qui peut venir de DEUX sources : la prop du consommateur,
 * qui l'emporte, ou la valeur heritee d'un ancetre. Les deux peuvent changer
 * apres le montage, et les deux doivent etre suivies.
 *
 * @description
 * ⛔ Le troisieme cas — la prop qui REPASSE a nullish — a longtemps rendu la
 * chaine « undefined » a l'ecran. Le watch de `useVModel` recopie fidelement la
 * nouvelle valeur de la prop dans le ref interne, `undefined` compris, et le
 * watch sur `provided` ci-dessous ne se declenche pas : c'est la PROP qui a
 * bouge, pas l'heritage. Un consommateur ecrivant `:locale="choix || undefined"`
 * pour dire « reprends celle du parent » obtenait donc le mot undefined.
 * Mesure dans `TU/composables/Commons/provide-locale-reactivity.spec.ts`.
 *
 * @description
 * L'ordre des deux watchers n'est pas un detail : celui de `useVModel` est
 * enregistre en premier, a la ligne au-dessus, donc il ecrit `undefined` avant
 * que celui-ci ne retablisse l'heritage. Inverser les deux lignes reintroduirait
 * le defaut.
 *
 * @param props    Les props du composant hote.
 * @param prop     Le nom de la prop a resoudre.
 * @param provided La valeur heritee, utilisee quand la prop est absente.
 * @returns Un ref suivant la source active des deux.
 ********************************************************/
export function useProvided<T> (props: any, prop: string, provided: Ref<T>): Ref<T> {
    const internal = useVModel(props, prop)

    internal.value = props[prop] ?? provided.value

    watch(provided, v => {
        if (props[prop] == null) {
            internal.value = v
        }
    })

    watch(() => props[prop], v => {
        if (v == null) {
            internal.value = provided.value
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
 * cle, interpolation positionnelle (`{0}`) et nommee (`{value}`), et les
 * PLURIELS via `Intl.PluralRules` (voir `resolvePlural` plus bas). Il
 * n'ambitionne PAS de remplacer vue-i18n : pas de messages lies, pas de
 * formatage de dates. Un consommateur qui en a besoin passe son propre
 * adaptateur via `createVueI18nAdapter`.
 *
 * @description
 * Une cle qui resout DIRECTEMENT gagne toujours, et la resolution de
 * pluriel n'est tentee qu'apres son echec. C'est ce qui garantit que les
 * appels anterieurs a l'ajout des pluriels gardent exactement leur
 * comportement, qu'ils passent un argument numerique ou non.
 ********************************************************/
function resolveKey (messages: Record<string, unknown>, key: string): string | undefined {
    const value = key.split('.').reduce<unknown>(
        (acc, segment) => (acc && typeof acc === 'object' ? (acc as Record<string, unknown>)[segment] : undefined),
        messages
    )

    return typeof value === 'string' ? value : undefined
}

/**
 * Un parametre d'interpolation est une primitive. Tout le reste — objet,
 * tableau, fonction — rendrait `[object Object]` a l'utilisateur : on rend
 * une chaine vide, comme pour un parametre absent. Une valeur non primitive
 * est une erreur d'appel, elle ne doit pas fuir dans l'interface.
 */
function stringifyParam (raw: unknown): string {
    // Le `typeof` doit rester DANS la condition : le stocker dans une const
    // (`const type = typeof raw`) n'apporte aucun narrowing a TypeScript,
    // `raw` reste `unknown` et `String(raw)` redevient un appel non sur.
    // C'est exactement ce que Sonar signalait.
    if (typeof raw === 'string') return raw
    if (typeof raw === 'number' || typeof raw === 'boolean' || typeof raw === 'bigint') {
        return raw.toString()
    }

    // null, undefined, objet, tableau, fonction, symbole : une valeur non
    // primitive est une erreur d'appel. Elle rend une chaine vide, comme un
    // parametre absent — jamais `[object Object]` a l'ecran.
    return ''
}

/** `t('cle', {value: 1})` — un objet unique = parametres nommes. */
function asNamedParams (params: unknown[]): Record<string, unknown> | undefined {
    if (params.length !== 1) return undefined

    const first = params[0]
    if (first === null || typeof first !== 'object' || Array.isArray(first)) return undefined

    return first as Record<string, unknown>
}

function interpolate (template: string, params: unknown[]): string {
    const named = asNamedParams(params)

    // Clauses de garde plutot qu'un ternaire imbrique : les trois cas
    // (nomme / positionnel / inconnu) sont mutuellement exclusifs et se
    // lisent en sequence.
    const lookup = (token: string): unknown => {
        if (named) return named[token]
        if (/^\d+$/.test(token)) return params[Number(token)]

        return undefined
    }

    return template.replace(/\{([^{}]+)\}/g, (_match, token: string) => {
        return stringifyParam(lookup(token))
    })
}

/*********************************************************
 * resolvePlural — selection de forme par `Intl.PluralRules`
 *
 * @description
 * `t('a.b.desc', 3)` cherche `a.b.desc_<categorie>`, ou la categorie est
 * une categorie CLDR rendue par `Intl.PluralRules(locale).select(n)` :
 * `zero` / `one` / `two` / `few` / `many` / `other`.
 *
 * @description
 * ⛔ La regle du pluriel N'EST PAS codee ici, et ne doit jamais l'etre.
 * `n === 1 ? singulier : pluriel` est la regle ANGLAISE ; le russe coupe
 * a 1 / 2-4 / 5+, le polonais autrement encore, le japonais pas du tout.
 * Le DS est publie sur npm et traduit par des gens dont on ne connait pas
 * la langue : c'est `Intl` qui tranche, natif partout depuis Node 13 et
 * dans tous les navigateurs cibles.
 *
 * @description
 * Le repli sur `_other` est la piece porteuse : `en` et `fr` ne livrent
 * que deux formes pendant qu'un traducteur russe en livre trois, SANS
 * qu'aucun composant ne change. Une locale partiellement traduite rend
 * donc une phrase correcte plutot que la cle brute.
 *
 * @description
 * Le compte est expose sous les DEUX syntaxes d'interpolation deja
 * supportees — `{count}` (nomme, lisible dans le fichier de locale) et
 * `{0}` (positionnel, homogene avec le reste des messages du DS). Les
 * parametres surnumeraires restent atteignables en positionnel :
 * `t('k', 3, 'x')` expose `{0}` = 3 et `{1}` = 'x'.
 *
 * @description
 * Une phrase a plusieurs variables devient illisible en indices pour la
 * personne qui la traduit. Un objet en dernier argument nomme donc les
 * autres variables : `t('k', n, {type, min, max})` rend `{count}`,
 * `{type}`, `{min}` et `{max}`. `count` reste prioritaire et n'est pas
 * surchargeable par cet objet.
 *
 * @description
 * Une etiquette de locale structurellement invalide fait lever un
 * `RangeError` a `Intl` ('!!!', 'ru_full' — le tiret bas n'est pas
 * BCP-47). Une etiquette simplement inconnue mais bien formee, elle,
 * resout normalement. Le repli sur `other` couvre le premier cas : une
 * chaine non traduisible ne doit jamais casser un rendu.
 ********************************************************/
function selectPluralCategory (locale: string, count: number): string {
    try {
        return new Intl.PluralRules(locale).select(count)
    } catch {
        return 'other'
    }
}

function resolvePlural (
    lookup: (candidate: string) => string | undefined,
    key: string,
    locale: string,
    params: unknown[]
): string | undefined {
    const count = params[0]
    if (typeof count !== 'number' || !Number.isFinite(count)) return undefined

    const category = selectPluralCategory(locale, count)
    const template = lookup(`${ key }_${ category }`) ?? lookup(`${ key }_other`)

    if (template === undefined) return undefined

    const named: Record<string, unknown> = {count, 0: count}

    params.forEach((value, index) => {
        if (index > 0) named[String(index)] = value
    })

    const extra = params.length > 1 ? params[params.length - 1] : undefined
    if (extra !== null && typeof extra === 'object' && !Array.isArray(extra)) {
        Object.assign(named, extra as Record<string, unknown>, {count, 0: count})
    }

    return interpolate(template, [named])
}

export function createBuiltinAdapter (data: {
    current: Ref<string>
    fallback: Ref<string>
    messages: ComputedRef<ILocaleMessages>
}): ILocaleInstance {
    const translate = (key: string, ...params: unknown[]): string => {
        if (typeof key !== 'string' || !key) return key as unknown as string

        const all = data.messages.value as unknown as Record<string, Record<string, unknown>>
        const lookup = (candidate: string): string | undefined =>
            resolveKey(all?.[data.current.value] ?? {}, candidate)
            ?? resolveKey(all?.[data.fallback.value] ?? {}, candidate)

        const template = lookup(key)
        if (template !== undefined) {
            return params.length ? interpolate(template, params) : template
        }

        const plural = resolvePlural(lookup, key, data.current.value, params)
        if (plural !== undefined) return plural

        // Cle absente : on rend la cle, jamais une chaine vide — c'est ce qui
        // rend un trou de traduction visible plutot que silencieux.
        return key
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
