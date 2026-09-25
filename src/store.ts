import { reactive, watch } from 'vue'
import type { Design, FurnitureItem, Tool, ViewMode } from './types'
import { CEILING_DEFAULT, rooms } from './data/house'
import { defaultFurniture } from './data/catalog'
import { clone } from './cabinet'

const KEY = 'my-house-b2-design-v2'
const REV = 17
/**
 * 各版本只替換指定的家具（換成新的預設），其他家具保留使用者的調整。
 * 有列欄位時只更新那些欄位（位置等其他調整保留；使用者刪掉的不會加回來）。
 */
const FURNITURE_PATCHES: [number, string[], (keyof FurnitureItem)[]?][] = [
  // rev 7：加大雙人床、半島型中島餐桌與四張椅、三人沙發、咖啡櫃
  [7, ['mbed', 'mns1', 'mns2', 'mward', 'dining', 'dchair1', 'dchair2', 'dchair3', 'dchair4', 'rice', 'fryer', 'sofa', 'coffeebar', 'espresso']],
  // rev 8：中島餐桌加寬到 90，電鍋與氣炸鍋橫向並排
  [8, ['dining', 'rice', 'fryer']],
  // rev 9：咖啡櫃改矮櫃、主臥投影機與投影畫面、鞋櫃上方洞洞板
  [9, ['coffeebar', 'espresso', 'projector', 'projection', 'pegboard']],
  // rev 10：工作陽台加乾衣機，洗衣機一起往女兒牆那側移、並排不堆疊
  [10, ['washer', 'dryer']],
  // rev 12：洗衣機、乾衣機維持並排，整組往次臥窗下那面牆推（離女兒牆遠、避免淋雨）
  [12, ['washer', 'dryer']],
  // rev 13：衣櫃做到頂＋櫃內規劃；次臥椅子背後加矮櫃與到頂書櫃
  [13, ['mward', 'bward1'], ['h', 'interior']],
  [13, ['shoe', 'coffeebar', 'tvstand', 'mns1', 'mns2', 'dining'], ['interior', 'features']],
  [13, ['scab', 'sshelf']],
  // rev 14：椅子背後那面是輕隔間，書櫃全部改落地、不做到頂（210）
  [14, ['sshelf', 'sshelf2']],
  // rev 15：中島餐桌兩端各一組雙連三孔插座
  [15, ['dining'], ['features']],
  // rev 16：書櫃太高，先拿掉（只留下排印表機那排矮櫃）
  [16, ['sshelf', 'sshelf2']],
  // rev 17：中島走道側加中立板（層板跨距 95 太長）
  [17, ['dining'], ['interior']],
]
/** 家具預設配置的版本：舊存檔低於這個版本時，家具換成新配置（舊的另存備份） */
const LAYOUT_REV = 6

export function defaultDesign(): Design {
  return {
    version: 1,
    rev: REV,
    mirrored: false,
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
  // rev 3：預設樓高由 280 改為 300；沒有手動改過的存檔跟著更新
  if ((d.rev ?? 1) < 3 && d.ceilingHeight === 280) d.ceilingHeight = CEILING_DEFAULT
  d.rev = REV
  return d
}

function load(): Design | null {
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw)
    if (!isDesign(parsed)) return null
    const rev = parsed.rev ?? 1
    migrate(parsed)
    // 家具預設配置更新時（rev 4：兩人生活規劃；rev 5：按摩椅移到次臥、冷氣位置；rev 6：窗下訂製中島），
    // 牆色、地板、樓高、戶別保留；舊的家具擺設另存一份，需要時可以救回來。
    if (rev < LAYOUT_REV) {
      try {
        localStorage.setItem(`${KEY}-furniture-backup-rev${rev}`, JSON.stringify(parsed.furniture))
      } catch {
        /* 存不了就算了 */
      }
      parsed.furniture = defaultFurniture()
    } else {
      const seeds = new Map(defaultFurniture().map((f) => [f.id, f]))
      for (const [patchRev, ids, fields] of FURNITURE_PATCHES) {
        if (rev >= patchRev) continue
        if (fields) {
          for (const f of parsed.furniture) {
            const seed = seeds.get(f.id)
            if (!seed || seed.type !== f.type || !ids.includes(f.id)) continue
            const rec = f as unknown as Record<string, unknown>
            for (const k of fields) {
              if (seed[k] === undefined) delete rec[k]
              else rec[k] = clone(seed[k])
            }
          }
          continue
        }
        parsed.furniture = [
          ...parsed.furniture.filter((f) => !ids.includes(f.id)),
          ...ids.flatMap((id) => seeds.get(id) ?? []),
        ]
      }
    }
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
  design.mirrored = !!next.mirrored
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
  mainDoorOpen: false,
  showAirflow: true,
  /** 選取的櫃子在 3D 裡打開櫃門，看得到櫃內格局 */
  cabinetOpen: true,
  /** 所有櫃子都打開櫃門 */
  openAllCabinets: false,
  snap: 5,
  selectedId: null as string | null,
  paintColor: '#a7bac9',
  measure: null as string | null,
  panel: 'furniture' as 'furniture' | 'rooms' | 'view',
})
