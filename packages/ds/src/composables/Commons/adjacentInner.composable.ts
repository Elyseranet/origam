import { computed, useSlots } from 'vue'
import type { IAdjacentInnerProps } from '../../interfaces/Commons/adjacent.interface'
import { KEYBOARD_VALUES } from '../../enums/Commons/hotkey.enum'
import { hasEvent } from '../../utils/Commons/commons.util'
import { useAccessibleCommand } from './accessibleCommand.composable'
import { getCurrentInstance } from '../../utils/Commons/getCurrentInstance.util'

/*********************************************************
 * useAdjacentInner
 *
 * @description
 * Resolves the prependInner/appendInner/clear media + slot presence
 * and click emits for a component's INNER adjacent zone (e.g. a
 * text-field's clear button, sitting inside the input's border rather
 * than outside it). `useAdjacent` is the sibling hook for the OUTER
 * zone — independent, no shared state.
 *
 * @description
 * ⛔ issue #443 — same gap as `useAdjacent`: `click:prependInner` /
 * `click:appendInner` only ever fired from a literal DOM click inside
 * the zone, never from a keyboard activation of an ancestor. See the
 * long comment on `useAdjacent` for the full reasoning; mirrored here
 * for the inner zone. `isClearClickable` stays permanently true when
 * `hasClear` is — the clear zone only renders (`v-show="dirty"`) when
 * there is something to clear, so it is unconditionally actionable
 * whenever visible, unlike prependInner/appendInner whose
 * actionability depends on whether the consumer wired a listener.
 ********************************************************/
export function useAdjacentInner (props: IAdjacentInnerProps) {
    const vm = getCurrentInstance('OrigamAdjacentInner')

    const slots = useSlots()

    const hasPrependInnerMedia = computed(() => {
        return !!(props.prependInnerAvatar || props.prependInnerIcon)
    })
    const hasPrependInner = computed(() => {
        return slots.prependInner || hasPrependInnerMedia.value
    })
    const hasAppendInnerMedia = computed(() => {
        return !!(props.appendInnerAvatar || props.appendInnerIcon)
    })
    const hasAppendInner = computed(() => {
        return slots.appendInner || hasAppendInnerMedia.value
    })
    const hasClear = computed(() => {
        return props.clearable || slots.clear
    })

    const onClickPrependInner = (e: Event) => {
        vm.emit('click:prependInner', e)
    }
    const onClickAppendInner = (e: Event) => {
        vm.emit('click:appendInner', e)
    }
    const clickClear = (e: Event) => {
        vm.emit('click:clear', e)
    }

    /*********************************************************
     * isPrependInnerClickable / isAppendInnerClickable
     *
     * @description
     * See `useAdjacent.isPrependClickable` — same #397-shaped gap:
     * `defineEmits<IAdjacentInnerEmits>()` declares these, so `$attrs`
     * alone misses a listener the parent DID attach; `vm.vnode.props`
     * (raw, pre-split) still has it.
     ********************************************************/
    const isPrependInnerClickable = computed(() => {
        return hasEvent(vm.attrs, 'click:prependInner') || hasEvent(vm.vnode.props ?? {}, 'click:prependInner')
    })
    const isAppendInnerClickable = computed(() => {
        return hasEvent(vm.attrs, 'click:appendInner') || hasEvent(vm.vnode.props ?? {}, 'click:appendInner')
    })

    /*********************************************************
     * ownsKey — la zone ne confisque QUE ses propres touches
     *
     * @description
     * ⛔ #614. `Entree` / `Espace` REMONTENT depuis tout ce que le
     * consommateur rend dans le slot. Sans ce garde, la zone appelait
     * `preventDefault()` sur un evenement qui ne lui appartient pas et
     * tuait l'activation native d'un vrai `<button>` place dedans.
     *
     * @description
     * Mesure Chromium, `<OrigamInlineEdit show-actions>` — le bouton
     * Annuler est rendu dans `appendInner` — remontee du `keydown` de
     * l'Espace, ancetre par ancetre :
     *
     *   button.origam-btn                defaultPrevented = false
     *   div.origam-field__append-inner   defaultPrevented = TRUE   ← ici
     *   div.origam-field                 defaultPrevented = true
     *
     * Aucun `click` n'etait donc synthetise : Annuler etait focalisable
     * mais inactionnable a l'Espace.
     *
     * @description
     * ⛔ Et ce n'est pas un cas de bord rare : `OrigamTextField` lie
     * `@click:append-inner` a `<origam-field>` SANS CONDITION, donc
     * `isAppendInnerClickable` vaut `true` sur CHAQUE champ texte du
     * catalogue, que le consommateur ait cable quoi que ce soit ou non.
     * C'est aussi ce qui donnait a la zone `role="button"` + `tabindex`
     * partout avant #747 — d'ou le `nested-interactive` de #614, que
     * #747 a fait disparaitre en refusant un role qu'il ne peut nommer.
     * Le role est parti ; l'interception clavier, elle, etait restee.
     *
     * @description
     * `e.target === e.currentTarget` est le test exact : quand la zone
     * est elle-meme le controle focalise (role + tabindex emis par
     * `useAccessibleCommand`), c'est elle la cible. Des qu'un descendant
     * focalisable a le focus, la touche lui appartient.
     ********************************************************/
    const ownsKey = (e: KeyboardEvent) => e.target === e.currentTarget

    const onKeydownPrependInner = (e: KeyboardEvent) => {
        if (!isPrependInnerClickable.value) return
        if (!ownsKey(e)) return
        if (e.key !== KEYBOARD_VALUES.ENTER && e.key !== KEYBOARD_VALUES.EMPTY) return

        e.preventDefault()
        onClickPrependInner(e)
    }
    const onKeydownAppendInner = (e: KeyboardEvent) => {
        if (!isAppendInnerClickable.value) return
        if (!ownsKey(e)) return
        if (e.key !== KEYBOARD_VALUES.ENTER && e.key !== KEYBOARD_VALUES.EMPTY) return

        e.preventDefault()
        onClickAppendInner(e)
    }

    /*********************************************************
     * prependInnerCommandAttrs / appendInnerCommandAttrs
     *
     * @description
     * ⛔ #747 — mirror of `useAdjacent`'s pair for the INNER zone. `OrigamField`
     * bound `:role="isPrependInnerClickable ? 'button' : undefined"` by hand and
     * had no channel for a name, so every field family member (TextField,
     * NumberField, OtpInputField, DatePickerField…) shipped an anonymous ARIA
     * button the moment `click:prependInner` was wired.
     ********************************************************/
    const prependInnerCommandAttrs = useAccessibleCommand({
        component: vm.type?.__name ?? 'Origam',
        zone: 'prependInner',
        prop: 'prependInnerAriaLabel',
        active: isPrependInnerClickable,
        label: () => props.prependInnerAriaLabel
    })
    const appendInnerCommandAttrs = useAccessibleCommand({
        component: vm.type?.__name ?? 'Origam',
        zone: 'appendInner',
        prop: 'appendInnerAriaLabel',
        active: isAppendInnerClickable,
        label: () => props.appendInnerAriaLabel
    })

    return {
        prependInnerCommandAttrs,
        appendInnerCommandAttrs,
        hasPrependInnerMedia,
        hasPrependInner,
        hasAppendInnerMedia,
        hasAppendInner,
        hasClear,
        isPrependInnerClickable,
        isAppendInnerClickable,
        onClickPrependInner,
        onClickAppendInner,
        onKeydownPrependInner,
        onKeydownAppendInner,
        clickClear
    }
}
