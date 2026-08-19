<template>
    <template v-if="isMounted">
        <slot />
    </template>
    <template v-else>
        <slot name="fallback">
            <component
                :is="placeholderTag"
                v-if="placeholderTag"
                :class="placeholderClass"
                aria-hidden="true"
            />
        </slot>
    </template>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'

import type { IClientOnlyProps, IClientOnlySlots } from '../../interfaces'

defineOptions({ name: 'OrigamClientOnly' })

defineProps<IClientOnlyProps>()

defineSlots<IClientOnlySlots>()

const isMounted = ref(false)

onMounted(() => {
    isMounted.value = true
})
</script>
