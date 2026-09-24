import type { CSSProperties } from 'vue'
import type { IStrength, IComparison, IUseCase, IWeakness } from '~/interfaces/why-origam.interface'

/**
 * Hero section: gradient badge, same styling as HomeHero badge.
 */
export const WHY_HERO_BADGE_VARS: CSSProperties = {
    '--origam-chip---background-color': 'transparent'
} as CSSProperties

/**
 * Comparison table: alternating row tint.
 */
export const WHY_TABLE_ACCENT_VARS: CSSProperties = {
    '--origam-card---background': 'var(--origam-color__surface---raised, #fafafa)'
} as CSSProperties

/**
 * Strength icon tile background — same pattern as HomeFeatures.
 */
export const WHY_STRENGTH_ICON_TILE_VARS: CSSProperties = {
    '--origam-sheet---background': 'var(--origam-color__action--primary---bgSubtle, rgba(124, 58, 237, 0.1))'
} as CSSProperties

export const WHY_STRENGTH_ICON_TILE_RADIUS = 'var(--origam-radius---card, 10px)'

export const WHY_STRENGTH_ICON_VARS: CSSProperties = {
    '--origam-icon---color': 'var(--origam-color__action--primary---fgSubtle, #6d28d9)'
} as CSSProperties

/**
 * Weakness icon tile — amber/warning tint.
 */
export const WHY_WEAKNESS_ICON_TILE_VARS: CSSProperties = {
    '--origam-sheet---background': 'var(--origam-color__feedback--warning---bgSubtle, rgba(245, 158, 11, 0.1))'
} as CSSProperties

export const WHY_WEAKNESS_ICON_VARS: CSSProperties = {
    '--origam-icon---color': 'var(--origam-color__feedback--warning---fg, #b45309)'
} as CSSProperties

/**
 * Strengths list (S2).
 */
export const WHY_STRENGTHS: IStrength[] = [
    {
        icon: 'mdi-vuejs',
        titleKey: 'why_origam.strengths.vue3.title',
        descriptionKey: 'why_origam.strengths.vue3.description'
    },
    {
        icon: 'mdi-palette-outline',
        titleKey: 'why_origam.strengths.theming.title',
        descriptionKey: 'why_origam.strengths.theming.description'
    },
    {
        icon: 'mdi-chart-line',
        titleKey: 'why_origam.strengths.charts.title',
        descriptionKey: 'why_origam.strengths.charts.description'
    },
    {
        icon: 'mdi-human',
        titleKey: 'why_origam.strengths.a11y.title',
        descriptionKey: 'why_origam.strengths.a11y.description'
    },
    {
        icon: 'mdi-language-css3',
        titleKey: 'why_origam.strengths.css.title',
        descriptionKey: 'why_origam.strengths.css.description'
    },
    {
        icon: 'mdi-package-variant-closed',
        titleKey: 'why_origam.strengths.treeshake.title',
        descriptionKey: 'why_origam.strengths.treeshake.description'
    },
    {
        icon: 'mdi-puzzle-outline',
        titleKey: 'why_origam.strengths.composables.title',
        descriptionKey: 'why_origam.strengths.composables.description'
    },
    {
        icon: 'mdi-scale-balance',
        titleKey: 'why_origam.strengths.mit.title',
        descriptionKey: 'why_origam.strengths.mit.description'
    }
]

/**
 * Comparison data (S3). Facts only — no invented metrics on competitors.
 * "Vue native" means the lib is built for Vue 3 (Composition API, script setup).
 * "Theming props-first" means a theme configures component PROPS first (a `components`
 * block resolved for every component without opt-in), semantic tokens second — not just
 * a raw CSS-variable/token dump. See ADR-005 (theme-props-resolver.composable.ts). None
 * of the listed competitors ship this mechanism — including PrimeVue, whose PrimeOne 3.0
 * tokens are DTCG-compliant but are not a props-first resolver (see its noteKey).
 * "A11y tested" means the lib ships automated a11y tests per component.
 * "CSS-first" means the lib documents CSS-modern techniques as primary approach.
 * "Tree-shakable" = the lib publishes an ESM build; all listed libs do.
 * "Charts included" = charting primitives shipped in the same package.
 */
