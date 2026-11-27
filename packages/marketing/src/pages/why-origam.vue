<template>
  <article
    class="why-origam"
    data-cy="page-why-origam"
  >
    <enso-page-header
      family="editorial"
      title-id="why-title"
    >
      <template #breadcrumb>
        <origam-breadcrumb
          :items="breadcrumbItems"
          divider="/"
          :border="0"
          data-cy="why-breadcrumb"
        />
      </template>

      <template #eyebrow>
        <span data-cy="why-hero-badge">{{ t('why_origam.hero.badge', 'Honest by design') }}</span>
      </template>

      <template #title>
        {{ t('why_origam.hero.title_line1', 'Why origam?') }}
        {{ t('why_origam.hero.title_line2', 'An honest answer.') }}
      </template>

      <template #intro>
        {{ t('why_origam.hero.subtitle', 'Origam is for Vue 3 developers who want to theme through props and ship one base in several identities. Here is what it does well, and what it still lacks.') }}
      </template>

      <template #default>
        <nav
          class="why-hero__actions"
          :aria-label="t('why_origam.hero.actions_label', 'Explore the proof')"
        >
          <origam-btn
            class="why-hero__action"
            variant="text"
            append-icon="mdi-arrow-down"
            href="#why-demo-title"
            data-cy="why-hero-demo-link"
          >
            {{ t('why_origam.hero.cta_demo', 'See it run') }}
          </origam-btn>

          <origam-btn
            class="why-hero__action"
            variant="text"
            prepend-icon="mdi-compass-outline"
            href="#why-usecases-title"
            data-cy="why-hero-usecases-link"
          >
            {{ t('why_origam.hero.cta_use_cases', 'When to choose it') }}
          </origam-btn>
        </nav>
      </template>
    </enso-page-header>

    <origam-container class="why-hero__strip home-container">
      <ul
        class="why-hero__identities"
        :aria-label="t('why_origam.hero.identities_label', 'Brand identities shipped with the site')"
      >
        <li
          v-for="entry in WHY_DEMO_THEMES"
          :key="entry.key"
          class="why-hero__identity"
        >
          <origam-theme-provider
            tag="span"
            :theme="entry.key"
            mode="light"
            class="why-hero__swatch-wrap"
          >
            <span
              class="why-hero__swatch"
              aria-hidden="true"
            />
          </origam-theme-provider>

          {{ t(identityKey(entry.key), entry.themes[0]?.label ?? entry.key) }}
        </li>
      </ul>
    </origam-container>

    <!-- ─────────────────────────────── DEMO ─────────────────────────── -->
    <why-origam-theme-demo />

    <!-- ────────────────────────────── STRENGTHS ─────────────────────── -->
    <section
      class="why-strengths"
      aria-labelledby="why-strengths-title"
    >
      <origam-container>
        <header class="why-strengths__header why-section">
          <p class="why-section__eyebrow">
            {{ t('why_origam.strengths.eyebrow', 'WHAT WE DO WELL') }}
          </p>

          <origam-title
            id="why-strengths-title"
            tag="h2"
            class="why-section__title"
          >
            <span class="why-section__title-line">{{ t('why_origam.strengths.title_line1', 'Built for Vue 3.') }}</span>
            <span class="why-section__title-line why-section__title-line--muted">{{ t('why_origam.strengths.title_line2', 'From the ground up.') }}</span>
          </origam-title>

          <p class="why-section__subtitle">
            {{ t('why_origam.strengths.subtitle', 'Every API, every composable, every prop — designed for Composition API and TypeScript from day one.') }}
          </p>
        </header>

        <!--
          One framed block subdivided by hairlines, instead of eight
          free-floating cards. Eight identical bordered rectangles on a
          plain background read as noise and leave a ragged last row;
          a single frame gives the section one silhouette and lets the
          first cell carry the page's actual argument.
        -->
        <origam-sheet
          tag="div"
          rounded="lg"
          border
          class="why-strengths__board"
        >
          <origam-grid
            tag="ul"
            columns="repeat(auto-fit, minmax(17rem, 1fr))"
            gap="none"
            class="why-strengths__grid"
          >
            <origam-grid-item
              v-for="(strength, index) in strengths"
              :key="strength.titleKey"
              tag="li"
              class="why-strengths__cell"
              :data-lead="index === 0"
            >
              <origam-avatar
                :icon="strength.icon"
                color="primary"
                size="40"
                class="why-strengths__avatar"
                aria-hidden="true"
              />

              <origam-title
                tag="h3"
                class="why-strengths__cell-title"
              >
                {{ t(strength.titleKey, strength.titleKey) }}
              </origam-title>

              <p class="why-strengths__cell-text">
                {{ t(strength.descriptionKey, strength.descriptionKey) }}
              </p>
            </origam-grid-item>
          </origam-grid>
        </origam-sheet>
      </origam-container>
    </section>

    <!-- ───────────────────────────── WEAKNESSES ─────────────────────── -->
    <section
      class="why-weaknesses-wrap"
      aria-labelledby="why-weaknesses-title"
    >
      <origam-container>
        <header class="why-weaknesses__header why-section">
          <p class="why-section__eyebrow">
            {{ t('why_origam.weaknesses.eyebrow', "LET'S BE HONEST") }}
          </p>

          <origam-title
            id="why-weaknesses-title"
            tag="h2"
            class="why-section__title"
          >
            <span class="why-section__title-line">{{ t('why_origam.weaknesses.title_line1', "Where we're") }}</span>
            <span class="why-section__title-line why-section__title-line--muted">{{ t('why_origam.weaknesses.title_line2', 'still growing.') }}</span>
          </origam-title>

          <p class="why-section__subtitle">
            {{ t('why_origam.weaknesses.subtitle', "origam is young. That's a strength in terms of API freshness — and a constraint in terms of maturity.") }}
          </p>
        </header>

        <!--
          Deliberately the quietest block on the page: hairline rows, no
          card, no shadow. A weakness dressed like a feature card reads
          as a boast; a plain list reads as a disclosure.
        -->
        <ul class="why-weaknesses__list">
          <li
            v-for="weakness in weaknesses"
            :key="weakness.titleKey"
            class="why-weaknesses__row"
          >
            <origam-icon
              :icon="weakness.icon"
              class="why-weaknesses__icon"
              aria-hidden="true"
            />

            <div class="why-weaknesses__body">
              <origam-title
                tag="h3"
                class="why-weaknesses__row-title"
              >
                {{ t(weakness.titleKey, weakness.titleKey) }}
              </origam-title>

              <p class="why-weaknesses__row-text">
                {{ t(weakness.descriptionKey, weakness.descriptionKey) }}
              </p>
            </div>
          </li>
        </ul>
      </origam-container>
    </section>

    <!-- ───────────────────────────── USE CASES ──────────────────────── -->
    <section
      class="why-usecases"
      aria-labelledby="why-usecases-title"
    >
      <origam-container>
        <header class="why-usecases__header why-section">
          <p class="why-section__eyebrow">
            {{ t('why_origam.use_cases.eyebrow', 'WHO IS ORIGAM FOR') }}
          </p>

          <origam-title
            id="why-usecases-title"
            tag="h2"
            class="why-section__title why-section__title--single"
          >
            {{ t('why_origam.use_cases.title', 'Pick origam when…') }}
          </origam-title>
        </header>

        <origam-grid
          tag="div"
          columns="repeat(auto-fit, minmax(20rem, 1fr))"
          gap="lg"
          class="why-usecases__columns"
        >
          <origam-grid-item
            tag="div"
            class="why-usecases__col"
            data-tone="yes"
          >
            <p class="why-usecases__col-title why-usecases__col-title--yes">
              <origam-icon icon="mdi-check-circle" aria-hidden="true" />
              {{ t('why_origam.use_cases.fits_title', 'origam is a great fit') }}
            </p>

            <ul class="why-usecases__list">
              <li
                v-for="useCase in fits"
                :key="useCase.titleKey"
                class="why-usecases__item"
              >
                <origam-title tag="h3" class="why-usecases__item-title">
                  {{ t(useCase.titleKey, useCase.titleKey) }}
                </origam-title>

                <p class="why-usecases__item-text">
                  {{ t(useCase.descriptionKey, useCase.descriptionKey) }}
                </p>
              </li>
            </ul>
          </origam-grid-item>

          <origam-grid-item
            tag="div"
            class="why-usecases__col"
            data-tone="no"
          >
            <p class="why-usecases__col-title why-usecases__col-title--no">
              <origam-icon icon="mdi-close-circle-outline" aria-hidden="true" />
              {{ t('why_origam.use_cases.no_fits_title', 'origam might not be the right call') }}
            </p>

            <ul class="why-usecases__list">
              <li
                v-for="useCase in noFits"
                :key="useCase.titleKey"
                class="why-usecases__item"
              >
                <origam-title tag="h3" class="why-usecases__item-title">
                  {{ t(useCase.titleKey, useCase.titleKey) }}
                </origam-title>

                <p class="why-usecases__item-text">
                  {{ t(useCase.descriptionKey, useCase.descriptionKey) }}
                </p>
              </li>
            </ul>
          </origam-grid-item>
        </origam-grid>
      </origam-container>
    </section>

    <!-- ─────────────────────────────── CTA ──────────────────────────── -->
    <section
      class="why-cta"
      aria-labelledby="why-cta-title"
      data-cy="why-cta"
    >
      <div class="why-cta__inner">
        <origam-title
          id="why-cta-title"
          tag="h2"
          class="why-cta__title"
        >
          {{ t('why_origam.cta.title', 'Ready to try it?') }}
        </origam-title>

        <p class="why-cta__desc">
          {{ t('why_origam.cta.description', 'Install origam and see how far the defaults take you.') }}
        </p>

        <nav
          class="why-cta__actions"
          :aria-label="t('why_origam.cta.actions_label', 'Try origam')"
        >
          <origam-btn
            class="why-cta__btn why-cta__btn--primary"
            variant="text"
            append-icon="mdi-arrow-right"
            :href="CTA_START_HREF"
            data-cy="why-cta-install"
          >
            {{ t('why_origam.cta.cta_install', 'Get started') }}
          </origam-btn>

          <origam-btn
            class="why-cta__btn why-cta__btn--secondary"
            variant="text"
            prepend-icon="mdi-view-grid-outline"
            href="/components"
            data-cy="why-cta-components"
          >
            {{ t('why_origam.cta.cta_components', 'Browse components') }}
          </origam-btn>

          <origam-btn
            class="why-cta__btn why-cta__btn--secondary"
            variant="text"
            prepend-icon="mdi-palette-swatch-outline"
            href="/theming"
            data-cy="why-cta-theming"
          >
            {{ t('why_origam.cta.cta_theming', 'Open the theme builder') }}
          </origam-btn>
        </nav>
      </div>
    </section>
  </article>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useLocaleHref } from '~/composables/useLocaleHref'
