<template>
  <span
    class="site-logo"
    data-cy="site-logo"
  >
    <origam-img
      class="site-logo__img site-logo__img--light"
      :src="BRAND_LOGO_LIGHT.src"
      :srcset="BRAND_LOGO_LIGHT.srcset"
      :alt="alt"
      :width="BRAND_LOGO_WIDTH"
      :height="BRAND_LOGO_HEIGHT"
      eager
    />
    <origam-img
      class="site-logo__img site-logo__img--dark"
      :src="BRAND_LOGO_DARK.src"
      :srcset="BRAND_LOGO_DARK.srcset"
      :alt="alt"
      :width="BRAND_LOGO_WIDTH"
      :height="BRAND_LOGO_HEIGHT"
      eager
    />
  </span>
</template>

<script setup lang="ts">
import { BRAND_LOGO_DARK, BRAND_LOGO_HEIGHT, BRAND_LOGO_LIGHT, BRAND_LOGO_WIDTH } from '~/consts/brand.const'
import type { ISiteLogoProps } from '~/interfaces/brand.interface'

/*********************************************************
 * Props, emits & slots
 *
 * @description
 * Le logo suit le mode clair / sombre du site, pas celui du système : les
 * deux images sont rendues, une seule est affichée (cf. le bloc CSS non scopé).
 ********************************************************/
defineProps<ISiteLogoProps>()

defineEmits([])

defineSlots<Record<string, never>>()

/*********************************************************
 * Expose
 *
 * @description
 * Rien à piloter depuis l'extérieur.
 ********************************************************/
defineExpose({})
</script>

<style scoped lang="scss">
  .site-logo {
    display: inline-flex;
    flex: none;
    inline-size: 85px;
    block-size: 32px;
  }

  .site-logo__img {
    inline-size: 100%;
    block-size: 100%;
  }
</style>

<style lang="scss">
  span.site-logo .site-logo__img--dark {
    display: none;
  }

  :root[data-mode="dark"] span.site-logo .site-logo__img--light {
    display: none;
  }

  :root[data-mode="dark"] span.site-logo .site-logo__img--dark {
    display: block;
  }

  @media (prefers-color-scheme: dark) {
    :root:not([data-mode]) span.site-logo .site-logo__img--light {
      display: none;
    }

    :root:not([data-mode]) span.site-logo .site-logo__img--dark {
      display: block;
    }
  }
</style>
