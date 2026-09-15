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
 * Current status items — measured against the repository on 2026-09-15, not
 * transcribed from CHANGELOG.md. Every `done: true` below is backed by a
 * command recorded in the root ROADMAP.md ("Où on en est"):
 *   - npm            : registry.npmjs.org/origam → 2.17.1, tarball 1 733 668 B
 *   - CI             : 17 jobs across 5 workflows in .github/workflows/
 *   - docs online    : HTTP 200 on the deployed VitePress + Histoire builds
 *   - unit tests     : 6 953 tests green, 532 spec files (test:coverage, exit 0)
 *   - e2e specs      : 229 spec files for 218 stories
 *   - guards         : 21/21 (scripts/guards/run-all.mjs, exit 0)
 *   - inspection     : docs/mesures/classeur-complet-maj-2026-09-01.csv
 *   - dependencies   : .github/dependabot.yml
 *
 * The `done: false` entries name the REMAINING GAP, not the whole topic — a
 * red cross next to "the CI gates 58 of 229 specs" is accurate, while one
 * next to "e2e coverage" would not be.
 */
export const ROADMAP_STATUS_ITEMS: IRoadmapStatusItem[] = [
    { labelKey: 'roadmap.status.npm_published', done: true },
    { labelKey: 'roadmap.status.ci_pipeline', done: true },
    { labelKey: 'roadmap.status.docs_deployed', done: true },
    { labelKey: 'roadmap.status.unit_tests', done: true },
    { labelKey: 'roadmap.status.e2e_specs', done: true },
    { labelKey: 'roadmap.status.guards', done: true },
    { labelKey: 'roadmap.status.inspection', done: true },
    { labelKey: 'roadmap.status.sonarqube', done: true },
    { labelKey: 'roadmap.status.dependency_automation', done: true },
    { labelKey: 'roadmap.status.monorepo', done: true },
    { labelKey: 'roadmap.status.readme_changelog', done: true },
    { labelKey: 'roadmap.status.wave4_shipped', done: true },
    { labelKey: 'roadmap.status.e2e_ci_gate', done: false },
    { labelKey: 'roadmap.status.a11y_sweep', done: false },
    { labelKey: 'roadmap.status.visual_regression', done: false },
    { labelKey: 'roadmap.status.bundle_monitoring', done: false },
    { labelKey: 'roadmap.status.migration_guide', done: false },
    { labelKey: 'roadmap.status.public_domain', done: false },
    { labelKey: 'roadmap.status.community', done: false }
]

/**
 * Delivered overview stats — exact counts taken from the DS source tree on
 * 2026-09-15, not rounded-down placeholders:
 *   96  directories under packages/ds/src/components/ (218 Origam*.vue files)
 *   138 *.composable.ts under packages/ds/src/composables/
 *   6   directories under packages/ds/src/directives/
 *   218 *.story.vue under packages/stories/components/
 *   2   base token themes (light.css + dark.css)
 *   3   token tiers (primitive / semantic / component)
 *
 * `packages/tests/e2e/roadmap.spec.ts` asserts the FIRST value rendered here —
 * change one without the other and that spec goes red.
 */
