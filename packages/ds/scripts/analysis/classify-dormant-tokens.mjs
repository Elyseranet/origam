import { readFileSync, readdirSync } from 'node:fs'
import path from 'node:path'

const SRC = 'packages/ds/src'
const walk = (d, a = []) => { for (const e of readdirSync(d, { withFileTypes: true })) { const p = path.join(d, e.name); if (e.isDirectory()) walk(p, a); else a.push(p) } return a }

const dormant = JSON.parse(readFileSync('packages/ds/scripts/guards/baseline/token-var-channels-dormant.json', 'utf8'))
const vues = walk(`${SRC}/components`).filter(f => f.endsWith('.vue'))

/** slug d'un composant : OrigamDataTable -> data-table */
const slugOf = (f) => path.basename(f, '.vue').replace(/^Origam/, '')
    .replace(/([a-z0-9])([A-Z])/g, '$1-$2').replace(/([A-Z])([A-Z][a-z])/g, '$1-$2').toLowerCase()

// slug -> { style: texte des <style>, hasStyle }
const byslug = new Map()
for (const f of vues) {
    const src = readFileSync(f, 'utf8')
    const styles = [...src.matchAll(/<style[^>]*>([\s\S]*?)<\/style>/g)].map(m => m[1]).join('\n')
    const s = slugOf(f)
    const prev = byslug.get(s) || { style: '', hasStyle: false, files: [] }
    byslug.set(s, { style: prev.style + '\n' + styles, hasStyle: prev.hasStyle || styles.trim().length > 0, files: [...prev.files, f] })
}
const slugs = [...byslug.keys()].sort((a, b) => b.length - a.length)

const ownerOf = (t) => { const b = t.replace(/^--origam-/, ''); for (const s of slugs) if (b === s || b.startsWith(s + '---') || b.startsWith(s + '__') || b.startsWith(s + '--')) return s; return null }

/** tout var(--origam-…) lu quelque part (styles + scripts + ts) */
const readEverywhere = new Set()
for (const f of walk(SRC).filter(x => /\.(vue|ts)$/.test(x) && !x.endsWith('tokens.type.ts') && !x.includes('/assets/')))
    for (const m of readFileSync(f, 'utf8').matchAll(/var\(\s*(--origam-[A-Za-z0-9_-]+)/g)) readEverywhere.add(m[1])

const canon = (t) => t.replace(/^--origam-/, '').split(/-+/).filter(Boolean).sort().join('|')
const canonRead = new Map()
for (const r of readEverywhere) { const k = canon(r); if (!canonRead.has(k)) canonRead.set(k, []); canonRead.get(k).push(r) }

/** les composables transversaux qui peignent sans token dedie */
const GENERIC = /(border|rounded|elevation|margin|padding|color|size|density|dimension|position|location)/

const CSS_PROPS = new Set(['color','background-color','background','border-color','border-width','border-radius','border','font-size','font-weight','font-family','line-height','letter-spacing','padding','padding-inline','padding-block','margin','margin-inline','margin-block','gap','width','height','min-width','min-height','max-width','max-height','display','position','overflow','opacity','box-shadow','z-index','transition','transition-duration','transition-timing-function','flex','flex-direction','align-items','justify-content','text-align','cursor','fill','stroke','transform','top','left','right','bottom','inset'])

const out = []
for (const t of dormant) {
    const owner = ownerOf(t)
    const tail = (t.match(/---([a-z0-9-]+)$/) || [])[1] || ''
    const near = (canonRead.get(canon(t)) || []).filter(r => r !== t)

    let bucket, why
    if (near.length) { bucket = '6-mauvais-nom'; why = 'lu ailleurs sous ' + near[0] }
    else if (!owner) { bucket = '0-primitif'; why = 'aucun composant proprietaire' }
    else if (!byslug.get(owner).hasStyle) {
        // Le proprietaire ne peint rien lui-meme : un composant de la MEME
        // famille (meme prefixe de slug) rend-il la propriete a sa place ?
        const kin = slugs.filter(s => s !== owner && s.startsWith(owner))
        const painted = kin.some(k => byslug.get(k).hasStyle && (!CSS_PROPS.has(tail) || new RegExp(`(^|[^-\\w])${tail}\\s*:`, 'm').test(byslug.get(k).style)))
        if (painted) { bucket = '2-delegue-a-un-enfant'; why = `aucun <style> ici, mais un sous-composant rend ${tail || 'cette surface'}` }
        else { bucket = '1-sans-surface'; why = 'aucun <style> ici, et aucun sous-composant ne rend cette propriete' }
    }
    else {
        const scss = byslug.get(owner).style
        // Le token vise-t-il un enfant BEM ou un etat ? Si oui, ce selecteur
        // doit EXISTER dans le SCSS, sinon la fonctionnalite n est pas la.
        const body = t.replace(/^--origam-/, '').replace(/---.*$/, '')
        const child = (body.match(/__([a-z0-9-]+)/) || [])[1]
        const state = (body.match(/^[a-z0-9-]+--([a-z0-9-]+)$/) || [])[1]
        const scopeOk = child ? new RegExp(`(&|\\.origam-[a-z-]*)__${child}\\b`).test(scss)
            : state ? new RegExp(`(&|\\.origam-[a-z-]*)--(${state}|variant-${state}|status-${state}|color-${state})\\b`).test(scss)
            : true
        const propUsed = CSS_PROPS.has(tail) && new RegExp(`(^|[^-\\w])${tail}\\s*:`, 'm').test(scss)

        if (!scopeOk) { bucket = '3-jamais-implemente'; why = child ? `aucun selecteur __${child} dans le SCSS` : `aucun selecteur --${state} dans le SCSS` }
        else if (propUsed) { bucket = '4-ecart-de-valeur'; why = `${tail} est rendue dans un scope existant, mais pas via ce token` }
        else if (!CSS_PROPS.has(tail) && GENERIC.test(tail)) { bucket = '5-canal-generique'; why = 'sous-token d un canal transversal' }
        else { bucket = '3-jamais-implemente'; why = `aucune declaration ${tail || '(?)'} dans le SCSS du composant` }
    }
    out.push({ t, owner: owner || '(primitif)', bucket, why })
}

const counts = {}
for (const o of out) counts[o.bucket] = (counts[o.bucket] || 0) + 1
console.log('TOTAL', out.length)
for (const [b, n] of Object.entries(counts).sort()) console.log(String(n).padStart(4), b)
console.log('\n--- par composant, top 15 :')
const perComp = {}
for (const o of out) if (o.owner !== '(primitif)') perComp[o.owner] = (perComp[o.owner] || 0) + 1
for (const [c, n] of Object.entries(perComp).sort((a, b) => b[1] - a[1]).slice(0, 15)) console.log(String(n).padStart(4), c)
process.stdout.write('')
import('node:fs').then(fs => fs.writeFileSync('/tmp/classified.json', JSON.stringify(out, null, 1)))
