import type { TTransitionProps } from '../../types/Transition/transition.type'

/*********************************************************
 * ITransitionComponentProps
 *
 * @description
 * The "does this component accept a `transition` override" mixin —
 * `transition?: boolean | string | TTransitionProps`. Consumed by
 * `<OrigamTransition>` itself AND, transversally, by Badge, BottomNav,
 * ColorPickerField, Counter, DatePickerField, Drawer, Img, Messages,
 * Overlay, Select, Snackbar, Tooltip, and Window — 13 families outside
 * Transition.
 *
 * @description
 * Issue #364 moved this out of `interfaces/Transition/transition.
 * interface.ts` into Commons: leaving it there would force every one
 * of those 13 unrelated families to reach into the Transition module
 * once #14/ADR-006 splits families into packages — exactly the
 * inter-family coupling the modularisation work is meant to remove.
 * `ITransitionProps` (the 14-way shared surface across the Transition
 * wrapper components themselves — Fade, SlideX/Y, ExpandX/Y,
 * ScaleRotate, TranslateScale, …) stays in the Transition family: that
 * sharing is intra-family and does not block the split.
 ********************************************************/
export interface ITransitionComponentProps {
    transition?: boolean | string | TTransitionProps
    disabled?: boolean
}
