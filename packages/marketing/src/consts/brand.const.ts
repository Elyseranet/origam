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

/**
 * `<link>` de l'identité du site (favicons du kit, apple-touch, manifest).
 * Écrits en littéraux `as const` : `app.head.link` est une union discriminée sur
 * `rel`, qu'un tableau construit par `.map()` élargit en `string`.
 */
export const BRAND_HEAD_LINKS = [
    { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' },
    { rel: 'icon', type: 'image/png', sizes: '16x16', href: '/favicons/favicon-16.png' },
    { rel: 'icon', type: 'image/png', sizes: '32x32', href: '/favicons/favicon-32.png' },
    { rel: 'icon', type: 'image/png', sizes: '48x48', href: '/favicons/favicon-48.png' },
    { rel: 'icon', type: 'image/png', sizes: '192x192', href: '/favicons/favicon-192.png' },
    { rel: 'icon', type: 'image/png', sizes: '512x512', href: '/favicons/favicon-512.png' },
    { rel: 'apple-touch-icon', sizes: '180x180', href: '/favicons/favicon-180.png' },
    { rel: 'manifest', href: '/site.webmanifest' }
] as const
