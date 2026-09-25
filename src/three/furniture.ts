import * as THREE from 'three'
import type { FurnitureItem } from '../types'
import { mat, glassMat, shadeHex } from './mats'
import { hashStr } from './textures'
import { interiorCabinet, peninsulaStorage } from './cabinet3d'
import { PENINSULA_TOP, peninsulaStorageLen } from '../cabinet'

// 每個家具都在自己的座標系（公分）建模：
//   原點 = 平面外框中心、地面；寬沿 x、深沿 z、正面朝 +z

type G = THREE.Group

function bx(g: G, w: number, h: number, d: number, x: number, y: number, z: number, m: THREE.Material) {
  const mesh = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), m)
  mesh.position.set(x, y + h / 2, z)
  mesh.castShadow = true
  mesh.receiveShadow = true
  g.add(mesh)
  return mesh
}

function cyl(g: G, rTop: number, rBot: number, h: number, x: number, y: number, z: number, m: THREE.Material, seg = 28) {
  const mesh = new THREE.Mesh(new THREE.CylinderGeometry(rTop, rBot, h, seg), m)
  mesh.position.set(x, y + h / 2, z)
  mesh.castShadow = true
  mesh.receiveShadow = true
  g.add(mesh)
  return mesh
}

function rng(seed: number) {
  let s = seed
  return () => {
    s = (s * 16807) % 2147483647
    return (s - 1) / 2147483646
  }
}

const METAL = () => mat('#9d9fa2', 0.35, 0.8)
const DARK = () => mat('#2f3033', 0.6)
const WHITE = () => mat('#f7f7f5', 0.25)
const WOOD = () => mat('#a88b6e', 0.6)

function bed(g: G, it: FurnitureItem) {
  const { w, d, h } = it
  bx(g, w, 28, d - 6, 0, 0, 3, WOOD())
  bx(g, w, h, 6, 0, 0, -d / 2 + 3, WOOD())
  const z0 = -d / 2 + 8
  const z1 = d / 2 - 2
  const ml = z1 - z0
  bx(g, w - 4, 22, ml, 0, 28, (z0 + z1) / 2, mat('#f4f2ee', 0.9))
  const dl = ml * 0.7
  bx(g, w + 1, 20, dl, 0, 33, z1 - dl / 2 + 1.5, mat(it.color, 0.95))
  const np = w >= 120 ? 2 : 1
  const pw = (w - 16 - (np - 1) * 6) / np
  for (let i = 0; i < np; i++) {
    const p = bx(g, pw, 11, 40, -w / 2 + 8 + pw / 2 + i * (pw + 6), 49, z0 + 26, mat('#ffffff', 0.95))
    p.scale.y = 0.9
  }
}

function cabinet(g: G, it: FurnitureItem, style: 'doors' | 'drawers', legs = false) {
  const { w, d, h } = it
  const body = mat(it.color, 0.6)
  const line = mat(shadeHex(it.color, 0.55), 0.8)
  const base = legs ? 8 : Math.min(8, h * 0.08)
  if (legs) {
    for (const sx of [-1, 1]) for (const sz of [-1, 1]) bx(g, 3, base, 3, sx * (w / 2 - 5), 0, sz * (d / 2 - 5), DARK())
  } else {
    bx(g, w - 2, base, d - 4, 0, 0, -2, line)
  }
  bx(g, w, h - base, d, 0, base, 0, body)
  const front = d / 2 + 0.15
  if (style === 'doors') {
    const n = Math.max(1, Math.round(w / (h > 150 ? 50 : 45)))
    for (let i = 1; i < n; i++) bx(g, 0.6, h - base - 2, 0.4, -w / 2 + (i * w) / n, base + 1, front, line)
    const hy = Math.min(h - 20, 100)
    for (let i = 0; i < n; i++) {
      const edge = i % 2 === 0 ? -w / 2 + ((i + 1) * w) / n - 4 : -w / 2 + (i * w) / n + 4
      bx(g, 1.4, Math.min(20, h * 0.25), 2, edge, hy - Math.min(20, h * 0.25) / 2, front + 0.8, METAL())
    }
  } else {
    const rows = h > 70 ? 3 : 2
    const cols = w > 120 ? 2 : 1
    const rh = (h - base) / rows
    for (let r = 1; r < rows; r++) bx(g, w - 2, 0.6, 0.4, 0, base + r * rh, front, line)
    for (let c = 1; c < cols; c++) bx(g, 0.6, h - base, 0.4, -w / 2 + (c * w) / cols, base, front, line)
    for (let r = 0; r < rows; r++)
      for (let c = 0; c < cols; c++)
        bx(g, Math.min(16, w / cols / 3), 1.4, 2, -w / 2 + ((c + 0.5) * w) / cols, base + (r + 0.5) * rh, front + 0.8, METAL())
  }
}

const has = (it: FurnitureItem, f: string) => (it.features ?? []).includes(f)

