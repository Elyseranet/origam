<script setup lang="ts">
import { computed, ref } from 'vue'
import type { CSSProperties } from 'vue'
import { useT } from '~/composables/useT'
import { useReferenceCatalog } from '~/composables/useApiReference'
import type { IDirectiveEntry } from '~/interfaces/directives-catalog.interface'

const { t } = useT()

useSeoMeta({
    title: () => t('directives.meta.title', 'Directives · origam design system'),
    description: () => t('directives.meta.description', 'Six runtime directives that extend Vue templates with click-outside detection, contrast enforcement, hover classes, intersection tracking, ripple effects, and touch/swipe gestures.'),
    ogTitle: () => t('directives.meta.title', 'Directives · origam design system'),
    ogDescription: () => t('directives.meta.description', 'Six runtime directives that extend Vue templates with click-outside detection, contrast enforcement, hover classes, intersection tracking, ripple effects, and touch/swipe gestures.')
})

const DIRECTIVES_HERO_BADGE_VARS: CSSProperties = {
    '--origam-chip---background-color': 'transparent'
} as CSSProperties

const { data: catalogData } = await useReferenceCatalog<IDirectiveEntry>('directive')

const directivesCatalog = computed<IDirectiveEntry[]>(() => catalogData.value ?? [])

const searchQuery = ref('')

const filteredDirectives = computed(() => {
    const query = searchQuery.value.toLowerCase().trim()
    if (!query) return directivesCatalog.value
    return directivesCatalog.value.filter(entry => {
        const nameMatch = entry.name.toLowerCase().includes(query)
        const descMatch = entry.descriptionFallback.toLowerCase().includes(query)
        return nameMatch || descMatch
    })
})

const totalCount = computed(() => directivesCatalog.value.length)
const filteredCount = computed(() => filteredDirectives.value.length)
const isFiltering = computed(() => searchQuery.value.trim().length > 0)
</script>

