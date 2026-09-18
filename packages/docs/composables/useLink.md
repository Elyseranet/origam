# useLink

Resolves the **tag**, the **clickable state** and the **router-aware
navigation** of any link-like component — `Btn`, `Card`, `Chip`, `ListItem`,
`BreadcrumbItem`. It consumes the DS's own `useRoute`
(`composables/Commons/route.composable.ts`) for the exact-match `isActive`
derivation, and lives in its own file because it is a *consumer* of `useRoute`,
not a variant of it.

## API

```ts
function useLink (props: ILinkProps & ITagProps, attrs: SetupContext['attrs']): ILink
```

| Returned | Type | Meaning |
|:---|:---|:---|
| `tag` | `ComputedRef<string>` | `'a'` when the component is a link, else `props.tag ?? 'div'`. |
| `isLink` | `ComputedRef<boolean>` | `props.href` or `props.to` is set. |
| `isClickable` | `ComputedRef<boolean>` | A link, or a `click` listener is attached anywhere. |
| `href` | `Ref<string \| undefined>` | `props.href`, or the resolved route href when `to` is used. |
| `route` | vue-router's, optional | vue-router only. |
| `navigate` | vue-router's, optional | vue-router only. |
| `isActive` | `ComputedRef<boolean \| undefined>`, optional | vue-router only; honours `props.exact`. |

`ILink` declares the first four members outright and inherits the rest as
`Omit<Partial<ReturnType<typeof useLink>>, 'href'>` from vue-router — which is
why the last three are optional in the type as well as absent at runtime.

## ⚠️ Two shapes of return

When `resolveDynamicComponent('RouterLink')` does not resolve a component — no
vue-router installed — the function returns early with **only four keys**.
Measured, `Object.keys()` on a mount without a router:

```
["tag","isLink","isClickable","href"]
```

`route`, `navigate` and `isActive` are **absent**, not `undefined`. A consumer
destructuring them must treat them as optional.

Measured on the same probe:

| props | `tag` | `isLink` | `isClickable` | `href` |
|:---|:---|:---|:---|:---|
| *(none)* | `div` | `false` | `false` | — |
| `href="/a"` | `a` | `true` | — | `/a` |
| `tag="section"` | `section` | `false` | — | — |
| `onClick` attr | — | `false` | `true` | — |

## `isClickable` also reads `vnode.props` — #397

`hasEvent(attrs, 'click')` is blind whenever the **host** declares `click` as
one of its own emits (`OrigamChip`, `OrigamListItem`): Vue strips a listener
matching a declared emit out of `$attrs` entirely, on purpose, so the same click
does not fire twice. `vm.vnode.props` is the raw props object the parent wrote,
before that filtering.

Verified empirically in #397: mounting `OrigamChip` with only `onClick` reported
`Object.keys($attrs)` **empty** and `tabindex` `undefined` — the chip was
clickable by mouse (Vue's own emit forwarding still fired the handler) yet
permanently invisible to `isClickable`, so no tabindex, no ripple, no keyboard
activation ever appeared. `OrigamCard`, which does not declare `click` as an
emit, never hit this — which is why the negative control showed Card detecting a
plain `@click` correctly while Chip and ListItem did not. Two components, two
distinct bugs, not one defect copy-pasted.

The check is therefore fourfold:

```ts
isLink.value || hasEvent(attrs, 'click') || hasEvent(props, 'click') || hasEvent(vm.vnode.props ?? {}, 'click')
```

## ADR-005 — `tag` is lazy, `to` is still not

`useLink` runs in `setup()`, which Vue executes **before** the `beforeCreate`
hook where the theme-props resolver patches `instance.props`. Reading
`props.tag` as a plain string captured a value a theme had not yet had the
chance to set, and no later change could correct it. It is now a `computed`,
which first evaluates at render.

Measured before that changed: a theme setting `tag` on Btn, Card, Chip, ListItem
or BreadcrumbItem produced no change in the rendered markup.

::: danger `props.to` is still read eagerly
The router branch is decided once, in the `setup()` body:

```ts
const link = props.to ? RouterLink.useLink(props as UseLinkOptions) : undefined
```

`node packages/ds/scripts/guards/lib/setup-reads.mjs` still counts it as one of
its two remaining eager reads (`useLink [to]`, `useNested [opened]`). A theme
naming `to` on any of the five consumers is therefore never seen: the
"router component or not" decision is taken before the resolver runs.
:::

This composable is one of the two — with `useVModel` — whose eager reads broke
themed props on **16 components** before they were made lazy. Any new eager read
in a shared composable has that same blast radius.

## Usage

```vue
<script setup lang="ts">
    import { useAttrs } from 'vue'
    import { useLink } from 'origam/composables'
    import type { ICardProps } from 'origam/interfaces'

    const props = defineProps<ICardProps>()
    const attrs = useAttrs()

    const { tag, isLink, isClickable, href } = useLink(props, attrs)
</script>

<template>
    <component
        :is="tag"
        :href="isLink ? href : undefined"
        :tabindex="isClickable ? 0 : undefined"
        class="origam-card"
    >
        <slot />
    </component>
</template>
```

With vue-router present, guard the optional half:

```ts
const link = useLink(props, attrs)

const onClick = (e: MouseEvent) => {
    if (link.navigate && props.to) link.navigate(e)
}
```

## Behaviour notes

- **Requires an active instance.** It calls `getCurrentInstance('useLink')`,
  which throws outside `setup()`.
- `isActive` honours `props.exact`: without it, vue-router's own `isActive`; with
  it, `isExactActive` **and** a `deepEqual` comparison of the query strings
  against the current route.
- The three consumers whose root may render as `<a>` (`BreadcrumbItem`, `Chip`,
  `ListItem`) call [`useAccessibleCommand`](./useAdjacent.md) themselves, with a
  gate that also requires *not being a link* — an `<a>` forbids a descendant tab
  stop.

## Consumers

**5** components, verified by import from
`composables/Commons/link.composable`: `BreadcrumbItem`, `Btn`, `Card`, `Chip`,
`ListItem`.

> A name-based grep reports **7**, because
> `interfaces/Commons/link.interface.ts` and
> `interfaces/Commons/router.interface.ts` both import a **`useLink` from
> `vue-router`** to derive a return type. Counting by symbol name alone gets
> this wrong; counting by module path does not.

## Source

`packages/ds/src/composables/Commons/link.composable.ts`

## Related

- [`useAdjacent`](./useAdjacent.md) — the same `vnode.props` gap on
  `click:prepend` / `click:append`, and why Btn is the exception.
- [`useVModel`](./useVModel.md) — the other half of the 16-component
  eager-read regression.
