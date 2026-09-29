import { EMPTY_STATE_PRESET, MDI_ICONS } from '../../enums'
import type { IEmptyStatePresetConfig } from "../../interfaces"
import type { TEmptyStateAlign, TEmptyStatePreset, TEmptyStateSize } from '../../types'

/**
 * Closed list of valid `preset` values for `<OrigamEmptyState>`.
 * Exposed so stories / consumers can iterate the matrix without
 * re-typing the literals.
 */
export const EMPTY_STATE_PRESETS: ReadonlyArray<TEmptyStatePreset> = Object.values(EMPTY_STATE_PRESET)

/**
 * Closed list of valid `size` values.
 */
export const EMPTY_STATE_SIZES: ReadonlyArray<TEmptyStateSize> = [
    'sm',
    'md',
    'lg'
]

/**
 * Closed list of valid `align` values.
 */
export const EMPTY_STATE_ALIGNS: ReadonlyArray<TEmptyStateAlign> = [
    'center',
    'left'
]

export const EMPTY_STATE_PRESET_CONFIG: Record<TEmptyStatePreset, IEmptyStatePresetConfig> = {
    [EMPTY_STATE_PRESET.NO_DATA]: {
        icon: MDI_ICONS.DATABASE_OFF_OUTLINE,
        intent: 'neutral'
    },
    [EMPTY_STATE_PRESET.NO_RESULTS]: {
        icon: MDI_ICONS.MAGNIFY_CLOSE,
        intent: 'neutral'
    },
    [EMPTY_STATE_PRESET.ERROR]: {
        icon: MDI_ICONS.ALERT_CIRCLE_OUTLINE,
        intent: 'danger'
    },
    [EMPTY_STATE_PRESET.OFFLINE]: {
        icon: MDI_ICONS.WIFI_OFF,
        intent: 'warning'
    },
    [EMPTY_STATE_PRESET.LOCKED]: {
        icon: MDI_ICONS.LOCK_OUTLINE,
        intent: 'secondary'
    }
}
