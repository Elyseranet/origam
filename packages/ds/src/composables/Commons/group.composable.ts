import type { ComponentInternalInstance, InjectionKey, UnwrapRef } from 'vue'
import { computed, onBeforeUnmount, onMounted, provide, reactive, toRef, unref } from 'vue'
import { useVModel } from './vModel.composable'
import type { IGroupItem, IGroupProps, IGroupProvide } from '../../interfaces/Commons/group.interface'
import { findChildrenWithProvide, wrapInArray } from '../../utils/Commons/commons.util'
import { consoleWarn } from '../../utils/Commons/console.util'
import { getCurrentInstance } from '../../utils/Commons/getCurrentInstance.util'
import { getItemIndex, getIds, getValues } from '../../utils/Commons/group.util'

/*********************************************************
 * useGroup
 *
 * @description
 * Root of a selectable group (tabs, chip-group, toggle-group…) —
 * tracks registered items and the v-model selection, provides
 * `injectKey` so `useGroupItem` consumers down the tree can register
 * and read/write back into it.
 * Independent from `useGroupItem` at the call level (no direct
 * function dependency) — the two only share the `injectKey`
 * provide/inject contract.
 ********************************************************/
export function useGroup (
    props: IGroupProps,
    injectKey: InjectionKey<IGroupProvide>
) {
    let isUnmounted = false
    const items = reactive<Array<IGroupItem>>([])
    const selected = useVModel(
        props,
        'modelValue',
        [],
        (v) => {
            if (v == null) return []

            return getIds(items, wrapInArray(v))
        },
        (v) => {
            const arr = getValues(items, v)

            return props.multiple ? arr : arr[0]
        }
    )

    const groupVm = getCurrentInstance('useGroup')

    const register = (item: IGroupItem, vm: ComponentInternalInstance) => {
        // Is there a better way to fix this typing?
        const unwrapped = item as unknown as UnwrapRef<IGroupItem>

        const key = Symbol.for(`${injectKey.description}:id`)
        const children = findChildrenWithProvide(key, groupVm?.vnode)
        const index = children.indexOf(vm)

        if (unref(unwrapped.value) == null) {
            unwrapped.value = index
        }

        if (index > -1) {
            items.splice(index, 0, unwrapped)
        } else {
            items.push(unwrapped)
        }
    }

    const unregister = (id: number) => {
        if (isUnmounted) return

        // TODO: re-evaluate this line's importance in the future
        // should we only modify the model if mandatory is set.
        // selected.value = selected.value.filter(v => v !== id)

        forceMandatoryValue()

        const index = items.findIndex(item => item.id === id)
        items.splice(index, 1)
    }

    // If mandatory and nothing is selected, then select first non-disabled item
    const forceMandatoryValue = () => {
        const item = items.find(item => !item.disabled)
        if (item && props.mandatory && !selected.value.length) {
            selected.value = [item.id]
        }
    }

    onMounted(() => {
        forceMandatoryValue()
    })

    onBeforeUnmount(() => {
        isUnmounted = true
    })

    const select = (id: number, value?: boolean) => {
        const item = items.find(item => item.id === id)
        if (value && item?.disabled) return

        if (props.multiple) {
            const internalValue = selected.value.slice()
            const index = internalValue.findIndex((v) => v === id)
            const isSelected = ~index
            const newValue = value !== undefined ? value : !isSelected

            // We can't remove value if group is
            // mandatory, value already exists,
            // and it is the only value
            if (
                isSelected &&
                props.mandatory &&
                internalValue.length <= 1
            ) return

            // We can't add value if it would
            // cause max limit to be exceeded
            if (
                !isSelected &&
                props.max != null &&
                internalValue.length + 1 > props.max
            ) return

            if (index < 0 && newValue) internalValue.push(id)
            else if (index >= 0 && !newValue) internalValue.splice(index, 1)

            selected.value = internalValue
        } else {
            const isSelected = selected.value.includes(id)
            if (props.mandatory && isSelected) return

            selected.value = (value !== undefined ? value : !isSelected) ? [id] : []
        }
    }

    /*********************************************************
     * step / next / prev
     *
     * @description
     * ⛔ RENVOIE L'ID RETENU (#786). Un appelant qui a besoin de
     * savoir ou la selection vient d'atterrir ne peut PAS relire
     * `selected.value` juste apres : quand le modele est CONTROLE
     * (le consommateur a pose un `v-model`), le getter de
     * `useVModel` renvoie `props[prop]` — donc encore l'ANCIEN id,
     * jusqu'au tour de rendu ou le parent a repercute l'emit.
     *
     * @description
     * Mesure jsdom avant correctif, `<OrigamTabs>` sous v-model,
     * 3 onglets, focus de depart sur l'onglet 0 :
     *
     *   ArrowRight  aria-selected -> 1   document.activeElement -> 0
     *   ArrowRight  aria-selected -> 2   document.activeElement -> 1
     *   ArrowLeft   aria-selected -> 1   document.activeElement -> 2
     *
     * Le focus suivait avec UN CRAN DE RETARD — il refocalisait
     * l'onglet qu'on venait de quitter. Sans `v-model` (modele non
     * controle) le getter passe par `internalValue()` et la relecture
     * est immediate : le defaut n'existait QUE en modele controle.
     * `Home` / `End` y echappaient deja parce que
     * `focusFirstNonDisabled` porte l'id au lieu de le relire.
     *
     * @description
     * `undefined` signifie « aucun deplacement » : groupe vide, ou
     * seul candidat desactive. L'appelant ne doit alors rien focaliser.
     ********************************************************/
    const step = (offset: number): number | undefined => {
        // getting an offset from selected value obviously won't work with multiple values
        if (props.multiple) consoleWarn('This method is not supported when using "multiple" prop')

        if (!selected.value.length) {
            const item = items.find(item => !item.disabled)

            if (!item) return undefined

            selected.value = [item.id]

            return item.id
        }

        const currentId = selected.value[0]
        const currentIndex = items.findIndex(i => i.id === currentId)

        let newIndex = (currentIndex + offset) % items.length
        let newItem = items[newIndex]

        while (newItem.disabled && newIndex !== currentIndex) {
            newIndex = (newIndex + offset) % items.length
            newItem = items[newIndex]
        }

        if (newItem.disabled) return undefined

        selected.value = [items[newIndex].id]

        return items[newIndex].id
    }

    const state: IGroupProvide = {
        register,
        unregister,
        selected,
        select,
        disabled: toRef(props, 'disabled'),
        prev: () => step(items.length - 1),
        next: () => step(1),
        isSelected: (id: number) => selected.value.includes(id),
        selectedClass: computed(() => props.selectedClass),
        items: computed(() => items),
        getItemIndex: (value: unknown) => getItemIndex(items, value)
    }

    provide(injectKey, state)

    return state
}
