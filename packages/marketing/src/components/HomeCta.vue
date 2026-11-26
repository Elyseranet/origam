<template>
  <origam-theme-provider mode="dark">
    <section
      class="home-cta home-section"
      aria-labelledby="cta-title"
    >
      <div class="home-cta__band">
        <svg
          class="home-cta__brush"
          viewBox="0 0 1440 160"
          preserveAspectRatio="none"
          aria-hidden="true"
          focusable="false"
        >
          <defs>
            <!-- Fibres horizontales : bruit étiré en x, sans asset ni JS. -->
            <filter
              id="home-cta-dry"
              x="-2%"
              y="-20%"
              width="104%"
              height="140%"
            >
              <feTurbulence
                type="fractalNoise"
                baseFrequency="0.012 0.4"
                numOctaves="1"
                seed="7"
                result="noise"
              />
              <feDisplacementMap
                in="SourceGraphic"
                in2="noise"
                scale="12"
                xChannelSelector="R"
                yChannelSelector="G"
              />
            </filter>
          </defs>
          <path
            class="home-cta__body"
            d="M0 96 C 160 40, 360 24, 560 44 C 700 58, 780 84, 900 78 C 1080 70, 1260 28, 1440 30 L1440 162 L0 162 Z"
          />
          <g
            class="home-cta__tails"
            filter="url(#home-cta-dry)"
          >
            <path d="M0 100 Q 280 -1 560 34 Q 280 95 0 100 Z" opacity="0.85" />
            <path d="M0 84 Q 210 -3 420 22 Q 210 77 0 84 Z" opacity="0.6" />
            <path d="M60 108 Q 380 16 700 48 Q 380 104 60 108 Z" opacity="0.5" />
            <path d="M0 70 Q 150 -4 300 14 Q 150 64 0 70 Z" opacity="0.75" />
            <path d="M200 80 Q 420 1 640 30 Q 420 81 200 80 Z" opacity="0.55" />
            <path d="M320 100 Q 520 34 720 52 Q 520 94 320 100 Z" opacity="0.4" />
            <path d="M0 58 Q 120 -4 240 10 Q 120 52 0 58 Z" opacity="0.5" />
          </g>
          <g
            class="home-cta__fan"
            filter="url(#home-cta-dry)"
          >
            <path class="home-cta__fan--mid" d="M900 100 Q 1170 0 1440 16 Q 1170 88 900 100 Z" />
            <path class="home-cta__fan--light" d="M960 84 Q 1200 -3 1440 2 Q 1200 65 960 84 Z" />
            <path class="home-cta__fan--mid" d="M1000 112 Q 1220 24 1440 40 Q 1220 104 1000 112 Z" />
            <path class="home-cta__fan--dark" d="M920 104 Q 1180 38 1440 48 Q 1180 98 920 104 Z" />
            <path class="home-cta__fan--mid" d="M1080 96 Q 1260 15 1440 22 Q 1260 83 1080 96 Z" />
            <path class="home-cta__fan--light" d="M1140 74 Q 1290 6 1440 6 Q 1290 58 1140 74 Z" />
          </g>
        </svg>

        <div class="home-cta__inner">
          <div class="home-cta__content home-container">
          <div class="home-cta__copy">
            <origam-title
              id="cta-title"
              tag="h2"
              class="home-cta__title"
            >
              {{ t('home.cta.title', 'Three steps to begin.') }}
            </origam-title>

            <p
              class="home-cta__description"
              data-cy="cta-description"
            >
              {{ t('home.cta.description', 'npm i origam, then the plugin and a first component. On Nuxt, one module to add.') }}
            </p>
          </div>

          <div class="home-cta__side">
            <nav
              class="home-cta__actions"
              :aria-label="t('home.cta.actions_label', 'Get started')"
            >
              <origam-btn
                class="home-cta__btn"
                variant="flat"
                size="x-large"
                letter-spacing="normal"
                :bg-color="CTA_SUN_COLOR"
                :color="CTA_INK_COLOR"
                append-icon="mdi-arrow-right"
                :href="CTA_START_HREF"
                data-cy="cta-btn-start"
              >
                {{ t('home.cta.cta_start', 'Install') }}
              </origam-btn>

              <origam-btn
                class="home-cta__btn"
                variant="outlined"
                size="x-large"
                letter-spacing="normal"
                prepend-icon="mdi-book-open-variant-outline"
                :href="CTA_COMPONENTS_HREF"
                data-cy="cta-btn-docs"
              >
                {{ t('home.cta.cta_docs', 'Explore the components') }}
              </origam-btn>
            </nav>

            <p
              class="home-cta__support"
              data-cy="cta-support"
            >
              {{ t('home.cta.support', 'Origam is free, MIT licensed and maintained by one person.') }}
              <origam-btn
                class="home-cta__support-link"
                variant="text"
                size="small"
                append-icon="mdi-arrow-right"
                :href="CONTACT_SUPPORT_ROUTE"
                data-cy="cta-support-link"
              >
                {{ t('home.cta.support_link', 'Support the project') }}
              </origam-btn>
            </p>
          </div>
          </div>
        </div>
      </div>
    </section>
  </origam-theme-provider>
