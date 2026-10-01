import type { IBlockquoteProbeCase } from './probe-cases.interface'

/*********************************************************
 * BLOCKQUOTE_PROBE_CASES
 *
 * @description
 * Ce que la matrice rend, une ligne par cas. Les CINQ premiers sont les
 * VARIANTS NUS — aucun prop concurrent — et ce sont eux qui portent le
 * critere d'acceptation du lot #1015 : zero changement de rendu entre
 * avant et apres la conversion, sur les 8 identites x 2 modes.
 *
 * @description
 * Les trois derniers posent un prop que le preset nomme aussi. Leur
 * changement est ATTENDU — c'est la moitie « un prop explicite bat le
 * preset » de la definition de fini d'ADR-005 D7 — et le comparateur les
 * range a part plutot que de les masquer.
 * @description
 * ⛔ `override-elegant-font-size` est le cas qui porte le DEFAUT REPARE :
 * avant la conversion, la regle `--variant-elegant` declarait `font-size`
 * en direct et la prop etait inerte. Son ecart est donc la PREUVE du lot,
 * pas un effet de bord.
 ********************************************************/
export const BLOCKQUOTE_PROBE_CASES: readonly IBlockquoteProbeCase[] = [
    { key: 'bare-default', variant: 'default' },
    { key: 'bare-elegant', variant: 'elegant' },
    { key: 'bare-quoted', variant: 'quoted' },
    { key: 'bare-minimal', variant: 'minimal' },
    { key: 'bare-pull', variant: 'pull' },
    { key: 'override-elegant-font-size', variant: 'elegant', fontSize: 'sm' },
    { key: 'override-pull-align', variant: 'pull', align: 'left' },
    { key: 'override-pull-padding', variant: 'pull', padding: '10' }
]

/*********************************************************
 * BLOCKQUOTE_PROBE_READ_PROPERTIES
 *
 * @description
 * Les longhands lus sur chaque surface. ⛔ AUCUN SHORTHAND : sur cette
 * feuille de tokens, `getPropertyValue()` d'un raccourci dont la valeur
 * contient un `var()` rend `""` (substitution differee), donc une sonde
 * qui interroge `border` ou `padding` rate presque tout.
 *
 * @description
 * Les quatre aretes logiques sont lues SEPAREMENT parce que le lot les
 * emet par des canaux differents : `borderInlineStart` est une prop par
 * cote, `borderBlock` une prop d'axe qui pose les deux aretes a la fois.
 * Lire une seule arete declarerait « aucun changement » sur `pull`.
 ********************************************************/
export const BLOCKQUOTE_PROBE_READ_PROPERTIES: readonly string[] = [
    'border-inline-start-width',
    'border-inline-start-style',
    'border-inline-start-color',
    'border-block-start-width',
    'border-block-start-color',
    'border-block-end-width',
    'padding-top',
    'padding-bottom',
    'padding-inline-start',
    'padding-inline-end',
    'font-family',
    'font-size',
    'font-style',
    'font-weight',
    'line-height',
    'text-align',
    'color',
    'position',
    'z-index'
]

export const BLOCKQUOTE_PROBE_BODY = 'Talk is cheap. Show me the code.'
export const BLOCKQUOTE_PROBE_AUTHOR = 'Linus Torvalds'
export const BLOCKQUOTE_PROBE_SOURCE = 'LKML, 2003'
