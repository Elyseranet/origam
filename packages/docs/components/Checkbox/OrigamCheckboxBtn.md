# OrigamCheckboxBtn

The bare checkbox control — the check itself, without the `<OrigamInput>`
chrome (label block, validation messages, details).

```vue
<origam-checkbox-btn
    v-model="accepted"
    label="I agree"
/>
```

## When to use which

| Component | Use it when |
|---|---|
| `OrigamCheckboxBtn` | You want **only** the control — inside a table cell, a list row, a toolbar, or any layout that already owns its labelling and error display. |
| `OrigamCheckbox` | You want the full form field: label block, validation messages, details, focus state. It wraps this component. |
| `OrigamCheckboxGroup` | You want several checkboxes bound to one `v-model`, with a group label and shared validation. |

## Props

| Prop | Type | Default | Description |
|---|---|---|---|
| `modelValue` | `any` | — | Bound value. An **array** turns on accumulation (see below). |
| `value` | `any` | — | The value written to the model when checked. Falls back to `trueValue`, then `true`. |
| `trueValue` | `any` | — | Explicit checked value. Wins over `value`. |
| `falseValue` | `any` | `false` | Value written when unchecked (single mode only). |
| `multiple` | `boolean` | *auto* | Accumulate into an array. **Leave it unset** unless you mean it — see the warning below. |
| `label` | `string` | — | Inline label rendered next to the control. |
| `indeterminate` | `boolean` | `false` | Renders the mixed state and sets `aria-checked="mixed"`. Cleared on the next user change. |
| `indeterminateIcon` | `TIcon` | — | Icon for the mixed state. |
| `trueIcon` / `falseIcon` | `TIcon` | — | Icons for checked / unchecked. |
| `valueComparator` | `(a, b) => boolean` | — | How values are matched inside an array model. Supply it for object values. |
| `disabled` · `readonly` · `required` · `error` · `name` · `inline` | | | Standard control surface. |

> ⛔ **Do not pass `multiple` "just to be explicit".** Vue's boolean-prop
> coercion resolves an *unset* boolean prop to the concrete value `false`,
> never to `null`. `OrigamSelectionControl` auto-detects array mode with
> `props.multiple == null && Array.isArray(model)` — so forwarding a
> `false` you did not mean **switches accumulation off** and every click
> overwrites the previous one, silently. That is exactly how the data-loss
> bug of #396 travelled down the chain.

## Emits

| Event | Payload | Description |
|---|---|---|
| `update:modelValue` | `any` | Fired on toggle. Carries the **array** in accumulation mode. |
| `update:indeterminate` | `boolean` | Fired when the mixed state is cleared by a user change. |
| `click:label` | `MouseEvent` | The label element was clicked. |

> ⛔ **`update:focused` is NOT emitted, and is no longer declared.** This
> component has no focus handling at all — no `focus`/`blur` handler, no
> `useFocus` call — and `focused` is not even one of its props. The event
> was declared through `IFocusEmits` and could never fire: a dead API
> surface, removed under the inspection grid's C5 criterion.
>
> Use **`OrigamCheckbox`** if you need it — it calls `useFocus(props)`,
> whose `useVModel(props, 'focused')` emits `update:focused` for real.

## Slots

| Slot | Scope | Description |
|---|---|---|
| `default` | `{ model, color, bgColor, icon, props }` | Replaces the rendered control entirely. |
| `label` | — | Replaces the inline label. |
| `input` | `{ props, icon, textColorStyles, backgroundColorStyles, model }` | Replaces the `<input>` and its icon. |

## Accumulation

An array `modelValue` accumulates:

```vue
<origam-checkbox-btn v-model="selected" value="a" label="A" />
<origam-checkbox-btn v-model="selected" value="b" label="B" />
<!-- selected === ['a', 'b'] once both are checked -->
```

Checking adds the control's `value`, unchecking removes it. Both controls
must share the **same** `v-model` — the accumulation is computed from the
current model, not from a local flag.

## Accessibility

The rendered element is a real `<input type="checkbox">`, so the checked
state, keyboard interaction and screen-reader semantics are the browser's,
not a re-implementation. `label for` points at the input's id, `disabled`
and `name` reach the control, and `indeterminate` produces
`aria-checked="mixed"`.
