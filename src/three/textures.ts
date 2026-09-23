import * as THREE from 'three'
import type { FloorPreset } from '../data/materials'

/** 一張貼圖代表 120 × 120 公分 */
export const TEX_CM = 120
const S = 1024

const cache = new Map<string, THREE.CanvasTexture>()

function rng(seed: number) {
  let s = seed % 2147483647
  if (s <= 0) s += 2147483646
  return () => {
    s = (s * 16807) % 2147483647
    return (s - 1) / 2147483646
  }
}

export function hashStr(str: string) {
  let h = 2166136261
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i)
    h = Math.imul(h, 16777619)
  }
  return Math.abs(h) || 1
}

function rgb(hex: string): [number, number, number] {
  const n = parseInt(hex.replace('#', ''), 16)
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255]
}

function tint(hex: string, f: number, a = 1) {
  const [r, g, b] = rgb(hex)
  const c = (v: number) => Math.max(0, Math.min(255, Math.round(v * f)))
  return `rgba(${c(r)},${c(g)},${c(b)},${a})`
}

function makeCanvas() {
  const c = document.createElement('canvas')
  c.width = S
  c.height = S
  return c
}

function drawWood(g: CanvasRenderingContext2D, p: FloorPreset) {
  const rand = rng(hashStr(p.id))
  const planks = 6 // 每片 20 公分寬、120 公分長
  const pw = S / planks
  for (let i = 0; i < planks; i++) {
    const x = i * pw
    const joint = rand() * S
    const f = 0.9 + rand() * 0.2
    g.fillStyle = tint(p.base, f)
    g.fillRect(x, 0, pw, S)
    // 木紋
    for (let j = 0; j < 22; j++) {
      const gx = x + rand() * pw
      const amp = 2 + rand() * 5
      const freq = 0.004 + rand() * 0.01
      const ph = rand() * 10
      g.strokeStyle = tint(p.base, 0.72 + rand() * 0.2, 0.18 + rand() * 0.22)
      g.lineWidth = 0.6 + rand() * 1.6
      g.beginPath()
      for (let y = 0; y <= S; y += 16) {
        const xx = Math.min(x + pw - 1, Math.max(x + 1, gx + Math.sin(y * freq + ph) * amp))
        if (y === 0) g.moveTo(xx, y)
        else g.lineTo(xx, y)
      }
      g.stroke()
    }
    // 木節
    if (rand() > 0.6) {
      const ky = rand() * S
      g.fillStyle = tint(p.base, 0.7, 0.35)
      g.beginPath()
      g.ellipse(x + pw * (0.3 + rand() * 0.4), ky, 5 + rand() * 6, 12 + rand() * 10, 0, 0, Math.PI * 2)
      g.fill()
    }
    // 接縫
    g.fillStyle = 'rgba(40,25,10,0.35)'
    g.fillRect(x, joint, pw, 2)
    g.fillRect(x, 0, 2, S)
  }
}

function drawTile(g: CanvasRenderingContext2D, p: FloorPreset) {
  const rand = rng(hashStr(p.id))
  const size = p.size ?? 60
  const n = Math.max(1, Math.round(TEX_CM / size))
  const ts = S / n
  g.fillStyle = p.grout ?? '#999'
  g.fillRect(0, 0, S, S)
  const gw = Math.max(2, (S / TEX_CM) * 0.3)
  for (let i = 0; i < n; i++) {
    for (let j = 0; j < n; j++) {
      const f = 0.96 + rand() * 0.08
      g.fillStyle = tint(p.base, f)
      g.fillRect(i * ts + gw / 2, j * ts + gw / 2, ts - gw, ts - gw)
      // 細微紋理
      for (let k = 0; k < 260; k++) {
        g.fillStyle = tint(p.base, 0.85 + rand() * 0.3, 0.12)
        const r = 0.6 + rand() * 2.2
        g.beginPath()
        g.arc(i * ts + gw + rand() * (ts - 2 * gw), j * ts + gw + rand() * (ts - 2 * gw), r, 0, Math.PI * 2)
        g.fill()
      }
      if ((p.size ?? 0) >= 80) {
        // 大理石紋
        g.strokeStyle = tint(p.base, 0.8, 0.25)
        g.lineWidth = 1 + rand() * 1.5
        g.beginPath()
        let vx = i * ts + rand() * ts
        let vy = j * ts
        g.moveTo(vx, vy)
        while (vy < (j + 1) * ts) {
          vx += (rand() - 0.5) * 40
          vy += 20 + rand() * 30
          g.lineTo(Math.min((i + 1) * ts - gw, Math.max(i * ts + gw, vx)), Math.min(vy, (j + 1) * ts - gw))
        }
        g.stroke()
      }
    }
  }
}

