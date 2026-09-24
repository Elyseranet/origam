<script setup lang="ts">
import { computed } from 'vue'
import { useT } from '~/composables/useT'
import {
    WHY_HERO_BADGE_VARS,
    WHY_STRENGTHS,
    WHY_WEAKNESSES,
    WHY_USE_CASES,
    WHY_COMPARISONS
} from '~/consts/why-origam.const'
import { CTA_START_HREF } from '~/consts/cta.const'

const { t } = useT()

useSeoMeta({
    title: () => t('why_origam.meta.title', 'Why origam? · Vue 3 design system'),
    description: () => t('why_origam.meta.description', 'An honest look at origam.'),
    ogTitle: () => t('why_origam.meta.title', 'Why origam? · Vue 3 design system'),
    ogDescription: () => t('why_origam.meta.description', 'An honest look at origam.')
})

const strengths = computed(() => WHY_STRENGTHS)
const weaknesses = computed(() => WHY_WEAKNESSES)
const useCases = computed(() => WHY_USE_CASES)

const fits = computed(() => useCases.value.filter(u => u.fits))
const noFits = computed(() => useCases.value.filter(u => !u.fits))

const comparisonItems = computed(() =>
    WHY_COMPARISONS.map(lib => ({
        library: lib.nameKey,
        libraryNote: lib.noteKey,
        isOrigam: lib.nameKey === 'why_origam.comparison.origam',
        vueNative: lib.vueNative,
        themingPropsFirst: lib.themingPropsFirst,
        a11yTested: lib.a11yTested,
        cssFirst: lib.cssFist,
        treeShakable: lib.treeShakable,
        charts: lib.chartsIncluded
    }))
)
</script>

