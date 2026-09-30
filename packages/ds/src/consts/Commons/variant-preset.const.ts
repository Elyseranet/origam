import type { TVariantPresetRegistry } from '../../types/Commons/variant-preset.type'

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
 * ⛔ VIDE A DESSEIN DANS CE LOT, et ce n'est pas du code mort. Le lot 1
 * d'ADR-005 livre le MECANISME (type partage, rang dans le resolveur,
 * canal `theme.variants`) et aucune conversion de composant : chaque
 * composant arrive avec son propre lot, parce qu'aucun ne se convertit
 * mecaniquement. Mesure a l'appui (2026-09-30), la taxonomie « famille A »
 * de D5 est optimiste sur trois des quatre composants qu'elle liste :
 * @description
 * - `OrigamKbd` — ses regles de variant posent des PROPRIETES CUSTOM que
 *   `key-surface` consomme sur la racine ET sur les descendants `__key`
 *   (`&--variant-outlined &__key`). Un prop de racine emet
 *   `background-color`, qui n'herite pas jusqu'a `__key` ; et la
 *   declaration de `key-surface` siege a (0,2,0), donc une valeur de
 *   preset TOKENISEE lui perdrait. Conversion fidele = revoir par ou
 *   `key-surface` recoit sa couleur.
 * - `OrigamBtnGroup` — recopie `--origam-btn-group---border-width` dans
 *   une propriete custom qui alimente un `calc()` de rayon interieur.
 *   Inexprimable en prop de racine.
 * - `OrigamBlockquote` — `padding-inline-start: calc(var(--…) + var(--…))`
 *   et des regles imbriquees sur `__body` / `__attribution`.
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
 ********************************************************/
export const VARIANT_PRESETS: TVariantPresetRegistry = {}
