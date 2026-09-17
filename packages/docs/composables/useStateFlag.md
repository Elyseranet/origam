# useStateFlag · useFocus

Two v-model-backed interaction flags. `useStateFlag` is the merged
implementation behind **`hover`** and **`active`**; `useFocus` is the separate,
much smaller one behind **`focused`**.

::: warning `useHover` and `useActive` no longer exist
They were the same algorithm written twice — 33 of their 49 lines byte-identical
once the domain word was normalised — and were merged into `useStateFlag`,
driven by `options.state`. Nothing in `packages/ds/src` exports `useHover` or
`useActive` any more; several comments still name them, and the unit specs kept
their old file names (`hover.composable.spec.ts`, `active.composable.spec.ts`)
while importing `useStateFlag`.
:::

---

## `useStateFlag`

```ts
function useStateFlag<S extends TStateName> (
    props: object,
    options: IStateFlagOptions<S>
): IStateFlagReturn
```

| Option | Type | Role |
|:---|:---|:---|
| `state` | `'hover' \| 'active'` | The domain word. Drives the emitted class and which `*Class` prop is read. |
| `source` | `string` | The prop actually bound. Defaults to `state`, so a component can drive `active` off `modelValue`. |
| `name` | `string` | Class prefix. Defaults to `getCurrentInstanceName()`. |

| Returned | Type | Meaning |
|:---|:---|:---|
| `isOn` | `ComputedRef<boolean>` | The resolved state. |
| `config` | `ComputedRef<IStateEffectConfig \| undefined>` | The configuration object, when the prop holds one. |
| `classes` | `ComputedRef<Array<string>>` | `[]` when off; `['{name}--{state}']` plus the `hoverClass` / `activeClass` value when on. |
| `set` / `unset` | `() => void` | Force on / off. Mirror `mouseenter` / `mouseleave`. |
| `toggle` | `(force?: boolean \| null) => void` | Flip, or force when given a boolean. |

### The prop accepts three shapes

| `props[source]` | `isOn` | `config` |
|:---|:---|:---|
| `undefined` / `false` | driven by `set()` / `unset()` / `toggle()` | `undefined` |
| `true` | **forced on**, interaction ignored | `undefined` |
| `IStateEffectConfig` object | driven by `set()` / `unset()` / `toggle()`… | the object itself |
| `{ enabled: true, … }` | …**unless** `enabled: true`, which forces it on | the object itself |

Measured, `hover="{ bgColor: 'success' }"` with an `onUpdate:hover` listener
attached: `isOn` starts `false`, `config` is `{"bgColor":"success"}`; after
`set()`, `isOn` is `true`, `classes` is `["origam-x--hover"]`, and the prop is
**still** `{"bgColor":"success"}` — the config object survives.

That last point is the bug this merge fixed. The old hover-only version wrote
`vmodel.value = true` unconditionally on `mouseenter`, which for a controlled
config object emitted `true` back to the parent and destroyed it on the first
pointer entry. `set()`/`unset()`/`toggle()` now gate on the shape and flip a
local `internalToggle` ref when the value is an object.

Measured, `{ enabled: true, bgColor: 'primary' }`: `isOn` is `true`, and
`unset()` leaves it `true` — `forced` wins over everything.

### ⛔ `toggle(false)` does nothing on the boolean path

`toggle` takes an optional `force`, guarded by `typeof force === 'boolean'`
(**not** `force !== null` — the function is bound directly as a template handler
at several call sites, and Vue passes the native `Event` as the first argument;
a `!== null` guard would read that Event as a truthy force value). Measured,
`toggle(new Event('click'))` falls through to the normal toggle path and flips
the state, as intended.

But when it *is* given a boolean, `toggle` only writes `internalToggle` and
never touches the v-model — while `isOn` reads the boolean branch of the vmodel
**first** and only falls back to `internalToggle`. Measured, on a boolean
source: `set()` → `isOn === true`; `toggle(false)` → `isOn` is **still `true`**.

> The forced form is only meaningful for consumers whose prop carries a config
> object. To switch a boolean state off, call `unset()`.

### Usage

