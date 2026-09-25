import type { TProbeIdentity, TProbeMode, TProbeSurface } from './probe-matrix.type'

export interface IProbeConfig {
    identity: TProbeIdentity
    mode: TProbeMode
    /**
     * Which probe surface to mount. Omitted (the historical shape) mounts the
     * text-contrast surface `why-origam-contrast.audit.mjs` measures, so that
     * audit is untouched by #924's addition.
     */
    surface?: TProbeSurface
}
