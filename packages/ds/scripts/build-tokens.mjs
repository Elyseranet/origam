#!/usr/bin/env node
/**
 * Build entry point — wires Style Dictionary v4 against the Tokens Studio
 * source files and emits per-theme CSS, SCSS partials, and TS types.
 *
 * Usage:
 *   node scripts/build-tokens.mjs           # one-shot build
 *   node scripts/build-tokens.mjs --watch   # rebuild on tokens/** changes
 *   node scripts/build-tokens.mjs --dry-run # parse + validate, no write
 */

import StyleDictionary from 'style-dictionary'
import { getReferences, usesReferences } from 'style-dictionary/utils'
import { permutateThemes, register } from '@tokens-studio/sd-transforms'
import { readFileSync, writeFileSync, watch, mkdirSync, existsSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

import { tokenPathToCssVarName } from './token-name.mjs'

const __dirname = dirname(fileURLToPath(import.meta.url))
const projectRoot = resolve(__dirname, '..')
const tokensDir = resolve(projectRoot, 'tokens')

const isWatch = process.argv.includes('--watch')
const isDryRun = process.argv.includes('--dry-run')
const isStrict = process.argv.includes('--strict')

// ────────────────────────────────────────────────────────────────────────────
// Register Tokens Studio transforms (DTCG `$value`/`$type`, alias resolution).
// ────────────────────────────────────────────────────────────────────────────
register(StyleDictionary)

// ────────────────────────────────────────────────────────────────────────────
// Custom transform: token path → origam CSS variable name.
//
// The naming grammar lives in `./token-name.mjs` — the single source of truth
// shared with the runtime util (`src/utils/Theme/token-name.util.ts`) so the
// names baked into the published CSS sheets never drift from the names a
// runtime / exported theme emits. See that module for the full grammar.
// ────────────────────────────────────────────────────────────────────────────
StyleDictionary.registerTransform({
    name: 'origam/name/css',
    type: 'name',
    transform: (token) => {
        // The first path segment is the top-level group inside a token file
        // (e.g. "color", "space", "btn", "alert"). Component files use the
        // component name as their top key, so we detect them by checking
        // whether the file path contains "component/".
        const filePath = token.filePath || ''
        const isComponent = filePath.includes('/component/') || filePath.includes('\\component\\')

        return tokenPathToCssVarName(token.path, isComponent)
    }
})

// ────────────────────────────────────────────────────────────────────────────
// Brand theme parsing — `sobre-dark` → { brand: 'sobre', mode: 'dark' }.
// Identifies compound theme IDs of the shape `<brand>-<mode>` where
// `mode` is either `light` or `dark`. Used to emit compound selectors
// `[data-theme="<brand>"][data-mode="<mode>"]` so marketing consumers can
// flip mode independently of brand.
// ────────────────────────────────────────────────────────────────────────────
function parseBrandTheme (name) {
    const m = /^([a-z0-9]+)-(light|dark)$/.exec(name)
    if (!m) return null
    return { brand: m[1], mode: m[2] }
}

// ────────────────────────────────────────────────────────────────────────────
// Reference-preserving CSS value. When a token's SOURCE value is a Tokens-Studio
// reference (`{color.action.secondary.bg}`), emit `var(--<referenced-token>)`
// instead of the baked literal, so the chain component → semantic → primitive
// stays themeable at runtime (overriding an upstream var cascades to every
// consumer). The computed value in the browser is identical to the literal —
// references only keep the chain overridable. Falls back to the resolved
// literal for non-references, or if any `{…}` can't be mapped to a var name.
// ────────────────────────────────────────────────────────────────────────────
function tokenCssValue (token, dictionary, useRefs) {
    const resolved = token.$css?.value ?? token.$value ?? token.value
    if (!useRefs) return resolved

    const original = token.original?.$value ?? token.original?.value
    if (typeof original !== 'string' || !usesReferences(original)) return resolved

    // A filtered platform's `dictionary.tokens` drops upstream tiers (e.g. a
    // component sheet excludes primitives), so resolve references against the
    // UNFILTERED set — the referenced var is still emitted in its own sheet
    // (primitive.css / light.css) and resolves at runtime via the cascade.
    const allTokens = dictionary.unfilteredTokens ?? dictionary.tokens
    let refs
    try {
        refs = getReferences(original, allTokens, { usesDtcg: true, warnImmediately: false })
    } catch {
        return resolved
    }

    let out = original
    for (const ref of refs) {
        if (!ref?.name || !Array.isArray(ref.path)) continue
        out = out.split(`{${ref.path.join('.')}}`).join(`var(--${ref.name})`)
    }
    if (/\{[^}]+\}/.test(out)) return resolved
    return out
}