import { useT } from '~/composables/useT'
import {
    WHY_STRENGTHS,
    WHY_WEAKNESSES,
    WHY_USE_CASES
} from '~/consts/why-origam.const'
import { WHY_DEMO_THEMES } from '~/consts/why-origam-demo.const'
import { CTA_START_HREF } from '~/consts/cta.const'

const { t } = useT()
const { localeHref } = useLocaleHref()

const breadcrumbItems = computed(() => [
    { title: t('nav.home', 'Home'), to: localeHref('/') },
    { title: t('nav.sections.introduction', 'Introduction') },
    { title: t('nav.why_origam', 'Why origam?') }
])

useSeoMeta({
    title: () => t('why_origam.meta.title', 'Why origam? · Vue 3 design system'),
    description: () => t('why_origam.meta.description', 'An honest look at origam.'),
    ogTitle: () => t('why_origam.meta.title', 'Why origam? · Vue 3 design system'),
    ogDescription: () => t('why_origam.meta.description', 'An honest look at origam.')
})

const strengths = computed(() => WHY_STRENGTHS)
const weaknesses = computed(() => WHY_WEAKNESSES)
const useCases = computed(() => WHY_USE_CASES)

const fits = computed(() => useCases.value.filter(u => u.fits))
const noFits = computed(() => useCases.value.filter(u => !u.fits))

