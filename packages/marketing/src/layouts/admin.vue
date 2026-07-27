<script setup lang="ts">
import { ref } from 'vue'
import { MDI_ICONS } from 'origam/enums'
import { useT } from '~/composables/useT'
import { useAdminReference } from '~/composables/useAdminReference'
import { ADMIN_NAV_KINDS } from '~/consts/admin.const'

const { t } = useT()
const { logout } = useAdminReference()

const route = useRoute()
const router = useRouter()

const drawerOpen = ref(true)

function isKindActive (key: string) {
    return route.path.startsWith(`/admin/${key}`)
}

async function handleLogout () {
    await logout()
    router.push('/admin')
}
</script>

<template>
    <origam-app class="admin-app">
        <origam-app-bar
            :order="0"
            :title="t('admin.appbar.title', 'Admin')"
            class="admin-appbar"
            :aria-label="t('admin.appbar.label', 'Admin toolbar')"
        >
            <template #prepend>
                <origam-btn
                    :icon="MDI_ICONS.MENU"
                    variant="text"
                    :aria-label="t('admin.appbar.toggle_nav', 'Toggle navigation')"
                    data-cy="admin-nav-toggle"
                    @click="drawerOpen = !drawerOpen"
                />
            </template>

            <template #append>
                <origam-btn
                    variant="text"
                    :href="'/'"
                    :prepend-icon="MDI_ICONS.ARROW_LEFT"
                    class="admin-appbar__btn"
                    data-cy="admin-back-to-site"
                >
                    {{ t('admin.appbar.back_to_site', 'Back to site') }}
                </origam-btn>

                <origam-btn
                    variant="text"
                    :prepend-icon="MDI_ICONS.LOGOUT"
                    class="admin-appbar__btn"
                    data-cy="admin-logout"
                    @click="handleLogout"
                >
                    {{ t('admin.appbar.logout', 'Log out') }}
                </origam-btn>
            </template>
        </origam-app-bar>

        <origam-drawer
            v-model="drawerOpen"
            :order="1"
            permanent
            class="admin-drawer"
            width="240"
        >
            <nav
                class="admin-nav"
                :aria-label="t('admin.nav.label', 'Admin navigation')"
            >
                <origam-list nav>
                    <origam-list-item
                        :title="t('admin.nav.dashboard', 'Dashboard')"
                        :prepend-icon="MDI_ICONS.VIEW_DASHBOARD"
                        :active="route.path === '/admin/dashboard'"
                        to="/admin/dashboard"
                        data-cy="admin-nav-dashboard"
                    />

                    <origam-divider class="admin-nav__divider" />

                    <origam-list-item
                        v-for="kind in ADMIN_NAV_KINDS"
                        :key="kind.key"
                        :title="t(kind.labelKey, kind.labelFallback)"
                        :prepend-icon="kind.icon"
                        :active="isKindActive(kind.key)"
                        :to="`/admin/${kind.key}`"
                        :data-cy="`admin-nav-${kind.key}`"
                    />

                    <origam-divider class="admin-nav__divider" />

                    <origam-list-item
                        :title="t('admin.nav.sync', 'Sync')"
                        :prepend-icon="MDI_ICONS.SYNC"
                        :active="route.path === '/admin/sync'"
                        to="/admin/sync"
                        data-cy="admin-nav-sync"
                    />
                </origam-list>
            </nav>
        </origam-drawer>

        <origam-main class="admin-main">
            <slot />
        </origam-main>
    </origam-app>
</template>

<style scoped lang="scss">
.admin-app {
    min-block-size: 100vh;
}

.admin-appbar {
    --origam-toolbar---background: var(--origam-color__surface---default, #ffffff);
    --origam-title---font-size: var(--origam-font-size---base, 1rem);
    --origam-title---font-weight: 700;
    --origam-layout---position-left: 0px;
    border-block-end: 1px solid var(--origam-color__border---default, rgba(0, 0, 0, 0.08));

    &__btn {
        --origam-btn---font-size: var(--origam-font-size---sm, 0.875rem);
    }
}

.admin-drawer {
    --origam-drawer---background: var(--origam-color__surface---default, #ffffff);
    border-inline-end: 1px solid var(--origam-color__border---default, rgba(0, 0, 0, 0.08));
}

.admin-nav {
    padding: var(--origam-space---2, 0.5rem);

    :deep(.origam-list-item--active),
    :deep(.origam-list-item--link:hover),
    :deep(.origam-list-item--link:focus-visible) {
        --origam-list-item__overlay---background-color: var(--origam-color__action--primary---bg);
    }

    &__divider {
        margin-block: var(--origam-space---2, 0.5rem);
        --origam-divider---opacity: 1;
        --origam-divider---color: var(--origam-color__border---default, rgba(0, 0, 0, 0.08));
    }
}

.admin-main {
    :deep(.origam-main__wrapper) {
        padding: var(--origam-space---6, 1.5rem);
    }
}
</style>
