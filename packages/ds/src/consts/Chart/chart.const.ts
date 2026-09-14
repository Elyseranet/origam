import { INTENT } from '../../enums/Commons/intent.enum'

import type { TIntent } from '../../types/Commons/intent.type'

/**
 * How many Y-axis ticks `<OrigamChart>` draws by default. The
 * composable snaps the data range to a "nice" multiple of this —
 * five rows fits most narrow chart heights without crowding.
 */
export const CHART_Y_TICK_COUNT = 5

/**
 * Static default of the `animationDuration` prop, mirrored verbatim in
 * every `OrigamChart*.vue`'s `withDefaults()` call (which MUST inline the
 * literal — see the repo's `withDefaults()` rule, imported consts are not
 * statically resolvable there). Kept here as the single comparison point
 * `useChartAnimationStyle` uses to tell "resolves to the untouched default"
 * apart from "a theme or the consumer changed it" — see that composable's
 * doc for why the distinction matters (#505).
 */
export const CHART_ANIMATION_DURATION_DEFAULT = 600

/**
 * Default buttons shown in the range-selector toolbar when the consumer
 * enables `rangeSelector.enabled` without providing a custom `buttons`
 * array. Labels match common time-series conventions; counts are supplied
 * as documentation — the component resolves the actual window size at
 * runtime from `dataLength`.
 */
export const CHART_RANGE_SELECTOR_DEFAULT_BUTTONS = [
    { label: '1w', count: 7 },
    { label: '1m', count: 30 },
    { label: '3m', count: 90 },
    { label: '6m', count: 180 },
    { label: '1y', count: 365 },
    { label: 'all', fraction: 1 }
] as const

/*********************************************************
 * CHART_DEFAULT_PALETTE — couleurs de série par défaut
 *
 * @description
 * Palette parcourue en boucle par `useChart` quand une série ne fixe pas
 * son propre `color` et que le consommateur ne passe pas de `colorScheme`.
 * Reprend les huit membres de `INTENT` ; la résolution vers du CSS a lieu
 * dans `resolveColor`, à l'intérieur de `chart.composable.ts`.
 ********************************************************/
export const CHART_DEFAULT_PALETTE: Array<TIntent> = [
    INTENT.PRIMARY,
    INTENT.SUCCESS,
    INTENT.WARNING,
    INTENT.DANGER,
    INTENT.INFO,
    INTENT.SECONDARY,
    INTENT.GHOST,
    INTENT.NEUTRAL
]

/*********************************************************
 * CHART_COLOR_FALLBACK — couleur de dernier recours
 *
 * @description
 * Utilisée dès qu'une couleur de graphique ne se résout pas : valeur vide,
 * ou chaîne qui n'est ni une couleur CSS brute ni un nom d'`INTENT` connu.
 * Hérite de la couleur de texte environnante, donc la forme reste visible
 * sur les deux thèmes.
 ********************************************************/
export const CHART_COLOR_FALLBACK = 'currentColor'

/*********************************************************
 * CHART_EPSILON — plancher des diviseurs
 *
 * @description
 * Appliqué à toute amplitude avant de s'en servir comme diviseur. Les
 * amplitudes viennent des données et s'effondrent légitimement à `0`
 * (série à un seul point, valeurs toutes égales) ; diviser par cette
 * valeur donne un ratio énorme mais FINI, que les bornages alentour
 * absorbent, là où `0` propagerait `Infinity` / `NaN` dans les attributs
 * SVG.
 ********************************************************/
export const CHART_EPSILON = 1e-9

/*********************************************************
 * CHART_DASH_ARRAY_* — motifs de tirets SVG
 *
 * @description
 * Valeurs de `stroke-dasharray` derrière `IChartPlotLine['dash']`. SVG
 * attend un couple longueur de tiret / longueur d'espace ; `'none'` est le
 * mot-clé du trait continu.
 ********************************************************/
export const CHART_DASH_ARRAY_SOLID = 'none'
export const CHART_DASH_ARRAY_DASHED = '6 4'
export const CHART_DASH_ARRAY_DOTTED = '2 4'

