# OrigamDatePickerMonth

> Sub-component of the matching parent. See its parent's docs (`Origam`) for full context.

This file is a stub. The component's prop surface is exercised in
`stories/components/stories/.../OrigamDatePickerMonth.story.vue`.

## `color`

Foreground-only (`IColorProps`). Repaints the month grid's text: weekday
labels, week numbers, and the day labels. A `TIntent` value resolves to the
intent's **own** hue (`fgSubtle`); a raw CSS colour is passed through
untouched. Gradients are not supported on this prop.

```vue
<origam-date-picker-month :month="4" :year="2026" color="primary"/>
```

Unlike most components, the value is not emitted as a `color:` declaration
on the root — it feeds two custom properties instead,
`--origam-date-picker__day---color` (read by every `&__day` cell) and
`--origam-btn---color` (read by the `<origam-btn>` that renders a day
label). Both of those elements declare their own `color`, so a value set on
the root, which acts only by inheritance, would never reach them. Setting
the tokens is what makes the prop actually paint — and it leaves the
selected day alone, which keeps its own
`--origam-date-picker__day---color-selected`.

Consequence for `:style` overrides: to force a colour on a single instance,
set the token rather than the property.

```vue
<origam-date-picker-month :style="{ '--origam-date-picker__day---color': '#ff0080' }"/>
```
