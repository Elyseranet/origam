<template>
  <section
    class="home-cta"
    :style="skyStyle"
    :aria-labelledby="titleId"
  >
    <origam-parallax
      class="home-cta__scene"
      easing="ease-out"
      aria-hidden="true"
      data-cy="cta-scene"
    >
      <origam-parallax-layer
        v-for="plane in planes"
        :key="plane.key"
        class="home-cta__layer"
        :speed="plane.speed"
        :data-cy="`cta-plane-${plane.key}`"
      >
        <div
          class="home-cta__plane"
          :class="plane.classes"
          :style="plane.style"
        />
      </origam-parallax-layer>
    </origam-parallax>

    <div class="home-cta__copy">
      <origam-title
        :id="titleId"
        tag="h2"
        class="home-cta__title"
        data-cy="cta-title"
      >
        {{ heading }}
      </origam-title>

      <p
        class="home-cta__description"
        data-cy="cta-description"
      >
        {{ body }}
      </p>

      <nav
        class="home-cta__actions"
        :aria-label="actionsAria"
      >
        <origam-btn
          v-for="(action, index) in actions"
          :key="action.key"
          v-bind="CTA_BTN"
          class="home-cta__btn"
          :class="{ 'home-cta__btn--line': index > 0 }"
          :variant="index === 0 ? 'flat' : 'outlined'"
          :bg-color="index === 0 ? CTA_SUN_COLOR : undefined"
          :color="index === 0 ? CTA_INK_COLOR : CTA_LINE_COLOR"
          :href="action.localized ? localeHref(action.href) : action.href"
          :target="action.external ? '_blank' : undefined"
          :rel="action.external ? 'noopener noreferrer' : undefined"
          :data-cy="action.dataCy"
        >
          {{ t(action.labelKey, action.labelFallback) }}
        </origam-btn>
      </nav>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useLocaleHref } from '~/composables/useLocaleHref'
import { useT } from '~/composables/useT'
import { CTA_BTN, CTA_HOME_ACTIONS, CTA_INK_COLOR, CTA_LINE_COLOR, CTA_SUN_COLOR, CTA_SURFACE_BG } from '~/consts/cta.const'
import type { ICtaProps } from '~/interfaces/cta.interface'
import { ctaPlaneViews } from '~/utils/enso.util'

/*********************************************************
 * Props, emits & slots
 *
 * @description
 * Bande finale « Crépuscule » (#1596) : pleine largeur, sans carte ni pinceau.
 * Le ciel descend de la couleur de la thématisation vers le violet profond ;
 * trois plans de paysage montent du bas ; le texte est centré dans le ciel, là
 * où aucun plan ne passe. Elle suit le mode du site (`data-mode`).
 *
 * Sans prop, c'est la bande de la home. Une page éditoriale (#1587) la reprend avec
 * son titre, sa description et ses boutons, et `surface` : le fond de la section qui
 * la précède, d'où le ciel part. Le premier bouton est l'action principale.
 ********************************************************/
const props = withDefaults(defineProps<ICtaProps>(), {
    title: undefined,
    description: undefined,
    actionsLabel: undefined,
    surface: undefined,
    titleId: 'cta-title',
    actions: () => CTA_HOME_ACTIONS
})

defineEmits([])

defineSlots<Record<string, never>>()

const { t } = useT()
const { localeHref } = useLocaleHref()

/*********************************************************
 * Plans
 *
 * @description
 * Les plans de `CTA_PLANES` avec leurs variables CSS (`--enso-art-*`), statiques.
 * Chacun est posé dans une `OrigamParallaxLayer` : le défilement les déplace à
 * leur vitesse, sans pointeur (le CTA ne réagit pas à la souris). `easing="ease-out"`
 * choisit le chemin JS du DS : le chemin CSS (`linear`) anime aussi l'axe X, et pose
 * sa classe `--css-driven` côté client seulement (hydration mismatch).
 ********************************************************/
const planes = ctaPlaneViews()

/*********************************************************
 * Texte & ciel
 *
 * @description
 * Les textes de la home sont le repli des props. `skyStyle` ne pose rien sans `surface`
 * (le ciel garde alors les fonds de la feuille, clair ET sombre).
 ********************************************************/
const heading = computed(() => props.title ?? t('home.cta.title', 'Ready to build your interfaces?'))
const body = computed(() => props.description ?? t('home.cta.description', 'npm i origam, then the plugin and a first component. On Nuxt, one module to add.'))
const actionsAria = computed(() => props.actionsLabel ?? t('home.cta.actions_label', 'Get started'))
const skyStyle = computed(() => (props.surface ? { '--home-cta-bg': CTA_SURFACE_BG[props.surface] } : undefined))

/*********************************************************
 * Expose
 *
 * @description
 * Rien à piloter depuis l'extérieur.
 ********************************************************/
defineExpose({})
</script>

