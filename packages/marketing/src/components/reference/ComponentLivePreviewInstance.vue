<template>
    <component
        :is="tag"
        v-if="hasSlotContent"
        v-bind="instanceProps"
    >
        <template #default>
            <component
                :is="child.tag"
                v-for="(child, index) in children"
                :key="index"
                v-bind="child.props"
            >
                <template #default>{{ child.text }}</template>
            </component>
            {{ slotText }}
        </template>
    </component>

    <component
        :is="tag"
        v-else
        v-bind="instanceProps"
    />
</template>

<script setup lang="ts">
    import { computed } from 'vue'

    import type { IComponentLivePreviewInstanceProps } from '~/interfaces/component-live-preview.interface'

    /*********************************************************
     * Global
     *
     * @description
     * Rendu NU d'une instance de composant du DS — extrait de
     * `ComponentLivePreview` pour être réutilisable à deux endroits :
     * monté à la racine (cas courant), ou monté DANS le slot d'une
     * enveloppe parente minimale (`IComponentPreviewParentEnvelope`,
     * voir `component-preview.interface.ts`) quand le sous-composant
     * previewé lève sans son vrai parent du DS (`<origam-tab>` hors
     * `<origam-tabs>`, `<origam-data-table-row>` hors `<origam-data-table>`).
     *
     * @description
     * ⛔ Deux branches, pas un `<template #default>` conditionnel : un slot
     * DÉCLARÉ est un slot FOURNI, même vide (#728). Quand il n'y a rien à
     * mettre dedans, on ne passe pas de slot.
     ********************************************************/
    const props = withDefaults(defineProps<IComponentLivePreviewInstanceProps>(), {
        instanceProps: () => ({}),
        children: () => [],
        slotText: ''
    })

    /*********************************************************
     * Contenu du slot par défaut
     ********************************************************/
    const hasSlotContent = computed(() => props.children.length > 0 || props.slotText !== '')

    /*********************************************************
     * Expose
     ********************************************************/
    defineExpose({})
</script>
