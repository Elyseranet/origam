# OrigamThemeProvider

`<OrigamThemeProvider>` applies a specific theme (brand) and/or color mode to a sub-tree by setting the `data-theme` and `data-mode` attributes on a wrapper element. CSS variables resolve against the nearest `data-theme` / `data-mode` ancestor, so child components see the overridden token set. The two axes are orthogonal — a branded sub-tree can be pinned to light or dark independently.

## Basic usage

```vue
<template>
    <!-- Force dark mode for this card only -->
    <OrigamThemeProvider mode="dark">
        <OrigamCard title="Dark card" />
    </OrigamThemeProvider>

    <!-- Force a brand AND a mode -->
    <OrigamThemeProvider theme="brand-a" mode="dark">
        <OrigamCard title="Brand A, dark" />
    </OrigamThemeProvider>
</template>
```

## Available values

### `theme` (brand → `data-theme`)

| Value | Effect |
|---|---|
| `'auto'` | No `data-theme` attribute rendered — inherits from closest ancestor |
| `'light'` / `'dark'` | Legacy aliases kept for back-compat |
| any string | Custom brand theme (must have a matching `tokens/semantic/{name}.json`) |

### `mode` (color mode → `data-mode`)

| Value | Effect |
|---|---|
| `'auto'` | No `data-mode` attribute rendered — inherits from closest ancestor |
| `'light'` | Forces light mode for this sub-tree |
| `'dark'` | Forces dark mode for this sub-tree |

## Props

| Prop | Type | Default | Description |
|---|---|---|---|
| `theme` | `TTheme` | `'auto'` | Brand to apply to this sub-tree (`data-theme`) |
| `mode` | `TMode` | `'auto'` | Color mode to force on this sub-tree (`data-mode`) |
| `tag` | `string` | `'div'` | HTML element for the wrapper |

## Slot

| Slot | Description |
|---|---|
| `default` | Content rendered inside the themed wrapper |

## Emits

`OrigamThemeProvider` emits no events.

## Component default props (props-first)

Setting `theme="<brand>"` does **two** things, not one:

1. **CSS variables** — re-scopes the token set via `data-theme` / `data-mode` (above).
2. **Per-component default props** — re-applies that brand's `theme.components` map (the `{ 'origam-btn': { variant, rounded, … } }` defaults declared on the theme object) to the sub-tree, exactly as they apply at the document root.

So a component rendered inside the provider **without an explicit prop** now resolves that prop from the sub-tree's brand, not the ambient document brand. This makes props-first theming work in a scoped sub-tree — the whole point of authoring a theme "props first, CSS last".

```vue
<template>
    <!-- Document brand = "cartoon" (bold, outlined).                     -->
    <!-- Inside: brand "material" defaults apply — this btn is elevated,  -->
    <!-- pill-rounded, WITHOUT passing any prop.                          -->
    <OrigamThemeProvider theme="material">
        <OrigamBtn>Material default look</OrigamBtn>
    </OrigamThemeProvider>
</template>
```

An explicit prop on the child always wins over the sub-tree default. `theme="auto"` leaves the inherited defaults untouched (no override). The mechanism relies on the resolver `createOrigam` provides under `ORIGAM_THEME_DEFAULTS_KEY`; used outside a `createOrigam` app, the provider silently falls back to CSS-var re-scoping only.

## CSS behaviour

The component sets `display: contents` by default, so it is visually transparent — it does not introduce an extra layout box. Style the wrapper via `class` or `style` props when layout is needed.

## Multi-theme patterns

```vue
<template>
    <!-- Page follows the document mode; banner is pinned dark -->
    <OrigamThemeProvider mode="dark">
        <MarketingBanner />
    </OrigamThemeProvider>

    <!-- Brand sub-section, mode inherited -->
    <OrigamThemeProvider theme="brand-acme">
        <HeroSection />
    </OrigamThemeProvider>

    <!-- Brand + mode pinned together -->
    <OrigamThemeProvider theme="brand-acme" mode="light">
        <Pricing />
    </OrigamThemeProvider>
</template>
```
