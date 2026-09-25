<script setup lang="ts">
import { AirVent, DoorClosed, DoorOpen, Keyboard, Layers, LayoutPanelTop, Magnet, Map as MapIcon, Tag } from '@lucide/vue'
import { design, ui } from '../store'

const cuts = [
  { label: '完整', value: () => design.ceilingHeight },
  { label: '150', value: () => 150 },
  { label: '90', value: () => 90 },
]

const keys: { k: string[]; t: string }[] = [
  { k: ['V'], t: '選取工具' },
  { k: ['M'], t: '移動工具' },
  { k: ['R'], t: '旋轉 90°（Shift 反向）' },
  { k: ['Q', 'E'], t: '微轉 15°' },
  { k: ['↑', '↓', '←', '→'], t: '微調 1 公分（Shift × 10）' },
  { k: ['Delete'], t: '刪除家具' },
  { k: ['Esc'], t: '取消選取、清除量尺' },
  { k: ['⌘', 'Z'], t: '上一步' },
  { k: ['⌘', '⇧', 'Z'], t: '下一步' },
]
</script>

<template>
  <section class="section">
    <div class="section-head">
      <h3><Layers />牆高切面</h3>
      <span class="value-chip">{{ Math.min(ui.wallCut, design.ceilingHeight) }} cm</span>
    </div>
    <input v-model.number="ui.wallCut" type="range" min="40" :max="design.ceilingHeight" step="5" />
    <div class="seg full sm" style="margin-top: 10px">
      <button
        v-for="c in cuts"
        :key="c.label"
        :class="{ on: Math.min(ui.wallCut, design.ceilingHeight) === c.value() }"
        @click="ui.wallCut = c.value()"
      >
        {{ c.label }}
      </button>
    </div>
    <p class="muted">把牆切矮一點，從上面看比較好擺家具；室內漫遊時一律顯示完整牆高。</p>
  </section>

  <section class="section">
    <div class="section-head"><h3><Tag />顯示</h3></div>
    <label class="switch-row">
      <span><Tag />房間名稱與坪數</span>
      <input v-model="ui.showLabels" type="checkbox" class="switch" />
    </label>
    <label class="switch-row">
      <span><DoorOpen />室內門打開</span>
      <input v-model="ui.doorsOpen" type="checkbox" class="switch" />
    </label>
    <label class="switch-row">
      <span><DoorClosed />大門打開</span>
      <input v-model="ui.mainDoorOpen" type="checkbox" class="switch" />
    </label>
    <label class="switch-row">
      <span><AirVent />冷氣出風、投影光線示意</span>
      <input v-model="ui.showAirflow" type="checkbox" class="switch" />
    </label>
    <label class="switch-row">
      <span><LayoutPanelTop />打開所有櫃門（看櫃內）</span>
      <input v-model="ui.openAllCabinets" type="checkbox" class="switch" />
    </label>
    <label class="switch-row">
      <span><MapIcon />疊上原始平面圖</span>
      <input v-model="ui.showOverlay" type="checkbox" class="switch" />
    </label>
    <div v-if="ui.showOverlay" class="field" style="margin-top: 4px">
      <span>疊圖透明度</span>
      <input v-model.number="ui.overlayOpacity" type="range" min="0.1" max="1" step="0.05" />
    </div>
    <p class="muted">
      切到「平面俯視」再疊圖，可以檢查模型和原圖對不對得上。
      <template v-if="design.mirrored">A6・B6 模式下疊圖是 B2 平面圖上下翻轉，圖上的字會是反的。</template>
    </p>
  </section>

  <section class="section">
    <div class="section-head">
      <h3><Magnet />拖曳對齊</h3>
    </div>
    <div class="seg full sm">
      <button v-for="s in [1, 5, 10]" :key="s" :class="{ on: ui.snap === s }" @click="ui.snap = s">每 {{ s }} cm</button>
    </div>
    <p class="muted">靠近牆 12 公分內會自動貼齊；拖曳時按住 Alt 可以自由移動。</p>
  </section>

  <section class="section">
    <div class="section-head"><h3><Keyboard />快捷鍵</h3></div>
    <dl class="keys">
      <template v-for="row in keys" :key="row.t">
        <dt><kbd v-for="k in row.k" :key="k">{{ k }}</kbd></dt>
        <dd>{{ row.t }}</dd>
      </template>
    </dl>
    <p class="muted">Windows 請把 ⌘ 換成 Ctrl。</p>
  </section>
</template>
