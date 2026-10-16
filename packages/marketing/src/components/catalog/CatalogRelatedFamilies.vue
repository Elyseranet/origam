<template>
  <aside
    v-if="hasRelated"
    :aria-labelledby="titleId"
    data-cy="catalog-related"
  >
    <origam-container>
      <origam-title
        :id="titleId"
        tag="h2"
      >
        <template #default>
          {{ t('catalog_nav.related_title', 'Same subject in the other families') }}
        </template>
      </origam-title>

      <origam-grid
        tag="ul"
        :columns="1"
        :gap="0"
        border-block-end
        :border-block-end-color="CATALOG_RELATED_RULE_COLOR"
      >
        <origam-row
          v-for="group in groups"
          :key="group.kind"
          tag="li"
          gutters="none"
          border-block-start
          :border-block-start-color="CATALOG_RELATED_RULE_COLOR"
          padding-block="4"
          :data-cy="`catalog-related-group-${group.kind}`"
        >
          <origam-col
            cols="12"
            md="3"
          >
            <origam-title
              :id="group.labelId"
              tag="h3"
              font-size="sm"
              font-weight="semibold"
            >
              <template #default>
                {{ group.label }}
              </template>
            </origam-title>
            <origam-chip
              size="x-small"
              :text="group.count"
              :data-cy="`catalog-related-count-${group.kind}`"
            />
          </origam-col>

          <origam-col
            cols="12"
            md="9"
          >
            <origam-grid
              :id="group.listId"
              tag="ul"
              columns="repeat(auto-fill, minmax(12rem, 1fr))"
              gap="xs"
              :aria-labelledby="group.labelId"
              :data-cy="`catalog-related-list-${group.kind}`"
            >
              <origam-grid-item
                v-for="entry in group.entries"
                v-show="entry.isShown"
                :key="entry.slug"
                tag="li"
              >
                <origam-list-item
                  :href="entry.href"
                  :title="entry.name"
                  density="compact"
                  rounded="sm"
                  color="primary"
                  font-size="sm"
                  :data-cy="`catalog-related-link-${group.kind}-${entry.slug}`"
                />
              </origam-grid-item>
            </origam-grid>

            <origam-btn
              v-if="group.isCollapsible"
              variant="text"
              size="small"
              :border="false"
              :elevation="0"
              :append-icon="group.toggleIcon"
              :aria-expanded="group.isOpen"
              :aria-controls="group.listId"
              :data-cy="`catalog-related-toggle-${group.kind}`"
              @click="handleToggle(group.kind)"
            >
              <template #default>
                {{ group.toggleLabel }}
              </template>
            </origam-btn>
          </origam-col>
        </origam-row>
      </origam-grid>
    </origam-container>
  </aside>
</template>

<script setup lang="ts">
import { useCatalogRelatedFamilies } from '~/composables/useCatalogRelatedFamilies'
import { useT } from '~/composables/useT'

import { CATALOG_RELATED_RULE_COLOR } from '~/consts/catalog-detail-nav.const'

import type { ICatalogDetailNavEmits, ICatalogDetailNavProps, ICatalogDetailNavSlots } from '~/interfaces/catalog-detail-nav.interface'
import type { TReferenceKind } from '~/types/api-reference.type'

const props = defineProps<ICatalogDetailNavProps>()

defineEmits<ICatalogDetailNavEmits>()

defineSlots<ICatalogDetailNavSlots>()

/*********************************************************
 * Données
 *
 * @description
 * Une ligne par famille liée (piste B validée, #1172) : libellé et compteur
 * à gauche, liens à droite. Au-delà de `CATALOG_RELATED_LIMIT` entrées la
 * ligne se replie ; les entrées repliées restent dans le DOM (`v-show`).
 ********************************************************/
const { t } = useT()

const { titleId, groups, hasRelated, toggle } = useCatalogRelatedFamilies(props)

/*********************************************************
 * Repli
 *
 * @description
 * Le bouton « Show all N » déplie ou replie sa ligne.
 ********************************************************/
const handleToggle = (kind: TReferenceKind) => {
    toggle(kind)
}

/*********************************************************
 * Expose
 *
 * @description
 * Rien à piloter depuis le parent.
 ********************************************************/
defineExpose({})
</script>
