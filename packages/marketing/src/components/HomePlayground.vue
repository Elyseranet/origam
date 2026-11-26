<template>
  <section
    id="playground"
    class="home-playground"
    aria-labelledby="playground-heading"
  >
    <h2
      id="playground-heading"
      class="home-playground__sr-title"
    >
      {{ t('home.playground.title', 'A few lines, real components.') }}
    </h2>

    <origam-sheet
      tag="div"
      rounded="xl"
      bg-color="var(--origam-color__surface---overlay)"
      class="home-playground__block"
    >
      <origam-theme-provider
        mode="dark"
        class="home-playground__window"
      >
        <origam-code
          :code="snippet"
          lang="vue"
          :filename="t('home.playground.file', 'App.vue')"
          rounded="lg"
          class="home-playground__code"
          data-cy="playground-code"
        />
      </origam-theme-provider>

      <origam-sheet
        tag="div"
        rounded="lg"
        elevation="sm"
        bg-color="var(--origam-color__surface---raised)"
        class="home-playground__variants"
        data-cy="playground-preview"
      >
        <origam-btn
          v-for="button in buttons"
          :key="button.key"
          v-bind="button.props"
          :data-cy="`playground-btn-${button.key}`"
        >
          {{ labels[button.key] }}
        </origam-btn>
      </origam-sheet>
    </origam-sheet>
  </section>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useT } from '~/composables/useT'
import { HOME_DEMO_BUTTONS } from '~/consts/playground.const'
import { buildHomeDemoSnippet } from '~/utils/home-demo.util'

const { t } = useT()

/*********************************************************
 * Code window
 *
 * @description
 * The window stays dark in both modes (brand kit A1), via
 * <origam-theme-provider mode="dark">. shortcut: OrigamCode picks its
 * syntax colours from `html[data-mode]` only, so the style block forces
 * `--shiki-dark` inside `.home-playground__window`; drop it once #1532 is fixed.
 ********************************************************/

const buttons = HOME_DEMO_BUTTONS

const labels = computed(() =>
    Object.fromEntries(buttons.map(({ key, labelKey, labelFallback }) => [key, t(labelKey, labelFallback)]))
)

const snippet = computed(() => buildHomeDemoSnippet(buttons, labels.value))

defineEmits([])

defineSlots<Record<string, never>>()

defineExpose({})
</script>

<style scoped lang="scss">
.home-playground {
    padding-block: var(--origam-space---12, 3rem);
    padding-inline: var(--origam-space---6, 1.5rem);
    max-width: 80rem;
    margin-inline: auto;
    width: 100%;
    box-sizing: border-box;

    &__sr-title {
        position: absolute;
        inline-size: 1px;
        block-size: 1px;
        overflow: hidden;
        clip-path: inset(50%);
        white-space: nowrap;
    }

    &__block {
        display: grid;
        grid-template-columns: repeat(2, minmax(0, 1fr));
        gap: var(--origam-space---6, 1.5rem);
        align-items: center;
        padding: var(--origam-space---8, 2rem);
    }

    &__window :deep(.origam-code__code span) {
        color: var(--shiki-dark);
    }

    &__variants {
        display: flex;
        flex-wrap: wrap;
        align-items: center;
        justify-content: center;
        gap: var(--origam-space---4, 1rem);
        padding: var(--origam-space---10, 2.5rem) var(--origam-space---6, 1.5rem);
    }
}

@media (max-width: 1024px) {
    .home-playground__block {
        grid-template-columns: 1fr;
        padding: var(--origam-space---4, 1rem);
    }
}
</style>
