import { VARIANT } from '../../enums/Commons/variant.enum'

import type { IBtnProps } from '../../interfaces/Btn/btn.interface'

import type { TVariant } from '../../types/Commons/variant.type'
import type { TVariantPresets } from '../../types/Commons/variant-preset.type'

/*********************************************************
 * BTN_VARIANTS
 *
 * @description
 * Liste fermee des valeurs de `variant` que `<OrigamBtn>` peint. Exposee
 * pour que stories et consommateurs iterent la matrice sans retaper les
 * litteraux — meme role que `BLOCKQUOTE_VARIANTS`.
 *
 * @description
 * ⛔ DERIVEE DE L'ENUM PARTAGEE `VARIANT`, jamais recopiee. Btn et BtnGroup
 * partagent cet enum (`enums/Commons/variant.enum.ts`) ; il n'existe aucun
 * enum propre a `Btn` et il n'en faut pas, sinon les deux tables de presets
 * divergeraient sur une liste commune.
 ********************************************************/
export const BTN_VARIANTS: ReadonlyArray<TVariant> = Object.values(VARIANT)

/*********************************************************
 * BTN_OUTLINED_BORDER
 *
 * @description
 * La chaine `width style color` que la regle `--variant-outlined` posait,
 * portee par les QUATRE props de cote physiques. Extraite en const parce
 * qu'elle est identique sur les quatre et qu'une divergence par copie
 * serait invisible.
 *
 * @description
 * ⛔ POURQUOI PAR COTE ET PAS LA PROP GLOBALE `border`. Les deux
 * consommateurs de `BORDER_REGEX` ne traitent pas ses groupes pareil :
 * `parseBorderPositionValue` (props par cote / par axe) prend `match.width`
 * EN ENTIER, alors que `useBorder` sur la prop GLOBALE fait
 * `String(match.width).split(' ')` pour distribuer 1/2/4 valeurs — et y
 * couperait `var(--x, 1px)` en deux fragments invalides. C'est ecrit en
 * toutes lettres dans l'en-tete de `BORDER_REGEX` et epingle par les trois
 * tests « path » de `border.util.spec.ts`.
 *
 * @description
 * ⛔ LA COULEUR EST OBLIGATOIRE DANS LA CHAINE, et ce n'est pas une
 * redondance. `parseBorderPositionValue` DEFAUTE une couleur absente a
 * `currentColor` et l'emet quand meme — un litteral inline qui
 * CONFISQUERAIT `--origam-btn---border-color`, que 7 des 8 themes de
 * marque redeclarent (`cartoon` -> `#171717`, `geek` ->
 * `rgba(217,70,239,0.55)`, `material` ->
 * `var(--origam-color__border---default)`…). Nommer le token avec son
 * repli garde le canal ouvert : la declaration inline LIT le token au lieu
 * de le remplacer.
 *
 * @description
 * ⛔ LA LARGEUR EST APLATIE A UN NIVEAU, et c'est mesure fidele. La regle
 * portait `var(--origam-btn---border-width-outlined,
 * var(--origam-border__width---thin))` ; le groupe LARGEUR de
 * `BORDER_REGEX` garde `[^)]+` (seul le groupe COULEUR a gagne
 * l'equilibrage de parentheses, #1027), donc un repli imbrique n'y passe
 * pas. `--origam-border__width---thin` vaut `1px`, declare UNE SEULE FOIS
 * (`primitive.css:173`) et pose par AUCUN des 8 themes — qui redeclarent
 * tous `--origam-btn---border-width-outlined` en direct. Le repli est donc
 * un litteral stable, et l'aplatir ne ferme aucun canal.
 ********************************************************/
const BTN_OUTLINED_BORDER = 'var(--origam-btn---border-width-outlined, 1px) solid var(--origam-btn---border-color, currentColor)'

/*********************************************************
 * BTN_GHOST_BORDER
 *
 * @description
 * Pendant ghost de {@link BTN_OUTLINED_BORDER}. Sa couleur porte un repli
 * IMBRIQUE (`color-mix()` dans le second argument du `var()`), ce que le
 * groupe COULEUR de `BORDER_REGEX` ne savait pas analyser avant #1027 :
 * la valeur entiere etait rejetee et `useBorder` n'emettait RIEN. C'est le
 * troisieme des trois arbitrages de ce lot.
 ********************************************************/
const BTN_GHOST_BORDER = 'var(--origam-btn---border-width-ghost, 1px) solid var(--origam-btn---border-color-ghost, color-mix(in srgb, currentColor 24%, transparent))'

