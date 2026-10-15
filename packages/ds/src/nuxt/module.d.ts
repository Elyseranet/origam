import type { IOrigamNuxtModuleOptions, IOrigamNuxtProvide, IOrigamNuxtRuntimeConfig } from '../interfaces/Commons/nuxt-module.interface'

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

declare module '#app' {
    interface NuxtApp {
        $origam: IOrigamNuxtProvide
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

export { IOrigamNuxtModuleOptions, IOrigamNuxtProvide, IOrigamNuxtRuntimeConfig }
