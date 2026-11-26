<template>
  <origam-theme-provider mode="dark">
    <section
      class="home-cta"
      aria-labelledby="cta-title"
    >
      <svg
        class="home-cta__brush"
        viewBox="0 0 1440 360"
        preserveAspectRatio="none"
        aria-hidden="true"
        focusable="false"
    >
        <path
          class="home-cta__stroke home-cta__stroke--violet"
          d="M0 250 C 240 150 420 330 700 250 S 1180 90 1440 190 L 1440 360 L 0 360 Z"
        />
        <path
          class="home-cta__stroke home-cta__stroke--sun"
          d="M0 300 C 280 230 480 360 760 300 S 1200 190 1440 262 L 1440 360 L 0 360 Z"
        />
      </svg>

      <div class="home-cta__inner">
        <origam-title
          id="cta-title"
          tag="h2"
          class="home-cta__title"
        >
          {{ t('home.cta.title', 'Ready to build your interfaces?') }}
        </origam-title>

        <nav
          class="home-cta__actions"
          :aria-label="t('home.cta.actions_label', 'Get started')"
        >
          <origam-btn
            class="home-cta__btn"
            variant="flat"
            :bg-color="CTA_SUN_COLOR"
            :color="CTA_INK_COLOR"
            :href="CTA_COMPONENTS_HREF"
            data-cy="cta-btn-start"
          >
            {{ t('home.cta.cta_start', 'Explore the components') }}
          </origam-btn>

          <origam-btn
            class="home-cta__btn"
            variant="outlined"
            :href="NAV_DOCS_LINK.href"
            data-cy="cta-btn-docs"
          >
            {{ t('home.cta.cta_docs', 'Read the documentation') }}
          </origam-btn>
        </nav>
      </div>
    </section>
  </origam-theme-provider>
</template>

<script setup lang="ts">
import { useT } from '~/composables/useT'
import { CTA_COMPONENTS_HREF, CTA_INK_COLOR, CTA_SUN_COLOR } from '~/consts/cta.const'
import { NAV_DOCS_LINK } from '~/consts/nav.const'

const { t } = useT()
</script>

<style scoped lang="scss">
.home-cta {
    position: relative;
    overflow: hidden;
    isolation: isolate;
    padding-block: var(--origam-space---24, 6rem);
    padding-inline: var(--origam-space---6, 1.5rem);
    background-color: color-mix(in srgb, var(--origam-color__action--primary---bg) 24%, var(--origam-color__surface---default));
    color: var(--origam-color__text---primary);

    &__brush {
        position: absolute;
        inset-inline: 0;
        inset-block-end: 0;
        inline-size: 100%;
        block-size: 70%;
        z-index: -1;
        pointer-events: none;
    }

    &__stroke {
        &--violet {
            fill: var(--origam-color__action--primary---bg);
            opacity: 0.55;
        }

        &--sun {
            fill: var(--origam-color__sun---500);
            opacity: 0.85;
        }
    }

    &__inner {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: var(--origam-space---8, 2rem);
        max-inline-size: 48rem;
        margin-inline: auto;
        text-align: center;
    }

    &__title {
        margin: 0;
        font-size: clamp(2rem, 5vw, 3.25rem);
        font-weight: var(--origam-font__weight---bold, 700);
        letter-spacing: var(--origam-letter-spacing---tight, -0.03em);
        line-height: 1.1;
        color: var(--origam-color__text---primary);
    }

    &__actions {
        display: flex;
        flex-wrap: wrap;
        align-items: center;
        justify-content: center;
        gap: var(--origam-space---3, 0.75rem);
    }
}
</style>
