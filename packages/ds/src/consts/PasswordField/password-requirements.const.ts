import type { IPasswordRequirement } from '../../interfaces'

/**
 * `DEFAULT_PASSWORD_REQUIREMENTS` — used when the consumer passes
 * `requirements: true` to `<OrigamPasswordField>` (no explicit array).
 *
 * Mirrors the legacy `need*` flag set but exposed as composable
 * predicates so the new inline checklist UI can iterate them
 * generically.
 *
 * Intentionally not localised here — labels are picked up via the
 * `t()` helper at render time when consumers want i18n. The defaults
 * carry English strings so a bare `requirements: true` still renders
 * something sensible.
 *
 * Co-located with the rest of the project's constants (`src/consts/`)
 * per the global CLAUDE.md "Constants ONLY in `src/consts/`" rule.
 */
export const DEFAULT_PASSWORD_REQUIREMENTS: IPasswordRequirement[] = [
    {
        id: 'min-length',
        label: 'At least 8 characters',
        test: (v: string) => (v ?? '').length >= 8
    },
    {
        id: 'uppercase',
        label: 'At least 1 uppercase letter',
        test: (v: string) => /[A-Z]/.test(v ?? '')
    },
    {
        id: 'number',
        label: 'At least 1 number',
        test: (v: string) => /\d/.test(v ?? '')
    },
    {
        id: 'special',
        label: 'At least 1 special character',
        test: (v: string) => /[^A-Za-z0-9]/.test(v ?? '')
    }
]
