<template>
    <article
        class="contact"
        data-cy="page-contact"
    >
        <section
            class="contact-hero"
            aria-labelledby="contact-title"
        >
            <origam-container class="contact-hero__inner">
                <origam-chip
                    class="contact-hero__badge"
                    color="primary"
                    size="small"
                    border
                    pill
                    data-cy="contact-hero-badge"
                >
                    {{ t('contact.hero.badge', 'One maintainer') }}
                </origam-chip>

                <origam-title
                    id="contact-title"
                    tag="h1"
                    class="contact-hero__title"
                >
                    {{ t('contact.hero.title', 'Contact') }}
                </origam-title>

                <p class="contact-hero__lead">
                    {{ t('contact.hero.lead', 'origam is maintained by one developer. Everything goes through GitHub, in the open — a question asked there helps the next person who searches for it, and nothing gets buried in a mailbox.') }}
                </p>
            </origam-container>
        </section>

        <section
            class="contact-block"
            aria-labelledby="contact-issues-title"
        >
            <origam-container class="contact-block__inner">
                <origam-title
                    id="contact-issues-title"
                    tag="h2"
                    class="contact-block__title"
                >
                    {{ t('contact.issues.title', 'Report a bug') }}
                </origam-title>

                <p class="contact-block__body">
                    {{ t('contact.issues.body', 'Open an issue on the repository. A useful report names the component, the version of origam, what you expected and what happened instead — a minimal reproduction is worth more than a paragraph of description.') }}
                </p>

                <origam-btn
                    :href="issuesUrl"
                    target="_blank"
                    rel="noopener noreferrer"
                    variant="flat"
                    bg-color="primary"
                    size="large"
                    rounded="lg"
                    class="contact-block__cta"
                    data-cy="contact-issues-cta"
                >
                    {{ t('contact.issues.cta', 'Open an issue on GitHub') }}
                </origam-btn>
            </origam-container>
        </section>

        <section
            class="contact-block"
            aria-labelledby="contact-discussions-title"
        >
            <origam-container class="contact-block__inner">
                <origam-title
                    id="contact-discussions-title"
                    tag="h2"
                    class="contact-block__title"
                >
                    {{ t('contact.discussions.title', 'Ask a question') }}
                </origam-title>

                <p class="contact-block__body">
                    {{ t('contact.discussions.body', 'Use the discussions of the repository for anything that is not a defect: how to use a component, an idea for one that does not exist yet, or feedback on the documentation.') }}
                </p>

                <origam-btn
                    :href="discussionsUrl"
                    target="_blank"
                    rel="noopener noreferrer"
                    variant="outlined"
                    size="large"
                    rounded="lg"
                    class="contact-block__cta"
                    data-cy="contact-discussions-cta"
                >
                    {{ t('contact.discussions.cta', 'Open a discussion on GitHub') }}
                </origam-btn>
            </origam-container>
        </section>

        <section
            class="contact-block"
            aria-labelledby="contact-support-title"
        >
            <origam-container class="contact-block__inner">
                <origam-title
                    id="contact-support-title"
                    tag="h2"
                    class="contact-block__title"
                >
                    {{ t('contact.support.title', 'Support the project') }}
                </origam-title>

                <p class="contact-block__body">
                    {{ t('contact.support.body', 'origam is free and MIT-licensed. If it saves you time, the support page explains how a donation funds the maintenance work.') }}
                </p>

                <origam-btn
                    :to="supportRoute"
                    variant="text"
                    size="large"
                    rounded="lg"
                    class="contact-block__cta"
                    data-cy="contact-support-cta"
                >
                    {{ t('contact.support.cta', 'Go to the support page') }}
                </origam-btn>
            </origam-container>
        </section>

        <section
            class="contact-block"
            aria-labelledby="contact-no-email-title"
        >
            <origam-container class="contact-block__inner">
                <origam-title
                    id="contact-no-email-title"
                    tag="h2"
                    class="contact-block__title"
                >
                    {{ t('contact.no_email.title', 'There is no support address') }}
                </origam-title>

                <origam-divider class="contact-block__rule"/>

                <p class="contact-block__body">
                    {{ t('contact.no_email.body', 'This project publishes no email address, and none is hidden behind a form on this site. Requests made in the open are answered in the open: there is no private channel, and no commitment on response time.') }}
                </p>
            </origam-container>
        </section>
    </article>
</template>

<script setup lang="ts">
    import { computed } from 'vue'

    import {
        CONTACT_GITHUB_DISCUSSIONS_PATH,
        CONTACT_GITHUB_ISSUES_PATH,
        CONTACT_SUPPORT_ROUTE
    } from '~/consts/contact.const'
    import { useT } from '~/composables/useT'

    /*********************************************************
     * Global
     *
     * @description
     * The repository URL is deployment-overridable
     * (`NUXT_PUBLIC_GITHUB_REPO`), so the two GitHub channels are derived
     * from `runtimeConfig` rather than from the build-time default — same
     * source the footer links already read.
     ********************************************************/
    const { t } = useT()
    const { public: publicConfig } = useRuntimeConfig()
    const localePath = useLocalePath()

    /*********************************************************
     * Channels
     *
     * @description
     * The three channels that actually exist. No email address is published
     * anywhere in the repository, so none is offered here.
     *
     * The internal link goes through `localePath()`: the i18n strategy is
     * `prefix_except_default`, so a bare "/support" measured on /fr/contact
     * resolved to the ENGLISH page. `localePath()` yields /fr/support there
     * and /support on the default locale.
     ********************************************************/
    const issuesUrl = computed(() => `${ publicConfig.githubRepo }${ CONTACT_GITHUB_ISSUES_PATH }`)
    const discussionsUrl = computed(() => `${ publicConfig.githubRepo }${ CONTACT_GITHUB_DISCUSSIONS_PATH }`)
    const supportRoute = computed(() => localePath(CONTACT_SUPPORT_ROUTE))

    /*********************************************************
     * SEO
     *
     * @description
     * Title, description and the Open Graph pair are all filled — the site
     * audit measured every page short of them.
     ********************************************************/
    useSeoMeta({
        title: () => t('contact.meta.title', 'Contact'),
        description: () => t('contact.meta.description', 'How to reach the origam project: GitHub issues for defects, GitHub discussions for questions. No support address is published.'),
        ogTitle: () => t('contact.meta.title', 'Contact'),
        ogDescription: () => t('contact.meta.description', 'How to reach the origam project: GitHub issues for defects, GitHub discussions for questions. No support address is published.')
    })

    /*********************************************************
     * Expose
     *
     * @description
     * A route component is never driven from a parent.
     ********************************************************/
    defineExpose({})
</script>

<style scoped lang="scss">
    .contact-hero {
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

    .contact-block {
        padding-block-end: var(--origam-space---12, 3rem);

        &__body {
            margin-block-start: var(--origam-space---4, 1rem);
            max-inline-size: 70ch;
            color: var(--origam-color__text---secondary);
        }

        &__cta {
            margin-block-start: var(--origam-space---6, 1.5rem);
        }

        &__rule {
            margin-block: var(--origam-space---6, 1.5rem);
        }
    }
</style>
