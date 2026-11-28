<template>
  <article
    class="catalog-index"
    :data-cy="`page-${dataCy}`"
  >
    <enso-page-header
      family="catalog"
      :title-id="titleId"
    >
      <template #breadcrumb>
        <origam-breadcrumb
          :items="breadcrumbItems"
          divider="/"
          :border="0"
          :data-cy="`${dataCy}-breadcrumb`"
        />
      </template>

      <template #eyebrow>
        <span :data-cy="`${dataCy}-hero-badge`">{{ t('nav.sections.features', 'Features') }}</span>
      </template>

      <template #title>
        {{ title }}
      </template>

      <template #intro>
        {{ intro }}
      </template>
    </enso-page-header>

    <origam-container class="catalog-index__body home-container">
      <slot name="default" />

      <div
        class="catalog-index__groups"
        :data-cy="`${dataCy}-grid`"
      >
        <slot name="groups" />
      </div>
    </origam-container>
  </article>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useLocaleHref } from '~/composables/useLocaleHref'
import { useT } from '~/composables/useT'
import type { ICatalogIndexLayoutProps, ICatalogIndexLayoutSlots } from '~/interfaces/catalog-index.interface'

/*********************************************************
 * Props, emits & slots
 *
 * @description
 * Gabarit commun des 8 index du catalogue (#1585) : en-tête « Vallée » de la
 * famille `catalog`, puis le corps. Aucun décor au milieu des grilles : le
 * paysage vit dans l'en-tête et nulle part ailleurs. Le texte arrive déjà
 * traduit, la page garde ses clés `t('…', '…')` littérales.
 ********************************************************/
const props = defineProps<ICatalogIndexLayoutProps>()

defineEmits([])

defineSlots<ICatalogIndexLayoutSlots>()

/*********************************************************
 * Fil d'Ariane
 *
 * @description
 * Accueil / Fonctionnalités / page courante : les huit index vivent tous
 * dans la section « Fonctionnalités » de la navigation (`nav.const.ts`).
 ********************************************************/
const { t } = useT()
const { localeHref } = useLocaleHref()

const breadcrumbItems = computed(() => [
    { title: t('nav.home', 'Home'), to: localeHref('/') },
    { title: t('nav.sections.features', 'Features') },
    { title: props.current }
])

/*********************************************************
 * Expose
 *
 * @description
 * Rien à piloter depuis l'extérieur.
 ********************************************************/
defineExpose({})
</script>

<style scoped lang="scss">
.catalog-index {
    display: flex;
    flex-direction: column;

    &__body {
        --site-gutter: var(--home-gutter);
        --origam-container---max-width: calc(var(--home-container-max) + 2 * var(--site-gutter));

        display: grid;
        gap: 56px;
        padding-block: 0 var(--origam-space---24, 6rem);
    }

    &__groups {
        display: grid;
        gap: 56px;
    }
}
</style>
