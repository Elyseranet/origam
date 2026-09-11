# OrigamCarousel

`<OrigamCarousel>` is a sliding content area. Wrap `<OrigamCarouselItem>` children inside it. Navigation is controlled by delimiter dots, directional arrows, or programmatically.

## Basic usage

```vue
<template>
    <OrigamCarousel>
        <OrigamCarouselItem v-for="i in 4" :key="i">
            <div class="slide">Slide {{ i }}</div>
        </OrigamCarouselItem>
    </OrigamCarousel>
</template>
```

## Auto-play

```vue
<template>
    <OrigamCarousel cycle :interval="3000">
        <OrigamCarouselItem v-for="i in 4" :key="i">...</OrigamCarouselItem>
    </OrigamCarousel>
</template>
```

| Prop | Type | Default | Description |
|---|---|---|---|
| `cycle` | `boolean` | `false` | Auto-advance slides |
| `interval` | `number \| string` | `6000` | Auto-play interval in milliseconds |

## Delimiters

```vue
<template>
    <OrigamCarousel hide-delimiters hide-delimiter-background vertical-delimiters="left">
        ...
    </OrigamCarousel>
</template>
```

| Prop | Type | Default | Description |
|---|---|---|---|
| `delimiterIcon` | `TIcon` | `MDI_ICONS.CIRCLE` | Icon for each delimiter button |
| `hideDelimiters` | `boolean` | `false` | Hide the delimiter dots |
| `hideDelimiterBackground` | `boolean` | `false` | Remove the semi-transparent bg behind delimiters |
| `verticalDelimiters` | `boolean \| TInline` | `false` | Place delimiters on the side (`'left'` or `'right'`) |

## Progress bar

```vue
<template>
    <OrigamCarousel progress>
        <OrigamCarouselItem v-for="i in 4" :key="i">...</OrigamCarouselItem>
    </OrigamCarousel>
</template>
```

| Prop | Type | Default | Description |
|---|---|---|---|
| `progress` | `boolean` | `false` | Show a progress bar at the bottom |

## Dimension

| Prop | Type | Default | Description |
|---|---|---|---|
| `height` | `string \| number` | `500` | Height of the carousel |

## Arrows

| Prop | Type | Default | Description |
|---|---|---|---|
| `showArrows` | `boolean \| 'hover'` | `true` | Show navigation arrows |
| `continuous` | `boolean` | `true` | Loop back from last to first slide |

## Slots

| Slot | Bindings | Description |
|---|---|---|
| `default` | window group | Carousel items (`<OrigamCarouselItem>`) |
| `additional` | window group | Content overlaid after items (delimiters, progress) |
| `item` | `{ props, item, index }` | Custom delimiter button |
| `item.{n}` | `{ props, item }` | Custom delimiter for index `n` |
| `progress` | `{ percent }` | Custom progress bar |
| `prev` | `{ props, canMove }` | Custom previous arrow |
| `next` | `{ props, canMove }` | Custom next arrow |
| `arrows` | `{ canMoveBack, canMoveForward, nextProps, prevProps }` | Full arrows override |

## Emits

| Event | Payload | Description |
|---|---|---|
| `update:modelValue` | `unknown` | Active slide identifier changed |

## Design tokens

| Token | Description |
|---|---|
| `--origam-carousel---overflow` | Overflow rule |
| `--origam-carousel__controls---height` | Height of the delimiter strip |
| `--origam-carousel__controls---background-color` | Background of delimiter strip |
| `--origam-carousel__controls-item---opacity` | Inactive delimiter opacity |
| `--origam-carousel__controls-item---opacity-active` | Active delimiter opacity |
| `--origam-carousel__progress---position-bottom` | Bottom offset for the progress bar |
