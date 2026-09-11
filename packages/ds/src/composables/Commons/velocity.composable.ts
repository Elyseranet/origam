import { HISTORY, HORIZON } from '../../consts'
import type { ISample } from "../../interfaces"

import { CircularBuffer } from '../../services'

import { calculateImpulseVelocity, oops } from '../../utils'

/*********************************************************
 * useVelocity
 ********************************************************/
export function useVelocity () {
    const touches: Record<number, CircularBuffer<[number, Touch]> | undefined> = {}

    function addMovement (e: TouchEvent) {
        Array.from(e.changedTouches).forEach(touch => {
            const samples = touches[touch.identifier] ?? (touches[touch.identifier] = new CircularBuffer(HISTORY))
            samples.push([e.timeStamp, touch])
        })
    }

    function endTouch (e: TouchEvent) {
        Array.from(e.changedTouches).forEach(touch => {
            delete touches[touch.identifier]
        })
    }

    function getVelocity (id: number) {
        const samples = touches[id]?.values().reverse()

        if (!samples) {
            throw new Error(`No samples for touch id ${id}`)
        }

        const newest = samples[0]
        const x: Array<ISample> = []
        const y: Array<ISample> = []
        for (const val of samples) {
            if (newest[0] - val[0] > HORIZON) break

            x.push({t: val[0], d: val[1].clientX})
            y.push({t: val[0], d: val[1].clientY})
        }

        return {
            x: calculateImpulseVelocity(x),
            y: calculateImpulseVelocity(y),
            get direction () {
                const {x, y} = this
                const [absX, absY] = [Math.abs(x), Math.abs(y)]

                return absX > absY && x >= 0 ? 'right'
                    : absX > absY && x <= 0 ? 'left'
                        : absY > absX && y >= 0 ? 'down'
                            : absY > absX && y <= 0 ? 'up'
                                : oops()
            }
        }
    }

    return {addMovement, endTouch, getVelocity}
}
