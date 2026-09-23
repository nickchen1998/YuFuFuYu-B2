import * as THREE from 'three'
import { OrbitControls } from 'three/addons/controls/OrbitControls.js'
import { CSS2DObject, CSS2DRenderer } from 'three/addons/renderers/CSS2DRenderer.js'
import type { Design, FurnitureItem, ViewMode } from '../types'
import type { ui as UIState } from '../store'
import { corridor, planOverlay, rooms, unitBounds, walls } from '../data/house'
import { floorPresets } from '../data/materials'
import { blockingRects, fmt, footprint, rectsOverlap, roomSize, type Rect } from '../geometry'
import { buildWalls } from './walls'
import { buildFurniture, furnitureSignature } from './furniture'
import { floorTexture, loadPlanOverlay, TEX_CM } from './textures'
import { mat } from './mats'
import { pauseHistory, resumeHistory } from '../history'

type UI = typeof UIState

const CM = 0.01
const EYE = 160
const CENTER = {
  x: (unitBounds.x1 + unitBounds.x2) / 2,
  y: (unitBounds.y1 + unitBounds.y2) / 2,
}

interface ItemEntry {
  obj: THREE.Group
  sig: string
}

function label(html: string, cls: string) {
  const el = document.createElement('div')
  el.className = cls
  el.innerHTML = html
  return new CSS2DObject(el)
}

