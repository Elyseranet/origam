import { computed } from 'vue'
import type { IGithubStarsData } from '~/interfaces/github.interface'
import { adoptionService } from '~/services/adoption.service'

export function useGithubStars () {
  const { data, status } = useAsyncData<IGithubStarsData>('github-stars', () => adoptionService.getGithubStars(), {
    default: () => ({ stars: null })
  })

  const stars = computed(() => data.value?.stars ?? null)
  const isPending = computed(() => status.value === 'pending')

  return { stars, isPending }
}
