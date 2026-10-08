import type {
    TVariant,
    TVariantInput
} from '../../types/Commons/variant.type'

/**
 * Mixin props for ACTION-style surfaces (Btn, BtnGroup, BtnToggle…) — the
 * `VARIANT` enum taxonomy (`text/flat/elevated/tonal/outlined/plain/ghost`).
 *
 * Split from the former single `IVariantProps` (#1050 / ADR-005 follow-up):
 * that mixin's union accepted BOTH this family's 7 values AND the input
 * family's 5, so every one of the 14 consumers silently accepted 3-5 values
 * it never implements (`underlined`/`filled`/`solo` here). Each family now
 * only names the vocabulary it actually renders.
 */
export interface IActionVariantProps {
    variant?: TVariant
}

/**
 * Mixin props for INPUT-style surfaces (Field and its descendants,
 * ConfirmWrapper) — the `VARIANT_INPUT` enum taxonomy
 * (`underlined/filled/solo/outlined/plain`).
 *
 * See `IActionVariantProps` above for why this was split out.
 */
export interface IInputVariantProps {
    variant?: TVariantInput
}
