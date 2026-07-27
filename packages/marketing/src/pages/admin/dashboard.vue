<script setup lang="ts">
import { computed } from 'vue'
import { useT } from '~/composables/useT'
import { useReferenceCatalog } from '~/composables/useApiReference'
import { ADMIN_NAV_KINDS } from '~/consts/admin.const'

definePageMeta({ layout: 'admin', middleware: 'admin' })

useSeoMeta({
    title: 'Dashboard · Admin',
    robots: 'noindex,nofollow',
})

const { t } = useT()

const [
    { data: componentData },
    { data: composableData },
    { data: constData },
    { data: directiveData },
    { data: enumData },
    { data: interfaceData },
    { data: typeData },
    { data: utilData },
] = await Promise.all([
    useReferenceCatalog<{ slug: string }>('component'),
    useReferenceCatalog<{ slug: string }>('composable'),
    useReferenceCatalog<{ slug: string }>('const'),
    useReferenceCatalog<{ slug: string }>('directive'),
    useReferenceCatalog<{ slug: string }>('enum'),
    useReferenceCatalog<{ slug: string }>('interface'),
    useReferenceCatalog<{ slug: string }>('type'),
    useReferenceCatalog<{ slug: string }>('util'),
])

const counts = computed(() => ({
    component: componentData.value?.length ?? 0,
    composable: composableData.value?.length ?? 0,
    const: constData.value?.length ?? 0,
    directive: directiveData.value?.length ?? 0,
    enum: enumData.value?.length ?? 0,
    interface: interfaceData.value?.length ?? 0,
    type: typeData.value?.length ?? 0,
    util: utilData.value?.length ?? 0,
}))

const totalEntries = computed(() =>
    Object.values(counts.value).reduce((sum, n) => sum + n, 0),
)
</script>

<template>
    <article
        class="admin-dashboard"
        data-cy="admin-dashboard"
    >
        <header class="admin-dashboard__header">
            <origam-title
                tag="h1"
                class="admin-dashboard__title"
            >
                {{ t('admin.dashboard.title', 'Dashboard') }}
            </origam-title>

            <p class="admin-dashboard__subtitle">
                {{ t('admin.dashboard.subtitle', 'Overview of all reference families.') }}
                <origam-chip
                    size="small"
                    pill
                    class="admin-dashboard__total"
                >
                    {{ totalEntries }} {{ t('admin.dashboard.total_entries', 'entries') }}
                </origam-chip>
            </p>
        </header>

        <origam-grid
            tag="ul"
            columns="repeat(auto-fill, minmax(220px, 1fr))"
            gap="1rem"
            class="admin-dashboard__grid"
        >
            <origam-grid-item
                v-for="meta in ADMIN_NAV_KINDS"
                :key="meta.key"
                tag="li"
                class="admin-dashboard__item"
            >
                <nuxt-link
                    :to="`/admin/${meta.key}`"
                    class="admin-kind-card__link"
                    :aria-label="`${t(meta.labelKey, meta.labelFallback)} — ${counts[meta.key]} ${t('admin.dashboard.entries', 'entries')}`"
                    :data-cy="`admin-dashboard-${meta.key}`"
                >
                    <origam-card
                        rounded="lg"
                        class="admin-kind-card"
                    >
                        <template #default>
                            <div class="admin-kind-card__inner">
                                <origam-avatar
                                    :icon="meta.icon"
                                    color="primary"
                                    rounded="lg"
                                    size="40"
                                    class="admin-kind-card__avatar"
                                    aria-hidden="true"
                                />

                                <div class="admin-kind-card__content">
                                    <origam-title
                                        tag="h2"
                                        class="admin-kind-card__name"
                                    >
                                        {{ t(meta.labelKey, meta.labelFallback) }}
                                    </origam-title>

                                    <origam-chip
                                        size="x-small"
                                        pill
                                        class="admin-kind-card__count"
                                    >
                                        {{ counts[meta.key] }}
                                    </origam-chip>
                                </div>
                            </div>
                        </template>
                    </origam-card>
                </nuxt-link>
            </origam-grid-item>
        </origam-grid>
    </article>
</template>

<style scoped lang="scss">
.admin-dashboard {
    display: flex;
    flex-direction: column;
    gap: var(--origam-space---6, 1.5rem);

    &__header {
        display: flex;
        flex-direction: column;
        gap: var(--origam-space---2, 0.5rem);
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
        display: flex;
        align-items: center;
        gap: var(--origam-space---2, 0.5rem);
    }

    &__total {
        --origam-chip---background-color: var(--origam-color__surface---sunken, #f5f5f5);
    }

    &__grid {
        list-style: none;
        padding: 0;
        margin: 0;
    }

    &__item {
        list-style: none;
        display: flex;
        flex-direction: column;
    }
}

.admin-kind-card {
    block-size: 100%;
    transition: transform 0.15s ease, box-shadow 0.15s ease;

    &__link {
        display: flex;
        flex-direction: column;
        block-size: 100%;
        text-decoration: none;
        color: inherit;
        border-radius: var(--origam-radius---lg, 12px);

        &:hover .admin-kind-card {
            transform: translateY(-2px);
            box-shadow: var(--origam-shadow---md, 0 4px 12px rgba(0, 0, 0, 0.1));
        }

        &:focus-visible {
            outline: 2px solid var(--origam-color__action--primary---bg, #7c3aed);
            outline-offset: 2px;
        }
    }

    &__inner {
        padding: var(--origam-space---4, 1rem);
        display: flex;
        align-items: center;
        gap: var(--origam-space---3, 0.75rem);
    }

    &__content {
        display: flex;
        flex-direction: column;
        gap: var(--origam-space---1, 0.25rem);
        flex: 1;
    }

    &__name {
        display: block;
        font-size: var(--origam-font-size---base, 1rem);
        font-weight: var(--origam-font__weight---semibold, 600);
        color: var(--origam-color__text---primary, #0a0a0a);
        margin: 0;
    }

    &__count {
        --origam-chip---background-color: var(--origam-color__surface---sunken, #f5f5f5);
        align-self: flex-start;
    }
}
</style>
