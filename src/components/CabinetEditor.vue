<script setup lang="ts">
import { computed, onBeforeUnmount, ref, watch } from 'vue'
import {
  ArrowDown, ArrowUp, BetweenHorizontalEnd, BetweenHorizontalStart, BetweenVerticalEnd, BetweenVerticalStart, CopyPlus,
  LayoutPanelTop, RotateCcw, Trash2, TriangleAlert, X as XIcon,
} from '@lucide/vue'
import { design, ui } from '../store'
import {
  P, PANEL, cabinetFrame, clone, defaultInterior, faceDepths, frontKinds, frontPieces, frontRect, hasInterior, interiorOf,
  interiorStats, layoutFace, partKind, partKinds,
} from '../cabinet'
import { seedInteriors } from '../data/interiors'
import type { CabinetColumn, CabinetFace, CabinetPart, FrontKind, PartKind } from '../types'

const fmt = (n: number) => String(Math.round(n * 10) / 10)
const round1 = (n: number) => Math.round(n * 10) / 10

const item = computed(() => {
  const it = design.furniture.find((f) => f.id === ui.selectedId)
  return it && hasInterior(it) ? it : undefined
})
const faceIdx = ref(0)
const sel = ref<{ col: number; part: number } | null>(null)
const showFronts = ref(true)

watch(
  () => item.value?.id,
  () => {
    faceIdx.value = 0
    sel.value = null
  },
)

const inter = computed(() => (item.value ? interiorOf(item.value) : null))
const frame = computed(() => (item.value ? cabinetFrame(item.value) : null))
const fi = computed(() => Math.min(faceIdx.value, (inter.value?.faces.length ?? 1) - 1))
const face = computed(() => inter.value?.faces[fi.value])
const depth = computed(() => (item.value && inter.value ? faceDepths(item.value, inter.value)[fi.value] : null))
const layout = computed(() => (face.value && frame.value ? layoutFace(face.value, frame.value.innerW, frame.value.innerH) : null))
const mirrored = computed(() => !!design.mirrored)

const selCol = computed(() => (sel.value && layout.value ? layout.value.cols[sel.value.col] : undefined))
const selLaid = computed(() => (sel.value && selCol.value ? selCol.value.parts[sel.value.part] : undefined))
watch(layout, () => {
  if (sel.value && !selLaid.value) sel.value = null
})

/** 第幾欄（照畫面由左往右數；A6・B6 左右相反） */
const colNo = (i: number) => (mirrored.value && layout.value ? layout.value.cols.length - i : i + 1)

// ───────────────────────── 修改 ─────────────────────────

/** 還沒有自訂規劃的櫃子，第一次修改時先把預設配置存進家具資料 */
function mutate(fn: (f: CabinetFace) => void) {
  const it = item.value
  if (!it) return
  if (!it.interior?.faces?.length) it.interior = clone(defaultInterior(it))
  fn(it.interior.faces[Math.min(faceIdx.value, it.interior.faces.length - 1)])
}
function mutatePart(fn: (p: CabinetPart, parts: CabinetPart[], i: number) => void) {
  const s = sel.value
  if (!s) return
  mutate((f) => {
    const parts = f.cols[s.col]?.parts
    if (parts?.[s.part]) fn(parts[s.part], parts, s.part)
  })
}
function mutateCol(fn: (c: CabinetColumn, cols: CabinetColumn[], i: number) => void) {
  const s = sel.value
  if (!s) return
  mutate((f) => {
    if (f.cols[s.col]) fn(f.cols[s.col], f.cols, s.col)
  })
}

const num = (e: Event) => parseFloat((e.target as HTMLInputElement).value)

