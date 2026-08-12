<script setup lang="ts">
import { computed, ref } from 'vue'
import { useT } from '~/composables/useT'
import {
    INSTALLATION_HERO_BADGE_VARS,
    INSTALLATION_PEER_DEPS,
    INSTALLATION_PACKAGE_MANAGERS,
    INSTALLATION_CODE_REGISTER,
    INSTALLATION_CODE_USE,
    INSTALLATION_CODE_THEME_HTML,
    INSTALLATION_CODE_THEME_RUNTIME,
    INSTALLATION_CODE_THEME_SCOPED,
    INSTALLATION_CODE_NUXT
} from '~/consts/installation.const'
import { MARKETING_DEFAULTS } from '~/consts/marketing.const'

const { t } = useT()

useSeoMeta({
    title: () => t('installation.meta.title', 'Installation · origam design system'),
    description: () => t('installation.meta.description', 'Get origam up and running in minutes. Install the npm package, register the plugin, and start building with 95+ accessible Vue 3 components.'),
    ogTitle: () => t('installation.meta.title', 'Installation · origam design system'),
    ogDescription: () => t('installation.meta.description', 'Get origam up and running in minutes. Install the npm package, register the plugin, and start building with 95+ accessible Vue 3 components.')
})

const peerDeps = computed(() => INSTALLATION_PEER_DEPS)
const packageManagers = computed(() => INSTALLATION_PACKAGE_MANAGERS)
const activePackageManager = ref<string>(INSTALLATION_PACKAGE_MANAGERS[0].value)
const currentInstallCmd = computed(() =>
    INSTALLATION_PACKAGE_MANAGERS.find(pm => pm.value === activePackageManager.value)?.code
        ?? INSTALLATION_PACKAGE_MANAGERS[0].code
)
const githubHref = computed(() => MARKETING_DEFAULTS.githubRepo)
</script>

