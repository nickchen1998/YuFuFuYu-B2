import * as THREE from 'three'
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js'
import type { CabinetFace, CabinetPart, FurnitureItem } from '../types'
import {
  BACK, DOOR, PANEL, STONE, cabinetFrame, faceDepths, frontPieces, frontRect, interiorOf, layoutFace, peninsulaStorageLen,
  type CabFrame,
} from '../cabinet'
import { frostedMat, glassMat, mat, shadeHex } from './mats'
import { hashStr } from './textures'

// 依「櫃內規劃」建出櫃子：櫃體（側板、底板、頂板、背板、立板、層板）＋門片＋櫃內物品示意。
// 門片群組標 userData.front、門後物品標 userData.interior，Viewer 依「打開櫃門」切換顯示；
// 開放格裡的東西一直看得到。

type G = THREE.Object3D
const T = PANEL

function box(g: G, w: number, h: number, d: number, x: number, y: number, z: number, m: THREE.Material) {
  const mesh = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), m)
  mesh.position.set(x, y + h / 2, z)
  mesh.castShadow = true
  mesh.receiveShadow = true
  g.add(mesh)
  return mesh
}

function rng(seed: number) {
  let s = seed % 2147483647 || 1
  return () => {
    s = (s * 16807) % 2147483647
    return (s - 1) / 2147483646
  }
}

const clamp = (v: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, v))

let vcMat: THREE.MeshStandardMaterial | null = null
const vertexMat = () => (vcMat ??= new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.85 }))

/** 把很多小方塊合成一個網格（衣服、書本、鞋子數量很多，一個一個建會太重） */
class Batch {
  private geos: THREE.BufferGeometry[] = []

  private push(geo: THREE.BufferGeometry, color: string) {
    const c = new THREE.Color(color)
    const n = geo.attributes.position.count
    const a = new Float32Array(n * 3)
    for (let i = 0; i < n; i++) a.set([c.r, c.g, c.b], i * 3)
    geo.setAttribute('color', new THREE.BufferAttribute(a, 3))
    this.geos.push(geo)
  }

  /** 方塊：(x, z) = 中心、y = 底面 */
  box(w: number, h: number, d: number, x: number, y: number, z: number, color: string) {
    if (w <= 0.05 || h <= 0.05 || d <= 0.05) return
    const g = new THREE.BoxGeometry(w, h, d)
    g.translate(x, y + h / 2, z)
    this.push(g, color)
  }

  /** 橫桿：沿 x 或 z 方向，(x, y, z) = 中心 */
  rod(r: number, len: number, axis: 'x' | 'z', x: number, y: number, z: number, color: string) {
    if (len <= 0.1) return
    const g = new THREE.CylinderGeometry(r, r, len, 10)
    if (axis === 'x') g.rotateZ(Math.PI / 2)
    else g.rotateX(Math.PI / 2)
    g.translate(x, y, z)
    this.push(g, color)
  }

  /** 直立圓柱：y = 底面 */
  jar(r: number, h: number, x: number, y: number, z: number, color: string) {
    if (h <= 0.1) return
    const g = new THREE.CylinderGeometry(r, r, h, 14)
    g.translate(x, y + h / 2, z)
    this.push(g, color)
  }

  flush(parent: G, hidden: boolean) {
    if (!this.geos.length) return
    const merged = mergeGeometries(this.geos, false)
    for (const g of this.geos) g.dispose()
    this.geos = []
    if (!merged) return
    const m = new THREE.Mesh(merged, vertexMat())
    m.castShadow = false
    m.receiveShadow = true
    if (hidden) m.userData.interior = true
    parent.add(m)
  }
}

