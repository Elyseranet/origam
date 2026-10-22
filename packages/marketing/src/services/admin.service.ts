import { BaseService } from '~/services/base.service'
import type { IAdminLoginBody, IAdminPatch, IAdminSyncResult, IAdminSyncRun } from '~/interfaces/admin.interface'

/** Écriture de l'API Reference (`/api/admin/**`) ; l'authentification est portée par un cookie httpOnly. */
export class AdminService extends BaseService {
    login (body: IAdminLoginBody): Promise<unknown> {
        return this.request('/admin/login', { method: 'POST', body })
    }

    logout (): Promise<unknown> {
        return this.request('/admin/logout', { method: 'POST' })
    }

    patchEntry (kind: string, slug: string, patch: IAdminPatch): Promise<unknown> {
        return this.request(`/admin/reference/${kind}/${slug}`, { method: 'PATCH', body: patch })
    }

    triggerSync (): Promise<IAdminSyncResult> {
        return this.request<IAdminSyncResult>('/admin/reference/sync', { method: 'POST' })
    }

    getSyncRuns (limit: number): Promise<IAdminSyncRun[]> {
        return this.request<IAdminSyncRun[]>('/admin/reference/sync/runs', { query: { limit } })
    }
}

export const adminService = new AdminService()
