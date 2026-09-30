import type { IKbdProbeCase } from './probe-cases.interface'

/*********************************************************
 * KBD_PROBE_CASES
 *
 * @description
 * Ce que la matrice rend, une ligne par cas. Chaque cas porte une CLE
 * stable : c'est elle qui apparie la mesure d'avant et celle d'apres, donc
 * elle ne doit jamais changer de sens entre deux lots.
 *
 * @description
 * Les six premiers cas sont les VARIANTS NUS — aucun prop concurrent — et
 * ce sont eux qui portent le critere d'acceptation d'ADR-005 lot 2 : zero
 * changement de rendu. Les trois derniers posent un prop que le preset
 * nomme aussi ; leur changement est ATTENDU et documente, jamais masque.
 *
 * @description
 * ⛔ LES DEUX FORMES SONT MESUREES SEPAREMENT, et c'est le coeur du lot.
 * En forme SIMPLE la surface peinte est la RACINE ; en forme COMBINAISON la
 * racine n'est qu'une enveloppe transparente et les surfaces sont les
 * descendants `__key`. Une sonde qui ne lirait que la racine declarerait
 * « aucun changement » sur une combinaison dont toutes les touches ont
 * change, parce qu'elle mesurerait l'enveloppe.
 ********************************************************/
export const KBD_PROBE_CASES: readonly IKbdProbeCase[] = [
    { key: 'single-outlined', variant: 'outlined', combination: false },
    { key: 'single-filled', variant: 'filled', combination: false },
    { key: 'single-tonal', variant: 'tonal', combination: false },
    { key: 'combo-outlined', variant: 'outlined', combination: true },
    { key: 'combo-filled', variant: 'filled', combination: true },
    { key: 'combo-tonal', variant: 'tonal', combination: true },
    { key: 'override-single-outlined', variant: 'outlined', combination: false, bgColor: 'primary' },
    { key: 'override-combo-tonal', variant: 'tonal', combination: true, bgColor: 'primary' },
    { key: 'override-single-border', variant: 'tonal', combination: false, border: 'thick' }
]

/*********************************************************
 * KBD_PROBE_COMBINATION
 *
 * @description
 * Deux touches suffisent : la sonde lit CHAQUE `__key`, et une troisieme
 * n'ajouterait qu'une repetition. Deux produisent aussi exactement un
 * separateur, dont la couleur est lue comme temoin.
 ********************************************************/
export const KBD_PROBE_COMBINATION: readonly string[] = ['Ctrl', 'S']

/*********************************************************
 * KBD_PROBE_TEXT
 *
 * @description
 * Libelle de la forme simple. Sans importance visuelle : seules les
 * proprietes de SURFACE sont lues.
 ********************************************************/
export const KBD_PROBE_TEXT = 'K'

/*********************************************************
 * KBD_PROBE_READ_PROPERTIES
 *
 * @description
 * Les longhands lus sur chaque surface. ⛔ AUCUN SHORTHAND : sur cette
 * feuille de tokens, `getPropertyValue()` d'un raccourci dont la valeur
 * contient un `var()` rend `""` (substitution differee), et une sonde qui
 * interroge `background` ou `border` rate donc presque tout — piege
 * documente dans le CLAUDE.md du depot.
 ********************************************************/
export const KBD_PROBE_READ_PROPERTIES: readonly string[] = [
    'background-color',
    'border-top-width',
    'border-top-style',
    'border-top-color',
    'box-shadow',
    'color',
    'border-top-left-radius',
    'padding-top',
    'padding-left',
    'font-size',
    'min-width'
]
