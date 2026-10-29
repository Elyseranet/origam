import { ref } from 'vue'

import type { IComponentSnippet, IPlaygroundInstance } from '@origam/playground/interfaces'
import type { TTranslate } from '@origam/playground/types'

/**
 * playground-snippets.const.ts — what the marketing site seeds the playground
 * engine with, per component (lot E, #1145).
 *
 * ORIGINE : la table `COMPONENT_PREVIEW_ADAPTERS` (`component-preview.const.ts`,
 * supprimée par ce lot) décrivait, par slug, le minimum pour qu'un composant
 * isolé se rende VISIBLEMENT : `previewProps`, `slotText`, `slotChildren`,
 * `parentEnvelope`. Le moteur du playground porte exactement ce besoin sous une
 * autre forme — un SNIPPET, arbre d'instances — donc chaque adaptateur devient
 * ici un snippet, sans perte :
 *
 *   previewProps    → `props` de l'instance racine ;
 *   slotText        → `slotContent` ;
 *   slotChildren    → `children.default` ;
 *   parentEnvelope  → le parent devient la RACINE, le composant documenté son
 *                     enfant dans le slot choisi (`tab` → `origam-tabs`,
 *                     `data-table-row` → slot `body` d'`origam-data-table`).
 *
 * Les composants qui ne PEUVENT PAS se rendre seuls gardent leur raison, dans
 * `PLAYGROUND_UNAVAILABLE_REASONS` (`playground-host.const.ts`).
 *
 * ⛔ La conversion a retiré 12 « props » que l'ancienne table posait sans
 * qu'aucun composant ne les déclare (elles tombaient en attributs muets) :
 * `width` sur ExpansionPanels / Form / TabPanels / Watermark / DataList /
 * InlineEdit / Treeview, `height` sur Watermark, `categories` sur
 * ChartSunburst ; trois avaient un vrai nom et le reçoivent —
 * `OrigamAlert.type` → `status`, `OrigamDivider.width` → `length` (l'attribut
 * HTML `width` de `<hr>` est gardé, il est effectif),
 * `OrigamProgressLinear.height` → `thickness`.
 *
 * ⛔ Toutes les props sont vérifiées contre le catalogue extrait du DS par
 * `packages/tests/TU/marketing/playground-snippets.spec.ts` — un snippet qui
 * invente une prop y échoue. Les textes de démo passent tous par `t()`.
 *
 * Le snippet du playground lui-même (`createDefaultSnippets`, DataTable, Chart,
 * Tabs, Window, List, Select, Btn) passe AVANT : `attachSnippets` ajoute ceux-ci
 * à la suite, et le premier snippet d'un composant est son défaut.
 */

/** Ids de gabarit — `instantiateSnippet` réidentifie chaque instance au chargement. */
export const PLAYGROUND_SNIPPET_ID = 'marketing-preview'

/**
 * Image d'exemple EMBARQUÉE (data URI SVG) — aucune requête réseau, l'aperçu
 * reste identique hors-ligne et ne dépend d'aucun tiers.
 */
export const PLAYGROUND_SAMPLE_IMAGE =
    'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(
        '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 160 90">'
        + '<defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1">'
        + '<stop offset="0%" stop-color="#7c3aed"/><stop offset="100%" stop-color="#2563eb"/>'
        + '</linearGradient></defs>'
        + '<rect width="160" height="90" fill="url(#g)"/>'
        + '<text x="80" y="52" font-family="system-ui,sans-serif" font-size="18"'
        + ' fill="#ffffff" text-anchor="middle">origam</text></svg>'
    )

/**
 * Vidéo d'exemple SERVIE par le site : `packages/marketing/public/origam-sample.mp4`
 * (2,5 Ko, H.264, 160x90, 2 s, sans piste audio).
 *
 * SOURCE ET LICENCE (#1286) : clip SYNTHÉTIQUE généré localement avec ffmpeg
 * (source lavfi `gradients`, violet vers bleu, aucune image ni son de tiers) ;
 * aucun contenu tiers, donc aucun droit à clarifier. Versé au domaine public
 * (CC0 1.0). Commande : `ffmpeg -f lavfi -i "gradients=s=160x90:d=2:r=12:speed=0.05:c0=7c3aed:c1=2563eb:nb_colors=2"
 * -an -c:v libx264 -pix_fmt yuv420p -crf 35 -movflags +faststart -map_metadata -1 origam-sample.mp4`.
 * Aucun hotlink : même hors-ligne l'aperçu reste identique.
 */
