/********************************************************
 *  DOC-SYNC HARNESS — IN-MEMORY ENTITYMANAGER
 *
 *  @description
 *  The marketing documentation sync (`scripts/lib/db-upsert.ts`,
 *  `server/utils/doc-fixture-sync.ts`) talks to PostgreSQL exclusively through
 *  the four TypeORM `EntityManager` methods reproduced here: `findOne`, `find`,
 *  `insert` and `update`.
 *  Nothing in that chain issues raw SQL, reads a connection, or touches an
 *  entity's decorator metadata — the entity classes are used only as repository
 *  tokens, i.e. as map keys identifying which table a call targets.
 *  A `Map<EntityClass, Row[]>` is therefore a complete stand-in, and the whole
 *  chain runs unmodified against it with no database and no Docker daemon.
 *  That matters here beyond convenience: `docker/docker-compose.yml` declares no
 *  postgres service, so there is no database to start in this repository.
 *  Every row read back is wrapped in a Proxy that answers `null` for any column
 *  the payload never set, reproducing the DDL's nullable defaults — without it
 *  `existing.orphaned_at !== null` would be true on a fresh row and provoke a
 *  patch the real database never sees.
 *  `ops` records one line per write so a spec can assert on WHICH table and
 *  WHICH columns a run touched, which is the only way to tell "left untouched"
 *  apart from "written back with an identical value".
 *
 *  @description Fidelity limits, stated so no spec over-reads a result
 *  `kind_extra` is stored as the live JS object; real jsonb round-trips reorder
 *  keys. `db-upsert`'s own `norm()` canonicalises both sides before comparing,
 *  so the two agree — but a spec must not assert on key ORDER.
 *  No constraint is enforced: the `(kind, slug)` unique index, the foreign keys
 *  and `ON DELETE CASCADE` do not exist here. A spec that means to exercise a
 *  constraint cannot use this harness.
 ********************************************************/

type Row = Record<string, unknown>
type Token = { name: string }

export interface DocSyncHarness {
    /** One line per write, e.g. `UPDATE DocEntry source_file`. */
    ops: string[]
    /** Raw stored rows for a table — mutable, unproxied, for assertions. */
    rows: (entity: unknown) => Row[]
    /** The object handed to `ingestFull` / `ingestSrc` / `syncFixtures`. */
    manager: unknown
}

export function createDocSyncHarness (): DocSyncHarness {
    const tables = new Map<unknown, Row[]>()
    const ops: string[] = []
    let sequence = 0

    const rows = (entity: unknown): Row[] => {
        if (!tables.has(entity)) tables.set(entity, [])
        return tables.get(entity)!
    }

    const nullDefaulted = (row: Row): Row =>
        new Proxy(row, { get: (target, key) => (key in target ? target[key as string] : null) })

    const matches = (row: Row, where: Row): boolean =>
        Object.entries(where).every(([column, value]) => row[column] === value)

    const manager = {
        async findOne (entity: unknown, options: { where: Row }) {
            const hit = rows(entity).find(row => matches(row, options.where))
            return hit ? nullDefaulted(hit) : null
        },
        async find (entity: unknown, options: { where: Row }) {
            return rows(entity).filter(row => matches(row, options.where)).map(nullDefaulted)
        },
        async insert (entity: unknown, payload: Row) {
            const id = ++sequence
            rows(entity).push({ id, orphaned_at: null, edited_by_user: false, ...payload })
            ops.push(`INSERT ${(entity as Token).name}`)
            return { identifiers: [{ id }] }
        },
        async update (entity: unknown, criteria: Row, patch: Row) {
            for (const row of rows(entity)) if (matches(row, criteria)) Object.assign(row, patch)
            ops.push(`UPDATE ${(entity as Token).name} ${Object.keys(patch).sort().join(',')}`)
        },
    }

    return { ops, rows, manager }
}

/**
 * A normalised record in the shape `doc-to-rows.ts#mapDoc` emits — the only
 * input `ingestFull` / `ingestSrc` accept. Defaults describe a minimal enum so a
 * spec overrides just the field under test.
 */
export function docRecord (entry: Row = {}, collections: Record<string, Row[]> = {}) {
    return {
        entry: {
            kind: 'enum',
            slug: 'demo',
            name: 'DEMO',
            definition: 'export enum DEMO { A = \'a\' }',
            signature: null,
            tag: null,
            value: null,
            source_file: 'packages/ds/src/enums/Old/demo.enum.ts',
            parent_slug: null,
            category: null,
            domain: null,
            icon: null,
            description_key: null,
            description_fallback: null,
            package_note: null,
            note_key: null,
            note_fallback: null,
            story_url: null,
            doc_url: null,
            kind_extra: null,
            ...entry,
        },
        props: [], values: [], params: [], returns: [], emits: [], slots: [],
        examples: [], directiveArgs: [], directiveModifiers: [], relations: [],
        ...collections,
    }
}

/** An enum member row as `mapDoc` produces it for `doc_value`. */
export function valueRow (position: number, value: string, over: Row = {}): Row {
    return { position, value, description_key: null, description_fallback: null, ...over }
}
