<script setup lang="ts">
import { ExternalLink } from '@lucide/vue'
import type { ShopPick } from '../data/shopping'

// 建議商品卡片：有網址的整張可以點（另開分頁）
defineProps<{ picks: ShopPick[] }>()
</script>

<template>
  <component
    :is="p.url ? 'a' : 'div'"
    v-for="p in picks"
    :key="p.name"
    class="pick"
    :href="p.url"
    :target="p.url ? '_blank' : undefined"
    :rel="p.url ? 'noopener noreferrer' : undefined"
  >
    <b>{{ p.name }}</b>
    <small v-if="p.detail">{{ p.detail }}</small>
    <span class="pick-foot">
      <em>{{ p.price ?? '價格請以通路為準' }}</em>
      <span v-if="p.url" class="pick-link">{{ p.source ?? '查看' }}<ExternalLink /></span>
    </span>
  </component>
</template>
