# OrigamDatePickerField

`<OrigamDatePickerField>` is a text-field that opens an `<OrigamDatePicker>` in a dropdown menu. Selected dates are displayed as chips or plain text inside the field.

## Basic usage

```vue
<template>
    <OrigamDatePickerField v-model="date" label="Appointment" />
</template>

<script setup>
import { ref } from 'vue'
const date = ref(null)
</script>
```

## Range and multiple

```vue
<template>
    <OrigamDatePickerField v-model="dates" range label="Date range" />
    <OrigamDatePickerField v-model="dates" multiple label="Multiple dates" />
</template>
```

| Prop | Type | Default | Description |
|---|---|---|---|
| `range` | `boolean` | `false` | Enables range mode (start + end dates) |
| `multiple` | `boolean` | `false` | Enables multiple date selection |

## Chips display

```vue
<template>
    <OrigamDatePickerField v-model="dates" multiple :chip-props="{ color: 'primary' }" closable-chips />
</template>
```

| Prop | Type | Description |
|---|---|---|
| `chipProps` | `IChipProps` | Props forwarded to the chip elements |
| `closableChips` | `boolean` | Makes chips closable (removes date on close) |

## Validation

`OrigamDatePickerField` forwards `rules`, `errorMessages`, and `validateOn` to the underlying `OrigamTextField` / `OrigamInput`. The value passed to each rule function is the internal date array (`Array<string>`).

- **Single mode** — array is empty (`[]`) when nothing is selected, or contains one ISO date string when a date is chosen.
- **Range / Multiple mode** — array holds all selected dates; for range, it contains `[startDate, endDate]` once both are picked.

A `required` rule should check `Array.length > 0` (single or multiple) or `Array.length >= 2` (range):

```vue
<template>
    <OrigamDatePickerField
        v-model="date"
        label="Appointment"
        :rules="[(v) => (Array.isArray(v) ? v.length > 0 : !!v) || 'Date required']"
        validate-on="blur"
    />
    <OrigamDatePickerField
        v-model="dates"
        label="Date range"
        range
        :rules="[(v) => (Array.isArray(v) ? v.length >= 2 : false) || 'Select start and end date']"
        validate-on="blur"
    />
</template>
```

| Prop | Type | Default | Description |
|---|---|---|---|
| `rules` | `Array<(v: unknown) => true \| string>` | `undefined` | Validation rules. Receives the date array as value. |
| `errorMessages` | `Array<string> \| string` | `undefined` | Static error messages to display unconditionally. |
| `validateOn` | `'input' \| 'blur' \| 'submit' \| 'lazy'` | `'input'` | When validation is triggered. |

## Menu behaviour

| Prop | Type | Default | Description |
|---|---|---|---|
| `menu` | `boolean` | `false` | Controls picker visibility |
| `menuProps` | `IMenuProps` | `undefined` | Props forwarded to `OrigamMenu` |
| `closeOnSelect` | `boolean` | `false` | Closes after a date is selected |
| `openOnClear` | `boolean` | `false` | Re-opens when field is cleared |
| `openText` | `string` | `'origam.open'` | ARIA label when picker is closed |
| `closeText` | `string` | `'origam.close'` | ARIA label when picker is open |

### The dropdown follows your own typography

The calendar is teleported out of the field's DOM subtree so it can escape
`overflow` and stacking contexts. A consequence catches most applications out:
**CSS you write against the field never reaches the popup**. A compact form
theme, a scaled container, or a plain rule like

```css
.my-form .origam-date-picker-field * { font-size: 13px; }
```

used to shrink the control and leave the weekday header, week numbers, and
day cells at their own size — a small field opening a visibly oversized
calendar.

Inheriting `font-size` on the teleported surface would not have fixed it
either: those elements are sized with `rem`-based tokens
(`var(--origam-date-picker-month__weekday---font-size, .85rem)` and siblings),
and `rem` resolves against the document root, not the parent — they would
keep the root size whatever the surface inherited.

So `OrigamDatePickerField` measures the typography that actually won on the
field when the popup opens, and republishes it on the teleported surface as
the tokens the calendar already reads (plus `--origam-picker-title---font-size`,
for a popup `title`). Nothing to configure: any rule of yours that changes the
field's font is picked up, including rules the design system cannot see.

`menuProps.contentProps.style` still wins, for a popup you want to diverge on
purpose:

