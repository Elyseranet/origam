<template>
  <li
      :class="listItemClasses"
      :style="listItemStyles"
  >
    <slot>
      <origam-icon
          :icon="fileIcon"
          class="origam-file-field-list-item__icon"
      />
      <div class="origam-file-field-list-item__content">
        <div
            class="origam-file-field-list-item__name"
            :style="typographyStyles"
        >
          {{ file.name }}
        </div>
        <div class="origam-file-field-list-item__meta">
          {{ humanReadableFileSize(file.size, base) }}
        </div>
        <origam-progress
            v-if="hasProgress"
            class="origam-file-field-list-item__progress"
            :model-value="progress"
            :color="color"
            height="4"
            rounded
        />
      </div>
      <div class="origam-file-field-list-item__actions">
        <origam-btn
            :icon="removeIcon"
            flat
            size="small"
            :disabled="disabled || readonly"
            @click.stop="handleRemove"
        />
      </div>
    </slot>
  </li>
</template>

<script
    lang="ts"
    setup
>
  import { computed, StyleValue } from 'vue'

  import { OrigamBtn, OrigamIcon, OrigamProgress } from '../../components'
  import {
	useDefaults,
	useProps,
	useStyle,
	useTypography
} from '../../composables'
  import { MDI_ICONS } from '../../enums'
  import type { IFileFieldListItemProps, IFileFieldListItemSlots} from '../../interfaces'

	import type { IFileFieldListItemEmits } from '../../interfaces/FileField/file-field-list-item.interface'
  import { humanReadableFileSize } from '../../utils'

  /*********************************************************
   * Global
   *
   * @description
   * Props for the `IFileFieldListItemProps` interface used in the component.
   *    Contains default values provided via the `withDefaults` utility.
   * Emits an event. The `defineEmits` function can be used in Vue 3 to declare emitted events.
   *    This variable serves as a declaration point for all events that the component can emit.
   * Slots for the component.
   ********************************************************/
  const _props = withDefaults(defineProps<IFileFieldListItemProps>(), {
    fileIcon: MDI_ICONS.FILE,
    removeIcon: MDI_ICONS.CLOSE,
  })
  const props = useDefaults(_props)

  const emits = defineEmits<IFileFieldListItemEmits>()

  defineSlots<IFileFieldListItemSlots>()

  /*********************************************************
   * Events
   *
   * @description
   * Handlers for remove actions.
   ********************************************************/

  /*********************************************************
   * Event handlers
   ********************************************************/

  const handleRemove = () => {
    emits('click:remove', { file: props.file, index: props.index })
  }

  /*********************************************************
   * Computed
   *
   * @description
   * Progress and file size helpers.
   ********************************************************/
  const base = computed(() => {
    return typeof props.showSize !== 'boolean' ? props.showSize : undefined
  })
  const hasProgress = computed(() => {
    return typeof props.progress === 'number'
  })

  /*********************************************************
   * Class & Style
   *
   * @description
   * listItemClasses is a computed property that returns an array of classes for the component.
   * listItemStyles is a computed property that returns an array of styles for the component.
   ********************************************************/
  const listItemStyles = computed(() => {
    return [
      props.style
    ] as StyleValue
  })
  const listItemClasses = computed(() => {
    return [
      'origam-file-field-list-item',
      props.class
    ]
  })

  /*********************************************************
   * Expose
   *
   * @description
   * Exposes functions and components to the world.
   *    filterProps is a function that filters out props that are not defined in the `IFileFieldListItemProps` interface.
   ********************************************************/
  // BEM-child surface: vars are read by .origam-file-field-list-item__name
  // (font-size / font-weight). Bound directly on that element, not the root.
  const { typographyStyles } = useTypography(props, 'file-field-list-item__name')

  const { filterProps } = useProps<IFileFieldListItemProps>(props)
	const {id, css, load, isLoaded, unload} = useStyle(listItemStyles)


  defineExpose({ filterProps,
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
  .origam-file-field-list-item {
    align-items: center;
    background-color: var(--origam-file-field-list-item---background-color, var(--origam-color__surface---overlay));
    border: var(--origam-file-field-list-item---border-width, 1px) var(--origam-file-field-list-item---border-style, solid) var(--origam-file-field-list-item---border-color, var(--origam-color__border---subtle));
    border-radius: var(--origam-file-field-list-item---border-radius, 6px);
    display: flex;
    gap: var(--origam-file-field-list-item---gap, 12px);
    padding-block: var(--origam-file-field-list-item---padding-block, 10px);
    padding-inline: var(--origam-file-field-list-item---padding-inline, 12px);

    &__icon {
      color: var(--origam-file-field-list-item__icon---color, var(--origam-color__text---secondary));
      flex-shrink: 0;
    }

    &__content {
      display: flex;
      flex-direction: column;
      flex-grow: 1;
      gap: var(--origam-file-field-list-item---content-gap, 4px);
      min-width: 0;
    }

    &__name {
      font-size: var(--origam-file-field-list-item__name---font-size, 0.875rem);
      font-weight: var(--origam-file-field-list-item__name---font-weight, 500);
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    &__meta {
      color: var(--origam-file-field-list-item__meta---color, var(--origam-color__text---secondary));
      font-size: var(--origam-file-field-list-item__meta---font-size, 0.75rem);
    }

    &__progress {
      margin-top: var(--origam-file-field-list-item__progress---margin-top, 4px);
    }

    &__actions {
      align-items: center;
      display: flex;
      flex-shrink: 0;
      gap: var(--origam-file-field-list-item---actions-gap, 4px);
    }
  }
</style>
