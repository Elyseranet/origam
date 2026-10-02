import type { IComponentPreviewAdapter } from '~/interfaces/component-preview.interface'

/**
 * component-preview.const.ts — adaptateurs d'aperçu live, par slug.
 *
 * ORIGINE : ce fichier généralise `THEME_BUILDER_PREVIEW_ADAPTERS`
 * (theme-builder.const.ts), qui ne couvrait que les 24 slugs du Theme Builder.
 * Les fiches composants (`/components/{slug}`) ont exactement le même besoin —
 * rendre un composant isolé, visiblement — donc une seule table les sert tous.
 * `THEME_BUILDER_PREVIEW_ADAPTERS` est désormais un alias de cette table.
 *
 * TROIS CAS, mesurés dans un vrai navigateur (#728) :
 *
 *  1. le composant se rend seul            → aucune entrée nécessaire ;
 *  2. il rend une boîte VIDE (0 × 0) faute d'enfants ou de données
 *                                          → `slotChildren` / `previewProps` ;
 *  3. il ne PEUT PAS se rendre isolément (sous-partie qui exige l'injection
 *     d'un parent, overlay téléporté hors de l'aperçu, prop obligatoire qui
 *     est une méthode ou un HTMLElement)
 *                                          → `unavailableReason*`, jamais un
 *                                            repli muet.
 *
 * ⛔ Les props utilisées ici sont vérifiées contre les INTERFACES du DS
 * (`packages/ds/src/interfaces/**`), jamais inventées. Ne PAS se fier à
 * `doc_prop` seul pour cet audit : la table est incomplète (elle ignore par
 * exemple `value` sur `btn`, pourtant fourni par `IGroupItemProps`), et un
 * contrôle qui s'y fie produit des faux positifs.
 */

/**
 * Image d'exemple EMBARQUÉE (data URI SVG) — aucune requête réseau, donc
 * l'aperçu reste identique hors-ligne et ne dépend d'aucun tiers.
 */
export const COMPONENT_PREVIEW_SAMPLE_IMAGE =
    'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(
        '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 160 90">'
        + '<defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1">'
        + '<stop offset="0%" stop-color="#7c3aed"/><stop offset="100%" stop-color="#2563eb"/>'
        + '</linearGradient></defs>'
        + '<rect width="160" height="90" fill="url(#g)"/>'
        + '<text x="80" y="52" font-family="system-ui,sans-serif" font-size="18"'
        + ' fill="#ffffff" text-anchor="middle">origam</text></svg>'
    )

/** Série numérique générique réutilisée par toute la famille Chart. */
const CHART_DEMO_SERIES = [
    { name: 'Revenue', data: [12, 19, 14, 23, 28, 24] },
    { name: 'Costs', data: [8, 11, 9, 13, 15, 12] }
]

const CHART_DEMO_CATEGORIES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun']

/** Adaptateur commun aux graphiques cartésiens / polaires démontrables. */
const CHART_DEMO: IComponentPreviewAdapter = {
    previewProps: {
        series: CHART_DEMO_SERIES,
        categories: CHART_DEMO_CATEGORIES,
        width: 420,
        height: 240
    }
}

/** Série mono-valeur, pour les graphes qui n'en lisent qu'une (gauge, pyramid). */
const CHART_SINGLE_DEMO: IComponentPreviewAdapter = {
    previewProps: {
        series: [{ name: 'Progress', data: [64] }],
        categories: ['Progress'],
        width: 320,
        height: 240
    }
}

/**
 * Raison affichée pour une sous-partie qui n'existe que dans son parent.
 * Les clés vivent dans `components.detail.preview.reason.*`.
 */
const REASON_NEEDS_PARENT: IComponentPreviewAdapter = {
    unavailableReasonKey: 'components.detail.preview.reason.needs_parent',
    unavailableReasonFallback:
        'This is an internal sub-part: it is injected by its parent component and cannot render on its own. See the parent component page for a live example.'
}