const CLOTH = ['#5b6770', '#a3b1bd', '#d9cbb5', '#7d5a50', '#e8e4dc', '#4a5a4a', '#b77b68', '#2f3b4a', '#c9b8d8', '#8c9a78', '#f2efe8']
const DENIM = ['#3e5470', '#2f3e52', '#58708f', '#7b8794', '#3a3a3d']
const GOODS = ['#d8cfc0', '#b9c4cc', '#e6dccb', '#9aa7a0', '#c9a98a', '#f0ebe2', '#c7b299', '#a9b7c2']
const BOOKS = ['#7a4b3a', '#355c7d', '#c06c84', '#6c8f5c', '#e0c28c', '#3d3d3d', '#b6a58c', '#8c6a9a', '#d9d2c3', '#44607a', '#a8553f']
const SHOES = ['#2f2f31', '#e9e6e0', '#7b5b44', '#3f4d63', '#b9b1a5', '#8a2f2f']
const BEDDING = ['#f4f1ea', '#e5e8ec', '#efe3d6', '#dfe6dc']
const BOXES = ['#e8e6e1', '#d9d4ca', '#cfd6dc', '#e2d8c8']
const ROD = '#a9adb2'
const HANGER = '#8f7a63'
const TRAY = '#efe9df'
const STEEL = '#b5b8bc'
const WIRE = '#9ea2a7'

const hasF = (it: FurnitureItem, f: string) => (it.features ?? []).includes(f)
/** 拉門片數：每片約 80～85 寬 */
export const slidingPanels = (w: number) => Math.max(2, Math.round(w / 85))

interface Cell {
  /** 左緣、寬、底面高度、淨高、淨深（z 從 -D/2 到 D/2，正面 +z） */
  x0: number
  w: number
  y0: number
  h: number
  D: number
}

