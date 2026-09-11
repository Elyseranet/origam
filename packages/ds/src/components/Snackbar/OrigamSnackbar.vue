<template>
  <origam-overlay
    :id="id"
    ref="origamOverlayRef"
    v-model="isActive"
    class="origam-snackbar"
    :content-props="contentProps"
    :scrim="false"
    :scroll-strategy="SCROLL_STRATEGIES.NONE"
    disable-global-stack
    no-click-animation
    persistent
    v-bind="{ ...overlayProps, ...scopeId }"
    @touchend="handleTouchend"
    @touchstart-passive="handleTouchstart"
  >
    <template #default>
      <span
        key="underlay"
        class="origam-snackbar__underlay"
      />

      <div
        v-if="timer"
        :key="`timer-${timerKey}`"
        :class="snackbarTimerClasses"
        :style="{ '--origam-snackbar__timer---duration': `${timeout}ms` }"
      >
        <div class="origam-snackbar__timer-bar"/>
      </div>

      <origam-snackbar-item
        :dismissible="false"
        :icon="icon || undefined"
        :intent="snackbarIntent"
        :message="text"
        :class="snackbarItemExtraClasses"
      >
        <template
          v-if="slots['prepend']"
          #prepend
        >
          <slot name="prepend"/>
        </template>

        <template
          v-if="slots['title']"
          #title
        >
          <slot name="title"/>
        </template>

        <template
          v-if="slots['text'] || slots['message']"
          #message
        >
          <slot name="text"/>
          <slot name="message"/>
        </template>

        <slot/>

        <template
          v-if="slots['action']"
          #actions
        >
          <slot
            name="action"
            v-bind="{ isActive }"
          />
        </template>
      </origam-snackbar-item>
    </template>
  </origam-overlay>
</template>

<script
  lang="ts"
  setup
