import { reactive, watch } from 'vue'
import type { Design, FurnitureItem, Lighting, Tool, ViewMode, WalkPose } from './types'
import { CEILING_DEFAULT, rooms } from './data/house'
import { defaultFurniture } from './data/catalog'
import { clone } from './cabinet'

const KEY = 'my-house-b2-design-v2'
const REV = 114
/**
 * 各版本只替換指定的家具（換成新的預設），其他家具保留使用者的調整。
 * 有列欄位時只更新那些欄位（位置等其他調整保留；使用者刪掉的不會加回來）。
 */
const FURNITURE_PATCHES: [number, string[], (keyof FurnitureItem)[]?][] = [
  // rev 7：加大雙人床、半島型中島餐桌與四張椅、三人沙發、咖啡櫃
  [7, ['mbed', 'mns1', 'mns2', 'mward', 'dining', 'dchair1', 'dchair2', 'dchair3', 'dchair4', 'rice', 'fryer', 'sofa', 'coffeebar', 'espresso']],
  // rev 8：中島餐桌加寬到 90，電鍋與氣炸鍋橫向並排
  [8, ['dining', 'rice', 'fryer']],
  // rev 9：咖啡櫃改矮櫃、主臥投影機與投影畫面、鞋櫃上方洞洞板
  [9, ['coffeebar', 'espresso', 'projector', 'projection', 'pegboard']],
  // rev 10：工作陽台加乾衣機，洗衣機一起往女兒牆那側移、並排不堆疊
  [10, ['washer', 'dryer']],
  // rev 12：洗衣機、乾衣機維持並排，整組往次臥窗下那面牆推（離女兒牆遠、避免淋雨）
  [12, ['washer', 'dryer']],
  // rev 13：衣櫃做到頂＋櫃內規劃；次臥椅子背後加矮櫃與到頂書櫃
  [13, ['mward', 'bward1'], ['h', 'interior']],
  [13, ['shoe', 'coffeebar', 'tvstand', 'mns1', 'mns2', 'dining'], ['interior', 'features']],
  [13, ['scab', 'sshelf']],
  // rev 14：椅子背後那面是輕隔間，書櫃全部改落地、不做到頂（210）
  [14, ['sshelf', 'sshelf2']],
  // rev 15：中島餐桌兩端各一組雙連三孔插座
  [15, ['dining'], ['features']],
  // rev 16：書櫃太高，先拿掉（只留下排印表機那排矮櫃）
  [16, ['sshelf', 'sshelf2']],
  // rev 17：中島走道側加中立板（層板跨距 95 太長）
  [17, ['dining'], ['interior']],
  // rev 18：冰箱改六門（製冰室獨立），65 × 70 × 185
  [18, ['fridge'], ['name', 'w', 'h', 'features']],
  // rev 19：投影畫面不用另外標，直接投在床尾的牆上
  [19, ['projection']],
  // rev 20：建商的洗臉盆退掉了，兩套衛浴的洗臉盆浴櫃自己買
  [20, ['vanity', 'vanity2'], ['name']],
  // rev 21：電視改壁掛
  [21, ['tv'], ['name', 'x', 'd', 'elev', 'features']],
  // rev 22：電鍋、氣炸鍋改放中島走道側的抽拉開放層板；檯面放電子鍋
  [22, ['dining'], ['interior']],
  [22, ['rice', 'fryer']],
  [22, ['ecooker']],
  // rev 23：電視櫃改懸浮壁掛
  [23, ['tvstand'], ['name', 'h', 'elev', 'features']],
  // rev 24：中島檯面改白橡木實木
  [24, ['dining'], ['features']],
  // rev 25：無印風配色（白色高櫃、淺橡木矮櫃與木家具、米色布料）
  // rev 26：咖啡櫃上方加馬克杯展示吊櫃（玻璃門）
  [26, ['mugcab']],
  // rev 27：茶几改圓形小茶几
  [27, ['coffee'], ['name', 'w', 'd', 'h', 'features']],
  // rev 28：圓茶几改直徑 70，離沙發拉到約 38
  [28, ['coffee'], ['x', 'w', 'd']],
  // rev 29：客廳加 184、154 公分的身高參考人形
  [29, ['person184', 'person154']],
  // rev 30：進門右手邊加外套掛勾
  [30, ['coathooks']],
  // rev 31：鞋櫃改懸空（離地 20，底下放室內拖鞋），櫃高 100
  [31, ['shoe'], ['name', 'h', 'elev', 'features', 'interior']],
  // rev 32：吸塵器收進鞋櫃旁的吸塵器櫃；鞋櫃上緣對齊 128、洞洞板上移、外套掛勾挪 2
  [32, ['vaccab']],
  [32, ['shoe'], ['h']],
  [32, ['vacuum'], ['name', 'x', 'y', 'elev']],
  [32, ['pegboard'], ['elev', 'h']],
  [32, ['coathooks'], ['y']],
  // rev 33：次臥衣櫃改鋼管收納＋整面拉門
  [33, ['bward1'], ['name', 'features', 'interior']],
  // rev 34：次臥衣櫃放 28 吋行李箱＋兩個登機箱
  [34, ['bward1'], ['interior']],
  // rev 35：電視櫃改實木美腿（不再懸浮壁掛）
  [35, ['tvstand'], ['name', 'h', 'elev', 'features']],
  // rev 36：次臥衣櫃改 ELVARLI 80＋80＋40 格局
  [36, ['bward1'], ['interior']],
  // rev 37：三個房間各一台 Dyson 直立式電扇
  [37, ['fan-living', 'fan-master', 'fan-bed2']],
  [38, ['fan-bed2'], ['x', 'y']],
  // rev 39：拿掉咖啡櫃上方的馬克杯吊櫃，馬克杯改放咖啡櫃右邊的玻璃門展示格（咖啡櫃加寬到 120）
  [39, ['mugcab']],
  [39, ['coffeebar'], ['name', 'w', 'y', 'interior']],
  // rev 40：電子鍋改放微波爐旁的抽拉開放層板
  [40, ['dining'], ['interior']],
  [40, ['ecooker'], ['name', 'x', 'y', 'rot', 'elev']],
  // rev 41：餐桌改短（220 → 170，靠窗端不動），餐椅改兩張面對面
  [41, ['dining'], ['y', 'w']],
  [41, ['dchair1', 'dchair2'], ['x', 'y', 'rot']],
  [41, ['dchair3', 'dchair4']],
  // rev 42：客廳電扇移到咖啡櫃旁、主臥電扇移到窗邊牆角；鞋櫃最下層改進門片裡（只剩櫃子底下開放放拖鞋）
  [42, ['fan-living', 'fan-master'], ['x', 'y', 'rot']],
  [42, ['shoe'], ['interior']],
  // rev 43：次臥衣櫃行李箱全部橫躺疊在中間那格最下面（28 吋在下、登機箱 ×2 在上）
  [43, ['bward1'], ['interior']],
  // rev 44：登機箱改回左格最下面直立並排（不疊在 28 吋上），28 吋單獨橫躺、上面放收納箱
  [44, ['bward1'], ['interior']],
  // rev 45：咖啡櫃檯面規劃（豆罐 ×4、磨豆機、義式咖啡機、奶泡機）＋牆面插座；左欄加茶包抽屜
  [45, ['coffeebar'], ['interior', 'features']],
  [45, ['espresso'], ['name', 'x', 'y', 'w', 'd', 'h', 'color']],
  [45, ['beans', 'grinder', 'frother']],
  // rev 46：主臥／次臥衣櫃依使用頻率分工（主臥當季每天穿、次臥換季大件）；主臥衣櫃側板加全身鏡
  [46, ['mward', 'bward1'], ['interior']],
  [46, ['mirror']],
  // rev 47：磨豆機、奶泡機、豆罐改成建議機種的尺寸
  [47, ['beans', 'grinder', 'frother'], ['x', 'h', 'd', 'w', 'color']],
  // rev 48：次臥電扇移到書房矮櫃靠衣櫃那端
  [48, ['fan-bed2'], ['x', 'y', 'rot']],
  // rev 49：全身鏡改 IKEA NISSEDAL 40 × 150 白框，離地 30
  [49, ['mirror'], ['name', 'x', 'd', 'h', 'elev', 'color']],
  // rev 50：廚房水槽下櫃加抽拉式分類垃圾桶
  [50, ['kbin']],
  // rev 51：兩間衛浴加鏡櫃；全套衛浴洗手台改側邊開放格（朝馬桶放衛生紙）
  [51, ['vanity'], ['name', 'x', 'y', 'w', 'd', 'features']],
  [51, ['mcab1', 'mcab2']],
  // rev 52：電子鍋格子標示改成收納用（煮飯時拿到檯面）、鍋具位置標示；鞋櫃改落地（最下面一格開放放拖鞋）
  [52, ['dining'], ['interior']],
  [52, ['ecooker'], ['name']],
  [52, ['shoe'], ['name', 'elev', 'h', 'features', 'interior']],
  // rev 53：外套掛勾改 IKEA PLOGA 垂直掛鉤架
  [53, ['coathooks'], ['name', 'x', 'w', 'd', 'h', 'elev', 'color', 'features']],
  // rev 54：次臥矮櫃最右邊做掃地機器人的家（櫃深 45、不做踢腳）
  [54, ['scab'], ['name', 'x', 'd', 'features', 'interior']],
  // rev 55：四扇房門、浴室門改隱形門（規格、估價項目）
  [55, ['door-master', 'door-bed2', 'door-bath', 'door-wc']],
  // rev 56：次臥門、半套衛浴改回原本樣式（一般房門、穿牆拉門）
  [56, ['door-bed2', 'door-wc'], ['name']],
  // rev 57：次臥門、半套衛浴拉門用建商原本的門（建商附）
  [57, ['door-bed2', 'door-wc'], ['name', 'locked']],
  // rev 58：掃地機器人格加門片（蓋到離地 12，機器人從門下進出）
  [58, ['scab'], ['interior']],
  // rev 59：電視櫃改中間開放、左右門片
  [59, ['tvstand'], ['interior']],
  // rev 60：電視櫃、咖啡櫃、鞋櫃改無把手（斜切取手）
  [60, ['tvstand', 'coffeebar', 'shoe'], ['features']],
  // rev 61：L 型鞋櫃（吸塵器櫃加高到 230、上面加上櫃）；洞洞板縮成鞋櫃上方一片
  [61, ['vaccab'], ['name', 'h', 'features', 'interior']],
  [61, ['pegboard'], ['x', 'w', 'h', 'elev']],
  // rev 62：外套掛勾改 MUJI 三連掛鉤 × 2（掛勾可收起）
  [62, ['coathooks'], ['name', 'x', 'y', 'w', 'd', 'h', 'elev', 'color', 'features']],
  // rev 63：客廳不要地毯
  [63, ['rug']],
  // rev 64：全套衛浴鏡櫃改單門（昊鑫 KLS-DR55）
  [64, ['mcab1'], ['name', 'y', 'w', 'd', 'h', 'elev']],
  // rev 65：客餐廳天花板燈光規劃（燈溝＋嵌燈）
  [65, ['livinglights']],
  // rev 66：外套掛勾拿掉示意外套，只畫兩條掛勾板
  [66, ['coathooks'], ['x', 'd', 'h', 'elev']],
  // rev 67：拿掉所有燈（燈光規劃項目）
  [67, ['livinglights']],
  // rev 68：次臥書櫃加高到 150（下段維持、上段兩層書・展示・3C 備品）
  [68, ['scab'], ['name', 'h', 'interior']],
  // rev 69：外套掛勾改九宏 RD0481 可收折掛勾 × 3（一排）
  [69, ['coathooks'], ['name', 'x', 'w', 'd', 'h', 'elev', 'color', 'features']],
  // rev 70：次臥書櫃回到上一步（矮櫃 90，房門口的電燈開關不被擋住）
  [70, ['scab'], ['name', 'h', 'interior']],
  // rev 71：行李箱都移到書房矮櫃旁的行李箱櫃（有門）；衣櫃空出來放收納箱；次臥電扇移到行李箱櫃和衣櫃中間
  [71, ['lugcab']],
  [71, ['bward1'], ['interior']],
  [71, ['fan-bed2'], ['x', 'y', 'rot']],
  // rev 72：吸塵器高櫃做滿到右邊牆壁、頂天；冷氣往左移 10 公分
  [72, ['vaccab'], ['name', 'x', 'w', 'h', 'interior']],
  [72, ['vacuum', 'ac-living'], ['x']],
  // rev 73：次臥衣櫃最右邊窄格做層架到牆
  [73, ['bward1'], ['interior']],
  // rev 74：衣櫃右邊窄格層板和旁邊 40 格切齊
  [74, ['bward1'], ['interior']],
  // rev 75：書房矮櫃、行李箱櫃改無把手（斜切取手）
  [75, ['scab', 'lugcab'], ['features']],
  // rev 76：刪除全身鏡
  [76, ['mirror']],
  // rev 77：次臥衣櫃重新規劃（行李箱放回左門下方、零碎衣物集中中門、燙衣板回右邊窄格）；拿掉行李箱櫃、電扇回書房矮櫃那端
  [77, ['bward1'], ['interior']],
  [77, ['lugcab']],
  [77, ['fan-bed2'], ['x', 'y', 'rot']],
  // rev 78：衣櫃右邊窄格不放燙衣板，改層架收納
  [78, ['bward1'], ['interior']],
  // rev 79：書房矮櫃上方加兩條浮動層板＋洞洞板
  [79, ['bshelf1', 'bshelf2', 'pegboard2']],
  // rev 80：衣櫃依季節分工（次臥冬天衣物・正式服・長裙・配件，主臥夏天衣物・運動服・睡衣）
  [80, ['bward1', 'mward'], ['interior']],
  // rev 81：次臥升降桌往按摩椅那邊移，靠窗那張和窗那面牆留 54
  [81, ['bdesk1', 'bdesk2', 'bchair1', 'bchair2'], ['x', 'y', 'rot']],
  // rev 82：主臥衣櫃上櫃改單開門
  [82, ['mward'], ['interior']],
  // rev 83：主臥衣櫃拿掉「明天要穿的」，加毛巾層，放在內衣褲抽屜正上方
  [83, ['mward'], ['interior']],
  // rev 84：手錶、飾品改放鞋櫃上的壓克力盒；主臥衣櫃左欄抽屜改運動配件、內搭皮帶
  [84, ['mward'], ['interior']],
  [84, ['jewel']],
  // rev 85：半套衛浴鏡櫃左右做滿到牆（中間鏡門、左右開放層板 3 層）
  [85, ['mcab2'], ['name', 'w', 'features']],
  // rev 86：刪除手錶飾品收納盒
  [86, ['jewel']],
  // rev 87：主臥半套衛浴加有蓋髒衣籃
  [87, ['hamper']],
  // rev 88：咖啡櫃右欄下層改保溫瓶深抽屜，馬克杯只留上層玻璃門
  [88, ['coffeebar'], ['interior']],
  // rev 89：髒衣籃改小（ELPHECO 40L 薄款）
  [89, ['hamper'], ['y', 'w', 'd']],
  // rev 90：咖啡櫃上方加洞洞板（不做櫃子）
  [90, ['pegboard3']],
  // rev 91：餐桌段加長到 106（一人寬的 1.5 倍），總長 205；餐椅置中
  [91, ['dining'], ['y', 'w']],
  [91, ['dchair1', 'dchair2'], ['y']],
  // rev 92：半套衛浴洗臉盆改照實際建議尺寸 51 × 41
  [92, ['vanity2'], ['x', 'w', 'd']],
  // rev 93：全套衛浴洗手台貼牆；鏡櫃改和洗手台同寬 80（中間鏡門、左右開放層板）
  [93, ['vanity'], ['x']],
  [93, ['mcab1'], ['name', 'x', 'w', 'd', 'h', 'elev', 'features']],
  // rev 94：全套衛浴加浴巾架（雙桿）和擦手巾環
  [94, ['towelbar1', 'towelring1']],
  // rev 95：半套衛浴洗臉盆換寬版 90（聯德爾 WY-900D）；半套衛浴加擦手巾環
  [95, ['vanity2'], ['name', 'x', 'w', 'd']],
  [95, ['towelring2']],
  // rev 96：咖啡櫃上方洞洞板改成白橡木色層板＋KUNGSFORS 不鏽鋼掛桿
  [96, ['pegboard3']],
  [96, ['coffeeshelf', 'coffeerail']],
  // rev 97：刪除咖啡角掛桿和掛著的東西
  [97, ['coffeerail']],
  // rev 98：主臥衣櫃右欄加開放充電凹槽（毛巾改抽屜）；吸塵器高櫃中間打通成開放髒衣區（正掛桿）
  [98, ['mward', 'vaccab'], ['interior']],
  // rev 99：全套衛浴洗手台改淺木紋＋同色開放格（參考圖）；鏡櫃上方加頂天吊櫃
  [99, ['vanity'], ['name', 'color']],
  [99, ['mcab1top']],
  // rev 100：主臥衣櫃開放格改成右端 30 寬窄欄、兩面開（離地 94～226，木紋內襯，最下面一格充電）
  [100, ['mward'], ['name', 'features', 'interior']],
  // rev 101：主臥衣櫃只留充電格開放、其他格加門；門片改斜切取手（上櫃斜切在下緣）
  [101, ['mward'], ['name', 'features', 'interior']],
  // rev 102：吸塵器高櫃取消髒衣區，中間改回門片＋3 層一般儲藏
  [102, ['vaccab'], ['interior']],
  // rev 103：半套衛浴鏡櫃上方加頂天吊櫃
  [103, ['mcab2top']],
  // rev 104：兩間浴室鏡櫃上方的頂天吊櫃拿掉
  [104, ['mcab1top', 'mcab2top']],
  // rev 105：次臥書桌搬到客廳隔間牆（原本矮櫃的位置），矮櫃和層板換到分戶牆，冷氣往分戶牆那邊移，電扇轉向座位
  [105, ['bdesk1', 'bdesk2', 'bchair1', 'bchair2', 'scab', 'bshelf1', 'bshelf2', 'fan-bed2', 'ac-study'], ['x', 'y', 'rot']],
  // rev 106：次臥 Dyson 移到書櫃和窗戶之間的角落
  [106, ['fan-bed2'], ['x', 'y', 'rot']],
  // rev 106：次臥書桌上方的洞洞板拿掉
  [106, ['pegboard2']],
  // rev 107：主臥衣櫃充電格上面一格也改開放（兩面開）
  [107, ['mward'], ['interior']],
  // rev 110：拿掉電視背板（108～109 加過），電視、電視櫃回到貼牆
  [110, ['tvwall']],
  [110, ['tv', 'tvstand'], ['x']],
  // rev 111：燈光方案 B：四道假樑＋嵌入式磁吸軌道
  [111, ['clg-living-l', 'clg-living-c', 'clg-master', 'clg-study']],
  // rev 112：燈改成沿牆四周洗牆：十道沿牆假樑，拿掉中間那道和原本主臥、次臥那兩道
  [112, ['clg-living-l', 'clg-living-c', 'clg-master', 'clg-study', 'clg-living-r', 'clg-living-b', 'clg-living-t', 'clg-master-t', 'clg-master-l', 'clg-master-r', 'clg-study-l', 'clg-study-r', 'clg-study-b']],
  // rev 113：燈光改方案一：拿掉沿牆假樑，改成每間一盞吸頂燈＋明裝軌道
  [113, ['clg-living-l', 'clg-living-r', 'clg-living-b', 'clg-living-t', 'clg-master-t', 'clg-master-l', 'clg-master-r', 'clg-study-l', 'clg-study-r', 'clg-study-b', 'light-living', 'track-living', 'light-master', 'light-study', 'track-study']],
  // rev 114：客廳改兩條明裝軌道洗牆（電視牆、沙發牆那側），吸頂燈移到廚房餐廳那頭
  [114, ['track-living', 'track-living-l', 'track-living-r']],
  [114, ['light-living'], ['x', 'y', 'w', 'd', 'name']],
  [25, ['shoe', 'sofa', 'coffeebar', 'rug', 'coffee', 'tvstand', 'dining', 'dchair1', 'dchair2', 'dchair3', 'dchair4', 'mbed', 'mns1', 'mns2', 'mward', 'bward1', 'scab', 'vanity', 'vanity2'], ['color']],
]
/** 家具預設配置的版本：舊存檔低於這個版本時，家具換成新配置（舊的另存備份） */
const LAYOUT_REV = 6

