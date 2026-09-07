# OrigamDataText

`<OrigamDataText>` renders a definition description (`<dd>`) with an
optional prepend / append zone (icon or avatar). It is the value half of
[`OrigamDataList`](./OrigamDataList.md)'s **avatar** mode, but it is a
public export and can be used on its own inside any `<dl>`.

```vue
<template>
    <dl>
        <origam-data-title text="Status"/>
        <origam-data-text text="Active" prepend-icon="mdi-check-circle"/>
    </dl>
</template>
```

## Rendered markup

```html
<dd class="origam-data-text …">
    <span class="origam-data-text__prepend">…</span>   <!-- only if prepend* is set -->
    <span class="origam-data-text__content" data-no-activator="">…</span>
    <span class="origam-data-text__append">…</span>    <!-- only if append* is set -->
</dd>
```

The root carries the `v-contrast` directive, so the automatic
foreground-contrast pass applies as it does on the other surfaces.

## Props

### Own props

| Prop   | Type               | Default | Description                       |
|--------|--------------------|---------|-----------------------------------|
| `text` | `string \| number` | —       | Row content. Required. Overridden by the `default` slot. |

### Adjacent props (`IAdjacentProps`)

| Prop            | Type     | Description                                    |
|-----------------|----------|------------------------------------------------|
| `prependIcon`   | `TIcon`  | Icon rendered in the prepend zone              |
| `appendIcon`    | `TIcon`  | Icon rendered in the append zone               |
| `prependAvatar` | `string` | Image URL rendered as an `OrigamAvatar` before |
| `appendAvatar`  | `string` | Image URL rendered as an `OrigamAvatar` after  |

A zone is rendered only when it has content (icon, avatar, or the matching
slot). `density` is forwarded to the nested `OrigamAvatar` / `OrigamIcon`.

### Transversal props

| Group   | Props                                                                                              | Composable     |
|---------|-----------------------------------------------------------------------------------------------------|----------------|
| Color   | `color`, `bgColor`                                                                                  | `useBothColor` |
| Density | `density`                                                                                           | `useDensity`   |
| Padding | `padding`, `paddingTop`, `paddingRight`, `paddingBottom`, `paddingLeft`, `paddingBlock`, `paddingInline` | `usePadding` |
| Margin  | `margin`, `marginTop`, `marginRight`, `marginBottom`, `marginLeft`, `marginBlock`, `marginInline`   | `useMargin`    |
| Commons | `id`, `class`, `style`                                                                              | —              |

> `hoverColor` / `hoverBgColor` were removed: the component never wired an
> `isHover` state, so they resolved to `color` / `bgColor` unconditionally.

## Emits

| Event           | Payload      | Fired when                                                   |
|-----------------|--------------|--------------------------------------------------------------|
| `click:prepend` | `MouseEvent` | The prepend zone is activated (click, or `Enter`/`Space` when it is focusable) |
| `click:append`  | `MouseEvent` | The append zone is activated, same conditions                |

A zone only becomes focusable (`role="button"`, `tabindex="0"`) when a
listener for its event is attached — `useAdjacent` decides this from the
presence of the handler, so a purely decorative icon stays out of the tab
order.

## Slots

| Slot      | Bindings | Description                        |
|-----------|----------|------------------------------------|
| `default` | —        | Replaces the row content           |
| `prepend` | —        | Replaces the prepend icon / avatar |
| `append`  | —        | Replaces the append icon / avatar  |

> Unlike `OrigamDataTitle`, the `default` slot here receives **no**
> bindings — `text` is not passed back to the slot.

## Styling

`OrigamDataText` ships **no scoped stylesheet and declares no
`--origam-data-text---*` token**. Its appearance comes from whichever class
the consumer or the parent applies: inside `OrigamDataList`, the list
attaches `origam-data-list__text`, and the list's own SCSS reads
`--origam-data-list__text---font-size` / `-line-height` / `-letter-spacing` /
`-color` on that element. Standalone, style it through `class` / `style` or
the transversal props above.

## Usage

### Multiple rows under one term

```vue
<dl>
    <origam-data-title text="Contacts"/>
    <origam-data-text text="ada@example.com" prepend-icon="mdi-email"/>
    <origam-data-text text="+33 1 23 45 67 89" prepend-icon="mdi-phone"/>
</dl>
```

### Actionable append zone

```vue
<origam-data-text
        text="sk_live_…"
        append-icon="mdi-content-copy"
        @click:append="copy"
/>
```
