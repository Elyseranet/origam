<template>
  <article class="home">
    <home-hero />

    <home-benefits
      id="benefits"
      data-cy="section-benefits"
    />

    <home-playground
      id="playground"
      data-cy="section-playground"
    />

    <home-library
      id="library"
      data-cy="section-library"
    />

    <home-themes
      id="themes"
      data-cy="section-themes"
    />

    <home-cta
      id="cta"
      data-cy="section-cta"
    />
  </article>
</template>

<script setup lang="ts">
import { useT } from '~/composables/useT'

const { t } = useT()

useSeoMeta({
    title: () => t('home.meta.title', 'origam · Vue 3 design system'),
    description: () => t('home.meta.description', 'Build your entire Vue 3 design system in minutes.'),
    ogTitle: () => t('home.meta.title', 'origam · Vue 3 design system'),
    ogDescription: () => t('home.meta.description', 'Build your entire Vue 3 design system in minutes.')
})
</script>

<style scoped lang="scss">
.home {
    display: flex;
    flex-direction: column;
    --home-hero-fade: var(--origam-color__surface---default);
}
</style>
