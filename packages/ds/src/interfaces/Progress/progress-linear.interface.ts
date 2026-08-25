import type { ICommonsComponentEmits } from '../Commons/commons.interface'
import type { ILocationProps } from '../Commons/location.interface'
import type { IProgressTypeProps } from './progress.interface'
import type { IRoundedProps } from '../Commons/rounded.interface'

export interface IProgressLinearProps extends IProgressTypeProps, IRoundedProps, ILocationProps {
    bufferValue?: number | string
    clickable?: boolean
    reverse?: boolean
    stream?: boolean
}

/**
 * `<OrigamProgressLinear>` genuinely emits `update:modelValue` — when
 * `clickable` is set, `handleClick` maps the click position to a value
 * and assigns `progress.value = ...`, which drives `useVModel`'s setter
 * (`vm.emit('update:modelValue', newValue)`) on this component's own
 * instance. Not a fantom emit — it fires under real user interaction.
 */
export interface IProgressLinearEmits extends ICommonsComponentEmits {}

/** Slot signatures for `<OrigamProgressLinear>`. */
export interface IProgressLinearSlots {
    default?: (data: { value: number, buffer: number }) => any
}
