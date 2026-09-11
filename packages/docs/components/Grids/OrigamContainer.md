# OrigamContainer

`<OrigamContainer>` is the outer wrapper that centres a page's content
and applies a breakpoint-aware `max-width`. Use it as the topmost
structural element of any page or section.

> **Container is purely structural.** It deliberately does not expose
> chrome props (`color`, `bgColor`, `rounded`, …). For a surface that
> paints a background or rounds its corners, use
> `OrigamSheet` or
> `OrigamCard` inside the container.

## Basic usage

```vue
<template>
    <OrigamContainer>
        <OrigamRow>
            <OrigamCol cols="12">Hello</OrigamCol>
        </OrigamRow>
    </OrigamContainer>
</template>
```

By default, `max-width` follows the breakpoint ladder:

| Min viewport | `max-width` |
|---|---|
| `< 960px` | `100%` |
| `>= 960px` | `900px` |
| `>= 1280px` | `1200px` |
| `>= 1920px` | `1800px` |
| `>= 2560px` | `2400px` |

## Fluid

`fluid` removes the responsive `max-width` cap — the container expands
to fill the parent.

```vue
<template>
    <OrigamContainer fluid>
        <OrigamRow>
            <OrigamCol cols="12">Edge-to-edge</OrigamCol>
        </OrigamRow>
    </OrigamContainer>
</template>
```

## Fullscreen

`fullscreen` sets `height: 100%`, `display: flex`, `align-items: center`
and `max-width: 100%`. Useful for centred login / splash screens.

```vue
<template>
    <OrigamContainer fullscreen>
        <OrigamCol cols="6">Centred card</OrigamCol>
    </OrigamContainer>
</template>
```

## Polymorphic tag

```vue
<template>
    <OrigamContainer tag="section">…</OrigamContainer>
</template>
```

## Slots

| Slot | Slot props | Description |
|---|---|---|
| `default` | — | Container content. |

## Props (interface)

```ts
interface IContainerProps extends ICommonsComponentProps, ITagProps,
    IDimensionProps, IPaddingProps, IMarginProps, IBorderProps {
    fluid?:      boolean
    fullscreen?: boolean
}
```

Container deliberately does **not** extend `IColorProps` or `IRoundedProps`.

## Anatomy

```html
<div class="origam-container [origam-container--fluid] [origam-container--fullscreen]
            [origam-container--border]">
    <!-- default slot -->
</div>
```

## Design tokens consumed

| CSS variable | Default |
|---|---|
| `--origam-container---box-sizing` | `border-box` |
| `--origam-container---width` | `auto` |
| `--origam-container---max-width` | breakpoint-driven |
| `--origam-container---min-width` | `0` |
| `--origam-container---height` | `auto` |
| `--origam-container---max-height` | `100%` |
| `--origam-container---min-height` | `0` |
| `--origam-container---padding-block-start` | `16px` |
| `--origam-container---padding-block-end` | `16px` |
| `--origam-container---padding-inline-start` | `16px` |
| `--origam-container---padding-inline-end` | `16px` |
| `--origam-container---margin-inline-start` | `auto` |
| `--origam-container---margin-inline-end` | `auto` |
| `--origam-container---align-items` | `auto` |
| `--origam-container---display` | `block` |
| `--origam-container--border---border-width` | inherits |
| `--origam-container--border---box-shadow` | inherits |

## Accessibility

- `<OrigamContainer>` is purely structural — pick a meaningful `tag`
  (`main`, `section`, `article`…) when relevant.
- Don't nest `<main>`-tagged containers; only one is allowed per
  document.

## Theming notes

- Container is theme-agnostic — it doesn't paint any background or text
  colour. Theming happens on the surface components nested inside
  (`OrigamSheet`, `OrigamCard`, `OrigamAlert`, …).

## Related

- `OrigamRow` — flex row container.
- `OrigamCol` — flex grid item.
- `OrigamSheet` — themed surface (use this for chrome).
- `OrigamMain` — application-level main slot.
