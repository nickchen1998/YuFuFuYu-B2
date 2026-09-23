import type { Viewer } from './three/Viewer'

/** Viewer 不放進 Vue 的 reactive（Three.js 物件被 Proxy 包起來會變慢又容易出錯） */
export const viewerRef: { current: Viewer | null } = { current: null }
