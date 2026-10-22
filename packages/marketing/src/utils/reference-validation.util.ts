/**
 * reference-validation.ts — input validators shared by all /api/reference handlers.
 *
 * Both helpers throw createError (h3 auto-import) so Nitro surfaces a clean 4xx
 * to the caller without leaking internal details. The validation rules are:
 *   - :kind  must be one of the 8 values in DOC_KINDS (single source of truth)
 *   - :slug  must match strict kebab-case (a-z, 0-9, hyphens, no leading/trailing)
 */

import { DOC_KINDS } from '../consts/db.const'

/** Kebab-case: one or more lowercase-alnum groups joined by single hyphens. */
const SLUG_RE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/

/**
 * Throws 400 when `kind` is not one of the 8 documented entity families.
 * DOC_KINDS is the single source of truth — no magic string in handlers.
 */
export function assertKind (kind: string): void {
    if (!(DOC_KINDS as ReadonlyArray<string>).includes(kind)) {
        throw createError({
            statusCode: 400,
            statusMessage: `Invalid kind '${kind}'. Valid values: ${(DOC_KINDS as ReadonlyArray<string>).join(', ')}`,
        })
    }
}

/**
 * Throws 400 when `slug` does not match kebab-case.
 * Prevents injection and ensures the value is a safe URL segment.
 */
export function assertSlug (slug: string): void {
    if (!SLUG_RE.test(slug)) {
        throw createError({
            statusCode: 400,
            statusMessage: `Invalid slug '${slug}'. Expected kebab-case (a-z, 0-9, hyphens; no leading or trailing hyphen).`,
        })
    }
}
