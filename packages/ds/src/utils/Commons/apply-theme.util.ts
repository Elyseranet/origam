import type { IOrigamTheme } from '../../interfaces'

import type { ISemanticTree, IThemeVars, TInstalledThemes, TModeResolved, TSemanticLeaf, TThemeVars } from '../../types'

import { tokenPathToCssVar } from './token-name.util'

/**
 * `<style>` element id used for runtime theme injection. A single element is
 * reused per `data-style-id` so re-applying a theme replaces the block rather
 * than stacking duplicates.
 */
const STYLE_ELEMENT_PREFIX = 'origam-theme'

/** Normalise a CSS-var key to its `--origam-…` form (idempotent). */
function normaliseVarName (key: string): string {
    return key.startsWith('--') ? key : `--${key}`
}

/**
 * Friendly `vars` token GROUP → token-path root. `vars` is the normal authoring
 * bucket (see `IThemeVars`): each group's tree is prefixed with its root so a
 * leaf at `vars.color.surface.default` resolves to
 * `--origam-color__surface---default`, and `vars.rounded.md` →
 * `--origam-radius---md`, `vars.typo.family.sans` → `--origam-font__family---sans`.
 */
const VARS_GROUP_ROOTS: Record<string, ReadonlyArray<string>> = {
    color: ['color'],
    rounded: ['radius'],
    border: ['border'],
    typo: ['font'],
    shadow: ['shadow'],
    spacing: ['space'],
    motion: ['motion']
}

function isSemanticLeaf (node: TSemanticLeaf | ISemanticTree): node is TSemanticLeaf {
    const t = typeof node
    return t === 'string' || t === 'number'
}

/**
 * Walk a hand-authored semantic tree depth-first, prefixing every leaf path
 * with `rootPath` and converting it to a `--origam-*` name through the shared
 * `tokenPathToCssVar` grammar (primitive/semantic side, never component). The
 * leaf value passes through verbatim — a gradient string is just a color value.
 */
export function semanticTreeToVars (tree: ISemanticTree, rootPath: ReadonlyArray<string>): TThemeVars {
    const out: TThemeVars = {}

    const walk = (node: ISemanticTree, path: string[]): void => {
        for (const key of Object.keys(node)) {
            const child = node[key]
            const nextPath = [...path, key]
            if (isSemanticLeaf(child)) {
                out[tokenPathToCssVar(nextPath, false)] = child
            } else {
                walk(child, nextPath)
            }
        }
    }

    walk(tree, [...rootPath])
    return out
}

/**
 * Collapse the structured `vars` token bucket (the normal authoring path) into a
 * flat CSS-var map. Each group (`color` / `rounded` / `border` / `typo` /
 * `shadow` / `spacing` / `motion`) is walked under its `--origam-*` root path.
 */
export function themeVarsToVars (vars: IThemeVars): TThemeVars {
    let out: TThemeVars = {}
    for (const group of Object.keys(VARS_GROUP_ROOTS)) {
        const tree = (vars as Record<string, unknown>)[group] as ISemanticTree | undefined
        if (!tree) continue
        out = { ...out, ...semanticTreeToVars(tree, VARS_GROUP_ROOTS[group]) }
    }
    return out
}

/**
 * Resolve an `IOrigamTheme` to its flat CSS-var map.
 *
 * Precedence (low → high): the structured `vars` token bucket (the normal
 * authoring path), then the `cssVars` raw `--origam-*` escape hatch (always
 * wins on key collision).
 */
export function resolveThemeVars (theme: IOrigamTheme): TThemeVars {
    const fromVars = theme.vars ? themeVarsToVars(theme.vars) : {}
    const fromCssVars: TThemeVars = {}
    if (theme.cssVars) {
        for (const key of Object.keys(theme.cssVars)) {
            fromCssVars[normaliseVarName(key)] = theme.cssVars[key]
        }
    }
    return { ...fromVars, ...fromCssVars }
}

/**
 * Compute the CSS selector a theme block targets, from its `name` / `mode`:
 *   - neither            → `:root`
 *   - name only          → `[data-theme="<name>"]`
 *   - mode only          → `[data-mode="<mode>"]`
 *   - name + mode        → `[data-theme="<name>"][data-mode="<mode>"]`
 *
 * A `mode` of `'auto'` is treated as "no mode scoping".
 */
