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

export const shopping: Record<string, ShopInfo> = {
  // ───────────── 系統櫃（2026/09 查詢） ─────────────
  bward1: {
    summary: '300 cm 到頂四欄大衣櫃：分上下兩桶疊裝，門片分段，五金集中在抽屜與吊桿。',
    material: [
      '桶身 18 mm 美耐皿系統板＋8 mm 背板；上櫃 70 cm 另成一桶疊上，接縫對齊門縫',
      '每欄門片約 58 寬 × 228 高，裝 4 個緩衝鉸鏈；上櫃短門裝 2 個',
      '外抽屜用三節全展緩衝滑軌；吊桿選加厚鋁管，約 57 cm 跨距不需中撐',
    ],
    notes: [
      '28 吋行李箱約 46～50 寬、70～76 高：格內淨高留 80 以上、淨寬 52 以上',
      '長衣區淨高 150 以上；雙吊上下各留約 95～100',
      '到頂要現場量天花板與樑，頂端留 1～2 cm 用封板收邊',
      '上櫃放棉被、過季衣物，可配下拉式升降衣桿（要符合欄寬規格）',
    ],
  },
  mward: {
    summary: '45 cm 淺衣櫃，衣架無法橫掛，改用前後伸縮衣桿＋窄門。',
    material: [
      '18 mm 桶身、8 mm 背板；300 高同樣分上下兩桶疊裝',
      '對開窄門約 34 寬 × 228 高，每片 4 個鉸鏈；窄高門容易翹，可以問廠商有沒有門片校正器',
      '伸縮衣桿鎖在層板下方，每欄裝 1 支（衣服寬約 45～50）',
    ],
    notes: [
      '只放常穿的衣服，厚大衣掛次臥主衣櫃',
      '外抽屜放摺疊衣物，深約 40 cm 用全展緩衝滑軌',
      '確認門片打開後，伸縮桿拉出來不會卡到門片或鉸鏈',
    ],
  },
  shoe: {
    summary: '玄關矮鞋櫃：底部 20 cm 開放放常穿鞋，中段門片可調層板，頂層抽屜放小物。',
    material: [
      '桶身指定 P3 防潮板；層板打 32 mm 排孔可調，每層 15～18 cm（短靴 25～30）',
      '對開門約 2 × 40 cm；門片下緣留縫，或背板上下開通風孔形成對流',
      '頂層抽屜深 10～15 cm 放鑰匙、口罩，用緩衝滑軌',
    ],
    notes: [
      '內寬約 76 cm，每層約 3 雙；門片段 4 層約 12 雙，加開放層約 15 雙',
      '開放層底板用耐刮耐水的面材或放鞋盤，濕鞋先晾乾再收',
      '旁邊預留插座，可以放除濕棒或小風扇',
    ],
  },
  coffeebar: {
    summary: '咖啡機檯面要耐水、耐熱，下方抽屜＋門片，預留插座與散熱。',
    material: [
      '檯面建議人造石、石英石或 HPL 美耐板，不用一般系統板檯面（封邊怕水）',
      '桶身指定 P3 防潮板；抽屜三節全展緩衝，膠囊、咖啡豆放淺抽',
      '咖啡機約 1,200～1,500 W，建議專用迴路插座（請水電確認）',
    ],
    notes: ['櫃深 40 cm：確認咖啡機深度，加上背後 5～10 cm 散熱與插頭空間'],
  },
  tvstand: {
    summary: '低矮電視櫃：網路設備格要散熱、好走線；做懸空要先確認牆體。',
    material: [
      '懸空：RC 牆用吊碼＋膨脹螺絲；輕隔間要預埋 18 mm 夾板，否則改用櫃腳',
      '網路設備格背板開散熱孔和走線孔，或這格不裝背板',
      '180 cm 長：頂底板用 25 mm，或分兩桶，避免中間下垂；抽屜用全展緩衝',
    ],
    notes: [
      '網路設備格預留插座與網路孔，前面不裝門或改用格柵門',
      '懸空離地至少 12～15 cm（依掃地機高度）；櫃腳方案用可調腳＋踢腳板，較便宜',
    ],
  },
  mns1: {
    summary: '主臥兩個小床頭櫃；放投影機的那個要穩、有電、通風。',
    material: [
      '18 mm 桶身；放投影機那個頂板用 25 mm，減少晃動',
      '上抽屜＋下開放格，抽屜全展緩衝；30 寬的抽屜內寬只有約 20～23 cm',
      '背板開線孔，側邊預留插座／USB；投影機進出風口前後保持淨空',
    ],
    notes: ['投影機要對準投影牆，50 cm 高度不夠時用可調角度支架', '做懸空壁掛需要牆內補強，比較好清掃；落地版用小踢腳'],
  },
  scab: {
    summary: '書房長矮櫃：放文件、線材和印表機，抽屜滑軌選耐重型。',
    material: [
      '檯面 25 mm 系統板或人造石，250 cm 一片不接縫',
      '文件抽屜選承重 40 kg 以上的三節全展滑軌；放 A4 吊掛夾先確認夾子規格',
      '印表機格不裝門，背板開散熱孔與線孔；印表機較重可以加重型拉板',
    ],
    notes: [
      '櫃身分 2 桶（例如 125＋125）比較好搬運安裝，檯面再用一片蓋過',
      '靠輕隔間：頂部用 L 片鎖進骨料或預埋的夾板，防止往前傾',
      '文件門片櫃層板可調；A4 檔案夾需深 32～35 cm，40 深夠用',
    ],
  },
  dining: {
    summary: '收納段用系統櫃或廚具桶身，桌腳、牙板用鐵件或木作，檯面由廚具／石材廠做一片連續。',
    material: [
      '檯面首選石英石：耐刮、不吃色，約 100～400 元/公分，90 深會加價',
      '人造石 80～150 元/公分，可無縫、刮傷可修補，但較軟、怕熱鍋',
      '美耐板檯面最便宜（約 1,500～3,500 元/尺），但怕水從接縫滲入、邊緣有黑邊',
      '實木檯面觸感溫潤，但要定期上油、怕水漬與熱鍋',
    ],
    notes: [
      '220 × 90 石英石可以一片不接縫（確認大板尺寸），2 cm 厚約 95 kg',
      '餐桌段下方用 18 mm 木心板底板或鐵件框＋牙板承重，桌腳建議鐵件',
      '櫃體、桌腳、檯面交給同一家統包負責高度與水平，避免三家互推責任',
      '微波爐依說明書留散熱，建議選嵌入式機種；檯面插座開孔要和收納段抽屜錯開',
    ],
    search: ['土城 廚具 石英石檯面', '石英石 人造石 檯面 價格 每公分', '訂製 中島 餐桌 系統櫃 新北'],
  },
}

