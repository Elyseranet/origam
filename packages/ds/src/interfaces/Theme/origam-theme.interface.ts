import type { IThemeVars, TThemeVars } from '../../types'
import type { TMode } from '../../types/Theme/theme.type'
import type { IDefault } from '../DefaultProvider/default-provider.interface'

/**
 * Runtime theme object ingested by `createOrigam({ themes })`. At install time
 * the DS resolves it to a block of `--origam-*` CSS variables injected into
 * `<head>`, scoped to `:root` (or `[data-theme="<name>"]` when `name` is set,
 * optionally narrowed by `[data-mode]` when `mode` is set).
 *
 * ## A theme has exactly THREE authoring surfaces
 *
 * 1. **`vars`** — the design tokens (the normal path). Plain nested JSON keyed
 *    by token GROUP (`color` / `rounded` / `border` / `typo` / `shadow` /
 *    `spacing` / `motion`). No `--origam-*` prefixes, no DTCG ceremony: the DS
 *    walks each tree and derives the CSS-variable name from the leaf path, so a
 *    hand-written theme resolves to the EXACT same `--origam-*` names as the
 *    published token sheets.
 *
 * 2. **`cssVars`** — the escape hatch. A flat map of raw `--origam-*` custom
 *    properties, for the rare var that has no group slot in `vars`.
 *
 * 3. **`component`** — per-component DEFAULT PROPS (not CSS): `{ global, 'origam-btn', … }`.
 *
 * ```ts
 * {
 *   name: 'sobre', mode: 'light', label: 'Sobre',
 *   vars: {
 *     color:   { surface: { default: '#ffffff' }, text: { primary: '#171717', secondary: '#525252' },
 *                action: { primary: { bg: '#7c3aed', fg: '#ffffff' } } },
 *     rounded: { md: '10px', lg: '14px' },
 *     typo:    { family: { sans: 'Inter, sans-serif' } },
 *     shadow:  { md: '0 2px 8px rgba(0,0,0,.12)' }
 *   },
 *   components: { 'origam-btn': { variant: 'flat', color: 'primary' } }
 * }
 * ```
 *
 * A COLOR slot accepts any CSS color OR a gradient (a gradient is an ordinary
 * color value). Everything is plain JSON so a Theme Builder export round-trips
 * without loss.
 */
export interface IOrigamTheme {
    /**
     * Brand name. When set, the injected variables are scoped to
     * `[data-theme="<name>"]` instead of `:root`, so the theme activates only
     * when `data-theme` matches (set it via `useTheme().setTheme(name)`).
     */
    name?: string

    /**
     * Color mode this variable block applies to. When set alongside `name`,
     * the selector becomes `[data-theme="<name>"][data-mode="<mode>"]`. When
     * set without `name`, it becomes `[data-mode="<mode>"]`.
     */
    mode?: TMode

    /**
     * Human-readable brand label for UI (e.g. a theme switcher). Falls back to
     * `name` when absent. Surfaced through `useInstalledThemes()`.
     */
    label?: string

    /**
     * Short brand description for UI (e.g. a switcher subtitle). Surfaced
     * through `useInstalledThemes()`.
     */
    description?: string

    /**
     * CSS background value for a brand swatch preview (a solid color or a
     * `linear-gradient(...)`). Surfaced through `useInstalledThemes()` so a
     * switcher can render a preview without a hard-coded metadata map.
     */
    swatch?: string

    /**
     * THE token-configuration bucket — the normal way to author a theme's
     * design tokens. Nested JSON keyed by token GROUP; each group's tree
     * resolves to its `--origam-*` namespace via the shared naming grammar
     * (see `IThemeVars`):
     *   - `color`   → `--origam-color-*`   (`color.surface.default`, `color.action.primary.bg`, …)
     *   - `rounded` → `--origam-radius-*`  (`rounded.md`, `rounded.lg`, …)
     *   - `border`  → `--origam-border-*`  (`border.width.thin`, …)
     *   - `typo`    → `--origam-font-*`    (`typo.family.sans`, `typo.size.md`, …)
     *   - `shadow`  → `--origam-shadow-*`  (`shadow.md`, …)
     *   - `spacing` → `--origam-space-*`   (`spacing.4`, …)
     *   - `motion`  → `--origam-motion-*`  (`motion.duration.fast`, …)
     *
     * A color leaf accepts any CSS color OR a gradient (no dedicated gradient group).
     */
    vars?: IThemeVars

    /**
     * ESCAPE HATCH — pre-resolved raw `--origam-*` custom-property map. Keys
     * with or without the leading `--` are accepted. Use ONLY for a raw var
     * that has no group slot in `vars`. Wins over `vars` on key collision.
     *
     *   cssVars: { '--origam-some-unmapped-var': '...' }
     */
    cssVars?: TThemeVars

    /**
     * Per-component DEFAULT PROPS layer. Keyed by `global` (applies to every
     * component) or by a component's kebab-case instance name (e.g.
     * `'origam-btn'`, `'origam-card'`), exactly like `<OrigamDefaultsProvider>`.
     *
     * `createOrigam` collapses the `component` maps of the ACTIVE brand×mode
     * themes into a single `IDefault` and provides it under
     * `ORIGAM_DEFAULTS_KEY`, so a component rendered with no explicit prop
     * inherits the theme's default. This is the "look comes from the theme,
     * not from hard-coded `withDefaults`" mechanism.
     *
     * @example
     * components: {
     *   global:        { density: 'comfortable' },
     *   'origam-btn':  { color: 'primary', rounded: 0 },
     *   'origam-card': { rounded: 'lg', elevation: 2 }
     * }
     */
    components?: IDefault
}
