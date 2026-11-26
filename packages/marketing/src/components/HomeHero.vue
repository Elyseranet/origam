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
          max-width="34rem"
          height="74%"
          position="center"
          eager
          data-cy="hero-symbol"
        />
      </div>
  
      <origam-container
        class="home-hero__inner home-container"
      >
        <header class="home-hero__header">
          <p
            class="home-hero__eyebrow home-eyebrow"
            data-cy="hero-eyebrow"
          >
            {{ t('home.hero.eyebrow', 'VUE 3 DESIGN SYSTEM') }}
          </p>
  
          <origam-title
            id="hero-title"
            tag="h1"
            class="home-hero__title"
          >
            {{ t('home.hero.title', 'The Vue 3 design system that folds to your brand') }}
          </origam-title>
  
          <p class="home-hero__tagline">
            {{ t('home.hero.tagline', 'Props first, CSS second.') }}
          </p>
  
          <p class="home-hero__description">
            {{ t('home.hero.description', '97 component families, from forms to charts, and a Nuxt module in the same package. A theme is one object: written once, applied to the whole catalogue.') }}
          </p>
        </header>
  
        <nav
          class="home-hero__ctas"
          :aria-label="t('home.hero.ctas_label', 'Hero calls to action')"
        >
          <origam-btn
            class="home-hero__btn"
            v-bind="HERO_BTN"
            variant="flat"
            :bg-color="HERO_CTA_BG"
            :color="HERO_CTA_FG"
            append-icon="mdi-arrow-right"
            :href="CTA_START_HREF"
            data-cy="hero-cta-start"
          >
            {{ t('home.hero.cta_start', 'Install') }}
          </origam-btn>
  
          <origam-btn
            class="home-hero__btn"
            v-bind="HERO_BTN"
            variant="flat"
            color="primary"
            :bg-color="HERO_CTA_OUTLINE_BG"
            border="thin"
            border-color="currentColor"
            prepend-icon="mdi-github"
            :href="githubRepo"
            target="_blank"
            rel="noopener noreferrer"
            data-cy="hero-cta-github"
          >
            {{ t('home.hero.cta_github', 'View on GitHub') }}
          </origam-btn>
        </nav>

        <origam-code
          :code="installCommand"
          :prompt="HERO_INSTALL_PROMPT"
          lang="plaintext"
          compact
          copyable
          class="home-hero__install"
          data-cy="hero-install-command"
        />

        <p
          class="home-hero__proof"
          data-cy="hero-proof"
        >
          {{ t('home.hero.proof', 'MIT license · Vue 3.5+ · Nuxt module included') }}
        </p>
      </origam-container>
    </section>
  </origam-theme-provider>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useT } from '~/composables/useT'
import { CTA_START_HREF } from '~/consts/cta.const'
import {
    HERO_BTN,
    HERO_CTA_BG,
    HERO_CTA_OUTLINE_BG,
    HERO_CTA_FG,
    HERO_INSTALL_PROMPT,
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

const installCommand = computed(() => t('home.hero.install', 'npm i origam'))

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
        inset: 4% 12% auto auto;
    }

    /* Voile limité à la zone du texte : le paysage et le cerisier restent lisibles sous les boutons. */
    &__visual::after {
        content: '';
        position: absolute;
        inset: 0;
        background: color-mix(in srgb, var(--origam-color__surface---default) 70%, transparent);
        mask-image: linear-gradient(to bottom, var(--origam-color__neutral---950) 88%, transparent);
    }

    &__inner {
        --origam-container---max-width: calc(var(--home-container-max) + 2 * var(--site-gutter));

        display: flex;
        flex-direction: column;
        align-items: flex-start;
        justify-content: flex-start;
        gap: var(--origam-space---6, 1.5rem);
        min-block-size: clamp(24rem, 40vw, 36rem);
        padding-block: var(--origam-space---16, 4rem) var(--origam-space---24, 6rem);
    }

    &__header {
        display: flex;
        flex-direction: column;
        gap: var(--origam-space---5, 1.25rem);
        max-inline-size: 100%;
    }

    &__eyebrow {
        --home-eyebrow-mark-w: 0.9em;
        --home-eyebrow-mark-h: 0.65em;
        --home-eyebrow-gap: 0.75em;

        margin: 0;
        font-size: var(--home-fs-small);
        letter-spacing: 0.3em;
    }

    &__title {
        margin: 0;
        font-size: var(--home-fs-h1-sentence);
        font-weight: var(--origam-font__weight---bold, 700);
        line-height: 1.08;
        color: var(--origam-color__text---primary);
    }

    &__tagline {
        margin: 0;
        font-size: var(--home-fs-h3);
        line-height: 1.3;
        color: var(--origam-color__text---primary);
    }

    &__description {
        margin: 0;
        font-size: var(--home-fs-body);
        line-height: 1.6;
        color: var(--origam-color__text---primary);
    }

    &__ctas {
        display: flex;
        flex-wrap: wrap;
        gap: var(--origam-space---5, 1.25rem);
        margin-block-start: var(--origam-space---2, 0.5rem);
    }

    &__install {
        max-inline-size: 100%;
    }

    &__proof {
        margin: 0;
        font-size: var(--home-fs-small);
        color: var(--origam-color__text---primary);
    }
}

@media (min-width: 64rem) {
    .home-hero__visual::after {
        background: linear-gradient(
            90deg,
            color-mix(in srgb, var(--origam-color__surface---default) 70%, transparent),
            transparent 45%
        );
    }

    .home-hero__header {
        max-inline-size: 42%;
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
