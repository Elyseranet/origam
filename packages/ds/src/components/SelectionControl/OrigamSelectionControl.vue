<template>
  <div
    :class="selectionControlClasses"
    :style="selectionControlStyles"
    v-bind="rootAttrs"
  >
    <div
      :class="selectionControlWrapperClasses"
      :style="wrapperColorStyles"
    >
      <slot
        name="default"
        v-bind="{ model, color, bgColor, icon, props: { onFocus: handleFocus, onBlur: handleBlur, id } }"
      />

      <div
        v-ripple="rippleProp"
        :class="selectionControlInputClasses"
        :style="selectionControlInputStyles"
      >
        <slot
          name="input"
          v-bind="{ model, color, bgColor, icon, props: { ...inputAttrs, disabled: disabled, label: label, name: name, type: type, value: trueValue, onFocus: handleFocus, onBlur: handleBlur, id, onInput: handleInput } }"
        >
          <template v-if="icon">
            <origam-icon
              key="icon"
              :icon="icon"
              :color="bgColor"
            />
          </template>

          <input
            :id="id"
            ref="inputRef"
            :aria-checked="type === 'checkbox' ? model : undefined"
            :aria-disabled="disabled"
            :aria-label="label"
            :checked="model"
            :disabled="disabled"
            :name="name"
            :type="type"
            :value="trueValue"
            v-bind="inputAttrs"
            @blur="handleBlur"
            @focus="handleFocus"
            @input="handleInput"
          />
        </slot>
      </div>
    </div>

    <div
      v-if="label || $slots.label"
      class="origam-selection-control__label"
    >
      <slot name="label" v-bind="{text: label, color, props: { id, onClick: handleClickLabel, ...labelProps}}">
        <origam-label
          ref="origamLabelRef"
          :for="id"
          :text="label"
          :color="color"
          v-bind="labelProps"
          @click="handleClickLabel"
        />
      </slot>
    </div>
  </div>
</template>

<script
  lang="ts"
  setup
