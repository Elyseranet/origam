<template>
  <origam-input
      ref="origamInputRef"
      v-model="model"
      :class="fileFieldClasses"
      :focused="isFocused"
      :style="fileFieldStyles"
      v-bind="{ ...rootAttrs, ...inputProps }"
      @click:prepend="handleClickPrepend"
      @click:append="handleClickAppend"
  >
    <template
        v-if="slots.prepend"
        #prepend
    >
      <slot name="prepend"/>
    </template>

    <template #default="{id, isDisabled, isDirty, isValid, isReadonly}">
      <slot
          name="field"
          v-bind="{id, isDisabled, isDirty, isValid, isReadonly}"
      >
        <div
            v-if="isDropzoneMode"
            class="origam-file-field__dragndrop"
        >
          <label
              :class="dropzoneClasses"
              :style="dropzoneColorStyles"
              @dragenter.prevent="handleDragEnter"
              @dragover.prevent="handleDragOver"
              @dragleave.prevent="handleDragLeave"
              @drop.prevent="handleDrop"
          >
            <template v-if="!multiple && hasFiles">
              <slot
                  name="item"
                  v-bind="{
                    file: model[0],
                    index: 0,
                    progress: getProgress(0),
                    remove: () => handleRemove(0),
                    download: () => handleDownload(0, model[0]),
                  }"
              >
                <origam-file-field-drag-n-drop-item
                    :file="model[0]"
                    :index="0"
                    :progress="getProgress(0)"
                    :file-icon="fileIcon"
                    :download-icon="downloadIcon"
                    :remove-icon="removeIcon"
                    :downloadable="downloadable"
                    :disabled="isDisabled"
                    :readonly="isReadonly"
                    :color="color"
                    :show-size="showSize"
                    @click:remove="handleRemove(0)"
                    @click:download="handleDownload(0, model[0])"
                />
              </slot>
            </template>
            <template v-else>
              <slot
                  name="dropzone"
                  v-bind="{ isDragging, browse: handleBrowseClick }"
              >
                <origam-icon
                    :icon="dragndropIcon"
                    class="origam-file-field__dropzone-icon"
                />
                <div class="origam-file-field__dropzone-title">
                  {{ dropzoneTitleText }}
                </div>
                <div class="origam-file-field__dropzone-subtitle">
                  {{ dropzoneSubtitleText }}
                </div>
                <div
                    v-if="isErrored && errorMessage"
                    class="origam-file-field__dropzone-error"
                    role="alert"
                    data-cy="file-field-dropzone-error-message"
                >
                  {{ errorMessage }}
                </div>
              </slot>
            </template>
            <input
                :id="id"
                ref="inputRef"
                :disabled="isDisabled"
                :multiple="multiple"
                :name="name"
                :readonly="isReadonly"
                class="origam-file-field__dropzone-input"
                type="file"
                v-bind="inputAttrs"
                @blur="handleBlur"
                @change="handleChange"
                @focus="handleFocus"
            >
          </label>

          <ul
              v-if="multiple && hasFiles"
              class="origam-file-field__list"
          >
            <template v-for="(item, idx) in fileList" :key="idx">
              <slot
                  name="item"
                  v-bind="{
                    file: item,
                    index: idx,
                    progress: getProgress(idx),
                    remove: () => handleRemove(idx),
                    download: () => handleDownload(idx, item),
                  }"
              >
                <origam-file-field-list-item
                    :file="item"
                    :index="idx"
                    :progress="getProgress(idx)"
                    :file-icon="fileIcon"
                    :download-icon="downloadIcon"
                    :remove-icon="removeIcon"
                    :downloadable="downloadable"
                    :disabled="isDisabled"
                    :readonly="isReadonly"
                    :color="color"
                    :show-size="showSize"
                    @click:remove="handleRemove(idx)"
                    @click:download="handleDownload(idx, item)"
                />
              </slot>
            </template>
          </ul>
        </div>

        <div
            v-else
            class="origam-file-field__field"
        >
          <origam-field
              :id="id"
              ref="origamFieldRef"
              :active="isActive || isDirty"
              :dirty="isDirty || dirty"
              :disabled="isDisabled"
              :error="!isValid || isErrored"
              :focused="isFocused"
              v-bind="{ ...fieldProps }"
              @click="handleControlClick"
              @mousedown="handleControlMousedown"
              @click:clear="handleClear"
              @click:prepend-inner="handleClickPrependInner"
              @click:append-inner="handleClickAppendInner"
          >
            <template
                v-if="slots.loader"
                #loader
            >
              <slot name="loader"/>
            </template>

            <template
                v-if="slots.prependInner"
                #prependInner
            >
              <slot name="prependInner"/>
            </template>

            <template
                v-if="slots.floatingLabel"
                #floatingLabel
            >
              <slot name="floatingLabel"/>
            </template>

            <template
                v-if="slots.label"
                #label
            >
              <slot name="label"/>
            </template>

            <template
                v-if="slots.prefix"
                #prefix
            >
              <slot name="prefix"/>
            </template>

            <template #default="{class: fieldSlotClass, ref, ...fieldSlotProps}">
              <div
                  :class="fieldSlotClass"
                  data-no-activator=""
              >
                <slot
                    name="default"
                    v-bind="{ref, ...fieldSlotProps}"
                />
                <input
                    ref="inputRef"
                    :disabled="isDisabled"
                    :multiple="multiple"
                    :name="name"
                    :placeholder="placeholder"
                    :readonly="isReadonly"
                    :size="1"
                    type="file"
                    v-bind="{ ...fieldSlotProps, ...inputAttrs }"
                    @blur="handleBlur"
                    @change="handleChange"
                    @click="handleClick($event, isReadonly)"
                    @focus="handleFocus"
                >

                <template v-if="hasFiles">
                  <div class="origam-file-field__selections">
                    <template v-if="multiple && hasChips">
                      <template
                          v-for="(filename, index) in fileNames"
                          :key="index"
                      >
                        <div class="origam-file-field__selection">
                          <slot
                              name="chip"
                              v-bind="{ fileNames: filename, totalBytes: totalBytes, totalBytesReadable: totalBytesReadable, props: chipProps }"
                          >
                            <origam-chip
                                key="chip"
                                :model-value="true"
                                size="small"
                                v-bind="chipProps"
                                @click:close.prevent.stop="handleRemove(index)"
                            >
                              <template #default>
                                <slot name="selection">
                                  {{ filename }}
                                </slot>
                              </template>
                            </origam-chip>
                          </slot>
                        </div>
                      </template>
                    </template>
                    <template v-else>
                      <span class="origam-file-field__selection-text">
                        <slot name="selection">
                          {{ selectionText }}
                        </slot>
                      </span>
                      <origam-counter
                          v-if="hasInlineCounter"
                          class="origam-file-field__inline-counter"
                          data-cy="file-field-inline-counter"
                          :active="true"
                          :value="inlineCounterValue"
                      />
                    </template>
                  </div>
                </template>
              </div>
            </template>

            <template
                v-if="slots.suffix"
                #suffix
            >
              <slot name="suffix"/>
            </template>

            <template
                v-if="slots.appendInner"
                #appendInner
            >
              <slot name="appendInner"/>
            </template>

            <template
                v-if="slots.clear"
                #clear
            >
              <slot name="clear"/>
            </template>
          </origam-field>

          <ul
              v-if="multiple && hasFiles && !hasChips && displayMode === 'list'"
              class="origam-file-field__list"
          >
            <template v-for="(item, idx) in fileList" :key="idx">
              <slot
                  name="item"
                  v-bind="{
                    file: item,
                    index: idx,
                    progress: getProgress(idx),
                    remove: () => handleRemove(idx),
                    download: () => handleDownload(idx, item),
                  }"
              >
                <origam-file-field-list-item
                    :file="item"
                    :index="idx"
                    :file-icon="fileIcon"
                    :remove-icon="removeIcon"
                    :disabled="isDisabled"
                    :readonly="isReadonly"
                    :show-size="showSize"
                    @click:remove="handleRemove(idx)"
                />
              </slot>
            </template>
          </ul>
        </div>
      </slot>
    </template>

    <template
        v-if="slots.append"
        #append
    >
      <slot name="append"/>
    </template>

    <template
        v-if="hasDetails"
        #details="detailsSlotProps"
    >
      <slot
          name="details"
          v-bind="detailsSlotProps"
      >
        <origam-counter
            :active="persistentCounter || isFocused"
            :disabled="disabled"
            :value="counterValue"
        >
          <template
              v-if="slots.counter"
              #default="{counter, value, max}"
          >
            <slot
                name="counter"
                v-bind="{counter, value, max}"
            />
          </template>
        </origam-counter>
      </slot>
    </template>

    <template
        v-if="slots.messages"
        #messages="{hasMessages, messages}"
    >
      <slot
          name="messages"
          v-bind="{hasMessages, messages}"
      />
    </template>

    <template
        v-if="slots.message"
        #message="{message}"
    >
      <slot
          name="message"
          v-bind="{message}"
      />
    </template>
  </origam-input>
