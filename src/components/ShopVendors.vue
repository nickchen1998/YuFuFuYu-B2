<script setup lang="ts">
import { ExternalLink, Phone } from '@lucide/vue'
import type { ShopVendor } from '../data/shopping'

defineProps<{ vendors: ShopVendor[] }>()
</script>

<template>
  <div v-for="v in vendors" :key="v.name" class="vendor">
    <b>{{ v.name }}</b>
    <small v-if="v.detail">{{ v.detail }}</small>
    <div v-if="v.phone || v.url" class="vendor-links">
      <a v-if="v.phone" :href="`tel:${v.phone.replace(/[^\d+]/g, '')}`"><Phone />{{ v.phone }}</a>
      <a v-if="v.url" :href="v.url" target="_blank" rel="noopener noreferrer"><ExternalLink />網站</a>
    </div>
  </div>
</template>
