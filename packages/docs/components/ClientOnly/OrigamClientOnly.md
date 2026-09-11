# OrigamClientOnly

`<OrigamClientOnly>` is an SSR utility wrapper: it renders its default
slot only after the component has mounted on the client, and renders an
optional `#fallback` slot (or a placeholder element) in the meantime —
i.e. during SSR and on the very first client paint before `onMounted`
fires. Use it to fence off markup whose *structure* depends on
something the server cannot know (`window.matchMedia`,
`IntersectionObserver`, a token only readable post-mount,
geolocation, …) and would otherwise cause a hydration mismatch.

It carries no styling and emits no events — it is pure rendering logic
(a boolean `ref` flipped in `onMounted`).

## Basic usage

```vue
<template>
    <section>
        <h2>{{ title }}</h2>

        <origam-client-only>
            <device-orientation-badge />

            <template #fallback>
                <div class="placeholder" aria-hidden="true" />
            </template>
        </origam-client-only>
    </section>
</template>

<script setup lang="ts">
import { OrigamClientOnly } from '@origam/components'
</script>
```

## Props

| Prop | Type | Default | Description |
|---|---|---|---|
| `placeholderTag` | `string \| undefined` | `undefined` | Tag rendered as the SSR/pre-mount placeholder when no `#fallback` slot is given. Left `undefined`, the SSR output is empty (no reserved layout). Set it (e.g. `'div'`) when the absence of a placeholder would cause layout shift on hydration. Rendered with `aria-hidden="true"`. |
| `placeholderClass` | `string \| undefined` | `undefined` | Class applied to the `placeholderTag` element. Pair the two to reserve dimensions matching the eventual client render and avoid cumulative layout shift. |

Both props are declared inline in the component's own
`defineProps<{ … }>()` rather than via a shared `I*Props` interface
under `src/interfaces/` — that is a deviation from this repo's "no type
declared in a `.vue` file" rule; flagged here as observed, not
corrected (out of scope for this doc task).

## Slots

| Slot | Bindings | Default content |
|---|---|---|
| default | — | Rendered only once `isMounted` is `true` (i.e. after `onMounted`). |
| `fallback` | — | Rendered while `isMounted` is `false` (SSR + first client render before mount). If omitted, falls back to the `placeholderTag` element (or nothing, if `placeholderTag` is also unset). |

This component declares no emits.

## Behaviour

- Server-side, `isMounted` starts `false`: the server renders
  `#fallback` (or the placeholder, or nothing).
- On the client, the exact same branch renders first (hydration-safe —
  same node as the server produced), then `onMounted` flips
  `isMounted` to `true` and Vue swaps in the default slot.
- There is no transition/animation between the two states; the swap is
  a plain reactive branch.

### Anti-pattern: wrapping everything

Don't wrap entire pages in `<OrigamClientOnly>` "just in case" — doing
so forfeits SSR's perceived-performance and SEO benefits. Wrap the
**smallest** node that actually diverges between server and client.

## Accessibility

- The generated placeholder (`placeholderTag`) is rendered with
  `aria-hidden="true"` since it carries no meaningful content for
  assistive technology.
- Because default-slot content only appears after mount, anything
  essential to the page's primary content or SEO should not be placed
  exclusively inside this component.

## Relationship with Nuxt's `<ClientOnly>`

The DS ships a Nuxt module (`packages/ds/src/nuxt/module.ts`) that
auto-registers every DS component — including this one — as a
**local, non-global** component via `addComponentsDir` (`global:
false`), so `<OrigamClientOnly>` / `<origam-client-only>` is
auto-imported in a Nuxt app without an explicit `import`. This is a
distinct component from Nuxt's own built-in `<ClientOnly>`: the two do
not share an implementation and do not conflict by name (`ClientOnly`
vs `OrigamClientOnly`). Reach for whichever one you already depend on
consistently in a given app; nothing in the DS requires using its own
`OrigamClientOnly` over Nuxt's.

See `packages/docs/guide/ssr.md` ("When you need `<OrigamClientOnly>`")
for the broader SSR-safety guidance this component fits into, including
its use alongside `useCssSupport()` / `useCssSupportClient()` for
hydration-safe feature detection.

## Examples

### Reserved placeholder (avoid layout shift)

```vue
<template>
    <origam-client-only placeholder-tag="div" placeholder-class="chart-placeholder">
        <live-chart />
    </origam-client-only>
</template>
```

### Explicit fallback content

```vue
<template>
    <origam-client-only>
        <user-avatar :src="clientOnlyAvatarUrl" />

        <template #fallback>
            <span class="skeleton-circle" aria-hidden="true" />
        </template>
    </origam-client-only>
</template>
```

### Branching a CSS-feature-gated layout

```vue
<template>
    <origam-client-only>
        <css-grid-layout v-if="css.containerQueries" />
        <flex-fallback v-else />
    </origam-client-only>
</template>

<script setup lang="ts">
import { useCssSupport } from '@origam/composables'

const { css } = useCssSupport()
</script>
```
