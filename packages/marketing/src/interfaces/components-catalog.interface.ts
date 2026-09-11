/**
 * Catalog entry — one row in the flat component list displayed on /components.
 * Descriptions come from docs .md files (first line) or a factual fallback.
 */
export interface IComponentEntry {
    /** kebab-case slug used as the URL segment: /components/{slug} */
    slug: string
    /** PascalCase component name as it appears in the DS, e.g. "Btn" */
    name: string
    /** MDI icon name for the catalog card */
    icon: string
    /** i18n key for the short description */
    descriptionKey: string
    /** Inline fallback description (English) — used when key is missing */
    descriptionFallback: string
    /** Category this component belongs to — drives the section grouping */
    category: string
    /**
     * Family members: sub-components that belong to the same DS folder.
     * Empty for single-component dirs (e.g. Alert, Divider…).
     * Each entry is a sibling cliquable card on /components/{slug}.
     */
    family: IComponentFamilyMember[]
    /**
     * If this entry IS a sub-component, points to the primary family slug.
     * Used to render a "Back to family" link on the sub-component page.
     * Undefined for top-level / standalone components.
     */
    parentSlug?: string
}

/** A related sub-component shown in the "family" section of a component page. */
export interface IComponentFamilyMember {
    /** kebab-case slug for this sub-component — its own /components/{slug} page */
    slug: string
    /** Full component name, e.g. "BtnGroup" */
    name: string
    /** Short one-line description */
    descriptionFallback: string
    /** i18n key for the description */
    descriptionKey: string
}

/**
 * A cross-reference to a component or directive from a DIFFERENT folder that
 * collaborates with this component. Distinct from `family` (same DS folder).
 */
export interface IComponentRelated {
    /** kebab-case slug — for components: /components/{slug}, for directives: /directives#{slug} */
    slug: string
    /** Display name, e.g. "Dialog", "v-click-outside" */
    name: string
    /** Whether this is a directive (links to /directives) or a component (links to /components) */
    kind: 'component' | 'directive'
    descriptionFallback: string
    descriptionKey: string
}

/**
 * Per-component documentation data — drives the /components/[slug].vue template.
 * One file per component under src/consts/components/{slug}.const.ts.
 */
export interface IComponentDoc {
    /** Must match the catalog entry slug exactly */
    slug: string
    /** Display name (PascalCase) */
    name: string
    /** Full component tag used in templates, e.g. "origam-btn" */
    tag: string
    /** MDI icon */
    icon: string
    /** i18n key for the hero description */
    descriptionKey: string
    descriptionFallback: string
    /** DS category used as the primary chip */
    category: string
    /** Optional npm package / sub-export note */
    packageNote?: string
    /** Prop rows shown in the Props table */
    props: IComponentPropRow[]
    /** Emit rows */
    emits: IComponentEmitRow[]
    /** Slot rows */
    slots: IComponentSlotRow[]
    /** 2-3 runnable code snippets */
    examples: IComponentExample[]
    /**
     * Family members — sub-components that live in the SAME DS folder.
     * Rendered as "Family" section on the detail page.
     */
    family: IComponentFamilyMember[]
    /**
     * Cross-references to OTHER components/directives from DIFFERENT folders
     * that collaborate with this component. Rendered as "Éléments liés" section.
     * Must only contain REAL documented relationships (not invented).
     */
    related?: IComponentRelated[]
    /**
     * If this is a sub-component, the parent slug for the breadcrumb.
     */
    parentSlug?: string
    /** Link to the Histoire story, if it exists */
    storyUrl?: string
    /** Link to the VitePress doc, if it exists */
    docUrl?: string

    /**
     * NEW SECTIONS (Phase 2 enrichment)
     * All optional — the template renders a section only when the field is present.
     * Fan-out pattern: fill each field by reading the real component source.
     *
     * SOURCING GUIDE for fan-out devs:
     *  - anatomy    read OrigamXxx.vue template + style for BEM class list
     *  - cssVars    read tokens/component/SLUG.json + SCSS origam-SLUG vars
     *  - exposed    read defineExpose block in OrigamXxx.vue
     *  - composable check packages/ds/src/composables for use-NAME composable
     *  - a11y       grep aria, role, tabindex in OrigamXxx.vue template
     *  - tokens     copy relevant entries from tokens/component/SLUG.json
     *  - playground define which props are demo-worthy (4-8 max for UX)
     */
    anatomy?: IComponentAnatomy
    cssVars?: IComponentCssVar[]
    exposed?: IComponentExposed[]
    composable?: IComponentComposable
    a11y?: IComponentA11y
    tokens?: IComponentTokens
    playground?: IComponentPlayground
    /**
     * Preview band variants — real Origam component instances shown in the header
     * preview strip. Rendered via <component :is="`origam-${slug}`">.
     * Keep to 5-7 variants max for visual balance.
     * Optional — falls back to no preview band when absent.
     */
    previewVariants?: IComponentPreviewVariant[]
}

