/**
 * reference-mappers.ts — pure DB-row → *Doc / *Entry interface transformers.
 *
 * No database calls — only data reshaping. Each mapper accepts the raw TypeORM
 * entity objects (snake_case property names matching the entity column keys)
 * and pre-fetched child collections ordered by `position`.
 *
 * Import paths to src/interfaces use relative paths from server/utils/ because
 * the `~` alias resolves to the Nuxt project root in server context, not to src/.
 */

import type {
    IComponentDoc,
    IComponentEntry,
    IComponentExample,
    IComponentFamilyMember,
    IComponentRelated,
} from '../../src/interfaces/components-catalog.interface'
import type {
    IComposableDoc,
    IComposableEntry,
    IComposableExample,
} from '../../src/interfaces/composables-catalog.interface'
import type {
    IConstDoc,
    IConstEntry,
    IConstUsedByEntry,
    IConstExample,
} from '../../src/interfaces/consts-catalog.interface'
import type {
    IDirectiveDoc,
    IDirectiveExample,
} from '../../src/interfaces/directive-doc.interface'
import type {
    IEnumDoc,
    IEnumEntry,
    IEnumUsedByEntry,
    IEnumExample,
} from '../../src/interfaces/enums-catalog.interface'
import type {
    IInterfaceDoc,
    IInterfaceEntry,
    IInterfaceUsedByEntry,
    IInterfaceExample,
} from '../../src/interfaces/interfaces-catalog.interface'
import type {
    ITypeDoc,
    ITypeEntry,
    ITypeUsedByEntry,
    ITypeExample,
} from '../../src/interfaces/types-catalog.interface'
import type {
    IUtilDoc,
    IUtilEntry,
    IUtilExample,
} from '../../src/interfaces/utils-catalog.interface'
import type { IReferenceRow } from '../../src/interfaces/reference-row.interface'
import type { TLocaleCode } from '../../src/types/i18n.type'

// ─── Shared child-row mappers ──────────────────────────────────────────────

// ─── Row mappers — all 16 pre-unification shapes collapse to IReferenceRow ──
//
// Every row table across the reference pages (props/emits/slots/exposed/
// cssVars/token-excerpt, composable params/returns, directive args/
// modifiers, util params/return, interface props, type/enum/const members)
// is "a label, an optional type, an optional value, an optional required
// flag, and a description" — see reference-row.interface.ts's header for
// the full before/after field-list table. These mappers read the exact same
// DB columns (`row.name`, `row.type_label`, `row.default_value`, …) they
// always did; only the OUTPUT field names changed.

function mapPropRow (row: any): IReferenceRow {
    return {
        label: row.name,
        type: {
            label: row.type_label ?? row.name,
            slug: row.type_slug ?? '',
            kind: (row.type_kind ?? 'primitive') as 'primitive' | 'type' | 'enum',
        },
        value: row.default_value ?? '',
        descriptionKey: row.description_key ?? '',
        descriptionFallback: row.description_fallback ?? '',
        required: row.required ?? false,
    }
}

function mapEmitRow (row: any): IReferenceRow {
    return {
        label: row.event,
        type: {
            label: row.payload_label ?? 'void',
            slug: row.payload_slug ?? '',
            kind: (row.payload_kind ?? 'primitive') as 'primitive' | 'type' | 'enum',
        },
        descriptionKey: row.description_key ?? '',
        descriptionFallback: row.description_fallback ?? '',
    }
}

function mapSlotRow (row: any): IReferenceRow {
    return {
        label: row.slot,
        value: row.slot_props ?? '',
        descriptionKey: row.description_key ?? '',
        descriptionFallback: row.description_fallback ?? '',
    }
}

function mapComponentExample (row: any): IComponentExample {
    return {
        titleKey: row.title_key ?? '',
        titleFallback: row.title_fallback ?? '',
        code: row.code ?? '',
        lang: row.lang ?? 'vue',
    }
}

