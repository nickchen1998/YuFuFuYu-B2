<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, watch, type Component } from 'vue'
import {
  Box, Check, DoorOpen, Footprints, House, Info, Layers, Map as MapIcon, MapPin,
  MousePointer2, Move, PaintRoller, Palette, Ruler, SlidersHorizontal, Sofa, Tag,
} from '@lucide/vue'
import { Viewer } from './three/Viewer'
import { design, ui } from './store'
import { viewerRef } from './viewerRef'
import { redo, undo } from './history'
import { rooms } from './data/house'
import FurniturePanel from './components/FurniturePanel.vue'
import RoomsPanel from './components/RoomsPanel.vue'
import ViewPanel from './components/ViewPanel.vue'
import type { Tool, ViewMode } from './types'

const host = ref<HTMLElement>()
const toast = ref('')
let toastTimer: number | undefined

const modes: { id: ViewMode; name: string; icon: Component }[] = [
  { id: 'orbit', name: '3D 鳥瞰', icon: Box },
  { id: 'top', name: '平面俯視', icon: MapIcon },
  { id: 'walk', name: '室內漫遊', icon: Footprints },
]
const tools: { id: Tool; name: string; tip: string; icon: Component }[] = [
  { id: 'select', name: '選取', tip: '點選家具（V）', icon: MousePointer2 },
  { id: 'move', name: '移動', tip: '拖動已選取的家具（M）', icon: Move },
  { id: 'paint', name: '油漆', tip: '點牆面刷油漆', icon: PaintRoller },
  { id: 'measure', name: '量尺', tip: '量兩點之間的距離', icon: Ruler },
]
const panels = [
  { id: 'furniture', name: '家具清單', icon: Sofa },
  { id: 'rooms', name: '空間材質', icon: Palette },
  { id: 'view', name: '顯示', icon: SlidersHorizontal },
] as const
const walkRooms = rooms.filter((r) => r.id !== 'ac')

const wallCutOn = computed(() => ui.wallCut < design.ceilingHeight)

/** 底部操作提示：k = 按鍵／動作、t = 說明 */
const hint = computed<{ k?: string; t: string }[]>(() => {
  if (ui.mode === 'walk') return [{ k: 'W A S D', t: '走動' }, { k: '拖曳', t: '轉頭' }, { k: 'Shift', t: '走快一點' }]
  if (ui.tool === 'paint') return [{ k: '點牆面', t: '刷上目前顏色' }, { k: 'Alt + 點', t: '恢復原色' }, { t: '顏色在「空間材質」挑選' }]
  if (ui.tool === 'measure') return [{ k: '點兩下', t: '量距離' }, { t: '會吸附牆面、自動拉直' }, { k: 'Esc', t: '清除' }]
  if (ui.tool === 'move') {
    const it = design.furniture.find((f) => f.id === ui.selectedId)
    if (!it) return [{ t: '移動只會拖動已選取的家具' }, { k: 'V', t: '先切到選取點一件家具' }]
    if (it.locked) return [{ t: `「${it.name}」已鎖定，請先在右側取消鎖定` }]
    return [{ k: '拖曳', t: `移動「${it.name}」` }, { k: 'Alt', t: '不吸附' }, { k: 'R', t: '旋轉' }, { t: '其他家具不會被選到' }]
  }
  return [{ k: '點擊', t: '選取家具' }, { k: '拖曳', t: '旋轉視角' }, { k: '右鍵', t: '平移' }, { k: '滾輪', t: '縮放' }, { k: 'M', t: '移動模式' }]
})

function flash(msg: string) {
  toast.value = msg
  clearTimeout(toastTimer)
  toastTimer = window.setTimeout(() => (toast.value = ''), 2200)
}

function setMirrored(v: boolean) {
  if (design.mirrored === v) return
  design.mirrored = v
  flash(v ? '已切換為 A6・B6（A2・B2 上下翻轉）' : '已切換為 A2・B2')
}

function clearMissingSelection() {
  if (ui.selectedId && !design.furniture.some((f) => f.id === ui.selectedId)) ui.selectedId = null
}

function doUndo() {
  if (undo()) {
    clearMissingSelection()
    flash('已回到上一步')
  }
}

function doRedo() {
  if (redo()) {
    clearMissingSelection()
    flash('已重做下一步')
  }
}

function onShortcut(e: KeyboardEvent) {
  const t = e.target as HTMLElement | null
  // 輸入框裡的 ⌘Z 交給瀏覽器處理（復原打字內容）
  if (t && (t.tagName === 'INPUT' || t.tagName === 'SELECT' || t.tagName === 'TEXTAREA')) return
  if (e.metaKey || e.ctrlKey) {
    if (e.altKey) return
    if (e.code === 'KeyZ') {
      e.preventDefault()
      if (e.shiftKey) doRedo()
      else doUndo()
    } else if (e.code === 'KeyY') {
      e.preventDefault()
      doRedo()
    }
    return
  }
  if (e.altKey || e.shiftKey || ui.mode === 'walk') return
  if (e.code === 'KeyV') ui.tool = 'select'
  else if (e.code === 'KeyM') ui.tool = 'move'
}

