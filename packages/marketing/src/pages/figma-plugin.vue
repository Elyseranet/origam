<script setup lang="ts">
import { computed } from 'vue'
import { useT } from '~/composables/useT'
import { MARKETING_DEFAULTS } from '~/consts/marketing.const'

const { t } = useT()

const githubPluginHref = computed(
    () => `${MARKETING_DEFAULTS.githubRepo}/tree/main/packages/figma-plugin`
)

useSeoMeta({
    title: () => t('figma_plugin.meta.title', 'Figma plugin · origam design system'),
    description: () => t('figma_plugin.meta.description', 'Sync origam design tokens and components into Figma. Install the Origam DS Sync plugin via its manifest and keep your Figma file in sync with the token layer.'),
    ogTitle: () => t('figma_plugin.meta.title', 'Figma plugin · origam design system'),
    ogDescription: () => t('figma_plugin.meta.description', 'Sync origam design tokens and components into Figma. Install the Origam DS Sync plugin via its manifest and keep your Figma file in sync with the token layer.')
})
</script>

<template>
    <article
        class="figma-plugin"
        data-cy="page-figma-plugin"
    >
        <section
            class="figma-plugin-hero"
            aria-labelledby="figma-plugin-title"
        >
            <origam-container class="figma-plugin-hero__inner">
                <origam-chip
                    class="figma-plugin-hero__badge"
                    color="primary"
                    border
                    border-color="var(--origam-color__action--primary---bg)"
                    size="small"
                    pill
                    data-cy="figma-plugin-hero-badge"
                >
                    {{ t('figma_plugin.hero.badge', 'Origam DS Sync') }}
                </origam-chip>

                <origam-title
                    id="figma-plugin-title"
                    tag="h1"
                    class="figma-plugin-hero__title"
                >
                    <span class="figma-plugin-hero__title-line">{{ t('figma_plugin.hero.title_line1', 'Figma meets') }}</span>
                    <span class="figma-plugin-hero__title-line figma-plugin-hero__title-line--accent">{{ t('figma_plugin.hero.title_line2', 'origam tokens.') }}</span>
                </origam-title>

                <p class="figma-plugin-hero__subtitle">
                    {{ t('figma_plugin.hero.subtitle', 'Origam DS Sync is a Figma plugin that generates 14 ComponentSets bound to your design tokens, and exports them back to the repo as Tokens Studio JSON or SCSS — keeping designers and developers in perfect sync.') }}
                </p>

                <nav
                    class="figma-plugin-hero__actions"
                    :aria-label="t('figma_plugin.hero.actions_label', 'Get the plugin')"
                >
                    <origam-btn
                        class="figma-plugin-hero__btn figma-plugin-hero__btn--primary"
                        variant="text"
                        prepend-icon="mdi-download"
                        href="/origam-figma-plugin.zip"
                        download
                        data-cy="figma-plugin-download-btn"
                    >
                        {{ t('figma_plugin.hero.cta_download', 'Download plugin') }}
                    </origam-btn>

                    <origam-btn
                        class="figma-plugin-hero__btn figma-plugin-hero__btn--secondary"
                        variant="text"
                        prepend-icon="mdi-github"
                        :href="githubPluginHref"
                        target="_blank"
                        rel="noopener noreferrer"
                        data-cy="figma-plugin-github-btn"
                    >
                        {{ t('figma_plugin.hero.cta_github', 'View on GitHub') }}
                    </origam-btn>
                </nav>
            </origam-container>
        </section>

        <section
            class="figma-plugin-install"
            aria-labelledby="figma-plugin-install-title"
            data-cy="figma-plugin-install"
        >
            <origam-container>
                <header class="figma-plugin-install__header">
                    <p class="figma-plugin-section__eyebrow">
                        {{ t('figma_plugin.install.eyebrow', 'SETUP') }}
                    </p>

                    <origam-title
                        id="figma-plugin-install-title"
                        tag="h2"
                        class="figma-plugin-section__title"
                    >
                        <span class="figma-plugin-section__title-line">{{ t('figma_plugin.install.title_line1', 'Import via') }}</span>
                        <span class="figma-plugin-section__title-line figma-plugin-section__title-line--muted">{{ t('figma_plugin.install.title_line2', 'manifest.') }}</span>
                    </origam-title>

                    <p class="figma-plugin-section__subtitle">
                        {{ t('figma_plugin.install.subtitle', 'Origam DS Sync is a development plugin — it is not published to the Figma Community. You install it locally by importing its manifest.json in Figma desktop.') }}
                    </p>

                    <aside
                        class="figma-plugin-install__note"
                        role="note"
                        data-cy="figma-plugin-desktop-note"
                    >
                        <origam-icon
                            icon="mdi-monitor"
                            size="18"
                            class="figma-plugin-install__note-icon"
                            aria-hidden="true"
                        />
                        <p class="figma-plugin-install__note-text">
                            {{ t('figma_plugin.install.desktop_note', 'Figma desktop app required — the browser version cannot load local manifests.') }}
                        </p>
                    </aside>
                </header>

                <ol
                    class="figma-plugin-steps"
                    :aria-label="t('figma_plugin.install.steps_label', 'Installation steps')"
                    data-cy="figma-plugin-steps"
                >
                    <li
                        class="figma-plugin-step"
                        data-cy="figma-plugin-step-download"
                    >
                        <div class="figma-plugin-step__meta">
                            <origam-avatar
                                icon="mdi-download"
                                color="primary"
                                rounded="lg"
                                size="48"
                                class="figma-plugin-step__avatar"
                                aria-hidden="true"
                            />
                            <div
                                class="figma-plugin-step__connector"
                                aria-hidden="true"
                            />
                        </div>

                        <div class="figma-plugin-step__content">
                            <origam-title
                                tag="h3"
                                class="figma-plugin-step__title"
                            >
                                {{ t('figma_plugin.install.steps.download.title', '1. Download the plugin') }}
                            </origam-title>

                            <p class="figma-plugin-step__desc">
                                {{ t('figma_plugin.install.steps.download.description', 'Download the zip archive containing the plugin manifest and built artefacts (dist/code.js + dist/ui.html).') }}
                            </p>

                            <origam-btn
                                class="figma-plugin-step__download-btn"
                                color="primary"
                                prepend-icon="mdi-download"
                                href="/origam-figma-plugin.zip"
                                download
                                rounded="lg"
                                data-cy="figma-plugin-step-download-btn"
                            >
                                {{ t('figma_plugin.install.steps.download.btn', 'origam-figma-plugin.zip') }}
                            </origam-btn>
                        </div>
                    </li>

                    <li
                        class="figma-plugin-step"
                        data-cy="figma-plugin-step-unzip"
                    >
                        <div class="figma-plugin-step__meta">
                            <origam-avatar
                                icon="mdi-folder-open-outline"
                                color="primary"
                                rounded="lg"
                                size="48"
                                class="figma-plugin-step__avatar"
                                aria-hidden="true"
                            />
                            <div
                                class="figma-plugin-step__connector"
                                aria-hidden="true"
                            />
                        </div>

                        <div class="figma-plugin-step__content">
                            <origam-title
                                tag="h3"
                                class="figma-plugin-step__title"
                            >
                                {{ t('figma_plugin.install.steps.unzip.title', '2. Unzip the archive') }}
                            </origam-title>

                            <p class="figma-plugin-step__desc">
                                {{ t('figma_plugin.install.steps.unzip.description', 'Extract the zip to a permanent location on your machine. Figma reads the manifest from disk — do not move the folder after importing.') }}
                            </p>
                        </div>
                    </li>

                    <li
                        class="figma-plugin-step"
                        data-cy="figma-plugin-step-menu"
                    >
                        <div class="figma-plugin-step__meta">
                            <origam-avatar
                                icon="mdi-application-import"
                                color="primary"
                                rounded="lg"
                                size="48"
                                class="figma-plugin-step__avatar"
                                aria-hidden="true"
                            />
                            <div
                                class="figma-plugin-step__connector"
                                aria-hidden="true"
                            />
                        </div>

                        <div class="figma-plugin-step__content">
                            <origam-title
                                tag="h3"
                                class="figma-plugin-step__title"
                            >
                                {{ t('figma_plugin.install.steps.menu.title', '3. Open Figma desktop → Plugins → Development') }}
                            </origam-title>

                            <p class="figma-plugin-step__desc">
                                {{ t('figma_plugin.install.steps.menu.description', 'Open any Figma file in the desktop app. In the top menu, go to Plugins → Development → Import plugin from manifest…') }}
                            </p>
                        </div>
                    </li>

                    <li
                        class="figma-plugin-step"
                        data-cy="figma-plugin-step-manifest"
                    >
                        <div class="figma-plugin-step__meta">
                            <origam-avatar
                                icon="mdi-file-code-outline"
                                color="primary"
                                rounded="lg"
                                size="48"
                                class="figma-plugin-step__avatar"
                                aria-hidden="true"
                            />
                            <div
                                class="figma-plugin-step__connector"
                                aria-hidden="true"
                            />
                        </div>

                        <div class="figma-plugin-step__content">
                            <origam-title
                                tag="h3"
                                class="figma-plugin-step__title"
                            >
                                {{ t('figma_plugin.install.steps.manifest.title', '4. Select manifest.json') }}
                            </origam-title>

                            <p class="figma-plugin-step__desc">
                                {{ t('figma_plugin.install.steps.manifest.description', 'In the file picker that opens, navigate to the unzipped folder and select manifest.json. Figma registers the plugin immediately.') }}
                            </p>
                        </div>
                    </li>

                    <li
                        class="figma-plugin-step figma-plugin-step--last"
                        data-cy="figma-plugin-step-run"
                    >
                        <div class="figma-plugin-step__meta">
                            <origam-avatar
                                icon="mdi-play-circle-outline"
                                color="primary"
                                rounded="lg"
                                size="48"
                                class="figma-plugin-step__avatar"
                                aria-hidden="true"
                            />
                        </div>

                        <div class="figma-plugin-step__content">
                            <origam-title
                                tag="h3"
                                class="figma-plugin-step__title"
                            >
                                {{ t('figma_plugin.install.steps.run.title', '5. Run Origam DS Sync') }}
                            </origam-title>

                            <p class="figma-plugin-step__desc">
                                {{ t('figma_plugin.install.steps.run.description', 'Go to Plugins → Development → Origam DS Sync. The plugin opens with three tabs: Generate (create ComponentSets), Export (Tokens Studio JSON or SCSS), and Sync (v2 placeholder).') }}
                            </p>
                        </div>
                    </li>
                </ol>
            </origam-container>
        </section>

        <section
            class="figma-plugin-cta"
            aria-labelledby="figma-plugin-cta-title"
            data-cy="figma-plugin-cta"
        >
            <div class="figma-plugin-cta__inner">
                <origam-title
                    id="figma-plugin-cta-title"
                    tag="h2"
                    class="figma-plugin-cta__title"
                >
                    {{ t('figma_plugin.cta.title', 'Ready to sync?') }}
                </origam-title>

                <p class="figma-plugin-cta__desc">
                    {{ t('figma_plugin.cta.description', 'Download the plugin, explore the source, or browse the origam component catalogue to see what gets generated.') }}
                </p>

                <nav
                    class="figma-plugin-cta__actions"
                    :aria-label="t('figma_plugin.cta.actions_label', 'Get started with the Figma plugin')"
                >
                    <origam-btn
                        class="figma-plugin-cta__btn figma-plugin-cta__btn--primary"
                        variant="text"
                        prepend-icon="mdi-download"
                        href="/origam-figma-plugin.zip"
                        download
                        data-cy="figma-plugin-cta-download"
                    >
                        {{ t('figma_plugin.cta.cta_download', 'Download plugin') }}
                    </origam-btn>

                    <origam-btn
                        class="figma-plugin-cta__btn figma-plugin-cta__btn--secondary"
                        variant="text"
                        prepend-icon="mdi-view-grid-outline"
                        href="/components"
                        data-cy="figma-plugin-cta-components"
                    >
                        {{ t('figma_plugin.cta.cta_components', 'Browse components') }}
                    </origam-btn>
                </nav>
            </div>
        </section>
    </article>
