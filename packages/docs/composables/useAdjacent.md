# useAdjacent · useAdjacentInner · useAccessibleCommand

The three hooks behind a component's **prepend / append zones** — the icon,
avatar or slot that sits beside the content, and the click event a consumer may
attach to it.

- `useAdjacent` — the **outer** zone (`prepend` / `append`).
- `useAdjacentInner` — the **inner** zone (`prependInner` / `appendInner` /
  `clear`), e.g. a text-field's clear button, inside the input's border.
- `useAccessibleCommand` — the single place the DS decides whether a non-native
  element may claim `role="button"`.

The two adjacent hooks are independent: no shared state, no call dependency.
Both delegate the role decision to `useAccessibleCommand`.

---

## `useAdjacent`

```ts
function useAdjacent (
    props: IAdjacentProps,
    prependIcon?: Ref | ComputedRef,
    appendIcon?: Ref | ComputedRef
)
```

The two icon refs are **optional**. When omitted, the matching prop is read
instead. Before that fallback existed, every consumer had to pass either a
`toRef(props, 'prependIcon')` or a derived computed, and forgetting one (as
`OrigamConfirmWrapper` did) crashed at render with *Cannot read properties of
undefined (reading 'value')*.

| Returned | Type | Meaning |
|:---|:---|:---|
| `hasPrependMedia` / `hasAppendMedia` | `ComputedRef<boolean>` | An avatar or an icon is present. |
| `hasPrepend` / `hasAppend` | `ComputedRef<boolean>` | Media **or** the matching slot. Normalised with `!!`. |
| `isPrependClickable` / `isAppendClickable` | `ComputedRef<boolean>` | A `click:prepend` / `click:append` listener is attached. |
| `prependCommandAttrs` / `appendCommandAttrs` | `ComputedRef<Record<string, unknown>>` | `{ role, tabindex, 'aria-label' }` — or `{}`. |
| `onClickPrepend` / `onClickAppend` | `(e: Event) => void` | Emit the event. |
| `onKeydownPrepend` / `onKeydownAppend` | `(e: KeyboardEvent) => void` | Enter / Space → `preventDefault()` + the click emit. |

### Why clickability is read from `vm.vnode.props`

`hasEvent(vm.attrs, 'click:prepend')` **alone is blind**: the host declares
`click:prepend` in `defineEmits<IAdjacentEmits>()`, so Vue strips any matching
listener out of `$attrs` before this composable can see it. `vm.vnode.props` is
the raw, pre-split object the parent template actually wrote, and still has it.
Both are checked, mirroring `useLink`'s `isClickable` (issue #397, where
`OrigamChip` / `OrigamListItem` — which declare `click` as an emit — were blind
while `OrigamCard`, which does not, was not).

### `role="button"` only when the zone can be named — #747

`prependCommandAttrs` / `appendCommandAttrs` replace the raw `:role` /
`:tabindex` bindings templates used to write by hand. They emit the role **and**
the name together, or neither. Measured, on a probe component:

| situation | `prependCommandAttrs.value` |
|:---|:---|
| no listener attached | `{}` |
| listener, **no** `prependAriaLabel` | `{}` + one dev warning |
| listener **and** `prependAriaLabel="Ouvrir"` | `{"role":"button","tabindex":0,"aria-label":"Ouvrir"}` |

**13** components bind these attrs: `Alert`, `Badge`, `BreadcrumbItem`,
`CardHeader`, `Chip`, `ConfirmWrapper`, `DataText`, `DataTitle`,
`DatePickerHeader`, `ExpansionPanelHeader`, `Field`, `Input`, `ListItem`.

### ⛔ `OrigamBtn` is the exception — and must stay one

Btn **does** import `useAdjacent`; it consumes `hasPrepend` / `hasAppend`,
`onClickPrepend` / `onClickAppend` and the two `is*Clickable` flags. What it
does **not** consume — and cannot — is the `*CommandAttrs` pair.

