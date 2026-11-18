import { API_BASE_URL } from '~/consts/service.const'
import type { IServiceRequestOptions } from '~/interfaces/service.interface'

/**
 * Seule porte vers `$fetch` : tout appel HTTP du front passe par une classe
 * qui étend celle-ci, jamais par un composant ni un composable.
 */
export class BaseService {
    protected request<T> (path: string, options: IServiceRequestOptions = {}): Promise<T> {
        return $fetch<T>(`${API_BASE_URL}${path}`, options as Parameters<typeof $fetch>[1]) as Promise<T>
    }
}