/*********************************************************
 * BTN_GHOST_SHADOW / BTN_GHOST_SHADOW_HOVER
 *
 * @description
 * Les deux ombres de verre a trois couches, au repos et au survol, avec
 * leur `inset` et leurs `color-mix()`. `CUSTOM_BOX_SHADOW_REGEX`
 * (`consts/Commons/elevation.const.ts`) reconnait `var(`, `color-mix(` et
 * `inset` : la chaine part donc sur le canal « box-shadow custom » et est
 * emise VERBATIM, multi-couches comprises.
 ********************************************************/
const BTN_GHOST_SHADOW = 'var(--origam-btn---box-shadow-ghost, 0 0 0 1px color-mix(in srgb, currentColor 18%, transparent), 0 4px 18px 0 color-mix(in srgb, currentColor 28%, transparent), 0 1px 0 0 color-mix(in srgb, white 35%, transparent) inset)'

const BTN_GHOST_SHADOW_HOVER = 'var(--origam-btn---box-shadow-ghost-hover, 0 0 0 1px color-mix(in srgb, currentColor 26%, transparent), 0 6px 24px 0 color-mix(in srgb, currentColor 40%, transparent), 0 1px 0 0 color-mix(in srgb, white 45%, transparent) inset)'

/*********************************************************
 * BTN_VARIANT_PRESETS
 *
 * @description
 * ADR-005 D7, lot 4 (#1027) — le troisieme composant converti, apres le
 * pilote `OrigamKbd` (lot 2) et `OrigamBlockquote` (lot #1015). Un variant
 * de Btn n'est plus un bloc SCSS : c'est ce sac de props, resolu au rang le
 * plus FAIBLE de la chaine (prop du site d'appel > defaut de theme > defaut
 * global de theme > PRESET > `withDefaults`).
 *
 * @description
 * La classe `origam-btn--variant-{valeur}` reste EMISE par `useVariant()`,
 * mais le DS ne lui attache plus aucune regle : elle appartient au
 * CONSOMMATEUR, comme crochet d'override. Le garde `no-variant-css` tient
 * cette moitie du contrat.
 *
 * @description
 * ⛔ CE QUE LA CONVERSION REPARE, ET C'EST SON INCIDENT FONDATEUR.
 * `--variant-outlined` livrait `background-color: transparent !important`.
 * Un `!important` d'AUTEUR battant jusqu'a une declaration INLINE, AUCUNE
 * prop du consommateur ne pouvait repeindre un bouton outlined — ni
 * `bgColor="primary"`, ni un `:style`. Les quatre mesures de l'en-tete de
 * `scripts/guards/no-variant-css.mjs` le disent : contre une classe
 * utilitaire la regle scopee gagnait DEJA sur la seule specificite, donc
 * chacun de ces neuf `!important` n'existait que pour battre l'inline, et
 * c'est exactement ce que la campagne existe pour supprimer.
 *
 * @description
 * ⛔ CHAQUE VALEUR PORTE LA CHAINE `var()` QUE LA REGLE PORTAIT, jamais sa
 * traduction en echelon semantique. Mesure (2026-09-30, reverifiee pour ce
 * lot) : les 8 themes de marque habillent leurs boutons A TRAVERS ces
 * tokens — `cartoon` pose `--origam-btn---box-shadow-elevated: 4px 4px 0
 * #171717` et `--origam-btn---border-width-outlined: 3px`, `glass` une
 * ombre de verre inset a quatre couches et un backdrop multi-fonction,
 * `apple` un `--origam-btn---background-color-tonal` en `color-mix`, et
 * `editorial` / `material` un `--origam-btn---background-color-active`. Un
 * preset ecrit `elevation: 'md'` emettrait `var(--origam-shadow---md)` et
 * jetterait silencieusement tout cela sur 8 identites x 2 modes.
 * @description
 * C'est aussi ce qui regle la CASCADE : une valeur tokenisee
 * (`bgColor: 'primary'`) partirait sur le canal CLASSE a (0,1,0) et
 * perdrait contre la regle de base scopee a (0,2,0) ; une chaine `var(…)`
 * est routee par `isCssColor` vers le canal « valeur custom », donc la
 * declaration INLINE, qui passe devant. Fidelite et cascade demandent la
 * meme chose.
 *
 * @description
 * ⛔ CE QUE LA TABLE NE POSE PAS COMPTE AUTANT QUE CE QU'ELLE POSE.
 * `outlined` n'inscrit NI `borderColor` NI `borderStyle` en props
 * autonomes : la regle de BASE les declare deja a l'identique
 * (`border-color: var(--origam-btn---border-color, currentColor)` et
 * `border-style: var(--origam-btn---border-style, solid)`). Les reemettre
 * ne serait pas neutre — un preset emet une declaration INLINE, qui
 * passerait devant le token, et un theme redeclarant
 * `--origam-btn---border-style` cesserait d'atteindre `outlined`. Seule la
 * LARGEUR change reellement entre le repos et `outlined` (0 -> thin), et
 * elle voyage dans la chaine par cote, avec la couleur nommee par son
 * token pour la raison expliquee sur {@link BTN_OUTLINED_BORDER}.
 *
 * @description
 * ⚠️ LA SEULE VALEUR CALCULEE QUI BOUGE, rapportee plutot que cachee.
 * `box-shadow: none` — le MOT-CLE — devient `elevation: 'none'`, qu'
 * `isOrigamRung` intercepte avant tout et qui emet
 * `var(--origam-shadow---none)`, declare `0px 0px 0px 0px rgba(0,0,0,0)`
 * (`primitive.css:130`). Le style calcule passe donc de `none` a ce
 * quadruple sur 5 des 7 variants (`flat`, `text`, `tonal`, `outlined`,
 * `plain`) : etendue nulle, alpha nul, AUCUN pixel. Delta identique a
 * celui mesure par le pilote Kbd. `useElevation` n'a aucune voie pour
 * emettre le mot-cle, et c'est voulu (#813 : un `none` emis gagnerait la
 * cascade et effacerait une ombre que le composant peint pour lui-meme).
 * @description
 * ⚠️ Corollaire, inerte mais visible dans le DOM : `elevationClasses`
 * pousse `origam-btn--elevated` des que `elevation` n'est pas `null`,
 * `'none'` compris. Ni `OrigamBtn.vue` ni `OrigamBtnGroup.vue` n'ont de
 * regle `&--elevated` (verifie : zero occurrence dans tout le depot), donc
 * la classe ne peint rien — mais une assertion e2e qui compte les classes
 * la verra.
 *
 * @description
 * ⛔ DEUX EXCEPTIONS STRUCTURELLES SUR `ghost` ET `plain`, DOCUMENTEES
 * PLUTOT QUE MASQUEES — meme traitement que l'exception typographique du
 * lot Blockquote.
 * @description
 * 1. `:focus-visible`. Les regles supprimees de `plain` et de `ghost`
 *    declaraient `&:hover, &:focus-visible`. `useStateFlag` ne pilote son
 *    drapeau `hover` que sur `mouseenter` / `mouseleave` : il n'existe
 *    aucun canal de prop pour l'etat de focus clavier. Le preset ne porte
 *    donc que la moitie SURVOL. Consequence reelle : au focus clavier, un
 *    `plain` ne remonte plus a l'opacite 1 et un `ghost` ne prend plus son
 *    fond/ombre de survol. ⚠️ L'INDICATEUR DE FOCUS LUI-MEME SURVIT — la
 *    regle de base porte `&:focus-visible { outline: 2px solid
 *    var(--origam-color__border---focus) }`, hors de tout bloc de variant,
 *    donc inchangee : ce n'est pas une perte d'indicateur de focus (WCAG
 *    2.4.7), c'est la perte d'un renforcement esthetique. Remonte comme
 *    arbitrage, non tranche ici.
 * @description
 * 2. La branche `@supports not (backdrop-filter)` de `ghost`, qui
 *    epaississait le voile de 12 % a 18 % quand le flou est indisponible.
 *    AUCUNE prop n'exprime une valeur conditionnee a une feature query —
 *    `variant-preset.const.ts` le notait deja avant ce lot. Un navigateur
 *    sans `backdrop-filter` recoit donc desormais le voile a 12 %. Non
 *    observable dans le filet : chromium (VRT, e2e) et toutes les cibles
 *    du DS supportent `backdrop-filter`.
 *
 * @description
 * ⚠️ LES 6 TOKENS `ghost` ET `--origam-btn---background-color-active`
 * RESTENT NON DECLARES, A DESSEIN (⛔ C2, #597). Leurs replis sont des
 * `color-mix()` relatifs a `currentColor` — ils doivent etre evalues SUR
 * LE BOUTON, dont la couleur depend de l'intention ; une declaration
 * `:root` les figerait a la teinte racine. Et
 * `--origam-btn---background-color-ghost` etait lu DEUX FOIS avec DEUX
 * replis differents (12 % au repos, 18 % dans la branche `@supports not`).
 * ⛔ Le reflexe « je les ajoute dans `light.css` » est une regression de
 * rendu que toutes les gardes laissent passer au vert. Les jumeaux
 * `--origam-btn--ghost---*` presents dans les feuilles sont DELIBEREMENT
 * dormants : `--origam-color__action--ghost---bg` vaut `rgba(0,0,0,0)` et
 * `---bgHover` un neutre OPAQUE, donc les cabler supprimerait le voile
 * relatif au lieu de le servir.
 *
 * @description
 * ⛔ UN PRESET NE POSE JAMAIS `variant`. `VARIANT_PROP_KEY`
 * (`consts/Commons/variant-preset.const.ts`) est la garde anti-recursion :
 * sans elle le getter de `variant` lirait `variant` pour se resoudre.
 *
 * @description
 * ⚠️ `active` ET `hover` SONT DES PROPS D'ETAT, et un preset qui les pose
 * passe par leur forme OBJET — celle qui laisse l'etat pilote par
 * l'interaction (`enabled` absent) et ne surcharge que la surface. Dans un
 * `<origam-btn-toggle>`, `props.active` reste `undefined` et c'est
 * `group.isSelected` qui decide : le preset s'applique donc normalement.
 * ⛔ En revanche une prop EXPLICITE bat le preset (rang 1 contre rang 4),
 * donc `<origam-btn variant="tonal" active>` ne recoit PLUS la surface
 * active du variant — la regle CSS, elle, s'appliquait quoi qu'il arrive.
 * C'est la consequence directe de l'arbitrage Q2 d'ADR-005, verbatim du
 * mainteneur : « rien n'oblige l'utilisateur a garder le bgColor en ghost,
 * il peut le transformer en primary ». Un variant est une COMMODITE, pas
 * une identite que le DS defend. Pour forcer l'etat SANS perdre la
 * surface, passer la forme objet : `:active="{ enabled: true }"`.
 ********************************************************/
