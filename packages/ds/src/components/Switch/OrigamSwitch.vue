<template>
  <div
    v-if="isSkeletonLoading"
    class="origam-switch__skeleton"
    :class="{ 'origam-switch__skeleton--inset': inset }"
    aria-busy="true"
    :aria-label="loadingLabel"
    role="status"
    data-cy="origam-switch-skeleton"
  >
    <span class="origam-switch__skeleton-track"/>
    <span class="origam-switch__skeleton-thumb"/>
  </div>

  <origam-input
    v-else
    :id="id"
    ref="origamInputRef"
    v-model="model"
    :class="switchClasses"
    :focused="isFocused"
    :style="switchStyles"
    v-bind="{ ...rootAttrs, ...inputProps }"
  >
    <template #default="{id, messagesId, isDisabled, isReadonly, isValid}">
      <origam-selection-control
        :id="id"
        ref="origamSelectionControlRef"
        v-model="model"
        :aria-checked="indeterminate ? 'mixed' : undefined"
        :aria-describedby="messagesId"
        :disabled="isDisabled"
        :readonly="isReadonly"
        type="checkbox"
        v-bind="{ ...controlProps, ...controlAttrs }"
        @blur="handleBlur"
        @focus="handleFocus"
        @update:model-value="handleChange"
      >
        <template #default="{bgColor: scBgColor}">
          <origam-switch-track
            ref="origamSwitchTrackRef"
            :bg-color="scBgColor"
            :disabled="isDisabled"
            :error="isValid === false"
            :inset="inset"
            :is-valid="isValid"
            :model-value="model"
            :readonly="isReadonly"
            v-bind="{ ...trackProps }"
            @click="handleTrackClick"
          >
            <template
              v-if="slots['track.true']"
              #track.true="slotProps"
            >
              <slot
                name="track.true"
                v-bind="slotProps"
              />
            </template>

            <template
              v-if="slots['track.false']"
              #track.false="slotProps"
            >
              <slot
                name="track.false"
                v-bind="slotProps"
              />
            </template>

            <template
              v-if="isLineLoading"
              #overlay
            >
              <origam-progress
                :active="loaderConfig.isActive"
                :color="color"
                :indeterminate="loaderConfig.indeterminate"
                :model-value="loaderConfig.modelValue"
                :type="PROGRESS_TYPE.LINEAR"
                class="origam-switch__progress origam-switch__progress--linear"
                data-cy="origam-switch-progress-linear"
                v-bind="loaderConfig.overrides"
              />
            </template>
          </origam-switch-track>
        </template>

        <template #input="{model, icon, props: selectionControlProps}">
          <input
            ref="input"
            :aria-checked="selectionControlProps.type === 'checkbox' ? model : undefined"
            :aria-disabled="selectionControlProps.disabled"
            :aria-label="selectionControlProps.label"
            :checked="model"
            v-bind="selectionControlProps"
          />
          <div
            :class="getSwitchThumbClasses(icon)"
            :style="switchThumbStyles"
          >
            <origam-translate-scale>
              <div
                v-if="hasCircularLoading"
                class="origam-switch__loader"
              >
                <slot name="loader">
                  <origam-progress
                    :active="loaderConfig.isActive"
                    :color="color"
                    :indeterminate="loaderConfig.indeterminate"
                    :model-value="loaderConfig.modelValue"
                    :size="SIZES.X_SMALL"
                    :type="PROGRESS_TYPE.CIRCULAR"
                    class="origam-switch__progress origam-switch__progress--circular"
                    thickness="2"
                    v-bind="loaderConfig.overrides"
                  />
                </slot>
              </div>

              <origam-icon
                v-else-if="icon"
                :icon="icon"
                size="x-small"
              />
            </origam-translate-scale>
          </div>
        </template>
      </origam-selection-control>
    </template>
  </origam-input>
</template>

<script
  lang="ts"
  setup
