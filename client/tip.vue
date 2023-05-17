<template style="z-index:101">
  <k-status>
    <span v-if="show" @click="dialogVisible = !dialogVisible">你的 Koishi 该更新了</span>
  </k-status>
  <el-dialog v-model="dialogVisible" class="dialog" append-to-body="true">
    <template #header="{ close, titleId, titleClass }">
      <span :id="titleId" :class="titleClass">⭐我们发现了一份更新</span>
      <h2 style="margin: 0;">Koishi v{{ upgradeData.latest }}</h2>
    </template>
    <div class="markdown">
      <div v-if="renderStatus" v-html="changelog"></div>
      <k-markdown v-else="renderStatus" :source="changelog"></k-markdown>
    </div>
    <template #footer>
      <span class="dialog-footer">
        <el-button @click="dialogVisible = false">再想想</el-button>
        <el-button type="primary" @click="send('upgrader', upgradeData.latest)">👍即刻升级</el-button>
      </span>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { send, store } from '@koishijs/client'
import { compare, renderGFM } from './utils'

const upgradeData = store.upgrade
const show = compare(upgradeData.version, upgradeData.latest) > 0
const dialogVisible = ref(false)
const renderStatus = ref(false)
const changelog = ref(upgradeData.changelog)

const upgrader = () => {
  send('upgrader', upgradeData.latest)
}

renderGFM(upgradeData.changelog)
  .then(res => {
    renderStatus.value = true
    changelog.value = res
  })
</script>

<style scoped>
.markdown {
  padding: 0;
  margin-top: -20px;
  max-height: 40vh;
  overflow: auto;
  
}
</style>
