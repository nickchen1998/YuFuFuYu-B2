// 平面座標系統（單位：公分）
//   原點 = 客餐廳室內左上角（大門那面牆的內側 × 衛浴隔間牆的客廳側）
//   x 往右、y 往下（跟平面圖一樣），高度另計
// 3D 場景中：平面 x → three x，平面 y → three z，高度 → three y

/** door = 平開門、pocket = 推拉門、window = 窗、slider = 落地窗 */
export type OpeningKind = 'door' | 'pocket' | 'window' | 'slider'

export interface Opening {
  id: string
  kind: OpeningKind
  /** 從牆的起點（x1 或 y1）沿牆量起的距離 */
  offset: number
  width: number
  /** 窗台高度（門為 0） */
  sill: number
  height: number
  /** 門鉸鏈在開口的哪一端 */
  hinge?: 'start' | 'end'
  /** 門往哪一側開：a = 座標較小的那側、b = 座標較大的那側 */
  swing?: 'a' | 'b'
  label?: string
}

export type WallStyle = 'solid' | 'louver' | 'column'

/** 牆 = 平面上一個軸對齊矩形 [x1,x2] × [y1,y2]，長邊決定牆的方向 */
export interface Wall {
  id: string
  x1: number
  y1: number
  x2: number
  y2: number
  /** 不填 = 到天花板 */
  height?: number
  style?: WallStyle
  openings?: Opening[]
}

export interface Room {
  id: string
  name: string
  x1: number
  y1: number
  x2: number
  y2: number
  floor: string
  outdoor?: boolean
}

export interface FurnitureItem {
  id: string
  type: string
  name: string
  /** 平面中心點 */
  x: number
  y: number
  /** 角度（度）。0 = 正面朝平面下方（+y），90 = 朝右（+x） */
  rot: number
  /** 寬（左右）、深（前後）、高 */
  w: number
  d: number
  h: number
  /** 離地高度，例如電視放在電視櫃上 */
  elev: number
  color: string
  locked?: boolean
}

export interface Design {
  version: 1
  /** 平面資料修訂版本，舊存檔載入時用來轉換 id */
  rev?: number
  /** 戶別：false = A2・B2（資料原始方向），true = A6・B6（上下翻轉） */
  mirrored?: boolean
  ceilingHeight: number
  furniture: FurnitureItem[]
  roomFloors: Record<string, string>
  /** key = `${wallId}:${'a'|'b'}` */
  wallPaint: Record<string, string>
}

export type ViewMode = 'orbit' | 'top' | 'walk'
export type Tool = 'select' | 'move' | 'paint' | 'measure'