function mapComposableParam (row: any): IReferenceRow {
    return {
        label: row.name,
        type: row.type ?? 'unknown',
        required: row.required ?? false,
        value: row.default_value ?? undefined,
        descriptionKey: row.description_key ?? '',
        descriptionFallback: row.description_fallback ?? '',
    }
}

function mapComposableReturn (row: any): IReferenceRow {
    return {
        label: row.name ?? '',
        type: row.type ?? 'unknown',
        descriptionKey: row.description_key ?? '',
        descriptionFallback: row.description_fallback ?? '',
    }
}

function mapUtilParam (row: any): IReferenceRow {
    return {
        label: row.name,
        type: row.type ?? 'unknown',
        required: row.required ?? false,
        value: row.default_value ?? undefined,
        descriptionKey: row.description_key ?? '',
        descriptionFallback: row.description_fallback ?? '',
    }
}

function mapUtilReturn (row: any): IReferenceRow {
    return {
        label: row.name ?? '',
        type: row.type ?? 'void',
        descriptionKey: row.description_key ?? '',
        descriptionFallback: row.description_fallback ?? '',
    }
}

function mapEnumValue (row: any): IReferenceRow {
    return {
        label: row.value,
        descriptionKey: row.description_key ?? '',
        descriptionFallback: row.description_fallback ?? '',
    }
}

/**
 * `required` is the INVERSE of the legacy `optional` column — the DB column
 * is still named `optional` (shared `doc_prop` table), only the TS-facing
 * row shape changed from "optional: boolean" to the RowList-wide
 * "required: boolean" (RowList renders a `required` badge, never an
 * `optional` one — there is nothing to invert on the template side).
 */
function mapInterfacePropRow (row: any): IReferenceRow {
    return {
        label: row.name,
        type: row.type_label ?? 'unknown',
        required: row.optional === false,
        value: row.default_value ?? undefined,
        // No descriptionKey: IInterfacePropRow never carried one — this
        // table has always rendered descriptionFallback unresolved.
        descriptionFallback: row.description_fallback ?? '',
    }
}

function mapDirectiveArg (row: any): IReferenceRow {
    return {
        label: row.name,
        type: row.type ?? 'unknown',
        descriptionKey: row.description_key ?? '',
        descriptionFallback: row.description_fallback ?? '',
        required: row.required ?? false,
    }
}

function mapDirectiveModifier (row: any): IReferenceRow {
    return {
        label: row.name,
        descriptionKey: row.description_key ?? '',
        descriptionFallback: row.description_fallback ?? '',
    }
}

// ─── Catalog entry mappers ─────────────────────────────────────────────────
//
// Every exported mapper below accepts a trailing `_locale?: TLocaleCode`
// parameter (ADR #325, task 3 — locale transport only). It reaches this
// module so task 4 (locale-aware descriptionFallback resolution via the
// doc_translation table) has it available at the call site without another
// signature change. It is intentionally UNUSED here (underscore-prefixed
// per the lint no-unused-vars rule) — resolving the translated value is
// task 4's responsibility, not this ticket's.

export function mapComponentEntry (
    row: any,
    family: IComponentFamilyMember[] = [],
    _locale?: TLocaleCode,
): IComponentEntry {
    return {
        slug: row.slug,
        name: row.name,
        icon: row.icon ?? '',
        descriptionKey: row.description_key ?? '',
        descriptionFallback: row.description_fallback ?? '',
        category: row.category ?? '',
        family,
        parentSlug: row.parent_slug ?? undefined,
    }
}

export function mapComposableEntry (row: any, related: string[] = [], _locale?: TLocaleCode): IComposableEntry {
    return {
        slug: row.slug,
        name: row.name,
        icon: row.icon ?? '',
        descriptionKey: row.description_key ?? '',
        descriptionFallback: row.description_fallback ?? '',
        domain: row.domain ?? '',
        related,
    }
}

