import type { IHomeDemoButton } from '../interfaces/home-demo.interface'

/** Serialises one demo button as the three lines a developer would write: open tag, label, close tag. */
export function buildHomeDemoSnippet({ props }: IHomeDemoButton, label: string): string {
    const attrs = Object.entries(props).map(([name, value]) => (value === true ? name : `${name}="${value}"`))
    return `<OrigamBtn ${attrs.join(' ')}>\n  ${label}\n</OrigamBtn>\n`
}
