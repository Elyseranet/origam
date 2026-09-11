import type { IMaskApplyResult, IMaskToken } from '../../interfaces'

/**
 * Token-walker that converts a raw input string into a
 * formatted display string for a given mask pattern.
 *
 * Algorithm — single forward pass, O(n + m):
 *
 *   1. Parse the pattern into tokens (consumer slots vs
 *      literals). Cached per pattern.
 *   2. Strip every literal from the raw input — the user
 *      may have pasted "06.12.34.56.78" and we want only
 *      "0612345678" before reapplying our own literals.
 *   3. Walk the tokens left-to-right:
 *        - literal      → output the literal, do NOT
 *                         consume input.
 *        - digit slot   → consume next digit (skip non-
 *                         digit chars silently).
 *        - letter slot  → consume next letter, skip the
 *                         rest.
 *        - any slot     → consume the next input char.
 *      Stop when input is exhausted.
 *   4. Report `complete` if every consumer slot was filled.
 *
 * Skipped characters are dropped silently. This matches
 * imask.js / cleave.js behaviour and keeps the typing
 * experience non-surprising — a digit-only field rejects
 * letters as you'd expect.
 */

/**
 * Set of pattern → tokens cache. Most apps reuse a handful
 * of patterns; parsing once per pattern is cheap.
 */
const TOKEN_CACHE = new Map<string, Array<IMaskToken>>()

export function parsePattern (pattern: string): Array<IMaskToken> {
    if (TOKEN_CACHE.has(pattern)) {
        return TOKEN_CACHE.get(pattern)!
    }

    const tokens: Array<IMaskToken> = []
    for (const char of pattern) {
        if (char === '#') {
            tokens.push({kind: 'digit', char: '#', consumer: true})
        } else if (char === 'A') {
            tokens.push({kind: 'letter', char: 'A', consumer: true})
        } else if (char === '*') {
            tokens.push({kind: 'any', char: '*', consumer: true})
        } else {
            tokens.push({kind: 'literal', char, consumer: false})
        }
    }

    TOKEN_CACHE.set(pattern, tokens)
    return tokens
}

const isDigit = (c: string): boolean => c >= '0' && c <= '9'
const isLetter = (c: string): boolean =>
    (c >= 'a' && c <= 'z') || (c >= 'A' && c <= 'Z')

/**
 * Returns the set of literal characters used in a pattern.
 * Cached. Used to strip literals from the input before
 * walking — required when the user pastes a value that
 * already contains separators ("06 12 …" or "06.12.…").
 */
const LITERALS_CACHE = new Map<string, Set<string>>()
function literalSetOf (pattern: string): Set<string> {
    if (LITERALS_CACHE.has(pattern)) return LITERALS_CACHE.get(pattern)!
    const set = new Set<string>()
    for (const tok of parsePattern(pattern)) {
        if (!tok.consumer) set.add(tok.char)
    }
    LITERALS_CACHE.set(pattern, set)
    return set
}

/**
 * Strip every literal-character occurrence from the raw
 * input. We also strip the most common "alien" separators
 * a human might type (`.` `,` `_`) so paste handling stays
 * forgiving. Consumer slots receive whatever survives.
 */
function stripLiterals (raw: string, pattern: string): string {
    const literals = literalSetOf(pattern)
    let out = ''
    for (const c of raw) {
        if (literals.has(c)) continue
        out += c
    }
    return out
}

/**
 * Walk the pattern and consume the (pre-stripped) input
 * char-by-char. Mismatching characters are dropped.
 */
export function applyMask (value: string, pattern: string): IMaskApplyResult {
    if (!pattern) {
        return {masked: value ?? '', unmasked: value ?? '', complete: false}
    }

    const tokens = parsePattern(pattern)
    const stripped = stripLiterals(value ?? '', pattern)

    let masked = ''
    let unmasked = ''
    let consumed = 0
    let filledConsumers = 0
    const totalConsumers = tokens.reduce(
        (acc, t) => acc + (t.consumer ? 1 : 0),
        0
    )

    for (const tok of tokens) {
        if (!tok.consumer) {
            // Literal — only emitted while we still have
            // value to potentially append after it.
            if (consumed < stripped.length || unmasked.length > 0) {
                masked += tok.char
            }
            continue
        }

        // Consumer — find the next character that matches
        // this slot's kind. Skip mismatches silently.
        let matched: string | null = null
        while (consumed < stripped.length) {
            const c = stripped[consumed++]
            if (tok.kind === 'digit' && isDigit(c)) {
                matched = c
                break
            }
            if (tok.kind === 'letter' && isLetter(c)) {
                matched = c
                break
            }
            if (tok.kind === 'any') {
                matched = c
                break
            }
            // mismatch → drop silently and keep walking
        }

        if (matched === null) {
            // exhausted input before filling this slot
            break
        }

        masked += matched
        unmasked += matched
        filledConsumers++
    }

    const complete = filledConsumers === totalConsumers && totalConsumers > 0

    return {masked, unmasked, complete}
}

/**
 * Returns just the unmasked value — handy from outside
 * code that already knows its mask but only wants the
 * raw characters.
 */
export function unmaskValue (value: string, pattern: string): string {
    return applyMask(value, pattern).unmasked
}
