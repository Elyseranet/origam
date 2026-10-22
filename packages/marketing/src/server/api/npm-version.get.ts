import { EXTERNAL_CACHE_TTL_SECONDS } from '../../consts/cache.const'
import { NPM_REGISTRY_DIST_TAGS_URL } from '../../consts/adoption.const'
import type { INpmDistTagsResponse, INpmVersionData } from '../../interfaces/version.interface'

export default defineCachedEventHandler(
  async (event): Promise<INpmVersionData> => {
    const fallback = useRuntimeConfig(event).public.npmVersion as string

    try {
      const data = await $fetch<INpmDistTagsResponse>(NPM_REGISTRY_DIST_TAGS_URL, {
        headers: {
          Accept: 'application/json',
          'User-Agent': 'origam-marketing/1.0'
        }
      })

      return {
        version: data.latest ?? fallback
      }
    } catch {
      return {
        version: fallback
      }
    }
  },
  {
    maxAge: EXTERNAL_CACHE_TTL_SECONDS,
    name: 'npm-version',
    getKey: () => 'npm-version'
  }
)
