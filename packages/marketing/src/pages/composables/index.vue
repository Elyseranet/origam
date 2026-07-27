<script setup lang="ts">
import { computed, ref } from 'vue'
import { useT } from '~/composables/useT'
import { useReferenceCatalog } from '~/composables/useApiReference'
import type { IComposableEntry } from '~/interfaces/composables-catalog.interface'

const { t } = useT()

useSeoMeta({
    title: () => t('composables.meta.title', 'Composables · origam design system'),
    description: () => t('composables.meta.description', 'Browse 80+ composables grouped by domain. Each exposes a documented signature, parameters, return values and usage examples.'),
    ogTitle: () => t('composables.meta.title', 'Composables · origam design system'),
    ogDescription: () => t('composables.meta.description', 'Browse 80+ composables grouped by domain.')
})

const { data: catalogData } = await useReferenceCatalog<IComposableEntry>('composable')

const composablesCatalog = computed<IComposableEntry[]>(() => catalogData.value ?? [])

const composablesDomains = computed(() =>
    [...new Set(composablesCatalog.value.map(e => e.domain))].sort()
)

const searchQuery = ref('')

const filteredEntries = computed(() => {
    const query = searchQuery.value.toLowerCase().trim()
    if (!query) return composablesCatalog.value
    return composablesCatalog.value.filter(entry => {
        const nameMatch = entry.name.toLowerCase().includes(query)
        const domainMatch = entry.domain.toLowerCase().includes(query)
        const descMatch = entry.descriptionFallback.toLowerCase().includes(query)
        return nameMatch || domainMatch || descMatch
    })
})

const groupedByDomain = computed(() =>
    composablesDomains.value.map(domain => ({
        domain,
        entries: filteredEntries.value.filter(e => e.domain === domain),
    })).filter(g => g.entries.length > 0)
)

const totalCount = computed(() => composablesCatalog.value.length)
const filteredCount = computed(() => filteredEntries.value.length)
const isFiltering = computed(() => searchQuery.value.trim().length > 0)
</script>

