/**
 * Types du rail de navigation du catalogue (#1032).
 *
 * `TReferenceKind` n'est PAS redéclaré ici : il vit déjà dans
 * `api-reference.type.ts` et couvre exactement les 8 familles du catalogue.
 */

/**
 * Quel volet le panneau affiche. `null` = panneau fermé.
 *
 * - `family` — une des 8 familles du catalogue (laquelle est portée par
 *   l'état `openKind` du composable, pas par ce type).
 * - `pages`  — les pages éditoriales, les index de famille et les sites annexes.
 */
export type TNavRailPanel = 'family' | 'pages' | null

/**
 * Palier d'affichage du rail. Dérivé de `useDisplay()`, dont les seuils
 * mesurés sont `xs:0 sm:600 md:960 lg:1280`
 * (`ds/src/consts/Commons/display.const.ts`).
 *
 * - `rail`   — ≥ 960 px : rail vertical + panneau ancré, non modal.
 * - `drawer` — 600–959 px : rail vertical + tiroir droit pleine hauteur, modal.
 * - `sheet`  — < 600 px : cible unique en bas à droite + feuille basse, modal.
 *
 * ⛔ Ne pas utiliser `useDisplay().mobile` pour ça : son `mobileBreakpoint`
 * par défaut est `'lg'` (1280 px), donc il serait vrai jusqu'à 1279 px.
 */
export type TNavRailTier = 'rail' | 'drawer' | 'sheet'

/** Forme du panneau d'une famille, décidée par la mesure et non à la main. */
export type TNavRailPanelShape = 'grouped' | 'flat' | 'search'

/** État de chargement du catalogue d'une famille. */
export type TNavRailStatus = 'idle' | 'loading' | 'ready' | 'error'
