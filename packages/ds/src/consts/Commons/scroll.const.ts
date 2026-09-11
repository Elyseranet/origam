import { blockScrollStrategy, closeScrollStrategy, repositionScrollStrategy } from '../../utils/Commons/scroll.util'

export const SCROLL_STRATEGIES = {
    none: null,
    close: closeScrollStrategy,
    block: blockScrollStrategy,
    reposition: repositionScrollStrategy
}
