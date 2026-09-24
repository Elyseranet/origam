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
    /**
     * Valeurs de contrôle auxquelles l'utilisateur n'a PAS touché, fusionnées
     * SOUS l'adaptateur.
     *
     * ⛔ Ce sont les défauts extraits du DS, pas un choix : les mélanger à
     * `userProps` obligeait à filtrer `''` et `false` avant la fusion, et donc
     * à rendre toute prop booléenne impossible à décocher (#739).
     */
    uneditedProps?: Record<string, unknown>
    /** Contenu texte du slot, prioritaire sur celui de l'adaptateur. */
    slotContent?: string
    /** `aria-label` posé sur l'instance rendue. */
    instanceAriaLabel?: string
    /** Suffixe du `data-cy` de l'instance rendue. */
    dataCySuffix?: string
    /**
     * Autoriser le court-circuit « ce composant ne peut pas se rendre seul ».
     *
     * ⛔ La bande d'aperçu de l'en-tête passe `false` : ses variantes sont des
     * données CURATÉES qui, elles, se rendent (mesuré : `audio`, `snackbar-item`
     * et `switch-track` rendaient 3, 4 et 6 variantes avant qu'une raison
     * générique ne les remplace toutes). Une raison ne doit jamais écraser une
     * variante qui marche.
     */
    curatedReason?: boolean
}
