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
  if (has(it, 'round')) {
    // 圓形小茶几：圓桌面＋下層圓板＋四支木腳
    const r = Math.min(w, d) / 2
    cyl(g, r, r, 3, 0, h - 3, 0, m, 48)
    cyl(g, r * 0.78, r * 0.78, 1.8, 0, 11, 0, m, 40)
    const legM = mat(shadeHex(it.color, 0.9), 0.55)
    for (let i = 0; i < 4; i++) {
      const a = Math.PI / 4 + (i * Math.PI) / 2
      cyl(g, 1.6, 1.4, h - 3, Math.cos(a) * r * 0.72, 0, Math.sin(a) * r * 0.72, legM, 12)
    }
    return
  }
  bx(g, w, 4, d, 0, h - 4, 0, m)
  bx(g, w - 8, 2, d - 8, 0, 10, 0, m)
  for (const sx of [-1, 1]) for (const sz of [-1, 1]) bx(g, 4, h - 4, 4, sx * (w / 2 - 4), 0, sz * (d / 2 - 4), mat(shadeHex(it.color, 0.6), 0.6))
}

function tv(g: G, it: FurnitureItem) {
  const { w, h } = it
  if (has(it, 'wallmount')) {
    // 壁掛：背面（-z）貼牆，中間一片壁掛架
    const d = it.d
    bx(g, 40, 30, 2.5, 0, h / 2 - 15, -d / 2 + 1.25, DARK())
    bx(g, w, h, 3, 0, 0, d / 2 - 1.5, mat(it.color, 0.35))
    bx(g, w - 2, h - 2, 0.3, 0, 1, d / 2 + 0.1, mat('#0d1117', 0.12, 0.3))
    return
  }
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
  if (has(it, 'sixdoor')) {
    // 六門：上面對開冷藏；下面左邊製冰室、右邊上段冷凍，再來冷凍、蔬果室
    const f = d / 2 + 0.2
    const top = h * 0.47
    const ice = top - 17
    const frz = ice - 30
    bx(g, 0.6, h - top - 1, 0.4, 0, top, f, line)
    for (const y of [top, ice, frz]) bx(g, w - 1, 0.6, 0.4, 0, y, f, line)
    bx(g, 0.6, top - ice, 0.4, 0, ice, f, line)
    for (const sx of [-1, 1]) {
      bx(g, 1.5, 24, 3, sx * 3.5, top + 14, d / 2 + 1.5, METAL())
      bx(g, w / 2 - 12, 1.4, 2.5, sx * (w / 4), ice + 13, d / 2 + 1.2, METAL())
    }
    for (const y of [frz + 25, 32]) bx(g, w - 20, 1.4, 2.5, 0, y, d / 2 + 1.2, METAL())
    return
  }
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
  if (has(it, 'sideniche')) vanityNiche(g, it)
  else cabinet(g, { ...it, h: h - 12 }, 'doors')
  bx(g, w, 12, d, 0, h - 12, 0, WHITE())
  const sink = cyl(g, 17, 17, 0.5, 0, h, 2, mat('#d8dde0', 0.15), 36)
  sink.scale.z = 0.7
  cyl(g, 1.5, 1.5, 22, 0, h, -d / 2 + 6, METAL(), 12)
  bx(g, 2.5, 2.5, 12, 0, h + 19, -d / 2 + 11, METAL())
}

/**
 * 'sideniche' 浴櫃（柯林斯 ST-80 這類）：壁掛櫃高 60、底下懸空；-x 是門片段，+x 端 26.5 寬的開放格朝馬桶，
 * 正面和側面都拿得到，上下兩層放衛生紙（下層捲筒、上層抽取式）
 */
