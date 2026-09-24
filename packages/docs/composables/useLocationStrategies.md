# useLocationStrategies

Runs a floating component's configured **location strategy**, re-armed on window
resize and on strategy change, inside a disposable toggle scope.

It is independent from [`useLocation`](./useLocation.md): no shared state, no
call dependency. `useLocation` maps a `location` prop to classes and styles;
this hook owns the *lifecycle* of an anchored positioner.

## API

```ts
function useLocationStrategies (
    props: ILocationStrategyProps,
    data: ILocationStrategyData
): {
    contentStyles: Ref<Record<string, string>>
    updateLocation: Ref<((e: Event) => void) | undefined>
}
```

```ts
interface ILocationStrategyData {
    contentEl: Ref<HTMLElement | undefined>
    target: Ref<HTMLElement | [x: number, y: number] | undefined>
    isActive: Ref<boolean>
}
```

`props.locationStrategy` accepts a key of `LOCATION_STRATEGIES`
(`'static' | 'connected'`) **or** a function with the same shape
`(data, props, contentStyles) => { updateLocation } | undefined`.

## ⛔ `locationStrategy="static"` positions nothing

`staticLocationStrategy` (`utils/Commons/location.util.ts`) has a body reduced
to `// TODO`. It returns `undefined`, so `updateLocation` stays `undefined` and
`contentStyles` stays `{}`.

Measured with a real content element and a real target attached to the document:

| `locationStrategy` | `contentStyles` | `updateLocation` |
|:---|:---|:---|
| `'static'` | `{}` | `undefined` |
| `'connected'` | `{"--origam-overlay-anchor-origin":"top right","transformOrigin":"bottom right","top":"12px","left":"12px","minWidth":"0px","maxWidth":"0px","maxHeight":"0px"}` | `function` |
| a custom function | — | `function`, and the function was called once |

Only `connected` and a custom function do anything. Do not describe `static` as
a working centring strategy.

## Lifecycle

All the wiring lives inside a single [`useToggleScope`](./useToggleScope.md)
armed on `data.isActive.value && props.locationStrategy`:

```ts
useToggleScope(() => !!(data.isActive.value && props.locationStrategy), reset => {
    watch(() => props.locationStrategy, reset)

    onScopeDispose(() => {
        window.removeEventListener('resize', handleResize)
        updateLocation.value = undefined
    })

    window.addEventListener('resize', handleResize, { passive: true })
    // … then instantiate the strategy
})
```

- The `resize` listener is added on scope entry and removed by the scope's own
  `onScopeDispose` — so it disappears when the overlay closes, when the strategy
  changes, and when the owner unmounts.
- A change of `props.locationStrategy` calls the scope's `reset`, which replays
  the whole block: old listener off, new strategy instantiated.
- `updateLocation` is cleared to `undefined` on teardown, so a stale positioner
  cannot be invoked after the fact.
- Outside a browser (`IN_BROWSER` false), **no scope is created at all** and the
  two refs keep their initial values.

`handleResize` is a thin `updateLocation.value?.(e)`, so a resize arriving
between teardown and re-arm is a no-op rather than a crash.

## Usage

```ts
import { computed, ref } from 'vue'
import { useLocationStrategies } from 'origam/composables'

const isActive = ref(false)
const contentEl = ref<HTMLElement>()
const targetEl = ref<HTMLElement>()

const props = defineProps<{ locationStrategy?: 'static' | 'connected' }>()

const { contentStyles, updateLocation } = useLocationStrategies(
    { ...props, location: 'bottom' } as never,
    { isActive, contentEl, target: targetEl }
)

const reposition = () => updateLocation.value?.(new Event('resize'))
const isAnchored = computed(() => !!updateLocation.value)
```

## Why this page exists

`useLocationStrategies` was claimed by **no lot** of the #545 campaign — neither
#600 (dimension / spacing / shape) nor the original perimeter of #601. It is
filed here because what it actually implements is a **lifecycle**: a scope, a
listener, a teardown and a re-arm. Its geometry is delegated wholesale to
`LOCATION_STRATEGIES`, which is a const, not a composable.

## Consumers

**1** component, verified by import: `OrigamOverlay`.

## Source

- `packages/ds/src/composables/Commons/locationStrategies.composable.ts`
- `packages/ds/src/consts/Commons/location.const.ts` — `LOCATION_STRATEGIES`.
- `packages/ds/src/utils/Commons/location.util.ts` — the two strategies.

## Related

- [`useActivator`](./useActivator.md) — supplies `target` / `targetEl`.
- [`useToggleScope`](./useToggleScope.md) — the scope and its `reset`.
- [`useLocation`](./useLocation.md) — the prop-to-style mapper, unrelated.
