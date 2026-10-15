import { PROP_COERCION } from '../../enums/Commons/prop-coercion.enum'
import type { TCoercionResult } from '../../types/Commons/prop-control.type'
import type { TPropValue } from '../../types/Commons/prop-value.type'

const ALL_COERCIONS: PROP_COERCION[] = [PROP_COERCION.STRING, PROP_COERCION.NUMBER, PROP_COERCION.BOOLEAN, PROP_COERCION.JSON]

/*********************************************************
 * admittedCoercions
 *
 * @description
 * The kinds a TEXT control may write for a prop, from its runtime type
 * (source A). Only the constructors the descriptor actually names are
 * offered — `['Boolean', 'Number', 'String']` admits all three, `String`
 * admits only text.
 *
 * @description
 * ⛔ `Function` contributes nothing: a function cannot be typed into a field
 * and cannot survive the scene's JSON round-trip (`TPropValue`). A prop whose
 * runtime type is ONLY `Function` therefore admits no coercion at all and the
 * control renders as not editable — writing its text as a string would hand
 * the component a string where it will CALL a function.
 *
 * @description
 * `null` (no runtime type emitted, 9.8 % of props) is the absence of
 * information stated plainly: every kind is offered, STRING first.
 ********************************************************/
export function admittedCoercions (runtimeType: string | string[] | null): PROP_COERCION[] {
    if (runtimeType === null) return [...ALL_COERCIONS]

    const names = (Array.isArray(runtimeType) ? runtimeType : [runtimeType]).filter(Boolean)

    if (names.length === 0) return [...ALL_COERCIONS]

    const admitted: PROP_COERCION[] = []

    if (names.includes('String')) admitted.push(PROP_COERCION.STRING)
    if (names.includes('Number')) admitted.push(PROP_COERCION.NUMBER)
    if (names.includes('Boolean')) admitted.push(PROP_COERCION.BOOLEAN)
    if (names.includes('Object') || names.includes('Array')) admitted.push(PROP_COERCION.JSON)

    return admitted
}

/*********************************************************
 * coerceInput
 *
 * @description
 * Turns the text of a field into a prop value under an EXPLICIT kind. No
 * inference: `"4"` under STRING stays `"4"`. A refusal (`{ ok: false }`)
 * means "do not write", never "write something close".
 ********************************************************/
export function coerceInput (text: string, coercion: PROP_COERCION): TCoercionResult {
    switch (coercion) {
        case PROP_COERCION.STRING:
            return { ok: true, value: text }
        case PROP_COERCION.NUMBER: {
            const trimmed = text.trim()
            const value = Number(trimmed)

            return trimmed !== '' && Number.isFinite(value) ? { ok: true, value } : { ok: false }
        }
        case PROP_COERCION.BOOLEAN: {
            const trimmed = text.trim()

            if (trimmed === 'true') return { ok: true, value: true }
            if (trimmed === 'false') return { ok: true, value: false }

            return { ok: false }
        }
        case PROP_COERCION.JSON:
            try {
                return { ok: true, value: JSON.parse(text) as TPropValue }
            } catch {
                return { ok: false }
            }
    }
}

/*********************************************************
 * coercionOf
 *
 * @description
 * The kind of a value ALREADY in `instance.props` — what a TEXT control
 * re-opens on. Reads the value's JS type; it guesses nothing about text.
 ********************************************************/
export function coercionOf (value: TPropValue): PROP_COERCION {
    if (typeof value === 'number') return PROP_COERCION.NUMBER
    if (typeof value === 'boolean') return PROP_COERCION.BOOLEAN
    if (typeof value === 'string') return PROP_COERCION.STRING

    return PROP_COERCION.JSON
}

/*********************************************************
 * formatPropValue
 *
 * @description
 * A prop value as the text a field shows. A string is shown raw (no quotes,
 * it is what the user typed); everything else as JSON, which is also what
 * the JSON coercion parses back.
 ********************************************************/
export function formatPropValue (value: TPropValue): string {
    if (value === undefined) return ''
    if (typeof value === 'string') return value

    return JSON.stringify(value)
}