export function defaultDesign(): Design {
  return {
    version: 1,
    rev: REV,
    mirrored: false,
    ceilingHeight: CEILING_DEFAULT,
    furniture: defaultFurniture(),
    roomFloors: Object.fromEntries(rooms.map((r) => [r.id, r.floor])),
    wallPaint: {},
  }
}

function isDesign(v: unknown): v is Design {
  const d = v as Design
  return !!d && d.version === 1 && Array.isArray(d.furniture) && typeof d.ceilingHeight === 'number'
}

const swapBedrooms = (s: string) => s.replace(/master|bed2/g, (m) => (m === 'master' ? 'bed2' : 'master'))
const swapKeys = (o: Record<string, string> = {}) =>
  Object.fromEntries(Object.entries(o).map(([k, v]) => [swapBedrooms(k), v]))

/** 舊存檔轉成目前的平面資料 id */
function migrate(d: Design): Design {
  // rev 2：主臥 / 次臥 對調（有半套衛浴的左側房間才是主臥），房間與牆的 id 跟著換
  if ((d.rev ?? 1) < 2) {
    d.roomFloors = swapKeys(d.roomFloors)
    d.wallPaint = swapKeys(d.wallPaint)
  }
  // rev 3：預設樓高由 280 改為 300；沒有手動改過的存檔跟著更新
  if ((d.rev ?? 1) < 3 && d.ceilingHeight === 280) d.ceilingHeight = CEILING_DEFAULT
  // rev 25：無印風，客餐廳與兩間臥室的淺橡木地板換成白橡木
  if ((d.rev ?? 1) < 25)
    for (const id of ['living', 'master', 'bed2']) if (d.roomFloors?.[id] === 'oak') d.roomFloors[id] = 'white-oak'
  d.rev = REV
  return d
}

