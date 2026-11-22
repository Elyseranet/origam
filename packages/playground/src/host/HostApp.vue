<template>
    <main class="host">
        <origam-alert
                v-if="external.status === 'error'"
                data-cy="host-scene-error"
                status="error"
                role="alert"
                :title="t('playground.host.scene_error_title', 'This scene cannot be shown')"
                :text="errorText"
        />
        <playground
                v-else
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
    import { computed, nextTick, onMounted, ref } from 'vue'
    import { Playground } from '../components'
    import { useComponentRegistry } from '../composables/Registry/registry.composable'
    import { useT } from '../composables/I18n/useT'
    import { createEmptyScene } from '../consts/Commons/scene.const'
    import { createDefaultSnippets, SNIPPET_PARENT_OF } from '../consts/Commons/snippets.const'
    import { ERROR_DATASET_KEY, READY_DATASET_KEY } from '../consts/Commons/scene-param.const'
    import { attachSnippets, countInstances } from '../utils/Commons/scene-instance.util'
    import { waitForSceneReady } from '../utils/Commons/scene-ready.util'
    import { HOST_CATALOG_SEED } from './catalogSeed.const'
    import type { IHostAppProps } from '../interfaces/Components/host-app.interface'
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
    const props = defineProps<IHostAppProps>()

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
    /*
     * The seed is GENERATED from metadata, which measures neither snippets nor
     * `requiresParent` (#1048 § 3.4): both are authored, and merged here.
     */
    const seededNames = new Set(HOST_CATALOG_SEED.map(definition => definition.name))
    const seed = [...HOST_CATALOG_SEED, ...props.extraDefinitions.filter(definition => !seededNames.has(definition.name))]
    const definitions = attachSnippets(seed,createDefaultSnippets(t), SNIPPET_PARENT_OF)

    const families = [...new Set(definitions.map(definition => definition.family))]
    const sharedLoader = () => import('origam/components')
    const loaders = Object.fromEntries(families.map(family => [family, sharedLoader]))

    const registry = useComponentRegistry({ definitions, loaders })

    /*********************************************************
     * Scene
     ********************************************************/
    const scene = ref<IPlaygroundScene>(props.external.status === 'scene' ? props.external.scene : createEmptyScene())

    const handleUpdateScene = (next: IPlaygroundScene) => {
        scene.value = next
    }

    /*********************************************************
     * External driving (#1441)
     *
     * @description
     * A scene or an error handed over by URL is reported on `<html>` for a
     * headless driver: `data-playground-error` (never a blank page) or
     * `data-playground-ready="true"` once the scene is rendered and stable.
     ********************************************************/
    const errorText = computed(() => props.external.status === 'error'
        ? t(`playground.host.scene_error_${props.external.code}`, props.external.code, { detail: props.external.detail ?? '' })
        : '')

    onMounted(async () => {
        const dataset = document.documentElement.dataset

        if (props.external.status === 'error') {
            dataset[ERROR_DATASET_KEY] = props.external.code

            return
        }

        await nextTick()

        const outcome = await waitForSceneReady(document.body, countInstances(scene.value.roots), '[data-cy="playground-preview-error"]')

        if (outcome === null) dataset[READY_DATASET_KEY] = 'true'
        else dataset[ERROR_DATASET_KEY] = outcome
    })

    const handleSelect =(instanceId: string | null) => {
        console.info('[playground host] selection changed:', instanceId)
    }
</script>

<style lang="scss" scoped>
    .host {
        height: 100vh;
    }
</style>