<style scoped lang="scss">
.home-cta {
    --home-cta-bg: var(--origam-color__surface---sunken);
    --home-cta-deep-start: var(--origam-color__brand-deep---start);
    --home-cta-deep-end: var(--origam-color__brand-deep---end);
    --home-cta-sky:
        var(--home-cta-bg) 0,
        var(--home-cta-bg) 24%,
        color-mix(in srgb, var(--home-cta-bg) 92%, var(--origam-color__primary---800)) 40%,
        color-mix(in srgb, var(--home-cta-bg) 58%, var(--origam-color__primary---700)) 54%,
        color-mix(in srgb, var(--origam-color__primary---400) 82%, var(--home-cta-deep-start)) 66%,
        color-mix(in srgb, var(--origam-color__primary---500) 48%, var(--home-cta-deep-start)) 78%,
        var(--home-cta-deep-start) 88%,
        var(--home-cta-deep-end) 100%;
    --home-cta-line: var(--origam-color__primary---600);
    --home-cta-ink: var(--origam-color__brand-deep---ink);
    --home-cta-foreground-filter: brightness(0.55) saturate(1.1);

    position: relative;
    isolation: isolate;
    display: flex;
    flex-direction: column;
    overflow: clip;
    min-block-size: 50rem;
    background: linear-gradient(180deg, var(--home-cta-sky));
    color: var(--origam-color__text---primary);

    &::after {
        content: '';
        position: absolute;
        inset: auto 0 0;
        block-size: 13.75rem;
        pointer-events: none;
        background: linear-gradient(
            color-mix(in srgb, var(--home-cta-deep-end) 0%, transparent),
            color-mix(in srgb, var(--home-cta-deep-end) 35%, transparent) 35%,
            color-mix(in srgb, var(--home-cta-deep-end) 80%, transparent) 70%,
            var(--home-cta-deep-end) 100%
        );
    }

    .home-cta__scene {
        position: absolute;
        inset: 0;
        pointer-events: none;
    }

    &__layer {
        pointer-events: none;
    }

    &__plane {
        position: absolute;
        inset-inline-start: -3%;
        inline-size: 106%;
        aspect-ratio: var(--enso-art-ratio);
        background: var(--enso-art) center / 100% 100% no-repeat;

        &--mountains {
            inset-block-end: 10px;
            opacity: 0.6;
        }

        &--ridge {
            inset-block-end: -40px;
            opacity: 0.85;
        }

        &--foreground {
            inset-block-end: -200px;
            filter: var(--home-cta-foreground-filter);
        }
    }

    &__copy {
        position: relative;
        z-index: 1;
        display: grid;
        justify-items: center;
        gap: 22px;
        inline-size: 100%;
        margin-block-end: auto;
        padding: 72px var(--site-gutter) 0;
        text-align: center;
    }

    &__title {
        margin: 0;
        max-inline-size: 18ch;
        font-size: var(--home-fs-h2-cta);
        text-wrap: balance;
        color: var(--origam-color__text---primary);
    }

    &__description {
        margin: 0;
        max-inline-size: 46ch;
        font-size: 16.5px;
        line-height: 1.6;
        color: var(--origam-color__text---primary);
    }

    &__actions {
        display: flex;
        flex-wrap: wrap;
        justify-content: center;
        gap: 12px;

        .home-cta__btn {
            --origam-btn---min-height: 48px;
            --origam-btn---font-size: 15px;
            --origam-btn---border-radius: 10px;
        }

        .home-cta__btn--line {
            --origam-btn---border-color: var(--home-cta-line);
            --origam-btn---border-width: 1.5px;
        }
    }
}

@media (max-width: 48rem) {
    .home-cta {
        min-block-size: 52.5rem;

        &__copy {
            padding-block-start: 56px;
        }

        &__plane {
            inset-inline-start: 50%;
            inline-size: auto;
            translate: -50% 0;

            &--mountains {
                block-size: 220px;
                inset-block-end: 100px;
            }

            &--ridge {
                block-size: 170px;
                inset-block-end: 20px;
            }

            &--foreground {
                block-size: 300px;
                inset-block-end: -120px;
            }
        }
    }
}
</style>

<style lang="scss">
@mixin dark-tokens {
    --home-cta-bg: var(--origam-color__surface---overlay);
    --home-cta-sky:
        var(--home-cta-bg) 0,
        var(--home-cta-bg) 26%,
        color-mix(in srgb, var(--origam-color__surface---overlay) 85%, var(--origam-color__primary---800)) 42%,
        color-mix(in srgb, var(--origam-color__primary---900) 82%, var(--origam-color__primary---800)) 58%,
        var(--home-cta-deep-start) 76%,
        var(--home-cta-deep-end) 100%;
    --home-cta-line: var(--origam-color__primary---500);
    --home-cta-foreground-filter: none;
    --home-cta-ink: var(--origam-color__surface---default);
}

:root[data-mode='dark'] .home-cta {
    @include dark-tokens;
}

@media (prefers-color-scheme: dark) {
    :root:not([data-mode]) .home-cta {
        @include dark-tokens;
    }
}
</style>
