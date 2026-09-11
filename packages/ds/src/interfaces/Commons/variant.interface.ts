import type { TVariant, TVariantInput } from '../../types'

/**
 * Mixin props for components that expose a visual variant. The union accepts
 * both action-style variants (`text/flat/elevated/tonal/outlined/plain`) and
 * input-style variants (`solo/filled/underlined/...`) so a single prop type
 * fits every consumer.
 */
export interface IVariantProps {
    variant?: TVariant | TVariantInput
}
