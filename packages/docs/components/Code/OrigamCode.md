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

The component follows `<html data-theme="…">` automatically via the origam
design system CSS variables — no `theme` prop is needed or available.

shiki uses its built-in `css-variables` theme, which emits spans with
`style="color: var(--shiki-token-keyword)"` rather than hardcoded hex
colours. The component SCSS maps each `--shiki-*` variable to an origam
design token:

| shiki CSS var | origam token | Scope |
|---|---|---|
| `--shiki-foreground` | `--origam-code__syntax---foreground` | Default text |
| `--shiki-token-keyword` | `--origam-code__syntax---keyword` | Keywords (`if`, `const`, …) |
| `--shiki-token-string` | `--origam-code__syntax---string` | String literals |
| `--shiki-token-string-expression` | `--origam-code__syntax---string-expression` | Template literals |
| `--shiki-token-function` | `--origam-code__syntax---function` | Function names |
| `--shiki-token-parameter` | `--origam-code__syntax---parameter` | Parameters |
| `--shiki-token-constant` | `--origam-code__syntax---constant` | Constants |
| `--shiki-token-comment` | `--origam-code__syntax---comment` | Comments |
| `--shiki-token-punctuation` | `--origam-code__syntax---punctuation` | Punctuation |
| `--shiki-token-link` | `--origam-code__syntax---link` | Links (Markdown) |
| `--shiki-token-inserted` | `--origam-code__syntax---inserted` | Diff insertions |

Switching `<html data-theme="dark">` automatically updates all syntax
colours via CSS cascade — no JavaScript re-render is triggered.

### Customising syntax colours

Override any `--shiki-*` variable on the component's root element or any
ancestor to change specific token colours for a subtree:

```css
.my-scope .origam-code {
    --shiki-token-keyword: var(--my-brand-red);
}
```

## Performance

- **Lazy highlighter**: shiki is dynamic-imported on the first mount,
  not at app boot. The first `<OrigamCode>` pays a ~200 ms cold load;
  subsequent ones reuse the singleton.
- **LRU cache**: highlighted HTML is cached by `(code, lang)` up to 64
  entries. Re-renders, hover effects and re-mounts never re-tokenise.
  Theme switches are free — the CSS cascade handles colour changes with
  no JS involved.
- **Tarball impact**: shiki sits in `dependencies` and adds ~3 MB to the
  installed `node_modules` (curated to 14 langs + 1 built-in theme — far
  below the ~30 MB of the full default bundle). The actual JS shipped to
  the browser is split per chunk via dynamic import.

## Accessibility

- The container carries `role="region"` and an `aria-label` that
  includes the filename (or language fallback).
- The copy button is a real `<button>` with an `aria-label` describing
  the action, and an `aria-live="polite"` region for the "Copied!"
  feedback.
- Line numbers are emitted via a CSS `::before` counter with
  `user-select: none`; they do not appear in clipboard copies of the
  code text.
- The code content remains screen-reader-readable in its natural
  sequence (shiki only adds inline `<span>` styling, never reorders
  tokens).
