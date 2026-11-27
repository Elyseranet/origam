<template>
    <article
        class="stability"
        data-cy="page-stability"
    >
        <enso-page-header
            family="editorial"
            title-id="stability-title"
        >
            <template #breadcrumb>
                <origam-breadcrumb
                    :items="breadcrumbItems"
                    divider="/"
                    :border="0"
                    data-cy="stability-breadcrumb"
                />
            </template>

            <template #eyebrow>
                <span data-cy="stability-hero-badge">{{ t('stability.hero.badge', 'Versioning policy') }}</span>
            </template>

            <template #title>
                {{ t('stability.hero.title', 'Stability and versioning') }}
            </template>

            <template #intro>
                {{ t('stability.hero.lead', 'A high version number and frequent releases do not mean origam breaks often: 143 versions published since July 2025. This page says what the number means and where changes are written down.') }}
            </template>
        </enso-page-header>

        <section
            v-for="section in sections"
            :key="section.id"
            class="stability-section"
            :class="section.classes"
            :aria-labelledby="`stability-${ section.id }-title`"
            :data-cy="`stability-section-${ section.id }`"
        >
            <origam-container class="stability-section__inner home-container">
                <p class="home-eyebrow">
                    {{ section.label }}
                </p>

                <origam-title
                    :id="`stability-${ section.id }-title`"
                    tag="h2"
                    class="stability-section__title"
                >
                    {{ t(section.titleKey, section.titleFallback) }}
                </origam-title>

                <p
                    v-for="paragraph in section.paragraphs"
                    :key="paragraph.textKey"
                    class="stability-section__body"
                >
                    {{ t(paragraph.textKey, paragraph.textFallback) }}
                </p>

                <origam-btn
                    v-if="section.link"
                    class="stability-section__cta"
                    variant="text"
                    :prepend-icon="section.link.icon"
                    :href="localeHref(section.link.href)"
                    :data-cy="section.link.dataCy"
                >
                    {{ t(section.link.labelKey, section.link.labelFallback) }}
                </origam-btn>
            </origam-container>
        </section>

        <home-cta
            surface="overlay"
            data-cy="stability-cta"
        />
    </article>
</template>

<script setup lang="ts">
    import { computed } from 'vue'
    import { useLocaleHref } from '~/composables/useLocaleHref'
    import { useT } from '~/composables/useT'
    import { STABILITY_SECTIONS } from '~/consts/stability.const'
    import { editorialSectionViews } from '~/utils/editorial.util'

    const { t } = useT()
    const { localeHref } = useLocaleHref()

    const breadcrumbItems = computed(() => [
        { title: t('nav.home', 'Home'), to: localeHref('/') },
        { title: t('nav.sections.introduction', 'Introduction') },
        { title: t('nav.stability', 'Stability') }
    ])

    const sections = computed(() => editorialSectionViews(STABILITY_SECTIONS, 'stability-section'))

    useSeoMeta({
        title: () => t('stability.meta.title', 'Stability and versioning · origam design system'),
        description: () => t('stability.meta.description', 'What the 2.x version number of origam means, why it releases often, how breaking changes are announced and what 3.0.0 will be.'),
        ogTitle: () => t('stability.meta.title', 'Stability and versioning · origam design system'),
        ogDescription: () => t('stability.meta.description', 'What the 2.x version number of origam means, why it releases often, how breaking changes are announced and what 3.0.0 will be.')
    })
</script>

<style scoped lang="scss">
    @use '../assets/scss/editorial';

    .stability {
        @include editorial.editorial-page;
    }

    .stability-section {
        &--default {
            @include editorial.editorial-section(default, 40px, 120px);
        }

        &--overlay {
            @include editorial.editorial-section(overlay, 40px, 120px);
        }

        &--flush::before {
            inset-block-start: -50px;
            block-size: 51px;
        }

        &__inner {
            display: grid;
            justify-items: start;
            gap: 12px;
        }

        &__title {
            margin: 0;
            font-size: clamp(1.7rem, 3vw, 2.3rem);
            font-weight: var(--home-fw-title);
            line-height: var(--home-lh-title);
            letter-spacing: var(--home-ls-title);
            text-wrap: balance;
            color: var(--origam-color__text---primary);
        }

        &__body {
            margin: 0;
            max-inline-size: 70ch;
            font-size: var(--home-fs-lead);
            color: var(--origam-color__text---secondary);
        }

        &__cta {
            margin-block-start: var(--origam-space---2, 0.5rem);
        }
    }
</style>
