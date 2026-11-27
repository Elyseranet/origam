<template>
  <section
    class="home-themes"
    :style="washStyle"
    aria-labelledby="themes-title"
  >
    <div class="home-container">
      <origam-grid
        tag="div"
        columns="var(--home-themes---cols)"
        gap="var(--origam-space---12)"
        align-items="center"
        class="home-themes__grid"
      >
        <origam-grid-item
          tag="div"
          class="home-themes__text-col"
        >
          <p class="home-themes__eyebrow home-eyebrow">
            {{ t('home.themes.eyebrow', 'THEMING') }}
          </p>

          <enso-section-title id="themes-title">
            <span class="home-themes__title-line">{{ t('home.themes.title_line1', 'One theme object.') }}</span>
            <span class="home-themes__title-line">{{ t('home.themes.title_line2', 'One identity per brand.') }}</span>
          </enso-section-title>

          <p class="home-themes__subtitle">
            {{ t('home.themes.subtitle', 'Eight identities, written with the public theme object, as yours will be. Light or dark, they switch at runtime.') }}
          </p>

          <p
            class="home-themes__note"
            data-cy="themes-note"
          >
            {{ t('home.themes.note', 'The npm package ships the base origam theme. The others are examples, to open in the Theme Builder.') }}
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
            :aria-label="t('home.themes.actions_label', 'Open the Theme Builder')"
          >
            <origam-btn
              class="home-themes__btn"
              variant="text"
              size="x-large"
              font-weight="semibold"
              append-icon="mdi-arrow-right"
              :href="HOME_THEMES_BUILDER_HREF"
              data-cy="themes-cta-builder"
            >
              {{ t('home.themes.cta_builder', 'Open the Theme Builder') }}
            </origam-btn>
          </nav>
        </origam-grid-item>

        <origam-grid-item
          tag="div"
          class="home-themes__previews-col"
        >
          <origam-grid
            tag="ul"
            columns="var(--home-themes---tiles)"
            gap="0.875rem"
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
                  :elevation="tile.elevation"
                  border
                  border-color="var(--origam-color__border---subtle)"
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
                        :aria-label="t('home.themes.preview_open_aria', 'Customize the {theme} theme in the Theme Builder', { theme: t(tile.labelKey, tile.labelFallback) })"
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
    </div>
  </section>
</template>

<script setup lang="ts">
import { useT } from '~/composables/useT'
import { ENSO_MASK_BRUSH_VIOLET_04, ENSO_MASK_BRUSH_VIOLET_07 } from '~/consts/enso.const'
import {
    THEMES_TOOLING_TEXT,
    THEME_PREVIEW_TILES,
    HOME_THEMES_BUILDER_HREF
} from '~/consts/themes-showcase.const'
import { ensoMaskUrl } from '~/utils/enso.util'

const { t } = useT()

/*********************************************************
 * Double lavis (T3)
 *
 * @description
 * Deux passes de pinceau au-dessus de la section ; masques servis depuis la
 * même origine, seul leur alpha compte.
 ********************************************************/
const washStyle = {
    '--home-mask-wash-first': ensoMaskUrl(ENSO_MASK_BRUSH_VIOLET_04),
    '--home-mask-wash-second': ensoMaskUrl(ENSO_MASK_BRUSH_VIOLET_07)
}
</script>

