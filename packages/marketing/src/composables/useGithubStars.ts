import { computed } from 'vue'
import type { IGithubStarsData } from '~/interfaces/github.interface'

export function useGithubStars () {
  const { data, status } = useFetch<IGithubStarsData>('/api/github-stars', {
    default: () => ({ stars: null })
  })

  const stars = computed(() => data.value?.stars ?? null)
  const isPending = computed(() => status.value === 'pending')

  return { stars, isPending }
}
