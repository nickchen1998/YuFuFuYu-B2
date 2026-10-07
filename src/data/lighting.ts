// 燈光（方案一：主燈＋明裝軌道，不做假樑）：
//   主燈：廚房餐廳、主臥、次臥各一盞調光調色吸頂燈（type: 'ceilinglight'），遙控切黃光、白光；
//   軌道：明裝磁吸軌道直接鎖在天花板（type: 'surfacetrack'）：客廳兩條各離電視牆、沙發牆 50，直條燈條頭尾相接往牆上打（洗牆）；
//         次臥書桌上方一條短的當工作燈。
// 軌道上的燈頭位置用軌道本身的座標：at = 沿長邊離中心多遠（+x）、toward = 照到地面的位置（相對燈頭 [沿長邊, 往正面]）
//   len = 直條式燈條（可擺角，只往兩側翻）；不填 len = 圓形燈罩投射燈；wash = 洗牆（模擬牆面反射）；
//   height = 照到的那一點離地多高（不填 = 地面，洗牆時填牆上的高度）
//   shadow = 這盞燈算陰影（光會被牆擋住）；顯卡一次能算的陰影有限，只開給光束寬、會漏到隔壁房間的燈

export interface TrackModule {
  at: number
  /** 燈條長度：有填 = 直條式可擺角燈條（只能往兩側翻、朝牆或朝房間），不填 = 圓形燈罩投射燈 */
  len?: number
  /** 光束半角（度）：投射燈不填 = 24°；燈條預設 50° */
  beam?: number
  toward?: [number, number]
  height?: number
  /** 洗牆：光打在牆上、再從牆面反射回房間（模擬時在牆上放一片朝房間的柔光面） */
  wash?: boolean
  shadow?: boolean
  label?: string
}

/** 洗牆燈條：90 公分可擺角燈條，朝背後那面牆、打在離地約 170；一支接一支排，整面牆一條連續的光 */
const WB = (at: number, label: string, len = 90): TrackModule => ({ at, len, beam: 50, toward: [0, -50], height: 170, wash: true, label })

export const trackLayout: Record<string, TrackModule[]> = {
  // 客廳靠電視牆那條（離牆 50、約 4.5 米，從大門那面牆前 10 公分到冰箱過去）：五支 90 燈條頭尾相接，
  // 洗玄關（浴室門那段）、電視牆、主臥門、冰箱那段，玄關和冰箱、主臥門中間都不會暗
  'track-living-l': [WB(180, '玄關（浴室門那段）'), WB(90, '電視牆'), WB(0, '電視牆'), WB(-90, '主臥門那段牆'), WB(-180, '冰箱那段牆')],
  // 客廳靠沙發牆那條（離牆 50、約 3.7 米）：四支 90 燈條頭尾相接，洗沙發牆到咖啡櫃那段
  'track-living-r': [WB(-140, '沙發牆'), WB(-50, '沙發牆'), WB(40, '沙發牆'), WB(130, '咖啡櫃那段牆')],
  // 次臥：書桌上方兩支 60 燈條，往書桌那側翻，各照一張書桌
  'track-study': [
    { at: 60, len: 60, beam: 45, toward: [0, -47], shadow: true, label: '書桌（靠衣櫃）' },
    { at: -60, len: 60, beam: 45, toward: [0, -47], shadow: true, label: '書桌（靠門）' },
  ],
}

/** 燈光模擬的色溫：黃光約 3000K、白光約 6000K（畫面上的顏色是近似值） */
export const LIGHT_COLORS = { warm: '#ffc58a', white: '#f3f6ff' }

/** 燈光模擬的亮度（燈條拆成每 30 公分一個小光源，數字是每個小光源）：
 *  main = 吸頂燈、spot = 投射燈、wash = 洗牆燈條、desk = 書桌燈條、bounce = 牆面反射的柔光面、bar = 感應層板燈 */
export const LAMP_POWER: Record<string, number> = { main: 32, spot: 24, wash: 2.5, desk: 8, bounce: 0.08, bar: 4 }

/** 晚上每個房間的「反射光」：燈光打到牆面、天花板再反射回房間（3D 算不出反射，用一盞柔和的補光代替）；浴室是建商附的燈 */
export const ROOM_FILL: Record<string, number> = { living: 1.5, master: 2, bed2: 2, bath: 5, wc: 5 }

/** 長的房間只在中間放一盞補光，離得遠的角落會比實際暗：客餐廳 665 長，玄關那頭再補一盞（平面座標、亮度） */
export const EXTRA_FILL: { x: number; y: number; power: number }[] = [{ x: 120, y: 80, power: 1.2 }]
