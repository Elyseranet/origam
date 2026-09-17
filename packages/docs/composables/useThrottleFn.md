# useThrottleFn

Limits a function to **one call per `wait` window**, leading edge.

## API

```ts
function useThrottleFn<T extends unknown[], R = void> (
    fn: (...args: T) => R,
    wait: number
): (...args: T) => void
```

The returned wrapper always returns `void` — `fn`'s own return value is
discarded, which is why `R` defaults to `void`.

## Leading edge, no trailing call

The first call in a window goes through immediately; the following ones inside
the same window are **dropped**, not queued. Unlike a debounce, `fn` is never
invoked "late" after the last invocation.

Measured with `wait = 100` and fake timers:

```
f(1) ; f(2) ; f(3)      calls = [1]
+101 ms ; f(4)          calls = [1, 4]
```

Calls 2 and 3 are lost. If you need the *last* value of a burst, this is the
wrong primitive.

## ⚠️ No cleanup is returned

The internal `setTimeout` is not cancelled if the owner unmounts before `wait`
elapses. The consequence is bounded — the timer body only resets the internal
flag (`timer = null`) and **never calls `fn` again** — but the timer keeps
running in memory until it fires.

The source says so itself. There is nothing to call and nothing to dispose: the
hook returns a plain function, registers no lifecycle hook, and can be used
outside a component.

## Usage

```ts
import { useThrottleFn } from 'origam/composables'

const onScroll = useThrottleFn((e: Event) => {
    // eslint-disable-next-line no-console
    console.log((e.target as HTMLElement).scrollTop)
}, 16)

window.addEventListener('scroll', onScroll, { passive: true })
```

## Consumers

**1** component, verified by import: `OrigamParallax`.

## Source

`packages/ds/src/composables/Commons/throttle.composable.ts`

## Related

- [`useDelay`](./useActivator.md) — the other timer hook, with an explicit
  cancel and the `0` / absent asymmetry.
