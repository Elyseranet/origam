<script setup lang="ts">
  import { computed, onMounted, ref, watch } from 'vue'

  import { useT } from '~/composables/useT'
  import { useThemeBuilder } from '~/composables/useThemeBuilder'
  import type { TEditMode } from '~/interfaces/theme-builder.interface'

  import ThemeBuilderNav from '~/components/theming/ThemeBuilderNav.vue'
  import ThemeBuilderPreview from '~/components/theming/ThemeBuilderPreview.vue'
  import ThemeBuilderControls from '~/components/theming/ThemeBuilderControls.vue'

  const { t } = useT()

  const {
    entries,
    nav,
    state,
    editCount,
    generatedCode,
    fileName,
    presets,
    propValue,
    setProp,
    tokenValue,
    setToken,
    previewProps,
    previewStyle,
    slotText,
    isPropEdited,
    isTokenEdited,
    componentEditCount,
    groupEditCount,
    tokenGroupEditCount,
    resetComponent,
    reset,
    download,
    downloadJson,
    importTheme,
    seedPreset,
    clearPreset,
    loadStorage,
    startAutoPersist
  } = useThemeBuilder()

  onMounted(() => {
    loadStorage()
    startAutoPersist()
  })

  useSeoMeta({
    title: () => t('theming.meta.title', 'Theme builder · origam design system'),
    description: () =>
      t(
        'theming.meta.description',
        'Configure a default origam theme visually — edit component props and CSS tokens with a live preview, then export a ready-to-use theme module.'
      )
  })

  const defaultSlug = computed(() => {
    const preferred = entries.value.find(e => e.slug === 'btn')
    if (preferred) return preferred.slug
    const firstPreviewable = entries.value.find(e => e.previewable)
    return firstPreviewable?.slug ?? entries.value[0]?.slug ?? ''
  })

  const activeSlug = ref<string>(defaultSlug.value)

  const activeEntry = computed(() => entries.value.find(e => e.slug === activeSlug.value) ?? entries.value[0])

  const split = ref<boolean>(false)

  const importOpen = ref<boolean>(false)
  const importText = ref<string>('')
  const importError = ref<boolean>(false)

  watch(importOpen, (open) => {
    if (open) {
      importText.value = ''
      importError.value = false
    }
  })

  const presetItems = computed(() => [
    { title: t('theming.preset.none', '— none —'), value: '' },
    ...presets.map(p => ({ title: t(p.labelKey, p.labelFallback), value: p.key }))
  ])

  const onSelectComponent = (slug: string): void => {
    activeSlug.value = slug
  }

  const onSetProp = (slug: string, prop: string, value: unknown): void => setProp(slug, prop, value)
  const onSetToken = (mode: TEditMode, cssVar: string, value: string): void => setToken(mode, cssVar, value)
  const onResetComponent = (slug: string): void => resetComponent(slug)

  const onSeedPreset = (key: unknown): void => {
    if (typeof key !== 'string') return
    if (!key) {
      clearPreset()
      return
    }
    seedPreset(key)
  }

  const onImport = (): void => {
    const ok = importTheme(importText.value)
    importError.value = !ok
    if (ok) {
      importText.value = ''
      importOpen.value = false
    }
  }

  const lightStyle = computed(() =>
    activeEntry.value ? previewStyle(activeEntry.value.slug, 'light') : {}
  )
  const darkStyle = computed(() =>
    activeEntry.value ? previewStyle(activeEntry.value.slug, 'dark') : {}
  )
  const activePreviewProps = computed(() =>
    activeEntry.value ? previewProps(activeEntry.value.slug) : {}
  )
  const activeSlotText = computed(() =>
    activeEntry.value ? slotText(activeEntry.value.slug) : ''
  )

  const downloadHint = computed(() =>
    t('theming.export.filename', 'Downloads {file}', { file: fileName.value })
  )
</script>

