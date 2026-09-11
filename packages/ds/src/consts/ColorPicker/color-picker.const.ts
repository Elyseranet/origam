import type { IColorPickerMode } from "../../interfaces"

import type { THSLA, TRGBA } from "../../types"

import { HexToHSV, HSLtoHSV, HSVtoHex, HSVtoHSL, HSVtoRGB, RGBtoHSV } from "../../utils"

export const COLOR_NULL = {h: 0, s: 0, v: 0, a: 1}

const COLOR_PICKER_MODE_RGBA: IColorPickerMode = {
    inputProps: {
        type: 'number',
        min: 0
    },
    inputs: [
        {
            label: 'R',
            max: 255,
            step: 1,
            getValue: (c: TRGBA) => Math.round(c.r),
            getColor: (c: TRGBA, v: string): TRGBA => ({...c, r: Number(v)})
        },
        {
            label: 'G',
            max: 255,
            step: 1,
            getValue: (c: TRGBA) => Math.round(c.g),
            getColor: (c: TRGBA, v: string): TRGBA => ({...c, g: Number(v)})
        },
        {
            label: 'B',
            max: 255,
            step: 1,
            getValue: (c: TRGBA) => Math.round(c.b),
            getColor: (c: TRGBA, v: string): TRGBA => ({...c, b: Number(v)})
        },
        {
            label: 'A',
            max: 1,
            step: 0.01,
            getValue: ({a}: TRGBA) => a != null ? Math.round(a * 100) / 100 : 1,
            getColor: (c: TRGBA, v: string): TRGBA => ({...c, a: Number(v)})
        }
    ],
    to: HSVtoRGB,
    from: RGBtoHSV
}

const COLOR_PICKER_MODE_RGB: IColorPickerMode = {
    ...COLOR_PICKER_MODE_RGBA,
    inputs: COLOR_PICKER_MODE_RGBA.inputs?.slice(0, 3)
}

const COLOR_PICKER_MODE_HSLA: IColorPickerMode = {
    inputProps: {
        type: 'number',
        min: 0
    },
    inputs: [
        {
            label: 'H',
            max: 360,
            step: 1,
            getValue: (c: THSLA) => Math.round(c.h),
            getColor: (c: THSLA, v: string): THSLA => ({...c, h: Number(v)})
        },
        {
            label: 'S',
            max: 1,
            step: 0.01,
            getValue: (c: THSLA) => Math.round(c.s * 100) / 100,
            getColor: (c: THSLA, v: string): THSLA => ({...c, s: Number(v)})
        },
        {
            label: 'L',
            max: 1,
            step: 0.01,
            getValue: (c: THSLA) => Math.round(c.l * 100) / 100,
            getColor: (c: THSLA, v: string): THSLA => ({...c, l: Number(v)})
        },
        {
            label: 'A',
            max: 1,
            step: 0.01,
            getValue: ({a}: THSLA) => a != null ? Math.round(a * 100) / 100 : 1,
            getColor: (c: THSLA, v: string): THSLA => ({...c, a: Number(v)})
        }
    ],
    to: HSVtoHSL,
    from: HSLtoHSV
}

const COLOR_PICKER_MODE_HSL: IColorPickerMode = {
    ...COLOR_PICKER_MODE_HSLA,
    inputs: COLOR_PICKER_MODE_HSLA.inputs.slice(0, 3)
}

const COLOR_PICKER_MODE_HEXA: IColorPickerMode = {
    inputProps: {
        type: 'text'
    },
    inputs: [
        {
            label: 'HEXA',
            getValue: (c: string) => c,
            getColor: (_c: string, v: string) => v
        }
    ],
    to: HSVtoHex,
    from: HexToHSV
}

const COLOR_PICKER_MODE_HEX = {
    ...COLOR_PICKER_MODE_HEXA,
    inputs: [
        {
            label: 'HEX',
            getValue: (c: string) => c.slice(0, 7),
            getColor: (_c: string, v: string) => v
        }
    ]
}

export const COLOR_PICKER_MODES = {
    rgb: COLOR_PICKER_MODE_RGB,
    rgba: COLOR_PICKER_MODE_RGBA,
    hsl: COLOR_PICKER_MODE_HSL,
    hsla: COLOR_PICKER_MODE_HSLA,
    hex: COLOR_PICKER_MODE_HEX,
    hexa: COLOR_PICKER_MODE_HEXA
} satisfies Record<string, IColorPickerMode>
