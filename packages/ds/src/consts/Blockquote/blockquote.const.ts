import { BLOCKQUOTE_LANG, BLOCKQUOTE_VARIANT } from '../../enums'

import type { IBlockquoteProps } from '../../interfaces/Blockquote/blockquote.interface'

import type { TBlockquoteAlign, TBlockquoteLang, TBlockquoteVariant } from '../../types/Blockquote/blockquote.type'
import type { TVariantPresets } from '../../types/Commons/variant-preset.type'

/**
 * Closed list of valid `variant` values for `<OrigamBlockquote>`.
 * Exposed so stories / consumers can iterate the matrix without
 * re-typing the literals.
 */
export const BLOCKQUOTE_VARIANTS: ReadonlyArray<TBlockquoteVariant> = Object.values(BLOCKQUOTE_VARIANT)

/**
 * Closed list of valid `lang` values.
 */
export const BLOCKQUOTE_LANGS: ReadonlyArray<TBlockquoteLang> = Object.values(BLOCKQUOTE_LANG)

/**
 * Closed list of valid `align` values.
 */
export const BLOCKQUOTE_ALIGNS: ReadonlyArray<TBlockquoteAlign> = [
    'left',
    'center',
    'right'
]

/**
 * Locale → decorative quote glyphs pair (open + close).
 *
 * The `'auto'` entry is filled at runtime by inspecting
 * `document.documentElement.lang`; if that yields nothing, the
 * component falls back to the `'en'` pair. The map is intentionally a
 * plain object (not an enum) so consumers can extend it via a defaults
 * provider in the future without touching the type.
 */
export const QUOTE_MARKS_BY_LANG: Record<Exclude<TBlockquoteLang, 'auto'>, { open: string, close: string }> = {
    fr: { open: '« ', close: ' »' },
    en: { open: '“', close: '”' },
    es: { open: '« ', close: ' »' },
    de: { open: '„', close: '“' }
}

/**
 * Default prop values for `<OrigamBlockquote>`. Centralised so
 * consumers can reference them when authoring their own wrappers.
 */
export const BLOCKQUOTE_DEFAULTS = {
    variant: 'default' as TBlockquoteVariant,
    lang: 'auto' as TBlockquoteLang,
    align: 'left' as TBlockquoteAlign,
    tag: 'blockquote'
} as const

