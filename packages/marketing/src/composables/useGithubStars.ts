import { computed } from 'vue'
import { GITHUB_STARS_FALLBACK } from '~/consts/chrome.const'
import type { IGithubStarsData } from '~/interfaces/github.interface'

export function useGithubStars () {
  const { data, status } = useFetch<IGithubStarsData>('/api/github-stars', {
    default: () => ({ stars: GITHUB_STARS_FALLBACK, cached: false })
  })

  const stars = computed(() => data.value?.stars ?? GITHUB_STARS_FALLBACK)
  const isPending = computed(() => status.value === 'pending')

  return { stars, isPending }
}
