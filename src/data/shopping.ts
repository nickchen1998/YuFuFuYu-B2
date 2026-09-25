import type { FurnitureItem } from '../types'
import { hasInterior } from '../cabinet'

// 每件家具的選購資料：規格需求、建議商品（附連結）、廠商、系統櫃板材。
// 價格、型號是 2026/09 上網查到的，實際以通路和廠商報價為準。

export interface ShopPick {
  name: string
  detail?: string
  price?: string
  url?: string
  source?: string
}
export interface ShopVendor {
  name: string
  detail?: string
  phone?: string
  url?: string
}
export interface ShopInfo {
  summary?: string
  specs?: string[]
  picks?: ShopPick[]
  search?: string[]
  vendors?: ShopVendor[]
  /** 系統櫃：板材、五金 */
  material?: string[]
  notes?: string[]
}

/** 同款家具共用一份資料 */
const alias: Record<string, string> = {
  dchair2: 'dchair1',
  dchair3: 'dchair1',
  dchair4: 'dchair1',
  bdesk2: 'bdesk1',
  bchair2: 'bchair1',
  mns2: 'mns1',
  ac2: 'ac1',
  toilet2: 'toilet',
  vanity2: 'vanity',
}

export const shopping: Record<string, ShopInfo> = {}

/** 系統櫃共用的板材、五金建議 */
export const cabinetMaterials: {
  summary?: string
  boards?: string[]
  doors?: string[]
  hardware?: string[]
  prices?: string[]
  checks?: string[]
} = {}

/** 系統櫃／木作廠商 */
export const cabinetVendors: ShopVendor[] = []
export const cabinetSearch: string[] = []

export function shopInfo(it: FurnitureItem): ShopInfo | undefined {
  return shopping[it.id] ?? shopping[alias[it.id] ?? '']
}

export const pchomeUrl = (q: string) => `https://24h.pchome.com.tw/search/?q=${encodeURIComponent(q)}`
export const momoUrl = (q: string) => `https://www.momoshop.com.tw/search/searchShop.jsp?keyword=${encodeURIComponent(q)}`
export const googleUrl = (q: string) => `https://www.google.com/search?q=${encodeURIComponent(q)}`

const APPLIANCES = ['tv', 'fridge', 'washer', 'dryer', 'acindoor', 'acunit', 'vacuum', 'coffeemaker', 'ricecooker', 'airfryer', 'microwave', 'projector']

/** 分類：系統櫃（訂做）、訂製、家電、建商附、家具 */
export function itemCategory(it: FurnitureItem): string {
  if (it.type === 'kitchen' || it.locked) return '建商附'
  if (it.type === 'peninsula') return '訂製'
  if (hasInterior(it)) return '系統櫃'
  if (it.type === 'projection') return '示意'
  if (APPLIANCES.includes(it.type)) return '家電'
  return '家具'
}
