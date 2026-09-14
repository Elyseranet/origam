import {
    COMPONENT_PREVIEW_ADAPTERS,
    COMPONENT_PREVIEW_FALLBACK_SLOT_TEXT
} from '~/consts/component-preview.const'

import type {
    IComponentPreviewAdapter,
    IComponentPreviewChild
} from '~/interfaces/component-preview.interface'
import type { IComponentDoc } from '~/interfaces/components-catalog.interface'

/**
 * component-preview.util.ts — résolution de l'aperçu live d'un composant.
 *
 * Toute la logique « que faut-il passer à `<component :is>` pour que ce
 * composant soit VISIBLE ? » vit ici, pas dans les templates.
 */

/** L'adaptateur curaté d'un slug, ou un objet vide. */
export const previewAdapterFor = (slug: string): IComponentPreviewAdapter =>
    COMPONENT_PREVIEW_ADAPTERS[slug] ?? {}

/**
 * Tag réellement enregistré du composant.
 *
 * ⚠️ `origam-${slug}` est FAUX pour 3 fiches (`media` → `origam-media-controller`,
 * `grids` → `origam-container`, `slide` → `origam-slide-group`) : Vue rend alors
 * un custom element inconnu, donc une boîte 0 × 0 silencieuse. La colonne `tag`
 * de la fiche fait foi.
 */
export const previewTagFor = (slug: string, doc?: IComponentDoc | null): string =>
    doc?.tag ?? `origam-${slug}`

/**
 * Props finales de l'instance : adaptateur d'abord, props éditées par-dessus.
 * Les valeurs vides (`''`) et `false` sont retirées pour laisser le défaut du
 * composant s'appliquer plutôt que d'écraser l'adaptateur avec du vide.
 */
export const previewPropsFor = (
    slug: string,
    userProps: Record<string, unknown> = {}
): Record<string, unknown> => {
    const meaningful = Object.fromEntries(
        Object.entries(userProps).filter(([, value]) => value !== '' && value !== false && value !== undefined)
    )
    return { ...(previewAdapterFor(slug).previewProps ?? {}), ...meaningful }
}

/** Enfants à rendre dans le slot par défaut (conteneurs abstraits). */
export const previewChildrenFor = (slug: string): IComponentPreviewChild[] =>
    previewAdapterFor(slug).slotChildren ?? []

/** True quand la fiche déclare un slot par défaut. */
export const hasDefaultSlot = (doc?: IComponentDoc | null): boolean =>
    (doc?.slots ?? []).some(slot => slot.slot === 'default')

/**
 * Texte du slot par défaut, par ordre de priorité :
 *   1. override explicite (une variante d'aperçu de la fiche) ;
 *   2. rien — le conteneur reçoit des ENFANTS, pas du texte ;
 *   3. `playground.defaultSlotContent` de la fiche — la donnée la plus
 *      spécifique au composant, elle prime sur le filet générique ;
 *   4. `slotText` de l'adaptateur curaté ;
 *   5. texte générique, SI le composant déclare un slot par défaut.
 *
 * Le dernier palier est ce qui empêche un conteneur de rendre une boîte 0 × 0 :
 * 121 des 188 playgrounds de la base n'ont AUCUN `defaultSlotContent` (mesuré).
 */
export const previewSlotTextFor = (
    slug: string,
    doc?: IComponentDoc | null,
    override?: string
): string => {
    if (override) return override
    const adapter = previewAdapterFor(slug)
    if (adapter.slotChildren?.length) return ''
    const fromDoc = doc?.playground?.defaultSlotContent
    if (fromDoc) return fromDoc
    if (adapter.slotText) return adapter.slotText
    return hasDefaultSlot(doc) ? COMPONENT_PREVIEW_FALLBACK_SLOT_TEXT : ''
}

/**
 * Raison curatée pour laquelle ce composant ne peut PAS se rendre isolément,
 * ou `null` s'il le peut. Non-null ⇒ on n'essaie même pas de monter l'instance.
 */
export const previewUnavailableReasonFor = (
    slug: string
): { key: string, fallback: string } | null => {
    const adapter = previewAdapterFor(slug)
    if (!adapter.unavailableReasonKey || !adapter.unavailableReasonFallback) return null
    return { key: adapter.unavailableReasonKey, fallback: adapter.unavailableReasonFallback }
}
