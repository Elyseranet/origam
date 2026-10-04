<template>
  <section
    id="kpis"
    class="home-kpis"
    aria-labelledby="kpis-title"
  >
    <h2
      id="kpis-title"
      class="home-kpis__title sr-only"
    >
      {{ t('home.kpis.title', 'origam by the numbers') }}
    </h2>

    <origam-divider
      color="var(--origam-color__border---default)"
      :style="KPIS_RULE_VARS"
      data-cy="kpis-rule-top"
    />

    <origam-grid
      tag="dl"
      :columns="KPIS_GRID_COLUMNS"
      gap="lg"
      class="home-kpis__list"
    >
      <div
        v-for="kpi in KPIS"
        :key="kpi.valueKey"
        class="home-kpis__item"
      >
        <dt class="home-kpis__label">
          {{ t(kpi.labelKey, kpi.labelFallback) }}
        </dt>
        <dd class="home-kpis__value">
          {{ t(kpi.valueKey, kpi.valueFallback) }}
        </dd>
      </div>
    </origam-grid>

    <origam-divider
      color="var(--origam-color__border---default)"
      :style="KPIS_RULE_VARS"
      data-cy="kpis-rule-bottom"
    />
  </section>
</template>

<script setup lang="ts">
import { useT } from '~/composables/useT'
import { KPIS, KPIS_GRID_COLUMNS, KPIS_RULE_VARS } from '~/consts/kpis.const'

const { t } = useT()
</script>

<style scoped lang="scss">
.home-kpis {
    padding-block: var(--origam-space---10, 2.5rem);
    padding-inline: var(--origam-space---6, 1.5rem);

    &__list {
        margin: 0;
        padding-block: var(--origam-space---10, 2.5rem);
        padding-inline: 0;
        text-align: center;
    }

    &__item {
        display: flex;
        flex-direction: column-reverse;
        align-items: center;
        gap: var(--origam-space---2, 0.5rem);
    }

    &__value {
        margin: 0;
        background: var(--origam-gradient---kpi-value);
        -webkit-background-clip: text;
        background-clip: text;
        -webkit-text-fill-color: transparent;
        color: transparent;
        line-height: 1;
        font-weight: var(--origam-font-weight---extrabold, 800);
        letter-spacing: var(--origam-letter-spacing---hero, -0.045em);
        font-size: 2.5rem;
    }

    &__label {
        margin: 0;
        font-size: var(--origam-font-size---xs, 0.75rem);
        font-weight: var(--origam-font__weight---medium, 500);
        color: var(--origam-color__text---secondary, #525252);
        text-transform: uppercase;
        letter-spacing: 0.08em;
    }
}

.sr-only {
    position: absolute;
    width: 1px;
    height: 1px;
    padding: 0;
    margin: -1px;
    overflow: hidden;
    clip: rect(0, 0, 0, 0);
    white-space: nowrap;
    border: 0;
}
</style>
