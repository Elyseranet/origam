/**
 * Style Dictionary v4 config — origam design tokens
 *
 * Multi-theme aware: builds one CSS file per theme, plus a single SCSS partial
 * and TS type declaration shared across themes.
 *
 * Naming convention (resolved by transform `origam/name/css`):
 *   - primitive.color.neutral.0     → --origam-color-neutral-0
 *   - semantic.color.surface.default → --origam-color-surface-default
 *   - component.btn.bg              → --origam-btn---bg
 *   - component.btn.success.bg      → --origam-btn--success---bg
 *
 * Tokens Studio compat: uses @tokens-studio/sd-transforms to handle DTCG
 * `$value` / `$type`, alias resolution, and the token sets defined in
 * tokens/$metadata.json + tokens/$themes.json.
 */

import { register, permutateThemes } from '@tokens-studio/sd-transforms'
import StyleDictionary from 'style-dictionary'
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, resolve } from 'node:path'

const __dirname = dirname(fileURLToPath(import.meta.url))
const tokensDir = resolve(__dirname, '..', 'tokens')

// Register all sd-transforms (Tokens Studio compatibility layer).
register(StyleDictionary)

/**
 * Custom transform: resolves token paths to origam CSS variable names.
 *
 * Rules applied (in order):
 *   1. component.{name}.{state}.{prop} → --origam-{name}--{state}---{prop}
 *   2. component.{name}.{prop}         → --origam-{name}---{prop}
 *   3. primitive.* | semantic.*        → --origam-{...rest joined by '-'}
 *
 * The triple-tiret `---` is preserved between block and property as a
 * legacy convention compatible with the existing ~50 components.
 */
StyleDictionary.registerTransform({
    name: 'origam/name/css',
    type: 'name',
    transform: (token) => {
        const path = token.path

        if (path[0] === 'component') {
            const [, blockName, ...rest] = path
            const intentStates = new Set([
                'primary', 'secondary', 'ghost',
                'success', 'warning', 'danger', 'info',
                'selected'
            ])

            // component.{name}.{state}.{prop...}
            if (rest.length > 1 && intentStates.has(rest[0])) {
                const [state, ...propParts] = rest
                return `origam-${blockName}--${state}---${propParts.join('-')}`
            }

            // component.{name}.{prop...}
            return `origam-${blockName}---${rest.join('-')}`
        }

        // primitive.* | semantic.* → flat kebab-case under origam-
        // We strip the leading `primitive` / `semantic` namespace.
        const [, ...rest] = path
        return `origam-${rest.join('-')}`
    }
})

/**
 * CSS format: emits a `:root` block (or a theme-scoped block) of CSS variables.
 * - light theme is emitted under `:root, [data-theme="light"]`
 * - dark theme under `[data-theme="dark"]` AND `@media (prefers-color-scheme: dark) :root:not([data-theme])`
 * - primitive layer always under `:root` (theme-independent).
 */
StyleDictionary.registerFormat({
    name: 'origam/css/themed',
    format: ({ dictionary, options, file }) => {
        const themeName = options.themeName || 'light'
        const isPrimitive = themeName === 'primitive'
        const isDark = themeName === 'dark'
        const isLight = themeName === 'light'

        const decls = dictionary.allTokens
            .map(token => `  --${token.name}: ${token.$css?.value ?? token.value};`)
            .join('\n')

        const header = file?.header ? `${file.header}\n` : ''

        if (isPrimitive) {
            return `${header}:root {\n${decls}\n}\n`
        }
        if (isLight) {
            return `${header}:root,\n[data-theme="light"] {\n${decls}\n}\n`
        }
        if (isDark) {
            return [
                header,
                '[data-theme="dark"] {',
                decls,
                '}',
                '',
                '@media (prefers-color-scheme: dark) {',
                '  :root:not([data-theme]) {',
                decls.replace(/^/gm, '  '),
                '  }',
                '}',
                ''
            ].join('\n')
        }
        // brand-X or any other theme → scoped attribute selector only
        return `${header}[data-theme="${themeName}"] {\n${decls}\n}\n`
    }
})

/**
 * TS types format: emits a TToken union type from all token names + a
 * TIntent type listing semantic intents.
 */
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
            'export type TIntent =',
            "  | 'neutral'",
            "  | 'primary'",
            "  | 'secondary'",
            "  | 'ghost'",
            "  | 'success'",
            "  | 'warning'",
            "  | 'danger'",
            "  | 'info'",
            '',
            'export type TTheme = \'auto\' | \'light\' | \'dark\' | string',
            ''
        ].join('\n')
    }
})

/**
 * Build platform descriptor: returns the StyleDictionary config for one theme.
 */
function getPlatformConfig (themeName, sourceFiles) {
    return {
        log: { warnings: 'warn', verbosity: 'default' },
        source: sourceFiles,
        platforms: {
            css: {
                transformGroup: 'tokens-studio',
                transforms: ['name/kebab', 'origam/name/css'],
                buildPath: 'src/assets/css/tokens/',
                files: [
                    {
                        destination: `${themeName}.css`,
                        format: 'origam/css/themed',
                        options: {
                            themeName,
                            outputReferences: false,
                            header: `/* origam tokens — ${themeName} (auto-generated) */`
                        }
                    }
                ]
            },
            scss: {
                transformGroup: 'tokens-studio',
                transforms: ['name/kebab', 'origam/name/css'],
                buildPath: 'src/assets/scss/tokens/',
                files: [
                    {
                        destination: `_${themeName}.scss`,
                        format: 'origam/css/themed',
                        options: {
                            themeName,
                            outputReferences: false,
                            header: `/* origam tokens — ${themeName} (auto-generated) */`
                        }
                    }
                ]
            }
        }
    }
}

/**
 * Build platform descriptor for the cross-theme TS types.
 */
function getTypesConfig (sourceFiles) {
    return {
        log: { warnings: 'warn', verbosity: 'default' },
        source: sourceFiles,
        platforms: {
            ts: {
                transformGroup: 'tokens-studio',
                transforms: ['name/kebab', 'origam/name/css'],
                buildPath: 'src/types/',
                files: [
                    {
                        destination: 'tokens.type.ts',
                        format: 'origam/ts/types'
                    }
                ]
            }
        }
    }
}

/**
 * Reads tokens/$themes.json and returns one source-file list per theme.
 * Tokens Studio's `$themes.json` declares which sets are enabled per theme;
 * `permutateThemes` resolves that into a flat list of file paths.
 */
function loadThemes () {
    const themesPath = resolve(tokensDir, '$themes.json')
    const themes = JSON.parse(readFileSync(themesPath, 'utf-8'))
    return permutateThemes(themes, { separator: '/' })
}

export default {
    getPlatformConfig,
    getTypesConfig,
    loadThemes,
    tokensDir
}