/** 一格裡的東西（示意） */
function contents(b: Batch, part: CabinetPart, c: Cell, clothes: boolean, rand: () => number, metal = false) {
  const pick = (a: string[]) => a[Math.floor(rand() * a.length)]
  const xc = c.x0 + c.w / 2
  const back = -c.D / 2
  const label = part.label ?? ''
  switch (part.kind) {
    case 'hang': {
      const rodY = c.y0 + c.h - 5
      b.rod(1.1, c.w - 0.4, 'x', xc, rodY, 0, ROD)
      const long = c.h >= 115
      const gw = Math.min(44, c.D - 6)
      const end = c.x0 + c.w - 3 - c.w * (0.08 + rand() * 0.25)
      for (let x = c.x0 + 3; x < end; ) {
        const t = 2 + rand() * 3
        const len = Math.min(long ? 95 + rand() * 32 : 55 + rand() * 25, c.h - 12)
        b.box(0.6, 3, gw * 0.8, x + t / 2, rodY - 4, 0, HANGER)
        b.box(t, len, gw, x + t / 2, rodY - 4 - len, 0, pick(CLOTH))
        x += t + 1 + rand() * 1.6
      }
      break
    }
    case 'pullrod': {
      const rodY = c.y0 + c.h - 5
      b.rod(1, c.D - 4, 'z', xc, rodY, 0, ROD)
      const gw = Math.min(42, c.w - 6)
      const long = c.h >= 115
      const end = c.D / 2 - 3 - rand() * 6
      for (let z = back + 3; z < end; ) {
        const t = 2 + rand() * 2.5
        const len = Math.min(long ? 80 + rand() * 30 : 55 + rand() * 20, c.h - 12)
        b.box(gw * 0.8, 3, 0.6, xc, rodY - 4, z + t / 2, HANGER)
        b.box(gw, len, t, xc, rodY - 4 - len, z + t / 2, pick(CLOTH))
        z += t + 1.2 + rand() * 1.4
      }
      break
    }
    case 'shelf': {
      if (clothes) {
        // 摺好的衣服一疊一疊
        const ns = Math.max(1, Math.floor((c.w - 2) / 30))
        const sw = Math.min(28, (c.w - 2) / ns - 2)
        const sd = Math.min(32, c.D - 4)
        for (let i = 0; i < ns; i++) {
          if (rand() < 0.12) continue
          const cx = c.x0 + 1 + ((i + 0.5) * (c.w - 2)) / ns
          const top = c.y0 + Math.min(c.h - 5, 10 + rand() * 20)
          for (let y = c.y0; y < top; ) {
            const lh = 3.5 + rand() * 2
            b.box(sw - rand() * 2, lh, sd - rand() * 3, cx + (rand() - 0.5) * 1.5, y, back + sd / 2 + 1, pick(CLOTH))
            y += lh
          }
        }
      } else {
        // 罐子、盒子
        for (let x = c.x0 + 1.5; x < c.x0 + c.w - 6; ) {
          const r = rand()
          if (r < 0.35) {
            const rad = 3 + rand() * 3
            if (x + rad * 2 > c.x0 + c.w - 1) break
            b.jar(rad, Math.min(c.h - 3, 8 + rand() * 14), x + rad, c.y0, back + rad + 2 + rand() * 4, pick(GOODS))
            x += rad * 2 + 1.5
          } else if (r < 0.85) {
            const bw = Math.min(8 + rand() * 16, c.x0 + c.w - 1 - x)
            const bd = Math.min(c.D - 4, 12 + rand() * 20)
            b.box(bw, Math.min(c.h - 3, 6 + rand() * 20), bd, x + bw / 2, c.y0, back + bd / 2 + 1, pick(GOODS))
            x += bw + 1.5
          } else x += 6 + rand() * 10
        }
      }
      break
    }
    case 'books': {
      const end = c.x0 + c.w - 0.5 - (rand() < 0.45 ? rand() * c.w * 0.3 : 0)
      for (let x = c.x0 + 0.5; x < end; ) {
        if (rand() < 0.05) {
          x += 4 + rand() * 6
          continue
        }
        const bw = 1.6 + rand() * 2.6
        if (x + bw > end) break
        const bd = Math.min(c.D - 2, 14 + rand() * 8)
        b.box(bw, Math.min(c.h - 1.5, 18 + rand() * 11), bd, x + bw / 2, c.y0, back + bd / 2 + 1, pick(BOOKS))
        x += bw + 0.1
      }
      break
    }
    case 'drawer': {
      const th = Math.min(c.h - 2, 15)
      const dw = c.w - 1.6
      const dd = c.D - 3
      const zc = 0.5
      // 木抽屜；鋼管衣櫃改成金屬網籃
      const tray = metal ? WIRE : TRAY
      b.box(dw, 0.8, dd, xc, c.y0 + 0.4, zc, tray)
      b.box(0.8, th, dd, c.x0 + 1.2, c.y0 + 0.4, zc, tray)
      b.box(0.8, th, dd, c.x0 + c.w - 1.2, c.y0 + 0.4, zc, tray)
      b.box(dw, th, 0.8, xc, c.y0 + 0.4, zc - dd / 2 + 0.4, tray)
      b.box(dw, th, 0.8, xc, c.y0 + 0.4, zc + dd / 2 - 0.4, tray)
      const n = 3 + Math.floor(rand() * 5)
      for (let i = 0; i < n; i++) {
        const iw = Math.min(5 + rand() * 9, dw - 3)
        const id = Math.min(6 + rand() * 10, dd - 3)
        const ix = c.x0 + 2 + iw / 2 + rand() * Math.max(0, c.w - 4 - iw)
        const iz = zc - dd / 2 + 1.5 + id / 2 + rand() * Math.max(0, dd - 3 - id)
        b.box(iw, Math.min(th - 2, 2 + rand() * 5), id, ix, c.y0 + 1.2, iz, pick(clothes ? CLOTH : GOODS))
      }
      break
    }
    case 'shoe': {
      const pairs = Math.max(1, Math.floor((c.w - 2) / 20))
      const pitch = (c.w - 2) / pairs
      const sd = Math.min(28, c.D - 3)
      for (let i = 0; i < pairs; i++) {
        if (rand() < 0.12) continue
        const px = c.x0 + 1 + pitch * (i + 0.5)
        const col = pick(SHOES)
        const boot = c.h >= 25 && i === 0
        const sh = boot ? Math.min(c.h - 3, 30) : Math.min(c.h - 3, 8 + rand() * 4)
        for (const s of [-1, 1]) {
          b.box(8, sh, sd * 0.5, px + s * 4.6, c.y0, back + 1 + sd * 0.25, col)
          b.box(8, Math.min(sh, 9) * 0.6, sd * 0.5, px + s * 4.6, c.y0, back + 1 + sd * 0.75, col)
        }
      }
      break
    }
    case 'pants': {
      const railY = c.y0 + c.h - 6
      b.box(1.5, 1.5, c.D - 4, c.x0 + 2.5, railY, 0, ROD)
      b.box(1.5, 1.5, c.D - 4, c.x0 + c.w - 2.5, railY, 0, ROD)
      const nb = Math.max(2, Math.floor((c.D - 8) / 6))
      const len = Math.min(c.h - 12, 38)
      for (let i = 0; i < nb; i++) {
        const z = back + 4 + ((i + 0.5) * (c.D - 8)) / nb
        b.rod(0.5, c.w - 5, 'x', xc, railY + 0.75, z, ROD)
        if (rand() < 0.85) b.box(c.w - 14, len, 1.2, xc, railY - len, z, pick(DENIM))
      }
      break
    }
    case 'storage': {
      if (label.includes('橫躺')) {
        // 行李箱橫躺疊放：28 吋（約 76 × 50 × 30）在下，登機箱（約 55 × 38 × 23）疊在上面；側邊提把朝外
        const stack: [number, number, number, string][] = []
        if (label.includes('28')) stack.push([Math.min(c.w - 4, 76), 30, Math.min(c.D - 6, 50), '#3b4652'])
        const carry = label.includes('×2') ? 2 : label.includes('登機') ? 1 : 0
        for (let i = 0; i < carry; i++) stack.push([Math.min(c.w - 6, 55), 23, Math.min(c.D - 8, 38), i ? '#5d6f7d' : '#9c6b4e'])
        let y = c.y0
        for (const [sw, sh, sd, col] of stack) {
          if (y + sh > c.y0 + c.h) break
          b.box(sw, sh, sd, xc, y, back + sd / 2 + 2, col)
          b.box(14, 2.5, 2, xc, y + sh / 2 - 1.25, back + sd + 3, '#222428')
          y += sh + 0.3
        }
      } else if (label.includes('行李') || label.includes('登機')) {
        const big = c.h >= 60 && !label.includes('登機')
        if (big) {
          const sw = Math.min(c.w - 6, 48)
          const sh = Math.min(c.h - 3, 72)
          const sd = Math.min(c.D - 6, 30)
          b.box(sw, sh, sd, xc, c.y0, back + sd / 2 + 3, '#3b4652')
          b.box(14, 2, 3, xc, c.y0 + sh, back + sd / 2 + 3, '#222428')
        } else if (label.includes('×2') && c.h >= 58 && c.w >= 50) {
          // 兩個登機箱直立並排（每個約 23 寬 × 35 深 × 55 高）
          for (const s of [-1, 1]) {
            const x = xc + s * 12.5
            b.box(22, 55, 35, x, c.y0, back + 19.5, s < 0 ? '#9c6b4e' : '#5d6f7d')
            b.box(10, 2, 3, x, c.y0 + 55, back + 19.5, '#222428')
          }
        } else {
          const sw = Math.min(c.w - 6, 36)
          const sd = Math.min(c.D - 4, 55)
          b.box(sw, Math.min(c.h - 3, 23), sd, xc, c.y0, back + sd / 2 + 2, '#9c6b4e')
        }
      } else if (label.includes('被') || label.includes('枕')) {
        const layers = 2 + Math.floor(rand() * 2)
        let y = c.y0
        for (let i = 0; i < layers; i++) {
          const lh = Math.min((c.h - 4) / layers, 14 + rand() * 8)
          b.box(c.w - 5 - rand() * 3, lh, c.D - 8, xc, y, 0, pick(BEDDING))
          y += lh
        }
      } else {
        const n = Math.max(1, Math.round((c.w - 2) / 38))
        const bw = (c.w - 2) / n - 2
        const bh = Math.min(c.h - 3, 24 + rand() * 6)
        const bd = Math.min(c.D - 4, 45)
        const stacks = c.h > bh * 2 + 6 ? 2 : 1
        for (let s = 0; s < stacks; s++)
          for (let i = 0; i < n; i++) {
            if (s > 0 && rand() < 0.4) continue
            b.box(bw, bh, bd, c.x0 + 1 + ((i + 0.5) * (c.w - 2)) / n, c.y0 + s * (bh + 0.5), back + bd / 2 + 1.5, pick(BOXES))
          }
      }
      break
    }
    case 'mugs': {
      // 星巴克 BTS 杯：Ø9.5 × 高 8.9，把手在右側；一疊最多 3 個，單排排在前面
      const stacks = Math.max(1, Math.floor((c.w - 2) / 14.5))
      const pitch = (c.w - 2) / stacks
      const levels = Math.min(3, Math.floor((c.h - 2) / 8.9))
      const MUG = ['#f4f2ee', '#f7f5f1', '#efece6']
      const BAND = ['#3f6f8f', '#c0503f', '#5c8a5a', '#d7a64a', '#7b5ea8', '#2f4f6f', '#c77b8a']
      const z = c.D / 2 - 7
      for (let i = 0; i < stacks; i++) {
        const cx = c.x0 + 1 + pitch * (i + 0.5) - 1.8
        const n = rand() < 0.2 ? levels - 1 : levels
        for (let k = 0; k < n; k++) {
          const y = c.y0 + k * 8.95
          b.jar(4.75, 8.9, cx, y, z, pick(MUG))
          b.jar(4.8, 2.6, cx, y + 3.2, z, pick(BAND))
          b.box(1.2, 5.5, 1.6, cx + 5.4, y + 1.8, z, pick(MUG))
        }
      }
      break
    }
    case 'appliance': {
      if (label.includes('抽拉')) {
        // 電器抽拉層板：托盤＋兩側滑軌（上面的電鍋、氣炸鍋是另外的家具）
        b.box(c.w - 2, 1.5, c.D - 1, xc, c.y0, 0.5, TRAY)
        for (const s of [-1, 1]) b.box(1, 3.5, c.D - 2, xc + s * (c.w / 2 - 0.6), c.y0, 0.5, ROD)
        b.box(c.w - 2, 4, 1, xc, c.y0 + 1.5, c.D / 2 - 0.5, TRAY)
        break
      }
      const front = c.D / 2 + DOOR
      if (label.includes('微波')) {
        const aw = c.w - 0.6
        const ah = Math.min(c.h - 0.4, 38)
        const ad = Math.min(c.D, 40)
        b.box(aw, ah, ad, xc, c.y0, front - ad / 2, '#c7cace')
        b.box(aw * 0.66, ah - 7, 0.4, xc - aw * 0.12, c.y0 + 3.5, front + 0.2, '#14171b')
        b.box(aw * 0.18, ah - 7, 0.4, xc + aw / 2 - aw * 0.11 - 1, c.y0 + 3.5, front + 0.2, '#2b2f34')
        break
      }
      let y = c.y0
      if (label.includes('印表')) {
        const pw = Math.min(c.w - 4, 42)
        const ph = Math.min(c.h - 3, 24)
        const pd = Math.min(c.D - 3, 36)
        b.box(pw, ph, pd, xc, y, back + pd / 2 + 1, '#e9e9e7')
        b.box(pw * 0.7, 1.2, 1.5, xc, y + ph * 0.35, back + pd + 1.6, '#555a60')
        y += ph
      }
      if (label.includes('分享') || label.includes('路由') || label.includes('網路')) {
        if (c.y0 + c.h - y > 16) {
          const rw = Math.min(22, c.w - 6)
          b.box(rw, 3.5, 14, c.x0 + 3 + rw / 2, y, back + 9, '#2e3136')
          for (const s of [-1, 1]) b.box(0.8, 11, 0.8, c.x0 + 3 + rw / 2 + s * (rw / 2 - 2), y + 3.5, back + 3, '#2e3136')
        }
      }
      if (label.includes('遊戲') && c.w > 58) b.box(28, Math.min(c.h - 3, 7), 24, c.x0 + c.w - 16, c.y0, back + 13, '#f3f3f1')
      if (y === c.y0 && !label.match(/分享|路由|網路|遊戲/)) b.box(c.w - 4, c.h - 4, c.D - 4, xc, c.y0, 0, '#d0d3d6')
      break
    }
    default:
      break
  }
}

