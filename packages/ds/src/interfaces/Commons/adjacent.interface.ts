import type { TIcon } from '../../types/Icon/icon.type'

/*********************************************************
 * IAdjacentProps
 *
 * @description
 * Media and accessible name of a component's OUTER prepend/append zone.
 *
 * @description
 * ⛔ issue #747 — `prependAriaLabel` / `appendAriaLabel` are what allow the
 * zone to become a real `role="button"` tab stop when `click:prepend` /
 * `click:append` is wired. Without one, `useAccessibleCommand` emits NO role
 * and NO tabindex rather than an anonymous ARIA button (WCAG 2.1 4.1.2), and
 * warns in development. Each accepts an i18n key or a literal string — the
 * same contract as the existing `closeLabel` on Alert / Chip / Dialog.
 ********************************************************/
export interface IAdjacentProps {
    appendAvatar?: string
    appendIcon?: TIcon
    prependAvatar?: string
    prependIcon?: TIcon
    prependAriaLabel?: string
    appendAriaLabel?: string
}

/*********************************************************
 * IAdjacentInnerProps
 *
 * @description
 * Same surface for the INNER zone — the one rendered inside the field
 * chrome rather than outside it.
 *
 * @description
 * ⛔ issue #747 — `prependInnerAriaLabel` / `appendInnerAriaLabel` carry the
 * accessible name, under exactly the contract described on `IAdjacentProps`.
 ********************************************************/
export interface IAdjacentInnerProps {
    appendInnerAvatar?: string
    appendInnerIcon?: TIcon
    prependInnerAvatar?: string
    prependInnerIcon?: TIcon
    clearIcon?: TIcon
    clearable?: boolean
    prependInnerAriaLabel?: string
    appendInnerAriaLabel?: string
}

/** Click events emitted when the user clicks the prepend/append slots. */
export interface IAdjacentEmits {
    (e: 'click:append', event: MouseEvent): void
    (e: 'click:prepend', event: MouseEvent): void
}

/** Slot signatures for adjacent prepend/append content. */
export interface IAdjacentSlots {
    prepend?: () => any
    append?: () => any
}

/**
 * Click events for the inner adjacent surface — these fire from icons
 * rendered INSIDE the input chrome (clear button, password toggle, etc.)
 * rather than from the outer prepend/append slots.
 */
export interface IAdjacentInnerEmits {
    (e: 'click:appendInner', event: MouseEvent): void
    (e: 'click:prependInner', event: MouseEvent): void
    (e: 'click:clear', event: MouseEvent): void
}

/** Slot signatures for inner adjacent content (renders inside the input). */
export interface IAdjacentInnerSlots {
    prependInner?: () => any
    appendInner?: () => any
    clear?: () => any
}
