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
| `variant` | `'default' \| 'elegant' \| 'quoted' \| 'minimal' \| 'pull'`            | `'default'`    | Visual treatment. See [Variants](#variants).                                           |
| `author`  | `string`                                                               | `undefined`    | Author. Rendered after the body as `— Author`. Override via `#author` slot.            |
| `source`  | `string`                                                               | `undefined`    | Source label. Rendered after `author` as `, Source`. Override via `#source` slot.     |
| `cite`    | `string`                                                               | `undefined`    | URL the citation references. Maps to the HTML `cite` attribute.                        |
| `lang`    | `'auto' \| 'fr' \| 'en' \| 'es' \| 'de'`                              | `'auto'`       | Locale for decorative quote marks (only consumed by `variant="quoted"`).               |
| `align`   | `'left' \| 'center' \| 'right'`                                        | per-variant    | `'pull'` defaults to `'center'`; every other variant defaults to `'left'`.             |
| `color`   | `TColor` (`TIntent` \| custom)                                         | `text-primary` | Colour of the citation **text** — body **and source**. An intent resolves to its readable-on-light shade (`fgSubtle`); a custom value is applied verbatim. The source keeps its subdued default when `color` is empty. |
| `accentColor` | `TColor` (`TIntent` \| custom)                                     | `primary`      | **Accent** colour — drives the accent bar / pull rules ("borders"), the background quote glyph and the author label. Does **not** paint a surface fill (the blockquote stays transparent). See [Colour model](#colour-model). |
| `bgColor` | `TColor` (`TIntent` \| custom)                                         | `undefined`    | **Deprecated** — alias for `accentColor` (kept for backward compat, warns once, removed in v3.0.0). Ignored when `accentColor` is also set. |
| `rounded` / `elevation` / `border` (+ `borderColor`, `borderStyle`) / `padding` / `margin` | Commons surfaces | `undefined` | Standard cross-cutting props, consumed via the matching composables (`useRounded`, `useElevation`, `useBorder`, `usePadding`, `useMargin`). |
| `fontFamily`  | `'sans' \| 'mono' \| 'serif'`                                       | `undefined`    | Overrides `--origam-blockquote---font-family` with the matching primitive token. Leave unset to let the theme or variant drive the font family. |
| `fontSize`    | `'xs' \| 'sm' \| 'md' \| 'lg' \| 'xl' \| '2xl' \| '3xl' \| '4xl' \| '5xl'` | `undefined` | Overrides `--origam-blockquote---font-size` with the matching primitive token.    |
| `fontWeight`  | `'regular' \| 'medium' \| 'semibold' \| 'bold' \| 'extrabold' \| 'black'` | `undefined` | Overrides `--origam-blockquote---font-weight` with the matching primitive token. |
| `lineHeight`  | `'none' \| 'tight' \| 'snug' \| 'normal' \| 'relaxed' \| 'loose'` | `undefined`    | Overrides `--origam-blockquote---line-height` with the matching primitive token.      |
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

| Variant   | When to reach for it                                                                                                               |
|-----------|------------------------------------------------------------------------------------------------------------------------------------|
| `default` | Left accent bar, comfortable padding. Neutral rhythm, fits most prose contexts.                                                    |
| `elegant` | Serif italic with extra breathing room + a left accent bar. Editorial long-form content (essays, articles, hero quotes inside marketing pages). |
| `quoted`  | Single oversized opening glyph rendered as a background watermark (absolute, behind the text). Locale-aware glyph — see [I18n quotes](#i18n-quotes). |
| `minimal` | Bare italic with a small inline indent + a thin left accent bar. Inline citations inside technical documentation where the visual should stay quiet. |
| `pull`    | Pull quote — large body type, top + bottom rules, centred by default. Use sparingly (one per article maximum).                    |

Each variant materialises through a `.origam-blockquote--variant-{name}`
modifier class that swaps token overrides in the SCSS layer; consumers
can theme any of them via `tokens/component/blockquote.json`.

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
