import type { CSSProperties } from 'vue'
import type {
    IRoadmapStatusItem,
    IRoadmapWave,
    IRoadmapPhase,
    IRoadmapStat
} from '~/interfaces/roadmap.interface'

/**
 * Hero badge CSS vars — same pattern as why-origam.
 */
export const ROADMAP_HERO_BADGE_VARS: CSSProperties = {
    '--origam-chip---background-color': 'transparent'
} as CSSProperties

/**
 * Current status items — measured against the repository on 2026-09-25, not
 * transcribed from CHANGELOG.md. Every `done: true` below is backed by a
 * command, re-run on that date with the real exit code captured outside any
 * pipe (load average 2.7 — above ~10 this repository manufactures both false
 * reds and false greens, so the load is part of the measurement):
 *   - npm            : registry.npmjs.org/origam → 2.18.11, tarball
 *                      1 864 944 B (unpacked 9 705 239 B, 3 501 files)
 *   - CI             : 20 jobs across 5 workflows in .github/workflows/
 *   - docs online    : HTTP 200 on the deployed VitePress + Histoire builds
 *   - unit tests     : 7 192 tests green, 564 spec files, 77.81 % statements /
 *                      79.86 % lines (pnpm -F @origam/tests test:coverage, $? = 0)
 *   - e2e specs      : 256 spec files under packages/tests/e2e for 218 stories
 *   - guards         : 29/29 + 16/16 self-tests (pnpm -F origam guards,
 *                      guards:self — both $? = 0)
 *   - inspection     : docs/mesures/classeur-complet-maj-2026-09-01.csv
 *   - dependencies   : .github/dependabot.yml
 *
 * ⛔ The VERSION is deliberately absent from every string these keys resolve
 * to. `roadmap.status.title_line1` used to read the literal "Where 2.17.1"
 * while the hero badge fifteen lines above already read `useVersion()` — the
 * same page rendering two different versions of itself (#913, a repeat of
 * #743). The version now arrives through `{version}` interpolation from
 * `useVersion()`; only values with no live source (test counts, tarball size)
 * stay literal here, and those carry the measurement date above.
 *
 * The `done: false` entries name the REMAINING GAP, not the whole topic — a
 * red cross next to "no visual-regression gate" is accurate, while one next to
 * "visual quality" would not be. Three remain, re-verified on 2026-09-25: the
 * a11y one stays rescoped (the sweep DOES gate CI since #765, and the
 * violation baseline is now empty — only focus-trap coverage is still thin),
 * visual regression and bundle monitoring have no gate at all.
 *
 * ⛔ Five entries were REMOVED on 2026-09-25 on the owner's instruction, and
 * they are named here so nobody re-adds them believing the list is merely
 * incomplete: `readme_changelog` (fixed by #948 — the CHANGELOG no longer
 * lags), `migration_guide` (there is no v2→v3 to migrate: `3.0.0` is not
 * released, so a guide "blocking the v3 tag" was describing nothing),
 * `e2e_ci_gate`, `public_domain` and `community`. The last three are internal
 * engineering and go-to-market state — true, but not what a public roadmap is
 * for. This page says what the LIBRARY does and does not do yet.
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
    { labelKey: 'roadmap.status.wave4_shipped', done: true },
    { labelKey: 'roadmap.status.a11y_sweep', done: false },
    { labelKey: 'roadmap.status.visual_regression', done: false },
    { labelKey: 'roadmap.status.bundle_monitoring', done: false }
]

/**
 * Delivered overview stats — exact counts taken from the DS source tree on
 * 2026-09-25, not rounded-down placeholders. All six re-counted on that date;
 * none moved:
 *   96  directories under packages/ds/src/components/ (218 Origam*.vue files)
 *   139 *.composable.ts under packages/ds/src/composables/
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
    { value: '139', labelKey: 'roadmap.overview.composables', icon: 'mdi-function-variant' },
    { value: '6', labelKey: 'roadmap.overview.directives', icon: 'mdi-code-tags' },
    { value: '218', labelKey: 'roadmap.overview.stories', icon: 'mdi-book-open-variant' },
    { value: '2', labelKey: 'roadmap.overview.themes', icon: 'mdi-theme-light-dark' },
    { value: '3', labelKey: 'roadmap.overview.token_tiers', icon: 'mdi-layers-triple-outline' }
]

/**
 * Delivered waves 1 to 3 — sourced from CHANGELOG.md.
 *
 * ⛔ Wave 4 is NOT here, and no longer anywhere on this page as a WAVE. It was
 * first a fourth entry of this array, then its own section driven by
 * `ROADMAP_WAVE4_COMPONENTS` — 15 hand-written rows under the heading
 * "15 components & features / already shipped". That heading is what a reader
 * counted, and it read as "origam ships 15 components" while the whole
 * catalogue is published. The section is now the LIVE catalogue grouped by
 * category (see `ROADMAP_CATALOGUE_FALLBACK_CATEGORY` at the bottom of this
 * file); wave 4's 15 members are in it, alongside every other component, each
 * a link to its own API page. `roadmap.status.wave4_shipped` still records
 * that the wave landed — that is a fact about the release, not a component
 * count.
 *
 * The three that remain are old, entirely delivered, and low-value to read
 * line by line today, so they share ONE compact panel with three sub-lists
 * instead of three cards. The `IRoadmapWave` shape is unchanged — only the
 * name (`ROADMAP_WAVES` → `ROADMAP_DELIVERED_WAVES`) and the membership moved,
 * so a future reader cannot mistake this for "every wave ever shipped".
 */
