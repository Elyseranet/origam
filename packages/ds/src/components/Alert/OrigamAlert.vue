<template>
  <component
    :is="tag"
    v-if="isActive"
    :id="id"
    v-contrast
    :class="alertClasses"
    :role="isUrgentStatus ? 'alert' : 'status'"
    :aria-live="isUrgentStatus ? 'assertive' : 'polite'"
    @mouseenter="handleMouseenter"
    @mouseleave="handleMouseleave"
  >
    <span
      key="underlay"
      class="origam-alert__underlay"
    />

    <slot name="wrapper">
      <template v-if="hasPrepend">
        <div
          key="prepend"
          class="origam-alert__prepend"
          :role="isPrependClickable ? 'button' : undefined"
          :tabindex="isPrependClickable ? 0 : undefined"
          @click="handleClickPrepend"
          @keydown="handleKeydownPrepend"
        >
          <slot name="prepend">
            <origam-avatar
              v-if="prependAvatar"
              key="prepend-avatar"
              :density="density"
              :image="prependAvatar"
            />
            <origam-icon
              v-if="prependIcon"
              key="prepend-icon"
              :density="density"
              :icon="prependIcon"
            />
          </slot>
        </div>
      </template>

      <div class="origam-alert__content">
        <div
          v-if="hasHeader"
          class="origam-alert__header"
        >
          <template v-if="hasIcon">
            <origam-icon
              key="content-icon"
              :icon="icon"
            />
          </template>
          <template v-if="hasTitle">
						<span class="origam-alert__title" :style="typographyStyles">
							<slot name="title">{{ title }}</slot>
						</span>
          </template>
        </div>

        <div class="origam-alert__body">
          <slot name="text">{{ text }}</slot>
        </div>

        <slot name="default"/>
      </div>

      <template v-if="hasAppend">
        <div
          key="append"
          class="origam-alert__append"
          :role="isAppendClickable ? 'button' : undefined"
          :tabindex="isAppendClickable ? 0 : undefined"
          @click="handleClickAppend"
          @keydown="handleKeydownAppend"
        >
          <slot name="append">
            <origam-avatar
              v-if="appendAvatar"
              key="append-avatar"
              :density="density"
              :image="appendAvatar"
            />
            <origam-icon
              v-if="appendIcon"
              key="append-icon"
              :density="density"
              :icon="appendIcon"
            />
          </slot>
        </div>
      </template>
    </slot>

    <div
      v-if="hasClose"
      key="close"
      class="origam-alert__close"
    >
      <slot name="close">
        <origam-btn
          key="close-btn"
          :aria-label="t(closeLabel)"
          :icon="closeIcon"
          data-cy="close"
          size="x-small"
          @click="handleClose"
        />
      </slot>
    </div>
  </component>
</template>

<script
  lang="ts"
  setup