/** 一個正面：立板、層板、門片、櫃內物品。群組原點在這一面淨空間的中心，+z = 正面 */
function buildFace(fg: G, it: FurnitureItem, face: CabinetFace, fr: CabFrame, D: number, fi: number) {
  const fl = layoutFace(face, fr.innerW, fr.innerH)
  const x0 = -fr.innerW / 2
  const body = mat(it.color, 0.6)
  const clothes = it.type === 'wardrobe'
  const steel = hasF(it, 'steel')
  const shelfM = steel ? mat(STEEL, 0.35, 0.7) : body
  const hidden = new Batch()
  const shown = new Batch()
  for (const c of fl.cols) {
    const cx0 = x0 + c.x
    if (c.i > 0 && !steel) box(fg, T, fr.innerH, D, cx0 - T / 2, fr.y0, 0, body)
    for (const p of c.parts) {
      const py = fr.y0 + p.y
      if (p.i > 0) {
        const prev = c.parts[p.i - 1].part
        const drawers = prev.kind === 'drawer' && p.part.kind === 'drawer' && (steel || (prev.front === 'drawer' && p.part.front === 'drawer'))
        // 鋼管衣櫃：層板改成細的金屬層板
        if (!drawers) {
          if (steel) box(fg, c.w, 1.2, D - 4, cx0 + c.w / 2, py - 1.2, 0, shelfM)
          else box(fg, c.w, T, D, cx0 + c.w / 2, py - T, 0, body)
        }
      }
      const rand = rng(hashStr(`${it.id}:${fi}:${c.i}:${p.i}:${p.part.kind}:${p.part.label ?? ''}`))
      const visible = p.part.front === 'open' || p.part.front === 'glass'
      contents(visible ? shown : hidden, p.part, { x0: cx0, w: c.w, y0: py, h: p.h, D }, clothes, rand, steel)
    }
  }
  hidden.flush(fg, true)
  shown.flush(fg, false)

  // 門片與抽屜面板：深色底板露出縫隙當分隔線
  const fronts = new THREE.Group()
  fronts.userData.front = true
  fg.add(fronts)
  const doorM = mat(it.color, 0.55)
  const seamM = mat(shadeHex(it.color, 0.5), 0.8)
  const metal = mat('#9d9fa2', 0.35, 0.8)
  const gap = 0.35
  const zDoor = D / 2 + 0.3
  const zFace = D / 2 + DOOR
  for (const piece of frontPieces(fl)) {
    const r = frontRect(fl, piece, fr)
    const fx0 = x0 + r.x0
    const fx1 = x0 + r.x1
    const fy0 = fr.y0 + r.y0
    const fy1 = fr.y0 + r.y1
    const fw = fx1 - fx0
    const fh = fy1 - fy0
    if (piece.kind !== 'glass') box(fronts, fw, fh, 0.3, (fx0 + fx1) / 2, fy0, D / 2 + 0.15, seamM)
    const leafW = fw / piece.leaves
    for (let k = 0; k < piece.leaves; k++) {
      const lx0 = fx0 + k * leafW + gap
      const lx1 = fx0 + (k + 1) * leafW - gap
      if (piece.kind === 'glass') {
        // 玻璃門：木框＋玻璃，關著也看得到裡面
        const lw = lx1 - lx0
        const lh = fh - gap * 2
        const fz = zDoor + (DOOR - 0.3) / 2
        const fw2 = 3
        for (const sx of [-1, 1]) box(fronts, fw2, lh, DOOR - 0.3, (lx0 + lx1) / 2 + sx * (lw / 2 - fw2 / 2), fy0 + gap, fz, doorM)
        for (const y of [fy0 + gap, fy0 + gap + lh - fw2]) box(fronts, lw - fw2 * 2, fw2, DOOR - 0.3, (lx0 + lx1) / 2, y, fz, doorM)
        const pane = box(fronts, lw - fw2 * 2, lh - fw2 * 2, 0.4, (lx0 + lx1) / 2, fy0 + gap + fw2, fz, glassMat())
        pane.castShadow = false
      } else box(fronts, lx1 - lx0, fh - gap * 2, DOOR - 0.3, (lx0 + lx1) / 2, fy0 + gap, zDoor + (DOOR - 0.3) / 2, doorM)
      if (piece.kind === 'drawer') {
        const hw = Math.min(16, fw / 3)
        box(fronts, hw, 1.2, 1.6, (fx0 + fx1) / 2, fy1 - Math.min(5, fh * 0.3) - 0.6, zFace + 0.8, metal)
      } else {
        const handleRight = piece.leaves === 2 ? k === 0 : piece.hinge === 'l'
        const hx = handleRight ? lx1 - 3.5 : lx0 + 3.5
        const hh = fh > 120 ? 24 : Math.min(12, fh * 0.35)
        const hy = clamp(100, fy0 + 5, Math.max(fy0 + 5, fy1 - 5 - hh))
        box(fronts, 1.2, hh, 1.6, hx, hy, zFace + 0.8, metal)
      }
    }
  }
}

