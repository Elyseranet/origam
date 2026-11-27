import { CTA_COMPONENTS_HREF } from '~/consts/cta.const'
import { MARKETING_DEFAULTS } from '~/consts/marketing.const'
import type { ICtaAction } from '~/interfaces/cta.interface'

/**
 * Boutons de la scène « Crépuscule » qui clôt chaque page éditoriale (#1587) : mêmes libellés
 * et mêmes `data-cy` que les anciennes bandes de page. Le premier est l'action principale.
 */
export const EDITORIAL_CHANGELOG_HREF = `${MARKETING_DEFAULTS.githubRepo}/blob/main/CHANGELOG.md`

export const INSTALLATION_CTA_ACTIONS: readonly ICtaAction[] = [
    { key: 'components', labelKey: 'installation.cta.cta_components', labelFallback: 'Browse components', href: CTA_COMPONENTS_HREF, localized: true, dataCy: 'installation-cta-components' },
    { key: 'github', labelKey: 'installation.cta.cta_github', labelFallback: 'View on GitHub', href: MARKETING_DEFAULTS.githubRepo, localized: false, external: true, dataCy: 'installation-cta-github' },
    { key: 'stability', labelKey: 'installation.cta.cta_stability', labelFallback: 'Stability and versioning', href: '/stability', localized: true, dataCy: 'installation-cta-stability' }
]

export const STABILITY_CTA_ACTIONS: readonly ICtaAction[] = [
    { key: 'changelog', labelKey: 'stability.sections.breaking.cta', labelFallback: 'Read the changelog', href: '/changelog', localized: true, dataCy: 'stability-cta-scene-changelog' },
    { key: 'roadmap', labelKey: 'stability.sections.major.cta', labelFallback: 'See the roadmap', href: '/roadmap', localized: true, dataCy: 'stability-cta-scene-roadmap' }
]

export const SUPPORT_CTA_DONATE: Omit<ICtaAction, 'href'> = { key: 'donate', labelKey: 'support.give.cta', labelFallback: 'Donate via PayPal', localized: false, external: true, dataCy: 'support-cta-donate' }

export const SUPPORT_CTA_ISSUES: ICtaAction = { key: 'issues', labelKey: 'support.cta.cta_issues', labelFallback: 'Report a bug', href: `${MARKETING_DEFAULTS.githubRepo}/issues`, localized: false, external: true, dataCy: 'support-cta-issues' }

export const ROADMAP_CTA_ACTIONS: readonly ICtaAction[] = [
    { key: 'github', labelKey: 'roadmap.cta.cta_github', labelFallback: 'Star on GitHub', href: MARKETING_DEFAULTS.githubRepo, localized: false, external: true, dataCy: 'roadmap-cta-github' },
    { key: 'changelog', labelKey: 'roadmap.cta.cta_changelog', labelFallback: 'Read CHANGELOG', href: EDITORIAL_CHANGELOG_HREF, localized: false, external: true, dataCy: 'roadmap-cta-changelog' }
]

export const CHANGELOG_CTA_ACTIONS: readonly ICtaAction[] = [
    { key: 'github', labelKey: 'changelog.cta.cta_github', labelFallback: 'Star on GitHub', href: MARKETING_DEFAULTS.githubRepo, localized: false, external: true, dataCy: 'changelog-cta-github' },
    { key: 'fulllog', labelKey: 'changelog.cta.cta_fulllog', labelFallback: 'Read full CHANGELOG', href: EDITORIAL_CHANGELOG_HREF, localized: false, external: true, dataCy: 'changelog-cta-fulllog' }
]
