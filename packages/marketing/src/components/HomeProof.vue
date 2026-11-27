<template>
  <section
    class="home-proof home-section"
    aria-labelledby="proof-title"
  >
    <origam-container
      class="home-proof__inner home-container"
      max-width="none"
    >
      <header class="home-proof__header">
        <enso-section-title id="proof-title">
          {{ t('home.proof.title', 'What the repository lets you verify') }}
        </enso-section-title>

        <p class="home-proof__intro">
          {{ t('home.proof.intro', 'Figures measured in the code, at every release.') }}
        </p>
      </header>

      <origam-grid
        tag="ul"
        columns="repeat(auto-fit, minmax(min(100%, 22rem), 1fr))"
        gap="md"
        class="home-proof__list"
      >
        <origam-grid-item
          v-for="item in HOME_PROOF_ITEMS"
          :key="item.key"
          tag="li"
          class="home-proof__item"
          :data-cy="`proof-${item.key}`"
        >
          <strong
            class="home-proof__value"
            data-cy="proof-value"
          >{{ item.value }}</strong>

          <span class="home-proof__label">{{ t(item.labelKey, item.labelFallback) }}</span>

          <span class="home-proof__definition">{{ t(item.definitionKey, item.definitionFallback) }}</span>
        </origam-grid-item>
      </origam-grid>
    </origam-container>
  </section>
</template>

<script setup lang="ts">
import { useT } from '~/composables/useT'
import { HOME_PROOF_ITEMS } from '~/consts/home-proof.const'

/*********************************************************
 * Global
 *
 * @description
 * Section « preuves » sous le hero (#1545) : chaque valeur vient de
 * BUILD_STATS, mesuré dans le dépôt au build ; chaque libellé porte sa
 * définition écrite, pour qu'un chiffre ne se lise jamais sans sa règle de
 * comptage.
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
.home-proof {

    &__header {
        display: flex;
        flex-direction: column;
        gap: var(--origam-space---2, 0.5rem);
        margin-block-end: var(--origam-space---8, 2rem);
    }

    &__intro {
        margin: 0;
        font-size: var(--home-fs-body);
        color: var(--origam-color__text---secondary);
    }

    &__list {
        margin: 0;
        padding: 0;
        list-style: none;
    }

    &__item {
        display: flex;
        flex-direction: column;
        gap: var(--origam-space---1, 0.25rem);
        padding-block-start: var(--origam-space---4, 1rem);
        border-block-start: 2px solid var(--origam-color__action--primary---bg);
    }

    &__value {
        font-size: var(--home-fs-h1-sentence);
        font-weight: var(--origam-font__weight---bold, 700);
        line-height: 1;
        color: var(--origam-color__text---primary);
        font-variant-numeric: tabular-nums;
    }

    &__label {
        font-size: var(--home-fs-body);
        font-weight: var(--origam-font__weight---semibold, 600);
        color: var(--origam-color__text---primary);
    }

    &__definition {
        font-size: var(--home-fs-small);
        line-height: 1.5;
        color: var(--origam-color__text---secondary);
    }
}
</style>
