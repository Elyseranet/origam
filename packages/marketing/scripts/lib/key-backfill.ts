/**
 * key-backfill.ts — DB orchestration for the orphaned-key backfill (ADR 325,
 * task 1). Pure key-generation lives in `key-convention.mjs` (testable
 * without a DB); this module only queries + writes via the TypeORM
 * EntityManager, mirroring the reconciliation style already used by
 * `db-upsert.ts` (repository API, no raw SQL).
 *
 * Runs inside the caller's transaction (same `--check` dry-run pattern as
 * the rest of the pipeline: the caller rolls back when `--check` is set).
 */

import { In } from 'typeorm'
import type { EntityManager, ObjectType } from 'typeorm'

import {
    DocEntry, DocProp, DocParam, DocReturn, DocExample, DocValue,
    DocEmit, DocSlot, DocRelation, DocDirectiveArg, DocDirectiveModifier, DocCategory,
} from '../../server/db/entities/index.ts'
import {
    entryDescriptionKey, entryNoteKey, propKey, paramKey, returnKey, exampleTitleKey, fixEnumNamespace,
} from './key-convention.mjs'

export interface BackfillCounts {
    entryDescription: number
    entryNote: number
    props: number
    params: number
    returns: number
    examples: number
    enumNamespace: number
}

const blank = (): BackfillCounts => ({
    entryDescription: 0, entryNote: 0, props: 0, params: 0, returns: 0, examples: 0, enumNamespace: 0,
})

const hasFallback = (v: unknown): v is string => typeof v === 'string' && v.trim() !== ''
const isEmptyKey = (v: unknown): boolean => v === null || v === undefined || (typeof v === 'string' && v.trim() === '')

/**
 * Generic pass: any row of `entity` whose `column` starts with the singular
 * `enum.` namespace segment (instead of the plural `enums.`) gets its prefix
 * corrected. Scoped via a `LIKE 'enum.%'` filter — never a full table scan.
 */
async function fixNamespaceOn (manager: EntityManager, entity: ObjectType<any>, column: string): Promise<number> {
    const rows = await manager
        .createQueryBuilder(entity, 't')
        .where(`t.${column} LIKE :pattern`, { pattern: 'enum.%' })
        .getMany()

    let n = 0
    for (const row of rows) {
        const current = row[column]
        const fixed = fixEnumNamespace(current)
        if (fixed !== current) {
            await manager.update(entity, { id: row.id }, { [column]: fixed })
            n++
        }
    }
    return n
}

