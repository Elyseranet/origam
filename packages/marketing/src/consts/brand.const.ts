import type { IBrandLogoSource } from '../interfaces/brand.interface'

/**
 * Logo horizontal du kit de marque A1, affiché à 40 px de haut (#1554 T10).
 * Le seul fichier assez grand est le 172x64 : il est servi à toutes les densités
 * (réduit en 1x, net ; agrandi de 1,26 en 2x, limite tant que #1520 n'a pas
 * livré un vrai vecteur). Le 86x32 agrandi à 40 px serait flou.
 */
export const BRAND_LOGO_WIDTH = 108
export const BRAND_LOGO_HEIGHT = 40

export const BRAND_LOGO_LIGHT: IBrandLogoSource = {
    src: '/brand/origam-horizontal-light-2x.avif'
}

export const BRAND_LOGO_DARK: IBrandLogoSource = {
    src: '/brand/origam-horizontal-dark-2x.avif'
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
