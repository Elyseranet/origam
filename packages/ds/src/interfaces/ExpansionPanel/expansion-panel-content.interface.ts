import { Component } from 'vue'
import type { IBorderProps } from '../Commons/border.interface'
import type {
    IBgColorProps,
    IColorProps
} from '../Commons/color.interface'
import type {
    ICommonsComponentProps,
    ITagProps
} from '../Commons/commons.interface'
import type { IDensityProps } from '../Commons/density.interface'
import type { ILazyProps } from '../Commons/lazy.interface'
import type { ILoaderProps } from '../Commons/loader.interface'
import type { IMarginProps } from '../Commons/margin.interface'
import type { IPaddingProps } from '../Commons/padding.interface'
import type { IRoundedProps } from '../Commons/rounded.interface'

export interface IExpansionPanelContentProps extends IColorProps, IBgColorProps, ITagProps, ICommonsComponentProps, IDensityProps, IRoundedProps, IBorderProps, IPaddingProps, IMarginProps, ILazyProps, ILoaderProps {
    content?: string | Component
}

export interface IExpansionPanelContentEmits {}

/** Slot signatures for `<OrigamExpansionPanelContent>`. */
export interface IExpansionPanelContentSlots {
    loader?: () => any
    default?: () => any
}