/** 一般單面櫃（衣櫃、鞋櫃、書櫃、電視櫃、床頭櫃、咖啡櫃…），正面朝 +z */
export function interiorCabinet(g: G, it: FurnitureItem) {
  const inter = interiorOf(it)
  const fr = cabinetFrame(it)
  const [dp] = faceDepths(it, { faces: [inter.faces[0]] })
  const { w, d, h, base } = fr
  const body = mat(it.color, 0.6)
  const edge = mat(shadeHex(it.color, 0.55), 0.8)
  if (fr.legs && hasF(it, 'prettylegs')) {
    // 美腿：實木錐形腳（上粗下細、微微外八），寬的櫃子中間多一對
    const oak = mat('#b8946a', 0.55)
    const xs = w > 120 ? [-(w / 2 - 7), 0, w / 2 - 7] : [-(w / 2 - 7), w / 2 - 7]
    for (const x of xs)
      for (const sz of [-1, 1]) {
        const leg = new THREE.Mesh(new THREE.CylinderGeometry(2.3, 1.3, base, 14), oak)
        leg.position.set(x, base / 2, sz * (d / 2 - 7))
        leg.rotation.z = x === 0 ? 0 : Math.sign(x) * -0.06
        leg.rotation.x = sz * 0.06
        leg.castShadow = true
        g.add(leg)
      }
  } else if (fr.legs) {
    const dark = mat('#2f3033', 0.6)
    for (const sx of [-1, 1]) for (const sz of [-1, 1]) box(g, 3, base, 3, sx * (w / 2 - 5), 0, sz * (d / 2 - 5), dark)
  } else if (base > 0) box(g, w - 2, base, d - 6, 0, 0, -3, edge)
  if ((it.features ?? []).includes('floating') && it.name.includes('鞋') && it.elev > 8) {
    // 懸空鞋櫃底下的室內拖鞋（地面在 -elev）
    const b = new Batch()
    const COLORS = ['#d8cfc0', '#8f9aa3', '#c9a98a', '#e8e4dc']
    const pairs = Math.max(1, Math.floor((w - 6) / 22))
    for (let i = 0; i < pairs; i++) {
      const px = -w / 2 + 3 + ((i + 0.5) * (w - 6)) / pairs
      for (const s of [-1, 1]) b.box(9, 3.5, 26, px + s * 5, -it.elev, 1, COLORS[i % COLORS.length])
    }
    b.flush(g, false)
  }
  const sliding = hasF(it, 'sliding')
  if (hasF(it, 'steel')) {
    // 鋼管衣櫃：不鎖木板，立管落地頂天（前後兩排），上下橫管；前面留 8 cm 給拉門軌道
    const steel = mat(STEEL, 0.35, 0.7)
    const front = sliding ? 8 : 0
    const zb = -d / 2 + 4
    const zf = d / 2 - front - 4
    const L = layoutFace(inter.faces[0], fr.innerW, fr.innerH)
    const xs = [-w / 2 + 2, ...L.cols.slice(1).map((c) => -fr.innerW / 2 + c.x - T / 2), w / 2 - 2]
    for (const x of xs) for (const z of [zb, zf]) cylY(g, 1.3, h, x, 0, z, steel)
    for (const y of [3, h - 4]) for (const z of [zb, zf]) cylX(g, 1.1, w - 4, 0, y, z, steel)
    const clear = d - front - BACK
    const fg = new THREE.Group()
    fg.position.z = -d / 2 + BACK + clear / 2
    g.add(fg)
    buildFace(fg, it, inter.faces[0], fr, clear, 0)
  } else {
    const cd = d - DOOR
    const cz = -DOOR / 2
    for (const sx of [-1, 1]) box(g, T, h - base, cd, sx * (w / 2 - T / 2), base, cz, body)
    box(g, w - T * 2, T, cd, 0, base, cz, body)
    if (fr.top === 'panel') box(g, w - T * 2, T, cd, 0, h - T, cz, body)
    else if (fr.top === 'stone') box(g, w + 1, STONE, d + 1, 0, h - STONE, 0.5, mat('#dcd8d1', 0.3))
    box(g, w - T * 2, fr.innerH, BACK, 0, fr.y0, -d / 2 + BACK / 2, mat(shadeHex(it.color, 0.93), 0.75))
    const fg = new THREE.Group()
    fg.position.z = -d / 2 + BACK + dp.clear / 2
    g.add(fg)
    buildFace(fg, it, inter.faces[0], fr, dp.clear, 0)
  }
  if (sliding) slidingDoors(g, it, w, d, h)
}

