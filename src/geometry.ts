import type { FurnitureItem, Room, Wall } from './types'
import { rooms, walls } from './data/house'

export const PING = 3.305785 // 1 坪 = 3.305785 m²

export interface Rect {
  x1: number
  y1: number
  x2: number
  y2: number
}

export function wallAxis(w: Wall) {
  const horizontal = w.x2 - w.x1 >= w.y2 - w.y1
  const length = horizontal ? w.x2 - w.x1 : w.y2 - w.y1
  const thickness = horizontal ? w.y2 - w.y1 : w.x2 - w.x1
  return { horizontal, length, thickness }
}

export interface WallPiece {
  wall: Wall
  horizontal: boolean
  /** 沿牆方向的起訖 */
  s0: number
  s1: number
  /** 高度起訖 */
  y0: number
  y1: number
}

/** 把一面牆依門窗開口切成實心方塊；top = 牆實際頂端（已套用切面高度） */
export function wallPieces(w: Wall, ceiling: number, cut = Infinity): WallPiece[] {
  const { horizontal, length } = wallAxis(w)
  const top = Math.min(w.height ?? ceiling, cut)
  const out: WallPiece[] = []
  const push = (s0: number, s1: number, y0: number, y1: number) => {
    const yy1 = Math.min(y1, top)
    if (s1 - s0 > 0.01 && yy1 - y0 > 0.01) out.push({ wall: w, horizontal, s0, s1, y0, y1: yy1 })
  }
  let cursor = 0
  const ops = [...(w.openings ?? [])].sort((a, b) => a.offset - b.offset)
  for (const o of ops) {
    push(cursor, o.offset, 0, top)
    push(o.offset, o.offset + o.width, 0, o.sill)
    push(o.offset, o.offset + o.width, o.sill + o.height, top)
    cursor = o.offset + o.width
  }
  push(cursor, length, 0, top)
  return out
}

export function pieceRect(p: WallPiece): Rect {
  const w = p.wall
  return p.horizontal
    ? { x1: w.x1 + p.s0, x2: w.x1 + p.s1, y1: w.y1, y2: w.y2 }
    : { x1: w.x1, x2: w.x2, y1: w.y1 + p.s0, y2: w.y1 + p.s1 }
}

/** 從地面開始、擋得住人的牆塊（走動碰撞、家具穿牆檢查用） */
export function blockingRects(ceiling: number): Rect[] {
  const out: Rect[] = []
  for (const w of walls) {
    for (const p of wallPieces(w, ceiling)) {
      if (p.y0 < 1 && p.y1 > 40) out.push(pieceRect(p))
    }
  }
  return out
}

/** 家具旋轉後在平面上的外框（任意角度取外接矩形） */
export function footprint(it: Pick<FurnitureItem, 'x' | 'y' | 'w' | 'd' | 'rot'>): Rect {
  const r = (it.rot * Math.PI) / 180
  const c = Math.abs(Math.cos(r))
  const s = Math.abs(Math.sin(r))
  const hw = (it.w * c + it.d * s) / 2
  const hd = (it.w * s + it.d * c) / 2
  return { x1: it.x - hw, x2: it.x + hw, y1: it.y - hd, y2: it.y + hd }
}

export function rectsOverlap(a: Rect, b: Rect, tol = 0.5) {
  return a.x1 < b.x2 - tol && a.x2 > b.x1 + tol && a.y1 < b.y2 - tol && a.y2 > b.y1 + tol
}

export function roomAt(x: number, y: number): Room | undefined {
  return rooms.find((r) => x >= r.x1 && x <= r.x2 && y >= r.y1 && y <= r.y2)
}

export function roomSize(r: Room) {
  const w = r.x2 - r.x1
  const d = r.y2 - r.y1
  const m2 = (w * d) / 10000
  return { w, d, m2, ping: m2 / PING }
}

export function fmt(n: number, digits = 1) {
  const v = Math.round(n * 10 ** digits) / 10 ** digits
  return String(v)
}

/** 牆的某一側面對哪個房間（取該側中點往外 5 公分判斷） */
export function roomFacing(w: Wall, side: 'a' | 'b'): Room | undefined {
  const { horizontal } = wallAxis(w)
  const cx = (w.x1 + w.x2) / 2
  const cy = (w.y1 + w.y2) / 2
  if (horizontal) return roomAt(cx, side === 'a' ? w.y1 - 5 : w.y2 + 5)
  return roomAt(side === 'a' ? w.x1 - 5 : w.x2 + 5, cy)
}
