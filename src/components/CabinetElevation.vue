<script setup lang="ts">
import { computed, onBeforeUnmount, ref } from 'vue'
import { design } from '../store'
import { PANEL, cabinetFrame, frontPieces, frontRect, interiorOf, layoutFace, partKind } from '../cabinet'
import type { FurnitureItem } from '../types'

// 櫃子正面立面圖（唯讀）：格子依用途上色、標淨尺寸，虛線是門片（三角形尖端 = 鉸鏈側），短橫線是抽屜把手

const props = defineProps<{ item: FurnitureItem; face: number }>()

const fmt = (n: number) => String(Math.round(n * 10) / 10)
const M = { l: 28, r: 8, t: 24, b: 24 }

const frame = computed(() => cabinetFrame(props.item))
const inter = computed(() => interiorOf(props.item))
const layout = computed(() => {
  const f = inter.value.faces[Math.min(props.face, inter.value.faces.length - 1)]
  return layoutFace(f, frame.value.innerW, frame.value.innerH)
})
const mirrored = computed(() => !!design.mirrored)

// 依容器寬度縮放（最大每公分 6 像素，小櫃子不會畫得太誇張；高度最多 560）
const boxW = ref(320)
let ro: ResizeObserver | null = null
let observed: HTMLElement | null = null
function watchSize(el: unknown) {
  const next = el instanceof HTMLElement ? el : null
  if (next === observed) return
  ro?.disconnect()
  ro = null
  observed = next
  if (!next) return
  ro = new ResizeObserver(([e]) => {
    const w = Math.round(Math.max(220, e.contentRect.width))
    if (w !== boxW.value) boxW.value = w
  })
  ro.observe(next)
}
onBeforeUnmount(() => ro?.disconnect())

const geo = computed(() => {
  const fr = frame.value
  const s = Math.min((boxW.value - M.l - M.r) / fr.w, (560 - M.t - M.b) / fr.h, 6)
  return { s, W: M.l + fr.w * s + M.r, H: M.t + fr.h * s + M.b }
})
const X = (x: number) => M.l + x * geo.value.s
const Y = (y: number) => M.t + (frame.value.h - y) * geo.value.s
const dispX = (x: number, w: number) => (mirrored.value ? frame.value.innerW - x - w : x)

/** 估算文字寬度，放不下就截斷 */
function fit(text: string, maxPx: number, font: number) {
  if (maxPx < font) return ''
  let w = 0
  let out = ''
  for (const ch of text) {
    const cw = ch.charCodeAt(0) > 255 ? font : font * 0.58
    if (w + cw > maxPx) return out.length ? out.slice(0, -1) + '…' : ''
    w += cw
    out += ch
  }
  return out
}

const cells = computed(() => {
  const fr = frame.value
  const s = geo.value.s
  return layout.value.cols.flatMap((c) =>
    c.parts.map((p) => {
      const w = c.w * s
      const h = p.h * s
      const kind = partKind(p.part.kind)
      const name = p.part.label || kind.name
      const two = h >= 30
      return {
        key: `${c.i}-${p.i}`,
        x: X(PANEL + dispX(c.x, c.w)),
        y: Y(fr.y0 + p.y + p.h),
        w,
        h,
        fill: kind.color,
        tip: `${name}（${kind.name}）淨寬 ${fmt(c.w)} × 淨高 ${fmt(p.h)}`,
        line1: fit(two ? name : `${name} ${fmt(p.h)}`, w - 5, h < 15 ? 9.5 : 11.5),
        line2: two ? fit(fmt(p.h), w - 5, 10.5) : '',
        font: h < 15 ? 9.5 : 11.5,
      }
    }),
  )
})

const fronts = computed(() => {
  const fr = frame.value
  const L = layout.value
  return frontPieces(L).map((pc, n) => {
    const r = frontRect(L, pc, fr)
    const dx = dispX(r.x0, r.x1 - r.x0)
    const x0 = X(PANEL + dx)
    const x1 = X(PANEL + dx + r.x1 - r.x0)
    const y0 = Y(fr.y0 + r.y1)
    const y1 = Y(fr.y0 + r.y0)
    const lw = (x1 - x0) / pc.leaves
    const leaves = Array.from({ length: pc.leaves }, (_, k) => {
      let hinge = pc.leaves === 2 ? (k === 0 ? 'l' : 'r') : pc.hinge
      if (mirrored.value && pc.leaves === 1) hinge = hinge === 'l' ? 'r' : 'l'
      const lx0 = x0 + k * lw
      const lx1 = lx0 + lw
      const tip = hinge === 'l' ? lx0 + 2 : lx1 - 2
      const far = hinge === 'l' ? lx1 - 2 : lx0 + 2
      return { k, x: lx0, swing: `${far},${y0 + 2} ${tip},${(y0 + y1) / 2} ${far},${y1 - 2}` }
    })
    return { key: n, kind: pc.kind, x0, x1, y0, y1, leaves, cx: (x0 + x1) / 2, hw: Math.min(8, (x1 - x0) / 4) }
  })
})

