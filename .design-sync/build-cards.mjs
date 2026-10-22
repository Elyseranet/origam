// Générateur off-script design-sync — mode « tokens + cartes preview » (DS Vue).
// Le converter canonique est React-only (voir NOTES.md) ; ce script produit :
//   ds-bundle/styles.css            → look origam réel (tokens compilés + utilities + mdi)
//   ds-bundle/tokens/origam.css     → copie du main.css compilé du DS
//   ds-bundle/fonts/                → @mdi/font (css réécrit + woff2)
//   ds-bundle/_ds_bundle.js         → stub vide conforme (header @ds-bundle)
//   ds-bundle/_ds_bundle.css        → stub (invariant : @import depuis styles.css)
//   ds-bundle/components/<Cat>/<Name>/<Name>.html → carte @dsCard avec capture RÉELLE
// Les captures viennent du Histoire statique servi sur :6006 (vrai rendu, pas de
// réimplémentation). Usage :
//   node .design-sync/build-cards.mjs <repoRoot> <phase>   # phase: base | shots | cards
import { execSync } from 'node:child_process'
import { cpSync, existsSync, mkdirSync, readFileSync, readdirSync, rmSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { createRequire } from 'node:module'

const [, , ROOT, PHASE] = process.argv
if (!ROOT || !PHASE) { console.error('usage: build-cards.mjs <repoRoot> <base|shots|cards>'); process.exit(1) }
const OUT = join(ROOT, 'ds-bundle')
const SHOTS = join(ROOT, '.design-sync/.cache/shots')
const STORIES = join(ROOT, 'packages/stories/components/stories')

// ---------- inventaire : familles de stories × catalogue marketing ----------
function inventory () {
    const catalog = JSON.parse(readFileSync(join(ROOT, 'packages/marketing/src/assets/seed/component.json'), 'utf8'))
    // Les entrées ENFANTS (AppBar, AvatarGroup…) portent aussi leur catégorie → tout indexer.
    const byName = new Map()
    for (const { entry } of catalog.entries) {
        if (entry.kind !== 'component') continue
        byName.set(entry.name.toLowerCase(), entry)
    }
    // Catalogue nettoyé (#188) : les catégories sont désormais la taxonomie
    // officielle (celle du Theme Builder / i18n theming.category.*) — on les
    // utilise telles quelles. NB au prochain re-sync : les groupes du projet
    // claude.ai/design seront renommés (les anciens chemins courts partent
    // via les delete globs du plan).
    const canon = c => c
    // 1 dossier peut contenir plusieurs stories (Grids → Col/Container/Row/Spacer).
    // On énumère les FICHIERS Origam<X>.story.vue réels (hors .emits/.slots).
    // Stories de DÉMO de capacités (pas des composants — pas de tag réel) : exclues des cartes.
    const NOT_COMPONENTS = new Set(['ColorGradient', 'Utilities'])
    const dirs = readdirSync(STORIES, { withFileTypes: true }).filter(d => d.isDirectory()).map(d => d.name)
        .filter(d => !NOT_COMPONENTS.has(d))
    const items = []
    for (const dir of dirs) {
        for (const f of readdirSync(join(STORIES, dir))) {
            const m = /^Origam([A-Za-z]+)\.story\.vue$/.exec(f)
            if (!m) continue
            const name = m[1]
            const lower = name.toLowerCase()
            // Fallback factuel : un sous-composant sans entrée catalogue hérite de la
            // catégorie de sa FAMILLE (= son dossier de stories, ex. ChartPyramid → Chart).
            const cat = byName.get(lower) || byName.get(dir.toLowerCase())
            items.push({
                name,
                dir,
                storyId: `components-stories-${dir.toLowerCase()}-origam${lower}-story-vue`,
                category: canon(cat?.category || 'Components'),
                description: cat?.description_fallback || '',
                tag: cat?.tag || `origam-${lower}`
            })
        }
    }
    return items
}

// ---------- phase base : socle tokens / fonts / stubs ----------
function base () {
    rmSync(OUT, { recursive: true, force: true })
    mkdirSync(join(OUT, 'tokens'), { recursive: true })
    mkdirSync(join(OUT, 'fonts'), { recursive: true })
    // tokens : le main.css COMPILÉ du DS (primitives + light + dark + utilities + reset)
    cpSync(join(ROOT, 'packages/ds/src/assets/css/main.css'), join(OUT, 'tokens/origam.css'))
    // fonts : @mdi/font (le DS en dépend pour les icônes)
    const mdi = join(ROOT, 'node_modules/.pnpm')
    const mdiDir = readdirSync(mdi).find(d => d.startsWith('@mdi+font@'))
    const mdiPkg = join(mdi, mdiDir, 'node_modules/@mdi/font')
    for (const f of readdirSync(join(mdiPkg, 'fonts'))) {
        if (/\.(woff2?|ttf)$/.test(f)) cpSync(join(mdiPkg, 'fonts', f), join(OUT, 'fonts', f))
    }
    const mdiCss = readFileSync(join(mdiPkg, 'css/materialdesignicons.min.css'), 'utf8')
        .replace(/\.\.\/fonts\//g, './')
    writeFileSync(join(OUT, 'fonts/mdi.css'), mdiCss)
    // stubs bundle (mode tokens-only : "empty-bodied _ds_bundle.js")
    const header = { namespace: 'Origam', components: [], sourceHashes: {}, inlinedExternals: [], builtBy: 'cc-design-sync' }
    writeFileSync(join(OUT, '_ds_bundle.js'),
        `/* @ds-bundle: ${JSON.stringify(header)} */\n(function(){window.Origam={};})();\n`)
    writeFileSync(join(OUT, '_ds_bundle.css'), '/* origam is a Vue 3 DS — component CSS ships via tokens/origam.css (compiled main.scss) */\n')
    writeFileSync(join(OUT, 'styles.css'),
        '@import "./tokens/origam.css";\n@import "./fonts/mdi.css";\n@import "./_ds_bundle.css";\n')
    writeFileSync(join(OUT, '_ds_needs_recompile'), JSON.stringify({ by: 'design-sync-cli' }))
    console.log('base OK →', OUT)
}

// ---------- phase shots : captures réelles multi-variantes × light/dark ----------
// Par composant : variant 0 (Design) en LIGHT + DARK (data-mode réel du DS),
// + jusqu'à 2 variantes suivantes (titres réels) en light. Gate = rendu origam
// visible dans le sandbox (jamais la taille du PNG).
async function shots () {
    const req = createRequire(join(ROOT, 'packages/tests/package.json'))
    const { chromium } = req('@playwright/test')
    mkdirSync(SHOTS, { recursive: true })
    const items = inventory()
    const browser = await chromium.launch()
    const page = await browser.newPage({ viewport: { width: 860, height: 640 }, deviceScaleFactor: 2 })
    const meta = {}
    let ok = 0; const fails = []

    async function capture (storyId, idx, dark, out) {
        if (existsSync(out)) return true
        await page.goto(`http://localhost:6006/stories/story/${storyId}?variantId=${storyId}-${idx}`, { timeout: 15000 })
        const frame = page.locator('iframe[src*="__sandbox"]')
        await frame.waitFor({ timeout: 12000 })
        await page.waitForTimeout(700)
        const fl = page.frameLocator('iframe[src*="__sandbox"]')
        // Fonts (icônes MDI) et images doivent être chargées avant mesure/capture
        await fl.locator('body').evaluate(async b => {
            const doc = b.ownerDocument
            try { await Promise.race([doc.fonts.ready, new Promise(r => setTimeout(r, 3000))]) } catch {}
            const imgs = [...doc.images].filter(i => !i.complete)
            if (imgs.length) await Promise.race([
                Promise.all(imgs.map(i => new Promise(r => { i.onload = i.onerror = r }))),
                new Promise(r => setTimeout(r, 4000))
            ])
        })
        // Restyle le conteneur VISIBLE de la story : fit-content + padding + bg du
        // mode → capture dense (pas de viewport blanc), fond dark correct.
        let box = await fl.locator('body').evaluate((b, dark) => {
            if (dark) { b.ownerDocument.documentElement.setAttribute('data-mode', 'dark'); b.style.background = '#141417' }
            const el = [...b.querySelectorAll('.histoire-generic-render-story')].find(e => e.offsetParent !== null)
            if (!el) return null
            el.style.cssText += ';width:fit-content;height:fit-content;min-height:0;max-width:820px;padding:24px;box-sizing:border-box;background:' + (dark ? '#141417' : '#ffffff')
            const r = el.getBoundingClientRect()
            // bbox du CONTENU origam visible (détecte les variantes non-visuelles)
            let area = 0
            for (const o of el.querySelectorAll('[class*="origam"]')) {
                if (o.offsetParent === null) continue
                const b2 = o.getBoundingClientRect()
                area = Math.max(area, b2.width * b2.height)
            }
            return { w: Math.round(r.width), h: Math.round(r.height), area }
        }, dark)
        if (!box) throw new Error('no visible render-story container')
        if (dark) await page.waitForTimeout(450)
        // fit-content collapse les composants full-width (ProgressLinear, Img lazy,
        // Section) → retry en largeur fixe avant de déclarer vide
        if (box.area < 16) {
            box = await fl.locator('body').evaluate((b, dark) => {
                const el = [...b.querySelectorAll('.histoire-generic-render-story')].find(e => e.offsetParent !== null)
                el.style.width = '640px'
                return new Promise(res => setTimeout(() => {
                    let area = 0
                    for (const o of el.querySelectorAll('[class*="origam"]')) {
                        if (o.offsetParent === null) continue
                        const r2 = o.getBoundingClientRect()
                        area = Math.max(area, r2.width * r2.height)
                    }
                    const r = el.getBoundingClientRect()
                    res({ w: Math.round(r.width), h: Math.round(r.height), area })
                }, 700))
            }, dark)
        }
        // dernier fallback : layout origam-app positionné en absolu (hauteur de flux
        // nulle) → forcer une scène de 240px et capturer le rendu réel
        if (box.area < 16) {
            box = await fl.locator('body').evaluate(b => {
                const el = [...b.querySelectorAll('.histoire-generic-render-story')].find(e => e.offsetParent !== null)
                if (!el || !el.querySelector('.origam-app')) return { area: 0, w: 0, h: 0 }
                el.style.minHeight = '240px'
                el.style.position = 'relative'
                return new Promise(res => setTimeout(() => {
                    const r = el.getBoundingClientRect()
                    res({ w: Math.round(r.width), h: Math.round(r.height), area: r.width * r.height })
                }, 500))
            })
        }
        // variante visuellement vide (aucun contenu origam avec une surface) → échec propre
        if (box.area < 16 && box.h <= 60) throw new Error(`empty render (area ${Math.round(box.area)}, ${box.w}x${box.h})`)
        const el = fl.locator('.histoire-generic-render-story:visible').first()
        let buf = await el.screenshot({ timeout: 10000 })
        if (buf.length < 700) {
            // capture croppée uniforme (position:fixed hors flux, etc.) →
            // retomber sur l'iframe entière (le composant y est visible)
            buf = await frame.screenshot({ timeout: 10000 })
            box = { w: 860, h: 640 }
        }
        writeFileSync(out, buf)
        return { w: box.w, h: box.h }
    }

    for (const it of items) {
        const src = readFileSync(join(STORIES, it.dir, `Origam${it.name}.story.vue`), 'utf8')
        const titles = [...src.matchAll(/<Variant[^>]*?title="([^"]+)"/gs)].map(x => x[1])
        // variantes extra : les 2 suivantes après Design, hors Events/Slots (peu visuels seuls)
        const extras = []
        for (let i = 1; i < titles.length && extras.length < 2; i++) {
            if (/^(Events|Slots)/.test(titles[i])) continue
            extras.push({ idx: i, title: titles[i] })
        }
        meta[it.name] = { design: titles[0] || 'Design', extras, dims: {} }
        try {
            meta[it.name].dims.light = await capture(it.storyId, 0, false, join(SHOTS, `${it.name}__design-light.png`))
            meta[it.name].dims.dark = await capture(it.storyId, 0, true, join(SHOTS, `${it.name}__design-dark.png`))
            for (const [n, ex] of extras.entries()) {
                try { ex.dims = await capture(it.storyId, ex.idx, false, join(SHOTS, `${it.name}__extra${n}.png`)) }
                catch { ex.failed = true }
            }
            ok++
        } catch (e) { fails.push(`${it.name}: ${String(e.message).split('\n')[0]}`) }
    }
    writeFileSync(join(SHOTS, '_meta.json'), JSON.stringify(meta, null, 1))
    await browser.close()
    console.log(`shots: ${ok}/${items.length} OK`)
    if (fails.length) console.log('FAILS:\n' + fails.join('\n'))
}

// ---------- phase cards : artboards (light+dark côte à côte + variantes) ----------
// Chrome calqué sur le canvas « Origam Components » du projet claude.ai/design
// de l'utilisateur (bandeau, pill mono, frames light/dark, labels).
function cards () {
    const items = inventory()
    const meta = JSON.parse(readFileSync(join(SHOTS, '_meta.json'), 'utf8'))
    const b64 = f => {
        if (!existsSync(f)) return null
        const buf = readFileSync(f)
        if (buf.length < 700) return null // PNG strictement uniforme → variante non visuelle
        return buf.toString('base64')
    }
    const esc = x => String(x).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    let ok = 0; const missing = []
    for (const it of items) {
        const light = b64(join(SHOTS, `${it.name}__design-light.png`))
        const dark = b64(join(SHOTS, `${it.name}__design-dark.png`))
        if (!light) { missing.push(it.name); continue }
        const m = meta[it.name] || { design: 'Design', extras: [] }
        const extraCells = (m.extras || []).map((ex, n) => {
            const img = b64(join(SHOTS, `${it.name}__extra${n}.png`))
            if (!img) return ''
            return `<figure class="frame">
      <figcaption><span class="dot"></span>${esc(ex.title)}</figcaption>
      <img style="--w:${ex.dims?.w ? ex.dims.w + 'px' : 'auto'}" src="data:image/png;base64,${img}" alt="Origam${esc(it.name)} — ${esc(ex.title)}">
    </figure>`
        }).join('\n')
        const dir = join(OUT, 'components', it.category, it.name)
        mkdirSync(dir, { recursive: true })
        writeFileSync(join(dir, `${it.name}.html`), `<!-- @dsCard group="${esc(it.category)}" -->
<meta charset="utf-8">
<title>Origam${esc(it.name)}</title>
<style>
  :root { color-scheme: light; }
  body { margin: 0; padding: 18px; background: #fafafa;
         font-family: ui-sans-serif, system-ui, -apple-system, 'Segoe UI', sans-serif; color: #171717; }
  header { display: flex; align-items: baseline; gap: 10px; flex-wrap: wrap; margin: 0 2px 14px; }
  header h1 { margin: 0; font-size: 19px; font-weight: 700; letter-spacing: -0.02em; }
  .pill { font: 500 11px/1 ui-monospace, 'SF Mono', Menlo, monospace; padding: 4px 8px;
          background: #fbeee3; color: #c24500; border-radius: 4px; }
  .cat { font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.06em; color: #a3a3a3; }
  .pair { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
  .frame { margin: 0; border: 1px solid #e6e6e6; border-radius: 8px; overflow: hidden;
           background: #fff; box-shadow: 0 1px 3px rgba(0,0,0,0.05); }
  .frame.dark { border-color: #2a2a2e; background: #141417; }
  .frame figcaption { display: flex; align-items: center; gap: 6px; padding: 7px 11px;
           font: 600 10.5px/1 ui-sans-serif, system-ui, sans-serif; text-transform: uppercase;
           letter-spacing: 0.07em; color: #737373; border-bottom: 1px solid #eee; }
  .frame.dark figcaption { color: #8b8b93; border-bottom-color: #232327; }
  .dot { width: 7px; height: 7px; border-radius: 50%; background: #c24500; display: inline-block; }
  .frame img { display: block; width: var(--w, auto); max-width: 100%; height: auto; margin: 0 auto; }
  .extras { margin-top: 12px; display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
  .desc { margin: 14px 2px 0; font-size: 12.5px; line-height: 1.55; color: #525252; max-width: 70ch; }
  .note { margin: 8px 2px 0; font-size: 10.5px; color: #a3a3a3; }
</style>
<header>
  <h1>Origam${esc(it.name)}</h1>
  <span class="pill">&lt;${esc(it.tag)}&gt;</span>
  <span class="cat">${esc(it.category)}</span>
</header>
<div class="pair">
  <figure class="frame">
    <figcaption><span class="dot"></span>Light · ${esc(m.design)}</figcaption>
    <img style="--w:${m.dims?.light?.w ? m.dims.light.w + 'px' : 'auto'}" src="data:image/png;base64,${light}" alt="Origam${esc(it.name)} — light">
  </figure>
  ${dark ? `<figure class="frame dark">
    <figcaption><span class="dot"></span>Dark · ${esc(m.design)}</figcaption>
    <img style="--w:${m.dims?.dark?.w ? m.dims.dark.w + 'px' : 'auto'}" src="data:image/png;base64,${dark}" alt="Origam${esc(it.name)} — dark">
  </figure>` : ''}
</div>
${extraCells ? `<div class="extras">${extraCells}</div>` : ''}
${it.description ? `<p class="desc">${esc(it.description)}</p>` : ''}
<p class="note">Rendus réels (Histoire \u00b7 light/dark via data-mode). origam est un DS Vue 3 \u2014 référence visuelle ; construire avec les tokens de styles.css.</p>
`)
        ok++
    }
    console.log(`cards: ${ok}/${items.length}`)
    if (missing.length) console.log('SANS CAPTURE: ' + missing.join(', '))
}

if (PHASE === 'base') base()
else if (PHASE === 'shots') await shots()
else if (PHASE === 'cards') cards()
