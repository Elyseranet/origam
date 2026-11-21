import type { IChartSankeyDatum, IChartSankeyNode } from '../../interfaces/Chart/chart-sankey.interface'
import type { TChartSankeyLinkSpec } from '../../types/Chart/chart-sankey.type'

/*********************************************************
 * Sankey layout helpers (#1398)
 *
 * @description
 * Pure steps of `OrigamChartSankey`'s node / link layout, extracted from its
 * two `computed` bodies to keep their cognitive complexity in check. Map
 * insertion orders and array sort stability are part of the behaviour (they
 * drive the rendered order) and are preserved verbatim.
 *
 * @description
 * `orderSankeyColumns` is a barycentric ordering: each column is sorted so a
 * node sits near the average position of its neighbours (two down / up
 * sweeps, applied twice — enough on a typical 3-5 column funnel, no LP
 * solver). It mutates the arrays held by `byColumn`.
 *
 * @description
 * `stackSankeyBands` stacks the bands of every node on one side: links leave
 * each source sorted by target Y (arrive at each target sorted by source Y)
 * so ribbons do not cross themselves. It stores the band TOP, not its centre.
 *
 * @description
 * `sankeyRibbonPath` draws two Bezier curves (top + bottom) joined by short
 * vertical segments at each node face, control points midway between ends.
 ********************************************************/

function pushToGroup<K, V> (map: Map<K, Array<V>>, key: K, item: V): void {
    const group = map.get(key)

    if (group) group.push(item)
    else map.set(key, [ item ])
}

export function sumSankeyFlows (
    data: ReadonlyArray<Pick<IChartSankeyDatum, 'from' | 'to' | 'value'>>,
    names: Iterable<string>
): { incomingSum: Map<string, number>, outgoingSum: Map<string, number> } {
    const incomingSum = new Map<string, number>()
    const outgoingSum = new Map<string, number>()

    for (const name of names) {
        incomingSum.set(name, 0)
        outgoingSum.set(name, 0)
    }

    for (const d of data) {
        outgoingSum.set(d.from, (outgoingSum.get(d.from) ?? 0) + d.value)
        incomingSum.set(d.to, (incomingSum.get(d.to) ?? 0) + d.value)
    }

    return { incomingSum, outgoingSum }
}

export function groupSankeyColumns (columns: Map<string, number>): Map<number, Array<string>> {
    const byColumn = new Map<number, Array<string>>()

    for (const [name, col] of columns.entries()) {
        pushToGroup(byColumn, col, name)
    }

    return byColumn
}

export function orderSankeyColumns (
    byColumn: Map<number, Array<string>>,
    edges: ReadonlyArray<{ from: string, to: string }>,
    nodeNames: ReadonlyArray<string>
): void {
    const orderIndex = new Map<string, number>()
    const sortedColumns = Array.from(byColumn.keys()).sort((a, b) => a - b)

    for (const col of sortedColumns) {
        byColumn.get(col)!.forEach((n, i) => orderIndex.set(n, i))
    }

    const predecessors = new Map<string, Array<string>>()
    const successors = new Map<string, Array<string>>()

    for (const name of nodeNames) {
        predecessors.set(name, [])
        successors.set(name, [])
    }

    for (const { from, to } of edges) {
        successors.get(from)!.push(to)
        predecessors.get(to)!.push(from)
    }

    const barycenter = (neighbours: Array<string>): number => {
        if (!neighbours.length) return Number.POSITIVE_INFINITY

        let sum = 0
        let count = 0

        for (const n of neighbours) {
            const idx = orderIndex.get(n)

            if (idx !== undefined) {
                sum += idx
                count++
            }
        }

        return count ? sum / count : Number.POSITIVE_INFINITY
    }

    const sweep = (direction: 'down' | 'up') => {
        const cols = direction === 'down' ? sortedColumns : [ ...sortedColumns ].reverse()
        const neighbours = direction === 'down' ? predecessors : successors

        for (const col of cols) {
            const names = byColumn.get(col)!

            if (names.length < 2) continue

            names.sort((a, b) => barycenter(neighbours.get(a)!) - barycenter(neighbours.get(b)!))
            names.forEach((n, i) => orderIndex.set(n, i))
        }
    }

    for (let pass = 0; pass < 2; pass++) {
        sweep('down')
        sweep('up')
    }
}

export function sankeyNodeHeight (value: number, columnTotal: number, availableHeight: number, nodeCount: number): number {
    return columnTotal > 0 ? (value / columnTotal) * availableHeight : availableHeight / nodeCount
}

function bandHeight (value: number, total: number, nodeHeight: number): number {
    return total > 0 ? (value / total) * nodeHeight : 0
}

export function buildSankeyLinkSpecs (
    data: ReadonlyArray<IChartSankeyDatum>,
    nodeMap: Map<string, IChartSankeyNode>,
    sums: { incomingSum: Map<string, number>, outgoingSum: Map<string, number> },
    resolveColor: (raw: IChartSankeyDatum['color']) => string
): Array<TChartSankeyLinkSpec> {
    const specs: Array<TChartSankeyLinkSpec> = []

    for (let i = 0; i < data.length; i++) {
        const d = data[i]
        const sourceNode = nodeMap.get(d.from)
        const targetNode = nodeMap.get(d.to)

        if (!sourceNode || !targetNode) continue

        const srcOutTotal = sums.outgoingSum.get(d.from) ?? 1
        const tgtInTotal = sums.incomingSum.get(d.to) ?? 1

        specs.push({
            index: i,
            from: d.from,
            to: d.to,
            value: d.value,
            color: d.color ? resolveColor(d.color) : (sourceNode.color ?? 'currentColor'),
            srcBandH: bandHeight(d.value, srcOutTotal, sourceNode.height),
            tgtBandH: bandHeight(d.value, tgtInTotal, targetNode.height),
            srcY: sourceNode.y,
            tgtY: targetNode.y
        })
    }

    return specs
}

export function stackSankeyBands (
    specs: ReadonlyArray<TChartSankeyLinkSpec>,
    nodeMap: Map<string, IChartSankeyNode>,
    side: 'source' | 'target'
): Map<number, { yTop: number, bandH: number }> {
    const isSource = side === 'source'
    const groups = new Map<string, Array<TChartSankeyLinkSpec>>()

    for (const s of specs) {
        pushToGroup(groups, isSource ? s.from : s.to, s)
    }

    const offsets = new Map<number, { yTop: number, bandH: number }>()

    for (const [name, group] of groups.entries()) {
        group.sort((a, b) => isSource ? a.tgtY - b.tgtY : a.srcY - b.srcY)

        let acc = nodeMap.get(name)!.y

        for (const link of group) {
            const bandH = isSource ? link.srcBandH : link.tgtBandH

            offsets.set(link.index, { yTop: acc, bandH })
            acc += bandH
        }
    }

    return offsets
}

export function sankeyRibbonPath (
    x0: number,
    x1: number,
    source: { yTop: number, bandH: number },
    target: { yTop: number, bandH: number }
): string {
    const y0Top = source.yTop
    const y0Bot = source.yTop + source.bandH
    const y1Top = target.yTop
    const y1Bot = target.yTop + target.bandH

    const cp = (x1 - x0) * 0.5

    return [
        `M ${ x0 },${ y0Top }`,
        `C ${ x0 + cp },${ y0Top } ${ x1 - cp },${ y1Top } ${ x1 },${ y1Top }`,
        `L ${ x1 },${ y1Bot }`,
        `C ${ x1 - cp },${ y1Bot } ${ x0 + cp },${ y0Bot } ${ x0 },${ y0Bot }`,
        'Z'
    ].join(' ')
}
