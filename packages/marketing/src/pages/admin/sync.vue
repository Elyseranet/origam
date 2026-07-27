<script setup lang="ts">
import { ref, computed } from 'vue'
import { MDI_ICONS } from 'origam/enums'
import { useT } from '~/composables/useT'
import { useAdminReference } from '~/composables/useAdminReference'
import type { IAdminSyncRun, IAdminSyncResult } from '~/interfaces/admin.interface'

definePageMeta({ layout: 'admin', middleware: 'admin' })

useSeoMeta({
    title: 'Sync · Admin',
    robots: 'noindex,nofollow',
})

const { t } = useT()
const { triggerSync, getSyncRuns } = useAdminReference()

const syncing = ref(false)
const syncResult = ref<IAdminSyncResult | null>(null)
const syncError = ref<string | null>(null)

const runs = ref<IAdminSyncRun[]>([])
const loadingRuns = ref(false)

async function loadRuns () {
    loadingRuns.value = true
    runs.value = await getSyncRuns(20)
    loadingRuns.value = false
}

await loadRuns()

async function handleSync () {
    if (syncing.value) return
    syncing.value = true
    syncResult.value = null
    syncError.value = null

    const res = await triggerSync()
    syncing.value = false

    if (res.ok && res.result) {
        syncResult.value = res.result
        await loadRuns()
    } else {
        syncError.value = res.error ?? 'server_error'
    }
}

function formatDate (iso: string | null): string {
    if (!iso) return '—'
    return new Date(iso).toLocaleString('en-GB', {
        dateStyle: 'short',
        timeStyle: 'medium',
    })
}

const statusColor = (status: string) => {
    if (status === 'success') return 'success'
    if (status === 'failed') return 'danger'
    return 'primary'
}

const statusLabel = (status: string) => {
    if (status === 'success') return t('admin.sync.status_success', 'Success')
    if (status === 'failed') return t('admin.sync.status_failed', 'Failed')
    return t('admin.sync.status_running', 'Running')
}

const tableHeaders = computed(() => [
    { key: 'started_at', title: t('admin.sync.col_started', 'Started'), sortable: true },
    { key: 'finished_at', title: t('admin.sync.col_finished', 'Finished') },
    { key: 'status', title: t('admin.sync.col_status', 'Status') },
    { key: 'created_count', title: t('admin.sync.col_created', 'Created') },
    { key: 'updated_count', title: t('admin.sync.col_updated', 'Updated') },
    { key: 'unchanged_count', title: t('admin.sync.col_unchanged', 'Unchanged') },
    { key: 'orphaned_count', title: t('admin.sync.col_orphaned', 'Orphaned') },
    { key: 'source_commit', title: t('admin.sync.col_commit', 'Commit') },
])
</script>

<template>
    <article
        class="admin-sync"
        data-cy="admin-sync"
    >
        <header class="admin-sync__header">
            <origam-title
                tag="h1"
                class="admin-sync__title"
            >
                {{ t('admin.sync.title', 'Sync') }}
            </origam-title>

            <p class="admin-sync__subtitle">
                {{ t('admin.sync.subtitle', 'Trigger a re-sync from the DS source and view recent sync history.') }}
            </p>
        </header>

        <origam-card
            rounded="lg"
            class="admin-sync__trigger-card"
        >
            <template #default>
                <div class="admin-sync__trigger-inner">
                    <div class="admin-sync__trigger-info">
                        <origam-icon
                            :icon="MDI_ICONS.SYNC"
                            class="admin-sync__trigger-icon"
                            aria-hidden="true"
                        />

                        <div>
                            <origam-title
                                tag="h2"
                                class="admin-sync__trigger-title"
                            >
                                {{ t('admin.sync.trigger_title', 'Re-sync from source') }}
                            </origam-title>

                            <p class="admin-sync__trigger-desc">
                                {{ t('admin.sync.trigger_desc', 'Reads the DS source and upserts the reference catalogue in the database.') }}
                            </p>
                        </div>
                    </div>

                    <origam-btn
                        color="primary"
                        variant="elevated"
                        :prepend-icon="MDI_ICONS.REFRESH"
                        :loading="syncing"
                        data-cy="admin-sync-trigger"
                        @click="handleSync"
                    >
                        {{ syncing ? t('admin.sync.triggering', 'Syncing…') : t('admin.sync.trigger_btn', 'Trigger re-sync') }}
                    </origam-btn>
                </div>

                <div
                    v-if="syncResult"
                    class="admin-sync__result"
                    role="status"
                    aria-live="polite"
                >
                    <origam-chip
                        color="success"
                        size="small"
                        pill
                        :prepend-icon="MDI_ICONS.CHECK_CIRCLE"
                    >
                        {{ syncResult.created }} {{ t('admin.sync.result_created', 'created') }}
                    </origam-chip>

                    <origam-chip
                        size="small"
                        pill
                    >
                        {{ syncResult.updated }} {{ t('admin.sync.result_updated', 'updated') }}
                    </origam-chip>

                    <origam-chip
                        size="small"
                        pill
                    >
                        {{ syncResult.unchanged }} {{ t('admin.sync.result_unchanged', 'unchanged') }}
                    </origam-chip>

                    <origam-chip
                        v-if="syncResult.orphaned > 0"
                        color="warning"
                        size="small"
                        pill
                    >
                        {{ syncResult.orphaned }} {{ t('admin.sync.result_orphaned', 'orphaned') }}
                    </origam-chip>
                </div>

                <div
                    v-if="syncError"
                    class="admin-sync__error"
                    role="alert"
                    aria-live="assertive"
                >
                    <origam-icon
                        :icon="MDI_ICONS.ALERT_CIRCLE"
                        size="16"
                        aria-hidden="true"
                    />
                    <span>{{ t('admin.sync.result_error', 'Sync error: {error}', { error: syncError }) }}</span>
                </div>
            </template>
        </origam-card>

        <section
            class="admin-sync__history"
            aria-labelledby="sync-history-title"
        >
            <header class="admin-sync__history-header">
                <origam-title
                    id="sync-history-title"
                    tag="h2"
                    class="admin-sync__history-title"
                >
                    {{ t('admin.sync.history_title', 'Recent sync runs') }}
                </origam-title>

                <origam-btn
                    variant="outlined"
                    :prepend-icon="MDI_ICONS.REFRESH"
                    size="small"
                    :loading="loadingRuns"
                    :aria-label="t('admin.sync.refresh_history', 'Refresh history')"
                    data-cy="admin-sync-refresh-history"
                    @click="loadRuns"
                >
                    {{ t('admin.sync.refresh_history', 'Refresh') }}
                </origam-btn>
            </header>

            <div
                v-if="loadingRuns"
                role="status"
            >
                <origam-progress-linear
                    indeterminate
                    color="primary"
                />
            </div>

            <p
                v-else-if="runs.length === 0"
                class="admin-sync__no-runs"
            >
                {{ t('admin.sync.no_runs', 'No sync runs yet.') }}
            </p>

            <origam-data-table
                v-else
                :headers="tableHeaders"
                :items="runs"
                item-value="id"
                class="admin-sync__table"
                data-cy="admin-sync-table"
            >
                <template #item.started_at="{ item }">
                    <span class="admin-sync__cell-mono">{{ formatDate(item.started_at) }}</span>
                </template>

                <template #item.finished_at="{ item }">
                    <span class="admin-sync__cell-mono">{{ formatDate(item.finished_at) }}</span>
                </template>

                <template #item.status="{ item }">
                    <origam-chip
                        :color="statusColor(item.status)"
                        size="x-small"
                        pill
                    >
                        {{ statusLabel(item.status) }}
                    </origam-chip>
                </template>

                <template #item.source_commit="{ item }">
                    <span
                        v-if="item.source_commit"
                        class="admin-sync__cell-mono admin-sync__cell-commit"
                    >{{ item.source_commit.slice(0, 7) }}</span>
                    <span
                        v-else
                        class="admin-sync__cell-empty"
                    >—</span>
                </template>
            </origam-data-table>
        </section>
    </article>
