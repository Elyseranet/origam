import type { IHomeDemoButton } from '../interfaces/home-demo.interface'

/** Serialises one demo button as the snippet a developer would write: one prop per line, then label and closing tag. */
export function buildHomeDemoSnippet({ props }: IHomeDemoButton, label: string): string {
    const attrs = Object.entries(props).map(([name, value]) => `  ${value === true ? name : `${name}="${value}"`}`)
    return `<OrigamBtn\n${attrs.join('\n')}\n>${label}</OrigamBtn>\n`
}
