import { blockScrollStrategy, closeScrollStrategy, repositionScrollStrategy } from '../../utils'

export const SCROLL_STRATEGIES = {
    none: null,
    close: closeScrollStrategy,
    block: blockScrollStrategy,
    reposition: repositionScrollStrategy
}
