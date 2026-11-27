<template>
  <section
    id="hero"
    class="home-hero"
    data-cy="section-hero"
    aria-labelledby="hero-title"
  >
    <div
      class="home-hero__visual"
      aria-hidden="true"
      data-cy="hero-planes"
    >
      <div
        v-for="plane in planes"
        :key="plane.key"
        class="home-hero__plane"
        :class="plane.classes"
        :style="plane.style"
        :data-cy="plane.cy"
      />
    </div>

    <enso-petals
      class="home-hero__petals"
      :count="HERO_PETAL_COUNT"
    />

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
    HERO_PETAL_COUNT
} from '~/consts/hero.const'
import { MARKETING_DEFAULTS } from '~/consts/marketing.const'
import { heroPlaneViews } from '~/utils/enso.util'

/*********************************************************
 * Global
 *
 * @description
 * Hero en parallaxe à plans séparés (#1572). Il suit le mode du site (clair ou
 * sombre) : chaque plan prend sa variante via `.enso-art`. Les plans et les
 * pétales sont décoratifs (aria-hidden, aucun événement pointeur) et restent
 * derrière le texte. Animation en CSS seul : `animation-timeline: scroll()`
 * déplace chaque plan à sa vitesse, sans JavaScript ; sans cette feature ou
 * sous `prefers-reduced-motion`, la composition reste statique.
 ********************************************************/
const { t } = useT()

const githubRepo = MARKETING_DEFAULTS.githubRepo

const installCommand = computed(() => t('home.hero.install', 'npm i origam'))

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

    &__visual::after {
        content: '';
        position: absolute;
        inset: 0;
        background: color-mix(in srgb, var(--origam-color__surface---default) 70%, transparent);
        mask-image: linear-gradient(to bottom, var(--origam-color__neutral---950) 88%, transparent);
    }

    &__petals {
        z-index: -1;
    }

    &__plane {
        position: absolute;
        aspect-ratio: var(--enso-art-ratio);
        background: var(--enso-art) center / contain no-repeat;
        will-change: transform;
    }

    &__plane--desktop-only {
        display: none;
    }

    &__plane--sky {
        inset-block-start: 0;
        inset-inline: 0;
        inline-size: 100%;
    }

    &__plane--sun {
        inset-block-end: 16%;
        inset-inline-end: 18%;
        inline-size: 5rem;
    }

    &__plane--mountains {
        inset-block-end: 10%;
        inset-inline-end: -15%;
        inline-size: 130%;
    }

    &__plane--landscape {
        inset-block-end: 0;
        inset-inline-start: -30%;
        inline-size: 160%;
    }

    &__plane--sakura {
        inset-block-end: -2%;
        inset-inline-end: -12%;
        inline-size: 70%;
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

@media (min-width: 48rem) {
    .home-hero__plane--desktop-only {
        display: block;
    }

    .home-hero__plane--sky {
        inset-block-start: 4rem;
        mask-image: linear-gradient(to bottom, transparent, var(--origam-color__neutral---950) 3rem);
    }

    .home-hero__plane--enso {
        inset-block-start: 0;
        inset-inline-end: 3%;
        inline-size: clamp(14rem, 31vw, 30rem);
    }

    .home-hero__plane--sun {
        inset-block-end: 14%;
        inset-inline-end: 34%;
        inline-size: clamp(8rem, 13vw, 13rem);
    }

    .home-hero__plane--mountains {
        inset-block-end: 12%;
        inset-inline-end: -4%;
        inline-size: 66%;
    }

    .home-hero__plane--landscape {
        inset-inline-start: 0;
        inline-size: 100%;
    }

    .home-hero__plane--pagoda {
        inset-block-end: 4%;
        inset-inline-end: 12%;
        inline-size: clamp(8rem, 16vw, 15rem);
    }

    .home-hero__plane--sakura {
        inset-block-end: -3%;
        inset-inline-end: -3%;
        inline-size: 34%;
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

@supports (animation-timeline: scroll()) {
    @media (prefers-reduced-motion: no-preference) {
        .home-hero__plane {
            animation: home-hero-drift linear both;
            animation-timeline: scroll(root block);
            animation-range: 0px 480px;
        }
    }
}

@keyframes home-hero-drift {
    to {
        transform: translate3d(0, var(--plane-shift, 0px), 0);
    }
}
</style>
