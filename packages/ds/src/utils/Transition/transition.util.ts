import { getTargetBox, nullifyTransforms } from '../../utils'

/** Animatable children (card, sheet, list) */
export function getChildren (el: Element) {
    const els = el.querySelector(':scope > .origam-card, :scope > .origam-sheet, :scope > .origam-list')?.children
    return els && [...els]
}

/**
 * Get dimensions.
 *
 * @param target …
 * @param el     …
 */
export function getDimensions (target: HTMLElement | [x: number, y: number], el: HTMLElement) {
    const targetBox = getTargetBox(target)
    const elBox = nullifyTransforms(el)
    const [originX, originY] = getComputedStyle(el).transformOrigin.split(' ').map(v => parseFloat(v))

    const [anchorSide, anchorOffset] = getComputedStyle(el).getPropertyValue('--origam-overlay-anchor-origin').split(' ')

    let offsetX = targetBox.left + targetBox.width / 2
    if (anchorSide === 'left' || anchorOffset === 'left') {
        offsetX -= targetBox.width / 2
    } else if (anchorSide === 'right' || anchorOffset === 'right') {
        offsetX += targetBox.width / 2
    }

    let offsetY = targetBox.top + targetBox.height / 2
    if (anchorSide === 'top' || anchorOffset === 'top') {
        offsetY -= targetBox.height / 2
    } else if (anchorSide === 'bottom' || anchorOffset === 'bottom') {
        offsetY += targetBox.height / 2
    }

    const tsx = targetBox.width / elBox.width
    const tsy = targetBox.height / elBox.height
    const maxs = Math.max(1, tsx, tsy)
    const sx = tsx / maxs || 0
    const sy = tsy / maxs || 0

    // Animate elements larger than 12% of the screen area up to 1.5x slower
    const asa = (elBox.width * elBox.height) / (window.innerWidth * window.innerHeight)
    const speed = asa > 0.12
        ? Math.min(1.5, (asa - 0.12) * 10 + 1)
        : 1

    return {
        x: offsetX - (originX + elBox.left),
        y: offsetY - (originY + elBox.top),
        sx,
        sy,
        speed
    }
}