```vue
<script setup lang="ts">
    import { useStateFlag } from 'origam/composables'
    import type { IChipProps } from 'origam/interfaces'

    const props = defineProps<IChipProps>()

    const { isOn: isHover, classes: hoverClasses, set, unset } = useStateFlag(
        props,
        { state: 'hover', name: 'origam-chip' }
    )
</script>

<template>
    <span :class="hoverClasses" @mouseenter="set" @mouseleave="unset">
        <slot />
    </span>
</template>
```

Driving `active` off another prop:

```ts
import { useStateFlag } from 'origam/composables'

const props = defineProps<{ modelValue?: boolean, activeClass?: string }>()

const { isOn: isActive, toggle } = useStateFlag(props, {
    state: 'active',
    source: 'modelValue',
    name: 'origam-expansion-panel'
})
```

Measured with that exact shape and `activeClass: 'ma-classe'`: after `set()`,
`classes` is `["origam-w--active","ma-classe"]`.

### Behaviour notes

- **`classes` is an array.** `useFocus` returns an *object* instead — see below.
- The `*Class` prop is read as `(props as IHoverProps).hoverClass` /
  `(props as IActiveProps).activeClass`, deliberately **not** as a templated
  `props[\`${state}Class\`]`: the `unconsumed-props` guard's static scan only
  recognises the `(props as TYPE).literal` cast shape, and a templated key made
  those two props read as 30 new violations across the 24 migrated components.
- **`useStateEffect` consumes `config`** to swap effective values per axis. Note
  that it returns `colorClasses = []` whenever `isHover` / `isActive` /
  `isDisabled` is true — utility classes are static by design.

### Consumers

**24** components, verified by import: `Alert`, `Avatar`, `AvatarGroup`,
`Badge`, `BottomNav`, `BracketCompetitor`, `BracketMatch`, `BreadcrumbItem`,
`Btn`, `Card`, `Chip`, `Drawer`, `ExpansionPanel`, `ExpansionPanelHeader`,
`ExpansionPanels`, `Field`, `ListGroup`, `ListItem`, `Radio`,
`SelectionControl`, `Sheet`, `Switch`, `Table`, `Toolbar`. Plus two specs.

### Source

`packages/ds/src/composables/Commons/stateFlag.composable.ts`

---

## `useFocus`

```ts
function useFocus (props: IFocusProps, name = getCurrentInstanceName()): {
    focusClasses: ComputedRef<Record<string, boolean>>
    isFocused: TVModel<IFocusProps, 'focused'>   // Ref<boolean | undefined> + .externalValue
    onFocus: () => void
    onBlur: () => void
}
```

A 32-line file: `props.focused` through `useVModel` (so `update:focused` reaches
the parent), one class, and two handlers to bind on `@focus` / `@blur`. `name`
defaults to `getCurrentInstanceName()`.

```vue
<script setup lang="ts">
    import { useFocus } from 'origam/composables'
    import type { IFocusProps } from 'origam/interfaces'

    const props = defineProps<IFocusProps>()

    const { focusClasses, isFocused, onFocus, onBlur } = useFocus(props)
</script>

<template>
    <input :class="focusClasses" :aria-expanded="isFocused" @focus="onFocus" @blur="onBlur">
</template>
```

### Behaviour notes

- **`focusClasses` is an OBJECT**, not an array: measured,
  `{"origam-field--focused":false}` when blurred and
  `{"origam-field--focused":true}` when focused. The key is always present —
  bind it with `:class`, do not spread it into an array of strings and expect
  the falsy case to disappear.
- The seed passed to `useVModel` is the literal `false`, not a getter, so a
  theme naming `focused` is resolved through the lazy `UNSEEDED` path of
  `useVModel` rather than through this argument.
- `useFocus` is the third instance of the pattern `useStateFlag` already
  merged — tracked as **#542**. This page describes what exists; it does not
  settle that duplicate.

### Consumers

**11** components, verified by import: `Checkbox`, `Field`, `FileField`,
`NumberField`, `OtpInputField`, `PasswordField`, `Radio`, `SliderField`,
`Switch`, `TextField`, `TextareaField`.

### Source

`packages/ds/src/composables/Commons/focus.composable.ts`

## Related

- [`useVModel`](./useVModel.md) — both are built on it.
- [`useStateEffect`](./useStateEffect.md) — consumes `config` to repaint.
