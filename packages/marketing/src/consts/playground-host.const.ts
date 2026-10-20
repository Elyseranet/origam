import { COLOR_MODE } from 'origam/enums'

import type { IPlaygroundHostMode, IPlaygroundHostTheme, IPlaygroundUnavailableReason } from '~/interfaces/playground-host.interface'

/**
 * playground-host.const.ts — what the marketing site, as a HOST of
 * `@origam/playground`, knows that the playground does not (lot E, #1145).
 */

/**
 * Containing block of the `/components/{slug}` playground's preview, where
 * overlays render in place (`IOverlayProps.attach`). `.pg-preview__stage` is
 * the stage `PlaygroundPreview` renders; the page gives it `contain: layout`.
 */
export const COMPONENT_PLAYGROUND_OVERLAY_ATTACH = '.component-playground .pg-preview__stage'

/** Same, for the Theme Builder's preview canvas (`ThemeBuilderPreview`). */
export const THEME_BUILDER_OVERLAY_ATTACH = '.tb-preview__canvas'

/**
 * Slugs whose root has NO intrinsic width (it fills its container: a scroller
 * with a height, a parallax layer). The canvas centres with `place-items:
 * center`, i.e. shrink-wraps its items, so such a root collapsed to 0 px
 * (#1229). They take the canvas' inner width instead; every other preview keeps
 * shrink-wrapping. Measured over the 220 previews: only these two.
 */
export const THEME_BUILDER_FILL_WIDTH_SLUGS: readonly string[] = ['virtual-scroll', 'parallax-layer']

/**
 * Child → parent, for the sub-components the marketing snippets nest inside
 * their parent (ex-`parentEnvelope`, #728). Merged with the playground's own
 * `SNIPPET_PARENT_OF`. Each entry was measured to THROW without its parent:
 * `OrigamDataTableRow` calls `useHeaders()` / `useSelection()` /
 * `useExpanded()` / `useSort()` unconditionally, all injected by
 * `<origam-data-table>`.
 */
export const MARKETING_SNIPPET_PARENT_OF: Readonly<Record<string, string>> = {
    OrigamDataTableRow: 'OrigamDataTable'
}

/** Text given to a component that declares a default slot and has no snippet — an empty container is a 0 × 0 box. */
export const PLAYGROUND_FALLBACK_SLOT_TEXT = { key: 'components.playground.fallback_slot_text', fallback: 'Content' } as const

/**
 * A sub-part that only exists inside its parent. When that parent renders it
 * INTERNALLY (`PLAYGROUND_RENDERED_BY`), the fiche previews the parent's
 * snippet (`IPlaygroundHostEntry.renderedByParent`) instead of this reason.
 */
const PLAYGROUND_REASON_NEEDS_PARENT: IPlaygroundUnavailableReason = {
    key: 'components.detail.preview.reason.needs_parent',
    fallback: 'This is an internal sub-part: it is injected by its parent component and cannot render on its own. See the parent component page for a live example.'
}

/**
 * Sub-part → the component that renders it INTERNALLY, so its fiche (and its
 * Theme Builder entry) previews that parent's snippet instead of nothing.
 * Authored, never derived: each pair is checked in a real browser by the
 * lot E probe — the sub-part's root class (`.origam-data-table-footer`, …) is
 * present in the rendered parent. A sub-part shown only on interaction
 * (`OrigamChartTooltip`, on hover) or only in a mode the snippet does not
 * enable (`OrigamDataTableGroupHeaderRow` needs `groupBy`,
 * `OrigamDataTableHeadersCellMobile` a mobile viewport) is NOT listed — nor
 * `OrigamListChildren` / `OrigamListGroupActivator`, measured ABSENT from the
 * `OrigamListGroup` snippet's render.
 */
export const PLAYGROUND_RENDERED_BY: Readonly<Record<string, string>> = {
    OrigamChartAxis: 'OrigamChart',
    OrigamDataTableColumnCell: 'OrigamDataTable',
    OrigamDataTableFooter: 'OrigamDataTable',
    OrigamDataTableHeaderCell: 'OrigamDataTable',
    OrigamDataTableHeaders: 'OrigamDataTable',
    OrigamDataTableHeadersCell: 'OrigamDataTable',
    OrigamDataTableRows: 'OrigamDataTable',
    OrigamExpansionPanelContent: 'OrigamExpansionPanels',
    OrigamExpansionPanelHeader: 'OrigamExpansionPanels',
    OrigamSliderFieldTrack: 'OrigamSliderField',
    OrigamBracketCompetitor: 'OrigamBracket',
    OrigamBracketMatch: 'OrigamBracket',
    OrigamBracketRound: 'OrigamBracket'
}

/** Shown on the fiche of such a sub-part: what the preview shows instead. */
export const PLAYGROUND_RENDERED_BY_PARENT_TEXT = {
    key: 'components.playground.rendered_by_parent',
    fallback: 'This sub-part is rendered by its parent: the preview shows {parent}, with this part inside it. Theme it from the Theme Builder, or edit the parent here.'
} as const

const PORTAL: IPlaygroundUnavailableReason = {
    key: 'components.detail.preview.reason.portal',
    fallback: 'This component teleports its surface to the end of <body> once activated, so it never renders inside this preview box. Use the props panel and the generated snippet, then try it in your own page.'
}

const RUNTIME_DATA: IPlaygroundUnavailableReason = {
    key: 'components.detail.preview.reason.runtime_data',
    fallback: 'This component requires runtime data its parent owns (a DOM element, a controller object, or a File), which a static preview cannot provide.'
}

