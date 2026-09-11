import type {
    ICommonsComponentProps,
    IGroupItemProps,
    ITagProps,
    ITypographyProps
} from '../../interfaces'

import type { TIcon } from '../../types'

/**
 * Props for `<OrigamTab>` — a single registered tab inside an
 * `<OrigamTabs>` tablist.
 *
 * The slot scope is the default text label. Optional `icon` /
 * `appendIcon` render at the leading / trailing edge respectively.
 *
 * ARIA wiring (`role="tab"`, `aria-selected`, `aria-controls`, `id`,
 * `tabindex`) is computed inside the component — consumers only
 * provide `value` (the canonical identifier) and `disabled`.
 *
 * Typography props (`fontSize`, `fontWeight`, `letterSpacing`) override
 * the matching `--origam-tabs__item---*` variables on the tab element.
 * `lineHeight` is intentionally excluded — the SCSS hard-codes `line-height: 1`
 * with no CSS-var hook.
 */
export interface ITabProps extends ICommonsComponentProps, ITagProps, IGroupItemProps, ITypographyProps {
    tag?: string
    icon?: TIcon
    appendIcon?: TIcon
}
