# Authoring an origam theme

An origam theme is **plain JSON**. You write design intentions — `colors`,
`radius`, `typography`, `shadow`, `spacing`, `animation` — as nested objects,
and the design system resolves each leaf to the matching `--origam-*` CSS
variable. You never write `--origam-…` prefixes and you never use the DTCG
`$value` wrapper: that ceremony stays inside the build pipeline.

Because a theme is plain JSON, it is fully serialisable — a Theme Builder can
export it, store it, and round-trip it without losing fidelity.

> ADR-004 (Implemented): the DS ships **one** neutral identity (the origam
> baseline). Every brand theme lives in the consuming app and is written in
> exactly this format — there is no preset registry in the DS.

## Shape

```ts
import type { IOrigamTheme } from 'origam/interfaces'

const myLight: IOrigamTheme = {
  name: 'mybrand',        // → activates under [data-theme="mybrand"]
  mode: 'light',          // → narrowed by [data-mode="light"]
  label: 'My Brand',      // optional — shown in a theme switcher
  description: '…',       // optional
  swatch: '#7c3aed',      // optional — switcher preview

  colors: {
    primary:  '#7c3aed',
    surface:  { default: '#ffffff', sunken: '#fafafa' },
    text:     { primary: '#171717', secondary: '#737373' },
    action:   { primary: { bg: '#7c3aed', fg: '#ffffff' } },
    feedback: { success: { bg: '#4caf50', fg: '#ffffff' } }
  },

  radius:     { md: '0.5rem' },
  spacing:    { 4: '1rem' },
  typography: { size: { md: '1rem' }, weight: { bold: 700 } },
  shadow:     { md: '0 2px 8px rgba(0,0,0,.12)' },
  animation:  { duration: { fast: '100ms' }, easing: { standard: 'cubic-bezier(.4,0,.2,1)' } },

  // Per-component DEFAULT PROPS (unchanged — see useTheme.md / DefaultsProvider)
  component: {
    global:       { density: 'comfortable' },
    'origam-btn': { color: 'primary', rounded: 0 }
  }
}
```

Install it via `createOrigam({ themes: [myLight, myDark] })` or the Nuxt module
(`origam: { themes: [myLight, myDark] }`). See `integrations/nuxt.md`.

## Values: everything is CSS

The config is JSON, but the **leaf values are raw CSS** for the slot they fill.

| Slot kind | Accepts | Examples |
|---|---|---|
| Color | any CSS color **or a gradient** | `'#171717'`, `'rgb(23,23,23)'`, `'hsl(0 0% 9%)'`, `'rgba(0,0,0,0)'`, `'linear-gradient(135deg,#a,#b)'` |
| Dimension (radius / spacing) | any CSS length | `'0.5rem'`, `'8px'`, `0` |
| Shadow | a `box-shadow` value | `'0 2px 8px rgba(0,0,0,.12)'`, `'none'` |
| Font size / line-height / letter-spacing | CSS length / number / keyword | `'1rem'`, `1.5`, `'-0.01em'` |
| Font weight | number / keyword | `700`, `'bold'` |
| Font family | a font stack | `"'Inter', sans-serif"` |
| Duration | CSS `<time>` | `'100ms'`, `'0.2s'` |
| Easing | CSS `<easing-function>` | `'cubic-bezier(.4,0,.2,1)'`, `'linear'` |

### Gradients are ordinary colors

There is **no `gradient` group**. A gradient is just a color value — drop it
into any color slot:

```ts
colors: { surface: { default: 'linear-gradient(135deg, #ff7e5f, #feb47b)' } }
```

## Complete variable reference

Each table lists the authoring path (what you write under the field) and the
`--origam-*` variable it resolves to. Any slot you omit falls back to the DS
default (the DS baseline / primitive scale).

### `colors` → `--origam-color-*`

**Top-level intents** (optional; length-2 paths)

| Path | Resolves to |
|---|---|
| `primary` | `--origam-color---primary` |
| `secondary` | `--origam-color---secondary` |
| `success` / `warning` / `danger` / `info` | `--origam-color---success` … |

**`surface`**

| Path | Variable |
|---|---|
| `surface.default` | `--origam-color__surface---default` |
| `surface.raised` | `--origam-color__surface---raised` |
| `surface.overlay` | `--origam-color__surface---overlay` |
| `surface.sunken` | `--origam-color__surface---sunken` |
| `surface.disabled` | `--origam-color__surface---disabled` |

**`text`**

| Path | Variable |
|---|---|
| `text.primary` | `--origam-color__text---primary` |
| `text.secondary` | `--origam-color__text---secondary` |
| `text.disabled` | `--origam-color__text---disabled` |
| `text.inverse` | `--origam-color__text---inverse` |
| `text.onColor` | `--origam-color__text---onColor` |

**`border`**

