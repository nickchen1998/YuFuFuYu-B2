<script setup lang="ts">
// 第一次進站的說明卡：三句話講完能做什麼，看過就不再出現
import { ref } from 'vue'
import { Footprints, PanelRight, Sofa } from '@lucide/vue'

const KEY = 'my-house-welcome-seen'
function seen() {
  try {
    return localStorage.getItem(KEY) === '1'
  } catch {
    return true
  }
}
const show = ref(!seen())
function close() {
  show.value = false
  try {
    localStorage.setItem(KEY, '1')
  } catch {
    /* 無痕模式存不了就算了 */
  }
}
</script>

<template>
  <section v-if="show" class="welcome" role="dialog" aria-labelledby="welcome-title">
    <h2 id="welcome-title">有富富玉 3D 格局規劃</h2>
    <p>整戶的 3D 格局加上裝潢預算，先知道這三件事就夠了。</p>
    <ul>
      <li>
        <span><Footprints /></span>
        <div><b>走進屋裡看</b><small>上方切到「室內漫遊」，點地板就會走過去，小地圖可以直接換房間。</small></div>
      </li>
      <li>
        <span><Sofa /></span>
        <div><b>點家具看細節</b><small>尺寸、櫃內格局、建議商品和價格都在清單裡，改勾選會重算總花費。</small></div>
      </li>
      <li>
        <span><PanelRight /></span>
        <div><b>想看大一點</b><small>右上角可以收起清單面板，整個畫面都給 3D。</small></div>
      </li>
    </ul>
    <button class="welcome-go" @click="close">開始看看</button>
  </section>
</template>