<template>
    <article
        class="composables-catalog"
        data-cy="page-composables"
    >
        <section
            class="composables-hero"
            aria-labelledby="composables-title"
        >
            <origam-container class="composables-hero__inner">
                <origam-chip
                    class="composables-hero__badge"
                    color="primary"
                    border
                    border-color="var(--origam-color__action--primary---bg)"
                    size="small"
                    pill
                    data-cy="composables-hero-badge"
                >
                    {{ t('composables.hero.badge', '80+ composables — Vue 3') }}
                </origam-chip>

                <origam-title
                    id="composables-title"
                    tag="h1"
                    class="composables-hero__title"
                >
                    <span class="composables-hero__title-line">{{ t('composables.hero.title_line1', 'Composable') }}</span>
                    <span class="composables-hero__title-line composables-hero__title-line--accent">{{ t('composables.hero.title_line2', 'catalogue.') }}</span>
                </origam-title>

                <p class="composables-hero__subtitle">
                    {{ t('composables.hero.subtitle', 'Every origam composable is documented with its real TypeScript signature, parameters and return values — sourced directly from the DS source code.') }}
                </p>

                <origam-text-field
                    v-model="searchQuery"
                    class="composables-hero__search"
                    prepend-inner-icon="mdi-magnify"
                    :placeholder="t('composables.hero.search_placeholder', 'Search composables…')"
                    :aria-label="t('composables.hero.search_label', 'Filter composables by name or domain')"
                    clearable
                    rounded="lg"
                    variant="outlined"
                    data-cy="composables-search"
                />

                <p
                    class="composables-hero__count"
                    aria-live="polite"
                    aria-atomic="true"
                >
                    <template v-if="isFiltering">
                        {{ filteredCount }} {{ t('composables.hero.count_filtered_of', 'of') }} {{ totalCount }} {{ t('composables.hero.count_filtered_match', 'composables match') }}
                    </template>
                    <template v-else>
                        {{ totalCount }} {{ t('composables.hero.count_total', 'composables across') }} {{ composablesDomains.length }} {{ t('composables.hero.count_domains', 'domains') }}
                    </template>
                </p>
            </origam-container>
        </section>

        <section
            class="composables-grid-section"
            aria-labelledby="composables-grid-title"
            data-cy="composables-grid"
        >
            <origam-container>
                <header class="composables-grid-section__header">
                    <p class="composables-section__eyebrow">
                        {{ t('composables.catalog.eyebrow', 'BROWSE BY DOMAIN') }}
                    </p>

                    <origam-title
                        id="composables-grid-title"
                        tag="h2"
                        class="composables-section__title composables-section__title--single"
                    >
                        {{ t('composables.catalog.title', 'All composables.') }}
                    </origam-title>
                </header>

                <div
                    v-if="isFiltering && filteredCount === 0"
                    class="composables-empty"
                    role="status"
                    data-cy="composables-empty"
                >
                    <origam-icon
                        icon="mdi-magnify-remove-outline"
                        class="composables-empty__icon"
                        aria-hidden="true"
                    />

                    <origam-title
                        tag="h3"
                        class="composables-empty__title"
                    >
                        {{ t('composables.catalog.empty_title', 'No composables found') }}
                    </origam-title>

                    <p class="composables-empty__desc">
                        {{ t('composables.catalog.empty_desc', 'No composable matches "{query}". Try a different term.', { query: searchQuery }) }}
                    </p>
                </div>

                <div
                    v-for="group in groupedByDomain"
                    :key="group.domain"
                    class="composables-domain"
                    :data-cy="`composables-domain-${group.domain.toLowerCase()}`"
                >
                    <header class="composables-domain__header">
                        <origam-title
                            tag="h3"
                            class="composables-domain__title"
                        >
                            {{ group.domain }}
                        </origam-title>

                        <origam-chip
                            size="small"
                            pill
                            class="composables-domain__count-chip"
                        >
                            {{ group.entries.length }}
                        </origam-chip>
                    </header>

                    <origam-grid
                        tag="ul"
                        columns="repeat(auto-fill, minmax(240px, 1fr))"
                        gap="1rem"
                        class="composables-domain__grid"
                    >
                        <origam-grid-item
                            v-for="entry in group.entries"
                            :key="entry.slug"
                            tag="li"
                            class="composables-catalog-item"
                        >
                            <nuxt-link
                                :to="`/composables/${entry.slug}`"
                                class="composables-catalog-card__link"
                                :aria-label="`${entry.name} — ${entry.descriptionFallback}`"
                                :data-cy="`composables-card-${entry.slug}`"
                            >
                                <origam-card
                                    rounded="lg"
                                    class="composables-catalog-card"
                                >
                                    <template #default>
                                        <div class="composables-catalog-card__inner">
                                            <div class="composables-catalog-card__header">
                                                <origam-avatar
                                                    :icon="entry.icon"
                                                    color="primary"
                                                    rounded="lg"
                                                    size="40"
                                                    class="composables-catalog-card__avatar"
                                                    aria-hidden="true"
                                                />

                                                <origam-title
                                                    tag="h4"
                                                    class="composables-catalog-card__name"
                                                >
                                                    {{ entry.name }}
                                                </origam-title>
                                            </div>

                                            <p class="composables-catalog-card__desc">
                                                {{ entry.descriptionFallback }}
                                            </p>

                                            <div
                                                v-if="entry.related.length > 0"
                                                class="composables-catalog-card__related-tags"
                                            >
                                                <origam-chip
                                                    v-for="relSlug in entry.related.slice(0, 2)"
                                                    :key="relSlug"
                                                    size="x-small"
                                                    pill
                                                    class="composables-catalog-card__related-chip"
                                                >
                                                    {{ relSlug }}
                                                </origam-chip>

                                                <origam-chip
                                                    v-if="entry.related.length > 2"
                                                    size="x-small"
                                                    pill
                                                    class="composables-catalog-card__related-chip composables-catalog-card__related-chip--more"
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
.composables-catalog {
    display: flex;
    flex-direction: column;
}

.composables-section {
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

.composables-hero {
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

.composables-grid-section {
    padding-block: var(--origam-space---16, 4rem) var(--origam-space---24, 6rem);

    &__header {
        margin-block-end: var(--origam-space---12, 3rem);
    }
}

.composables-empty {
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

.composables-domain {
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

.composables-catalog-item {
    list-style: none;
    display: flex;
    flex-direction: column;
}

.composables-catalog-card {
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

        &:hover .composables-catalog-card {
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
    .composables-hero__title {
        font-size: clamp(2.5rem, 9vw, 5.25rem);
    }
}

@media (max-width: 768px) {
    .composables-section__title {
        font-size: clamp(1.75rem, 7vw, 3rem);
    }
}

@media (max-width: 640px) {
    .composables-domain__grid {
        grid-template-columns: 1fr;
    }
}
</style>
