<template>
  <article
    class="changelog"
    data-cy="page-changelog"
  >
    <enso-page-header
      family="editorial"
      title-id="changelog-title"
    >
      <template #breadcrumb>
        <origam-breadcrumb
          :items="breadcrumbItems"
          divider="/"
          :border="0"
          data-cy="changelog-breadcrumb"
        />
      </template>

      <template #eyebrow>
        <span data-cy="changelog-hero-badge">{{ t('changelog.hero.badge', 'Changelog') }}</span>
      </template>

      <template #title>
        {{ t('changelog.hero.title_line1', 'Changelog.') }}
        {{ t('changelog.hero.title_line2', 'Every release.') }}
      </template>

      <template #intro>
        {{ t('changelog.hero.subtitle', 'A curated overview of what shipped in each version of origam. Dates are release dates; the full diff lives on GitHub.') }}
      </template>

      <template #default>
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
      </template>
    </enso-page-header>

    <section
      class="changelog-intro"
      aria-labelledby="changelog-versions-title"
      data-cy="changelog-versions"
    >
      <origam-container class="home-container">
        <header class="changelog-section">
          <p class="home-eyebrow">
            {{ t('changelog.list.eyebrow', 'RELEASE HISTORY') }}
          </p>

          <origam-title
            id="changelog-versions-title"
            tag="h2"
            class="changelog-section__title"
          >
            {{ t('changelog.list.title_line1', 'All versions.') }}
            {{ t('changelog.list.title_line2', 'Curated.') }}
          </origam-title>

          <p class="changelog-section__subtitle">
            {{ t('changelog.list.subtitle', 'Pick a release to see exactly what shipped — the summary plus its key highlights.') }}
          </p>
        </header>

        <div class="changelog-intro__control">
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
      </origam-container>
    </section>

    <section
      class="changelog-list"
      aria-labelledby="changelog-versions-title"
    >
      <origam-container class="home-container">
        <div class="changelog-release">

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
              {{ t(currentVersion.summaryKey, currentVersion.summaryFallback) }}
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
                                    {{ t(highlight.textKey, highlight.textFallback) }}
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

    <home-cta
      surface="overlay"
      title-id="changelog-cta-title"
      :title="t('changelog.cta.title', 'Stay in the loop.')"
      :description="t('changelog.cta.description', 'Watch the repository on GitHub to be notified of every new release.')"
      :actions-label="t('changelog.cta.actions_label', 'Follow origam')"
      :actions="CHANGELOG_CTA_ACTIONS"
      data-cy="changelog-cta"
    />
  </article>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { useT } from '~/composables/useT'
import {
    CHANGELOG_VERSIONS,
    CHANGELOG_TYPE_COLOR,
    CHANGELOG_HIGHLIGHT_COLOR,
    CHANGELOG_HIGHLIGHT_ICON
} from '~/consts/changelog.const'
import { CHANGELOG_CTA_ACTIONS, EDITORIAL_CHANGELOG_HREF } from '~/consts/editorial-cta.const'
import { useLocaleHref } from '~/composables/useLocaleHref'

const { t } = useT()
const { localeHref } = useLocaleHref()

const breadcrumbItems = computed(() => [
    { title: t('nav.home', 'Home'), to: localeHref('/') },
    { title: t('nav.sections.introduction', 'Introduction') },
    { title: t('nav.changelog', 'Changelog') }
])

useSeoMeta({
    title: () => t('changelog.meta.title', 'Changelog · origam design system'),
    description: () => t('changelog.meta.description', 'Every release of the origam design system, curated and accessible in one place.'),
    ogTitle: () => t('changelog.meta.title', 'Changelog · origam design system'),
    ogDescription: () => t('changelog.meta.description', 'Every release of the origam design system, curated and accessible in one place.')
})

const versions = computed(() => CHANGELOG_VERSIONS)
const fullChangelogHref = EDITORIAL_CHANGELOG_HREF

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

<style scoped lang="scss">
@use '../assets/scss/editorial';

.changelog {
    @include editorial.editorial-page;
}

.changelog-section {
    @include editorial.editorial-header;
}

.changelog-hero {
    &__actions {
        display: flex;
        flex-wrap: wrap;
        align-items: center;
        gap: var(--origam-space---3, 0.75rem);
    }
}

.changelog-intro {
    @include editorial.editorial-section(default, 40px, 120px, $wash: false);

    &__control {
        max-inline-size: 26rem;
    }
}

.changelog-list {
    @include editorial.editorial-section(overlay, 40px, 120px);
}

.changelog-release {
    max-inline-size: 56rem;
    display: flex;
    flex-direction: column;
    gap: var(--origam-space---8, 2rem);

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
        font-family: var(--origam-font__family---mono, monospace);
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
        font-family: var(--origam-font__family---mono, monospace);

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
        font-size: var(--origam-font__size---lg, 1rem);
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
</style>
