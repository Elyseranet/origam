<script setup lang="ts">
import { useT } from '~/composables/useT'
import { WIREFRAMES, WIREFRAME_HERO_BADGE_VARS } from '~/consts/wireframes.const'

const { t } = useT()

useSeoMeta({
    title: () => t('wireframe.meta.title', 'Wireframes · origam design system'),
    description: () => t('wireframe.meta.description', 'See complete UI layouts — dashboard, auth, settings, pricing and more — built entirely with origam components. No custom HTML, just the DS.'),
    ogTitle: () => t('wireframe.meta.title', 'Wireframes · origam design system'),
    ogDescription: () => t('wireframe.meta.description', 'See complete UI layouts built entirely with origam components.')
})
</script>

<template>
    <article
        class="wireframe-page"
        data-cy="page-wireframe"
    >
        <section
            class="wireframe-hero"
            aria-labelledby="wireframe-title"
        >
            <origam-container class="wireframe-hero__inner">
                <origam-chip
                    class="wireframe-hero__badge"
                    :style="WIREFRAME_HERO_BADGE_VARS"
                    color="primary"
                    border
                    border-color="var(--origam-color__action--primary---bg)"
                    size="small"
                    pill
                    data-cy="wireframe-hero-badge"
                >
                    {{ t('wireframe.hero.badge', '6 layouts — 100% origam') }}
                </origam-chip>

                <origam-title
                    id="wireframe-title"
                    tag="h1"
                    class="wireframe-hero__title"
                >
                    <span class="wireframe-hero__title-line">{{ t('wireframe.hero.title_line1', 'Wireframes') }}</span>
                    <span class="wireframe-hero__title-line wireframe-hero__title-line--accent">{{ t('wireframe.hero.title_line2', 'with origam.') }}</span>
                </origam-title>

                <p class="wireframe-hero__subtitle">
                    {{ t('wireframe.hero.subtitle', 'Complete UI layouts built exclusively with origam components. No custom HTML, no raw CSS hacks — just the design system doing what it\'s designed for.') }}
                </p>
            </origam-container>
        </section>

        <section
            class="wireframe-gallery"
            aria-labelledby="wireframe-gallery-title"
            data-cy="wireframe-gallery"
        >
            <origam-container>
                <header class="wireframe-gallery__header">
                    <p class="wireframe-section__eyebrow">
                        {{ t('wireframe.gallery.eyebrow', 'LAYOUT PATTERNS') }}
                    </p>

                    <origam-title
                        id="wireframe-gallery-title"
                        tag="h2"
                        class="wireframe-section__title wireframe-section__title--single"
                    >
                        {{ t('wireframe.gallery.title', 'Ready-made layouts.') }}
                    </origam-title>

                    <p class="wireframe-section__subtitle">
                        {{ t('wireframe.gallery.subtitle', 'Each wireframe below is a live render — not an image. Resize, inspect and copy the markup.') }}
                    </p>
                </header>

                <origam-grid
                    tag="ul"
                    columns="repeat(auto-fill, minmax(320px, 1fr))"
                    gap="2rem"
                    class="wireframe-gallery__grid"
                >
                    <origam-grid-item
                        v-for="layout in WIREFRAMES"
                        :key="layout.id"
                        tag="li"
                        class="wireframe-gallery__item"
                        :data-cy="`wireframe-item-${layout.id}`"
                    >
                        <origam-card
                            class="wireframe-card"
                            rounded="lg"
                            border
                        >
                            <template #default>
                                <div class="wireframe-card__inner">
                                    <header class="wireframe-card__meta">
                                        <origam-avatar
                                            :icon="layout.icon"
                                            color="primary"
                                            rounded="lg"
                                            size="40"
                                            class="wireframe-card__icon"
                                            aria-hidden="true"
                                        />

                                        <div class="wireframe-card__meta-text">
                                            <origam-title
                                                tag="h3"
                                                class="wireframe-card__title"
                                            >
                                                {{ t(layout.titleKey, layout.titleFallback) }}
                                            </origam-title>

                                            <p class="wireframe-card__description">
                                                {{ t(layout.descriptionKey, layout.descriptionFallback) }}
                                            </p>
                                        </div>
                                    </header>

                                    <div
                                        class="wireframe-card__preview"
                                        :data-cy="`wireframe-preview-${layout.id}`"
                                        inert
                                    >
                                        <client-only>
                                            <template v-if="layout.id === 'dashboard'">
                                                <div class="wf wf--dashboard">
                                                    <div class="wf__sidebar">
                                                        <origam-skeleton
                                                            shape="text"
                                                            :pulse="false"
                                                            width="60%"
                                                            height="12px"
                                                            rounded="sm"
                                                            class="wf__logo"
                                                        />
                                                        <origam-divider class="wf__sidebar-divider" />
                                                        <origam-list density="compact" nav class="wf__nav">
                                                            <origam-list-item
                                                                v-for="n in 5"
                                                                :key="n"
                                                                :class="{ 'wf__nav-item--active': n === 1 }"
                                                                density="compact"
                                                            >
                                                                <template #prepend>
                                                                    <origam-skeleton
                                                                        shape="circular"
                                                                        :pulse="false"
                                                                        width="14px"
                                                                        rounded="full"
                                                                        class="wf__nav-icon"
                                                                    />
                                                                </template>
                                                                <origam-skeleton
                                                                    shape="text"
                                                                    :pulse="false"
                                                                    :width="`${55 + n * 7}%`"
                                                                    height="10px"
                                                                    rounded="sm"
                                                                />
                                                            </origam-list-item>
                                                        </origam-list>
                                                    </div>

                                                    <div class="wf__main">
                                                        <div class="wf__topbar">
                                                            <origam-skeleton
                                                                shape="text"
                                                                :pulse="false"
                                                                width="120px"
                                                                height="12px"
                                                                rounded="sm"
                                                            />
                                                            <origam-spacer />
                                                            <origam-skeleton
                                                                shape="circular"
                                                                :pulse="false"
                                                                width="24px"
                                                                rounded="full"
                                                            />
                                                        </div>

                                                        <origam-grid
                                                            columns="repeat(3, 1fr)"
                                                            gap="0.5rem"
                                                            class="wf__stat-grid"
                                                        >
                                                            <origam-grid-item
                                                                v-for="k in 3"
                                                                :key="k"
                                                            >
                                                                <origam-card
                                                                    class="wf__stat-card"
                                                                    rounded="md"
                                                                    border
                                                                    flat
                                                                >
                                                                    <template #default>
                                                                        <div class="wf__stat-inner">
                                                                            <origam-skeleton
                                                                                shape="text"
                                                                                :pulse="false"
                                                                                width="40%"
                                                                                height="8px"
                                                                                rounded="sm"
                                                                            />
                                                                            <origam-skeleton
                                                                                shape="text"
                                                                                :pulse="false"
                                                                                width="55%"
                                                                                height="18px"
                                                                                rounded="sm"
                                                                            />
                                                                        </div>
                                                                    </template>
                                                                </origam-card>
                                                            </origam-grid-item>
                                                        </origam-grid>

                                                        <origam-card
                                                            class="wf__chart-placeholder"
                                                            rounded="md"
                                                            border
                                                            flat
                                                        >
                                                            <template #default>
                                                                <origam-skeleton
                                                                    shape="rectangular"
                                                                    :pulse="false"
                                                                    height="100%"
                                                                />
                                                            </template>
                                                        </origam-card>
                                                    </div>
                                                </div>
                                            </template>

                                            <template v-else-if="layout.id === 'settings'">
                                                <div class="wf wf--settings">
                                                    <div class="wf__settings-sidebar">
                                                        <origam-list density="compact" nav class="wf__settings-nav">
                                                            <origam-list-subheader>
                                                                <origam-skeleton
                                                                    shape="text"
                                                                    :pulse="false"
                                                                    width="60%"
                                                                    height="8px"
                                                                    rounded="sm"
                                                                />
                                                            </origam-list-subheader>
                                                            <origam-list-item
                                                                v-for="n in 4"
                                                                :key="n"
                                                                density="compact"
                                                                :class="{ 'wf__nav-item--active': n === 1 }"
                                                            >
                                                                <origam-skeleton
                                                                    shape="text"
                                                                    :pulse="false"
                                                                    :width="`${50 + n * 8}%`"
                                                                    height="10px"
                                                                    rounded="sm"
                                                                />
                                                            </origam-list-item>
                                                        </origam-list>
                                                    </div>

                                                    <div class="wf__settings-content">
                                                        <origam-skeleton
                                                            shape="text"
                                                            :pulse="false"
                                                            width="40%"
                                                            height="14px"
                                                            rounded="sm"
                                                            class="wf__settings-title"
                                                        />

                                                        <div
                                                            v-for="row in 3"
                                                            :key="row"
                                                            class="wf__settings-row"
                                                        >
                                                            <origam-skeleton
                                                                shape="text"
                                                                :pulse="false"
                                                                width="30%"
                                                                height="8px"
                                                                rounded="sm"
                                                            />
                                                            <origam-skeleton
                                                                shape="rectangular"
                                                                :pulse="false"
                                                                height="22px"
                                                                rounded="sm"
                                                            />
                                                        </div>

                                                        <div class="wf__settings-toggle-row">
                                                            <origam-skeleton
                                                                shape="text"
                                                                :pulse="false"
                                                                width="50%"
                                                                height="9px"
                                                                rounded="sm"
                                                            />
                                                            <origam-skeleton
                                                                shape="rectangular"
                                                                :pulse="false"
                                                                width="32px"
                                                                height="18px"
                                                                rounded="xl"
                                                            />
                                                        </div>

                                                        <origam-divider class="wf__settings-divider" />

                                                        <div class="wf__settings-actions">
                                                            <origam-btn
                                                                color="primary"
                                                                size="small"
                                                                variant="flat"
                                                                disabled
                                                                aria-hidden="true"
                                                            >
                                                                {{ t('wireframe.preview.save', 'Save') }}
                                                            </origam-btn>
                                                            <origam-btn
                                                                size="small"
                                                                variant="outlined"
                                                                disabled
                                                                aria-hidden="true"
                                                            >
                                                                {{ t('wireframe.preview.cancel', 'Cancel') }}
                                                            </origam-btn>
                                                        </div>
                                                    </div>
                                                </div>
                                            </template>

                                            <template v-else-if="layout.id === 'auth'">
                                                <div class="wf wf--auth">
                                                    <origam-card
                                                        class="wf__auth-card"
                                                        rounded="lg"
                                                        border
                                                        flat
                                                    >
                                                        <template #default>
                                                            <div class="wf__auth-inner">
                                                                <origam-skeleton
                                                                    shape="circular"
                                                                    :pulse="false"
                                                                    width="36px"
                                                                    rounded="full"
                                                                    class="wf__auth-logo"
                                                                />

                                                                <origam-skeleton
                                                                    shape="text"
                                                                    :pulse="false"
                                                                    width="50%"
                                                                    height="13px"
                                                                    rounded="sm"
                                                                    class="wf__auth-headline"
                                                                />

                                                                <div class="wf__auth-fields">
                                                                    <div
                                                                        v-for="f in 2"
                                                                        :key="f"
                                                                        class="wf__auth-field"
                                                                    >
                                                                        <origam-skeleton
                                                                            shape="text"
                                                                            :pulse="false"
                                                                            width="35%"
                                                                            height="8px"
                                                                            rounded="sm"
                                                                        />
                                                                        <origam-skeleton
                                                                            shape="rectangular"
                                                                            :pulse="false"
                                                                            height="24px"
                                                                            rounded="sm"
                                                                        />
                                                                    </div>
                                                                </div>

                                                                <origam-btn
                                                                    color="primary"
                                                                    block
                                                                    size="small"
                                                                    variant="flat"
                                                                    disabled
                                                                    aria-hidden="true"
                                                                >
                                                                    {{ t('wireframe.preview.sign_in', 'Sign in') }}
                                                                </origam-btn>

                                                                <origam-divider>
                                                                    <template #default>
                                                                        <origam-skeleton
                                                                            shape="text"
                                                                            :pulse="false"
                                                                            width="24px"
                                                                            height="8px"
                                                                            rounded="sm"
                                                                        />
                                                                    </template>
                                                                </origam-divider>

                                                                <origam-skeleton
                                                                    shape="rectangular"
                                                                    :pulse="false"
                                                                    height="24px"
                                                                    rounded="sm"
                                                                    class="wf__auth-oauth"
                                                                />
                                                            </div>
                                                        </template>
                                                    </origam-card>
                                                </div>
                                            </template>

                                            <template v-else-if="layout.id === 'list-detail'">
                                                <div class="wf wf--list-detail">
                                                    <origam-list density="compact" class="wf__master">
                                                        <origam-list-subheader>
                                                            <origam-skeleton
                                                                shape="text"
                                                                :pulse="false"
                                                                width="50%"
                                                                height="8px"
                                                                rounded="sm"
                                                            />
                                                        </origam-list-subheader>
                                                        <origam-list-item
                                                            v-for="n in 6"
                                                            :key="n"
                                                            density="compact"
                                                            :class="{ 'wf__nav-item--active': n === 2 }"
                                                        >
                                                            <template #prepend>
                                                                <origam-skeleton
                                                                    shape="circular"
                                                                    :pulse="false"
                                                                    width="20px"
                                                                    rounded="full"
                                                                />
                                                            </template>
                                                            <div class="wf__master-item">
                                                                <origam-skeleton
                                                                    shape="text"
                                                                    :pulse="false"
                                                                    :width="`${50 + n * 6}%`"
                                                                    height="9px"
                                                                    rounded="sm"
                                                                />
                                                                <origam-skeleton
                                                                    shape="text"
                                                                    :pulse="false"
                                                                    width="40%"
                                                                    height="7px"
                                                                    rounded="sm"
                                                                />
                                                            </div>
                                                        </origam-list-item>
                                                    </origam-list>

                                                    <origam-divider direction="vertical" />

                                                    <div class="wf__detail">
                                                        <origam-skeleton
                                                            shape="text"
                                                            :pulse="false"
                                                            width="55%"
                                                            height="14px"
                                                            rounded="sm"
                                                            class="wf__detail-title"
                                                        />

                                                        <div class="wf__detail-chips">
                                                            <origam-chip
                                                                v-for="c in 2"
                                                                :key="c"
                                                                size="x-small"
                                                                pill
                                                                color="primary"
                                                                aria-hidden="true"
                                                            >
                                                                {{ t('wireframe.preview.tag', 'tag') }}
                                                            </origam-chip>
                                                        </div>

                                                        <origam-skeleton
                                                            v-for="p in 3"
                                                            :key="p"
                                                            shape="text"
                                                            :pulse="false"
                                                            :width="`${70 + p * 8}%`"
                                                            height="8px"
                                                            rounded="sm"
                                                            class="wf__detail-line"
                                                        />

                                                        <div class="wf__detail-actions">
                                                            <origam-btn
                                                                color="primary"
                                                                size="small"
                                                                variant="flat"
                                                                disabled
                                                                aria-hidden="true"
                                                            >
                                                                {{ t('wireframe.preview.open', 'Open') }}
                                                            </origam-btn>
                                                        </div>
                                                    </div>
                                                </div>
                                            </template>

                                            <template v-else-if="layout.id === 'pricing'">
                                                <div class="wf wf--pricing">
                                                    <origam-grid
                                                        columns="repeat(3, 1fr)"
                                                        gap="0.5rem"
                                                        class="wf__pricing-grid"
                                                    >
                                                        <origam-grid-item
                                                            v-for="(plan, pi) in 3"
                                                            :key="pi"
                                                        >
                                                            <origam-card
                                                                class="wf__pricing-card"
                                                                :color="pi === 1 ? 'primary' : undefined"
                                                                :border="pi !== 1"
                                                                :elevation="pi === 1 ? 'md' : undefined"
                                                                rounded="lg"
                                                                flat
                                                            >
                                                                <template #default>
                                                                    <div class="wf__pricing-inner">
                                                                        <origam-chip
                                                                            v-if="pi === 1"
                                                                            size="x-small"
                                                                            pill
                                                                            class="wf__pricing-badge"
                                                                            aria-hidden="true"
                                                                        >
                                                                            {{ t('wireframe.preview.popular', 'Popular') }}
                                                                        </origam-chip>

                                                                        <origam-skeleton
                                                                            shape="text"
                                                                            :pulse="false"
                                                                            width="50%"
                                                                            height="10px"
                                                                            rounded="sm"
                                                                        />
                                                                        <origam-skeleton
                                                                            shape="text"
                                                                            :pulse="false"
                                                                            width="65%"
                                                                            height="20px"
                                                                            rounded="sm"
                                                                            class="wf__pricing-price"
                                                                        />

                                                                        <origam-divider />

                                                                        <div class="wf__pricing-features">
                                                                            <div
                                                                                v-for="f in 4"
                                                                                :key="f"
                                                                                class="wf__pricing-feature"
                                                                            >
                                                                                <origam-skeleton
                                                                                    shape="circular"
                                                                                    :pulse="false"
                                                                                    width="10px"
                                                                                    rounded="full"
                                                                                />
                                                                                <origam-skeleton
                                                                                    shape="text"
                                                                                    :pulse="false"
                                                                                    :width="`${55 + f * 8}%`"
                                                                                    height="8px"
                                                                                    rounded="sm"
                                                                                />
                                                                            </div>
                                                                        </div>

                                                                        <origam-btn
                                                                            block
                                                                            size="small"
                                                                            :variant="pi === 1 ? 'flat' : 'outlined'"
                                                                            :color="pi === 1 ? undefined : 'primary'"
                                                                            disabled
                                                                            aria-hidden="true"
                                                                        >
                                                                            {{ t('wireframe.preview.get_started', 'Get started') }}
                                                                        </origam-btn>
                                                                    </div>
                                                                </template>
                                                            </origam-card>
                                                        </origam-grid-item>
                                                    </origam-grid>
                                                </div>
                                            </template>

                                            <template v-else-if="layout.id === 'landing'">
                                                <div class="wf wf--landing">
                                                    <div class="wf__landing-hero">
                                                        <origam-skeleton
                                                            shape="text"
                                                            :pulse="false"
                                                            width="55%"
                                                            height="18px"
                                                            rounded="sm"
                                                            class="wf__landing-headline"
                                                        />
                                                        <origam-skeleton
                                                            shape="text"
                                                            :pulse="false"
                                                            width="70%"
                                                            height="9px"
                                                            rounded="sm"
                                                        />
                                                        <div class="wf__landing-cta-row">
                                                            <origam-btn
                                                                color="primary"
                                                                size="small"
                                                                variant="flat"
                                                                disabled
                                                                aria-hidden="true"
                                                            >
                                                                {{ t('wireframe.preview.cta_primary', 'Get started') }}
                                                            </origam-btn>
                                                            <origam-btn
                                                                size="small"
                                                                variant="outlined"
                                                                disabled
                                                                aria-hidden="true"
                                                            >
                                                                {{ t('wireframe.preview.cta_secondary', 'Learn more') }}
                                                            </origam-btn>
                                                        </div>
                                                    </div>

                                                    <origam-grid
                                                        columns="repeat(3, 1fr)"
                                                        gap="0.5rem"
                                                        class="wf__landing-features"
                                                    >
                                                        <origam-grid-item
                                                            v-for="f in 3"
                                                            :key="f"
                                                        >
                                                            <origam-card
                                                                class="wf__landing-feature-card"
                                                                rounded="md"
                                                                border
                                                                flat
                                                            >
                                                                <template #default>
                                                                    <div class="wf__landing-feature-inner">
                                                                        <origam-skeleton
                                                                            shape="circular"
                                                                            :pulse="false"
                                                                            width="20px"
                                                                            rounded="full"
                                                                        />
                                                                        <origam-skeleton
                                                                            shape="text"
                                                                            :pulse="false"
                                                                            width="60%"
                                                                            height="10px"
                                                                            rounded="sm"
                                                                        />
                                                                        <origam-skeleton
                                                                            shape="text"
                                                                            :pulse="false"
                                                                            width="85%"
                                                                            height="8px"
                                                                            rounded="sm"
                                                                        />
                                                                    </div>
                                                                </template>
                                                            </origam-card>
                                                        </origam-grid-item>
                                                    </origam-grid>

                                                    <origam-card
                                                        class="wf__landing-cta-block"
                                                        color="primary"
                                                        rounded="lg"
                                                    >
                                                        <template #default>
                                                            <div class="wf__landing-cta-inner">
                                                                <origam-skeleton
                                                                    shape="text"
                                                                    :pulse="false"
                                                                    width="50%"
                                                                    height="12px"
                                                                    rounded="sm"
                                                                />
                                                                <origam-btn
                                                                    size="small"
                                                                    variant="flat"
                                                                    bg-color="white"
                                                                    disabled
                                                                    aria-hidden="true"
                                                                >
                                                                    {{ t('wireframe.preview.cta_primary', 'Get started') }}
                                                                </origam-btn>
                                                            </div>
                                                        </template>
                                                    </origam-card>
                                                </div>
                                            </template>
                                        </client-only>
                                    </div>

                                    <footer class="wireframe-card__footer">
                                        <p class="wireframe-card__components-label">
                                            {{ t('wireframe.card.components_label', 'Components used') }}
                                        </p>

                                        <div
                                            class="wireframe-card__chips"
                                            role="list"
                                            :aria-label="t('wireframe.card.chips_label', 'Components used in this wireframe')"
                                        >
                                            <origam-chip
                                                v-for="comp in layout.components"
                                                :key="comp"
                                                size="x-small"
                                                pill
                                                class="wireframe-card__chip"
                                                role="listitem"
                                            >
                                                {{ comp }}
                                            </origam-chip>
                                        </div>
                                    </footer>
                                </div>
                            </template>
                        </origam-card>
                    </origam-grid-item>
                </origam-grid>
            </origam-container>
        </section>

        <section
            class="wireframe-cta"
            aria-labelledby="wireframe-cta-title"
            data-cy="wireframe-cta"
        >
            <div class="wireframe-cta__inner">
                <origam-title
                    id="wireframe-cta-title"
                    tag="h2"
                    class="wireframe-cta__title"
                >
                    {{ t('wireframe.cta.title', 'Start building.') }}
                </origam-title>

                <p class="wireframe-cta__desc">
                    {{ t('wireframe.cta.description', 'All 95+ components are available today. Install origam and compose any layout in minutes.') }}
                </p>

                <nav
                    class="wireframe-cta__actions"
                    :aria-label="t('wireframe.cta.actions_label', 'Explore origam')"
                >
                    <origam-btn
                        class="wireframe-cta__btn wireframe-cta__btn--primary"
                        variant="text"
                        prepend-icon="mdi-view-grid-outline"
                        href="/components"
                        data-cy="wireframe-cta-components"
                    >
                        {{ t('wireframe.cta.cta_components', 'Browse components') }}
                    </origam-btn>

                    <origam-btn
                        class="wireframe-cta__btn wireframe-cta__btn--secondary"
                        variant="text"
                        prepend-icon="mdi-book-open-outline"
                        href="/installation"
                        data-cy="wireframe-cta-install"
                    >
                        {{ t('wireframe.cta.cta_install', 'Installation guide') }}
                    </origam-btn>
                </nav>
            </div>
        </section>
    </article>
