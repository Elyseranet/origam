// #1398 — the radius regexes are now assembled from shared fragments. Pin them
// against the original literals, on a corpus covering accepted + rejected shapes.

import { describe, expect, it } from 'vitest'

import { BORDER_RADIUS_REGEX, CUSTOM_BORDER_RADIUS_REGEX } from '@origam/consts/Commons/rounded.const'
import { MARGIN_REGEX } from '@origam/consts/Commons/margin.const'

const OLD_BORDER = /^(?<radius>(?: ?(?:0|(?:[0-9]+(?:\.[0-9]+)?)(?:px|pt|PC|in|cm|mm|em|rem|%|ex|ch|fr))){0,4})$/
const OLD_CUSTOM = /^(?:var|calc|clamp|min|max|env)\(.*\)$|^-?(?:0|[0-9]*\.?[0-9]+)(?:px|pt|pc|in|cm|mm|q|em|rem|ex|ch|cap|ic|lh|rlh|vw|vh|vi|vb|vmin|vmax|%)$/i
const OLD_MARGIN = /^(?<margin>(?: ?(?:[0-9]+)(?:px|pt|PC|in|cm|mm|em|rem|%|ex|ch|fr)){0,4})$/

const CORPUS = [
    '', '0', '4px', '4px 0 4px 0', '4px 4px 0 0', '1.5rem', '1.5', '.5rem', '5.', '-4px', '4PX', '4pc', '4PC',
    '1 2', '4px  4px', '4px 4px 4px 4px 4px', '0 0', '0px', 'var(--x)', 'var(--x, 8px)', 'VAR(--x)', 'calc(1rem + 2px)',
    'clamp(4px, 1vw, 16px)', '12vw', '-12VW', '.5q', '-.5em', '0em', 'env(safe-area-inset-top)', 'foo', 'large', '8 px',
    '٣px', 'var(--a)\nfoo', 'x(1)', '100%', '1e3px'
]

describe('radius / margin regexes — equivalence with the original literals (#1398)', () => {
    it.each(CORPUS)('BORDER_RADIUS_REGEX %j', (v) => {
        expect(BORDER_RADIUS_REGEX.exec(v)?.groups?.radius).toBe(OLD_BORDER.exec(v)?.groups?.radius)
        expect(BORDER_RADIUS_REGEX.test(v)).toBe(OLD_BORDER.test(v))
    })
    it.each(CORPUS)('CUSTOM_BORDER_RADIUS_REGEX %j', (v) => {
        expect(CUSTOM_BORDER_RADIUS_REGEX.test(v)).toBe(OLD_CUSTOM.test(v))
    })
    it.each(CORPUS)('MARGIN_REGEX %j', (v) => {
        expect(MARGIN_REGEX.test(v)).toBe(OLD_MARGIN.test(v))
    })
})
