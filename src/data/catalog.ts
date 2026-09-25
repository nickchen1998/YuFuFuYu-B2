import type { FurnitureItem } from '../types'
import { clone } from '../cabinet'
import { seedInteriors } from './interiors'

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
  { type: 'projector', name: '投影機（小型方塊）', category: '臥室', w: 19, d: 19, h: 25, elev: 50, color: '#e9e9e6' },
  { type: 'projection', name: '投影畫面（80 吋示意）', category: '臥室', w: 177, d: 1, h: 100, elev: 95, color: '#e6eefb' },
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
  { type: 'peninsula', name: '訂製中島餐桌（半島型）', category: '餐廚', w: 220, d: 90, h: 76, color: '#ece6dc', features: ['outlets'] },
  { type: 'coffeebar', name: '咖啡櫃（零食櫃）', category: '餐廚', w: 100, d: 40, h: 90, color: '#ece6dc' },
  { type: 'coffeemaker', name: '咖啡機', category: '餐廚', w: 25, d: 35, h: 35, elev: 90, color: '#3a3a3d' },
  { type: 'microwave', name: '微波爐', category: '餐廚', w: 50, d: 40, h: 30, elev: 90, color: '#d4d7db' },
  { type: 'airfryer', name: '氣炸鍋', category: '餐廚', w: 30, d: 36, h: 33, elev: 90, color: '#2d2d30' },
  { type: 'ricecooker', name: '電鍋', category: '餐廚', w: 32, d: 32, h: 30, elev: 90, color: '#e9e4da' },
  // 其他
  { type: 'cabinet', name: '鞋櫃', category: '其他', w: 120, d: 35, h: 110, color: '#ece6dc' },
  { type: 'cabinet', name: '收納櫃', category: '其他', w: 80, d: 40, h: 90, color: '#ece6dc' },
  { type: 'washer', name: '洗衣機', category: '其他', w: 60, d: 65, h: 100, color: '#eef0f2' },
  // 參考 LG WR-100VW 10kg 熱泵乾衣機：寬 60 × 高 85 × 深 66（開門 90° 時深 111.5）
  { type: 'dryer', name: '乾衣機 10kg（LG／國際牌）', category: '其他', w: 60, d: 66, h: 85, color: '#f1f2f0' },
  { type: 'vacuum', name: '直立式吸塵器', category: '其他', w: 30, d: 25, h: 115, color: '#8a5cc2' },
  { type: 'pegboard', name: '洞洞板', category: '其他', w: 120, d: 2, h: 100, elev: 130, color: '#f4f1ea' },
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
// 訂製半島型中島餐桌（一端靠窗下的牆、兩張椅）；沙發對齊電視；鞋櫃右側留吸塵器；烘碗機（建商附）＋洗碗機（待確認改櫃）
const seeds: Seed[] = [
  // 客餐廳：電視、雙人沙發、茶几、地毯中心線對齊（y = 185）
  // 鞋櫃落地（不懸浮、不做踢腳）：最下面一格開放放室內拖鞋，腳一踢就收進去；上緣 128 和旁邊的吸塵器櫃齊平，上面是洞洞板
  { id: 'shoe', type: 'cabinet', name: '鞋櫃', x: 200, y: 17.5, rot: 0, w: 80, d: 35, h: 128, color: '#efe9df', features: ['noplinth'] },
  // 鞋櫃右側保留吸塵器位置
  // 吸塵器收在鞋櫃右邊的吸塵器櫃裡（落地、單門、櫃內預留插座充電）
  { id: 'vaccab', type: 'cabinet', name: '吸塵器收納櫃', x: 259, y: 17.5, rot: 0, w: 36, d: 35, h: 128, color: '#efe9df', features: ['noplinth'] },
  { id: 'vacuum', type: 'vacuum', name: '吸塵器（收在櫃內）', x: 259, y: 17, rot: 0, w: 30, d: 25, h: 115, elev: 1.8, color: '#8a5cc2' },
  // 洞洞板：鞋櫃與吸塵器上方一整片（130～230 公分，上方留 20 公分給冷氣）
  { id: 'pegboard', type: 'pegboard', name: '洞洞板', x: 222.5, y: 1, rot: 0, w: 125, d: 2, h: 98, elev: 132, color: '#f4f1ea' },
  { id: 'sofa', type: 'sofa', name: '三人沙發', x: 243, y: 185, rot: 270, w: 210, d: 90, h: 80, color: '#cfc4b2' },
  // 咖啡櫃（零食櫃）：沙發旁、與冰箱斜對面；90 公分高的矮櫃，檯面上方牆面兩組雙連插座
  { id: 'coffeebar', type: 'coffeebar', name: '咖啡櫃（零食櫃＋馬克杯展示）', x: 268, y: 355, rot: 270, w: 120, d: 40, h: 90, color: '#d9c2a0', features: ['outlets'] },
  // 咖啡櫃檯面（寬 120、深 40），面對咖啡櫃由左到右照沖煮順序：豆罐 ×4 → 磨豆機 → 義式咖啡機 → 奶泡機 → 右邊約 35 公分出杯區（下面就是馬克杯櫃）
  { id: 'beans', type: 'canisters', name: '咖啡豆密封罐 ×4', x: 275.5, y: 309, rot: 270, w: 23, d: 23, h: 12.5, elev: 90, color: '#e3e5e2' },
  { id: 'grinder', type: 'grinder', name: '磨豆機', x: 276, y: 331, rot: 270, w: 13, d: 21, h: 27, elev: 90, color: '#2f3033' },
  { id: 'espresso', type: 'coffeemaker', name: '義式咖啡機', x: 268.5, y: 350, rot: 270, w: 15, d: 33, h: 31, elev: 90, color: '#c4c6c8' },
  { id: 'frother', type: 'frother', name: '奶泡機', x: 276, y: 370, rot: 270, w: 10.4, d: 10.4, h: 19, elev: 90, color: '#3a3a3d' },
  { id: 'rug', type: 'rug', name: '地毯', x: 130, y: 185, rot: 90, w: 200, d: 150, h: 1, color: '#e0d6c4' },
  // 圓形小茶几（直徑 70、高 42，白橡木），離沙發約 38、離電視櫃約 50
  { id: 'coffee', type: 'coffeetable', name: '圓形小茶几', x: 125, y: 185, rot: 90, w: 70, d: 70, h: 42, color: '#c9a57a', features: ['round'] },
  // 電視櫃：實木美腿（錐形腳高 18，掃地機器人進得去），櫃體高 35，上緣 53 到壁掛電視下緣留 17
  { id: 'tvstand', type: 'tvstand', name: '電視櫃（美腿）', x: 20, y: 185, rot: 90, w: 180, d: 40, h: 53, color: '#d9c2a0', features: ['prettylegs'] },
  // 電視壁掛：下緣離地 70（坐在沙發上視線約在畫面中心），下方保留電視櫃
  { id: 'tv', type: 'tv', name: '電視 55吋（壁掛）', x: 3, y: 185, rot: 90, w: 123, d: 6, h: 72, elev: 70, color: '#1b1b1d', features: ['wallmount'] },
  // 冰箱：六門、製冰室獨立（國際牌 NR-F552YT 等，65 × 69.9 × 185），背面貼牆、上方沒有櫃子
  { id: 'fridge', type: 'fridge', name: '冰箱（六門）', x: 35, y: 414, rot: 90, w: 65, d: 70, h: 185, color: '#d4d8dc', features: ['sixdoor'] },
  // 訂製中島餐桌（半島型，一件式）：一端靠窗下的牆，檯面連續高 76（壓在窗台 80 下）。
  // 靠窗 99 公分是收納（朝廚房嵌微波爐＋電子鍋抽拉層板＋抽屜，另一側電鍋、氣炸鍋抽拉層板＋門片櫃，見 interiors.ts），
  // 往室內 71 公分是餐桌（兩人面對面，一側一張），總長 170；圖上是椅子收進桌下的樣子；
  // 收起時廚房側走道 60、次臥門與陽台門側走道 68；瓦斯爐前站位 65
  {
    id: 'dining', type: 'peninsula', name: '訂製中島餐桌', x: 170, y: 580, rot: 90, w: 170, d: 90, h: 76,
    color: '#efe9df', features: ['outlets', 'woodtop'],
  },
  { id: 'dchair1', type: 'chair', name: '餐椅', x: 145, y: 533, rot: 90, w: 45, d: 50, h: 85, color: '#c49a6c' },
  { id: 'dchair2', type: 'chair', name: '餐椅', x: 195, y: 533, rot: 270, w: 45, d: 50, h: 85, color: '#c49a6c' },
  // 電鍋、氣炸鍋收在中島走道側的抽拉開放層板上（離地約 39.5），用的時候拉出來；
  // 氣炸鍋橫放（走道側淨深只有 29），炸籃朝餐桌那頭
  { id: 'rice', type: 'ricecooker', name: '電鍋（抽拉層板）', x: 198.5, y: 639.8, rot: 90, w: 31, d: 26, h: 26, elev: 39.5, color: '#e9e4da' },
  { id: 'fryer', type: 'airfryer', name: '氣炸鍋（抽拉層板）', x: 198.5, y: 591.2, rot: 180, w: 24, d: 32.5, h: 31, elev: 39.5, color: '#2d2d30' },
  // 電子鍋（象印 NS-LBF05 23 × 30 × 19）：平常收在中島廚房側、微波爐旁的抽拉層板上（離地約 47.5）；
  // 上蓋往上掀要約 40 cm，格子裡打不開，煮飯時整台拿到正上方靠窗的檯面、插平面插座
  { id: 'ecooker', type: 'ecooker', name: '電子鍋（抽拉層板收納）', x: 154.4, y: 644.4, rot: 270, w: 23, d: 30, h: 19, elev: 47.5, color: '#e7e3dc' },
  // 分類垃圾桶：裝在水槽下櫃靠冰箱那扇門後面（Hailo Tandem AS 15/15，寬 25 × 深 48 × 高 40），開門桶子就跟著滑出來；
  // 前面 15 L 一般垃圾（套 14 L 專用袋）、後面 15 L 回收；避開水槽正下方的存水彎和右邊洗碗機的水管
  { id: 'kbin', type: 'pullbin', name: '分類垃圾桶（水槽下櫃・抽拉）', x: 34, y: 467, rot: 90, w: 25, d: 48, h: 40, elev: 10, color: '#4a4d52' },
  {
    id: 'kitchen', type: 'kitchen', name: '一字型廚具', x: 30, y: 558.5, rot: 90, w: 213, d: 60, h: 85,
    color: '#f1eee8', locked: true, features: ['dishdryer', 'dishwasher'],
  },
  // 外套掛架：進門右手邊、沙發旁 45 公分寬的牆（輕隔間）掛 IKEA PLOGA 垂直掛鉤架（37 × 6 × 60），上緣離地 190：
  // 5 支鋁桿約在 186／173／159／148／134，上面掛長大衣（184 公分）、中間掛外套（154 公分）、最下面掛包包
  { id: 'coathooks', type: 'coathooks', name: '外套掛架（IKEA PLOGA）', x: 278, y: 57, rot: 270, w: 37, d: 20, h: 120, elev: 70, color: '#d9b98f', features: ['ploga'] },
  // Dyson 直立式涼風扇（Purifier Cool TP11，高 105、底座 22）：三個房間各一台
  // 客廳這台靠牆放在咖啡櫃靠餐廳那一側（沙發那側只剩 5 公分），斜朝客廳、出風避開咖啡櫃；離次臥門約 28 公分
  { id: 'fan-living', type: 'towerfan', name: 'Dyson 直立式電扇（客廳）', x: 273, y: 431, rot: 250, w: 22, d: 22, h: 105, color: '#eef0f2' },
  // 主臥這台放窗邊的牆角（床尾那側，另一個窗邊角落是床頭櫃），斜朝床
  { id: 'fan-master', type: 'towerfan', name: 'Dyson 直立式電扇（主臥）', x: -31, y: 583, rot: 235, w: 22, d: 22, h: 105, color: '#eef0f2' },
  // 次臥這台靠牆放在書房矮櫃靠衣櫃那一端（離衣櫃拉門約 1.2 m），斜朝升降桌和按摩椅中間，擺頭兩邊都吹得到
  { id: 'fan-bed2', type: 'towerfan', name: 'Dyson 直立式電扇（次臥）', x: 320, y: 198, rot: 60, w: 22, d: 22, h: 105, color: '#eef0f2' },
  // 身高參考：184 與 154 公分的人，站在電視區和冰箱之間，看人和家具的高低比例（不是家具）
  { id: 'person184', type: 'person', name: '身高參考 184 公分', x: 95, y: 315, rot: 0, w: 46, d: 26, h: 184, color: '#5f7488' },
  { id: 'person154', type: 'person', name: '身高參考 154 公分', x: 150, y: 315, rot: 0, w: 38, d: 22, h: 154, color: '#c9a98a' },
  // 冷氣：鞋櫃上方，沿長邊往廚房吹（冷媒管需經天花板接回冷氣平台，約 7 米）
  { id: 'ac-living', type: 'acindoor', name: '冷氣（客餐廳）', x: 200, y: 12.5, rot: 0, w: 90, d: 25, h: 30, elev: 250, color: '#f4f4f2' },

  // 主臥：加大雙人床 6 尺床頭靠左牆，兩側 30 公分床頭櫃（買現成的，靠窗那側只有 30 寬）；上牆左段是 45 公分深的薄型衣櫃（對開窄門，前方留 52 公分）
  { id: 'mbed', type: 'bed', name: '加大雙人床 6尺', x: -186.5, y: 478.5, rot: 90, w: 182, d: 200, h: 100, color: '#ece6da' },
  { id: 'mns1', type: 'nightstand', name: '床頭櫃', x: -269, y: 372.5, rot: 90, w: 30, d: 35, h: 50, color: '#c9a57a' },
  { id: 'mns2', type: 'nightstand', name: '床頭櫃', x: -269, y: 584.5, rot: 90, w: 30, d: 35, h: 50, color: '#c9a57a' },
  // 投影機：靠窗側床頭櫃上，斜向對準床尾那面牆（投影畫面中心對齊床的中線）
  { id: 'projector', type: 'projector', name: '投影機', x: -269, y: 584.5, rot: 110, w: 19, d: 19, h: 25, elev: 50, color: '#e9e9e6' },
  // 衣櫃做到頂（300）；內部規劃見 interiors.ts
  { id: 'mward', type: 'wardrobe', name: '衣櫃（薄型 45 深）', x: -219, y: 282.5, rot: 0, w: 135, d: 45, h: 300, color: '#efe9df' },
  // 全身鏡 40 × 150（IKEA NISSEDAL 白框）：鎖在主臥衣櫃右側板（朝房門那側，不對床、開門也不會擋到）；
  // 離地 30～180：154 公分看得到腳、184 公分看得到頭頂；拿了衣服轉身就能照
  { id: 'mirror', type: 'mirror', name: '全身鏡（衣櫃側板）', x: -150.25, y: 282.5, rot: 90, w: 40, d: 2.5, h: 150, elev: 30, color: '#f2f0eb' },
  // 冷氣：窗戶上方（窗外就是冷氣平台，管線最短）；導風板往上調，避免直吹床
  { id: 'ac-master', type: 'acindoor', name: '冷氣（主臥）', x: -130, y: 587, rot: 180, w: 85, d: 25, h: 30, elev: 250, color: '#f4f4f2' },

  // 次臥（書房＋主要衣櫃＋按摩椅）：衣櫃整排貼上牆；按摩椅靠分戶牆、面向房內；兩張升降桌並排靠分戶牆
  // 次臥主衣櫃：不鏽鋼色鋼管收納（不用木板、合成板）＋整面落地頂天拉門（鋁框霧面玻璃，上吊軌道），前方不用留開門空間
  { id: 'bward1', type: 'wardrobe', name: '衣櫃（鋼管＋拉門）', x: 423.75, y: 30, rot: 0, w: 241.5, d: 60, h: 300, color: '#efe9df', features: ['steel', 'sliding', 'noplinth'] },
  // 按摩椅：選零靠牆機型（背後留 5 公分），躺平時往前滑到約 180 公分
  { id: 'massage', type: 'massagechair', name: '按摩椅', x: 469.5, y: 170, rot: 270, w: 80, d: 140, h: 115, color: '#4a4541' },
  { id: 'bdesk1', type: 'standingdesk', name: '升降桌', x: 514.5, y: 340, rot: 270, w: 120, d: 60, h: 73, color: '#d8c3a5' },
  { id: 'bdesk2', type: 'standingdesk', name: '升降桌', x: 514.5, y: 460, rot: 270, w: 120, d: 60, h: 73, color: '#d8c3a5' },
  { id: 'bchair1', type: 'chair', name: '辦公椅', x: 452, y: 340, rot: 90, w: 50, d: 50, h: 100, color: '#5b5f63' },
  { id: 'bchair2', type: 'chair', name: '辦公椅', x: 452, y: 460, rot: 90, w: 50, d: 50, h: 100, color: '#5b5f63' },
  // 椅子背後（靠客廳的輕隔間）：矮櫃放文件、線材、印表機（落地，高 90）；到次臥門前 5 公分為止、避開按摩椅前方。
  // 上方書櫃先拿掉（住戶覺得太高），之後再決定。
  // 最右邊（靠衣櫃那端）是掃地機器人的家：那格不做底板，櫃深加到 45（基座 40＋機器人不凸出），整座不做踢腳；前方淨空 80 以上
  { id: 'scab', type: 'cabinet', name: '書房矮櫃（文件・印表機・掃地機器人）', x: 325.5, y: 340, rot: 90, w: 250, d: 45, h: 90, color: '#d9c2a0', features: ['noplinth'] },
  // 冷氣：窗戶上方，沿長邊往衣櫃方向吹，風從桌子側邊經過
  { id: 'ac-study', type: 'acindoor', name: '冷氣（次臥）', x: 395, y: 541.5, rot: 180, w: 80, d: 25, h: 30, elev: 250, color: '#f4f4f2' },

  // 工作陽台：洗衣機、乾衣機並排靠柱子那側（不堆疊），整組推到次臥窗下那面牆，離女兒牆遠、不易淋雨；門朝陽台內
  { id: 'washer', type: 'washer', name: '洗衣機', x: 459, y: 600, rot: 270, w: 60, d: 65, h: 100, color: '#eef0f2' },
  // 乾衣機：參考 LG WR-100VW（60 × 85 × 66，110V）或國際牌 NH-VS100HP（約 59.6 × 84.5 × 66.7）
  { id: 'dryer', type: 'dryer', name: '乾衣機 10kg', x: 458.5, y: 665.5, rot: 270, w: 60, d: 66, h: 85, color: '#f1f2f0' },

  // 全套衛浴（固定設備）：淋浴間 + 馬桶 + 洗手台
  { id: 'shower', type: 'shower', name: '淋浴間', x: -239.25, y: 70, rot: 0, w: 94.5, d: 140, h: 200, color: '#e8e8e6', locked: true },
  { id: 'toilet', type: 'toilet', name: '馬桶', x: -150, y: 106, rot: 180, w: 40, d: 68, h: 76, color: '#f7f7f5', locked: true },
  // 全套衛浴洗手台：柯林斯 ST-R-80（盆 80 × 48、壁掛櫃高 60），靠右邊牆；朝馬桶那端（左邊）26.5 寬開放格放衛生紙，
  // 正面和側面都拿得到，坐在馬桶上伸手就拿到（開放格離馬桶約 30）
  { id: 'vanity', type: 'vanity', name: '洗臉盆浴櫃（全套衛浴・側邊開放格）', x: -60, y: 116, rot: 180, w: 80, d: 48, h: 85, color: '#efe9df', locked: true, features: ['sideniche'] },
  // 鏡櫃（全套）：和成 LAG8066BF 80 × 16 × 66 除霧鏡櫃，對齊洗手台；離地 118～184（龍頭上方留約 13，184 公分照得到頭頂）
  { id: 'mcab1', type: 'mirrorcab', name: '鏡櫃（全套衛浴・除霧）', x: -60, y: 132, rot: 180, w: 80, d: 16, h: 66, elev: 118, color: '#f4f3ef' },
  // 主臥半套衛浴（固定設備）：馬桶 + 洗臉盆
  { id: 'toilet2', type: 'toilet', name: '馬桶', x: -216, y: 198.5, rot: 90, w: 40, d: 68, h: 76, color: '#f7f7f5', locked: true },
  { id: 'vanity2', type: 'vanity', name: '洗臉盆浴櫃（半套衛浴）', x: -39, y: 198.5, rot: 270, w: 70, d: 48, h: 85, color: '#efe9df', locked: true },
  // 鏡櫃（半套）：大巨光 1450 50 × 14 × 60（上面鏡門、下面一格開放層板），對齊 51 寬的洗臉盆；離地 120～180
  { id: 'mcab2', type: 'mirrorcab', name: '鏡櫃（半套衛浴）', x: -22, y: 198.5, rot: 270, w: 50, d: 14, h: 60, elev: 120, color: '#f4f3ef', features: ['openshelf'] },

  // 冷氣平台
  { id: 'ac1', type: 'acunit', name: '冷氣室外機', x: -196, y: 660, rot: 0, w: 85, d: 32, h: 60, color: '#e3e5e7', locked: true },
  { id: 'ac2', type: 'acunit', name: '冷氣室外機', x: -86, y: 660, rot: 0, w: 85, d: 32, h: 60, color: '#e3e5e7', locked: true },
]

export function defaultFurniture(): FurnitureItem[] {
  return seeds.map((s) => {
    const it: FurnitureItem = { elev: 0, ...s }
    const inter = seedInteriors[s.id]
    if (inter) it.interior = clone(inter)
    return it
  })
}
