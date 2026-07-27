<script setup lang="ts">
import { computed, ref } from 'vue'
import { useT } from '~/composables/useT'
import {
    CHANGELOG_VERSIONS,
    CHANGELOG_TYPE_COLOR,
    CHANGELOG_HIGHLIGHT_COLOR,
    CHANGELOG_HIGHLIGHT_ICON
} from '~/consts/changelog.const'
import { MARKETING_DEFAULTS } from '~/consts/marketing.const'

const { t } = useT()

useSeoMeta({
    title: () => t('changelog.meta.title', 'Changelog · origam design system'),
    description: () => t('changelog.meta.description', 'Every release of the origam design system, curated and accessible in one place.'),
    ogTitle: () => t('changelog.meta.title', 'Changelog · origam design system'),
    ogDescription: () => t('changelog.meta.description', 'Every release of the origam design system, curated and accessible in one place.')
})

const versions = computed(() => CHANGELOG_VERSIONS)
const fullChangelogHref = computed(() => `${MARKETING_DEFAULTS.githubRepo}/blob/main/CHANGELOG.md`)

function typeColor (type: string): string {
    return CHANGELOG_TYPE_COLOR[type as keyof typeof CHANGELOG_TYPE_COLOR] ?? 'neutral'
}

function highlightColor (type: string): string {
    return CHANGELOG_HIGHLIGHT_COLOR[type as keyof typeof CHANGELOG_HIGHLIGHT_COLOR] ?? 'neutral'
}

function highlightIcon (type: string): string {
    return CHANGELOG_HIGHLIGHT_ICON[type as keyof typeof CHANGELOG_HIGHLIGHT_ICON] ?? 'mdi-information-outline'
}

function typeLabel (type: string): string {
    const key = `changelog.type.${type}`
    const fallbacks: Record<string, string> = {
        unreleased: 'Next',
        major: 'Major',
        minor: 'Minor',
        patch: 'Patch'
    }
    return t(key, fallbacks[type] ?? type)
}

function highlightTypeLabel (type: string): string {
    const key = `changelog.highlight.${type}`
    const fallbacks: Record<string, string> = {
        added: 'Added',
        changed: 'Changed',
        fixed: 'Fixed',
        deprecated: 'Deprecated'
    }
    return t(key, fallbacks[type] ?? type)
}

const defaultVersion = CHANGELOG_VERSIONS.find(v => v.type !== 'unreleased')?.version ?? CHANGELOG_VERSIONS[0].version
const selectedVersion = ref<string>(defaultVersion)

const currentVersion = computed(() =>
    versions.value.find(v => v.version === selectedVersion.value) ?? versions.value[0]
)

const versionSelectItems = computed(() => versions.value.map(v => ({
    value: v.version,
    title: v.type === 'unreleased'
        ? `${t('changelog.type.unreleased', 'Next')} · ${t('changelog.unreleased.label', 'Not yet released')}`
        : `${v.version} · ${typeLabel(v.type)} · ${v.date}`
})))

const currentVersionLabel = computed(() =>
    currentVersion.value.type === 'unreleased'
        ? t('changelog.type.unreleased', 'Next')
        : currentVersion.value.version
)
</script>

