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
  features?: string[]
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
  { type: 'standingdesk', name: '升降桌 120', category: '臥室', w: 120, d: 60, h: 73, color: '#d8c3a5' },
  { type: 'chair', name: '辦公椅', category: '臥室', w: 50, d: 50, h: 100, color: '#5b5f63' },
  // 客廳
  { type: 'sofa', name: '三人沙發', category: '客廳', w: 200, d: 90, h: 80, color: '#8e9ca8' },
  { type: 'sofa', name: '雙人沙發', category: '客廳', w: 160, d: 85, h: 80, color: '#8e9ca8' },
  { type: 'sofa', name: '單人沙發', category: '客廳', w: 85, d: 85, h: 80, color: '#b89b7a' },
  { type: 'massagechair', name: '按摩椅', category: '客廳', w: 80, d: 140, h: 115, color: '#4a4541' },
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
  { type: 'island', name: '中島', category: '餐廚', w: 120, d: 60, h: 90, color: '#ece6dc' },
  { type: 'island', name: '中島（嵌微波爐）', category: '餐廚', w: 100, d: 50, h: 90, color: '#ece6dc', features: ['microwave'] },
  { type: 'diningisland', name: '餐桌中島（收納＋餐桌）', category: '餐廚', w: 190, d: 75, h: 90, color: '#ece6dc', features: ['microwave'] },
  {
    type: 'windowisland', name: '窗下訂製中島（抽拉餐桌）', category: '餐廚', w: 110, d: 50, h: 78, color: '#ece6dc',
    features: ['microwave', 'tableout'],
  },
  { type: 'peninsula', name: '訂製中島餐桌（半島型）', category: '餐廚', w: 220, d: 70, h: 76, color: '#ece6dc', features: ['microwave'] },
  { type: 'coffeebar', name: '咖啡櫃（零食櫃）', category: '餐廚', w: 100, d: 40, h: 200, color: '#ece6dc' },
  { type: 'coffeemaker', name: '咖啡機', category: '餐廚', w: 25, d: 35, h: 35, elev: 88, color: '#3a3a3d' },
  { type: 'microwave', name: '微波爐', category: '餐廚', w: 50, d: 40, h: 30, elev: 90, color: '#d4d7db' },
  { type: 'airfryer', name: '氣炸鍋', category: '餐廚', w: 30, d: 36, h: 33, elev: 90, color: '#2d2d30' },
  { type: 'ricecooker', name: '電鍋', category: '餐廚', w: 32, d: 32, h: 30, elev: 90, color: '#e9e4da' },
  // 其他
  { type: 'cabinet', name: '鞋櫃', category: '其他', w: 120, d: 35, h: 110, color: '#ece6dc' },
  { type: 'cabinet', name: '收納櫃', category: '其他', w: 80, d: 40, h: 90, color: '#ece6dc' },
  { type: 'washer', name: '洗衣機', category: '其他', w: 60, d: 65, h: 100, color: '#eef0f2' },
  { type: 'vacuum', name: '直立式吸塵器', category: '其他', w: 30, d: 25, h: 115, color: '#8a5cc2' },
  { type: 'acindoor', name: '冷氣室內機', category: '其他', w: 85, d: 25, h: 30, elev: 250, color: '#f4f4f2' },
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
// 住戶需求（2026-09）：兩人住；次臥當書房＋主要衣櫃＋按摩椅；主臥只放睡眠相關；
// 訂製半島型中島餐桌（一端靠窗下的牆、四張椅）；沙發對齊電視；鞋櫃右側留吸塵器；烘碗機（建商附）＋洗碗機（待確認改櫃）
const seeds: Seed[] = [
  // 客餐廳：電視、雙人沙發、茶几、地毯中心線對齊（y = 185）
  { id: 'shoe', type: 'cabinet', name: '鞋櫃', x: 200, y: 17.5, rot: 0, w: 80, d: 35, h: 110, color: '#ece6dc' },
  // 鞋櫃右側保留吸塵器位置
  { id: 'vacuum', type: 'vacuum', name: '吸塵器', x: 262, y: 15, rot: 0, w: 30, d: 25, h: 115, color: '#8a5cc2' },
  { id: 'sofa', type: 'sofa', name: '三人沙發', x: 243, y: 185, rot: 270, w: 210, d: 90, h: 80, color: '#8e9ca8' },
  // 咖啡櫃（零食櫃）：沙發旁、與冰箱斜對面；中段檯面放咖啡機（建議預留插座）
  { id: 'coffeebar', type: 'coffeebar', name: '咖啡櫃（零食櫃）', x: 268, y: 345, rot: 270, w: 100, d: 40, h: 200, color: '#ece6dc' },
  { id: 'espresso', type: 'coffeemaker', name: '咖啡機', x: 266, y: 345, rot: 270, w: 25, d: 35, h: 35, elev: 88, color: '#3a3a3d' },
  { id: 'rug', type: 'rug', name: '地毯', x: 130, y: 185, rot: 90, w: 200, d: 150, h: 1, color: '#cfc5b4' },
  { id: 'coffee', type: 'coffeetable', name: '茶几', x: 145, y: 185, rot: 90, w: 100, d: 50, h: 40, color: '#a67c52' },
  { id: 'tvstand', type: 'tvstand', name: '電視櫃', x: 20, y: 185, rot: 90, w: 180, d: 40, h: 50, color: '#ece6dc' },
  { id: 'tv', type: 'tv', name: '電視 55吋', x: 16, y: 185, rot: 90, w: 123, d: 8, h: 72, elev: 50, color: '#1b1b1d' },
  { id: 'fridge', type: 'fridge', name: '冰箱', x: 35, y: 414, rot: 90, w: 70, d: 70, h: 180, color: '#d4d8dc' },
  // 訂製中島餐桌（半島型，一件式）：一端靠窗下的牆，檯面連續高 76（壓在窗台 80 下）。
  // 靠窗 100 公分是收納（朝廚房嵌微波爐＋抽屜，另一側門片櫃；檯面放電鍋、氣炸鍋），往室內 120 公分是餐桌。
  // 寬 90：檯面上電鍋、氣炸鍋可以橫向並排；四張椅子兩側各兩張，圖上是收進桌下的樣子；
  // 收起時廚房側走道 60、次臥門與陽台門側走道 68；瓦斯爐前站位 65
  {
    id: 'dining', type: 'peninsula', name: '訂製中島餐桌', x: 170, y: 555, rot: 90, w: 220, d: 90, h: 76,
    color: '#ece6dc', features: ['microwave'],
  },
  { id: 'dchair1', type: 'chair', name: '餐椅', x: 145, y: 475, rot: 90, w: 45, d: 50, h: 85, color: '#6b5a4a' },
  { id: 'dchair2', type: 'chair', name: '餐椅', x: 145, y: 535, rot: 90, w: 45, d: 50, h: 85, color: '#6b5a4a' },
  { id: 'dchair3', type: 'chair', name: '餐椅', x: 195, y: 475, rot: 270, w: 45, d: 50, h: 85, color: '#6b5a4a' },
  { id: 'dchair4', type: 'chair', name: '餐椅', x: 195, y: 535, rot: 270, w: 45, d: 50, h: 85, color: '#6b5a4a' },
  // 電鍋、氣炸鍋在收納段檯面上橫向並排，正面朝餐桌
  { id: 'rice', type: 'ricecooker', name: '電鍋', x: 148, y: 615, rot: 180, w: 32, d: 32, h: 30, elev: 76, color: '#e9e4da' },
  { id: 'fryer', type: 'airfryer', name: '氣炸鍋', x: 192, y: 615, rot: 180, w: 30, d: 36, h: 33, elev: 76, color: '#2d2d30' },
  {
    id: 'kitchen', type: 'kitchen', name: '一字型廚具', x: 30, y: 558.5, rot: 90, w: 213, d: 60, h: 85,
    color: '#f1eee8', locked: true, features: ['dishdryer', 'dishwasher'],
  },
  // 冷氣：鞋櫃上方，沿長邊往廚房吹（冷媒管需經天花板接回冷氣平台，約 7 米）
  { id: 'ac-living', type: 'acindoor', name: '冷氣（客餐廳）', x: 200, y: 12.5, rot: 0, w: 90, d: 25, h: 30, elev: 250, color: '#f4f4f2' },

  // 主臥：加大雙人床 6 尺床頭靠左牆，兩側 30 公分床頭櫃；上牆左段是 45 公分深的薄型衣櫃（推拉門，前方留 52 公分）
  { id: 'mbed', type: 'bed', name: '加大雙人床 6尺', x: -186.5, y: 478.5, rot: 90, w: 182, d: 200, h: 100, color: '#c9d3dc' },
  { id: 'mns1', type: 'nightstand', name: '床頭櫃', x: -269, y: 372.5, rot: 90, w: 30, d: 35, h: 50, color: '#b8916a' },
  { id: 'mns2', type: 'nightstand', name: '床頭櫃', x: -269, y: 584.5, rot: 90, w: 30, d: 35, h: 50, color: '#b8916a' },
  { id: 'mward', type: 'wardrobe', name: '衣櫃（薄型 45 深）', x: -219, y: 282.5, rot: 0, w: 135, d: 45, h: 240, color: '#e4dccf' },
  // 冷氣：窗戶上方（窗外就是冷氣平台，管線最短）；導風板往上調，避免直吹床
  { id: 'ac-master', type: 'acindoor', name: '冷氣（主臥）', x: -130, y: 587, rot: 180, w: 85, d: 25, h: 30, elev: 250, color: '#f4f4f2' },

  // 次臥（書房＋主要衣櫃＋按摩椅）：衣櫃整排貼上牆；按摩椅靠分戶牆、面向房內；兩張升降桌並排靠分戶牆
  { id: 'bward1', type: 'wardrobe', name: '衣櫃', x: 423.75, y: 30, rot: 0, w: 241.5, d: 60, h: 240, color: '#e4dccf' },
  // 按摩椅：選零靠牆機型（背後留 5 公分），躺平時往前滑到約 180 公分
  { id: 'massage', type: 'massagechair', name: '按摩椅', x: 469.5, y: 170, rot: 270, w: 80, d: 140, h: 115, color: '#4a4541' },
  { id: 'bdesk1', type: 'standingdesk', name: '升降桌', x: 514.5, y: 340, rot: 270, w: 120, d: 60, h: 73, color: '#d8c3a5' },
  { id: 'bdesk2', type: 'standingdesk', name: '升降桌', x: 514.5, y: 460, rot: 270, w: 120, d: 60, h: 73, color: '#d8c3a5' },
  { id: 'bchair1', type: 'chair', name: '辦公椅', x: 452, y: 340, rot: 90, w: 50, d: 50, h: 100, color: '#5b5f63' },
  { id: 'bchair2', type: 'chair', name: '辦公椅', x: 452, y: 460, rot: 90, w: 50, d: 50, h: 100, color: '#5b5f63' },
  // 冷氣：窗戶上方，沿長邊往衣櫃方向吹，風從桌子側邊經過
  { id: 'ac-study', type: 'acindoor', name: '冷氣（次臥）', x: 395, y: 541.5, rot: 180, w: 80, d: 25, h: 30, elev: 250, color: '#f4f4f2' },

  // 工作陽台
  { id: 'washer', type: 'washer', name: '洗衣機', x: 459, y: 610, rot: 270, w: 60, d: 65, h: 100, color: '#eef0f2' },

  // 全套衛浴（固定設備）：淋浴間 + 馬桶 + 洗手台
  { id: 'shower', type: 'shower', name: '淋浴間', x: -239.25, y: 70, rot: 0, w: 94.5, d: 140, h: 200, color: '#e8e8e6', locked: true },
  { id: 'toilet', type: 'toilet', name: '馬桶', x: -150, y: 106, rot: 180, w: 40, d: 68, h: 76, color: '#f7f7f5', locked: true },
  { id: 'vanity', type: 'vanity', name: '洗手台', x: -62.5, y: 115, rot: 180, w: 85, d: 50, h: 85, color: '#b8916a', locked: true },
  // 主臥半套衛浴（固定設備）：馬桶 + 洗臉盆
  { id: 'toilet2', type: 'toilet', name: '馬桶', x: -216, y: 198.5, rot: 90, w: 40, d: 68, h: 76, color: '#f7f7f5', locked: true },
  { id: 'vanity2', type: 'vanity', name: '洗臉盆', x: -39, y: 198.5, rot: 270, w: 70, d: 48, h: 85, color: '#b8916a', locked: true },

  // 冷氣平台
  { id: 'ac1', type: 'acunit', name: '冷氣室外機', x: -196, y: 660, rot: 0, w: 85, d: 32, h: 60, color: '#e3e5e7', locked: true },
  { id: 'ac2', type: 'acunit', name: '冷氣室外機', x: -86, y: 660, rot: 0, w: 85, d: 32, h: 60, color: '#e3e5e7', locked: true },
]

export function defaultFurniture(): FurnitureItem[] {
  return seeds.map((s) => ({ elev: 0, ...s }))
}
