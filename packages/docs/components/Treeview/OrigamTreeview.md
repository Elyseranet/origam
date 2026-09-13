# OrigamTreeview

A recursive nested file/folder hierarchy component with expand/collapse, keyboard navigation, and single or multiple selection. Designed for file explorers, documentation sidebars, and any hierarchical data structure.

## Usage

### Basic file tree

```vue
<origam-treeview
  :items="[
    {
      id: 'src',
      label: 'src',
      children: [
        { id: 'src/Btn.vue', label: 'Btn.vue', size: '12.4 KB' },
        { id: 'src/Card.vue', label: 'Card.vue', size: '8.1 KB' }
      ]
    },
    { id: 'README.md', label: 'README.md', size: '3.2 KB' }
  ]"
/>
```

### Single selection with v-model

```vue
<origam-treeview
  v-model="selectedId"
  :items="fileTree"
  select-mode="single"
  selectable-nodes="leaf"
/>
```

### Multiple selection

```vue
<origam-treeview
  v-model="selectedIds"
  :items="fileTree"
  select-mode="multiple"
  selectable-nodes="all"
/>
```

### Expand on row click

```vue
<origam-treeview
  :items="fileTree"
  :expand-on-click="true"
/>
```

### Pre-expanded nodes

```vue
<origam-treeview
  :items="fileTree"
  :expanded-value="['src', 'src/components']"
/>
```

### Hide indent guide lines

```vue
<origam-treeview
  :items="fileTree"
  :show-lines="false"
/>
```

## Props — `ITreeviewProps`

| Prop | Type | Default | Description |
|---|---|---|---|
| `items` | `ITreeviewNode[]` | required | Root-level tree nodes |
| `modelValue` | `string[] \| string` | — | Selected node id(s) |
| `expandedValue` | `string[]` | — | Initially expanded node ids |
| `selectMode` | `TTreeviewSelectMode` | `'none'` | Selection mode: `'none'`, `'single'`, `'multiple'` |
| `selectableNodes` | `TTreeviewSelectableNodes` | `'leaf'` | Which nodes are selectable: `'leaf'` (files only) or `'all'` |
| `showLines` | `boolean` | `true` | Show vertical guide lines between nesting levels |
| `expandOnClick` | `boolean` | `false` | Clicking anywhere on the row toggles expansion |
| `color` | `TColor` | — | Intent color applied via `useColorEffect` |
| `density` | `TDensity` | `'default'` | Row density |
| `size` | `TSize` | `'default'` | Component size scale |
| `ariaLabel` | `string` | — | Accessible name for the root `role="tree"`. Falls back to the localised default (`'File tree'` in English) when omitted |
| + all `ICommonsComponentProps` | | | `id`, `class`, `style` |

## `ITreeviewNode` data shape

| Field | Type | Required | Description |
|---|---|---|---|
| `id` | `string` | Yes | Unique identifier used for expanded/selected tracking |
| `label` | `string` | Yes | Display name of the node |
| `icon` | `TIcon` | No | Custom icon; defaults to folder/file emoji |
| `size` | `string` | No | Pre-formatted file size string (e.g. `"12.4 KB"`) |
| `children` | `ITreeviewNode[]` | No | Child nodes — presence determines folder behaviour |
| `disabled` | `boolean` | No | Prevents interaction with this node |
| `expandable` | `boolean` | No | Override auto-detection of folder status |

## Emits

| Event | Payload | Description |
|---|---|---|
| `update:modelValue` | `string[] \| string` | Fired when selection changes |
| `update:expandedValue` | `string[]` | Fired when expanded state changes |
| `select` | `string` | Fired with the toggled node id |
| `toggle` | `string, boolean` | Fired with node id and new expanded state |

## Keyboard navigation

| Key | Action |
|---|---|
| `ArrowDown` | Move focus to next visible row |
| `ArrowUp` | Move focus to previous visible row |
| `ArrowRight` | Expand collapsed folder, or move focus to first child if already expanded |
| `ArrowLeft` | Collapse expanded folder, or move focus to parent node |
| `Enter` / `Space` | Select the focused node (if selectable), or toggle expansion for folders |

## Slots

| Slot | Props | Description |
|---|---|---|
| `node` | `{ node, depth, isExpanded, isSelected }` | Override the default row markup for each node |

### Custom node slot example

```vue
<origam-treeview :items="fileTree">
  <template #node="{ node, depth, isExpanded, isSelected }">
    <span :style="{ paddingInlineStart: `${depth * 16}px` }">
      {{ node.label }}
    </span>
  </template>
</origam-treeview>
```

## Accessibility

- Wrapper renders as `<div role="tree" aria-multiselectable>`.
- Each row renders as `[role="treeitem"]` with `aria-expanded`, `aria-selected`, and `aria-disabled`.
- Chevron and icons are `aria-hidden="true"`.
- Full keyboard navigation following the WAI-ARIA Treeview pattern.
- Disabled nodes receive `aria-disabled="true"` and `tabindex="-1"`.

## Design tokens

| CSS variable | Default source | Description |
|---|---|---|
| `--origam-treeview---background-color` | `color.surface.default` | Tree background |
| `--origam-treeview---color` | `color.text.primary` | Default text color |
| `--origam-treeview---indent-size` | `space.4` (16px) | Indentation per depth level |
| `--origam-treeview---row-height` | `space.8` (32px) | Row minimum height |
| `--origam-treeview---row-bg-hover` | `color.surface.overlay` | Row hover background |
| `--origam-treeview---row-bg-selected` | `color.action.primary.bgSubtle` | Selected row background |
| `--origam-treeview---row-color-selected` | `color.action.primary.fgSubtle` | Selected row text color |
| `--origam-treeview---row-color-disabled` | `color.text.disabled` | Disabled node text color |
| `--origam-treeview---chevron-size` | `space.4` (16px) | Chevron icon size |
| `--origam-treeview---chevron-color` | `color.text.secondary` | Chevron color |
| `--origam-treeview---label-font-size` | `font.size.sm` (0.75rem) | Node label font size |
| `--origam-treeview---size-font-size` | `font.size.xs` (0.625rem) | File size badge font size |
| `--origam-treeview---guide-color` | `color.border.subtle` | Indent guide line color |
| `--origam-treeview---guide-thickness` | `border.width.thin` (1px) | Indent guide line thickness |
