# OrigamCodeGroup

`<OrigamCodeGroup>` shows the same snippet for several tools (`npm`, `pnpm`,
`yarn`) as tabs. It is `<OrigamTabs>` and
`<OrigamCode>` drawn as **one** surface:

- one border, one radius, one elevation, on the group; the code blocks inside
  are flattened so the tab strip and the panel read as one block;
- one shared copy button, which copies the code of the active tab;
- every panel's scrollable region has its own accessible name (the tab label
  and its position), so N blocks of the same language no longer share one name
  (axe `landmark-unique`);
- the header of each code block is not repeated: the tab already shows the label.

## Quick start

### With `items`

```vue
<origam-code-group
    v-model="manager"
    :items="[
        { label: 'npm', lang: 'bash', code: 'npm install origam' },
        { label: 'pnpm', lang: 'bash', code: 'pnpm add origam' },
        { label: 'yarn', lang: 'bash', code: 'yarn add origam' }
    ]"
/>
```

### With `<origam-code>` children

The tab label is the child's `label`, else its `filename`, else its position.
`code`, `lang` and the default slot of each child work as on a stand-alone
`<origam-code>`.

```vue
<origam-code-group>
    <origam-code label="npm" lang="bash" code="npm install origam"/>
    <origam-code label="pnpm" lang="bash" code="pnpm add origam"/>
    <origam-code filename="yarn" lang="bash" code="yarn add origam"/>
</origam-code-group>
```

## Props

| Prop | Type | Default | Description |
|---|---|---|---|
| `items` | `ICodeGroupItem[]` | `[]` | Tabs and their code: `{ label, code, lang?, filename?, value? }`. Ignored when the default slot holds code blocks. |
| `modelValue` | `string` | first tab | `value` of the active tab (`v-model`). An item's `value` defaults to its `label`. |
| `label` | `string` | localised generic name | Accessible name of the tab list. |
| `copyable` | `boolean` | `true` | Show the shared copy button. |
| `lineNumbers` | `boolean` | `false` | Show a line-number gutter in every panel. |
| `wrap` | `boolean` | `false` | Wrap long lines instead of scrolling horizontally. |
| `tag` | `string` | `'figure'` | Root element. |
| `rounded` · `elevation` · `border` · `borderColor` · `borderStyle` | | theme | The group's surface (same props as `<OrigamCode>`). |
| `margin` · `width` · `height` · `minWidth` · `maxWidth` · `minHeight` · `maxHeight` | | | Spacing and dimensions of the group. |

## Events

| Event | Payload | Description |
|---|---|---|
| `update:modelValue` | `value: string` | The active tab changed. |
| `copy` | `code: string` | Emitted after a successful clipboard write, with the code of the active tab. |

## Slots

| Slot | Slot props | Description |
|---|---|---|
| `default` | | `<origam-code>` children, one per tab, when `items` is not used. |
| `copy` | `{ copy, copied }` | Replaces the shared copy button. |

## Behaviour notes

- Keyboard: the tab strip is an `<OrigamTabs>`, so it follows the WAI-ARIA tabs
  pattern (arrows, `Home`, `End`).
- Each panel's scrollable region is named `"{label}, code block {n} of {total},
  scrollable region"` (localised: keys `origam.code_group.*`). **Several groups on
  one page repeat the same tab labels** (npm / pnpm / yarn each time): give each
  group a `label` (`"Install origam"`), which is then part of the name
  (`"Install origam, npm, code block 1 of 3, scrollable region"`) — otherwise
  the visible regions of two groups share a name. Inside a group the
  hosted `<origam-code>` receives `hideHeader`, `flat`, `copyable=false` and a
  `scrollerAriaLabel`, three of which are public props of
  `<OrigamCode>`.
- Theming: the group reads the `--origam-code---*` and `--origam-code__header---*`
  tokens, so a theme that restyles `<OrigamCode>` restyles the group.
- Colours of the syntax come from the same dual shiki themes as `<OrigamCode>`;
  `shiki` is an optional peer dependency.

## Examples

### Line numbers and wrapping

```vue
<origam-code-group :items="items" line-numbers wrap/>
```

### Controlled tab

```vue
<origam-code-group v-model="manager" :items="items"/>
<origam-btn text="Use yarn" @click="manager = 'yarn'"/>
```

### Custom copy button

```vue
<origam-code-group :items="items">
    <template #copy="{ copy, copied }">
        <origam-btn :text="copied ? 'Done' : 'Grab it'" @click="copy"/>
    </template>
</origam-code-group>
```
