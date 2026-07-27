<script setup lang="ts">
import { computed, ref } from 'vue'
import { useT } from '~/composables/useT'
import { useReferenceCatalog, useReferenceCategories } from '~/composables/useApiReference'
import type { IUtilEntry } from '~/interfaces/utils-catalog.interface'

const { t } = useT()

useSeoMeta({
    title: () => t('utils.meta.title', 'Utils · origam design system'),
    description: () => t('utils.meta.description', 'Browse the origam utility helpers grouped by category. Each exposes a documented signature, parameters, return value and usage examples.'),
    ogTitle: () => t('utils.meta.title', 'Utils · origam design system'),
    ogDescription: () => t('utils.meta.description', 'Utility helpers used across the origam design system.')
})

const { data: catalogData } = await useReferenceCatalog<IUtilEntry>('util')

const utilsCatalog = computed<IUtilEntry[]>(() => catalogData.value ?? [])

const { data: catsData } = await useReferenceCategories('util')
const utilsCategories = computed<string[]>(() => catsData.value ?? [])

const searchQuery = ref('')

const filteredEntries = computed(() => {
    const query = searchQuery.value.toLowerCase().trim()
    if (!query) return utilsCatalog.value
    return utilsCatalog.value.filter(entry => {
        const nameMatch = entry.name.toLowerCase().includes(query)
        const categoryMatch = entry.category.toLowerCase().includes(query)
        const descMatch = entry.descriptionFallback.toLowerCase().includes(query)
        return nameMatch || categoryMatch || descMatch
    })
})

const groupedByCategory = computed(() =>
    utilsCategories.value.map(category => ({
        category,
        entries: filteredEntries.value.filter(e => e.category === category),
    })).filter(g => g.entries.length > 0)
)

const totalCount = computed(() => utilsCatalog.value.length)
const filteredCount = computed(() => filteredEntries.value.length)
const isFiltering = computed(() => searchQuery.value.trim().length > 0)
</script>