export const BTN_VARIANT_PRESETS: TVariantPresets<TVariant, IBtnProps> = {
    flat: {
        elevation: 'none'
    },
    text: {
        bgColor: 'transparent',
        elevation: 'none'
    },
    elevated: {
        elevation: 'var(--origam-btn---box-shadow-elevated, var(--origam-shadow---md))'
    },
    tonal: {
        bgColor: 'var(--origam-btn---background-color-tonal, var(--origam-color__surface---overlay))',
        elevation: 'none',
        active: {
            bgColor: 'var(--origam-btn---background-color-tonal-active, var(--origam-color__surface---raised, var(--origam-color__surface---overlay)))',
            elevation: 'var(--origam-btn---box-shadow-tonal-active, var(--origam-shadow---xs))',
            fontWeight: 'semibold'
        }
    },
    outlined: {
        bgColor: 'transparent',
        elevation: 'none',
        borderTop: BTN_OUTLINED_BORDER,
        borderRight: BTN_OUTLINED_BORDER,
        borderBottom: BTN_OUTLINED_BORDER,
        borderLeft: BTN_OUTLINED_BORDER,
        active: {
            bgColor: 'var(--origam-btn---background-color-active, var(--origam-btn---background-color))',
            color: 'var(--origam-btn---color)',
            borderColor: 'var(--origam-btn---background-color-active, var(--origam-btn---background-color))'
        }
    },
    plain: {
        bgColor: 'transparent',
        elevation: 'none',
        opacity: 'var(--origam-btn---opacity-plain, var(--origam-opacity---70))',
        hover: {
            opacity: 1
        }
    },
    ghost: {
        bgColor: 'var(--origam-btn---background-color-ghost, color-mix(in srgb, currentColor 12%, transparent))',
        elevation: BTN_GHOST_SHADOW,
        borderTop: BTN_GHOST_BORDER,
        borderRight: BTN_GHOST_BORDER,
        borderBottom: BTN_GHOST_BORDER,
        borderLeft: BTN_GHOST_BORDER,
        backdropFilter: 'var(--origam-btn---backdrop-filter-ghost, blur(8px))',
        hover: {
            bgColor: 'var(--origam-btn---background-color-ghost-hover, color-mix(in srgb, currentColor 18%, transparent))',
            elevation: BTN_GHOST_SHADOW_HOVER
        }
    }
}
