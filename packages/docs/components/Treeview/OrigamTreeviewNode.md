# OrigamTreeviewNode

Sub-component of `OrigamTreeview`. It renders one node of
the tree — its label, optional icon and size hint, its expand toggle — and
recurses over `node.children` to render the subtree below it.

`OrigamTreeview` renders one of these per entry in its `items` array and the
node renders the rest of the branch itself, so a whole tree comes from a single
parent tag. You rarely write this component directly.

Everything about selection and expansion lives in the parent: the node reads
`toggleExpanded`, `toggleSelected`, `isExpanded`, `isSelected`, `selectMode`,
`showLines`, `expandOnClick` and `color` from the treeview through
`provide` / `inject`. **Mounted outside an `OrigamTreeview` it renders, but
nothing responds to clicks** — there is no context to toggle.

```vue
<template>
    <origam-treeview :items="items" v-model="selected"/>
</template>
```

## Props

| Prop | Type | Default | Description |
|---|---|---|---|
| `node` | `ITreeviewNode` | — | **Required.** The node to render. Its `children` drive the recursion. |
| `depth` | `number` | `0` | Nesting level. Drives the indentation and is incremented automatically for children — set it only when mounting a node standalone. |
| `id` | `string` | — | Root `id`. |
| `class` | `string \| Array<string> \| object` | — | Merged into the root class list. |
| `style` | `string \| Array<string> \| object \| StyleValue` | — | Merged into the root style. |

### `ITreeviewNode`

| Field | Type | Description |
|---|---|---|
| `id` | `string` | **Required.** Identity used for selection and expansion state. |
| `label` | `string` | **Required.** Displayed text. |
| `icon` | `TIcon` | Optional glyph before the label. |
| `size` | `string` | Optional trailing hint, rendered right-aligned. Free text — a file size, a count, anything. |
| `children` | `ITreeviewNode[]` | Child nodes. Their presence is what makes a node expandable. |
| `disabled` | `boolean` | Node cannot be selected. |
| `expandable` | `boolean` | Forces the expandable affordance. |

## Emits

None. The node calls the parent's injected `toggleExpanded` / `toggleSelected`
directly; `select` and `toggle` are emitted by `OrigamTreeview`, not here.

## Slots

| Slot | Scope | Description |
|---|---|---|
| `node` | `{ node: ITreeviewNode, depth: number, isExpanded: boolean, isSelected: boolean }` | Extra content rendered after the node's own row. |

The slot renders *after* the node's row rather than replacing it — it augments
a node, it does not take it over. Within the recursion it is forwarded to every
descendant with that descendant's own scope, guarded by `hasNodeSlot` so trees
without the slot don't pay for it.

::: warning Not reachable through `<origam-treeview>` today
`OrigamTreeview` renders `<origam-treeview-node … />` self-closing and declares
no slots of its own, so a `#node` template placed on `<origam-treeview>` never
reaches the nodes. The recursion forwards the slot correctly once a node has
it — but nothing gives the top-level nodes one.

That leaves the slot without a supported entry point: mounting
`<origam-treeview-node>` yourself puts it outside the treeview's
`provide`, where selection and expansion are inert. Treat this slot as
not-yet-usable rather than as documented behaviour.
:::

## Accessibility

- The children container is `role="group"`, labelled `"{label} contents"`.
- Each rendered child carries `data-cy="treeview-node-{id}"`, which is the
  handle the e2e specs use.

## Examples

A tree with icons and size hints:

```vue
<template>
    <origam-treeview
        v-model="selected"
        :items="[
            {
                id: 'src',
                label: 'src',
                children: [
                    { id: 'main', label: 'main.ts', size: '2 KB' },
                    { id: 'app',  label: 'app.vue', size: '8 KB' }
                ]
            }
        ]"
    />
</template>
```

Multi-select with connector lines:

```vue
<template>
    <origam-treeview
        v-model="selected"
        :items="items"
        select-mode="multiple"
        show-lines
        expand-on-click
    />
</template>
```
