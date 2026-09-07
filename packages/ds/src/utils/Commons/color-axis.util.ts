import {
    getForeground,
    isCssColor,
    isIntent,
    isParsableColor,
    isUtilityIntent,
    parseColor,
    rawBgExprWithState,
    tokenForegroundForIntent,
    tokenStylesForIntent,
    warnLegacyColor,
} from './color.util'
import { isGradient, resolveGradient } from './gradient.util'

import type { IColorAxisOptions } from '../../interfaces/Commons/color.interface'
import type { TBgFgRole, TColor } from '../../types/Commons/color.type'

// ════════════════════════════════════════════════════════════════════════════
// Axe COULEUR — implementation unique, partagee par `useColorEffect` et
// `useStateEffect`.
//
// POURQUOI CE FICHIER EXISTE
// --------------------------
// `useStateEffect` portait une copie de cet algorithme, et le disait :
// « Color axis (preserved verbatim from useColorEffect) ». Deux copies d'un
// resolveur de couleur divergent toujours — d'autant plus que celle-ci
// pilote la couleur de 33 composants contre 2 pour l'original, donc la copie
// pesait quinze fois plus lourd que la source qu'elle citait.
//
// Ce qui reste chez les composables, et pourquoi : les deux ne different que
// par leur CABLAGE reactif — d'ou viennent `fg` / `bg` (props brutes chez
// l'un, resolution hover/active/status chez l'autre) et comment se derive le
// role de surface. Ces deux choses sont propres a chaque composable ; la
// resolution qui suit, non. On extrait donc la resolution PURE et on laisse
// chacun garder son cablage. C'est aussi ce que la convention du depot
// impose : les composables n'hebergent que des fonctions `use*`, les helpers
// purs vivent dans `utils/`.
//
// ⛔ POURQUOI UN FICHIER SEPARE PLUTOT QUE `color.util.ts`
// `gradient.util.ts` importe deja `color.util.ts`. Y ajouter l'import
// inverse fermerait un cycle entre les deux — precisement le cycle contre
// lequel l'en-tete de `color.util.ts` met en garde : sous vite-node, un
// export ajoute tardivement dans un module en cycle resout `undefined` au
// lieu de la fonction. Ce fichier importe les deux et n'est importe par
// aucun d'eux : pas de cycle.
//
// ⛔ CE QUE `fgDecl` FAIT SUR LE CHEMIN TOKENISE — NE PAS «NETTOYER» (#514)
// La declaration inline de premier plan est emise MEME quand la valeur est
// tokenisee, et c'est deliberé, pour deux raisons mesurees :
//   1. la classe utilitaire et la declaration inline ne portent pas le meme
//      token — `.origam--color-{intent}` resout `…---fg` (blanc sur fond
//      sature) la ou `tokenForegroundForIntent()` resout `fgSubtle` (la
//      teinte propre de l'intention, pour une surface neutre). 7 intentions
//      sur 8 rendent une couleur differente ;
//   2. la classe utilitaire perd la cascade par construction — une regle
//      scopee Vue vaut (0,2,0), une utilitaire (0,1,0) — et 73 des 101
//      composants concernes declarent un `color:` dans leur SCSS scope.
// Retirer `fgDecl` eteint donc la prop `color` sur ces composants.
// ════════════════════════════════════════════════════════════════════════════

/*********************************************************
 * resolveBgRole
 *
 * @description
 * Derive le role de surface (`default` / `hover` / `active`) a partir des
 * deux drapeaux d'etat. Priorite d'affichage : hover l'emporte sur active,
 * pour qu'un element presse ET survole montre la surface de survol.
 *
 * @description
 * Les appelants passent les drapeaux qu'ILS jugent pertinents :
 * `useColorEffect` passe les drapeaux bruts, `useStateEffect` les neutralise
 * quand l'etat porte deja sa propre valeur de fond (auquel cas la valeur EST
 * la surcharge choisie par le consommateur, il ne faut pas la re-assombrir).
 ********************************************************/
export function resolveBgRole (isHover: boolean, isActive: boolean): TBgFgRole {
    if (isHover) return 'hover'
    if (isActive) return 'active'
    return 'default'
}

/*********************************************************
 * resolveColorAxisClasses
 *
 * @description
 * Classes utilitaires de l'axe couleur, pour l'etat de REPOS uniquement.
 *
 * @description
 * `suspended` coupe le canal : en hover / active / disabled, le token
 * resolu n'est plus le `--origam-color__action--*---bg` de repos auquel
 * renvoie la classe utilitaire — il n'existe pas de classe pour les rungs
 * `bgHover` / `bgActive`, donc on n'emet rien et on laisse la declaration
 * inline peindre la surface.
 *
 * @description
 * @param fg        valeur de premier plan effective (`color`)
 * @param bg        valeur de fond effective (`bgColor`)
 * @param suspended vrai des qu'un etat est engage (hover, active, disabled)
 ********************************************************/
