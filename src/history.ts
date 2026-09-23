import { reactive, watch } from 'vue'
import { design, replaceDesign } from './store'

// 上一步 / 下一步：整份設計存成 JSON 快照（資料量很小，存 100 步也沒負擔）。
// 連續的小變動（拖曳、方向鍵微調、打字）會合併成一步。

const LIMIT = 100
const QUIET_MS = 350

const past: string[] = []
const future: string[] = []
let current = JSON.stringify(design)
let paused = false
let timer: number | undefined

export const history = reactive({ canUndo: false, canRedo: false })

function sync() {
  history.canUndo = past.length > 0
  history.canRedo = future.length > 0
}

/** 把目前的設計記成新的一步（跟上一步一樣就不記） */
function commit() {
  clearTimeout(timer)
  const snap = JSON.stringify(design)
  if (snap === current) return
  past.push(current)
  if (past.length > LIMIT) past.shift()
  future.length = 0
  current = snap
  sync()
}

watch(
  design,
  () => {
    if (paused) return
    clearTimeout(timer)
    timer = window.setTimeout(commit, QUIET_MS)
  },
  { deep: true },
)

/** 拖曳開始：過程中的每次移動不記步驟 */
export function pauseHistory() {
  paused = true
  clearTimeout(timer)
}

/** 拖曳結束：整段拖曳記成一步 */
export function resumeHistory() {
  paused = false
  commit()
}

function restore(snap: string) {
  replaceDesign(JSON.parse(snap))
  // 以實際套用後的內容為準，避免被 watch 當成新的變動
  current = JSON.stringify(design)
  clearTimeout(timer)
  sync()
}

export function undo(): boolean {
  commit()
  const prev = past.pop()
  if (prev === undefined) return false
  future.push(current)
  restore(prev)
  return true
}

export function redo(): boolean {
  commit()
  const next = future.pop()
  if (next === undefined) return false
  past.push(current)
  restore(next)
  return true
}
