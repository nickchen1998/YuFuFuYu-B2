<script setup lang="ts">
import { design, ui } from '../store'
import { rooms } from '../data/house'
import { viewerRef } from '../viewerRef'
</script>

<template>
  <section v-if="ui.mode === 'walk'" class="card">
    <header><h3>瞬間移動到…</h3></header>
    <div class="chips wrap">
      <button v-for="r in rooms.filter((x) => x.id !== 'ac')" :key="r.id" @click="viewerRef.current?.teleport(r.id)">
        {{ r.name }}
      </button>
    </div>
    <p class="hint">W A S D 或方向鍵移動，拖曳滑鼠轉頭，按住 Shift 走快一點。</p>
  </section>

  <section class="card">
    <header><h3>牆面</h3></header>
    <label class="slider">
      <span>牆高切面 <b>{{ Math.min(ui.wallCut, design.ceilingHeight) }} cm</b></span>
      <input v-model.number="ui.wallCut" type="range" min="40" :max="design.ceilingHeight" step="5" />
    </label>
    <div class="row tight">
      <button @click="ui.wallCut = design.ceilingHeight">完整牆高</button>
      <button @click="ui.wallCut = 150">切到 150</button>
      <button @click="ui.wallCut = 90">切到 90</button>
    </div>
    <p class="hint">把牆切矮一點，從上面看比較好擺家具（漫遊模式一律顯示完整牆高）。</p>
    <label class="check"><input v-model="ui.doorsOpen" type="checkbox" /> 門打開</label>
  </section>

  <section class="card">
    <header><h3>標示與對照</h3></header>
    <label class="check"><input v-model="ui.showLabels" type="checkbox" /> 顯示房間名稱與坪數</label>
    <label class="check"><input v-model="ui.showOverlay" type="checkbox" /> 疊上原始平面圖（紅線）</label>
    <label v-if="ui.showOverlay" class="slider">
      <span>透明度</span>
      <input v-model.number="ui.overlayOpacity" type="range" min="0.1" max="1" step="0.05" />
    </label>
    <p class="hint">用「平面俯視」＋疊圖可以檢查模型和原圖是否對得上。</p>
  </section>

  <section class="card">
    <header><h3>拖曳對齊</h3></header>
    <div class="chips">
      <button v-for="s in [1, 5, 10]" :key="s" :class="{ on: ui.snap === s }" @click="ui.snap = s">{{ s }} cm</button>
    </div>
    <p class="hint">靠近牆 12 公分內會自動貼齊；按住 Alt 拖曳可自由移動。</p>
  </section>

  <section class="card keys">
    <header><h3>快捷鍵</h3></header>
    <dl>
      <dt>R / Shift+R</dt><dd>旋轉 ±90°</dd>
      <dt>Q / E</dt><dd>微轉 15°</dd>
      <dt>方向鍵</dt><dd>微調 1 cm（Shift 10 cm）</dd>
      <dt>Delete</dt><dd>刪除家具</dd>
      <dt>Esc</dt><dd>取消選取／清除量尺</dd>
      <dt>滑鼠左鍵拖空白處</dt><dd>旋轉視角</dd>
      <dt>右鍵拖曳 / 滾輪</dt><dd>平移 / 縮放</dd>
    </dl>
  </section>
</template>
