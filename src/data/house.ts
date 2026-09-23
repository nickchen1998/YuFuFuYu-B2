import type { Room, Wall } from '../types'

// ─────────────────────────────────────────────────────────────
// B2 戶平面資料（依建商平面圖判讀，單位：公分）
//
// 圖上標註尺寸（室內淨尺寸）：
//   客餐廳 288 × 665、次臥 241.5 × 554、主臥 271.5 × 339.5
//   衛浴寬約 270、工作陽台 188.5 × 172.5（屋主提供）
// 衛浴為 1.5 套：上方全套（淋浴＋馬桶＋洗手台，門開向客廳），
// 下方半套（馬桶＋洗臉盆，拉門開向主臥），最左側為管道間。
// 資料以 A2・B2 的方向為準；A6・B6 格局相同但上下翻轉，由畫面鏡像處理（見 Viewer.applyMirror）。
// 其餘（牆厚、門窗位置、衛浴設備）是依圖面比例量出的估計值，
// 誤差大約 ±10 公分，可以直接改這個檔案修正。
//
// 關鍵座標線：
//   X: -306.5 | -286.5 | -15 | 0 | 288 | 303 | 491.5 | 544.5 | 564.5
//   Y: -20 | 0 | 140 | 152 | 245 | 260 | 554 | 569 | 599.5 | 614.5 | 665 | 685 | 741.5 | 756.5
// ─────────────────────────────────────────────────────────────

/** 室內高度（住戶提供：樓高約 3 米） */
export const CEILING_DEFAULT = 300

export const rooms: Room[] = [
  { id: 'living', name: '客餐廳・廚房', x1: 0, y1: 0, x2: 288, y2: 665, floor: 'oak' },
  { id: 'master', name: '主臥室', x1: -286.5, y1: 260, x2: -15, y2: 599.5, floor: 'oak' },
  { id: 'bed2', name: '次臥室', x1: 303, y1: 0, x2: 544.5, y2: 554, floor: 'oak' },
  { id: 'bath', name: '衛浴（全套）', x1: -286.5, y1: 0, x2: -15, y2: 140, floor: 'bath-tile' },
  { id: 'wc', name: '主臥衛浴（半套）', x1: -250, y1: 152, x2: -15, y2: 245, floor: 'bath-tile' },
  { id: 'balcony', name: '工作陽台', x1: 303, y1: 569, x2: 491.5, y2: 741.5, floor: 'slate', outdoor: true },
  { id: 'ac', name: '冷氣平台', x1: -286.5, y1: 614.5, x2: -15, y2: 685, floor: 'concrete', outdoor: true },
]

/** 上方公共走廊（非本戶，只當方位參考） */
export const corridor = { x1: -306.5, y1: -220, x2: 564.5, y2: -20, name: '大廳走廊（公設・非本戶）' }

