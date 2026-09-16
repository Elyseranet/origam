import type { ComputedRef, Ref } from 'vue'
import { computed, ref } from 'vue'
import type { IBgColorProps, IColorProps } from '../../interfaces/Commons/color.interface'
import type { TBgFgRole } from '../../types/Commons/color.type'
import type { TIntent } from '../../types/Commons/intent.type'
// Explicit `.ts` extension: a stale sibling `color.util.js` lingers in
// the source tree (legacy build artefact) and the module resolver picks
// it up first when no extension is given — that older file lacks the
// recently-added intent helpers, so they resolve to `undefined` at
// runtime. Forcing `.ts` here pins the import to the canonical source.
// The 295 orphan `.js` files across `src/` should be cleaned up in a
// dedicated pass.
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
} from '../../utils/Commons/color.util'
import { isGradient, resolveGradient } from '../../utils/Commons/gradient.util'
import type { TColor } from '../../types/Commons/color.type'

/*********************************************************
 * trackReactiveDependency
 *
 * @description
 * Ne fait rien, et c'est le but : c'est la LECTURE de l'argument, au site
 * d'appel, qui abonne l'effet appelant. Remplace un `void ref.value` nu —
 * SonarQube remonte l'operateur `void` en CRITICAL (#771) et une
 * expression-instruction nue en « instruction inutile ».
 *
 * @description
 * ⛔ Ne pas supprimer l'appel en croyant nettoyer du code mort. Retirer la
 * lecture retire la dependance reactive : le `computed` cesse de s'invalider
 * quand la source change, et rien ne le signale.
 ********************************************************/
function trackReactiveDependency (_value: unknown): void {
    /* Volontairement vide — seule la lecture de l'argument compte. */
}

/*********************************************************
 * resolveBackground
 *
 * @description
 * La chaine de resolution du FOND, extraite telle quelle de `colorStyles`
 * (Sonar #771 : complexite cognitive 35 > 15). Memes branches, meme ordre,
 * memes casts, meme `warnLegacyColor`. Les trois valeurs que la chaine
 * produisait par affectation sont rendues en tuple, dans le meme etat par
 * defaut qu'avant (`null`, `null`, `false`) quand aucune branche ne mord.
 ********************************************************/
function resolveBackground (
    bgColorValue: TColor,
    bgRole: TBgFgRole
): [bgDecl: string | null, bgIntentFg: string | null, bgIsGradient: boolean] {
    /*********************************************************
     * Gradient
     *
     * @description
     * Les degrades ignorent la cascade d'assombrissement hover/active :
     * appliquer un `color-mix` par arret ferait exploser la taille de la
     * declaration et changerait l'intention artistique. Hover/active
     * s'expriment visuellement via l'opacite / la transformation du
     * composant parent, pas par un echange de token. (Meme contrat que
     * l'etat disabled : un voile sur le remplissage au repos.)
     ********************************************************/
    if (bgColorValue && isGradient(bgColorValue)) {
        const grad = resolveGradient(bgColorValue)

        if (grad) return [`background-image: ${grad}`, null, true]

        return [null, null, false]
    }

    if (bgColorValue && isIntent(bgColorValue as string)) {
        const m = tokenStylesForIntent(bgColorValue as TIntent, bgRole)

        /*********************************************************
         * bgIntentFg
         *
         * @description
         * Le fg de contraste d'une intention est fixe d'un role a l'autre :
         * on le tire du slot `default` quoi qu'il arrive, pour que le texte
         * ne s'assombrisse pas avec le fond en hover/active.
         ********************************************************/
        return [
            `background-color: ${m['background-color']}`,
            tokenStylesForIntent(bgColorValue as TIntent, 'default').color,
            false
        ]
    }

    /*********************************************************
     * transparent
     *
     * @description
     * Mode par defaut (base transparente) : la derivation mathematique donne
     * un gris subtil au hover, plus marque a l'active — c'est la
     * « progression neutre » attendue, style pagination.
     ********************************************************/
    if (bgColorValue === 'transparent') {
        return [`background-color: ${rawBgExprWithState('transparent', bgRole)}`, null, false]
    }

    /*********************************************************
     * couleur brute (legacy)
     *
     * @description
     * Meme derivation -20 % / -30 % pour hover / active. Le mode par defaut
     * laisse la valeur brute intacte (aucune transformation au repos).
     ********************************************************/
    if (bgColorValue && typeof bgColorValue === 'string' && isCssColor(bgColorValue)) {
        warnLegacyColor('bgColor', bgColorValue)

        return [`background-color: ${rawBgExprWithState(bgColorValue, bgRole)}`, null, false]
    }

    return [null, null, false]
}