>
  import { computed, ref, StyleValue, useAttrs, useSlots } from 'vue'
  import {
    OrigamIcon,
    OrigamInput,
    OrigamProgress,
    OrigamSelectionControl,
    OrigamSwitchTrack,
    OrigamTranslateScale
  } from '../../components'

  import {
    useDefaults,
    useFocus,
    useHover,
    useLoader,
    useLocale,
    useProps,
    useRounded,
    useStateEffect,
    useStyle,
    useVModel
  } from '../../composables'

  import { DENSITY, LOADER_KIND, PROGRESS_TYPE, SIZES } from '../../enums'

  import type { ISwitchProps } from "../../interfaces"

  import type { ISwitchEmits, ISwitchSlots } from '../../interfaces/Switch/switch.interface'

  import type { TOrigamInput, TOrigamSelectionControl, TOrigamSwitchTrack } from "../../types"

  import { filterInputAttrs, getUid } from '../../utils'

  /*********************************************************
   * Global
   *
   * @description
   * Props, emits and composables.
   ********************************************************/

  const _props = withDefaults(defineProps<ISwitchProps>(), {
    density: DENSITY.DEFAULT,
    centerAffix: true
  })

  // `useDefaults` resolves each prop against the closest
  // `provideDefaults({ 'origam-switch': … })` (e.g. a marketing theme's
  // `components` block). Without this hook a theme's `border`/`rounded`/
  // `elevation` config for Switch is silently dropped — `OrigamSwitchTrack`
  // already consumes these props correctly once they arrive (see its own
  // `useBorder`/`useRounded`/`useElevation` wiring), this was the missing
  // link one level up. Mirrors `OrigamBtn.vue`'s exact pattern.
  const props = useDefaults(_props)

  defineEmits<ISwitchEmits>()

  defineSlots<ISwitchSlots>()


  const { isHover, hoverState } = useHover(props)
  useStateEffect(props, isHover, undefined, hoverState, undefined)
  const { filterProps } = useProps<ISwitchProps>(props)

  const origamSelectionControlRef = ref<TOrigamSelectionControl>()
  const origamInputRef = ref<TOrigamInput>()
  const origamSwitchTrackRef = ref<TOrigamSwitchTrack>()

  /*********************************************************
   * Value
   *
   * @description
   * Model binding, indeterminate state and focus handling.
   ********************************************************/

  const indeterminate = useVModel(props, 'indeterminate')
  const model = useVModel(props, 'modelValue')

  /*********************************************************
   * Effect
   ********************************************************/

  const { isFocused, onFocus: handleFocus, onBlur: handleBlur } = useFocus(props)
  const attrs = useAttrs()
  const slots = useSlots()

  const { loaderClasses, loaderConfig } = useLoader(props, LOADER_KIND.CIRCULAR)

  const { t } = useLocale()
  const loadingLabel = computed(() => t('origam.loading'))

  const uid = getUid()
  const id = computed(() => {
    return props.id || `switch-${ uid }`
  })

  /*********************************************************
   * Event handlers
   *
   * @description
   * Change and track-click handlers.
   ********************************************************/

  const handleChange = () => {
    if (indeterminate.value) {
      indeterminate.value = false
    }
  }
  const handleTrackClick = (_e: MouseEvent) => {
    // `OrigamSwitchTrack` already calls `stopPropagation` /
    // `preventDefault` on the native event before emitting — we just
    // need to forward the click to the hidden `<input>` so the
    // SelectionControl picks it up and toggles `model`.
    ;(origamSelectionControlRef.value as any)?.inputRef?.click()
  }

  /*********************************************************
   * Props forwarding
   *
   * @description
   * Filtered attrs and props passed down to inner components.
   * `color` and `bgColor` are STRICTLY scoped to the SelectionControl
   * (track / thumb / label). Stripping them from `inputProps` prevents
   * `OrigamInput` (the outer row wrapper) from also applying them as
   * `background-color` on its root — pre-fix the consumer's
   * `bg-color="success"` painted the entire switch row green
   * (including the label area), instead of just the track.
   ********************************************************/

  const [ rootAttrs, controlAttrs ] = filterInputAttrs(attrs)

  /*********************************************************
   * Forwarded props
   ********************************************************/

  const inputProps = computed(() => {
    return origamInputRef.value?.filterProps(props, [ 'modelValue', 'class', 'focused', 'id', 'style', 'color', 'bgColor', 'activeColor', 'activeBgColor', 'hoverColor', 'hoverBgColor' ])
  })
  const controlProps = computed(() => {
    return origamSelectionControlRef.value?.filterProps(props, [ 'modelValue', 'type', 'disabled', 'readonly', 'class', 'style', 'id' ])
  })

  // Props-first (lot 4 theming fix) — `border`/`rounded`/`elevation` are
  // declared on `ISwitchProps` (Commons interfaces) AND now on
  // `ISwitchTrackProps`; `filterProps` auto-forwards only the prop names
  // the track actually declares, so this stays in sync automatically as
  // the track's surface grows. Everything already bound explicitly above
  // (`bgColor`, `disabled`, `readonly`, `error`, `inset`, `isValid`,
  // `modelValue`) is excluded here so this generic forward can never
  // clobber those computed (`isDisabled`/`isReadonly`) values.
  const trackProps = computed(() => {
    return origamSwitchTrackRef.value?.filterProps(props, [ 'modelValue', 'disabled', 'readonly', 'error', 'inset', 'isValid', 'bgColor', 'color', 'class', 'style', 'id' ])
  })

  /*********************************************************
   * Loader
   *
   * @description
   * Derived flags combining slot and prop loading states.
   ********************************************************/

    // True when the whole switch should be replaced by a skeleton placeholder.
  const isSkeletonLoading = computed(() => {
      return loaderConfig.value.isActive && loaderConfig.value.kind === 'skeleton'
    })

  /**
   * True when the active loader kind is `'line'` — a thin linear
   * progress that overlays the track at the switch's full width
   * (52 × 32 footprint). Visually completes the existing skeleton
   * and circular variants:
   *   - `'circular'`  → spinning circle INSIDE the thumb (default).
   *   - `'line'`      → indeterminate line ACROSS the track.
   *   - `'skeleton'`  → custom switch-shaped placeholder block.
   */
  const isLineLoading = computed(() => {
    return loaderConfig.value.isActive && loaderConfig.value.kind === 'line'
  })

  /**
   * True when the thumb itself should host the spinner — i.e. any
   * active loader EXCEPT the line variant (which lives on the
   * track) or skeleton (which replaces the whole switch).
   */
  const hasCircularLoading = computed(() => {
    if (slots.loader) return true
    const cfg = loaderConfig.value
    return cfg.isActive && cfg.kind !== 'line' && cfg.kind !== 'skeleton'
  })

  /*********************************************************
   * Class & Style
   *
   * @description
   * Root element classes and inline styles.
   ********************************************************/

  const switchStyles = computed(() => {
    return [
      props.style
    ] as StyleValue
  })

  // The thumb follows the SAME `rounded` config as the track (lot 4
  // fix) — a themed switch with a low-rounded track (e.g. geek's
  // `rounded: 'sm'`) previously kept a perfect circle thumb regardless,
  // reading as visually inconsistent ("track is square-ish, thumb is
  // still a dot"). Reuses `useRounded` directly against `props` (the
  // exact same source value forwarded to the track via `trackProps`),
  // so track and thumb can never drift out of sync. Emits an inline
  // `border-radius` declaration only when `rounded` is actually set —
  // unset/default falls through to the existing CSS fallback
  // (`var(--origam-switch__thumb---border-radius, 50%)`, a full
  // circle), so this is additive and changes nothing for switches that
  // don't configure `rounded`. Bound on the thumb's OWN `:style`, not
  // the wrapper's — the documented Switch-thumb v2.0→v2.1 regression
  // was about `[style*="color:"]` on `.origam-selection-control__wrapper`
  // specifically, unaffected by an unrelated attribute on a different
  // element.
  const { roundedStyles: thumbRoundedStyles } = useRounded(props, 'origam-switch__thumb')
  const switchThumbStyles = computed(() => {
    return [
      thumbRoundedStyles.value
    ] as StyleValue
  })
  const getSwitchThumbClasses = (icon: unknown) => {
    return [
      'origam-switch__thumb',
      { 'origam-switch__thumb--filled': !!icon || loaderConfig.value.isActive }
    ]
  }
  const switchClasses = computed(() => {
    return [
      'origam-switch',
      {
        'origam-switch--flat': props.flat,
        'origam-switch--inset': props.inset,
        'origam-switch--indeterminate': indeterminate.value
      },
      loaderClasses.value,
      props.class
    ]
  })
  const { id: styleId, css, load, isLoaded, unload } = useStyle(switchStyles)


  /*********************************************************
   * Expose
   *
   * @description
   * Public API surface exposed to parent components.
   ********************************************************/

  defineExpose({
    filterProps,
    css,
    id,
    load,
    unload,
    isLoaded,
    styleId
  })
