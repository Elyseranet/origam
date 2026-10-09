/*
 * GENERATED — pnpm -F @origam/playground meta:host-seed
 *
 * Demo catalogue for the standalone host (src/host/main.ts), built from
 * REAL runtime metadata captured from `origam` @ develop .
 * Source A only (the runtime props descriptor) — no literal union members,
 * no slots (the runtime descriptor cannot see them), no snippets. Prop
 * counts are real: OrigamBtn 106, OrigamSelect 161 (the catalogue's largest
 * prop surface), OrigamSwitch 114, OrigamCard 97, OrigamChip 92, OrigamAlert 93.
 *
 * Do not hand-edit — re-run the generator after `meta:runtime`.
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
            tsType: null,
            runtimeType: "Boolean",
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.RUNTIME
        },
        {
            name: "icon",
            label: "icon",
            tsType: null,
            runtimeType: ["Boolean","String","Array"],
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.RUNTIME
        },
        {
            name: "block",
            label: "block",
            tsType: null,
            runtimeType: "Boolean",
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.RUNTIME
        },
        {
            name: "slim",
            label: "slim",
            tsType: null,
            runtimeType: "Boolean",
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.RUNTIME
        },
        {
            name: "stacked",
            label: "stacked",
            tsType: null,
            runtimeType: "Boolean",
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.RUNTIME
        },
        {
            name: "text",
            label: "text",
            tsType: null,
            runtimeType: "String",
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.RUNTIME
        },
        {
            name: "status",
            label: "status",
            tsType: null,
            runtimeType: null,
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.RUNTIME
        },
        {
            name: "statusIconPosition",
            label: "statusIconPosition",
            tsType: null,
            runtimeType: null,
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.RUNTIME
        },
        {
            name: "id",
            label: "id",
            tsType: null,
            runtimeType: "String",
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.RUNTIME
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
            tsType: null,
            runtimeType: ["String","Object","Boolean"],
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.RUNTIME
        },
        {
            name: "bgColor",
            label: "bgColor",
            tsType: null,
            runtimeType: ["String","Object","Boolean"],
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.RUNTIME
        },
        {
            name: "border",
            label: "border",
            tsType: null,
            runtimeType: ["Boolean","Number","String","Array"],
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.RUNTIME
        },
        {
            name: "borderTop",
            label: "borderTop",
            tsType: null,
            runtimeType: ["Boolean","Number","String"],
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.RUNTIME
        },
        {
            name: "borderLeft",
            label: "borderLeft",
            tsType: null,
            runtimeType: ["Boolean","Number","String"],
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.RUNTIME
        },
        {
            name: "borderBottom",
            label: "borderBottom",
            tsType: null,
            runtimeType: ["Boolean","Number","String"],
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.RUNTIME
        },
        {
            name: "borderRight",
            label: "borderRight",
            tsType: null,
            runtimeType: ["Boolean","Number","String"],
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.RUNTIME
        },
        {
            name: "borderBlock",
            label: "borderBlock",
            tsType: null,
            runtimeType: ["Boolean","Number","String"],
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.RUNTIME
        },
        {
            name: "borderInline",
            label: "borderInline",
            tsType: null,
            runtimeType: ["Boolean","Number","String"],
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.RUNTIME
        },
        {
            name: "borderInlineStart",
            label: "borderInlineStart",
            tsType: null,
            runtimeType: ["Boolean","Number","String"],
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.RUNTIME
        },
        {
            name: "borderInlineEnd",
            label: "borderInlineEnd",
            tsType: null,
            runtimeType: ["Boolean","Number","String"],
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.RUNTIME
        },
        {
            name: "borderBlockStart",
            label: "borderBlockStart",
            tsType: null,
            runtimeType: ["Boolean","Number","String"],
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.RUNTIME
        },
        {
            name: "borderBlockEnd",
            label: "borderBlockEnd",
            tsType: null,
            runtimeType: ["Boolean","Number","String"],
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.RUNTIME
        },
        {
            name: "borderColor",
            label: "borderColor",
            tsType: null,
            runtimeType: "String",
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.RUNTIME
        },
        {
            name: "borderStyle",
            label: "borderStyle",
            tsType: null,
            runtimeType: "String",
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.RUNTIME
        },
        {
            name: "borderTopColor",
            label: "borderTopColor",
            tsType: null,
            runtimeType: ["String","Object","Boolean"],
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.RUNTIME
        },
        {
            name: "borderRightColor",
            label: "borderRightColor",
            tsType: null,
            runtimeType: ["String","Object","Boolean"],
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.RUNTIME
        },
        {
            name: "borderBottomColor",
            label: "borderBottomColor",
            tsType: null,
            runtimeType: ["String","Object","Boolean"],
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.RUNTIME
        },
        {
            name: "borderLeftColor",
            label: "borderLeftColor",
            tsType: null,
            runtimeType: ["String","Object","Boolean"],
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.RUNTIME
        },
        {
            name: "borderInlineStartColor",
            label: "borderInlineStartColor",
            tsType: null,
            runtimeType: ["String","Object","Boolean"],
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.RUNTIME
        },
        {
            name: "borderInlineEndColor",
            label: "borderInlineEndColor",
            tsType: null,
            runtimeType: ["String","Object","Boolean"],
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.RUNTIME
        },
        {
            name: "borderBlockStartColor",
            label: "borderBlockStartColor",
            tsType: null,
            runtimeType: ["String","Object","Boolean"],
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.RUNTIME
        },
        {
            name: "borderBlockEndColor",
            label: "borderBlockEndColor",
            tsType: null,
            runtimeType: ["String","Object","Boolean"],
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.RUNTIME
        },
        {
            name: "density",
            label: "density",
            tsType: null,
            runtimeType: null,
            required: false,
            defaultValue: "default",
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.RUNTIME
        },
        {
            name: "height",
            label: "height",
            tsType: null,
            runtimeType: ["Number","String"],
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.RUNTIME
        },
        {
            name: "maxHeight",
            label: "maxHeight",
            tsType: null,
            runtimeType: ["Number","String"],
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.RUNTIME
        },
        {
            name: "maxWidth",
            label: "maxWidth",
            tsType: null,
            runtimeType: ["Number","String"],
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.RUNTIME
        },
        {
            name: "minHeight",
            label: "minHeight",
            tsType: null,
            runtimeType: ["Number","String"],
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.RUNTIME
        },
        {
            name: "minWidth",
            label: "minWidth",
            tsType: null,
            runtimeType: ["Number","String"],
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.RUNTIME
        },
        {
            name: "width",
            label: "width",
            tsType: null,
            runtimeType: ["Number","String"],
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.RUNTIME
        },
        {
            name: "elevation",
            label: "elevation",
            tsType: null,
            runtimeType: ["Number","String"],
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.RUNTIME
        },
        {
            name: "rounded",
            label: "rounded",
            tsType: null,
            runtimeType: ["Boolean","Number","String"],
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.RUNTIME
        },
        {
            name: "roundedTopRight",
            label: "roundedTopRight",
            tsType: null,
            runtimeType: ["Boolean","Number","String"],
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.RUNTIME
        },
        {
            name: "roundedTopLeft",
            label: "roundedTopLeft",
            tsType: null,
            runtimeType: ["Boolean","Number","String"],
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.RUNTIME
        },
        {
            name: "roundedBottomLeft",
            label: "roundedBottomLeft",
            tsType: null,
            runtimeType: ["Boolean","Number","String"],
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.RUNTIME
        },
        {
            name: "roundedBottomRight",
            label: "roundedBottomRight",
            tsType: null,
            runtimeType: ["Boolean","Number","String"],
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.RUNTIME
        },
        {
            name: "roundedStartStart",
            label: "roundedStartStart",
            tsType: null,
            runtimeType: ["Boolean","Number","String"],
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.RUNTIME
        },
        {
            name: "roundedStartEnd",
            label: "roundedStartEnd",
            tsType: null,
            runtimeType: ["Boolean","Number","String"],
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.RUNTIME
        },
        {
            name: "roundedEndStart",
            label: "roundedEndStart",
            tsType: null,
            runtimeType: ["Boolean","Number","String"],
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.RUNTIME
        },
        {
            name: "roundedEndEnd",
            label: "roundedEndEnd",
            tsType: null,
            runtimeType: ["Boolean","Number","String"],
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.RUNTIME
        },
        {
            name: "tag",
            label: "tag",
            tsType: null,
            runtimeType: "String",
            required: false,
            defaultValue: "button",
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.RUNTIME
        },
        {
            name: "size",
            label: "size",
            tsType: null,
            runtimeType: null,
            required: false,
            defaultValue: "default",
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.RUNTIME
        },
        {
            name: "href",
            label: "href",
            tsType: null,
            runtimeType: "String",
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.RUNTIME
        },
        {
            name: "replace",
            label: "replace",
            tsType: null,
            runtimeType: "Boolean",
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.RUNTIME
        },
        {
            name: "to",
            label: "to",
            tsType: null,
            runtimeType: null,
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.RUNTIME
        },
        {
            name: "exact",
            label: "exact",
            tsType: null,
            runtimeType: "Boolean",
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.RUNTIME
        },
        {
            name: "ripple",
            label: "ripple",
            tsType: null,
            runtimeType: ["Boolean","Object"],
            required: false,
            defaultValue: true,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.RUNTIME
        },
        {
            name: "loading",
            label: "loading",
            tsType: null,
            runtimeType: ["Boolean","Number","Object"],
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.RUNTIME
        },
        {
            name: "loadingText",
            label: "loadingText",
            tsType: null,
            runtimeType: "String",
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.RUNTIME
        },
        {
            name: "position",
            label: "position",
            tsType: null,
            runtimeType: null,
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.RUNTIME
        },
        {
            name: "top",
            label: "top",
            tsType: null,
            runtimeType: ["Number","String"],
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.RUNTIME
        },
        {
            name: "bottom",
            label: "bottom",
            tsType: null,
            runtimeType: ["Number","String"],
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.RUNTIME
        },
        {
            name: "left",
            label: "left",
            tsType: null,
            runtimeType: ["Number","String"],
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.RUNTIME
        },
        {
            name: "right",
            label: "right",
            tsType: null,
            runtimeType: ["Number","String"],
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.RUNTIME
        },
        {
            name: "location",
            label: "location",
            tsType: null,
            runtimeType: null,
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.RUNTIME
        },
        {
            name: "value",
            label: "value",
            tsType: null,
            runtimeType: null,
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.RUNTIME
        },
        {
            name: "disabled",
            label: "disabled",
            tsType: null,
            runtimeType: "Boolean",
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.RUNTIME
        },
        {
            name: "selectedClass",
            label: "selectedClass",
            tsType: null,
            runtimeType: "String",
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.RUNTIME
        },
        {
            name: "padding",
            label: "padding",
            tsType: null,
            runtimeType: ["Boolean","Number","String"],
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.RUNTIME
        },
        {
            name: "paddingTop",
            label: "paddingTop",
            tsType: null,
            runtimeType: ["Boolean","Number","String"],
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.RUNTIME
        },
        {
            name: "paddingLeft",
            label: "paddingLeft",
            tsType: null,
            runtimeType: ["Boolean","Number","String"],
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.RUNTIME
        },
        {
            name: "paddingBottom",
            label: "paddingBottom",
            tsType: null,
            runtimeType: ["Boolean","Number","String"],
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.RUNTIME
        },
        {
            name: "paddingRight",
            label: "paddingRight",
            tsType: null,
            runtimeType: ["Boolean","Number","String"],
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.RUNTIME
        },
        {
            name: "paddingBlock",
            label: "paddingBlock",
            tsType: null,
            runtimeType: ["Boolean","Number","String"],
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.RUNTIME
        },
        {
            name: "paddingInline",
            label: "paddingInline",
            tsType: null,
            runtimeType: ["Boolean","Number","String"],
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.RUNTIME
        },
        {
            name: "paddingInlineStart",
            label: "paddingInlineStart",
            tsType: null,
            runtimeType: ["Boolean","Number","String"],
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.RUNTIME
        },
        {
            name: "paddingInlineEnd",
            label: "paddingInlineEnd",
            tsType: null,
            runtimeType: ["Boolean","Number","String"],
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.RUNTIME
        },
        {
            name: "paddingBlockStart",
            label: "paddingBlockStart",
            tsType: null,
            runtimeType: ["Boolean","Number","String"],
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.RUNTIME
        },
        {
            name: "paddingBlockEnd",
            label: "paddingBlockEnd",
            tsType: null,
            runtimeType: ["Boolean","Number","String"],
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.RUNTIME
        },
        {
            name: "margin",
            label: "margin",
            tsType: null,
            runtimeType: ["Boolean","Number","String"],
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.RUNTIME
        },
        {
            name: "marginTop",
            label: "marginTop",
            tsType: null,
            runtimeType: ["Boolean","Number","String"],
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.RUNTIME
        },
        {
            name: "marginLeft",
            label: "marginLeft",
            tsType: null,
            runtimeType: ["Boolean","Number","String"],
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.RUNTIME
        },
        {
            name: "marginBottom",
            label: "marginBottom",
            tsType: null,
            runtimeType: ["Boolean","Number","String"],
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.RUNTIME
        },
        {
            name: "marginRight",
            label: "marginRight",
            tsType: null,
            runtimeType: ["Boolean","Number","String"],
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.RUNTIME
        },
        {
            name: "marginBlock",
            label: "marginBlock",
            tsType: null,
            runtimeType: ["Boolean","Number","String"],
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.RUNTIME
        },
        {
            name: "marginInline",
            label: "marginInline",
            tsType: null,
            runtimeType: ["Boolean","Number","String"],
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.RUNTIME
        },
        {
            name: "marginInlineStart",
            label: "marginInlineStart",
            tsType: null,
            runtimeType: ["Boolean","Number","String"],
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.RUNTIME
        },
        {
            name: "marginInlineEnd",
            label: "marginInlineEnd",
            tsType: null,
            runtimeType: ["Boolean","Number","String"],
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.RUNTIME
        },
        {
            name: "marginBlockStart",
            label: "marginBlockStart",
            tsType: null,
            runtimeType: ["Boolean","Number","String"],
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.RUNTIME
        },
        {
            name: "marginBlockEnd",
            label: "marginBlockEnd",
            tsType: null,
            runtimeType: ["Boolean","Number","String"],
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.RUNTIME
        },
        {
            name: "appendAvatar",
            label: "appendAvatar",
            tsType: null,
            runtimeType: "String",
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.RUNTIME
        },
        {
            name: "appendIcon",
            label: "appendIcon",
            tsType: null,
            runtimeType: null,
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.RUNTIME
        },
        {
            name: "prependAvatar",
            label: "prependAvatar",
            tsType: null,
            runtimeType: "String",
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.RUNTIME
        },
        {
            name: "prependIcon",
            label: "prependIcon",
            tsType: null,
            runtimeType: null,
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.RUNTIME
        },
        {
            name: "prependAriaLabel",
            label: "prependAriaLabel",
            tsType: null,
            runtimeType: "String",
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.RUNTIME
        },
        {
            name: "appendAriaLabel",
            label: "appendAriaLabel",
            tsType: null,
            runtimeType: "String",
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.RUNTIME
        },
        {
            name: "hover",
            label: "hover",
            tsType: null,
            runtimeType: ["Boolean","Object"],
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.RUNTIME
        },
        {
            name: "hoverClass",
            label: "hoverClass",
            tsType: null,
            runtimeType: "String",
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.RUNTIME
        },
        {
            name: "active",
            label: "active",
            tsType: null,
            runtimeType: ["Boolean","Object"],
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.RUNTIME
        },
        {
            name: "activeClass",
            label: "activeClass",
            tsType: null,
            runtimeType: "String",
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.RUNTIME
        },
        {
            name: "variant",
            label: "variant",
            tsType: null,
            runtimeType: null,
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.RUNTIME
        },
        {
            name: "fontSize",
            label: "fontSize",
            tsType: null,
            runtimeType: null,
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.RUNTIME
        },
        {
            name: "fontWeight",
            label: "fontWeight",
            tsType: null,
            runtimeType: null,
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.RUNTIME
        },
        {
            name: "lineHeight",
            label: "lineHeight",
            tsType: null,
            runtimeType: null,
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.RUNTIME
        },
        {
            name: "letterSpacing",
            label: "letterSpacing",
            tsType: null,
            runtimeType: null,
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.RUNTIME
        }
        ],
        events: [
        {
            name: "group:selected",
            label: "group:selected",
            payloadType: null,
            source: METADATA_SOURCE.RUNTIME
        }
        ],
        slots: [],
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
            tsType: null,
            runtimeType: "Boolean",
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.RUNTIME
        },
        {
            name: "closableChips",
            label: "closableChips",
            tsType: null,
            runtimeType: "Boolean",
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.RUNTIME
        },
        {
            name: "hideNoData",
            label: "hideNoData",
            tsType: null,
            runtimeType: "Boolean",
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.RUNTIME
        },
        {
            name: "hideSelected",
            label: "hideSelected",
            tsType: null,
            runtimeType: "Boolean",
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.RUNTIME
        },
        {
            name: "listProps",
            label: "listProps",
            tsType: null,
            runtimeType: "Object",
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.RUNTIME
        },
        {
            name: "menu",
            label: "menu",
            tsType: null,
            runtimeType: "Boolean",
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.RUNTIME
        },
        {
            name: "menuIcon",
            label: "menuIcon",
            tsType: null,
            runtimeType: null,
            required: false,
            defaultValue: "mdi:mdi-chevron-down",
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.RUNTIME
        },
        {
            name: "menuProps",
            label: "menuProps",
            tsType: null,
            runtimeType: "Object",
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.RUNTIME
        },
        {
            name: "chipProps",
            label: "chipProps",
            tsType: null,
            runtimeType: "Object",
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.RUNTIME
        },
        {
            name: "multiple",
            label: "multiple",
            tsType: null,
            runtimeType: "Boolean",
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.RUNTIME
        },
        {
            name: "noDataText",
            label: "noDataText",
            tsType: null,
            runtimeType: "String",
            required: false,
            defaultValue: "origam.no_data_text",
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.RUNTIME
        },
        {
            name: "openOnClear",
            label: "openOnClear",
            tsType: null,
            runtimeType: "Boolean",
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.RUNTIME
        },
        {
            name: "autocomplete",
            label: "autocomplete",
            tsType: null,
            runtimeType: "Boolean",
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.RUNTIME
        },
        {
            name: "autoSelectFirst",
            label: "autoSelectFirst",
            tsType: null,
            runtimeType: ["Boolean","String"],
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.RUNTIME
        },
        {
            name: "clearOnSelect",
            label: "clearOnSelect",
            tsType: null,
            runtimeType: "Boolean",
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.RUNTIME
        },
        {
            name: "divider",
            label: "divider",
            tsType: null,
            runtimeType: "String",
            required: false,
            defaultValue: ",",
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.RUNTIME
        },
        {
            name: "search",
            label: "search",
            tsType: null,
            runtimeType: "String",
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.RUNTIME
        },
        {
            name: "closeText",
            label: "closeText",
            tsType: null,
            runtimeType: "String",
            required: false,
            defaultValue: "origam.close",
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.RUNTIME
        },
        {
            name: "openText",
            label: "openText",
            tsType: null,
            runtimeType: "String",
            required: false,
            defaultValue: "origam.open",
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.RUNTIME
        },
        {
            name: "id",
            label: "id",
            tsType: null,
            runtimeType: "String",
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.RUNTIME
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
            tsType: null,
            runtimeType: ["String","Object","Boolean"],
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.RUNTIME
        },
        {
            name: "bgColor",
            label: "bgColor",
            tsType: null,
            runtimeType: ["String","Object","Boolean"],
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.RUNTIME
        },
        {
            name: "autofocus",
            label: "autofocus",
            tsType: null,
            runtimeType: "Boolean",
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.RUNTIME
        },
        {
            name: "counter",
            label: "counter",
            tsType: null,
            runtimeType: ["Boolean","Number","String"],
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.RUNTIME
        },
        {
            name: "counterValue",
            label: "counterValue",
            tsType: null,
            runtimeType: ["Number","Function"],
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.RUNTIME
        },
        {
            name: "placeholder",
            label: "placeholder",
            tsType: null,
            runtimeType: "String",
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.RUNTIME
        },
        {
            name: "persistentPlaceholder",
            label: "persistentPlaceholder",
            tsType: null,
            runtimeType: "Boolean",
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.RUNTIME
        },
        {
            name: "persistentCounter",
            label: "persistentCounter",
            tsType: null,
            runtimeType: "Boolean",
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.RUNTIME
        },
        {
            name: "role",
            label: "role",
            tsType: null,
            runtimeType: "String",
            required: false,
            defaultValue: "combobox",
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.RUNTIME
        },
        {
            name: "type",
            label: "type",
            tsType: null,
            runtimeType: null,
            required: false,
            defaultValue: "text",
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.RUNTIME
        },
        {
            name: "modelModifiers",
            label: "modelModifiers",
            tsType: null,
            runtimeType: ["String","Boolean"],
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.RUNTIME
        },
        {
            name: "mask",
            label: "mask",
            tsType: null,
            runtimeType: null,
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.RUNTIME
        },
        {
            name: "density",
            label: "density",
            tsType: null,
            runtimeType: null,
            required: false,
            defaultValue: "default",
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.RUNTIME
        },
        {
            name: "centerAffix",
            label: "centerAffix",
            tsType: null,
            runtimeType: "Boolean",
            required: false,
            defaultValue: true,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.RUNTIME
        },
        {
            name: "dirty",
            label: "dirty",
            tsType: null,
            runtimeType: "Boolean",
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.RUNTIME
        },
        {
            name: "disabled",
            label: "disabled",
            tsType: null,
            runtimeType: "Boolean",
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.RUNTIME
        },
        {
            name: "error",
            label: "error",
            tsType: null,
            runtimeType: ["String","Boolean"],
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.RUNTIME
        },
        {
            name: "inline",
            label: "inline",
            tsType: null,
            runtimeType: "Boolean",
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.RUNTIME
        },
        {
            name: "label",
            label: "label",
            tsType: null,
            runtimeType: "String",
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.RUNTIME
        },
        {
            name: "prefix",
            label: "prefix",
            tsType: null,
            runtimeType: "String",
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.RUNTIME
        },
        {
            name: "suffix",
            label: "suffix",
            tsType: null,
            runtimeType: "String",
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.RUNTIME
        },
        {
            name: "persistentClear",
            label: "persistentClear",
            tsType: null,
            runtimeType: "Boolean",
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.RUNTIME
        },
        {
            name: "singleLine",
            label: "singleLine",
            tsType: null,
            runtimeType: "Boolean",
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.RUNTIME
        },
        {
            name: "required",
            label: "required",
            tsType: null,
            runtimeType: "Boolean",
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.RUNTIME
        },
        {
            name: "loading",
            label: "loading",
            tsType: null,
            runtimeType: ["Boolean","Number","Object"],
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.RUNTIME
        },
        {
            name: "loadingText",
            label: "loadingText",
            tsType: null,
            runtimeType: "String",
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.RUNTIME
        },
        {
            name: "tag",
            label: "tag",
            tsType: null,
            runtimeType: "String",
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.RUNTIME
        },
        {
            name: "appendInnerAvatar",
            label: "appendInnerAvatar",
            tsType: null,
            runtimeType: "String",
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.RUNTIME
        },
        {
            name: "appendInnerIcon",
            label: "appendInnerIcon",
            tsType: null,
            runtimeType: null,
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.RUNTIME
        },
        {
            name: "prependInnerAvatar",
            label: "prependInnerAvatar",
            tsType: null,
            runtimeType: "String",
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.RUNTIME
        },
        {
            name: "prependInnerIcon",
            label: "prependInnerIcon",
            tsType: null,
            runtimeType: null,
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.RUNTIME
        },
        {
            name: "clearIcon",
            label: "clearIcon",
            tsType: null,
            runtimeType: null,
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.RUNTIME
        },
        {
            name: "clearable",
            label: "clearable",
            tsType: null,
            runtimeType: "Boolean",
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.RUNTIME
        },
        {
            name: "prependInnerAriaLabel",
            label: "prependInnerAriaLabel",
            tsType: null,
            runtimeType: "String",
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.RUNTIME
        },
        {
            name: "appendInnerAriaLabel",
            label: "appendInnerAriaLabel",
            tsType: null,
            runtimeType: "String",
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.RUNTIME
        },
        {
            name: "border",
            label: "border",
            tsType: null,
            runtimeType: ["Boolean","Number","String","Array"],
            required: false,
            defaultValue: true,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.RUNTIME
        },
        {
            name: "borderTop",
            label: "borderTop",
            tsType: null,
            runtimeType: ["Boolean","Number","String"],
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.RUNTIME
        },
        {
            name: "borderLeft",
            label: "borderLeft",
            tsType: null,
            runtimeType: ["Boolean","Number","String"],
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.RUNTIME
        },
        {
            name: "borderBottom",
            label: "borderBottom",
            tsType: null,
            runtimeType: ["Boolean","Number","String"],
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.RUNTIME
        },
        {
            name: "borderRight",
            label: "borderRight",
            tsType: null,
            runtimeType: ["Boolean","Number","String"],
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.RUNTIME
        },
        {
            name: "borderBlock",
            label: "borderBlock",
            tsType: null,
            runtimeType: ["Boolean","Number","String"],
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.RUNTIME
        },
        {
            name: "borderInline",
            label: "borderInline",
            tsType: null,
            runtimeType: ["Boolean","Number","String"],
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.RUNTIME
        },
        {
            name: "borderInlineStart",
            label: "borderInlineStart",
            tsType: null,
            runtimeType: ["Boolean","Number","String"],
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.RUNTIME
        },
        {
            name: "borderInlineEnd",
            label: "borderInlineEnd",
            tsType: null,
            runtimeType: ["Boolean","Number","String"],
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.RUNTIME
        },
        {
            name: "borderBlockStart",
            label: "borderBlockStart",
            tsType: null,
            runtimeType: ["Boolean","Number","String"],
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.RUNTIME
        },
        {
            name: "borderBlockEnd",
            label: "borderBlockEnd",
            tsType: null,
            runtimeType: ["Boolean","Number","String"],
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.RUNTIME
        },
        {
            name: "borderColor",
            label: "borderColor",
            tsType: null,
            runtimeType: "String",
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.RUNTIME
        },
        {
            name: "borderStyle",
            label: "borderStyle",
            tsType: null,
            runtimeType: "String",
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.RUNTIME
        },
        {
            name: "borderTopColor",
            label: "borderTopColor",
            tsType: null,
            runtimeType: ["String","Object","Boolean"],
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.RUNTIME
        },
        {
            name: "borderRightColor",
            label: "borderRightColor",
            tsType: null,
            runtimeType: ["String","Object","Boolean"],
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.RUNTIME
        },
        {
            name: "borderBottomColor",
            label: "borderBottomColor",
            tsType: null,
            runtimeType: ["String","Object","Boolean"],
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.RUNTIME
        },
        {
            name: "borderLeftColor",
            label: "borderLeftColor",
            tsType: null,
            runtimeType: ["String","Object","Boolean"],
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.RUNTIME
        },
        {
            name: "borderInlineStartColor",
            label: "borderInlineStartColor",
            tsType: null,
            runtimeType: ["String","Object","Boolean"],
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.RUNTIME
        },
        {
            name: "borderInlineEndColor",
            label: "borderInlineEndColor",
            tsType: null,
            runtimeType: ["String","Object","Boolean"],
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.RUNTIME
        },
        {
            name: "borderBlockStartColor",
            label: "borderBlockStartColor",
            tsType: null,
            runtimeType: ["String","Object","Boolean"],
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.RUNTIME
        },
        {
            name: "borderBlockEndColor",
            label: "borderBlockEndColor",
            tsType: null,
            runtimeType: ["String","Object","Boolean"],
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.RUNTIME
        },
        {
            name: "focused",
            label: "focused",
            tsType: null,
            runtimeType: "Boolean",
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.RUNTIME
        },
        {
            name: "text",
            label: "text",
            tsType: null,
            runtimeType: "String",
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.RUNTIME
        },
        {
            name: "floating",
            label: "floating",
            tsType: null,
            runtimeType: "Boolean",
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.RUNTIME
        },
        {
            name: "name",
            label: "name",
            tsType: null,
            runtimeType: "String",
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.RUNTIME
        },
        {
            name: "margin",
            label: "margin",
            tsType: null,
            runtimeType: ["Boolean","Number","String"],
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.RUNTIME
        },
        {
            name: "marginTop",
            label: "marginTop",
            tsType: null,
            runtimeType: ["Boolean","Number","String"],
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.RUNTIME
        },
        {
            name: "marginLeft",
            label: "marginLeft",
            tsType: null,
            runtimeType: ["Boolean","Number","String"],
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.RUNTIME
        },
        {
            name: "marginBottom",
            label: "marginBottom",
            tsType: null,
            runtimeType: ["Boolean","Number","String"],
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.RUNTIME
        },
        {
            name: "marginRight",
            label: "marginRight",
            tsType: null,
            runtimeType: ["Boolean","Number","String"],
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.RUNTIME
        },
        {
            name: "marginBlock",
            label: "marginBlock",
            tsType: null,
            runtimeType: ["Boolean","Number","String"],
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.RUNTIME
        },
        {
            name: "marginInline",
            label: "marginInline",
            tsType: null,
            runtimeType: ["Boolean","Number","String"],
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.RUNTIME
        },
        {
            name: "marginInlineStart",
            label: "marginInlineStart",
            tsType: null,
            runtimeType: ["Boolean","Number","String"],
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.RUNTIME
        },
        {
            name: "marginInlineEnd",
            label: "marginInlineEnd",
            tsType: null,
            runtimeType: ["Boolean","Number","String"],
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.RUNTIME
        },
        {
            name: "marginBlockStart",
            label: "marginBlockStart",
            tsType: null,
            runtimeType: ["Boolean","Number","String"],
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.RUNTIME
        },
        {
            name: "marginBlockEnd",
            label: "marginBlockEnd",
            tsType: null,
            runtimeType: ["Boolean","Number","String"],
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.RUNTIME
        },
        {
            name: "padding",
            label: "padding",
            tsType: null,
            runtimeType: ["Boolean","Number","String"],
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.RUNTIME
        },
        {
            name: "paddingTop",
            label: "paddingTop",
            tsType: null,
            runtimeType: ["Boolean","Number","String"],
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.RUNTIME
        },
        {
            name: "paddingLeft",
            label: "paddingLeft",
            tsType: null,
            runtimeType: ["Boolean","Number","String"],
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.RUNTIME
        },
        {
            name: "paddingBottom",
            label: "paddingBottom",
            tsType: null,
            runtimeType: ["Boolean","Number","String"],
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.RUNTIME
        },
        {
            name: "paddingRight",
            label: "paddingRight",
            tsType: null,
            runtimeType: ["Boolean","Number","String"],
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.RUNTIME
        },
        {
            name: "paddingBlock",
            label: "paddingBlock",
            tsType: null,
            runtimeType: ["Boolean","Number","String"],
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.RUNTIME
        },
        {
            name: "paddingInline",
            label: "paddingInline",
            tsType: null,
            runtimeType: ["Boolean","Number","String"],
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.RUNTIME
        },
        {
            name: "paddingInlineStart",
            label: "paddingInlineStart",
            tsType: null,
            runtimeType: ["Boolean","Number","String"],
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.RUNTIME
        },
        {
            name: "paddingInlineEnd",
            label: "paddingInlineEnd",
            tsType: null,
            runtimeType: ["Boolean","Number","String"],
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.RUNTIME
        },
        {
            name: "paddingBlockStart",
            label: "paddingBlockStart",
            tsType: null,
            runtimeType: ["Boolean","Number","String"],
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.RUNTIME
        },
        {
            name: "paddingBlockEnd",
            label: "paddingBlockEnd",
            tsType: null,
            runtimeType: ["Boolean","Number","String"],
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.RUNTIME
        },
        {
            name: "rounded",
            label: "rounded",
            tsType: null,
            runtimeType: ["Boolean","Number","String"],
            required: false,
            defaultValue: true,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.RUNTIME
        },
        {
            name: "roundedTopRight",
            label: "roundedTopRight",
            tsType: null,
            runtimeType: ["Boolean","Number","String"],
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.RUNTIME
        },
        {
            name: "roundedTopLeft",
            label: "roundedTopLeft",
            tsType: null,
            runtimeType: ["Boolean","Number","String"],
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.RUNTIME
        },
        {
            name: "roundedBottomLeft",
            label: "roundedBottomLeft",
            tsType: null,
            runtimeType: ["Boolean","Number","String"],
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.RUNTIME
        },
        {
            name: "roundedBottomRight",
            label: "roundedBottomRight",
            tsType: null,
            runtimeType: ["Boolean","Number","String"],
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.RUNTIME
        },
        {
            name: "roundedStartStart",
            label: "roundedStartStart",
            tsType: null,
            runtimeType: ["Boolean","Number","String"],
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.RUNTIME
        },
        {
            name: "roundedStartEnd",
            label: "roundedStartEnd",
            tsType: null,
            runtimeType: ["Boolean","Number","String"],
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.RUNTIME
        },
        {
            name: "roundedEndStart",
            label: "roundedEndStart",
            tsType: null,
            runtimeType: ["Boolean","Number","String"],
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.RUNTIME
        },
        {
            name: "roundedEndEnd",
            label: "roundedEndEnd",
            tsType: null,
            runtimeType: ["Boolean","Number","String"],
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.RUNTIME
        },
        {
            name: "fontSize",
            label: "fontSize",
            tsType: null,
            runtimeType: null,
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.RUNTIME
        },
        {
            name: "fontWeight",
            label: "fontWeight",
            tsType: null,
            runtimeType: null,
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.RUNTIME
        },
        {
            name: "lineHeight",
            label: "lineHeight",
            tsType: null,
            runtimeType: null,
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.RUNTIME
        },
        {
            name: "letterSpacing",
            label: "letterSpacing",
            tsType: null,
            runtimeType: null,
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.RUNTIME
        },
        {
            name: "active",
            label: "active",
            tsType: null,
            runtimeType: ["Boolean","Object"],
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.RUNTIME
        },
        {
            name: "activeClass",
            label: "activeClass",
            tsType: null,
            runtimeType: "String",
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.RUNTIME
        },
        {
            name: "variant",
            label: "variant",
            tsType: null,
            runtimeType: null,
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.RUNTIME
        },
        {
            name: "elevation",
            label: "elevation",
            tsType: null,
            runtimeType: ["Number","String"],
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.RUNTIME
        },
        {
            name: "size",
            label: "size",
            tsType: null,
            runtimeType: null,
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.RUNTIME
        },
        {
            name: "hideDetails",
            label: "hideDetails",
            tsType: null,
            runtimeType: ["Boolean","String"],
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.RUNTIME
        },
        {
            name: "hideSpinButtons",
            label: "hideSpinButtons",
            tsType: null,
            runtimeType: "Boolean",
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.RUNTIME
        },
        {
            name: "hint",
            label: "hint",
            tsType: null,
            runtimeType: "String",
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.RUNTIME
        },
        {
            name: "persistentHint",
            label: "persistentHint",
            tsType: null,
            runtimeType: "Boolean",
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.RUNTIME
        },
        {
            name: "messages",
            label: "messages",
            tsType: null,
            runtimeType: ["Array","String"],
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.RUNTIME
        },
        {
            name: "height",
            label: "height",
            tsType: null,
            runtimeType: ["Number","String"],
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.RUNTIME
        },
        {
            name: "maxHeight",
            label: "maxHeight",
            tsType: null,
            runtimeType: ["Number","String"],
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.RUNTIME
        },
        {
            name: "maxWidth",
            label: "maxWidth",
            tsType: null,
            runtimeType: ["Number","String"],
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.RUNTIME
        },
        {
            name: "minHeight",
            label: "minHeight",
            tsType: null,
            runtimeType: ["Number","String"],
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.RUNTIME
        },
        {
            name: "minWidth",
            label: "minWidth",
            tsType: null,
            runtimeType: ["Number","String"],
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.RUNTIME
        },
        {
            name: "width",
            label: "width",
            tsType: null,
            runtimeType: ["Number","String"],
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.RUNTIME
        },
        {
            name: "direction",
            label: "direction",
            tsType: null,
            runtimeType: null,
            required: false,
            defaultValue: "horizontal",
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.RUNTIME
        },
        {
            name: "errorMessages",
            label: "errorMessages",
            tsType: null,
            runtimeType: ["Array","String"],
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.RUNTIME
        },
        {
            name: "maxErrors",
            label: "maxErrors",
            tsType: null,
            runtimeType: ["Number","String"],
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.RUNTIME
        },
        {
            name: "readonly",
            label: "readonly",
            tsType: null,
            runtimeType: "Boolean",
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.RUNTIME
        },
        {
            name: "rules",
            label: "rules",
            tsType: null,
            runtimeType: "Array",
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.RUNTIME
        },
        {
            name: "modelValue",
            label: "modelValue",
            tsType: null,
            runtimeType: null,
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.RUNTIME
        },
        {
            name: "validateOn",
            label: "validateOn",
            tsType: null,
            runtimeType: null,
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.RUNTIME
        },
        {
            name: "validationValue",
            label: "validationValue",
            tsType: null,
            runtimeType: null,
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.RUNTIME
        },
        {
            name: "appendAvatar",
            label: "appendAvatar",
            tsType: null,
            runtimeType: "String",
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.RUNTIME
        },
        {
            name: "appendIcon",
            label: "appendIcon",
            tsType: null,
            runtimeType: null,
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.RUNTIME
        },
        {
            name: "prependAvatar",
            label: "prependAvatar",
            tsType: null,
            runtimeType: "String",
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.RUNTIME
        },
        {
            name: "prependIcon",
            label: "prependIcon",
            tsType: null,
            runtimeType: null,
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.RUNTIME
        },
        {
            name: "prependAriaLabel",
            label: "prependAriaLabel",
            tsType: null,
            runtimeType: "String",
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.RUNTIME
        },
        {
            name: "appendAriaLabel",
            label: "appendAriaLabel",
            tsType: null,
            runtimeType: "String",
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.RUNTIME
        },
        {
            name: "items",
            label: "items",
            tsType: null,
            runtimeType: "Array",
            required: false,
            hasFactoryDefault: true,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.RUNTIME
        },
        {
            name: "itemTitle",
            label: "itemTitle",
            tsType: null,
            runtimeType: null,
            required: false,
            defaultValue: "title",
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.RUNTIME
        },
        {
            name: "itemValue",
            label: "itemValue",
            tsType: null,
            runtimeType: null,
            required: false,
            defaultValue: "value",
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.RUNTIME
        },
        {
            name: "itemChildren",
            label: "itemChildren",
            tsType: null,
            runtimeType: null,
            required: false,
            defaultValue: "children",
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.RUNTIME
        },
        {
            name: "itemProps",
            label: "itemProps",
            tsType: null,
            runtimeType: null,
            required: false,
            defaultValue: "props",
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.RUNTIME
        },
        {
            name: "returnObject",
            label: "returnObject",
            tsType: null,
            runtimeType: "Boolean",
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.RUNTIME
        },
        {
            name: "valueComparator",
            label: "valueComparator",
            tsType: null,
            runtimeType: null,
            required: false,
            hasFactoryDefault: true,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.RUNTIME
        },
        {
            name: "transition",
            label: "transition",
            tsType: null,
            runtimeType: ["Boolean","String","Object"],
            required: false,
            hasFactoryDefault: true,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.RUNTIME
        },
        {
            name: "customFilter",
            label: "customFilter",
            tsType: null,
            runtimeType: "Function",
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.RUNTIME
        },
        {
            name: "customKeyFilter",
            label: "customKeyFilter",
            tsType: null,
            runtimeType: "Object",
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.RUNTIME
        },
        {
            name: "filterKeys",
            label: "filterKeys",
            tsType: null,
            runtimeType: ["String","Array"],
            required: false,
            hasFactoryDefault: true,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.RUNTIME
        },
        {
            name: "filterMode",
            label: "filterMode",
            tsType: null,
            runtimeType: null,
            required: false,
            defaultValue: "intersection",
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.RUNTIME
        },
        {
            name: "noFilter",
            label: "noFilter",
            tsType: null,
            runtimeType: "Boolean",
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.RUNTIME
        },
        {
            name: "eager",
            label: "eager",
            tsType: null,
            runtimeType: "Boolean",
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.RUNTIME
        }
        ],
        events: [
        {
            name: "click:control",
            label: "click:control",
            payloadType: null,
            source: METADATA_SOURCE.RUNTIME
        },
        {
            name: "mousedown:control",
            label: "mousedown:control",
            payloadType: null,
            source: METADATA_SOURCE.RUNTIME
        },
        {
            name: "update:menu",
            label: "update:menu",
            payloadType: null,
            source: METADATA_SOURCE.RUNTIME
        },
        {
            name: "update:modelValue",
            label: "update:modelValue",
            payloadType: null,
            source: METADATA_SOURCE.RUNTIME
        },
        {
            name: "update:focused",
            label: "update:focused",
            payloadType: null,
            source: METADATA_SOURCE.RUNTIME
        },
        {
            name: "click:append",
            label: "click:append",
            payloadType: null,
            source: METADATA_SOURCE.RUNTIME
        },
        {
            name: "click:prepend",
            label: "click:prepend",
            payloadType: null,
            source: METADATA_SOURCE.RUNTIME
        },
        {
            name: "click:appendInner",
            label: "click:appendInner",
            payloadType: null,
            source: METADATA_SOURCE.RUNTIME
        },
        {
            name: "click:prependInner",
            label: "click:prependInner",
            payloadType: null,
            source: METADATA_SOURCE.RUNTIME
        },
        {
            name: "click:clear",
            label: "click:clear",
            payloadType: null,
            source: METADATA_SOURCE.RUNTIME
        }
        ],
        slots: [],
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
            tsType: null,
            runtimeType: "Boolean",
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.RUNTIME
        },
        {
            name: "inset",
            label: "inset",
            tsType: null,
            runtimeType: "Boolean",
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.RUNTIME
        },
        {
            name: "id",
            label: "id",
            tsType: null,
            runtimeType: "String",
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.RUNTIME
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
            tsType: null,
            runtimeType: "String",
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.RUNTIME
        },
        {
            name: "padding",
            label: "padding",
            tsType: null,
            runtimeType: ["Boolean","Number","String"],
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.RUNTIME
        },
        {
            name: "paddingTop",
            label: "paddingTop",
            tsType: null,
            runtimeType: ["Boolean","Number","String"],
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.RUNTIME
        },
        {
            name: "paddingLeft",
            label: "paddingLeft",
            tsType: null,
            runtimeType: ["Boolean","Number","String"],
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.RUNTIME
        },
        {
            name: "paddingBottom",
            label: "paddingBottom",
            tsType: null,
            runtimeType: ["Boolean","Number","String"],
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.RUNTIME
        },
        {
            name: "paddingRight",
            label: "paddingRight",
            tsType: null,
            runtimeType: ["Boolean","Number","String"],
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.RUNTIME
        },
        {
            name: "paddingBlock",
            label: "paddingBlock",
            tsType: null,
            runtimeType: ["Boolean","Number","String"],
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.RUNTIME
        },
        {
            name: "paddingInline",
            label: "paddingInline",
            tsType: null,
            runtimeType: ["Boolean","Number","String"],
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.RUNTIME
        },
        {
            name: "paddingInlineStart",
            label: "paddingInlineStart",
            tsType: null,
            runtimeType: ["Boolean","Number","String"],
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.RUNTIME
        },
        {
            name: "paddingInlineEnd",
            label: "paddingInlineEnd",
            tsType: null,
            runtimeType: ["Boolean","Number","String"],
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.RUNTIME
        },
        {
            name: "paddingBlockStart",
            label: "paddingBlockStart",
            tsType: null,
            runtimeType: ["Boolean","Number","String"],
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.RUNTIME
        },
        {
            name: "paddingBlockEnd",
            label: "paddingBlockEnd",
            tsType: null,
            runtimeType: ["Boolean","Number","String"],
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.RUNTIME
        },
        {
            name: "margin",
            label: "margin",
            tsType: null,
            runtimeType: ["Boolean","Number","String"],
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.RUNTIME
        },
        {
            name: "marginTop",
            label: "marginTop",
            tsType: null,
            runtimeType: ["Boolean","Number","String"],
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.RUNTIME
        },
        {
            name: "marginLeft",
            label: "marginLeft",
            tsType: null,
            runtimeType: ["Boolean","Number","String"],
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.RUNTIME
        },
        {
            name: "marginBottom",
            label: "marginBottom",
            tsType: null,
            runtimeType: ["Boolean","Number","String"],
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.RUNTIME
        },
        {
            name: "marginRight",
            label: "marginRight",
            tsType: null,
            runtimeType: ["Boolean","Number","String"],
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.RUNTIME
        },
        {
            name: "marginBlock",
            label: "marginBlock",
            tsType: null,
            runtimeType: ["Boolean","Number","String"],
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.RUNTIME
        },
        {
            name: "marginInline",
            label: "marginInline",
            tsType: null,
            runtimeType: ["Boolean","Number","String"],
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.RUNTIME
        },
        {
            name: "marginInlineStart",
            label: "marginInlineStart",
            tsType: null,
            runtimeType: ["Boolean","Number","String"],
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.RUNTIME
        },
        {
            name: "marginInlineEnd",
            label: "marginInlineEnd",
            tsType: null,
            runtimeType: ["Boolean","Number","String"],
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.RUNTIME
        },
        {
            name: "marginBlockStart",
            label: "marginBlockStart",
            tsType: null,
            runtimeType: ["Boolean","Number","String"],
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.RUNTIME
        },
        {
            name: "marginBlockEnd",
            label: "marginBlockEnd",
            tsType: null,
            runtimeType: ["Boolean","Number","String"],
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.RUNTIME
        },
        {
            name: "border",
            label: "border",
            tsType: null,
            runtimeType: ["Boolean","Number","String","Array"],
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.RUNTIME
        },
        {
            name: "borderTop",
            label: "borderTop",
            tsType: null,
            runtimeType: ["Boolean","Number","String"],
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.RUNTIME
        },
        {
            name: "borderLeft",
            label: "borderLeft",
            tsType: null,
            runtimeType: ["Boolean","Number","String"],
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.RUNTIME
        },
        {
            name: "borderBottom",
            label: "borderBottom",
            tsType: null,
            runtimeType: ["Boolean","Number","String"],
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.RUNTIME
        },
        {
            name: "borderRight",
            label: "borderRight",
            tsType: null,
            runtimeType: ["Boolean","Number","String"],
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.RUNTIME
        },
        {
            name: "borderBlock",
            label: "borderBlock",
            tsType: null,
            runtimeType: ["Boolean","Number","String"],
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.RUNTIME
        },
        {
            name: "borderInline",
            label: "borderInline",
            tsType: null,
            runtimeType: ["Boolean","Number","String"],
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.RUNTIME
        },
        {
            name: "borderInlineStart",
            label: "borderInlineStart",
            tsType: null,
            runtimeType: ["Boolean","Number","String"],
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.RUNTIME
        },
        {
            name: "borderInlineEnd",
            label: "borderInlineEnd",
            tsType: null,
            runtimeType: ["Boolean","Number","String"],
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.RUNTIME
        },
        {
            name: "borderBlockStart",
            label: "borderBlockStart",
            tsType: null,
            runtimeType: ["Boolean","Number","String"],
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.RUNTIME
        },
        {
            name: "borderBlockEnd",
            label: "borderBlockEnd",
            tsType: null,
            runtimeType: ["Boolean","Number","String"],
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.RUNTIME
        },
        {
            name: "borderColor",
            label: "borderColor",
            tsType: null,
            runtimeType: "String",
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.RUNTIME
        },
        {
            name: "borderStyle",
            label: "borderStyle",
            tsType: null,
            runtimeType: "String",
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.RUNTIME
        },
        {
            name: "borderTopColor",
            label: "borderTopColor",
            tsType: null,
            runtimeType: ["String","Object","Boolean"],
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.RUNTIME
        },
        {
            name: "borderRightColor",
            label: "borderRightColor",
            tsType: null,
            runtimeType: ["String","Object","Boolean"],
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.RUNTIME
        },
        {
            name: "borderBottomColor",
            label: "borderBottomColor",
            tsType: null,
            runtimeType: ["String","Object","Boolean"],
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.RUNTIME
        },
        {
            name: "borderLeftColor",
            label: "borderLeftColor",
            tsType: null,
            runtimeType: ["String","Object","Boolean"],
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.RUNTIME
        },
        {
            name: "borderInlineStartColor",
            label: "borderInlineStartColor",
            tsType: null,
            runtimeType: ["String","Object","Boolean"],
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.RUNTIME
        },
        {
            name: "borderInlineEndColor",
            label: "borderInlineEndColor",
            tsType: null,
            runtimeType: ["String","Object","Boolean"],
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.RUNTIME
        },
        {
            name: "borderBlockStartColor",
            label: "borderBlockStartColor",
            tsType: null,
            runtimeType: ["String","Object","Boolean"],
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.RUNTIME
        },
        {
            name: "borderBlockEndColor",
            label: "borderBlockEndColor",
            tsType: null,
            runtimeType: ["String","Object","Boolean"],
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.RUNTIME
        },
        {
            name: "rounded",
            label: "rounded",
            tsType: null,
            runtimeType: ["Boolean","Number","String"],
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.RUNTIME
        },
        {
            name: "roundedTopRight",
            label: "roundedTopRight",
            tsType: null,
            runtimeType: ["Boolean","Number","String"],
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.RUNTIME
        },
        {
            name: "roundedTopLeft",
            label: "roundedTopLeft",
            tsType: null,
            runtimeType: ["Boolean","Number","String"],
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.RUNTIME
        },
        {
            name: "roundedBottomLeft",
            label: "roundedBottomLeft",
            tsType: null,
            runtimeType: ["Boolean","Number","String"],
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.RUNTIME
        },
        {
            name: "roundedBottomRight",
            label: "roundedBottomRight",
            tsType: null,
            runtimeType: ["Boolean","Number","String"],
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.RUNTIME
        },
        {
            name: "roundedStartStart",
            label: "roundedStartStart",
            tsType: null,
            runtimeType: ["Boolean","Number","String"],
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.RUNTIME
        },
        {
            name: "roundedStartEnd",
            label: "roundedStartEnd",
            tsType: null,
            runtimeType: ["Boolean","Number","String"],
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.RUNTIME
        },
        {
            name: "roundedEndStart",
            label: "roundedEndStart",
            tsType: null,
            runtimeType: ["Boolean","Number","String"],
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.RUNTIME
        },
        {
            name: "roundedEndEnd",
            label: "roundedEndEnd",
            tsType: null,
            runtimeType: ["Boolean","Number","String"],
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.RUNTIME
        },
        {
            name: "centerAffix",
            label: "centerAffix",
            tsType: null,
            runtimeType: "Boolean",
            required: false,
            defaultValue: true,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.RUNTIME
        },
        {
            name: "hideDetails",
            label: "hideDetails",
            tsType: null,
            runtimeType: ["Boolean","String"],
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.RUNTIME
        },
        {
            name: "hideSpinButtons",
            label: "hideSpinButtons",
            tsType: null,
            runtimeType: "Boolean",
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.RUNTIME
        },
        {
            name: "hint",
            label: "hint",
            tsType: null,
            runtimeType: "String",
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.RUNTIME
        },
        {
            name: "persistentHint",
            label: "persistentHint",
            tsType: null,
            runtimeType: "Boolean",
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.RUNTIME
        },
        {
            name: "messages",
            label: "messages",
            tsType: null,
            runtimeType: ["Array","String"],
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.RUNTIME
        },
        {
            name: "density",
            label: "density",
            tsType: null,
            runtimeType: null,
            required: false,
            defaultValue: "default",
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.RUNTIME
        },
        {
            name: "color",
            label: "color",
            tsType: null,
            runtimeType: ["String","Object","Boolean"],
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.RUNTIME
        },
        {
            name: "bgColor",
            label: "bgColor",
            tsType: null,
            runtimeType: ["String","Object","Boolean"],
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.RUNTIME
        },
        {
            name: "elevation",
            label: "elevation",
            tsType: null,
            runtimeType: ["Number","String"],
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.RUNTIME
        },
        {
            name: "height",
            label: "height",
            tsType: null,
            runtimeType: ["Number","String"],
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.RUNTIME
        },
        {
            name: "maxHeight",
            label: "maxHeight",
            tsType: null,
            runtimeType: ["Number","String"],
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.RUNTIME
        },
        {
            name: "maxWidth",
            label: "maxWidth",
            tsType: null,
            runtimeType: ["Number","String"],
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.RUNTIME
        },
        {
            name: "minHeight",
            label: "minHeight",
            tsType: null,
            runtimeType: ["Number","String"],
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.RUNTIME
        },
        {
            name: "minWidth",
            label: "minWidth",
            tsType: null,
            runtimeType: ["Number","String"],
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.RUNTIME
        },
        {
            name: "width",
            label: "width",
            tsType: null,
            runtimeType: ["Number","String"],
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.RUNTIME
        },
        {
            name: "direction",
            label: "direction",
            tsType: null,
            runtimeType: null,
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.RUNTIME
        },
        {
            name: "disabled",
            label: "disabled",
            tsType: null,
            runtimeType: "Boolean",
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.RUNTIME
        },
        {
            name: "error",
            label: "error",
            tsType: null,
            runtimeType: ["String","Boolean"],
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.RUNTIME
        },
        {
            name: "errorMessages",
            label: "errorMessages",
            tsType: null,
            runtimeType: ["Array","String"],
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.RUNTIME
        },
        {
            name: "maxErrors",
            label: "maxErrors",
            tsType: null,
            runtimeType: ["Number","String"],
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.RUNTIME
        },
        {
            name: "name",
            label: "name",
            tsType: null,
            runtimeType: "String",
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.RUNTIME
        },
        {
            name: "readonly",
            label: "readonly",
            tsType: null,
            runtimeType: "Boolean",
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.RUNTIME
        },
        {
            name: "rules",
            label: "rules",
            tsType: null,
            runtimeType: "Array",
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.RUNTIME
        },
        {
            name: "modelValue",
            label: "modelValue",
            tsType: null,
            runtimeType: null,
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.RUNTIME
        },
        {
            name: "validateOn",
            label: "validateOn",
            tsType: null,
            runtimeType: null,
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.RUNTIME
        },
        {
            name: "validationValue",
            label: "validationValue",
            tsType: null,
            runtimeType: null,
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.RUNTIME
        },
        {
            name: "focused",
            label: "focused",
            tsType: null,
            runtimeType: "Boolean",
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.RUNTIME
        },
        {
            name: "appendAvatar",
            label: "appendAvatar",
            tsType: null,
            runtimeType: "String",
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.RUNTIME
        },
        {
            name: "appendIcon",
            label: "appendIcon",
            tsType: null,
            runtimeType: null,
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.RUNTIME
        },
        {
            name: "prependAvatar",
            label: "prependAvatar",
            tsType: null,
            runtimeType: "String",
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.RUNTIME
        },
        {
            name: "prependIcon",
            label: "prependIcon",
            tsType: null,
            runtimeType: null,
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.RUNTIME
        },
        {
            name: "prependAriaLabel",
            label: "prependAriaLabel",
            tsType: null,
            runtimeType: "String",
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.RUNTIME
        },
        {
            name: "appendAriaLabel",
            label: "appendAriaLabel",
            tsType: null,
            runtimeType: "String",
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.RUNTIME
        },
        {
            name: "size",
            label: "size",
            tsType: null,
            runtimeType: null,
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.RUNTIME
        },
        {
            name: "fontSize",
            label: "fontSize",
            tsType: null,
            runtimeType: null,
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.RUNTIME
        },
        {
            name: "fontWeight",
            label: "fontWeight",
            tsType: null,
            runtimeType: null,
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.RUNTIME
        },
        {
            name: "lineHeight",
            label: "lineHeight",
            tsType: null,
            runtimeType: null,
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.RUNTIME
        },
        {
            name: "label",
            label: "label",
            tsType: null,
            runtimeType: "String",
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.RUNTIME
        },
        {
            name: "trueValue",
            label: "trueValue",
            tsType: null,
            runtimeType: null,
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.RUNTIME
        },
        {
            name: "falseValue",
            label: "falseValue",
            tsType: null,
            runtimeType: null,
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.RUNTIME
        },
        {
            name: "value",
            label: "value",
            tsType: null,
            runtimeType: null,
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.RUNTIME
        },
        {
            name: "required",
            label: "required",
            tsType: null,
            runtimeType: "Boolean",
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.RUNTIME
        },
        {
            name: "type",
            label: "type",
            tsType: null,
            runtimeType: "String",
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.RUNTIME
        },
        {
            name: "valueComparator",
            label: "valueComparator",
            tsType: null,
            runtimeType: "Function",
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.RUNTIME
        },
        {
            name: "falseIcon",
            label: "falseIcon",
            tsType: null,
            runtimeType: null,
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.RUNTIME
        },
        {
            name: "trueIcon",
            label: "trueIcon",
            tsType: null,
            runtimeType: null,
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.RUNTIME
        },
        {
            name: "multiple",
            label: "multiple",
            tsType: null,
            runtimeType: "Boolean",
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.RUNTIME
        },
        {
            name: "inline",
            label: "inline",
            tsType: null,
            runtimeType: "Boolean",
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.RUNTIME
        },
        {
            name: "hover",
            label: "hover",
            tsType: null,
            runtimeType: ["Boolean","Object"],
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.RUNTIME
        },
        {
            name: "hoverClass",
            label: "hoverClass",
            tsType: null,
            runtimeType: "String",
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.RUNTIME
        },
        {
            name: "ripple",
            label: "ripple",
            tsType: null,
            runtimeType: ["Boolean","Object"],
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.RUNTIME
        },
        {
            name: "loading",
            label: "loading",
            tsType: null,
            runtimeType: ["Boolean","Number","Object"],
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.RUNTIME
        },
        {
            name: "loadingText",
            label: "loadingText",
            tsType: null,
            runtimeType: "String",
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.RUNTIME
        },
        {
            name: "active",
            label: "active",
            tsType: null,
            runtimeType: ["Boolean","Object"],
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.RUNTIME
        },
        {
            name: "activeClass",
            label: "activeClass",
            tsType: null,
            runtimeType: "String",
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.RUNTIME
        }
        ],
        events: [
        {
            name: "update:modelValue",
            label: "update:modelValue",
            payloadType: null,
            source: METADATA_SOURCE.RUNTIME
        },
        {
            name: "update:focused",
            label: "update:focused",
            payloadType: null,
            source: METADATA_SOURCE.RUNTIME
        },
        {
            name: "update:indeterminate",
            label: "update:indeterminate",
            payloadType: null,
            source: METADATA_SOURCE.RUNTIME
        },
        {
            name: "click:label",
            label: "click:label",
            payloadType: null,
            source: METADATA_SOURCE.RUNTIME
        }
        ],
        slots: [],
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
            tsType: null,
            runtimeType: "Boolean",
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.RUNTIME
        },
        {
            name: "closeIcon",
            label: "closeIcon",
            tsType: null,
            runtimeType: null,
            required: false,
            defaultValue: "mdi:mdi-close",
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.RUNTIME
        },
        {
            name: "closeLabel",
            label: "closeLabel",
            tsType: null,
            runtimeType: "String",
            required: false,
            defaultValue: "origam.close",
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.RUNTIME
        },
        {
            name: "modelValue",
            label: "modelValue",
            tsType: null,
            runtimeType: "Boolean",
            required: false,
            defaultValue: true,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.RUNTIME
        },
        {
            name: "title",
            label: "title",
            tsType: null,
            runtimeType: "String",
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.RUNTIME
        },
        {
            name: "text",
            label: "text",
            tsType: null,
            runtimeType: "String",
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.RUNTIME
        },
        {
            name: "id",
            label: "id",
            tsType: null,
            runtimeType: "String",
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.RUNTIME
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
            tsType: null,
            runtimeType: "String",
            required: false,
            defaultValue: "div",
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.RUNTIME
        },
        {
            name: "color",
            label: "color",
            tsType: null,
            runtimeType: ["String","Object","Boolean"],
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.RUNTIME
        },
        {
            name: "bgColor",
            label: "bgColor",
            tsType: null,
            runtimeType: ["String","Object","Boolean"],
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.RUNTIME
        },
        {
            name: "border",
            label: "border",
            tsType: null,
            runtimeType: ["Boolean","Number","String","Array"],
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.RUNTIME
        },
        {
            name: "borderTop",
            label: "borderTop",
            tsType: null,
            runtimeType: ["Boolean","Number","String"],
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.RUNTIME
        },
        {
            name: "borderLeft",
            label: "borderLeft",
            tsType: null,
            runtimeType: ["Boolean","Number","String"],
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.RUNTIME
        },
        {
            name: "borderBottom",
            label: "borderBottom",
            tsType: null,
            runtimeType: ["Boolean","Number","String"],
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.RUNTIME
        },
        {
            name: "borderRight",
            label: "borderRight",
            tsType: null,
            runtimeType: ["Boolean","Number","String"],
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.RUNTIME
        },
        {
            name: "borderBlock",
            label: "borderBlock",
            tsType: null,
            runtimeType: ["Boolean","Number","String"],
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.RUNTIME
        },
        {
            name: "borderInline",
            label: "borderInline",
            tsType: null,
            runtimeType: ["Boolean","Number","String"],
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.RUNTIME
        },
        {
            name: "borderInlineStart",
            label: "borderInlineStart",
            tsType: null,
            runtimeType: ["Boolean","Number","String"],
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.RUNTIME
        },
        {
            name: "borderInlineEnd",
            label: "borderInlineEnd",
            tsType: null,
            runtimeType: ["Boolean","Number","String"],
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.RUNTIME
        },
        {
            name: "borderBlockStart",
            label: "borderBlockStart",
            tsType: null,
            runtimeType: ["Boolean","Number","String"],
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.RUNTIME
        },
        {
            name: "borderBlockEnd",
            label: "borderBlockEnd",
            tsType: null,
            runtimeType: ["Boolean","Number","String"],
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.RUNTIME
        },
        {
            name: "borderColor",
            label: "borderColor",
            tsType: null,
            runtimeType: "String",
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.RUNTIME
        },
        {
            name: "borderStyle",
            label: "borderStyle",
            tsType: null,
            runtimeType: "String",
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.RUNTIME
        },
        {
            name: "borderTopColor",
            label: "borderTopColor",
            tsType: null,
            runtimeType: ["String","Object","Boolean"],
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.RUNTIME
        },
        {
            name: "borderRightColor",
            label: "borderRightColor",
            tsType: null,
            runtimeType: ["String","Object","Boolean"],
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.RUNTIME
        },
        {
            name: "borderBottomColor",
            label: "borderBottomColor",
            tsType: null,
            runtimeType: ["String","Object","Boolean"],
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.RUNTIME
        },
        {
            name: "borderLeftColor",
            label: "borderLeftColor",
            tsType: null,
            runtimeType: ["String","Object","Boolean"],
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.RUNTIME
        },
        {
            name: "borderInlineStartColor",
            label: "borderInlineStartColor",
            tsType: null,
            runtimeType: ["String","Object","Boolean"],
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.RUNTIME
        },
        {
            name: "borderInlineEndColor",
            label: "borderInlineEndColor",
            tsType: null,
            runtimeType: ["String","Object","Boolean"],
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.RUNTIME
        },
        {
            name: "borderBlockStartColor",
            label: "borderBlockStartColor",
            tsType: null,
            runtimeType: ["String","Object","Boolean"],
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.RUNTIME
        },
        {
            name: "borderBlockEndColor",
            label: "borderBlockEndColor",
            tsType: null,
            runtimeType: ["String","Object","Boolean"],
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.RUNTIME
        },
        {
            name: "height",
            label: "height",
            tsType: null,
            runtimeType: ["Number","String"],
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.RUNTIME
        },
        {
            name: "maxHeight",
            label: "maxHeight",
            tsType: null,
            runtimeType: ["Number","String"],
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.RUNTIME
        },
        {
            name: "maxWidth",
            label: "maxWidth",
            tsType: null,
            runtimeType: ["Number","String"],
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.RUNTIME
        },
        {
            name: "minHeight",
            label: "minHeight",
            tsType: null,
            runtimeType: ["Number","String"],
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.RUNTIME
        },
        {
            name: "minWidth",
            label: "minWidth",
            tsType: null,
            runtimeType: ["Number","String"],
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.RUNTIME
        },
        {
            name: "width",
            label: "width",
            tsType: null,
            runtimeType: ["Number","String"],
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.RUNTIME
        },
        {
            name: "padding",
            label: "padding",
            tsType: null,
            runtimeType: ["Boolean","Number","String"],
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.RUNTIME
        },
        {
            name: "paddingTop",
            label: "paddingTop",
            tsType: null,
            runtimeType: ["Boolean","Number","String"],
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.RUNTIME
        },
        {
            name: "paddingLeft",
            label: "paddingLeft",
            tsType: null,
            runtimeType: ["Boolean","Number","String"],
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.RUNTIME
        },
        {
            name: "paddingBottom",
            label: "paddingBottom",
            tsType: null,
            runtimeType: ["Boolean","Number","String"],
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.RUNTIME
        },
        {
            name: "paddingRight",
            label: "paddingRight",
            tsType: null,
            runtimeType: ["Boolean","Number","String"],
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.RUNTIME
        },
        {
            name: "paddingBlock",
            label: "paddingBlock",
            tsType: null,
            runtimeType: ["Boolean","Number","String"],
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.RUNTIME
        },
        {
            name: "paddingInline",
            label: "paddingInline",
            tsType: null,
            runtimeType: ["Boolean","Number","String"],
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.RUNTIME
        },
        {
            name: "paddingInlineStart",
            label: "paddingInlineStart",
            tsType: null,
            runtimeType: ["Boolean","Number","String"],
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.RUNTIME
        },
        {
            name: "paddingInlineEnd",
            label: "paddingInlineEnd",
            tsType: null,
            runtimeType: ["Boolean","Number","String"],
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.RUNTIME
        },
        {
            name: "paddingBlockStart",
            label: "paddingBlockStart",
            tsType: null,
            runtimeType: ["Boolean","Number","String"],
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.RUNTIME
        },
        {
            name: "paddingBlockEnd",
            label: "paddingBlockEnd",
            tsType: null,
            runtimeType: ["Boolean","Number","String"],
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.RUNTIME
        },
        {
            name: "margin",
            label: "margin",
            tsType: null,
            runtimeType: ["Boolean","Number","String"],
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.RUNTIME
        },
        {
            name: "marginTop",
            label: "marginTop",
            tsType: null,
            runtimeType: ["Boolean","Number","String"],
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.RUNTIME
        },
        {
            name: "marginLeft",
            label: "marginLeft",
            tsType: null,
            runtimeType: ["Boolean","Number","String"],
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.RUNTIME
        },
        {
            name: "marginBottom",
            label: "marginBottom",
            tsType: null,
            runtimeType: ["Boolean","Number","String"],
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.RUNTIME
        },
        {
            name: "marginRight",
            label: "marginRight",
            tsType: null,
            runtimeType: ["Boolean","Number","String"],
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.RUNTIME
        },
        {
            name: "marginBlock",
            label: "marginBlock",
            tsType: null,
            runtimeType: ["Boolean","Number","String"],
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.RUNTIME
        },
        {
            name: "marginInline",
            label: "marginInline",
            tsType: null,
            runtimeType: ["Boolean","Number","String"],
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.RUNTIME
        },
        {
            name: "marginInlineStart",
            label: "marginInlineStart",
            tsType: null,
            runtimeType: ["Boolean","Number","String"],
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.RUNTIME
        },
        {
            name: "marginInlineEnd",
            label: "marginInlineEnd",
            tsType: null,
            runtimeType: ["Boolean","Number","String"],
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.RUNTIME
        },
        {
            name: "marginBlockStart",
            label: "marginBlockStart",
            tsType: null,
            runtimeType: ["Boolean","Number","String"],
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.RUNTIME
        },
        {
            name: "marginBlockEnd",
            label: "marginBlockEnd",
            tsType: null,
            runtimeType: ["Boolean","Number","String"],
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.RUNTIME
        },
        {
            name: "density",
            label: "density",
            tsType: null,
            runtimeType: null,
            required: false,
            defaultValue: "default",
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.RUNTIME
        },
        {
            name: "elevation",
            label: "elevation",
            tsType: null,
            runtimeType: ["Number","String"],
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.RUNTIME
        },
        {
            name: "location",
            label: "location",
            tsType: null,
            runtimeType: null,
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.RUNTIME
        },
        {
            name: "position",
            label: "position",
            tsType: null,
            runtimeType: null,
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.RUNTIME
        },
        {
            name: "top",
            label: "top",
            tsType: null,
            runtimeType: ["Number","String"],
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.RUNTIME
        },
        {
            name: "bottom",
            label: "bottom",
            tsType: null,
            runtimeType: ["Number","String"],
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.RUNTIME
        },
        {
            name: "left",
            label: "left",
            tsType: null,
            runtimeType: ["Number","String"],
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.RUNTIME
        },
        {
            name: "right",
            label: "right",
            tsType: null,
            runtimeType: ["Number","String"],
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.RUNTIME
        },
        {
            name: "rounded",
            label: "rounded",
            tsType: null,
            runtimeType: ["Boolean","Number","String"],
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.RUNTIME
        },
        {
            name: "roundedTopRight",
            label: "roundedTopRight",
            tsType: null,
            runtimeType: ["Boolean","Number","String"],
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.RUNTIME
        },
        {
            name: "roundedTopLeft",
            label: "roundedTopLeft",
            tsType: null,
            runtimeType: ["Boolean","Number","String"],
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.RUNTIME
        },
        {
            name: "roundedBottomLeft",
            label: "roundedBottomLeft",
            tsType: null,
            runtimeType: ["Boolean","Number","String"],
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.RUNTIME
        },
        {
            name: "roundedBottomRight",
            label: "roundedBottomRight",
            tsType: null,
            runtimeType: ["Boolean","Number","String"],
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.RUNTIME
        },
        {
            name: "roundedStartStart",
            label: "roundedStartStart",
            tsType: null,
            runtimeType: ["Boolean","Number","String"],
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.RUNTIME
        },
        {
            name: "roundedStartEnd",
            label: "roundedStartEnd",
            tsType: null,
            runtimeType: ["Boolean","Number","String"],
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.RUNTIME
        },
        {
            name: "roundedEndStart",
            label: "roundedEndStart",
            tsType: null,
            runtimeType: ["Boolean","Number","String"],
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.RUNTIME
        },
        {
            name: "roundedEndEnd",
            label: "roundedEndEnd",
            tsType: null,
            runtimeType: ["Boolean","Number","String"],
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.RUNTIME
        },
        {
            name: "status",
            label: "status",
            tsType: null,
            runtimeType: null,
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.RUNTIME
        },
        {
            name: "statusIconPosition",
            label: "statusIconPosition",
            tsType: null,
            runtimeType: null,
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.RUNTIME
        },
        {
            name: "icon",
            label: "icon",
            tsType: null,
            runtimeType: null,
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.RUNTIME
        },
        {
            name: "hover",
            label: "hover",
            tsType: null,
            runtimeType: ["Boolean","Object"],
            required: false,
            defaultValue: true,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.RUNTIME
        },
        {
            name: "hoverClass",
            label: "hoverClass",
            tsType: null,
            runtimeType: "String",
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.RUNTIME
        },
        {
            name: "appendAvatar",
            label: "appendAvatar",
            tsType: null,
            runtimeType: "String",
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.RUNTIME
        },
        {
            name: "appendIcon",
            label: "appendIcon",
            tsType: null,
            runtimeType: null,
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.RUNTIME
        },
        {
            name: "prependAvatar",
            label: "prependAvatar",
            tsType: null,
            runtimeType: "String",
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.RUNTIME
        },
        {
            name: "prependIcon",
            label: "prependIcon",
            tsType: null,
            runtimeType: null,
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.RUNTIME
        },
        {
            name: "prependAriaLabel",
            label: "prependAriaLabel",
            tsType: null,
            runtimeType: "String",
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.RUNTIME
        },
        {
            name: "appendAriaLabel",
            label: "appendAriaLabel",
            tsType: null,
            runtimeType: "String",
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.RUNTIME
        },
        {
            name: "fontSize",
            label: "fontSize",
            tsType: null,
            runtimeType: null,
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.RUNTIME
        },
        {
            name: "fontWeight",
            label: "fontWeight",
            tsType: null,
            runtimeType: null,
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.RUNTIME
        },
        {
            name: "lineHeight",
            label: "lineHeight",
            tsType: null,
            runtimeType: null,
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.RUNTIME
        },
        {
            name: "letterSpacing",
            label: "letterSpacing",
            tsType: null,
            runtimeType: null,
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.RUNTIME
        }
        ],
        events: [
        {
            name: "update:modelValue",
            label: "update:modelValue",
            payloadType: null,
            source: METADATA_SOURCE.RUNTIME
        },
        {
            name: "click:close",
            label: "click:close",
            payloadType: null,
            source: METADATA_SOURCE.RUNTIME
        },
        {
            name: "update:hover",
            label: "update:hover",
            payloadType: null,
            source: METADATA_SOURCE.RUNTIME
        }
        ],
        slots: [],
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
            name: "disabled",
            label: "disabled",
            tsType: null,
            runtimeType: "Boolean",
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.RUNTIME
        },
        {
            name: "flat",
            label: "flat",
            tsType: null,
            runtimeType: "Boolean",
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.RUNTIME
        },
        {
            name: "hover",
            label: "hover",
            tsType: null,
            runtimeType: "Boolean",
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.RUNTIME
        },
        {
            name: "image",
            label: "image",
            tsType: null,
            runtimeType: "String",
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.RUNTIME
        },
        {
            name: "link",
            label: "link",
            tsType: null,
            runtimeType: "Boolean",
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.RUNTIME
        },
        {
            name: "subtitle",
            label: "subtitle",
            tsType: null,
            runtimeType: ["String","Number"],
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.RUNTIME
        },
        {
            name: "text",
            label: "text",
            tsType: null,
            runtimeType: ["String","Number"],
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.RUNTIME
        },
        {
            name: "title",
            label: "title",
            tsType: null,
            runtimeType: ["String","Number"],
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.RUNTIME
        },
        {
            name: "type",
            label: "type",
            tsType: null,
            runtimeType: null,
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.RUNTIME
        },
        {
            name: "titleId",
            label: "titleId",
            tsType: null,
            runtimeType: "String",
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.RUNTIME
        },
        {
            name: "id",
            label: "id",
            tsType: null,
            runtimeType: "String",
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.RUNTIME
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
            tsType: null,
            runtimeType: "String",
            required: false,
            defaultValue: "div",
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.RUNTIME
        },
        {
            name: "border",
            label: "border",
            tsType: null,
            runtimeType: ["Boolean","Number","String","Array"],
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.RUNTIME
        },
        {
            name: "borderTop",
            label: "borderTop",
            tsType: null,
            runtimeType: ["Boolean","Number","String"],
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.RUNTIME
        },
        {
            name: "borderLeft",
            label: "borderLeft",
            tsType: null,
            runtimeType: ["Boolean","Number","String"],
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.RUNTIME
        },
        {
            name: "borderBottom",
            label: "borderBottom",
            tsType: null,
            runtimeType: ["Boolean","Number","String"],
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.RUNTIME
        },
        {
            name: "borderRight",
            label: "borderRight",
            tsType: null,
            runtimeType: ["Boolean","Number","String"],
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.RUNTIME
        },
        {
            name: "borderBlock",
            label: "borderBlock",
            tsType: null,
            runtimeType: ["Boolean","Number","String"],
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.RUNTIME
        },
        {
            name: "borderInline",
            label: "borderInline",
            tsType: null,
            runtimeType: ["Boolean","Number","String"],
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.RUNTIME
        },
        {
            name: "borderInlineStart",
            label: "borderInlineStart",
            tsType: null,
            runtimeType: ["Boolean","Number","String"],
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.RUNTIME
        },
        {
            name: "borderInlineEnd",
            label: "borderInlineEnd",
            tsType: null,
            runtimeType: ["Boolean","Number","String"],
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.RUNTIME
        },
        {
            name: "borderBlockStart",
            label: "borderBlockStart",
            tsType: null,
            runtimeType: ["Boolean","Number","String"],
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.RUNTIME
        },
        {
            name: "borderBlockEnd",
            label: "borderBlockEnd",
            tsType: null,
            runtimeType: ["Boolean","Number","String"],
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.RUNTIME
        },
        {
            name: "borderColor",
            label: "borderColor",
            tsType: null,
            runtimeType: "String",
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.RUNTIME
        },
        {
            name: "borderStyle",
            label: "borderStyle",
            tsType: null,
            runtimeType: "String",
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.RUNTIME
        },
        {
            name: "borderTopColor",
            label: "borderTopColor",
            tsType: null,
            runtimeType: ["String","Object","Boolean"],
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.RUNTIME
        },
        {
            name: "borderRightColor",
            label: "borderRightColor",
            tsType: null,
            runtimeType: ["String","Object","Boolean"],
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.RUNTIME
        },
        {
            name: "borderBottomColor",
            label: "borderBottomColor",
            tsType: null,
            runtimeType: ["String","Object","Boolean"],
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.RUNTIME
        },
        {
            name: "borderLeftColor",
            label: "borderLeftColor",
            tsType: null,
            runtimeType: ["String","Object","Boolean"],
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.RUNTIME
        },
        {
            name: "borderInlineStartColor",
            label: "borderInlineStartColor",
            tsType: null,
            runtimeType: ["String","Object","Boolean"],
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.RUNTIME
        },
        {
            name: "borderInlineEndColor",
            label: "borderInlineEndColor",
            tsType: null,
            runtimeType: ["String","Object","Boolean"],
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.RUNTIME
        },
        {
            name: "borderBlockStartColor",
            label: "borderBlockStartColor",
            tsType: null,
            runtimeType: ["String","Object","Boolean"],
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.RUNTIME
        },
        {
            name: "borderBlockEndColor",
            label: "borderBlockEndColor",
            tsType: null,
            runtimeType: ["String","Object","Boolean"],
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.RUNTIME
        },
        {
            name: "color",
            label: "color",
            tsType: null,
            runtimeType: ["String","Object","Boolean"],
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.RUNTIME
        },
        {
            name: "bgColor",
            label: "bgColor",
            tsType: null,
            runtimeType: ["String","Object","Boolean"],
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.RUNTIME
        },
        {
            name: "density",
            label: "density",
            tsType: null,
            runtimeType: null,
            required: false,
            defaultValue: "default",
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.RUNTIME
        },
        {
            name: "height",
            label: "height",
            tsType: null,
            runtimeType: ["Number","String"],
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.RUNTIME
        },
        {
            name: "maxHeight",
            label: "maxHeight",
            tsType: null,
            runtimeType: ["Number","String"],
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.RUNTIME
        },
        {
            name: "maxWidth",
            label: "maxWidth",
            tsType: null,
            runtimeType: ["Number","String"],
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.RUNTIME
        },
        {
            name: "minHeight",
            label: "minHeight",
            tsType: null,
            runtimeType: ["Number","String"],
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.RUNTIME
        },
        {
            name: "minWidth",
            label: "minWidth",
            tsType: null,
            runtimeType: ["Number","String"],
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.RUNTIME
        },
        {
            name: "width",
            label: "width",
            tsType: null,
            runtimeType: ["Number","String"],
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.RUNTIME
        },
        {
            name: "elevation",
            label: "elevation",
            tsType: null,
            runtimeType: ["Number","String"],
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.RUNTIME
        },
        {
            name: "loading",
            label: "loading",
            tsType: null,
            runtimeType: ["Boolean","Number","Object"],
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.RUNTIME
        },
        {
            name: "loadingText",
            label: "loadingText",
            tsType: null,
            runtimeType: "String",
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.RUNTIME
        },
        {
            name: "location",
            label: "location",
            tsType: null,
            runtimeType: null,
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.RUNTIME
        },
        {
            name: "position",
            label: "position",
            tsType: null,
            runtimeType: null,
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.RUNTIME
        },
        {
            name: "top",
            label: "top",
            tsType: null,
            runtimeType: ["Number","String"],
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.RUNTIME
        },
        {
            name: "bottom",
            label: "bottom",
            tsType: null,
            runtimeType: ["Number","String"],
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.RUNTIME
        },
        {
            name: "left",
            label: "left",
            tsType: null,
            runtimeType: ["Number","String"],
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.RUNTIME
        },
        {
            name: "right",
            label: "right",
            tsType: null,
            runtimeType: ["Number","String"],
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.RUNTIME
        },
        {
            name: "rounded",
            label: "rounded",
            tsType: null,
            runtimeType: ["Boolean","Number","String"],
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.RUNTIME
        },
        {
            name: "roundedTopRight",
            label: "roundedTopRight",
            tsType: null,
            runtimeType: ["Boolean","Number","String"],
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.RUNTIME
        },
        {
            name: "roundedTopLeft",
            label: "roundedTopLeft",
            tsType: null,
            runtimeType: ["Boolean","Number","String"],
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.RUNTIME
        },
        {
            name: "roundedBottomLeft",
            label: "roundedBottomLeft",
            tsType: null,
            runtimeType: ["Boolean","Number","String"],
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.RUNTIME
        },
        {
            name: "roundedBottomRight",
            label: "roundedBottomRight",
            tsType: null,
            runtimeType: ["Boolean","Number","String"],
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.RUNTIME
        },
        {
            name: "roundedStartStart",
            label: "roundedStartStart",
            tsType: null,
            runtimeType: ["Boolean","Number","String"],
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.RUNTIME
        },
        {
            name: "roundedStartEnd",
            label: "roundedStartEnd",
            tsType: null,
            runtimeType: ["Boolean","Number","String"],
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.RUNTIME
        },
        {
            name: "roundedEndStart",
            label: "roundedEndStart",
            tsType: null,
            runtimeType: ["Boolean","Number","String"],
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.RUNTIME
        },
        {
            name: "roundedEndEnd",
            label: "roundedEndEnd",
            tsType: null,
            runtimeType: ["Boolean","Number","String"],
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.RUNTIME
        },
        {
            name: "margin",
            label: "margin",
            tsType: null,
            runtimeType: ["Boolean","Number","String"],
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.RUNTIME
        },
        {
            name: "marginTop",
            label: "marginTop",
            tsType: null,
            runtimeType: ["Boolean","Number","String"],
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.RUNTIME
        },
        {
            name: "marginLeft",
            label: "marginLeft",
            tsType: null,
            runtimeType: ["Boolean","Number","String"],
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.RUNTIME
        },
        {
            name: "marginBottom",
            label: "marginBottom",
            tsType: null,
            runtimeType: ["Boolean","Number","String"],
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.RUNTIME
        },
        {
            name: "marginRight",
            label: "marginRight",
            tsType: null,
            runtimeType: ["Boolean","Number","String"],
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.RUNTIME
        },
        {
            name: "marginBlock",
            label: "marginBlock",
            tsType: null,
            runtimeType: ["Boolean","Number","String"],
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.RUNTIME
        },
        {
            name: "marginInline",
            label: "marginInline",
            tsType: null,
            runtimeType: ["Boolean","Number","String"],
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.RUNTIME
        },
        {
            name: "marginInlineStart",
            label: "marginInlineStart",
            tsType: null,
            runtimeType: ["Boolean","Number","String"],
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.RUNTIME
        },
        {
            name: "marginInlineEnd",
            label: "marginInlineEnd",
            tsType: null,
            runtimeType: ["Boolean","Number","String"],
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.RUNTIME
        },
        {
            name: "marginBlockStart",
            label: "marginBlockStart",
            tsType: null,
            runtimeType: ["Boolean","Number","String"],
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.RUNTIME
        },
        {
            name: "marginBlockEnd",
            label: "marginBlockEnd",
            tsType: null,
            runtimeType: ["Boolean","Number","String"],
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.RUNTIME
        },
        {
            name: "padding",
            label: "padding",
            tsType: null,
            runtimeType: ["Boolean","Number","String"],
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.RUNTIME
        },
        {
            name: "paddingTop",
            label: "paddingTop",
            tsType: null,
            runtimeType: ["Boolean","Number","String"],
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.RUNTIME
        },
        {
            name: "paddingLeft",
            label: "paddingLeft",
            tsType: null,
            runtimeType: ["Boolean","Number","String"],
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.RUNTIME
        },
        {
            name: "paddingBottom",
            label: "paddingBottom",
            tsType: null,
            runtimeType: ["Boolean","Number","String"],
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.RUNTIME
        },
        {
            name: "paddingRight",
            label: "paddingRight",
            tsType: null,
            runtimeType: ["Boolean","Number","String"],
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.RUNTIME
        },
        {
            name: "paddingBlock",
            label: "paddingBlock",
            tsType: null,
            runtimeType: ["Boolean","Number","String"],
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.RUNTIME
        },
        {
            name: "paddingInline",
            label: "paddingInline",
            tsType: null,
            runtimeType: ["Boolean","Number","String"],
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.RUNTIME
        },
        {
            name: "paddingInlineStart",
            label: "paddingInlineStart",
            tsType: null,
            runtimeType: ["Boolean","Number","String"],
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.RUNTIME
        },
        {
            name: "paddingInlineEnd",
            label: "paddingInlineEnd",
            tsType: null,
            runtimeType: ["Boolean","Number","String"],
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.RUNTIME
        },
        {
            name: "paddingBlockStart",
            label: "paddingBlockStart",
            tsType: null,
            runtimeType: ["Boolean","Number","String"],
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.RUNTIME
        },
        {
            name: "paddingBlockEnd",
            label: "paddingBlockEnd",
            tsType: null,
            runtimeType: ["Boolean","Number","String"],
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.RUNTIME
        },
        {
            name: "href",
            label: "href",
            tsType: null,
            runtimeType: "String",
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.RUNTIME
        },
        {
            name: "replace",
            label: "replace",
            tsType: null,
            runtimeType: "Boolean",
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.RUNTIME
        },
        {
            name: "to",
            label: "to",
            tsType: null,
            runtimeType: null,
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.RUNTIME
        },
        {
            name: "exact",
            label: "exact",
            tsType: null,
            runtimeType: "Boolean",
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.RUNTIME
        },
        {
            name: "ripple",
            label: "ripple",
            tsType: null,
            runtimeType: ["Boolean","Object"],
            required: false,
            defaultValue: true,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.RUNTIME
        },
        {
            name: "appendAvatar",
            label: "appendAvatar",
            tsType: null,
            runtimeType: "String",
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.RUNTIME
        },
        {
            name: "appendIcon",
            label: "appendIcon",
            tsType: null,
            runtimeType: null,
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.RUNTIME
        },
        {
            name: "prependAvatar",
            label: "prependAvatar",
            tsType: null,
            runtimeType: "String",
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.RUNTIME
        },
        {
            name: "prependIcon",
            label: "prependIcon",
            tsType: null,
            runtimeType: null,
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.RUNTIME
        },
        {
            name: "prependAriaLabel",
            label: "prependAriaLabel",
            tsType: null,
            runtimeType: "String",
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.RUNTIME
        },
        {
            name: "appendAriaLabel",
            label: "appendAriaLabel",
            tsType: null,
            runtimeType: "String",
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.RUNTIME
        },
        {
            name: "active",
            label: "active",
            tsType: null,
            runtimeType: ["Boolean","Object"],
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.RUNTIME
        },
        {
            name: "activeClass",
            label: "activeClass",
            tsType: null,
            runtimeType: "String",
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.RUNTIME
        }
        ],
        events: [
        {
            name: "click:append",
            label: "click:append",
            payloadType: null,
            source: METADATA_SOURCE.RUNTIME
        },
        {
            name: "click:prepend",
            label: "click:prepend",
            payloadType: null,
            source: METADATA_SOURCE.RUNTIME
        },
        {
            name: "update:active",
            label: "update:active",
            payloadType: null,
            source: METADATA_SOURCE.RUNTIME
        },
        {
            name: "update:hover",
            label: "update:hover",
            payloadType: null,
            source: METADATA_SOURCE.RUNTIME
        }
        ],
        slots: [],
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
            tsType: null,
            runtimeType: "Boolean",
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.RUNTIME
        },
        {
            name: "closeIcon",
            label: "closeIcon",
            tsType: null,
            runtimeType: null,
            required: false,
            defaultValue: "mdi:mdi-close-circle-outline",
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.RUNTIME
        },
        {
            name: "closeLabel",
            label: "closeLabel",
            tsType: null,
            runtimeType: "String",
            required: false,
            defaultValue: "origam.close",
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.RUNTIME
        },
        {
            name: "draggable",
            label: "draggable",
            tsType: null,
            runtimeType: "Boolean",
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.RUNTIME
        },
        {
            name: "filter",
            label: "filter",
            tsType: null,
            runtimeType: "Boolean",
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.RUNTIME
        },
        {
            name: "filterIcon",
            label: "filterIcon",
            tsType: null,
            runtimeType: null,
            required: false,
            defaultValue: "mdi:mdi-check",
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.RUNTIME
        },
        {
            name: "label",
            label: "label",
            tsType: null,
            runtimeType: "Boolean",
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.RUNTIME
        },
        {
            name: "link",
            label: "link",
            tsType: null,
            runtimeType: "Boolean",
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.RUNTIME
        },
        {
            name: "pill",
            label: "pill",
            tsType: null,
            runtimeType: "Boolean",
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.RUNTIME
        },
        {
            name: "text",
            label: "text",
            tsType: null,
            runtimeType: "String",
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.RUNTIME
        },
        {
            name: "modelValue",
            label: "modelValue",
            tsType: null,
            runtimeType: "Boolean",
            required: false,
            defaultValue: true,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.RUNTIME
        },
        {
            name: "id",
            label: "id",
            tsType: null,
            runtimeType: "String",
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.RUNTIME
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
            tsType: null,
            runtimeType: "String",
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.RUNTIME
        },
        {
            name: "appendIcon",
            label: "appendIcon",
            tsType: null,
            runtimeType: null,
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.RUNTIME
        },
        {
            name: "prependAvatar",
            label: "prependAvatar",
            tsType: null,
            runtimeType: "String",
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.RUNTIME
        },
        {
            name: "prependIcon",
            label: "prependIcon",
            tsType: null,
            runtimeType: null,
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.RUNTIME
        },
        {
            name: "prependAriaLabel",
            label: "prependAriaLabel",
            tsType: null,
            runtimeType: "String",
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.RUNTIME
        },
        {
            name: "appendAriaLabel",
            label: "appendAriaLabel",
            tsType: null,
            runtimeType: "String",
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.RUNTIME
        },
        {
            name: "tag",
            label: "tag",
            tsType: null,
            runtimeType: "String",
            required: false,
            defaultValue: "span",
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.RUNTIME
        },
        {
            name: "color",
            label: "color",
            tsType: null,
            runtimeType: ["String","Object","Boolean"],
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.RUNTIME
        },
        {
            name: "bgColor",
            label: "bgColor",
            tsType: null,
            runtimeType: ["String","Object","Boolean"],
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.RUNTIME
        },
        {
            name: "ripple",
            label: "ripple",
            tsType: null,
            runtimeType: ["Boolean","Object"],
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.RUNTIME
        },
        {
            name: "border",
            label: "border",
            tsType: null,
            runtimeType: ["Boolean","Number","String","Array"],
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.RUNTIME
        },
        {
            name: "borderTop",
            label: "borderTop",
            tsType: null,
            runtimeType: ["Boolean","Number","String"],
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.RUNTIME
        },
        {
            name: "borderLeft",
            label: "borderLeft",
            tsType: null,
            runtimeType: ["Boolean","Number","String"],
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.RUNTIME
        },
        {
            name: "borderBottom",
            label: "borderBottom",
            tsType: null,
            runtimeType: ["Boolean","Number","String"],
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.RUNTIME
        },
        {
            name: "borderRight",
            label: "borderRight",
            tsType: null,
            runtimeType: ["Boolean","Number","String"],
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.RUNTIME
        },
        {
            name: "borderBlock",
            label: "borderBlock",
            tsType: null,
            runtimeType: ["Boolean","Number","String"],
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.RUNTIME
        },
        {
            name: "borderInline",
            label: "borderInline",
            tsType: null,
            runtimeType: ["Boolean","Number","String"],
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.RUNTIME
        },
        {
            name: "borderInlineStart",
            label: "borderInlineStart",
            tsType: null,
            runtimeType: ["Boolean","Number","String"],
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.RUNTIME
        },
        {
            name: "borderInlineEnd",
            label: "borderInlineEnd",
            tsType: null,
            runtimeType: ["Boolean","Number","String"],
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.RUNTIME
        },
        {
            name: "borderBlockStart",
            label: "borderBlockStart",
            tsType: null,
            runtimeType: ["Boolean","Number","String"],
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.RUNTIME
        },
        {
            name: "borderBlockEnd",
            label: "borderBlockEnd",
            tsType: null,
            runtimeType: ["Boolean","Number","String"],
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.RUNTIME
        },
        {
            name: "borderColor",
            label: "borderColor",
            tsType: null,
            runtimeType: "String",
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.RUNTIME
        },
        {
            name: "borderStyle",
            label: "borderStyle",
            tsType: null,
            runtimeType: "String",
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.RUNTIME
        },
        {
            name: "borderTopColor",
            label: "borderTopColor",
            tsType: null,
            runtimeType: ["String","Object","Boolean"],
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.RUNTIME
        },
        {
            name: "borderRightColor",
            label: "borderRightColor",
            tsType: null,
            runtimeType: ["String","Object","Boolean"],
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.RUNTIME
        },
        {
            name: "borderBottomColor",
            label: "borderBottomColor",
            tsType: null,
            runtimeType: ["String","Object","Boolean"],
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.RUNTIME
        },
        {
            name: "borderLeftColor",
            label: "borderLeftColor",
            tsType: null,
            runtimeType: ["String","Object","Boolean"],
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.RUNTIME
        },
        {
            name: "borderInlineStartColor",
            label: "borderInlineStartColor",
            tsType: null,
            runtimeType: ["String","Object","Boolean"],
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.RUNTIME
        },
        {
            name: "borderInlineEndColor",
            label: "borderInlineEndColor",
            tsType: null,
            runtimeType: ["String","Object","Boolean"],
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.RUNTIME
        },
        {
            name: "borderBlockStartColor",
            label: "borderBlockStartColor",
            tsType: null,
            runtimeType: ["String","Object","Boolean"],
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.RUNTIME
        },
        {
            name: "borderBlockEndColor",
            label: "borderBlockEndColor",
            tsType: null,
            runtimeType: ["String","Object","Boolean"],
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.RUNTIME
        },
        {
            name: "rounded",
            label: "rounded",
            tsType: null,
            runtimeType: ["Boolean","Number","String"],
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.RUNTIME
        },
        {
            name: "roundedTopRight",
            label: "roundedTopRight",
            tsType: null,
            runtimeType: ["Boolean","Number","String"],
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.RUNTIME
        },
        {
            name: "roundedTopLeft",
            label: "roundedTopLeft",
            tsType: null,
            runtimeType: ["Boolean","Number","String"],
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.RUNTIME
        },
        {
            name: "roundedBottomLeft",
            label: "roundedBottomLeft",
            tsType: null,
            runtimeType: ["Boolean","Number","String"],
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.RUNTIME
        },
        {
            name: "roundedBottomRight",
            label: "roundedBottomRight",
            tsType: null,
            runtimeType: ["Boolean","Number","String"],
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.RUNTIME
        },
        {
            name: "roundedStartStart",
            label: "roundedStartStart",
            tsType: null,
            runtimeType: ["Boolean","Number","String"],
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.RUNTIME
        },
        {
            name: "roundedStartEnd",
            label: "roundedStartEnd",
            tsType: null,
            runtimeType: ["Boolean","Number","String"],
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.RUNTIME
        },
        {
            name: "roundedEndStart",
            label: "roundedEndStart",
            tsType: null,
            runtimeType: ["Boolean","Number","String"],
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.RUNTIME
        },
        {
            name: "roundedEndEnd",
            label: "roundedEndEnd",
            tsType: null,
            runtimeType: ["Boolean","Number","String"],
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.RUNTIME
        },
        {
            name: "padding",
            label: "padding",
            tsType: null,
            runtimeType: ["Boolean","Number","String"],
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.RUNTIME
        },
        {
            name: "paddingTop",
            label: "paddingTop",
            tsType: null,
            runtimeType: ["Boolean","Number","String"],
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.RUNTIME
        },
        {
            name: "paddingLeft",
            label: "paddingLeft",
            tsType: null,
            runtimeType: ["Boolean","Number","String"],
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.RUNTIME
        },
        {
            name: "paddingBottom",
            label: "paddingBottom",
            tsType: null,
            runtimeType: ["Boolean","Number","String"],
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.RUNTIME
        },
        {
            name: "paddingRight",
            label: "paddingRight",
            tsType: null,
            runtimeType: ["Boolean","Number","String"],
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.RUNTIME
        },
        {
            name: "paddingBlock",
            label: "paddingBlock",
            tsType: null,
            runtimeType: ["Boolean","Number","String"],
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.RUNTIME
        },
        {
            name: "paddingInline",
            label: "paddingInline",
            tsType: null,
            runtimeType: ["Boolean","Number","String"],
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.RUNTIME
        },
        {
            name: "paddingInlineStart",
            label: "paddingInlineStart",
            tsType: null,
            runtimeType: ["Boolean","Number","String"],
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.RUNTIME
        },
        {
            name: "paddingInlineEnd",
            label: "paddingInlineEnd",
            tsType: null,
            runtimeType: ["Boolean","Number","String"],
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.RUNTIME
        },
        {
            name: "paddingBlockStart",
            label: "paddingBlockStart",
            tsType: null,
            runtimeType: ["Boolean","Number","String"],
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.RUNTIME
        },
        {
            name: "paddingBlockEnd",
            label: "paddingBlockEnd",
            tsType: null,
            runtimeType: ["Boolean","Number","String"],
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.RUNTIME
        },
        {
            name: "margin",
            label: "margin",
            tsType: null,
            runtimeType: ["Boolean","Number","String"],
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.RUNTIME
        },
        {
            name: "marginTop",
            label: "marginTop",
            tsType: null,
            runtimeType: ["Boolean","Number","String"],
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.RUNTIME
        },
        {
            name: "marginLeft",
            label: "marginLeft",
            tsType: null,
            runtimeType: ["Boolean","Number","String"],
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.RUNTIME
        },
        {
            name: "marginBottom",
            label: "marginBottom",
            tsType: null,
            runtimeType: ["Boolean","Number","String"],
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.RUNTIME
        },
        {
            name: "marginRight",
            label: "marginRight",
            tsType: null,
            runtimeType: ["Boolean","Number","String"],
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.RUNTIME
        },
        {
            name: "marginBlock",
            label: "marginBlock",
            tsType: null,
            runtimeType: ["Boolean","Number","String"],
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.RUNTIME
        },
        {
            name: "marginInline",
            label: "marginInline",
            tsType: null,
            runtimeType: ["Boolean","Number","String"],
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.RUNTIME
        },
        {
            name: "marginInlineStart",
            label: "marginInlineStart",
            tsType: null,
            runtimeType: ["Boolean","Number","String"],
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.RUNTIME
        },
        {
            name: "marginInlineEnd",
            label: "marginInlineEnd",
            tsType: null,
            runtimeType: ["Boolean","Number","String"],
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.RUNTIME
        },
        {
            name: "marginBlockStart",
            label: "marginBlockStart",
            tsType: null,
            runtimeType: ["Boolean","Number","String"],
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.RUNTIME
        },
        {
            name: "marginBlockEnd",
            label: "marginBlockEnd",
            tsType: null,
            runtimeType: ["Boolean","Number","String"],
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.RUNTIME
        },
        {
            name: "density",
            label: "density",
            tsType: null,
            runtimeType: null,
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.RUNTIME
        },
        {
            name: "value",
            label: "value",
            tsType: null,
            runtimeType: null,
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.RUNTIME
        },
        {
            name: "disabled",
            label: "disabled",
            tsType: null,
            runtimeType: "Boolean",
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.RUNTIME
        },
        {
            name: "selectedClass",
            label: "selectedClass",
            tsType: null,
            runtimeType: "String",
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.RUNTIME
        },
        {
            name: "href",
            label: "href",
            tsType: null,
            runtimeType: "String",
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.RUNTIME
        },
        {
            name: "replace",
            label: "replace",
            tsType: null,
            runtimeType: "Boolean",
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.RUNTIME
        },
        {
            name: "to",
            label: "to",
            tsType: null,
            runtimeType: null,
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.RUNTIME
        },
        {
            name: "exact",
            label: "exact",
            tsType: null,
            runtimeType: "Boolean",
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.RUNTIME
        },
        {
            name: "size",
            label: "size",
            tsType: null,
            runtimeType: null,
            required: false,
            defaultValue: "default",
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.RUNTIME
        },
        {
            name: "elevation",
            label: "elevation",
            tsType: null,
            runtimeType: ["Number","String"],
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.RUNTIME
        },
        {
            name: "active",
            label: "active",
            tsType: null,
            runtimeType: ["Boolean","Object"],
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.RUNTIME
        },
        {
            name: "activeClass",
            label: "activeClass",
            tsType: null,
            runtimeType: "String",
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.RUNTIME
        },
        {
            name: "hover",
            label: "hover",
            tsType: null,
            runtimeType: ["Boolean","Object"],
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.RUNTIME
        },
        {
            name: "hoverClass",
            label: "hoverClass",
            tsType: null,
            runtimeType: "String",
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.RUNTIME
        },
        {
            name: "fontSize",
            label: "fontSize",
            tsType: null,
            runtimeType: null,
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.RUNTIME
        },
        {
            name: "fontWeight",
            label: "fontWeight",
            tsType: null,
            runtimeType: null,
            required: false,
            hasFactoryDefault: false,
            control: CONTROL_KIND.TEXT,
            source: METADATA_SOURCE.RUNTIME
        }
        ],
        events: [
        {
            name: "update:modelValue",
            label: "update:modelValue",
            payloadType: null,
            source: METADATA_SOURCE.RUNTIME
        },
        {
            name: "click",
            label: "click",
            payloadType: null,
            source: METADATA_SOURCE.RUNTIME
        },
        {
            name: "click:close",
            label: "click:close",
            payloadType: null,
            source: METADATA_SOURCE.RUNTIME
        },
        {
            name: "click:append",
            label: "click:append",
            payloadType: null,
            source: METADATA_SOURCE.RUNTIME
        },
        {
            name: "click:prepend",
            label: "click:prepend",
            payloadType: null,
            source: METADATA_SOURCE.RUNTIME
        },
        {
            name: "group:selected",
            label: "group:selected",
            payloadType: null,
            source: METADATA_SOURCE.RUNTIME
        }
        ],
        slots: [],
        snippets: [],
        requiresParent: false
    }
]