/** 中島：正面（+z）是抽屜；有 'microwave' 時在 -x 端嵌入微波爐 */
function island(g: G, it: FurnitureItem) {
  const { w, d, h } = it
  const body = mat(it.color, 0.6)
  const line = mat(shadeHex(it.color, 0.55), 0.8)
  const topH = 4
  const base = 8
  const bodyTop = h - topH
  bx(g, w - 4, base, d - 6, 0, 0, 0, line)
  bx(g, w, bodyTop - base, d, 0, base, 0, body)
  bx(g, w + 4, topH, d + 4, 0, bodyTop, 0, mat('#dcd8d1', 0.3))
  const front = d / 2 + 0.15
  const mw = has(it, 'microwave')
  const mwW = Math.min(52, w - 24)
  const x0 = mw ? -w / 2 + mwW + 4 : -w / 2
  const dw = w / 2 - x0
  const cx = (x0 + w / 2) / 2
  const rows = 3
  const rh = (bodyTop - base) / rows
  for (let r = 1; r < rows; r++) bx(g, dw - 2, 0.6, 0.4, cx, base + r * rh, front, line)
  for (let r = 0; r < rows; r++) bx(g, Math.min(24, dw / 3), 1.4, 2, cx, base + (r + 0.5) * rh, front + 0.8, METAL())
  if (!mw) return
  bx(g, 0.6, bodyTop - base, 0.4, x0, base, front, line)
  const mcx = -w / 2 + 2 + mwW / 2
  const mh = 30
  const y0 = bodyTop - 6 - mh
  bx(g, mwW, mh, 1.2, mcx, y0, front + 0.45, mat('#c7cace', 0.3, 0.7))
  bx(g, mwW * 0.68, mh - 7, 0.4, mcx - mwW * 0.12, y0 + 3.5, front + 1.2, mat('#14171b', 0.1, 0.3))
  bx(g, mwW * 0.18, mh - 7, 0.4, mcx + mwW / 2 - mwW * 0.11 - 1, y0 + 3.5, front + 1.2, mat('#2b2f34', 0.4))
  bx(g, mwW - 2, 0.6, 0.4, mcx, (base + y0) / 2, front, line)
  bx(g, 16, 1.4, 2, mcx, (base + y0) / 2 + (y0 - base) / 4, front + 0.8, METAL())
}

function desk(g: G, it: FurnitureItem) {
  const { w, d, h } = it
  bx(g, w, 3, d, 0, h - 3, 0, mat(it.color, 0.55))
  for (const sx of [-1, 1]) for (const sz of [-1, 1]) bx(g, 4, h - 3, 4, sx * (w / 2 - 4), 0, sz * (d / 2 - 4), DARK())
  if (w >= 90) bx(g, Math.min(45, w / 3), 14, d - 6, w / 2 - Math.min(45, w / 3) / 2 - 6, h - 17, -1, mat(it.color, 0.55))
}

function table(g: G, it: FurnitureItem) {
  const { w, d, h } = it
  bx(g, w, 3.5, d, 0, h - 3.5, 0, mat(it.color, 0.5))
  for (const sx of [-1, 1]) for (const sz of [-1, 1]) bx(g, 5, h - 3.5, 5, sx * (w / 2 - 6), 0, sz * (d / 2 - 6), mat(shadeHex(it.color, 0.7), 0.6))
}

function roundtable(g: G, it: FurnitureItem) {
  const r = Math.min(it.w, it.d) / 2
  cyl(g, r, r, 3.5, 0, it.h - 3.5, 0, mat(it.color, 0.45), 48)
  cyl(g, 4, 4, it.h - 3.5, 0, 0, 0, DARK())
  cyl(g, r * 0.5, r * 0.55, 2, 0, 0, 0, DARK(), 40)
}

function chair(g: G, it: FurnitureItem) {
  const { w, d, h } = it
  const seat = 45
  const m = mat(it.color, 0.8)
  bx(g, w, 5, d - 6, 0, seat - 5, 3, m)
  bx(g, w, h - seat, 4, 0, seat, -d / 2 + 4, m)
  for (const sx of [-1, 1]) for (const sz of [-1, 1]) bx(g, 3, seat - 5, 3, sx * (w / 2 - 3), 0, sz === -1 ? -d / 2 + 4 : d / 2 - 4, DARK())
}

function sofa(g: G, it: FurnitureItem) {
  const { w, d, h } = it
  const m = mat(it.color, 0.95)
  const cushion = mat(shadeHex(it.color, 1.08), 0.95)
  for (const sx of [-1, 1]) for (const sz of [-1, 1]) cyl(g, 2, 1.5, 8, sx * (w / 2 - 8), 0, sz * (d / 2 - 8), DARK(), 12)
  bx(g, w, 22, d, 0, 8, 0, m)
  const armW = w > 100 ? 16 : 12
  for (const sx of [-1, 1]) bx(g, armW, 30, d, sx * (w / 2 - armW / 2), 30, 0, m)
  const backD = 20
  bx(g, w - armW * 2, h - 30, backD, 0, 30, -d / 2 + backD / 2, m)
  const inner = w - armW * 2
  const n = inner >= 150 ? 3 : inner >= 100 ? 2 : 1
  const cw = inner / n
  for (let i = 0; i < n; i++) {
    bx(g, cw - 1.5, 14, d - backD - 3, -inner / 2 + cw * (i + 0.5), 30, backD / 2 + 1, cushion)
    bx(g, cw - 3, h - 48, 14, -inner / 2 + cw * (i + 0.5), 44, -d / 2 + backD + 6, cushion).rotation.x = -0.18
  }
}

function coffeetable(g: G, it: FurnitureItem) {
  const { w, d, h } = it
  const m = mat(it.color, 0.5)
  bx(g, w, 4, d, 0, h - 4, 0, m)
  bx(g, w - 8, 2, d - 8, 0, 10, 0, m)
  for (const sx of [-1, 1]) for (const sz of [-1, 1]) bx(g, 4, h - 4, 4, sx * (w / 2 - 4), 0, sz * (d / 2 - 4), mat(shadeHex(it.color, 0.6), 0.6))
}

function tv(g: G, it: FurnitureItem) {
  const { w, h } = it
  bx(g, 32, 1.5, 20, 0, 0, 0, DARK())
  bx(g, 6, 8, 3, 0, 1.5, -1, DARK())
  bx(g, w, h - 8, 3, 0, 8, 0, mat(it.color, 0.35))
  bx(g, w - 2, h - 10, 0.3, 0, 9, 1.6, mat('#0d1117', 0.12, 0.3))
}

function rug(g: G, it: FurnitureItem) {
  const r = bx(g, it.w, Math.max(0.8, it.h), it.d, 0, 0, 0, mat(it.color, 1))
  r.castShadow = false
  const border = mat(shadeHex(it.color, 0.8), 1)
  const b = 6
  for (const sz of [-1, 1]) bx(g, it.w - 2, Math.max(0.8, it.h) + 0.2, b, 0, 0, sz * (it.d / 2 - b / 2 - 1), border).castShadow = false
}

