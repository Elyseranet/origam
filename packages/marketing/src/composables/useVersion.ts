import { computed } from 'vue'
import type { INpmVersionData } from '~/interfaces/version.interface'

/**
 * Single source of truth for the displayed origam version.
 *
 * Fetches the live npm registry via /api/npm-version (Nitro route, TTL 1h,
 * cached server-side) and falls back to the build-time value from
 * runtimeConfig when the registry is unreachable (offline, CI headless,
 * rate-limit).  Components pull it from here so a release only requires
 * bumping the DS package version — never a manual edit of a badge string or
 * a translation.
 */
export function useVersion () {
  const buildVersion = useRuntimeConfig().public.npmVersion as string

  const { data } = useFetch<INpmVersionData>('/api/npm-version', {
    default: () => ({ version: buildVersion })
  })

  const version = computed(() => data.value?.version ?? buildVersion)
  const versionTag = computed(() => `v${version.value}`)

  return { version, versionTag }
}
