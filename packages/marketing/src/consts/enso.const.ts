import { COLOR_MODE } from 'origam/enums'
import type { IEnsoArt, IEnsoDemoMode, IEnsoGalleryItem, IEnsoPetalFlight, IEnsoSharedArt } from '~/interfaces/enso.interface'

/**
 * Refonte enso / sumi-e (#1569, lot E1 #1570) : assets du brand kit A1 convertis
 * en AVIF (sharp, qualité 50 ; textures papier en qualité 80, sinon leur grain
 * disparaît), servis depuis `public/brand/enso/{light,dark,shared}/`.
 *
 * Chaque `IEnsoArt` porte une variante par mode, jamais d'`invert()` : c'est le
 * mode de la page (`data-mode`) qui choisit. `width` / `height` sont ceux du plus
 * grand fichier livré (le ratio à réserver) ; `srcset` liste toutes les largeurs,
 * pour `<origam-img :srcset>` ou pour `ensoArtVars()` (fonds CSS).
 *
 * ⚠️ `ENSO_HERO_SKY.dark` est un ciel CLAIR dans le kit lui-même (fond papier,
 * mesuré) : sur un fond encre, préférer `ENSO_HERO_SUN` seul.
 */

export const ENSO_HERO_SKY: IEnsoArt = {
    width: 2880,
    height: 623,
    light: {
        src: '/brand/enso/light/hero-sky-2880.avif',
        srcset: '/brand/enso/light/hero-sky-960.avif 960w, /brand/enso/light/hero-sky-1920.avif 1920w, /brand/enso/light/hero-sky-2880.avif 2880w'
    },
    dark: {
        src: '/brand/enso/dark/hero-sky-2880.avif',
        srcset: '/brand/enso/dark/hero-sky-960.avif 960w, /brand/enso/dark/hero-sky-1920.avif 1920w, /brand/enso/dark/hero-sky-2880.avif 2880w'
    }
}

export const ENSO_HERO_SUN: IEnsoArt = {
    width: 700,
    height: 700,
    light: {
        src: '/brand/enso/light/hero-sun-700.avif',
        srcset: '/brand/enso/light/hero-sun-350.avif 350w, /brand/enso/light/hero-sun-700.avif 700w'
    },
    dark: {
        src: '/brand/enso/dark/hero-sun-700.avif',
        srcset: '/brand/enso/dark/hero-sun-350.avif 350w, /brand/enso/dark/hero-sun-700.avif 700w'
    }
}

export const ENSO_HERO_MOUNTAINS: IEnsoArt = {
    width: 1899,
    height: 386,
    light: {
        src: '/brand/enso/light/hero-mountains-1899.avif',
        srcset: '/brand/enso/light/hero-mountains-640.avif 640w, /brand/enso/light/hero-mountains-1280.avif 1280w, /brand/enso/light/hero-mountains-1899.avif 1899w'
    },
    dark: {
        src: '/brand/enso/dark/hero-mountains-1899.avif',
        srcset: '/brand/enso/dark/hero-mountains-640.avif 640w, /brand/enso/dark/hero-mountains-1280.avif 1280w, /brand/enso/dark/hero-mountains-1899.avif 1899w'
    }
}

export const ENSO_HERO_LANDSCAPE: IEnsoArt = {
    width: 1978,
    height: 347,
    light: {
        src: '/brand/enso/light/hero-landscape-1978.avif',
        srcset: '/brand/enso/light/hero-landscape-640.avif 640w, /brand/enso/light/hero-landscape-1280.avif 1280w, /brand/enso/light/hero-landscape-1978.avif 1978w'
    },
    dark: {
        src: '/brand/enso/dark/hero-landscape-1978.avif',
        srcset: '/brand/enso/dark/hero-landscape-640.avif 640w, /brand/enso/dark/hero-landscape-1280.avif 1280w, /brand/enso/dark/hero-landscape-1978.avif 1978w'
    }
}

export const ENSO_HERO_ARCHITECTURE: IEnsoArt = {
    width: 1192,
    height: 1274,
    light: {
        src: '/brand/enso/light/hero-architecture-1192.avif',
        srcset: '/brand/enso/light/hero-architecture-400.avif 400w, /brand/enso/light/hero-architecture-800.avif 800w, /brand/enso/light/hero-architecture-1192.avif 1192w'
    },
    dark: {
        src: '/brand/enso/dark/hero-architecture-1192.avif',
        srcset: '/brand/enso/dark/hero-architecture-400.avif 400w, /brand/enso/dark/hero-architecture-800.avif 800w, /brand/enso/dark/hero-architecture-1192.avif 1192w'
    }
}

