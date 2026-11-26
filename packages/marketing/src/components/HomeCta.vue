<template>
  <origam-theme-provider mode="dark">
    <section
      class="home-cta home-container home-section"
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
                scale="7"
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
            <path d="M0 94 Q 215 37 430 26 Q 215 55 0 94 Z" opacity="0.8" />
            <path d="M20 86 Q 280 39 540 30 Q 280 53 20 86 Z" opacity="0.55" />
            <path d="M0 74 Q 155 29 310 20 Q 155 45 0 74 Z" opacity="0.7" />
            <path d="M70 102 Q 345 55 620 40 Q 345 67 70 102 Z" opacity="0.4" />
            <path d="M190 72 Q 380 32 570 26 Q 380 46 190 72 Z" opacity="0.6" />
            <path d="M270 92 Q 460 54 650 42 Q 460 64 270 92 Z" opacity="0.35" />
            <path d="M0 62 Q 125 25 250 16 Q 125 37 0 62 Z" opacity="0.5" />
            <path d="M330 70 Q 475 38 620 32 Q 475 48 330 70 Z" opacity="0.45" />
          </g>
          <g
            class="home-cta__fan"
            filter="url(#home-cta-dry)"
          >
            <path class="home-cta__fan--mid" d="M960 88 Q 1200 33 1440 26 Q 1200 61 960 88 Z" />
            <path class="home-cta__fan--light" d="M1000 76 Q 1220 25 1440 10 Q 1220 43 1000 76 Z" />
            <path class="home-cta__fan--mid" d="M1040 100 Q 1240 49 1440 44 Q 1240 75 1040 100 Z" />
            <path class="home-cta__fan--dark" d="M980 94 Q 1210 58 1440 52 Q 1210 76 980 94 Z" />
            <path class="home-cta__fan--mid" d="M1120 88 Q 1280 41 1440 30 Q 1280 61 1120 88 Z" />
            <path class="home-cta__fan--light" d="M1180 68 Q 1310 29 1440 18 Q 1310 43 1180 68 Z" />
          </g>
        </svg>

        <div class="home-cta__inner">
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
    --home-cta---bg: color-mix(in srgb, var(--origam-color__action--primary---bg) 24%, var(--origam-color__surface---default));
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
        padding-inline: var(--origam-space---12, 3rem);
        border-end-start-radius: var(--origam-radius---xl, 1rem);
        border-end-end-radius: var(--origam-radius---xl, 1rem);
        background-color: var(--home-cta---bg);
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
        &__inner { padding-inline: var(--origam-space---5, 1.25rem); }
        &__side { align-items: flex-start; }
        &__btn { max-inline-size: 100%; }
    }
}
</style>
