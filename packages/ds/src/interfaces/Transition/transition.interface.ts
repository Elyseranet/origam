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

/*********************************************************
 * ITransitionNoOriginProps
 *
 * @description
 * `ITransitionProps` minus `origin` — for the 7 family members whose
 * transition never touches a `scale`/`rotate` transform (`ExpandX`/`Y`
 * animate `width`/`height`, `Fade` animates `opacity`,
 * `Window{X,Y}{,Reverse}Translate` animate a plain `translate`).
 * `transform-origin` has nothing to anchor on a translate/width/height/
 * opacity change, so the prop was declared but never produced any
 * observable effect (issue #538/#548). Removed here rather than at the
 * root `ITransitionProps` because 7 OTHER family members sharing that
 * same interface (`ScaleRotate`, `Snack` via a real `scale`/`rotate`,
 * plus `SlideX`/`SlideY`/`TranslatePicker`/`ReverseTranslatePicker`/
 * `TranslateBottom`) still declare it — `ScaleRotate` and `Snack` in
 * particular have a legitimate use for it. See
 * `docs/mesures/` for the full per-component audit.
 ********************************************************/
export interface ITransitionNoOriginProps extends Omit<ITransitionProps, 'origin'> {}

/** Slot signatures shared by every `<Origam*>` transition wrapper
 *  (Fade, SlideX/Y, ExpandX/Y, ScaleRotate, TranslateScale, …) — a
 *  single unscoped `default` slot holding the transitioned content. */
export interface ITransitionSlots {
    default?: () => any
}

/*********************************************************
 * ITransitionEmits
 *
 * @description
 * Emit signatures shared by every `<Origam*>` transition wrapper
 * (Fade, SlideX/Y, ExpandX/Y, ScaleRotate, TranslateScale,
 * WindowXTranslate, WindowYTranslate, WindowXReverseTranslate,
 * WindowYReverseTranslate, TranslatePicker, ReverseTranslatePicker,
 * TranslateBottom, Snack, `<OrigamTransition>` itself, …) — verified
 * empty component by component: none of the 16 family members call
 * `emit(...)` or relay a child event, they only wire the native Vue
 * `<transition>` enter/leave hooks internally. Intra-family sharing,
 * mirroring `ITransitionSlots` above.
 ********************************************************/
export interface ITransitionEmits {}