function plant(g: G, it: FurnitureItem) {
  const { w, h } = it
  const potH = Math.min(35, h * 0.3)
  cyl(g, w * 0.32, w * 0.25, potH, 0, 0, 0, mat('#c07a55', 0.8))
  const rand = rng(hashStr(it.id))
  const leaf = [mat(it.color, 0.9), mat(shadeHex(it.color, 0.8), 0.9), mat(shadeHex(it.color, 1.15), 0.9)]
  cyl(g, 1.5, 2, h * 0.5, 0, potH, 0, mat('#6b4f33', 0.9), 8)
  for (let i = 0; i < 7; i++) {
    const r = w * (0.22 + rand() * 0.14)
    const s = new THREE.Mesh(new THREE.IcosahedronGeometry(r, 1), leaf[i % 3])
    s.position.set((rand() - 0.5) * w * 0.5, potH + (h - potH) * (0.35 + rand() * 0.5), (rand() - 0.5) * w * 0.5)
    s.castShadow = true
    g.add(s)
  }
}

function lamp(g: G, it: FurnitureItem) {
  const { h } = it
  cyl(g, 14, 15, 2, 0, 0, 0, DARK())
  cyl(g, 1.2, 1.2, h - 28, 0, 2, 0, METAL(), 10)
  const shade = cyl(g, 11, 17, 26, 0, h - 28, 0, mat(it.color, 0.9, 0, '#ffdca8'), 32)
  shade.castShadow = false
}

function fridge(g: G, it: FurnitureItem) {
  const { w, d, h } = it
  bx(g, w, h, d, 0, 0, 0, mat(it.color, 0.3, 0.3))
  const line = mat(shadeHex(it.color, 0.6), 0.5)
  bx(g, w - 1, 0.6, 0.4, 0, h * 0.62, d / 2 + 0.2, line)
  bx(g, 1.5, h * 0.25, 3, w / 2 - 6, h * 0.66, d / 2 + 1.5, METAL())
  bx(g, 1.5, h * 0.2, 3, w / 2 - 6, h * 0.35, d / 2 + 1.5, METAL())
}

function washer(g: G, it: FurnitureItem) {
  const { w, d, h } = it
  bx(g, w, h, d, 0, 0, 0, mat(it.color, 0.35))
  bx(g, w - 2, 10, 0.5, 0, h - 12, d / 2 + 0.2, mat('#cfd3d7', 0.4))
  const ring = new THREE.Mesh(new THREE.CylinderGeometry(w * 0.3, w * 0.3, 2, 40), mat('#9aa3ab', 0.3, 0.6))
  ring.rotation.x = Math.PI / 2
  ring.position.set(0, h * 0.45, d / 2 + 1)
  g.add(ring)
  const door = new THREE.Mesh(new THREE.CylinderGeometry(w * 0.24, w * 0.24, 2.2, 40), mat('#27313a', 0.1, 0.2))
  door.rotation.x = Math.PI / 2
  door.position.set(0, h * 0.45, d / 2 + 1.2)
  g.add(door)
}

function kitchen(g: G, it: FurnitureItem) {
  const { w, d, h } = it
  cabinet(g, { ...it, h: h - 4 }, 'doors')
  bx(g, w, 4, d + 2, 0, h - 4, 1, mat('#d9d6d0', 0.3))
  // 水槽（+x 端）與爐台（-x 端）
  bx(g, 70, 0.6, 42, w / 2 - 50, h, 2, mat('#8e9499', 0.25, 0.8))
  cyl(g, 1.2, 1.2, 28, w / 2 - 50, h, -d / 2 + 8, METAL(), 12)
  bx(g, 2.4, 2.4, 16, w / 2 - 50, h + 26, -d / 2 + 14, METAL())
  bx(g, 60, 0.8, 50, -w / 2 + 45, h, 1, mat('#111214', 0.1, 0.1))
  for (const [ox, oz] of [[-13, -10], [13, -10], [0, 11]]) {
    const ring = new THREE.Mesh(new THREE.TorusGeometry(8, 0.5, 6, 24), mat('#5a5d61', 0.4))
    ring.rotation.x = Math.PI / 2
    ring.position.set(-w / 2 + 45 + ox, h + 0.9, 1 + oz)
    g.add(ring)
  }
  // 壁面、吊櫃（150～230 公分）、抽油煙機
  const upperY = 150
  const upperH = 80
  bx(g, w, upperY - h, 1.5, 0, h, -d / 2 + 0.75, mat('#ebe8e3', 0.3))
  const upperD = 35
  bx(g, w, upperH, upperD, 0, upperY, -d / 2 + upperD / 2, mat(it.color, 0.6))
  const line = mat(shadeHex(it.color, 0.55), 0.8)
  const upperFront = -d / 2 + upperD + 0.2
  const handle = (x: number, y: number) => bx(g, 1.4, 12, 2, x, y, upperFront + 1, METAL())
  // 水槽上方那一段（對齊 85 公分水槽下櫃）：下半是烘碗機（建商附），上半是兩扇門的吊櫃
  const dryer = has(it, 'dishdryer')
  const sinkX0 = w / 2 - 85
  const plainW = dryer ? sinkX0 + w / 2 : w
  const n = Math.max(1, Math.round(plainW / 45))
  for (let i = 1; i < n; i++) bx(g, 0.6, upperH - 2, 0.4, -w / 2 + (i * plainW) / n, upperY + 1, upperFront, line)
  for (let i = 0; i < n; i++) handle(-w / 2 + ((i + 0.5) * plainW) / n + (i % 2 === 0 ? 1 : -1) * (plainW / n / 2 - 4), upperY + 2)
  if (dryer) {
    const cx = sinkX0 + 85 / 2
    const dw = 85 - 1
    const dryerH = upperH / 2
    bx(g, 0.6, upperH - 2, 0.4, sinkX0, upperY + 1, upperFront, line)
    // 上半：兩扇門
    bx(g, dw, 0.6, 0.4, cx, upperY + dryerH, upperFront, line)
    bx(g, 0.6, dryerH - 2, 0.4, cx, upperY + dryerH + 1, upperFront, line)
    handle(cx - 4, upperY + dryerH + 2)
    handle(cx + 4, upperY + dryerH + 2)
    // 下半：烘碗機
    bx(g, dw, dryerH - 1, 1, cx, upperY + 0.5, upperFront + 0.3, mat('#d3d6da', 0.28, 0.7))
    bx(g, dw - 8, dryerH - 13, 0.5, cx, upperY + 9, upperFront + 0.9, mat('#20252b', 0.08, 0.3))
    bx(g, dw - 30, 1.8, 2.4, cx, upperY + dryerH - 6, upperFront + 1.6, METAL())
    bx(g, 14, 3, 0.5, cx + dw / 2 - 12, upperY + 3, upperFront + 0.9, mat('#1b1f24', 0.3))
    bx(g, 2, 1.2, 0.5, cx + dw / 2 - 22, upperY + 3.9, upperFront + 1, mat('#7fe0a0', 0.3, 0, '#7fe0a0'))
  }
  bx(g, 75, 14, 50, -w / 2 + 45, upperY - 14, -d / 2 + 25, mat('#b9bcc0', 0.3, 0.7))
  // 洗碗機：45 公分嵌入式，緊鄰水槽下櫃（水槽下櫃約 85 公分寬）
  if (has(it, 'dishwasher')) {
    const dx = w / 2 - 85 - 23.5
    const top = h - 4
    bx(g, 45, top - 11, 1.6, dx, 10, d / 2 + 1, mat('#c9ccd0', 0.28, 0.75))
    bx(g, 45, 6, 1.7, dx, top - 7, d / 2 + 1.05, mat('#2b2f34', 0.35))
    bx(g, 30, 1.6, 2.4, dx, top - 14, d / 2 + 2.2, METAL())
  }
}

