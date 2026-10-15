/*********************************************************
 * TAG_CASE
 *
 * @description
 * How the code generator spells a component tag. Two conventions coexist
 * in this repo (measured on `develop` @ a071c4920): the docs and the
 * snippets marketing SHOWS to a visitor write `<OrigamBtn>`, while every
 * `.vue` template and the owner's `vue-conventions` rule write
 * `<origam-btn>`. Which one the playground emits by default is an open
 * arbitration (#1143), so the choice lives here, behind one option, rather
 * than being baked into the generator.
 ********************************************************/
export enum TAG_CASE {
    /** `<origam-btn>` — the casing a `.vue` template in this repo uses. */
    KEBAB = 'kebab',
    /** `<OrigamBtn>` — the casing the docs and marketing snippets display. */
    PASCAL = 'pascal'
}
