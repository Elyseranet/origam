import type { TColor } from '../../types/Commons/color.type'

/**
 * Foreground-only color contract.
 *
 * Use this interface on components whose only colour-related concern is
 * the **text** / icon (`color`). Pure typographic components (Title,
 * Caption, Subtitle, Tooltip text, …) and any chrome that doesn't paint
 * its own surface should extend this interface — NOT the combined
 * version below.
 *
 *   ┌──────────────────────────────────────────────────────────────┐
 *   │  IF the component paints a background → also extend          │
 *   │     IBgColorProps                                            │
 *   │  ELSE → keep IColorProps only.                               │
 *   └──────────────────────────────────────────────────────────────┘
 *
 * State-aware overrides (`hoverColor`, `activeColor`) have been folded
 * into the `hover` / `active` object props of `IHoverProps` /
 * `IActiveProps`:
 *
 *     <Btn :hover="{ color: 'success' }" />          (was hover-color)
 *     <Btn :active="{ color: 'success' }" />         (was active-color)
 */
export interface IColorProps {
    color?: TColor
}

/**
 * Background-only color contract.
 *
 * Combine with {@link IColorProps} on components that own a surface
 * (Btn, Card, Badge, Alert, Pagination, …). The two interfaces stay
 * orthogonal so a component can opt into one axis without inheriting
 * unused props on the other.
 *
 *   // Btn paints both surface and text.
 *   interface IBtnProps extends IColorProps, IBgColorProps { … }
 *
 *   // Title only paints text.
 *   interface ITitleProps extends IColorProps { … }
 *
 * State-aware bg overrides (`hoverBgColor`, `activeBgColor`) have been
 * folded into the `hover` / `active` object props:
 *
 *     <Card :hover="{ bgColor: 'success' }" />       (was hover-bg-color)
 *     <Card :active="{ bgColor: 'success' }" />      (was active-bg-color)
 *
 * ⛔ `bgColor` PAINTS THE SURFACE — NEVER THE PART THAT SITS ON IT.
 *
 * When a component has an inner part resting ON its coloured surface —
 * the Switch thumb, the BottomNav active pill, the Checkbox tick — that
 * part is driven by `color`, not by `bgColor`. This is a deliberate
 * contract decision, not an oversight:
 *
 *     <Switch bg-color="primary" />   track  = --…--primary---bg
 *                                     thumb  = UNCHANGED (stays white)
 *
 *     <Switch color="primary" />      thumb  = --…--primary---fg
 *
 *     <Switch bg-color="primary"      the complete rendering
 *             color="primary" />
 *
 * Why the two axes are not merged: making `bgColor` paint the inner part
 * too would need auto-contrast (pick `fg` against the surface), and the
 * utility class cannot carry that choice — it cannot know whether `fg`
 * or `fgSubtle` is the right pick for a given surface. That tension is
 * open architecture debt, not something a single component may settle
 * on its own.
 *
 * So the burden sits on the consumer: `bgColor` alone leaves the inner
 * part at its default. **Both props are required for a fully themed
 * rendering.** Say so in each such component's doc — this trap is
 * silent, and nothing in the type system reveals it.
 */
export interface IBgColorProps {
    bgColor?: TColor
}

/**
 * Accent-only color contract.
 *
 * Combine with {@link IColorProps} on components that paint a
 * **decorative accent** — a border bar, a background glyph, a pull-rule
 * — rather than their own surface fill. `accentColor` is the canonical
 * name for that axis (see ROADMAP.md — "Renommer `bgColor` →
 * `accentColor`"). Do NOT reach for this on surface-fill components
 * (Btn, Card, Chip, Badge, Alert, Pagination, …) — those keep
 * {@link IBgColorProps}, whose `bgColor` paints a real
 * `background-color`. Mixing the two meanings under the same prop name
 * is exactly the confusion this interface exists to avoid.
 *
 *   // Blockquote paints text (color) + a decorative accent (accentColor).
 *   interface IBlockquoteProps extends IColorProps, IAccentColorProps { … }
 *
 * `bgColor` remains a **deprecated alias** on components that migrate to
 * `accentColor` — resolve it as `accentColor ?? bgColor` (accentColor
 * wins) and warn once via `warnDeprecatedProp` from
 * `src/utils/Commons/color.util.ts`. Removal targeted for v3.0.0.
 */
export interface IAccentColorProps {
    accentColor?: TColor
}

/**
 * Options du resolveur d'axe couleur partage
 * (`src/utils/Commons/color-axis.util.ts`), consomme par `useColorEffect`
 * et `useStateEffect`.
 *
 * ⛔ `gradients` n'est PAS une preference de style : il fige un ecart de
 * comportement historique entre les deux appelants, et le rend visible au
 * lieu de le laisser dormir dans deux copies d'un meme algorithme.
 *
 * `useColorEffect` a toujours reconnu les degrades sur les deux canaux
 * (`bgColor` → `background-image`, `color` → triptyque
 * `background-clip: text`). `useStateEffect` ne l'a jamais fait : une
 * valeur `linear-gradient(...)` y echoue `isIntent`, echoue `isCssColor`
 * — qui exclut deliberement les degrades — et disparait sans un mot.
 *
 * Mesure sur la matrice de reference
 * (`packages/tests/TU/composables/Commons/color-axis-baseline.json`) :
 * sur 1 620 combinaisons communes, les deux composables rendent une sortie
 * identique 1 280 fois et divergent 340 fois — et les 340 divergences
 * portent TOUTES sur un degrade, sans exception.
 *
 * Le drapeau preserve donc exactement ce qui existait de part et d'autre.
 * L'activer pour `useStateEffect` donnerait le support des degrades a 33
 * composants d'un coup : c'est une decision produit, pas un nettoyage.
 */
export interface IColorAxisOptions {
    /**
     * Reconnaitre les degrades (chaine `linear-gradient(...)`, preset
     * `gradient-*`, objet `IGradient`) sur les canaux fond et premier plan.
     * Par defaut `false` — le comportement de `useStateEffect`.
     */
    gradients?: boolean
}
