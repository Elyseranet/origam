<template>
  <section
    class="home-features"
    aria-labelledby="features-title"
  >
    <header class="home-features__header">
      <p class="home-features__eyebrow">
        {{ t('home.features.eyebrow', "WHAT'S INSIDE") }}
      </p>

      <origam-title
        id="features-title"
        tag="h2"
        class="home-features__title"
      >
        <span class="home-features__title-line">{{ t('home.features.title_line1', `Everything you'd expect.`) }}</span>
        <span class="home-features__title-line home-features__title-line--muted">{{ t('home.features.title_line2', `Nothing you wouldn't.`) }}</span>
      </origam-title>

      <p class="home-features__subtitle">
        {{ t('home.features.subtitle', 'A complete toolkit for shipping Vue 3 apps — from atomic primitives to complex data viz, every piece tested, themed and a11y-compliant.') }}
      </p>
    </header>

    <origam-grid
      tag="ul"
      :columns="FEATURES_GRID_COLUMNS"
      gap="0"
      class="home-features__grid"
    >
      <origam-grid-item
        v-for="feature in features"
        :key="feature.titleKey"
        tag="li"
        class="home-features__item"
      >
        <origam-card
          tag="article"
          flat
          rounded="none"
          :elevation="undefined"
          :border="false"
          :style="FEATURE_CARD_VARS"
          class="home-features__card"
        >
          <origam-avatar
            :icon="feature.icon"
            color="primary"
            :style="FEATURE_ICON_TILE_VARS"
            :size="44"
            class="home-features__icon-tile"
            aria-hidden="true"
          />

          <origam-title
            tag="h3"
            class="home-features__card-title"
          >
            {{ t(feature.titleKey, feature.titleKey) }}
          </origam-title>

          <p class="home-features__card-desc">
            {{ t(feature.descriptionKey, feature.descriptionKey) }}
          </p>
        </origam-card>
      </origam-grid-item>
    </origam-grid>
  </section>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useT } from '~/composables/useT'
import {
    FEATURES,
    FEATURES_GRID_COLUMNS,
    FEATURE_CARD_VARS,
    FEATURE_ICON_TILE_VARS
} from '~/consts/features.const'

const { t } = useT()

const features = computed(() => FEATURES)
</script>

<style scoped lang="scss">
.home-features {
    padding-block: var(--origam-space---24, 6rem);
    padding-inline: var(--origam-space---6, 1.5rem);
    max-width: 83rem;
    margin-inline: auto;

    &__header {
        margin-block-end: var(--origam-space---10, 2.5rem);
    }

    &__eyebrow {
        margin: 0 0 var(--origam-space---3, 0.75rem);
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

    &__title-line {
        &--muted {
            color: var(--origam-color__text---secondary, #525252);
        }
    }

    &__subtitle {
        margin: var(--origam-space---5, 1.25rem) 0 0;
        max-inline-size: 34rem;
        font-size: var(--origam-font-size---lg, 1.125rem);
        line-height: 1.6;
        color: var(--origam-color__text---secondary, #525252);
    }

    &__grid {
        list-style: none;
        margin: 0;
        padding: 0;
        border: 1px solid var(--origam-color__border---default, rgba(0, 0, 0, 0.08));
        border-radius: var(--origam-radius---lg, 14px);
        overflow: hidden;
    }

    &__item {
        list-style: none;
        display: flex;
        border-inline-end: 1px solid var(--origam-color__border---default, rgba(0, 0, 0, 0.08));
        border-block-end: 1px solid var(--origam-color__border---default, rgba(0, 0, 0, 0.08));
    }

    &__card {
        flex: 1;
        display: flex;
        flex-direction: column;
        gap: var(--origam-space---2, 0.5rem);

        // The wrapper (&__grid) already draws the frame border/radius and
        // each cell (&__item) already draws its own separator lines — that
        // is the ONLY chrome this layout wants. Themes that give origam-card
        // its own border/rounded/elevation by default (e.g. cartoon: border
        // + rounded-lg + elevation) would otherwise paint a second, almost
        // coincident rounded border a few pixels inside the wrapper's,
        // visible as a faint double line at every corner (issue #264, bug 2).
        // `rounded="none"` forces the radius off via useRounded (props-first).
        // `:elevation="undefined"` explicitly overrides whatever elevation
        // the active theme sets on origam-card, so `flat` (above) reliably
        // suppresses the shadow through its normal code path for every
        // theme — `useElevation` only lets `flat` win when `elevation` is
        // null, and cartoon's theme sets elevation:4 by default.
        // `border="false"` alone resolves to "component default wins" (same
        // documented semantics as `rounded={false}`), not "off" — this rule
        // is the one thing still needed to fully suppress the border.
        &.origam-card {
            border: none;
        }
    }

    &__icon-tile {
        --origam-avatar---background-color: var(--origam-color__action--primary---bgSubtle, rgba(124, 58, 237, 0.1));
        --origam-avatar---border-width: thin;
        --origam-avatar---border-style: solid;
        --origam-avatar---border-color: var(--origam-color__action--primary---bg, #7c3aed);
        --origam-avatar---icon-color: var(--origam-color__action--primary---fgSubtle, #6d28d9);
        display: inline-flex;
        flex: 0 0 auto;
        inline-size: 2.75rem;
        block-size: 2.75rem;
        border-radius: var(--origam-radius---card, 10px) !important;
        margin-block-end: var(--origam-space---3, 0.75rem);
    }

    &__card-title {
        margin: 0;
        font-size: 1.0625rem;
        font-weight: var(--origam-font__weight---semibold, 600);
        color: var(--origam-color__text---primary, #0a0a0a);
    }

    &__card-desc {
        margin: 0;
        font-size: var(--origam-font-size---sm, 0.875rem);
        line-height: 1.6;
        color: var(--origam-color__text---secondary, #525252);
    }
}

@media (max-width: 640px) {
    .home-features {
        padding-inline: var(--origam-space---6, 1.5rem);

        &__title {
            font-size: clamp(1.75rem, 8vw, 3rem);
        }
    }
}
</style>
