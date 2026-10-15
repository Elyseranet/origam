/*********************************************************
 * TAG_CASE
 *
 * @description
 * How the code generator spells a component tag. Two conventions coexist
 * in this repo (measured on `develop` @ a071c4920): the docs and the
 * snippets marketing SHOWS to a visitor write `<OrigamBtn>`, while every
 * `.vue` template and the owner's `vue-conventions` rule write
 * `<origam-btn>`. The owner settled it on #1143: the generated code is
 * pasted into a `.vue` file, so it follows `vue-conventions` — `KEBAB` is
 * the default. `PASCAL` stays an internal option of the generator only; no
 * UI exposes a toggle for it.
 ********************************************************/
export enum TAG_CASE {
    /** `<origam-btn>` — the casing a `.vue` template in this repo uses. */
    KEBAB = 'kebab',
    /** `<OrigamBtn>` — the casing the docs and marketing snippets display. */
    PASCAL = 'pascal'
}
