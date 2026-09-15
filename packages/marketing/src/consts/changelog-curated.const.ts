import type { IChangelogCuratedEntry } from '~/interfaces/changelog.interface'

/**
 * CHANGELOG_CURATED — hand-written release notes, kept verbatim.
 *
 * WHY THIS FILE EXISTS
 *   CHANGELOG.md is an engineering log. The /changelog page is a digest:
 *   measured compression between the two runs from 1x to 8.8x (2.0.0 is 35
 *   bullets in the log, 4 highlights on the page). Selecting and rewriting
 *   like that is editorial work a script cannot do, and these 9 entries are
 *   the only ones anybody has done it for — they are also the only part of
 *   the changelog that is actually TRANSLATED (44 EN + 44 FR strings under
 *   `changelog.versions.*`).
 *
 *   scripts/generate-changelog.mjs enumerates every version from CHANGELOG.md
 *   so none can go missing again (#740), and splices these entries in for the
 *   versions they cover. A version listed here is emitted with THIS content;
 *   any other version gets text extracted from CHANGELOG.md.
 *
 * EDITING
 *   - A released version never changes, so an entry here is effectively
 *     frozen. Adding one is how you upgrade a generated entry to a curated,
 *     translatable one — add the matching keys to en.json AND fr.json.
 *   - `version` must exist in CHANGELOG.md; the generator aborts otherwise,
 *     so this file cannot quietly describe a release that does not exist.
 *   - `textFallback` mirrors the en.json value for `textKey`. It is what a
 *     visitor sees if the key is ever removed from the active locale.
 */