</template>

<style scoped lang="scss">
.wireframe-page {
    display: flex;
    flex-direction: column;
}

.wireframe-section {
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

    &__subtitle {
        margin: var(--origam-space---4, 1rem) 0 0;
        max-inline-size: 42rem;
        font-size: var(--origam-font-size---lg, 1.125rem);
        line-height: 1.65;
        color: var(--origam-color__text---secondary, #525252);
    }
}

.wireframe-hero {
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

.wireframe-gallery {
    padding-block: var(--origam-space---16, 4rem) var(--origam-space---24, 6rem);

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
}

.wireframe-card {
    block-size: 100%;
    display: flex;
    flex-direction: column;

    &__inner {
        display: flex;
        flex-direction: column;
        gap: var(--origam-space---4, 1rem);
        block-size: 100%;
        padding: var(--origam-space---4, 1rem);
    }

    &__meta {
        display: flex;
        align-items: flex-start;
        gap: var(--origam-space---3, 0.75rem);
    }

    &__icon {
        flex-shrink: 0;
    }

    &__meta-text {
        flex: 1;
        min-inline-size: 0;
    }

    &__title {
        display: block;
        font-size: var(--origam-font-size---base, 1rem);
        font-weight: var(--origam-font__weight---semibold, 600);
        color: var(--origam-color__text---primary, #0a0a0a);
        margin: 0 0 var(--origam-space---1, 0.25rem);
    }

    &__description {
        margin: 0;
        font-size: var(--origam-font-size---sm, 0.875rem);
        line-height: 1.5;
        color: var(--origam-color__text---secondary, #525252);
    }

    &__preview {
        flex: 1;
        min-block-size: 200px;
        background: var(--origam-color__surface---sunken, #f5f5f5);
        border-radius: var(--origam-radius---md, 8px);
        overflow: hidden;
        border: 1px solid var(--origam-color__border---default, rgba(0, 0, 0, 0.08));
    }

    &__footer {
        border-block-start: 1px solid var(--origam-color__border---default, rgba(0, 0, 0, 0.08));
        padding-block-start: var(--origam-space---3, 0.75rem);
    }

    &__components-label {
        margin: 0 0 var(--origam-space---2, 0.5rem);
        font-size: var(--origam-font-size---xs, 0.75rem);
        font-weight: var(--origam-font__weight---semibold, 600);
        color: var(--origam-color__text---tertiary, #737373);
        text-transform: uppercase;
        letter-spacing: 0.06em;
    }

    &__chips {
        display: flex;
        flex-wrap: wrap;
        gap: var(--origam-space---1, 0.25rem);
    }

    &__chip {
        --origam-chip---background-color: var(--origam-color__surface---sunken, #f5f5f5);
        font-family: var(--origam-font-family---mono, monospace);
        font-size: 0.65rem;
    }
}

.wireframe-cta {
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

.wf {
    block-size: 100%;
    min-block-size: 200px;

    &--dashboard {
        display: grid;
        grid-template-columns: 72px 1fr;
        block-size: 200px;
    }

    &--settings {
        display: grid;
        grid-template-columns: 80px 1fr;
        block-size: 200px;
    }

    &--auth {
        display: flex;
        align-items: center;
        justify-content: center;
        block-size: 200px;
        padding: var(--origam-space---3, 0.75rem);
    }

    &--list-detail {
        display: grid;
        grid-template-columns: 110px 1px 1fr;
        block-size: 200px;
        overflow: hidden;
    }

    &--pricing {
        padding: var(--origam-space---2, 0.5rem);
        block-size: 200px;
    }

    &--landing {
        padding: var(--origam-space---3, 0.75rem);
        display: flex;
        flex-direction: column;
        gap: var(--origam-space---2, 0.5rem);
        block-size: 200px;
        overflow: hidden;
    }

    &__sidebar {
        background: var(--origam-color__surface---default, #fff);
        border-inline-end: 1px solid var(--origam-color__border---default, rgba(0, 0, 0, 0.08));
        padding: var(--origam-space---2, 0.5rem) var(--origam-space---2, 0.5rem);
        display: flex;
        flex-direction: column;
        gap: var(--origam-space---2, 0.5rem);
    }

    &__logo {
        margin-block-start: var(--origam-space---1, 0.25rem);
        margin-block-end: var(--origam-space---1, 0.25rem);
    }

    &__sidebar-divider {
        margin-block: var(--origam-space---1, 0.25rem);
    }

    &__nav {
        flex: 1;
        gap: 0;
    }

    &__nav-icon {
        flex-shrink: 0;
    }

    &__nav-item--active {
        background: var(--origam-color__action--primary---bgSubtle, #ede9fe);
        border-radius: var(--origam-radius---sm, 4px);
    }

    &__main {
        display: flex;
        flex-direction: column;
        padding: var(--origam-space---2, 0.5rem);
        gap: var(--origam-space---2, 0.5rem);
        overflow: hidden;
    }

    &__topbar {
        display: flex;
        align-items: center;
        padding-block: var(--origam-space---1, 0.25rem);
        border-block-end: 1px solid var(--origam-color__border---default, rgba(0, 0, 0, 0.08));
        padding-block-end: var(--origam-space---2, 0.5rem);
    }

    &__stat-grid {
        flex-shrink: 0;
    }

    &__stat-card {
        block-size: 100%;
    }

    &__stat-inner {
        padding: var(--origam-space---2, 0.5rem);
        display: flex;
        flex-direction: column;
        gap: var(--origam-space---1, 0.25rem);
    }

    &__chart-placeholder {
        flex: 1;
        min-block-size: 60px;
        overflow: hidden;
    }

    &__settings-sidebar {
        border-inline-end: 1px solid var(--origam-color__border---default, rgba(0, 0, 0, 0.08));
        background: var(--origam-color__surface---default, #fff);
        overflow: hidden;
    }

    &__settings-nav {
        overflow: hidden;
    }

    &__settings-content {
        padding: var(--origam-space---3, 0.75rem);
        display: flex;
        flex-direction: column;
        gap: var(--origam-space---3, 0.75rem);
        overflow: hidden;
    }

    &__settings-title {
        flex-shrink: 0;
    }

    &__settings-row {
        display: flex;
        flex-direction: column;
        gap: var(--origam-space---1, 0.25rem);
    }

    &__settings-toggle-row {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: var(--origam-space---2, 0.5rem);
    }

    &__settings-divider {
        flex-shrink: 0;
    }

    &__settings-actions {
        display: flex;
        gap: var(--origam-space---2, 0.5rem);
        margin-block-start: auto;
    }

    &__auth-card {
        inline-size: 100%;
        max-inline-size: 200px;
    }

    &__auth-inner {
        padding: var(--origam-space---3, 0.75rem);
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: var(--origam-space---2, 0.5rem);
    }

    &__auth-logo {
        flex-shrink: 0;
    }

    &__auth-headline {
        align-self: center;
    }

    &__auth-fields {
        inline-size: 100%;
        display: flex;
        flex-direction: column;
        gap: var(--origam-space---2, 0.5rem);
    }

    &__auth-field {
        display: flex;
        flex-direction: column;
        gap: var(--origam-space---1, 0.25rem);
    }

    &__auth-oauth {
        inline-size: 100%;
    }

    &__master {
        overflow: hidden;
        background: var(--origam-color__surface---default, #fff);
    }

    &__master-item {
        display: flex;
        flex-direction: column;
        gap: var(--origam-space---1, 0.25rem);
        flex: 1;
        min-inline-size: 0;
    }

    &__detail {
        padding: var(--origam-space---3, 0.75rem);
        display: flex;
        flex-direction: column;
        gap: var(--origam-space---2, 0.5rem);
        overflow: hidden;
    }

    &__detail-title {
        flex-shrink: 0;
    }

    &__detail-chips {
        display: flex;
        gap: var(--origam-space---1, 0.25rem);
        flex-shrink: 0;
    }

    &__detail-line {
        flex-shrink: 0;
    }

    &__detail-actions {
        margin-block-start: auto;
    }

    &__pricing-grid {
        block-size: 100%;
    }

    &__pricing-card {
        block-size: 100%;
    }

    &__pricing-inner {
        padding: var(--origam-space---2, 0.5rem);
        display: flex;
        flex-direction: column;
        gap: var(--origam-space---2, 0.5rem);
        block-size: 100%;
    }

    &__pricing-badge {
        align-self: flex-start;
    }

    &__pricing-price {
        flex-shrink: 0;
    }

    &__pricing-features {
        flex: 1;
        display: flex;
        flex-direction: column;
        gap: var(--origam-space---1, 0.25rem);
    }

    &__pricing-feature {
        display: flex;
        align-items: center;
        gap: var(--origam-space---1, 0.25rem);
    }

    &__landing-hero {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: var(--origam-space---1, 0.25rem);
        text-align: center;
        padding-block: var(--origam-space---2, 0.5rem);
    }

    &__landing-headline {
        flex-shrink: 0;
    }

    &__landing-cta-row {
        display: flex;
        gap: var(--origam-space---2, 0.5rem);
        margin-block-start: var(--origam-space---1, 0.25rem);
    }

    &__landing-features {
        flex-shrink: 0;
    }

    &__landing-feature-card {
        block-size: 100%;
    }

    &__landing-feature-inner {
        padding: var(--origam-space---2, 0.5rem);
        display: flex;
        flex-direction: column;
        gap: var(--origam-space---1, 0.25rem);
    }

    &__landing-cta-block {
        flex-shrink: 0;
    }

    &__landing-cta-inner {
        padding: var(--origam-space---2, 0.5rem) var(--origam-space---3, 0.75rem);
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: var(--origam-space---2, 0.5rem);
    }
}

@media (max-width: 1080px) {
    .wireframe-hero__title {
        font-size: clamp(2.5rem, 9vw, 5.25rem);
    }
}

@media (max-width: 768px) {
    .wireframe-section__title {
        font-size: clamp(1.75rem, 7vw, 3rem);
    }

    .wireframe-cta__title {
        font-size: clamp(2rem, 8vw, 4rem) !important;
    }

    .wireframe-gallery__grid {
        grid-template-columns: 1fr;
    }
}
</style>
