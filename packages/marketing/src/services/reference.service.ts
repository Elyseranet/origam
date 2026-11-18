import { BaseService } from '~/services/base.service'
import type { ICatalogNeighbours } from '~/interfaces/catalog-neighbours.interface'
import type { TReferenceKind } from '~/types/api-reference.type'
import type { TServiceQuery } from '~/types/service.type'

/** Lecture de l'API Reference (`/api/reference/**`). */
export class ReferenceService extends BaseService {
    getCatalog<T> (kind: TReferenceKind, query: TServiceQuery = {}): Promise<T[]> {
        return this.request<T[]>(`/reference/${kind}`, { query })
    }

    getDoc<T> (kind: TReferenceKind | string, slug: string, query: TServiceQuery = {}): Promise<T> {
        return this.request<T>(`/reference/${kind}/${slug}`, { query })
    }

    getCategories (kind: TReferenceKind): Promise<string[]> {
        return this.request<string[]>(`/reference/categories/${kind}`)
    }

    getNeighbours (kind: TReferenceKind, slug: string): Promise<ICatalogNeighbours> {
        return this.request<ICatalogNeighbours>(`/reference/neighbours/${kind}/${slug}`)
    }
}

export const referenceService = new ReferenceService()
