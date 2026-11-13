import type { FurnitureItem } from './types'
import {
  DOOR, PANEL, PENINSULA_TOP, cabinetFrame, faceDepths, frontPieces, frontRect, interiorOf, layoutFace, peninsulaStorageLen,
  type FaceLayout,
} from './cabinet'

// 訂製中島餐桌的施工分解圖資料：把 3D 模型用的同一套尺寸（cabinet.ts、interiors.ts）拆成一片一片的元件，
// 3D 爆炸圖、2D 圖面、元件規格表都從這裡來，改了櫃內規劃會一起跟著變。
//
// 座標（公分）：X = 長邊，0 是靠窗那面牆、往室內增加；Y = 高度；Z = 深度，0 是廚房側的面、往走道側增加。

export interface Box {
  x: number
  y: number
  z: number
  sx: number
  sy: number
  sz: number
  color?: string
}

export type PartGroup = 'A' | 'B' | 'C' | 'D' | 'E' | 'F'

export interface IslandPart {
  no: string
  group: PartGroup
  name: string
  material: string
  /** 規格表上的尺寸文字 */
  size: string
  qty: number
  note?: string
  boxes: Box[]
  color: string
  /** 爆炸圖全開時的位移（公分） */
  explode: [number, number, number]
}

export const GROUPS: Record<PartGroup, string> = {
  A: '櫃體（收納段桶身）',
  B: '廚房側',
  C: '走道側',
  D: '檯面',
  E: '餐桌段',
  F: '電器與插座',
}

/** 尺寸顯示：最多一位小數 */
export const n1 = (v: number) => String(Math.round(v * 10) / 10)
const dims = (...v: number[]) => v.map(n1).join(' × ')

const BOARD = '18 mm 系統板（P3 防潮、F1 低甲醛）'
const FRONT = '18 mm 系統板・美耐皿面（和桶身同色）'
const C_BODY = '#efe9df'
const C_FRONT = '#e6dfd2'
const C_TOP = '#cfae84'
const C_STEEL = '#8a8680'
const C_TRAY = '#d9d2c4'
const C_DARK = '#3a3b3f'

export interface IslandCol {
  /** 這一欄在 X 方向的起訖（淨寬） */
  x0: number
  x1: number
  w: number
  parts: { y0: number; h: number; kind: string; front: string; label: string }[]
}
export interface IslandFace {
  name: string
  /** 這一面在 Z 方向：門片外緣、櫃內淨深的起訖 */
  zFront: number
  z0: number
  z1: number
  clear: number
  cols: IslandCol[]
  /** 門片、抽屜面板的外框（X、Y 起訖） */
  fronts: { kind: string; x0: number; x1: number; y0: number; y1: number; hinge: 'l' | 'r'; label: string }[]
}

export interface IslandModel {
  /** 總長、總深、總高 */
  L: number
  D: number
  H: number
  /** 收納段長度、餐桌段長度 */
  ls: number
  lt: number
  /** 櫃體頂（檯面底）高度、檯面層厚度 */
  bodyTop: number
  topT: number
  base: number
  /** 櫃內底面高度、淨高 */
  y0: number
  innerH: number
  /** 中隔背板 Z 起訖 */
  divZ: [number, number]
  faces: IslandFace[]
  parts: IslandPart[]
  /** 桌腳、橫樑、牙板、插座的位置（2D 圖用） */
  legs: { x0: number; x1: number; z0: number; z1: number }[]
  beam: Box
  apron: Box
  outletTop: { x: number; z: number; size: number; depth: number }
  /** 要和師傅、水電確認的地方 */
  checks: { title: string; text: string }[]
}

