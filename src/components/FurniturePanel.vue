<script setup lang="ts">
import { computed, ref } from 'vue'
import {
  BedDouble, ChevronRight, Copy, LayoutPanelTop, Lock, MapPin, MousePointer2, Move, Package, Plus, RotateCcw, RotateCw, Rows3,
  Sofa, Sparkles, Trash, TriangleAlert, Utensils, X,
} from '@lucide/vue'
import { design, ui } from '../store'
import { catalog, categories, newId, type CatalogEntry } from '../data/catalog'
import { rooms } from '../data/house'
import { blockingRects, footprint, rectsOverlap, roomAt } from '../geometry'
import type { FurnitureItem } from '../types'
import { furnitureIcon } from './icons'
import { hasInterior } from '../cabinet'

const categoryIcons = { 臥室: BedDouble, 客廳: Sofa, 餐廚: Utensils, 其他: Package } as const

/** 各種家具可以開關的配備 */
const featureDefs: Record<string, { key: string; label: string }[]> = {
  kitchen: [
    { key: 'dishdryer', label: '烘碗機（水槽上方吊櫃，建商附）' },
    { key: 'dishwasher', label: '洗碗機（45 公分，水槽旁，需改櫃）' },
  ],
  island: [{ key: 'microwave', label: '嵌入微波爐' }],
  diningisland: [{ key: 'microwave', label: '中島嵌入微波爐' }],
  peninsula: [{ key: 'outlets', label: '雙連三孔插座（餐桌外端＋靠窗檯面嵌入）' }],
  windowisland: [
    { key: 'microwave', label: '嵌入微波爐' },
    { key: 'tableout', label: '抽拉餐桌拉出（用餐時）' },
  ],
}

function toggleFeature(key: string) {
  const it = selected.value
  if (!it) return
  const set = new Set(it.features ?? [])
  if (set.has(key)) set.delete(key)
  else set.add(key)
  it.features = [...set]
}

const cat = ref(categories[0])
const target = ref('living')

const selected = computed(() => design.furniture.find((f) => f.id === ui.selectedId))
const selectedRoom = computed(() => (selected.value ? roomAt(selected.value.x, selected.value.y)?.name ?? '室外' : ''))
const walls = computed(() => blockingRects(design.ceilingHeight))
const hitsWall = computed(() => {
  const it = selected.value
  if (!it || it.type === 'rug' || it.locked) return false
  const fp = footprint(it)
  return walls.value.some((r) => rectsOverlap(fp, r, 1))
})

const grouped = computed(() => {
  const out: { room: string; items: FurnitureItem[] }[] = []
  const names = [...rooms.map((r) => r.name), '其他']
  for (const n of names) out.push({ room: n, items: [] })
  for (const it of design.furniture) {
    const r = roomAt(it.x, it.y)?.name ?? '其他'
    out.find((g) => g.room === r)!.items.push(it)
  }
  return out.filter((g) => g.items.length)
})

/** 目錄卡片的底色：家具預設色調淡 */
const tint = (c: string) => `color-mix(in srgb, ${c} 28%, #fffdfa)`

function add(c: CatalogEntry) {
  const r = rooms.find((x) => x.id === target.value) ?? rooms[0]
  const it: FurnitureItem = {
    id: newId(),
    type: c.type,
    name: c.name,
    x: Math.round((r.x1 + r.x2) / 2),
    y: Math.round((r.y1 + r.y2) / 2),
    rot: 0,
    w: c.w,
    d: c.d,
    h: c.h,
    elev: c.elev ?? 0,
    color: c.color,
    ...(c.features ? { features: [...c.features] } : {}),
  }
  design.furniture.push(it)
  ui.selectedId = it.id
  // 新增後直接進入移動，方便馬上拖到想要的位置
  ui.tool = 'move'
}

/** deg > 0 = 畫面上逆時針；翻轉戶別時畫面上下顛倒，資料的角度方向要反過來 */
function rotate(deg: number) {
  const it = selected.value
  if (!it) return
  const d = design.mirrored ? -deg : deg
  it.rot = (((it.rot + d) % 360) + 360) % 360
}

function duplicate() {
  const it = selected.value
  if (!it) return
  const copy = { ...it, id: newId(), x: it.x + 20, y: it.y + 20, locked: false }
  design.furniture.push(copy)
  ui.selectedId = copy.id
}

function remove() {
  const it = selected.value
  if (!it) return
  design.furniture.splice(design.furniture.indexOf(it), 1)
  ui.selectedId = null
}
</script>

