import type { FurnitureItem } from '../types'

export interface CatalogEntry {
  type: string
  name: string
  category: string
  w: number
  d: number
  h: number
  elev?: number
  color: string
}

// 尺寸採台灣常見規格（公分）
export const catalog: CatalogEntry[] = [
  // 臥室
  { type: 'bed', name: '雙人床 5尺', category: '臥室', w: 152, d: 200, h: 100, color: '#d9d3c7' },
  { type: 'bed', name: '加大雙人床 6尺', category: '臥室', w: 182, d: 200, h: 100, color: '#d9d3c7' },
  { type: 'bed', name: '單人床 3.5尺', category: '臥室', w: 106, d: 200, h: 90, color: '#c9d3dc' },
  { type: 'wardrobe', name: '衣櫃', category: '臥室', w: 120, d: 60, h: 220, color: '#e4dccf' },
  { type: 'nightstand', name: '床頭櫃', category: '臥室', w: 45, d: 40, h: 50, color: '#b8916a' },
  { type: 'desk', name: '書桌', category: '臥室', w: 120, d: 60, h: 75, color: '#c49a6c' },
  { type: 'desk', name: '化妝台', category: '臥室', w: 100, d: 45, h: 75, color: '#e8e2d8' },
  { type: 'chair', name: '椅子', category: '臥室', w: 45, d: 50, h: 85, color: '#5b5f63' },
  { type: 'bookshelf', name: '書櫃', category: '臥室', w: 80, d: 30, h: 180, color: '#dcd0bd' },
  // 客廳
  { type: 'sofa', name: '三人沙發', category: '客廳', w: 200, d: 90, h: 80, color: '#8e9ca8' },
  { type: 'sofa', name: '雙人沙發', category: '客廳', w: 160, d: 85, h: 80, color: '#8e9ca8' },
  { type: 'sofa', name: '單人沙發', category: '客廳', w: 85, d: 85, h: 80, color: '#b89b7a' },
  { type: 'coffeetable', name: '茶几', category: '客廳', w: 100, d: 50, h: 40, color: '#a67c52' },
  { type: 'tvstand', name: '電視櫃', category: '客廳', w: 180, d: 40, h: 50, color: '#ece6dc' },
  { type: 'tv', name: '電視 55吋', category: '客廳', w: 123, d: 8, h: 72, elev: 50, color: '#1b1b1d' },
  { type: 'tv', name: '電視 65吋', category: '客廳', w: 145, d: 8, h: 84, elev: 50, color: '#1b1b1d' },
  { type: 'rug', name: '地毯', category: '客廳', w: 200, d: 150, h: 1, color: '#cfc5b4' },
  { type: 'plant', name: '盆栽', category: '客廳', w: 40, d: 40, h: 120, color: '#5f8a5a' },
  { type: 'lamp', name: '立燈', category: '客廳', w: 35, d: 35, h: 160, color: '#f0e6d0' },
  // 餐廚
  { type: 'table', name: '餐桌 4人', category: '餐廚', w: 120, d: 75, h: 75, color: '#b08560' },
  { type: 'table', name: '餐桌 2人', category: '餐廚', w: 80, d: 70, h: 75, color: '#b08560' },
  { type: 'roundtable', name: '圓餐桌', category: '餐廚', w: 90, d: 90, h: 75, color: '#e8e2d8' },
  { type: 'chair', name: '餐椅', category: '餐廚', w: 45, d: 50, h: 85, color: '#6b5a4a' },
  { type: 'fridge', name: '冰箱', category: '餐廚', w: 70, d: 70, h: 180, color: '#d4d8dc' },
  { type: 'cabinet', name: '電器櫃', category: '餐廚', w: 60, d: 45, h: 200, color: '#ece6dc' },
  { type: 'island', name: '中島 / 吧台', category: '餐廚', w: 120, d: 60, h: 90, color: '#ece6dc' },
  // 其他
  { type: 'cabinet', name: '鞋櫃', category: '其他', w: 120, d: 35, h: 110, color: '#ece6dc' },
  { type: 'cabinet', name: '收納櫃', category: '其他', w: 80, d: 40, h: 90, color: '#ece6dc' },
  { type: 'washer', name: '洗衣機', category: '其他', w: 60, d: 65, h: 100, color: '#eef0f2' },
  { type: 'toilet', name: '馬桶', category: '其他', w: 40, d: 68, h: 76, color: '#f7f7f5' },
  { type: 'vanity', name: '洗手台', category: '其他', w: 70, d: 48, h: 85, color: '#b8916a' },
  { type: 'box', name: '方塊（自訂尺寸）', category: '其他', w: 60, d: 60, h: 60, color: '#c9b79c' },
]

export const categories = ['臥室', '客廳', '餐廚', '其他']

let seq = 0
export function newId(prefix = 'f') {
  seq += 1
  return `${prefix}-${Date.now().toString(36)}-${seq}`
}

type Seed = Omit<FurnitureItem, 'id' | 'elev'> & { id: string; elev?: number }

