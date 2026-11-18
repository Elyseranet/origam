import type { ICommand } from '../../interfaces/CommandPalette/command.interface'
import OrigamCommandPalette from '../../components/CommandPalette/OrigamCommandPalette.vue'

export type TOrigamCommandPalette = InstanceType<typeof OrigamCommandPalette>

/**
 * A normalised hotkey combination — array of canonical key tokens
 * accepted by `useHotkey` (e.g. `['meta', 'k']`).
 */
export type TCommandPaletteHotkeyCombination = ReadonlyArray<string>

/*********************************************************
 * Filter de OrigamCommandPalette (#1184)
 *
 * @description
 * `TCommandPaletteFilterFn` : reçoit les commandes et la requête brute (non trimée), renvoie les commandes à afficher, dans l'ordre d'affichage.
 * @description
 * `TCommandPaletteFilter` (prop `filter`) : `true` = fuzzy match intégré (filtre par sous-séquence + tri par score), `false` = `commands` affichées telles quelles et dans l'ordre fourni, fonction = son résultat est affiché dans son ordre.
 ********************************************************/
export type TCommandPaletteFilterFn = (commands: ReadonlyArray<ICommand>, query: string) => ReadonlyArray<ICommand>

export type TCommandPaletteFilter = boolean | TCommandPaletteFilterFn
