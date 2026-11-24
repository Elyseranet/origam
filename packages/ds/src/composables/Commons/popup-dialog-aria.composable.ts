import { getUid } from '../../utils/Commons/getCurrentInstance.util'

import { computed } from 'vue'

import type { Ref } from 'vue'

/*********************************************************
 * usePopupDialogAria
 *
 * @description
 * ARIA d'un champ combobox dont le menu est un `dialog` (calendrier,
 * color picker), pas une liste de `menuitem` : le menu recoit `id` +
 * `role="dialog"` + `aria-label` (`menuAriaProps`), le combobox pointe
 * dessus par `aria-controls` (`comboboxAriaAttrs`). #1382 / #1458
 ********************************************************/
export function usePopupDialogAria (name: string, label: () => string | undefined, expanded: Ref<boolean>) {
    const menuId = `${name}-menu-${getUid()}`

    const comboboxAriaAttrs = computed(() => ({
        role: 'combobox',
        'aria-haspopup': 'dialog',
        'aria-controls': menuId,
        'aria-expanded': expanded.value ? 'true' : 'false'
    }))

    const menuAriaProps = computed(() => ({
        id: menuId,
        role: 'dialog',
        'aria-label': label()
    }))

    return { comboboxAriaAttrs, menuAriaProps }
}
