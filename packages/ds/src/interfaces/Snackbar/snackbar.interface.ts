import type { IActiveProps } from '../Commons/active.interface'
import type {
    IBgColorProps,
    IColorProps
} from '../Commons/color.interface'
import type { IBorderProps } from '../Commons/border.interface'
import type {
    ICommonsComponentEmits,
    ICommonsComponentProps,
    ITagProps
} from '../Commons/commons.interface'
import type { IElevationProps } from '../Commons/elevation.interface'
import type { IHoverProps } from '../Commons/hover.interface'
import type { ILocationProps } from '../Commons/location.interface'
import type { IMarginProps } from '../Commons/margin.interface'
import type { IOverlayProps } from '../Overlay/overlay.interface'
import type { IPaddingProps } from '../Commons/padding.interface'
import type { IPositionProps } from '../Commons/position.interface'
import type { IRoundedProps } from '../Commons/rounded.interface'
import type { IStatusProps } from '../Commons/status.interface'
import type { ITransitionComponentProps } from '../Commons/transition-component.interface'

export interface ISnackbarProps extends ICommonsComponentProps, ITagProps, IStatusProps, IColorProps, IBgColorProps, IOverlayProps, IPositionProps, ILocationProps, IRoundedProps, IBorderProps, IPaddingProps, IMarginProps, IElevationProps, ITransitionComponentProps, IActiveProps, IHoverProps {
    multiLine?: boolean
    text?: string
    timer?: boolean | string
    timeout?: number | string
    vertical?: boolean
}

/* `<OrigamSnackbar>` ne déclarait AUCUN emit alors que son
 * `useVModel(props, 'modelValue')` est écrit à l'expiration du `timeout`
 * (`isActive.value = false`) et au swipe-to-dismiss (`handleTouchend`).
 * Comme pour `<OrigamRadioGroup>`, Vue n'avertit pas — pas d'option
 * `emits`, pas de contrôle — et le symptôme était `onUpdate:modelValue`
 * bloqué dans `$attrs`. Prouvé au runtime dans
 * `packages/tests/TU/origam/relay-emits-declaration.spec.ts`. */
/** Emits fired by `<OrigamSnackbar>` — fermeture auto ou par geste. */
export interface ISnackbarEmits extends ICommonsComponentEmits {}

/** Slot signatures for `<OrigamSnackbar>` — the nested
 *  `<OrigamSnackbarItem>`'s `prepend` / `title` / `message` chrome,
 *  plus the unscoped `default` and the `action` slot. */
export interface ISnackbarSlots {
    prepend?: () => any
    title?: () => any
    text?: () => any
    message?: () => any
    default?: () => any
    action?: (data: { isActive: boolean }) => any
}
