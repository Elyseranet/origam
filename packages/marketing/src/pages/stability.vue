<template>
    <article
        class="stability"
        data-cy="page-stability"
    >
        <section
            class="stability-hero"
            aria-labelledby="stability-title"
        >
            <origam-container class="stability-hero__inner">
                <origam-chip
                    class="stability-hero__badge"
                    color="primary"
                    size="small"
                    border
                    pill
                    data-cy="stability-hero-badge"
                >
                    {{ t('stability.hero.badge', 'Versioning policy') }}
                </origam-chip>

                <origam-title
                    id="stability-title"
                    tag="h1"
                    class="stability-hero__title"
                >
                    {{ t('stability.hero.title', 'Stability and versioning') }}
                </origam-title>

                <p class="stability-hero__lead">
                    {{ t('stability.hero.lead', 'A high version number and frequent releases do not mean origam breaks often. This page says what the number means, how releases are cut and where changes are written down.') }}
                </p>
            </origam-container>
        </section>

        <section
            v-for="section in sections"
            :key="section.id"
            class="stability-section"
            :aria-labelledby="`stability-${ section.id }-title`"
            :data-cy="`stability-section-${ section.id }`"
        >
            <origam-container class="stability-section__inner">
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
    </article>
</template>

<script setup lang="ts">
    import { useLocaleHref } from '~/composables/useLocaleHref'
    import { useT } from '~/composables/useT'
    import { STABILITY_SECTIONS } from '~/consts/stability.const'

    const { t } = useT()
    const { localeHref } = useLocaleHref()

    const sections = STABILITY_SECTIONS

    useSeoMeta({
        title: () => t('stability.meta.title', 'Stability and versioning · origam design system'),
        description: () => t('stability.meta.description', 'What the 2.x version number of origam means, why it releases often, how breaking changes are announced and what 3.0.0 will be.'),
        ogTitle: () => t('stability.meta.title', 'Stability and versioning · origam design system'),
        ogDescription: () => t('stability.meta.description', 'What the 2.x version number of origam means, why it releases often, how breaking changes are announced and what 3.0.0 will be.')
    })
</script>

<style scoped lang="scss">
    .stability-hero {
        padding-block: var(--origam-space---12, 3rem);
        text-align: center;

        &__badge {
            margin-block-end: var(--origam-space---4, 1rem);
        }

        &__lead {
            margin-block-start: var(--origam-space---4, 1rem);
            margin-inline: auto;
            max-inline-size: 60ch;
            color: var(--origam-color__text---secondary);
        }
    }

    .stability-section {
        padding-block-end: var(--origam-space---8, 2rem);

        &__body {
            margin-block-start: var(--origam-space---4, 1rem);
            max-inline-size: 70ch;
            color: var(--origam-color__text---secondary);
        }

        &__cta {
            margin-block-start: var(--origam-space---4, 1rem);
        }
    }
</style>
