/** Slot signatures for `<OrigamClientOnly>`. */
export interface IClientOnlySlots {
    default?: () => any
    /** SSR / pre-hydration placeholder, shown until the component mounts. */
    fallback?: () => any
}