// 每面牆的 a 側 = 座標較小的一側，b 側 = 座標較大的一側。
// 牆切成「每一側只面對一個空間」，方便以房間為單位刷油漆。
export const walls: Wall[] = [
  // ── 上方：走廊側外牆 ──
  { id: 'top-bath', x1: -306.5, y1: -20, x2: -15, y2: 0 },
  {
    id: 'top-living', x1: -15, y1: -20, x2: 303, y2: 0,
    openings: [
      { id: 'main-door', kind: 'door', offset: 51, width: 110, sill: 0, height: 215, hinge: 'start', swing: 'b', label: '大門' },
    ],
  },
  { id: 'top-bed2', x1: 303, y1: -20, x2: 564.5, y2: 0 },

  // ── 左側外牆 ──
  { id: 'left-bath', x1: -306.5, y1: -20, x2: -286.5, y2: 252.5 },
  { id: 'left-master', x1: -306.5, y1: 252.5, x2: -286.5, y2: 607 },
  { id: 'left-ac', x1: -306.5, y1: 607, x2: -286.5, y2: 700 },

  // ── 衛浴 / 主臥 / 冷氣平台 與 客餐廳之間 ──
  {
    id: 'part-bath-living', x1: -15, y1: 0, x2: 0, y2: 146,
    openings: [
      { id: 'bath-door', kind: 'door', offset: 5, width: 75, sill: 0, height: 210, hinge: 'start', swing: 'a', label: '浴室門' },
    ],
  },
  { id: 'part-wc-living', x1: -15, y1: 146, x2: 0, y2: 252.5 },
  {
    id: 'part-master-living', x1: -15, y1: 252.5, x2: 0, y2: 607,
    openings: [
      { id: 'master-door', kind: 'door', offset: 35.5, width: 80, sill: 0, height: 210, hinge: 'start', swing: 'a', label: '主臥門' },
    ],
  },
  { id: 'part-ac-living', x1: -15, y1: 607, x2: 0, y2: 700 },

  // ── 全套衛浴 / 半套衛浴 / 主臥 ──
  { id: 'part-bath-wc', x1: -286.5, y1: 140, x2: -15, y2: 152 },
  // 管道間
  { id: 'shaft', x1: -286.5, y1: 152, x2: -250, y2: 245, style: 'column' },
  {
    id: 'part-wc-master', x1: -286.5, y1: 245, x2: -15, y2: 260,
    openings: [
      // 圖上是推拉門：開口約 80，門片掛在半套衛浴那側、往左拉開
      { id: 'wc-door', kind: 'pocket', offset: 139, width: 80, sill: 0, height: 210, hinge: 'start', swing: 'a', label: '半套衛浴拉門' },
    ],
  },

  // ── 主臥 / 冷氣平台（主臥窗） ──
  {
    id: 'master-bottom', x1: -286.5, y1: 599.5, x2: -15, y2: 614.5,
    openings: [
      { id: 'master-window', kind: 'window', offset: 71.5, width: 170, sill: 90, height: 150, label: '主臥窗' },
    ],
  },
  // 冷氣平台外側格柵：明顯低於窗戶，與陽台女兒牆同高（仍擋得住 60 公分高的室外機）
  { id: 'ac-louver', x1: -286.5, y1: 685, x2: -15, y2: 700, height: 110, style: 'louver' },

  // ── 客餐廳下方外牆（廚房旁的窗） ──
  {
    id: 'living-bottom', x1: 0, y1: 665, x2: 288, y2: 685,
    openings: [
      { id: 'living-window', kind: 'window', offset: 65, width: 210, sill: 80, height: 160, label: '客餐廳窗' },
    ],
  },

  // ── 客餐廳 / 次臥 ──
  {
    id: 'part-living-bed2', x1: 288, y1: 0, x2: 303, y2: 561.5,
    openings: [
      { id: 'bed2-door', kind: 'door', offset: 470, width: 80, sill: 0, height: 210, hinge: 'end', swing: 'b', label: '次臥門' },
    ],
  },
  // 客餐廳 / 工作陽台（延伸到陽台外緣）：陽台門在瓦斯爐正對面，往陽台外開
  {
    id: 'part-living-balcony', x1: 288, y1: 561.5, x2: 303, y2: 756.5,
    openings: [
      { id: 'balcony-door', kind: 'door', offset: 16.5, width: 80, sill: 0, height: 210, hinge: 'start', swing: 'b', label: '陽台門' },
    ],
  },

  // ── 次臥 / 工作陽台（次臥採光窗，尺寸待確認） ──
  {
    id: 'bed2-bottom', x1: 303, y1: 554, x2: 544.5, y2: 569,
    openings: [
      { id: 'bed2-window', kind: 'window', offset: 17, width: 150, sill: 90, height: 140, label: '次臥窗' },
    ],
  },
  // ── 右側分戶牆 ──
  { id: 'right-party', x1: 544.5, y1: -20, x2: 564.5, y2: 569 },
  // 陽台旁結構柱
  { id: 'column-se', x1: 491.5, y1: 569, x2: 564.5, y2: 756.5, style: 'column' },
  // 陽台女兒牆
  { id: 'balcony-parapet', x1: 303, y1: 741.5, x2: 491.5, y2: 756.5, height: 110 },
]

/** 原始平面圖疊圖位置（依 288 / 665 / 554 三個標註尺寸校正，約 2.9 公分 = 1 像素） */
export const planOverlay = {
  // 用 BASE_URL 組路徑，部署在子路徑（例如 GitHub Pages）也讀得到
  src: `${import.meta.env.BASE_URL}floorplan.jpg`,
  x: -375.8,
  y: -299.9,
  w: 965.7,
  h: 1119.4,
}

export const unitBounds = { x1: -306.5, y1: -20, x2: 564.5, y2: 756.5 }