function toilet(g: G, it: FurnitureItem) {
  const { w, d, h } = it
  const m = WHITE()
  bx(g, w, h - 38, 18, 0, 38, -d / 2 + 9, m)
  const bowlZ = d / 2 - 24
  const base = cyl(g, 12, 10, 38, 0, 0, bowlZ - 4, m)
  base.scale.z = 1.3
  const bowl = cyl(g, 18, 16, 6, 0, 36, bowlZ, m)
  bowl.scale.z = 1.3
  const seat = cyl(g, 18, 18, 2, 0, 42, bowlZ, mat('#efefec', 0.35))
  seat.scale.z = 1.3
}

function vanity(g: G, it: FurnitureItem) {
  const { w, d, h } = it
  cabinet(g, { ...it, h: h - 12 }, 'doors')
  bx(g, w, 12, d, 0, h - 12, 0, WHITE())
  const sink = cyl(g, 17, 17, 0.5, 0, h, 2, mat('#d8dde0', 0.15), 36)
  sink.scale.z = 0.7
  cyl(g, 1.5, 1.5, 22, 0, h, -d / 2 + 6, METAL(), 12)
  bx(g, 2.5, 2.5, 12, 0, h + 19, -d / 2 + 11, METAL())
}

function shower(g: G, it: FurnitureItem) {
  const { w, d, h } = it
  bx(g, w, 4, d, 0, 0, 0, mat('#e3e3e0', 0.6))
  // 只有 +x 側是玻璃隔屏（其他三面靠牆）
  const glass = bx(g, 1, h, d, w / 2 - 0.5, 4, 0, glassMat())
  glass.castShadow = false
  bx(g, 2, 2, d, w / 2 - 0.5, h + 3, 0, METAL())
  cyl(g, 1.2, 1.2, 200, -w / 2 + 10, 0, -d / 2 + 8, METAL(), 10)
  cyl(g, 10, 10, 1.5, -w / 2 + 18, 195, -d / 2 + 16, METAL(), 24)
}

function acunit(g: G, it: FurnitureItem) {
  const { w, d, h } = it
  bx(g, w, h - 4, d, 0, 4, 0, mat(it.color, 0.5))
  for (const sx of [-1, 1]) bx(g, 4, 4, d - 4, sx * (w / 2 - 8), 0, 0, DARK())
  const fan = new THREE.Mesh(new THREE.CylinderGeometry(h * 0.34, h * 0.34, 1, 32), mat('#4a4f55', 0.6))
  fan.rotation.x = Math.PI / 2
  fan.position.set(-w * 0.12, h / 2 + 2, d / 2 + 0.3)
  g.add(fan)
}

/**
 * 餐桌中島：靠牆的收納中島（高 h、深 50）＋同一直線延伸的餐桌（高 75、深 d）。
 * 背面（-z）靠牆；中島在 -x 端，餐桌在 +x 端，椅子放在正面（+z）。
 */
function diningisland(g: G, it: FurnitureItem) {
  const { w, d } = it
  const islandLen = Math.min(80, Math.round(w * 0.42))
  const islandD = Math.min(50, d)
  const tableLen = w - islandLen
  const part = new THREE.Group()
  part.position.set(-w / 2 + islandLen / 2, 0, -d / 2 + islandD / 2)
  g.add(part)
  island(part, { ...it, w: islandLen, d: islandD })
  const tx = -w / 2 + islandLen + tableLen / 2
  const wood = mat('#b08560', 0.5)
  bx(g, tableLen, 4, d, tx, 71, 0, wood)
  // 餐桌一端架在中島側面，另一端兩支腳
  for (const sz of [-1, 1]) bx(g, 5, 71, 5, w / 2 - 6, 0, sz * (d / 2 - 6), mat('#6e5540', 0.6))
  bx(g, 3, 8, d - 12, w / 2 - 6, 60, 0, mat('#6e5540', 0.6))
}

/**
 * 窗下訂製中島：高度壓在窗台下，背面（-z）靠窗下的牆、正面（+z）朝室內。
 * +x 端嵌微波爐；檯面正下方藏一張抽拉式餐桌，'tableout' 時拉出 90 公分（桌面高 = 中島高 − 6）。
 */
