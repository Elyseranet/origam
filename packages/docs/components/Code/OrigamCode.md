# OrigamCode

`<OrigamCode>` renders a block of source code with (optional) shiki-powered
syntax highlighting, optional line numbers, line highlighting, a copy button and
automatic theme integration with the origam design system.

## Syntax highlighting requires `shiki` (optional peer dependency)

`shiki` is an **optional peer dependency** of origam — it is _not_ pulled in by
default (it is heavy: WASM grammars + themes). Install it in your app to enable
syntax colouring:

```bash
pnpm add shiki
```

When `shiki` is present, `OrigamCode` lazy-loads it on first render and paints
dual-theme (`--shiki-light` / `--shiki-dark`) tokens. When it is **absent** (or
cannot be loaded — e.g. a purely static bundle with no module resolver),
`OrigamCode` degrades gracefully to **plain, un-highlighted rows**: line numbers,
line-highlighting, the copy button and layout all keep working — only the colours
are missing. A one-time console warning points to this section.

## Quick start

### Via the `code` prop

```vue
<template>
    <OrigamCode lang="ts" :code="snippet" line-numbers/>
</template>

<script setup lang="ts">
    const snippet = `const x = 42`
</script>
```

### Via the default slot (multi-line snippets read better here)

```vue
<template>
    <OrigamCode lang="vue" filename="App.vue" line-numbers>
&lt;template&gt;
  &lt;h1&gt;Hello&lt;/h1&gt;
&lt;/template&gt;
    </OrigamCode>
</template>
```

> The prop wins when both are provided. The slot path strips leading /
> trailing blank lines so authors don't have to worry about indentation.

## Props

| Prop | Type | Default | Description |
|---|---|---|---|
| `code` | `string` | `undefined` | Source code. Falls back to the default slot when omitted. |
| `lang` | `TCodeLang` | `'plaintext'` | Grammar to apply. Unknown values fall back to `plaintext` with a one-shot console warning. |
| `lineNumbers` | `boolean` | `false` | Show a left gutter with line numbers (pure CSS counter). |
| `highlightLines` | `number[] \| string \| null` | `null` | Lines to highlight. Accepts an array (`[2, 5]`) or a range string (`'2,5-7'`). |
| `copyable` | `boolean` | `true` | Show the copy-to-clipboard button. In non-compact mode it always renders a header bar so the button sits next to the filename (or the language badge when no filename is set) — never floating over the code. |
| `maxHeight` | `number \| string \| null` | `null` | Cap the rendered height and enable vertical scroll past it. |
| `format` | `boolean` | `false` | **Stub in v2.x.** Currently normalises whitespace only. Prettier is intentionally not bundled at runtime (size cost). |
| `wrap` | `boolean` | `false` | Wrap long lines instead of scrolling horizontally. |
| `filename` | `string` | `undefined` | Display the filename on the left of the header bar. Without a filename the header still renders (showing the language badge) as long as `copyable` is on, so the chrome stays consistent with or without a filename. |
| `compact` | `boolean` | `false` | Render a single-line **pill** instead of a multi-line surface — ideal for an install command. Suppresses header / filename / line-numbers, shrinks vertical padding to one line, and collapses the copy control to a small inline icon button at the end of the row. `<figure><pre><code>` semantics are preserved. |
| `prompt` | `string` | `undefined` | Decorative prompt prefix rendered before the code (e.g. `'$'`). Purely visual — it is NOT part of the highlighted code and is NEVER included in the clipboard copy. Most useful with `compact`. |
| `fontFamily` | `TFontFamily` | `undefined` | Font family token (`sans` · `mono` · `serif`). Overrides the theme font-family on the code surface. When unset the theme value stays in control. |
| `fontSize` | `TFontSize` | `undefined` | Font size token (`xs` · `sm` · `md` · `lg` · `xl` · `2xl` · `3xl` · `4xl` · `5xl`). Overrides the theme font-size. |
| `lineHeight` | `TLineHeight` | `undefined` | Line-height token (`none` · `tight` · `snug` · `normal` · `relaxed` · `loose`). Overrides the theme line-height. |

## Events

| Event | Payload | Description |
|---|---|---|
| `copy` | `code: string` | Emitted after a successful clipboard write. |

## Slots

| Slot | Slot props | Description |
|---|---|---|
| `default` | — | Alternative to the `code` prop for multi-line snippets. |
| `header` | `{ filename, langName, copy, copied }` | Override the entire header bar (filename + copy button). |
| `footer` | — | Add a custom footer under the code surface. |

## Supported languages

| Value | shiki grammar |
|---|---|
| `plaintext` | text |
| `vue` | Vue SFC |
| `ts` / `tsx` | TypeScript (+ JSX) |
| `js` / `jsx` | JavaScript (+ JSX) |
| `scss` / `css` | SCSS / CSS |
| `json` | JSON |
| `bash` | Bash / sh |
| `html` / `xml` | HTML / XML |
| `yaml` | YAML |
| `md` | Markdown |

Adding a language requires re-bundling the shiki highlighter — see the
composable for the loaded subset.

## Compact mode (install pill)

`compact` turns the block into a single-line pill — the canonical use case
is a copyable install command:

```vue
<template>
    <OrigamCode compact prompt="$" lang="bash" :code="'npm install origam'"/>
</template>
```

In compact mode:

- the header, filename and line-numbers are suppressed (one row only);
- vertical padding shrinks to a single line and the surface stays themed
  by the `--origam-code---*` tokens;
