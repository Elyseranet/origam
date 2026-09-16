/**
 * Shape the `recordOverlayTransitionClasses` init script installs on the
 * sandbox frame's `window`.
 *
 * Declared here rather than inline in a spec so the cast used on both sides
 * (the injected script and the `evaluate` that reads the log back) has a
 * single definition — a divergence between the two spellings of the property
 * name would produce an always-empty log, i.e. a silently green test.
 */
export interface ITransitionRecorderWindow {
    __origamOverlayTransitionClasses?: string[]
}