function windowisland(g: G, it: FurnitureItem) {
  const { w, d, h } = it
  const body = mat(it.color, 0.6)
  const line = mat(shadeHex(it.color, 0.55), 0.8)
  const topH = 4
  const base = 8
  const bodyTop = h - topH
  const front = d / 2 + 0.15
  bx(g, w - 4, base, d - 6, 0, 0, 0, line)
  bx(g, w, bodyTop - base, d, 0, base, 0, body)
  bx(g, w + 2, topH, d + 2, 0, bodyTop, 0, mat('#dcd8d1', 0.3))
  // 抽拉餐桌的收納縫
  const slotY = bodyTop - 5
  bx(g, w - 4, 0.6, 0.4, 0, slotY, front, line)
  // 微波爐（+x 端）
  const mw = has(it, 'microwave')
  const mwW = 45
  const mh = 28
  const mwCx = w / 2 - 4 - mwW / 2
  const mwY = slotY - 2 - mh
  if (mw) {
    bx(g, mwW, mh, 1.2, mwCx, mwY, front + 0.45, mat('#c7cace', 0.3, 0.7))
    bx(g, mwW * 0.68, mh - 7, 0.4, mwCx - mwW * 0.12, mwY + 3.5, front + 1.2, mat('#14171b', 0.1, 0.3))
    bx(g, mwW * 0.18, mh - 7, 0.4, mwCx + mwW / 2 - mwW * 0.11 - 1, mwY + 3.5, front + 1.2, mat('#2b2f34', 0.4))
    bx(g, 0.6, slotY - base, 0.4, w / 2 - 8 - mwW, base, front, line)
    bx(g, mwW, 0.6, 0.4, mwCx, (base + mwY) / 2, front, line)
  }
  // 抽屜（微波爐以外的寬度，兩層）
  const x1 = mw ? w / 2 - 8 - mwW : w / 2
  const dw = x1 + w / 2
  const cx = (x1 - w / 2) / 2
  const rh = (slotY - base) / 2
  bx(g, dw - 2, 0.6, 0.4, cx, base + rh, front, line)
  for (let r = 0; r < 2; r++) bx(g, Math.min(24, dw / 3), 1.4, 2, cx, base + (r + 0.5) * rh, front + 0.8, METAL())
  // 抽拉式餐桌
  const tw = w - 10
  if (has(it, 'tableout')) {
    const ext = 90
    const wood = mat('#b08560', 0.5)
    bx(g, tw, 3, ext + 6, 0, bodyTop - 5, d / 2 + ext / 2 - 3, wood)
    for (const sx of [-1, 1]) bx(g, 4, bodyTop - 5, 4, sx * (tw / 2 - 6), 0, d / 2 + ext - 7, mat('#3a3a3a', 0.5, 0.4))
  } else {
    bx(g, 16, 1.4, 2, 0, slotY + 1.5, front + 0.8, METAL())
  }
}

/** 兩個台灣三孔插座（兩平腳＋下方接地孔），畫在 z = 0 的平面上、朝 +z；(0, 0) = 兩插座中心 */
function sockets(p: G, z: number) {
  const hole = mat('#2a2b2e', 0.6)
  for (const sx of [-1, 1]) {
    const cx = sx * 2.9
    bx(p, 4.6, 5.2, 0.3, cx, -2.6, z + 0.15, mat('#ebeae5', 0.4))
    for (const s of [-1, 1]) bx(p, 0.32, 1.3, 0.2, cx + s * 0.63, 0.1, z + 0.26, hole)
    const ground = new THREE.Mesh(new THREE.CylinderGeometry(0.38, 0.38, 0.2, 16), hole)
    ground.rotation.x = Math.PI / 2
    ground.position.set(cx, -1.3, z + 0.26)
    p.add(ground)
  }
}

/** 雙連三孔插座（橫式面板 12 × 7）：(x, y, z) = 面板背面中心，rotY 決定朝向（0 = 朝 +z） */
function outletPlate(g: G, x: number, y: number, z: number, rotY: number) {
  const p = new THREE.Group()
  p.position.set(x, y, z)
  p.rotation.y = rotY
  g.add(p)
  bx(p, 12, 7, 0.8, 0, -3.5, 0.4, mat('#f6f5f1', 0.35))
  sockets(p, 0.8)
}

/** 檯面彈出式插座（升起的樣子，雙連三孔）：(x, y, z) = 檯面上的中心點，插座朝 rotY 方向（0 = 朝 +z） */
function popupOutlet(g: G, x: number, y: number, z: number, rotY: number) {
  const p = new THREE.Group()
  p.position.set(x, y, z)
  p.rotation.y = rotY
  g.add(p)
  const steel = mat('#b9bcc0', 0.3, 0.7)
  bx(p, 16, 0.3, 9, 0, 0, 0, mat('#8e9296', 0.35, 0.7))
  bx(p, 14, 9, 6, 0, 0.3, 0, steel)
  bx(p, 14.4, 0.7, 6.4, 0, 9.3, 0, mat('#9a9ea3', 0.3, 0.7))
  const face = new THREE.Group()
  face.position.set(0, 4.8, 0)
  p.add(face)
  sockets(face, 3)
}

/**
 * 訂製中島餐桌（半島型）：-x 端靠牆是收納段，+x 端是餐桌段，檯面連續同高。
 * 收納段是雙面櫃（內部規劃見 interiors.ts）：-z 側朝廚房、+z 側朝走道；餐桌段兩側都能放椅子並收進桌下。
 * 'outlets'：兩組雙連三孔插座——餐桌外端兩支腳之間加牙板裝一組；靠窗那端的檯面裝彈出式插座
 * （在電鍋、氣炸鍋後面，插座朝它們）。電從窗下牆面進收納段，再沿桌下橫樑走到外端。
 */
