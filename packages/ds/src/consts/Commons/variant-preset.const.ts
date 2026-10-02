import type { TVariantPresetRegistry } from '../../types/Commons/variant-preset.type'
import { BLOCKQUOTE_VARIANT_PRESETS } from '../Blockquote/blockquote.const'
import { BTN_VARIANT_PRESETS } from '../Btn/btn.const'
import { BTN_GROUP_VARIANT_PRESETS } from '../Btn/btn-group.const'
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
 * ⛔ QUATRE COMPOSANTS CONVERTIS A CE JOUR — `OrigamKbd` (lot 2),
 * `OrigamBlockquote` (lot #1015), puis `OrigamBtn` et `OrigamBtnGroup`
 * (lot 4, #1027, ensemble parce qu'ils partagent l'enum `VARIANT` et que
 * le groupe style ses enfants). Le lot 1 d'ADR-005 livre le MECANISME
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
 * - `OrigamBtnGroup` — FAIT (lot 4, #1027). ⚠️ CE PARAGRAPHE ETAIT FAUX, et
 *   il a tenu le composant pour « la moitie difficile » pendant deux lots.
 *   Il invoquait un `calc()` de rayon INTERIEUR alimente par
 *   `--origam-btn-group---inner-border-radius` : ce nom a UNE SEULE
 *   occurrence dans tout le depot, dans un commentaire `//` de
 *   `OrigamBtnGroup.vue`. Il n'existe aucun `calc()` de ce genre. Le vrai
 *   mecanisme est `overflow: hidden` sur la racine du groupe — par la
 *   specification CSS le clip suit la courbure du PADDING-BOX, donc le
 *   navigateur derive nativement le rayon interieur (rayon exterieur moins
 *   la largeur de bordure), a n'importe quelle epaisseur. La recopie de la
 *   largeur dans une propriete custom n'alimentait donc RIEN : elle est
 *   simplement supprimee avec le reste du bloc.
 * - `OrigamBtn` — FAIT (lot 4, #1027). Ses trois reserves se sont reglees
 *   par les trois arbitrages du proprietaire du 2026-10-01 :
 *   `IBackdropProps.backdropFilter` (passthrough verbatim, pour le
 *   backdrop multi-fonction du theme `glass`), `IStateEffectConfig
 *   .fontWeight` (axe 11, pour l'actif de `tonal`), et l'equilibrage de
 *   parentheses du groupe COULEUR de `BORDER_REGEX` + `color-mix` dans son
 *   alternation (pour le repli imbrique de `ghost`). Reste UNE exception
 *   structurelle, documentee sur `BTN_VARIANT_PRESETS` : la branche
 *   `@supports not (backdrop-filter)` qui epaississait le voile de 12 % a
 *   18 % — aucune prop n'exprime une valeur conditionnee a une feature
 *   query, et c'est toujours vrai.
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
 * ✅ D6 LAISSAIT `color-mix` « A VERIFIER » — VERIFIE, CA SURVIT. Mesure
 * du lot 4 : `isCssColor` reconnait `color-mix(` depuis le pilote Kbd et
 * route la chaine vers le canal « valeur custom », tandis
 * qu'`isParsableColor` l'EXCLUT — donc aucun auto-contraste ne se
 * declenche et la valeur est emise verbatim. `CUSTOM_BOX_SHADOW_REGEX` la
 * reconnaissait deja aussi. Le seul maillon qui l'ignorait etait le groupe
 * COULEUR de `BORDER_REGEX`, corrige dans ce meme lot. Constat acte, la
 * reserve est levee.
 *
 * @description
 * Le pilote est `OrigamKbd`, pour une raison que D7 ne donne pas : AUCUN
 * theme de marque ne touche un seul token `origam-kbd` (verifie, zero
 * occurrence sur les 8 themes), donc le zero-changement y est prouvable en
 * isolation. `OrigamBtn` est venu au lot 4, et pour lui le zero-changement
 * se prouve par un harnais d'acceptation + les 7 baselines VRT, pas par
 * isolation : 8 identites redeclarent ses tokens de variant.
 *
 * @description
 * La mesure d'acceptation se rejoue :
 * `pnpm -F @origam/tests audit:kbd-preset -- --json <fichier>`, puis
 * `-- --compare <avant> <apres>`. Elle monte le composant sous les 8
 * identites x 2 modes et lit chaque surface peinte, `__key` compris.
 ********************************************************/
export const VARIANT_PRESETS: TVariantPresetRegistry = {
    'origam-blockquote': BLOCKQUOTE_VARIANT_PRESETS,
    'origam-btn': BTN_VARIANT_PRESETS,
    'origam-btn-group': BTN_GROUP_VARIANT_PRESETS,
    'origam-kbd': KBD_VARIANT_PRESETS
}
