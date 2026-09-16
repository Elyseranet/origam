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

`fontFamily` was removed from `ICardHeaderProps` (issue #501) — neither SCSS
surface has a `font-family` rule, and `fontFamily` is a project-level setting
configured once on `OrigamApp`, not a per-instance override.

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

## Accessible name of a clickable prepend / append zone (#747)

Attaching `@click:prepend` / `@click:append` makes the corresponding zone
actionable. For it to be a **real** control — announced, focusable, operable
by keyboard — it also needs a name, and only you can supply one: the zone's
default content is an avatar or an icon, i.e. nothing a screen reader can
read.

| Prop | Type | Description |
|---|---|---|
| `prependAriaLabel` | `string` | Accessible name of the prepend zone. i18n key or literal string. |
| `appendAriaLabel` | `string` | Accessible name of the append zone. Same contract. |

```vue
<template>
    <origam-card>
        <origam-card-header
            title="Ada Lovelace"
            prepend-avatar="/ada.png"
            prepend-aria-label="Open the author profile"
            @click:prepend="openProfile"
        />
    </origam-card>
</template>
```

⛔ **Without the label the zone is NOT promoted.** No `role="button"`, no
`tabindex`, and a dev-time warning naming the prop to add. The `@click:prepend`
emit still fires on mouse, exactly as before — what disappears is an ARIA
claim the DS could not back.

This is deliberate. `role="button"` with no accessible name is a WCAG 2.1
**4.1.2** (level A) failure; measured with axe-core on untouched `develop`,
this pattern produced **54 `aria-command-name` nodes (impact `serious`) across
17 components**. No default label is fabricated — a generic "Prepend action"
would silence the audit while telling a screen-reader user nothing. The value
is resolved through the locale adapter, so both an i18n key
(`prepend-aria-label="origam.close"`) and a literal string work, exactly like
the existing `closeLabel` on Alert / Chip / Dialog.

The same contract applies to every component that renders an adjacent zone:
Alert, Badge, BreadcrumbItem, Card, Chip, ConfirmWrapper, DataText, DataTitle,
DatePickerHeader, ExpansionPanelHeader, Input, ListItem — and, on the INNER
zone, `OrigamField` and the whole field family via
`prependInnerAriaLabel` / `appendInnerAriaLabel`.
