import type { Component, VNode } from 'vue'

import type { IBorderProps } from '../Commons/border.interface'
import type {
    ICommonsComponentEmits,
    ICommonsComponentProps,
    ITagProps
} from '../Commons/commons.interface'
import type { IDimensionProps } from '../Commons/dimension.interface'
import type { IElevationProps } from '../Commons/elevation.interface'
import type { IMarginProps } from '../Commons/margin.interface'
import type { IRoundedProps } from '../Commons/rounded.interface'

import type { TCodeLangOpen } from '../../types/Code/code.type'

/*********************************************************
 * ICodeGroupItem
 *
 * @description
 * One tab of an `<OrigamCodeGroup>` in its `items` form: the label shown on
 * the tab and the code shown in its panel.
 ********************************************************/
export interface ICodeGroupItem {
    label: string
    code: string
    lang?: TCodeLangOpen
    filename?: string
    value?: string
}

/*********************************************************
 * ICodeGroupResolvedItem
 *
 * @description
 * An `ICodeGroupItem` once the group has settled its `value` and, in the
 * slot form, kept the child `<OrigamCode>` vnode to render in the panel.
 ********************************************************/
export interface ICodeGroupResolvedItem extends Required<Pick<ICodeGroupItem, 'label' | 'code' | 'value'>>, Pick<ICodeGroupItem, 'lang' | 'filename'> {
    vnode?: VNode
}

/*********************************************************
 * ICodeGroupRenderedItem
 *
 * @description
 * A resolved item whose `vnode` is the `<OrigamCode>` to render in the panel,
 * already flattened, header-less and named. Built by `resolveCodeGroupItems`.
 ********************************************************/
export interface ICodeGroupRenderedItem extends Omit<ICodeGroupResolvedItem, 'vnode'> {
    vnode: VNode
}

/*********************************************************
 * ICodeGroupResolveOptions
 *
 * @description
 * What `resolveCodeGroupItems` needs from the group: its `label` and `t` to
 * name each scroller, and `lineNumbers` / `wrap` to forward to every block.
 * `codeComponent` is `OrigamCode`, passed in so `utils/` never imports an SFC
 * (#1208).
 ********************************************************/
export interface ICodeGroupResolveOptions {
    label?: string
    lineNumbers: boolean
    wrap: boolean
    codeComponent: Component
    t: (key: string, ...params: unknown[]) => string
}

/*********************************************************
 * ICodeGroupProps
 *
 * @description
 * Props for `<OrigamCodeGroup>` — tabbed code blocks (npm / pnpm / yarn)
 * drawn as ONE surface with one shared copy button. Fed either by `items`
 * or by `<origam-code>` children in the default slot (the tab label comes
 * from the child's `label`, else its `filename`).
 * @description
 * `modelValue` is the `value` of the active tab (default: the first tab).
 * `label` is the accessible name of the tab list (default: a localised
 * generic name). `copyable`, `lineNumbers` and `wrap` apply to the whole
 * group. `items` is ignored when the default slot holds code blocks.
 ********************************************************/
export interface ICodeGroupProps extends ICommonsComponentProps, ITagProps, IBorderProps, IRoundedProps, IElevationProps, IMarginProps, IDimensionProps {
    items?: ICodeGroupItem[]
    modelValue?: string
    label?: string
    copyable?: boolean
    lineNumbers?: boolean
    wrap?: boolean
}

/*********************************************************
 * ICodeGroupEmits
 *
 * @description
 * `update:modelValue` carries the new active tab `value`; `copy` carries the
 * code of the tab that was copied.
 ********************************************************/
export interface ICodeGroupEmits extends ICommonsComponentEmits {
    (e: 'update:modelValue', value: string): void
    (e: 'copy', code: string): void
}

/*********************************************************
 * ICodeGroupSlots
 *
 * @description
 * `default` takes the `<origam-code>` children, one per tab, when `items` is
 * not used. `copy` replaces the shared copy button.
 ********************************************************/
export interface ICodeGroupSlots {
    default?: () => any
    copy?: (data: { copy: () => Promise<void>, copied: boolean }) => any
}
