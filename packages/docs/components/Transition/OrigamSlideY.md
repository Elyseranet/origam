# OrigamSlideY

`<OrigamSlideY>` enters from `translateY(-15px)` and fades in. Leaving
reverses the path. The vertical slide is intentionally subtle — for
full-pane vertical slides, use `<OrigamWindowYTranslate>`.

## Basic usage

```vue
<template>
    <OrigamSlideY>
        <Banner v-if="visible">…</Banner>
    </OrigamSlideY>
</template>
```

## CSS classes emitted

```
origam-transition--slide-y-{enter|leave}-{from|active|to}
origam-transition--slide-y-move
```

`enter-active` / `leave-active` use `transition: 0.3s
cubic-bezier(0.4, 0, 0.2, 1)` on `transform, opacity`.

## Props

`ITransitionProps` — `name`, `disabled`, `group`, `hideOnLeave`,
`leaveAbsolute`, `origin`.
