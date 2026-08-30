# OrigamLoader

`<OrigamLoader>` is a thin **conditional wrapper** that toggles between two
slots based on a `loading` flag. It mirrors the loading-state contract used
by `<OrigamBtn>` (`loading` + `#loader` slot) so any container can opt into
the same UX with a single component.

When `loading` is truthy, the `#loader` slot is rendered (default: a small
indeterminate `<OrigamProgress type="circular">`). When `loading` is falsy,
the `#default` slot takes over.

## Basic usage

```vue
<template>
    <OrigamLoader :loading="isFetching">
        <article>{{ data }}</article>
    </OrigamLoader>
</template>
```

## Default spinner

If you do not provide a `#loader` slot, the component renders an indeterminate
`OrigamProgress` (circular, size `23`, stroke `2`) which inherits the `color`
prop. The `.origam-loader__progress` class is added directly on that spinner
so consumers replacing the slot get a clean DOM (no extra wrapper node).

```vue
<template>
    <OrigamLoader loading color="primary" />
</template>
```

## Custom loader (slot)

```vue
<template>
    <OrigamLoader :loading="isFetching">
        <template #loader>
            <span>Fetching, please wait...</span>
        </template>

        <article>{{ data }}</article>
    </OrigamLoader>
</template>
```

## Color (intent)

Origam v2 only accepts **semantic intent** values for `color`. The intent is
forwarded to the inner `<OrigamProgress>` so the spinner picks up the right
token-driven color.

```vue
<template>
    <OrigamLoader loading color="primary" />
    <OrigamLoader loading color="success" />
    <OrigamLoader loading color="danger" />
</template>
```

## Polymorphic tag

The wrapper element defaults to `<span>` but can be any tag.

```vue
<template>
    <OrigamLoader tag="div" :loading="isFetching">
        <p>Content</p>
    </OrigamLoader>
</template>
```

## Fullscreen

`fullscreen` switches the wrapper to `position: fixed`, covering the whole
viewport — a full-page loading overlay. Combine with `tag="div"` for a block
container.

```vue
<template>
    <OrigamLoader tag="div" fullscreen loading />
</template>
```

## States

| Prop          | Type                          | Description                                                                        |
|---------------|-------------------------------|-------------------------------------------------------------------------------------|
| `loading`     | `boolean \| number`           | Truthy renders the `#loader` slot; falsy renders `#default`.                        |
| `loadingText` | `string`                      | Translation **key** for the `aria-label`, resolved through `useLocale()`. Pass a key, not a literal. Defaults to `'origam.loading'` (the same key shared by `OrigamProgress`/`OrigamSkeleton`/`OrigamSwitch`). |
| `fullscreen`  | `boolean`                     | Renders the wrapper as a fixed, viewport-covering overlay.                          |
| `tag`         | `string`                      | Wrapper tag, defaults to `span`.                                                     |
| `color`       | `TIntent`                     | Forwarded to the inner spinner.                                                      |

## Slots

| Slot      | Description                                                                |
|-----------|----------------------------------------------------------------------------|
| `default` | Rendered when `loading` is falsy.                                          |
| `loader`  | Rendered when `loading` is truthy. Defaults to an indeterminate spinner.   |

## Props (interface)

```ts
interface ILoaderProps extends ICommonsComponentProps, ITagProps, IColorProps {
    loading?: boolean | number
    loadingText?: string
}

// <OrigamLoader>-only — see the interface file comment for why `fullscreen`
// does NOT live on the transverse ILoaderProps (ExpansionPanel/Card/Field/
// Btn/Switch/DataTable also extend it, and full-viewport positioning makes
// no sense for their inline loading states).
interface ILoaderComponentProps extends ILoaderProps {
    fullscreen?: boolean
}
```

## Anatomy

```html
<span class="origam-loader">
    <!-- when loading=true -->
    <OrigamProgress class="origam-loader__progress" type="circular" indeterminate />
    <!-- when loading=false -->
    <slot />
</span>
```

## Design tokens consumed

`<OrigamLoader>` reads from `tokens/component/loader.json`. The wrapper itself
is layout-only; the spinner color comes from `OrigamProgress`.

| CSS variable                              | Token reference                 |
|-------------------------------------------|---------------------------------|
| `--origam-loader---height`                | `100%`                          |
| `--origam-loader__progress---margin`      | `auto`                          |
| `--origam-loader__fullscreen---position`  | `fixed` (only applied when `fullscreen` is true) |
| `--origam-loader__fullscreen---height`    | `100vh`                         |
| `--origam-loader__fullscreen---width`     | `100vw`                         |

The full list lives in `tokens/component/loader.json`.

## Accessibility

- The wrapper carries `aria-busy` while loading, and an `aria-label` sourced
  from `t(loadingText)` (default key `'origam.loading'`) — swap `loadingText`
  for a more specific key when the surrounding context needs a more precise
  announcement (e.g. "Loading invoice details...").
- Further semantics come from the inner `OrigamProgress` (`role="progressbar"`).

## Theming notes

- The component is **theme-aware out of the box**. Switching
  `<html data-theme="dark">` re-resolves every variable instantly.
- Override the wrapper tokens locally with a `:style` binding when needed.

## Related

- `OrigamProgress` - dispatcher for circular / linear progress.
- `OrigamProgressCircular` - default spinner used by Loader.
- `OrigamBtn` - exposes the same `loading` + `#loader` slot contract.
