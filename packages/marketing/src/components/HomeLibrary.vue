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
        <nuxt-link
          :to="{ path: '/components', hash: `#${categoryAnchor(category.catalogCategory)}` }"
          class="home-library__link"
          :data-cy="`library-card-${category.key}`"
        >
          <origam-card
            rounded="lg"
            border
            class="home-library__card"
          >
            <origam-icon
              :icon="category.icon"
              size="28"
              color="primary"
              aria-hidden="true"
            />
            <span class="home-library__label">{{ t(category.labelKey, category.labelFallback) }}</span>
          </origam-card>
        </nuxt-link>
      </origam-grid-item>
    </origam-grid>
  </section>
</template>

<script setup lang="ts">
import { useT } from '~/composables/useT'
import { HOME_LIBRARY_CATEGORIES } from '~/consts/home-library.const'
import { categoryAnchor } from '~/utils/components-catalog.util'

const { t } = useT()

const categories = HOME_LIBRARY_CATEGORIES
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
        font-size: var(--origam-font-size---sm, 0.875rem);
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

    &__grid {
        display: grid;
        grid-template-columns: repeat(6, minmax(0, 1fr));
        gap: var(--origam-space---4, 1rem);
        margin: 0;
        padding: 0;
        list-style: none;
    }

    &__link {
        display: block;
        text-decoration: none;
        color: inherit;
        border-radius: var(--origam-radius---lg, 14px);
    }

    &__card {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: var(--origam-space---3, 0.75rem);
        padding: var(--origam-space---5, 1.25rem) var(--origam-space---2, 0.5rem);
        text-align: center;
        transition: transform 0.15s ease, box-shadow 0.15s ease;
    }

    &__link:hover &__card,
    &__link:focus-visible &__card {
        transform: translateY(-2px);
        box-shadow: var(--origam-shadow---md);
    }

    &__label {
        font-size: var(--origam-font-size---sm, 0.875rem);
        font-weight: var(--origam-font__weight---semibold, 600);
        color: var(--origam-color__text---primary);
    }
}

@media (max-width: 1024px) {
    .home-library__grid {
        grid-template-columns: repeat(3, minmax(0, 1fr));
    }
}

@media (max-width: 768px) {
    .home-library__intro {
        grid-template-columns: 1fr;
    }

    .home-library__grid {
        grid-template-columns: repeat(2, minmax(0, 1fr));
    }
}

@media (prefers-reduced-motion: reduce) {
    .home-library__card {
        transition: none;
    }

    .home-library__link:hover .home-library__card,
    .home-library__link:focus-visible .home-library__card {
        transform: none;
    }
}
</style>
