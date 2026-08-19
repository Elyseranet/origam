<template>
  <div
    :id="id"
    v-contrast
    :aria-atomic="true"
    :aria-live="resolvedAriaLive"
    :class="itemClasses"
    :data-cy="dataCy"
    :role="resolvedRole"
    :style="typographyStyles"
  >
    <div class="origam-snackbar-item__content">
      <div
        v-if="hasPrepend"
        class="origam-snackbar-item__prepend"
      >
        <slot name="prepend">
          <origam-icon
            :icon="iconToRender"
            :size="24"
          />
        </slot>
      </div>

      <div class="origam-snackbar-item__text">
        <div
          v-if="title"
          class="origam-snackbar-item__title"
        >
          <slot name="title">{{ title }}</slot>
        </div>

        <div
          v-if="hasMessage"
          class="origam-snackbar-item__message"
        >
          <slot name="message">{{ message }}</slot>
        </div>

        <slot/>
      </div>
    </div>

    <div
      v-if="hasActions"
      class="origam-snackbar-item__actions"
    >
      <slot name="actions">
        <origam-btn
          v-for="(action, index) in actions"
          :key="index"
          :color="action.intent ?? 'primary'"
          :data-cy="`${dataCy}-action-${index}`"
          :text="action.label"
          class="origam-snackbar-item__action"
          variant="text"
          @click="handleActionClick(action)"
        />
      </slot>
    </div>

    <origam-btn
      v-if="dismissible !== false"
      :aria-label="dismissLabel"
      :data-cy="`${dataCy}-dismiss`"
      :icon="MDI_ICONS.CLOSE"
      class="origam-snackbar-item__dismiss"
      size="x-small"
      variant="text"
      @click="emit('dismiss')"
    />
  </div>
</template>

<script
  lang="ts"
  setup
