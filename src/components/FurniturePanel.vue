<script setup lang="ts">
import { computed, ref } from 'vue'
import { design, ui } from '../store'
import { catalog, categories, newId, type CatalogEntry } from '../data/catalog'
import { rooms } from '../data/house'
import { blockingRects, footprint, rectsOverlap, roomAt } from '../geometry'
import type { FurnitureItem } from '../types'

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
  }
  design.furniture.push(it)
  ui.selectedId = it.id
  ui.tool = 'select'
}

function rotate(deg: number) {
  const it = selected.value
  if (!it) return
  it.rot = (((it.rot + deg) % 360) + 360) % 360
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
  <section v-if="selected" class="card editor">
    <header>
      <input v-model="selected.name" class="name" />
      <button class="icon" title="取消選取（Esc）" @click="ui.selectedId = null">✕</button>
    </header>
    <p class="sub">
      位於 {{ selectedRoom }}
      <span v-if="selected.locked" class="tag">🔒 固定設備</span>
    </p>
    <p v-if="hitsWall" class="warn">⚠ 這件家具卡到牆了</p>
    <div class="grid3">
      <label>寬<input v-model.number="selected.w" type="number" min="1" step="1" /></label>
      <label>深<input v-model.number="selected.d" type="number" min="1" step="1" /></label>
      <label>高<input v-model.number="selected.h" type="number" min="1" step="1" /></label>
      <label>X<input v-model.number="selected.x" type="number" step="1" :disabled="selected.locked" /></label>
      <label>Y<input v-model.number="selected.y" type="number" step="1" :disabled="selected.locked" /></label>
      <label>離地<input v-model.number="selected.elev" type="number" min="0" step="1" /></label>
    </div>
    <div class="row">
      <span class="lbl">方向</span>
      <button :disabled="selected.locked" @click="rotate(-90)">↺ 90°</button>
      <input v-model.number="selected.rot" type="number" step="15" class="rot" :disabled="selected.locked" />
      <button :disabled="selected.locked" @click="rotate(90)">↻ 90°</button>
    </div>
    <div class="row">
      <span class="lbl">顏色</span>
      <input v-model="selected.color" type="color" />
      <label class="check"><input v-model="selected.locked" type="checkbox" /> 鎖定位置</label>
    </div>
    <div class="row actions">
      <button @click="duplicate">複製</button>
      <button class="danger" :disabled="selected.locked" @click="remove">刪除</button>
    </div>
    <p class="hint">單位：公分。拖曳移動，R 轉 90°，方向鍵微調（Shift ×10）</p>
  </section>

  <section class="card">
    <header>
      <h3>新增家具</h3>
      <label class="inline">
        放到
        <select v-model="target">
          <option v-for="r in rooms" :key="r.id" :value="r.id">{{ r.name }}</option>
        </select>
      </label>
    </header>
    <div class="chips">
      <button v-for="c in categories" :key="c" :class="{ on: cat === c }" @click="cat = c">{{ c }}</button>
    </div>
    <div class="catalog">
      <button v-for="c in catalog.filter((x) => x.category === cat)" :key="c.name" @click="add(c)">
        <i :style="{ background: c.color }"></i>
        <b>{{ c.name }}</b>
        <small>{{ c.w }}×{{ c.d }}×{{ c.h }}</small>
      </button>
    </div>
  </section>

  <section class="card">
    <header><h3>已擺放（{{ design.furniture.length }}）</h3></header>
    <div v-for="g in grouped" :key="g.room" class="group">
      <h4>{{ g.room }}</h4>
      <button
        v-for="it in g.items"
        :key="it.id"
        class="item"
        :class="{ on: it.id === ui.selectedId }"
        @click="ui.selectedId = it.id"
      >
        <i :style="{ background: it.color }"></i>
        <span>{{ it.name }}</span>
        <small>{{ it.w }}×{{ it.d }}</small>
        <em v-if="it.locked">🔒</em>
      </button>
    </div>
  </section>
</template>
