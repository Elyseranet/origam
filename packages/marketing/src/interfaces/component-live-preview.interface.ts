import type { IComponentDoc } from '~/interfaces/components-catalog.interface'

/**
 * Props de `<component-live-preview>` — l'aperçu live d'UN composant du DS,
 * partagé par la bande d'aperçu de l'en-tête et par le playground des fiches
 * composants (`/components/{slug}`).
 */
export interface IComponentLivePreviewProps {
    /** Slug du composant documenté, ex. `btn`. */
    slug: string
    /** Fiche complète — fournit le tag réel, les slots et le playground. */
    doc?: IComponentDoc | null
    /** Props éditées par l'utilisateur, fusionnées AU-DESSUS de l'adaptateur. */
    userProps?: Record<string, unknown>
    /** Contenu texte du slot, prioritaire sur celui de l'adaptateur. */
    slotContent?: string
    /** `aria-label` posé sur l'instance rendue. */
    instanceAriaLabel?: string
    /** Suffixe du `data-cy` de l'instance rendue. */
    dataCySuffix?: string
}
