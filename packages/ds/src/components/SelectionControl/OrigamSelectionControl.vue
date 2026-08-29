<template>
  <div
    :class="selectionControlClasses"
    :style="selectionControlStyles"
    v-bind="rootAttrs"
  >
    <div :class="selectionControlWrapperClasses">
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
  import { computed, inject, nextTick, ref, shallowRef, StyleValue, toRef, useAttrs } from 'vue'

  import { ORIGAM_SELECTION_CONTROL_GROUP_KEY } from '../../consts/SelectionControl/selection-control.const'
  import type { TOrigamLabel } from '../../types/Label/label.type'
  import OrigamIcon from '../Icon/OrigamIcon.vue'
  import OrigamLabel from '../Label/OrigamLabel.vue'

  import { useDensity } from '../../composables/Commons/density.composable'
  import { useProps } from '../../composables/Commons/props.composable'
  import { useStateEffect } from '../../composables/Commons/stateEffect.composable'
  import { useStateFlag } from '../../composables/Commons/stateFlag.composable'
  import { useStyle } from '../../composables/Commons/style.composable'
  import { useVModel } from '../../composables/Commons/vModel.composable'

  import vRipple from '../../directives/Ripple/ripple.directive'

  import type { ISelectionControlProps, ISelectionControlSlots } from '../../interfaces/SelectionControl/selection-control.interface'

  import type { ISelectionControlEmits } from '../../interfaces/SelectionControl/selection-control.interface'

  import { deepEqual, matchesSelector, wrapInArray } from '../../utils/Commons/commons.util'
  import { filterInputAttrs } from '../../utils/Input/input.util'
  import { forwardRefs } from '../../utils/Commons/forwardRefs.util'
  import { getUid } from '../../utils/Commons/getCurrentInstance.util'

  /*********************************************************
   * Global
   *
   * @description
   * Props, emits, slots and filterProps for the SelectionControl
   * component. Defaults are resolved against the closest
   * `provideDefaults({ 'origam-selection-control': … })` injected
   * by a parent `OrigamSelectionControlGroup`.
   ********************************************************/
  /*********************************************************
   * multiple: undefined (#396)
   *
   * @description
   * NOT a no-op default. `multiple` is typed `boolean`, and Vue's own
   * runtime boolean-cast rule turns an ABSENT Boolean-typed prop into the
   * concrete value `false` whenever no `default` is declared for it.
   * @description
   * Declaring one (even `undefined`) disables that cast (`hasDefault`
   * becomes true), so `props.multiple` stays genuinely `undefined` when
   * nobody set it — which is what lets `isMultiple` below tell "nobody
   * said anything" apart from "explicitly false" and fall back to
   * auto-detecting array-based `modelValue`, as documented.
   ********************************************************/
  const props = withDefaults(defineProps<ISelectionControlProps>(), {
    multiple: undefined
  })

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


  const { isOn: isHover, config: hoverState } = useStateFlag(props, {state: 'hover'})
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
  const valueComparator = computed(() => {
    return props.valueComparator ?? deepEqual
  })

  // The model this control reads from and writes back to. Inside a group the
  // group owns the selection; standalone, the control's own `v-model` does.
  // The getter and the setter MUST agree on this source: while the setter
  // rebuilt the array from `modelValue` (the control's own, always empty
  // inside a group) it discarded every previously selected value — checking
  // `b` after `a` emitted `['b']` instead of `['a','b']`, and unchecking
  // filtered an empty array. Read it fresh on each access; both callers are
  // inside a computed's accessor, so the dependency stays tracked.
  const currentModel = () => group ? group.modelValue.value : modelValue.value

  /*********************************************************
   * isMultiple auto-detect (#396)
   *
   * @description
   * Must look at the SAME source as the getter/setter above. It used to
   * read `modelValue.value` unconditionally — the control's own, private
   * v-model — which inside a group is never bound (the group forwards
   * `density`/`color`/`type`/… as defaults, never `modelValue`), so it
   * stayed `undefined` forever and `Array.isArray()` was always false.
   * @description
   * Result: on the officially documented path
   * (`<origam-selection-control-group v-model="selected">` with NO
   * explicit `multiple`, `selected` initialised as `[]`), auto-detect
   * never turned on multiple mode, and the setter below overwrote the
   * group's array with a bare scalar on every click — PERTE DE DONNEES.
   * @description
   * Reading `currentModel()` (group-aware) instead repairs the
   * auto-detect for the grouped case without changing the standalone
   * case (`currentModel() === modelValue.value` there, `group` being
   * undefined).
   ********************************************************/
  const isMultiple = computed(() => {
    return !!props.multiple || (props.multiple == null && Array.isArray(currentModel()))
  })

  const model = computed({
    get() {
      const val = currentModel()

      return isMultiple.value
        ? wrapInArray(val).some((v: any) => valueComparator.value(v, trueValue.value))
        : valueComparator.value(val, trueValue.value)
    },
    set(val: boolean) {
      if (props.readonly) return

      const currentValue = val ? trueValue.value : falseValue.value

      let newVal = currentValue

      if (isMultiple.value) {
        const previous = currentModel()

        newVal = val
          ? [ ...wrapInArray(previous), currentValue ]
          : wrapInArray(previous).filter((item: any) => !valueComparator.value(item, trueValue.value))
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

  const {
    colorClasses, colorStyles,
    borderClasses, borderStyles,
    roundedClasses, roundedStyles,
    elevationClasses, elevationStyles
  } = useStateEffect(props, isHover, undefined, hoverState, undefined, toRef(props, 'disabled'))

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
    ]
  })
  const selectionControlInputClasses = computed(() => {
    return [
      'origam-selection-control__input',
      borderClasses.value,
      roundedClasses.value,
      elevationClasses.value,
      colorClasses.value
    ]
  })
  const selectionControlInputStyles = computed(() => {
    return [
      borderStyles.value,
      roundedStyles.value,
      elevationStyles.value,
      colorStyles.value
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

