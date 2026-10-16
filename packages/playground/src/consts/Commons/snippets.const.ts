import type { IComponentSnippet } from '../../interfaces/Catalog/component-snippet.interface'
import type { IPlaygroundInstance } from '../../interfaces/Scene/playground-instance.interface'
import type { TTranslate } from '../../types/Commons/translate.type'

/*********************************************************
 * Requires-a-parent table — AUTHORED, not measured
 *
 * @description
 * `IComponentDefinition.requiresParent` is a fact no extractor can see:
 * `Component.props` says nothing about an `inject()`, and the printed type
 * does not either (#1048 § 3.4). So it is declared HERE, by hand, next to
 * the snippets that nest these components inside the parent they need —
 * and `attachSnippets` copies it onto the definitions.
 *
 * @description
 * Each entry was checked against the source, not guessed: all three call
 * `useGroupItem(props, KEY)` with `required = true`
 * (`packages/ds/src/composables/Commons/groupItem.composable.ts`), which
 * THROWS `Could not find useGroup injection` without the parent providing
 * `KEY`:
 *   - `OrigamTab`       → `ORIGAM_TABS_KEY`         (`OrigamTab.vue`)
 *   - `OrigamTabPanel`  → `ORIGAM_TAB_PANELS_KEY`   (`OrigamTabPanel.vue:78`)
 *   - `OrigamWindowItem`→ `ORIGAM_WINDOW_GROUP_KEY` (`OrigamWindowItem.vue:88`)
 * The same three are listed `REASON_NEEDS_PARENT` / `parentEnvelope` by
 * `packages/marketing/src/consts/component-preview.const.ts`, measured in a
 * real browser (#728). Key = the child, value = the parent it needs.
 *
 * @description
 * ⛔ Extend this table only with a component whose setup you have read. A
 * component wrongly marked here disappears from the catalogue drawer.
 ********************************************************/
export const SNIPPET_PARENT_OF: Readonly<Record<string, string>> = {
    OrigamTab: 'OrigamTabs',
    OrigamTabPanel: 'OrigamTabPanels',
    OrigamWindowItem: 'OrigamWindow'
}

/*********************************************************
 * Default snippets
 *
 * @description
 * One builder for every snippet the playground ships, keyed by component
 * name. The FIRST snippet of a component is its default: picking the
 * component in the catalogue loads it instead of a blank instance.
 *
 * @description
 * ⛔ A FACTORY taking the translator, never a shared constant — for two
 * reasons. Every visible demo text (a header title, a tab label, a row) is a
 * user-facing string and goes through `t()` like any other (CLAUDE.md, zero
 * hardcoded strings); and a snippet is instantiated into a mutable scene, so
 * handing out one shared object tree would let two loads edit each other
 * (same reason `createEmptyScene` is a factory).
 *
 * @description
 * The ids below are TEMPLATE ids, unique within one snippet only.
 * `instantiateSnippet` re-identifies every instance on load, so loading the
 * same snippet twice never puts two instances with one id in a scene.
 *
 * @description
 * Every prop below is a REAL prop of its component, checked against its
 * interface in `packages/ds/src/interfaces/` — not inferred from a name:
 *   - `OrigamBtn.text`                  — `IBtnProps.text`
 *   - `OrigamDataTable.headers / items` — `IDataTableHeaderProps`,
 *     `IDataTableItemsProps`; header `key` / `title` / `align` / `sortable`
 *     from `IDataTableHeader`. The `item.actions` slot is the per-column
 *     slot `OrigamDataTableRow` renders as `item.${column.key}`.
 *   - `OrigamChart.type / series / categories / title` — `IChartProps`,
 *     series `{ name, data }` from `IChartSeries` (`series` is REQUIRED).
 *   - `OrigamTab.text / value`          — `ITabProps.text`, `IGroupItemProps.value`
 *   - `OrigamWindowItem.value`          — `IGroupItemProps.value`
 *   - `OrigamWindow.modelValue / showArrows` — `IWindowProps`. Without a
 *     `modelValue` no item is active and the window paints NOTHING (measured
 *     in the playground host). `aria-label` is not a prop but the attribute
 *     `OrigamWindow.vue` reads from `attrs` to name itself — without it the
 *     component warns that it cannot declare `role="region"`.
 *   - `OrigamListItem.title / subtitle / value` — `IListItemProps`.
 *     `OrigamList` renders `role="listbox"`, which axe-core requires to be
 *     NAMED (`aria-input-field-name`, WCAG 4.1.2 — measured on the unnamed
 *     list): `aria-label` is passed as a fall-through attribute, like Window's.
 *   - `OrigamSelect.label / items / autocomplete` — `IFieldProps.label`,
 *     `IItemProps.items`, `ISelectProps.autocomplete`
 ********************************************************/