>
  import {
    computed,
    inject,
    mergeProps,
    onMounted,
    ref,
    shallowRef,
    StyleValue,
    useSlots,
    watch,
    watchEffect
  } from 'vue'
  import { OrigamOverlay, OrigamSnack } from '../../components'
  import OrigamSnackbarItem from './OrigamSnackbarItem.vue'

  import {
    useBothColor,
    useDefaults,
    useLayout,
    usePosition,
    useProps,
    useScopeId,
    useStateEffect,
    useStatus,
    useStyle,
    useToggleScope,
    useVModel
  } from '../../composables'

  import { ORIGAM_LAYOUT_KEY } from '../../consts'

  import { SCROLL_STRATEGIES } from '../../enums'

  import type { ISnackbarProps } from '../../interfaces'

  import type { TIntent, TOrigamOverlay, TTransitionProps } from '../../types'

  import { forwardRefs } from '../../utils'

  /*********************************************************
   * Global
   *
   * @description
   * Props with defaults and filterProps utility.
   ********************************************************/
  const _props = withDefaults(defineProps<ISnackbarProps>(), {
    timeout: 5000,
    location: 'bottom',
    border: true,
    rounded: true,
    elevation: 1,
    transition: () => ({
      component: OrigamSnack
    }) as unknown as TTransitionProps
  })

  // `useDefaults` resolves each prop against theme.components['origam-snackbar']
  // (OrigamBtn pattern) — without this, theme.components['origam-snackbar']
  // (location/border/rounded/elevation) was a silent no-op.
  const props = useDefaults(_props)

  const { filterProps } = useProps<ISnackbarProps>(props)

  const slots = useSlots()

  /*********************************************************
   * Value & Countdown
   *
   * @description
   * v-model active state, countdown timer, and auto-dismiss
   * timeout management.
   ********************************************************/

  const isActive = useVModel(props, 'modelValue')

  /*********************************************************
   * Composables
   ********************************************************/

  const { positionClasses } = usePosition(props)
  const { scopeId } = useScopeId()

  /*********************************************************
   * Icon / Status
   ********************************************************/

  const { icon, statusClasses, statusIntent } = useStatus(props)

  const origamOverlayRef = ref<TOrigamOverlay>()
  const isHovering = shallowRef(false)
  const startY = shallowRef(0)
  const mainStyles = ref()
  const hasLayout = inject(ORIGAM_LAYOUT_KEY, undefined)

  const timerKey = shallowRef(0)

  useToggleScope(() => !!hasLayout, () => {
    const layout = useLayout()

    watchEffect(() => {
      mainStyles.value = layout.mainStyles.value
    })
  })

  let activeTimeout = -1
  const startTimeout = () => {
    window.clearTimeout(activeTimeout)
    const timeout = Number(props.timeout)

    if (!isActive.value || timeout === -1) return

    timerKey.value++

    activeTimeout = window.setTimeout(() => {
      isActive.value = false
    }, timeout)
  }
  const clearTimeout = () => {
    window.clearTimeout(activeTimeout)
  }

  watch(isActive, startTimeout)
  watch(() => props.timeout, startTimeout)

  onMounted(() => {
    if (isActive.value) startTimeout()
  })

  /*********************************************************
   * Interaction
   *
   * @description
   * Hover pause/resume, swipe-to-dismiss touch handling.
   ********************************************************/

  const handlePointerenter = () => {
    isHovering.value = true
    clearTimeout()
  }
  const handlePointerleave = () => {
    isHovering.value = false
    startTimeout()
  }
  const handleTouchstart = (event: TouchEvent) => {
    startY.value = event.touches[0].clientY
  }
  const handleTouchend = (event: TouchEvent) => {
    if (Math.abs(startY.value - event.changedTouches[0].clientY) > 50) {
      isActive.value = false
    }
  }

  /*********************************************************
   * Intent bridge
   *
   * @description
   * OrigamSnackbarItem uses `intent` (TIntent). OrigamSnackbar
   * uses `status` (TStatus). The `status` values map 1-to-1 to
   * intent token names in the DS, so we cast directly.
   ********************************************************/
  const snackbarIntent = computed<TIntent | undefined>(() => {
    if (!props.status) return undefined

    return props.status as unknown as TIntent
  })

  /*********************************************************
   * Color & state effects
   ********************************************************/

  const statusBgColor = computed(() => statusIntent.value ?? props.bgColor)
  const statusColor = computed(() => statusIntent.value ? undefined : props.color)
  const { colorClasses, colorStyles } = useBothColor(statusBgColor, statusColor)

  const {
    roundedClasses, roundedStyles,
    borderClasses, borderStyles,
    paddingClasses, paddingStyles,
    marginClasses, marginStyles,
    elevationClasses
  } = useStateEffect(props)

  /*********************************************************
   * Forwarded props
   ********************************************************/

  const overlayProps = computed(() => {
    return origamOverlayRef.value?.filterProps(props, [ 'class', 'style', 'id', 'contentProps', 'modelValue', 'disableGlobalStack', 'noClickAnimation', 'persistent', 'scrim', 'scrollStrategy' ])
  })

  const contentProps = computed(() => {
    return mergeProps({
      class: [
        'origam-snackbar__wrapper',
        colorClasses.value
      ],
      style: [
        colorStyles.value,
        roundedStyles.value,
        borderStyles.value,
        paddingStyles.value,
        marginStyles.value
      ],
      onPointerenter: handlePointerenter,
      onPointerleave: handlePointerleave
    }, props.contentProps)
  })

  /*********************************************************
   * Class & Style
   *
   * @description
   * Root element location/position classes.
   * Extra classes forwarded to OrigamSnackbarItem to honour
   * border-radius, border, elevation, status theming applied
   * at the snackbar level.
   ********************************************************/
  const locationClasses = computed(() => {
    return props.location.split(' ').reduce((acc, loc) => {
      acc[`origam-snackbar--${ loc }`] = true

      return acc
    }, {} as Record<string, any>)
  })

  const snackbarStyles = computed(() => {
    return [
      mainStyles.value,
      props.style
    ] as StyleValue
  })

  const snackbarTimerClasses = computed(() => {
    return [
      'origam-snackbar__timer',
      { 'origam-snackbar__timer--paused': isHovering.value }
    ]
  })

  // Extra modifier classes forwarded to OrigamSnackbarItem so that
  // BEM modifiers (multi-line, vertical, status) still live on the
  // visible item element. These do NOT carry the full item class set —
  // OrigamSnackbarItem owns its own root classes.
  const snackbarItemExtraClasses = computed(() => {
    return [
      {
        'origam-snackbar__item--multi-line': props.multiLine && !props.vertical,
        'origam-snackbar__item--timer': !!props.timer,
        'origam-snackbar__item--vertical': props.vertical
      },
      locationClasses.value,
      positionClasses.value,
      roundedClasses.value,
      borderClasses.value,
      paddingClasses.value,
      marginClasses.value,
      elevationClasses.value,
      statusClasses.value,
      props.class
    ]
  })

  const { id, css, load, isLoaded, unload } = useStyle(snackbarStyles)

  /*********************************************************
   * Expose
   ********************************************************/
  defineExpose(forwardRefs({
    filterProps,
    css,
    id,
    load,
    unload,
    isLoaded
  }, origamOverlayRef))
