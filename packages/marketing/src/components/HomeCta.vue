<script setup lang="ts">
import { computed } from 'vue'
import { useT } from '~/composables/useT'
import { useLinkAvailability } from '~/composables/useLinkAvailability'
import { CTA_START_HREF, CTA_DOCS_HREF } from '~/consts/cta.const'

const { t } = useT()

const { availability } = useLinkAvailability([CTA_START_HREF, CTA_DOCS_HREF])

const showStartCta = computed(() => availability[CTA_START_HREF] === true)
const showDocsCta = computed(() => availability[CTA_DOCS_HREF] === true)
</script>

<template>
    <section
        class="home-cta"
        aria-labelledby="cta-title"
    >
        <div class="home-cta__inner">
            <origam-title
                id="cta-title"
                tag="h2"
                class="home-cta__title"
            >
                {{ t('home.cta.title', 'Ready to ship faster?') }}
            </origam-title>

            <p class="home-cta__description">
                {{ t('home.cta.description', 'Spin up your Vue 3 project with origam in 30 seconds.') }}
            </p>

            <nav
                class="home-cta__actions"
                :aria-label="t('home.cta.actions_label', 'Get started')"
            >
                <origam-btn
                    v-if="showStartCta"
                    class="home-cta__btn home-cta__btn--start"
                    variant="text"
                    append-icon="mdi-arrow-right"
                    :href="CTA_START_HREF"
                    data-cy="cta-btn-start"
                >
                    {{ t('home.cta.cta_start', 'Get started') }}
                </origam-btn>

                <origam-btn
                    v-if="showDocsCta"
                    class="home-cta__btn home-cta__btn--docs"
                    variant="text"
                    prepend-icon="mdi-code-tags"
                    :href="CTA_DOCS_HREF"
                    data-cy="cta-btn-docs"
                >
                    {{ t('home.cta.cta_docs', 'Read docs') }}
                </origam-btn>
            </nav>
        </div>
    </section>
</template>

<style scoped lang="scss">
.home-cta {
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
        max-width: 48rem;
        margin-inline: auto;
        text-align: center;
    }

    &__title {
        margin: 0;
        font-size: var(--origam-font-size---cta, 4rem);
        font-weight: var(--origam-font-weight---extrabold, 800);
        letter-spacing: var(--origam-letter-spacing---hero, -0.045em);
        line-height: var(--origam-line-height---hero, 0.95);
        color: var(--origam-color__text---ink, #0a0a0a);
    }

    &__description {
        margin: 0;
        font-size: var(--origam-font-size---lg, 1.125rem);
        color: var(--origam-color__text---secondary, #525252);
        max-width: 36rem;
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

        &--start {
            background-image: var(--origam-gradient---btn-primary);
            background-color: var(--origam-color---btn-primary-bg, transparent);
            box-shadow: var(--origam-shadow---btn-primary);
            --origam-btn---color: var(--origam-color---btn-primary-text);
        }

        &--docs {
            background-image: var(--origam-gradient---btn-secondary);
            background-color: var(--origam-color---btn-secondary-bg);
            box-shadow: var(--origam-shadow---btn-secondary);
            border: 1px solid var(--origam-color---btn-secondary-border);
            --origam-btn---color: var(--origam-color---btn-secondary-text);
            --origam-btn---density-padding-x: var(--origam-space---4, 1rem);
        }
    }
}
</style>
