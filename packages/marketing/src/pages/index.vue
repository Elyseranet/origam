<template>
  <article class="home">
    <home-hero />

    <home-proof
      id="proof"
      data-cy="section-proof"
    />

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
    title: () => t('home.meta.title', 'origam · the Vue 3 design system that folds to your brand'),
    description: () => t('home.meta.description', '97 Vue 3 component families, from forms to charts. A theme is one object: you set props first, then tokens. MIT licensed.'),
    ogTitle: () => t('home.meta.title', 'origam · the Vue 3 design system that folds to your brand'),
    ogDescription: () => t('home.meta.description', '97 Vue 3 component families, from forms to charts. A theme is one object: you set props first, then tokens. MIT licensed.')
})
</script>

<style scoped lang="scss">
.home {
    display: flex;
    flex-direction: column;
    --home-hero-fade: var(--origam-color__surface---default);
}
</style>