</script>

<style
  lang="scss"
  scoped
>
  .origam-snackbar {
    $this: &;

    justify-content: center;
    z-index: var(--origam-snackbar---z-index, var(--origam-z-index-toast, 1060));
    margin: var(--origam-snackbar---margin, 8px);
    margin-inline-end: calc(var(--origam-snackbar---margin, 8px) + 0px);
    padding: var(--origam-layout---position-top) var(--origam-layout---position-right) var(--origam-layout---position-bottom) var(--origam-layout---position-left);

    &:not(#{$this}--center) {
      &:not(#{$this}--top) {
        align-items: flex-end;
      }
    }

    :deep(#{$this}__wrapper) {
      align-items: center;
      display: flex;
      max-width: var(--origam-snackbar__wrapper---max-width, 672px);
      min-height: var(--origam-snackbar__wrapper---min-height, 48px);
      min-width: var(--origam-snackbar__wrapper---min-width, 344px);
      overflow: hidden;
      padding: 0;
    }

    &__underlay {
      position: absolute;
    }

    :deep(.origam-snackbar-item) {
      flex-grow: 1;
      min-width: unset;
      max-width: unset;
      border-radius: 0;
      box-shadow: none;
    }

    &__timer {
      width: 100%;
      height: var(--origam-snackbar__timer---height, 3px);
      position: absolute;
      top: 0;
      left: 0;
      overflow: hidden;
      pointer-events: none;

      &-bar {
        width: 100%;
        height: 100%;
        background-color: var(--origam-snackbar__timer-bar---background-color, currentColor);
        opacity: var(--origam-snackbar__timer-bar---opacity, 0.5);
        transform-origin: left center;
        animation: origam-snackbar__timer-shrink var(--origam-snackbar__timer---duration, 5000ms) linear forwards;
        will-change: transform;
      }

      &--paused &-bar {
        animation-play-state: paused;
      }
    }

    @keyframes origam-snackbar__timer-shrink {
      from {
        transform: scaleX(1);
      }
      to {
        transform: scaleX(0);
      }
    }

    &--border {
      :deep(#{$this}__wrapper) {
        border-width: var(--origam-snackbar__wrapper---border-width, thin);
        border-style: var(--origam-snackbar__wrapper---border-style, solid);
      }
    }

    @each $status in (success, info, warning, danger) {
      &--#{$status} {
        color: var(--origam-color__feedback--#{$status}---fgSubtle);
        background: transparent;

        :deep(#{$this}__wrapper) {
          background-color: var(--origam-color__feedback--#{$status}---bgSubtle);
          border-color: var(--origam-color__feedback--#{$status}---border);
          color: var(--origam-color__feedback--#{$status}---fgSubtle);
        }

        :deep(#{$this}__timer-bar) {
          background-color: var(--origam-color__feedback--#{$status}---border);
          opacity: var(--origam-snackbar__timer-bar---opacity-status, 0.7);
        }
      }
    }

    &--error {
      color: var(--origam-color__feedback--danger---fgSubtle);
      background: transparent;

      :deep(#{$this}__wrapper) {
        background-color: var(--origam-color__feedback--danger---bgSubtle);
        border-color: var(--origam-color__feedback--danger---border);
        color: var(--origam-color__feedback--danger---fgSubtle);
      }

      :deep(#{$this}__timer-bar) {
        background-color: var(--origam-color__feedback--danger---border);
        opacity: var(--origam-snackbar__timer-bar---opacity-status, 0.7);
      }
    }

    &--rounded {
      :deep(#{$this}__wrapper) {
        border-radius: var(--origam-snackbar__wrapper---border-radius, 4px);
      }
    }

    &--absolute {
      position: absolute;
      z-index: var(--origam-snackbar--absolute---z-index, var(--origam-z-index-raised, 1));
    }

    &__item--multi-line {
      :deep(#{$this}__wrapper) {
        min-height: var(--origam-snackbar--multi-line---wrapper-min-height, 68px);
      }
    }

    &__item--vertical {
      :deep(#{$this}__wrapper) {
        flex-direction: column;

        .origam-snackbar-item__actions {
          align-self: flex-end;
          margin-bottom: var(--origam-snackbar--vertical---actions-margin-bottom, 8px);
        }
      }
    }

    &--center {
      align-items: center;
      justify-content: center;
    }

    &--top {
      align-items: flex-start;
    }

    &--bottom {
      align-items: flex-end;
    }

    &--left,
    &--start {
      justify-content: flex-start;
    }

    &--right, &--end {
      justify-content: flex-end;
    }
  }
</style>