export const CHANGELOG_CURATED: IChangelogCuratedEntry[] = [
    {
        version: '2.6.0',
        summaryKey: 'changelog.versions.v260.summary',
        summaryFallback: 'The bracket + a11y + theming release. v-contrast directive, OrigamBracket double-elimination, two-axis theming engine, monorepo migration. 170 commits.',
        highlights: [
            { type: 'added', textKey: 'changelog.versions.v260.h1', textFallback: 'v-contrast directive — runtime WCAG 2.1 AA text-legibility guard applied to every colour-bearing component' },
            { type: 'added', textKey: 'changelog.versions.v260.h2', textFallback: 'OrigamBracket — full double-elimination layout, Grand Final, cross-cutting prop surface, status indicators' },
            { type: 'added', textKey: 'changelog.versions.v260.h3', textFallback: 'OrigamBlockquote — two-axis colour model (color + bgColor) on all 5 variants' },
            { type: 'added', textKey: 'changelog.versions.v260.h4', textFallback: 'Two-axis theming engine — data-theme (brand identity) × data-mode (light/dark) + semantic JSON authoring' },
            { type: 'changed', textKey: 'changelog.versions.v260.h5', textFallback: 'useStateEffect repaired — runtime prop changes for color/bgColor were silently ignored after initial mount' },
            { type: 'fixed', textKey: 'changelog.versions.v260.h6', textFallback: 'Monorepo migration — packages/ds, marketing, stories, docs, tests, figma-plugin as pnpm workspace packages' }
        ]
    },
    {
        version: '2.5.1',
        summaryKey: 'changelog.versions.v251.summary',
        summaryFallback: 'Patch. Two housekeeping commits with no public API impact.',
        highlights: [
            { type: 'changed', textKey: 'changelog.versions.v251.h1', textFallback: 'Repository structure cleaned up — unit specs moved to tests/TU/, dev playground dropped' },
            { type: 'changed', textKey: 'changelog.versions.v251.h2', textFallback: '.gitignore updated to exclude test artefacts' }
        ]
    },
    {
        version: '2.5.0',
        summaryKey: 'changelog.versions.v250.summary',
        summaryFallback: 'The accessibility release. WCAG 2.1 AA pass across the entire component catalogue. 35 targeted fixes across 36 components.',
        highlights: [
            { type: 'fixed', textKey: 'changelog.versions.v250.h1', textFallback: 'WCAG 2.1 AA pass — 35 fixes: missing aria-label, incorrect role, focus gaps, colour-contrast warnings, keyboard-navigation holes' },
            { type: 'fixed', textKey: 'changelog.versions.v250.h2', textFallback: 'OrigamSelect — full combobox ARIA pattern (role=combobox + aria-expanded + aria-activedescendant)' },
            { type: 'fixed', textKey: 'changelog.versions.v250.h3', textFallback: 'OrigamDataTable — caption element added; OrigamColorPicker — keyboard navigation restored' },
            { type: 'changed', textKey: 'changelog.versions.v250.h4', textFallback: 'VitePress docs sidebar reorganised by UI taxonomy (layout / navigation / data-display / forms / feedback / utility)' }
        ]
    },
    {
        version: '2.4.0',
        summaryKey: 'changelog.versions.v240.summary',
        summaryFallback: 'The chart engine + media kit + Wave 4 release. 27 chart primitives, atomic media kit (OrigamAudio + OrigamVideo), 6 utility components, OrigamCalendar, gradient support. 149 commits.',
        highlights: [
            { type: 'added', textKey: 'changelog.versions.v240.h1', textFallback: 'OrigamChart + useChart — in-house chart engine. 8 base types, pure SVG, 19 chart families total, zero external dep' },
            { type: 'added', textKey: 'changelog.versions.v240.h2', textFallback: 'OrigamAudio + OrigamVideo — custom players with Media Session API, waveform, stem-tracks, WebVTT captions, zero external dep' },
            { type: 'added', textKey: 'changelog.versions.v240.h3', textFallback: 'OrigamGrid, OrigamMasonry, OrigamEmptyState, OrigamClipboard, OrigamInlineEdit, OrigamNumberFormat — Wave 4 utilities' },
            { type: 'added', textKey: 'changelog.versions.v240.h4', textFallback: 'OrigamCalendar — 4 views, RRULE recurring events, drag-to-create, keyboard navigation; OrigamTextMask + gradient color props' },
            { type: 'changed', textKey: 'changelog.versions.v240.h5', textFallback: 'DS-wide reuse-interfaces audit — every component now extends IDimensionProps / IMarginProps / etc.' },
            { type: 'fixed', textKey: 'changelog.versions.v240.h6', textFallback: 'withDefaults() inline literal rule enforced — Grid, Masonry, Blockquote undefined prop crashes fixed' }
        ]
    },
    {
        version: '2.3.0',
        summaryKey: 'changelog.versions.v230.summary',
        summaryFallback: 'The features release. Four new components, official Nuxt module, SSR safety audit. 378 unit tests. 0 lint errors.',
        highlights: [
            { type: 'added', textKey: 'changelog.versions.v230.h1', textFallback: 'origam/nuxt — official Nuxt 3 / Nuxt 4 module with SSR-safe theme resolution, auto-imports, FOUC-free' },
            { type: 'changed', textKey: 'changelog.versions.v230.h2', textFallback: 'OrigamTextField mask prop — built-in patterns (phone, IBAN, credit card, date…) + custom syntax, zero external dep' },
            { type: 'changed', textKey: 'changelog.versions.v230.h3', textFallback: 'OrigamTextareaField mode=rich — lightweight HTML/Markdown editor, 9 toolbar commands, zero external dep' },
            { type: 'fixed', textKey: 'changelog.versions.v230.h4', textFallback: 'SSR safety audit — every composable and component confirmed SSR-safe or patched; new ssr-smoke.spec.ts' }
        ]
    },
    {
        version: '2.2.1',
        summaryKey: 'changelog.versions.v221.summary',
        summaryFallback: 'Patch. First version published to npm (2.2.0 was tagged but never published). One package.json exports fix.',
        highlights: [
            { type: 'fixed', textKey: 'changelog.versions.v221.h1', textFallback: 'Expose ./package.json explicitly in the exports map — consumer pattern reading the version was broken' },
            { type: 'fixed', textKey: 'changelog.versions.v221.h2', textFallback: '2.2.0 was tagged but never published to npm — 2.2.1 is the first version on the registry' }
        ]
    },
    {
        version: '2.2.0',
        summaryKey: 'changelog.versions.v220.summary',
        summaryFallback: 'The ready-for-npm release. Package metadata, peer dependencies, tree-shaking signals, README. Tarball shrunk from 5.6 MB to 867.9 kB. No API change vs 2.1.0.',
        highlights: [
            { type: 'added', textKey: 'changelog.versions.v220.h1', textFallback: '525+ missing Slot / Emit Variants across 113 stories; OrigamSwitchTrack extracted as a standalone primitive' },
            { type: 'changed', textKey: 'changelog.versions.v220.h2', textFallback: 'peerDependencies (vue ^3.5, vue-i18n ^11, vue-router ^4.5) — no longer auto-installed as dependencies' },
            { type: 'fixed', textKey: 'changelog.versions.v220.h3', textFallback: 'Carousel progress prop wired to real cycle timer; Histoire sash resizes in both directions' }
        ]
    },
    {
        version: '2.1.0',
        summaryKey: 'changelog.versions.v210.summary',
        summaryFallback: 'The classes-first release. 13 transversal composables now emit utility classes for tokenised values. The inline-style stack on a typical button drops from ~12 to ~6 declarations.',
        highlights: [
            { type: 'added', textKey: 'changelog.versions.v210.h1', textFallback: '66 utility classes generated by Style Dictionary — origam--bg-[intent], origam--shadow-[rung], origam--rounded-[size]…' },
            { type: 'added', textKey: 'changelog.versions.v210.h2', textFallback: 'New *Classes return keys on all 10 transversal composables — colorClasses, elevationClasses, roundedClasses…' },
            { type: 'changed', textKey: 'changelog.versions.v210.h3', textFallback: '~54 components migrated to consume *Classes in parallel with *Styles (transition strategy A)' },
            { type: 'fixed', textKey: 'changelog.versions.v210.h4', textFallback: 'OrigamSwitch thumb tinting restored — regression from OrigamSwitchTrack extraction fixed via classes-first' }
        ]
    },
    {
        version: '2.0.0',
        summaryKey: 'changelog.versions.v200.summary',
        summaryFallback: 'The design tokens release. Every component now resolves colors, spacing, typography and motion through a centralised, theme-aware token pipeline. 50+ components migrated.',
        highlights: [
            { type: 'added', textKey: 'changelog.versions.v200.h1', textFallback: 'Multi-tier design tokens — Primitive / Semantic / Component tiers; Style Dictionary v4 + Tokens Studio pipeline' },
            { type: 'added', textKey: 'changelog.versions.v200.h2', textFallback: 'Multi-theme runtime — useTheme() composable, OrigamThemeProvider, prefers-color-scheme fallback' },
            { type: 'changed', textKey: 'changelog.versions.v200.h3', textFallback: 'CSS-first / JS-fallback principle — useCssSupport() composable wrapping CSS.supports() with 20 feature flags' },
            { type: 'fixed', textKey: 'changelog.versions.v200.h4', textFallback: 'Multiple critical bug fixes — OrigamMessages id binding, OrigamNumberField reactive loop, OrigamOtpInputField crash' }
        ]
    }
]
