/*
 * GENERATED — pnpm -F @origam/playground meta:host-seed
 *
 * Demo catalogue for the standalone host (src/host/main.ts), built from
 * REAL metadata captured from `origam` @ ffad458b3.
 * Source A (runtime descriptor: names, defaults) merged with source B
 * (literal unions + resolved aliases: options, tsType, emit payloads, slots).
 * No snippets and `requiresParent: false` everywhere: neither is measurable
 * by the chain — both are AUTHORED, in `consts/Commons/snippets.const.ts`.
 * Prop counts: OrigamBtn 107, OrigamSelect 161, OrigamSwitch 114, OrigamAlert 93, OrigamCard 99, OrigamChip 95, OrigamDataTable 131, OrigamChart 72, OrigamTabs 26, OrigamTab 19, OrigamWindow 73, OrigamWindowItem 9, OrigamList 87, OrigamListItem 94.
 *
 * Do not hand-edit — re-run the generator after `meta:runtime`,
 * `meta:unions` and `meta:aliases`.
 */
import { CONTROL_KIND } from '../enums/Commons/control-kind.enum'
import { METADATA_SOURCE } from '../enums/Commons/metadata-source.enum'
import type { IComponentDefinition } from '../interfaces/Catalog/component-definition.interface'

export const HOST_CATALOG_SEED: IComponentDefinition[] = [
    {
        name: "OrigamBtn",
        tag: "origam-btn",
        family: "Btn",
        label: "Btn",
        category: "Form & Input",
        props: [
        {
            name: "flat",
            label: "flat",
            tsType: "boolean | undefined",
            runtimeType: "Boolean",
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.SWITCH,
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "icon",
            label: "icon",
            tsType: "boolean | TIcon | undefined",
            runtimeType: ["Boolean","String","Array"],
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            description: "Pass `true` to activate icon-only mode; pass a `TIcon` value to set the icon.",
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "block",
            label: "block",
            tsType: "boolean | undefined",
            runtimeType: "Boolean",
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.SWITCH,
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "slim",
            label: "slim",
            tsType: "boolean | undefined",
            runtimeType: "Boolean",
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.SWITCH,
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "stacked",
            label: "stacked",
            tsType: "boolean | undefined",
            runtimeType: "Boolean",
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.SWITCH,
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "wrap",
            label: "wrap",
            tsType: "boolean | undefined",
            runtimeType: "Boolean",
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.SWITCH,
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "text",
            label: "text",
            tsType: "string | undefined",
            runtimeType: "String",
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "status",
            label: "status",
            tsType: "\"success\" | \"info\" | \"warning\" | \"error\" | undefined",
            runtimeType: null,
            required: false,
            hasFactoryDefault: false,
            options: ["success","info","warning","error"],
            control: CONTROL_KIND.SELECT,
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "statusIconPosition",
            label: "statusIconPosition",
            tsType: "\"prepend\" | \"append\" | \"replace\" | \"both\" | undefined",
            runtimeType: null,
            required: false,
            hasFactoryDefault: false,
            options: ["prepend","append","replace","both"],
            control: CONTROL_KIND.SELECT,
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "id",
            label: "id",
            tsType: "string | undefined",
            runtimeType: "String",
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "class",
            label: "class",
            tsType: null,
            runtimeType: ["String","Array","Object"],
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.RUNTIME
        },
        {
            name: "style",
            label: "style",
            tsType: null,
            runtimeType: ["String","Array","Object","Boolean"],
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.RUNTIME
        },
        {
            name: "color",
            label: "color",
            tsType: "TColor",
            runtimeType: ["String","Object","Boolean"],
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "bgColor",
            label: "bgColor",
            tsType: "TColor",
            runtimeType: ["String","Object","Boolean"],
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "border",
            label: "border",
            tsType: "string | number | boolean | TDirectionBoth[] | undefined",
            runtimeType: ["Boolean","Number","String","Array"],
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "borderTop",
            label: "borderTop",
            tsType: "string | number | boolean | undefined",
            runtimeType: ["Boolean","Number","String"],
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "borderLeft",
            label: "borderLeft",
            tsType: "string | number | boolean | undefined",
            runtimeType: ["Boolean","Number","String"],
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "borderBottom",
            label: "borderBottom",
            tsType: "string | number | boolean | undefined",
            runtimeType: ["Boolean","Number","String"],
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "borderRight",
            label: "borderRight",
            tsType: "string | number | boolean | undefined",
            runtimeType: ["Boolean","Number","String"],
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "borderBlock",
            label: "borderBlock",
            tsType: "string | number | boolean | undefined",
            runtimeType: ["Boolean","Number","String"],
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            description: "Logical-axis shorthand for the block-start + block-end edges (top +\nbottom in the default horizontal-tb writing mode). Resolves to the\nnative CSS `border-block-{width,style,color}` properties — same\nvalue grammar as `borderTop` / `borderRight` / `borderBottom` /\n`borderLeft` (boolean opt-in, bare width number, or a free-form\n`\"width style color\"` string). Precedence: beats the global `border`\nshorthand for the edges it targets, but a physical `borderTop` /\n`borderBottom` still wins over it for that specific edge — see\n`useBorder` JSDoc for the full precedence table.",
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "borderInline",
            label: "borderInline",
            tsType: "string | number | boolean | undefined",
            runtimeType: ["Boolean","Number","String"],
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            description: "Logical-axis shorthand for the inline-start + inline-end edges (left\n+ right in LTR). Same grammar and precedence rules as `borderBlock`,\nmapped onto `border-inline-{width,style,color}`.",
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "borderInlineStart",
            label: "borderInlineStart",
            tsType: "string | number | boolean | undefined",
            runtimeType: ["Boolean","Number","String"],
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            description: "*******************************************************\nborderInlineStart",
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "borderInlineEnd",
            label: "borderInlineEnd",
            tsType: "string | number | boolean | undefined",
            runtimeType: ["Boolean","Number","String"],
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            description: "*******************************************************\nborderInlineEnd",
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "borderBlockStart",
            label: "borderBlockStart",
            tsType: "string | number | boolean | undefined",
            runtimeType: ["Boolean","Number","String"],
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            description: "*******************************************************\nborderBlockStart",
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "borderBlockEnd",
            label: "borderBlockEnd",
            tsType: "string | number | boolean | undefined",
            runtimeType: ["Boolean","Number","String"],
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            description: "*******************************************************\nborderBlockEnd",
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "borderColor",
            label: "borderColor",
            tsType: "string | undefined",
            runtimeType: "String",
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "borderStyle",
            label: "borderStyle",
            tsType: "string | undefined",
            runtimeType: "String",
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "borderTopColor",
            label: "borderTopColor",
            tsType: "TColor",
            runtimeType: ["String","Object","Boolean"],
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            description: "Per-side color override (issue #215). Additive: absent by default,\nno behaviour change for existing consumers.\n\nPrecedence (specific > global): `borderTopColor` wins over any\ncolor implied by `borderTop` (e.g. `borderTop=\"2px dashed red\"`),\nwhich itself wins over the global `borderColor` / `border` shorthand\nfor the top side. See `useBorder` JSDoc for the full precedence\ntable.\n\nAccepts a {@link TColor} (semantic intent, raw CSS color, or falsy\nto opt out) — same input family as `color` / `bgColor`. Gradients\nare NOT supported on border colors (CSS `border-color` has no\ngradient form) and are silently ignored.",
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "borderRightColor",
            label: "borderRightColor",
            tsType: "TColor",
            runtimeType: ["String","Object","Boolean"],
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "borderBottomColor",
            label: "borderBottomColor",
            tsType: "TColor",
            runtimeType: ["String","Object","Boolean"],
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "borderLeftColor",
            label: "borderLeftColor",
            tsType: "TColor",
            runtimeType: ["String","Object","Boolean"],
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "borderInlineStartColor",
            label: "borderInlineStartColor",
            tsType: "TColor",
            runtimeType: ["String","Object","Boolean"],
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            description: "*******************************************************\nborderInlineStartColor",
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "borderInlineEndColor",
            label: "borderInlineEndColor",
            tsType: "TColor",
            runtimeType: ["String","Object","Boolean"],
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            description: "*******************************************************\nborderInlineEndColor",
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "borderBlockStartColor",
            label: "borderBlockStartColor",
            tsType: "TColor",
            runtimeType: ["String","Object","Boolean"],
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            description: "*******************************************************\nborderBlockStartColor",
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "borderBlockEndColor",
            label: "borderBlockEndColor",
            tsType: "TColor",
            runtimeType: ["String","Object","Boolean"],
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            description: "*******************************************************\nborderBlockEndColor",
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "density",
            label: "density",
            tsType: "\"default\" | \"compact\" | \"comfortable\" | undefined",
            runtimeType: null,
            required: false,
            defaultValue: "default",
            hasFactoryDefault: false,
            options: ["default","compact","comfortable"],
            control: CONTROL_KIND.SELECT,
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "height",
            label: "height",
            tsType: "string | number | undefined",
            runtimeType: ["Number","String"],
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "maxHeight",
            label: "maxHeight",
            tsType: "string | number | undefined",
            runtimeType: ["Number","String"],
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "maxWidth",
            label: "maxWidth",
            tsType: "string | number | undefined",
            runtimeType: ["Number","String"],
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "minHeight",
            label: "minHeight",
            tsType: "string | number | undefined",
            runtimeType: ["Number","String"],
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "minWidth",
            label: "minWidth",
            tsType: "string | number | undefined",
            runtimeType: ["Number","String"],
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "width",
            label: "width",
            tsType: "string | number | undefined",
            runtimeType: ["Number","String"],
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "elevation",
            label: "elevation",
            tsType: "TElevation | undefined",
            runtimeType: ["Number","String"],
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "rounded",
            label: "rounded",
            tsType: "string | number | boolean | null | undefined",
            runtimeType: ["Boolean","Number","String"],
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            description: "Corner-radius selector. Three modes:\n - **named variant** (`'small' | 'default' | 'large' | …`,\n   cf. `ROUNDED` enum) → emits `--rounded-{name}` class so the\n   component's SCSS can pick the right token rung.\n - **boolean `true`** (or empty string `''`) → emits the legacy\n   `--rounded` class for components that only have a single rounded\n   state (e.g. `OrigamBtn` defaulting to `radius.2xl`).\n - **CSS value** (`'4px'`, `'4px 0 4px 0'`, `100`) → emits inline\n   `border-radius` declarations via `useRounded.roundedStyles`.",
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "roundedTopRight",
            label: "roundedTopRight",
            tsType: "string | number | boolean | undefined",
            runtimeType: ["Boolean","Number","String"],
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            description: "Top-right corner only. Takes the same vocabulary as `rounded`\n(`8`, `'8px'`, `'md'`, `'large'`, `'var(…)'`), minus `shaped` /\n`shaped-invert` which are asymmetric by definition.",
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "roundedTopLeft",
            label: "roundedTopLeft",
            tsType: "string | number | boolean | undefined",
            runtimeType: ["Boolean","Number","String"],
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            description: "Top-left corner only. Same vocabulary as `roundedTopRight`.",
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "roundedBottomLeft",
            label: "roundedBottomLeft",
            tsType: "string | number | boolean | undefined",
            runtimeType: ["Boolean","Number","String"],
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            description: "Bottom-left corner only. Same vocabulary as `roundedTopRight`.",
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "roundedBottomRight",
            label: "roundedBottomRight",
            tsType: "string | number | boolean | undefined",
            runtimeType: ["Boolean","Number","String"],
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            description: "Bottom-right corner only. Same vocabulary as `roundedTopRight`.",
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "roundedStartStart",
            label: "roundedStartStart",
            tsType: "string | number | boolean | undefined",
            runtimeType: ["Boolean","Number","String"],
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            description: "*******************************************************\nLogical per-corner radius — rung 2 (issue #1013)",
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "roundedStartEnd",
            label: "roundedStartEnd",
            tsType: "string | number | boolean | undefined",
            runtimeType: ["Boolean","Number","String"],
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "roundedEndStart",
            label: "roundedEndStart",
            tsType: "string | number | boolean | undefined",
            runtimeType: ["Boolean","Number","String"],
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "roundedEndEnd",
            label: "roundedEndEnd",
            tsType: "string | number | boolean | undefined",
            runtimeType: ["Boolean","Number","String"],
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "tag",
            label: "tag",
            tsType: "string | undefined",
            runtimeType: "String",
            required: false,
            defaultValue: "button",
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "size",
            label: "size",
            tsType: "number | \"default\" | \"x-small\" | \"small\" | \"large\" | \"x-large\" | undefined",
            runtimeType: null,
            required: false,
            defaultValue: "default",
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "href",
            label: "href",
            tsType: "string | undefined",
            runtimeType: "String",
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "replace",
            label: "replace",
            tsType: "boolean | undefined",
            runtimeType: "Boolean",
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.SWITCH,
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "to",
            label: "to",
            tsType: "string | kt | Tt | undefined",
            runtimeType: null,
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "exact",
            label: "exact",
            tsType: "boolean | undefined",
            runtimeType: "Boolean",
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.SWITCH,
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "ripple",
            label: "ripple",
            tsType: "boolean | { class: string; } | undefined",
            runtimeType: ["Boolean","Object"],
            required: false,
            defaultValue: true,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "loading",
            label: "loading",
            tsType: "TControlLoadingValue | undefined",
            runtimeType: ["Boolean","Number","Object"],
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "loadingText",
            label: "loadingText",
            tsType: "string | undefined",
            runtimeType: "String",
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "position",
            label: "position",
            tsType: "\"static\" | \"relative\" | \"fixed\" | \"absolute\" | \"sticky\" | undefined",
            runtimeType: null,
            required: false,
            hasFactoryDefault: false,
            options: ["static","relative","fixed","absolute","sticky"],
            control: CONTROL_KIND.SELECT,
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "top",
            label: "top",
            tsType: "string | number | undefined",
            runtimeType: ["Number","String"],
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "bottom",
            label: "bottom",
            tsType: "string | number | undefined",
            runtimeType: ["Number","String"],
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "left",
            label: "left",
            tsType: "string | number | undefined",
            runtimeType: ["Number","String"],
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "right",
            label: "right",
            tsType: "string | number | undefined",
            runtimeType: ["Number","String"],
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "location",
            label: "location",
            tsType: "TAnchor | undefined",
            runtimeType: null,
            required: false,
            hasFactoryDefault: false,
            options: ["top","bottom","left","right","center","center center","top left","top right","top center","bottom left","bottom right","bottom center","left top","left bottom","left center","right top","right bottom","right center"],
            control: CONTROL_KIND.SELECT,
            source: METADATA_SOURCE.ALIAS
        },
        {
            name: "value",
            label: "value",
            tsType: "any",
            runtimeType: null,
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "disabled",
            label: "disabled",
            tsType: "boolean | undefined",
            runtimeType: "Boolean",
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.SWITCH,
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "selectedClass",
            label: "selectedClass",
            tsType: "string | undefined",
            runtimeType: "String",
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "padding",
            label: "padding",
            tsType: "string | number | boolean | undefined",
            runtimeType: ["Boolean","Number","String"],
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            description: "Global shorthand. `16` → `16px`; `\"4\"` → the `--origam-space---4`\ndesign rung; `\"8px 16px\"` → block / inline; `true` → the legacy\n`--padded` class.",
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "paddingTop",
            label: "paddingTop",
            tsType: "string | number | boolean | undefined",
            runtimeType: ["Boolean","Number","String"],
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            description: "Overrides `padding` and `paddingBlock` for the top edge.",
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "paddingLeft",
            label: "paddingLeft",
            tsType: "string | number | boolean | undefined",
            runtimeType: ["Boolean","Number","String"],
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            description: "Overrides `padding` and `paddingInline` for the left edge.",
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "paddingBottom",
            label: "paddingBottom",
            tsType: "string | number | boolean | undefined",
            runtimeType: ["Boolean","Number","String"],
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            description: "Overrides `padding` and `paddingBlock` for the bottom edge.",
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "paddingRight",
            label: "paddingRight",
            tsType: "string | number | boolean | undefined",
            runtimeType: ["Boolean","Number","String"],
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            description: "Overrides `padding` and `paddingInline` for the right edge.",
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "paddingBlock",
            label: "paddingBlock",
            tsType: "string | number | boolean | undefined",
            runtimeType: ["Boolean","Number","String"],
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            description: "Top + bottom. Overrides `padding`; beaten by `paddingTop` / `paddingBottom`.",
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "paddingInline",
            label: "paddingInline",
            tsType: "string | number | boolean | undefined",
            runtimeType: ["Boolean","Number","String"],
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            description: "Left + right. Overrides `padding`; beaten by `paddingLeft` / `paddingRight`.",
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "paddingInlineStart",
            label: "paddingInlineStart",
            tsType: "string | number | boolean | undefined",
            runtimeType: ["Boolean","Number","String"],
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            description: "*******************************************************\nLogical per-side padding — rung 3 (issue #1013)",
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "paddingInlineEnd",
            label: "paddingInlineEnd",
            tsType: "string | number | boolean | undefined",
            runtimeType: ["Boolean","Number","String"],
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "paddingBlockStart",
            label: "paddingBlockStart",
            tsType: "string | number | boolean | undefined",
            runtimeType: ["Boolean","Number","String"],
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "paddingBlockEnd",
            label: "paddingBlockEnd",
            tsType: "string | number | boolean | undefined",
            runtimeType: ["Boolean","Number","String"],
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "margin",
            label: "margin",
            tsType: "string | number | boolean | undefined",
            runtimeType: ["Boolean","Number","String"],
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            description: "Global shorthand. `16` → `16px`; `\"4\"` → the `--origam-space---4`\ndesign rung; `\"8px 16px\"` → block / inline; `true` → the legacy\n`--marged` class.",
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "marginTop",
            label: "marginTop",
            tsType: "string | number | boolean | undefined",
            runtimeType: ["Boolean","Number","String"],
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            description: "Overrides `margin` and `marginBlock` for the top edge.",
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "marginLeft",
            label: "marginLeft",
            tsType: "string | number | boolean | undefined",
            runtimeType: ["Boolean","Number","String"],
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            description: "Overrides `margin` and `marginInline` for the left edge.",
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "marginBottom",
            label: "marginBottom",
            tsType: "string | number | boolean | undefined",
            runtimeType: ["Boolean","Number","String"],
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            description: "Overrides `margin` and `marginBlock` for the bottom edge.",
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "marginRight",
            label: "marginRight",
            tsType: "string | number | boolean | undefined",
            runtimeType: ["Boolean","Number","String"],
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            description: "Overrides `margin` and `marginInline` for the right edge.",
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "marginBlock",
            label: "marginBlock",
            tsType: "string | number | boolean | undefined",
            runtimeType: ["Boolean","Number","String"],
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            description: "Top + bottom. Overrides `margin`; beaten by `marginTop` / `marginBottom`.",
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "marginInline",
            label: "marginInline",
            tsType: "string | number | boolean | undefined",
            runtimeType: ["Boolean","Number","String"],
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            description: "Left + right. Overrides `margin`; beaten by `marginLeft` / `marginRight`.",
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "marginInlineStart",
            label: "marginInlineStart",
            tsType: "string | number | boolean | undefined",
            runtimeType: ["Boolean","Number","String"],
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            description: "*******************************************************\nLogical per-side margin — rung 3 (issue #1013)",
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "marginInlineEnd",
            label: "marginInlineEnd",
            tsType: "string | number | boolean | undefined",
            runtimeType: ["Boolean","Number","String"],
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "marginBlockStart",
            label: "marginBlockStart",
            tsType: "string | number | boolean | undefined",
            runtimeType: ["Boolean","Number","String"],
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "marginBlockEnd",
            label: "marginBlockEnd",
            tsType: "string | number | boolean | undefined",
            runtimeType: ["Boolean","Number","String"],
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "appendAvatar",
            label: "appendAvatar",
            tsType: "string | undefined",
            runtimeType: "String",
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "appendIcon",
            label: "appendIcon",
            tsType: "TIcon | undefined",
            runtimeType: null,
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "prependAvatar",
            label: "prependAvatar",
            tsType: "string | undefined",
            runtimeType: "String",
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "prependIcon",
            label: "prependIcon",
            tsType: "TIcon | undefined",
            runtimeType: null,
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "prependAriaLabel",
            label: "prependAriaLabel",
            tsType: "string | undefined",
            runtimeType: "String",
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "appendAriaLabel",
            label: "appendAriaLabel",
            tsType: "string | undefined",
            runtimeType: "String",
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "hover",
            label: "hover",
            tsType: "boolean | IStateEffectConfig | undefined",
            runtimeType: ["Boolean","Object"],
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "hoverClass",
            label: "hoverClass",
            tsType: "string | undefined",
            runtimeType: "String",
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "active",
            label: "active",
            tsType: "boolean | IStateEffectConfig | undefined",
            runtimeType: ["Boolean","Object"],
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "activeClass",
            label: "activeClass",
            tsType: "string | undefined",
            runtimeType: "String",
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "variant",
            label: "variant",
            tsType: "\"text\" | \"flat\" | \"elevated\" | \"tonal\" | \"outlined\" | \"plain\" | \"ghost\" | undefined",
            runtimeType: null,
            required: false,
            hasFactoryDefault: false,
            options: ["text","flat","elevated","tonal","outlined","plain","ghost"],
            control: CONTROL_KIND.SELECT,
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "fontSize",
            label: "fontSize",
            tsType: "\"xs\" | \"sm\" | \"md\" | \"lg\" | \"xl\" | \"2xl\" | \"3xl\" | \"4xl\" | \"5xl\" | undefined",
            runtimeType: null,
            required: false,
            hasFactoryDefault: false,
            options: ["xs","sm","md","lg","xl","2xl","3xl","4xl","5xl"],
            control: CONTROL_KIND.SELECT,
            description: "Font size token. Maps to `--origam-font__size---{fontSize}`\n(xs · sm · md · lg · xl · 2xl · 3xl · 4xl · 5xl).\nWhen unset, the component keeps its theme / density font-size.",
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "fontWeight",
            label: "fontWeight",
            tsType: "\"regular\" | \"medium\" | \"semibold\" | \"bold\" | \"extrabold\" | \"black\" | undefined",
            runtimeType: null,
            required: false,
            hasFactoryDefault: false,
            options: ["regular","medium","semibold","bold","extrabold","black"],
            control: CONTROL_KIND.SELECT,
            description: "Font weight token. Maps to `--origam-font__weight---{fontWeight}`\n(regular 400 · medium 500 · semibold 600 · bold 700 · extrabold 800 · black 900).\nWhen unset, the component keeps its theme font-weight.",
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "lineHeight",
            label: "lineHeight",
            tsType: "\"none\" | \"tight\" | \"snug\" | \"normal\" | \"relaxed\" | \"loose\" | undefined",
            runtimeType: null,
            required: false,
            hasFactoryDefault: false,
            options: ["none","tight","snug","normal","relaxed","loose"],
            control: CONTROL_KIND.SELECT,
            description: "Line-height token. Maps to `--origam-font__lineHeight---{lineHeight}`\n(none 1 · tight 1.25 · snug 1.375 · normal 1.5 · relaxed 1.625 · loose 2).\nWhen unset, the component keeps its theme line-height.",
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "letterSpacing",
            label: "letterSpacing",
            tsType: "\"tight\" | \"normal\" | \"wide\" | \"wider\" | \"widest\" | undefined",
            runtimeType: null,
            required: false,
            hasFactoryDefault: false,
            options: ["tight","normal","wide","wider","widest"],
            control: CONTROL_KIND.SELECT,
            description: "Letter-spacing token. Maps to `--origam-font__letterSpacing---{letterSpacing}`\n(tight -0.025em · normal 0em · wide 0.0094em · wider 0.0125em · widest 0.0893em).\nWhen unset, the component keeps its theme letter-spacing.",
            source: METADATA_SOURCE.TYPES
        }
        ],
        events: [
        {
            name: "group:selected",
            label: "group:selected",
            payloadType: "[value: { value: boolean; }]",
            source: METADATA_SOURCE.TYPES
        }
        ],
        slots: [
        {
            name: "wrapper",
            label: "wrapper",
            slotPropsType: "any",
            description: "Overrides the whole loader/prepend/content/append layout.",
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "loader",
            label: "loader",
            slotPropsType: "Record<string, unknown>",
            description: "Overrides the active loader (line/circular), receives the\nforwarded `<OrigamProgress>` props.",
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "default",
            label: "default",
            slotPropsType: "any",
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "prepend",
            label: "prepend",
            slotPropsType: "any",
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "append",
            label: "append",
            slotPropsType: "any",
            source: METADATA_SOURCE.TYPES
        }
        ],
        snippets: [],
        requiresParent: false
    },
    {
        name: "OrigamSelect",
        tag: "origam-select",
        family: "Select",
        label: "Select",
        category: "Form & Input",
        props: [
        {
            name: "chips",
            label: "chips",
            tsType: "boolean | undefined",
            runtimeType: "Boolean",
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.SWITCH,
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "closableChips",
            label: "closableChips",
            tsType: "boolean | undefined",
            runtimeType: "Boolean",
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.SWITCH,
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "hideNoData",
            label: "hideNoData",
            tsType: "boolean | undefined",
            runtimeType: "Boolean",
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.SWITCH,
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "hideSelected",
            label: "hideSelected",
            tsType: "boolean | undefined",
            runtimeType: "Boolean",
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.SWITCH,
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "listProps",
            label: "listProps",
            tsType: "IListProps | undefined",
            runtimeType: "Object",
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.JSON,
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "menu",
            label: "menu",
            tsType: "boolean | undefined",
            runtimeType: "Boolean",
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.SWITCH,
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "menuIcon",
            label: "menuIcon",
            tsType: "TIcon | undefined",
            runtimeType: null,
            required: false,
            defaultValue: "mdi:mdi-chevron-down",
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "menuProps",
            label: "menuProps",
            tsType: "IMenuProps | undefined",
            runtimeType: "Object",
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.JSON,
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "chipProps",
            label: "chipProps",
            tsType: "IChipProps | undefined",
            runtimeType: "Object",
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.JSON,
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "multiple",
            label: "multiple",
            tsType: "boolean | undefined",
            runtimeType: "Boolean",
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.SWITCH,
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "noDataText",
            label: "noDataText",
            tsType: "string | undefined",
            runtimeType: "String",
            required: false,
            defaultValue: "origam.no_data_text",
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "openOnClear",
            label: "openOnClear",
            tsType: "boolean | undefined",
            runtimeType: "Boolean",
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.SWITCH,
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "autocomplete",
            label: "autocomplete",
            tsType: "boolean | undefined",
            runtimeType: "Boolean",
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.SWITCH,
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "autoSelectFirst",
            label: "autoSelectFirst",
            tsType: "string | boolean | undefined",
            runtimeType: ["Boolean","String"],
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "clearOnSelect",
            label: "clearOnSelect",
            tsType: "boolean | undefined",
            runtimeType: "Boolean",
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.SWITCH,
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "divider",
            label: "divider",
            tsType: "string | undefined",
            runtimeType: "String",
            required: false,
            defaultValue: ",",
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "search",
            label: "search",
            tsType: "string | undefined",
            runtimeType: "String",
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "closeText",
            label: "closeText",
            tsType: "string | undefined",
            runtimeType: "String",
            required: false,
            defaultValue: "origam.close",
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "openText",
            label: "openText",
            tsType: "string | undefined",
            runtimeType: "String",
            required: false,
            defaultValue: "origam.open",
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "id",
            label: "id",
            tsType: "string | undefined",
            runtimeType: "String",
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "class",
            label: "class",
            tsType: null,
            runtimeType: ["String","Array","Object"],
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.RUNTIME
        },
        {
            name: "style",
            label: "style",
            tsType: null,
            runtimeType: ["String","Array","Object","Boolean"],
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.RUNTIME
        },
        {
            name: "color",
            label: "color",
            tsType: "TColor",
            runtimeType: ["String","Object","Boolean"],
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "bgColor",
            label: "bgColor",
            tsType: "TColor",
            runtimeType: ["String","Object","Boolean"],
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "autofocus",
            label: "autofocus",
            tsType: "boolean | undefined",
            runtimeType: "Boolean",
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.SWITCH,
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "counter",
            label: "counter",
            tsType: "string | number | boolean | undefined",
            runtimeType: ["Boolean","Number","String"],
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "counterValue",
            label: "counterValue",
            tsType: "number | ((e: any) => number) | undefined",
            runtimeType: ["Number","Function"],
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "placeholder",
            label: "placeholder",
            tsType: "string | undefined",
            runtimeType: "String",
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "persistentPlaceholder",
            label: "persistentPlaceholder",
            tsType: "boolean | undefined",
            runtimeType: "Boolean",
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.SWITCH,
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "persistentCounter",
            label: "persistentCounter",
            tsType: "boolean | undefined",
            runtimeType: "Boolean",
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.SWITCH,
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "role",
            label: "role",
            tsType: "string | undefined",
            runtimeType: "String",
            required: false,
            defaultValue: "combobox",
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "type",
            label: "type",
            tsType: "\"number\" | \"text\" | \"color\" | \"search\" | \"image\" | \"button\" | \"month\" | \"week\" | \"submit\" | \"email\" | \"password\" | \"hidden\" | \"tel\" | \"url\" | \"range\" | \"file\" | \"reset\" | \"checkbox\" | \"radio\" | \"time\" | \"datetime-local\" | \"date\" | undefined",
            runtimeType: null,
            required: false,
            defaultValue: "text",
            hasFactoryDefault: false,
            options: ["number","text","color","search","image","button","month","week","submit","email","password","hidden","tel","url","range","file","reset","checkbox","radio","time","datetime-local","date"],
            control: CONTROL_KIND.SELECT,
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "modelModifiers",
            label: "modelModifiers",
            tsType: "string | boolean | undefined",
            runtimeType: ["String","Boolean"],
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "mask",
            label: "mask",
            tsType: "TMask | undefined",
            runtimeType: null,
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            description: "Mask spec — built-in preset key (`'phone:fr'`, …), a\nraw pattern (`'(##) ###-####'`) or a full options object.\nWhen set, `v-model` exposes the UNMASKED value; the DOM\ninput displays the formatted (masked) string.",
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "density",
            label: "density",
            tsType: "\"default\" | \"compact\" | \"comfortable\" | undefined",
            runtimeType: null,
            required: false,
            defaultValue: "default",
            hasFactoryDefault: false,
            options: ["default","compact","comfortable"],
            control: CONTROL_KIND.SELECT,
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "centerAffix",
            label: "centerAffix",
            tsType: "boolean | undefined",
            runtimeType: "Boolean",
            required: false,
            defaultValue: true,
            hasFactoryDefault: false,
            control: CONTROL_KIND.SWITCH,
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "dirty",
            label: "dirty",
            tsType: "boolean | undefined",
            runtimeType: "Boolean",
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.SWITCH,
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "disabled",
            label: "disabled",
            tsType: "boolean | undefined",
            runtimeType: "Boolean",
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.SWITCH,
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "error",
            label: "error",
            tsType: "string | boolean | undefined",
            runtimeType: ["String","Boolean"],
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            description: "Error state for the field.\n  - `boolean` — paints the `--error` modifier (rules-driven flow).\n  - `string`  — paints the modifier AND becomes the inline error\n    message rendered by consumers that opt-in (e.g. FileField's\n    dropzone). For consumers that don't read the string, the\n    truthy semantics still apply.\n  - `false` / omitted — no error.",
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "inline",
            label: "inline",
            tsType: "boolean | undefined",
            runtimeType: "Boolean",
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.SWITCH,
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "label",
            label: "label",
            tsType: "string | undefined",
            runtimeType: "String",
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "prefix",
            label: "prefix",
            tsType: "string | undefined",
            runtimeType: "String",
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "suffix",
            label: "suffix",
            tsType: "string | undefined",
            runtimeType: "String",
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "persistentClear",
            label: "persistentClear",
            tsType: "boolean | undefined",
            runtimeType: "Boolean",
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.SWITCH,
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "singleLine",
            label: "singleLine",
            tsType: "boolean | undefined",
            runtimeType: "Boolean",
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.SWITCH,
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "required",
            label: "required",
            tsType: "boolean | undefined",
            runtimeType: "Boolean",
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.SWITCH,
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "loading",
            label: "loading",
            tsType: "TControlLoadingValue | undefined",
            runtimeType: ["Boolean","Number","Object"],
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "loadingText",
            label: "loadingText",
            tsType: "string | undefined",
            runtimeType: "String",
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "tag",
            label: "tag",
            tsType: "string | undefined",
            runtimeType: "String",
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "appendInnerAvatar",
            label: "appendInnerAvatar",
            tsType: "string | undefined",
            runtimeType: "String",
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "appendInnerIcon",
            label: "appendInnerIcon",
            tsType: "TIcon | undefined",
            runtimeType: null,
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "prependInnerAvatar",
            label: "prependInnerAvatar",
            tsType: "string | undefined",
            runtimeType: "String",
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "prependInnerIcon",
            label: "prependInnerIcon",
            tsType: "TIcon | undefined",
            runtimeType: null,
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "clearIcon",
            label: "clearIcon",
            tsType: "TIcon | undefined",
            runtimeType: null,
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "clearable",
            label: "clearable",
            tsType: "boolean | undefined",
            runtimeType: "Boolean",
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.SWITCH,
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "prependInnerAriaLabel",
            label: "prependInnerAriaLabel",
            tsType: "string | undefined",
            runtimeType: "String",
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "appendInnerAriaLabel",
            label: "appendInnerAriaLabel",
            tsType: "string | undefined",
            runtimeType: "String",
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "border",
            label: "border",
            tsType: "string | number | boolean | TDirectionBoth[] | undefined",
            runtimeType: ["Boolean","Number","String","Array"],
            required: false,
            defaultValue: true,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "borderTop",
            label: "borderTop",
            tsType: "string | number | boolean | undefined",
            runtimeType: ["Boolean","Number","String"],
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "borderLeft",
            label: "borderLeft",
            tsType: "string | number | boolean | undefined",
            runtimeType: ["Boolean","Number","String"],
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "borderBottom",
            label: "borderBottom",
            tsType: "string | number | boolean | undefined",
            runtimeType: ["Boolean","Number","String"],
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "borderRight",
            label: "borderRight",
            tsType: "string | number | boolean | undefined",
            runtimeType: ["Boolean","Number","String"],
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "borderBlock",
            label: "borderBlock",
            tsType: "string | number | boolean | undefined",
            runtimeType: ["Boolean","Number","String"],
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            description: "Logical-axis shorthand for the block-start + block-end edges (top +\nbottom in the default horizontal-tb writing mode). Resolves to the\nnative CSS `border-block-{width,style,color}` properties — same\nvalue grammar as `borderTop` / `borderRight` / `borderBottom` /\n`borderLeft` (boolean opt-in, bare width number, or a free-form\n`\"width style color\"` string). Precedence: beats the global `border`\nshorthand for the edges it targets, but a physical `borderTop` /\n`borderBottom` still wins over it for that specific edge — see\n`useBorder` JSDoc for the full precedence table.",
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "borderInline",
            label: "borderInline",
            tsType: "string | number | boolean | undefined",
            runtimeType: ["Boolean","Number","String"],
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            description: "Logical-axis shorthand for the inline-start + inline-end edges (left\n+ right in LTR). Same grammar and precedence rules as `borderBlock`,\nmapped onto `border-inline-{width,style,color}`.",
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "borderInlineStart",
            label: "borderInlineStart",
            tsType: "string | number | boolean | undefined",
            runtimeType: ["Boolean","Number","String"],
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            description: "*******************************************************\nborderInlineStart",
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "borderInlineEnd",
            label: "borderInlineEnd",
            tsType: "string | number | boolean | undefined",
            runtimeType: ["Boolean","Number","String"],
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            description: "*******************************************************\nborderInlineEnd",
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "borderBlockStart",
            label: "borderBlockStart",
            tsType: "string | number | boolean | undefined",
            runtimeType: ["Boolean","Number","String"],
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            description: "*******************************************************\nborderBlockStart",
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "borderBlockEnd",
            label: "borderBlockEnd",
            tsType: "string | number | boolean | undefined",
            runtimeType: ["Boolean","Number","String"],
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            description: "*******************************************************\nborderBlockEnd",
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "borderColor",
            label: "borderColor",
            tsType: "string | undefined",
            runtimeType: "String",
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "borderStyle",
            label: "borderStyle",
            tsType: "string | undefined",
            runtimeType: "String",
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "borderTopColor",
            label: "borderTopColor",
            tsType: "TColor",
            runtimeType: ["String","Object","Boolean"],
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            description: "Per-side color override (issue #215). Additive: absent by default,\nno behaviour change for existing consumers.\n\nPrecedence (specific > global): `borderTopColor` wins over any\ncolor implied by `borderTop` (e.g. `borderTop=\"2px dashed red\"`),\nwhich itself wins over the global `borderColor` / `border` shorthand\nfor the top side. See `useBorder` JSDoc for the full precedence\ntable.\n\nAccepts a {@link TColor} (semantic intent, raw CSS color, or falsy\nto opt out) — same input family as `color` / `bgColor`. Gradients\nare NOT supported on border colors (CSS `border-color` has no\ngradient form) and are silently ignored.",
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "borderRightColor",
            label: "borderRightColor",
            tsType: "TColor",
            runtimeType: ["String","Object","Boolean"],
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "borderBottomColor",
            label: "borderBottomColor",
            tsType: "TColor",
            runtimeType: ["String","Object","Boolean"],
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "borderLeftColor",
            label: "borderLeftColor",
            tsType: "TColor",
            runtimeType: ["String","Object","Boolean"],
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "borderInlineStartColor",
            label: "borderInlineStartColor",
            tsType: "TColor",
            runtimeType: ["String","Object","Boolean"],
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            description: "*******************************************************\nborderInlineStartColor",
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "borderInlineEndColor",
            label: "borderInlineEndColor",
            tsType: "TColor",
            runtimeType: ["String","Object","Boolean"],
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            description: "*******************************************************\nborderInlineEndColor",
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "borderBlockStartColor",
            label: "borderBlockStartColor",
            tsType: "TColor",
            runtimeType: ["String","Object","Boolean"],
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            description: "*******************************************************\nborderBlockStartColor",
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "borderBlockEndColor",
            label: "borderBlockEndColor",
            tsType: "TColor",
            runtimeType: ["String","Object","Boolean"],
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            description: "*******************************************************\nborderBlockEndColor",
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "focused",
            label: "focused",
            tsType: "boolean | undefined",
            runtimeType: "Boolean",
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.SWITCH,
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "text",
            label: "text",
            tsType: "string | undefined",
            runtimeType: "String",
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "floating",
            label: "floating",
            tsType: "boolean | undefined",
            runtimeType: "Boolean",
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.SWITCH,
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "name",
            label: "name",
            tsType: "string | undefined",
            runtimeType: "String",
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "margin",
            label: "margin",
            tsType: "string | number | boolean | undefined",
            runtimeType: ["Boolean","Number","String"],
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            description: "Global shorthand. `16` → `16px`; `\"4\"` → the `--origam-space---4`\ndesign rung; `\"8px 16px\"` → block / inline; `true` → the legacy\n`--marged` class.",
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "marginTop",
            label: "marginTop",
            tsType: "string | number | boolean | undefined",
            runtimeType: ["Boolean","Number","String"],
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            description: "Overrides `margin` and `marginBlock` for the top edge.",
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "marginLeft",
            label: "marginLeft",
            tsType: "string | number | boolean | undefined",
            runtimeType: ["Boolean","Number","String"],
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            description: "Overrides `margin` and `marginInline` for the left edge.",
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "marginBottom",
            label: "marginBottom",
            tsType: "string | number | boolean | undefined",
            runtimeType: ["Boolean","Number","String"],
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            description: "Overrides `margin` and `marginBlock` for the bottom edge.",
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "marginRight",
            label: "marginRight",
            tsType: "string | number | boolean | undefined",
            runtimeType: ["Boolean","Number","String"],
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            description: "Overrides `margin` and `marginInline` for the right edge.",
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "marginBlock",
            label: "marginBlock",
            tsType: "string | number | boolean | undefined",
            runtimeType: ["Boolean","Number","String"],
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            description: "Top + bottom. Overrides `margin`; beaten by `marginTop` / `marginBottom`.",
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "marginInline",
            label: "marginInline",
            tsType: "string | number | boolean | undefined",
            runtimeType: ["Boolean","Number","String"],
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            description: "Left + right. Overrides `margin`; beaten by `marginLeft` / `marginRight`.",
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "marginInlineStart",
            label: "marginInlineStart",
            tsType: "string | number | boolean | undefined",
            runtimeType: ["Boolean","Number","String"],
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            description: "*******************************************************\nLogical per-side margin — rung 3 (issue #1013)",
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "marginInlineEnd",
            label: "marginInlineEnd",
            tsType: "string | number | boolean | undefined",
            runtimeType: ["Boolean","Number","String"],
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "marginBlockStart",
            label: "marginBlockStart",
            tsType: "string | number | boolean | undefined",
            runtimeType: ["Boolean","Number","String"],
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "marginBlockEnd",
            label: "marginBlockEnd",
            tsType: "string | number | boolean | undefined",
            runtimeType: ["Boolean","Number","String"],
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "padding",
            label: "padding",
            tsType: "string | number | boolean | undefined",
            runtimeType: ["Boolean","Number","String"],
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            description: "Global shorthand. `16` → `16px`; `\"4\"` → the `--origam-space---4`\ndesign rung; `\"8px 16px\"` → block / inline; `true` → the legacy\n`--padded` class.",
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "paddingTop",
            label: "paddingTop",
            tsType: "string | number | boolean | undefined",
            runtimeType: ["Boolean","Number","String"],
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            description: "Overrides `padding` and `paddingBlock` for the top edge.",
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "paddingLeft",
            label: "paddingLeft",
            tsType: "string | number | boolean | undefined",
            runtimeType: ["Boolean","Number","String"],
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            description: "Overrides `padding` and `paddingInline` for the left edge.",
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "paddingBottom",
            label: "paddingBottom",
            tsType: "string | number | boolean | undefined",
            runtimeType: ["Boolean","Number","String"],
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            description: "Overrides `padding` and `paddingBlock` for the bottom edge.",
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "paddingRight",
            label: "paddingRight",
            tsType: "string | number | boolean | undefined",
            runtimeType: ["Boolean","Number","String"],
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            description: "Overrides `padding` and `paddingInline` for the right edge.",
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "paddingBlock",
            label: "paddingBlock",
            tsType: "string | number | boolean | undefined",
            runtimeType: ["Boolean","Number","String"],
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            description: "Top + bottom. Overrides `padding`; beaten by `paddingTop` / `paddingBottom`.",
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "paddingInline",
            label: "paddingInline",
            tsType: "string | number | boolean | undefined",
            runtimeType: ["Boolean","Number","String"],
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            description: "Left + right. Overrides `padding`; beaten by `paddingLeft` / `paddingRight`.",
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "paddingInlineStart",
            label: "paddingInlineStart",
            tsType: "string | number | boolean | undefined",
            runtimeType: ["Boolean","Number","String"],
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            description: "*******************************************************\nLogical per-side padding — rung 3 (issue #1013)",
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "paddingInlineEnd",
            label: "paddingInlineEnd",
            tsType: "string | number | boolean | undefined",
            runtimeType: ["Boolean","Number","String"],
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "paddingBlockStart",
            label: "paddingBlockStart",
            tsType: "string | number | boolean | undefined",
            runtimeType: ["Boolean","Number","String"],
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "paddingBlockEnd",
            label: "paddingBlockEnd",
            tsType: "string | number | boolean | undefined",
            runtimeType: ["Boolean","Number","String"],
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "rounded",
            label: "rounded",
            tsType: "string | number | boolean | null | undefined",
            runtimeType: ["Boolean","Number","String"],
            required: false,
            defaultValue: true,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            description: "Corner-radius selector. Three modes:\n - **named variant** (`'small' | 'default' | 'large' | …`,\n   cf. `ROUNDED` enum) → emits `--rounded-{name}` class so the\n   component's SCSS can pick the right token rung.\n - **boolean `true`** (or empty string `''`) → emits the legacy\n   `--rounded` class for components that only have a single rounded\n   state (e.g. `OrigamBtn` defaulting to `radius.2xl`).\n - **CSS value** (`'4px'`, `'4px 0 4px 0'`, `100`) → emits inline\n   `border-radius` declarations via `useRounded.roundedStyles`.",
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "roundedTopRight",
            label: "roundedTopRight",
            tsType: "string | number | boolean | undefined",
            runtimeType: ["Boolean","Number","String"],
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            description: "Top-right corner only. Takes the same vocabulary as `rounded`\n(`8`, `'8px'`, `'md'`, `'large'`, `'var(…)'`), minus `shaped` /\n`shaped-invert` which are asymmetric by definition.",
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "roundedTopLeft",
            label: "roundedTopLeft",
            tsType: "string | number | boolean | undefined",
            runtimeType: ["Boolean","Number","String"],
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            description: "Top-left corner only. Same vocabulary as `roundedTopRight`.",
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "roundedBottomLeft",
            label: "roundedBottomLeft",
            tsType: "string | number | boolean | undefined",
            runtimeType: ["Boolean","Number","String"],
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            description: "Bottom-left corner only. Same vocabulary as `roundedTopRight`.",
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "roundedBottomRight",
            label: "roundedBottomRight",
            tsType: "string | number | boolean | undefined",
            runtimeType: ["Boolean","Number","String"],
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            description: "Bottom-right corner only. Same vocabulary as `roundedTopRight`.",
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "roundedStartStart",
            label: "roundedStartStart",
            tsType: "string | number | boolean | undefined",
            runtimeType: ["Boolean","Number","String"],
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            description: "*******************************************************\nLogical per-corner radius — rung 2 (issue #1013)",
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "roundedStartEnd",
            label: "roundedStartEnd",
            tsType: "string | number | boolean | undefined",
            runtimeType: ["Boolean","Number","String"],
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "roundedEndStart",
            label: "roundedEndStart",
            tsType: "string | number | boolean | undefined",
            runtimeType: ["Boolean","Number","String"],
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "roundedEndEnd",
            label: "roundedEndEnd",
            tsType: "string | number | boolean | undefined",
            runtimeType: ["Boolean","Number","String"],
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "fontSize",
            label: "fontSize",
            tsType: "\"xs\" | \"sm\" | \"md\" | \"lg\" | \"xl\" | \"2xl\" | \"3xl\" | \"4xl\" | \"5xl\" | undefined",
            runtimeType: null,
            required: false,
            hasFactoryDefault: false,
            options: ["xs","sm","md","lg","xl","2xl","3xl","4xl","5xl"],
            control: CONTROL_KIND.SELECT,
            description: "Font size token. Maps to `--origam-font__size---{fontSize}`\n(xs · sm · md · lg · xl · 2xl · 3xl · 4xl · 5xl).\nWhen unset, the component keeps its theme / density font-size.",
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "fontWeight",
            label: "fontWeight",
            tsType: "\"regular\" | \"medium\" | \"semibold\" | \"bold\" | \"extrabold\" | \"black\" | undefined",
            runtimeType: null,
            required: false,
            hasFactoryDefault: false,
            options: ["regular","medium","semibold","bold","extrabold","black"],
            control: CONTROL_KIND.SELECT,
            description: "Font weight token. Maps to `--origam-font__weight---{fontWeight}`\n(regular 400 · medium 500 · semibold 600 · bold 700 · extrabold 800 · black 900).\nWhen unset, the component keeps its theme font-weight.",
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "lineHeight",
            label: "lineHeight",
            tsType: "\"none\" | \"tight\" | \"snug\" | \"normal\" | \"relaxed\" | \"loose\" | undefined",
            runtimeType: null,
            required: false,
            hasFactoryDefault: false,
            options: ["none","tight","snug","normal","relaxed","loose"],
            control: CONTROL_KIND.SELECT,
            description: "Line-height token. Maps to `--origam-font__lineHeight---{lineHeight}`\n(none 1 · tight 1.25 · snug 1.375 · normal 1.5 · relaxed 1.625 · loose 2).\nWhen unset, the component keeps its theme line-height.",
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "letterSpacing",
            label: "letterSpacing",
            tsType: "\"tight\" | \"normal\" | \"wide\" | \"wider\" | \"widest\" | undefined",
            runtimeType: null,
            required: false,
            hasFactoryDefault: false,
            options: ["tight","normal","wide","wider","widest"],
            control: CONTROL_KIND.SELECT,
            description: "Letter-spacing token. Maps to `--origam-font__letterSpacing---{letterSpacing}`\n(tight -0.025em · normal 0em · wide 0.0094em · wider 0.0125em · widest 0.0893em).\nWhen unset, the component keeps its theme letter-spacing.",
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "active",
            label: "active",
            tsType: "boolean | IStateEffectConfig | undefined",
            runtimeType: ["Boolean","Object"],
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "activeClass",
            label: "activeClass",
            tsType: "string | undefined",
            runtimeType: "String",
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "variant",
            label: "variant",
            tsType: "\"outlined\" | \"plain\" | \"underlined\" | \"filled\" | \"solo\" | undefined",
            runtimeType: null,
            required: false,
            hasFactoryDefault: false,
            options: ["outlined","plain","underlined","filled","solo"],
            control: CONTROL_KIND.SELECT,
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "elevation",
            label: "elevation",
            tsType: "TElevation | undefined",
            runtimeType: ["Number","String"],
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "size",
            label: "size",
            tsType: "number | \"default\" | \"x-small\" | \"small\" | \"large\" | \"x-large\" | undefined",
            runtimeType: null,
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "hideDetails",
            label: "hideDetails",
            tsType: "string | boolean | undefined",
            runtimeType: ["Boolean","String"],
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "hideSpinButtons",
            label: "hideSpinButtons",
            tsType: "boolean | undefined",
            runtimeType: "Boolean",
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.SWITCH,
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "hint",
            label: "hint",
            tsType: "string | undefined",
            runtimeType: "String",
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "persistentHint",
            label: "persistentHint",
            tsType: "boolean | undefined",
            runtimeType: "Boolean",
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.SWITCH,
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "messages",
            label: "messages",
            tsType: "string | string[] | undefined",
            runtimeType: ["Array","String"],
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "height",
            label: "height",
            tsType: "string | number | undefined",
            runtimeType: ["Number","String"],
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "maxHeight",
            label: "maxHeight",
            tsType: "string | number | undefined",
            runtimeType: ["Number","String"],
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "maxWidth",
            label: "maxWidth",
            tsType: "string | number | undefined",
            runtimeType: ["Number","String"],
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "minHeight",
            label: "minHeight",
            tsType: "string | number | undefined",
            runtimeType: ["Number","String"],
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "minWidth",
            label: "minWidth",
            tsType: "string | number | undefined",
            runtimeType: ["Number","String"],
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "width",
            label: "width",
            tsType: "string | number | undefined",
            runtimeType: ["Number","String"],
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "direction",
            label: "direction",
            tsType: "\"horizontal\" | \"vertical\" | undefined",
            runtimeType: null,
            required: false,
            defaultValue: "horizontal",
            hasFactoryDefault: false,
            options: ["horizontal","vertical"],
            control: CONTROL_KIND.SELECT,
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "errorMessages",
            label: "errorMessages",
            tsType: "string | string[] | undefined",
            runtimeType: ["Array","String"],
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "maxErrors",
            label: "maxErrors",
            tsType: "string | number | undefined",
            runtimeType: ["Number","String"],
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "readonly",
            label: "readonly",
            tsType: "boolean | undefined",
            runtimeType: "Boolean",
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.SWITCH,
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "rules",
            label: "rules",
            tsType: "any[] | undefined",
            runtimeType: "Array",
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.JSON,
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "modelValue",
            label: "modelValue",
            tsType: "any",
            runtimeType: null,
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "validateOn",
            label: "validateOn",
            tsType: "\"blur\" | \"input\" | \"submit\" | \"lazy blur\" | \"lazy input\" | \"lazy submit\" | \"blur lazy\" | \"input lazy\" | \"submit lazy\" | \"lazy\" | undefined",
            runtimeType: null,
            required: false,
            hasFactoryDefault: false,
            options: ["blur","input","submit","lazy blur","lazy input","lazy submit","blur lazy","input lazy","submit lazy","lazy"],
            control: CONTROL_KIND.SELECT,
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "validationValue",
            label: "validationValue",
            tsType: "any",
            runtimeType: null,
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "appendAvatar",
            label: "appendAvatar",
            tsType: "string | undefined",
            runtimeType: "String",
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "appendIcon",
            label: "appendIcon",
            tsType: "TIcon | undefined",
            runtimeType: null,
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "prependAvatar",
            label: "prependAvatar",
            tsType: "string | undefined",
            runtimeType: "String",
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "prependIcon",
            label: "prependIcon",
            tsType: "TIcon | undefined",
            runtimeType: null,
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "prependAriaLabel",
            label: "prependAriaLabel",
            tsType: "string | undefined",
            runtimeType: "String",
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "appendAriaLabel",
            label: "appendAriaLabel",
            tsType: "string | undefined",
            runtimeType: "String",
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "items",
            label: "items",
            tsType: "any[] | undefined",
            runtimeType: "Array",
            required: false,
            hasFactoryDefault: true,
            control: CONTROL_KIND.JSON,
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "itemTitle",
            label: "itemTitle",
            tsType: "TSelectItemKey",
            runtimeType: null,
            required: false,
            defaultValue: "title",
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "itemValue",
            label: "itemValue",
            tsType: "TSelectItemKey",
            runtimeType: null,
            required: false,
            defaultValue: "value",
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "itemChildren",
            label: "itemChildren",
            tsType: "TSelectItemKey",
            runtimeType: null,
            required: false,
            defaultValue: "children",
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "itemProps",
            label: "itemProps",
            tsType: "TSelectItemKey",
            runtimeType: null,
            required: false,
            defaultValue: "props",
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "returnObject",
            label: "returnObject",
            tsType: "boolean | undefined",
            runtimeType: "Boolean",
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.SWITCH,
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "valueComparator",
            label: "valueComparator",
            tsType: "((a: any, b: any) => boolean) | undefined",
            runtimeType: null,
            required: false,
            hasFactoryDefault: true,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "transition",
            label: "transition",
            tsType: "string | boolean | TTransitionProps | undefined",
            runtimeType: ["Boolean","String","Object"],
            required: false,
            hasFactoryDefault: true,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "customFilter",
            label: "customFilter",
            tsType: "TFilterFunction | undefined",
            runtimeType: "Function",
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "customKeyFilter",
            label: "customKeyFilter",
            tsType: "TFilterKeyFunctions | undefined",
            runtimeType: "Object",
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.JSON,
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "filterKeys",
            label: "filterKeys",
            tsType: "TFilterKeys | undefined",
            runtimeType: ["String","Array"],
            required: false,
            hasFactoryDefault: true,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "filterMode",
            label: "filterMode",
            tsType: "\"every\" | \"some\" | \"union\" | \"intersection\" | undefined",
            runtimeType: null,
            required: false,
            defaultValue: "intersection",
            hasFactoryDefault: false,
            options: ["every","some","union","intersection"],
            control: CONTROL_KIND.SELECT,
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "noFilter",
            label: "noFilter",
            tsType: "boolean | undefined",
            runtimeType: "Boolean",
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.SWITCH,
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "eager",
            label: "eager",
            tsType: "boolean | undefined",
            runtimeType: "Boolean",
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.SWITCH,
            source: METADATA_SOURCE.TYPES
        }
        ],
        events: [
        {
            name: "update:modelValue",
            label: "update:modelValue",
            payloadType: "[event: any]",
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "click:append",
            label: "click:append",
            payloadType: "[event: MouseEvent]",
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "click:prepend",
            label: "click:prepend",
            payloadType: "[event: MouseEvent]",
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "update:focused",
            label: "update:focused",
            payloadType: "[event: any]",
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "click:appendInner",
            label: "click:appendInner",
            payloadType: "[event: MouseEvent]",
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "click:prependInner",
            label: "click:prependInner",
            payloadType: "[event: MouseEvent]",
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "click:clear",
            label: "click:clear",
            payloadType: "[event: MouseEvent]",
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "click:control",
            label: "click:control",
            payloadType: "[event: MouseEvent]",
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "mousedown:control",
            label: "mousedown:control",
            payloadType: "[event: MouseEvent]",
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "update:menu",
            label: "update:menu",
            payloadType: "[value: boolean]",
            source: METADATA_SOURCE.TYPES
        }
        ],
        slots: [
        {
            name: "items.prepend",
            label: "items.prepend",
            slotPropsType: "any",
            description: "Rendered before the option list, inside the dropdown.",
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "noData",
            label: "noData",
            slotPropsType: "any",
            description: "Overrides the \"no results\" row.",
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "item",
            label: "item",
            slotPropsType: "{ item: IInternalListItem<any>; index: number; props: Record<string, unknown>; }",
            description: "Overrides one option row — `props` is the resolved `<OrigamListItem>` prop bag.",
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "items.append",
            label: "items.append",
            slotPropsType: "any",
            description: "Rendered after the option list, inside the dropdown.",
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "chip",
            label: "chip",
            slotPropsType: "{ item: IInternalListItem<any>; index: number; props: Record<string, unknown>; }",
            description: "Overrides one selected-value chip (`chips` mode).",
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "selection",
            label: "selection",
            slotPropsType: "any",
            description: "Overrides a single selected value's text representation.",
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "clear",
            label: "clear",
            slotPropsType: "any",
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "label",
            label: "label",
            slotPropsType: "ILabelProps",
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "prefix",
            label: "prefix",
            slotPropsType: "any",
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "suffix",
            label: "suffix",
            slotPropsType: "any",
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "loader",
            label: "loader",
            slotPropsType: "any",
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "floatingLabel",
            label: "floatingLabel",
            slotPropsType: "ILabelProps",
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "prependInner",
            label: "prependInner",
            slotPropsType: "any",
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "appendInner",
            label: "appendInner",
            slotPropsType: "any",
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "prepend",
            label: "prepend",
            slotPropsType: "any",
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "append",
            label: "append",
            slotPropsType: "any",
            source: METADATA_SOURCE.TYPES
        }
        ],
        snippets: [],
        requiresParent: false
    },
    {
        name: "OrigamSwitch",
        tag: "origam-switch",
        family: "Switch",
        label: "Switch",
        category: "Form & Input",
        props: [
        {
            name: "indeterminate",
            label: "indeterminate",
            tsType: "boolean | undefined",
            runtimeType: "Boolean",
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.SWITCH,
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "inset",
            label: "inset",
            tsType: "boolean | undefined",
            runtimeType: "Boolean",
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.SWITCH,
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "id",
            label: "id",
            tsType: "string | undefined",
            runtimeType: "String",
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "class",
            label: "class",
            tsType: null,
            runtimeType: ["String","Array","Object"],
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.RUNTIME
        },
        {
            name: "style",
            label: "style",
            tsType: null,
            runtimeType: ["String","Array","Object","Boolean"],
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.RUNTIME
        },
        {
            name: "tag",
            label: "tag",
            tsType: "string | undefined",
            runtimeType: "String",
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "padding",
            label: "padding",
            tsType: "string | number | boolean | undefined",
            runtimeType: ["Boolean","Number","String"],
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            description: "Global shorthand. `16` → `16px`; `\"4\"` → the `--origam-space---4`\ndesign rung; `\"8px 16px\"` → block / inline; `true` → the legacy\n`--padded` class.",
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "paddingTop",
            label: "paddingTop",
            tsType: "string | number | boolean | undefined",
            runtimeType: ["Boolean","Number","String"],
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            description: "Overrides `padding` and `paddingBlock` for the top edge.",
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "paddingLeft",
            label: "paddingLeft",
            tsType: "string | number | boolean | undefined",
            runtimeType: ["Boolean","Number","String"],
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            description: "Overrides `padding` and `paddingInline` for the left edge.",
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "paddingBottom",
            label: "paddingBottom",
            tsType: "string | number | boolean | undefined",
            runtimeType: ["Boolean","Number","String"],
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            description: "Overrides `padding` and `paddingBlock` for the bottom edge.",
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "paddingRight",
            label: "paddingRight",
            tsType: "string | number | boolean | undefined",
            runtimeType: ["Boolean","Number","String"],
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            description: "Overrides `padding` and `paddingInline` for the right edge.",
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "paddingBlock",
            label: "paddingBlock",
            tsType: "string | number | boolean | undefined",
            runtimeType: ["Boolean","Number","String"],
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            description: "Top + bottom. Overrides `padding`; beaten by `paddingTop` / `paddingBottom`.",
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "paddingInline",
            label: "paddingInline",
            tsType: "string | number | boolean | undefined",
            runtimeType: ["Boolean","Number","String"],
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            description: "Left + right. Overrides `padding`; beaten by `paddingLeft` / `paddingRight`.",
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "paddingInlineStart",
            label: "paddingInlineStart",
            tsType: "string | number | boolean | undefined",
            runtimeType: ["Boolean","Number","String"],
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            description: "*******************************************************\nLogical per-side padding — rung 3 (issue #1013)",
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "paddingInlineEnd",
            label: "paddingInlineEnd",
            tsType: "string | number | boolean | undefined",
            runtimeType: ["Boolean","Number","String"],
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "paddingBlockStart",
            label: "paddingBlockStart",
            tsType: "string | number | boolean | undefined",
            runtimeType: ["Boolean","Number","String"],
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "paddingBlockEnd",
            label: "paddingBlockEnd",
            tsType: "string | number | boolean | undefined",
            runtimeType: ["Boolean","Number","String"],
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "margin",
            label: "margin",
            tsType: "string | number | boolean | undefined",
            runtimeType: ["Boolean","Number","String"],
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            description: "Global shorthand. `16` → `16px`; `\"4\"` → the `--origam-space---4`\ndesign rung; `\"8px 16px\"` → block / inline; `true` → the legacy\n`--marged` class.",
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "marginTop",
            label: "marginTop",
            tsType: "string | number | boolean | undefined",
            runtimeType: ["Boolean","Number","String"],
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            description: "Overrides `margin` and `marginBlock` for the top edge.",
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "marginLeft",
            label: "marginLeft",
            tsType: "string | number | boolean | undefined",
            runtimeType: ["Boolean","Number","String"],
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            description: "Overrides `margin` and `marginInline` for the left edge.",
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "marginBottom",
            label: "marginBottom",
            tsType: "string | number | boolean | undefined",
            runtimeType: ["Boolean","Number","String"],
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            description: "Overrides `margin` and `marginBlock` for the bottom edge.",
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "marginRight",
            label: "marginRight",
            tsType: "string | number | boolean | undefined",
            runtimeType: ["Boolean","Number","String"],
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            description: "Overrides `margin` and `marginInline` for the right edge.",
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "marginBlock",
            label: "marginBlock",
            tsType: "string | number | boolean | undefined",
            runtimeType: ["Boolean","Number","String"],
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            description: "Top + bottom. Overrides `margin`; beaten by `marginTop` / `marginBottom`.",
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "marginInline",
            label: "marginInline",
            tsType: "string | number | boolean | undefined",
            runtimeType: ["Boolean","Number","String"],
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            description: "Left + right. Overrides `margin`; beaten by `marginLeft` / `marginRight`.",
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "marginInlineStart",
            label: "marginInlineStart",
            tsType: "string | number | boolean | undefined",
            runtimeType: ["Boolean","Number","String"],
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            description: "*******************************************************\nLogical per-side margin — rung 3 (issue #1013)",
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "marginInlineEnd",
            label: "marginInlineEnd",
            tsType: "string | number | boolean | undefined",
            runtimeType: ["Boolean","Number","String"],
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "marginBlockStart",
            label: "marginBlockStart",
            tsType: "string | number | boolean | undefined",
            runtimeType: ["Boolean","Number","String"],
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "marginBlockEnd",
            label: "marginBlockEnd",
            tsType: "string | number | boolean | undefined",
            runtimeType: ["Boolean","Number","String"],
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "border",
            label: "border",
            tsType: "string | number | boolean | TDirectionBoth[] | undefined",
            runtimeType: ["Boolean","Number","String","Array"],
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "borderTop",
            label: "borderTop",
            tsType: "string | number | boolean | undefined",
            runtimeType: ["Boolean","Number","String"],
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "borderLeft",
            label: "borderLeft",
            tsType: "string | number | boolean | undefined",
            runtimeType: ["Boolean","Number","String"],
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "borderBottom",
            label: "borderBottom",
            tsType: "string | number | boolean | undefined",
            runtimeType: ["Boolean","Number","String"],
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "borderRight",
            label: "borderRight",
            tsType: "string | number | boolean | undefined",
            runtimeType: ["Boolean","Number","String"],
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "borderBlock",
            label: "borderBlock",
            tsType: "string | number | boolean | undefined",
            runtimeType: ["Boolean","Number","String"],
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            description: "Logical-axis shorthand for the block-start + block-end edges (top +\nbottom in the default horizontal-tb writing mode). Resolves to the\nnative CSS `border-block-{width,style,color}` properties — same\nvalue grammar as `borderTop` / `borderRight` / `borderBottom` /\n`borderLeft` (boolean opt-in, bare width number, or a free-form\n`\"width style color\"` string). Precedence: beats the global `border`\nshorthand for the edges it targets, but a physical `borderTop` /\n`borderBottom` still wins over it for that specific edge — see\n`useBorder` JSDoc for the full precedence table.",
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "borderInline",
            label: "borderInline",
            tsType: "string | number | boolean | undefined",
            runtimeType: ["Boolean","Number","String"],
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            description: "Logical-axis shorthand for the inline-start + inline-end edges (left\n+ right in LTR). Same grammar and precedence rules as `borderBlock`,\nmapped onto `border-inline-{width,style,color}`.",
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "borderInlineStart",
            label: "borderInlineStart",
            tsType: "string | number | boolean | undefined",
            runtimeType: ["Boolean","Number","String"],
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            description: "*******************************************************\nborderInlineStart",
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "borderInlineEnd",
            label: "borderInlineEnd",
            tsType: "string | number | boolean | undefined",
            runtimeType: ["Boolean","Number","String"],
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            description: "*******************************************************\nborderInlineEnd",
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "borderBlockStart",
            label: "borderBlockStart",
            tsType: "string | number | boolean | undefined",
            runtimeType: ["Boolean","Number","String"],
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            description: "*******************************************************\nborderBlockStart",
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "borderBlockEnd",
            label: "borderBlockEnd",
            tsType: "string | number | boolean | undefined",
            runtimeType: ["Boolean","Number","String"],
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            description: "*******************************************************\nborderBlockEnd",
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "borderColor",
            label: "borderColor",
            tsType: "string | undefined",
            runtimeType: "String",
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "borderStyle",
            label: "borderStyle",
            tsType: "string | undefined",
            runtimeType: "String",
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "borderTopColor",
            label: "borderTopColor",
            tsType: "TColor",
            runtimeType: ["String","Object","Boolean"],
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            description: "Per-side color override (issue #215). Additive: absent by default,\nno behaviour change for existing consumers.\n\nPrecedence (specific > global): `borderTopColor` wins over any\ncolor implied by `borderTop` (e.g. `borderTop=\"2px dashed red\"`),\nwhich itself wins over the global `borderColor` / `border` shorthand\nfor the top side. See `useBorder` JSDoc for the full precedence\ntable.\n\nAccepts a {@link TColor} (semantic intent, raw CSS color, or falsy\nto opt out) — same input family as `color` / `bgColor`. Gradients\nare NOT supported on border colors (CSS `border-color` has no\ngradient form) and are silently ignored.",
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "borderRightColor",
            label: "borderRightColor",
            tsType: "TColor",
            runtimeType: ["String","Object","Boolean"],
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "borderBottomColor",
            label: "borderBottomColor",
            tsType: "TColor",
            runtimeType: ["String","Object","Boolean"],
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "borderLeftColor",
            label: "borderLeftColor",
            tsType: "TColor",
            runtimeType: ["String","Object","Boolean"],
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "borderInlineStartColor",
            label: "borderInlineStartColor",
            tsType: "TColor",
            runtimeType: ["String","Object","Boolean"],
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            description: "*******************************************************\nborderInlineStartColor",
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "borderInlineEndColor",
            label: "borderInlineEndColor",
            tsType: "TColor",
            runtimeType: ["String","Object","Boolean"],
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            description: "*******************************************************\nborderInlineEndColor",
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "borderBlockStartColor",
            label: "borderBlockStartColor",
            tsType: "TColor",
            runtimeType: ["String","Object","Boolean"],
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            description: "*******************************************************\nborderBlockStartColor",
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "borderBlockEndColor",
            label: "borderBlockEndColor",
            tsType: "TColor",
            runtimeType: ["String","Object","Boolean"],
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            description: "*******************************************************\nborderBlockEndColor",
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "rounded",
            label: "rounded",
            tsType: "string | number | boolean | null | undefined",
            runtimeType: ["Boolean","Number","String"],
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            description: "Corner-radius selector. Three modes:\n - **named variant** (`'small' | 'default' | 'large' | …`,\n   cf. `ROUNDED` enum) → emits `--rounded-{name}` class so the\n   component's SCSS can pick the right token rung.\n - **boolean `true`** (or empty string `''`) → emits the legacy\n   `--rounded` class for components that only have a single rounded\n   state (e.g. `OrigamBtn` defaulting to `radius.2xl`).\n - **CSS value** (`'4px'`, `'4px 0 4px 0'`, `100`) → emits inline\n   `border-radius` declarations via `useRounded.roundedStyles`.",
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "roundedTopRight",
            label: "roundedTopRight",
            tsType: "string | number | boolean | undefined",
            runtimeType: ["Boolean","Number","String"],
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            description: "Top-right corner only. Takes the same vocabulary as `rounded`\n(`8`, `'8px'`, `'md'`, `'large'`, `'var(…)'`), minus `shaped` /\n`shaped-invert` which are asymmetric by definition.",
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "roundedTopLeft",
            label: "roundedTopLeft",
            tsType: "string | number | boolean | undefined",
            runtimeType: ["Boolean","Number","String"],
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            description: "Top-left corner only. Same vocabulary as `roundedTopRight`.",
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "roundedBottomLeft",
            label: "roundedBottomLeft",
            tsType: "string | number | boolean | undefined",
            runtimeType: ["Boolean","Number","String"],
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            description: "Bottom-left corner only. Same vocabulary as `roundedTopRight`.",
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "roundedBottomRight",
            label: "roundedBottomRight",
            tsType: "string | number | boolean | undefined",
            runtimeType: ["Boolean","Number","String"],
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            description: "Bottom-right corner only. Same vocabulary as `roundedTopRight`.",
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "roundedStartStart",
            label: "roundedStartStart",
            tsType: "string | number | boolean | undefined",
            runtimeType: ["Boolean","Number","String"],
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            description: "*******************************************************\nLogical per-corner radius — rung 2 (issue #1013)",
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "roundedStartEnd",
            label: "roundedStartEnd",
            tsType: "string | number | boolean | undefined",
            runtimeType: ["Boolean","Number","String"],
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "roundedEndStart",
            label: "roundedEndStart",
            tsType: "string | number | boolean | undefined",
            runtimeType: ["Boolean","Number","String"],
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "roundedEndEnd",
            label: "roundedEndEnd",
            tsType: "string | number | boolean | undefined",
            runtimeType: ["Boolean","Number","String"],
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "centerAffix",
            label: "centerAffix",
            tsType: "boolean | undefined",
            runtimeType: "Boolean",
            required: false,
            defaultValue: true,
            hasFactoryDefault: false,
            control: CONTROL_KIND.SWITCH,
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "hideDetails",
            label: "hideDetails",
            tsType: "string | boolean | undefined",
            runtimeType: ["Boolean","String"],
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "hideSpinButtons",
            label: "hideSpinButtons",
            tsType: "boolean | undefined",
            runtimeType: "Boolean",
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.SWITCH,
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "hint",
            label: "hint",
            tsType: "string | undefined",
            runtimeType: "String",
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "persistentHint",
            label: "persistentHint",
            tsType: "boolean | undefined",
            runtimeType: "Boolean",
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.SWITCH,
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "messages",
            label: "messages",
            tsType: "string | string[] | undefined",
            runtimeType: ["Array","String"],
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "density",
            label: "density",
            tsType: "\"default\" | \"compact\" | \"comfortable\" | undefined",
            runtimeType: null,
            required: false,
            defaultValue: "default",
            hasFactoryDefault: false,
            options: ["default","compact","comfortable"],
            control: CONTROL_KIND.SELECT,
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "color",
            label: "color",
            tsType: "TColor",
            runtimeType: ["String","Object","Boolean"],
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "bgColor",
            label: "bgColor",
            tsType: "TColor",
            runtimeType: ["String","Object","Boolean"],
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "elevation",
            label: "elevation",
            tsType: "TElevation | undefined",
            runtimeType: ["Number","String"],
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "height",
            label: "height",
            tsType: "string | number | undefined",
            runtimeType: ["Number","String"],
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "maxHeight",
            label: "maxHeight",
            tsType: "string | number | undefined",
            runtimeType: ["Number","String"],
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "maxWidth",
            label: "maxWidth",
            tsType: "string | number | undefined",
            runtimeType: ["Number","String"],
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "minHeight",
            label: "minHeight",
            tsType: "string | number | undefined",
            runtimeType: ["Number","String"],
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "minWidth",
            label: "minWidth",
            tsType: "string | number | undefined",
            runtimeType: ["Number","String"],
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "width",
            label: "width",
            tsType: "string | number | undefined",
            runtimeType: ["Number","String"],
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "direction",
            label: "direction",
            tsType: "\"horizontal\" | \"vertical\" | undefined",
            runtimeType: null,
            required: false,
            hasFactoryDefault: false,
            options: ["horizontal","vertical"],
            control: CONTROL_KIND.SELECT,
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "disabled",
            label: "disabled",
            tsType: "boolean | undefined",
            runtimeType: "Boolean",
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.SWITCH,
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "error",
            label: "error",
            tsType: "string | boolean | undefined",
            runtimeType: ["String","Boolean"],
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            description: "Field-level error flag. Accepts a `boolean` (error on/off) or a `string`\n(error message rendered inline by consumers such as `FileField`).",
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "errorMessages",
            label: "errorMessages",
            tsType: "string | string[] | undefined",
            runtimeType: ["Array","String"],
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "maxErrors",
            label: "maxErrors",
            tsType: "string | number | undefined",
            runtimeType: ["Number","String"],
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "name",
            label: "name",
            tsType: "string | undefined",
            runtimeType: "String",
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "readonly",
            label: "readonly",
            tsType: "boolean | undefined",
            runtimeType: "Boolean",
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.SWITCH,
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "rules",
            label: "rules",
            tsType: "any[] | undefined",
            runtimeType: "Array",
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.JSON,
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "modelValue",
            label: "modelValue",
            tsType: "any",
            runtimeType: null,
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "validateOn",
            label: "validateOn",
            tsType: "\"blur\" | \"input\" | \"submit\" | \"lazy blur\" | \"lazy input\" | \"lazy submit\" | \"blur lazy\" | \"input lazy\" | \"submit lazy\" | \"lazy\" | undefined",
            runtimeType: null,
            required: false,
            hasFactoryDefault: false,
            options: ["blur","input","submit","lazy blur","lazy input","lazy submit","blur lazy","input lazy","submit lazy","lazy"],
            control: CONTROL_KIND.SELECT,
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "validationValue",
            label: "validationValue",
            tsType: "any",
            runtimeType: null,
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "focused",
            label: "focused",
            tsType: "boolean | undefined",
            runtimeType: "Boolean",
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.SWITCH,
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "appendAvatar",
            label: "appendAvatar",
            tsType: "string | undefined",
            runtimeType: "String",
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "appendIcon",
            label: "appendIcon",
            tsType: "TIcon | undefined",
            runtimeType: null,
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "prependAvatar",
            label: "prependAvatar",
            tsType: "string | undefined",
            runtimeType: "String",
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "prependIcon",
            label: "prependIcon",
            tsType: "TIcon | undefined",
            runtimeType: null,
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "prependAriaLabel",
            label: "prependAriaLabel",
            tsType: "string | undefined",
            runtimeType: "String",
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "appendAriaLabel",
            label: "appendAriaLabel",
            tsType: "string | undefined",
            runtimeType: "String",
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "size",
            label: "size",
            tsType: "number | \"default\" | \"x-small\" | \"small\" | \"large\" | \"x-large\" | undefined",
            runtimeType: null,
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "fontSize",
            label: "fontSize",
            tsType: "\"xs\" | \"sm\" | \"md\" | \"lg\" | \"xl\" | \"2xl\" | \"3xl\" | \"4xl\" | \"5xl\" | undefined",
            runtimeType: null,
            required: false,
            hasFactoryDefault: false,
            options: ["xs","sm","md","lg","xl","2xl","3xl","4xl","5xl"],
            control: CONTROL_KIND.SELECT,
            description: "Font size token. Maps to `--origam-font__size---{fontSize}`\n(xs · sm · md · lg · xl · 2xl · 3xl · 4xl · 5xl).\nWhen unset, the component keeps its theme / density font-size.",
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "fontWeight",
            label: "fontWeight",
            tsType: "\"regular\" | \"medium\" | \"semibold\" | \"bold\" | \"extrabold\" | \"black\" | undefined",
            runtimeType: null,
            required: false,
            hasFactoryDefault: false,
            options: ["regular","medium","semibold","bold","extrabold","black"],
            control: CONTROL_KIND.SELECT,
            description: "Font weight token. Maps to `--origam-font__weight---{fontWeight}`\n(regular 400 · medium 500 · semibold 600 · bold 700 · extrabold 800 · black 900).\nWhen unset, the component keeps its theme font-weight.",
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "lineHeight",
            label: "lineHeight",
            tsType: "\"none\" | \"tight\" | \"snug\" | \"normal\" | \"relaxed\" | \"loose\" | undefined",
            runtimeType: null,
            required: false,
            hasFactoryDefault: false,
            options: ["none","tight","snug","normal","relaxed","loose"],
            control: CONTROL_KIND.SELECT,
            description: "Line-height token. Maps to `--origam-font__lineHeight---{lineHeight}`\n(none 1 · tight 1.25 · snug 1.375 · normal 1.5 · relaxed 1.625 · loose 2).\nWhen unset, the component keeps its theme line-height.",
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "label",
            label: "label",
            tsType: "string | undefined",
            runtimeType: "String",
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "trueValue",
            label: "trueValue",
            tsType: "any",
            runtimeType: null,
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "falseValue",
            label: "falseValue",
            tsType: "any",
            runtimeType: null,
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "value",
            label: "value",
            tsType: "any",
            runtimeType: null,
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "required",
            label: "required",
            tsType: "boolean | undefined",
            runtimeType: "Boolean",
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.SWITCH,
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "type",
            label: "type",
            tsType: "string | undefined",
            runtimeType: "String",
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "valueComparator",
            label: "valueComparator",
            tsType: "((a: any, b: any) => boolean) | undefined",
            runtimeType: "Function",
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "falseIcon",
            label: "falseIcon",
            tsType: "TIcon | undefined",
            runtimeType: null,
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "trueIcon",
            label: "trueIcon",
            tsType: "TIcon | undefined",
            runtimeType: null,
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "multiple",
            label: "multiple",
            tsType: "boolean | undefined",
            runtimeType: "Boolean",
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.SWITCH,
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "inline",
            label: "inline",
            tsType: "boolean | undefined",
            runtimeType: "Boolean",
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.SWITCH,
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "hover",
            label: "hover",
            tsType: "boolean | IStateEffectConfig | undefined",
            runtimeType: ["Boolean","Object"],
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "hoverClass",
            label: "hoverClass",
            tsType: "string | undefined",
            runtimeType: "String",
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "ripple",
            label: "ripple",
            tsType: "boolean | { class: string; } | undefined",
            runtimeType: ["Boolean","Object"],
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "loading",
            label: "loading",
            tsType: "TControlLoadingValue | undefined",
            runtimeType: ["Boolean","Number","Object"],
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "loadingText",
            label: "loadingText",
            tsType: "string | undefined",
            runtimeType: "String",
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "active",
            label: "active",
            tsType: "boolean | IStateEffectConfig | undefined",
            runtimeType: ["Boolean","Object"],
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "activeClass",
            label: "activeClass",
            tsType: "string | undefined",
            runtimeType: "String",
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.TYPES
        }
        ],
        events: [
        {
            name: "update:modelValue",
            label: "update:modelValue",
            payloadType: "[event: any]",
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "update:focused",
            label: "update:focused",
            payloadType: "[event: any]",
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "click:label",
            label: "click:label",
            payloadType: "[event: MouseEvent]",
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "update:indeterminate",
            label: "update:indeterminate",
            payloadType: "[value: boolean]",
            source: METADATA_SOURCE.TYPES
        }
        ],
        slots: [
        {
            name: "track.true",
            label: "track.true",
            slotPropsType: "ISwitchTrackSlotsProps",
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "track.false",
            label: "track.false",
            slotPropsType: "ISwitchTrackSlotsProps",
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "loader",
            label: "loader",
            slotPropsType: "any",
            source: METADATA_SOURCE.TYPES
        }
        ],
        snippets: [],
        requiresParent: false
    },
    {
        name: "OrigamAlert",
        tag: "origam-alert",
        family: "Alert",
        label: "Alert",
        category: "Feedback & Status",
        props: [
        {
            name: "closable",
            label: "closable",
            tsType: "boolean | undefined",
            runtimeType: "Boolean",
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.SWITCH,
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "closeIcon",
            label: "closeIcon",
            tsType: "TIcon | undefined",
            runtimeType: null,
            required: false,
            defaultValue: "mdi:mdi-close",
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "closeLabel",
            label: "closeLabel",
            tsType: "string | undefined",
            runtimeType: "String",
            required: false,
            defaultValue: "origam.close",
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "modelValue",
            label: "modelValue",
            tsType: "boolean | undefined",
            runtimeType: "Boolean",
            required: false,
            defaultValue: true,
            hasFactoryDefault: false,
            control: CONTROL_KIND.SWITCH,
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "title",
            label: "title",
            tsType: "string | undefined",
            runtimeType: "String",
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "text",
            label: "text",
            tsType: "string | undefined",
            runtimeType: "String",
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "id",
            label: "id",
            tsType: "string | undefined",
            runtimeType: "String",
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "class",
            label: "class",
            tsType: null,
            runtimeType: ["String","Array","Object"],
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.RUNTIME
        },
        {
            name: "style",
            label: "style",
            tsType: null,
            runtimeType: ["String","Array","Object","Boolean"],
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.RUNTIME
        },
        {
            name: "tag",
            label: "tag",
            tsType: "string | undefined",
            runtimeType: "String",
            required: false,
            defaultValue: "div",
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "color",
            label: "color",
            tsType: "TColor",
            runtimeType: ["String","Object","Boolean"],
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "bgColor",
            label: "bgColor",
            tsType: "TColor",
            runtimeType: ["String","Object","Boolean"],
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "border",
            label: "border",
            tsType: "string | number | boolean | TDirectionBoth[] | undefined",
            runtimeType: ["Boolean","Number","String","Array"],
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "borderTop",
            label: "borderTop",
            tsType: "string | number | boolean | undefined",
            runtimeType: ["Boolean","Number","String"],
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "borderLeft",
            label: "borderLeft",
            tsType: "string | number | boolean | undefined",
            runtimeType: ["Boolean","Number","String"],
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "borderBottom",
            label: "borderBottom",
            tsType: "string | number | boolean | undefined",
            runtimeType: ["Boolean","Number","String"],
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "borderRight",
            label: "borderRight",
            tsType: "string | number | boolean | undefined",
            runtimeType: ["Boolean","Number","String"],
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "borderBlock",
            label: "borderBlock",
            tsType: "string | number | boolean | undefined",
            runtimeType: ["Boolean","Number","String"],
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            description: "Logical-axis shorthand for the block-start + block-end edges (top +\nbottom in the default horizontal-tb writing mode). Resolves to the\nnative CSS `border-block-{width,style,color}` properties — same\nvalue grammar as `borderTop` / `borderRight` / `borderBottom` /\n`borderLeft` (boolean opt-in, bare width number, or a free-form\n`\"width style color\"` string). Precedence: beats the global `border`\nshorthand for the edges it targets, but a physical `borderTop` /\n`borderBottom` still wins over it for that specific edge — see\n`useBorder` JSDoc for the full precedence table.",
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "borderInline",
            label: "borderInline",
            tsType: "string | number | boolean | undefined",
            runtimeType: ["Boolean","Number","String"],
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            description: "Logical-axis shorthand for the inline-start + inline-end edges (left\n+ right in LTR). Same grammar and precedence rules as `borderBlock`,\nmapped onto `border-inline-{width,style,color}`.",
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "borderInlineStart",
            label: "borderInlineStart",
            tsType: "string | number | boolean | undefined",
            runtimeType: ["Boolean","Number","String"],
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            description: "*******************************************************\nborderInlineStart",
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "borderInlineEnd",
            label: "borderInlineEnd",
            tsType: "string | number | boolean | undefined",
            runtimeType: ["Boolean","Number","String"],
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            description: "*******************************************************\nborderInlineEnd",
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "borderBlockStart",
            label: "borderBlockStart",
            tsType: "string | number | boolean | undefined",
            runtimeType: ["Boolean","Number","String"],
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            description: "*******************************************************\nborderBlockStart",
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "borderBlockEnd",
            label: "borderBlockEnd",
            tsType: "string | number | boolean | undefined",
            runtimeType: ["Boolean","Number","String"],
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            description: "*******************************************************\nborderBlockEnd",
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "borderColor",
            label: "borderColor",
            tsType: "string | undefined",
            runtimeType: "String",
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "borderStyle",
            label: "borderStyle",
            tsType: "string | undefined",
            runtimeType: "String",
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "borderTopColor",
            label: "borderTopColor",
            tsType: "TColor",
            runtimeType: ["String","Object","Boolean"],
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            description: "Per-side color override (issue #215). Additive: absent by default,\nno behaviour change for existing consumers.\n\nPrecedence (specific > global): `borderTopColor` wins over any\ncolor implied by `borderTop` (e.g. `borderTop=\"2px dashed red\"`),\nwhich itself wins over the global `borderColor` / `border` shorthand\nfor the top side. See `useBorder` JSDoc for the full precedence\ntable.\n\nAccepts a {@link TColor} (semantic intent, raw CSS color, or falsy\nto opt out) — same input family as `color` / `bgColor`. Gradients\nare NOT supported on border colors (CSS `border-color` has no\ngradient form) and are silently ignored.",
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "borderRightColor",
            label: "borderRightColor",
            tsType: "TColor",
            runtimeType: ["String","Object","Boolean"],
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "borderBottomColor",
            label: "borderBottomColor",
            tsType: "TColor",
            runtimeType: ["String","Object","Boolean"],
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "borderLeftColor",
            label: "borderLeftColor",
            tsType: "TColor",
            runtimeType: ["String","Object","Boolean"],
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "borderInlineStartColor",
            label: "borderInlineStartColor",
            tsType: "TColor",
            runtimeType: ["String","Object","Boolean"],
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            description: "*******************************************************\nborderInlineStartColor",
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "borderInlineEndColor",
            label: "borderInlineEndColor",
            tsType: "TColor",
            runtimeType: ["String","Object","Boolean"],
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            description: "*******************************************************\nborderInlineEndColor",
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "borderBlockStartColor",
            label: "borderBlockStartColor",
            tsType: "TColor",
            runtimeType: ["String","Object","Boolean"],
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            description: "*******************************************************\nborderBlockStartColor",
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "borderBlockEndColor",
            label: "borderBlockEndColor",
            tsType: "TColor",
            runtimeType: ["String","Object","Boolean"],
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            description: "*******************************************************\nborderBlockEndColor",
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "height",
            label: "height",
            tsType: "string | number | undefined",
            runtimeType: ["Number","String"],
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "maxHeight",
            label: "maxHeight",
            tsType: "string | number | undefined",
            runtimeType: ["Number","String"],
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "maxWidth",
            label: "maxWidth",
            tsType: "string | number | undefined",
            runtimeType: ["Number","String"],
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "minHeight",
            label: "minHeight",
            tsType: "string | number | undefined",
            runtimeType: ["Number","String"],
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "minWidth",
            label: "minWidth",
            tsType: "string | number | undefined",
            runtimeType: ["Number","String"],
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "width",
            label: "width",
            tsType: "string | number | undefined",
            runtimeType: ["Number","String"],
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "padding",
            label: "padding",
            tsType: "string | number | boolean | undefined",
            runtimeType: ["Boolean","Number","String"],
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            description: "Global shorthand. `16` → `16px`; `\"4\"` → the `--origam-space---4`\ndesign rung; `\"8px 16px\"` → block / inline; `true` → the legacy\n`--padded` class.",
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "paddingTop",
            label: "paddingTop",
            tsType: "string | number | boolean | undefined",
            runtimeType: ["Boolean","Number","String"],
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            description: "Overrides `padding` and `paddingBlock` for the top edge.",
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "paddingLeft",
            label: "paddingLeft",
            tsType: "string | number | boolean | undefined",
            runtimeType: ["Boolean","Number","String"],
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            description: "Overrides `padding` and `paddingInline` for the left edge.",
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "paddingBottom",
            label: "paddingBottom",
            tsType: "string | number | boolean | undefined",
            runtimeType: ["Boolean","Number","String"],
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            description: "Overrides `padding` and `paddingBlock` for the bottom edge.",
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "paddingRight",
            label: "paddingRight",
            tsType: "string | number | boolean | undefined",
            runtimeType: ["Boolean","Number","String"],
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            description: "Overrides `padding` and `paddingInline` for the right edge.",
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "paddingBlock",
            label: "paddingBlock",
            tsType: "string | number | boolean | undefined",
            runtimeType: ["Boolean","Number","String"],
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            description: "Top + bottom. Overrides `padding`; beaten by `paddingTop` / `paddingBottom`.",
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "paddingInline",
            label: "paddingInline",
            tsType: "string | number | boolean | undefined",
            runtimeType: ["Boolean","Number","String"],
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            description: "Left + right. Overrides `padding`; beaten by `paddingLeft` / `paddingRight`.",
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "paddingInlineStart",
            label: "paddingInlineStart",
            tsType: "string | number | boolean | undefined",
            runtimeType: ["Boolean","Number","String"],
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            description: "*******************************************************\nLogical per-side padding — rung 3 (issue #1013)",
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "paddingInlineEnd",
            label: "paddingInlineEnd",
            tsType: "string | number | boolean | undefined",
            runtimeType: ["Boolean","Number","String"],
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "paddingBlockStart",
            label: "paddingBlockStart",
            tsType: "string | number | boolean | undefined",
            runtimeType: ["Boolean","Number","String"],
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "paddingBlockEnd",
            label: "paddingBlockEnd",
            tsType: "string | number | boolean | undefined",
            runtimeType: ["Boolean","Number","String"],
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "margin",
            label: "margin",
            tsType: "string | number | boolean | undefined",
            runtimeType: ["Boolean","Number","String"],
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            description: "Global shorthand. `16` → `16px`; `\"4\"` → the `--origam-space---4`\ndesign rung; `\"8px 16px\"` → block / inline; `true` → the legacy\n`--marged` class.",
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "marginTop",
            label: "marginTop",
            tsType: "string | number | boolean | undefined",
            runtimeType: ["Boolean","Number","String"],
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            description: "Overrides `margin` and `marginBlock` for the top edge.",
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "marginLeft",
            label: "marginLeft",
            tsType: "string | number | boolean | undefined",
            runtimeType: ["Boolean","Number","String"],
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            description: "Overrides `margin` and `marginInline` for the left edge.",
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "marginBottom",
            label: "marginBottom",
            tsType: "string | number | boolean | undefined",
            runtimeType: ["Boolean","Number","String"],
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            description: "Overrides `margin` and `marginBlock` for the bottom edge.",
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "marginRight",
            label: "marginRight",
            tsType: "string | number | boolean | undefined",
            runtimeType: ["Boolean","Number","String"],
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            description: "Overrides `margin` and `marginInline` for the right edge.",
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "marginBlock",
            label: "marginBlock",
            tsType: "string | number | boolean | undefined",
            runtimeType: ["Boolean","Number","String"],
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            description: "Top + bottom. Overrides `margin`; beaten by `marginTop` / `marginBottom`.",
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "marginInline",
            label: "marginInline",
            tsType: "string | number | boolean | undefined",
            runtimeType: ["Boolean","Number","String"],
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            description: "Left + right. Overrides `margin`; beaten by `marginLeft` / `marginRight`.",
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "marginInlineStart",
            label: "marginInlineStart",
            tsType: "string | number | boolean | undefined",
            runtimeType: ["Boolean","Number","String"],
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            description: "*******************************************************\nLogical per-side margin — rung 3 (issue #1013)",
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "marginInlineEnd",
            label: "marginInlineEnd",
            tsType: "string | number | boolean | undefined",
            runtimeType: ["Boolean","Number","String"],
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "marginBlockStart",
            label: "marginBlockStart",
            tsType: "string | number | boolean | undefined",
            runtimeType: ["Boolean","Number","String"],
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "marginBlockEnd",
            label: "marginBlockEnd",
            tsType: "string | number | boolean | undefined",
            runtimeType: ["Boolean","Number","String"],
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "density",
            label: "density",
            tsType: "\"default\" | \"compact\" | \"comfortable\" | undefined",
            runtimeType: null,
            required: false,
            defaultValue: "default",
            hasFactoryDefault: false,
            options: ["default","compact","comfortable"],
            control: CONTROL_KIND.SELECT,
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "elevation",
            label: "elevation",
            tsType: "TElevation | undefined",
            runtimeType: ["Number","String"],
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "location",
            label: "location",
            tsType: "TAnchor | undefined",
            runtimeType: null,
            required: false,
            hasFactoryDefault: false,
            options: ["top","bottom","left","right","center","center center","top left","top right","top center","bottom left","bottom right","bottom center","left top","left bottom","left center","right top","right bottom","right center"],
            control: CONTROL_KIND.SELECT,
            source: METADATA_SOURCE.ALIAS
        },
        {
            name: "position",
            label: "position",
            tsType: "\"static\" | \"relative\" | \"fixed\" | \"absolute\" | \"sticky\" | undefined",
            runtimeType: null,
            required: false,
            hasFactoryDefault: false,
            options: ["static","relative","fixed","absolute","sticky"],
            control: CONTROL_KIND.SELECT,
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "top",
            label: "top",
            tsType: "string | number | undefined",
            runtimeType: ["Number","String"],
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "bottom",
            label: "bottom",
            tsType: "string | number | undefined",
            runtimeType: ["Number","String"],
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "left",
            label: "left",
            tsType: "string | number | undefined",
            runtimeType: ["Number","String"],
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "right",
            label: "right",
            tsType: "string | number | undefined",
            runtimeType: ["Number","String"],
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "rounded",
            label: "rounded",
            tsType: "string | number | boolean | null | undefined",
            runtimeType: ["Boolean","Number","String"],
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            description: "Corner-radius selector. Three modes:\n - **named variant** (`'small' | 'default' | 'large' | …`,\n   cf. `ROUNDED` enum) → emits `--rounded-{name}` class so the\n   component's SCSS can pick the right token rung.\n - **boolean `true`** (or empty string `''`) → emits the legacy\n   `--rounded` class for components that only have a single rounded\n   state (e.g. `OrigamBtn` defaulting to `radius.2xl`).\n - **CSS value** (`'4px'`, `'4px 0 4px 0'`, `100`) → emits inline\n   `border-radius` declarations via `useRounded.roundedStyles`.",
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "roundedTopRight",
            label: "roundedTopRight",
            tsType: "string | number | boolean | undefined",
            runtimeType: ["Boolean","Number","String"],
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            description: "Top-right corner only. Takes the same vocabulary as `rounded`\n(`8`, `'8px'`, `'md'`, `'large'`, `'var(…)'`), minus `shaped` /\n`shaped-invert` which are asymmetric by definition.",
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "roundedTopLeft",
            label: "roundedTopLeft",
            tsType: "string | number | boolean | undefined",
            runtimeType: ["Boolean","Number","String"],
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            description: "Top-left corner only. Same vocabulary as `roundedTopRight`.",
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "roundedBottomLeft",
            label: "roundedBottomLeft",
            tsType: "string | number | boolean | undefined",
            runtimeType: ["Boolean","Number","String"],
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            description: "Bottom-left corner only. Same vocabulary as `roundedTopRight`.",
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "roundedBottomRight",
            label: "roundedBottomRight",
            tsType: "string | number | boolean | undefined",
            runtimeType: ["Boolean","Number","String"],
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            description: "Bottom-right corner only. Same vocabulary as `roundedTopRight`.",
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "roundedStartStart",
            label: "roundedStartStart",
            tsType: "string | number | boolean | undefined",
            runtimeType: ["Boolean","Number","String"],
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            description: "*******************************************************\nLogical per-corner radius — rung 2 (issue #1013)",
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "roundedStartEnd",
            label: "roundedStartEnd",
            tsType: "string | number | boolean | undefined",
            runtimeType: ["Boolean","Number","String"],
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "roundedEndStart",
            label: "roundedEndStart",
            tsType: "string | number | boolean | undefined",
            runtimeType: ["Boolean","Number","String"],
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "roundedEndEnd",
            label: "roundedEndEnd",
            tsType: "string | number | boolean | undefined",
            runtimeType: ["Boolean","Number","String"],
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "status",
            label: "status",
            tsType: "\"success\" | \"info\" | \"warning\" | \"error\" | undefined",
            runtimeType: null,
            required: false,
            hasFactoryDefault: false,
            options: ["success","info","warning","error"],
            control: CONTROL_KIND.SELECT,
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "statusIconPosition",
            label: "statusIconPosition",
            tsType: "\"prepend\" | \"append\" | \"replace\" | \"both\" | undefined",
            runtimeType: null,
            required: false,
            hasFactoryDefault: false,
            options: ["prepend","append","replace","both"],
            control: CONTROL_KIND.SELECT,
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "icon",
            label: "icon",
            tsType: "TIcon | undefined",
            runtimeType: null,
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "hover",
            label: "hover",
            tsType: "boolean | IStateEffectConfig | undefined",
            runtimeType: ["Boolean","Object"],
            required: false,
            defaultValue: true,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "hoverClass",
            label: "hoverClass",
            tsType: "string | undefined",
            runtimeType: "String",
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "appendAvatar",
            label: "appendAvatar",
            tsType: "string | undefined",
            runtimeType: "String",
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "appendIcon",
            label: "appendIcon",
            tsType: "TIcon | undefined",
            runtimeType: null,
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "prependAvatar",
            label: "prependAvatar",
            tsType: "string | undefined",
            runtimeType: "String",
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "prependIcon",
            label: "prependIcon",
            tsType: "TIcon | undefined",
            runtimeType: null,
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "prependAriaLabel",
            label: "prependAriaLabel",
            tsType: "string | undefined",
            runtimeType: "String",
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "appendAriaLabel",
            label: "appendAriaLabel",
            tsType: "string | undefined",
            runtimeType: "String",
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "fontSize",
            label: "fontSize",
            tsType: "\"xs\" | \"sm\" | \"md\" | \"lg\" | \"xl\" | \"2xl\" | \"3xl\" | \"4xl\" | \"5xl\" | undefined",
            runtimeType: null,
            required: false,
            hasFactoryDefault: false,
            options: ["xs","sm","md","lg","xl","2xl","3xl","4xl","5xl"],
            control: CONTROL_KIND.SELECT,
            description: "Font size token. Maps to `--origam-font__size---{fontSize}`\n(xs · sm · md · lg · xl · 2xl · 3xl · 4xl · 5xl).\nWhen unset, the component keeps its theme / density font-size.",
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "fontWeight",
            label: "fontWeight",
            tsType: "\"regular\" | \"medium\" | \"semibold\" | \"bold\" | \"extrabold\" | \"black\" | undefined",
            runtimeType: null,
            required: false,
            hasFactoryDefault: false,
            options: ["regular","medium","semibold","bold","extrabold","black"],
            control: CONTROL_KIND.SELECT,
            description: "Font weight token. Maps to `--origam-font__weight---{fontWeight}`\n(regular 400 · medium 500 · semibold 600 · bold 700 · extrabold 800 · black 900).\nWhen unset, the component keeps its theme font-weight.",
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "lineHeight",
            label: "lineHeight",
            tsType: "\"none\" | \"tight\" | \"snug\" | \"normal\" | \"relaxed\" | \"loose\" | undefined",
            runtimeType: null,
            required: false,
            hasFactoryDefault: false,
            options: ["none","tight","snug","normal","relaxed","loose"],
            control: CONTROL_KIND.SELECT,
            description: "Line-height token. Maps to `--origam-font__lineHeight---{lineHeight}`\n(none 1 · tight 1.25 · snug 1.375 · normal 1.5 · relaxed 1.625 · loose 2).\nWhen unset, the component keeps its theme line-height.",
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "letterSpacing",
            label: "letterSpacing",
            tsType: "\"tight\" | \"normal\" | \"wide\" | \"wider\" | \"widest\" | undefined",
            runtimeType: null,
            required: false,
            hasFactoryDefault: false,
            options: ["tight","normal","wide","wider","widest"],
            control: CONTROL_KIND.SELECT,
            description: "Letter-spacing token. Maps to `--origam-font__letterSpacing---{letterSpacing}`\n(tight -0.025em · normal 0em · wide 0.0094em · wider 0.0125em · widest 0.0893em).\nWhen unset, the component keeps its theme letter-spacing.",
            source: METADATA_SOURCE.TYPES
        }
        ],
        events: [
        {
            name: "update:modelValue",
            label: "update:modelValue",
            payloadType: "[event: any]",
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "click:close",
            label: "click:close",
            payloadType: "[event: MouseEvent]",
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "update:hover",
            label: "update:hover",
            payloadType: "[value: boolean]",
            source: METADATA_SOURCE.TYPES
        }
        ],
        slots: [
        {
            name: "wrapper",
            label: "wrapper",
            slotPropsType: "any",
            description: "Overrides the whole prepend/content/append layout.",
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "title",
            label: "title",
            slotPropsType: "any",
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "text",
            label: "text",
            slotPropsType: "any",
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "default",
            label: "default",
            slotPropsType: "any",
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "close",
            label: "close",
            slotPropsType: "any",
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "prepend",
            label: "prepend",
            slotPropsType: "any",
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "append",
            label: "append",
            slotPropsType: "any",
            source: METADATA_SOURCE.TYPES
        }
        ],
        snippets: [],
        requiresParent: false
    },
    {
        name: "OrigamCard",
        tag: "origam-card",
        family: "Card",
        label: "Card",
        category: "Layout & Structure",
        props: [
        {
            name: "contentDisplay",
            label: "contentDisplay",
            tsType: "\"block\" | \"grid\" | \"contents\" | \"flex\" | undefined",
            runtimeType: null,
            required: false,
            hasFactoryDefault: false,
            options: ["block","grid","contents","flex"],
            control: CONTROL_KIND.SELECT,
            description: "*******************************************************\ncontentDisplay",
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "disabled",
            label: "disabled",
            tsType: "boolean | undefined",
            runtimeType: "Boolean",
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.SWITCH,
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "flat",
            label: "flat",
            tsType: "boolean | undefined",
            runtimeType: "Boolean",
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.SWITCH,
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "image",
            label: "image",
            tsType: "string | undefined",
            runtimeType: "String",
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "link",
            label: "link",
            tsType: "boolean | undefined",
            runtimeType: "Boolean",
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.SWITCH,
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "subtitle",
            label: "subtitle",
            tsType: "string | number | undefined",
            runtimeType: ["String","Number"],
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "text",
            label: "text",
            tsType: "string | number | undefined",
            runtimeType: ["String","Number"],
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "title",
            label: "title",
            tsType: "string | number | undefined",
            runtimeType: ["String","Number"],
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "type",
            label: "type",
            tsType: "\"grid\" | \"list\" | undefined",
            runtimeType: null,
            required: false,
            hasFactoryDefault: false,
            options: ["grid","list"],
            control: CONTROL_KIND.SELECT,
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "titleId",
            label: "titleId",
            tsType: "string | undefined",
            runtimeType: "String",
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            description: "*******************************************************\ntitleId",
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "id",
            label: "id",
            tsType: "string | undefined",
            runtimeType: "String",
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "class",
            label: "class",
            tsType: null,
            runtimeType: ["String","Array","Object"],
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.RUNTIME
        },
        {
            name: "style",
            label: "style",
            tsType: null,
            runtimeType: ["String","Array","Object","Boolean"],
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.RUNTIME
        },
        {
            name: "tag",
            label: "tag",
            tsType: "string | undefined",
            runtimeType: "String",
            required: false,
            defaultValue: "div",
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "border",
            label: "border",
            tsType: "string | number | boolean | TDirectionBoth[] | undefined",
            runtimeType: ["Boolean","Number","String","Array"],
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "borderTop",
            label: "borderTop",
            tsType: "string | number | boolean | undefined",
            runtimeType: ["Boolean","Number","String"],
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "borderLeft",
            label: "borderLeft",
            tsType: "string | number | boolean | undefined",
            runtimeType: ["Boolean","Number","String"],
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "borderBottom",
            label: "borderBottom",
            tsType: "string | number | boolean | undefined",
            runtimeType: ["Boolean","Number","String"],
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "borderRight",
            label: "borderRight",
            tsType: "string | number | boolean | undefined",
            runtimeType: ["Boolean","Number","String"],
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "borderBlock",
            label: "borderBlock",
            tsType: "string | number | boolean | undefined",
            runtimeType: ["Boolean","Number","String"],
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            description: "Logical-axis shorthand for the block-start + block-end edges (top +\nbottom in the default horizontal-tb writing mode). Resolves to the\nnative CSS `border-block-{width,style,color}` properties — same\nvalue grammar as `borderTop` / `borderRight` / `borderBottom` /\n`borderLeft` (boolean opt-in, bare width number, or a free-form\n`\"width style color\"` string). Precedence: beats the global `border`\nshorthand for the edges it targets, but a physical `borderTop` /\n`borderBottom` still wins over it for that specific edge — see\n`useBorder` JSDoc for the full precedence table.",
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "borderInline",
            label: "borderInline",
            tsType: "string | number | boolean | undefined",
            runtimeType: ["Boolean","Number","String"],
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            description: "Logical-axis shorthand for the inline-start + inline-end edges (left\n+ right in LTR). Same grammar and precedence rules as `borderBlock`,\nmapped onto `border-inline-{width,style,color}`.",
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "borderInlineStart",
            label: "borderInlineStart",
            tsType: "string | number | boolean | undefined",
            runtimeType: ["Boolean","Number","String"],
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            description: "*******************************************************\nborderInlineStart",
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "borderInlineEnd",
            label: "borderInlineEnd",
            tsType: "string | number | boolean | undefined",
            runtimeType: ["Boolean","Number","String"],
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            description: "*******************************************************\nborderInlineEnd",
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "borderBlockStart",
            label: "borderBlockStart",
            tsType: "string | number | boolean | undefined",
            runtimeType: ["Boolean","Number","String"],
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            description: "*******************************************************\nborderBlockStart",
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "borderBlockEnd",
            label: "borderBlockEnd",
            tsType: "string | number | boolean | undefined",
            runtimeType: ["Boolean","Number","String"],
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            description: "*******************************************************\nborderBlockEnd",
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "borderColor",
            label: "borderColor",
            tsType: "string | undefined",
            runtimeType: "String",
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "borderStyle",
            label: "borderStyle",
            tsType: "string | undefined",
            runtimeType: "String",
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "borderTopColor",
            label: "borderTopColor",
            tsType: "TColor",
            runtimeType: ["String","Object","Boolean"],
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            description: "Per-side color override (issue #215). Additive: absent by default,\nno behaviour change for existing consumers.\n\nPrecedence (specific > global): `borderTopColor` wins over any\ncolor implied by `borderTop` (e.g. `borderTop=\"2px dashed red\"`),\nwhich itself wins over the global `borderColor` / `border` shorthand\nfor the top side. See `useBorder` JSDoc for the full precedence\ntable.\n\nAccepts a {@link TColor} (semantic intent, raw CSS color, or falsy\nto opt out) — same input family as `color` / `bgColor`. Gradients\nare NOT supported on border colors (CSS `border-color` has no\ngradient form) and are silently ignored.",
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "borderRightColor",
            label: "borderRightColor",
            tsType: "TColor",
            runtimeType: ["String","Object","Boolean"],
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "borderBottomColor",
            label: "borderBottomColor",
            tsType: "TColor",
            runtimeType: ["String","Object","Boolean"],
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "borderLeftColor",
            label: "borderLeftColor",
            tsType: "TColor",
            runtimeType: ["String","Object","Boolean"],
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "borderInlineStartColor",
            label: "borderInlineStartColor",
            tsType: "TColor",
            runtimeType: ["String","Object","Boolean"],
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            description: "*******************************************************\nborderInlineStartColor",
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "borderInlineEndColor",
            label: "borderInlineEndColor",
            tsType: "TColor",
            runtimeType: ["String","Object","Boolean"],
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            description: "*******************************************************\nborderInlineEndColor",
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "borderBlockStartColor",
            label: "borderBlockStartColor",
            tsType: "TColor",
            runtimeType: ["String","Object","Boolean"],
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            description: "*******************************************************\nborderBlockStartColor",
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "borderBlockEndColor",
            label: "borderBlockEndColor",
            tsType: "TColor",
            runtimeType: ["String","Object","Boolean"],
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            description: "*******************************************************\nborderBlockEndColor",
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "color",
            label: "color",
            tsType: "TColor",
            runtimeType: ["String","Object","Boolean"],
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "bgColor",
            label: "bgColor",
            tsType: "TColor",
            runtimeType: ["String","Object","Boolean"],
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "density",
            label: "density",
            tsType: "\"default\" | \"compact\" | \"comfortable\" | undefined",
            runtimeType: null,
            required: false,
            defaultValue: "default",
            hasFactoryDefault: false,
            options: ["default","compact","comfortable"],
            control: CONTROL_KIND.SELECT,
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "height",
            label: "height",
            tsType: "string | number | undefined",
            runtimeType: ["Number","String"],
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "maxHeight",
            label: "maxHeight",
            tsType: "string | number | undefined",
            runtimeType: ["Number","String"],
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "maxWidth",
            label: "maxWidth",
            tsType: "string | number | undefined",
            runtimeType: ["Number","String"],
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "minHeight",
            label: "minHeight",
            tsType: "string | number | undefined",
            runtimeType: ["Number","String"],
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "minWidth",
            label: "minWidth",
            tsType: "string | number | undefined",
            runtimeType: ["Number","String"],
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "width",
            label: "width",
            tsType: "string | number | undefined",
            runtimeType: ["Number","String"],
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "elevation",
            label: "elevation",
            tsType: "TElevation | undefined",
            runtimeType: ["Number","String"],
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "loading",
            label: "loading",
            tsType: "TLoadingValue | undefined",
            runtimeType: ["Boolean","Number","Object"],
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "loadingText",
            label: "loadingText",
            tsType: "string | undefined",
            runtimeType: "String",
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "location",
            label: "location",
            tsType: "TAnchor | undefined",
            runtimeType: null,
            required: false,
            hasFactoryDefault: false,
            options: ["top","bottom","left","right","center","center center","top left","top right","top center","bottom left","bottom right","bottom center","left top","left bottom","left center","right top","right bottom","right center"],
            control: CONTROL_KIND.SELECT,
            source: METADATA_SOURCE.ALIAS
        },
        {
            name: "position",
            label: "position",
            tsType: "\"static\" | \"relative\" | \"fixed\" | \"absolute\" | \"sticky\" | undefined",
            runtimeType: null,
            required: false,
            hasFactoryDefault: false,
            options: ["static","relative","fixed","absolute","sticky"],
            control: CONTROL_KIND.SELECT,
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "top",
            label: "top",
            tsType: "string | number | undefined",
            runtimeType: ["Number","String"],
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "bottom",
            label: "bottom",
            tsType: "string | number | undefined",
            runtimeType: ["Number","String"],
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "left",
            label: "left",
            tsType: "string | number | undefined",
            runtimeType: ["Number","String"],
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "right",
            label: "right",
            tsType: "string | number | undefined",
            runtimeType: ["Number","String"],
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "rounded",
            label: "rounded",
            tsType: "string | number | boolean | null | undefined",
            runtimeType: ["Boolean","Number","String"],
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            description: "Corner-radius selector. Three modes:\n - **named variant** (`'small' | 'default' | 'large' | …`,\n   cf. `ROUNDED` enum) → emits `--rounded-{name}` class so the\n   component's SCSS can pick the right token rung.\n - **boolean `true`** (or empty string `''`) → emits the legacy\n   `--rounded` class for components that only have a single rounded\n   state (e.g. `OrigamBtn` defaulting to `radius.2xl`).\n - **CSS value** (`'4px'`, `'4px 0 4px 0'`, `100`) → emits inline\n   `border-radius` declarations via `useRounded.roundedStyles`.",
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "roundedTopRight",
            label: "roundedTopRight",
            tsType: "string | number | boolean | undefined",
            runtimeType: ["Boolean","Number","String"],
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            description: "Top-right corner only. Takes the same vocabulary as `rounded`\n(`8`, `'8px'`, `'md'`, `'large'`, `'var(…)'`), minus `shaped` /\n`shaped-invert` which are asymmetric by definition.",
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "roundedTopLeft",
            label: "roundedTopLeft",
            tsType: "string | number | boolean | undefined",
            runtimeType: ["Boolean","Number","String"],
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            description: "Top-left corner only. Same vocabulary as `roundedTopRight`.",
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "roundedBottomLeft",
            label: "roundedBottomLeft",
            tsType: "string | number | boolean | undefined",
            runtimeType: ["Boolean","Number","String"],
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            description: "Bottom-left corner only. Same vocabulary as `roundedTopRight`.",
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "roundedBottomRight",
            label: "roundedBottomRight",
            tsType: "string | number | boolean | undefined",
            runtimeType: ["Boolean","Number","String"],
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            description: "Bottom-right corner only. Same vocabulary as `roundedTopRight`.",
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "roundedStartStart",
            label: "roundedStartStart",
            tsType: "string | number | boolean | undefined",
            runtimeType: ["Boolean","Number","String"],
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            description: "*******************************************************\nLogical per-corner radius — rung 2 (issue #1013)",
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "roundedStartEnd",
            label: "roundedStartEnd",
            tsType: "string | number | boolean | undefined",
            runtimeType: ["Boolean","Number","String"],
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "roundedEndStart",
            label: "roundedEndStart",
            tsType: "string | number | boolean | undefined",
            runtimeType: ["Boolean","Number","String"],
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "roundedEndEnd",
            label: "roundedEndEnd",
            tsType: "string | number | boolean | undefined",
            runtimeType: ["Boolean","Number","String"],
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "margin",
            label: "margin",
            tsType: "string | number | boolean | undefined",
            runtimeType: ["Boolean","Number","String"],
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            description: "Global shorthand. `16` → `16px`; `\"4\"` → the `--origam-space---4`\ndesign rung; `\"8px 16px\"` → block / inline; `true` → the legacy\n`--marged` class.",
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "marginTop",
            label: "marginTop",
            tsType: "string | number | boolean | undefined",
            runtimeType: ["Boolean","Number","String"],
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            description: "Overrides `margin` and `marginBlock` for the top edge.",
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "marginLeft",
            label: "marginLeft",
            tsType: "string | number | boolean | undefined",
            runtimeType: ["Boolean","Number","String"],
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            description: "Overrides `margin` and `marginInline` for the left edge.",
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "marginBottom",
            label: "marginBottom",
            tsType: "string | number | boolean | undefined",
            runtimeType: ["Boolean","Number","String"],
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            description: "Overrides `margin` and `marginBlock` for the bottom edge.",
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "marginRight",
            label: "marginRight",
            tsType: "string | number | boolean | undefined",
            runtimeType: ["Boolean","Number","String"],
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            description: "Overrides `margin` and `marginInline` for the right edge.",
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "marginBlock",
            label: "marginBlock",
            tsType: "string | number | boolean | undefined",
            runtimeType: ["Boolean","Number","String"],
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            description: "Top + bottom. Overrides `margin`; beaten by `marginTop` / `marginBottom`.",
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "marginInline",
            label: "marginInline",
            tsType: "string | number | boolean | undefined",
            runtimeType: ["Boolean","Number","String"],
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            description: "Left + right. Overrides `margin`; beaten by `marginLeft` / `marginRight`.",
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "marginInlineStart",
            label: "marginInlineStart",
            tsType: "string | number | boolean | undefined",
            runtimeType: ["Boolean","Number","String"],
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            description: "*******************************************************\nLogical per-side margin — rung 3 (issue #1013)",
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "marginInlineEnd",
            label: "marginInlineEnd",
            tsType: "string | number | boolean | undefined",
            runtimeType: ["Boolean","Number","String"],
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "marginBlockStart",
            label: "marginBlockStart",
            tsType: "string | number | boolean | undefined",
            runtimeType: ["Boolean","Number","String"],
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "marginBlockEnd",
            label: "marginBlockEnd",
            tsType: "string | number | boolean | undefined",
            runtimeType: ["Boolean","Number","String"],
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "padding",
            label: "padding",
            tsType: "string | number | boolean | undefined",
            runtimeType: ["Boolean","Number","String"],
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            description: "Global shorthand. `16` → `16px`; `\"4\"` → the `--origam-space---4`\ndesign rung; `\"8px 16px\"` → block / inline; `true` → the legacy\n`--padded` class.",
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "paddingTop",
            label: "paddingTop",
            tsType: "string | number | boolean | undefined",
            runtimeType: ["Boolean","Number","String"],
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            description: "Overrides `padding` and `paddingBlock` for the top edge.",
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "paddingLeft",
            label: "paddingLeft",
            tsType: "string | number | boolean | undefined",
            runtimeType: ["Boolean","Number","String"],
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            description: "Overrides `padding` and `paddingInline` for the left edge.",
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "paddingBottom",
            label: "paddingBottom",
            tsType: "string | number | boolean | undefined",
            runtimeType: ["Boolean","Number","String"],
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            description: "Overrides `padding` and `paddingBlock` for the bottom edge.",
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "paddingRight",
            label: "paddingRight",
            tsType: "string | number | boolean | undefined",
            runtimeType: ["Boolean","Number","String"],
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            description: "Overrides `padding` and `paddingInline` for the right edge.",
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "paddingBlock",
            label: "paddingBlock",
            tsType: "string | number | boolean | undefined",
            runtimeType: ["Boolean","Number","String"],
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            description: "Top + bottom. Overrides `padding`; beaten by `paddingTop` / `paddingBottom`.",
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "paddingInline",
            label: "paddingInline",
            tsType: "string | number | boolean | undefined",
            runtimeType: ["Boolean","Number","String"],
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            description: "Left + right. Overrides `padding`; beaten by `paddingLeft` / `paddingRight`.",
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "paddingInlineStart",
            label: "paddingInlineStart",
            tsType: "string | number | boolean | undefined",
            runtimeType: ["Boolean","Number","String"],
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            description: "*******************************************************\nLogical per-side padding — rung 3 (issue #1013)",
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "paddingInlineEnd",
            label: "paddingInlineEnd",
            tsType: "string | number | boolean | undefined",
            runtimeType: ["Boolean","Number","String"],
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "paddingBlockStart",
            label: "paddingBlockStart",
            tsType: "string | number | boolean | undefined",
            runtimeType: ["Boolean","Number","String"],
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "paddingBlockEnd",
            label: "paddingBlockEnd",
            tsType: "string | number | boolean | undefined",
            runtimeType: ["Boolean","Number","String"],
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "href",
            label: "href",
            tsType: "string | undefined",
            runtimeType: "String",
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "replace",
            label: "replace",
            tsType: "boolean | undefined",
            runtimeType: "Boolean",
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.SWITCH,
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "to",
            label: "to",
            tsType: "string | kt | Tt | undefined",
            runtimeType: null,
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "exact",
            label: "exact",
            tsType: "boolean | undefined",
            runtimeType: "Boolean",
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.SWITCH,
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "ripple",
            label: "ripple",
            tsType: "boolean | { class: string; } | undefined",
            runtimeType: ["Boolean","Object"],
            required: false,
            defaultValue: true,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "appendAvatar",
            label: "appendAvatar",
            tsType: "string | undefined",
            runtimeType: "String",
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "appendIcon",
            label: "appendIcon",
            tsType: "TIcon | undefined",
            runtimeType: null,
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "prependAvatar",
            label: "prependAvatar",
            tsType: "string | undefined",
            runtimeType: "String",
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "prependIcon",
            label: "prependIcon",
            tsType: "TIcon | undefined",
            runtimeType: null,
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "prependAriaLabel",
            label: "prependAriaLabel",
            tsType: "string | undefined",
            runtimeType: "String",
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "appendAriaLabel",
            label: "appendAriaLabel",
            tsType: "string | undefined",
            runtimeType: "String",
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "active",
            label: "active",
            tsType: "boolean | IStateEffectConfig | undefined",
            runtimeType: ["Boolean","Object"],
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "activeClass",
            label: "activeClass",
            tsType: "string | undefined",
            runtimeType: "String",
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "hover",
            label: "hover",
            tsType: "boolean | IStateEffectConfig | undefined",
            runtimeType: ["Boolean","Object"],
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "hoverClass",
            label: "hoverClass",
            tsType: "string | undefined",
            runtimeType: "String",
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.TYPES
        }
        ],
        events: [
        {
            name: "update:hover",
            label: "update:hover",
            payloadType: "[value: boolean]",
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "update:active",
            label: "update:active",
            payloadType: "[event: any]",
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "click:append",
            label: "click:append",
            payloadType: "[event: MouseEvent]",
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "click:prepend",
            label: "click:prepend",
            payloadType: "[event: MouseEvent]",
            source: METADATA_SOURCE.TYPES
        }
        ],
        slots: [
        {
            name: "wrapper",
            label: "wrapper",
            slotPropsType: "any",
            description: "Overrides the whole loader/header/asset/text/footer layout.",
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "loader",
            label: "loader",
            slotPropsType: "any",
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "header",
            label: "header",
            slotPropsType: "any",
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "header.append",
            label: "header.append",
            slotPropsType: "any",
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "header.prepend",
            label: "header.prepend",
            slotPropsType: "any",
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "header.title",
            label: "header.title",
            slotPropsType: "any",
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "header.subtitle",
            label: "header.subtitle",
            slotPropsType: "any",
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "header.content",
            label: "header.content",
            slotPropsType: "any",
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "asset",
            label: "asset",
            slotPropsType: "any",
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "text",
            label: "text",
            slotPropsType: "any",
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "default",
            label: "default",
            slotPropsType: "any",
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "footer",
            label: "footer",
            slotPropsType: "any",
            source: METADATA_SOURCE.TYPES
        }
        ],
        snippets: [],
        requiresParent: false
    },
    {
        name: "OrigamChip",
        tag: "origam-chip",
        family: "Chip",
        label: "Chip",
        category: "Data Display",
        props: [
        {
            name: "closable",
            label: "closable",
            tsType: "boolean | undefined",
            runtimeType: "Boolean",
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.SWITCH,
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "closeIcon",
            label: "closeIcon",
            tsType: "TIcon | undefined",
            runtimeType: null,
            required: false,
            defaultValue: "mdi:mdi-close-circle-outline",
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "closeLabel",
            label: "closeLabel",
            tsType: "string | undefined",
            runtimeType: "String",
            required: false,
            defaultValue: "origam.close",
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "draggable",
            label: "draggable",
            tsType: "boolean | undefined",
            runtimeType: "Boolean",
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.SWITCH,
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "filter",
            label: "filter",
            tsType: "boolean | undefined",
            runtimeType: "Boolean",
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.SWITCH,
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "filterIcon",
            label: "filterIcon",
            tsType: "TIcon | undefined",
            runtimeType: null,
            required: false,
            defaultValue: "mdi:mdi-check",
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "label",
            label: "label",
            tsType: "boolean | undefined",
            runtimeType: "Boolean",
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.SWITCH,
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "link",
            label: "link",
            tsType: "boolean | undefined",
            runtimeType: "Boolean",
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.SWITCH,
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "pill",
            label: "pill",
            tsType: "boolean | undefined",
            runtimeType: "Boolean",
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.SWITCH,
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "text",
            label: "text",
            tsType: "string | undefined",
            runtimeType: "String",
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "modelValue",
            label: "modelValue",
            tsType: "boolean | undefined",
            runtimeType: "Boolean",
            required: false,
            defaultValue: true,
            hasFactoryDefault: false,
            control: CONTROL_KIND.SWITCH,
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "id",
            label: "id",
            tsType: "string | undefined",
            runtimeType: "String",
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "class",
            label: "class",
            tsType: null,
            runtimeType: ["String","Array","Object"],
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.RUNTIME
        },
        {
            name: "style",
            label: "style",
            tsType: null,
            runtimeType: ["String","Array","Object","Boolean"],
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.RUNTIME
        },
        {
            name: "appendAvatar",
            label: "appendAvatar",
            tsType: "string | undefined",
            runtimeType: "String",
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "appendIcon",
            label: "appendIcon",
            tsType: "TIcon | undefined",
            runtimeType: null,
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "prependAvatar",
            label: "prependAvatar",
            tsType: "string | undefined",
            runtimeType: "String",
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "prependIcon",
            label: "prependIcon",
            tsType: "TIcon | undefined",
            runtimeType: null,
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "prependAriaLabel",
            label: "prependAriaLabel",
            tsType: "string | undefined",
            runtimeType: "String",
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "appendAriaLabel",
            label: "appendAriaLabel",
            tsType: "string | undefined",
            runtimeType: "String",
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "tag",
            label: "tag",
            tsType: "string | undefined",
            runtimeType: "String",
            required: false,
            defaultValue: "span",
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "color",
            label: "color",
            tsType: "TColor",
            runtimeType: ["String","Object","Boolean"],
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "bgColor",
            label: "bgColor",
            tsType: "TColor",
            runtimeType: ["String","Object","Boolean"],
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "ripple",
            label: "ripple",
            tsType: "boolean | { class: string; } | undefined",
            runtimeType: ["Boolean","Object"],
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "border",
            label: "border",
            tsType: "string | number | boolean | TDirectionBoth[] | undefined",
            runtimeType: ["Boolean","Number","String","Array"],
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "borderTop",
            label: "borderTop",
            tsType: "string | number | boolean | undefined",
            runtimeType: ["Boolean","Number","String"],
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "borderLeft",
            label: "borderLeft",
            tsType: "string | number | boolean | undefined",
            runtimeType: ["Boolean","Number","String"],
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "borderBottom",
            label: "borderBottom",
            tsType: "string | number | boolean | undefined",
            runtimeType: ["Boolean","Number","String"],
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "borderRight",
            label: "borderRight",
            tsType: "string | number | boolean | undefined",
            runtimeType: ["Boolean","Number","String"],
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "borderBlock",
            label: "borderBlock",
            tsType: "string | number | boolean | undefined",
            runtimeType: ["Boolean","Number","String"],
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            description: "Logical-axis shorthand for the block-start + block-end edges (top +\nbottom in the default horizontal-tb writing mode). Resolves to the\nnative CSS `border-block-{width,style,color}` properties — same\nvalue grammar as `borderTop` / `borderRight` / `borderBottom` /\n`borderLeft` (boolean opt-in, bare width number, or a free-form\n`\"width style color\"` string). Precedence: beats the global `border`\nshorthand for the edges it targets, but a physical `borderTop` /\n`borderBottom` still wins over it for that specific edge — see\n`useBorder` JSDoc for the full precedence table.",
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "borderInline",
            label: "borderInline",
            tsType: "string | number | boolean | undefined",
            runtimeType: ["Boolean","Number","String"],
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            description: "Logical-axis shorthand for the inline-start + inline-end edges (left\n+ right in LTR). Same grammar and precedence rules as `borderBlock`,\nmapped onto `border-inline-{width,style,color}`.",
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "borderInlineStart",
            label: "borderInlineStart",
            tsType: "string | number | boolean | undefined",
            runtimeType: ["Boolean","Number","String"],
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            description: "*******************************************************\nborderInlineStart",
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "borderInlineEnd",
            label: "borderInlineEnd",
            tsType: "string | number | boolean | undefined",
            runtimeType: ["Boolean","Number","String"],
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            description: "*******************************************************\nborderInlineEnd",
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "borderBlockStart",
            label: "borderBlockStart",
            tsType: "string | number | boolean | undefined",
            runtimeType: ["Boolean","Number","String"],
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            description: "*******************************************************\nborderBlockStart",
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "borderBlockEnd",
            label: "borderBlockEnd",
            tsType: "string | number | boolean | undefined",
            runtimeType: ["Boolean","Number","String"],
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            description: "*******************************************************\nborderBlockEnd",
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "borderColor",
            label: "borderColor",
            tsType: "string | undefined",
            runtimeType: "String",
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "borderStyle",
            label: "borderStyle",
            tsType: "string | undefined",
            runtimeType: "String",
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "borderTopColor",
            label: "borderTopColor",
            tsType: "TColor",
            runtimeType: ["String","Object","Boolean"],
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            description: "Per-side color override (issue #215). Additive: absent by default,\nno behaviour change for existing consumers.\n\nPrecedence (specific > global): `borderTopColor` wins over any\ncolor implied by `borderTop` (e.g. `borderTop=\"2px dashed red\"`),\nwhich itself wins over the global `borderColor` / `border` shorthand\nfor the top side. See `useBorder` JSDoc for the full precedence\ntable.\n\nAccepts a {@link TColor} (semantic intent, raw CSS color, or falsy\nto opt out) — same input family as `color` / `bgColor`. Gradients\nare NOT supported on border colors (CSS `border-color` has no\ngradient form) and are silently ignored.",
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "borderRightColor",
            label: "borderRightColor",
            tsType: "TColor",
            runtimeType: ["String","Object","Boolean"],
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "borderBottomColor",
            label: "borderBottomColor",
            tsType: "TColor",
            runtimeType: ["String","Object","Boolean"],
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "borderLeftColor",
            label: "borderLeftColor",
            tsType: "TColor",
            runtimeType: ["String","Object","Boolean"],
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "borderInlineStartColor",
            label: "borderInlineStartColor",
            tsType: "TColor",
            runtimeType: ["String","Object","Boolean"],
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            description: "*******************************************************\nborderInlineStartColor",
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "borderInlineEndColor",
            label: "borderInlineEndColor",
            tsType: "TColor",
            runtimeType: ["String","Object","Boolean"],
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            description: "*******************************************************\nborderInlineEndColor",
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "borderBlockStartColor",
            label: "borderBlockStartColor",
            tsType: "TColor",
            runtimeType: ["String","Object","Boolean"],
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            description: "*******************************************************\nborderBlockStartColor",
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "borderBlockEndColor",
            label: "borderBlockEndColor",
            tsType: "TColor",
            runtimeType: ["String","Object","Boolean"],
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            description: "*******************************************************\nborderBlockEndColor",
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "rounded",
            label: "rounded",
            tsType: "string | number | boolean | null | undefined",
            runtimeType: ["Boolean","Number","String"],
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            description: "Corner-radius selector. Three modes:\n - **named variant** (`'small' | 'default' | 'large' | …`,\n   cf. `ROUNDED` enum) → emits `--rounded-{name}` class so the\n   component's SCSS can pick the right token rung.\n - **boolean `true`** (or empty string `''`) → emits the legacy\n   `--rounded` class for components that only have a single rounded\n   state (e.g. `OrigamBtn` defaulting to `radius.2xl`).\n - **CSS value** (`'4px'`, `'4px 0 4px 0'`, `100`) → emits inline\n   `border-radius` declarations via `useRounded.roundedStyles`.",
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "roundedTopRight",
            label: "roundedTopRight",
            tsType: "string | number | boolean | undefined",
            runtimeType: ["Boolean","Number","String"],
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            description: "Top-right corner only. Takes the same vocabulary as `rounded`\n(`8`, `'8px'`, `'md'`, `'large'`, `'var(…)'`), minus `shaped` /\n`shaped-invert` which are asymmetric by definition.",
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "roundedTopLeft",
            label: "roundedTopLeft",
            tsType: "string | number | boolean | undefined",
            runtimeType: ["Boolean","Number","String"],
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            description: "Top-left corner only. Same vocabulary as `roundedTopRight`.",
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "roundedBottomLeft",
            label: "roundedBottomLeft",
            tsType: "string | number | boolean | undefined",
            runtimeType: ["Boolean","Number","String"],
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            description: "Bottom-left corner only. Same vocabulary as `roundedTopRight`.",
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "roundedBottomRight",
            label: "roundedBottomRight",
            tsType: "string | number | boolean | undefined",
            runtimeType: ["Boolean","Number","String"],
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            description: "Bottom-right corner only. Same vocabulary as `roundedTopRight`.",
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "roundedStartStart",
            label: "roundedStartStart",
            tsType: "string | number | boolean | undefined",
            runtimeType: ["Boolean","Number","String"],
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            description: "*******************************************************\nLogical per-corner radius — rung 2 (issue #1013)",
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "roundedStartEnd",
            label: "roundedStartEnd",
            tsType: "string | number | boolean | undefined",
            runtimeType: ["Boolean","Number","String"],
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "roundedEndStart",
            label: "roundedEndStart",
            tsType: "string | number | boolean | undefined",
            runtimeType: ["Boolean","Number","String"],
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "roundedEndEnd",
            label: "roundedEndEnd",
            tsType: "string | number | boolean | undefined",
            runtimeType: ["Boolean","Number","String"],
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "padding",
            label: "padding",
            tsType: "string | number | boolean | undefined",
            runtimeType: ["Boolean","Number","String"],
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            description: "Global shorthand. `16` → `16px`; `\"4\"` → the `--origam-space---4`\ndesign rung; `\"8px 16px\"` → block / inline; `true` → the legacy\n`--padded` class.",
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "paddingTop",
            label: "paddingTop",
            tsType: "string | number | boolean | undefined",
            runtimeType: ["Boolean","Number","String"],
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            description: "Overrides `padding` and `paddingBlock` for the top edge.",
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "paddingLeft",
            label: "paddingLeft",
            tsType: "string | number | boolean | undefined",
            runtimeType: ["Boolean","Number","String"],
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            description: "Overrides `padding` and `paddingInline` for the left edge.",
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "paddingBottom",
            label: "paddingBottom",
            tsType: "string | number | boolean | undefined",
            runtimeType: ["Boolean","Number","String"],
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            description: "Overrides `padding` and `paddingBlock` for the bottom edge.",
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "paddingRight",
            label: "paddingRight",
            tsType: "string | number | boolean | undefined",
            runtimeType: ["Boolean","Number","String"],
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            description: "Overrides `padding` and `paddingInline` for the right edge.",
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "paddingBlock",
            label: "paddingBlock",
            tsType: "string | number | boolean | undefined",
            runtimeType: ["Boolean","Number","String"],
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            description: "Top + bottom. Overrides `padding`; beaten by `paddingTop` / `paddingBottom`.",
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "paddingInline",
            label: "paddingInline",
            tsType: "string | number | boolean | undefined",
            runtimeType: ["Boolean","Number","String"],
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            description: "Left + right. Overrides `padding`; beaten by `paddingLeft` / `paddingRight`.",
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "paddingInlineStart",
            label: "paddingInlineStart",
            tsType: "string | number | boolean | undefined",
            runtimeType: ["Boolean","Number","String"],
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            description: "*******************************************************\nLogical per-side padding — rung 3 (issue #1013)",
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "paddingInlineEnd",
            label: "paddingInlineEnd",
            tsType: "string | number | boolean | undefined",
            runtimeType: ["Boolean","Number","String"],
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "paddingBlockStart",
            label: "paddingBlockStart",
            tsType: "string | number | boolean | undefined",
            runtimeType: ["Boolean","Number","String"],
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "paddingBlockEnd",
            label: "paddingBlockEnd",
            tsType: "string | number | boolean | undefined",
            runtimeType: ["Boolean","Number","String"],
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "margin",
            label: "margin",
            tsType: "string | number | boolean | undefined",
            runtimeType: ["Boolean","Number","String"],
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            description: "Global shorthand. `16` → `16px`; `\"4\"` → the `--origam-space---4`\ndesign rung; `\"8px 16px\"` → block / inline; `true` → the legacy\n`--marged` class.",
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "marginTop",
            label: "marginTop",
            tsType: "string | number | boolean | undefined",
            runtimeType: ["Boolean","Number","String"],
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            description: "Overrides `margin` and `marginBlock` for the top edge.",
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "marginLeft",
            label: "marginLeft",
            tsType: "string | number | boolean | undefined",
            runtimeType: ["Boolean","Number","String"],
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            description: "Overrides `margin` and `marginInline` for the left edge.",
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "marginBottom",
            label: "marginBottom",
            tsType: "string | number | boolean | undefined",
            runtimeType: ["Boolean","Number","String"],
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            description: "Overrides `margin` and `marginBlock` for the bottom edge.",
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "marginRight",
            label: "marginRight",
            tsType: "string | number | boolean | undefined",
            runtimeType: ["Boolean","Number","String"],
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            description: "Overrides `margin` and `marginInline` for the right edge.",
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "marginBlock",
            label: "marginBlock",
            tsType: "string | number | boolean | undefined",
            runtimeType: ["Boolean","Number","String"],
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            description: "Top + bottom. Overrides `margin`; beaten by `marginTop` / `marginBottom`.",
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "marginInline",
            label: "marginInline",
            tsType: "string | number | boolean | undefined",
            runtimeType: ["Boolean","Number","String"],
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            description: "Left + right. Overrides `margin`; beaten by `marginLeft` / `marginRight`.",
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "marginInlineStart",
            label: "marginInlineStart",
            tsType: "string | number | boolean | undefined",
            runtimeType: ["Boolean","Number","String"],
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            description: "*******************************************************\nLogical per-side margin — rung 3 (issue #1013)",
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "marginInlineEnd",
            label: "marginInlineEnd",
            tsType: "string | number | boolean | undefined",
            runtimeType: ["Boolean","Number","String"],
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "marginBlockStart",
            label: "marginBlockStart",
            tsType: "string | number | boolean | undefined",
            runtimeType: ["Boolean","Number","String"],
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "marginBlockEnd",
            label: "marginBlockEnd",
            tsType: "string | number | boolean | undefined",
            runtimeType: ["Boolean","Number","String"],
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "density",
            label: "density",
            tsType: "\"default\" | \"compact\" | \"comfortable\" | undefined",
            runtimeType: null,
            required: false,
            hasFactoryDefault: false,
            options: ["default","compact","comfortable"],
            control: CONTROL_KIND.SELECT,
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "value",
            label: "value",
            tsType: "any",
            runtimeType: null,
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "disabled",
            label: "disabled",
            tsType: "boolean | undefined",
            runtimeType: "Boolean",
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.SWITCH,
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "selectedClass",
            label: "selectedClass",
            tsType: "string | undefined",
            runtimeType: "String",
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "href",
            label: "href",
            tsType: "string | undefined",
            runtimeType: "String",
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "replace",
            label: "replace",
            tsType: "boolean | undefined",
            runtimeType: "Boolean",
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.SWITCH,
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "to",
            label: "to",
            tsType: "string | kt | Tt | undefined",
            runtimeType: null,
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "exact",
            label: "exact",
            tsType: "boolean | undefined",
            runtimeType: "Boolean",
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.SWITCH,
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "size",
            label: "size",
            tsType: "number | \"default\" | \"x-small\" | \"small\" | \"large\" | \"x-large\" | undefined",
            runtimeType: null,
            required: false,
            defaultValue: "default",
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "elevation",
            label: "elevation",
            tsType: "TElevation | undefined",
            runtimeType: ["Number","String"],
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "active",
            label: "active",
            tsType: "boolean | IStateEffectConfig | undefined",
            runtimeType: ["Boolean","Object"],
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "activeClass",
            label: "activeClass",
            tsType: "string | undefined",
            runtimeType: "String",
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "hover",
            label: "hover",
            tsType: "boolean | IStateEffectConfig | undefined",
            runtimeType: ["Boolean","Object"],
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "hoverClass",
            label: "hoverClass",
            tsType: "string | undefined",
            runtimeType: "String",
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "fontFamily",
            label: "fontFamily",
            tsType: "\"sans\" | \"mono\" | \"serif\" | undefined",
            runtimeType: null,
            required: false,
            hasFactoryDefault: false,
            options: ["sans","mono","serif"],
            control: CONTROL_KIND.SELECT,
            description: "Font family token. Maps to `--origam-font__family---{fontFamily}`\n(sans · mono · serif).\nWhen unset, the component keeps its theme font-family.",
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "fontSize",
            label: "fontSize",
            tsType: "\"xs\" | \"sm\" | \"md\" | \"lg\" | \"xl\" | \"2xl\" | \"3xl\" | \"4xl\" | \"5xl\" | undefined",
            runtimeType: null,
            required: false,
            hasFactoryDefault: false,
            options: ["xs","sm","md","lg","xl","2xl","3xl","4xl","5xl"],
            control: CONTROL_KIND.SELECT,
            description: "Font size token. Maps to `--origam-font__size---{fontSize}`\n(xs · sm · md · lg · xl · 2xl · 3xl · 4xl · 5xl).\nWhen unset, the component keeps its theme / density font-size.",
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "fontWeight",
            label: "fontWeight",
            tsType: "\"regular\" | \"medium\" | \"semibold\" | \"bold\" | \"extrabold\" | \"black\" | undefined",
            runtimeType: null,
            required: false,
            hasFactoryDefault: false,
            options: ["regular","medium","semibold","bold","extrabold","black"],
            control: CONTROL_KIND.SELECT,
            description: "Font weight token. Maps to `--origam-font__weight---{fontWeight}`\n(regular 400 · medium 500 · semibold 600 · bold 700 · extrabold 800 · black 900).\nWhen unset, the component keeps its theme font-weight.",
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "letterSpacing",
            label: "letterSpacing",
            tsType: "\"tight\" | \"normal\" | \"wide\" | \"wider\" | \"widest\" | undefined",
            runtimeType: null,
            required: false,
            hasFactoryDefault: false,
            options: ["tight","normal","wide","wider","widest"],
            control: CONTROL_KIND.SELECT,
            description: "Letter-spacing token. Maps to `--origam-font__letterSpacing---{letterSpacing}`\n(tight -0.025em · normal 0em · wide 0.0094em · wider 0.0125em · widest 0.0893em).\nWhen unset, the component keeps its theme letter-spacing.",
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "textTransform",
            label: "textTransform",
            tsType: "\"none\" | \"uppercase\" | \"lowercase\" | \"capitalize\" | undefined",
            runtimeType: null,
            required: false,
            hasFactoryDefault: false,
            options: ["none","uppercase","lowercase","capitalize"],
            control: CONTROL_KIND.SELECT,
            description: "*******************************************************\ntextTransform",
            source: METADATA_SOURCE.TYPES
        }
        ],
        events: [
        {
            name: "update:modelValue",
            label: "update:modelValue",
            payloadType: "[event: any]",
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "click:close",
            label: "click:close",
            payloadType: "[event: MouseEvent]",
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "click:append",
            label: "click:append",
            payloadType: "[event: MouseEvent]",
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "click:prepend",
            label: "click:prepend",
            payloadType: "[event: MouseEvent]",
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "group:selected",
            label: "group:selected",
            payloadType: "[value: { value: boolean; }]",
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "click",
            label: "click",
            payloadType: "[event: MouseEvent]",
            source: METADATA_SOURCE.TYPES
        }
        ],
        slots: [
        {
            name: "filter",
            label: "filter",
            slotPropsType: "{ filterIcon: TIcon | undefined; }",
            description: "Shown while `filter` is set and the chip is selected.",
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "default",
            label: "default",
            slotPropsType: "{ isSelected: boolean | undefined; selectedClass: false | (string | undefined)[] | undefined; select: ((value: boolean) => void) | undefined; toggle: (() => void) | undefined; value: unknown; disabled: boolean | undefined; }",
            description: "Overrides the `text` prop, receives the group-membership API when\nthe chip lives inside an `<OrigamChipGroup>`.",
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "close",
            label: "close",
            slotPropsType: "{ closeIcon: TIcon | undefined; }",
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "prepend",
            label: "prepend",
            slotPropsType: "any",
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "append",
            label: "append",
            slotPropsType: "any",
            source: METADATA_SOURCE.TYPES
        }
        ],
        snippets: [],
        requiresParent: false
    },
    {
        name: "OrigamDataTable",
        tag: "origam-data-table",
        family: "DataTable",
        label: "DataTable",
        category: "Data Display",
        props: [
        {
            name: "hideDefaultBody",
            label: "hideDefaultBody",
            tsType: "boolean | undefined",
            runtimeType: "Boolean",
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.SWITCH,
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "hideDefaultFooter",
            label: "hideDefaultFooter",
            tsType: "boolean | undefined",
            runtimeType: "Boolean",
            required: false,
            defaultValue: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.SWITCH,
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "hideDefaultHeader",
            label: "hideDefaultHeader",
            tsType: "boolean | undefined",
            runtimeType: "Boolean",
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.SWITCH,
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "search",
            label: "search",
            tsType: "string | undefined",
            runtimeType: "String",
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "fixedHeader",
            label: "fixedHeader",
            tsType: "boolean | undefined",
            runtimeType: "Boolean",
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.SWITCH,
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "fixedFooter",
            label: "fixedFooter",
            tsType: "boolean | undefined",
            runtimeType: "Boolean",
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.SWITCH,
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "caption",
            label: "caption",
            tsType: "string | undefined",
            runtimeType: "String",
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "captionVisible",
            label: "captionVisible",
            tsType: "boolean | undefined",
            runtimeType: "Boolean",
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.SWITCH,
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "ariaRowcount",
            label: "ariaRowcount",
            tsType: "number | undefined",
            runtimeType: "Number",
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.NUMBER,
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "id",
            label: "id",
            tsType: "string | undefined",
            runtimeType: "String",
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "class",
            label: "class",
            tsType: null,
            runtimeType: ["String","Array","Object"],
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.RUNTIME
        },
        {
            name: "style",
            label: "style",
            tsType: null,
            runtimeType: ["String","Array","Object","Boolean"],
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.RUNTIME
        },
        {
            name: "border",
            label: "border",
            tsType: "string | number | boolean | TDirectionBoth[] | undefined",
            runtimeType: ["Boolean","Number","String","Array"],
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "borderTop",
            label: "borderTop",
            tsType: "string | number | boolean | undefined",
            runtimeType: ["Boolean","Number","String"],
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "borderLeft",
            label: "borderLeft",
            tsType: "string | number | boolean | undefined",
            runtimeType: ["Boolean","Number","String"],
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "borderBottom",
            label: "borderBottom",
            tsType: "string | number | boolean | undefined",
            runtimeType: ["Boolean","Number","String"],
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "borderRight",
            label: "borderRight",
            tsType: "string | number | boolean | undefined",
            runtimeType: ["Boolean","Number","String"],
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "borderBlock",
            label: "borderBlock",
            tsType: "string | number | boolean | undefined",
            runtimeType: ["Boolean","Number","String"],
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            description: "Logical-axis shorthand for the block-start + block-end edges (top +\nbottom in the default horizontal-tb writing mode). Resolves to the\nnative CSS `border-block-{width,style,color}` properties — same\nvalue grammar as `borderTop` / `borderRight` / `borderBottom` /\n`borderLeft` (boolean opt-in, bare width number, or a free-form\n`\"width style color\"` string). Precedence: beats the global `border`\nshorthand for the edges it targets, but a physical `borderTop` /\n`borderBottom` still wins over it for that specific edge — see\n`useBorder` JSDoc for the full precedence table.",
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "borderInline",
            label: "borderInline",
            tsType: "string | number | boolean | undefined",
            runtimeType: ["Boolean","Number","String"],
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            description: "Logical-axis shorthand for the inline-start + inline-end edges (left\n+ right in LTR). Same grammar and precedence rules as `borderBlock`,\nmapped onto `border-inline-{width,style,color}`.",
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "borderInlineStart",
            label: "borderInlineStart",
            tsType: "string | number | boolean | undefined",
            runtimeType: ["Boolean","Number","String"],
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            description: "*******************************************************\nborderInlineStart",
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "borderInlineEnd",
            label: "borderInlineEnd",
            tsType: "string | number | boolean | undefined",
            runtimeType: ["Boolean","Number","String"],
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            description: "*******************************************************\nborderInlineEnd",
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "borderBlockStart",
            label: "borderBlockStart",
            tsType: "string | number | boolean | undefined",
            runtimeType: ["Boolean","Number","String"],
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            description: "*******************************************************\nborderBlockStart",
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "borderBlockEnd",
            label: "borderBlockEnd",
            tsType: "string | number | boolean | undefined",
            runtimeType: ["Boolean","Number","String"],
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            description: "*******************************************************\nborderBlockEnd",
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "borderColor",
            label: "borderColor",
            tsType: "string | undefined",
            runtimeType: "String",
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "borderStyle",
            label: "borderStyle",
            tsType: "string | undefined",
            runtimeType: "String",
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "borderTopColor",
            label: "borderTopColor",
            tsType: "TColor",
            runtimeType: ["String","Object","Boolean"],
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            description: "Per-side color override (issue #215). Additive: absent by default,\nno behaviour change for existing consumers.\n\nPrecedence (specific > global): `borderTopColor` wins over any\ncolor implied by `borderTop` (e.g. `borderTop=\"2px dashed red\"`),\nwhich itself wins over the global `borderColor` / `border` shorthand\nfor the top side. See `useBorder` JSDoc for the full precedence\ntable.\n\nAccepts a {@link TColor} (semantic intent, raw CSS color, or falsy\nto opt out) — same input family as `color` / `bgColor`. Gradients\nare NOT supported on border colors (CSS `border-color` has no\ngradient form) and are silently ignored.",
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "borderRightColor",
            label: "borderRightColor",
            tsType: "TColor",
            runtimeType: ["String","Object","Boolean"],
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "borderBottomColor",
            label: "borderBottomColor",
            tsType: "TColor",
            runtimeType: ["String","Object","Boolean"],
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "borderLeftColor",
            label: "borderLeftColor",
            tsType: "TColor",
            runtimeType: ["String","Object","Boolean"],
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "borderInlineStartColor",
            label: "borderInlineStartColor",
            tsType: "TColor",
            runtimeType: ["String","Object","Boolean"],
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            description: "*******************************************************\nborderInlineStartColor",
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "borderInlineEndColor",
            label: "borderInlineEndColor",
            tsType: "TColor",
            runtimeType: ["String","Object","Boolean"],
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            description: "*******************************************************\nborderInlineEndColor",
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "borderBlockStartColor",
            label: "borderBlockStartColor",
            tsType: "TColor",
            runtimeType: ["String","Object","Boolean"],
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            description: "*******************************************************\nborderBlockStartColor",
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "borderBlockEndColor",
            label: "borderBlockEndColor",
            tsType: "TColor",
            runtimeType: ["String","Object","Boolean"],
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            description: "*******************************************************\nborderBlockEndColor",
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "rounded",
            label: "rounded",
            tsType: "string | number | boolean | null | undefined",
            runtimeType: ["Boolean","Number","String"],
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            description: "Corner-radius selector. Three modes:\n - **named variant** (`'small' | 'default' | 'large' | …`,\n   cf. `ROUNDED` enum) → emits `--rounded-{name}` class so the\n   component's SCSS can pick the right token rung.\n - **boolean `true`** (or empty string `''`) → emits the legacy\n   `--rounded` class for components that only have a single rounded\n   state (e.g. `OrigamBtn` defaulting to `radius.2xl`).\n - **CSS value** (`'4px'`, `'4px 0 4px 0'`, `100`) → emits inline\n   `border-radius` declarations via `useRounded.roundedStyles`.",
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "roundedTopRight",
            label: "roundedTopRight",
            tsType: "string | number | boolean | undefined",
            runtimeType: ["Boolean","Number","String"],
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            description: "Top-right corner only. Takes the same vocabulary as `rounded`\n(`8`, `'8px'`, `'md'`, `'large'`, `'var(…)'`), minus `shaped` /\n`shaped-invert` which are asymmetric by definition.",
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "roundedTopLeft",
            label: "roundedTopLeft",
            tsType: "string | number | boolean | undefined",
            runtimeType: ["Boolean","Number","String"],
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            description: "Top-left corner only. Same vocabulary as `roundedTopRight`.",
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "roundedBottomLeft",
            label: "roundedBottomLeft",
            tsType: "string | number | boolean | undefined",
            runtimeType: ["Boolean","Number","String"],
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            description: "Bottom-left corner only. Same vocabulary as `roundedTopRight`.",
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "roundedBottomRight",
            label: "roundedBottomRight",
            tsType: "string | number | boolean | undefined",
            runtimeType: ["Boolean","Number","String"],
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            description: "Bottom-right corner only. Same vocabulary as `roundedTopRight`.",
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "roundedStartStart",
            label: "roundedStartStart",
            tsType: "string | number | boolean | undefined",
            runtimeType: ["Boolean","Number","String"],
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            description: "*******************************************************\nLogical per-corner radius — rung 2 (issue #1013)",
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "roundedStartEnd",
            label: "roundedStartEnd",
            tsType: "string | number | boolean | undefined",
            runtimeType: ["Boolean","Number","String"],
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "roundedEndStart",
            label: "roundedEndStart",
            tsType: "string | number | boolean | undefined",
            runtimeType: ["Boolean","Number","String"],
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "roundedEndEnd",
            label: "roundedEndEnd",
            tsType: "string | number | boolean | undefined",
            runtimeType: ["Boolean","Number","String"],
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "elevation",
            label: "elevation",
            tsType: "TElevation | undefined",
            runtimeType: ["Number","String"],
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "padding",
            label: "padding",
            tsType: "string | number | boolean | undefined",
            runtimeType: ["Boolean","Number","String"],
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            description: "Global shorthand. `16` → `16px`; `\"4\"` → the `--origam-space---4`\ndesign rung; `\"8px 16px\"` → block / inline; `true` → the legacy\n`--padded` class.",
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "paddingTop",
            label: "paddingTop",
            tsType: "string | number | boolean | undefined",
            runtimeType: ["Boolean","Number","String"],
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            description: "Overrides `padding` and `paddingBlock` for the top edge.",
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "paddingLeft",
            label: "paddingLeft",
            tsType: "string | number | boolean | undefined",
            runtimeType: ["Boolean","Number","String"],
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            description: "Overrides `padding` and `paddingInline` for the left edge.",
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "paddingBottom",
            label: "paddingBottom",
            tsType: "string | number | boolean | undefined",
            runtimeType: ["Boolean","Number","String"],
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            description: "Overrides `padding` and `paddingBlock` for the bottom edge.",
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "paddingRight",
            label: "paddingRight",
            tsType: "string | number | boolean | undefined",
            runtimeType: ["Boolean","Number","String"],
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            description: "Overrides `padding` and `paddingInline` for the right edge.",
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "paddingBlock",
            label: "paddingBlock",
            tsType: "string | number | boolean | undefined",
            runtimeType: ["Boolean","Number","String"],
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            description: "Top + bottom. Overrides `padding`; beaten by `paddingTop` / `paddingBottom`.",
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "paddingInline",
            label: "paddingInline",
            tsType: "string | number | boolean | undefined",
            runtimeType: ["Boolean","Number","String"],
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            description: "Left + right. Overrides `padding`; beaten by `paddingLeft` / `paddingRight`.",
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "paddingInlineStart",
            label: "paddingInlineStart",
            tsType: "string | number | boolean | undefined",
            runtimeType: ["Boolean","Number","String"],
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            description: "*******************************************************\nLogical per-side padding — rung 3 (issue #1013)",
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "paddingInlineEnd",
            label: "paddingInlineEnd",
            tsType: "string | number | boolean | undefined",
            runtimeType: ["Boolean","Number","String"],
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "paddingBlockStart",
            label: "paddingBlockStart",
            tsType: "string | number | boolean | undefined",
            runtimeType: ["Boolean","Number","String"],
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "paddingBlockEnd",
            label: "paddingBlockEnd",
            tsType: "string | number | boolean | undefined",
            runtimeType: ["Boolean","Number","String"],
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "margin",
            label: "margin",
            tsType: "string | number | boolean | undefined",
            runtimeType: ["Boolean","Number","String"],
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            description: "Global shorthand. `16` → `16px`; `\"4\"` → the `--origam-space---4`\ndesign rung; `\"8px 16px\"` → block / inline; `true` → the legacy\n`--marged` class.",
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "marginTop",
            label: "marginTop",
            tsType: "string | number | boolean | undefined",
            runtimeType: ["Boolean","Number","String"],
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            description: "Overrides `margin` and `marginBlock` for the top edge.",
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "marginLeft",
            label: "marginLeft",
            tsType: "string | number | boolean | undefined",
            runtimeType: ["Boolean","Number","String"],
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            description: "Overrides `margin` and `marginInline` for the left edge.",
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "marginBottom",
            label: "marginBottom",
            tsType: "string | number | boolean | undefined",
            runtimeType: ["Boolean","Number","String"],
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            description: "Overrides `margin` and `marginBlock` for the bottom edge.",
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "marginRight",
            label: "marginRight",
            tsType: "string | number | boolean | undefined",
            runtimeType: ["Boolean","Number","String"],
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            description: "Overrides `margin` and `marginInline` for the right edge.",
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "marginBlock",
            label: "marginBlock",
            tsType: "string | number | boolean | undefined",
            runtimeType: ["Boolean","Number","String"],
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            description: "Top + bottom. Overrides `margin`; beaten by `marginTop` / `marginBottom`.",
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "marginInline",
            label: "marginInline",
            tsType: "string | number | boolean | undefined",
            runtimeType: ["Boolean","Number","String"],
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            description: "Left + right. Overrides `margin`; beaten by `marginLeft` / `marginRight`.",
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "marginInlineStart",
            label: "marginInlineStart",
            tsType: "string | number | boolean | undefined",
            runtimeType: ["Boolean","Number","String"],
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            description: "*******************************************************\nLogical per-side margin — rung 3 (issue #1013)",
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "marginInlineEnd",
            label: "marginInlineEnd",
            tsType: "string | number | boolean | undefined",
            runtimeType: ["Boolean","Number","String"],
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "marginBlockStart",
            label: "marginBlockStart",
            tsType: "string | number | boolean | undefined",
            runtimeType: ["Boolean","Number","String"],
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "marginBlockEnd",
            label: "marginBlockEnd",
            tsType: "string | number | boolean | undefined",
            runtimeType: ["Boolean","Number","String"],
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "hover",
            label: "hover",
            tsType: "boolean | IStateEffectConfig | undefined",
            runtimeType: ["Boolean","Object"],
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "hoverClass",
            label: "hoverClass",
            tsType: "string | undefined",
            runtimeType: "String",
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "height",
            label: "height",
            tsType: "string | number | undefined",
            runtimeType: ["Number","String"],
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "maxHeight",
            label: "maxHeight",
            tsType: "string | number | undefined",
            runtimeType: ["Number","String"],
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "maxWidth",
            label: "maxWidth",
            tsType: "string | number | undefined",
            runtimeType: ["Number","String"],
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "minHeight",
            label: "minHeight",
            tsType: "string | number | undefined",
            runtimeType: ["Number","String"],
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "minWidth",
            label: "minWidth",
            tsType: "string | number | undefined",
            runtimeType: ["Number","String"],
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "width",
            label: "width",
            tsType: "string | number | undefined",
            runtimeType: ["Number","String"],
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "density",
            label: "density",
            tsType: "\"default\" | \"compact\" | \"comfortable\" | undefined",
            runtimeType: null,
            required: false,
            defaultValue: "default",
            hasFactoryDefault: false,
            options: ["default","compact","comfortable"],
            control: CONTROL_KIND.SELECT,
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "tag",
            label: "tag",
            tsType: "string | undefined",
            runtimeType: "String",
            required: false,
            defaultValue: "div",
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "fontSize",
            label: "fontSize",
            tsType: "\"xs\" | \"sm\" | \"md\" | \"lg\" | \"xl\" | \"2xl\" | \"3xl\" | \"4xl\" | \"5xl\" | undefined",
            runtimeType: null,
            required: false,
            hasFactoryDefault: false,
            options: ["xs","sm","md","lg","xl","2xl","3xl","4xl","5xl"],
            control: CONTROL_KIND.SELECT,
            description: "Font size token. Maps to `--origam-font__size---{fontSize}`\n(xs · sm · md · lg · xl · 2xl · 3xl · 4xl · 5xl).\nWhen unset, the component keeps its theme / density font-size.",
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "fontWeight",
            label: "fontWeight",
            tsType: "\"regular\" | \"medium\" | \"semibold\" | \"bold\" | \"extrabold\" | \"black\" | undefined",
            runtimeType: null,
            required: false,
            hasFactoryDefault: false,
            options: ["regular","medium","semibold","bold","extrabold","black"],
            control: CONTROL_KIND.SELECT,
            description: "Font weight token. Maps to `--origam-font__weight---{fontWeight}`\n(regular 400 · medium 500 · semibold 600 · bold 700 · extrabold 800 · black 900).\nWhen unset, the component keeps its theme font-weight.",
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "item",
            label: "item",
            tsType: "IDataTableItem<any>",
            runtimeType: "Object",
            required: true,
            hasFactoryDefault: false,
            control: CONTROL_KIND.JSON,
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "cellProps",
            label: "cellProps",
            tsType: "TDataTableCell<any> | undefined",
            runtimeType: ["Object","Function"],
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "mobileBreakpoint",
            label: "mobileBreakpoint",
            tsType: "number | \"xs\" | \"sm\" | \"md\" | \"lg\" | \"xl\" | \"xxl\" | undefined",
            runtimeType: null,
            required: false,
            defaultValue: "xs",
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "expandOnClick",
            label: "expandOnClick",
            tsType: "boolean | undefined",
            runtimeType: "Boolean",
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.SWITCH,
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "showExpand",
            label: "showExpand",
            tsType: "boolean | undefined",
            runtimeType: "Boolean",
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.SWITCH,
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "expanded",
            label: "expanded",
            tsType: "string[] | undefined",
            runtimeType: "Array",
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.JSON,
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "groupBy",
            label: "groupBy",
            tsType: "IDataTableSortItem[] | undefined",
            runtimeType: "Array",
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.JSON,
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "headers",
            label: "headers",
            tsType: "IDataTableHeader<any>[] | undefined",
            runtimeType: "Array",
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.JSON,
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "items",
            label: "items",
            tsType: "IDataTableItem<any>[] | undefined",
            runtimeType: "Array",
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.JSON,
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "itemValue",
            label: "itemValue",
            tsType: "TSelectItemKey",
            runtimeType: null,
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "itemSelectable",
            label: "itemSelectable",
            tsType: "TSelectItemKey",
            runtimeType: null,
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "rowProps",
            label: "rowProps",
            tsType: "TDataTableRow<any> | undefined",
            runtimeType: ["Object","Function"],
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "returnObject",
            label: "returnObject",
            tsType: "boolean | undefined",
            runtimeType: "Boolean",
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.SWITCH,
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "showSelect",
            label: "showSelect",
            tsType: "boolean | undefined",
            runtimeType: "Boolean",
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.SWITCH,
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "selectStrategy",
            label: "selectStrategy",
            tsType: "\"all\" | \"single\" | \"page\" | undefined",
            runtimeType: null,
            required: false,
            hasFactoryDefault: false,
            options: ["all","single","page"],
            control: CONTROL_KIND.SELECT,
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "modelValue",
            label: "modelValue",
            tsType: "any[] | undefined",
            runtimeType: "Array",
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.JSON,
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "valueComparator",
            label: "valueComparator",
            tsType: "((a: any, b: any) => boolean) | undefined",
            runtimeType: "Function",
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "sortBy",
            label: "sortBy",
            tsType: "IDataTableSortItem[] | undefined",
            runtimeType: "Array",
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.JSON,
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "customKeySort",
            label: "customKeySort",
            tsType: "TDataTableCompareFunction | undefined",
            runtimeType: "Function",
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "multiSort",
            label: "multiSort",
            tsType: "boolean | undefined",
            runtimeType: "Boolean",
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.SWITCH,
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "mustSort",
            label: "mustSort",
            tsType: "boolean | undefined",
            runtimeType: "Boolean",
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.SWITCH,
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "color",
            label: "color",
            tsType: "TColor",
            runtimeType: ["String","Object","Boolean"],
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "loading",
            label: "loading",
            tsType: "TLoadingValue | undefined",
            runtimeType: ["Boolean","Number","Object"],
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "loadingText",
            label: "loadingText",
            tsType: "string | undefined",
            runtimeType: "String",
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "disableSort",
            label: "disableSort",
            tsType: "boolean | undefined",
            runtimeType: "Boolean",
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.SWITCH,
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "headerProps",
            label: "headerProps",
            tsType: "any",
            runtimeType: null,
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "sticky",
            label: "sticky",
            tsType: "boolean | undefined",
            runtimeType: "Boolean",
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.SWITCH,
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "sortAscIcon",
            label: "sortAscIcon",
            tsType: "TIcon | undefined",
            runtimeType: null,
            required: false,
            defaultValue: "mdi:mdi-arrow-up",
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "sortDescIcon",
            label: "sortDescIcon",
            tsType: "TIcon | undefined",
            runtimeType: null,
            required: false,
            defaultValue: "mdi:mdi-arrow-down",
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "page",
            label: "page",
            tsType: "string | number | undefined",
            runtimeType: ["Number","String"],
            required: false,
            defaultValue: 1,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "itemsPerPage",
            label: "itemsPerPage",
            tsType: "string | number | undefined",
            runtimeType: ["Number","String"],
            required: false,
            defaultValue: 10,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "customFilter",
            label: "customFilter",
            tsType: "TFilterFunction | undefined",
            runtimeType: "Function",
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "customKeyFilter",
            label: "customKeyFilter",
            tsType: "TFilterKeyFunctions | undefined",
            runtimeType: "Object",
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.JSON,
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "filterKeys",
            label: "filterKeys",
            tsType: "TFilterKeys | undefined",
            runtimeType: ["String","Array"],
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "filterMode",
            label: "filterMode",
            tsType: "\"every\" | \"some\" | \"union\" | \"intersection\" | undefined",
            runtimeType: null,
            required: false,
            hasFactoryDefault: false,
            options: ["every","some","union","intersection"],
            control: CONTROL_KIND.SELECT,
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "noFilter",
            label: "noFilter",
            tsType: "boolean | undefined",
            runtimeType: "Boolean",
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.SWITCH,
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "prevIcon",
            label: "prevIcon",
            tsType: "TIcon | undefined",
            runtimeType: null,
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "nextIcon",
            label: "nextIcon",
            tsType: "TIcon | undefined",
            runtimeType: null,
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "firstIcon",
            label: "firstIcon",
            tsType: "TIcon | undefined",
            runtimeType: null,
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "lastIcon",
            label: "lastIcon",
            tsType: "TIcon | undefined",
            runtimeType: null,
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "itemsPerPageText",
            label: "itemsPerPageText",
            tsType: "string | undefined",
            runtimeType: "String",
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "pageText",
            label: "pageText",
            tsType: "string | undefined",
            runtimeType: "String",
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "firstPageLabel",
            label: "firstPageLabel",
            tsType: "string | undefined",
            runtimeType: "String",
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "prevPageLabel",
            label: "prevPageLabel",
            tsType: "string | undefined",
            runtimeType: "String",
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "nextPageLabel",
            label: "nextPageLabel",
            tsType: "string | undefined",
            runtimeType: "String",
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "lastPageLabel",
            label: "lastPageLabel",
            tsType: "string | undefined",
            runtimeType: "String",
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "itemsPerPageOptions",
            label: "itemsPerPageOptions",
            tsType: "(number | { title: string; value: number; })[] | undefined",
            runtimeType: "Array",
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.JSON,
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "showCurrentPage",
            label: "showCurrentPage",
            tsType: "boolean | undefined",
            runtimeType: "Boolean",
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.SWITCH,
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "align",
            label: "align",
            tsType: "\"center\" | \"start\" | \"end\" | \"baseline\" | \"stretch\" | undefined",
            runtimeType: null,
            required: false,
            hasFactoryDefault: false,
            options: ["center","start","end","baseline","stretch"],
            control: CONTROL_KIND.SELECT,
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "alignSm",
            label: "alignSm",
            tsType: "\"center\" | \"start\" | \"end\" | \"baseline\" | \"stretch\" | undefined",
            runtimeType: null,
            required: false,
            hasFactoryDefault: false,
            options: ["center","start","end","baseline","stretch"],
            control: CONTROL_KIND.SELECT,
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "alignMd",
            label: "alignMd",
            tsType: "\"center\" | \"start\" | \"end\" | \"baseline\" | \"stretch\" | undefined",
            runtimeType: null,
            required: false,
            hasFactoryDefault: false,
            options: ["center","start","end","baseline","stretch"],
            control: CONTROL_KIND.SELECT,
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "alignLg",
            label: "alignLg",
            tsType: "\"center\" | \"start\" | \"end\" | \"baseline\" | \"stretch\" | undefined",
            runtimeType: null,
            required: false,
            hasFactoryDefault: false,
            options: ["center","start","end","baseline","stretch"],
            control: CONTROL_KIND.SELECT,
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "alignXl",
            label: "alignXl",
            tsType: "\"center\" | \"start\" | \"end\" | \"baseline\" | \"stretch\" | undefined",
            runtimeType: null,
            required: false,
            hasFactoryDefault: false,
            options: ["center","start","end","baseline","stretch"],
            control: CONTROL_KIND.SELECT,
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "alignXxl",
            label: "alignXxl",
            tsType: "\"center\" | \"start\" | \"end\" | \"baseline\" | \"stretch\" | undefined",
            runtimeType: null,
            required: false,
            hasFactoryDefault: false,
            options: ["center","start","end","baseline","stretch"],
            control: CONTROL_KIND.SELECT,
            source: METADATA_SOURCE.TYPES
        }
        ],
        events: [
        {
            name: "update:modelValue",
            label: "update:modelValue",
            payloadType: "[event: any]",
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "select",
            label: "select",
            payloadType: "[payload?: { item: IDataTableItem<any>; value: boolean; } | undefined]",
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "expand",
            label: "expand",
            payloadType: "[payload?: { item: IDataTableItem<any>; value: boolean; } | undefined]",
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "update:page",
            label: "update:page",
            payloadType: "[value: number]",
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "update:itemsPerPage",
            label: "update:itemsPerPage",
            payloadType: "[value: number]",
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "update:sortBy",
            label: "update:sortBy",
            payloadType: "[value: IDataTableSortItem[]]",
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "update:options",
            label: "update:options",
            payloadType: "[value: Record<string, unknown>]",
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "update:expanded",
            label: "update:expanded",
            payloadType: "[value: ReadonlySet<unknown>]",
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "update:currentItems",
            label: "update:currentItems",
            payloadType: "[value: IDataTableItem<any>[]]",
            source: METADATA_SOURCE.TYPES
        }
        ],
        slots: [
        {
            name: "top",
            label: "top",
            slotPropsType: "any",
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "default",
            label: "default",
            slotPropsType: "IDataTableSlotProps<any>",
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "colgroup",
            label: "colgroup",
            slotPropsType: "IDataTableSlotProps<any>",
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "header",
            label: "header",
            slotPropsType: "IDataTableHeadersSlotProps",
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "header.mobile",
            label: "header.mobile",
            slotPropsType: "IDataTableHeadersSlotProps",
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "header.loader",
            label: "header.loader",
            slotPropsType: "any",
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "thead",
            label: "thead",
            slotPropsType: "IDataTableSlotProps<any>",
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "prepend",
            label: "prepend",
            slotPropsType: "IDataTableSlotProps<any>",
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "body",
            label: "body",
            slotPropsType: "IDataTableSlotProps<any>",
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "append",
            label: "append",
            slotPropsType: "IDataTableSlotProps<any>",
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "bottom",
            label: "bottom",
            slotPropsType: "any",
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "loading",
            label: "loading",
            slotPropsType: "any",
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "no-data",
            label: "no-data",
            slotPropsType: "any",
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "item",
            label: "item",
            slotPropsType: "IDataTableItemSlot<any>",
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "group-header",
            label: "group-header",
            slotPropsType: "IDataTableGroupHeaderSlot<IDataTableGroup<any>>",
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "expanded-row",
            label: "expanded-row",
            slotPropsType: "IDataTableItemBaseSlot<any>",
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "data-table-group",
            label: "data-table-group",
            slotPropsType: "IDataTableGroupHeaderRowGroupSlot<IDataTableGroup<any>>",
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "data-table-select",
            label: "data-table-select",
            slotPropsType: "IDataTableGroupHeaderRowSelectSlot",
            source: METADATA_SOURCE.TYPES
        }
        ],
        snippets: [],
        requiresParent: false
    },
    {
        name: "OrigamChart",
        tag: "origam-chart",
        family: "Chart",
        label: "Chart",
        category: "Data Visualization",
        props: [
        {
            name: "type",
            label: "type",
            tsType: "\"map\" | \"line\" | \"area\" | \"bar\" | \"column\" | \"pie\" | \"donut\" | \"scatter\" | \"radar\" | \"spline\" | \"stepped-line\" | \"gauge\" | \"pyramid\" | \"funnel\" | \"honeycomb\" | \"treemap\" | \"sankey\" | \"word-cloud\" | \"heatmap\" | \"sunburst\" | \"box-plot\" | \"pictorial\" | \"candlestick\" | \"streamgraph\" | \"variwide\" | \"polar-bar\" | \"bullet\" | \"pareto\" | \"sparkline\" | undefined",
            runtimeType: null,
            required: false,
            defaultValue: "line",
            hasFactoryDefault: false,
            options: ["map","line","area","bar","column","pie","donut","scatter","radar","spline","stepped-line","gauge","pyramid","funnel","honeycomb","treemap","sankey","word-cloud","heatmap","sunburst","box-plot","pictorial","candlestick","streamgraph","variwide","polar-bar","bullet","pareto","sparkline"],
            control: CONTROL_KIND.SELECT,
            description: "Visualisation primitive. Default `'line'`.",
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "series",
            label: "series",
            tsType: "IChartSeries[]",
            runtimeType: "Array",
            required: true,
            hasFactoryDefault: false,
            control: CONTROL_KIND.JSON,
            description: "Data series — one or more. Empty array renders the `#empty` slot.",
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "categories",
            label: "categories",
            tsType: "string[] | undefined",
            runtimeType: "Array",
            required: false,
            hasFactoryDefault: true,
            control: CONTROL_KIND.JSON,
            description: "X axis labels (for line/area/bar/column/radar). Length should\nmatch the longest series; missing entries fall back to the\nnumeric index.",
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "title",
            label: "title",
            tsType: "string | undefined",
            runtimeType: "String",
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            description: "Optional title rendered above the plotting area.",
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "subtitle",
            label: "subtitle",
            tsType: "string | undefined",
            runtimeType: "String",
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            description: "Optional subtitle rendered below the title.",
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "showLegend",
            label: "showLegend",
            tsType: "boolean | undefined",
            runtimeType: "Boolean",
            required: false,
            defaultValue: true,
            hasFactoryDefault: false,
            control: CONTROL_KIND.SWITCH,
            description: "Toggle the legend block. Default `true`.",
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "legendPosition",
            label: "legendPosition",
            tsType: "TDirectionBoth | undefined",
            runtimeType: null,
            required: false,
            defaultValue: "bottom",
            hasFactoryDefault: false,
            options: ["top","bottom","left","right"],
            control: CONTROL_KIND.SELECT,
            description: "Anchor of the legend block. Default `'bottom'`.",
            source: METADATA_SOURCE.ALIAS
        },
        {
            name: "showTooltip",
            label: "showTooltip",
            tsType: "boolean | undefined",
            runtimeType: "Boolean",
            required: false,
            defaultValue: true,
            hasFactoryDefault: false,
            control: CONTROL_KIND.SWITCH,
            description: "Toggle the hover tooltip. Default `true`.",
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "showGrid",
            label: "showGrid",
            tsType: "boolean | undefined",
            runtimeType: "Boolean",
            required: false,
            defaultValue: true,
            hasFactoryDefault: false,
            control: CONTROL_KIND.SWITCH,
            description: "Render grid lines behind the plot. Ignored for pie/donut/radar.\nDefault `true`.",
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "showAxis",
            label: "showAxis",
            tsType: "boolean | undefined",
            runtimeType: "Boolean",
            required: false,
            defaultValue: true,
            hasFactoryDefault: false,
            control: CONTROL_KIND.SWITCH,
            description: "Render X / Y axes + tick labels. Ignored for pie/donut. Default `true`.",
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "animated",
            label: "animated",
            tsType: "boolean | undefined",
            runtimeType: "Boolean",
            required: false,
            defaultValue: true,
            hasFactoryDefault: false,
            control: CONTROL_KIND.SWITCH,
            description: "Animate paths / bars / slices on first paint and on data\nchanges. Respects `prefers-reduced-motion`. Default `true`.",
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "animationDuration",
            label: "animationDuration",
            tsType: "number | undefined",
            runtimeType: "Number",
            required: false,
            defaultValue: 600,
            hasFactoryDefault: false,
            control: CONTROL_KIND.NUMBER,
            description: "Animation duration in ms. Default `600`.",
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "stacked",
            label: "stacked",
            tsType: "boolean | undefined",
            runtimeType: "Boolean",
            required: false,
            defaultValue: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.SWITCH,
            description: "Stack series on `bar` / `column`. Default `false`.",
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "stacking",
            label: "stacking",
            tsType: "\"normal\" | \"percent\" | undefined",
            runtimeType: null,
            required: false,
            hasFactoryDefault: false,
            options: ["normal","percent"],
            control: CONTROL_KIND.SELECT,
            description: "Stacking mode applied when `stacked=true`.\n\n- `'normal'`  — raw absolute values (default, matches pre-v2\n                `stacked=true` behaviour).\n- `'percent'` — every stack is normalised to 100 %; Y-axis\n                fixed at `0 → 100`, tick labels use `${v}%`.",
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "donutHoleSize",
            label: "donutHoleSize",
            tsType: "number | undefined",
            runtimeType: "Number",
            required: false,
            defaultValue: 0.6,
            hasFactoryDefault: false,
            control: CONTROL_KIND.NUMBER,
            description: "Inner-radius proportion for `donut`. `0` collapses to a pie,\n`1` to a ring of zero thickness. Default `0.6` when\n`type === 'donut'`, ignored otherwise.",
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "colorScheme",
            label: "colorScheme",
            tsType: "string[] | undefined",
            runtimeType: "Array",
            required: false,
            hasFactoryDefault: true,
            control: CONTROL_KIND.JSON,
            description: "Palette used when a series does not pin its own `color`.\nPass intent strings (cycled in order) or raw CSS colours.\nDefault cycles through the 8 origam intents.\n\n⛔ #426 — has **no effect** when `type` resolves to `'bullet'`,\n`'candlestick'`, `'heatmap'`, or `'map'` (delegated to\n`OrigamChartBullet` / `OrigamChartCandlestick` /\n`OrigamChartHeatmap` / `OrigamChartMap` — see their own\n`colorScheme` JSDoc in `chart-base.interface.ts`).",
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "xAxisFormat",
            label: "xAxisFormat",
            tsType: "((value: string | number) => string) | undefined",
            runtimeType: "Function",
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            description: "Formatter applied to X-axis tick labels.",
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "yAxisFormat",
            label: "yAxisFormat",
            tsType: "((value: number) => string) | undefined",
            runtimeType: "Function",
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            description: "Formatter applied to Y-axis tick labels.",
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "aspectRatio",
            label: "aspectRatio",
            tsType: "string | undefined",
            runtimeType: "String",
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            description: "CSS `aspect-ratio` shortcut (`'16/9'`, `'4/3'`, `'1/1'`…). When\nset, overrides `height` and lets the chart breathe with the\ncontainer width.",
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "smoothing",
            label: "smoothing",
            tsType: "\"none\" | \"curve\" | \"monotone\" | undefined",
            runtimeType: null,
            required: false,
            defaultValue: "none",
            hasFactoryDefault: false,
            options: ["none","curve","monotone"],
            control: CONTROL_KIND.SELECT,
            description: "Smoothing strategy for line/area. Default `'none'` —\nCartesian segments between points. `'curve'` uses cubic\nBezier with Catmull-Rom tangents.",
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "yMin",
            label: "yMin",
            tsType: "number | undefined",
            runtimeType: "Number",
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.NUMBER,
            description: "Override the auto-computed Y min. Useful when the data\nstarts well above zero and you want the visual baseline.",
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "yMax",
            label: "yMax",
            tsType: "number | undefined",
            runtimeType: "Number",
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.NUMBER,
            description: "Override the auto-computed Y max.",
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "gaugeMin",
            label: "gaugeMin",
            tsType: "number | undefined",
            runtimeType: "Number",
            required: false,
            defaultValue: 0,
            hasFactoryDefault: false,
            control: CONTROL_KIND.NUMBER,
            description: "Lower bound of the gauge range. Ignored unless `type='gauge'`.\nDefault `0`.",
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "gaugeMax",
            label: "gaugeMax",
            tsType: "number | undefined",
            runtimeType: "Number",
            required: false,
            defaultValue: 100,
            hasFactoryDefault: false,
            control: CONTROL_KIND.NUMBER,
            description: "Upper bound of the gauge range. Ignored unless `type='gauge'`.\nDefault `100`.",
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "gaugeUnit",
            label: "gaugeUnit",
            tsType: "string | undefined",
            runtimeType: "String",
            required: false,
            defaultValue: "",
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            description: "Optional unit appended to the gauge centre label\n(e.g. `'%'`, `' km/h'`). Ignored unless `type='gauge'`.",
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "plotBands",
            label: "plotBands",
            tsType: "IChartPlotBand[] | undefined",
            runtimeType: "Array",
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.JSON,
            description: "Coloured rectangular zones drawn behind (or above) the chart\ndata. Forwarded to `<OrigamChartCartesian>` only — ignored for\npolar / radar / gauge families.",
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "plotLines",
            label: "plotLines",
            tsType: "IChartPlotLine[] | undefined",
            runtimeType: "Array",
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.JSON,
            description: "Threshold lines drawn at a fixed axis value. Forwarded to\n`<OrigamChartCartesian>` only — ignored for polar / radar / gauge.",
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "annotations",
            label: "annotations",
            tsType: "IChartAnnotation[] | undefined",
            runtimeType: "Array",
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.JSON,
            description: "Overlay annotations drawn on top of the series layer. Forwarded to\n`<OrigamChartCartesian>` only — ignored for polar / radar / gauge /\nother non-cartesian families. Annotations are positioned in data\ncoordinates. Four kinds: `'arrow'`, `'label'`, `'circle'`, `'bracket'`.",
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "drilldown",
            label: "drilldown",
            tsType: "IChartDrilldownProps | undefined",
            runtimeType: "Object",
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.JSON,
            description: "Drilldown configuration forwarded to `<OrigamChartCartesian>` and\n`<OrigamChartPolar>`. Ignored by other families (radar, gauge, …).",
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "secondaryYAxis",
            label: "secondaryYAxis",
            tsType: "IChartSecondaryYAxis | undefined",
            runtimeType: "Object",
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.JSON,
            description: "Secondary (right-hand) Y axis configuration. Forwarded to\n`<OrigamChartCartesian>` only — ignored for other families.\nWhen absent the engine ignores `series.yAxis === 1` assignments.",
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "id",
            label: "id",
            tsType: "string | undefined",
            runtimeType: "String",
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "class",
            label: "class",
            tsType: null,
            runtimeType: ["String","Array","Object"],
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.RUNTIME
        },
        {
            name: "style",
            label: "style",
            tsType: null,
            runtimeType: ["String","Array","Object","Boolean"],
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.RUNTIME
        },
        {
            name: "height",
            label: "height",
            tsType: "string | number | undefined",
            runtimeType: ["Number","String"],
            required: false,
            defaultValue: 300,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "maxHeight",
            label: "maxHeight",
            tsType: "string | number | undefined",
            runtimeType: ["Number","String"],
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "maxWidth",
            label: "maxWidth",
            tsType: "string | number | undefined",
            runtimeType: ["Number","String"],
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "minHeight",
            label: "minHeight",
            tsType: "string | number | undefined",
            runtimeType: ["Number","String"],
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "minWidth",
            label: "minWidth",
            tsType: "string | number | undefined",
            runtimeType: ["Number","String"],
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "width",
            label: "width",
            tsType: "string | number | undefined",
            runtimeType: ["Number","String"],
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "margin",
            label: "margin",
            tsType: "string | number | boolean | undefined",
            runtimeType: ["Boolean","Number","String"],
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            description: "Global shorthand. `16` → `16px`; `\"4\"` → the `--origam-space---4`\ndesign rung; `\"8px 16px\"` → block / inline; `true` → the legacy\n`--marged` class.",
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "marginTop",
            label: "marginTop",
            tsType: "string | number | boolean | undefined",
            runtimeType: ["Boolean","Number","String"],
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            description: "Overrides `margin` and `marginBlock` for the top edge.",
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "marginLeft",
            label: "marginLeft",
            tsType: "string | number | boolean | undefined",
            runtimeType: ["Boolean","Number","String"],
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            description: "Overrides `margin` and `marginInline` for the left edge.",
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "marginBottom",
            label: "marginBottom",
            tsType: "string | number | boolean | undefined",
            runtimeType: ["Boolean","Number","String"],
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            description: "Overrides `margin` and `marginBlock` for the bottom edge.",
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "marginRight",
            label: "marginRight",
            tsType: "string | number | boolean | undefined",
            runtimeType: ["Boolean","Number","String"],
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            description: "Overrides `margin` and `marginInline` for the right edge.",
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "marginBlock",
            label: "marginBlock",
            tsType: "string | number | boolean | undefined",
            runtimeType: ["Boolean","Number","String"],
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            description: "Top + bottom. Overrides `margin`; beaten by `marginTop` / `marginBottom`.",
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "marginInline",
            label: "marginInline",
            tsType: "string | number | boolean | undefined",
            runtimeType: ["Boolean","Number","String"],
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            description: "Left + right. Overrides `margin`; beaten by `marginLeft` / `marginRight`.",
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "marginInlineStart",
            label: "marginInlineStart",
            tsType: "string | number | boolean | undefined",
            runtimeType: ["Boolean","Number","String"],
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            description: "*******************************************************\nLogical per-side margin — rung 3 (issue #1013)",
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "marginInlineEnd",
            label: "marginInlineEnd",
            tsType: "string | number | boolean | undefined",
            runtimeType: ["Boolean","Number","String"],
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "marginBlockStart",
            label: "marginBlockStart",
            tsType: "string | number | boolean | undefined",
            runtimeType: ["Boolean","Number","String"],
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "marginBlockEnd",
            label: "marginBlockEnd",
            tsType: "string | number | boolean | undefined",
            runtimeType: ["Boolean","Number","String"],
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "padding",
            label: "padding",
            tsType: "string | number | boolean | undefined",
            runtimeType: ["Boolean","Number","String"],
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            description: "Global shorthand. `16` → `16px`; `\"4\"` → the `--origam-space---4`\ndesign rung; `\"8px 16px\"` → block / inline; `true` → the legacy\n`--padded` class.",
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "paddingTop",
            label: "paddingTop",
            tsType: "string | number | boolean | undefined",
            runtimeType: ["Boolean","Number","String"],
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            description: "Overrides `padding` and `paddingBlock` for the top edge.",
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "paddingLeft",
            label: "paddingLeft",
            tsType: "string | number | boolean | undefined",
            runtimeType: ["Boolean","Number","String"],
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            description: "Overrides `padding` and `paddingInline` for the left edge.",
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "paddingBottom",
            label: "paddingBottom",
            tsType: "string | number | boolean | undefined",
            runtimeType: ["Boolean","Number","String"],
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            description: "Overrides `padding` and `paddingBlock` for the bottom edge.",
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "paddingRight",
            label: "paddingRight",
            tsType: "string | number | boolean | undefined",
            runtimeType: ["Boolean","Number","String"],
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            description: "Overrides `padding` and `paddingInline` for the right edge.",
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "paddingBlock",
            label: "paddingBlock",
            tsType: "string | number | boolean | undefined",
            runtimeType: ["Boolean","Number","String"],
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            description: "Top + bottom. Overrides `padding`; beaten by `paddingTop` / `paddingBottom`.",
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "paddingInline",
            label: "paddingInline",
            tsType: "string | number | boolean | undefined",
            runtimeType: ["Boolean","Number","String"],
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            description: "Left + right. Overrides `padding`; beaten by `paddingLeft` / `paddingRight`.",
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "paddingInlineStart",
            label: "paddingInlineStart",
            tsType: "string | number | boolean | undefined",
            runtimeType: ["Boolean","Number","String"],
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            description: "*******************************************************\nLogical per-side padding — rung 3 (issue #1013)",
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "paddingInlineEnd",
            label: "paddingInlineEnd",
            tsType: "string | number | boolean | undefined",
            runtimeType: ["Boolean","Number","String"],
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "paddingBlockStart",
            label: "paddingBlockStart",
            tsType: "string | number | boolean | undefined",
            runtimeType: ["Boolean","Number","String"],
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "paddingBlockEnd",
            label: "paddingBlockEnd",
            tsType: "string | number | boolean | undefined",
            runtimeType: ["Boolean","Number","String"],
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "rounded",
            label: "rounded",
            tsType: "string | number | boolean | null | undefined",
            runtimeType: ["Boolean","Number","String"],
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            description: "Corner-radius selector. Three modes:\n - **named variant** (`'small' | 'default' | 'large' | …`,\n   cf. `ROUNDED` enum) → emits `--rounded-{name}` class so the\n   component's SCSS can pick the right token rung.\n - **boolean `true`** (or empty string `''`) → emits the legacy\n   `--rounded` class for components that only have a single rounded\n   state (e.g. `OrigamBtn` defaulting to `radius.2xl`).\n - **CSS value** (`'4px'`, `'4px 0 4px 0'`, `100`) → emits inline\n   `border-radius` declarations via `useRounded.roundedStyles`.",
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "roundedTopRight",
            label: "roundedTopRight",
            tsType: "string | number | boolean | undefined",
            runtimeType: ["Boolean","Number","String"],
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            description: "Top-right corner only. Takes the same vocabulary as `rounded`\n(`8`, `'8px'`, `'md'`, `'large'`, `'var(…)'`), minus `shaped` /\n`shaped-invert` which are asymmetric by definition.",
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "roundedTopLeft",
            label: "roundedTopLeft",
            tsType: "string | number | boolean | undefined",
            runtimeType: ["Boolean","Number","String"],
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            description: "Top-left corner only. Same vocabulary as `roundedTopRight`.",
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "roundedBottomLeft",
            label: "roundedBottomLeft",
            tsType: "string | number | boolean | undefined",
            runtimeType: ["Boolean","Number","String"],
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            description: "Bottom-left corner only. Same vocabulary as `roundedTopRight`.",
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "roundedBottomRight",
            label: "roundedBottomRight",
            tsType: "string | number | boolean | undefined",
            runtimeType: ["Boolean","Number","String"],
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            description: "Bottom-right corner only. Same vocabulary as `roundedTopRight`.",
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "roundedStartStart",
            label: "roundedStartStart",
            tsType: "string | number | boolean | undefined",
            runtimeType: ["Boolean","Number","String"],
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            description: "*******************************************************\nLogical per-corner radius — rung 2 (issue #1013)",
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "roundedStartEnd",
            label: "roundedStartEnd",
            tsType: "string | number | boolean | undefined",
            runtimeType: ["Boolean","Number","String"],
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "roundedEndStart",
            label: "roundedEndStart",
            tsType: "string | number | boolean | undefined",
            runtimeType: ["Boolean","Number","String"],
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "roundedEndEnd",
            label: "roundedEndEnd",
            tsType: "string | number | boolean | undefined",
            runtimeType: ["Boolean","Number","String"],
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "elevation",
            label: "elevation",
            tsType: "TElevation | undefined",
            runtimeType: ["Number","String"],
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "bgColor",
            label: "bgColor",
            tsType: "TColor",
            runtimeType: ["String","Object","Boolean"],
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.TYPES
        }
        ],
        events: [
        {
            name: "point-click",
            label: "point-click",
            payloadType: "[point: IChartPoint, originalEvent: MouseEvent | KeyboardEvent]",
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "legend-click",
            label: "legend-click",
            payloadType: "[series: IChartSeries, index: number]",
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "series-toggle",
            label: "series-toggle",
            payloadType: "[series: IChartSeries, visible: boolean]",
            source: METADATA_SOURCE.TYPES
        }
        ],
        slots: [

        ],
        snippets: [],
        requiresParent: false
    },
    {
        name: "OrigamTabs",
        tag: "origam-tabs",
        family: "Tabs",
        label: "Tabs",
        category: "Navigation",
        props: [
        {
            name: "tag",
            label: "tag",
            tsType: "string | undefined",
            runtimeType: "String",
            required: false,
            defaultValue: "div",
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "variant",
            label: "variant",
            tsType: "\"default\" | \"pills\" | \"underline\" | undefined",
            runtimeType: null,
            required: false,
            defaultValue: "default",
            hasFactoryDefault: false,
            options: ["default","pills","underline"],
            control: CONTROL_KIND.SELECT,
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "fixed",
            label: "fixed",
            tsType: "boolean | undefined",
            runtimeType: "Boolean",
            required: false,
            defaultValue: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.SWITCH,
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "centered",
            label: "centered",
            tsType: "boolean | undefined",
            runtimeType: "Boolean",
            required: false,
            defaultValue: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.SWITCH,
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "id",
            label: "id",
            tsType: "string | undefined",
            runtimeType: "String",
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "class",
            label: "class",
            tsType: null,
            runtimeType: ["String","Array","Object"],
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.RUNTIME
        },
        {
            name: "style",
            label: "style",
            tsType: null,
            runtimeType: ["String","Array","Object","Boolean"],
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.RUNTIME
        },
        {
            name: "direction",
            label: "direction",
            tsType: "\"horizontal\" | \"vertical\" | undefined",
            runtimeType: null,
            required: false,
            defaultValue: "horizontal",
            hasFactoryDefault: false,
            options: ["horizontal","vertical"],
            control: CONTROL_KIND.SELECT,
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "density",
            label: "density",
            tsType: "\"default\" | \"compact\" | \"comfortable\" | undefined",
            runtimeType: null,
            required: false,
            defaultValue: "default",
            hasFactoryDefault: false,
            options: ["default","compact","comfortable"],
            control: CONTROL_KIND.SELECT,
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "rounded",
            label: "rounded",
            tsType: "string | number | boolean | null | undefined",
            runtimeType: ["Boolean","Number","String"],
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            description: "Corner-radius selector. Three modes:\n - **named variant** (`'small' | 'default' | 'large' | …`,\n   cf. `ROUNDED` enum) → emits `--rounded-{name}` class so the\n   component's SCSS can pick the right token rung.\n - **boolean `true`** (or empty string `''`) → emits the legacy\n   `--rounded` class for components that only have a single rounded\n   state (e.g. `OrigamBtn` defaulting to `radius.2xl`).\n - **CSS value** (`'4px'`, `'4px 0 4px 0'`, `100`) → emits inline\n   `border-radius` declarations via `useRounded.roundedStyles`.",
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "roundedTopRight",
            label: "roundedTopRight",
            tsType: "string | number | boolean | undefined",
            runtimeType: ["Boolean","Number","String"],
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            description: "Top-right corner only. Takes the same vocabulary as `rounded`\n(`8`, `'8px'`, `'md'`, `'large'`, `'var(…)'`), minus `shaped` /\n`shaped-invert` which are asymmetric by definition.",
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "roundedTopLeft",
            label: "roundedTopLeft",
            tsType: "string | number | boolean | undefined",
            runtimeType: ["Boolean","Number","String"],
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            description: "Top-left corner only. Same vocabulary as `roundedTopRight`.",
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "roundedBottomLeft",
            label: "roundedBottomLeft",
            tsType: "string | number | boolean | undefined",
            runtimeType: ["Boolean","Number","String"],
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            description: "Bottom-left corner only. Same vocabulary as `roundedTopRight`.",
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "roundedBottomRight",
            label: "roundedBottomRight",
            tsType: "string | number | boolean | undefined",
            runtimeType: ["Boolean","Number","String"],
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            description: "Bottom-right corner only. Same vocabulary as `roundedTopRight`.",
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "roundedStartStart",
            label: "roundedStartStart",
            tsType: "string | number | boolean | undefined",
            runtimeType: ["Boolean","Number","String"],
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            description: "*******************************************************\nLogical per-corner radius — rung 2 (issue #1013)",
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "roundedStartEnd",
            label: "roundedStartEnd",
            tsType: "string | number | boolean | undefined",
            runtimeType: ["Boolean","Number","String"],
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "roundedEndStart",
            label: "roundedEndStart",
            tsType: "string | number | boolean | undefined",
            runtimeType: ["Boolean","Number","String"],
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "roundedEndEnd",
            label: "roundedEndEnd",
            tsType: "string | number | boolean | undefined",
            runtimeType: ["Boolean","Number","String"],
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "color",
            label: "color",
            tsType: "TColor",
            runtimeType: ["String","Object","Boolean"],
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "bgColor",
            label: "bgColor",
            tsType: "TColor",
            runtimeType: ["String","Object","Boolean"],
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "disabled",
            label: "disabled",
            tsType: "boolean | undefined",
            runtimeType: "Boolean",
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.SWITCH,
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "modelValue",
            label: "modelValue",
            tsType: "any",
            runtimeType: null,
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "multiple",
            label: "multiple",
            tsType: "boolean | undefined",
            runtimeType: "Boolean",
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.SWITCH,
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "mandatory",
            label: "mandatory",
            tsType: "boolean | undefined",
            runtimeType: "Boolean",
            required: false,
            defaultValue: true,
            hasFactoryDefault: false,
            control: CONTROL_KIND.SWITCH,
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "max",
            label: "max",
            tsType: "number | undefined",
            runtimeType: "Number",
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.NUMBER,
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "selectedClass",
            label: "selectedClass",
            tsType: "string | undefined",
            runtimeType: "String",
            required: false,
            defaultValue: "origam-tab--active",
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.TYPES
        }
        ],
        events: [
        {
            name: "update:modelValue",
            label: "update:modelValue",
            payloadType: "[event: any]",
            source: METADATA_SOURCE.TYPES
        }
        ],
        slots: [
        {
            name: "default",
            label: "default",
            slotPropsType: "ITabsSlotProps",
            source: METADATA_SOURCE.TYPES
        }
        ],
        snippets: [],
        requiresParent: false
    },
    {
        name: "OrigamTab",
        tag: "origam-tab",
        family: "Tabs",
        label: "Tab",
        category: "Navigation",
        props: [
        {
            name: "tag",
            label: "tag",
            tsType: "string | undefined",
            runtimeType: "String",
            required: false,
            defaultValue: "button",
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "text",
            label: "text",
            tsType: "string | undefined",
            runtimeType: "String",
            required: false,
            defaultValue: "",
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            description: "Text label — used when the `default` slot is not provided.",
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "variant",
            label: "variant",
            tsType: "\"default\" | \"pills\" | \"underline\" | undefined",
            runtimeType: null,
            required: false,
            hasFactoryDefault: false,
            options: ["default","pills","underline"],
            control: CONTROL_KIND.SELECT,
            description: "Visual treatment, mirrored down from the parent `<OrigamTabs>` (`default`, `pills`, `underline`).",
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "icon",
            label: "icon",
            tsType: "TIcon | undefined",
            runtimeType: null,
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "id",
            label: "id",
            tsType: "string | undefined",
            runtimeType: "String",
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "class",
            label: "class",
            tsType: null,
            runtimeType: ["String","Array","Object"],
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.RUNTIME
        },
        {
            name: "style",
            label: "style",
            tsType: null,
            runtimeType: ["String","Array","Object","Boolean"],
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.RUNTIME
        },
        {
            name: "value",
            label: "value",
            tsType: "any",
            runtimeType: null,
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "disabled",
            label: "disabled",
            tsType: "boolean | undefined",
            runtimeType: "Boolean",
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.SWITCH,
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "selectedClass",
            label: "selectedClass",
            tsType: "string | undefined",
            runtimeType: "String",
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "fontSize",
            label: "fontSize",
            tsType: "\"xs\" | \"sm\" | \"md\" | \"lg\" | \"xl\" | \"2xl\" | \"3xl\" | \"4xl\" | \"5xl\" | undefined",
            runtimeType: null,
            required: false,
            hasFactoryDefault: false,
            options: ["xs","sm","md","lg","xl","2xl","3xl","4xl","5xl"],
            control: CONTROL_KIND.SELECT,
            description: "Font size token. Maps to `--origam-font__size---{fontSize}`\n(xs · sm · md · lg · xl · 2xl · 3xl · 4xl · 5xl).\nWhen unset, the component keeps its theme / density font-size.",
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "fontWeight",
            label: "fontWeight",
            tsType: "\"regular\" | \"medium\" | \"semibold\" | \"bold\" | \"extrabold\" | \"black\" | undefined",
            runtimeType: null,
            required: false,
            hasFactoryDefault: false,
            options: ["regular","medium","semibold","bold","extrabold","black"],
            control: CONTROL_KIND.SELECT,
            description: "Font weight token. Maps to `--origam-font__weight---{fontWeight}`\n(regular 400 · medium 500 · semibold 600 · bold 700 · extrabold 800 · black 900).\nWhen unset, the component keeps its theme font-weight.",
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "letterSpacing",
            label: "letterSpacing",
            tsType: "\"tight\" | \"normal\" | \"wide\" | \"wider\" | \"widest\" | undefined",
            runtimeType: null,
            required: false,
            hasFactoryDefault: false,
            options: ["tight","normal","wide","wider","widest"],
            control: CONTROL_KIND.SELECT,
            description: "Letter-spacing token. Maps to `--origam-font__letterSpacing---{letterSpacing}`\n(tight -0.025em · normal 0em · wide 0.0094em · wider 0.0125em · widest 0.0893em).\nWhen unset, the component keeps its theme letter-spacing.",
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "appendAvatar",
            label: "appendAvatar",
            tsType: "string | undefined",
            runtimeType: "String",
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "appendIcon",
            label: "appendIcon",
            tsType: "TIcon | undefined",
            runtimeType: null,
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "prependAvatar",
            label: "prependAvatar",
            tsType: "string | undefined",
            runtimeType: "String",
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "prependIcon",
            label: "prependIcon",
            tsType: "TIcon | undefined",
            runtimeType: null,
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "prependAriaLabel",
            label: "prependAriaLabel",
            tsType: "string | undefined",
            runtimeType: "String",
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "appendAriaLabel",
            label: "appendAriaLabel",
            tsType: "string | undefined",
            runtimeType: "String",
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.TYPES
        }
        ],
        events: [
        {
            name: "group:selected",
            label: "group:selected",
            payloadType: "[value: { value: boolean; }]",
            source: METADATA_SOURCE.TYPES
        }
        ],
        slots: [
        {
            name: "default",
            label: "default",
            slotPropsType: "ITabSlotProps",
            source: METADATA_SOURCE.TYPES
        }
        ],
        snippets: [],
        requiresParent: false
    },
    {
        name: "OrigamWindow",
        tag: "origam-window",
        family: "Window",
        label: "Window",
        category: "Navigation",
        props: [
        {
            name: "continuous",
            label: "continuous",
            tsType: "boolean | undefined",
            runtimeType: "Boolean",
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.SWITCH,
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "nextIcon",
            label: "nextIcon",
            tsType: "TIcon | undefined",
            runtimeType: null,
            required: false,
            defaultValue: "mdi:mdi-chevron-right",
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "prevIcon",
            label: "prevIcon",
            tsType: "TIcon | undefined",
            runtimeType: null,
            required: false,
            defaultValue: "mdi:mdi-chevron-left",
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "reverse",
            label: "reverse",
            tsType: "boolean | undefined",
            runtimeType: "Boolean",
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.SWITCH,
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "showArrows",
            label: "showArrows",
            tsType: "string | boolean | undefined",
            runtimeType: ["String","Boolean"],
            required: false,
            defaultValue: true,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "touch",
            label: "touch",
            tsType: "boolean | ITouchHandlers | undefined",
            runtimeType: ["Boolean","Object"],
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "modelValue",
            label: "modelValue",
            tsType: "any",
            runtimeType: null,
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "disabled",
            label: "disabled",
            tsType: "boolean | undefined",
            runtimeType: "Boolean",
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.SWITCH,
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "selectedClass",
            label: "selectedClass",
            tsType: "string | undefined",
            runtimeType: "String",
            required: false,
            defaultValue: "origam-window-item--active",
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "mandatory",
            label: "mandatory",
            tsType: "boolean | undefined",
            runtimeType: "Boolean",
            required: false,
            defaultValue: true,
            hasFactoryDefault: false,
            control: CONTROL_KIND.SWITCH,
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "id",
            label: "id",
            tsType: "string | undefined",
            runtimeType: "String",
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "class",
            label: "class",
            tsType: null,
            runtimeType: ["String","Array","Object"],
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.RUNTIME
        },
        {
            name: "style",
            label: "style",
            tsType: null,
            runtimeType: ["String","Array","Object","Boolean"],
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.RUNTIME
        },
        {
            name: "tag",
            label: "tag",
            tsType: "string | undefined",
            runtimeType: "String",
            required: false,
            defaultValue: "div",
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "direction",
            label: "direction",
            tsType: "\"horizontal\" | \"vertical\" | undefined",
            runtimeType: null,
            required: false,
            defaultValue: "horizontal",
            hasFactoryDefault: false,
            options: ["horizontal","vertical"],
            control: CONTROL_KIND.SELECT,
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "border",
            label: "border",
            tsType: "string | number | boolean | TDirectionBoth[] | undefined",
            runtimeType: ["Boolean","Number","String","Array"],
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "borderTop",
            label: "borderTop",
            tsType: "string | number | boolean | undefined",
            runtimeType: ["Boolean","Number","String"],
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "borderLeft",
            label: "borderLeft",
            tsType: "string | number | boolean | undefined",
            runtimeType: ["Boolean","Number","String"],
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "borderBottom",
            label: "borderBottom",
            tsType: "string | number | boolean | undefined",
            runtimeType: ["Boolean","Number","String"],
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "borderRight",
            label: "borderRight",
            tsType: "string | number | boolean | undefined",
            runtimeType: ["Boolean","Number","String"],
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "borderBlock",
            label: "borderBlock",
            tsType: "string | number | boolean | undefined",
            runtimeType: ["Boolean","Number","String"],
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            description: "Logical-axis shorthand for the block-start + block-end edges (top +\nbottom in the default horizontal-tb writing mode). Resolves to the\nnative CSS `border-block-{width,style,color}` properties — same\nvalue grammar as `borderTop` / `borderRight` / `borderBottom` /\n`borderLeft` (boolean opt-in, bare width number, or a free-form\n`\"width style color\"` string). Precedence: beats the global `border`\nshorthand for the edges it targets, but a physical `borderTop` /\n`borderBottom` still wins over it for that specific edge — see\n`useBorder` JSDoc for the full precedence table.",
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "borderInline",
            label: "borderInline",
            tsType: "string | number | boolean | undefined",
            runtimeType: ["Boolean","Number","String"],
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            description: "Logical-axis shorthand for the inline-start + inline-end edges (left\n+ right in LTR). Same grammar and precedence rules as `borderBlock`,\nmapped onto `border-inline-{width,style,color}`.",
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "borderInlineStart",
            label: "borderInlineStart",
            tsType: "string | number | boolean | undefined",
            runtimeType: ["Boolean","Number","String"],
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            description: "*******************************************************\nborderInlineStart",
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "borderInlineEnd",
            label: "borderInlineEnd",
            tsType: "string | number | boolean | undefined",
            runtimeType: ["Boolean","Number","String"],
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            description: "*******************************************************\nborderInlineEnd",
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "borderBlockStart",
            label: "borderBlockStart",
            tsType: "string | number | boolean | undefined",
            runtimeType: ["Boolean","Number","String"],
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            description: "*******************************************************\nborderBlockStart",
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "borderBlockEnd",
            label: "borderBlockEnd",
            tsType: "string | number | boolean | undefined",
            runtimeType: ["Boolean","Number","String"],
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            description: "*******************************************************\nborderBlockEnd",
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "borderColor",
            label: "borderColor",
            tsType: "string | undefined",
            runtimeType: "String",
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "borderStyle",
            label: "borderStyle",
            tsType: "string | undefined",
            runtimeType: "String",
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "borderTopColor",
            label: "borderTopColor",
            tsType: "TColor",
            runtimeType: ["String","Object","Boolean"],
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            description: "Per-side color override (issue #215). Additive: absent by default,\nno behaviour change for existing consumers.\n\nPrecedence (specific > global): `borderTopColor` wins over any\ncolor implied by `borderTop` (e.g. `borderTop=\"2px dashed red\"`),\nwhich itself wins over the global `borderColor` / `border` shorthand\nfor the top side. See `useBorder` JSDoc for the full precedence\ntable.\n\nAccepts a {@link TColor} (semantic intent, raw CSS color, or falsy\nto opt out) — same input family as `color` / `bgColor`. Gradients\nare NOT supported on border colors (CSS `border-color` has no\ngradient form) and are silently ignored.",
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "borderRightColor",
            label: "borderRightColor",
            tsType: "TColor",
            runtimeType: ["String","Object","Boolean"],
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "borderBottomColor",
            label: "borderBottomColor",
            tsType: "TColor",
            runtimeType: ["String","Object","Boolean"],
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "borderLeftColor",
            label: "borderLeftColor",
            tsType: "TColor",
            runtimeType: ["String","Object","Boolean"],
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "borderInlineStartColor",
            label: "borderInlineStartColor",
            tsType: "TColor",
            runtimeType: ["String","Object","Boolean"],
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            description: "*******************************************************\nborderInlineStartColor",
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "borderInlineEndColor",
            label: "borderInlineEndColor",
            tsType: "TColor",
            runtimeType: ["String","Object","Boolean"],
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            description: "*******************************************************\nborderInlineEndColor",
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "borderBlockStartColor",
            label: "borderBlockStartColor",
            tsType: "TColor",
            runtimeType: ["String","Object","Boolean"],
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            description: "*******************************************************\nborderBlockStartColor",
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "borderBlockEndColor",
            label: "borderBlockEndColor",
            tsType: "TColor",
            runtimeType: ["String","Object","Boolean"],
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            description: "*******************************************************\nborderBlockEndColor",
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "padding",
            label: "padding",
            tsType: "string | number | boolean | undefined",
            runtimeType: ["Boolean","Number","String"],
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            description: "Global shorthand. `16` → `16px`; `\"4\"` → the `--origam-space---4`\ndesign rung; `\"8px 16px\"` → block / inline; `true` → the legacy\n`--padded` class.",
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "paddingTop",
            label: "paddingTop",
            tsType: "string | number | boolean | undefined",
            runtimeType: ["Boolean","Number","String"],
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            description: "Overrides `padding` and `paddingBlock` for the top edge.",
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "paddingLeft",
            label: "paddingLeft",
            tsType: "string | number | boolean | undefined",
            runtimeType: ["Boolean","Number","String"],
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            description: "Overrides `padding` and `paddingInline` for the left edge.",
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "paddingBottom",
            label: "paddingBottom",
            tsType: "string | number | boolean | undefined",
            runtimeType: ["Boolean","Number","String"],
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            description: "Overrides `padding` and `paddingBlock` for the bottom edge.",
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "paddingRight",
            label: "paddingRight",
            tsType: "string | number | boolean | undefined",
            runtimeType: ["Boolean","Number","String"],
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            description: "Overrides `padding` and `paddingInline` for the right edge.",
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "paddingBlock",
            label: "paddingBlock",
            tsType: "string | number | boolean | undefined",
            runtimeType: ["Boolean","Number","String"],
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            description: "Top + bottom. Overrides `padding`; beaten by `paddingTop` / `paddingBottom`.",
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "paddingInline",
            label: "paddingInline",
            tsType: "string | number | boolean | undefined",
            runtimeType: ["Boolean","Number","String"],
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            description: "Left + right. Overrides `padding`; beaten by `paddingLeft` / `paddingRight`.",
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "paddingInlineStart",
            label: "paddingInlineStart",
            tsType: "string | number | boolean | undefined",
            runtimeType: ["Boolean","Number","String"],
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            description: "*******************************************************\nLogical per-side padding — rung 3 (issue #1013)",
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "paddingInlineEnd",
            label: "paddingInlineEnd",
            tsType: "string | number | boolean | undefined",
            runtimeType: ["Boolean","Number","String"],
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "paddingBlockStart",
            label: "paddingBlockStart",
            tsType: "string | number | boolean | undefined",
            runtimeType: ["Boolean","Number","String"],
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "paddingBlockEnd",
            label: "paddingBlockEnd",
            tsType: "string | number | boolean | undefined",
            runtimeType: ["Boolean","Number","String"],
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "margin",
            label: "margin",
            tsType: "string | number | boolean | undefined",
            runtimeType: ["Boolean","Number","String"],
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            description: "Global shorthand. `16` → `16px`; `\"4\"` → the `--origam-space---4`\ndesign rung; `\"8px 16px\"` → block / inline; `true` → the legacy\n`--marged` class.",
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "marginTop",
            label: "marginTop",
            tsType: "string | number | boolean | undefined",
            runtimeType: ["Boolean","Number","String"],
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            description: "Overrides `margin` and `marginBlock` for the top edge.",
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "marginLeft",
            label: "marginLeft",
            tsType: "string | number | boolean | undefined",
            runtimeType: ["Boolean","Number","String"],
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            description: "Overrides `margin` and `marginInline` for the left edge.",
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "marginBottom",
            label: "marginBottom",
            tsType: "string | number | boolean | undefined",
            runtimeType: ["Boolean","Number","String"],
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            description: "Overrides `margin` and `marginBlock` for the bottom edge.",
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "marginRight",
            label: "marginRight",
            tsType: "string | number | boolean | undefined",
            runtimeType: ["Boolean","Number","String"],
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            description: "Overrides `margin` and `marginInline` for the right edge.",
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "marginBlock",
            label: "marginBlock",
            tsType: "string | number | boolean | undefined",
            runtimeType: ["Boolean","Number","String"],
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            description: "Top + bottom. Overrides `margin`; beaten by `marginTop` / `marginBottom`.",
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "marginInline",
            label: "marginInline",
            tsType: "string | number | boolean | undefined",
            runtimeType: ["Boolean","Number","String"],
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            description: "Left + right. Overrides `margin`; beaten by `marginLeft` / `marginRight`.",
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "marginInlineStart",
            label: "marginInlineStart",
            tsType: "string | number | boolean | undefined",
            runtimeType: ["Boolean","Number","String"],
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            description: "*******************************************************\nLogical per-side margin — rung 3 (issue #1013)",
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "marginInlineEnd",
            label: "marginInlineEnd",
            tsType: "string | number | boolean | undefined",
            runtimeType: ["Boolean","Number","String"],
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "marginBlockStart",
            label: "marginBlockStart",
            tsType: "string | number | boolean | undefined",
            runtimeType: ["Boolean","Number","String"],
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "marginBlockEnd",
            label: "marginBlockEnd",
            tsType: "string | number | boolean | undefined",
            runtimeType: ["Boolean","Number","String"],
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "rounded",
            label: "rounded",
            tsType: "string | number | boolean | null | undefined",
            runtimeType: ["Boolean","Number","String"],
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            description: "Corner-radius selector. Three modes:\n - **named variant** (`'small' | 'default' | 'large' | …`,\n   cf. `ROUNDED` enum) → emits `--rounded-{name}` class so the\n   component's SCSS can pick the right token rung.\n - **boolean `true`** (or empty string `''`) → emits the legacy\n   `--rounded` class for components that only have a single rounded\n   state (e.g. `OrigamBtn` defaulting to `radius.2xl`).\n - **CSS value** (`'4px'`, `'4px 0 4px 0'`, `100`) → emits inline\n   `border-radius` declarations via `useRounded.roundedStyles`.",
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "roundedTopRight",
            label: "roundedTopRight",
            tsType: "string | number | boolean | undefined",
            runtimeType: ["Boolean","Number","String"],
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            description: "Top-right corner only. Takes the same vocabulary as `rounded`\n(`8`, `'8px'`, `'md'`, `'large'`, `'var(…)'`), minus `shaped` /\n`shaped-invert` which are asymmetric by definition.",
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "roundedTopLeft",
            label: "roundedTopLeft",
            tsType: "string | number | boolean | undefined",
            runtimeType: ["Boolean","Number","String"],
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            description: "Top-left corner only. Same vocabulary as `roundedTopRight`.",
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "roundedBottomLeft",
            label: "roundedBottomLeft",
            tsType: "string | number | boolean | undefined",
            runtimeType: ["Boolean","Number","String"],
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            description: "Bottom-left corner only. Same vocabulary as `roundedTopRight`.",
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "roundedBottomRight",
            label: "roundedBottomRight",
            tsType: "string | number | boolean | undefined",
            runtimeType: ["Boolean","Number","String"],
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            description: "Bottom-right corner only. Same vocabulary as `roundedTopRight`.",
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "roundedStartStart",
            label: "roundedStartStart",
            tsType: "string | number | boolean | undefined",
            runtimeType: ["Boolean","Number","String"],
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            description: "*******************************************************\nLogical per-corner radius — rung 2 (issue #1013)",
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "roundedStartEnd",
            label: "roundedStartEnd",
            tsType: "string | number | boolean | undefined",
            runtimeType: ["Boolean","Number","String"],
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "roundedEndStart",
            label: "roundedEndStart",
            tsType: "string | number | boolean | undefined",
            runtimeType: ["Boolean","Number","String"],
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "roundedEndEnd",
            label: "roundedEndEnd",
            tsType: "string | number | boolean | undefined",
            runtimeType: ["Boolean","Number","String"],
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "elevation",
            label: "elevation",
            tsType: "TElevation | undefined",
            runtimeType: ["Number","String"],
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "bgColor",
            label: "bgColor",
            tsType: "TColor",
            runtimeType: ["String","Object","Boolean"],
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "hover",
            label: "hover",
            tsType: "boolean | IStateEffectConfig | undefined",
            runtimeType: ["Boolean","Object"],
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "hoverClass",
            label: "hoverClass",
            tsType: "string | undefined",
            runtimeType: "String",
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "active",
            label: "active",
            tsType: "boolean | IStateEffectConfig | undefined",
            runtimeType: ["Boolean","Object"],
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "activeClass",
            label: "activeClass",
            tsType: "string | undefined",
            runtimeType: "String",
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.TYPES
        }
        ],
        events: [
        {
            name: "update:modelValue",
            label: "update:modelValue",
            payloadType: "[event: any]",
            source: METADATA_SOURCE.TYPES
        }
        ],
        slots: [
        {
            name: "default",
            label: "default",
            slotPropsType: "IGroupProvide",
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "arrows",
            label: "arrows",
            slotPropsType: "{ prevProps: IWindowNavBtnProps; nextProps: IWindowNavBtnProps; canMoveBack: boolean; canMoveForward: boolean; }",
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "prev",
            label: "prev",
            slotPropsType: "{ props: IWindowNavBtnProps; canMove: boolean; }",
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "next",
            label: "next",
            slotPropsType: "{ props: IWindowNavBtnProps; canMove: boolean; }",
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "additional",
            label: "additional",
            slotPropsType: "IGroupProvide",
            source: METADATA_SOURCE.TYPES
        }
        ],
        snippets: [],
        requiresParent: false
    },
    {
        name: "OrigamWindowItem",
        tag: "origam-window-item",
        family: "Window",
        label: "WindowItem",
        category: "Layout & Structure",
        props: [
        {
            name: "transition",
            label: "transition",
            tsType: "string | boolean | undefined",
            runtimeType: ["Boolean","String"],
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "reverseTransition",
            label: "reverseTransition",
            tsType: "string | boolean | undefined",
            runtimeType: ["Boolean","String"],
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "id",
            label: "id",
            tsType: "string | undefined",
            runtimeType: "String",
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "class",
            label: "class",
            tsType: null,
            runtimeType: ["String","Array","Object"],
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.RUNTIME
        },
        {
            name: "style",
            label: "style",
            tsType: null,
            runtimeType: ["String","Array","Object","Boolean"],
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.RUNTIME
        },
        {
            name: "eager",
            label: "eager",
            tsType: "boolean | undefined",
            runtimeType: "Boolean",
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.SWITCH,
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "value",
            label: "value",
            tsType: "any",
            runtimeType: null,
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "disabled",
            label: "disabled",
            tsType: "boolean | undefined",
            runtimeType: "Boolean",
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.SWITCH,
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "selectedClass",
            label: "selectedClass",
            tsType: "string | undefined",
            runtimeType: "String",
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.TYPES
        }
        ],
        events: [
        {
            name: "group:selected",
            label: "group:selected",
            payloadType: "[value: { value: boolean; }]",
            source: METADATA_SOURCE.TYPES
        }
        ],
        slots: [
        {
            name: "default",
            label: "default",
            slotPropsType: "any",
            source: METADATA_SOURCE.TYPES
        }
        ],
        snippets: [],
        requiresParent: false
    },
    {
        name: "OrigamList",
        tag: "origam-list",
        family: "List",
        label: "List",
        category: "Data Display",
        props: [
        {
            name: "activeClass",
            label: "activeClass",
            tsType: "string | undefined",
            runtimeType: "String",
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "disabled",
            label: "disabled",
            tsType: "boolean | undefined",
            runtimeType: "Boolean",
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.SWITCH,
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "expandIcon",
            label: "expandIcon",
            tsType: "string | undefined",
            runtimeType: "String",
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "collapseIcon",
            label: "collapseIcon",
            tsType: "string | undefined",
            runtimeType: "String",
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "lines",
            label: "lines",
            tsType: "\"one\" | \"two\" | \"three\" | undefined",
            runtimeType: null,
            required: false,
            defaultValue: "one",
            hasFactoryDefault: false,
            options: ["one","two","three"],
            control: CONTROL_KIND.SELECT,
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "slim",
            label: "slim",
            tsType: "boolean | undefined",
            runtimeType: "Boolean",
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.SWITCH,
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "nav",
            label: "nav",
            tsType: "boolean | undefined",
            runtimeType: "Boolean",
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.SWITCH,
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "itemType",
            label: "itemType",
            tsType: "string | undefined",
            runtimeType: "String",
            required: false,
            defaultValue: "type",
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "tag",
            label: "tag",
            tsType: "string | undefined",
            runtimeType: "String",
            required: false,
            defaultValue: "div",
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "id",
            label: "id",
            tsType: "string | undefined",
            runtimeType: "String",
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "class",
            label: "class",
            tsType: null,
            runtimeType: ["String","Array","Object"],
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.RUNTIME
        },
        {
            name: "style",
            label: "style",
            tsType: null,
            runtimeType: ["String","Array","Object","Boolean"],
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.RUNTIME
        },
        {
            name: "elevation",
            label: "elevation",
            tsType: "TElevation | undefined",
            runtimeType: ["Number","String"],
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "border",
            label: "border",
            tsType: "string | number | boolean | TDirectionBoth[] | undefined",
            runtimeType: ["Boolean","Number","String","Array"],
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "borderTop",
            label: "borderTop",
            tsType: "string | number | boolean | undefined",
            runtimeType: ["Boolean","Number","String"],
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "borderLeft",
            label: "borderLeft",
            tsType: "string | number | boolean | undefined",
            runtimeType: ["Boolean","Number","String"],
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "borderBottom",
            label: "borderBottom",
            tsType: "string | number | boolean | undefined",
            runtimeType: ["Boolean","Number","String"],
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "borderRight",
            label: "borderRight",
            tsType: "string | number | boolean | undefined",
            runtimeType: ["Boolean","Number","String"],
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "borderBlock",
            label: "borderBlock",
            tsType: "string | number | boolean | undefined",
            runtimeType: ["Boolean","Number","String"],
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            description: "Logical-axis shorthand for the block-start + block-end edges (top +\nbottom in the default horizontal-tb writing mode). Resolves to the\nnative CSS `border-block-{width,style,color}` properties — same\nvalue grammar as `borderTop` / `borderRight` / `borderBottom` /\n`borderLeft` (boolean opt-in, bare width number, or a free-form\n`\"width style color\"` string). Precedence: beats the global `border`\nshorthand for the edges it targets, but a physical `borderTop` /\n`borderBottom` still wins over it for that specific edge — see\n`useBorder` JSDoc for the full precedence table.",
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "borderInline",
            label: "borderInline",
            tsType: "string | number | boolean | undefined",
            runtimeType: ["Boolean","Number","String"],
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            description: "Logical-axis shorthand for the inline-start + inline-end edges (left\n+ right in LTR). Same grammar and precedence rules as `borderBlock`,\nmapped onto `border-inline-{width,style,color}`.",
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "borderInlineStart",
            label: "borderInlineStart",
            tsType: "string | number | boolean | undefined",
            runtimeType: ["Boolean","Number","String"],
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            description: "*******************************************************\nborderInlineStart",
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "borderInlineEnd",
            label: "borderInlineEnd",
            tsType: "string | number | boolean | undefined",
            runtimeType: ["Boolean","Number","String"],
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            description: "*******************************************************\nborderInlineEnd",
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "borderBlockStart",
            label: "borderBlockStart",
            tsType: "string | number | boolean | undefined",
            runtimeType: ["Boolean","Number","String"],
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            description: "*******************************************************\nborderBlockStart",
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "borderBlockEnd",
            label: "borderBlockEnd",
            tsType: "string | number | boolean | undefined",
            runtimeType: ["Boolean","Number","String"],
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            description: "*******************************************************\nborderBlockEnd",
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "borderColor",
            label: "borderColor",
            tsType: "string | undefined",
            runtimeType: "String",
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "borderStyle",
            label: "borderStyle",
            tsType: "string | undefined",
            runtimeType: "String",
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "borderTopColor",
            label: "borderTopColor",
            tsType: "TColor",
            runtimeType: ["String","Object","Boolean"],
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            description: "Per-side color override (issue #215). Additive: absent by default,\nno behaviour change for existing consumers.\n\nPrecedence (specific > global): `borderTopColor` wins over any\ncolor implied by `borderTop` (e.g. `borderTop=\"2px dashed red\"`),\nwhich itself wins over the global `borderColor` / `border` shorthand\nfor the top side. See `useBorder` JSDoc for the full precedence\ntable.\n\nAccepts a {@link TColor} (semantic intent, raw CSS color, or falsy\nto opt out) — same input family as `color` / `bgColor`. Gradients\nare NOT supported on border colors (CSS `border-color` has no\ngradient form) and are silently ignored.",
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "borderRightColor",
            label: "borderRightColor",
            tsType: "TColor",
            runtimeType: ["String","Object","Boolean"],
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "borderBottomColor",
            label: "borderBottomColor",
            tsType: "TColor",
            runtimeType: ["String","Object","Boolean"],
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "borderLeftColor",
            label: "borderLeftColor",
            tsType: "TColor",
            runtimeType: ["String","Object","Boolean"],
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "borderInlineStartColor",
            label: "borderInlineStartColor",
            tsType: "TColor",
            runtimeType: ["String","Object","Boolean"],
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            description: "*******************************************************\nborderInlineStartColor",
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "borderInlineEndColor",
            label: "borderInlineEndColor",
            tsType: "TColor",
            runtimeType: ["String","Object","Boolean"],
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            description: "*******************************************************\nborderInlineEndColor",
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "borderBlockStartColor",
            label: "borderBlockStartColor",
            tsType: "TColor",
            runtimeType: ["String","Object","Boolean"],
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            description: "*******************************************************\nborderBlockStartColor",
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "borderBlockEndColor",
            label: "borderBlockEndColor",
            tsType: "TColor",
            runtimeType: ["String","Object","Boolean"],
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            description: "*******************************************************\nborderBlockEndColor",
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "density",
            label: "density",
            tsType: "\"default\" | \"compact\" | \"comfortable\" | undefined",
            runtimeType: null,
            required: false,
            defaultValue: "default",
            hasFactoryDefault: false,
            options: ["default","compact","comfortable"],
            control: CONTROL_KIND.SELECT,
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "size",
            label: "size",
            tsType: "number | \"default\" | \"x-small\" | \"small\" | \"large\" | \"x-large\" | undefined",
            runtimeType: null,
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "rounded",
            label: "rounded",
            tsType: "string | number | boolean | null | undefined",
            runtimeType: ["Boolean","Number","String"],
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            description: "Corner-radius selector. Three modes:\n - **named variant** (`'small' | 'default' | 'large' | …`,\n   cf. `ROUNDED` enum) → emits `--rounded-{name}` class so the\n   component's SCSS can pick the right token rung.\n - **boolean `true`** (or empty string `''`) → emits the legacy\n   `--rounded` class for components that only have a single rounded\n   state (e.g. `OrigamBtn` defaulting to `radius.2xl`).\n - **CSS value** (`'4px'`, `'4px 0 4px 0'`, `100`) → emits inline\n   `border-radius` declarations via `useRounded.roundedStyles`.",
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "roundedTopRight",
            label: "roundedTopRight",
            tsType: "string | number | boolean | undefined",
            runtimeType: ["Boolean","Number","String"],
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            description: "Top-right corner only. Takes the same vocabulary as `rounded`\n(`8`, `'8px'`, `'md'`, `'large'`, `'var(…)'`), minus `shaped` /\n`shaped-invert` which are asymmetric by definition.",
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "roundedTopLeft",
            label: "roundedTopLeft",
            tsType: "string | number | boolean | undefined",
            runtimeType: ["Boolean","Number","String"],
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            description: "Top-left corner only. Same vocabulary as `roundedTopRight`.",
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "roundedBottomLeft",
            label: "roundedBottomLeft",
            tsType: "string | number | boolean | undefined",
            runtimeType: ["Boolean","Number","String"],
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            description: "Bottom-left corner only. Same vocabulary as `roundedTopRight`.",
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "roundedBottomRight",
            label: "roundedBottomRight",
            tsType: "string | number | boolean | undefined",
            runtimeType: ["Boolean","Number","String"],
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            description: "Bottom-right corner only. Same vocabulary as `roundedTopRight`.",
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "roundedStartStart",
            label: "roundedStartStart",
            tsType: "string | number | boolean | undefined",
            runtimeType: ["Boolean","Number","String"],
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            description: "*******************************************************\nLogical per-corner radius — rung 2 (issue #1013)",
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "roundedStartEnd",
            label: "roundedStartEnd",
            tsType: "string | number | boolean | undefined",
            runtimeType: ["Boolean","Number","String"],
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "roundedEndStart",
            label: "roundedEndStart",
            tsType: "string | number | boolean | undefined",
            runtimeType: ["Boolean","Number","String"],
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "roundedEndEnd",
            label: "roundedEndEnd",
            tsType: "string | number | boolean | undefined",
            runtimeType: ["Boolean","Number","String"],
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "height",
            label: "height",
            tsType: "string | number | undefined",
            runtimeType: ["Number","String"],
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "maxHeight",
            label: "maxHeight",
            tsType: "string | number | undefined",
            runtimeType: ["Number","String"],
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "maxWidth",
            label: "maxWidth",
            tsType: "string | number | undefined",
            runtimeType: ["Number","String"],
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "minHeight",
            label: "minHeight",
            tsType: "string | number | undefined",
            runtimeType: ["Number","String"],
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "minWidth",
            label: "minWidth",
            tsType: "string | number | undefined",
            runtimeType: ["Number","String"],
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "width",
            label: "width",
            tsType: "string | number | undefined",
            runtimeType: ["Number","String"],
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "selectStrategy",
            label: "selectStrategy",
            tsType: "\"single-leaf\" | \"leaf\" | \"independent\" | \"single-independent\" | \"classic\" | TSelectStrategyFn | undefined",
            runtimeType: "Function",
            required: false,
            defaultValue: "single-leaf",
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "openStrategy",
            label: "openStrategy",
            tsType: "\"multiple\" | \"list\" | \"single\" | TOpenStrategyFns | undefined",
            runtimeType: null,
            required: false,
            defaultValue: "list",
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "selected",
            label: "selected",
            tsType: "unknown[] | undefined",
            runtimeType: "Array",
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.JSON,
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "opened",
            label: "opened",
            tsType: "unknown[] | undefined",
            runtimeType: "Array",
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.JSON,
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "mandatory",
            label: "mandatory",
            tsType: "boolean | undefined",
            runtimeType: "Boolean",
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.SWITCH,
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "items",
            label: "items",
            tsType: "any[] | undefined",
            runtimeType: "Array",
            required: false,
            hasFactoryDefault: true,
            control: CONTROL_KIND.JSON,
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "itemTitle",
            label: "itemTitle",
            tsType: "TSelectItemKey",
            runtimeType: null,
            required: false,
            defaultValue: "title",
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "itemValue",
            label: "itemValue",
            tsType: "TSelectItemKey",
            runtimeType: null,
            required: false,
            defaultValue: "value",
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "itemChildren",
            label: "itemChildren",
            tsType: "TSelectItemKey",
            runtimeType: null,
            required: false,
            defaultValue: "children",
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "itemProps",
            label: "itemProps",
            tsType: "TSelectItemKey",
            runtimeType: null,
            required: false,
            defaultValue: "props",
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "returnObject",
            label: "returnObject",
            tsType: "boolean | undefined",
            runtimeType: "Boolean",
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.SWITCH,
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "valueComparator",
            label: "valueComparator",
            tsType: "((a: any, b: any) => boolean) | undefined",
            runtimeType: null,
            required: false,
            hasFactoryDefault: true,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "color",
            label: "color",
            tsType: "TColor",
            runtimeType: ["String","Object","Boolean"],
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "bgColor",
            label: "bgColor",
            tsType: "TColor",
            runtimeType: ["String","Object","Boolean"],
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "padding",
            label: "padding",
            tsType: "string | number | boolean | undefined",
            runtimeType: ["Boolean","Number","String"],
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            description: "Global shorthand. `16` → `16px`; `\"4\"` → the `--origam-space---4`\ndesign rung; `\"8px 16px\"` → block / inline; `true` → the legacy\n`--padded` class.",
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "paddingTop",
            label: "paddingTop",
            tsType: "string | number | boolean | undefined",
            runtimeType: ["Boolean","Number","String"],
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            description: "Overrides `padding` and `paddingBlock` for the top edge.",
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "paddingLeft",
            label: "paddingLeft",
            tsType: "string | number | boolean | undefined",
            runtimeType: ["Boolean","Number","String"],
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            description: "Overrides `padding` and `paddingInline` for the left edge.",
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "paddingBottom",
            label: "paddingBottom",
            tsType: "string | number | boolean | undefined",
            runtimeType: ["Boolean","Number","String"],
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            description: "Overrides `padding` and `paddingBlock` for the bottom edge.",
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "paddingRight",
            label: "paddingRight",
            tsType: "string | number | boolean | undefined",
            runtimeType: ["Boolean","Number","String"],
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            description: "Overrides `padding` and `paddingInline` for the right edge.",
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "paddingBlock",
            label: "paddingBlock",
            tsType: "string | number | boolean | undefined",
            runtimeType: ["Boolean","Number","String"],
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            description: "Top + bottom. Overrides `padding`; beaten by `paddingTop` / `paddingBottom`.",
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "paddingInline",
            label: "paddingInline",
            tsType: "string | number | boolean | undefined",
            runtimeType: ["Boolean","Number","String"],
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            description: "Left + right. Overrides `padding`; beaten by `paddingLeft` / `paddingRight`.",
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "paddingInlineStart",
            label: "paddingInlineStart",
            tsType: "string | number | boolean | undefined",
            runtimeType: ["Boolean","Number","String"],
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            description: "*******************************************************\nLogical per-side padding — rung 3 (issue #1013)",
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "paddingInlineEnd",
            label: "paddingInlineEnd",
            tsType: "string | number | boolean | undefined",
            runtimeType: ["Boolean","Number","String"],
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "paddingBlockStart",
            label: "paddingBlockStart",
            tsType: "string | number | boolean | undefined",
            runtimeType: ["Boolean","Number","String"],
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "paddingBlockEnd",
            label: "paddingBlockEnd",
            tsType: "string | number | boolean | undefined",
            runtimeType: ["Boolean","Number","String"],
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "margin",
            label: "margin",
            tsType: "string | number | boolean | undefined",
            runtimeType: ["Boolean","Number","String"],
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            description: "Global shorthand. `16` → `16px`; `\"4\"` → the `--origam-space---4`\ndesign rung; `\"8px 16px\"` → block / inline; `true` → the legacy\n`--marged` class.",
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "marginTop",
            label: "marginTop",
            tsType: "string | number | boolean | undefined",
            runtimeType: ["Boolean","Number","String"],
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            description: "Overrides `margin` and `marginBlock` for the top edge.",
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "marginLeft",
            label: "marginLeft",
            tsType: "string | number | boolean | undefined",
            runtimeType: ["Boolean","Number","String"],
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            description: "Overrides `margin` and `marginInline` for the left edge.",
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "marginBottom",
            label: "marginBottom",
            tsType: "string | number | boolean | undefined",
            runtimeType: ["Boolean","Number","String"],
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            description: "Overrides `margin` and `marginBlock` for the bottom edge.",
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "marginRight",
            label: "marginRight",
            tsType: "string | number | boolean | undefined",
            runtimeType: ["Boolean","Number","String"],
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            description: "Overrides `margin` and `marginInline` for the right edge.",
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "marginBlock",
            label: "marginBlock",
            tsType: "string | number | boolean | undefined",
            runtimeType: ["Boolean","Number","String"],
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            description: "Top + bottom. Overrides `margin`; beaten by `marginTop` / `marginBottom`.",
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "marginInline",
            label: "marginInline",
            tsType: "string | number | boolean | undefined",
            runtimeType: ["Boolean","Number","String"],
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            description: "Left + right. Overrides `margin`; beaten by `marginLeft` / `marginRight`.",
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "marginInlineStart",
            label: "marginInlineStart",
            tsType: "string | number | boolean | undefined",
            runtimeType: ["Boolean","Number","String"],
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            description: "*******************************************************\nLogical per-side margin — rung 3 (issue #1013)",
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "marginInlineEnd",
            label: "marginInlineEnd",
            tsType: "string | number | boolean | undefined",
            runtimeType: ["Boolean","Number","String"],
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "marginBlockStart",
            label: "marginBlockStart",
            tsType: "string | number | boolean | undefined",
            runtimeType: ["Boolean","Number","String"],
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "marginBlockEnd",
            label: "marginBlockEnd",
            tsType: "string | number | boolean | undefined",
            runtimeType: ["Boolean","Number","String"],
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.TYPES
        }
        ],
        events: [
        {
            name: "update:selected",
            label: "update:selected",
            payloadType: "[value: unknown[]]",
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "update:opened",
            label: "update:opened",
            payloadType: "[value: unknown[]]",
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "click:open",
            label: "click:open",
            payloadType: "[value: { id: unknown; value: boolean; path: unknown[]; }]",
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "click:select",
            label: "click:select",
            payloadType: "[value: { id: unknown; value: boolean; path: unknown[]; }]",
            source: METADATA_SOURCE.TYPES
        }
        ],
        slots: [
        {
            name: "default",
            label: "default",
            slotPropsType: "any",
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "childrenItem",
            label: "childrenItem",
            slotPropsType: "{ item: IInternalListItemChildren<any>; index: number; }",
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "divider",
            label: "divider",
            slotPropsType: "{ [key: string]: any; title?: string | undefined; value?: any; } | undefined",
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "subheader",
            label: "subheader",
            slotPropsType: "{ [key: string]: any; title?: string | undefined; value?: any; } | undefined",
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "group",
            label: "group",
            slotPropsType: "{ [key: string]: any; title?: string | undefined; value?: any; } | undefined",
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "groupActivator",
            label: "groupActivator",
            slotPropsType: "IListGroupActivatorSlotProps",
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "item",
            label: "item",
            slotPropsType: "{ [key: string]: any; title?: string | undefined; value?: any; } | undefined",
            source: METADATA_SOURCE.TYPES
        }
        ],
        snippets: [],
        requiresParent: false
    },
    {
        name: "OrigamListItem",
        tag: "origam-list-item",
        family: "List",
        label: "ListItem",
        category: "Data Display",
        props: [
        {
            name: "active",
            label: "active",
            tsType: "boolean | undefined",
            runtimeType: "Boolean",
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.SWITCH,
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "activeClass",
            label: "activeClass",
            tsType: "string | undefined",
            runtimeType: "String",
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "disabled",
            label: "disabled",
            tsType: "boolean | undefined",
            runtimeType: "Boolean",
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.SWITCH,
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "lines",
            label: "lines",
            tsType: "\"one\" | \"two\" | \"three\" | undefined",
            runtimeType: null,
            required: false,
            hasFactoryDefault: false,
            options: ["one","two","three"],
            control: CONTROL_KIND.SELECT,
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "link",
            label: "link",
            tsType: "boolean | undefined",
            runtimeType: "Boolean",
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.SWITCH,
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "nav",
            label: "nav",
            tsType: "boolean | undefined",
            runtimeType: "Boolean",
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.SWITCH,
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "slim",
            label: "slim",
            tsType: "boolean | undefined",
            runtimeType: "Boolean",
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.SWITCH,
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "subtitle",
            label: "subtitle",
            tsType: "string | number | undefined",
            runtimeType: ["String","Number"],
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "title",
            label: "title",
            tsType: "string | number | undefined",
            runtimeType: ["String","Number"],
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "value",
            label: "value",
            tsType: "any",
            runtimeType: null,
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "border",
            label: "border",
            tsType: "string | number | boolean | TDirectionBoth[] | undefined",
            runtimeType: ["Boolean","Number","String","Array"],
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "borderTop",
            label: "borderTop",
            tsType: "string | number | boolean | undefined",
            runtimeType: ["Boolean","Number","String"],
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "borderLeft",
            label: "borderLeft",
            tsType: "string | number | boolean | undefined",
            runtimeType: ["Boolean","Number","String"],
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "borderBottom",
            label: "borderBottom",
            tsType: "string | number | boolean | undefined",
            runtimeType: ["Boolean","Number","String"],
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "borderRight",
            label: "borderRight",
            tsType: "string | number | boolean | undefined",
            runtimeType: ["Boolean","Number","String"],
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "borderBlock",
            label: "borderBlock",
            tsType: "string | number | boolean | undefined",
            runtimeType: ["Boolean","Number","String"],
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            description: "Logical-axis shorthand for the block-start + block-end edges (top +\nbottom in the default horizontal-tb writing mode). Resolves to the\nnative CSS `border-block-{width,style,color}` properties — same\nvalue grammar as `borderTop` / `borderRight` / `borderBottom` /\n`borderLeft` (boolean opt-in, bare width number, or a free-form\n`\"width style color\"` string). Precedence: beats the global `border`\nshorthand for the edges it targets, but a physical `borderTop` /\n`borderBottom` still wins over it for that specific edge — see\n`useBorder` JSDoc for the full precedence table.",
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "borderInline",
            label: "borderInline",
            tsType: "string | number | boolean | undefined",
            runtimeType: ["Boolean","Number","String"],
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            description: "Logical-axis shorthand for the inline-start + inline-end edges (left\n+ right in LTR). Same grammar and precedence rules as `borderBlock`,\nmapped onto `border-inline-{width,style,color}`.",
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "borderInlineStart",
            label: "borderInlineStart",
            tsType: "string | number | boolean | undefined",
            runtimeType: ["Boolean","Number","String"],
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            description: "*******************************************************\nborderInlineStart",
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "borderInlineEnd",
            label: "borderInlineEnd",
            tsType: "string | number | boolean | undefined",
            runtimeType: ["Boolean","Number","String"],
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            description: "*******************************************************\nborderInlineEnd",
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "borderBlockStart",
            label: "borderBlockStart",
            tsType: "string | number | boolean | undefined",
            runtimeType: ["Boolean","Number","String"],
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            description: "*******************************************************\nborderBlockStart",
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "borderBlockEnd",
            label: "borderBlockEnd",
            tsType: "string | number | boolean | undefined",
            runtimeType: ["Boolean","Number","String"],
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            description: "*******************************************************\nborderBlockEnd",
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "borderColor",
            label: "borderColor",
            tsType: "string | undefined",
            runtimeType: "String",
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "borderStyle",
            label: "borderStyle",
            tsType: "string | undefined",
            runtimeType: "String",
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "borderTopColor",
            label: "borderTopColor",
            tsType: "TColor",
            runtimeType: ["String","Object","Boolean"],
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            description: "Per-side color override (issue #215). Additive: absent by default,\nno behaviour change for existing consumers.\n\nPrecedence (specific > global): `borderTopColor` wins over any\ncolor implied by `borderTop` (e.g. `borderTop=\"2px dashed red\"`),\nwhich itself wins over the global `borderColor` / `border` shorthand\nfor the top side. See `useBorder` JSDoc for the full precedence\ntable.\n\nAccepts a {@link TColor} (semantic intent, raw CSS color, or falsy\nto opt out) — same input family as `color` / `bgColor`. Gradients\nare NOT supported on border colors (CSS `border-color` has no\ngradient form) and are silently ignored.",
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "borderRightColor",
            label: "borderRightColor",
            tsType: "TColor",
            runtimeType: ["String","Object","Boolean"],
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "borderBottomColor",
            label: "borderBottomColor",
            tsType: "TColor",
            runtimeType: ["String","Object","Boolean"],
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "borderLeftColor",
            label: "borderLeftColor",
            tsType: "TColor",
            runtimeType: ["String","Object","Boolean"],
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "borderInlineStartColor",
            label: "borderInlineStartColor",
            tsType: "TColor",
            runtimeType: ["String","Object","Boolean"],
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            description: "*******************************************************\nborderInlineStartColor",
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "borderInlineEndColor",
            label: "borderInlineEndColor",
            tsType: "TColor",
            runtimeType: ["String","Object","Boolean"],
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            description: "*******************************************************\nborderInlineEndColor",
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "borderBlockStartColor",
            label: "borderBlockStartColor",
            tsType: "TColor",
            runtimeType: ["String","Object","Boolean"],
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            description: "*******************************************************\nborderBlockStartColor",
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "borderBlockEndColor",
            label: "borderBlockEndColor",
            tsType: "TColor",
            runtimeType: ["String","Object","Boolean"],
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            description: "*******************************************************\nborderBlockEndColor",
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "id",
            label: "id",
            tsType: "string | undefined",
            runtimeType: "String",
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "class",
            label: "class",
            tsType: null,
            runtimeType: ["String","Array","Object"],
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.RUNTIME
        },
        {
            name: "style",
            label: "style",
            tsType: null,
            runtimeType: ["String","Array","Object","Boolean"],
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.RUNTIME
        },
        {
            name: "density",
            label: "density",
            tsType: "\"default\" | \"compact\" | \"comfortable\" | undefined",
            runtimeType: null,
            required: false,
            hasFactoryDefault: false,
            options: ["default","compact","comfortable"],
            control: CONTROL_KIND.SELECT,
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "height",
            label: "height",
            tsType: "string | number | undefined",
            runtimeType: ["Number","String"],
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "maxHeight",
            label: "maxHeight",
            tsType: "string | number | undefined",
            runtimeType: ["Number","String"],
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "maxWidth",
            label: "maxWidth",
            tsType: "string | number | undefined",
            runtimeType: ["Number","String"],
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "minHeight",
            label: "minHeight",
            tsType: "string | number | undefined",
            runtimeType: ["Number","String"],
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "minWidth",
            label: "minWidth",
            tsType: "string | number | undefined",
            runtimeType: ["Number","String"],
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "width",
            label: "width",
            tsType: "string | number | undefined",
            runtimeType: ["Number","String"],
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "elevation",
            label: "elevation",
            tsType: "TElevation | undefined",
            runtimeType: ["Number","String"],
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "rounded",
            label: "rounded",
            tsType: "string | number | boolean | null | undefined",
            runtimeType: ["Boolean","Number","String"],
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            description: "Corner-radius selector. Three modes:\n - **named variant** (`'small' | 'default' | 'large' | …`,\n   cf. `ROUNDED` enum) → emits `--rounded-{name}` class so the\n   component's SCSS can pick the right token rung.\n - **boolean `true`** (or empty string `''`) → emits the legacy\n   `--rounded` class for components that only have a single rounded\n   state (e.g. `OrigamBtn` defaulting to `radius.2xl`).\n - **CSS value** (`'4px'`, `'4px 0 4px 0'`, `100`) → emits inline\n   `border-radius` declarations via `useRounded.roundedStyles`.",
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "roundedTopRight",
            label: "roundedTopRight",
            tsType: "string | number | boolean | undefined",
            runtimeType: ["Boolean","Number","String"],
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            description: "Top-right corner only. Takes the same vocabulary as `rounded`\n(`8`, `'8px'`, `'md'`, `'large'`, `'var(…)'`), minus `shaped` /\n`shaped-invert` which are asymmetric by definition.",
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "roundedTopLeft",
            label: "roundedTopLeft",
            tsType: "string | number | boolean | undefined",
            runtimeType: ["Boolean","Number","String"],
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            description: "Top-left corner only. Same vocabulary as `roundedTopRight`.",
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "roundedBottomLeft",
            label: "roundedBottomLeft",
            tsType: "string | number | boolean | undefined",
            runtimeType: ["Boolean","Number","String"],
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            description: "Bottom-left corner only. Same vocabulary as `roundedTopRight`.",
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "roundedBottomRight",
            label: "roundedBottomRight",
            tsType: "string | number | boolean | undefined",
            runtimeType: ["Boolean","Number","String"],
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            description: "Bottom-right corner only. Same vocabulary as `roundedTopRight`.",
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "roundedStartStart",
            label: "roundedStartStart",
            tsType: "string | number | boolean | undefined",
            runtimeType: ["Boolean","Number","String"],
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            description: "*******************************************************\nLogical per-corner radius — rung 2 (issue #1013)",
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "roundedStartEnd",
            label: "roundedStartEnd",
            tsType: "string | number | boolean | undefined",
            runtimeType: ["Boolean","Number","String"],
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "roundedEndStart",
            label: "roundedEndStart",
            tsType: "string | number | boolean | undefined",
            runtimeType: ["Boolean","Number","String"],
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "roundedEndEnd",
            label: "roundedEndEnd",
            tsType: "string | number | boolean | undefined",
            runtimeType: ["Boolean","Number","String"],
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "size",
            label: "size",
            tsType: "number | \"default\" | \"x-small\" | \"small\" | \"large\" | \"x-large\" | undefined",
            runtimeType: null,
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "tag",
            label: "tag",
            tsType: "string | undefined",
            runtimeType: "String",
            required: false,
            defaultValue: "div",
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "href",
            label: "href",
            tsType: "string | undefined",
            runtimeType: "String",
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "replace",
            label: "replace",
            tsType: "boolean | undefined",
            runtimeType: "Boolean",
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.SWITCH,
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "to",
            label: "to",
            tsType: "string | kt | Tt | undefined",
            runtimeType: null,
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "exact",
            label: "exact",
            tsType: "boolean | undefined",
            runtimeType: "Boolean",
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.SWITCH,
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "color",
            label: "color",
            tsType: "TColor",
            runtimeType: ["String","Object","Boolean"],
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "bgColor",
            label: "bgColor",
            tsType: "TColor",
            runtimeType: ["String","Object","Boolean"],
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "ripple",
            label: "ripple",
            tsType: "boolean | { class: string; } | undefined",
            runtimeType: ["Boolean","Object"],
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "padding",
            label: "padding",
            tsType: "string | number | boolean | undefined",
            runtimeType: ["Boolean","Number","String"],
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            description: "Global shorthand. `16` → `16px`; `\"4\"` → the `--origam-space---4`\ndesign rung; `\"8px 16px\"` → block / inline; `true` → the legacy\n`--padded` class.",
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "paddingTop",
            label: "paddingTop",
            tsType: "string | number | boolean | undefined",
            runtimeType: ["Boolean","Number","String"],
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            description: "Overrides `padding` and `paddingBlock` for the top edge.",
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "paddingLeft",
            label: "paddingLeft",
            tsType: "string | number | boolean | undefined",
            runtimeType: ["Boolean","Number","String"],
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            description: "Overrides `padding` and `paddingInline` for the left edge.",
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "paddingBottom",
            label: "paddingBottom",
            tsType: "string | number | boolean | undefined",
            runtimeType: ["Boolean","Number","String"],
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            description: "Overrides `padding` and `paddingBlock` for the bottom edge.",
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "paddingRight",
            label: "paddingRight",
            tsType: "string | number | boolean | undefined",
            runtimeType: ["Boolean","Number","String"],
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            description: "Overrides `padding` and `paddingInline` for the right edge.",
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "paddingBlock",
            label: "paddingBlock",
            tsType: "string | number | boolean | undefined",
            runtimeType: ["Boolean","Number","String"],
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            description: "Top + bottom. Overrides `padding`; beaten by `paddingTop` / `paddingBottom`.",
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "paddingInline",
            label: "paddingInline",
            tsType: "string | number | boolean | undefined",
            runtimeType: ["Boolean","Number","String"],
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            description: "Left + right. Overrides `padding`; beaten by `paddingLeft` / `paddingRight`.",
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "paddingInlineStart",
            label: "paddingInlineStart",
            tsType: "string | number | boolean | undefined",
            runtimeType: ["Boolean","Number","String"],
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            description: "*******************************************************\nLogical per-side padding — rung 3 (issue #1013)",
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "paddingInlineEnd",
            label: "paddingInlineEnd",
            tsType: "string | number | boolean | undefined",
            runtimeType: ["Boolean","Number","String"],
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "paddingBlockStart",
            label: "paddingBlockStart",
            tsType: "string | number | boolean | undefined",
            runtimeType: ["Boolean","Number","String"],
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "paddingBlockEnd",
            label: "paddingBlockEnd",
            tsType: "string | number | boolean | undefined",
            runtimeType: ["Boolean","Number","String"],
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "margin",
            label: "margin",
            tsType: "string | number | boolean | undefined",
            runtimeType: ["Boolean","Number","String"],
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            description: "Global shorthand. `16` → `16px`; `\"4\"` → the `--origam-space---4`\ndesign rung; `\"8px 16px\"` → block / inline; `true` → the legacy\n`--marged` class.",
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "marginTop",
            label: "marginTop",
            tsType: "string | number | boolean | undefined",
            runtimeType: ["Boolean","Number","String"],
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            description: "Overrides `margin` and `marginBlock` for the top edge.",
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "marginLeft",
            label: "marginLeft",
            tsType: "string | number | boolean | undefined",
            runtimeType: ["Boolean","Number","String"],
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            description: "Overrides `margin` and `marginInline` for the left edge.",
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "marginBottom",
            label: "marginBottom",
            tsType: "string | number | boolean | undefined",
            runtimeType: ["Boolean","Number","String"],
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            description: "Overrides `margin` and `marginBlock` for the bottom edge.",
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "marginRight",
            label: "marginRight",
            tsType: "string | number | boolean | undefined",
            runtimeType: ["Boolean","Number","String"],
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            description: "Overrides `margin` and `marginInline` for the right edge.",
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "marginBlock",
            label: "marginBlock",
            tsType: "string | number | boolean | undefined",
            runtimeType: ["Boolean","Number","String"],
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            description: "Top + bottom. Overrides `margin`; beaten by `marginTop` / `marginBottom`.",
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "marginInline",
            label: "marginInline",
            tsType: "string | number | boolean | undefined",
            runtimeType: ["Boolean","Number","String"],
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            description: "Left + right. Overrides `margin`; beaten by `marginLeft` / `marginRight`.",
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "marginInlineStart",
            label: "marginInlineStart",
            tsType: "string | number | boolean | undefined",
            runtimeType: ["Boolean","Number","String"],
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            description: "*******************************************************\nLogical per-side margin — rung 3 (issue #1013)",
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "marginInlineEnd",
            label: "marginInlineEnd",
            tsType: "string | number | boolean | undefined",
            runtimeType: ["Boolean","Number","String"],
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "marginBlockStart",
            label: "marginBlockStart",
            tsType: "string | number | boolean | undefined",
            runtimeType: ["Boolean","Number","String"],
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "marginBlockEnd",
            label: "marginBlockEnd",
            tsType: "string | number | boolean | undefined",
            runtimeType: ["Boolean","Number","String"],
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "appendAvatar",
            label: "appendAvatar",
            tsType: "string | undefined",
            runtimeType: "String",
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "appendIcon",
            label: "appendIcon",
            tsType: "TIcon | undefined",
            runtimeType: null,
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "prependAvatar",
            label: "prependAvatar",
            tsType: "string | undefined",
            runtimeType: "String",
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "prependIcon",
            label: "prependIcon",
            tsType: "TIcon | undefined",
            runtimeType: null,
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "prependAriaLabel",
            label: "prependAriaLabel",
            tsType: "string | undefined",
            runtimeType: "String",
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "appendAriaLabel",
            label: "appendAriaLabel",
            tsType: "string | undefined",
            runtimeType: "String",
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "hover",
            label: "hover",
            tsType: "boolean | IStateEffectConfig | undefined",
            runtimeType: ["Boolean","Object"],
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "hoverClass",
            label: "hoverClass",
            tsType: "string | undefined",
            runtimeType: "String",
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "fontSize",
            label: "fontSize",
            tsType: "\"xs\" | \"sm\" | \"md\" | \"lg\" | \"xl\" | \"2xl\" | \"3xl\" | \"4xl\" | \"5xl\" | undefined",
            runtimeType: null,
            required: false,
            hasFactoryDefault: false,
            options: ["xs","sm","md","lg","xl","2xl","3xl","4xl","5xl"],
            control: CONTROL_KIND.SELECT,
            description: "Font size token. Maps to `--origam-font__size---{fontSize}`\n(xs · sm · md · lg · xl · 2xl · 3xl · 4xl · 5xl).\nWhen unset, the component keeps its theme / density font-size.",
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "fontWeight",
            label: "fontWeight",
            tsType: "\"regular\" | \"medium\" | \"semibold\" | \"bold\" | \"extrabold\" | \"black\" | undefined",
            runtimeType: null,
            required: false,
            hasFactoryDefault: false,
            options: ["regular","medium","semibold","bold","extrabold","black"],
            control: CONTROL_KIND.SELECT,
            description: "Font weight token. Maps to `--origam-font__weight---{fontWeight}`\n(regular 400 · medium 500 · semibold 600 · bold 700 · extrabold 800 · black 900).\nWhen unset, the component keeps its theme font-weight.",
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "lineHeight",
            label: "lineHeight",
            tsType: "\"none\" | \"tight\" | \"snug\" | \"normal\" | \"relaxed\" | \"loose\" | undefined",
            runtimeType: null,
            required: false,
            hasFactoryDefault: false,
            options: ["none","tight","snug","normal","relaxed","loose"],
            control: CONTROL_KIND.SELECT,
            description: "Line-height token. Maps to `--origam-font__lineHeight---{lineHeight}`\n(none 1 · tight 1.25 · snug 1.375 · normal 1.5 · relaxed 1.625 · loose 2).\nWhen unset, the component keeps its theme line-height.",
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "letterSpacing",
            label: "letterSpacing",
            tsType: "\"tight\" | \"normal\" | \"wide\" | \"wider\" | \"widest\" | undefined",
            runtimeType: null,
            required: false,
            hasFactoryDefault: false,
            options: ["tight","normal","wide","wider","widest"],
            control: CONTROL_KIND.SELECT,
            description: "Letter-spacing token. Maps to `--origam-font__letterSpacing---{letterSpacing}`\n(tight -0.025em · normal 0em · wide 0.0094em · wider 0.0125em · widest 0.0893em).\nWhen unset, the component keeps its theme letter-spacing.",
            source: METADATA_SOURCE.TYPES
        }
        ],
        events: [
        {
            name: "click:append",
            label: "click:append",
            payloadType: "[event: MouseEvent]",
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "click:prepend",
            label: "click:prepend",
            payloadType: "[event: MouseEvent]",
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "click",
            label: "click",
            payloadType: "[event: MouseEvent]",
            source: METADATA_SOURCE.TYPES
        }
        ],
        slots: [
        {
            name: "wrapper",
            label: "wrapper",
            slotPropsType: "any",
            description: "Overrides the whole prepend/content/append layout.",
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "prepend",
            label: "prepend",
            slotPropsType: "TListItemSlot",
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "title",
            label: "title",
            slotPropsType: "{ title?: string | number | undefined; }",
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "subtitle",
            label: "subtitle",
            slotPropsType: "{ subtitle?: string | number | undefined; }",
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "default",
            label: "default",
            slotPropsType: "TListItemSlot",
            source: METADATA_SOURCE.TYPES
        },
        {
            name: "append",
            label: "append",
            slotPropsType: "TListItemSlot",
            source: METADATA_SOURCE.TYPES
        }
        ],
        snippets: [],
        requiresParent: false
    }
]
