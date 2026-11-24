/**
 * Calculate updated target.
 *
 * @param options …
 * @returns …
 */
export function calculateUpdatedTarget ({selectedElement, containerElement, isRtl, isHorizontal}: {
    selectedElement: HTMLElement
    containerElement: HTMLElement
    isRtl: boolean
    isHorizontal: boolean
}): number {
    const containerSize = getOffsetSize(isHorizontal, containerElement)
    const scrollPosition = getScrollPosition(isHorizontal, isRtl, containerElement)

    const childrenSize = getOffsetSize(isHorizontal, selectedElement)
    const childrenStartPosition = getOffsetPosition(isHorizontal, selectedElement)

    const additionalOffset = childrenSize * 0.4

    if (scrollPosition > childrenStartPosition) {
        return childrenStartPosition - additionalOffset
    } else if (scrollPosition + containerSize < childrenStartPosition + childrenSize) {
        return childrenStartPosition - containerSize + childrenSize + additionalOffset
    }

    return scrollPosition
}

/**
 * Calculate centered target.
 *
 * @param options …
 * @returns …
 */
export function calculateCenteredTarget ({selectedElement, containerElement, isHorizontal}: {
    selectedElement: HTMLElement
    containerElement: HTMLElement
    isHorizontal: boolean
}): number {
    const containerOffsetSize = getOffsetSize(isHorizontal, containerElement)
    const childrenOffsetPosition = getOffsetPosition(isHorizontal, selectedElement)
    const childrenOffsetSize = getOffsetSize(isHorizontal, selectedElement)

    return childrenOffsetPosition - (containerOffsetSize / 2) + (childrenOffsetSize / 2)
}

/**
 * Get scroll size.
 *
 * @param isHorizontal …
 * @param element      …
 */
export function getScrollSize (isHorizontal: boolean, element?: HTMLElement) {
    const key = isHorizontal ? 'scrollWidth' : 'scrollHeight'
    return element?.[key] ?? 0
}

/**
 * Get client size.
 *
 * @param isHorizontal …
 * @param element      …
 */
export function getClientSize (isHorizontal: boolean, element?: HTMLElement) {
    const key = isHorizontal ? 'clientWidth' : 'clientHeight'
    return element?.[key] ?? 0
}

/**
 * Get scroll position.
 *
 * @param isHorizontal …
 * @param isRtl        …
 * @param element      …
 */
export function getScrollPosition (isHorizontal: boolean, isRtl: boolean, element?: HTMLElement) {
    if (!element) {
        return 0
    }

    const {
        scrollLeft,
        offsetWidth,
        scrollWidth
    } = element

    if (isHorizontal) {
        return isRtl
            ? scrollWidth - offsetWidth + scrollLeft
            : scrollLeft
    }

    return element.scrollTop
}

/**
 * Get offset size.
 *
 * @param isHorizontal …
 * @param element      …
 */
export function getOffsetSize (isHorizontal: boolean, element?: HTMLElement) {
    const key = isHorizontal ? 'offsetWidth' : 'offsetHeight'
    return element?.[key] ?? 0
}

/**
 * Get offset position.
 *
 * @param isHorizontal …
 * @param element      …
 */
export function getOffsetPosition (isHorizontal: boolean, element?: HTMLElement) {
    const key = isHorizontal ? 'offsetLeft' : 'offsetTop'
    return element?.[key] ?? 0
}