/*********************************************************
 * CHART_PLOT_BAND_DEFAULT_OPACITY — opacité de bande
 *
 * @description
 * Opacité de remplissage appliquée à une bande qui ne fixe pas la sienne.
 * Assez basse pour que les séries dessinées par-dessus restent lisibles.
 ********************************************************/
export const CHART_PLOT_BAND_DEFAULT_OPACITY = 0.15

/*********************************************************
 * CHART_PLOT_LINE_* — ligne de seuil et son étiquette
 *
 * @description
 * `DEFAULT_WIDTH` est l'épaisseur d'une ligne de seuil qui ne fixe pas la
 * sienne.
 * @description
 * `LABEL_OFFSET` est l'écart, en unités SVG, entre la ligne et son
 * étiquette — au-dessus d'une ligne horizontale, à droite d'une verticale.
 * @description
 * `LABEL_TOP_OFFSET` est la distance entre le haut du plot et la ligne de
 * base de l'étiquette d'une ligne verticale, pour que le texte dégage le
 * bord du plot.
 ********************************************************/
export const CHART_PLOT_LINE_DEFAULT_WIDTH = 1.5
export const CHART_PLOT_LINE_LABEL_OFFSET = 4
export const CHART_PLOT_LINE_LABEL_TOP_OFFSET = 12

/*********************************************************
 * CHART_ANNOTATION_DEFAULT_* — valeurs par défaut d'annotation
 *
 * @description
 * `WIDTH` est l'épaisseur de trait d'une annotation qui ne fixe pas la
 * sienne. `DY` est le décalage vertical du texte par rapport à son point
 * d'ancrage — négatif, l'étiquette se place donc au-dessus du point par
 * défaut. `RADIUS` est le rayon d'une annotation `'circle'` sans rayon
 * explicite.
 ********************************************************/
export const CHART_ANNOTATION_DEFAULT_WIDTH = 1.5
export const CHART_ANNOTATION_DEFAULT_DY = -14
export const CHART_ANNOTATION_DEFAULT_RADIUS = 12

/*********************************************************
 * CHART_ANNOTATION_ARROWHEAD_* — pointe de flèche
 *
 * @description
 * Dimensionnement de la pointe de l'annotation `'arrow'` : le triangle
 * grandit avec l'épaisseur du trait (`WIDTH_FACTOR`) mais ne descend jamais
 * sous `MIN_SIZE`, et ses deux barbes s'ouvrent à `± SPREAD` radians de
 * part et d'autre de la hampe.
 * @description
 * `PRECISION` est le nombre de décimales conservées à la sérialisation du
 * polygone dans son attribut `points` — assez pour le sous-pixel, sans
 * gonfler le DOM.
 ********************************************************/
export const CHART_ANNOTATION_ARROWHEAD_MIN_SIZE = 6
export const CHART_ANNOTATION_ARROWHEAD_WIDTH_FACTOR = 4
export const CHART_ANNOTATION_ARROWHEAD_SPREAD = Math.PI / 5
export const CHART_ANNOTATION_ARROWHEAD_PRECISION = 2

/*********************************************************
 * CHART_ANNOTATION_LABEL_* — bulle de l'annotation `'label'`
 *
 * @description
 * La largeur est estimée depuis la longueur du texte — SVG n'offre ici
 * aucune API de mesure synchrone — via une chasse moyenne
 * (`CHAR_WIDTH`) plus un `PADDING` horizontal de chaque côté, plancher à
 * `MIN_WIDTH` pour que les libellés courts restent lisibles. `HEIGHT` est
 * fixe.
 ********************************************************/
export const CHART_ANNOTATION_LABEL_CHAR_WIDTH = 7
export const CHART_ANNOTATION_LABEL_PADDING = 8
export const CHART_ANNOTATION_LABEL_MIN_WIDTH = 48
export const CHART_ANNOTATION_LABEL_HEIGHT = 24

/*********************************************************
 * CHART_PERCENT_* — axe d'un empilement `'percent'`
 *
 * @description
 * Plage Y canonique d'un graphique empilé en pourcentage. L'axe est cloué
 * à `0 → 100` quelles que soient les données, et les surcharges `yMin` /
 * `yMax` sont délibérément ignorées pour que l'échelle reste comparable
 * d'un graphique à l'autre.
 * @description
 * `TICK_STEP` est l'incrément de graduation sur cet axe fixe : cinq
 * lignes de grille.
 ********************************************************/