function drawTerrazzo(g: CanvasRenderingContext2D, p: FloorPreset) {
  const rand = rng(hashStr(p.id))
  g.fillStyle = p.base
  g.fillRect(0, 0, S, S)
  const chips = ['#8b8680', '#5d5a57', '#c4b8a6', '#ffffff', '#a39785', '#d9cfc0', '#7a8a8c']
  for (let k = 0; k < 2600; k++) {
    g.fillStyle = chips[Math.floor(rand() * chips.length)]
    const cx = rand() * S
    const cy = rand() * S
    const r = 1.5 + rand() * rand() * 9
    g.beginPath()
    const sides = 5 + Math.floor(rand() * 3)
    for (let s = 0; s < sides; s++) {
      const a = (s / sides) * Math.PI * 2
      const rr = r * (0.6 + rand() * 0.5)
      const px = cx + Math.cos(a) * rr
      const py = cy + Math.sin(a) * rr
      if (s === 0) g.moveTo(px, py)
      else g.lineTo(px, py)
    }
    g.closePath()
    g.fill()
  }
}

function drawConcrete(g: CanvasRenderingContext2D, p: FloorPreset) {
  const rand = rng(hashStr(p.id))
  g.fillStyle = p.base
  g.fillRect(0, 0, S, S)
  for (let k = 0; k < 40; k++) {
    const grd = g.createRadialGradient(0, 0, 0, 0, 0, 1)
    grd.addColorStop(0, tint(p.base, 0.9 + rand() * 0.2, 0.35))
    grd.addColorStop(1, tint(p.base, 1, 0))
    g.save()
    g.translate(rand() * S, rand() * S)
    g.scale(60 + rand() * 180, 60 + rand() * 180)
    g.fillStyle = grd
    g.beginPath()
    g.arc(0, 0, 1, 0, Math.PI * 2)
    g.fill()
    g.restore()
  }
  for (let k = 0; k < 9000; k++) {
    g.fillStyle = tint(p.base, 0.75 + rand() * 0.5, 0.25)
    g.fillRect(rand() * S, rand() * S, 1.2, 1.2)
  }
}

export function floorTexture(p: FloorPreset): THREE.CanvasTexture {
  const hit = cache.get(p.id)
  if (hit) return hit
  const c = makeCanvas()
  const g = c.getContext('2d')!
  if (p.kind === 'wood') drawWood(g, p)
  else if (p.kind === 'tile') drawTile(g, p)
  else if (p.kind === 'terrazzo') drawTerrazzo(g, p)
  else drawConcrete(g, p)
  const tex = new THREE.CanvasTexture(c)
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping
  tex.colorSpace = THREE.SRGBColorSpace
  tex.anisotropy = 8
  cache.set(p.id, tex)
  return tex
}

/** 把黑線白底的平面圖轉成「紅線＋透明底」，疊在模型上比對用 */
export function loadPlanOverlay(url: string, color = '#e0245e'): Promise<THREE.CanvasTexture> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => {
      const c = document.createElement('canvas')
      c.width = img.naturalWidth
      c.height = img.naturalHeight
      const g = c.getContext('2d')!
      g.drawImage(img, 0, 0)
      const data = g.getImageData(0, 0, c.width, c.height)
      const [r, gg, b] = rgb(color)
      for (let i = 0; i < data.data.length; i += 4) {
        const lum = (data.data[i] * 0.299 + data.data[i + 1] * 0.587 + data.data[i + 2] * 0.114) / 255
        data.data[i] = r
        data.data[i + 1] = gg
        data.data[i + 2] = b
        data.data[i + 3] = Math.round(Math.max(0, Math.min(1, (1 - lum) * 1.6)) * 255)
      }
      g.putImageData(data, 0, 0)
      const tex = new THREE.CanvasTexture(c)
      tex.colorSpace = THREE.SRGBColorSpace
      tex.anisotropy = 8
      resolve(tex)
    }
    img.onerror = reject
    img.src = url
  })
}
