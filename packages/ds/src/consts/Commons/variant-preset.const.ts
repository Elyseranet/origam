import type { TVariantPresetRegistry } from '../../types/Commons/variant-preset.type'
import { BLOCKQUOTE_VARIANT_PRESETS } from '../Blockquote/blockquote.const'
import { KBD_VARIANT_PRESETS } from '../Kbd/kbd.const'

/*********************************************************
 * VARIANT_PROP_KEY
 *
 * @description
 * Le nom du prop discriminant qu'une table de presets indexe. ADR-005
 * n'en prevoit qu'un, et le resolveur a besoin de le nommer pour deux
 * raisons distinctes.
 *
 * @description
 * ⛔ C'EST AUSSI LA GARDE ANTI-RECURSION. Le getter installe sur un prop
 * lit `props.variant` pour savoir quelle entree de la table consulter. Si
 * ce getter etait AUSSI installe sur `variant` lui-meme, cette lecture se
 * rappellerait indefiniment. Un preset ne pose jamais `variant` — il n'y
 * a donc rien a resoudre pour cette cle, et `patchThemedPropSlot` la
 * saute explicitement sur le canal preset.
 ********************************************************/
export const VARIANT_PROP_KEY = 'variant'

/*********************************************************
 * VARIANT_PRESETS
 *
 * @description
 * Les tables de presets que le DS LIVRE, par nom kebab de composant. Un
 * theme les surcharge via `IOrigamTheme.variants` (ADR-005 D4) ; il ne les
 * constitue pas.
 *
 * @description
 * ⛔ DEUX COMPOSANTS CONVERTIS A CE JOUR — `OrigamKbd` (lot 2) et
 * `OrigamBlockquote` (lot #1015). Le lot 1 d'ADR-005 livre le MECANISME
 * (type partage, rang dans le resolveur, canal `theme.variants`) et aucune
 * conversion : chaque composant arrive avec son propre lot, parce
 * qu'aucun ne se convertit mecaniquement. Mesure a l'appui (2026-09-30),
 * la taxonomie « famille A » de D5 est optimiste sur trois des quatre
 * composants qu'elle liste :
 * @description
 * - `OrigamKbd` — FAIT (lot 2). Ses regles de variant posaient des
 *   PROPRIETES CUSTOM que `key-surface` consomme sur la racine ET sur les
 *   descendants `__key` (`&--variant-outlined &__key`). Resolu en rendant
 *   explicite ce que la CSS supposait : la surface peinte est la RACINE en
 *   forme simple et chaque `__key` en forme combinaison — les deux ne
 *   coexistent jamais — donc le composant lie les declarations de surface
 *   a cet element-la, et a lui seul. Le second point, la declaration de
 *   `key-surface` a (0,2,0) contre une classe utilitaire a (0,1,0), tombe
 *   de lui-meme : un preset porte une chaine `var(…)`, qu'`isCssColor`
 *   route vers le canal INLINE, lequel passe devant la regle scopee.
 * - `OrigamBtnGroup` — recopie `--origam-btn-group---border-width` dans
 *   une propriete custom qui alimente un `calc()` de rayon interieur.
 *   Inexprimable en prop de racine.
 * - `OrigamBlockquote` — FAIT (lot #1015). Les deux reserves que ce
 *   paragraphe posait se sont reglees sans nouveau mecanisme. Le
 *   `calc(var(--…) + var(--…))` voyage verbatim : `resolveSpacingValue`
 *   rend telle quelle toute valeur qui n'est pas un echelon de l'echelle.
 *   Les regles imbriquees sur `__body` / `__attribution` ne dependaient
 *   pas du variant mais de la PRESENCE du glyphe, donc elles sont
 *   reecrites en selecteurs de VOISINAGE (`__mark--bg + __body`,
 *   `__mark--bg ~ __attribution`) : elles se declenchent sur la condition
 *   reelle, n'ajoutent aucun alias de classe que `no-variant-css`
 *   surveillerait, et laissent zero ecart de style calcule sur les quatre
 *   autres variants. Le vrai obstacle etait ailleurs — `useTypography` n'a
 *   aucune echappatoire pour une valeur custom (#1018).
 * @description
 * Seul `OrigamBtn` ne peint que des proprietes de racine — mais il depend
 * de `IOpacityProps` / `IBackdropProps` (Q1, absents) et son `ghost` porte
 * une branche `@supports not (backdrop-filter)` qui echange le fond de
 * 12 % a 18 % : aucune prop n'exprime une valeur conditionnee a une
 * feature query.
 *
 * @description
 * Le pilote est `OrigamKbd`, pour une raison que D7 ne donne pas : AUCUN
 * theme de marque ne touche un seul token `origam-kbd` (verifie, zero
 * occurrence sur les 8 themes), donc le zero-changement y est prouvable en
 * isolation. `OrigamBtn` vient au lot 4.
 *
 * @description
 * La mesure d'acceptation se rejoue :
 * `pnpm -F @origam/tests audit:kbd-preset -- --json <fichier>`, puis
 * `-- --compare <avant> <apres>`. Elle monte le composant sous les 8
 * identites x 2 modes et lit chaque surface peinte, `__key` compris.
 ********************************************************/
export const VARIANT_PRESETS: TVariantPresetRegistry = {
    'origam-blockquote': BLOCKQUOTE_VARIANT_PRESETS,
    'origam-kbd': KBD_VARIANT_PRESETS
}
