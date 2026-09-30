/*********************************************************
 * TVariantPresets
 *
 * @description
 * ADR-005 (D1) — un `variant` EST une preconfiguration de props nommee,
 * pas une couche CSS : `Record<valeur du variant, Partial<props>>`.
 *
 * @description
 * C'est le type d'AUTORAT, celui qu'une table
 * `consts/{Composant}/{composant}-variant.const.ts` annote pour que le
 * compilateur refuse une valeur de variant inconnue ou un nom de prop que
 * le composant ne declare pas :
 *
 *     export const KBD_VARIANT_PRESETS: TVariantPresets<TKbdVariant, IKbdProps> = {
 *         outlined: { bgColor: '...', border: 1 },
 *         filled:   { bgColor: '...' },
 *         tonal:    { bgColor: '...', border: 0 }
 *     }
 *
 * @description
 * ⛔ AUCUN SCSS N'ACCOMPAGNE UNE TABLE DE PRESETS. La classe
 * `{nom}--variant-{valeur}` que `useVariant()` emet continue d'exister,
 * mais le DS ne lui attache plus aucune regle : elle appartient au
 * CONSOMMATEUR, comme crochet d'override. Le garde `no-variant-css` tient
 * cette moitie du contrat.
 *
 * @description
 * ⛔ LES VALEURS NE SE RE-EXPRIMENT PAS EN ECHELON SEMANTIQUE. Mesure
 * (2026-09-30) : les 8 themes de marque
 * (`packages/marketing/src/themes/*.theme.ts`) habillent leurs boutons A
 * TRAVERS les tokens de composant que la regle de variant lisait —
 * `cartoon` pose `--origam-btn---box-shadow-elevated: 4px 4px 0 #171717`,
 * `glass` une ombre de verre a quatre couches. Un preset ecrit
 * `elevation: 'md'` emet `var(--origam-shadow---md)` et jette donc
 * silencieusement l'ombre de la marque sur les 8 identites x 2 modes.
 * @description
 * Un preset porte la MEME chaine `var(--origam-{cmp}---{...}, <repli>)`
 * que portait la regle, jamais sa traduction en echelon : le canal
 * d'override des themes survit, et le rendu est identique par
 * construction. `TElevation` documente le `box-shadow` libre (dont
 * `var()`, multi-couches, `inset`) rendu verbatim, et `isCssColor`
 * accepte `var(--…)` comme `color-mix(…)` en les routant vers le canal
 * de style « valeur custom ».
 ********************************************************/
export type TVariantPresets<V extends string, P> = Record<V, Partial<P>>

/*********************************************************
 * TVariantPresetTable
 *
 * @description
 * La meme table, vue par le RESOLVEUR : valeur du variant -> sac de props.
 *
 * @description
 * Type efface a dessein. Le resolveur est generique sur les 217
 * composants et ne peut etre parametre par aucun `IXxxProps` en
 * particulier ; c'est la table d'autorat qui porte le typage fort, au
 * point d'ecriture, ou il sert reellement a quelque chose.
 ********************************************************/
export type TVariantPresetTable = Record<string, Record<string, unknown>>

/*********************************************************
 * TVariantPresetRegistry
 *
 * @description
 * Nom kebab du composant (`'origam-btn'`) -> sa table de presets.
 *
 * @description
 * Meme forme que ce qu'un theme peut declarer sous `IOrigamTheme.variants`
 * (ADR-005 D4). C'est une exigence, pas une coincidence : la directive
 * d'implementation de l'ADR veut qu'un preset soit « une config par defaut
 * comme avec le theme, la meme logique ». Si les deux formes divergeaient,
 * la fusion du lot 1 et les variants definis par le consommateur
 * demanderaient deux chemins de resolution au lieu d'un.
 ********************************************************/
export type TVariantPresetRegistry = Record<string, TVariantPresetTable>