export class Viewer {
  private renderer: THREE.WebGLRenderer
  private sun = new THREE.DirectionalLight('#fff4e5', 2.4)
  private labelRenderer: CSS2DRenderer
  private scene = new THREE.Scene()
  private world = new THREE.Group()
  private persp: THREE.PerspectiveCamera
  private ortho: THREE.OrthographicCamera
  private walkCam: THREE.PerspectiveCamera
  private orbit: OrbitControls
  private topCtl: OrbitControls
  private raycaster = new THREE.Raycaster()
  private floorPlane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0)

  private wallsGroup: THREE.Group | null = null
  private furnitureGroup = new THREE.Group()
  private items = new Map<string, ItemEntry>()
  private floors = new Map<string, THREE.Mesh>()
  private ceilings = new THREE.Group()
  private ceilingMat = new THREE.MeshStandardMaterial({ color: '#fbfaf8', roughness: 0.95, emissive: '#e9e5de', emissiveIntensity: 0.35 })
  private roomLabels = new THREE.Group()
  private overlayMesh: THREE.Mesh | null = null
  private selBox: THREE.BoxHelper | null = null
  private selLabel: CSS2DObject | null = null

  private measureGroup = new THREE.Group()
  private measureA: THREE.Vector2 | null = null
  private measureB: THREE.Vector2 | null = null
  private measureLocked = false

  private drag: { id: string; dx: number; dy: number } | null = null
  private down: { x: number; y: number; t: number } | null = null
  private walk = { x: 91, y: 70, yaw: 0, pitch: -0.05, keys: new Set<string>(), looking: false }
  private collide: Rect[] = []
  private raf = 0
  private timer = new THREE.Timer()
  private ro: ResizeObserver
  private host: HTMLElement
  private design: Design
  private ui: UI

  constructor(host: HTMLElement, design: Design, ui: UI) {
    this.host = host
    this.design = design
    this.ui = ui

    this.renderer = new THREE.WebGLRenderer({ antialias: true })
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    this.renderer.shadowMap.enabled = true
    this.renderer.shadowMap.type = THREE.PCFShadowMap
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping
    this.renderer.toneMappingExposure = 1.05
    host.appendChild(this.renderer.domElement)

    this.labelRenderer = new CSS2DRenderer()
    Object.assign(this.labelRenderer.domElement.style, { position: 'absolute', inset: '0', pointerEvents: 'none' })
    host.appendChild(this.labelRenderer.domElement)

    this.scene.background = new THREE.Color('#e9ebee')
    this.scene.add(this.world)

    // 相機
    this.persp = new THREE.PerspectiveCamera(42, 1, 0.05, 300)
    this.ortho = new THREE.OrthographicCamera(-5, 5, 5, -5, 0.1, 100)
    this.walkCam = new THREE.PerspectiveCamera(72, 1, 0.05, 200)

    this.orbit = new OrbitControls(this.persp, this.renderer.domElement)
    this.orbit.enableDamping = true
    this.orbit.maxPolarAngle = Math.PI * 0.495
    this.orbit.minDistance = 1.5
    this.orbit.maxDistance = 40

    this.topCtl = new OrbitControls(this.ortho, this.renderer.domElement)
    this.topCtl.enableRotate = false
    this.topCtl.screenSpacePanning = true
    this.topCtl.mouseButtons = { LEFT: THREE.MOUSE.PAN, MIDDLE: THREE.MOUSE.DOLLY, RIGHT: THREE.MOUSE.PAN }
    this.topCtl.enabled = false

    this.setupLights()
    this.setupStatic()
    this.applyMirror(false)
    this.world.add(this.furnitureGroup, this.ceilings, this.roomLabels, this.measureGroup)

    this.rebuildWalls()
    this.syncFurniture()

    const el = this.renderer.domElement
    el.addEventListener('pointerdown', this.onPointerDown, { capture: true })
    el.addEventListener('pointermove', this.onPointerMove)
    window.addEventListener('pointerup', this.onPointerUp)
    el.addEventListener('contextmenu', (e) => e.preventDefault())
    window.addEventListener('keydown', this.onKeyDown)
    window.addEventListener('keyup', this.onKeyUp)
    window.addEventListener('blur', () => this.walk.keys.clear())

    this.ro = new ResizeObserver(() => this.resize())
    this.ro.observe(host)
    this.resize()
    this.resetCamera()
    this.loop()
  }

  // ───────────────────────── 場景 ─────────────────────────

  private setupLights() {
    const hemi = new THREE.HemisphereLight('#ffffff', '#b9ae9f', 1.6)
    this.scene.add(hemi)
    const sun = this.sun
    sun.castShadow = true
    sun.shadow.mapSize.set(2048, 2048)
    const sc = sun.shadow.camera
    sc.left = -8
    sc.right = 8
    sc.top = 8
    sc.bottom = -8
    sc.near = 1
    sc.far = 30
    sun.shadow.bias = -0.0004
    sun.shadow.normalBias = 0.02
    this.scene.add(sun, sun.target)
  }

  private setupStatic() {
    // 地面
    const ground = new THREE.Mesh(new THREE.PlaneGeometry(6000, 6000), mat('#dfe1e3', 1))
    ground.rotation.x = -Math.PI / 2
    ground.position.y = -3
    ground.receiveShadow = true
    this.world.add(ground)

    // 樓板
    const b = unitBounds
    const slab = new THREE.Mesh(new THREE.BoxGeometry(b.x2 - b.x1, 3, b.y2 - b.y1), mat('#cdc8c0', 0.9))
    slab.position.set((b.x1 + b.x2) / 2, -1.5, (b.y1 + b.y2) / 2)
    slab.receiveShadow = true
    this.world.add(slab)

    // 公共走廊
    const cw = corridor.x2 - corridor.x1
    const cd = corridor.y2 - corridor.y1
    const cor = new THREE.Mesh(new THREE.PlaneGeometry(cw, cd), mat('#d4d1cb', 0.9))
    cor.rotation.x = -Math.PI / 2
    cor.position.set((corridor.x1 + corridor.x2) / 2, 0.2, (corridor.y1 + corridor.y2) / 2)
    cor.receiveShadow = true
    this.world.add(cor)
    const cl = label(`<b>${corridor.name}</b>`, 'room-label muted')
    cl.position.set((corridor.x1 + corridor.x2) / 2, 2, (corridor.y1 + corridor.y2) / 2)
    this.roomLabels.add(cl)

    // 房間地板、天花板、標籤
    for (const r of rooms) {
      const { w, d, m2, ping } = roomSize(r)
      const floor = new THREE.Mesh(new THREE.PlaneGeometry(w, d), new THREE.MeshStandardMaterial())
      floor.rotation.x = -Math.PI / 2
      floor.position.set((r.x1 + r.x2) / 2, 0.3, (r.y1 + r.y2) / 2)
      floor.receiveShadow = true
      floor.userData = { kind: 'floor', roomId: r.id }
      this.world.add(floor)
      this.floors.set(r.id, floor)

      const ceil = new THREE.Mesh(new THREE.PlaneGeometry(w, d), this.ceilingMat)
      ceil.rotation.x = Math.PI / 2
      ceil.position.set((r.x1 + r.x2) / 2, 0, (r.y1 + r.y2) / 2)
      ceil.userData = { kind: 'ceiling' }
      this.ceilings.add(ceil)
      if (!r.outdoor) {
        // 吸頂燈（只在漫遊模式顯示）
        const fixture = new THREE.Mesh(new THREE.CylinderGeometry(18, 18, 4, 32), mat('#ffffff', 0.5, 0, '#fff6e8'))
        fixture.position.set((r.x1 + r.x2) / 2, -2, (r.y1 + r.y2) / 2)
        fixture.userData = { kind: 'ceiling', offset: -2 }
        this.ceilings.add(fixture)
        const light = new THREE.PointLight('#fff1dc', 9, 0, 2)
        light.position.set((r.x1 + r.x2) / 2, -30, (r.y1 + r.y2) / 2)
        light.userData = { kind: 'ceiling', offset: -30 }
        this.ceilings.add(light)
      }

      const lb = label(
        `<b>${r.name}</b><span>${fmt(w)} × ${fmt(d)} cm</span><span>${fmt(m2, 2)} m² · ${fmt(ping, 2)} 坪</span>`,
        'room-label',
      )
      lb.position.set((r.x1 + r.x2) / 2, 2, (r.y1 + r.y2) / 2)
      this.roomLabels.add(lb)
    }
    this.ceilings.visible = false
    this.updateFloors()

    // 原始平面圖疊圖
    loadPlanOverlay(planOverlay.src).then((tex) => {
      const m = new THREE.MeshBasicMaterial({ map: tex, transparent: true, depthTest: false, depthWrite: false })
      const mesh = new THREE.Mesh(new THREE.PlaneGeometry(planOverlay.w, planOverlay.h), m)
      mesh.rotation.x = -Math.PI / 2
      mesh.position.set(planOverlay.x + planOverlay.w / 2, 2, planOverlay.y + planOverlay.h / 2)
      mesh.renderOrder = 10
      mesh.raycast = () => {}
      this.overlayMesh = mesh
      this.world.add(mesh)
      this.setOverlay()
    })
  }

  updateFloors() {
    for (const r of rooms) {
      const mesh = this.floors.get(r.id)
      if (!mesh) continue
      const preset = floorPresets.find((p) => p.id === this.design.roomFloors[r.id]) ?? floorPresets[0]
      const tex = floorTexture(preset).clone()
      tex.repeat.set((r.x2 - r.x1) / TEX_CM, (r.y2 - r.y1) / TEX_CM)
      tex.needsUpdate = true
      const old = mesh.material as THREE.MeshStandardMaterial
      old.map?.dispose()
      old.dispose()
      mesh.material = new THREE.MeshStandardMaterial({ map: tex, roughness: preset.roughness })
    }
  }

  rebuildWalls() {
    if (this.wallsGroup) {
      this.world.remove(this.wallsGroup)
      this.wallsGroup.traverse((o) => {
        if (o instanceof THREE.Mesh) o.geometry.dispose()
      })
    }
    const H = this.design.ceilingHeight
    const cut = this.ui.mode === 'walk' ? H : Math.min(this.ui.wallCut, H)
    this.wallsGroup = buildWalls({ ceiling: H, cut, doorsOpen: this.ui.doorsOpen, paint: this.design.wallPaint })
    this.world.add(this.wallsGroup)
    this.collide = blockingRects(H)
    for (const c of this.ceilings.children) c.position.y = H + ((c.userData.offset as number | undefined) ?? 0)
  }

  // ───────────────────────── 家具 ─────────────────────────

  syncFurniture() {
    const seen = new Set<string>()
    for (const it of this.design.furniture) {
      seen.add(it.id)
      const sig = furnitureSignature(it)
      let entry = this.items.get(it.id)
      if (!entry || entry.sig !== sig) {
        if (entry) this.disposeItem(entry)
        const obj = new THREE.Group()
        const inner = buildFurniture(it)
        obj.add(inner)
        obj.userData.itemId = it.id
        this.furnitureGroup.add(obj)
        entry = { obj, sig }
        this.items.set(it.id, entry)
      }
      entry.obj.position.set(it.x, it.elev, it.y)
      entry.obj.rotation.y = (it.rot * Math.PI) / 180
    }
    for (const [id, entry] of this.items) {
      if (!seen.has(id)) {
        this.disposeItem(entry)
        this.items.delete(id)
      }
    }
    this.updateSelection()
  }

  private disposeItem(entry: ItemEntry) {
    this.furnitureGroup.remove(entry.obj)
    entry.obj.traverse((o) => {
      if (o instanceof THREE.Mesh) o.geometry.dispose()
    })
  }

  private selected(): FurnitureItem | undefined {
    return this.design.furniture.find((f) => f.id === this.ui.selectedId)
  }

  /** 家具是否卡進牆裡 */
  overlapsWall(it: FurnitureItem) {
    if (it.type === 'rug' || it.locked) return false
    const fp = footprint(it)
    return this.collide.some((r) => rectsOverlap(fp, r, 1))
  }

  updateSelection() {
    const it = this.selected()
    if (this.selBox) {
      this.scene.remove(this.selBox)
      this.selBox.dispose()
      this.selBox = null
    }
    if (this.selLabel) {
      this.selLabel.removeFromParent()
      this.selLabel = null
    }
    if (!it || this.ui.mode === 'walk') return
    const entry = this.items.get(it.id)
    if (!entry) return
    const bad = this.overlapsWall(it)
    this.selBox = new THREE.BoxHelper(entry.obj, bad ? '#e5484d' : '#f5a524')
    this.scene.add(this.selBox)
    const lb = label(`${it.name}<span>${fmt(it.w)} × ${fmt(it.d)} × ${fmt(it.h)}</span>`, `item-label${bad ? ' bad' : ''}`)
    lb.position.set(it.x, it.elev + it.h + 12, it.y)
    this.world.add(lb)
    this.selLabel = lb
  }

  // ───────────────────────── 模式 / 顯示 ─────────────────────────

  get camera(): THREE.Camera {
    return this.ui.mode === 'top' ? this.ortho : this.ui.mode === 'walk' ? this.walkCam : this.persp
  }

  setMode(mode: ViewMode) {
    this.orbit.enabled = mode === 'orbit'
    this.topCtl.enabled = mode === 'top'
    this.ceilings.visible = mode === 'walk'
    this.setLabels()
    this.rebuildWalls()
    this.updateSelection()
    this.clearMeasure()
    if (mode === 'top') this.frameTop()
    if (mode === 'walk') this.walk.keys.clear()
    this.renderer.domElement.style.cursor = mode === 'walk' ? 'grab' : ''
  }

  setLabels() {
    this.roomLabels.visible = this.ui.showLabels && this.ui.mode !== 'walk'
  }

  setOverlay() {
    if (!this.overlayMesh) return
    this.overlayMesh.visible = this.ui.showOverlay
    ;(this.overlayMesh.material as THREE.MeshBasicMaterial).opacity = this.ui.overlayOpacity
  }

  /** 平面 y 在 3D 世界中的方向：A2・B2 = 1，A6・B6（上下翻轉）= -1 */
  private get sy() {
    return this.design.mirrored ? -1 : 1
  }

  /**
   * 切換 A2・B2 / A6・B6：資料維持 A2・B2 的座標，只把整個世界沿平面 y 軸鏡像。
   * Three.js 會自動處理負縮放的面方向、陰影與點選。
   */
  applyMirror(resetView = true) {
    this.world.scale.set(CM, CM, CM * this.sy)
    const c = new THREE.Vector3(CENTER.x * CM, 0, CENTER.y * CM * this.sy)
    this.sun.position.set(c.x - 4, 9, c.z + 6)
    this.sun.target.position.copy(c)
    // 漫遊回到大門口、面向屋內
    this.walk.x = 91
    this.walk.y = 70
    this.walk.yaw = this.sy > 0 ? 0 : Math.PI
    this.walk.pitch = -0.05
    if (resetView) {
      this.clearMeasure()
      this.resetCamera()
    }
  }

  resetCamera() {
    const c = new THREE.Vector3(CENTER.x * CM, 0.4, (CENTER.y + 20) * CM * this.sy)
    this.orbit.target.copy(c)
    // 視窗越窄，相機拉越遠，確保整戶都在畫面內
    const aspect = this.host.clientWidth / Math.max(1, this.host.clientHeight)
    const k = Math.max(1, 1.25 / aspect)
    this.persp.position.set(c.x - 2.2 * k, 11.5 * k, c.z + 7 * k)
    this.orbit.update()
    this.frameTop()
  }

  private frameTop() {
    const c = new THREE.Vector3(CENTER.x * CM, 0, (CENTER.y - 40) * CM * this.sy)
    this.ortho.position.set(c.x, 30, c.z)
    this.ortho.up.set(0, 0, -1)
    this.ortho.lookAt(c)
    this.topCtl.target.copy(c)
    this.ortho.zoom = 1
    this.resize()
    this.topCtl.update()
  }

  teleport(roomId: string) {
    const r = rooms.find((x) => x.id === roomId)
    if (!r) return
    this.walk.x = (r.x1 + r.x2) / 2
    this.walk.y = (r.y1 + r.y2) / 2
  }

  private resize() {
    const w = this.host.clientWidth
    const h = this.host.clientHeight
    if (!w || !h) return
    this.renderer.setSize(w, h)
    this.labelRenderer.setSize(w, h)
    const aspect = w / h
    this.persp.aspect = aspect
    this.persp.updateProjectionMatrix()
    this.walkCam.aspect = aspect
    this.walkCam.updateProjectionMatrix()
    const span = ((unitBounds.y2 - unitBounds.y1 + 260) * CM) / 2
    const spanW = ((unitBounds.x2 - unitBounds.x1 + 160) * CM) / 2
    const half = Math.max(span, spanW / aspect)
    this.ortho.left = -half * aspect
    this.ortho.right = half * aspect
    this.ortho.top = half
    this.ortho.bottom = -half
    this.ortho.updateProjectionMatrix()
  }

  screenshot(): string {
    this.renderer.render(this.scene, this.camera)
    return this.renderer.domElement.toDataURL('image/png')
  }

  // ───────────────────────── 滑鼠互動 ─────────────────────────

  private ndc(e: PointerEvent) {
    const r = this.renderer.domElement.getBoundingClientRect()
    return new THREE.Vector2(((e.clientX - r.left) / r.width) * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1)
  }

  private hit(e: PointerEvent) {
    this.raycaster.setFromCamera(this.ndc(e), this.camera)
    const targets: THREE.Object3D[] = [this.furnitureGroup, ...this.floors.values()]
    if (this.wallsGroup) targets.push(this.wallsGroup)
    return this.raycaster.intersectObjects(targets, true)[0] ?? null
  }

  /** 滑鼠在地面上的平面座標（公分） */
  private floorPoint(e: PointerEvent): THREE.Vector2 | null {
    this.raycaster.setFromCamera(this.ndc(e), this.camera)
    const p = new THREE.Vector3()
    if (!this.raycaster.ray.intersectPlane(this.floorPlane, p)) return null
    return new THREE.Vector2(p.x / CM, (p.z / CM) * this.sy)
  }

  private onPointerDown = (e: PointerEvent) => {
    this.down = { x: e.clientX, y: e.clientY, t: performance.now() }
    if (this.ui.mode === 'walk') {
      this.walk.looking = true
      this.renderer.domElement.style.cursor = 'grabbing'
      return
    }
    if (e.button !== 0 || this.ui.tool !== 'select') return
    const h = this.hit(e)
    const id = h?.object.userData.itemId as string | undefined
    if (!id) return
    const it = this.design.furniture.find((f) => f.id === id)
    if (!it) return
    this.ui.selectedId = id
    if (it.locked) return
    const p = this.floorPoint(e)
    if (!p) return
    this.drag = { id, dx: it.x - p.x, dy: it.y - p.y }
    pauseHistory()
    this.orbit.enabled = false
    this.topCtl.enabled = false
    this.renderer.domElement.style.cursor = 'grabbing'
    this.renderer.domElement.setPointerCapture(e.pointerId)
  }

  private onPointerMove = (e: PointerEvent) => {
    if (this.ui.mode === 'walk') {
      if (this.walk.looking) {
        this.walk.yaw -= e.movementX * 0.0045
        this.walk.pitch = THREE.MathUtils.clamp(this.walk.pitch - e.movementY * 0.0045, -1.3, 1.3)
      }
      return
    }
    if (this.drag) {
      const it = this.design.furniture.find((f) => f.id === this.drag!.id)
      const p = this.floorPoint(e)
      if (!it || !p) return
      let x = p.x + this.drag.dx
      let y = p.y + this.drag.dy
      if (!e.altKey) {
        const s = this.ui.snap
        x = Math.round(x / s) * s
        y = Math.round(y / s) * s
        ;[x, y] = this.snapToWalls(it, x, y)
      }
      it.x = Math.round(x * 10) / 10
      it.y = Math.round(y * 10) / 10
      return
    }
    if (this.ui.tool === 'measure' && this.measureA && !this.measureLocked) {
      const p = this.floorPoint(e)
      if (p) {
        this.measureB = this.snapMeasure(p, e.altKey)
        this.drawMeasure()
      }
      return
    }
    if (this.ui.tool === 'select') {
      const h = this.hit(e)
      const id = h?.object.userData.itemId as string | undefined
      const it = id ? this.design.furniture.find((f) => f.id === id) : undefined
      this.renderer.domElement.style.cursor = it ? (it.locked ? 'pointer' : 'grab') : ''
    } else if (this.ui.tool === 'paint') {
      const h = this.hit(e)
      this.renderer.domElement.style.cursor = h?.object.userData.kind === 'wall' ? 'crosshair' : ''
    }
  }

  private onPointerUp = (e: PointerEvent) => {
    const wasClick = this.down && Math.hypot(e.clientX - this.down.x, e.clientY - this.down.y) < 5
    this.down = null
    if (this.ui.mode === 'walk') {
      this.walk.looking = false
      this.renderer.domElement.style.cursor = 'grab'
      return
    }
    if (this.drag) {
      this.drag = null
      resumeHistory()
      this.orbit.enabled = this.ui.mode === 'orbit'
      this.topCtl.enabled = this.ui.mode === 'top'
      this.renderer.domElement.style.cursor = 'grab'
      return
    }
    if (!wasClick || e.target !== this.renderer.domElement) return
    if (this.ui.tool === 'select') {
      const h = this.hit(e)
      if (!h?.object.userData.itemId) this.ui.selectedId = null
    } else if (this.ui.tool === 'paint') {
      this.paintAt(e)
    } else if (this.ui.tool === 'measure') {
      const p = this.floorPoint(e)
      if (!p) return
      const sp = this.snapMeasure(p, e.altKey)
      if (!this.measureA || this.measureLocked) {
        this.measureA = sp
        this.measureB = null
        this.measureLocked = false
      } else {
        this.measureB = sp
        this.measureLocked = true
      }
      this.drawMeasure()
    }
  }

  private paintAt(e: PointerEvent) {
    const h = this.hit(e)
    if (!h || h.object.userData.kind !== 'wall' || !h.face) return
    const { wallId, horizontal } = h.object.userData as { wallId: string; horizontal: boolean }
    const w = walls.find((x) => x.id === wallId)
    if (!w || w.style === 'column' || w.style === 'louver') return
    const n = h.face.normal
    let side: 'a' | 'b' | null = null
    if (horizontal && Math.abs(n.z) > 0.9) side = n.z > 0 ? 'b' : 'a'
    if (!horizontal && Math.abs(n.x) > 0.9) side = n.x > 0 ? 'b' : 'a'
    if (!side) return
    const key = `${wallId}:${side}`
    if (e.altKey) delete this.design.wallPaint[key]
    else this.design.wallPaint[key] = this.ui.paintColor
  }

  /** 靠近房間牆面 12 公分內自動貼齊 */
  private snapToWalls(it: FurnitureItem, x: number, y: number): [number, number] {
    const fp = footprint({ ...it, x, y })
    const room = rooms.find((r) => x >= r.x1 - 20 && x <= r.x2 + 20 && y >= r.y1 - 20 && y <= r.y2 + 20)
    if (!room) return [x, y]
    const T = 12
    if (Math.abs(fp.x1 - room.x1) < T) x += room.x1 - fp.x1
    else if (Math.abs(fp.x2 - room.x2) < T) x += room.x2 - fp.x2
    if (Math.abs(fp.y1 - room.y1) < T) y += room.y1 - fp.y1
    else if (Math.abs(fp.y2 - room.y2) < T) y += room.y2 - fp.y2
    return [x, y]
  }

  // ───────────────────────── 量尺 ─────────────────────────

  private snapMeasure(p: THREE.Vector2, free: boolean) {
    const q = p.clone()
    if (free) return q
    const T = 6
    let bx = T
    let by = T
    for (const r of rooms) {
      for (const xx of [r.x1, r.x2]) if (Math.abs(q.x - xx) < bx && q.y > r.y1 - T && q.y < r.y2 + T) { bx = Math.abs(q.x - xx); p.x = xx }
      for (const yy of [r.y1, r.y2]) if (Math.abs(q.y - yy) < by && q.x > r.x1 - T && q.x < r.x2 + T) { by = Math.abs(q.y - yy); p.y = yy }
    }
    q.copy(p)
    if (this.measureA && !this.measureLocked) {
      if (Math.abs(q.x - this.measureA.x) < 10) q.x = this.measureA.x
      if (Math.abs(q.y - this.measureA.y) < 10) q.y = this.measureA.y
    }
    q.x = Math.round(q.x * 2) / 2
    q.y = Math.round(q.y * 2) / 2
    return q
  }

  private drawMeasure() {
    this.measureGroup.clear()
    const a = this.measureA
    if (!a) {
      this.ui.measure = null
      return
    }
    const Y = 3
    const dotMat = new THREE.MeshBasicMaterial({ color: '#e5484d', depthTest: false })
    const dot = (p: THREE.Vector2) => {
      const m = new THREE.Mesh(new THREE.SphereGeometry(3.5, 16, 12), dotMat)
      m.position.set(p.x, Y, p.y)
      m.renderOrder = 20
      this.measureGroup.add(m)
    }
    dot(a)
    const b = this.measureB
    if (!b) {
      this.ui.measure = '點第二個點'
      return
    }
    dot(b)
    const geo = new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(a.x, Y, a.y), new THREE.Vector3(b.x, Y, b.y)])
    const line = new THREE.Line(geo, new THREE.LineBasicMaterial({ color: '#e5484d', depthTest: false }))
    line.renderOrder = 20
    this.measureGroup.add(line)
    const dist = a.distanceTo(b)
    const dx = Math.abs(b.x - a.x)
    const dy = Math.abs(b.y - a.y)
    const text = `${fmt(dist)} cm`
    const lb = label(text, 'measure-label')
    lb.position.set((a.x + b.x) / 2, Y + 8, (a.y + b.y) / 2)
    this.measureGroup.add(lb)
    this.ui.measure = dx > 0.5 && dy > 0.5 ? `${text}（橫 ${fmt(dx)} × 縱 ${fmt(dy)}）` : text
  }

  clearMeasure() {
    this.measureA = null
    this.measureB = null
    this.measureLocked = false
    this.measureGroup.traverse((o) => {
      if (o instanceof CSS2DObject) o.element.remove()
    })
    this.measureGroup.clear()
    this.ui.measure = null
  }

  // ───────────────────────── 鍵盤 ─────────────────────────

  private onKeyDown = (e: KeyboardEvent) => {
    const t = e.target as HTMLElement
    if (t && (t.tagName === 'INPUT' || t.tagName === 'SELECT' || t.tagName === 'TEXTAREA')) return
    if (this.ui.mode === 'walk') {
      this.walk.keys.add(e.code)
      if (e.code.startsWith('Arrow') || e.code === 'Space') e.preventDefault()
      return
    }
    if (e.code === 'Escape') {
      this.ui.selectedId = null
      this.clearMeasure()
      return
    }
    const it = this.selected()
    if (!it) return
    if (e.code === 'Delete' || e.code === 'Backspace') {
      e.preventDefault()
      if (it.locked) return
      this.design.furniture.splice(this.design.furniture.indexOf(it), 1)
      this.ui.selectedId = null
      return
    }
    if (it.locked) return
    const step = e.shiftKey ? 10 : 1
    // 翻轉戶別時畫面上下顛倒，上下鍵與旋轉方向要反過來，操作起來才跟畫面一致
    const sy = this.sy
    const turn = (deg: number) => (it.rot = (((it.rot + deg * sy) % 360) + 360) % 360)
    switch (e.code) {
      case 'KeyR':
        turn(e.shiftKey ? -90 : 90)
        break
      case 'KeyQ':
        turn(-15)
        break
      case 'KeyE':
        turn(15)
        break
      case 'ArrowLeft':
        it.x -= step
        break
      case 'ArrowRight':
        it.x += step
        break
      case 'ArrowUp':
        it.y -= step * sy
        break
      case 'ArrowDown':
        it.y += step * sy
        break
      default:
        return
    }
    e.preventDefault()
  }

  private onKeyUp = (e: KeyboardEvent) => {
    this.walk.keys.delete(e.code)
  }

  // ───────────────────────── 室內漫遊 ─────────────────────────

  private blocked(x: number, y: number) {
    const R = 18
    return this.collide.some((r) => x + R > r.x1 && x - R < r.x2 && y + R > r.y1 && y - R < r.y2)
  }

  private stepWalk(dt: number) {
    const k = this.walk.keys
    const f = (k.has('KeyW') || k.has('ArrowUp') ? 1 : 0) - (k.has('KeyS') || k.has('ArrowDown') ? 1 : 0)
    const s = (k.has('KeyD') ? 1 : 0) - (k.has('KeyA') ? 1 : 0)
    const turn = (k.has('ArrowLeft') ? 1 : 0) - (k.has('ArrowRight') ? 1 : 0)
    this.walk.yaw += turn * dt * 1.8
    if (f || s) {
      const speed = (k.has('ShiftLeft') || k.has('ShiftRight') ? 260 : 140) * dt
      const yaw = this.walk.yaw
      // 3D 世界中：前方 = (sin yaw, cos yaw)，右方 = (-cos yaw, sin yaw)；平面 y = 世界 z × sy
      const mx = (Math.sin(yaw) * f - Math.cos(yaw) * s) * speed
      const my = (Math.cos(yaw) * f + Math.sin(yaw) * s) * speed * this.sy
      if (!this.blocked(this.walk.x + mx, this.walk.y)) this.walk.x += mx
      if (!this.blocked(this.walk.x, this.walk.y + my)) this.walk.y += my
    }
    const { x, y, yaw, pitch } = this.walk
    this.walkCam.position.set(x * CM, EYE * CM, y * CM * this.sy)
    const dir = new THREE.Vector3(Math.sin(yaw) * Math.cos(pitch), Math.sin(pitch), Math.cos(yaw) * Math.cos(pitch))
    this.walkCam.lookAt(this.walkCam.position.clone().add(dir))
  }

  // ───────────────────────── 迴圈 ─────────────────────────

  private loop = () => {
    this.raf = requestAnimationFrame(this.loop)
    this.timer.update()
    const dt = Math.min(this.timer.getDelta(), 0.05)
    if (this.ui.mode === 'orbit') this.orbit.update()
    else if (this.ui.mode === 'top') this.topCtl.update()
    else this.stepWalk(dt)
    if (this.selBox) this.selBox.update()
    if (this.selLabel) {
      const it = this.selected()
      if (it) this.selLabel.position.set(it.x, it.elev + it.h + 12, it.y)
    }
    this.renderer.render(this.scene, this.camera)
    this.labelRenderer.render(this.scene, this.camera)
  }

  dispose() {
    cancelAnimationFrame(this.raf)
    this.ro.disconnect()
    window.removeEventListener('pointerup', this.onPointerUp)
    window.removeEventListener('keydown', this.onKeyDown)
    window.removeEventListener('keyup', this.onKeyUp)
    this.orbit.dispose()
    this.topCtl.dispose()
    this.renderer.dispose()
    this.renderer.domElement.remove()
    this.labelRenderer.domElement.remove()
  }
}
