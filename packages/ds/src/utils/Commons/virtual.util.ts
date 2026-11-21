/**
 * Binary closest.
 *
 * @param arr …
 * @param val …
 */
export function binaryClosest (arr: ArrayLike<number>, val: number) {
    let high = arr.length - 1
    let low = 0
    let mid = 0
    let item = null
    let target = -1

    if (arr[high] < val) {
        return high
    }

    while (low <= high) {
        mid = (low + high) >> 1
        item = arr[mid]!

        if (item > val) {
            high = mid - 1
        } else if (item < val) {
            target = mid
            low = mid + 1
        } else if (item === val) {
            return mid
        } else {
            return low
        }
    }

    return target
}
