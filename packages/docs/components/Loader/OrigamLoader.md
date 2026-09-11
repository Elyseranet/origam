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

## States

| Prop          | Type                          | Description                                                  |
|---------------|-------------------------------|--------------------------------------------------------------|
| `loading`     | `boolean \| number`           | Truthy renders the `#loader` slot; falsy renders `#default`. |
| `loadingText` | `string`                      | Optional aria/visual hint shown alongside the spinner.       |
| `tag`         | `string`                      | Wrapper tag, defaults to `span`.                             |
| `color`       | `TIntent`                     | Forwarded to the inner spinner.                              |

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
| `--origam-loader__fullscreen---position`  | `fixed`                         |
| `--origam-loader__fullscreen---height`    | `100vh`                         |
| `--origam-loader__fullscreen---width`     | `100vw`                         |

The full list lives in `tokens/component/loader.json`.

## Accessibility

- The wrapper does not impose an ARIA role — semantics come from the inner
  `OrigamProgress` (`role="progressbar"`).
- Provide `loadingText` if the surrounding context needs an extra hint for
  screen readers.

## Theming notes

- The component is **theme-aware out of the box**. Switching
  `<html data-theme="dark">` re-resolves every variable instantly.
- Override the wrapper tokens locally with a `:style` binding when needed.

## Related

- `OrigamProgress` - dispatcher for circular / linear progress.
- `OrigamProgressCircular` - default spinner used by Loader.
- `OrigamBtn` - exposes the same `loading` + `#loader` slot contract.
