import type { IKbdProps } from '../../interfaces/Kbd/kbd.interface'
import type { TVariantPresets } from '../../types/Commons/variant-preset.type'
import type { TKbdVariant } from '../../types/Kbd/kbd.type'

/*********************************************************
 * KBD_VARIANT_PRESETS
 *
 * @description
 * ADR-005 D1 — le premier composant converti. Un variant de Kbd n'est plus
 * un bloc SCSS : c'est ce sac de props, resolu au rang le plus faible de la
 * chaine (prop du site d'appel > defaut de theme > PRESET > `withDefaults`).
 *
 * @description
 * ⛔ CHAQUE VALEUR PORTE LA CHAINE `var()` QUE LA REGLE PORTAIT, jamais sa
 * traduction en echelon semantique. Ecrire `elevation: 'xs'` au lieu de la
 * chaine litterale reviendrait a emettre `var(--origam-shadow---xs)` et a
 * JETER le canal `--origam-kbd--{variant}---*` par lequel une marque
 * rehabille ses touches. Aucun des 8 themes ne touche un token
 * `origam-kbd` aujourd'hui — c'est meme la raison pour laquelle Kbd est le
 * pilote, le zero-changement y etant prouvable en isolation — mais le
 * canal doit survivre a la conversion, sinon la regle ne tiendra pas sur
 * `OrigamBtn`, dont les 8 marques redeclarent bel et bien
 * `box-shadow-elevated`, `border-width-outlined` et `background-color-tonal`.
 *
 * @description
 * ⛔ ET C'EST AUSSI CE QUI REGLE LA CASCADE. `key-surface` peint depuis une
 * regle scopee a (0,2,0), qu'une classe utilitaire a (0,1,0) ne peut pas
 * battre. Une valeur TOKENISEE (`bgColor: 'primary'`) partirait sur le
 * canal classe et perdrait donc en silence. Une chaine `var(…)` est routee
 * par `isCssColor` vers le canal « valeur custom », c'est-a-dire la
 * declaration INLINE, qui passe devant la regle scopee. La contrainte de
 * fidelite et la contrainte de cascade demandent la meme chose.
 *
 * @description
 * Les replis de chaque chaine sont conserves tels quels. Ils sont
 * aujourd'hui INATTEIGNABLES — `light.css` et `dark.css` declarent les six
 * tokens de variant, et une propriete custom declaree sur `:root` herite
 * partout, donc le second argument d'un `var()` n'est jamais atteint. Ils
 * restent parce qu'ils sont la valeur de secours si une feuille cessait de
 * declarer le token, et parce que le garde `ts-token-refs` exige un repli
 * des qu'un nom ne peut pas etre borne statiquement.
 *
 * @description
 * ⛔ CE QUE LA TABLE NE POSE PAS EST AUSSI IMPORTANT QUE CE QU'ELLE POSE.
 * `outlined` ne pose aucune couleur de bordure, et `filled` non plus, alors
 * que leurs regles en posaient une. Les deux valeurs etaient IDENTIQUES au
 * defaut de `key-surface` — la regle de `filled` reposait
 * `var(--origam-color__border---subtle)`, que le token
 * `--origam-kbd---border-color` porte deja. Les inscrire ici ne serait pas
 * neutre : un preset emet une declaration INLINE, qui passe devant le
 * token, donc une marque redeclarant `--origam-kbd---border-color`
 * cesserait d'atteindre ces deux variants. La table confisquerait le canal
 * qu'elle est censee servir.
 *
 * @description
 * ⛔ AUCUNE LARGEUR DE BORDURE NE PASSE PAR UNE CHAINE `var()`, ET C'EST
 * UNE LIMITE MESUREE DU CANAL, pas un oubli. `IBorderProps` n'expose pas de
 * `borderWidth` autonome, et le raccourci `border` parse par
 * `BORDER_REGEX`, dont le groupe `width` n'accepte que des chiffres suivis
 * d'une unite tandis que le groupe `color` accepte `var(--[^)]+)` : un
 * `border="var(--…---border-width, 1px)"` ne tombe pas en erreur, il matche
 * comme COULEUR et emet un `border-color`. Ajouter `borderWidth` a
 * `IBorderProps` a ete tente et REJETE sur la mesure : 24 composants
 * declarent `IBorderProps` sans consommer ses props autonomes, et le garde
 * `unconsumed-props` — qui ne peut que retrecir — passait de 0 a 24
 * nouvelles violations.
 * @description
 * Le cout de s'en passer est nul ici, parce que les trois largeurs de
 * variant n'apportaient aucune valeur distincte :
 * `--origam-kbd--outlined---border-width` et `__filled---border-width`
 * valent tous deux `var(--origam-border__width---thin)`, c'est-a-dire
 * exactement le defaut de `key-surface`, et `__tonal---border-width` vaut
 * `var(--origam-border__width---0)`, c'est-a-dire exactement ce que le
 * mot-cle `border: 'none'` emet via `BORDER_KEYWORD_WIDTH`. Les trois
 * tokens etaient une indirection sans valeur propre.
 *
 * @description
 * ⚠️ `tonal` portait `box-shadow: none`, le MOT-CLE. `elevation: 'none'`
 * emet `var(--origam-shadow---none)`, que `primitive.css` declare
 * `0px 0px 0px 0px rgba(0,0,0,0)`. Le style calcule change donc de `none` a
 * cette quadruple valeur — une ombre d'etendue nulle et d'alpha nul, qui ne
 * peut peindre aucun pixel. C'est le SEUL ecart de valeur calculee du lot
 * sur le chemin « variant nu », et il est mesure et rapporte comme tel
 * plutot que dissimule : le canal `elevation` n'a aucun moyen d'emettre le
 * mot-cle, `isOrigamRung` interceptant `'none'` avant tout le reste.
 ********************************************************/
export const KBD_VARIANT_PRESETS: TVariantPresets<TKbdVariant, IKbdProps> = {
    outlined: {
        bgColor: 'var(--origam-kbd--outlined---background-color, var(--origam-color__surface---raised, #fff))',
        elevation: '0 1px 0 0 color-mix(in srgb, currentColor 12%, transparent), inset 0 1px 0 0 color-mix(in srgb, white 50%, transparent)'
    },
    filled: {
        bgColor: 'var(--origam-kbd__filled---background-color, var(--origam-color__surface---overlay, #f5f5f5))',
        elevation: '0 1px 2px 0 color-mix(in srgb, currentColor 18%, transparent), inset 0 1px 0 0 color-mix(in srgb, white 60%, transparent)'
    },
    tonal: {
        bgColor: 'var(--origam-kbd__tonal---background-color, color-mix(in srgb, currentColor 8%, transparent))',
        border: 'none',
        borderColor: 'transparent',
        elevation: 'none'
    }
}