<template>
    <article
        class="changelog"
        data-cy="page-changelog"
    >
        <section
            class="changelog-hero"
            aria-labelledby="changelog-title"
        >
            <origam-container class="changelog-hero__inner">
                <origam-chip
                    class="changelog-hero__badge"
                    color="primary"
                    border
                    border-color="var(--origam-color__action--primary---bg)"
                    size="small"
                    pill
                    data-cy="changelog-hero-badge"
                >
                    {{ t('changelog.hero.badge', 'Changelog') }}
                </origam-chip>

                <origam-title
                    id="changelog-title"
                    tag="h1"
                    class="changelog-hero__title"
                >
                    <span class="changelog-hero__title-line">{{ t('changelog.hero.title_line1', 'Changelog.') }}</span>
                    <span class="changelog-hero__title-line changelog-hero__title-line--accent">{{ t('changelog.hero.title_line2', 'Every release.') }}</span>
                </origam-title>

                <p class="changelog-hero__subtitle">
                    {{ t('changelog.hero.subtitle', 'A curated overview of what shipped in each version of origam. Dates are release dates; the full diff lives on GitHub.') }}
                </p>

                <nav
                    class="changelog-hero__actions"
                    :aria-label="t('changelog.hero.actions_label', 'Changelog links')"
                >
                    <origam-btn
                        class="changelog-hero__cta"
                        variant="text"
                        prepend-icon="mdi-file-document-outline"
                        :href="fullChangelogHref"
                        target="_blank"
                        rel="noopener noreferrer"
                        data-cy="changelog-full-link"
                    >
                        {{ t('changelog.hero.full_changelog', 'Full changelog on GitHub') }}
                    </origam-btn>
                </nav>
            </origam-container>
        </section>

        <section
            class="changelog-list"
            aria-labelledby="changelog-versions-title"
            data-cy="changelog-versions"
        >
            <origam-container>
                <header class="changelog-list__header">
                    <p class="changelog-section__eyebrow">
                        {{ t('changelog.list.eyebrow', 'RELEASE HISTORY') }}
                    </p>

                    <origam-title
                        id="changelog-versions-title"
                        tag="h2"
                        class="changelog-section__title"
                    >
                        <span class="changelog-section__title-line">{{ t('changelog.list.title_line1', 'All versions.') }}</span>
                        <span class="changelog-section__title-line changelog-section__title-line--muted">{{ t('changelog.list.title_line2', 'Curated.') }}</span>
                    </origam-title>

                    <p class="changelog-section__subtitle">
                        {{ t('changelog.list.subtitle', 'Pick a release to see exactly what shipped — the summary plus its key highlights.') }}
                    </p>
                </header>

                <div class="changelog-release">
                    <div class="changelog-release__control">
                        <origam-select
                            v-model="selectedVersion"
                            :items="versionSelectItems"
                            item-title="title"
                            item-value="value"
                            :label="t('changelog.select.label', 'Select a version')"
                            rounded="lg"
                            prepend-inner-icon="mdi-tag-outline"
                            class="changelog-release__select"
                            data-cy="changelog-version-select"
                        />
                    </div>

                    <article
                        :key="currentVersion.version"
                        class="changelog-release__card"
                        data-cy="changelog-release-card"
                    >
                        <header class="changelog-release__head">
                            <div class="changelog-release__head-main">
                                <origam-title
                                    tag="h3"
                                    class="changelog-release__version"
                                >
                                    {{ currentVersionLabel }}
                                </origam-title>

                                <origam-chip
                                    :color="typeColor(currentVersion.type)"
                                    size="small"
                                    pill
                                    class="changelog-release__type"
                                >
                                    {{ typeLabel(currentVersion.type) }}
                                </origam-chip>
                            </div>

                            <p
                                v-if="currentVersion.date"
                                class="changelog-release__date"
                            >
                                <time :datetime="currentVersion.date">{{ currentVersion.date }}</time>
                            </p>
                            <p
                                v-else
                                class="changelog-release__date changelog-release__date--unreleased"
                            >
                                {{ t('changelog.unreleased.label', 'Not yet released') }}
                            </p>
                        </header>

                        <p class="changelog-release__summary">
                            {{ t(currentVersion.summaryKey, currentVersion.summaryKey) }}
                        </p>

                        <origam-grid
                            tag="ul"
                            columns="1"
                            gap="0.75rem"
                            class="changelog-release__highlights"
                            :aria-label="t('changelog.aria.highlights', 'Release highlights')"
                        >
                            <origam-grid-item
                                v-for="highlight in currentVersion.highlights"
                                :key="highlight.textKey"
                                tag="li"
                                class="changelog-release__highlight"
                            >
                                <origam-chip
                                    :color="highlightColor(highlight.type)"
                                    size="x-small"
                                    pill
                                    class="changelog-release__highlight-badge"
                                    :prepend-icon="highlightIcon(highlight.type)"
                                >
                                    {{ highlightTypeLabel(highlight.type) }}
                                </origam-chip>

                                <span class="changelog-release__highlight-text">
                                    {{ t(highlight.textKey, highlight.textKey) }}
                                </span>
                            </origam-grid-item>
                        </origam-grid>

                        <nav
                            class="changelog-release__footer"
                            :aria-label="t('changelog.aria.version_links', 'Version links')"
                        >
                            <origam-btn
                                variant="text"
                                size="small"
                                prepend-icon="mdi-open-in-new"
                                :href="fullChangelogHref"
                                target="_blank"
                                rel="noopener noreferrer"
                                class="changelog-release__full-link"
                            >
                                {{ t('changelog.panel.full_link', 'Full changelog on GitHub') }}
                            </origam-btn>
                        </nav>
                    </article>
                </div>
            </origam-container>
        </section>

        <section
            class="changelog-cta"
            aria-labelledby="changelog-cta-title"
            data-cy="changelog-cta"
        >
            <div class="changelog-cta__inner">
                <origam-title
                    id="changelog-cta-title"
                    tag="h2"
                    class="changelog-cta__title"
                >
                    {{ t('changelog.cta.title', 'Stay in the loop.') }}
                </origam-title>

                <p class="changelog-cta__desc">
                    {{ t('changelog.cta.description', 'Watch the repository on GitHub to be notified of every new release.') }}
                </p>

                <nav
                    class="changelog-cta__actions"
                    :aria-label="t('changelog.cta.actions_label', 'Follow origam')"
                >
                    <origam-btn
                        class="changelog-cta__btn changelog-cta__btn--primary"
                        variant="text"
                        prepend-icon="mdi-github"
                        :href="MARKETING_DEFAULTS.githubRepo"
                        target="_blank"
                        rel="noopener noreferrer"
                        data-cy="changelog-cta-github"
                    >
                        {{ t('changelog.cta.cta_github', 'Star on GitHub') }}
                    </origam-btn>

                    <origam-btn
                        class="changelog-cta__btn changelog-cta__btn--secondary"
                        variant="text"
                        prepend-icon="mdi-file-document-outline"
                        :href="fullChangelogHref"
                        target="_blank"
                        rel="noopener noreferrer"
                        data-cy="changelog-cta-fulllog"
                    >
                        {{ t('changelog.cta.cta_fulllog', 'Read full CHANGELOG') }}
                    </origam-btn>
                </nav>
            </div>
        </section>
    </article>
