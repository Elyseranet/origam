import type {
    ICommonsComponentEmits,
    ICommonsComponentProps,
    ITagProps
} from '../Commons/commons.interface'
import type { IDimensionProps } from '../Commons/dimension.interface'
import type { ITransitionComponentProps } from '../Commons/transition-component.interface'

/*********************************************************
 * ILazyComponentProps / ILazyEmits / ILazySlots
 *
 * @description
 * Props/emits/slots for `<OrigamLazy>` itself — the only consumer.
 * Issue #364 split this out of `interfaces/Commons/lazy.interface.ts`,
 * which keeps `ILazyProps` (the tiny `{ eager? }` mixin): that one is
 * genuinely transverse — Tabs, ExpansionPanel, Tooltip, Img, Window,
 * Select, and Overlay all `extends ILazyProps` — while this component
 * surface has exactly one consumer.
 ********************************************************/
export interface ILazyComponentProps extends ICommonsComponentProps, IDimensionProps, ITagProps, ITransitionComponentProps {
    modelValue?: boolean
    options?: IntersectionObserverInit
}

/** Emits fired by `<OrigamLazy>` — v-model fires when the intersection
 *  observer flips the wrapper to "visible". */
export interface ILazyEmits extends ICommonsComponentEmits {}

/** Slot signatures for `<OrigamLazy>`. */
export interface ILazySlots {
    default?: () => any
}
