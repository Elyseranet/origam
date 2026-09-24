export interface IStrength {
    icon: string
    titleKey: string
    descriptionKey: string
}

export interface IComparison {
    nameKey: string
    vueNative: boolean
    themingPropsFirst: boolean
    a11yTested: boolean
    cssFist: boolean
    treeShakable: boolean
    chartsIncluded: boolean
    noteKey?: string
}

export interface IUseCase {
    icon: string
    titleKey: string
    descriptionKey: string
    fits: boolean
}

export interface IWeakness {
    icon: string
    titleKey: string
    descriptionKey: string
}
