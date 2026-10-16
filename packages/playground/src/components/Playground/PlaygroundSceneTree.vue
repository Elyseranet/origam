<template>
    <section
            class="pg-scene-tree"
            :aria-labelledby="titleId"
            data-cy="playground-scene-tree"
    >
        <origam-title
                :id="titleId"
                tag="h2"
                class="pg-scene-tree__title"
        >
            <template #default>{{ titleLabel }}</template>
        </origam-title>

        <p
                v-if="isEmpty"
                class="pg-scene-tree__empty"
                data-cy="playground-scene-tree-empty"
        >
            {{ emptyLabel }}
        </p>

        <template v-else>
            <origam-treeview
                    :items="nodes"
                    :model-value="selectedValue"
                    :expanded-value="expandedIds"
                    :aria-label="titleLabel"
                    :select-mode="selectMode"
                    :selectable-nodes="selectableNodes"
                    :density="density"
                    data-cy="playground-scene-tree-list"
                    @select="handleSelect"
                    @update:expanded-value="handleExpandedChange"
            />

            <div
                    class="pg-scene-tree__actions"
                    role="group"
                    :aria-label="actionsLabel"
                    data-cy="playground-scene-tree-actions"
            >
                <template v-if="canAddChild">
                    <origam-select
                            v-model="childChoice"
                            :items="childOptions"
                            :label="childPickerLabel"
                            :density="density"
                            data-cy="playground-scene-add-child-picker"
                    />
                    <origam-btn
                            variant="tonal"
                            :disabled="isAddDisabled"
                            data-cy="playground-scene-add-child"
                            @click="handleAddChild"
                    >
                        <template #default>{{ addChildLabel }}</template>
                    </origam-btn>
                </template>
                <p
                        v-else
                        class="pg-scene-tree__hint"
                        data-cy="playground-scene-no-default-slot"
                >
                    {{ noDefaultSlotLabel }}
                </p>

                <origam-btn
                        variant="text"
                        :disabled="isRemoveDisabled"
                        :aria-label="removeAriaLabel"
                        data-cy="playground-scene-remove"
                        @click="handleRemove"
                >
                    <template #default>{{ removeLabel }}</template>
                </origam-btn>
            </div>
        </template>
    </section>
</template>

