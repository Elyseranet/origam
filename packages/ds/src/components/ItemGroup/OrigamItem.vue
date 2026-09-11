<template>
  <component
    :is="tag"
    :class="itemClasses"
    :style="itemStyles"
  >
    <slot
      name="default"
      v-bind="slotProps"
    />
  </component>
</template>

<script
  lang="ts"
  setup
>
  import { computed, StyleValue } from 'vue'

  import {
	useGroupItem,
	useProps,
	useStyle
} from '../../composables'

  import { ORIGAM_ITEM_GROUP_KEY } from '../../consts'

  import type { IItemGroupItemProps } from '../../interfaces'

  interface Props extends IItemGroupItemProps {
    tag?: string
    value?: any
    disabled?: boolean
    selectedClass?: string
  }

  /*********************************************************
   * Global
   *
   * @description
   * Props, group registration, and slot props.
   ********************************************************/
  const props = withDefaults(defineProps<Props>(), {
    tag: 'div',
    value: undefined,
    selectedClass: undefined
  })

  const { filterProps } = useProps<IItemGroupItemProps>(props)

  const groupItem = useGroupItem(props, ORIGAM_ITEM_GROUP_KEY)

  if (!groupItem) {
    throw new Error('[Origam] <OrigamItem> must be used inside an <OrigamItemGroup>')
  }

  const slotProps = computed(() => ({
    isSelected: groupItem.isSelected.value,
    selectedClass: groupItem.selectedClass.value,
    toggle: groupItem.toggle,
    select: groupItem.select,
    value: groupItem.value.value,
    disabled: groupItem.disabled.value
  }))

  /*********************************************************
   * Class & Style
   *
   * @description
   * Composable-driven class and style composition.
   ********************************************************/
  const itemClasses = computed(() => {
    return [
      'origam-item',
      groupItem?.selectedClass.value,
      props.class
    ]
  })
  const itemStyles = computed(() => {
    return [
      props.style
    ] as StyleValue
  })
	const {id, css, load, isLoaded, unload} = useStyle(itemStyles)


  /*********************************************************
   * Expose
   *
   * @description
   * Forwards filterProps and group toggle to parent components.
   ********************************************************/
  defineExpose({
    filterProps,
    toggle: groupItem.toggle,
    css,
    id,
    load,
    unload,
    isLoaded
   })
</script>
