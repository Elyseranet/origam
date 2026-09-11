import { h } from 'vue'
import { OrigamClassIcon } from '../../components'

import { MDI_ICONS } from '../../enums'

import type { IIconAliases, IIconSet } from '../../interfaces'

export const MDI: IIconSet = {
    // The MDI font CSS exposes each glyph as `.mdi-<name>` (e.g. `.mdi-magnify`).
    // Consumers may pass either the bare name (`magnify`) — as is the case when
    // an `mdi:` prefix has been stripped by the icon resolver — or the already-
    // prefixed form (`mdi-magnify`, as found in MDI_ALIASES below). We
    // normalise to always emit the `mdi-` class so the font renders.
    component: (props: any) => h(OrigamClassIcon, {
        ...props,
        icon: typeof props.icon === 'string' && !props.icon.startsWith('mdi-')
            ? `mdi-${props.icon}`
            : props.icon,
        class: 'mdi'
    })
}

export const MDI_ALIASES: IIconAliases = {
    ...MDI_ICONS,
    collapse: 'mdi-chevron-up',
    complete: 'mdi-check',
    cancel: 'mdi-close-circle',
    close: 'mdi-close',
    delete: 'mdi-close-circle',
    clear: 'mdi-close-circle',
    success: 'mdi-check-circle',
    info: 'mdi-information',
    warning: 'mdi-alert-circle',
    error: 'mdi-close-circle',
    prev: 'mdi-chevron-left',
    next: 'mdi-chevron-right',
    checkboxOn: 'mdi-checkbox-marked',
    checkboxOff: 'mdi-checkbox-blank-outline',
    checkboxIndeterminate: 'mdi-minus-box',
    delimiter: 'mdi-circle',
    sortAsc: 'mdi-arrow-up',
    sortDesc: 'mdi-arrow-down',
    expand: 'mdi-chevron-down',
    menu: 'mdi-menu',
    subgroup: 'mdi-menu-down',
    dropdown: 'mdi-menu-down',
    radioOn: 'mdi-radiobox-marked',
    radioOff: 'mdi-radiobox-blank',
    edit: 'mdi-pencil',
    ratingEmpty: 'mdi-star-outline',
    ratingFull: 'mdi-star',
    ratingHalf: 'mdi-star-half-full',
    loading: 'mdi-cached',
    first: 'mdi-page-first',
    last: 'mdi-page-last',
    unfold: 'mdi-unfold-more-horizontal',
    file: 'mdi-paperclip',
    plus: 'mdi-plus',
    minus: 'mdi-minus',
    calendar: 'mdi-calendar',
    eyeDropper: 'mdi-eyedropper',
    eyeOff: 'mdi-eye-off-outline',
    eyeOn: 'mdi-eye-outline'
}
