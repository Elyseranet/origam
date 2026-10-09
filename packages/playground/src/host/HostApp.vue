<template>
    <main class="host">
        <playground
                :scene="scene"
                :registry="registry"
                :theme="theme"
                :mode="mode"
                @select="handleSelect"
                @update:scene="handleUpdateScene"
        >
            <template #toolbar>
                <origam-btn
                        data-cy="host-mode-toggle"
                        size="large"
                        variant="ghost"
                        :aria-label="modeToggleLabel"
                        @click="handleToggleMode"
                >
                    <template #default>{{ modeToggleLabel }}</template>
                </origam-btn>
            </template>
        </playground>
    </main>
</template>

<script setup lang="ts">
    import { computed, ref } from 'vue'
    import { Playground } from '../components'
    import { useComponentRegistry } from '../composables/Registry/registry.composable'
    import { useT } from '../composables/I18n/useT'
    import { createEmptyScene } from '../consts/Commons/scene.const'
    import { HOST_CATALOG_SEED } from './catalogSeed.const'
    import type { IPlaygroundScene } from '../interfaces/Scene/playground-scene.interface'

    /*********************************************************
     * Exception — plain `<main>`, not `<origam-main>`
     *
     * @description
     * `<origam-main>` injects `origam:layout` from an ancestor
     * `<origam-layout>` (`useLayoutMain`) and throws without one. This
     * standalone host is intentionally NOT an app shell — it is "a minimal
     * page to open [the playground] on", per the ticket — so it keeps the
     * native `<main>` rather than pulling in layout scaffolding this page
     * has no other use for. A real host (e.g. `packages/marketing`, which
     * already runs inside `<origam-layout>`) would use `<origam-main>`.
     ********************************************************/

    /*********************************************************
     * Host state
     *
     * @description
     * This file IS the host — "a minimal page to open it". It owns the one
     * thing the playground deliberately does not: which theme/mode is
     * active. Light/dark only, per the owner's decision (the playground
     * does not know the 8 brand identities; a brand-aware host like
     * `packages/marketing` would drive `mode` from its OWN selector in this
     * same `#toolbar` slot).
     ********************************************************/
    const { t } = useT()

    const mode = ref<'light' | 'dark'>('light')
    const theme = ref('auto')

    const modeToggleLabel = computed(() => t('playground.host.mode_toggle_label', 'Switch to {target}', {
        target: mode.value === 'light' ? t('playground.topbar.mode_dark', 'Dark') : t('playground.topbar.mode_light', 'Light')
    }))

    const handleToggleMode = () => {
        mode.value = mode.value === 'light' ? 'dark' : 'light'
    }

    /*********************************************************
     * Registry
     *
     * @description
     * One loader shared by every family in the seed: `origam/components`
     * (the full barrel) exports every component by name, so
     * `pickFromModule` in `registry.composable.ts` finds `OrigamBtn`,
     * `OrigamSelect`, … in the same resolved module regardless of which
     * family key triggered the load.
     ********************************************************/
    const families = [...new Set(HOST_CATALOG_SEED.map(definition => definition.family))]
    const sharedLoader = () => import('origam/components')
    const loaders = Object.fromEntries(families.map(family => [family, sharedLoader]))

    const registry = useComponentRegistry({ definitions: HOST_CATALOG_SEED, loaders })

    /*********************************************************
     * Scene
     ********************************************************/
    const scene = ref<IPlaygroundScene>(createEmptyScene())

    const handleUpdateScene = (next: IPlaygroundScene) => {
        scene.value = next
    }

    const handleSelect = (instanceId: string | null) => {
        console.info('[playground host] selection changed:', instanceId)
    }
</script>

<style lang="scss" scoped>
    .host {
        height: 100vh;
    }
</style>
