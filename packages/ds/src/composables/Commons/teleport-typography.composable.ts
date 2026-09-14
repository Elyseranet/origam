import {
    TELEPORT_TYPOGRAPHY_MEASURE_SELECTOR,
    TELEPORT_TYPOGRAPHY_NEUTRAL_FONT_SIZE
} from '../../consts/Commons/teleport-typography.const'

import { nextTick, ref, watch } from 'vue'

import type { Ref } from 'vue'

/*********************************************************
 * useTeleportTypography
 *
 * @description
 * Fait passer la typographie REELLE d'un champ (mesuree via
 * `getComputedStyle`, pas les props — les props ne voient pas le
 * stylesheet du consommateur) vers une surface teleportee (menu de
 * Select, calendrier de DatePickerField…), qui sinon ne recoit ni les
 * regles CSS ecrites contre le champ (le selecteur ne matche pas hors du
 * sous-arbre) ni un `font-size` `rem`-based coherent (un `rem` descendant
 * se resout contre la racine du document, pas contre l'ancetre
 * teleporte). Republie `font-family`/`font-size`/`letter-spacing` en CSS
 * generique PLUS les tokens specifiques de la surface via `extraVars`.
 *
 * @description
 * Mesure sur `.origam-field` (pas le `<input>` brut, qui sur
 * ColorPickerField/DatePickerField est hors flux et rend la police par
 * defaut du NAVIGATEUR, sans rapport avec le design system). Quand la
 * taille mesuree egale `neutralFontSize` (defaut `'16px'`, la valeur non
 * stylee de `.origam-field`), `typographyStyles` reste VIDE — chaque
 * surface garde alors son propre defaut historique (`.75rem` liste,
 * `.85rem` calendrier) au lieu d'etre forcee a 16px a chaque ouverture.
 * Seule une divergence REELLE (stylesheet consommateur, wrapper de champ
 * different) republie les tokens. Origine : `OrigamSelect` (commit
 * `8354407c`), extrait ici pour eviter la reimplementation.
 ********************************************************/
export function useTeleportTypography (
    fieldRef: Ref<{ $el?: HTMLElement } | undefined>,
    isOpen: Ref<boolean>,
    extraVars: (fontSize: string) => Record<string, string>,
    measureSelector = TELEPORT_TYPOGRAPHY_MEASURE_SELECTOR,
    neutralFontSize: string = TELEPORT_TYPOGRAPHY_NEUTRAL_FONT_SIZE
) {
    const typographyStyles = ref<Record<string, string>>({})

    const fieldElement = () => {
        const root = fieldRef.value?.$el

        if (!root || typeof root.querySelector !== 'function') return undefined

        return (root.querySelector(measureSelector) ?? root) as HTMLElement
    }

    const sync = () => {
        const el = fieldElement()

        if (!el || typeof window === 'undefined') return

        const styles = window.getComputedStyle(el)
        const fontSize = styles.fontSize

        if (!fontSize) return

        // Nothing diverges from the design system's own unstyled baseline —
        // leave every surface at its OWN historical default rather than
        // forcing it to the neutral size on every open.
        if (fontSize === neutralFontSize) {
            typographyStyles.value = {}

            return
        }

        typographyStyles.value = {
            'font-family': styles.fontFamily,
            'font-size': fontSize,
            'letter-spacing': styles.letterSpacing,
            ...extraVars(fontSize)
        }
    }

    watch(isOpen, (open) => {
        if (open) nextTick(sync)
    })

    return { typographyStyles }
}
