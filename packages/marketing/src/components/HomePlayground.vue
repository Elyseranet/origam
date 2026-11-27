<template>
  <section
    id="playground"
    class="home-playground"
    :style="edgeStyle"
    aria-labelledby="playground-heading"
  >
    <div class="home-container">
      <h2
        id="playground-heading"
        class="home-playground__sr-title"
      >
        {{ t('home.playground.title', 'A few lines, real components.') }}
      </h2>

      <!-- shortcut: rounded="2xl" n'émet aucune classe (DS #1567), à remplacer quand #1567 sera corrigé -->
      <origam-sheet
        tag="div"
        rounded="var(--origam-radius---2xl)"
        bg-color="var(--origam-color__surface---sunken)"
        class="home-playground__block"
      >
        <origam-theme-provider
          mode="dark"
          class="home-playground__window"
        >
          <origam-code
            :code="snippet"
            lang="vue"
            rounded="xl"
            class="home-playground__code"
            data-cy="playground-code"
          >
            <template #header>
              <span
                class="home-playground__dots"
                aria-hidden="true"
              >
                <origam-icon
                  v-for="tone in dots"
                  :key="tone"
                  icon="mdi-circle"
                  :color="tone"
                  :size="12"
                />
              </span>
              <origam-icon
                icon="mdi-vuejs"
                color="success"
                :size="28"
                class="home-playground__logo"
                aria-hidden="true"
              />
            </template>
          </origam-code>
        </origam-theme-provider>

        <!-- shortcut: rounded="2xl" n'émet aucune classe (DS #1567), à remplacer quand #1567 sera corrigé -->
        <origam-sheet
          tag="div"
          rounded="var(--origam-radius---2xl)"
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
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useT } from '~/composables/useT'
import { ENSO_MASK_DRY_02 } from '~/consts/enso.const'
import { HOME_DEMO_BUTTONS, HOME_DEMO_CODE_BUTTON, HOME_DEMO_DOTS } from '~/consts/playground.const'
import { buildHomeDemoSnippet } from '~/utils/home-demo.util'
import { ensoMaskUrl } from '~/utils/enso.util'

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

const dots = HOME_DEMO_DOTS

const labels = computed(() =>
    Object.fromEntries(buttons.map(({ key, labelKey, labelFallback }) => [key, t(labelKey, labelFallback)]))
)

const snippet = computed(() => buildHomeDemoSnippet(HOME_DEMO_CODE_BUTTON, t(HOME_DEMO_CODE_BUTTON.labelKey, HOME_DEMO_CODE_BUTTON.labelFallback)))

/*********************************************************
 * Bord peint (T2)
 *
 * @description
 * Le geste inversé de `dry-02` qui déborde sur la bibliothèque ; masque
 * servi depuis la même origine, seul son alpha compte.
 ********************************************************/
const edgeStyle = { '--home-mask-edge': ensoMaskUrl(ENSO_MASK_DRY_02) }

defineEmits([])

defineSlots<Record<string, never>>()

defineExpose({})
</script>

<style scoped lang="scss">
.home-playground {
    position: relative;
    z-index: 1;
    overflow-x: clip;
    padding-block: 88px 120px;
    background-color: var(--origam-color__surface---overlay);

    // T2 (demo -> bibliotheque) : la lavande deborde sur le papier par un geste inverse (dry-02, bas plein a 50 %).
    &::after {
        content: '';
        position: absolute;
        z-index: -1;
        inset-inline: -4%;
        inset-block-end: -70px;
        block-size: 140px;
        pointer-events: none;
        background-color: var(--origam-color__surface---overlay);
        transform: scaleY(-1);
        mask: var(--home-mask-edge) 0 0 / 100% 100% no-repeat, linear-gradient(#000 0 0) 0 100% / 100% 50% no-repeat;
    }

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
        grid-template-columns: minmax(0, 1fr) minmax(0, 1.25fr);
        gap: var(--origam-space---6, 1.5rem);
        align-items: center;
        padding: var(--origam-space---8, 2rem) var(--origam-space---12, 3rem);
    }

    &__window {
        /* The window is 18 px / 1.8 like the mockup at x1.8; scoped here, not on every OrigamCode. */
        --origam-code---font-size: var(--origam-font__size---xl, 1.125rem);
        --origam-code---line-height: 1.8;
    }

    &__code {
        overflow: hidden;
    }

    &__dots {
        display: inline-flex;
        gap: var(--origam-space---2, 0.5rem);
    }

    /* The Vue logo sits in the window bar, right-aligned, level with the dots. */
    &__logo {
        margin-inline-start: auto;
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

@media (max-width: 768px) {
    .home-playground::after {
        inset-block-end: -44px;
        block-size: 88px;
    }
}

@media (max-width: 1024px) {
    .home-playground__block {
        grid-template-columns: minmax(0, 1fr);
        padding: var(--origam-space---4, 1rem);
    }
}
</style>