// 預設擺設（家具可拖曳；locked = 固定設備，要先解鎖才能移動）
const seeds: Seed[] = [
  // 客餐廳
  { id: 'shoe', type: 'cabinet', name: '鞋櫃', x: 220, y: 17.5, rot: 0, w: 120, d: 35, h: 110, color: '#ece6dc' },
  { id: 'sofa', type: 'sofa', name: '三人沙發', x: 243, y: 190, rot: 270, w: 200, d: 90, h: 80, color: '#8e9ca8' },
  { id: 'rug', type: 'rug', name: '地毯', x: 130, y: 190, rot: 90, w: 200, d: 150, h: 1, color: '#cfc5b4' },
  { id: 'coffee', type: 'coffeetable', name: '茶几', x: 140, y: 190, rot: 90, w: 100, d: 50, h: 40, color: '#a67c52' },
  { id: 'tvstand', type: 'tvstand', name: '電視櫃', x: 20, y: 185, rot: 90, w: 180, d: 40, h: 50, color: '#ece6dc' },
  { id: 'tv', type: 'tv', name: '電視 55吋', x: 16, y: 185, rot: 90, w: 123, d: 8, h: 72, elev: 50, color: '#1b1b1d' },
  { id: 'fridge', type: 'fridge', name: '冰箱', x: 35, y: 414, rot: 90, w: 70, d: 70, h: 180, color: '#d4d8dc' },
  // 餐桌靠右牆放在沙發下方，讓出主臥門、陽台門（瓦斯爐對面）與廚房走道
  { id: 'dining', type: 'table', name: '餐桌', x: 253, y: 375, rot: 90, w: 110, d: 70, h: 75, color: '#b08560' },
  { id: 'dchair1', type: 'chair', name: '餐椅', x: 193, y: 350, rot: 90, w: 45, d: 50, h: 85, color: '#6b5a4a' },
  { id: 'dchair2', type: 'chair', name: '餐椅', x: 193, y: 400, rot: 90, w: 45, d: 50, h: 85, color: '#6b5a4a' },
  { id: 'kitchen', type: 'kitchen', name: '一字型廚具', x: 30, y: 558.5, rot: 90, w: 213, d: 60, h: 85, color: '#f1eee8', locked: true },

  // 次臥
  { id: 'bbed', type: 'bed', name: '雙人床 5尺', x: 424, y: 100, rot: 0, w: 152, d: 200, h: 100, color: '#d9d3c7' },
  { id: 'bns1', type: 'nightstand', name: '床頭櫃', x: 324, y: 17.5, rot: 0, w: 40, d: 35, h: 50, color: '#b8916a' },
  { id: 'bns2', type: 'nightstand', name: '床頭櫃', x: 522, y: 17.5, rot: 0, w: 40, d: 35, h: 50, color: '#b8916a' },
  { id: 'bward', type: 'wardrobe', name: '衣櫃', x: 514.5, y: 330, rot: 270, w: 180, d: 60, h: 220, color: '#e4dccf' },
  { id: 'bdesk', type: 'desk', name: '化妝台', x: 325.5, y: 300, rot: 90, w: 100, d: 45, h: 75, color: '#e8e2d8' },
  { id: 'bchair', type: 'chair', name: '椅子', x: 370, y: 300, rot: 270, w: 45, d: 50, h: 85, color: '#5b5f63' },

  // 主臥（床頭靠左牆，讓出上方半套衛浴拉門與右側房門的動線）
  { id: 'mbed', type: 'bed', name: '雙人床 5尺', x: -186.5, y: 406, rot: 90, w: 152, d: 200, h: 100, color: '#c9d3dc' },
  { id: 'mns', type: 'nightstand', name: '床頭櫃', x: -269, y: 308, rot: 90, w: 40, d: 35, h: 50, color: '#b8916a' },
  { id: 'mward', type: 'wardrobe', name: '衣櫃', x: -256.5, y: 545, rot: 90, w: 100, d: 60, h: 220, color: '#e4dccf' },
  { id: 'mdesk', type: 'desk', name: '書桌', x: -100, y: 569.5, rot: 180, w: 120, d: 60, h: 75, color: '#c49a6c' },
  { id: 'mchair', type: 'chair', name: '椅子', x: -100, y: 515, rot: 0, w: 45, d: 50, h: 85, color: '#5b5f63' },

  // 工作陽台
  { id: 'washer', type: 'washer', name: '洗衣機', x: 459, y: 610, rot: 270, w: 60, d: 65, h: 100, color: '#eef0f2' },

  // 全套衛浴（固定設備）：淋浴間 + 馬桶 + 洗手台
  { id: 'shower', type: 'shower', name: '淋浴間', x: -239.25, y: 70, rot: 0, w: 94.5, d: 140, h: 200, color: '#e8e8e6', locked: true },
  { id: 'toilet', type: 'toilet', name: '馬桶', x: -150, y: 106, rot: 180, w: 40, d: 68, h: 76, color: '#f7f7f5', locked: true },
  { id: 'vanity', type: 'vanity', name: '洗手台', x: -62.5, y: 115, rot: 180, w: 85, d: 50, h: 85, color: '#b8916a', locked: true },
  // 半套衛浴（固定設備）：馬桶 + 洗臉盆
  { id: 'toilet2', type: 'toilet', name: '馬桶', x: -216, y: 198.5, rot: 90, w: 40, d: 68, h: 76, color: '#f7f7f5', locked: true },
  { id: 'vanity2', type: 'vanity', name: '洗臉盆', x: -39, y: 198.5, rot: 270, w: 70, d: 48, h: 85, color: '#b8916a', locked: true },

  // 冷氣平台
  { id: 'ac1', type: 'acunit', name: '冷氣室外機', x: -196, y: 660, rot: 0, w: 85, d: 32, h: 60, color: '#e3e5e7', locked: true },
  { id: 'ac2', type: 'acunit', name: '冷氣室外機', x: -86, y: 660, rot: 0, w: 85, d: 32, h: 60, color: '#e3e5e7', locked: true },
]

export function defaultFurniture(): FurnitureItem[] {
  return seeds.map((s) => ({ elev: 0, ...s }))
}
