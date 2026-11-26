import { ROUNDED } from '@origam/enums'
import type { IOptions } from '@origam/interfaces'
import type { TRounded } from '@origam/types'

export const roundedList: Array<IOptions<TRounded | boolean | string>> = [
    // ── Off / boolean ───────────────────────────────────────────
    { label: 'No Rounded', value: false },
    { label: 'Rounded (legacy boolean)', value: true },

    // ── Named variants (token-driven, theme-aware) ──────────────
    { label: 'x-small (radius.xs / 2px)', value: ROUNDED.X_SMALL },
    { label: 'small (radius.sm / 4px)', value: ROUNDED.SMALL },
    { label: 'default (radius.md / 10px)', value: ROUNDED.DEFAULT },
    { label: 'medium (radius.lg / 12px)', value: ROUNDED.MEDIUM },
    { label: 'large (radius.xl / 16px)', value: ROUNDED.LARGE },
    { label: 'x-large (radius.2xl / 24px)', value: ROUNDED.X_LARGE },

    // ── Asymmetric / diagonal ───────────────────────────────────
    { label: 'Shaped (TL + BR rounded, diagonal)', value: ROUNDED.SHAPED },
    { label: 'Shaped Invert (TR + BL rounded, diagonal)', value: ROUNDED.SHAPED_INVERT },

    // ── Free-form CSS escape hatches ────────────────────────────
    { label: 'Circled (9999px)', value: '9999px' },
    { label: 'Right Rounded', value: '0 4px 0 4px' },
    { label: 'Left Rounded', value: '4px 0 4px 0' },
    { label: 'Top Rounded', value: '4px 4px 0 0' },
    { label: 'Bottom Rounded', value: '0 0 4px 4px' },
]
