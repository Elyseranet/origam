import { ComponentObjectPropsOptions, Prop, PropType } from 'vue'
import type { TIfAny } from '../../types'

export type TPartialKeys<T> = { [P in keyof T]?: unknown }

export type TAppendDefault<T extends ComponentObjectPropsOptions, D extends TPartialKeys<T>> = {
    [P in keyof T]-?: unknown extends D[P]
        ? T[P]
        : T[P] extends Record<string, unknown>
            ? Omit<T[P], 'type' | 'default'> & {
            type: PropType<TMergeDefault<T[P], D[P]>>
            default: TMergeDefault<T[P], D[P]>
        }
            : {
                type: PropType<TMergeDefault<T[P], D[P]>>
                default: TMergeDefault<T[P], D[P]>
            }
}

export type TMergeDefault<T, D> = unknown extends D ? TInferPropType<T> : (NonNullable<TInferPropType<T>> | D)

export type TInferPropType<T> = [T] extends [null]
    ? any // null & true would fail to infer
    : [T] extends [{ type: null | true }]
        // As TS issue https://github.com/Microsoft/TypeScript/issues/14829
        // somehow `ObjectConstructor` when inferred from { (): T } becomes `any`
        // `BooleanConstructor` when inferred from PropConstructor(with PropMethod) becomes `Boolean`
        ? any
        : [T] extends [ObjectConstructor | { type: ObjectConstructor }]
            ? Record<string, any>
            : [T] extends [BooleanConstructor | { type: BooleanConstructor }]
                ? boolean
                : [T] extends [DateConstructor | { type: DateConstructor }]
                    ? Date
                    : [T] extends [Array<(infer U)> | { type: Array<(infer U)> }]
                        ? U extends DateConstructor
                            ? Date | TInferPropType<U>
                            : TInferPropType<U>
                        : [T] extends [Prop<infer V, infer D>]
                            ? unknown extends V
                                ? TIfAny<V, V, D>
                                : V
                            : T
