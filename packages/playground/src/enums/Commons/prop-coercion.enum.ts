/*********************************************************
 * PROP_COERCION
 *
 * @description
 * How the text of a `CONTROL_KIND.TEXT` field is turned into the value
 * written in `instance.props`. Chosen by the USER, never guessed.
 *
 * @description
 * ⛔ Why the choice is explicit. A TEXT control is mostly reached by props
 * whose runtime type is `['Boolean', 'Number', 'String']` — the SFC
 * compiler's "could not narrow" shape (4 653 props). For those, the same
 * characters mean different things depending on their JS type: on `padding`,
 * `16` is `16px` while `"4"` is the `--origam-space---4` design rung
 * (`IPaddingProps` JSDoc). Silently turning `"4"` into `4` because it looks
 * numeric would change what the component renders behind the user's back.
 * So the field writes a STRING unless the user picks another kind, and only
 * the kinds the runtime type admits are offered.
 ********************************************************/
export enum PROP_COERCION {
    /** The text, as typed. */
    STRING = 'string',
    /** `Number(text)` — refused when the text is not a finite number. */
    NUMBER = 'number',
    /** `true` / `false` only — anything else is refused. */
    BOOLEAN = 'boolean',
    /** `JSON.parse(text)` — refused when the text is not valid JSON. */
    JSON = 'json'
}