/*********************************************************
 * isSameIntentOnBothAxes
 *
 * @description
 * Le consommateur a passe la MEME intention sur `color` et sur `bgColor`.
 * Predicat extrait de la chaine de premier plan, sans changement : memes
 * quatre conditions, meme ordre, meme court-circuit.
 ********************************************************/
function isSameIntentOnBothAxes (
    colorValue: TColor,
    bgColorValue: TColor,
    bgIntentFg: string | null
): boolean {
    return Boolean(
        bgIntentFg &&
        bgColorValue &&
        isIntent(bgColorValue as string) &&
        colorValue === bgColorValue
    )
}

/*********************************************************
 * resolveAutoContrastForeground
 *
 * @description
 * Les deux dernieres branches de la chaine de premier plan, celles qui ne
 * s'appliquent QUE si aucun `color` n'est passe. L'appelant garantit ce
 * `!colorValue` ; les deux branches d'origine le portaient chacune.
 *
 * @description
 * Voie token — le fond vient d'une intention : on apparie le token `fg` de
 * l'intention pour que le texte soit toujours lisible.
 *
 * @description
 * Voie CSS brut (legacy) — premier plan conscient du WCAG via
 * `getForeground`. Saute les fonds translucides (alpha < 1), pour lesquels
 * le contraste ne peut pas etre calcule de facon fiable.
 *
 * @description
 * ⚠️ Le `if (bgIsGradient) return null` en tete remplace le `!bgIsGradient`
 * que LES DEUX branches d'origine portaient. Et la voie brute n'est
 * atteinte que si `bgIntentFg` est absent — exactement ce que faisait le
 * `else if` d'origine.
 ********************************************************/
function resolveAutoContrastForeground (
    bgColorValue: TColor,
    bgIntentFg: string | null,
    bgIsGradient: boolean
): string | null {
    if (bgIsGradient) return null

    if (bgIntentFg) return `color: ${bgIntentFg}`

    if (bgColorValue && typeof bgColorValue === 'string'
        && bgColorValue !== 'transparent' && isParsableColor(bgColorValue)) {
        const parsed = parseColor(bgColorValue)

        if (parsed.a == null || parsed.a === 1) return `color: ${getForeground(parsed)}`
    }

    return null
}

/*********************************************************
 * resolveForeground
 *
 * @description
 * La chaine de resolution du PREMIER PLAN, extraite telle quelle de
 * `colorStyles` (Sonar #771). Memes branches, meme ordre, memes casts.
 *
 * @description
 * Contrat transversal du design-system (identique a `useColor`) :
 * `color` est FOREGROUND-ONLY, il ne peint jamais la surface ; `bgColor`
 * possede la surface. La version precedente appariait automatiquement le
 * fond depuis l'intention quand seul `color` etait passe — ce qui faisait
 * que `<origam-btn-group color="primary">` inondait chaque bouton enfant
 * d'un fond primary au lieu d'en colorer seulement le texte.
 *
 * @description
 * Le 2e element du tuple est un ECRASEMENT du `bgDecl` deja resolu, pas un
 * ajout : un degrade de premier plan detourne le canal `background-image`
 * (triade `background-clip: text`), et le premier plan l'emporte sur la
 * surface. `null` = ne rien ecraser.
 ********************************************************/
