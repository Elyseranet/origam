<template>
    <article
        class="support"
        data-cy="page-support"
    >
        <enso-page-header
            family="editorial"
            title-id="support-title"
        >
            <template #breadcrumb>
                <origam-breadcrumb
                    :items="breadcrumbItems"
                    divider="/"
                    :border="0"
                    data-cy="support-breadcrumb"
                />
            </template>

            <template #eyebrow>
                <span data-cy="support-hero-badge">{{ t('support.hero.badge', 'Independent and free') }}</span>
            </template>

            <template #title>
                {{ t('support.hero.title', 'Support origam') }}
            </template>

            <template #intro>
                {{ t('support.hero.lead', 'origam is built and maintained by one developer, on his own time. It is free, MIT-licensed, and it will stay that way. If it saves you time, a donation keeps it moving.') }}
            </template>
        </enso-page-header>

        <section
            class="support-section support-give"
            :class="give.classes"
            aria-labelledby="support-give-title"
        >
            <origam-container class="support-give__inner home-container">
                <p class="home-eyebrow">
                    {{ give.label }}
                </p>

                <origam-title
                    id="support-give-title"
                    tag="h2"
                    class="support-give__title"
                >
                    {{ t('support.give.title', 'Make a donation') }}
                </origam-title>

                <div class="support-give__panel">
                    <origam-qr-code
                        v-if="hasDonateUrl"
                        class="support-give__qr"
                        :value="donateUrl"
                        :aria-label="qrAriaLabel"
                        :size="220"
                        rounded="lg"
                        border
                        padding="4"
                        data-cy="support-qr"
                    />

                    <div class="support-give__actions">
                        <p class="support-give__hint">
                            {{ t('support.give.hint', 'Scan the code with your phone, or use the button below. Payments are handled by PayPal — no account is required to give by card.') }}
                        </p>

                        <origam-btn
                            v-if="hasDonateUrl"
                            :href="donateUrl"
                            target="_blank"
                            rel="noopener noreferrer"
                            variant="flat"
                            bg-color="primary"
                            size="large"
                            rounded="lg"
                            data-cy="support-donate-cta"
                        >
                            {{ t('support.give.cta', 'Donate via PayPal') }}
                        </origam-btn>
                    </div>
                </div>
            </origam-container>
        </section>

        <section
            class="support-section support-what"
            :class="what.classes"
            aria-labelledby="support-what-title"
        >
            <origam-container class="support-what__inner home-container">
                <p class="home-eyebrow">
                    {{ what.label }}
                </p>

                <origam-title
                    id="support-what-title"
                    tag="h2"
                    class="support-what__title"
                >
                    {{ t('support.what.title', 'What it changes') }}
                </origam-title>

                <p class="support-what__body">
                    {{ t('support.what.body', 'Donations buy maintenance time: answering issues, keeping dependencies patched, testing across browsers, and writing the documentation that makes a component usable rather than merely shipped. They are not a support contract and they buy no priority — they simply make the unglamorous work sustainable.') }}
                </p>

                <origam-divider class="support-what__rule"/>

                <p class="support-what__alt">
                    {{ t('support.what.alt', 'Not in a position to give? Reporting a precise bug, improving a documentation page or telling someone about origam helps just as much.') }}
                </p>
            </origam-container>
        </section>

        <home-cta
            surface="overlay"
            data-cy="support-cta"
        />
    </article>
</template>

<script setup lang="ts">
    import { computed } from 'vue'

    import { useLocaleHref } from '~/composables/useLocaleHref'
    import { useT } from '~/composables/useT'
    import { SUPPORT_SECTIONS } from '~/consts/support.const'
    import { editorialSectionViews } from '~/utils/editorial.util'

    const { t } = useT()
    const { localeHref } = useLocaleHref()

    const breadcrumbItems = computed(() => [
        { title: t('nav.home', 'Home'), to: localeHref('/') },
        { title: t('support.hero.title', 'Support origam') }
    ])

    const sectionViews = editorialSectionViews(SUPPORT_SECTIONS, 'support-section')
    const give = sectionViews[0]!
    const what = sectionViews[1]!
    const { public: publicConfig } = useRuntimeConfig()

    const donateUrl = computed(() => publicConfig.donateUrl)
    const hasDonateUrl = computed(() => donateUrl.value.length > 0)

    const qrAriaLabel = computed(() => t('a11y.donate_qr', 'QR code linking to the donation page'))

    useSeoMeta({
        title: () => t('support.meta.title', 'Support origam · Vue 3 design system'),
        description: () => t('support.meta.description', 'origam is free and MIT-licensed, maintained by one developer. Donations fund the maintenance work.'),
        ogTitle: () => t('support.meta.title', 'Support origam · Vue 3 design system'),
        ogDescription: () => t('support.meta.description', 'origam is free and MIT-licensed, maintained by one developer. Donations fund the maintenance work.')
    })
</script>

<style scoped lang="scss">
    @use '../assets/scss/editorial';

    .support {
        @include editorial.editorial-page;
    }

    .support-section {
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
    }

    .support-give,
    .support-what {
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
    }

    .support-give {
        &__panel {
            align-items: center;
            display: flex;
            flex-wrap: wrap;
            gap: var(--origam-space---8, 2rem);
            margin-block-start: var(--origam-space---4, 1rem);
        }

        &__actions {
            align-items: flex-start;
            display: flex;
            flex-direction: column;
            gap: var(--origam-space---4, 1rem);
            max-inline-size: 42ch;
        }

        &__hint {
            margin: 0;
            color: var(--origam-color__text---secondary);
        }
    }

    .support-what {
        &__body,
        &__alt {
            margin: 0;
            max-inline-size: 70ch;
            font-size: var(--home-fs-lead);
            color: var(--origam-color__text---secondary);
        }

        &__rule {
            margin-block: var(--origam-space---4, 1rem);
            inline-size: 100%;
            max-inline-size: 70ch;
        }
    }
</style>
