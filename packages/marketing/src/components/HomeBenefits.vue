<template>
  <section
    class="home-benefits home-container home-section"
    :aria-label="t('home.benefits.label', 'Why Origam')"
  >
    <enso-divider class="home-benefits__divider" />

    <origam-row
      tag="ul"
      class="home-benefits__grid"
    >
      <origam-col
        v-for="benefit in BENEFITS"
        :key="benefit.titleKey"
        tag="li"
        cols="12"
        sm="6"
        md="3"
        class="home-benefits__item"
        data-cy="benefit-item"
      >
        <origam-icon
          :icon="benefit.icon"
          color="primary"
          :size="48"
          aria-hidden="true"
        />

        <origam-title
          tag="h2"
          class="home-benefits__title"
        >
          {{ t(benefit.titleKey, benefit.titleKey) }}
        </origam-title>

        <p class="home-benefits__description">
          {{ t(benefit.descriptionKey, benefit.descriptionKey) }}
        </p>
      </origam-col>
    </origam-row>
  </section>
</template>

<script setup lang="ts">
import { useT } from '~/composables/useT'
import { BENEFITS } from '~/consts/benefits.const'

/*********************************************************
 * Global
 *
 * @description
 * Bande de 4 bénéfices de la maquette A, pilotée par BENEFITS.
 ********************************************************/
const { t } = useT()

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
.home-benefits {
    &__divider {
        --enso-divider---max-width: 16rem;

        margin-block-end: var(--origam-space---8, 2rem);
    }

    &__grid {
        list-style: none;
        margin: 0;
        padding: 0;
    }

    &__item {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: var(--origam-space---2, 0.5rem);
        text-align: center;

        // Icône → titre : 12 px (cible audit ≈ 14, cran de token le plus proche) ; titre → texte : 8 px.
        > .origam-icon {
            margin-block-end: var(--origam-space---1, 0.25rem);
        }
    }

    &__title {
        margin: 0;
        font-size: var(--home-fs-h3);
        font-weight: var(--origam-font__weight---bold, 700);
    }

    &__description {
        margin: 0;
        max-inline-size: 15rem;
        font-size: var(--home-fs-small);
        line-height: 1.5;
        color: var(--origam-color__text---secondary);
    }
}
</style>
