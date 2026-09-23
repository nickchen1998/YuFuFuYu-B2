import * as THREE from 'three'
import type { FurnitureItem } from '../types'
import { mat, glassMat, shadeHex } from './mats'
import { hashStr } from './textures'

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

function island(g: G, it: FurnitureItem) {
  cabinet(g, { ...it, h: it.h - 4 }, 'doors')
  bx(g, it.w + 4, 4, it.d + 16, 0, it.h - 4, 6, mat('#dedbd5', 0.3))
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

function bookshelf(g: G, it: FurnitureItem) {
  const { w, d, h } = it
  const m = mat(it.color, 0.6)
  const t = 2
  bx(g, t, h, d, -w / 2 + t / 2, 0, 0, m)
  bx(g, t, h, d, w / 2 - t / 2, 0, 0, m)
  bx(g, w, t, d, 0, h - t, 0, m)
  bx(g, w, 6, d, 0, 0, 0, m)
  bx(g, w, h, 1, 0, 0, -d / 2 + 0.5, m)
  const rand = rng(hashStr(it.id))
  const colors = ['#7a4b3a', '#355c7d', '#c06c84', '#6c8f5c', '#e0c28c', '#3d3d3d', '#b6a58c', '#8c6a9a']
  const shelves = Math.max(2, Math.floor((h - 6) / 36))
  const sh = (h - 6 - t) / shelves
  for (let i = 0; i < shelves; i++) {
    const y = 6 + i * sh
    if (i > 0) bx(g, w - t * 2, t, d - 1, 0, y - t, 0.5, m)
    let x = -w / 2 + t + 1
    const limit = w / 2 - t - 1 - (rand() * w) / 3
    while (x < limit) {
      const bw = 2 + rand() * 3
      const bh = Math.min(sh - 5, 18 + rand() * 12)
      bx(g, bw, bh, d * 0.75, x + bw / 2, y, 0, mat(colors[Math.floor(rand() * colors.length)], 0.8))
      x += bw + 0.3
    }
  }
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
  // 壁面、吊櫃、抽油煙機
  bx(g, w, 61, 1.5, 0, h, -d / 2 + 0.75, mat('#ebe8e3', 0.3))
  const upperD = 35
  bx(g, w, 70, upperD, 0, 150, -d / 2 + upperD / 2, mat(it.color, 0.6))
  const line = mat(shadeHex(it.color, 0.55), 0.8)
  const n = Math.round(w / 45)
  for (let i = 1; i < n; i++) bx(g, 0.6, 68, 0.4, -w / 2 + (i * w) / n, 151, -d / 2 + upperD + 0.2, line)
  bx(g, 75, 14, 50, -w / 2 + 45, 136, -d / 2 + 25, mat('#b9bcc0', 0.3, 0.7))
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

function plainBox(g: G, it: FurnitureItem) {
  bx(g, it.w, it.h, it.d, 0, 0, 0, mat(it.color, 0.7))
}

const builders: Record<string, (g: G, it: FurnitureItem) => void> = {
  bed,
  wardrobe: (g, it) => cabinet(g, it, 'doors'),
  cabinet: (g, it) => cabinet(g, it, 'doors'),
  nightstand: (g, it) => cabinet(g, it, 'drawers', true),
  tvstand: (g, it) => cabinet(g, it, 'drawers', true),
  island,
  desk,
  table,
  roundtable,
  chair,
  sofa,
  coffeetable,
  tv,
  rug,
  bookshelf,
  plant,
  lamp,
  fridge,
  washer,
  kitchen,
  toilet,
  vanity,
  shower,
  acunit,
  box: plainBox,
}

/** 會影響模型外觀的欄位（改了就要重建模型） */
export function furnitureSignature(it: FurnitureItem) {
  return `${it.type}|${it.w}|${it.d}|${it.h}|${it.color}`
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