</template>

<style scoped lang="scss">
.changelog {
    display: flex;
    flex-direction: column;
}

.changelog-section {
    &__eyebrow {
        margin: 0 0 var(--origam-space---3, 0.75rem);
        font-size: var(--origam-font-size---xs, 0.75rem);
        font-weight: var(--origam-font__weight---semibold, 600);
        color: var(--origam-color__action--primary---fgSubtle, #6d28d9);
        text-transform: uppercase;
        letter-spacing: 0.08em;
    }

    &__title {
        margin: 0 0 var(--origam-space---2, 0.5rem);
        display: flex;
        flex-direction: column;
        font-size: var(--origam-font-size---section, 3rem);
        font-weight: var(--origam-font__weight---bold, 700);
        letter-spacing: var(--origam-letter-spacing---tight, -0.03em);
        line-height: 1.05;
        color: var(--origam-color__text---primary, #0a0a0a);
    }

    &__title-line {
        &--muted {
            color: var(--origam-color__text---secondary, #525252);
        }
    }

    &__subtitle {
        margin: var(--origam-space---4, 1rem) 0 0;
        max-inline-size: 42rem;
        font-size: var(--origam-font-size---lg, 1.125rem);
        line-height: 1.65;
        color: var(--origam-color__text---secondary, #525252);
    }
}

.changelog-hero {
    position: relative;
    padding-block: var(--origam-space---20, 5rem) var(--origam-space---16, 4rem);
    overflow: hidden;

    &::before {
        content: '';
        position: absolute;
        inset: 0;
        background-image: var(--origam-gradient---hero-grid);
        background-size: 64px 64px;
        background-position: center top;
        -webkit-mask-image: linear-gradient(to bottom, #000 0%, transparent 80%);
        mask-image: linear-gradient(to bottom, #000 0%, transparent 80%);
        pointer-events: none;
        z-index: 0;
    }

    &::after {
        content: '';
        position: absolute;
        inset-inline: 0;
        inset-block-start: 0;
        block-size: 260px;
        background-image: var(--origam-gradient---hero-glow);
        pointer-events: none;
        z-index: 0;
    }

    &__inner {
        position: relative;
        z-index: 1;
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: var(--origam-space---6, 1.5rem);
        text-align: center;
    }

    &__badge {
        --origam-chip---background-color: transparent;
    }

    &__title {
        margin: 0;
        display: flex;
        flex-direction: column;
        align-items: center;
        font-size: var(--origam-font-size---hero, 5.25rem);
        font-weight: var(--origam-font-weight---extrabold, 800);
        line-height: var(--origam-line-height---hero, 0.95);
        letter-spacing: var(--origam-letter-spacing---hero, -0.045em);
        padding-block-end: 0.1em;
        color: var(--origam-color__text---ink, #0a0a0a);
    }

    &__title-line {
        display: block;

        &--accent {
            color: var(--origam-color__action--primary---fgSubtle, #6d28d9);
        }
    }

    &__subtitle {
        margin: 0;
        max-inline-size: 40rem;
        font-size: var(--origam-font-size---lg, 1.125rem);
        line-height: var(--origam-line-height---relaxed, 1.7);
        color: var(--origam-color__text---secondary, #525252);
    }

    &__actions {
        display: flex;
        flex-wrap: wrap;
        align-items: center;
        justify-content: center;
        gap: var(--origam-space---3, 0.75rem);
    }

    &__cta {
        --origam-btn---height: 44px;
        --origam-btn---border-radius: var(--origam-radius---btn, 10px);
    }
}

.changelog-list {
    padding-block: var(--origam-space---24, 6rem);
    background: var(--origam-color__surface---sunken, #f5f5f5);
    border-block: 1px solid var(--origam-color__border---default, rgba(0, 0, 0, 0.08));

    &__header {
        margin-block-end: var(--origam-space---10, 2.5rem);
    }
}

.changelog-release {
    max-inline-size: 56rem;
    display: flex;
    flex-direction: column;
    gap: var(--origam-space---8, 2rem);

    &__control {
        max-inline-size: 26rem;
    }

    &__card {
        display: flex;
        flex-direction: column;
        gap: var(--origam-space---6, 1.5rem);
        animation: changelog-release-in 0.28s ease;
    }

    &__head {
        display: flex;
        align-items: center;
        justify-content: space-between;
        flex-wrap: wrap;
        gap: var(--origam-space---4, 1rem);
        padding-block-end: var(--origam-space---5, 1.25rem);
        border-block-end: 1px solid var(--origam-color__border---default, rgba(0, 0, 0, 0.08));
    }

    &__head-main {
        display: flex;
        align-items: center;
        gap: var(--origam-space---3, 0.75rem);
    }

    &__version {
        margin: 0;
        font-size: var(--origam-font-size---3xl, 2rem);
        font-weight: var(--origam-font__weight---bold, 700);
        font-family: var(--origam-font-family---mono, monospace);
        letter-spacing: var(--origam-letter-spacing---tight, -0.02em);
        color: var(--origam-color__text---primary, #0a0a0a);
    }

    &__type {
        flex-shrink: 0;
    }

    &__date {
        margin: 0;
        font-size: var(--origam-font-size---sm, 0.875rem);
        color: var(--origam-color__text---secondary, #525252);
        font-family: var(--origam-font-family---mono, monospace);

        &--unreleased {
            font-style: italic;
        }
    }

    &__summary {
        margin: 0;
        font-size: var(--origam-font-size---lg, 1.125rem);
        line-height: 1.6;
        color: var(--origam-color__text---secondary, #525252);
    }

    &__highlights {
        list-style: none;
        padding: 0;
        margin: 0;
        display: flex;
        flex-direction: column;
        gap: var(--origam-space---3, 0.75rem);
    }

    &__highlight {
        list-style: none;
        display: flex;
        align-items: flex-start;
        gap: var(--origam-space---3, 0.75rem);
    }

    &__highlight-badge {
        flex-shrink: 0;
        margin-block-start: 2px;
    }

    &__highlight-text {
        font-size: var(--origam-font-size---base, 1rem);
        line-height: 1.6;
        color: var(--origam-color__text---primary, #0a0a0a);
    }

    &__footer {
        display: flex;
        padding-block-start: var(--origam-space---4, 1rem);
        border-block-start: 1px solid var(--origam-color__border---default, rgba(0, 0, 0, 0.08));
    }

    &__full-link {
        font-size: var(--origam-font-size---sm, 0.875rem);
    }
}

@keyframes changelog-release-in {
    from {
        opacity: 0;
        transform: translateY(6px);
    }

    to {
        opacity: 1;
        transform: none;
    }
}

@media (prefers-reduced-motion: reduce) {
    .changelog-release {
        &__card {
            animation: none;
        }
    }
}

.changelog-cta {
    position: relative;
    padding-block: var(--origam-space---30, 7.5rem);
    padding-inline: var(--origam-space---6, 1.5rem);
    overflow: hidden;

    &::before {
        content: '';
        position: absolute;
        inset-inline: 0;
        inset-block-start: 0;
        block-size: 280px;
        background-image: var(--origam-gradient---cta-glow-top);
        pointer-events: none;
        z-index: 0;
    }

    &__inner {
        position: relative;
        z-index: 1;
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: var(--origam-space---6, 1.5rem);
        max-inline-size: 48rem;
        margin-inline: auto;
        text-align: center;
    }

    &__title {
        margin: 0;
        font-size: var(--origam-font-size---cta, 4rem) !important;
        font-weight: var(--origam-font-weight---extrabold, 800);
        letter-spacing: var(--origam-letter-spacing---hero, -0.045em);
        line-height: var(--origam-line-height---hero, 0.95);
        color: var(--origam-color__text---ink, #0a0a0a);
    }

    &__desc {
        margin: 0;
        font-size: var(--origam-font-size---lg, 1.125rem);
        color: var(--origam-color__text---secondary, #525252);
        max-inline-size: 36rem;
    }

    &__actions {
        display: flex;
        flex-wrap: wrap;
        align-items: center;
        justify-content: center;
        gap: var(--origam-space---3, 0.75rem);
        margin-block-start: var(--origam-space---2, 0.5rem);
    }

    &__btn {
        --origam-btn---height: 52px;
        --origam-btn---density: 0px;
        --origam-btn---density-padding-x: var(--origam-space---6, 1.5rem);
        --origam-btn---font-size: 1rem;
        --origam-btn---font-weight: 400;
        --origam-btn---border-radius: var(--origam-radius---btn, 10px);

        &--primary {
            background-image: var(--origam-gradient---btn-primary);
            background-color: var(--origam-color---btn-primary-bg, transparent);
            box-shadow: var(--origam-shadow---btn-primary);
            --origam-btn---color: var(--origam-color---btn-primary-text);
        }

        &--secondary {
            background-image: var(--origam-gradient---btn-secondary);
            background-color: var(--origam-color---btn-secondary-bg);
            box-shadow: var(--origam-shadow---btn-secondary);
            border: 1px solid var(--origam-color---btn-secondary-border);
            --origam-btn---color: var(--origam-color---btn-secondary-text);
            --origam-btn---density-padding-x: var(--origam-space---4, 1rem);
        }
    }
}

@media (max-width: 1080px) {
    .changelog-hero {
        &__title {
            font-size: clamp(2.5rem, 9vw, 5.25rem);
        }
    }
}

@media (max-width: 768px) {
    .changelog-section {
        &__title {
            font-size: clamp(1.75rem, 7vw, 3rem);
        }
    }

    .changelog-cta {
        &__title {
            font-size: clamp(2rem, 8vw, 4rem) !important;
        }
    }
}
</style>