</template><script
    lang="ts"
    setup
>
  import { computed, nextTick, ref, StyleValue, toRef, useAttrs, useSlots, watch } from 'vue'

  import { OrigamChip, OrigamCounter, OrigamField, OrigamIcon, OrigamInput } from '../../components'
  import OrigamFileFieldDragNDropItem from './OrigamFileFieldDragNDropItem.vue'
  import OrigamFileFieldListItem from './OrigamFileFieldListItem.vue'
  import {
	useAdjacent,
	useAdjacentInner,
	useBothColor,
	useDefaults,
	useDensity,
	useFocus,
	useLocale,
	useProps,
	useStyle,
	useVModel
} from '../../composables'
  import { DENSITY, MDI_ICONS } from '../../enums'
  import type { IFileFieldProps, IFileFieldSlots} from '../../interfaces'

	import type { IFileFieldEmits } from '../../interfaces/FileField/file-field.interface'
  import type { TOrigamField, TOrigamInput } from '../../types'
  import { filterInputAttrs, forwardRefs, humanReadableFileSize, wrapInArray } from '../../utils'

  /*********************************************************
   * Global
   *
   * @description
   * Props for the `IFileFieldProps` interface used in the component.
   *    Contains default values provided via the `withDefaults` utility.
   * Emits an event. The `defineEmits` function can be used in Vue 3 to declare emitted events.
   *    This variable serves as a declaration point for all events that the component can emit.
   * Slots for the component.
   ********************************************************/
  const _props = withDefaults(defineProps<IFileFieldProps>(), {
    prependInnerIcon: MDI_ICONS.PAPERCLIP,
    dragndropIcon: MDI_ICONS.CLOUD_UPLOAD_OUTLINE,
    fileIcon: MDI_ICONS.FILE,
    removeIcon: MDI_ICONS.CLOSE,
    downloadIcon: MDI_ICONS.DOWNLOAD,
    showSize: false,
    clearable: true,
    centerAffix: true,
    density: DENSITY.DEFAULT,
    border: true,
    rounded: true,
    divider: ',',
    display: 'list',
    counterSizeString: 'origam.fileField.counterSize',
    counterString: 'origam.fileField.counter',
    dropzoneTitle: 'origam.fileField.dropzoneTitle',
    dropzoneSubtitle: 'origam.fileField.dropzoneSubtitle',
    browseText: 'origam.fileField.browse',
    maxFileSizeErrorString: 'origam.validation.max_size_error'
  })
  const props = useDefaults(_props)

  /*********************************************************
   * PDF P3 — display + dropzone aliasing + error
   *
   * @description
   *  - `dropzone` is the new public alias for the legacy `dragndrop`
   *    prop; both feed the same internal flag so existing consumers
   *    aren't broken.
   *  - `display` selects the multi-file rendering strategy: 'list',
   *    'chips', or 'counter'. Backward-compat: if the legacy `chips`
   *    boolean is set it forces 'chips' regardless of `display`.
   *  - `error` accepts `boolean | string`. The boolean value is forwarded
   *    to `<OrigamField error>`; the string (when present) is rendered as
   *    the dropzone error message and exposed via `errorMessage`.
   ********************************************************/
  const isDropzoneMode = computed(() => Boolean(props.dropzone || props.dragndrop))
  const displayMode = computed(() => {
    if (props.chips) return 'chips'
    return props.display ?? 'list'
  })
  const isErrored = computed(() => Boolean(props.error))
  const errorMessage = computed(() => typeof props.error === 'string' ? props.error : '')
  // Concrete array of files used by the v-for sites below. Going
  // through a dedicated computed (rather than reading `model.value`
  // directly in the template) sidesteps a Vue compiler quirk where
  // re-binding `<v-for="(file, index) in model">` failed to invalidate
  // when the model was updated via the synthetic `change` event the
  // tests dispatch. The variable name `(item, idx)` is also used in
  // the templates for the same reason — `(file, …)` collided with the
  // implicit `file` reactive ref in the slot scope.
  const fileList = computed(() => {
    const mv = props.modelValue as unknown
    if (Array.isArray(mv)) return mv as Array<File>
    if (mv instanceof File) return [mv]
    const m = model.value
    return Array.isArray(m) ? (m as Array<File>) : []
  })

  const emits = defineEmits<IFileFieldEmits>()

  defineSlots<IFileFieldSlots>()
  const slots = useSlots()

  const attrs = useAttrs()

  const { t } = useLocale()

  /*********************************************************
   * Value
   ********************************************************/

  const model = useVModel(
      props,
      'modelValue',
      props.multiple ? [] as Array<File> : null,
      val => wrapInArray(val),
      val => (props.multiple || Array.isArray(props.modelValue)) ? val : (val[0] ?? null)
  )

  /*********************************************************
   * Adjacent
   *
   * @description
   * Handles click events for prepend/append and inner icons.
   ********************************************************/

  /*********************************************************
   * Icon
   ********************************************************/

  /*********************************************************
   * Composables
   ********************************************************/

  const {
    onClickPrepend,
    onClickAppend: handleClickAppend
  } = useAdjacent(props, toRef(props, 'prependIcon'), toRef(props, 'appendIcon'))
  const {
    onClickPrependInner: handleClickPrependInner,
    onClickAppendInner: handleClickAppendInner
  } = useAdjacentInner(props)

  /*********************************************************
   * Reference Html
   *
   * @description
   * References to the underlying HTML elements and child components.
   ********************************************************/
  const origamInputRef = ref<TOrigamInput>()
  const origamFieldRef = ref<TOrigamField>()
  const inputRef = ref<HTMLInputElement>()

  /*********************************************************
   * Events & controls
   *
   * @description
   * Focus management, control clicks, clear, and input change handlers.
   ********************************************************/

  /*********************************************************
   * Effect
   ********************************************************/

  const { isFocused, onFocus, onBlur: handleBlur } = useFocus(props)

  const isActive = computed(() => {
    return isFocused.value || props.active
  })

  /*********************************************************
   * Event handlers
   ********************************************************/

  const handleFocus = () => {
    nextTick(() => {
      const input: HTMLInputElement | undefined = inputRef.value

      if (input && input !== document.activeElement) {
        input.focus()
      }
    })

    if (!isFocused.value) onFocus()
  }
  const handleClickPrepend = (e: MouseEvent) => {
    onClickPrepend(e)
    inputRef.value?.click()
  }
  const handleControlMousedown = (e: MouseEvent) => {
    emits('mousedown:control', e)
  }
  const handleControlClick = (e: MouseEvent) => {
    inputRef.value?.click()

    emits('click:control', e)
  }
  const handleClear = (e: MouseEvent) => {
    e.stopPropagation()

    handleFocus()

    nextTick(() => {
      model.value = []

      emits('click:clear', e)
    })
  }
  const handleClick = (e: MouseEvent, isReadonly: any) => {
    e.stopPropagation()

    if (isReadonly.value) e.preventDefault()

    onFocus()
  }
  const handleChange = (e: Event) => {
    if (!e.target) return

    const target = e.target as HTMLInputElement
    const files = filterBySize([...target.files ?? []])

    if (props.dragndrop && props.multiple && hasFiles.value) {
      model.value = [...(model.value ?? []), ...files]
    } else {
      model.value = files
    }
  }

  /*********************************************************
   * Drag & Drop
   *
   * @description
   * Drag and drop event handlers for the dropzone mode.
   ********************************************************/
  const isDragging = ref(false)

  const handleBrowseClick = () => {
    inputRef.value?.click()
  }
  const handleDragEnter = () => {
    if (props.disabled || props.readonly) return
    isDragging.value = true
  }
  const handleDragOver = (e: DragEvent) => {
    if (props.disabled || props.readonly) return
    if (e.dataTransfer) e.dataTransfer.dropEffect = 'copy'
    isDragging.value = true
  }
  const handleDragLeave = (e: DragEvent) => {
    const currentTarget = e.currentTarget as HTMLElement | null
    const related = e.relatedTarget as Node | null

    if (currentTarget && related && currentTarget.contains(related)) return

    isDragging.value = false
  }
  const handleDrop = (e: DragEvent) => {
    isDragging.value = false

    if (props.disabled || props.readonly) return

    const dropped = Array.from(e.dataTransfer?.files ?? [])
    const filtered = filterBySize(dropped)
    const limited = props.multiple ? filtered : filtered.slice(0, 1)

    if (props.multiple && hasFiles.value) {
      model.value = [...(model.value ?? []), ...limited]
    } else {
      model.value = limited
    }

    emits('drop', { files: limited, event: e })
  }

  /*********************************************************
   * File management
   *
   * @description
   * File size validation, remove and download handlers.
   ********************************************************/
  const filterBySize = (files: Array<File>): Array<File> => {
    if (!props.maxFileSize) return files

    const accepted: Array<File> = []
    const rejected: Array<File> = []

    for (const file of files) {
      if (file.size <= props.maxFileSize) {
        accepted.push(file)
      } else {
        rejected.push(file)
      }
    }

    if (rejected.length > 0) {
      emits('error:max-size', {
        files: rejected,
        maxFileSize: props.maxFileSize,
        message: rejected.map(file => t(
            props.maxFileSizeErrorString,
            [file.name, humanReadableFileSize(props.maxFileSize!, base.value)]
        ))
      })
    }

    return accepted
  }
  const handleRemove = (index: number) => {
    const files = [...(model.value ?? [])]
    const [removed] = files.splice(index, 1)

    model.value = files

    emits('click:remove', { file: removed, index })
  }
  const handleDownload = (index: number, file: File) => {
    emits('click:download', { file, index })
  }

  /*********************************************************
   * Watcher
   *
   * @description
   * Resets the native input value when the model is cleared.
   ********************************************************/
  watch(model, (newValue) => {
    const hasModelReset = !Array.isArray(newValue) || !newValue.length

    if (hasModelReset && inputRef.value) {
      inputRef.value.value = ''
    }
  })

  /*********************************************************
   * Counter & details
   *
   * @description
   * File counter, file size display, and details slot visibility.
   ********************************************************/
  const base = computed(() => {
    return typeof props.showSize !== 'boolean' ? props.showSize : undefined
  })
  const totalBytes = computed(() => {
    return (model.value ?? []).reduce((bytes, {size = 0}) => bytes + size, 0)
  })
  const totalBytesReadable = computed(() => {
    return humanReadableFileSize(totalBytes.value, base.value)
  })
  const fileNames = computed(() => {
    return (model.value ?? []).map((file) => {
      const {name = '', size = 0} = file

      return !props.showSize
          ? name
          : `${name} (${humanReadableFileSize(size, base.value)})`
    })
  })
  const selectionText = computed(() => {
    if (!hasFiles.value) return ''

    if (props.multiple) {
      return t(props.counterString, [model.value?.length ?? 0])
    }

    return fileNames.value[0] ?? ''
  })
  const counterValue = computed(() => {
    const fileCount = model.value?.length ?? 0

    if (props.showSize) {
      return t(props.counterSizeString, [fileCount, totalBytesReadable.value])
    }

    return t(props.counterString, [fileCount])
  })
  const hasFiles = computed(() => {
    return Array.isArray(model.value) && model.value.length > 0
  })
  const hasCounter = computed(() => {
    return slots.counter || props.counter
  })
  const hasDetails = computed(() => {
    return slots.details || hasCounter.value
  })
  const hasChips = computed(() => {
    return displayMode.value === 'chips' || slots.chip
  })
  const hasInlineCounter = computed(() => {
    return displayMode.value === 'counter' && hasFiles.value && props.multiple
  })
  const inlineCounterValue = computed(() => {
    return model.value?.length ?? 0
  })
  const chipProps = computed(() => {
    return {
      closable: !props.disabled && !props.readonly,
      color: props.color
    }
  })
  const getProgress = (index: number) => {
    return props.progress?.[index] ?? 0
  }

  /*********************************************************
   * Dropzone text
   *
   * @description
   * Translated text for the dropzone title and subtitle.
   ********************************************************/
  const dropzoneTitleText = computed(() => {
    return t(props.dropzoneTitle)
  })
  const dropzoneSubtitleText = computed(() => {
    return t(props.dropzoneSubtitle)
  })

  /*********************************************************
   * Props
   *
   * @description
   * Filtered props for the underlying origam-input and origam-field components.
   ********************************************************/
  const [rootAttrs, inputAttrs] = filterInputAttrs(attrs)

  /*********************************************************
   * Forwarded props
   ********************************************************/

  const inputProps = computed(() => {
    return origamInputRef.value?.filterProps(props, ['modelValue', 'class', 'style', 'id', 'focused'])
  })
  const fieldProps = computed(() => {
    return origamFieldRef.value?.filterProps(props, ['class', 'style', 'id', 'active', 'dirty', 'disabled', 'focused', 'error'])
  })

  /*********************************************************
   * Class & Style
   *
   * @description
   * fileFieldClasses is a computed property that returns an array of classes for the fileField element.
   * fileFieldStyles is a computed property that returns an array of styles for the fileField element.
   ********************************************************/
  const fileFieldStyles = computed(() => {
    return [
      props.style
    ] as StyleValue
  })
  const fileFieldClasses = computed(() => {
    return [
      'origam-file-field',
      {
        'origam-file-field--chips': props.chips,
        'origam-file-field--dragndrop': props.dragndrop
      },
      props.class
    ]
  })
  // Phase 3 (Vague B) — class-first companion alongside inline styles.
  // `dropzoneColorClasses` carries `.origam--bg-{intent}` /
  // `.origam--color-{intent}` for tokenised intents on the dropzone;
  // `dropzoneColorStyles` keeps the legacy fallback for raw colors.

  /*********************************************************
   * Color
   ********************************************************/

  const { colorClasses: dropzoneColorClasses, colorStyles: dropzoneColorStyles } = useBothColor(
      toRef(props, 'bgColor'),
      toRef(props, 'color'),
  )
  const { densityClasses: dropzoneDensityClasses } = useDensity(props, 'origam-file-field__dropzone')
  const dropzoneClasses = computed(() => {
    return [
      'origam-file-field__dropzone',
      {
        'origam-file-field__dropzone--dragging': isDragging.value,
        'origam-file-field__dropzone--disabled': props.disabled,
        'origam-file-field__dropzone--readonly': props.readonly,
        'origam-file-field__dropzone--has-file': !props.multiple && hasFiles.value,
        'origam-file-field__dropzone--error': isErrored.value
      },
      dropzoneColorClasses.value,
      dropzoneDensityClasses.value
    ]
  })

  /*********************************************************
   * Expose
   *
   * @description
   * Exposes functions and components to the world.
   *    filterProps is a function that filters out props that are not defined in the `IFileFieldProps` interface.
   ********************************************************/
  const { filterProps } = useProps<IFileFieldProps>(props)
	const {id, css, load, isLoaded, unload} = useStyle(fileFieldStyles)


  defineExpose(forwardRefs({filterProps,
		css,
		id,
		load,
		unload,
		isLoaded
	}, origamInputRef, origamFieldRef, inputRef))