<style scoped lang="scss">
.home-themes {
    // Clair : sunken ; sombre : overlay (le sunken sombre est trop proche de l'encre).
    --home-themes---bg: var(--origam-color__surface---sunken);
    --home-themes---cols: minmax(0, 1fr) minmax(0, 1.1fr);
    --home-themes---tiles: repeat(2, minmax(0, 1fr));

    position: relative;
    isolation: isolate;
    overflow-x: clip;
    padding-block: 90px 40px;
    background-color: var(--home-themes---bg);

    // T3 (bibliotheque -> thematisation) : deux passes de pinceau, la premiere translucide, la seconde pleine.
    &::before,
    &::after {
        content: '';
        position: absolute;
        z-index: -1;
        inset-inline: -6%;
        pointer-events: none;
        background-color: var(--home-themes---bg);
    }

    &::before {
        inset-block-start: -96px;
        block-size: 130px;
        opacity: 0.5;
        transform: scaleX(-1);
        mask: var(--home-mask-wash-first) 0 0 / 100% 100% no-repeat, linear-gradient(#000 0 0) 0 100% / 100% 40% no-repeat;
    }

    &::after {
        inset-block-start: -56px;
        block-size: 112px;
        mask: var(--home-mask-wash-second) 0 0 / 100% 100% no-repeat, linear-gradient(#000 0 0) 0 100% / 100% 50% no-repeat;
    }

    &__text-col {
        display: flex;
        flex-direction: column;
        align-items: flex-start;
        gap: var(--origam-space---3, 0.75rem);
    }

    &__eyebrow {
        margin: 0;
    }

    &__title-line {
        display: block;
    }

    &__subtitle {
        margin: 0;
        max-inline-size: 34rem;
        font-size: var(--home-fs-body);
        line-height: 1.6;
        color: var(--origam-color__text---secondary, #525252);
    }

    &__note {
        margin: 0;
        max-inline-size: 34rem;
        font-size: var(--home-fs-small);
        line-height: 1.6;
        color: var(--origam-color__text---secondary);
    }

    &__tooling {
        margin: 0;
        display: flex;
        flex-wrap: wrap;
        align-items: center;
        gap: var(--origam-space---2, 0.5rem);
        font-size: 0.84375rem;
        line-height: 1.9;
        font-family: var(--origam-font__family---mono, 'JetBrains Mono', monospace);
        color: var(--origam-color__text---secondary);
    }

    &__tooling-sep {
        color: inherit;
        user-select: none;
    }

    &__actions {
        margin-block-start: var(--origam-space---2, 0.5rem);
    }

    // Lien de la maquette v12 : 15 px, 600, 0,02em. Aucun cran de `fontSize` ne vaut 15 px : variables du bouton.
    &__btn {
        --origam-btn---font-size: 0.9375rem;
        --origam-btn---letter-spacing: 0.02em;

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

    // Tuile de la maquette v12 : 16 px de padding, 104 px mini, libellé mono 14 px, deux barres de 6 px.
    &__preview-tile {
        min-block-size: 6.5rem;
        padding: var(--origam-space---4, 1rem);
        overflow: hidden;
        background-color: var(--origam-color__surface---raised);
        color: var(--origam-color__text---primary);
    }

    &__preview-figure {
        display: flex;
        flex-direction: column;
        gap: var(--origam-space---3, 0.75rem);
        margin: 0;
    }

    &__preview-label {
        font-size: var(--origam-font__size---md, 0.875rem);
        font-weight: var(--origam-font__weight---semibold, 600);
        color: inherit;
        font-family: var(--origam-font__family---mono, 'JetBrains Mono', monospace);
    }

    &__skeleton {
        display: flex;
        flex-direction: column;
        gap: var(--origam-space---2, 0.5rem);
    }

    &__skeleton-bar {
        display: block;
        height: 6px;
        border-radius: 3px;
        background-color: currentColor;
        opacity: 0.18;

        &--long {
            width: 100%;
        }

        &--short {
            width: 60%;
        }
    }

    &__preview-footer {
        display: flex;
        align-items: center;
    }
}

@media (max-width: 1024px) {
    .home-themes {
        --home-themes---cols: minmax(0, 1fr);
    }
}

@media (max-width: 480px) {
    .home-themes {
        --home-themes---tiles: minmax(0, 1fr);
    }
}

@media (max-width: 768px) {
    .home-themes::before {
        inset-block-start: -60px;
        block-size: 80px;
    }

    .home-themes::after {
        inset-block-start: -36px;
        block-size: 72px;
    }
}
</style>

<style>
[data-mode='dark'] .home-themes {
  --home-themes---bg: var(--origam-color__surface---overlay);
}

@media (prefers-color-scheme: dark) {
  :root:not([data-mode]) .home-themes {
    --home-themes---bg: var(--origam-color__surface---overlay);
  }
}
</style>