export function createDefaultSnippets (t: TTranslate): Record<string, IComponentSnippet[]> {
    const btn = (id: string, text: string, extra: IPlaygroundInstance['props'] = {}): IPlaygroundInstance => ({
        id,
        componentName: 'OrigamBtn',
        props: { text, ...extra }
    })

    const tab = (id: string, text: string, value: string): IPlaygroundInstance => ({
        id,
        componentName: 'OrigamTab',
        props: { text, value }
    })

    const windowItem = (id: string, value: number): IPlaygroundInstance => ({
        id,
        componentName: 'OrigamWindowItem',
        props: { value },
        slotContent: t('playground.snippet.window.slide', 'Slide {n}', { n: value })
    })

    const listItem = (id: string, title: string, value: string, subtitle?: string): IPlaygroundInstance => ({
        id,
        componentName: 'OrigamListItem',
        props: subtitle ? { title, subtitle, value } : { title, value }
    })

    const dataTableHeaders = [
        { key: 'name', title: t('playground.snippet.data_table.header_name', 'Name') },
        { key: 'role', title: t('playground.snippet.data_table.header_role', 'Role') },
        { key: 'seats', title: t('playground.snippet.data_table.header_seats', 'Seats'), align: 'end' }
    ]

    const dataTableItems = [
        { name: t('playground.snippet.data_table.person_ada', 'Ada Lovelace'), role: t('playground.snippet.data_table.role_owner', 'Owner'), seats: 4 },
        { name: t('playground.snippet.data_table.person_alan', 'Alan Turing'), role: t('playground.snippet.data_table.role_admin', 'Admin'), seats: 2 },
        { name: t('playground.snippet.data_table.person_grace', 'Grace Hopper'), role: t('playground.snippet.data_table.role_member', 'Member'), seats: 1 }
    ]

    const chartSeries = [
        { name: t('playground.snippet.chart.series_revenue', 'Revenue'), data: [12, 19, 14, 23] },
        { name: t('playground.snippet.chart.series_costs', 'Costs'), data: [8, 11, 9, 13] }
    ]

    const chartCategories = [
        t('playground.snippet.chart.category_q1', 'Q1'),
        t('playground.snippet.chart.category_q2', 'Q2'),
        t('playground.snippet.chart.category_q3', 'Q3'),
        t('playground.snippet.chart.category_q4', 'Q4')
    ]

    const selectItems = [
        t('playground.snippet.select.item_paris', 'Paris'),
        t('playground.snippet.select.item_lyon', 'Lyon'),
        t('playground.snippet.select.item_nantes', 'Nantes'),
        t('playground.snippet.select.item_lille', 'Lille')
    ]

    return {
        OrigamBtn: [
            {
                id: 'btn-labelled',
                label: t('playground.snippet.btn.labelled_label', 'Labelled button'),
                description: t('playground.snippet.btn.labelled_description', 'A button with a text, so it has an accessible name.'),
                instances: [btn('btn', t('playground.snippet.btn.text', 'Button'))]
            }
        ],
        OrigamDataTable: [
            {
                id: 'data-table-actions',
                label: t('playground.snippet.data_table.actions_label', 'Rows with an action cell'),
                description: t('playground.snippet.data_table.actions_description', 'Headers, three rows, and a button in the item.actions cell slot.'),
                instances: [
                    {
                        id: 'table',
                        componentName: 'OrigamDataTable',
                        props: {
                            headers: [
                                ...dataTableHeaders,
                                { key: 'actions', title: t('playground.snippet.data_table.header_actions', 'Actions'), sortable: false }
                            ],
                            items: dataTableItems
                        },
                        children: {
                            'item.actions': [btn('edit', t('playground.snippet.data_table.edit', 'Edit'), { variant: 'text', size: 'small' })]
                        }
                    }
                ]
            },
            {
                id: 'data-table-minimal',
                label: t('playground.snippet.data_table.minimal_label', 'Minimal'),
                description: t('playground.snippet.data_table.minimal_description', 'Headers and items only.'),
                instances: [{ id: 'table', componentName: 'OrigamDataTable', props: { headers: dataTableHeaders, items: dataTableItems } }]
            }
        ],
        OrigamChart: [
            {
                id: 'chart-line',
                label: t('playground.snippet.chart.line_label', 'Line chart'),
                instances: [{
                    id: 'chart',
                    componentName: 'OrigamChart',
                    props: { type: 'line', title: t('playground.snippet.chart.title', 'Quarterly results'), series: chartSeries, categories: chartCategories }
                }]
            },
            {
                id: 'chart-bar',
                label: t('playground.snippet.chart.bar_label', 'Bar chart'),
                instances: [{
                    id: 'chart',
                    componentName: 'OrigamChart',
                    props: { type: 'bar', title: t('playground.snippet.chart.title', 'Quarterly results'), series: chartSeries, categories: chartCategories }
                }]
            }
        ],
        OrigamTabs: [
            {
                id: 'tabs-three',
                label: t('playground.snippet.tabs.three_label', 'Three tabs'),
                instances: [{
                    id: 'tabs',
                    componentName: 'OrigamTabs',
                    props: {},
                    children: {
                        default: [
                            tab('tab-profile', t('playground.snippet.tabs.profile', 'Profile'), 'profile'),
                            tab('tab-settings', t('playground.snippet.tabs.settings', 'Settings'), 'settings'),
                            tab('tab-billing', t('playground.snippet.tabs.billing', 'Billing'), 'billing')
                        ]
                    }
                }]
            }
        ],
        OrigamTab: [
            {
                id: 'tab-child',
                label: t('playground.snippet.tabs.new_label', 'New tab'),
                instances: [{ id: 'tab', componentName: 'OrigamTab', props: { text: t('playground.snippet.tabs.new', 'New tab') } }]
            }
        ],
        OrigamWindow: [
            {
                id: 'window-slides',
                label: t('playground.snippet.window.slides_label', 'Three slides'),
                instances: [{
                    id: 'window',
                    componentName: 'OrigamWindow',
                    props: {
                        modelValue: 1,
                        showArrows: true,
                        'aria-label': t('playground.snippet.window.aria_label', 'Demo slides')
                    },
                    children: { default: [windowItem('slide-1', 1), windowItem('slide-2', 2), windowItem('slide-3', 3)] }
                }]
            }
        ],
        OrigamList: [
            {
                id: 'list-items',
                label: t('playground.snippet.list.items_label', 'Three items'),
                instances: [{
                    id: 'list',
                    componentName: 'OrigamList',
                    props: { 'aria-label': t('playground.snippet.list.aria_label', 'Mailboxes') },
                    children: {
                        default: [
                            listItem('item-inbox', t('playground.snippet.list.inbox', 'Inbox'), 'inbox', t('playground.snippet.list.inbox_subtitle', '3 unread')),
                            listItem('item-sent', t('playground.snippet.list.sent', 'Sent'), 'sent', t('playground.snippet.list.sent_subtitle', 'Yesterday')),
                            listItem('item-archive', t('playground.snippet.list.archive', 'Archive'), 'archive', t('playground.snippet.list.archive_subtitle', '128 items'))
                        ]
                    }
                }]
            }
        ],
        OrigamListItem: [
            {
                id: 'list-item',
                label: t('playground.snippet.list.new_label', 'List item'),
                instances: [listItem('item', t('playground.snippet.list.new', 'New item'), 'new')]
            }
        ],
        OrigamSelect: [
            {
                id: 'select-items',
                label: t('playground.snippet.select.items_label', 'With items'),
                instances: [{ id: 'select', componentName: 'OrigamSelect', props: { label: t('playground.snippet.select.label', 'City'), items: selectItems } }]
            },
            {
                id: 'select-autocomplete',
                label: t('playground.snippet.select.autocomplete_label', 'Autocomplete'),
                instances: [{
                    id: 'select',
                    componentName: 'OrigamSelect',
                    props: { label: t('playground.snippet.select.label', 'City'), items: selectItems, autocomplete: true }
                }]
            }
        ],
        ...createChartSnippets(t)
    }
}

