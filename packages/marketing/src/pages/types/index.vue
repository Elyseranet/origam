<script setup lang="ts">
import { computed, ref } from 'vue'
import { useT } from '~/composables/useT'
import { useReferenceCatalog, useReferenceCategories } from '~/composables/useApiReference'
import type { ITypeEntry } from '~/interfaces/types-catalog.interface'

const { t } = useT()

useSeoMeta({
    title: () => t('types.meta.title', 'API Types · origam design system'),
    description: () => t('types.meta.description', 'Browse TypeScript types and enums used across origam props. Click any type to see its definition, values and the components that use it.'),
    ogTitle: () => t('types.meta.title', 'API Types · origam design system'),
    ogDescription: () => t('types.meta.description', 'TypeScript types and enums used across origam props.')
})

const { data: catalogData } = await useReferenceCatalog<ITypeEntry>('type')

const typesCatalog = computed<ITypeEntry[]>(() => catalogData.value ?? [])

const { data: catsData } = await useReferenceCategories('type')
const typesCategories = computed<string[]>(() => catsData.value ?? [])

const searchQuery = ref('')

const filteredEntries = computed(() => {
    const query = searchQuery.value.toLowerCase().trim()
    if (!query) return typesCatalog.value
    return typesCatalog.value.filter(entry => {
        const nameMatch = entry.name.toLowerCase().includes(query)
        const categoryMatch = entry.category.toLowerCase().includes(query)
        const descMatch = entry.descriptionFallback.toLowerCase().includes(query)
        const kindMatch = entry.kind.toLowerCase().includes(query)
        return nameMatch || categoryMatch || descMatch || kindMatch
    })
})

const groupedByCategory = computed(() =>
    typesCategories.value.map(category => ({
        category,
        entries: filteredEntries.value.filter(e => e.category === category)
    })).filter(group => group.entries.length > 0)
)

const totalCount = computed(() => typesCatalog.value.length)
const filteredCount = computed(() => filteredEntries.value.length)
const isFiltering = computed(() => searchQuery.value.trim().length > 0)
</script>

