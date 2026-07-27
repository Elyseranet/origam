<script setup lang="ts">
import { computed, ref } from 'vue'
import { useT } from '~/composables/useT'
import { useReferenceCatalog, useReferenceCategories } from '~/composables/useApiReference'
import type { IComponentEntry } from '~/interfaces/components-catalog.interface'

const { t } = useT()

useSeoMeta({
    title: () => t('components.meta.title', 'Components · origam design system'),
    description: () => t('components.meta.description', 'Browse 95+ accessible, token-driven Vue 3 components grouped by category. Click any component to see its API, props, emits, slots and live examples.'),
    ogTitle: () => t('components.meta.title', 'Components · origam design system'),
    ogDescription: () => t('components.meta.description', 'Browse 95+ accessible, token-driven Vue 3 components grouped by category.')
})

const { data: catalogData } = await useReferenceCatalog<IComponentEntry>('component')
const componentsCatalog = computed<IComponentEntry[]>(() => catalogData.value ?? [])

const { data: catsData } = await useReferenceCategories('component')
const componentsCategories = computed<string[]>(() => catsData.value ?? [])

const searchQuery = ref('')

const topLevelEntries = computed(() =>
    componentsCatalog.value.filter(entry => !entry.parentSlug)
)

const filteredEntries = computed(() => {
    const query = searchQuery.value.toLowerCase().trim()
    if (!query) return topLevelEntries.value
    return topLevelEntries.value.filter(entry => {
        const nameMatch = entry.name.toLowerCase().includes(query)
        const categoryMatch = entry.category.toLowerCase().includes(query)
        const descMatch = entry.descriptionFallback.toLowerCase().includes(query)
        const familyMatch = entry.family.some(m => m.name.toLowerCase().includes(query))
        return nameMatch || categoryMatch || descMatch || familyMatch
    })
})

const groupedByCategory = computed(() => {
    return componentsCategories.value.map(category => ({
        category,
        entries: filteredEntries.value.filter(e => e.category === category)
    })).filter(group => group.entries.length > 0)
})

const totalCount = computed(() => topLevelEntries.value.length)
const filteredCount = computed(() => filteredEntries.value.length)
const isFiltering = computed(() => searchQuery.value.trim().length > 0)
</script>