export function buildIsland(it: FurnitureItem): IslandModel {
  const inter = interiorOf(it)
  const fr = cabinetFrame(it)
  const depths = faceDepths(it, inter)
  const L = it.w
  const D = it.d
  const H = it.h
  const ls = peninsulaStorageLen(it)
  const lt = L - ls
  const bodyTop = H - PENINSULA_TOP
  const T = PANEL
  const two = inter.faces.length > 1
  const divZ: [number, number] = two ? [depths[0].depth, depths[0].depth + T] : [D - 0.8, D]

  // 每一面的欄、格、面板換成整體座標
  const faces: IslandFace[] = inter.faces.map((face, fi) => {
    const fl: FaceLayout = layoutFace(face, fr.innerW, fr.innerH)
    // 廚房側那一面在模型裡轉了 180°：從廚房看過去的左邊是餐桌那一端
    const flip = fi === 0
    const X = (x: number, w: number): [number, number] => (flip ? [ls - T - x - w, ls - T - x] : [T + x, T + x + w])
    const cols = fl.cols.map((c) => {
      const [x0, x1] = X(c.x, c.w)
      return {
        x0,
        x1,
        w: c.w,
        parts: c.parts.map((p) => ({ y0: fr.y0 + p.y, h: p.h, kind: p.part.kind, front: p.part.front, label: p.part.label ?? '' })),
      }
    })
    const fronts = frontPieces(fl).map((pc) => {
      const r = frontRect(fl, pc, fr)
      const [x0, x1] = X(r.x0, r.x1 - r.x0)
      const c = fl.cols[pc.col]
      // 面板不低於踢腳上緣
      const y0 = Math.max(fr.base, fr.y0 + r.y0)
      // 鉸鏈左右是「面對這一面」看的；廚房側翻面後左右跟著對調
      return { kind: pc.kind, x0, x1, y0, y1: fr.y0 + r.y1, hinge: pc.hinge, label: c.parts[pc.parts[0]].part.label ?? '' }
    })
    const zFront = fi === 0 ? 0 : D
    const z0 = fi === 0 ? DOOR : divZ[1]
    const z1 = fi === 0 ? divZ[0] : D - DOOR
    return { name: face.name ?? `第 ${fi + 1} 面`, zFront, z0, z1, clear: z1 - z0, cols, fronts }
  })

  const parts: IslandPart[] = []
  const counters: Record<string, number> = {}
  const add = (group: PartGroup, p: Omit<IslandPart, 'no' | 'group'>) => {
    counters[group] = (counters[group] ?? 0) + 1
    parts.push({ no: `${group}${counters[group]}`, group, ...p })
  }

  // ── A 櫃體 ──
  const cd = D - DOOR * 2
  const sideH = fr.h - fr.base
  add('A', {
    name: '側板',
    material: BOARD,
    size: `${dims(cd, sideH)}（厚 1.8）`,
    qty: 2,
    note: '靠牆那片貼窗下牆面；靠餐桌那片外露，要封邊、做見光面',
    boxes: [
      { x: 0, y: fr.base, z: DOOR, sx: T, sy: sideH, sz: cd },
      { x: ls - T, y: fr.base, z: DOOR, sx: T, sy: sideH, sz: cd },
    ],
    color: C_BODY,
    explode: [0, 0, 0],
  })
  add('A', {
    name: '底板',
    material: BOARD,
    size: `${dims(ls - T * 2, cd)}（厚 1.8）`,
    qty: 1,
    boxes: [{ x: T, y: fr.base, z: DOOR, sx: ls - T * 2, sy: T, sz: cd }],
    color: C_BODY,
    explode: [0, -14, 0],
  })
  add('A', {
    name: '中隔背板',
    material: BOARD,
    size: `${dims(ls - T * 2, fr.innerH)}（厚 1.8）`,
    qty: 1,
    note: `兩面共用的背板，離廚房側面板 ${n1(divZ[0])}；微波爐、電器的線從這片開孔走`,
    boxes: [{ x: T, y: fr.y0, z: divZ[0], sx: ls - T * 2, sy: fr.innerH, sz: T }],
    color: C_BODY,
    explode: [0, 0, 0],
  })
  add('A', {
    name: '踢腳板',
    material: BOARD,
    size: `${dims(ls - 2, fr.base)}（厚 1.8）`,
    qty: 2,
    note: '前後各一片，內縮 4；裡面放調整腳抓水平',
    boxes: [
      { x: 1, y: 0, z: 4, sx: ls - 2, sy: fr.base, sz: T },
      { x: 1, y: 0, z: D - 4 - T, sx: ls - 2, sy: fr.base, sz: T },
    ],
    color: '#bdb6a8',
    explode: [0, -30, 0],
  })

  // ── B 廚房側、C 走道側 ──
  faces.forEach((f, fi) => {
    const g: PartGroup = fi === 0 ? 'B' : 'C'
    const out = fi === 0 ? -1 : 1
    // 立板（欄和欄之間）
    const xs = f.cols.map((c) => c.x0).sort((a, b) => a - b)
    if (f.cols.length > 1) {
      add(g, {
        name: '中立板',
        material: BOARD,
        size: `${dims(f.clear, fr.innerH)}（厚 1.8）`,
        qty: f.cols.length - 1,
        note: fi === 0 ? '微波爐欄和抽屜欄之間' : '層板跨距不超過 80',
        boxes: xs.slice(1).map((x) => ({ x: x - T, y: fr.y0, z: f.z0, sx: T, sy: fr.innerH, sz: f.clear })),
        color: C_BODY,
        explode: [0, 0, out * 12],
      })
    }
    // 層板：相鄰兩格之間（上下都是抽屜的不用）
    for (const c of f.cols) {
      c.parts.forEach((p, i) => {
        if (i === 0) return
        const prev = c.parts[i - 1]
        if (prev.front === 'drawer' && p.front === 'drawer') return
        add(g, {
          name: p.kind === 'appliance' ? `層板（${shortLabel(p.label)}底）` : '層板',
          material: BOARD,
          size: `${dims(c.w, f.clear)}（厚 1.8）`,
          qty: 1,
          note: `上緣離地 ${n1(p.y0)}`,
          boxes: [{ x: c.x0, y: p.y0 - T, z: f.z0, sx: c.w, sy: T, sz: f.clear }],
          color: C_BODY,
          explode: [0, 0, out * 12],
        })
      })
    }
    // 門片、抽屜
    for (const fp of f.fronts) {
      const w = fp.x1 - fp.x0
      const h = fp.y1 - fp.y0
      const z = fi === 0 ? 0 : D - DOOR
      if (fp.kind === 'drawer') {
        const dep = Math.floor((f.clear - 3) / 5) * 5
        const inZ = fi === 0 ? DOOR : D - DOOR - dep
        add(g, {
          name: `抽屜（${shortLabel(fp.label)}）`,
          material: `面板：${FRONT}；抽屜盒 15 mm 板或金屬側牆`,
          size: `面板 ${dims(w, h)}；滑軌 ${dep} 公分`,
          qty: 1,
          note: `三節全展＋緩衝滑軌；下緣離地 ${n1(fp.y0)}`,
          boxes: [
            { x: fp.x0, y: fp.y0 + 0.15, z, sx: w, sy: h - 0.3, sz: DOOR, color: C_FRONT },
            { x: fp.x0 + 2.2, y: fp.y0 + 2.4, z: inZ, sx: w - 4.4, sy: Math.max(6, h - 7), sz: dep, color: C_TRAY },
          ],
          color: C_FRONT,
          explode: [0, 0, out * 46],
        })
      } else {
        add(g, {
          name: `門片（${shortLabel(fp.label)}）`,
          material: FRONT,
          size: `${dims(w, h)}（厚 1.8）`,
          qty: 1,
          note: `緩衝鉸鏈 2 個，鉸鏈在${(fp.hinge === 'l') === (fi === 1) ? '靠牆' : '靠餐桌'}那側；下緣離地 ${n1(fp.y0)}`,
          boxes: [{ x: fp.x0 + 0.15, y: fp.y0 + 0.15, z, sx: w - 0.3, sy: h - 0.3, sz: DOOR }],
          color: C_FRONT,
          explode: [0, 0, out * 40],
        })
      }
    }
    // 電器格：抽拉層板（微波爐是嵌入，另外列在 F）
    for (const c of f.cols) {
      for (const p of c.parts) {
        if (p.kind !== 'appliance' || p.label.includes('微波爐')) continue
        const tw = c.w - 2.6
        const td = Math.floor((f.clear - 2) / 5) * 5
        const tz = fi === 0 ? f.z0 + 1 : f.z1 - 1 - td
        add(g, {
          name: `抽拉層板（${shortLabel(p.label)}）`,
          material: `${BOARD}＋全展滑軌一組`,
          size: `層板 ${dims(tw, td)}；格子淨空 ${dims(c.w, f.clear, p.h)}`,
          qty: 1,
          note: `格子底離地 ${n1(p.y0)}；開放不裝門，用的時候拉出來約 20 公分散蒸氣`,
          boxes: [{ x: c.x0 + 1.3, y: p.y0 + 0.6, z: tz, sx: tw, sy: T, sz: td }],
          color: C_TRAY,
          explode: [0, 0, out * 26],
        })
      }
    }
  })

  // ── D 檯面 ──
  add('D', {
    name: '實木檯面',
    material: '北美白橡木 3 cm 直拼板，一片不接縫；木蠟油或護木油',
    size: `${dims(L, D)}（厚 3）`,
    qty: 1,
    note: `完成面高 ${n1(H)}；四邊倒角；靠窗端開一個插座孔，孔邊也要上油封好`,
    boxes: [{ x: 0, y: bodyTop, z: 0, sx: L, sy: PENINSULA_TOP, sz: D }],
    color: C_TOP,
    explode: [0, 62, 0],
  })

  // ── E 餐桌段 ──
  const legX = L - 7.5
  const legs = [
    { x0: legX, x1: legX + 5, z0: 2.5, z1: 7.5 },
    { x0: legX, x1: legX + 5, z0: D - 7.5, z1: D - 2.5 },
  ]
  add('E', {
    name: 'ㄇ字鐵件桌腳',
    material: '5 × 5 方管鐵件，烤漆（顏色待定）',
    size: `腳 5 × 5、高 ${n1(bodyTop)}，外寬 ${n1(D - 5)}`,
    qty: 1,
    note: '只在外端一組，另一端靠收納段側板支撐；腳底加調整墊',
    boxes: [
      ...legs.map((l) => ({ x: l.x0, y: 0, z: l.z0, sx: 5, sy: bodyTop, sz: 5 })),
      { x: legX, y: bodyTop - 5, z: 7.5, sx: 5, sy: 5, sz: D - 15 },
    ],
    color: C_STEEL,
    explode: [58, 0, 0],
  })
  const beam: Box = { x: ls + 4, y: bodyTop - 6, z: D / 2 - 1.5, sx: lt - 8, sy: 6, sz: 3 }
  add('E', {
    name: '桌下橫樑',
    material: '木作或鐵件（和桌腳同一家做）',
    size: `${dims(beam.sx, beam.sz, beam.sy)}`,
    qty: 1,
    note: `接收納段側板和外端桌腳；桌下淨高 ${n1(beam.y)}；插座的線沿這支走`,
    boxes: [beam],
    color: '#cbc5b9',
    explode: [30, -8, 0],
  })
  const apron: Box = { x: L - 4.5, y: bodyTop - 12, z: 7.5, sx: 2, sy: 12, sz: D - 15 }
  add('E', {
    name: '外端牙板',
    material: BOARD,
    size: `${dims(apron.sz, apron.sy)}（厚 ${n1(apron.sx)}）`,
    qty: 1,
    note: '裝在兩支桌腳之間，上面裝一組插座',
    boxes: [apron],
    color: '#cbc5b9',
    explode: [80, 0, 0],
  })

  // ── F 電器與插座 ──
  const mw = faces[0]?.cols.find((c) => c.parts.some((p) => p.label.includes('微波爐')))
  const mwPart = mw?.parts.find((p) => p.label.includes('微波爐'))
  if (mw && mwPart) {
    add('F', {
      name: '嵌入式微波爐',
      material: '櫻花 E5650A（或同開孔尺寸的機種）',
      size: `開孔 ${dims(mw.w, mwPart.h, faces[0].clear)}（寬 × 高 × 深）`,
      qty: 1,
      note: `開孔底離地 ${n1(mwPart.y0)}；機體面板寬 59.5 × 高 38.8；110V 最大 1,450W，要獨立迴路`,
      boxes: [
        { x: mw.x0 + 0.5, y: mwPart.y0 + 0.4, z: 2.2, sx: mw.w - 1, sy: mwPart.h - 0.8, sz: 41, color: C_DARK },
        { x: (mw.x0 + mw.x1) / 2 - 29.75, y: mwPart.y0 - 0.4, z: 0, sx: 59.5, sy: 38.8, sz: 2.2, color: '#232427' },
      ],
      color: C_DARK,
      explode: [0, 0, -78],
    })
  }
  const outletTop = { x: 15, z: D / 2, size: 13, depth: 7.8 }
  add('F', {
    name: '檯面嵌入插座',
    material: '國際牌 DUFN2200T-1 鋁合金地板插座（接地雙插座，15A）',
    size: `面板 13 × 13，埋入深約 ${n1(outletTop.depth)}`,
    qty: 1,
    note: `中心離靠窗牆 ${n1(outletTop.x)}、深度方向置中；蓋上和檯面齊平`,
    boxes: [
      { x: outletTop.x - 6.5, y: H - 0.3, z: outletTop.z - 6.5, sx: 13, sy: 0.6, sz: 13, color: '#b9bcc0' },
      { x: outletTop.x - 5, y: H - outletTop.depth, z: outletTop.z - 5, sx: 10, sy: outletTop.depth - 0.3, sz: 10, color: '#8f9296' },
    ],
    color: '#b9bcc0',
    explode: [0, 86, 0],
  })
  add('F', {
    name: '桌端插座',
    material: '雙連三孔接地插座＋明盒',
    size: '一組（面板約 12 × 7）',
    qty: 1,
    note: '裝在外端牙板朝外那面；電從窗下牆面進收納段，再沿桌下橫樑走到外端',
    boxes: [{ x: L - 2.4, y: bodyTop - 10, z: D / 2 - 6, sx: 0.9, sy: 7, sz: 12, color: '#f4f2ee' }],
    color: '#f4f2ee',
    explode: [96, 0, 0],
  })

  // ── 要確認的地方 ──
  const checks: IslandModel['checks'] = []
  checks.push({
    title: '檯面厚度和櫃體高度',
    text: `模型把檯面層畫成 ${n1(PENINSULA_TOP)} 公分（櫃體頂 ${n1(bodyTop)}、完成面 ${n1(H)}），選購資料寫的是 3 公分實木板。差的 ${n1(PENINSULA_TOP - 3)} 公分要決定：檯面下加底襯板，還是櫃體做高到 ${n1(H - 3)}。`,
  })
  checks.push({
    title: '檯面怎麼固定',
    text: '櫃體上方沒有畫頂板。實木會隨濕度伸縮，請師傅在側板上緣加前後拉條，用長孔螺絲或 Z 型扣件固定檯面，不要整面打膠鎖死。',
  })
  checks.push({
    title: '餐桌段的承重',
    text: `餐桌段懸跨 ${n1(lt)} 公分，目前只有一支橫樑（${dims(beam.sx, beam.sz, beam.sy)}）加外端ㄇ字腳。請確認要不要改成鐵件框或加 18 mm 木心板底板，避免實木檯面下垂。`,
  })
  const ecCol = faces[0]?.cols.find((c) => outletTop.x >= c.x0 && outletTop.x <= c.x1)
  const ecTop = ecCol?.parts[ecCol.parts.length - 1]
  if (ecTop) {
    const into = outletTop.depth - PENINSULA_TOP
    checks.push({
      title: '檯面插座的埋入盒',
      text: `插座埋入深約 ${n1(outletTop.depth)} 公分，會往下伸進「${shortLabel(ecTop.label)}」那一格約 ${n1(into)} 公分（格子淨高 ${n1(ecTop.h)}）。位置要避開抽拉層板和滑軌，請水電和木作一起定位。`,
    })
  }
  checks.push({
    title: '微波爐的電',
    text: '微波爐最大 1,450W，要獨立迴路，插座設在機器背後插得到的位置（中隔背板開孔或旁邊抽屜櫃內）。電鍋加氣炸鍋同時開會超過檯面插座的 15A，請錯開用或另拉一迴路。',
  })
  checks.push({
    title: '窗台高度',
    text: `檯面完成面高 ${n1(H)}，要壓在窗台（約 80）下面。請現場量窗台實際高度和窗下牆面的垂直度，靠牆那端留收邊。`,
  })
  checks.push({
    title: '尺寸以現場放樣為準',
    text: '圖上的尺寸是依 3D 模型推算的概念尺寸，板材分割、封邊、五金預留請師傅依現場丈量和所選五金調整。',
  })

  return {
    L, D, H, ls, lt, bodyTop, topT: PENINSULA_TOP, base: fr.base, y0: fr.y0, innerH: fr.innerH, divZ, faces, parts, legs, beam, apron, outletTop, checks,
  }
}

/** 標籤取前半段（「電鍋（抽拉開放層板）」→「電鍋」） */
function shortLabel(s: string) {
  return s.split(/[（(：:；;・]/)[0] || '收納'
}
