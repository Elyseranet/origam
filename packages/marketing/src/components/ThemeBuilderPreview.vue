<template>
  <section
    class="tb-preview"
    :aria-label="t('theming.preview.label', 'Live preview')"
    data-cy="theming-preview"
  >
    <header class="tb-preview__bar">
      <div class="tb-preview__info">
        <span class="tb-preview__name">{{ entry.name }}</span>
        <span class="tb-preview__sep">·</span>
        <span class="tb-preview__cat">{{ categoryLabel }}</span>
      </div>

      <div class="tb-preview__spacer"/>

      <origam-btn-toggle
        v-if="!split"
        :model-value="activeMode"
        mandatory
        divided
        variant="outlined"
        color="primary"
        size="small"
        class="tb-preview__mode-toggle"
        :aria-label="t('theming.mode.label', 'Preview mode')"
        data-cy="theming-mode-toggle"
        @update:model-value="setMode($event as TEditMode)"
      >
        <origam-btn
          value="light"
          prepend-icon="mdi-weather-sunny"
          data-cy="theming-mode-light"
        >
          {{ t('theming.mode.light', 'Light') }}
        </origam-btn>
        <origam-btn
          value="dark"
          prepend-icon="mdi-weather-night"
          data-cy="theming-mode-dark"
        >
          {{ t('theming.mode.dark', 'Dark') }}
        </origam-btn>
      </origam-btn-toggle>

      <origam-btn
        :variant="split ? 'tonal' : 'outlined'"
        :color="split ? 'primary' : undefined"
        size="small"
        prepend-icon="mdi-view-split-vertical"
        class="tb-preview__split-btn"
        data-cy="theming-split-btn"
        :aria-pressed="split"
        @click="toggleSplit"
      >
        {{ t('theming.split.toggle', 'Split') }}
      </origam-btn>
    </header>

    <div
      class="tb-preview__stage"
      :class="{ 'tb-preview__stage--split': split }"
      aria-live="polite"
      data-cy="theming-preview-stage"
    >
      <client-only>
        <div
          v-for="pane in panes"
          :key="pane.mode"
          class="tb-preview__pane"
          :class="`tb-preview__pane--${pane.mode}`"
          :data-mode="pane.mode"
          :data-cy="`theming-preview-pane-${pane.mode}`"
        >
          <span class="tb-preview__pane-label">{{ modeLabel(pane.mode) }}</span>
          <origam-theme-provider
            theme="origam"
            :mode="pane.mode"
            class="tb-preview__provider"
          >
            <div
              class="tb-preview__canvas"
              :class="{ 'tb-preview__canvas--fill-width': fillsWidth }"
              :style="pane.style"
              :data-cy="`theming-canvas-${pane.mode}`"
            >
              <origam-defaults-provider :defaults="themeDefaults">
                <theme-builder-contextual-menu-demo
                  v-if="entry.slug === 'contextual-menu'"
                  :attach="THEME_BUILDER_OVERLAY_ATTACH"
                  v-bind="previewProps"
                  :data-cy="`theming-live-${entry.slug}-${pane.mode}`"
                />
                <template v-else-if="hostEntry && hasRoots">
                  <playground-scene-node
                    v-for="root in roots"
                    :key="root.id"
                    :instance="root"
                    :registry="hostEntry.registry"
                    :data-cy="`theming-live-${entry.slug}-${pane.mode}`"
                  />
                </template>
                <p
                  v-else
                  class="tb-preview__unavailable"
                  :data-cy="`theming-unavailable-${pane.mode}`"
                >
                  {{ unavailableText }}
                </p>
              </origam-defaults-provider>
            </div>
          </origam-theme-provider>
        </div>
      </client-only>
    </div>
  </section>
</template>

