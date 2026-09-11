import type { CSSProperties } from 'vue'
import type {
    IRoadmapStatusItem,
    IRoadmapWave,
    IRoadmapPhase,
    IRoadmapWave4Component,
    IRoadmapStat
} from '~/interfaces/roadmap.interface'

/**
 * Hero badge CSS vars — same pattern as why-origam.
 */
export const ROADMAP_HERO_BADGE_VARS: CSSProperties = {
    '--origam-chip---background-color': 'transparent'
} as CSSProperties

/**
 * Current status items — sourced from CHANGELOG.md (post-2.6.0 state).
 */
export const ROADMAP_STATUS_ITEMS: IRoadmapStatusItem[] = [
    { labelKey: 'roadmap.status.npm_published', done: true },
    { labelKey: 'roadmap.status.pre_delivery', done: true },
    { labelKey: 'roadmap.status.readme_changelog', done: true },
    { labelKey: 'roadmap.status.monorepo', done: true },
    { labelKey: 'roadmap.status.wave4_shipped', done: true },
    { labelKey: 'roadmap.status.doc_online', done: false },
    { labelKey: 'roadmap.status.ci', done: false },
    { labelKey: 'roadmap.status.playwright_coverage', done: false },
    { labelKey: 'roadmap.status.bundle_monitoring', done: false }
]

/**
 * Delivered overview stats — conservative, verifiable lower bounds counted
 * from the DS source tree (97 component dirs, 103 composables, 6 directives,
 * 209 stories, light + dark token themes, 3-tier token pipeline).
 */
export const ROADMAP_OVERVIEW_STATS: IRoadmapStat[] = [
    { value: '90+', labelKey: 'roadmap.overview.components', icon: 'mdi-shape-outline' },
    { value: '100+', labelKey: 'roadmap.overview.composables', icon: 'mdi-function-variant' },
    { value: '6', labelKey: 'roadmap.overview.directives', icon: 'mdi-code-tags' },
    { value: '200+', labelKey: 'roadmap.overview.stories', icon: 'mdi-book-open-variant' },
    { value: '2', labelKey: 'roadmap.overview.themes', icon: 'mdi-theme-light-dark' },
    { value: '3', labelKey: 'roadmap.overview.token_tiers', icon: 'mdi-layers-triple-outline' }
]

/**
 * Delivered waves — sourced from CHANGELOG.md Waves 1/2/3/4.
 */
export const ROADMAP_WAVES: IRoadmapWave[] = [
    {
        titleKey: 'roadmap.waves.wave1.title',
        items: [
            { nameKey: 'roadmap.waves.wave1.tabs', done: true },
            { nameKey: 'roadmap.waves.wave1.command_palette', done: true },
            { nameKey: 'roadmap.waves.wave1.snackbar_stack', done: true },
            { nameKey: 'roadmap.waves.wave1.bracket', done: true }
        ]
    },
    {
        titleKey: 'roadmap.waves.wave2.title',
        items: [
            { nameKey: 'roadmap.waves.wave2.parallax', done: true },
            { nameKey: 'roadmap.waves.wave2.code', done: true },
            { nameKey: 'roadmap.waves.wave2.textarea_richtext', done: true },
            { nameKey: 'roadmap.waves.wave2.text_field_mask', done: true }
        ]
    },
    {
        titleKey: 'roadmap.waves.wave3.title',
        items: [
            { nameKey: 'roadmap.waves.wave3.nuxt_module', done: true },
            { nameKey: 'roadmap.waves.wave3.ssr_safety', done: true },
            { nameKey: 'roadmap.waves.wave3.monorepo', done: true }
        ]
    },
    {
        titleKey: 'roadmap.waves.wave4.title',
        items: [
            { nameKey: 'roadmap.waves.wave4.grid', done: true },
            { nameKey: 'roadmap.waves.wave4.masonry', done: true },
            { nameKey: 'roadmap.waves.wave4.blockquote', done: true },
            { nameKey: 'roadmap.waves.wave4.empty_state', done: true },
            { nameKey: 'roadmap.waves.wave4.clipboard', done: true },
            { nameKey: 'roadmap.waves.wave4.inline_edit', done: true },
            { nameKey: 'roadmap.waves.wave4.number_format', done: true },
            { nameKey: 'roadmap.waves.wave4.qr_code', done: true },
            { nameKey: 'roadmap.waves.wave4.watermark', done: true },
            { nameKey: 'roadmap.waves.wave4.video', done: true },
            { nameKey: 'roadmap.waves.wave4.sound', done: true },
            { nameKey: 'roadmap.waves.wave4.calendar', done: true },
            { nameKey: 'roadmap.waves.wave4.chart', done: true },
            { nameKey: 'roadmap.waves.wave4.gradient', done: true },
            { nameKey: 'roadmap.waves.wave4.text_mask', done: true }
        ]
    }
]

