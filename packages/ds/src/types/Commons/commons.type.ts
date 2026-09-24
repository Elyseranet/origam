import { ComponentPublicInstance } from 'vue'
import { CLIENT_POSITION, FOCUS_LOCATION } from '../../enums/Commons/commons.enum'
import { IOrigamPluginOptionsObject } from '../../interfaces/Commons/commons.interface'

export type TNotAUnion<T> = [T] extends [infer U] ? _TNotAUnion<U, U> : never
export type _TNotAUnion<T, U> = U extends any ? [T] extends [U] ? unknown : never : never

/*********************************************************
 * TAnyString — `string` qui n'absorbe pas ses litteraux voisins
 *
 * @description
 * A utiliser partout ou une prop accepte un vocabulaire documente ET une
 * chaine arbitraire (extensions de marque, noms de theme maison, cles
 * definies par le consommateur) : `'a' | 'b' | TAnyString`.
 *
 * @description
 * LE PROBLEME. `'a' | 'b' | string` est reduit par le compilateur a `string`
 * tout court, ce qui detruit l'autocompletion de `'a'` / `'b'` — l'union ne
 * se souvient plus qu'ils ont ete nommes. Mesure, `tsc --strict` :
 * @description
 *   type C = 'a' | 'b' | string          const c: C = 42
 *   -> Type 'number' is not assignable to type 'string'.   // effondree
 * @description
 *   type E = 'a' | 'b' | (string & Len)  const e: E = 42
 *   -> Type '42' is not assignable to type 'E'.            // union tenue
 *
 * @description
 * Intersecter `string` avec n'importe quel type objet differe cette
 * reduction : les litteraux survivent et toute chaine reste assignable.
 * @description
 * L'idiome s'ecrit d'ordinaire `string & {}`, mais une intersection avec un
 * type SANS MEMBRE est ailleurs un vrai defaut, et SonarQube la remonte en
 * BUG/CRITICAL (« Remove this type without members or change this type
 * intersection » — #771). `{ readonly length: number }` est le meme tour
 * avec un membre que TOUTE chaine possede deja : comportement identique,
 * plus rien de vide a signaler.
 ********************************************************/
export type TAnyString = string & { readonly length: number }

export type TEventProp<T extends Array<any> = Array<any>, F = (...args: T) => void> = F

export type TInnerVal<T> = T extends Array<any> ? Readonly<T> : T

export type TSelectItemKey<T = Record<string, any>> =
    | boolean | null | undefined // Ignored
    | string // Lookup by key, can use dot notation for nested objects
    | Readonly<Array<(string | number)>> // Nested lookup by key, each array item is a key in the next level
    | ((item: T, fallback?: any) => any)

export type TMaybePick<
    T extends object,
    U extends Extract<keyof T, string>
> = Record<string, unknown> extends T ? Partial<Pick<T, U>> : Pick<T, U>

export type TFocusLocation = `${FOCUS_LOCATION}` | number

export type TTemplateRef = {
    (target: Element | ComponentPublicInstance | null): void
    value: HTMLElement | ComponentPublicInstance | null | undefined
    readonly el: HTMLElement | undefined
}

export type TClientPosition = `${CLIENT_POSITION}`

export type TIfAny<T, Y, N> = 0 extends (1 & T) ? Y : N

export type TWrapInArrayResult<T> = T extends Readonly<Array<any>>
    ? TIfAny<T, Array<T>, T>
    : Array<NonNullable<T>>

export type TValueOf<T> = T[keyof T];

/**
 * Void function
 */
export type TFn = () => void

export type TOrigamPluginOptionsImport =
    | boolean
    | IOrigamPluginOptionsObject