<template>
    <article
        class="components-catalog"
        data-cy="page-components"
    >
        <section
            class="components-hero"
            aria-labelledby="components-title"
        >
            <origam-container class="components-hero__inner">
                <origam-chip
                    class="components-hero__badge"
                    color="primary"
                    border
                    border-color="var(--origam-color__action--primary---bg)"
                    size="small"
                    pill
                    data-cy="components-hero-badge"
                >
                    {{ t('components.hero.badge', '95+ components — Vue 3') }}
                </origam-chip>

                <origam-title
                    id="components-title"
                    tag="h1"
                    class="components-hero__title"
                >
                    <span class="components-hero__title-line">{{ t('components.hero.title_line1', 'Component') }}</span>
                    <span class="components-hero__title-line components-hero__title-line--accent">{{ t('components.hero.title_line2', 'catalogue.') }}</span>
                </origam-title>

                <p class="components-hero__subtitle">
                    {{ t('components.hero.subtitle', 'Every component in origam is accessible, token-driven and themeable. Explore them by category, read the API and see them in action.') }}
                </p>

                <origam-text-field
                    v-model="searchQuery"
                    class="components-hero__search"
                    prepend-inner-icon="mdi-magnify"
                    :placeholder="t('components.hero.search_placeholder', 'Search components…')"
                    :aria-label="t('components.hero.search_label', 'Filter components by name or category')"
                    clearable
                    rounded="lg"
                    variant="outlined"
                    data-cy="components-search"
                />

                <p
                    class="components-hero__count"
                    aria-live="polite"
                    aria-atomic="true"
                >
                    <template v-if="isFiltering">
                        {{ filteredCount }} {{ t('components.hero.count_filtered_of', 'of') }} {{ totalCount }} {{ t('components.hero.count_filtered_match', 'components match') }}
                    </template>
                    <template v-else>
                        {{ totalCount }} {{ t('components.hero.count_families', 'component families across') }} {{ componentsCategories.length }} {{ t('components.hero.count_categories', 'categories') }}
                    </template>
                </p>
            </origam-container>
        </section>

        <section
            class="components-grid-section"
            aria-labelledby="components-grid-title"
            data-cy="components-grid"
        >
            <origam-container>
                <header class="components-grid-section__header">
                    <p class="components-section__eyebrow">
                        {{ t('components.catalog.eyebrow', 'BROWSE BY CATEGORY') }}
                    </p>

                    <origam-title
                        id="components-grid-title"
                        tag="h2"
                        class="components-section__title components-section__title--single"
                    >
                        {{ t('components.catalog.title', 'All components.') }}
                    </origam-title>
                </header>

                <div
                    v-if="isFiltering && filteredCount === 0"
                    class="components-empty"
                    role="status"
                    data-cy="components-empty"
                >
                    <origam-icon
                        icon="mdi-magnify-remove-outline"
                        class="components-empty__icon"
                        aria-hidden="true"
                    />

                    <origam-title
                        tag="h3"
                        class="components-empty__title"
                    >
                        {{ t('components.catalog.empty_title', 'No components found') }}
                    </origam-title>

                    <p class="components-empty__desc">
                        {{ t('components.catalog.empty_desc', 'No component matches "{query}". Try a different term.', { query: searchQuery }) }}
                    </p>
                </div>

                <div
                    v-for="group in groupedByCategory"
                    :key="group.category"
                    class="components-category"
                    :data-cy="`components-category-${group.category.toLowerCase().replace(/[^a-z0-9]/g, '-')}`"
                >
                    <header class="components-category__header">
                        <origam-title
                            tag="h3"
                            class="components-category__title"
                        >
                            {{ group.category }}
                        </origam-title>

                        <origam-chip
                            size="small"
                            pill
                            class="components-category__count-chip"
                        >
                            {{ group.entries.length }}
                        </origam-chip>
                    </header>

                    <origam-grid
                        tag="ul"
                        columns="repeat(auto-fill, minmax(240px, 1fr))"
                        gap="1rem"
                        class="components-category__grid"
                    >
                        <origam-grid-item
                            v-for="entry in group.entries"
                            :key="entry.slug"
                            tag="li"
                            class="components-catalog-item"
                        >
                            <nuxt-link
                                :to="`/components/${entry.slug}`"
                                class="components-catalog-card__link"
                                :aria-label="`${entry.name} — ${t(entry.descriptionKey, entry.descriptionFallback)}`"
                                :data-cy="`components-card-${entry.slug}`"
                            >
                            <origam-card
                                rounded="lg"
                                class="components-catalog-card"
                            >
                                <template #default>
                                    <div class="components-catalog-card__inner">
                                        <div class="components-catalog-card__header">
                                            <origam-avatar
                                                :icon="entry.icon"
                                                color="primary"
                                                rounded="lg"
                                                size="40"
                                                class="components-catalog-card__avatar"
                                                aria-hidden="true"
                                            />

                                            <origam-title
                                                tag="h4"
                                                class="components-catalog-card__name"
                                            >
                                                {{ entry.name }}
                                            </origam-title>

                                            <origam-icon
                                                v-if="entry.family.length > 0"
                                                icon="mdi-family-tree"
                                                size="16"
                                                class="components-catalog-card__family-icon"
                                                aria-hidden="true"
                                            />
                                        </div>

                                        <p class="components-catalog-card__desc">
                                            {{ t(entry.descriptionKey, entry.descriptionFallback) }}
                                        </p>

                                        <div
                                            v-if="entry.family.length > 0"
                                            class="components-catalog-card__family-tags"
                                        >
                                            <origam-chip
                                                v-for="member in entry.family.slice(0, 3)"
                                                :key="member.slug"
                                                size="x-small"
                                                pill
                                                class="components-catalog-card__family-chip"
                                            >
                                                {{ member.name }}
                                            </origam-chip>

                                            <origam-chip
                                                v-if="entry.family.length > 3"
                                                size="x-small"
                                                pill
                                                class="components-catalog-card__family-chip components-catalog-card__family-chip--more"
                                            >
                                                +{{ entry.family.length - 3 }}
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
.components-catalog {
    display: flex;
    flex-direction: column;
}

.components-section {
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

        @media (max-width: 768px) {
            font-size: clamp(1.75rem, 7vw, 3rem);
        }

        &--single {
            display: block;
        }
    }
}

.components-hero {
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

        @media (max-width: 1080px) {
            font-size: clamp(2.5rem, 9vw, 5.25rem);
        }
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

.components-grid-section {
    padding-block: var(--origam-space---16, 4rem) var(--origam-space---24, 6rem);

    &__header {
        margin-block-end: var(--origam-space---12, 3rem);
    }
}

.components-empty {
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

.components-category {
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

        @media (max-width: 640px) {
            grid-template-columns: 1fr;
        }
    }
}

.components-catalog-item {
    list-style: none;
    display: flex;
    flex-direction: column;
}

.components-catalog-card {
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

        &:hover .components-catalog-card {
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

    &__family-icon {
        flex-shrink: 0;
        color: var(--origam-color__text---tertiary, #737373);
    }

    &__desc {
        margin: 0;
        font-size: var(--origam-font-size---sm, 0.875rem);
        line-height: 1.55;
        color: var(--origam-color__text---secondary, #525252);
        flex: 1;
    }

    &__family-tags {
        display: flex;
        flex-wrap: wrap;
        gap: var(--origam-space---1, 0.25rem);
        margin-block-start: auto;
    }

    &__family-chip {
        --origam-chip---background-color: var(--origam-color__surface---sunken, #f5f5f5);
        font-family: var(--origam-font-family---mono, monospace);

        &--more {
            --origam-chip---background-color: var(--origam-color__action--primary---bgSubtle, #ede9fe);
            color: var(--origam-color__action--primary---fgSubtle, #6d28d9);
        }
    }
}
</style>