>
  import { computed, useSlots } from 'vue'

  import OrigamBtn from '../Btn/OrigamBtn.vue'
  import OrigamIcon from '../Icon/OrigamIcon.vue'

  import { useLocale } from '../../composables/Commons/locale.composable'
  import { usePassedProps } from '../../composables/Commons/passedProps.composable'
  import { useProps } from '../../composables/Commons/props.composable'
  import { useTypography } from '../../composables/Commons/typography.composable'

  import vContrast from '../../directives/Contrast/contrast.directive'

  import { MDI_ICONS } from '../../enums/Commons/mdi.enum'

  import type { ISnackbarItemEmits, ISnackbarItemProps, ISnackbarItemSlots } from '../../interfaces/Snackbar/snackbar-item.interface'
  import type { ISnackbarGroupItemAction } from '../../interfaces/Snackbar/snackbar-group-item.interface'
  import type { TIcon } from '../../types/Icon/icon.type'
  import type { TIntent } from '../../types/Commons/intent.type'

  /*********************************************************
   * Global
   *
   * @description
   * Props with defaults. withDefaults uses inline literals only
   * per the project rule.
   ********************************************************/
  const props = withDefaults(defineProps<ISnackbarItemProps>(), {
    intent: 'info',
    dismissible: true,
    dismissLabel: undefined
  })

  /*********************************************************
   * Labels — localised through the DS i18n provider (`useLocale`).
   * Keys live under `origam.snackbar.*` in the shipped locale messages.
   * The `dismissLabel` prop is kept for back-compat (explicit override wins).
   ********************************************************/
  const { t } = useLocale()

  const dismissLabel = computed<string>(() => props.dismissLabel ?? t('origam.snackbar.dismiss', 'Dismiss notification'))

  const { filterProps } = useProps<ISnackbarItemProps>(props)

  /*********************************************************
   * Passed-prop tracking
   *
   * @description
   * `icon` is typed `TIcon | false`. Vue's compiler infers a runtime
   * `Boolean` branch from the `false` literal, and any unset prop whose
   * type includes `Boolean` resolves to the concrete value `false` —
   * never `undefined` — when the consumer does not pass it. A naive
   * `props.icon === false` check therefore ALWAYS short-circuits, even
   * when the consumer never touched `icon`. `usePassedProps()` reads
   * `vnode.props` directly to tell "explicitly passed `false`" apart
   * from "not passed at all".
   ********************************************************/
  const wasIconPassed = usePassedProps<ISnackbarItemProps>(props, 'OrigamSnackbarItem')

  /*********************************************************
   * Typography
   *
   * @description
   * Only `fontSize` has a real visual effect: the root element
   * reads `--origam-snackbar-item---font-size`. `fontWeight` is
   * scoped to BEM children (`__title`, `__message`) with their
   * own namespaced vars — a single `useTypography('snackbar-item')`
   * cannot address both surfaces; expose via story only when
   * per-surface control is added.
   ********************************************************/
  const { typographyStyles } = useTypography(props, 'snackbar-item')

  const slots = useSlots()

  /*********************************************************
   * Emits
   ********************************************************/
  const emit = defineEmits<ISnackbarItemEmits>()

  defineSlots<ISnackbarItemSlots>()

  /*********************************************************
   * Intent helpers
   ********************************************************/
  const INTENT_ICONS: Record<TIntent, TIcon> = {
    primary: MDI_ICONS.INFORMATION,
    secondary: MDI_ICONS.INFORMATION,
    ghost: MDI_ICONS.INFORMATION,
    neutral: MDI_ICONS.INFORMATION,
    success: MDI_ICONS.CHECK_CIRCLE,
    warning: MDI_ICONS.ALERT,
    danger: MDI_ICONS.ALERT_CIRCLE,
    info: MDI_ICONS.INFORMATION
  }

  const resolvedIcon = computed<TIcon | false>(() => {
    if (wasIconPassed('icon')) return props.icon as TIcon | false

    return INTENT_ICONS[props.intent ?? 'info']
  })

  /*********************************************************
   * A custom `#prepend` slot must render on its own merits — it must
   * NEVER be suppressed just because the default-icon resolution landed
   * on `false`. Coupling the zone's `v-if` to `resolvedIcon` silently
   * dropped any consumer-provided `#prepend` content along with the icon.
   ********************************************************/
  const hasPrepend = computed<boolean>(() => {
    return resolvedIcon.value !== false || !!slots['prepend']
  })

  /*********************************************************
   * `<origam-icon>` (the `#prepend` fallback) only takes `TIcon |
   * undefined` — it has no `false` branch. `hasPrepend` (unlike the old
   * `v-if="resolvedIcon !== false"`) is an opaque boolean the template
   * type-checker cannot narrow `resolvedIcon` through, so the fallback
   * needs its own correctly-typed value. Only reached at runtime when
   * no `#prepend` slot content overrides it, so `undefined` here is
   * inert either way.
   ********************************************************/
  const iconToRender = computed<TIcon | undefined>(() => {
    return resolvedIcon.value === false ? undefined : resolvedIcon.value
  })

  const resolvedRole = computed<'status' | 'alert'>(() => {
    if (props.role) return props.role

    return props.intent === 'warning' || props.intent === 'danger' ? 'alert' : 'status'
  })

  const resolvedAriaLive = computed<'polite' | 'assertive'>(() => {
    if (props.ariaLive) return props.ariaLive

    return props.intent === 'warning' || props.intent === 'danger' ? 'assertive' : 'polite'
  })

  /*********************************************************
   * Slot & actions helpers
   ********************************************************/
  const hasMessage = computed<boolean>(() => {
    return !!(props.message || slots['message'])
  })

  const hasActions = computed<boolean>(() => {
    // Show actions section when action buttons are provided via prop OR
    // via the `actions` slot (e.g. OrigamSnackbar's #action slot forwarding).
    return (Array.isArray(props.actions) && props.actions.length > 0) || !!slots['actions']
  })

  /*********************************************************
   * Event handlers
   ********************************************************/
  const handleActionClick = (action: ISnackbarGroupItemAction): void => {
    emit('action', action)
  }

  /*********************************************************
   * Classes
   ********************************************************/
  const itemClasses = computed(() => {
    const intent: TIntent = props.intent ?? 'info'

    return [
      'origam-snackbar-item',
      `origam-snackbar-item--intent-${intent}`,
      {
        'origam-snackbar-item--with-actions': hasActions.value,
        'origam-snackbar-item--dismissible': props.dismissible !== false
      },
      props.class
    ]
  })

  /*********************************************************
   * Expose
   ********************************************************/
  defineExpose({ filterProps })
