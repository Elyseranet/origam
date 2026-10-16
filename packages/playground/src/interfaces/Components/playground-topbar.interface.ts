/*********************************************************
 * IPlaygroundTopbarProps
 ********************************************************/
export interface IPlaygroundTopbarProps {
    /** Shown in the subtitle — how many components the registry holds. */
    componentCount: number
    /** Reflects the inspector's visibility onto the toggle's `aria-expanded`. */
    inspectorOpen?: boolean
    /**
     * Reflects the preview's selection mode onto its toggle's `aria-pressed`
     * (lot E1, #1164). Off by default: the preview then behaves exactly like
     * the components it renders.
     */
    selectMode?: boolean
}

export interface IPlaygroundTopbarEmits {
    (e: 'open-catalog', event: MouseEvent): void
    (e: 'toggle-inspector'): void
    (e: 'toggle-select-mode'): void
}

export interface IPlaygroundTopbarSlots {
    /** Extra controls after the built-in ones — the host's theme switcher lives here. */
    toolbar?: () => unknown
}
