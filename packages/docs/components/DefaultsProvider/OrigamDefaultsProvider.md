# OrigamDefaultsProvider

`<OrigamDefaultsProvider>` is a structurally transparent wrapper that injects a defaults map into the component tree below. Any origam component that calls `useDefaults()` internally will receive these defaults as its resolved prop values.

## Basic usage

```vue
<template>
    <OrigamDefaultsProvider
        :defaults="{
            global:       { density: 'comfortable' },
            'origam-btn': { color: 'primary', variant: 'flat' }
        }"
    >
        <!-- OrigamBtn here will default to color=primary, variant=flat -->
        <OrigamBtn text="Confirm" />
    </OrigamDefaultsProvider>
</template>
```

## Defaults map

The `defaults` prop accepts an object where:
- `global` applies to **every** origam component in the subtree
- any other key is matched against the component's kebab-case instance name (`'origam-btn'`, `'origam-chip'`, etc.)

```ts
interface IDefault {
    global?: Record<string, unknown>
    [componentName: string]: Record<string, unknown> | undefined
}
```

## Scoping and inheritance

By default the provider **merges** its map with any parent `OrigamDefaultsProvider`. Use the following props to control inheritance:

| Prop | Type | Description |
|---|---|---|
| `defaults` | `IDefault` | The defaults map |
| `scoped` | `boolean` | Do not inherit parent defaults |
| `reset` | `string \| number` | Same as `scoped`, with a discriminator value for DevTools |
| `root` | `string \| number` | Same as `reset`, signals top-of-tree intent |
| `disabled` | `boolean` | Pass parent defaults through unchanged (disable this provider) |

## Slots

| Slot | Description |
|---|---|
| `default` | The subtree that receives the injected defaults |

## Emits

`OrigamDefaultsProvider` emits no events.

## Notes

- The component renders no DOM element of its own — it is fully transparent.
- Every origam Group component (`OrigamBtnGroup`, `OrigamChipGroup`, etc.) uses `OrigamDefaultsProvider` internally to push density / variant / color defaults to its children.
