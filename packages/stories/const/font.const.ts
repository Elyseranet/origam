import type { IOptions } from '@origam/interfaces'
import type { TFontFamily, TFontSize, TFontStyle, TFontWeight, TLetterSpacing, TLineHeight } from '@origam/types'

export const fontFamilyList: Array<IOptions<TFontFamily>> = [
    { label: '(none)', value: undefined },
    { label: 'Sans', value: 'sans' },
    { label: 'Mono', value: 'mono' },
    { label: 'Serif', value: 'serif' }
]

export const fontSizeList: Array<IOptions<TFontSize>> = [
    { label: '(none)', value: undefined },
    { label: 'xs (0.625rem)', value: 'xs' },
    { label: 'sm (0.75rem)', value: 'sm' },
    { label: 'md (0.875rem)', value: 'md' },
    { label: 'lg (1rem)', value: 'lg' },
    { label: 'xl (1.125rem)', value: 'xl' },
    { label: '2xl (1.25rem)', value: '2xl' },
    { label: '3xl (1.5rem)', value: '3xl' },
    { label: '4xl (1.875rem)', value: '4xl' },
    { label: '5xl (2.25rem)', value: '5xl' }
]

export const fontStyleList: Array<IOptions<TFontStyle>> = [
    { label: '(none)', value: undefined },
    { label: 'Normal', value: 'normal' },
    { label: 'Italic', value: 'italic' },
    { label: 'Oblique', value: 'oblique' }
]

export const fontWeightList: Array<IOptions<TFontWeight>> = [
    { label: '(none)', value: undefined },
    { label: 'Regular 400', value: 'regular' },
    { label: 'Medium 500', value: 'medium' },
    { label: 'Semibold 600', value: 'semibold' },
    { label: 'Bold 700', value: 'bold' },
    { label: 'Extrabold 800', value: 'extrabold' },
    { label: 'Black 900', value: 'black' }
]

export const lineHeightList: Array<IOptions<TLineHeight>> = [
    { label: '(none)', value: undefined },
    { label: 'none (1)', value: 'none' },
    { label: 'tight (1.25)', value: 'tight' },
    { label: 'snug (1.375)', value: 'snug' },
    { label: 'normal (1.5)', value: 'normal' },
    { label: 'relaxed (1.625)', value: 'relaxed' },
    { label: 'loose (2)', value: 'loose' }
]

export const letterSpacingList: Array<IOptions<TLetterSpacing>> = [
    { label: '(none)', value: undefined },
    { label: 'tight (-0.025em)', value: 'tight' },
    { label: 'normal (0em)', value: 'normal' },
    { label: 'wide (0.0094em)', value: 'wide' },
    { label: 'wider (0.0125em)', value: 'wider' },
    { label: 'widest (0.0893em)', value: 'widest' }
]
