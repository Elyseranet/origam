import { defineConfig } from 'vitepress'
import { existsSync, readdirSync, statSync } from 'fs'
import { resolve, join } from 'path'

/*
 * Recursive scan — finds every .md under a docs sub-folder and
 * returns one entry per file. Used to feed sidebar groups below.
 */
type TDocEntry = { text: string; link: string }

function getDocs(dir: string, baseDir: string): TDocEntry[] {
    const docsPath = resolve(__dirname, dir)
    const items: TDocEntry[] = []

    if (!existsSync(docsPath)) return items

    const scan = (currentDir: string, currentLink: string) => {
        const files = readdirSync(currentDir)

        for (const file of files) {
            const fullPath = join(currentDir, file)
            const stat = statSync(fullPath)

            if (stat.isDirectory()) {
                scan(fullPath, `${currentLink}${file}/`)
            } else if (file.endsWith('.md')) {
                const name = file.replace('.md', '')
                items.push({
                    text: name,
                    link: `${currentLink}${name}`
                })
            }
        }
    }

    scan(docsPath, baseDir)
    return items.sort((a, b) => a.text.localeCompare(b.text))
}

/*
 * Component taxonomy — maps the top-level folder name under
 * `docs/components/` to a UI category. Components NOT listed here
 * fall through to the catch-all "Misc" group, which keeps the
 * doc site working when a new component lands before the map is
 * updated.
 *
 * Keep groups stable; insertion order drives the sidebar order.
 */
const COMPONENT_CATEGORIES: Record<string, string[]> = {
    'Layout & Structure': [
        'App',
        'AppBar',
        'Card',
        'Container',
        'Divider',
        'ExpansionPanel',
        'Grid',
        'Grids',
        'ItemGroup',
        'Layout',
        'Main',
        'Masonry',
        'Responsive',
        'Section',
        'Spacer',
        'SystemBar',
        'Toolbar',
        'Window'
    ],
    'Navigation': [
        'BottomNav',
        'Bracket',
        'Breadcrumb',
        'CommandPalette',
        'ContextualMenu',
        'Menu',
        'Pagination',
        'Stepper',
        'Tabs',
        'Treeview'
    ],
    'Form & Input': [
        'Btn',
        'Checkbox',
        'ColorPicker',
        'ColorPickerField',
        'DatePicker',
        'DatePickerField',
        'Field',
        'FileField',
        'Form',
        'InlineEdit',
        'Input',
        'NumberField',
        'OtpInputField',
        'PasswordField',
        'Picker',
        'Radio',
        'RatingField',
        'Select',
        'SelectionControl',
        'SliderField',
        'Switch',
        'TextField',
        'TextMask',
        'TextareaField'
    ],
    'Data Display': [
        'Avatar',
        'Badge',
        'Blockquote',
        'Calendar',
        'Chart',
        'Chip',
        'Clipboard',
        'Code',
        'Counter',
        'DataList',
        'DataTable',
        'Kbd',
        'List',
        'NumberFormat',
        'QrCode',
        'Table',
        'Timeline',
        'Title',
        'VirtualScroll'
    ],
    'Feedback & Status': [
        'Alert',
        'ConfirmWrapper',
        'EmptyState',
        'Label',
        'Loader',
        'Messages',
        'Progress',
        'Skeleton',
        'Snackbar'
    ],
    'Overlay & Surface': [
        'Dialog',
        'Drawer',
        'Overlay',
        'Sheet',
        'Tooltip'
    ],
    'Media': [
        'Audio',
        'Carousel',
        'Icon',
        'Img',
        'Media',
        'Parallax',
        'Slide',
        'Video',
        'Watermark'
    ],
    'Utilities & Providers': [
        'ClientOnly',
        'DefaultsProvider',
        'InfiniteScroll',
        'Lazy',
        'ThemeProvider',
        'Transition'
    ]
}

/*
 * Build categorised sidebar groups from the on-disk doc tree.
 *
 * For each component folder discovered under `docs/components/`,
 * find the category that owns it. Any folder not mapped lands
 * in "Misc" so nothing falls through the cracks silently.
 */