// ────────────────────────────────────────────────────────────────────────────
// CSS format: emits a theme-scoped block of CSS variables.
// ────────────────────────────────────────────────────────────────────────────
StyleDictionary.registerFormat({
    name: 'origam/css/themed',
    format: ({ dictionary, options, file }) => {
        const themeName = options.themeName || 'light'
        const useRefs = options.outputReferences !== false
        const decls = dictionary.allTokens
            .map(token => `  --${token.name}: ${tokenCssValue(token, dictionary, useRefs)};`)
            .join('\n')

        const header = file?.header ? `${file.header}\n` : ''

        if (themeName === 'primitive') {
            return `${header}:root {\n${decls}\n}\n`
        }
        if (themeName === 'light') {
            return `${header}:root,\n[data-theme="light"] {\n${decls}\n}\n`
        }
        if (themeName === 'dark') {
            return [
                header.trimEnd(),
                '[data-theme="dark"] {',
                decls,
                '}',
                '',
                '@media (prefers-color-scheme: dark) {',
                '  :root:not([data-theme]) {',
                decls.split('\n').map(l => `  ${l}`).join('\n'),
                '  }',
                '}',
                ''
            ].filter(Boolean).join('\n')
        }
        // <brand>-<mode> (e.g. "sobre-dark") → compound attribute selector
        const brand = parseBrandTheme(themeName)
        if (brand) {
            return [
                header.trimEnd(),
                `[data-theme="${brand.brand}"][data-mode="${brand.mode}"] {`,
                decls,
                '}',
                ''
            ].filter(Boolean).join('\n')
        }
        // brand-X / any other theme → scoped attribute selector only
        return `${header}[data-theme="${themeName}"] {\n${decls}\n}\n`
    }
})

// ────────────────────────────────────────────────────────────────────────────
// SCSS format: emits a SCSS partial mirroring the CSS output.
// ────────────────────────────────────────────────────────────────────────────
StyleDictionary.registerFormat({
    name: 'origam/scss/themed',
    format: ({ dictionary, options, file }) => {
        const themeName = options.themeName || 'light'
        const useRefs = options.outputReferences !== false
        const decls = dictionary.allTokens
            .map(token => `  --${token.name}: ${tokenCssValue(token, dictionary, useRefs)};`)
            .join('\n')

        const header = file?.header ? `${file.header}\n` : ''

        if (themeName === 'primitive') {
            return `${header}:root {\n${decls}\n}\n`
        }
        if (themeName === 'light') {
            return `${header}:root,\n[data-theme="light"] {\n${decls}\n}\n`
        }
        if (themeName === 'dark') {
            return `${header}[data-theme="dark"] {\n${decls}\n}\n`
        }
        const brand = parseBrandTheme(themeName)
        if (brand) {
            return `${header}[data-theme="${brand.brand}"][data-mode="${brand.mode}"] {\n${decls}\n}\n`
        }
        return `${header}[data-theme="${themeName}"] {\n${decls}\n}\n`
    }
})