function setKind(k: PartKind) {
  mutatePart((p) => {
    p.kind = k
  })
}
function setFront(f: FrontKind) {
  mutatePart((p) => {
    p.front = f
    if (f !== 'door') delete p.split
  })
}
function toggleSplit() {
  mutatePart((p) => {
    if (p.split) delete p.split
    else p.split = true
  })
}
function setHeight(e: Event) {
  const n = num(e)
  if (!Number.isFinite(n) || n < 3) return
  mutatePart((p) => {
    p.h = round1(n)
  })
}
function toggleAutoH() {
  const h = selLaid.value?.h ?? 30
  mutatePart((p) => {
    if (p.h == null) p.h = round1(h)
    else delete p.h
  })
}
function setLabel(e: Event) {
  const v = (e.target as HTMLInputElement).value
  mutatePart((p) => {
    if (v.trim()) p.label = v
    else delete p.label
  })
}
/** dir = 1 在上面加、0 在下面加 */
function addPart(dir: 0 | 1) {
  mutatePart((p, parts, i) => {
    parts.splice(i + dir, 0, P('shelf', null, p.front === 'open' ? 'open' : 'door'))
    sel.value = { col: sel.value!.col, part: i + dir }
  })
}
function movePart(d: 1 | -1) {
  mutatePart((p, parts, i) => {
    const j = i + d
    if (j < 0 || j >= parts.length) return
    ;[parts[i], parts[j]] = [parts[j], parts[i]]
    sel.value = { col: sel.value!.col, part: j }
  })
}
function removePart() {
  mutatePart((_p, parts, i) => {
    if (parts.length < 2) return
    parts.splice(i, 1)
    sel.value = { col: sel.value!.col, part: Math.min(i, parts.length - 1) }
  })
}
function setWidth(e: Event) {
  const n = num(e)
  if (!Number.isFinite(n) || n < 5) return
  mutateCol((c) => {
    c.w = round1(n)
  })
}
function toggleAutoW() {
  const w = selCol.value?.w ?? 50
  mutateCol((c) => {
    if (c.w == null) c.w = round1(w)
    else delete c.w
  })
}
/** 畫面上的左右；A6・B6 模式資料順序和畫面相反 */
function addCol(side: 'left' | 'right') {
  const right = (side === 'right') !== mirrored.value
  mutateCol((c, cols, i) => {
    const at = right ? i + 1 : i
    cols.splice(at, 0, { parts: [P('shelf', null, c.parts[0]?.front === 'open' ? 'open' : 'door'), P('shelf')] })
    sel.value = { col: at, part: 0 }
  })
}
function dupCol() {
  mutateCol((c, cols, i) => {
    cols.splice(i + 1, 0, clone(c))
  })
}
function removeCol() {
  mutateCol((_c, cols, i) => {
    if (cols.length < 2) return
    cols.splice(i, 1)
    sel.value = null
  })
}
function resetInterior() {
  const it = item.value
  if (!it) return
  const seed = seedInteriors[it.id]
  it.interior = clone(seed ?? defaultInterior({ ...it, interior: undefined }))
  sel.value = null
}

const canSplit = computed(() => {
  const c = selCol.value
  const p = selLaid.value
  return !!c && !!p && p.part.front === 'door' && p.i > 0 && c.parts[p.i - 1].part.front === 'door'
})

// ───────────────────────── 立面圖 ─────────────────────────

const M = { l: 30, r: 10, t: 26, b: 26 }

// 立面圖依面板大小縮放（最大每公分 6 像素，避免床頭櫃這種小櫃子畫得太誇張）
const box = ref({ w: 360, h: 460 })
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
    const w = Math.round(Math.max(240, e.contentRect.width))
    const h = Math.round(Math.max(260, e.contentRect.height - 70))
    if (w !== box.value.w || h !== box.value.h) box.value = { w, h }
  })
  ro.observe(next)
}
onBeforeUnmount(() => ro?.disconnect())

const geo = computed(() => {
  const fr = frame.value
  if (!fr) return { s: 1, W: box.value.w, H: box.value.h }
  const s = Math.min((box.value.w - M.l - M.r) / fr.w, (box.value.h - M.t - M.b) / fr.h, 6)
  return { s, W: M.l + fr.w * s + M.r, H: M.t + fr.h * s + M.b }
})
const X = (x: number) => M.l + x * geo.value.s
const Y = (y: number) => M.t + ((frame.value?.h ?? 0) - y) * geo.value.s
const dispX = (x: number, w: number) => (mirrored.value && frame.value ? frame.value.innerW - x - w : x)

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
  const L = layout.value
  if (!fr || !L) return []
  const s = geo.value.s
  return L.cols.flatMap((c) =>
    c.parts.map((p) => {
      const x = X(PANEL + dispX(c.x, c.w))
      const y = Y(fr.y0 + p.y + p.h)
      const w = c.w * s
      const h = p.h * s
      const name = p.part.label || partKind(p.part.kind).name
      const two = h >= 30
      return {
        key: `${c.i}-${p.i}`,
        col: c.i,
        part: p.i,
        x,
        y,
        w,
        h,
        fill: partKind(p.part.kind).color,
        on: sel.value?.col === c.i && sel.value?.part === p.i,
        line1: fit(two ? name : `${name} ${fmt(p.h)}`, w - 6, 10.5),
        line2: two ? fit(fmt(p.h), w - 6, 10) : '',
        font: h < 14 ? 9 : 10.5,
      }
    }),
  )
})

