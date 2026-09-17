# useEventListener

Attaches one or more listeners to one or more events on a **reactive** target,
returns a `stop()` that detaches everything, and detaches on scope disposal by
itself.

## API

Two overloads. Both return `() => void`.

```ts
// Implicit target — window
function useEventListener (
    events: string | Array<string>,
    listeners: EventListenerOrEventListenerObject | Array<EventListenerOrEventListenerObject>,
    options?: MaybeRefOrGetter<AddEventListenerOptions | undefined>
): () => void

// Explicit target
function useEventListener (
    target: TEventListenerTarget,
    events: string | Array<string>,
    listeners: EventListenerOrEventListenerObject | Array<EventListenerOrEventListenerObject>,
    options?: MaybeRefOrGetter<AddEventListenerOptions | undefined>
): () => void
```

The short form is selected at runtime by `typeof args[0] === 'string' ||
Array.isArray(args[0])`, and falls back to `window` — or to `undefined` when
`window` does not exist, i.e. under SSR.

`target` may be an element, a `Ref` or getter of one, `document` / `window`, or
a nullable value. `events` and `listeners` are both normalised to arrays and
crossed: *n* events × *m* listeners registrations.

## Registration and re-registration

A single `watch` on `[unrefElement(target), resolveUnref(options)]`, with
`immediate: true` and **`flush: 'post'`**, drives everything:

```ts
cleanup()                       // detach everything currently attached
if (!el) return                 // nothing to attach to — yet
cleanups.push(...events.flatMap(…))
```

::: warning It re-attaches everything, never diffs
Any change of target **or options** tears down all registrations and rebuilds
them. An `options` object rebuilt on every render — an inline literal — makes
the listeners detach and re-attach on every tick instead of staying put. Pass a
stable object, or a getter returning one.
:::

## The nullish guard is on the *argument*, not on its value

```ts
if (!target) return noop
```

This fires when the **target argument itself** is nullish, not when a `Ref`
happens to hold `null`. A `Ref` object is truthy, so the watch is created and
the listener attaches as soon as the ref is filled.

Measured: `useEventListener(ref(null), 'click', fn)`, then filling the ref and
dispatching a click on the new element — **the handler ran**. Passing a literal
`null` or `undefined` as the target instead returns `noop` and nothing is ever
watched.

Measured on a normal target: one dispatch → 1 call; after `stop()` → still 1.

## Teardown

- `stop()` stops the watch **and** runs the accumulated cleanups.
- `tryOnScopeDispose(stop)` registers the same `stop` on the owning scope, so a
  component that forgets to call it is still cleaned up on unmount. `tryOn…`
  means it is a no-op when there is no active scope — the hook is usable outside
  a component, at the cost of owning the teardown yourself.

## Usage

```vue
<script setup lang="ts">
    import { ref } from 'vue'
    import { useEventListener } from 'origam/composables'

    const el = ref<HTMLElement | null>(null)

    useEventListener(el, [ 'pointerdown', 'pointerup' ], (e: Event) => {
        // eslint-disable-next-line no-console
        console.log(e.type)
    })
</script>

<template>
    <div ref="el">Zone sensible</div>
</template>
```

Window form, with a stable options object and manual teardown:

```ts
import { useEventListener } from 'origam/composables'

const OPTIONS = { passive: true } as const

const stop = useEventListener('scroll', () => { /* … */ }, OPTIONS)
// later
stop()
```

## Behaviour notes

- `unrefElement` / `resolveUnref` (`utils/Commons/eventListener.util.ts`)
  predate `TEventListenerTarget` and only accept a bare `Ref`; both no-op on a
  non-Ref value, since `unref()` returns its argument unchanged. The cast at the
  call site is an internal bridge to that older utility, not part of the public
  signature.
- `flush: 'post'` means the first attachment happens **after** the initial
  render, so a template ref is already populated.
- The generated reference `Commons.md` lists this symbol three times — the two
  overload declarations plus the implementation. It is **one** exported symbol.

## Consumers

**1** importer in `packages/ds/src`, verified by import:
`composables/Commons/dragResizer.composable.ts`. Plus one unit spec. Most
components in the DS register their listeners directly in `onMounted` /
`onBeforeUnmount` rather than through this hook — `useTouch`, `useHotkey` and
`useLocationStrategies` all do.

## Source

`packages/ds/src/composables/Commons/eventListener.composable.ts`
