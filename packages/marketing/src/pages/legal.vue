<template>
    <article
        class="legal-notice"
        data-cy="page-legal"
    >
        <header class="legal-notice__hero">
            <origam-container>
                <origam-title
                    tag="h1"
                    class="legal-notice__title"
                >
                    {{ t('legal_notice.title', 'Legal notice') }}
                </origam-title>
                <p class="legal-notice__lead">
                    {{ t('legal_notice.intro', 'Information about the publisher and the hosting provider of this website.') }}
                </p>
            </origam-container>
        </header>

        <section
            class="legal-notice__section"
            aria-labelledby="legal-publisher-title"
        >
            <origam-container>
                <origam-title
                    id="legal-publisher-title"
                    tag="h2"
                >
                    {{ t('legal_notice.publisher_title', 'Publisher') }}
                </origam-title>
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
            <origam-container>
                <origam-title
                    id="legal-host-title"
                    tag="h2"
                >
                    {{ t('legal_notice.host_title', 'Hosting provider') }}
                </origam-title>
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
            <origam-container>
                <origam-title
                    id="legal-content-title"
                    tag="h2"
                >
                    {{ t('legal_notice.content_title', 'Website content') }}
                </origam-title>
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

    useSeoMeta({
        title: () => t('legal_notice.meta_title', 'Legal notice'),
        description: () => t('legal_notice.meta_description', 'Publisher and hosting information for the origam website.')
    })

    defineExpose({})
</script>

<style scoped lang="scss">
    .legal-notice {
        padding-block-end: var(--origam-space---12, 3rem);

        &__hero,
        &__section {
            padding-block: var(--origam-space---8, 2rem);
        }

        &__title {
            margin-block-end: var(--origam-space---4, 1rem);
        }

        &__lead {
            max-inline-size: 70ch;
            color: var(--origam-color__text---secondary);
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
