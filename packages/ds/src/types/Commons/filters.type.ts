import { FILTERS_MODE } from '../../enums'

import type { IInternalItem } from '../../interfaces'

export type TFilterMatch = boolean | number | [number, number] | [number, number][]
export type TFilterFunction = (value: string, query: string, item?: IInternalItem) => TFilterMatch
export type TFilterKeyFunctions = Record<string, TFilterFunction>
export type TFilterKeys = string | string[]
export type TFilterMode = `${FILTERS_MODE}`
