import { resolve } from 'node:path'
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'

import { MARKETING_DEFAULTS } from './src/consts/marketing.const'
import { I18N_LOCALES, I18N_COOKIE_KEY } from './src/consts/i18n.const'
import { geekThemes } from './src/themes/geek.theme'
import { glassThemes } from './src/themes/glass.theme'
import { cartoonThemes } from './src/themes/cartoon.theme'
import { editorialThemes } from './src/themes/editorial.theme'
import { materialThemes } from './src/themes/material.theme'
import { ecomThemes } from './src/themes/ecom.theme'
import { appleThemes } from './src/themes/apple.theme'
import { origamThemes } from './src/themes/origam.theme'

// Single source of truth for the displayed version: the published `origam`
// package version. Read at build time so badges/translations never need a
// manual edit on release — bump packages/ds/package.json and it flows here.
const DS_VERSION = JSON.parse(
    readFileSync(fileURLToPath(new URL('../ds/package.json', import.meta.url)), 'utf-8')
).version as string

export default defineNuxtConfig({
    compatibilityDate: '2026-05-27',
    devtools: { enabled: true },
    ssr: true,

    // Project convention (cf. CLAUDE.md) — srcDir is `src/`, not Nuxt 4's
    // default `app/`. Internal structure (app.vue, layouts, pages, …) is
    // unchanged, only the root folder name.
    srcDir: 'src/',

    // Production build only needs runnable output, not source maps. Nuxt emits
    // SERVER source maps by default in prod (~570 .mjs.map / ~67 MB here); rollup
    // holds them in memory during the Nitro bundle step, which is exactly where
    // the RAM-constrained deploy container OOM-kills the build. Disabling both
    // channels removes that memory spike with zero runtime impact.
    sourcemap: {
        server: false,
        client: false
    },

    typescript: {
        strict: true,
        typeCheck: false,
        shim: false
    },

    // ⛔ The origam module is referenced by SOURCE PATH, not by the bare
    // `origam/nuxt` specifier — see #565.
    //
    // `modules: []` entries are resolved by Nuxt/exsolve at config-load time,
    // through the `origam` package's `exports` map. `./nuxt` there points at
    // `dist/src/nuxt/module.js`, which only exists after `pnpm -F origam build`.
    // Nothing builds `ds` during `pnpm install` (it carries no postinstall —
    // only `prepublishOnly`, which npm publish runs and pnpm install does not),
    // so on a virgin worktree the specifier resolved to a file that was not on
    // disk yet and `nuxt prepare` aborted, making `pnpm install` exit 1.
    //
    // The `vite.resolve.alias` block at the bottom of this file could not help:
    // it governs bundling, not Nuxt's module resolution. Pointing straight at
    // the source makes this entry consistent with the 11 sibling `origam/*`
    // aliases already declared there, and with how `stories` and `tests`
    // resolve the DS (`packages/tests/vitest.config.ts` states outright that
    // its aliases exist so specs "don't require a full `pnpm -F origam build`").
    // Measured: identical module output either way — 218 registered Origam
    // components, byte-for-byte the same list, with and without `ds/dist`.
    modules: [
        resolve(__dirname, '../ds/src/nuxt/module.ts'),
        '@nuxtjs/seo',
        '@nuxtjs/i18n'
    ],

    origam: {
        defaultTheme: 'origam',
        defaultMode: 'light',
        // Brand themes authored as clean IOrigamTheme objects (semantic vars,
        // light + dark). Component default props are inherited from the origam
        // base theme (sobre identity, name-less → applies to every brand). The
        // legacy per-brand CSS sheets still carry bespoke marketing selectors
        // (.home-* hacks) — to be removed in the themes-showcase cleanup.
        themes: [
            ...geekThemes,
            ...glassThemes,
            ...cartoonThemes,
            ...editorialThemes,
            ...materialThemes,
            ...ecomThemes,
            ...appleThemes,
            // Thème neutre de base (identité DS par défaut) — enregistré pour que le
            // playground /theming puisse RESET son sous-arbre via theme="origam".
            ...origamThemes
        ]
    },

    ogImage: {
        enabled: false
    },

    // The /admin backoffice is not public-facing. It is already gated (client
    // middleware on the pages, server middleware on the API), so listing it is
    // not a vulnerability — but an administration surface has no business in a
    // public sitemap, and advertising it only invites probing.
    sitemap: {
        exclude: ['/admin', '/admin/**']
    },

    robots: {
        disallow: ['/admin']
    },

    components: [
        { path: '~/components', pathPrefix: false }
    ],

    experimental: {
        viewTransition: true
    },

    css: [
        'origam/tokens/css/dark',
        '~/assets/css/themes/_shared.css',
        '~/assets/css/themes/geek.css',
        '~/assets/css/themes/glass.css',
        '~/assets/css/themes/cartoon.css',
        '~/assets/css/themes/editorial.css',
        '~/assets/css/themes/material.css',
        '~/assets/css/themes/ecom.css',
        '~/assets/css/themes/apple.css',
        '~/assets/css/base.css'
    ],

    runtimeConfig: {
        // Admin backoffice auth (server-only — never exposed to the client).
        // Generate adminPasswordHash: node -e "const {scryptSync,randomBytes}=require('crypto');
        //   const s=randomBytes(16).toString('hex');
        //   console.log(s+':'+scryptSync('YOUR_PASSWORD',s,64).toString('hex'))"
        adminPasswordHash: '',  // NUXT_ADMIN_PASSWORD_HASH
        sessionPassword: '',    // NUXT_SESSION_PASSWORD (min 32 chars)

        public: {
            githubRepo: process.env.NUXT_PUBLIC_GITHUB_REPO ?? MARKETING_DEFAULTS.githubRepo,
            npmPkg: process.env.NUXT_PUBLIC_NPM_PKG ?? MARKETING_DEFAULTS.npmPkg,
            npmVersion: process.env.NUXT_PUBLIC_NPM_VERSION ?? DS_VERSION,
            siteUrl: process.env.NUXT_PUBLIC_SITE_URL ?? MARKETING_DEFAULTS.siteUrl,
            donateUrl: process.env.NUXT_PUBLIC_DONATE_URL ?? MARKETING_DEFAULTS.donateUrl
        }
    },

    site: {
        url: process.env.NUXT_PUBLIC_SITE_URL ?? MARKETING_DEFAULTS.siteUrl,
        name: MARKETING_DEFAULTS.siteName,
        description: MARKETING_DEFAULTS.siteDescription,
        defaultLocale: MARKETING_DEFAULTS.defaultLocale
    },

    app: {
        head: {
            titleTemplate: `%s · ${MARKETING_DEFAULTS.siteName}`,
            htmlAttrs: {
                lang: MARKETING_DEFAULTS.defaultLocale,
                'data-theme': 'geek',
                'data-mode': 'light'
            },
            link: [
                { rel: 'icon', type: 'image/svg+xml', href: MARKETING_DEFAULTS.logoPath },
                { rel: 'icon', type: 'image/x-icon', href: MARKETING_DEFAULTS.faviconPath },
                { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
                { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: '' },
                { rel: 'stylesheet', href: 'https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,400;0,9..144,500;0,9..144,600;1,9..144,400;1,9..144,600&family=Inter:wght@400;500;600;700;800;900&family=JetBrains+Mono:wght@400;500;700&display=swap' }
            ]
        }
    },

    build: {
        transpile: ['origam']
    },

    nitro: {
        esbuild: {
            options: {
                tsconfigRaw: {
                    compilerOptions: {
                        experimentalDecorators: true
                    }
                }
            }
        },
        serverAssets: [
            {
                baseName: 'db-seed',
                dir: fileURLToPath(new URL('./server/db/seed', import.meta.url))
            }
        ]
    },

    i18n: {
        locales: I18N_LOCALES,
        defaultLocale: 'en',
        strategy: 'prefix_except_default',
        // restructureDir is resolved relative to <rootDir> (v10 default: 'i18n/').
        // Project convention puts locales under <srcDir>/assets/locales/ (cf.
        // CLAUDE.md), so restructureDir points at src/assets and langDir stays
        // the default 'locales' — resolved path: src/assets/locales/.
        restructureDir: 'src/assets',
        langDir: 'locales',
        compilation: { strictMessage: false },
        detectBrowserLanguage: {
            useCookie: true,
            cookieKey: I18N_COOKIE_KEY,
            redirectOn: 'root',
            alwaysRedirect: false
        },
        baseUrl: process.env.NUXT_PUBLIC_SITE_URL ?? MARKETING_DEFAULTS.siteUrl
    },

    vite: {
        optimizeDeps: {
            include: [
                '@vue/repl',
                '@vue/repl/codemirror-editor',
                'shiki',
                'qrcode-generator',
                '@vue/devtools-kit'
            ]
        },
        worker: {
            format: 'es'
        },
        resolve: {
            alias: {
                // ⛔ The four `origam/tokens/css/*` sheets are aliased to SOURCE
                // for the same reason as `modules[]` above — see #774.
                //
                // One of them is declared in this file's own `css[]` array
                // (`dark`); the other three are injected into `nuxt.options.css`
                // by the DS Nuxt module (`primitive`, `light`, `utilities` —
                // `packages/ds/src/nuxt/module.ts:106-116`). Nuxt funnels that
                // array into the virtual `#build/css.mjs`, whose imports the
                // bundler resolves through the `origam` package's `exports` map
                // — and every `./tokens/css/*` entry there points into `dist/`,
                // which only `pnpm -F origam build` creates.
                //
                // Measured on a worktree with no `packages/ds/dist`:
                // `pnpm -F @origam/marketing build` exited 1 on
                // `Rolldown failed to resolve import "origam/tokens/css/primitive"`.
                // The token stylesheets are hand-maintained sources committed
                // under `ds/src/assets/css/tokens/` and `dist/` only copies
                // them, so pointing at the source is lossless.
                'origam/tokens/css/primitive': resolve(__dirname, '../ds/src/assets/css/tokens/primitive.css'),
                'origam/tokens/css/light': resolve(__dirname, '../ds/src/assets/css/tokens/light.css'),
                'origam/tokens/css/dark': resolve(__dirname, '../ds/src/assets/css/tokens/dark.css'),
                'origam/tokens/css/utilities': resolve(__dirname, '../ds/src/assets/css/tokens/origam-utilities.css'),
                'origam/nuxt': resolve(__dirname, '../ds/src/nuxt/module.ts'),
                'origam/components': resolve(__dirname, '../ds/src/components'),
                'origam/composables': resolve(__dirname, '../ds/src/composables'),
                'origam/directives': resolve(__dirname, '../ds/src/directives'),
                'origam/enums': resolve(__dirname, '../ds/src/enums'),
                'origam/consts': resolve(__dirname, '../ds/src/consts'),
                'origam/utils': resolve(__dirname, '../ds/src/utils'),
                'origam/types': resolve(__dirname, '../ds/src/types'),
                'origam/interfaces': resolve(__dirname, '../ds/src/interfaces'),
                'origam/services': resolve(__dirname, '../ds/src/services'),
                'origam/themes': resolve(__dirname, '../ds/src/themes')
            }
        }
    }
})