// ────────────────────────────────────────────────────────────────────────────
// CSS utilities format: emits a global utility-class layer (e.g.
// `.origam--bg-primary { background-color: var(--origam-…); }`) referencing
// CSS variables emitted by `origam/css/themed`.
//
// Why a separate format instead of static authoring?
//  - The class catalogue is derived MECHANICALLY from a manifest below, but
//    we route emission through Style Dictionary so the dictionary's known
//    token names act as a "guard": if the brief asks for `.origam--bg-primary`
//    but `--origam-color-action-primary-bg` is missing from the dictionary,
//    we skip emission and surface a warning instead of shipping a class
//    pointing to nothing.
//  - This keeps utilities in the same SD pipeline as themed tokens — one
//    `tokens:build` rebuilds everything in lockstep.
//
// ⚠️ The classes only reference CSS variables. They do NOT bake in any
// raw value, so theme switching (`[data-theme="dark"]`) keeps them
// consistent without rebuilding this file.
// ────────────────────────────────────────────────────────────────────────────

/**
 * Manifest of utility classes to emit. Each entry maps a public class
 * suffix (after `.origam--`) to the CSS var it should resolve to. Order
 * inside each group dictates the order in the generated file.
 *
 * Property names are full CSS property names (no shorthands hidden in
 * aliases) — the brief mandates a 1-prop-per-class contract for clarity.
 */