export const ENSO_HERO_SAKURA: IEnsoArt = {
    width: 1760,
    height: 863,
    light: {
        src: '/brand/enso/light/hero-sakura-1760.avif',
        srcset: '/brand/enso/light/hero-sakura-480.avif 480w, /brand/enso/light/hero-sakura-960.avif 960w, /brand/enso/light/hero-sakura-1760.avif 1760w'
    },
    dark: {
        src: '/brand/enso/dark/hero-sakura-1760.avif',
        srcset: '/brand/enso/dark/hero-sakura-480.avif 480w, /brand/enso/dark/hero-sakura-960.avif 960w, /brand/enso/dark/hero-sakura-1760.avif 1760w'
    }
}

export const ENSO_HERO_BRUSH: IEnsoArt = {
    width: 2133,
    height: 724,
    light: {
        src: '/brand/enso/light/hero-brush-2133.avif',
        srcset: '/brand/enso/light/hero-brush-640.avif 640w, /brand/enso/light/hero-brush-1280.avif 1280w, /brand/enso/light/hero-brush-2133.avif 2133w'
    },
    dark: {
        src: '/brand/enso/dark/hero-brush-2133.avif',
        srcset: '/brand/enso/dark/hero-brush-640.avif 640w, /brand/enso/dark/hero-brush-1280.avif 1280w, /brand/enso/dark/hero-brush-2133.avif 2133w'
    }
}

export const ENSO_PETAL_01: IEnsoArt = {
    width: 96,
    height: 96,
    light: {
        src: '/brand/enso/light/petal-01-96.avif',
        srcset: '/brand/enso/light/petal-01-96.avif 96w'
    },
    dark: {
        src: '/brand/enso/dark/petal-01-96.avif',
        srcset: '/brand/enso/dark/petal-01-96.avif 96w'
    }
}

export const ENSO_PETAL_07: IEnsoArt = {
    width: 96,
    height: 96,
    light: {
        src: '/brand/enso/light/petal-07-96.avif',
        srcset: '/brand/enso/light/petal-07-96.avif 96w'
    },
    dark: {
        src: '/brand/enso/dark/petal-07-96.avif',
        srcset: '/brand/enso/dark/petal-07-96.avif 96w'
    }
}

export const ENSO_PETAL_12: IEnsoArt = {
    width: 96,
    height: 96,
    light: {
        src: '/brand/enso/light/petal-12-96.avif',
        srcset: '/brand/enso/light/petal-12-96.avif 96w'
    },
    dark: {
        src: '/brand/enso/dark/petal-12-96.avif',
        srcset: '/brand/enso/dark/petal-12-96.avif 96w'
    }
}

export const ENSO_CIRCLE_OPEN: IEnsoArt = {
    width: 800,
    height: 778,
    light: {
        src: '/brand/enso/light/enso-open-800.avif',
        srcset: '/brand/enso/light/enso-open-400.avif 400w, /brand/enso/light/enso-open-800.avif 800w'
    },
    dark: {
        src: '/brand/enso/dark/enso-open-800.avif',
        srcset: '/brand/enso/dark/enso-open-400.avif 400w, /brand/enso/dark/enso-open-800.avif 800w'
    }
}

export const ENSO_CIRCLE_WIDE: IEnsoArt = {
    width: 800,
    height: 778,
    light: {
        src: '/brand/enso/light/enso-wide-800.avif',
        srcset: '/brand/enso/light/enso-wide-400.avif 400w, /brand/enso/light/enso-wide-800.avif 800w'
    },
    dark: {
        src: '/brand/enso/dark/enso-wide-800.avif',
        srcset: '/brand/enso/dark/enso-wide-400.avif 400w, /brand/enso/dark/enso-wide-800.avif 800w'
    }
}

