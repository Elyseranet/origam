# OrigamBlockquote

A typographic component for long citations. Wraps the native
`<blockquote>` element with five visual variants, optional author /
source attribution, and locale-aware decorative quote marks.

```vue
<template>
    <origam-blockquote
            variant="default"
            author="Linus Torvalds"
            source="LKML, 2003"
            cite="https://lkml.org/lkml/2003/8/26/142"
    >
        Talk is cheap. Show me the code.
    </origam-blockquote>
</template>
```

## Colour model

The blockquote exposes **two independent colour axes** that are meant to
contrast with each other:

- **`color`** paints the **citation text** — both the body **and the
  source** label. Default `text-primary` (body) / `text-secondary`
  (source). An intent resolves to its readable shade (`fgSubtle`); when
  `color` is left empty the source keeps its subdued default.
- **`accentColor`** paints the **accent**: the decorative bar / pull rules
  (the "borders"), the big background quote glyph (`variant="quoted"`) and
  the author label. Default `primary`. It does **not** fill the surface —
  the blockquote stays transparent.

```vue
<!-- dark body text, success-green accent bar + author -->
<origam-blockquote color="neutral" accent-color="success" author="…">…</origam-blockquote>
```

> **`bgColor` is deprecated on `OrigamBlockquote`** — renamed to
> `accentColor` (see `ROADMAP.md`, "Renommer `bgColor` → `accentColor`").
> `bgColor` keeps working as an alias (`accentColor` wins when both are
> set) and logs a console warning once. Removal targeted for **v3.0.0**.
> `bgColor` stays the canonical, non-deprecated name everywhere else in
> the DS (Btn, Card, Chip, Badge, Alert, Pagination, …), where it paints a
> real surface fill — `accentColor` is reserved for accent-only
> components.

## Props

