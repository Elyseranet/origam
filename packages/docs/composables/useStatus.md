# useStatus

Translates a component's `status` prop (`success` | `info` | `warning` |
`error`) into everything the status has to drive: an icon, the slot that icon
goes in, a modifier class, and a **forced** colour intent.

## API

```ts
function useStatus (
    props: IStatusProps & IAdjacentProps,
    name = getCurrentInstanceName()
): {
    icon: ComputedRef<unknown>
    appendIcon: ComputedRef<unknown>
    prependIcon: ComputedRef<unknown>
    statusClasses: ComputedRef<string[]>
    statusIntent: ComputedRef<TColor | undefined>
}
```

`IStatusProps` carries `status?: TStatus` and
`statusIconPosition?: TStatusPosition` and extends `IIconProps`, so `icon`,
`prependIcon` and `appendIcon` are read from the same props bag they are
returned in — the composable *resolves* those three, it does not add them.

`name` defaults to the current instance name, so calling outside `setup()`
without an explicit `name` throws.

## Usage

```vue
<script setup lang="ts">
import { useStatus } from 'origam/composables'
import type { IStatusProps } from 'origam/interfaces'

const props = defineProps<IStatusProps>()
const { prependIcon, appendIcon, statusClasses, statusIntent } = useStatus(props)
</script>

<template>
    <div :class="statusClasses">
        <OrigamIcon v-if="prependIcon" :icon="prependIcon" />
        <slot />
        <OrigamIcon v-if="appendIcon" :icon="appendIcon" />
    </div>
</template>
```

## Icon placement

The icon name is always `$` + the status (`$success`, `$info`, `$warning`,
`$error`). Where it lands depends on `statusIconPosition`. The *(unset)*,
`'both'` and `'replace'` rows below were measured; `'prepend'` and `'append'`
are read from the same branch (`effectivePosition` collapses an unset value to
`'prepend'` before the comparison).

| `statusIconPosition` | `prependIcon` | `appendIcon` | `icon` |
|---|---|---|---|
| *(unset)* | `$<status>` | `undefined` | `undefined` |
| `'prepend'` | `$<status>` | `undefined` | `undefined` |
| `'append'` | `undefined` | `$<status>` | `undefined` |
| `'both'` | `$<status>` | `$<status>` | `undefined` |
| `'replace'` | `undefined` | `undefined` | `$<status>` |

⚠️ **Unset means PREPEND, not "everywhere".** The previous logic treated
`undefined` as "render at every slot", which painted the icon twice — prepend
*and* append — inside `OrigamAlert`. Omitting the prop now yields a single
prepend icon, the common Material / Bootstrap pattern; `'append'`, `'both'`
and `'replace'` are explicit opt-ins.

**A consumer-supplied icon always wins.** If `prependIcon` is already set,
`useStatus` returns it unchanged rather than the status icon. Measured:
`{ status: 'error', prependIcon: '$custom' }` → `prependIcon` is `$custom`.

With no `status` at all, everything comes back `undefined` and
`statusClasses` is `[]`.

## `statusClasses` and `statusIntent`

- `statusClasses` is `['{name}--{status}']` — e.g. `origam-alert--error` —
  and `[]` when no status is set.
- `statusIntent` is the **forced** colour intent, **not overridable** by the
  consumer's `color` / `bgColor`: a status whose colour could be overridden
  would be cosmetically pointless. `error` maps to the `danger` intent
  (`TStatus` says `error`, `TIntent` says `danger`); `success`, `info` and
  `warning` map 1:1.

A `status` string outside the four is passed straight through as a colour
value. It is not an intent, so nothing paints — it does still produce a
`{name}--{status}` class.

[`useStateEffect`](./useStateEffect.md) implements the same status→intent
mapping independently, in its own `statusToIntent` table, and applies it to
the colour axis. Reading `statusIntent` from here is the path for components
that do not route through `useStateEffect`.

## Consumers

**5** components: `Alert`, `Badge`, `Btn`, `Dialog`, `Snackbar`. Plus
`packages/tests/TU/composables/Commons/status.composable.spec.ts` and
`status-color-override.spec.ts`.

## Source

`packages/ds/src/composables/Commons/status.composable.ts`

## Related

- [`useStateEffect`](./useStateEffect.md) — where a status actually repaints
  the surface.
- [`useColor`](./useColor.md) — the intent tokens a status resolves to.
