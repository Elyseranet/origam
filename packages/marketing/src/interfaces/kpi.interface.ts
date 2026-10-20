export interface IKpi {
    valueKey: string
    valueFallback: string
    labelKey: string
    labelFallback: string
}

export interface ILiveKpi {
    source: 'downloads' | 'stars'
    labelKey: string
    labelFallback: string
}