/*********************************************************
 * Chart family snippets (lot E1, #1164)
 *
 * @description
 * One default snippet for each `OrigamChart*` the host catalogue carries
 * besides `OrigamChart` (above). Each was MEASURED rendering empty without
 * one in the standalone host — "No data to display", a 0-px box, or a
 * render error (`series` is required and dereferenced) — see the PR.
 *
 * @description
 * ⛔ `IChartSeries.data` is typed `number[] | IChartSeriesPoint[]`, but most
 * families read a DIFFERENT datum shape out of `series[0].data` and cast it
 * (`as unknown as IChartXxxDatum[]`). Each datum below follows the shape the
 * family's OWN interface declares, read in `packages/ds/src/interfaces/Chart/`:
 *   - BoxPlot      `IChartBoxPlotDatum`   { category, min, q1, median, q3, max, outliers? }
 *   - Bullet       `IChartBulletDatum`    { value, target, ranges: IChartBulletRange[] }, ONE per series (`ser.data[0]`)
 *   - Candlestick  `IChartCandlestickDatum` { date, open, high, low, close }
 *   - Heatmap      `IChartHeatmapDatum`   { x, y, value } + `xCategories` / `yCategories`
 *   - Honeycomb    { x, y, value?, name? } (column / row INDEX — `OrigamChartHoneycomb.vue`)
 *   - Map          `IChartMapChoroplethDatum` { code (ISO-3166-1 alpha-2), value }
 *   - Pareto       `IChartParetoDatum`    { category, value }
 *   - Sankey       `IChartSankeyDatum`    { from, to, value }
 *   - Sunburst     `IChartSunburstDatum`  { name, value?, children? }
 *   - Treemap      `IChartTreemapDatum`   { name, value }
 *   - Variwide     `IChartVariwideDatum`  { category, value, width }
 *   - WordCloud    `{ text, value }` (`IChartWordCloudProps` JSDoc)
 *   - Gauge        `series[0].data[0]` only (`IChartGaugeProps`)
 * The numeric families (Cartesian, Polar, PolarBar, Pyramid, Radar,
 * Sparkline, Streamgraph, Pictorial) take plain `number[]` aligned on
 * `categories`, exactly `IChartSeries`.
 *
 * @description
 * The three non-plotting members take their own props, not a series list:
 *   - `OrigamChartLegend.items`         — `IChartLegendItem` { series, index, color, visible }
 *   - `OrigamChartRangeSelector.buttons`— `IChartRangeSelectorButton` { label, count? | fraction? }
 *   - `OrigamChartTooltip.point / series / category / x / y` — `IChartTooltipProps`
 * Their `color` is a resolved CSS colour (`IChartLegendItem.color`,
 * `IChartPoint.color`), handed a DS token through `var()` — never a hex.
 * `OrigamChartTooltip` ships no `<style>` of its own (its card styles live
 * in the plotting families that host it), so alone it renders its content
 * unstyled: measured, the series name and the value, as text.
 *
 * @description
 * ⛔ `OrigamChartAxis` has NO snippet, on purpose. Its template roots are
 * `<g>` elements: it paints INSIDE the `<svg>` of a cartesian chart, which
 * hands it `plot` / `ticks` from `useChart()`. No catalogue component offers
 * a slot inside its `<svg>`, so there is no parent to nest it in either —
 * `SNIPPET_PARENT_OF` would hide it from the drawer and offer it nowhere.
 * Measured: rendered alone, it throws on `ticks.y`; with data, a `<g>` outside
 * an `<svg>` paints nothing.
 *
 * @description
 * Demo TEXT goes through `t()` (series names, categories, labels). Data
 * that is not text stays raw: numbers, ISO dates, ISO country codes.
 ********************************************************/