const colDims = computed(() =>
  layout.value.cols.map((c) => ({ key: c.i, x: X(PANEL + dispX(c.x, c.w) + c.w / 2), text: fmt(c.w), w: c.w * geo.value.s })),
)
</script>

<template>
  <div :ref="watchSize" class="elev">
    <svg :width="geo.W" :height="geo.H" :viewBox="`0 0 ${geo.W} ${geo.H}`" class="cab-svg">
      <line :x1="X(0)" :x2="X(frame.w)" :y1="10" :y2="10" class="dim-line" />
      <line :x1="X(0)" :x2="X(0)" :y1="6" :y2="14" class="dim-line" />
      <line :x1="X(frame.w)" :x2="X(frame.w)" :y1="6" :y2="14" class="dim-line" />
      <text :x="(X(0) + X(frame.w)) / 2" :y="7" class="dim-text" text-anchor="middle">{{ fmt(frame.w) }}</text>
      <line :x1="12" :x2="12" :y1="Y(frame.h)" :y2="Y(0)" class="dim-line" />
      <text
        :x="9"
        :y="(Y(frame.h) + Y(0)) / 2"
        class="dim-text"
        text-anchor="middle"
        :transform="`rotate(-90 9 ${(Y(frame.h) + Y(0)) / 2})`"
      >
        {{ fmt(frame.h) }}
      </text>

      <rect :x="X(0)" :y="Y(frame.h)" :width="frame.w * geo.s" :height="(frame.h - frame.base) * geo.s" class="carcass" />
      <template v-if="frame.base > 0">
        <template v-if="frame.legs">
          <rect :x="X(3)" :y="Y(frame.base)" :width="3 * geo.s" :height="frame.base * geo.s" class="plinth" />
          <rect :x="X(frame.w - 6)" :y="Y(frame.base)" :width="3 * geo.s" :height="frame.base * geo.s" class="plinth" />
        </template>
        <rect v-else :x="X(1)" :y="Y(frame.base)" :width="(frame.w - 2) * geo.s" :height="frame.base * geo.s" class="plinth" />
      </template>
      <rect v-if="frame.top === 'stone'" :x="X(-0.5)" :y="Y(frame.h)" :width="(frame.w + 1) * geo.s" :height="3 * geo.s" class="stone" />
      <line :x1="M.l - 6" :x2="X(frame.w) + 6" :y1="Y(0)" :y2="Y(0)" class="floor" />

      <g v-for="c in cells" :key="c.key" class="cell">
        <title>{{ c.tip }}</title>
        <rect :x="c.x" :y="c.y" :width="c.w" :height="c.h" :fill="c.fill" />
        <text :x="c.x + c.w / 2" :y="c.y + c.h / 2 + (c.line2 ? -2 : 3.5)" text-anchor="middle" :font-size="c.font">{{ c.line1 }}</text>
        <text v-if="c.line2" :x="c.x + c.w / 2" :y="c.y + c.h / 2 + 11.5" text-anchor="middle" class="cell-dim">{{ c.line2 }}</text>
      </g>

      <g class="fronts">
        <g v-for="f in fronts" :key="f.key">
          <rect :x="f.x0 + 0.5" :y="f.y0 + 0.5" :width="f.x1 - f.x0 - 1" :height="f.y1 - f.y0 - 1" :class="f.kind === 'door' ? 'door' : 'drawer'" />
          <template v-if="f.kind === 'door'">
            <line v-for="l in f.leaves.slice(1)" :key="l.k" :x1="l.x" :x2="l.x" :y1="f.y0" :y2="f.y1" class="door" />
            <polyline v-for="l in f.leaves" :key="`s${l.k}`" :points="l.swing" class="swing" />
          </template>
          <line v-else :x1="f.cx - f.hw" :x2="f.cx + f.hw" :y1="f.y0 + 4" :y2="f.y0 + 4" class="pull" />
        </g>
      </g>

      <text v-for="d in colDims" :key="d.key" :x="d.x" :y="geo.H - 8" text-anchor="middle" class="dim-text">
        {{ d.w > 22 ? d.text : '' }}
      </text>
    </svg>
  </div>
</template>