>
  import { computed, inject, nextTick, ref, shallowRef, StyleValue, useAttrs } from 'vue'

  import { ORIGAM_SELECTION_CONTROL_GROUP_KEY } from "../../consts";
  import type { TOrigamLabel } from "../../types";
  import { OrigamIcon, OrigamLabel } from '../../components'

  import {
    useBorder,
    useDefaults,
    useDensity,
    useElevation,
    useHover,
    useProps,
    useRounded,
    useStateEffect,
    useStyle,
    useTextColor,
    useVModel
  } from '../../composables'

  import { vRipple } from '../../directives'

  import type { ISelectionControlProps, ISelectionControlSlots } from "../../interfaces"

  import type { ISelectionControlEmits } from '../../interfaces/SelectionControl/selection-control.interface'

  import { deepEqual, filterInputAttrs, forwardRefs, getUid, matchesSelector, wrapInArray } from '../../utils'

  /*********************************************************
   * Global
   *
   * @description
   * Props, emits, slots and filterProps for the SelectionControl
   * component. Defaults are resolved against the closest
   * `provideDefaults({ 'origam-selection-control': … })` injected
   * by a parent `OrigamSelectionControlGroup`.
   ********************************************************/
  const _props = withDefaults(defineProps<ISelectionControlProps>(), {})

  const props = useDefaults(_props)

  const emits = defineEmits<ISelectionControlEmits>()

  defineSlots<ISelectionControlSlots>()

  const { filterProps } = useProps<ISelectionControlProps>(props)

  /*********************************************************
   * DOM refs & group
   *
   * @description
   * Input element ref for force-update path. Group inject for
   * linked SelectionControlGroup parent.
   ********************************************************/
  const inputRef = ref<HTMLInputElement>()

  const attrs = useAttrs()

  const group = inject(ORIGAM_SELECTION_CONTROL_GROUP_KEY, undefined)

  /*********************************************************
   * Value & model
   *
   * @description
   * Density classes, v-model, true/false value derivation,
   * multiple mode and value comparator.
   ********************************************************/

  /*********************************************************
   * Composables
   ********************************************************/

  const { densityClasses } = useDensity(props)


  const { isHover, hoverState } = useHover(props)
  useStateEffect(props, isHover, undefined, hoverState, undefined)
  /*********************************************************
   * Value
   ********************************************************/

  const modelValue = useVModel(props, 'modelValue')

  const trueValue = computed(() => {
    return props.trueValue !== undefined ? props.trueValue : props.value !== undefined ? props.value : true
  })
  const falseValue = computed(() => {
    return props.falseValue !== undefined ? props.falseValue : false
  })
  const isMultiple = computed(() => {
    return !!props.multiple || (props.multiple == null && Array.isArray(modelValue.value))
  })
  const valueComparator = computed(() => {
    return props.valueComparator ?? deepEqual
  })

  const model = computed({
    get() {
      const val = group ? group.modelValue.value : modelValue.value

      return isMultiple.value
        ? wrapInArray(val).some((v: any) => valueComparator.value(v, trueValue.value))
        : valueComparator.value(val, trueValue.value)
    },
    set(val: boolean) {
      if (props.readonly) return

      const currentValue = val ? trueValue.value : falseValue.value

      let newVal = currentValue

      if (isMultiple.value) {
        newVal = val
          ? [ ...wrapInArray(modelValue.value), currentValue ]
          : wrapInArray(modelValue.value).filter((item: any) => !valueComparator.value(item, trueValue.value))
      }

      if (group) {
        group.modelValue.value = newVal
      } else {
        modelValue.value = newVal
      }
    }
  })

  const icon = computed(() => {
    return model.value ? props.trueIcon : props.falseIcon
  })

  const uid = getUid()
  const isFocused = shallowRef(false)
  const isFocusVisible = shallowRef(false)
  const id = computed(() => props.id || `input-${ uid }`)
  const isInteractive = computed(() => {
    return !props.disabled && !props.readonly
  })

  group?.onForceUpdate(() => {
    if (inputRef.value) {
      inputRef.value.checked = model.value
    }
  })

  /*********************************************************
   * Event handlers
   *
   * @description
   * Focus, blur, label click and input change handlers.
   ********************************************************/
  const origamLabelRef = ref<TOrigamLabel>()

  /*********************************************************
   * Forwarded props
   ********************************************************/

  const labelProps = computed(() => {
    return origamLabelRef.value?.filterProps(props, [ 'text', 'color', 'bgColor', 'border', 'elevation', 'class', 'style', 'id', 'for' ])
  })

  const handleFocus = (e: FocusEvent) => {
    if (!isInteractive.value) return

    isFocused.value = true
    if (matchesSelector(e.target as HTMLElement, ':focus-visible') !== false) {
      isFocusVisible.value = true
    }
  }
  const handleBlur = () => {
    isFocused.value = false
    isFocusVisible.value = false
  }
  const handleClickLabel = (e: MouseEvent) => {
    emits('click:label', e)
  }
  const handleInput = (e: Event) => {
    if (!isInteractive.value) return

    if (props.readonly && group) {
      nextTick(() => group.forceUpdate())
    }
    model.value = (e.target as HTMLInputElement).checked
  }

  const [ rootAttrs, inputAttrs ] = filterInputAttrs(attrs)

  const color = computed(() => {
    if (props.error || props.disabled) return undefined

    return model.value ? (props.activeColor || props.color) : props.color
  })
  const bgColor = computed(() => {
    if (props.error || props.disabled) return undefined

    return model.value ? (props.activeBgColor || props.bgColor) : props.bgColor
  })

  // Phase 5 — fix Switch thumb tint regression (commit 5039394).
  // The wrapper carries the consumer's `color` intent so that:
  //   • The Switch thumb can pick the tint up via `currentColor` (the
  //     SCSS rule `.origam--color-{intent} &__thumb { background-color:
  //     currentColor }` re-instates the previous behaviour with the
  //     class-first selector instead of the brittle `[style*="color:"]`
  //     attribute selector).
  //   • Legacy raw colors (hex/rgb) keep working through the inline
  //     style fallback — `useTextColor` returns `[]` for non-tokenisable
  //     values and pushes the inline declaration only.

  /*********************************************************
   * Color
   ********************************************************/

  const { textColorClasses: wrapperColorClasses, textColorStyles: wrapperColorStyles } = useTextColor(color)

  // Props-first (lot 4 theming fix, issue #241) — `border` / `rounded` /
  // `elevation` are declared on `ISelectionControlProps` (Commons
  // interfaces) but were never consumed anywhere: neither Checkbox nor
  // Radio read them, so a theme's `'origam-checkbox': { rounded: 'md' }`
  // was a silent no-op. `__input` is the element that owns the visible
  // state-layer box (the circular hit/hover area sitting behind the
  // glyph) — mirrors `OrigamSwitchTrack`'s "the box owns the surface"
  // pattern. NOTE: the checkbox/radio glyph itself is a `mdi-*` icon-font
  // character rendered by `<origam-icon>` — a font glyph has no
  // border-radius/border/box-shadow of its own, so these props change the
  // state-layer box around the glyph, not the glyph's own silhouette
  // (tracked separately, see #241 rendering aggravation note).
  const { borderClasses, borderStyles } = useBorder(props)
  const { roundedClasses, roundedStyles } = useRounded(props)
  const { elevationClasses, elevationStyles } = useElevation(props)

  const rippleProp = computed(() => {
    if (props.ripple) {
      return [ !props.disabled && !props.readonly, null, [ 'center', 'circle' ] ]
    }

    return [ false, null, [ 'center', 'circle' ] ]
  })

  /*********************************************************
   * Class & Style
   *
   * @description
   * selectionControlStyles and selectionControlClasses compose
   * the BEM block.
   ********************************************************/
  const selectionControlStyles = computed(() => {
    return [
      props.style
    ] as StyleValue
  })
  const selectionControlWrapperClasses = computed(() => {
    return [
      'origam-selection-control__wrapper',
      wrapperColorClasses.value
    ]
  })
  const selectionControlInputClasses = computed(() => {
    return [
      'origam-selection-control__input',
      borderClasses.value,
      roundedClasses.value,
      elevationClasses.value
    ]
  })
  const selectionControlInputStyles = computed(() => {
    return [
      borderStyles.value,
      roundedStyles.value,
      elevationStyles.value
    ] as StyleValue
  })
  const selectionControlClasses = computed(() => {
    return [
      'origam-selection-control',
      {
        'origam-selection-control--dirty': model.value,
        'origam-selection-control--disabled': props.disabled,
        'origam-selection-control--error': props.error,
        'origam-selection-control--focused': isFocused.value,
        'origam-selection-control--focus-visible': isFocusVisible.value,
        'origam-selection-control--inline': props.inline
      },
      densityClasses.value,
      props.class
    ]
  })
  const { id: styleId, css, load, isLoaded, unload } = useStyle(selectionControlStyles)


  /*********************************************************
   * Expose
   *
   * @description
   * Exposes filterProps to parent ref consumers, forwarded
   * through inputRef.
   ********************************************************/
  defineExpose(forwardRefs({
    filterProps,
    css,
    id,
    load,
    unload,
    isLoaded,
    styleId
  }, inputRef))