function peninsula(g: G, it: FurnitureItem) {
  const { w, d, h } = it
  const ls = peninsulaStorageLen(it)
  const bodyTop = h - PENINSULA_TOP
  peninsulaStorage(g, it)
  bx(g, w, PENINSULA_TOP, d + 2, 0, bodyTop, 0, mat('#dcd8d1', 0.3))
  // 餐桌段：末端兩支腳＋中間橫樑
  const legM = mat('#8a8680', 0.5, 0.3)
  for (const sz of [-1, 1]) bx(g, 5, bodyTop, 5, w / 2 - 5, 0, sz * (d / 2 - 5), legM)
  bx(g, w - ls - 8, 6, 3, (-w / 2 + ls + w / 2) / 2, bodyTop - 6, 0, mat(shadeHex(it.color, 0.85), 0.6))
  if (has(it, 'outlets')) {
    bx(g, 2, 12, d - 15, w / 2 - 3.5, bodyTop - 12, 0, mat(shadeHex(it.color, 0.85), 0.6))
    outletPlate(g, w / 2 - 2.5, bodyTop - 6, 0, Math.PI / 2)
    popupOutlet(g, -w / 2 + 15, h, 0, Math.PI / 2)
  }
}

function coffeemaker(g: G, it: FurnitureItem) {
  const { w, d, h } = it
  bx(g, w, h, d * 0.7, 0, 0, -d * 0.15, mat(it.color, 0.35, 0.3))
  bx(g, w, 4, d * 0.3, 0, 0, d * 0.35, mat('#2b2b2e', 0.4))
  bx(g, w * 0.5, 8, 6, 0, h * 0.55, d * 0.22, mat('#1b1b1d', 0.3))
  cyl(g, 3.2, 2.8, 8, 0, 4, d * 0.3, mat('#f4f1ea', 0.3), 16)
}

/** 小型方塊投影機：鏡頭朝正面（+z），附投影光線示意（與冷氣出風示意同一個開關） */
function projector(g: G, it: FurnitureItem) {
  const { w, d, h } = it
  bx(g, w * 0.7, 1.5, d * 0.7, 0, 0, 0, DARK())
  bx(g, w, h - 1.5, d, 0, 1.5, 0, mat(it.color, 0.4))
  bx(g, w - 4, 0.4, d - 4, 0, h - 0.2, 0, mat(shadeHex(it.color, 0.85), 0.6))
  const lensY = h * 0.55
  const lens = new THREE.Mesh(new THREE.CylinderGeometry(3.2, 3.2, 1.6, 32), mat('#1c2530', 0.1, 0.4))
  lens.rotation.x = Math.PI / 2
  lens.position.set(0, lensY, d / 2 + 0.8)
  g.add(lens)
  const ring = new THREE.Mesh(new THREE.TorusGeometry(3.6, 0.5, 8, 32), mat('#9aa0a6', 0.3, 0.7))
  ring.position.set(0, lensY, d / 2 + 0.3)
  g.add(ring)
  // 光線：從鏡頭往前 240 公分展開，越遠越淡
  const reach = 240
  const geo = new THREE.BufferGeometry()
  const z0 = d / 2 + 1.5
  geo.setAttribute(
    'position',
    new THREE.Float32BufferAttribute([0, lensY, z0, -85, 35, reach, 85, 35, reach, 85, 136, reach, -85, 136, reach], 3),
  )
  const c = new THREE.Color('#fff4c8')
  geo.setAttribute('color', new THREE.Float32BufferAttribute([c.r, c.g, c.b, 0.3, ...[1, 2, 3, 4].flatMap(() => [c.r, c.g, c.b, 0.03])], 4))
  geo.setIndex([0, 1, 2, 0, 2, 3, 0, 3, 4, 0, 4, 1])
  airflowMat ??= new THREE.MeshBasicMaterial({ vertexColors: true, transparent: true, depthWrite: false, side: THREE.DoubleSide })
  const beam = new THREE.Mesh(geo, airflowMat)
  beam.userData.airflow = true
  beam.raycast = () => {}
  beam.renderOrder = 5
  g.add(beam)
}

/** 投影畫面示意：貼在牆上的發光矩形（elev = 畫面下緣高度） */
function projection(g: G, it: FurnitureItem) {
  const { w, h } = it
  const screen = bx(g, w, h, 0.3, 0, 0, 0, mat('#e6eefb', 0.9, 0, '#c4d8ff'))
  screen.castShadow = false
  const edge = mat('#9fb4d6', 0.8)
  for (const sy of [0, h - 0.8]) bx(g, w, 0.8, 0.5, 0, sy, 0.1, edge).castShadow = false
  for (const sx of [-1, 1]) bx(g, 0.8, h, 0.5, sx * (w / 2 - 0.4), 0, 0.1, edge).castShadow = false
}

let pegTex: THREE.CanvasTexture | null = null

/** 洞洞板貼圖：白底、每 2.5 公分一個孔（一張貼圖 = 25 × 25 公分） */
function pegboardTexture() {
  if (pegTex) return pegTex
  const c = document.createElement('canvas')
  c.width = c.height = 256
  const x = c.getContext('2d')!
  x.fillStyle = '#ffffff'
  x.fillRect(0, 0, 256, 256)
  x.fillStyle = 'rgba(40,36,32,0.55)'
  for (let i = 0; i < 10; i++)
    for (let j = 0; j < 10; j++) {
      x.beginPath()
      x.arc(12.8 + i * 25.6, 12.8 + j * 25.6, 3.4, 0, Math.PI * 2)
      x.fill()
    }
  pegTex = new THREE.CanvasTexture(c)
  pegTex.wrapS = pegTex.wrapT = THREE.RepeatWrapping
  pegTex.colorSpace = THREE.SRGBColorSpace
  pegTex.anisotropy = 8
  return pegTex
}

