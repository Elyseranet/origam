import 'vue/jsx'
import type { UnwrapNestedRefs, VNodeChild } from 'vue'

// These already exist in scope in the final bundle
// @skip-build
import type { IDateInstance, IDisplayInstance, ILocaleInstance, IRtlInstance } from './interfaces'
import type { TIconOptions } from './types'

declare global {
    namespace JSX {
        interface ElementChildrenAttribute {
            $children: unknown
        }
    }
}

declare module 'vue' {
    interface Origam {
        display: UnwrapNestedRefs<IDisplayInstance>
        icons: TIconOptions
        locale: UnwrapNestedRefs<ILocaleInstance & IRtlInstance>
        date: IDateInstance
    }

    export interface ComponentCustomProperties {
        $vuetify: Origam
    }

    export interface HTMLAttributes {
        $children?: VNodeChild
    }

    export interface SVGAttributes {
        $children?: VNodeChild
    }
}
