# useVModel

Turns **any** prop into a two-way binding — not only `modelValue`. It detects
by itself whether the prop is *controlled* (the parent passed both the prop and
its `onUpdate:` listener) or *uncontrolled* (the component owns the value), and
returns a single writable `computed` that behaves correctly in both cases.

It is the most-consumed composable of the design system: **55 importers** in
`packages/ds/src`, 41 of them components.

## API

```ts
function useVModel<
    Props extends object & { [key in Prop as `onUpdate:${Prop}`]?: TEventProp | undefined },
    Prop extends Extract<keyof Props, string>,
    Inner = Props[Prop],
> (
    props: Props,
    prop: Prop,
    defaultValue?: MaybeRefOrGetter<Props[Prop] | undefined>,
    transformIn?: (value?: Props[Prop]) => Inner,
    transformOut?: (value: Inner) => Props[Prop]
): TVModel<Props, Prop, Inner>
```

| Parameter | Role |
|:---|:---|
| `props` | The component's own props object. |
| `prop` | The prop name to bind — `'modelValue'`, `'focused'`, `'hover'`, `'page'`… |
| `defaultValue` | Seed used while the prop is `undefined`. Accepts a value, a `Ref` **or a getter** — pass `() => props.x` (see ADR-005 below). |
| `transformIn` | External shape → internal shape. Identity by default. |
| `transformOut` | Internal shape → external shape. Identity by default. |

The return is a writable `Ref` with one extra read-only member:

| Member | Type | Meaning |
|:---|:---|:---|
| `.value` (get) | `Inner` | `transformIn` applied to the external value (controlled) or to the internal one (uncontrolled). |
| `.value` (set) | `Inner` | Writes the internal ref **and** emits `update:{prop}`. Skipped when the value is unchanged. |
| `.externalValue` | `Props[Prop]` | The **untransformed** value, before `transformIn`. Read-only, defined via `Object.defineProperty`. |

## Controlled vs uncontrolled

Controlled means the parent wrote *both halves*. The check reads
`vm.vnode.props` — the raw object the parent rendered — not `props`, and it
accepts the kebab-case spelling as well:

```ts
has(prop) && has(`onUpdate:${prop}`)          // camelCase-only prop
(has(prop) || has(kebabProp)) &&
(has(`onUpdate:${prop}`) || has(`onUpdate:${kebabProp}`))   // prop with a kebab twin
```

Measured on a `loopMode` prop written as `loop-mode` / `onUpdate:loop-mode`:
the value reads back correctly, and writing emits **`update:loopMode`** (camel),
which Vue routes to the kebab listener. Both the emit record and the parent
callback received it.

When the binding is **not** controlled, a `watch` on `props[prop]` mirrors later
external changes into the internal ref — created inside a `useToggleScope`, so
it exists only while the binding stays uncontrolled.

## ⛔ The uncontrolled seed is read lazily — ADR-005

`useVModel` runs in `setup()`. Vue runs `setup()` **before** the `beforeCreate`
hook where the ADR-005 theme-props resolver patches `instance.props`. Seeding
the internal ref at call time therefore captured a pre-theme value that nothing
re-read afterwards — swapping a property descriptor is not a reactive change a
watcher can observe.

So the ref starts at the `UNSEEDED` **symbol** (not `undefined`, which is a
legitimate model value), and the seed is taken on first read, through the
`computed`, which first evaluates at render.

The same applies to the third argument: pass a **getter**.

```ts
import { useVModel } from 'origam/composables'

const props = defineProps<{ page?: number, defaultPage?: number }>()

// ❌ evaluated during the host's setup() — frozen before the theme lands
const eager = useVModel(props, 'page', props.defaultPage)

// ✅ resolved by toValue() inside seed(), at first read
const lazy = useVModel(props, 'page', () => props.defaultPage)
```

Measured before this changed: a theme setting `modelValue` on Alert or
NumberField, `focused` on any field, or `indeterminate` on Switch produced no
change in the rendered markup.

## Usage

```vue
<script setup lang="ts">
    import { computed } from 'vue'
    import { useVModel } from 'origam/composables'
    import type { ISwitchProps } from 'origam/interfaces'

    const props = defineProps<ISwitchProps>()

    const model = useVModel(props, 'modelValue', () => false)
    const isOn = computed(() => model.value === true)

    const toggle = () => {
        model.value = !model.value
    }
</script>

<template>
    <button type="button" role="switch" :aria-checked="isOn" @click="toggle">
        <slot />
    </button>
</template>
```

With transforms — the external prop is a string, the internal value a number:

```ts
import { useVModel } from 'origam/composables'

const props = defineProps<{ value?: string }>()

const count = useVModel<{ value?: string }, 'value', number>(
    props,
    'value',
    () => '0',
    (external) => Number(external ?? 0),
    (internal) => String(internal)
)
```

## Behaviour notes

- **Requires an active instance.** It calls `getCurrentInstance('useVModel')`,
  which throws `[Origam] useVModel must be called from inside a setup function`
  outside `setup()`.
- **A write that changes nothing emits nothing.** The setter compares against
  `toRaw(...)` of the current value and returns early when equal, or when
  `transformIn(value) === internalValue_`.
- **`vm.vnode.props` can be `null`** for a component rendered with no
  attributes at all; the `?? {}` fallback exists for that, and the check uses
  `Object.prototype.hasOwnProperty.call` rather than a direct method call.
- Measured, uncontrolled: `useVModel(props, 'modelValue', () => 'defaut')` reads
  back `'defaut'`, and after `model.value = 'ecrit'` the getter returns
  `'ecrit'` while `props.modelValue` stays `undefined` — the parent is not
  written to.
- Measured, controlled: the setter emits once, `[['neuf']]`.

## Consumers

**55** importers in `packages/ds/src`, verified by import statement:
41 components (every field, every selection control, Carousel, Dialog, Drawer,
Menu, Overlay, Pagination, Snackbar, Stepper, Tooltip…), 13 composables
(`focus`, `stateFlag`, `validation`, `group`, `nested`,
`date-picker-calendar`, the five `DataTable/*`, `Form/form`,
`Progress/progress`) and `utils/Commons/locale.util.ts`.

## Source

`packages/ds/src/composables/Commons/vModel.composable.ts`

## Related

- [`useStateFlag`](./useStateFlag.md) — built on it, for `hover` / `active`.
- [`useToggleScope`](./useToggleScope.md) — hosts the mirroring watch.
- [`useValidation`](./useValidation.md) — binds `modelValue` through it.
