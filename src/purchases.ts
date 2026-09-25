import { reactive, watch } from 'vue'

// 勾選要買的商品（和設計分開存，還原家具擺設時不會被清掉）。
// key = `${群組}|${商品名稱}`；沒動過的商品用預設（推薦的 rec 商品預設勾選），動過的記住 true／false。

const KEY = 'my-house-b2-purchases-v2'

function load(): Record<string, boolean> {
  try {
    const raw = localStorage.getItem(KEY)
    const v = raw ? JSON.parse(raw) : null
    return v && typeof v === 'object' ? v : {}
  } catch {
    return {}
  }
}

export const purchases = reactive<{ state: Record<string, boolean> }>({ state: load() })

watch(
  purchases,
  () => {
    try {
      localStorage.setItem(KEY, JSON.stringify(purchases.state))
    } catch {
      /* 存不了就算了 */
    }
  },
  { deep: true },
)

export const pickKey = (group: string, name: string) => `${group}|${name}`
export const isPicked = (key: string, rec = false) => (key in purchases.state ? purchases.state[key] : rec)
export function togglePick(key: string, rec = false) {
  purchases.state[key] = !isPicked(key, rec)
}
/** 全部回到推薦的預設 */
export function resetPicks() {
  for (const k of Object.keys(purchases.state)) delete purchases.state[k]
}
