import type { TIcon } from '../../types'

export interface IAdjacentProps {
    appendAvatar?: string
    appendIcon?: TIcon
    prependAvatar?: string
    prependIcon?: TIcon
}

export interface IAdjacentInnerProps {
    appendInnerAvatar?: string
    appendInnerIcon?: TIcon
    prependInnerAvatar?: string
    prependInnerIcon?: TIcon
    clearIcon?: TIcon
    clearable?: boolean
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
