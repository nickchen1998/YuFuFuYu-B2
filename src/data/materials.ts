export type FloorKind = 'wood' | 'tile' | 'terrazzo' | 'concrete'

export interface FloorPreset {
  id: string
  name: string
  kind: FloorKind
  base: string
  grout?: string
  /** 磁磚邊長（公分） */
  size?: number
  roughness: number
}

export const floorPresets: FloorPreset[] = [
  { id: 'oak', name: '淺橡木 超耐磨', kind: 'wood', base: '#c9a77c', roughness: 0.62 },
  { id: 'walnut', name: '胡桃木 超耐磨', kind: 'wood', base: '#7d5a3e', roughness: 0.6 },
  { id: 'greywood', name: '灰橡木 超耐磨', kind: 'wood', base: '#a8a197', roughness: 0.65 },
  { id: 'white-tile', name: '白色拋光石英磚 60×60', kind: 'tile', base: '#efece7', grout: '#d3cec6', size: 60, roughness: 0.22 },
  { id: 'grey-tile', name: '灰色霧面磚 60×60', kind: 'tile', base: '#b0aea9', grout: '#94928d', size: 60, roughness: 0.55 },
  { id: 'big-tile', name: '大理石紋磚 80×80', kind: 'tile', base: '#e9e6e1', grout: '#d8d4cd', size: 80, roughness: 0.2 },
  { id: 'bath-tile', name: '淺灰止滑磚 30×30', kind: 'tile', base: '#cbc9c4', grout: '#a8a59f', size: 30, roughness: 0.7 },
  { id: 'slate', name: '深灰板岩磚 30×30', kind: 'tile', base: '#6a6c70', grout: '#515256', size: 30, roughness: 0.85 },
  { id: 'terrazzo', name: '水磨石', kind: 'terrazzo', base: '#e6e2da', roughness: 0.4 },
  { id: 'concrete', name: '水泥粉光', kind: 'concrete', base: '#b8b4ad', roughness: 0.9 },
]

export const wallPalette = [
  { name: '白', color: '#f4f1ea' },
  { name: '奶茶', color: '#e6d8c3' },
  { name: '淺灰', color: '#d6d5d1' },
  { name: '霧藍', color: '#a7bac9' },
  { name: '鼠尾草綠', color: '#b3c2a4' },
  { name: '莫蘭迪粉', color: '#d9b8b0' },
  { name: '陶土', color: '#c99a7c' },
  { name: '墨綠', color: '#3f5a4c' },
  { name: '深灰', color: '#5c6065' },
]

export const DEFAULT_WALL = '#f4f1ea'