export const ENSO_PAPER_GRAIN: IEnsoArt = {
    width: 1024,
    height: 1024,
    light: {
        src: '/brand/enso/light/paper-grain-1024.avif',
        srcset: '/brand/enso/light/paper-grain-1024.avif 1024w'
    },
    dark: {
        src: '/brand/enso/dark/paper-grain-1024.avif',
        srcset: '/brand/enso/dark/paper-grain-1024.avif 1024w'
    }
}

export const ENSO_PAPER_WASHI: IEnsoArt = {
    width: 1024,
    height: 1024,
    light: {
        src: '/brand/enso/light/paper-washi-1024.avif',
        srcset: '/brand/enso/light/paper-washi-1024.avif 1024w'
    },
    dark: {
        src: '/brand/enso/dark/paper-washi-1024.avif',
        srcset: '/brand/enso/dark/paper-washi-1024.avif 1024w'
    }
}

export const ENSO_BRUSH_VIOLET: IEnsoSharedArt = {
    width: 1920,
    height: 652,
    src: '/brand/enso/shared/brush-violet-1920.avif',
    srcset: '/brand/enso/shared/brush-violet-480.avif 480w, /brand/enso/shared/brush-violet-960.avif 960w, /brand/enso/shared/brush-violet-1920.avif 1920w'
}

export const ENSO_BRUSH_GOLD: IEnsoSharedArt = {
    width: 1920,
    height: 652,
    src: '/brand/enso/shared/brush-gold-1920.avif',
    srcset: '/brand/enso/shared/brush-gold-480.avif 480w, /brand/enso/shared/brush-gold-960.avif 960w, /brand/enso/shared/brush-gold-1920.avif 1920w'
}

export const ENSO_BRUSH_IVORY: IEnsoSharedArt = {
    width: 1920,
    height: 652,
    src: '/brand/enso/shared/brush-ivory-1920.avif',
    srcset: '/brand/enso/shared/brush-ivory-480.avif 480w, /brand/enso/shared/brush-ivory-960.avif 960w, /brand/enso/shared/brush-ivory-1920.avif 1920w'
}


/*
 * Home enso v12 (#1592, lot I0). Fichiers produits par `scripts/generate-enso-assets.mjs`.
 * Les `IEnsoSharedArt` ci-dessous valent pour les deux modes ; ceux qui servent de
 * `mask-image` (MASK) ne comptent que par leur alpha : poser `src` (même origine,
 * sinon CORS) et jamais `srcset`, `image-set()` n'étant pas fiable dans `mask-image`.
 */

export const ENSO_GOLD_TICK: IEnsoSharedArt = {
    width: 60,
    height: 79,
    src: '/brand/enso/shared/gold-tick-120.avif',
    srcset: '/brand/enso/shared/gold-tick-60.avif 60w, /brand/enso/shared/gold-tick-120.avif 120w'
}

export const ENSO_SUN_DISC: IEnsoSharedArt = {
    width: 540,
    height: 495,
    src: '/brand/enso/shared/sun-disc-540.avif',
    srcset: '/brand/enso/shared/sun-disc-270.avif 270w, /brand/enso/shared/sun-disc-540.avif 540w'
}

export const ENSO_SEAL: IEnsoSharedArt = {
    width: 680,
    height: 661,
    src: '/brand/enso/shared/enso-seal-680.avif',
    srcset: '/brand/enso/shared/enso-seal-340.avif 340w, /brand/enso/shared/enso-seal-680.avif 680w'
}

export const ENSO_MASK_BRUSH_DRY: IEnsoSharedArt = {
    width: 2133,
    height: 707,
    src: '/brand/enso/shared/brush-dry-2133.avif',
    srcset: '/brand/enso/shared/brush-dry-1200.avif 1200w, /brand/enso/shared/brush-dry-2133.avif 2133w'
}

export const ENSO_MASK_BRUSH_VIOLET_04: IEnsoSharedArt = {
    width: 1200,
    height: 398,
    src: '/brand/enso/shared/brush-violet-04-1200.avif',
    srcset: '/brand/enso/shared/brush-violet-04-1200.avif 1200w'
}

export const ENSO_MASK_BRUSH_VIOLET_07: IEnsoSharedArt = {
    width: 1200,
    height: 407,
    src: '/brand/enso/shared/brush-violet-07-1200.avif',
    srcset: '/brand/enso/shared/brush-violet-07-1200.avif 1200w'
}

