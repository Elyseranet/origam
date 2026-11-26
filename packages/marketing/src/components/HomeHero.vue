<template>
  <origam-theme-provider mode="light">
    <section
      id="hero"
      class="home-hero"
      data-cy="section-hero"
      aria-labelledby="hero-title"
    >
      <div
        class="home-hero__visual"
        aria-hidden="true"
      >
        <origam-img
          class="home-hero__img"
          :src="HERO_WATERCOLOR.src"
          :srcset="HERO_WATERCOLOR.srcset"
          :sizes="HERO_WATERCOLOR_SIZES"
          alt=""
          width="100%"
          height="100%"
          cover
          position="center bottom"
          eager
          data-cy="hero-watercolor"
        />
        <origam-img
          class="home-hero__img home-hero__img--symbol"
          :src="HERO_SYMBOL_DAY.src"
          :srcset="HERO_SYMBOL_DAY.srcset"
          :sizes="HERO_SYMBOL_SIZES"
          alt=""
          width="36%"
          max-width="24rem"
          height="56%"
          position="center"
          eager
          data-cy="hero-symbol"
        />
      </div>
  
      <origam-container
        class="home-hero__inner"
        max-width="none"
      >
        <header class="home-hero__header">
          <p
            class="home-hero__eyebrow"
            data-cy="hero-eyebrow"
          >
            {{ t('home.hero.eyebrow', 'DESIGN SYSTEM') }}
          </p>
  
          <origam-title
            id="hero-title"
            tag="h1"
            class="home-hero__title"
          >
            {{ t('home.hero.title', 'Origam') }}
          </origam-title>
  
          <p class="home-hero__tagline">
            {{ t('home.hero.tagline', 'A modern, flexible and accessible design system') }}
          </p>
  
          <p class="home-hero__description">
            {{ t('home.hero.description', 'A library of components and tools to build consistent, fast and elegant interfaces.') }}
          </p>
        </header>
  
        <nav
          class="home-hero__ctas"
          :aria-label="t('home.hero.ctas_label', 'Hero calls to action')"
        >
          <origam-btn
            class="home-hero__btn"
            variant="flat"
            :bg-color="HERO_CTA_BG"
            :color="HERO_CTA_FG"
            append-icon="mdi-arrow-right"
            :href="CTA_START_HREF"
            data-cy="hero-cta-start"
          >
            {{ t('home.hero.cta_start', 'Get started') }}
          </origam-btn>
  
          <origam-btn
            class="home-hero__btn"
            variant="outlined"
            color="primary"
            prepend-icon="mdi-github"
            :href="githubRepo"
            target="_blank"
            rel="noopener noreferrer"
            data-cy="hero-cta-github"
          >
            {{ t('home.hero.cta_github', 'View on GitHub') }}
          </origam-btn>
        </nav>
      </origam-container>
    </section>
  </origam-theme-provider>
</template>

<script setup lang="ts">
import { useT } from '~/composables/useT'
import { CTA_START_HREF } from '~/consts/cta.const'
import {
    HERO_CTA_BG,
    HERO_CTA_FG,
    HERO_SYMBOL_DAY,
    HERO_SYMBOL_SIZES,
    HERO_WATERCOLOR,
    HERO_WATERCOLOR_SIZES
} from '~/consts/hero.const'
import { MARKETING_DEFAULTS } from '~/consts/marketing.const'

/*********************************************************
 * Global
 *
 * @description
 * Hero de la maquette A, rendu en mode clair quel que soit le mode du site
 * (le texte encre doit rester lisible sur l'aquarelle) : l'aquarelle et le symbole A1 sont décoratifs et sort du flux de lecture (aria-hidden, alt vide).
 ********************************************************/
const { t } = useT()

const githubRepo = MARKETING_DEFAULTS.githubRepo

defineEmits([])

defineSlots<Record<string, never>>()

/*********************************************************
 * Expose
 *
 * @description
 * Rien à piloter depuis l'extérieur.
 ********************************************************/
defineExpose({})
</script>

<style scoped lang="scss">
.home-hero {
    position: relative;
    isolation: isolate;
    overflow: hidden;
    background: var(--origam-color__surface---default);

    &::after {
        content: '';
        position: absolute;
        inset-inline: 0;
        inset-block-end: 0;
        block-size: var(--origam-space---24, 6rem);
        pointer-events: none;
        background: linear-gradient(to bottom, transparent, var(--home-hero-fade, var(--origam-color__surface---default)));
    }

    &__visual {
        position: absolute;
        inset: 0;
        z-index: -1;
        pointer-events: none;
    }

    &__img {
        position: absolute;
        inset: 0;
    }

    &__img--symbol {
        inset: 22% 12% auto auto;
    }

    &__visual::after {
        content: '';
        position: absolute;
        inset: 0;
        background: linear-gradient(
            90deg,
            color-mix(in srgb, var(--origam-color__surface---default) 88%, transparent),
            transparent 60%
        );
    }

    &__inner {
        --origam-container---padding-inline-start: var(--site-gutter);
        --origam-container---padding-inline-end: var(--site-gutter);

        display: flex;
        flex-direction: column;
        align-items: flex-start;
        justify-content: center;
        gap: var(--origam-space---6, 1.5rem);
        min-block-size: clamp(24rem, 52vw, 40rem);
        padding-block: var(--origam-space---12, 3rem);
    }

    &__header {
        display: flex;
        flex-direction: column;
        gap: var(--origam-space---3, 0.75rem);
        max-inline-size: 28rem;
    }

    &__eyebrow {
        margin: 0;
        font-size: var(--origam-font__size---xs, 0.75rem);
        font-weight: var(--origam-font__weight---semibold, 600);
        letter-spacing: 0.2em;
        color: var(--origam-color__text---primary);
    }

    &__title {
        margin: 0;
        font-size: clamp(3rem, 8vw, 5rem);
        font-weight: var(--origam-font__weight---bold, 700);
        line-height: 1;
        color: var(--origam-color__text---primary);
    }

    &__tagline {
        margin: 0;
        font-size: clamp(1.25rem, 2.6vw, 1.75rem);
        line-height: 1.25;
        color: var(--origam-color__text---primary);
    }

    &__description {
        margin: 0;
        font-size: var(--origam-font__size---md, 1rem);
        line-height: 1.6;
        color: var(--origam-color__text---primary);
    }

    &__ctas {
        display: flex;
        flex-wrap: wrap;
        gap: var(--origam-space---3, 0.75rem);
    }
}
</style>

<style lang="scss">
section.home-hero .home-hero__img--symbol {
    display: none;
}

@media (min-width: 64rem) {
    section.home-hero .home-hero__img--symbol {
        display: block;
    }
}
</style>
