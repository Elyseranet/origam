import type { IHomeDemoButton } from '../interfaces/home-demo.interface'

/** Serialises the demo buttons as the `<template>` a developer would write. */
export function buildHomeDemoSnippet(buttons: IHomeDemoButton[], labels: Record<string, string>): string {
    const lines = buttons.map(({ key, props }) => {
        const attrs = Object.entries(props)
            .map(([name, value]) => (value === true ? name : `${name}="${value}"`))
            .join(' ')
        return `  <OrigamBtn ${attrs}>${labels[key]}</OrigamBtn>`
    })
    return `<template>\n${lines.join('\n')}\n</template>\n`
}