export function mapConstEntry (row: any, _locale?: TLocaleCode): IConstEntry {
    return {
        slug: row.slug,
        name: row.name,
        icon: row.icon ?? '',
        category: row.category ?? '',
        descriptionKey: row.description_key ?? '',
        descriptionFallback: row.description_fallback ?? '',
    }
}

export function mapEnumEntry (row: any, _locale?: TLocaleCode): IEnumEntry {
    return {
        slug: row.slug,
        name: row.name,
        icon: row.icon ?? '',
        category: row.category ?? '',
        descriptionKey: row.description_key ?? '',
        descriptionFallback: row.description_fallback ?? '',
    }
}

export function mapInterfaceEntry (row: any, _locale?: TLocaleCode): IInterfaceEntry {
    return {
        slug: row.slug,
        name: row.name,
        icon: row.icon ?? '',
        category: row.category ?? '',
        descriptionKey: row.description_key ?? '',
        descriptionFallback: row.description_fallback ?? '',
    }
}

export function mapTypeEntry (row: any, _locale?: TLocaleCode): ITypeEntry {
    return {
        slug: row.slug,
        name: row.name,
        icon: row.icon ?? '',
        kind: ((row.kind_extra as any)?.typeKind ?? 'type') as 'type' | 'enum',
        category: row.category ?? '',
        descriptionKey: row.description_key ?? '',
        descriptionFallback: row.description_fallback ?? '',
    }
}

export function mapUtilEntry (row: any, related: string[] = [], _locale?: TLocaleCode): IUtilEntry {
    return {
        slug: row.slug,
        name: row.name,
        icon: row.icon ?? '',
        descriptionKey: row.description_key ?? '',
        descriptionFallback: row.description_fallback ?? '',
        category: row.category ?? '',
        related,
    }
}

/** Directive catalog — lightweight form for the index page. */
export function mapDirectiveCatalogEntry (row: any, _locale?: TLocaleCode): {
    slug: string
    name: string
    icon: string
    category: string
    descriptionKey: string
    descriptionFallback: string
} {
    return {
        slug: row.slug,
        name: row.name,
        icon: row.icon ?? '',
        category: row.category ?? 'Directive',
        descriptionKey: row.description_key ?? '',
        descriptionFallback: row.description_fallback ?? '',
    }
}

// ─── Children type bundles (accepted by the full-doc mappers) ─────────────

/** Sibling-slug → description lookup, used to enrich family/related entries. */
export type DescriptionsBySlug = Map<string, { description_key: string | null; description_fallback: string | null }>

function pickDesc (rel: any, descMap: DescriptionsBySlug, slug: string) {
    const fromMap = descMap.get(slug)
    return {
        descriptionKey: rel.description_key || fromMap?.description_key || '',
        descriptionFallback: rel.description_fallback || fromMap?.description_fallback || '',
    }
}

export interface ComponentChildren {
    props: any[]
    emits: any[]
    slots: any[]
    examples: any[]
    relations: any[]
    descriptionsBySlug: DescriptionsBySlug
}

