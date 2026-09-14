<script setup lang="ts">
import { computed } from 'vue'
import { useT } from '~/composables/useT'
import { useVersion } from '~/composables/useVersion'
import {
    ROADMAP_HERO_BADGE_VARS,
    ROADMAP_STATUS_ITEMS,
    ROADMAP_OVERVIEW_STATS,
    ROADMAP_WAVES,
    ROADMAP_PHASES,
    ROADMAP_WAVE4_COMPONENTS
} from '~/consts/roadmap.const'
import { MARKETING_DEFAULTS } from '~/consts/marketing.const'

const { t } = useT()

// The badge used to hardcode "v2.6.0", which drifted to four minor versions
// behind what npm actually served. `useVersion` is the single source of truth
// (live registry, build-time fallback) — the same one the home hero reads, so
// a release only requires bumping the package, never editing a badge string.
const { version } = useVersion()

const heroBadge = computed(() =>
    t('roadmap.hero.badge', `v${ version.value } — Wave 4 shipped`, { version: version.value })
)

useSeoMeta({
    title: () => t('roadmap.meta.title', 'Roadmap · origam design system'),
    description: () => t('roadmap.meta.description', 'Where origam is today, what has been delivered, and what is coming next.'),
    ogTitle: () => t('roadmap.meta.title', 'Roadmap · origam design system'),
    ogDescription: () => t('roadmap.meta.description', 'Where origam is today, what has been delivered, and what is coming next.')
})

const statusItems = computed(() => ROADMAP_STATUS_ITEMS)
const overviewStats = computed(() => ROADMAP_OVERVIEW_STATS)
const waves = computed(() => ROADMAP_WAVES)
const phases = computed(() => ROADMAP_PHASES)
const wave4Components = computed(() => ROADMAP_WAVE4_COMPONENTS)

const githubHref = computed(() => MARKETING_DEFAULTS.githubRepo)
const changelogHref = computed(() => `${MARKETING_DEFAULTS.githubRepo}/blob/main/CHANGELOG.md`)
</script>

