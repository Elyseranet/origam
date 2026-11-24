# OrigamStepper

A multi-step progress indicator used to guide users through sequential flows (Account → Profile → Plan → Confirm). Supports horizontal and vertical orientations, active/done/pending/error states, connecting lines, icons, and clickable navigation.

## Usage

### Basic (declarative `items` array)

```vue
<origam-stepper
  :items="[
    { title: 'Account', subtitle: 'Email & password' },
    { title: 'Profile', subtitle: 'Personal info' },
    { title: 'Plan', subtitle: 'Choose plan' },
    { title: 'Confirm', subtitle: 'Review & submit' }
  ]"
  :model-value="1"
/>
```

### Vertical orientation

```vue
<origam-stepper
  :items="steps"
  v-model="currentStep"
  orientation="vertical"
/>
```

### Clickable with v-model

```vue
<origam-stepper
  v-model="currentStep"
  :items="steps"
  :clickable="true"
/>
```

### Explicit item statuses

```vue
<origam-stepper
  :items="[
    { title: 'Account', status: 'done' },
    { title: 'Profile', status: 'done' },
    { title: 'Plan',    status: 'active' },
    { title: 'Billing', status: 'error' },
    { title: 'Confirm', status: 'pending' }
  ]"
/>
```

### With icons

```vue
<origam-stepper
  :items="[
    { title: 'Account',  icon: MDI_ICONS.ACCOUNT },
    { title: 'Settings', icon: MDI_ICONS.COG },
    { title: 'Payment',  icon: MDI_ICONS.CREDIT_CARD },
    { title: 'Confirm',  icon: MDI_ICONS.CHECK_CIRCLE }
  ]"
  :model-value="0"
/>
```

## Props — `IStepperProps`

| Prop | Type | Default | Description |
|---|---|---|---|
| `items` | `IStepperItem[]` | `undefined` | Declarative step definitions |
| `modelValue` | `number` | `0` | Index of the active step (0-based) |
| `orientation` | `'horizontal' \| 'vertical'` | `'horizontal'` | Layout direction |
| `clickable` | `boolean` | `false` | Allow jumping to steps by clicking |
| `showConnectors` | `boolean` | `true` | Show connector lines between steps |
| `color` | `TColor` | — | Intent color (forwarded via provide/inject) |
| `density` | `TDensity` | `'default'` | Compact, default, or comfortable |
| `size` | `TSize` | `'default'` | Component size scale |
| + all `ICommonsComponentProps` | | | `id`, `class`, `style` |

## `IStepperItem` payload

| Field | Type | Required | Description |
|---|---|---|---|
| `title` | `string` | Yes | Step label |
| `subtitle` | `string` | No | Secondary descriptive text |
| `icon` | `TIcon` | No | Overrides the number indicator with a custom icon |
| `status` | `TStepperItemStatus` | No | Explicit status; overrides auto-computed status |

## Status resolution

When `status` is not explicitly set on an item, it is computed from the wrapper's `modelValue`:

- `index < modelValue` → `done` (checkmark shown)
- `index === modelValue` → `active` (filled primary indicator)
- `index > modelValue` → `pending` (outlined muted indicator)
- Explicit `status` prop **always wins** over computed status.

## Status values (`TStepperItemStatus`)

| Value | Indicator |
|---|---|
| `pending` | Outlined circle, muted number |
| `active` | Filled primary circle, number |
| `done` | Filled primary circle, checkmark icon |
| `error` | Filled danger circle, exclamation icon |

## Connector lines

A thin horizontal (or vertical) line connects adjacent steps. The connector color is:
- `--origam-stepper---connector-color` (default: `color.border.subtle`) when the preceding step is pending
- `--origam-stepper---connector-color-done` (default: `color.action.primary.bg`) when the preceding step is done or active

Disable connectors with `:show-connectors="false"`.

## Slots

| Slot | Props | Description |
|---|---|---|
| `default` | none | Replaces the whole generated list — **connectors included**. |
| `item-prepend` | `{ item, index, status }` | `items` mode: forwarded to each item's `prepend` slot, connectors kept. |
| `item-append` | `{ item, index, status }` | `items` mode: forwarded to each item's `append` slot, connectors kept. |

## Accessibility

- The wrapper renders as `<nav aria-label="Progress steps">`.
- Each item has `aria-current="step"` when active.
- Clickable items render as `<button>` elements with full keyboard focus support.
- Icon-only indicators have `aria-hidden="true"` — the step number and title convey semantics.

## Design tokens

| CSS variable | Default source | Description |
|---|---|---|
| `--origam-stepper---indicator-size` | `space.8` (32px) | Indicator circle diameter |
| `--origam-stepper---indicator-active-bg` | `color.action.primary.bg` | Active indicator background |
| `--origam-stepper---indicator-done-bg` | `color.action.primary.bg` | Done indicator background |
| `--origam-stepper---indicator-error-bg` | `color.feedback.danger.bg` | Error indicator background |
| `--origam-stepper---color-active` | `--origam-stepper---color` | Active indicator colour. The stepper `color` prop wins over it |
| `--origam-stepper---color-done` | `--origam-stepper---color` | Done indicator colour. The stepper `color` prop wins over it |
| `--origam-stepper-item__title---white-space` | `nowrap` | Title wrapping (`normal` to allow line breaks) |
| `--origam-stepper-item__subtitle---white-space` | `nowrap` | Subtitle wrapping (horizontal) |
| `--origam-stepper-item--vertical__subtitle---white-space` | `normal` | Subtitle wrapping in `vertical` orientation |
| `--origam-stepper---connector-color` | `color.border.subtle` | Pending connector color |
| `--origam-stepper---connector-color-done` | `color.action.primary.bg` | Done connector color |
| `--origam-stepper---title-font-size` | `font.size.md` | Step title font size |
| `--origam-stepper---subtitle-color` | `color.text.secondary` | Subtitle text color |
