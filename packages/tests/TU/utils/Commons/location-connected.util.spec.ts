// TU — connectedLocationStrategy (updateLocation) : caracterisation du
// comportement AVANT le refactor S3776 du lot #1398. Les valeurs sont
// epinglees telles que mesurees sur le code d'origine.
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { effectScope, ref } from 'vue'
import { connectedLocationStrategy } from '@origam/utils/Commons/location.util'

const VIEWPORT = { w: 1000, h: 800 }

function rect (x: number, y: number, width: number, height: number) {
    return { x, y, width, height, top: y, left: x, right: x + width, bottom: y + height } as DOMRect
}

function run (opts: {
    target: [number, number, number, number]
    content: [number, number]
    location: string
    origin?: string
    offset?: number | string | number[]
    viewportMargin?: number
}) {
    const target = document.createElement('div')
    const content = document.createElement('div')
    document.body.append(target, content)
    target.getBoundingClientRect = () => rect(...opts.target)
    content.getBoundingClientRect = () => rect(0, 0, opts.content[0], opts.content[1])

    const styles = ref<Record<string, string>>({})
    const scope = effectScope()
    const out = scope.run(() => connectedLocationStrategy(
        { target: ref(target), contentEl: ref(content), isActive: ref(true) } as never,
        {
            location: opts.location,
            origin: opts.origin ?? 'auto',
            offset: opts.offset,
            viewportMargin: opts.viewportMargin ?? 0
        } as never,
        styles as never
    ))!
    const result = out.updateLocation()
    scope.stop()
    target.remove()
    content.remove()
    return { styles: { ...styles.value }, result }
}

beforeEach(() => {
    vi.stubGlobal('ResizeObserver', class { observe () {} unobserve () {} disconnect () {} })
    Object.defineProperty(document.documentElement, 'clientWidth', { configurable: true, value: VIEWPORT.w })
    Object.defineProperty(document.documentElement, 'clientHeight', { configurable: true, value: VIEWPORT.h })
})
afterEach(() => { vi.unstubAllGlobals() })

const EXPECTED: Record<string, { styles: Record<string, string>, available: { x: number, y: number } }> = {
    "bottom, no overflow": {
        "styles": {
            "--origam-overlay-anchor-origin": "bottom left",
            "transformOrigin": "top left",
            "top": "130px",
            "left": "100px",
            "minWidth": "80px",
            "maxWidth": "1000px",
            "maxHeight": "800px"
        },
        "available": {
            "x": 1000,
            "y": 800
        }
    },
    "bottom start offset": {
        "styles": {
            "--origam-overlay-anchor-origin": "bottom left",
            "transformOrigin": "top left",
            "top": "138px",
            "left": "100px",
            "minWidth": "80px",
            "maxWidth": "1000px",
            "maxHeight": "800px"
        },
        "available": {
            "x": 1000,
            "y": 800
        }
    },
    "top with array offset": {
        "styles": {
            "--origam-overlay-anchor-origin": "top left",
            "transformOrigin": "bottom left",
            "top": "306px",
            "left": "294px",
            "minWidth": "80px",
            "maxWidth": "1000px",
            "maxHeight": "800px"
        },
        "available": {
            "x": 1000,
            "y": 800
        }
    },
    "right string offset": {
        "styles": {
            "--origam-overlay-anchor-origin": "right top",
            "transformOrigin": "left top",
            "top": "93px",
            "left": "185px",
            "maxWidth": "1000px",
            "maxHeight": "800px"
        },
        "available": {
            "x": 1000,
            "y": 800
        }
    },
    "left": {
        "styles": {
            "--origam-overlay-anchor-origin": "left top",
            "transformOrigin": "right top",
            "top": "300px",
            "left": "380px",
            "maxWidth": "1000px",
            "maxHeight": "800px"
        },
        "available": {
            "x": 1000,
            "y": 800
        }
    },
    "bottom flips on Y overflow": {
        "styles": {
            "--origam-overlay-anchor-origin": "top left",
            "transformOrigin": "bottom left",
            "top": "610px",
            "left": "100px",
            "minWidth": "80px",
            "maxWidth": "1000px",
            "maxHeight": "800px"
        },
        "available": {
            "x": 1000,
            "y": 800
        }
    },
    "right flips on X overflow": {
        "styles": {
            "--origam-overlay-anchor-origin": "left top",
            "transformOrigin": "right top",
            "top": "100px",
            "left": "750px",
            "maxWidth": "1000px",
            "maxHeight": "800px"
        },
        "available": {
            "x": 1000,
            "y": 800
        }
    },
    "shift X (overflow both sides)": {
        "styles": {
            "--origam-overlay-anchor-origin": "bottom center",
            "transformOrigin": "top center",
            "top": "130px",
            "left": "0px",
            "minWidth": "80px",
            "maxWidth": "1000px",
            "maxHeight": "800px"
        },
        "available": {
            "x": 1000,
            "y": 800
        }
    },
    "content larger than viewport": {
        "styles": {
            "--origam-overlay-anchor-origin": "bottom left",
            "transformOrigin": "top left",
            "top": "0px",
            "left": "0px",
            "minWidth": "80px",
            "maxWidth": "600px",
            "maxHeight": "400px"
        },
        "available": {
            "x": 600,
            "y": 400
        }
    },
    "overlap origin + margin": {
        "styles": {
            "--origam-overlay-anchor-origin": "top left",
            "transformOrigin": "top left",
            "top": "100px",
            "left": "100px",
            "minWidth": "80px",
            "maxWidth": "976px",
            "maxHeight": "776px"
        },
        "available": {
            "x": 976,
            "y": 776
        }
    },
    "explicit origin": {
        "styles": {
            "--origam-overlay-anchor-origin": "bottom left",
            "transformOrigin": "top left",
            "top": "330px",
            "left": "400px",
            "minWidth": "80px",
            "maxWidth": "1000px",
            "maxHeight": "800px"
        },
        "available": {
            "x": 1000,
            "y": 800
        }
    }
}

const CASES: Array<[string, Parameters<typeof run>[0]]> = [
    ['bottom, no overflow', { target: [100, 100, 80, 30], content: [200, 100], location: 'bottom' }],
    ['bottom start offset', { target: [100, 100, 80, 30], content: [200, 100], location: 'bottom', offset: 8 }],
    ['top with array offset', { target: [300, 400, 80, 30], content: [150, 90], location: 'top', offset: [4, 6] }],
    ['right string offset', { target: [100, 100, 80, 30], content: [120, 60], location: 'right', offset: '5 7' }],
    ['left', { target: [500, 300, 80, 30], content: [120, 60], location: 'left' }],
    ['bottom flips on Y overflow', { target: [100, 760, 80, 30], content: [200, 150], location: 'bottom' }],
    ['right flips on X overflow', { target: [900, 100, 80, 30], content: [150, 60], location: 'right' }],
    ['shift X (overflow both sides)', { target: [10, 100, 80, 30], content: [300, 60], location: 'bottom center' }],
    ['content larger than viewport', { target: [100, 100, 80, 30], content: [1400, 1200], location: 'bottom' }],
    ['overlap origin + margin', { target: [100, 100, 80, 30], content: [100, 50], location: 'top left', origin: 'overlap', viewportMargin: 12 }],
    ['explicit origin', { target: [400, 300, 80, 30], content: [100, 50], location: 'bottom left', origin: 'top left' }]
]

describe('connectedLocationStrategy.updateLocation (caracterisation)', () => {
    it.each(CASES)('%s', (name, opts) => {
        const { styles, result } = run(opts)
        expect({ styles, available: result && result.available }).toEqual(EXPECTED[name])
    })
})
