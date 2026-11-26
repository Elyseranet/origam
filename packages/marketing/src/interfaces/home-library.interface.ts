/** One category card of the home library grid, bound to a real catalogue category. */
export interface IHomeLibraryCategory {
    key: string
    icon: string
    labelKey: string
    labelFallback: string
    /** Optional caption under the label. */
    hintKey?: string
    hintFallback?: string
    /** Named parameters of the hint (e.g. `{count}` from BUILD_STATS). */
    hintParams?: Record<string, number>
    /** Raw DB category of the components catalogue (`/components`) this card opens. */
    catalogCategory: string
}