<template>
    <article
        class="why-origam"
        data-cy="page-why-origam"
    >
        <section
            class="why-hero"
            aria-labelledby="why-title"
        >
            <origam-container class="why-hero__inner">
                <origam-chip
                    class="why-hero__badge"
                    :style="WHY_HERO_BADGE_VARS"
                    color="primary"
                    border
                    border-color="var(--origam-color__action--primary---bg)"
                    size="small"
                    pill
                    data-cy="why-hero-badge"
                >
                    {{ t('why_origam.hero.badge', 'Honest by design') }}
                </origam-chip>

                <origam-title
                    id="why-title"
                    tag="h1"
                    class="why-hero__title"
                >
                    <span class="why-hero__title-line">{{ t('why_origam.hero.title_line1', 'Why origam?') }}</span>
                    <span class="why-hero__title-line why-hero__title-line--accent">{{ t('why_origam.hero.title_line2', 'An honest answer.') }}</span>
                </origam-title>

                <p class="why-hero__subtitle">
                    {{ t('why_origam.hero.subtitle', 'We built origam for Vue 3 teams who care about design quality, accessibility, and token-driven consistency.') }}
                </p>
            </origam-container>
        </section>

        <section
            class="why-strengths"
            aria-labelledby="why-strengths-title"
        >
            <origam-container>
                <header class="why-strengths__header">
                    <p class="why-section__eyebrow">
                        {{ t('why_origam.strengths.eyebrow', 'WHAT WE DO WELL') }}
                    </p>

                    <origam-title
                        id="why-strengths-title"
                        tag="h2"
                        class="why-section__title"
                    >
                        <span class="why-section__title-line">{{ t('why_origam.strengths.title_line1', 'Built for Vue 3.') }}</span>
                        <span class="why-section__title-line why-section__title-line--muted">{{ t('why_origam.strengths.title_line2', 'From the ground up.') }}</span>
                    </origam-title>

                    <p class="why-section__subtitle">
                        {{ t('why_origam.strengths.subtitle', 'Every API, every composable, every prop — designed for Composition API and TypeScript from day one.') }}
                    </p>
                </header>

                <origam-grid
                    tag="ul"
                    columns="repeat(auto-fit, minmax(260px, 1fr))"
                    gap="1.5rem"
                    class="why-strengths__grid"
                >
                    <origam-grid-item
                        v-for="strength in strengths"
                        :key="strength.titleKey"
                        tag="li"
                        class="why-strengths__item"
                    >
                        <origam-card
                            class="why-strengths__card"
                            border
                            rounded="lg"
                            :title="t(strength.titleKey, strength.titleKey)"
                            :text="t(strength.descriptionKey, strength.descriptionKey)"
                        >
                            <template #header.prepend>
                                <origam-avatar
                                    :icon="strength.icon"
                                    color="primary"
                                    rounded="lg"
                                    size="40"
                                    class="why-strengths__avatar"
                                    aria-hidden="true"
                                />
                            </template>
                        </origam-card>
                    </origam-grid-item>
                </origam-grid>
            </origam-container>
        </section>

        <section
            class="why-comparison-wrap"
            aria-labelledby="why-comparison-title"
            data-cy="why-comparison"
        >
            <origam-container>
                <header class="why-comparison__header">
                    <p class="why-section__eyebrow">
                        {{ t('why_origam.comparison.eyebrow', 'HONEST COMPARISON') }}
                    </p>

                    <origam-title
                        id="why-comparison-title"
                        tag="h2"
                        class="why-section__title why-section__title--single"
                    >
                        {{ t('why_origam.comparison.title', 'How does origam compare?') }}
                    </origam-title>

                    <p class="why-section__subtitle">
                        {{ t('why_origam.comparison.subtitle', 'A feature-by-feature look at the Vue ecosystem main design systems.') }}
                    </p>
                </header>

                <origam-table
                    class="why-comparison__table"
                    border
                    rounded="lg"
                    data-cy="why-comparison-table"
                    :caption="t('why_origam.comparison.title', 'How does origam compare?')"
                >
                    <thead>
                        <tr>
                            <th
                                scope="col"
                                class="why-comparison__th why-comparison__th--lib"
                            >
                                {{ t('why_origam.comparison.col_library', 'Library') }}
                            </th>
                            <th
                                scope="col"
                                class="why-comparison__th"
                            >
                                {{ t('why_origam.comparison.col_vue_native', 'Vue 3 native') }}
                            </th>
                            <th
                                scope="col"
                                class="why-comparison__th"
                            >
                                {{ t('why_origam.comparison.col_theming_props_first', 'Theming props-first') }}
                            </th>
                            <th
                                scope="col"
                                class="why-comparison__th"
                            >
                                {{ t('why_origam.comparison.col_a11y_tested', 'A11y tested') }}
                            </th>
                            <th
                                scope="col"
                                class="why-comparison__th"
                            >
                                {{ t('why_origam.comparison.col_css_first', 'CSS-first') }}
                            </th>
                            <th
                                scope="col"
                                class="why-comparison__th"
                            >
                                {{ t('why_origam.comparison.col_tree_shakable', 'Tree-shakable') }}
                            </th>
                            <th
                                scope="col"
                                class="why-comparison__th"
                            >
                                {{ t('why_origam.comparison.col_charts', 'Charts included') }}
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr
                            v-for="lib in comparisonItems"
                            :key="lib.library"
                            :class="['why-comparison__tr', { 'why-comparison__tr--origam': lib.isOrigam }]"
                            :data-cy="`comparison-row-${lib.library}`"
                        >
                            <td class="why-comparison__td why-comparison__td--lib">
                                <div :class="['why-comparison__lib-cell', { 'why-comparison__lib-cell--origam': lib.isOrigam }]">
                                    <span class="why-comparison__lib-name">{{ t(lib.library, lib.library) }}</span>
                                    <span
                                        v-if="lib.libraryNote"
                                        class="why-comparison__lib-note"
                                    >{{ t(lib.libraryNote, '') }}</span>
                                </div>
                            </td>
                            <td class="why-comparison__td">
                                <origam-icon
                                    :icon="lib.vueNative ? 'mdi-check-circle' : 'mdi-minus-circle-outline'"
                                    :color="lib.vueNative ? 'success' : 'error'"
                                    :aria-label="lib.vueNative ? t('why_origam.comparison.yes', 'Yes') : t('why_origam.comparison.no', 'No')"
                                    class="why-comparison__cell-icon"
                                />
                            </td>
                            <td class="why-comparison__td">
                                <origam-icon
                                    :icon="lib.themingPropsFirst ? 'mdi-check-circle' : 'mdi-minus-circle-outline'"
                                    :color="lib.themingPropsFirst ? 'success' : 'error'"
                                    :aria-label="lib.themingPropsFirst ? t('why_origam.comparison.yes', 'Yes') : t('why_origam.comparison.no', 'No')"
                                    class="why-comparison__cell-icon"
                                />
                            </td>
                            <td class="why-comparison__td">
                                <origam-icon
                                    :icon="lib.a11yTested ? 'mdi-check-circle' : 'mdi-minus-circle-outline'"
                                    :color="lib.a11yTested ? 'success' : 'error'"
                                    :aria-label="lib.a11yTested ? t('why_origam.comparison.yes', 'Yes') : t('why_origam.comparison.no', 'No')"
                                    class="why-comparison__cell-icon"
                                />
                            </td>
                            <td class="why-comparison__td">
                                <origam-icon
                                    :icon="lib.cssFirst ? 'mdi-check-circle' : 'mdi-minus-circle-outline'"
                                    :color="lib.cssFirst ? 'success' : 'error'"
                                    :aria-label="lib.cssFirst ? t('why_origam.comparison.yes', 'Yes') : t('why_origam.comparison.no', 'No')"
                                    class="why-comparison__cell-icon"
                                />
                            </td>
                            <td class="why-comparison__td">
                                <origam-icon
                                    :icon="lib.treeShakable ? 'mdi-check-circle' : 'mdi-minus-circle-outline'"
                                    :color="lib.treeShakable ? 'success' : 'error'"
                                    :aria-label="lib.treeShakable ? t('why_origam.comparison.yes', 'Yes') : t('why_origam.comparison.no', 'No')"
                                    class="why-comparison__cell-icon"
                                />
                            </td>
                            <td class="why-comparison__td">
                                <origam-icon
                                    :icon="lib.charts ? 'mdi-check-circle' : 'mdi-minus-circle-outline'"
                                    :color="lib.charts ? 'success' : 'error'"
                                    :aria-label="lib.charts ? t('why_origam.comparison.yes', 'Yes') : t('why_origam.comparison.no', 'No')"
                                    class="why-comparison__cell-icon"
                                />
                            </td>
                        </tr>
                    </tbody>
                </origam-table>

                <p class="why-comparison__disclaimer">
                    {{ t('why_origam.comparison.disclaimer', 'Some assessments reflect our interpretation of publicly available documentation.') }}
                </p>
            </origam-container>
        </section>

        <section
            class="why-weaknesses-wrap"
            aria-labelledby="why-weaknesses-title"
            data-cy="why-weaknesses"
        >
            <origam-container>
                <header class="why-weaknesses__header">
                    <p class="why-section__eyebrow">
                        {{ t('why_origam.weaknesses.eyebrow', "LET'S BE HONEST") }}
                    </p>

                    <origam-title
                        id="why-weaknesses-title"
                        tag="h2"
                        class="why-section__title"
                    >
                        <span class="why-section__title-line">{{ t('why_origam.weaknesses.title_line1', "Where we're") }}</span>
                        <span class="why-section__title-line">{{ t('why_origam.weaknesses.title_line2', 'still growing.') }}</span>
                    </origam-title>

                    <p class="why-section__subtitle">
                        {{ t('why_origam.weaknesses.subtitle', 'origam is young. An asset in terms of API freshness — a constraint in terms of maturity.') }}
                    </p>
                </header>

                <origam-grid
                    tag="ul"
                    columns="1"
                    gap="1.5rem"
                    class="why-weaknesses__grid"
                >
                    <origam-grid-item
                        v-for="weakness in weaknesses"
                        :key="weakness.titleKey"
                        tag="li"
                        class="why-weaknesses__item"
                    >
                        <origam-card
                            class="why-weaknesses__card"
                            border
                            rounded="lg"
                            :title="t(weakness.titleKey, weakness.titleKey)"
                            :text="t(weakness.descriptionKey, weakness.descriptionKey)"
                        >
                            <template #header.prepend>
                                <origam-avatar
                                    :icon="weakness.icon"
                                    color="warning"
                                    rounded="lg"
                                    size="44"
                                    class="why-weaknesses__avatar"
                                    aria-hidden="true"
                                />
                            </template>
                        </origam-card>
                    </origam-grid-item>
                </origam-grid>
            </origam-container>
        </section>

        <section
            class="why-usecases"
            aria-labelledby="why-usecases-title"
            data-cy="why-usecases"
        >
            <origam-container>
                <header class="why-usecases__header">
                    <p class="why-section__eyebrow">
                        {{ t('why_origam.use_cases.eyebrow', 'WHO IS ORIGAM FOR') }}
                    </p>

                    <origam-title
                        id="why-usecases-title"
                        tag="h2"
                        class="why-section__title why-section__title--single"
                    >
                        {{ t('why_origam.use_cases.title', 'Pick origam when…') }}
                    </origam-title>
                </header>

                <div class="why-usecases__columns">
                    <origam-card
                        class="why-usecases__col why-usecases__col--yes"
                        border
                        border-color="var(--origam-color__feedback--success---border)"
                        rounded="lg"
                        flat
                    >
                        <template #default>
                            <origam-title
                                tag="h3"
                                class="why-usecases__col-title why-usecases__col-title--yes"
                            >
                                {{ t('why_origam.use_cases.fits_title', 'origam is a great fit') }}
                            </origam-title>

                            <origam-grid
                                tag="ul"
                                columns="1"
                                gap="1rem"
                                class="why-usecases__list"
                            >
                                <origam-grid-item
                                    v-for="uc in fits"
                                    :key="uc.titleKey"
                                    tag="li"
                                >
                                    <origam-card
                                        class="why-usecases__item"
                                        flat
                                        :title="t(uc.titleKey, uc.titleKey)"
                                        :text="t(uc.descriptionKey, uc.descriptionKey)"
                                    >
                                        <template #header.prepend>
                                            <origam-icon
                                                icon="mdi-check-circle-outline"
                                                color="success"
                                                class="why-usecases__item-icon"
                                                aria-hidden="true"
                                            />
                                        </template>
                                    </origam-card>
                                </origam-grid-item>
                            </origam-grid>
                        </template>
                    </origam-card>

                    <origam-card
                        class="why-usecases__col why-usecases__col--no"
                        border
                        rounded="lg"
                        flat
                    >
                        <template #default>
                            <origam-title
                                tag="h3"
                                class="why-usecases__col-title why-usecases__col-title--no"
                            >
                                {{ t('why_origam.use_cases.no_fits_title', 'origam might not be the right call') }}
                            </origam-title>

                            <origam-grid
                                tag="ul"
                                columns="1"
                                gap="1rem"
                                class="why-usecases__list"
                            >
                                <origam-grid-item
                                    v-for="uc in noFits"
                                    :key="uc.titleKey"
                                    tag="li"
                                >
                                    <origam-card
                                        class="why-usecases__item"
                                        flat
                                        :title="t(uc.titleKey, uc.titleKey)"
                                        :text="t(uc.descriptionKey, uc.descriptionKey)"
                                    >
                                        <template #header.prepend>
                                            <origam-icon
                                                icon="mdi-close-circle-outline"
                                                color="secondary"
                                                class="why-usecases__item-icon"
                                                aria-hidden="true"
                                            />
                                        </template>
                                    </origam-card>
                                </origam-grid-item>
                            </origam-grid>
                        </template>
                    </origam-card>
                </div>
            </origam-container>
        </section>

        <section
            class="why-cta"
            aria-labelledby="why-cta-title"
            data-cy="why-cta"
        >
            <div class="why-cta__inner">
                <origam-title
                    id="why-cta-title"
                    tag="h2"
                    class="why-cta__title"
                >
                    {{ t('why_origam.cta.title', 'Ready to try it?') }}
                </origam-title>

                <p class="why-cta__desc">
                    {{ t('why_origam.cta.description', 'Install origam in 30 seconds and see how far the defaults take you.') }}
                </p>

                <nav
                    class="why-cta__actions"
                    :aria-label="t('why_origam.cta.actions_label', 'Try origam')"
                >
                    <origam-btn
                        class="why-cta__btn why-cta__btn--primary"
                        variant="text"
                        append-icon="mdi-arrow-right"
                        :href="CTA_START_HREF"
                        data-cy="why-cta-install"
                    >
                        {{ t('why_origam.cta.cta_install', 'Get started') }}
                    </origam-btn>

                    <origam-btn
                        class="why-cta__btn why-cta__btn--secondary"
                        variant="text"
                        prepend-icon="mdi-view-grid-outline"
                        href="/components"
                        data-cy="why-cta-components"
                    >
                        {{ t('why_origam.cta.cta_components', 'Browse components') }}
                    </origam-btn>
                </nav>
            </div>
        </section>
    </article>
