/**
 * Catalogue of CSS feature-detection queries consumed by `useCssSupport`.
 *
 * Each entry maps a stable feature name (used as the public key on the
 * returned `css` reactive map) to the exact argument passed to
 * `CSS.supports(...)`. Two shapes are valid:
 *
 *   • A property/value pair (e.g. `'display: grid'`) — `CSS.supports`
 *     evaluates whether the parsed declaration is recognised.
 *
 *   • A `selector(...)` / `at-rule(...)` wrapper — supported by modern
 *     `CSS.supports()` for at-rule and selector-level detection (e.g.
 *     `'selector(:has(*))'` to gate behaviour on `:has()` parsing).
 *
 * `as const satisfies` locks the literal types so the derived
 * `TCssFeatureName = keyof typeof FEATURE_QUERIES` stays narrow.
 */
export const FEATURE_QUERIES = {
    grid:                 'display: grid',
    subgrid:              'grid-template-columns: subgrid',
    flexGap:              'gap: 1px',
    containerQueries:     '(container-type: inline-size)',
    has:                  'selector(:has(*))',
    aspectRatio:          'aspect-ratio: 1',
    colorMix:             'color: color-mix(in srgb, red, blue)',
    accentColor:          'accent-color: red',
    minMaxClamp:          'width: min(10px, 20px)',
    mathFunctions:        'width: calc(min(10px, 20px) + max(5px, 8px))',
    anchorPositioning:    'anchor-name: --foo',
    scrollDrivenAnims:    'animation-timeline: scroll()',
    viewTransitions:      'view-transition-name: foo',
    nestedSelectors:      'selector(& > a)',
    individualTransforms: 'translate: 1px 1px',
    logicalProperties:    'margin-inline: 1px',
    backdropFilter:       'backdrop-filter: blur(1px)',
    fieldSizing:          'field-sizing: content',
    textWrapBalance:      'text-wrap: balance',
    contentVisibility:    'content-visibility: auto',
    masonry:              'grid-template-rows: masonry'
} as const satisfies Record<string, string>
