<template>
    <article
        class="privacy"
        data-cy="page-privacy"
    >
        <section
            class="privacy-hero"
            aria-labelledby="privacy-title"
        >
            <origam-container class="privacy-hero__inner">
                <origam-chip
                    class="privacy-hero__badge"
                    color="primary"
                    size="small"
                    border
                    pill
                    data-cy="privacy-hero-badge"
                >
                    {{ t('privacy.hero.badge', 'Measured, not drafted') }}
                </origam-chip>

                <origam-title
                    id="privacy-title"
                    tag="h1"
                    class="privacy-hero__title"
                >
                    {{ t('privacy.hero.title', 'Privacy') }}
                </origam-title>

                <p class="privacy-hero__lead">
                    {{ t('privacy.hero.lead', 'This page lists only what was verified in the source code of this site, and by loading a page with the network log open. It is deliberately short — there is very little to report. Each statement names the thing it describes, so you can check it yourself in your browser.') }}
                </p>
            </origam-container>
        </section>

        <section
            class="privacy-block"
            aria-labelledby="privacy-collect-title"
        >
            <origam-container class="privacy-block__inner">
                <origam-title
                    id="privacy-collect-title"
                    tag="h2"
                    class="privacy-block__title"
                >
                    {{ t('privacy.collect.title', 'What is not collected') }}
                </origam-title>

                <p class="privacy-block__body">
                    {{ t('privacy.collect.body', 'There is no analytics, no tracking pixel and no third-party measurement script anywhere on this site. Nothing records which pages you visit, how long you stay, or where you arrived from. No visitor account exists, so nothing is attached to an identity.') }}
                </p>
            </origam-container>
        </section>

        <section
            class="privacy-block"
            aria-labelledby="privacy-cookies-title"
        >
            <origam-container class="privacy-block__inner">
                <origam-title
                    id="privacy-cookies-title"
                    tag="h2"
                    class="privacy-block__title"
                >
                    {{ t('privacy.cookies.title', 'Cookies') }}
                </origam-title>

                <p class="privacy-block__body">
                    {{ t('privacy.cookies.intro', 'Browsing this site sets cookies for two things only, both of them preferences you chose yourself:') }}
                </p>

                <ul class="privacy-block__list">
                    <li>
                        {{ t('privacy.cookies.locale', 'origam_locale — the display language, so the site does not revert to English on your next visit.') }}
                    </li>
                    <li>
                        {{ t('privacy.cookies.theme', 'origam-theme and origam-mode — the theme and the light or dark appearance you selected.') }}
                    </li>
                </ul>

                <p class="privacy-block__body">
                    {{ t('privacy.cookies.admin', 'A separate session cookie exists for the private administration area. It is created by logging in there and never by browsing the public site.') }}
                </p>
            </origam-container>
        </section>

        <section
            class="privacy-block"
            aria-labelledby="privacy-storage-title"
        >
            <origam-container class="privacy-block__inner">
                <origam-title
                    id="privacy-storage-title"
                    tag="h2"
                    class="privacy-block__title"
                >
                    {{ t('privacy.storage.title', 'Local storage') }}
                </origam-title>

                <p class="privacy-block__body">
                    {{ t('privacy.storage.body', 'The theme builder saves your work in progress in your browser, under the key origam_theme_builder_state, alongside origam-theme and origam-mode for your appearance choice. These entries never leave the browser: they are not sent to any server, and clearing the site data removes them.') }}
                </p>
            </origam-container>
        </section>

        <section
            class="privacy-block"
            aria-labelledby="privacy-forms-title"
        >
            <origam-container class="privacy-block__inner">
                <origam-title
                    id="privacy-forms-title"
                    tag="h2"
                    class="privacy-block__title"
                >
                    {{ t('privacy.forms.title', 'Forms and search') }}
                </origam-title>

                <p class="privacy-block__body">
                    {{ t('privacy.forms.body', 'This site carries a single form — the property panel of the theme builder — and it submits nothing: it edits a preview inside the page. The search field filters a catalogue your browser has already downloaded, so what you type into it is never sent anywhere.') }}
                </p>
            </origam-container>
        </section>

        <section
            class="privacy-block"
            aria-labelledby="privacy-third-party-title"
        >
            <origam-container class="privacy-block__inner">
                <origam-title
                    id="privacy-third-party-title"
                    tag="h2"
                    class="privacy-block__title"
                >
                    {{ t('privacy.third_party.title', 'No third party') }}
                </origam-title>

                <p class="privacy-block__body">
                    {{ t('privacy.third_party.body', 'Nothing on the pages of this site is fetched from another company\'s server. The typefaces — Fraunces, Inter and JetBrains Mono — are served by this site itself, from its own /fonts folder. They used to be requested from Google Fonts, which revealed your IP address and browser to Google on every page; that request no longer exists. The nineteen public pages were each loaded with the network log open, and none of them contacted any host other than this one.') }}
                </p>

                <p class="privacy-block__body">
                    {{ t('privacy.third_party.embeds', 'One exception, measured and named: the component stories published under /stories are a separate build produced by a third-party tool, and opening that page loads its interface font from Google Fonts and its icons from api.iconify.design. You reach it by following a link, never by browsing the site. The reference documentation under /docs is a separate build too; it was not measured, so nothing is claimed about it here.') }}
                </p>

                <origam-divider class="privacy-block__rule"/>

                <p class="privacy-block__body">
                    {{ t('privacy.third_party.links', 'The other external addresses on this site — the GitHub repository, the donation page, Discord — are ordinary links. Nothing is requested from them unless you click.') }}
                </p>
            </origam-container>
        </section>

        <section
            class="privacy-block"
            aria-labelledby="privacy-method-title"
        >
            <origam-container class="privacy-block__inner">
                <origam-title
                    id="privacy-method-title"
                    tag="h2"
                    class="privacy-block__title"
                >
                    {{ t('privacy.method.title', 'How this page was established') }}
                </origam-title>

                <p class="privacy-block__body">
                    {{ t('privacy.method.body', 'Every statement above comes from reading the source code of this site and from loading a page in a browser with the network log open — not from a template. Nothing here was assumed.') }}
                </p>

                <p class="privacy-block__body">
                    {{ t('privacy.method.scope', 'It describes the behaviour of the application itself. What the server hosting it records at the network level was not measured, and is therefore not described here.') }}
                </p>

                <p class="privacy-block__meta">
                    {{ reviewedLine }}
                </p>
            </origam-container>
        </section>
    </article>