<script setup lang="ts">
  import { computed, shallowRef, watch } from 'vue'
  import { useSnackbarGroup } from 'origam/composables'
  import { PlaygroundSceneNode } from '@origam/playground/components'
  import { catalogNameOfTag } from '@origam/playground/catalog'

  import { useT } from '~/composables/useT'
  import { usePlaygroundHost } from '~/composables/usePlaygroundHost'
  import { PLAYGROUND_UNAVAILABLE_REASONS, THEME_BUILDER_FILL_WIDTH_SLUGS, THEME_BUILDER_OVERLAY_ATTACH } from '~/consts/playground-host.const'
  import type { IPlaygroundHostEntry } from '~/interfaces/playground-host.interface'
  import { withoutThemedProps } from '~/utils/playground-host.util'
  import type {
    IThemeBuilderPreviewEmits,
    IThemeBuilderPreviewProps,
    TEditMode
  } from '~/interfaces/theme-builder.interface'

  const props = withDefaults(defineProps<IThemeBuilderPreviewProps>(), {})

  const emit = defineEmits<IThemeBuilderPreviewEmits>()

  const { t } = useT()

  const categoryLabel = computed(() => props.entry.category)

  const setMode = (mode: TEditMode): void => {
    emit('update:activeMode', mode)
  }

  const toggleSplit = (): void => {
    emit('update:split', !props.split)
  }

  const panes = computed<Array<{ mode: TEditMode; style: Record<string, string> }>>(() => {
    if (props.split) {
      return [
        { mode: 'light', style: props.lightStyle },
        { mode: 'dark', style: props.darkStyle }
      ]
    }
    return [
      {
        mode: props.activeMode,
        style: props.activeMode === 'dark' ? props.darkStyle : props.lightStyle
      }
    ]
  })

  /*********************************************************
   * Engine (lot E, #1145)
   *
   * @description
   * The preview renders through the playground ENGINE — registry + snippets +
   * `PlaygroundSceneNode` — so every component of the catalogue previews (219),
   * where the former `<component :is>` mounted only a hand-kept list of 23.
   * The edited theme WRAPS the pane: its `components` block through
   * `<origam-defaults-provider>` (the same channel the exported theme takes),
   * its `cssVars` as the canvas' inline style. The scene itself carries only
   * the snippet's demo content, minus every prop the theme sets — a snippet
   * prop is a call-site prop and would outrank the theme being previewed.
   * Loaded client-side only (scene ids are random): the stage is `<client-only>`.
   ********************************************************/
  const host = usePlaygroundHost({ overlayAttach: THEME_BUILDER_OVERLAY_ATTACH })
  const hostEntry = shallowRef<IPlaygroundHostEntry | null>(null)
  const componentName = computed(() => catalogNameOfTag(props.entry.componentTag) ?? null)

  const loadEntry = async () => {
    const name = componentName.value
    hostEntry.value = null
    if (!name) return
    const loaded = await host.load(name)
    if (loaded?.componentName === componentName.value) hostEntry.value = loaded
    if (name === 'OrigamSnackbarGroup' && loaded) notifyDemo()
  }

  /* Une pile de snackbars n'a pas de props qui la remplissent : on pousse deux items persistants (#1285). */
  const { notify, dismissAll } = useSnackbarGroup()
  const notifyDemo = () => {
    dismissAll()
    notify({ message: t('theming.preview.snackbar_group.saved', 'Saved successfully.'), intent: 'success', duration: 0 })
    notify({ message: t('theming.preview.snackbar_group.sync', 'Sync in progress.'), intent: 'info', duration: 0 })
  }

  watch(componentName, () => {
    if (import.meta.client) loadEntry()
  }, { immediate: true })

  const fillsWidth = computed(() => THEME_BUILDER_FILL_WIDTH_SLUGS.includes(props.entry.slug))

  const themedKeys = computed(() => new Set([
    ...Object.keys(props.themeDefaults[props.entry.componentKey] ?? {}),
    ...Object.keys(props.themeDefaults.global ?? {})
  ]))

  const roots = computed(() => {
    const entry = hostEntry.value
    const name = componentName.value
    if (!entry || !name) return []
    return withoutThemedProps(entry.createScene().roots, name, themedKeys.value, props.previewProps)
  })

  const unavailableReason = computed(() => {
    const reason = componentName.value ? PLAYGROUND_UNAVAILABLE_REASONS[componentName.value] : undefined
    return reason && !hostEntry.value?.hasSnippet ? reason : undefined
  })

  const hasRoots = computed(() => roots.value.length > 0 && !unavailableReason.value)

  const unavailableText = computed(() => (unavailableReason.value
    ? t(unavailableReason.value.key, unavailableReason.value.fallback)
    : t('components.detail.preview.loading', 'Rendering the live preview…')))

  const modeLabel = (mode: TEditMode): string => {
    return mode === 'dark' ? t('theming.mode.dark', 'Dark') : t('theming.mode.light', 'Light')
  }
