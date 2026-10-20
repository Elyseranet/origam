import type { IStabilitySection } from '../interfaces/stability.interface'

/**
 * Sections of the /stability page. Every sentence restates a rule written in
 * the repository's CLAUDE.md ("Work priorities and versioning") or in
 * docs/work-priorities.md — nothing here is a promise those files do not make.
 * Keys live under `stability.sections.*`.
 */
export const STABILITY_SECTIONS: IStabilitySection[] = [
    {
        id: 'number',
        titleKey: 'stability.sections.number.title',
        titleFallback: 'What the 2.x number means',
        paragraphs: [
            {
                textKey: 'stability.sections.number.p1',
                textFallback: 'The 2.x number is historical. In practice origam is a pre-1.0 project that carries a 2.x label.'
            },
            {
                textKey: 'stability.sections.number.p2',
                textFallback: 'Below 3.0.0, the minor and patch numbers are bookkeeping, not a compatibility contract.'
            }
        ]
    },
    {
        id: 'cadence',
        titleKey: 'stability.sections.cadence.title',
        titleFallback: 'Why releases are frequent',
        paragraphs: [
            {
                textKey: 'stability.sections.cadence.p1',
                textFallback: 'Every merged change to the published package gets its own patch release. Changes are not held back to be batched into a weekly or monthly release, so the patch number climbs quickly.'
            },
            {
                textKey: 'stability.sections.cadence.p2',
                textFallback: 'A patch is a bug fix. A minor is a medium feature with limited impact on existing usage. Changes that do not touch the published package, such as this site, the documentation, the tests or the tooling, produce no release at all.'
            }
        ]
    },
    {
        id: 'breaking',
        titleKey: 'stability.sections.breaking.title',
        titleFallback: 'How breaking changes ship',
        paragraphs: [
            {
                textKey: 'stability.sections.breaking.p1',
                textFallback: 'Until 3.0.0, a breaking change can ship in a minor release. It is then documented explicitly and honestly in the CHANGELOG.'
            },
            {
                textKey: 'stability.sections.breaking.p2',
                textFallback: 'The CHANGELOG is where to look before upgrading across a minor version.'
            }
        ],
        link: {
            labelKey: 'stability.sections.breaking.cta',
            labelFallback: 'Read the changelog',
            href: '/changelog',
            icon: 'mdi-history',
            dataCy: 'stability-cta-changelog'
        }
    },
    {
        id: 'major',
        titleKey: 'stability.sections.major.title',
        titleFallback: 'What 3.0.0 will be',
        paragraphs: [
            {
                textKey: 'stability.sections.major.p1',
                textFallback: '3.0.0 is reserved for splitting the package into modules. It will be the first announced major breaking release.'
            },
            {
                textKey: 'stability.sections.major.p2',
                textFallback: 'Nothing else ships under that number: not a batch of bug fixes, not a dependency upgrade. This page gives no date for it.'
            }
        ],
        link: {
            labelKey: 'stability.sections.major.cta',
            labelFallback: 'See the roadmap',
            href: '/roadmap',
            icon: 'mdi-map-marker-path',
            dataCy: 'stability-cta-roadmap'
        }
    },
    {
        id: 'deprecation',
        titleKey: 'stability.sections.deprecation.title',
        titleFallback: 'Deprecation policy',
        paragraphs: [
            {
                textKey: 'stability.sections.deprecation.p1',
                textFallback: 'There is no long deprecation cycle. At the current stage of the project the clean break is preferred to a compatibility layer: a deprecated API is removed as soon as someone gets to it, in a minor release, and the removal is written in the CHANGELOG.'
            },
            {
                textKey: 'stability.sections.deprecation.p2',
                textFallback: 'Deprecations that were announced for the next major are not held back until 3.0.0. This is a rule for the current stage of the project, not a permanent guarantee.'
            }
        ]
    },
    {
        id: 'limits',
        titleKey: 'stability.sections.limits.title',
        titleFallback: 'What this page does not promise',
        paragraphs: [
            {
                textKey: 'stability.sections.limits.p1',
                textFallback: 'This page describes how versions are numbered and announced. origam publishes no long-term-support line, no support window and no guaranteed response time.'
            }
        ]
    }
]
