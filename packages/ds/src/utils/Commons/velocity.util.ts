import type { ISample } from "../../interfaces"

/**
 * Calculate impulse velocity.
 *
 * @param samples …
 */
export function calculateImpulseVelocity (samples: Array<ISample>) {
    // The input should be in reversed time order (most recent sample at index i=0)
    if (samples.length < 2) {
        // if 0 or 1 points, velocity is zero
        return 0
    }
    // if (samples[1].t > samples[0].t) {
    //   // Algorithm will still work, but not perfectly
    //   consoleWarn('Samples provided to calculateImpulseVelocity in the wrong order')
    // }
    if (samples.length === 2) {
        // if 2 points, basic linear calculation
        if (samples[1].t === samples[0].t) {
            // consoleWarn(`Events have identical time stamps t=${samples[0].t}, setting velocity = 0`)
            return 0
        }
        return (samples[1].d - samples[0].d) / (samples[1].t - samples[0].t)
    }
    // Guaranteed to have at least 3 points here
    // start with the oldest sample and go forward in time
    let work = 0
    for (let i = samples.length - 1; i > 0; i--) {
        if (samples[i].t === samples[i - 1].t) {
            // consoleWarn(`Events have identical time stamps t=${samples[i].t}, skipping sample`)
            continue
        }
        const vprev = kineticEnergyToVelocity(work) // v[i-1]
        const vcurr = (samples[i].d - samples[i - 1].d) / (samples[i].t - samples[i - 1].t) // v[i]
        work += (vcurr - vprev) * Math.abs(vcurr)
        if (i === samples.length - 1) {
            work *= 0.5
        }
    }
    return kineticEnergyToVelocity(work) * 1000
}

/**
 * Kinetic energy to velocity.
 *
 * @param work …
 */
export function kineticEnergyToVelocity (work: number) {
    const sqrt2 = 1.41421356237
    return (work < 0 ? -1.0 : 1.0) * Math.sqrt(Math.abs(work)) * sqrt2
}
