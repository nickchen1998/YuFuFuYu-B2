<script setup lang="ts">
import { computed } from 'vue'
import { Eraser, LandPlot, Minus, PaintRoller, Palette, Plus, Ruler } from '@lucide/vue'
import { design, ui } from '../store'
import { CEILING_DEFAULT, rooms, walls } from '../data/house'
import { floorPresets, wallPalette } from '../data/materials'
import { fmt, roomFacing, roomSize, PING } from '../geometry'
import { floorThumb } from '../three/textures'

const sizes = computed(() => rooms.map((r) => ({ r, ...roomSize(r) })))
const indoor = computed(() => sizes.value.filter((s) => !s.r.outdoor).reduce((a, s) => a + s.m2, 0))
const outdoor = computed(() => sizes.value.filter((s) => s.r.outdoor).reduce((a, s) => a + s.m2, 0))
const paletteName = computed(() => wallPalette.find((p) => p.color === ui.paintColor)?.name ?? '自訂顏色')

function thumbOf(roomId: string) {
  const preset = floorPresets.find((p) => p.id === design.roomFloors[roomId]) ?? floorPresets[0]
  return `url(${floorThumb(preset)})`
}

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

function stepCeiling(d: number) {
  design.ceilingHeight = Math.min(400, Math.max(220, design.ceilingHeight + d))
}
</script>

<template>
  <!-- 面積總覽 -->
  <section class="section">
    <div class="section-head" style="margin-bottom: 0">
      <h3><LandPlot />面積</h3>
      <span class="aside">室內淨尺寸計算</span>
    </div>
    <div class="summary">
      <div>
        <small>室內</small>
        <b>{{ fmt(indoor / PING, 2) }}<em>坪</em></b>
        <span>{{ fmt(indoor, 1) }} m²</span>
      </div>
      <div>
        <small>陽台＋冷氣平台</small>
        <b>{{ fmt(outdoor / PING, 2) }}<em>坪</em></b>
        <span>{{ fmt(outdoor, 1) }} m²</span>
      </div>
    </div>
    <p class="muted">不含牆厚與公設，會比權狀坪數小。</p>
  </section>

  <!-- 牆面油漆 -->
  <section class="section">
    <div class="section-head">
      <h3><Palette />牆面油漆</h3>
      <span class="aside"><i class="dot" :style="{ background: ui.paintColor }"></i>{{ paletteName }}</span>
    </div>
    <div class="swatches">
      <button
        v-for="p in wallPalette"
        :key="p.color"
        class="swatch"
        :class="{ on: ui.paintColor === p.color }"
        :title="p.name"
        :style="{ background: p.color }"
        @click="ui.paintColor = p.color"
      ></button>
      <input v-model="ui.paintColor" type="color" title="自訂顏色" />
    </div>
    <div class="grid-2" style="margin-top: 12px">
      <button
        class="btn"
        :class="ui.tool === 'paint' ? 'primary' : 'soft'"
        @click="ui.tool = ui.tool === 'paint' ? 'select' : 'paint'"
      >
        <PaintRoller />{{ ui.tool === 'paint' ? '刷油漆中' : '用油漆刷點牆' }}
      </button>
      <button class="btn ghost" @click="clearAll"><Eraser />全部恢復白牆</button>
    </div>
    <p class="muted">也可以在下方用「整間刷」一次刷整個房間；Alt + 點牆面可以恢復原色。</p>
  </section>

  <!-- 各空間 -->
  <section class="section">
    <div class="section-head">
      <h3><Ruler />空間與地板</h3>
      <span class="badge">{{ rooms.length }} 個空間</span>
    </div>
    <div v-for="s in sizes" :key="s.r.id" class="room-card">
      <div class="floor-thumb" :style="{ backgroundImage: thumbOf(s.r.id) }"></div>
      <div>
        <div class="room-title">
          <b>{{ s.r.name }}</b>
          <small>{{ fmt(s.ping, 2) }} 坪</small>
        </div>
        <select v-model="design.roomFloors[s.r.id]" class="input" :title="`${s.r.name}的地板`">
          <option v-for="p in floorPresets" :key="p.id" :value="p.id">{{ p.name }}</option>
        </select>
        <div class="row">
          <small class="grow muted" style="margin: 0">{{ fmt(s.w) }} × {{ fmt(s.d) }} cm</small>
          <button class="btn sm soft" @click="paintRoom(s.r.id)">
            <i class="dot" :style="{ background: ui.paintColor }"></i>整間刷
          </button>
          <button class="btn sm ghost" title="這個空間的牆恢復白色" @click="clearRoom(s.r.id)"><Eraser /></button>
        </div>
      </div>
    </div>
  </section>

  <!-- 天花板 -->
  <section class="section">
    <div class="section-head">
      <h3>天花板高度</h3>
      <span class="aside">預設 {{ CEILING_DEFAULT }} cm</span>
    </div>
    <div class="stepper">
      <button class="btn" title="降低 5 公分" @click="stepCeiling(-5)"><Minus /></button>
      <div class="unit">
        <input v-model.number="design.ceilingHeight" class="input" type="number" min="220" max="400" step="5" /><em>cm</em>
      </div>
      <button class="btn" title="增加 5 公分" @click="stepCeiling(5)"><Plus /></button>
    </div>
  </section>
</template>
