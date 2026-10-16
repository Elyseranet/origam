import type { IComponentRegistry, IPlaygroundInstance, IPlaygroundScene } from '@origam/playground/interfaces'

/**
 * playground-host.interface.ts — the marketing site as a HOST of
 * `@origam/playground` (lot E, #1145).
 */

/** Why a component cannot render on its own — shown instead of a silent empty box. */
export interface IPlaygroundUnavailableReason {
    /** i18n key, under `components.detail.preview.reason.*`. */
    key: string
    /** English fallback of `key`. */
    fallback: string
}

/** What `usePlaygroundHost().load()` resolves for one documented component. */
export interface IPlaygroundHostEntry {
    /** The documented component's export name — `OrigamBtn`. */
    componentName: string
    /** Its family + every component its snippets nest, ready to render. */
    registry: IComponentRegistry
    /** A fresh scene seeded from the component's default snippet. */
    createScene: () => IPlaygroundScene
    /**
     * `true` when a snippet (its own, or a family snippet nesting it) seeds the
     * scene — then a "cannot render on its own" reason does not apply.
     */
    hasSnippet: boolean
    /**
     * Label of the parent shown instead (`DataTable`) when the documented
     * component is a sub-part its parent renders internally, else `null`.
     */
    renderedByParent: string | null
}

/** One brand identity the playground toolbar offers — a registered theme name. */
export interface IPlaygroundHostTheme {
    /** The registered theme name, `data-theme="<key>"`. */
    key: string
    /** i18n key of its label. */
    labelKey: string
    /** English fallback of `labelKey`. */
    labelFallback: string
}

/** Options of `usePlaygroundHost`. */
export interface IPlaygroundHostOptions {
    /**
     * Selector of the containing block overlays attach to (`IOverlayProps.attach`),
     * so a dialog renders inside the preview instead of teleporting to `<body>`.
     */
    overlayAttach: string
}

/** Fallback content handed to a component with no snippet — see `usePlaygroundHost`. */
export interface IPlaygroundFallbackContent {
    /** The fiche's own `playground.defaultSlotContent`, when the DB carries one. */
    slotContent?: string
}

/** A root instance plus the label the hero band prints under it. */
export interface IPlaygroundHeroVariant {
    /** The variant's label, e.g. `default`. */
    label: string
    /** The instance tree rendered for this variant. */
    instance: IPlaygroundInstance
}
