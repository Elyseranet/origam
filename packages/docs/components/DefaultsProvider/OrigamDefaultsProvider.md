# OrigamDefaultsProvider

`<OrigamDefaultsProvider>` is a structurally transparent wrapper that injects a defaults map into the component tree below.

> ⛔ **Since ADR-005, calling `useDefaults()` is NOT required for a component to receive these defaults.** A global hook installed by `createOrigam()` (`installThemePropsResolver`, see `theme-props-resolver.composable.ts`) resolves the SAME injected map directly onto every component's `instance.props` — the object its template actually reads — for any prop a theme or a `<OrigamDefaultsProvider>` names. `useDefaults()` still exists and 39 built-in components still call it (mainly to read a resolved value inside their OWN `<script setup>` logic, not just the template), but it is no longer the mechanism that makes theming reach a component at all. See [Theming — how a prop default is actually resolved](../../integrations/theming-authoring.md#how-a-prop-default-is-actually-resolved) for the full mechanism and why it used to fail silently on 178 of 217 components.

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
