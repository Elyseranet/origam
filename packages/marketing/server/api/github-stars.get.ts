const GITHUB_API_URL = 'https://api.github.com/repos/arnaudprioul/origam'
const FALLBACK_STAR_COUNT = 0
const CACHE_TTL_SECONDS = 3600

interface IGithubRepoResponse {
  stargazers_count: number
}

interface IGithubStarsResponse {
  stars: number
}

export default defineCachedEventHandler(
  async (): Promise<IGithubStarsResponse> => {
    try {
      const data = await $fetch<IGithubRepoResponse>(GITHUB_API_URL, {
        headers: {
          'Accept': 'application/vnd.github+json',
          'User-Agent': 'origam-marketing/1.0'
        }
      })

      return {
        stars: data.stargazers_count ?? FALLBACK_STAR_COUNT
      }
    } catch {
      return {
        stars: FALLBACK_STAR_COUNT
      }
    }
  },
  {
    maxAge: CACHE_TTL_SECONDS,
    name: 'github-stars',
    getKey: () => 'github-stars'
  }
)
