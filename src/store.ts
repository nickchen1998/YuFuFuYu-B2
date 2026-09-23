import { reactive, watch } from 'vue'
import type { Design, Tool, ViewMode } from './types'
import { CEILING_DEFAULT, rooms } from './data/house'
import { defaultFurniture } from './data/catalog'

const KEY = 'my-house-b2-design-v2'
const REV = 2

export function defaultDesign(): Design {
  return {
    version: 1,
    rev: REV,
    ceilingHeight: CEILING_DEFAULT,
    furniture: defaultFurniture(),
    roomFloors: Object.fromEntries(rooms.map((r) => [r.id, r.floor])),
    wallPaint: {},
  }
}

function isDesign(v: unknown): v is Design {
  const d = v as Design
  return !!d && d.version === 1 && Array.isArray(d.furniture) && typeof d.ceilingHeight === 'number'
}

const swapBedrooms = (s: string) => s.replace(/master|bed2/g, (m) => (m === 'master' ? 'bed2' : 'master'))
const swapKeys = (o: Record<string, string> = {}) =>
  Object.fromEntries(Object.entries(o).map(([k, v]) => [swapBedrooms(k), v]))

/** 舊存檔轉成目前的平面資料 id */
function migrate(d: Design): Design {
  // rev 2：主臥 / 次臥 對調（有半套衛浴的左側房間才是主臥），房間與牆的 id 跟著換
  if ((d.rev ?? 1) < 2) {
    d.roomFloors = swapKeys(d.roomFloors)
    d.wallPaint = swapKeys(d.wallPaint)
  }
  d.rev = REV
  return d
}

function load(): Design | null {
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw)
    if (!isDesign(parsed)) return null
    migrate(parsed)
    const base = defaultDesign()
    return { ...base, ...parsed, roomFloors: { ...base.roomFloors, ...parsed.roomFloors } }
  } catch {
    return null
  }
}

export const design = reactive<Design>(load() ?? defaultDesign())

let timer: number | undefined
watch(
  design,
  () => {
    clearTimeout(timer)
    timer = window.setTimeout(() => {
      try {
        localStorage.setItem(KEY, JSON.stringify(design))
      } catch {
        /* 私密模式等情況存不了就算了 */
      }
    }, 300)
  },
  { deep: true },
)

export function replaceDesign(next: unknown): boolean {
  if (!isDesign(next)) return false
  migrate(next)
  const base = defaultDesign()
  design.rev = REV
  design.ceilingHeight = next.ceilingHeight
  design.furniture = next.furniture
  design.roomFloors = { ...base.roomFloors, ...(next.roomFloors ?? {}) }
  design.wallPaint = { ...(next.wallPaint ?? {}) }
  return true
}

export const ui = reactive({
  mode: 'orbit' as ViewMode,
  tool: 'select' as Tool,
  wallCut: 150,
  showLabels: true,
  showOverlay: false,
  overlayOpacity: 0.8,
  doorsOpen: true,
  snap: 5,
  selectedId: null as string | null,
  paintColor: '#a7bac9',
  measure: null as string | null,
  panel: 'furniture' as 'furniture' | 'rooms' | 'view',
})