/** 洞洞板：貼牆的孔板（背面 -z 靠牆），附層板、掛勾、包包、鑰匙等收納示意 */
function pegboard(g: G, it: FurnitureItem) {
  const { w, d, h } = it
  const tex = pegboardTexture().clone()
  tex.repeat.set(w / 25, h / 25)
  tex.needsUpdate = true
  bx(g, w, h, d, 0, 0, 0, new THREE.MeshStandardMaterial({ color: it.color, map: tex, roughness: 0.75 }))
  const f = d / 2
  const wood = mat('#c49a6c', 0.6)
  // 層板與小物
  bx(g, w * 0.4, 1.5, 14, -w * 0.22, h * 0.48, f + 7, wood)
  bx(g, 10, 12, 8, -w * 0.32, h * 0.48 + 1.5, f + 6, mat('#e8e2d8', 0.6))
  cyl(g, 4, 3.5, 9, -w * 0.18, h * 0.48 + 1.5, f + 7, mat('#c07a55', 0.8), 16)
  cyl(g, 5, 4, 7, -w * 0.18, h * 0.48 + 10.5, f + 7, mat('#6c8f5c', 0.9), 12)
  // 掛勾
  const hooks = [-0.4, -0.1, 0.12, 0.3].map((r) => r * w)
  for (const hx of hooks) {
    const hook = cyl(g, 0.5, 0.5, 6, hx, h * 0.82, f + 3, METAL(), 8)
    hook.rotation.x = Math.PI / 2
  }
  // 包包、鑰匙、帽子
  bx(g, 24, 28, 7, hooks[2], h * 0.82 - 32, f + 4.5, mat('#b5a27e', 0.9))
  bx(g, 4, 6, 1, hooks[1], h * 0.82 - 9, f + 3, mat('#d4b24c', 0.3, 0.8))
  const hat = cyl(g, 13, 13, 1.2, hooks[3], h * 0.82 - 14, f + 2, mat('#3f4a5a', 0.9), 24)
  hat.rotation.x = Math.PI / 2
}

/** 滾筒乾衣機（熱泵式）：上方控制面板＋左上集水盒，正面大圓門 */
function dryer(g: G, it: FurnitureItem) {
  const { w, d, h } = it
  const f = d / 2
  bx(g, w, h, d, 0, 0, 0, mat(it.color, 0.35))
  bx(g, w - 2, 12, 0.5, 0, h - 14, f + 0.2, mat(shadeHex(it.color, 0.93), 0.4))
  bx(g, 16, 7, 0.6, -w / 2 + 11, h - 11.5, f + 0.4, mat(shadeHex(it.color, 0.85), 0.4))
  bx(g, 14, 4, 0.6, w * 0.12, h - 10, f + 0.4, mat('#1d2a38', 0.2))
  const ring = new THREE.Mesh(new THREE.CylinderGeometry(w * 0.34, w * 0.34, 2.4, 44), mat('#c3c8cd', 0.3, 0.6))
  ring.rotation.x = Math.PI / 2
  ring.position.set(0, h * 0.42, f + 1.2)
  g.add(ring)
  const door = new THREE.Mesh(new THREE.CylinderGeometry(w * 0.27, w * 0.27, 2.6, 44), mat('#2a3440', 0.1, 0.2))
  door.rotation.x = Math.PI / 2
  door.position.set(0, h * 0.42, f + 1.3)
  g.add(door)
  bx(g, 3, 12, 3, w * 0.36, h * 0.36, f + 2.5, mat('#9aa3ab', 0.3, 0.6))
  bx(g, w - 10, 6, 1, 0, 2, f + 0.3, DARK())
}

/** 直立式吸塵器掛在充電座上 */
function vacuum(g: G, it: FurnitureItem) {
  const { w, d, h } = it
  bx(g, w, 1.5, d, 0, 0, 0, DARK())
  bx(g, w * 0.5, h - 10, 2, 0, 1.5, -d / 2 + 1, mat('#d5d8dc', 0.4))
  bx(g, 25, 6, 9, 0, 1.5, 3, mat('#3a3d42', 0.5))
  cyl(g, 1.6, 1.6, h - 40, 0, 7, 2, mat('#b9bec4', 0.3, 0.7), 12)
  const body = cyl(g, 5.5, 5.5, 22, 0, h - 36, 2, mat(it.color, 0.35, 0.3), 20)
  body.rotation.x = 0.35
  bx(g, 4, 14, 5, 0, h - 16, -1, DARK())
}

/** 升降桌：T 型雙柱腳架 */
function standingdesk(g: G, it: FurnitureItem) {
  const { w, d, h } = it
  const frame = mat('#2c2d30', 0.5, 0.4)
  bx(g, w, 2.5, d, 0, h - 2.5, 0, mat(it.color, 0.5))
  for (const sx of [-1, 1]) {
    const x = sx * (w / 2 - 16)
    bx(g, 7, 3, d - 6, x, 0, 0, frame)
    bx(g, 6.5, h - 9, 6.5, x, 3, 0, frame)
    bx(g, 5, 3.5, d - 12, x, h - 6, 0, frame)
  }
  bx(g, w - 36, 4, 4, 0, h - 8, -d / 4, frame)
  bx(g, 11, 1.6, 5, w / 2 - 14, h - 4.1, d / 2 - 3, mat('#141517', 0.3))
}

/** 按摩椅：正面（+z）是腳靠，背靠往後傾 */
function massagechair(g: G, it: FurnitureItem) {
  const { w, d, h } = it
  const up = mat(it.color, 0.75)
  const soft = mat(shadeHex(it.color, 1.45), 0.85)
  bx(g, w - 12, 10, d - 24, 0, 0, -6, DARK())
  for (const sx of [-1, 1]) bx(g, 14, 60, d * 0.6, sx * (w / 2 - 7), 8, -d * 0.06, up)
  bx(g, w - 28, 16, 56, 0, 34, d * 0.02, soft)
  const back = bx(g, w - 18, h - 32, 26, 0, 36, -d / 2 + 30, up)
  back.rotation.x = -0.34
  const pad = bx(g, w - 34, h - 50, 6, 0, 46, -d / 2 + 44, soft)
  pad.rotation.x = -0.34
  const leg = bx(g, w - 30, 48, 16, 0, 4, d / 2 - 24, up)
  leg.rotation.x = 0.42
}

