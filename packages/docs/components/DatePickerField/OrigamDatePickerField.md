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

## Slots

| Slot | Description |
|---|---|
| `prepend` | Content outside the field, left side |
| `append` | Content outside the field, right side |
| `prependInner` | Content inside the field, left |
| `appendInner` | Content inside the field, right |
| `floatingLabel` | Custom floating label |
| `label` | Custom label |
| `prefix` | Text prefix |
| `suffix` | Text suffix |
| `clear` | Custom clear control |
| `loader` | Custom loader |

## Emits

| Event | Payload | Description |
|---|---|---|
| `update:modelValue` | `string \| Date \| Array<...>` | Date selection changed |
| `update:menu` | `boolean` | Picker opened or closed |
