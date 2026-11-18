/**
 * doc-merge.const.ts — static tables of the doc merge / serialize pipeline (scripts/merge.mjs, scripts/serialize.mjs).
 */

export const EMPTY = ''

export const DOC_TYPE = {
    enum: 'IEnumDoc',
    interface: 'IInterfaceDoc',
    const: 'IConstDoc',
    util: 'IUtilDoc',
}

export const DOC_SUFFIX = {
    enum: 'ENUM_DOC',
    interface: 'INTERFACE_DOC',
    const: 'CONST_DOC',
    util: 'UTIL_DOC',
}

export const IMPORT_PATH = {
    enum: "~/interfaces/enums-catalog.interface",
    interface: "~/interfaces/interfaces-catalog.interface",
    const: "~/interfaces/consts-catalog.interface",
    util: "~/interfaces/utils-catalog.interface",
}
