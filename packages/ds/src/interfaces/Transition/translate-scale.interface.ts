import type { ITransitionTranslateScaleProps } from './transition.interface'

/*********************************************************
 * ITranslateScaleProps
 *
 * @description
 * Props for `<OrigamTranslateScale>` — the only consumer. Adds
 * `target` (the element/point the scale animates from/to) on top of
 * the shared `ITransitionProps` surface. Issue #364 split this out of
 * `interfaces/Transition/transition.interface.ts` since, unlike
 * `ITransitionProps` itself (shared verbatim by 14 sibling wrapper
 * components), this one is specific to a single component.
 ********************************************************/
export interface ITranslateScaleProps extends ITransitionTranslateScaleProps {
    target?: HTMLElement | [x: number, y: number]
}