| Prop      | Type                                                                   | Default        | Notes                                                                                  |
|-----------|------------------------------------------------------------------------|----------------|----------------------------------------------------------------------------------------|
| `variant` | `'default' \| 'elegant' \| 'quoted' \| 'minimal' \| 'pull'`            | `'default'`    | **Props preset** (ADR-005), resolved via `useDefaults`. See [Variants](#variants).      |
| `author`  | `string`                                                               | `undefined`    | Author. Rendered after the body as `— Author`. Override via `#author` slot.            |
| `source`  | `string`                                                               | `undefined`    | Source label. Rendered after `author` as `, Source`. Override via `#source` slot.     |
| `cite`    | `string`                                                               | `undefined`    | URL the citation references. Maps to the HTML `cite` attribute.                        |
| `lang`    | `'auto' \| 'fr' \| 'en' \| 'es' \| 'de'`                              | `'auto'`       | Locale for decorative quote marks (only consumed by `variant="quoted"`).               |
| `align`   | `'left' \| 'center' \| 'right'`                                        | per-variant    | `'pull'` defaults to `'center'`; every other variant defaults to `'left'`. Derived component logic, NOT part of the `variant` preset table (a preset can't express "default to another prop's value").             |
| `color`   | `TColor` (`TIntent` \| custom)                                         | `text-primary` | Colour of the citation **text** — body **and source**. An intent resolves to its readable-on-light shade (`fgSubtle`); a custom value is applied verbatim. The source keeps its subdued default when `color` is empty. |
| `accentColor` | `TColor` (`TIntent` \| custom)                                     | `primary`      | **Accent** colour — drives the accent bar / pull rules ("borders"), the background quote glyph and the author label. Does **not** paint a surface fill (the blockquote stays transparent). Independent of `variant` — never part of the preset table. See [Colour model](#colour-model). |
| `bgColor` | `TColor` (`TIntent` \| custom)                                         | `undefined`    | **Deprecated** — alias for `accentColor` (kept for backward compat, warns once, removed in v3.0.0). Ignored when `accentColor` is also set. |
| `rounded` / `elevation` | Commons surfaces | `undefined` | Standard cross-cutting props, consumed via `useRounded` / `useElevation`. Not touched by the `variant` preset. |
| `border` / `borderColor` / `borderStyle` | Commons surface | `undefined` | **Preset by `variant`** for `default` / `elegant` / `minimal` / `pull` (see the preset table below) — an explicit value always wins (weakest tier). |
| `padding` | Commons surface | `undefined` | **Preset by `variant`** for every value (see the preset table below) — an explicit value always wins. |
| `margin`  | Commons surface | `undefined` | Standard cross-cutting prop, consumed via `useMargin`. Not touched by the `variant` preset. |
| `fontFamily`  | `'sans' \| 'mono' \| 'serif'`                                       | `undefined`    | Overrides `--origam-blockquote---font-family` with the matching primitive token. **Preset by `variant`** for `elegant` / `pull` (`serif`). |
| `fontSize`    | `'xs' \| 'sm' \| 'md' \| 'lg' \| 'xl' \| '2xl' \| '3xl' \| '4xl' \| '5xl'` | `undefined` | Overrides `--origam-blockquote---font-size` with the matching primitive token. **Preset by `variant`** for `elegant` (`xl`) / `minimal` (`md`) / `pull` (`3xl`). |
| `fontStyle`   | `'normal' \| 'italic' \| 'oblique'`                                 | `undefined`    | Overrides `--origam-blockquote---font-style` with the literal keyword (no primitive-token ramp — see `ITypographyProps`). **Preset by `variant`** for `elegant` / `minimal` (`italic`). Added for this ticket — see [Variants](#variants).|
| `fontWeight`  | `'regular' \| 'medium' \| 'semibold' \| 'bold' \| 'extrabold' \| 'black'` | `undefined` | Overrides `--origam-blockquote---font-weight` with the matching primitive token. **Preset by `variant`** for `pull` (`medium`). |
| `lineHeight`  | `'none' \| 'tight' \| 'snug' \| 'normal' \| 'relaxed' \| 'loose'` | `undefined`    | Overrides `--origam-blockquote---line-height` with the matching primitive token. **Preset by `variant`** for `elegant` (`loose`) / `pull` (`snug`). |
| `tag`     | `string`                                                               | `'blockquote'` | Tag rendered for the root. Use `'div'` if you need to nest a blockquote inside one.    |

## Slots

| Slot        | Purpose                                                                              |
|-------------|--------------------------------------------------------------------------------------|
| `default`   | The citation body. Required.                                                         |
| `author`    | Custom author rendering — takes priority over the `author` prop when provided.       |
| `source`    | Custom source rendering — takes priority over the `source` prop when provided.       |

When `cite` is set, the prop value lands on the HTML `cite` attribute
of the rendered element (visible to assistive tech, not painted).

## Variants

`variant` is a **props preset** (ADR-005 — `variant` = preconfiguration of
props, not a CSS layer), resolved through the exact same mechanism a theme
uses to declare default props: `useDefaults`. Setting `variant` does **not**
inject any CSS — it pre-fills `border` / `borderColor` / `padding` /
`fontFamily` / `fontSize` / `fontStyle` / `fontWeight` / `lineHeight` with
the values below, which you can still override individually.

| Value | When to reach for it | `border` | `padding` | Typography |
|---|---|---|---|---|
| `default` | Left accent bar, comfortable padding. Neutral rhythm, fits most prose contexts. | `0px 4px 0px 0px` (4px accent bar, inline-start only) | `16px 28px 16px 24px` | — (theme default) |
| `elegant` | Serif italic with extra breathing room + a left accent bar. Editorial long-form content (essays, articles, hero quotes inside marketing pages). | `0px 4px 0px 0px` | `24px 28px 24px 24px` | `fontFamily: 'serif'`, `fontSize: 'xl'`, `fontStyle: 'italic'`, `lineHeight: 'loose'` |
| `quoted`  | Single oversized opening glyph rendered as a background watermark (absolute, behind the text). Locale-aware glyph — see [I18n quotes](#i18n-quotes). | — (no accent bar) | `32px 24px 16px 24px` (extra top padding clears the glyph) | — |
| `minimal` | Bare italic with a small inline indent + a thin left accent bar. Inline citations inside technical documentation where the visual should stay quiet. | `0px 2px 0px 0px` | `0px 14px 0px 12px` | `fontSize: 'md'`, `fontStyle: 'italic'` |
| `pull`    | Pull quote — large body type, top + bottom rules, centred by default. Use sparingly (one per article maximum). | `2px 0px` (block rules top + bottom, no inline border) | `24px` | `fontFamily: 'serif'`, `fontSize: '3xl'`, `fontWeight: 'medium'`, `lineHeight: 'snug'` |

Every `border` entry (except `quoted`, which has none) also sets
`borderColor: 'var(--origam-blockquote---resolved-accent-color)'` — a
pointer into the SAME CSS custom property the `accentColor` / `bgColor`
axis already resolves, so the accent bar keeps tracking the accent colour
regardless of which tier supplied it. The `padding` values are the
4-value logical shorthand (`formatPaddingStylesVar` — "Haut/Gauche/Bas/
Droite" grouped by axis: `block-start inline-start block-end inline-end`),
and `border` uses the equivalent logical shorthand for width-only sides.

```vue
<template>
    <origam-blockquote text="…" variant="default" />
    <origam-blockquote text="…" variant="elegant" />
    <origam-blockquote text="…" variant="quoted" />
    <origam-blockquote text="…" variant="minimal" />
    <origam-blockquote text="…" variant="pull" />
</template>
```

### Resolution order — the preset is the WEAKEST tier

```
prop at the call site  >  theme default  >  variant preset  >  component default
```

A prop you set explicitly, or a theme default targeting `origam-blockquote`,
**always** beats the preset — the preset only fills in what nothing
stronger already decided:

```vue
<template>
    <!-- Border becomes 16px inline-start. `border` is a call-site prop; it
         outranks whatever `default` would otherwise have preset. Padding
         and borderColor still come from the preset — only `border` was
         overridden. -->
    <origam-blockquote variant="default" border="0px 16px 0px 0px">…</origam-blockquote>

    <!-- The accent axis is INDEPENDENT of the preset table (it was never
         part of it, even before ADR-005) — this already painted `primary`
         pre-migration too. -->
    <origam-blockquote variant="elegant" bg-color="primary">…</origam-blockquote>
</template>
```

The `origam-blockquote--variant-{value}` class is still applied to the root
element — it carries **zero** rules from the DS. It exists purely as a CSS
hook for consumer overrides (`.origam-blockquote--variant-elegant { ... }`
in your own stylesheet).

### Theme-level override

A theme can redefine what a variant means (or add a new named one) via
`IOrigamTheme.variants` — same shape as the table above, merged over the
DS-shipped one:

```ts
createOrigam({
    themes: [{
        name: 'brand-x',
        variants: {
            'origam-blockquote': {
                elegant: { border: '0px 6px 0px 0px', fontFamily: 'sans' }
            }
        }
    }]
})
```

### What did NOT convert to a preset

- **`quoted`'s decorative glyph + the `z-index` stacking that keeps
  `__body` / `__attribution` readable above it.** A props preset only
  configures the root component; it has no reach into nested BEM children
  (`.origam-blockquote__mark--bg`, `__body`, `__attribution`), and no
  `zIndex` prop exists on Commons. Kept as component CSS keyed off a
  structural `origam-blockquote--has-quote-mark` class (driven by
  `variant === 'quoted'`), not the variant class — so it doesn't ship a
  rule on `--variant-*` (which the DS's CI guard forbids).
- **`pull`'s default `align: 'center'`.** Computed from the resolved
  `variant` in the component (`effectiveAlign`), not a static value a flat
  preset entry can hold — an explicit `align` prop must keep winning
  regardless of which tier supplied `variant`. Unchanged component logic.

### `fontStyle` — a new Commons prop

`elegant` / `minimal` need `font-style: italic` and no `ITypographyProps`
member covered it before this ticket — the same class of gap ADR-005
found on `OrigamBtn` (`opacity`, `backdrop-filter`). `fontStyle` was added
to `ITypographyProps` / `useTypography` (literal keyword, no primitive
token ramp) rather than kept as a bespoke `--variant-*` CSS survivor —
consistent with the ADR's own arbitration on those Btn gaps. It is
therefore available on every component that extends `ITypographyProps`,
not just Blockquote.

## I18n quotes

The `quoted` variant renders only the **opening glyph** as a large
background watermark — the closing glyph is not rendered. The opening
glyph is pulled from `QUOTE_MARKS_BY_LANG` using the `lang` prop:

| `lang` | Open glyph | Notes                                                                                            |
|--------|-----------|--------------------------------------------------------------------------------------------------|
| `fr`   | `«`       | French guillemet (left).                                                                         |
| `en`   | `”`       | Curly left double quote (Smart Quote).                                                           |
| `es`   | `«`       | Spanish angular quote. Kept distinct from `fr` so future locale-specific tweaks branch cleanly. |
| `de`   | `„`       | German low-9 opening quote.                                                                      |
| `auto` | —         | Reads `document.documentElement.lang` at mount; falls back to `'en'`.                           |

The glyph is positioned `absolute` in the top-left corner of the blockquote
(which is `position: relative`), behind the body text (`z-index: 0` vs
`z-index: 1` for content). Its size is controlled by the token
`--origam-blockquote--quoted---glyph-size` (default `8rem`) and its
opacity by `--origam-blockquote--quoted---glyph-opacity` (default `0.08`).
Both can be overridden via CSS custom properties.

The `auto` resolution runs in `onMounted` to stay SSR-safe. The SSR
output emits the `'en'` glyph by default; the client swaps after
hydration if the document declares a different language. The glyph
swap is visually unobtrusive — no layout shift.

## Examples

```vue
<origam-blockquote
        variant="elegant"
        author="Antoine de Saint-Exupéry"
        source="Terre des Hommes"
>
    La perfection est atteinte, non pas lorsqu'il n'y a plus rien à
    ajouter, mais lorsqu'il n'y a plus rien à retirer.
</origam-blockquote>

<origam-blockquote
        variant="quoted"
        lang="fr"
        author="René Descartes"
        source="Discours de la méthode, 1637"
>
    Je pense, donc je suis.
</origam-blockquote>

<origam-blockquote
        variant="pull"
        accent-color="primary"
>
    The best way to predict the future is to invent it.
</origam-blockquote>

<origam-blockquote
        variant="default"
        cite="https://news.stanford.edu/2005/06/14/jobs-061505/"
>
    Stay hungry. Stay foolish.

    <template #author>
        <a href="/people/steve-jobs">Steve Jobs</a>
    </template>
</origam-blockquote>
```

## Accessibility

- The default `tag` is the native `<blockquote>` element, which already
  conveys the correct semantic to assistive tech. Switch to `'div'` only
  when you need to nest a blockquote inside another (HTML disallows
  direct nesting in strict parsers).
- `cite="URL"` lands on the rendered element verbatim. Browsers don't
  paint it but expose it to assistive tools and to user-agent
  inspectors. Use a fully-qualified URL.
- The attribution `<footer>` wraps the source in a `<cite>` element when
  rendered — that's the W3C-recommended pattern for the source label of
  a quotation.
- Decorative quote marks carry `aria-hidden="true"` so screen readers
  don't announce the glyphs twice (they already get the semantic from
  the `<blockquote>` element itself).
- The `lang` prop determines visual glyphs only; if you need the
  consuming text to declare a locale to screen readers, set the `lang`
  attribute on the rendered element via your own bindings.

## Related

- `OrigamCode` — typography component for code
  blocks. Use `OrigamCode` for code, `OrigamBlockquote` for prose
  citations.
