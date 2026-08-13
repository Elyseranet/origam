<template>
    <section
        class="home-figma"
        aria-labelledby="figma-title"
    >
        <origam-grid
            columns="repeat(auto-fit, minmax(320px, 1fr))"
            gap="xl"
            align-items="center"
            class="home-figma__grid"
        >
            <origam-grid-item
                tag="div"
                class="home-figma__text-col"
            >
                <p class="home-figma__eyebrow">
                    {{ t('home.figma.eyebrow', 'DESIGN TOOLING') }}
                </p>

                <origam-title
                    id="figma-title"
                    tag="h2"
                    class="home-figma__title"
                >
                    <span class="home-figma__title-line">{{ t('home.figma.title_line1', 'Design in Figma.') }}</span>
                    <span class="home-figma__title-line">{{ t('home.figma.title_line2', 'Ship the same tokens.') }}</span>
                </origam-title>

                <p class="home-figma__subtitle">
                    {{ t('home.figma.subtitle', 'Origam DS Sync is a free Figma plugin that turns your design tokens into real Figma components, and exports Figma Variables back out in a format origam already understands.') }}
                </p>

                <ul class="home-figma__highlights">
                    <li
                        v-for="highlight in HOME_FIGMA_HIGHLIGHTS"
                        :key="highlight.key"
                        class="home-figma__highlight"
                        :data-cy="`figma-highlight-${highlight.key}`"
                    >
                        <origam-avatar
                            :icon="highlight.icon"
                            color="primary"
                            rounded="lg"
                            :size="40"
                            class="home-figma__highlight-icon"
                            aria-hidden="true"
                        />

                        <p class="home-figma__highlight-title">
                            {{ t(highlight.titleKey, highlight.titleFallback) }}
                        </p>
                        <p class="home-figma__highlight-desc">
                            {{ t(highlight.descriptionKey, highlight.descriptionFallback) }}
                        </p>
                    </li>
                </ul>

                <nav
                    class="home-figma__actions"
                    :aria-label="t('home.figma.actions_label', 'Get the Figma plugin')"
                >
                    <origam-btn
                        v-if="showPluginCta"
                        class="home-figma__btn"
                        color="primary"
                        append-icon="mdi-arrow-right"
                        :href="HOME_FIGMA_HREF"
                        data-cy="figma-cta-explore"
                    >
                        {{ t('home.figma.cta_explore', 'Explore the plugin') }}
                    </origam-btn>

                    <origam-btn
                        v-if="showDownloadCta"
                        class="home-figma__btn home-figma__btn--secondary"
                        variant="text"
                        prepend-icon="mdi-download"
                        :href="HOME_FIGMA_DOWNLOAD_HREF"
                        download
                        data-cy="figma-cta-download"
                    >
                        {{ t('home.figma.cta_download', 'Download plugin') }}
                    </origam-btn>
                </nav>
            </origam-grid-item>

            <origam-grid-item
                tag="div"
                class="home-figma__visual-col"
            >
                <origam-sheet
                    tag="figure"
                    rounded="lg"
                    border
                    border-color="var(--origam-color__border---ghost)"
                    class="home-figma__mapping"
                    data-cy="figma-token-mapping"
                >
                    <figcaption class="home-figma__mapping-label">
                        {{ t('home.figma.mapping_label', 'token.json ⇄ Figma Variable') }}
                    </figcaption>

                    <dl class="home-figma__mapping-list">
                        <div
                            v-for="mapping in HOME_FIGMA_TOKEN_MAPPINGS"
                            :key="mapping.key"
                            class="home-figma__mapping-row"
                            :data-cy="`figma-mapping-${mapping.key}`"
                        >
                            <dt class="home-figma__mapping-token">
                                {{ mapping.tokenPath }}
                            </dt>
                            <dd class="home-figma__mapping-variable">
                                {{ mapping.variableName }}
                            </dd>
                        </div>
                    </dl>
                </origam-sheet>
            </origam-grid-item>
        </origam-grid>
    </section>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useT } from '~/composables/useT'
import { useLinkAvailability } from '~/composables/useLinkAvailability'
import {
    HOME_FIGMA_HREF,
    HOME_FIGMA_DOWNLOAD_HREF,
    HOME_FIGMA_HIGHLIGHTS,
    HOME_FIGMA_TOKEN_MAPPINGS
} from '~/consts/home-figma.const'

const { t } = useT()

const { availability } = useLinkAvailability([HOME_FIGMA_HREF, HOME_FIGMA_DOWNLOAD_HREF])

const showPluginCta = computed(() => availability[HOME_FIGMA_HREF] === true)
const showDownloadCta = computed(() => availability[HOME_FIGMA_DOWNLOAD_HREF] === true)
</script>

