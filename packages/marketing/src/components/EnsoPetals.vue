<template>
  <div
    class="enso-petals"
    aria-hidden="true"
    data-cy="enso-petals"
  >
    <span
      v-for="petal in petals"
      :key="petal.key"
      class="enso-petals__petal enso-art"
      :style="petal.style"
    />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { IEnsoPetalsProps } from '~/interfaces/enso.interface'
import { ensoPetalViews } from '~/utils/enso.util'

/*********************************************************
 * Props, emits & slots
 *
 * @description
 * Pluie de pétales décorative, posée en absolu sur son parent (qui doit être
 * positionné et rogner son débordement). Animation CSS seule (`@keyframes`),
 * aucun timer ; supprimée sous `prefers-reduced-motion`. Les spans sont vides
 * et masqués de l'arbre d'accessibilité : aucun composant Origam ne rend un
 * décor sans contenu, et un `<origam-img>` par pétale chargerait les deux modes.
 ********************************************************/
const props = withDefaults(defineProps<IEnsoPetalsProps>(), {
    count: 10
})

defineEmits([])

defineSlots<Record<string, never>>()

/*********************************************************
 * Pétales
 *
 * @description
 * Les `count` premières trajectoires de `ENSO_PETAL_FLIGHTS` (plafonnées à 12).
 ********************************************************/
const petals = computed(() => ensoPetalViews(props.count))

/*********************************************************
 * Expose
 *
 * @description
 * Rien à piloter depuis l'extérieur.
 ********************************************************/
defineExpose({})
</script>

<style scoped lang="scss">
.enso-petals {
    position: absolute;
    inset: 0;
    overflow: clip;
    pointer-events: none;
    container-type: size;
}

.enso-petals__petal {
    position: absolute;
    inset-block-start: 0;
    inset-inline-start: var(--petal-start);
    inline-size: calc(var(--enso-petals---size, 2.5rem) * var(--petal-scale, 1));
    aspect-ratio: 1;
    background: var(--enso-art) center / contain no-repeat;
    opacity: 0;
    will-change: transform;
    animation: enso-petal-fall var(--petal-duration, 15s) linear var(--petal-delay, 0s) infinite;
}

@keyframes enso-petal-fall {
    0% {
        opacity: 0;
        transform: translate3d(0, -100%, 0) rotate(0deg);
    }

    10% {
        opacity: 0.9;
    }

    85% {
        opacity: 0.8;
    }

    100% {
        opacity: 0;
        transform: translate3d(var(--petal-drift, 10vw), 100cqb, 0) rotate(var(--petal-spin, 300deg));
    }
}

@container (max-width: 40rem) {
    .enso-petals__petal:nth-child(n + 7) {
        display: none;
    }
}

@media (prefers-reduced-motion: reduce) {
    .enso-petals {
        display: none;
    }
}
</style>