const UTILITY_GROUPS = [
    {
        title: 'Foreground color (intent)',
        property: 'color',
        prefix: 'color',
        items: [
            { suffix: 'primary',   token: 'origam-color__action--primary---fg' },
            { suffix: 'secondary', token: 'origam-color__action--secondary---fg' },
            { suffix: 'success',   token: 'origam-color__feedback--success---fg' },
            { suffix: 'warning',   token: 'origam-color__feedback--warning---fg' },
            { suffix: 'danger',    token: 'origam-color__feedback--danger---fg' },
            { suffix: 'info',      token: 'origam-color__feedback--info---fg' },
            { suffix: 'neutral',   token: 'origam-color__text---primary' }
        ]
    },
    {
        title: 'Background color (intent)',
        property: 'background-color',
        prefix: 'bg',
        items: [
            { suffix: 'primary',   token: 'origam-color__action--primary---bg' },
            { suffix: 'secondary', token: 'origam-color__action--secondary---bg' },
            { suffix: 'success',   token: 'origam-color__feedback--success---bg' },
            { suffix: 'warning',   token: 'origam-color__feedback--warning---bg' },
            { suffix: 'danger',    token: 'origam-color__feedback--danger---bg' },
            { suffix: 'info',      token: 'origam-color__feedback--info---bg' },
            { suffix: 'neutral',   token: 'origam-color__surface---default' }
        ]
    },
    {
        title: 'Elevation (box-shadow)',
        property: 'box-shadow',
        prefix: 'shadow',
        items: [
            { suffix: 'none', token: 'origam-shadow---none' },
            { suffix: 'xs',   token: 'origam-shadow---xs' },
            { suffix: 'sm',   token: 'origam-shadow---sm' },
            { suffix: 'md',   token: 'origam-shadow---md' },
            { suffix: 'lg',   token: 'origam-shadow---lg' },
            { suffix: 'xl',   token: 'origam-shadow---xl' }
        ]
    },
    {
        title: 'Border radius',
        property: 'border-radius',
        prefix: 'rounded',
        items: [
            { suffix: 'none', token: 'origam-radius---none' },
            { suffix: 'xs',   token: 'origam-radius---xs' },
            { suffix: 'sm',   token: 'origam-radius---sm' },
            { suffix: 'md',   token: 'origam-radius---md' },
            { suffix: 'lg',   token: 'origam-radius---lg' },
            { suffix: 'xl',   token: 'origam-radius---xl' },
            { suffix: 'full', token: 'origam-radius---full' }
        ]
    },
    {
        title: 'Border width (paired with solid style)',
        property: 'border-width',
        prefix: 'border',
        // `border-style: solid` is paired automatically when `prefix === 'border'`
        // so a consumer applying `.origam--border-thin` gets a visible border
        // without needing an extra `border-style` declaration. The legacy
        // primitive name is `2`/`thin`/`4` — `thick` is exposed as a friendly
        // alias for `border-width-2`.
        pairedDecls: [{ property: 'border-style', value: 'solid' }],
        items: [
            { suffix: 'none',  token: 'origam-border__width---0' },
            { suffix: 'thin',  token: 'origam-border__width---thin' },
            { suffix: 'thick', token: 'origam-border__width---2' }
        ]
    },
    {
        title: 'Padding',
        property: 'padding',
        prefix: 'p',
        items: [
            { suffix: '0',  token: 'origam-space---0' },
            { suffix: '1',  token: 'origam-space---1' },
            { suffix: '2',  token: 'origam-space---2' },
            { suffix: '3',  token: 'origam-space---3' },
            { suffix: '4',  token: 'origam-space---4' },
            { suffix: '5',  token: 'origam-space---5' },
            { suffix: '6',  token: 'origam-space---6' },
            { suffix: '8',  token: 'origam-space---8' },
            { suffix: '10', token: 'origam-space---10' },
            { suffix: '12', token: 'origam-space---12' }
        ]
    },
    {
        title: 'Margin',
        property: 'margin',
        prefix: 'm',
        items: [
            { suffix: '0',  token: 'origam-space---0' },
            { suffix: '1',  token: 'origam-space---1' },
            { suffix: '2',  token: 'origam-space---2' },
            { suffix: '3',  token: 'origam-space---3' },
            { suffix: '4',  token: 'origam-space---4' },
            { suffix: '5',  token: 'origam-space---5' },
            { suffix: '6',  token: 'origam-space---6' },
            { suffix: '8',  token: 'origam-space---8' },
            { suffix: '10', token: 'origam-space---10' },
            { suffix: '12', token: 'origam-space---12' }
        ]
    },
    {
        title: 'Gap (flex/grid)',
        property: 'gap',
        prefix: 'gap',
        items: [
            { suffix: '0',  token: 'origam-space---0' },
            { suffix: '1',  token: 'origam-space---1' },
            { suffix: '2',  token: 'origam-space---2' },
            { suffix: '3',  token: 'origam-space---3' },
            { suffix: '4',  token: 'origam-space---4' },
            { suffix: '5',  token: 'origam-space---5' },
            { suffix: '6',  token: 'origam-space---6' },
            { suffix: '8',  token: 'origam-space---8' },
            { suffix: '10', token: 'origam-space---10' },
            { suffix: '12', token: 'origam-space---12' }
        ]
    },
    {
        title: 'Font size',
        property: 'font-size',
        prefix: 'text',
        items: [
            { suffix: 'xs',  token: 'origam-font__size---xs' },
            { suffix: 'sm',  token: 'origam-font__size---sm' },
            { suffix: 'md',  token: 'origam-font__size---md' },
            { suffix: 'lg',  token: 'origam-font__size---lg' },
            { suffix: 'xl',  token: 'origam-font__size---xl' },
            { suffix: '2xl', token: 'origam-font__size---2xl' }
        ]
    }
]

// Tracks tokens requested by the manifest but absent from the dictionary —
// surfaced at the end of the build for the architect / DS owner.
const utilitiesMissingTokens = []

StyleDictionary.registerFormat({
    name: 'origam/css/utilities',
    format: ({ dictionary, file, options }) => {
        const knownNames = new Set(dictionary.allTokens.map(t => t.name))

        const sections = []
        for (const group of UTILITY_GROUPS) {
            const lines = []
            lines.push(`/* ── ${group.title} ───────────────────────────────── */`)
            for (const item of group.items) {
                if (!knownNames.has(item.token)) {
                    utilitiesMissingTokens.push({
                        className: `origam--${group.prefix}-${item.suffix}`,
                        token: `--${item.token}`
                    })
                    continue
                }
                const declarations = [`${group.property}: var(--${item.token});`]
                if (group.pairedDecls) {
                    for (const decl of group.pairedDecls) {
                        declarations.push(`${decl.property}: ${decl.value};`)
                    }
                }
                lines.push(
                    `.origam--${group.prefix}-${item.suffix} { ${declarations.join(' ')} }`
                )
            }
            sections.push(lines.join('\n'))
        }

        // Style Dictionary v4 surfaces `options.header` either at `file.header`
        // or at `options.header` depending on the call site — read both.
        const headerStr = file?.header ?? options?.header ?? ''
        const header = headerStr ? `${headerStr}\n\n` : ''
        return `${header}${sections.join('\n\n')}\n`
    }
})

