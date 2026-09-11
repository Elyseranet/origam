/**
 * Subsequence-based fuzzy matcher used by `OrigamCommandPalette`.
 *
 * Why not `fuse.js` / `match-sorter`?
 *
 * The palette only ranks a small (~hundreds) list of registered commands
 * whose haystacks are short labels + a handful of keywords. A subsequence
 * matcher with a tiny scoring heuristic gives us:
 *
 *   - zero runtime dependency,
 *   - deterministic O(haystack-length) ranking,
 *   - predictable behaviour for unit tests.
 *
 * Algorithm — for each command:
 *
 *   1. Build the haystack as `label + ' ' + (keywords ?? []).join(' ') +
 *      ' ' + (description ?? '')`, all lowercased.
 *   2. Walk the lowercased query character-by-character against the
 *      haystack. If we cannot find every query character in order, the
 *      command does not match.
 *   3. Score = consecutive-run weight + label-position bonus + label-prefix
 *      bonus. Higher is better. Ties are broken by registration order
 *      (caller controlled).
 *
 * The function is pure — no side effects, no Vue reactivity. Safe to call
 * inside a `computed`.
 */

/**
 * Output of `fuzzyMatch` — the matched item carries its score so callers
 * can short-circuit a re-sort on cached input.
 */
export interface IFuzzyMatchResult<T> {
    /** Original item passed in. */
    item: T
    /** Higher = better fit. `0` is the floor for a successful match. */
    score: number
}

/**
 * Bonus weights — tuned by hand against typical command-palette
 * haystacks. Keep them small integers so the score stays inspectable
 * in unit-test failures.
 */
const SCORE_CONSECUTIVE = 4
const SCORE_FIRST_LABEL_POS = 30
const SCORE_LABEL_PREFIX = 50

/**
 * Lowercase `value` once and memoise — the matcher hits the same
 * haystack for every query keystroke. We cache per-call to avoid
 * mutating module state (tests run in parallel and a singleton cache
 * would cause cross-spec contamination).
 */
const lower = (value: string): string => value.toLowerCase()

/**
 * Returns `true` if every character of `query` appears, in order, in
 * `haystack`. Both inputs MUST be lowercased — the function does not
 * apply `toLowerCase()` itself for performance reasons.
 */
const isSubsequence = (query: string, haystack: string): boolean => {
    if (query.length === 0) return true
    if (haystack.length === 0) return false

    let qi = 0

    for (let hi = 0; hi < haystack.length; hi++) {
        if (haystack.charAt(hi) === query.charAt(qi)) {
            qi += 1

            if (qi === query.length) return true
        }
    }

    return false
}

/**
 * Score a single (query, haystack, label) triple. `haystack` is the
 * combined search space; `label` is used independently for the
 * prefix / first-position bonuses (we want "Settings" to outrank
 * "Reset password" for query "set" even though both subseqs match).
 */
const scoreOne = (query: string, label: string, haystack: string): number => {
    if (query.length === 0) return 0

    let qi = 0
    let consecutive = 0
    let bestConsecutive = 0
    let lastMatchIdx = -1

    for (let hi = 0; hi < haystack.length; hi++) {
        if (haystack.charAt(hi) === query.charAt(qi)) {
            if (hi === lastMatchIdx + 1) {
                consecutive += 1
            } else {
                consecutive = 1
            }

            if (consecutive > bestConsecutive) bestConsecutive = consecutive

            lastMatchIdx = hi
            qi += 1

            if (qi === query.length) break
        }
    }

    let score = bestConsecutive * SCORE_CONSECUTIVE

    const firstLabelHit = label.indexOf(query.charAt(0))

    if (firstLabelHit !== -1) {
        // Higher reward for first-char match early in the label.
        score += Math.max(0, SCORE_FIRST_LABEL_POS - firstLabelHit)

        if (label.startsWith(query)) {
            score += SCORE_LABEL_PREFIX
        }
    }

    return score
}

/**
 * Filter `items` to those whose composite haystack contains the
 * query as a subsequence, and rank them by score (descending).
 *
 * - When `query` is empty, returns every item with `score=0` in the
 *   input order (stable). The caller is expected to handle grouping
 *   on top of this.
 * - The comparator is `(b.score - a.score)`; equal scores fall back
 *   to the original index so order is deterministic.
 */
export function fuzzyMatch<T> (
    items: ReadonlyArray<T>,
    query: string,
    getHaystack: (item: T) => { label: string, haystack: string }
): Array<IFuzzyMatchResult<T>> {
    const q = lower(query.trim())

    if (q.length === 0) {
        return items.map((item) => ({ item, score: 0 }))
    }

    const matched: Array<IFuzzyMatchResult<T> & { idx: number }> = []

    for (let i = 0; i < items.length; i++) {
        const { label, haystack } = getHaystack(items[i])
        const lcLabel = lower(label)
        const lcHaystack = lower(haystack)

        if (!isSubsequence(q, lcHaystack)) continue

        const score = scoreOne(q, lcLabel, lcHaystack)
        matched.push({ item: items[i], score, idx: i })
    }

    matched.sort((a, b) => (b.score - a.score) || (a.idx - b.idx))

    return matched.map(({ item, score }) => ({ item, score }))
}
