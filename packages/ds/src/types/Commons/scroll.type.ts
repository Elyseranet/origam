import { SCROLL_STRATEGIES } from '../../enums'
import type { IScrollStrategyData, IScrollStrategyProps } from '../../interfaces'

import { EffectScope } from 'vue'

export type TScrollStrategyFn = (data: IScrollStrategyData, props: IScrollStrategyProps, scope: EffectScope) => void

export type TScrollStrategy = `${SCROLL_STRATEGIES}`