/** 整面落地頂天拉門：上吊式軌道，前後兩軌交錯，鋁框＋霧面玻璃（門片群組標 front，打開櫃門時隱藏） */
function slidingDoors(g: G, it: FurnitureItem, w: number, d: number, h: number) {
  const doors = new THREE.Group()
  doors.userData.front = true
  g.add(doors)
  const n = slidingPanels(w)
  const overlap = 4
  const pw = (w + overlap * (n - 1)) / n
  const frame = mat('#d9dbdd', 0.35, 0.6)
  box(doors, w, 4, 8, 0, h - 4, d / 2 - 4, mat('#9fa3a8', 0.4, 0.6))
  for (let i = 0; i < n; i++) {
    const x = -w / 2 + pw / 2 + i * (pw - overlap)
    const z = d / 2 - (i % 2 === 0 ? 2 : 5.5)
    const ph = h - 6
    const f = 3.5
    for (const sx of [-1, 1]) box(doors, f, ph, 2.4, x + sx * (pw / 2 - f / 2), 1, z, frame)
    // 門高約 294，已接近鋁框上限，中間加一支橫條補強
    for (const y of [1, 1 + ph - f, 1 + ph * 0.52]) box(doors, pw - f * 2, f, 2.4, x, y, z, frame)
    const pane = box(doors, pw - f * 2, ph - f * 2, 0.5, x, 1 + f, z, frostedMat())
    pane.castShadow = false
    box(doors, 1.2, 30, 1.2, x + (i % 2 === 0 ? 1 : -1) * (pw / 2 - f - 3), 95, z + 1.6, frame)
  }
}

