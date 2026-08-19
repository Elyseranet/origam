import { Ref } from 'vue'
import { LOCATION_STRATEGIES } from '../../enums/Commons/location.enum'

import type { ILocationStrategyData, ILocationStrategyProps } from '../../interfaces/Commons/location.interface'

export type TLocationStrategyFn = (
    data: ILocationStrategyData,
    props: ILocationStrategyProps,
    contentStyles: Ref<Record<string, string>>
) => undefined | { updateLocation: (e: Event) => void }

export type TLocationStrategy = `${LOCATION_STRATEGIES}`
