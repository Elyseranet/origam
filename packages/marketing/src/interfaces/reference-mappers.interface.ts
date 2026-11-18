import type { TDescriptionsBySlug } from '../types/api-reference.type'

export interface IComponentChildren {
    props: any[]
    emits: any[]
    slots: any[]
    examples: any[]
    relations: any[]
    descriptionsBySlug: TDescriptionsBySlug
}

export interface IComposableChildren {
    params: any[]
    returns: any[]
    examples: any[]
    relations: any[]
}

export interface IConstChildren {
    values: any[]
    examples: any[]
    relations: any[]
}

export interface IDirectiveChildren {
    args: any[]
    modifiers: any[]
    examples: any[]
    relations: any[]
    descriptionsBySlug: TDescriptionsBySlug
}

export interface IEnumChildren {
    values: any[]
    examples: any[]
    relations: any[]
}

export interface IInterfaceChildren {
    props: any[]
    examples: any[]
    relations: any[]
}

export interface ITypeChildren {
    values: any[]
    examples: any[]
    relations: any[]
}

export interface IUtilChildren {
    params: any[]
    returns: any[]
    examples: any[]
    relations: any[]
}