</template>

<style scoped lang="scss">
.figma-plugin {
    display: flex;
    flex-direction: column;
}

.figma-plugin-section {
    &__eyebrow {
        margin: 0 0 var(--origam-space---3, 0.75rem);
        font-size: var(--origam-font-size---xs, 0.75rem);
        font-weight: var(--origam-font__weight---semibold, 600);
        color: var(--origam-color__action--primary---fgSubtle, #6d28d9);
        text-transform: uppercase;
        letter-spacing: 0.08em;
    }

    &__title {
        margin: 0 0 var(--origam-space---2, 0.5rem);
        display: flex;
        flex-direction: column;
        font-size: var(--origam-font-size---section, 3rem);
        font-weight: var(--origam-font__weight---bold, 700);
        letter-spacing: var(--origam-letter-spacing---tight, -0.03em);
        line-height: 1.05;
        color: var(--origam-color__text---primary, #0a0a0a);
    }

    &__title-line {
        &--muted {
            color: var(--origam-color__text---secondary, #525252);
        }
    }

    &__subtitle {
        margin: var(--origam-space---4, 1rem) 0 0;
        max-inline-size: 42rem;
        font-size: var(--origam-font-size---lg, 1.125rem);
        line-height: 1.65;
        color: var(--origam-color__text---secondary, #525252);
    }
}

.figma-plugin-hero {
    position: relative;
    padding-block: var(--origam-space---20, 5rem) var(--origam-space---16, 4rem);
    overflow: hidden;

    &::before {
        content: '';
        position: absolute;
        inset: 0;
        background-image: var(--origam-gradient---hero-grid);
        background-size: 64px 64px;
        background-position: center top;
        -webkit-mask-image: linear-gradient(to bottom, #000 0%, transparent 80%);
        mask-image: linear-gradient(to bottom, #000 0%, transparent 80%);
        pointer-events: none;
        z-index: 0;
    }

    &::after {
        content: '';
        position: absolute;
        inset-inline: 0;
        inset-block-start: 0;
        block-size: 260px;
        background-image: var(--origam-gradient---hero-glow);
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
        text-align: center;
    }

    &__badge {
        --origam-chip---background-color: transparent;
    }

    &__title {
        margin: 0;
        display: flex;
        flex-direction: column;
        align-items: center;
        font-size: var(--origam-font-size---hero, 5.25rem);
        font-weight: var(--origam-font-weight---extrabold, 800);
        line-height: var(--origam-line-height---hero, 0.95);
        letter-spacing: var(--origam-letter-spacing---hero, -0.045em);
        padding-block-end: 0.1em;
        color: var(--origam-color__text---ink, #0a0a0a);
    }

    &__title-line {
        display: block;

        &--accent {
            color: var(--origam-color__action--primary---fgSubtle, #6d28d9);
        }
    }

    &__subtitle {
        margin: 0;
        max-inline-size: 40rem;
        font-size: var(--origam-font-size---lg, 1.125rem);
        line-height: var(--origam-line-height---relaxed, 1.7);
        color: var(--origam-color__text---secondary, #525252);
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

        &--primary {
            background-image: var(--origam-gradient---btn-primary);
            background-color: var(--origam-color---btn-primary-bg, transparent);
            box-shadow: var(--origam-shadow---btn-primary);
            --origam-btn---color: var(--origam-color---btn-primary-text);
        }

        &--secondary {
            background-image: var(--origam-gradient---btn-secondary);
            background-color: var(--origam-color---btn-secondary-bg);
            box-shadow: var(--origam-shadow---btn-secondary);
            border: 1px solid var(--origam-color---btn-secondary-border);
            --origam-btn---color: var(--origam-color---btn-secondary-text);
            --origam-btn---density-padding-x: var(--origam-space---4, 1rem);
        }
    }
}

.figma-plugin-install {
    padding-block: var(--origam-space---24, 6rem);

    &__header {
        margin-block-end: var(--origam-space---12, 3rem);
    }

    &__note {
        display: flex;
        align-items: flex-start;
        gap: var(--origam-space---3, 0.75rem);
        margin-block-start: var(--origam-space---5, 1.25rem);
        padding: var(--origam-space---3, 0.75rem) var(--origam-space---4, 1rem);
        border-inline-start: 3px solid var(--origam-color__action--primary---bg, #7c3aed);
        background: var(--origam-color__surface---sunken, #f5f5f5);
        border-radius: 0 var(--origam-radius---sm, 4px) var(--origam-radius---sm, 4px) 0;
        max-inline-size: 42rem;
    }

    &__note-icon {
        flex-shrink: 0;
        margin-block-start: 0.1rem;
        color: var(--origam-color__action--primary---fgSubtle, #6d28d9);
    }

    &__note-text {
        margin: 0;
        font-size: var(--origam-font-size---sm, 0.875rem);
        line-height: 1.65;
        color: var(--origam-color__text---secondary, #525252);
    }
}

.figma-plugin-steps {
    list-style: none;
    padding: 0;
    margin: 0;
    display: flex;
    flex-direction: column;
    gap: 0;
}

.figma-plugin-step {
    display: grid;
    grid-template-columns: 4rem 1fr;
    gap: 0 var(--origam-space---6, 1.5rem);

    &--last {
        .figma-plugin-step__connector {
            display: none;
        }

        .figma-plugin-step__content {
            padding-block-end: 0;
        }
    }

    &__meta {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 0;
    }

    &__avatar {
        flex-shrink: 0;
        z-index: 1;
    }

    &__connector {
        flex: 1;
        inline-size: 2px;
        background: var(--origam-color__border---default, rgba(0, 0, 0, 0.08));
        margin-block: var(--origam-space---2, 0.5rem);
        min-block-size: var(--origam-space---8, 2rem);
    }

    &__content {
        padding-block-end: var(--origam-space---12, 3rem);
        min-inline-size: 0;
    }

    &__title {
        display: block;
        font-size: var(--origam-font-size---xl, 1.25rem);
        font-weight: var(--origam-font__weight---bold, 700);
        color: var(--origam-color__text---primary, #0a0a0a);
        margin-block-end: var(--origam-space---3, 0.75rem);
        margin-block-start: var(--origam-space---2, 0.5rem);
    }

    &__desc {
        margin: 0 0 var(--origam-space---4, 1rem);
        font-size: var(--origam-font-size---base, 1rem);
        line-height: 1.65;
        color: var(--origam-color__text---secondary, #525252);
        max-inline-size: 52rem;
    }

    &__download-btn {
        --origam-btn---height: 44px;
        --origam-btn---density: 0px;
        --origam-btn---density-padding-x: var(--origam-space---5, 1.25rem);
        --origam-btn---border-radius: var(--origam-radius---btn, 10px);
    }
}

.figma-plugin-cta {
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
        max-inline-size: 48rem;
        margin-inline: auto;
        text-align: center;
    }

    &__title {
        margin: 0;
        font-size: var(--origam-font-size---cta, 4rem) !important;
        font-weight: var(--origam-font-weight---extrabold, 800);
        letter-spacing: var(--origam-letter-spacing---hero, -0.045em);
        line-height: var(--origam-line-height---hero, 0.95);
        color: var(--origam-color__text---ink, #0a0a0a);
    }

    &__desc {
        margin: 0;
        font-size: var(--origam-font-size---lg, 1.125rem);
        color: var(--origam-color__text---secondary, #525252);
        max-inline-size: 36rem;
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

        &--primary {
            background-image: var(--origam-gradient---btn-primary);
            background-color: var(--origam-color---btn-primary-bg, transparent);
            box-shadow: var(--origam-shadow---btn-primary);
            --origam-btn---color: var(--origam-color---btn-primary-text);
        }

        &--secondary {
            background-image: var(--origam-gradient---btn-secondary);
            background-color: var(--origam-color---btn-secondary-bg);
            box-shadow: var(--origam-shadow---btn-secondary);
            border: 1px solid var(--origam-color---btn-secondary-border);
            --origam-btn---color: var(--origam-color---btn-secondary-text);
            --origam-btn---density-padding-x: var(--origam-space---4, 1rem);
        }
    }
}

@media (max-width: 1080px) {
    .figma-plugin-hero {
        &__title {
            font-size: clamp(2.5rem, 9vw, 5.25rem);
        }
    }
}

@media (max-width: 768px) {
    .figma-plugin-section {
        &__title {
            font-size: clamp(1.75rem, 7vw, 3rem);
        }
    }

    .figma-plugin-cta {
        &__title {
            font-size: clamp(2rem, 8vw, 4rem) !important;
        }
    }

    .figma-plugin-step {
        grid-template-columns: 3rem 1fr;
        gap: 0 var(--origam-space---4, 1rem);
    }
}

@media (max-width: 640px) {
    .figma-plugin-step {
        grid-template-columns: 1fr;

        &__meta {
            flex-direction: row;
            margin-block-end: var(--origam-space---3, 0.75rem);
        }

        &__connector {
            display: none;
        }
    }
}
</style>
