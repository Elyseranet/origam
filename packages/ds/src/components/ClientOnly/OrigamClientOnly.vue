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

defineOptions({ name: 'OrigamClientOnly' })

defineProps<{
    /**
     * Tag used for the SSR placeholder when no `#fallback` slot is given.
     * Defaults to `undefined` — the SSR output is then completely empty
     * (a tiny perf win when the consumer doesn't need a layout reserved
     * slot). Set to `'div'` / `'span'` / etc. when the absence of a
     * placeholder would cause layout shift on hydration.
     */
    placeholderTag?: string
    /**
     * Class applied to the placeholder element. Pair with `placeholderTag`
     * to reserve dimensions matching the eventual client render (avoids
     * cumulative layout shift).
     */
    placeholderClass?: string
}>()

const isMounted = ref(false)

onMounted(() => {
    isMounted.value = true
})
</script>
