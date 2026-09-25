import type { CabinetInterior } from '../types'
import { P } from '../cabinet'

// 各櫃子的建議內部規劃（家具 id → 規劃）。格子由下往上、欄由左到右（站在櫃子正面看）。
// 高度都是淨高；沒寫的自動分配。衣櫃做到頂（300），上櫃另外一扇短門。

export const seedInteriors: Record<string, CabinetInterior> = {
  // 次臥主衣櫃 241.5 × 60 × 300：IKEA ELVARLI 頂天立地鋁柱＋鋼層板、鋼衣桿（不用木板），外面整面拉門。
  // ELVARLI 每格只有 80 或 40 寬：80＋80＋40，剩下約 20 放燙衣板；格子對齊三片拉門（每片約 82）
  bward1: {
    faces: [
      {
        cols: [
          // 80 格：左下角兩個登機箱直立並排（各約 23 寬 × 38 深 × 55 高，不疊放、各自拿得出來，旁邊還有約 30 寬放包包），
          // 上面長衣，最上層放不常用的東西
          {
            w: 80,
            parts: [
              P('storage', 58, 'open', '登機箱 ×2（直立並排）・旁邊放包包'),
              P('hang', 135, 'open', '長大衣・洋裝'),
              P('shelf', null, 'open', '帽子・圍巾'),
              P('storage', 70, 'open', '最上層：備用寢具・不常用收納箱'),
            ],
          },
          // 80 格：28 吋行李箱橫躺在最下面（約 76 × 50 × 30；實際可用深度扣掉拉門軌道約 51），上面收納箱，再上面短衣吊掛
          {
            w: 80,
            parts: [
              P('storage', 33, 'open', '28 吋行李箱（橫躺）'),
              P('storage', 45, 'open', '收納箱'),
              P('hang', null, 'open', '襯衫・外套・褲子'),
              P('shelf', 28, 'open', '包包'),
              P('storage', 70, 'open', '最上層：棉被・換季衣物'),
            ],
          },
          // 40 格：鋼層板放摺疊衣物（內衣、襪子用有蓋的金屬或 PP 收納盒）
          {
            w: 40,
            parts: [
              P('storage', null, 'open', '收納盒：內衣・襪子'),
              P('shelf', null, 'open', '運動服・睡衣'),
              P('shelf', null, 'open', 'T 恤'),
              P('shelf', null, 'open', '毛衣'),
              P('shelf', null, 'open', '牛仔褲・長褲'),
              P('storage', 70, 'open', '最上層：換季衣物'),
            ],
          },
          // 剩下的空間：燙衣板、長柄工具
          { parts: [P('empty', null, 'open', '燙衣板・長柄工具')] },
        ],
      },
    ],
  },

  // 主臥薄衣櫃 135 × 45 × 300：只放常穿的；深度 45 吊不下一般衣架，改用前後拉桿。
  // 兩欄各約 65 淨寬、對開門（每扇約 34 寬，開門不會卡到床頭櫃）
  mward: {
    faces: [
      {
        cols: [
          {
            parts: [
              P('drawer', 20, 'drawer', '內衣褲'),
              P('drawer', 20, 'drawer', '襪子'),
              P('pullrod', null, 'door', '常穿外套・襯衫（前後拉桿）'),
              P('shelf', 30, 'door', '帽子・包包'),
              P('storage', 70, 'door', '上櫃：換季被', true),
            ],
          },
          {
            parts: [
              P('drawer', 20, 'drawer', '配件・皮帶'),
              P('drawer', 20, 'drawer', '運動服'),
              P('shelf', null, 'door', '睡衣・居家服'),
              P('shelf', null, 'door', '明天要穿的'),
              P('shelf', null, 'door', 'T 恤・上衣'),
              P('shelf', null, 'door', '毛衣'),
              P('shelf', null, 'door', '包包'),
              P('storage', 70, 'door', '上櫃：枕頭・被子', true),
            ],
          },
        ],
      },
    ],
  },

  // 鞋櫃 80 × 35 × 100（懸空離地 20，底下放室內拖鞋）：最下層開放放常穿的鞋，最上層一個抽屜放鑰匙、口罩
  shoe: {
    faces: [
      {
        cols: [
          {
            // 懸空鞋櫃（離地 20）：只有櫃子底下開放放室內拖鞋；櫃內每一層都在門片裡，最下層放常穿的鞋
            parts: [
              P('shoe', 18, 'door', '常穿的鞋'),
              P('shoe', 26, 'door', '高筒鞋・雨鞋'),
              P('shoe', null, 'door', '鞋子'),
              P('shoe', null, 'door', '鞋子'),
              P('drawer', 12, 'drawer', '鑰匙・口罩・發票'),
            ],
          },
        ],
      },
    ],
  },

  // 吸塵器收納櫃 36 × 35 × 128（落地、沒有踢腳）：單門，裡面放直立吸塵器＋充電座，背板預留插座、門片或側板開通風孔
  vaccab: { faces: [{ cols: [{ parts: [P('empty', null, 'door', '吸塵器＋充電座（櫃內預留插座）')] }] }] },

  // 咖啡櫃 120 × 40 × 90：左邊零食門片櫃＋最上層抽屜（咖啡豆、濾紙、膠囊）；
  // 右邊 60 寬玻璃門馬克杯展示，上下兩層，星巴克 BTS 杯 3 個一疊，單排 4 疊 × 2 層 = 24 個，前後兩排約 48 個
  coffeebar: {
    faces: [
      {
        cols: [
          { w: 54, parts: [P('shelf', null, 'door', '零食・泡麵'), P('shelf', null, 'door', '零食'), P('drawer', 15, 'drawer', '咖啡豆・濾紙・膠囊')] },
          { parts: [P('mugs', 31, 'glass', '馬克杯（3 個一疊）'), P('mugs', null, 'glass', '馬克杯（3 個一疊）')] },
        ],
      },
    ],
  },

  // 電視櫃 180 × 40 × 50：左邊開放放網路設備（遙控器訊號、散熱），中間抽屜，右邊門片
  tvstand: {
    faces: [
      {
        cols: [
          { w: 55, parts: [P('appliance', null, 'open', 'Wi-Fi 分享器・遊戲機')] },
          { parts: [P('drawer', null, 'drawer', '雜物'), P('drawer', null, 'drawer', '遙控器・電池')] },
          { w: 55, parts: [P('shelf', null, 'door', '藥品・文件')] },
        ],
      },
    ],
  },

  mns1: { faces: [{ cols: [{ parts: [P('shelf', null, 'open', '書・手機充電'), P('drawer', 15, 'drawer', '眼罩・耳塞・護手霜')] }] }] },
  mns2: { faces: [{ cols: [{ parts: [P('shelf', null, 'open', '投影機遙控器・書'), P('drawer', 15, 'drawer', '眼罩・耳塞・藥')] }] }] },

  // 訂製中島餐桌的收納段（約 99 寬）：廚房側深 57（嵌微波爐＋抽屜），走道側約 31 深（門片櫃）
  dining: {
    faces: [
      {
        name: '廚房側',
        depth: 57,
        cols: [
          { w: 56, parts: [P('drawer', null, 'drawer', '鍋蓋・烤盤'), P('appliance', 38, 'open', '嵌入微波爐（開孔 56 × 38 × 55）')] },
          // 微波爐旁：最上層電子鍋抽拉開放層板（和微波爐同高），用的時候拉出來約 20 cm；下面兩個抽屜
          { parts: [P('drawer', null, 'drawer', '抹布・保鮮膜・夾鏈袋'), P('drawer', null, 'drawer', '餐具'), P('appliance', 26, 'open', '電子鍋（抽拉開放層板）')] },
        ],
      },
      // 走道側（面向陽台門）：上層兩格電器抽拉開放層板，電鍋、氣炸鍋用的時候拉出來約 20 cm，蒸氣不會悶在櫃子裡；
      // 下層門片櫃。中間一片中立板，層板跨距不超過 80
      {
        name: '走道側',
        cols: [
          { parts: [P('shelf', null, 'door', '保鮮盒・備品'), P('appliance', 34, 'open', '電鍋（抽拉開放層板）')] },
          { parts: [P('shelf', null, 'door', '烤盤・鍋具'), P('appliance', 34, 'open', '氣炸鍋（抽拉開放層板）')] },
        ],
      },
    ],
  },

  // 次臥書房：椅子背後的矮櫃 250 × 40 × 90（文件、線材、印表機），避開按摩椅前方
  scab: {
    faces: [
      {
        cols: [
          { w: 55, parts: [P('storage', 30, 'open', '紙張・碳粉'), P('appliance', null, 'open', '印表機・路由器（預留插座、網路孔）')] },
          {
            w: 50,
            parts: [
              P('drawer', null, 'drawer', '雜物'),
              P('drawer', null, 'drawer', '工具'),
              P('drawer', null, 'drawer', '充電線・轉接頭'),
              P('drawer', null, 'drawer', '文具'),
            ],
          },
          { parts: [P('shelf', null, 'door', '文件・說明書'), P('shelf', null, 'door', 'A4 文件夾（直立）')] },
          { parts: [P('storage', null, 'door', '線材收納盒'), P('storage', null, 'door', '備品')] },
        ],
      },
    ],
  },
}
