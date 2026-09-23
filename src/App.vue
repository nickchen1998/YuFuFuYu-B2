<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { Viewer } from './three/Viewer'
import { defaultDesign, design, replaceDesign, ui } from './store'
import { viewerRef } from './viewerRef'
import FurniturePanel from './components/FurniturePanel.vue'
import RoomsPanel from './components/RoomsPanel.vue'
import ViewPanel from './components/ViewPanel.vue'
import type { Tool, ViewMode } from './types'

const host = ref<HTMLElement>()
const fileInput = ref<HTMLInputElement>()
const toast = ref('')
let toastTimer: number | undefined

const modes: { id: ViewMode; name: string }[] = [
  { id: 'orbit', name: '3D 鳥瞰' },
  { id: 'top', name: '平面俯視' },
  { id: 'walk', name: '室內漫遊' },
]
const tools: { id: Tool; name: string }[] = [
  { id: 'select', name: '✋ 選取／移動' },
  { id: 'paint', name: '🖌 刷油漆' },
  { id: 'measure', name: '📏 量尺寸' },
]

const hint = computed(() => {
  if (ui.mode === 'walk') return 'W A S D／方向鍵移動 · 拖曳滑鼠轉頭 · Shift 加速'
  if (ui.tool === 'paint') return '點牆面刷上目前顏色 · Alt + 點牆面恢復原色 · 顏色在「空間材質」分頁挑'
  if (ui.tool === 'measure') return '點兩下量距離（會吸附牆面、自動拉直）· 再點一下重新開始 · Esc 清除'
  return '點家具選取 · 拖曳家具移動（靠牆自動貼齊）· R 旋轉 · Delete 刪除 · 拖曳空白處轉視角、右鍵平移、滾輪縮放'
})

function flash(msg: string) {
  toast.value = msg
  clearTimeout(toastTimer)
  toastTimer = window.setTimeout(() => (toast.value = ''), 2200)
}

function download(name: string, href: string) {
  const a = document.createElement('a')
  a.href = href
  a.download = name
  a.click()
}

function stamp() {
  const d = new Date()
  const p = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}${p(d.getMonth() + 1)}${p(d.getDate())}-${p(d.getHours())}${p(d.getMinutes())}`
}

function screenshot() {
  const url = viewerRef.current?.screenshot()
  if (url) download(`my-house-${stamp()}.png`, url)
}

function exportJson() {
  const blob = new Blob([JSON.stringify(design, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  download(`my-house-design-${stamp()}.json`, url)
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}

async function importJson(e: Event) {
  const file = (e.target as HTMLInputElement).files?.[0]
  if (!file) return
  try {
    const ok = replaceDesign(JSON.parse(await file.text()))
    flash(ok ? '已匯入設計' : '檔案格式不對')
  } catch {
    flash('檔案讀取失敗')
  }
  ;(e.target as HTMLInputElement).value = ''
}

function reset() {
  if (!confirm('要把家具、地板、油漆全部恢復成預設嗎？（建議先匯出備份）')) return
  replaceDesign(defaultDesign())
  ui.selectedId = null
  flash('已恢復預設')
}

onMounted(() => {
  const v = new Viewer(host.value!, design, ui)
  viewerRef.current = v
  if (import.meta.env.DEV) Object.assign(window, { __viewer: v, __design: design, __ui: ui })
  watch(() => design.furniture, () => v.syncFurniture(), { deep: true })
  watch(
    () => [ui.wallCut, ui.doorsOpen, design.ceilingHeight, JSON.stringify(design.wallPaint)],
    () => v.rebuildWalls(),
  )
  watch(() => JSON.stringify(design.roomFloors), () => v.updateFloors())
  watch(() => ui.mode, (m) => v.setMode(m))
  watch(() => [ui.showOverlay, ui.overlayOpacity], () => v.setOverlay())
  watch(() => ui.showLabels, () => v.setLabels())
  watch(() => ui.selectedId, () => v.updateSelection())
  watch(() => ui.tool, () => v.clearMeasure())
})

onBeforeUnmount(() => {
  viewerRef.current?.dispose()
  viewerRef.current = null
})
</script>

<template>
  <div class="app">
    <div ref="host" class="viewport"></div>

    <header class="topbar">
      <div class="brand">
        <b>有富富玉 B2</b>
        <span>3D 格局・僅供住戶設計參考</span>
      </div>
      <div class="seg">
        <button v-for="m in modes" :key="m.id" :class="{ on: ui.mode === m.id }" @click="ui.mode = m.id">{{ m.name }}</button>
      </div>
      <div v-if="ui.mode !== 'walk'" class="seg">
        <button v-for="t in tools" :key="t.id" :class="{ on: ui.tool === t.id }" @click="ui.tool = t.id">{{ t.name }}</button>
      </div>
      <div v-if="ui.mode !== 'walk'" class="seg">
        <button title="切換：牆切半看室內 / 完整牆高" @click="ui.wallCut = ui.wallCut < design.ceilingHeight ? design.ceilingHeight : 150">
          🧱 {{ ui.wallCut < design.ceilingHeight ? `牆高切在 ${ui.wallCut}` : '完整牆高' }}
        </button>
      </div>
      <div class="spacer"></div>
      <div class="actions">
        <button title="重設視角" @click="viewerRef.current?.resetCamera()">⟲ 視角</button>
        <button @click="screenshot">📷 截圖</button>
        <button @click="exportJson">⬇ 匯出</button>
        <button @click="fileInput?.click()">⬆ 匯入</button>
        <button @click="reset">重設</button>
        <input ref="fileInput" type="file" accept="application/json,.json" hidden @change="importJson" />
      </div>
    </header>

    <aside class="panel">
      <nav class="tabs">
        <button :class="{ on: ui.panel === 'furniture' }" @click="ui.panel = 'furniture'">家具</button>
        <button :class="{ on: ui.panel === 'rooms' }" @click="ui.panel = 'rooms'">空間材質</button>
        <button :class="{ on: ui.panel === 'view' }" @click="ui.panel = 'view'">顯示</button>
      </nav>
      <div class="panel-body">
        <FurniturePanel v-if="ui.panel === 'furniture'" />
        <RoomsPanel v-else-if="ui.panel === 'rooms'" />
        <ViewPanel v-else />
      </div>
    </aside>

    <footer class="hintbar">
      <span>{{ hint }}</span>
      <b v-if="ui.measure" class="measure">📏 {{ ui.measure }}</b>
    </footer>

    <div v-if="toast" class="toast">{{ toast }}</div>
  </div>
</template>