Btn's root renders as `<button>` or `<a>`. Both forbid an interactive-content
descendant and any descendant carrying `tabindex`, so promoting the prepend
`<span>` to a `role="button"` tab stop is illegal markup, not merely
undesirable. The fix applied to the other ten consumers is therefore not
available here.

That is why Btn's inherited `click:prepend` / `click:append` are **deprecated**
(#577) rather than repaired: they were never keyboard-reachable (a keyboard
activation synthesises its click on the component ROOT, which never reaches a
descendant listener), and there is no legal way to make them so. Btn only uses
the flags to warn:

```ts
onMounted(() => {
    if (isPrependClickable.value) warnDeprecatedEmit('OrigamBtn', 'click:prepend', ADJACENT_EMIT_REPLACEMENT)
    if (isAppendClickable.value) warnDeprecatedEmit('OrigamBtn', 'click:append', ADJACENT_EMIT_REPLACEMENT)
})
```

Two actions are two buttons: compose them with `<origam-btn-group>`. The
`prepend` / `append` **slots** are unaffected. `IBtnEmits` is marked
`@deprecated`, to drop `IAdjacentEmits` in v3.0.0.

> If you are about to "fix" Btn like the other ten, stop: the content model
> forbids it.

### Usage

```vue
<script setup lang="ts">
    import { useAdjacent } from 'origam/composables'
    import type { ICardHeaderProps } from 'origam/interfaces'

    const props = defineProps<ICardHeaderProps>()

    const {
        hasPrepend,
        prependCommandAttrs,
        onClickPrepend,
        onKeydownPrepend
    } = useAdjacent(props)
</script>

<template>
    <div class="origam-card-header">
        <span
            v-if="hasPrepend"
            class="origam-card-header__prepend"
            v-bind="prependCommandAttrs"
            @click="onClickPrepend"
            @keydown="onKeydownPrepend"
        >
            <slot name="prepend" />
        </span>
        <slot />
    </div>
</template>
```

### Consumers

**20** components, verified by import: `Alert`, `Badge`, `BreadcrumbItem`,
`Btn`, `Card`, `CardHeader`, `Chip`, `ConfirmWrapper`, `DataText`, `DataTitle`,
`DatePickerHeader`, `ExpansionPanelHeader`, `FileField`, `Input`, `ListItem`,
`NumberField`, `PasswordField`, `Tab`, `TextField`, `TextareaField`.

### Source

`packages/ds/src/composables/Commons/adjacent.composable.ts`

---

## `useAdjacentInner`

```ts
function useAdjacentInner (props: IAdjacentInnerProps)
```

Mirrors `useAdjacent` for the inner zone, plus the clear zone. Returned keys,
verified at runtime:

```
prependInnerCommandAttrs, appendInnerCommandAttrs,
hasPrependInnerMedia, hasPrependInner,
hasAppendInnerMedia, hasAppendInner,
hasClear,
isPrependInnerClickable, isAppendInnerClickable,
onClickPrependInner, onClickAppendInner,
onKeydownPrependInner, onKeydownAppendInner,
clickClear
```

::: danger There is no `isClearClickable`
The banner in this file described one for months, and the generated
`Commons.md` republished it. It exists **nowhere** in `packages/ds/src` — the
comment was its only occurrence in the repository. The clear zone has no
clickability flag and does not go through `useAccessibleCommand`: it only
renders (`v-show="dirty"`) when there is something to clear.
:::

### ⚠️ These three are not booleans

`hasPrependInner`, `hasAppendInner` and `hasClear` return the **slot function**
when the slot exists, the media boolean otherwise, and `hasClear` returns
`undefined` when neither `clearable` nor the `clear` slot is given. Measured on
a probe:

| input | `hasPrependInner.value` |
|:---|:---|
| `prependInner` slot provided | a **function** (the slot) |
| `prepend-inner-icon="i"` | `true` |
| nothing | `false` |

`hasClear` with neither `clearable` nor the slot: `undefined`.

Consume them for truthiness, never compare strictly against `true` / `false`.
`useAdjacent` normalises (`!!slots.prepend || …`) and does return real booleans
— **the two twins differ on this point**.

