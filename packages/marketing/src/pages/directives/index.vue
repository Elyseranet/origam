<template>
  <catalog-index-layout
    :title="pageTitle"
    :intro="t('directives.hero.subtitle', 'Six runtime directives that extend any Vue template. From click-outside detection to ripple effects, swipe gestures, viewport tracking, hover classes, and WCAG contrast enforcement.')"
    :current="t('nav.directives', 'Directives')"
    title-id="directives-title"
    data-cy="directives"
  >
    <catalog-index-tools
      v-model="searchQuery"
      :placeholder="t('directives.hero.search_placeholder', 'Search directives…')"
      :label="t('directives.hero.search_label', 'Filter directives by name')"
      :count="countLabel"
      :jump-label="t('catalog_index.jump_label', 'Categories')"
      :anchors="anchors"
      data-cy="directives"
    />

    <catalog-index-empty
      v-if="isFiltering && filteredCount === 0"
      :title="t('directives.catalog.empty_title', 'No directives found')"
      :description="emptyDescription"
      data-cy="directives-empty"
    />

    <template #groups>
      <catalog-group>
        <catalog-card
          v-for="entry in filteredDirectives"
          :key="entry.slug"
          :to="`/directives/${entry.slug}`"
          :name="entry.name"
          :description="t(entry.descriptionKey, entry.descriptionFallback)"
          :data-cy="`directive-card-${entry.slug}`"
        />
      </catalog-group>
    </template>
  </catalog-index-layout>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { useT } from '~/composables/useT'
import { useReferenceCatalog } from '~/composables/useApiReference'
import type { IDirectiveEntry } from '~/interfaces/directives-catalog.interface'

const { t } = useT()

useSeoMeta({
    title: () => t('directives.meta.title', 'Directives · origam design system'),
    description: () => t('directives.meta.description', 'Six runtime directives that extend Vue templates with click-outside detection, contrast enforcement, hover classes, intersection tracking, ripple effects, and touch/swipe gestures.'),
    ogTitle: () => t('directives.meta.title', 'Directives · origam design system'),
    ogDescription: () => t('directives.meta.description', 'Six runtime directives that extend Vue templates with click-outside detection, contrast enforcement, hover classes, intersection tracking, ripple effects, and touch/swipe gestures.')
})

const { data: catalogData } = await useReferenceCatalog<IDirectiveEntry>('directive')

const directivesCatalog = computed<IDirectiveEntry[]>(() => catalogData.value ?? [])

const searchQuery = ref('')

const filteredDirectives = computed(() => {
    const query = searchQuery.value.toLowerCase().trim()
    if (!query) return directivesCatalog.value
    return directivesCatalog.value.filter(entry => {
        const nameMatch = entry.name.toLowerCase().includes(query)
        const descMatch = entry.descriptionFallback.toLowerCase().includes(query)
        return nameMatch || descMatch
    })
})

const totalCount = computed(() => directivesCatalog.value.length)
const filteredCount = computed(() => filteredDirectives.value.length)
const isFiltering = computed(() => searchQuery.value.trim().length > 0)

/*********************************************************
 * En-tête et outils
 *
 * @description
 * Les textes existent déjà (`directives.hero.*`) : le gabarit commun les reçoit
 * traduits. La ligne de compte est composée ici, comme l'ancien en-tête.
 ********************************************************/
const pageTitle = computed(() => `${t('directives.hero.title_line1', 'Template')} ${t('directives.hero.title_line2', 'directives.')}`)

const emptyDescription = computed(() => t('directives.catalog.empty_desc', 'No directive matches "{query}". Try a different term.', { query: searchQuery.value }))

const countLabel = computed(() => isFiltering.value
    ? `${filteredCount.value} ${t('directives.hero.count_filtered_of', 'of')} ${totalCount.value} ${t('directives.hero.count_filtered_match', 'directives match')}`
    : `${totalCount.value} ${t('directives.hero.count_total', 'directives — globally registered')}`)

const anchors = computed(() => [])
</script>
