import { Ref } from 'vue'
import { LOCATION_STRATEGIES } from '../../enums/Commons/location.enum'

import type { TParsedAnchor } from './anchor.type'
import type { ILocationStrategyData, ILocationStrategyProps } from '../../interfaces/Commons/location.interface'

export type TLocationStrategyFn = (
    data: ILocationStrategyData,
    props: ILocationStrategyProps,
    contentStyles: Ref<Record<string, string>>
) => undefined | { updateLocation: (e: Event) => void }

export type TLocationStrategy = `${LOCATION_STRATEGIES}`

export type TPlacement = { anchor: TParsedAnchor, origin: TParsedAnchor }

export type TAxisOverflow = { before: number, after: number }

export type TOverflow = { x: TAxisOverflow, y: TAxisOverflow }
