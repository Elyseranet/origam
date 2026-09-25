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
                    <template #default>
                        {{ heroBadge }}
                    </template>
                </origam-chip>

                <origam-title
                    id="roadmap-title"
                    tag="h1"
                    class="roadmap-hero__title"
                >
                    <template #default>
                        <span class="roadmap-hero__title-line">{{ t('roadmap.hero.title_line1', 'Roadmap.') }}</span>
                        <span class="roadmap-hero__title-line roadmap-hero__title-line--accent">{{ t('roadmap.hero.title_line2', 'Honest & public.') }}</span>
                    </template>
                </origam-title>

                <p class="roadmap-hero__subtitle">
                    {{ t('roadmap.hero.subtitle', 'origam is an early-stage Vue 3 design system. Here is where we stand today, what we have already shipped, and what is on the horizon.') }}
                </p>

                <nav
                    class="roadmap-hero__actions"
                    :aria-label="t('roadmap.hero.actions_label', 'Explore the roadmap')"
                >
                    <origam-btn
                        class="roadmap-hero__action"
                        variant="text"
                        append-icon="mdi-arrow-down"
                        href="#roadmap-status-title"
                        data-cy="roadmap-hero-status-link"
                    >
                        <template #default>
                            {{ t('roadmap.hero.cta_status', 'See where we stand') }}
                        </template>
                    </origam-btn>

                    <origam-btn
                        class="roadmap-hero__action"
                        variant="text"
                        prepend-icon="mdi-map-marker-path"
                        href="#roadmap-phases-title"
                        data-cy="roadmap-hero-phases-link"
                    >
                        <template #default>
                            {{ t('roadmap.hero.cta_phases', "Jump to what's next") }}
                        </template>
                    </origam-btn>
                </nav>
            </origam-container>
        </section>

        <section
            class="roadmap-status"
            aria-labelledby="roadmap-status-title"
            data-cy="roadmap-status"
        >
            <origam-container>
                <header class="roadmap-status__header roadmap-section">
                    <p class="roadmap-section__eyebrow">
                        {{ t('roadmap.status.eyebrow', 'WHERE WE STAND') }}
                    </p>

                    <origam-title
                        id="roadmap-status-title"
                        tag="h2"
                        class="roadmap-section__title"
                    >
                        <template #default>
                            <span class="roadmap-section__title-line">{{ statusTitleLine1 }}</span>
                            <span class="roadmap-section__title-line roadmap-section__title-line--muted">{{ statusTitleLine2 }}</span>
                        </template>
                    </origam-title>

                    <p class="roadmap-section__subtitle">
                        {{ t('roadmap.status.subtitle', 'An honest snapshot of what works, what is in progress, and what is still missing.') }}
                    </p>
                </header>

                <origam-sheet
                    tag="div"
                    rounded="lg"
                    :border="false"
                    class="roadmap-status__panel"
                    data-cy="roadmap-status-panel"
                >
                    <template #default>
                        <origam-chip
                            size="small"
                            pill
                            prepend-icon="mdi-calendar-check-outline"
                            class="roadmap-measured"
                            data-cy="roadmap-status-measured"
                        >
                            <template #default>
                                {{ t('roadmap.status.measured_on', 'Measured against the repository on 25 September 2026') }}
                            </template>
                        </origam-chip>

                        <origam-grid
                            tag="div"
                            columns="repeat(2, minmax(0, 1fr))"
                            gap="lg"
                            class="roadmap-status__columns"
                        >
                            <origam-grid-item
                                tag="div"
                                class="roadmap-status__col"
                                data-tone="live"
                            >
                                <p class="roadmap-status__col-title roadmap-status__col-title--live">
                                    <origam-icon
                                        icon="mdi-check-circle"
                                        aria-hidden="true"
                                    />
                                    {{ statusLiveTitle }}
                                </p>

                                <ul
                                    class="roadmap-status__list"
                                    data-cy="roadmap-status-live"
                                >
                                    <li
                                        v-for="item in statusLive"
                                        :key="item.labelKey"
                                        class="roadmap-status__item"
                                    >
                                        {{ t(item.labelKey, item.labelKey, statusParams) }}
                                    </li>
                                </ul>
                            </origam-grid-item>

                            <origam-grid-item
                                tag="div"
                                class="roadmap-status__col"
                                data-tone="pending"
                            >
                                <p class="roadmap-status__col-title roadmap-status__col-title--pending">
                                    <origam-icon
                                        icon="mdi-close-circle-outline"
                                        aria-hidden="true"
                                    />
                                    {{ statusPendingTitle }}
                                </p>

                                <ul
                                    class="roadmap-status__list"
                                    data-cy="roadmap-status-pending"
                                >
                                    <li
                                        v-for="item in statusPending"
                                        :key="item.labelKey"
                                        class="roadmap-status__item"
                                    >
                                        {{ t(item.labelKey, item.labelKey, statusParams) }}
                                    </li>
                                </ul>
                            </origam-grid-item>
                        </origam-grid>
                    </template>
                </origam-sheet>
            </origam-container>
        </section>

        <section
            class="roadmap-delivered"
            aria-labelledby="roadmap-delivered-title"
            data-cy="roadmap-delivered"
        >
            <origam-container>
                <header class="roadmap-delivered__header roadmap-section">
                    <p class="roadmap-section__eyebrow">
                        {{ t('roadmap.delivered.eyebrow', 'ALREADY SHIPPED') }}
                    </p>

                    <origam-title
                        id="roadmap-delivered-title"
                        tag="h2"
                        class="roadmap-section__title"
                    >
                        <template #default>
                            <span class="roadmap-section__title-line">{{ t('roadmap.delivered.title_line1', 'A full design system.') }}</span>
                            <span class="roadmap-section__title-line roadmap-section__title-line--muted">{{ t('roadmap.delivered.title_line2', 'Already in production.') }}</span>
                        </template>
                    </origam-title>

                    <p class="roadmap-section__subtitle">
                        {{ t('roadmap.delivered.subtitle', 'origam is not starting from zero — here is the scope already shipped on npm, with the latest waves below.') }}
                    </p>
                </header>

                <origam-chip
                    size="small"
                    pill
                    prepend-icon="mdi-calendar-check-outline"
                    class="roadmap-measured roadmap-measured--standalone"
                    data-cy="roadmap-overview-measured"
                >
                    <template #default>
                        {{ t('roadmap.overview.measured_on', 'Counted from the repository source tree on 25 September 2026') }}
                    </template>
                </origam-chip>

                <origam-grid
                    tag="ul"
                    columns="repeat(3, minmax(0, 1fr))"
                    gap="md"
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

                <origam-sheet
                    tag="div"
                    rounded="lg"
                    :border="false"
                    class="roadmap-delivered__panel"
                    data-cy="roadmap-delivered-waves"
                >
                    <template #default>
                        <origam-grid
                            tag="div"
                            columns="repeat(3, minmax(0, 1fr))"
                            gap="lg"
                            class="roadmap-delivered__waves"
                        >
                            <origam-grid-item
                                v-for="wave in deliveredWaves"
                                :key="wave.titleKey"
                                tag="div"
                                class="roadmap-delivered__wave"
                            >
                                <origam-title
                                    tag="h3"
                                    class="roadmap-delivered__wave-title"
                                >
                                    <template #default>
                                        {{ t(wave.titleKey, wave.titleKey) }}
                                    </template>
                                </origam-title>

                                <ul class="roadmap-delivered__wave-list">
                                    <li
                                        v-for="item in wave.items"
                                        :key="item.nameKey"
                                        class="roadmap-delivered__wave-item"
                                    >
                                        <origam-icon
                                            icon="mdi-check"
                                            color="success"
                                            aria-hidden="true"
                                            class="roadmap-delivered__wave-icon"
                                        />
                                        {{ t(item.nameKey, item.nameKey) }}
                                    </li>
                                </ul>
                            </origam-grid-item>
                        </origam-grid>
                    </template>
                </origam-sheet>
            </origam-container>
        </section>

        <section
            class="roadmap-phases"
            aria-labelledby="roadmap-phases-title"
            data-cy="roadmap-phases"
        >
            <origam-container>
                <header class="roadmap-phases__header roadmap-section">
                    <p class="roadmap-section__eyebrow">
                        {{ t('roadmap.phases.eyebrow', "WHAT'S NEXT") }}
                    </p>

                    <origam-title
                        id="roadmap-phases-title"
                        tag="h2"
                        class="roadmap-section__title roadmap-section__title--single"
                    >
                        <template #default>
                            {{ t('roadmap.phases.title', 'A phased roadmap.') }}
                        </template>
                    </origam-title>

                    <p class="roadmap-section__subtitle">
                        {{ t('roadmap.phases.subtitle', 'Each phase builds on the previous. The order reflects real technical dependencies, not arbitrary milestones. Open a phase to read every item in full.') }}
                    </p>
                </header>

                <div
                    class="roadmap-phases__list"
                    data-cy="roadmap-phases-list"
                >
                    <details
                        v-for="phase in phases"
                        :key="phase.id"
                        :open="phase.defaultOpen"
                        class="roadmap-phases__phase"
                        :data-intent="phase.intent"
                        :data-cy="`roadmap-phase-${phase.id}`"
                    >
                        <summary class="roadmap-phases__summary">
                            <origam-icon
                                :icon="phase.icon"
                                aria-hidden="true"
                                class="roadmap-phases__summary-icon"
                            />

                            <origam-title
                                tag="h3"
                                class="roadmap-phases__summary-title"
                            >
                                <template #default>
                                    {{ t(phase.titleKey, phase.titleKey) }}
                                </template>
                            </origam-title>

                            <origam-chip
                                :color="phase.intent"
                                size="x-small"
                                pill
                                class="roadmap-phases__summary-due"
                            >
                                <template #default>
                                    {{ t(phase.eyebrowKey, phase.eyebrowKey) }}
                                </template>
                            </origam-chip>

                            <span class="roadmap-phases__summary-count">{{ phaseItemsLabels[phase.id] }}</span>

                            <origam-icon
                                icon="mdi-chevron-down"
                                aria-hidden="true"
                                class="roadmap-phases__chevron"
                            />
                        </summary>

                        <origam-grid
                            tag="ul"
                            columns="repeat(2, minmax(0, 1fr))"
                            gap="lg"
                            class="roadmap-phases__items"
                        >
                            <origam-grid-item
                                v-for="item in phase.items"
                                :key="item.titleKey"
                                tag="li"
                                class="roadmap-phases__item"
                            >
                                <origam-avatar
                                    :icon="item.icon"
                                    :color="phase.intent"
                                    rounded="lg"
                                    :size="36"
                                    class="roadmap-phases__item-avatar"
                                    aria-hidden="true"
                                />

                                <div class="roadmap-phases__item-content">
                                    <strong class="roadmap-phases__item-title">
                                        {{ t(item.titleKey, item.titleKey) }}
                                    </strong>

                                    <p class="roadmap-phases__item-desc">
                                        {{ t(item.descriptionKey, item.descriptionKey) }}
                                    </p>
                                </div>

                                <origam-chip
                                    v-if="item.effortKey"
                                    size="x-small"
                                    pill
                                    class="roadmap-phases__effort"
                                    :aria-label="t('a11y.roadmap_effort', 'Effort')"
                                >
                                    <template #default>
                                        {{ t(item.effortKey, item.effortKey) }}
                                    </template>
                                </origam-chip>
                            </origam-grid-item>
                        </origam-grid>
                    </details>
                </div>
            </origam-container>
        </section>

        <section
            class="roadmap-catalogue"
            aria-labelledby="roadmap-catalogue-title"
            data-cy="roadmap-catalogue"
        >
            <origam-container>
                <header class="roadmap-catalogue__header roadmap-section">
                    <p class="roadmap-section__eyebrow">
                        {{ t('roadmap.catalogue.eyebrow', 'THE WHOLE CATALOGUE IS SHIPPED') }}
                    </p>

                    <origam-title
                        id="roadmap-catalogue-title"
                        tag="h2"
                        class="roadmap-section__title"
                    >
                        <template #default>
                            <span class="roadmap-section__title-line">{{ catalogueTitleLine1 }}</span>
                            <span class="roadmap-section__title-line roadmap-section__title-line--muted">{{ t('roadmap.catalogue.title_line2', 'already shipped.') }}</span>
                        </template>
                    </origam-title>

                    <p class="roadmap-section__subtitle">
                        {{ t('roadmap.catalogue.subtitle', 'Every component in origam is published on npm and usable today — there is no waiting list. What is left to build is above, in the roadmap phases.') }}
                    </p>
                </header>

                <origam-chip
                    size="small"
                    pill
                    prepend-icon="mdi-database-outline"
                    class="roadmap-measured roadmap-measured--standalone"
                    data-cy="roadmap-catalogue-measured"
                >
                    <template #default>
                        {{ catalogueMeasuredLabel }}
                    </template>
                </origam-chip>

                <origam-grid
                    v-if="hasCatalogue"
                    tag="ul"
                    columns="minmax(0, 1fr)"
                    gap="lg"
                    class="roadmap-catalogue__groups"
                    data-cy="roadmap-catalogue-groups"
                >
                    <origam-grid-item
                        v-for="group in catalogueGroups"
                        :key="group.key"
                        tag="li"
                        class="roadmap-catalogue__group"
                        :data-cy="group.dataCy"
                    >
                        <header class="roadmap-catalogue__group-header">
                            <origam-title
                                tag="h3"
                                class="roadmap-catalogue__group-title"
                            >
                                <template #default>
                                    {{ group.label }}
                                </template>
                            </origam-title>

                            <origam-chip
                                size="x-small"
                                pill
                                class="roadmap-catalogue__group-count"
                            >
                                <template #default>
                                    {{ group.count }}
                                </template>
                            </origam-chip>
                        </header>

                        <ul class="roadmap-catalogue__chips">
                            <li
                                v-for="component in group.links"
                                :key="component.slug"
                                class="roadmap-catalogue__chip-item"
                            >
                                <origam-chip
                                    link
                                    pill
                                    size="small"
                                    :to="component.to"
                                    class="roadmap-catalogue__chip"
                                    :data-cy="`roadmap-catalogue-component-${ component.slug }`"
                                >
                                    <template #default>
                                        {{ component.name }}
                                    </template>
                                </origam-chip>
                            </li>
                        </ul>
                    </origam-grid-item>
                </origam-grid>

                <origam-empty-state
                    v-else
                    preset="offline"
                    align="left"
                    size="sm"
                    class="roadmap-catalogue__empty"
                    :title="t('roadmap.catalogue.empty_title', 'Catalogue unavailable right now')"
                    :description="t('roadmap.catalogue.empty_description', 'The component list could not be loaded. Every component is still published on npm — browse them on the components page.')"
                    data-cy="roadmap-catalogue-empty"
                >
                    <template #actions>
                        <origam-btn
                            variant="text"
                            prepend-icon="mdi-shape-outline"
                            :to="componentsHref"
                            data-cy="roadmap-catalogue-empty-link"
                        >
                            <template #default>
                                {{ t('roadmap.catalogue.empty_cta', 'Browse the components') }}
                            </template>
                        </origam-btn>
                    </template>
                </origam-empty-state>
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
                    <template #default>
                        {{ t('roadmap.cta.title', 'Follow the progress.') }}
                    </template>
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
                        <template #default>
                            {{ t('roadmap.cta.cta_github', 'Star on GitHub') }}
                        </template>
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
                        <template #default>
                            {{ t('roadmap.cta.cta_changelog', 'Read CHANGELOG') }}
                        </template>
                    </origam-btn>
                </nav>
            </div>
        </section>
    </article>
