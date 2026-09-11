// Minimal SCSS structural scanner — NOT a full parser. It knows just enough
// to answer one question reliably: "for this block of SCSS, which `{ … }`
// rule blocks have a selector/header containing a given substring, and what
// is the exact character range of each such block (including nested
// sub-blocks)?"
//
// Three things a naive brace-counter gets wrong on real origam SCSS, all
// handled explicitly below:
//   1. `#{$this}` SCSS interpolation contains `{` / `}` that are NOT rule
//      braces (`&#{$this}--active { … }` is one selector, not two blocks).
//   2. String literals (`content: '{'`) could contain stray braces.
//   3. `//` line comments and `/* */` block comments must not contribute
//      false selector text or unbalance the brace count.

export function stripComments (content) {
    let out = ''
    let i = 0
    const n = content.length
    while (i < n) {
        if (content[i] === '/' && content[i + 1] === '/') {
            while (i < n && content[i] !== '\n') { out += ' '; i++ }
            continue
        }
        if (content[i] === '/' && content[i + 1] === '*') {
            out += '  '
            i += 2
            while (i < n && !(content[i] === '*' && content[i + 1] === '/')) {
                out += content[i] === '\n' ? '\n' : ' '
                i++
            }
            out += '  '
            i += 2
            continue
        }
        out += content[i]
        i++
    }
    return out
}

// Returns [{ openIndex, closeIndex, header }] for every `{ … }` block in the
// (comment-stripped) content, at every nesting depth.
export function findBlocks (content) {
    const blocks = []
    const stack = []
    let buffer = ''
    let i = 0
    const n = content.length

    while (i < n) {
        const ch = content[i]

        // SCSS interpolation `#{...}` — opaque, does not affect rule depth.
        if (ch === '#' && content[i + 1] === '{') {
            let depth = 1
            let j = i + 2
            buffer += '#{'
            while (j < n && depth > 0) {
                if (content[j] === '{') depth++
                else if (content[j] === '}') depth--
                buffer += content[j]
                j++
            }
            i = j
            continue
        }

        // String literals — opaque.
        if (ch === '\'' || ch === '"') {
            const quote = ch
            buffer += ch
            let j = i + 1
            while (j < n && content[j] !== quote) { buffer += content[j]; j++ }
            buffer += content[j] ?? ''
            i = j + 1
            continue
        }

        if (ch === '{') {
            stack.push({ header: buffer.trim(), openIndex: i })
            buffer = ''
            i++
            continue
        }

        if (ch === '}') {
            const open = stack.pop()
            if (open) {
                blocks.push({ openIndex: open.openIndex, closeIndex: i, header: open.header })
            }
            buffer = ''
            i++
            continue
        }

        if (ch === ';') {
            buffer = ''
            i++
            continue
        }

        buffer += ch
        i++
    }

    return blocks
}

export function lineOf (content, offset) {
    let line = 1
    for (let i = 0; i < offset && i < content.length; i++) {
        if (content[i] === '\n') line++
    }
    return line
}
