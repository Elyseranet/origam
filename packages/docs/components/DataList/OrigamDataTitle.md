# OrigamDataTitle

`<OrigamDataTitle>` renders a definition term (`<dt>`) with an optional
prepend / append zone (icon or avatar). It is the term half of
[`OrigamDataList`](./OrigamDataList.md)'s **avatar** mode, but it is a
public export and can be used on its own inside any `<dl>`.

```vue
<template>
    <dl>
        <origam-data-title text="Status" prepend-icon="mdi-information"/>
        <origam-data-text text="Active"/>
    </dl>
</template>
```

## Rendered markup

```html
<dt class="origam-data-title …">
    <span class="origam-data-title__prepend">…</span>   <!-- only if prepend* is set -->
    <span class="origam-data-title__content" data-no-activator="">…</span>
    <span class="origam-data-title__append">…</span>    <!-- only if append* is set -->
</dt>
```

The root carries the `v-contrast` directive, so the automatic
foreground-contrast pass applies as it does on the other surfaces.

## Props

### Own props

| Prop   | Type               | Default | Description                     |
|--------|--------------------|---------|---------------------------------|
| `text` | `string \| number` | —       | Term content. Required. Overridden by the `default` slot. |

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

| Slot      | Bindings   | Description                                     |
|-----------|------------|-------------------------------------------------|
| `default` | `{ text }` | Replaces the term content; receives `text` back |
| `prepend` | —          | Replaces the prepend icon / avatar              |
| `append`  | —          | Replaces the append icon / avatar               |

## Styling

`OrigamDataTitle` ships **no scoped stylesheet and declares no
`--origam-data-title---*` token**. Its appearance comes from whichever
class the consumer or the parent applies: inside `OrigamDataList`, the list
attaches `origam-data-list__title`, and the list's own SCSS reads
`--origam-data-list__title---font-size` / `-font-weight` / `-line-height` /
`-letter-spacing` / `-color` on that element. Standalone, style it through
`class` / `style` or the transversal props above.

## Usage

### With a click-through icon

```vue
<template>
    <origam-data-title
            text="API key"
            append-icon="mdi-content-copy"
            @click:append="copy"
    />
</template>

<script setup lang="ts">
    function copy () {
        navigator.clipboard.writeText(apiKey)
    }
</script>
```

### Custom term content

```vue
<origam-data-title text="Owner">
    <template #default="{ text }">
        <strong>{{ text }}</strong>
    </template>
</origam-data-title>
```
