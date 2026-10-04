<template>
  <origam-text-field
    :model-value="valueLabel"
    :label="label"
    :title="valueLabel"
    variant="outlined"
    density="compact"
    width="100%"
    readonly
    hide-details
    role="button"
    aria-haspopup="dialog"
    :aria-expanded="open ? 'true' : 'false'"
    class="tbc-trigger"
    :class="{ 'tbc-trigger--hint': hint }"
    :aria-label="label"
    :data-cy="`${dataCy}-trigger`"
    @mousedown:control="handleMousedownControl"
  >
    <template
      v-if="swatch"
      #prependInner
    >
            <span
              class="tbc-trigger__swatch"
              :class="swatchClass"
              :style="swatchStyle"
              aria-hidden="true"
            />
    </template>

    <template #default>
      <origam-menu
        v-model="open"
        :close-on-content-click="false"
        :open-on-click="false"
        activator="parent"
        location="bottom"
        class="tbc-menu"
      >
        <template #default>
          <div
            class="tbc-popover"
            :data-cy="`${dataCy}-popover`"
          >
            <slot />
          </div>
        </template>
      </origam-menu>
    </template>

    <template #appendInner>
      <origam-icon
        :icon="MDI_ICONS.CHEVRON_DOWN"
        class="tbc-trigger__menu-icon"
        aria-hidden="true"
      />
    </template>
  </origam-text-field>
</template>

<script setup lang="ts">
import { MDI_ICONS } from 'origam/enums'

/**
 * ThemeBuilderControlTrigger — shared trigger FIELD + popover shell for the
 * 5 rich theme-builder controls (Color, Rounded, Elevation, Border, Box
 * model). These are FIELDS, not buttons: the surrounding column is a stack
 * of `<origam-select>` / `<origam-number-field>` controls, and a rich
 * control that opens a popover is still conceptually "pick a value" — the
 * same job a select does. Built directly on `<origam-text-field>` (readonly,
 * click-to-open), mirroring exactly how `OrigamColorPickerField` and
 * `OrigamSelect` themselves compose `OrigamTextField` for a "click the
 * field to open a rich popover" interaction: same chrome (border, radius,
 * height, focus/hover), same prepend/append slot anatomy (swatch in
 * `prependInner`, chevron in `appendInner`), same `activator="parent"` +
 * `open-on-click="false"` + manual `@mousedown:control` toggle. A previous
 * version built this on `<origam-btn variant="outlined">`, which is why it
 * rendered as a pill next to the square-ish fields beside it — two visual
 * families in the same column. Owns only the open/close chrome; every
 * field-specific composable/markup lives in the consuming component's
 * default slot.
 */
withDefaults(defineProps<{
    label: string
    valueLabel: string
    hint?: boolean
    swatch?: boolean
    swatchClass?: string
    swatchStyle?: Record<string, string>
    dataCy: string
}>(), {
    hint: false,
    swatch: false,
    swatchClass: undefined,
    swatchStyle: undefined
})

const open = defineModel<boolean>('open', { default: false })

const handleMousedownControl = (): void => {
    open.value = !open.value
}
</script>

<style scoped lang="scss">
.tbc-trigger {
    inline-size: 100%;

    :deep(input) {
        cursor: pointer;
        caret-color: transparent;
        /*
         * The value text was truncating ("Primary" → "Pr") because an
         * ancestor's grid/flex chain sizes the control track to
         * content rather than stretching into the row's actual
         * available width (verified: neither `inline-size: 100%` nor
         * the DS `width` prop on the trigger's own root reaches this
         * far — the constraint originates deeper, in the field's
         * internal layout). A `min-inline-size` on the input itself
         * is the one lever that reliably forces every ancestor's
         * min-content calculation to accommodate common intent values
         * ("Primary", "Secondary", "Warning") without truncating. #251
         */
        min-inline-size: 4.5rem;

        /*
         * 4.5rem covers every common intent value (Primary, Secondary,
         * Success, Warning, Danger, Info, Neutral, Ghost) without
         * truncating. Longer composite labels (e.g. the border
         * control's "None · Inherited from theme" default state)
         * still won't fit a narrow sidebar column at any reasonable
         * width — ellipsis + the `title` attribute above (native
         * tooltip with the full text) is the intended fallback for
         * those, not a further width increase. #251
         */
        text-overflow: ellipsis;
    }

    &--hint {
        :deep(input) {
            font-style: italic;
            color: var(--origam-color-text-subtle);
        }
    }

    &__swatch {
        flex: 0 0 auto;
        inline-size: 0.875rem;
        block-size: 0.875rem;
        border-radius: var(--origam-radius-sm, 0.25rem);
        border: 1px solid var(--origam-color-border-default);
    }

    &__menu-icon {
        pointer-events: none;
    }
}

.tbc-popover {
    display: flex;
    flex-direction: column;
    gap: var(--origam-spacing-3, 0.75rem);
    padding: var(--origam-spacing-3, 0.75rem);
    inline-size: 16rem;
}
</style>
