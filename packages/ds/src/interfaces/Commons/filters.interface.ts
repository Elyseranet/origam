import type {
    TFilterFunction,
    TFilterKeyFunctions,
    TFilterKeys,
    TFilterMode
} from '../../types/Commons/filters.type'

export interface IFiltersProps {
    customFilter?: TFilterFunction
    customKeyFilter?: TFilterKeyFunctions
    filterKeys?: TFilterKeys
    filterMode?: TFilterMode
    noFilter?: boolean,
}