function createChartSnippets (t: TTranslate): Record<string, IComponentSnippet[]> {
    const title = t('playground.snippet.chart.title', 'Quarterly results')

    const quarters = [
        t('playground.snippet.chart.category_q1', 'Q1'),
        t('playground.snippet.chart.category_q2', 'Q2'),
        t('playground.snippet.chart.category_q3', 'Q3'),
        t('playground.snippet.chart.category_q4', 'Q4')
    ]

    const revenue = t('playground.snippet.chart.series_revenue', 'Revenue')
    const costs = t('playground.snippet.chart.series_costs', 'Costs')
    const numericSeries = [
        { name: revenue, data: [12, 19, 14, 23] },
        { name: costs, data: [8, 11, 9, 13] }
    ]

    const one = (componentName: string, id: string, label: string, props: IPlaygroundInstance['props']): IComponentSnippet[] => [
        { id, label, instances: [{ id: 'chart', componentName, props }] }
    ]

    const channels = [
        t('playground.snippet.chart_family.channel_search', 'Search'),
        t('playground.snippet.chart_family.channel_social', 'Social'),
        t('playground.snippet.chart_family.channel_email', 'Email'),
        t('playground.snippet.chart_family.channel_direct', 'Direct')
    ]

    const weekdays = [
        t('playground.snippet.chart_family.day_mon', 'Mon'),
        t('playground.snippet.chart_family.day_tue', 'Tue'),
        t('playground.snippet.chart_family.day_wed', 'Wed')
    ]

    const slots = [
        t('playground.snippet.chart_family.slot_morning', 'Morning'),
        t('playground.snippet.chart_family.slot_afternoon', 'Afternoon'),
        t('playground.snippet.chart_family.slot_evening', 'Evening')
    ]

    const heatValues = [[3, 7, 2], [5, 9, 4], [1, 6, 8]]

    const legendColors = ['var(--origam-color__action--primary---bg)', 'var(--origam-color__feedback--danger---bg)']

    return {
        OrigamChartBoxPlot: one('OrigamChartBoxPlot', 'chart-box-plot', t('playground.snippet.chart_family.box_plot_label', 'Response times'), {
            title: t('playground.snippet.chart_family.box_plot_title', 'Response time per endpoint (ms)'),
            series: [{
                name: t('playground.snippet.chart_family.box_plot_series', 'Response time'),
                data: [
                    { category: t('playground.snippet.chart_family.endpoint_users', 'Users'), min: 12, q1: 18, median: 24, q3: 32, max: 58, outliers: [120] },
                    { category: t('playground.snippet.chart_family.endpoint_orders', 'Orders'), min: 45, q1: 58, median: 70, q3: 88, max: 132, outliers: [] },
                    { category: t('playground.snippet.chart_family.endpoint_payments', 'Payments'), min: 80, q1: 95, median: 115, q3: 140, max: 200, outliers: [320] }
                ]
            }]
        }),
        OrigamChartBullet: one('OrigamChartBullet', 'chart-bullet', t('playground.snippet.chart_family.bullet_label', 'Targets'), {
            title: t('playground.snippet.chart_family.bullet_title', 'Quarter against target'),
            series: [
                { name: revenue, data: [{ value: 270, target: 250, ranges: [{ to: 150 }, { to: 225 }, { to: 300 }] }] },
                { name: costs, data: [{ value: 180, target: 200, ranges: [{ to: 120 }, { to: 200 }, { to: 260 }] }] }
            ]
        }),
        OrigamChartCandlestick: one('OrigamChartCandlestick', 'chart-candlestick', t('playground.snippet.chart_family.candlestick_label', 'Daily prices'), {
            title: t('playground.snippet.chart_family.candlestick_title', 'Share price'),
            series: [{
                name: t('playground.snippet.chart_family.candlestick_series', 'Price'),
                data: [
                    { date: '2026-10-05', open: 102, high: 108, low: 99, close: 106 },
                    { date: '2026-10-06', open: 106, high: 110, low: 101, close: 103 },
                    { date: '2026-10-07', open: 103, high: 105, low: 96, close: 98 },
                    { date: '2026-10-08', open: 98, high: 104, low: 97, close: 103 },
                    { date: '2026-10-09', open: 103, high: 112, low: 102, close: 111 }
                ]
            }]
        }),
        OrigamChartCartesian: one('OrigamChartCartesian', 'chart-cartesian', t('playground.snippet.chart.line_label', 'Line chart'), {
            type: 'line', title, series: numericSeries, categories: quarters
        }),
        OrigamChartGauge: one('OrigamChartGauge', 'chart-gauge', t('playground.snippet.chart_family.gauge_label', 'Single value'), {
            title: t('playground.snippet.chart_family.gauge_title', 'Disk usage'),
            gaugeUnit: '%',
            series: [{ name: t('playground.snippet.chart_family.gauge_series', 'Used'), data: [72] }]
        }),
        OrigamChartHeatmap: one('OrigamChartHeatmap', 'chart-heatmap', t('playground.snippet.chart_family.heatmap_label', 'Weekly activity'), {
            title: t('playground.snippet.chart_family.heatmap_title', 'Sessions per time slot'),
            xCategories: weekdays,
            yCategories: slots,
            series: [{
                name: t('playground.snippet.chart_family.heatmap_series', 'Sessions'),
                data: slots.flatMap((y, row) => weekdays.map((x, column) => ({ x, y, value: heatValues[row]?.[column] ?? 0 })))
            }]
        }),
        OrigamChartHoneycomb: one('OrigamChartHoneycomb', 'chart-honeycomb', t('playground.snippet.chart_family.honeycomb_label', 'Tile map'), {
            title: t('playground.snippet.chart_family.honeycomb_title', 'Stores per region'),
            series: [{
                name: t('playground.snippet.chart_family.honeycomb_series', 'Stores'),
                data: [
                    { x: 0, y: 0, value: 4, name: t('playground.snippet.chart_family.region_north', 'North') },
                    { x: 1, y: 0, value: 7, name: t('playground.snippet.chart_family.region_east', 'East') },
                    { x: 0, y: 1, value: 2, name: t('playground.snippet.chart_family.region_west', 'West') },
                    { x: 1, y: 1, value: 9, name: t('playground.snippet.chart_family.region_south', 'South') }
                ]
            }]
        }),
        OrigamChartLegend: [{
            id: 'chart-legend',
            label: t('playground.snippet.chart_family.legend_label', 'Two series'),
            instances: [{
                id: 'legend',
                componentName: 'OrigamChartLegend',
                props: { items: numericSeries.map((series, index) => ({ series, index, color: legendColors[index] ?? legendColors[0], visible: true })) }
            }]
        }],
        OrigamChartMap: one('OrigamChartMap', 'chart-map', t('playground.snippet.chart_family.map_label', 'Choropleth'), {
            title: t('playground.snippet.chart_family.map_title', 'Customers per country'),
            series: [{
                name: t('playground.snippet.chart_family.map_series', 'Customers'),
                data: [{ code: 'FR', value: 120 }, { code: 'DE', value: 90 }, { code: 'ES', value: 60 }, { code: 'US', value: 200 }, { code: 'BR', value: 40 }]
            }]
        }),
        OrigamChartPareto: one('OrigamChartPareto', 'chart-pareto', t('playground.snippet.chart_family.pareto_label', 'Defect causes'), {
            title: t('playground.snippet.chart_family.pareto_title', 'Support tickets by cause'),
            series: [{
                name: t('playground.snippet.chart_family.pareto_series', 'Tickets'),
                data: [
                    { category: t('playground.snippet.chart_family.cause_login', 'Login'), value: 42 },
                    { category: t('playground.snippet.chart_family.cause_billing', 'Billing'), value: 27 },
                    { category: t('playground.snippet.chart_family.cause_export', 'Export'), value: 12 },
                    { category: t('playground.snippet.chart_family.cause_other', 'Other'), value: 6 }
                ]
            }]
        }),
        OrigamChartPictorial: one('OrigamChartPictorial', 'chart-pictorial', t('playground.snippet.chart_family.pictorial_label', 'Icons per value'), {
            title: t('playground.snippet.chart_family.pictorial_title', 'Team size'),
            categories: quarters,
            series: [{ name: t('playground.snippet.chart_family.pictorial_series', 'People'), data: [3, 5, 4, 6] }]
        }),
        OrigamChartPolar: one('OrigamChartPolar', 'chart-polar', t('playground.snippet.chart_family.polar_label', 'Donut'), {
            type: 'donut',
            title: t('playground.snippet.chart_family.polar_title', 'Traffic by channel'),
            categories: channels,
            series: [{ name: t('playground.snippet.chart_family.traffic_series', 'Visits'), data: [45, 25, 18, 12] }]
        }),
        OrigamChartPolarBar: one('OrigamChartPolarBar', 'chart-polar-bar', t('playground.snippet.chart_family.polar_bar_label', 'Radial bars'), {
            title: t('playground.snippet.chart_family.polar_title', 'Traffic by channel'),
            categories: channels,
            series: [{ name: t('playground.snippet.chart_family.traffic_series', 'Visits'), data: [45, 25, 18, 12] }]
        }),
        OrigamChartPyramid: one('OrigamChartPyramid', 'chart-pyramid', t('playground.snippet.chart_family.pyramid_label', 'Funnel'), {
            type: 'funnel',
            title: t('playground.snippet.chart_family.pyramid_title', 'Sign-up funnel'),
            categories: [
                t('playground.snippet.chart_family.step_visit', 'Visit'),
                t('playground.snippet.chart_family.step_sign_up', 'Sign-up'),
                t('playground.snippet.chart_family.step_trial', 'Trial'),
                t('playground.snippet.chart_family.step_paid', 'Paid')
            ],
            series: [{ name: t('playground.snippet.chart_family.pyramid_series', 'Users'), data: [1000, 420, 180, 60] }]
        }),
        OrigamChartRadar: one('OrigamChartRadar', 'chart-radar', t('playground.snippet.chart_family.radar_label', 'Two profiles'), {
            title, categories: quarters, series: numericSeries
        }),
        OrigamChartRangeSelector: [{
            id: 'chart-range-selector',
            label: t('playground.snippet.chart_family.range_selector_label', 'Three presets'),
            instances: [{
                id: 'range-selector',
                componentName: 'OrigamChartRangeSelector',
                props: {
                    dataLength: 12,
                    activeIndex: 0,
                    buttons: [
                        { label: t('playground.snippet.chart_family.range_3m', '3m'), count: 3 },
                        { label: t('playground.snippet.chart_family.range_6m', '6m'), count: 6 },
                        { label: t('playground.snippet.chart_family.range_all', 'All'), fraction: 1 }
                    ]
                }
            }]
        }],
        OrigamChartSankey: one('OrigamChartSankey', 'chart-sankey', t('playground.snippet.chart_family.sankey_label', 'Flows'), {
            title: t('playground.snippet.chart_family.sankey_title', 'Where visitors go'),
            series: [{
                name: t('playground.snippet.chart_family.sankey_series', 'Visitors'),
                data: [
                    { from: channels[0] ?? '', to: t('playground.snippet.chart_family.step_sign_up', 'Sign-up'), value: 30 },
                    { from: channels[0] ?? '', to: t('playground.snippet.chart_family.step_bounce', 'Bounce'), value: 15 },
                    { from: channels[1] ?? '', to: t('playground.snippet.chart_family.step_sign_up', 'Sign-up'), value: 10 },
                    { from: channels[1] ?? '', to: t('playground.snippet.chart_family.step_bounce', 'Bounce'), value: 15 }
                ]
            }]
        }),
        OrigamChartSparkline: one('OrigamChartSparkline', 'chart-sparkline', t('playground.snippet.chart_family.sparkline_label', 'Trend'), {
            series: [{ name: revenue, data: [12, 19, 14, 23, 18, 27, 25] }]
        }),
        OrigamChartStreamgraph: one('OrigamChartStreamgraph', 'chart-streamgraph', t('playground.snippet.chart_family.streamgraph_label', 'Stacked flow'), {
            title, categories: quarters, series: numericSeries
        }),
        OrigamChartSunburst: one('OrigamChartSunburst', 'chart-sunburst', t('playground.snippet.chart_family.sunburst_label', 'Hierarchy'), {
            title: t('playground.snippet.chart_family.sunburst_title', 'Budget breakdown'),
            series: [{
                name: t('playground.snippet.chart_family.sunburst_series', 'Budget'),
                data: [
                    {
                        name: t('playground.snippet.chart_family.budget_product', 'Product'),
                        children: [
                            { name: t('playground.snippet.chart_family.budget_design', 'Design'), value: 20 },
                            { name: t('playground.snippet.chart_family.budget_engineering', 'Engineering'), value: 45 }
                        ]
                    },
                    {
                        name: t('playground.snippet.chart_family.budget_marketing', 'Marketing'),
                        children: [
                            { name: t('playground.snippet.chart_family.budget_ads', 'Ads'), value: 25 },
                            { name: t('playground.snippet.chart_family.budget_events', 'Events'), value: 10 }
                        ]
                    }
                ]
            }]
        }),
        OrigamChartTooltip: [{
            id: 'chart-tooltip',
            label: t('playground.snippet.chart_family.tooltip_label', 'Hovered point'),
            instances: [{
                id: 'tooltip',
                componentName: 'OrigamChartTooltip',
                props: {
                    point: { seriesIndex: 0, seriesName: revenue, dataIndex: 1, x: quarters[1] ?? '', y: 19, color: legendColors[0] ?? '' },
                    series: numericSeries[0] ?? { name: revenue, data: [] },
                    category: quarters[1] ?? '',
                    x: 0,
                    y: 0
                }
            }]
        }],
        OrigamChartTreemap: one('OrigamChartTreemap', 'chart-treemap', t('playground.snippet.chart_family.treemap_label', 'Tiles'), {
            title: t('playground.snippet.chart_family.treemap_title', 'Storage by folder'),
            series: [{
                name: t('playground.snippet.chart_family.treemap_series', 'Storage'),
                data: [
                    { name: t('playground.snippet.chart_family.folder_photos', 'Photos'), value: 48 },
                    { name: t('playground.snippet.chart_family.folder_videos', 'Videos'), value: 30 },
                    { name: t('playground.snippet.chart_family.folder_documents', 'Documents'), value: 14 },
                    { name: t('playground.snippet.chart_family.folder_music', 'Music'), value: 8 }
                ]
            }]
        }),
        OrigamChartVariwide: one('OrigamChartVariwide', 'chart-variwide', t('playground.snippet.chart_family.variwide_label', 'Value and weight'), {
            title: t('playground.snippet.chart_family.variwide_title', 'Revenue per customer, weighted by customers'),
            series: [{
                name: revenue,
                data: [
                    { category: t('playground.snippet.chart_family.plan_free', 'Free'), value: 2, width: 60 },
                    { category: t('playground.snippet.chart_family.plan_team', 'Team'), value: 12, width: 30 },
                    { category: t('playground.snippet.chart_family.plan_enterprise', 'Enterprise'), value: 40, width: 10 }
                ]
            }]
        }),
        OrigamChartWordCloud: one('OrigamChartWordCloud', 'chart-word-cloud', t('playground.snippet.chart_family.word_cloud_label', 'Words'), {
            title: t('playground.snippet.chart_family.word_cloud_title', 'Most searched'),
            series: [{
                name: t('playground.snippet.chart_family.word_cloud_series', 'Searches'),
                data: [
                    { text: t('playground.snippet.chart_family.word_button', 'button'), value: 90 },
                    { text: t('playground.snippet.chart_family.word_theme', 'theme'), value: 70 },
                    { text: t('playground.snippet.chart_family.word_table', 'table'), value: 55 },
                    { text: t('playground.snippet.chart_family.word_chart', 'chart'), value: 40 },
                    { text: t('playground.snippet.chart_family.word_dialog', 'dialog'), value: 30 },
                    { text: t('playground.snippet.chart_family.word_tooltip', 'tooltip'), value: 20 }
                ]
            }]
        })
    }
}
