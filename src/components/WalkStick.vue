<script setup lang="ts">
// 觸控搖桿：手機、平板沒有鍵盤，用左下角的搖桿走動
import { onBeforeUnmount, ref } from 'vue'
import { viewerRef } from '../viewerRef'

const R = 44
const knob = ref({ x: 0, y: 0 })
const active = ref(false)
let id = -1
let cx = 0
let cy = 0

function set(x: number, y: number) {
  const d = Math.hypot(x, y)
  const k = d > R ? R / d : 1
  knob.value = { x: x * k, y: y * k }
  // 中間留一點死區，手指放上去不會馬上滑走
  const dead = (v: number) => (Math.abs(v) < 0.15 ? 0 : v)
  viewerRef.current?.setStick(dead((-y * k) / R), dead((x * k) / R))
}
function down(e: PointerEvent) {
  const el = e.currentTarget as HTMLElement
  const b = el.getBoundingClientRect()
  cx = b.left + b.width / 2
  cy = b.top + b.height / 2
  id = e.pointerId
  active.value = true
  el.setPointerCapture(id)
  set(e.clientX - cx, e.clientY - cy)
}
function move(e: PointerEvent) {
  if (e.pointerId === id) set(e.clientX - cx, e.clientY - cy)
}
function up(e: PointerEvent) {
  if (e.pointerId !== id) return
  id = -1
  active.value = false
  set(0, 0)
}
onBeforeUnmount(() => viewerRef.current?.setStick(0, 0))
</script>

<template>
  <div
    class="stick"
    :class="{ on: active }"
    role="application"
    aria-label="走動搖桿"
    @pointerdown.prevent="down"
    @pointermove="move"
    @pointerup="up"
    @pointercancel="up"
  >
    <i :style="{ transform: `translate(${knob.x}px, ${knob.y}px)` }"></i>
  </div>
</template>
