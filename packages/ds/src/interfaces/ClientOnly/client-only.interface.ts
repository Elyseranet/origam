/** Props accepted by `<OrigamClientOnly>`. */
export interface IClientOnlyProps {
    /**
     * Tag used for the SSR placeholder when no `#fallback` slot is given.
     * Defaults to `undefined` — the SSR output is then completely empty
     * (a tiny perf win when the consumer doesn't need a layout reserved
     * slot). Set to `'div'` / `'span'` / etc. when the absence of a
     * placeholder would cause layout shift on hydration.
     */
    placeholderTag?: string
    /**
     * Class applied to the placeholder element. Pair with `placeholderTag`
     * to reserve dimensions matching the eventual client render (avoids
     * cumulative layout shift).
     */
    placeholderClass?: string
}

/** Slot signatures for `<OrigamClientOnly>`. */
export interface IClientOnlySlots {
    default?: () => any
    /** SSR / pre-hydration placeholder, shown until the component mounts. */
    fallback?: () => any
}
