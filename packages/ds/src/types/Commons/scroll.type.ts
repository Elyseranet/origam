import { SCROLL_STRATEGIES } from '../../enums/Commons/scroll.enum'
import type { IScrollStrategyData, IScrollStrategyProps } from '../../interfaces/Commons/scroll.interface'

import { EffectScope } from 'vue'

export type TScrollStrategyFn = (data: IScrollStrategyData, props: IScrollStrategyProps, scope: EffectScope) => void

export type TScrollStrategy = `${SCROLL_STRATEGIES}`
