<script setup lang="ts">
import { ExternalLink } from '@lucide/vue'
import { money, pickCost, type ShopPick } from '../data/shopping'
import { isPicked, pickKey, togglePick } from '../purchases'

// 建議商品：勾選的會計入總花費（推薦的預設勾選）；商品連結另開新分頁
const props = defineProps<{ picks: ShopPick[]; group: string; qty: number }>()

const key = (p: ShopPick) => pickKey(props.group, p.name)
const picked = (p: ShopPick) => isPicked(key(p), p.rec)

function costText(p: ShopPick) {
  const unit = pickCost(p)
  if (unit == null) return '沒有價格，未計入'
  if (unit === 0) return p.costNote ?? '不另計'
  const extra = p.costNote ? `（${p.costNote}）` : ''
  return props.qty > 1 ? `${money(unit)} × ${props.qty} = ${money(unit * props.qty)}${extra}` : `${money(unit)}${extra}`
}
</script>

<template>
  <label v-for="p in picks" :key="p.name" class="pick" :class="{ on: picked(p) }">
    <input type="checkbox" class="pick-check" :checked="picked(p)" @change="togglePick(key(p), p.rec)" />
    <span class="pick-body">
      <span class="pick-title">
        <b>{{ p.name }}</b>
        <span v-if="p.rec" class="rec-tag">推薦</span>
      </span>
      <small v-if="p.detail">{{ p.detail }}</small>
      <span class="pick-foot">
        <em>{{ p.price ?? '價格請以通路為準' }}</em>
        <a v-if="p.url" :href="p.url" target="_blank" rel="noopener noreferrer" class="pick-link">{{ p.source ?? '查看' }}<ExternalLink /></a>
      </span>
      <span v-if="picked(p)" class="pick-sum">計入預算：{{ costText(p) }}</span>
    </span>
  </label>
</template>
