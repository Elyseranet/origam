// Minimal `--origam-*` CSS custom-property scanner — NOT a full CSS parser.
// It answers two narrow questions reliably, shared by `token-var-channels.mjs`
// and its self-test:
//
//   1. findVarReads(content)        — every `var(--origam-…)` USE, with
//                                      whether it carries a fallback value.
//   2. findVarDeclarations(content) — every `--origam-…: …;` DECLARATION
//                                      (the left-hand side of a custom
//                                      property assignment).
//
// Both are paren-aware: a naive regex on `var\(--origam-[\w-]+` stops at the
// first `)`, which is wrong the moment a fallback itself contains a function
// call — `var(--x, color-mix(in srgb, var(--y), black 20%))` is a single
// read of `--x` with one fallback expression, not three reads. The origam
// SCSS uses exactly this nested shape (Pagination's hover/active rungs,
// EmptyState's per-density overrides), so paren-depth tracking is not an
// edge case here — it is the common case.
//
// Declaration vs. reference is disambiguated by position, not by guessing:
// a DECLARATION is `--name` immediately followed by `:` (CSS has no other
// construct that puts a colon directly after a custom-property token); a
// REFERENCE is `--name` inside a `var(...)` argument list, which never has
// a trailing colon. The two regexes never overlap on well-formed CSS/SCSS.

const VAR_NAME_RE = /^--origam-[A-Za-z0-9_-]+$/

// Returns [{ name, hasFallback, index }] for every `var(--origam-…)` call in
// `content`. `index` is the offset of the `var(` token, for line-number
// reporting by the caller. Non-origam custom properties (`var(--my-thing)`)
// are silently skipped — they are outside the token pipeline's contract.
export function findVarReads (content) {
    const reads = []
    const callRe = /var\(/g
    let m

    while ((m = callRe.exec(content))) {
        const openIdx = m.index + m[0].length - 1 // index of the "(" itself
        let i = openIdx + 1
        let depth = 1
        while (i < content.length && depth > 0) {
            if (content[i] === '(') depth++
            else if (content[i] === ')') depth--
            if (depth > 0) i++
        }
        const argsRaw = content.slice(openIdx + 1, i)

        // First TOP-LEVEL comma (depth 0 within the args) separates the var
        // name from its fallback. A comma inside a nested `fn(...)` must not
        // count — `color-mix(in srgb, var(--bg-base), black 20%)` has commas
        // that belong to `color-mix`, not to the outer `var(...)`.
        let commaIdx = -1
        let d2 = 0
        for (let j = 0; j < argsRaw.length; j++) {
            const c = argsRaw[j]
            if (c === '(') d2++
            else if (c === ')') d2--
            else if (c === ',' && d2 === 0) { commaIdx = j; break }
        }

        const nameRaw = (commaIdx === -1 ? argsRaw : argsRaw.slice(0, commaIdx)).trim()
        if (VAR_NAME_RE.test(nameRaw)) {
            reads.push({ name: nameRaw, hasFallback: commaIdx !== -1, index: m.index })
        }

        callRe.lastIndex = i + 1
    }

    return reads
}

// Returns [{ name, index }] for every `--origam-…:` DECLARATION in `content`.
// `(?!:)` excludes the (never-valid-here, but defensive) case of `--x::`.
export function findVarDeclarations (content) {
    const decls = []
    const declRe = /(--origam-[A-Za-z0-9_-]+)\s*:(?!:)/g
    let m
    while ((m = declRe.exec(content))) {
        decls.push({ name: m[1], index: m.index })
    }
    return decls
}
