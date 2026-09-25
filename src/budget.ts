import { computed } from 'vue'
import { design } from './store'
import { isPicked, pickKey } from './purchases'
import { itemCategory, pickCost, pickGroups, shopKey, type PickGroup } from './data/shopping'
import { cabinetEstimate } from './estimate'
import type { FurnitureItem } from './types'

// 預算：把勾選的商品加總（同款家具乘上數量，例如餐椅 ×4）

export interface BudgetLine {
  /** 家具的選購資料 key（同款共用） */
  root: string
  furnitureId: string
  item: string
  title: string
  pick: string
  unit: number | null
  qty: number
  total: number | null
  category: string
  note?: string
}

export const BUDGET_CATS = ['家具', '家電・設備', '系統櫃・訂製']

function budgetCategory(it: FurnitureItem) {
  const c = itemCategory(it)
  if (c === '系統櫃' || c === '訂製') return '系統櫃・訂製'
  if (c === '家電' || c === '建商附') return '家電・設備'
  return '家具'
}

/** 系統櫃／訂製家具的估價（可以勾選，計入總花費） */
export function estimateGroup(it: FurnitureItem): PickGroup | null {
  const picks = cabinetEstimate(it)
  if (!picks.length) return null
  return { key: `${shopKey(it) ?? it.id}/估價`, title: '估價', picks, qty: 1 }
}

/** 同款家具合併：key → 數量與第一件 */
export function furnitureGroups(list: FurnitureItem[]) {
  const groups = new Map<string, { qty: number; first: FurnitureItem }>()
  for (const it of list) {
    const k = shopKey(it)
    if (!k) continue
    const g = groups.get(k)
    if (g) g.qty++
    else groups.set(k, { qty: 1, first: it })
  }
  return groups
}

export const budget = computed(() => {
  const lines: BudgetLine[] = []
  for (const [root, g] of furnitureGroups(design.furniture)) {
    const cat = budgetCategory(g.first)
    const est = estimateGroup(g.first)
    for (const pg of [...pickGroups(root, g.qty), ...(est ? [est] : [])]) {
      for (const p of pg.picks) {
        if (!isPicked(pickKey(pg.key, p.name), p.rec)) continue
        const unit = pickCost(p)
        lines.push({
          root,
          furnitureId: g.first.id,
          item: g.first.name,
          title: pg.title,
          pick: p.name,
          unit,
          qty: pg.qty,
          total: unit == null ? null : unit * pg.qty,
          category: p.category ?? (pg.key === root ? cat : '家電・設備'),
          note: p.costNote,
        })
      }
    }
  }
  const total = lines.reduce((s, l) => s + (l.total ?? 0), 0)
  const unknown = lines.filter((l) => l.total == null).length
  const byCat = BUDGET_CATS.map((name) => ({
    name,
    total: lines.filter((l) => l.category === name).reduce((s, l) => s + (l.total ?? 0), 0),
  })).filter((c) => c.total > 0)
  const byRoot = new Map<string, number>()
  for (const l of lines) byRoot.set(l.root, (byRoot.get(l.root) ?? 0) + (l.total ?? 0))
  return { lines, total, unknown, byCat, byRoot }
})
