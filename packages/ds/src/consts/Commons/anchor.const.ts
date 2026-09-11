import { BLOCK, INLINE, START_END } from '../../enums'

import type { TBlock, TBlockStartEnd, TDirectionBoth, TInline, TInlineStartEnd } from '../../types'

export const BLOCK_ARRAY: Array<TBlock> = [BLOCK.TOP, BLOCK.BOTTOM]
export const INLINE_ARRAY: Array<TInline> = [INLINE.LEFT, INLINE.RIGHT]
export const BLOCK_START_END_ARRAY: Array<TBlockStartEnd> = [...BLOCK_ARRAY, START_END.START, START_END.END]
export const INLINE_START_END_ARRAY: Array<TInlineStartEnd> = [...INLINE_ARRAY, START_END.START, START_END.END]
export const DIRECTION_ARRAY: Array<TDirectionBoth> = [BLOCK.TOP, BLOCK.BOTTOM, INLINE.LEFT, INLINE.RIGHT]