function cylY(g: G, r: number, h: number, x: number, y: number, z: number, m: THREE.Material) {
  const mesh = new THREE.Mesh(new THREE.CylinderGeometry(r, r, h, 12), m)
  mesh.position.set(x, y + h / 2, z)
  mesh.castShadow = true
  g.add(mesh)
}
function cylX(g: G, r: number, len: number, x: number, y: number, z: number, m: THREE.Material) {
  const mesh = new THREE.Mesh(new THREE.CylinderGeometry(r, r, len, 12), m)
  mesh.rotation.z = Math.PI / 2
  mesh.position.set(x, y, z)
  g.add(mesh)
}

/** 半島型中島的收納段（-x 端）：兩面櫃，第一面朝 -z（廚房）、第二面朝 +z（走道） */
export function peninsulaStorage(g: G, it: FurnitureItem) {
  const inter = interiorOf(it)
  const fr = cabinetFrame(it)
  const depths = faceDepths(it, inter)
  const ls = peninsulaStorageLen(it)
  const { d } = it
  const body = mat(it.color, 0.6)
  const edge = mat(shadeHex(it.color, 0.55), 0.8)
  const sx0 = -it.w / 2
  const scx = sx0 + ls / 2
  box(g, ls - 2, fr.base, d - 8, scx, 0, 0, edge)
  const cd = d - DOOR * 2
  for (const x of [sx0 + T / 2, sx0 + ls - T / 2]) box(g, T, fr.h - fr.base, cd, x, fr.base, 0, body)
  box(g, ls - T * 2, T, cd, scx, fr.base, 0, body)
  if (inter.faces.length > 1) box(g, ls - T * 2, fr.innerH, T, scx, fr.y0, -d / 2 + depths[0].depth + T / 2, body)
  else box(g, ls - T * 2, fr.innerH, BACK, scx, fr.y0, d / 2 - BACK / 2, body)
  const f0 = new THREE.Group()
  f0.rotation.y = Math.PI
  f0.position.set(scx, 0, -d / 2 + DOOR + depths[0].clear / 2)
  g.add(f0)
  buildFace(f0, it, inter.faces[0], fr, depths[0].clear, 0)
  if (inter.faces[1]) {
    const f1 = new THREE.Group()
    f1.position.set(scx, 0, d / 2 - DOOR - depths[1].clear / 2)
    g.add(f1)
    buildFace(f1, it, inter.faces[1], fr, depths[1].clear, 1)
  }
}
