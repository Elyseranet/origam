/*********************************************************
 * WAVEFORM_VIEW_BOX
 *
 * @description
 * Repere de dessin de la forme d'onde. Les barres sont positionnees en
 * pourcentage de cette boite, et le SVG est etire par
 * `preserveAspectRatio="none"` : la valeur n'a donc aucune influence sur
 * le rendu final, elle fixe seulement l'echelle des calculs.
 *
 * @description
 * Etait un `computed` renvoyant une chaine constante dans
 * OrigamSliderField — une constante deguisee en valeur reactive, qui
 * recalculait a chaque invalidation pour toujours rendre la meme chose.
 ********************************************************/
export const WAVEFORM_VIEW_BOX = '0 0 100 100'
