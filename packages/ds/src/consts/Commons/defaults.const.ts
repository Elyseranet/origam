import type { InjectionKey, Ref } from 'vue'
import type { IDefault } from '../../interfaces'

/**
 * Provide/inject key for the defaults map shared between
 * `<OrigamDefaultsProvider>` and components consuming defaults
 * via `useDefaults()`.
 *
 * The key is a global symbol so multiple bundles of origam (e.g. host
 * app + library installed twice) interoperate over the same provider.
 */
export const ORIGAM_DEFAULTS_KEY: InjectionKey<Ref<IDefault>> = Symbol.for('origam:defaults')