export const ROADMAP_DELIVERED_WAVES: IRoadmapWave[] = [
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
 *
 * ⛔ Removed on 2026-09-25, same instruction as the five status entries above:
 * `public_domain` (where the docs are HOSTED is infrastructure, not library
 * roadmap). `api_audit` and `e2e_gate` were KEPT — the work is real — but
 * their copy no longer states the internal accounting the owner does not want
 * published (a missing v2→v3 migration guide "blocking the v3 tag", when no
 * v3 exists; "81 of 256 specs gated"). Say what the library will do, not how
 * many of our own files are wired into our own CI.
 */
export const ROADMAP_PHASES: IRoadmapPhase[] = [
    {
        id: 'short-term',
        eyebrowKey: 'roadmap.phases.short_term.eyebrow',
        titleKey: 'roadmap.phases.short_term.title',
        intent: 'primary',
        icon: 'mdi-rocket-launch-outline',
        // The nearest and the most actionable phase, so it is the one that
        // renders expanded — every other `<details>` starts closed. This is the
        // ONLY place the default-open choice lives; the template reads the flag
        // rather than testing `phase.id === 'short-term'`.
        defaultOpen: true,
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
 * Fallback bucket for the shipped-catalogue section.
 *
 * ⛔ Replaces `ROADMAP_WAVE4_COMPONENTS`, a hand-maintained list of 15 rows.
 * The section it fed was titled "15 components & features / already shipped",
 * which a reader could only understand as "origam ships 15 components" — while
 * every component in the catalogue is published. The section now reads the
 * LIVE catalogue (`/api/reference/component`), so adding a component to
 * `packages/ds/src/components/` is enough for it to appear: nothing to edit
 * here, nothing to drift.
 *
 * ⛔ Do NOT write a component count anywhere — not in the title, not in a
 * `t()` fallback, not in a comment stated as a fact. The catalogue is
 * editorial data and it differs per environment (the day this was written:
 * 218 entries on the local dev server, 194 on the deployed one). Every figure
 * the page shows comes from the API response it just rendered.
 *
 * This constant is the one thing the live data cannot supply. Grouping the
 * catalogue by category leaves exactly ONE entry homeless: `slide-group`
 * declares `parentSlug: 'slide'`, and `slide` is not a catalogue entry —
 * `Slide/` is a grouping directory with no homonymous component — while also
 * carrying an empty `category`. It is the only entry cumulating both defects.
 *
 * ⛔ PROVISIONAL — this bucket is a workaround, not a fix. The defect is in
 * the data (seven entries point at a `parentSlug` that is not a catalogue
 * entry; a group of sub-components carry `category: ''`) and is tracked in
 * **#954**. When #954 lands, this constant and its bucket should disappear
 * rather than be kept "just in case". The value is a category KEY, never a
 * label: the label is translated in the page via
 * `roadmap.catalogue.category_other`.
 */
export const ROADMAP_CATALOGUE_FALLBACK_CATEGORY = 'other'
