export interface IAdminLoginResult {
    ok: boolean
    error?: 'wrong_password' | 'server_error'
}

export interface IAdminSyncResult {
    created: number
    updated: number
    unchanged: number
    orphaned: number
    status: string
    error?: string | null
}

export interface IAdminSyncRun {
    id: string
    started_at: string
    finished_at: string | null
    created_count: number
    updated_count: number
    unchanged_count: number
    orphaned_count: number
    source_commit: string | null
    status: string
    error: string | null
}

export interface IAdminPatch {
    category?: string | null
    icon?: string | null
    descriptionKey?: string | null
    descriptionFallback?: string | null
    storyUrl?: string | null
    docUrl?: string | null
    noteKey?: string | null
    noteFallback?: string | null
}

export interface IAdminUpdateResult {
    ok: boolean
    error?: string
}