function load(): Design | null {
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw)
    if (!isDesign(parsed)) return null
    const rev = parsed.rev ?? 1
    migrate(parsed)
    // 家具預設配置更新時（rev 4：兩人生活規劃；rev 5：按摩椅移到次臥、冷氣位置；rev 6：窗下訂製中島），
    // 牆色、地板、樓高、戶別保留；舊的家具擺設另存一份，需要時可以救回來。
    if (rev < LAYOUT_REV) {
      try {
        localStorage.setItem(`${KEY}-furniture-backup-rev${rev}`, JSON.stringify(parsed.furniture))
      } catch {
        /* 存不了就算了 */
      }
      parsed.furniture = defaultFurniture()
    } else {
      const seeds = new Map(defaultFurniture().map((f) => [f.id, f]))
      for (const [patchRev, ids, fields] of FURNITURE_PATCHES) {
        if (rev >= patchRev) continue
        if (fields) {
          for (const f of parsed.furniture) {
            const seed = seeds.get(f.id)
            if (!seed || seed.type !== f.type || !ids.includes(f.id)) continue
            const rec = f as unknown as Record<string, unknown>
            for (const k of fields) {
              if (seed[k] === undefined) delete rec[k]
              else rec[k] = clone(seed[k])
            }
          }
          continue
        }
        parsed.furniture = [
          ...parsed.furniture.filter((f) => !ids.includes(f.id)),
          ...ids.flatMap((id) => seeds.get(id) ?? []),
        ]
      }
    }
    const base = defaultDesign()
    return { ...base, ...parsed, roomFloors: { ...base.roomFloors, ...parsed.roomFloors } }
  } catch {
    return null
  }
}

