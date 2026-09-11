# OrigamForm

`<OrigamForm>` is the form container that coordinates validation across all
registered child fields (TextField, NumberField, Checkbox, etc.). It provides
a `v-model` for the overall validity state, a `validateOn` strategy, and
exposes `submit` / `reset` helpers via slots.

## Basic usage with v-model

```vue
<script setup lang="ts">
import { ref } from 'vue'
const isValid = ref<boolean | null>(null)

function onSubmit(e: SubmitEvent) {
  // e is also a Promise that resolves with { valid, errors }
}
</script>

<template>
  <OrigamForm v-model="isValid" @submit.prevent="onSubmit">
    <OrigamTextField label="Email" type="email" :rules="[v => !!v || 'Required']" />
    <OrigamBtn type="submit" text="Submit" />
  </OrigamForm>
</template>
```

## Validate on

Controls when validation fires: `'input'`, `'blur'`, `'submit'`, `'lazy'`.

```vue
<template>
  <OrigamForm validate-on="blur">
    <OrigamTextField label="Name" :rules="[v => !!v || 'Required']" />
  </OrigamForm>
</template>
```

## Disabled / readonly

```vue
<template>
  <OrigamForm disabled>
    <OrigamTextField label="All disabled" />
  </OrigamForm>
</template>
```

## Fast fail

Stop validation at the first failed field.

```vue
<template>
  <OrigamForm fast-fail>
    <OrigamTextField label="Field 1" :rules="[v => !!v || 'Required']" />
    <OrigamTextField label="Field 2" :rules="[v => !!v || 'Required']" />
  </OrigamForm>
</template>
```

## Actions slot

```vue
<template>
  <OrigamForm>
    <OrigamTextField label="Name" />
    <template #actions="{ submit, reset }">
      <OrigamBtn text="Submit" @click="submit" />
      <OrigamBtn text="Reset"  @click="reset" variant="outlined" />
    </template>
  </OrigamForm>
</template>
```

## Slots

| Slot | Scope | Description |
|------|-------|-------------|
| `default` | — | Form fields |
| `actions` | `{ submit, reset }` | Action buttons with form helpers |
| `messages` | — | Global form messages |
| `message` | — | Single message override |

## Emits

| Event | Payload | Description |
|-------|---------|-------------|
| `submit` | `SubmitEvent & Promise<{ valid, errors }>` | Form submitted (awaitable) |
| `reset` | `Event` | Form reset |
| `update:modelValue` | `boolean \| null` | Overall validity changed |

## Typography props (`__details` surface)

Applied to the `__details` area (form-level messages row). All four props have a real visual effect because the `__details` SCSS block reads each matching CSS variable.

| Prop | Type | CSS variable |
|---|---|---|
| `fontSize` | `TFontSize` | `--origam-form__details---font-size` |
| `fontWeight` | `TFontWeight` | `--origam-form__details---font-weight` |
| `letterSpacing` | `TLetterSpacing` | `--origam-form__details---letter-spacing` |
| `lineHeight` | `TLineHeight` | `--origam-form__details---line-height` |

The `__details` div is only rendered when `hasMessages` is true (form has `errorMessages`, `messages`, or a `#message` slot).

## Design tokens

`<OrigamForm>` is a structural container. The `__details` typography tokens above are the only component-level tokens.
Individual field tokens apply to child components.
