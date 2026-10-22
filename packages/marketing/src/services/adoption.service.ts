import { BaseService } from '~/services/base.service'
import type { IGithubStarsData } from '~/interfaces/github.interface'
import type { INpmDownloadsData } from '~/interfaces/npm-downloads.interface'
import type { INpmVersionData } from '~/interfaces/version.interface'

/** Compteurs d'adoption (étoiles GitHub, téléchargements et version npm), servis par Nitro. */
export class AdoptionService extends BaseService {
    getGithubStars (): Promise<IGithubStarsData> {
        return this.request<IGithubStarsData>('/github-stars')
    }

    getNpmDownloads (): Promise<INpmDownloadsData> {
        return this.request<INpmDownloadsData>('/npm-downloads')
    }

    getNpmVersion (): Promise<INpmVersionData> {
        return this.request<INpmVersionData>('/npm-version')
    }
}

export const adoptionService = new AdoptionService()