/** 系統櫃共用的板材、五金建議 */
export const cabinetMaterials: {
  summary?: string
  boards?: string[]
  doors?: string[]
  hardware?: string[]
  prices?: string[]
  checks?: string[]
} = {
  summary:
    '全屋統一用歐洲進口、甲醛 F1／F4星 的塑合板（EGGER、KAINDL 等），桶身 18 mm、背板 8 mm，檯面與長跨距層板用 25 mm；鞋櫃、咖啡櫃、中島指定 P3 防潮板；門片以美耐皿為主；五金指定 Blum／Hettich／Grass 緩衝鉸鏈與全展滑軌。合約寫明板材花色編號、甲醛等級、五金型號，並要求證明文件。',
  boards: [
    '桶身、層板、門片 18 mm 系統板（塑合板），背板 8 mm；檯面、懸空層板、共用側板 25 mm',
    '台灣常見歐洲板：奧地利 EGGER、KAINDL，德國 Pfleiderer，比利時 SPANO；比中國／東南亞板貴約 3～5 成',
    '甲醛指定 CNS 2215 F1 或日本 F☆☆☆☆（平均 ≤ 0.3 mg/L）；E0 不是歐盟正式等級，約等於 F2',
    '防潮依 EN 312：P3／P5／P7 才算防潮板，P2 是一般乾燥室內用；潮濕處請寫明 P3',
    '板材斷面綠色只是染料，不代表防潮；EGGER 花色碼（如 H1348）可以對照原廠色卡',
    '系統板原板長度有限，櫃高超過約 240 cm 多半要分上下兩桶疊裝，也會另外計價',
  ],
  doors: [
    '美耐皿（與桶身同一種板）：最便宜、耐刮、好清潔，衣櫃、床頭櫃首選',
    '結晶鋼烤：壓克力亮面，好看但易刮、易留指紋；門片加價約 90～240 元/公分',
    '烤漆（鋼琴／陶瓷）：顏色自由，陶瓷烤漆最硬也最貴；門片加價約 100～270 元/公分',
    '實木貼皮：木紋自然、價格不高，但怕潮濕和日照變色',
    '美耐板（HPL）：耐磨、短時間耐熱約 130°C，適合咖啡櫃、中島；轉角斷面會露黑邊',
    '平開門單片寬 45～60 cm、高度 240 cm 以下；約 200 cm 高的門片要裝 4 個鉸鏈',
  ],
  hardware: [
    '鉸鏈：Blum CLIP top BLUMOTION、Hettich Sensys、Grass Tiomos，要有內建緩衝、三向可調',
    '抽屜滑軌：三節全展＋緩衝；文件、印表機這類重物選承重 40 kg 以上；國產川湖 King Slide 性價比高',
    '金屬側牆抽屜（Blum LEGRABOX／TANDEMBOX、Hettich）比木抽耐用，但每抽加價較多',
    '淺衣櫃用前後伸縮衣桿；高處用下拉式升降衣桿，要符合櫃寬規格',
    '報價單寫品牌＋型號，同一品牌入門款和旗艦款價差好幾倍',
    '輕隔間牆：封板前預埋 18 mm 夾板或補牆鐵，螺絲鎖進骨料或補強板',
  ],
  prices: [
    '高櫃／衣櫃約 4,500～9,000 元/尺，吊櫃、下櫃約 2,500～4,000 元/尺（woodliving 2026/1）',
    '高櫃門片式 4,800～6,000、矮櫃門片式 4,000～6,000、電視櫃 2,500～2,800 元/尺（PRO360 2025/7）',
    '板材品牌（高櫃）：EGGER 約 4,500～6,000、KAINDL 約 5,000～6,500、Pfleiderer 約 5,500～7,500 元/尺',
    '五金加價：全展緩衝抽屜每抽 1,200～2,500、褲架 3,500～6,000、升降衣桿 4,500～9,000',
    '檯面：人造石 80～150、石英石 100～400 元/公分，加深另計',
    '1 尺 ≈ 30 cm，不足 1 尺以 1 尺計；櫃高超過 240 cm 多半另計，實際以廠商報價為準',
  ],
  checks: [
    '要求出廠證明、進口報單、進料紀錄，日期要和這次施工相符',
    '板材進場時拍板邊噴印與標示（甲醛等級、批號、製造年月）留存',
    '合約寫明：板材品牌／花色編號／F1 或 F4星／P3 防潮、五金品牌型號、保固年限',
    '完工後通風 2～4 週，可以請檢測公司量室內甲醛（標準 0.08 ppm／1 小時）',
    '驗收：門縫一致、鉸鏈調好、抽屜全拉出不卡、封邊不翹、防傾倒固定點確實',
  ],
}