</template>

<style scoped lang="scss">
.why-origam {
    display: flex;
    flex-direction: column;
}

.why-section {
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

.why-hero {
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
}

.why-strengths {
    padding-block: var(--origam-space---24, 6rem);

    &__header {
        margin-block-end: var(--origam-space---12, 3rem);
    }

    &__grid {
        list-style: none;
        margin: 0;
        padding: 0;
    }

    &__item {
        list-style: none;
        display: flex;
        flex-direction: column;
    }

    &__card {
        block-size: 100%;
    }

    &__avatar {
        margin-inline-end: var(--origam-space---3, 0.75rem);
    }
}

.why-comparison-wrap {
    padding-block: var(--origam-space---24, 6rem);
    background: var(--origam-color__surface---sunken, #f5f5f5);
}

.why-comparison {
    &__header {
        margin-block-end: var(--origam-space---10, 2.5rem);
    }

    &__table {
        inline-size: 100%;
    }

    &__lib-cell {
        display: flex;
        flex-direction: column;
        gap: var(--origam-space---1, 0.25rem);

        &--origam .why-comparison__lib-name {
            font-weight: var(--origam-font__weight---bold, 700);
            color: var(--origam-color__action--primary---fgSubtle, #6d28d9);
        }
    }

    &__lib-name {
        display: block;
        font-weight: var(--origam-font__weight---medium, 500);
        font-size: var(--origam-font-size---sm, 0.875rem);
    }

    &__lib-note {
        display: block;
        font-size: var(--origam-font-size---xs, 0.75rem);
        color: var(--origam-color__text---tertiary, #737373);
        max-inline-size: 200px;
    }

    &__cell-icon {
        font-size: var(--origam-font-size---xl, 1.25rem);
    }

    &__disclaimer {
        margin-block-start: var(--origam-space---5, 1.25rem);
        font-size: var(--origam-font-size---xs, 0.75rem);
        color: var(--origam-color__text---tertiary, #737373);
        font-style: italic;
    }
}

.why-weaknesses-wrap {
    background: var(--origam-color__surface---default);
    padding-block: var(--origam-space---24, 6rem);
    border-block: 1px solid var(--origam-color__border---default, rgba(0, 0, 0, 0.08));
}

.why-weaknesses {
    &__header {
        margin-block-end: var(--origam-space---12, 3rem);
    }

    &__grid {
        max-inline-size: 56rem;
        list-style: none;
        padding: 0;
        margin: 0;
    }

    &__item {
        list-style: none;
    }

    &__avatar {
        margin-inline-end: var(--origam-space---5, 1.25rem);
        flex-shrink: 0;
    }
}

.why-usecases {
    padding-block: var(--origam-space---24, 6rem);

    &__header {
        margin-block-end: var(--origam-space---10, 2.5rem);
    }

    &__columns {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
        gap: var(--origam-space---8, 2rem);
    }

    &__col {
        padding: var(--origam-space---6, 1.5rem);
    }

    &__col-title {
        display: block;
        margin-block-end: var(--origam-space---5, 1.25rem);
        font-size: var(--origam-font-size---base, 1rem) !important;
        font-weight: var(--origam-font__weight---semibold, 600);

        &--yes {
            color: var(--origam-color__feedback--success---fgSubtle, #15803d);
        }

        &--no {
            color: var(--origam-color__text---secondary, #525252);
        }
    }

    &__list {
        list-style: none;
        padding: 0;
        margin: 0;
    }

    &__item-icon {
        font-size: var(--origam-font-size---lg, 1.125rem);
    }
}

.why-cta {
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
    .why-hero {
        &__title {
            font-size: clamp(2.5rem, 9vw, 5.25rem);
        }
    }
}

@media (max-width: 768px) {
    .why-section {
        &__title {
            font-size: clamp(1.75rem, 7vw, 3rem);
        }
    }

    .why-cta {
        &__title {
            font-size: clamp(2rem, 8vw, 4rem) !important;
        }
    }

    .why-usecases {
        &__columns {
            grid-template-columns: 1fr;
        }
    }
}

@media (max-width: 640px) {
    .why-strengths {
        &__grid {
            grid-template-columns: 1fr;
        }
    }
}
</style>
