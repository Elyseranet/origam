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

/**
 * Enveloppe parente MINIMALE dans laquelle monter un sous-composant qui ne
 * peut PAS se rendre seul — pas parce qu'il rend une boîte vide, mais parce
 * qu'il LÈVE au montage : il lit un contexte (`provide`/`inject`) que seul
 * son vrai parent du DS fournit (sélection d'un `<origam-tabs>`, colonnes et
 * sélection d'un `<origam-data-table>`, …).
 *
 * `ComponentLivePreview` monte alors `<{tag} v-bind="props"><template
 * #{slot}><previewed-component/></template></{tag}>` au lieu du rendu nu
 * habituel — le sous-composant previewé reste l'instance qu'on inspecte
 * (ses props/classes à lui restent celles qu'on démontre), l'enveloppe
 * n'existe que pour satisfaire l'injection qu'il exige.
 *
 * ⛔ Capacité, pas convention par composant : chaque sous-composant qui en a
 * besoin choisit SON tag parent, SES props minimales, et LE SLOT du parent
 * où l'injection ancestrale (provide/inject) reste résolue pour un enfant
 * placé là — un simple mauvais choix de slot peut faire échouer le rendu
 * sans lever d'erreur explicite (le composant parent peut filtrer son
 * propre contenu par défaut sur ce slot). Vérifié en navigateur réel pour
 * les deux pilotes (`tab` → `origam-tabs` slot `default`, `data-table-row`
 * → `origam-data-table` slot `body`) ; pas supposé pour les slugs futurs —
 * reproduire la même vérification avant de déclarer un nouveau couple
 * (tag, slot) correct.
 */
export interface IComponentPreviewParentEnvelope {
    /**
     * Tag kebab-case du composant parent réellement enregistré, ex.
     * `origam-tabs` pour `tab`, `origam-data-table` pour `data-table-row`.
     */
    tag: string
    /** Props statiques du parent — le minimum pour qu'il fournisse le contexte attendu (ex. `items`/`headers` pour un `<origam-data-table>`). */
    props?: Record<string, unknown>
    /**
     * Nom du slot NOMMÉ du parent dans lequel injecter le composant
     * previewé. Omis ⇒ le slot `default` du parent.
     */
    slot?: string
}

export interface IComponentPreviewAdapter {
    /** Props statiques fusionnées SOUS les props éditées par l'utilisateur. */
    previewProps?: Record<string, unknown>
    /** Contenu texte simple rendu dans le slot par défaut. */
    slotText?: string
    /** Enfants rendus dans le slot par défaut — prioritaires sur `slotText`. */
    slotChildren?: IComponentPreviewChild[]
    /**
     * Enveloppe parente minimale requise pour que CE composant (et non un
     * composant enfant dans son slot, à la différence de `slotChildren`)
     * puisse se monter sans lever. Voir `IComponentPreviewParentEnvelope`.
     */
    parentEnvelope?: IComponentPreviewParentEnvelope
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
