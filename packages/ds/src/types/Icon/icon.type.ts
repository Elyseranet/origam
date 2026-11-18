import type { Component } from 'vue'
import type OrigamIcon from '../../components/Icon/OrigamIcon.vue'

import type { IIconAliases, IIconProps, IIconSet } from '../../interfaces/Icon/icon.interface'

export type TIcon =
    | string
    | Array<(string | [path: string, opacity: number])>
    | Component

export type TIconOptions = {
    defaultSet?: string
    aliases?: Partial<IIconAliases>
    sets?: Record<string, IIconSet>
}

/*********************************************************
 * TNuxtIconOptions
 *
 * @description
 * The part of `TIconOptions` that survives `runtimeConfig` (JSON): `sets` (render functions) and component aliases are left out.
 ********************************************************/
export type TNuxtIconOptions = {
    defaultSet?: string
    aliases?: Record<string, Exclude<TIcon, Component>>
}

export type TIconInstance = {
    component: TIconComponent
    icon?: TIcon
}

export type TIconComponent = Component<IIconProps>

export type TOrigamIcon = InstanceType<typeof OrigamIcon>
