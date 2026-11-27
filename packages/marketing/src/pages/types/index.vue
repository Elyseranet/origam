<template>
  <catalog-index-layout
    :title="pageTitle"
    :intro="t('types.hero.subtitle', 'Every TypeScript type and enum used across origam props. Fully documented with definitions, accepted values and cross-references to the components that use them.')"
    :current="t('nav.types', 'Types')"
    title-id="types-title"
    data-cy="types"
  >
    <catalog-index-tools
      v-model="searchQuery"
      :placeholder="t('types.hero.search_placeholder', 'Search types…')"
      :label="t('types.hero.search_label', 'Filter types by name or category')"
      :count="countLabel"
      :jump-label="t('catalog_index.jump_label', 'Categories')"
      :anchors="anchors"
      data-cy="types"
    />

    <catalog-index-empty
      v-if="isFiltering && filteredCount === 0"
      :title="t('types.catalog.empty_title', 'No types found')"
      :description="emptyDescription"
      data-cy="types-empty"
    />

    <template #groups>
      <catalog-group
        v-for="group in groupedByCategory"
        :id="groupId(group.category)"
        :key="group.category"
        :title="group.category"
        :count="group.entries.length"
      >
        <catalog-card
          v-for="entry in group.entries"
          :key="entry.slug"
          :to="`/types/${entry.slug}`"
          :name="entry.name"
          :description="t(entry.descriptionKey, entry.descriptionFallback)"
          :data-cy="`types-card-${entry.slug}`"
        >
          <template #meta>
            <origam-chip
              :color="kindColor(entry)"
              size="x-small"
              variant="tonal"
              pill
            >
              {{ kindLabel(entry) }}
            </origam-chip>
          </template>
        </catalog-card>
      </catalog-group>
    </template>
  </catalog-index-layout>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { useT } from '~/composables/useT'
import { catalogGroupId } from '~/utils/catalog-index.util'
import { useReferenceCatalog, useReferenceCategories } from '~/composables/useApiReference'
import type { ITypeEntry } from '~/interfaces/types-catalog.interface'

const { t } = useT()

useSeoMeta({
    title: () => t('types.meta.title', 'API Types · origam design system'),
    description: () => t('types.meta.description', 'Browse TypeScript types and enums used across origam props. Click any type to see its definition, values and the components that use it.'),
    ogTitle: () => t('types.meta.title', 'API Types · origam design system'),
    ogDescription: () => t('types.meta.description', 'TypeScript types and enums used across origam props.')
})

const { data: catalogData } = await useReferenceCatalog<ITypeEntry>('type')

const typesCatalog = computed<ITypeEntry[]>(() => catalogData.value ?? [])

const { data: catsData } = await useReferenceCategories('type')
const typesCategories = computed<string[]>(() => catsData.value ?? [])

const searchQuery = ref('')

const filteredEntries = computed(() => {
    const query = searchQuery.value.toLowerCase().trim()
    if (!query) return typesCatalog.value
    return typesCatalog.value.filter(entry => {
        const nameMatch = entry.name.toLowerCase().includes(query)
        const categoryMatch = entry.category.toLowerCase().includes(query)
        const descMatch = entry.descriptionFallback.toLowerCase().includes(query)
        const kindMatch = entry.kind.toLowerCase().includes(query)
        return nameMatch || categoryMatch || descMatch || kindMatch
    })
})

const groupedByCategory = computed(() =>
    typesCategories.value.map(category => ({
        category,
        entries: filteredEntries.value.filter(e => e.category === category)
    })).filter(group => group.entries.length > 0)
)

const totalCount = computed(() => typesCatalog.value.length)
const filteredCount = computed(() => filteredEntries.value.length)
const isFiltering = computed(() => searchQuery.value.trim().length > 0)

/*********************************************************
 * Puce de nature
 *
 * @description
 * Un `enum` et un `type` se distinguent par la couleur et le libellé de la puce.
 ********************************************************/
const kindColor = (entry: ITypeEntry) => (entry.kind === 'enum' ? 'secondary' : 'primary')
const kindLabel = (entry: ITypeEntry) => (entry.kind === 'enum' ? t('types.kind.enum', 'enum') : t('types.kind.type', 'type'))

/*********************************************************
 * En-tête et outils
 *
 * @description
 * Les textes existent déjà (`types.hero.*`) : le gabarit commun les reçoit
 * traduits. La ligne de compte est composée ici, comme l'ancien en-tête.
 ********************************************************/
const pageTitle = computed(() => `${t('types.hero.title_line1', 'API')} ${t('types.hero.title_line2', 'types.')}`)

const emptyDescription = computed(() => t('types.catalog.empty_desc', 'No type matches "{query}". Try a different term.', { query: searchQuery.value }))

const countLabel = computed(() => isFiltering.value
    ? `${filteredCount.value} ${t('types.hero.count_filtered_of', 'of')} ${totalCount.value} ${t('types.hero.count_filtered_match', 'types match')}`
    : `${totalCount.value} ${t('types.hero.count_total', 'types and enums across')} ${typesCategories.value.length} ${t('types.hero.count_categories', 'categories')}`)

/*********************************************************
 * Ancres
 *
 * @description
 * Une puce par groupe affiché ; l'identifiant sert aussi de cible au groupe.
 ********************************************************/
const groupId = (label: string) => catalogGroupId('types-category', label)

const anchors = computed(() => groupedByCategory.value.map(group => ({ id: groupId(group.category), label: group.category })))
</script>
