import { cloneVNode, Comment, Fragment, h, Text } from 'vue'

import OrigamCode from '../../components/Code/OrigamCode.vue'

import { CODE_GROUP_EMBED_PROPS } from '../../consts/CodeGroup/code-group.const'

import type { VNode } from 'vue'

import type {
    ICodeGroupItem,
    ICodeGroupRenderedItem,
    ICodeGroupResolvedItem,
    ICodeGroupResolveOptions
} from '../../interfaces/CodeGroup/code-group.interface'

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

/*********************************************************
 * resolveCodeGroupItems
 *
 * @description
 * One list for both forms of `<OrigamCodeGroup>`: the code blocks of the
 * default slot win, `items` is the fallback. Every item comes back with the
 * `<OrigamCode>` vnode to render, already flattened, header-less and named
 * after the group `label`, its tab and its position — so the component does
 * no per-item work in its template.
 * @description
 * `items` is typed `readonly unknown[]` on purpose: the compiled `.vue` that
 * `nuxt typecheck` reads (`packages/ds/dist`) has its types stripped, so the
 * prop reaches this call as `unknown[]` and an `ICodeGroupItem[]` parameter
 * would add one error to the marketing type-check ratchet.
 ********************************************************/
export function resolveCodeGroupItems (
    items: readonly unknown[],
    nodes: VNode[] | undefined,
    options: ICodeGroupResolveOptions
): ICodeGroupRenderedItem[] {
    const fromSlot = resolveCodeGroupSlotItems(nodes)
    const source: ICodeGroupResolvedItem[] = fromSlot.length > 0
        ? fromSlot
        : (items as ICodeGroupItem[]).map((item) => ({ ...item, value: item.value ?? item.label }))

    return source.map((item, index) => {
        const params = { label: item.label, position: index + 1, total: source.length }
        const scrollerAriaLabel = options.label
            ? options.t('origam.code_group.scroller_aria_label_group', { ...params, group: options.label })
            : options.t('origam.code_group.scroller_aria_label', params)
        const embed = {
            ...CODE_GROUP_EMBED_PROPS,
            lineNumbers: options.lineNumbers || undefined,
            wrap: options.wrap || undefined,
            scrollerAriaLabel
        }

        const vnode = item.vnode
            ? cloneVNode(item.vnode, { ...embed, label: undefined, value: undefined })
            : h(OrigamCode, { code: item.code, lang: item.lang, filename: item.filename, ...embed })

        return { ...item, vnode }
    })
}

/*********************************************************
 * findCodeGroupItem
 *
 * @description
 * The item whose `value` is the active one, the first item when none matches.
 ********************************************************/
export function findCodeGroupItem (items: ICodeGroupRenderedItem[], value: unknown): ICodeGroupRenderedItem | undefined {
    return items.find((item) => item.value === value) ?? items[0]
}
