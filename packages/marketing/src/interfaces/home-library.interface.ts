/** One category card of the home library grid, bound to a real catalogue category. */
export interface IHomeLibraryCategory {
    key: string
    icon: string
    labelKey: string
    labelFallback: string
    /** Raw DB category of the components catalogue (`/components`) this card opens. */
    catalogCategory: string
}
