import type { CabinetColumn, CabinetFace, CabinetInterior, CabinetPart, FrontKind, FurnitureItem, PartKind } from './types'

// 櫃子內部規劃：尺寸計算（3D 模型與立面圖共用）
//   櫃體 = 側板＋底板＋頂板＋背板，內部分成「欄」（由左到右），每欄再分成「格」（由下往上）。
//   欄寬、格高都是淨尺寸（不含板厚）；沒填的會自動分配剩下的空間。

/** 系統板厚 18 mm */
export const PANEL = 1.8
/** 背板厚 */
export const BACK = 0.8
/** 門片厚 */
export const DOOR = 1.8
/** 欄寬超過這個數字時做兩扇對開門 */
export const DOUBLE_DOOR_OVER = 62

export const INTERIOR_TYPES = ['wardrobe', 'cabinet', 'nightstand', 'tvstand', 'coffeebar', 'bookshelf', 'peninsula']
export const hasInterior = (it: FurnitureItem) => INTERIOR_TYPES.includes(it.type)

export const partKinds: { id: PartKind; name: string; color: string; hint: string }[] = [
  { id: 'hang', name: '吊衣桿', color: '#dbe5ef', hint: '短衣淨高 90～100、長大衣 130 以上；衣桿最好不要高過 190。櫃子深度要 55 以上。' },
  { id: 'pullrod', name: '前後拉桿', color: '#dde2f1', hint: '淺櫃（深度不到 55）吊衣服用，拉出來取衣；欄寬要 45 以上。' },
  { id: 'shelf', name: '層板', color: '#efe5d3', hint: '摺疊衣物每層 30～35；雜物依物品高度。' },
  { id: 'books', name: '書', color: '#e8dcc6', hint: '一般書每層 25～28、A4 32～35；書櫃深 30、層板跨距不超過 80。' },
  { id: 'drawer', name: '抽屜', color: '#e7dccb', hint: '內衣、襪子 15～18；衣物、文件 20～25。' },
  { id: 'shoe', name: '鞋子', color: '#e4ded1', hint: '一般鞋每層 15～18、高筒鞋 25～30；一雙約佔寬 20。' },
  { id: 'pants', name: '褲架', color: '#dfe5e9', hint: '抽拉式褲架，淨高要 60 以上、櫃深 55 以上。' },
  { id: 'storage', name: '收納箱', color: '#ebe6dc', hint: '棉被、行李箱、換季衣物、收納盒。28 吋行李箱約 50 × 30 × 75。' },
  { id: 'appliance', name: '家電', color: '#dcdfe3', hint: '記得預留插座與散熱空間；嵌入式家電照型錄的開孔尺寸。' },
  { id: 'empty', name: '空格', color: '#f4f1ec', hint: '' },
]
export const partKind = (k: PartKind) => partKinds.find((p) => p.id === k) ?? partKinds[partKinds.length - 1]

export const frontKinds: { id: FrontKind; name: string }[] = [
  { id: 'door', name: '門片' },
  { id: 'drawer', name: '抽屜' },
  { id: 'open', name: '開放' },
]

/** 格子 helper：P('hang', 140, 'door', '長大衣') */
export function P(kind: PartKind, h?: number | null, front: FrontKind = 'door', label?: string, split?: boolean): CabinetPart {
  const p: CabinetPart = { kind, front }
  if (h != null) p.h = h
  if (label) p.label = label
  if (split) p.split = true
  return p
}

export const clone = <T>(v: T): T => JSON.parse(JSON.stringify(v)) as T

// ───────────────────────── 櫃體外框 ─────────────────────────

export interface CabFrame {
  /** 櫃體外框（半島型中島只算收納段） */
  w: number
  d: number
  h: number
  /** 踢腳或櫃腳高度 */
  base: number
  legs: boolean
  /** panel = 一般頂板、stone = 檯面（門片不蓋住）、none = 上面另外有檯面 */
  top: 'panel' | 'stone' | 'none'
  /** 內部淨寬、淨高、內部底面離地高度 */
  innerW: number
  innerH: number
  y0: number
}

export const STONE = 3

/** 半島型中島收納段的長度 */
export const peninsulaStorageLen = (it: FurnitureItem) => Math.min(100, Math.round(it.w * 0.45))
export const PENINSULA_TOP = 4

