import { MaybeRef, onBeforeUnmount, toValue, watch } from "vue"
import { IN_BROWSER } from '../../consts/Commons/commons.const'
import {
    HOTKEY_NO_AUTO_CLEANUP_WARNING,
    HOTKEY_SEQUENCE_TIMEOUT,
    KEYBOARD_MODIFIERS,
    MACINTOSH_UA_TOKEN
} from '../../consts/Commons/hotkey.const'
import { IHotkeyOptions } from '../../interfaces/Commons/hotkey.interface'
import { TKeyboardModifiers } from '../../types/Commons/hotkey.type'
import { consoleWarn } from '../../utils/Commons/console.util'
import { getCurrentInstance } from '../../utils/Commons/getCurrentInstance.util'
import { splitKeyCombination, splitKeySequence } from '../../utils/Commons/hotkey.util'

/*********************************************************
 * useHotkey
 *
 * @description
 * Enregistre un raccourci clavier global (`window.addEventListener`) pour
 * `keys` (une combinaison `"ctrl+k"` ou une SEQUENCE `"g g"` separee par
 * espace, avec un `sequenceTimeout` entre chaque groupe). Traduit `cmd`/`meta`
 * selon la plateforme detectee (`navigator.userAgent`) : `ctrl` attendu sur
 * non-Mac, `meta` attendu sur Mac. Ignore l'evenement quand un champ de
 * saisie a le focus, sauf `options.inputs`.
 *
 * @description
 * ⛔ En dehors d'un contexte `setup()` Vue, AUCUN nettoyage automatique
 * n'est enregistre (pas de `onBeforeUnmount` possible) — un
 * `console.warn` (`HOTKEY_NO_AUTO_CLEANUP_WARNING`) le signale, et
 * l'appelant DOIT invoquer lui-meme la fonction `cleanup` retournee.
 * Hors navigateur (`!IN_BROWSER`), la fonction est un no-op immediat, y
 * compris pour le retour (fonction vide, pas d'erreur).
 ********************************************************/
export function useHotkey (
    keys: MaybeRef<string | undefined>,
    callback: (e: KeyboardEvent) => void,
    options: IHotkeyOptions = {}
) {
    if (!IN_BROWSER) return function () {
    }

    const {
        event = 'keydown',
        inputs = false,
        preventDefault = true,
        sequenceTimeout = HOTKEY_SEQUENCE_TIMEOUT
    } = options

    const isMac = navigator?.userAgent?.includes(MACINTOSH_UA_TOKEN) ?? false
    let timeout = 0
    let keyGroups: string[]
    let isSequence = false
    let groupIndex = 0

    const clearTimer = () => {
        if (!timeout) return

        clearTimeout(timeout)
        timeout = 0
    }

    const isInputFocused = () => {
        if (toValue(inputs)) return false

        const activeElement = document.activeElement as HTMLElement

        return activeElement && (
            activeElement.tagName === 'INPUT' ||
            activeElement.tagName === 'TEXTAREA' ||
            activeElement.isContentEditable ||
            activeElement.contentEditable === 'true'
        )
    }

    const resetSequence = () => {
        groupIndex = 0
        clearTimer()
    }

    const handler = (e: KeyboardEvent) => {
        const group = keyGroups[groupIndex]

        if (!group || isInputFocused()) return

        if (!matchesKeyGroup(e, group)) {
            if (isSequence) resetSequence()
            return
        }

        if (toValue(preventDefault)) e.preventDefault()

        if (!isSequence) {
            callback(e)
            return
        }

        clearTimer()
        groupIndex++

        if (groupIndex === keyGroups.length) {
            callback(e)
            resetSequence()
            return
        }

        timeout = window.setTimeout(resetSequence, toValue(sequenceTimeout))
    }

    const cleanup = () => {
        window.removeEventListener(toValue(event), handler)
        clearTimer()
    }

    watch(() => toValue(keys), function (unrefKeys) {
        cleanup()

        if (unrefKeys) {
            const groups = splitKeySequence(unrefKeys.toLowerCase())
            isSequence = groups.length > 1
            keyGroups = groups
            resetSequence()
            window.addEventListener(toValue(event), handler)
        }
    }, {immediate: true})

    // Watch for changes in the event type to re-register the listener
    watch(() => toValue(event), function (newEvent, oldEvent) {
        if (oldEvent && keyGroups && keyGroups.length > 0) {
            window.removeEventListener(oldEvent, handler)
            window.addEventListener(newEvent, handler)
        }
    })

    try {
        getCurrentInstance('useHotkey')
        onBeforeUnmount(cleanup)
    } catch {
        // Not in Vue setup context
        consoleWarn(HOTKEY_NO_AUTO_CLEANUP_WARNING)
    }

    const parseKeyGroup = (group: string) => {
        // Use the shared combination splitting logic
        const parts = splitKeyCombination(group.toLowerCase())

        // If the combination is invalid, return empty result
        if (parts.length === 0) {
            return {modifiers: Object.fromEntries(KEYBOARD_MODIFIERS.map((m) => [m, false])), actualKey: undefined}
        }

        const modifiers = Object.fromEntries(KEYBOARD_MODIFIERS.map((m) => [m, false])) as Record<string, boolean>
        let actualKey: string | undefined

        for (const part of parts) {
            if (KEYBOARD_MODIFIERS.includes(part as TKeyboardModifiers)) {
                modifiers[part] = true
            } else {
                actualKey = part
            }
        }

        return {modifiers, actualKey}
    }

    const matchesKeyGroup = (e: KeyboardEvent, group: string) => {
        const {modifiers, actualKey} = parseKeyGroup(group)

        const expectCtrl = modifiers.ctrl || (!isMac && (modifiers.cmd || modifiers.meta))
        const expectMeta = isMac && (modifiers.cmd || modifiers.meta)

        return (
            e.ctrlKey === expectCtrl &&
            e.metaKey === expectMeta &&
            e.shiftKey === modifiers.shift &&
            e.altKey === modifiers.alt &&
            e.key.toLowerCase() === actualKey?.toLowerCase()
        )
    }

    return cleanup
}