<template>
    <article
        class="installation"
        data-cy="page-installation"
    >
        <section
            class="installation-hero"
            aria-labelledby="installation-title"
        >
            <origam-container class="installation-hero__inner">
                <origam-chip
                    class="installation-hero__badge"
                    :style="INSTALLATION_HERO_BADGE_VARS"
                    color="primary"
                    border
                    border-color="var(--origam-color__action--primary---bg)"
                    size="small"
                    pill
                    data-cy="installation-hero-badge"
                >
                    {{ t('installation.hero.badge', 'npm install origam') }}
                </origam-chip>

                <origam-title
                    id="installation-title"
                    tag="h1"
                    class="installation-hero__title"
                >
                    <span class="installation-hero__title-line">{{ t('installation.hero.title_line1', 'Up and running') }}</span>
                    <span class="installation-hero__title-line installation-hero__title-line--accent">{{ t('installation.hero.title_line2', 'in minutes.') }}</span>
                </origam-title>

                <p class="installation-hero__subtitle">
                    {{ t('installation.hero.subtitle', 'Install origam, register the plugin, and start building with 95+ accessible, token-driven Vue 3 components right away.') }}
                </p>
            </origam-container>
        </section>

        <section
            class="installation-steps"
            aria-labelledby="installation-steps-title"
            data-cy="installation-steps"
        >
            <origam-container>
                <header class="installation-steps__header">
                    <p class="installation-section__eyebrow">
                        {{ t('installation.steps.eyebrow', 'STEP BY STEP') }}
                    </p>

                    <origam-title
                        id="installation-steps-title"
                        tag="h2"
                        class="installation-section__title"
                    >
                        <span class="installation-section__title-line">{{ t('installation.steps.title_line1', 'Five steps.') }}</span>
                        <span class="installation-section__title-line installation-section__title-line--muted">{{ t('installation.steps.title_line2', 'You\'re set.') }}</span>
                    </origam-title>

                    <p class="installation-section__subtitle">
                        {{ t('installation.steps.subtitle', 'From zero to a fully themed Vue 3 app with origam — no boilerplate needed.') }}
                    </p>
                </header>

                <origam-grid
                    tag="ol"
                    columns="1"
                    gap="0"
                    class="installation-steps__list"
                    :aria-label="t('installation.steps.list_label', 'Installation steps')"
                >
                    <origam-grid-item
                        tag="li"
                        class="installation-step"
                        data-cy="installation-step-install"
                    >
                        <div class="installation-step__meta">
                            <origam-avatar
                                icon="mdi-package-down"
                                color="primary"
                                rounded="lg"
                                size="48"
                                class="installation-step__avatar"
                                aria-hidden="true"
                            />

                            <div class="installation-step__connector" aria-hidden="true" />
                        </div>

                        <div class="installation-step__content">
                            <origam-title
                                tag="h3"
                                class="installation-step__title"
                            >
                                {{ t('installation.steps.install.title', '1. Install') }}
                            </origam-title>

                            <p class="installation-step__desc">
                                {{ t('installation.steps.install.description', 'Add origam to your project with your preferred package manager.') }}
                            </p>

                            <origam-code
                                :code="currentInstallCmd"
                                lang="bash"
                                copyable
                                rounded="lg"
                                class="installation-step__code installation-step__code--tabbed"
                                data-cy="installation-code-install"
                            >
                                <template #header="{ copy, copied }">
                                    <origam-tabs
                                        v-model="activePackageManager"
                                        indicator="underline"
                                        color="primary"
                                        class="installation-step__pm-tabs"
                                        :aria-label="t('installation.steps.install.pm_label', 'Package manager')"
                                    >
                                        <origam-tab
                                            v-for="pm in packageManagers"
                                            :key="pm.value"
                                            :value="pm.value"
                                        >
                                            {{ pm.label }}
                                        </origam-tab>
                                    </origam-tabs>

                                    <origam-btn
                                        variant="text"
                                        size="small"
                                        prepend-icon="mdi-content-copy"
                                        class="installation-step__code-copy"
                                        data-cy="installation-code-install-copy"
                                        @click="copy"
                                    >
                                        {{ copied ? t('installation.steps.install.copied', 'Copied') : t('installation.steps.install.copy', 'Copy') }}
                                    </origam-btn>
                                </template>
                            </origam-code>
                        </div>
                    </origam-grid-item>

                    <origam-grid-item
                        tag="li"
                        class="installation-step"
                        data-cy="installation-step-register"
                    >
                        <div class="installation-step__meta">
                            <origam-avatar
                                icon="mdi-code-braces"
                                color="primary"
                                rounded="lg"
                                size="48"
                                class="installation-step__avatar"
                                aria-hidden="true"
                            />

                            <div class="installation-step__connector" aria-hidden="true" />
                        </div>

                        <div class="installation-step__content">
                            <origam-title
                                tag="h3"
                                class="installation-step__title"
                            >
                                {{ t('installation.steps.register.title', '2. Register the plugin') }}
                            </origam-title>

                            <p class="installation-step__desc">
                                {{ t('installation.steps.register.description', 'Import the token sheets and register origam as a Vue plugin in your entry file.') }}
                            </p>

                            <origam-code
                                :code="INSTALLATION_CODE_REGISTER.code"
                                :lang="INSTALLATION_CODE_REGISTER.lang"
                                :filename="INSTALLATION_CODE_REGISTER.filename"
                                copyable
                                :line-numbers="true"
                                rounded="lg"
                                class="installation-step__code"
                                data-cy="installation-code-register"
                            />

                            <p class="installation-step__note">
                                {{ t('installation.steps.register.note', 'createOrigam() accepts an optional options bag to configure icons, locale, display, SSR, aliases and more. By default, all components and directives are registered globally.') }}
                            </p>
                        </div>
                    </origam-grid-item>

                    <origam-grid-item
                        tag="li"
                        class="installation-step"
                        data-cy="installation-step-use"
                    >
                        <div class="installation-step__meta">
                            <origam-avatar
                                icon="mdi-play-circle-outline"
                                color="primary"
                                rounded="lg"
                                size="48"
                                class="installation-step__avatar"
                                aria-hidden="true"
                            />

                            <div class="installation-step__connector" aria-hidden="true" />
                        </div>

                        <div class="installation-step__content">
                            <origam-title
                                tag="h3"
                                class="installation-step__title"
                            >
                                {{ t('installation.steps.use.title', '3. Use a component') }}
                            </origam-title>

                            <p class="installation-step__desc">
                                {{ t('installation.steps.use.description', 'All components are globally registered. Drop any Origam component into your templates — no per-file import needed.') }}
                            </p>

                            <origam-code
                                :code="INSTALLATION_CODE_USE.code"
                                :lang="INSTALLATION_CODE_USE.lang"
                                :filename="INSTALLATION_CODE_USE.filename"
                                copyable
                                :line-numbers="true"
                                rounded="lg"
                                class="installation-step__code"
                                data-cy="installation-code-use"
                            />
                        </div>
                    </origam-grid-item>

                    <origam-grid-item
                        tag="li"
                        class="installation-step"
                        data-cy="installation-step-theming"
                    >
                        <div class="installation-step__meta">
                            <origam-avatar
                                icon="mdi-palette-outline"
                                color="primary"
                                rounded="lg"
                                size="48"
                                class="installation-step__avatar"
                                aria-hidden="true"
                            />

                            <div class="installation-step__connector" aria-hidden="true" />
                        </div>

                        <div class="installation-step__content">
                            <origam-title
                                tag="h3"
                                class="installation-step__title"
                            >
                                {{ t('installation.steps.theming.title', '4. Theming') }}
                            </origam-title>

                            <p class="installation-step__desc">
                                {{ t('installation.steps.theming.description', 'origam ships with light and dark themes. Switch statically via an HTML attribute, or at runtime with the useTheme composable.') }}
                            </p>

                            <p class="installation-step__sublabel">
                                {{ t('installation.steps.theming.sub_static', 'Static switch — HTML attribute (omit to follow system preference):') }}
                            </p>

                            <origam-code
                                :code="INSTALLATION_CODE_THEME_HTML.code"
                                :lang="INSTALLATION_CODE_THEME_HTML.lang"
                                :filename="INSTALLATION_CODE_THEME_HTML.filename"
                                copyable
                                rounded="lg"
                                class="installation-step__code"
                                data-cy="installation-code-theme-html"
                            />

                            <p class="installation-step__sublabel">
                                {{ t('installation.steps.theming.sub_runtime', 'Runtime switch — useTheme composable:') }}
                            </p>

                            <origam-code
                                :code="INSTALLATION_CODE_THEME_RUNTIME.code"
                                :lang="INSTALLATION_CODE_THEME_RUNTIME.lang"
                                copyable
                                :line-numbers="true"
                                rounded="lg"
                                class="installation-step__code"
                                data-cy="installation-code-theme-runtime"
                            />

                            <p class="installation-step__sublabel">
                                {{ t('installation.steps.theming.sub_scoped', 'Scoped sub-tree override:') }}
                            </p>

                            <origam-code
                                :code="INSTALLATION_CODE_THEME_SCOPED.code"
                                :lang="INSTALLATION_CODE_THEME_SCOPED.lang"
                                copyable
                                :line-numbers="true"
                                rounded="lg"
                                class="installation-step__code"
                                data-cy="installation-code-theme-scoped"
                            />

                            <p class="installation-step__note">
                                {{ t('installation.steps.theming.note', 'Import origam/tokens/css/dark once at boot to enable the dark token sheet.') }}
                            </p>
                        </div>
                    </origam-grid-item>

                    <origam-grid-item
                        tag="li"
                        class="installation-step installation-step--last"
                        data-cy="installation-step-nuxt"
                    >
                        <div class="installation-step__meta">
                            <origam-avatar
                                icon="mdi-nuxt"
                                color="primary"
                                rounded="lg"
                                size="48"
                                class="installation-step__avatar"
                                aria-hidden="true"
                            />
                        </div>

                        <div class="installation-step__content">
                            <origam-title
                                tag="h3"
                                class="installation-step__title"
                            >
                                {{ t('installation.steps.nuxt.title', '5. Nuxt integration') }}
                            </origam-title>

                            <p class="installation-step__desc">
                                {{ t('installation.steps.nuxt.description', 'Using Nuxt 3 or Nuxt 4? The official origam Nuxt module is included in the same package — no extra install required.') }}
                            </p>

                            <origam-code
                                :code="INSTALLATION_CODE_NUXT.code"
                                :lang="INSTALLATION_CODE_NUXT.lang"
                                :filename="INSTALLATION_CODE_NUXT.filename"
                                copyable
                                :line-numbers="true"
                                rounded="lg"
                                class="installation-step__code"
                                data-cy="installation-code-nuxt"
                            />

                            <p class="installation-step__note">
                                {{ t('installation.steps.nuxt.note', 'The Nuxt module is delivered as a sub-export (origam/nuxt) — no separate package to install. It auto-imports all components and composables, and resolves themes SSR-safely.') }}
                            </p>
                        </div>
                    </origam-grid-item>
                </origam-grid>
            </origam-container>
        </section>

        <section
            class="installation-peer-deps"
            aria-labelledby="installation-peer-deps-title"
            data-cy="installation-peer-deps"
        >
            <origam-container>
                <header class="installation-peer-deps__header">
                    <p class="installation-section__eyebrow">
                        {{ t('installation.peer_deps.eyebrow', 'REQUIREMENTS') }}
                    </p>

                    <origam-title
                        id="installation-peer-deps-title"
                        tag="h2"
                        class="installation-section__title installation-section__title--single"
                    >
                        {{ t('installation.peer_deps.title', 'Peer dependencies.') }}
                    </origam-title>

                    <p class="installation-section__subtitle">
                        {{ t('installation.peer_deps.subtitle', 'origam has a minimal footprint. Vue 3 is the only mandatory peer — everything else is optional and tree-shaken when unused.') }}
                    </p>
                </header>

                <origam-table
                    class="installation-peer-deps__table"
                    border
                    rounded="lg"
                    :caption="t('installation.peer_deps.table_caption', 'Peer dependencies')"
                    data-cy="installation-peer-deps-table"
                >
                    <thead>
                        <tr>
                            <th
                                scope="col"
                                class="installation-peer-deps__th"
                            >
                                {{ t('installation.peer_deps.col_pkg', 'Package') }}
                            </th>
                            <th
                                scope="col"
                                class="installation-peer-deps__th"
                            >
                                {{ t('installation.peer_deps.col_required', 'Required') }}
                            </th>
                            <th
                                scope="col"
                                class="installation-peer-deps__th"
                            >
                                {{ t('installation.peer_deps.col_used_by', 'Used by') }}
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr
                            v-for="dep in peerDeps"
                            :key="dep.pkg"
                            class="installation-peer-deps__tr"
                            :data-cy="`peer-dep-${dep.pkg}`"
                        >
                            <td class="installation-peer-deps__td installation-peer-deps__td--pkg">
                                <origam-code
                                    :code="dep.pkg"
                                    lang="plaintext"
                                    compact
                                    class="installation-peer-deps__pkg-code"
                                />
                            </td>
                            <td class="installation-peer-deps__td installation-peer-deps__td--version">
                                <origam-code
                                    :code="dep.required"
                                    lang="plaintext"
                                    compact
                                    class="installation-peer-deps__version-code"
                                />
                            </td>
                            <td class="installation-peer-deps__td">
                                {{ t(dep.usedByKey, dep.usedByKey) }}
                            </td>
                        </tr>
                    </tbody>
                </origam-table>

                <p class="installation-peer-deps__note">
                    {{ t('installation.peer_deps.node_note', 'Node >= 22 is required to build origam from source. Consumers need only Vue 3.5+ at runtime.') }}
                </p>
            </origam-container>
        </section>

        <section
            class="installation-cta"
            aria-labelledby="installation-cta-title"
            data-cy="installation-cta"
        >
            <div class="installation-cta__inner">
                <origam-title
                    id="installation-cta-title"
                    tag="h2"
                    class="installation-cta__title"
                >
                    {{ t('installation.cta.title', 'Ready to build?') }}
                </origam-title>

                <p class="installation-cta__desc">
                    {{ t('installation.cta.description', 'Explore the full component catalogue, browse interactive stories, or dive into the source on GitHub.') }}
                </p>

                <nav
                    class="installation-cta__actions"
                    :aria-label="t('installation.cta.actions_label', 'Explore origam')"
                >
                    <origam-btn
                        class="installation-cta__btn installation-cta__btn--primary"
                        variant="text"
                        prepend-icon="mdi-view-grid-outline"
                        href="/components"
                        data-cy="installation-cta-components"
                    >
                        {{ t('installation.cta.cta_components', 'Browse components') }}
                    </origam-btn>

                    <origam-btn
                        class="installation-cta__btn installation-cta__btn--secondary"
                        variant="text"
                        prepend-icon="mdi-github"
                        :href="githubHref"
                        target="_blank"
                        rel="noopener noreferrer"
                        data-cy="installation-cta-github"
                    >
                        {{ t('installation.cta.cta_github', 'View on GitHub') }}
                    </origam-btn>
                </nav>
            </div>
        </section>
    </article>