export function cabinetFrame(it: FurnitureItem): CabFrame {
  const legs = it.type === 'nightstand' || it.type === 'tvstand'
  const base = it.type === 'bookshelf' ? 0 : 8
  let w = it.w
  let h = it.h
  let top: CabFrame['top'] = 'panel'
  if (it.type === 'coffeebar') top = 'stone'
  if (it.type === 'peninsula') {
    w = peninsulaStorageLen(it)
    h = it.h - PENINSULA_TOP
    top = 'none'
  }
  const topT = top === 'panel' ? PANEL : top === 'stone' ? STONE : 0
  const y0 = base + PANEL
  return { w, d: it.d, h, base, legs, top, innerW: w - PANEL * 2, innerH: Math.max(1, h - y0 - topT), y0 }
}

/** 每一面的外深與淨深。單面櫃：背板在後、門片在前；雙面櫃：中間一片隔板當兩面共用的背板 */
export function faceDepths(it: FurnitureItem, inter: CabinetInterior): { depth: number; clear: number }[] {
  if (inter.faces.length < 2) return [{ depth: it.d, clear: it.d - BACK - DOOR }]
  const d0 = Math.min(it.d - 20, inter.faces[0].depth ?? Math.round(it.d * 0.6))
  const d1 = it.d - d0 - PANEL
  return [
    { depth: d0, clear: d0 - DOOR },
    { depth: d1, clear: d1 - DOOR },
  ]
}

// ───────────────────────── 分配尺寸 ─────────────────────────

/** 固定尺寸照填、沒填的平分剩下的；放不下或沒有自動的時候等比例縮放。over > 0 = 超出多少 */
export function distribute(sizes: (number | undefined)[], total: number, gap: number) {
  const n = sizes.length
  const avail = Math.max(0, total - gap * (n - 1))
  const fixed = sizes.reduce<number>((s, v) => s + (v ?? 0), 0)
  const autos = sizes.filter((v) => v == null).length
  let out: number[]
  if (autos && fixed <= avail) {
    const each = (avail - fixed) / autos
    out = sizes.map((v) => v ?? each)
  } else if (fixed > 0) {
    const k = avail / fixed
    out = sizes.map((v) => (v ?? 0) * k)
  } else {
    out = sizes.map(() => avail / n)
  }
  return { sizes: out, over: autos ? Math.max(0, fixed - avail) : fixed - avail, avail }
}

export interface LaidPart {
  part: CabinetPart
  i: number
  /** 離內部底面的高度、淨高 */
  y: number
  h: number
}
export interface LaidCol {
  col: CabinetColumn
  i: number
  /** 離內部左側的距離、淨寬 */
  x: number
  w: number
  parts: LaidPart[]
  /** 這一欄的格子高度加總和內高差多少（> 0 = 超出） */
  over: number
}
export interface FaceLayout {
  cols: LaidCol[]
  over: number
  innerW: number
  innerH: number
}

export function layoutFace(face: CabinetFace, innerW: number, innerH: number): FaceLayout {
  const cols = face.cols.length ? face.cols : [{ parts: [P('empty')] }]
  const cw = distribute(cols.map((c) => c.w), innerW, PANEL)
  let x = 0
  const laid = cols.map((col, i) => {
    const parts = col.parts.length ? col.parts : [P('empty')]
    const ph = distribute(parts.map((p) => p.h), innerH, PANEL)
    let y = 0
    const lp = parts.map((part, j) => {
      const r = { part, i: j, y, h: ph.sizes[j] }
      y += ph.sizes[j] + PANEL
      return r
    })
    const r: LaidCol = { col, i, x, w: cw.sizes[i], parts: lp, over: ph.over }
    x += cw.sizes[i] + PANEL
    return r
  })
  return { cols: laid, over: cw.over, innerW, innerH }
}

// ───────────────────────── 門片、抽屜面板 ─────────────────────────

export interface FrontPiece {
  kind: 'door' | 'drawer'
  col: number
  /** 蓋住的格子（由下往上） */
  parts: number[]
  /** 幾扇門（對開 = 2）、單扇門的鉸鏈在哪一邊 */
  leaves: number
  hinge: 'l' | 'r'
}

