<template>
  <section
    class="home-benefits"
    :aria-label="t('home.benefits.label', 'Why Origam')"
  >
    <origam-container class="home-benefits__inner">
      <ul class="home-benefits__grid">
        <li
          v-for="benefit in BENEFITS"
          :key="benefit.titleKey"
          class="home-benefits__item"
          data-cy="benefit-item"
        >
          <origam-icon
            :icon="benefit.icon"
            color="primary"
            :size="40"
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
        </li>
      </ul>
    </origam-container>
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
    padding-block: var(--origam-space---12, 3rem);

    &__grid {
        list-style: none;
        margin: 0;
        padding: 0;
        display: grid;
        grid-template-columns: repeat(4, minmax(0, 1fr));
        gap: var(--origam-space---8, 2rem);

        @media (max-width: 63.9375rem) {
            grid-template-columns: repeat(2, minmax(0, 1fr));
        }

        @media (max-width: 39.9375rem) {
            grid-template-columns: minmax(0, 1fr);
        }
    }

    &__item {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: var(--origam-space---2, 0.5rem);
        text-align: center;
    }

    &__title {
        margin: 0;
        font-size: var(--origam-font__size---lg, 1.125rem);
        font-weight: var(--origam-font__weight---semibold, 600);
    }

    &__description {
        margin: 0;
        max-inline-size: 16rem;
        font-size: var(--origam-font__size---sm, 0.875rem);
        line-height: 1.5;
        color: var(--origam-color__text---secondary);
    }
}
</style>