/** 系統櫃／木作廠商（土城附近，2026/09 查詢；電話、地址請再確認） */
export const cabinetVendors: ShopVendor[] = [
  {
    name: '歐德傢俱 土城店（直營）',
    detail: '全台連鎖品牌，土城學府路二段 168 號有門市；官網稱用德國進口 F4星防潮塑合板',
    phone: '02-2260-6588',
    url: 'https://www.order.com.tw/location.php?act=list&cid=1',
  },
  {
    name: '綠的傢俱 中和店／板橋店',
    detail: '大型系統家具連鎖；中和中山路三段 104 號、板橋漢生東路 276 號',
    phone: '02-2221-0676',
    url: 'https://www.green-furniture.com.tw/store/',
  },
  {
    name: '誠鑫企業社（土城在地）',
    detail: '土城中央路四段，20 多年經驗、有門市展示區；廚具、石英石／人造石檯面、系統櫃都做，適合中島',
    phone: '02-2268-3877',
    url: 'https://www.chengxinkitchen.com.tw/index.html',
  },
  {
    name: '主婦歐化廚具工廠',
    detail: '板橋大觀路三段，工廠展示中心可預約；有土城案例',
    phone: '02-2681-7788',
    url: 'https://www.madam-kitchenware.com/product/furniture46',
  },
  {
    name: '振發室內裝修工程（土城）',
    detail: 'PRO360 5.0 分／28 則評價；做輕隔間也做系統家具，適合書房那面輕隔間的補強',
    url: 'https://www.pro360.com.tw/service/122155',
  },
]
export const cabinetSearch: string[] = ['系統櫃 土城', '系統櫃 土城 展示中心', '系統板 P3 防潮 EN312', 'CNS 2215 F1 板材 甲醛']

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
