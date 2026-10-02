/**
 * `attach` — the teleport target for a component's floating / portal
 * surface, resolved through `useTeleport()`
 * (`composables/Commons/teleport.composable.ts`), the SINGLE consumption
 * point for the whole DS. Extracted from `IOverlayProps` (#attach-
 * harmonisation) so every component that teleports declares the exact
 * same surface instead of a half-implemented, hand-rolled `to="body"`.
 *
 *   • `true`               → no teleport, render in place.
 *   • `false` / unset      → `document.body`. Vue's boolean-prop casting
 *                             defaults an ABSENT prop whose declared type
 *                             includes `Boolean` to `false` when the
 *                             component declares no `default` for it — so
 *                             "not passed" and "passed `false`" resolve
 *                             identically to `document.body` by design
 *                             (see `OrigamOverlay`, `OrigamMenu`).
 *   • a CSS selector string → resolved against `document.querySelector`.
 *   • an `Element`          → used directly as the teleport container.
 *   • `null`                → reserved for a component whose OWN default
 *                             is not `document.body` (`OrigamDrawer`
 *                             teleports into its `<OrigamLayout>` wrapper
 *                             by default) and therefore needs a THIRD
 *                             state, distinguishable from an explicit
 *                             `false`, to fall back to that non-body
 *                             default instead. Same tri-state pattern as
 *                             `IDrawerProps.push` / `.clipped`.
 */
export interface IAttachProps {
    attach?: boolean | string | Element | null
}