<template>
  <article
    class="theming"
    data-cy="page-theming"
  >
    <origam-alert
      status="warning"
      border
      rounded="lg"
      :elevation="2"
      class="theming__dev-banner"
      data-cy="theming-dev-banner"
      :title="t('theming.dev_banner.title', 'Feature under development')"
      :text="t('theming.dev_banner.text', 'The Theme Builder is under active development — some features may be incomplete or change.')"
    />

    <header
      class="theming__topbar"
      :aria-label="t('theming.topbar.label', 'Theme builder toolbar')"
      data-cy="theming-topbar"
    >
      <div class="theming__brand">
                <span
                  class="theming__brand-badge"
                  aria-hidden="true"
                >{{ t('theming.topbar.badge', 'TB') }}</span>
        <origam-title
          tag="h1"
          class="theming__brand-title"
        >
          {{ t('theming.title', 'Theme Builder') }}
        </origam-title>
      </div>

      <span
        class="theming__divider"
        aria-hidden="true"
      />

      <origam-text-field
        v-model="state.name"
        :label="t('theming.name.label', 'Name')"
        variant="outlined"
        density="compact"
        hide-details
        class="theming__field theming__field--name"
        data-cy="theming-name"
      />
      <origam-text-field
        v-model="state.label"
        :label="t('theming.label.label', 'Label')"
        variant="outlined"
        density="compact"
        hide-details
        class="theming__field theming__field--label"
        data-cy="theming-label"
      />

      <span
        class="theming__divider"
        aria-hidden="true"
      />

      <origam-select
        v-model="state.preset"
        :label="t('theming.preset.label', 'Preset')"
        :items="presetItems"
        variant="outlined"
        density="compact"
        hide-details
        class="theming__field theming__field--preset"
        data-cy="theming-preset"
        @update:model-value="onSeedPreset"
      />

      <div class="theming__spacer"/>

      <p
        class="theming__mods"
        aria-live="polite"
        data-cy="theming-mods"
      >
                <span
                  class="theming__mods-dot"
                  aria-hidden="true"
                />
        <strong>{{ editCount }}</strong>
        {{ t('theming.mods', 'modifications') }}
      </p>

      <span
        class="theming__divider"
        aria-hidden="true"
      />

      <div class="theming__actions">
        <origam-btn
          variant="outlined"
          size="small"
          prepend-icon="mdi-restore"
          data-cy="theming-reset"
          @click="reset"
        >
          {{ t('theming.reset', 'Reset') }}
        </origam-btn>
        <origam-btn
          variant="outlined"
          size="small"
          prepend-icon="mdi-import"
          data-cy="theming-import-toggle"
          @click="importOpen = true"
        >
          {{ t('theming.seed.import_action', 'Import') }}
        </origam-btn>
        <origam-btn
          variant="outlined"
          size="small"
          prepend-icon="mdi-code-json"
          data-cy="theming-export-json"
          @click="downloadJson"
        >
          {{ t('theming.export_json', 'Export JSON') }}
        </origam-btn>
        <origam-btn
          color="primary"
          variant="outlined"
          size="small"
          prepend-icon="mdi-download"
          data-cy="theming-export-ts"
          @click="download"
        >
          {{ t('theming.export_ts', 'Export .ts') }}
        </origam-btn>
      </div>
    </header>

    <origam-dialog
      v-model="importOpen"
      :title="t('theming.seed.import_dialog_title', 'Import a theme')"
      size="small"
      data-cy="theming-import-dialog"
    >
      <template #content>
        <div class="theming__import-dialog">
          <origam-textarea-field
            v-model="importText"
            :label="t('theming.seed.import_label', 'Paste a theme module or JSON')"
            :placeholder="t('theming.seed.import_placeholder', 'Paste a theme module or a JSON object…')"
            variant="outlined"
            density="compact"
            hide-details
            :rows="6"
            class="theming__import-text"
            data-cy="theming-import-text"
          />
          <origam-alert
            v-if="importError"
            type="danger"
            density="compact"
            data-cy="theming-import-error"
          >
            {{ t('theming.seed.import_error', 'Could not parse that theme — paste a valid IOrigamTheme module or JSON object.') }}
          </origam-alert>
        </div>
      </template>
      <template #footer>
        <origam-btn
          color="primary"
          variant="tonal"
          prepend-icon="mdi-import"
          data-cy="theming-import-btn"
          @click="onImport"
        >
          {{ t('theming.seed.import_action', 'Import') }}
        </origam-btn>
      </template>
    </origam-dialog>

    <div class="theming__body">
      <theme-builder-nav
        :categories="nav"
        :active-slug="activeSlug"
        class="theming__col theming__col--nav"
        @select="onSelectComponent"
      />

      <div
        v-if="activeEntry"
        class="theming__col theming__col--center"
      >
        <theme-builder-preview
          :entry="activeEntry"
          :active-mode="state.activeMode"
          :split="split"
          :preview-props="activePreviewProps"
          :slot-text="activeSlotText"
          :light-style="lightStyle"
          :dark-style="darkStyle"
          @update:active-mode="state.activeMode = $event"
          @update:split="split = $event"
        />
      </div>

      <theme-builder-controls
        v-if="activeEntry"
        :entry="activeEntry"
        :active-mode="state.activeMode"
        :prop-value="propValue"
        :token-value="tokenValue"
        :is-prop-edited="isPropEdited"
        :is-token-edited="isTokenEdited"
        :component-edit-count="componentEditCount"
        :group-edit-count="groupEditCount"
        :token-group-edit-count="tokenGroupEditCount"
        class="theming__col theming__col--panel"
        @set-prop="onSetProp"
        @set-token="onSetToken"
        @reset-component="onResetComponent"
      />
    </div>

    <section
      class="theming__output"
      aria-labelledby="theming-output-title"
      data-cy="theming-output"
    >
      <header class="theming__output-head">
        <origam-title
          id="theming-output-title"
          tag="h2"
          class="theming__output-title"
        >
          {{ t('theming.output.title', 'Generated theme') }}
        </origam-title>
        <p class="theming__output-hint">
          {{ downloadHint }}
        </p>
      </header>
      <output class="theming__output-code">
        <origam-code
          :code="generatedCode"
          lang="ts"
          :filename="fileName"
          copyable
          data-cy="theming-generated-code"
        />
      </output>
    </section>
  </article>