/**
 * Roadmap phases — sourced from CHANGELOG.md.
 * Items already delivered (Nuxt module v2.3.0, SSR useCssSupportClient v2.3.0)
 * have been removed from mid-term — they now live in Wave 3 above.
 * Only technical-public items remain: no KPI thresholds, no marketing tactics.
 */
export const ROADMAP_PHASES: IRoadmapPhase[] = [
    {
        id: 'short-term',
        eyebrowKey: 'roadmap.phases.short_term.eyebrow',
        titleKey: 'roadmap.phases.short_term.title',
        intent: 'primary',
        icon: 'mdi-rocket-launch-outline',
        items: [
            {
                titleKey: 'roadmap.phases.short_term.sonarqube.title',
                descriptionKey: 'roadmap.phases.short_term.sonarqube.description',
                icon: 'mdi-shield-check-outline',
                effortKey: 'roadmap.effort.medium'
            },
            {
                titleKey: 'roadmap.phases.short_term.ci_e2e.title',
                descriptionKey: 'roadmap.phases.short_term.ci_e2e.description',
                icon: 'mdi-alert-octagon-outline',
                effortKey: 'roadmap.effort.medium'
            },
            {
                titleKey: 'roadmap.phases.short_term.ci.title',
                descriptionKey: 'roadmap.phases.short_term.ci.description',
                icon: 'mdi-github',
                effortKey: 'roadmap.effort.large'
            },
            {
                titleKey: 'roadmap.phases.short_term.deployment.title',
                descriptionKey: 'roadmap.phases.short_term.deployment.description',
                icon: 'mdi-cloud-upload-outline',
                effortKey: 'roadmap.effort.medium'
            },
            {
                titleKey: 'roadmap.phases.short_term.playwright.title',
                descriptionKey: 'roadmap.phases.short_term.playwright.description',
                icon: 'mdi-test-tube',
                effortKey: 'roadmap.effort.xlarge'
            },
            {
                titleKey: 'roadmap.phases.short_term.a11y_audit.title',
                descriptionKey: 'roadmap.phases.short_term.a11y_audit.description',
                icon: 'mdi-human-wheelchair',
                effortKey: 'roadmap.effort.medium'
            },
            {
                titleKey: 'roadmap.phases.short_term.bundle_size.title',
                descriptionKey: 'roadmap.phases.short_term.bundle_size.description',
                icon: 'mdi-package-variant-closed',
                effortKey: 'roadmap.effort.small'
            }
        ]
    },
    {
        id: 'mid-term',
        eyebrowKey: 'roadmap.phases.mid_term.eyebrow',
        titleKey: 'roadmap.phases.mid_term.title',
        intent: 'warning',
        icon: 'mdi-layers-outline',
        items: [
            {
                titleKey: 'roadmap.phases.mid_term.v3.title',
                descriptionKey: 'roadmap.phases.mid_term.v3.description',
                icon: 'mdi-lightning-bolt-outline',
                effortKey: 'roadmap.effort.xlarge'
            },
            {
                titleKey: 'roadmap.phases.mid_term.accent_color.title',
                descriptionKey: 'roadmap.phases.mid_term.accent_color.description',
                icon: 'mdi-palette-outline',
                effortKey: 'roadmap.effort.medium'
            },
            {
                titleKey: 'roadmap.phases.mid_term.list_semantics.title',
                descriptionKey: 'roadmap.phases.mid_term.list_semantics.description',
                icon: 'mdi-format-list-bulleted',
                effortKey: 'roadmap.effort.medium'
            },
            {
                titleKey: 'roadmap.phases.mid_term.motion_tokens.title',
                descriptionKey: 'roadmap.phases.mid_term.motion_tokens.description',
                icon: 'mdi-animation-play-outline',
                effortKey: 'roadmap.effort.medium'
            },
            {
                titleKey: 'roadmap.phases.mid_term.background_directive.title',
                descriptionKey: 'roadmap.phases.mid_term.background_directive.description',
                icon: 'mdi-image-multiple-outline',
                effortKey: 'roadmap.effort.large'
            },
            {
                titleKey: 'roadmap.phases.mid_term.textmask_stroke.title',
                descriptionKey: 'roadmap.phases.mid_term.textmask_stroke.description',
                icon: 'mdi-format-color-text',
                effortKey: 'roadmap.effort.medium'
            },
            {
                titleKey: 'roadmap.phases.mid_term.theming_completion.title',
                descriptionKey: 'roadmap.phases.mid_term.theming_completion.description',
                icon: 'mdi-palette-swatch-outline',
                effortKey: 'roadmap.effort.large'
            },
            {
                titleKey: 'roadmap.phases.mid_term.vrt.title',
                descriptionKey: 'roadmap.phases.mid_term.vrt.description',
                icon: 'mdi-image-compare',
                effortKey: 'roadmap.effort.medium'
            },
            {
                titleKey: 'roadmap.phases.mid_term.turborepo.title',
                descriptionKey: 'roadmap.phases.mid_term.turborepo.description',
                icon: 'mdi-rocket-outline',
                effortKey: 'roadmap.effort.small'
            }
        ]
    },
    {
        id: 'long-term',
        eyebrowKey: 'roadmap.phases.long_term.eyebrow',
        titleKey: 'roadmap.phases.long_term.title',
        intent: 'info',
        icon: 'mdi-telescope',
        items: [
            {
                titleKey: 'roadmap.phases.long_term.vapor.title',
                descriptionKey: 'roadmap.phases.long_term.vapor.description',
                icon: 'mdi-speedometer',
                effortKey: 'roadmap.effort.xlarge'
            },
            {
                titleKey: 'roadmap.phases.long_term.web_components.title',
                descriptionKey: 'roadmap.phases.long_term.web_components.description',
                icon: 'mdi-web',
                effortKey: 'roadmap.effort.large'
            },
            {
                titleKey: 'roadmap.phases.long_term.theme_builder.title',
                descriptionKey: 'roadmap.phases.long_term.theme_builder.description',
                icon: 'mdi-palette-swatch-outline',
                effortKey: 'roadmap.effort.xlarge'
            },
            {
                titleKey: 'roadmap.phases.long_term.marketing_db.title',
                descriptionKey: 'roadmap.phases.long_term.marketing_db.description',
                icon: 'mdi-database-sync-outline',
                effortKey: 'roadmap.effort.xlarge'
            },
            {
                titleKey: 'roadmap.phases.long_term.marketing_cms.title',
                descriptionKey: 'roadmap.phases.long_term.marketing_cms.description',
                icon: 'mdi-view-dashboard-edit-outline',
                effortKey: 'roadmap.effort.xlarge'
            }
        ]
    }
]