export function mapComponentDoc (entry: any, ch: ComponentChildren, _locale?: TLocaleCode): IComponentDoc {
    const kindExtra = (entry.kind_extra ?? {}) as Record<string, unknown>

    const familyRels = ch.relations.filter((r: any) => r.rel_type === 'family')
    const relatedRels = ch.relations.filter((r: any) => r.rel_type === 'related')

    const family: IComponentFamilyMember[] = familyRels.map((r: any) => ({
        slug: r.to_slug ?? '',
        name: r.to_name ?? '',
        ...pickDesc(r, ch.descriptionsBySlug, r.to_slug ?? ''),
    }))

    const related: IComponentRelated[] = relatedRels.map((r: any) => ({
        slug: r.to_slug ?? '',
        name: r.to_name ?? '',
        kind: (r.to_kind ?? 'component') as 'component' | 'directive',
        ...pickDesc(r, ch.descriptionsBySlug, r.to_slug ?? ''),
    }))

    return {
        slug: entry.slug,
        name: entry.name,
        tag: entry.tag ?? `origam-${entry.slug}`,
        icon: entry.icon ?? '',
        descriptionKey: entry.description_key ?? '',
        descriptionFallback: entry.description_fallback ?? '',
        category: entry.category ?? '',
        packageNote: entry.package_note ?? undefined,
        props: ch.props.map(mapPropRow),
        emits: ch.emits.map(mapEmitRow),
        slots: ch.slots.map(mapSlotRow),
        examples: ch.examples.map(mapComponentExample),
        family,
        related: related.length > 0 ? related : undefined,
        parentSlug: entry.parent_slug ?? undefined,
        storyUrl: entry.story_url ?? undefined,
        docUrl: entry.doc_url ?? undefined,
        // Rich blocks stored in kind_extra already match the interfaces — pass through.
        anatomy: kindExtra.anatomy as IComponentDoc['anatomy'],
        cssVars: kindExtra.cssVars as IComponentDoc['cssVars'],
        exposed: kindExtra.exposed as IComponentDoc['exposed'],
        composable: kindExtra.composable as IComponentDoc['composable'],
        a11y: kindExtra.a11y as IComponentDoc['a11y'],
        tokens: kindExtra.tokens as IComponentDoc['tokens'],
        playground: kindExtra.playground as IComponentDoc['playground'],
        previewVariants: kindExtra.previewVariants as IComponentDoc['previewVariants'],
    }
}

export interface ComposableChildren {
    params: any[]
    returns: any[]
    examples: any[]
    relations: any[]
}

export function mapComposableDoc (entry: any, ch: ComposableChildren, _locale?: TLocaleCode): IComposableDoc {
    const kindExtra = (entry.kind_extra ?? {}) as Record<string, unknown>
    const relatedRels = ch.relations.filter((r: any) => r.rel_type === 'related')

    return {
        slug: entry.slug,
        name: entry.name,
        domain: entry.domain ?? '',
        icon: entry.icon ?? '',
        descriptionKey: entry.description_key ?? '',
        descriptionFallback: entry.description_fallback ?? '',
        signature: entry.signature ?? '',
        params: ch.params.map(mapComposableParam),
        returns: ch.returns.map(mapComposableReturn),
        examples: ch.examples.map((r: any): IComposableExample => ({
            titleKey: r.title_key ?? '',
            titleFallback: r.title_fallback ?? '',
            code: r.code ?? '',
            lang: r.lang ?? 'ts',
        })),
        related: relatedRels.map((r: any) => r.to_slug ?? '').filter(Boolean),
        consumedInterfaces: (kindExtra.consumedInterfaces as string[] | undefined) ?? undefined,
        noteKey: entry.note_key ?? undefined,
        noteFallback: entry.note_fallback ?? undefined,
    }
}

export interface ConstChildren {
    values: any[]
    examples: any[]
    relations: any[]
}

export function mapConstDoc (entry: any, ch: ConstChildren, _locale?: TLocaleCode): IConstDoc {
    const usedByRels = ch.relations.filter((r: any) => r.rel_type === 'used_by')

    return {
        slug: entry.slug,
        name: entry.name,
        category: entry.category ?? '',
        descriptionKey: entry.description_key ?? '',
        descriptionFallback: entry.description_fallback ?? '',
        definition: entry.definition ?? '',
        value: entry.value ?? undefined,
        values: ch.values.length > 0
            ? ch.values.map((r: any): IReferenceRow => ({
                label: r.value,
                descriptionKey: r.description_key ?? '',
                descriptionFallback: r.description_fallback ?? '',
            }))
            : undefined,
        usedBy: usedByRels.map((r: any): IConstUsedByEntry => ({
            name: r.to_name ?? '',
            slug: r.to_slug ?? undefined,
        })),
        sourceFile: entry.source_file ?? undefined,
        examples: ch.examples.length > 0
            ? ch.examples.map((r: any): IConstExample => ({
                titleKey: r.title_key ?? '',
                titleFallback: r.title_fallback ?? '',
                code: r.code ?? '',
                lang: r.lang ?? 'ts',
            }))
            : undefined,
    }
}