/** 同一欄裡相鄰的「門片」格會合成一扇門，除非上面那格設定了 split */
export function frontPieces(fl: FaceLayout): FrontPiece[] {
  const out: FrontPiece[] = []
  for (const c of fl.cols) {
    const leaves = c.w > DOUBLE_DOOR_OVER ? 2 : 1
    // 相鄰兩欄的單門成對打開（把手在中間）
    const hinge: 'l' | 'r' = fl.cols.length > 1 && c.i % 2 === 1 ? 'r' : 'l'
    let cur: FrontPiece | null = null
    for (const p of c.parts) {
      if (p.part.front === 'door') {
        if (cur && !p.part.split) cur.parts.push(p.i)
        else {
          cur = { kind: 'door', col: c.i, parts: [p.i], leaves, hinge }
          out.push(cur)
        }
      } else {
        cur = null
        if (p.part.front === 'drawer') out.push({ kind: 'drawer', col: c.i, parts: [p.i], leaves: 1, hinge })
      }
    }
  }
  return out
}

/**
 * 門片／抽屜面板的外框（內部座標：x 從內部左側、y 從內部底面算起）。
 * 全蓋門：左右蓋住側板或半片立板、上下蓋住底板或半片層板；檯面（stone／none）不蓋。
 */
export function frontRect(fl: FaceLayout, piece: FrontPiece, frame: CabFrame) {
  const c = fl.cols[piece.col]
  const last = fl.cols.length - 1
  const first = c.parts[piece.parts[0]]
  const top = c.parts[piece.parts[piece.parts.length - 1]]
  const topExt = frame.top === 'panel' ? PANEL : 0
  const x0 = c.x - (piece.col === 0 ? PANEL : PANEL / 2)
  const x1 = c.x + c.w + (piece.col === last ? PANEL : PANEL / 2)
  const y0 = first.y - (first.i === 0 ? PANEL : PANEL / 2)
  const y1 = top.y + top.h + (top.i === c.parts.length - 1 ? topExt : PANEL / 2)
  return { x0, x1, y0, y1 }
}

// ───────────────────────── 統計 ─────────────────────────

export function interiorStats(inter: CabinetInterior, it: FurnitureItem) {
  const frame = cabinetFrame(it)
  const s = { rod: 0, pullrods: 0, drawers: 0, shelves: 0, shoes: 0, books: 0, doors: 0, pants: 0 }
  for (const face of inter.faces) {
    const fl = layoutFace(face, frame.innerW, frame.innerH)
    for (const c of fl.cols)
      for (const p of c.parts) {
        const k = p.part.kind
        if (k === 'hang') s.rod += c.w
        else if (k === 'pullrod') s.pullrods += 1
        else if (k === 'drawer') s.drawers += 1
        else if (k === 'shelf') s.shelves += 1
        else if (k === 'shoe') s.shoes += Math.floor(c.w / 20)
        else if (k === 'books') s.books += Math.floor(c.w / 3)
        else if (k === 'pants') s.pants += 1
      }
    for (const f of frontPieces(fl)) if (f.kind === 'door') s.doors += f.leaves
  }
  return s
}

// ───────────────────────── 預設配置 ─────────────────────────

