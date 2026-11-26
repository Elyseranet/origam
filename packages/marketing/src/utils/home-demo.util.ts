import type { IHomeDemoButton } from '../interfaces/home-demo.interface'

/** Serialises one demo button as the one-line `<template>` a developer would write. */
export function buildHomeDemoSnippet({ props }: IHomeDemoButton, label: string): string {
    const attrs = Object.entries(props).map(([name, value]) => (value === true ? name : `${name}="${value}"`))
    return `<template>\n  <OrigamBtn ${attrs.join(' ')}>${label}</OrigamBtn>\n</template>\n`
}
