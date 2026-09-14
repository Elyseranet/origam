/**
 * component-preview.interface.ts — contrat de l'adaptateur d'aperçu live.
 *
 * Un composant du DS ne se rend pas toujours visiblement à partir de ses seules
 * props par défaut : un conteneur abstrait (`origam-item-group`, `origam-list`,
 * `origam-btn-group`) rend une boîte 0 × 0 tant qu'on ne lui donne pas
 * d'enfants, et un composant piloté par des données (`origam-chart`,
 * `origam-data-table`) LÈVE une erreur tant qu'on ne lui passe pas son jeu de
 * données obligatoire.
 *
 * L'adaptateur décrit, par slug, le minimum nécessaire pour obtenir un rendu
 * honnête — ou, quand le composant ne peut structurellement pas se rendre seul
 * (sous-partie qui exige un parent, overlay téléporté), la RAISON à afficher
 * plutôt qu'un repli muet.
 *
 * Consommé par le Theme Builder (`ThemeBuilderPreview`) ET par l'aperçu des
 * fiches composants (`ComponentLivePreview`) — une seule source de vérité.
 */

/**
 * Un enfant à rendre dans le slot par défaut du composant aperçu.
 * `tag` est le tag kebab-case d'un composant Origam réellement enregistré.
 */
export interface IComponentPreviewChild {
    /** Tag du composant enfant, ex. `origam-btn`. */
    tag: string
    /** Props passées à l'enfant. */
    props?: Record<string, unknown>
    /** Contenu texte du slot par défaut de l'enfant. */
    text?: string
    /** Petits-enfants, pour les conteneurs à deux niveaux (list → list-item). */
    children?: IComponentPreviewChild[]
}

export interface IComponentPreviewAdapter {
    /** Props statiques fusionnées SOUS les props éditées par l'utilisateur. */
    previewProps?: Record<string, unknown>
    /** Contenu texte simple rendu dans le slot par défaut. */
    slotText?: string
    /** Enfants rendus dans le slot par défaut — prioritaires sur `slotText`. */
    slotChildren?: IComponentPreviewChild[]
    /**
     * Quand le composant ne peut PAS se rendre isolément : clé i18n de la
     * raison affichée à la place du repli muet. Rend l'aperçu honnête.
     */
    unavailableReasonKey?: string
    /** Fallback anglais de `unavailableReasonKey`. */
    unavailableReasonFallback?: string
    /** Recette nommée historique du Theme Builder (non consommée à ce jour). */
    demo?: 'tabs' | 'select' | 'badge' | 'card' | 'avatar'
}
