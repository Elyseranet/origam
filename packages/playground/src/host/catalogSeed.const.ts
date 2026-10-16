/*
 * Demo catalogue of the standalone host (src/host/main.ts) — a SUBSET of the
 * full committed catalogue, `src/assets/catalog/*.json`
 * (`pnpm -F @origam/playground meta:catalog`, #1145).
 *
 * ⛔ Not generated any more, and no prop is written here. Until #1145 this
 * file was a generated copy of its definitions, a second source of truth
 * beside the catalogue; it now only NAMES which components the demo opens
 * with and gives them a category. Every definition comes from the artefact,
 * so the two cannot drift.
 *
 * Eager on purpose: the standalone host and the `TU/playground` specs read
 * `HOST_CATALOG_SEED` synchronously. The glob is a LITERAL list (Vite only
 * accepts literals), so nothing outside these files is bundled.
 *
 * The categories are the curated ones of `packages/marketing`'s catalogue
 * (`server/db/seed/component.json`), never inferred from a name. 11 Chart
 * members carry an EMPTY category there and get none here either
 * (`category` is optional on `IComponentDefinition`).
 */
import type { IComponentDefinition } from '../interfaces/Catalog/component-definition.interface'

const HOST_CATALOG_FILES = import.meta.glob<IComponentDefinition>([
    '../assets/catalog/OrigamBtn.json',
    '../assets/catalog/OrigamSelect.json',
    '../assets/catalog/OrigamSwitch.json',
    '../assets/catalog/OrigamAlert.json',
    '../assets/catalog/OrigamCard.json',
    '../assets/catalog/OrigamChip.json',
    '../assets/catalog/OrigamDataTable.json',
    '../assets/catalog/OrigamChart.json',
    '../assets/catalog/OrigamTabs.json',
    '../assets/catalog/OrigamTab.json',
    '../assets/catalog/OrigamWindow.json',
    '../assets/catalog/OrigamWindowItem.json',
    '../assets/catalog/OrigamList.json',
    '../assets/catalog/OrigamListItem.json',
    '../assets/catalog/OrigamChartAxis.json',
    '../assets/catalog/OrigamChartBoxPlot.json',
    '../assets/catalog/OrigamChartBullet.json',
    '../assets/catalog/OrigamChartCandlestick.json',
    '../assets/catalog/OrigamChartCartesian.json',
    '../assets/catalog/OrigamChartGauge.json',
    '../assets/catalog/OrigamChartHeatmap.json',
    '../assets/catalog/OrigamChartHoneycomb.json',
    '../assets/catalog/OrigamChartLegend.json',
    '../assets/catalog/OrigamChartMap.json',
    '../assets/catalog/OrigamChartPareto.json',
    '../assets/catalog/OrigamChartPictorial.json',
    '../assets/catalog/OrigamChartPolar.json',
    '../assets/catalog/OrigamChartPolarBar.json',
    '../assets/catalog/OrigamChartPyramid.json',
    '../assets/catalog/OrigamChartRadar.json',
    '../assets/catalog/OrigamChartRangeSelector.json',
    '../assets/catalog/OrigamChartSankey.json',
    '../assets/catalog/OrigamChartSparkline.json',
    '../assets/catalog/OrigamChartStreamgraph.json',
    '../assets/catalog/OrigamChartSunburst.json',
    '../assets/catalog/OrigamChartTooltip.json',
    '../assets/catalog/OrigamChartTreemap.json',
    '../assets/catalog/OrigamChartVariwide.json',
    '../assets/catalog/OrigamChartWordCloud.json'
], { eager: true, import: 'default' })

/* Display order of the demo, with the curated category when there is one. */
const HOST_CATALOG_ENTRIES: ReadonlyArray<{ name: string, category?: string }> = [
    { name: 'OrigamBtn', category: 'Form & Input' },
    { name: 'OrigamSelect', category: 'Form & Input' },
    { name: 'OrigamSwitch', category: 'Form & Input' },
    { name: 'OrigamAlert', category: 'Feedback & Status' },
    { name: 'OrigamCard', category: 'Layout & Structure' },
    { name: 'OrigamChip', category: 'Data Display' },
    { name: 'OrigamDataTable', category: 'Data Display' },
    { name: 'OrigamChart', category: 'Data Visualization' },
    { name: 'OrigamTabs', category: 'Navigation' },
    { name: 'OrigamTab', category: 'Navigation' },
    { name: 'OrigamWindow', category: 'Navigation' },
    { name: 'OrigamWindowItem', category: 'Layout & Structure' },
    { name: 'OrigamList', category: 'Data Display' },
    { name: 'OrigamListItem', category: 'Data Display' },
    { name: 'OrigamChartAxis', category: 'Data Visualization' },
    { name: 'OrigamChartBoxPlot', category: 'Data Visualization' },
    { name: 'OrigamChartBullet', category: 'Data Display' },
    { name: 'OrigamChartCandlestick', category: 'Data Visualization' },
    { name: 'OrigamChartCartesian', category: 'Data Visualization' },
    { name: 'OrigamChartGauge', category: 'Data Visualization' },
    { name: 'OrigamChartHeatmap', category: 'Data Display' },
    { name: 'OrigamChartHoneycomb', category: 'Data Display' },
    { name: 'OrigamChartLegend', category: 'Data Display' },
    { name: 'OrigamChartMap', category: 'Data Display' },
    { name: 'OrigamChartPareto', category: 'Data Display' },
    { name: 'OrigamChartPictorial', category: 'Data Display' },
    { name: 'OrigamChartPolar', category: 'Data Display' },
    { name: 'OrigamChartPolarBar', category: 'Data Display' },
    { name: 'OrigamChartPyramid' },
    { name: 'OrigamChartRadar' },
    { name: 'OrigamChartRangeSelector' },
    { name: 'OrigamChartSankey' },
    { name: 'OrigamChartSparkline' },
    { name: 'OrigamChartStreamgraph' },
    { name: 'OrigamChartSunburst' },
    { name: 'OrigamChartTooltip' },
    { name: 'OrigamChartTreemap' },
    { name: 'OrigamChartVariwide' },
    { name: 'OrigamChartWordCloud' }
]

export const HOST_CATALOG_SEED: IComponentDefinition[] = HOST_CATALOG_ENTRIES.map(({ name, category }) => ({
    ...HOST_CATALOG_FILES[`../assets/catalog/${name}.json`]!,
    ...(category ? { category } : {})
}))