/**
 * Built as a variable, never inlined as a template-literal directly inside
 * `t(...)` — see the identical comment in `WhyOrigamThemeDemo.vue`
 * (`identityKey`) for why: it keeps `i18n-check.mjs`'s Channel A extractor
 * from capturing a bogus `${themeKey}` placeholder as a missing key.
 */
function identityKey (themeKey: string): string {
    return `why_origam.demo.identity_${themeKey}`
}
</script>

<style scoped lang="scss">
    @use '../assets/scss/why-section' as why;

    .why-section {
        @include why.why-section-header;
    }

    .why-origam {
        display: flex;
        flex-direction: column;
    }

    /* ───────────────────────────────── HERO ─────────────────────────────── */
    .why-hero {
        &__strip {
            --origam-container---max-width: calc(var(--home-container-max) + 2 * var(--site-gutter));
            --site-gutter: var(--home-gutter);

            padding-block-end: var(--origam-space---6, 1.5rem);
        }

        &__actions {
            display: flex;
            flex-wrap: wrap;
            align-items: center;
            gap: var(--origam-space---3, 0.75rem);
        }

        &__identities {
            display: flex;
            flex-wrap: wrap;
            align-items: center;
            gap: var(--origam-space---2, 0.5rem) var(--origam-space---5, 1.25rem);
            inline-size: 100%;
            margin: 0;
            padding: 0;
            list-style: none;
            font-size: var(--origam-font-size---sm, 0.875rem);
            color: var(--origam-color__text---tertiary);
        }

        &__identity {
            display: inline-flex;
            align-items: center;
        }

        &__swatch-wrap {
            display: inline-flex;
            margin-inline-end: var(--origam-space---2, 0.5rem);
        }

        &__swatch {
            inline-size: 0.6rem;
            block-size: 0.6rem;
            border-radius: var(--origam-radius---pill, 9999px);
            background: var(--origam-color__action--primary---bg);
            box-shadow: 0 0 0 1px var(--origam-color__border---default);
        }
    }

    /* ────────────────────────────── STRENGTHS ───────────────────────────── */
    .why-strengths {
        padding-block: var(--origam-space---24, 6rem);

        &__header {
            margin-block-end: var(--origam-space---10, 2.5rem);
        }

        &__board {
            overflow: hidden;
        }

        /*
          Hairline separators without a per-cell border: the grid paints itself
          in the border tone and the 1px gaps are what shows through. No DS
          primitive covers "grid of cells divided by rules" today — reported.

          The track count is EXPLICIT, not `auto-fit`. There are 8 cells, and
          `auto-fit` settled on 3 columns at 1440px, leaving a 9th slot that the
          grid painted in the border tone — a visible hole in the bottom-right
          of the panel. 4 / 2 / 1 all divide 8, so every breakpoint fills.
        */
        &__grid {
            list-style: none;
            margin: 0;
            padding: 0;
            gap: 1px;
            background: var(--origam-color__border---subtle);
            grid-template-columns: repeat(4, minmax(0, 1fr));
        }

        &__cell {
            list-style: none;
            display: flex;
            flex-direction: column;
            align-items: flex-start;
            gap: var(--origam-space---3, 0.75rem);
            padding: var(--origam-space---6, 1.5rem);
            background: var(--origam-color__surface---default);

            &[data-lead='true'] {
                background: var(--origam-color__surface---raised);
            }
        }

        &__cell-title {
            margin: 0;
            --origam-title---font-size: var(--origam-font__size---lg, 1rem);
            font-weight: var(--origam-font__weight---semibold, 600);
            line-height: var(--origam-line-height---tight, 1.25);
            color: var(--origam-color__text---primary);
        }

        &__cell-text {
            margin: 0;
            font-size: var(--origam-font-size---sm, 0.875rem);
            line-height: 1.6;
            color: var(--origam-color__text---secondary);
        }
    }

    @media (max-width: 68rem) {
        .why-strengths__grid {
            grid-template-columns: repeat(2, minmax(0, 1fr));
        }
    }

    @media (max-width: 34rem) {
        .why-strengths__grid {
            grid-template-columns: minmax(0, 1fr);
        }
    }

    /* ───────────────────────────── WEAKNESSES ───────────────────────────── */
    .why-weaknesses-wrap {
        padding-block: var(--origam-space---24, 6rem);
    }

    .why-weaknesses {
        &__header {
            margin-block-end: var(--origam-space---8, 2rem);
        }

        &__list {
            margin: 0;
            padding: 0;
            list-style: none;
            max-inline-size: 52rem;
            border-block-start: 1px solid var(--origam-color__border---subtle);
        }

        &__row {
            display: flex;
            align-items: flex-start;
            gap: var(--origam-space---4, 1rem);
            padding-block: var(--origam-space---5, 1.25rem);
            border-block-end: 1px solid var(--origam-color__border---subtle);
        }

        &__icon {
            flex: none;
            margin-block-start: 0.15em;
            font-size: var(--origam-font-size---lg, 1.125rem);
            /* `fgSubtle` et pas `fg` — meme raison qu'au-dessus (#951). */
            color: var(--origam-color__feedback--warning---fgSubtle);
        }

        &__row-title {
            margin: 0 0 var(--origam-space---1, 0.25rem);
            --origam-title---font-size: var(--origam-font__size---lg, 1rem);
            font-weight: var(--origam-font__weight---semibold, 600);
            color: var(--origam-color__text---primary);
        }

        &__row-text {
            margin: 0;
            font-size: var(--origam-font-size---sm, 0.875rem);
            line-height: 1.6;
            color: var(--origam-color__text---secondary);
        }
    }

    /* ────────────────────────────── USE CASES ───────────────────────────── */
    .why-usecases {
        padding-block: var(--origam-space---24, 6rem);
        background: var(--origam-color__surface---sunken);
        border-block-start: 1px solid var(--origam-color__border---subtle);

        &__header {
            margin-block-end: var(--origam-space---8, 2rem);
        }

        &__col {
            padding-inline-start: var(--origam-space---5, 1.25rem);
            border-inline-start: 2px solid var(--origam-color__border---subtle);

            /* `fgSubtle`, jamais `fg` : `fg` est l'encre posée SUR un aplat (#951). */
            &[data-tone='yes'] {
                border-inline-start-color: var(--origam-color__feedback--success---fgSubtle);
            }
        }

        &__col-title {
            display: flex;
            align-items: center;
            gap: var(--origam-space---2, 0.5rem);
            margin: 0 0 var(--origam-space---5, 1.25rem);
            font-size: var(--origam-font__size---lg, 1rem);
            font-weight: var(--origam-font__weight---semibold, 600);

            &--yes {
                color: var(--origam-color__feedback--success---fgSubtle, #15803d);
            }

            &--no {
                color: var(--origam-color__text---secondary, #525252);
            }
        }

        &__list {
            margin: 0;
            padding: 0;
            list-style: none;
            display: flex;
            flex-direction: column;
            gap: var(--origam-space---5, 1.25rem);
        }

        &__item-title {
            margin: 0 0 var(--origam-space---1, 0.25rem);
            --origam-title---font-size: var(--origam-font-size---sm, 0.875rem);
            font-weight: var(--origam-font__weight---semibold, 600);
            color: var(--origam-color__text---primary);
        }

        &__item-text {
            margin: 0;
            font-size: var(--origam-font-size---sm, 0.875rem);
            line-height: 1.6;
            color: var(--origam-color__text---secondary);
        }
    }

    /* ───────────────────────────────── CTA ──────────────────────────────── */
    .why-cta {
        position: relative;
        padding-block: var(--origam-space---30, 7.5rem);
        padding-inline: var(--origam-space---6, 1.5rem);
        overflow: hidden;

        &::before {
            content: '';
            position: absolute;
            inset-inline: 0;
            inset-block-start: 0;
            block-size: 280px;
            background-image: var(--origam-gradient---cta-glow-top);
            pointer-events: none;
            z-index: 0;
        }

        &__inner {
            position: relative;
            z-index: 1;
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: var(--origam-space---5, 1.25rem);
            /*
              54rem, not 48: the three buttons measure 201 + 265 + 295 px plus
              two 12px gaps = 785, which overflowed a 768px box by 17px and
              dropped the third CTA onto a lonely second line.
            */
            max-inline-size: 54rem;
            margin-inline: auto;
            text-align: center;
        }

        &__title {
            margin: 0;
            font-family: var(--origam-font-family---heading);
            --origam-title---font-size: clamp(2rem, 5.5vw, var(--origam-font-size---cta, 4rem));
            font-weight: var(--origam-font-weight---extrabold, 800);
            letter-spacing: var(--origam-letter-spacing---hero, -0.045em);
            line-height: var(--origam-line-height---hero, 0.95);
            color: var(--origam-color__text---ink, #0a0a0a);
        }

        &__desc {
            margin: 0;
            font-size: var(--origam-font-size---lg, 1.125rem);
            color: var(--origam-color__text---secondary, #525252);
            max-inline-size: 36rem;
        }

        &__actions {
            display: flex;
            flex-wrap: wrap;
            align-items: center;
            justify-content: center;
            gap: var(--origam-space---3, 0.75rem);
            margin-block-start: var(--origam-space---2, 0.5rem);
        }

        /*
          Marketing button tokens are already declared per brand in
          `assets/css/themes/*.css`, so the CTA follows the active identity
          without a second vocabulary.
        */
        &__btn {
            --origam-btn---height: 52px;
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
                --origam-btn---density-padding-x: var(--origam-space---4, 1rem);
            }
        }
    }

    @media (max-width: 768px) {
        .why-section {
            &__title {
                font-size: clamp(1.75rem, 7vw, 3rem);
            }
        }

        .why-cta {
            &__title {
                --origam-title---font-size: clamp(2rem, 8vw, 4rem);
            }
        }

        .why-usecases {
            &__columns {
                grid-template-columns: 1fr;
            }
        }
    }
</style>
