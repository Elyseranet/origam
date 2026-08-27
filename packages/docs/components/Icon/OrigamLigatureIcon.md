# OrigamLigatureIcon

`<OrigamLigatureIcon>` is the **Material-style ligature leaf**: it renders
the icon **name** as text, and an icon font (Material Icons, Material
Symbols, …) substitutes the text by the matching glyph at render time
via OpenType ligature substitutions.

Unlike `OrigamClassIcon` — which uses CSS classes
to map glyphs — ligature icons rely on the **text content itself** being
a known ligature name in the font. That makes the markup readable
("home", "settings") at the cost of requiring an icon font that supports
ligatures (Material's Outlined / Sharp / Round families do).

## Basic usage

```vue
<template>
    <!-- Make sure the font is loaded at the document level (e.g. via
         <link href="…fonts.googleapis.com/icon?family=Material+Icons">) -->
    <OrigamLigatureIcon icon="home" />
    <OrigamLigatureIcon icon="settings" />
    <OrigamLigatureIcon icon="account_circle" />
</template>
```

## Loading the icon font

`OrigamLigatureIcon` does **NOT** ship the icon font. The host application
must include it — typical setups:

```html
<!-- Material Icons (legacy) -->
<link
    rel="stylesheet"
    href="https://fonts.googleapis.com/icon?family=Material+Icons">

<!-- Material Symbols (modern, variable font) -->
<link
    rel="stylesheet"
    href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined">
```

Without the font loaded, the icon name renders as **plain text** —
useful for fallback and for storybook previews where the font isn't
available.

## Sizes

```vue
<template>
    <OrigamLigatureIcon icon="home" size="x-small" />
    <OrigamLigatureIcon icon="home" size="small"   />
    <OrigamLigatureIcon icon="home" size="default" />
    <OrigamLigatureIcon icon="home" size="large"   />
    <OrigamLigatureIcon icon="home" size="x-large" />

    <!-- Numeric override (pixels) -->
    <OrigamLigatureIcon icon="home" :size="40" />
</template>
```

## Polymorphic tag

```vue
<template>
    <!-- Default tag is <div> -->
    <OrigamLigatureIcon icon="home" />

    <!-- Inline rendering inside a paragraph -->
    <OrigamLigatureIcon icon="favorite" tag="span" />
</template>
```

## Props (interface)

```ts
interface IIconComponentProps {
    icon?: string  // ligature name expected
    size?: TSize | number
    tag?: string
    class?: string | string[] | object
    style?: string | string[] | object
}
```

## Anatomy

```html
<div
    class="origam-icon origam-icon--ligature origam-icon--size-default"
    aria-hidden="true"
>
    home
</div>
```

The leaf applies the Material font via SCSS:

```scss
.origam-icon--ligature {
    font-family: 'Material Icons', 'Material Symbols Outlined', sans-serif;
    -webkit-font-feature-settings: 'liga';
}
```

## When to use

- When integrating with a **Material Icons / Material Symbols** workflow
  where the team prefers ligature names ("settings_outline") over
  class names ("mdi-settings-outline").
- When you want the markup to stay **readable in source** without
  pre-loading a class-mapping font CSS.

## Accessibility

- ⛔ Without a font that supports the ligature substitution (or before it
  loads), the rendered node is a literal text node — `home`, `settings`,
  `account_circle` — words a screen reader would read verbatim if left
  unprotected. `aria-hidden="true"` is applied automatically whenever no
  click handler is registered, matching `OrigamIcon`'s own contract —
  this leaf defends itself even though `OrigamIcon`'s dispatcher never
  routes to it today (see "Related" below), because it is exported on
  the public barrel and can be used directly.
- When a click handler IS attached: `aria-hidden="false"` + `role="button"`.
  The ligature text itself is not a substitute for a real accessible
  name — pass `aria-label` or `aria-labelledby`, or a dev-time console
  warning fires.

## Theming notes

- The glyph inherits `color: currentColor` from `.origam-icon`, so the
  same `data-theme` switching mechanism applies.
- The font itself is not theme-switchable — switching themes does not
  change which icon font is loaded.

## Related

- `OrigamIcon` — the dispatcher; **does NOT auto-route
  to the ligature leaf** today (the resolver assumes `mdi:` strings map
  to `OrigamClassIcon`). Use `OrigamLigatureIcon` directly, or register a
  custom set whose `component` returns `OrigamLigatureIcon`.
- `OrigamClassIcon` — class-based alternative for
  Material Design Icons (`mdi-*`).
