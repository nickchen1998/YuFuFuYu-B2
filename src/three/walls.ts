import * as THREE from 'three'
import type { Opening, Wall } from '../types'
import { walls } from '../data/house'
import { DEFAULT_WALL } from '../data/materials'
import { wallAxis, wallPieces } from '../geometry'
import { mat, glassMat } from './mats'

export interface WallBuildOptions {
  ceiling: number
  cut: number
  doorsOpen: boolean
  paint: Record<string, string>
}

const SECTION = '#6d6862'
const FRAME = '#d9d1c4'
const WINDOW_FRAME = '#6f7378'
const noRaycast = () => {}

function addBox(
  g: THREE.Object3D,
  sx: number, sy: number, sz: number,
  cx: number, y0: number, cz: number,
  m: THREE.Material | THREE.Material[],
) {
  const mesh = new THREE.Mesh(new THREE.BoxGeometry(sx, sy, sz), m)
  mesh.position.set(cx, y0 + sy / 2, cz)
  mesh.castShadow = true
  mesh.receiveShadow = true
  g.add(mesh)
  return mesh
}

/** 沿牆方向的座標 → 平面座標 */
function along(w: Wall, s: number): [number, number] {
  const { horizontal } = wallAxis(w)
  return horizontal ? [w.x1 + s, (w.y1 + w.y2) / 2] : [(w.x1 + w.x2) / 2, w.y1 + s]
}

function buildLouver(g: THREE.Group, w: Wall, top: number) {
  const { horizontal, length, thickness } = wallAxis(w)
  const m = mat('#8e9398', 0.5, 0.3)
  const [cx, cz] = along(w, length / 2)
  const sx = horizontal ? length : thickness * 0.5
  const sz = horizontal ? thickness * 0.5 : length
  for (let y = 4; y < top - 2; y += 12) {
    const slat = addBox(g, sx, 3, sz, cx, y, cz, m)
    slat.rotation[horizontal ? 'x' : 'z'] = 0.5
    slat.userData = { kind: 'wall', wallId: w.id }
  }
  // 兩端立柱
  for (const s of [3, length - 3]) {
    const [px, pz] = along(w, s)
    addBox(g, horizontal ? 6 : thickness, top, horizontal ? thickness : 6, px, 0, pz, m)
  }
}

const JAMB = 4 // 門框寬

function buildDoorFrame(g: THREE.Group, w: Wall, o: Opening, T: number, cut: number) {
  const { horizontal } = wallAxis(w)
  const frame = mat(FRAME, 0.6)
  const top = Math.min(o.height, cut)
  const depth = T + 2
  for (const s of [o.offset + JAMB / 2, o.offset + o.width - JAMB / 2]) {
    const [px, pz] = along(w, s)
    const m = addBox(g, horizontal ? JAMB : depth, top, horizontal ? depth : JAMB, px, 0, pz, frame)
    m.raycast = noRaycast
  }
  if (o.height <= cut) {
    const [px, pz] = along(w, o.offset + o.width / 2)
    const m = addBox(g, horizontal ? o.width : depth, JAMB, horizontal ? depth : o.width, px, o.height - JAMB, pz, frame)
    m.raycast = noRaycast
  }
}

/** 推拉門：門片掛在牆的 swing 側，打開時往 hinge 那端滑開 */
function buildPocketDoor(g: THREE.Group, w: Wall, o: Opening, T: number, cut: number, open: boolean) {
  const { horizontal } = wallAxis(w)
  buildDoorFrame(g, w, o, T, cut)
  const leafT = 3
  const leafW = o.width + 4
  const leafH = Math.min(o.height - 1, cut)
  if (leafH <= 1) return
  const n = (o.swing === 'b' ? 1 : -1) * (T / 2 + leafT / 2 + 1)
  const toEnd = o.hinge === 'end'
  const s = open ? (toEnd ? o.offset + o.width * 1.5 - 4 : o.offset - o.width / 2 + 4) : o.offset + o.width / 2
  const [px, pz] = along(w, s)
  const leaf = addBox(
    g,
    horizontal ? leafW : leafT, leafH, horizontal ? leafT : leafW,
    px + (horizontal ? 0 : n), 0, pz + (horizontal ? n : 0),
    mat('#efebe4', 0.55),
  )
  leaf.raycast = noRaycast
  // 滑軌
  if (o.height + 6 <= cut) {
    const railLen = o.width * 2 + 4
    const [rx, rz] = along(w, toEnd ? o.offset + o.width : o.offset)
    const rail = addBox(
      g,
      horizontal ? railLen : 4, 5, horizontal ? 4 : railLen,
      rx + (horizontal ? 0 : n), o.height, rz + (horizontal ? n : 0),
      mat('#8e9398', 0.4, 0.6),
    )
    rail.raycast = noRaycast
  }
}