</script>

<style
  lang="scss"
  scoped
>
  @keyframes origam-switch-skeleton-pulse {
    0%, 100% {
      opacity: 1;
    }
    50% {
      opacity: 0.55;
    }
  }

  .origam-switch__skeleton {
    position: relative;
    display: inline-block;
    width: var(--origam-switch__skeleton---width, 52px);
    height: var(--origam-switch__skeleton---height, 32px);
    animation: origam-switch-skeleton-pulse 1.6s ease-in-out infinite;

    @media (prefers-reduced-motion: reduce) {
      animation: none;
    }

    .origam-switch__skeleton-track {
      position: absolute;
      inset: 0;
      border-radius: 999px;
      background-color: var(--origam-switch__skeleton-track---background-color, color-mix(in srgb, currentColor 14%, transparent));
    }

    .origam-switch__skeleton-thumb {
      position: absolute;
      top: 50%;
      left: 6px;
      width: 20px;
      height: 20px;
      border-radius: 50%;
      transform: translateY(-50%);
      background-color: var(--origam-switch__skeleton-thumb---background-color, color-mix(in srgb, currentColor 28%, transparent));
      box-shadow: 0 1px 2px rgba(0, 0, 0, 0.12);
    }

    &--inset {
      .origam-switch__skeleton-thumb {
        width: 24px;
        height: 24px;
        left: 4px;
      }
    }
  }

  .origam-switch {
    $this: &;

    :deep(.origam-label) {
      padding-inline-start: 10px;
    }

    &__progress--linear {
      position: absolute !important;
      inset: 0 !important;
      width: 100% !important;
      height: 100% !important;
      line-height: 1 !important;
      border-radius: inherit;
      pointer-events: none;
      z-index: 0;
      overflow: hidden;

      :deep(.origam-progress__background),
      :deep(.origam-progress__loader),
      :deep(.origam-progress__bar) {
        height: 100% !important;
      }
    }

    &__loader {
      display: flex;

      .origam-progress {
        color: currentColor;
      }
    }

    &__thumb {
      transition: none;

      @media (forced-colors: active) {
        border: 1px solid;
        color: buttontext;
      }
    }

    .origam-selection-control {
      min-height: calc(var(--origam-switch__selection-control---min-height, 56px) + var(--origam-input---density, 0px));

      :deep(.origam-selection-control__wrapper) {
        width: max-content;
        height: max-content;
        min-width: calc(40px + 1.5 * var(--origam-selection-control--density, 0px));
        min-height: calc(40px + 1.5 * var(--origam-selection-control--density, 0px));
      }

      :deep(.origam-selection-control__input) {
        border-radius: 50%;
        transition: 0.2s transform cubic-bezier(0.4, 0, 0.2, 1);
        position: absolute;
        transform: translateX(-10px);

        .origam-icon {
          position: absolute;
        }
      }

      &--dirty {
        :deep(.origam-selection-control__input) {
          transform: translateX(10px);
        }
      }

      &--error {
        &:not(.origam-selection-control--disabled) {
          #{$this}__thumb {
            background-color: rgba(255, 0, 0, 1);
            color: rgba(255, 255, 255, 1);
          }
        }
      }
    }

    &.origam-input {
      flex: 0 1 auto;

      &--vertical {
        :deep(.origam-label) {
          min-width: max-content;
        }

        :deep(.origam-selection-control__wrapper) {
          transform: rotate(-90deg);
        }
      }
    }

    .origam-selection-control__wrapper.origam--color-primary &__thumb,
    .origam-selection-control__wrapper.origam--color-secondary &__thumb,
    .origam-selection-control__wrapper.origam--color-success &__thumb,
    .origam-selection-control__wrapper.origam--color-warning &__thumb,
    .origam-selection-control__wrapper.origam--color-danger &__thumb,
    .origam-selection-control__wrapper.origam--color-info &__thumb,
    .origam-selection-control__wrapper.origam--color-neutral &__thumb {
      background-color: currentColor;
    }

    .origam-selection-control__wrapper[style*="color:"] &__thumb {
      background-color: currentColor;
    }

    &__thumb {
      align-items: center;
      background-color: var(--origam-switch__thumb---background-color, rgb(255, 255, 255));
      color: var(--origam-switch__thumb---color, currentColor);
      border: 1px solid var(--origam-switch__thumb---border-color, rgba(0, 0, 0, 0.18));
      border-radius: var(--origam-switch__thumb---border-radius, 50%);
      display: flex;
      font-size: 0.75rem;
      height: var(--origam-switch__thumb---size, 20px);
      justify-content: center;
      width: var(--origam-switch__thumb---size, 20px);
      pointer-events: none;
      transition: 0.15s 0.05s transform cubic-bezier(0, 0, 0.2, 1), 0.2s color cubic-bezier(0.4, 0, 0.2, 1), 0.2s background-color cubic-bezier(0.4, 0, 0.2, 1), 0.2s border-color cubic-bezier(0.4, 0, 0.2, 1);
      position: relative;
      overflow: hidden;

      @media (forced-colors: active) {
        background-color: buttontext;
      }
    }

    &#{$this}--inset {

      #{$this}__thumb {
        height: 24px;
        width: 24px;
        transform: scale(0.6666666667);

        &--filled {
          transform: none;
        }
      }

      .origam-selection-control {
        &--dirty {
          #{$this}__thumb {
            transform: none;
            transition: 0.15s 0.05s transform cubic-bezier(0, 0, 0.2, 1);
          }
        }

      }

      :deep(.origam-selection-control__wrapper) {
        width: auto;
      }

      &:not(#{$this}--loading) {
        &:not(.origam-input--disabled) {
          .origam-selection-control--dirty {
            #{$this}__thumb {
              @media (forced-colors: active) {
                background-color: highlighttext;
                color: highlighttext;
              }
            }
          }
        }
      }
    }

    &#{$this}--indeterminate {
      :deep(.origam-selection-control__input) {
        transform: scale(0.8);
      }

      #{$this}__thumb {
        transform: scale(0.75);
      }
    }

    &#{$this}--disabled {
      #{$this}__thumb {
        @media (forced-colors: active) {
          background-color: graytext;
          color: graytext;
        }
      }
    }

    &#{$this}--loading {
      #{$this}__thumb {
        @media (forced-colors: active) {
          background-color: canvas;
        }
      }

      &#{$this}--inset,
      &#{$this}--indeterminate {
        #{$this}__thumb {
          @media (forced-colors: active) {
            border-width: 0;
          }
        }
      }
    }

    &:not(.origam-input--loading) {
      &:not(.origam-input--disabled) {
        .origam-selection-control--dirty {
          #{$this}__thumb {
            @media (forced-colors: active) {
              background-color: highlight;
            }
          }
        }
      }
    }

    &:not(.origam-input--disabled) {
      .origam-selection-control--dirty {
        #{$this}__thumb {
          @media (forced-colors: active) {
            color: highlight;
          }
        }
      }
    }
  }
</style>

