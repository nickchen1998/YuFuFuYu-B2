// 燈光：天花板假樑裡的嵌入式磁吸軌道，以及軌道上的燈頭（無主燈、不用崁燈）。
// 每條軌道對應一件「假樑」家具（type: 'ceilingband'），燈頭位置用假樑本身的座標：
//   at = 沿長邊離中心多遠（+x）、toward = 投射燈照到地面的位置（相對燈頭，[沿長邊, 往正面]），不填 = 正下方

export interface TrackModule {
  /** line = 廣角排燈（整體照明）、spot = 投射燈（打在餐桌、櫃子、牆面） */
  kind: 'line' | 'spot'
  at: number
  /** 排燈長度 */
  len?: number
  toward?: [number, number]
  label?: string
}

export const trackModules: Record<string, TrackModule[]> = {
  // 客餐廳左側假樑（沿電視、廚房那面牆，順便包客廳冷氣管）：玄關投射燈、廚房檯面上方兩支排燈
  'clg-living-l': [
    { kind: 'spot', at: 272.5, toward: [0, 86], label: '玄關' },
    { kind: 'line', at: -169.5, len: 60, label: '水槽上方' },
    { kind: 'line', at: -277.5, len: 60, label: '爐台上方' },
  ],
  // 客餐廳中間假樑（從大門前一路到窗邊）：沙發、茶几兩支排燈，餐桌一支排燈，玄關、咖啡櫃、中島檯面三盞投射燈
  'clg-living-c': [
    { kind: 'spot', at: 282.5, toward: [40, 50], label: '鞋櫃' },
    { kind: 'line', at: 202.5, len: 60, label: '客廳' },
    { kind: 'line', at: 112.5, len: 60, label: '客廳' },
    { kind: 'spot', at: -2.5, toward: [0, 118], label: '咖啡櫃' },
    { kind: 'line', at: -160.5, len: 60, label: '餐桌' },
    { kind: 'spot', at: -257.5, label: '中島檯面' },
  ],
  // 主臥假樑（衣櫃上櫃門打開的範圍外、床邊走道上方）：衣櫃前、床尾走道兩支排燈，一盞投射燈打衣櫃開放格
  'clg-master': [
    { kind: 'line', at: -68.25, len: 60, label: '衣櫃前' },
    { kind: 'spot', at: -15.25, toward: [0, -77], label: '衣櫃開放格' },
    { kind: 'line', at: 84.75, len: 60, label: '床尾走道' },
  ],
  // 次臥假樑（書桌前緣上方，光從前上方來，螢幕不反光）：兩張書桌各一支排燈，投射燈打衣櫃和背後層板
  'clg-study': [
    { kind: 'spot', at: 188, toward: [60, 61], label: '衣櫃' },
    { kind: 'line', at: 46, len: 60, label: '書桌（靠衣櫃）' },
    { kind: 'spot', at: -32, toward: [0, 168], label: '背後層板' },
    { kind: 'line', at: -74, len: 60, label: '書桌（靠門）' },
  ],
}

/** 燈光模擬的色溫：黃光約 3000K、白光約 6000K（畫面上的顏色是近似值） */
export const LIGHT_COLORS = { warm: '#ffc58a', white: '#f3f6ff' }
