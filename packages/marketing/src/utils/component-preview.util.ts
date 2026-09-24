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
 * ⚠️ NE PAS revenir à `origam-${slug}` en dur. Les 3 fiches dont le `tag`
 * divergeait du slug (`media` → `origam-media-controller`, `grids` →
 * `origam-container`, `slide` → `origam-slide-group`) ont été retirées du
 * catalogue depuis (PR #725, plus aucune divergence en base à ce jour) — mais
 * quand la divergence existe, Vue rend un custom element inconnu, donc une
 * boîte 0 × 0 parfaitement silencieuse. La colonne `tag` de la fiche fait foi.
 */
export const previewTagFor = (slug: string, doc?: IComponentDoc | null): string =>
    doc?.tag ?? `origam-${slug}`

/**
 * Props finales de l'instance — TROIS autorités, de la plus faible à la plus
 * forte :
 *
 *   1. `uneditedProps` — les valeurs de contrôle auxquelles l'utilisateur n'a
 *      PAS touché. Elles sont extraites du DS par `generate-playgrounds.mjs` :
 *      elles disent « voilà ce que le composant ferait tout seul », pas
 *      « voilà ce que l'utilisateur veut ».
 *   2. `previewProps` de l'adaptateur curaté — ce qui rend la démo VISIBLE
 *      (l'icône d'un avatar, les items d'un breadcrumb, la série d'un chart).
 *   3. `userProps` — ce que l'utilisateur a réellement édité, ou les props
 *      curatées d'une variante d'aperçu. Elles gagnent toujours, `false` et
 *      `''` compris.
 *
 * ⛔ NE PAS réintroduire le filtre `value !== '' && value !== false` qui vivait
 * ici. Il jetait `false` AVANT la fusion, donc décocher une prop booléenne
 * n'atteignait jamais le composant : mesuré dans un vrai navigateur sur les
 * 218 fiches, **0 des 304 contrôles booléens** parvenait à livrer `false`
 * (301 laissaient simplement la prop absente). Ce filtre était un pansement sur
 * la confusion entre les autorités 1 et 3 ; les distinguer le rend inutile.
 *
 * Seule la chaîne vide NON éditée reste écartée : elle ne dit rien de plus que
 * l'absence de la prop, et l'écrire écraserait l'adaptateur (mesuré : 6 couples
 * concernés, dont `text-field.label` et `ligature-icon.icon`).
 */
export const previewPropsFor = (
    slug: string,
    userProps: Record<string, unknown> = {},
    uneditedProps: Record<string, unknown> = {}
): Record<string, unknown> => {
    const weak = Object.fromEntries(
        Object.entries(uneditedProps).filter(([, value]) => value !== '' && value !== undefined)
    )
    const edited = Object.fromEntries(
        Object.entries(userProps).filter(([, value]) => value !== undefined)
    )
    return { ...weak, ...(previewAdapterFor(slug).previewProps ?? {}), ...edited }
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
 *   5. rien — l'adaptateur rend DÉJÀ le composant visible par ses props ;
 *   6. texte générique, SI le composant déclare un slot par défaut.
 *
 * Le dernier palier est ce qui empêche un conteneur de rendre une boîte 0 × 0 :
 * 77 des 218 fiches déclarent un slot `default` sans aucun `defaultSlotContent`
 * (mesuré sur la fixture).
 *
 * ⛔ Le palier 5 est la correction du défaut 1 de #739. Le repli générique
 * n'existe QUE pour éviter une boîte vide ; quand l'adaptateur fournit déjà de
 * quoi rendre le composant (icône, items, libellé, `modelValue`…), le texte ne
 * comble plus un vide — il ÉCRASE le rendu, parce que le slot par défaut
 * REMPLACE le visuel porté par ces props. Mesuré dans un vrai navigateur :
 * `avatar` recevait bien `icon="mdi-account"` et n'affichait que « Content ».
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
    if (adapter.previewProps) return ''
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
