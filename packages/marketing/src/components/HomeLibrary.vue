<template>
  <section
    id="library"
    class="home-library"
    aria-labelledby="library-heading"
  >
    <header class="home-library__intro">
      <div>
        <p class="home-library__eyebrow">
          {{ t('home.library.eyebrow', 'A complete library') }}
        </p>

        <origam-title
          id="library-heading"
          tag="h2"
          class="home-library__title"
        >
          {{ t('home.library.title', 'Components for every need') }}
        </origam-title>
      </div>

      <p class="home-library__text">
        {{ t('home.library.text', 'From the essentials to advanced components, Origam gives you a solid base for building modern, consistent interfaces.') }}
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
          class="home-library__card"
          :data-cy="`library-card-${category.key}`"
        >
          <span class="home-library__tile">
            <origam-icon
              :icon="category.icon"
              size="x-large"
              color="primary"
              aria-hidden="true"
            />
            <span class="home-library__label">{{ t(category.labelKey, category.labelFallback) }}</span>
            <span
              v-if="category.hintKey"
              class="home-library__hint"
            >{{ t(category.hintKey, category.hintFallback) }}</span>
          </span>
        </origam-card>
      </origam-grid-item>
    </origam-grid>
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
    padding-block: var(--origam-space---12, 3rem);
    padding-inline: var(--origam-space---6, 1.5rem);
    max-width: 80rem;
    margin-inline: auto;
    width: 100%;
    box-sizing: border-box;

    &__intro {
        display: grid;
        grid-template-columns: repeat(2, minmax(0, 1fr));
        gap: var(--origam-space---6, 1.5rem);
        align-items: center;
        margin-block-end: var(--origam-space---8, 2rem);
    }

    &__eyebrow {
        margin: 0 0 var(--origam-space---2, 0.5rem);
        font-size: var(--origam-font__size---md, 0.875rem);
        font-weight: var(--origam-font__weight---semibold, 600);
        color: var(--origam-color__text---primary);
    }

    &__title {
        margin: 0;
        font-size: var(--origam-font-size---section, 3rem);
        font-weight: var(--origam-font__weight---bold, 700);
        line-height: 1.1;
        letter-spacing: var(--origam-letter-spacing---tight, -0.03em);
        color: var(--origam-color__text---primary);
    }

    &__text {
        margin: 0;
        color: var(--origam-color__text---secondary);
        line-height: 1.6;
    }

    // 7 cards: a flex-wrap row centres the orphan row at every width, which a
    // fixed-column grid cannot (it left-aligns it). --cols = cards per row.
    &__grid {
        --home-library-cols: 7;
        --home-library-gap: var(--origam-space---4, 1rem);

        display: flex;
        flex-wrap: wrap;
        justify-content: center;
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
        --origam-icon---font-size-xl: var(--origam-font__size---4xl);

        display: flex;
        flex-direction: column;
        align-items: center;
        gap: var(--origam-space---3, 0.75rem);
        padding: var(--origam-space---5, 1.25rem) var(--origam-space---2, 0.5rem);
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
    .home-library__grid {
        --home-library-cols: 4;
    }
}

@media (max-width: 768px) {
    .home-library__intro {
        grid-template-columns: 1fr;
    }

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
