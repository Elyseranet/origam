# OrigamSection

> ⚠️ **WIP — placeholder component.** The current source is a stub
> (`<div class="origam-section" />`). The API surface will land in a
> follow-up; this page documents the planned shape and is updated in
> lockstep with the implementation.

`<OrigamSection>` is the canonical wrapper for a logical region of a
page (a hero, a feature block, a CTA, …). Once finished it will pair
nicely with `<OrigamContainer>` for the outer max-width and
`<OrigamRow>` / `<OrigamCol>` for the inner grid.

## Basic usage (planned)

```vue
<template>
    <OrigamSection>
        <OrigamContainer>
            <OrigamRow>
                <OrigamCol cols="12">Hero content</OrigamCol>
            </OrigamRow>
        </OrigamContainer>
    </OrigamSection>
</template>
```

## Slots (planned)

| Slot | Slot props | Description |
|---|---|---|
| `default` | — | Section content. |

## Props (current)

```ts
// No props are exposed today. The component renders a single
// <div class="origam-section" />.
interface ISectionProps {}
```

## Anatomy (current)

```html
<div class="origam-section"></div>
```

## Design tokens consumed

`<OrigamSection>` reads from `tokens/component/section.json` once
finalised. No component-level CSS variables are emitted in the current
stub.

## Accessibility (planned)

- Will render a `<section>` element by default. Provide an
  `aria-labelledby` or `aria-label` whenever the section has no visible
  heading inside it.

## Theming notes

- The component will be theme-aware once it lands. Switching
  `<html data-theme="…">` will re-resolve every variable instantly.

## Related

- `OrigamContainer` — outer wrapper with breakpoint-aware max-width.
- `OrigamMain` — application-level main slot.