</template>

<style scoped lang="scss">
.installation {
    display: flex;
    flex-direction: column;
}

.installation-section {
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

        &--single {
            display: block;
        }
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

.installation-hero {
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
}

.installation-steps {
    padding-block: var(--origam-space---24, 6rem);

    &__header {
        margin-block-end: var(--origam-space---12, 3rem);
    }

    &__list {
        list-style: none;
        padding: 0;
        margin: 0;
        display: flex;
        flex-direction: column;
        gap: 0;
    }
}

.installation-step {
    display: grid;
    grid-template-columns: 4rem 1fr;
    gap: 0 var(--origam-space---6, 1.5rem);
    list-style: none;

    &--last {
        .installation-step__connector {
            display: none;
        }

        .installation-step__content {
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

    &__sublabel {
        margin: var(--origam-space---5, 1.25rem) 0 var(--origam-space---2, 0.5rem);
        font-size: var(--origam-font-size---sm, 0.875rem);
        font-weight: var(--origam-font__weight---semibold, 600);
        color: var(--origam-color__text---primary, #0a0a0a);
    }

    &__code {
        max-inline-size: 52rem;
        margin-block-end: var(--origam-space---3, 0.75rem);
    }

    &__pm-tabs {
        align-self: stretch;
        --origam-tabs---border-width: 0;
    }

    &__code-copy {
        flex-shrink: 0;
        align-self: center;
    }

    &__note {
        margin: var(--origam-space---3, 0.75rem) 0 0;
        padding: var(--origam-space---3, 0.75rem) var(--origam-space---4, 1rem);
        border-inline-start: 3px solid var(--origam-color__action--primary---bg, #7c3aed);
        background: var(--origam-color__surface---sunken, #f5f5f5);
        border-radius: 0 var(--origam-radius---sm, 4px) var(--origam-radius---sm, 4px) 0;
        font-size: var(--origam-font-size---sm, 0.875rem);
        line-height: 1.65;
        color: var(--origam-color__text---secondary, #525252);
        max-inline-size: 52rem;
    }
}

:deep([data-cy="installation-code-install"] .origam-code__header) {
    --origam-code__header---padding-block: 0px;
    padding-block: 0;
    padding-inline: var(--origam-space---3, 0.75rem);
    align-items: stretch;
    gap: var(--origam-space---4, 1rem);
}

.installation-peer-deps {
    padding-block: var(--origam-space---24, 6rem);
    background: var(--origam-color__surface---sunken, #f5f5f5);
    border-block: 1px solid var(--origam-color__border---default, rgba(0, 0, 0, 0.08));

    &__header {
        margin-block-end: var(--origam-space---10, 2.5rem);
    }

    &__table {
        inline-size: 100%;
        max-inline-size: 48rem;
    }

    &__th {
        text-align: left;
        font-size: var(--origam-font-size---sm, 0.875rem);
        font-weight: var(--origam-font__weight---semibold, 600);
        color: var(--origam-color__text---primary, #0a0a0a);
        padding-block: var(--origam-space---3, 0.75rem);
        padding-inline: var(--origam-space---4, 1rem);
    }

    &__td {
        padding-block: var(--origam-space---3, 0.75rem);
        padding-inline: var(--origam-space---4, 1rem);
        font-size: var(--origam-font-size---sm, 0.875rem);
        line-height: 1.6;
        color: var(--origam-color__text---secondary, #525252);
        vertical-align: middle;

        &--pkg,
        &--version {
            white-space: nowrap;
            vertical-align: middle;
        }
    }

    &__pkg-code,
    &__version-code {
        display: inline-flex;
    }

    &__note {
        margin-block-start: var(--origam-space---5, 1.25rem);
        font-size: var(--origam-font-size---sm, 0.875rem);
        color: var(--origam-color__text---tertiary, #737373);
        font-style: italic;
        max-inline-size: 48rem;
    }
}

.installation-cta {
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
    .installation-hero {
        &__title {
            font-size: clamp(2.5rem, 9vw, 5.25rem);
        }
    }
}

@media (max-width: 768px) {
    .installation-section {
        &__title {
            font-size: clamp(1.75rem, 7vw, 3rem);
        }
    }

    .installation-cta {
        &__title {
            font-size: clamp(2rem, 8vw, 4rem) !important;
        }
    }

    .installation-step {
        grid-template-columns: 3rem 1fr;
        gap: 0 var(--origam-space---4, 1rem);
    }
}

@media (max-width: 640px) {
    .installation-step {
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