function resolveForeground (
    colorValue: TColor,
    bgColorValue: TColor,
    bgIntentFg: string | null,
    bgIsGradient: boolean
): [fgDecl: string | null, bgDeclOverride: string | null, clipText: boolean] {
    if (colorValue && isGradient(colorValue)) {
        const grad = resolveGradient(colorValue)

        if (grad) return ['color: transparent', `background-image: ${grad}`, true]

        return [null, null, false]
    }

    if (colorValue && isIntent(colorValue as string)) {
        /*********************************************************
         * Color-clash auto-contrast (regle transverse)
         *
         * @description
         * Quand le consommateur passe la MEME intention sur les deux axes
         * (`color="primary" bgColor="primary"`), peindre le fg avec
         * `tokenForegroundForIntent` rend la teinte propre de l'intention
         * (fgSubtle = primary.700) PAR-DESSUS la surface de cette meme
         * intention — teinte sur teinte, illisible (« violet sur violet »).
         * On bascule sur le token de contraste apparie au fond.
         ********************************************************/
        if (isSameIntentOnBothAxes(colorValue, bgColorValue, bgIntentFg)) {
            return [`color: ${bgIntentFg}`, null, false]
        }

        return [`color: ${tokenForegroundForIntent(colorValue as TIntent)}`, null, false]
    }

    if (colorValue && typeof colorValue === 'string' && isCssColor(colorValue)) {
        if (colorValue !== 'transparent') warnLegacyColor('color', colorValue)

        return [`color: ${colorValue}`, null, false]
    }

    if (!colorValue) {
        const autoFg = resolveAutoContrastForeground(bgColorValue, bgIntentFg, bgIsGradient)

        if (autoFg) return [autoFg, null, false]
    }

    return [null, null, false]
}

/*********************************************************
 * useColorEffect
 *
 * @description
 * Hover/active/disabled-aware bg+fg colour resolver — refactored for
 * design-tokens / intent support (Lot 1).
 * Deliberately independent from `useColor`: the role/state derivation
 * (default / hover / active slots) is a different algorithm from the
 * legacy static resolver, not a variant of it — kept in its own file
 * rather than forced to share a base.
 *
 * Returns the same shape as before — `{ colorStyles, color, bgColor }` —
 * so existing callers (`OrigamAudio`, `OrigamVideo`) keep working
 * without changes.
 *
 * `colorStyles` is an array of CSS declarations like
 * `'background-color: …'`, either pointing to a token
 * (`var(--origam-color__action--primary---bg)`) when `props.color` is
 * an intent, or to a raw value when it's a hex/rgb (legacy).
 *
 * State resolution: `isHover.value` / `isActive.value` bump an intent
 * `bgColor` to its `bgHover` / `bgActive` token rung (color-mix
 * fallback when the token is missing). The flat `hoverColor` /
 * `activeColor` / `hoverBgColor` / `activeBgColor` per-state override
 * props were removed (folded into the `hover` / `active` object props
 * on components that support them — see `color.interface.ts`); neither
 * real caller of this composable (`OrigamAudio`, `OrigamVideo`) ever
 * declared them, so the foreground/background scalars are now just
 * `props.color` / `props.bgColor` — only the darken-derivation role
 * (`bgRole`) still reacts to `isHover` / `isActive`.
 ********************************************************/