export const PLAYGROUND_SAMPLE_VIDEO = '/origam-sample.mp4'

/**
 * `overlayAttach` — sélecteur du conteneur où les overlays (`dialog`, `menu`,
 * `tooltip`, `snackbar`, …) se rendent EN PLACE via `IOverlayProps.attach`
 * plutôt que d'être téléportés hors de l'aperçu. Ce conteneur doit être une
 * containing block (`contain: layout`) pour le `position: fixed` que porte la
 * racine de `<OrigamOverlay>` — voir `pages/components/[slug].vue`.
 */
export function createMarketingSnippets (t: TTranslate, overlayAttach: string): Record<string, IComponentSnippet[]> {
    let counter = 0

    const node = (componentName: string, props: IPlaygroundInstance['props'] = {}, slotContent?: string, children?: IPlaygroundInstance[], slot = 'default'): IPlaygroundInstance => {
        counter += 1
        const instance: IPlaygroundInstance = { id: `n${counter}`, componentName, props }
        if (slotContent) instance.slotContent = slotContent
        if (children?.length) instance.children = { [slot]: children }
        return instance
    }

    const snippet = (...instances: IPlaygroundInstance[]): IComponentSnippet[] => [{
        id: PLAYGROUND_SNIPPET_ID,
        label: t('components.playground.snippet.preview_label', 'Preview'),
        instances
    }]

    const card = (text: string, props: IPlaygroundInstance['props'] = {}) => node('OrigamCard', props, text)

    const chartSeries = [
        { name: t('components.playground.snippet.chart.series_revenue', 'Revenue'), data: [12, 19, 14, 23, 28, 24] },
        { name: t('components.playground.snippet.chart.series_costs', 'Costs'), data: [8, 11, 9, 13, 15, 12] }
    ]
    const chartCategories = [
        t('components.playground.snippet.chart.month_jan', 'Jan'),
        t('components.playground.snippet.chart.month_feb', 'Feb'),
        t('components.playground.snippet.chart.month_mar', 'Mar'),
        t('components.playground.snippet.chart.month_apr', 'Apr'),
        t('components.playground.snippet.chart.month_may', 'May'),
        t('components.playground.snippet.chart.month_jun', 'Jun')
    ]
    const chart = (name: string) => snippet(node(name, { series: chartSeries, categories: chartCategories, width: 420, height: 240 }))
    const chartSingle = (name: string) => snippet(node(name, {
        series: [{ name: t('components.playground.snippet.chart.series_progress', 'Progress'), data: [64] }],
        categories: [t('components.playground.snippet.chart.series_progress', 'Progress')],
        width: 320,
        height: 240
    }))
    /* Le Bullet lit UN `IChartBulletDatum` par série (`ser.data[0]`), pas un nombre : avec `[64]`
       il ne trouvait ni `ranges` ni `target` et rendait 0x0 sans erreur (#1286). */
    const chartBullet = () => snippet(node('OrigamChartBullet', {
        series: [{ name: t('components.playground.snippet.chart.series_progress', 'Progress'), data: [{ value: 64, target: 80, ranges: [{ to: 50 }, { to: 80 }, { to: 100 }] }] }],
        categories: [t('components.playground.snippet.chart.series_progress', 'Progress')],
        width: 320,
        height: 120
    }))

    const one = t('components.playground.snippet.common.one', 'One')
    const two = t('components.playground.snippet.common.two', 'Two')
    const three = t('components.playground.snippet.common.three', 'Three')
    const left = t('components.playground.snippet.common.left', 'Left')
    const right = t('components.playground.snippet.common.right', 'Right')
    const translated = t('components.playground.snippet.transition.translated', 'Translated content')
    const sliding = t('components.playground.snippet.transition.sliding', 'Sliding content')
    const expanding = t('components.playground.snippet.transition.expanding', 'Expanding content')
    const transition = (name: string, text: string) => snippet(node(name, {}, undefined, [card(text)]))

    const person = {
        name: t('components.playground.snippet.data_table.person_ada', 'Ada Lovelace'),
        role: t('components.playground.snippet.data_table.role_owner', 'Owner'),
        seats: 4
    }
    const dataTableHeaders = [
        { key: 'name', title: t('components.playground.snippet.data_table.header_name', 'Name') },
        { key: 'role', title: t('components.playground.snippet.data_table.header_role', 'Role') },
        { key: 'seats', title: t('components.playground.snippet.data_table.header_seats', 'Seats'), align: 'end' }
    ]

    return {
        /* ── Hérités du Theme Builder ───────────────────────────────────── */
        OrigamBtn: snippet(node('OrigamBtn', {}, t('components.playground.snippet.btn.text', 'Button'))),
        OrigamCard: snippet(node('OrigamCard', { width: 240 }, t('components.playground.snippet.card.text', 'Card content'))),
        OrigamChip: snippet(node('OrigamChip', {}, t('components.playground.snippet.chip.text', 'Chip'))),
        OrigamAvatar: snippet(node('OrigamAvatar', { icon: 'mdi-account', size: 'large' })),
        OrigamAlert: snippet(node('OrigamAlert', { status: 'info' }, t('components.playground.snippet.alert.text', 'A short alert message.'))),
        OrigamTextField: snippet(node('OrigamTextField', { label: t('components.playground.snippet.text_field.label', 'Label'), modelValue: t('components.playground.snippet.text_field.value', 'Value'), width: 240 })),
        OrigamTextareaField: snippet(node('OrigamTextareaField', { label: t('components.playground.snippet.textarea_field.label', 'Message'), modelValue: t('components.playground.snippet.textarea_field.value', 'A few lines of text.'), width: 240, rows: 3 })),
        OrigamNumberField: snippet(node('OrigamNumberField', { label: t('components.playground.snippet.number_field.label', 'Amount'), modelValue: 42, width: 240 })),
        OrigamPasswordField: snippet(node('OrigamPasswordField', { label: t('components.playground.snippet.password_field.label', 'Password'), modelValue: 'secret', width: 240 })),
        OrigamSelect: snippet(node('OrigamSelect', { label: t('components.playground.snippet.select.label', 'Pick one'), items: [one, two, three], width: 240 })),
        OrigamCheckbox: snippet(node('OrigamCheckbox', { label: t('components.playground.snippet.checkbox.label', 'Checkbox'), modelValue: true })),
        OrigamSwitch: snippet(node('OrigamSwitch', { label: t('components.playground.snippet.switch.label', 'Switch'), modelValue: true })),
        OrigamRadio: snippet(node('OrigamRadio', { label: t('components.playground.snippet.radio.label', 'Radio'), modelValue: true })),
        OrigamRatingField: snippet(node('OrigamRatingField', { modelValue: 3 })),
        OrigamSliderField: snippet(node('OrigamSliderField', { modelValue: 50, width: 240 })),
        OrigamTitle: snippet(node('OrigamTitle', {}, t('components.playground.snippet.title.text', 'The quick brown fox'))),
        OrigamIcon: snippet(node('OrigamIcon', { icon: 'mdi-star', size: 'x-large' })),
        OrigamBadge: snippet(node('OrigamBadge', { content: '4', inline: true }, t('components.playground.snippet.badge.text', 'Inbox'))),
        /* `width` n'est PAS une prop : c'est l'attribut HTML de `<hr>`, que le
           navigateur honore. Sans lui, dans une grille centrée (le canevas du
           Theme Builder), le trait se réduit à 0 px — mesuré ; `length` n'est
           qu'un `max-width`. */
        OrigamDivider: snippet(node('OrigamDivider', { length: 240, width: 240 })),
        OrigamProgressLinear: snippet(node('OrigamProgressLinear', { modelValue: 64, thickness: 8 })),
        OrigamBlockquote: snippet(node('OrigamBlockquote', {}, t('components.playground.snippet.blockquote.text', 'Design is not just what it looks like. Design is how it works.'))),
        OrigamBreadcrumb: snippet(node('OrigamBreadcrumb', {
            items: [
                { title: t('components.playground.snippet.breadcrumb.home', 'Home'), href: '#' },
                { title: t('components.playground.snippet.breadcrumb.library', 'Library'), href: '#' },
                { title: t('components.playground.snippet.breadcrumb.data', 'Data') }
            ]
        })),
        OrigamPagination: snippet(node('OrigamPagination', { length: 5, modelValue: 2 })),

        /* ── Conteneurs : rendaient 0 × 0 faute d'enfants (#728) ────────── */
        OrigamAvatarGroup: snippet(node('OrigamAvatarGroup', { items: [{ icon: 'mdi-account' }, { icon: 'mdi-account-tie' }, { icon: 'mdi-account-hard-hat' }] })),
        OrigamBtnGroup: snippet(node('OrigamBtnGroup', {}, undefined, [
            node('OrigamBtn', {}, left),
            node('OrigamBtn', {}, t('components.playground.snippet.common.middle', 'Middle')),
            node('OrigamBtn', {}, right)
        ])),
        OrigamBtnToggle: snippet(node('OrigamBtnToggle', {}, undefined, [
            node('OrigamBtn', { value: 'left' }, left),
            node('OrigamBtn', { value: 'center' }, t('components.playground.snippet.common.center', 'Center')),
            node('OrigamBtn', { value: 'right' }, right)
        ])),
        OrigamChipGroup: snippet(node('OrigamChipGroup', {}, undefined, [
            node('OrigamChip', {}, t('components.playground.snippet.chip_group.design', 'Design')),
            node('OrigamChip', {}, t('components.playground.snippet.chip_group.code', 'Code')),
            node('OrigamChip', {}, t('components.playground.snippet.chip_group.ship', 'Ship'))
        ])),
        OrigamItemGroup: snippet(node('OrigamItemGroup', {}, undefined, [
            node('OrigamBtn', { value: 'one' }, one),
            node('OrigamBtn', { value: 'two' }, two)
        ])),
        OrigamSelectionControlGroup: snippet(node('OrigamSelectionControlGroup', {}, undefined, [
            node('OrigamCheckbox', { label: t('components.playground.snippet.selection_control_group.email', 'Email'), value: 'email' }),
            node('OrigamCheckbox', { label: t('components.playground.snippet.selection_control_group.sms', 'SMS'), value: 'sms' })
        ])),
        OrigamExpansionPanels: snippet(node('OrigamExpansionPanels', { modelValue: 0 }, undefined, [
            node('OrigamExpansionPanel', { title: t('components.playground.snippet.expansion_panels.first_title', 'First panel') }, t('components.playground.snippet.expansion_panels.first_text', 'The content of the first panel.')),
            node('OrigamExpansionPanel', { title: t('components.playground.snippet.expansion_panels.second_title', 'Second panel') }, t('components.playground.snippet.expansion_panels.second_text', 'The content of the second panel.'))
        ])),
        OrigamForm: snippet(node('OrigamForm', {}, undefined, [
            node('OrigamTextField', { label: t('components.playground.snippet.form.email', 'Email'), modelValue: 'ada@example.com' }),
            node('OrigamBtn', { color: 'primary' }, t('components.playground.snippet.form.submit', 'Submit'))
        ])),
        OrigamGrid: snippet(node('OrigamGrid', { columns: 3, gap: '0.5rem', width: 300 }, undefined, [
            node('OrigamGridItem', {}, one),
            node('OrigamGridItem', {}, two),
            node('OrigamGridItem', {}, three)
        ])),
        OrigamMasonry: snippet(node('OrigamMasonry', { columns: 3, gap: '0.5rem', width: 320 }, undefined, [
            card(one, { height: 80 }),
            card(two, { height: 56 }),
            card(three, { height: 96 })
        ])),
        OrigamList: snippet(node('OrigamList', { width: 260 }, undefined, [
            node('OrigamListItem', { title: t('components.playground.snippet.list.inbox', 'Inbox'), prependIcon: 'mdi-inbox' }),
            node('OrigamListItem', { title: t('components.playground.snippet.list.starred', 'Starred'), prependIcon: 'mdi-star' }),
            node('OrigamListItem', { title: t('components.playground.snippet.list.archive', 'Archive'), prependIcon: 'mdi-archive' })
        ])),
        OrigamListGroup: snippet(node('OrigamListGroup', { title: t('components.playground.snippet.list_group.title', 'Reports') }, undefined, [
            node('OrigamListItem', { title: t('components.playground.snippet.list_group.weekly', 'Weekly') }),
            node('OrigamListItem', { title: t('components.playground.snippet.list_group.monthly', 'Monthly') })
        ])),
        OrigamTabPanels: snippet(node('OrigamTabPanels', { modelValue: 'one' }, undefined, [
            node('OrigamTabPanel', { value: 'one' }, t('components.playground.snippet.tab_panels.panel_one', 'Panel one'))
        ])),
        OrigamResponsive: snippet(node('OrigamResponsive', { aspectRatio: '16/9', width: 240 }, undefined, [card(t('components.playground.snippet.responsive.text', 'Responsive box'))])),
        /* `modelValue` est ce que l'intersection écrit : sans lui rien ne
           s'amorce (mesuré : `aria-busy`, contenu absent). */
        OrigamLazy: snippet(node('OrigamLazy', { modelValue: true, width: 240 }, undefined, [card(t('components.playground.snippet.lazy.text', 'Lazily mounted content'))])),
        /* Chaque ligne passe par le slot SCOPÉ `item`, qu'une scène ne sait pas
           écrire : le cadre et ses lignes se rendent, leur contenu reste vide. */
        OrigamVirtualScroll: snippet(node('OrigamVirtualScroll', { items: [one, two, three], height: 120, itemHeight: 40 })),
        OrigamWatermark: snippet(node('OrigamWatermark', { text: 'origam' }, undefined, [card(t('components.playground.snippet.watermark.text', 'Protected content'))])),
        OrigamThemeProvider: snippet(node('OrigamThemeProvider', {}, undefined, [node('OrigamBtn', { color: 'primary' }, t('components.playground.snippet.theme_provider.text', 'Themed button'))])),
        OrigamDefaultsProvider: snippet(node('OrigamDefaultsProvider', {}, undefined, [node('OrigamBtn', { color: 'primary' }, t('components.playground.snippet.defaults_provider.text', 'Button with defaults'))])),
        OrigamColorPickerSwatches: snippet(node('OrigamColorPickerSwatches', { swatches: [['#7c3aed', '#2563eb', '#059669'], ['#d97706', '#dc2626', '#0a0a0a']], width: 200 })),
        OrigamCounter: snippet(node('OrigamCounter', { value: 24, max: 100, active: true })),
        OrigamClassIcon: snippet(node('OrigamClassIcon', { icon: 'mdi-star', size: 'x-large' })),
        OrigamLigatureIcon: snippet(node('OrigamLigatureIcon', { icon: 'star', size: 'x-large' })),
        OrigamBreadcrumbDivider: snippet(node('OrigamBreadcrumbDivider', { divider: '/' })),
        OrigamClipboard: snippet(node('OrigamClipboard', { value: 'npm install origam' }, t('components.playground.snippet.clipboard.text', 'Copy the install command'))),
        OrigamImg: snippet(node('OrigamImg', { src: PLAYGROUND_SAMPLE_IMAGE, width: 240, aspectRatio: '16/9', alt: t('components.playground.snippet.img.alt', 'Sample image') })),
        OrigamAudioWaveform: snippet(node('OrigamAudioWaveform', { peaks: [0.2, 0.55, 0.35, 0.8, 0.45, 0.95, 0.3, 0.7, 0.4, 0.85, 0.25, 0.6, 0.5, 0.9, 0.35], progress: 40 })),
        OrigamQrCode: snippet(node('OrigamQrCode', { value: 'https://origam.dev', size: 140 })),
        OrigamNumberFormat: snippet(node('OrigamNumberFormat', { value: 1234567.89 })),
        OrigamDataText: snippet(node('OrigamDataText', { text: t('components.playground.snippet.data_text.text', 'A short data value') })),
        OrigamDataTitle: snippet(node('OrigamDataTitle', { text: t('components.playground.snippet.data_title.text', 'A data title') })),
        /* ⛔ `IDataItem.title` / `.text` sont des OBJETS DE PROPS
           (`IDataTitleProps` / `IDataTextProps`), pas des chaînes : avec des
           chaînes, `OrigamDataList` rendait `<dt 0="P" 1="l" …>`. */
        OrigamDataList: snippet(node('OrigamDataList', {
            items: [
                { title: { text: t('components.playground.snippet.data_list.plan', 'Plan') }, text: [{ text: t('components.playground.snippet.data_list.pro', 'Pro') }] },
                { title: { text: t('components.playground.snippet.data_list.seats', 'Seats') }, text: [{ text: '12' }] }
            ]
        })),
        OrigamKbd: snippet(node('OrigamKbd', {}, 'Ctrl')),
        OrigamInlineEdit: snippet(node('OrigamInlineEdit', { modelValue: t('components.playground.snippet.inline_edit.value', 'Click to edit') })),
        OrigamRatingFieldItem: snippet(node('OrigamRatingFieldItem', { value: 3 })),
        OrigamTextMask: snippet(node('OrigamTextMask', { background: 'linear-gradient(90deg, #7c3aed, #2563eb)' }, t('components.playground.snippet.text_mask.text', 'Gradient text'))),
        OrigamTreeview: snippet(node('OrigamTreeview', {
            items: [
                { id: 'src', title: 'src', children: [{ id: 'components', title: 'components' }, { id: 'composables', title: 'composables' }] },
                { id: 'readme', title: 'README.md' }
            ]
        })),
        OrigamTreeviewNode: snippet(node('OrigamTreeviewNode', { node: { id: 'readme', title: 'README.md' } })),
        OrigamChartLegend: snippet(node('OrigamChartLegend', {
            items: chartSeries.map((series, index) => ({ series, index, color: index === 0 ? '#7c3aed' : '#dc2626', visible: true }))
        })),
        OrigamDataTable: snippet(node('OrigamDataTable', {
            width: 420,
            headers: dataTableHeaders,
            items: [
                person,
                { name: t('components.playground.snippet.data_table.person_alan', 'Alan Turing'), role: t('components.playground.snippet.data_table.role_admin', 'Admin'), seats: 2 },
                { name: t('components.playground.snippet.data_table.person_grace', 'Grace Hopper'), role: t('components.playground.snippet.data_table.role_member', 'Member'), seats: 1 }
            ],
            itemsPerPage: 5
        })),
        OrigamBracket: snippet(node('OrigamBracket', {
            width: 420,
            rounds: [
                {
                    id: 'semis',
                    title: t('components.playground.snippet.bracket.semis', 'Semi-finals'),
                    matches: [
                        { id: 'm1', competitorA: { id: 'a', name: 'Alpha', seed: 1 }, competitorB: { id: 'b', name: 'Bravo', seed: 4 }, scoreA: 2, scoreB: 1, winnerId: 'a', nextMatchId: 'm3' },
                        { id: 'm2', competitorA: { id: 'c', name: 'Charlie', seed: 2 }, competitorB: { id: 'd', name: 'Delta', seed: 3 }, scoreA: 0, scoreB: 2, winnerId: 'd', nextMatchId: 'm3' }
                    ]
                },
                {
                    id: 'final',
                    title: t('components.playground.snippet.bracket.final', 'Final'),
                    matches: [
                        { id: 'm3', competitorA: { id: 'a', name: 'Alpha', seed: 1 }, competitorB: { id: 'd', name: 'Delta', seed: 3 }, scoreA: 3, scoreB: 2, winnerId: 'a' }
                    ]
                }
            ]
        })),
        OrigamChartRangeSelector: snippet(node('OrigamChartRangeSelector', {
            buttons: [
                { label: t('components.playground.snippet.chart_range_selector.one_month', '1M'), count: 1, unit: 'month' },
                { label: t('components.playground.snippet.chart_range_selector.six_months', '6M'), count: 6, unit: 'month' },
                { label: t('components.playground.snippet.chart_range_selector.one_year', '1Y'), count: 1, unit: 'year' }
            ]
        })),

        /* ── Famille Chart : `series` est OBLIGATOIRE, sans elle ça LÈVE ── */
        OrigamChart: chart('OrigamChart'),
        OrigamChartCartesian: chart('OrigamChartCartesian'),
        OrigamChartPolar: chart('OrigamChartPolar'),
        OrigamChartPolarBar: chart('OrigamChartPolarBar'),
        OrigamChartRadar: chart('OrigamChartRadar'),
        OrigamChartSparkline: chart('OrigamChartSparkline'),
        OrigamChartStreamgraph: chart('OrigamChartStreamgraph'),
        OrigamChartPareto: chart('OrigamChartPareto'),
        OrigamChartTreemap: chart('OrigamChartTreemap'),
        /* Hiérarchique : lit `series` seul, sans `categories`. */
        OrigamChartSunburst: snippet(node('OrigamChartSunburst', { series: chartSeries, width: 420, height: 240 })),
        OrigamChartWordCloud: chart('OrigamChartWordCloud'),
        OrigamChartVariwide: chart('OrigamChartVariwide'),
        OrigamChartPyramid: chart('OrigamChartPyramid'),
        OrigamChartSankey: chart('OrigamChartSankey'),
        OrigamChartHeatmap: chart('OrigamChartHeatmap'),
        OrigamChartPictorial: chart('OrigamChartPictorial'),
        OrigamChartGauge: chartSingle('OrigamChartGauge'),
        OrigamChartBullet: chartBullet(),

        /* ── Fixtures de démo (#1286) : le contexte que le composant exige ── */
        OrigamVideo: snippet(node('OrigamVideo', { src: PLAYGROUND_SAMPLE_VIDEO, width: 320 })),
        /* `state` / `methods` sont ceux de `useMediaPlayer()` : ici un état figé et des méthodes sans effet. */
        OrigamMediaController: snippet(node('OrigamMediaController', {
            state: {
                playing: ref(false), paused: ref(true), currentTime: ref(0.5), duration: ref(2), buffered: ref(2),
                volume: ref(1), muted: ref(false), ready: ref(true), loading: ref(false), error: ref(null),
                playbackRate: ref(1), remoteAvailable: ref(false), remoteState: ref('disconnected')
            },
            methods: {
                play: async () => {}, pause: () => {}, toggle: async () => {}, seek: () => {}, setVolume: () => {},
                toggleMute: () => {}, load: () => {}, skipBackward: () => {}, skipForward: () => {}, setPlaybackRate: () => {},
                requestRemotePlayback: async () => {}, stopRemotePlayback: async () => {}
            }
        })),
        /* Un conteneur qui défile : la sentinelle est au bout du contenu. */
        OrigamInfiniteScrollIntersect: snippet(node('OrigamSheet', { width: 240, height: 96, style: { overflow: 'auto' } }, undefined, [
            node('OrigamCard', {}, one),
            node('OrigamCard', {}, two),
            node('OrigamCard', {}, three),
            node('OrigamInfiniteScrollIntersect', {})
        ])),
        /* Deux voisins dans un flex : le Spacer prend tout l'espace libre entre eux. */
        OrigamSpacer: snippet(node('OrigamToolbar', { width: 320 }, undefined, [
            node('OrigamChip', {}, left),
            node('OrigamSpacer', {}),
            node('OrigamChip', {}, right)
        ])),

        /* ── Ex-`parentEnvelope` : le parent est la racine, le composant
           documenté son enfant (#728 temps 2). `item` est un
           `IDataTableItem` déjà NORMALISÉ, pas l'objet brut. */
        OrigamDataTableRow: snippet(node('OrigamDataTable', { headers: dataTableHeaders, items: [person] }, undefined, [
            node('OrigamDataTableRow', {
                item: { key: 'ada-lovelace', index: 0, value: 'ada-lovelace', type: 'item', selectable: true, raw: person, columns: person }
            })
        ], 'body')),
        OrigamTab: snippet(node('OrigamTabs', { modelValue: 'one' }, undefined, [
            node('OrigamTab', { value: 'one' }, t('components.playground.snippet.tab.text', 'Tab one'))
        ])),
        /* Sous-parties qui exigent leur parent (`useGroupItem` / `inject`) :
           le parent est la racine, la sous-partie son enfant. */
        OrigamCarouselItem: snippet(node('OrigamCarousel', { modelValue: 1, height: 200 }, undefined, [
            node('OrigamCarouselItem', { value: 1 }, t('components.playground.snippet.carousel.slide_one', 'Slide one')),
            node('OrigamCarouselItem', { value: 2 }, t('components.playground.snippet.carousel.slide_two', 'Slide two'))
        ])),
        OrigamItemGroupItem: snippet(node('OrigamItemGroup', {}, undefined, [
            node('OrigamItemGroupItem', { value: 'one' }, one),
            node('OrigamItemGroupItem', { value: 'two' }, two)
        ])),
        OrigamParallaxLayer: snippet(node('OrigamParallax', { height: 200 }, undefined, [
            node('OrigamParallaxLayer', { speed: 0.2 }, undefined, [card(t('components.playground.snippet.parallax.layer', 'Parallax layer'))])
        ])),
        OrigamParallaxElement: snippet(node('OrigamParallax', { height: 200 }, undefined, [
            node('OrigamParallaxElement', {}, undefined, [card(t('components.playground.snippet.parallax.element', 'Parallax element'))])
        ])),
        /* `ITextareaFieldRichToolbarProps` est de la donnée PURE (enum +
           booléens), jamais un élément DOM ni un contrôleur. */
        OrigamTextareaFieldRichToolbar: snippet(node('OrigamTextareaFieldRichToolbar', {
            items: ['bold', 'italic', 'underline', 'link', 'list-bullet', 'list-ordered', 'heading', 'code-inline', 'clear-format'],
            active: { bold: true, italic: false, underline: false, code: false, link: false, listBullet: false, listOrdered: false, heading: 0 }
        })),

        /* ── Overlays : rendues EN PLACE via `attach` (#945) ─────────────── */
        OrigamDialog: snippet(node('OrigamDialog', { modelValue: true, attach: overlayAttach, title: t('components.playground.snippet.dialog.title', 'Example dialog') })),
        /* Le corps d'un dialogue de confirmation est un SLOT NOMMÉ ; un
           `slotContent` remplacerait tout le chrome de la carte. */
        OrigamDialogConfirmation: snippet(node('OrigamDialogConfirmation', { modelValue: true, attach: overlayAttach, title: t('components.playground.snippet.dialog_confirmation.title', 'Delete item?') })),
        OrigamMenu: snippet(node('OrigamMenu', { modelValue: true, attach: overlayAttach, items: [one, two, three] })),
        OrigamTooltip: snippet(node('OrigamTooltip', { modelValue: true, attach: overlayAttach, text: t('components.playground.snippet.tooltip.text', 'Tooltip content') })),
        OrigamOverlay: snippet(node('OrigamOverlay', { modelValue: true, attach: overlayAttach }, t('components.playground.snippet.overlay.text', 'Overlay content'))),
        /* Ne téléporte jamais : un simple `v-if="active"`. */
        OrigamOverlayScrim: snippet(node('OrigamOverlayScrim', { active: true })),
        OrigamSnackbar: snippet(node('OrigamSnackbar', { modelValue: true, attach: overlayAttach, text: t('components.playground.snippet.snackbar.text', 'Saved successfully.') })),

        /* ── Transitions : un wrapper ne rend que son enfant ────────────── */
        OrigamSnack: transition('OrigamSnack', t('components.playground.snippet.transition.snack', 'Snack content')),
        OrigamTransition: transition('OrigamTransition', t('components.playground.snippet.transition.transitioned', 'Transitioned content')),
        OrigamFade: transition('OrigamFade', t('components.playground.snippet.transition.fading', 'Fading content')),
        OrigamExpandX: transition('OrigamExpandX', expanding),
        OrigamExpandY: transition('OrigamExpandY', expanding),
        OrigamScaleRotate: transition('OrigamScaleRotate', t('components.playground.snippet.transition.rotating', 'Rotating content')),
        OrigamSlideX: transition('OrigamSlideX', sliding),
        OrigamSlideY: transition('OrigamSlideY', sliding),
        OrigamTranslateBottom: transition('OrigamTranslateBottom', translated),
        OrigamTranslatePicker: transition('OrigamTranslatePicker', translated),
        OrigamTranslateScale: transition('OrigamTranslateScale', translated),
        OrigamReverseTranslatePicker: transition('OrigamReverseTranslatePicker', translated),
        OrigamWindowXTranslate: transition('OrigamWindowXTranslate', translated),
        OrigamWindowXReverseTranslate: transition('OrigamWindowXReverseTranslate', translated),
        OrigamWindowYTranslate: transition('OrigamWindowYTranslate', translated),
        OrigamWindowYReverseTranslate: transition('OrigamWindowYReverseTranslate', translated),
        OrigamClientOnly: transition('OrigamClientOnly', t('components.playground.snippet.transition.client_only', 'Client-only content'))
    }
}
