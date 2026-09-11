# Composables — Media

> ⛔ Page **generee** depuis les sources par `packages/ds/scripts/analysis/gen-composables-doc.mjs`, et **verifiee** par le garde
> `composables-doc-sync`. Signature, description et consommateurs sont lus dans le code :
> rien n'est redige ici. Corriger une description se fait dans la banniere du symbole,
> puis en regenerant. Issue #545.

2 symbole(s) exporte(s).

## `shouldSuppressAutoplay`

```ts
export function shouldSuppressAutoplay (): boolean
```

Reduced-motion check exported for the host components — kept here
so the single source of truth for "should autoplay run?" stays in
the composable, even when the decision is made by the SFC at
attribute resolution time (i.e. before the composable's onMounted
has fired).

**Source** : `packages/ds/src/composables/Media/use-media-player.composable.ts`

**Consommateurs** (3) : `components/Audio/OrigamAudio.vue`, `components/Video/OrigamVideo.vue`, `utils/Commons/animation.util.ts`

## `useMediaPlayer`

```ts
export function useMediaPlayer (options: IUseMediaPlayerOptions =
```

Headless media-player composable. Owns the media-shared runtime
state (`playing`, `paused`, `currentTime`, `duration`, `buffered`,
`volume`, `muted`, `playbackRate`, `ready`, `loading`, `error`,
`remoteAvailable`, `remoteState`) and exposes imperative methods
that wrap the standard `HTMLMediaElement` API.

Works for BOTH `HTMLVideoElement` and `HTMLAudioElement` — the
composable types its element ref against `HTMLMediaElement`, the
common ancestor. `useVideoPlayer` and `useAudioPlayer` layer their
own specialisations on top of this base.

**Exemple**

```ts
const audioRef = ref<HTMLAudioElement | null>(null)
const { state, methods } = useMediaPlayer({ mediaRef: audioRef })

// template:
// <audio ref="audioRef" src="…" />
```

**Source** : `packages/ds/src/composables/Media/use-media-player.composable.ts`

**Consommateurs** (4) : `consts/Media/media.const.ts`, `interfaces/Media/media-controller.interface.ts`, `interfaces/Media/media-player.interface.ts`, `utils/Commons/animation.util.ts`

