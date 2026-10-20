import { computed } from 'vue'
import type { INpmDownloadsData } from '~/interfaces/npm-downloads.interface'

export function useNpmDownloads () {
  const { data, status } = useFetch<INpmDownloadsData>('/api/npm-downloads', {
    default: () => ({ downloads: null })
  })

  const downloads = computed(() => data.value?.downloads ?? null)
  const isPending = computed(() => status.value === 'pending')

  return { downloads, isPending }
}
