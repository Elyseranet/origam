/**
 * The three-state color-mode vocabulary shared by every surface that lets
 * a consumer force light / dark or defer to the environment.
 *
 * - `auto`  — no attribute forced; resolution is delegated (closest
 *             ancestor, then `prefers-color-scheme`).
 * - `light` — forced light.
 * - `dark`  — forced dark.
 *
 * Lives in `Commons/` rather than in a component folder because three
 * unrelated surfaces name the same set: the `data-mode` axis (`TMode`),
 * the legacy `data-theme` aliases (`TTheme`) and `<OrigamCode>`'s
 * highlight theme (re-exported as `CODE_THEME`).
 */
export enum COLOR_MODE {
    AUTO = 'auto',
    LIGHT = 'light',
    DARK = 'dark'
}