/*********************************************************
 * BLOCKQUOTE_VARIANT_PRESETS
 *
 * @description
 * ADR-005 D7, lot #1015 — le deuxieme composant converti, apres le pilote
 * `OrigamKbd`. Un variant de Blockquote n'est plus un bloc SCSS : c'est ce
 * sac de props, resolu au rang le plus faible de la chaine (prop du site
 * d'appel > defaut de theme > PRESET > `withDefaults`).
 *
 * @description
 * ⛔ CE QUE LA CONVERSION REPARE, ET C'EST SA JUSTIFICATION. Les regles
 * `--variant-elegant` / `--variant-minimal` / `--variant-pull` declaraient
 * `font-size` / `font-family` / `font-weight` / `line-height`
 * DIRECTEMENT, a specificite (0,2,0) — identique a celle de la regle de
 * base — et plus loin dans l'ordre source. Or `useTypography` n'ecrit pas
 * ces proprietes : il ecrit la propriete custom
 * `--origam-blockquote---{propriete}` que la regle de base consomme via
 * `--resolved-{propriete}`. Les cinq props typographiques etaient donc
 * VIVANTES sur `default` et `quoted` et MORTES sur les trois autres, sans
 * aucun diagnostic — alors que la story exposait les cinq controles et que
 * la doc les documentait.
 * @description
 * Verdict navigateur, chromium, Histoire statique, lot #1015 :
 * `variant="elegant" font-size="sm"` rendait **18px**, exactement comme
 * `variant="elegant"` nu. Apres conversion la prop gagne. C'est l'une des
 * deux assertions ROUGE-avant / VERT-apres de `e2e/blockquote.spec.ts`.
 *
 * @description
 * ⛔ CHAQUE VALEUR PORTE LA CHAINE `var()` QUE LA REGLE PORTAIT, partout ou
 * le canal peut la transporter. `resolveSpacingValue` rend verbatim toute
 * valeur qui n'est pas un echelon de l'echelle, et
 * `parseBorderPositionValue` prend `match.width` EN ENTIER — donc les
 * `calc()` et les largeurs `var(--…, repli)` voyagent telles quelles, et le
 * canal d'override des themes survit.
 *
 * @description
 * ⛔ LES CINQ VALEURS TYPOGRAPHIQUES SONT L'EXCEPTION, ET ELLE EST
 * STRUCTURELLE. `useTypography` n'a AUCUNE echappatoire pour une valeur
 * custom (`typography.composable.ts:210-216`) : il enveloppe toujours en
 * `var(--origam-font__{groupe}---{valeur})`. Poser
 * `fontSize: 'var(--origam-blockquote__elegant---font-size, 1.125rem)'`
 * produirait le nom imbrique
 * `var(--origam-font__size---var(--origam-blockquote__elegant---font-size, 1.125rem))`,
 * qu'aucune feuille ne declare, et la declaration serait jetee. La ruse du
 * pilote Kbd est donc indisponible ici — c'est **#1018**, ouvert, et il
 * n'est PAS corrige dans ce lot. Seul `fontStyle` echappe, via
 * `TYPOGRAPHY_PASSTHROUGH_MAP`, et son preset porte donc bien la chaine.
 * @description
 * Le cout de cette exception est NUL, et c'est mesure, pas suppose : chacun
 * des 8 tokens concernes etait un ALIAS byte-pour-byte de l'echelon
 * semantique que le preset pose a sa place (`__elegant---font-size:
 * var(--origam-font__size---xl)` -> `fontSize: 'xl'`, et ainsi de suite),
 * et aucun des 8 themes n'en lisait un seul. Les 8 tokens sortent donc des
 * 4 feuilles et de `tokens.type.ts`, ce que `token-var-channels` prescrit
 * lui-meme pour un token que plus rien ne lit.
 *
 * @description
 * ⛔ CE QUE LA TABLE NE POSE PAS EST AUSSI IMPORTANT QUE CE QU'ELLE POSE.
 * `pull` declarait `padding-inline:
 * var(--origam-blockquote---resolved-padding-inline)` — une REDONDANCE avec
 * la regle de base, qui pose exactement la meme valeur. L'inscrire ici
 * emettrait une declaration INLINE, qui passerait devant la classe
 * utilitaire qu'un `padding` du consommateur produit : la table
 * confisquerait le canal qu'elle est censee servir. Valeur calculee
 * identique des deux cotes tant qu'aucun `padding` n'est passe ; quand il
 * l'est, l'axe inline de `pull` lui OBEIT desormais, ce qui va dans le sens
 * du lot.
 *
 * @description
 * ⛔ LES INDIRECTIONS `---resolved-*` NE SORTENT PAS D'ICI quand le token
 * PUBLIC suffit. Les regles supprimees lisaient
 * `var(--origam-blockquote---resolved-padding-inline)` et
 * `var(--origam-blockquote---resolved-padding-block)`, deux proprietes
 * custom que le bloc `<style scoped>` du composant synthetise lui-meme
 * (`OrigamBlockquote.vue`, regle `.origam-blockquote`) et qu'AUCUNE feuille
 * ne declare. Le preset nomme donc directement le token public que ces
 * indirections resolvent — `--origam-blockquote---padding-inline, 24px` et
 * `---padding-block, 16px` — ce qui est strictement equivalent par
 * substitution (verifie : une seule declaration de chacune des deux
 * indirections dans tout `packages/ds/src`, aucun modificateur ne les
 * redeclare) et met le preset sur le canal de theme PUBLIC plutot que sur
 * un detail interne. Le garde `ts-token-refs` cesse par la meme de
 * rougir sur deux des quatre noms.
 * @description
 * ⚠️ `--origam-blockquote---resolved-accent-color` ne PEUT PAS subir le
 * meme traitement, et c'est la seule entree de baseline que ce lot ajoute :
 * les huit modificateurs `.origam-blockquote--accent-{intent}` REDECLARENT
 * cette indirection. Nommer le token sous-jacent
 * (`--origam-blockquote__accent---color`) rendrait `accent-color="primary"`
 * inoperant sur le filet — une regression reelle. L'indirection est le
 * mecanisme meme de l'axe `accentColor`, donc elle reste, avec un repli
 * `currentColor` plat. ⛔ Un repli IMBRIQUE est exclu : le groupe `color`
 * de `BORDER_REGEX` s'arrete a la premiere parenthese fermante, donc une
 * valeur a repli imbrique ne matche pas DU TOUT et rien ne serait emis.
 *
 * @description
 * ⚠️ `--origam-blockquote--minimal---accent-width` n'est declare par AUCUNE
 * feuille — grammaire divergente, double tiret la ou le reste du composant
 * ecrit `__`. `minimal` tombe donc toujours sur son repli `2px`. Le preset
 * porte la chaine TELLE QUELLE : la fidelite est le travail, pas la
 * correction. C'est **#1014**, et il n'est PAS corrige ici.
 *
 * @description
 * ⚠️ `quoteMark` et `align` sont les deux moities « famille B » de ce
 * composant — un element monte et un defaut d'alignement. D7 exige qu'elles
 * passent par une prop COMPORTEMENTALE et que l'exemption soit documentee
 * SUR la prop : voir leurs JSDoc dans
 * `interfaces/Blockquote/blockquote.interface.ts`.
 ********************************************************/
