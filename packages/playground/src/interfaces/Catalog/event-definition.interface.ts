import type { METADATA_SOURCE } from '../../enums/Commons/metadata-source.enum'

/*********************************************************
 * IEventDefinition
 *
 * @description
 * One emit a component declares. 410 across the catalogue, measured on
 * `develop` @ bcb9dc909.
 *
 * @description
 * ⛔ The runtime descriptor is NOT a sufficient source here, which is why
 * `source` exists on this interface too. `Component.emits` gives names when
 * the component declares them, but the PAYLOAD type only comes from
 * `vue-component-meta` — `defineEmits<{ (e: 'update', v: string): void }>()`
 * leaves no payload information at runtime. A playground that logs emits
 * needs the name; one that shows what was emitted needs the type.
 ********************************************************/
export interface IEventDefinition {
    /**
     * The emit name as declared — `update:modelValue`, not `onUpdateModelValue`.
     * This is what a `@`-binding in a template listens to.
     */
    name: string
    /** Human-facing label. Defaults to `name`. */
    label: string
    /**
     * The payload signature as the TypeScript printer renders it, e.g.
     * `[value: string]`. `null` when no payload type could be resolved.
     */
    payloadType: string | null
    /** JSDoc text from the emits declaration, when present. */
    description?: string
    /** Which stage established this entry. */
    source: METADATA_SOURCE
}
