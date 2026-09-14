# Composables — Video

> ⛔ Page **generee** depuis les sources par `packages/ds/scripts/analysis/gen-composables-doc.mjs`, et **verifiee** par le garde
> `composables-doc-sync`. Signature, description et consommateurs sont lus dans le code :
> rien n'est redige ici. Corriger une description se fait dans la banniere du symbole,
> puis en regenerant. Issue #545.

1 symbole(s) exporte(s).

## `useVideoPlayer`

```ts
export function useVideoPlayer (options: IUseVideoPlayerOptions =
```

Headless video player composable. Composes the media-shared
`useMediaPlayer` base and layers on the video-only state
(`fullscreen`, `pip`) + methods (`enterFullscreen`,
`exitFullscreen`, `toggleFullscreen`, `requestPip`, `exitPip`,
`togglePip`) + native event bindings
(`enterpictureinpicture` / `leavepictureinpicture` /
document-level `fullscreenchange`).

The composable does NOT mount the `<video>` element — consumers pass
a ref (or accept the one the composable creates) and bind it on the
`<video>` tag themselves. This keeps the headless / styled split
clean: `<OrigamVideo>` is just a default skin on top of this state.

**Exemple**

```ts
const videoRef = ref<HTMLVideoElement | null>(null)
const { state, methods } = useVideoPlayer({ videoRef, autoplay: false })

// template:
// <video ref="videoRef" src="…" />
```

**Source** : `packages/ds/src/composables/Video/video-player.composable.ts`

**Consommateurs** (4) : `components/Video/OrigamVideo.vue`, `interfaces/Media/media-controller.interface.ts`, `interfaces/Media/media-player.interface.ts`, `interfaces/Video/video.interface.ts`

