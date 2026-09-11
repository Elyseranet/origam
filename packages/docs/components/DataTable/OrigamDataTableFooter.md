# OrigamDataTableFooter

> Sub-component of the matching parent. See its parent's docs (`Origam`) for full context.

This file is a stub. The component's prop surface is exercised in
`stories/components/stories/.../OrigamDataTableFooter.story.vue`.

## Accessibility

The "Items per page" `<origam-select>` is given an accessible name via
`aria-labelledby`, pointing at the visible `<span>` label (a generated,
stable, per-instance id) — not a duplicated `aria-label`. `<OrigamSelect>`
also sets its own `aria-label`/`title` internally (tracked separately as
#622, an unrelated bug on `OrigamSelect` itself); `aria-labelledby` wins the
accessible-name computation regardless.