>
  import type { ComputedRef, StyleValue } from 'vue'
  import { computed, useSlots } from 'vue'
  import OrigamAvatar from '../Avatar/OrigamAvatar.vue'
  import OrigamBtn from '../Btn/OrigamBtn.vue'
  import OrigamIcon from '../Icon/OrigamIcon.vue'

  import vContrast from '../../directives/Contrast/contrast.directive'

  import { useAdjacent } from '../../composables/Commons/adjacent.composable'
  import { useDensity } from '../../composables/Commons/density.composable'
  import { useDimension } from '../../composables/Commons/dimension.composable'
  import { useLocale } from '../../composables/Commons/locale.composable'
  import { useLocation } from '../../composables/Commons/location.composable'
  import { usePosition } from '../../composables/Commons/position.composable'
  import { useProps } from '../../composables/Commons/props.composable'
  import { useStateEffect } from '../../composables/Commons/stateEffect.composable'
  import { useStateFlag } from '../../composables/Commons/stateFlag.composable'
  import { useStatus } from '../../composables/Commons/status.composable'
  import { useStyle } from '../../composables/Commons/style.composable'
  import { useTypography } from '../../composables/Commons/typography.composable'

  import { DENSITY } from '../../enums/Commons/density.enum'
  import { MDI_ICONS } from '../../enums/Commons/mdi.enum'
  import { STATUS } from '../../enums/Commons/status.enum'

  import type { IAlertProps } from '../../interfaces/Alert/alert.interface'

  import type { IAlertEmits, IAlertSlots } from '../../interfaces/Alert/alert.interface'

  /*********************************************************
   * Global
   *
   * @description
   * Props, emits and utilities for the Alert component.
   ********************************************************/
  const props = withDefaults(defineProps<IAlertProps>(), {
    tag: 'div',
    density: DENSITY.DEFAULT,
    closeIcon: MDI_ICONS.CLOSE,
    closeLabel: 'origam.close',
    modelValue: true,
    hover: true
  })

  const emits = defineEmits<IAlertEmits>()

  defineSlots<IAlertSlots>()
  const slots = useSlots()

  const { filterProps } = useProps<IAlertProps>(props)
  const { t } = useLocale()

  /*********************************************************
   * Typography
   *
   * @description
   * BEM-child surface: typographyStyles are bound on the
   * __title element (not the root). varPrefix='alert__title'
   * targets the four CSS vars the SCSS reads on that span:
   *   font-size / font-weight / letter-spacing / line-height.
   * fontFamily is not in the __title SCSS — no effect.
   ********************************************************/
  const { typographyStyles } = useTypography(props, 'alert__title')

  /*********************************************************
   * Effect
   *
   * @description
   * Hover, active state and color resolution for the alert.
   ********************************************************/
  const { classes: activeClasses, isOn: isActive, config: activeState, toggle: onActive } = useStateFlag(props, {state: 'active', source: 'modelValue'})
  const {
    isOn: isHover,
    config: hoverState,
    set: handleMouseenter,
    unset: handleMouseleave,
    classes: hoverClasses
  } = useStateFlag(props, {state: 'hover'})

  /*********************************************************
   * Effects
   *
   * @description
   * Resolve effects for all states (normal, hover, active)
   ********************************************************/

  const {
    colorClasses,
    colorStyles,
    borderClasses,
    borderStyles,
    roundedClasses,
    roundedStyles,
    elevationClasses,
    elevationStyles,
    paddingClasses,
    paddingStyles,
    marginClasses,
    marginStyles
  } = useStateEffect(props, isHover, isActive as unknown as ComputedRef<boolean>, hoverState, activeState)

  /*********************************************************
   * Adjacent (prepend / append)
   *
   * @description
   * Resolves prepend/append icons and click handlers.
   ********************************************************/

  const { icon, prependIcon, appendIcon, statusClasses } = useStatus(props)
  const {
    onClickPrepend: handleClickPrepend,
    onClickAppend: handleClickAppend,
    onKeydownPrepend: handleKeydownPrepend,
    onKeydownAppend: handleKeydownAppend,
    isPrependClickable,
    isAppendClickable,
    hasAppend,
    hasPrepend
  } = useAdjacent(props, prependIcon, appendIcon)

  /*********************************************************
   * Event handlers
   *
   * @description
   *
   ********************************************************/

  const handleClose = (e: MouseEvent) => {
    onActive()

    emits('click:close', e)
  }

  const isUrgentStatus = computed(() => {
    return props.status === STATUS.WARNING || props.status === STATUS.ERROR
  })

  const hasIcon = computed(() => {
    return !!icon.value
  })
  const hasTitle = computed(() => {
    return !!(slots.title || props.title)
  })
  const hasHeader = computed(() => {
    return hasTitle.value || hasIcon.value
  })
  const hasClose = computed(() => {
    return slots.close || props.closable
  })

  /*********************************************************
   * Class & Style
   *
   * @description
   * Composes all layout, spacing, color, elevation and
   * variant classes/styles onto the root element.
   ********************************************************/
  const { densityClasses } = useDensity(props)
  const { dimensionStyles } = useDimension(props)
  const { locationStyles } = useLocation(props)
  const { positionClasses, positionStyles } = usePosition(props)
  const alertStyles = computed(() => {
    return [
      dimensionStyles.value,
      colorStyles.value,
      locationStyles.value,
      borderStyles.value,
      paddingStyles.value,
      marginStyles.value,
      roundedStyles.value,
      positionStyles.value,
      elevationStyles.value,
      props.style
    ] as StyleValue
  })
  const alertClasses = computed(() => {
    return [
      'origam-alert',
      hoverClasses.value,
      activeClasses.value,
      statusClasses.value,
      colorClasses.value,
      densityClasses.value,
      borderClasses.value,
      paddingClasses.value,
      marginClasses.value,
      elevationClasses.value,
      positionClasses.value,
      roundedClasses.value,
      props.class
    ]
  })

	/*********************************************************
	 * useStyle
	 *
	 * @description
	 * #381 — the `id` returned by useStyle is a GENERATED identifier,
	 * only meant for the scoped stylesheet selector. Without
	 * `() => props.id` here, it shadowed the `id` PROP of the same
	 * name: the template's `:id="id"` on the root rendered the
	 * generated id, never the consumer's.
	 ********************************************************/
	const {id, css, load, isLoaded, unload} = useStyle(alertStyles, () => props.id)

  /*********************************************************
   * Expose
   *
   * @description
   * Public API surface: filterProps, style utilities.
   ********************************************************/
  defineExpose({
    filterProps,
    css,
    id,
    load,
    unload,
    isLoaded
  })
