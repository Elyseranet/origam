import type { IBrandLogoSource } from '../interfaces/brand.interface'

/** Logo horizontal du kit de marque A1 : 85x32 CSS px, servi en 1x et 2x. */
export const BRAND_LOGO_WIDTH = 85
export const BRAND_LOGO_HEIGHT = 32

export const BRAND_LOGO_LIGHT: IBrandLogoSource = {
    src: '/brand/origam-horizontal-light-1x.avif',
    srcset: '/brand/origam-horizontal-light-1x.avif 1x, /brand/origam-horizontal-light-2x.avif 2x'
}

export const BRAND_LOGO_DARK: IBrandLogoSource = {
    src: '/brand/origam-horizontal-dark-1x.avif',
    srcset: '/brand/origam-horizontal-dark-1x.avif 1x, /brand/origam-horizontal-dark-2x.avif 2x'
}

export const BRAND_FAVICON_SIZES = [16, 32, 48, 192, 512] as const

export const BRAND_APPLE_TOUCH_ICON = '/favicons/favicon-180.png'

export const BRAND_MANIFEST_PATH = '/site.webmanifest'
