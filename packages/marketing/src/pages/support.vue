<template>
    <article
        class="support"
        data-cy="page-support"
    >
        <section
            class="support-hero"
            aria-labelledby="support-title"
        >
            <origam-container class="support-hero__inner">
                <origam-chip
                    class="support-hero__badge"
                    color="primary"
                    size="small"
                    border
                    pill
                    data-cy="support-hero-badge"
                >
                    {{ t('support.hero.badge', 'Independent and free') }}
                </origam-chip>

                <origam-title
                    id="support-title"
                    tag="h1"
                    class="support-hero__title"
                >
                    {{ t('support.hero.title', 'Support origam') }}
                </origam-title>

                <p class="support-hero__lead">
                    {{ t('support.hero.lead', 'origam is built and maintained by one developer, on his own time. It is free, MIT-licensed, and it will stay that way. If it saves you time, a donation keeps it moving.') }}
                </p>
            </origam-container>
        </section>

        <section
            class="support-give"
            aria-labelledby="support-give-title"
        >
            <origam-container class="support-give__inner">
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
                            :aria-label="donateAriaLabel"
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
            class="support-what"
            aria-labelledby="support-what-title"
        >
            <origam-container class="support-what__inner">
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
    </article>
</template>

<script setup lang="ts">
    import { computed } from 'vue'

    import { useT } from '~/composables/useT'

    const { t } = useT()
    const { public: publicConfig } = useRuntimeConfig()

    const donateUrl = computed(() => publicConfig.donateUrl)
    const hasDonateUrl = computed(() => donateUrl.value.length > 0)

    const qrAriaLabel = computed(() => t('a11y.donate_qr', 'QR code linking to the donation page'))
    const donateAriaLabel = computed(() => t('a11y.donate', 'Support origam with a donation'))

    useSeoMeta({
        title: () => t('support.meta.title', 'Support origam · Vue 3 design system'),
        description: () => t('support.meta.description', 'origam is free and MIT-licensed, maintained by one developer. Donations fund the maintenance work.'),
        ogTitle: () => t('support.meta.title', 'Support origam · Vue 3 design system'),
        ogDescription: () => t('support.meta.description', 'origam is free and MIT-licensed, maintained by one developer. Donations fund the maintenance work.')
    })
</script>

<style scoped lang="scss">
    .support-hero {
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

    .support-give {
        padding-block-end: var(--origam-space---12, 3rem);

        &__panel {
            align-items: center;
            display: flex;
            flex-wrap: wrap;
            gap: var(--origam-space---8, 2rem);
            justify-content: center;
            margin-block-start: var(--origam-space---6, 1.5rem);
        }

        &__actions {
            align-items: flex-start;
            display: flex;
            flex-direction: column;
            gap: var(--origam-space---4, 1rem);
            max-inline-size: 42ch;
        }

        &__hint {
            color: var(--origam-color__text---secondary);
        }
    }

    .support-what {
        padding-block-end: var(--origam-space---12, 3rem);

        &__body,
        &__alt {
            margin-block-start: var(--origam-space---4, 1rem);
            max-inline-size: 70ch;
            color: var(--origam-color__text---secondary);
        }

        &__rule {
            margin-block: var(--origam-space---6, 1.5rem);
        }
    }
</style>
