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
  /** 計入總花費的金額（不填 = 從 price 文字抓；範圍取中間值） */
  cost?: number
  /** 金額的補充說明，例如「含在一對二組合價」、「兩片」 */
  costNote?: string
  /** 最推薦的選項：預設勾選 */
  rec?: boolean
  /** 預算分類（不填 = 依家具種類） */
  category?: string
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
  /** 附屬的設備（例如中島的嵌入微波爐、檯面插座），各自一組建議商品 */
  related?: { title: string; info: ShopInfo }[]
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
    summary: '收納段用系統櫃或廚具桶身，桌腳、牙板用鐵件或木作；檯面用人造石，由廚具／石材廠做一片連續。',
    material: [
      '檯面用人造石（住戶決定）：80～150 元/公分，可無縫、刮傷可以磨掉修補；比石英石軟、怕熱鍋，電鍋、氣炸鍋底下墊隔熱墊',
      '人造石建議選韓國品牌（LG Hi-MACS、Samsung Staron）或杜邦可麗耐，陸製板較便宜但容易黃化',
      '石英石（備選）：耐刮、不吃色，約 100～400 元/公分，90 深會加價',
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
    related: [
      {
        title: '嵌入式微波爐',
        info: {
          summary: '櫻花 E5650A 目前仍在售，官方安裝尺寸 56 × 55 × 38 和中島預留孔完全一樣，仍是首選。',
          specs: ['開孔 56 W × 38 H × 55 D（60 cm 模組）', '110V 嵌入式微波（燒烤）爐', '建議獨立插座／迴路'],
          picks: [
            {
              name: '櫻花 SAKURA E5650A 嵌入式變頻微波烤箱',
              rec: true,
              detail: '機體寬 59.5 × 深 41 × 高 38.8；安裝寬 56 × 深 55 × 高 38；25L、110V、1450W',
              price: '約 NT$15,570（2026/09 PChome，含部分地區基本安裝）',
              url: 'https://24h.pchome.com.tw/prod/DPAL33-A900GRZRR',
              source: 'PChome',
            },
            {
              name: 'BOSCH 博世 BEL554MS0U 6 系列嵌入式微波燒烤爐',
              detail: '機體寬 59.4 × 高 38.2 × 深 38.8；開孔寬 56～56.8 × 高 38～38.2 × 深 55；25L、110V',
              price: '約 NT$19,900（2026/09 甫佳電器；建議售價 NT$23,000）',
              url: 'https://www.bosch-home.com.tw/zh/mkt-product/cooking-baking/microwaves/built-in-microwaves/BEL554MS0U',
              source: 'Bosch 官網',
            },
            {
              name: '伊萊克斯 Electrolux EMFB25BG 600 系列嵌入式微波烤箱',
              detail: '機體 59.5 × 39 × 37.7；開孔 56 × 36.5 × 41，38 高的孔要用上下固格裝法＋換短腳；110V',
              price: '約 NT$21,000（2026/09 伊萊克斯官網）',
              url: 'https://www.electrolux.com.tw/appliances/microwave-ovens/emfb25bg/',
              source: '伊萊克斯官網',
            },
          ],
          search: ['櫻花 E5650A', 'BOSCH BEL554MS0U', '伊萊克斯 EMFB25BG'],
          notes: [
            '木作開孔照所選機種的原廠施工圖做；E5650A 的開孔尺寸和目前預留的一樣',
            '微波爐最大 1,450W，建議獨立迴路，不要和電鍋／氣炸鍋共用插座',
            '插座設在機器背後插得到的位置，例如旁邊抽屜櫃內或開孔後側',
          ],
        },
      },
      {
        title: '檯面嵌入插座（靠窗）',
        info: {
          summary: '用國際牌「地板插座」嵌在檯面：蓋上後和檯面齊平，掀蓋就能用，接地雙插座。',
          specs: ['雙連三孔（接地）、15A 125V', '蓋板和檯面齊平、掀蓋式', '檯面下需約 8 cm 埋入深度'],
          picks: [
            {
              name: '國際牌 Panasonic DUFN2200T-1 鋁合金地板插座',
              rec: true,
              detail: '面板 13 × 13、埋入深約 7.8 cm；接地雙插座，附金屬接線盒和保護蓋',
              price: '約 NT$1,116（2026/09 水電材料網）',
              url: 'https://pstw.panasonic.com.tw/catalog/files/dc_shiyou/DUFN2200T-1.pdf',
              source: '國際牌規格圖',
            },
            {
              name: '國際牌 Panasonic DU5942PFK 不鏽鋼彈插地板插座',
              detail: '角型不鏽鋼、雙層鉸鍊緩慢升起、接地雙插座，附埋入盒；台灣製',
              price: '約 NT$1,269（2026/09 momo）',
              url: 'https://www.momoshop.com.tw/TP/TP0008831/goodsDetail/TP00088310000267',
              source: 'momo',
            },
          ],
          search: ['國際牌 DUFN2200T-1', '國際牌 DU5942PFK', '地板插座 接地雙插座'],
          vendors: [
            {
              name: '允順水電材料（台北）',
              detail: '有賣國際牌地板插座系列，可以電話詢價、現場買',
              phone: '02-2767-1360',
              url: 'https://www.wenshun.com.tw/products/panasonic-du5942pfk',
            },
          ],
          notes: [
            '額定 15A：電鍋 600W＋氣炸鍋 1,200～1,500W 同時開會超過，請錯開使用，或做兩組插座各拉一迴路',
            '埋入盒深約 8 cm，位置要避開下方抽屜和滑軌，最好在固定側板上方',
            '蓋上只能擋一般潑濺，不是防水插座；擦桌子前先把蓋子關好',
            '這是地板用插座，嵌在檯面要請水電和木作依原廠尺寸開孔',
          ],
        },
      },
    ],
  },

  // ───────────── 餐廚（2026/09 查詢） ─────────────
  dchair1: {
    summary: '選椅寬 45 以下、無扶手、座高約 45 的款式；兩側對面都要收進去，椅深最好也 45 以下，否則會凸出桌緣幾公分。',
    specs: ['椅寬 ≤ 45、無扶手', '座高約 45（桌高 76）', '椅深 ≤ 45 兩側才能對收（桌深 90）', '每側 2 張，桌下淨長約需 90 以上'],
    picks: [
      {
        name: 'IKEA SANDSBERG 軟坐墊餐椅',
        rec: true,
        detail: '寬 45 × 深 45 × 高 76、座高 46；鋼腳＋軟墊，寬、深、座高都剛好符合',
        price: '約 NT$599／張（2026/09 IKEA 官網）',
        url: 'https://www.ikea.com.tw/zh/products/dining-seating/upholstered-chairs/sandsberg-art-50605257',
        source: 'IKEA 官網',
      },
      {
        name: '無印良品 MUJI 木製椅／布面座／橡膠木／深色',
        detail: '寬 38 × 深 48.5 × 高 77.5、座高 45.5；實木、棉麻座面、免組裝，最窄',
        price: '約 NT$2,690／張（2026/09 PChome）',
        url: 'https://24h.pchome.com.tw/prod/DEDK1O-A900IUN5I',
        source: 'PChome',
      },
      {
        name: '無印良品 MUJI 木製圓椅／橡木',
        detail: '寬 45 × 深 51 × 高 77；橡木實木腳、弧形椅背，質感最好，但椅深較深',
        price: '約 NT$4,990／張（2026/09 PChome）',
        url: 'https://24h.pchome.com.tw/prod/DEDK6A-A900BMPZN',
        source: 'PChome',
      },
    ],
    search: ['IKEA SANDSBERG 餐椅', '無印良品 木製椅 橡膠木', '無印良品 木製圓椅 橡木'],
    notes: [
      '椅背約高 76～78，比桌下淨高（約 72）高：推進去時椅背會靠在桌緣，只有座面收進桌下',
      '兩側椅深加起來超過 90 會互頂：MUJI 兩款會各凸出約 2～6 cm',
      '更便宜：IKEA SANDSBERG 硬座款約 NT$349（寬 39 × 深 47 × 高 77、座高 45）',
      '要整張收進桌下只能改用椅凳，例如 IKEA KYRRE 椅凳 42 × 48 × 45，約 NT$499',
    ],
  },
  rice: {
    summary: '兩人用選大同 6 人份就夠：寬 30.8 × 深 26 放得進 32 × 32；10 人份寬 34.8 會超出。',
    specs: ['檯面佔用 ≤ 32 × 32', '110V；電鍋約 600W、小電子鍋約 450W', '上方不要有吊櫃（會有蒸氣）'],
    picks: [
      {
        name: '大同 TATUNG 6 人份不鏽鋼電鍋 TAC-06L-MCW',
        rec: true,
        detail: '寬 30.8 × 深 26 × 高 22、600W、304 不鏽鋼內鍋；兩人煮飯蒸菜夠用',
        price: '約 NT$2,690（2026/09 PChome）',
        url: 'https://24h.pchome.com.tw/prod/DMBI4K-A900INYCB',
        source: 'PChome',
      },
      {
        name: '大同 TATUNG 10 人份全不鏽鋼電鍋 TAC-10L-MCW',
        detail: '寬 34.8 × 深 29.5 × 高 26.5，寬度超過 32；可以放整隻雞或疊多層蒸盤',
        price: '約 NT$2,680（2026/09 PChome）',
        url: 'https://24h.pchome.com.tw/prod/DMBI61-A900GFVXI',
        source: 'PChome',
      },
      {
        name: '象印 ZOJIRUSHI 3 人份黑金剛微電腦電子鍋 NS-LBF05',
        detail: '寬 23 × 深 30 × 高 19、450W；白飯口感較好、最省空間，但不能蒸',
        price: '約 NT$5,490（2026/09 PChome）',
        url: 'https://24h.pchome.com.tw/prod/DMBI0E-A9009TYVQ',
        source: 'PChome',
      },
    ],
    search: ['大同電鍋 6人份 TAC-06L', '大同電鍋 10人份 TAC-10L', '象印 NS-LBF05'],
    notes: [
      '大同電鍋寬度含兩側把手；6 人份和 10 人份價錢幾乎一樣，差別只在體積',
      '電鍋和氣炸鍋同時開約 1,800～2,100W，已經超過一組 15A 插座（見中島的檯面插座說明）',
    ],
  },
  fryer: {
    summary: '兩人用 4L 左右就夠；國際牌 NF-HC100 最省空間，飛利浦 4.1L 深度剛好 36。',
    specs: ['檯面佔用 ≤ 30 W × 36 D（把手朝外）', '容量 4～6 L、110V', '背後有排熱口，後方要留空間'],
    picks: [
      {
        name: '國際牌 Panasonic 4L 多功能氣炸鍋 NF-HC100',
        rec: true,
        detail: '寬 24 × 深 32.5 × 高 30.7、1200W、觸控 8 種模式；尺寸最寬裕',
        price: '約 NT$1,580（2026/09 PChome）',
        url: 'https://24h.pchome.com.tw/prod/DMAG5E-A900K9RDG',
        source: 'PChome',
      },
      {
        name: '飛利浦 PHILIPS 數位海星氣炸鍋 4.1L HD9252/50（小綠）',
        detail: '約寬 26.4 × 深 36 × 高 29.5（含把手）、海星底盤；深度剛好 36',
        price: '約 NT$3,580（2026/09 PChome）',
        url: 'https://24h.pchome.com.tw/prod/DMACCH-A900JGXIC',
        source: 'PChome',
      },
      {
        name: '飛利浦 PHILIPS 星樂視透視海星氣炸鍋 4.2L NA221',
        detail: '寬 27.3 × 深 36.8 × 高 29.3、1500W、有透視窗；深度超出約 0.8 cm',
        price: '約 NT$4,265（2026/09 PChome；官網 NT$4,490）',
        url: 'https://24h.pchome.com.tw/prod/DMAC0E-A900I6WNL',
        source: 'PChome',
      },
    ],
    search: ['國際牌 NF-HC100', '飛利浦 HD9252', '飛利浦 NA221'],
    notes: [
      '放不進的：小米智慧氣炸鍋 4.5L 深 37（超 1 cm）；Tefal EY111B70 寬 33.2（超出）',
      '機身背面會排熱，背後和兩側建議留約 10 cm，不要貼著窗簾',
      'HD9252 白色款官網已標示停產，綠色款 /50 目前還買得到',
    ],
  },
  kitchen: {
    summary: '建商附的一字型廚具（烘碗機也是建商附）；水槽旁要拆一個 45 cm 下櫃改裝洗碗機。',
    vendors: [
      {
        name: 'Bosch 博世家電 洗碗機專人到府評估',
        detail: '官方商城付費到府評估 NT$500；從官方通路買機另有免費評估（活動到 2026/12/31）',
        phone: '0800-368-888',
        url: 'https://www.bosch-home-shop.com.tw/products/service-home-inspection',
      },
      {
        name: '陽光空間精品廚具（板橋）',
        detail: '板橋金門街，系統廚具設計、改造、安裝；週五、週日公休',
        phone: '02-2675-6761',
        url: 'https://www.sunnyspacedesign.com/',
      },
      {
        name: '九兆廚具裝璜行',
        detail: '八里工廠直營，有土城中央路、中和景新街施工案例；可以詢問改櫃裝洗碗機',
        phone: '02-2610-8321',
        url: 'https://www.miokitchen9999.com.tw/Product-Item_66264.html',
      },
      {
        name: '春蘭系統廚具',
        detail: '桃園龜山工廠直營，網站有永和／中和／土城案例；要先確認是否接小規模改櫃',
        phone: '03-329-6968',
        url: 'https://chunlan0514.com/about/',
      },
      {
        name: '鑫部落（洗碗機空間改造）',
        detail: '部落格，轉介 45／60 cm 洗碗機改櫃和水電師傅；大台北可施工，用表單或 Email 聯絡',
        url: 'https://newguest88.pixnet.net/blog/posts/10354210712',
      },
      {
        name: '甫佳電器（Bosch 經銷）',
        detail: '台北 Bosch 經銷，上面兩款的現價在這裡查到；安裝費另外詢問',
        phone: '02-2736-0238',
        url: 'https://www.fuchia.tw/v2/shop/item/2319',
      },
    ],
    notes: [
      'Miele 台灣總代理只賣 60 cm 機種；伊萊克斯 45 cm 只有獨立式，沒有全嵌款',
      '改櫃行情（網路案例）：拆櫃＋新做櫃約 NT$1 萬內，再加抬高檯面約 NT$1.5 萬內',
      '檯面下淨高不足 81.5 cm 時，要抬高檯面或改踢腳板',
      '建商保固期內改櫃，先問建商會不會影響保固，門板色號也向建商要',
      '改櫃施工可以找：Bosch 到府評估 NT$500（0800-368-888）、陽光空間精品廚具 板橋（02-2675-6761）、九兆廚具（02-2610-8321）',
    ],
    related: [
      {
        title: '45 cm 洗碗機',
        info: {
          summary: '台灣買得到的 45 cm 全嵌式洗碗機只有 Bosch 兩款（110V），要拆掉水槽旁一個 45 cm 下櫃，另做一片和廚具同款的門板。',
          specs: ['洗碗機櫃內空間 寬 45 × 深 55 × 高 81.5～87.5', '110V 專用插座＋進排水接水槽旁', '需加裝與廚具同款門板（7.5 kg 以下）'],
          picks: [
            {
              name: 'BOSCH 博世 SPV2IKX00X 2 系列 45 cm 全嵌式洗碗機',
              detail: '9 人份、110V、52 dB；寬 44.8 × 深 55 × 高 81.5，需自備門板',
              price: '約 NT$40,000（2026/09 甫佳電器；建議售價 NT$46,800）',
              url: 'https://www.bosch-home.com.tw/zh/mkt-product/dishwashers/built-in-dishwashers/bifulldishwashers45width/SPV2IKX00X',
              source: 'Bosch 官網',
            },
            {
              name: 'BOSCH 博世 SPV4IMX00X 4 系列 45 cm 全嵌式洗碗機',
              rec: true,
              detail: '10 人份、110V、48 dB、AquaStop 防漏、餐具抽屜；外型尺寸和 2 系列相同',
              price: '約 NT$44,000（2026/09 甫佳電器；建議售價 NT$52,000）',
              url: 'https://www.bosch-home.com.tw/zh/mkt-product/dishwashers/built-in-dishwashers/bifulldishwashers45width/SPV4IMX00X',
              source: 'Bosch 官網',
            },
          ],
          search: ['BOSCH SPV2IKX00X', 'BOSCH SPV4IMX00X', '45公分 全嵌式洗碗機'],
        },
      },
    ],
  },

  // ───────────── 冷氣、洗烘、衛浴（2026/09 查詢） ─────────────
  'ac-living': {
    summary: '客餐廳加上開放式廚房，建議 5.0 kW（7～8 坪級）1 對 1；室內機寬度要 90 以下，大金同級室內機寬 99，放不下。',
    specs: [
      '建議能力 5.0 kW（5.79 坪＋廚房熱源）',
      '室內機寬 ≤ 90，上方離天花板 5 cm 以上',
      '冷媒管約 7 m；5.0 kW 為液管 2 分／氣管 4 分',
      '室外機要拉 220V 專用迴路',
    ],
    picks: [
      {
        name: '三菱重工 DXK50ZST2-W／DXC50ZST2-W（晴空二代）',
        rec: true,
        detail: '室內機寬 87 × 高 29 × 深 23；室外機寬 78（含蓋 84.2）× 高 59.5 × 深 29，放得進平台；5.0 kW 一級能效',
        price: '約 NT$54,900（2026/09 PChome，含運送定位，安裝另計）',
        url: 'https://24h.pchome.com.tw/prod/DPAFGD-A900IDE8A',
        source: 'PChome',
      },
      {
        name: '國際牌 CS-UJ50BA2／CU-UJ50BHA2（UJ 系列）',
        detail: '室內機寬 89 × 高 29.5 × 深 24.1，左右只剩約 0.5 cm；室外機寬 78 × 高 66.6 × 深 28.9，高度超過 60',
        price: '約 NT$43,300～51,600（2026/09 PChome／momo，含標準安裝）',
        url: 'https://24h.pchome.com.tw/prod/DPAFCP-A900K5DD3',
        source: 'PChome',
      },
      {
        name: '大金 FTHF50ZVLT／RHF50ZVLT（豪菁 Z）',
        detail: '室內機寬 99 × 高 29.5 × 深 28.1，預留要加寬到約 105；室外機寬 84.5 × 高 59.5 × 深 30，放得進平台',
        price: '約 NT$46,500（2026/09 PChome，含運送＋標準安裝）',
        url: 'https://24h.pchome.com.tw/prod/DPAF90-A900JTYGP',
        source: 'PChome',
      },
    ],
    search: ['DXK50ZST2-W', 'CS-UJ50BA2 CU-UJ50BHA2', 'FTHF50ZVLT RHF50ZVLT'],
    notes: [
      '寬度最有餘裕的是三菱重工（87）；國際牌 89 幾乎佔滿 90，側邊出管要先跟師傅確認',
      '冷媒管 7 m：部分通路的基本安裝只含 5 m，超過的 2 分 4 分管每米約 NT$550',
      '如果建商已經預埋冷媒管，要確認管徑是 2 分 4 分，而且接得到室外機平台',
    ],
    related: [
      {
        title: '安裝費（三菱重工另計）',
        info: {
          summary: '三菱重工這組的網路價只含運送定位，安裝要另外算；改選國際牌或大金（價錢已含標準安裝）就把這項取消勾選。',
          specs: ['4.0～5.9 kW 分離式壁掛標準安裝約 NT$5,000（行情 3,500～11,000）', '冷媒管約 7 m，超出標準長度的部分每米約 NT$350～550'],
          picks: [
            {
              name: '三菱重工 1 對 1 標準安裝＋冷媒管加長（估價）',
              detail: '標準安裝約 5,000 ＋ 冷媒管超出約 3 m × 450',
              price: '約 NT$6,350（2026/09 PRO360、找師傅行情推算）',
              cost: 6350,
              rec: true,
              url: 'https://www.pro360.com.tw/price/split_ac_installation',
              source: 'PRO360 行情',
            },
          ],
          notes: [
            '安裝前確認有沒有建商預埋的冷媒管、排水管，以及室外機平台到室內機的實際管線長度',
            '室外機要拉 220V 專用迴路，請水電一起確認',
          ],
        },
      },
    ],
  },
  'ac-master': {
    summary: '主臥 2.79 坪建議 2.0～2.2 kW（3 坪級），接一對二室外機；室內機寬度要 85 以下。',
    specs: ['建議能力 2.0～2.2 kW', '室內機寬 ≤ 85（窗戶上方）', '和次臥共用一台一對二室外機'],
    picks: [
      {
        name: '大金 FTHF20ZVLT（接 2MXP50ZVLT）',
        rec: true,
        detail: '寬 77 × 高 28.5 × 深 24.2，左右各約 4 cm；和 FTHF30 一起接時約 2.0 kW',
        price: '一對二組合（FTHF20＋FTHF30）約 NT$59,800（2026/09 玉明，含 10 m 基本安裝）',
        url: 'https://www.3uo.tw/ecommerce/2MXP50ZVLT_2030/',
        source: '玉明電器',
      },
      {
        name: '國際牌 CS-UJ22BA2（接 CU-2J52FHA2）',
        detail: '寬 79.8 × 高 29.5 × 深 24.1，左右各約 2.6 cm；2.2 kW，有 nanoe X',
        price: '一對二組合（UJ22＋UJ28）約 NT$53,800（2026/09 克拉家電，含標準安裝）',
        url: 'https://www.kela.com.tw/product/6066--Panasonic%E5%9C%8B%E9%9A%9B%E3%80%90CU-2J52FHA2-CS-UJ22BA2-CS-UJ28BA2%E3%80%91%E4%B8%80%E5%B0%8D%E4%BA%8C%E8%AE%8A%E9%A0%BB%E5%88%86%E9%9B%A2%E5%BC%8F%E5%86%B7%E6%B0%A3(%E5%86%B7%E6%9A%96%E5%9E%8B)(%E5%90%AB%E6%A8%99%E6%BA%96%E5%AE%89%E8%A3%9D)',
        source: '克拉家電',
      },
    ],
    search: ['2MXP50ZVLT FTHF20ZVLT', 'CU-2J52FHA2 CS-UJ22BA2'],
    notes: ['價格是整組一對二（主臥＋次臥）的價錢，不要重複計算', '一對二的兩台室內機要同一種模式運轉（不能一間冷氣、一間暖氣）'],
  },
  'ac-study': {
    summary: '次臥 4.05 坪，兩個人加上電腦會發熱，建議 2.8～3.0 kW（5 坪級）；室內機寬度 80 以下是最緊的位置。',
    specs: ['建議能力 2.8～3.0 kW', '電腦和人體發熱約多 0.4～0.8 kW', '室內機寬 ≤ 80（窗戶上方）'],
    picks: [
      {
        name: '大金 FTHF30ZVLT（接 2MXP50ZVLT）',
        rec: true,
        detail: '寬 77 × 高 28.5 × 深 24.2，左右各約 1.5 cm；和 FTHF20 一起接時約 3.0 kW',
        price: '含在一對二組合價裡（見主臥冷氣）',
        cost: 0,
        costNote: '含在主臥冷氣的一對二組合價',
        url: 'https://www.3uo.tw/ecommerce/2MXP50ZVLT_2030/',
        source: '玉明電器',
      },
      {
        name: '國際牌 CS-UJ28BA2（接 CU-2J52FHA2）',
        detail: '寬 79.8，預留 80 幾乎沒有餘裕，建議放寬到 85 以上；2.8 kW',
        price: '含在一對二組合價裡（見主臥冷氣）',
        cost: 0,
        costNote: '含在主臥冷氣的一對二組合價',
        url: 'https://www.momoshop.com.tw/product/13675918',
        source: 'momo',
      },
    ],
    search: ['2MXP50ZVLT FTHF30ZVLT', 'CU-2J52FHA2 CS-UJ28BA2'],
    notes: [
      '如果這間西曬或整天開電腦，3.6 kW 會更穩，但加起來會超過一對二的額定能力，要改配置',
      '尺寸上大金 77 cm 最適合這個 80 cm 的位置',
    ],
  },
  ac1: {
    summary:
      '室外機先當作建商沒送、自己買：冷氣是「室內機＋室外機」成組賣，兩台室外機的錢已經含在冷氣組合價裡（A 台在客餐廳冷氣、B 台在主臥冷氣的一對二組合），這裡不重複計算。首選大金 2MXP50ZVLT（一對二，體積最小）搭配三菱重工 DXC50ZST2-W（1 對 1），兩台都放得進平台。',
    specs: ['平台每格約寬 85 × 深 32 × 高 60', '兩台室外機各拉一條 220V 專用迴路', '一對二每間房各自有冷媒管（2 分／3 分）和排水管'],
    picks: [
      {
        name: 'B 台：大金 2MXP50ZVLT（一對二）',
        rec: true,
        detail: '寬 67.5 × 高 55 × 深 28.4，放得進平台；額定 5.0 kW，一級能效，年耗電約 1,024 度',
        price: '組合約 NT$59,800～71,000（2026/09 玉明／PChome，含基本安裝）',
        cost: 0,
        costNote: '室外機含在室內機的價錢裡（見客餐廳、主臥冷氣）',
        url: 'https://24h.pchome.com.tw/prod/DPAF5Z-A900J5BWC',
        source: 'PChome',
      },
      {
        name: 'A 台：三菱重工 DXC50ZST2-W（1 對 1）',
        rec: true,
        detail: '寬 78（含蓋 84.2）× 高 59.5 × 深 29，放得進但很貼；最長配管 25 m',
        price: '約 NT$54,900（2026/09 PChome，安裝另計）',
        cost: 0,
        costNote: '室外機含在室內機的價錢裡（見客餐廳、主臥冷氣）',
        url: 'https://24h.pchome.com.tw/prod/DPAFGD-A900IDE8A',
        source: 'PChome',
      },
      {
        name: '全國際牌：CU-UJ50BHA2＋CU-2J52FHA2',
        detail: '1 對 1 為寬 78 × 高 66.6、一對二為寬 86 × 高 66.6，高度都超過 60，要先確認平台淨高',
        price: '兩台合計約 NT$97,000～114,000（2026/09，含安裝）',
        cost: 0,
        costNote: '室外機含在室內機的價錢裡（見客餐廳、主臥冷氣）',
        source: '玉明電器／克拉家電／momo',
      },
    ],
    search: ['2MXP50ZVLT', 'DXC50ZST2-W', 'CU-2J52FHA2'],
    vendors: [
      {
        name: '玉明電器（3uo.tw）',
        detail: '大台北地區安裝；一對二組合價含 10 m 銅管基本安裝，超長每米加 NT$450～650',
        url: 'https://www.3uo.tw/product-category/air-conditioner/daikin-air-conditioner/daikin-cold-and-warm-1-to-many/',
      },
    ],
    notes: [
      '方案一（尺寸最合）：三菱重工 1 對 1＋大金一對二，約 NT$11.5～12.6 萬，另加 1 對 1 的安裝費',
      '方案二（全大金）：RHF50ZVLT＋2MXP50ZVLT，約 NT$10.6～11.8 萬含安裝，但客廳室內機寬 99',
      '方案三（全國際牌）：約 NT$9.7～11.4 萬含安裝，最便宜，但兩台室外機高 66.6，超過 60',
      '兩台室外機並排時，出風不要對著另一台吹，背面也要留散熱空間',
    ],
  },
  washer: {
    summary: '陽台 60 × 65 的位置，建議選 60 cm 寬的滾筒洗衣機（高 85，和乾衣機一樣高，也不會擋到窗戶）；兩個人 10～13 kg 就夠。',
    specs: ['寬 ≤ 60、深 ≤ 65（含門）、高 ≤ 100', '前方留約 50 cm 開門、取衣服', '要有洗衣機專用水龍頭和地排；Bosch 要 220V 插座'],
    picks: [
      {
        name: 'LG WD-S13VBW（13 kg 蒸洗脫）',
        rec: true,
        detail: '寬 60 × 高 85 × 深 61.5；AI DD 直驅馬達，外型和 LG WR-100VW 乾衣機同系列，可並排',
        price: '約 NT$26,000（2026/09 PChome）',
        url: 'https://www.lg.com/tw/washer-dryers/front-loading-washing-machines/wd-s13vbw/',
        source: 'LG 官網',
      },
      {
        name: 'Bosch WGA15200TC（10 kg）',
        detail: '寬 59.8 × 高 84.8 × 深 59，三款裡最淺；220V；門往左開，不能換邊',
        price: '約 NT$34,900（2026/09 PChome）',
        url: 'https://24h.pchome.com.tw/prod/DPAI1R-A900IHAUI',
        source: 'PChome',
      },
      {
        name: '國際牌 NA-VS120RW-B（12 kg 洗脫）',
        detail: '寬 59.6 × 高 84.5 × 深 66，比 65 多 1 cm；和 NH-VS100HP-B 乾衣機同系列配色',
        price: '約 NT$24,210～26,900（2026/09 PChome）',
        url: 'https://24h.pchome.com.tw/prod/DPAI1H-A900HH74M',
        source: 'PChome',
      },
    ],
    search: ['WD-S13VBW', 'WGA15200TC', 'NA-VS120RW'],
    notes: ['直立式洗衣機多數機高超過 100，開蓋還要再往上的空間，放在窗下不建議', '進水管和排水管都在背面，實際深度要多留 2～3 cm'],
  },
  dryer: {
    summary: '兩款 10 kg 熱泵乾衣機規格查證無誤，都是 110V；深度約 66～67（超過 65），另外要看門往哪邊開。',
    specs: [
      '10 kg 熱泵式，110V 專用插座',
      '寬 60、高 85、深約 66～67',
      'LG 門打開 90° 時總深 111.5，前方要留走道',
      '用集水盒，或改接排水管',
    ],
    picks: [
      {
        name: 'LG WR-100VW',
        rec: true,
        detail: '官網：寬 60 × 高 85 × 深 66，開門深 111.5，110V，門不能換邊；雙變頻熱泵',
        price: '約 NT$28,900（2026/09 PChome）',
        url: 'https://www.lg.com/tw/washer-dryers/dryers/wr-100vw/',
        source: 'LG 官網',
      },
      {
        name: '國際牌 NH-VS100HP-B',
        detail: '寬 59.6 × 高 84.5 × 深 66.7，110V，門的鉸鏈在右側；nanoe X、IoT',
        price: '約 NT$31,800～32,310（2026/09 玉明／燦坤／PChome）',
        url: 'https://www.panasonic.com/tw/consumer/washing-machine/washing-and-drying/stacked/nh-vs100hp.html',
        source: '國際牌官網',
      },
      {
        name: '夏普 SHARP KD-FKH10DT（烘布郎）',
        detail: '10 kg 熱泵，寬 59.8 × 高 85 × 深 66，110V；出廠由右往左開，可付費請原廠改門的方向',
        price: '約 NT$27,900（2026/09 PChome）',
        url: 'https://24h.pchome.com.tw/prod/DPAI3F-A900J14XI',
        source: 'PChome',
      },
    ],
    search: ['WR-100VW', 'NH-VS100HP', 'KD-FKH10DT'],
    vendors: [
      {
        name: 'LG 客服',
        detail: '安裝、保固諮詢',
        phone: '0800-898-899',
      },
      {
        name: 'Panasonic 客服',
        detail: '安裝、保固諮詢',
        phone: '0800-098-800',
      },
    ],
    notes: [
      'LG 在部分通路標示深 69，以官網的 66 為準；可以預留深 70 比較保險',
      '想要最淺：聲寶 SD-10DH 深 62.5（約 NT$25,900）；想要可以換門的方向：Bosch WQB245A0TC 9 kg、220V（約 NT$49,900）',
      '和洗衣機並排時，兩台的門最好往外側開、不要互相擋到；LG 門不能換邊，要先排好左右位置',
    ],
  },
  shower: {
    summary: '淋浴間是建商附的，最實用的升級是浴室暖風乾燥機（冬天暖房、雨天烘衣、防霉）；想換龍頭可以改成恆溫淋浴柱。',
    specs: [
      '暖風機要在天花板開 30 × 30 cm 的孔，接 Ø100 排風管',
      '暖風機要專用迴路：110V 型 20A、220V 型 15A 全極開關',
      '淋浴柱要搭明管式冷熱水出水口',
    ],
    picks: [
      {
        name: '國際牌 FV-30BD1W（220V）／FV-30BD1R（110V）',
        rec: true,
        detail: 'DC 馬達、陶瓷加熱；暖房／乾燥／換氣／涼風，無線遙控；本體 27 × 29 × 18，1,650 W',
        price: '約 NT$7,280～7,400（2026/09 PChome，不含安裝）',
        url: 'https://24h.pchome.com.tw/prod/DPAL4U-A900K3YMA',
        source: 'PChome',
      },
      {
        name: 'KOHLER Atom 恆溫三出水淋浴柱 K-32404T-7-CP',
        detail: '恆溫閥避免水溫忽冷忽熱；三出水，有 3 種噴灑模式，鍍鉻',
        price: '約 NT$16,071（2026/09 PChome，不含安裝）',
        url: 'https://24h.pchome.com.tw/prod/DEDW0U-A900KGZR1',
        source: 'PChome',
      },
    ],
    search: ['FV-30BD1W', 'FV-30BD1R', 'K-32404T'],
    notes: [
      '趁交屋裝修時一起做；浴室如果已經有抽風機，可以沿用原本的風管位置換成暖風機',
      '浴室較大或常烘衣服，可以選 FV-40BU1R／W（換氣 200 m³/h，開孔 40 × 28），約 NT$9,600～9,900',
      '換淋浴柱會動到建商附的設備，先確認保固條款，並量好冷熱水出水口的孔距',
    ],
  },

  // ───────────── 客廳、玄關、廚房家電（2026/09 查詢） ─────────────
  sofa: {
    summary: '寬 210 以內的三人座選擇不多，優先挑座深 55～61、座高 42～45、扶手窄的款式。',
    specs: ['外寬 ≤ 205（兩側各留 2～3）', '深 ≤ 90、椅背高 ≤ 80', '座深 55～61、座高 42～45，兩人久坐不累', '座墊選高回彈泡棉或獨立筒'],
    picks: [
      {
        name: 'IKEA LANDSKRONA 三人座沙發（Gunnared 布）',
        rec: true,
        detail: '204 × 89 × 78，座深 61、座高 44；高回彈泡棉，扶手可拆，10 年保固',
        price: '約 NT$22,990（2026/09 IKEA）；皮面款約 NT$24,990',
        url: 'https://www.ikea.com.tw/zh/products/sofas/sofas/landskrona-spr-29270322',
        source: 'IKEA',
      },
      {
        name: 'NITORI 半皮 3 人座沙發 CAPUCCINO DBR',
        detail: '206 × 96 × 89，座高 43，座面真皮、椅背可拆；深多 6、高多 9，超出預留',
        price: '約 NT$16,110（2026/09 PChome）',
        url: 'https://24h.pchome.com.tw/prod/DQCI01-A900GTPCO',
        source: 'PChome',
      },
      {
        name: 'BoConcept Osaka 2.5 人座沙發',
        detail: '198 × 87.5 × 77.5，座高 45；丹麥設計，細腳、比例輕巧，布料可選',
        price: '價格請以門市為準',
        source: 'BoConcept 門市',
      },
    ],
    search: ['IKEA LANDSKRONA 三人座', 'NITORI 半皮3人座沙發 CAPUCCINO', '三人座沙發 寬200'],
    vendors: [
      {
        name: 'BoConcept 台灣',
        detail: '丹麥品牌，布料與腳座可選；另有展示品現貨折扣區',
        url: 'https://boconcepttaiwan.wixsite.com/boconcept/shop',
      },
    ],
    notes: [
      'IKEA KIVIK 三人座寬 228、NITORI HIGH GRADE 216 × 94 × 99，都放不下',
      '台灣訂製沙發可以指定寬 205、深 88、高 78',
      '買前到門市兩人並坐試坐，座深與椅背角度最影響舒適度',
    ],
  },
  coffee: {
    summary: '沙發座高約 44，茶几高 40～45 最順手；IKEA 常見尺寸是 90 × 55。',
    specs: ['寬 90～100、深 ≤ 55', '高 38～45（略低於座面）', '圓角、有下層可收遙控器'],
    picks: [
      {
        name: 'IKEA LACK 茶几 90 × 55（黑棕色）',
        rec: true,
        detail: '90 × 55 × 45，附下層置物板；輕巧好搬，桌面承重 20 kg',
        price: '約 NT$999（2026/09 IKEA）',
        url: 'https://www.ikea.com.tw/zh/products/sofa-tables/sofa-tables-and-side-tables/lack-art-20352987',
        source: 'IKEA',
      },
      {
        name: 'NITORI 升降茶几 LIFTY3 CN MBR',
        detail: '100 × 60 × 38，桌面可升到 61 當工作桌，內有收納；深度多 10',
        price: '約 NT$5,841（2026/09 PChome）',
        url: 'https://24h.pchome.com.tw/prod/DQCI03-A900I0NCZ',
        source: 'PChome',
      },
    ],
    search: ['IKEA LACK 茶几', 'NITORI 升降茶几 LIFTY3', '茶几 100x50'],
    notes: ['深 60 的款式會壓縮沙發前的走道，買前先量茶几到電視櫃的距離'],
  },
  rug: {
    summary: '200 × 150 不是 IKEA 標準尺寸，可以選 155 × 220 或 133 × 195；短毛比較好吸、好清。',
    specs: ['約 150 × 200（±10）', '毛長 ≤ 15 mm，方便吸塵器', '地磚或木地板要加止滑墊'],
    picks: [
      {
        name: 'IKEA TIPHEDE 平織地毯 155 × 220',
        detail: '100% 棉平織，可機洗 40°C；輕薄好收，夏天適用',
        price: '約 NT$699（2026/09 IKEA）',
        url: 'https://www.ikea.com.tw/zh/products/home-furnishing-rugs/rugs/tiphede-art-60470045',
        source: 'IKEA',
      },
      {
        name: 'IKEA STOENSE 短毛地毯 133 × 195',
        rec: true,
        detail: '短毛 15 mm，柔軟吸音；不可水洗，建議加 STOPP FILT 止滑墊',
        price: '約 NT$2,499（2026/09 IKEA）',
        url: 'https://www.ikea.com.tw/zh/products/home-furnishing-rugs/rugs/stoense-art-20427006',
        source: 'IKEA',
      },
      {
        name: 'IKEA PELARKÖRSBÄR 短毛地毯 160 × 230',
        detail: '短毛 14 mm，米色葉紋，可以蓋到沙發前腳；不可水洗',
        price: '約 NT$5,499（2026/09 IKEA）',
        url: 'https://www.ikea.com.tw/zh/products/home-furnishing-rugs/rugs/pelarkorsbar-art-70625773',
        source: 'IKEA',
      },
    ],
    search: ['地毯 150x200', '短毛地毯 140x200', '可機洗地毯 150x200'],
    notes: ['地毯前緣壓進沙發前腳 10～20 cm，看起來比較整齊'],
  },
  tv: {
    summary: '180 cm 看 55 吋 4K 剛好；白天光線強選 Mini LED，晚上看片選 OLED。',
    specs: ['55 吋機身寬約 123，放 180 cm 櫃兩側各剩約 28', '腳座深 ≤ 櫃深，中央腳座最不挑櫃', '2025～2026 年款，HDMI 2.1、120Hz 以上'],
    picks: [
      {
        name: 'Samsung QA55QN80HAXXZW（QN80H，2026）',
        detail: 'Neo QLED Mini LED、144Hz，系統 7 年更新；亮度高，適合採光好的客廳',
        price: '約 NT$36,900（2026/09 momo）',
        url: 'https://www.momoshop.com.tw/TP/TP0005785/goodsDetail/TP00057850001485',
        source: 'momo',
      },
      {
        name: 'LG OLED55C5PTA（C5，2025）',
        rec: true,
        detail: 'OLED 自發光、120Hz、144Hz VRR、webOS 25；前代降價，CP 值高',
        price: '約 NT$39,900（2026/09 PChome）',
        url: 'https://24h.pchome.com.tw/prod/DPADYE-A900JC4LM',
        source: 'PChome',
      },
      {
        name: 'LG OLED55C6PTA（C6，2026）',
        detail: 'OLED evo、165Hz VRR、α11 處理器；中央腳座 47 × 23',
        price: '約 NT$52,900（2026/09 momo）',
        url: 'https://www.lg.com/tw/tv-soundbars/oled-evo/oled55c6pta/',
        source: 'LG 官網',
      },
      {
        name: 'Sony Y-55XR70M2（BRAVIA 7 II，2026）',
        detail: 'True RGB LED 背光、廣視角抗反射、Google TV；亮度與色彩兼顧',
        price: '約 NT$59,900（2026/09 momo）',
        url: 'https://www.momoshop.com.tw/product/15388401',
        source: 'momo',
      },
    ],
    search: ['OLED55C6PTA', 'Y-55XR70M2', 'QA55QN80HAXXZW'],
    notes: [
      'OLED 長時間顯示同一畫面（例如新聞台台標）有烙印風險，一般使用不用太擔心',
      '確認電視櫃承重，插座與 HDMI 出線位置預留在電視後方',
    ],
  },
  vacuum: {
    summary: '能完整放進 30 × 25 的是日系輕量機；自動集塵座的深度多在 28～31。',
    specs: ['座子底面 ≤ 30 W × 25 D', '主機掛上後總高 ≤ 128（離地 130 起是洞洞板）', '旁邊要有插座，建議裝在離地 20～40'],
    picks: [
      {
        name: '日立 HITACHI PV-XH4P',
        rec: true,
        detail: '日本製、1.95 kg、225AW、續航 60 分；附壁掛／直立兩用充電座，機身 25 × 23 × 122',
        price: '約 NT$8,730（2026/09 momo）',
        url: 'https://www.momoshop.com.tw/product/14784090',
        source: 'momo',
      },
      {
        name: '追覓 Dreame Air Station',
        detail: '1.1 kg、100AW，自動集塵約 50 天倒一次；含座 28 × 27.7 × 122，深多 2.7',
        price: '約 NT$9,911（2026/09 追覓官網）',
        url: 'https://www.dreametech.com.tw/products/air-station',
        source: '追覓官網',
      },
      {
        name: 'Dyson V12 Detect Slim Fluffy（SV46）',
        detail: '光學顯塵、附收納架；官方 Floor Dok 約 13.5 × 31，深多 6',
        price: '約 NT$17,900（2026/09 Dyson 官網）',
        url: 'https://shop.dyson.tw/vacuums/cordless-vacuums/dyson-v12-detect-slim-fluffy-sv46-448750-01',
        source: 'Dyson 官網',
      },
    ],
    search: ['PV-XH4P', 'Dreame Air Station', 'Dyson V12 Detect Slim SV46'],
    notes: [
      'LG A9T 集塵塔含主機約 25.5 × 29 × 112，深多 4；三星 Bespoke AI Jet 清潔站約 30 × 30',
      'PV-XH4P 充電座的底面尺寸官方沒寫，買前請向店家確認',
      'Dyson 掛上收納架後的總高，請確認低於 130',
    ],
  },
  pegboard: {
    summary: 'IKEA SKÅDIS 76 × 56 兩片直放，拼成 112 × 76，置中掛在 130～230 區最省事。',
    specs: ['可用範圍 125 W × 100 H（離地 130～230）', '常用的鑰匙掛在離地 140～170 最順手', '要掛包包就要鎖進 RC 牆，輕隔間要加角材'],
    picks: [
      {
        name: 'IKEA SKÅDIS 收納壁板 76 × 56（黑）',
        rec: true,
        detail: '纖維板，可橫放、直放或拼接；附上牆桿，螺絲另購。直放兩片 = 112 × 76',
        price: '約 NT$599／片（2026/09 IKEA）',
        cost: 1198,
        costNote: '要兩片',
        url: 'https://www.ikea.com.tw/zh/products/wall-organisers/boards-and-wall-organisers/skadis-art-30534379',
        source: 'IKEA',
      },
      {
        name: 'IKEA SKÅDIS 收納壁板組 76 × 56（白）',
        detail: '含壁板、連接件、夾子、置物籃 3 件；可再加掛勾、層架',
        price: '約 NT$1,099（2026/09 IKEA）',
        url: 'https://www.ikea.com.tw/zh/products/wall-organisers/boards-and-wall-organisers/skadis-spr-69515978',
        source: 'IKEA',
      },
    ],
    search: ['洞洞板 120x100', '鐵製洞洞板', '木質洞洞板'],
    notes: [
      'SKÅDIS 是纖維板，玄關要避免直接潑到水',
      '鐵製洞洞板承重較高，可以搜尋接近 120 × 100 的尺寸',
      '板子下緣和鞋櫃頂留 2～3 cm，檯面比較好擦',
    ],
  },
  espresso: {
    summary: '25 × 35 放得下膠囊機或窄身半自動機；半自動機另外要留磨豆機的位置。',
    specs: ['機身寬 ≤ 25、深 ≤ 35（檯面深 40，留插頭空間）', '110V、約 1,200 W，建議用獨立插座'],
    picks: [
      {
        name: 'Nespresso Essenza Mini（膠囊機）',
        detail: '8.4 × 33 × 20.4，19 bar、水箱 0.6 L；最省空間，適合喝黑咖啡',
        price: '約 NT$3,300（2026/09 momo）',
        url: 'https://www.momoshop.com.tw/product/6198895',
        source: 'momo',
      },
      {
        name: "De'Longhi Dedica Arte EC885.M（半自動）",
        rec: true,
        detail: '15 × 33 × 31，15 bar，手動蒸氣管可打奶泡；新手入門',
        price: '約 NT$7,990～8,490（2026/09 PChome）',
        url: 'https://24h.pchome.com.tw/prod/DMAT03-A900H1735',
        source: 'PChome',
      },
      {
        name: 'Breville BES450XL the Bambino（半自動）',
        detail: '約 19.5 × 32 × 31，PID 溫控、3 秒加熱、預浸泡；總代理公司貨',
        price: '約 NT$12,800（2026/09 momo）',
        url: 'https://www.momoshop.com.tw/product/14547707',
        source: 'momo',
      },
    ],
    search: ['Nespresso Essenza Mini', 'EC885.M', 'Breville BES450'],
    notes: ['Nespresso Vertuo 系列機身多半深超過 40，這個檯面放不下', '半自動機要搭磨豆機（寬約 12～15），咖啡櫃檯面寬 100 放得下兩台'],
  },
  fridge: {
    summary:
      '六門、製冰室獨立一格：首選寬 65、深 69.9、容量約 540 L 的日系六門，放得進現在的位置，背面可以貼牆；製冰靠冷藏室裡的給水盒，不用接水管。',
    specs: [
      '六門：上面對開冷藏室，下面依序是製冰室、上段冷凍、冷凍室、蔬果室',
      '製冰室單獨一格抽屜、自動製冰；水從冷藏室的給水盒來，不用接水管',
      '寬 ≤ 68.5、深 ≤ 74、高 ≤ 185；選寬 65、深 69.9 的剛好放進現在的位置',
      '散熱：日系多數左右各 0.5、上方 4～5 cm，背面可以貼牆',
      '開門後從牆面算起約 96～103 cm，冰箱前面要留走道',
    ],
    picks: [
      {
        name: '國際牌 NR-F552YT（六門 545L）',
        detail: '65 × 69.9 × 185；獨立製冰室 19L＋給水盒自動製冰（附淨水濾網）；上層對開；一級能效 288 度／年',
        price: '約 NT$54,900（2026/09 PChome）',
        url: 'https://24h.pchome.com.tw/prod/DPAC1T-A900JBMCD',
        source: 'PChome',
        rec: true,
      },
      {
        name: '日立 RHW540YJ（六門 537L）',
        detail: '65 × 69.9 × 183.3；獨立製冰室＋自動製冰（一鍵自動清潔）；上層對開；一級能效 276 度／年；背面 0 cm',
        price: '約 NT$68,000（2026/09 PChome 折後；定價 73,900）',
        url: 'https://www.3uo.tw/ecommerce/RHW540YJ/',
        source: '玉明電器',
      },
      {
        name: '三菱 MR-WZ54N（六門 543L）',
        detail: '65 × 69.9 × 183.3；獨立製冰室約 20L＋埋入式水箱自動製冰；上層對開；一級能效',
        price: '約 NT$66,800（2026/09 Yahoo 購物中心，含基本安裝＋舊機回收）',
        url: 'https://tw.buy.yahoo.com/gdsale/MITSUBISHI-%E4%B8%89%E8%8F%B1-%E6%97%A5%E8%A3%BD%E5%85%AD%E9%96%80543L-%E8%AE%8A%E9%A0%BB%E7%8E%BB%E7%92%83%E9%8F%A1%E9%9D%A2%E5%86%B0%E7%AE%B1-MR-WZ54N-12243430.html',
        source: 'Yahoo 購物中心',
      },
      {
        name: '東芝 GR-ZP550TFW(UW)（六門 551L）',
        detail: '68.5 × 70.2 × 183.3；獨立製冰室 20L＋自動製冰；雙電動觸控對開門；一級能效 300 度／年',
        price: '約 NT$64,900（2026/09 PChome，含定位＋舊機回收）',
        url: 'https://24h.pchome.com.tw/prod/DPAC0J-A900HLS07',
        source: 'PChome',
      },
      {
        name: '夏普 SJ-GK51AT（六門 504L）',
        detail: '65 × 68.4 × 183.8；獨立製冰室 22L＋80 分鐘急速製冰；上層對開；一級能效 300 度／年；預算款',
        price: '約 NT$49,900（2026/09 PChome，含定位＋舊機回收）',
        url: 'https://24h.pchome.com.tw/prod/DPAC6X-A900HAJN8',
        source: 'PChome',
      },
      {
        name: '日立 RHW620RJ（六門 614L）',
        detail: '68.5 × 73.8 × 183.3；獨立製冰室 21L；日本製、容量最大；深度比位置多約 4 cm',
        price: '約 NT$74,700（2026/09 PChome）',
        url: 'https://24h.pchome.com.tw/prod/DPAC46-A900FN45N',
        source: 'PChome',
      },
    ],
    search: ['NR-F552YT', 'RHW540YJ', 'MR-WZ54N'],
    notes: [
      '台灣市售六門都是上層左右兩片門對開，單片約 30 cm 寬，開門迴轉小',
      '冰箱一側貼牆時離側牆至少 1.5 cm，門才開得過 90 度、抽屜拿得出來',
      '給水盒要定期補水，每 1～2 週清洗一次',
      '插座不要設在冰箱正後方中央，以免插頭頂住背板；110V 建議專用插座',
      '包裝比機身大一圈，下單前先量好電梯、大門、走道轉角',
    ],
  },

  // ───────────── 臥室、書房（2026/09 查詢） ─────────────
  mbed: {
    summary: '台規 6 × 6.2 尺（182 × 188）床墊，配同規格後掀床底（主臥衣櫃小，床底收納很有用）；床頭片 12 cm 以內才放得進 182 × 200。',
    specs: ['床墊 182 × 188（台規雙人加大 6 × 6.2 尺）', '床架含床頭 ≤ 182 × 200', '主臥衣櫃小 → 選掀床收納'],
    picks: [
      {
        name: 'Lunio Quantum Max 石墨烯高碳錳獨立筒床墊 6 尺',
        rec: true,
        detail: '180 × 188 台規；乳膠＋高碳錳獨立筒、5 區支撐、床沿加固，中等偏硬',
        price: '約 NT$17,540（2026/09 PChome）',
        url: 'https://24h.pchome.com.tw/prod/DEBRCH-A900HTG5G',
        source: 'PChome',
      },
      {
        name: 'Serta 舒達 SleepTrue 卡羅爾頓 乳膠獨立筒床墊 6 × 6.2 尺',
        detail: '182 × 188 × 29；天然乳膠＋袋裝獨立筒，偏硬',
        price: '約 NT$30,480（2026/09 PChome）',
        url: 'https://24h.pchome.com.tw/prod/DEBRG7-A900H4ATC',
        source: 'PChome',
      },
      {
        name: '德泰 歐蒂斯系列 B2 獨立筒床墊 雙人加大 6 尺',
        detail: '182 × 188 × 22；蜂巢式獨立筒、台灣手工製，適中偏硬',
        price: '約 NT$35,599（2026/09 PChome）',
        url: 'https://24h.pchome.com.tw/prod/CDAC3G-A77578008',
        source: 'PChome',
      },
      {
        name: 'ASSARI 強化加厚收納後掀床架 雙大 6 尺',
        rec: true,
        detail: '後掀床底（無床頭）、木芯板、整床底收納；可另配薄床頭片',
        price: '約 NT$9,162（2026/09 PChome）',
        url: 'https://24h.pchome.com.tw/prod/DQBU7T-A900JNS4O',
        source: 'PChome',
      },
      {
        name: 'ASSARI 利佩貓抓皮耐重電動掀床架 雙大 6 尺',
        detail: '電動掀起，重床墊也不必硬推；貓抓皮包覆',
        price: '約 NT$28,466（2026/09 PChome）',
        url: 'https://24h.pchome.com.tw/prod/DQBU4T-A900JPKT1',
        source: 'PChome',
      },
    ],
    search: ['Lunio Quantum Max 6尺', '德泰 歐蒂斯 B2 雙人加大', 'ASSARI 後掀床架 雙大6尺'],
    vendors: [
      {
        name: 'Lunio 官網',
        detail: '旗艦 Gen4 石墨烯乳膠床墊 6 尺約 NT$33,990（2026/09 官網）',
        url: 'https://lunio.com.tw/product/lunio-latex-mattress/',
      },
    ],
    notes: [
      '床墊一張＋床架一張各勾一個；台規雙人加大 182 × 188，Sealy 台灣 183 × 190、IKEA 180 × 200，床墊和床架要同一規格',
      '後掀床床尾要能站人操作；下單時告知床墊厚度與重量，好配對應的氣壓棒',
      'ASSARI 床架的外尺寸在賣場圖片上，下單前請跟賣家確認',
    ],
  },
  massage: {
    summary: '選前滑式零靠牆機種；OSIM 大天王直立 122、躺平 179，最貼合 80 × 140（躺平 180）的預留。',
    specs: ['佔地 80 W × 140 D（直立）', '零靠牆前滑，躺平長約 180 以內', '椅側要有 110V 插座'],
    picks: [
      {
        name: 'OSIM 大天王 uDeluxe Max OS-8210',
        rec: true,
        detail: '直立 74 × 122、後仰 179、81 kg；零重力（零牆距請到門市確認）',
        price: '約 NT$72,888（2026/09 PChome）',
        url: 'https://24h.pchome.com.tw/prod/DMAD6Q-A900FOSC9',
        source: 'PChome',
      },
      {
        name: 'tokuyo 花美椅 2 All-in TC-696',
        detail: '正座 77 × 143（比預留深 3 cm）、躺平 173、76 kg；零靠牆、台灣製',
        price: '約 NT$76,900（2026/09 PChome）',
        url: 'https://24h.pchome.com.tw/prod/DMADFP-A900JTAIY',
        source: 'PChome',
      },
      {
        name: 'JHT i芯深捏臀感按摩椅 K-323',
        detail: '直立 74 × 135、平躺 168、71 kg；離牆 5 cm 自動前滑',
        price: '約 NT$32,600（2026/09 PChome）',
        url: 'https://24h.pchome.com.tw/prod/DMADC2-A900HALLF',
        source: 'PChome',
      },
    ],
    search: ['OSIM OS-8210', 'tokuyo TC-696', 'JHT K-323'],
    vendors: [
      {
        name: 'tokuyo 客服',
        detail: '詢問 TC-696 門市試坐與實際離牆距離',
        phone: '0800-369963',
      },
    ],
    notes: [
      'OSIM 旗艦 uLove 3（OS-8218）後仰 185、建議後方留 10，超過預留（約 NT$169,800）',
      '躺平時前方要淨空到約 180；機身 70～105 kg，先量次臥門寬，地板加保護墊',
    ],
  },
  bdesk1: {
    summary: '選三節式雙馬達、桌板 120 × 60；坐姿可以降到約 63、站姿升到 125 以上。',
    specs: ['桌面 120 × 60 × 2 張並排（共 240 寬）', '雙馬達、三節式', '面牆擺放，要預留插座'],
    picks: [
      {
        name: 'FUNTE Prime 電動升降桌 三節式（桌板 120 × 60）',
        detail: 'SGS 雙馬達、耐重 120 kg、63.7～128（含桌板）；桌架與馬達保固 5 年',
        price: '約 NT$12,990～18,600／張（2026/09 官網，依節數與桌板）',
        url: 'https://www.funtetw.com/products/standing-desk-1',
        source: 'FUNTE 官網',
      },
      {
        name: 'FlexiSpot 三節式磁吸收納電動升降桌 120 × 60（升級款）',
        rec: true,
        detail: '雙電機、63.5～129、承重 125 kg、4 組記憶；需自行安裝',
        price: '約 NT$10,900／張（2026/09 PChome）',
        url: 'https://24h.pchome.com.tw/prod/DQBK8K-A900GCK4Y',
        source: 'PChome',
      },
      {
        name: '樂歌 Loctek DF1 電動升降桌 120 × 60',
        detail: '三節雙馬達、約 62.5～127.5、承重 100 kg、4 組記憶、USB-A/C',
        price: '約 NT$14,999／張（2026/09 PChome）',
        url: 'https://24h.pchome.com.tw/prod/DQCB9N-A900HAZBU',
        source: 'PChome',
      },
    ],
    search: ['FUNTE Prime 三節式 120x60', 'Flexispot 三節式 120*60', '樂歌 DF1 120x60'],
    vendors: [
      {
        name: 'FUNTE 新莊思源店',
        detail: '新北市新莊區思源路 686 號，週三公休，可以試升降桌和工學椅',
        phone: '(02) 8521-5798',
        url: 'https://www.funtetw.com/pages/xinzhuang-appointment',
      },
      {
        name: 'FUNTE 台北概念店',
        detail: '台北市大安區通安街 8 號，信義安和站步行 2 分鐘',
        phone: '(02) 2325-5688',
      },
    ],
    notes: [
      '兩張並排時兩桌之間留 1～2 cm，升降速度不一樣才不會互刮',
      '插座設在桌下（約 30～40 cm 高），電源線要留足升降行程（約 65 cm）',
      '樂歌安裝完成後不適用 7 天鑑賞期；FUNTE 客製尺寸也不能無條件退',
    ],
  },
  bchair1: {
    summary: '入門選西昊 M57C、中階選 Backbone Kabuto、高階選 Aeron；椅腳實際佔地約 65～70。',
    specs: ['預留 50 × 50（實際椅腳直徑約 65～70）', '頭枕、腰靠、扶手可調'],
    picks: [
      {
        name: '西昊 SIHOO M57C 仿生舒適椅',
        detail: '分體仿生椅背、3D 頭枕、座高可調 10 cm、耐重 125 kg、保固 3 年',
        price: '約 NT$6,900／張（2026/09 FUNTE 官網）',
        url: 'https://www.funtetw.com/products/ergonomic-chairs-sihoo-m57c',
        source: 'FUNTE 官網',
      },
      {
        name: 'Backbone Kabuto 人體工學椅（經典黑框）',
        rec: true,
        detail: '台灣品牌；網背、頭枕升降、3D 扶手、椅背傾仰；結構保固 2 年',
        price: '約 NT$12,880／張（2026/09 PChome）',
        url: 'https://24h.pchome.com.tw/prod/DEBHC3-A900BVNLC',
        source: 'PChome',
      },
      {
        name: 'Herman Miller Aeron 全功能 B Size',
        detail: '寬 65.8 × 深 59.8、腳座直徑 69.9；前傾、PostureFit 腰靠；原廠授權',
        price: '約 NT$38,900／張（2026/09 PChome 世代家具）',
        url: 'https://24h.pchome.com.tw/prod/DCBV09-A900IUC2J',
        source: 'PChome',
      },
    ],
    search: ['西昊 M57C', 'Backbone Kabuto', 'Herman Miller Aeron B Size'],
    vendors: [
      {
        name: 'FUNTE 直營門市',
        detail: '新莊、台北、台中三家門市都能試坐西昊等工學椅',
        phone: '(02) 8521-5798',
        url: 'https://www.funtetw.com/pages/xinzhuang-appointment',
      },
      {
        name: '世代家具（Herman Miller 授權）',
        detail: 'Aeron 原廠授權經銷，PChome 賣場客服',
        phone: '(02) 2659-1799',
      },
    ],
    notes: [
      '50 × 50 只算座面；五爪椅腳約 65～70，兩張並排時椅間走道要留夠',
      'Aeron 分 A／B／C 三個尺寸，B 適合身高 160～179、體重 50～80 kg',
      '平行輸入的 Aeron 約 NT$25,990 起，但沒有台灣原廠保固',
    ],
  },
  projector: {
    summary:
      '依你給的尺寸（19 × 19 × 24.8、4 kg）找不到完全吻合的型號，請告訴我品牌型號就能精算投影距離；一般投射比 1.2 在 2.7 m 會投出約 100 吋。',
    specs: ['機身 19 × 19 × 24.8（含鏡頭）／24.9（含支架）、4 kg', '床頭櫃到牆約 2.7 m、目標 80 吋', '80 吋 @ 2.7 m 需要投射比約 1.52'],
    picks: [
      {
        name: 'Hisense 海信 小魔方 M2 Pro（最接近的候選，不是完全吻合）',
        detail: '21.8 × 19.3 × 23.0、3.5 kg、光學變焦 1.0～1.3；80 吋需 1.8～2.3 m',
        price: '約 NT$36,900（2026/09 PChome）',
        url: 'https://24h.pchome.com.tw/prod/DPAE9I-A900JHPBK',
        source: 'PChome',
      },
    ],
    search: ['Hisense M2 Pro', '雲台 雷射投影機 4K', '投影機 光學變焦'],
    notes: [
      '比對過 XGIMI、Dangbei、JMGO、Hisense、BenQ、Epson 等，都不符合 19 × 19 × 24.8／4 kg',
      '在 2.7 m：投射比 1.2 約 102 吋（寬 225），1.0 約 122 吋，1.3 約 94 吋',
      '要 80 吋：投射比 1.2 的機種要放在約 2.1 m，或在 2.7 m 用數位縮放（解析度和亮度會打折）',
      '床頭櫃偏低要往上仰，梯形校正會吃掉畫素；可以墊高到接近畫面下緣',
    ],
  },

  // 床頭櫃（買現成的，2026/09 查詢）
  mns1: {
    summary: '牆邊只有 30 cm，兩顆都選寬 30、深 30～40、高 45～53.5 的同款成品櫃；放投影機那顆要選箱體結構，最好有內建插座或雙抽屜。',
    specs: [
      '寬 26～32：牆邊那顆 ≤ 30，床往外挪一點最多 32；兩顆同款',
      '深 ≤ 40（35 以內最好）；高 45～55，和床墊面（50～55）一樣高或略低',
      '放投影機那顆：頂板至少 25 × 25、放 4 kg 不晃；箱體結構比細腳桌穩',
      '一抽屜＋一開放格或兩個抽屜；背面開放、有出線孔或內建插座更好',
    ],
    picks: [
      {
        name: 'HOPMA 合馬 嵌入式美背插座單抽床頭櫃（2 入）',
        detail: '寬 30 × 深 40 × 高 53.5；上抽屜、下開放格，頂部有 AC × 2、USB、Type-C 插座；台灣製 E1 塑合板，有白櫻桃色',
        price: '約 NT$1,888／2 入，單買約 NT$999（2026/09 PChome）',
        url: 'https://24h.pchome.com.tw/prod/DQCD3G-A900GNRZV',
        source: 'PChome',
        cost: 944,
        costNote: '2 入組平均一個',
        rec: true,
      },
      {
        name: 'NITORI 宜得利 實木邊桌 松木 LUCA（網購限定）',
        detail: '約寬 30 × 深 30 × 高 50；松木實木，一抽屜＋下層板，背面開放好走線；四腳桌型，要自己組',
        price: '約 NT$1,490／個（2026/09 NITORI 官網）',
        url: 'https://www.nitori-net.tw/product/2600277s',
        source: 'NITORI 官網',
      },
      {
        name: 'IKEA PS 2026 床邊桌 松木／下翻門',
        detail: '寬 30 × 深 30 × 高 50；實心松木箱體，下翻門＋內層板，沒有抽屜，結構紮實',
        price: '約 NT$2,499／個（2026/09 IKEA）',
        url: 'https://www.ikea.com.tw/zh/products/chests-and-other-furniture/bedside-tables/ikea-ps-2026-art-70621765',
        source: 'IKEA 官網',
      },
      {
        name: '直人木業 DELA 簡約風白榆木床頭櫃 30cm',
        detail: '寬 30 × 深 40 × 高 52.5；兩個抽屜、三節滑軌，18 mm 木芯板；台灣製，保固 3 年',
        price: '約 NT$2,960～3,020／個（2026/09 PChome）',
        url: 'https://24h.pchome.com.tw/prod/DQCD2Y-A900KB617',
        source: 'PChome',
      },
      {
        name: '有情門 小寶置物櫃 W30',
        detail: '寬 30 × 深 33 × 高 45；梣木實木＋樺木積層板，兩個抽屜，圓角箱體最穩；6 種木色',
        price: '約 NT$9,200／個（2026/09 有情門官網）',
        url: 'https://www.twucm.com/zh-TW/products/loop-storage-cabinet',
        source: '有情門官網',
      },
    ],
    search: ['床頭櫃 寬30 高50', '插座床頭櫃 30cm 台灣製', '直人木業 DELA 床頭櫃 30', '有情門 小寶置物櫃 W30'],
    vendors: [
      {
        name: 'IKEA 新莊店',
        detail: '新北市新莊區中正路 1 號，10:00～22:00；PS 2026 有現貨（新店店也有）',
        phone: '(02) 412-8869',
        url: 'https://www.ikea.com.tw/zh/store/hsin-chuang/info',
      },
      {
        name: 'NITORI 宜得利 中和環球店／土城大全聯店',
        detail: '中和區中山路三段 122 號；土城區永安街 25 號。LUCA 是網購限定，可以門市取貨',
        url: 'https://www.nitori-net.tw/store',
      },
      {
        name: '有情門 誠品新板門市',
        detail: '板橋區縣民大道二段 66 號 2 樓；去看小寶櫃前先打電話問有沒有展示',
        phone: '(02) 2721-6829',
        url: 'https://www.twucm.com/store/eslitebanqiao',
      },
    ],
    notes: [
      '牆邊那顆如果剛好 30 cm，買 30 寬會完全卡死，標示尺寸也常有 ±1～2 cm 誤差；下單前實際量一次，必要時床往外挪 1～2 cm',
      'IKEA、NITORI 的床邊桌大多寬 37～45，只有 PS 2026 和 LUCA 是 30 寬；MUJI 沒有寬 32 以下的',
      'HOPMA 有內建插座，投影機電源可以就近接，最適合放投影機那顆；兩顆都買 2 入組最划算',
      '更便宜：諳木藏庫 實木生態板二抽床頭櫃 30 × 30 × 49，PChome 約 NT$929',
      '投影機散熱孔不要貼牆，底下墊止滑墊',
      '門市可以先去看：IKEA 新莊店（PS 2026 有現貨）、NITORI 中和環球店／土城大全聯店、有情門 誠品新板門市',
    ],
  },

  // 洗臉盆浴櫃（建商的退掉，自己買；2026/09 查詢）
  vanity: {
    summary: '全套衛浴選寬 70～82、深 50 以內的壁掛吊櫃浴櫃組，櫃體用 PVC 防水發泡板、單孔龍頭；下單前先量好牆排／地排和三角凡爾位置。',
    specs: [
      '空間上限寬 85 × 深 50；盆緣高度約 80～85（吊櫃可依身高決定掛多高）',
      '櫃體 PVC 防水發泡板最好，其次不鏽鋼／鋁；避免塑合板、防潮板',
      '壁掛吊櫃（櫃底懸空）好清潔，淋浴間濺水也不會泡到櫃腳',
      '排水：牆排用 P 管、地排用 S 管，先量現場再決定',
    ],
    picks: [
      {
        name: '和成 HCG LCS8048-3111E（伊諾系列 80 cm）',
        detail: '整組約寬 80～82 × 深 50 × 高 65 壁掛；奈米釉陶瓷盆；全防水發泡板櫃；含 LF3111E 龍頭、按壓落水頭與全套管材（P 管，牆排）',
        price: '約 NT$22,730（2026/09 特力屋線上，定價 NT$46,300；含龍頭，安裝另計）',
        url: 'https://www.trplus.com.tw/p/016808615',
        source: '特力屋',
        rec: true,
      },
      {
        name: '新沐衛浴 80 cm 防水發泡板浴櫃組（經濟款）',
        detail: '寬 80 × 深 47、櫃高 62 壁掛；陶瓷盆；PVC 防水發泡板櫃；附台灣製龍頭、彈跳下水器、L 管、三角凡爾；地排要另備 S 管',
        price: '約 NT$7,489（2026/09 PChome；含龍頭，不含安裝）',
        url: 'https://24h.pchome.com.tw/prod/DECB0Y-A900BYPS3',
        source: 'PChome',
      },
      {
        name: 'TOTO LW1617CTW 70 cm 浴櫃組（TLG10302P 龍頭＋聯德爾櫃）',
        detail: '盆寬 70 × 深 46；櫃 70 × 46 × 45 PVC 防水發泡板吊櫃；含 TOTO 單槍龍頭、下水器、P 管（牆排）、三角凡爾',
        price: '約 NT$30,960（2026/09 PChome；含龍頭，不含安裝）',
        url: 'https://24h.pchome.com.tw/prod/DEDW26-A900JKHU5',
        source: 'PChome',
      },
    ],
    search: ['和成 LCS8048-3111E', 'TOTO LW1617CTW', '80cm 浴櫃組 防水發泡板 含龍頭'],
    notes: [
      '先量再買：建商管線位置固定，要量牆排出口離地高度與左右位置、兩顆三角凡爾高度；地排則量出口到牆的距離',
      '套組附的 P 管是牆排用；現場若是地排要改 S 管（特力屋連工帶料約 NT$450）',
      '吊櫃要鎖在 RC 牆或磚牆；輕隔間要先請師傅加強背板。到貨當場拆箱檢查瓷盆',
      '鏡櫃：TOTO 70 組可配聯德爾 WB-70D 雙門鏡櫃（70 × 15 × 70，約 NT$3,288）',
      '可以先去看：TOTO 億記展示中心（中和安平路 65 號，02-2946-6108）、和成生活館 板橋文化店（02-2251-0078）、特力屋 土城店（青雲路 152 號 2 樓）',
    ],
    related: [
      {
        title: '安裝費',
        info: {
          summary: '線上價都不含安裝；雙北一般水電師傅裝一組浴櫃（含裝龍頭）約 NT$2,000～4,000，不含拆舊、改管。',
          picks: [
            {
              name: '浴櫃組安裝（估價）',
              detail: '含裝龍頭、接冷熱水與排水；移管或地排改牆排另外報價',
              price: '約 NT$3,000（2026/09 行情推算）',
              cost: 3000,
              rec: true,
            },
          ],
          notes: ['兩間浴室同一天請同一位師傅裝，可以省一次出勤費'],
        },
      },
    ],
  },
  vanity2: {
    summary: '半套廁所選寬約 50、深 45 以內的壁掛吊櫃組，底下懸空，不佔地板也不擠走道。',
    specs: [
      '空間上限寬 70 × 深 48；廁所 235 × 93，要保留走道',
      '建議寬 48～51、深 ≤ 45 的壁掛吊櫃組',
      '單孔龍頭；櫃體以 PVC 防水發泡板為佳',
      '排水：牆排用 P 管、地排用 S 管，先量現場',
    ],
    picks: [
      {
        name: '和成 HCG LCS4175-3132E',
        detail: '整組寬 51 × 深 41 × 高 66、櫃 48 × 27.5 × 60 壁掛；陶瓷盆 4.3L；結晶鋼烤櫃；含 LF3132E 龍頭與 P 管（牆排）',
        price: '約 NT$12,749（2026/09 特力屋線上；含龍頭，安裝另計）',
        url: 'https://www.trplus.com.tw/p/016156904',
        source: '特力屋',
        rec: true,
      },
      {
        name: '凱撒 CAESAR LF5263 ＋ EH05263AP（純白壁掛）',
        detail: '盆寬 48 × 深 45、櫃 47 × 44 × 40 壁掛；陶瓷盆；防水發泡板櫃配結晶鋼烤門；另購 B380C 單孔龍頭（約 NT$2,446）與 P／S 管',
        price: '約 NT$6,596（2026/09 PChome，不含龍頭）；加龍頭合計約 NT$9,042',
        url: 'https://24h.pchome.com.tw/prod/DEDW1I-A900IWPE1',
        source: 'PChome',
        cost: 9042,
        costNote: '含另購的 B380C 龍頭',
      },
      {
        name: 'TOTO L710CSRETW 50 cm 浴櫃組（TLS04301PD 龍頭＋聯德爾櫃）',
        detail: '盆寬 50 × 深 45；櫃 50 × 45 × 57 PVC 防水發泡板吊櫃；含 TOTO 單槍龍頭、下水器、P 管（牆排）、三角凡爾',
        price: '約 NT$17,550（2026/09 PChome；含龍頭，不含安裝）',
        url: 'https://24h.pchome.com.tw/prod/DEDW26-A900HWWXT',
        source: 'PChome',
      },
    ],
    search: ['和成 LCS4175-3132E', '凱撒 LF5263 EH05263AP', 'TOTO L710CSRETW'],
    notes: [
      '廁所寬 93：臉盆靠長牆放、深 45 的盆還留約 48 cm 走道；想更寬鬆可以選凱撒 LF5239（盆 50 × 25，約 NT$6,596）',
      '先量現場：牆排出口高度、三角凡爾位置；吊櫃櫃高 40～60，管線要落在櫃內（背板開孔）或櫃下',
      '鏡櫃：凱撒 EM0150 單門鏡櫃 50 × 15 × 80（約 NT$5,150）',
      '可以先去看：特力屋 中和店（中山路二段 291 號）、TOTO 德固展示中心（板橋瑞安街 53 號，02-2967-5359）、電光 ALEX（樹林中山路二段 131 號，02-8684-3345）',
    ],
    related: [
      {
        title: '安裝費',
        info: {
          summary: '線上價都不含安裝；雙北一組約 NT$2,000～3,500（含裝龍頭，不含拆舊、改管）。',
          picks: [
            {
              name: '浴櫃組安裝（估價）',
              detail: '含裝龍頭、接冷熱水與排水；和全套衛浴同一天裝可以省出勤費',
              price: '約 NT$2,750（2026/09 行情推算）',
              cost: 2750,
              rec: true,
            },
          ],
        },
      },
    ],
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

/** 家具對應的選購資料 key（同款家具共用） */
export function shopKey(it: FurnitureItem): string | undefined {
  if (shopping[it.id]) return it.id
  const a = alias[it.id]
  return a && shopping[a] ? a : undefined
}

export function shopInfo(it: FurnitureItem): ShopInfo | undefined {
  const k = shopKey(it)
  return k ? shopping[k] : undefined
}

/** 商品的參考金額：price 文字裡第一個 NT$ 金額，範圍（a～b）取中間值；抓不到回傳 null */
export function pickCost(p: ShopPick): number | null {
  if (p.cost !== undefined) return p.cost
  const m = p.price?.match(/NT\$\s*([\d,]+)(?:\s*[～~–-]\s*([\d,]+))?/)
  if (!m) return null
  const a = Number(m[1].replace(/,/g, ''))
  const b = m[2] ? Number(m[2].replace(/,/g, '')) : null
  return b ? Math.round((a + b) / 2) : a
}

/** 一組可以勾選的商品：家具本身的建議商品，或附屬設備（中島的微波爐、插座…） */
export interface PickGroup {
  key: string
  title: string
  picks: ShopPick[]
  /** 同款家具的數量（例如餐椅 ×4），金額要乘上 */
  qty: number
}

/** 一件家具（同款共用）底下所有可以勾選的商品群組 */
export function pickGroups(key: string, qty: number): PickGroup[] {
  const info = shopping[key]
  if (!info) return []
  const out: PickGroup[] = []
  if (info.picks?.length) out.push({ key, title: '建議商品', picks: info.picks, qty })
  for (const r of info.related ?? [])
    if (r.info.picks?.length) out.push({ key: `${key}/${r.title}`, title: r.title, picks: r.info.picks, qty: 1 })
  return out
}

export const money = (n: number) => `NT$${Math.round(n).toLocaleString('en-US')}`

export const pchomeUrl = (q: string) => `https://24h.pchome.com.tw/search/?q=${encodeURIComponent(q)}`
export const momoUrl = (q: string) => `https://www.momoshop.com.tw/search/searchShop.jsp?keyword=${encodeURIComponent(q)}`
export const googleUrl = (q: string) => `https://www.google.com/search?q=${encodeURIComponent(q)}`

const APPLIANCES = [
  'tv',
  'fridge',
  'washer',
  'dryer',
  'acindoor',
  'acunit',
  'vacuum',
  'coffeemaker',
  'ricecooker',
  'airfryer',
  'microwave',
  'projector',
]

/** 分類：系統櫃（訂做）、訂製、家電、衛浴（自己買的洗臉盆）、建商附、家具 */
export function itemCategory(it: FurnitureItem): string {
  if (it.type === 'vanity') return '衛浴'
  if (it.type === 'kitchen' || (it.locked && it.type !== 'acunit')) return '建商附'
  if (it.type === 'peninsula') return '訂製'
  if (hasInterior(it)) return '系統櫃'
  if (it.type === 'projection') return '示意'
  if (APPLIANCES.includes(it.type)) return '家電'
  return '家具'
}
