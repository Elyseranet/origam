import type { TServiceHttpMethod, TServiceQuery } from '~/types/service.type'

/** Options d'une requête émise par `BaseService.request`. */
export interface IServiceRequestOptions {
    method?: TServiceHttpMethod
    query?: TServiceQuery
    body?: object
}