<template>
    <article
        class="types-catalog"
        data-cy="page-types"
    >
        <section
            class="types-hero"
            aria-labelledby="types-title"
        >
            <origam-container class="types-hero__inner">
                <origam-chip
                    class="types-hero__badge"
                    color="primary"
                    border
                    border-color="var(--origam-color__action--primary---bg)"
                    size="small"
                    pill
                    data-cy="types-hero-badge"
                >
                    {{ t('types.hero.badge', 'TypeScript types & enums') }}
                </origam-chip>

                <origam-title
                    id="types-title"
                    tag="h1"
                    class="types-hero__title"
                >
                    <span class="types-hero__title-line">{{ t('types.hero.title_line1', 'API') }}</span>
                    <span class="types-hero__title-line types-hero__title-line--accent">{{ t('types.hero.title_line2', 'types.') }}</span>
                </origam-title>

                <p class="types-hero__subtitle">
                    {{ t('types.hero.subtitle', 'Every TypeScript type and enum used across origam props. Fully documented with definitions, accepted values and cross-references to the components that use them.') }}
                </p>

                <origam-text-field
                    v-model="searchQuery"
                    class="types-hero__search"
                    prepend-inner-icon="mdi-magnify"
                    :placeholder="t('types.hero.search_placeholder', 'Search types…')"
                    :aria-label="t('types.hero.search_label', 'Filter types by name or category')"
                    clearable
                    rounded="lg"
                    variant="outlined"
                    data-cy="types-search"
                />

                <p
                    class="types-hero__count"
                    aria-live="polite"
                    aria-atomic="true"
                >
                    <template v-if="isFiltering">
                        {{ filteredCount }} {{ t('types.hero.count_filtered_of', 'of') }} {{ totalCount }} {{ t('types.hero.count_filtered_match', 'types match') }}
                    </template>
                    <template v-else>
                        {{ totalCount }} {{ t('types.hero.count_total', 'types and enums across') }} {{ typesCategories.length }} {{ t('types.hero.count_categories', 'categories') }}
                    </template>
                </p>
            </origam-container>
        </section>

        <section
            class="types-grid-section"
            aria-labelledby="types-grid-title"
            data-cy="types-grid"
        >
            <origam-container>
                <header class="types-grid-section__header">
                    <p class="types-section__eyebrow">
                        {{ t('types.catalog.eyebrow', 'BROWSE BY CATEGORY') }}
                    </p>

                    <origam-title
                        id="types-grid-title"
                        tag="h2"
                        class="types-section__title types-section__title--single"
                    >
                        {{ t('types.catalog.title', 'All types.') }}
                    </origam-title>
                </header>

                <div
                    v-if="isFiltering && filteredCount === 0"
                    class="types-empty"
                    role="status"
                    data-cy="types-empty"
                >
                    <origam-icon
                        icon="mdi-magnify-remove-outline"
                        class="types-empty__icon"
                        aria-hidden="true"
                    />

                    <origam-title
                        tag="h3"
                        class="types-empty__title"
                    >
                        {{ t('types.catalog.empty_title', 'No types found') }}
                    </origam-title>

                    <p class="types-empty__desc">
                        {{ t('types.catalog.empty_desc', 'No type matches "{query}". Try a different term.', { query: searchQuery }) }}
                    </p>
                </div>

                <div
                    v-for="group in groupedByCategory"
                    :key="group.category"
                    class="types-category"
                    :data-cy="`types-category-${group.category.toLowerCase().replace(/[^a-z0-9]/g, '-')}`"
                >
                    <header class="types-category__header">
                        <origam-title
                            tag="h3"
                            class="types-category__title"
                        >
                            {{ group.category }}
                        </origam-title>

                        <origam-chip
                            size="small"
                            pill
                            class="types-category__count-chip"
                        >
                            {{ group.entries.length }}
                        </origam-chip>
                    </header>

                    <origam-grid
                        tag="ul"
                        columns="repeat(auto-fill, minmax(240px, 1fr))"
                        gap="1rem"
                        class="types-category__grid"
                    >
                        <origam-grid-item
                            v-for="entry in group.entries"
                            :key="entry.slug"
                            tag="li"
                            class="types-catalog-item"
                        >
                            <nuxt-link
                                :to="`/types/${entry.slug}`"
                                class="types-catalog-card__link"
                                :aria-label="`${entry.name} — ${t(entry.descriptionKey, entry.descriptionFallback)}`"
                                :data-cy="`types-card-${entry.slug}`"
                            >
                                <origam-card
                                    rounded="lg"
                                    class="types-catalog-card"
                                >
                                    <template #default>
                                        <div class="types-catalog-card__inner">
                                            <div class="types-catalog-card__header">
                                                <origam-avatar
                                                    :icon="entry.icon"
                                                    :color="entry.kind === 'enum' ? 'secondary' : 'primary'"
                                                    rounded="lg"
                                                    size="40"
                                                    class="types-catalog-card__avatar"
                                                    aria-hidden="true"
                                                />

                                                <origam-title
                                                    tag="h4"
                                                    class="types-catalog-card__name"
                                                >
                                                    {{ entry.name }}
                                                </origam-title>

                                                <origam-chip
                                                    :color="entry.kind === 'enum' ? 'secondary' : 'primary'"
                                                    size="x-small"
                                                    variant="tonal"
                                                    pill
                                                    class="types-catalog-card__kind-chip"
                                                    :aria-label="entry.kind === 'enum' ? t('types.kind.enum', 'enum') : t('types.kind.type', 'type')"
                                                >
                                                    {{ entry.kind === 'enum' ? t('types.kind.enum', 'enum') : t('types.kind.type', 'type') }}
                                                </origam-chip>
                                            </div>

                                            <p class="types-catalog-card__desc">
                                                {{ t(entry.descriptionKey, entry.descriptionFallback) }}
                                            </p>
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
.types-catalog {
    display: flex;
    flex-direction: column;
}

.types-section {
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

.types-hero {
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
        opacity: 0.45;
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

.types-grid-section {
    padding-block: var(--origam-space---16, 4rem) var(--origam-space---24, 6rem);

    &__header {
        margin-block-end: var(--origam-space---12, 3rem);
    }
}

.types-empty {
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
        font-weight: var(--origam-font__weight---semibold,600);
        color: var(--origam-color__text---primary, #0a0a0a);
        margin: 0;
    }

    &__desc {
        margin: 0;
        font-size: var(--origam-font-size---base, 1rem);
        color: var(--origam-color__text---secondary, #525252);
    }
}

.types-category {
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

.types-catalog-item {
    list-style: none;
    display: flex;
    flex-direction: column;
}

.types-catalog-card {
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

        &:hover .types-catalog-card {
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

    &__kind-chip {
        flex-shrink: 0;
    }

    &__desc {
        margin: 0;
        font-size: var(--origam-font-size---sm, 0.875rem);
        line-height: 1.55;
        color: var(--origam-color__text---secondary, #525252);
        flex: 1;
    }
}
</style>