| Path | Variable |
|---|---|
| `border.default` | `--origam-color__border---default` |
| `border.subtle` | `--origam-color__border---subtle` |
| `border.strong` | `--origam-color__border---strong` |
| `border.focus` | `--origam-color__border---focus` |

**`action.{primary|secondary|ghost}`** — slots: `bg`, `bgHover`, `bgSubtle`,
`bgDisabled`, `fg`, `fgSubtle`, `fgDisabled`

| Path | Variable |
|---|---|
| `action.primary.bg` | `--origam-color__action--primary---bg` |
| `action.primary.bgHover` | `--origam-color__action--primary---bgHover` |
| `action.primary.bgSubtle` | `--origam-color__action--primary---bgSubtle` |
| `action.primary.bgDisabled` | `--origam-color__action--primary---bgDisabled` |
| `action.primary.fg` | `--origam-color__action--primary---fg` |
| `action.primary.fgSubtle` | `--origam-color__action--primary---fgSubtle` |
| `action.primary.fgDisabled` | `--origam-color__action--primary---fgDisabled` |
| `action.secondary.*` | `--origam-color__action--secondary---*` |
| `action.ghost.*` | `--origam-color__action--ghost---*` |

**`feedback.{success|warning|danger|info}`** — slots: `bg`, `bgSubtle`, `fg`,
`fgSubtle`, `border`

| Path | Variable |
|---|---|
| `feedback.success.bg` | `--origam-color__feedback--success---bg` |
| `feedback.success.bgSubtle` | `--origam-color__feedback--success---bgSubtle` |
| `feedback.success.fg` | `--origam-color__feedback--success---fg` |
| `feedback.success.fgSubtle` | `--origam-color__feedback--success---fgSubtle` |
| `feedback.success.border` | `--origam-color__feedback--success---border` |
| `feedback.warning.*` | `--origam-color__feedback--warning---*` |
| `feedback.danger.*` | `--origam-color__feedback--danger---*` |
| `feedback.info.*` | `--origam-color__feedback--info---*` |

**`overlay`**

| Path | Variable |
|---|---|
| `overlay.scrim` | `--origam-color__overlay---scrim` |

### `radius` → `--origam-radius-*`

Slots: `none`, `xs`, `sm`, `md`, `lg`, `xl`, `2xl`, `full`.

| Path | Variable |
|---|---|
| `radius.md` | `--origam-radius---md` |
| `radius.full` | `--origam-radius---full` |

### `spacing` → `--origam-space-*`

Slots (a numeric step): `0`, `1`, `2`, `3`, `4`, `5`, `6`, `8`, `10`, `12`,
`14`, `16`, `20`.

| Path | Variable |
|---|---|
| `spacing.4` | `--origam-space---4` |
| `spacing.12` | `--origam-space---12` |

### `typography` → `--origam-font-*`

| Path | Variable |
|---|---|
| `typography.size.{xs…5xl}` | `--origam-font__size---{xs…5xl}` |
| `typography.weight.{regular|medium|semibold|bold}` | `--origam-font__weight---{…}` |
| `typography.family.{sans|serif|mono}` | `--origam-font__family---{…}` |
| `typography.lineHeight.{none|tight|snug|normal|relaxed|loose}` | `--origam-font__lineHeight---{…}` |
| `typography.letterSpacing.{tight|normal|wide|wider|widest}` | `--origam-font__letterSpacing---{…}` |

### `shadow` → `--origam-shadow-*`

Slots: `none`, `xs`, `sm`, `md`, `lg`, `xl`.

| Path | Variable |
|---|---|
| `shadow.md` | `--origam-shadow---md` |

### `animation` → `--origam-motion-*`

| Path | Variable |
|---|---|
| `animation.duration.{instant|fast|normal|medium|slow|xslow}` | `--origam-motion__duration---{…}` |
| `animation.easing.{standard|decelerate|accelerate|sharp|linear}` | `--origam-motion__easing---{…}` |

## Escape hatches (advanced)

The semantic fields cover the whole authoring surface. For the rare variable
that has no semantic slot, two raw fields exist — they are **not** the normal
path:

- **`vars`** — a flat map of pre-resolved custom properties. Keys with or
  without the leading `--` are accepted. Wins over every other field on
  collision.

  ```ts
  vars: { '--origam-some-unmapped-var': '12px' }
  ```

- **`tokens`** — a raw DTCG-shaped tree (supports `$value` leaves), walked from
  the root. Intended for machine-generated trees that already carry full token
  paths (e.g. a Tokens Studio export).

Precedence, lowest → highest: **semantic fields → `tokens` → `vars`**.

## Notes

- The config stays **JSON** — values are strings/numbers only. Do not put
  functions or imports in theme values, or the Theme Builder round-trip breaks.
- A theme object also carries `component` (per-component default props). That
  layer is documented in `composables/useTheme.md` and is unchanged by this
  authoring format.
