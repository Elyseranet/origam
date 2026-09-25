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

import type {
    IClientOnlyEmits,
    IClientOnlyProps,
    IClientOnlySlots
} from '../../interfaces/ClientOnly/client-only.interface'

/*
 * inheritAttrs — #916 / #853
 *
 * BOTH branches of the root `v-if` render a `<slot>`, and `renderSlot()`
 * always returns a FRAGMENT vnode — so the root is a fragment whatever the
 * mount state. Vue cannot merge fallthrough attributes onto a fragment and
 * logs "Extraneous non-props attributes"; that warning serialises the whole
 * ancestor trace, including Vue Router's `RouteProvider` vnode (~4.4 MB per
 * occurrence, #853).
 *
 * ⛔ NOTHING is forwarded, deliberately. This component is structurally
 * transparent: it owns no element of its own, it only chooses between the
 * `default` slot and the `fallback` slot. Measured on `develop` before this
 * flag, a consumer's `class` / `data-cy` / `aria-label` reached NOTHING in
 * either branch. The flag is therefore behaviour-preserving by construction.
 */
defineOptions({ name: 'OrigamClientOnly', inheritAttrs: false })

defineProps<IClientOnlyProps>()

defineEmits<IClientOnlyEmits>()

defineSlots<IClientOnlySlots>()

const isMounted = ref(false)

onMounted(() => {
    isMounted.value = true
})
</script>