// ────────────────────────────────────────────────────────────────────────────
// TS types format: TToken + TIntent + TTheme.
// ────────────────────────────────────────────────────────────────────────────
StyleDictionary.registerFormat({
    name: 'origam/ts/types',
    format: ({ dictionary }) => {
        const names = [...new Set(dictionary.allTokens.map(t => `--${t.name}`))]
            .sort()
            .map(n => `  | '${n}'`)
            .join('\n')

        return [
            '// AUTO-GENERATED — do not edit. Run `npm run tokens:build`.',
            '',
            'export type TTokenName =',
            names,
            '',
            "export type TIntent =",
            "  | 'neutral'",
            "  | 'primary'",
            "  | 'secondary'",
            "  | 'ghost'",
            "  | 'success'",
            "  | 'warning'",
            "  | 'danger'",
            "  | 'info'",
            '',
            "export type TTheme = 'auto' | 'light' | 'dark' | string",
            ''
        ].join('\n')
    }
})

// ────────────────────────────────────────────────────────────────────────────
// Build orchestration
// ────────────────────────────────────────────────────────────────────────────

function ensureDirs () {
    for (const dir of [
        'src/assets/css/tokens',
        'src/assets/scss/tokens',
        'src/types'
    ]) {
        const abs = resolve(projectRoot, dir)
        if (!existsSync(abs)) mkdirSync(abs, { recursive: true })
    }
}

function buildOneTheme (themeName, sourceSets, allSources) {
    // sourceSets is the list of token-set names (without .json) that the
    // current theme enables. We translate them to file paths.
    const sourceFiles = sourceSets.map(s => `tokens/${s}.json`)

    // Filter rule: emit ONLY tokens whose source file path matches one of the
    // theme-specific sets we care about. For the primitive theme we emit
    // primitives; for light/dark we emit semantic + component (with primitive
    // included as REFERENCE source, but excluded from the output).
    const wantPrimitive = themeName === 'primitive'
    const filterFn = (token) => {
        const fp = token.filePath || ''
        if (wantPrimitive) {
            return fp.endsWith('/primitive.json') || fp.endsWith('\\primitive.json')
        }
        return !(fp.endsWith('/primitive.json') || fp.endsWith('\\primitive.json'))
    }

    return new StyleDictionary({
        log: { warnings: 'warn', verbosity: 'verbose' },
        source: sourceFiles,
        platforms: {
            css: {
                transformGroup: 'tokens-studio',
                transforms: ['name/kebab', 'origam/name/css'],
                buildPath: 'src/assets/css/tokens/',
                files: [{
                    destination: `${themeName}.css`,
                    format: 'origam/css/themed',
                    filter: filterFn,
                    options: {
                        themeName,
                        outputReferences: true,
                        header: `/* origam tokens — ${themeName} (auto-generated, do not edit) */`
                    }
                }]
            },
            scss: {
                transformGroup: 'tokens-studio',
                transforms: ['name/kebab', 'origam/name/css'],
                buildPath: 'src/assets/scss/tokens/',
                files: [{
                    destination: `_${themeName}.scss`,
                    format: 'origam/scss/themed',
                    filter: filterFn,
                    options: {
                        themeName,
                        outputReferences: true,
                        header: `/* origam tokens — ${themeName} (auto-generated, do not edit) */`
                    }
                }]
            }
        }
    })
}

