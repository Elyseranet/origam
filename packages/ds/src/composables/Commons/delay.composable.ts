import type { IDelayProps } from '../../interfaces'
import { defer } from '../../utils'

/*********************************************************
 * useDelay
 ********************************************************/
export function useDelay (props: IDelayProps, cb?: (value: boolean) => void) {
    const cancelRef: { current: (() => void) } = { current: () => {} }

    const runDelay = (isOpening: boolean) => {
        cancelRef.current()

        const delay = Number(isOpening ? props.openDelay : props.closeDelay)

        return new Promise(resolve => {
            cancelRef.current = defer(delay, () => {
                cb?.(isOpening)
                resolve(isOpening)
            })
        })
    }

    const runOpenDelay = () => {
        return runDelay(true)
    }

    const runCloseDelay = () => {
        return runDelay(false)
    }

    const clearDelay = () => {
        cancelRef.current()
    }

    return {
        clearDelay,
        runOpenDelay,
        runCloseDelay
    }
}