<style scoped lang="scss">
.home-figma {
    width: 100%;
    padding-block: var(--origam-space---24, 6rem);
    padding-inline: var(--origam-space---14, 3.5rem);
    box-sizing: border-box;

    &__text-col {
        display: flex;
        flex-direction: column;
        align-items: flex-start;
        gap: var(--origam-space---6, 1.5rem);
    }

    &__eyebrow {
        margin: 0;
        font-size: var(--origam-font-size---xs, 0.75rem);
        font-weight: var(--origam-font__weight---semibold, 600);
        color: var(--origam-color__action--primary---fgSubtle, #6d28d9);
        text-transform: uppercase;
        letter-spacing: 0.08em;
    }

    &__title {
        margin: 0;
        display: flex;
        flex-direction: column;
        font-size: var(--origam-font-size---section, 3rem);
        font-weight: var(--origam-font__weight---bold, 700);
        letter-spacing: var(--origam-letter-spacing---tight, -0.03em);
        line-height: 1.05;
        color: var(--origam-color__text---primary, #0a0a0a);
    }

    &__subtitle {
        margin: 0;
        max-inline-size: 34rem;
        font-size: var(--origam-font-size---base, 1rem);
        line-height: 1.6;
        color: var(--origam-color__text---secondary, #525252);
    }

    &__highlights {
        list-style: none;
        margin: 0;
        padding: 0;
        display: flex;
        flex-direction: column;
        gap: var(--origam-space---4, 1rem);
        max-inline-size: 34rem;
    }

    &__highlight {
        list-style: none;
        display: grid;
        grid-template-columns: auto 1fr;
        column-gap: var(--origam-space---3, 0.75rem);
        row-gap: var(--origam-space---1, 0.25rem);
    }

    &__highlight-icon {
        --origam-avatar---background-color: var(--origam-color__action--primary---bgSubtle, rgba(124, 58, 237, 0.1));
        --origam-avatar---icon-color: var(--origam-color__action--primary---fgSubtle, #6d28d9);
        grid-row: 1 / 3;
    }

    &__highlight-title {
        margin: 0;
        font-size: var(--origam-font-size---base, 1rem);
        font-weight: var(--origam-font__weight---semibold, 600);
        color: var(--origam-color__text---primary, #0a0a0a);
    }

    &__highlight-desc {
        margin: 0;
        font-size: var(--origam-font-size---sm, 0.875rem);
        line-height: 1.5;
        color: var(--origam-color__text---secondary, #525252);
    }

    &__actions {
        display: flex;
        flex-wrap: wrap;
        align-items: center;
        gap: var(--origam-space---3, 0.75rem);
        margin-block-start: var(--origam-space---2, 0.5rem);
    }

    &__mapping {
        padding: var(--origam-space---6, 1.5rem);
        background-color: var(--origam-color__surface---default);
    }

    &__mapping-label {
        margin: 0 0 var(--origam-space---4, 1rem);
        font-size: var(--origam-font-size---xs, 0.75rem);
        font-weight: var(--origam-font__weight---semibold, 600);
        letter-spacing: 0.04em;
        color: var(--origam-color__text---secondary, #525252);
        font-family: var(--origam-font__family---mono, 'JetBrains Mono', monospace);
    }

    &__mapping-list {
        margin: 0;
        display: flex;
        flex-direction: column;
        gap: var(--origam-space---3, 0.75rem);
    }

    &__mapping-row {
        display: grid;
        grid-template-columns: 1fr 1fr;
        align-items: center;
        gap: var(--origam-space---2, 0.5rem);
        padding-block: var(--origam-space---2, 0.5rem);
        border-block-end: 1px solid var(--origam-color__border---subtle, rgba(0, 0, 0, 0.06));

        &:last-child {
            border-block-end: none;
        }
    }

    &__mapping-token,
    &__mapping-variable {
        margin: 0;
        font-size: var(--origam-font-size---sm, 0.875rem);
        font-family: var(--origam-font__family---mono, 'JetBrains Mono', monospace);
        color: var(--origam-color__text---primary, #0a0a0a);
        overflow-wrap: break-word;
    }

    &__mapping-token::after {
        content: '⇄';
        display: inline-block;
        margin-inline-start: var(--origam-space---2, 0.5rem);
        color: var(--origam-color__text---tertiary, #737373);
    }

    &__mapping-variable {
        text-align: end;
        color: var(--origam-color__text---secondary, #525252);
    }
}

@media (max-width: 40rem) {
    .home-figma {
        padding-inline: var(--origam-space---6, 1.5rem);

        &__title {
            font-size: clamp(1.75rem, 8vw, 3rem);
        }

        &__mapping-row {
            grid-template-columns: 1fr;
            gap: var(--origam-space---1, 0.25rem);
            text-align: start;
        }

        &__mapping-token::after {
            content: none;
        }

        &__mapping-variable {
            text-align: start;
        }
    }
}
</style>
