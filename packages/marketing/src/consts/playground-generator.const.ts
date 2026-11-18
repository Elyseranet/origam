/**
 * playground-generator.const.ts — static tables of the playground generator (scripts/generate-playgrounds.mjs).
 */

export const EXCLUDED_PROPS = new Set([
    'tag', 'to', 'href', 'target', 'rel', 'style', 'class', 'id',
    'ripple', 'eager', 'transition', 'reverseTransition',
    'ariaLabel', 'role', 'tabIndex', 'value',
])

export const SKIP_TYPE_SLUGS = new Set([
    'loading-value', 'route-location-raw', 'theme',
    'css-value', 'css-class',
])

export const CURATED_TYPE_OPTIONS = Object.freeze({
    color: {
        kind: 'select',
        options: [
            { label: '(none)', value: '' },
            { label: 'primary',   value: 'primary' },
            { label: 'secondary', value: 'secondary' },
            { label: 'success',   value: 'success' },
            { label: 'danger',    value: 'danger' },
            { label: 'warning',   value: 'warning' },
            { label: 'info',      value: 'info' },
        ],
        defaultValue: '',
    },
    icon: {
        kind: 'select',
        options: [
            { label: '(none)',        value: '' },
            { label: 'mdi-star',      value: 'mdi-star' },
            { label: 'mdi-account',   value: 'mdi-account' },
            { label: 'mdi-check',     value: 'mdi-check' },
            { label: 'mdi-home',      value: 'mdi-home' },
            { label: 'mdi-close',     value: 'mdi-close' },
        ],
        defaultValue: '',
    },
})

export const PROP_PRIORITY = Object.freeze({
    variant:      1,
    color:        2,
    bgColor:      3,
    size:         4,
    density:      5,
    status:       6,
    align:        7,
    justify:      8,
    position:     9,
    rounded:     10,
    elevation:   11,
    prependIcon: 12,
    appendIcon:  13,
    // boolean switches
    disabled:    20,
    loading:     21,
    readonly:    22,
    closable:    23,
    modelValue:  24,
    active:      25,
    block:       26,
    flat:        27,
    slim:        28,
    stacked:     29,
    // text inputs (lowest priority — added only if slots remain)
    title:       40,
    text:        41,
    label:       42,
    placeholder: 43,
    subtitle:    44,
})

export const PROP_LABELS = Object.freeze({
    variant:     'Variant',
    color:       'Color / Intent',
    bgColor:     'Background color',
    size:        'Size',
    density:     'Density',
    status:      'Status',
    rounded:     'Rounded',
    elevation:   'Elevation',
    prependIcon: 'Prepend icon',
    appendIcon:  'Append icon',
    disabled:    'Disabled',
    loading:     'Loading',
    readonly:    'Read-only',
    closable:    'Closable',
    modelValue:  'Value',
    active:      'Active',
    block:       'Block',
    flat:        'Flat',
    slim:        'Slim',
    stacked:     'Stacked',
    align:       'Align',
    justify:     'Justify',
    position:    'Position',
    title:       'Title',
    text:        'Text',
    label:       'Label',
    placeholder: 'Placeholder',
    subtitle:    'Subtitle',
})

// Simple string props worth exposing as a text control (low priority)
export const TEXT_PROPS = new Set(['title', 'text', 'label', 'placeholder', 'subtitle'])