function buildDoor(g: THREE.Group, w: Wall, o: Opening, T: number, cut: number, open: boolean) {
  const { horizontal } = wallAxis(w)
  const leafColor = o.id === 'main-door' ? '#4a4540' : o.id === 'balcony-door' ? '#9aa0a6' : '#efebe4'
  const leafMat = mat(leafColor, 0.5, o.id === 'balcony-door' ? 0.5 : 0)
  const jw = JAMB
  buildDoorFrame(g, w, o, T, cut)
  // 門片：以鉸鏈為軸旋轉
  const leafW = o.width - jw * 2
  const leafH = Math.min(o.height - jw - 1, cut)
  if (leafH <= 1) return
  const hingeS = o.hinge === 'end' ? o.offset + o.width - jw : o.offset + jw
  const [hx, hz] = along(w, hingeS)
  // 關門時門片方向（沿牆，由鉸鏈指向另一側門框）
  const sign = o.hinge === 'end' ? -1 : 1
  const d0 = horizontal ? new THREE.Vector2(sign, 0) : new THREE.Vector2(0, sign)
  // 開門方向（往 a 側 = 負、b 側 = 正）
  const nSign = o.swing === 'a' ? -1 : 1
  const n = horizontal ? new THREE.Vector2(0, nSign) : new THREE.Vector2(nSign, 0)
  const ang = open ? (80 * Math.PI) / 180 : 0
  const dir = d0.clone().multiplyScalar(Math.cos(ang)).add(n.clone().multiplyScalar(Math.sin(ang)))
  const pivot = new THREE.Group()
  pivot.position.set(hx, 0, hz)
  // three: 本地 +x 經 rotation.y=φ 後 = (cosφ, 0, -sinφ)
  pivot.rotation.y = Math.atan2(-dir.y, dir.x)
  const leafT = 4
  const leaf = addBox(pivot, leafW, leafH, leafT, leafW / 2, 0, 0, leafMat)
  leaf.raycast = noRaycast
  if (leafH > 105) {
    const handle = addBox(pivot, 12, 2.5, leafT + 7, leafW - 9, 98, 0, mat('#a9a9a9', 0.3, 0.8))
    handle.raycast = noRaycast
  }
  g.add(pivot)
}

function buildWindow(g: THREE.Group, w: Wall, o: Opening, T: number, cut: number) {
  const { horizontal } = wallAxis(w)
  const y0 = o.sill
  const y1 = Math.min(o.sill + o.height, cut)
  if (y1 - y0 < 2) return
  const fm = mat(WINDOW_FRAME, 0.4, 0.6)
  const fw = 5
  const depth = Math.min(10, T)
  const h = y1 - y0
  const box = (sAlong: number, sLen: number, yy: number, hh: number, dep: number, m: THREE.Material, offN = 0) => {
    const [px, pz] = along(w, sAlong)
    const mesh = addBox(
      g,
      horizontal ? sLen : dep, hh, horizontal ? dep : sLen,
      px + (horizontal ? 0 : offN), yy, pz + (horizontal ? offN : 0), m,
    )
    mesh.raycast = noRaycast
    return mesh
  }
  const mid = o.offset + o.width / 2
  // 外框
  box(o.offset + fw / 2, fw, y0, h, depth, fm)
  box(o.offset + o.width - fw / 2, fw, y0, h, depth, fm)
  box(mid, o.width, y0, fw, depth, fm)
  if (o.sill + o.height <= cut) box(mid, o.width, y1 - fw, fw, depth, fm)
  // 玻璃（兩片，推拉窗 / 落地窗前後錯開）
  const glass = glassMat()
  const paneW = (o.width - fw * 2) / 2 + 3
  for (const [k, off] of [[0, -1.8], [1, 1.8]] as const) {
    const s = k === 0 ? o.offset + fw + paneW / 2 : o.offset + o.width - fw - paneW / 2
    const pane = box(s, paneW, y0 + fw, h - fw * (o.sill + o.height <= cut ? 2 : 1), 1, glass, off)
    pane.castShadow = false
    // 窗扇框
    const stileS = k === 0 ? o.offset + fw + paneW - 2 : o.offset + o.width - fw - paneW + 2
    box(stileS, 4, y0 + fw, h - fw * (o.sill + o.height <= cut ? 2 : 1), 3, fm, off)
  }
}

export function buildWalls(opts: WallBuildOptions): THREE.Group {
  const group = new THREE.Group()
  group.name = 'walls'
  for (const w of walls) {
    const { horizontal, thickness: T } = wallAxis(w)
    const fullTop = Math.min(w.height ?? opts.ceiling, opts.ceiling)
    const top = Math.min(fullTop, opts.cut)

    if (w.style === 'louver') {
      buildLouver(group, w, top)
      continue
    }

    const colorA = opts.paint[`${w.id}:a`] ?? DEFAULT_WALL
    const colorB = opts.paint[`${w.id}:b`] ?? DEFAULT_WALL
    const isColumn = w.style === 'column'
    const base = isColumn ? '#c9c4bc' : DEFAULT_WALL
    const mA = isColumn ? mat(base, 0.9) : mat(colorA, 0.92)
    const mB = isColumn ? mat(base, 0.9) : mat(colorB, 0.92)
    const mEdge = mat(base, 0.92)
    const mTop = top < fullTop - 0.5 ? mat(SECTION, 0.95) : mEdge
    // BoxGeometry 面順序：+x, -x, +y, -y, +z, -z
    const mats = horizontal
      ? [mEdge, mEdge, mTop, mEdge, mB, mA]
      : [mB, mA, mTop, mEdge, mEdge, mEdge]

    for (const p of wallPieces(w, opts.ceiling, opts.cut)) {
      const len = p.s1 - p.s0
      const h = p.y1 - p.y0
      const [cx, cz] = along(w, (p.s0 + p.s1) / 2)
      const mesh = addBox(group, horizontal ? len : T, h, horizontal ? T : len, cx, p.y0, cz, mats)
      mesh.userData = { kind: 'wall', wallId: w.id, horizontal }
    }

    for (const o of w.openings ?? []) {
      if (o.kind === 'door') buildDoor(group, w, o, T, opts.cut, opts.doorsOpen)
      else if (o.kind === 'pocket') buildPocketDoor(group, w, o, T, opts.cut, opts.doorsOpen)
      else buildWindow(group, w, o, T, opts.cut)
    }
  }
  return group
}