### `ownsKey` — the zone only claims its own keys (#614)

Enter and Space bubble up from anything the consumer renders in the slot.
Without a guard, the zone called `preventDefault()` on an event that was not
its own and killed the native activation of a real `<button>` placed inside it.
Measured in Chromium on `<OrigamInlineEdit show-actions>`, whose Cancel button
renders in `appendInner`, walking the keydown up the ancestor chain:

```
button.origam-btn                defaultPrevented = false
div.origam-field__append-inner   defaultPrevented = TRUE   ← here
div.origam-field                 defaultPrevented = true
```

No click was ever synthesised: Cancel was focusable but not actionable with
Space. The guard is `e.target === e.currentTarget`.

This is not a rare edge case: `OrigamTextField` binds `@click:append-inner` on
`<origam-field>` **unconditionally**, so `isAppendInnerClickable` is `true` on
every text field in the catalogue whether the consumer wired anything or not.

### Consumers

**6** components, verified by import: `Field`, `FileField`, `NumberField`,
`PasswordField`, `TextField`, `TextareaField`.

### Source

`packages/ds/src/composables/Commons/adjacentInner.composable.ts`

---

## `useAccessibleCommand`

```ts
function useAccessibleCommand (options: {
    component: string
    zone: string
    prop: string
    active: Ref<boolean> | ComputedRef<boolean>
    label: () => string | undefined
}): ComputedRef<Record<string, unknown>>
```

**The rule it encodes: the DS never emits an ARIA role it cannot name, and it
never invents the name.**

- A name is available → `{ role: 'button', tabindex: 0, 'aria-label': name }`.
- No name → **`{}`**: no role, no tab stop. The template's `@click` is
  untouched and still fires on mouse. A dev-only warning names the prop to add.

Measured, `active: true` and `label: () => undefined`: the computed is `{}` and
one warning is emitted, beginning
`[origam] <OrigamProbe> the "prepend" zone has a click listener but no accessible name, so …`.

`warnMissingAccessibleName` is silent outside `import.meta.env.DEV`, and
deduplicates on the `{component}::{zone}` pair — one warning per zone per
component type, not per instance.

Before #747, axe-core measured **54 `aria-command-name` nodes (impact
`serious`, WCAG 2.1 4.1.2 level A) across 17 components** on untouched
`develop` — every one announced to a screen reader as "button" and nothing else.

### Why not fabricate a default label

It would silence axe while telling a screen-reader user nothing about what the
control does. That failure mode already shipped once (#622: an auto-label that
overwrote a visible `<label for>`), and is why #653 chose a warning over a
fabricated string on the icon family. *No ARIA is better than bad ARIA.*

A **native** control cannot use this escape hatch — a `<button>` is a button
whether or not anyone named it. `OrigamBtn`'s icon-only mode keeps rendering its
`<button>` and only warns.

### Behaviour notes

- `label` is a **getter**, not a value, so the read stays inside the `computed`
  and a value coming from a theme's `components` block is seen at render time
  rather than snapshotted during `setup()` (ADR-005).
- The label is resolved through `useLocale(false).t` — an i18n key resolves, any
  other string is returned verbatim by the builtin adapter. Non-strict on
  purpose: the hook runs inside 13 components, several of which are mounted in
  unit tests without `createOrigam()`, where a strict `useLocale()` would throw.
- `active` is *raw clickability* for most consumers, and *clickability AND
  not-a-link* for the three `useLink` ones (`BreadcrumbItem`, `Chip`,
  `ListItem`), whose `<a>` root forbids a descendant tab stop — those three call
  this hook directly with their own gate.

### Consumers

**5** importers, verified by import: `BreadcrumbItem`, `Chip`, `ListItem`
(direct calls with their own gate) and the two adjacent composables.

### Source

`packages/ds/src/composables/Commons/accessibleCommand.composable.ts`

## Related

- [`useLink`](./useLink.md) — the `isClickable` twin, and the `<a>` root that
  forces the three direct callers.