</template>

<script setup lang="ts">
import { useT } from '~/composables/useT'
import { CONTACT_SUPPORT_ROUTE } from '~/consts/contact.const'
import { CTA_COMPONENTS_HREF, CTA_INK_COLOR, CTA_START_HREF, CTA_SUN_COLOR } from '~/consts/cta.const'

const { t } = useT()
</script>

<style scoped lang="scss">
.home-cta {
    --home-cta---bg: var(--origam-color__primary---900);
    --home-cta---brush: 72px;

    color: var(--origam-color__text---primary);

    // Le bord haut de la bande est le coup de pinceau : son fond sort de la SVG, le reste suit sur __inner.
    // Le fond doit etre porte par un vrai element (pas un ::before) : le correcteur de contraste du DS le lit.
    &__band {
        position: relative;
        isolation: isolate;
        padding-block-start: calc(var(--home-cta---brush) - 1px);
    }

    &__brush {
        position: absolute;
        inset-inline: 0;
        inset-block-start: 0;
        inline-size: 100%;
        block-size: var(--home-cta---brush);
        z-index: -1;
        pointer-events: none;
    }

    &__body {
        fill: var(--home-cta---bg);
    }

    &__tails {
        fill: var(--origam-color__action--primary---bg);
    }

    &__fan {
        fill: var(--origam-color__sun---500);

        &--mid { fill: var(--origam-color__sun---500); }
        &--light { fill: var(--origam-color__sun---400); }
        &--dark { fill: var(--origam-color__sun---600); }
    }

    &__inner {
        padding-block: var(--origam-space---3, 0.75rem) var(--origam-space---8, 2rem);
        background-color: var(--home-cta---bg);
    }

    &__content {
        display: flex;
        flex-wrap: wrap;
        align-items: center;
        justify-content: space-between;
        gap: var(--origam-space---6, 1.5rem) var(--origam-space---8, 2rem);
    }

    &__copy {
        display: flex;
        flex-direction: column;
        gap: var(--origam-space---2, 0.5rem);
        max-inline-size: 28rem;
    }

    &__side {
        display: flex;
        flex-direction: column;
        align-items: flex-end;
        gap: var(--origam-space---3, 0.75rem);
    }

    &__title {
        margin: 0;
        font-size: var(--origam-font__size---4xl, 1.875rem);
        font-weight: var(--origam-font__weight---semibold, 600);
        line-height: 1.3;
        color: var(--origam-color__text---primary);
    }

    &__description {
        margin: 0;
        font-size: var(--origam-font__size---lg, 1rem);
        line-height: 1.5;
        color: var(--origam-color__text---primary);
    }

    &__support {
        margin: 0;
        font-size: var(--origam-font__size---md, 0.875rem);
        color: var(--origam-color__text---primary);
    }

    &__actions {
        display: flex;
        flex-wrap: wrap;
        align-items: center;
        gap: var(--origam-space---5, 1.25rem);
    }
}

@media (max-width: 640px) {
    .home-cta {
        &__side { align-items: flex-start; }
        &__btn { max-inline-size: 100%; }
    }
}
</style>
