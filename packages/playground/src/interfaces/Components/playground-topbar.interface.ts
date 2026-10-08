/*********************************************************
 * IPlaygroundTopbarProps
 ********************************************************/
export interface IPlaygroundTopbarProps {
    /** Shown in the subtitle — how many components the registry holds. */
    componentCount: number
    /** Reflects the inspector's visibility onto the toggle's `aria-expanded`. */
    inspectorOpen?: boolean
}

export interface IPlaygroundTopbarEmits {
    (e: 'open-catalog', event: MouseEvent): void
    (e: 'toggle-inspector'): void
}

export interface IPlaygroundTopbarSlots {
    /** Extra controls after the built-in ones — the host's theme switcher lives here. */
    toolbar?: () => unknown
}
