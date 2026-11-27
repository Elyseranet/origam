import type { IStrength, IUseCase, IWeakness } from '~/interfaces/why-origam.interface'

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