function airfryer(g: G, it: FurnitureItem) {
  const { w, d, h } = it
  bx(g, w, h * 0.9, d, 0, 0, 0, mat(it.color, 0.35))
  bx(g, w - 5, h * 0.44, 0.8, 0, 3, d / 2 + 0.3, mat(shadeHex(it.color, 0.7), 0.3))
  bx(g, 9, 3, 6, 0, h * 0.28, d / 2 + 3, mat('#141414', 0.4))
  bx(g, w * 0.45, h * 0.12, 0.5, 0, h * 0.68, d / 2 + 0.2, mat('#101418', 0.2))
  cyl(g, Math.min(w, d) * 0.36, Math.min(w, d) * 0.42, h * 0.1, 0, h * 0.9, 0, mat(shadeHex(it.color, 1.25), 0.3), 24)
}

/** 電鍋（大同電鍋造型） */
function ricecooker(g: G, it: FurnitureItem) {
  const r = Math.min(it.w, it.d) / 2
  const { h } = it
  cyl(g, r * 0.95, r * 0.88, h * 0.7, 0, 0, 0, mat(it.color, 0.35), 36)
  cyl(g, r * 0.7, r * 0.96, h * 0.18, 0, h * 0.7, 0, mat(shadeHex(it.color, 1.04), 0.3), 36)
  cyl(g, r * 0.2, r * 0.26, h * 0.12, 0, h * 0.88, 0, DARK(), 16)
  for (const sx of [-1, 1]) bx(g, 4, 3, 10, sx * r * 0.98, h * 0.55, 0, DARK())
  bx(g, 7, 5, 2, 0, h * 0.14, r * 0.9, mat('#c4453c', 0.4))
}

function microwave(g: G, it: FurnitureItem) {
  const { w, d, h } = it
  bx(g, w, h, d, 0, 0, 0, mat(it.color, 0.35, 0.3))
  bx(g, w * 0.66, h - 8, 0.6, -w * 0.13, 4, d / 2 + 0.2, mat('#15181c', 0.1, 0.3))
  bx(g, w * 0.2, h - 8, 0.6, w / 2 - w * 0.12 - 1, 4, d / 2 + 0.2, mat('#2b2f34', 0.4))
}

let airflowMat: THREE.MeshBasicMaterial | null = null

/** 分離式冷氣室內機：正面（+z）出風，附出風範圍示意 */
function acindoor(g: G, it: FurnitureItem) {
  const { w, d, h } = it
  bx(g, w, h, d, 0, 0, 0, mat(it.color, 0.4))
  bx(g, w - 2, h * 0.6, 0.8, 0, h * 0.36, d / 2 + 0.3, mat(shadeHex(it.color, 1.03), 0.3))
  bx(g, w - 8, 3, 0.6, 0, h * 0.12, d / 2 + 0.4, mat('#3a3f45', 0.5))
  const vane = bx(g, w - 10, 1, 7, 0, 0, d / 2 + 1.5, mat(shadeHex(it.color, 0.92), 0.4))
  vane.rotation.x = 0.55
  bx(g, 3, 1, 0.5, w / 2 - 10, h * 0.26, d / 2 + 0.75, mat('#5fd1ff', 0.3, 0, '#5fd1ff'))
  // 出風範圍：往前 230 公分、往下 110 公分、左右各擴散 45 公分，越遠越淡
  const reach = 230
  const drop = 110
  const spread = 45
  const geo = new THREE.BufferGeometry()
  geo.setAttribute(
    'position',
    new THREE.Float32BufferAttribute(
      [-w / 2 + 8, 1, d / 2 + 2, w / 2 - 8, 1, d / 2 + 2, w / 2 + spread, -drop, d / 2 + reach, -w / 2 - spread, -drop, d / 2 + reach],
      3,
    ),
  )
  const c = new THREE.Color('#5aaeff')
  geo.setAttribute('color', new THREE.Float32BufferAttribute([c.r, c.g, c.b, 0.45, c.r, c.g, c.b, 0.45, c.r, c.g, c.b, 0, c.r, c.g, c.b, 0], 4))
  geo.setIndex([0, 1, 2, 0, 2, 3])
  airflowMat ??= new THREE.MeshBasicMaterial({ vertexColors: true, transparent: true, depthWrite: false, side: THREE.DoubleSide })
  const flow = new THREE.Mesh(geo, airflowMat)
  flow.userData.airflow = true
  flow.raycast = () => {}
  flow.renderOrder = 5
  g.add(flow)
}

function plainBox(g: G, it: FurnitureItem) {
  bx(g, it.w, it.h, it.d, 0, 0, 0, mat(it.color, 0.7))
}

const builders: Record<string, (g: G, it: FurnitureItem) => void> = {
  bed,
  // 有櫃內規劃的櫃子
  wardrobe: interiorCabinet,
  cabinet: interiorCabinet,
  nightstand: interiorCabinet,
  tvstand: interiorCabinet,
  bookshelf: interiorCabinet,
  coffeebar: interiorCabinet,
  island,
  desk,
  table,
  roundtable,
  chair,
  sofa,
  coffeetable,
  tv,
  rug,
  plant,
  lamp,
  fridge,
  washer,
  kitchen,
  toilet,
  vanity,
  shower,
  acunit,
  acindoor,
  vacuum,
  windowisland,
  peninsula,
  coffeemaker,
  dryer,
  projector,
  projection,
  pegboard,
  diningisland,
  standingdesk,
  massagechair,
  airfryer,
  ricecooker,
  microwave,
  box: plainBox,
}

/** 會影響模型外觀的欄位（改了就要重建模型） */
export function furnitureSignature(it: FurnitureItem) {
  return `${it.type}|${it.name}|${it.w}|${it.d}|${it.h}|${it.color}|${(it.features ?? []).join(',')}|${it.interior ? JSON.stringify(it.interior) : ''}`
}

export function buildFurniture(it: FurnitureItem): THREE.Group {
  const inner = new THREE.Group()
  const fn = builders[it.type] ?? plainBox
  fn(inner, it)
  inner.traverse((o) => {
    o.userData.itemId = it.id
  })
  return inner
}
