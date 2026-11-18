import type { TCardContentDisplay } from '../../types/Card/card.type'

/*********************************************************
 * IContentProps
 *
 * @description
 * Layout of the `.origam-*__content` wrapper around a component's default slot
 * (Card, Form). Both ride INLINE on that wrapper, never as a custom property on
 * the root: a custom property would inherit into any Card/Form nested in the
 * slot. Unset, the `--origam-{cmp}__content---display|gap` tokens apply.
 ********************************************************/
export interface IContentProps {
    /*********************************************************
     * contentDisplay
     *
     * @description
     * `display` of the content wrapper. `contents` flattens it into the host's own layout.
     ********************************************************/
    contentDisplay?: TCardContentDisplay
    /*********************************************************
     * contentGap
     *
     * @description
     * `gap` between the blocks of the content wrapper — a CSS length, or a number read as px. Needs `flex` / `grid`.
     ********************************************************/
    contentGap?: string | number
}