</template>

<script setup lang="ts">
    import { computed } from 'vue'

    import { useT } from '~/composables/useT'

    /*********************************************************
     * Global
     *
     * @description
     * The page carries no state: it renders measured facts. The only
     * computed values are the review date line and the SEO strings, both
     * of which have to go through `t()` rather than being inlined.
     ********************************************************/
    const { t } = useT()

    const reviewedLine = computed(() => t('privacy.method.reviewed', 'Last verified against the source code on 17 September 2026.'))

    /*********************************************************
     * SEO
     *
     * @description
     * Title, description and the Open Graph pair are all filled — the site
     * audit measured every page short of them, and an untitled legal page
     * is the one most likely to be linked from elsewhere.
     ********************************************************/
    useSeoMeta({
        title: () => t('privacy.meta.title', 'Privacy'),
        description: () => t('privacy.meta.description', 'What this site stores and sends, measured in its own source code: no analytics, no tracker, preference cookies only, and no third party on its own pages.'),
        ogTitle: () => t('privacy.meta.title', 'Privacy'),
        ogDescription: () => t('privacy.meta.description', 'What this site stores and sends, measured in its own source code: no analytics, no tracker, preference cookies only, and no third party on its own pages.')
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
    .privacy-hero {
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

    .privacy-block {
        padding-block-end: var(--origam-space---12, 3rem);

        &__body {
            margin-block-start: var(--origam-space---4, 1rem);
            max-inline-size: 70ch;
            color: var(--origam-color__text---secondary);
        }

        &__list {
            margin-block-start: var(--origam-space---4, 1rem);
            max-inline-size: 70ch;
            padding-inline-start: var(--origam-space---6, 1.5rem);
            color: var(--origam-color__text---secondary);
            display: grid;
            gap: var(--origam-space---2, 0.5rem);
        }

        &__rule {
            margin-block: var(--origam-space---6, 1.5rem);
        }

        &__meta {
            margin-block-start: var(--origam-space---6, 1.5rem);
            color: var(--origam-color__text---secondary);
            font-size: var(--origam-font-size---sm, 0.875rem);
        }
    }
</style>
