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

<template>
    <article class="home">
        <home-hero
            id="hero"
            data-cy="section-hero"
        />

        <home-kpis
            id="kpis"
            data-cy="section-kpis"
        />

        <home-features
            id="features"
            data-cy="section-features"
        />

        <home-playground
            id="playground"
            data-cy="section-playground"
        />

        <home-showcase
            id="showcase"
            data-cy="section-showcase"
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

<style scoped lang="scss">
.home {
    display: flex;
    flex-direction: column;
}
</style>