function buildUtilities (allSources) {
    // Sources include both primitive AND semantic light: the manifest references
    // names from BOTH layers (e.g. `origam-color-action-primary-fg` is semantic,
    // `origam-radius-md` is primitive). Excluding either would falsely flag
    // valid tokens as "missing" and skip emission.
    const sharedHeader = [
        '/* origam utility classes — auto-generated, do not edit. */',
        '/*                                                          */',
        '/* These global helpers reference CSS variables emitted in   */',
        '/* primitive.css / light.css / dark.css. They are intended   */',
        '/* to be loaded BEFORE component-scoped SCSS so that         */',
        '/* `.origam-btn--variant-flat` (specificity 0,1,0) can       */',
        '/* override `.origam--bg-primary` (also 0,1,0) via cascade   */',
        '/* order. Bundlers preserve import order; do not move this   */',
        '/* import below the component layer.                         */'
    ].join('\n')

    return new StyleDictionary({
        log: { warnings: 'warn', verbosity: 'verbose' },
        source: allSources,
        platforms: {
            cssUtilities: {
                transformGroup: 'tokens-studio',
                transforms: ['name/kebab', 'origam/name/css'],
                buildPath: 'src/assets/css/tokens/',
                files: [{
                    destination: 'origam-utilities.css',
                    format: 'origam/css/utilities',
                    options: { header: sharedHeader }
                }]
            },
            scssUtilities: {
                transformGroup: 'tokens-studio',
                transforms: ['name/kebab', 'origam/name/css'],
                buildPath: 'src/assets/scss/tokens/',
                files: [{
                    destination: '_origam-utilities.scss',
                    format: 'origam/css/utilities',
                    options: { header: sharedHeader }
                }]
            }
        }
    })
}

function buildTypes (allSources) {
    return new StyleDictionary({
        log: { warnings: 'warn', verbosity: 'verbose' },
        source: allSources,
        platforms: {
            ts: {
                transformGroup: 'tokens-studio',
                transforms: ['name/kebab', 'origam/name/css'],
                buildPath: 'src/types/',
                files: [{
                    destination: 'tokens.type.ts',
                    format: 'origam/ts/types'
                }]
            }
        }
    })
}