/**
 * A type / payload reference shown as a chip in the tables.
 *
 * FAN-OUT GUIDE — how to fill this for a new component:
 *
 *   kind = 'primitive'
 *     Raw JS primitives or Vue built-ins: string, number, boolean, any, void,
 *     undefined, null, unknown, never, object, Function, Event, MouseEvent…
 *     No link is rendered — chip is neutral (no href).
 *     slug can be '' (empty string) — it is ignored.
 *
 *   kind = 'type'
 *     A named TS type from packages/ds/src/types/**  e.g. TIntent, TSize.
 *     slug = kebab-case of the type name WITHOUT the T prefix:
 *       TIntent  → 'intent'
 *       TVariant → 'variant'
 *       TSizeX   → 'size-x'
 *     The chip links to /types/{slug}.
 *
 *   kind = 'enum'
 *     A TS enum or string-literal union from packages/ds/src/enums/**
 *     slug = kebab-case of the enum/union name WITHOUT the E prefix:
 *       ELoaderKind → 'loader-kind'
 *       EVariant    → 'variant'
 *     The chip links to /types/{slug} (same /types page, enum section).
 *
 * When a prop accepts multiple types (e.g. TIntent | string), use the most
 * informative one as the primary TypeRef and put the full signature in label.
 * Example: { label: 'TIntent | string', slug: 'intent', kind: 'type' }
 */
export interface IComponentTypeRef {
    /** Display label shown in the chip, e.g. "TIntent | string" */
    label: string
    /**
     * kebab-case slug for the /types/{slug} route.
     * Empty string '' for primitives (no link rendered).
     */
    slug: string
    /** Controls whether the chip is a link and which colour is applied. */
    kind: 'primitive' | 'type' | 'enum'
}

/** One row in the Props table */
export interface IComponentPropRow {
    /** Prop name as the developer writes it (camelCase, matching the TS interface) */
    name: string
    /** Structured type reference — drives chip style + optional link */
    type: IComponentTypeRef
    /** Default value as a plain-text string, e.g. "'default'" or "false" */
    defaultValue: string
    /** i18n key for the description */
    descriptionKey: string
    descriptionFallback: string
    /** true = prop is required */
    required?: boolean
}

/** One row in the Emits table */
export interface IComponentEmitRow {
    /** Event name, e.g. "click" or "click:prepend" */
    event: string
    /** Payload type reference */
    payload: IComponentTypeRef
    descriptionKey: string
    descriptionFallback: string
}

/** One row in the Slots table */
export interface IComponentSlotRow {
    /** Slot name, e.g. "default", "prepend", "loader" */
    slot: string
    /** Slot props as a plain-text display string, e.g. "{ progressProps }" */
    slotProps: string
    descriptionKey: string
    descriptionFallback: string
}

/** A runnable code snippet shown in the Examples section */
export interface IComponentExample {
    /** Short example title */
    titleKey: string
    titleFallback: string
    /** Full Vue template / JS snippet */
    code: string
    /** Highlight language, e.g. "vue", "ts", "bash" */
    lang: string
}

/**
 * Anatomy node — one element in the DOM tree of the component.
 * Used to render the annotated wireframe in the Anatomy section.
 */
export interface IComponentAnatomyNode {
    /** HTML/Vue tag rendered, e.g. "button", "span", "origam-icon" */
    tag: string
    /** BEM class (root or element), e.g. "origam-btn" or "origam-btn__content" */
    bemClass: string
    /** Short note about the role of this node */
    noteKey: string
    noteFallback: string
    /** Children nodes */
    children?: IComponentAnatomyNode[]
}

/**
 * One numbered entry in the anatomy legend.
 */
export interface IComponentAnatomyLegendItem {
    /** 1-based number matching the SVG marker */
    num: number
    /** BEM class, e.g. "origam-btn__overlay" */
    cls: string
    /** Description with optional inline code snippets */
    descriptionKey: string
    descriptionFallback: string
}

/**
 * Anatomy section — structure DOM annotée avec les classes BEM réelles.
 * Sourcé du template de OrigamXxx.vue.
 *
 * FAN-OUT GUIDE:
 *  - svg        → copy the SVG from the wireframe's component-detail-ui.html <anatomy-svg-wrap>,
 *                 replace hex colors with CSS var() references so theming works
 *  - figcaption → short prose caption with the number of internal parts
 *  - legend     → numbered list matching SVG circle markers ①…⑧
 *  - code       → verbatim annotated HTML/Vue snippet from the component template
 *  - rootClass  → root BEM class
 *  - classes    → flat list for the legacy BEM table (kept for backwards compat)
 */
