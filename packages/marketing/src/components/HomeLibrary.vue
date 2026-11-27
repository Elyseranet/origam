<template>
  <section
    id="library"
    class="home-library"
    aria-labelledby="library-heading"
  >
    <div class="home-container">
      <header class="home-library__intro">
        <div>
          <p class="home-eyebrow">
            {{ t('home.library.eyebrow', 'A complete catalogue') }}
          </p>

          <enso-section-title id="library-heading">
            {{ t('home.library.title', 'From form to chart.') }}
          </enso-section-title>
        </div>

        <p class="home-library__text">
          {{ t('home.library.text', '97 component families in one package, charts included: no separate library to wire in.') }}
        </p>
      </header>

      <origam-grid
        tag="ul"
        class="home-library__grid"
      >
        <origam-grid-item
          v-for="category in categories"
          :key="category.key"
          tag="li"
        >
          <origam-card
            :to="categoryLink(category)"
            rounded="lg"
            border
            border-color="var(--origam-color__border---subtle)"
            bg-color="var(--origam-color__surface---raised)"
            elevation="none"
            class="home-library__card"
            :data-cy="`library-card-${category.key}`"
          >
            <span class="home-library__tile">
              <origam-icon
                :icon="category.icon"
                :size="26"
                color="primary"
                aria-hidden="true"
              />
              <span class="home-library__label">{{ t(category.labelKey, category.labelFallback) }}</span>
              <span
                v-if="category.hintKey"
                class="home-library__hint"
              >{{ t(category.hintKey, category.hintFallback, category.hintParams) }}</span>
            </span>
          </origam-card>
        </origam-grid-item>
      </origam-grid>
    </div>
  </section>
</template>

<script setup lang="ts">
import { useT } from '~/composables/useT'
import { HOME_LIBRARY_CATEGORIES } from '~/consts/home-library.const'
import type { IHomeLibraryCategory } from '~/interfaces/home-library.interface'
import { categoryAnchor } from '~/utils/components-catalog.util'

const { t } = useT()

const categories = HOME_LIBRARY_CATEGORIES

/** Each card opens the catalogue scrolled to the REAL category group it stands for. */
const categoryLink = (category: IHomeLibraryCategory) => ({ path: '/components', hash: `#${categoryAnchor(category.catalogCategory)}` })

defineEmits([])

defineSlots<Record<string, never>>()

defineExpose({})
</script>

<style scoped lang="scss">
.home-library {
    padding-block: 130px 150px;
    background-color: var(--origam-color__surface---default);

    &__intro {
        display: grid;
        grid-template-columns: repeat(2, minmax(0, 1fr));
        gap: var(--origam-space---8, 2rem);
        align-items: end;
        margin-block-end: calc(var(--origam-space---8, 2rem) + var(--origam-space---1, 0.25rem));
    }

    &__text {
        margin: 0;
        font-size: var(--home-fs-body);
        color: var(--origam-color__text---secondary);
        line-height: 1.6;
    }

    // Maquette v12 : 7 cartes par rangée, la dernière rangée s'aligne à gauche. --cols = cartes par rangée.
    &__grid {
        --home-library-cols: 7;
        --home-library-gap: var(--origam-space---3, 0.75rem);

        display: flex;
        flex-wrap: wrap;
        justify-content: flex-start;
        gap: var(--home-library-gap);
        margin: 0;
        padding: 0;
        list-style: none;
    }

    &__grid > li {
        flex: 0 0 calc((100% - (var(--home-library-cols) - 1) * var(--home-library-gap)) / var(--home-library-cols));
        min-inline-size: 0;
    }

    &__card {
        block-size: 100%;
        transition-property: transform;
        transition-duration: var(--origam-motion__duration---fast);
        transition-timing-function: var(--origam-motion__easing---standard);

        &:hover,
        &:focus-visible {
            transform: translateY(-2px);
        }
    }

    &__tile {
        display: flex;
        flex-direction: column;
        align-items: center;
        // Maquette v12 : tuile 18 px / 10 px, icône 26 px, 10 px sous l'icône.
        gap: 0.625rem;
        padding: 1.125rem 0.625rem;
        text-align: center;
    }

    &__label {
        font-size: var(--origam-font__size---md, 0.875rem);
        font-weight: var(--origam-font__weight---semibold, 600);
        color: var(--origam-color__text---primary);
    }

    &__hint {
        font-size: var(--origam-font__size---sm, 0.75rem);
        color: var(--origam-color__text---secondary);
    }
}

@media (max-width: 1024px) {
    .home-library__intro {
        grid-template-columns: 1fr;
    }

    .home-library__grid {
        --home-library-cols: 4;
    }
}

@media (max-width: 480px) {
    .home-library__grid {
        --home-library-cols: 2;
    }
}

@media (prefers-reduced-motion: reduce) {
    .home-library__card {
        transition: none;
    }

    .home-library__card:hover,
    .home-library__card:focus-visible {
        transform: none;
    }
}
</style>
