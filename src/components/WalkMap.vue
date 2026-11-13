<script setup lang="ts">
// 室內漫遊的小地圖：看得到自己站在哪、面向哪裡；點一下就走到那個位置
import { computed, ref } from 'vue'
import { Map as MapIcon, X } from '@lucide/vue'
import { design, ui } from '../store'
import { viewerRef } from '../viewerRef'
import { rooms } from '../data/house'
import { blockingRects, footprint } from '../geometry'

const open = ref(true)
const svg = ref<SVGSVGElement>()

const PAD = 14
const box = { x1: -306.5 - PAD, y1: -20 - PAD, x2: 564.5 + PAD, y2: 756.5 + PAD }
const W = box.x2 - box.x1
const H = box.y2 - box.y1
/** A6・B6 上下翻轉：地圖跟著翻，才會和 3D 畫面同方向 */
const sy = computed(() => (design.mirrored ? -1 : 1))
const my = (y: number) => (sy.value > 0 ? y - box.y1 : box.y2 - y)

const short: Record<string, string> = {
  living: '客餐廳', master: '主臥', bed2: '次臥', bath: '衛浴', wc: '半套', balcony: '陽台', ac: '冷氣',
}
const rect = (r: { x1: number; y1: number; x2: number; y2: number }) => ({
  x: r.x1 - box.x1,
  y: Math.min(my(r.y1), my(r.y2)),
  width: r.x2 - r.x1,
  height: r.y2 - r.y1,
})
const roomRects = computed(() =>
  rooms.map((r) => ({ id: r.id, name: short[r.id] ?? r.name, outdoor: r.outdoor, walkable: r.id !== 'ac', ...rect(r) })),
)
const wallRects = computed(() => blockingRects(design.ceilingHeight).map(rect))
/** 落地的大件家具，幫忙認位置 */
const furniture = computed(() =>
  design.furniture.filter((f) => f.elev < 30 && f.h > 25 && f.w * f.d > 2500).map((f) => rect(footprint(f))),
)

const here = computed(() => ({ x: ui.walkPos.x - box.x1, y: my(ui.walkPos.y) }))
/** 視野扇形：前方 = (sin yaw, cos yaw)（3D 世界方向，地圖已跟著戶別翻轉） */
const cone = computed(() => {
  const { x, y } = here.value
  const R = 190
  const half = 0.62
  const a = ui.walkPos.yaw
  const p = (t: number) => `${x + Math.sin(t) * R},${y + Math.cos(t) * R}`
  return `M${x},${y} L${p(a + half)} A${R},${R} 0 0 1 ${p(a - half)} Z`
})
const current = computed(() => {
  const { x, y } = ui.walkPos
  return rooms.find((r) => x >= r.x1 && x <= r.x2 && y >= r.y1 && y <= r.y2)?.id
})

function go(e: PointerEvent) {
  const el = svg.value
  if (!el) return
  const b = el.getBoundingClientRect()
  const x = ((e.clientX - b.left) / b.width) * W + box.x1
  const v = ((e.clientY - b.top) / b.height) * H
  const y = sy.value > 0 ? v + box.y1 : box.y2 - v
  viewerRef.current?.walkTo(x, y)
}
</script>

<template>
  <button v-if="!open" class="walkmap-open glass" title="顯示小地圖" aria-label="顯示小地圖" @click="open = true">
    <MapIcon />
  </button>
  <div v-else class="walkmap">
    <svg ref="svg" :viewBox="`0 0 ${W} ${H}`" role="img" aria-label="小地圖：點一下前往該位置" @pointerdown.prevent="go">
      <defs>
        <radialGradient id="wm-cone" gradientUnits="userSpaceOnUse" :cx="here.x" :cy="here.y" r="190">
          <stop offset="0" stop-color="#f2b48f" stop-opacity="0.75" />
          <stop offset="1" stop-color="#f2b48f" stop-opacity="0" />
        </radialGradient>
      </defs>
      <rect
        v-for="r in roomRects"
        :key="r.id"
        class="wm-room"
        :class="{ on: r.id === current, outdoor: r.outdoor, off: !r.walkable }"
        :x="r.x" :y="r.y" :width="r.width" :height="r.height"
      />
      <rect v-for="(f, i) in furniture" :key="'f' + i" class="wm-furn" :x="f.x" :y="f.y" :width="f.width" :height="f.height" rx="4" />
      <rect v-for="(w, i) in wallRects" :key="'w' + i" class="wm-wall" :x="w.x" :y="w.y" :width="w.width" :height="w.height" />
      <text
        v-for="r in roomRects"
        :key="'t' + r.id"
        class="wm-name"
        :class="{ on: r.id === current }"
        :x="r.x + r.width / 2"
        :y="r.y + r.height / 2"
      >{{ r.name }}</text>
      <path :d="cone" fill="url(#wm-cone)" />
      <circle class="wm-here" :cx="here.x" :cy="here.y" r="15" />
    </svg>
    <div class="walkmap-foot">
      <span>點地圖前往</span>
      <button aria-label="收起小地圖" @click="open = false"><X /></button>
    </div>
  </div>
</template>
