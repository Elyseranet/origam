<template>
  <div
      :class="dragNDropItemClasses"
      :style="dragNDropItemStyles"
  >
    <slot>
      <origam-icon
          :icon="fileIcon"
          class="origam-file-field-dragndrop-item__icon"
      />
      <div class="origam-file-field-dragndrop-item__content">
        <div
            class="origam-file-field-dragndrop-item__name"
            :style="typographyStyles"
        >
          {{ file.name }}
        </div>
        <div class="origam-file-field-dragndrop-item__meta">
          {{ humanReadableFileSize(file.size, base) }}
        </div>
        <origam-progress
            v-if="hasProgress"
            class="origam-file-field-dragndrop-item__progress"
            :model-value="progress"
            :color="color"
            height="4"
            rounded
        />
      </div>
      <div class="origam-file-field-dragndrop-item__actions">
        <origam-btn
            :icon="removeIcon"
            flat
            size="small"
            :disabled="disabled || readonly"
            @click.stop.prevent="handleRemove"
        />
      </div>
    </slot>
  </div>
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
  import type { IFileFieldDragNDropItemProps, IFileFieldDragNDropItemSlots} from '../../interfaces'

	import type { IFileFieldDragNDropItemEmits } from '../../interfaces/FileField/file-field-dragndrop-item.interface'
  import { humanReadableFileSize } from '../../utils'

  /*********************************************************
   * Global
   *
   * @description
   * Props for the `IFileFieldDragNDropItemProps` interface used in the component.
   *    Contains default values provided via the `withDefaults` utility.
   * Emits an event. The `defineEmits` function can be used in Vue 3 to declare emitted events.
   *    This variable serves as a declaration point for all events that the component can emit.
   * Slots for the component.
   ********************************************************/
  const _props = withDefaults(defineProps<IFileFieldDragNDropItemProps>(), {
    fileIcon: MDI_ICONS.FILE,
    removeIcon: MDI_ICONS.CLOSE,
  })
  const props = useDefaults(_props)

  const emits = defineEmits<IFileFieldDragNDropItemEmits>()

  defineSlots<IFileFieldDragNDropItemSlots>()

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
   * dragNDropItemClasses is a computed property that returns an array of classes for the component.
   * dragNDropItemStyles is a computed property that returns an array of styles for the component.
   ********************************************************/
  const dragNDropItemStyles = computed(() => {
    return [
      props.style
    ] as StyleValue
  })
  const dragNDropItemClasses = computed(() => {
    return [
      'origam-file-field-dragndrop-item',
      props.class
    ]
  })

  /*********************************************************
   * Expose
   *
   * @description
   * Exposes functions and components to the world.
   *    filterProps is a function that filters out props that are not defined in the `IFileFieldDragNDropItemProps` interface.
   ********************************************************/
  // BEM-child surface: vars are read by .origam-file-field-dragndrop-item__name
  // (font-size / font-weight). Bound directly on that element, not the root.
  const { typographyStyles } = useTypography(props, 'file-field-dragndrop-item__name')

  const { filterProps } = useProps<IFileFieldDragNDropItemProps>(props)
	const {id, css, load, isLoaded, unload} = useStyle(dragNDropItemStyles)


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
  .origam-file-field-dragndrop-item {
    align-items: center;
    display: flex;
    gap: var(--origam-file-field-dragndrop-item---gap, 12px);
    width: 100%;
    z-index: 2;

    &__icon {
      color: var(--origam-file-field-dragndrop-item__icon---color, var(--origam-color__text---secondary));
      flex-shrink: 0;
    }

    &__content {
      display: flex;
      flex-direction: column;
      flex-grow: 1;
      gap: var(--origam-file-field-dragndrop-item---content-gap, 4px);
      min-width: 0;
    }

    &__name {
      font-size: var(--origam-file-field-dragndrop-item__name---font-size, 0.875rem);
      font-weight: var(--origam-file-field-dragndrop-item__name---font-weight, 500);
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    &__meta {
      color: var(--origam-file-field-dragndrop-item__meta---color, var(--origam-color__text---secondary));
      font-size: var(--origam-file-field-dragndrop-item__meta---font-size, 0.75rem);
    }

    &__progress {
      margin-top: var(--origam-file-field-dragndrop-item__progress---margin-top, 4px);
    }

    &__actions {
      align-items: center;
      display: flex;
      flex-shrink: 0;
      gap: var(--origam-file-field-dragndrop-item---actions-gap, 4px);
    }
  }
</style>
