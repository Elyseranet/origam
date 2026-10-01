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
| `lang`    | `'auto' \| 'fr' \| 'en' \| 'es' \| 'de'`                              | `'auto'`       | Locale for the decorative quote glyph (only consumed when `quoteMark` is on).           |
| `quoteMark` | `boolean`                                                           | `false`        | Mounts the oversized decorative opening glyph as a background watermark. Set to `true` by the `quoted` preset — and usable on **any** variant. See [A variant is a props preset](#a-variant-is-a-props-preset-not-css). |
| `align`   | `'left' \| 'center' \| 'right'`                                        | `'left'`       | `'left'` is the no-variant floor; the `pull` preset raises it to `'center'`, and an `align` written at the call site beats both. |
| `color`   | `TColor` (`TIntent` \| custom)                                         | `text-primary` | Colour of the citation **text** — body **and source**. An intent resolves to its readable-on-light shade (`fgSubtle`); a custom value is applied verbatim. The source keeps its subdued default when `color` is empty. |
| `accentColor` | `TColor` (`TIntent` \| custom)                                     | `primary`      | **Accent** colour — drives the accent bar / pull rules ("borders"), the background quote glyph and the author label. Does **not** paint a surface fill (the blockquote stays transparent). See [Colour model](#colour-model). |
| `bgColor` | `TColor` (`TIntent` \| custom)                                         | `undefined`    | **Deprecated** — alias for `accentColor` (kept for backward compat, warns once, removed in v3.0.0). Ignored when `accentColor` is also set. |
| `rounded` / `elevation` / `border` (+ `borderColor`, `borderStyle`) / `padding` / `margin` | Commons surfaces | `undefined` | Standard cross-cutting props, consumed via the matching composables (`useRounded`, `useElevation`, `useBorder`, `usePadding`, `useMargin`). |
| `fontFamily`  | `'sans' \| 'mono' \| 'serif'`                                       | per-variant    | Overrides `--origam-blockquote---font-family` with the matching primitive token. Set by the `elegant` and `pull` presets; leave unset to let the theme drive it. |
| `fontSize`    | `'xs' \| 'sm' \| 'md' \| 'lg' \| 'xl' \| '2xl' \| '3xl' \| '4xl' \| '5xl'` | per-variant | Overrides `--origam-blockquote---font-size` with the matching primitive token. Set by the `elegant`, `minimal` and `pull` presets. |
| `fontWeight`  | `'regular' \| 'medium' \| 'semibold' \| 'bold' \| 'extrabold' \| 'black'` | per-variant | Overrides `--origam-blockquote---font-weight` with the matching primitive token. Set by the `pull` preset. |
| `lineHeight`  | `'none' \| 'tight' \| 'snug' \| 'normal' \| 'relaxed' \| 'loose'` | per-variant    | Overrides `--origam-blockquote---line-height` with the matching primitive token. Set by the `elegant` and `pull` presets. |
| `fontStyle`   | `string` (CSS keyword)                                              | per-variant    | Emitted verbatim into `--origam-blockquote---font-style`. Set by the `elegant` and `minimal` presets (`italic`). |
| `letterSpacing` | `'tight' \| 'normal' \| 'wide' \| 'wider' \| 'widest'`            | `undefined`    | Overrides `--origam-blockquote---letter-spacing` with the matching primitive token.   |
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
| `quoted`  | Single oversized opening glyph rendered as a background watermark (absolute, behind the text). Locale-aware glyph — see [I18n quotes](#i18n-quotes). A shorthand for `quote-mark` plus the top padding that makes room for it. |
| `minimal` | Bare italic with a small inline indent + a thin left accent bar. Inline citations inside technical documentation where the visual should stay quiet. |
| `pull`    | Pull quote — large body type, top + bottom rules, centred by default. Use sparingly (one per article maximum).                    |

## A variant is a props preset, not CSS

Since **ADR-005 D7** (lot #1015), a `variant` value is **a named bundle of
props**, not a block of SCSS. `.origam-blockquote--variant-{name}` is still
emitted on the root, but the DS attaches **no rule to it** — the class
belongs to you, as an override hook.

### Precedence, strongest to weakest

1. a prop written **at the call site**
2. a `theme.components['origam-blockquote']` default
3. a `theme.components.global` default
4. **the variant preset** *(the table below)*
5. the component's own `withDefaults` floor

So a variant is a **convenience, never an identity the DS defends**:
`<origam-blockquote variant="pull" align="left">` really is left-aligned,
and `<origam-blockquote variant="elegant" font-size="sm">` really is small.

> ⚠️ **That second example used to be broken.** Before this conversion the
> `elegant` / `minimal` / `pull` rules declared `font-size`, `font-family`,
> `font-weight` and `line-height` *directly*, at the same specificity as the
> base rule and later in source order — while `fontSize` & co. only write the
> custom property the base rule consumes. The five typography props were
> therefore **live on `default` and `quoted` and silently dead on the other
> three**. Measured in Chromium: `variant="elegant" font-size="sm"` rendered
> `18px`, exactly like a bare `variant="elegant"`.

> ⚠️ **The preset needs the plugin.** The precedence chain is resolved by the
> props resolver that `createOrigam()` installs. A consumer importing the
> component without installing the plugin gets the bare `withDefaults`
> floor — so `pull` is no longer centred, and no variant paints its accent
> bar. This is a deliberate break: install the plugin.

### The table, verbatim

A dash means *the preset sets nothing* — the component default applies.
`BLOCKQUOTE_VARIANT_PRESETS` lives in
`packages/ds/src/consts/Blockquote/blockquote.const.ts`.

| Prop | `default` | `elegant` | `quoted` | `minimal` | `pull` |
|---|---|---|---|---|---|
| `fontFamily` | — | `serif` | — | — | `serif` |
| `fontSize` | — | `xl` | — | `md` | `3xl` |
| `fontWeight` | — | — | — | — | `medium` |
| `lineHeight` | — | `loose` | — | — | `snug` |
| `fontStyle` | — | `var(--origam-blockquote__elegant---font-style, italic)` | — | `var(--origam-blockquote__minimal---font-style, italic)` | — |
| `align` | — | — | — | — | `center` |
| `quoteMark` | — | — | `true` | — | — |
| `paddingBlock` | — | `var(--origam-blockquote__elegant---padding-block, 24px)` | — | `0` | `var(--origam-blockquote__pull---padding-block, 24px)` |
| `paddingInline` | — | — | — | `var(--origam-blockquote__minimal---padding-inline, 12px)` | — |
| `paddingTop` | — | — | `calc(var(--origam-blockquote---padding-block, 16px) + var(--origam-blockquote--quoted---glyph-padding-extra, 1rem))` | — | — |
| `paddingInlineStart` | `calc(var(--origam-blockquote---padding-inline, 24px) + var(--origam-blockquote__accent---width, 4px))` | *same as `default`* | — | `calc(var(--origam-blockquote__minimal---padding-inline, 12px) + var(--origam-blockquote--minimal---accent-width, 2px))` | — |
| `borderInlineStart` | `var(--origam-blockquote__accent---width, 4px) solid var(--origam-blockquote---resolved-accent-color, currentColor)` | *same as `default`* | — | `var(--origam-blockquote--minimal---accent-width, 2px) solid var(--origam-blockquote---resolved-accent-color, currentColor)` | — |
| `borderBlock` | — | — | — | — | `var(--origam-blockquote__pull---rule-width, 2px) solid var(--origam-blockquote---resolved-accent-color, currentColor)` |

Each value carries the **exact `var()` chain the deleted CSS rule carried**,
so the `--origam-blockquote*` token channel a brand theme overrides still
reaches every variant. The only exceptions are the five typography props:
`useTypography` wraps its value into `var(--origam-font__{group}---{value})`
and has no custom-value escape hatch (tracked as **#1018**), so those carry a
semantic rung instead. That costs nothing here — each variant token it
replaced was a byte-for-byte alias of the very rung now written in its
place, and no theme read one.

### Overriding a variant globally

A theme can replace any cell of the table through `IOrigamTheme.variants`,
which merges prop-by-prop over the shipped table:

```ts
createOrigam({
    themes: [{
        name: 'editorial',
        variants: {
            'origam-blockquote': {
                elegant: { fontSize: '2xl' }   // only this cell changes
            }
        }
    }]
})
```

### Known token gap

`minimal`'s accent width reads
`--origam-blockquote--minimal---accent-width`, which **no stylesheet
declares** — the grammar diverges (`--minimal---` where the rest of the
component writes `__minimal---`), so `minimal` always falls back to `2px`.
The preset carries the string verbatim rather than silently changing the
rendered width. Tracked as **#1014**.

## I18n quotes

`quote-mark` renders only the **opening glyph** as a large background
watermark — the closing glyph is not rendered. The `quoted` variant simply
turns that prop on, so the glyph is reachable on **any** variant
(`<origam-blockquote variant="pull" quote-mark>`), which the old SCSS model
made impossible. The glyph is pulled from `QUOTE_MARKS_BY_LANG` using the
`lang` prop:

| `lang` | Open glyph | Notes                                                                                            |
|--------|-----------|--------------------------------------------------------------------------------------------------|
| `fr`   | `«`       | French guillemet (left).                                                                         |
| `en`   | `”`       | Curly left double quote (Smart Quote).                                                           |
| `es`   | `«`       | Spanish angular quote. Kept distinct from `fr` so future locale-specific tweaks branch cleanly. |
| `de`   | `„`       | German low-9 opening quote.                                                                      |
| `auto` | —         | Reads `document.documentElement.lang` at mount; falls back to `'en'`.                           |

The glyph is positioned `absolute` in the top-left corner of the blockquote
(which is `position: relative`), behind the body text (`z-index: 0` vs
`z-index: 1` for content). That stacking is applied by two **sibling**
selectors keyed on the glyph itself —
`.origam-blockquote__mark--bg + .origam-blockquote__body` and
`.origam-blockquote__mark--bg ~ .origam-blockquote__attribution` — so it
engages exactly when there is something to sit in front of, and leaves the
other variants untouched. Its size is controlled by the token
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

<!-- a variant is a props preset: any cell of it can be beaten -->
<origam-blockquote
        variant="pull"
        align="left"
        font-size="xl"
>
    A left-aligned pull quote, two rungs quieter than the preset.
</origam-blockquote>

<!-- the glyph is a prop, so it composes with any variant -->
<origam-blockquote
        variant="minimal"
        quote-mark
        lang="de"
>
    Der Mensch ist, was er isst.
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
