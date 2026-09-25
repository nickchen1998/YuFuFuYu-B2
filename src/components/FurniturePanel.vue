<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import {
  ArrowLeft, ChevronRight, ExternalLink, LayoutPanelTop, Layers, Lightbulb, MapPin, Phone, Ruler, Search, ShoppingBag, Store,
  TriangleAlert,
} from '@lucide/vue'
import { design, ui } from '../store'
import type { FurnitureItem } from '../types'
import { rooms } from '../data/house'
import { roomAt } from '../geometry'
import { furnitureIcon } from './icons'
import {
  cabinetFrame, faceDepths, frontKinds, hasInterior, interiorOf, interiorStats, interiorWarnings, layoutFace, partKind,
} from '../cabinet'
import {
  cabinetMaterials, cabinetSearch, cabinetVendors, googleUrl, itemCategory, momoUrl, pchomeUrl, shopInfo, type ShopVendor,
} from '../data/shopping'
import CabinetElevation from './CabinetElevation.vue'

// 右側「家具清單」：只列出目前擺放的家具（新增、移除、調整都由住戶告訴 Claude 處理），
// 點進去看尺寸規格、櫃內格局、板材、建議商品與廠商。

const fmt = (n: number) => String(Math.round(n * 10) / 10)

const selected = computed(() => design.furniture.find((f) => f.id === ui.selectedId))
const roomName = (x: number, y: number) => roomAt(x, y)?.name ?? '室外'
const selectedRoom = computed(() => (selected.value ? roomName(selected.value.x, selected.value.y) : ''))

/** 依房間分組；同名同尺寸的家具合成一列（例如 餐椅 ×4） */
const grouped = computed(() => {
  const names = [...rooms.map((r) => r.name), '室外']
  const out = names.map((room) => ({ room, rows: [] as { it: FurnitureItem; count: number; key: string }[] }))
  for (const it of design.furniture) {
    const g = out.find((x) => x.room === roomName(it.x, it.y))!
    const key = `${it.type}|${it.name}|${it.w}|${it.d}|${it.h}`
    const row = g.rows.find((r) => r.key === key)
    if (row) row.count++
    else g.rows.push({ it, count: 1, key })
  }
  return out.filter((g) => g.rows.length)
})

const info = computed(() => (selected.value ? shopInfo(selected.value) : undefined))
const category = computed(() => (selected.value ? itemCategory(selected.value) : ''))
const custom = computed(() => category.value === '系統櫃' || category.value === '訂製')

/** 家具上的配備（唯讀） */
const featureNames: Record<string, string> = {
  dishdryer: '烘碗機（建商附，水槽上方吊櫃下半）',
  dishwasher: '45 cm 嵌入式洗碗機（水槽旁，需改櫃）',
  microwave: '嵌入微波爐',
  tableout: '抽拉式餐桌',
  outlets: '雙連三孔插座 ×2：餐桌外端牙板、靠窗檯面平面嵌入',
}
const features = computed(() => (selected.value?.features ?? []).map((f) => featureNames[f] ?? f))

// ───────────────────────── 櫃內格局 ─────────────────────────

const faceIdx = ref(0)
watch(
  () => ui.selectedId,
  () => (faceIdx.value = 0),
)
const isCab = computed(() => !!selected.value && hasInterior(selected.value))
const inter = computed(() => (selected.value && isCab.value ? interiorOf(selected.value) : null))
const fi = computed(() => Math.min(faceIdx.value, (inter.value?.faces.length ?? 1) - 1))
const frame = computed(() => (selected.value && isCab.value ? cabinetFrame(selected.value) : null))
const depth = computed(() => (selected.value && inter.value ? faceDepths(selected.value, inter.value)[fi.value] : null))

const stats = computed(() => {
  if (!selected.value || !inter.value) return []
  const s = interiorStats(inter.value, selected.value)
  const out: string[] = []
  if (s.rod) out.push(`吊衣桿 ${Math.round(s.rod)} 公分（約 ${Math.round(s.rod / 3)} 件）`)
  if (s.pullrods) out.push(`前後拉桿 ${s.pullrods} 支`)
  if (s.drawers) out.push(`抽屜 ${s.drawers} 個`)
  if (s.shelves) out.push(`層板 ${s.shelves} 層`)
  if (s.shoes) out.push(`鞋子約 ${s.shoes} 雙`)
  if (s.books) out.push(`書約 ${s.books} 本`)
  if (s.pants) out.push(`褲架 ${s.pants} 組`)
  if (s.doors) out.push(`門片 ${s.doors} 扇`)
  return out
})
const warnings = computed(() => (selected.value && isCab.value ? interiorWarnings(selected.value, !!design.mirrored) : []))