/** Backfill every orphaned `*_key` (empty key + real fallback) across the doc_* graph. */
export async function backfillKeys (manager: EntityManager): Promise<BackfillCounts> {
    const counts = blank()

    const entries = await manager.find(DocEntry, {})
    const entryIds = entries.map(e => e.id)
    const byId = new Map(entries.map(e => [e.id, e]))

    // ── doc_entry.description_key / note_key ──────────────────────────────
    for (const e of entries) {
        if (isEmptyKey(e.description_key) && hasFallback(e.description_fallback)) {
            await manager.update(DocEntry, { id: e.id }, { description_key: entryDescriptionKey(e.kind, e.slug) })
            counts.entryDescription++
        }
        if (isEmptyKey(e.note_key) && hasFallback(e.note_fallback)) {
            await manager.update(DocEntry, { id: e.id }, { note_key: entryNoteKey(e.kind, e.slug) })
            counts.entryNote++
        }
    }

    // ── doc_prop.description_key (interface + component) ───────────────────
    const props = entryIds.length ? await manager.find(DocProp, { where: { entry_id: In(entryIds) } }) : []
    for (const p of props) {
        if (isEmptyKey(p.description_key) && hasFallback(p.description_fallback)) {
            const entry = byId.get(p.entry_id)!
            await manager.update(DocProp, { id: p.id }, { description_key: propKey(entry.kind, entry.slug, p.name) })
            counts.props++
        }
    }

    // ── doc_param.description_key (util + composable) ──────────────────────
    const params = entryIds.length ? await manager.find(DocParam, { where: { entry_id: In(entryIds) } }) : []
    for (const p of params) {
        if (isEmptyKey(p.description_key) && hasFallback(p.description_fallback)) {
            const entry = byId.get(p.entry_id)!
            await manager.update(DocParam, { id: p.id }, { description_key: paramKey(entry.kind, entry.slug, p.name) })
            counts.params++
        }
    }

    // ── doc_return.description_key (util + composable) ─────────────────────
    const returns = entryIds.length ? await manager.find(DocReturn, { where: { entry_id: In(entryIds) } }) : []
    for (const r of returns) {
        if (isEmptyKey(r.description_key) && hasFallback(r.description_fallback)) {
            const entry = byId.get(r.entry_id)!
            await manager.update(DocReturn, { id: r.id }, { description_key: returnKey(entry.kind, entry.slug, r.name) })
            counts.returns++
        }
    }

    // ── doc_example.title_key (any kind) — deduped per entry ────────────────
    const examples = entryIds.length
        ? await manager.find(DocExample, { where: { entry_id: In(entryIds) }, order: { position: 'ASC' } })
        : []
    const examplesByEntry = new Map<string, typeof examples>()
    for (const ex of examples) {
        if (!examplesByEntry.has(ex.entry_id)) examplesByEntry.set(ex.entry_id, [])
        examplesByEntry.get(ex.entry_id)!.push(ex)
    }
    for (const [entryId, siblings] of examplesByEntry) {
        const entry = byId.get(entryId)!
        // Seed `used` with every ALREADY-keyed sibling's leaf slug so a newly
        // generated slug never collides with a curated one sitting next to it.
        const used = new Set<string>()
        for (const ex of siblings) {
            const m = ex.title_key?.match(/\.examples\.([^.]+)\.title$/)
            if (m) used.add(m[1])
        }
        for (const ex of siblings) {
            if (isEmptyKey(ex.title_key) && hasFallback(ex.title_fallback)) {
                await manager.update(DocExample, { id: ex.id }, {
                    title_key: exampleTitleKey(entry.kind, entry.slug, ex.title_fallback as string, used),
                })
                counts.examples++
            }
        }
    }

    // ── enum. → enums. namespace typo (ADR 325 task 3) — every key column ──
    counts.enumNamespace += await fixNamespaceOn(manager, DocEntry, 'description_key')
    counts.enumNamespace += await fixNamespaceOn(manager, DocEntry, 'note_key')
    counts.enumNamespace += await fixNamespaceOn(manager, DocProp, 'description_key')
    counts.enumNamespace += await fixNamespaceOn(manager, DocValue, 'description_key')
    counts.enumNamespace += await fixNamespaceOn(manager, DocParam, 'description_key')
    counts.enumNamespace += await fixNamespaceOn(manager, DocReturn, 'description_key')
    counts.enumNamespace += await fixNamespaceOn(manager, DocEmit, 'description_key')
    counts.enumNamespace += await fixNamespaceOn(manager, DocSlot, 'description_key')
    counts.enumNamespace += await fixNamespaceOn(manager, DocExample, 'title_key')
    counts.enumNamespace += await fixNamespaceOn(manager, DocRelation, 'description_key')
    counts.enumNamespace += await fixNamespaceOn(manager, DocDirectiveArg, 'description_key')
    counts.enumNamespace += await fixNamespaceOn(manager, DocDirectiveModifier, 'description_key')
    counts.enumNamespace += await fixNamespaceOn(manager, DocCategory, 'label_key')

    return counts
}

/**
 * Backfill the component-anatomy SVG accessible-text keys (ADR 325, task 1 —
 * the 354 `svgTitle`/`svgDesc` fields that had no key column at all before
 * `AddDocEntrySvgKeys`). Reads the raw strings from `kind_extra.anatomy`
 * (untouched — still the source the front renders today) and copies them
 * into the new `svg_title_fallback`/`svg_desc_fallback` columns alongside a
 * generated key, mirroring the `components.<slug>.props.<name>.description`
 * shape already used for component props.
 */
export async function backfillSvgKeys (manager: EntityManager): Promise<number> {
    const components = await manager.find(DocEntry, { where: { kind: 'component' } })
    let n = 0

    for (const e of components) {
        const anatomy = (e.kind_extra as { anatomy?: { svgTitle?: string, svgDesc?: string } } | null)?.anatomy
        if (!anatomy) continue

        const patch: Record<string, string> = {}
        if (isEmptyKey(e.svg_title_key) && hasFallback(anatomy.svgTitle)) {
            patch.svg_title_key = `components.${e.slug.replace(/-/g, '_')}.anatomy.svg_title`
            patch.svg_title_fallback = anatomy.svgTitle as string
        }
        if (isEmptyKey(e.svg_desc_key) && hasFallback(anatomy.svgDesc)) {
            patch.svg_desc_key = `components.${e.slug.replace(/-/g, '_')}.anatomy.svg_desc`
            patch.svg_desc_fallback = anatomy.svgDesc as string
        }
        if (Object.keys(patch).length) {
            await manager.update(DocEntry, { id: e.id }, patch)
            n++
        }
    }
    return n
}