```vue
<template>
  <OrigamDatePickerField
      v-model="date"
      label="Appointment"
      :menu-props="{ contentProps: { style: { fontSize: '15px' } } }"
  />
</template>
```

The measurement is taken at open time, so a font that changes while the popup
is already open is picked up at the next opening.

| Token | Description |
|---|---|
| `--origam-date-picker-month__weekday---font-size` | Republished by the typography bridge at open time; falls back to `.85rem` |
| `--origam-date-picker-month__weeks---font-size` | Republished by the typography bridge at open time; falls back to `.85rem` |
| `--origam-date-picker-month__day---font-size` | Republished by the typography bridge at open time; falls back to `.85rem` |
| `--origam-picker-title---font-size` | Republished by the typography bridge when the popup has a `title`; falls back to `.75rem` |

## Transition

| Prop | Type | Default | Description |
|---|---|---|---|
| `transition` | `boolean \| string \| TTransitionProps` | `undefined` | Overrides the transition used for the picker's appearance. From the transversal `ITransitionComponentProps` mixin |

## Inherited surface

`IDatePickerFieldProps extends ITextFieldProps`, so the whole text-field API
is available on this component and is documented once, on its owner:

- **Field chrome** (`IFieldProps`) — `label`, `hint`, `prefix`, `suffix`,
  `variant`, `size`, `density`, `rounded`, `elevation`, `flat`, `inline`,
  `singleLine`, `centerAffix`, `persistentClear`, `required`, `error`,
  `disabled`, `dirty`, `clearable` / `clearIcon` and the other adjacent-inner
  icons, plus the loader, colour, active/focus and typography mixins. See
  [`OrigamField`](../Field/OrigamField.md).
- **Input** (`IInputProps`) — `hint`, `persistentHint`, `messages`,
  `hideDetails`, the dimension / direction mixins, and the validation surface
  (`rules`, `validateOn`, `errorMessages`, `readonly`) documented above. See
  [`OrigamInput`](../Input/OrigamInput.md).
- **Text field's own** — `placeholder`, `persistentPlaceholder`, `counter`,
  `counterValue`, `persistentCounter`, `autofocus`, `role`, spacing and border
  mixins. See [`OrigamTextField`](../TextField/OrigamTextField.md).

`type`, `mask` and `modelModifiers` are inherited by type but meaningless
here: the visible control is not a free-text input — it renders the selection
as text or chips and defers editing to the picker.

## Slots

### Field chrome

Forwarded verbatim to the nested `<OrigamTextField>`.

| Slot | Bindings | Description |
|---|---|---|
| `prepend` | — | Content outside the field, left side |
| `append` | — | Content outside the field, right side |
| `prependInner` | — | Content inside the field, left |
| `appendInner` | — | Content inside the field, right |
| `floatingLabel` | `ILabelProps` | Custom floating label |
| `label` | `ILabelProps` | Custom label |
| `prefix` | — | Text prefix |
| `suffix` | — | Text suffix |
| `clear` | — | Custom clear control |
| `loader` | — | Custom loader |

### Selection display

These three are this component's own, and they are the reason `IFieldSlots`'
scoped `default` is omitted: `<OrigamDatePickerField>` fills the field body
itself with the selection markup rather than handing it to the consumer.

| Slot | Bindings | Description |
|---|---|---|
| `selection` | — | Overrides the text representation of a single selected date |
| `rangeSelection` | — | Overrides the formatted "start → end" text in `range` mode |
| `chip` | `{ item: string, index: number, props: Record<string, unknown> }` | Overrides one selected-date chip in `multiple` mode. `props` carries the pre-wired `<OrigamChip>` binding — spread it so `closableChips` keeps removing the right date |

## Emits

Both declared emits are `useVModel` relays, not literal `emit(…)` calls in the
component body.

| Event | Payload | Description |
|---|---|---|
| `update:modelValue` | `string \| Date \| Array<...>` | Date selection changed |
| `update:menu` | `boolean` | Picker opened or closed |

The field-level events — `update:focused`, `click:clear`, `click:prepend`,
`click:append`, `click:prependInner`, `click:appendInner` — are **not**
declared on `IDatePickerFieldEmits`. They still reach you: `<OrigamTextField>`
is this component's root, so an undeclared listener falls through to it and
fires from there. `<OrigamDatePickerField>` binds its own `@click:clear`
handler on that same root for its bookkeeping (empty the selection, and
re-open the picker when `openOnClear` is set); Vue merges the two, so both run
— yours does not replace it.