<script setup lang="ts">
    import { computed, ref, useId, watch } from 'vue'
    import { DENSITY, TREEVIEW_SELECTABLE_NODES, TREEVIEW_SELECT_MODE } from 'origam/enums'
    import { useT } from '../../composables/I18n/useT'
    import { INSTANCE_HINT_PROP_KEYS } from '../../consts/Commons/scene.const'
    import { DEFAULT_SLOT_NAME } from '../../consts/Commons/scene-code.const'
    import { acceptsDefaultSlot, collectParentIds, findInstance, instanceHint, toTreeNodes } from '../../utils/Commons/scene-instance.util'
    import type { IPlaygroundSceneTreeEmits, IPlaygroundSceneTreeOption, IPlaygroundSceneTreeProps, IPlaygroundSceneTreeSlots } from '../../interfaces/Components/playground-scene-tree.interface'
    import type { IPlaygroundInstance } from '../../interfaces/Scene/playground-instance.interface'

    /*********************************************************
     * Global
     ********************************************************/
    const props = defineProps<IPlaygroundSceneTreeProps>()

    const emits = defineEmits<IPlaygroundSceneTreeEmits>()

    defineSlots<IPlaygroundSceneTreeSlots>()

    const { t } = useT()

    const titleId = useId()

    /*********************************************************
     * Tree
     *
     * @description
     * `OrigamTreeview` reused rather than a hand-made list: it already is a
     * `role="tree"` with `treeitem` rows, roving Tab stops, Enter / Space to
     * select and ArrowRight / ArrowLeft to expand, collapse and move between
     * levels. Node ids ARE instance ids, so the tree's selection is the
     * scene's `selectedInstanceId` with no translation.
     ********************************************************/
    const labelOf = (instance: IPlaygroundInstance, slot: string): string => {
        const label = props.registry.getComponentMetadata(instance.componentName)?.label ?? instance.componentName
        const hint = instanceHint(instance, INSTANCE_HINT_PROP_KEYS)
        const named = hint ? t('playground.scene_tree.node_with_hint', '{label} — {hint}', { label, hint }) : label

        return slot === DEFAULT_SLOT_NAME ? named : t('playground.scene_tree.node_in_slot', '{label} (#{slot})', { label: named, slot })
    }

    const selectMode = TREEVIEW_SELECT_MODE.SINGLE
    const selectableNodes = TREEVIEW_SELECTABLE_NODES.ALL
    const density = DENSITY.COMPACT

    const nodes = computed(() => toTreeNodes(props.scene.roots, labelOf))
    const isEmpty = computed(() => props.scene.roots.length === 0)
    const selectedValue = computed(() => props.selectedId ?? '')

    const handleSelect = (instanceId: string) => {
        emits('select', instanceId)
    }

    /*********************************************************
     * Expansion
     *
     * @description
     * Every parent starts EXPANDED — a snippet's children are the reason it
     * was loaded, hiding them behind a chevron would hide the feature. What
     * the user collapses is remembered as a set of collapsed ids, so a node
     * added later (a fresh parent) arrives expanded too.
     ********************************************************/
    const collapsed = ref<Set<string>>(new Set())

    const parentIds = computed(() => collectParentIds(props.scene.roots))
    const expandedIds = computed(() => parentIds.value.filter(id => !collapsed.value.has(id)))

    const handleExpandedChange = (value: string[]) => {
        const open = new Set(value)
        collapsed.value = new Set(parentIds.value.filter(id => !open.has(id)))
    }

    /*********************************************************
     * Selected instance
     ********************************************************/
    const selectedInstance = computed(() => (props.selectedId ? findInstance(props.scene.roots, props.selectedId) : undefined))
    const selectedDefinition = computed(() => (selectedInstance.value ? props.registry.getComponentMetadata(selectedInstance.value.componentName) : undefined))

    /*********************************************************
     * Add a child
     *
     * @description
     * Offered only on an instance whose component declares a `default` slot
     * (source B). The picker lists the selected component's own family
     * first — `OrigamTab` under `OrigamTabs`, `OrigamWindowItem` under
     * `OrigamWindow` — then every component that renders on its own. A
     * sub-component of ANOTHER family is never offered: it would only throw
     * for want of its parent.
     ********************************************************/
    const canAddChild = computed(() => acceptsDefaultSlot(selectedDefinition.value))

    const childOptions = computed<IPlaygroundSceneTreeOption[]>(() => {
        const self = selectedDefinition.value
        const definitions = props.registry.getComponents()
        const isKin = (name: string, family: string) => family === self?.family && name !== self?.name
        const ownFamily = definitions.filter(definition => isKin(definition.name, definition.family))
        const others = definitions.filter(definition => !isKin(definition.name, definition.family) && !definition.requiresParent)

        return [...ownFamily, ...others].map(definition => ({ title: definition.label, value: definition.name }))
    })

    const childChoice = ref<string | null>(null)

    watch(childOptions, options => {
        childChoice.value = options[0]?.value ?? null
    }, { immediate: true })

    const isAddDisabled = computed(() => !childChoice.value)

    const handleAddChild = () => {
        if (selectedInstance.value && childChoice.value) emits('add-child', selectedInstance.value.id, childChoice.value)
    }

    /*********************************************************
     * Remove
     ********************************************************/
    const isRemoveDisabled = computed(() => !selectedInstance.value)

    const handleRemove = () => {
        if (selectedInstance.value) emits('remove', selectedInstance.value.id)
    }

    /*********************************************************
     * Labels
     ********************************************************/
    const selectedLabel = computed(() => (selectedInstance.value ? labelOf(selectedInstance.value, DEFAULT_SLOT_NAME) : ''))

    const titleLabel = computed(() => t('playground.scene_tree.title', 'Scene'))
    const emptyLabel = computed(() => t('playground.scene_tree.empty', 'The scene is empty.'))
    const actionsLabel = computed(() => t('playground.scene_tree.actions', 'Edit the selected instance'))
    const childPickerLabel = computed(() => t('playground.scene_tree.child_picker', 'Child component'))
    const addChildLabel = computed(() => t('playground.scene_tree.add_child', 'Add child'))
    const noDefaultSlotLabel = computed(() => t('playground.scene_tree.no_default_slot', 'This component has no default slot to hold a child.'))
    const removeLabel = computed(() => t('playground.scene_tree.remove', 'Remove'))
    const removeAriaLabel = computed(() => t('playground.scene_tree.remove_aria', 'Remove {name} and its children', { name: selectedLabel.value }))

    /*********************************************************
     * Expose
     ********************************************************/
    defineExpose({})
</script>

<style lang="scss" scoped>
    .pg-scene-tree {
        display: flex;
        flex-direction: column;
        gap: var(--pg-scene-tree---gap, 8px);
        padding: var(--pg-scene-tree---padding, 16px);
        border-block-end: 1px solid var(--pg-scene-tree---border-color, #e5e5e5);
        border-inline-end: 1px solid var(--pg-scene-tree---border-color, #e5e5e5);
        max-height: var(--pg-scene-tree---max-height, 45%);
        overflow-y: auto;

        &__actions {
            display: flex;
            flex-wrap: wrap;
            align-items: center;
            gap: var(--pg-scene-tree---gap, 8px);
        }

        &__empty,
        &__hint {
            margin: 0;
            opacity: 0.7;
            font-size: 0.85em;
        }
    }
</style>

<style>
    :root {
        --pg-scene-tree---gap: 8px;
        --pg-scene-tree---padding: 16px;
        --pg-scene-tree---border-color: #e5e5e5;
        --pg-scene-tree---max-height: 45%;
    }
</style>
