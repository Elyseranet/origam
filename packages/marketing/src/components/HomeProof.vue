<template>
  <section
    class="home-proof home-section"
    aria-labelledby="proof-title"
  >
    <origam-container
      class="home-proof__inner home-container"
      max-width="none"
    >
      <div class="home-proof__cols">
        <header class="home-proof__lead">
          <p class="home-eyebrow">
            {{ t('home.proof.eyebrow', 'Measured in the code') }}
          </p>

          <enso-section-title id="proof-title">
            {{ t('home.proof.title', 'What the repository lets you verify') }}
          </enso-section-title>

          <p class="home-proof__intro">
            {{ t('home.proof.intro', 'Figures measured in the code, at every release.') }}
          </p>

          <div
            class="home-proof__seal"
            :data-cy="`proof-${sealItem.key}`"
          >
            <div
              class="home-proof__ring"
              :style="sealVars"
            >
              <strong
                class="home-proof__seal-value"
                data-cy="proof-value"
              >{{ sealItem.value }}</strong>
            </div>

            <span class="home-proof__seal-label home-proof__label">{{ t(sealItem.labelKey, sealItem.labelFallback) }}</span>

            <span class="home-proof__source home-proof__definition">{{ t(sealItem.definitionKey, sealItem.definitionFallback) }}</span>
          </div>
        </header>

        <origam-list
          class="home-proof__ledger"
          :aria-label="t('home.proof.title', 'What the repository lets you verify')"
        >
          <origam-list-item
            v-for="item in ledgerItems"
            :key="item.key"
            class="home-proof__item"
            :data-cy="`proof-${item.key}`"
          >
            <template #default>
              <strong
                class="home-proof__value"
                data-cy="proof-value"
              >{{ item.value }}</strong>

              <span class="home-proof__text">
                <span class="home-proof__label">{{ t(item.labelKey, item.labelFallback) }}</span>

                <span class="home-proof__source home-proof__definition">{{ t(item.definitionKey, item.definitionFallback) }}</span>
              </span>
            </template>
          </origam-list-item>
        </origam-list>
      </div>
    </origam-container>
  </section>
</template>

<script setup lang="ts">
import { useT } from '~/composables/useT'
import { ENSO_SEAL } from '~/consts/enso.const'
import { HOME_PROOF_LEDGER_ITEMS, HOME_PROOF_SEAL_ITEM, HOME_PROOF_SEAL_WIDTH } from '~/consts/home-proof.const'
import { ensoImageSet } from '~/utils/enso.util'

/*********************************************************
 * Global
 *
 * @description
 * Section « preuves » sous le hero (#1545, piste A #1594) : chaque valeur
 * vient de BUILD_STATS, mesuré dans le dépôt au build ; chaque libellé porte
 * sa définition écrite, pour qu'un chiffre ne se lise jamais sans sa règle de
 * comptage. Le chiffre des familles est tenu dans le vide de l'enso, les cinq
 * autres forment le registre.
 ********************************************************/
const { t } = useT()

defineEmits([])

defineSlots<Record<string, never>>()

/*********************************************************
 * Sceau & registre
 *
 * @description
 * L'enso est un fond CSS décoratif : le « 97 » reste du vrai texte, placé par
 * container query dans le vide du cercle.
 ********************************************************/
const sealItem = HOME_PROOF_SEAL_ITEM
const ledgerItems = HOME_PROOF_LEDGER_ITEMS
const sealVars = { '--home-proof-seal': ensoImageSet(ENSO_SEAL, HOME_PROOF_SEAL_WIDTH) }

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
    padding-block-end: 150px;

    &__cols {
        display: grid;
        grid-template-columns: minmax(0, 5fr) minmax(0, 7fr);
        gap: 40px 72px;
        align-items: center;
    }

    &__lead {
        display: flex;
        flex-direction: column;
        align-items: flex-start;
        min-inline-size: 0;
    }

    &__intro {
        margin: var(--origam-space---3, 0.75rem) 0 0;
        font-size: var(--home-fs-body);
        color: var(--origam-color__text---secondary);
    }

    &__seal {
        display: grid;
        justify-items: start;
        gap: 6px;
        margin-block-start: 36px;
        inline-size: min(340px, 100%);
    }

    &__ring {
        container-type: inline-size;
        display: grid;
        place-items: center;
        inline-size: 100%;
        aspect-ratio: 1;
        background: var(--home-proof-seal) center / contain no-repeat;
    }

    &__seal-value {
        font-size: 25cqi;
        font-weight: var(--origam-font__weight---bold, 700);
        letter-spacing: -0.05em;
        line-height: 1;
        font-variant-numeric: tabular-nums;
        color: var(--origam-color__text---primary);
        transform: translate(-4%, 2%);
    }

    &__seal-label {
        font-size: 20px;
    }

    &__label {
        font-weight: var(--origam-font__weight---semibold, 600);
        color: var(--origam-color__text---primary);
    }

    &__source {
        display: block;
        margin-block-start: 4px;
        font: 12.5px/1.5 ui-monospace, 'SF Mono', Menlo, monospace;
        color: var(--origam-color__text---secondary);
        overflow-wrap: anywhere;
    }

    &__ledger {
        padding: 0;
    }

    &__item {
        min-block-size: 0;
        padding: 0;
        border-block-start: 1px solid color-mix(in srgb, var(--origam-color__action--primary---bg) 30%, transparent);

        &:first-child {
            border-block-start: 0;
        }

        :deep(.origam-list-item__content) {
            display: grid;
            grid-template-columns: 9.5rem minmax(0, 1fr);
            gap: 24px;
            align-items: baseline;
            padding-block: 18px;
        }
    }

    &__value {
        font-size: clamp(2.4rem, 4.2vw, 3.4rem);
        font-weight: var(--origam-font__weight---bold, 700);
        letter-spacing: -0.04em;
        line-height: 1;
        font-variant-numeric: tabular-nums;
        color: var(--origam-color__text---primary);
    }

    &__text {
        display: block;
        min-inline-size: 0;
        font-size: 17px;

        .home-proof__source {
            font-size: inherit;
            font-weight: var(--origam-font__weight---semibold, 600);
        }
    }
}

@media (max-width: 768px) {
    .home-proof__cols {
        grid-template-columns: minmax(0, 1fr);
    }
}

@media (max-width: 479px) {
    .home-proof__item :deep(.origam-list-item__content) {
        grid-template-columns: 6.5rem minmax(0, 1fr);
        gap: 16px;
    }
}
</style>
