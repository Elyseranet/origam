<template>
    <article
        class="legal-notice"
        data-cy="page-legal"
    >
        <enso-page-header
            family="legal"
            title-id="legal-title"
        >
            <template #breadcrumb>
                <origam-breadcrumb
                    :items="breadcrumbItems"
                    divider="/"
                    :border="0"
                    data-cy="legal-breadcrumb"
                />
            </template>

            <template #title>
                {{ t('legal_notice.title', 'Legal notice') }}
            </template>

            <template #intro>
                {{ t('legal_notice.intro', 'Information about the publisher and the hosting provider of this website.') }}
            </template>
        </enso-page-header>

        <section
            class="legal-notice__section"
            aria-labelledby="legal-publisher-title"
        >
            <origam-container class="legal-notice__inner home-container">
                <enso-section-title
                    id="legal-publisher-title"
                    tag="h2"
                >
                    {{ t('legal_notice.publisher_title', 'Publisher') }}
                </enso-section-title>
                <dl
                    class="legal-notice__list"
                    data-cy="legal-publisher"
                >
                    <div
                        v-for="row in publisherRows"
                        :key="row.key"
                        class="legal-notice__row"
                    >
                        <dt>{{ row.label }}</dt>
                        <dd>{{ row.value }}</dd>
                    </div>
                </dl>
            </origam-container>
        </section>

        <section
            class="legal-notice__section"
            aria-labelledby="legal-host-title"
        >
            <origam-container class="legal-notice__inner home-container">
                <enso-section-title
                    id="legal-host-title"
                    tag="h2"
                >
                    {{ t('legal_notice.host_title', 'Hosting provider') }}
                </enso-section-title>
                <dl
                    class="legal-notice__list"
                    data-cy="legal-host"
                >
                    <div
                        v-for="row in hostRows"
                        :key="row.key"
                        class="legal-notice__row"
                    >
                        <dt>{{ row.label }}</dt>
                        <dd>{{ row.value }}</dd>
                    </div>
                </dl>
            </origam-container>
        </section>

        <section
            class="legal-notice__section"
            aria-labelledby="legal-content-title"
        >
            <origam-container class="legal-notice__inner home-container">
                <enso-section-title
                    id="legal-content-title"
                    tag="h2"
                >
                    {{ t('legal_notice.content_title', 'Website content') }}
                </enso-section-title>
                <p>
                    {{ t('legal_notice.content_body', 'origam is a public Vue design system. The source repository is published under the MIT License.') }}
                    <nuxt-link :to="localeHref('/privacy')">
                        {{ t('footer.legal.privacy', 'Privacy') }}
                    </nuxt-link>
                    <span aria-hidden="true"> · </span>
                    <nuxt-link :to="localeHref('/contact')">
                        {{ t('footer.legal.contact', 'Contact') }}
                    </nuxt-link>
                </p>
            </origam-container>
        </section>
    </article>
</template>

<script setup lang="ts">
    import { useT } from '~/composables/useT'
    import { useLegal } from '~/composables/useLegal'

    const { t } = useT()
    const { localeHref } = useLocaleHref()
    const { publisherRows, hostRows } = useLegal()

    const breadcrumbItems = computed(() => [
        { title: t('nav.home', 'Home'), to: localeHref('/') },
        { title: t('legal_notice.title', 'Legal notice') }
    ])

    useSeoMeta({
        title: () => t('legal_notice.meta_title', 'Legal notice'),
        description: () => t('legal_notice.meta_description', 'Publisher and hosting information for the origam website.')
    })

    defineExpose({})
</script>

<style scoped lang="scss">
    .legal-notice {
        --site-gutter: var(--home-gutter);

        padding-block-end: var(--origam-space---12, 3rem);

        &__inner {
            --origam-container---max-width: calc(var(--home-container-max) + 2 * var(--site-gutter));
        }

        &__section {
            padding-block: var(--origam-space---8, 2rem);
        }

        &__list {
            display: grid;
            gap: var(--origam-space---3, 0.75rem);
        }

        &__row {
            display: grid;
            grid-template-columns: minmax(12rem, 1fr) 2fr;
            gap: var(--origam-space---4, 1rem);

            dt {
                font-weight: 600;
            }

            dd {
                margin: 0;
            }
        }
    }
</style>
