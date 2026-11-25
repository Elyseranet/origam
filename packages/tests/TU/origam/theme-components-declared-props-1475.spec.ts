/*
 * #1475 — every prop the DS's own theme names must be a prop the component declares.
 *
 * The ADR-005 resolver only patches keys that are BOTH named by a theme AND declared
 * by the component; anything else is skipped and logs a dev warning (#515). The DS
 * base theme named `variant` on `origam-chip`, which Chip does not declare: dead
 * config, and one console warning on every page load for every consumer.
 *
 * Criterion: the compiled runtime props descriptor (`Component.props`), which is the
 * resolved prop set with the `extends` chain flattened — not a grep of interfaces.
 */
import { describe, expect, it } from 'vitest'

import * as components from '@origam/components'
import { origamTheme } from '@origam/themes'

const toPascal = (kebab: string): string =>
    kebab.split('-').map(part => part.charAt(0).toUpperCase() + part.slice(1)).join('')

const declaredProps = (name: string): Set<string> | null => {
    const component = (components as Record<string, { props?: Record<string, unknown> | string[] }>)[toPascal(name)]
    if (!component?.props) return null
    const keys = Array.isArray(component.props) ? component.props : Object.keys(component.props)
    return new Set(keys)
}

describe('origam theme — components block names only declared props (#1475)', () => {
    for (const theme of origamTheme) {
        it(`origamTheme[${origamTheme.indexOf(theme)}]`, () => {
            const undeclared: string[] = []
            let checked = 0
            for (const [name, props] of Object.entries(theme.components ?? {})) {
                if (name === 'global') continue
                const declared = declaredProps(name)
                if (!declared) continue
                checked++
                for (const key of Object.keys(props as object)) {
                    if (!declared.has(key)) undeclared.push(`${name}.${key}`)
                }
            }
            expect(checked).toBeGreaterThan(20)
            expect(undeclared).toEqual([])
        })
    }
})