</template>

<style scoped lang="scss">
.admin-sync {
    display: flex;
    flex-direction: column;
    gap: var(--origam-space---6, 1.5rem);

    &__header {
        display: flex;
        flex-direction: column;
        gap: var(--origam-space---1, 0.25rem);
    }

    &__title {
        --origam-title---font-size: var(--origam-font-size---xl, 1.5rem);
        --origam-title---font-weight: 700;
        margin: 0;
    }

    &__subtitle {
        margin: 0;
        font-size: var(--origam-font-size---sm, 0.875rem);
        color: var(--origam-color__text---secondary, #525252);
    }

    &__trigger-card {
        max-inline-size: 640px;
    }

    &__trigger-inner {
        padding: var(--origam-space---5, 1.25rem);
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: var(--origam-space---4, 1rem);
        flex-wrap: wrap;
    }

    &__trigger-info {
        display: flex;
        align-items: flex-start;
        gap: var(--origam-space---3, 0.75rem);
        flex: 1;
    }

    &__trigger-icon {
        color: var(--origam-color__action--primary---bg, #7c3aed);
        font-size: 1.5rem;
        flex-shrink: 0;
        margin-block-start: 2px;
    }

    &__trigger-title {
        --origam-title---font-size: var(--origam-font-size---base, 1rem);
        --origam-title---font-weight: 600;
        margin: 0 0 var(--origam-space---1, 0.25rem);
    }

    &__trigger-desc {
        margin: 0;
        font-size: var(--origam-font-size---sm, 0.875rem);
        color: var(--origam-color__text---secondary, #525252);
    }

    &__result {
        display: flex;
        flex-wrap: wrap;
        gap: var(--origam-space---2, 0.5rem);
        padding: var(--origam-space---3, 0.75rem) var(--origam-space---5, 1.25rem);
        border-block-start: 1px solid var(--origam-color__border---default, rgba(0, 0, 0, 0.08));
    }

    &__error {
        display: flex;
        align-items: center;
        gap: var(--origam-space---2, 0.5rem);
        padding: var(--origam-space---3, 0.75rem) var(--origam-space---5, 1.25rem);
        border-block-start: 1px solid var(--origam-color__border---default, rgba(0, 0, 0, 0.08));
        font-size: var(--origam-font-size---sm, 0.875rem);
        color: var(--origam-color__status--danger---fg, #dc2626);
    }

    &__history {
        display: flex;
        flex-direction: column;
        gap: var(--origam-space---3, 0.75rem);
    }

    &__history-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: var(--origam-space---3, 0.75rem);
    }

    &__history-title {
        --origam-title---font-size: var(--origam-font-size---lg, 1.125rem);
        --origam-title---font-weight: 600;
        margin: 0;
    }

    &__no-runs {
        margin: 0;
        font-size: var(--origam-font-size---sm, 0.875rem);
        color: var(--origam-color__text---secondary, #525252);
        padding-block: var(--origam-space---6, 1.5rem);
    }

    &__cell-mono {
        font-family: var(--origam-font-family---mono, monospace);
        font-size: var(--origam-font-size---xs, 0.75rem);
    }

    &__cell-commit {
        color: var(--origam-color__action--primary---fgSubtle, #6d28d9);
    }

    &__cell-empty {
        color: var(--origam-color__text---tertiary, #737373);
    }
}
</style>
