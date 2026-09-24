/*********************************************************
 * CHART_ZOOM_MIN_VISIBLE_CATEGORIES
 *
 * @description
 * Minimum number of categories that must remain visible after a zoom
 * operation. Prevents the viewport from collapsing to zero width.
 ********************************************************/
export const CHART_ZOOM_MIN_VISIBLE_CATEGORIES = 2

/*********************************************************
 * CHART_ZOOM_WHEEL_STEP
 *
 * @description
 * Scroll-wheel zoom speed. Each wheel tick moves the window by this
 * fraction of the current visible range. `0.15` is ~15 % per notch
 * which matches Highcharts' feel without being jerky.
 ********************************************************/
export const CHART_ZOOM_WHEEL_STEP = 0.15

/*********************************************************
 * CHART_ZOOM_RESET_MIN_WIDTH
 *
 * @description
 * Plancher de largeur de la pilule « Reset zoom », en unites
 * utilisateur SVG. La boite s'elargit au texte qu'elle contient (voir
 * `CHART_ZOOM_RESET_PADDING_X`) ; ce plancher evite seulement qu'un
 * libelle tres court produise une cible de clic minuscule.
 *
 * @description
 * ⛔ C'ETAIT UNE LARGEUR FIGEE, ET C'ETAIT LE DEFAUT (#764). Mesure
 * Chromium, meme bouton, meme police :
 *
 *     en « Reset zoom »             texte 56.75  /  boite 64  → tient
 *     fr « Réinitialiser le zoom »  texte 98.06  /  boite 64  → +34.06
 *
 * `text-anchor="middle"` etalait donc ~17 unites de chaque cote de la
 * pilule. Toute langue plus verbeuse que l'anglais heritait du meme
 * debordement — l'allemand aggraverait encore l'ecart.
 ********************************************************/
export const CHART_ZOOM_RESET_MIN_WIDTH = 64

/*********************************************************
 * CHART_ZOOM_RESET_PADDING_X
 *
 * @description
 * Respiration horizontale de chaque cote du libelle, en unites
 * utilisateur SVG. L'anglais tenait dans 64 avec 3.6 de marge de part
 * et d'autre ; 10 donne une pilule un peu plus aeree sans changer le
 * rendu anglais, qui reste au plancher (56.75 + 20 = 76.75 > 64 —
 * la pilule anglaise s'elargit donc legerement, ce qui est le prix
 * d'une boite qui suit son contenu).
 ********************************************************/
export const CHART_ZOOM_RESET_PADDING_X = 10

/*********************************************************
 * CHART_ZOOM_RESET_GAP
 *
 * @description
 * Ecart entre le bord droit de la pilule et le bord droit de l'aire de
 * trace. Valeur conservee du code d'origine, qui translatait le groupe
 * a `plot.x1 - 68` pour une pilule large de 64.
 ********************************************************/
export const CHART_ZOOM_RESET_GAP = 4