export const design = reactive<Design>(load() ?? defaultDesign())

let timer: number | undefined
watch(
  design,
  () => {
    clearTimeout(timer)
    timer = window.setTimeout(() => {
      try {
        localStorage.setItem(KEY, JSON.stringify(design))
      } catch {
        /* 私密模式等情況存不了就算了 */
      }
    }, 300)
  },
  { deep: true },
)

export function replaceDesign(next: unknown): boolean {
  if (!isDesign(next)) return false
  migrate(next)
  const base = defaultDesign()
  design.rev = REV
  design.ceilingHeight = next.ceilingHeight
  design.mirrored = !!next.mirrored
  design.furniture = next.furniture
  design.roomFloors = { ...base.roomFloors, ...(next.roomFloors ?? {}) }
  design.wallPaint = { ...(next.wallPaint ?? {}) }
  return true
}

export const ui = reactive({
  mode: 'orbit' as ViewMode,
  tool: 'select' as Tool,
  wallCut: 150,
  showLabels: true,
  showOverlay: false,
  overlayOpacity: 0.8,
  doorsOpen: true,
  mainDoorOpen: false,
  showAirflow: true,
  /** 選取的櫃子在 3D 裡打開櫃門，看得到櫃內格局 */
  cabinetOpen: true,
  /** 所有櫃子都打開櫃門 */
  openAllCabinets: false,
  /** 身高參考人形 */
  showPeople: false,
  /** 燈光模擬：自然光（白天）、黃光、白光（晚上只開天花板軌道燈） */
  lighting: 'day' as Lighting,
  /** 漫遊的姿勢（蹲下看下櫃、坐在沙發床邊、躺在床上） */
  pose: 'stand' as WalkPose,
  /** 漫遊時附近可以坐、躺的地方（底部按鈕顯示「坐沙發」、「躺下」） */
  near: { sit: null as string | null, lie: null as string | null },
  snap: 5,
  selectedId: null as string | null,
  paintColor: '#a7bac9',
  measure: null as string | null,
  panel: 'furniture' as 'furniture' | 'rooms' | 'view',
})
