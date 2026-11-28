<template>
  <catalog-index-layout
    :title="pageTitle"
    :intro="t('consts.hero.subtitle', 'Every SCREAMING_SNAKE_CASE constant exported by origam. Fully documented with definitions, values and cross-references to the parts of the DS that use them.')"
    :current="t('nav.consts', 'Constants')"
    title-id="consts-title"
    data-cy="consts"
  >
    <catalog-index-tools
      v-model="searchQuery"
      :placeholder="t('consts.hero.search_placeholder', 'Search constants…')"
      :label="t('consts.hero.search_label', 'Filter constants by name or category')"
      :count="countLabel"
      :jump-label="t('catalog_index.jump_label', 'Categories')"
      :anchors="anchors"
      data-cy="consts"
    />

    <catalog-index-empty
      v-if="isFiltering && filteredCount === 0"
      :title="t('consts.catalog.empty_title', 'No constants found')"
      :description="emptyDescription"
      data-cy="consts-empty"
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
          :to="`/consts/${entry.slug}`"
          :name="entry.name"
          :description="t(entry.descriptionKey, entry.descriptionFallback)"
          :data-cy="`consts-card-${entry.slug}`"
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
import type { IConstEntry } from '~/interfaces/consts-catalog.interface'

const { t } = useT()

useSeoMeta({
    title: () => t('consts.meta.title', 'Constants · origam design system'),
    description: () => t('consts.meta.description', 'Browse the SCREAMING_SNAKE_CASE constants exported by origam. Click any constant to see its definition, values and the parts of the DS that use it.'),
    ogTitle: () => t('consts.meta.title', 'Constants · origam design system'),
    ogDescription: () => t('consts.meta.description', 'Constants exported across the origam design system.')
})

const { data: catalogData } = await useReferenceCatalog<IConstEntry>('const')

const constsCatalog = computed<IConstEntry[]>(() => catalogData.value ?? [])

const { data: catsData } = await useReferenceCategories('const')
const constsCategories = computed<string[]>(() => catsData.value ?? [])

const searchQuery = ref('')

const filteredEntries = computed(() => {
    const query = searchQuery.value.toLowerCase().trim()
    if (!query) return constsCatalog.value
    return constsCatalog.value.filter(entry => {
        const nameMatch = entry.name.toLowerCase().includes(query)
        const categoryMatch = entry.category.toLowerCase().includes(query)
        const descMatch = entry.descriptionFallback.toLowerCase().includes(query)
        return nameMatch || categoryMatch || descMatch
    })
})

const groupedByCategory = computed(() =>
    constsCategories.value.map(category => ({
        category,
        entries: filteredEntries.value.filter(e => e.category === category)
    })).filter(group => group.entries.length > 0)
)

const totalCount = computed(() => constsCatalog.value.length)
const filteredCount = computed(() => filteredEntries.value.length)
const isFiltering = computed(() => searchQuery.value.trim().length > 0)

/*********************************************************
 * En-tête et outils
 *
 * @description
 * Les textes existent déjà (`consts.hero.*`) : le gabarit commun les reçoit
 * traduits. La ligne de compte est composée ici, comme l'ancien en-tête.
 ********************************************************/
const pageTitle = computed(() => `${t('consts.hero.title_line1', 'API')} ${t('consts.hero.title_line2', 'constants.')}`)

const emptyDescription = computed(() => t('consts.catalog.empty_desc', 'No constant matches "{query}". Try a different term.', { query: searchQuery.value }))

const countLabel = computed(() => isFiltering.value
    ? `${filteredCount.value} ${t('consts.hero.count_filtered_of', 'of')} ${totalCount.value} ${t('consts.hero.count_filtered_match', 'constants match')}`
    : `${totalCount.value} ${t('consts.hero.count_total', 'constants across')} ${constsCategories.value.length} ${t('consts.hero.count_categories', 'categories')}`)

/*********************************************************
 * Ancres
 *
 * @description
 * Une puce par groupe affiché ; l'identifiant sert aussi de cible au groupe.
 ********************************************************/
const groupId = (label: string) => catalogGroupId('consts-category', label)

const anchors = computed(() => groupedByCategory.value.map(group => ({ id: groupId(group.category), label: group.category })))
</script>
