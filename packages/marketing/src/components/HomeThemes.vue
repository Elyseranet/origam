<template>
  <section
    class="home-themes home-container home-section"
    aria-labelledby="themes-title"
  >
    <origam-grid
      tag="div"
      columns="repeat(auto-fit, minmax(320px, 1fr))"
      gap="xl"
      align-items="center"
      class="home-themes__grid"
    >
      <origam-grid-item
        tag="div"
        class="home-themes__text-col"
      >
        <p class="home-themes__eyebrow">
          {{ t('home.themes.eyebrow', 'THEMING') }}
        </p>

        <origam-title
          id="themes-title"
          tag="h2"
          class="home-themes__title"
        >
          <span class="home-themes__title-line">{{ t('home.themes.title_line1', 'One design system.') }}</span>
          <span class="home-themes__title-line">{{ t('home.themes.title_line2', 'Every brand.') }}</span>
        </origam-title>

        <p class="home-themes__subtitle">
          {{ t('home.themes.subtitle', 'Hand-maintained, props-first design tokens — multi-theme out of the box. Switch between light, dark or your custom brand at runtime, with zero remount.') }}
        </p>

        <p
          class="home-themes__tooling"
          :aria-label="t('a11y.themes_tooling', 'Tooling compatibility')"
        >
                    <span
                      v-for="(pill, index) in THEMES_TOOLING_TEXT"
                      :key="pill.key"
                      class="home-themes__tooling-item"
                    >
                        <span v-if="index > 0" aria-hidden="true" class="home-themes__tooling-sep">·</span>
                        {{ t(pill.labelKey, pill.labelFallback) }}
                    </span>
        </p>

        <nav
          class="home-themes__actions"
          :aria-label="t('home.themes.actions_label', 'Try the theme builder')"
        >
          <origam-btn
            class="home-themes__btn"
            variant="text"
            append-icon="mdi-arrow-right"
            :href="HOME_THEMES_BUILDER_HREF"
            data-cy="themes-cta-builder"
          >
            {{ t('home.themes.cta_builder', 'Try the theme builder') }}
          </origam-btn>
        </nav>
      </origam-grid-item>

      <origam-grid-item
        tag="div"
        class="home-themes__previews-col"
      >
        <origam-grid
          tag="ul"
          :columns="2"
          gap="sm"
          :aria-label="t('a11y.themes_preview_tiles', 'Theme preview tiles')"
          class="home-themes__previews"
        >
          <origam-grid-item
            v-for="tile in THEME_PREVIEW_TILES"
            :key="tile.key"
            tag="li"
            class="home-themes__preview-item"
            :data-cy="`themes-preview-${tile.key}`"
          >
            <origam-theme-provider
              :theme="tile.theme"
              :mode="tile.mode"
            >
              <origam-sheet
                :data-cy="`themes-tile-surface-${tile.key}`"
                rounded="lg"
                tag="article"
                elevation="md"
                border
                border-color="var(--origam-color__border---ghost)"
                class="home-themes__preview-tile"
              >
                <figure class="home-themes__preview-figure">
                  <figcaption class="home-themes__preview-label">
                    {{ t(tile.labelKey, tile.labelFallback) }}
                  </figcaption>

                  <div
                    class="home-themes__skeleton"
                    aria-hidden="true"
                  >
                    <span class="home-themes__skeleton-bar home-themes__skeleton-bar--long" />
                    <span class="home-themes__skeleton-bar home-themes__skeleton-bar--short" />
                  </div>

                  <div class="home-themes__preview-footer">
                    <origam-btn
                      color="primary"
                      size="small"
                      append-icon="mdi-arrow-right"
                      :href="tile.href"
                      :aria-label="t('home.themes.preview_open_aria', 'Open the {theme} theme in the builder', { theme: t(tile.labelKey, tile.labelFallback) })"
                      class="home-themes__preview-btn"
                      data-cy="themes-tile-button"
                    >
                      {{ t('home.themes.preview_open', 'Customize') }}
                    </origam-btn>
                  </div>
                </figure>
              </origam-sheet>
            </origam-theme-provider>
          </origam-grid-item>
        </origam-grid>
      </origam-grid-item>
    </origam-grid>
  </section>
</template>

<script setup lang="ts">
import { useT } from '~/composables/useT'
import {
    THEMES_TOOLING_TEXT,
    THEME_PREVIEW_TILES,
    HOME_THEMES_BUILDER_HREF
} from '~/consts/themes-showcase.const'

const { t } = useT()
</script>

<style scoped lang="scss">
.home-themes {

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
        font-size: var(--origam-font__size---lg, 1rem);
        line-height: 1.6;
        color: var(--origam-color__text---secondary, #525252);
    }

    &__tooling {
        margin: 0;
        display: flex;
        flex-wrap: wrap;
        align-items: center;
        gap: var(--origam-space---2, 0.5rem);
        font-size: var(--origam-font-size---sm, 0.875rem);
        font-family: var(--origam-font__family---mono, 'JetBrains Mono', monospace);
        color: var(--origam-color__text---tertiary, #737373);
    }

    &__tooling-sep {
        color: var(--origam-color__text---tertiary, #737373);
        user-select: none;
    }

    &__actions {
        margin-block-start: var(--origam-space---2, 0.5rem);
    }

    &__btn {
        padding-inline: 0;
    }

    &__previews {
        list-style: none;
        margin: 0;
        padding: 0;
    }

    &__preview-item {
        list-style: none;
    }

    &__preview-tile {
        padding: var(--origam-space---4, 1rem);
        overflow: hidden;
        background-color: var(--origam-color__surface---default);
    }

    &__preview-figure {
        display: flex;
        flex-direction: column;
        gap: var(--origam-space---3, 0.75rem);
        margin: 0;
    }

    &__preview-label {
        font-size: var(--origam-font-size---xs, 0.75rem);
        font-weight: var(--origam-font__weight---semibold, 600);
        letter-spacing: 0.04em;
        color: var(--origam-color__text---secondary, #525252);
        font-family: var(--origam-font__family---mono, 'JetBrains Mono', monospace);
    }

    &__skeleton {
        display: flex;
        flex-direction: column;
        gap: var(--origam-space---2, 0.5rem);
    }

    &__skeleton-bar {
        display: block;
        height: 10px;
        border-radius: var(--origam-radius---sm, 4px);
        background-color: var(--origam-color__neutral---300, #d4d4d4);

        &--long {
            width: 100%;
        }

        &--short {
            width: 72%;
            background-color: var(--origam-color__neutral---200, #e5e5e5);
        }
    }

    &__preview-footer {
        display: flex;
        align-items: center;
    }
}

@media (max-width: 40rem) {
    .home-themes {
        padding-inline: var(--origam-space---6, 1.5rem);

        &__title {
            font-size: clamp(1.75rem, 8vw, 3rem);
        }
    }
}
</style>
