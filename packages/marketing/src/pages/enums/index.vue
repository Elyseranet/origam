<template>
  <catalog-index-layout
    :title="pageTitle"
    :intro="t('enums.hero.subtitle', 'Every TypeScript enum used across origam props. Fully documented with definitions, members and cross-references to the components that use them.')"
    :current="t('nav.enums', 'Enums')"
    title-id="enums-title"
    data-cy="enums"
  >
    <catalog-index-tools
      v-model="searchQuery"
      :placeholder="t('enums.hero.search_placeholder', 'Search enums…')"
      :label="t('enums.hero.search_label', 'Filter enums by name or category')"
      :count="countLabel"
      :jump-label="t('catalog_index.jump_label', 'Categories')"
      :anchors="anchors"
      data-cy="enums"
    />

    <catalog-index-empty
      v-if="isFiltering && filteredCount === 0"
      :title="t('enums.catalog.empty_title', 'No enums found')"
      :description="emptyDescription"
      data-cy="enums-empty"
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
          :to="`/enums/${entry.slug}`"
          :name="entry.name"
          :description="t(entry.descriptionKey, entry.descriptionFallback)"
          :data-cy="`enums-card-${entry.slug}`"
        />
      </catalog-group>
    </template>
  </catalog-index-layout>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { useT } from '~/composables/useT'
import { catalogGroupId } from '~/utils/catalog-index.util'
import { useReferenceCatalog, useReferenceCategories } from '~/composables/useApiReference'
import type { IEnumEntry } from '~/interfaces/enums-catalog.interface'

const { t } = useT()

useSeoMeta({
    title: () => t('enums.meta.title', 'API Enums · origam design system'),
    description: () => t('enums.meta.description', 'Browse TypeScript enums used across origam props. Click any enum to see its definition, members and the components that use it.'),
    ogTitle: () => t('enums.meta.title', 'API Enums · origam design system'),
    ogDescription: () => t('enums.meta.description', 'TypeScript enums used across origam props.')
})

const { data: catalogData } = await useReferenceCatalog<IEnumEntry>('enum')

const enumsCatalog = computed<IEnumEntry[]>(() => catalogData.value ?? [])

const { data: catsData } = await useReferenceCategories('enum')
const enumsCategories = computed<string[]>(() => catsData.value ?? [])

const searchQuery = ref('')

const filteredEntries = computed(() => {
    const query = searchQuery.value.toLowerCase().trim()
    if (!query) return enumsCatalog.value
    return enumsCatalog.value.filter(entry => {
        const nameMatch = entry.name.toLowerCase().includes(query)
        const categoryMatch = entry.category.toLowerCase().includes(query)
        const descMatch = entry.descriptionFallback.toLowerCase().includes(query)
        return nameMatch || categoryMatch || descMatch
    })
})

const groupedByCategory = computed(() =>
    enumsCategories.value.map(category => ({
        category,
        entries: filteredEntries.value.filter(e => e.category === category)
    })).filter(group => group.entries.length > 0)
)

const totalCount = computed(() => enumsCatalog.value.length)
const filteredCount = computed(() => filteredEntries.value.length)
const isFiltering = computed(() => searchQuery.value.trim().length > 0)

/*********************************************************
 * En-tête et outils
 *
 * @description
 * Les textes existent déjà (`enums.hero.*`) : le gabarit commun les reçoit
 * traduits. La ligne de compte est composée ici, comme l'ancien en-tête.
 ********************************************************/
const pageTitle = computed(() => `${t('enums.hero.title_line1', 'API')} ${t('enums.hero.title_line2', 'enums.')}`)

const emptyDescription = computed(() => t('enums.catalog.empty_desc', 'No enum matches "{query}". Try a different term.', { query: searchQuery.value }))

const countLabel = computed(() => isFiltering.value
    ? `${filteredCount.value} ${t('enums.hero.count_filtered_of', 'of')} ${totalCount.value} ${t('enums.hero.count_filtered_match', 'enums match')}`
    : `${totalCount.value} ${t('enums.hero.count_total', 'enums across')} ${enumsCategories.value.length} ${t('enums.hero.count_categories', 'categories')}`)

/*********************************************************
 * Ancres
 *
 * @description
 * Une puce par groupe affiché ; l'identifiant sert aussi de cible au groupe.
 ********************************************************/
const groupId = (label: string) => catalogGroupId('enums-category', label)

const anchors = computed(() => groupedByCategory.value.map(group => ({ id: groupId(group.category), label: group.category })))
</script>
