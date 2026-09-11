// esbuild configuration for the Origam DS Sync Figma plugin.
//
// Builds two bundles:
//   1. src/code.ts  -> dist/code.js   (main thread, sandboxed Figma runtime, no DOM)
//   2. src/ui.tsx   -> dist/ui.js     (iframe with React 18 + DOM)
//
// Then takes src/ui.html as a template, inlines the produced ui.js (and any
// emitted ui.css) into a single self-contained dist/ui.html — Figma loads
// the UI as a single HTML string from disk, so we cannot ship separate
// asset files.

import esbuild from 'esbuild'
import {readFile, writeFile, mkdir, rm} from 'node:fs/promises'
import {existsSync} from 'node:fs'
import {dirname, resolve} from 'node:path'
import {fileURLToPath} from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const SRC = resolve(__dirname, 'src')
const DIST = resolve(__dirname, 'dist')

const watch = process.argv.includes('--watch')
const isProd = process.env.NODE_ENV === 'production'

const pkg = JSON.parse(await readFile(resolve(__dirname, 'package.json'), 'utf8'))

/** @type {import('esbuild').BuildOptions} */
const sharedOptions = {
  bundle: true,
  format: 'iife',
  logLevel: 'info',
  sourcemap: watch ? 'inline' : false,
  minify: isProd,
  target: ['es2017'],
  define: {
    'process.env.NODE_ENV': JSON.stringify(isProd ? 'production' : 'development'),
    __PLUGIN_VERSION__: JSON.stringify(pkg.version),
  },
}

/** @type {import('esbuild').BuildOptions} */
const codeOptions = {
  ...sharedOptions,
  entryPoints: [resolve(SRC, 'code.ts')],
  outfile: resolve(DIST, 'code.js'),
  // Figma's main thread is a sandboxed quickjs-like runtime: no DOM, no
  // node, no globalThis.window. Treat as a neutral platform.
  platform: 'neutral',
  // Figma's runtime supports plain ES modules in the manifest's "main"
  // entrypoint, but IIFE works everywhere.
  format: 'iife',
}

/** @type {import('esbuild').BuildOptions} */
const uiOptions = {
  ...sharedOptions,
  entryPoints: [resolve(SRC, 'ui.tsx')],
  outfile: resolve(DIST, 'ui.js'),
  platform: 'browser',
  jsx: 'automatic',
  // Importing './ui.css' from ui.tsx makes esbuild emit a sibling
  // dist/ui.css next to dist/ui.js. The inlineHtml() step below picks
  // it up and inlines it as a <style> tag inside dist/ui.html.
}

async function inlineHtml() {
  const templatePath = resolve(SRC, 'ui.html')
  const jsPath = resolve(DIST, 'ui.js')
  const cssPath = resolve(DIST, 'ui.css')
  const outHtmlPath = resolve(DIST, 'ui.html')

  const template = await readFile(templatePath, 'utf8')
  const js = await readFile(jsPath, 'utf8')
  const css = existsSync(cssPath) ? await readFile(cssPath, 'utf8') : ''

  const cssTag = css ? `<style>${css}</style>` : ''
  const jsTag = `<script>${js}</script>`

  const html = template
    .replace('<!-- INLINE_CSS -->', cssTag)
    .replace('<!-- INLINE_JS -->', jsTag)

  await writeFile(outHtmlPath, html, 'utf8')
  // Clean intermediate ui.js / ui.css so Figma only sees the bundled HTML.
  await rm(jsPath, {force: true})
  await rm(cssPath, {force: true})
  console.log(`[origam-ds-sync] wrote ${outHtmlPath}`)
}

async function clean() {
  await rm(DIST, {recursive: true, force: true})
  await mkdir(DIST, {recursive: true})
}

async function buildOnce() {
  await clean()
  await Promise.all([esbuild.build(codeOptions), esbuild.build(uiOptions)])
  await inlineHtml()
}

async function buildWatch() {
  await clean()
  const codeCtx = await esbuild.context({
    ...codeOptions,
    plugins: [
      {
        name: 'origam-code-rebuild-log',
        setup(build) {
          build.onEnd((result) => {
            if (result.errors.length === 0) {
              console.log('[origam-ds-sync] code.js rebuilt')
            }
          })
        },
      },
    ],
  })

  const uiCtx = await esbuild.context({
    ...uiOptions,
    plugins: [
      {
        name: 'origam-ui-rebuild-log',
        setup(build) {
          build.onEnd(async (result) => {
            if (result.errors.length === 0) {
              try {
                await inlineHtml()
              } catch (err) {
                console.error('[origam-ds-sync] failed to inline ui.html:', err)
              }
            }
          })
        },
      },
    ],
  })

  await Promise.all([codeCtx.watch(), uiCtx.watch()])
  console.log('[origam-ds-sync] watching for changes…')
}

if (watch) {
  await buildWatch()
} else {
  await buildOnce()
}