</script>

<style
  lang="scss"
  scoped
>
  .origam-snackbar-item {
    $this: &;

    pointer-events: auto;
    display: flex;
    align-items: flex-start;
    gap: var(--origam-snackbar-item---gap, 12px);
    min-width: var(--origam-snackbar-item---min-width, 288px);
    max-width: var(--origam-snackbar-item---max-width, 420px);
    padding: var(--origam-snackbar-item---padding, 12px 14px);
    border-radius: var(--origam-snackbar-item---border-radius, 8px);
    border-width: var(--origam-snackbar-item---border-width, 1px);
    border-style: solid;
    background-color: var(--origam-snackbar-item---background-color, var(--origam-color__surface---default, #fff));
    border-color: var(--origam-snackbar-item---border-color, var(--origam-color__border---subtle, rgba(0, 0, 0, 0.12)));
    color: var(--origam-snackbar-item---color, var(--origam-color__text---primary, #1a1a1a));
    box-shadow: var(--origam-snackbar-item---box-shadow, 0 4px 12px rgba(0, 0, 0, 0.12));
    backdrop-filter: var(--origam-snackbar-item---backdrop-filter, none);
    -webkit-backdrop-filter: var(--origam-snackbar-item---backdrop-filter, none);
    font-size: var(--origam-snackbar-item---font-size, 0.875rem);
    line-height: 1.4;

    &__content {
      display: flex;
      align-items: flex-start;
      gap: var(--origam-snackbar-item__content---gap, 10px);
      flex: 1 1 auto;
      min-width: 0;
    }

    &__prepend {
      display: flex;
      align-items: center;
      color: var(--origam-snackbar-item__prepend---color, currentColor);
      flex: 0 0 auto;
      line-height: 1;
      padding-top: 1px;
    }

    &__text {
      display: flex;
      flex-direction: column;
      gap: var(--origam-snackbar-item__text---gap, 2px);
      flex: 1 1 auto;
      min-width: 0;
    }

    &__title {
      font-weight: var(--origam-snackbar-item__title---font-weight, 600);
    }

    &__message {
      font-weight: var(--origam-snackbar-item__message---font-weight, 400);
      color: var(--origam-snackbar-item__message---color, currentColor);
      opacity: var(--origam-snackbar-item__message---opacity, 0.85);
    }

    &__actions {
      display: flex;
      align-items: center;
      gap: 6px;
      flex: 0 0 auto;
    }

    &__action {
      background: transparent;
      border: 0;
      color: var(--origam-snackbar-item__action---color, var(--origam-color__action--primary---fg, #1976d2));
      font: inherit;
      font-weight: 600;
      cursor: pointer;
      padding: 4px 8px;
      border-radius: 4px;

      &:hover {
        background-color: var(--origam-snackbar-item__action--hover---background-color, rgba(0, 0, 0, 0.04));
      }

      &:focus-visible {
        outline: 2px solid currentColor;
        outline-offset: 1px;
      }
    }

    &__dismiss {
      background: transparent;
      border: 0;
      color: inherit;
      cursor: pointer;
      padding: 4px;
      margin: -4px -2px -4px 0;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 4px;
      flex: 0 0 auto;

      &:hover {
        background-color: var(--origam-snackbar-item__dismiss--hover---background-color, rgba(0, 0, 0, 0.04));
      }

      &:focus-visible {
        outline: 2px solid currentColor;
        outline-offset: 1px;
      }
    }

    @each $intent in (primary, success, warning, danger, info) {
      &--intent-#{$intent} {
        background-color: var(--origam-color__feedback--#{$intent}---bgSubtle, var(--origam-snackbar-item---background-color));
        border-color: var(--origam-color__feedback--#{$intent}---border, var(--origam-snackbar-item---border-color));
        color: var(--origam-color__feedback--#{$intent}---fgSubtle, var(--origam-snackbar-item---color));

        #{$this}__prepend {
          color: var(--origam-color__feedback--#{$intent}---border, currentColor);
        }
      }
    }
  }
</style>
