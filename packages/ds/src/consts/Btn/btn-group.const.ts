import type { IBtnGroupProps } from '../../interfaces/Btn/btn-group.interface'

import type { TVariant } from '../../types/Commons/variant.type'
import type { TVariantPresets } from '../../types/Commons/variant-preset.type'

/*********************************************************
 * BTN_GROUP_OUTLINED_BORDER / BTN_GROUP_GHOST_BORDER
 *
 * @description
 * Les chaines `width style color` que les regles `--variant-outlined` et
 * `--variant-ghost` du GROUPE posaient, portees par les quatre props de
 * cote physiques (meme raison que sur `OrigamBtn` : la prop globale
 * `border` scinde une largeur `var()` contenant une espace).
 *
 * @description
 * ⛔ ELLES NOMMENT LES TOKENS DE `btn`, PAS CEUX DE `btn-group`, et c'est
 * exactement ce que faisaient les regles supprimees. La regle de BASE du
 * groupe lit `--origam-btn-group---border-color` / `---border-style` ; ses
 * deux regles de variant BASCULAIENT sur `--origam-btn---border-color` et
 * un `solid` litteral, pour que le groupe lise « le bouton du theme,
 * entier » plutot qu'un sous-ensemble. Les reecrire sur les tokens du
 * groupe serait une correction deguisee en conversion.
 ********************************************************/
const BTN_GROUP_OUTLINED_BORDER = 'var(--origam-btn---border-width-outlined, 1px) solid var(--origam-btn---border-color, currentColor)'

const BTN_GROUP_GHOST_BORDER = 'var(--origam-btn---border-width-ghost, 1px) solid var(--origam-btn---border-color-ghost, color-mix(in srgb, currentColor 24%, transparent))'

const BTN_GROUP_GHOST_SHADOW = 'var(--origam-btn---box-shadow-ghost, 0 0 0 1px color-mix(in srgb, currentColor 18%, transparent), 0 4px 18px 0 color-mix(in srgb, currentColor 28%, transparent), 0 1px 0 0 color-mix(in srgb, white 35%, transparent) inset)'