<template>
    <article
        class="utils-catalog"
        data-cy="page-utils"
    >
        <section
            class="utils-hero"
            aria-labelledby="utils-title"
        >
            <origam-container class="utils-hero__inner">
                <origam-chip
                    class="utils-hero__badge"
                    color="primary"
                    border
                    border-color="var(--origam-color__action--primary---bg)"
                    size="small"
                    pill
                    data-cy="utils-hero-badge"
                >
                    {{ t('utils.hero.badge', 'Utility helpers — TypeScript') }}
                </origam-chip>

                <origam-title
                    id="utils-title"
                    tag="h1"
                    class="utils-hero__title"
                >
                    <span class="utils-hero__title-line">{{ t('utils.hero.title_line1', 'Util') }}</span>
                    <span class="utils-hero__title-line utils-hero__title-line--accent">{{ t('utils.hero.title_line2', 'catalogue.') }}</span>
                </origam-title>

                <p class="utils-hero__subtitle">
                    {{ t('utils.hero.subtitle', 'Every origam utility helper is documented with its real TypeScript signature, parameters and return value — sourced directly from the DS source code.') }}
                </p>

                <origam-text-field
                    v-model="searchQuery"
                    class="utils-hero__search"
                    prepend-inner-icon="mdi-magnify"
                    :placeholder="t('utils.hero.search_placeholder', 'Search utils…')"
                    :aria-label="t('utils.hero.search_label', 'Filter utils by name or category')"
                    clearable
                    rounded="lg"
                    variant="outlined"
                    data-cy="utils-search"
                />

                <p
                    class="utils-hero__count"
                    aria-live="polite"
                    aria-atomic="true"
                >
                    <template v-if="isFiltering">
                        {{ filteredCount }} {{ t('utils.hero.count_filtered_of', 'of') }} {{ totalCount }} {{ t('utils.hero.count_filtered_match', 'utils match') }}
                    </template>
                    <template v-else>
                        {{ totalCount }} {{ t('utils.hero.count_total', 'utils across') }} {{ utilsCategories.length }} {{ t('utils.hero.count_categories', 'categories') }}
                    </template>
                </p>
            </origam-container>
        </section>

        <section
            class="utils-grid-section"
            aria-labelledby="utils-grid-title"
            data-cy="utils-grid"
        >
            <origam-container>
                <header class="utils-grid-section__header">
                    <p class="utils-section__eyebrow">
                        {{ t('utils.catalog.eyebrow', 'BROWSE BY CATEGORY') }}
                    </p>

                    <origam-title
                        id="utils-grid-title"
                        tag="h2"
                        class="utils-section__title utils-section__title--single"
                    >
                        {{ t('utils.catalog.title', 'All utils.') }}
                    </origam-title>
                </header>

                <div
                    v-if="isFiltering && filteredCount === 0"
                    class="utils-empty"
                    role="status"
                    data-cy="utils-empty"
                >
                    <origam-icon
                        icon="mdi-magnify-remove-outline"
                        class="utils-empty__icon"
                        aria-hidden="true"
                    />

                    <origam-title
                        tag="h3"
                        class="utils-empty__title"
                    >
                        {{ t('utils.catalog.empty_title', 'No utils found') }}
                    </origam-title>

                    <p class="utils-empty__desc">
                        {{ t('utils.catalog.empty_desc', 'No util matches "{query}". Try a different term.', { query: searchQuery }) }}
                    </p>
                </div>

                <div
                    v-for="group in groupedByCategory"
                    :key="group.category"
                    class="utils-category"
                    :data-cy="`utils-category-${group.category.toLowerCase().replace(/[^a-z0-9]/g, '-')}`"
                >
                    <header class="utils-category__header">
                        <origam-title
                            tag="h3"
                            class="utils-category__title"
                        >
                            {{ group.category }}
                        </origam-title>

                        <origam-chip
                            size="small"
                            pill
                            class="utils-category__count-chip"
                        >
                            {{ group.entries.length }}
                        </origam-chip>
                    </header>

                    <origam-grid
                        tag="ul"
                        columns="repeat(auto-fill, minmax(240px, 1fr))"
                        gap="1rem"
                        class="utils-category__grid"
                    >
                        <origam-grid-item
                            v-for="entry in group.entries"
                            :key="entry.slug"
                            tag="li"
                            class="utils-catalog-item"
                        >
                            <nuxt-link
                                :to="`/utils/${entry.slug}`"
                                class="utils-catalog-card__link"
                                :aria-label="`${entry.name} — ${entry.descriptionFallback}`"
                                :data-cy="`utils-card-${entry.slug}`"
                            >
                                <origam-card
                                    rounded="lg"
                                    class="utils-catalog-card"
                                >
                                    <template #default>
                                        <div class="utils-catalog-card__inner">
                                            <div class="utils-catalog-card__header">
                                                <origam-avatar
                                                    :icon="entry.icon"
                                                    color="primary"
                                                    rounded="lg"
                                                    size="40"
                                                    class="utils-catalog-card__avatar"
                                                    aria-hidden="true"
                                                />

                                                <origam-title
                                                    tag="h4"
                                                    class="utils-catalog-card__name"
                                                >
                                                    {{ entry.name }}
                                                </origam-title>
                                            </div>

                                            <p class="utils-catalog-card__desc">
                                                {{ entry.descriptionFallback }}
                                            </p>

                                            <div
                                                v-if="entry.related.length > 0"
                                                class="utils-catalog-card__related-tags"
                                            >
                                                <origam-chip
                                                    v-for="relSlug in entry.related.slice(0, 2)"
                                                    :key="relSlug"
                                                    size="x-small"
                                                    pill
                                                    class="utils-catalog-card__related-chip"
                                                >
                                                    {{ relSlug }}
                                                </origam-chip>

                                                <origam-chip
                                                    v-if="entry.related.length > 2"
                                                    size="x-small"
                                                    pill
                                                    class="utils-catalog-card__related-chip utils-catalog-card__related-chip--more"
                                                >
                                                    +{{ entry.related.length - 2 }}
                                                </origam-chip>
                                            </div>
                                        </div>
                                    </template>
                                </origam-card>
                            </nuxt-link>
                        </origam-grid-item>
                    </origam-grid>
                </div>
            </origam-container>
        </section>
    </article>
</template>

<style scoped lang="scss">
.utils-catalog {
    display: flex;
    flex-direction: column;
}

.utils-section {
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

        &--single {
            display: block;
        }
    }
}

