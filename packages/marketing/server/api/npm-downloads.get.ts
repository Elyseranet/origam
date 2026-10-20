import { EXTERNAL_CACHE_TTL_SECONDS } from '../consts/cache.const'
import { NPM_DOWNLOADS_WEEK_URL } from '../consts/adoption.const'
import type { INpmDownloadsPointResponse, INpmDownloadsResponse } from '../interfaces/adoption.interface'

export default defineCachedEventHandler(
  async (): Promise<INpmDownloadsResponse> => {
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
