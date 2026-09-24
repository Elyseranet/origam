import type { IOrigamTheme } from 'origam/interfaces'

import { WHY_DEMO_COMPONENT_KEYS } from '~/consts/why-origam-demo.const'

type TPropsBlock = Record<string, unknown>

/**
 * Serialise one prop value the way it is WRITTEN in a theme file — single
 * quotes for strings, bare literals for numbers / booleans, `{ … }` for the
 * nested prop objects (`menuProps`). No JSON quoting of keys: the panel has
 * to be copy-pastable into an `IOrigamTheme`, not into a `.json`.
 */
function formatValue (value: unknown): string {
    if (typeof value === 'string') {
        return `'${value}'`
    }

    if (value && typeof value === 'object' && !Array.isArray(value)) {
        const inner = Object.entries(value as TPropsBlock)
            .map(([key, val]) => `${key}: ${formatValue(val)}`)
            .join(', ')

        return `{ ${inner} }`
    }

    return String(value)
}

/**
 * Build the `components: { … }` extract shown next to the live render,
 * restricted to the components actually standing on the stage.
 *
 * ⚠️ This prints the identity's OWN block — what a brand author writes — not
 * the resolved merge with the baseline. Two reasons, and the first is the
 * page's whole argument: a brand declares only its overrides, and seeing four
 * short lines produce a complete visual identity is the claim. The second is
 * that the merge drags in `tag: 'div'` / `density: 'default'` noise that no
 * one types, which makes the panel read like generated output instead of
 * source. The caption under the panel says so explicitly.
 */
export function buildComponentsExtract (brand: IOrigamTheme | null): string {
    const lines = WHY_DEMO_COMPONENT_KEYS
        .map((key) => {
            const props = (brand?.components?.[key] ?? null) as TPropsBlock | null

            if (!props) {
                return null
            }

            const body = Object.entries(props)
                .map(([propName, value]) => `${propName}: ${formatValue(value)}`)
                .join(', ')

            return `    '${key}': { ${body} },`
        })
        .filter((line): line is string => line !== null)

    return [ 'components: {', ...lines, '}' ].join('\n')
}