- the copy control collapses to a small **icon** button anchored inline at
  the end of the row (it swaps to a check mark during the copied feedback
  window so the pill never reflows);
- `prompt` renders a decorative prefix (`$`) that is `aria-hidden` and is
  **never** part of the clipboard copy — only `code` is copied.

The `<figure><pre><code>` semantics are preserved, so the snippet stays
screen-reader-readable and W3C-valid.

## Theme integration

The component's own surface (background, border, header, line gutter, prompt,
line-highlight, scrollbar) follows `<html data-theme="…">` via the regular
`--origam-code---*` / `--origam-code__*---*` design tokens, same as any other
origam component.

**Syntax colouring is a separate, DELIBERATELY NON-tokenised mechanism.**
There is no `--origam-code__syntax---*` token family (removed in #661/C2 —
see below for why), and no `theme` prop.

`useCode` calls shiki with two real themes and `defaultColor: false`:

```ts
codeToHtml(code, {
    themes: { light: 'github-light', dark: 'github-dark' },
    defaultColor: false
})
```

In this mode shiki writes BOTH computed colours directly onto every
token `<span>` it emits, e.g.
`style="--shiki-light:#24292e;--shiki-dark:#e1e4e8"`. The component's scoped
`<style>` block then just picks whichever custom property the current
`data-theme` / `data-mode` calls for:

```scss
.origam-code .shiki { color: var(--shiki-light); }
html[data-mode="dark"] .origam-code .shiki,
html:not([data-mode])[data-theme="dark"] .origam-code .shiki {
    color: var(--shiki-dark);
}
```

Switching `<html data-theme="dark">` re-resolves `var(--shiki-dark)` for
every span already in the DOM — no JavaScript re-render, no re-tokenising.

### Why there is no per-token-type design token (#661/C2)

Earlier versions of shiki (and of this doc) used a `css-variables` BUILT-IN
THEME that emitted one **named, stable** CSS variable per token TYPE
(`--shiki-token-keyword`, `--shiki-token-string`, …), which the origam token
sheets then mapped to `--origam-code__syntax---keyword` /
`---string` / etc. — a real, themeable design-token surface.

**shiki v4.3.1 no longer ships that `css-variables` theme.** The dual-theme
mode above is the maintained replacement, and it writes `--shiki-light` /
`--shiki-dark` **per span**, carrying each theme's own literal colour for
that specific token — there is no longer a stable, named variable per token
TYPE to hang a design token on. The 12 `--origam-code__syntax---*` tokens
were declared in `light.css` / `dark.css` but read by nothing (0 occurrences
in `OrigamCode.vue` — confirmed by `grep`, and by the `token-var-channels`
guard's dormant list), because the mapping they were meant to feed no longer
exists. They were removed, not renamed: recreating them under a different
name would still not connect to anything shiki emits today.

Consequences:

- **Syntax colours are not overridable per token type today.** Overriding
  `--shiki-light` / `--shiki-dark` on an ancestor changes the DEFAULT colour
  applied before a span's own inline value takes over — since every
  highlighted span sets its own inline `--shiki-light`/`--shiki-dark`, an
  ancestor override has no visible effect on highlighted code, only on
  plain-text fallback (`format`-less content with no spans).
- **The theme switch stays free of JS re-render** — this property survives
  the removal intact, since it comes from the dual-theme span markup, not
  from the removed tokens.
- **A brand wanting its own syntax palette picks its own shiki theme**,
  not a token override: pass different theme names to `useCode`/`codeToHtml`
  (a bundled shiki theme, or a custom Textmate-grammar-compatible theme
  JSON). That is a build-time/composable-level choice, not a CSS one.

## Performance

- **Lazy highlighter**: shiki is dynamic-imported on the first mount,
  not at app boot. The first `<OrigamCode>` pays a ~200 ms cold load;
  subsequent ones reuse the singleton.
- **LRU cache**: highlighted HTML is cached by `(code, lang)` up to 64
  entries. Re-renders, hover effects and re-mounts never re-tokenise.
  Theme switches are free — the CSS cascade handles colour changes with
  no JS involved.
- **Tarball impact**: shiki sits in `dependencies` and adds ~3 MB to the
  installed `node_modules` (curated to 14 langs + 2 built-in themes,
  `github-light` + `github-dark` — far below the ~30 MB of the full default
  bundle). The actual JS shipped to
  the browser is split per chunk via dynamic import.

## Accessibility

- The scroll wrapper (`.origam-code__scroller`) carries `tabindex="0"` so a
  code block wider than its column stays readable without a mouse, plus
  `role="region"` and an `aria-label` that names it. The label resolves in
  this order: `filename` when one is passed, else `lang` when it is anything
  other than `plaintext`, else the generic *"Code block, scrollable
  region"*. Keys: `origam.code.scroller_aria_label_filename`,
  `origam.code.scroller_aria_label_lang`, `origam.code.scroller_aria_label`.
  Pass a `filename` (or at least a `lang`) whenever a page shows several
  blocks — otherwise every one of them lands in the screen-reader landmark
  list under the same name.
- The copy button is a real `<button>` with an `aria-label` describing
  the action, and an `aria-live="polite"` region for the "Copied!"
  feedback.
- Line numbers are emitted via a CSS `::before` counter with
  `user-select: none`; they do not appear in clipboard copies of the
  code text.
- The code content remains screen-reader-readable in its natural
  sequence (shiki only adds inline `<span>` styling, never reorders
  tokens).
