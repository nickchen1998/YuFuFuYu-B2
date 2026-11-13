import * as THREE from 'three'
import { OrbitControls } from 'three/addons/controls/OrbitControls.js'
import type { IslandModel, IslandPart } from '../island'

// 中島分解圖的 3D 爆炸圖：每個元件一個群組，拉桿控制往外移多少；編號標籤由外面的 HTML 疊上去。
// 單位直接用公分。座標和 island.ts 一樣，只是把原點移到檯面中心的地面。

export type ViewPreset = 'aisle' | 'kitchen' | 'top'

export class ExplodedView {
  private renderer: THREE.WebGLRenderer
  private scene = new THREE.Scene()
  private camera = new THREE.PerspectiveCamera(32, 1, 5, 5000)
  private controls: OrbitControls
  private groups = new Map<string, { g: THREE.Group; part: IslandPart; mats: THREE.MeshStandardMaterial[] }>()
  private ro: ResizeObserver
  private t = 0
  private down: { x: number; y: number } | null = null
  private raycaster = new THREE.Raycaster()
  private queued = false

  constructor(
    private host: HTMLElement,
    private model: IslandModel,
    private onPick: (no: string | null) => void,
    private onFrame: () => void,
  ) {
    // preserveDrawingBuffer：列印、存 PDF 時畫面才留得住
    this.renderer = new THREE.WebGLRenderer({ antialias: true, preserveDrawingBuffer: true })
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    this.renderer.setClearColor('#f7f4ef')
    host.appendChild(this.renderer.domElement)
    this.scene.add(new THREE.HemisphereLight('#ffffff', '#cfc8bb', 1.5))
    const sun = new THREE.DirectionalLight('#ffffff', 1.6)
    sun.position.set(200, 400, 300)
    this.scene.add(sun)

    const { L, D } = model
    const edgeM = new THREE.LineBasicMaterial({ color: '#4d463c', transparent: true, opacity: 0.6 })
    for (const part of model.parts) {
      const g = new THREE.Group()
      const mats: THREE.MeshStandardMaterial[] = []
      for (const b of part.boxes) {
        const geo = new THREE.BoxGeometry(b.sx, b.sy, b.sz)
        const m = new THREE.MeshStandardMaterial({ color: b.color ?? part.color, roughness: 0.75 })
        mats.push(m)
        const mesh = new THREE.Mesh(geo, m)
        mesh.position.set(b.x + b.sx / 2 - L / 2, b.y + b.sy / 2, b.z + b.sz / 2 - D / 2)
        mesh.userData.no = part.no
        g.add(mesh)
        const edges = new THREE.LineSegments(new THREE.EdgesGeometry(geo), edgeM)
        edges.position.copy(mesh.position)
        g.add(edges)
      }
      this.scene.add(g)
      this.groups.set(part.no, { g, part, mats })
    }
    // 靠窗那面牆（到窗台高 80）和地面，幫忙認方向
    const wall = new THREE.Mesh(
      new THREE.BoxGeometry(6, 80, D + 70),
      new THREE.MeshStandardMaterial({ color: '#b9b2a6', transparent: true, opacity: 0.35, roughness: 1 }),
    )
    wall.position.set(-L / 2 - 3.2, 40, 0)
    this.scene.add(wall)
    const floor = new THREE.GridHelper(600, 30, '#d8d1c5', '#e6e0d6')
    floor.position.y = -0.2
    this.scene.add(floor)

    this.controls = new OrbitControls(this.camera, this.renderer.domElement)
    this.controls.enablePan = true
    this.controls.minDistance = 120
    this.controls.maxDistance = 1400
    this.controls.maxPolarAngle = Math.PI * 0.52
    this.controls.addEventListener('change', () => this.queue())
    this.setView('aisle')

    const el = this.renderer.domElement
    el.addEventListener('pointerdown', (e) => (this.down = { x: e.clientX, y: e.clientY }))
    el.addEventListener('pointerup', (e) => {
      const d = this.down
      this.down = null
      if (!d || Math.hypot(e.clientX - d.x, e.clientY - d.y) > 5) return
      const r = el.getBoundingClientRect()
      const ndc = new THREE.Vector2(((e.clientX - r.left) / r.width) * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1)
      this.raycaster.setFromCamera(ndc, this.camera)
      const meshes = [...this.groups.values()].flatMap((x) => x.g.children.filter((c) => (c as THREE.Mesh).isMesh))
      const hit = this.raycaster.intersectObjects(meshes, false)[0]
      this.onPick(hit ? (hit.object.userData.no as string) : null)
    })

    this.ro = new ResizeObserver(() => this.resize())
    this.ro.observe(host)
    this.resize()
  }

  setView(v: ViewPreset) {
    // 視窗越窄，相機拉越遠，整組都要在畫面內
    const aspect = this.host.clientWidth / Math.max(1, this.host.clientHeight)
    const k = (1 + this.t * 0.5) * Math.max(1, 1.5 / aspect)
    const target = new THREE.Vector3(30 * this.t, 38 + 14 * this.t, 0)
    const pos =
      v === 'top'
        ? new THREE.Vector3(target.x, 470 * k, 1)
        : new THREE.Vector3(target.x + 150 * k, 150 * k + 30, (v === 'aisle' ? 1 : -1) * 250 * k)
    this.camera.position.copy(pos)
    this.controls.target.copy(target)
    this.controls.update()
    this.queue()
  }

  setExplode(t: number) {
    this.t = t
    for (const { g, part } of this.groups.values()) g.position.set(part.explode[0] * t, part.explode[1] * t, part.explode[2] * t)
    this.queue()
  }

  setSelected(no: string | null) {
    for (const [k, { mats }] of this.groups) {
      for (const m of mats) {
        m.emissive.set(k === no ? '#b8603a' : '#000000')
        m.emissiveIntensity = k === no ? 0.55 : 0
        m.transparent = !!no && k !== no
        m.opacity = no && k !== no ? 0.45 : 1
        m.needsUpdate = true
      }
    }
    this.queue()
  }

  /** 每個元件的標籤位置（畫面座標，公分座標取元件第一塊的中心） */
  anchors() {
    const w = this.host.clientWidth
    const h = this.host.clientHeight
    const { L, D } = this.model
    const out: { no: string; x: number; y: number }[] = []
    for (const { g, part } of this.groups.values()) {
      const b = part.boxes[0]
      const p = new THREE.Vector3(b.x + b.sx / 2 - L / 2, b.y + b.sy / 2, b.z + b.sz / 2 - D / 2).add(g.position).project(this.camera)
      out.push({ no: part.no, x: ((p.x + 1) / 2) * w, y: ((1 - p.y) / 2) * h })
    }
    return out
  }

  private queue() {
    if (this.queued) return
    this.queued = true
    requestAnimationFrame(() => {
      this.queued = false
      this.render()
    })
  }

  render() {
    this.renderer.render(this.scene, this.camera)
    this.onFrame()
  }

  private resize() {
    const w = this.host.clientWidth
    const h = this.host.clientHeight
    if (!w || !h) return
    this.renderer.setSize(w, h)
    this.camera.aspect = w / h
    this.camera.updateProjectionMatrix()
    this.render()
  }

  dispose() {
    this.ro.disconnect()
    this.controls.dispose()
    this.renderer.dispose()
    this.renderer.domElement.remove()
  }
}
