import { OrigamCommandPalette } from '../../components'

export type TOrigamCommandPalette = InstanceType<typeof OrigamCommandPalette>

/**
 * A normalised hotkey combination — array of canonical key tokens
 * accepted by `useHotkey` (e.g. `['meta', 'k']`).
 */
export type TCommandPaletteHotkeyCombination = ReadonlyArray<string>
