import type { IOrigamNuxtModuleOptions, IOrigamNuxtRuntimeConfig } from '../interfaces'

declare module '@nuxt/schema' {
    interface NuxtConfig {
        origam?: IOrigamNuxtModuleOptions
    }

    interface NuxtOptions {
        origam?: IOrigamNuxtModuleOptions
    }

    interface PublicRuntimeConfig {
        origam: IOrigamNuxtRuntimeConfig
    }
}

declare module 'nuxt/schema' {
    interface NuxtConfig {
        origam?: IOrigamNuxtModuleOptions
    }

    interface NuxtOptions {
        origam?: IOrigamNuxtModuleOptions
    }

    interface PublicRuntimeConfig {
        origam: IOrigamNuxtRuntimeConfig
    }
}

export { IOrigamNuxtModuleOptions, IOrigamNuxtRuntimeConfig }