</template>

<style scoped lang="scss">
  .theming {
    display: flex;
    flex-direction: column;
    min-height: calc(100vh - var(--origam-app-bar---height, 4rem));

    &__dev-banner {
      flex: none;
      margin: var(--origam-space---4, 1rem);
      margin-block-end: 0;
    }

    &__topbar {
      display: flex;
      align-items: center;
      gap: var(--origam-spacing-4, 1rem);
      flex: 0 0 auto;
      margin-block-start: var(--origam-spacing-4, 1rem);
      padding: var(--origam-spacing-4, 1rem) var(--origam-spacing-5, 1.25rem);
      min-height: 4rem;
      background-color: var(--origam-color-surface-default);
      border-block-end: 1px solid var(--origam-color-border-default);
      overflow-x: auto;
      --origam-field---font-size: 0.75rem;
      --origam-field---padding-top: 0px;
      --origam-field---padding-bottom: 0px;
      --origam-field---padding-start: 8px;
      --origam-field---padding-end: 8px;
      --origam-field---border-radius: 4px;
      --origam-input---font-size: 0.75rem;
      --origam-input__control---height-sm: 28px;
      --origam-select---min-width: 0;

      :deep(.origam-field) {
        font-size: 0.75rem;
      }

      :deep(.origam-field__input) {
        min-height: 28px;
        padding-top: 5px;
        padding-bottom: 5px;
      }

      :deep(.origam-select__selection-text),
      :deep(.origam-input__control) {
        font-size: 0.75rem;
      }
    }

    &__brand {
      display: flex;
      align-items: center;
      gap: var(--origam-spacing-2, 0.5rem);
      flex: 0 0 auto;
    }

    &__brand-badge {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      inline-size: 1.375rem;
      block-size: 1.375rem;
      border-radius: var(--origam-radius-sm, 0.25rem);
      background-color: var(--origam-color__action--primary---bg, #7c3aed);
      color: var(--origam-color__action--primary---fg, #ffffff);
      font-size: 0.625rem;
      font-weight: var(--origam-font-weight-bold, 800);
    }

    &__brand-title {
      margin: 0;
      font-size: var(--origam-font-size-sm, 0.8125rem);
      font-weight: var(--origam-font-weight-bold, 700);
      white-space: nowrap;
    }

    &__divider {
      flex: 0 0 auto;
      inline-size: 1px;
      block-size: 1.375rem;
      background-color: var(--origam-color-border-default);
    }

    &__field {
      flex: 0 0 auto;

      &--name {
        inline-size: 8.5rem;
      }

      &--label {
        inline-size: 8.5rem;
      }

      &--preset {
        inline-size: 10rem;
      }
    }

    &__spacer {
      flex: 1 1 auto;
    }

    &__mods {
      display: flex;
      align-items: center;
      gap: var(--origam-spacing-1, 0.25rem);
      flex: 0 0 auto;
      margin: 0;
      font-size: var(--origam-font-size-xs, 0.75rem);
      color: var(--origam-color-text-subtle);
      white-space: nowrap;

      strong {
        color: var(--origam-color-text-default);
        font-variant-numeric: tabular-nums;
      }
    }

    &__mods-dot {
      inline-size: 6px;
      block-size: 6px;
      border-radius: 50%;
      background-color: var(--origam-color__action--primary---bg, #7c3aed);
    }

    &__actions {
      display: flex;
      align-items: center;
      gap: var(--origam-spacing-1, 0.25rem);
      flex: 0 0 auto;
    }

    &__import-dialog {
      display: flex;
      flex-direction: column;
      gap: var(--origam-spacing-3, 0.75rem);
      padding: var(--origam-spacing-4, 1rem);
    }

    &__import-text {
      width: 100%;
    }

    &__body {
      display: grid;
      grid-template-columns: 14rem 1fr 20rem;
      grid-auto-rows: min-content;
      align-items: start;
      flex: 1 1 auto;
      min-height: 0;
      height: auto;

      @media (max-width: 64rem) {
        grid-template-columns: 12rem 1fr 17rem;
      }

      @media (max-width: 48rem) {
        grid-template-columns: 1fr;
        overflow-y: auto;
      }
    }

    &__col {
      min-height: auto;
    }

    &__col--center {
      display: flex;
      flex-direction: column;
      min-width: 0;
      min-height: 0;
      overflow: visible;
      padding: var(--origam-spacing-4, 1rem);
      background-color: var(--origam-color-surface-sunken, var(--origam-color-surface-subtle));
      border-inline: 1px solid var(--origam-color-border-default);
      position: sticky;
      top: var(--origam-app-bar---height, 4rem);
      max-height: calc(100vh - var(--origam-app-bar---height, 4rem));
      overflow-y: auto;

      @media (max-width: 48rem) {
        border-inline: none;
        border-block: 1px solid var(--origam-color-border-default);
        position: static;
        max-height: none;
        overflow-y: visible;
      }
    }

    &__output {
      flex: 0 0 auto;
      display: flex;
      flex-direction: column;
      gap: var(--origam-spacing-2, 0.5rem);
      padding: var(--origam-spacing-4, 1rem);
      background-color: var(--origam-color-surface-default);
      border-block-start: 1px solid var(--origam-color-border-subtle, var(--origam-color-border-default));
      overflow: visible;
    }

    &__output-head {
      display: flex;
      align-items: baseline;
      gap: var(--origam-spacing-3, 0.75rem);
      flex: 0 0 auto;
    }

    &__output-title {
      margin: 0;
      font-size: var(--origam-font-size-sm, 0.8125rem);
    }

    &__output-hint {
      margin: 0;
      font-size: var(--origam-font-size-xs, 0.75rem);
      color: var(--origam-color-text-subtle);
    }

    &__output-code {
      display: flex;
      flex: 1 1 auto;
      min-height: 12rem;
      overflow: visible;

      :deep(.origam-code) {
        flex: 1 1 auto;
        min-height: 0;
      }
    }
  }
</style>