/** Raison affichée pour un overlay téléporté hors du conteneur d'aperçu. */
const REASON_PORTAL: IComponentPreviewAdapter = {
    unavailableReasonKey: 'components.detail.preview.reason.portal',
    unavailableReasonFallback:
        'This component teleports its surface to the end of <body> once activated, so it never renders inside this preview box. Use the props panel and the generated snippet, then try it in your own page.'
}

/** Raison affichée quand la prop obligatoire est une donnée runtime non simulable. */
const REASON_RUNTIME_DATA: IComponentPreviewAdapter = {
    unavailableReasonKey: 'components.detail.preview.reason.runtime_data',
    unavailableReasonFallback:
        'This component requires runtime data its parent owns (a DOM element, a controller object, or a File), which a static preview cannot provide.'
}

/** Raison affichée pour un composant qui exige une source média externe. */
const REASON_MEDIA_SOURCE: IComponentPreviewAdapter = {
    unavailableReasonKey: 'components.detail.preview.reason.media_source',
    unavailableReasonFallback:
        'This component requires a media source (audio or video URL). The marketing site ships no sample media, so the preview stays empty on purpose.'
}

export const COMPONENT_PREVIEW_ADAPTERS: Record<string, IComponentPreviewAdapter> = {
    /* ── Hérités du Theme Builder (inchangés) ───────────────────────────── */
    btn: { slotText: 'Button' },
    card: { slotText: 'Card content', previewProps: { width: 240 } },
    chip: { slotText: 'Chip' },
    avatar: { previewProps: { icon: 'mdi-account', size: 'large' } },
    alert: { slotText: 'A short alert message.', previewProps: { type: 'info' } },
    'text-field': { previewProps: { label: 'Label', modelValue: 'Value', width: 240 } },
    'textarea-field': { previewProps: { label: 'Message', modelValue: 'A few lines of text.', width: 240, rows: 3 } },
    'number-field': { previewProps: { label: 'Amount', modelValue: 42, width: 240 } },
    'password-field': { previewProps: { label: 'Password', modelValue: 'secret', width: 240 } },
    select: { previewProps: { label: 'Pick one', items: ['One', 'Two', 'Three'], width: 240 } },
    checkbox: { previewProps: { label: 'Checkbox', modelValue: true } },
    switch: { previewProps: { label: 'Switch', modelValue: true } },
    radio: { previewProps: { label: 'Radio', modelValue: true } },
    'rating-field': { previewProps: { modelValue: 3 } },
    'slider-field': { previewProps: { modelValue: 50, width: 240 } },
    title: { slotText: 'The quick brown fox' },
    icon: { previewProps: { icon: 'mdi-star', size: 'x-large' } },
    badge: { slotText: 'Inbox', previewProps: { content: '4', inline: true } },
    divider: { previewProps: { width: 240 } },
    'progress-linear': { previewProps: { modelValue: 64, height: 8 } },
    blockquote: { slotText: 'Design is not just what it looks like. Design is how it works.' },
    breadcrumb: { previewProps: { items: [{ title: 'Home', href: '#' }, { title: 'Library', href: '#' }, { title: 'Data' }] } },
    pagination: { previewProps: { length: 5, modelValue: 2 } },

    /* ── Conteneurs : rendaient 0 × 0 faute d'enfants (#728) ────────────── */
    'avatar-group': {
        previewProps: {
            items: [
                { icon: 'mdi-account' },
                { icon: 'mdi-account-tie' },
                { icon: 'mdi-account-hard-hat' }
            ]
        }
    },
    'btn-group': {
        slotChildren: [
            { tag: 'origam-btn', text: 'Left' },
            { tag: 'origam-btn', text: 'Middle' },
            { tag: 'origam-btn', text: 'Right' }
        ]
    },
    'btn-toggle': {
        slotChildren: [
            { tag: 'origam-btn', props: { value: 'left' }, text: 'Left' },
            { tag: 'origam-btn', props: { value: 'center' }, text: 'Center' },
            { tag: 'origam-btn', props: { value: 'right' }, text: 'Right' }
        ]
    },
    'chip-group': {
        slotChildren: [
            { tag: 'origam-chip', text: 'Design' },
            { tag: 'origam-chip', text: 'Code' },
            { tag: 'origam-chip', text: 'Ship' }
        ]
    },
    'item-group': {
        slotChildren: [
            { tag: 'origam-btn', props: { value: 'one' }, text: 'One' },
            { tag: 'origam-btn', props: { value: 'two' }, text: 'Two' }
        ]
    },
    'selection-control-group': {
        slotChildren: [
            { tag: 'origam-checkbox', props: { label: 'Email', value: 'email' } },
            { tag: 'origam-checkbox', props: { label: 'SMS', value: 'sms' } }
        ]
    },
    'expansion-panels': {
        previewProps: { width: 360, modelValue: 0 },
        slotChildren: [
            { tag: 'origam-expansion-panel', props: { title: 'First panel' }, text: 'The content of the first panel.' },
            { tag: 'origam-expansion-panel', props: { title: 'Second panel' }, text: 'The content of the second panel.' }
        ]
    },
    form: {
        previewProps: { width: 280 },
        slotChildren: [
            { tag: 'origam-text-field', props: { label: 'Email', modelValue: 'ada@example.com' } },
            { tag: 'origam-btn', props: { color: 'primary' }, text: 'Submit' }
        ]
    },
    grid: {
        previewProps: { columns: 3, gap: '0.5rem', width: 300 },
        slotChildren: [
            { tag: 'origam-grid-item', text: 'One' },
            { tag: 'origam-grid-item', text: 'Two' },
            { tag: 'origam-grid-item', text: 'Three' }
        ]
    },
    masonry: {
        previewProps: { columns: 3, gap: '0.5rem', width: 320 },
        slotChildren: [
            { tag: 'origam-card', props: { height: 80 }, text: 'One' },
            { tag: 'origam-card', props: { height: 56 }, text: 'Two' },
            { tag: 'origam-card', props: { height: 96 }, text: 'Three' }
        ]
    },
    list: {
        previewProps: { width: 260 },
        slotChildren: [
            { tag: 'origam-list-item', props: { title: 'Inbox', prependIcon: 'mdi-inbox' } },
            { tag: 'origam-list-item', props: { title: 'Starred', prependIcon: 'mdi-star' } },
            { tag: 'origam-list-item', props: { title: 'Archive', prependIcon: 'mdi-archive' } }
        ]
    },
    'list-group': {
        previewProps: { title: 'Reports' },
        slotChildren: [
            { tag: 'origam-list-item', props: { title: 'Weekly' } },
            { tag: 'origam-list-item', props: { title: 'Monthly' } }
        ]
    },
    'tab-panels': {
        previewProps: { modelValue: 'one', width: 320 },
        slotChildren: [
            { tag: 'origam-tab-panel', props: { value: 'one' }, text: 'Panel one' }
        ]
    },
    responsive: {
        previewProps: { aspectRatio: '16/9', width: 240 },
        slotChildren: [{ tag: 'origam-card', text: 'Responsive box' }]
    },
    lazy: {
        previewProps: { width: 240 },
        slotChildren: [{ tag: 'origam-card', text: 'Lazily mounted content' }]
    },
    watermark: {
        previewProps: { text: 'origam', width: 260, height: 140 },
        slotChildren: [{ tag: 'origam-card', text: 'Protected content' }]
    },
    'theme-provider': {
        slotChildren: [{ tag: 'origam-btn', props: { color: 'primary' }, text: 'Themed button' }]
    },
    'defaults-provider': {
        slotChildren: [{ tag: 'origam-btn', props: { color: 'primary' }, text: 'Button with defaults' }]
    },
    'color-picker-swatches': {
        previewProps: {
            swatches: [['#7c3aed', '#2563eb', '#059669'], ['#d97706', '#dc2626', '#0a0a0a']],
            width: 200
        }
    },
    counter: { previewProps: { value: 24, max: 100, active: true } },
    'class-icon': { previewProps: { icon: 'mdi-star', size: 'x-large' } },
    'ligature-icon': { previewProps: { icon: 'star', size: 'x-large' } },
    'breadcrumb-divider': { previewProps: { divider: '/' } },
    clipboard: { previewProps: { value: 'npm install origam' }, slotText: 'Copy the install command' },
    img: {
        previewProps: {
            src: COMPONENT_PREVIEW_SAMPLE_IMAGE,
            width: 240,
            aspectRatio: '16/9',
            alt: 'Sample image'
        }
    },
    'audio-waveform': {
        previewProps: {
            peaks: [0.2, 0.55, 0.35, 0.8, 0.45, 0.95, 0.3, 0.7, 0.4, 0.85, 0.25, 0.6, 0.5, 0.9, 0.35],
            progress: 40
        }
    },
    'qr-code': { previewProps: { value: 'https://origam.dev', size: 140 } },
    'number-format': { previewProps: { value: 1234567.89 } },
    'data-text': { previewProps: { text: 'A short data value' } },
    'data-title': { previewProps: { text: 'A data title' } },
    'data-list': {
        previewProps: {
            items: [
                { title: 'Plan', text: 'Pro' },
                { title: 'Seats', text: '12' }
            ],
            width: 240
        }
    },
    kbd: { slotText: 'Ctrl' },
    'inline-edit': { previewProps: { modelValue: 'Click to edit', width: 220 } },
    'rating-field-item': { previewProps: { value: 3 } },
    'text-mask': {
        previewProps: { background: 'linear-gradient(90deg, #7c3aed, #2563eb)' },
        slotText: 'Gradient text'
    },
    treeview: {
        previewProps: {
            width: 240,
            items: [
                {
                    id: 'src',
                    title: 'src',
                    children: [
                        { id: 'components', title: 'components' },
                        { id: 'composables', title: 'composables' }
                    ]
                },
                { id: 'readme', title: 'README.md' }
            ]
        }
    },
    'treeview-node': {
        previewProps: { node: { id: 'readme', title: 'README.md' } }
    },
    'chart-legend': {
        previewProps: {
            items: CHART_DEMO_SERIES.map((series, index) => ({
                series,
                index,
                color: index === 0 ? '#7c3aed' : '#dc2626',
                visible: true
            }))
        }
    },
    'data-table': {
        previewProps: {
            width: 420,
            headers: [
                { key: 'name', title: 'Name' },
                { key: 'role', title: 'Role' },
                { key: 'seats', title: 'Seats', align: 'end' }
            ],
            items: [
                { name: 'Ada Lovelace', role: 'Owner', seats: 4 },
                { name: 'Alan Turing', role: 'Admin', seats: 2 },
                { name: 'Grace Hopper', role: 'Member', seats: 1 }
            ],
            itemsPerPage: 5
        }
    },
    bracket: {
        previewProps: {
            width: 420,
            rounds: [
                {
                    id: 'semis',
                    title: 'Semi-finals',
                    matches: [
                        {
                            id: 'm1',
                            competitorA: { id: 'a', name: 'Alpha', seed: 1 },
                            competitorB: { id: 'b', name: 'Bravo', seed: 4 },
                            scoreA: 2,
                            scoreB: 1,
                            winnerId: 'a',
                            nextMatchId: 'm3'
                        },
                        {
                            id: 'm2',
                            competitorA: { id: 'c', name: 'Charlie', seed: 2 },
                            competitorB: { id: 'd', name: 'Delta', seed: 3 },
                            scoreA: 0,
                            scoreB: 2,
                            winnerId: 'd',
                            nextMatchId: 'm3'
                        }
                    ]
                },
                {
                    id: 'final',
                    title: 'Final',
                    matches: [
                        {
                            id: 'm3',
                            competitorA: { id: 'a', name: 'Alpha', seed: 1 },
                            competitorB: { id: 'd', name: 'Delta', seed: 3 },
                            scoreA: 3,
                            scoreB: 2,
                            winnerId: 'a'
                        }
                    ]
                }
            ]
        }
    },
    'chart-range-selector': {
        previewProps: {
            buttons: [
                { label: '1M', count: 1, unit: 'month' },
                { label: '6M', count: 6, unit: 'month' },
                { label: '1Y', count: 1, unit: 'year' }
            ]
        }
    },

    /* ── Famille Chart : `series` est OBLIGATOIRE, sans elle ça LÈVE ────── */
    chart: CHART_DEMO,
    'chart-cartesian': CHART_DEMO,
    'chart-polar': CHART_DEMO,
    'chart-polar-bar': CHART_DEMO,
    'chart-radar': CHART_DEMO,
    'chart-sparkline': CHART_DEMO,
    'chart-streamgraph': CHART_DEMO,
    'chart-pareto': CHART_DEMO,
    'chart-treemap': CHART_DEMO,
    'chart-sunburst': CHART_DEMO,
    'chart-word-cloud': CHART_DEMO,
    'chart-variwide': CHART_DEMO,
    'chart-pyramid': CHART_DEMO,
    'chart-sankey': CHART_DEMO,
    'chart-heatmap': CHART_DEMO,
    'chart-pictorial': CHART_DEMO,
    'chart-gauge': CHART_SINGLE_DEMO,
    'chart-bullet': CHART_SINGLE_DEMO,

    /* ── Sous-parties internes : aperçu impossible, on dit POURQUOI ─────── */
    'chart-axis': REASON_NEEDS_PARENT,
    'chart-tooltip': REASON_NEEDS_PARENT,
    'data-table-column-cell': REASON_NEEDS_PARENT,
    'data-table-footer': REASON_NEEDS_PARENT,
    'data-table-group-header-row': REASON_NEEDS_PARENT,
    'data-table-header-cell': REASON_NEEDS_PARENT,
    'data-table-headers': REASON_NEEDS_PARENT,
    'data-table-headers-cell': REASON_NEEDS_PARENT,
    'data-table-headers-cell-mobile': REASON_NEEDS_PARENT,
    'data-table-row': REASON_NEEDS_PARENT,
    'data-table-rows': REASON_NEEDS_PARENT,
    'expansion-panel': REASON_NEEDS_PARENT,
    'expansion-panel-content': REASON_NEEDS_PARENT,
    'expansion-panel-header': REASON_NEEDS_PARENT,
    'list-children': REASON_NEEDS_PARENT,
    'list-group-activator': REASON_NEEDS_PARENT,
    'item-group-item': REASON_NEEDS_PARENT,
    'slider-field-track': REASON_NEEDS_PARENT,
    'virtual-scroll-item': REASON_NEEDS_PARENT,
    'window-item': REASON_NEEDS_PARENT,
    'carousel-item': REASON_NEEDS_PARENT,
    'parallax-element': REASON_NEEDS_PARENT,
    'parallax-layer': REASON_NEEDS_PARENT,
    tab: REASON_NEEDS_PARENT,
    'tab-panel': REASON_NEEDS_PARENT,
    'bracket-competitor': REASON_NEEDS_PARENT,
    'bracket-match': REASON_NEEDS_PARENT,
    'bracket-round': REASON_NEEDS_PARENT,
    'infinite-scroll-intersect': REASON_RUNTIME_DATA,
    'media-controller': REASON_RUNTIME_DATA,
    /* `ITextareaFieldRichToolbarProps` is PLAIN DATA (an array of command
     * string enums + an object of booleans/0-3), not a DOM element or a
     * composable instance — unlike its two siblings above, it never needed
     * `runtime_data`. Misclassified by analogy with its neighbours. */
    'textarea-field-rich-toolbar': {
        previewProps: {
            items: ['bold', 'italic', 'underline', 'link', 'list-bullet', 'list-ordered', 'heading', 'code-inline', 'clear-format'],
            active: { bold: true, italic: false, underline: false, code: false, link: false, listBullet: false, listOrdered: false, heading: 0 }
        }
    },
    video: REASON_MEDIA_SOURCE,

    /* ── Overlays : rendues EN PLACE via `attach` (#945) ─────────────────
     * `IOverlayProps.attach` (vérifiée dans `overlay.interface.ts`) cible le
     * conteneur d'aperçu lui-même : `<OrigamOverlay>` n'est alors PAS
     * téléporté hors de la boîte. Encore faut-il que cette boîte soit une
     * CONTAINING BLOCK pour le `position: fixed` que porte la racine de
     * l'overlay par défaut — `.component-playground__preview` gagne
     * `contain: layout` dans `pages/components/[slug].vue` pour cette
     * raison précise. Les deux mesures ont été prises dans Chromium réel :
     * DOM (`box.contains(content)`) ET rectangle visuel
     * (`getBoundingClientRect` du contenu borné à celui de la boîte). */
    dialog: { previewProps: { modelValue: true, attach: '.component-playground__preview', title: 'Example dialog' } },
    'dialog-confirmation': { previewProps: { modelValue: true, attach: '.component-playground__preview', title: 'Delete item?', text: 'This action cannot be undone.' } },
    menu: { previewProps: { modelValue: true, attach: '.component-playground__preview', items: ['One', 'Two', 'Three'] } },
    /* Tested with `attach` — measured, Chromium: the node DOES land inside
     * this box (`attach` reaches it exactly like `menu`, same `filterProps`
     * exclusion list minus `attach`), but the PANEL renders with 0 items and
     * its `.origam-overlay__content` lands outside the box regardless.
     * Root cause is unrelated to teleporting: `OrigamContextualMenu`
     * hardcodes `activator="cursor"` / `target="cursor"` with
     * `locationStrategy: 'connected'`, which positions the panel from a
     * REAL `contextmenu` mouse event's coordinates — there is none in a
     * static preview, and `staticLocationStrategy` (the only alternative in
     * `LOCATION_STRATEGIES`) is an empty `// TODO` stub in
     * `utils/Commons/location.util.ts`, so there is no fallback positioning
     * to request instead. A static props-only preview cannot simulate the
     * right-click this component is built around — left as `needs_parent`
     * in spirit (it needs a live interaction, not a parent), kept under
     * `portal` for now so its wording stays accurate until the table grows
     * a fourth reason. DS observation: `staticLocationStrategy` being an
     * unimplemented stub is worth the owner's attention independently. */
    'contextual-menu': REASON_PORTAL,
    /* `<OrigamCommandPalette>` hardcodes `<teleport to="body">` in its own
     * template — no `attach`/`contained` prop exists on `ICommandPaletteProps`
     * (confirmed: it does NOT extend `IOverlayProps`). There is no prop this
     * table can pass to redirect it. DS observation, not fixed here. */
    'command-palette': REASON_PORTAL,
    tooltip: { previewProps: { modelValue: true, attach: '.component-playground__preview', text: 'Tooltip content' } },
    overlay: { previewProps: { modelValue: true, attach: '.component-playground__preview' }, slotText: 'Overlay content' },
    /* `<OrigamOverlayScrim>` never teleports (no `<teleport>` in its
     * template) — it is a plain `v-if="active"` div, always rendered wherever
     * it is mounted. It was misclassified as "portal"; it only needed
     * `active` to stop being an empty box. */
    'overlay-scrim': { previewProps: { active: true } },
    /* Tested — DOES NOT reach "rendered inside this box". `OrigamDrawer`'s
     * own `<teleport :disabled="isLayoutOrphan" :to="…">` self-disables ONLY
     * when NO `<OrigamLayout>` ancestor exists (its own comment: "stories,
     * modal previews, tests"). That premise is false on THIS site: the
     * marketing app wraps EVERYTHING in one real `<OrigamLayout
     * id="origam-app-…">` for its own chrome (app bar, etc.), so
     * `useLayoutItem()`'s `inject(ORIGAM_LAYOUT_KEY)` always resolves to
     * it — confirmed in Chromium: `modelValue=true` reaches the component
     * (Vue devtools trace shows it), yet `.component-playground__preview`
     * is left essentially empty, because the drawer teleported to
     * `#origam-app-… .origam-layout__wrapper` instead. `layoutId` is
     * provide/inject only — `IDrawerProps` exposes no prop to redirect it,
     * so this table cannot fix it per-slug. A real fix would need
     * `ComponentLivePreview` to open its own nested `<OrigamLayout>` scope
     * per preview, which changes the shared harness for all 218 entries —
     * out of scope here; left as a portal case with this note rather than
     * silently "fixed". */
    drawer: REASON_PORTAL,
    snackbar: { previewProps: { modelValue: true, attach: '.component-playground__preview', text: 'Saved successfully.' } },
    /* `<OrigamSnackbarGroup>` hardcodes `<teleport to="body">` too, and
     * `ISnackbarGroupProps` has no `attach`/`contained` prop either — same
     * structural gap as CommandPalette. DS observation, not fixed here. */
    'snackbar-group': REASON_PORTAL,

    /* ── Transitions : un wrapper ne rend que son enfant ────────────────── */
    /* `snack` (slug) = `OrigamSnack.vue`, `components/Transition/` — un
     * wrapper de transition comme `fade` / `slide-x` ci-dessous, PAS un
     * overlay : aucun `<teleport>` dans son template (vérifié), aucune
     * prop `attach`. Il était classé "portal" par erreur ; il rendait une
     * boîte vide faute de contenu de slot, exactement comme ses voisins. */
    snack: { slotChildren: [{ tag: 'origam-card', text: 'Snack content' }] },
    transition: { slotChildren: [{ tag: 'origam-card', text: 'Transitioned content' }] },
    fade: { slotChildren: [{ tag: 'origam-card', text: 'Fading content' }] },
    'expand-x': { slotChildren: [{ tag: 'origam-card', text: 'Expanding content' }] },
    'expand-y': { slotChildren: [{ tag: 'origam-card', text: 'Expanding content' }] },
    'scale-rotate': { slotChildren: [{ tag: 'origam-card', text: 'Rotating content' }] },
    'slide-x': { slotChildren: [{ tag: 'origam-card', text: 'Sliding content' }] },
    'slide-y': { slotChildren: [{ tag: 'origam-card', text: 'Sliding content' }] },
    'translate-bottom': { slotChildren: [{ tag: 'origam-card', text: 'Translated content' }] },
    'translate-picker': { slotChildren: [{ tag: 'origam-card', text: 'Translated content' }] },
    'translate-scale': { slotChildren: [{ tag: 'origam-card', text: 'Translated content' }] },
    'reverse-translate-picker': { slotChildren: [{ tag: 'origam-card', text: 'Translated content' }] },
    'window-x-translate': { slotChildren: [{ tag: 'origam-card', text: 'Translated content' }] },
    'window-x-reverse-translate': { slotChildren: [{ tag: 'origam-card', text: 'Translated content' }] },
    'window-y-translate': { slotChildren: [{ tag: 'origam-card', text: 'Translated content' }] },
    'window-y-reverse-translate': { slotChildren: [{ tag: 'origam-card', text: 'Translated content' }] },
    'client-only': { slotChildren: [{ tag: 'origam-card', text: 'Client-only content' }] },
    spacer: {
        unavailableReasonKey: 'components.detail.preview.reason.layout_only',
        unavailableReasonFallback:
            'This component renders no visible surface of its own: it only pushes its siblings apart inside a flex container.'
    }
}

/**
 * Texte injecté dans le slot par défaut quand le composant EN DÉCLARE un mais
 * que ni la fiche ni l'adaptateur n'en fournissent. Un conteneur vide rend une
 * boîte 0 × 0 : un aperçu qui ment.
 */
export const COMPONENT_PREVIEW_FALLBACK_SLOT_TEXT = 'Content'
