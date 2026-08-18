import type {
    IActiveProps,
    IBgColorProps,
    IBorderProps,
    IColorProps,
    ICommonsComponentEmits,
    ICommonsComponentProps,
    IElevationProps,
    IHoverProps,
    ILocationProps,
    IMarginProps,
    IOverlayProps,
    IPaddingProps,
    IPositionProps,
    IRoundedProps,
    IStatusProps,
    ITagProps,
    ITransitionComponentProps
} from '../../interfaces'

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