/*********************************************************
 * BTN_GROUP_VARIANT_PRESETS
 *
 * @description
 * ADR-005 D7, lot 4 (#1027). Converti DANS LE MEME LOT que `OrigamBtn`
 * parce que les deux partagent l'enum `VARIANT`
 * (`enums/Commons/variant.enum.ts` — il n'existe aucun enum sous
 * `enums/Btn/`) et que le groupe STYLE ses enfants : les separer ferait
 * diverger deux tables sur une liste commune.
 *
 * @description
 * ⛔ CE QUE FAIT CE COMPOSANT, ET POURQUOI IL N'ETAIT PAS LA MOITIE
 * DIFFICILE. `variant-preset.const.ts` le declarait « inexprimable en prop
 * de racine » a cause d'un `calc()` de rayon interieur alimente par
 * `--origam-btn-group---inner-border-radius`. Ce nom n'a QU'UNE SEULE
 * occurrence dans tout le depot : un commentaire `//` de
 * `OrigamBtnGroup.vue`. Il n'y a jamais eu de `calc()`. Le vrai mecanisme
 * est `overflow: hidden` sur la racine — par la specification CSS le clip
 * suit la courbure du PADDING-BOX, donc le navigateur derive nativement le
 * rayon interieur (exterieur moins la largeur de bordure) a n'importe
 * quelle epaisseur, y compris les 3px de `cartoon`. Les deux lignes
 * `--origam-btn-group---border-width: …` que les regles de variant
 * recopiaient n'alimentaient donc RIEN ; elles disparaissent avec leur
 * bloc, et aucune autre regle ne lit cette propriete custom hors de la
 * declaration `border-width` de la regle de base et du modificateur
 * `&--border`, tous deux conserves.
 *
 * @description
 * ⛔ PARITE AVEC `OrigamBtn`, EXACTEMENT TELLE QU'ELLE ETAIT. Les regles du
 * groupe etaient une copie « un pour un » de celles du bouton, avec deux
 * ecarts DELIBERES que cette table reproduit :
 * @description
 * • `text` et `plain` partageaient UN SEUL bloc sur le groupe (meme fond
 *   transparent, meme absence d'ombre) — le groupe n'a jamais porte
 *   l'`opacity` de `plain`, qui est une affaire de bouton. Les deux
 *   entrees sont donc identiques ici, et `plain` NE porte PAS d'`opacity`.
 * @description
 * • `ghost` du groupe n'avait NI bloc `:hover`, NI branche
 *   `@supports not (backdrop-filter)`. Cette table ne pose donc ni
 *   `hover`, ni rien pour la feature query : il n'y a rien a convertir, et
 *   rien a declarer en exception.
 *
 * @description
 * ⛔ MEMES REGLES QUE SUR `OrigamBtn`, et elles ne se repetent pas ici :
 * chaque valeur porte la chaine `var()` que la regle portait (canal de
 * theme des 8 marques), la couleur est nommee par son token dans la chaine
 * par cote (sinon `parseBorderPositionValue` defaute a `currentColor` et
 * CONFISQUE `--origam-btn---border-color`), la largeur est aplatie a un
 * niveau (`--origam-border__width---thin` vaut `1px`, pose par aucun
 * theme), et `box-shadow: none` devient `elevation: 'none'`, donc
 * `var(--origam-shadow---none)` = `0px 0px 0px 0px rgba(0,0,0,0)` : zero
 * etendue, zero alpha, aucun pixel. Le detail complet est sur
 * {@link BTN_VARIANT_PRESETS} (`consts/Btn/btn.const.ts`).
 *
 * @description
 * ⚠️ LE `variant` DU GROUPE CONTINUE D'ATTEINDRE SES ENFANTS, et par un
 * canal DIFFERENT de cette table. `OrigamBtnGroup.vue` forwarde
 * `variant: props.variant` sans condition dans son bloc `slotDefaults`,
 * consomme par `<origam-defaults-provider>` : chaque enfant recoit donc la
 * VALEUR du variant au rang 2 (defaut de composant), puis resout sa propre
 * table `BTN_VARIANT_PRESETS` au rang 4 a partir de cette valeur. Le
 * forwarding est volontairement inconditionnel — sans lui, un
 * `<origam-btn-toggle variant="outlined">` themee obtient le bon chrome de
 * racine mais chaque enfant reste sur `text`, dont aucun preset ne peint
 * de surface active : plus aucune selection visible. Non-regression :
 * `TU/components/Btn/btn-group-defaults.spec.ts`.
 ********************************************************/
export const BTN_GROUP_VARIANT_PRESETS: TVariantPresets<TVariant, IBtnGroupProps> = {
    flat: {
        elevation: 'none'
    },
    text: {
        bgColor: 'transparent',
        elevation: 'none'
    },
    plain: {
        bgColor: 'transparent',
        elevation: 'none'
    },
    elevated: {
        elevation: 'var(--origam-btn---box-shadow-elevated, var(--origam-shadow---md))'
    },
    tonal: {
        bgColor: 'var(--origam-btn---background-color-tonal, var(--origam-color__surface---overlay))',
        elevation: 'none'
    },
    outlined: {
        bgColor: 'transparent',
        elevation: 'none',
        borderTop: BTN_GROUP_OUTLINED_BORDER,
        borderRight: BTN_GROUP_OUTLINED_BORDER,
        borderBottom: BTN_GROUP_OUTLINED_BORDER,
        borderLeft: BTN_GROUP_OUTLINED_BORDER
    },
    ghost: {
        bgColor: 'var(--origam-btn---background-color-ghost, color-mix(in srgb, currentColor 12%, transparent))',
        elevation: BTN_GROUP_GHOST_SHADOW,
        borderTop: BTN_GROUP_GHOST_BORDER,
        borderRight: BTN_GROUP_GHOST_BORDER,
        borderBottom: BTN_GROUP_GHOST_BORDER,
        borderLeft: BTN_GROUP_GHOST_BORDER,
        backdropFilter: 'var(--origam-btn---backdrop-filter-ghost, blur(8px))'
    }
}