<template>
    <article
        class="roadmap"
        data-cy="page-roadmap"
    >
        <section
            class="roadmap-hero"
            aria-labelledby="roadmap-title"
        >
            <origam-container class="roadmap-hero__inner">
                <origam-chip
                    class="roadmap-hero__badge"
                    :style="ROADMAP_HERO_BADGE_VARS"
                    color="primary"
                    border
                    border-color="var(--origam-color__action--primary---bg)"
                    size="small"
                    pill
                    data-cy="roadmap-hero-badge"
                >
                    {{ heroBadge }}
                </origam-chip>

                <origam-title
                    id="roadmap-title"
                    tag="h1"
                    class="roadmap-hero__title"
                >
                    <span class="roadmap-hero__title-line">{{ t('roadmap.hero.title_line1', 'Roadmap.') }}</span>
                    <span class="roadmap-hero__title-line roadmap-hero__title-line--accent">{{ t('roadmap.hero.title_line2', 'Honest & public.') }}</span>
                </origam-title>

                <p class="roadmap-hero__subtitle">
                    {{ t('roadmap.hero.subtitle', 'origam is an early-stage Vue 3 design system. Here is where we stand today, what we have already shipped, and what is on the horizon.') }}
                </p>
            </origam-container>
        </section>

        <section
            class="roadmap-status"
            aria-labelledby="roadmap-status-title"
            data-cy="roadmap-status"
        >
            <origam-container>
                <header class="roadmap-status__header">
                    <p class="roadmap-section__eyebrow">
                        {{ t('roadmap.status.eyebrow', 'WHERE WE STAND') }}
                    </p>

                    <origam-title
                        id="roadmap-status-title"
                        tag="h2"
                        class="roadmap-section__title"
                    >
                        <span class="roadmap-section__title-line">{{ t('roadmap.status.title_line1', 'Post-2.6.0') }}</span>
                        <span class="roadmap-section__title-line roadmap-section__title-line--muted">{{ t('roadmap.status.title_line2', 'Status.') }}</span>
                    </origam-title>

                    <p class="roadmap-section__subtitle">
                        {{ t('roadmap.status.subtitle', 'An honest snapshot of what works, what is in progress, and what is still missing.') }}
                    </p>
                </header>

                <origam-grid
                    tag="ul"
                    columns="1"
                    gap="0.75rem"
                    class="roadmap-status__list"
                    data-cy="roadmap-status-list"
                >
                    <origam-grid-item
                        v-for="item in statusItems"
                        :key="item.labelKey"
                        tag="li"
                        class="roadmap-status__item"
                    >
                        <origam-card
                            flat
                            border
                            rounded="lg"
                            class="roadmap-status__card"
                        >
                            <template #default>
                                <div class="roadmap-status__row">
                                    <origam-icon
                                        :icon="item.done ? 'mdi-check-circle' : 'mdi-close-circle'"
                                        :color="item.done ? 'success' : 'error'"
                                        class="roadmap-status__icon"
                                        aria-hidden="true"
                                    />

                                    <p class="roadmap-status__label">
                                        {{ t(item.labelKey, item.labelKey) }}
                                    </p>
                                </div>
                            </template>
                        </origam-card>
                    </origam-grid-item>
                </origam-grid>
            </origam-container>
        </section>

        <section
            class="roadmap-delivered"
            aria-labelledby="roadmap-delivered-title"
            data-cy="roadmap-delivered"
        >
            <origam-container>
                <header class="roadmap-delivered__header">
                    <p class="roadmap-section__eyebrow">
                        {{ t('roadmap.delivered.eyebrow', 'ALREADY SHIPPED') }}
                    </p>

                    <origam-title
                        id="roadmap-delivered-title"
                        tag="h2"
                        class="roadmap-section__title"
                    >
                        <span class="roadmap-section__title-line">{{ t('roadmap.delivered.title_line1', 'Four waves.') }}</span>
                        <span class="roadmap-section__title-line roadmap-section__title-line--muted">{{ t('roadmap.delivered.title_line2', 'Delivered.') }}</span>
                    </origam-title>

                    <p class="roadmap-section__subtitle">
                        {{ t('roadmap.delivered.subtitle', 'Every item below is shipped and available on npm since v2.6.0.') }}
                    </p>
                </header>

                <origam-grid
                    tag="ul"
                    columns="repeat(auto-fit, minmax(160px, 1fr))"
                    gap="1rem"
                    class="roadmap-overview"
                    data-cy="roadmap-overview"
                    :aria-label="t('roadmap.overview.label', 'What origam already is')"
                >
                    <origam-grid-item
                        v-for="stat in overviewStats"
                        :key="stat.labelKey"
                        tag="li"
                        class="roadmap-overview__item"
                    >
                        <origam-card
                            flat
                            border
                            rounded="lg"
                            class="roadmap-overview__card"
                        >
                            <template #default>
                                <origam-icon
                                    :icon="stat.icon"
                                    color="primary"
                                    class="roadmap-overview__icon"
                                    aria-hidden="true"
                                />

                                <strong class="roadmap-overview__value">{{ stat.value }}</strong>

                                <span class="roadmap-overview__label">{{ t(stat.labelKey, stat.labelKey) }}</span>
                            </template>
                        </origam-card>
                    </origam-grid-item>
                </origam-grid>

                <origam-grid
                    tag="ul"
                    columns="repeat(auto-fit, minmax(280px, 1fr))"
                    gap="1.5rem"
                    class="roadmap-delivered__grid"
                >
                    <origam-grid-item
                        v-for="wave in waves"
                        :key="wave.titleKey"
                        tag="li"
                        class="roadmap-delivered__wave"
                    >
                        <origam-card
                            border
                            rounded="lg"
                            class="roadmap-delivered__wave-card"
                        >
                            <template #header.prepend>
                                <origam-chip
                                    color="success"
                                    size="small"
                                    pill
                                    class="roadmap-delivered__badge"
                                    aria-hidden="true"
                                >
                                    {{ t('roadmap.delivered.badge_done', 'Delivered') }}
                                </origam-chip>
                            </template>

                            <template #header.title>
                                <origam-title
                                    tag="h3"
                                    class="roadmap-delivered__wave-title"
                                >
                                    {{ t(wave.titleKey, wave.titleKey) }}
                                </origam-title>
                            </template>

                            <template #default>
                                <origam-table
                                    flat
                                    :caption="t(wave.titleKey, wave.titleKey)"
                                    class="roadmap-delivered__table"
                                    data-cy="roadmap-wave-table"
                                >
                                    <tbody>
                                        <tr
                                            v-for="item in wave.items"
                                            :key="item.nameKey"
                                            class="roadmap-delivered__table-row"
                                        >
                                            <td class="roadmap-delivered__table-icon-cell">
                                                <origam-icon
                                                    icon="mdi-check-circle"
                                                    color="success"
                                                    aria-hidden="true"
                                                    class="roadmap-delivered__table-icon"
                                                />
                                            </td>
                                            <td class="roadmap-delivered__table-text-cell">
                                                {{ t(item.nameKey, item.nameKey) }}
                                            </td>
                                        </tr>
                                    </tbody>
                                </origam-table>
                            </template>
                        </origam-card>
                    </origam-grid-item>
                </origam-grid>
            </origam-container>
        </section>

        <section
            class="roadmap-timeline-wrap"
            aria-labelledby="roadmap-phases-title"
            data-cy="roadmap-phases"
        >
            <origam-container>
                <header class="roadmap-phases__header">
                    <p class="roadmap-section__eyebrow">
                        {{ t('roadmap.phases.eyebrow', "WHAT'S NEXT") }}
                    </p>

                    <origam-title
                        id="roadmap-phases-title"
                        tag="h2"
                        class="roadmap-section__title roadmap-section__title--single"
                    >
                        {{ t('roadmap.phases.title', 'A phased roadmap.') }}
                    </origam-title>

                    <p class="roadmap-section__subtitle">
                        {{ t('roadmap.phases.subtitle', 'Each phase builds on the previous. The order reflects real technical dependencies, not arbitrary milestones.') }}
                    </p>
                </header>

                <origam-timeline
                    class="roadmap-timeline"
                    :aria-label="t('roadmap.phases.title', 'Roadmap phases')"
                    data-cy="roadmap-timeline"
                >
                    <origam-timeline-item
                        v-for="(phase, index) in phases"
                        :key="phase.id"
                        :intent="phase.intent"
                        :is-last="index === phases.length - 1"
                        class="roadmap-timeline__phase"
                        :data-cy="`roadmap-phase-${phase.id}`"
                    >
                        <template #dot>
                            <origam-icon
                                :icon="phase.icon"
                                :size="20"
                                aria-hidden="true"
                            />
                        </template>

                        <template #default>
                            <origam-card
                                flat
                                class="roadmap-timeline__card"
                            >
                                <template #header.title>
                                    <div class="roadmap-timeline__card-header">
                                        <origam-chip
                                            :color="phase.intent"
                                            size="small"
                                            pill
                                            class="roadmap-timeline__phase-chip"
                                        >
                                            {{ t(phase.eyebrowKey, phase.eyebrowKey) }}
                                        </origam-chip>

                                        <origam-title
                                            tag="h3"
                                            class="roadmap-timeline__phase-title"
                                        >
                                            {{ t(phase.titleKey, phase.titleKey) }}
                                        </origam-title>
                                    </div>
                                </template>

                                <template #default>
                                    <origam-grid
                                        tag="ul"
                                        columns="1"
                                        gap="0.75rem"
                                        class="roadmap-timeline__items"
                                    >
                                        <origam-grid-item
                                            v-for="item in phase.items"
                                            :key="item.titleKey"
                                            tag="li"
                                            class="roadmap-timeline__item"
                                        >
                                            <origam-avatar
                                                :icon="item.icon"
                                                :color="phase.intent"
                                                rounded="lg"
                                                size="44"
                                                class="roadmap-timeline__item-avatar"
                                                aria-hidden="true"
                                            />

                                            <div class="roadmap-timeline__item-content">
                                                <strong class="roadmap-timeline__item-title">
                                                    {{ t(item.titleKey, item.titleKey) }}
                                                </strong>

                                                <p class="roadmap-timeline__item-desc">
                                                    {{ t(item.descriptionKey, item.descriptionKey) }}
                                                </p>
                                            </div>

                                            <origam-chip
                                                v-if="item.effortKey"
                                                size="x-small"
                                                pill
                                                class="roadmap-timeline__effort"
                                                :aria-label="t('a11y.roadmap_effort', 'Effort')"
                                            >
                                                {{ t(item.effortKey, item.effortKey) }}
                                            </origam-chip>
                                        </origam-grid-item>
                                    </origam-grid>
                                </template>
                            </origam-card>
                        </template>
                    </origam-timeline-item>
                </origam-timeline>
            </origam-container>
        </section>

        <section
            class="roadmap-wave4"
            aria-labelledby="roadmap-wave4-title"
            data-cy="roadmap-wave4"
        >
            <origam-container>
                <header class="roadmap-wave4__header">
                    <p class="roadmap-section__eyebrow">
                        {{ t('roadmap.wave4_grid.eyebrow', 'WAVE 4 — SHIPPED') }}
                    </p>

                    <origam-title
                        id="roadmap-wave4-title"
                        tag="h2"
                        class="roadmap-section__title"
                    >
                        <span class="roadmap-section__title-line">{{ t('roadmap.wave4_grid.title_line1', '15 components & features') }}</span>
                        <span class="roadmap-section__title-line roadmap-section__title-line--muted">{{ t('roadmap.wave4_grid.title_line2', 'already shipped.') }}</span>
                    </origam-title>

                    <p class="roadmap-section__subtitle">
                        {{ t('roadmap.wave4_grid.subtitle', 'Everything in Wave 4 is live on npm. These are the components and features available right now in origam.') }}
                    </p>
                </header>

                <origam-grid
                    tag="ul"
                    columns="repeat(auto-fill, minmax(240px, 1fr))"
                    gap="1rem"
                    class="roadmap-wave4__grid"
                    data-cy="roadmap-wave4-grid"
                >
                    <origam-grid-item
                        v-for="cmp in wave4Components"
                        :key="cmp.nameKey"
                        tag="li"
                        class="roadmap-wave4__item"
                    >
                        <origam-card
                            border
                            rounded="lg"
                            flat
                            class="roadmap-wave4__card"
                        >
                            <template #default>
                                <div class="roadmap-wave4__card-inner">
                                    <div class="roadmap-wave4__card-header">
                                        <origam-avatar
                                            :icon="cmp.icon"
                                            color="success"
                                            rounded="lg"
                                            size="36"
                                            class="roadmap-wave4__avatar"
                                            aria-hidden="true"
                                        />

                                        <origam-title
                                            tag="h3"
                                            class="roadmap-wave4__cmp-name"
                                        >
                                            {{ t(cmp.nameKey, cmp.nameKey) }}
                                        </origam-title>

                                        <origam-chip
                                            color="success"
                                            size="x-small"
                                            pill
                                            class="roadmap-wave4__shipped-badge"
                                            :aria-label="t('roadmap.wave4_grid.badge_shipped', 'Shipped')"
                                        >
                                            {{ t('roadmap.wave4_grid.badge_shipped', 'Shipped') }}
                                        </origam-chip>
                                    </div>

                                    <p class="roadmap-wave4__note">
                                        {{ t(cmp.noteKey, cmp.noteKey) }}
                                    </p>
                                </div>
                            </template>
                        </origam-card>
                    </origam-grid-item>
                </origam-grid>
            </origam-container>
        </section>

        <section
            class="roadmap-cta"
            aria-labelledby="roadmap-cta-title"
            data-cy="roadmap-cta"
        >
            <div class="roadmap-cta__inner">
                <origam-title
                    id="roadmap-cta-title"
                    tag="h2"
                    class="roadmap-cta__title"
                >
                    {{ t('roadmap.cta.title', 'Follow the progress.') }}
                </origam-title>

                <p class="roadmap-cta__desc">
                    {{ t('roadmap.cta.description', 'Star the repository on GitHub to stay updated. Contributions and feedback are welcome.') }}
                </p>

                <nav
                    class="roadmap-cta__actions"
                    :aria-label="t('roadmap.cta.actions_label', 'Follow origam')"
                >
                    <origam-btn
                        class="roadmap-cta__btn roadmap-cta__btn--primary"
                        variant="text"
                        prepend-icon="mdi-github"
                        :href="githubHref"
                        target="_blank"
                        rel="noopener noreferrer"
                        data-cy="roadmap-cta-github"
                    >
                        {{ t('roadmap.cta.cta_github', 'Star on GitHub') }}
                    </origam-btn>

                    <origam-btn
                        class="roadmap-cta__btn roadmap-cta__btn--secondary"
                        variant="text"
                        prepend-icon="mdi-file-document-outline"
                        :href="changelogHref"
                        target="_blank"
                        rel="noopener noreferrer"
                        data-cy="roadmap-cta-changelog"
                    >
                        {{ t('roadmap.cta.cta_changelog', 'Read CHANGELOG') }}
                    </origam-btn>
                </nav>
            </div>
        </section>
    </article>