</template>

<script setup lang="ts">
    import { computed } from 'vue'
    import { useT } from '~/composables/useT'
    import { useVersion } from '~/composables/useVersion'
    import { useReferenceCatalog, useReferenceCategories } from '~/composables/useApiReference'
    import {
        ROADMAP_HERO_BADGE_VARS,
        ROADMAP_STATUS_ITEMS,
        ROADMAP_OVERVIEW_STATS,
        ROADMAP_DELIVERED_WAVES,
        ROADMAP_PHASES,
        ROADMAP_CATALOGUE_FALLBACK_CATEGORY
    } from '~/consts/roadmap.const'
    import { MARKETING_DEFAULTS } from '~/consts/marketing.const'
    import { groupComponentsByCategory } from '~/utils/components-catalog.util'
    import type { IComponentEntry } from '~/interfaces/components-catalog.interface'
    import type { IRoadmapCatalogueGroup } from '~/interfaces/roadmap.interface'

    /*********************************************************
     * Global
     *
     * @description
     * Translation entry point and the LIVE package version. The badge used to
     * hardcode "v2.6.0", which drifted four minor versions behind what npm
     * actually served. `useVersion` is the single source of truth (live
     * registry, build-time fallback) — the same one the home hero reads, so a
     * release only requires bumping the package, never editing a badge string.
     ********************************************************/
    const { t } = useT()
    const { version } = useVersion()

    useSeoMeta({
        title: () => t('roadmap.meta.title', 'Roadmap · origam design system'),
        description: () => t('roadmap.meta.description', 'Where origam is today, what has been delivered, and what is coming next.'),
        ogTitle: () => t('roadmap.meta.title', 'Roadmap · origam design system'),
        ogDescription: () => t('roadmap.meta.description', 'Where origam is today, what has been delivered, and what is coming next.')
    })

    /*********************************************************
     * Version interpolation
     *
     * @description
     * #913 — the SAME page rendered two different versions of itself. Fifteen
     * lines under the badge, the "WHERE WE STAND" title read a locale value
     * whose text was the LITERAL string "Where 2.17.1" — no interpolation, so
     * `useVersion()` never reached it. #743 had already fixed the badge this
     * way and left the title behind; substituting a fresh number in the locale
     * would only restart the same drift, eight versions later.
     *
     * BOTH title halves take `{version}` even though only line 1 uses it
     * today: the number sits on line 1 in EN and the FR value was reshaped to
     * match, so `i18n:check`'s EN/FR placeholder parity stays at 0 gaps.
     * Handing the parameter to both means a future rewording can move the
     * number across without touching this file.
     *
     * `statusParams` hands `{ version }` to EVERY status entry rather than to
     * the one that needs it today: vue-i18n drops a named parameter a message
     * does not reference, so this costs nothing and means the next status line
     * that wants the live version only edits a locale value — no code change at
     * all. `roadmap.status.npm_published` is the one consuming it today.
     ********************************************************/
    const heroBadge = computed(() =>
        t('roadmap.hero.badge', `v${ version.value } — Wave 4 shipped`, { version: version.value })
    )

    const statusTitleLine1 = computed(() =>
        t('roadmap.status.title_line1', `Where ${ version.value }`, { version: version.value })
    )

    const statusTitleLine2 = computed(() =>
        t('roadmap.status.title_line2', 'stands.', { version: version.value })
    )

    const statusParams = computed(() => ({ version: version.value }))

    /*********************************************************
     * Status — two columns instead of nineteen identical rows
     *
     * @description
     * The status used to render as a flat list of 19 rows, each a bordered
     * card carrying the same icon + text rhythm, with a green tick or a red
     * cross as the ONLY carrier of the distinction — invisible to a
     * red-green colour-blind reader.
     *
     * Splitting the same 19 items into "live today" / "not yet" moves that
     * information onto the column POSITION and the column TITLE, where colour
     * is a reinforcement rather than the signal. No item is dropped: the two
     * arrays below partition `ROADMAP_STATUS_ITEMS`, and the counts in the
     * column titles are derived from the arrays, so they cannot drift from
     * what is rendered underneath them.
     ********************************************************/
    const statusLive = computed(() => ROADMAP_STATUS_ITEMS.filter(item => item.done))
    const statusPending = computed(() => ROADMAP_STATUS_ITEMS.filter(item => !item.done))

    const statusLiveTitle = computed(() =>
        t('roadmap.status.live_title', `Live today (${ statusLive.value.length })`, { count: statusLive.value.length })
    )

    const statusPendingTitle = computed(() =>
        t('roadmap.status.pending_title', `Not yet (${ statusPending.value.length })`, { count: statusPending.value.length })
    )

    /*********************************************************
     * Page data
     *
     * @description
     * `ROADMAP_DELIVERED_WAVES` holds waves 1 to 3 only. Wave 4 no longer has
     * a section of its own: its 15 members are in the shipped-catalogue
     * section below, alongside every other component.
     ********************************************************/
    const overviewStats = computed(() => ROADMAP_OVERVIEW_STATS)
    const deliveredWaves = computed(() => ROADMAP_DELIVERED_WAVES)
    const phases = computed(() => ROADMAP_PHASES)

    /*********************************************************
     * Phase summaries
     *
     * @description
     * Each `<summary>` announces how many items the phase hides, so a reader
     * decides whether to open it without opening it. The count is resolved
     * here, keyed by phase id, rather than computed in the template: the
     * template stays free of expressions and reads a plain property.
     ********************************************************/
    const phaseItemsLabels = computed<Record<string, string>>(() =>
        Object.fromEntries(
            ROADMAP_PHASES.map(phase => [
                phase.id,
                t('roadmap.phases.items_count', `${ phase.items.length } items`, { count: phase.items.length })
            ])
        )
    )

    /*********************************************************
     * Outbound links
     ********************************************************/
    const githubHref = computed(() => MARKETING_DEFAULTS.githubRepo)
    const changelogHref = computed(() => `${ MARKETING_DEFAULTS.githubRepo }/blob/main/CHANGELOG.md`)

    /*********************************************************
     * Shipped catalogue
     *
     * @description
     * The section this replaces was titled "15 components & features / already
     * shipped" and rendered 15 hand-written tiles. A reader counted 15 and
     * concluded origam ships 15 components, while the whole catalogue is
     * published. Two things had to change together — the wording AND the
     * source.
     *
     * ⛔ A corrected literal would have been the same defect with a nicer
     * number. The catalogue is editorial data and its size DIFFERS PER
     * ENVIRONMENT — measured the day this was written: 218 entries on the
     * local dev server, 194 on the deployed one. A hardcoded figure would
     * therefore already have been false on one of the two, before any
     * component was ever merged. So nothing here counts: the title, the pill
     * and the list all read the response the page just received, and the
     * `t()` fallbacks take `{count}` rather than a number.
     *
     * Same two endpoints as `pages/components/index.vue`, so there is one
     * source of truth and the Nuxt fetch cache is shared when a visitor walks
     * from one page to the other. The difference is the SCOPE: that page shows
     * the top-level families, this one shows every entry, because the claim it
     * makes is about the whole catalogue.
     *
     * ⛔ These two awaits are LAST in the script on purpose. A top-level await
     * splits `setup()`, and anything registered after the split runs outside
     * the synchronous window Vue expects for lifecycle registration. Every
     * statement above is therefore already evaluated when the first fetch
     * suspends, and nothing below registers a hook.
     ********************************************************/
    const localePath = useLocalePath()

    const { data: catalogueData } = await useReferenceCatalog<IComponentEntry>('component')
    const { data: catalogueCategoriesData } = await useReferenceCategories('component')

    const catalogueEntries = computed<IComponentEntry[]>(() => catalogueData.value ?? [])
    const catalogueCategories = computed<string[]>(() => catalogueCategoriesData.value ?? [])
    const catalogueCount = computed(() => catalogueEntries.value.length)
    const hasCatalogue = computed(() => catalogueCount.value > 0)

    /*
     * The fallback bucket is the only group whose label is translated: every
     * other one is the raw `doc_entry.category` value the API serves, which is
     * what `/components` renders too. Translating those would need a key per
     * category, kept in sync by hand with editable DB rows — the exact drift
     * this section was rewritten to remove.
     */
    const catalogueGroups = computed<IRoadmapCatalogueGroup[]>(() =>
        groupComponentsByCategory(
            catalogueEntries.value,
            catalogueCategories.value,
            ROADMAP_CATALOGUE_FALLBACK_CATEGORY
        ).map(group => ({
            key: group.category,
            label: group.category === ROADMAP_CATALOGUE_FALLBACK_CATEGORY
                ? t('roadmap.catalogue.category_other', 'Other')
                : group.category,
            count: group.entries.length,
            dataCy: `roadmap-catalogue-category-${ group.category.toLowerCase().replace(/[^a-z0-9]+/g, '-') }`,
            links: group.entries.map(entry => ({
                slug: entry.slug,
                name: entry.name,
                to: localePath(`/components/${ entry.slug }`)
            }))
        }))
    )

    const catalogueTitleLine1 = computed(() =>
        hasCatalogue.value
            ? t('roadmap.catalogue.title_line1', `${ catalogueCount.value } components`, { count: catalogueCount.value })
            : t('roadmap.catalogue.title_line1_unavailable', 'The whole component catalogue')
    )

    const catalogueMeasuredLabel = computed(() =>
        hasCatalogue.value
            ? t(
                'roadmap.catalogue.measured_live',
                `${ catalogueCount.value } components in ${ catalogueGroups.value.length } categories, read live from the catalogue`,
                { count: catalogueCount.value, categories: catalogueGroups.value.length }
            )
            : t('roadmap.catalogue.measured_unavailable', 'Read live from the catalogue')
    )

    const componentsHref = computed(() => localePath('/components'))
