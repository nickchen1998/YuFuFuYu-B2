// 燈光（方案一：每間一盞主燈＋明裝軌道，不做假樑）：
//   主燈：客餐廳、主臥、次臥各一盞調光調色吸頂燈（type: 'ceilinglight'），遙控切黃光、白光；
//   軌道：明裝磁吸軌道直接鎖在天花板（type: 'surfacetrack'），客餐廳一條打重點、次臥書桌上方一條短的當工作燈。
// 軌道上的燈頭位置用軌道本身的座標：at = 沿長邊離中心多遠（+x）、toward = 照到地面的位置（相對燈頭 [沿長邊, 往正面]）
//   spot = 投射燈（光束窄）；line = 排燈（光束寬，往下照）
//   shadow = 這盞燈算陰影（光會被牆擋住）；顯卡一次能算的陰影有限，只開給光束寬、會漏到隔壁房間的燈

export interface TrackModule {
  kind: 'spot' | 'line'
  at: number
  /** 排燈長度 */
  len?: number
  toward?: [number, number]
  shadow?: boolean
  label?: string
}

export const trackLayout: Record<string, TrackModule[]> = {
  // 客餐廳：從玄關到餐桌一條，投射燈打玄關、茶几、咖啡櫃、餐桌、廚房檯面
  'track-living': [
    { kind: 'spot', at: 235, toward: [15, -109], label: '玄關' },
    { kind: 'spot', at: 125, toward: [0, -90], label: '茶几' },
    { kind: 'spot', at: -30, toward: [-15, 53], label: '咖啡櫃' },
    { kind: 'spot', at: -190, toward: [-13, -45], label: '餐桌' },
    { kind: 'spot', at: -245, toward: [-5, -175], label: '廚房檯面' },
  ],
  // 次臥：書桌上方，兩支排燈各照一張書桌
  'track-study': [
    { kind: 'line', at: 60, len: 60, toward: [0, -47], shadow: true, label: '書桌（靠衣櫃）' },
    { kind: 'line', at: -60, len: 60, toward: [0, -47], shadow: true, label: '書桌（靠門）' },
  ],
}

/** 燈光模擬的色溫：黃光約 3000K、白光約 6000K（畫面上的顏色是近似值） */
export const LIGHT_COLORS = { warm: '#ffc58a', white: '#f3f6ff' }

/** 燈光模擬的亮度：main = 吸頂燈、spot = 投射燈、line = 排燈 */
export const LAMP_POWER: Record<string, number> = { main: 32, spot: 26, line: 18 }

/** 晚上每個房間的「反射光」：燈光打到牆面、天花板再反射回房間（3D 算不出反射，用一盞柔和的補光代替）；浴室是建商附的燈 */
export const ROOM_FILL: Record<string, number> = { living: 2.5, master: 2, bed2: 2, bath: 5, wc: 5 }
