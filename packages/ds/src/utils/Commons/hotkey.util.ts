import { KEYBOARD_ALIASES } from '../../consts/Commons/hotkey.const'
import { consoleWarn } from './console.util'

/*********************************************************
 * hasInvalidCombinationStructure
 *
 * @description
 * Does the combination string break the structure rules (leading / trailing / doubled separators)?
 ********************************************************/
function hasInvalidCombinationStructure (combination: string): boolean {
    const startsWithPlusOrUnderscore = combination.startsWith('+') || combination.startsWith('_')

    const hasInvalidLeadingSeparator = (
        // Starts with a single '+' or '_' followed by a non-separator character (e.g. '+a', '_a')
        startsWithPlusOrUnderscore &&
        !(combination.startsWith('++') || combination.startsWith('__'))
    )

    return (
        // Invalid leading separator patterns
        (combination.length > 1 && hasInvalidLeadingSeparator) ||
        // Disallow literal + or _ keys (they require shift)
        combination.includes('++') || combination.includes('__') ||
        combination === '+' || combination === '_' ||
        // Ends with a separator that is not part of a doubled literal
        (combination.length > 1 && (combination.endsWith('+') || combination.endsWith('_')) && combination.at(-2) !== combination.at(-1)) ||
        // Stand-alone doubled separators (dangling)
        combination === '++' || combination === '--' || combination === '__'
    )
}

/*********************************************************
 * parseCombinationKeys
 *
 * @description
 * Cut a (structurally valid) combination string into normalized keys.
 ********************************************************/
function parseCombinationKeys (combination: string): string[] {
    const keys: string[] = []
    let buffer = ''

    const flushBuffer = () => {
        if (buffer) {
            keys.push(normalizeKey(buffer))
            buffer = ''
        }
    }

    for (let i = 0; i < combination.length; i++) {
        const char = combination[i]
        const nextChar = combination[i + 1]
        const isSeparator = char === '+' || char === '_' || char === '-'

        if (isSeparator && char === nextChar) {
            flushBuffer()
            keys.push(char)
            i++
        } else if (char === '+' || char === '_') {
            flushBuffer()
        } else {
            buffer += char
        }
    }
    flushBuffer()

    return keys
}

/**
 * Splits a single combination string into individual key parts.
 *
 * A combination is a set of keys that must be pressed simultaneously.
 * e.g. `ctrl+k`, `shift--`
 */
export function splitKeyCombination (combination: string, isInternal = false): string[] {
    if (!combination) {
        if (!isInternal) consoleWarn('Invalid hotkey combination: empty string provided')
        return []
    }

    const warnInvalidStructure = () => {
        if (!isInternal) consoleWarn(`Invalid hotkey combination: "${combination}" has invalid structure`)
        return []
    }

    if (hasInvalidCombinationStructure(combination)) return warnInvalidStructure()

    const keys = parseCombinationKeys(combination)

    // Within a combination, `-` is only valid as a literal key (e.g., `ctrl+-`).
    // `-` cannot be part of a longer key name within a combination.
    const hasInvalidMinus = keys.some(key => key.length > 1 && key.includes('-') && key !== '--')
    if (hasInvalidMinus) return warnInvalidStructure()

    if (keys.length === 0 && combination) {
        return [normalizeKey(combination)]
    }

    return keys
}

/*********************************************************
 * hasInvalidSequenceEdges
 *
 * @description
 * A sequence is invalid if it starts or ends with a separator, unless it is part of a combination (e.g. `shift+-`).
 ********************************************************/
function hasInvalidSequenceEdges (str: string): boolean {
    const hasInvalidStart = str.startsWith('-') && !['---', '--+'].includes(str)
    const hasInvalidEnd = str.endsWith('-') && !str.endsWith('+-') && !str.endsWith('_-') && str !== '-' && str !== '---'

    return hasInvalidStart || hasInvalidEnd
}

/*********************************************************
 * isHyphenInCombination
 *
 * @description
 * Is the hyphen at `i` part of the current combination (e.g. the `-` of `ctrl+-`)?
 ********************************************************/
function isHyphenInCombination (str: string, i: number): boolean {
    const prevChar = str[i - 1]
    const prevPrevChar = i > 1 ? str[i - 2] : undefined

    return (prevChar === '+' || prevChar === '_') && prevPrevChar !== '+'
}

/*********************************************************
 * tokenizeSequence
 *
 * @description
 * Cut the sequence string on its separator hyphens.
 ********************************************************/
function tokenizeSequence (str: string): string[] {
    const result: string[] = []
    let buffer = ''

    for (let i = 0; i < str.length; i++) {
        const char = str[i]

        if (char !== '-' || isHyphenInCombination(str, i)) {
            // Part of the current combination (e.g., 'ctrl+-')
            buffer += char
        } else if (buffer) {
            // Sequence separator
            result.push(buffer)
            buffer = ''
        } else {
            // Empty buffer means we have a literal '-' key
            result.push('-')
        }
    }

    // Add final buffer if it exists
    if (buffer) {
        result.push(buffer)
    }

    return result
}

/*********************************************************
 * collapseMinusRuns
 *
 * @description
 * Collapse runs of '-' so that every second '-' is removed.
 ********************************************************/
function collapseMinusRuns (parts: string[]): string[] {
    const collapsed: string[] = []
    let minusCount = 0

    for (const part of parts) {
        if (part === '-') {
            if (minusCount % 2 === 0) collapsed.push('-')
            minusCount++
        } else {
            minusCount = 0
            collapsed.push(part)
        }
    }

    return collapsed
}

/**
 * Splits a hotkey string into its constituent combination groups.
 *
 * A sequence is a series of combinations that must be pressed in order.
 * e.g. `a-b`, `ctrl+k-p`
 */
export function splitKeySequence (str: string): string[] {
    if (!str) {
        consoleWarn('Invalid hotkey sequence: empty string provided')
        return []
    }

    if (hasInvalidSequenceEdges(str)) {
        consoleWarn(`Invalid hotkey sequence: "${str}" contains invalid combinations`)
        return []
    }

    const collapsed = collapseMinusRuns(tokenizeSequence(str))

    // Validate that each part of the sequence is a valid combination
    const areAllValid = collapsed.every(s => splitKeyCombination(s, true).length > 0)

    if (!areAllValid) {
        consoleWarn(`Invalid hotkey sequence: "${str}" contains invalid combinations`)
        return []
    }

    return collapsed
}

/**
 * Normalizes a key string to its canonical form using the alias map.
 *
 * @param key - The key string to normalize
 * @returns The canonical key name in lowercase
 */
export function normalizeKey (key: string): string {
    const lowerKey = key.toLowerCase()
    return KEYBOARD_ALIASES[lowerKey] || lowerKey
}
