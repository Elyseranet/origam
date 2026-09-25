export interface IRoadmapStatusItem {
    labelKey: string
    done: boolean
}

export interface IRoadmapWaveItem {
    nameKey: string
    noteKey?: string
    done: boolean
}

export interface IRoadmapWave {
    titleKey: string
    items: IRoadmapWaveItem[]
}

export interface IRoadmapPhaseItem {
    titleKey: string
    descriptionKey: string
    icon: string
    effortKey?: string
}

export interface IRoadmapPhase {
    id: string
    eyebrowKey: string
    titleKey: string
    intent: 'primary' | 'secondary' | 'warning' | 'info' | 'success'
    icon: string
    defaultOpen?: boolean
    items: IRoadmapPhaseItem[]
}

export interface IRoadmapWave4Component {
    nameKey: string
    noteKey: string
    icon: string
}

export interface IRoadmapStat {
    value: string
    labelKey: string
    icon: string
}