<template>
    <article
        class="directives-catalog"
        data-cy="page-directives"
    >
        <section
            class="directives-hero"
            aria-labelledby="directives-title"
        >
            <origam-container class="directives-hero__inner">
                <origam-chip
                    class="directives-hero__badge"
                    :style="DIRECTIVES_HERO_BADGE_VARS"
                    color="primary"
                    border
                    border-color="var(--origam-color__action--primary---bg)"
                    size="small"
                    pill
                    data-cy="directives-hero-badge"
                >
                    {{ t('directives.hero.badge', '6 directives — Vue 3') }}
                </origam-chip>

                <origam-title
                    id="directives-title"
                    tag="h1"
                    class="directives-hero__title"
                >
                    <span class="directives-hero__title-line">{{ t('directives.hero.title_line1', 'Template') }}</span>
                    <span class="directives-hero__title-line directives-hero__title-line--accent">{{ t('directives.hero.title_line2', 'directives.') }}</span>
                </origam-title>

                <p class="directives-hero__subtitle">
                    {{ t('directives.hero.subtitle', 'Six runtime directives that extend any Vue template. From click-outside detection to ripple effects, swipe gestures, viewport tracking, hover classes, and WCAG contrast enforcement.') }}
                </p>

                <origam-text-field
                    v-model="searchQuery"
                    class="directives-hero__search"
                    prepend-inner-icon="mdi-magnify"
                    :placeholder="t('directives.hero.search_placeholder', 'Search directives…')"
                    :aria-label="t('directives.hero.search_label', 'Filter directives by name')"
                    clearable
                    rounded="lg"
                    variant="outlined"
                    data-cy="directives-search"
                />

                <p
                    class="directives-hero__count"
                    aria-live="polite"
                    aria-atomic="true"
                >
                    <template v-if="isFiltering">
                        {{ filteredCount }} {{ t('directives.hero.count_filtered_of', 'of') }} {{ totalCount }} {{ t('directives.hero.count_filtered_match', 'directives match') }}
                    </template>
                    <template v-else>
                        {{ totalCount }} {{ t('directives.hero.count_total', 'directives — globally registered') }}
                    </template>
                </p>
            </origam-container>
        </section>

        <section
            class="directives-grid-section"
            aria-labelledby="directives-grid-title"
            data-cy="directives-grid"
        >
            <origam-container>
                <header class="directives-grid-section__header">
                    <p class="directives-section__eyebrow">
                        {{ t('directives.catalog.eyebrow', 'API REFERENCE') }}
                    </p>

                    <origam-title
                        id="directives-grid-title"
                        tag="h2"
                        class="directives-section__title directives-section__title--single"
                    >
                        {{ t('directives.catalog.title', 'All directives.') }}
                    </origam-title>
                </header>

                <div
                    v-if="isFiltering && filteredCount === 0"
                    class="directives-empty"
                    role="status"
                    data-cy="directives-empty"
                >
                    <origam-icon
                        icon="mdi-magnify-remove-outline"
                        class="directives-empty__icon"
                        aria-hidden="true"
                    />

                    <origam-title
                        tag="h3"
                        class="directives-empty__title"
                    >
                        {{ t('directives.catalog.empty_title', 'No directives found') }}
                    </origam-title>

                    <p class="directives-empty__desc">
                        {{ t('directives.catalog.empty_desc', 'No directive matches "{query}". Try a different term.', { query: searchQuery }) }}
                    </p>
                </div>

                <origam-grid
                    tag="ul"
                    columns="repeat(auto-fill, minmax(280px, 1fr))"
                    gap="1rem"
                    class="directives-grid"
                >
                    <origam-grid-item
                        v-for="entry in filteredDirectives"
                        :key="entry.slug"
                        tag="li"
                        class="directives-grid__item"
                    >
                        <nuxt-link
                            :to="`/directives/${entry.slug}`"
                            class="directives-catalog-card__link"
                            :aria-label="`${entry.name} — ${t(entry.descriptionKey, entry.descriptionFallback)}`"
                            :data-cy="`directive-card-${entry.slug}`"
                        >
                            <origam-card
                                rounded="lg"
                                class="directives-catalog-card"
                            >
                                <template #default>
                                    <div class="directives-catalog-card__inner">
                                        <div class="directives-catalog-card__header">
                                            <origam-avatar
                                                :icon="entry.icon"
                                                color="primary"
                                                rounded="lg"
                                                size="40"
                                                class="directives-catalog-card__avatar"
                                                aria-hidden="true"
                                            />

                                            <origam-title
                                                tag="h3"
                                                class="directives-catalog-card__name"
                                            >
                                                {{ entry.name }}
                                            </origam-title>
                                        </div>

                                        <p class="directives-catalog-card__desc">
                                            {{ t(entry.descriptionKey, entry.descriptionFallback) }}
                                        </p>

                                        <div class="directives-catalog-card__footer">
                                            <origam-chip
                                                size="x-small"
                                                pill
                                                class="directives-catalog-card__tag"
                                            >
                                                {{ t('directives.catalog.card_tag', 'directive') }}
                                            </origam-chip>

                                            <origam-icon
                                                icon="mdi-arrow-right"
                                                size="16"
                                                class="directives-catalog-card__arrow"
                                                aria-hidden="true"
                                            />
                                        </div>
                                    </div>
                                </template>
                            </origam-card>
                        </nuxt-link>
                    </origam-grid-item>
                </origam-grid>
            </origam-container>
        </section>
    </article>
</template>

<style scoped lang="scss">
.directives-catalog {
    display: flex;
    flex-direction: column;
}

.directives-section {
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

.directives-hero {
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

.directives-grid-section {
    padding-block: var(--origam-space---16, 4rem) var(--origam-space---24, 6rem);

    &__header {
        margin-block-end: var(--origam-space---12, 3rem);
    }
}

.directives-empty {
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

.directives-grid {
    list-style: none;
    padding: 0;
    margin: 0;

    @media (max-width: 640px) {
        grid-template-columns: 1fr;
    }

    &__item {
        list-style: none;
        display: flex;
        flex-direction: column;
    }
}

.directives-catalog-card {
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

        &:hover .directives-catalog-card {
            transform: translateY(-2px);
            box-shadow: var(--origam-shadow---md, 0 4px 12px rgba(0, 0, 0, 0.1));
        }

        &:hover .directives-catalog-card__arrow {
            transform: translateX(3px);
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

    &__footer {
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin-block-start: auto;
    }

    &__tag {
        --origam-chip---background-color: var(--origam-color__surface---sunken, #f5f5f5);
        font-family: var(--origam-font-family---mono, monospace);
    }

    &__arrow {
        color: var(--origam-color__text---tertiary, #737373);
        transition: transform 0.15s ease;
    }
}
</style>
