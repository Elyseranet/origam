<template>
  <origam-parallax
    id="hero"
    tag="section"
    class="home-hero"
    easing="ease-out"
    data-cy="section-hero"
    aria-labelledby="hero-title"
  >
    <div
      class="home-hero__visual"
      aria-hidden="true"
      data-cy="hero-planes"
    >
      <origam-parallax-layer
        v-for="plane in planes"
        :key="plane.key"
        :speed="plane.speed"
        :mouse-x="plane.mouseX"
        :mouse-y="plane.mouseY"
      >
        <div
          class="home-hero__plane"
          :class="plane.classes"
          :style="plane.style"
          :data-cy="plane.cy"
        />
      </origam-parallax-layer>
    </div>

    <origam-container
      class="home-hero__inner home-container"
    >
      <div class="home-hero__copy">
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
            :style="HERO_BTN_VARS"
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
            :style="HERO_BTN_VARS"
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

      </div>
    </origam-container>
  </origam-parallax>
</template>

<script setup lang="ts">
import { useT } from '~/composables/useT'
import { CTA_START_HREF } from '~/consts/cta.const'
import {
    HERO_BTN,
    HERO_BTN_VARS,
    HERO_CTA_BG,
    HERO_CTA_OUTLINE_BG,
    HERO_CTA_FG
} from '~/consts/hero.const'
import { MARKETING_DEFAULTS } from '~/consts/marketing.const'
import { heroPlaneViews } from '~/utils/enso.util'

/*********************************************************
 * Global
 *
 * @description
 * Hero « enso » (#1593, spec v12 § 3) : six plans OrigamParallaxLayer dans un
 * OrigamParallax en `easing="ease-out"`, soit le chemin JS du DS. Le chemin CSS
 * (`linear`) anime aussi X au défilement, pose `--css-driven` côté client seul
 * (écart d'hydratation) et fige sa timeline sous un ancêtre `overflow` (#1603).
 * Pointeur : `mouse-x` / `mouse-y` (px) par plan ; défilement : `speed`. Les
 * plans sont décoratifs (aria-hidden, sans pointeur) et restent sous le texte,
 * immobile. Sous `prefers-reduced-motion` ou sans pointeur fin, le DS fige tout
 * ou ne garde que le défilement.
 ********************************************************/
const { t } = useT()

const githubRepo = MARKETING_DEFAULTS.githubRepo

/*********************************************************
 * Plans
 *
 * @description
 * Les plans de `HERO_PLANES` avec leurs variables CSS (`--enso-art-*`,
 * `--plane-shift`), statiques : rien à recalculer côté client.
 ********************************************************/
const planes = heroPlaneViews()

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
    --home-hero-appbar: 72px;
    --home-hero-enso-top: calc(36px - var(--home-hero-appbar));

    position: relative;
    background: var(--origam-color__surface---default);

    &::after {
        content: '';
        position: absolute;
        inset-inline: 0;
        inset-block-end: 0;
        z-index: 1;
        block-size: 220px;
        pointer-events: none;
        background: linear-gradient(to bottom, transparent, var(--origam-color__surface---default) 80%);
    }

    &__visual {
        position: absolute;
        inset: 0;
        z-index: 0;
        pointer-events: none;
    }

    &__plane {
        position: absolute;
        aspect-ratio: var(--enso-art-ratio);
        background: var(--enso-art) center / contain no-repeat;
    }

    &__plane--sun {
        inset-inline-start: calc(58.5% - 135px);
        inset-block-end: 250px;
        inline-size: 270px;
    }

    &__plane--mountains {
        inset-inline-start: 0;
        inset-block-end: 40px;
        inline-size: 130%;
        opacity: 0.92;
    }

    &__plane--landscape {
        inset-inline-start: -3%;
        inset-block-end: -14px;
        inline-size: 106%;
    }

    &__plane--pagoda {
        inset-inline-end: 8%;
        inset-block-end: 60px;
        inline-size: min(15vw, 210px);
    }

    &__plane--sakura {
        inset-inline-end: -7%;
        inset-block-end: -24px;
        inline-size: min(30vw, 430px);
    }

    &__plane--enso {
        inset-inline-end: 5%;
        inset-block-start: var(--home-hero-enso-top);
        inline-size: min(28vw, 400px);
    }

    &__inner {
        --origam-container---max-width: calc(var(--home-container-max) + 2 * var(--site-gutter));

        position: relative;
        z-index: 2;
        inline-size: 100%;
        padding-block: 72px 320px;
    }

    &__copy {
        display: flex;
        flex-direction: column;
        align-items: flex-start;
        gap: var(--origam-space---6, 1.5rem);
        max-inline-size: min(560px, 50%);
    }

    &__header {
        display: flex;
        flex-direction: column;
        gap: var(--origam-space---5, 1.25rem);
        max-inline-size: 100%;
    }

    &__eyebrow {
        margin: 0;
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
}

@media (max-width: 1180px) {
    .home-hero__plane--sun {
        inset-inline-start: calc(58.5% - 105px);
        inline-size: 210px;
    }

    .home-hero__copy {
        max-inline-size: 44%;
    }
}

@media (max-width: 860px) {
    .home-hero__plane--wide-only {
        display: none;
    }

    .home-hero__copy {
        max-inline-size: none;
    }
}

@media (max-width: 768px) {
    .home-hero__inner {
        padding-block-end: 220px;
    }
}
</style>
