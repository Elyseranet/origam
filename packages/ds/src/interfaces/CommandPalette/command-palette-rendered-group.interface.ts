import type { ICommand } from './command.interface'
import type { IFuzzyMatchResult } from '../../utils/CommandPalette/fuzzy-match.util'

/**
 * Internal implementation detail of `<OrigamCommandPalette>`'s grouping
 * computation — NOT part of the component's public props/emits/slots
 * surface. Deliberately not re-exported from `src/interfaces/index.ts`:
 * nothing outside `OrigamCommandPalette.vue` consumes this shape.
 */
export interface IRenderedGroup {
    label: string | null
    items: ReadonlyArray<IFuzzyMatchResult<ICommand>>
}