function vanityNiche(g: G, it: FurnitureItem) {
  const { w, d, h } = it
  const cabH = 60
  const y0 = h - 12 - cabH
  const nw = 26.5
  const body = mat(it.color, 0.6)
  const line = mat(shadeHex(it.color, 0.55), 0.8)
  const bw = w - nw
  const cx = -w / 2 + bw / 2
  const front = d / 2 - 1
  bx(g, bw, cabH, d - 2, cx, y0, -1, body)
  bx(g, 0.6, cabH - 2, 0.4, cx, y0 + 1, front + 0.15, line)
  for (const s of [-1, 1]) bx(g, 1.4, 12, 2, cx + s * 4, y0 + cabH - 20, front + 0.9, METAL())
  const nx = w / 2 - nw / 2
  const wood = mat('#8a6a4f', 0.6)
  bx(g, nw, 1.8, d - 2, nx, y0, -1, wood)
  bx(g, nw, 1.8, d - 2, nx, y0 + cabH / 2 - 0.9, -1, wood)
  bx(g, nw, cabH, 1.8, nx, y0, -d / 2 + 0.9, wood)
  const paper = mat('#f7f6f2', 0.85)
  for (const z of [-12, 0, 12]) cyl(g, 5.5, 5.5, 10, nx, y0 + 1.8, z, paper, 20)
  for (const z of [-9, 10]) for (const k of [0, 1]) bx(g, 11, 7, 18, nx, y0 + cabH / 2 + 0.9 + k * 7.2, z, paper)
}

/**
 * 浴室鏡櫃：白色防水櫃體＋鏡門（寬 60 以上對開）；'openshelf' 時最下面一格開放層板；
 * 'sideshelves' 時中間一扇 50 寬鏡門、左右各一欄開放層板（3 層）
 */
