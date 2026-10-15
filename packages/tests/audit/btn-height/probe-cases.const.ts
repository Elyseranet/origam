import type { IBtnProbeCase } from './probe-cases.interface'

/*********************************************************
 * BTN_PROBE_SIZES / BTN_PROBE_DENSITIES
 *
 * @description
 * Les valeurs reelles de `TSize` et `DENSITY` : la hauteur au repos est
 * `calc(var(--origam-btn---height) + var(--origam-btn---density))`, deux vars
 * reglees par instance — la matrice les croise donc toutes.
 ********************************************************/
export const BTN_PROBE_SIZES: readonly string[] = ['x-small', 'small', 'default', 'large', 'x-large']
export const BTN_PROBE_DENSITIES: readonly string[] = ['default', 'comfortable', 'compact']

export const BTN_PROBE_LABEL = 'Label'

/*********************************************************
 * BTN_PROBE_LONG_LABEL
 *
 * @description
 * Le libelle FR long du ticket #1093 : plus large qu'un conteneur de 320 px
 * sur une seule ligne.
 ********************************************************/
export const BTN_PROBE_LONG_LABEL = 'Enregistrer et continuer vers la page de confirmation de la commande'

export const BTN_PROBE_CONTAINER_WIDTH = 320

/*********************************************************
 * BTN_PROBE_REST_SHAPES
 *
 * @description
 * Les formes au repos croisees avec chaque taille x densite. Aucune ne porte
 * un contenu qui deborde : la hauteur de chacune DOIT rester identique avant
 * et apres #1094.
 ********************************************************/
export const BTN_PROBE_REST_SHAPES: ReadonlyArray<IBtnProbeCase> = [
    { key: 'label', props: {}, label: BTN_PROBE_LABEL, containerWidth: null },
    { key: 'prepend-icon', props: { prependIcon: 'mdi-home' }, label: BTN_PROBE_LABEL, containerWidth: null },
    { key: 'append-icon', props: { appendIcon: 'mdi-home' }, label: BTN_PROBE_LABEL, containerWidth: null },
    { key: 'icon-only', props: { icon: 'mdi-home' }, label: null, containerWidth: null },
    { key: 'stacked', props: { stacked: true, prependIcon: 'mdi-home' }, label: BTN_PROBE_LABEL, containerWidth: null },
    { key: 'slim', props: { slim: true }, label: BTN_PROBE_LABEL, containerWidth: null },
    { key: 'block', props: { block: true }, label: BTN_PROBE_LABEL, containerWidth: BTN_PROBE_CONTAINER_WIDTH },
    { key: 'outlined', props: { variant: 'outlined' }, label: BTN_PROBE_LABEL, containerWidth: null },
    { key: 'border', props: { border: 'thick' }, label: BTN_PROBE_LABEL, containerWidth: null },
    { key: 'loading', props: { loading: true }, label: BTN_PROBE_LABEL, containerWidth: null }
]

/*********************************************************
 * BTN_PROBE_STANDALONE_CASES
 *
 * @description
 * Les cas qui ne se croisent pas avec taille x densite : le libelle long
 * avec et sans `wrap` (#1093), un `height` explicite et un `max-height`
 * qui doivent continuer a gagner.
 ********************************************************/