onMounted(() => {
  window.addEventListener('keydown', onShortcut)
  const v = new Viewer(host.value!, design, ui)
  viewerRef.current = v
  if (import.meta.env.DEV) Object.assign(window, { __viewer: v, __design: design, __ui: ui })
  watch(() => design.furniture, () => v.syncFurniture(), { deep: true })
  watch(
    () => [ui.wallCut, ui.doorsOpen, ui.mainDoorOpen, design.ceilingHeight, JSON.stringify(design.wallPaint)],
    () => v.rebuildWalls(),
  )
  watch(() => JSON.stringify(design.roomFloors), () => v.updateFloors())
  watch(() => ui.mode, (m) => v.setMode(m))
  watch(() => [ui.showOverlay, ui.overlayOpacity], () => v.setOverlay())
  watch(() => ui.showLabels, () => v.setLabels())
  watch(() => ui.selectedId, () => v.updateSelection())
  watch(() => ui.tool, () => v.clearMeasure())
  watch(() => design.mirrored, () => v.applyMirror())
  watch(() => ui.showAirflow, () => v.applyAirflow())
  watch(() => [ui.cabinetOpen, ui.openAllCabinets], () => v.applyInterior())
})

onBeforeUnmount(() => {
  window.removeEventListener('keydown', onShortcut)
  viewerRef.current?.dispose()
  viewerRef.current = null
})
</script>

<template>
  <div class="app">
    <div ref="host" class="viewport"></div>

    <!-- 頂部：品牌與戶別／視角／歷史紀錄 -->
    <header class="topbar">
      <div class="brand glass">
        <div class="logo"><House /></div>
        <div class="brand-text">
          <b>有富富玉</b>
          <span>AB 棟 · 3D 格局規劃</span>
        </div>
        <div class="vr"></div>
        <div class="unit-switch" title="A6、B6 的格局和 A2、B2 相同，只是上下翻轉">
          <span>戶別</span>
          <div class="seg sm">
            <button :class="{ on: !design.mirrored }" @click="setMirrored(false)">A2・B2</button>
            <button :class="{ on: design.mirrored }" @click="setMirrored(true)">A6・B6</button>
          </div>
        </div>
      </div>

      <div class="view-switch glass">
        <div class="seg">
          <button v-for="m in modes" :key="m.id" :class="{ on: ui.mode === m.id }" @click="ui.mode = m.id">
            <component :is="m.icon" />
            <span>{{ m.name }}</span>
          </button>
        </div>
      </div>

    </header>

    <!-- 左側工具列 -->
    <nav v-if="ui.mode !== 'walk'" class="rail glass">
      <button
        v-for="t in tools"
        :key="t.id"
        class="rail-btn tip tip-right"
        :class="{ on: ui.tool === t.id }"
        :data-tip="t.tip"
        @click="ui.tool = t.id"
      >
        <component :is="t.icon" />
        <span>{{ t.name }}</span>
      </button>
      <hr />
      <button
        class="rail-btn toggle tip tip-right"
        :class="{ on: wallCutOn }"
        :data-tip="wallCutOn ? `牆切在 ${ui.wallCut} 公分，點一下恢復完整牆高` : '把牆切到 150 公分，方便看室內'"
        @click="ui.wallCut = wallCutOn ? design.ceilingHeight : 150"
      >
        <Layers />
        <span>切牆</span>
      </button>
      <button
        class="rail-btn toggle tip tip-right"
        :class="{ on: ui.showLabels }"
        data-tip="顯示房間名稱與坪數"
        @click="ui.showLabels = !ui.showLabels"
      >
        <Tag />
        <span>標示</span>
      </button>
      <button
        class="rail-btn toggle tip tip-right"
        :class="{ on: ui.doorsOpen }"
        data-tip="打開／關上室內的門（大門在「顯示」分頁）"
        @click="ui.doorsOpen = !ui.doorsOpen"
      >
        <DoorOpen />
        <span>開門</span>
      </button>
    </nav>

    <!-- 底部：操作提示、量尺結果、漫遊瞬移 -->
    <footer class="hud">
      <div v-if="ui.mode === 'walk'" class="teleport glass">
        <span class="teleport-label"><MapPin />前往</span>
        <button v-for="r in walkRooms" :key="r.id" class="chip" @click="viewerRef.current?.teleport(r.id)">
          {{ r.name }}
        </button>
      </div>
      <div class="hud-row">
        <div class="hint">
          <span v-for="(p, i) in hint" :key="i" class="hint-item">
            <kbd v-if="p.k">{{ p.k }}</kbd>{{ p.t }}
          </span>
        </div>
        <div v-if="ui.measure" class="measure-pill"><Ruler />{{ ui.measure }}</div>
      </div>
    </footer>

    <Transition name="toast">
      <div v-if="toast" class="toast"><Check />{{ toast }}</div>
    </Transition>

    <!-- 右側檢視器 -->
    <aside class="inspector">
      <nav class="inspector-tabs">
        <div class="seg full">
          <button v-for="p in panels" :key="p.id" :class="{ on: ui.panel === p.id }" @click="ui.panel = p.id">
            <component :is="p.icon" />
            {{ p.name }}
          </button>
        </div>
      </nav>
      <div class="inspector-body">
        <FurniturePanel v-if="ui.panel === 'furniture'" />
        <RoomsPanel v-else-if="ui.panel === 'rooms'" />
        <ViewPanel v-else />
      </div>
      <footer class="inspector-foot"><Info />僅供住戶設計概念參考 · 尺寸以現場丈量為準</footer>
    </aside>
  </div>
</template>