export const WHY_COMPARISONS: IComparison[] = [
    {
        nameKey: 'why_origam.comparison.origam',
        vueNative: true,
        themingPropsFirst: true,
        a11yTested: true,
        cssFist: true,
        treeShakable: true,
        chartsIncluded: true
    },
    {
        nameKey: 'why_origam.comparison.vuetify',
        vueNative: true,
        themingPropsFirst: false,
        a11yTested: true,
        cssFist: false,
        treeShakable: true,
        chartsIncluded: false,
        noteKey: 'why_origam.comparison.vuetify_note'
    },
    {
        nameKey: 'why_origam.comparison.prime_vue',
        vueNative: true,
        themingPropsFirst: false,
        a11yTested: true,
        cssFist: false,
        treeShakable: true,
        chartsIncluded: false,
        noteKey: 'why_origam.comparison.prime_vue_note'
    },
    {
        nameKey: 'why_origam.comparison.quasar',
        vueNative: true,
        themingPropsFirst: false,
        a11yTested: false,
        cssFist: false,
        treeShakable: false,
        chartsIncluded: false,
        noteKey: 'why_origam.comparison.quasar_note'
    },
    {
        nameKey: 'why_origam.comparison.element_plus',
        vueNative: true,
        themingPropsFirst: false,
        a11yTested: false,
        cssFist: false,
        treeShakable: true,
        chartsIncluded: false,
        noteKey: 'why_origam.comparison.element_plus_note'
    },
    {
        nameKey: 'why_origam.comparison.naive_ui',
        vueNative: true,
        themingPropsFirst: false,
        a11yTested: false,
        cssFist: false,
        treeShakable: true,
        chartsIncluded: false,
        noteKey: 'why_origam.comparison.naive_ui_note'
    }
]

/**
 * Weaknesses / honesty section (S4).
 */
export const WHY_WEAKNESSES: IWeakness[] = [
    {
        icon: 'mdi-account-group-outline',
        titleKey: 'why_origam.weaknesses.community.title',
        descriptionKey: 'why_origam.weaknesses.community.description'
    },
    {
        icon: 'mdi-book-open-outline',
        titleKey: 'why_origam.weaknesses.templates.title',
        descriptionKey: 'why_origam.weaknesses.templates.description'
    },
    {
        icon: 'mdi-server-network',
        titleKey: 'why_origam.weaknesses.scale.title',
        descriptionKey: 'why_origam.weaknesses.scale.description'
    }
]

/**
 * Use-cases (S5): when to pick origam and when not.
 */
export const WHY_USE_CASES: IUseCase[] = [
    {
        icon: 'mdi-check-circle-outline',
        titleKey: 'why_origam.use_cases.greenfield.title',
        descriptionKey: 'why_origam.use_cases.greenfield.description',
        fits: true
    },
    {
        icon: 'mdi-check-circle-outline',
        titleKey: 'why_origam.use_cases.saas_product.title',
        descriptionKey: 'why_origam.use_cases.saas_product.description',
        fits: true
    },
    {
        icon: 'mdi-check-circle-outline',
        titleKey: 'why_origam.use_cases.dataviz.title',
        descriptionKey: 'why_origam.use_cases.dataviz.description',
        fits: true
    },
    {
        icon: 'mdi-close-circle-outline',
        titleKey: 'why_origam.use_cases.migration.title',
        descriptionKey: 'why_origam.use_cases.migration.description',
        fits: false
    },
    {
        icon: 'mdi-close-circle-outline',
        titleKey: 'why_origam.use_cases.ecosystem.title',
        descriptionKey: 'why_origam.use_cases.ecosystem.description',
        fits: false
    }
]

/**
 * Comparison table columns definition (for i18n header keys only).
 */
export const WHY_COMPARISON_COLUMNS: string[] = [
    'why_origam.comparison.col_vue_native',
    'why_origam.comparison.col_theming_props_first',
    'why_origam.comparison.col_a11y_tested',
    'why_origam.comparison.col_css_first',
    'why_origam.comparison.col_tree_shakable',
    'why_origam.comparison.col_charts'
]
