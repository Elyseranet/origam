<template>
  <header
    class="enso-page-header"
    :class="`enso-page-header--${family}`"
    :data-family="family"
    data-cy="enso-page-header"
  >
    <origam-parallax
      class="enso-page-header__art"
      origin="page-top"
      easing="ease-out"
      aria-hidden="true"
      data-cy="page-header-art"
    >
      <origam-parallax-layer
        v-for="plane in planes"
        :key="plane.key"
        class="enso-page-header__layer"
        :speed="plane.speed"
        :data-cy="`page-header-plane-${plane.key}`"
      >
        <div
          class="enso-page-header__plane"
          :class="plane.classes"
          :style="plane.style"
        />
      </origam-parallax-layer>
    </origam-parallax>

    <origam-container class="enso-page-header__inner home-container">
      <div class="enso-page-header__copy">
        <div
          v-if="hasBreadcrumb"
          class="enso-page-header__crumbs"
          data-cy="page-header-breadcrumb"
        >
          <slot name="breadcrumb" />
        </div>

        <p
          v-if="hasEyebrow"
          class="enso-page-header__eyebrow home-eyebrow"
          data-cy="page-header-eyebrow"
        >
          <slot name="eyebrow" />
        </p>

        <origam-title
          :id="headingId"
          tag="h1"
          class="enso-page-header__title"
          data-cy="page-header-title"
        >
          <slot name="title" />
        </origam-title>

        <p
          v-if="hasIntro"
          class="enso-page-header__intro"
          data-cy="page-header-intro"
        >
          <slot name="intro" />
        </p>

        <slot name="default" />
      </div>
    </origam-container>
  </header>
</template>

<script setup lang="ts">
import { computed, useId } from 'vue'
import { ensoPageHeaderPlaneViews } from '~/utils/enso.util'
import type { IEnsoPageHeaderProps, IEnsoPageHeaderSlots } from '~/interfaces/enso.interface'

/*********************************************************
 * Props, emits & slots
 *
 * @description
 * En-tête commun « Vallée » des pages secondaires (#1584) : fil d'Ariane
 * (slot), eyebrow à marque dorée, h1, intro, et un petit paysage du kit à
 * droite, choisi par `family` dans un jeu fermé. Le texte vit dans les slots
 * (la page traduit, le composant ne porte aucune chaîne). Fond = celui de la
 * page : l'en-tête n'est pas un bloc coloré.
 ********************************************************/
const props = withDefaults(defineProps<IEnsoPageHeaderProps>(), {
    titleId: undefined
})

defineEmits([])

const slots = defineSlots<IEnsoPageHeaderSlots>()

/*********************************************************
 * Texte
 *
 * @description
 * Les trois slots optionnels ne rendent leur conteneur que s'ils sont fournis.
 * L'`id` du h1 sert au `aria-labelledby` de la page.
 ********************************************************/
const generatedId = useId()
const headingId = computed(() => props.titleId ?? `page-header-title-${generatedId}`)
const hasBreadcrumb = computed(() => Boolean(slots.breadcrumb))
const hasEyebrow = computed(() => Boolean(slots.eyebrow))
const hasIntro = computed(() => Boolean(slots.intro))

/*********************************************************
 * Décor
 *
 * @description
 * Les plans de la famille, posés chacun dans une `OrigamParallaxLayer` :
 * légère parallaxe au défilement, sans pointeur. `origin="page-top"` mesure
 * depuis le haut de page (décalage nul au repos, rendu serveur identique) ;
 * `easing="ease-out"` choisit le chemin JS du DS, qui ne pose aucune classe
 * côté client seulement (pas de mismatch d'hydratation). Figé sous
 * `prefers-reduced-motion` par le DS.
 ********************************************************/
const planes = computed(() => ensoPageHeaderPlaneViews(props.family))

/*********************************************************
 * Expose
 *
 * @description
 * Rien à piloter depuis l'extérieur.
 ********************************************************/
defineExpose({})
</script>

