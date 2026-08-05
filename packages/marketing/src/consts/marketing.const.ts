export const MARKETING_DEFAULTS = {
    siteName: 'origam',
    siteDescription: 'Build your entire Vue 3 design system in minutes. 95+ accessible, TypeScript-first components driven by design tokens.',
    defaultLocale: 'en',
    githubRepo: 'https://github.com/arnaudprioul/origam',
    npmPkg: 'origam',
    npmVersion: '2.5.1',
    siteUrl: 'https://origam.dev',
    logoPath: '/logo.svg',
    faviconPath: '/favicon.ico',
    // Donation link. Intentionally empty by default: the footer entry is only
    // rendered when NUXT_PUBLIC_DONATE_URL is provided, so an unconfigured
    // deployment never ships a dead or placeholder link.
    donateUrl: ''
} as const