export function useColorEffect (
    props: IColorProps & IBgColorProps,
    isHover: Ref<boolean> | ComputedRef<boolean> = ref(false),
    isActive: Ref<boolean> | ComputedRef<boolean> = ref(false),
    isDisabled: Ref<boolean> | ComputedRef<boolean> = ref(false)
) {
    const color = computed(() => props.color)
    const bgColor = computed(() => props.bgColor)

    // Utility classes for the resting state ONLY. When the component is
    // in hover / active state, slot resolution kicks the bg/fg to their
    // `bgHover` / `fgHover` token rungs — there is no matching utility
    // class for those slots, so we emit nothing and let the inline
    // styles win. Same goes for legacy raw colors (hex/rgb).
    const colorClasses = computed<string[]>(() => {
        // Bypass the utility layer in hover/active/disabled because the
        // resolved token is not the resting `--origam-color__action--*---bg`
        // referenced by the utility class.
        if (isHover.value || isActive.value || isDisabled.value) return []

        const classes: string[] = []
        const bgVal = bgColor.value
        const fgVal = color.value

        if (bgVal && isUtilityIntent(bgVal)) {
            classes.push(`origam--bg-${bgVal}`)
        }
        if (fgVal && isUtilityIntent(fgVal)) {
            classes.push(`origam--color-${fgVal}`)
        } else if (!fgVal && bgVal && isUtilityIntent(bgVal)) {
            // Auto-contrast: a bg-only intent pairs the matching fg
            // token. We don't emit a `.origam--color-*` class here
            // because the utility uses the intent's `*-fg` token while
            // the inline style emits the WCAG-paired surface foreground
            // (handled below). The component's SCSS picks up the
            // inline style during the transition.
        }
        return classes
    })

    const colorStyles = computed<string[]>(() => {
        // ─────────────────────────────────────────────────────────────────
        // Resolve bg and fg INDEPENDENTLY so that overriding only one of
        // them (e.g. `hoverBgColor` while keeping `color="primary"` for
        // the foreground) actually works. The previous "path A wins" logic
        // short-circuited as soon as `color` was an intent and silently
        // dropped any bgColor / hoverBgColor / activeBgColor overrides.
        //
        // Slot selection ("default" vs "hover") is per-axis: a missing
        // hoverBgColor lets the bg auto-bump to the intent's `bgHover`
        // slot, and likewise for fg. When the consumer DID pass an explicit
        // hover override we use the value as-is on the "default" slot of
        // that intent (the consumer chose the value, they don't want us
        // re-bumping it to a hover variant of itself).
        // ─────────────────────────────────────────────────────────────────
        // `isDisabled` is accepted here for API symmetry with `isHover`
        // / `isActive`, but does NOT switch the bg/fg to `bgDisabled` /
        // `fgDisabled` tokens — design contract is that disabled is a
        // VEIL/opacity overlay on the resting color, not a token swap.
        // The host component (e.g. `<origam-btn>`) applies its own
        // `--disabled` rule (opacity reduction) so the user sees a
        // lighter version of WHATEVER bgColor was picked, regardless
        // of intent. This keeps every btn in a row (e.g. pagination)
        // visually consistent — same color family, just dimmed.
        // We still read `isDisabled.value` to keep the param wired —
        // in case a future iteration wants per-intent disabled tokens.
        trackReactiveDependency(isDisabled.value)
        // ── State role ────────────────────────────────────────────────────
        // hover and active resolve to DIFFERENT roles so the cross-
        // component spec ("hover -20 %, active -30 %") holds. There is no
        // per-state override anymore (see the composable's JSDoc) — the
        // role is purely a function of `isHover` / `isActive`.
        const bgRole: TBgFgRole =
            isHover.value ? 'hover' :
            isActive.value ? 'active' :
            'default'

        /*********************************************************
         * Resolution du fond, puis du premier plan
         *
         * @description
         * Les deux chaines vivent desormais dans `resolveBackground` /
         * `resolveForeground` en haut de fichier (Sonar #771 : complexite
         * cognitive 35 > 15). Elles sont pures : memes entrees, memes
         * branches, memes sorties qu'en ligne.
         *
         * @description
         * `bgIntentFg` — quand le fond vient d'une intention, on connait le
         * token fg apparie : on le retient pour qu'un `color` absent retombe
         * sur cette paire (auto-contraste interne au design-system, sans
         * passer par `getForeground`).
         *
         * @description
         * `bgDeclOverride` ECRASE le fond, il ne s'y ajoute pas : un degrade
         * de premier plan detourne `background-image` et l'emporte sur la
         * surface, exactement comme l'affectation en ligne le faisait.
         ********************************************************/
        const [bgDeclBase, bgIntentFg, bgIsGradient] = resolveBackground(bgColor.value, bgRole)
        const [fgDecl, bgDeclOverride, clipText] = resolveForeground(
            color.value,
            bgColor.value,
            bgIntentFg,
            bgIsGradient
        )
        const bgDecl = bgDeclOverride ?? bgDeclBase

        const styles: string[] = []
        if (bgDecl) styles.push(bgDecl)
        if (fgDecl) styles.push(fgDecl)
        if (clipText) {
            styles.push('background-clip: text')
            styles.push('-webkit-background-clip: text')
        }
        return styles
    })

    return {colorClasses, colorStyles, color, bgColor}
}
