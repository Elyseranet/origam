import type { IComponentTypeRef } from '~/interfaces/components-catalog.interface'

/**
 * One row in ANY "list of labelled, described things" table across the
 * reference pages (/components, /composables, /directives, /utils,
 * /interfaces, /types, /enums, /consts).
 *
 * Replaces 16 practically-identical interfaces that each spelled the same
 * handful of roles under a different field name — measured before this
 * unification (field lists, comments excluded):
 *
 *   IComponentPropRow        name  type  defaultValue  descriptionKey  descriptionFallback  required?
 *   IComponentEmitRow        event payload             descriptionKey  descriptionFallback
 *   IComponentSlotRow        slot  slotProps            descriptionKey  descriptionFallback
 *   IComponentExposed        name  type                descriptionKey  descriptionFallback
 *   IComponentCssVar         name  defaultValue         descriptionKey  descriptionFallback
 *   (IComponentTokens.excerpt row, never named) tokenPath value type    descriptionKey  descriptionFallback
 *   IComposableParam         name  type  required? defaultValue?  descriptionKey  descriptionFallback
 *   IComposableReturn        name  type                descriptionKey  descriptionFallback
 *   IDirectiveArgRow         name  type  required?       descriptionKey  descriptionFallback
 *   IDirectiveModifierRow    name                        descriptionKey  descriptionFallback
 *   IUtilParam               name  type  required? defaultValue?  descriptionKey  descriptionFallback
 *   IUtilReturn                    type                descriptionKey  descriptionFallback
 *   IInterfacePropRow        name  type  optional default           descriptionFallback (no key!)
 *   ITypeDocValue            value                        descriptionKey  descriptionFallback
 *   IEnumDocValue            value                        descriptionKey  descriptionFallback
 *   IConstValue              value                        descriptionKey  descriptionFallback
 *
 * Every one of those is "a label, an optional type, an optional value, an
 * optional required flag, and a description" — one role spelled 16 ways.
 * See the TODO this interface closes, in `RowList.vue`'s pre-unification
 * history (`items: Array<IComponentPropRow | IComponentEmitRow | …>`).
 */
export interface IReferenceRow {
    /**
     * The row's primary label: prop/param/arg name, event name, slot name,
     * modifier name, exposed member name, CSS variable name, token path, or
     * the literal value of an enum/const/type-union member (those three
     * have no separate name — the value itself IS the label).
     */
    label: string
    /**
     * Structured type reference (chip + optional link to /types/{slug})
     * when the row carries one — props and emit payloads do. A plain
     * display string when the row only carries a type NAME with no
     * resolvable reference (composable/util/directive signatures, exposed
     * members — sourced as plain text). Absent when the row has no type at
     * all (slots, directive modifiers, enum/const/type-union members).
     */
    type?: IComponentTypeRef | string
    /**
     * The row's value: a prop default, a slot-props display signature, a
     * CSS variable default, a token value. Absent when the row has no
     * separate value (emits, exposed members, composable/util returns,
     * directive args/modifiers, enum/const/type-union members).
     */
    value?: string
    /**
     * true = required / non-optional. Set on props, composable/util params
     * and directive args. Absent everywhere else.
     */
    required?: boolean
    /**
     * i18n key for the description. Absent only on rows sourced from the
     * legacy `IInterfacePropRow` shape, which never carried one — those
     * rows render `descriptionFallback` directly, unresolved.
     */
    descriptionKey?: string
    /** English fallback description — always present. */
    descriptionFallback: string
}
