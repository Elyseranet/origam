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
    // Donation link — a PayPal hosted Donate button. NUXT_PUBLIC_DONATE_URL
    // still overrides it per deployment; the footer entry renders only when
    // the resolved value is non-empty, so blanking the variable removes the
    // link rather than shipping a dead one.
    donateUrl: 'https://www.paypal.com/donate/?hosted_button_id=EQFUQ2JV95YGQ'
} as const
