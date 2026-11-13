<script setup lang="ts">
// 訂製中島餐桌的施工分解圖：3D 爆炸圖、四張 2D 圖面、元件規格表、要確認的事項；拿給師傅看、也可以列印
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { Printer, X } from '@lucide/vue'
import type { FurnitureItem } from '../types'
import { GROUPS, buildIsland, n1, type IslandFace, type IslandPart, type PartGroup } from '../island'
import { ExplodedView, type ViewPreset } from '../three/explodedView'

const props = defineProps<{ item: FurnitureItem }>()
const emit = defineEmits<{ close: [] }>()

const m = computed(() => buildIsland(props.item))
const groups = computed(() =>
  (Object.keys(GROUPS) as PartGroup[]).map((g) => ({ g, name: GROUPS[g], parts: m.value.parts.filter((p) => p.group === g) })).filter((x) => x.parts.length),
)

// ───────────────────────── 3D 爆炸圖 ─────────────────────────

const host = ref<HTMLElement>()
const explode = ref(70)
const selected = ref<string | null>(null)
const anchors = ref<{ no: string; x: number; y: number }[]>([])
const showTags = ref(true)
let view: ExplodedView | null = null

function pick(no: string | null) {
  selected.value = selected.value === no ? null : no
}
function setView(v: ViewPreset) {
  view?.setView(v)
}
const selectedPart = computed<IslandPart | undefined>(() => m.value.parts.find((p) => p.no === selected.value))

onMounted(() => {
  view = new ExplodedView(host.value!, m.value, pick, () => (anchors.value = view?.anchors() ?? []))
  view.setExplode(explode.value / 100)
  view.setView('aisle')
  window.addEventListener('keydown', onKey)
})
onBeforeUnmount(() => {
  window.removeEventListener('keydown', onKey)
  view?.dispose()
  view = null
})
watch(explode, (v) => view?.setExplode(v / 100))
watch(selected, (v) => view?.setSelected(v))
function onKey(e: KeyboardEvent) {
  if (e.key === 'Escape') emit('close')
}
function print() {
  view?.render()
  window.print()
}

// ───────────────────────── 2D 圖面 ─────────────────────────

type El =
  | { k: 'rect'; x: number; y: number; w: number; h: number; c: string }
  | { k: 'line'; x1: number; y1: number; x2: number; y2: number; c: string }
  | { k: 'text'; x: number; y: number; t: string; c: string; rot?: number }
  | { k: 'poly'; pts: string; c: string }
interface Drawing {
  vb: string
  /** 畫面上的最小寬度（公分 × 倍率），窄螢幕橫向捲動 */
  minW: number
  els: El[]
}

class Pen {
  els: El[] = []
  rect(x: number, y: number, w: number, h: number, c: string) {
    this.els.push({ k: 'rect', x, y, w, h, c })
  }
  line(x1: number, y1: number, x2: number, y2: number, c: string) {
    this.els.push({ k: 'line', x1, y1, x2, y2, c })
  }
  text(x: number, y: number, t: string, c = 't', rot?: number) {
    this.els.push({ k: 'text', x, y, t, c, rot })
  }
  poly(pts: [number, number][], c: string) {
    this.els.push({ k: 'poly', pts: pts.map((p) => p.join(',')).join(' '), c })
  }
  /** 水平尺寸線：量 x1～x2，尺寸線畫在 y，延伸線從 from 拉過來 */
  dimH(x1: number, x2: number, y: number, from: number, label?: string) {
    const s = y > from ? 1 : -1
    this.line(x1, from + s * 1.5, x1, y + s * 1.5, 'dim')
    this.line(x2, from + s * 1.5, x2, y + s * 1.5, 'dim')
    this.line(x1, y, x2, y, 'dim')
    for (const x of [x1, x2]) this.line(x - 1.1, y + 1.1, x + 1.1, y - 1.1, 'tick')
    this.text((x1 + x2) / 2, y - 1.4, label ?? n1(Math.abs(x2 - x1)), 'dt')
  }
  /** 垂直尺寸線：量 y1～y2，尺寸線畫在 x */
  dimV(y1: number, y2: number, x: number, from: number, label?: string) {
    const s = x > from ? 1 : -1
    this.line(from + s * 1.5, y1, x + s * 1.5, y1, 'dim')
    this.line(from + s * 1.5, y2, x + s * 1.5, y2, 'dim')
    this.line(x, y1, x, y2, 'dim')
    for (const y of [y1, y2]) this.line(x - 1.1, y + 1.1, x + 1.1, y - 1.1, 'tick')
    this.text(x - 1.4, (y1 + y2) / 2, label ?? n1(Math.abs(y2 - y1)), 'dt', -90)
  }
}

