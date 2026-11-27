/**
 * Assets de la home enso (#1592, spec v12 § 0) : PNG du brand kit A1 -> AVIF
 * sous `public/brand/enso/{light,dark,shared}/`. L'alpha est conservé (les
 * pinceaux servent de `mask-image`).
 *
 * Usage : node packages/marketing/scripts/generate-enso-assets.mjs "<dossier assets website du kit>"
 * Le kit est une donnée externe : ses fichiers ne sont que lus par sharp.
 */
import { mkdir } from 'node:fs/promises'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import sharp from 'sharp'

const KIT = process.argv[2]
if (!KIT) throw new Error('Usage: generate-enso-assets.mjs <kit>')
const OUT = resolve(dirname(fileURLToPath(import.meta.url)), '../public/brand/enso')

const HERO = 'hero-parallax/hero'
const BRUSH = 'brushes/brushes'

/** `scope` : sous-dossier de sortie ; `mode` : `{mode}` du chemin source remplacé par light/dark. */
const JOBS = [
    { name: 'gold-tick', src: `${BRUSH}/gold/gold-stroke-01.png`, scope: 'shared', widths: [60, 120], extract: { left: 1800, top: 0, width: 333, height: 440 } },
    { name: 'enso-seal', src: `${BRUSH}/enso/enso-04.png`, scope: 'shared', widths: [340, 680] },
    { name: 'brush-dry', src: `${BRUSH}/violet/brushstroke-dry.png`, scope: 'shared', widths: [1200, 2133] },
    { name: 'brush-violet-04', src: `${BRUSH}/violet/brushstroke-04.png`, scope: 'shared', widths: [1200] },
    { name: 'brush-violet-07', src: `${BRUSH}/violet/brushstroke-07.png`, scope: 'shared', widths: [1200] },
    { name: 'dry-02', src: `${BRUSH}/dry-brush-02.png`, scope: 'shared', widths: [1200] },
    { name: 'dry-05', src: `${BRUSH}/dry-brush-05.png`, scope: 'shared', widths: [1200] },
    ...['light', 'dark'].flatMap(mode => [
        { name: 'cta-mountains', src: `${HERO}/${mode}/02-mountains/mountain-range-misty-${mode}.png`, scope: mode, widths: [800, 1600, 2136] },
        { name: 'cta-ridge', src: `${HERO}/${mode}/03-landscape/forest-ridge-${mode}.png`, scope: mode, widths: [800, 1600, 1983] },
        { name: 'cta-foreground', src: `${HERO}/${mode}/07-foreground/foreground-1-${mode}.png`, scope: mode, widths: [800, 1600, 1983] }
    ])
]

async function write (pipeline, scope, name, width, quality) {
    const dir = join(OUT, scope)
    await mkdir(dir, { recursive: true })
    const file = join(dir, `${name}-${width}.avif`)
    const info = await pipeline.resize(width).avif({ quality }).toFile(file)
    console.log(`${scope}/${name}-${width}.avif ${info.width}x${info.height} ${info.size}`)
}

for (const job of JOBS) {
    for (const width of job.widths) {
        let img = sharp(join(KIT, job.src))
        if (job.extract) img = img.extract(job.extract)
        await write(img, job.scope, job.name, width, 50)
    }
}

/* § 0.1 — disque solaire : alpha = écart au papier sur le canal bleu, couleur dé-prémultipliée. */
const PAPER = [253, 245, 238]
const { data, info } = await sharp(join(KIT, `${HERO}/light/01-sky/sky-sun-clouds-light.png`))
    .extract({ left: 2950, top: 90, width: 720, height: 660 })
    .removeAlpha().raw().toBuffer({ resolveWithObject: true })
const rgba = Buffer.alloc(info.width * info.height * 4)
for (let i = 0, j = 0; i < data.length; i += 3, j += 4) {
    let a = Math.min(1, Math.max(0, (PAPER[2] - data[i + 2]) / 200))
    a = Math.max(0, (a - 0.04) / 0.96)
    for (let k = 0; k < 3; k++) rgba[j + k] = a > 0.01 ? Math.min(255, Math.max(0, (data[i + k] - PAPER[k] * (1 - a)) / a)) : 0
    rgba[j + 3] = Math.round(a * 255)
}
for (const width of [270, 540]) {
    await write(sharp(rgba, { raw: { width: info.width, height: info.height, channels: 4 } }), 'shared', 'sun-disc', width, 70)
}