</script>

<style
  lang="scss"
  scoped
>
  .origam-selection-control {
    $this: &;

    align-items: center;
    contain: layout;
    display: flex;
    flex: 1 0;
    position: relative;
    user-select: none;

    .origam-label {
      white-space: normal;
      word-break: break-word;
      height: 100%;
    }

    &__wrapper {
      width: calc(40px + 1.5 * var(--origam-selection-control--density, 0px));
      height: calc(40px + 1.5 * var(--origam-selection-control--density, 0px));
      display: inline-flex;
      align-items: center;
      position: relative;
      justify-content: center;
      flex: none;
    }

    &__input {
      width: calc(40px + 1.5 * var(--origam-selection-control--density, 0px));
      height: calc(40px + 1.5 * var(--origam-selection-control--density, 0px));
      align-items: center;
      display: flex;
      flex: none;
      justify-content: center;
      position: relative;
      border-radius: 50%;
      backdrop-filter: var(--origam-selection-control__input---backdrop-filter, none);
      -webkit-backdrop-filter: var(--origam-selection-control__input---backdrop-filter, none);

      > .origam-icon {
        opacity: 0.7;
      }

      :deep(input) {
        cursor: pointer;
        position: absolute;
        left: 0;
        top: 0;
        width: 100%;
        height: 100%;
        opacity: 0;
      }

      &:before {
        content: "";
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        // Le halo suit la forme du contrôle. Codé en dur à 100%, il restait
        // circulaire même sous `rounded="md"` : la seule surface que la prop
        // pouvait peindre au repos ignorait la prop. `inherit` reprend le
        // border-radius résolu par `useRounded` sur `__input`.
        border-radius: inherit;
        background-color: currentColor;
        opacity: 0;
        pointer-events: none;
      }

      &:hover {
        &:before {
          opacity: 0.04;
        }
      }
    }

    &--disabled,
    &--dirty,
    &--error {
      #{$this}__input {
        > .origam-icon {
          opacity: 1;
        }
      }
    }

    &--error,
    &--disabled {
      .origam-label {
        opacity: 1;
      }
    }

    &--disabled {
      opacity: 0.5;
      pointer-events: none;
    }

    &--error {
      :not(#{$this}--disabled) {
        .origam-label {
          color: var(--origam-selection-control__label---color-error, var(--origam-color__feedback--danger---fgSubtle, #B91C1C));
        }

        #{$this}__input {
          > .origam-icon {
            color: var(--origam-selection-control__icon---color-error, var(--origam-color__feedback--danger---fgSubtle, #B91C1C));
          }
        }
      }
    }

    &--inline {
      display: inline-flex;
      flex: 0 0 auto;
      min-width: 0;
      max-width: 100%;

      .origam-label {
        width: auto;
      }
    }

    &--focus-visible {
      #{$this}__input {
        &:before {
          opacity: calc(0.12 * 1);
        }

        outline: var(--origam-border__width---2, 2px) solid var(--origam-color__border---focus, currentColor);
        outline-offset: var(--origam-space---1, 2px);
        border-radius: 50%;
      }
    }

    &--density-default {
      --origam-selection-control--density: 0px;
    }

    &--density-compact {
      --origam-selection-control--density: -8px;
    }

    &--density-comfortable {
      --origam-selection-control--density: 8px;
    }
  }
</style>

