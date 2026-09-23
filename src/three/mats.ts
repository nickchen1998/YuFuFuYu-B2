import * as THREE from 'three'

const cache = new Map<string, THREE.Material>()

export function mat(color: string, roughness = 0.7, metalness = 0, emissive?: string): THREE.MeshStandardMaterial {
  const key = `${color}|${roughness}|${metalness}|${emissive ?? ''}`
  let m = cache.get(key) as THREE.MeshStandardMaterial | undefined
  if (!m) {
    m = new THREE.MeshStandardMaterial({ color, roughness, metalness })
    if (emissive) {
      m.emissive = new THREE.Color(emissive)
      m.emissiveIntensity = 0.9
    }
    cache.set(key, m)
  }
  return m
}

let glass: THREE.MeshPhysicalMaterial | null = null
export function glassMat() {
  if (!glass) {
    glass = new THREE.MeshPhysicalMaterial({
      color: '#cfe3ee',
      roughness: 0.05,
      metalness: 0,
      transparent: true,
      opacity: 0.28,
      depthWrite: false,
      side: THREE.DoubleSide,
    })
  }
  return glass
}

/** 把顏色調暗 / 調亮（f < 1 變暗） */
export function shadeHex(hex: string, f: number) {
  const c = new THREE.Color(hex)
  c.multiplyScalar(f)
  return '#' + c.getHexString()
}