export const ENSO_MASK_DRY_02: IEnsoSharedArt = {
    width: 1200,
    height: 407,
    src: '/brand/enso/shared/dry-02-1200.avif',
    srcset: '/brand/enso/shared/dry-02-1200.avif 1200w'
}

export const ENSO_MASK_DRY_05: IEnsoSharedArt = {
    width: 1200,
    height: 407,
    src: '/brand/enso/shared/dry-05-1200.avif',
    srcset: '/brand/enso/shared/dry-05-1200.avif 1200w'
}

export const ENSO_CTA_MOUNTAINS: IEnsoArt = {
    width: 2136,
    height: 535,
    light: {
        src: '/brand/enso/light/cta-mountains-2136.avif',
        srcset: '/brand/enso/light/cta-mountains-800.avif 800w, /brand/enso/light/cta-mountains-1600.avif 1600w, /brand/enso/light/cta-mountains-2136.avif 2136w'
    },
    dark: {
        src: '/brand/enso/dark/cta-mountains-2136.avif',
        srcset: '/brand/enso/dark/cta-mountains-800.avif 800w, /brand/enso/dark/cta-mountains-1600.avif 1600w, /brand/enso/dark/cta-mountains-2136.avif 2136w'
    }
}

export const ENSO_CTA_RIDGE: IEnsoArt = {
    width: 1983,
    height: 382,
    light: {
        src: '/brand/enso/light/cta-ridge-1983.avif',
        srcset: '/brand/enso/light/cta-ridge-800.avif 800w, /brand/enso/light/cta-ridge-1600.avif 1600w, /brand/enso/light/cta-ridge-1983.avif 1983w'
    },
    dark: {
        src: '/brand/enso/dark/cta-ridge-1983.avif',
        srcset: '/brand/enso/dark/cta-ridge-800.avif 800w, /brand/enso/dark/cta-ridge-1600.avif 1600w, /brand/enso/dark/cta-ridge-1983.avif 1983w'
    }
}

export const ENSO_CTA_FOREGROUND: IEnsoArt = {
    width: 1983,
    height: 793,
    light: {
        src: '/brand/enso/light/cta-foreground-1983.avif',
        srcset: '/brand/enso/light/cta-foreground-800.avif 800w, /brand/enso/light/cta-foreground-1600.avif 1600w, /brand/enso/light/cta-foreground-1983.avif 1983w'
    },
    dark: {
        src: '/brand/enso/dark/cta-foreground-1983.avif',
        srcset: '/brand/enso/dark/cta-foreground-800.avif 800w, /brand/enso/dark/cta-foreground-1600.avif 1600w, /brand/enso/dark/cta-foreground-1983.avif 1983w'
    }
}

/** Trait qui suit le mode : violet terminé en doré sur papier, ivoire terminé en doré sur encre. */
export const ENSO_BRUSH: IEnsoArt = {
    width: ENSO_BRUSH_VIOLET.width,
    height: ENSO_BRUSH_VIOLET.height,
    light: ENSO_BRUSH_VIOLET,
    dark: ENSO_BRUSH_IVORY
}

/** Largeur d'affichage (px CSS) qui choisit le fichier 1x / 2x des fonds CSS. */
export const ENSO_PAPER_TILE_WIDTH = 512

/** Largeurs d'affichage (px) qui choisissent le fichier du trait : lien actif, bord bas du header. */
export const ENSO_NAV_BRUSH_WIDTH = 240
export const ENSO_BAR_BRUSH_WIDTH = 1920
export const ENSO_PETAL_WIDTH = 40

/**
 * Trajectoires des pétales, toutes différentes (départ, dérive, durée, délai
 * négatif : la pluie est déjà en cours au chargement). Leur nombre est le
 * plafond de `count` ; les six premières restent visibles sur mobile.
 */