.utils-hero {
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
        block-size: 100%;
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

    &__search {
        inline-size: 100%;
        max-inline-size: 36rem;
        --origam-field---background: var(--origam-color__surface---default, #ffffff);
    }

    &__count {
        margin: 0;
        font-size: var(--origam-font-size---sm, 0.875rem);
        color: var(--origam-color__text---tertiary, #737373);
    }
}

.utils-grid-section {
    padding-block: var(--origam-space---16, 4rem) var(--origam-space---24, 6rem);

    &__header {
        margin-block-end: var(--origam-space---12, 3rem);
    }
}

.utils-empty {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: var(--origam-space---4, 1rem);
    padding-block: var(--origam-space---16, 4rem);
    text-align: center;

    &__icon {
        font-size: 3rem;
        color: var(--origam-color__text---tertiary, #737373);
    }

    &__title {
        display: block;
        font-size: var(--origam-font-size---lg, 1.125rem);
        font-weight: var(--origam-font__weight---semibold, 600);
        color: var(--origam-color__text---primary, #0a0a0a);
        margin: 0;
    }

    &__desc {
        margin: 0;
        font-size: var(--origam-font-size---base, 1rem);
        color: var(--origam-color__text---secondary, #525252);
    }
}

.utils-category {
    margin-block-end: var(--origam-space---16, 4rem);

    &:last-child {
        margin-block-end: 0;
    }

    &__header {
        display: flex;
        align-items: center;
        gap: var(--origam-space---3, 0.75rem);
        margin-block-end: var(--origam-space---6, 1.5rem);
        padding-block-end: var(--origam-space---3, 0.75rem);
        border-block-end: 1px solid var(--origam-color__border---default, rgba(0, 0, 0, 0.08));
    }

    &__title {
        display: block;
        font-size: var(--origam-font-size---lg, 1.125rem);
        font-weight: var(--origam-font__weight---semibold, 600);
        color: var(--origam-color__text---primary, #0a0a0a);
        margin: 0;
    }

    &__count-chip {
        --origam-chip---background-color: var(--origam-color__surface---sunken, #f5f5f5);
    }

    &__grid {
        list-style: none;
        padding: 0;
        margin: 0;
    }
}

.utils-catalog-item {
    list-style: none;
    display: flex;
    flex-direction: column;
}

.utils-catalog-card {
    block-size: 100%;
    transition: transform 0.15s ease, box-shadow 0.15s ease;
    display: flex;
    flex-direction: column;

    &__link {
        display: flex;
        flex-direction: column;
        block-size: 100%;
        text-decoration: none;
        color: inherit;
        border-radius: var(--origam-radius---lg, 12px);

        &:hover .utils-catalog-card {
            transform: translateY(-2px);
            box-shadow: var(--origam-shadow---md, 0 4px 12px rgba(0, 0, 0, 0.1));
        }

        &:focus-visible {
            outline: 2px solid var(--origam-color__action--primary---bg, #7c3aed);
            outline-offset: 2px;
        }
    }

    &__inner {
        padding: var(--origam-space---4, 1rem);
        display: flex;
        flex-direction: column;
        gap: var(--origam-space---3, 0.75rem);
        block-size: 100%;
    }

    &__header {
        display: flex;
        align-items: center;
        gap: var(--origam-space---3, 0.75rem);
    }

    &__avatar {
        flex-shrink: 0;
    }

    &__name {
        display: block;
        flex: 1;
        font-size: var(--origam-font-size---base, 1rem);
        font-weight: var(--origam-font__weight---semibold, 600);
        font-family: var(--origam-font-family---mono, monospace);
        color: var(--origam-color__text---primary, #0a0a0a);
        margin: 0;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
    }

    &__desc {
        margin: 0;
        font-size: var(--origam-font-size---sm, 0.875rem);
        line-height: 1.55;
        color: var(--origam-color__text---secondary, #525252);
        flex: 1;
    }

    &__related-tags {
        display: flex;
        flex-wrap: wrap;
        gap: var(--origam-space---1, 0.25rem);
        margin-block-start: auto;
    }

    &__related-chip {
        --origam-chip---background-color: var(--origam-color__surface---sunken, #f5f5f5);
        font-family: var(--origam-font-family---mono, monospace);

        &--more {
            --origam-chip---background-color: var(--origam-color__action--primary---bgSubtle, #ede9fe);
            color: var(--origam-color__action--primary---fgSubtle, #6d28d9);
        }
    }
}

@media (max-width: 1080px) {
    .utils-hero__title {
        font-size: clamp(2.5rem, 9vw, 5.25rem);
    }
}

@media (max-width: 768px) {
    .utils-section__title {
        font-size: clamp(1.75rem, 7vw, 3rem);
    }
}

@media (max-width: 640px) {
    .utils-category__grid {
        grid-template-columns: 1fr;
    }
}
</style>