function buildCategorisedSidebar(allComponents: TDocEntry[]): Array<{
    text: string
    collapsed?: boolean
    items: TDocEntry[]
}> {
    // Folder name (top-level under /components/) → category name
    const folderToCategory = new Map<string, string>()
    for (const [category, folders] of Object.entries(COMPONENT_CATEGORIES)) {
        for (const folder of folders) {
            folderToCategory.set(folder, category)
        }
    }

    const grouped: Record<string, TDocEntry[]> = {}
    for (const category of Object.keys(COMPONENT_CATEGORIES)) {
        grouped[category] = []
    }
    const misc: TDocEntry[] = []

    for (const entry of allComponents) {
        // entry.link is like '/components/Btn/OrigamBtn' or '/components/Chart/OrigamChartCartesian'
        // top-level folder is the second segment.
        const segments = entry.link.split('/').filter(Boolean) // ['components', 'Btn', 'OrigamBtn']
        const topFolder = segments[1] ?? ''
        const category = folderToCategory.get(topFolder)

        if (category) {
            grouped[category].push(entry)
        } else {
            misc.push(entry)
        }
    }

    const sidebar = Object.entries(grouped)
        .filter(([, items]) => items.length > 0)
        .map(([text, items]) => ({
            text,
            collapsed: false,
            items: items.sort((a, b) => a.text.localeCompare(b.text))
        }))

    if (misc.length > 0) {
        sidebar.push({
            text: 'Misc',
            collapsed: true,
            items: misc.sort((a, b) => a.text.localeCompare(b.text))
        })
    }

    return sidebar
}

// Doc tree lives one level up from .vitepress/ (i.e. packages/docs/).
const dynamicComponents = getDocs(resolve(__dirname, '../components'), '/components/')
const dynamicComposables = getDocs(resolve(__dirname, '../composables'), '/composables/')
const dynamicDirectives = getDocs(resolve(__dirname, '../directives'), '/directives/')

const categorisedComponents = buildCategorisedSidebar(dynamicComponents)

export default defineConfig({
    title: 'Origam UI',
    description: 'Documentation de la bibliothèque de composants Origam',
    lang: 'fr-FR',
    // Served under /docs on the marketing origin: Nuxt serves the built static
    // site from packages/marketing/public/docs (see outDir below). The base
    // prefixes every asset/link URL so they resolve at /docs/**.
    base: '/docs/',
    outDir: '../marketing/public/docs',

    /*
     * Many component .md files have cross-links to siblings that
     * haven't all been written yet (e.g. a Btn doc may link to
     * BtnGroup, BtnToggle that exist as folders but not as
     * .md). Don't break the build on those — surface them as
     * warnings instead.
     */
    ignoreDeadLinks: true,

    // Internal engineering docs (ADRs, audits) are not part of the public
    // component documentation and contain prose with unescaped angle-bracket
    // placeholders (e.g. `<custom>`) that VitePress' Vue-SFC compiler rejects.
    // They live in-repo for maintainers, not on the published /docs site.
    srcExclude: ['internal/**', '**/README.md'],

    vite: {
        // esbuild's default transpile target chokes on the wasm→JS shim shiki
        // bundles (vscode-oniguruma) during the production build
        // (`wasm.!~{001}~.js: Expected ":" but found "}"`). esnext lets the
        // generated module through untouched.
        build: {
            target: 'esnext'
        },
        esbuild: {
            target: 'esnext'
        },
        resolve: {
            alias: {
                // Docs track the live DS source. origam is kept out of the SSR
                // bundle by the client-only dynamic import in theme/index.ts, so
                // aliasing to src (not dist) no longer breaks the server render.
                '@origam': resolve(__dirname, '../../ds/src')
            }
        },
        optimizeDeps: {
            include: ['@origam']
        },
        ssr: {
            // Bundle origam + the @vueuse/* deps it (and VitePress' theme) pull
            // in, so Node's native ESM loader never tries to resolve them from
            // pnpm's nested node_modules at render time (which fails with
            // "Cannot find package 'vue' imported from @vueuse/core").
            noExternal: ['@origam', /@vueuse\//]
        }
    },

    themeConfig: {
        nav: [
            { text: 'Guide', link: '/guide/introduction' },
            { text: 'Composants', link: dynamicComponents[0]?.link || '/guide/components' },
            { text: 'Composables', link: dynamicComposables[0]?.link || '/guide/composables' },
            { text: 'Directives', link: dynamicDirectives[0]?.link || '/guide/directives' }
        ],

        sidebar: {
            '/guide/': [
                {
                    text: 'Introduction',
                    items: [
                        { text: 'Démarrage', link: '/guide/introduction' },
                        { text: 'Installation', link: '/guide/installation' },
                        { text: 'Utilisation', link: '/guide/usage' },
                        { text: 'Composants', link: '/guide/components' },
                        { text: 'Composables', link: '/guide/composables' },
                        { text: 'Directives', link: '/guide/directives' },
                        { text: 'Espacement et coins', link: '/guide/spacing-and-corners' }
                    ]
                }
            ],
            '/components/': categorisedComponents,
            '/composables/': [
                {
                    text: 'Composables',
                    items: dynamicComposables
                }
            ],
            '/directives/': [
                {
                    text: 'Directives',
                    items: dynamicDirectives
                }
            ]
        },

        search: { provider: 'local' }
    }
})
