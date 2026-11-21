import { EMPTY_STATE_PRESET } from '../../enums/EmptyState/empty-state.enum'
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
        icon: 'mdi:mdi-database-off-outline',
        intent: 'neutral'
    },
    [EMPTY_STATE_PRESET.NO_RESULTS]: {
        icon: 'mdi:mdi-magnify-close',
        intent: 'neutral'
    },
    [EMPTY_STATE_PRESET.ERROR]: {
        icon: 'mdi:mdi-alert-circle-outline',
        intent: 'danger'
    },
    [EMPTY_STATE_PRESET.OFFLINE]: {
        icon: 'mdi:mdi-wifi-off',
        intent: 'warning'
    },
    [EMPTY_STATE_PRESET.LOCKED]: {
        icon: 'mdi:mdi-lock-outline',
        intent: 'secondary'
    }
}