/** 沒有自訂規劃時的預設：依櫃子種類與尺寸產生 */
export function defaultInterior(it: FurnitureItem): CabinetInterior {
  const f = cabinetFrame(it)
  const nCols = (span: number) => Math.max(1, Math.round(f.innerW / span))
  const range = (n: number) => Array.from({ length: n }, (_, i) => i)
  const levels = (n: number, kind: PartKind, front: FrontKind = 'door') => range(n).map(() => P(kind, null, front))
  switch (it.type) {
    case 'wardrobe': {
      const hangKind: PartKind = it.d < 55 ? 'pullrod' : 'hang'
      const topH = it.h >= 260 ? 60 : it.h >= 200 ? 40 : 0
      const cols = range(nCols(60)).map((i): CabinetColumn => {
        const parts =
          i % 3 === 0
            ? [P(hangKind, null, 'door', '長衣')]
            : i % 3 === 1
              ? [P('drawer', 20), P('drawer', 20), P(hangKind, null, 'door', '短衣')]
              : levels(Math.max(2, Math.round((f.innerH - topH) / 36)), 'shelf')
        if (topH) parts.push(P('storage', topH, 'door', '上櫃', true))
        return { parts }
      })
      return { faces: [{ cols }] }
    }
    case 'bookshelf':
      return {
        faces: [{ cols: range(Math.max(1, Math.ceil(f.innerW / 80))).map(() => ({ parts: levels(Math.max(1, Math.round(f.innerH / 34)), 'books', 'open') })) }],
      }
    case 'nightstand':
      return { faces: [{ cols: [{ parts: [P('shelf', null, 'open'), P('drawer', Math.min(15, f.innerH / 2), 'drawer')] }] }] }
    case 'tvstand':
      if (f.innerW < 120) return { faces: [{ cols: [{ parts: [P('drawer', null, 'drawer'), P('drawer', null, 'drawer')] }] }] }
      return {
        faces: [
          {
            cols: [
              { w: 50, parts: [P('appliance', null, 'open', '網路設備')] },
              { parts: [P('drawer', null, 'drawer'), P('drawer', null, 'drawer')] },
              { w: 50, parts: [P('shelf', null, 'door')] },
            ],
          },
        ],
      }
    case 'coffeebar':
      return { faces: [{ cols: range(nCols(50)).map(() => ({ parts: [P('shelf'), P('shelf'), P('drawer', 15, 'drawer')] })) }] }
    case 'peninsula':
      return {
        faces: [
          {
            name: '廚房側',
            depth: 57,
            cols: [
              { w: 56, parts: [P('drawer', null, 'drawer'), P('appliance', 38, 'open', '嵌入微波爐')] },
              { parts: levels(3, 'drawer', 'drawer') },
            ],
          },
          { name: '走道側', cols: [{ parts: levels(2, 'shelf') }] },
        ],
      }
    default: {
      // 一般櫃子；名稱有「鞋」的當鞋櫃
      const shoe = it.name.includes('鞋')
      const per = shoe ? 17 : 35
      return { faces: [{ cols: range(nCols(shoe ? 80 : 60)).map(() => ({ parts: levels(Math.max(1, Math.round(f.innerH / per)), shoe ? 'shoe' : 'shelf') })) }] }
    }
  }
}

export function interiorOf(it: FurnitureItem): CabinetInterior {
  return it.interior?.faces?.length ? it.interior : defaultInterior(it)
}

// ───────────────────────── 提醒 ─────────────────────────

/** 尺寸上的提醒（衣桿太高、淺櫃橫吊、層板跨距太大…）；mirrored = A6・B6 畫面左右相反，欄號照畫面數 */
export function interiorWarnings(it: FurnitureItem, mirrored = false): string[] {
  const inter = interiorOf(it)
  const fr = cabinetFrame(it)
  const depths = faceDepths(it, inter)
  const out: string[] = []
  inter.faces.forEach((face, fi) => {
    const L = layoutFace(face, fr.innerW, fr.innerH)
    const dp = depths[fi] ?? depths[0]
    const faceName = inter.faces.length > 1 ? `${face.name ?? `第 ${fi + 1} 面`}・` : ''
    const colNo = (i: number) => (mirrored ? L.cols.length - i : i + 1)
    if (Math.abs(L.over) > 0.5) out.push(`${faceName}欄寬加總和內寬差 ${Math.round(Math.abs(L.over) * 10) / 10} 公分`)
    for (const c of L.cols) {
      const n = `${faceName}第 ${colNo(c.i)} 欄`
      if (Math.abs(c.over) > 0.5) out.push(`${n}：格子高度加總和內高差 ${Math.round(Math.abs(c.over) * 10) / 10} 公分`)
      for (const p of c.parts) {
        const k = p.part.kind
        if (k === 'hang' || k === 'pullrod') {
          const rod = it.elev + fr.y0 + p.y + p.h - 5
          if (rod > 195) out.push(`${n}的衣桿離地約 ${Math.round(rod)} 公分，不太好拿（建議 190 以下，或改下拉式衣桿）`)
        }
        if (k === 'hang' && dp.clear < 52) out.push(`${n}：淨深只有 ${Math.round(dp.clear * 10) / 10}，一般衣架橫吊會卡到門，建議改前後拉桿`)
        if (k === 'pullrod' && c.w < 45) out.push(`${n}：欄寬不到 45，前後拉桿吊的衣服會卡到側板`)
        if ((k === 'books' || k === 'shelf') && c.w > 80) out.push(`${n}：層板跨距 ${Math.round(c.w)} 超過 80，放重物久了會彎，建議加立板`)
        if (k === 'pants' && (p.h < 60 || dp.clear < 50)) out.push(`${n}：褲架需要淨高 60、淨深 50 以上`)
      }
    }
  })
  return [...new Set(out)]
}
