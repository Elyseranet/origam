/** Aggregate reconciliation counters returned by a sync run. */
export interface IFixtureSyncCounts {
    created: number
    updated: number
    unchanged: number
    orphaned: number
}

/** A single dumped record (src/assets/seed/<kind>.json `entries[i]`). */
export interface IFixtureRecord {
    entry: { kind: string, slug: string, edited_by_user?: boolean, [k: string]: unknown }
    [collection: string]: unknown
}
