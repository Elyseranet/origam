import type { ICardProps } from '../Card/card.interface'
import type { IClickOutsideEmits } from '../Commons/clickOutside.interface'
import type {
    ICommonsComponentEmits,
    ICommonsComponentProps
} from '../Commons/commons.interface'
import type { IOverlayProps } from '../Overlay/overlay.interface'
import type { IStatusProps } from '../Commons/status.interface'
import type { TSize } from '../../types/Commons/size.type'

export interface IDialogProps extends ICommonsComponentProps, IOverlayProps, ICardProps, IStatusProps {
    fullscreen?: boolean
    retainFocus?: boolean
    /*********************************************************
     * ⛔ `scrollable` a été RETIRÉ (#419) — ne pas le réintroduire.
     *
     * @description
     * La prop émettait une classe `origam-dialog--scrollable` qu'aucune règle
     * SCSS du dépôt ne ciblait, et la mise en page qu'elle prétendait activer
     * est déjà appliquée SANS condition (`.origam-card{overflow:hidden}` +
     * `.origam-card__content{overflow:auto}`). Elle était donc redondante, pas
     * seulement inerte : la passer, ou non, produisait exactement le même
     * rendu. Mesuré en navigateur réel, les deux relevés étant identiques
     * caractère pour caractère :
     *
     *     visible|visible|calc(100% - 48px)|430px|block|row
     *  // hidden|hidden|100%|430px|flex|column
     *  // auto|auto|100%|330px|flex|column
     *
     * @description
     * Le retrait ne change aucun rendu : la classe n'était lue par personne.
     *
     * @description
     * ⛔ Le défaut qu'un tel réglage aurait pu adresser est un sujet DISJOINT,
     * suivi par le ticket #563, et il n'a PAS été réglé ici : tout ce qui
     * déborde HORS de `.origam-card__content` — au premier chef le slot
     * `#asset`, rendu comme frère de ce bloc — devient inatteignable. Mesuré :
     * aucun ancêtre du contenu débordant n'est défilable, le document non plus
     * (`scrollStrategy: 'block'`), et 1219 px se retrouvent sous le bas du
     * viewport sans aucun moyen d'y accéder. La carte n'est pas tronquée à sa
     * propre frontière — elle GRANDIT ; c'est `.origam-overlay__content`
     * (`overflow: visible`) qui la laisse déborder hors écran.
     ********************************************************/
    size?: TSize
    /*********************************************************
     * closeLabel
     *
     * @description
     * Accessible name for the header's close button (aria-label). Carries
     * a locale key, not final text — it is resolved through the DS `t()`
     * mechanism, so it follows the active locale out of the box. Defaults
     * to `'origam.close'`, the same key `OrigamAlert` and `OrigamChip`
     * already use for their own close/dismiss control (#477).
     * @description
     * A raw string that matches no key is returned unchanged, so
     * `closeLabel="Dismiss this dialog"` still works for consumers who
     * prefer to translate on their side.
     ********************************************************/
    closeLabel?: string
}

/** Emits fired by `<OrigamDialog>` — v-model on the open state, outside
 *  click bubbling, and the `isRead` lifecycle hook that fires the first
 *  time the dialog body becomes visible (used for the "mark as read"
 *  pattern on terms-of-service / consent dialogs). */
export interface IDialogEmits extends ICommonsComponentEmits, IClickOutsideEmits {
    (e: 'isRead', value: boolean): void
}

/** Slot signatures for `<OrigamDialog>` — the inner `<OrigamOverlay>`'s
 *  `default` scope, plus the `<OrigamCard>` chrome slots re-exposed
 *  under Dialog's own (hyphenated) slot names. `activator` only
 *  forwards the merged `props` bag, not the overlay's `isActive` —
 *  matches the template's `v-bind="{props}"` (destructured from
 *  `#activator="{props}"`). */
export interface IDialogSlots {
    activator?: (data: { props: Record<string, unknown> }) => any
    default?: (data: { isActive: boolean }) => any
    loader?: () => any
    header?: () => any
    'header-append'?: () => any
    'header-prepend'?: () => any
    'header-title'?: (data: { titleId: string }) => any
    'header-subtitle'?: () => any
    'header-content'?: () => any
    asset?: () => any
    text?: () => any
    content?: () => any
    footer?: () => any
}
