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
  'fan-master': 'fan-living',
  'fan-bed2': 'fan-living',
  dchair2: 'dchair1',
  bshelf2: 'bshelf1',
  bdesk2: 'bdesk1',
  bchair2: 'bchair1',
  mns2: 'mns1',
  ac2: 'ac1',
}

export const shopping: Record<string, ShopInfo> = {
  // ───────────── 系統櫃（2026/09 查詢） ─────────────
  bward1: {
    summary:
      '純金屬衣櫃建議 IKEA ELVARLI：鋁立柱從地板頂到天花板，鋼層板、鋼衣桿都是白色粉體塗裝，外型乾淨接近無印；80＋80＋40 三格約 NT$1.5 萬。前面請鋁框廠做 3 片上吊式拉門（霧白鋁框＋長虹或霧面玻璃）。',
    specs: [
      'ELVARLI 每格只有 80 或 40 寬：80＋80＋40 加 4 支立柱約 220，最右邊剩約 20～30 也做層架、貼到牆：用訂製不鏽鋼窄層板（托架鎖在右牆和最後一支立柱上，層板高度和旁邊 40 格切齊），或放一座同寬的隙間鐵架；改用 cuzcuz、4WSpace 這類訂製鋼管系統就能直接做滿',
      '分工（對齊三片拉門）：左門最下面三個行李箱直立並排（28 吋＋登機箱 ×2，側面朝外、各自拿得出來，不疊），上面正式服、換季外套；中門是零碎的摺疊衣物和配件，5 層等高、用收納盒分類；右門長大衣；最右邊窄格不放燙衣板，整格做層架：包包直立、手拿包、掛燙機、除濕包和備用衣架；整座放冬天衣物、正式服裝、長裙長洋裝和配件（夏天衣物、運動服、睡衣在主臥）',
      '行李箱那格要量：28 吋直立側面朝外要深 50 以內（實際可用深度約 51），三個並排寬約 78',
      'ELVARLI 深 51，前面剩約 9 cm 給雙軌吊軌和門片，偏緊，要先請門廠確認',
      '拉門 3 片，每片約 82 × 294：雙軌一次只能開約 1/3（約 80 cm）',
      '門片接近鋁框抽料上限 300，一定要加中橫條、地面導輪和防跳；或改下段 240 拉門＋上段固定門',
    ],
    picks: [
      {
        name: 'IKEA ELVARLI 頂天立地收納系統（白，80＋80＋40 自己配）',
        detail:
          '鋁立柱（高 221.5～350 可調，要鎖天花板）＋鋼層板＋鋼衣桿（80 cm 承重 30 kg）；抽屜是塑合板不要選，改放金屬收納盒；沒有抽拉褲架',
        price: '約 NT$13,500～15,000（2026/09 IKEA 台灣單價加總）',
        url: 'https://www.ikea.com.tw/zh/products/wardrobes/open-storage-systems/elvarli-art-20296171',
        source: 'IKEA',
        cost: 15000,
        rec: true,
      },
      {
        name: 'IKEA BOAXEL 壁掛全金屬系統（白，80＋80＋60）',
        detail: '鍍鋅鋼橫軌＋壁條、金屬層板、鋼網籃；立柱最高 201，要把橫軌裝在約 298 cm 高，下面 1 m 放收納箱或行李箱；輕隔間要特別處理',
        price: '約 NT$5,500～7,000（2026/09 IKEA 台灣單價加總）',
        url: 'https://www.ikea.com.tw/zh/collections/boaxel',
        source: 'IKEA',
        cost: 6000,
      },
      {
        name: 'cuzcuz 角鋼衣架訂做（象牙白，鋼板層板＋吊衣桿）',
        detail: '中鋼熱軋碳鋼立柱、0.8 mm 鋼板層板，寬到 240、高到 300 可訂；倉庫在中和；外觀有沖孔、偏工業風',
        price: '推估約 NT$25,000～35,000（依官網參考價推算）',
        url: 'https://www.cuzcuz.com.tw/product-detail3-0-30.htm',
        source: 'cuzcuz',
        cost: 30000,
      },
      {
        name: '康萊 4WSpace 鋁擠型立柱更衣間（高預算）',
        detail: '鋁擠型陽極處理、300 高可做；另有含滑門的金屬框衣櫥系統，櫃體和滑門一家包辦（16.7～29.2 萬）',
        price: '開放一字型約 NT$45,650～83,130（2026/09 官網）',
        url: 'https://www.flexiwork.tw/pages/4w-closet',
        source: 'Flexiwork',
        cost: 55000,
      },
    ],
    vendors: [
      {
        name: '遠東鋁合金（鋁框拉門）',
        detail: '新北鋁框玻璃工廠，做上吊式、衣櫃拉門、同步連動門，有緩衝；玻璃有長虹、噴砂，框色有砂白、陽極',
        phone: '02-2203-8088',
        url: 'https://22038088.com/',
      },
      {
        name: '北二高實業（新店）',
        detail: '上吊門、推拉門，門框抽料上限 300 cm；玻璃可選強化、壓花、噴砂',
        phone: '(02) 8666-2910',
        url: 'https://www.high1688.com.tw/product_d.php?lang=tw&tb=1&id=162',
      },
      {
        name: '錦宥興業（新店）',
        detail: '鋁框門、玻璃隔間、衣櫃拉門、上吊式拉門，服務北北桃竹宜',
        phone: '02-2215-9090',
        url: 'http://www.jyl-co.com.tw/',
      },
      {
        name: '一全紗窗玻璃行（土城在地）',
        detail: '鋁門窗、鋁隔間訂做與維修，可以請來丈量、比價或日後維修',
        phone: '02-2261-9276',
      },
      {
        name: 'cuzcuz 3D 視覺化訂做家具（角鋼）',
        detail: '倉庫在中和民享街，網站可即時估價，有專人組裝',
        phone: '02-2226-0396',
        url: 'https://www.cuzcuz.com.tw/',
      },
    ],
    material: [
      'ELVARLI：鋁立柱（至少 70% 再生鋁）＋鋼衣桿、鋼層板，環氧／聚酯粉體塗裝；抽屜是塑合板，不要選',
      '拉門：鋁擠型框（砂白或陽極銀）＋5 mm 強化長虹或噴砂霧面玻璃，中段加鋁分隔條、加毛刷條防塵；吊輪選單門承重 60 kg 以上',
      '吊軌直接鎖在 RC 天花；天花不平要墊平，否則門會自己滑開，兩側加鋁收邊條',
    ],
    notes: [
      'ELVARLI 立柱要鎖在天花板（不是撐力）；RC 樓板用壁虎就好，上方如果有輕鋼架或矽酸鈣板天花，要鎖到樓板',
      '防塵：灰塵主要從吊軌上緣和門片下緣進來，要有毛刷條；摺疊衣物放有蓋的金屬或 PP 收納盒，最上層換季區用有蓋的箱子',
      '防鏽：土城潮濕，臥室除濕到 RH 55～60%；烤漆刮傷要馬上用補漆筆補',
      '褲架：ELVARLI、BOAXEL 都沒有抽拉褲架，褲子直接掛衣桿或摺起來放層板',
      '地板完成後再丈量拉門，格寬盡量對齊三片門的位置（每片約 82），不然會有格子一直被門片擋住',
      '價格：IKEA、cuzcuz、4WSpace 是 2026/09 官網價；拉門行情是 2023～2026 公開資料，雙北實際報價請找 2～3 家到場丈量',
    ],
    related: [
      {
        title: '衣物收納用品（次臥衣櫃）',
        info: {
          summary:
            'ELVARLI 層板實際可用深度約 50：抽屜盒選深 44.5 的無印 PP 收納盒（80 寬層板並排 2 個），配件用麻收納箱和分格盒，最上層用可折收納盒和真空袋。',
          specs: [
            '中間 80 格：無印 PP 收納盒（小）上下疊 2 個、並排 2 列 = 每層 4 個抽屜；毛衣那層用（深）一層 2 個',
            '配件層：無印麻收納箱（中）轉 26 寬放 3 個；領帶、腰帶用 SKUBB 分格盒',
            '拉門兩片重疊的地方抽屜拉不出來：抽屜放在每片門打開那一側',
          ],
          picks: [
            {
              name: '無印良品 PP 收納盒（小）34 × 44.5 × 18／2 入 × 4',
              rec: true,
              detail: '冬季內搭、褲子兩層，每層上下疊 2 個、並排 2 列',
              price: '約 NT$898／2 入 × 4 = NT$3,592（2026/10 MUJI）',
              cost: 3592,
              url: 'https://shop.muji.tw/SalePage/Index/9084002',
              source: 'MUJI',
            },
            {
              name: '無印良品 PP 收納盒（深）34 × 44.5 × 30／2 入',
              rec: true,
              detail: '毛衣、針織衫那層，並排 2 個',
              price: '約 NT$1,298（2026/10 MUJI）',
              cost: 1298,
              url: 'https://shop.muji.tw/SalePage/Index/9084000',
              source: 'MUJI',
            },
            {
              name: '無印良品 聚酯纖維麻收納箱 長方形 中 37 × 26 × 26 × 3',
              rec: true,
              detail: '圍巾、手套、毛帽；轉 26 寬一層放 3 個',
              price: '約 NT$229／個 × 3 = NT$687（2026/10 MUJI）',
              cost: 687,
              url: 'https://shop.muji.tw/SalePage/Index/8920884',
              source: 'MUJI',
            },
            {
              name: 'IKEA SKUBB 分格收納盒 44 × 34 × 11（白）',
              rec: true,
              detail: '領帶、腰帶、絲巾捲起來分格放',
              price: '約 NT$199（2026/10 IKEA）',
              cost: 199,
              url: 'https://www.ikea.com.tw/zh/products/boxes-and-organisers/organisers/skubb-art-90185594',
              source: 'IKEA',
            },
            {
              name: 'IKEA PÄRKLA 收納盒 55 × 49 × 30 × 2',
              rec: true,
              detail: '最上層冬天厚衣物；半透明、不用時可以折平，兩個疊 60 高',
              price: '約 NT$99／個 × 2 = NT$198（2026/10 IKEA）',
              cost: 198,
              url: 'https://www.ikea.com.tw/zh/products/clothes-and-shoe-organisers-and-accessories/clothes-and-shoes-organisers/parkla-art-80601106',
              source: 'IKEA',
            },
            {
              name: 'IKEA SPANTAD 真空密封收納袋 2 件裝',
              rec: true,
              detail: '70 × 100＋120 × 100；客用寢具、冬被',
              price: '約 NT$179（2026/10 IKEA）',
              cost: 179,
              url: 'https://www.ikea.com.tw/zh/products/clothes-and-shoe-organisers-and-accessories/clothes-and-shoes-organisers/spantad-art-10427568',
              source: 'IKEA',
            },
            {
              name: 'NITORI 防滑衣架 LAMY 仕女 5 入 × 4＋男士 5 入 × 4',
              rec: true,
              detail: '細鋼防滑衣架，比一般衣架省寬度；仕女 38 寬、男士 45 寬，共 40 支',
              price: '約 NT$79 × 4＋NT$89 × 4 = NT$672（2026/10 NITORI）',
              cost: 672,
              url: 'https://www.nitori-net.tw/product/8470512s',
              source: 'NITORI',
            },
            {
              name: 'NITORI 衣物防塵套 大衣 5P',
              rec: true,
              detail: '60 × 130、前面透明後面不織布、防蟲加工；西裝、禮服、長大衣',
              price: '約 NT$259（2026/10 NITORI）',
              cost: 259,
              url: 'https://www.nitori-net.tw/product/8491118s',
              source: 'NITORI',
            },
            {
              name: '天馬 Fits 35 寬組合式單層抽屜箱 高 20／3 入（備選）',
              detail: '35 × 50 × 20，兩個疊 40 高；深度剛好 50 沒有餘裕',
              price: '約 NT$2,033（2026/10 天馬官網特價）',
              url: 'https://www.tenma.tw/product/product&product_id=345',
              source: '天馬',
            },
            {
              name: 'MAWA 止滑無痕衣架 40 cm 白 10 入（備選）',
              detail: '德國 MAWA，最薄最穩，但貴很多',
              price: '約 NT$1,390／10 入（2026/10 PChome）',
              url: 'https://24h.pchome.com.tw/prod/DECI36-B900AXSIK',
              source: 'PChome',
            },
          ],
          notes: [
            '無印滿 NT$2,000 免運；NITORI 未滿 NT$2,000 運費 NT$120 或門市取貨',
            '每層 80 寬放 2 個無印盒（68）會剩約 12，剛好當手指和通風的空間',
          ],
        },
      },
    ],
  },
  mward: {
    summary: '45 cm 淺衣櫃，衣架無法橫掛，改用前後伸縮衣桿＋窄門。',
    material: [
      '18 mm 桶身、8 mm 背板；300 高同樣分上下兩桶疊裝',
      '對開窄門約 34 寬 × 228 高，每片 4 個鉸鏈；窄高門容易翹，可以問廠商有沒有門片校正器',
      '上櫃（228～300）每欄一扇單開門（約 66 寬 × 72 高、2～3 個鉸鏈），左右兩扇把手都在中間',
      '伸縮衣桿鎖在層板下方，每欄裝 1 支（衣服寬約 45～50）',
    ],
    notes: [
      '分工：主臥放夏天衣物（台灣一年大半都穿）、運動服、睡衣、內衣襪子、每天用的配件；冬天衣物、正式服裝、長裙長洋裝、配件、行李箱放次臥鋼管衣櫃',
      '兩邊固定不對調：天冷時到次臥拿冬天衣物就好；主臥上櫃放夏被、涼被，冬被收在次臥最上層',
      '右欄是洗澡前一站拿齊：內衣褲抽屜（最下面）正上方那層放毛巾、浴巾，再上面睡衣；毛巾要完全乾了再收，衣櫃才不會悶出霉味',
      '每天拿的東西都在 50～180 公分之間，154 公分的人也拿得到；拉桿頂端約 176',
      '外抽屜放摺疊衣物，深約 40 cm 用全展緩衝滑軌',
      '確認門片打開後，伸縮桿拉出來不會卡到門片或鉸鏈',
    ],
  },
  shoe: {
    summary:
      '落地鞋櫃（高 128、不做踢腳）：最下面一格開放放室內拖鞋；上面全部在門片裡，拖鞋上面那層放常穿的鞋，可調層板，頂層抽屜放鑰匙、口罩。',
    material: [
      '桶身指定 P3 防潮板；層板打 32 mm 排孔可調，每層 15～18 cm（短靴 25～30）',
      '無把手：門片在開門那側（不是鉸鏈那側）做 45° 斜切取手，抽屜上緣斜切，手指從斜邊勾開；斜切加工費依廠商報價',
      '對開門約 2 × 40 cm；門片下緣留縫，或背板上下開通風孔形成對流',
      '頂層抽屜深 10～15 cm 放鑰匙、口罩，用緩衝滑軌',
    ],
    notes: [
      '內寬約 76 cm，每層約 3 雙；門片內 5 層約 15 雙，最下面開放格放 2～3 雙拖鞋',
      '不做踢腳：開放格底板直接貼地，拖鞋用腳就能推進去；底板用耐刮耐水的面材，濕鞋先在開放格晾乾再收進門片裡',
      '旁邊預留插座，可以放除濕棒或小風扇',
    ],
  },
  coffeebar: {
    summary:
      '咖啡櫃 120 寬：檯面由左到右放豆罐 ×4、磨豆機、義式咖啡機、奶泡機，右邊留出杯區；下面左欄是茶包抽屜、咖啡配件抽屜和零食門片櫃，右欄上層玻璃門馬克杯展示（單排約 12 個、前後兩排約 24 個），下層深抽屜直立放保溫瓶。',
    material: [
      '檯面建議人造石、石英石或 HPL 美耐板，不用一般系統板檯面（封邊怕水）',
      '桶身指定 P3 防潮板；抽屜三節全展緩衝，膠囊、咖啡豆放淺抽',
      '無把手：門片在開門那側（不是鉸鏈那側）做 45° 斜切取手，抽屜上緣斜切，手指從斜邊勾開；斜切加工費依廠商報價',
      '玻璃門的橡木框也在開門那側斜切；最上面的抽屜在檯面正下方，檯面不要往外凸超過 1 cm，手指才勾得到',
      '咖啡機約 1,200～1,500 W，建議專用迴路插座（請水電確認）',
    ],
    notes: [
      '櫃深 40 cm：確認咖啡機深度，加上背後 5～10 cm 散熱與插頭空間',
      '玻璃門：木框（淺橡木）＋5 mm 強化清玻璃或長虹玻璃，玻璃門專用緩衝鉸鏈；地震時要有門扣',
      '馬克杯放上層玻璃門那一格（淨高約 44，3 個一疊約 27 高），底板用 25 mm 板，放 20～30 個陶瓷杯不下彎',
      '保溫瓶抽屜：淨高約 31，500 ml 保溫瓶（高 21～25）直立放剛好；750 ml 以上的高瓶要躺著放；抽屜裡放分隔板或瓶架，拉開時不會倒；用承重 30 kg 以上的全展緩衝滑軌',
      '最上面的茶包抽屜淨高約 12，放高 8.6 的收納盒剛好；下面抽屜放填壓器、布粉器、清潔錠和豆子存貨',
    ],
    related: [
      {
        title: '茶包收納盒（左邊最上層抽屜）',
        info: {
          summary: '抽屜內約 48 × 33 × 12：用高度 10 公分以下的分隔盒，茶包直立排，一眼看到口味。',
          specs: ['盒高 ≤ 10', '無印 1/2 橫型：橫排 4 個 × 前後 2 排，最多 8 個'],
          picks: [
            {
              name: '無印良品 PP 化妝盒 1/2 橫型・附隔板 × 4',
              rec: true,
              detail: '15 × 11 × 8.6；茶包直立剛好；先買 4 個，放滿再加到 8 個',
              price: '約 NT$69／個，4 個 NT$276（2026/09 momo）',
              cost: 276,
              url: 'https://www.momoshop.com.tw/product/13219674',
              source: 'momo',
            },
            {
              name: 'IKEA UPPDATERA 收納盒 白色 × 2',
              detail: '24 × 17 × 10，前面較低好拿；兩個轉 17 寬擺放約 34 × 24',
              price: '約 NT$59／個，2 個 NT$118（2026/09 IKEA）',
              cost: 118,
              url: 'https://www.ikea.com.tw/zh/products/boxes-and-organisers/boxes-and-baskets/uppdatera-art-00546468',
              source: 'IKEA',
            },
          ],
        },
      },
      {
        title: '咖啡角插座與迴路',
        info: {
          summary: '檯面上方兩組雙連插座：左邊接 110V 20A 專用迴路（磨豆機＋咖啡機），右邊接一般迴路（奶泡機＋備用），同時開也不會跳電。',
          specs: ['插座離地約 108（檯面上 18）', '左：20A 專用迴路；右：客廳一般迴路', '不要用延長線'],
          picks: [
            {
              name: '新增 110V 20A 專用迴路＋雙插座（估價）',
              rec: true,
              detail: '從電箱拉一條新迴路到左邊插座；雙北行情每迴路約 NT$2,500～3,500，裝潢前做比較便宜',
              price: '約 NT$3,000（2026/09 第一水電、100室內設計價目推算）',
              cost: 3000,
              url: 'https://first111.com.tw/plumbingprice/',
              source: '第一水電',
            },
            {
              name: '一般迴路加一組雙插座（估價）',
              rec: true,
              detail: '從附近既有迴路接出右邊插座；若這面牆原本就有插座，這項可以不用',
              price: '約 NT$2,500（2026/09 行情約 NT$2,000～3,000）',
              cost: 2500,
              url: 'https://www.100.com.tw/article/8596',
              source: '100室內設計',
            },
          ],
          notes: ['同時開的最大用電約 1,900～2,200 W；一般 15A 插座上限約 1,650 W，所以要分兩個迴路'],
        },
      },
    ],
  },
  tvstand: {
    summary:
      '實木美腿電視櫃（錐形腳高 18、櫃體高 35）：中間一格開放放網路設備、遊戲機（在電視正下方，好走線、好散熱），左右兩邊門片櫃；落地不用鎖牆，底下可以掃地。',
    material: [
      '美腿：橡木錐形腳 6 支（中間多一對，180 長不下垂），櫃腳和底板用鐵片或螺牙座鎖固；地面不平時選可微調高度的腳',
      '網路設備格背板開散熱孔和走線孔，或這格不裝背板',
      '無把手：門片在開門那側（不是鉸鏈那側）做 45° 斜切取手，抽屜上緣斜切，手指從斜邊勾開；斜切加工費依廠商報價',
      '180 cm 長：頂底板用 25 mm，或分兩桶，避免中間下垂；抽屜用全展緩衝',
    ],
    notes: [
      '網路設備格預留插座與網路孔，前面不裝門或改用格柵門',
      '懸空離地至少 12～15 cm（依掃地機高度）；櫃腳方案用可調腳＋踢腳板，較便宜',
    ],
  },
  bshelf1: {
    summary:
      '書房矮櫃上方衣櫃那段掛兩條浮動層板（隱藏托架，看不到支架）：下面那條放常看的書和植物，上面那條放相框、展示品；視訊開會時就是背景。',
    specs: [
      '190 × 26 × 5，白色，兩條上緣離地約 125、165（中間淨空約 35，一般書放得下）',
      '從衣櫃那端做到印表機那段前面停，房門口的電燈開關旁邊留空',
      '每條最多 15 kg：書不要放太滿，重的書放下面那條',
    ],
    picks: [
      {
        name: 'IKEA LACK 層板/層架 白色 190 × 26（302.821.83）× 2',
        rec: true,
        detail: '190 × 26 × 5；隱藏式懸掛支撐架；最大承重 15 kg；上牆螺絲另購',
        price: '約 NT$890／條（2026/10 IKEA）',
        url: 'https://www.ikea.com.tw/zh/products/storage/wall-shelves/lack-art-30282183',
        source: 'IKEA',
      },
      {
        name: 'IKEA LACK 層板/層架 染白橡木紋 110 × 26 × 2',
        detail: '110 × 26 × 5；顏色比較接近矮櫃的木色；最大承重 10 kg；只有 110 長，層板會比較短',
        price: '約 NT$599／條（2026/10 IKEA）',
        url: 'https://www.ikea.com.tw/zh/products/sideboards/wall-shelves/lack-art-50418213',
        source: 'IKEA',
      },
    ],
    notes: [
      '牆是輕隔間：趁隔間施工時在石膏板後面加夾板補強（離地約 110～180、寬 200），托架用木螺絲鎖進夾板',
      '坐在升降桌前時層板在背後約 1 公尺，起身不會撞到頭',
    ],
  },
  pegboard2: {
    summary:
      '書房矮櫃印表機那段上方掛一塊 SKÅDIS 洞洞板：小層板放行動電源和充電器，掛勾掛耳機，下面小籃子收線材；寬 36，不會擋到房門口的電燈開關。',
    specs: ['36 × 56（直放），離地約 135～191', '開關在離地約 120、靠門那邊：洞洞板下緣和側邊都留空，掛的東西不要垂到開關前面'],
    picks: [
      {
        name: 'IKEA SKÅDIS 收納壁板 木質 36 × 56',
        rec: true,
        detail: '纖維板、壓克力亮光漆；附牆面安裝桿，上牆螺絲另購；掛勾、層板、小籃子是 SKÅDIS 配件另外買',
        price: '約 NT$399（2026/10 IKEA，原價 NT$499）',
        url: 'https://www.ikea.com.tw/zh/products/wall-organisers/boards-and-wall-organisers/skadis-art-00347176',
        source: 'IKEA',
      },
    ],
    notes: ['和浮動層板一起加夾板補強'],
  },
  scab: {
    summary:
      '書房長矮櫃：放文件、線材和印表機；最右邊（靠衣櫃那端）做掃地機器人的家：沒有底板，一片長門蓋到離地 12，看不到基座，機器人從門下進出。',
    material: [
      '檯面 25 mm 系統板或人造石，250 cm 一片不接縫',
      '文件抽屜選承重 40 kg 以上的三節全展滑軌；放 A4 吊掛夾先確認夾子規格',
      '無把手：門片在開門那側（不是鉸鏈那側）做 45° 斜切取手，抽屜上緣斜切，手指從斜邊勾開；斜切加工費依廠商報價',
      '印表機格不裝門，背板開散熱孔與線孔；印表機較重可以加重型拉板',
    ],
    notes: [
      '櫃身分 2 桶（例如 125＋125）比較好搬運安裝，檯面再用一片蓋過',
      '靠輕隔間：頂部用 L 片鎖進骨料或預埋的夾板，防止往前傾',
      '次臥電燈開關在房門口（門把那側、矮櫃靠門那一端正上方、離地約 120）：矮櫃維持 90 高，不要加高擋住開關',
      '文件門片櫃層板可調；A4 檔案夾需深 32～35 cm',
      '掃地機器人的家：寬 58（基座兩側各留約 13）、離地淨高約 56（基座 38.5，水箱往上拿要約 16）；那一格不做底板，整座不做踢腳，櫃深 45 機器人停好不會凸出',
      '機器人格背板離地 20～30 預留插座，基座後面留 2～3 cm 走線和排氣；兩側板用霧面（亮面會干擾感測）',
      '木地板：基座和斜坡下面墊一片薄的硬質防水墊（不要軟墊，基座會不穩），拖布回洗時滴水才不會泡到地板',
      '機器人格的門片從上面一路蓋到離地 12（機器人高約 10）：關著門看不到基座，機器人從門下開出去；開門就能倒集塵袋、從上面拿水箱',
      '基座烘乾拖布會吹出濕熱的風：門片上緣留縫或背板上方開通風孔，門下的 12 公分也不要擋住',
      '裝好後先試幾次回充：門下緣要切齊櫃體、不要往下凸，基座的回充訊號才收得到',
      '次臥門要開著，機器人才出得去打掃客廳；前方至少留 80 公分淨空',
    ],
    related: [
      {
        title: '掃地機器人（放矮櫃最右邊的家）',
        info: {
          summary:
            '基座要矮、水箱從上面直接拿、集塵袋從正面拿，才放得進 56 公分高的格子：ECOVACS DEEBOT mini 系列是查到唯一符合的；一般全能基座 45～52 高、要上掀蓋，石頭官方要求上方淨空 90。',
          specs: ['基座 寬 ≤ 40、深 ≤ 42、高 ≤ 40', '水箱從基座頂上直接拿起（不能是上掀蓋）', '不用接水（清水、污水箱）'],
          picks: [
            {
              name: 'ECOVACS 科沃斯 DEEBOT mini 2',
              rec: true,
              detail:
                '機器人 Ø28.6 × 10；基座 32 × 40 × 38.5（含斜坡）；10,000 Pa、雙旋轉拖布、自動集塵、洗拖布、45°C 烘乾；水箱從上面拿、集塵袋從前門拿',
              price: '約 NT$10,799（2026/09 PChome；官網 NT$11,999）',
              url: 'https://24h.pchome.com.tw/prod/DMBL0L-A900K0EOR',
              source: 'PChome',
            },
            {
              name: 'ECOVACS 科沃斯 DEEBOT mini（預算款）',
              detail: '同一個基座 32 × 40 × 38.5；9,000 Pa、45°C 烘乾；電池 3,200 mAh',
              price: '約 NT$7,199（2026/09 PChome；官網 NT$9,999）',
              url: 'https://24h.pchome.com.tw/prod/DMBL0L-A900JD127',
              source: 'PChome',
            },
            {
              name: '小米 Xiaomi 掃拖機器人 H40（只自動集塵）',
              detail:
                '機器人 Ø34 × 9.7；基座 34 × 16 × 32.6；10,000 Pa、4 L 集塵袋、拖地只是拖布；機器人停在基座前面，總深約 50，會凸出櫃子',
              price: '約 NT$6,459（2026/09 PChome）',
              url: 'https://24h.pchome.com.tw/prod/DMBL53-A900J1M46',
              source: 'PChome',
            },
            {
              name: 'Roborock 石頭 Qrevo L（放不進這個格子）',
              detail: '基座 34 × 48.7 × 51.9，官方要求上方淨空 90：只能放地上，列出來比較',
              price: '約 NT$9,999（2026/09 PChome）',
              url: 'https://24h.pchome.com.tw/prod/DMBT0G-A900J1M89',
              source: 'PChome',
            },
          ],
          notes: ['DEEBOT mini 的水箱容量官方沒寫，比 4 L 大水箱小，加水會比較頻繁', '買之前到門市帶捲尺量水箱往上拿需要的高度'],
        },
      },
    ],
  },
  dining: {
    summary: '收納段用系統櫃或廚具桶身，桌腳、牙板用鐵件或木作；檯面用北美白橡木實木（無印風），由木作做一片連續。',
    material: [
      '檯面用北美白橡木實木（住戶決定）：3 cm 直拼板一片做完 170 × 90，長條紋路乾淨；表面上木蠟油或護木油',
      '實木怕水漬和熱：電子鍋、熱鍋底下墊隔熱墊，水擦乾；每半年到一年補一次木蠟油',
      '靠窗的平面插座要在檯面開孔，開孔邊緣也要上油封好，避免吸水',
      '備選：人造石（可無縫、好保養）或石英石（最耐刮耐熱）',
    ],
    notes: [
      '北美白橡木 4 × 8 尺（122 × 244）一片就能做完 170 × 90，不用接縫；指拼板較便宜但看得到鋸齒接縫',
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
    specs: ['椅寬 ≤ 45、無扶手', '座高約 45（桌高 76）', '椅深 ≤ 45 兩側才能對收（桌深 90）', '兩張面對面、一側一張，餐桌段淨長約 66'],
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
    summary:
      '收在中島走道側的抽拉開放層板上（格子淨寬 46.8、淨深 29.4、淨高 34），用的時候拉出約 20 cm 讓蒸氣散掉；兩人用選大同 6 人份（寬 30.8 × 深 26）最剛好。',
    specs: [
      '層板格子淨寬 46.8 × 淨深 29.4 × 淨高 34：電鍋含把手高度要低於 32',
      '110V、約 600W；格子背板預留插座，電線長度要夠抽拉',
      '用的時候把層板拉出來，蒸氣口要在檯面外面',
    ],
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
    ],
    search: ['大同電鍋 6人份 TAC-06L', '大同電鍋 10人份 TAC-10L', '象印 NS-LBF05'],
    notes: [
      '大同電鍋寬度含兩側把手；6 人份和 10 人份價錢幾乎一樣，差別只在體積',
      '電鍋和氣炸鍋同時開約 1,800～2,100W，已經超過一組 15A 插座（見中島的檯面插座說明）',
    ],
  },
  fryer: {
    summary:
      '收在中島走道側的抽拉開放層板上，因為走道側淨深只有 29.4，氣炸鍋要橫放（炸籃朝餐桌那頭）；國際牌 NF-HC100 橫放後 32.5 × 24、高 30.7，放得進。',
    specs: [
      '層板格子淨寬 46.8 × 淨深 29.4 × 淨高 34：橫放後深度（機身寬）要 ≤ 28、高度 ≤ 32',
      '容量 4～6 L、110V、約 1,200～1,500W；格子背板預留插座',
      '背後排熱口朝側板時要留 10 cm，使用時把層板拉出來',
    ],
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
    specs: [
      '鍋具（兩個人）建議 4 個＋1 個選配：炒鍋 30 cm（附蓋）、平底鍋 26 cm、雪平鍋 18 cm、雙耳湯鍋 22 cm（附蓋），選配鑄鐵燉鍋 22 cm；電鍋、電子鍋、氣炸鍋另外收在中島',
      '爐台下櫃（寬約 83，瓦斯爐正下方）：每天用的都放這裡，站在爐前彎腰就拿到。左半用直立鍋具架立放炒鍋、平底鍋（不疊、不刮傷），右半放湯鍋、雪平鍋套在湯鍋裡',
      '鍋蓋、烤盤：中島廚房側最下面的抽屜（就在爐台正對面，轉身就拿到），抽屜裡放直立鍋蓋架',
      '不常用又重的（鑄鐵鍋、火鍋鍋、大湯鍋）：中島走道側右下門片櫃，重的放低處',
      '吊櫃（150～230）只放輕的、不常用的：蒸籠、備用鍋、便當盒',
      '水槽下櫃：左門是分類垃圾桶，右半放清潔劑、菜瓜布備品（不要放鍋，水管會滴水）',
    ],
    notes: [
      '不沾鍋塗層、鑄鐵鍋、木柄鍋不要進洗碗機；不鏽鋼湯鍋、雪平鍋可以',
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
    summary:
      '無印風首選北美白橡木實木圓几（MR. LIVING Ø70 × 高 42，新莊可以看實品）；要下層收納選 IKEA BORGEBY；預算版選 Ø60 白＋木 Linsy。高 40～45 最配 44 公分的座高。',
    specs: [
      '直徑 60～70：Ø70 放在離沙發約 38、離電視櫃約 50',
      '高度 40～45，跟沙發座高一樣或略低，坐著放杯子最順手',
      '白橡木／白蠟木實木或實木貼皮、淺原木色霧面最接近無印；避開胡桃木、岩板、金屬腳',
      '3～4 支外張腳或十字腳，承重 20 kg 以上',
    ],
    picks: [
      {
        name: 'MR. LIVING White & Wood 實木圓茶几（無印風首選）',
        detail: 'Ø70 × 高 42；北美白橡木實木桌面＋桌腳，圓角、外張腳加拉檔，承重 100 kg；沒有下層',
        price: '約 NT$7,990（2026/09 MR. LIVING 官網）',
        url: 'https://www.mrliving.com.tw/woodwood-coffee-table-1.html',
        source: 'MR. LIVING 官網',
        rec: true,
      },
      {
        name: '源氏木語 YW 方回橡木實木圓茶几 0.7M 原木色（Y01JJ0009）',
        detail: 'Ø70 × 高 42；橡木實木、十字桌腳、9 kg；沒有下層，要自己組裝',
        price: '約 NT$5,480（2026/09 hoi! 好好生活，原價 6,980）',
        url: 'https://www.hoihome.tw/SalePage/Index/11426368',
        source: 'hoi! 好好生活',
      },
      {
        name: 'IKEA BORGEBY 咖啡桌 樺木 70 公分',
        detail: 'Ø70 × 高 42；樺木實木貼皮合板；有下層開放層架（總承重 20 kg）',
        price: '約 NT$3,499（2026/09 IKEA）',
        url: 'https://www.ikea.com.tw/zh/products/armchairs-footstool-and-sofa-tables/sofa-tables/borgeby-art-70449402',
        source: 'IKEA',
      },
      {
        name: 'Linsy 林氏木業 北歐簡約圓茶几 0.6M 白色（LS755J3）',
        detail: 'Ø60 × 高 45；白色板材桌面＋橡膠木腳，白配木很無印；較輕、不是實木面',
        price: '約 NT$1,480（2026/09 hoi! 好好生活）',
        url: 'https://www.hoihome.tw/SalePage/Index/10576270',
        source: 'hoi! 好好生活',
      },
    ],
    search: ['白橡木 實木 圓茶几', 'IKEA BORGEBY 咖啡桌', '源氏木語 圓茶几 橡木'],
    notes: [
      '可以先去看：MR. LIVING 新莊旗艦店（新莊區新北大道四段 135 號 2～3 樓，11:00～20:00，02-8521-1613）、IKEA 新莊店（BORGEBY 有現貨）',
      '台灣無印良品官網目前沒有圓形茶几，日本 MUJI 有 Ø60 白蠟木突板圓矮桌，想要可以到門市問',
      'hoi! 的源氏木語、Linsy 是網購、要自己組裝，組好後不能退，下單前先量好尺寸',
    ],
  },
  tv: {
    summary: '180 cm 看 55 吋 4K 剛好；白天光線強選 Mini LED，晚上看片選 OLED。',
    specs: [
      '55 吋機身寬約 123，掛在 180 cm 電視櫃正上方，兩側各留約 28',
      '壁掛：確認電視背面的 VESA 孔距和壁掛架相容，腳座用不到',
      '2025～2026 年款，HDMI 2.1、120Hz 以上',
    ],
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
    related: [
      {
        title: '壁掛架＋安裝',
        info: {
          summary: '55 吋固定式壁掛架連工帶料約 NT$2,000；想要可以拉出、轉角度的單臂活動式約 NT$2,500。',
          specs: [
            '55 吋 VESA 孔距多為 300 × 200（LG C5 為 300 × 200），壁掛架要對應',
            '畫面下緣離地約 70、中心約 106，坐在沙發上平視',
            '電視後方離地約 110 預留插座與 HDMI 出線，線材走牆內或線槽',
          ],
          picks: [
            {
              name: '44～55 吋固定式壁掛架（連工帶料）',
              detail: '最薄、貼牆約 2～3 cm；角度固定',
              price: '約 NT$2,000（2026/09 PRO360 行情）',
              cost: 2000,
              rec: true,
              url: 'https://www.pro360.com.tw/price/tv_wall_mount_installation',
              source: 'PRO360 行情',
            },
            {
              name: '55 吋以下單臂活動式壁掛架（連工帶料）',
              detail: '可以拉出、左右轉、上下仰角；離牆較厚',
              price: '約 NT$2,500（2026/09 找師傅行情）',
              cost: 2500,
              url: 'https://www.945.com.tw/life/price?id=10',
              source: '找師傅行情',
            },
          ],
          notes: [
            '電視背後這面牆的另一側是半套衛浴，洗臉盆就在牆後同一段高度，牆裡很可能有給水管和排水管：鑽孔前先跟建商要水電配管圖，或請師傅用探測器確認，避開管線',
            '先確認牆體是磚牆／RC 還是輕隔間；輕隔間要鎖在骨料上或預埋夾板補強，師傅會另外加價',
            '買電視時很多通路有「壁掛安裝」加購，價格差不多，可以一起問',
            '插座和 HDMI 的預埋線路要在泥作、油漆前請水電做好',
          ],
        },
      },
    ],
  },
  vacuum: {
    summary: '能完整放進 30 × 25 的是日系輕量機；自動集塵座的深度多在 28～31。',
    specs: [
      '收在吸塵器櫃裡：座子底面 ≤ 30 × 30、主機高度 ≤ 124',
      '主機掛上後總高 ≤ 128（離地 130 起是洞洞板）',
      '旁邊要有插座，建議裝在離地 20～40',
    ],
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
    summary: '鞋櫃上方（右邊是吸塵器高櫃）掛 IKEA SKÅDIS 76 × 56 一片橫放，離地 150～206，鑰匙、口罩、購物袋掛在出門順手的高度。',
    specs: [
      '可用範圍 80 W × 100 H（鞋櫃上方，離地 130～230）',
      '常用的鑰匙掛在離地 150～170 最順手',
      '要掛包包就要鎖進 RC 牆，輕隔間要加角材',
    ],
    picks: [
      {
        name: 'IKEA SKÅDIS 收納壁板 76 × 56（黑）',
        rec: true,
        detail: '纖維板，可橫放、直放或拼接；附上牆桿，螺絲另購；橫放一片 76 × 56',
        price: '約 NT$599／片（2026/09 IKEA）',
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
      '鐵製洞洞板承重較高，可以搜尋接近 76 × 56 的尺寸',
      '板子下緣和鞋櫃頂留 2～3 cm，檯面比較好擦',
    ],
  },
  espresso: {
    summary:
      '咖啡櫃檯面由左到右照沖煮順序：豆罐 ×4 → 磨豆機 → 義式咖啡機 → 奶泡機 → 出杯區（下面就是馬克杯櫃）；咖啡機建議 Dedica 窄身半自動機，另外搭磨豆機和奶泡機。',
    specs: ['機身寬 ≤ 25、深 ≤ 35（檯面深 40，後面留 2～3 cm 插頭空間）', '110V、約 1,300 W：和磨豆機一起接左邊的 20A 專用迴路插座'],
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
    notes: [
      'Nespresso Vertuo 系列機身多半深超過 40，這個檯面放不下',
      '咖啡機 1,300 W＋奶泡機約 450 W＋磨豆機 150～300 W 同時開約 1,900～2,200 W，超過一般 15A 插座（約 1,650 W）：咖啡機和磨豆機接專用迴路，奶泡機接另一個迴路，不要用延長線',
      '檯面上方沒有吊櫃，水箱從上面拿出來加水沒問題',
    ],
  },
  'door-master': {
    summary:
      '房門做木作隱形門：往房間裡開，客廳那面和牆齊平、跟牆一起批土油漆、不裝把手，從客廳看就是一面牆；推一下就開，房內那面才有把手；隱藏鉸鏈，門下裝自動落地氣密條隔音。',
    specs: [
      '開口 80 × 210，門片厚 4 cm 以上',
      '3D 隱藏鉸鏈 × 3（TECTUS TE240 約 NT$4,300／個、LAMP HES3D-120 約 NT$3,200／個）',
      '客廳那面不裝把手：用磁吸靜音門扣（九宏 RUB370 這類，約 NT$2,363～2,888），從客廳推一下就開；房內那面裝細長平把手拉開',
      '門片要有一點重量和緩衝：裝閉門器或緩衝鉸鏈，推開後不會甩到牆，關門時自己吸回去',
      '門下自動落地氣密條（約 NT$590～690），關門時才降下來擋風擋聲',
    ],
    picks: [
      {
        name: '木作隱形門（和牆同色）＋隱藏鉸鏈 × 3＋磁吸鎖＋氣密條（估價）',
        rec: true,
        detail: '含門框、門片、五金、安裝和油漆；不含牆面不平要做的覆牆',
        price: '約 NT$20,000～35,000（2026/09 行情推算：木作隱形門約 2 萬起，鉸鏈、鎖另計）',
        category: '系統櫃・訂製',
        url: 'https://www.945.com.tw/articles/detail/1420',
        source: '945 找師傅',
      },
    ],
    vendors: [
      {
        name: '萬安木門（中和）',
        detail: '服務範圍含土城；一般木門、浴室門，隱形門要問',
        phone: '02-2240-1473',
        url: 'https://www.wan-an.com.tw/about-us.html',
      },
      { name: '錦宥興業（新店）', detail: '鋁框門，服務新北；可以問鋁框隱形門', url: 'http://www.jyl-co.com.tw/' },
      { name: '九宏五金（台北）', detail: '隱藏鉸鏈、磁吸鎖、浴廁鎖現貨', phone: '02-2375-3797', url: 'https://www.j-home.com.tw/' },
      { name: '美德亞（TECTUS 代理）', detail: 'SIMONSWERK TECTUS 隱藏鉸鏈', phone: '02-2515-7057', url: 'https://www.meideya.com.tw/' },
    ],
    notes: [
      '施工順序：輕隔間做到門口時先補強立柱（鉸鏈那側加實木或鋼骨），隱形門框在封板、批土、油漆之前裝好，門片跟牆一起批土油漆',
      '只有推的那面和牆齊平；從房間裡面看，門會比牆面凹進去（牆厚減門厚）',
      '門片厚 4 cm 以上才能用 TECTUS 這類 3D 隱藏鉸鏈；210 高裝 3 個，門太重裝 4 個',
      '進口門框、鉸鏈常要預訂，抓 2～6 週；現場請 2～3 家報價（多半是木作師傅配合隔間師傅做）',
      '房間門不用留門縫，改用落地氣密條，冷氣比較不會漏',
    ],
  },
  'door-bath': {
    summary:
      '全套浴室有淋浴，門要防水：鋁框隱形門（框藏在牆裡）配防水門片（鋁蜂巢或 PVC 發泡板），客廳那面和牆齊平同色、不裝把手，推一下就開；浴室裡面才有把手和鎖；門下留 1.5 cm 讓抽風機進氣。',
    specs: [
      '開口 75 × 210，往浴室裡開，客廳那面齊平',
      '鋁框（不怕潮）＋鋁蜂巢／PVC 發泡板門片，兩面都要封好',
      '客廳那面不裝把手：磁吸門扣推開；浴室裡面裝把手和單邊浴廁鎖（裡面轉扭上鎖），客廳那面只留一個很小的緊急開鎖孔（九宏 LS-S6-1 約 NT$504、Castle TWS-002 約 NT$1,155 這類，下單前確認能做單邊把手）',
      '門下留 1～2 cm（不裝氣密條），抽風機才有空氣進來',
    ],
    picks: [
      {
        name: '鋁框隱形門＋防水門片＋隱藏鉸鏈 × 3＋浴廁鎖（估價）',
        rec: true,
        detail: '台灣鋁框隱形門的完整價格沒查到，先照木作隱形門行情抓；國外 ECLISSE 門框本身約 £385、交期 4～6 週',
        price: '約 NT$20,000～35,000（2026/09 推估，鋁框價格未確認）',
        category: '系統櫃・訂製',
        url: 'https://www.eclisse.co.uk/syntesis-flush-hinged-single/',
        source: 'ECLISSE',
      },
      {
        name: '木作隱形門（雙面美耐板或烤漆、四邊封邊）（估價）',
        detail: '找不到鋁框廠商時的做法；乾濕分離要做好，門片下緣要封',
        price: '約 NT$20,000～35,000（2026/09 行情推算）',
        category: '系統櫃・訂製',
        url: 'https://www.100.com.tw/article/10718',
        source: '100室內設計',
      },
    ],
    vendors: [
      {
        name: '萬安木門（中和）',
        detail: '服務範圍含土城；一般木門、浴室門，隱形門要問',
        phone: '02-2240-1473',
        url: 'https://www.wan-an.com.tw/about-us.html',
      },
      { name: '錦宥興業（新店）', detail: '鋁框門，服務新北；可以問鋁框隱形門', url: 'http://www.jyl-co.com.tw/' },
      { name: '九宏五金（台北）', detail: '隱藏鉸鏈、磁吸鎖、浴廁鎖現貨', phone: '02-2375-3797', url: 'https://www.j-home.com.tw/' },
      { name: '美德亞（TECTUS 代理）', detail: 'SIMONSWERK TECTUS 隱藏鉸鏈', phone: '02-2515-7057', url: 'https://www.meideya.com.tw/' },
    ],
    notes: [
      '施工順序：輕隔間做到門口時先補強立柱（鉸鏈那側加實木或鋼骨），隱形門框在封板、批土、油漆之前裝好，門片跟牆一起批土油漆',
      '只有推的那面和牆齊平；從房間裡面看，門會比牆面凹進去（牆厚減門厚）',
      '門片厚 4 cm 以上才能用 TECTUS 這類 3D 隱藏鉸鏈；210 高裝 3 個，門太重裝 4 個',
      '進口門框、鉸鏈常要預訂，抓 2～6 週；現場請 2～3 家報價（多半是木作師傅配合隔間師傅做）',
      '浴室牆可能是磚牆或 RC：鋁框要在泥作粉光時一起埋進去',
    ],
  },
  'door-bed2': {
    summary: '建商附：用建商原本的平開房門，不另外買，不列預算。',
    specs: ['開口 80 × 210，往次臥裡開，鉸鏈在靠陽台那側'],
    notes: ['想隔音可以自己加門下自動落地氣密條（約 NT$590～690）'],
  },
  'door-wc': {
    summary: '建商附：用建商原本的穿牆拉門，門片滑進衣櫃後面的牆裡，不另外買，不列預算。',
    specs: ['開口 80 × 210，門片往衣櫃那側滑進牆裡'],
    notes: ['門袋在衣櫃背後的牆裡：衣櫃背板不能鎖進門袋那段牆，請系統櫃廠商避開'],
  },
  hamper: {
    summary:
      '洗完澡的髒衣服、毛巾丟進主臥半套廁所的有蓋洗衣籃：放在拉門對面那面牆、偏洗臉盆那側，不擋馬桶和走道；內袋可以整袋提起來拿到陽台洗衣機。',
    specs: [
      '42 × 32 × 67、60 L（約 8 kg），兩個人 2～3 天的量',
      '放在拉門對面牆邊，前面走道還有約 61；上蓋後側鉸鏈往上掀，上方約 100 以內不要裝層板、毛巾桿',
      '廁所潮濕：選 PE 覆膜布面，濕毛巾先晾乾再丟，避免悶出味道',
    ],
    picks: [
      {
        name: 'ELPHECO 60L 單格洗衣籃 ELPH060BA（米白）',
        rec: true,
        detail: '42 × 32 × 67；纖維桿骨架＋細緻麻布覆 PE（防潑水）；掀蓋；內袋可拆、有提把；可折平',
        price: '約 NT$1,690（2026/10 ELPHECO 官網，原價 NT$1,890）',
        url: 'https://www.elpheco.com.tw/products/elph060ba',
        source: 'ELPHECO 官網',
      },
      {
        name: 'ELPHECO 40L 單格洗衣籃 ELPH040BA（米白）',
        detail: '40 × 22 × 67；同款比較薄，最不佔走道，但只裝 40 L（約 6 kg）',
        price: '約 NT$1,280（2026/10 ELPHECO 官網）',
        url: 'https://www.elpheco.com.tw/products/elph040ba',
        source: 'ELPHECO 官網',
      },
      {
        name: 'Joseph Joseph Tota 60L 分類洗衣籃（雙格）',
        detail: '39.5 × 39.5 × 71；兩格各 30 L，衣服、毛巾分開；兩個可拆袋；比較深，走道剩約 54',
        price: '約 NT$2,990（2026/10 momo，原價 NT$4,100）',
        url: 'https://www.momoshop.com.tw/product/14873098',
        source: 'momo',
      },
      {
        name: 'NITORI 洗衣籃 YT05 GY（最便宜）',
        detail: '33 × 35 × 63、30 L；鋁框尼龍網很透氣，但沒有蓋子；網購限定、約 28～30 個工作天',
        price: '約 NT$599（2026/10 NITORI）',
        url: 'https://www.nitori-net.tw/product/8501222s',
        source: 'NITORI',
      },
    ],
    notes: ['想把衣服、毛巾分開又不想換雙格款：籃子裡放一個洗衣網袋裝毛巾'],
  },
  mcab1: {
    summary: '全套衛浴改單門鏡櫃：昊鑫 KLS-DR55（55 × 15 × 80），置中在洗手台上方，鏡面比單門除霧款大；防水發泡板，左開右開都能訂。',
    specs: [
      '單開門、寬 55、深 15、高 80；離地約 110～190',
      '鉸鏈在靠牆那側（面對鏡子的左手邊）：門往牆那邊打開，不會擋到站在洗手台前的人',
      '沒有除霧：洗澡時開抽風機（或暖風機）、浴室門下留縫，鏡子比較不會起霧',
    ],
    picks: [
      {
        name: '昊鑫 KLS-DR55 單門鏡櫃',
        rec: true,
        detail: '55 × 15 × 80；防水發泡板櫃體、鋁框封邊鏡門；單門，可左開可右開；台灣製；雙北送貨，安裝另外報價',
        price: '約 NT$5,550（2026/10 昊鑫官網）',
        url: 'https://haosin.tw/product/kls-dr4555-%e4%ba%ae%e9%89%bb%e8%89%b2%e9%8b%81%e5%b0%81%e9%82%8a%e9%96%80%e7%89%87%e5%8f%b3%e5%a4%96%e9%96%8b%e9%8f%a1%e6%ab%834555cm/',
        source: '昊鑫衛浴',
      },
      {
        name: '和成 HCG LAG4066BF 單門除霧鏡櫃',
        detail: '40 × 16 × 66；單門、除霧（要 110V 電源，水電在鏡櫃後面預留出線）；鏡面比較小；和成 Homebox 基本安裝 NT$1,000',
        price: '約 NT$7,755＋安裝 NT$1,000（2026/10 和成建議價）',
        cost: 8755,
        url: 'https://www.hcg.com.tw/tw/product/detail/LAG4066BF',
        source: '和成官網',
      },
    ],
    notes: ['鎖在 RC 牆上；如果是輕隔間要先加強', '和成 60、80 公分的除霧鏡櫃都是雙門，所以單門除霧只有 40 公分這款'],
  },
  mcab2: {
    summary:
      '半套廁所的鏡櫃左右做滿到兩邊牆：中間一扇 50 寬單開鏡門（對齊洗臉盆，放保養品、備用牙刷），左右各一欄開放層板 3 層，放每天用的牙刷杯、洗手乳；廁所潮濕，開放格比較通風好乾。',
    specs: [
      '總寬 92（兩邊牆之間 93，各留 0.5 收邊）× 深 14 × 高 60，離地約 120～180',
      '中間鏡門 50 寬、單開，鉸鏈在靠裡面那側；左右開放格各約 21 寬，3 層（每層約 19 高）',
      '要訂做：防水 PVC 發泡板一體成型，比現成鏡櫃加側邊層架整齊',
      '牆是輕隔間：鎖之前在牆裡加補強，鑽孔避開洗臉盆的水管',
    ],
    picks: [
      {
        name: '昊鑫衛浴 訂做鏡櫃 92 × 14 × 60（中間鏡門＋左右開放層板）（估價）',
        rec: true,
        detail:
          '昊鑫有做 90 公分訂製發泡板鏡櫃（AI90B 90 × 14 × 75），尺寸、層板可以照需求做；台灣製；工期約 2～3 週；報價制（LINE 或 02-2821-2615）',
        price: '約 NT$9,000～11,000（2026/10 依同寬現成 PVC 鏡櫃售價推估，實際依報價）',
        category: '系統櫃・訂製',
        url: 'https://haosin.tw/product/yh490b%E9%8F%A1%E7%AE%B1%E5%B8%B6%E7%87%8890cm/',
        source: '昊鑫衛浴',
      },
      {
        name: '大巨光 1450 PVC 發泡板鏡櫃（原本的方案，50 寬）',
        detail: '50 × 14 × 60；上面鏡門、下面開放層板；左右兩邊各空約 21 公分牆面',
        price: '約 NT$6,086（2026/09 momo）',
        url: 'https://www.momoshop.com.tw/product/4643750',
        source: 'momo',
      },
    ],
    notes: ['半套廁所沒有淋浴，不太會起霧，選不除霧的就好'],
  },
  kbin: {
    summary:
      '廚房地板沒有空位（走道 65、冰箱旁只剩 5.5 公分、另一邊是主臥門），所以把分類垃圾桶裝進水槽下櫃：開門就滑出來，不佔地板，洗完菜轉身就丟。',
    specs: [
      '水槽下櫃靠冰箱那扇門（門寬約 42），桶子寬 25、深 48、高 40',
      '前桶 15 L 一般垃圾：套新北 14 L 專用袋（43～45 × 62～65）；後桶 15 L 資源回收',
      '避開水槽正下方的存水彎，和右邊洗碗機的進排水管',
    ],
    picks: [
      {
        name: 'Hailo Tandem AS 15/15 門板連動抽拉垃圾桶（Häfele 502.70.252）',
        rec: true,
        detail: '2 × 15 L 前後排、25.1 × 48.2 × 40；裝在 30 公分以上的門片下櫃，開門桶子就跟著全拉出來，雙手拿東西也能用；安裝費另外詢價',
        price: '約 NT$10,350（2026/09 Better Choice，不含安裝）',
        url: 'https://betterchoice.com.tw/products/hailo-tandem-30l-3666101',
        source: 'Better Choice',
      },
      {
        name: 'IKEA HÅLLBAR 分類垃圾桶組合 外拉式 22 L × 2',
        detail: '框 26.5 × 45 × 31.5，要開門再用手拉；兩組並排要約 53 寬，要確認存水彎和洗碗機水管讓不讓得出位置；容量較大、最便宜',
        price: '約 NT$1,249／組，2 組 NT$2,498（2026/09 IKEA；線上庫存不穩）',
        cost: 2498,
        url: 'https://www.ikea.com.tw/zh/products/kitchen-accessories/kitchen-interior-organisers/hallbar-spr-89308826',
        source: 'IKEA',
      },
      {
        name: 'NITORI 分類垃圾桶 雙層 55L（落地型，放陽台門邊）',
        detail: '27 × 33.5 × 85.5；上 32 L 掀蓋、下 23 L 往前傾倒；下層套 25 L、上層套 33 L 專用袋；廚房放不下，要放的話只能放陽台',
        price: '約 NT$1,490（2026/09 NITORI）',
        url: 'https://www.nitori-net.tw/product/8453066',
        source: 'NITORI',
      },
    ],
    notes: [
      '新北市廚餘要另外分：瀝乾後倒進垃圾車的廚餘桶（2026 年起生熟不用分）；骨頭、硬殼、生肉內臟算一般垃圾；分錯可罰 1,200～6,000',
      '回收只有 15 L：每次回收日清；紙箱、大量寶特瓶可以先放陽台（陽台門就在中島走道旁）',
      '裝之前先打開水槽下櫃量：存水彎位置、內深要有 48.2 以上；安裝可以請廚具或系統櫃師傅順便裝',
    ],
    related: [
      {
        title: '廚餘桶（新北市規定要分）',
        info: {
          summary: '水槽邊放一個有密封蓋、內附瀝水桶的小廚餘桶，每天倒；夏天也可以先冰冷凍庫。',
          picks: [
            {
              name: '樂扣樂扣 密封防臭雙把手廚餘回收桶 3L',
              detail: '21.5 × 21.5 × 21.7；扣環密封蓋、內附瀝水桶',
              price: '約 NT$599（2026/09 PChome）',
              url: 'https://24h.pchome.com.tw/prod/DEBMF0-A900ICM43',
              source: 'PChome',
            },
          ],
        },
      },
    ],
  },
  grinder: {
    summary: '放在豆罐和咖啡機中間；要磨得到義式的細度，機身窄、不高，檯面上方沒有吊櫃也不會擋到豆倉。',
    specs: ['寬 ≤ 15、深 ≤ 25（檯面深 40）', '可以磨義式細粉，最好無段調整，方便配 Dedica 微調', '110V，接左邊專用迴路插座'],
    picks: [
      {
        name: 'FELLOW Opus 2 錐刀磨豆機 磨砂黑（1222MB-TW）',
        rec: true,
        detail: '13 × 20.6 × 26.7；48 mm 錐刀、無段調整，義式到冷萃都能磨；豆倉 100 g；十億國際總代理、保固 2 年',
        price: '約 NT$8,980（2026/09 PChome，定價 NT$9,980；官網寫黑色 10 月下旬到貨）',
        url: 'https://24h.pchome.com.tw/prod/DMATJN-A900KAHUU',
        source: 'PChome',
      },
      {
        name: 'BARATZA Encore ESP 咖啡磨豆機',
        detail: '12 × 16 × 35；40 mm 錐刀、40 段（20 段給義式）；110V 100 W；公司貨保固 1 年；最便宜、佔地最小',
        price: '約 NT$6,777（2026/09 momo；PChome 約 NT$7,288）',
        url: 'https://www.momoshop.com.tw/product/12151872',
        source: 'momo',
      },
      {
        name: 'TIMEMORE 泰摩 雕刻家 064S',
        detail: '10 × 22.5 × 25.6；64 mm 平刀、可調轉速；110V 250 W；約 4.1 kg；風味更乾淨，價格約兩倍',
        price: '約 NT$16,800（2026/09 momo 泰摩官方直營）',
        url: 'https://www.momoshop.com.tw/TP/TP0002233/goodsDetail/TP00022330000182',
        source: 'momo',
      },
    ],
    notes: ['磨完豆直接把粉碗拿到右邊的咖啡機，動線不回頭', 'Opus 2 的豆倉在上面，加豆時旁邊的豆罐順手打開就好'],
  },
  frother: {
    summary: '放在咖啡機右邊；選可以打冷熱奶泡的全自動奶泡機，佔地一個馬克杯大小。',
    specs: ['底座直徑約 10～15', '冷奶泡、熱奶泡、熱牛奶', '約 450～600 W，接右邊插座（和咖啡機不同迴路）'],
    picks: [
      {
        name: 'Nespresso Aeroccino 4 全自動奶泡機',
        rec: true,
        detail: 'Ø10.4 × 高 19；冷奶泡、綿密熱奶泡、輕盈熱奶泡、熱牛奶 4 種；奶泡 120 ml、熱牛奶 240 ml；保固 2 年',
        price: '約 NT$4,080（2026/09 PChome；momo 同價）',
        url: 'https://24h.pchome.com.tw/prod/DMBN1I-A900GDXDB',
        source: 'PChome',
      },
      {
        name: 'Nespresso Aeroccino 3',
        detail: '約 Ø10 × 高 18；冷熱奶泡＋熱牛奶，一顆按鈕切換；奶泡 120 ml、熱牛奶 240 ml；保固 2 年',
        price: '約 NT$3,080（2026/09 momo）',
        url: 'https://www.momoshop.com.tw/product/7055038',
        source: 'momo',
      },
      {
        name: 'illy 全自動冷熱電動奶泡機 F280G',
        detail: '15 × 12 × 18.7；冷熱奶泡、熱飲；100～250 ml；磁吸底座；600 W；保固 1 年',
        price: '約 NT$3,980（2026/09 PChome，定價 NT$4,200）',
        url: 'https://24h.pchome.com.tw/prod/DMATID-A900JA5DQ',
        source: 'PChome',
      },
    ],
    notes: ['Dedica 本身也有蒸氣管，奶泡機是打冷奶泡、懶得清蒸氣管的時候用'],
  },
  beans: {
    summary: '4 罐排成 2 × 2 放在檯面最左邊、磨豆機旁邊；選真空密封罐，每罐裝得下一包 200～250 g 的豆子。',
    specs: ['每罐約 0.6～0.7 L（200～250 g 豆子）', '2 × 2 排約 22 × 22 公分', '遠離咖啡機的熱氣和直射陽光'],
    picks: [
      {
        name: 'FELLOW ATMOS 真空密封罐 玻璃 0.7L × 4',
        rec: true,
        detail: 'Ø11 × 高 12.5；旋轉上蓋就抽真空、有真空指示；約 285 g（深焙 250、淺焙 315 g）',
        price: '約 NT$1,290／個，4 個約 NT$5,160（2026/09 PChome）',
        cost: 5160,
        url: 'https://24h.pchome.com.tw/prod/DEAA9B-A9009OEUM',
        source: 'PChome',
      },
      {
        name: 'Ankomn Turn-N-Seal 真空儲豆罐 600 ml × 4（台灣品牌）',
        detail: 'Ø10 × 高 16；旋轉抽真空；約 180 g，一包 250 g 的豆子裝不完',
        price: '約 NT$890／個，4 個約 NT$3,560（2026/09 PChome）',
        cost: 3560,
        url: 'https://24h.pchome.com.tw/prod/DEAA7S-A900H35A6',
        source: 'PChome',
      },
      {
        name: 'HARIO 咖啡保鮮罐 M MCN-200B × 4',
        detail: '9.9 × 9.9 × 14.2；密封但不抽真空；約 200 g；最便宜',
        price: '約 NT$540／個，4 個約 NT$2,160（2026/09 PChome）',
        cost: 2160,
        url: 'https://24h.pchome.com.tw/prod/DEAABE-B900B0GJ6',
        source: 'PChome',
      },
    ],
    notes: ['罐子上貼烘焙日期，先開的先喝；多買的豆子放左邊抽屜當存貨'],
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
    summary:
      '全套衛浴選朝馬桶那側有開放格的浴櫃：柯林斯 ST-R-80 左邊 52 是門片櫃、右邊 26.5 是上下兩層開放格（正面、側面都拿得到），坐在馬桶上伸手就拿到衛生紙；櫃體防水發泡板、壁掛。',
    specs: [
      '空間上限寬 85 × 深 50；盆緣高度約 80～85（吊櫃可依身高決定掛多高）',
      '馬桶在洗手台的右手邊（面對洗手台時），開放格要在右邊：下單指定 R 款',
      '櫃體 PVC 防水發泡板最好，其次不鏽鋼／鋁；避免塑合板、防潮板',
      '壁掛吊櫃（櫃底懸空）好清潔，淋浴間濺水也不會泡到櫃腳',
      '排水：牆排用 P 管、地排用 S 管，先量現場再決定',
    ],
    picks: [
      {
        name: '柯林斯 Corins ST-R-80 浴櫃（右側開放格）＋ 5080C 陶瓷盆',
        rec: true,
        detail:
          '櫃 78.5 × 45.5 × 60：52 門片段＋26.5 開放格（上下兩層，正面和側面都拿得到）；18 mm 實心發泡板、結晶鋼烤白門，開放格是深木紋（古巴硬木）；盆 80 × 48；不含龍頭，另配凱撒 B380C 單孔龍頭約 NT$2,446',
        price: '約 NT$15,250（2026/09 永昕，櫃＋盆；大巨光約 NT$20,235）＋龍頭約 NT$2,446',
        cost: 17696,
        url: 'https://ysbk.com.tw/product/corinsst-r-80c/',
        source: '永昕衛浴',
      },
      {
        name: '昊鑫衛浴 訂做 85 cm 防水發泡板浴櫃（側邊開放格／紙孔）',
        detail: '想要全白、剛好 85 寬時再考慮；報價制（LINE 或 02-2821-2615）；參考：好德 90 cm 發泡板抽屜櫃只有櫃體就要 NT$26,500～32,200',
        price: '報價制（估計櫃體 NT$25,000 以上，另加盆、龍頭、安裝）',
        url: 'https://haosin.tw/product/%E6%B5%B4%E6%AB%83%E5%81%B4%E9%82%8A%E7%B4%99%E5%AD%94%E8%A8%82%E8%A3%BD/',
        source: '昊鑫衛浴',
      },
      {
        name: '和成 HCG LCS8048-3111E（伊諾系列 80 cm）',
        detail: '整組約寬 80～82 × 深 50 × 高 65 壁掛；奈米釉陶瓷盆；全防水發泡板櫃；含 LF3111E 龍頭、按壓落水頭與全套管材（P 管，牆排）',
        price: '約 NT$22,730（2026/09 特力屋線上，定價 NT$46,300；含龍頭，安裝另計）',
        url: 'https://www.trplus.com.tw/p/016808615',
        source: '特力屋',
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
      'ST-R-80：下單前向廠商確認 R 是「面對洗手台時開放格在右邊」，以及是壁掛還是落地；廠商不負責安裝，要另外請水電',
      '開放格是深木紋面，和白色櫃體不同色；想要全白就走訂做',
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

  // 電子鍋（2026/09 查詢）
  ecooker: {
    summary:
      '平常收在中島廚房側、微波爐旁的抽拉層板上（格子淨寬 37.6 × 淨深約 55 × 淨高 26，層板上方可用約 24.5）；煮飯時拉出層板、整台拿到正上方靠窗的檯面，插檯面的平面插座煮，放涼再收回去；兩人用 3 人份就夠。',
    specs: [
      '象印 NS-LBF05 實際尺寸 寬 23 × 深 30 × 高 19、約 2.7 kg：放進格子上方還有約 5.5 cm 空隙，收納沒問題',
      '上蓋是後側鉸鏈往上掀，打開約 40 cm 高（依外型估算，官方沒有公布）：在格子裡打不開，一定要整台移出來才能開蓋',
      '不要在層板上直接煮：要把整台拉到檯面外才開得了蓋、蒸氣才不會噴到實木檯面底部，層板得拉出約 45 cm，廚房走道只剩約 20 cm，而且就在瓦斯爐正後方',
      '格子高度維持 26 就好（櫃內最多 62，上面已經是最高的一格）；比 NS-LBF05 高超過 23 的電子鍋放不進去',
    ],
    picks: [
      {
        name: '象印 ZOJIRUSHI 3 人份黑金剛微電腦電子鍋 NS-LBF05',
        detail: '寬 23 × 深 30 × 高 19、約 2.7 kg、450 W（保溫 28 W）；白飯口感好、體積小（尺寸已和 PChome、momo 規格核對）',
        price: '約 NT$5,490（2026/09 PChome）',
        url: 'https://24h.pchome.com.tw/prod/DMBI0E-A9009TYVQ',
        source: 'PChome',
        rec: true,
      },
      {
        name: '虎牌 TIGER 3 人份微電腦電子鍋 JAI-G55R',
        detail: '約 22.4 × 28.3 × 18.9；比象印便宜',
        price: '約 NT$3,391（2026/09 PChome）',
      },
    ],
    search: ['象印 NS-LBF05', '虎牌 JAI-G55R'],
    notes: ['電子鍋和電鍋、氣炸鍋同時開會超過一組 15A 插座，錯開使用或分兩個迴路', '收進櫃子前等鍋子完全冷卻、內鍋擦乾，避免悶出水氣'],
  },

  // 外套掛勾（2026/09 查詢）
  coathooks: {
    summary:
      '玄關 45 公分寬的牆只掛一排三個可收折掛勾（九宏 RD0481，白）：收起來每個只有 2.4 × 7.3、凸出牆面 1.2 公分，按一下才翻開掛衣服，不用的時候幾乎看不到。',
    specs: [
      '收起 2.4 × 1.2 × 7.3、打開凸出 6.4；鋁合金，磁吸收合',
      '一排三個、掛勾約離地 165、中心間距 13：一人一個、另一個掛包包；每個有 3 段凹槽，一個可以掛 2 件',
      '兩邊離高櫃和沙發扶手各約 9 公分，外套不會壓到扶手',
    ],
    picks: [
      {
        name: '九宏 J-Home RD0481 可收折掛勾（白）× 3',
        rec: true,
        detail: '2.4 × 1.2 × 7.3（打開 6.4）；按壓翻開、磁吸收合；兩顆螺絲（孔距 32 mm）；另有霧銀、黑、霧金；官方沒有標承重',
        price: '約 NT$126／個，3 個 NT$378（2026/10 九宏五金）',
        cost: 378,
        url: 'https://shop.j-home.com.tw/products/2-1060-820',
        source: '九宏五金',
      },
      {
        name: '九宏 J-Home A5131 可收折掛鉤 × 3（比較粗壯）',
        detail: '寬 2.5 × 高 7、打開約 7；鋁合金塊，掛厚重冬季大衣比較安心；鈦色／霧黑',
        price: '約 NT$231／個，3 個 NT$693（2026/10 九宏五金）',
        cost: 693,
        url: 'https://shop.j-home.com.tw/products/2-1060-672',
        source: '九宏五金',
      },
      {
        name: '九宏 J-Home ES-671 回彈式掛鉤 × 3',
        detail: '2.6 × 1.3 × 5.5；鋅合金，東西拿走就自己彈回貼平；鎳刷線／黑',
        price: '約 NT$142／個，3 個 NT$426（2026/10 九宏五金）',
        cost: 426,
        url: 'https://shop.j-home.com.tw/products/2-1060-654',
        source: '九宏五金',
      },
      {
        name: '無印良品 MUJI 壁掛家具 三連掛鉤 橡木 × 2（原本的方案）',
        detail: '44 × 2.5 × 10 兩條上下掛；掛勾收進板子；每個 2 kg；牆面佔比較多',
        price: '約 NT$1,310／條（台灣價未能確認；日本 ¥3,490）',
        cost: 2620,
        url: 'https://www.muji.com/jp/ja/store/cmdty/detail/4550512939740',
        source: 'MUJI（日本官網規格）',
      },
    ],
    notes: [
      '輕隔間：趁隔間還在做，請木工在石膏板後面加夾板補強（約離地 120～200、寬 75），掛勾用 25～30 mm 木螺絲鎖進夾板',
      'RD0481 沒有標承重：很重的包包、冬季大衣擔心的話改 A5131',
      '九宏五金可以宅配、超商取貨，或到台北萬華康定路 1-1 號自取（02-2375-3797）',
    ],
  },

  // 吸塵器收納櫃（系統櫃）
  vaccab: {
    summary:
      '鞋櫃右邊做吸塵器高櫃，和鞋櫃組成 L 型：做滿到右邊牆壁（寬 48，不留縫）、頂天 300；下門收直立吸塵器連充電座（上緣和鞋櫃齊平 128），中門 3 層放換季鞋、備品，最上面上櫃放鞋盒、雨具。',
    specs: [
      '下層內部淨寬約 44、淨深約 32、淨高約 124：日立 PV-XH4P（高 122）放得進',
      '中間淨高約 95，分 3 層（每層約 31），一層放一到兩雙換季鞋或靴子；最上面上櫃淨高 70（另一片門，要踩椅子拿）',
      '冷氣往左移 10 公分（右端到 235），和頂天高櫃之間留 5 公分側邊空間，冷氣維修、出風不受影響；裝冷氣前和師傅確認側邊間距',
      '不做踢腳，底板直接貼地，吸塵器推進去就好',
      '櫃內背板預留插座，充電座插在裡面',
    ],
    material: [
      '和鞋櫃同一種白色系統板，門片同色、同一條上緣線（下門上緣 128 和鞋櫃頂齊平），上門另一片',
      '無把手：門片開門那側 45° 斜切取手，和鞋櫃一樣',
      '充電時會發熱：門片下緣或側板開通風孔，或門片做格柵',
      '門片寬約 48，鉸鏈在鞋櫃那側、往右開：開門時先把最靠近的那件外套撥開',
      '頂天：上緣和天花板之間留 1～2 cm 收邊條，地震時櫃子才不會卡死',
    ],
    notes: ['插座請水電做在櫃內離地約 30～40，電線從背板開孔穿', '吸塵器集塵盒倒完再收，櫃內比較不會有灰塵味'],
  },

  // Dyson 直立式電扇（三個房間共用一組資料，2026/09 查詢）
  'fan-living': {
    summary: '三個房間各一台 Dyson 直立式涼風扇；預設 Purifier Cool TP11（涼風＋空氣清淨，高 105、底座 22），新家剛裝潢完也能順便濾空氣。',
    specs: ['高 105 × 底座 22 × 22、4.73 kg', '每台旁邊要有插座', '客廳放電視櫃旁吹向沙發；主臥放床尾角落；次臥放書桌旁窗邊角落吹向座位'],
    picks: [
      {
        name: 'Dyson Purifier Cool TP11 二合一涼風智能空氣清淨機',
        detail: '105 × 22 × 22、4.73 kg、最大風量 290 L/s；HEPA 濾網＋涼風、可擺頭、App 控制',
        price: '約 NT$10,900／台（2026/09 Dyson 台灣、恆隆行）',
        url: 'https://shop.dyson.tw/fans-and-heaters/purifiers/dyson-purifier-cool-tp11-purifying-fan-white-silver-544907-01',
        source: 'Dyson 台灣',
        rec: true,
      },
      {
        name: 'Dyson Hot+Cool HF1（AM15）智能涼暖風扇',
        detail: '夏天涼風、冬天暖風；沒有空氣清淨',
        price: '約 NT$15,900／台（2026/09 Dyson 台灣）',
        url: 'https://shop.dyson.tw/fans-and-heaters',
        source: 'Dyson 台灣',
      },
      {
        name: 'Dyson Purifier Cool De-NOx TP12（甲醛 NOx 偵測）',
        detail: '可以偵測並分解甲醛，新家、系統櫃剛裝好時最有感',
        price: '約 NT$20,900～25,900／台（2026/09 Dyson 台灣）',
        url: 'https://shop.dyson.tw/fans-and-heaters',
        source: 'Dyson 台灣',
      },
    ],
    search: ['Dyson TP11', 'Dyson HF1', 'Dyson TP12'],
    notes: [
      'TP11 的濾網約 12 個月換一次，三台一起買可以問恆隆行或 Dyson 官網的多件優惠',
      '想要冬天也能用，可以客廳改 Hot+Cool，臥室維持 TP11',
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
  'ecooker',
  'grinder',
  'frother',
  'towerfan',
  'airfryer',
  'microwave',
  'projector',
]

/** 分類：系統櫃（訂做）、訂製、家電、衛浴（自己買的洗臉盆）、建商附、家具 */
export function itemCategory(it: FurnitureItem): string {
  if (it.type === 'person') return '參考'
  if (it.type === 'vanity' || it.type === 'mirrorcab') return '衛浴'
  if (it.type === 'kitchen' || (it.locked && it.type !== 'acunit')) return '建商附'
  if (it.type === 'peninsula' || it.type === 'hiddendoor') return '訂製'
  if (hasInterior(it)) return '系統櫃'
  if (it.type === 'projection') return '示意'
  if (APPLIANCES.includes(it.type)) return '家電'
  return '家具'
}
