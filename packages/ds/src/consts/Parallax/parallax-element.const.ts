/*********************************************************
 * parallax-element.const
 *
 * @description
 * Movement constants of `useParallaxTransform` — the mouse-driven
 * transform builder behind `<OrigamParallaxElement>`.
 *
 * @description
 * `strength` is the only consumer-facing knob; everything below shapes
 * how that knob is converted into a CSS transform.
 ********************************************************/

/*********************************************************
 * PARALLAX_ELEMENT_DEFAULT_STRENGTH
 *
 * @description
 * Default `strength` when the consumer leaves the prop unset. Mirrored
 * verbatim in `<OrigamParallaxElement>`'s `withDefaults(...)` block per
 * the CLAUDE.md "inline literals only" rule — the constant exists so
 * the composable (which receives already-resolved props, but also runs
 * standalone in tests) does not restate the number.
 ********************************************************/
export const PARALLAX_ELEMENT_DEFAULT_STRENGTH = 10

/*********************************************************
 * PARALLAX_ELEMENT_MOVEMENT_DIVISOR
 *
 * @description
 * Divisor applied to `strength × pointer-offset` before it becomes a
 * px / deg amount. Keeps the default strength of 10 at a 1:1 ratio with
 * the pointer offset.
 ********************************************************/
export const PARALLAX_ELEMENT_MOVEMENT_DIVISOR = 10

/*********************************************************
 * PARALLAX_ELEMENT_MOVEMENT_BASE
 *
 * @description
 * Constant term added to every computed movement, so a pointer sitting
 * exactly at the origin still yields a non-zero (1px / 1deg / scale 1)
 * transform rather than collapsing the element.
 ********************************************************/
export const PARALLAX_ELEMENT_MOVEMENT_BASE = 1

/*********************************************************
 * PARALLAX_ELEMENT_DEPTH_TRANSLATE_FACTOR
 *
 * @description
 * Z-axis multiplier of the `depth` / `depth_inv` types: the element is
 * pushed `strength × 2` px towards the viewer, which is the amount that
 * makes the rotation read as depth at the default perspective.
 ********************************************************/
export const PARALLAX_ELEMENT_DEPTH_TRANSLATE_FACTOR = 2

/*********************************************************
 * PARALLAX_ELEMENT_VAR_X / PARALLAX_ELEMENT_VAR_Y
 *
 * @description
 * Les deux proprietes personnalisees que `<OrigamParallaxElement>` publie
 * quand `type="custom"` — la trappe d'extension que la doc annoncait
 * (« Reserved hatch for consumer-supplied transforms ») sans qu'aucune
 * surface d'API ne la rende atteignable (#432). Le consommateur ecrit sa
 * transform EN CSS a partir de ces deux valeurs.
 *
 * @description
 * La valeur est le montant de mouvement PAR AXE, APRES application de
 * `strength` (et de `axis` / `min` / `max` / `cycle` en amont) : exactement
 * ce que les sept types integres passent a `translate3d` / `rotate` /
 * `scale`. Publier le mouvement BRUT rendrait toutes les autres props
 * mortes des qu'on choisit `custom`.
 *
 * @description
 * ⛔ NOMBRE NU, sans unite, et c'est deliberé. Le meme nombre vaut des px
 * pour `translate`, des degres pour `rotate` et un ratio pour `scale` :
 * figer `px` ici fermerait la trappe aux deux autres usages. Le
 * consommateur multiplie lui-meme :
 * `transform: rotate(calc(var(--origam-parallax__element---x) * 1deg))`.
 *
 * @description
 * La grammaire suit celle deja publiee par le runtime pour les couches
 * (`--origam-parallax__layer---offset-x`) : ces noms sont un CONTRAT avec
 * les feuilles de style des consommateurs, d'ou une constante partagee
 * plutot que des litteraux disperses.
 ********************************************************/
export const PARALLAX_ELEMENT_VAR_X = '--origam-parallax__element---x'
export const PARALLAX_ELEMENT_VAR_Y = '--origam-parallax__element---y'