export interface IComponentAnatomy {
    /**
     * Inline SVG markup (without the outer <svg> tag wrapper — caller provides the
     * viewBox + aria attributes). Use CSS var() for all fill/stroke colors.
     * If absent the anatomy renders code-only (legacy fallback).
     */
    svg?: string
    /** SVG viewBox value, e.g. "0 0 700 260" */
    svgViewBox?: string
    /** Accessible title for the SVG (role="img") */
    svgTitle?: string
    /** Accessible description for the SVG */
    svgDesc?: string
    /**
     * Figcaption shown below the diagram.
     * May contain HTML — rendered with v-html inside a <figcaption>.
     */
    figcaption?: string
    /** Numbered legend items matching the SVG markers */
    legend?: IComponentAnatomyLegendItem[]
    /** Annotated HTML structure as a code string (for OrigamCode display) */
    code: string
    /** Root BEM class, e.g. "origam-btn" */
    rootClass: string
    /** All BEM classes used, with short description */
    classes: Array<{
        cls: string
        descriptionKey: string
        descriptionFallback: string
    }>
}

/**
 * A single preview variant shown in the preview band on the component header.
 * Each variant renders a real Origam component via <component :is>.
 */
export interface IComponentPreviewVariant {
    /** Short label shown below the component, e.g. "default" */
    label: string
    /** Props to pass to the component, keyed by camelCase prop name */
    props: Record<string, string | number | boolean>
    /** Default slot content (if any) */
    slotContent?: string
    /** aria-label override for this particular instance */
    ariaLabel?: string
}

/**
 * One row in the CSS Variables table.
 * Sourced from tokens/component/{slug}.json + component <style>.
 */
export interface IComponentCssVar {
    /** CSS variable name, e.g. "--origam-btn---background-color" */
    name: string
    /** Default value as a display string */
    defaultValue: string
    /** Short description of what this variable controls */
    descriptionKey: string
    descriptionFallback: string
}

/**
 * One exposed member (from defineExpose({})).
 * Sourced from the component's defineExpose() call.
 */
export interface IComponentExposed {
    /** Member name as exposed */
    name: string
    /** TypeScript type as a display string */
    type: string
    descriptionKey: string
    descriptionFallback: string
}

/**
 * Composable associated with this component (e.g. useCalendar for Calendar).
 * Optional — omit entirely for components without a dedicated composable.
 */
export interface IComponentComposable {
    /** Composable name, e.g. "useBtn" */
    name: string
    /** Import path as used in consumer code */
    importPath: string
    /** Short description */
    descriptionKey: string
    descriptionFallback: string
    /** Signature snippet (TypeScript) */
    signature: string
    /** Short usage example (Vue SFC snippet) */
    usageCode: string
}

/**
 * Accessibility notes for the component.
 * All values must be sourced from the real component code (aria-*, role, tabindex…).
 */
export interface IComponentA11y {
    /** ARIA role(s) this component uses, e.g. "button" */
    roles: string[]
    /** Keyboard interactions (key → action) */
    keyboard: Array<{
        key: string
        actionKey: string
        actionFallback: string
    }>
    /** Other a11y notes (focus management, reduced-motion, etc.) */
    notes: Array<{
        noteKey: string
        noteFallback: string
    }>
}

/**
 * Design tokens DTCG excerpt — shown in the "Design tokens" section.
 * Sourced from packages/ds/tokens/component/{slug}.json.
 */
export interface IComponentTokens {
    /** Source JSON file path (relative to repo root) */
    sourceFile: string
    /** Selected key tokens shown in the UI (not all — just the most important) */
    excerpt: Array<{
        tokenPath: string
        value: string
        type: string
        descriptionKey: string
        descriptionFallback: string
    }>
    /** Pipeline mention */
    pipelineNote: string
}

/**
 * Playground configuration — defines which props are controllable in the live editor.
 */
export interface IComponentPlaygroundControl {
    /** The prop name (camelCase) */
    prop: string
    /** Control type */
    kind: 'select' | 'switch' | 'text' | 'number'
    /** Label shown in the control panel */
    labelKey: string
    labelFallback: string
    /** Options for select controls */
    options?: Array<{ label: string; value: string | number | boolean }>
    /** Default value */
    defaultValue: string | number | boolean
}

export interface IComponentPlayground {
    /** Controls rendered in the left panel */
    controls: IComponentPlaygroundControl[]
    /** Default slot content to use in the live preview */
    defaultSlotContent?: string
}
