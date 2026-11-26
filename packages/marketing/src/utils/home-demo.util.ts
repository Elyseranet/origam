import type { IHomeDemoButton } from '../interfaces/home-demo.interface'
import { HOME_DEMO_SNIPPET_MAX_LINE } from '../consts/playground.const'

/**
 * Serialises the demo buttons as the `<template>` a developer would write:
 * one line per button when it fits, otherwise one attribute per line, so the
 * code window stays narrow.
 */
export function buildHomeDemoSnippet(buttons: IHomeDemoButton[], labels: Record<string, string>): string {
    const blocks = buttons.map(({ key, props }) => {
        const attrs = Object.entries(props).map(([name, value]) => (value === true ? name : `${name}="${value}"`))
        const inline = `  <OrigamBtn ${attrs.join(' ')}>${labels[key]}</OrigamBtn>`
        if (inline.length <= HOME_DEMO_SNIPPET_MAX_LINE) return inline
        return `  <OrigamBtn\n${attrs.map(attr => `    ${attr}`).join('\n')}\n  >\n    ${labels[key]}\n  </OrigamBtn>`
    })
    return `<template>\n${blocks.join('\n')}\n</template>\n`
}
