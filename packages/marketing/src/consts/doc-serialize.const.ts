/**
 * doc-serialize.const.ts — static values of the doc serializer (scripts/serialize.mjs).
 */

export const IND = '    '

// Tokens the Nuxt SSR build statically replaces (e.g. `typeof window` ->
// "undefined"). When such a token appears verbatim INSIDE a documentation
// code string, @rollup/plugin-replace corrupts it ('"undefined" !== ...') and
// the server bundle fails to parse. We emit the token via a `${'…'}`
// interpolation so the rendered text is identical but the contiguous token
// never exists in the module source for the replacer to match.
export const SSR_REPLACED_TOKENS = ['typeof window', 'typeof document']
