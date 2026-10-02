import type { TBackdropBlur } from '../../types/Commons/backdrop.type'

/*********************************************************
 * IBackdropProps
 *
 * @description
 * Backdrop-filter surface — the "frosted glass" channel. Carries the blur
 * rung only; it is not a general `filter` surface.
 *
 * @description
 * ⛔ SCOPE, AND WHY IT STOPS HERE. ADR-005 Q1 was arbitrated as "a new
 * prop surface" so `OrigamBtn`'s `ghost` variant can become a pure props
 * preset instead of a `.origam-btn--variant-ghost` rule. What `ghost`
 * needs is `backdrop-filter: blur(8px)` — that is the whole requirement,
 * and this interface covers exactly it. `saturate()`, `brightness()` and
 * multi-function filters are NOT guessed at here: a component that needs
 * one keeps writing its own `--origam-{cmp}---backdrop-filter`, the
 * channel 12 components already use today (Alert, Card, Chip, Field,
 * Menu, Sheet, Snackbar, Tooltip, Toolbar, Overlay, CommandPalette, Btn).
 *
 * @description
 * ⚠️ ADR-005 D6 recorded "no prop, no token group, no utility class" for
 * this axis. Remeasured for this lot: the PROP and the UTILITY CLASS were
 * indeed absent, but the per-component `---backdrop-filter` token channel
 * above already existed. What was genuinely missing was a PRIMITIVE blur
 * ladder, which this lot adds as `--origam-blur---{xs,sm,md,lg,xl}`.
 *
 * @description
 * Consumed via `useBackdrop(props)` -> `{ backdropClasses, backdropStyles }`.
 ********************************************************/
export interface IBackdropProps {
    /*********************************************************
     * backdropBlur
     *
     * @description
     * Blur radius applied to what sits BEHIND the element. A rung name
     * (`'md'`) resolves to `blur(var(--origam-blur---md))`; `true` means
     * the default rung; a number is read as `px`; any other string is
     * emitted inside `blur(...)` verbatim.
     *
     * @description
     * Emits `-webkit-backdrop-filter` alongside the standard property —
     * Safari still needs the prefix. No `@supports` gate: an unsupported
     * browser drops an unknown declaration on its own, and the
     * `@supports not (...)` blocks in the DS today exist to thicken the
     * BACKGROUND when blur is unavailable, which is a `bgColor` concern
     * and not this one.
     ********************************************************/
    backdropBlur?: TBackdropBlur
    /*********************************************************
     * backdropFilter
     *
     * @description
     * ECHAPPATOIRE « VALEUR CUSTOM » du canal backdrop : la chaine est
     * emise VERBATIM comme valeur de `backdrop-filter` (et de son jumeau
     * `-webkit-`), sans enveloppe `blur(...)`. Elle BAT `backdropBlur`
     * quand les deux sont posees — une valeur complete est plus specifique
     * qu'un echelon de rayon.
     *
     * @description
     * ⛔ POURQUOI ELLE EXISTE, et ce n'est pas un confort. `backdropBlur`
     * enveloppe TOUJOURS son entree en `blur(<longueur>)`, donc un filtre
     * multi-fonction n'y passe pas. Or le canal de token que `ghost`
     * portait — `--origam-btn---backdrop-filter-ghost` — est redeclare par
     * le theme `glass` avec exactement cette forme :
     * `blur(12px) saturate(1.8) brightness(1.05)` en clair
     * (`glass.theme.ts:337`) et `blur(12px) saturate(1.6) brightness(1.02)`
     * en sombre (`:693`). Convertir `ghost` en preset de props sans ce
     * passthrough jetterait silencieusement le verre de cette marque.
     *
     * @description
     * Le passthrough de valeur custom EXISTE DEJA trois fois dans ce DS —
     * `resolveSpacingValue` (toute valeur hors echelle rendue telle
     * quelle), `TYPOGRAPHY_PASSTHROUGH_MAP` pour `fontStyle`, `isCssColor`
     * pour les couleurs. Son absence sur `backdrop` etait l'asymetrie « a
     * moitie » qu'`adr-007-directional-props.md` interdit. Arbitrage du
     * proprietaire, 2026-10-01.
     *
     * @description
     * ⚠️ Ce n'est PAS une surface `filter` generale : la valeur part sur
     * `backdrop-filter`, qui agit sur ce qui est DERRIERE l'element. Un
     * `filter` sur l'element lui-meme reste hors de cette interface.
     ********************************************************/
    backdropFilter?: string
}
