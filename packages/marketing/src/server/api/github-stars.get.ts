import { EXTERNAL_CACHE_TTL_SECONDS } from '../../consts/cache.const'
import { GITHUB_REPO_API_URL } from '../../consts/adoption.const'
import type { IGithubRepoResponse, IGithubStarsData } from '../../interfaces/github.interface'

export default defineCachedEventHandler(
  async (): Promise<IGithubStarsData> => {
    try {
      const data = await $fetch<IGithubRepoResponse>(GITHUB_REPO_API_URL, {
        headers: {
          'Accept': 'application/vnd.github+json',
          'User-Agent': 'origam-marketing/1.0'
        }
      })

      return { stars: data.stargazers_count ?? null }
    } catch {
      // Jamais un 0 inventé : l'UI masque le compteur quand la valeur est null.
      return { stars: null }
    }
  },
  {
    maxAge: EXTERNAL_CACHE_TTL_SECONDS,
    name: 'github-stars',
    getKey: () => 'github-stars'
  }
)