async function build () {
    ensureDirs()

    const themesPath = resolve(tokensDir, '$themes.json')
    const themesRaw = JSON.parse(readFileSync(themesPath, 'utf-8'))
    const themesMap = permutateThemes(themesRaw, { separator: '/' })

    if (Object.keys(themesMap).length === 0) {
        console.error('[tokens] No themes resolved from tokens/$themes.json — aborting.')
        process.exit(1)
    }

    // Build primitive layer (theme-independent).
    {
        const sd = buildOneTheme('primitive', ['primitive'], ['tokens/primitive.json'])
        if (isDryRun) {
            await sd.hasInitialized
            console.log('[tokens] [dry-run] primitive: OK')
        } else {
            await sd.buildAllPlatforms()
            console.log('[tokens] built primitive')
        }
    }

    // Build each theme.
    for (const [name, sets] of Object.entries(themesMap)) {
        const themeName = name.toLowerCase()
        const allSources = sets.map(s => `tokens/${s}.json`)

        const sd = buildOneTheme(themeName, sets, allSources)
        if (isDryRun) {
            await sd.hasInitialized
            console.log(`[tokens] [dry-run] ${themeName}: OK`)
        } else {
            await sd.buildAllPlatforms()
            console.log(`[tokens] built ${themeName}`)
        }
    }

    // TS types: union of all token names from all themes.
    const allUniqueSources = [
        ...new Set(Object.values(themesMap).flat().map(s => `tokens/${s}.json`))
    ]
    const tsSd = buildTypes(allUniqueSources)
    if (isDryRun) {
        await tsSd.hasInitialized
        console.log('[tokens] [dry-run] types: OK')
    } else {
        await tsSd.buildAllPlatforms()
        console.log('[tokens] built TS types')
    }

    // Utility classes layer: theme-agnostic .origam--{group}-{value} helpers
    // pointing at CSS vars from primitive + semantic light. Only emitted once
    // (the file does not change with the active theme; only the CSS var values
    // it references swap via [data-theme="…"]).
    utilitiesMissingTokens.length = 0
    const utilSources = [
        'tokens/primitive.json',
        'tokens/semantic/light.json'
    ]
    const utilSd = buildUtilities(utilSources)
    if (isDryRun) {
        await utilSd.hasInitialized
        console.log('[tokens] [dry-run] utilities: OK')
    } else {
        await utilSd.buildAllPlatforms()
        if (utilitiesMissingTokens.length > 0) {
            console.warn(
                `[tokens] utilities: ${utilitiesMissingTokens.length} class(es) skipped (missing tokens):`
            )
            for (const m of utilitiesMissingTokens) {
                console.warn(`  - .${m.className} → ${m.token}`)
            }
        } else {
            console.log('[tokens] built utility classes (all manifest entries resolved)')
        }
    }

    // ────────────────────────────────────────────────────────────────────
    // Aggregated `themes-all.css` — concatenates every brand-* combo file
    // so marketing consumers can `<link rel="stylesheet" href=".../themes-all.css">`
    // once and flip themes with `<html data-theme="sobre" data-mode="dark">`.
    //
    // Skipped in dry-run (no underlying CSS files exist).
    // ────────────────────────────────────────────────────────────────────
    if (!isDryRun) {
        const cssOutDir = resolve(projectRoot, 'src/assets/css/tokens')
        const scssOutDir = resolve(projectRoot, 'src/assets/scss/tokens')
        const brandCombos = Object.keys(themesMap)
            .map(n => n.toLowerCase())
            .filter(n => parseBrandTheme(n))
            .sort()

        if (brandCombos.length > 0) {
            const aggregateHeader = [
                '/* origam tokens — themes-all (auto-generated, do not edit) */',
                '/*                                                           */',
                '/* Aggregates every <brand>-<mode> CSS combo behind a single */',
                '/* import. Activate via:                                     */',
                '/*   <html data-theme="sobre" data-mode="dark">              */',
                ''
            ].join('\n')

            const cssParts = [aggregateHeader]
            const scssParts = [aggregateHeader]
            for (const combo of brandCombos) {
                const cssPath = resolve(cssOutDir, `${combo}.css`)
                const scssPath = resolve(scssOutDir, `_${combo}.scss`)
                if (existsSync(cssPath)) {
                    cssParts.push(`\n/* ── ${combo} ───────────────────────────────── */`)
                    cssParts.push(readFileSync(cssPath, 'utf-8'))
                }
                if (existsSync(scssPath)) {
                    scssParts.push(`\n/* ── ${combo} ───────────────────────────────── */`)
                    scssParts.push(readFileSync(scssPath, 'utf-8'))
                }
            }
            writeFileSync(resolve(cssOutDir, 'themes-all.css'), cssParts.join('\n'))
            writeFileSync(resolve(scssOutDir, '_themes-all.scss'), scssParts.join('\n'))
            console.log(`[tokens] aggregated ${brandCombos.length} brand combo(s) → themes-all.css`)
        }

        console.log('[tokens] all themes built successfully')
    }
}

async function main () {
    try {
        await build()
    } catch (err) {
        console.error('[tokens] build failed:', err)
        if (isStrict || !isWatch) process.exit(1)
    }

    if (isWatch) {
        console.log('[tokens] watching tokens/** for changes...')
        let timeout = null
        watch(tokensDir, { recursive: true }, (event, filename) => {
            if (!filename || !filename.endsWith('.json')) return
            if (timeout) clearTimeout(timeout)
            timeout = setTimeout(async () => {
                console.log(`[tokens] change detected (${filename}) — rebuilding`)
                try { await build() } catch (e) { console.error(e) }
            }, 100)
        })
    }
}

main()