export function themeSelector (theme: IOrigamTheme): string {
    const hasName = typeof theme.name === 'string' && theme.name.length > 0
    const hasMode = theme.mode === 'light' || theme.mode === 'dark'

    if (!hasName && !hasMode) return ':root'

    // A mode-only theme (the DS dark baseline) keeps the plain attribute selector.
    if (!hasName) return `[data-mode="${theme.mode}"]`

    // Named brand themes emit TWO selectors:
    //   - `:root:root[data-theme=…]` (specificity 0,3,0) → wins at the document
    //     root over consumer base layers that use the `:root:root { … }` boosting
    //     trick (e.g. marketing `_shared.css`), so full-page brand switching works.
    //   - `[data-theme=…]` (0,1,0) → applies inside a SUB-TREE
    //     (`<OrigamThemeProvider theme>`), where the `:root:root` form can't match
    //     because the wrapper element isn't the document root.
    const modeAttr = hasMode ? `[data-mode="${theme.mode}"]` : ''
    const attrs = `[data-theme="${theme.name}"]${modeAttr}`
    return `:root:root${attrs}, ${attrs}`
}

/**
 * Serialise an `IOrigamTheme` to a CSS rule string:
 *   `<selector> {\n  --origam-…: value;\n  …\n}`
 *
 * Pure — no DOM access. Used both by `applyTheme` (runtime injection) and by
 * the Theme Builder's CSS export so a single code path produces both.
 */
export function themeToCss (theme: IOrigamTheme): string {
    const vars = resolveThemeVars(theme)
    const decls = Object.keys(vars)
        .map(name => `  ${name}: ${vars[name]};`)
        .join('\n')
    return `${themeSelector(theme)} {\n${decls}\n}\n`
}

/**
 * Inject (or replace) a theme's CSS variables into `<head>` at runtime.
 * SSR-safe: a no-op when `document` is unavailable. Returns the `<style>`
 * element id used, or `null` when skipped (SSR / empty theme).
 *
 * The element id derives from the theme name so multiple named themes can
 * coexist; re-applying the same theme replaces its block in place.
 */
export function applyTheme (theme: IOrigamTheme): string | null {
    if (typeof document === 'undefined') return null

    const vars = resolveThemeVars(theme)
    if (Object.keys(vars).length === 0) return null

    // The id is keyed by BOTH name and mode so a brand installed for several
    // modes (brand-light + brand-dark) gets one `<style>` block per mode
    // instead of overwriting itself. Re-applying the same name×mode replaces
    // its block in place.
    const namePart = theme.name ? `-${theme.name}` : ''
    const modePart = theme.mode === 'light' || theme.mode === 'dark' ? `-${theme.mode}` : ''
    const id = `${STYLE_ELEMENT_PREFIX}${namePart}${modePart}`

    let style = document.getElementById(id) as HTMLStyleElement | null
    if (!style) {
        style = document.createElement('style')
        style.id = id
        style.setAttribute('data-origam-theme', theme.name ?? 'root')
        if (modePart) style.setAttribute('data-origam-mode', theme.mode as string)
        document.head.appendChild(style)
    }
    style.textContent = themeToCss(theme)
    return id
}

/**
 * Install a list of themes at once: injects each one's scoped block (via
 * `applyTheme`) and returns the ids that were actually written (SSR / empty
 * themes are skipped, so the result may be shorter than the input).
 */
export function applyThemes (themes: IOrigamTheme[]): string[] {
    const ids: string[] = []
    for (const theme of themes) {
        const id = applyTheme(theme)
        if (id) ids.push(id)
    }
    return ids
}

/**
 * Collapse an `IOrigamTheme[]` into the distinct-brand summary exposed to
 * consumers: one entry per `name`, listing every concrete mode that brand was
 * installed for, plus the UI metadata (`label` / `description` / `swatch`)
 * gathered from the objects of that brand (first non-empty value wins; `label`
 * falls back to `name`). Themes without a `name` (root-scoped) are ignored —
 * they are not selectable brands. Pure (no DOM access), so it runs SSR-side.
 */
export function installedThemesFromList (themes: IOrigamTheme[]): TInstalledThemes {
    const order: string[] = []
    const modesByName = new Map<string, Set<TModeResolved>>()
    const metaByName = new Map<string, { label?: string, description?: string, swatch?: string }>()

    for (const theme of themes) {
        if (!theme.name) continue
        if (!modesByName.has(theme.name)) {
            modesByName.set(theme.name, new Set())
            metaByName.set(theme.name, {})
            order.push(theme.name)
        }
        if (theme.mode === 'light' || theme.mode === 'dark') {
            modesByName.get(theme.name)!.add(theme.mode)
        }
        const meta = metaByName.get(theme.name)!
        if (meta.label === undefined && theme.label) meta.label = theme.label
        if (meta.description === undefined && theme.description) meta.description = theme.description
        if (meta.swatch === undefined && theme.swatch) meta.swatch = theme.swatch
    }

    return order.map((name) => {
        const meta = metaByName.get(name)!
        return {
            name,
            modes: [...modesByName.get(name)!],
            label: meta.label ?? name,
            ...(meta.description !== undefined ? { description: meta.description } : {}),
            ...(meta.swatch !== undefined ? { swatch: meta.swatch } : {})
        }
    })
}
