# Gradients

The `color`, `bgColor` and `textColor` props of every origam component
accept gradient values in addition to the legacy `TIntent` /
hex / CSS-named-color formats. Three input formats are supported:

1. **Raw CSS gradient string** (verbatim pass-through)
2. **Structured `IGradient` object** (intent stops + theming)
3. **Preset name** (`gradient-<slug>`)

Full backward compatibility is preserved — `color="primary"`,
`color="#ff00aa"`, etc. keep behaving exactly as before.

---

## Format 1 — raw CSS gradient string

Pass any valid CSS gradient string and the composable forwards it
verbatim as the element's `background-image`:

```vue
<origam-btn  bg-color="linear-gradient(135deg, #ff0080, #7928ca)" />
<origam-card bg-color="radial-gradient(circle, #fff, #000)" />
<origam-chip bg-color="conic-gradient(from 0deg, red, blue, red)" />
```

Detection is prefix-based (`linear-gradient(`, `radial-gradient(`,
`conic-gradient(`, plus their `repeating-` variants), so an arbitrary
hex value like `#ff0080` is NOT misinterpreted as a gradient.

> **Note** Raw-color values still trigger the legacy `[origam] received
> a raw color …` warning. Gradient strings do not.

---

## Format 2 — `IGradient` object

```ts
interface IGradientStop {
    color: TIntent | string
    position: number
}

interface IGradient {
    type?: 'linear' | 'radial' | 'conic'
    from?: TIntent | string
    to?: TIntent | string
    via?: TIntent | string
    direction?: number | string
    stops?: IGradientStop[]
}
```

Two ways to define the colour ramp:

### Short form — `from` + `to` (+ optional `via`)

```vue
<origam-btn :bg-color="{ from: 'primary', to: 'success', direction: 135 }" />
<origam-btn :bg-color="{ from: 'primary', via: 'warning', to: 'danger' }" />
```

Each intent stop is resolved to its design-token CSS variable
(`--origam-color__action--primary---bg`,
`--origam-color__feedback--success---bg`, …) so the gradient stays
theme-aware (light / dark / brand-*) without rebuilding the inline
style.

### Full form — `stops` array

```vue
<origam-card :bg-color="{
    type: 'radial',
    stops: [
        { color: 'primary', position: 0 },
        { color: '#fff',    position: 50 },
        { color: 'success', position: 100 }
    ]
}" />
```

`stops` overrides the short form entirely — when present, `from`,
`to`, `via` are ignored.

### `direction`

| Value type | Example | Meaning |
| --- | --- | --- |
| `number` | `135` | Angle in degrees (`135deg`) |
| `string` | `'to right'` | Any CSS direction keyword |
| `undefined` (linear) | — | Defaults to `135deg` |
| `undefined` (radial) | — | Defaults to `circle at center` |
| `undefined` (conic) | — | Defaults to `from 0deg at 50% 50%` |

---

## Format 3 — preset names

Five built-in gradients ship with the design system, with light and
dark variants tuned for each theme. Reference them by the
`gradient-{slug}` convention:

```vue
<origam-btn bg-color="gradient-sunset" />
<origam-btn bg-color="gradient-ocean" />
<origam-btn bg-color="gradient-forest" />
<origam-btn bg-color="gradient-fire" />
<origam-btn bg-color="gradient-midnight" />
```

Each preset resolves to `var(--origam-gradient---{slug})` and switches
automatically with `[data-theme="..."]`.

To add a new preset, drop a `tokens/semantic/gradient-{name}.json`
entry under `gradient.<slug>` (DTCG `$type: "other"`), register the
file in `tokens/$themes.json` + `tokens/$metadata.json`, then run
`npm run tokens:build`.

---

## Component coverage

Any component whose props extend `IColorProps` and/or `IBgColorProps`
inherits gradient support transparently:

| Component | `bgColor` | `color` (text) |
| --- | --- | --- |
| OrigamBtn | yes | yes (via clip-text) |
| OrigamCard | yes | yes |
| OrigamChip | yes | yes |
| OrigamBadge | yes | yes |
| OrigamAlert | yes | yes |
| OrigamSnackbar | yes | yes |
| OrigamTitle | n/a | yes |
| OrigamLabel | n/a | yes |
| OrigamCaption / Subtitle | n/a | yes |
| OrigamAvatar | yes | yes |
| OrigamPagination | yes | yes |

Components that don't paint a surface (Title, Label, Caption, …)
only expose `color`. Setting a gradient there triggers the
text-gradient render path described below.

---

## Text gradient (background-clip)

When you pass a gradient on `color` (text foreground) rather than
`bgColor`, the composable emits the three-declaration triad required
to clip a gradient to text glyphs:

```css
color: transparent;
background-image: linear-gradient(...);
background-clip: text;
-webkit-background-clip: text;
```

```vue
<origam-title :color="{ from: 'primary', to: 'success' }">
    Gradient title
</origam-title>
```

**Browser support** — `background-clip: text` is a Baseline 2024
feature (Chrome, Edge, Firefox 49+, Safari 14+). Older browsers fall
back to `color: transparent` and show invisible text — wrap the
component in a feature-detect (`@supports (background-clip: text)`)
if you target the IE/legacy long tail.

**Collision with `bgColor`** — when both `color` and `bgColor` are
gradients, the foreground gradient wins on the `background-image`
channel (so the text glyphs remain painted). Pick one or the other.

---

## Performance notes

Gradients live exclusively on the **inline-style** channel — the
composable never emits a `.origam--bg-*` utility class for a gradient
value:

- Utility classes are static by design (one class → one declaration
  resolved against the design tokens), and a gradient string carries
  embedded references that can't be hoisted into a single utility.
- The class layer remains lean — adding gradients does not bloat the
  generated `.origam--*` ruleset.
- Inline style means the gradient lives on the component instance,
  not the cascade — overriding a single instance is a one-line
  `:style` patch.

For high-frequency animation of a gradient stop (e.g. a hue rotation
over time), prefer a CSS variable swap on a wrapping element rather
than re-binding the prop on every frame.

---

## State interactions

The hover / active darken cascade (`-20 %`, `-30 %`) does **not**
apply to gradient `bgColor` — applying `color-mix` to every stop
would balloon the declaration and change the artistic intent. To
animate a hover state on a gradient button, lean on opacity / scale
/ filter transitions instead:

```vue
<style scoped>
    .gradient-btn:hover {
        filter: brightness(0.9);
    }
</style>
```

The same contract applies to `disabled`: a visual veil (opacity
reduction) overlays the resting gradient, no token swap.
