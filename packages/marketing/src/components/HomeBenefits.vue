<template>
  <section
    class="home-benefits"
    :aria-label="t('home.benefits.label', 'Why Origam')"
  >
    <div class="home-container">
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
          <span class="home-benefits__tile">
            <origam-icon
              :icon="benefit.icon"
              color="primary"
              :size="20"
              aria-hidden="true"
            />
          </span>

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
    </div>
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
    position: relative;
    isolation: isolate;
    overflow-x: clip;
    padding-block: 40px 0;
    background-color: var(--origam-color__surface---overlay);

    // T1 (chiffres -> benefices) : lavis CSS seul, trois efflorescences inegales qui finissent pleines.
    &::before {
        content: '';
        position: absolute;
        z-index: -1;
        inset-inline: 0;
        inset-block-start: -200px;
        block-size: 201px;
        pointer-events: none;
        background:
            radial-gradient(ellipse 34% 75% at 14% 100%, var(--origam-color__surface---overlay) 35%, transparent 72%),
            radial-gradient(ellipse 44% 95% at 62% 100%, var(--origam-color__surface---overlay) 30%, transparent 75%),
            radial-gradient(ellipse 26% 60% at 93% 100%, var(--origam-color__surface---overlay) 35%, transparent 72%),
            linear-gradient(to bottom, transparent 20%, var(--origam-color__surface---overlay));
    }

    &__grid {
        list-style: none;
        margin: 0;
        padding: 0;
    }

    // Tuile d'icône, titre et texte : valeurs relevées dans la maquette v12.
    &__item {
        display: flex;
        flex-direction: column;
        align-items: center;
        text-align: center;
    }

    &__tile {
        display: grid;
        place-items: center;
        inline-size: 40px;
        block-size: 40px;
        margin-block-end: var(--origam-space---3, 0.75rem);
        border: 1px solid var(--origam-color__border---subtle);
        border-radius: var(--origam-radius---lg, 12px);
        background-color: var(--origam-color__surface---raised);
    }

    &__title {
        margin: 0;
        font-size: var(--origam-font__size---xl, 1.125rem);
        font-weight: var(--origam-font__weight---semibold, 600);
    }

    &__description {
        margin: var(--origam-space---1, 0.25rem) 0 0;
        font-size: var(--origam-font__size---md, 0.875rem);
        line-height: 1.6;
        color: var(--origam-color__text---secondary);
    }
}

@media (max-width: 768px) {
    .home-benefits::before {
        inset-block-start: -140px;
        block-size: 141px;
    }
}
</style>
