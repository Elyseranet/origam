/*********************************************************
 * useThrottleFn
 ********************************************************/
export function useThrottleFn<T extends any[], R = void> (fn: (...args: T) => R, wait: number): (...args: T) => void {
    let timer: ReturnType<typeof setTimeout> | null = null
    return (...args: T) => {
        if (!timer) {
            fn(...args)
            timer = setTimeout(() => {
                clearTimeout(timer!)
                timer = null
            }, wait)
        }
    }
}