function mirrorcab(g: G, it: FurnitureItem) {
  const { w, d, h } = it
  const body = mat(it.color, 0.4)
  const mirrorM = mat('#dde4e8', 0.04, 0.35)
  bx(g, w, h, 1, 0, 0, -d / 2 + 0.5, body)
  for (const sx of [-1, 1]) bx(g, 1.5, h, d - 2, sx * (w / 2 - 0.75), 0, -1, body)
  bx(g, w - 3, 1.5, d - 2, 0, 0, -1, body)
  bx(g, w - 3, 1.5, d - 2, 0, h - 1.5, -1, body)
  if (has(it, 'sideshelves')) {
    const mw = 50
    const sw = (w - mw) / 2
    for (const sx of [-1, 1]) {
      bx(g, 1.5, h, d - 2, sx * (mw / 2 + 0.75), 0, -1, body)
      const cx = sx * (mw / 2 + sw / 2)
      for (const k of [1, 2]) bx(g, sw - 3, 1.2, d - 2, cx, (h * k) / 3, -1, body)
      cyl(g, 3, 3, 10, cx, 1.5, -1, mat('#cfe0e6', 0.3), 16)
      cyl(g, 2.2, 2.2, 15, cx, h / 3 + 1.2, -1, mat('#e8d9c4', 0.4), 16)
      bx(g, sw - 8, 6, d - 6, cx, (h * 2) / 3 + 1.2, -1, mat('#efe9df', 0.6))
    }
    bx(g, mw - 0.4, h, 1.8, 0, 0, d / 2 - 0.9, body)
    bx(g, mw - 1.6, h - 1.2, 0.3, 0, 0.6, d / 2 + 0.15, mirrorM)
    return
  }
  const shelfH = has(it, 'openshelf') ? Math.round(h * 0.22) : 0
  if (shelfH) {
    bx(g, w - 3, 1.5, d - 2, 0, shelfH, -1, body)
    cyl(g, 2.5, 2.5, 12, -w / 4, 1.5, -1, mat('#cfe0e6', 0.3), 16)
    cyl(g, 2, 2, 9, -w / 4 + 7, 1.5, -1, mat('#e8d9c4', 0.4), 16)
  }
  const n = w >= 60 ? 2 : 1
  const dw = w / n
  const dh = h - shelfH - (shelfH ? 1.5 : 0)
  const dy = h - dh
  for (let i = 0; i < n; i++) {
    const x = -w / 2 + dw * (i + 0.5)
    bx(g, dw - 0.4, dh, 1.8, x, dy, d / 2 - 0.9, body)
    bx(g, dw - 1.6, dh - 1.2, 0.3, x, dy + 0.6, d / 2 + 0.15, mirrorM)
  }
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

/** 檯面平面嵌入式插座（雙連三孔，面板和檯面齊平、插孔朝上）：(x, y, z) = 檯面上的中心點，rotY = 接地孔那一側的方向 */
function flushOutlet(g: G, x: number, y: number, z: number, rotY: number) {
  const p = new THREE.Group()
  p.position.set(x, y, z)
  p.rotation.y = rotY
  g.add(p)
  const face = new THREE.Group()
  face.rotation.x = -Math.PI / 2
  p.add(face)
  bx(face, 13, 7.6, 0.2, 0, -3.8, 0.1, mat('#c3c6ca', 0.3, 0.7))
  sockets(face, 0.2)
}

/**
 * 訂製中島餐桌（半島型）：-x 端靠牆是收納段，+x 端是餐桌段，檯面連續同高。
 * 收納段是雙面櫃（內部規劃見 interiors.ts）：-z 側朝廚房、+z 側朝走道；餐桌段兩側都能放椅子並收進桌下。
 * 'outlets'：兩組雙連三孔插座——餐桌外端兩支腳之間加牙板裝一組；靠窗那端的檯面嵌一組平面插座
 * （和檯面齊平，在電鍋、氣炸鍋後面）。電從窗下牆面進收納段，再沿桌下橫樑走到外端。
 */
function peninsula(g: G, it: FurnitureItem) {
  const { w, d, h } = it
  const ls = peninsulaStorageLen(it)
  const bodyTop = h - PENINSULA_TOP
  peninsulaStorage(g, it)
  // 檯面：woodtop = 白橡木實木，否則人造石
  bx(g, w, PENINSULA_TOP, d + 2, 0, bodyTop, 0, has(it, 'woodtop') ? mat('#cfae84', 0.55) : mat('#dcd8d1', 0.3))
  // 餐桌段：末端兩支腳＋中間橫樑
  const legM = mat('#8a8680', 0.5, 0.3)
  for (const sz of [-1, 1]) bx(g, 5, bodyTop, 5, w / 2 - 5, 0, sz * (d / 2 - 5), legM)
  bx(g, w - ls - 8, 6, 3, (-w / 2 + ls + w / 2) / 2, bodyTop - 6, 0, mat(shadeHex(it.color, 0.85), 0.6))
  if (has(it, 'outlets')) {
    bx(g, 2, 12, d - 15, w / 2 - 3.5, bodyTop - 12, 0, mat(shadeHex(it.color, 0.85), 0.6))
    outletPlate(g, w / 2 - 2.5, bodyTop - 6, 0, Math.PI / 2)
    flushOutlet(g, -w / 2 + 15, h, 0, -Math.PI / 2)
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
  if (has(it, 'coffee')) {
    // 咖啡角洞洞板：小層板放手沖濾杯、咖啡秤，掛勾掛不鏽鋼拉花杯、清潔刷、擦布（都是摔不壞的）
    bx(g, w * 0.45, 1.5, 12, -w * 0.2, h * 0.42, f + 6, wood)
    bx(g, 13, 2, 11, -w * 0.3, h * 0.42 + 1.5, f + 6, mat('#2f3033', 0.4))
    cyl(g, 5.5, 3, 7, -w * 0.08, h * 0.42 + 1.5, f + 6, mat('#f2f2f0', 0.5), 18)
    const hy = h * 0.88
    for (const hx of [w * 0.12, w * 0.25, w * 0.38]) {
      const hk = cyl(g, 0.5, 0.5, 6, hx, hy, f + 3, METAL(), 8)
      hk.rotation.x = Math.PI / 2
    }
    cyl(g, 4, 4.5, 11, w * 0.12, hy - 13, f + 5, mat('#c9ccd0', 0.25, 0.8), 18)
    bx(g, 2, 14, 1, w * 0.25, hy - 15, f + 3.5, mat('#8a6a4f', 0.6))
    bx(g, 12, 18, 0.6, w * 0.38, hy - 19, f + 3.5, mat('#e8e2d8', 0.9))
    return
  }
  if (has(it, 'study')) {
    // 書房洞洞板：小層板放行動電源、充電器，掛勾掛耳機，下面小籃子收線材
    bx(g, w * 0.75, 1.5, 12, 0, h * 0.58, f + 6, wood)
    bx(g, 8, 4, 6, -w * 0.15, h * 0.58 + 1.5, f + 6, mat('#2f3033', 0.5))
    bx(g, 5, 4, 4, w * 0.2, h * 0.58 + 1.5, f + 5, mat('#f2f2f0', 0.5))
    const hookY = h * 0.92
    const hook = cyl(g, 0.5, 0.5, 6, -w * 0.2, hookY, f + 3, METAL(), 8)
    hook.rotation.x = Math.PI / 2
    const band = new THREE.Mesh(new THREE.TorusGeometry(8, 1.1, 8, 24, Math.PI), mat('#3a3a3d', 0.5))
    band.position.set(-w * 0.2, hookY - 8.5, f + 5)
    g.add(band)
    for (const sx of [-1, 1]) bx(g, 4, 6, 3.5, -w * 0.2 + sx * 8, hookY - 15, f + 5, mat('#3a3a3d', 0.5))
    bx(g, w * 0.6, 9, 9, 0, h * 0.12, f + 5, mat('#cfc8bb', 0.8))
    return
  }
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

/** 電子鍋（象印／虎牌這類方圓造型）：正面有操作面板，上蓋把手 */
function ecooker(g: G, it: FurnitureItem) {
  const { w, d, h } = it
  const body = cyl(g, w / 2, w / 2 - 0.5, h * 0.78, 0, 0, 0, mat(it.color, 0.35, 0.2), 40)
  body.scale.z = d / w
  const lid = cyl(g, w / 2 - 0.3, w / 2, h * 0.22, 0, h * 0.78, 0, mat(shadeHex(it.color, 1.15), 0.3, 0.2), 40)
  lid.scale.z = d / w
  bx(g, w * 0.45, h * 0.3, 1, 0, h * 0.35, d / 2 - 1, mat('#1d2126', 0.3))
  bx(g, w * 0.5, 1.6, 3, 0, h, -d * 0.1, DARK())
}

/** 磨豆機（窄身直立）：底座、靠後的機身、正面出粉口＋接粉杯，上面煙燻色豆倉和黑色蓋子 */
function grinder(g: G, it: FurnitureItem) {
  const { w, d, h } = it
  const body = mat(it.color, 0.35, 0.3)
  const bodyTop = 2 + h * 0.6
  const zb = -d * 0.15
  bx(g, w, 2, d, 0, 0, 0, mat(shadeHex(it.color, 0.8), 0.4, 0.3))
  bx(g, w, bodyTop - 2, d * 0.7, 0, 2, zb, body)
  bx(g, w * 0.7, 3, d * 0.3, 0, bodyTop - 9, d * 0.2, body)
  cyl(g, w * 0.26, w * 0.24, 7, 0, 2, d * 0.3, mat('#b8bcc2', 0.3, 0.7), 20)
  cyl(g, w * 0.47, w * 0.3, h - 2 - bodyTop, 0, bodyTop, zb, mat('#4a3c33', 0.15, 0.1), 24)
  cyl(g, w * 0.49, w * 0.49, 2, 0, h - 2, zb, DARK(), 24)
}

/** 電動奶泡機（Aeroccino 這類）：黑色底座、金屬奶壺、黑色蓋子，正面一顆按鈕 */
function frother(g: G, it: FurnitureItem) {
  const { w, h } = it
  const r = w / 2
  cyl(g, r, r, 2.5, 0, 0, 0, mat('#2b2b2e', 0.4), 32)
  cyl(g, r * 0.86, r * 0.8, h - 5.5, 0, 2.5, 0, mat(it.color, 0.25, 0.6), 32)
  cyl(g, r * 0.9, r * 0.9, 3, 0, h - 3, 0, DARK(), 32)
  bx(g, 2, 1.2, 1, 0, 0.6, r, mat('#e9e5dc', 0.3))
}

/** 咖啡豆密封罐 ×4（2 × 2 排）：圓筒罐身＋深色上蓋 */
function canisters(g: G, it: FurnitureItem) {
  const { w, d, h } = it
  const r = Math.min(w, d) / 4 - 0.5
  for (const sx of [-1, 1])
    for (const sz of [-1, 1]) {
      const x = (sx * w) / 4
      const z = (sz * d) / 4
      cyl(g, r, r, h - 2.5, x, 0, z, mat(it.color, 0.35, 0.3), 28)
      cyl(g, r + 0.2, r + 0.2, 2.5, x, h - 2.5, z, mat(shadeHex(it.color, 0.45), 0.4, 0.3), 28)
    }
}

/** 浮動層板（隱藏托架鎖牆）：'books' 放一排書和植物，'display' 放相框、橫放的書和小植物 */
const BOOK_COLORS = ['#8a5a44', '#3f4a5a', '#c9b48f', '#6c7a5a', '#a8443a', '#2f3033', '#d8d2c4', '#5b6f82']
function wallshelf(g: G, it: FurnitureItem) {
  const { w, d, h } = it
  bx(g, w, h, d, 0, 0, 0, mat(it.color, 0.5))
  const pot = (x: number) => {
    cyl(g, 5, 4, 10, x, h, 0, mat('#e8e2d8', 0.6), 16)
    cyl(g, 7, 5, 12, x, h + 10, 0, mat('#6c8f5c', 0.9), 12)
  }
  if (has(it, 'books')) {
    let x = -w / 2 + 8
    for (let i = 0; i < 26; i++) {
      const bw = 2.4 + (i % 3) * 0.8
      bx(g, bw, 21 + ((i * 7) % 6), d * 0.7, x + bw / 2, h, -d * 0.1, mat(BOOK_COLORS[i % BOOK_COLORS.length], 0.8))
      x += bw + 0.2
    }
    pot(w / 2 - 20)
  }
  if (has(it, 'coffee')) {
    // 咖啡豆袋 ×3（左邊）、咖啡秤、手沖濾杯、濾紙盒（右邊，不放在咖啡機正上方）
    ;['#8a6a4f', '#c9b48f', '#3f4a5a'].forEach((c, i) => bx(g, 9, 18, 6, -w / 2 + 10 + i * 11, h, -d * 0.1, mat(c, 0.8)))
    bx(g, 13, 2, 11, -w * 0.08, h, 0, mat('#2f3033', 0.4))
    cyl(g, 5.5, 3, 7, w * 0.12, h, 0, mat('#f2f2f0', 0.5), 18)
    bx(g, 14, 8, 12, w * 0.33, h, 0, mat('#efe9df', 0.7))
  }
  if (has(it, 'display')) {
    bx(g, 18, 23, 1.5, -w / 2 + 25, h, -d / 2 + 4, mat('#c9a77c', 0.6))
    bx(g, 14, 18, 1.5, -w / 2 + 46, h, -d / 2 + 4, mat('#2f3033', 0.6))
    for (let i = 0; i < 4; i++) bx(g, 22, 2.5, 16, -w * 0.05, h + i * 2.5, 0, mat(BOOK_COLORS[(i + 2) % BOOK_COLORS.length], 0.8))
    pot(w / 2 - 30)
  }
}

/** 浴巾架（雙桿，鎖牆）：兩支桿子＋掛著的浴巾，正面朝 +z */
function towelbar(g: G, it: FurnitureItem) {
  const { w, d, h } = it
  const z0 = -d / 2
  const metal = mat('#c9ccd0', 0.3, 0.8)
  for (const sx of [-1, 1]) bx(g, 2, 3, 12, sx * (w / 2 - 1), h - 4, z0 + 6, metal)
  for (const zz of [4, 10]) {
    const rod = new THREE.Mesh(new THREE.CylinderGeometry(0.9, 0.9, w - 2, 12), metal)
    rod.rotation.z = Math.PI / 2
    rod.position.set(0, h - 2.5, z0 + zz)
    g.add(rod)
  }
  bx(g, w * 0.42, h - 4, 1.2, -w * 0.22, 0, z0 + 4, mat('#e9e4da', 0.95))
  bx(g, w * 0.42, h - 6, 1.2, w * 0.22, 2, z0 + 10, mat('#c9d3d6', 0.95))
}

/** 擦手巾環：牆上一個圓環＋掛著的小毛巾，正面朝 +z */
function towelring(g: G, it: FurnitureItem) {
  const { w, d, h } = it
  const z0 = -d / 2
  const metal = mat('#c9ccd0', 0.3, 0.8)
  bx(g, 4, 4, 2, 0, h - 5, z0 + 1, metal)
  const ring = new THREE.Mesh(new THREE.TorusGeometry(w / 2 - 1, 0.6, 8, 32), metal)
  ring.position.set(0, h - w / 2 - 2, z0 + 4)
  g.add(ring)
  bx(g, w * 0.7, h * 0.65, 1.2, 0, h * 0.05, z0 + 4.5, mat('#e9e4da', 0.95))
}

/** 有蓋洗衣籃（布面、可折）：籃身＋上蓋（後側鉸鏈）、側邊提把 */
function hamper(g: G, it: FurnitureItem) {
  const { w, d, h } = it
  const fabric = mat(it.color, 0.95)
  bx(g, w, h - 3, d, 0, 0, 0, fabric)
  bx(g, w + 0.6, 3, d + 0.6, 0, h - 3, 0, mat(shadeHex(it.color, 0.88), 0.9))
  for (const sx of [-1, 1]) bx(g, 0.8, 3, 9, sx * (w / 2 + 0.4), h - 14, 0, mat(shadeHex(it.color, 0.7), 0.8))
}

/** 抽拉式分類垃圾桶（Hailo Tandem 這類）：鋁框上前後兩個桶（前面一般垃圾、後面回收），收在下櫃門片後面 */
function pullbin(g: G, it: FurnitureItem) {
  const { w, d, h } = it
  const frame = mat('#b9bcc0', 0.35, 0.6)
  bx(g, w, 1.5, d, 0, 0, 0, frame)
  for (const sx of [-1, 1]) bx(g, 1, 6, d, (sx * (w - 1)) / 2, 1.5, 0, frame)
  const bd = d / 2 - 1.5
  for (const [sz, col] of [[1, '#4a4d52'], [-1, '#5f7a6a']] as [number, string][]) {
    const z = (sz * (bd + 1.5)) / 2
    bx(g, w - 3, h - 3.5, bd, 0, 1.5, z, mat(col, 0.5))
    bx(g, w - 2.5, 2, bd + 0.5, 0, h - 2, z, mat(shadeHex(col, 1.25), 0.4))
  }
}

/** 隱形門（規劃項目）：門片由牆面那邊畫（會跟著門的開關），這裡只放一個透明的點選框 */
let hitMat: THREE.MeshBasicMaterial | undefined
function hiddendoor(g: G, it: FurnitureItem) {
  hitMat ??= new THREE.MeshBasicMaterial({ transparent: true, opacity: 0, depthWrite: false })
  const m = new THREE.Mesh(new THREE.BoxGeometry(it.w, it.h, it.d), hitMat)
  m.position.y = it.h / 2
  g.add(m)
}

/** 全身鏡（貼在牆面或櫃子側板）：淺橡木細框＋鏡面，正面朝 +z */
function mirror(g: G, it: FurnitureItem) {
  const { w, d, h } = it
  const frame = mat(it.color, 0.55)
  const fw = 1.5
  bx(g, w, h, d * 0.4, 0, 0, -d * 0.3, frame)
  for (const sx of [-1, 1]) bx(g, fw, h, d, (sx * (w - fw)) / 2, 0, 0, frame)
  for (const y of [0, h - fw]) bx(g, w - fw * 2, fw, d, 0, y, 0, frame)
  bx(g, w - fw * 2, h - fw * 2, 0.3, 0, fw, d / 2 - 0.35, mat('#dde4e8', 0.04, 0.35))
}

/** 咖啡櫃：櫃體照櫃內規劃；'outlets' 時檯面上方牆面加兩組雙連插座（磨豆機、咖啡機、奶泡機＋備用） */
function coffeebar(g: G, it: FurnitureItem) {
  interiorCabinet(g, it)
  if (!has(it, 'outlets')) return
  for (const x of [-it.w / 4, it.w / 12]) outletPlate(g, x, it.h + 18, -it.d / 2, 0)
}

/** Dyson 直立式涼風扇（Purifier Cool TP11 造型）：下面圓柱濾網、上面長橢圓出風環；正面（+z）出風，附風向示意 */
function towerfan(g: G, it: FurnitureItem) {
  const { w, h } = it
  const r = w / 2
  const white = mat(it.color, 0.35, 0.3)
  cyl(g, r, r, 4, 0, 0, 0, mat(shadeHex(it.color, 0.9), 0.4, 0.3), 32)
  const bodyH = h * 0.4
  cyl(g, r * 0.95, r * 0.95, bodyH, 0, 4, 0, white, 32)
  cyl(g, r * 0.96, r * 0.96, bodyH * 0.55, 0, 4 + bodyH * 0.2, 0, mat('#8f949a', 0.6, 0.4), 32)
  const loopH = h - bodyH - 4
  const loop = new THREE.Mesh(new THREE.TorusGeometry(r * 0.85, 2.2, 12, 40), white)
  loop.scale.y = loopH / (r * 1.7 + 4.4)
  loop.position.set(0, 4 + bodyH + loopH / 2, 0)
  loop.castShadow = true
  g.add(loop)
  // 出風範圍示意（和冷氣一樣可以用「冷氣出風」開關隱藏）
  const reach = 220
  const geo = new THREE.BufferGeometry()
  const y0 = 4 + bodyH + loopH * 0.25
  const y1 = 4 + bodyH + loopH * 0.75
  geo.setAttribute('position', new THREE.Float32BufferAttribute([-r, y0, 3, r, y0, 3, 55, y0 - 25, reach, -55, y0 - 25, reach, -r, y1, 3, r, y1, 3, 55, y1 + 10, reach, -55, y1 + 10, reach], 3))
  const c = new THREE.Color('#9ad0ff')
  geo.setAttribute('color', new THREE.Float32BufferAttribute([...[0, 1].flatMap(() => [c.r, c.g, c.b, 0.35]), ...[0, 1].flatMap(() => [c.r, c.g, c.b, 0]), ...[0, 1].flatMap(() => [c.r, c.g, c.b, 0.35]), ...[0, 1].flatMap(() => [c.r, c.g, c.b, 0])], 4))
  geo.setIndex([0, 1, 2, 0, 2, 3, 4, 5, 6, 4, 6, 7, 0, 4, 7, 0, 7, 3, 1, 5, 6, 1, 6, 2])
  airflowMat ??= new THREE.MeshBasicMaterial({ vertexColors: true, transparent: true, depthWrite: false, side: THREE.DoubleSide })
  const flow = new THREE.Mesh(geo, airflowMat)
  flow.userData.airflow = true
  flow.raycast = () => {}
  flow.renderOrder = 5
  g.add(flow)
}

/** 外套掛勾（MUJI 壁掛家具 三連掛鉤）：掛勾橫條在最上面，下面畫兩件掛著的外套；背面（-z）貼牆 */
function coathooks(g: G, it: FurnitureItem) {
  const { w, d, h } = it
  if (has(it, 'minihooks')) {
    // 九宏 RD0481 可收折掛勾 × 3：收起來每個只有 2.4 × 7.3、凸出牆面 1.2（磁吸收合），一排、間距 13
    const body = mat(it.color, 0.4)
    for (let i = 0; i < 3; i++) bx(g, 2.4, h, d, (i - 1) * 13, 0, 0, body)
    return
  }
  if (has(it, 'foldhooks')) {
    // MUJI 壁掛家具 三連掛鉤 × 2（上排掛外套、下排掛包包）：掛勾平常收進板子裡，只剩 2.5 cm 厚的木板（板面上看得到掛勾的細縫）
    const z0 = -d / 2
    const oak = mat(it.color, 0.55)
    const slot = mat(shadeHex(it.color, 0.6), 0.6)
    for (const top of [h, h - 30]) {
      bx(g, w, 10, 2.5, 0, top - 10, z0 + 1.25, oak)
      for (let i = 0; i < 3; i++) bx(g, 1.2, 7, 0.2, -w / 2 + (w * (i + 0.5)) / 3, top - 8.5, z0 + 2.6, slot)
    }
    return
  }
  if (has(it, 'ploga')) {
    // IKEA PLOGA 垂直掛鉤架：櫸木直條（高 60、上緣 = h）＋ 5 支和牆平行、可左右滑動的鋁桿
    const z0 = -d / 2
    bx(g, 4.5, 60, 3, 0, h - 60, z0 + 1.5, mat(it.color, 0.55))
    const rodM = mat('#f2f2f0', 0.35, 0.3)
    ;[4, 17, 31, 42, 56].forEach((off, i) => {
      const rod = new THREE.Mesh(new THREE.CylinderGeometry(0.6, 0.6, w - 8, 12), rodM)
      rod.rotation.z = Math.PI / 2
      rod.position.set(i % 2 ? 4 : -4, h - off, z0 + 4.5)
      g.add(rod)
    })
    // 掛著的長大衣（最上面那支）、短外套（中間）、包包（最下面）
    bx(g, 32, 100, 6, -5, h - 104, z0 + 8, mat('#6d6a66', 0.95))
    bx(g, 30, 70, 6, 6, h - 101, z0 + 14, mat('#b89a76', 0.95))
    bx(g, 22, 26, 7, 2, h - 84, z0 + 17.5, mat('#3d3a36', 0.8))
    return
  }
  const bar = mat(it.color, 0.55)
  bx(g, w, 10, 2.5, 0, h - 10, -d / 2 + 1.25, bar)
  for (let i = 0; i < 3; i++) bx(g, 1.6, 1.6, 5, -w / 2 + w * (i + 0.5) / 3, h - 7, -d / 2 + 4, bar)
  // 掛著的外套（深灰、駝色）
  const coat = (x: number, color: string, len: number) => {
    const c = bx(g, 30, len, 7, x, h - 8 - len, -d / 2 + 6, mat(color, 0.95))
    c.rotation.z = 0.02
  }
  coat(-w / 3, '#6d6a66', 78)
  coat(w / 3 - 2, '#b89a76', 68)
}

/** 身高參考人形：頭、身體、手、腳依身高比例（h = 身高），正面朝 +z */
function person(g: G, it: FurnitureItem) {
  const { h } = it
  const skin = mat('#e8c9a8', 0.8)
  const top = mat(it.color, 0.85)
  const bottom = mat(shadeHex(it.color, 0.55), 0.85)
  const hipY = h * 0.52
  const shoulderY = h * 0.815
  const headR = h * 0.063
  const legR = h * 0.036
  for (const sx of [-1, 1]) {
    cyl(g, legR, legR * 0.8, hipY - 3, sx * h * 0.05, 3, 0, bottom, 14)
    bx(g, legR * 2, 3, legR * 3.4, sx * h * 0.05, 0, legR * 0.8, mat('#3a3633', 0.7))
    // 手臂自然下垂，手在大腿旁
    cyl(g, h * 0.026, h * 0.022, h * 0.33, sx * h * 0.135, shoulderY - h * 0.33, 0, top, 12)
    const hand = new THREE.Mesh(new THREE.SphereGeometry(h * 0.028, 14, 10), skin)
    hand.position.set(sx * h * 0.135, shoulderY - h * 0.35, 0)
    hand.castShadow = true
    g.add(hand)
  }
  const torso = cyl(g, h * 0.1, h * 0.085, shoulderY - hipY, 0, hipY, 0, top, 20)
  torso.scale.z = 0.55
  cyl(g, h * 0.022, h * 0.024, h * 0.05, 0, shoulderY, 0, skin, 12)
  const head = new THREE.Mesh(new THREE.SphereGeometry(headR, 22, 16), skin)
  head.position.set(0, h - headR, 0)
  head.castShadow = true
  g.add(head)
  const hair = new THREE.Mesh(new THREE.SphereGeometry(headR * 1.04, 22, 16, 0, Math.PI * 2, 0, Math.PI * 0.5), mat('#2e2a27', 0.9))
  hair.position.set(0, h - headR, -headR * 0.08)
  g.add(hair)
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
  coffeebar,
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
  ecooker,
  grinder,
  frother,
  canisters,
  mirror,
  pullbin,
  mirrorcab,
  hiddendoor,
  wallshelf,
  hamper,
  towelbar,
  towelring,
  person,
  coathooks,
  towerfan,
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
