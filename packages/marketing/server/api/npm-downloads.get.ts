import { EXTERNAL_CACHE_TTL_SECONDS } from '../../src/consts/cache.const'
import { NPM_DOWNLOADS_WEEK_URL } from '../../src/consts/adoption.const'
import type { INpmDownloadsData, INpmDownloadsPointResponse } from '../../src/interfaces/npm-downloads.interface'

export default defineCachedEventHandler(
  async (): Promise<INpmDownloadsData> => {
    try {
      const data = await $fetch<INpmDownloadsPointResponse>(NPM_DOWNLOADS_WEEK_URL, {
        headers: {
          Accept: 'application/json',
          'User-Agent': 'origam-marketing/1.0'
        }
      })

      return { downloads: data.downloads ?? null }
    } catch {
      // Jamais un 0 inventé : l'UI masque le compteur quand la valeur est null.
      return { downloads: null }
    }
  },
  {
    maxAge: EXTERNAL_CACHE_TTL_SECONDS,
    name: 'npm-downloads',
    getKey: () => 'npm-downloads'
  }
)
