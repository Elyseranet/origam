import type { IWindowProvide } from '../Window/window.interface'

import type { TTransitionMode } from '../../types/Transition/transition.type'

/*********************************************************
 * ITransitionProps
 *
 * @description
 * Shared verbatim by all 14 `<Origam*>` transition wrapper components
 * (Fade, SlideX/Y, ExpandX/Y, ScaleRotate, TranslateScale,
 * WindowXTranslate, WindowYTranslate, WindowXReverseTranslate,
 * WindowYReverseTranslate, TranslatePicker, ReverseTranslatePicker,
 * TranslateBottom, Snack, …) — only the CSS class differs between
 * them. Intra-family sharing, deliberately NOT split into 14 no-op
 * `IFadeProps extends ITransitionProps {}` files (issue #364).
 *
 * @description
 * `ITransitionComponentProps` — the unrelated "does this component
 * accept a `transition` prop" mixin consumed by 13 OTHER families —
 * moved to `interfaces/Commons/transition-component.interface.ts`
 * under the same issue: that one WAS a genuine inter-family coupling.
 ********************************************************/
export interface ITransitionProps {
    mode?: TTransitionMode
    disabled?: boolean
    name?: string
    group?: boolean
    hideOnLeave?: boolean
    leaveAbsolute?: boolean
    origin?: string
}

export interface ITransitionWindowProps extends ITransitionProps {
    window?: IWindowProvide
}

/** Slot signatures shared by every `<Origam*>` transition wrapper
 *  (Fade, SlideX/Y, ExpandX/Y, ScaleRotate, TranslateScale, …) — a
 *  single unscoped `default` slot holding the transitioned content. */
export interface ITransitionSlots {
    default?: () => any
}
