import type { FurnitureItem } from './types'
import { hasInterior, interiorOf, peninsulaStorageLen } from './cabinet'
import { money, type ShopPick } from './data/shopping'

// 系統櫃／訂製家具估價：依 2025–2026 雙北公開報價的平均單價（15 家價目表、文章，2026/09 整理），
// 照櫃子實際的寬度、高度、抽屜與衣桿數量推算。實際以廠商丈量報價為準。

export const RATES = {
  /** 高櫃／衣櫃（210～240 高、含門片）元/尺 */
  tall: 5590,
  /** 做到頂時上方加做的上櫃 元/尺 */
  tallExtra: 3620,
  /** 矮櫃／下櫃（含門片）元/尺 */
  low: 4290,
  /** 電視櫃 元/尺 */
  tv: 3490,
  /** 45 深淺櫃的價差（多數廠商深度不影響單價，約 0～−5%） */
  shallow: -0.05,
  /** 外抽屜（緩衝、全展）元/個 */
  drawerOut: 2960,
  /** 內抽屜 元/個 */
  drawerIn: 2600,
  /** 吊衣桿／前後伸縮衣桿 元/支 */
  rod: 730,
  /** 抽拉褲架 元/組 */
  pantsRack: 3630,
  /** 人造石、石英石檯面（深 60）元/公分 */
  stone: 102,
  quartz: 178,
  /** 檯面深度超過約 68 cm（中島）的倍數 */
  deepTop: 1.5,
  /** 鐵件桌腳 元/組 */
  ironLegs: 3650,
  /** 既有廚櫃改裝 45 cm 洗碗機（拆櫃改櫃＋門板＋踢腳）元/次 */
  dishwasherMod: 10600,
}

export const RATE_NOTE =
  '依 2025–2026 雙北公開報價平均推算：高櫃 5,590／尺、做到頂的上櫃 3,620／尺、矮櫃 4,290／尺、電視櫃 3,490／尺、外抽屜 2,960／個、內抽屜 2,600／個、衣桿 730／支；人造石檯面 102、石英石 178 元／公分（中島 90 深 ×1.5）。1 尺 ≈ 30.3 公分，不足 1 尺以 1 尺計；品牌商多半免設計費、含運送安裝，實際以丈量報價為準。'

const fmt = (n: number) => n.toLocaleString('en-US')
/** 寬度換成尺（不足 1 尺以 1 尺計） */
export const chi = (cm: number) => Math.max(1, Math.ceil(cm / 30.3 - 0.05))

function counts(it: FurnitureItem) {
  const c = { drawerOut: 0, drawerIn: 0, rods: 0, pants: 0 }
  for (const face of interiorOf(it).faces)
    for (const col of face.cols)
      for (const p of col.parts) {
        if (p.kind === 'drawer') {
          if (p.front === 'drawer') c.drawerOut++
          else c.drawerIn++
        } else if (p.kind === 'hang' || p.kind === 'pullrod') c.rods++
        else if (p.kind === 'pants') c.pants++
      }
  return c
}

function extrasText(c: ReturnType<typeof counts>) {
  const out: string[] = []
  if (c.drawerOut) out.push(`外抽屜 ${c.drawerOut} × ${fmt(RATES.drawerOut)}`)
  if (c.drawerIn) out.push(`內抽屜 ${c.drawerIn} × ${fmt(RATES.drawerIn)}`)
  if (c.rods) out.push(`衣桿 ${c.rods} × ${fmt(RATES.rod)}`)
  if (c.pants) out.push(`褲架 ${c.pants} × ${fmt(RATES.pantsRack)}`)
  return out
}
const extrasCost = (c: ReturnType<typeof counts>) =>
  c.drawerOut * RATES.drawerOut + c.drawerIn * RATES.drawerIn + c.rods * RATES.rod + c.pants * RATES.pantsRack

function estPick(name: string, cost: number, detail: string, rec = true): ShopPick {
  const v = Math.round(cost / 10) * 10
  return { name, detail, cost: v, price: `約 ${money(v)}（依行情平均推算）`, rec, category: '系統櫃・訂製' }
}

/** 一件家具的估價項目（系統櫃、訂製中島、洗碗機改櫃）；不需要估價的回傳空陣列 */
export function cabinetEstimate(it: FurnitureItem): ShopPick[] {
  if (it.type === 'kitchen') {
    if (!(it.features ?? []).includes('dishwasher')) return []
    return [
      estPick('洗碗機改櫃施工（估價）', RATES.dishwasherMod, '拆掉水槽旁 45 cm 下櫃、改櫃、做同款門板與踢腳板；要抬高檯面會超過 1.5 萬'),
    ]
  }
  if (!hasInterior(it)) return []
  const c = counts(it)
  const deep = it.d > 68 ? RATES.deepTop : 1

  if (it.type === 'peninsula') {
    const n = chi(peninsulaStorageLen(it))
    const faces = interiorOf(it).faces.length
    const body = n * RATES.low * faces + extrasCost(c)
    const bodyText = [`${faces} 面 × ${n} 尺 × 矮櫃 ${fmt(RATES.low)}`, ...extrasText(c)].join(' ＋ ')
    const deepText = deep > 1 ? `，深 ${it.d} 加價 ×${deep}` : ''
    return [
      estPick('收納段櫃體（估價）', body, bodyText),
      estPick('石英石檯面（估價）', it.w * RATES.quartz * deep, `${it.w} 公分 × ${RATES.quartz} 元${deepText}；含水槽開孔以外的基本加工`),
      estPick(
        '人造石檯面（估價）',
        it.w * RATES.stone * deep,
        `${it.w} 公分 × ${RATES.stone} 元${deepText}；比石英石軟、怕熱鍋，但可無縫修補`,
        false,
      ),
      estPick('餐桌段鐵件桌腳（估價）', RATES.ironLegs, 'ㄇ字鐵腳一組（90 深），另一端靠收納段支撐'),
    ]
  }

  const n = chi(it.w)
  const [rate, rateName] = it.type === 'tvstand' ? [RATES.tv, '電視櫃'] : it.h >= 150 ? [RATES.tall, '高櫃'] : [RATES.low, '矮櫃']
  const shallow = it.type === 'wardrobe' && it.d < 55 ? 1 + RATES.shallow : 1
  const toCeiling = rate === RATES.tall && it.h > 245
  const cost = n * rate * shallow + (toCeiling ? n * RATES.tallExtra * shallow : 0) + extrasCost(c)
  const text = [
    `${n} 尺 × ${rateName} ${fmt(rate)}`,
    toCeiling ? `上櫃 ${n} 尺 × ${fmt(RATES.tallExtra)}` : '',
    shallow < 1 ? '45 深約 −5%' : '',
    ...extrasText(c),
  ]
    .filter(Boolean)
    .join(' ＋ ')
  const picks = [estPick(`${it.name}櫃體（估價）`, cost, text)]
  if (it.type === 'coffeebar') {
    picks.push(
      estPick(
        '人造石檯面（估價）',
        it.w * RATES.stone,
        `${it.w} 公分 × ${RATES.stone} 元；多數廠商最低以 200 公分計價，可以和中島檯面一起做`,
      ),
      estPick('石英石檯面（估價）', it.w * RATES.quartz, `${it.w} 公分 × ${RATES.quartz} 元`, false),
    )
  }
  return picks
}
