<template>
  <catalog-index-layout
    :title="pageTitle"
    :intro="t('interfaces.hero.subtitle', 'Every prop interface used across origam components. Fully documented with definitions, properties, extends chains and cross-references to the components that use them.')"
    :current="t('nav.interfaces', 'Interfaces')"
    title-id="interfaces-title"
    data-cy="interfaces"
  >
    <catalog-index-tools
      v-model="searchQuery"
      :placeholder="t('interfaces.hero.search_placeholder', 'Search interfaces…')"
      :label="t('interfaces.hero.search_label', 'Filter interfaces by name or category')"
      :count="countLabel"
      :jump-label="t('catalog_index.jump_label', 'Categories')"
      :anchors="anchors"
      data-cy="interfaces"
    />

    <catalog-index-empty
      v-if="isFiltering && filteredCount === 0"
      :title="t('interfaces.catalog.empty_title', 'No interfaces found')"
      :description="emptyDescription"
      data-cy="interfaces-empty"
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
          :to="`/interfaces/${entry.slug}`"
          :name="entry.name"
          :description="t(entry.descriptionKey, entry.descriptionFallback)"
          :data-cy="`interfaces-card-${entry.slug}`"
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
import type { IInterfaceEntry } from '~/interfaces/interfaces-catalog.interface'

const { t } = useT()

useSeoMeta({
    title: () => t('interfaces.meta.title', 'API Interfaces · origam design system'),
    description: () => t('interfaces.meta.description', 'Browse TypeScript prop interfaces used across origam components. Click any interface to see its definition, properties and the components that use it.'),
    ogTitle: () => t('interfaces.meta.title', 'API Interfaces · origam design system'),
    ogDescription: () => t('interfaces.meta.description', 'TypeScript prop interfaces used across origam components.')
})

const { data: catalogData } = await useReferenceCatalog<IInterfaceEntry>('interface')

const interfacesCatalog = computed<IInterfaceEntry[]>(() => catalogData.value ?? [])

const { data: catsData } = await useReferenceCategories('interface')
const interfacesCategories = computed<string[]>(() => catsData.value ?? [])

const searchQuery = ref('')

const filteredEntries = computed(() => {
    const query = searchQuery.value.toLowerCase().trim()
    if (!query) return interfacesCatalog.value
    return interfacesCatalog.value.filter(entry => {
        const nameMatch = entry.name.toLowerCase().includes(query)
        const categoryMatch = entry.category.toLowerCase().includes(query)
        const descMatch = entry.descriptionFallback.toLowerCase().includes(query)
        return nameMatch || categoryMatch || descMatch
    })
})

const groupedByCategory = computed(() =>
    interfacesCategories.value.map(category => ({
        category,
        entries: filteredEntries.value.filter(e => e.category === category)
    })).filter(group => group.entries.length > 0)
)

const totalCount = computed(() => interfacesCatalog.value.length)
const filteredCount = computed(() => filteredEntries.value.length)
const isFiltering = computed(() => searchQuery.value.trim().length > 0)

/*********************************************************
 * En-tête et outils
 *
 * @description
 * Les textes existent déjà (`interfaces.hero.*`) : le gabarit commun les reçoit
 * traduits. La ligne de compte est composée ici, comme l'ancien en-tête.
 ********************************************************/
const pageTitle = computed(() => `${t('interfaces.hero.title_line1', 'API')} ${t('interfaces.hero.title_line2', 'interfaces.')}`)

const emptyDescription = computed(() => t('interfaces.catalog.empty_desc', 'No interface matches "{query}". Try a different term.', { query: searchQuery.value }))

const countLabel = computed(() => isFiltering.value
    ? `${filteredCount.value} ${t('interfaces.hero.count_filtered_of', 'of')} ${totalCount.value} ${t('interfaces.hero.count_filtered_match', 'interfaces match')}`
    : `${totalCount.value} ${t('interfaces.hero.count_total', 'interfaces across')} ${interfacesCategories.value.length} ${t('interfaces.hero.count_categories', 'categories')}`)

/*********************************************************
 * Ancres
 *
 * @description
 * Une puce par groupe affiché ; l'identifiant sert aussi de cible au groupe.
 ********************************************************/
const groupId = (label: string) => catalogGroupId('interfaces-category', label)

const anchors = computed(() => groupedByCategory.value.map(group => ({ id: groupId(group.category), label: group.category })))
</script>
