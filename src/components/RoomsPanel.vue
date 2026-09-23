<script setup lang="ts">
import { computed } from 'vue'
import { design, ui } from '../store'
import { rooms, walls } from '../data/house'
import { floorPresets, wallPalette } from '../data/materials'
import { fmt, roomFacing, roomSize, PING } from '../geometry'

const sizes = computed(() => rooms.map((r) => ({ r, ...roomSize(r) })))
const indoor = computed(() => sizes.value.filter((s) => !s.r.outdoor).reduce((a, s) => a + s.m2, 0))
const outdoor = computed(() => sizes.value.filter((s) => s.r.outdoor).reduce((a, s) => a + s.m2, 0))

function sidesOf(roomId: string) {
  const out: string[] = []
  for (const w of walls) {
    if (w.style === 'column' || w.style === 'louver') continue
    for (const side of ['a', 'b'] as const) if (roomFacing(w, side)?.id === roomId) out.push(`${w.id}:${side}`)
  }
  return out
}

function paintRoom(roomId: string) {
  for (const k of sidesOf(roomId)) design.wallPaint[k] = ui.paintColor
}

function clearRoom(roomId: string) {
  for (const k of sidesOf(roomId)) delete design.wallPaint[k]
}

function clearAll() {
  for (const k of Object.keys(design.wallPaint)) delete design.wallPaint[k]
}
</script>

<template>
  <section class="card">
    <header><h3>牆面油漆</h3></header>
    <div class="swatches">
      <button
        v-for="p in wallPalette"
        :key="p.color"
        :title="p.name"
        :class="{ on: ui.paintColor === p.color }"
        :style="{ background: p.color }"
        @click="ui.paintColor = p.color"
      ></button>
      <input v-model="ui.paintColor" type="color" title="自訂顏色" />
    </div>
    <div class="row">
      <button :class="{ primary: ui.tool === 'paint' }" @click="ui.tool = ui.tool === 'paint' ? 'select' : 'paint'">
        🖌 {{ ui.tool === 'paint' ? '刷油漆中（點牆面）' : '用油漆刷點單面牆' }}
      </button>
    </div>
    <p class="hint">也可以在下面用「整間刷」一次刷整個房間；Alt + 點牆面可以恢復原色。</p>
    <div class="row"><button @click="clearAll">全部恢復白牆</button></div>
  </section>

  <section class="card">
    <header><h3>空間與地板</h3></header>
    <div v-for="s in sizes" :key="s.r.id" class="room">
      <div class="room-head">
        <b>{{ s.r.name }}</b>
        <small>{{ fmt(s.w) }} × {{ fmt(s.d) }} · {{ fmt(s.ping, 2) }} 坪</small>
      </div>
      <select v-model="design.roomFloors[s.r.id]">
        <option v-for="p in floorPresets" :key="p.id" :value="p.id">{{ p.name }}</option>
      </select>
      <div class="row tight">
        <button @click="paintRoom(s.r.id)"><i class="dot" :style="{ background: ui.paintColor }"></i>整間刷</button>
        <button @click="clearRoom(s.r.id)">恢復白牆</button>
      </div>
    </div>
    <p class="total">
      室內面積約 <b>{{ fmt(indoor, 1) }} m²（{{ fmt(indoor / PING, 2) }} 坪）</b><br />
      陽台 + 平台約 {{ fmt(outdoor, 1) }} m²（{{ fmt(outdoor / PING, 2) }} 坪）
    </p>
    <p class="hint">以室內淨尺寸計算，不含牆厚與公設，會比權狀坪數小。</p>
  </section>

  <section class="card">
    <header><h3>天花板高度</h3></header>
    <div class="row">
      <input v-model.number="design.ceilingHeight" type="number" min="220" max="400" step="5" class="rot" />
      <span>cm（淨高，預設 280）</span>
    </div>
  </section>
</template>
