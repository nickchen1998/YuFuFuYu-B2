// 燈光（方案 B：無主燈、不用崁燈）：沿著牆四周做假樑，嵌入式磁吸軌道離牆約 35，燈往牆上打（洗牆），
// 牆面亮起來、光再反射回房間，整個家平均被照亮。
// 每道假樑是一件家具（type: 'ceilingband'），背面（-z）貼牆、正面朝房間；燈頭位置用假樑本身的座標：
//   at = 沿長邊離中心多遠（+x）；z = 軌道離假樑中線多遠（+ 往房間）
//   wash = 洗牆排燈：照向背後那面牆、離地約 100 的地方；spot = 投射燈：照向 toward（相對燈頭 [沿長邊, 往房間]）的地面
//   shadow = 這盞燈算陰影（光會被牆擋住）：只開給照向室內隔間牆的洗牆燈，不然光會穿過牆漏到隔壁房間；
//   顯卡一次能算的陰影有限（貼圖單元多半只有 16 個），照向外牆、窗戶、分戶牆的不用算

export interface TrackModule {
  kind: 'wash' | 'spot'
  at: number
  /** 排燈長度 */
  len?: number
  toward?: [number, number]
  shadow?: boolean
  label?: string
}

export interface TrackLayout {
  /** 軌道離假樑中線多遠（+ 往房間）；假樑深 45、軌道離牆 35 → 12.5 */
  z: number
  modules: TrackModule[]
}

const Z = 12.5

export const trackLayout: Record<string, TrackLayout> = {
  // ── 客餐廳 ──
  // 左側（電視、冰箱、廚房那面牆，順便包客廳冷氣管）：三支洗牆排燈，牆後是主臥和浴室，要算陰影
  'clg-living-l': {
    z: Z,
    modules: [
      { kind: 'wash', at: 182.5, len: 90, shadow: true, label: '電視牆' },
      { kind: 'wash', at: -27.5, len: 90, shadow: true, label: '冰箱、主臥門那段' },
      { kind: 'wash', at: -227.5, len: 90, shadow: true, label: '廚房牆' },
    ],
  },
  // 右側（沙發、咖啡櫃那面牆，牆後是次臥）：三支洗牆排燈，加一盞投射燈打餐桌
  'clg-living-r': {
    z: Z,
    modules: [
      { kind: 'wash', at: -202.5, len: 90, shadow: true, label: '沙發牆' },
      { kind: 'wash', at: 7.5, len: 90, shadow: true, label: '咖啡櫃牆' },
      { kind: 'spot', at: 160.5, toward: [0, 83], label: '餐桌' },
      { kind: 'wash', at: 227.5, len: 90, shadow: true, label: '次臥門、陽台門那段' },
    ],
  },
  // 窗戶那面（窗簾盒上方）：一支長排燈洗窗簾
  'clg-living-b': { z: Z, modules: [{ kind: 'wash', at: 0, len: 120, label: '窗簾' }] },
  // 大門上方（大門到冷氣之間，客廳冷氣管從這裡接到左側假樑）：一盞投射燈打玄關地面
  'clg-living-t': { z: Z, modules: [{ kind: 'spot', at: 0, toward: [13.5, 67.5], label: '玄關' }] },

  // ── 主臥 ──
  // 半套衛浴那面牆（衣櫃右邊到房門那段）
  'clg-master-t': { z: Z, modules: [{ kind: 'wash', at: 0, len: 90, label: '衛浴門那面牆' }] },
  // 床頭那面牆（外牆）：兩支洗牆排燈，床頭牆亮起來，躺著不會直視燈
  'clg-master-l': {
    z: Z,
    modules: [
      { kind: 'wash', at: 60.75, len: 90, label: '床頭牆' },
      { kind: 'wash', at: -59.25, len: 90, label: '床頭牆' },
    ],
  },
  // 床尾那面牆（房門、投影那面，牆後是客廳）：兩支洗牆排燈，要算陰影
  'clg-master-r': {
    z: Z,
    modules: [
      { kind: 'wash', at: -72.25, len: 90, shadow: true, label: '房門那段' },
      { kind: 'wash', at: 77.75, len: 90, shadow: true, label: '床尾牆' },
    ],
  },

  // ── 次臥 ──
  // 書桌那面牆（客廳隔間）：三支洗牆排燈，桌面和牆一起亮，要算陰影
  'clg-study-l': {
    z: Z,
    modules: [
      { kind: 'wash', at: 158, len: 90, shadow: true, label: '靠衣櫃那段' },
      { kind: 'wash', at: 8, len: 90, shadow: true, label: '書桌（靠衣櫃）' },
      { kind: 'wash', at: -142, len: 90, shadow: true, label: '書桌（靠門）' },
    ],
  },
  // 分戶牆（按摩椅、矮櫃、層板那面）：三支洗牆排燈，層板就是視訊背景
  'clg-study-r': {
    z: Z,
    modules: [
      { kind: 'wash', at: -143.5, len: 90, label: '按摩椅' },
      { kind: 'wash', at: 46.5, len: 90, label: '層板（視訊背景）' },
      { kind: 'wash', at: 176.5, len: 90, label: '矮櫃靠窗那段' },
    ],
  },
  // 窗戶那面（冷氣左邊）：一支排燈洗窗簾
  'clg-study-b': { z: Z, modules: [{ kind: 'wash', at: 0, len: 60, label: '窗簾' }] },
}

/** 燈光模擬的色溫：黃光約 3000K、白光約 6000K（畫面上的顏色是近似值） */
export const LIGHT_COLORS = { warm: '#ffc58a', white: '#f3f6ff' }

/** 晚上每個房間的「反射光」：洗牆的光從牆面反射回房間（3D 算不出反射，用一盞柔和的補光代替）；浴室是建商附的燈 */
export const ROOM_FILL: Record<string, number> = { living: 4, master: 3.5, bed2: 3.5, bath: 5, wc: 5 }