/**
 * Wave 4 — recently shipped components. Sourced from CHANGELOG.md [Unreleased].
 * All 13 components + gradient support + OrigamTextMask are delivered.
 */
export const ROADMAP_WAVE4_COMPONENTS: IRoadmapWave4Component[] = [
    { nameKey: 'roadmap.wave4_grid.grid.name', noteKey: 'roadmap.wave4_grid.grid.note', icon: 'mdi-grid' },
    { nameKey: 'roadmap.wave4_grid.masonry.name', noteKey: 'roadmap.wave4_grid.masonry.note', icon: 'mdi-view-quilt-outline' },
    { nameKey: 'roadmap.wave4_grid.blockquote.name', noteKey: 'roadmap.wave4_grid.blockquote.note', icon: 'mdi-format-quote-close' },
    { nameKey: 'roadmap.wave4_grid.empty_state.name', noteKey: 'roadmap.wave4_grid.empty_state.note', icon: 'mdi-inbox-outline' },
    { nameKey: 'roadmap.wave4_grid.clipboard.name', noteKey: 'roadmap.wave4_grid.clipboard.note', icon: 'mdi-clipboard-outline' },
    { nameKey: 'roadmap.wave4_grid.inline_edit.name', noteKey: 'roadmap.wave4_grid.inline_edit.note', icon: 'mdi-pencil-outline' },
    { nameKey: 'roadmap.wave4_grid.number_format.name', noteKey: 'roadmap.wave4_grid.number_format.note', icon: 'mdi-numeric' },
    { nameKey: 'roadmap.wave4_grid.qr_code.name', noteKey: 'roadmap.wave4_grid.qr_code.note', icon: 'mdi-qrcode' },
    { nameKey: 'roadmap.wave4_grid.watermark.name', noteKey: 'roadmap.wave4_grid.watermark.note', icon: 'mdi-watermark' },
    { nameKey: 'roadmap.wave4_grid.video.name', noteKey: 'roadmap.wave4_grid.video.note', icon: 'mdi-play-circle-outline' },
    { nameKey: 'roadmap.wave4_grid.sound.name', noteKey: 'roadmap.wave4_grid.sound.note', icon: 'mdi-volume-high' },
    { nameKey: 'roadmap.wave4_grid.calendar.name', noteKey: 'roadmap.wave4_grid.calendar.note', icon: 'mdi-calendar-outline' },
    { nameKey: 'roadmap.wave4_grid.chart.name', noteKey: 'roadmap.wave4_grid.chart.note', icon: 'mdi-chart-line' },
    { nameKey: 'roadmap.wave4_grid.gradient.name', noteKey: 'roadmap.wave4_grid.gradient.note', icon: 'mdi-gradient-horizontal' },
    { nameKey: 'roadmap.wave4_grid.text_mask.name', noteKey: 'roadmap.wave4_grid.text_mask.note', icon: 'mdi-text-box-outline' }
]