export const CHART_PERCENT_MIN = 0
export const CHART_PERCENT_MAX = 100
export const CHART_PERCENT_TICK_STEP = 25

/*********************************************************
 * CHART_TICK_LABEL_PRECISION_FACTOR — arrondi des libellés
 *
 * @description
 * Arrondi appliqué aux libellés de graduation numériques :
 * `Math.round(v * F) / F` rogne le bruit flottant laissé par
 * l'accumulation de `niceStep`, en gardant trois décimales.
 ********************************************************/
export const CHART_TICK_LABEL_PRECISION_FACTOR = 1000

/*********************************************************
 * CHART_NICE_STEP_LADDER — échelle d'arrondi des graduations
 *
 * @description
 * Échelle d'incréments de l'arrondi « nice » façon D3 : le ratio brut
 * amplitude / nombre de graduations est normalisé dans `[1, 10)`, puis
 * remonté au premier barreau dont il franchit la borne `below`. Le dernier
 * barreau n'a pas de borne supérieure.
 ********************************************************/
export const CHART_NICE_STEP_LADDER = [
    { below: 1.5, step: 1 },
    { below: 3, step: 2 },
    { below: 7, step: 5 },
    { below: Number.POSITIVE_INFINITY, step: 10 }
] as const

/*********************************************************
 * CHART_BAR_SLOT_FILL_RATIO — remplissage d'un créneau
 *
 * @description
 * Fraction d'un créneau catégoriel réellement occupée par sa ou ses
 * barres. Le reste devient la gouttière entre créneaux voisins ; en mode
 * groupé (non empilé), cette largeur est ensuite partagée entre les séries
 * visibles.
 ********************************************************/
export const CHART_BAR_SLOT_FILL_RATIO = 0.7

/*********************************************************
 * CHART_POINT_MARKER_RADIUS / CHART_RADAR_MARKER_RADIUS
 *
 * @description
 * Rayon des marqueurs de point dessinés sur les séries line / area /
 * spline, et rayon — plus petit — de ceux posés sur chaque axe d'un radar.
 ********************************************************/
export const CHART_POINT_MARKER_RADIUS = 4
export const CHART_RADAR_MARKER_RADIUS = 3.5

/*********************************************************
 * CHART_PIE_* / CHART_RADAR_* — rayon des familles circulaires
 *
 * @description
 * Rayon extérieur d'un camembert / donut : la moitié du plus petit côté du
 * plot, retirée d'un `INSET` pour que l'anneau ne touche jamais le cadre,
 * et plancher à `MIN_RADIUS` pour qu'un plot minuscule affiche encore un
 * disque visible.
 * @description
 * Le radar suit la même règle avec un `INSET` plus large, qui laisse la
 * place aux libellés d'axes.
 ********************************************************/
export const CHART_PIE_MIN_RADIUS = 10
export const CHART_PIE_RADIUS_INSET = 4
export const CHART_RADAR_MIN_RADIUS = 10
export const CHART_RADAR_RADIUS_INSET = 8

/*********************************************************
 * CHART_SCATTER_*_RADIUS — taille des points de nuage
 *
 * @description
 * Les points sans valeur `z` gardent le rayon fixe `DEFAULT`. Dès qu'un
 * point du graphique porte un `z`, les rayons sont mis à l'échelle
 * linéairement depuis la plage Z globale vers `[MIN..MAX]`.
 ********************************************************/
export const CHART_SCATTER_DEFAULT_RADIUS = 5
export const CHART_SCATTER_MIN_RADIUS = 5
export const CHART_SCATTER_MAX_RADIUS = 36

/*********************************************************
 * CHART_SLICE_LABEL_PREFIX — libellé de secours d'une part
 *
 * @description
 * Préfixe du libellé synthétique donné à une part de camembert / donut qui
 * n'a ni entrée correspondante dans `categories`, ni donnée en forme
 * d'objet porteuse d'un libellé `x`. Suffixé par l'index de la part, en
 * base 1.
 ********************************************************/
export const CHART_SLICE_LABEL_PREFIX = 'Slice'