/**
 * Components that cannot render on their own, by export name, with the reason
 * shown above the playground. Carried over from the former
 * `COMPONENT_PREVIEW_ADAPTERS` `unavailableReason*` entries (#728, #945).
 *
 * ⛔ A sub-part listed here whose family has a snippet NESTING it is not
 * shown this reason: `usePlaygroundHost` seeds its fiche with that family
 * snippet instead, and it renders — so the reason is only read where nothing
 * renders.
 *
 * `OrigamContextualMenu` needs a real `contextmenu` event (its only fallback,
 * `staticLocationStrategy`, is an empty stub); `OrigamCommandPalette` and
 * `OrigamSnackbarGroup` hardcode `<teleport to="body">`; `OrigamDrawer`
 * teleports to the site's own `<OrigamLayout>`, with no prop to redirect it.
 */
export const PLAYGROUND_UNAVAILABLE_REASONS: Readonly<Record<string, IPlaygroundUnavailableReason>> = {
    OrigamChartAxis: PLAYGROUND_REASON_NEEDS_PARENT,
    OrigamChartTooltip: PLAYGROUND_REASON_NEEDS_PARENT,
    OrigamDataTableColumnCell: PLAYGROUND_REASON_NEEDS_PARENT,
    OrigamDataTableFooter: PLAYGROUND_REASON_NEEDS_PARENT,
    OrigamDataTableGroupHeaderRow: PLAYGROUND_REASON_NEEDS_PARENT,
    OrigamDataTableHeaderCell: PLAYGROUND_REASON_NEEDS_PARENT,
    OrigamDataTableHeaders: PLAYGROUND_REASON_NEEDS_PARENT,
    OrigamDataTableHeadersCell: PLAYGROUND_REASON_NEEDS_PARENT,
    OrigamDataTableHeadersCellMobile: PLAYGROUND_REASON_NEEDS_PARENT,
    OrigamDataTableRows: PLAYGROUND_REASON_NEEDS_PARENT,
    OrigamExpansionPanel: PLAYGROUND_REASON_NEEDS_PARENT,
    OrigamExpansionPanelContent: PLAYGROUND_REASON_NEEDS_PARENT,
    OrigamExpansionPanelHeader: PLAYGROUND_REASON_NEEDS_PARENT,
    OrigamListChildren: PLAYGROUND_REASON_NEEDS_PARENT,
    OrigamListGroupActivator: PLAYGROUND_REASON_NEEDS_PARENT,
    OrigamSliderFieldTrack: PLAYGROUND_REASON_NEEDS_PARENT,
    OrigamVirtualScrollItem: PLAYGROUND_REASON_NEEDS_PARENT,
    OrigamWindowItem: PLAYGROUND_REASON_NEEDS_PARENT,
    OrigamTabPanel: PLAYGROUND_REASON_NEEDS_PARENT,
    OrigamBracketCompetitor: PLAYGROUND_REASON_NEEDS_PARENT,
    OrigamBracketMatch: PLAYGROUND_REASON_NEEDS_PARENT,
    OrigamBracketRound: PLAYGROUND_REASON_NEEDS_PARENT,
    OrigamInfiniteScrollIntersect: RUNTIME_DATA,
    OrigamMediaController: RUNTIME_DATA,
    OrigamVideo: {
        key: 'components.detail.preview.reason.media_source',
        fallback: 'This component requires a media source (audio or video URL). The marketing site ships no sample media, so the preview stays empty on purpose.'
    },
    OrigamContextualMenu: PORTAL,
    OrigamCommandPalette: PORTAL,
    OrigamDrawer: PORTAL,
    OrigamSnackbarGroup: PORTAL,
    OrigamSpacer: {
        key: 'components.detail.preview.reason.layout_only',
        fallback: 'This component renders no visible surface of its own: it only pushes its siblings apart inside a flex container.'
    }
}

/**
 * The 8 brand identities of `src/themes/*.theme.ts`, as registered with the
 * origam Nuxt module (`nuxt.config.ts` → `origam.themes`). The playground does
 * not know them (README, #1048): the HOST offers them, and hands the chosen
 * name to `<playground :theme>`. Labels reuse the home page's chips.
 */
export const PLAYGROUND_HOST_THEMES: readonly IPlaygroundHostTheme[] = [
    { key: 'origam', labelKey: 'components.playground.theme_origam', labelFallback: 'Origam' },
    { key: 'geek', labelKey: 'home.themes.chip_geek', labelFallback: 'Geek' },
    { key: 'glass', labelKey: 'home.themes.chip_glass', labelFallback: 'Glass' },
    { key: 'cartoon', labelKey: 'home.themes.chip_cartoon', labelFallback: 'Cartoon' },
    { key: 'editorial', labelKey: 'home.themes.chip_editorial', labelFallback: 'Editorial' },
    { key: 'material', labelKey: 'home.themes.chip_material', labelFallback: 'Material' },
    { key: 'ecom', labelKey: 'home.themes.chip_ecom', labelFallback: 'Ecom' },
    { key: 'apple', labelKey: 'home.themes.chip_apple', labelFallback: 'Apple' }
]

/**
 * The preview's mode group, Light / Dark / Auto (#1173, owner's decision).
 * `auto` hands `'auto'` to the playground, which then pins no `data-mode`
 * and follows the site's own mode.
 */
export const PLAYGROUND_HOST_MODES: readonly IPlaygroundHostMode[] = [
    { value: COLOR_MODE.LIGHT, icon: 'mdi-weather-sunny', labelKey: 'components.playground.mode_light', labelFallback: 'Light' },
    { value: COLOR_MODE.DARK, icon: 'mdi-weather-night', labelKey: 'components.playground.mode_dark', labelFallback: 'Dark' },
    { value: COLOR_MODE.AUTO, icon: 'mdi-theme-light-dark', labelKey: 'components.playground.mode_auto', labelFallback: 'Auto' }
]
