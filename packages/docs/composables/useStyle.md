# useStyle

Turns a reactive style bag into a real stylesheet rule — `#id { … }` — and
injects it into `<head>`. It is the widest-reach composable in the DS:
**141 components** use it.

Why a stylesheet instead of an inline `:style`? Because a rule in a sheet can
carry declarations an inline attribute cannot address the same way (custom
properties consumed by descendants, values a scoped rule needs to beat), and
because the id it generates is the same id the component binds to its root —
so the rule always finds its element.

`useStyle` owns two things only: **id resolution** and **style-bag
flattening**. The `<head>` plumbing is delegated to
[`useStyleTag`](#usestyletag) rather than duplicated.

## API

```ts
function useStyle (
    styles: ComputedRef,
    uniq: MaybeRefOrGetter<string | undefined> = undefined,
    name = getCurrentInstanceName()
): {
    id: ComputedRef<string>
    styleTagId: string
    css: Ref<string>
    load: () => void
    unload: () => void
    isLoaded: Readonly<Ref<boolean>>
}
```

| parameter | role |
|---|---|
| `styles` | the reactive bag to serialise — a Vue `StyleValue` (object, string, or nested arrays of either) |
| `uniq` | the id the caller wants its **root element** to carry. Reactive (ref or getter) so an `id` that only appears on a later render is picked up. Empty string and `undefined` both fall back |
| `name` | the block name used to build the fallback id. Defaults to the current instance name — so calling outside `setup()` throws |

`id` is what you bind to the root; `styleTagId` is the id of the injected
`<style>` element, and they are different values.

## Usage

```vue
<script setup lang="ts">
import { computed } from 'vue'
import { useStyle } from 'origam/composables'

const props = defineProps<{ id?: string, zIndex?: number }>()

const styles = computed(() => ({ zIndex: props.zIndex }))
const { id } = useStyle(styles, () => props.id)
</script>

<template>
    <div :id="id"><slot /></div>
</template>
```

Passing `() => props.id` is what makes a consumer-supplied `id` win over the
generated one **without orphaning the rule** — the generated selector targets
whatever `id` resolved to.

## Serialisation — measured

Input `[{ zIndex: 2000, backgroundColor: 'red' }, '--origam-x: 1', false, 0, undefined]`
in a component named `OrigamBtn` produces:

```
id        origam-btn-v-0
styleTagId origam_styletag_1
css       #origam-btn-v-0 {z-index: 2000;background-color: red;--origam-x: 1}
```

Rules the flattener applies, each for a reason:

- **camelCase keys become kebab-case.** The DOM normalises `zIndex` for you
  when you assign `element.style.zIndex`; a stylesheet never does — `zIndex: 2000`
  is not a declaration, `z-index: 2000` is. A key starting with `--` is left
  alone: custom-property names are case-sensitive.
- **Booleans and numbers are dropped.** `StyleValue` includes `false`, so a
  component declaring `style?: StyleValue` compiles to a runtime prop type
  containing `Boolean`, and Vue resolves an unpassed boolean-typed prop to the
  concrete value `false` — never `undefined`. A bare `false` inside the rule
  (`#id {false}`) is not a declaration: browsers discard it by error recovery
  and jsdom discards the **whole sheet** with *"Could not parse CSS
  stylesheet"*. Same for a bare `0`.
- **Arrays flatten recursively.** A single-level `.map().flat()` used to leave
  an object nested one array deep unexpanded, and it reached the sheet as the
  literal `[object Object]`. Measured: `[[{ color: 'blue' }]]` with
  `uniq = 'my-id'` → `#my-id {color: blue}`.
- **`undefined` values are filtered out** of an object bag; `null` and empty
  strings produce nothing.

An empty bag still emits a rule: `#origam-btn-v-0 {}`.

## Lifecycle

- `isLoaded` is `false` during `setup()`; the tag is injected `onMounted`.
  Measured `document.head` right after mount:
  `<style id="origam_styletag_1">#origam-btn-v-0 {z-index: 2000;…}</style>`.
- `load` and `unload` are exposed for manual control. `unload` removes the
  `<style>` element from `<head>`.
- `useStyleTag` also registers its own `tryOnMounted(load)`, so `load` runs
  twice on mount. The second call returns early on `isLoaded` — harmless.
- **Requires a component instance**: `getUid()` and `getCurrentInstanceName()`
  both throw outside `setup()`. The fallback id is resolved once, in setup,
  precisely because a reactive `uniq` can re-evaluate outside a render where
  `getCurrentInstance()` is `null`.

## Consumers

**141** component files in `packages/ds/src/components/` — effectively the
whole visual catalogue.

## Source

- `packages/ds/src/composables/Commons/style.composable.ts`
- Spec: `packages/tests/TU/composables/Commons/style.composable.spec.ts`

---

# useStyleTag

The `<head>` injection primitive. Creates (or reuses) a `<style>` element with
a given id and keeps its `textContent` in sync with a reactive CSS source.

```ts
function useStyleTag (
    css: MaybeRef<string>,
    options: IStyleTagOptions = {}
): {
    id: string
    css: Ref<string>
    unload: () => void
    load: () => void
    isLoaded: Readonly<Ref<boolean>>
}
```

| option | default | effect |
|---|---|---|
| `document` | `DEFAULT_DOCUMENT` | injection target; `undefined` on the server, where `load` is a no-op |
| `immediate` | `true` | register `load` on mount |
| `manual` | `false` | when true, neither the mount hook nor the scope-dispose `unload` is registered |
| `id` | `origam_styletag_<n>` | module-level counter, incremented per call |
| `media` | — | set as the element's `media` attribute, only when the element is created |

### The returned `css` is the ref you passed

Measured with `Object.is`: passing a `shallowRef` or a `computed` returns
**that same ref** — Vue's `createRef` short-circuits on an existing ref, and
`shallowRef` does not unwrap. Passing a plain string creates a new writable
ref.

The practical consequence: `useStyle().css` is the internal `computed`, so it
is **read-only**. Measured — writing to it logs
`[Vue warn] Write operation failed: computed value is readonly` and leaves the
value untouched. To drive a tag imperatively, call `useStyleTag` yourself with
a string or a writable ref.

### Consumers

**0** outside `composables/Commons/` — `useStyle` is its only caller in the
DS. It is exported for consumer apps and covered by
`packages/tests/TU/composables/Commons/style.composable.spec.ts`.

### Source

`packages/ds/src/composables/Commons/styleTag.composable.ts`

## Related

- [`useScopeId`](./useScopeId.md) — re-attaching a `<style scoped>` marker to
  teleported content.
- [`useTypography`](./useTypography.md) — emits a flat object specifically so
  it survives this serialiser.