export interface DirectiveChildren {
    args: any[]
    modifiers: any[]
    examples: any[]
    relations: any[]
    descriptionsBySlug: DescriptionsBySlug
}

export function mapDirectiveDoc (entry: any, ch: DirectiveChildren, _locale?: TLocaleCode): IDirectiveDoc {
    const kindExtra = (entry.kind_extra ?? {}) as Record<string, unknown>
    const relatedRels = ch.relations.filter((r: any) => r.rel_type === 'related')

    const related: IComponentRelated[] = relatedRels.map((r: any) => ({
        slug: r.to_slug ?? '',
        name: r.to_name ?? '',
        kind: (r.to_kind ?? 'component') as 'component' | 'directive',
        ...pickDesc(r, ch.descriptionsBySlug, r.to_slug ?? ''),
    }))

    return {
        slug: entry.slug,
        name: entry.name,
        icon: entry.icon ?? '',
        category: entry.category ?? 'Directive',
        descriptionKey: entry.description_key ?? '',
        descriptionFallback: entry.description_fallback ?? '',
        signatureSummary: entry.signature ?? '',
        signatureCode: entry.definition ?? '',
        signatureLang: (kindExtra.signatureLang as string | undefined) ?? 'ts',
        args: ch.args.length > 0 ? ch.args.map(mapDirectiveArg) : undefined,
        modifiers: ch.modifiers.length > 0 ? ch.modifiers.map(mapDirectiveModifier) : undefined,
        examples: ch.examples.map((r: any): IDirectiveExample => ({
            titleKey: r.title_key ?? '',
            titleFallback: r.title_fallback ?? '',
            code: r.code ?? '',
            lang: r.lang ?? 'vue',
        })),
        related: related.length > 0 ? related : undefined,
        noteKey: entry.note_key ?? undefined,
        noteFallback: entry.note_fallback ?? undefined,
        storyUrl: entry.story_url ?? undefined,
    }
}

export interface EnumChildren {
    values: any[]
    examples: any[]
    relations: any[]
}

export function mapEnumDoc (entry: any, ch: EnumChildren, _locale?: TLocaleCode): IEnumDoc {
    const usedByRels = ch.relations.filter((r: any) => r.rel_type === 'used_by')

    return {
        slug: entry.slug,
        name: entry.name,
        definition: entry.definition ?? '',
        category: entry.category ?? '',
        descriptionKey: entry.description_key ?? '',
        descriptionFallback: entry.description_fallback ?? '',
        values: ch.values.map(mapEnumValue),
        usedBy: usedByRels.map((r: any): IEnumUsedByEntry => ({
            slug: r.to_slug ?? '',
            name: r.to_name ?? '',
            propName: r.prop_name ?? '',
        })),
        sourceFile: entry.source_file ?? undefined,
        examples: ch.examples.length > 0
            ? ch.examples.map((r: any): IEnumExample => ({
                titleKey: r.title_key ?? '',
                titleFallback: r.title_fallback ?? '',
                code: r.code ?? '',
                lang: r.lang ?? 'ts',
            }))
            : undefined,
    }
}

export interface InterfaceChildren {
    props: any[]
    examples: any[]
    relations: any[]
}