/** 逐格清單：欄照畫面由左到右、格由上到下 */
const columns = computed(() => {
  const fr = frame.value
  const f = inter.value?.faces[fi.value]
  if (!fr || !f) return []
  const cols = layoutFace(f, fr.innerW, fr.innerH).cols.map((c) => ({
    w: c.w,
    parts: [...c.parts].reverse().map((p) => ({
      name: p.part.label || partKind(p.part.kind).name,
      kind: partKind(p.part.kind).name,
      color: partKind(p.part.kind).color,
      h: p.h,
      front: frontKinds.find((k) => k.id === p.part.front)?.name ?? '',
      split: !!p.part.split,
    })),
  }))
  return design.mirrored ? cols.reverse() : cols
})

// ───────────────────────── 購買資訊 ─────────────────────────

const searchTerms = computed(() => {
  if (!selected.value) return []
  if (custom.value) return info.value?.search?.length ? info.value.search : cabinetSearch
  return info.value?.search?.length ? info.value.search : [selected.value.name.replace(/（.*?）/g, '')]
})
const vendors = computed<ShopVendor[]>(() => [...(info.value?.vendors ?? []), ...(custom.value ? cabinetVendors : [])])
const hasShared = computed(() => custom.value && !!(cabinetMaterials.boards?.length || cabinetMaterials.hardware?.length))
</script>