</script>

<style scoped lang="scss">
    @use '../assets/scss/why-section' as why;

    .roadmap-section {
        @include why.why-section-header;

        /*
          The site chrome is a FIXED app bar. Without this, the hero's two
          anchor links scroll their target heading to viewport top and the
          bar covers it — measured in Chromium before this rule:
          `#roadmap-status-title` landed at `top: 0` under a 56 px bar, i.e.
          the reader jumps to a section whose title is invisible. The token
          carries the bar height (64 px), the extra rung is breathing room.
        */
        &__title {
            scroll-margin-block-start: calc(
                var(--origam-app-bar---height, 64px) + var(--origam-space---6, 1.5rem)
            );
        }
    }

    .roadmap {
        display: flex;
        flex-direction: column;
    }

    .roadmap-measured {
        --origam-chip---background-color: var(--origam-color__surface---sunken);

        align-self: flex-start;
        margin-block-end: var(--origam-space---5, 1.25rem);
        font-family: var(--origam-font__family---mono, monospace);
        color: var(--origam-color__text---secondary, #525252);

        &--standalone {
            display: inline-flex;
            margin-block-end: var(--origam-space---4, 1rem);
        }
    }

    .roadmap-hero {
        position: relative;
        padding-block: var(--origam-space---20, 5rem) var(--origam-space---10, 2.5rem);
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
            gap: var(--origam-space---5, 1.25rem);
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
    }

    .roadmap-status {
        padding-block: var(--origam-space---24, 6rem);
        border-block: 1px solid var(--origam-color__border---default, rgba(0, 0, 0, 0.08));

        &__header {
            margin-block-end: var(--origam-space---10, 2.5rem);
        }

        /*
          ⛔ The padding goes through the component's OWN vars, not through
          `<origam-sheet padding="6">`. The prop is not ignored by accident —
          it emits `.origam--p-6`, a (0,1,0) utility declaring the `padding`
          SHORTHAND, while `OrigamSheet`'s scoped rule declares all four
          longhands at (0,2,0). The utility can never win, whatever the load
          order. Measured in Chromium on this page: class present,
          `padding-top` computed `0px`. Same cascade family as #391 / #514.
          Reported — do not "restore" the prop here, it would render nothing.
        */
        &__panel {
            display: block;
            --origam-sheet---padding-block-start: var(--origam-space---6, 1.5rem);
            --origam-sheet---padding-block-end: var(--origam-space---6, 1.5rem);
            --origam-sheet---padding-inline-start: var(--origam-space---6, 1.5rem);
            --origam-sheet---padding-inline-end: var(--origam-space---6, 1.5rem);
        }

        /*
          `success---fg` is the ON-SATURATED foreground (white on a green
          fill); under the `geek` identity it resolves to `#000000`, which is
          why this rule reads `fgSubtle` — the intent's own hue, meant for a
          neutral surface, `#166534`. /why-origam's `use_cases` column still
          uses `---fg` here and paints a black rule instead of a green one.
        */
        &__col {
            padding-inline-start: var(--origam-space---5, 1.25rem);
            border-inline-start: 2px solid var(--origam-color__border---subtle);

            &[data-tone='live'] {
                border-inline-start-color: var(--origam-color__feedback--success---fgSubtle, #166534);
            }
        }

        &__col-title {
            display: flex;
            align-items: center;
            gap: var(--origam-space---2, 0.5rem);
            margin: 0 0 var(--origam-space---4, 1rem);
            font-size: var(--origam-font__size---lg, 1rem);
            font-weight: var(--origam-font__weight---semibold, 600);

            &--live {
                color: var(--origam-color__feedback--success---fgSubtle, #15803d);
            }

            &--pending {
                color: var(--origam-color__text---secondary, #525252);
            }
        }

        &__list {
            margin: 0;
            padding: 0;
            list-style: none;
            display: flex;
            flex-direction: column;
            gap: var(--origam-space---3, 0.75rem);
        }

        &__item {
            font-size: var(--origam-font-size---sm, 0.875rem);
            line-height: 1.6;
            color: var(--origam-color__text---secondary, #525252);
        }
    }

    .roadmap-delivered {
        padding-block: var(--origam-space---24, 6rem);

        &__header {
            margin-block-end: var(--origam-space---8, 2rem);
        }

        &__panel {
            display: block;
            --origam-sheet---padding-block-start: var(--origam-space---6, 1.5rem);
            --origam-sheet---padding-block-end: var(--origam-space---6, 1.5rem);
            --origam-sheet---padding-inline-start: var(--origam-space---6, 1.5rem);
            --origam-sheet---padding-inline-end: var(--origam-space---6, 1.5rem);
        }

        &__wave {
            padding-inline-start: var(--origam-space---5, 1.25rem);
            border-inline-start: 2px solid var(--origam-color__border---subtle);
        }

        &__wave-title {
            margin: 0 0 var(--origam-space---4, 1rem);
            font-size: var(--origam-font-size---sm, 0.875rem) !important;
            font-weight: var(--origam-font__weight---semibold, 600);
            text-transform: uppercase;
            letter-spacing: var(--origam-letter-spacing---wide, 0.08em);
            color: var(--origam-color__text---primary, #0a0a0a);
        }

        &__wave-list {
            margin: 0;
            padding: 0;
            list-style: none;
            display: flex;
            flex-direction: column;
            gap: var(--origam-space---2, 0.5rem);
        }

        &__wave-item {
            display: grid;
            grid-template-columns: auto minmax(0, 1fr);
            align-items: start;
            gap: var(--origam-space---2, 0.5rem);
            font-size: var(--origam-font-size---sm, 0.875rem);
            line-height: 1.55;
            color: var(--origam-color__text---secondary, #525252);
        }

        &__wave-icon {
            font-size: var(--origam-font__size---lg, 1rem);
            margin-block-start: 0.15em;
        }
    }

    .roadmap-overview {
        list-style: none;
        padding: 0;
        margin: 0 0 var(--origam-space---10, 2.5rem);

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

    .roadmap-phases {
        padding-block: var(--origam-space---24, 6rem);
        border-block: 1px solid var(--origam-color__border---default, rgba(0, 0, 0, 0.08));

        &__header {
            margin-block-end: var(--origam-space---10, 2.5rem);
        }

        &__list {
            display: flex;
            flex-direction: column;
            gap: var(--origam-space---4, 1rem);
        }

        &__phase {
            border: 1px solid var(--origam-color__border---subtle);
            border-radius: var(--origam-radius---lg, 12px);
            background: var(--origam-color__surface---default);
            overflow: hidden;
        }

        &__summary {
            display: flex;
            align-items: center;
            flex-wrap: wrap;
            gap: var(--origam-space---3, 0.75rem);
            min-block-size: 44px;
            padding: var(--origam-space---4, 1rem) var(--origam-space---5, 1.25rem);
            cursor: pointer;
            list-style: none;

            &::-webkit-details-marker {
                display: none;
            }

            &:hover {
                background: var(--origam-color__surface---raised);
            }

            &:focus-visible {
                outline: 2px solid var(--origam-color__action--primary---bg);
                outline-offset: -2px;
            }
        }

        &__summary-icon {
            flex-shrink: 0;
            font-size: var(--origam-font-size---xl, 1.25rem);
            color: var(--origam-color__text---secondary);
        }

        &__summary-title {
            margin: 0;
            flex: 1 1 auto;
            min-inline-size: 0;
            font-size: var(--origam-font-size---lg, 1.125rem) !important;
            font-weight: var(--origam-font__weight---bold, 700);
            color: var(--origam-color__text---primary, #0a0a0a);
        }

        &__summary-due {
            flex-shrink: 0;
        }

        &__summary-count {
            flex-shrink: 0;
            font-size: var(--origam-font-size---sm, 0.875rem);
            font-family: var(--origam-font__family---mono, monospace);
            color: var(--origam-color__text---secondary, #525252);
        }

        &__chevron {
            flex-shrink: 0;
            font-size: var(--origam-font-size---xl, 1.25rem);
            color: var(--origam-color__text---secondary, #525252);
        }

        &__items {
            list-style: none;
            margin: 0;
            padding: 0 var(--origam-space---5, 1.25rem) var(--origam-space---6, 1.5rem);
            border-block-start: 1px solid var(--origam-color__border---subtle);
            padding-block-start: var(--origam-space---5, 1.25rem);
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
            font-family: var(--origam-font__family---mono, monospace);
        }
    }

    @media (prefers-reduced-motion: no-preference) {
        .roadmap-phases__chevron {
            transition: rotate var(--origam-motion__duration---fast, 100ms) var(--origam-motion__easing---standard, cubic-bezier(0.4, 0, 0.2, 1));
        }
    }

    .roadmap-phases__phase[open] .roadmap-phases__chevron {
        rotate: 180deg;
    }

    .roadmap-catalogue {
        padding-block: var(--origam-space---24, 6rem);

        &__header {
            margin-block-end: var(--origam-space---6, 1.5rem);
        }

        &__groups {
            list-style: none;
            padding: 0;
            margin: 0;
        }

        &__group {
            list-style: none;
        }

        &__group-header {
            display: flex;
            align-items: center;
            gap: var(--origam-space---3, 0.75rem);
            margin-block-end: var(--origam-space---4, 1rem);
            padding-block-end: var(--origam-space---2, 0.5rem);
            border-block-end: 1px solid var(--origam-color__border---default, rgba(0, 0, 0, 0.08));
        }

        &__group-title {
            display: block;
            margin: 0;
            font-size: var(--origam-font__size---lg, 1rem) !important;
            font-weight: var(--origam-font__weight---semibold, 600);
            color: var(--origam-color__text---primary, #0a0a0a);
        }

        &__group-count {
            --origam-chip---background-color: var(--origam-color__surface---sunken);

            flex-shrink: 0;
            font-family: var(--origam-font__family---mono, monospace);
        }

        &__chips {
            display: flex;
            flex-wrap: wrap;
            gap: var(--origam-space---2, 0.5rem);
            list-style: none;
            padding: 0;
            margin: 0;
        }

        &__chip-item {
            list-style: none;
            display: flex;
        }

        &__chip {
            --origam-chip---background-color: var(--origam-color__surface---sunken);

            font-family: var(--origam-font__family---mono, monospace);
            text-decoration: none;
            color: var(--origam-color__text---secondary, #525252);

            &:hover {
                --origam-chip---background-color: var(--origam-color__action--primary---bgSubtle, #ede9fe);

                color: var(--origam-color__action--primary---fgSubtle, #6d28d9);
            }

            &:focus-visible {
                outline: 2px solid var(--origam-color__action--primary---bg, #7c3aed);
                outline-offset: 2px;
            }
        }

        &__empty {
            margin-block-start: var(--origam-space---4, 1rem);
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

    @media (max-width: 48rem) {
        .roadmap-status__columns,
        .roadmap-delivered__waves,
        .roadmap-phases__items {
            grid-template-columns: minmax(0, 1fr);
        }

        /*
          6 numbers divide by 2, so two columns fill without a remainder.
          The 15 wave-4 tiles do NOT — two columns would strand the 15th
          alone on its own row, the exact orphan this redesign removed from
          the numbers grid. They keep 3 columns down to this breakpoint
          (15 / 3 = 5 full rows) and drop straight to 1 below it.
        */
        .roadmap-overview {
            grid-template-columns: repeat(2, minmax(0, 1fr));
        }

        .roadmap-cta {
            &__title {
                font-size: clamp(2rem, 8vw, 4rem) !important;
            }
        }

        .roadmap-phases {
            &__summary-title {
                flex: 1 1 100%;
                order: -1;
            }

            &__item {
                flex-wrap: wrap;
            }
        }
    }
</style>