export const BLOCKQUOTE_VARIANT_PRESETS: TVariantPresets<TBlockquoteVariant, IBlockquoteProps> = {
    default: {
        borderInlineStart: 'var(--origam-blockquote__accent---width, 4px) solid var(--origam-blockquote---resolved-accent-color, currentColor)',
        paddingInlineStart: 'calc(var(--origam-blockquote---padding-inline, 24px) + var(--origam-blockquote__accent---width, 4px))'
    },
    elegant: {
        fontFamily: 'serif',
        fontSize: 'xl',
        fontStyle: 'var(--origam-blockquote__elegant---font-style, italic)',
        lineHeight: 'loose',
        paddingBlock: 'var(--origam-blockquote__elegant---padding-block, 24px)',
        borderInlineStart: 'var(--origam-blockquote__accent---width, 4px) solid var(--origam-blockquote---resolved-accent-color, currentColor)',
        paddingInlineStart: 'calc(var(--origam-blockquote---padding-inline, 24px) + var(--origam-blockquote__accent---width, 4px))'
    },
    quoted: {
        quoteMark: true,
        paddingTop: 'calc(var(--origam-blockquote---padding-block, 16px) + var(--origam-blockquote--quoted---glyph-padding-extra, 1rem))'
    },
    minimal: {
        fontSize: 'md',
        fontStyle: 'var(--origam-blockquote__minimal---font-style, italic)',
        paddingBlock: 0,
        paddingInline: 'var(--origam-blockquote__minimal---padding-inline, 12px)',
        borderInlineStart: 'var(--origam-blockquote--minimal---accent-width, 2px) solid var(--origam-blockquote---resolved-accent-color, currentColor)',
        paddingInlineStart: 'calc(var(--origam-blockquote__minimal---padding-inline, 12px) + var(--origam-blockquote--minimal---accent-width, 2px))'
    },
    pull: {
        fontFamily: 'serif',
        fontSize: '3xl',
        fontWeight: 'medium',
        lineHeight: 'snug',
        align: 'center',
        paddingBlock: 'var(--origam-blockquote__pull---padding-block, 24px)',
        borderBlock: 'var(--origam-blockquote__pull---rule-width, 2px) solid var(--origam-blockquote---resolved-accent-color, currentColor)'
    }
}
