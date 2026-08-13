import type { IFigmaHighlight, IFigmaTokenMapping } from '~/interfaces/figma-highlight.interface'

/**
 * Constants for the HomeFigma section (#28).
 */
export const HOME_FIGMA_HREF = '/figma-plugin'

export const HOME_FIGMA_DOWNLOAD_HREF = '/origam-figma-plugin.zip'

/**
 * Two capabilities the Origam DS Sync plugin actually ships today
 * (Generate + Export — see packages/figma-plugin). The repo-to-Figma
 * write-back ("Sync" tab) is a v2 placeholder and is intentionally NOT
 * listed here to avoid promoting an unfinished feature.
 */
export const HOME_FIGMA_HIGHLIGHTS: IFigmaHighlight[] = [
    {
        key: 'generate',
        icon: 'mdi-view-grid-outline',
        titleKey: 'home.figma.highlight_generate_title',
        titleFallback: 'Generate components',
        descriptionKey: 'home.figma.highlight_generate_description',
        descriptionFallback: '14 production-ready ComponentSets, bound to your design tokens, built directly in your Figma file.'
    },
    {
        key: 'export',
        icon: 'mdi-code-json',
        titleKey: 'home.figma.highlight_export_title',
        titleFallback: 'Export tokens',
        descriptionKey: 'home.figma.highlight_export_description',
        descriptionFallback: 'Figma Variables export back out as Tokens Studio JSON or origam SCSS — ready to drop into the repo.'
    }
]

/**
 * Real dot-path -> Figma Variable name examples, matching the plugin's
 * actual naming convention (packages/figma-plugin/src/lib/variables.ts:
 * dot segments <-> slash segments, case-insensitive). Anchored on real
 * tokens (packages/ds/tokens/semantic/light.json, primitive.json).
 */
export const HOME_FIGMA_TOKEN_MAPPINGS: IFigmaTokenMapping[] = [
    { key: 'surface', tokenPath: 'color.surface.default', variableName: 'Color/Surface/Default' },
    { key: 'action', tokenPath: 'color.action.primary.bg', variableName: 'Color/Action/Primary/Bg' },
    { key: 'radius', tokenPath: 'radius.lg', variableName: 'Radius/Lg' }
]
