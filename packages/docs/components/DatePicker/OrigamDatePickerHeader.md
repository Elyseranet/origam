# OrigamDatePickerHeader

> Sub-component of the matching parent. See its parent's docs (`Origam`) for full context.

This file is a stub. The component's prop surface is exercised in
`stories/components/stories/.../OrigamDatePickerHeader.story.vue`.

## `color`

Foreground-only (`IColorProps`). Paints the header text, and — through
`currentColor` — the prepend / append icons. A `TIntent` value resolves to
the intent's **own** hue (`fgSubtle`), the shade meant for coloured text on
a light surface; a raw CSS colour is passed through untouched. The prop
paints nothing else: the header owns no surface, so use the parent's
`bgColor` for that.

```vue
<origam-date-picker-header header="May 8, 2026" color="primary"/>
```
