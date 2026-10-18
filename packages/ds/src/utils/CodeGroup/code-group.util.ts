import { Comment, Fragment, Text } from 'vue'

import type { VNode } from 'vue'

import type { ICodeGroupResolvedItem } from '../../interfaces/CodeGroup/code-group.interface'

/*********************************************************
 * flattenCodeGroupVNodes
 *
 * @description
 * Walks a default-slot vnode list, going through fragments (`v-for`), and
 * returns the component vnodes only: comments and whitespace text are the
 * template's noise, not tabs.
 ********************************************************/
export function flattenCodeGroupVNodes (nodes: VNode[] | undefined): VNode[] {
    const out: VNode[] = []

    for (const node of nodes ?? []) {
        if (node.type === Fragment && Array.isArray(node.children)) {
            out.push(...flattenCodeGroupVNodes(node.children as VNode[]))
        } else if (node.type !== Comment && node.type !== Text) {
            out.push(node)
        }
    }

    return out
}

/*********************************************************
 * extractCodeGroupText
 *
 * @description
 * Text content of a child's default slot, used when the block gives its code
 * in the slot rather than in the `code` prop (same rule as `<OrigamCode>`:
 * leading and trailing blank lines dropped).
 ********************************************************/
export function extractCodeGroupText (node: VNode): string {
    const children = node.children as unknown
    const raw = typeof children === 'object' && children !== null && !Array.isArray(children)
        ? (children as { default?: () => unknown }).default?.()
        : children

    const parts: string[] = []
    const visit = (value: unknown): void => {
        if (value == null || typeof value === 'boolean') return
        if (typeof value === 'string' || typeof value === 'number') { parts.push(String(value)); return }
        if (Array.isArray(value)) { value.forEach(visit); return }
        visit((value as { children?: unknown }).children)
    }
    visit(raw)

    return parts.join('').replace(/^\n+/, '').replace(/\n+$/, '')
}

/*********************************************************
 * resolveCodeGroupSlotItems
 *
 * @description
 * Builds the tabs of the slot form. The label is the child's `label`, else its
 * `filename`, else its position, so a block is never left without a tab.
 ********************************************************/
export function resolveCodeGroupSlotItems (nodes: VNode[] | undefined): ICodeGroupResolvedItem[] {
    return flattenCodeGroupVNodes(nodes).map((vnode, index) => {
        const attrs = (vnode.props ?? {}) as Record<string, unknown>
        const label = String(attrs.label ?? attrs.filename ?? index + 1)

        return {
            label,
            value: String(attrs.value ?? label),
            code: typeof attrs.code === 'string' ? attrs.code : extractCodeGroupText(vnode),
            lang: attrs.lang as ICodeGroupResolvedItem['lang'],
            filename: attrs.filename as string | undefined,
            vnode
        }
    })
}