<style scoped lang="scss">
.enso-page-header {
    --site-gutter: var(--home-gutter);
    --enso-page-header---fade: var(--origam-color__neutral---950);

    position: relative;
    isolation: isolate;
    overflow: clip;

    &__inner {
        --origam-container---max-width: calc(var(--home-container-max) + 2 * var(--site-gutter));

        position: relative;
        padding-block: 30px 60px;
    }

    &__copy {
        display: grid;
        gap: 14px;
        max-inline-size: min(600px, 52%);
    }

    &__crumbs {
        font-size: 13.5px;
        color: var(--origam-color__text---source);

        --origam-breadcrumb---padding-block: 0;
        --origam-breadcrumb---padding-inline: 0;

        :deep(.origam-breadcrumb-item) {
            --origam-breadcrumb-item---padding-block-start: 0;
            --origam-breadcrumb-item---padding-block-end: 0;
            --origam-breadcrumb-item---padding-inline-start: 0;
            --origam-breadcrumb-item---padding-inline-end: 0;
        }

        :deep([aria-current='page']) {
            font-weight: 600;
            color: var(--origam-color__text---primary);
        }
    }

    &__eyebrow {
        margin: 0;
    }

    &__title {
        margin: 0;
        font-size: clamp(2.1rem, 4.2vw, 3.3rem);
        font-weight: 700;
        line-height: 1.1;
        letter-spacing: -0.03em;
        text-wrap: balance;
        color: var(--origam-color__text---primary);
    }

    &__intro {
        margin: 0;
        max-inline-size: 56ch;
        font-size: 16.5px;
        line-height: 1.6;
        color: var(--origam-color__text---source);
    }

    &__art {
        position: absolute;
        inset-block: 0;
        inset-inline: 54% 0;
        z-index: -1;
        pointer-events: none;
        mask-image:
            linear-gradient(to right, transparent, var(--enso-page-header---fade) 30%),
            linear-gradient(var(--enso-page-header---fade) 55%, transparent);
        mask-composite: intersect;
        -webkit-mask-image:
            linear-gradient(to right, transparent, var(--enso-page-header---fade) 30%),
            linear-gradient(var(--enso-page-header---fade) 55%, transparent);
        -webkit-mask-composite: source-in;
    }

    &__layer {
        pointer-events: none;
    }

    &__plane {
        position: absolute;
        inset-inline-start: 0;
        inline-size: 100%;
        aspect-ratio: var(--enso-art-ratio);
        background: var(--enso-art) center / 100% 100% no-repeat;

        &--back {
            inset-block-end: 30px;
            opacity: 0.9;
        }

        &--front {
            inset-block-end: -30px;
        }
    }

    &--tool &__plane--back {
        inset-inline: auto 8%;
        inline-size: min(18vw, 240px);
        inset-block-end: 0;
    }

    &--legal &__plane--back {
        opacity: 0.45;
    }
}

@media (max-width: 860px) {
    .enso-page-header {
        &__inner {
            padding-block-end: 130px;
        }

        &__copy {
            max-inline-size: none;
        }

        &__art {
            inset-inline: 0;
            mask-image: linear-gradient(transparent 45%, var(--enso-page-header---fade) 70%, transparent);
            -webkit-mask-image: linear-gradient(transparent 45%, var(--enso-page-header---fade) 70%, transparent);
            mask-composite: add;
            -webkit-mask-composite: source-over;
        }

        &__plane {
            inset-inline-start: 50%;
            inline-size: auto;
            block-size: 110px;
            translate: -50% 0;

            &--back {
                inset-block-end: 0;
            }

            &--front {
                inset-block-end: -40px;
            }
        }

        &--tool &__plane--back {
            inset-inline: auto 4%;
            inline-size: auto;
            translate: none;
        }
    }
}

@media (prefers-reduced-motion: no-preference) {
    .enso-page-header__plane {
        animation: enso-page-header-in 0.9s cubic-bezier(0.2, 0.7, 0.2, 1) both;
    }

    @keyframes enso-page-header-in {
        from {
            opacity: 0;
        }
    }
}
</style>
