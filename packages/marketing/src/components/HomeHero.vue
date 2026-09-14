<script setup lang="ts">
  import { computed } from 'vue'
  import { useT } from '~/composables/useT'
  import { useVersion } from '~/composables/useVersion'
  import { MARKETING_DEFAULTS } from '~/consts/marketing.const'
  import { HERO_BADGE_VARS } from '~/consts/hero.const'

  const { t } = useT()
  const { version } = useVersion()

  const installCommand = computed(() => t('home.hero.install', 'npm install origam'))
  const badge = computed(() =>
    t('home.hero.badge', `v${version.value} — 26 charts shipped, WCAG 2.1 AA pass`, { version: version.value })
  )
  const githubRepo = MARKETING_DEFAULTS.githubRepo
</script>

<template>
  <section
    id="hero"
    class="home-hero"
    aria-labelledby="hero-title-line1 hero-title-line2"
  >
    <origam-container class="home-hero__inner">
      <header class="home-hero__header">
        <origam-chip
          class="home-hero__badge"
          :style="HERO_BADGE_VARS"
          color="primary"
          border
          border-color="var(--origam-color__action--primary---bg)"
          size="small"
          append-icon="mdi-arrow-right"
          pill
          data-cy="hero-badge"
        >
          {{ badge }}
        </origam-chip>

        <origam-text-mask
          tag="h1"
          class="home-hero__title"
          background="var(--origam-gradient---hero-title)"
        >
          <span
            id="hero-title-line1"
            class="home-hero__title-line"
          >{{ t('home.hero.title_line1', 'The Vue 3 design system') }}</span>
          <span
            id="hero-title-line2"
            class="home-hero__title-line"
          >{{ t('home.hero.title_line2', 'that just works.') }}</span>
        </origam-text-mask>

        <p class="home-hero__subtitle">
          {{ t('home.hero.subtitle', '218 components. 26 chart primitives. Full a11y. Design tokens out of the box. Built for Vue 3 with TypeScript-first DX.') }}
        </p>
      </header>

      <nav
        class="home-hero__ctas"
        :aria-label="t('home.hero.ctas_label', 'Hero calls to action')"
      >
        <origam-btn
          class="home-hero__btn home-hero__btn--primary"
          variant="text"
          href="/components"
          append-icon="mdi-arrow-right"
          data-cy="hero-cta-components"
        >
          {{ t('home.hero.cta_components', 'Browse components') }}
        </origam-btn>

        <origam-btn
          class="home-hero__btn home-hero__btn--secondary"
          variant="text"
          prepend-icon="mdi-star-outline"
          :href="githubRepo"
          target="_blank"
          rel="noopener noreferrer"
          data-cy="hero-cta-github"
        >
          {{ t('home.hero.cta_github', 'Star on GitHub') }}
        </origam-btn>
      </nav>

      <origam-code
        :code="installCommand"
        prompt="$"
        lang="bash"
        compact
        copyable
        data-cy="hero-install-command"
      />
    </origam-container>
  </section>
</template>

<style scoped lang="scss">
  .home-hero {
    position: relative;
    padding-block: var(--origam-space---16, 4rem) var(--origam-space---12, 3rem);

    &::before {
      content: '';
      position: absolute;
      inset: 0;
      background-image: var(--origam-gradient---hero-grid);
      background-size: 64px 64px;
      background-position: center top;
      -webkit-mask-image: linear-gradient(to bottom, #000 0%, transparent 75%);
      mask-image: linear-gradient(to bottom, #000 0%, transparent 75%);
      pointer-events: none;
      z-index: 0;
    }

    &::after {
      content: '';
      position: absolute;
      inset-inline: 0;
      inset-block-start: 0;
      block-size: 320px;
      background-image: var(--origam-gradient---hero-glow);
      pointer-events: none;
      z-index: 0;
    }

    &__inner {
      position: relative;
      z-index: 1;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: var(--origam-space---6, 1.5rem);
      text-align: center;
    }

    &__header {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: var(--origam-space---4, 1rem);
    }

    &__title {
      margin: 0;
      display: flex;
      flex-direction: column;
      align-items: center;
      font-size: var(--origam-font-size---hero, 5.25rem);
      font-weight: var(--origam-font-weight---extrabold, 800);
      line-height: var(--origam-line-height---hero, 0.95);
      letter-spacing: var(--origam-letter-spacing---hero, -0.045em);
      padding-block-end: 0.12em;
      color: var(--origam-color__text---ink, #0a0a0a);
    }

    &__title-line {
      display: block;
      white-space: nowrap;
    }

    &__subtitle {
      margin: 0;
      max-inline-size: 42.5rem;
      font-size: var(--origam-font-size---lg, 1.125rem);
      line-height: var(--origam-line-height---relaxed, 1.7);
      color: var(--origam-color__text---secondary, #525252);
    }

    &__ctas {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      justify-content: center;
      gap: var(--origam-space---3, 0.75rem);
    }

    &__btn {
      --origam-btn---height: 57.5px;
      --origam-btn---density: 0px;
      --origam-btn---density-padding-x: var(--origam-space---6, 1.5rem);
      --origam-btn---font-size: 1rem;
      --origam-btn---font-weight: 400;
      --origam-btn---border-radius: var(--origam-radius---btn, 10px);

      &--primary {
        background-image: var(--origam-gradient---btn-primary);
        background-color: var(--origam-color---btn-primary-bg, transparent);
        box-shadow: var(--origam-shadow---btn-primary);
        --origam-btn---color: var(--origam-color---btn-primary-text);
      }

      &--secondary {
        background-image: var(--origam-gradient---btn-secondary);
        background-color: var(--origam-color---btn-secondary-bg);
        box-shadow: var(--origam-shadow---btn-secondary);
        border: 1px solid var(--origam-color---btn-secondary-border);
        --origam-btn---color: var(--origam-color---btn-secondary-text);
      }
    }
  }

  @media (max-width: 1080px) {
    .home-hero {
      &__title {
        font-size: clamp(2.5rem, 9vw, 5.25rem);
      }

      &__title-line {
        white-space: normal;
      }
    }
  }
</style>
