import type { CabinetInterior } from '../types'
import { P } from '../cabinet'

// 各櫃子的建議內部規劃（家具 id → 規劃）。格子由下往上、欄由左到右（站在櫃子正面看）。
// 高度都是淨高；沒寫的自動分配。衣櫃做到頂（300），上櫃另外一扇短門。

export const seedInteriors: Record<string, CabinetInterior> = {
  // 次臥主衣櫃 241.5 × 60 × 300：四欄各約 58 淨寬，兩人衣服以這裡為主
  bward1: {
    faces: [
      {
        cols: [
          // 長衣區：整扇長門
          {
            parts: [
              P('storage', 45, 'door', '收納箱・包包'),
              P('hang', 140, 'door', '長大衣・洋裝'),
              P('shelf', null, 'door', '帽子・圍巾'),
              P('storage', 70, 'door', '上櫃：棉被', true),
            ],
          },
          // 上下雙層吊掛
          {
            parts: [
              P('hang', 90, 'door', '下層：褲子・裙子'),
              P('hang', 95, 'door', '上層：襯衫・外套'),
              P('shelf', null, 'door', '包包'),
              P('storage', 70, 'door', '上櫃：換季衣物', true),
            ],
          },
          // 外抽屜＋短衣吊掛
          {
            parts: [
              P('drawer', 20, 'drawer', '內衣'),
              P('drawer', 20, 'drawer', '襪子'),
              P('drawer', 20, 'drawer', '運動服・睡衣'),
              P('hang', null, 'door', '襯衫・T 恤'),
              P('shelf', 28, 'door', '摺疊衣物'),
              P('storage', 70, 'door', '上櫃：換季衣物', true),
            ],
          },
          // 下面放大行李箱（獨立短門），上面層板放摺疊衣物
          {
            parts: [
              P('storage', 80, 'door', '28 吋行李箱'),
              P('shelf', null, 'door', '毛衣', true),
              P('shelf', null, 'door', '牛仔褲・長褲'),
              P('shelf', null, 'door', 'T 恤'),
              P('shelf', null, 'door', '包包'),
              P('storage', 70, 'door', '上櫃：登機箱', true),
            ],
          },
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

  // 鞋櫃 80 × 35 × 110：最下層開放放常穿的鞋，最上層一個抽屜放鑰匙、口罩
  shoe: {
    faces: [
      {
        cols: [
          {
            parts: [
              P('shoe', 20, 'open', '常穿的鞋（開放）'),
              P('shoe', 28, 'door', '高筒鞋・雨鞋'),
              P('shoe', null, 'door', '鞋子'),
              P('shoe', null, 'door', '鞋子'),
              P('drawer', 12, 'drawer', '鑰匙・口罩・發票'),
            ],
          },
        ],
      },
    ],
  },

  // 咖啡櫃 100 × 40 × 90：左邊零食、右邊咖啡器具，最上層抽屜放豆子與小物
  coffeebar: {
    faces: [
      {
        cols: [
          { parts: [P('shelf', null, 'door', '零食・泡麵'), P('shelf', null, 'door', '零食'), P('drawer', 15, 'drawer', '咖啡豆・濾紙')] },
          { parts: [P('storage', null, 'door', '手沖壺・磨豆機・馬克杯'), P('drawer', 15, 'drawer', '膠囊・湯匙・糖包')] },
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
          { parts: [P('drawer', null, 'drawer', '抹布・備品'), P('drawer', null, 'drawer', '保鮮膜・夾鏈袋'), P('drawer', null, 'drawer', '餐具')] },
        ],
      },
      { name: '走道側', cols: [{ parts: [P('shelf', null, 'door', '烤盤・大鍋'), P('shelf', null, 'door', '保鮮盒・備品')] }] },
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

  // 矮櫃上方的書櫃 340 × 30 × 210（90 → 300 到頂）：六欄各約 55 淨寬、每層約 32，最上層做門片收不常用的
  sshelf: {
    faces: [
      {
        cols: Array.from({ length: 6 }, () => ({
          parts: [
            P('books', null, 'open'),
            P('books', null, 'open'),
            P('books', null, 'open'),
            P('books', null, 'open'),
            P('books', null, 'open'),
            P('storage', 38, 'door', '不常用的書・紀念品'),
          ],
        })),
      },
    ],
  },
}