const short = (s: string) => s.split(/[（(：:；;・]/)[0]

/** 俯視圖：X 往右、Z 往下（上面是廚房側） */
const plan = computed<Drawing>(() => {
  const { L, D, ls, divZ, faces, legs, beam, apron, outletTop } = m.value
  const p = new Pen()
  p.rect(-9, -14, 9, D + 28, 'wall')
  p.text(-4.5, D / 2, '靠窗的牆', 'tl', -90)
  p.rect(0, 0, L, D, 'top')
  p.line(ls, 0, ls, D, 'hid')
  p.line(0, divZ[0], ls, divZ[0], 'hid')
  p.line(0, divZ[1], ls, divZ[1], 'hid')
  faces.forEach((f, fi) => {
    const z0 = fi === 0 ? 0 : divZ[1]
    const z1 = fi === 0 ? divZ[0] : D
    const xs = f.cols.map((c) => c.x0).sort((a, b) => a - b)
    for (const x of xs.slice(1)) p.line(x - 0.9, z0, x - 0.9, z1, 'hid')
    for (const c of f.cols) {
      const top = c.parts[c.parts.length - 1]
      p.text((c.x0 + c.x1) / 2, (z0 + z1) / 2 + (fi === 0 ? -8 : 0), short(top.label), 'ts')
    }
  })
  for (const l of legs) p.rect(l.x0, l.z0, l.x1 - l.x0, l.z1 - l.z0, 'steel')
  p.rect(beam.x, beam.z, beam.sx, beam.sz, 'hidr')
  p.rect(apron.x, apron.z, apron.sx, apron.sz, 'hidr')
  p.rect(outletTop.x - 6.5, outletTop.z - 6.5, 13, 13, 'outlet')
  p.text(outletTop.x, outletTop.z + 11.5, '檯面插座', 'ts')
  p.text(ls + (L - ls) / 2, D / 2 - 9, '餐桌段', 't')
  p.text(ls + (L - ls) / 2, D / 2 + 13, '兩側各坐一人，椅子收進桌下', 'ts')
  p.text(L / 2, -27, '廚房側（瓦斯爐、水槽）', 'tl')
  p.text(L / 2, D + 31, '走道側（次臥門、陽台門）', 'tl')
  p.dimH(0, ls, -7, 0)
  p.dimH(ls, L, -7, 0)
  p.dimH(0, L, -16, 0)
  p.dimV(0, D, L + 16, L)
  p.dimV(0, divZ[0], L + 7, L)
  p.dimV(divZ[1], D, L + 7, L)
  p.dimH(0, outletTop.x, D + 8, D)
  p.dimH(L - 7.5, L - 2.5, D + 8, D, '桌腳 5')
  p.dimH(ls, L, D + 17, D, `餐桌段 ${n1(L - ls)}`)
  p.dimH(0, ls, D + 17, D, `收納段 ${n1(ls)}`)
  return { vb: `-16 -34 ${L + 40} ${D + 72}`, minW: 620, els: p.els }
})

/** 立面圖：fi = 0 從廚房看（左邊是餐桌端）、1 從走道看（左邊是牆） */
function elevation(fi: number): Drawing {
  const { L, H, ls, bodyTop, base, faces, beam } = m.value
  const f: IslandFace = faces[fi]
  const flip = fi === 0
  const X = (x: number) => (flip ? L - x : x)
  const Y = (y: number) => H - y
  const p = new Pen()
  const rx = (x0: number, x1: number, y0: number, y1: number, c: string) => p.rect(Math.min(X(x0), X(x1)), Y(y1), Math.abs(x1 - x0), y1 - y0, c)
  // 牆（到窗台）、地面
  rx(-9, 0, 0, 80, 'wall')
  p.text(X(-4.5), Y(40), '牆', 'ts')
  p.line(X(-9) - (flip ? 0 : 0), Y(80), X(0), Y(80), 'o')
  p.text(X(-4.5), Y(84), '窗台約 80', 'ts')
  p.line(Math.min(X(-12), X(L + 6)), Y(0), Math.max(X(-12), X(L + 6)), Y(0), 'o')
  // 檯面、踢腳、側板
  rx(0, L, bodyTop, H, 'top')
  rx(1, ls - 1, 0, base, 'plinth')
  rx(0, 1.8, base, bodyTop, 'panel')
  rx(ls - 1.8, ls, base, bodyTop, 'panel')
  // 格子、面板
  for (const c of f.cols) {
    for (const part of c.parts) {
      if (part.front !== 'open') continue
      rx(c.x0, c.x1, part.y0, part.y0 + part.h, part.label.includes('微波爐') ? 'appl' : 'open')
      const cx = X((c.x0 + c.x1) / 2)
      const cy = Y(part.y0 + part.h / 2)
      p.text(cx, cy - 2.2, short(part.label), part.label.includes('微波爐') ? 'tw' : 't')
      p.text(cx, cy + 3.2, `淨 ${n1(c.w)} × ${n1(part.h)}`, part.label.includes('微波爐') ? 'tsw' : 'ts')
    }
  }
  for (const fp of f.fronts) {
    rx(fp.x0, fp.x1, fp.y0, fp.y1, 'front')
    const xa = Math.min(X(fp.x0), X(fp.x1))
    const xb = Math.max(X(fp.x0), X(fp.x1))
    const ya = Y(fp.y1)
    const yb = Y(fp.y0)
    const cx = (xa + xb) / 2
    const cy = (ya + yb) / 2
    if (fp.kind === 'drawer') p.line(cx - 6, ya + 3, cx + 6, ya + 3, 'handle')
    else {
      // 門片：虛線三角形的尖端指向鉸鏈那一邊（面對這一面看的左右）
      const hx = fp.hinge === 'l' ? xa : xb
      const ox = fp.hinge === 'l' ? xb : xa
      p.poly([[ox, ya], [hx, cy], [ox, yb]], 'swing')
    }
    p.text(cx, cy - 0.6, fp.kind === 'drawer' ? `抽屜・${short(fp.label)}` : `門片・${short(fp.label)}`, 't')
    p.text(cx, cy + 4.6, `面板 ${n1(fp.x1 - fp.x0)} × ${n1(fp.y1 - fp.y0)}`, 'ts')
  }
  // 餐桌段：桌腳、橫樑
  rx(L - 7.5, L - 2.5, 0, bodyTop, 'steel')
  rx(beam.x, beam.x + beam.sx, beam.y, beam.y + beam.sy, 'hidr')
  rx(L - 4.5, L - 2.5, bodyTop - 12, bodyTop, 'hidr')
  p.text(X(ls + (L - ls) / 2), Y(34), '餐桌段（桌下淨空）', 't')
  p.text(X(ls + (L - ls) / 2), Y(27), `橫樑下淨高 ${n1(beam.y)}`, 'ts')
  // 尺寸：下面是寬度，兩邊是高度
  const xs = [...new Set(f.fronts.flatMap((fp) => [fp.x0, fp.x1]).concat([0, ls]))].sort((a, b) => a - b)
  for (let i = 0; i < xs.length - 1; i++) if (xs[i + 1] - xs[i] > 0.05) p.dimH(X(xs[i]), X(xs[i + 1]), Y(0) + 7, Y(0), n1(xs[i + 1] - xs[i]))
  p.dimH(X(ls), X(L), Y(0) + 7, Y(0), n1(L - ls))
  p.dimH(X(0), X(L), Y(0) + 16, Y(0), n1(L))
  const wx = X(-9)
  const vx = wx + (flip ? 8 : -8)
  p.dimV(Y(0), Y(base), vx, wx, n1(base))
  p.dimV(Y(base), Y(bodyTop), vx, wx, n1(bodyTop - base))
  p.dimV(Y(bodyTop), Y(H), vx, wx, n1(H - bodyTop))
  p.dimV(Y(0), Y(H), wx + (flip ? 17 : -17), wx, n1(H))
  const ex = X(L)
  p.dimV(Y(0), Y(bodyTop), ex + (flip ? -8 : 8), ex, n1(bodyTop))
  const minX = flip ? -14 : -32
  return { vb: `${minX} -16 ${L + 46} ${H + 40}`, minW: 620, els: p.els }
}
const elevKitchen = computed(() => elevation(0))
const elevAisle = computed(() => elevation(1))

/** 剖面：切在靠牆那一欄，左邊廚房、右邊走道 */
const section = computed<Drawing>(() => {
  const { D, H, bodyTop, base, y0, innerH, divZ, faces } = m.value
  const Y = (y: number) => H - y
  const p = new Pen()
  p.line(-10, Y(0), D + 10, Y(0), 'o')
  p.rect(0, Y(H), D, H - bodyTop, 'top')
  p.rect(4, Y(base), 1.8, base, 'cut')
  p.rect(D - 5.8, Y(base), 1.8, base, 'cut')
  p.rect(1.8, Y(y0), D - 3.6, 1.8, 'cut')
  p.rect(divZ[0], Y(y0 + innerH), divZ[1] - divZ[0], innerH, 'cut')
  faces.forEach((f, fi) => {
    const col = [...f.cols].sort((a, b) => a.x0 - b.x0)[0]
    const fx = [...f.fronts].filter((fp) => fp.x0 < col.x1 && fp.x1 > col.x0)
    for (const fp of fx) p.rect(fi === 0 ? 0 : D - 1.8, Y(fp.y1), 1.8, fp.y1 - fp.y0, 'front')
    col.parts.forEach((part, i) => {
      const prev = col.parts[i - 1]
      if (i > 0 && !(prev.front === 'drawer' && part.front === 'drawer')) p.rect(f.z0, Y(part.y0), f.clear, 1.8, 'cut')
      const cz = (f.z0 + f.z1) / 2
      const cy = Y(part.y0 + part.h / 2)
      if (part.front === 'drawer') {
        const dep = Math.floor((f.clear - 3) / 5) * 5
        p.rect(fi === 0 ? f.z0 : f.z1 - dep, Y(part.y0 + part.h - 3), dep, part.h - 5, 'hidr')
        p.text(cz, cy + 1, `抽屜（軌 ${dep}）`, 'ts')
      } else if (part.kind === 'appliance') {
        const td = Math.floor((f.clear - 2) / 5) * 5
        p.rect(fi === 0 ? f.z0 + 1 : f.z1 - 1 - td, Y(part.y0 + 2.4), td, 1.8, 'tray')
        p.text(cz, cy - 1.5, short(part.label), 'ts')
        p.text(cz, cy + 3.4, `淨高 ${n1(part.h)}`, 'ts')
      } else {
        p.text(cz, cy + 1, `${short(part.label)}（淨高 ${n1(part.h)}）`, 'ts')
      }
    })
  })
  p.text(divZ[0] / 2, -9, '廚房側', 'tl')
  p.text((divZ[1] + D) / 2, -9, '走道側', 'tl')
  p.dimH(0, divZ[0], Y(0) + 7, Y(0))
  p.dimH(divZ[0], divZ[1], Y(0) + 7, Y(0))
  p.dimH(divZ[1], D, Y(0) + 7, Y(0))
  p.dimH(0, D, Y(0) + 16, Y(0))
  p.dimV(Y(0), Y(base), D + 9, D)
  p.dimV(Y(base), Y(bodyTop), D + 9, D)
  p.dimV(Y(bodyTop), Y(H), D + 9, D)
  p.dimV(Y(0), Y(H), D + 18, D)
  p.dimV(Y(y0), Y(y0 + innerH), -8, 0, `內高 ${n1(innerH)}`)
  return { vb: `-16 -16 ${D + 42} ${H + 40}`, minW: 420, els: p.els }
})

const drawings = computed(() => [
  { id: 'plan', title: '俯視圖', note: '從上往下看。虛線是檯面下的櫃體分割、橫樑、牙板。', d: plan.value, wide: true },
  { id: 'kitchen', title: '廚房側立面', note: '站在廚房（瓦斯爐前）看過去：左邊是餐桌端、右邊靠窗。', d: elevKitchen.value, wide: true },
  { id: 'aisle', title: '走道側立面', note: '站在走道（次臥門、陽台門前）看過去：左邊靠窗、右邊是餐桌端。', d: elevAisle.value, wide: true },
  { id: 'section', title: '收納段剖面', note: '切在靠窗那一欄，看兩面的深度怎麼分。斜線色塊是切到的板。', d: section.value, wide: false },
])

// ───────────────────────── 五金統計 ─────────────────────────

const hardware = computed(() => {
  const ps = m.value.parts
  const doors = ps.filter((p) => p.name.startsWith('門片')).length
  const drawers = ps.filter((p) => p.name.startsWith('抽屜')).length
  const trays = ps.filter((p) => p.name.startsWith('抽拉層板')).length
  return [
    { name: '緩衝鉸鏈', spec: 'Blum CLIP top BLUMOTION、Hettich Sensys 或 Grass Tiomos，三向可調', qty: `${doors * 2} 個（${doors} 扇門）` },
    { name: '抽屜滑軌', spec: '三節全展＋緩衝；鍋蓋、烤盤那一抽選承重 40 kg 以上', qty: `${drawers} 組` },
    { name: '抽拉層板滑軌', spec: '三節全展，層板前緣加擋條；電鍋、氣炸鍋、電子鍋用', qty: `${trays} 組` },
    { name: '調整腳', spec: '踢腳板裡面，抓水平用', qty: '4～6 支' },
    { name: '檯面固定件', spec: 'Z 型扣件或長孔角碼，讓實木可以伸縮', qty: '依師傅配置' },
  ]
})
</script>

<template>
  <div class="sheet" role="dialog" aria-labelledby="sheet-title">
    <header class="sheet-bar">
      <div>
        <h1 id="sheet-title">{{ item.name }}・施工分解圖</h1>
        <p>有富富玉 B2・客餐廳窗下｜單位：公分｜概念圖，尺寸以現場丈量為準</p>
      </div>
      <div class="sheet-actions">
        <button class="btn sm soft" @click="print"><Printer />列印／存 PDF</button>
        <button class="icon-btn" aria-label="關閉分解圖" @click="emit('close')"><X /></button>
      </div>
    </header>

    <div class="sheet-body">
      <!-- 概要 -->
      <section class="sheet-sec facts">
        <div><span>總尺寸（長 × 深 × 高）</span><b>{{ n1(m.L) }} × {{ n1(m.D) }} × {{ n1(m.H) }}</b></div>
        <div><span>收納段（靠窗）</span><b>{{ n1(m.ls) }}</b></div>
        <div><span>餐桌段（往室內）</span><b>{{ n1(m.lt) }}</b></div>
        <div><span>廚房側櫃深／走道側櫃深</span><b>{{ n1(m.divZ[0]) }}／{{ n1(m.D - m.divZ[1]) }}</b></div>
        <div><span>檯面</span><b>白橡木實木</b></div>
        <div><span>元件</span><b>{{ m.parts.reduce((s, p) => s + p.qty, 0) }} 件・{{ m.parts.length }} 種</b></div>
      </section>

      <!-- 3D 爆炸圖 -->
      <section class="sheet-sec">
        <div class="sheet-head">
          <h2>3D 分解圖</h2>
          <p>拖曳旋轉、滾輪或雙指縮放。點元件或編號，下面的規格表會標出同一件。</p>
        </div>
        <div class="x3d">
          <div ref="host" class="x3d-canvas"></div>
          <template v-if="showTags">
            <button
              v-for="a in anchors"
              :key="a.no"
              class="x3d-tag"
              :class="{ on: a.no === selected }"
              :style="{ left: a.x + 'px', top: a.y + 'px' }"
              @click="pick(a.no)"
            >
              {{ a.no }}
            </button>
          </template>
          <div v-if="selectedPart" class="x3d-info">
            <b>{{ selectedPart.no }}・{{ selectedPart.name }}</b>
            <span>{{ selectedPart.size }}</span>
            <small>{{ selectedPart.material }}</small>
          </div>
        </div>
        <div class="x3d-ctl">
          <label class="x3d-slider">
            <span>組合</span>
            <input v-model.number="explode" type="range" min="0" max="100" step="1" aria-label="分解程度" />
            <span>分解</span>
          </label>
          <div class="seg sm">
            <button @click="setView('aisle')">走道側</button>
            <button @click="setView('kitchen')">廚房側</button>
            <button @click="setView('top')">俯視</button>
          </div>
          <label class="cab-toggle"><input v-model="showTags" type="checkbox" class="switch" />編號</label>
        </div>
      </section>

      <!-- 2D 圖面 -->
      <section class="sheet-sec">
        <div class="sheet-head">
          <h2>2D 圖面</h2>
          <p>斜短線之間是尺寸。門片上的虛線三角形，尖端指向鉸鏈那一邊；抽屜面板上的短橫線是把手位置。</p>
        </div>
        <div class="dwgs">
          <figure v-for="g in drawings" :key="g.id" class="dwg" :class="{ wide: g.wide }">
            <figcaption><b>{{ g.title }}</b>{{ g.note }}</figcaption>
            <div class="dwg-scroll">
              <svg :viewBox="g.d.vb" :style="{ minWidth: g.d.minW + 'px' }" role="img" :aria-label="g.title">
                <template v-for="(e, i) in g.d.els" :key="i">
                  <rect v-if="e.k === 'rect'" :x="e.x" :y="e.y" :width="e.w" :height="e.h" :class="'d-' + e.c" />
                  <line v-else-if="e.k === 'line'" :x1="e.x1" :y1="e.y1" :x2="e.x2" :y2="e.y2" :class="'d-' + e.c" />
                  <polyline v-else-if="e.k === 'poly'" :points="e.pts" :class="'d-' + e.c" />
                  <text v-else :x="e.x" :y="e.y" :class="'d-' + e.c" :transform="e.rot ? `rotate(${e.rot} ${e.x} ${e.y})` : undefined">{{ e.t }}</text>
                </template>
              </svg>
            </div>
          </figure>
        </div>
      </section>

      <!-- 元件規格表 -->
      <section class="sheet-sec">
        <div class="sheet-head">
          <h2>元件規格表</h2>
          <p>編號和 3D 分解圖一樣。板件尺寸是完成尺寸（寬 × 深或高），不含封邊。</p>
        </div>
        <div class="tbl-scroll">
          <table class="parts-tbl">
            <thead>
              <tr><th>編號</th><th>元件</th><th>尺寸</th><th>數量</th><th>材質</th><th>備註</th></tr>
            </thead>
            <tbody v-for="g in groups" :key="g.g">
              <tr class="grp"><td colspan="6">{{ g.g }}　{{ g.name }}</td></tr>
              <tr v-for="p in g.parts" :key="p.no" :class="{ on: p.no === selected }" @click="pick(p.no)">
                <td><i class="no">{{ p.no }}</i></td>
                <td class="nm">{{ p.name }}</td>
                <td class="sz">{{ p.size }}</td>
                <td class="qty">{{ p.qty }}</td>
                <td>{{ p.material }}</td>
                <td>{{ p.note }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <!-- 五金 -->
      <section class="sheet-sec">
        <div class="sheet-head"><h2>五金</h2><p>報價單請寫品牌和型號，同一品牌入門款和旗艦款價差很大。</p></div>
        <div class="tbl-scroll">
          <table class="parts-tbl">
            <thead><tr><th>項目</th><th>規格</th><th>數量</th></tr></thead>
            <tbody>
              <tr v-for="h in hardware" :key="h.name"><td class="nm">{{ h.name }}</td><td>{{ h.spec }}</td><td class="sz">{{ h.qty }}</td></tr>
            </tbody>
          </table>
        </div>
      </section>

      <!-- 要確認的事 -->
      <section class="sheet-sec">
        <div class="sheet-head"><h2>要和師傅確認的事</h2><p>這幾點圖上還沒定案，或模型和選購資料對不上，開工前先講清楚。</p></div>
        <ol class="checks">
          <li v-for="c in m.checks" :key="c.title"><b>{{ c.title }}</b>{{ c.text }}</li>
        </ol>
      </section>
    </div>
  </div>
</template>
