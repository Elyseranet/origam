import { computed } from 'vue'
import type { INpmDownloadsData } from '~/interfaces/npm-downloads.interface'
import { adoptionService } from '~/services/adoption.service'

export function useNpmDownloads () {
  const { data, status } = useAsyncData<INpmDownloadsData>('npm-downloads', () => adoptionService.getNpmDownloads(), {
    default: () => ({ downloads: null })
  })

  const downloads = computed(() => data.value?.downloads ?? null)
  const isPending = computed(() => status.value === 'pending')

  return { downloads, isPending }
}