</script>

<style scoped lang="scss">
  .tb-preview {
    display: flex;
    flex-direction: column;
    min-height: 20rem;
    overflow: hidden;
    border-width: 1px;
    border-style: solid;
    border-color: var(--origam-color-border-default);
    border-radius: var(--origam-radius-lg, 0.5rem);
    background-color: var(--origam-color-surface-subtle, var(--origam-color-surface-raised));

    &__bar {
      display: flex;
      align-items: center;
      gap: var(--origam-spacing-3, 0.75rem);
      flex: 0 0 auto;
      padding: var(--origam-spacing-2, 0.5rem) var(--origam-spacing-4, 1rem);
      min-height: 2.75rem;
      background-color: var(--origam-color-surface-default);
      border-block-end: 1px solid var(--origam-color-border-subtle, var(--origam-color-border-default));
    }

    &__info {
      display: flex;
      align-items: center;
      gap: var(--origam-spacing-2, 0.5rem);
      min-inline-size: 0;
    }

    &__name {
      font-weight: var(--origam-font-weight-bold, 700);
      font-size: var(--origam-font-size-sm, 0.8125rem);
      color: var(--origam-color-text-default);
    }

    &__sep {
      color: var(--origam-color-border-default);
    }

    &__cat {
      font-size: var(--origam-font-size-xs, 0.75rem);
      color: var(--origam-color-text-subtle);
    }

    &__spacer {
      flex: 1 1 auto;
    }

    &__mode-toggle {

    }

    &__split-btn {
      flex: 0 0 auto;
    }

    &__stage {
      flex: 1 1 auto;
      min-height: 0;
      display: grid;
      grid-template-columns: 1fr;
      overflow: auto;

      &--split {
        grid-template-columns: 1fr 1fr;

        @media (max-width: 48rem) {
          grid-template-columns: 1fr;
        }
      }
    }

    &__pane {
      position: relative;
      contain: layout;
      display: grid;
      place-items: center;
      min-height: 14rem;
      padding: var(--origam-spacing-8, 2rem);
      background-color: var(--origam-color-neutral-0, #ffffff);
      background-image: radial-gradient(circle at 1px 1px, var(--origam-color-neutral-300, #d4d4d4) 1px, transparent 0);
      background-size: 20px 20px;

      &--dark {
        background-color: var(--origam-color-neutral-950, #0a0a0a);
        background-image: radial-gradient(circle at 1px 1px, var(--origam-color-neutral-800, #262626) 1px, transparent 0);
        background-size: 20px 20px;
      }

      & + & {
        border-inline-start: 1px solid var(--origam-color-border-subtle, var(--origam-color-border-default));
      }
    }

    &__pane-label {
      position: absolute;
      inset-block-start: var(--origam-spacing-3, 0.75rem);
      inset-inline-start: var(--origam-spacing-4, 1rem);
      font-size: 0.625rem;
      font-weight: var(--origam-font-weight-bold, 700);
      letter-spacing: 0.08em;
      text-transform: uppercase;
      color: var(--origam-color-text-subtle);
    }

    &__pane--dark &__pane-label {
      color: var(--origam-color-neutral-400, #a3a3a3);
    }

    &__provider {
      display: grid;
      place-items: center;
    }

    &__canvas {
      display: grid;
      place-items: center;
      gap: var(--origam-spacing-3, 0.75rem);
      min-inline-size: 16rem;
      min-block-size: 9rem;
      padding: var(--origam-spacing-8, 2rem) var(--origam-spacing-10, 3rem);
      background-color: transparent;

      &--fill-width > :deep(*) {
        inline-size: 100%;
      }
    }

    &__unavailable {
      margin: 0;
      max-inline-size: 22ch;
      text-align: center;
      font-size: var(--origam-font-size-sm, 0.8125rem);
      color: var(--origam-color-text-subtle);
    }
  }
</style>
