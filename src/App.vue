<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { Viewer } from './three/Viewer'
import { defaultDesign, design, replaceDesign, ui } from './store'
import { viewerRef } from './viewerRef'
import { history, redo, undo } from './history'
import FurniturePanel from './components/FurniturePanel.vue'
import RoomsPanel from './components/RoomsPanel.vue'
import ViewPanel from './components/ViewPanel.vue'
import type { Tool, ViewMode } from './types'

const host = ref<HTMLElement>()
const toast = ref('')
let toastTimer: number | undefined

const modes: { id: ViewMode; name: string }[] = [
  { id: 'orbit', name: '3D 鳥瞰' },
  { id: 'top', name: '平面俯視' },
  { id: 'walk', name: '室內漫遊' },
]
const tools: { id: Tool; name: string }[] = [
  { id: 'select', name: '👆 選取' },
  { id: 'move', name: '✥ 移動' },
  { id: 'paint', name: '🖌 刷油漆' },
  { id: 'measure', name: '📏 量尺寸' },
]

const hint = computed(() => {
  if (ui.mode === 'walk') return 'W A S D／方向鍵移動 · 拖曳滑鼠轉頭 · Shift 加速'
  if (ui.tool === 'paint') return '點牆面刷上目前顏色 · Alt + 點牆面恢復原色 · 顏色在「空間材質」分頁挑'
  if (ui.tool === 'measure') return '點兩下量距離（會吸附牆面、自動拉直）· 再點一下重新開始 · Esc 清除'
  if (ui.tool === 'move') {
    const it = design.furniture.find((f) => f.id === ui.selectedId)
    if (!it) return '移動只會拖動「已選取」的家具 · 請先按 V 切到「選取」點一件家具'
    if (it.locked) return `「${it.name}」已鎖定，要先在右側面板取消鎖定才能移動`
    return `拖曳「${it.name}」移動（靠牆自動貼齊，按住 Alt 自由移動）· 其他家具不會被選到 · 拖曳空白處轉視角`
  }
  return '點家具選取（拖曳畫面不會動到家具）· 按 M 切到「移動」拖動已選取的家具 · R 旋轉 · Delete 刪除'
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

type ResetKind = 'all' | 'furniture' | 'finish'
const resetOpen = ref(false)

/** 還原預設（可以用「上一步」復原，所以不再跳確認視窗）；戶別設定保留 */
function resetDesign(kind: ResetKind) {
  resetOpen.value = false
  const base = defaultDesign()
  if (kind === 'all') {
    replaceDesign({ ...base, mirrored: design.mirrored })
    ui.selectedId = null
    flash('已全部還原預設，按「上一步」可以復原')
  } else if (kind === 'furniture') {
    design.furniture = base.furniture
    ui.selectedId = null
    flash('已還原家具擺設，按「上一步」可以復原')
  } else {
    design.wallPaint = {}
    design.roomFloors = base.roomFloors
    flash('已還原牆色與地板，按「上一步」可以復原')
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
    () => [ui.wallCut, ui.doorsOpen, design.ceilingHeight, JSON.stringify(design.wallPaint)],
    () => v.rebuildWalls(),
  )
  watch(() => JSON.stringify(design.roomFloors), () => v.updateFloors())
  watch(() => ui.mode, (m) => v.setMode(m))
  watch(() => [ui.showOverlay, ui.overlayOpacity], () => v.setOverlay())
  watch(() => ui.showLabels, () => v.setLabels())
  watch(() => ui.selectedId, () => v.updateSelection())
  watch(() => ui.tool, () => v.clearMeasure())
  watch(() => design.mirrored, () => v.applyMirror())
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

    <header class="topbar">
      <div class="brand">
        <b>有富富玉 {{ design.mirrored ? 'A6・B6' : 'A2・B2' }}</b>
        <span>3D 格局・僅供住戶設計參考</span>
      </div>
      <div class="seg" title="A6、B6 的格局和 A2、B2 相同，只是上下翻轉">
        <span class="seg-label">戶別</span>
        <button :class="{ on: !design.mirrored }" @click="setMirrored(false)">A2・B2</button>
        <button :class="{ on: design.mirrored }" @click="setMirrored(true)">A6・B6</button>
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
      <div class="seg">
        <button :disabled="!history.canUndo" title="上一步（⌘/Ctrl + Z）" @click="doUndo">↶ 上一步</button>
        <button :disabled="!history.canRedo" title="下一步（⌘/Ctrl + Shift + Z）" @click="doRedo">↷ 下一步</button>
      </div>
      <div class="spacer"></div>
      <div class="actions">
        <div class="menu">
          <button :class="{ on: resetOpen }" @click="resetOpen = !resetOpen">還原預設 ▾</button>
          <div v-if="resetOpen" class="menu-backdrop" @click="resetOpen = false"></div>
          <div v-if="resetOpen" class="menu-list">
            <button @click="resetDesign('all')"><b>全部還原</b><small>家具、牆色、地板、天花板高度</small></button>
            <button @click="resetDesign('furniture')"><b>只還原家具擺設</b><small>保留牆色與地板</small></button>
            <button @click="resetDesign('finish')"><b>只還原牆色與地板</b><small>保留家具擺設</small></button>
            <p>還原後可以按「上一步」復原</p>
          </div>
        </div>
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