export function mapInterfaceDoc (entry: any, ch: InterfaceChildren, _locale?: TLocaleCode): IInterfaceDoc {
    const extendsRels = ch.relations.filter((r: any) => r.rel_type === 'extends')
    const usedByRels = ch.relations.filter((r: any) => r.rel_type === 'used_by')

    return {
        slug: entry.slug,
        name: entry.name,
        definition: entry.definition ?? '',
        category: entry.category ?? '',
        descriptionKey: entry.description_key ?? '',
        descriptionFallback: entry.description_fallback ?? '',
        extends: extendsRels.map((r: any) => r.to_name ?? '').filter(Boolean),
        props: ch.props.map(mapInterfacePropRow),
        usedBy: usedByRels.map((r: any): IInterfaceUsedByEntry => ({
            slug: r.to_slug ?? '',
            name: r.to_name ?? '',
            kind: (r.to_kind ?? 'component') as 'component' | 'composable',
        })),
        sourceFile: entry.source_file ?? undefined,
        examples: ch.examples.length > 0
            ? ch.examples.map((r: any): IInterfaceExample => ({
                titleKey: r.title_key ?? '',
                titleFallback: r.title_fallback ?? '',
                code: r.code ?? '',
                lang: r.lang ?? 'ts',
            }))
            : undefined,
    }
}

export interface TypeChildren {
    values: any[]
    examples: any[]
    relations: any[]
}

export function mapTypeDoc (entry: any, ch: TypeChildren, _locale?: TLocaleCode): ITypeDoc {
    const kindExtra = (entry.kind_extra ?? {}) as Record<string, unknown>
    const usedByRels = ch.relations.filter((r: any) => r.rel_type === 'used_by')

    return {
        slug: entry.slug,
        name: entry.name,
        kind: ((kindExtra.typeKind as string | undefined) ?? 'type') as 'type' | 'enum',
        definition: entry.definition ?? '',
        category: entry.category ?? '',
        descriptionKey: entry.description_key ?? '',
        descriptionFallback: entry.description_fallback ?? '',
        values: ch.values.map((r: any): IReferenceRow => ({
            label: r.value,
            descriptionKey: r.description_key ?? '',
            descriptionFallback: r.description_fallback ?? '',
        })),
        usedBy: usedByRels.map((r: any): ITypeUsedByEntry => ({
            slug: r.to_slug ?? '',
            name: r.to_name ?? '',
            propName: r.prop_name ?? '',
        })),
        sourceFile: entry.source_file ?? undefined,
        examples: ch.examples.length > 0
            ? ch.examples.map((r: any): ITypeExample => ({
                titleKey: r.title_key ?? '',
                titleFallback: r.title_fallback ?? '',
                code: r.code ?? '',
                lang: r.lang ?? 'ts',
            }))
            : undefined,
    }
}

export interface UtilChildren {
    params: any[]
    returns: any[]
    examples: any[]
    relations: any[]
}

export function mapUtilDoc (entry: any, ch: UtilChildren, _locale?: TLocaleCode): IUtilDoc {
    const relatedRels = ch.relations.filter((r: any) => r.rel_type === 'related')
    const returnRow = ch.returns[0]

    return {
        slug: entry.slug,
        name: entry.name,
        category: entry.category ?? '',
        icon: entry.icon ?? '',
        descriptionKey: entry.description_key ?? '',
        descriptionFallback: entry.description_fallback ?? '',
        signature: entry.signature ?? '',
        params: ch.params.map(mapUtilParam),
        returns: returnRow
            ? mapUtilReturn(returnRow)
            : { label: '', type: 'void', descriptionKey: '', descriptionFallback: '' },
        sourceFile: entry.source_file ?? '',
        examples: ch.examples.map((r: any): IUtilExample => ({
            titleKey: r.title_key ?? '',
            titleFallback: r.title_fallback ?? '',
            code: r.code ?? '',
            lang: r.lang ?? 'ts',
        })),
        related: relatedRels.map((r: any) => r.to_slug ?? '').filter(Boolean),
        noteKey: entry.note_key ?? undefined,
        noteFallback: entry.note_fallback ?? undefined,
    }
}