</script>

<style
  lang="scss"
  scoped
>
  .origam-alert {
    $this: &;

    display: grid;
    flex: 1 1;
    grid-template-areas: "prepend content append close" ". content . .";
    grid-template-columns: max-content auto max-content max-content;
    overflow: hidden;
    position: var(--origam-alert---position);

    padding-block-start: calc(var(--origam-alert---padding-block-start) - var(--origam-alert---density));
    padding-block-end: calc(var(--origam-alert---padding-block-end) - var(--origam-alert---density));
    padding-inline-start: calc(var(--origam-alert---padding-inline-start) - var(--origam-alert---density));
    padding-inline-end: calc(var(--origam-alert---padding-inline-end) - var(--origam-alert---density));
    margin-block-start: var(--origam-alert---margin-block-start);
    margin-block-end: var(--origam-alert---margin-block-end);
    margin-inline-start: var(--origam-alert---margin-inline-start);
    margin-inline-end: var(--origam-alert---margin-inline-end);

    border-top-width: var(--origam-alert---border-top-width, var(--origam-alert---border-width, 0));
    border-right-width: var(--origam-alert---border-right-width, var(--origam-alert---border-width, 0));
    border-bottom-width: var(--origam-alert---border-bottom-width, var(--origam-alert---border-width, 0));
    border-left-width: var(--origam-alert---border-left-width, var(--origam-alert---border-width, 0));
    border-style: var(--origam-alert---border-style);
    border-color: var(--origam-alert---border-color);
    border-radius: var(--origam-alert---border-radius);

    background-color: var(--origam-alert---background-color);
    color: var(--origam-alert---color);

    @supports (backdrop-filter: blur(8px)) or (-webkit-backdrop-filter: blur(8px)) {
      backdrop-filter: var(--origam-alert---backdrop-filter, none);
      -webkit-backdrop-filter: var(--origam-alert---backdrop-filter, none);
    }

    &--elevated {
      box-shadow: var(--origam-alert---box-shadow-elevated, var(--origam-shadow---md));
    }

    &--border {
      &#{$this}--border-left {
        --origam-alert---border-left-width: calc(24px - var(--origam-alert---density));

        #{$this}__underlay {
          --origam-alert__underlay---border-top-left-radius: 0;
          --origam-alert__underlay---border-bottom-left-radius: 0;
        }
      }

      &#{$this}--border-right {
        --origam-alert---border-right-width: calc(24px - var(--origam-alert---density));

        #{$this}__underlay {
          --origam-alert__underlay---border-top-right-radius: 0;
          --origam-alert__underlay---border-bottom-right-radius: 0;
        }
      }

      &#{$this}--border-top {
        --origam-alert---border-top-width: calc(24px - var(--origam-alert---density));

        #{$this}__underlay {
          --origam-alert__underlay---border-top-left-radius: 0;
          --origam-alert__underlay---border-top-right-radius: 0;
        }
      }

      &#{$this}--border-bottom {
        --origam-alert---border-bottom-width: calc(24px - var(--origam-alert---density));

        #{$this}__underlay {
          --origam-alert__underlay---border-bottom-left-radius: 0;
          --origam-alert__underlay---border-bottom-right-radius: 0;
        }
      }
    }

    &--rounded {
      --origam-alert---border-radius: var(--origam-radius---2xl, 24px);
    }

    &--rounded-x-small {
      --origam-alert---border-radius: var(--origam-radius---xs, 2px);
    }

    &--rounded-small {
      --origam-alert---border-radius: var(--origam-radius---sm, 4px);
    }

    &--rounded-default {
      --origam-alert---border-radius: var(--origam-radius---md, 8px);
    }

    &--rounded-medium {
      --origam-alert---border-radius: var(--origam-radius---lg, 12px);
    }

    &--rounded-large {
      --origam-alert---border-radius: var(--origam-radius---xl, 16px);
    }

    &--rounded-x-large {
      --origam-alert---border-radius: var(--origam-radius---2xl, 24px);
    }

    &--density-comfortable {
      --origam-alert---density: -8px;
    }

    &--density-default {
      --origam-alert---density: 0px;
    }

    &--density-compact {
      --origam-alert---density: 8px;
    }

    &--warning {
      --origam-alert---background-color: var(--origam-alert--warning---bg, var(--origam-color__feedback--warning---bg, rgb(251, 140, 0)));
      --origam-alert---color: var(--origam-alert--warning---fg, var(--origam-color__feedback--warning---fg, #ffffff));
    }

    &--success {
      --origam-alert---background-color: var(--origam-alert--success---bg, var(--origam-color__feedback--success---bg, rgb(76, 175, 80)));
      --origam-alert---color: var(--origam-alert--success---fg, var(--origam-color__feedback--success---fg, #ffffff));
    }

    &--info {
      --origam-alert---background-color: var(--origam-alert--info---bg, var(--origam-color__feedback--info---bg, rgb(33, 150, 243)));
      --origam-alert---color: var(--origam-alert--info---fg, var(--origam-color__feedback--info---fg, #ffffff));
    }

    &--error {
      --origam-alert---background-color: var(--origam-alert--danger---bg, var(--origam-color__feedback--danger---bg, rgb(207, 102, 121)));
      --origam-alert---color: var(--origam-alert--danger---fg, var(--origam-color__feedback--danger---fg, #ffffff));
    }

    &--absolute {
      --origam-alert---position: absolute;
    }

    &--fixed {
      --origam-alert---position: fixed;
    }

    &--sticky {
      --origam-alert---position: sticky;
    }

    &--relative {
      --origam-alert---position: relative;
    }

    &__close {
      align-self: flex-start;
      flex: 0 1 auto;
      grid-area: close;
      padding-block-start: var(--origam-alert__close---padding-block-start);
      padding-block-end: var(--origam-alert__close---padding-block-end);
      padding-inline-start: var(--origam-alert__close---padding-inline-start);
      padding-inline-end: var(--origam-alert__close---padding-inline-end);
      margin-block-start: var(--origam-alert__close---margin-block-start);
      margin-block-end: var(--origam-alert__close---margin-block-end);
      margin-inline-start: calc(var(--origam-alert__close---margin-inline-start) - var(--origam-alert---density));
      margin-inline-end: var(--origam-alert__close---margin-inline-end);
    }

    &__content {
      align-self: center;
      grid-area: content;
      overflow: hidden;
    }

    &__append {
      align-self: flex-start;
      display: flex;
      grid-area: append;
      align-items: var(--origam-alert__append---align-items);
      padding-block-start: var(--origam-alert__append---padding-block-start);
      padding-block-end: var(--origam-alert__append---padding-block-end);
      padding-inline-start: var(--origam-alert__append---padding-inline-start);
      padding-inline-end: var(--origam-alert__append---padding-inline-end);
      margin-block-start: var(--origam-alert__append---margin-block-start);
      margin-block-end: var(--origam-alert__append---margin-block-end);
      margin-inline-start: calc(var(--origam-alert__append---margin-inline-start) - var(--origam-alert---density));
      margin-inline-end: var(--origam-alert__append---margin-inline-end);
    }

    &__prepend {
      align-self: flex-start;
      display: flex;
      grid-area: prepend;
      align-items: var(--origam-alert__prepend---align-items);
      padding-block-start: var(--origam-alert__prepend---padding-block-start);
      padding-block-end: var(--origam-alert__prepend---padding-block-end);
      padding-inline-start: var(--origam-alert__prepend---padding-inline-start);
      padding-inline-end: var(--origam-alert__prepend---padding-inline-end);
      margin-block-start: var(--origam-alert__prepend---margin-block-start);
      margin-block-end: var(--origam-alert__prepend---margin-block-end);
      margin-inline-start: var(--origam-alert__prepend---margin-inline-start);
      margin-inline-end: calc(var(--origam-alert__prepend---margin-inline-end) - var(--origam-alert---density));
    }

    &__underlay {
      grid-area: none;
      position: absolute;
      border-radius: var(--origam-alert__underlay---border-radius)
    }

    &__title {
      align-self: center;
      display: flex;
      align-items: var(--origam-alert__title---align-items);
      font-size: var(--origam-alert__title---font-size);
      font-weight: var(--origam-alert__title---font-weight);
      hyphens: var(--origam-alert__title---hyphens);
      letter-spacing: var(--origam-alert__title---letter-spacing);
      line-height: var(--origam-alert__title---line-height);
      overflow-wrap: var(--origam-alert__title---overflow-wrap);
      text-transform: var(--origam-alert__title---text-transform);
      word-break: var(--origam-alert__title---word-break);
      word-wrap: var(--origam-alert__title---word-wrap);
    }
  }

</style>
