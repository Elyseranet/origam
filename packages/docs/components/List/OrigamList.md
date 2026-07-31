# OrigamList

`<OrigamList>` is the root container of the List family. It renders a `role="listbox"`
region that lays out rows either from **slotted children** (`OrigamListItem`,
`OrigamListSubheader`, `OrigamListGroup`, …) or from a **declarative `items` array**,
and it owns the nested selection/expansion state shared by every descendant.

## Basic usage

```vue
<template>
    <origam-list>
        <origam-list-item title="Inbox" />
        <origam-list-item title="Sent" />
        <origam-list-item title="Drafts" />
    </origam-list>
</template>
```

## Declarative items

Pass an `items` array instead of slotted children and `OrigamList` renders each
row through `OrigamListChildren` internally. `itemTitle` / `itemValue` /
`itemChildren` / `itemProps` control how each raw item is read (string key,
dot-notation path, array path, or accessor function — see `TSelectItemKey`).

```vue
<template>
    <origam-list
        :items="[
            { title: 'Inbox', value: 'inbox' },
            { title: 'Sent', value: 'sent' }
        ]"
    />
</template>
```

Items with a `children` array automatically render as a collapsible
`OrigamListGroup` (see Nested groups) — that check is based on the presence
of `children`, independent of any `type` field.

`returnObject` makes `selected` emit the raw item objects instead of their
`value`; `valueComparator` (default: deep-equal) controls how a `v-model:selected`
entry is matched back to an item.

`itemType` (default `'type'`) and the `'item' | 'subheader' | 'divider'`
discriminant it is meant to read off each raw item (`LIST_ITEM_TYPE`) are
**not currently wired through** — see the known-gap note under Props. Until
that's fixed, render subheaders/dividers by slotting them directly instead:

```vue
<template>
    <origam-list>
        <origam-list-subheader title="Fruits" />
        <origam-list-item title="Apple" />
        <origam-list-item title="Banana" />
        <origam-divider />
        <origam-list-subheader title="Vegetables" />
        <origam-list-item title="Carrot" />
    </origam-list>
</template>
```

## Selection

`selected` (with `update:selected`) and `selectStrategy` drive which rows can be
selected and how a selection propagates to/from grouped children:

| `selectStrategy` (`SELECT_STRATEGY`) | Behaviour |
|---|---|
| `single-leaf` (default) | Only one leaf item selected at a time |
| `leaf` | Multiple leaf items selectable |
| `independent` | Every node (leaf or group) selects independently |
| `single-independent` | Single selection, any node type |
| `classic` | Selecting a group selects/deselects all its descendants |

`mandatory` prevents the selection from becoming empty. `click:select` fires
with `{ id, value, path }` on every user-driven selection toggle.

```vue
<template>
    <origam-list
        :items="items"
        v-model:selected="selected"
        select-strategy="leaf"
        mandatory
    />
</template>
```

## Nested groups

Items with a non-empty `children` array (or slotted `OrigamListGroup` /
`OrigamListItem` with nested children) become collapsible groups. `opened`
(with `update:opened`) tracks which group ids are expanded; `openStrategy`
controls how opening one group affects its siblings:

| `openStrategy` (`OPEN_STRATEGY`) | Behaviour |
|---|---|
| `list` (default) | Opening a group at the root closes its root-level siblings |
| `single` | Only one group open at a time at any depth |
| `multiple` | Any number of groups can stay open simultaneously |

`click:open` fires with `{ id, value, path }` on every user-driven toggle.

```vue
<template>
    <origam-list
        :items="[
            { title: 'Documents', children: [
                { title: 'Resume.pdf' },
                { title: 'Cover letter.pdf' }
            ]}
        ]"
        v-model:opened="opened"
        open-strategy="multiple"
    />
</template>
```

## Keyboard navigation

The root listens for `ArrowDown` / `ArrowUp` / `Home` / `End` and moves focus
between rows (`focusChild` util); focus wraps within the rendered set of
focusable descendants.

## Nav / slim

`nav` switches to a denser navigation-rail sizing (smaller title/subtitle
font and negative indent) and `slim` reduces the prepend-area width. Both
work by setting CSS custom properties on the root (`.origam-list--nav`,
`.origam-list--slim`) that descendant `OrigamListItem` / `OrigamListSubheader`
/ `OrigamListGroup` elements inherit through normal CSS variable cascade —
no per-item prop wiring needed.

