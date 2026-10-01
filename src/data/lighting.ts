// 天花板燈光規劃（平面座標，公分）：只放嵌燈和間接燈溝，不用吸頂燈、吊燈這類燈飾。
// 給 'lightplan' 家具畫 3D（座標換成相對於那件家具的中心）

export interface Downlight {
  x: number
  y: number
  label: string
}
export interface Cove {
  /** 燈溝沿著牆：起點、終點（平面座標），光往 side 那側的牆打 */
  x1: number
  y1: number
  x2: number
  y2: number
  label: string
}
export interface LightPlan {
  downlights: Downlight[]
  coves: Cove[]
}

/** 客餐廳・廚房（288 × 665）：兩面長牆＋窗簾盒做懸浮燈溝當整體柔光，8 盞深杯防眩嵌燈補功能照明 */
export const livingLights: LightPlan = {
  downlights: [
    { x: 95, y: 55, label: '玄關' },
    { x: 125, y: 150, label: '茶几區' },
    { x: 125, y: 220, label: '茶几區' },
    { x: 262, y: 355, label: '咖啡櫃檯面' },
    { x: 170, y: 510, label: '餐桌' },
    { x: 170, y: 550, label: '餐桌' },
    { x: 85, y: 500, label: '廚房（水槽前）' },
    { x: 85, y: 615, label: '廚房（瓦斯爐前）' },
  ],
  coves: [
    { x1: 0, y1: 15, x2: 0, y2: 650, label: '電視牆、冰箱、廚房那面長牆' },
    { x1: 288, y1: 15, x2: 288, y2: 650, label: '沙發、咖啡櫃那面長牆' },
    { x1: 15, y1: 665, x2: 273, y2: 665, label: '窗簾盒' },
  ],
}

export const lightPlans: Record<string, LightPlan> = { livinglights: livingLights }

/** 燈溝總長（公尺） */
export const coveLength = (p: LightPlan) =>
  Math.round(p.coves.reduce((s, c) => s + Math.hypot(c.x2 - c.x1, c.y2 - c.y1), 0) / 10) / 10
