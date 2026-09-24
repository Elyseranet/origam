export type TChangelogVersionType = 'unreleased' | 'major' | 'minor' | 'patch'

export type TChangelogHighlightType = 'added' | 'changed' | 'fixed' | 'deprecated'

export interface IChangelogHighlight {
    type: TChangelogHighlightType
    textKey: string
    /**
     * English text extracted from CHANGELOG.md, rendered by
     * `t(textKey, textFallback)` when `textKey` is absent from the ACTIVE
     * locale. Follows the site's `*Key` / `*Fallback` convention — see
     * scripts/i18n-check.mjs ("Channel B") and composables/useT.ts.
     */
    textFallback: string
}

/**
 * A hand-written release note spliced into the generated list by
 * scripts/generate-changelog.mjs. Carries no `date` or `type`: those come
 * from CHANGELOG.md, so a curated entry can never contradict the log.
 */
export interface IChangelogCuratedEntry {
    version: string
    summaryKey: string
    summaryFallback: string
    highlights: IChangelogHighlight[]
}

export interface IChangelogVersion {
    version: string
    date: string | null
    type: TChangelogVersionType
    summaryKey: string
    /** See IChangelogHighlight.textFallback. */
    summaryFallback: string
    highlights: IChangelogHighlight[]
}
