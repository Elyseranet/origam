<script setup lang="ts">
import { computed, ref } from 'vue'
import { MDI_ICONS } from 'origam/enums'
import { useT } from '~/composables/useT'
import { useReferenceCatalog } from '~/composables/useApiReference'
import type { TReferenceKind } from '~/composables/useApiReference'

definePageMeta({ layout: 'admin', middleware: 'admin' })

const { t } = useT()
const route = useRoute()

const kind = computed<TReferenceKind>(() => route.params.kind as TReferenceKind)

useSeoMeta({
    title: computed(() => `${kind.value} · Admin`),
    robots: 'noindex,nofollow',
})

const KIND_LABELS: Record<string, string> = {
    component: 'Components',
    composable: 'Composables',
    const: 'Consts',
    directive: 'Directives',
    enum: 'Enums',
    interface: 'Interfaces',
    type: 'Types',
    util: 'Utils',
}

const kindLabel = computed(() => KIND_LABELS[kind.value] ?? kind.value)

const { data: entries, status } = await useReferenceCatalog<Record<string, any>>(kind.value)

const searchQuery = ref('')

const filteredEntries = computed(() => {
    const all = entries.value ?? []
    const q = searchQuery.value.toLowerCase().trim()
    if (!q) return all
    return all.filter(e =>
        e.name?.toLowerCase().includes(q) ||
        e.slug?.toLowerCase().includes(q) ||
        e.category?.toLowerCase().includes(q),
    )
})

const headers = computed(() => [
    { key: 'name', title: t('admin.list.col_name', 'Name'), sortable: true },
    { key: 'category', title: t('admin.list.col_category', 'Category'), sortable: true },
    { key: 'icon', title: t('admin.list.col_icon', 'Icon') },
    { key: 'edited', title: t('admin.list.col_edited', 'Edited') },
    { key: 'actions', title: '', sortable: false },
])
</script>

<template>
    <article
        class="admin-list"
        :data-cy="`admin-list-${kind}`"
    >
        <header class="admin-list__header">
            <div class="admin-list__heading">
                <origam-title
                    tag="h1"
                    class="admin-list__title"
                >
                    {{ kindLabel }}
                </origam-title>

                <origam-chip
                    size="small"
                    pill
                    class="admin-list__count"
                >
                    {{ filteredEntries.length }}
                </origam-chip>
            </div>

            <origam-text-field
                v-model="searchQuery"
                class="admin-list__search"
                :prepend-inner-icon="MDI_ICONS.MAGNIFY"
                :placeholder="t('admin.list.search_placeholder', 'Search…')"
                :aria-label="t('admin.list.search_label', 'Filter entries')"
                clearable
                rounded="lg"
                variant="outlined"
                density="compact"
                data-cy="admin-list-search"
            />
        </header>

        <div
            v-if="status === 'pending'"
            class="admin-list__loading"
            role="status"
            :aria-label="t('admin.list.loading', 'Loading…')"
        >
            <origam-progress-linear
                indeterminate
                color="primary"
            />
        </div>

        <div
            v-else-if="filteredEntries.length === 0"
            class="admin-list__empty"
            role="status"
        >
            <p class="admin-list__empty-text">
                {{ t('admin.list.empty', 'No entries found.') }}
            </p>
        </div>

        <origam-data-table
            v-else
            :headers="headers"
            :items="filteredEntries"
            item-value="slug"
            class="admin-list__table"
            data-cy="admin-list-table"
        >
            <template #item.name="{ item }">
                <span class="admin-list__cell-name">{{ item.name }}</span>
            </template>

            <template #item.category="{ item }">
                <origam-chip
                    v-if="item.category"
                    size="x-small"
                    pill
                    class="admin-list__category-chip"
                >
                    {{ item.category }}
                </origam-chip>
                <span
                    v-else
                    class="admin-list__cell-empty"
                >—</span>
            </template>

            <template #item.icon="{ item }">
                <origam-icon
                    v-if="item.icon"
                    :icon="item.icon"
                    size="20"
                    aria-hidden="true"
                    class="admin-list__icon-preview"
                />
                <span
                    v-else
                    class="admin-list__cell-empty"
                >—</span>
            </template>

            <template #item.edited="{ item }">
                <origam-chip
                    v-if="item.editedByUser"
                    size="x-small"
                    color="primary"
                    pill
                >
                    {{ t('admin.list.edited_badge', 'Edited') }}
                </origam-chip>
            </template>

            <template #item.actions="{ item }">
                <origam-btn
                    variant="text"
                    :prepend-icon="MDI_ICONS.PENCIL"
                    size="small"
                    :to="`/admin/${kind}/${item.slug}`"
                    :aria-label="`${t('admin.list.edit_action', 'Edit')} ${item.name}`"
                    :data-cy="`admin-list-edit-${item.slug}`"
                >
                    {{ t('admin.list.edit_action', 'Edit') }}
                </origam-btn>
            </template>
        </origam-data-table>
    </article>
</template>

<style scoped lang="scss">
.admin-list {
    display: flex;
    flex-direction: column;
    gap: var(--origam-space---4, 1rem);

    &__header {
        display: flex;
        flex-wrap: wrap;
        align-items: center;
        gap: var(--origam-space---3, 0.75rem);
        justify-content: space-between;
    }

    &__heading {
        display: flex;
        align-items: center;
        gap: var(--origam-space---2, 0.5rem);
    }

    &__title {
        --origam-title---font-size: var(--origam-font-size---xl, 1.5rem);
        --origam-title---font-weight: 700;
        margin: 0;
    }

    &__count {
        --origam-chip---background-color: var(--origam-color__surface---sunken, #f5f5f5);
    }

    &__search {
        inline-size: 280px;
    }

    &__loading {
        padding-block: var(--origam-space---4, 1rem);
    }

    &__empty {
        padding-block: var(--origam-space---10, 2.5rem);
        text-align: center;
    }

    &__empty-text {
        margin: 0;
        color: var(--origam-color__text---secondary, #525252);
        font-size: var(--origam-font-size---sm, 0.875rem);
    }

    &__cell-name {
        font-weight: 600;
        font-family: var(--origam-font__family---mono, monospace);
        font-size: var(--origam-font-size---sm, 0.875rem);
    }

    &__cell-empty {
        color: var(--origam-color__text---tertiary, #737373);
    }

    &__category-chip {
        --origam-chip---background-color: var(--origam-color__surface---sunken, #f5f5f5);
    }

    &__icon-preview {
        color: var(--origam-color__text---secondary, #525252);
    }
}
</style>
