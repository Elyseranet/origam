<template>
  <div
    ref="areaRef"
    class="tb-cm-demo"
    data-cy="theming-contextual-menu-area"
  >
    <origam-contextual-menu
      :attach="attach"
      v-bind="$attrs"
    >
      <template #activator="{ props: activatorProps }">
        <div
          v-bind="activatorProps"
          class="tb-cm-demo__target"
        >
          {{ t('theming.preview.contextual_menu.target', 'Right-click area') }}
        </div>
      </template>
      <origam-list-item
        v-for="label in labels"
        :key="label"
        :title="label"
      />
    </origam-contextual-menu>
  </div>
</template>

<script setup lang="ts">
  import { computed, onMounted, ref } from 'vue'

  defineOptions({ inheritAttrs: false })

  defineProps<{ attach: string }>()

  const { t } = useT()

  const labels = computed(() => [
    t('components.playground.snippet.common.one', 'One'),
    t('components.playground.snippet.common.two', 'Two'),
    t('components.playground.snippet.common.three', 'Three')
  ])

  const areaRef = ref<HTMLElement>()

  /* Le menu contextuel s'ouvre sur un vrai `contextmenu` : on le simule au centre de la zone (#1285). */
  onMounted(() => {
    const target = areaRef.value?.querySelector('.tb-cm-demo__target')
    if (!target) return
    const box = target.getBoundingClientRect()
    target.dispatchEvent(new MouseEvent('contextmenu', {
      bubbles: true,
      cancelable: true,
      clientX: box.left + box.width / 4,
      clientY: box.top + box.height / 4
    }))
  })
</script>

<style scoped lang="scss">
  .tb-cm-demo {
    inline-size: min(100%, 20rem);

    &__target {
      display: grid;
      place-items: center;
      min-block-size: 8rem;
      border: 1px dashed var(--origam-color__border---default);
      border-radius: var(--origam-radius---md, 0.375rem);
      color: var(--origam-color__text---primary);
    }
  }
</style>
