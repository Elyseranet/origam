import { DIRECTION } from '@origam/enums'
import type { IOptions } from '@origam/interfaces'
import type { TDirection } from '@origam/types'

/**
 * Option set for every `HstSelect` driving a horizontal / vertical axis
 * prop (`orientation` on `<OrigamMediaScrubber>`, and any future component
 * typed against `TDirection`).
 *
 * Values are read from the real `DIRECTION` enum rather than retyped as
 * literals, so a rename in `packages/ds/src/enums/Commons/direction.enum.ts`
 * breaks the build here instead of silently producing a control that sets a
 * value the component no longer understands.
 */
export const directionList: Array<IOptions<TDirection>> = [
    { label: 'Horizontal', value: DIRECTION.HORIZONTAL },
    { label: 'Vertical', value: DIRECTION.VERTICAL }
]
