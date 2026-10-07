// 燈光（方案一：主燈＋明裝軌道，不做假樑）：
//   主燈：廚房餐廳、主臥、次臥各一盞調光調色吸頂燈（type: 'ceilinglight'），遙控切黃光、白光；
//   軌道：明裝磁吸軌道直接鎖在天花板（type: 'surfacetrack'）：客廳兩條各離電視牆、沙發牆 50，廣角投射燈往牆上打（洗牆）；
//         次臥書桌上方一條短的當工作燈。
// 軌道上的燈頭位置用軌道本身的座標：at = 沿長邊離中心多遠（+x）、toward = 照到地面的位置（相對燈頭 [沿長邊, 往正面]）
//   投射燈（筒型燈罩，可以轉角度）：beam = 光束半角（度，不填 = 24°；洗牆用 36° 廣角）；
//   height = 照到的那一點離地多高（不填 = 地面，洗牆時填牆上的高度）
//   shadow = 這盞燈算陰影（光會被牆擋住）；顯卡一次能算的陰影有限，只開給光束寬、會漏到隔壁房間的燈

export interface TrackModule {
  at: number
  /** 光束半角（度）：不填 = 24°（重點照明）；36° = 廣角（洗牆、照書桌） */
  beam?: number
  toward?: [number, number]
  height?: number
  shadow?: boolean
  label?: string
}

export const trackLayout: Record<string, TrackModule[]> = {
  // 客廳靠電視牆那條（離牆 50）：兩盞廣角投射燈往牆上打（電視牆、主臥門那段），牆後是主臥和浴室，要算陰影；
  // 靠玄關那端兩盞廣角：洗大門那面牆、打玄關地面，進門整個玄關都亮（這條共四盞）
  'track-living-l': [
    { at: 170, beam: 36, toward: [50, 56], height: 100, label: '大門那面牆' },
    { at: 150, beam: 36, toward: [10, 56], label: '玄關地面' },
    { at: 35, beam: 36, toward: [0, -50], height: 100, shadow: true, label: '電視牆' },
    { at: -110, beam: 36, toward: [0, -50], height: 100, shadow: true, label: '主臥門那段牆' },
  ],
  // 客廳靠沙發牆那條（離牆 50）：兩盞廣角投射燈往牆上打（沙發牆、咖啡櫃那段），牆後是次臥，要算陰影；
  // 一盞打茶几、一盞從靠玄關那端斜打鞋櫃和玄關
  'track-living-r': [
    { at: -165, beam: 36, toward: [-30, 38], height: 60, label: '玄關、鞋櫃' },
    { at: -85, beam: 36, toward: [0, -50], height: 100, shadow: true, label: '沙發牆' },
    { at: -50, toward: [0, 113], label: '茶几' },
    { at: 95, beam: 36, toward: [0, -50], height: 100, shadow: true, label: '咖啡櫃那段牆' },
  ],
  // 次臥：書桌上方，兩盞廣角投射燈各照一張書桌
  'track-study': [
    { at: 60, beam: 36, toward: [0, -47], shadow: true, label: '書桌（靠衣櫃）' },
    { at: -60, beam: 36, toward: [0, -47], shadow: true, label: '書桌（靠門）' },
  ],
}

/** 燈光模擬的色溫：黃光約 3000K、白光約 6000K（畫面上的顏色是近似值） */
export const LIGHT_COLORS = { warm: '#ffc58a', white: '#f3f6ff' }

/** 燈光模擬的亮度：main = 吸頂燈、spot = 投射燈（窄光束）、wide = 廣角投射燈、bar = 感應層板燈 */
export const LAMP_POWER: Record<string, number> = { main: 32, spot: 26, wide: 22, bar: 4 }

/** 晚上每個房間的「反射光」：燈光打到牆面、天花板再反射回房間（3D 算不出反射，用一盞柔和的補光代替）；浴室是建商附的燈 */
export const ROOM_FILL: Record<string, number> = { living: 2.5, master: 2, bed2: 2, bath: 5, wc: 5 }

/** 長的房間只在中間放一盞補光，離得遠的角落會比實際暗：客餐廳 665 長，玄關那頭再補一盞（平面座標、亮度） */
export const EXTRA_FILL: { x: number; y: number; power: number }[] = [{ x: 120, y: 80, power: 2 }]