</script>

<style
    lang="scss"
    scoped
>
  .origam-file-field {
    :deep(input[type=file]) {
      height: 100%;
      left: 0;
      opacity: 0;
      position: absolute;
      top: 0;
      width: 100%;
      z-index: 1;
    }

    :deep(.origam-input) {
      .origam-input__details {
        padding-inline: var(--origam-file-field---details-padding-inline, 16px);
      }
    }

    :deep(.origam-field) {
      &.origam-field--active {
        .origam-field__input {
          flex-wrap: nowrap;
          padding-block: 4px;
        }
      }
    }

    &__field {
      display: flex;
      flex-direction: column;
      gap: var(--origam-file-field---field-gap, 8px);
      width: 100%;
    }

    &__selections {
      display: flex;
      align-items: center;
      min-width: 0;
      overflow: hidden;
      flex: 1;
      z-index: 2;
    }

    &__selection {
      max-width: 100%;
    }

    &__selection-text {
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    &__inline-counter {
      flex-shrink: 0;
      margin-inline-start: var(--origam-file-field---inline-counter-margin, 8px);
    }

    &--dragndrop {
      :deep(.origam-input__control) {
        display: block;
      }
    }

    &__dragndrop {
      display: flex;
      flex-direction: column;
      gap: var(--origam-file-field---gap, 12px);
      width: 100%;
    }

    &__dropzone {
      align-items: center;
      background-color: var(--origam-file-field__dropzone---background-color, transparent);
      border: var(--origam-file-field__dropzone---border-width, 2px) var(--origam-file-field__dropzone---border-style, dashed) var(--origam-file-field__dropzone---color, var(--origam-color__border---default));
      border-radius: var(--origam-file-field__dropzone---border-radius, 8px);
      color: var(--origam-file-field__dropzone---color, inherit);
      cursor: var(--origam-file-field__dropzone---cursor, pointer);
      display: flex;
      flex-direction: column;
      gap: var(--origam-file-field__dropzone---gap, 8px);
      justify-content: center;
      min-height: calc(var(--origam-file-field__dropzone---min-height, 140px) + var(--origam-file-field__dropzone---density, 0px));
      padding: calc(var(--origam-file-field__dropzone---padding, 24px) + var(--origam-file-field__dropzone---density, 0px));
      position: relative;
      text-align: center;
      transition: border-color var(--origam-file-field---transition-duration, 200ms) ease, background-color var(--origam-file-field---transition-duration, 200ms) ease;

      &:hover {
        border-color: var(--origam-file-field__dropzone---color-hover, var(--origam-color__border---strong));
      }

      &--dragging {
        background-color: var(--origam-file-field__dropzone---bg-dragging, var(--origam-file-field__dropzone--dragging---background-color, var(--origam-color__feedback--info---bg-subtle)));
        border-color: var(--origam-file-field__dropzone---border-color-dragging, var(--origam-file-field__dropzone--dragging---border-color, var(--origam-color__feedback--info---bg)));
      }

      &--error {
        border-color: var(--origam-file-field__dropzone--error---border-color, var(--origam-file-field__dropzone---border-color-error, var(--origam-color__feedback--danger---bg)));

        .origam-file-field__dropzone-icon,
        .origam-file-field__dropzone-title {
          color: var(--origam-file-field__dropzone--error---fg, var(--origam-color__feedback--danger---fg-subtle));
        }
      }

      &-error {
        color: var(--origam-file-field__dropzone--error---fg, var(--origam-color__feedback--danger---fg-subtle));
        font-size: var(--origam-file-field__dropzone---subtitle-font-size, 0.75rem);
        margin-top: var(--origam-file-field__dropzone---gap-deck, 8px);
      }

      &--has-file {
        flex-direction: row;
        gap: var(--origam-file-field__dropzone--has-file---gap, 12px);
        justify-content: flex-start;
        min-height: auto;
        padding-block: var(--origam-file-field__dropzone--has-file---padding, 10px);
        padding-inline: var(--origam-file-field__dropzone--has-file---padding-inline, 12px);
        text-align: left;
      }

      &--density-compact {
        --origam-file-field__dropzone---density: -8px;
      }

      &--density-comfortable {
        --origam-file-field__dropzone---density: -4px;
      }

      &--disabled,
      &--readonly {
        cursor: var(--origam-file-field__dropzone---cursor-disabled, not-allowed);
        opacity: var(--origam-file-field__dropzone---opacity-disabled, 0.6);
      }

      &-icon {
        font-size: var(--origam-file-field__dropzone---icon-font-size, 40px);
        opacity: var(--origam-file-field__dropzone---icon-opacity, 0.7);
      }

      &-title {
        font-size: var(--origam-file-field__dropzone---title-font-size, 0.875rem);
        font-weight: var(--origam-file-field__dropzone---title-font-weight, 500);
      }

      &-subtitle {
        font-size: var(--origam-file-field__dropzone---subtitle-font-size, 0.75rem);
        opacity: var(--origam-file-field__dropzone---subtitle-opacity, 0.6);
      }

      &-input {
        height: 100%;
        left: 0;
        opacity: 0;
        position: absolute;
        top: 0;
        width: 100%;
      }
    }

    &__list {
      display: flex;
      flex-direction: column;
      gap: var(--origam-file-field---list-gap, 8px);
      list-style: none;
      margin: 0;
      padding: 0;
    }
  }
</style>