const fronts = computed(() => {
  const fr = frame.value
  const L = layout.value
  if (!fr || !L || !showFronts.value) return []
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
      // 開門方向：虛線三角形的尖端在鉸鏈那一側
      const tip = hinge === 'l' ? lx0 + 2 : lx1 - 2
      const far = hinge === 'l' ? lx1 - 2 : lx0 + 2
      return { k, x: lx0, swing: `${far},${y0 + 2} ${tip},${(y0 + y1) / 2} ${far},${y1 - 2}` }
    })
    return { key: n, kind: pc.kind, x0, x1, y0, y1, leaves, cx: (x0 + x1) / 2, hw: Math.min(8, (x1 - x0) / 4) }
  })
})

const colDims = computed(() =>
  (layout.value?.cols ?? []).map((c) => ({ key: c.i, x: X(PANEL + dispX(c.x, c.w) + c.w / 2), text: fmt(c.w), w: c.w * geo.value.s })),
)

// ───────────────────────── 提醒與統計 ─────────────────────────

const warnings = computed(() => {
  const out: string[] = []
  const L = layout.value
  const fr = frame.value
  const dp = depth.value
  if (!L || !fr || !dp) return out
  if (Math.abs(L.over) > 0.5)
    out.push(L.over > 0 ? `欄寬加總超出內寬 ${fmt(L.over)} 公分，圖上已等比例縮小` : `欄寬加總比內寬少 ${fmt(-L.over)} 公分（可以把一欄改成自動）`)
  for (const c of L.cols) {
    const n = colNo(c.i)
    if (Math.abs(c.over) > 0.5) out.push(`第 ${n} 欄：格子高度加總${c.over > 0 ? '超出' : '少了'} ${fmt(Math.abs(c.over))} 公分`)
    for (const p of c.parts) {
      const k = p.part.kind
      if (k === 'hang' || k === 'pullrod') {
        const rod = fr.y0 + p.y + p.h - 5 + (item.value?.elev ?? 0)
        if (rod > 195) out.push(`第 ${n} 欄的衣桿離地約 ${Math.round(rod)} 公分，不太好拿（建議 190 以下，或改下拉式衣桿）`)
      }
      if (k === 'hang' && dp.clear < 52) out.push(`第 ${n} 欄：淨深只有 ${fmt(dp.clear)}，一般衣架橫吊會卡到門，建議改前後拉桿`)
      if (k === 'pullrod' && c.w < 45) out.push(`第 ${n} 欄：欄寬不到 45，前後拉桿吊的衣服會卡到側板`)
      if ((k === 'books' || k === 'shelf') && c.w > 80) out.push(`第 ${n} 欄：層板跨距 ${fmt(c.w)} 超過 80，放書久了會彎，建議加一片立板`)
      if (k === 'pants' && (p.h < 60 || dp.clear < 50)) out.push(`第 ${n} 欄：褲架需要淨高 60、淨深 50 以上`)
    }
  }
  return [...new Set(out)]
})

const stats = computed(() => {
  if (!item.value || !inter.value) return []
  const s = interiorStats(inter.value, item.value)
  const out: string[] = []
  if (s.rod) out.push(`吊衣桿 ${Math.round(s.rod)} 公分（約 ${Math.round(s.rod / 3)} 件）`)
  if (s.pullrods) out.push(`前後拉桿 ${s.pullrods} 支`)
  if (s.drawers) out.push(`抽屜 ${s.drawers} 個`)
  if (s.shelves) out.push(`層板 ${s.shelves} 層`)
  if (s.shoes) out.push(`鞋子約 ${s.shoes} 雙`)
  if (s.books) out.push(`書約 ${s.books} 本`)
  if (s.pants) out.push(`褲架 ${s.pants} 組`)
  out.push(`門片 ${s.doors} 扇`)
  return out
})

