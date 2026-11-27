<template>
  <article
    class="installation"
    data-cy="page-installation"
  >
    <enso-page-header
      family="editorial"
      title-id="installation-title"
    >
      <template #breadcrumb>
        <origam-breadcrumb
          :items="breadcrumbItems"
          divider="/"
          :border="0"
          data-cy="installation-breadcrumb"
        />
      </template>

      <template #eyebrow>
        <span data-cy="installation-hero-badge">{{ t('installation.hero.badge', 'npm install origam') }}</span>
      </template>

      <template #title>
        {{ t('installation.hero.title_line1', 'Up and running') }}
        {{ t('installation.hero.title_line2', 'in minutes.') }}
      </template>

      <template #intro>
        {{ t('installation.hero.subtitle', 'Install origam, register the plugin and build with 97 Vue 3 component families.') }}
      </template>
    </enso-page-header>

    <section
      class="installation-steps"
      aria-labelledby="installation-steps-title"
      data-cy="installation-steps"
    >
      <origam-container class="home-container">
        <header class="installation-section">
          <p class="home-eyebrow">
            {{ t('installation.steps.eyebrow', 'STEP BY STEP') }}
          </p>

          <origam-title
            id="installation-steps-title"
            tag="h2"
            class="installation-section__title"
          >
            {{ t('installation.steps.title_line1', 'Three steps,') }}
            {{ t('installation.steps.title_line2', 'then two if you need them.') }}
          </origam-title>

          <p class="installation-section__subtitle">
            {{ t('installation.steps.subtitle', 'From package to first rendered component.') }}
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
                text="1"
                bg-color="var(--origam-color__surface---overlay)"
                color="var(--origam-color__text---primary)"
                rounded="full"
                :size="44"
                border
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
                    variant="underline"
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
                text="2"
                bg-color="var(--origam-color__surface---overlay)"
                color="var(--origam-color__text---primary)"
                rounded="full"
                :size="44"
                border
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
                {{ t('installation.steps.register.note', 'createOrigam() accepts an optional options bag to configure icons, locale, display, SSR, aliases and more. By default, all components and directives are registered globally — but no theme is installed until you pass one explicitly, as shown above.') }}
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
                text="3"
                bg-color="var(--origam-color__surface---overlay)"
                color="var(--origam-color__text---primary)"
                rounded="full"
                :size="44"
                border
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
                text="4"
                bg-color="var(--origam-color__surface---overlay)"
                color="var(--origam-color__text---primary)"
                rounded="full"
                :size="44"
                border
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
                text="5"
                bg-color="var(--origam-color__surface---overlay)"
                color="var(--origam-color__text---primary)"
                rounded="full"
                :size="44"
                border
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
      <origam-container class="home-container">
        <header class="installation-section">
          <p class="home-eyebrow">
            {{ t('installation.peer_deps.eyebrow', 'REQUIREMENTS') }}
          </p>

          <origam-title
            id="installation-peer-deps-title"
            tag="h2"
            class="installation-section__title"
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

    <home-cta
      surface="overlay"
      title-id="installation-cta-title"
      :title="t('installation.cta.title', 'Ready to build?')"
      :description="t('installation.cta.description', 'Explore the full component catalogue, browse interactive stories, or dive into the source on GitHub.')"
      :actions-label="t('installation.cta.actions_label', 'Explore origam')"
      :actions="INSTALLATION_CTA_ACTIONS"
      data-cy="installation-cta"
    />
  </article>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { useLocaleHref } from '~/composables/useLocaleHref'
import { useT } from '~/composables/useT'
import {
    INSTALLATION_PEER_DEPS,
    INSTALLATION_PACKAGE_MANAGERS,
    INSTALLATION_CODE_REGISTER,
    INSTALLATION_CODE_USE,
    INSTALLATION_CODE_THEME_HTML,
    INSTALLATION_CODE_THEME_RUNTIME,
    INSTALLATION_CODE_THEME_SCOPED,
    INSTALLATION_CODE_NUXT
} from '~/consts/installation.const'
import { INSTALLATION_CTA_ACTIONS } from '~/consts/editorial-cta.const'

const { t } = useT()
const { localeHref } = useLocaleHref()

const breadcrumbItems = computed(() => [
    { title: t('nav.home', 'Home'), to: localeHref('/') },
    { title: t('nav.sections.getting_started', 'Getting started') },
    { title: t('nav.installation', 'Installation') }
])

useSeoMeta({
    title: () => t('installation.meta.title', 'Installation · origam design system'),
    description: () => t('installation.meta.description', 'Install origam with npm i origam, register the plugin and render your first component. 97 Vue 3 families, Nuxt module included.'),
    ogTitle: () => t('installation.meta.title', 'Installation · origam design system'),
    ogDescription: () => t('installation.meta.description', 'Install origam with npm i origam, register the plugin and render your first component. 97 Vue 3 families, Nuxt module included.')
})

const peerDeps = computed(() => INSTALLATION_PEER_DEPS)
const packageManagers = computed(() => INSTALLATION_PACKAGE_MANAGERS)
const activePackageManager = ref<string>(INSTALLATION_PACKAGE_MANAGERS[0].value)
const currentInstallCmd = computed(() =>
    INSTALLATION_PACKAGE_MANAGERS.find(pm => pm.value === activePackageManager.value)?.code
        ?? INSTALLATION_PACKAGE_MANAGERS[0].code
)
</script>

<style scoped lang="scss">
@use '../assets/scss/editorial';

.installation {
    @include editorial.editorial-page;
}

.installation-section {
    @include editorial.editorial-header;
}

.installation-steps {
    @include editorial.editorial-section(default, 40px, 120px, $wash: false);

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
        font-size: var(--origam-font__size---lg, 1rem);
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
    @include editorial.editorial-section(overlay, 30px, 120px);

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
        color: var(--origam-color__text---secondary, #525252);
        font-style: italic;
        max-inline-size: 48rem;
    }
}

@media (max-width: 768px) {
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
