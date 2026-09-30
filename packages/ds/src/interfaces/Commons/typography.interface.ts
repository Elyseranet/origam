import type { TFontFamily } from '../../types/Commons/font-family.type'
import type { TFontSize } from '../../types/Commons/font-size.type'
import type { TFontWeight } from '../../types/Commons/font-weight.type'
import type { TLetterSpacing } from '../../types/Commons/letter-spacing.type'
import type { TLineHeight } from '../../types/Commons/line-height.type'

/**
 * Cross-cutting typography surface — the font equivalent of
 * `IColorProps` / `IBorderProps` / `IMarginProps`. Every prop is optional
 * and resolves to the matching component CSS variable via `useTypography`.
 * When a prop is unset the component keeps its theme value (no override
 * emitted).
 *
 * The first FIVE props are primitive font token KEYS, wrapped into
 * `var(--origam-font__{group}---{value})`. `fontStyle` is the one
 * PASSTHROUGH: a CSS keyword emitted verbatim, because `font-style` has no
 * design scale — see its own note below.
 *
 * | Prop            | CSS property      | Primitive token group        |
 * |-----------------|-------------------|------------------------------|
 * | `fontFamily`    | `font-family`     | `--origam-font__family---*`        |
 * | `fontSize`      | `font-size`       | `--origam-font__size---*`          |
 * | `fontWeight`    | `font-weight`     | `--origam-font__weight---*`        |
 * | `lineHeight`    | `line-height`     | `--origam-font__lineHeight---*`    |
 * | `letterSpacing` | `letter-spacing`  | `--origam-font__letterSpacing---*` |
 * | `fontStyle`     | `font-style`      | *none — passthrough, see below*    |
 *
 * Collision-free names by design: `fontSize` / `fontWeight` / `fontFamily`
 * (not `size` / `weight` / `family`) so the surface composes with
 * `ISizeProps.size` on Btn / Chip / Avatar / Kbd without clashing.
 */
export interface ITypographyProps {
    /**
     * Font family token. Maps to `--origam-font__family---{fontFamily}`
     * (sans · mono · serif).
     * When unset, the component keeps its theme font-family.
     */
    fontFamily?: TFontFamily
    /**
     * Font size token. Maps to `--origam-font__size---{fontSize}`
     * (xs · sm · md · lg · xl · 2xl · 3xl · 4xl · 5xl).
     * When unset, the component keeps its theme / density font-size.
     */
    fontSize?: TFontSize
    /**
     * Font weight token. Maps to `--origam-font__weight---{fontWeight}`
     * (regular 400 · medium 500 · semibold 600 · bold 700 · extrabold 800 · black 900).
     * When unset, the component keeps its theme font-weight.
     */
    fontWeight?: TFontWeight
    /**
     * Line-height token. Maps to `--origam-font__lineHeight---{lineHeight}`
     * (none 1 · tight 1.25 · snug 1.375 · normal 1.5 · relaxed 1.625 · loose 2).
     * When unset, the component keeps its theme line-height.
     */
    lineHeight?: TLineHeight
    /**
     * Letter-spacing token. Maps to `--origam-font__letterSpacing---{letterSpacing}`
     * (tight -0.025em · normal 0em · wide 0.0094em · wider 0.0125em · widest 0.0893em).
     * When unset, the component keeps its theme letter-spacing.
     */
    letterSpacing?: TLetterSpacing
    /*********************************************************
     * fontStyle
     *
     * @description
     * Style de fonte, emis LITTERALEMENT dans
     * `--origam-{prefix}---font-style`. Seul membre PASSTHROUGH de cette
     * interface : les cinq autres props sont des cles de token que
     * `useTypography` enveloppe en `var(--origam-font__{groupe}---{valeur})`.
     *
     * @description
     * ⛔ POURQUOI PAS UN TOKEN. `italic` / `normal` / `oblique` sont des
     * MOTS-CLES CSS, pas les echelons d'une echelle de design : il n'existe
     * aucun groupe `--origam-font__style---*` dans `primitive.css` (verifie,
     * zero occurrence) et il n'en faut pas. Enveloppee, la valeur sortirait
     * en `var(--origam-font__style---italic)`, un nom que nulle feuille ne
     * declare — donc rien ne peindrait.
     *
     * @description
     * Type `string` volontairement large, par coherence avec
     * `IBorderProps.borderStyle` / `borderColor`, les deux autres
     * passthrough de mot-cle CSS des interfaces Commons. Laisse passer
     * `oblique 10deg`, qu'une union fermee rejetterait.
     *
     * @description
     * ⚠️ N'a d'EFFET que si la SCSS du composant lit le var GENERIQUE
     * `--origam-{prefix}---font-style`. Mesure a l'ajout : un seul composant
     * le fait — `OrigamBlockquote`
     * (`--origam-blockquote---resolved-font-style` retombe dessus).
     * @description
     * ⛔ `OrigamBracketCompetitor` ne compte PAS, et la nuance vaut d'etre
     * lue : il lit `--origam-bracket-competitor--pending---font-style`, un
     * var de MODIFICATEUR D'ETAT (double tiret `--pending---`), pas le
     * generique que `useTypography(props, 'bracket-competitor')` emet. La
     * prop y type-check et emet sa variable sans rien peindre — meme cas
     * que `fontFamily` sur Btn. Ne pas ajouter de regle SCSS pour lui
     * forcer un effet sans le signaler.
     ********************************************************/
    fontStyle?: string
}