export const ENSO_PETAL_FLIGHTS: readonly IEnsoPetalFlight[] = [
    { art: ENSO_PETAL_01, start: '8%', drift: '18vw', duration: '14s', delay: '-2s', scale: 1, spin: '320deg' },
    { art: ENSO_PETAL_07, start: '22%', drift: '12vw', duration: '17s', delay: '-9s', scale: 0.7, spin: '-260deg' },
    { art: ENSO_PETAL_12, start: '41%', drift: '22vw', duration: '12s', delay: '-5s', scale: 0.85, spin: '400deg' },
    { art: ENSO_PETAL_01, start: '57%', drift: '10vw', duration: '19s', delay: '-13s', scale: 0.6, spin: '-300deg' },
    { art: ENSO_PETAL_07, start: '73%', drift: '16vw', duration: '15s', delay: '-1s', scale: 0.95, spin: '280deg' },
    { art: ENSO_PETAL_12, start: '88%', drift: '8vw', duration: '18s', delay: '-11s', scale: 0.75, spin: '-360deg' },
    { art: ENSO_PETAL_07, start: '3%', drift: '24vw', duration: '16s', delay: '-7s', scale: 0.55, spin: '240deg' },
    { art: ENSO_PETAL_12, start: '31%', drift: '14vw', duration: '20s', delay: '-16s', scale: 0.9, spin: '-220deg' },
    { art: ENSO_PETAL_01, start: '49%', drift: '20vw', duration: '13s', delay: '-4s', scale: 0.65, spin: '340deg' },
    { art: ENSO_PETAL_12, start: '66%', drift: '11vw', duration: '21s', delay: '-18s', scale: 0.8, spin: '-380deg' },
    { art: ENSO_PETAL_01, start: '81%', drift: '15vw', duration: '15s', delay: '-8s', scale: 0.5, spin: '300deg' },
    { art: ENSO_PETAL_07, start: '95%', drift: '6vw', duration: '18s', delay: '-14s', scale: 0.7, spin: '-240deg' }
]

/** Page de contrôle `/enso` (lots E2 à E5) : les deux modes côte à côte. */
export const ENSO_DEMO_MODES: readonly IEnsoDemoMode[] = [
    { mode: COLOR_MODE.LIGHT, headingId: 'enso-demo-light', labelKey: 'enso_demo.mode_light', labelFallback: 'Light' },
    { mode: COLOR_MODE.DARK, headingId: 'enso-demo-dark', labelKey: 'enso_demo.mode_dark', labelFallback: 'Dark' }
]

export const ENSO_DEMO_GALLERY_SIZES = '(min-width: 64rem) 14rem, 45vw'

export const ENSO_GALLERY: readonly IEnsoGalleryItem[] = [
    { name: 'ENSO_HERO_SKY', art: ENSO_HERO_SKY },
    { name: 'ENSO_HERO_SUN', art: ENSO_HERO_SUN },
    { name: 'ENSO_HERO_MOUNTAINS', art: ENSO_HERO_MOUNTAINS },
    { name: 'ENSO_HERO_LANDSCAPE', art: ENSO_HERO_LANDSCAPE },
    { name: 'ENSO_HERO_ARCHITECTURE', art: ENSO_HERO_ARCHITECTURE },
    { name: 'ENSO_HERO_SAKURA', art: ENSO_HERO_SAKURA },
    { name: 'ENSO_HERO_BRUSH', art: ENSO_HERO_BRUSH },
    { name: 'ENSO_CIRCLE_OPEN', art: ENSO_CIRCLE_OPEN },
    { name: 'ENSO_CIRCLE_WIDE', art: ENSO_CIRCLE_WIDE },
    { name: 'ENSO_BRUSH', art: ENSO_BRUSH },
    { name: 'ENSO_GOLD_TICK', art: ENSO_GOLD_TICK },
    { name: 'ENSO_SUN_DISC', art: ENSO_SUN_DISC },
    { name: 'ENSO_SEAL', art: ENSO_SEAL },
    { name: 'ENSO_MASK_BRUSH_DRY', art: ENSO_MASK_BRUSH_DRY },
    { name: 'ENSO_MASK_BRUSH_VIOLET_04', art: ENSO_MASK_BRUSH_VIOLET_04 },
    { name: 'ENSO_MASK_BRUSH_VIOLET_07', art: ENSO_MASK_BRUSH_VIOLET_07 },
    { name: 'ENSO_MASK_DRY_02', art: ENSO_MASK_DRY_02 },
    { name: 'ENSO_MASK_DRY_05', art: ENSO_MASK_DRY_05 },
    { name: 'ENSO_CTA_MOUNTAINS', art: ENSO_CTA_MOUNTAINS },
    { name: 'ENSO_CTA_RIDGE', art: ENSO_CTA_RIDGE },
    { name: 'ENSO_CTA_FOREGROUND', art: ENSO_CTA_FOREGROUND }
]