const absRange = computed(() => {
  const fr = frame.value
  const p = selLaid.value
  if (!fr || !p) return ''
  const e = item.value?.elev ?? 0
  return `離地 ${fmt(e + fr.y0 + p.y)}～${fmt(e + fr.y0 + p.y + p.h)} 公分`
})
</script>

<template>
  <section v-if="ui.cabinetEditor && item && frame && layout" class="cab-editor">
    <header class="cab-head">
      <div class="cab-title">
        <span class="cab-icon"><LayoutPanelTop /></span>
        <div>
          <b>{{ item.name }}・櫃內規劃</b>
          <small>
            {{ fmt(item.w) }} × {{ fmt(item.d) }} × {{ fmt(item.h) }} 公分
            <template v-if="item.type === 'peninsula'">・只畫收納段（{{ fmt(frame.w) }} 寬）</template>
          </small>
        </div>
      </div>
      <label class="cab-toggle" title="在 3D 畫面裡把這個櫃子的門片拿掉，看得到裡面">
        <input v-model="ui.cabinetOpen" type="checkbox" class="switch" />3D 打開櫃門
      </label>
      <button class="icon-btn" title="關閉" @click="ui.cabinetEditor = false"><XIcon /></button>
    </header>

    <div class="cab-body">
      <div :ref="watchSize" class="cab-draw">
        <div class="cab-draw-bar">
          <div v-if="inter && inter.faces.length > 1" class="seg sm">
            <button
              v-for="(f, i) in inter.faces"
              :key="i"
              :class="{ on: fi === i }"
              @click="
                faceIdx = i;
                sel = null
              "
            >
              {{ f.name ?? `第 ${i + 1} 面` }}
            </button>
          </div>
          <span class="badge">淨寬 {{ fmt(frame.innerW) }}・淨高 {{ fmt(frame.innerH) }}・淨深 {{ fmt(depth?.clear ?? 0) }}</span>
          <label class="cab-check"><input v-model="showFronts" type="checkbox" />門片線</label>
        </div>

        <svg :width="geo.W" :height="geo.H" :viewBox="`0 0 ${geo.W} ${geo.H}`" class="cab-svg" @click.self="sel = null">
          <!-- 總寬、總高 -->
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
            {{ fmt(frame.h) }}{{ item.elev ? `（離地 ${fmt(item.elev)}）` : '' }}
          </text>

          <!-- 櫃體 -->
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

          <!-- 格子 -->
          <g v-for="c in cells" :key="c.key" class="cell" :class="{ on: c.on }" @click="sel = { col: c.col, part: c.part }">
            <rect :x="c.x" :y="c.y" :width="c.w" :height="c.h" :fill="c.fill" />
            <text :x="c.x + c.w / 2" :y="c.y + c.h / 2 + (c.line2 ? -2 : 3.5)" text-anchor="middle" :font-size="c.font">
              {{ c.line1 }}
            </text>
            <text v-if="c.line2" :x="c.x + c.w / 2" :y="c.y + c.h / 2 + 11" text-anchor="middle" class="cell-dim">{{ c.line2 }}</text>
          </g>

          <!-- 門片、抽屜面板 -->
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

          <!-- 欄寬 -->
          <text v-for="d in colDims" :key="d.key" :x="d.x" :y="geo.H - 9" text-anchor="middle" class="dim-text">
            {{ d.w > 22 ? d.text : '' }}
          </text>
        </svg>
        <p class="muted cab-note">
          虛線＝門片（三角形尖端是鉸鏈那一邊）、短橫線＝抽屜把手。尺寸都是淨尺寸（公分），板厚 1.8。
        </p>
      </div>

      <div class="cab-side">
        <template v-if="selLaid && selCol && sel">
          <div class="cab-sel-head">
            <b>第 {{ colNo(sel.col) }} 欄・由下往上第 {{ sel.part + 1 }} 格</b>
            <small>{{ absRange }}</small>
          </div>

          <p class="sublabel">用途</p>
          <div class="kind-grid">
            <button
              v-for="k in partKinds"
              :key="k.id"
              class="kind-chip"
              :class="{ on: selLaid.part.kind === k.id }"
              @click="setKind(k.id)"
            >
              <i :style="{ background: k.color }"></i>{{ k.name }}
            </button>
          </div>
          <p v-if="partKind(selLaid.part.kind).hint" class="muted tight">{{ partKind(selLaid.part.kind).hint }}</p>

          <p class="sublabel">正面</p>
          <div class="seg full sm">
            <button v-for="f in frontKinds" :key="f.id" :class="{ on: selLaid.part.front === f.id }" @click="setFront(f.id)">
              {{ f.name }}
            </button>
          </div>
          <label v-if="canSplit" class="cab-check block">
            <input type="checkbox" :checked="!!selLaid.part.split" @change="toggleSplit" />門片和下面那格分開（另一扇門）
          </label>

          <p class="sublabel">淨高</p>
          <div class="row">
            <div class="unit grow">
              <input class="input" type="number" step="0.5" min="3" :value="fmt(selLaid.h)" @change="setHeight" /><em>cm</em>
            </div>
            <label class="cab-check"><input type="checkbox" :checked="selLaid.part.h == null" @change="toggleAutoH" />自動</label>
          </div>

          <p class="sublabel">名稱</p>
          <input class="input" :value="selLaid.part.label ?? ''" :placeholder="partKind(selLaid.part.kind).name" @change="setLabel" />

          <div class="cab-btns">
            <button class="btn sm" @click="addPart(1)"><BetweenHorizontalStart />上面加一格</button>
            <button class="btn sm" @click="addPart(0)"><BetweenHorizontalEnd />下面加一格</button>
            <button class="btn sm" :disabled="selLaid.i === selCol.parts.length - 1" @click="movePart(1)"><ArrowUp />往上移</button>
            <button class="btn sm" :disabled="selLaid.i === 0" @click="movePart(-1)"><ArrowDown />往下移</button>
            <button class="btn sm danger wide" :disabled="selCol.parts.length < 2" @click="removePart"><Trash2 />刪除這格</button>
          </div>

          <div class="cab-col">
            <p class="sublabel">第 {{ colNo(sel.col) }} 欄淨寬</p>
            <div class="row">
              <div class="unit grow">
                <input class="input" type="number" step="0.5" min="5" :value="fmt(selCol.w)" @change="setWidth" /><em>cm</em>
              </div>
              <label class="cab-check"><input type="checkbox" :checked="selCol.col.w == null" @change="toggleAutoW" />自動</label>
            </div>
            <div class="cab-btns">
              <button class="btn sm" @click="addCol('left')"><BetweenVerticalStart />左邊加一欄</button>
              <button class="btn sm" @click="addCol('right')"><BetweenVerticalEnd />右邊加一欄</button>
              <button class="btn sm" @click="dupCol"><CopyPlus />複製這欄</button>
              <button class="btn sm danger" :disabled="layout.cols.length < 2" @click="removeCol"><Trash2 />刪除這欄</button>
            </div>
          </div>
        </template>
        <div v-else class="cab-empty">
          <b>點立面圖上的格子開始編輯</b>
          <small>
            可以改用途（吊衣桿、層板、抽屜…）、淨高、正面（門片／抽屜／開放），也能加減格子和欄。
            勾「自動」的格子會平分剩下的高度；上面那格設成「門片分開」就會多一扇短門。
          </small>
        </div>
      </div>
    </div>

    <footer class="cab-foot">
      <div v-if="warnings.length" class="cab-warn">
        <p v-for="w in warnings" :key="w"><TriangleAlert />{{ w }}</p>
      </div>
      <div class="cab-foot-row">
        <div class="cab-stats">
          <span v-for="s in stats" :key="s" class="badge">{{ s }}</span>
        </div>
        <button class="btn sm ghost" title="換回建議的配置（可以按「上一步」復原）" @click="resetInterior"><RotateCcw />還原建議配置</button>
      </div>
    </footer>
  </section>
</template>
