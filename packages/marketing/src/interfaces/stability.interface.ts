export interface IStabilityParagraph {
    textKey: string
    textFallback: string
}

export interface IStabilityLink {
    labelKey: string
    labelFallback: string
    href: string
    icon: string
    dataCy: string
}

export interface IStabilitySection {
    id: string
    titleKey: string
    titleFallback: string
    paragraphs: IStabilityParagraph[]
    link?: IStabilityLink
}
