<template>
  <component
    :is="tag"
    :id="id"
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

  import { useGroupItem } from '../../composables/Commons/groupItem.composable'
  import { useProps } from '../../composables/Commons/props.composable'
  import { useStyle } from '../../composables/Commons/style.composable'

  import { ORIGAM_ITEM_GROUP_KEY } from '../../consts/ItemGroup/item-group.const'

  import type { IItemGroupItemEmits, IItemGroupItemProps, IItemGroupItemSlots } from '../../interfaces/ItemGroup/item-group.interface'

  /*********************************************************
   * Global
   *
   * @description
   * Props, group registration, and slot props.
   ********************************************************/
  const props = withDefaults(defineProps<IItemGroupItemProps>(), {
    tag: 'div',
    value: undefined,
    selectedClass: undefined
  })

  defineEmits<IItemGroupItemEmits>()

  defineSlots<IItemGroupItemSlots>()

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
	const {id, css, load, isLoaded, unload} = useStyle(itemStyles, () => props.id)


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