</template>

<style scoped lang="scss">
.roadmap {
    display: flex;
    flex-direction: column;
}

.roadmap-section {
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

.roadmap-hero {
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

.roadmap-status {
    padding-block: var(--origam-space---24, 6rem);
    background: var(--origam-color__surface---sunken, #f5f5f5);
    border-block: 1px solid var(--origam-color__border---default, rgba(0, 0, 0, 0.08));

    &__header {
        margin-block-end: var(--origam-space---10, 2.5rem);
    }

    &__list {
        max-inline-size: 56rem;
        list-style: none;
        padding: 0;
        margin: 0;
    }

    &__item {
        list-style: none;
    }

    &__card {
        block-size: 100%;
    }

    &__row {
        display: flex;
        align-items: flex-start;
        gap: var(--origam-space---3, 0.75rem);
        padding: var(--origam-space---4, 1rem) var(--origam-space---5, 1.25rem);
    }

    &__icon {
        flex-shrink: 0;
        font-size: var(--origam-font-size---xl, 1.25rem);
        margin-block-start: 2px;
    }

    &__label {
        margin: 0;
        font-size: var(--origam-font-size---sm, 0.875rem);
        line-height: 1.6;
        color: var(--origam-color__text---primary, #0a0a0a);
    }
}

.roadmap-delivered {
    padding-block: var(--origam-space---24, 6rem);

    &__header {
        margin-block-end: var(--origam-space---10, 2.5rem);
    }

    &__grid {
        list-style: none;
        padding: 0;
        margin: 0;
    }

    &__wave {
        list-style: none;
        display: flex;
        flex-direction: column;
    }

    &__wave-card {
        block-size: 100%;
    }

    &__wave-title {
        display: block;
        font-size: var(--origam-font-size---base, 1rem);
        font-weight: var(--origam-font__weight---semibold, 600);
        color: var(--origam-color__text---primary, #0a0a0a);
    }

    &__badge {
        margin-inline-end: var(--origam-space---2, 0.5rem);
    }

    &__table {
        inline-size: 100%;
    }

    &__table-icon-cell {
        inline-size: 2rem;
        padding-block: var(--origam-space---1, 0.25rem);
        vertical-align: middle;
    }

    &__table-icon {
        font-size: 1rem;
    }

    &__table-text-cell {
        padding-block: var(--origam-space---1, 0.25rem);
        font-size: var(--origam-font-size---sm, 0.875rem);
        line-height: 1.6;
        color: var(--origam-color__text---primary, #0a0a0a);
        vertical-align: middle;
    }
}

.roadmap-overview {
    list-style: none;
    padding: 0;
    margin: 0 0 var(--origam-space---12, 3rem);

    &__item {
        list-style: none;
        display: flex;
    }

    &__card {
        flex: 1;
        --origam-card---padding-block-start: var(--origam-space---5, 1.25rem);
        --origam-card---padding-block-end: var(--origam-space---5, 1.25rem);
        --origam-card---padding-inline-start: var(--origam-space---4, 1rem);
        --origam-card---padding-inline-end: var(--origam-space---4, 1rem);

        :deep(.origam-card__content) {
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: var(--origam-space---1, 0.25rem);
            text-align: center;
        }
    }

    &__icon {
        margin-block-end: var(--origam-space---1, 0.25rem);
        font-size: var(--origam-font-size---xl, 1.5rem);
    }

    &__value {
        font-size: var(--origam-font-size---section, 2rem);
        font-weight: var(--origam-font__weight---bold, 700);
        line-height: 1.1;
        color: var(--origam-color__text---primary, #0a0a0a);
    }

    &__label {
        font-size: var(--origam-font-size---sm, 0.875rem);
        line-height: 1.4;
        color: var(--origam-color__text---secondary, #525252);
    }
}

.roadmap-timeline-wrap {
    padding-block: var(--origam-space---24, 6rem);
    background: var(--origam-color__surface---sunken, #f5f5f5);
    border-block: 1px solid var(--origam-color__border---default, rgba(0, 0, 0, 0.08));
}

.roadmap-phases {
    &__header {
        margin-block-end: var(--origam-space---12, 3rem);
    }
}

.roadmap-timeline {
    max-inline-size: 54rem;
    --origam-timeline---background-color: transparent;
    --origam-timeline---dot-size: 40px;
    --origam-timeline---track-width: 48px;

    &__phase {
        padding-block-end: var(--origam-space---6, 1.5rem);
    }

    &__card {
        margin-block-start: var(--origam-space---1, 0.25rem);
        --origam-card---background: transparent;
        --origam-card---padding-block-start: var(--origam-space---2, 0.5rem);
        --origam-card---padding-block-end: var(--origam-space---6, 1.5rem);
        --origam-card---padding-inline-start: 0;
        --origam-card---padding-inline-end: 0;
    }

    &__card-header {
        display: flex;
        flex-direction: column;
        gap: var(--origam-space---2, 0.5rem);
        margin-block-end: var(--origam-space---4, 1rem);
    }

    &__phase-chip {
        align-self: flex-start;
    }

    &__phase-title {
        display: block;
        font-size: var(--origam-font-size---xl, 1.25rem);
        font-weight: var(--origam-font__weight---bold, 700);
        color: var(--origam-color__text---primary, #0a0a0a);
    }

    &__items {
        list-style: none;
        padding: 0;
        margin: 0;
    }

    &__item {
        list-style: none;
        display: flex;
        align-items: flex-start;
        gap: var(--origam-space---3, 0.75rem);
    }

    &__item-avatar {
        flex-shrink: 0;
        margin-block-start: 2px;
    }

    &__item-content {
        flex: 1;
        min-inline-size: 0;
    }

    &__item-title {
        display: block;
        font-size: var(--origam-font-size---sm, 0.875rem);
        font-weight: var(--origam-font__weight---semibold, 600);
        color: var(--origam-color__text---primary, #0a0a0a);
        margin-block-end: var(--origam-space---1, 0.25rem);
    }

    &__item-desc {
        margin: 0;
        font-size: var(--origam-font-size---sm, 0.875rem);
        line-height: 1.55;
        color: var(--origam-color__text---secondary, #525252);
    }

    &__effort {
        flex-shrink: 0;
        margin-block-start: 2px;
        font-family: var(--origam-font-family---mono, monospace);
    }
}

.roadmap-wave4 {
    padding-block: var(--origam-space---24, 6rem);

    &__header {
        margin-block-end: var(--origam-space---12, 3rem);
    }

    &__grid {
        list-style: none;
        padding: 0;
        margin: 0;
    }

    &__item {
        list-style: none;
        display: flex;
        flex-direction: column;
    }

    &__card {
        block-size: 100%;
    }

    &__card-inner {
        padding: var(--origam-space---4, 1rem);
        display: flex;
        flex-direction: column;
        gap: var(--origam-space---3, 0.75rem);
    }

    &__card-header {
        display: flex;
        align-items: center;
        gap: var(--origam-space---2, 0.5rem);
        flex-wrap: wrap;
    }

    &__avatar {
        flex-shrink: 0;
    }

    &__cmp-name {
        display: block;
        flex: 1;
        font-size: var(--origam-font-size---sm, 0.875rem);
        font-weight: var(--origam-font__weight---semibold, 600);
        font-family: var(--origam-font-family---mono, monospace);
        color: var(--origam-color__action--primary---fgSubtle, #6d28d9);
    }

    &__shipped-badge {
        flex-shrink: 0;
    }

    &__note {
        margin: 0;
        font-size: var(--origam-font-size---xs, 0.75rem);
        line-height: 1.55;
        color: var(--origam-color__text---secondary, #525252);
    }
}

.roadmap-cta {
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
    .roadmap-hero {
        &__title {
            font-size: clamp(2.5rem, 9vw, 5.25rem);
        }
    }
}

@media (max-width: 768px) {
    .roadmap-section {
        &__title {
            font-size: clamp(1.75rem, 7vw, 3rem);
        }
    }

    .roadmap-cta {
        &__title {
            font-size: clamp(2rem, 8vw, 4rem) !important;
        }
    }

    .roadmap-timeline {
        &__item {
            flex-wrap: wrap;
        }
    }
}

@media (max-width: 640px) {
    .roadmap-delivered {
        &__grid {
            grid-template-columns: 1fr;
        }
    }

    .roadmap-wave4 {
        &__grid {
            grid-template-columns: 1fr;
        }
    }
}
</style>