export const BTN_PROBE_STANDALONE_CASES: readonly IBtnProbeCase[] = [
    { key: 'long-block', props: { block: true }, label: BTN_PROBE_LONG_LABEL, containerWidth: BTN_PROBE_CONTAINER_WIDTH },
    { key: 'long-block-wrap', props: { block: true, wrap: true }, label: BTN_PROBE_LONG_LABEL, containerWidth: BTN_PROBE_CONTAINER_WIDTH },
    { key: 'long-block-slim', props: { block: true, slim: true }, label: BTN_PROBE_LONG_LABEL, containerWidth: BTN_PROBE_CONTAINER_WIDTH },
    { key: 'long-block-slim-wrap', props: { block: true, slim: true, wrap: true }, label: BTN_PROBE_LONG_LABEL, containerWidth: BTN_PROBE_CONTAINER_WIDTH },
    { key: 'long-block-large-wrap', props: { block: true, wrap: true, size: 'large' }, label: BTN_PROBE_LONG_LABEL, containerWidth: BTN_PROBE_CONTAINER_WIDTH },
    { key: 'long-block-stacked-wrap', props: { block: true, stacked: true, wrap: true, prependIcon: 'mdi-home' }, label: BTN_PROBE_LONG_LABEL, containerWidth: BTN_PROBE_CONTAINER_WIDTH },
    { key: 'long-block-loading-wrap', props: { block: true, wrap: true, loading: true }, label: BTN_PROBE_LONG_LABEL, containerWidth: BTN_PROBE_CONTAINER_WIDTH },
    { key: 'short-wrap', props: { wrap: true }, label: BTN_PROBE_LABEL, containerWidth: null },
    { key: 'height-explicit', props: { height: 60 }, label: BTN_PROBE_LABEL, containerWidth: null },
    { key: 'height-explicit-long-wrap', props: { height: 60, block: true, wrap: true }, label: BTN_PROBE_LONG_LABEL, containerWidth: BTN_PROBE_CONTAINER_WIDTH },
    { key: 'padding-block-rest', props: { style: { '--origam-btn---padding-block': '4px' } }, label: BTN_PROBE_LABEL, containerWidth: null },
    { key: 'padding-block-icon', props: { icon: 'mdi-home', style: { '--origam-btn---padding-block': '8px' } }, label: null, containerWidth: null },
    { key: 'long-block-wrap-padding-block', props: { block: true, wrap: true, style: { '--origam-btn---padding-block': '8px' } }, label: BTN_PROBE_LONG_LABEL, containerWidth: BTN_PROBE_CONTAINER_WIDTH },
    { key: 'long-160-large', props: { size: 'large' }, label: BTN_PROBE_LONG_LABEL, containerWidth: 160 },
    { key: 'long-160-large-wrap', props: { size: 'large', wrap: true }, label: BTN_PROBE_LONG_LABEL, containerWidth: 160 },
    { key: 'long-160-large-wrap-padding-block', props: { size: 'large', wrap: true, style: { '--origam-btn---padding-block': '8px' } }, label: BTN_PROBE_LONG_LABEL, containerWidth: 160 },
    { key: 'height-explicit-min-zero', props: { style: { '--origam-btn---min-height': '0' } }, label: BTN_PROBE_LABEL, containerWidth: null },
    { key: 'height-explicit-min-zero-icon-xs-compact', props: { icon: 'mdi-home', size: 'x-small', density: 'compact', style: { '--origam-btn---min-height': '0', '--origam-btn---min-width': '0' } }, label: null, containerWidth: null },
    { key: 'height-explicit-min-zero-outlined', props: { variant: 'outlined', style: { '--origam-btn---min-height': '0', '--origam-btn---min-width': '0' } }, label: BTN_PROBE_LABEL, containerWidth: null },
    { key: 'consumer-chip-closable', component: 'chip', props: { closable: true, text: 'Chip' }, label: null, containerWidth: null },
    { key: 'consumer-code-copy', component: 'code', props: { code: 'npm install origam', copyable: true }, label: null, containerWidth: 400 },
    { key: 'consumer-code-compact', component: 'code', props: { code: 'npm install origam', copyable: true, compact: true }, label: null, containerWidth: 400 },
    { key: 'consumer-btn-group', component: 'btn-group', props: { items: [{ text: 'One' }, { text: 'Two' }, { text: 'Three' }] }, label: null, containerWidth: null },
    { key: 'consumer-btn-group-large-outlined', component: 'btn-group', props: { size: 'large', variant: 'outlined', items: [{ text: 'One' }, { text: 'Two' }, { text: 'Three' }] }, label: null, containerWidth: null },
    { key: 'consumer-btn-toggle', component: 'btn-toggle', props: { items: [{ text: 'One', value: 1 }, { text: 'Two', value: 2 }, { text: 'Three', value: 3 }] }, label: null, containerWidth: null },
    { key: 'consumer-btn-toggle-compact', component: 'btn-toggle', props: { density: 'compact', items: [{ text: 'One', value: 1 }, { text: 'Two', value: 2 }, { text: 'Three', value: 3 }] }, label: null, containerWidth: null },
    { key: 'max-height-long-wrap', props: { maxHeight: 50, block: true, wrap: true }, label: BTN_PROBE_LONG_LABEL, containerWidth: BTN_PROBE_CONTAINER_WIDTH }
]

/*********************************************************
 * BTN_PROBE_READ_PROPERTIES
 *
 * @description
 * Longhands uniquement — `getPropertyValue()` rend `""` sur un shorthand
 * contenant `var()`.
 ********************************************************/
export const BTN_PROBE_READ_PROPERTIES: readonly string[] = [
    'height', 'min-height', 'max-height', 'padding-top', 'padding-bottom', 'padding-left', 'padding-right'
]

export const BTN_PROBE_CASES: readonly IBtnProbeCase[] = [
    ...BTN_PROBE_SIZES.flatMap((size) => BTN_PROBE_DENSITIES.flatMap((density) => BTN_PROBE_REST_SHAPES.map((shape) => ({
        key: `${shape.key}|${size}|${density}`,
        props: { ...shape.props, size, density },
        label: shape.label,
        containerWidth: shape.containerWidth
    })))),
    ...BTN_PROBE_STANDALONE_CASES
]
