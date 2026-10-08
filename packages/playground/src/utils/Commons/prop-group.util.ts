import { PROP_GROUP_EXACT, PROP_GROUP_IDS, PROP_GROUP_PREFIX, PROP_SIDE_FOLDS } from '../../consts/Commons/prop-group.const'
import type { IPropDefinition } from '../../interfaces/Catalog/prop-definition.interface'
import type { IInspectorGroup, IInspectorPropRow } from '../../interfaces/Commons/inspector-group.interface'
import type { TPropGroupId } from '../../types/Commons/prop-group.type'

/*********************************************************
 * classifyPropGroup
 *
 * @description
 * Map a prop name to its `TPropGroupId`. Falls back to `'other'` so a prop
 * is never silently dropped from the inspector — it just lands in the
 * catch-all group. Exact names first, then prefix fallbacks; see
 * `PROP_GROUP_EXACT` / `PROP_GROUP_PREFIX` for the table.
 ********************************************************/
export function classifyPropGroup (propName: string): TPropGroupId {
    const exact = PROP_GROUP_EXACT[propName]

    if (exact) return exact

    for (const { prefix, group } of PROP_GROUP_PREFIX) {
        if (propName.startsWith(prefix)) return group
    }

    return 'other'
}

/*********************************************************
 * foldedNamesForRoot
 *
 * @description
 * The declination names `PROP_SIDE_FOLDS` lists for one root, FILTERED to
 * names actually present on this component — a component rarely declares
 * every logical declination a root could have.
 *
 * @description
 * ⛔ Throws when a listed declination classifies into a DIFFERENT group than
 * its root. This is the "a fold must never cross a group boundary" rule
 * enforced in code rather than left as a comment someone can violate by
 * editing `PROP_SIDE_FOLDS` without re-checking `PROP_GROUP_EXACT` /
 * `PROP_GROUP_PREFIX`. `top` / `right` / `bottom` / `left` are deliberately
 * ABSENT from any root's fold list for exactly this reason — they classify
 * to `other`, not to `position`'s `layout`.
 ********************************************************/
function foldedNamesForRoot (root: string, present: Set<string>): { names: string[]; axes: Array<{ label: string; names: string[] }> } {
    const axesConfig = PROP_SIDE_FOLDS[root] ?? []
    const rootGroup = classifyPropGroup(root)
    const names: string[] = []
    const axes: Array<{ label: string; names: string[] }> = []

    for (const axis of axesConfig) {
        const axisNames = axis.names.filter(name => present.has(name))

        for (const name of axisNames) {
            if (classifyPropGroup(name) !== rootGroup) {
                throw new Error(
                    `foldedNamesForRoot: "${name}" replie sous "${root}" (groupe ${rootGroup}) ` +
                    `mais classifie dans "${classifyPropGroup(name)}" — repli franchissant un groupe refusé.`
                )
            }
        }

        if (axisNames.length > 0) axes.push({ label: axis.label, names: axisNames })
        names.push(...axisNames)
    }

    return { names, axes }
}

/*********************************************************
 * groupAndFoldProps
 *
 * @description
 * The single entry point the read-only inspector consumes: classify every
 * prop into its `TPropGroupId`, then collapse each root prop's own
 * declinations (per `PROP_SIDE_FOLDS`) into that root's row. Groups with
 * zero props are OMITTED — a component with no `content` prop renders 12
 * groups, not 13 with one empty.
 ********************************************************/
export function groupAndFoldProps (props: IPropDefinition[]): IInspectorGroup[] {
    const byName = new Map(props.map(p => [p.name, p]))
    const present = new Set(byName.keys())

    const byGroup = new Map<TPropGroupId, IPropDefinition[]>()

    for (const prop of props) {
        const group = classifyPropGroup(prop.name)
        const bucket = byGroup.get(group) ?? []

        bucket.push(prop)
        byGroup.set(group, bucket)
    }

    const groups: IInspectorGroup[] = []

    for (const id of PROP_GROUP_IDS) {
        const bucket = byGroup.get(id)

        if (!bucket || bucket.length === 0) continue

        const totalCount = bucket.length
        const foldedByRoot = new Map<string, { names: string[]; axes: Array<{ label: string; names: string[] }> }>()
        const hiddenNames = new Set<string>()

        for (const prop of bucket) {
            if (!(prop.name in PROP_SIDE_FOLDS)) continue

            const folded = foldedNamesForRoot(prop.name, present)

            if (folded.names.length === 0) continue

            foldedByRoot.set(prop.name, folded)
            for (const name of folded.names) hiddenNames.add(name)
        }

        const rows: IInspectorPropRow[] = []

        for (const prop of bucket) {
            if (hiddenNames.has(prop.name)) continue

            const folded = foldedByRoot.get(prop.name)

            if (!folded) {
                rows.push({ definition: prop })
                continue
            }

            rows.push({
                definition: prop,
                fold: {
                    axes: folded.axes,
                    definitions: folded.names.map(name => byName.get(name)).filter((d): d is IPropDefinition => !!d)
                }
            })
        }

        groups.push({ id, rows, totalCount, foldedCount: hiddenNames.size })
    }

    return groups
}