<template>
  <!-- 家具詳細資料 -->
  <section v-if="selected" class="detail">
    <button class="back-btn" @click="ui.selectedId = null"><ArrowLeft />全部家具</button>

    <div class="detail-head">
      <span class="detail-icon"><component :is="furnitureIcon(selected.type)" /></span>
      <div class="detail-title">
        <h2>{{ selected.name }}</h2>
        <div class="item-meta">
          <span class="meta-chip"><MapPin />{{ selectedRoom }}</span>
          <span class="meta-chip cat" :data-cat="category">{{ category }}</span>
        </div>
      </div>
    </div>
    <p v-if="info?.summary" class="detail-summary">{{ info.summary }}</p>

    <div class="detail-sec">
      <h3><Ruler />尺寸規格</h3>
      <div class="spec-grid">
        <div><span>寬</span><b>{{ fmt(selected.w) }}</b></div>
        <div><span>深</span><b>{{ fmt(selected.d) }}</b></div>
        <div><span>高</span><b>{{ fmt(selected.h) }}</b></div>
        <div v-if="selected.elev"><span>離地</span><b>{{ fmt(selected.elev) }}</b></div>
      </div>
      <p class="muted tight">單位：公分。</p>
      <ul v-if="features.length || info?.specs?.length" class="bullets">
        <li v-for="f in features" :key="f">配備：{{ f }}</li>
        <li v-for="s in info?.specs ?? []" :key="s">{{ s }}</li>
      </ul>
    </div>

    <!-- 櫃內格局 -->
    <div v-if="isCab && inter && frame" class="detail-sec">
      <div class="sec-head">
        <h3><LayoutPanelTop />櫃內格局</h3>
        <label class="cab-toggle" title="在 3D 畫面裡把這個櫃子的門片拿掉，看得到裡面">
          <input v-model="ui.cabinetOpen" type="checkbox" class="switch" />3D 打開櫃門
        </label>
      </div>
      <div v-if="inter.faces.length > 1" class="seg full sm face-tabs">
        <button v-for="(f, i) in inter.faces" :key="i" :class="{ on: fi === i }" @click="faceIdx = i">
          {{ f.name ?? `第 ${i + 1} 面` }}
        </button>
      </div>
      <p class="muted tight">
        內部淨寬 {{ fmt(frame.innerW) }}・淨高 {{ fmt(frame.innerH) }}・淨深 {{ fmt(depth?.clear ?? 0) }}
        <template v-if="selected.type === 'peninsula'">（只畫收納段）</template>
      </p>
      <CabinetElevation :item="selected" :face="fi" />
      <p class="muted tight">虛線是門片（三角形尖端是鉸鏈那一邊）、短橫線是抽屜把手；格子裡的數字是淨高。</p>
      <div v-if="stats.length" class="cab-stats">
        <span v-for="s in stats" :key="s" class="stat">{{ s }}</span>
      </div>
      <div v-if="warnings.length" class="cab-warn">
        <p v-for="w in warnings" :key="w"><TriangleAlert />{{ w }}</p>
      </div>
      <details class="parts-list">
        <summary><ChevronRight class="chev" />逐格清單</summary>
        <div v-for="(c, ci) in columns" :key="ci" class="parts-col">
          <b>第 {{ ci + 1 }} 欄・淨寬 {{ fmt(c.w) }}</b>
          <div v-for="(p, pi) in c.parts" :key="pi" class="parts-row">
            <i :style="{ background: p.color }"></i>
            <span>{{ p.name }}</span>
            <small>{{ p.kind }}・{{ fmt(p.h) }}・{{ p.front }}{{ p.split ? '（另一扇門）' : '' }}</small>
          </div>
        </div>
      </details>
    </div>

    <!-- 板材與五金 -->
    <div v-if="info?.material?.length || hasShared" class="detail-sec">
      <h3><Layers />板材與五金</h3>
      <ul v-if="info?.material?.length" class="bullets">
        <li v-for="m in info.material" :key="m">{{ m }}</li>
      </ul>
      <details v-if="hasShared" class="more">
        <summary><ChevronRight class="chev" />系統櫃通用建議</summary>
        <p v-if="cabinetMaterials.summary" class="muted tight">{{ cabinetMaterials.summary }}</p>
        <template
          v-for="g in [
            { t: '板材', l: cabinetMaterials.boards },
            { t: '門片', l: cabinetMaterials.doors },
            { t: '五金', l: cabinetMaterials.hardware },
            { t: '價格', l: cabinetMaterials.prices },
            { t: '驗收', l: cabinetMaterials.checks },
          ]"
          :key="g.t"
        >
          <template v-if="g.l?.length">
            <p class="sublabel">{{ g.t }}</p>
            <ul class="bullets">
              <li v-for="x in g.l" :key="x">{{ x }}</li>
            </ul>
          </template>
        </template>
      </details>
    </div>

    <!-- 建議商品 -->
    <div v-if="info?.picks?.length" class="detail-sec">
      <h3><ShoppingBag />建議商品</h3>
      <component
        :is="p.url ? 'a' : 'div'"
        v-for="p in info.picks"
        :key="p.name"
        class="pick"
        :href="p.url"
        :target="p.url ? '_blank' : undefined"
        :rel="p.url ? 'noopener noreferrer' : undefined"
      >
        <b>{{ p.name }}</b>
        <small v-if="p.detail">{{ p.detail }}</small>
        <span class="pick-foot">
          <em>{{ p.price ?? '價格請以通路為準' }}</em>
          <span v-if="p.url" class="pick-link">{{ p.source ?? '查看' }}<ExternalLink /></span>
        </span>
      </component>
    </div>

    <!-- 搜尋 -->
    <div v-if="searchTerms.length" class="detail-sec">
      <h3><Search />{{ custom ? '搜尋廠商' : '到電商搜尋' }}</h3>
      <div v-for="k in searchTerms" :key="k" class="search-row">
        <span>{{ k }}</span>
        <template v-if="custom">
          <a class="chip" :href="googleUrl(k)" target="_blank" rel="noopener noreferrer">Google</a>
        </template>
        <template v-else>
          <a class="chip" :href="pchomeUrl(k)" target="_blank" rel="noopener noreferrer">PChome</a>
          <a class="chip" :href="momoUrl(k)" target="_blank" rel="noopener noreferrer">momo</a>
        </template>
      </div>
    </div>

    <!-- 廠商 -->
    <div v-if="vendors.length" class="detail-sec">
      <h3><Store />廠商</h3>
      <div v-for="v in vendors" :key="v.name" class="vendor">
        <b>{{ v.name }}</b>
        <small v-if="v.detail">{{ v.detail }}</small>
        <div v-if="v.phone || v.url" class="vendor-links">
          <a v-if="v.phone" :href="`tel:${v.phone.replace(/[^\d+]/g, '')}`"><Phone />{{ v.phone }}</a>
          <a v-if="v.url" :href="v.url" target="_blank" rel="noopener noreferrer"><ExternalLink />網站</a>
        </div>
      </div>
    </div>

    <div v-if="info?.notes?.length" class="detail-sec">
      <h3><Lightbulb />注意事項</h3>
      <ul class="bullets">
        <li v-for="n in info.notes" :key="n">{{ n }}</li>
      </ul>
    </div>

    <p v-if="!info" class="muted">這件的選購資料還在整理中。</p>
    <p class="muted detail-foot">要新增、移除或調整這件家具，直接跟我說。</p>
  </section>

  <!-- 家具清單 -->
  <div v-else class="fl">
    <section v-for="g in grouped" :key="g.room" class="fl-room">
      <h3>{{ g.room }}</h3>
      <button v-for="r in g.rows" :key="r.it.id" class="fl-item" @click="ui.selectedId = r.it.id">
        <span class="fl-icon"><component :is="furnitureIcon(r.it.type)" /></span>
        <span class="fl-text">
          <b>{{ r.it.name }}<i v-if="r.count > 1"> ×{{ r.count }}</i></b>
          <small>{{ fmt(r.it.w) }} × {{ fmt(r.it.d) }} × {{ fmt(r.it.h) }} 公分</small>
        </span>
        <em class="cat-tag" :data-cat="itemCategory(r.it)">{{ itemCategory(r.it) }}</em>
        <ChevronRight class="fl-go" />
      </button>
    </section>
    <p class="fl-hint">點一件家具（或直接點 3D 畫面）看尺寸、櫃內格局和建議商品。要新增、移除或調整，直接跟我說。</p>
  </div>
</template>
