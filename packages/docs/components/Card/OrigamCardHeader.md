# OrigamCardHeader

`<OrigamCardHeader>` renders the top area of a `<OrigamCard>` — a grid-based
row containing optional prepend/append icons or avatars, a title line, and a
subtitle line. It is pre-wired as `tag="OrigamToolbar"` and suppresses
toolbar-inherited box-shadow and background so the parent Card's elevation and
intent paint correctly.

## Basic usage

```vue
<template>
    <origam-card>
        <origam-card-header
            title="Card Title"
            subtitle="Optional subtitle"
            prepend-icon="mdi-account"
        />
    </origam-card>
</template>
```

## Typography — dual-surface

A single set of `ITypographyProps` drives **both** text surfaces at once: every
typography prop you pass is forwarded to `.origam-card-header__title` AND
`.origam-card-header__subtitle` via two `useTypography` calls
(`card-header__title` / `card-header__subtitle` varPrefixes).

| Prop | Type | Token group | SCSS surfaces |
|---|---|---|---|
| `fontSize` | `TFontSize` | `--origam-font__size---*` | title + subtitle |
| `fontWeight` | `TFontWeight` | `--origam-font__weight---*` | title + subtitle |
| `lineHeight` | `TLineHeight` | `--origam-font__lineHeight---*` | title + subtitle |
| `letterSpacing` | `TLetterSpacing` | `--origam-font__letterSpacing---*` | title + subtitle |

`fontFamily` is part of `ITypographyProps` (type-checks fine) but neither
SCSS surface has a `font-family` rule, so it has no visual effect at this time.

```vue
<template>
    <origam-card>
        <origam-card-header
            title="ORIGAM"
            subtitle="Design System"
            font-size="2xl"
            font-weight="bold"
            line-height="tight"
        />
    </origam-card>
</template>
```

## Slots

| Slot | Description |
|---|---|
| `default` | Inserted inside `.origam-card-header__content` after title and subtitle. |
| `prepend` | Replaces the prepend area (avatar / icon). |
| `append` | Replaces the append area. |
| `title` | Replaces the default title text. Receives `{ title }`. |
| `subtitle` | Replaces the default subtitle text. Receives `{ subtitle }`. |
| `wrapper` | Full override of the header content grid (removes prepend/append/title/subtitle). |

## Emits

| Event | Payload | Description |
|---|---|---|
| `click:prepend` | `MouseEvent` | Fired when the prepend area is clicked. |
| `click:append` | `MouseEvent` | Fired when the append area is clicked. |