<template>
  <!-- 選取中的家具 -->
  <section v-if="selected" class="item-card">
    <div class="item-head">
      <input v-model="selected.color" type="color" title="顏色" />
      <input v-model="selected.name" class="item-name" title="名稱（點一下可以改）" />
      <button class="icon-btn" title="取消選取（Esc）" @click="ui.selectedId = null"><X /></button>
    </div>
    <div class="item-meta">
      <span class="badge"><MapPin />{{ selectedRoom }}</span>
      <span v-if="selected.locked" class="badge warn"><Lock />位置已鎖定</span>
    </div>
    <div v-if="hitsWall" class="alert"><TriangleAlert />這件家具卡到牆了</div>

    <p class="sublabel">尺寸</p>
    <div class="grid-3">
      <label class="field">
        <span>寬</span>
        <div class="unit"><input v-model.number="selected.w" class="input" type="number" min="1" /><em>cm</em></div>
      </label>
      <label class="field">
        <span>深</span>
        <div class="unit"><input v-model.number="selected.d" class="input" type="number" min="1" /><em>cm</em></div>
      </label>
      <label class="field">
        <span>高</span>
        <div class="unit"><input v-model.number="selected.h" class="input" type="number" min="1" /><em>cm</em></div>
      </label>
    </div>

    <p class="sublabel">位置</p>
    <div class="grid-3">
      <label class="field">
        <span>X</span>
        <div class="unit">
          <input v-model.number="selected.x" class="input" type="number" :disabled="selected.locked" /><em>cm</em>
        </div>
      </label>
      <label class="field">
        <span>Y</span>
        <div class="unit">
          <input v-model.number="selected.y" class="input" type="number" :disabled="selected.locked" /><em>cm</em>
        </div>
      </label>
      <label class="field">
        <span>離地</span>
        <div class="unit"><input v-model.number="selected.elev" class="input" type="number" min="0" /><em>cm</em></div>
      </label>
    </div>

    <p class="sublabel">方向</p>
    <div class="rot-row">
      <button class="btn" title="逆時針轉 90°" :disabled="selected.locked" @click="rotate(90)"><RotateCcw /></button>
      <div class="unit">
        <input v-model.number="selected.rot" class="input" type="number" step="15" :disabled="selected.locked" /><em>°</em>
      </div>
      <button class="btn" title="順時針轉 90°" :disabled="selected.locked" @click="rotate(-90)"><RotateCw /></button>
    </div>

    <label class="switch-row">
      <span><Lock />鎖定位置</span>
      <input v-model="selected.locked" type="checkbox" class="switch" />
    </label>
    <label v-for="f in featureDefs[selected.type] ?? []" :key="f.key" class="switch-row">
      <span><Sparkles />{{ f.label }}</span>
      <input type="checkbox" class="switch" :checked="selected.features?.includes(f.key)" @change="toggleFeature(f.key)" />
    </label>

    <button
      v-if="hasInterior(selected)"
      class="btn block cab-open"
      :class="ui.cabinetEditor ? 'primary' : 'soft'"
      @click="ui.cabinetEditor = !ui.cabinetEditor"
    >
      <LayoutPanelTop />{{ ui.cabinetEditor ? '收起櫃內規劃' : '櫃內規劃（立面圖）' }}
    </button>

    <div class="item-actions">
      <button
        class="btn"
        :class="ui.tool === 'move' ? 'primary' : 'soft'"
        :disabled="selected.locked"
        title="切到「移動」工具（M）"
        @click="ui.tool = ui.tool === 'move' ? 'select' : 'move'"
      >
        <Move />{{ ui.tool === 'move' ? '移動中' : '移動' }}
      </button>
      <button class="btn" @click="duplicate"><Copy />複製</button>
      <button class="btn danger" :disabled="selected.locked" @click="remove"><Trash />刪除</button>
    </div>
    <p v-if="design.mirrored" class="muted">X、Y 以 A2・B2 方向為準，所以 Y 會和畫面上下相反。</p>
  </section>

  <section v-else class="empty">
    <div class="empty-icon"><MousePointer2 /></div>
    <div>
      <b>還沒有選取家具</b>
      <small>用左側「選取」點畫面上的家具，或從下方新增</small>
    </div>
  </section>

  <!-- 新增家具 -->
  <section class="section">
    <div class="section-head">
      <h3><Plus />新增家具</h3>
      <label class="aside">
        放到
        <select v-model="target" class="input">
          <option v-for="r in rooms" :key="r.id" :value="r.id">{{ r.name }}</option>
        </select>
      </label>
    </div>
    <div class="row wrap">
      <button v-for="c in categories" :key="c" class="chip" :class="{ on: cat === c }" @click="cat = c">
        <component :is="categoryIcons[c as keyof typeof categoryIcons]" />{{ c }}
      </button>
    </div>
    <div class="catalog">
      <button
        v-for="c in catalog.filter((x) => x.category === cat)"
        :key="c.name"
        class="cat-card"
        :title="`新增${c.name}`"
        @click="add(c)"
      >
        <span class="cat-icon" :style="{ background: tint(c.color) }"><component :is="furnitureIcon(c.type)" /></span>
        <b>{{ c.name }}</b>
        <small>{{ c.w }} × {{ c.d }} × {{ c.h }}</small>
      </button>
    </div>
  </section>

  <!-- 已擺放 -->
  <section class="section">
    <div class="section-head">
      <h3><Rows3 />已擺放</h3>
      <span class="badge">{{ design.furniture.length }} 件</span>
    </div>
    <details v-for="g in grouped" :key="g.room" class="group" open>
      <summary>
        <ChevronRight class="chev" />{{ g.room }}
        <span class="badge">{{ g.items.length }}</span>
      </summary>
      <button
        v-for="it in g.items"
        :key="it.id"
        class="list-item"
        :class="{ on: it.id === ui.selectedId }"
        @click="ui.selectedId = it.id"
      >
        <component :is="furnitureIcon(it.type)" />
        <span>{{ it.name }}</span>
        <small>{{ it.w }}×{{ it.d }}</small>
        <i class="swatch-dot" :style="{ background: it.color }"></i>
        <Lock v-if="it.locked" class="lock" />
      </button>
    </details>
  </section>
</template>