export function resolveColorAxisClasses (
    fg: TColor,
    bg: TColor,
    suspended: boolean,
): string[] {
    if (suspended) return []

    const classes: string[] = []

    if (bg && isUtilityIntent(bg)) classes.push(`origam--bg-${bg}`)
    if (fg && isUtilityIntent(fg)) classes.push(`origam--color-${fg}`)

    return classes
}

/*********************************************************
 * resolveColorAxisStyles
 *
 * @description
 * Declarations CSS inline de l'axe couleur : fond puis premier plan, dans
 * cet ordre, avec auto-contraste.
 *
 * @description
 * Contrat du design system : `color` est un premier plan SEUL — il ne peint
 * jamais la surface ; `bgColor` possede la surface et appaire lui-meme son
 * texte lisible. Quand les deux axes portent la MEME intention, le premier
 * plan bascule sur le token de contraste du fond au lieu de la teinte propre
 * de l'intention, sans quoi on obtient du violet sur violet.
 *
 * @description
 * @param fg      valeur de premier plan effective (`color`)
 * @param bg      valeur de fond effective (`bgColor`)
 * @param bgRole  role de surface, cf. `resolveBgRole`
 * @param options cf. `IColorAxisOptions`
 ********************************************************/
export function resolveColorAxisStyles (
    fg: TColor,
    bg: TColor,
    bgRole: TBgFgRole,
    options: IColorAxisOptions = {},
): string[] {
    const { gradients = false } = options

    let bgDecl: string | null = null
    let fgDecl: string | null = null
    // Quand le fond vient d'une intention, on connait le token de texte
    // appaire : il sert de repli si aucun `color` n'est passe.
    let bgIntentFg: string | null = null
    // Un degrade occupe le canal `background-image` : l'auto-contraste ne
    // sait pas s'appairer a un remplissage multi-arrets, il se desactive.
    let bgIsGradient = false
    // Vrai quand le PREMIER PLAN resout en degrade — il faut alors emettre
    // le triptyque `background-clip: text` a la fin.
    let clipText = false

    /*********************************************************
     * Fond
     ********************************************************/
    if (gradients && bg && isGradient(bg)) {
        // Les degrades ignorent la cascade d'assombrissement hover/active :
        // un `color-mix` par arret ferait exploser la declaration et
        // trahirait l'intention graphique. L'etat s'exprime via l'opacite du
        // composant parent (meme contrat que `disabled`).
        const grad = resolveGradient(bg)
        if (grad) {
            bgDecl = `background-image: ${grad}`
            bgIsGradient = true
        }
    } else if (bg && isIntent(bg)) {
        bgDecl = `background-color: ${tokenStylesForIntent(bg, bgRole)['background-color']}`
        // Le texte de contraste d'une intention est fixe d'un role a
        // l'autre : on lit toujours le slot `default`, le texte ne
        // s'assombrit pas avec sa surface.
        bgIntentFg = tokenStylesForIntent(bg, 'default').color
    } else if (bg === 'transparent') {
        // Base transparente : la derivation math donne un gris discret au
        // survol, plus marque a l'appui.
        bgDecl = `background-color: ${rawBgExprWithState('transparent', bgRole)}`
    } else if (bg && typeof bg === 'string' && isCssColor(bg)) {
        warnLegacyColor('bgColor', bg)
        bgDecl = `background-color: ${rawBgExprWithState(bg, bgRole)}`
    }

    /*********************************************************
     * Premier plan
     ********************************************************/
    if (gradients && fg && isGradient(fg)) {
        // Degrade de texte : on detourne `background-image` et on le
        // decoupe sur les glyphes. Si le fond etait lui aussi un degrade,
        // les deux se disputent le meme canal — le premier plan gagne.
        const grad = resolveGradient(fg)
        if (grad) {
            fgDecl = 'color: transparent'
            bgDecl = `background-image: ${grad}`
            clipText = true
        }
    } else if (fg && isIntent(fg)) {
        if (bgIntentFg && bg && isIntent(bg) && fg === bg) {
            fgDecl = `color: ${bgIntentFg}`
        } else {
            fgDecl = `color: ${tokenForegroundForIntent(fg)}`
        }
    } else if (fg && typeof fg === 'string' && isCssColor(fg)) {
        if (fg !== 'transparent') warnLegacyColor('color', fg)
        fgDecl = `color: ${fg}`
    } else if (!fg && bgIntentFg && !bgIsGradient) {
        fgDecl = `color: ${bgIntentFg}`
    } else if (
        !fg && !bgIsGradient && bg && typeof bg === 'string' &&
        bg !== 'transparent' && isParsableColor(bg)
    ) {
        // Auto-contraste herite (couleur CSS brute), via `getForeground`.
        // Ignore sur un fond translucide : le contraste n'y est pas calculable.
        const parsed = parseColor(bg)
        if (parsed.a == null || parsed.a === 1) {
            fgDecl = `color: ${getForeground(parsed)}`
        }
    }

    const styles: string[] = []
    if (bgDecl) styles.push(bgDecl)
    if (fgDecl) styles.push(fgDecl)
    if (clipText) {
        styles.push('background-clip: text')
        styles.push('-webkit-background-clip: text')
    }
    return styles
}