```vue
<template>
    <origam-list nav>
        <origam-list-item title="Dashboard" prepend-icon="mdi-view-dashboard" />
    </origam-list>
</template>
```

### `lines`

`lines` (`TLines`: `'one' | 'two' | 'three'`, default `'one'`) is meant to
clamp every descendant `OrigamListItem` subtitle to that many lines, and does
add an `origam-list--{lines}-line` class to the root — **but no CSS rule in
the codebase selects that class**, so today it has no visible effect. The
line-clamp itself only works when set directly on each `OrigamListItem`
(`origam-list-item--{lines}-line`, documented on
[`OrigamListItem`](./OrigamListItem.md)). See the known-gap note under
Props.

## Disabled

`disabled` sets the whole list non-interactive (`pointer-events: none`,
`tabindex="-1"` on the root).

## Density / color / shape

`density` (`TDensity`: `'default' | 'compact' | 'comfortable'`), `color` /
`bgColor` (`TColor`, cascaded as **defaults** to every descendant
`OrigamListItem` — an item's own `color`/`bgColor` still wins), `elevation`,
`rounded`, `border` (+ per-side variants) and `padding` / `margin` (+ per-side
variants) all follow the standard cross-cutting composables (`useDensity`,
`useBothColor`, `useElevation`, `useRounded`, `useBorder`, `usePadding`,
`useMargin`) — see the matching Commons interface for the full per-side prop
set.

## Dimension

`height`, `width`, `minHeight`, `minWidth`, `maxHeight` and `maxWidth`
(`IDimensionProps`, via `useDimension`) size the root element — useful to cap
a scrollable list (`max-height` + the default `overflow: auto`).

## Props

| Prop | Type | Default | Description |
|---|---|---|---|
| `tag` | `string` | `'div'` | Root HTML element |
| `items` | `Array<any>` | `[]` | Declarative row definitions (see Declarative items) |
| `itemTitle` | `TSelectItemKey` | `'title'` | Key/path/accessor read for each item's title |
| `itemValue` | `TSelectItemKey` | `'value'` | Key/path/accessor read for each item's value |
| `itemChildren` | `TSelectItemKey` | `'children'` | Key/path/accessor read for nested children |
| `itemProps` | `TSelectItemKey` | `'props'` | Key/path/accessor read for the props forwarded to the row renderer |
| `itemType` | `string` | `'type'` | Intended to discriminate `item` / `subheader` / `divider` (`LIST_ITEM_TYPE`) — **not currently wired through**, see known gap below |
| `returnObject` | `boolean` | — | `selected` carries the raw item objects instead of their `value` |
| `valueComparator` | `(a, b) => boolean` | `deepEqual` | Custom equality check used to match a `selected` value back to an item |
| `selected` | `Array<unknown>` | — | v-model:selected — currently selected id(s) |
| `opened` | `Array<unknown>` | — | v-model:opened — currently expanded group id(s) |
| `selectStrategy` | `TSelectStrategy \| TSelectStrategyFn` | `'single-leaf'` | Selection propagation strategy (see Selection) |
| `openStrategy` | `TOpenStrategy \| TOpenStrategyFns` | `'list'` | Group-expansion propagation strategy (see Nested groups) |
| `mandatory` | `boolean` | — | Prevents the selection from becoming empty |
| `lines` | `TLines` | `'one'` | Intended subtitle line-clamp — **currently has no visible effect**, see `lines` note above |
| `nav` | `boolean` | `false` | Nav-rail sizing (smaller fonts, negative indent), cascaded via CSS variables |
| `slim` | `boolean` | `false` | Reduced prepend-area width, cascaded via CSS variables |
| `disabled` | `boolean` | `false` | Disables the whole list (non-interactive) |
| `color` | `TColor` | — | Text color intent, cascaded as a default to descendant items |
| `bgColor` | `TColor` | — | Background color intent, cascaded as a default to descendant items |
| `density` | `TDensity` | `'default'` | Row density, cascaded as a default to descendant items |
| `elevation` | `TElevation` | — | Shadow rung |
| `rounded` | `boolean \| number \| string \| TRounded` | — | Corner radius (+ per-corner variants) |
| `border` | `boolean \| number \| string \| TDirectionBoth \| Array<TDirectionBoth>` | — | Border (+ per-side variants and `borderColor` / `borderStyle`) |
| `padding` | `boolean \| number \| string` | — | Padding (+ per-side variants) |
| `margin` | `boolean \| number \| string` | — | Margin (+ per-side variants) |
| `height` / `width` / `minHeight` / `minWidth` / `maxHeight` / `maxWidth` | `number \| string` | — | Root dimension overrides |
| `activeClass` | `string` | — | Declared on `IListProps` but **not currently read** by `OrigamList` (see note below) |
| `expandIcon` / `collapseIcon` | `string` | — | Declared on `IListProps` but **not currently read** by `OrigamList` (see note below) |

> **Known gaps**
> - `activeClass`, `expandIcon` and `collapseIcon` are part of `IListProps`
>   (`packages/ds/src/interfaces/List/list.interface.ts`) but `OrigamList.vue`
>   neither reads them in its `<script setup>` nor forwards them through
>   `slotDefaults` to descendants. Passing them today has no effect.
>   `OrigamListGroup`, by contrast, does have working `expandIcon` /
>   `collapseIcon` props (defaulting to `MDI_ICONS.CHEVRON_DOWN` /
>   `MDI_ICONS.CHEVRON_UP`, i.e. `'mdi:mdi-chevron-down'` / `'mdi:mdi-chevron-up'`).
> - `lines` computes an `origam-list--{lines}-line` class
>   (`OrigamList.vue`, `lineClasses`) but no SCSS rule in the codebase
>   selects that class name — grepping the whole `packages/ds/src` tree for
>   `list--one-line` / `list--two-line` / `list--three-line` only turns up
>   the class-generation line itself. Passing `lines` on `OrigamList` today
>   has no visible effect; each `OrigamListItem` needs its own `lines` prop
>   for the clamp to actually apply.
> - `itemType` and the `type` field it's meant to read off each raw `items`
>   entry are **dropped during transform**:
>   `transformListItem` (`packages/ds/src/utils/List/list-item.util.ts`)
>   never reads `props.itemType`, and its returned object
>   (`{ title, value, props, children, raw }`) never sets a `type` field.
>   Since `OrigamListChildren.hasDivider` / `hasSubheader`
>   (`packages/ds/src/components/List/OrigamListChildren.vue`) only match on
>   `item.type === LIST_ITEM_TYPE.DIVIDER` / `.SUBHEADER`, an `items` entry
>   like `{ type: 'subheader', title: 'Fruits' }` renders as a plain
>   `OrigamListItem`, not a subheader — the discriminant is silently lost.
>   The story `OrigamList.story.vue` (`itemsWithSubheader`,
>   `itemsWithDivider`) exercises exactly this shape, which is what
>   surfaced the gap while cross-checking the code — it likely doesn't
>   render as intended today. Groups still work because `hasChildren`
>   checks for a `children` array, independent of `type`.
>
> Flagging all of the above rather than guessing at intended behaviour.

## Emits

| Event | Payload | Description |
|---|---|---|
| `update:selected` | `Array<unknown>` | Fired when the selection changes |
| `update:opened` | `Array<unknown>` | Fired when the expanded-group set changes |
| `click:select` | `{ id, value, path }` | Fired on every user-driven selection toggle |
| `click:open` | `{ id, value, path }` | Fired on every user-driven group-expansion toggle |

## Slots

| Slot | Scope | Description |
|---|---|---|
| `default` | — | Slotted rows (`OrigamListItem`, `OrigamListSubheader`, `OrigamListGroup`, …); overrides the `items`-driven renderer entirely |
| `item` | spread `item.props` (`OrigamList.vue` re-emits via `v-bind="itemProps"`, **not** `{ itemProps }`) | Overrides the row renderer for the fallback/plain-item case |
| `subheader` | spread `item.props` (same spread as `item`, **not** `{ itemProps }`) | Overrides the row renderer — but `OrigamListChildren.hasSubheader` is `slots.subheader \|\| item.type === 'subheader'`, so merely providing this slot makes **every** row match it (unless a `divider` slot is also supplied, which is checked first) |
| `divider` | spread `item.props` (same spread as `item`, **not** `{ itemProps }`) | Overrides the row renderer — but `OrigamListChildren.hasDivider` is `slots.divider \|\| item.type === 'divider'`, so merely providing this slot makes **every** row match it (it's checked before `subheader` / `group` / `item`) |
| `group` | spread `item.props` (same spread as `item`, **not** `{ itemProps }`) | Overrides the row renderer for group (parent) items — rows whose `children` array is non-empty; unlike `subheader` / `divider` this check is purely data-driven, not slot-gated |
| `groupActivator` | `{ props, isOpen, events, toggleIcon }` | Overrides the clickable header of a group |
| `childrenItem` | `{ item, index }` | Overrides the wrapper rendered around every item (item + its `<div class="origam-list-children__item">`) |

> `subheaderTitle` (`{ title }`) exists on `OrigamListChildren` (which owns the
> subheader's title content), but `OrigamList` does not forward it — it only
> forwards `childrenItem`, `divider`, `subheader`, `group`, `groupActivator`
> and `item` (`OrigamList.vue`). Passing `#subheaderTitle` to `<OrigamList>`
> has no effect.

## Composition — the List family

`OrigamList` is the entry point of a small family of components you compose
directly in your templates:

- [`OrigamListItem`](./OrigamListItem.md) — a single row (title/subtitle,
  prepend/append icon or avatar, link behaviour).
- [`OrigamListSubheader`](./OrigamListSubheader.md) — a section label between
  groups of items.
- `OrigamListGroup` (`packages/ds/src/components/List/OrigamListGroup.vue`) —
  a collapsible group: renders an activator row (an `OrigamListItem` by
  default) and, when open, a `role="group"` region with the group's own
  items. Used automatically for `items` with a non-empty `children` array, or
  can be nested manually in the default slot. **No dedicated doc page exists
  for it yet** — flagging this gap rather than inventing one.
- [`OrigamListGroupActivator`](./OrigamListGroupActivator.md) — the low-level
  wrapper a custom `#groupActivator` slot content should be placed in; it
  registers the group-activator context so the activator itself doesn't
  count as a nested list item.
- [`OrigamListChildren`](./OrigamListChildren.md) — the internal renderer
  that turns an `items` array into rows (item / subheader / divider / group);
  used automatically when you pass `items`, rarely instantiated directly.

## Accessibility

- Root renders `role="listbox"` with a roving `tabindex` (`0` when
  focusable, `-1` when `disabled` or already focused inside).
- Each nested collapsible group (`OrigamListGroup`) renders its items region
  as `role="group"` with `aria-labelledby` pointing at its activator.
- Arrow key / Home / End navigation moves focus between rows without
  changing selection — selection remains an explicit user action (click or
  the row's own key handling).

## CSS variables

| Variable | Default source | Description |
|---|---|---|
| `--origam-list---background` | `color.surface.default` | List background |
| `--origam-list---color` | `color.text.primary` | Default text color |
| `--origam-list---box-shadow` | `shadow.none` | Elevation shadow |
| `--origam-list---border-radius` | `0px` | Corner radius — a single var read by `OrigamList.vue` (fallback `0px`); the four corner tokens declared in `list.json` (`border-{start-start,start-end,end-start,end-end}-radius`) are **not** composed/read by the component today |
| `--origam-list---border-color` | `color.text.primary` | Border color |
| `--origam-list---border-style` | `solid` | Border style |
| `--origam-list---border-width` | `border.width.0` | Border width — a single shorthand read by `OrigamList.vue`; the per-side tokens declared in `list.json` (`border-{top,left,bottom,right}-width`) are **not** read by the component today |
| `--origam-list---padding-block-start` / `-end` | `space.2` (8px) | Vertical padding |
| `--origam-list---padding-inline-start` / `-end` | `space.0` | Horizontal padding |
| `--origam-list---overflow` | `auto` | Overflow behaviour |
| `--origam-list---indent-padding` | `0px` | Base indent added to nested group items |
| `--origam-list---indent-padding-nav` | `-8px` | Indent override applied when `nav` is set |
| `--origam-list---slim-prepend-width` | `28px` | Prepend width when `slim` is set |
| `--origam-list---density` | `0px` | Density modifier |
| `--origam-list__overlay---background-color` | `color.overlay.scrim` | Row overlay scrim (hover/focus) |
| `--origam-list__overlay---opacity` | `opacity.0` | Row overlay opacity |

Row-level (`--origam-list-item---*`), subheader-level
(`--origam-list-subheader---*`) and group-level (`--origam-list-group---*`)
variables are documented on their own pages
([`OrigamListItem`](./OrigamListItem.md#tokens),
[`OrigamListSubheader`](./OrigamListSubheader.md#tokens)).
