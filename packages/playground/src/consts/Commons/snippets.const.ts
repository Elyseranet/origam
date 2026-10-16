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
        ]
    }
}