export const ROADMAP_OVERVIEW_STATS: IRoadmapStat[] = [
    { value: '96', labelKey: 'roadmap.overview.components', icon: 'mdi-shape-outline' },
    { value: '138', labelKey: 'roadmap.overview.composables', icon: 'mdi-function-variant' },
    { value: '6', labelKey: 'roadmap.overview.directives', icon: 'mdi-code-tags' },
    { value: '218', labelKey: 'roadmap.overview.stories', icon: 'mdi-book-open-variant' },
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
 * Roadmap phases — only what is NOT delivered yet.
 *
 * Removed from short-term on 2026-09-15, because each was measured as done
 * and now appears in ROADMAP_STATUS_ITEMS instead:
 *   - `ci`                    → 17 CI jobs across 5 workflows
 *   - `deployment`            → VitePress + Histoire answer HTTP 200
 *   - `ci_e2e`                → the job no longer times out (E2E_STATIC + 4 shards)
 *   - `tu_audit`              → 0 spec left in src/__tests__, 77.94 % branches
 *                               on composables/Commons (target was 70 %)
 *   - `dependency_automation` → .github/dependabot.yml, grouped weekly PRs
 * Previously removed for the same reason: Nuxt module and SSR
 * useCssSupportClient (v2.3.0), which live in Wave 3 above.
 *
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
                titleKey: 'roadmap.phases.short_term.e2e_gate.title',
                descriptionKey: 'roadmap.phases.short_term.e2e_gate.description',
                icon: 'mdi-test-tube',
                effortKey: 'roadmap.effort.large'
            },
            {
                titleKey: 'roadmap.phases.short_term.api_audit.title',
                descriptionKey: 'roadmap.phases.short_term.api_audit.description',
                icon: 'mdi-file-search-outline',
                effortKey: 'roadmap.effort.large'
            },
            {
                titleKey: 'roadmap.phases.short_term.public_domain.title',
                descriptionKey: 'roadmap.phases.short_term.public_domain.description',
                icon: 'mdi-web',
                effortKey: 'roadmap.effort.small'
            },
            {
                titleKey: 'roadmap.phases.short_term.a11y_audit.title',
                descriptionKey: 'roadmap.phases.short_term.a11y_audit.description',
                icon: 'mdi-human-wheelchair',
                effortKey: 'roadmap.effort.medium'
            },
            {
                titleKey: 'roadmap.phases.short_term.sonarqube.title',
                descriptionKey: 'roadmap.phases.short_term.sonarqube.description',
                icon: 'mdi-shield-check-outline',
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
                titleKey: 'roadmap.phases.mid_term.modularization.title',
                descriptionKey: 'roadmap.phases.mid_term.modularization.description',
                icon: 'mdi-puzzle-outline',
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
                titleKey: 'roadmap.phases.mid_term.wizard_form.title',
                descriptionKey: 'roadmap.phases.mid_term.wizard_form.description',
                icon: 'mdi-stairs',
                effortKey: 'roadmap.effort.medium'
            },
            {
                titleKey: 'roadmap.phases.mid_term.page.title',
                descriptionKey: 'roadmap.phases.mid_term.page.description',
                icon: 'mdi-page-layout-header-footer',
                effortKey: 'roadmap.effort.small'
            },
            {
                titleKey: 'roadmap.phases.mid_term.section.title',
                descriptionKey: 'roadmap.phases.mid_term.section.description',
                icon: 'mdi-view-agenda-outline',
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
            },
            {
                titleKey: 'roadmap.phases.mid_term.variant_presets.title',
                descriptionKey: 'roadmap.phases.mid_term.variant_presets.description',
                icon: 'mdi-tune-variant',
                effortKey: 'roadmap.effort.large'
            },
            {
                titleKey: 'roadmap.phases.mid_term.add_more.title',
                descriptionKey: 'roadmap.phases.mid_term.add_more.description',
                icon: 'mdi-playlist-plus',
                effortKey: 'roadmap.effort.medium'
            },
            {
                titleKey: 'roadmap.phases.mid_term.content_justify.title',
                descriptionKey: 'roadmap.phases.mid_term.content_justify.description',
                icon: 'mdi-align-horizontal-center',
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
            },
            {
                titleKey: 'roadmap.phases.long_term.server_components.title',
                descriptionKey: 'roadmap.phases.long_term.server_components.description',
                icon: 'mdi-server-outline',
                effortKey: 'roadmap.effort.medium'
            },
            {
                titleKey: 'roadmap.phases.long_term.ai_figma.title',
                descriptionKey: 'roadmap.phases.long_term.ai_figma.description',
                icon: 'mdi-auto-fix',
                effortKey: 'roadmap.effort.large'
            },
            {
                titleKey: 'roadmap.phases.long_term.maintenance_eol.title',
                descriptionKey: 'roadmap.phases.long_term.maintenance_eol.description',
                icon: 'mdi-calendar-clock-outline'
            }
        ]
    },
    {
        id: 'ongoing',
        eyebrowKey: 'roadmap.phases.ongoing.eyebrow',
        titleKey: 'roadmap.phases.ongoing.title',
        intent: 'secondary',
        icon: 'mdi-refresh',
        items: [
            {
                titleKey: 'roadmap.phases.ongoing.dependencies.title',
                descriptionKey: 'roadmap.phases.ongoing.dependencies.description',
                icon: 'mdi-update'
            },
            {
                titleKey: 'roadmap.phases.ongoing.doc.title',
                descriptionKey: 'roadmap.phases.ongoing.doc.description',
                icon: 'mdi-book-open-page-variant-outline'
            },
            {
                titleKey: 'roadmap.phases.ongoing.performance.title',
                descriptionKey: 'roadmap.phases.ongoing.performance.description',
                icon: 'mdi-speedometer'
            },
            {
                titleKey: 'roadmap.phases.ongoing.refactor.title',
                descriptionKey: 'roadmap.phases.ongoing.refactor.description',
                icon: 'mdi-broom'
            },
            {
                titleKey: 'roadmap.phases.ongoing.quality_gate.title',
                descriptionKey: 'roadmap.phases.ongoing.quality_gate.description',
                icon: 'mdi-check-decagram-outline'
            },
            {
                titleKey: 'roadmap.phases.ongoing.changelog.title',
                descriptionKey: 'roadmap.phases.ongoing.changelog.description',
                icon: 'mdi-file-document-edit-outline'
            },
            {
                titleKey: 'roadmap.phases.ongoing.test_as_you_build.title',
                descriptionKey: 'roadmap.phases.ongoing.test_as_you_build.description',
                icon: 'mdi-clipboard-check-outline'
            },
            {
                titleKey: 'roadmap.phases.ongoing.security.title',
                descriptionKey: 'roadmap.phases.ongoing.security.description',
                icon: 'mdi-shield-lock-outline'
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
